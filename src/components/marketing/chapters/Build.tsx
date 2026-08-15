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
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ChapterShell
      id="build"
      title="Build"
      color="#6366f1"
      oneliner="by taking a 7-question personality, skill, and academic assessment."
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      {/* h-full/w-full: same allocated frame footprint as every other chapter's
         graphic, even though this content is naturally shorter — centered within it
         rather than stretched, so it doesn't distort into an oddly spaced-out list. */}
      <div className="flex h-full w-full flex-col items-center justify-center" style={{ gap: "calc(var(--mu) * 14px)" }}>
        <div className="flex flex-col items-center" style={{ width: "clamp(270px, 68cqw, 480px)", gap: "calc(var(--mu) * 14px)" }}>
        <p className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 9px)", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 700 }}>
          Question 3
        </p>

        <p className="text-center font-bold" style={{ fontSize: "calc(var(--mu) * 16px)", lineHeight: 1.3, color: "var(--foreground)" }}>
          Choose your interests
        </p>

        <div className="flex w-full flex-wrap justify-center" style={{ gap: "calc(var(--mu) * 10px)" }}>
          {INTERESTS.map((interest) => {
            const isSelected = selected === interest;
            const isNudge = selected === null && interest === EXAMPLE;
            return (
              <button
                key={interest}
                type="button"
                onClick={() => setSelected(interest)}
                className={`flex items-center rounded-full border transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""}`}
                style={{
                  gap: "calc(var(--mu) * 8px)",
                  padding: "calc(var(--mu) * 12px) calc(var(--mu) * 18px)",
                  fontSize: "calc(var(--mu) * 12px)",
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
                    width: "calc(var(--mu) * 16px)",
                    height: "calc(var(--mu) * 16px)",
                    padding: "calc(var(--mu) * 4px)",
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
          <div
            className="flex items-center rounded-full border"
            style={{
              padding: "calc(var(--mu) * 12px) calc(var(--mu) * 16px)",
              fontSize: "calc(var(--mu) * 11px)",
              fontWeight: 600,
              background: "transparent",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            + 12 more
          </div>
        </div>

        <p className="text-center" style={{ fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}>
          {selected === null ? "Tap an interest, pick as many as fit." : `${selected} noted. Pick another, or that's the profile.`}
        </p>
        </div>
      </div>
    </ChapterShell>
  );
}
