"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A single day-in-the-life situational moment replacing the earlier glossary quiz and
// the earlier 3-scenario auto-advancing cycle: one scene, a real "Try again" replay
// instead of auto-advancing to a next question. The point is the immediate hit of
// positive feedback on tap, not a quiz result or a queue of scenes.
//
// Per direct feedback, only the genuinely right answer is clickable — same locked-path
// pattern as Build's interest picker — rather than three equally-valid options; the
// other two are shown but inert, so the demo reads as "this is the right move," not an
// open multiple-choice with no wrong branch.
const SCENARIO = {
  scene: "Christina (VP) introduces you to Marcus, the Managing Director. The team pitches to a big company tomorrow.",
  prompt: "What should you do first?",
  options: [
    { label: "Ask for your role and deadline", response: "Smart, clarify scope first." },
    { label: "Start changing slides", response: "" },
    { label: "Wait for Jordan (Fellow Analyst)", response: "" },
  ],
};
const CORRECT_INDEX = 0;

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
      // Briefly renamed "Simulate", reverted to "Play" per direct request ("for
      // now" — may flip again). The section id has been "play" throughout.
      title="Play"
      color="#3b82f6"
      oneliner="a day-in-the-life situation where every instinct pays off."
      flip
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
      document.getElementById("connect")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 950);
    return () => clearTimeout(timeout);
  }, [pickedIndex]);

  // Redesigned per direct feedback ("the image is the least visible part, it's
  // supposed to be an immersive simulation experience like an RPG") — the scene
  // used to be a full-bleed background buried under a heavy dark gradient PLUS a
  // translucent blurred panel laid directly over most of it, leaving only a
  // washed-out sliver actually visible. Now it's two genuinely separate regions
  // stacked in a flex column: a real, unobscured art panel on top (just enough of
  // a bottom fade to blend the seam, not to darken the scene itself), and an
  // opaque dialogue/choice panel below it — closer to a visual-novel's "scene +
  // choice box" composition than a photo card with text laid over it.
  return (
      <div
        className={`mkt-play-card relative z-[1] flex h-full max-w-full flex-col overflow-hidden ${pickedIndex !== null ? "mkt-play-feedback" : ""}`}
        // Standard 480 lane (Build's width is the reference for every boxed
        // graphic; only Explore's fading scroll rail gets the wide frame).
        // The old aspect lock stays dropped — h-full + the lane govern both
        // dimensions, so this card fills the frame exactly like Build's box.
        style={{ width: "clamp(300px, 100cqw, 480px)", borderRadius: "var(--radius-md-alt)", ["--c" as string]: "#3b82f6" }}
      >
        {/* The art itself — full color, uncovered, the dominant element. flex-1
           (not a fixed percentage): the choice panel below sizes to its own
           content instead, so it can never get clipped/cut off if its content
           needs more room on a shorter frame — this just absorbs whatever's left,
           which is still the clear majority of the card once the panel below is
           kept compact. */}
        <div className="relative min-h-0 flex-1">
          {/* sizes mirrors this card's own width clamp below (90cqw capped at 560px) —
             without it next/image assumes 100vw and serves a w=3840 file.
             objectPosition centers on the two presenting characters + the kickoff
             screen (the new scene's subject band sits in the upper-middle of a
             landscape frame; the POV hand at the bottom can crop freely).
             mkt-sim-drift is the slow ambient Ken Burns zoom — see animations.css. */}
          {/* sim-deal-kickoff.jpg is the same asset formerly saved over
             play-illustration.jpg — renamed because same-name image swaps kept
             serving stale cached copies (browser HTTP cache and the optimizer both
             key on the URL; this bit three times this session, including the user
             seeing an old Investment Banking photo on their own machine). Any future
             image REPLACEMENT here should get a fresh filename, not overwrite. */}
          <Image src="/images/sim-deal-kickoff.jpg" alt="" fill sizes="(max-width: 900px) 90vw, 560px" className="mkt-sim-drift object-cover" style={{ objectPosition: "center 35%" }} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: "22%", background: "linear-gradient(180deg, transparent, var(--card) 100%)" }}
          />

          {/* The dopamine hit: a big checkmark burst with a radiating ring, right
             over the scene itself, the instant an option is tapped. Keyed by pick
             so it restarts clean on every tap, including replays after "Try
             again." */}
          {pickedIndex !== null && (
            <div
              key={pickedIndex}
              aria-hidden
              className="pointer-events-none absolute z-[3] flex items-center justify-center"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
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

        {/* The dialogue/choice panel — a real opaque surface, not glass laid over
           the art, so it stays fully legible without needing to dim the scene
           behind it (there's nothing behind it to dim). flex-none (sizes to its
           own content, doesn't get squeezed by the image above it) — per direct
           feedback that all three options need to be visible without any
           scrolling. Font sizes use clamp() (not pure calc(var(--mu)*Npx)) with a
           real minimum, not just a scaled-down one — --mu is a container-query
           value off the frame's own width, which shrinks toward its 1.0 floor on
           a narrow phone, and pure mu-scaled text got uncomfortably small there
           per direct feedback. The floor guarantees readable text on mobile; the
           panel (being flex-none, content-sized) grows a bit to fit that bigger
           text, which is exactly why the image above it — flex-1, absorbing
           whatever's left — ends up proportionally smaller on mobile too, which
           was called out as an acceptable trade explicitly. */}
        <div
          className="relative z-[1] flex flex-none flex-col"
          // Padding/gap shaved slightly (12/13/10/6 -> 10/12/8/5): the panel is
          // flex-none content-sized and the art above absorbs whatever's left, so
          // every pixel trimmed here goes straight to the scene — part of the "image
          // should be immersive and prominent" pass, without dropping any content.
          style={{ padding: "calc(var(--mu) * 10px) calc(var(--mu) * 12px) calc(var(--mu) * 8px)", gap: "calc(var(--mu) * 5px)", background: "var(--card)" }}
        >
          <div>
            <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: "clamp(10px, calc(var(--mu) * 8px), 12px)", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 600 }}>
              Day in the life of an investment banker
            </p>
            {/* Narrator line as a quote bar, not a full bordered bubble — the old
               bubble was a third boxed element stacked between the label and the
               three boxed answer rows, and the pile of borders read as clutter
               (called out directly). A left accent bar says "someone is telling
               you this" with one edge instead of four, and keeps actual boxes
               reserved for the things you can press. Copy unchanged. */}
            <div
              style={{
                marginTop: "calc(var(--mu) * 6px)",
                paddingLeft: "calc(var(--mu) * 10px)",
                borderLeft: "3px solid color-mix(in srgb, #3b82f6 65%, transparent)",
              }}
            >
              <p style={{ fontSize: "clamp(12.5px, calc(var(--mu) * 10px), 15px)", lineHeight: 1.35, fontWeight: 600, color: "var(--foreground)" }}>{SCENARIO.scene}</p>
            </div>
            <p className="font-extrabold" style={{ marginTop: "calc(var(--mu) * 8px)", fontSize: "clamp(14px, calc(var(--mu) * 12px), 18px)", color: "var(--foreground)" }}>
              {SCENARIO.prompt}
            </p>
          </div>

          {/* Choice rows — a leading arrow signals "tap to choose," the
             RPG-dialogue-choice shape, without a lettered badge per direct
             feedback. */}
          <div className="flex flex-col" style={{ gap: "calc(var(--mu) * 5px)" }}>
            {SCENARIO.options.map((option, i) => {
              const isCorrect = i === CORRECT_INDEX;
              const isPicked = pickedIndex === i;
              const isNudge = pickedIndex === null && isCorrect;
              return (
                <button
                  key={option.label}
                  type="button"
                  disabled={pickedIndex !== null || !isCorrect}
                  aria-disabled={!isCorrect}
                  onClick={() => {
                    if (isCorrect) setPickedIndex(i);
                  }}
                  className={`flex items-center rounded-[var(--radius-md-alt)] border text-left transition-all duration-200 ${isNudge ? "mkt-nudge-pulse" : ""} ${isCorrect ? "cursor-pointer" : "cursor-default"}`}
                  style={{
                    padding: "calc(var(--mu) * 7px) calc(var(--mu) * 10px)",
                    gap: "calc(var(--mu) * 8px)",
                    background: isPicked ? "color-mix(in srgb, #3b82f6 30%, var(--glass-surface-2))" : "var(--glass-surface-2)",
                    borderColor: isPicked ? "#3b82f6" : "var(--glass-border)",
                    opacity: pickedIndex === null ? (isCorrect ? 1 : 0.5) : isPicked ? 1 : 0.5,
                  }}
                >
                  <span className="flex-1" style={{ fontSize: "clamp(13px, calc(var(--mu) * 10px), 15px)", fontWeight: 600, color: "#fff" }}>
                    {option.label}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isPicked ? "#3b82f6" : "var(--muted-foreground)"}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: "calc(var(--mu) * 13px)", height: "calc(var(--mu) * 13px)", flex: "none", opacity: isCorrect ? 1 : 0.35 }}
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between" style={{ minHeight: "calc(var(--mu) * 16px)" }}>
            <p style={{ fontSize: "clamp(12px, calc(var(--mu) * 9.5px), 14px)", fontWeight: 700, color: "#7aa4ff" }}>
              {pickedIndex !== null ? SCENARIO.options[pickedIndex].response : ""}
            </p>
            {pickedIndex !== null && (
              <button
                type="button"
                onClick={() => setPickedIndex(null)}
                className="flex flex-none items-center rounded-full border font-semibold"
                style={{
                  gap: "calc(var(--mu) * 4px)",
                  padding: "calc(var(--mu) * 5px) calc(var(--mu) * 10px)",
                  fontSize: "clamp(11px, calc(var(--mu) * 9px), 13px)",
                  background: "var(--glass-surface-2)",
                  borderColor: "var(--glass-border)",
                  color: "#fff",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 10px)", height: "calc(var(--mu) * 10px)" }}>
                  <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                </svg>
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
