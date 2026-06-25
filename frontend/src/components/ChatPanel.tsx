import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../store/useChatStore";

interface Props {
  messages: ChatMessage[];
  meId: string | null;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, meId, onSend }: Props) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          💬 Chat
          {messages.length > 0 && (
            <span className="rounded-full bg-[#7c3aed]/30 px-2 py-0.5 text-xs">{messages.length}</span>
          )}
        </span>
        <span className="text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <>
          <div ref={scrollRef} className="max-h-44 space-y-1.5 overflow-y-auto px-3 pb-2">
            {messages.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">say hi 👋</div>
            ) : (
              messages.map((m, i) => {
                const mine = m.sender === meId;
                return (
                  <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm ${
                        mine
                          ? "rounded-br-md bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white"
                          : "rounded-bl-md bg-white/10 text-foreground"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-white/5 p-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message…"
              className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] px-4 text-sm font-semibold text-white active:scale-95"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}