"use client";

import { useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// Real question from the actual 7-question assessment (question 3 of 7): "Choose Your
// Interests." Business & Money is the demo's example path, since that's this whole
// storyboard's fixed destination (Investment Banking) — nudged to invite the tap, not
// pre-selected, so nothing reads as "already chosen" before the reader acts. Per direct
// feedback, Tech and Health are shown but not actually pickable (hover only) — only
// Business & Money is clickable, so the rest of the storyboard's fixed path still
// makes sense regardless of what a reader tries.
const INTERESTS = ["Tech", "Business & Money", "Health"];
const CLICKABLE = "Business & Money";

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
  const [hovered, setHovered] = useState<string | null>(null);

  function pick(interest: string) {
    if (interest !== CLICKABLE) return;
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
    // graphic. items-center/justify-center (not the old top-anchored layout): now
    // that the question sits inside its own bordered card (below), centering it
    // reads as "one self-contained step," matching how Connect/Play/Match each
    // center their own card within the shared frame.
    <div className="flex h-full w-full items-center justify-center">
      {/* The distinct card/container this step was missing — per direct feedback,
         without it the whole Build section read as visually open, not obviously
         "one step of 7." Same recipe as Connect's post card (glass-surface-3 +
         blur + a soft var(--c)-tinted glow) for visual consistency across
         chapters; var(--c) here resolves to Build's own indigo, set by
         ChapterShell from the `color` prop passed to it. */}
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-2xl border"
        style={{
          maxWidth: "min(92cqw, 440px)",
          padding: "calc(var(--mu) * 22px) calc(var(--mu) * 20px)",
          gap: "calc(var(--mu) * 18px)",
          background: "var(--glass-surface-3)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "var(--glass-border)",
          boxShadow:
            "0 0 0 1px color-mix(in srgb, var(--c) 18%, transparent), 0 30px 70px -20px color-mix(in srgb, var(--c) 40%, transparent), 0 12px 28px -12px rgba(0,0,0,0.55)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-[180px] w-[85%] -translate-x-1/2 rounded-full blur-[60px]"
          style={{ background: "color-mix(in srgb, var(--c) 30%, transparent)" }}
        />

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
            const isClickable = interest === CLICKABLE;
            const isSelected = selected === interest;
            const isNudge = selected === null && isClickable;
            const isHovered = hovered === interest;
            return (
              <button
                key={interest}
                type="button"
                onClick={() => pick(interest)}
                onMouseEnter={() => setHovered(interest)}
                onMouseLeave={() => setHovered((h) => (h === interest ? null : h))}
                aria-disabled={!isClickable}
                className={`flex w-full items-center justify-between rounded-[var(--radius-md-alt)] border transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""} ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  padding: "calc(var(--mu) * 16px) calc(var(--mu) * 20px)",
                  fontSize: "calc(var(--mu) * 14px)",
                  fontWeight: 600,
                  background: isSelected
                    ? "color-mix(in srgb, #6366f1 16%, var(--glass-surface-2))"
                    : isHovered
                      ? "var(--glass-surface-1)"
                      : "var(--glass-surface-2)",
                  borderColor: isSelected ? "#6366f1" : isHovered ? "var(--muted-foreground)" : "var(--border)",
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

        {selected === null ? (
          // One single "+ more" chip (not one per option, and not the old plain
          // "+ 12 more interests" text) — per direct feedback, per-option chips were
          // clutter and plain text read as inert copy easy to overlook. A single
          // button-like pill (not a full second button) signals "there's more behind
          // this whole assessment" without repeating itself three times.
          <div className="flex justify-center">
            <span
              className="flex flex-none items-center rounded-full border font-bold uppercase"
              style={{
                fontSize: "calc(var(--mu) * 8.5px)",
                letterSpacing: "0.04em",
                padding: "calc(var(--mu) * 5px) calc(var(--mu) * 12px)",
                color: "var(--muted-foreground)",
                borderColor: "var(--glass-border)",
                background: "var(--glass-surface-1)",
              }}
            >
              + more
            </span>
          </div>
        ) : (
          <p className="text-center" style={{ fontSize: "calc(var(--mu) * 10.5px)", color: "var(--muted-foreground)" }}>
            {`${selected} noted. Heading to your match...`}
          </p>
        )}
      </div>
    </div>
  );
}
