import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useRoomStore } from "../store/useRoomStore";
import { useChatStore } from "../store/useChatStore";
import { socket } from "../lib/socket";
import { Scoreboard } from "../components/Scoreboard";
import { ChatPanel } from "../components/ChatPanel";
import { ResultBanner } from "../components/ResultBanner";
import { TicTacToeBoard } from "../components/boards/TicTacToeBoard";
import { CheckersBoard } from "../components/boards/CheckersBoard";
import { ChessBoard } from "../components/boards/ChessBoard";
import { RockPaperScissorsBoard } from "../components/boards/RockPaperScissorsBoard";
import { TruthOrDareBoard } from "../components/boards/TruthOrDareBoard";
import type { Board as CheckersBoardType } from "../lib/games/checkers";
import type { ChessSide } from "../lib/games/chess";

export const Route = createFileRoute("/room/$roomId/play")({
  head: () => ({ meta: [{ title: "Playing — PlayTwo" }] }),
  component: PlayScreen,
});

function PlayScreen() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const name = usePlayerStore((s) => s.name);
  const playerId = usePlayerStore((s) => s.playerId);
  const symbol = usePlayerStore((s) => s.symbol);
  const setIdentity = usePlayerStore((s) => s.setIdentity);

  const gameType = useRoomStore((s) => s.gameType);
  const board = useRoomStore((s) => s.board);
  const fen = useRoomStore((s) => s.fen);
  const turn = useRoomStore((s) => s.turn);
  const winner = useRoomStore((s) => s.winner);
  const scores = useRoomStore((s) => s.scores);
  const choices = useRoomStore((s) => s.choices);
  const choices_revealed = useRoomStore((s) => s.choices_revealed);
  const round_result = useRoomStore((s) => s.round_result);
  const current_card = useRoomStore((s) => s.current_card);
  const selected_type = useRoomStore((s) => s.selected_type);
  const applyState = useRoomStore((s) => s.applyState);

  const chat = useChatStore((s) => s.byRoom[roomId] ?? []);
  const initRoom = useChatStore((s) => s.initRoom);
  const appendChat = useChatStore((s) => s.append);
  const clearChat = useChatStore((s) => s.clear);

  const [partnerLeft, setPartnerLeft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name.trim()) {
      navigate({ to: "/" });
      return;
    }
    // Init chat array for this room so selector never returns a new [] reference
    initRoom(roomId);
    socket.connect(roomId, name);
    const unsub = socket.subscribe((msg) => {
      if (msg.type === "room_joined") {
        setIdentity(msg.payload.player_id, msg.payload.symbol);
      } else if (msg.type === "game_start" || msg.type === "game_update") {
        applyState(msg.payload);
        setPartnerLeft(null);
      } else if (msg.type === "chat") {
        appendChat(roomId, msg.payload);
      } else if (msg.type === "player_left") {
        setPartnerLeft(msg.payload.message);
      } else if (msg.type === "error") {
        setError(msg.payload.message);
        setTimeout(() => setError(null), 2500);
      }
    });
    return () => {
      unsub();
    };
  }, [roomId, name, navigate, setIdentity, applyState, appendChat, initRoom]);

  const ended = winner !== null && winner !== undefined;

  const { youScore, partnerScore, draws } = useMemo(() => {
    const youKey = symbol ?? "";
    const partnerKey =
      gameType === "tictactoe"
        ? youKey === "X" ? "O" : "X"
        : gameType === "checkers"
        ? youKey === "black" ? "white" : "black"
        : gameType === "chess"
        ? youKey === "white" ? "black" : "white"
        : youKey === "player1" ? "player2" : "player1";

    const youEntry = scores[youKey] ?? { wins: 0, draws: 0 };
    const partnerEntry = scores[partnerKey] ?? { wins: 0, draws: 0 };

    return {
      youScore: typeof youEntry === "object" ? (youEntry.wins ?? 0) : (youEntry ?? 0),
      partnerScore: typeof partnerEntry === "object" ? (partnerEntry.wins ?? 0) : (partnerEntry ?? 0),
      draws: typeof youEntry === "object" ? (youEntry.draws ?? 0) : 0,
    };
  }, [scores, symbol, gameType]);

  const outcome: "win" | "lose" | "draw" =
    !ended ? "draw" :
    winner === "draw" || winner === null ? "draw" :
    winner === symbol ? "win" : "lose";

  const sendChat = (message: string) => socket.send({ type: "chat", message });
  const sendRematch = () => socket.send({ type: "rematch" });
  const leave = () => {
    socket.disconnect();
    clearChat(roomId);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-4 py-4">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <Link
          to="/"
          onClick={leave}
          className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          ← leave
        </Link>
        <div className="text-center text-sm font-semibold text-foreground">PlayTwo</div>
        <div className="w-12" />
      </div>

      <div className="mt-3">
        <Scoreboard
          youName={name || "You"}
          partnerName="Partner"
          youScore={youScore}
          partnerScore={partnerScore}
          draws={draws}
          yourTurn={symbol === turn}
          ended={ended}
        />
      </div>

      <div className="mt-4 flex-1">
        {!gameType && (
          <div className="py-12 text-center text-sm text-muted-foreground">connecting…</div>
        )}
        {gameType === "tictactoe" && (
          <TicTacToeBoard
            board={(board as (string | null)[]) ?? Array(9).fill(null)}
            mySymbol={symbol}
            turn={turn}
            ended={ended}
            onMove={(cell) => socket.send({ type: "move", cell })}
          />
        )}
        {gameType === "checkers" && (
          <CheckersBoard
            board={(board as CheckersBoardType) ?? Array(64).fill(null)}
            mySide={(symbol as "black" | "white") ?? null}
            turn={turn}
            ended={ended}
            onMove={(from, to) => socket.send({ type: "move", from, to })}
          />
        )}
        {gameType === "chess" && fen && (
          <ChessBoard
            fen={fen}
            mySide={(symbol as ChessSide) ?? null}
            roomId={roomId}
            ended={ended}
            onMove={(uci) => socket.send({ type: "move", move: uci })}
          />
        )}
        {gameType === "rock_paper_scissors" && (
          <RockPaperScissorsBoard
            choices={choices}
            mySymbol={symbol}
            ended={ended}
            onMove={(choice) => socket.send({ type: "move", choice })}
            roundResult={round_result}
          />
        )}
        {gameType === "truth_or_dare" && (
          <TruthOrDareBoard
            currentCard={current_card}
            selectedType={selected_type}
            turn={turn}
            mySymbol={symbol}
            ended={ended}
            onMove={(moveData) => socket.send({ type: "move", ...moveData })}
          />
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      {partnerLeft && !ended && (
        <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
          {partnerLeft}
        </div>
      )}

      {ended && (
        <div className="mt-4">
          <ResultBanner
            outcome={outcome}
            onRematch={sendRematch}
            onNewGame={() => {
              leave();
              navigate({ to: "/" });
            }}
          />
        </div>
      )}

      <div className="mt-4 pb-2">
        <ChatPanel messages={chat} meId={playerId} onSend={sendChat} />
      </div>
    </div>
  );
}