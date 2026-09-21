"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";

// v4 experiment: a retro synthwave grid horizon -- direct request 21 Sept
// 2026, linking a CSS "retro cyberpunk grid synthwave horizon" reference
// (codefronts.com). Rebuilt to match that reference's actual technique and
// palette closely, per direct correction ("the synth one should be exactly
// like its reference, remove the round sun thing in the background and
// apply perspective: make sure the grid colors match the background
// colors"):
// - No sun -- the reference has one, but this was explicitly told to drop
//   it, so the scene is just the sky gradient and the grid.
// - Real perspective: `perspective` + `perspective-origin: 50% 0%` on the
//   parent (vanishing point at the horizon), `rotateX(78deg)` on the floor
//   -- the convergence comes from the 3D projection itself, not a faked
//   taper. The floor animates via `background-position` (a single tiled
//   grid image shifting exactly one cell per loop), the reference's own
//   technique, rather than translating a doubled strip -- simpler, and
//   the seam is guaranteed invisible since the tile repeats exactly.
// - One grid color, not a two-tone cyan/magenta split -- the reference
//   itself only uses one hue for every line. Recolored gold and given a
//   flat dark floor underneath (see the inline comment further down) per
//   later rounds of direct feedback.
export function PlayBackdropV4Synthwave({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  // Recolored from the reference's own magenta to gold, matching the
  // game's own accent (direct feedback, 21 Sept 2026: "Lets color the
  // synth one gold rather than magenta"). Same oklch hue (~75, warm gold)
  // used for the sky's horizon stop, the grid lines, and the horizon glow
  // below, so the whole scene reads as one palette.
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: "#0d0a1f", backgroundImage: "linear-gradient(180deg, oklch(0.1 0.05 292) 0%, oklch(0.72 0.18 75) 100%)" }}
    >
      {/* Night sky stars -- above the horizon line so they never fight the
         grid. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[45%]"
        style={{
          backgroundImage:
            "radial-gradient(1.4px 1.4px at 20% 15%, rgba(255,255,255,0.65), transparent), radial-gradient(1.2px 1.2px at 65% 8%, rgba(255,255,255,0.5), transparent), radial-gradient(1.6px 1.6px at 85% 22%, rgba(255,255,255,0.55), transparent), radial-gradient(1.1px 1.1px at 40% 28%, rgba(255,255,255,0.4), transparent), radial-gradient(1.3px 1.3px at 10% 35%, rgba(255,255,255,0.45), transparent)",
        }}
      />
      {/* The floor -- a single tiled grid, tilted back in real 3D via
         perspective + rotateX so it genuinely converges toward the
         horizon (the vanishing point sits at perspective-origin, the top
         edge of this box, which lines up with the horizon line below). */}
      <div className="absolute inset-x-0 bottom-0 h-[58%]" style={{ perspective: "340px", perspectiveOrigin: "50% 0%" }}>
        {/* The floor briefly went fully transparent (checked against the
           reference's own live demo, which shows its sky straight through
           the grid), then corrected again: "have a darker floor sort of
           color surface with accented gold lines for the gridlines" -- a
           flat dark fill again, but a plain tone rather than a gradient
           that mirrors/"reflects" the sky's own shape, so the gold lines
           read as painted onto a dark floor rather than a mirror. Slowed
           and lightened per an earlier round too ("Slow down and also
           make the synth grid more transparent and thinner"): 4s scroll
           (was 1.4s), 1px lines (was 2px). Recolored gold throughout,
           matching the sky ("Lets color the synth one gold rather than
           magenta"). */}
        <div
          aria-hidden
          className="motion-safe:animate-[synth-grid-scroll_4s_linear_infinite] absolute inset-0"
          style={{
            backgroundColor: "#0d0a14",
            backgroundImage:
              "repeating-linear-gradient(90deg, oklch(0.78 0.18 75 / 0.4) 0 1px, transparent 1px 60px), repeating-linear-gradient(180deg, oklch(0.78 0.18 75 / 0.4) 0 1px, transparent 1px 60px)",
            backgroundSize: "60px 60px",
            transform: "rotateX(78deg)",
            transformOrigin: "50% 0%",
          }}
        />
      </div>

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
