import { useState } from "react";
import { type Board, legalMovesFrom, isOwn } from "../../lib/games/checkers";

interface Props {
  board: Board;
  mySide: "black" | "white" | null;
  turn: string | null;
  ended: boolean;
  onMove: (from: number, to: number) => void;
}

export function CheckersBoard({ board, mySide, turn, ended, onMove }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const myTurn = !ended && mySide === turn;
  const flip = mySide === "white";
  const indices = Array.from({ length: 64 }, (_, i) => i);
  const display = flip ? [...indices].reverse() : indices;
  const legal = selected !== null && mySide ? legalMovesFrom(board, selected, mySide) : [];

  const click = (i: number) => {
    if (!myTurn || !mySide) return;
    const piece = board[i];
    if (selected !== null && legal.includes(i)) {
      onMove(selected, i);
      setSelected(null);
      return;
    }
    if (isOwn(piece, mySide)) setSelected(i);
    else setSelected(null);
  };

  return (
    <div className="glass mx-auto grid aspect-square w-full max-w-[400px] grid-cols-8 overflow-hidden rounded-2xl p-1">
      {display.map((i) => {
        const r = Math.floor(i / 8);
        const c = i % 8;
        const dark = (r + c) % 2 === 1;
        const piece = board[i];
        const isSel = selected === i;
        const isTarget = legal.includes(i);
        return (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={!myTurn}
            className={`relative grid aspect-square place-items-center text-2xl ${
              dark ? "bg-[#1a2238]" : "bg-[#2a3454]/40"
            } ${isSel ? "ring-2 ring-inset ring-[#a78bfa]" : ""} ${
              isTarget ? "after:absolute after:inset-2 after:rounded-full after:bg-emerald-400/40" : ""
            }`}
          >
            {piece && (
              <span
                className={`relative z-10 grid h-[78%] w-[78%] place-items-center rounded-full text-xl shadow ${
                  piece === "b" || piece === "B"
                    ? "bg-gradient-to-br from-zinc-900 to-zinc-700 text-amber-300"
                    : "bg-gradient-to-br from-zinc-50 to-zinc-300 text-amber-600"
                }`}
              >
                {(piece === "B" || piece === "W") && "♔"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}