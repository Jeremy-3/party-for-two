import { winningLine } from "../../lib/games/tictactoe";

interface Props {
  board: (string | null)[];
  mySymbol: string | null;
  turn: string | null;
  ended: boolean;
  onMove: (cell: number) => void;
}

export function TicTacToeBoard({ board, mySymbol, turn, ended, onMove }: Props) {
  const myTurn = !ended && mySymbol === turn;
  const win = winningLine(board);
  return (
    <div className="glass mx-auto grid aspect-square w-full max-w-[360px] grid-cols-3 gap-2 rounded-2xl p-2">
      {board.map((cell, i) => {
        const inWin = win?.includes(i);
        const clickable = myTurn && !cell;
        return (
          <button
            key={i}
            onClick={() => clickable && onMove(i)}
            disabled={!clickable}
            className={`grid aspect-square place-items-center rounded-xl text-5xl font-bold transition ${
              inWin
                ? "bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10"
            } ${cell === "X" ? "text-[#a78bfa]" : "text-foreground"} disabled:cursor-default`}
          >
            {cell ?? ""}
          </button>
        );
      })}
    </div>
  );
}