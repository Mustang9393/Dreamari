"use client";

// A hero card's hover (20 Oct 2026; Chandu: "maybe some stars align into a
// constellation... Subtly but there? More magical", "more off frame bottom
// right... more like real stars", then "empty of stars when they are not
// hovered, and when they hover they fade in connect, but we need better
// render quality, these still look a little cartoonish").
//
// Nothing shows at rest. On hover (or focus) the stars fade in one after
// another in the card's bottom-right corner, running past its edge (the card
// crops it), then the lines connect them.
//
// Render quality: SVG circles and hard plus-sign glints read as cartoon. The
// stars are now sprites drawn once, at high resolution, on a canvas (the
// night sky's method, NightSky.tsx): a pin-sharp core and a smooth,
// photographic falloff into a soft glow, in a few real star colours (warm
// white, white, ice, pale blue), with whisper-thin tapered diffraction spikes
// on the brightest only. Twinkle is brightness only, never a scale.

import { useSyncExternalStore } from "react";
import "./constellation.css";

type Star = [x: number, y: number, mag: number, tint: number];
type Figure = { stars: Star[]; lines: [number, number][] };

export const FIGURES = {
  // a check mark with one star beside it: the work done
  reviews: { stars: [[30, 70, 0.45, 2], [62, 98, 0.7, 1], [104, 56, 0.55, 3], [146, 26, 1, 0], [182, 64, 0.3, 2]], lines: [[0, 1], [1, 2], [2, 3]] },
  // Cassiopeia's W: the week's rhythm
  meetings: { stars: [[24, 40, 0.8, 1], [60, 92, 0.5, 2], [96, 54, 1, 3], [134, 98, 0.45, 0], [176, 34, 0.7, 2]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  // a small figure gathering others round it: the students who need you
  people: { stars: [[104, 22, 0.55, 2], [104, 62, 1, 1], [58, 44, 0.45, 3], [150, 44, 0.6, 0], [72, 104, 0.4, 2], [136, 106, 0.5, 1]], lines: [[0, 1], [1, 2], [1, 3], [1, 4], [1, 5]] },
  // a path climbing to one bright star, with a side step: My Build, the
  // answers that lead to the student's matches (student About Me)
  build: { stars: [[22, 100, 0.4, 2], [62, 78, 0.6, 1], [98, 90, 0.35, 3], [130, 50, 0.7, 0], [178, 22, 1, 1], [156, 92, 0.3, 2]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]] },
} satisfies Record<string, Figure>;

// warm white, white, ice, pale blue (rgb)
const TINTS = ["255, 238, 218", "255, 255, 255", "220, 234, 255", "176, 206, 255"];

// ---- sprites: drawn once per page, at 4x, cached as data URLs ---------------

let sprites: string[] | null = null;

function drawSprite(tint: string, spikes: boolean): string {
  const S = 192;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = S / 2;
  // glow: a long, soft falloff (most of the light sits in the first tenth)
  const glow = g.createRadialGradient(m, m, 0, m, m, m);
  glow.addColorStop(0, `rgba(${tint}, 0.55)`);
  glow.addColorStop(0.06, `rgba(${tint}, 0.32)`);
  glow.addColorStop(0.16, `rgba(${tint}, 0.11)`);
  glow.addColorStop(0.34, `rgba(${tint}, 0.035)`);
  glow.addColorStop(0.6, `rgba(${tint}, 0.01)`);
  glow.addColorStop(1, `rgba(${tint}, 0)`);
  g.fillStyle = glow;
  g.fillRect(0, 0, S, S);
  // spikes: hairlines that taper to nothing, faint (a lens, not a cartoon)
  if (spikes) {
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const grad = g.createLinearGradient(m - dx * m, m - dy * m, m + dx * m, m + dy * m);
      grad.addColorStop(0, `rgba(${tint}, 0)`);
      grad.addColorStop(0.38, `rgba(${tint}, 0.08)`);
      grad.addColorStop(0.5, `rgba(${tint}, 0.5)`);
      grad.addColorStop(0.62, `rgba(${tint}, 0.08)`);
      grad.addColorStop(1, `rgba(${tint}, 0)`);
      g.fillStyle = grad;
      if (dx) g.fillRect(0, m - 0.9, S, 1.8);
      else g.fillRect(m - 0.9, 0, 1.8, S);
    }
  }
  // core: pin-sharp, white-hot at the centre, the tint at its rim
  const core = g.createRadialGradient(m, m, 0, m, m, S * 0.035);
  core.addColorStop(0, "rgba(255, 255, 255, 1)");
  core.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  core.addColorStop(1, `rgba(${tint}, 0)`);
  g.fillStyle = core;
  g.beginPath();
  g.arc(m, m, S * 0.035, 0, Math.PI * 2);
  g.fill();
  return c.toDataURL("image/png");
}

function getSprites(): string[] | null {
  if (sprites || typeof document === "undefined") return sprites;
  // index = tint * 2 + (spikes ? 1 : 0)
  sprites = TINTS.flatMap((t) => [drawSprite(t, false), drawSprite(t, true)]);
  return sprites;
}
const noop = () => () => {};

/** The cached star sprites (client only), index = tint * 2 + (spikes ? 1 : 0). */
export function useStarSprites(): string[] | null {
  return useSyncExternalStore(noop, getSprites, () => null);
}

export function Constellation({ figure, className = "right-[-22px] bottom-[-26px] w-[52%] max-w-[230px]" }: { figure: keyof typeof FIGURES; /** where it sits in its card (default: off the bottom-right corner) */ className?: string }) {
  // client only: the sprites need a canvas; nothing shows at rest anyway
  const art = useStarSprites();
  if (!art) return null;
  const f: Figure = FIGURES[figure];
  return (
    <svg aria-hidden viewBox="0 0 200 120" className={`dm-const pointer-events-none absolute h-auto ${className}`}>
      {f.lines.map(([a, b], i) => {
        const [x1, y1] = f.stars[a];
        const [x2, y2] = f.stars[b];
        // stop short of each star so a line never cuts through its glow
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        const gap = 5;
        return (
          <line key={i} x1={x1 + ux * gap} y1={y1 + uy * gap} x2={x2 - ux * gap} y2={y2 - uy * gap}
            style={{ ["--len" as string]: len - gap * 2, ["--d" as string]: `${0.45 + i * 0.14}s` }} />
        );
      })}
      {f.stars.map(([x, y, m, t], i) => {
        const size = 16 + m * 34;
        const spikes = m >= 0.8;
        return (
          <image key={i} href={art[t * 2 + (spikes ? 1 : 0)]} x={x - size / 2} y={y - size / 2} width={size} height={size}
            className={`dm-const-star${m >= 0.7 ? " dm-const-twinkle" : ""}`} preserveAspectRatio="xMidYMid meet"
            style={{ ["--sd" as string]: `${i * 0.07}s`, ["--m" as string]: m, ["--tw" as string]: `${2.6 + i * 0.8}s` }} />
        );
      })}
    </svg>
  );
}

/** A small fixed constellation as an icon (My Build's mark, 20 Oct 2026;
 *  Chandu: "lose the AI icon. Use something better or some starry hover
 *  stuff we did for the v7 cards"). Lit at rest, unlike the hover figure;
 *  inside a `.group` its bright star scintillates while hovered. */
export function StarGlyph({ className = "h-[22px] w-[22px]" }: { className?: string }) {
  const art = useStarSprites();
  const stars: Star[] = [[5, 19, 0.45, 2], [10, 11, 0.7, 1], [15.5, 14.5, 0.4, 3], [19.5, 4.5, 1, 1]];
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`dm-const-glyph overflow-visible ${className}`}>
      {[[0, 1], [1, 2], [2, 3]].map(([a, b], i) => (
        <line key={i} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} />
      ))}
      {art && stars.map(([x, y, m, t], i) => {
        const size = 7 + m * 9;
        return (
          <image key={i} href={art[t * 2 + (m >= 0.8 ? 1 : 0)]} x={x - size / 2} y={y - size / 2} width={size} height={size}
            className={m >= 0.7 ? "dm-const-glyph-tw" : undefined} style={{ ["--m" as string]: m, ["--tw" as string]: `${2.2 + i * 0.7}s` }} />
        );
      })}
    </svg>
  );
}

/** A success moment on one spot: a few stars flare and fade where something
 *  just changed (a My Build answer saved). Mount it with a fresh `key` to
 *  play it again; it plays once and leaves nothing behind. */
export function StarBurst({ className = "" }: { className?: string }) {
  const art = useStarSprites();
  if (!art) return null;
  // around a point at the middle of the box, a scatter that reads as stars
  // catching light, not confetti: few, uneven, mostly small
  const pts: Star[] = [[18, 30, 1, 1], [70, 14, 0.55, 2], [118, 34, 0.75, 3], [168, 18, 0.4, 0], [92, 48, 0.35, 1]];
  return (
    <svg aria-hidden viewBox="0 0 200 60" preserveAspectRatio="none" className={`dm-const-burst pointer-events-none absolute ${className}`}>
      {pts.map(([x, y, m, t], i) => {
        const size = 12 + m * 26;
        return (
          <image key={i} href={art[t * 2 + (m >= 0.8 ? 1 : 0)]} x={x - size / 2} y={y - size / 2} width={size} height={size}
            preserveAspectRatio="xMidYMid meet" style={{ ["--d" as string]: `${i * 0.09}s`, ["--m" as string]: m }} />
        );
      })}
    </svg>
  );
}
