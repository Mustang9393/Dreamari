"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";

// v2 experiment: a CRT/VHS terminal scene, rebuilt to match the actual
// "vhs retro style" CodePen reference (codepen.io/creme/pen/aPJwEz) after
// an initial pass read as nothing like it (direct feedback 21 Sept 2026:
// "The crt is bad, nothing like the reference... like an OLD TV"). See
// globals.css's own comment above `@keyframes crt-scanline-roll` for the
// exact values transcribed from that pen's source. Kept BLACK rather than
// the reference's own `#2b52ff` blue, per the earlier, still-standing
// instruction ("instead of a blue screen lets keep it black").
//
// "HUD, UI and everything" reskinned two ways:
// 1. The root wrapper (GlossaryGameExperience.tsx) adds a `play-crt` class
//    only when this version is active; globals.css scopes token overrides
//    under it (font, card fill/border, speech-bubble colors) so the
//    game's existing chrome picks up the terminal look without a
//    per-component rewrite.
// 2. A handful of the game's own headings/HUD text read
//    `var(--crt-glitch-shadow)`/`var(--crt-glitch-anim)` (both `none` by
//    default, only ever defined under `.play-crt`) to get the reference's
//    animated RGB-split glitch text.
const PIXEL_FONT_HREF = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";

export function PlayBackdropV2Crt({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  // "Press Start 2P" only loaded while this experimental version is
  // actually on screen -- never added to the app's own font loading in
  // layout.tsx/marketing/fonts.ts, since v1 (the shipped default) has no
  // use for an 8-bit pixel face.
  useEffect(() => {
    if (document.querySelector(`link[href="${PIXEL_FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = PIXEL_FONT_HREF;
    document.head.appendChild(link);
  }, []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        // Still fundamentally black ("keep it black" is a standing
        // instruction), but carrying real color instead of flat #000 --
        // direct feedback, 21 Sept 2026: "Use a better color & gradient
        // for the background. We want more color than dark." Two tinted
        // glows in the same magenta/cyan pair as the glitch text, so the
        // whole scene reads as one palette rather than a black screen with
        // colored text incidentally floating on it.
        background: [
          "radial-gradient(70% 55% at 18% 12%, rgba(255,0,170,0.22) 0%, transparent 65%)",
          "radial-gradient(65% 50% at 85% 88%, rgba(0,231,255,0.18) 0%, transparent 65%)",
          "#050308",
        ].join(", "),
      }}
    >
      {/* Static -- an SVG-turbulence noise layer whose OPACITY itself
         breathes (the reference's `.noise { animation: opacity 3s linear
         infinite }`), so the static visibly pulses rather than sitting at
         one fixed strength. Painted FIRST (underneath the scanlines) --
         it was on top originally, and its `screen` blend mode washed out
         the scanlines' contrast so the whole thing just read as "a noise
         pulse" with no visible line structure (direct feedback, 21 Sept
         2026: "the crt pixel line shoudl also be more visible, this is
         just a noise pulse"). Slowed and dimmed further per direct
         feedback right after: "The pulsing glow can be slowed down and
         more subtle." */}
      <svg aria-hidden className="absolute inset-0 h-full w-full motion-safe:animate-[crt-noise-flicker_6s_ease-in-out_infinite] mix-blend-screen">
        <filter id="crt-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#crt-noise)" />
      </svg>
      {/* Scanlines -- painted on TOP now, so the hard bands stay crisp
         instead of being screened out by the static beneath them. Alpha
         raised from the reference's own 0.5 to 0.65 for the same reason,
         and the band itself widened from 4px to 8px ("the lines can be
         even more prominent in size"). */}
      <span
        aria-hidden
        className="motion-safe:animate-[crt-scanline-roll_0.4s_linear_infinite] absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 51%)", backgroundSize: "100% 8px" }}
      />
      {/* Curvature vignette -- the tube's own edge falloff, an "old TV"
         cue the reference's own flat CodePen canvas didn't need but a
         full-screen background does, to read as a convex surface. */}
      <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />

      {bloom && (
        <span
          key={bloom.key}
          aria-hidden
          className="motion-safe:animate-[backdrop-bloom_900ms_ease-out_forwards] absolute top-1/2 left-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ "--bloom-peak": bloomPeak, background: `radial-gradient(closest-side, color-mix(in srgb, ${bloomColor} 55%, transparent), transparent 68%)` } as React.CSSProperties}
        />
      )}
    </div>
  );
}
