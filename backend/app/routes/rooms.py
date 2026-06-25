from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from app.models.room import Room,GameType

router = APIRouter()

rooms_store: dict[str, Room] = {}

class CreateRoomRequest(BaseModel):
    game_type:GameType
    player_name:str
    
@router.post("/")
def create_room(body: CreateRoomRequest):
    room = Room(game_type=body.game_type)
    rooms_store[room.id] = room
    
    return {
        "room_id":room.id,
        "game_type":room.game_type,
        "join_url": f"/game/{room.id}" 
    }
    

@router.get("/{room_id}")
def get_room(room_id:str):
    room = rooms_store.get(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {"room_id":room.id, "status":room.status, "game_type":room.game_type}
    
@router.get("/{room_id}/legal-moves")
def get_legal_moves(room_id: str, from_square: str | None = None):
    room = rooms_store.get(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.game_type != GameType.CHESS:
        raise HTTPException(status_code=400, detail="Not a chess game")
    if not room.game_state:
        raise HTTPException(status_code=400, detail="Game not started")

    from app.games import chess as chess_game
    all_moves = chess_game.legal_moves(room.game_state["fen"])

    if from_square:
        all_moves = [m for m in all_moves if m.startswith(from_square)]

    return {"legal_moves": all_moves}