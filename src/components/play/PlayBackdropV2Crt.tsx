"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";

// v2 experiment: a CRT/VHS terminal scene -- direct request 21 Sept 2026
// ("try the CRT and match UI, cards, fonts, etc to go along with that one.
// I had sent the link a while ago" -- the earlier "vhs retro style" CodePen
// reference: scanlines, TV static noise, an intro-style vignette). Kept
// BLACK rather than the reference's blue tint, per that same earlier
// instruction ("instead of a blue screen lets keep it black so its not
// that distracting"), and recolored to the game's own gold accent as the
// phosphor color -- "color match to compliment the background" -- rather
// than the classic green terminal, so it still reads as Finance's own
// scene, not a generic retro effect.
//
// "Match UI, cards, fonts" is handled without touching every component:
// the root wrapper (GlossaryGameExperience.tsx) adds a `play-crt` class
// only when this version is active, and globals.css scopes a handful of
// token overrides under it (`--font-display` -> a monospace terminal face,
// `--card`/`--glass-border` -> near-black with an amber phosphor edge).
// Every card/heading in the game already reads those same tokens, so this
// reskins the whole game's chrome from one small, reversible CSS block
// instead of a per-component rewrite.
export function PlayBackdropV2Crt({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "#030302" }}>
      {/* A faint phosphor wash so pure black still reads as "lit", not off. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: `radial-gradient(60% 50% at 50% 40%, color-mix(in srgb, ${accent} 10%, transparent), transparent 70%)` }}
      />
      {/* Scanlines -- a repeating horizontal hairline pattern, the single
         most recognizable CRT cue. */}
      <span aria-hidden className="absolute inset-0" style={{ background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 2px, transparent 3px)" }} />
      {/* TV static -- a turbulence-filtered noise layer, animated by
         stepping its seed so it reads as live static rather than a
         printed texture. */}
      <svg aria-hidden className="absolute inset-0 h-full w-full motion-safe:animate-[crt-static_0.4s_steps(2)_infinite] opacity-[0.05] mix-blend-screen">
        <filter id="crt-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#crt-noise)" />
      </svg>
      {/* Curvature vignette -- the tube's own edge falloff, darkest at the
         corners, so the screen reads as a convex surface, not a flat panel. */}
      <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
      {/* A slow, barely-there brightness flicker -- CRTs are never perfectly
         steady. */}
      <span aria-hidden className="motion-safe:animate-[crt-flicker_6s_ease-in-out_infinite] absolute inset-0" style={{ background: `color-mix(in srgb, ${accent} 4%, transparent)` }} />

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
