import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.connection_manager import manager
from app.routes.rooms import rooms_store
from app.models.room import RoomStatus, Player
from app.games import engine

router = APIRouter()


@router.websocket("/ws/{room_id}")
async def game_socket(websocket: WebSocket, room_id: str):
    room = rooms_store.get(room_id)
    if not room:
        await websocket.close(code=4004, reason="Room not found")
        return

    await manager.connect(room_id, websocket)

    # Sync players list with actual live connections (drops stale players)
    active_count = len(manager.rooms.get(room_id, []))
    room.players = room.players[:active_count - 1]

    # Assign this connection a player identity
    player_id = str(uuid.uuid4())[:8]
    first_symbol, second_symbol = engine.symbols_for(room.game_type)
    symbol = first_symbol if len(room.players) == 0 else second_symbol
    player = Player(id=player_id, name=f"Player {symbol}", symbol=symbol)
    room.players.append(player)

    # Init score entry for this symbol if not already there
    if symbol not in room.scores:
        room.scores[symbol] = {"wins": 0, "draws": 0}

    # Tell this player who they are
    await manager.send_message_to_player(websocket, {
        "type": "room_joined",
        "payload": {"player_id": player_id, "symbol": symbol, "room_id": room_id},
    })

    # Once both players are connected, start the game
    if len(room.players) == 2:
        room.status = RoomStatus.IN_PROGRESS
        room.game_state = engine.fresh_state(room.game_type)
        await manager.send_message(room_id, {
            "type": "game_start",
            "payload": {**room.game_state, "scores": room.scores},
        })

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "move":
                move_data = {k: v for k, v in data.items() if k != "type"}
                result = engine.apply_move(room.game_type, room.game_state, move_data, symbol)

                if not result["valid"]:
                    await manager.send_message_to_player(websocket, {
                        "type": "error",
                        "payload": {"message": result["reason"]},
                    })
                    continue

                room.game_state = result["state"]
                winner = room.game_state.get("winner")

                if winner:
                    room.status = RoomStatus.FINISHED
                    # Update scores
                    if winner == "draw":
                        for s in room.scores:
                            room.scores[s]["draws"] += 1
                    elif winner in room.scores:
                        room.scores[winner]["wins"] += 1

                await manager.send_message(room_id, {
                    "type": "game_update",
                    "payload": {**room.game_state, "scores": room.scores},
                })

            elif data["type"] == "rematch":
                room.game_state = engine.fresh_state(room.game_type)
                room.status = RoomStatus.IN_PROGRESS
                await manager.send_message(room_id, {
                    "type": "game_start",
                    "payload": {**room.game_state, "scores": room.scores},
                })
            elif data["type"] == "chat":
                await manager.send_message(room_id, {
                    "type": "chat",
                    "payload": {
                        "sender": symbol,
                        "message": data["message"][:500],  # cap length
                        "timestamp": str(uuid.uuid4())[:8], # just a unique id
                    },
                })

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        room.players = [p for p in room.players if p.id != player_id]
        room.status = RoomStatus.WAITING
        await manager.send_message(room_id, {
            "type": "player_left",
            "payload": {"message": "Your partner disconnected"},
        })