import React, { useId, type CSSProperties } from "react";
import { DREAMARI_MARK_PATH } from "@/components/colleges/college-brand-mark";

/* Colours read through --cp-* so light mode restyles the art from CSS
   (globals.css, [data-glow-art]). Defaults are the dark Black & Blue values
   (look-v2.css). */
const v = (name: string, dark: string) => `var(--cp-${name}, ${dark})`;
const C = {
  ground: v("ground", "#000105"), ground2: v("ground-2", "#03070f"),
  bloom: v("bloom", "#2780ec"), bloom2: v("bloom-2", "#59a0f8"), core: v("core", "#9ec6fa"), navy: v("navy", "#0b2f5b"),
  line: v("line", "#e2eefd"), line2: v("line-2", "#59a0f8"), mark: v("mark", "#ffffff"),
};
const GRAIN = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

// The light source, top centre; every drawing's lines answer to it.
const LX = 400, LY = 170;

export type GlowLineArtProps = {
  className?: string; style?: CSSProperties;
  /** keep the dark art in light mode, for cards that stay dark with white text (About Me's goal cards) */ dark?: boolean;
  /** short, wide cards: frame on the upper part of the drawing, so the slice crop keeps it and a title can sit over the base */ wide?: boolean;
};

/** Missing-picture art in the Black & Blue look: one fixed light (overlapping
 * soft lobes, eased falloff, film grain) on the near-black ground, and a
 * drawing in a few joined, round-cornered lines whose brightness comes from
 * that light (a radial stroke gradient centred on it). Used by the school
 * hall (CollegePlaceholder); kept separate so another drawing can share the
 * same light. (A career summit was tried and dropped, 19 Oct 2026: "careers
 * will have images for sure. Lets only do the schools.")
 * Gradients only, no blur filters, so card hover zooms stay cheap. Strokes
 * are ordinary: `vector-effect: non-scaling-stroke` made Chrome map the
 * gradient in screen space and parts of the drawing dropped out. */
export function GlowLineArt({ name, lines, faces, mark, dot, className = "", style, dark = false, wide = false }: GlowLineArtProps & {
  /** data-glow-art value, for tests and the component lab */ name: string;
  /** the drawing: path data, each one a joined outline */ lines: string[];
  /** closed shapes that catch a faint wash of the light */ faces: string;
  /** where the Dreamari mark sits: translate x, y and scale */ mark: [number, number, number];
  /** a small lit dot (a finial, a flag tip): cx, cy */ dot?: [number, number];
}) {
  const id = `glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const url = (n: string) => `url(#${id}-${n})`;
  const stop = (color: string, opacity: number = 1) => ({ stopColor: color, stopOpacity: opacity });
  // Eased falloff: many stops, so a lobe fades like light, not like a CSS spot.
  const soft = (n: string, color: string, peak: number) => <radialGradient id={`${id}-${n}`}>
    {[0, 0.18, 0.36, 0.55, 0.74, 1].map((o, i) => <stop key={o} offset={o} style={stop(color, peak * [1, 0.72, 0.42, 0.2, 0.07, 0][i])} />)}
  </radialGradient>;
  const drawing = <>{lines.map((d) => <path key={d} d={d} />)}</>;

  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={wide ? "0 -110 800 800" : "0 0 800 800"} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-glow-art={name} data-cp-dark={dark || undefined} className={className} style={{ width: "100%", height: "100%", display: "block", ...style }}>
    <defs>
      <linearGradient id={`${id}-ground`} x2="0" y2="1"><stop style={stop(C.ground)} /><stop offset="1" style={stop(C.ground2)} /></linearGradient>
      {soft("wash", C.bloom, 0.75)}
      {soft("lobe", C.bloom2, 0.6)}
      {soft("core", C.core, 0.85)}
      {soft("deep", C.navy, 0.9)}
      <radialGradient id={`${id}-line`} gradientUnits="userSpaceOnUse" cx={LX} cy={LY} r="460">
        <stop style={stop(C.line)} /><stop offset=".32" style={stop(C.line, 0.9)} /><stop offset=".65" style={stop(C.line2, 0.6)} /><stop offset="1" style={stop(C.line2, 0.25)} />
      </radialGradient>
      <radialGradient id={`${id}-face`} gradientUnits="userSpaceOnUse" cx={LX} cy={LY} r="340">
        <stop style={stop(C.core, 0.16)} /><stop offset=".5" style={stop(C.bloom2, 0.06)} /><stop offset="1" style={stop(C.bloom2, 0)} />
      </radialGradient>
      <linearGradient id={`${id}-horizon`} x2="1"><stop style={stop(C.core, 0)} /><stop offset=".5" style={stop(C.core, 0.45)} /><stop offset="1" style={stop(C.core, 0)} /></linearGradient>
      <pattern id={`${id}-grain`} width="160" height="160" patternUnits="userSpaceOnUse"><image href={GRAIN} width="160" height="160" /></pattern>
    </defs>

    <rect x="0" y="-110" width="800" height="910" fill={url("ground")} />
    {/* One light, the same on every card, symmetric about the centre line
       (Chandu: the earlier lobes "lean to a side ... a little inclined"):
       a wide wash, a mirrored pair of side lobes so it still pools softly
       instead of sitting as one round spot, and a pale core behind the top. */}
    <ellipse cx="400" cy="240" rx="560" ry="320" fill={url("wash")} />
    <ellipse cx="310" cy="200" rx="280" ry="160" fill={url("lobe")} opacity=".45" transform="rotate(-14 310 200)" />
    <ellipse cx="490" cy="200" rx="280" ry="160" fill={url("lobe")} opacity=".45" transform="rotate(14 490 200)" />
    <ellipse cx="400" cy="170" rx="220" ry="120" fill={url("core")} />
    {/* A darker current under the light gives it shape. */}
    <ellipse cx="400" cy="600" rx="520" ry="180" fill={url("deep")} />

    <path d={faces} fill={url("face")} />
    <path d="M40 470H760" stroke={url("horizon")} strokeWidth="2" />
    {/* The drawing in lines of light: a soft wide pass, then the line itself. */}
    <g fill="none" stroke={url("line")} strokeLinecap="round" strokeLinejoin="round">
      <g strokeWidth="12" opacity=".12">{drawing}</g>
      <g strokeWidth="3">{drawing}</g>
    </g>
    {dot && <circle cx={dot[0]} cy={dot[1]} r="4" fill={C.line} />}
    <g transform={`translate(${mark[0]} ${mark[1]}) scale(${mark[2]})`}><path d={DREAMARI_MARK_PATH} fill={C.mark} /></g>

    <rect x="0" y="-110" width="800" height="910" fill={url("grain")} style={{ opacity: "var(--cp-grain, .07)", mixBlendMode: "overlay" } as CSSProperties} />
  </svg>;
}
