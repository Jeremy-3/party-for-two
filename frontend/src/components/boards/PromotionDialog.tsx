interface Props {
  side: "white" | "black";
  onPick: (piece: "q" | "r" | "b" | "n") => void;
}

const PIECES: Array<{ key: "q" | "r" | "b" | "n"; label: string; white: string; black: string }> = [
  { key: "q", label: "Queen", white: "♕", black: "♛" },
  { key: "r", label: "Rook", white: "♖", black: "♜" },
  { key: "b", label: "Bishop", white: "♗", black: "♝" },
  { key: "n", label: "Knight", white: "♘", black: "♞" },
];

export function PromotionDialog({ side, onPick }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="glass w-full max-w-xs rounded-2xl p-4">
        <div className="mb-3 text-center text-sm font-medium text-foreground">Promote pawn to…</div>
        <div className="grid grid-cols-4 gap-2">
          {PIECES.map((p) => (
            <button
              key={p.key}
              onClick={() => onPick(p.key)}
              className="grid aspect-square place-items-center rounded-xl bg-white/5 text-3xl hover:bg-[#7c3aed]/30"
              title={p.label}
            >
              {side === "white" ? p.white : p.black}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}