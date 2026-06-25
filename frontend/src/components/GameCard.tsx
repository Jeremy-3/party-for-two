interface Props {
  title: string;
  tagline: string;
  emoji: string;
  onClick: () => void;
  disabled?: boolean;
}

export function GameCard({ title, tagline, emoji, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass group w-full rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:border-white/15 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-3xl shadow-lg shadow-[#7c3aed]/30">
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{tagline}</div>
        </div>
        <div className="text-muted-foreground transition-transform group-hover:translate-x-1">
          →
        </div>
      </div>
    </button>
  );
}
