"use client";

import { useEffect, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";

// v4 experiment: a retro synthwave grid horizon -- direct request 21 Sept
// 2026, linking a CSS "retro cyberpunk grid synthwave horizon" reference
// (codefronts.com). Same three ingredients as that style of effect: a
// night-sky gradient, a striped sun sitting on the horizon, and a receding
// perspective grid floor (`transform: perspective() rotateX()` on a
// repeating grid, not a canvas). Recolored so the sun reads in the game's
// own gold accent instead of the classic hot-pink synthwave sun --
// "color match to compliment the background" -- with the grid kept in a
// cooler magenta/cyan pair for the genre's usual warm/cool contrast.
export function PlayBackdropV4Synthwave({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0518 0%, #170a2e 45%, #2c0f3a 68%, #170a2e 100%)" }}>
      {/* Night sky stars -- a cheap fixed dot texture, well above the
         horizon line so it never fights the grid. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(1.4px 1.4px at 20% 15%, rgba(255,255,255,0.65), transparent), radial-gradient(1.2px 1.2px at 65% 8%, rgba(255,255,255,0.5), transparent), radial-gradient(1.6px 1.6px at 85% 22%, rgba(255,255,255,0.55), transparent), radial-gradient(1.1px 1.1px at 40% 28%, rgba(255,255,255,0.4), transparent), radial-gradient(1.3px 1.3px at 10% 35%, rgba(255,255,255,0.45), transparent)",
          backgroundSize: "100% 50%",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* The sun -- horizontal slices near the bottom read as "cut" by the
         grid, the classic synthwave sun silhouette. */}
      <span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: "30%",
          width: "46vmax",
          height: "46vmax",
          background: `linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 60%, #ff3d9a) 55%, color-mix(in srgb, ${accent} 30%, #ff3d9a) 100%)`,
          boxShadow: `0 0 120px color-mix(in srgb, ${accent} 55%, transparent)`,
          maskImage: "repeating-linear-gradient(180deg, #000 0 3%, transparent 3% 4.6%)",
          WebkitMaskImage: "repeating-linear-gradient(180deg, #000 0 3%, transparent 3% 4.6%)",
        }}
      />
      {/* Horizon glow -- softens the seam where the sun meets the grid. */}
      <span aria-hidden className="absolute inset-x-0 bottom-[38%] h-[18%]" style={{ background: `linear-gradient(180deg, transparent, color-mix(in srgb, ${accent} 45%, transparent))`, filter: "blur(18px)" }} />
      {/* The floor -- a perspective grid, tilted back via rotateX so the
         lines recede to a vanishing point instead of sitting flat. */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] overflow-hidden" style={{ perspective: "300px", perspectiveOrigin: "50% 0%" }}>
        <div
          aria-hidden
          className="motion-safe:animate-[synth-grid-scroll_2.4s_linear_infinite] absolute inset-x-[-50%] top-0 h-[220%]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(45,212,191,0.55) 0 2px, transparent 2px 64px), repeating-linear-gradient(180deg, rgba(255,61,154,0.5) 0 2px, transparent 2px 64px)",
            transform: "rotateX(78deg)",
            transformOrigin: "50% 0%",
          }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: "linear-gradient(180deg, transparent, #170a2e 85%)" }} />

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
