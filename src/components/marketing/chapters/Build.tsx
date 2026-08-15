"use client";

import { useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// Real question from the actual 7-question assessment (question 3 of 7): "Choose Your
// Interests." Business & Money is the demo's example path, since that's this whole
// storyboard's fixed destination (Investment Banking) — nudged to invite the tap, not
// pre-selected, so nothing reads as "already chosen" before the reader acts.
const INTERESTS = ["Tech", "Business & Money", "Health"];
const EXAMPLE = "Business & Money";

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function BuildChapter() {
  const [graphicRef, playing, graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="build"
      title="Build"
      color="#6366f1"
      oneliner="by taking a 7-question personality, skill, and academic assessment."
      compact
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId (not just mounted once): remounts this whole demo fresh
         every time the reader scrolls back onto Build, so a picked interest doesn't
         stay stuck showing from a previous visit — the interaction (and its nudge
         pulse) is there to replay every time, not just the first. A plain useState
         reset inside an effect was tried first and rejected by this repo's stricter
         react-hooks lint rule (no synchronous setState in an effect body); remounting
         via key is the actually-recommended React pattern for this exact case. */}
      <BuildDemo key={visitId} />
    </ChapterShell>
  );
}

function BuildDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  function pick(interest: string) {
    setSelected(interest);
    // Just long enough to see the row's own 200ms check-in transition land, then
    // straight into Match — advance the moment the feedback finishes, not after a
    // separate "linger and admire it" pause on top of that.
    setTimeout(() => {
      document.getElementById("match")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  }

  return (
    // h-full/w-full: same allocated frame footprint as every other chapter's
    // graphic. Full-width, identically-sized rows (not wrapped pills of whatever
    // width their own text needs) so nothing reads as mismatched chips, and a wide
    // column so it actually uses the frame instead of floating a small cluster in a
    // lot of empty space.
    // justify-start (not center): the frame is sized generously to fit every
    // chapter's content at its biggest, but Build's own content is shorter than
    // that ceiling, so centering it left a large dead gap between the title copy
    // above and the actual question — anchoring to the top of the frame keeps this
    // reading as "right below the headline" instead.
    <div className="flex h-full w-full flex-col items-center justify-start" style={{ gap: "calc(var(--mu) * 18px)" }}>
      <div className="flex w-full flex-col items-center" style={{ maxWidth: "min(92%, 440px)", gap: "calc(var(--mu) * 16px)" }}>
        <div className="text-center">
          <p className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 10px)", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 700 }}>
            Question 3 of 7
          </p>
          <p className="mt-2 font-bold" style={{ fontSize: "calc(var(--mu) * 19px)", lineHeight: 1.25, color: "var(--foreground)" }}>
            Choose your interests
          </p>
        </div>

        <div className="flex w-full flex-col" style={{ gap: "calc(var(--mu) * 12px)" }}>
          {INTERESTS.map((interest) => {
            const isSelected = selected === interest;
            const isNudge = selected === null && interest === EXAMPLE;
            return (
              <button
                key={interest}
                type="button"
                onClick={() => pick(interest)}
                className={`flex w-full items-center justify-between rounded-[var(--radius-md-alt)] border transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""}`}
                style={{
                  padding: "calc(var(--mu) * 16px) calc(var(--mu) * 20px)",
                  fontSize: "calc(var(--mu) * 14px)",
                  fontWeight: 600,
                  background: isSelected ? "color-mix(in srgb, #6366f1 16%, var(--glass-surface-2))" : "var(--glass-surface-2)",
                  borderColor: isSelected ? "#6366f1" : "var(--border)",
                  color: isSelected ? "var(--foreground)" : "var(--muted-foreground)",
                  opacity: selected !== null && !isSelected ? 0.6 : 1,
                }}
              >
                {interest}
                <span
                  className="flex flex-none items-center justify-center rounded-full text-white transition-all duration-200"
                  style={{
                    width: "calc(var(--mu) * 22px)",
                    height: "calc(var(--mu) * 22px)",
                    padding: "calc(var(--mu) * 5px)",
                    background: "#6366f1",
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? "scale(1)" : "scale(0.4)",
                  }}
                >
                  {CHECK}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center" style={{ fontSize: "calc(var(--mu) * 10.5px)", color: "var(--muted-foreground)" }}>
          {selected === null ? "+ 12 more interests in the full assessment" : `${selected} noted. Heading to your match...`}
        </p>
      </div>
    </div>
  );
}
