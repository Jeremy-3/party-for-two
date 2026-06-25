"""Pure game logic for Checkers (English draughts, 8x8 board).

Board representation
---------------------
- A flat list of 64 cells, index 0-63, row-major (index = row * 8 + col),
  row 0 = top of the board.
- Only dark squares (row + col is odd) are ever occupied.
- Cell values:
    None  -> empty
    "b"   -> black man
    "B"   -> black king
    "w"   -> white man
    "W"   -> white king

Players
-------
- "black" moves first and moves DOWN the board (row increases).
- "white" moves UP the board (row decreases).

Rules implemented
------------------
- Simple diagonal moves (one square, forward only for men, any direction for kings)
- Captures (jump over an adjacent opposing piece into an empty square beyond)
- Forced capture: if a player has any capture available, they MUST capture
- King promotion when a man reaches the far row
- Win detection: a player loses if they have no pieces or no legal moves

NOT implemented (good next steps to study/extend):
- Multi-jump chains in a single turn (capturing more than once per move)
- "Flying kings" variants (used in international draughts, not English draughts)
"""

from typing import Optional


def fresh_board() -> list:
    board = [None] * 64
    for row in range(8):
        for col in range(8):
            if (row + col) % 2 == 1:
                if row < 3:
                    board[row * 8 + col] = "b"
                elif row > 4:
                    board[row * 8 + col] = "w"
    return board


def _row_col(index: int) -> tuple[int, int]:
    return divmod(index, 8)


def _in_bounds(row: int, col: int) -> bool:
    return 0 <= row < 8 and 0 <= col < 8


def _is_king(piece: Optional[str]) -> bool:
    return piece is not None and piece.isupper()


def _owner(piece: Optional[str]) -> Optional[str]:
    if piece is None:
        return None
    return "black" if piece.lower() == "b" else "white"


def _forward_dirs(piece: str, player: str) -> list[tuple[int, int]]:
    """Diagonal directions allowed for a SIMPLE (non-capture) move."""
    if _is_king(piece):
        return [(-1, -1), (-1, 1), (1, -1), (1, 1)]
    return [(1, -1), (1, 1)] if player == "black" else [(-1, -1), (-1, 1)]


ALL_DIAGONALS = [(-1, -1), (-1, 1), (1, -1), (1, 1)]


def _piece_captures(board: list, index: int) -> list[dict]:
    """All capture moves for the piece at `index`. Men may capture in any
    diagonal direction (standard rule), kings always can."""
    piece = board[index]
    if piece is None:
        return []
    player = _owner(piece)
    row, col = _row_col(index)
    captures = []
    for dr, dc in ALL_DIAGONALS:
        mid_r, mid_c = row + dr, col + dc
        land_r, land_c = row + 2 * dr, col + 2 * dc
        if not _in_bounds(land_r, land_c):
            continue
        mid_index = mid_r * 8 + mid_c
        land_index = land_r * 8 + land_c
        mid_piece = board[mid_index]
        if mid_piece is None or _owner(mid_piece) == player:
            continue
        if board[land_index] is not None:
            continue
        captures.append({"to": land_index, "captured": mid_index})
    return captures


def _piece_simple_moves(board: list, index: int) -> list[int]:
    piece = board[index]
    if piece is None:
        return []
    player = _owner(piece)
    row, col = _row_col(index)
    moves = []
    for dr, dc in _forward_dirs(piece, player):
        r, c = row + dr, col + dc
        if _in_bounds(r, c) and board[r * 8 + c] is None:
            moves.append(r * 8 + c)
    return moves


def _player_has_capture(board: list, player: str) -> bool:
    for i, piece in enumerate(board):
        if _owner(piece) == player and _piece_captures(board, i):
            return True
    return False


def make_move(board: list, from_index: int, to_index: int, player: str) -> dict:
    """Attempt to move a piece. Returns {"valid": bool, "board": ..., "reason": ...}."""
    if not (0 <= from_index < 64) or not (0 <= to_index < 64):
        return {"valid": False, "reason": "Move out of range", "board": board}

    piece = board[from_index]
    if piece is None:
        return {"valid": False, "reason": "No piece on that square", "board": board}
    if _owner(piece) != player:
        return {"valid": False, "reason": "That's not your piece", "board": board}
    if board[to_index] is not None:
        return {"valid": False, "reason": "Destination is occupied", "board": board}

    must_capture = _player_has_capture(board, player)

    captures = _piece_captures(board, from_index)
    capture_match = next((c for c in captures if c["to"] == to_index), None)

    if capture_match:
        new_board = board.copy()
        new_board[to_index] = piece
        new_board[from_index] = None
        new_board[capture_match["captured"]] = None
        _maybe_promote(new_board, to_index, player)
        return {"valid": True, "board": new_board}

    if must_capture:
        return {"valid": False, "reason": "A capture is available and must be taken", "board": board}

    if to_index in _piece_simple_moves(board, from_index):
        new_board = board.copy()
        new_board[to_index] = piece
        new_board[from_index] = None
        _maybe_promote(new_board, to_index, player)
        return {"valid": True, "board": new_board}

    return {"valid": False, "reason": "Illegal move", "board": board}


def _maybe_promote(board: list, index: int, player: str) -> None:
    row, _ = _row_col(index)
    piece = board[index]
    if _is_king(piece):
        return
    if (player == "black" and row == 7) or (player == "white" and row == 0):
        board[index] = piece.upper()


def check_winner(board: list, player_to_move: str) -> Optional[str]:
    """Returns "black"/"white" if that player has won, else None.
    `player_to_move` is whoever's turn is next — if THEY have no pieces
    or no legal moves, the OTHER player wins."""
    opponent = "white" if player_to_move == "black" else "black"

    pieces = [p for p in board if _owner(p) == player_to_move]
    if not pieces:
        return opponent

    for i, piece in enumerate(board):
        if _owner(piece) == player_to_move:
            if _piece_captures(board, i) or _piece_simple_moves(board, i):
                return None

    return opponent