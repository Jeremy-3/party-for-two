interface Props {
  outcome: "win" | "lose" | "draw";
  onRematch: () => void;
  onNewGame: () => void;
}

export function ResultBanner({ outcome, onRematch, onNewGame }: Props) {
  const text = outcome === "win" ? "You win! 🎉" : outcome === "lose" ? "Partner wins!" : "Draw 🤝";
  return (
    <div className="glass animate-fade-in-up rounded-2xl p-4 text-center">
      <div className="text-xl font-bold text-foreground">{text}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={onRematch}
          className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] py-2.5 text-sm font-semibold text-white"
        >
          Rematch
        </button>
        <button
          onClick={onNewGame}
          className="glass rounded-xl py-2.5 text-sm font-medium text-foreground"
        >
          New game
        </button>
      </div>
    </div>
  );
}
