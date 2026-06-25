import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useRoomStore } from "../store/useRoomStore";
import { createRoom, type GameType } from "../lib/api";
import { GameCard } from "../components/GameCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlayTwo — just the two of us" },
      { name: "description", content: "A private space for two to play games together." },
      { property: "og:title", content: "PlayTwo — just the two of us" },
      { property: "og:description", content: "A private space for two to play games together." },
    ],
  }),
  component: Index,
});

function Index() {
  const name = usePlayerStore((s) => s.name);
  const setName = usePlayerStore((s) => s.setName);
  const setRoom = useRoomStore((s) => s.setRoom);
  const reset = useRoomStore((s) => s.reset);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<GameType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (game_type: GameType) => {
    if (!name.trim()) {
      setError("enter your name first");
      return;
    }
    setError(null);
    setLoading(game_type);
    try {
      reset();
      const { room_id } = await createRoom(game_type, name.trim());
      setRoom(room_id, game_type);
      navigate({ to: "/room/$roomId/waiting", params: { roomId: room_id } });
    } catch (e) {
      setError("couldn't reach the server. is it running on 127.0.0.1:8000?");
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-5 py-10">
      <div className="animate-fade-in-up flex flex-col items-center pt-6">
        <div className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-2xl shadow-xl shadow-[#7c3aed]/40">
          ♥
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">PlayTwo</h1>
        <p className="mt-1 text-sm italic text-muted-foreground">just the two of us</p>
      </div>

      <div className="animate-fade-in-up mt-10">
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
          your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What do they call you?"
          className="glass w-full rounded-2xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
        />
      </div>

      <div className="mt-8 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">pick a game</div>
        <GameCard
          title="Tic Tac Toe"
          tagline="three in a row, quick & cozy"
          emoji="⭕"
          disabled={loading !== null}
          onClick={() => start("tictactoe")}
        />
        <GameCard
          title="Checkers"
          tagline="jump, crown, conquer"
          emoji="🔴"
          disabled={loading !== null}
          onClick={() => start("checkers")}
        />
        <GameCard
          title="Chess"
          tagline="patient minds, sharp moves"
          emoji="♞"
          disabled={loading !== null}
          onClick={() => start("chess")}
        />
        <GameCard
          title="Rock Paper Scissors"
          tagline="classic duel, quick & fun"
          emoji="✊"
          disabled={loading !== null}
          onClick={() => start("rock_paper_scissors")}
        />
        <GameCard
          title="Truth or Dare"
          tagline="fun, cozy, intimate prompts"
          emoji="🔥"
          disabled={loading !== null}
          onClick={() => start("truth_or_dare")}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-auto pt-10 text-center text-xs text-muted-foreground/60">
        made for two
      </div>
    </div>
  );
}
