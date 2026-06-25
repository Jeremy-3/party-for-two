import { useState } from "react";

export function ShareButtons({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: unknown }).share) {
      try {
        await navigator.share({
          title: "PlayTwo — it's your turn",
          text: "Join me for a game!",
          url: shareUrl,
        });
        return;
      } catch {}
    }
    copy();
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={copy}
        className="glass rounded-xl py-3 text-sm font-medium text-foreground transition active:scale-95"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <button
        onClick={share}
        className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c3aed]/30 transition active:scale-95"
      >
        Share
      </button>
    </div>
  );
}
