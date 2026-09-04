"use client";

import type { CSSProperties } from "react";

// A small animated "touch point" that teaches a swipe/drag direction by
// showing it, not describing it -- for spots that used to (or still do)
// explain a gesture in a sentence. A ripple lands where a finger would, then
// one glowing dot travels the gesture's path with a soft trailing echo, rests,
// and repeats. Callers decide when it stops (GestureSpotlight ends it on the
// real gesture).
//
// Deliberately not a licensed/stock hand-cursor asset (see the swipe-*.mp4
// files evaluated for this work -- watermarked IconScout previews, not
// something we can ship) -- this is original, on-brand with the rest of
// the app's glow/motion language (progress spark, confirm shimmer).
//
// The dot's rest position and its travel distance are both derived from
// `distance`, so the whole excursion always fits inside the component's own
// box -- an earlier version centered the dot and let it travel past the
// edges, which spilled into neighboring text once used next to a label.
//
// Timing: one 2.6s cycle -- ripple 0-28%, travel 9-32%, fade by 42%, rest
// until 100% (see globals.css). Anything that wants to move in step with the
// dot (Match's card nudge and stamp preview) uses the same 2.6s. The class
// strings below are written out in full on purpose: Tailwind only generates
// classes it can see whole in source, so no template literals here.
export const GESTURE_HINT_CYCLE_S = 2.6;

export function GestureHint({
  direction,
  color = "var(--foreground)",
  size = 18,
  distance = 30,
  crisp = false,
  className = "",
}: {
  direction: "left" | "right" | "up";
  color?: string;
  size?: number;
  distance?: number;
  /** Ring and dot only, no glow and no trailing echo: a crisp vector mark
   *  for chrome that sits on the page rather than inside a game (the
   *  landing's scroll nudge, direct feedback 4 Sept 2026). */
  crisp?: boolean;
  className?: string;
}) {
  const w = direction === "up" ? size : size + distance;
  const h = direction === "up" ? size + distance : size;
  const dx = direction === "left" ? -distance : direction === "right" ? distance : 0;
  const dy = direction === "up" ? -distance : 0;
  // The dot's REST point (translate 0,0) is the start of the visible
  // travel range: right/up start at the near edge, left starts at the far
  // edge -- so animating by exactly dx/dy always lands on the opposite
  // edge, never past it.
  const restLeft = direction === "left" ? w - size : 0;
  const restTop = direction === "up" ? h - size : (h - size) / 2;
  const style = { "--hint-dx": `${dx}px`, "--hint-dy": `${dy}px` } as CSSProperties;

  return (
    <span aria-hidden className={`relative inline-block flex-none ${className}`} style={{ width: w, height: h }}>
      {/* Touch-down ripple at the rest point. */}
      <span
        className="motion-safe:animate-[gesture-hint-ring_2.6s_ease-out_infinite]"
        style={{
          position: "absolute",
          left: restLeft,
          top: restTop,
          width: size,
          height: size,
          borderRadius: "999px",
          border: `2px solid ${color}`,
          opacity: 0,
        }}
      />
      {/* Trailing echo: same path, offset start (smaller, delayed) so it
         reads as a soft comet tail instead of a second dot appearing. */}
      {!crisp && <span
        className="motion-safe:animate-[gesture-hint-move_2.6s_ease-in-out_infinite]"
        style={{
          ...style,
          position: "absolute",
          left: restLeft + size * 0.19,
          top: restTop + size * 0.19,
          width: size * 0.62,
          height: size * 0.62,
          borderRadius: "999px",
          background: color,
          opacity: 0.35,
          filter: "blur(2px)",
          animationDelay: "0.12s",
        }}
      />}
      <span
        className="motion-safe:animate-[gesture-hint-move_2.6s_ease-in-out_infinite]"
        style={{
          ...style,
          position: "absolute",
          left: restLeft,
          top: restTop,
          width: size,
          height: size,
          borderRadius: "999px",
          background: color,
          boxShadow: crisp ? "none" : `0 0 ${size * 0.7}px 0 color-mix(in srgb, ${color} 70%, transparent)`,
        }}
      />
    </span>
  );
}
