from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
import uuid

class RoomStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    
class GameType(str, Enum):
    TICTACTOE = "tictactoe"
    CHECKERS = "checkers"
    CHESS = "chess"
    ROCK_PAPER_SCISSORS = "rock_paper_scissors"
    TRUTH_OR_DARE = "truth_or_dare"
    
@dataclass
class Player:
    id: str
    name: str
    symbol: Optional[str] = None 
    
@dataclass
class Room:
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    game_type: GameType = GameType.TICTACTOE
    status: RoomStatus = RoomStatus.WAITING
    players: list[Player] = field(default_factory=list) # max 2 players for a 2-player game
    game_state: dict = field(default_factory=dict)   # e.g. for tic-tac-toe: {"board": [["", "", ""], ["", "", ""], ["", "", ""]], "current_turn": "player1_id"}
    scores: dict = field(default_factory=dict) # player_id -> score mapping {"player1_id": 0, "player2_id": 0}
    
    