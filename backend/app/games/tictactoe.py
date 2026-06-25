def fresh_board() -> list:
    return [None] * 9   # 9 cells, None = empty, "X" or "O" = played

def make_move(board: list, cell: int, symbol: str) -> dict:
    if cell < 0 or cell > 8:
        return {"valid": False, "reason": "Cell out of range", "board": board}
    if board[cell] is not None:
        return {"valid": False, "reason": "Cell already taken", "board": board}

    new_board = board.copy()
    new_board[cell] = symbol
    return {"valid": True, "board": new_board}

def check_winner(board: list) -> str | None:
    wins = [
        [0,1,2], [3,4,5], [6,7,8],   # rows
        [0,3,6], [1,4,7], [2,5,8],   # cols
        [0,4,8], [2,4,6]             # diagonals
    ]
    for a, b, c in wins:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]   # returns "X" or "O"

    if all(cell is not None for cell in board):
        return "draw"

    return None   # game still going