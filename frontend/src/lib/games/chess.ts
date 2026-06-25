export type ChessSide = "white" | "black";

/** parse FEN to an 8x8 grid (row 0 = rank 8, col 0 = file a). null for empty. */
export function parseFEN(fen: string): (string | null)[][] {
  const board: (string | null)[][] = [];
  const placement = fen.split(" ")[0];
  const ranks = placement.split("/");
  for (const rank of ranks) {
    const row: (string | null)[] = [];
    for (const ch of rank) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch, 10); i++) row.push(null);
      } else {
        row.push(ch);
      }
    }
    board.push(row);
  }
  return board;
}

export function fenTurn(fen: string): ChessSide {
  const parts = fen.split(" ");
  return parts[1] === "b" ? "black" : "white";
}

/** "a1".."h8" — file letter then rank number */
export function rcToSquare(r: number, c: number): string {
  const file = String.fromCharCode("a".charCodeAt(0) + c);
  const rank = 8 - r;
  return `${file}${rank}`;
}
export function squareToRc(sq: string): { r: number; c: number } {
  const c = sq.charCodeAt(0) - "a".charCodeAt(0);
  const r = 8 - parseInt(sq[1], 10);
  return { r, c };
}

export function pieceColor(p: string): ChessSide {
  return p === p.toUpperCase() ? "white" : "black";
}

export const CHESS_GLYPH: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

/** Returns true if this UCI move is a pawn promotion (no suffix yet). */
export function isPromotion(board: (string | null)[][], from: string, to: string): boolean {
  const { r: fr, c: fc } = squareToRc(from);
  const piece = board[fr]?.[fc];
  if (!piece || piece.toLowerCase() !== "p") return false;
  const { r: tr } = squareToRc(to);
  return tr === 0 || tr === 7;
}