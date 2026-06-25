import { WS_BASE } from "./api";

export type ServerMessage =
  | { type: "room_joined"; payload: { player_id: string; symbol: string; room_id: string } }
  | { type: "game_start"; payload: GameStatePayload }
  | { type: "game_update"; payload: GameStatePayload }
  | { type: "chat"; payload: { sender: string; message: string; timestamp: string | number } }
  | { type: "error"; payload: { message: string } }
  | { type: "player_left"; payload: { message: string } };

export interface GameStatePayload {
  board?: unknown;
  fen?: string;
  turn?: string;
  winner?: string | null;
  scores?: Record<string, any>;
  choices?: Record<string, string>;
  choices_revealed?: boolean;
  round_result?: string | null;
  current_card?: { type: "truth" | "dare"; text: string } | null;
  selected_type?: "truth" | "dare" | null;
}

export type ClientMessage =
  | { type: "move"; [k: string]: unknown }
  | { type: "rematch" }
  | { type: "chat"; message: string };

type Listener = (msg: ServerMessage) => void;

class SocketManager {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private listeners = new Set<Listener>();
  private playerName = "";

  connect(roomId: string, playerName: string) {
    if (this.ws && this.roomId === roomId && this.ws.readyState <= 1) return;
    this.disconnect();
    this.roomId = roomId;
    this.playerName = playerName;
    const url = `${WS_BASE}/ws/${roomId}${playerName ? `?player_name=${encodeURIComponent(playerName)}` : ""}`;
    const ws = new WebSocket(url);
    this.ws = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as ServerMessage;
        this.listeners.forEach((l) => l(msg));
      } catch (e) {
        console.error("Bad WS message", e);
      }
    };
    ws.onerror = (e) => console.error("WS error", e);
    ws.onclose = () => {
      if (this.ws === ws) this.ws = null;
    };
  }

  send(msg: ClientMessage) {
    if (!this.ws || this.ws.readyState !== 1) {
      console.warn("WS not open, dropping message", msg);
      return;
    }
    this.ws.send(JSON.stringify(msg));
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  disconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.roomId = null;
  }

  currentRoom() {
    return this.roomId;
  }
}

export const socket = new SocketManager();