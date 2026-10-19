import React, { useId, type CSSProperties } from "react";
import { DREAMARI_MARK_PATH } from "./college-brand-mark";

/** One look for every school: the same light, the same hall. Kept as a list
 *  for the component lab, which shows each variant. */
export const COLLEGE_ART_VARIANTS = ["hall"] as const;
type Variant = typeof COLLEGE_ART_VARIANTS[number];

/* Colours read through --cp-* so light mode restyles the art from CSS
   (globals.css). Defaults are the dark Black & Blue values (look-v2.css). */
const v = (name: string, dark: string) => `var(--cp-${name}, ${dark})`;
const C = {
  ground: v("ground", "#000105"), ground2: v("ground-2", "#03070f"),
  bloom: v("bloom", "#2780ec"), bloom2: v("bloom-2", "#59a0f8"), core: v("core", "#9ec6fa"), navy: v("navy", "#0b2f5b"),
  line: v("line", "#e2eefd"), line2: v("line-2", "#59a0f8"), mark: v("mark", "#ffffff"),
};
const GRAIN = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

// The light source, behind the dome; the drawing's lines answer to it.
const LX = 400, LY = 170;

/* A low, wide hall drawn as a few joined outlines with soft corners, so no
   line ends near another and nothing reads as a gap. The drum's sides run
   down to meet the pediment's slope exactly (y on the slope at x=340/460). */
const OUTLINE = "M170 470V364Q170 350 184 350H290V310Q290 304 296 301L394 256Q400 253 406 256L504 301Q510 304 510 310V350H616Q630 350 630 364V470Z";
const DOME = "M340 282V238Q340 228 350 228H450Q460 228 460 238V282M352 228A48 48 0 0 1 448 228M392 180V168Q392 162 398 162H402Q408 162 408 168V180";
const INNER = [
  "M290 318H510",                                   // entablature
  "M318 330V456M358 330V456M442 330V456M482 330V456", // columns, a bay left open for the door
  "M386 470V436A14 14 0 0 1 414 436V470",            // door
  "M200 440V398A8 8 0 0 1 216 398V440M244 440V398A8 8 0 0 1 260 398V440", // wing windows
  "M540 440V398A8 8 0 0 1 556 398V440M584 440V398A8 8 0 0 1 600 398V440",
  "M276 484H524M262 498H538",                        // steps
  "M400 162V150",                                    // finial
];

/** Missing-photo art for a college, in the Black & Blue look.
 * History, 19 Oct 2026 (Chandu): a grey line drawing of a campus "does not
 * feel as polished"; after several directions: keep the glow card, drop the
 * orb and Dreamy, and "let the line graphic ... take the glow ... from the
 * background and catch the light". Then "overly detailed", "too narrow",
 * "things look broken", "dont have to make it so sharp along corners", and
 * "let the glow be consistent". So: one fixed light (overlapping soft lobes
 * behind the dome, eased falloff, film grain) on the near-black ground, and a
 * low, wide hall in a few joined, round-cornered lines whose brightness
 * comes from that light (a radial stroke gradient centred on it), the
 * Dreamari mark in the pediment. Gradients only, no blur filters, so the
 * cards' hover zoom stays cheap. Light mode swaps the --cp-* colours. */
export function CollegePlaceholder({ className = "", style }: {
  seed?: string; variant?: Variant; /** kept for callers; colour comes from the theme */ accent?: string; className?: string; style?: CSSProperties;
}) {
  const id = `college-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const url = (name: string) => `url(#${id}-${name})`;
  const stop = (color: string, opacity: number = 1) => ({ stopColor: color, stopOpacity: opacity });
  // Eased falloff: many stops, so a lobe fades like light, not like a CSS spot.
  const soft = (name: string, color: string, peak: number) => <radialGradient id={`${id}-${name}`}>
    {[0, 0.18, 0.36, 0.55, 0.74, 1].map((o, i) => <stop key={o} offset={o} style={stop(color, peak * [1, 0.72, 0.42, 0.2, 0.07, 0][i])} />)}
  </radialGradient>;
  const lines = <><path d={OUTLINE} /><path d={DOME} />{INNER.map(d => <path key={d} d={d} />)}</>;

  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-college-art="hall" className={className} style={{ width: "100%", height: "100%", display: "block", ...style }}>
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

    <rect width="800" height="800" fill={url("ground")} />
    {/* One light, the same on every card: overlapping lobes at different
       angles, so it pools and drifts instead of sitting as one round spot. */}
    <ellipse cx="400" cy="250" rx="560" ry="320" fill={url("wash")} transform="rotate(-10 400 250)" />
    <ellipse cx="520" cy="150" rx="300" ry="160" fill={url("lobe")} transform="rotate(22 520 150)" />
    <ellipse cx="270" cy="230" rx="280" ry="140" fill={url("lobe")} opacity=".6" transform="rotate(-24 270 230)" />
    <ellipse cx="410" cy="175" rx="210" ry="120" fill={url("core")} transform="rotate(-16 410 175)" />
    {/* A darker current under the light gives it shape. */}
    <ellipse cx="440" cy="600" rx="500" ry="180" fill={url("deep")} transform="rotate(6 440 600)" />

    {/* Faint light on the faces turned toward the source. */}
    <path d={`${OUTLINE}M352 228A48 48 0 0 1 448 228Z`} fill={url("face")} />
    <path d="M40 470H760" stroke={url("horizon")} strokeWidth="2" />
    {/* The hall in lines of light: a soft wide pass, then the line itself. */}
    <g fill="none" stroke={url("line")} strokeLinecap="round" strokeLinejoin="round">
      <g strokeWidth="12" opacity=".12">{lines}</g>
      <g strokeWidth="3">{lines}</g>
    </g>
    <circle cx="400" cy="146" r="4" fill={C.line} />
    <g transform="translate(379.7 274.5) scale(1.9)"><path d={DREAMARI_MARK_PATH} fill={C.mark} /></g>

    <rect width="800" height="800" fill={url("grain")} style={{ opacity: "var(--cp-grain, .07)", mixBlendMode: "overlay" } as CSSProperties} />
  </svg>;
}
