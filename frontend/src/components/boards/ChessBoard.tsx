import { useEffect, useState } from "react";
import {
  parseFEN,
  fenTurn,
  rcToSquare,
  pieceColor,
  CHESS_GLYPH,
  isPromotion,
  type ChessSide,
} from "../../lib/games/chess";
import { getLegalMoves } from "../../lib/api";
import { PromotionDialog } from "./PromotionDialog";

interface Props {
  fen: string;
  mySide: ChessSide | null;
  roomId: string;
  ended: boolean;
  onMove: (uci: string) => void;
}

export function ChessBoard({ fen, mySide, roomId, ended, onMove }: Props) {
  const board = parseFEN(fen);
  const turn = fenTurn(fen);
  const myTurn = !ended && mySide === turn;
  const flip = mySide === "black";

  const [selected, setSelected] = useState<string | null>(null);
  const [legal, setLegal] = useState<string[]>([]);
  const [pending, setPending] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    setSelected(null);
    setLegal([]);
    setPending(null);
  }, [fen]);

  const handleClick = async (r: number, c: number) => {
    if (!myTurn || !mySide) return;
    const sq = rcToSquare(r, c);
    const piece = board[r][c];

    if (selected) {
      // attempt destination
      const dests = legal
        .filter((m) => m.startsWith(selected))
        .map((m) => m.slice(2, 4));
      if (dests.includes(sq)) {
        if (isPromotion(board, selected, sq)) {
          setPending({ from: selected, to: sq });
          return;
        }
        onMove(selected + sq);
        setSelected(null);
        setLegal([]);
        return;
      }
    }
    if (piece && pieceColor(piece) === mySide) {
      setSelected(sq);
      try {
        const { legal_moves } = await getLegalMoves(roomId, sq);
        setLegal(legal_moves);
      } catch {
        setLegal([]);
      }
    } else {
      setSelected(null);
      setLegal([]);
    }
  };

  const destSquares = selected
    ? new Set(legal.filter((m) => m.startsWith(selected)).map((m) => m.slice(2, 4)))
    : new Set<string>();

  const rows = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      <div className="glass mx-auto grid aspect-square w-full max-w-[400px] grid-cols-8 overflow-hidden rounded-2xl p-1">
        {rows.map((r) =>
          cols.map((c) => {
            const sq = rcToSquare(r, c);
            const piece = board[r][c];
            const isSel = selected === sq;
            const isDest = destSquares.has(sq);
            const dark = (r + c) % 2 === 1;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                disabled={!myTurn}
                className={`relative grid aspect-square place-items-center text-3xl ${
                  dark ? "bg-[#1a2238]" : "bg-[#2a3454]/40"
                } ${isSel ? "ring-2 ring-inset ring-[#a78bfa]" : ""} ${
                  isDest ? "after:absolute after:inset-3 after:rounded-full after:bg-emerald-400/40" : ""
                }`}
              >
                {piece && (
                  <span
                    className={`relative z-10 leading-none drop-shadow ${
                      pieceColor(piece) === "white" ? "text-zinc-100" : "text-zinc-900"
                    }`}
                    style={{ textShadow: pieceColor(piece) === "white" ? "0 0 4px rgba(0,0,0,0.6)" : "0 0 4px rgba(255,255,255,0.3)" }}
                  >
                    {CHESS_GLYPH[piece]}
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>
      {pending && mySide && (
        <PromotionDialog
          side={mySide}
          onPick={(p) => {
            onMove(pending.from + pending.to + p);
            setPending(null);
            setSelected(null);
            setLegal([]);
          }}
        />
      )}
    </>
  );
}