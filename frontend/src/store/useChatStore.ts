import { create } from "zustand";

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string | number;
}

interface ChatState {
  byRoom: Record<string, ChatMessage[]>;
  initRoom: (roomId: string) => void;
  append: (roomId: string, msg: ChatMessage) => void;
  clear: (roomId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  byRoom: {},
  initRoom: (roomId) =>
    set((s) => ({
      byRoom: { ...s.byRoom, [roomId]: s.byRoom[roomId] ?? [] },
    })),
  append: (roomId, msg) =>
    set((s) => ({
      byRoom: { ...s.byRoom, [roomId]: [...(s.byRoom[roomId] ?? []), msg] },
    })),
  clear: (roomId) =>
    set((s) => {
      const next = { ...s.byRoom };
      delete next[roomId];
      return { byRoom: next };
    }),
}));