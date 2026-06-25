"""Unified interface over all three games so the WebSocket route doesn't
need game-specific branching.

Each game module exposes its own pure functions (fresh_board, make_move,
check_winner) with different signatures because the games are genuinely
different shapes. This module adapts them to one common interface:

    fresh_state(game_type) -> dict
    apply_move(game_type, state, move_data, player_symbol) -> dict
        returns {"valid": bool, "state": dict, "reason": str (if invalid)}

`state` always contains at least: "turn" (whose turn it is) and "winner".
"""

from app.models.room import GameType
from app.games import tictactoe, checkers, chess as chess_game, rock_paper_scissors, truth_or_dare


# Which symbol moves first, and what the two symbols are, per game.
FIRST_TURN = {
    GameType.TICTACTOE: "X",
    GameType.CHECKERS: "black",
    GameType.CHESS: "white",
    GameType.ROCK_PAPER_SCISSORS: "both",
    GameType.TRUTH_OR_DARE: "player1",
}

PLAYER_SYMBOLS = {
    GameType.TICTACTOE: ("X", "O"),
    GameType.CHECKERS: ("black", "white"),
    GameType.CHESS: ("white", "black"),
    GameType.ROCK_PAPER_SCISSORS: ("player1", "player2"),
    GameType.TRUTH_OR_DARE: ("player1", "player2"),
}


def symbols_for(game_type: GameType) -> tuple[str, str]:
    """Symbols assigned to (first player to connect, second player)."""
    return PLAYER_SYMBOLS[game_type]


def fresh_state(game_type: GameType) -> dict:
    if game_type == GameType.TICTACTOE:
        return {"board": tictactoe.fresh_board(), "turn": "X", "winner": None}

    if game_type == GameType.CHECKERS:
        return {"board": checkers.fresh_board(), "turn": "black", "winner": None}

    if game_type == GameType.CHESS:
        return {"fen": chess_game.fresh_board(), "turn": "white", "winner": None}

    if game_type == GameType.ROCK_PAPER_SCISSORS:
        return rock_paper_scissors.fresh_board()

    if game_type == GameType.TRUTH_OR_DARE:
        return truth_or_dare.fresh_board()

    raise ValueError(f"Unknown game type: {game_type}")


def _other(symbol: str, game_type: GameType) -> str:
    a, b = PLAYER_SYMBOLS[game_type]
    return b if symbol == a else a


def apply_move(game_type: GameType, state: dict, move_data: dict, player_symbol: str) -> dict:
    if game_type != GameType.ROCK_PAPER_SCISSORS and state.get("turn") != player_symbol:
        return {"valid": False, "reason": "Not your turn", "state": state}

    if game_type == GameType.TICTACTOE:
        result = tictactoe.make_move(state["board"], move_data["cell"], player_symbol)
        if not result["valid"]:
            return {"valid": False, "reason": result["reason"], "state": state}
        state["board"] = result["board"]
        state["winner"] = tictactoe.check_winner(state["board"])
        state["turn"] = _other(player_symbol, game_type)
        return {"valid": True, "state": state}

    if game_type == GameType.CHECKERS:
        result = checkers.make_move(state["board"], move_data["from"], move_data["to"], player_symbol)
        if not result["valid"]:
            return {"valid": False, "reason": result["reason"], "state": state}
        state["board"] = result["board"]
        next_turn = _other(player_symbol, game_type)
        state["winner"] = checkers.check_winner(state["board"], next_turn)
        state["turn"] = next_turn
        return {"valid": True, "state": state}

    if game_type == GameType.CHESS:
        result = chess_game.make_move(state["fen"], move_data["move"], player_symbol)
        if not result["valid"]:
            return {"valid": False, "reason": result["reason"], "state": state}
        state["fen"] = result["fen"]
        state["winner"] = chess_game.check_winner(state["fen"])
        state["turn"] = _other(player_symbol, game_type)
        return {"valid": True, "state": state}

    if game_type == GameType.ROCK_PAPER_SCISSORS:
        result = rock_paper_scissors.make_move(state, player_symbol, move_data.get("choice"))
        return result

    if game_type == GameType.TRUTH_OR_DARE:
        result = truth_or_dare.make_move(state, player_symbol, move_data)
        return result

    raise ValueError(f"Unknown game type: {game_type}")