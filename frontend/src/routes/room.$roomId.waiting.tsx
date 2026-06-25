import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useRoomStore } from "../store/useRoomStore";
import { useChatStore } from "../store/useChatStore";
import { socket } from "../lib/socket";
import { getRoom } from "../lib/api";
import { ShareButtons } from "../components/ShareButtons";

export const Route = createFileRoute("/room/$roomId/waiting")({
  head: () => ({
    meta: [{ title: "Waiting for your partner — PlayTwo" }],
  }),
  component: WaitingRoom,
});

function WaitingRoom() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const name = usePlayerStore((s) => s.name);
  const setIdentity = usePlayerStore((s) => s.setIdentity);
  const setRoom = useRoomStore((s) => s.setRoom);
  const applyState = useRoomStore((s) => s.applyState);
  const setStatus = useRoomStore((s) => s.setStatus);
  const gameType = useRoomStore((s) => s.gameType);
  const appendChat = useChatStore((s) => s.append);

  const [resolvedGame, setResolvedGame] = useState(gameType);
  const [needsName, setNeedsName] = useState(!name.trim());
  const [nameDraft, setNameDraft] = useState(name);
  const setName = usePlayerStore((s) => s.setName);

  // hydrate room info if user arrived via shared link
  useEffect(() => {
    if (!gameType) {
      getRoom(roomId)
        .then((r) => {
          setRoom(roomId, r.game_type);
          setResolvedGame(r.game_type);
        })
        .catch(() => {});
    }
  }, [roomId, gameType, setRoom]);

  useEffect(() => {
    if (needsName || !name.trim()) return;
    socket.connect(roomId, name);
    const unsub = socket.subscribe((msg) => {
      if (msg.type === "room_joined") {
        setIdentity(msg.payload.player_id, msg.payload.symbol);
      } else if (msg.type === "game_start") {
        applyState(msg.payload);
        setStatus("playing");
        navigate({ to: "/room/$roomId/play", params: { roomId } });
      } else if (msg.type === "chat") {
        appendChat(roomId, msg.payload);
      }
    });
    return () => {
      unsub();
    };
  }, [roomId, name, needsName, navigate, setIdentity, applyState, setStatus, appendChat]);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}/waiting` : "";

  const gameLabel =
    resolvedGame === "tictactoe" ? "Tic Tac Toe" :
    resolvedGame === "checkers" ? "Checkers" :
    resolvedGame === "chess" ? "Chess" :
    resolvedGame === "rock_paper_scissors" ? "Rock Paper Scissors" :
    resolvedGame === "truth_or_dare" ? "Truth or Dare" : "a game";

  if (needsName) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center px-5">
        <div className="glass w-full rounded-2xl p-6">
          <div className="text-center text-lg font-semibold">You've been invited!</div>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter your name to join the {gameLabel} room.
          </p>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Your name"
            className="mt-4 w-full rounded-xl bg-white/5 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
          />
          <button
            onClick={() => {
              const t = nameDraft.trim();
              if (!t) return;
              setName(t);
              setNeedsName(false);
            }}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] py-3 font-semibold text-white"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={() => socket.disconnect()}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← leave
        </Link>
        <div className="text-sm font-semibold text-foreground">PlayTwo</div>
        <div className="w-12" />
      </div>

      <div className="mt-12 flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-pulse-soft mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-5xl shadow-2xl shadow-[#7c3aed]/40">
          ♥
        </div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{gameLabel}</div>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Waiting for your partner…</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          send them this link so you can play together
        </p>

        <div className="mt-8 w-full">
          <ShareButtons shareUrl={shareUrl} />
          <div className="glass mt-3 truncate rounded-xl px-3 py-2 text-center text-xs text-muted-foreground">
            {shareUrl}
          </div>
        </div>
      </div>
    </div>
  );
}