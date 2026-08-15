"use client";

import Image from "next/image";
import { useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A positive glossary mini-game replacing the old market-drop scenario: pick the right
// definition, always get an encouraging read regardless of which one you tap (no red,
// no "wrong answer" framing) — terms lean finance since that's this storyboard's fixed
// destination (Investment Banking), matching Connect's own thread.
const TERMS = [
  {
    term: "IPO",
    correct: "When a company sells shares to the public for the first time.",
    distractors: ["A type of business bank loan.", "A company's yearly tax filing."],
  },
  {
    term: "Valuation",
    correct: "Figuring out what a company is actually worth.",
    distractors: ["The interest rate on a loan.", "How many people a company employs."],
  },
  {
    term: "Equity",
    correct: "Owning a piece of a company, not just lending it money.",
    distractors: ["A fixed monthly paycheck.", "The tax rate on a stock sale."],
  },
];

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function shuffledOptions(termIndex: number) {
  const t = TERMS[termIndex % TERMS.length];
  const options = [t.correct, ...t.distractors];
  // Deterministic per-term shuffle (not Math.random, which the harness disallows and
  // which would also just reshuffle on every re-render) — rotate by the term's own index.
  const offset = termIndex % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

export function PlayChapter() {
  const [graphicRef, , graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const [termIndex, setTermIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const term = TERMS[termIndex % TERMS.length];
  const options = shuffledOptions(termIndex);
  const isCorrect = picked === term.correct;

  function next() {
    setPicked(null);
    setTermIndex((i) => i + 1);
  }

  return (
    <ChapterShell
      id="play"
      title="Play"
      color="#3b82f6"
      oneliner="day-in-the-life career simulations and learn industry terms through the glossary game."
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* Full-bleed scene (not a cropped banner) with the game floating on top in a
         glass panel, same read as Match's photo cards: the scene stays visible behind
         a translucent/blurred surface rather than a solid one covering it. */}
      <div
        className="relative z-[1] h-full max-w-full overflow-hidden"
        style={{ width: "clamp(300px, 90cqw, 560px)", aspectRatio: "168 / 300", borderRadius: "var(--radius-md-alt)" }}
      >
        <Image src="/images/play-illustration.jpg" alt="" fill className="object-cover" style={{ objectPosition: "center 22%" }} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(5,7,15,0.15) 0%, transparent 32%, rgba(5,7,15,0.3) 50%, rgba(5,7,15,0.55) 68%)" }}
        />

        <div
          className="absolute inset-x-0 bottom-0 flex flex-col"
          style={{ padding: "calc(var(--mu) * 20px)", gap: "calc(var(--mu) * 10px)", background: "rgba(8,11,23,0.42)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
        >
          <div>
            <p className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 9.5px)", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 700 }}>
              Glossary game
            </p>
            <p className="mt-1 font-extrabold" style={{ fontSize: "calc(var(--mu) * 24px)", color: "#7aa4ff" }}>
              {term.term}
            </p>
            <p className="mt-0.5" style={{ fontSize: "calc(var(--mu) * 11.5px)", color: "var(--muted-foreground)" }}>
              Which definition is right?
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: "calc(var(--mu) * 9px)" }}>
            {options.map((option, i) => {
              const isThisCorrect = option === term.correct;
              const isThisPicked = option === picked;
              const revealed = picked !== null;
              const isNudge = picked === null && i === 0;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPicked(option)}
                  className={`flex items-center justify-between rounded-[var(--radius-md-alt)] border text-left transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""}`}
                  style={{
                    padding: "calc(var(--mu) * 12px) calc(var(--mu) * 16px)",
                    fontSize: "calc(var(--mu) * 11.5px)",
                    fontWeight: 600,
                    background: revealed && isThisCorrect ? "color-mix(in srgb, #3b82f6 30%, var(--glass-surface-2))" : "var(--glass-surface-2)",
                    borderColor: revealed && isThisCorrect ? "#3b82f6" : revealed && isThisPicked ? "var(--muted-foreground)" : "var(--glass-border)",
                    color: revealed && !isThisCorrect && !isThisPicked ? "var(--muted-foreground)" : "#fff",
                    opacity: revealed && !isThisCorrect && !isThisPicked ? 0.55 : 1,
                  }}
                >
                  {option}
                  <span
                    className="flex flex-none items-center justify-center rounded-full text-white transition-all duration-200"
                    style={{
                      width: "calc(var(--mu) * 18px)",
                      height: "calc(var(--mu) * 18px)",
                      padding: "calc(var(--mu) * 4px)",
                      background: "#3b82f6",
                      opacity: revealed && isThisCorrect ? 1 : 0,
                      transform: revealed && isThisCorrect ? "scale(1)" : "scale(0.4)",
                    }}
                  >
                    {CHECK}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between" style={{ minHeight: "calc(var(--mu) * 22px)" }}>
            <p style={{ fontSize: "calc(var(--mu) * 10.5px)", fontWeight: 600, color: picked === null ? "var(--muted-foreground)" : "#7aa4ff" }}>
              {picked === null ? "Tap one to see what it means." : isCorrect ? "Nice, that's exactly it!" : "Close! That's the one highlighted above."}
            </p>
            {picked !== null && (
              <button
                type="button"
                onClick={next}
                className="flex flex-none items-center rounded-full border font-semibold"
                style={{
                  gap: "calc(var(--mu) * 5px)",
                  padding: "calc(var(--mu) * 6px) calc(var(--mu) * 12px)",
                  fontSize: "calc(var(--mu) * 10px)",
                  background: "var(--glass-surface-2)",
                  borderColor: "var(--glass-border)",
                  color: "#fff",
                }}
              >
                Next term
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 11px)", height: "calc(var(--mu) * 11px)" }}>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
