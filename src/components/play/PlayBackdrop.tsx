"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";

// Play's own background -- deliberately NOT AppBackdrop (direct feedback,
// Joshua Pierce via Slack, 21 Sept 2026: "it shouldn't have a similar
// background color as the Explore/my profile etc, it'll feel redundant...
// when playing a game it should feel like we are entering a new world").
//
// The stable checkpoint's fixed teal-to-violet gradient was itself still
// "the same blue/purple thing" every other screen leans on (direct feedback,
// 21 Sept 2026: "Try other color combinations that work with the career
// world UI. We can be brighter"). So instead of a fixed palette, the wash is
// now built FROM the playing career's own world color (`accent`, e.g. the
// amber Finance already uses for every CTA/progress bar in this game) --
// a true duotone (a dark, desaturated shade of that same hue as the base,
// the vivid accent itself as bright glows), so it automatically harmonizes
// with whatever career is being played instead of one fixed hue family that
// only works for some of them. `accent` isn't optional in practice (every
// call site passes the career's world color) but keeps a safe amber
// fallback for correctness.
//
// The canvas Vortex work (`src/components/ui/vortex.tsx`, adapted from
// Aceternity's component) is left in place, unused, for when that
// experiment resumes -- not deleted.
//
// `onPlayPulse` (backdropPulse.ts) still lets a game moment -- a correct
// answer, a term unlocked, a lesson finished -- bloom a brief radial flash
// from the center of the screen on top of the wash, so the reward reads in
// the background itself, not just on the card.
export function PlayBackdrop({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: [
          // Two bright glows in the career's own accent -- asymmetric, not
          // one centered radial, and vivid ("we can be brighter") rather
          // than the low-opacity washes tried earlier today.
          `radial-gradient(95% 75% at 12% -8%, color-mix(in srgb, ${accent} 62%, transparent) 0%, transparent 58%)`,
          `radial-gradient(85% 70% at 105% 105%, color-mix(in srgb, ${accent} 42%, transparent) 0%, transparent 55%)`,
          // A dark, same-hue floor -- a true duotone of the one accent
          // rather than an unrelated blue/purple pair, so it never clashes
          // with the career's own UI color no matter which world it is.
          `linear-gradient(160deg, color-mix(in srgb, ${accent} 20%, #150d08) 0%, #100a10 48%, color-mix(in srgb, ${accent} 26%, #150d08) 100%)`,
        ].join(", "),
      }}
    >
      {bloom && (
        <span
          key={bloom.key}
          aria-hidden
          // `forwards` is load-bearing: without it, the moment the 900ms
          // animation ends the element reverts to CSS's default opacity (1,
          // fully visible) instead of holding the keyframe's own faded-out
          // end state -- a sharp, stuck, fully-opaque circle right after
          // every correct answer (direct feedback, 21 Sept 2026: "the sharp
          // round blob that appears after right answer is bad... let the
          // pulse stay and then fade away thats all, no color blobs
          // accumulating"). `forwards` keeps it pinned at opacity 0 once the
          // fade finishes, so nothing lingers between pulses.
          className="motion-safe:animate-[backdrop-bloom_900ms_ease-out_forwards] absolute top-1/2 left-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ "--bloom-peak": bloomPeak, background: `radial-gradient(closest-side, color-mix(in srgb, ${bloomColor} 55%, transparent), transparent 68%)` } as React.CSSProperties}
        />
      )}
    </div>
  );
}
