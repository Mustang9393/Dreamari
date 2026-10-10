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
  /** warm light for fills under a low value; status text keeps the warning token */
  warm: "var(--gl-warm)",
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

/** Soft colourful light under a curve, the Readiness by Grade look (Chandu,
 *  10 Oct 2026: "i love the readiness by grade graph. Lets see if we can
 *  give that treatment to as many graphs as possible. The colorful aurora
 *  stuff."). A thin wrapper over Atmosphere so every chart that used the
 *  older clipped blobs now drifts through `colors` across its width.
 *  `strength` scales it; `span` fades the shape's own ends. */
export function Aurora({ d, box, colors = [GLOW.indigo, GLOW.blue, GLOW.sky], strength = 1, span, className }: { d: string; box: { x: number; y: number; w: number; h: number }; colors?: string[]; strength?: number; span?: [number, number]; className?: string }) {
  const stops = colors.map((c, i) => ({ at: colors.length === 1 ? 0.5 : i / (colors.length - 1), color: c }));
  return (
    <g style={{ opacity: Math.max(0, Math.min(1, strength)) }} className={className}>
      <Atmosphere d={d} box={box} stops={stops} span={span} floor={box.h > 80} haze={box.h > 80 ? 6 : 3} />
    </g>
  );
}

/** Atmospheric light under a curve (Chandu, 10 Oct 2026: "the area under it
 *  have a gradient sort of colored fill ... more atmospheric"): colour drifts
 *  along the width (`stops`, 0 to 1 across `box`), the light is densest at
 *  the floor and thins toward the line, and a soft haze rises just above the
 *  line, built from stacked, slightly raised copies of the shape rather
 *  than a blur filter. A lit floor line grounds it. `d` is the closed area. */
export function Atmosphere({ d, box, stops, span, haze = 6, floor = true, className }: { d: string; box: { x: number; y: number; w: number; h: number }; stops: { at: number; color: string }[]; /** the x range the shape covers; its ends fade out instead of stopping in a wall */ span?: [number, number]; haze?: number; /** the lit floor line */ floor?: boolean; className?: string }) {
  const id = useUid();
  const { x, y, w, h } = box;
  const fill = `url(#gl-ah-${id})`;
  // blend neighbouring colours through oklab so amber into blue stays
  // vivid instead of passing through grey (sRGB gradients go muddy)
  const sorted = [...stops].sort((a, b) => a.at - b.at);
  const blended = sorted.flatMap((s, i) => i === 0 ? [s] : [{ at: (sorted[i - 1].at + s.at) / 2, color: `color-mix(in oklab, ${sorted[i - 1].color}, ${s.color})` }, s]);
  const [sx0, sx1] = span ?? [x, x + w];
  const fadeW = Math.min(64, (sx1 - sx0) * 0.12);
  return (
    <g className={["gl-atmo", className ?? ""].join(" ")}>
      <defs>
        <linearGradient id={`gl-ah-${id}`} gradientUnits="userSpaceOnUse" x1={x} y1="0" x2={x + w} y2="0">
          {blended.map((s, i) => <stop key={i} offset={`${(Math.max(0, Math.min(1, s.at)) * 100).toFixed(1)}%`} stopColor={s.color} />)}
        </linearGradient>
        <linearGradient id={`gl-av-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1={y - 30} x2="0" y2={y + h}>
          <stop offset="0%" stopColor="#fff" stopOpacity=".18" />
          <stop offset="60%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`gl-am-${id}`} maskUnits="userSpaceOnUse" x={x - 2} y={y - 40} width={w + 4} height={h + 42}>
          <rect x={x - 2} y={y - 40} width={w + 4} height={h + 42} fill={`url(#gl-av-${id})`} />
        </mask>
        <linearGradient id={`gl-ax-${id}`} gradientUnits="userSpaceOnUse" x1={sx0} y1="0" x2={sx1} y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset={`${((fadeW / Math.max(1, sx1 - sx0)) * 100).toFixed(1)}%`} stopColor="#fff" stopOpacity="1" />
          <stop offset={`${(100 - (fadeW / Math.max(1, sx1 - sx0)) * 100).toFixed(1)}%`} stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`gl-amx-${id}`} maskUnits="userSpaceOnUse" x={x - 2} y={y - 40} width={w + 4} height={h + 42}>
          <rect x={x - 2} y={y - 40} width={w + 4} height={h + 42} fill={`url(#gl-ax-${id})`} />
        </mask>
      </defs>
      <g mask={`url(#gl-amx-${id})`}>
        <g mask={`url(#gl-am-${id})`} className="gl-atmo-light">
          {Array.from({ length: haze }, (_, i) => (
            <path key={i} d={d} fill={fill} transform={`translate(0 ${-(i + 1) * 3})`} opacity={0.16 * (1 - i / haze)} />
          ))}
          <path d={d} fill={fill} />
        </g>
      </g>
      {floor && <line x1={sx0} x2={sx1} y1={y + h} y2={y + h} stroke={fill} className="gl-atmo-floor" />}
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
