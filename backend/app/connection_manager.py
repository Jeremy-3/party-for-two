from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []

        # Clean up any stale/closed connections first
        active = []
        for ws in self.rooms[room_id]:
            try:
                await ws.send_json({"type": "ping"})
                active.append(ws)
            except Exception:
                pass  # connection is dead, drop it
        self.rooms[room_id] = active

        self.rooms[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id] = [ws for ws in self.rooms[room_id] if ws is not websocket]
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def send_message(self, room_id: str, message: dict):
        if room_id in self.rooms:
            for connection in self.rooms[room_id]:
                await connection.send_json(message)

    async def send_message_to_player(self, websocket: WebSocket, message: dict):
        await websocket.send_json(message)

    def room_is_full(self, room_id: str) -> bool:
        return len(self.rooms.get(room_id, [])) >= 2


manager = ConnectionManager()