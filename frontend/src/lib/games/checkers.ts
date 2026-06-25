export type Cell = null | "b" | "B" | "w" | "W";
export type Board = Cell[];

const isOnBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const isDark = (r: number, c: number) => (r + c) % 2 === 1;
export const idx = (r: number, c: number) => r * 8 + c;
export const rc = (i: number) => ({ r: Math.floor(i / 8), c: i % 8 });

export function isOwn(piece: Cell, side: "black" | "white") {
  if (!piece) return false;
  return side === "black" ? piece === "b" || piece === "B" : piece === "w" || piece === "W";
}

function isOpp(piece: Cell, side: "black" | "white") {
  if (!piece) return false;
  return side === "black" ? piece === "w" || piece === "W" : piece === "b" || piece === "B";
}

/** Returns landing indices for moves from `from`. UI hint only — server validates. */
export function legalMovesFrom(board: Board, from: number, side: "black" | "white"): number[] {
  const piece = board[from];
  if (!piece || !isOwn(piece, side)) return [];
  const isKing = piece === "B" || piece === "W";
  const dirs: Array<[number, number]> = [];
  // Men: black moves down (r+1), white moves up (r-1). Kings: both.
  if (isKing || piece === "b") dirs.push([1, -1], [1, 1]);
  if (isKing || piece === "w") dirs.push([-1, -1], [-1, 1]);

  const { r, c } = rc(from);
  const moves: number[] = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (isOnBoard(nr, nc) && isDark(nr, nc) && board[idx(nr, nc)] === null) {
      moves.push(idx(nr, nc));
    }
    // jumps
    const jr = r + dr * 2, jc = c + dc * 2;
    const mr = r + dr, mc = c + dc;
    if (
      isOnBoard(jr, jc) &&
      isDark(jr, jc) &&
      board[idx(jr, jc)] === null &&
      isOpp(board[idx(mr, mc)], side)
    ) {
      moves.push(idx(jr, jc));
    }
  }
  return moves;
}

export const PIECE_GLYPH: Record<NonNullable<Cell>, string> = {
  b: "●",
  B: "♚",
  w: "○",
  W: "♔",
};