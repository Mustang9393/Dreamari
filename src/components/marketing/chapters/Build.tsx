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
// The rest of the real assessment's interest categories, straight from the design
// system's 13-world set (tokens.css) — surfaced on hover of the "+ more" chip so it
// reads as "there's a real, specific list behind this," not just decorative copy.
const MORE_INTERESTS = [
  "Building & Construction",
  "Arts, Media & Sport",
  "Food, Farming & Nature",
  "Science & Research",
  "Law, Safety & Government",
  "Driving, Flying & Shipping",
  "Factories & Making Things",
  "Fixing Machines & Engines",
  "Helping & Human Services",
  "Teaching & Learning",
];

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
  const [moreHovered, setMoreHovered] = useState(false);

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
          <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: "calc(var(--mu) * 10px)", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 600 }}>
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
          <div className="relative flex justify-center">
            {/* Hover-revealed list of the assessment's other interest categories —
               per direct feedback the chip should actually be interactive, not a
               static label. Shown on hover only (no click target: this demo has
               nothing real to navigate to for "more"), same restraint as Build's
               own Tech/Health rows being hover-only, not clickable. */}
            <button
              type="button"
              tabIndex={-1}
              onMouseEnter={() => setMoreHovered(true)}
              onMouseLeave={() => setMoreHovered(false)}
              onFocus={() => setMoreHovered(true)}
              onBlur={() => setMoreHovered(false)}
              className="flex flex-none cursor-pointer items-center rounded-full border font-bold uppercase transition-colors duration-150"
              style={{
                fontSize: "calc(var(--mu) * 8.5px)",
                letterSpacing: "0.04em",
                padding: "calc(var(--mu) * 5px) calc(var(--mu) * 12px)",
                color: moreHovered ? "var(--foreground)" : "var(--muted-foreground)",
                borderColor: moreHovered ? "var(--muted-foreground)" : "var(--glass-border)",
                background: moreHovered ? "var(--glass-surface-2)" : "var(--glass-surface-1)",
              }}
            >
              + more
            </button>
            {/* inset-x-0 + flex justify-center (not left-1/2 + -translate-x-1/2 on the
               bubble itself) — centers the bubble against the FULL WIDTH of this row
               via layout instead of percentage-of-self transform math, so it can't
               drift off to one side the way the transform-based approach did. Only
               the small entrance nudge (translateY) needs a transform now, and that's
               single-axis with no centering math to get wrong. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-full z-10 flex justify-center"
              style={{ marginBottom: "calc(var(--mu) * 8px)" }}
            >
              <div
                role="tooltip"
                className="rounded-[var(--radius-md)] border text-left transition-all duration-150"
                style={{
                  width: "max(220px, 80cqw)",
                  maxWidth: "320px",
                  padding: "calc(var(--mu) * 10px) calc(var(--mu) * 12px)",
                  background: "var(--glass-surface-3)",
                  borderColor: "var(--glass-border)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "var(--shadow-md)",
                  opacity: moreHovered ? 1 : 0,
                  transform: moreHovered ? "translateY(0)" : "translateY(4px)",
                }}
              >
                <p
                  className="font-bold uppercase"
                  style={{ fontSize: "calc(var(--mu) * 8px)", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}
                >
                  Plus 10 more categories
                </p>
                <p className="mt-1.5 leading-snug" style={{ fontSize: "calc(var(--mu) * 10px)", color: "var(--foreground)" }}>
                  {MORE_INTERESTS.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center" style={{ fontSize: "calc(var(--mu) * 10.5px)", color: "var(--muted-foreground)" }}>
            {`${selected} noted. Heading to your match...`}
          </p>
        )}

        {/* Source citation for the assessment questions — deliberately transparent
           but quiet, per direct request: last element in the card (under the "+ more"
           chip), tiny, and at reduced opacity of the already-muted foreground so it
           reads as a footnote rather than competing with the question UI. Outside the
           selected-state conditional above so it stays visible in both states. */}
        <p
          className="text-center"
          style={{
            fontSize: "calc(var(--mu) * 8px)",
            letterSpacing: "0.02em",
            color: "var(--muted-foreground)",
            opacity: 0.62,
          }}
        >
          Source: Harvard FAS Mignone + O*NET Interest Profiler
        </p>
      </div>
    </div>
  );
}
