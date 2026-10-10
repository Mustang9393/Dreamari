"use client";

// WHY (10 Oct 2026, Chandu): "the logins by month graph is good but i think
// we can do better with the material treatment, think more light, glow?"
// with references (neon tube lines ending in a lit orb, aurora gradient
// fills, Sankey ribbons that glow at their nodes), then "GIVE ALL GRAPHS
// THIS SORT OF VISUAL UPGRADE". One shared kit so every chart in Milestones
// and Insights wears the same light, instead of each file inventing its own:
//   - GlowStroke: a line drawn as a lit tube: stacked soft strokes for the
//     bloom, the series stroke, then a thin hot core.
//   - Orb: a lit bead for the point that matters (latest, selected, peak).
//   - Aurora: an area or ribbon filled with soft overlapping light, clipped
//     to its shape, fading to nothing at the floor.
//   - LightGrid: hairline verticals that fade out at both ends.
// No SVG blur filters anywhere: bloom is stacked strokes and radial
// gradients, so animated charts stay cheap on Chromebooks
// (CROSS_BROWSER_GUARDRAILS.md, Glossary Lab perf lesson). Light mode turns
// the bloom almost off and keeps the bright core, so nothing goes muddy on a
// pale surface (the My Impact cover note: "the blue glow ... is sort of bad on
// light mode"). Strength lives in glow.css tokens (--gl-*).

import { useId } from "react";
import "./glow.css";

/** Blue-family light, in token form so both themes tune it in CSS. */
export const GLOW = {
  blue: "var(--gl-blue)",
  sky: "var(--gl-sky)",
  indigo: "var(--gl-indigo)",
  hot: "var(--gl-hot)",
} as const;

/** useId without the colons SVG ids dislike. */
function useUid() {
  return useId().replace(/:/g, "");
}

/** A line drawn as a lit tube. `from` fades the start in, so the line reads
 *  as travelling toward its latest value. */
export function GlowStroke({ d, color = GLOW.blue, width = 2.5, from = 0.45, quiet, className }: { d: string; color?: string; width?: number; from?: number; quiet?: boolean; className?: string }) {
  const id = useUid();
  const common = { d, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g className={["gl-stroke", quiet ? "is-quiet" : "", className ?? ""].join(" ")} style={{ ["--gl-c" as string]: color }}>
      <defs>
        <linearGradient id={`gl-s-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={from} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path {...common} className="gl-bloom gl-b3" strokeWidth={width * 8} />
      <path {...common} className="gl-bloom gl-b2" strokeWidth={width * 4} />
      <path {...common} className="gl-bloom gl-b1" strokeWidth={width * 2} />
      {/* a solid base under the gradient: an objectBoundingBox gradient
         paints nothing on a perfectly straight horizontal or vertical path */}
      <path {...common} stroke={color} strokeOpacity={from} strokeWidth={width} />
      <path {...common} stroke={`url(#gl-s-${id})`} strokeWidth={width} />
      <path {...common} className="gl-core" strokeWidth={Math.max(0.8, width * 0.36)} />
    </g>
  );
}

/** A point of light: a white-hot centre that falls off into the series
 *  colour and then into a soft halo. Emissive and flat: no off-centre
 *  highlight, no rim, no shadow ("I want them to be made of LIGHT", not a
 *  3D solid bead). */
export function Orb({ cx, cy, r = 6, color = GLOW.blue, pulse, className }: { cx: number; cy: number; r?: number; color?: string; pulse?: boolean; className?: string }) {
  const id = useUid();
  return (
    <g className={["gl-orb", className ?? ""].join(" ")}>
      <defs>
        <radialGradient id={`gl-oh-${id}`}>
          <stop offset="0%" stopColor={color} stopOpacity=".6" />
          <stop offset="30%" stopColor={color} stopOpacity=".2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gl-ob-${id}`}>
          {/* white-hot in dark; in light a saturated core, or it reads hollow */}
          <stop offset="0%" stopColor={`color-mix(in srgb, ${color} var(--gl-orb-core), white)`} />
          <stop offset="45%" stopColor={`color-mix(in srgb, ${color} calc(var(--gl-orb-core) + 40%), white)`} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 7} fill={`url(#gl-oh-${id})`} className="gl-orb-halo" />
      {pulse && <circle cx={cx} cy={cy} r={r} fill={color} className="gl-orb-pulse" />}
      <circle cx={cx} cy={cy} r={r} fill={`url(#gl-ob-${id})`} className="gl-orb-body" />
    </g>
  );
}

/** Soft overlapping light, clipped to `d`, fading toward the floor.
 *  `box` is the plot area the light spreads across. */
export function Aurora({ d, box, colors = [GLOW.blue, GLOW.sky, GLOW.indigo], strength = 1, className }: { d: string; box: { x: number; y: number; w: number; h: number }; colors?: string[]; strength?: number; className?: string }) {
  const id = useUid();
  const { x, y, w, h } = box;
  // Blobs sit along the width, heaviest toward the latest values (right).
  const blobs = colors.map((c, i) => ({ c, cx: x + w * (0.18 + (i / Math.max(1, colors.length - 1)) * 0.7), r: w * (0.32 + i * 0.04) }));
  return (
    <g className={["gl-aurora", className ?? ""].join(" ")} style={{ ["--gl-k" as string]: String(strength) }}>
      <defs>
        <clipPath id={`gl-ac-${id}`}><path d={d} /></clipPath>
        <linearGradient id={`gl-af-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </linearGradient>
        <mask id={`gl-am-${id}`} maskContentUnits="userSpaceOnUse">
          <rect x={x} y={y} width={w} height={h} fill="#fff" />
          <rect x={x} y={y} width={w} height={h} fill={`url(#gl-af-${id})`} />
        </mask>
        {blobs.map((b, i) => (
          <radialGradient key={i} id={`gl-ab-${id}-${i}`}>
            <stop offset="0%" stopColor={b.c} stopOpacity=".9" />
            <stop offset="100%" stopColor={b.c} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <g clipPath={`url(#gl-ac-${id})`} mask={`url(#gl-am-${id})`}>
        <rect x={x} y={y} width={w} height={h} className="gl-aurora-base" />
        {blobs.map((b, i) => (
          <ellipse key={i} cx={b.cx} cy={y + h * 0.15} rx={b.r} ry={h * 0.9} fill={`url(#gl-ab-${id}-${i})`} className="gl-aurora-blob" />
        ))}
      </g>
    </g>
  );
}

/** Hairline verticals that fade out at both ends. */
export function LightGrid({ xs, top, bottom }: { xs: number[]; top: number; bottom: number }) {
  const id = useUid();
  return (
    <g className="gl-grid" aria-hidden>
      <defs>
        <linearGradient id={`gl-g-${id}`} x1="0" y1={top} x2="0" y2={bottom} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity=".2" />
        </linearGradient>
      </defs>
      {xs.map((x) => <line key={x} x1={x} x2={x} y1={top} y2={bottom} stroke={`url(#gl-g-${id})`} />)}
    </g>
  );
}
