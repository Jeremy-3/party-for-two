import React from "react";

interface Props {
  currentCard: { type: "truth" | "dare"; text: string } | null;
  selectedType: "truth" | "dare" | null;
  turn: string | null; // "player1" or "player2"
  mySymbol: string | null; // "player1" or "player2"
  ended: boolean;
  onMove: (moveData: Record<string, unknown>) => void;
}

export function TruthOrDareBoard({ currentCard, selectedType, turn, mySymbol, ended, onMove }: Props) {
  const isMyTurn = mySymbol === turn;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Game Header */}
      <h3 className="text-lg font-semibold tracking-wider text-muted-foreground uppercase mb-6">
        Truth or Dare
      </h3>

      {/* Main card stage */}
      <div className="w-full max-w-sm">
        {!currentCard ? (
          // Choice Selection Stage
          isMyTurn ? (
            <div className="flex flex-col items-center p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl text-center">
              <span className="text-4xl mb-4 animate-bounce-soft">✨</span>
              <h4 className="text-xl font-bold text-foreground mb-2">It's your turn!</h4>
              <p className="text-sm text-muted-foreground mb-8">
                Choose Truth or Dare to reveal your challenge.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => onMove({ action: "draw", card_type: "truth" })}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/20 border border-pink-500/30 hover:border-pink-500/60 shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 text-pink-300 hover:text-white"
                >
                  <span className="text-3xl mb-2">💬</span>
                  <span className="text-md font-bold uppercase tracking-wider">Truth</span>
                </button>

                <button
                  onClick={() => onMove({ action: "draw", card_type: "dare" })}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/60 shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 text-amber-300 hover:text-white"
                >
                  <span className="text-3xl mb-2">🔥</span>
                  <span className="text-md font-bold uppercase tracking-wider">Dare</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl text-center py-16">
              <span className="text-4xl mb-4 animate-pulse">⏳</span>
              <h4 className="text-xl font-bold text-foreground/80 mb-2">Partner's Turn</h4>
              <p className="text-sm text-muted-foreground">
                Waiting for them to select Truth or Dare...
              </p>
            </div>
          )
        ) : (
          // Active Card Stage
          <div className="relative">
            <div
              className={`p-8 rounded-3xl border shadow-2xl text-center transform transition-all duration-500 ${
                currentCard.type === "truth"
                  ? "bg-gradient-to-b from-pink-950/20 to-rose-900/10 border-pink-500/20"
                  : "bg-gradient-to-b from-amber-950/20 to-orange-900/10 border-amber-500/20"
              }`}
            >
              {/* Card Ribbon / Tag */}
              <div
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${
                  currentCard.type === "truth"
                    ? "bg-pink-500/20 text-pink-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {currentCard.type === "truth" ? "💬 Truth" : "🔥 Dare"}
              </div>

              {/* Card Prompt */}
              <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground min-h-[100px] flex items-center justify-center mb-8 px-2">
                "{currentCard.text}"
              </p>

              {/* Action Buttons for the active player */}
              {!ended ? (
                isMyTurn ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => onMove({ action: "complete" })}
                      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-semibold text-white shadow-lg transition-all duration-200 transform active:scale-95"
                    >
                      ✓ Completed
                    </button>
                    <button
                      onClick={() => onMove({ action: "skip" })}
                      className="w-full py-2.5 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 font-semibold text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      Skip Prompt
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground animate-pulse py-4">
                    Waiting for partner to perform the challenge...
                  </p>
                )
              ) : (
                <div className="py-4 text-center">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <p className="text-md font-bold text-emerald-400">Challenge Completed!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Next Round" below to swap turns.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
