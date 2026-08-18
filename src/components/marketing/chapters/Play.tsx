"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A single day-in-the-life situational moment replacing the earlier glossary quiz and
// the earlier 3-scenario auto-advancing cycle: one scene, three genuinely good ways to
// react to it (illusion of choice, same as Build/Match — no wrong branch to build), and
// a real "Try again" replay instead of auto-advancing to a next question. The point is
// the immediate hit of positive feedback on tap, not a quiz result or a queue of scenes.
const SCENARIO = {
  scene: "Christina (VP) introduces you to Marcus, the Managing Director. The team pitches to a big company tomorrow.",
  prompt: "What should you do first?",
  options: [
    { label: "Ask for your role and deadline", response: "Smart, clarify scope first." },
    { label: "Start changing slides", response: "Fast and confident under pressure." },
    { label: "Wait for Jordan (Fellow Analyst)", response: "Teamwork keeps deals moving." },
  ],
};

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function PlayChapter() {
  const [graphicRef, , graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="play"
      title="Play"
      color="#3b82f6"
      oneliner="a day-in-the-life situation where every instinct pays off."
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: remounts this demo fresh every time the reader scrolls back
         onto Play, so a previously-picked option (and its feedback) doesn't stay stuck
         showing — the pick-and-react moment is there to replay every visit. */}
      <PlayDemo key={visitId} />
    </ChapterShell>
  );
}

function PlayDemo() {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  // Same act-then-advance rhythm as Build and Match: advance the moment the burst/glow
  // feedback (longest piece is the 0.8s whole-card glow) actually finishes, not on a
  // separate multi-second timer stacked on top of it. Hitting "Try again" resets
  // pickedIndex to null before this fires, which clears the effect and cancels the
  // scroll.
  useEffect(() => {
    if (pickedIndex === null) return;
    const timeout = setTimeout(() => {
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 950);
    return () => clearTimeout(timeout);
  }, [pickedIndex]);

  // Full-bleed scene (not a cropped banner) with the simulation floating on top in a
  // glass panel, same read as Match's photo cards: the scene stays visible behind a
  // translucent/blurred surface rather than a solid one covering it.
  return (
      <div
        className={`mkt-play-card relative z-[1] h-full max-w-full overflow-hidden ${pickedIndex !== null ? "mkt-play-feedback" : ""}`}
        style={{ width: "clamp(300px, 90cqw, 560px)", aspectRatio: "168 / 300", borderRadius: "var(--radius-md-alt)", ["--c" as string]: "#3b82f6" }}
      >
        <Image src="/images/play-illustration.jpg" alt="" fill className="object-cover" style={{ objectPosition: "center 22%" }} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: "linear-gradient(180deg, rgba(5,7,15,0.15) 0%, transparent 32%, rgba(5,7,15,0.3) 50%, rgba(5,7,15,0.55) 68%)" }}
        />

        <div
          className="absolute inset-x-0 bottom-0 z-[2] flex flex-col"
          style={{ padding: "calc(var(--mu) * 20px)", gap: "calc(var(--mu) * 10px)", background: "rgba(8,11,23,0.42)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
        >
          <div>
            <p className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 9.5px)", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 700 }}>
              Day in the life
            </p>
            <p className="mt-1 font-extrabold" style={{ fontSize: "calc(var(--mu) * 16px)", lineHeight: 1.25, color: "#fff" }}>
              {SCENARIO.scene}
            </p>
            <p className="mt-0.5" style={{ fontSize: "calc(var(--mu) * 11.5px)", color: "var(--muted-foreground)" }}>
              {SCENARIO.prompt}
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: "calc(var(--mu) * 9px)" }}>
            {SCENARIO.options.map((option, i) => {
              const isPicked = pickedIndex === i;
              const isNudge = pickedIndex === null && i === 0;
              return (
                <button
                  key={option.label}
                  type="button"
                  disabled={pickedIndex !== null}
                  onClick={() => setPickedIndex(i)}
                  className={`flex items-center justify-between rounded-[var(--radius-md-alt)] border text-left transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""}`}
                  style={{
                    padding: "calc(var(--mu) * 12px) calc(var(--mu) * 16px)",
                    fontSize: "calc(var(--mu) * 11.5px)",
                    fontWeight: 600,
                    background: isPicked ? "color-mix(in srgb, #3b82f6 30%, var(--glass-surface-2))" : "var(--glass-surface-2)",
                    borderColor: isPicked ? "#3b82f6" : "var(--glass-border)",
                    color: pickedIndex !== null && !isPicked ? "var(--muted-foreground)" : "#fff",
                    opacity: pickedIndex !== null && !isPicked ? 0.55 : 1,
                  }}
                >
                  {option.label}
                  <span
                    className="flex flex-none items-center justify-center rounded-full text-white transition-all duration-200"
                    style={{
                      width: "calc(var(--mu) * 18px)",
                      height: "calc(var(--mu) * 18px)",
                      padding: "calc(var(--mu) * 4px)",
                      background: "#3b82f6",
                      opacity: isPicked ? 1 : 0,
                      transform: isPicked ? "scale(1)" : "scale(0.4)",
                    }}
                  >
                    {CHECK}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between" style={{ minHeight: "calc(var(--mu) * 22px)" }}>
            <p style={{ fontSize: "calc(var(--mu) * 11px)", fontWeight: 700, color: "#7aa4ff" }}>
              {pickedIndex !== null ? SCENARIO.options[pickedIndex].response : ""}
            </p>
            {pickedIndex !== null && (
              <button
                type="button"
                onClick={() => setPickedIndex(null)}
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 11px)", height: "calc(var(--mu) * 11px)" }}>
                  <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                </svg>
                Try again
              </button>
            )}
          </div>
        </div>

        {/* The dopamine hit: a big checkmark burst with a radiating ring, right over
           the scene itself, the instant an option is tapped. z-[3] — above both the
           scene (z-[1]) and the glass panel (z-[2]), which otherwise clips it since the
           panel comes later in paint order and creates its own stacking context via
           backdrop-filter. Keyed by pick so it restarts clean on every tap, including
           replays of the same option after "Try again." */}
        {pickedIndex !== null && (
          <div
            key={pickedIndex}
            aria-hidden
            className="pointer-events-none absolute z-[3] flex items-center justify-center"
            style={{ top: "24%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="mkt-burst-ring absolute rounded-full" style={{ width: "calc(var(--mu) * 52px)", height: "calc(var(--mu) * 52px)" }} />
            <div
              className="mkt-burst flex items-center justify-center rounded-full text-white"
              style={{ width: "calc(var(--mu) * 52px)", height: "calc(var(--mu) * 52px)", padding: "calc(var(--mu) * 15px)", background: "#3b82f6", boxShadow: "0 8px 24px -6px rgba(59,130,246,0.7)" }}
            >
              {CHECK}
            </div>
          </div>
        )}
      </div>
  );
}
