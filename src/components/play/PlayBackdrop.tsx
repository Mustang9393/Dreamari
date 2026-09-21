"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";
import { PlayStarfield } from "./PlayStarfield";

// Play's own background -- deliberately NOT AppBackdrop (direct feedback,
// Joshua Pierce via Slack, 21 Sept 2026: "it shouldn't have a similar
// background color as the Explore/my profile etc, it'll feel redundant...
// when playing a game it should feel like we are entering a new world,
// similar to how the career simulations are extremely immersive... the
// change of color will spike the neurological pleasure reward"). Same base
// structure as AppBackdrop (radial wash + linear base + the app's own
// starfield, fixed to the viewport), but swaps --hero-accent-teal for
// --hero-accent-pink -- the design system's own third "hero accent" token
// (marketing/tokens.css), already defined but unused until now, so this is
// a real token-system color, not an invented one or a copy of the Replit
// reference's palette (direct instruction: "not a direct replication of the
// Replit's colors"). A very faint diagonal hairline texture rides on top.
//
// Two more things layer on top of that static wash, per a second round of
// direct feedback ("I think we're still using our old background... let's
// be creative, have some animations, like a moving gradient or interactive
// feedback animations that also reflect in the background"):
// 1. Two soft glow blobs drift slowly and continuously (`backdrop-drift-a/b`
//    in globals.css) -- the "moving gradient" ask, `motion-safe` so it
//    respects prefers-reduced-motion like every other animation in the app.
// 2. `onPlayPulse` (backdropPulse.ts) lets a game moment -- a correct
//    answer, a term unlocked, a lesson finished -- bloom a brief radial
//    flash from the CENTER of the screen, so the reward reads in the
//    background itself, not just on the card. `accent` lets the caller pass
//    the career's own `--glossary-accent` so the bloom matches whatever's
//    already glowing on the card, rather than a fixed color unrelated to
//    the term the student just got right.
export function PlayBackdrop({ accent }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent ?? "var(--hero-accent-pink)";
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: [
          "radial-gradient(120% 85% at 88% -12%, color-mix(in srgb, var(--hero-accent-purple) var(--backdrop-wash-1, 50%), transparent), transparent 58%)",
          "radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-2, 26%), transparent), transparent 60%)",
          "radial-gradient(90% 60% at 60% 55%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-3, 12%), transparent), transparent 62%)",
          "radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-4, 46%), transparent), transparent 62%)",
          "linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) var(--backdrop-wash-5, 14%), var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-6, 20%), var(--background)) 100%)",
        ].join(", "),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 16px)" }}
      />
      {/* A genuinely animated star layer on top of the static nebula art --
         each star twinkles on its own cycle, and the whole field drifts a
         few px against the pointer (direct feedback, 21 Sept 2026: "let's
         be creative, have some animations... interactive"). */}
      <PlayStarfield />

      {/* The moving gradient: two soft blobs, slow independent drift, never
         still. Sized well past the viewport so the drift never reveals a
         hard edge. */}
      <span
        aria-hidden
        className="motion-safe:animate-[backdrop-drift-a_24s_ease-in-out_infinite] absolute -top-[20%] -left-[10%] h-[70%] w-[70%] rounded-full"
        style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent ?? "var(--hero-accent-pink)"} 20%, transparent), transparent 72%)`, filter: "blur(40px)" }}
      />
      <span
        aria-hidden
        className="motion-safe:animate-[backdrop-drift-b_30s_ease-in-out_infinite] absolute -right-[15%] -bottom-[15%] h-[75%] w-[75%] rounded-full"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--hero-accent-purple) 16%, transparent), transparent 72%)", filter: "blur(40px)" }}
      />

      {/* The feedback bloom -- re-keyed on every pulse so the CSS animation
         restarts even for the same kind fired twice in a row. */}
      {bloom && (
        <span
          key={bloom.key}
          aria-hidden
          className="motion-safe:animate-[backdrop-bloom_900ms_ease-out] absolute top-1/2 left-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ "--bloom-peak": bloomPeak, background: `radial-gradient(closest-side, color-mix(in srgb, ${bloomColor} 55%, transparent), transparent 68%)` } as React.CSSProperties}
        />
      )}
    </div>
  );
}
