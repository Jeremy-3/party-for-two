interface Props {
  youName: string;
  partnerName: string;
  youScore: number;
  partnerScore: number;
  draws: number;
  yourTurn: boolean;
  ended: boolean;
}

export function Scoreboard({ youName, partnerName, youScore, partnerScore, draws, yourTurn, ended }: Props) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className={`min-w-0 text-right ${yourTurn && !ended ? "text-foreground" : "text-muted-foreground"}`}>
          <div className="truncate text-xs uppercase tracking-wider">{youName || "You"}</div>
          <div className="text-2xl font-bold">{youScore}</div>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          <div className="text-[10px] uppercase tracking-wider">draws</div>
          <div className="text-sm font-semibold text-foreground/80">{draws}</div>
        </div>
        <div className={`min-w-0 text-left ${!yourTurn && !ended ? "text-foreground" : "text-muted-foreground"}`}>
          <div className="truncate text-xs uppercase tracking-wider">{partnerName || "Partner"}</div>
          <div className="text-2xl font-bold">{partnerScore}</div>
        </div>
      </div>
      {!ended && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {yourTurn ? <span className="text-[#a78bfa]">your turn</span> : "partner's turn"}
        </div>
      )}
    </div>
  );
}