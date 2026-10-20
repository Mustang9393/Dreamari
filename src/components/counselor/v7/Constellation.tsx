"use client";

// A hero card's hover (20 Oct 2026; Chandu: "better hover states for the hero
// cards? maybe some stars align into a constellation or something? Subtly
// but there? More magical", then "keep them more off frame bottom right, but
// better stars, not flat dots and lines, more like real stars").
//
// The figure sits in the card's bottom-right corner and runs past the card's
// edge (the card crops it), like a constellation rising out of frame. Stars
// are drawn the way the night sky draws them: a crisp white core, a soft
// blue halo, and on the brightest a fine four-point glint; each has its own
// magnitude, so the figure has one or two bright stars and fainter ones. At
// rest they sit loose and dim. Hovering (or focusing) draws them into place,
// brightens them, fades in the joining lines (thin, fading at the ends: the
// lines are imagined, the stars are real), and lets the bright ones twinkle.
// No blur filters: radial gradients only. Reduced motion skips the drift
// and the twinkle (v7.css). The parent must be a `group` and crop overflow.

import { useId } from "react";

type Star = [x: number, y: number, mag: number];
type Figure = { stars: Star[]; lines: [number, number][] };

export const FIGURES = {
  // a check mark with one star beside it: the work done
  reviews: { stars: [[30, 70, 0.45], [62, 98, 0.7], [104, 56, 0.55], [146, 26, 1], [182, 64, 0.3]], lines: [[0, 1], [1, 2], [2, 3]] },
  // Cassiopeia's W: the week's rhythm
  meetings: { stars: [[24, 40, 0.8], [60, 92, 0.5], [96, 54, 1], [134, 98, 0.45], [176, 34, 0.7]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  // a small figure gathering others round it: the students who need you
  people: { stars: [[104, 22, 0.55], [104, 62, 1], [58, 44, 0.45], [150, 44, 0.6], [72, 104, 0.4], [136, 106, 0.5]], lines: [[0, 1], [1, 2], [1, 3], [1, 4], [1, 5]] },
} satisfies Record<string, Figure>;

// where each star rests when the card is idle (a loose scatter)
const DRIFT: [number, number][] = [[-11, 8], [9, -7], [-7, -10], [12, 7], [-9, 11], [8, -9]];

export function Constellation({ figure }: { figure: keyof typeof FIGURES }) {
  const f: Figure = FIGURES[figure];
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden viewBox="0 0 200 120" className="v7-const pointer-events-none absolute right-[-22px] bottom-[-26px] h-auto w-[52%] max-w-[230px]">
      <defs>
        {/* the halo: white at the heart, the sky's blue, then nothing */}
        <radialGradient id={`h${id}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.18" stopColor="var(--c)" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="var(--c)" stopOpacity="0.12" />
          <stop offset="1" stopColor="var(--c)" stopOpacity="0" />
        </radialGradient>
        {/* a glint's arm: bright at the star, gone at the tip */}
        <linearGradient id={`gx${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gy${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {f.lines.map(([a, b], i) => {
        const [x1, y1] = f.stars[a];
        const [x2, y2] = f.stars[b];
        // stop short of each star, so a line never runs into a halo
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        const gap = 7;
        return (
          <line key={i} x1={x1 + ux * gap} y1={y1 + uy * gap} x2={x2 - ux * gap} y2={y2 - uy * gap}
            style={{ ["--len" as string]: len - gap * 2, ["--d" as string]: `${0.35 + i * 0.12}s` }} />
        );
      })}
      {f.stars.map(([x, y, m], i) => {
        const halo = 7 + m * 13;
        const core = 0.7 + m * 1.3;
        const arm = 6 + m * 12;
        return (
          <g key={i} className="v7-const-star" style={{ ["--dx" as string]: `${DRIFT[i % DRIFT.length][0]}px`, ["--dy" as string]: `${DRIFT[i % DRIFT.length][1]}px`, ["--sd" as string]: `${i * 0.06}s`, ["--m" as string]: m }}>
            <g className={m >= 0.7 ? "v7-const-twinkle" : undefined} style={{ ["--tw" as string]: `${2.4 + i * 0.7}s`, transformOrigin: `${x}px ${y}px` }}>
              <circle cx={x} cy={y} r={halo} fill={`url(#h${id})`} className="v7-const-halo" />
              {m >= 0.7 && (
                <g className="v7-const-glint">
                  <rect x={x - arm} y={y - 0.35} width={arm * 2} height={0.7} fill={`url(#gx${id})`} />
                  <rect x={x - 0.35} y={y - arm} width={0.7} height={arm * 2} fill={`url(#gy${id})`} />
                </g>
              )}
              <circle cx={x} cy={y} r={core} className="v7-const-core" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
