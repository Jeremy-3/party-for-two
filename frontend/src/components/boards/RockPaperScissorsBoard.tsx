import React from "react";

interface Props {
  choices: Record<string, string>;
  mySymbol: string | null; // "player1" or "player2"
  ended: boolean;
  onMove: (choice: string) => void;
  roundResult: string | null;
}

export function RockPaperScissorsBoard({ choices, mySymbol, ended, onMove, roundResult }: Props) {
  const myChoice = mySymbol ? choices[mySymbol] : null;
  const partnerSymbol = mySymbol === "player1" ? "player2" : "player1";
  const partnerChoice = choices[partnerSymbol];

  const options = [
    { value: "rock", label: "Rock", emoji: "✊" },
    { value: "paper", label: "Paper", emoji: "✋" },
    { value: "scissors", label: "Scissors", emoji: "✌️" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Game Header */}
      <h3 className="text-lg font-semibold tracking-wider text-muted-foreground uppercase mb-6">
        Rock Paper Scissors
      </h3>

      {/* Duel Arena */}
      <div className="w-full grid grid-cols-2 gap-8 mb-8">
        {/* You */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4">You</span>
          {myChoice ? (
            <div className="flex flex-col items-center animate-bounce-soft">
              <span className="text-6xl mb-2">
                {myChoice === "rock" ? "✊" : myChoice === "paper" ? "✋" : "✌️"}
              </span>
              <span className="text-sm font-semibold capitalize text-foreground">{myChoice}</span>
              <span className="text-xs text-green-400 mt-1">Ready</span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-muted-foreground">
              <span className="text-4xl animate-pulse">❓</span>
              <span className="text-xs mt-3">Choose below...</span>
            </div>
          )}
        </div>

        {/* Partner */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Partner</span>
          {partnerChoice && ended ? (
            <div className="flex flex-col items-center animate-bounce-soft">
              <span className="text-6xl mb-2">
                {partnerChoice === "rock" ? "✊" : partnerChoice === "paper" ? "✋" : "✌️"}
              </span>
              <span className="text-sm font-semibold capitalize text-foreground">{partnerChoice}</span>
              <span className="text-xs text-green-400 mt-1">Revealed</span>
            </div>
          ) : partnerChoice ? (
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-2 animate-pulse">🔒</span>
              <span className="text-sm font-semibold text-muted-foreground">Selected</span>
              <span className="text-xs text-amber-400 mt-1">Ready</span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-muted-foreground">
              <span className="text-4xl animate-pulse">💤</span>
              <span className="text-xs mt-3">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action panel */}
      {!myChoice && !ended ? (
        <div className="w-full">
          <div className="text-center text-sm text-muted-foreground mb-4">Make your choice:</div>
          <div className="flex justify-center gap-4">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onMove(opt.value)}
                className="flex flex-col items-center justify-center p-4 w-24 h-24 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-[#7c3aed]/50 hover:from-[#7c3aed]/10 hover:to-[#a78bfa]/10 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 shadow-lg"
              >
                <span className="text-3xl mb-1">{opt.emoji}</span>
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full text-center">
          {ended && roundResult && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto shadow-md">
              <p className="text-md font-semibold text-foreground">{roundResult}</p>
            </div>
          )}
          {!ended && myChoice && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Waiting for your partner to make their choice...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
