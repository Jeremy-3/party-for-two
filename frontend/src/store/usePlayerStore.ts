import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  name: string;
  setName: (n: string) => void;
  playerId: string | null;
  symbol: string | null;
  setIdentity: (playerId: string, symbol: string) => void;
  clearIdentity: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      name: "",
      setName: (name) => set({ name }),
      playerId: null,
      symbol: null,
      setIdentity: (playerId, symbol) => set({ playerId, symbol }),
      clearIdentity: () => set({ playerId: null, symbol: null }),
    }),
    { name: "playtwo-player", partialize: (s) => ({ name: s.name }) },
  ),
);