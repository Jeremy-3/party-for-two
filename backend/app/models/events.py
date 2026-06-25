from pydantic import BaseModel
from typing import Any, Optional

# ── Messages sent FROM the client TO the server ──

class JoinEvent(BaseModel):
    type: str = "join"
    player_name: str
    

class MoveEvent(BaseModel):
    type: str = "move"
    player_id: str
    move_data: dict   # game-specific: {"cell": 4} for TTT, {"from": "e2", "to": "e4"} for chess

class RematchEvent(BaseModel):
    type: str = "rematch"
    player_id: str

# ── Messages sent FROM the server TO the client ──

class ServerEvent(BaseModel):
    type: str
    payload: Any
    

# Examples of server events you'll send:
# {"type": "room_joined",  "payload": {"room_id": "abc123", "player_id": "...", "symbol": "X"}}
# {"type": "player_ready", "payload": {"message": "Partner joined! Game starting..."}}
# {"type": "game_update",  "payload": {"board": [...], "turn": "X", "winner": null}}
# {"type": "game_over",    "payload": {"winner": "X", "scores": {...}}}
# {"type": "error",        "payload": {"message": "Not your turn"}}