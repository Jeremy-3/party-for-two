const API_BASE = "http://127.0.0.1:8000";

export type GameType = "tictactoe" | "checkers" | "chess" | "rock_paper_scissors" | "truth_or_dare";

export async function createRoom(game_type: GameType, player_name: string) {
  const res = await fetch(`${API_BASE}/api/rooms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_type, player_name }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json() as Promise<{ room_id: string; game_type: GameType }>;
}

export async function getRoom(room_id: string) {
  const res = await fetch(`${API_BASE}/api/rooms/${room_id}`);
  if (!res.ok) throw new Error("Failed to fetch room");
  return res.json() as Promise<{ room_id: string; status: string; game_type: GameType }>;
}

export async function getLegalMoves(room_id: string, from_square: string) {
  const res = await fetch(
    `${API_BASE}/api/rooms/${room_id}/legal-moves?from_square=${from_square}`,
  );
  if (!res.ok) throw new Error("Failed to fetch legal moves");
  return res.json() as Promise<{ legal_moves: string[] }>;
}

export const WS_BASE = "ws://127.0.0.1:8000";