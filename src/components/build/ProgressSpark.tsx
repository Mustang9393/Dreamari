"use client";

import type { RefObject } from "react";
import { useEffect, useId, useRef, useState } from "react";

// The reference (studied frame-by-frame, not guessed at) isn't a small icon riding the
// bar's tip -- it's a loose, hand-drawn-looking scribble that sweeps across the WHOLE
// filled span, redrawing itself into a different squiggle a couple of times before
// fading. A vector icon reads as flat/generic next to that; this instead generates a
// jittered bezier path at random each time (same "randomize a few control points"
// technique, at trigger time since this is a one-off celebration, not a persistent
// asset that needs to look the same twice) and draws it on with the classic SVG
// stroke-dasharray/dashoffset technique, which is what actually produces the "being
// drawn" motion a real marker-scribble has.

// Matches the spark's color to the bar's OWN gradient at the point it's celebrating,
// rather than a fixed color unrelated to whatever the bar looks like on this step --
// reads the same three tokens the bar's own linear-gradient uses (live, via
// getComputedStyle, so it's correct in both themes and if the tokens ever change)
// and interpolates them the same way a CSS linear-gradient would at that fraction.
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return [r, g, b];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// Exported so PhaseProgress can drive the bar's OWN pulse off the exact same color the
// spark uses -- congruent, not just "the bar's normal gradient, brighter."
export function barGradientColorAt(fraction: number): string {
  const fallback: [string, string, string] = ["#4767f3", "#8b5cf6", "#ff4585"];
  const names = ["--color-brand-500", "--color-accent-purple", "--color-world-arts-media-sport"];
  const cs = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const [c1, c2, c3] = names.map((name, i) => hexToRgb(cs?.getPropertyValue(name) || "") ?? hexToRgb(fallback[i])!);
  const f = Math.min(1, Math.max(0, fraction));
  return f <= 0.5 ? mix(c1, c2, f / 0.5) : mix(c2, c3, (f - 0.5) / 0.5);
}

function jitterPath(width: number, height: number): string {
  // Compact, angular "charge-up" zigzag -- sharp straight segments, not a flowing
  // curve, and a small vertical swing relative to the available height (per direct
  // feedback: the earlier multi-loop bezier scribble read as busy and traveled too
  // much of the bar's height; this stays close to the centerline). Length can still
  // span the full width -- only the shape's complexity and vertical reach shrink.
  // Per direct feedback, the simplicity is right but it shouldn't be the SAME zigzag
  // every time: turn count, spacing, amplitude, and the up/down sequence itself all
  // vary now, while staying capped at a handful of turns so it never drifts back
  // toward the busier scribble this replaced.
  const amplitude = height * 0.32;
  const midY = height / 2;
  const turns = 2 + Math.floor(Math.random() * 3); // 2-4 direction changes
  const pts: [number, number][] = [[0, midY]];
  // Break-in-two-then-jitter for the X spacing (not perfectly even steps), and a
  // fresh random up/down sign per turn (not a strict alternation) -- both keep the
  // silhouette different call to call without adding more turns.
  let lastDir = Math.random() < 0.5 ? 1 : -1;
  for (let i = 1; i <= turns; i++) {
    const evenX = (i / turns) * width;
    const x = i === turns ? evenX : evenX + (Math.random() - 0.5) * (width / turns) * 0.5;
    const dir = Math.random() < 0.35 ? lastDir : -lastDir;
    lastDir = dir;
    const y = midY + dir * amplitude * (0.55 + Math.random() * 0.6);
    pts.push([x, y]);
  }
  pts.push([width, midY]);
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

function ScribbleStroke({
  d,
  delayMs,
  durationMs,
  color,
  gradientId,
}: {
  d: string;
  delayMs: number;
  durationMs: number;
  color: string;
  gradientId: string;
}) {
  const ref = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // getTotalLength() needs the real rendered path, so the draw-on distance is
    // measured, not guessed -- and driven via the Web Animations API rather than a
    // static CSS @keyframes, since the length (and so the dashoffset start point) is
    // different every time a fresh squiggle is generated.
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    const anim = el.animate(
      [
        { strokeDashoffset: len, opacity: 1, offset: 0 },
        { strokeDashoffset: 0, opacity: 1, offset: 0.6 },
        { strokeDashoffset: 0, opacity: 0, offset: 1 },
      ],
      { duration: durationMs, delay: delayMs, easing: "ease-out", fill: "forwards" },
    );
    return () => anim.cancel();
  }, [d, delayMs, durationMs]);

  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0, filter: `drop-shadow(0 0 4px ${color})` }}
    />
  );
}

export function ProgressSpark({
  trackRef,
  fromPercent,
  toPercent,
  color: colorOverride,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  fromPercent: number;
  toPercent: number;
  /** The bar's own color at the celebrated point. Non-Build bars (SparkBar) pass
      theirs; left out, this falls back to Build's three-stop gradient. */
  color?: string;
}) {
  const height = 26;
  // Measuring the track's real pixel width -- and generating the jittered squiggle
  // paths, which need that real width to jitter around -- both have to happen in an
  // effect, not during render (reading a ref's .current while rendering is a React
  // rule violation; a lazy useState initializer would only run once, before the real
  // width is known, and never re-run when it is).
  const [ready, setReady] = useState<{ leftPx: number; widthPx: number; paths: [string, string] } | null>(null);
  useEffect(() => {
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 0;
    const widthPx = Math.max(24, ((toPercent - fromPercent) / 100) * trackWidth);
    setReady({
      leftPx: (fromPercent / 100) * trackWidth,
      widthPx,
      paths: [jitterPath(widthPx, height), jitterPath(widthPx, height)],
    });
  }, [trackRef, fromPercent, toPercent]);

  const gradientId = useId();

  if (!ready) return null;
  const { leftPx, widthPx: w, paths } = ready;
  const color = colorOverride ?? barGradientColorAt(toPercent / 100);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute top-1/2 -translate-y-1/2 overflow-visible"
      style={{ left: leftPx, width: w, height }}
      viewBox={`0 0 ${w} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor="#fff7d6" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <ScribbleStroke d={paths[0]} delayMs={0} durationMs={620} color={color} gradientId={gradientId} />
      <ScribbleStroke d={paths[1]} delayMs={220} durationMs={620} color={color} gradientId={gradientId} />
    </svg>
  );
}
