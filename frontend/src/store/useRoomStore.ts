import { create } from "zustand";
import type { GameType } from "../lib/api";
import type { GameStatePayload } from "../lib/socket";

export interface ScoreEntry {
  wins: number;
  draws: number;
}

interface RoomState {
  roomId: string | null;
  gameType: GameType | null;
  status: "waiting" | "playing" | "ended";
  board: unknown;
  fen: string | null;
  turn: string | null;
  winner: string | null;
  scores: Record<string, ScoreEntry>;
  choices: Record<string, string>;
  choices_revealed: boolean;
  round_result: string | null;
  current_card: { type: "truth" | "dare"; text: string } | null;
  selected_type: "truth" | "dare" | null;
  setRoom: (roomId: string, gameType: GameType) => void;
  applyState: (s: GameStatePayload) => void;
  setStatus: (s: RoomState["status"]) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  gameType: null,
  status: "waiting",
  board: null,
  fen: null,
  turn: null,
  winner: null,
  scores: {},
  choices: {},
  choices_revealed: false,
  round_result: null,
  current_card: null,
  selected_type: null,
  setRoom: (roomId, gameType) => set({ roomId, gameType, status: "waiting" }),
  applyState: (s) =>
    set({
      board: s.board ?? null,
      fen: s.fen ?? null,
      turn: s.turn ?? null,
      winner: s.winner ?? null,
      scores: s.scores ?? {},
      choices: s.choices ?? {},
      choices_revealed: s.choices_revealed ?? false,
      round_result: s.round_result ?? null,
      current_card: s.current_card ?? null,
      selected_type: s.selected_type ?? null,
    }),
  setStatus: (status) => set({ status }),
  reset: () =>
    set({
      roomId: null,
      gameType: null,
      status: "waiting",
      board: null,
      fen: null,
      turn: null,
      winner: null,
      scores: {},
      choices: {},
      choices_revealed: false,
      round_result: null,
      current_card: null,
      selected_type: null,
    }),
}));