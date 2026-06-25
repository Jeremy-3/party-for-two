"""Chess game logic — a thin wrapper around the `python-chess` library.

We do NOT reimplement chess rules. `python-chess` handles move legality,
check, checkmate, stalemate, castling, en passant, promotion, etc.

State representation
---------------------
The game state is just a FEN string (Forsyth-Edwards Notation) — a compact
text representation of the full board position. The frontend can render
this however it likes (e.g. with chessboard.js or a custom React board).

Moves
-----
Moves are sent/received in UCI format, e.g. "e2e4" or "e7e8q" (promotion to
queen). This is simple to generate from a drag-and-drop UI: just concatenate
the "from" square and "to" square (plus an optional promotion letter).
"""

import chess


def fresh_board() -> str:
    """Returns the starting position as a FEN string."""
    return chess.Board().fen()


def make_move(fen: str, move_uci: str, player_color: str) -> dict:
    """Attempt to play a move. `player_color` is "white" or "black"."""
    board = chess.Board(fen)

    turn = "white" if board.turn == chess.WHITE else "black"
    if turn != player_color:
        return {"valid": False, "reason": "Not your turn", "fen": fen}

    try:
        move = chess.Move.from_uci(move_uci)
    except ValueError:
        return {"valid": False, "reason": "Invalid move format", "fen": fen}

    if move not in board.legal_moves:
        return {"valid": False, "reason": "Illegal move", "fen": fen}

    board.push(move)
    return {"valid": True, "fen": board.fen()}


def check_winner(fen: str) -> str | None:
    """Returns "white", "black", "draw", or None if the game continues."""
    board = chess.Board(fen)

    if board.is_checkmate():
        return "black" if board.turn == chess.WHITE else "white"

    if (
        board.is_stalemate()
        or board.is_insufficient_material()
        or board.is_seventyfive_moves()
        or board.is_fivefold_repetition()
    ):
        return "draw"

    return None


def legal_moves(fen: str) -> list[str]:
    """All legal moves in UCI format — useful for highlighting valid squares
    in the UI after a piece is selected."""
    board = chess.Board(fen)
    return [m.uci() for m in board.legal_moves]


def is_check(fen: str) -> bool:
    return chess.Board(fen).is_check()