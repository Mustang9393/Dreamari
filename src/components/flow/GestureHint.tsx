"use client";

import type { CSSProperties } from "react";

// A small animated "touch point" that teaches a swipe/drag direction by
// showing it, not describing it -- for spots that used to (or still do)
// explain a gesture in a sentence. One glowing dot travels the gesture's
// path with a soft trailing echo, loops a few times, then either keeps
// looping quietly (for a persistent, low-key affordance) or is left to the
// caller to dismiss (for a first-visit teaching moment).
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

export function GestureHint({
  direction,
  color = "var(--foreground)",
  size = 18,
  distance = 30,
  className = "",
}: {
  direction: "left" | "right" | "up";
  color?: string;
  size?: number;
  distance?: number;
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
      {/* Trailing echo: same path, offset start (smaller, delayed) so it
         reads as a soft comet tail instead of a second dot appearing. */}
      <span
        className="motion-safe:animate-[gesture-hint-move_2.8s_ease-in-out_infinite]"
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
      />
      <span
        className="motion-safe:animate-[gesture-hint-move_2.8s_ease-in-out_infinite]"
        style={{
          ...style,
          position: "absolute",
          left: restLeft,
          top: restTop,
          width: size,
          height: size,
          borderRadius: "999px",
          background: color,
          boxShadow: `0 0 ${size * 0.7}px 0 color-mix(in srgb, ${color} 70%, transparent)`,
        }}
      />
    </span>
  );
}
