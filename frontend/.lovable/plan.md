
# PlayTwo — Build Plan

A mobile-first, intimate two-player game app connecting to an existing backend (REST + WebSocket) for Tic Tac Toe, Checkers, and Chess, with in-game chat.

## Stack note
The spec asks for React + Vite + React Router + Zustand. This project's template is **TanStack Start + TanStack Router**, not Vite/React Router. I'll adapt:
- Use **TanStack Router** (file-based routes) instead of React Router — same mental model, type-safe.
- Use **Zustand** for client state (player name, current room, chat history) — installed fresh.
- Pure TypeScript for all game logic. No external game libs.
- All backend calls go directly from the browser to `http://127.0.0.1:8000` / `ws://127.0.0.1:8000` as specified (no server functions needed — backend is external).

If you'd prefer literal Vite + React Router instead of TanStack, say so and I'll restructure.

## Routes
```text
/                       Home / Lobby (name + game picker)
/room/$roomId/waiting   Waiting Room (share link / native share)
/room/$roomId/play      Game Screen (board + scoreboard + chat)
```

## File structure
```text
src/
  routes/
    index.tsx                       Lobby
    room.$roomId.waiting.tsx        Waiting room
    room.$roomId.play.tsx           Game screen (renders board by game_type)
  store/
    usePlayerStore.ts               name (localStorage), player_id, symbol
    useRoomStore.ts                 room state, board/fen, turn, scores, winner
    useChatStore.ts                 messages[] per room
  lib/
    api.ts                          REST: createRoom, getRoom, getLegalMoves
    socket.ts                       WebSocket manager (connect, send, dispatch)
    games/
      tictactoe.ts                  winner detection, cell helpers
      checkers.ts                   board parsing, move validation hints, king rendering
      chess.ts                      FEN parser → 8x8 piece grid, UCI helpers, flip
  components/
    GameCard.tsx                    lobby card
    Scoreboard.tsx                  You 2 — 1 Partner
    ChatPanel.tsx                   collapsible chat + input
    ResultBanner.tsx                win/lose/draw + rematch
    ShareButtons.tsx                Copy link + navigator.share
    boards/
      TicTacToeBoard.tsx
      CheckersBoard.tsx
      ChessBoard.tsx
      PromotionDialog.tsx
  styles.css                        design tokens (dark navy + purple accent)
```

## State flow
1. **Lobby**: user types name (persisted via Zustand `persist` middleware → localStorage), taps a game card → `POST /api/rooms/` → navigate to `/room/$roomId/waiting`.
2. **Waiting**: open WS to `ws://127.0.0.1:8000/ws/{room_id}`. On `room_joined` store player_id + symbol. On `game_start` navigate to `/play`.
3. **Play**: subscribe to `game_update`, `chat`, `player_left`, `error`. Send `move`, `rematch`, `chat` through the same socket. Socket is held in a module-level singleton so navigation between waiting↔play doesn't drop the connection.

## Game logic (pure TS)
- **Tic Tac Toe**: board is `(string|null)[9]`. Click empty cell on your turn → send `{ type: "move", cell }`. Winner detection client-side only to highlight winning line (server is source of truth).
- **Checkers**: 64-cell flat array. Click own piece → highlight legal landing squares by scanning diagonal moves + jumps (men forward, kings both ways). Send `{ type: "move", from, to }`. Flip board when symbol is `white`. Kings rendered with a crown glyph.
- **Chess**: parse FEN → 8x8 grid + side-to-move. Click piece on your turn → `GET /api/rooms/{id}/legal-moves?from_square=e2` → highlight destination squares from UCI list. Click destination → if pawn reaches last rank show `PromotionDialog` (Q/R/B/N) → send `{ type: "move", move: "e7e8q" }`. Flip board when symbol is `black`.

## Chat
- `useChatStore` keyed by roomId. Append on inbound `chat`. Sender comparison uses `player_id` from `usePlayerStore`. Own messages right-aligned purple, partner left-aligned grey. Collapsible panel below board, persists across rematches (cleared on leaving room).

## Share
`ShareButtons` builds `shareUrl = ${window.location.origin}/room/${roomId}/waiting`. Copy uses `navigator.clipboard.writeText`. Share uses `navigator.share({...})`, falls back to copy + toast if unavailable.

## Design tokens (src/styles.css)
- Background `#0f172a`, surface `#1e293b` with subtle white/5 glass border + backdrop-blur, accent `#7c3aed`, accent-glow for gradients/shadows.
- Inter font loaded via `<link>` in `__root.tsx` head (Tailwind v4 rule).
- Mobile-first; main container `max-w-[480px] mx-auto`. Rounded-2xl surfaces, soft shadows, pulse animation on "Waiting…".
- Smooth page transitions via Tailwind opacity/translate on route mount.

## Dependencies to add
- `zustand`

## Out of scope / assumptions
- Backend is at `http://127.0.0.1:8000` — preview cannot reach a local backend on the user's machine unless they tunnel it. I'll wire it exactly as specified; switching to a remote URL later is a one-line change in `lib/api.ts` + `lib/socket.ts`.
- No auth — player identity comes from server-assigned `player_id` on `room_joined`.
- Server is authoritative for game state; client logic is for UI hints (legal-move highlighting, winner cell highlight) only.

Ready to build on approval.
