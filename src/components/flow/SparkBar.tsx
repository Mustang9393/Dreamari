"use client";

import { useEffect, useRef, useState } from "react";
import { ProgressSpark } from "@/components/build/ProgressSpark";

// The Build flow's progress bar, extracted so every bar in the app can have the
// same life: a fill that actually transitions, a hand-drawn spark that sweeps the
// newly-filled span when the value grows, and the fill itself flickering/glowing
// in the SAME color as that spark while it fires. Plain `width: X%` bars had
// none of this (and several had no transition at all) -- see the Sep 2 audit.
//
// Deliberately quiet by default outside Build: `idle` (the occasional unprompted
// flicker) is opt-in, so a screen with several bars (Home's activity cards) never
// has sparks going off at random. Growth still sparks everywhere.
//
// Render output must be deterministic between server and client: `glow` is a
// plain CSS color string used as-is for the resting shadow. Anything that reads
// computed styles (`glowAt`) only runs inside effects, for the spark and the
// flicker -- computing it during render produced a hydration mismatch (server
// hex fallback vs. client computed rgb).

// Bars that live inside a remounting tree (Build's steps) lose their previous
// width on every remount, so `transition-[width]` never has a "from" -- and would
// re-celebrate on Previous. `memoryKey` keeps the last shown percent across
// remounts (module-level, so it survives), only mutated inside the timer that
// actually lands, which keeps it idempotent under StrictMode's double-invoke.
const lastShown = new Map<string, number>();

export function SparkBar({
  percent,
  fill,
  glow,
  glowAt,
  height = 4,
  track = "var(--color-glass-surface-2)",
  min = 0,
  idle = false,
  memoryKey,
  className = "",
}: {
  percent: number;
  /** CSS background for the fill -- a color or a linear-gradient(). */
  fill: string;
  /** Static CSS color for the resting glow, and the spark/flicker color unless
      `glowAt` is given. Must be a plain CSS value (var()/hex/rgb), never a
      computed one -- it's rendered inline on the server too. */
  glow: string;
  /** Client-only: the fill's color at a fraction (0-1), for gradient fills whose
      leading-edge color changes with progress. Used for the spark and flicker
      inside effects only. */
  glowAt?: (fraction: number) => string;
  height?: number;
  track?: string;
  /** Visual floor so the bar never opens on a literally empty track. */
  min?: number;
  /** Occasional unprompted flicker in place, so the bar doesn't read as dead
      between advances. Build only, by default. */
  idle?: boolean;
  memoryKey?: string;
  className?: string;
}) {
  const shown = Math.max(min, Math.min(100, percent));
  const remembered = memoryKey ? lastShown.get(memoryKey) : undefined;
  const [displayPercent, setDisplayPercent] = useState(remembered ?? shown);
  const [comet, setComet] = useState<{ from: number; to: number; nonce: number } | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Read the remembered value fresh on every invoke and only mutate it inside the
    // timer -- a cancelled first run (StrictMode) then leaves nothing behind.
    const from = memoryKey ? (lastShown.get(memoryKey) ?? shown) : displayPercent;
    const growing = shown > from;
    const timer = setTimeout(() => {
      if (memoryKey) lastShown.set(memoryKey, shown);
      setDisplayPercent(shown);
      if (growing) setComet((c) => ({ from, to: shown, nonce: (c?.nonce ?? 0) + 1 }));
    }, 0);
    return () => clearTimeout(timer);
    // displayPercent is intentionally not a dep: it's the "from" snapshot for THIS
    // percent change, not something to re-run on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, memoryKey]);

  useEffect(() => {
    if (!idle) return;
    let timer: ReturnType<typeof setTimeout>;
    function scheduleIdle() {
      // 7-15s: spaced out enough not to read as a loop, per direct feedback.
      timer = setTimeout(() => {
        setComet((c) => ({ from: shown, to: shown, nonce: (c?.nonce ?? 0) + 1 }));
        scheduleIdle();
      }, 7000 + Math.random() * 8000);
    }
    scheduleIdle();
    return () => clearTimeout(timer);
  }, [idle, shown]);

  const restingShadow = `0 0 10px 0 color-mix(in srgb, ${glow} 55%, transparent)`;

  // Client-only (effects/spark): the celebrated point's color.
  const [sparkColor, setSparkColor] = useState<string | null>(null);

  useEffect(() => {
    // The fill flickers in step with the spark (same nonce, same color): an irregular
    // multi-peak brightness + colored-glow run, not one smooth pulse, so it reads as
    // the same electricity rather than a calmer animation sitting next to it. Web
    // Animations API so it restarts cleanly per nonce and reverts to the inline
    // styles when done without any manual reset.
    if (!comet || !fillRef.current) return;
    const glowColor = glowAt ? glowAt(comet.to / 100) : glow;
    const timer = setTimeout(() => setSparkColor(glowColor), 0);
    const glowShadow = (spread: number, blur: number) => `0 0 ${blur}px ${spread}px ${glowColor}`;
    const anim = fillRef.current.animate(
      [
        { filter: "brightness(1) saturate(1)", boxShadow: restingShadow, offset: 0 },
        { filter: "brightness(1.65) saturate(1.4)", boxShadow: glowShadow(4, 24), offset: 0.12 },
        { filter: "brightness(1.1) saturate(1.1)", boxShadow: glowShadow(1, 12), offset: 0.24 },
        { filter: "brightness(1.55) saturate(1.35)", boxShadow: glowShadow(3, 20), offset: 0.4 },
        { filter: "brightness(1.05) saturate(1.05)", boxShadow: glowShadow(1, 10), offset: 0.55 },
        { filter: "brightness(1.4) saturate(1.25)", boxShadow: glowShadow(2, 16), offset: 0.7 },
        { filter: "brightness(1) saturate(1)", boxShadow: restingShadow, offset: 1 },
      ],
      { duration: 700, easing: "ease-out" },
    );
    return () => {
      clearTimeout(timer);
      anim.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comet]);

  return (
    <div ref={trackRef} className={`relative ${className}`}>
      <div className="w-full overflow-hidden rounded-full" style={{ height, background: track }}>
        <div
          ref={fillRef}
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${displayPercent}%`, background: fill, boxShadow: restingShadow }}
        />
      </div>
      {comet && <ProgressSpark key={comet.nonce} trackRef={trackRef} fromPercent={comet.from} toPercent={comet.to} color={sparkColor ?? glow} />}
    </div>
  );
}
