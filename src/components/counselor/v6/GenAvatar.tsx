"use client";

// Procedural student portraits for v6 (Chandu, 7 Oct 2026): "truly
// unrepeatable", then "monochromatic... like a portrait, like Notion", then
// "make sure the avatars represent ethnicity or people of colour... anatomy
// works... a variety of hairstyles, facial hair, glasses, genders and
// gender-fluid ones", "always positive looking", "go with the names and
// genders and ethnicities for the demo", and "still have an anime-like art
// style". Students are minors, so no photos; counselors are adults and can
// use their own.
//
// Drawn as SVG at runtime, so it is sharp at any size and nothing is stored.
// Anime style in ink: big eyes with two highlights, a soft pointed chin, a
// small nose, a happy mouth and a little blush; strand-cut hair with a shine.
// Who the student is comes from `traits` (gender presentation, skin tone 1-5,
// hairstyle, hair colour). In the demo, avatarTraits.ts reads those four off
// the portrait the roster already matched to each name; in production the
// student picks them. The seed (student ID) picks everything else: eye shape,
// brows, mouth, glasses, freckles, light facial hair on some masculine
// students, and small proportion nudges, so no two students match.
// Expressions are only ever happy: no flat, worried or angry faces.

import { useId } from "react";
import type { Hair, Traits } from "./avatarTraits";

// Monochrome, matching the existing grayscale student portraits
// (public/images/avatars/students): gray skin tones, black and gray hair, a
// black polo over a white tee, a pale gray ground. Chandu: "not introduce a
// new visual style other than the anime one, because that already exists...
// needs to be monochromatic".
const INK = "#1c1c1c";
const PAPER = "#ffffff";
const DISC = "#ececec";
const SKIN = ["#e4e4e4", "#cfcfcf", "#adadad", "#868686", "#5f5f5f"];
const HAIR_COLOR = { dark: "#1d1d1d", brown: "#454545", light: "#9b9b9b" };
const SCARF = "#8c8c8c";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function stream(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Anime bangs: the crown, then a row of pointed locks across the forehead,
 *  each lock's length and lean seeded, so every fringe is its own. */
function fringe(r: () => number, o: { left: number; right: number; crownY: number; templeY: number; baseY: number; tipMin: number; tipMax: number; n: number; sweep: number; part?: boolean }): string {
  const { left, right, crownY, templeY, baseY, tipMin, tipMax, n, sweep, part } = o;
  let d = `M${left - 1} ${templeY} C${left - 3} ${crownY + 9} ${left + 9} ${crownY} 50 ${crownY} C${right - 9} ${crownY} ${right + 3} ${crownY + 9} ${right + 1} ${templeY}`;
  let x0 = right + 1;
  for (let k = 0; k < n; k++) {
    const x1 = right - ((right - left) * (k + 1)) / n;
    const edge = k === 0 || k === n - 1;
    const mid = (x0 + x1) / 2;
    const lean = part ? (mid < 50 ? -2.2 : 2.2) : sweep;
    const ty = edge ? templeY + 2 + r() * 3 : tipMin + r() * (tipMax - tipMin);
    const tx = mid + lean;
    const y1 = k === n - 1 ? templeY : baseY + r() * 2;
    const w = (x0 - x1) * 0.35;
    d += ` Q${x0 + w * 0.3} ${ty - 2} ${tx} ${ty} Q${x1 + w} ${(ty + y1) / 2 - 1} ${x1} ${y1}`;
    x0 = x1;
  }
  return `${d} L${left - 1} ${templeY}Z`;
}

/** Long hair hanging behind the shoulders, ending in pointed clumps. */
function hangingHair(r: () => number, o: { width: number; bottom: number; n: number }): string {
  const L = 50 - o.width;
  const R = 50 + o.width;
  let d = `M${L + 1} 46 C${L - 1} 22 ${R + 1} 22 ${R - 1} 46 L${R + 2} ${o.bottom}`;
  for (let k = 0; k < o.n; k++) {
    const x1 = R + 2 - ((2 * o.width + 4) * (k + 1)) / o.n;
    const tx = x1 + (2 * o.width + 4) / o.n / 2;
    d += ` L${tx} ${o.bottom + 4 + r() * 5} L${x1} ${o.bottom}`;
  }
  return `${d}Z`;
}

const ALL_HAIR: Hair[] = ["short", "swept", "wavy", "curlyTop", "fade", "buzz", "locs", "longStraight", "longWavy", "longCurly", "boxBraids", "twoBraids", "ponytail", "bun", "puffs", "afro", "bob", "pixie", "shaggy"];

/** `size` in px; leave it out to size with CSS (v6's .six-avatar rules). */
export function GenAvatar({ seed, traits, size, className = "" }: { seed: string; traits?: Traits; size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const r = stream(hash(seed));
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

  // who: from the student's traits, else seeded
  const g = traits?.g ?? pick(["f", "m", "n"] as const);
  const tone = traits?.t ?? ((1 + Math.floor(r() * 5)) as Traits["t"]);
  const hair: Hair = traits?.h ?? pick(ALL_HAIR);
  const hc = HAIR_COLOR[traits?.c ?? "dark"];
  const skin = SKIN[tone - 1];

  // the rest: seeded, always happy
  // Generic on purpose (Chandu, 7 Oct 2026: "more generic and not so
  // detailed", "generic enough that they wouldn't feel pressured to find
  // something that looks exactly like them"): hair, tone, two eyes and a
  // small smile. No brows, nose, freckles, glasses, facial hair or blush.
  const mouth = "smile" as "smile" | "soft" | "open";
  const glasses = null as null | "round" | "square";
  const freckles = false;
  const facialHair = null as null | "mustache" | "stubble";
  const eyeGap = 9.6 + r() * 1;
  const eyeY = 55 + r() * 0.8;
  const lean = (r() - 0.5) * 5;
  // a slightly squarer jaw on masculine faces, a softer point on feminine
  // anime face (the career simulation characters): wide at the cheekbones,
  // tapering to a soft point; a touch squarer on masculine faces
  const chin = g === "m" ? "L69 54 C68 64 60 73 50 75 C40 73 32 64 31 54" : "L69 54 C68 64 59 73 50 75.5 C41 73 32 64 31 54";

  const ink = { fill: "none", stroke: INK, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const capBack = <ellipse cx="50" cy="45" rx="21.5" ry="19" fill={hc} />;

  const back = (() => {
    switch (hair) {
      case "longStraight": return <path d={hangingHair(r, { width: 23, bottom: 86, n: 7 })} fill={hc} />;
      case "longWavy": return <path d={hangingHair(r, { width: 25, bottom: 84, n: 6 })} fill={hc} />;
      // one full mass of curls (a solid shape with a scalloped edge), never
      // separate balls hanging at the sides
      case "longCurly": return <g fill={hc}><path d="M27 46 C26 24 74 24 73 46 L77 84 C70 90 30 90 23 84Z" />{[[26, 50], [24, 66], [27, 81], [74, 50], [76, 66], [73, 81], [38, 29], [50, 25], [62, 29]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" />)}</g>;
      case "boxBraids": return <g><path d={hangingHair(r, { width: 24, bottom: 88, n: 9 })} fill={hc} />{[30, 34, 66, 70].map((x) => <path key={x} d={`M${x} 56 L${x + (x < 50 ? -1 : 1)} 92`} stroke={PAPER} strokeOpacity="0.28" strokeWidth="0.8" />)}</g>;
      case "bob": return <path d="M28 46 C28 26 72 26 72 46 L72 66 C66 69 34 69 28 66Z" fill={hc} />;
      case "afro": return <circle cx="50" cy="42" r="29" fill={hc} />;
      case "puffs": return <g fill={hc}>{capBack}<circle cx="31" cy="28" r="11" /><circle cx="69" cy="28" r="11" /></g>;
      case "ponytail": return <g fill={hc}>{capBack}<path d="M66 34 C80 32 84 54 78 72 C76 60 74 46 64 42Z" /></g>;
      case "bun": return <g fill={hc}>{capBack}<circle cx="50" cy="24" r="8" /></g>;
      case "curlyUpdo": return <g fill={hc}>{capBack}{[[41, 24], [50, 21], [59, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" />)}</g>;
      case "hijab": return <path d="M23 50 C21 25 79 25 77 50 C79 66 73 80 82 94 L18 94 C27 80 21 66 23 50Z" fill={SCARF} />;
      default: return capBack;
    }
  })();

  const shine = <path d="M39 28 C43 25.5 48 25 52 25.5" stroke={PAPER} strokeOpacity="0.28" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
  const sweep = (r() - 0.5) * 5;
  const front = (() => {
    const F = (o: Partial<Parameters<typeof fringe>[1]>) => <g><path d={fringe(r, { left: 30, right: 70, crownY: 21, templeY: 52, baseY: 34, tipMin: 39, tipMax: 45, n: 5, sweep, ...o })} fill={hc} />{shine}</g>;
    // curly textures get a rounded hairline, never straight spiky bangs
    const curlyFront = <g fill={hc}><path d="M30 46 C29 30 71 30 70 46 C65 39 57 36 50 36 C43 36 35 39 30 46Z" />{[[37, 34, 7], [46, 30, 7.5], [55, 30, 7.5], [63, 34, 7]].map(([x, y, rr], i) => <circle key={i} cx={x} cy={y} r={rr} />)}</g>;
    switch (hair) {
      case "short": return F({ templeY: 50, n: 4, tipMin: 38, tipMax: 42 });
      case "swept": return F({ n: 5, sweep: -4.5, tipMin: 40, tipMax: 47 });
      case "wavy": return F({ n: 5, tipMin: 39, tipMax: 45 });
      case "shaggy": return F({ n: 6, templeY: 56, tipMin: 42, tipMax: 49 });
      case "pixie": return F({ n: 5, sweep: 3.5, templeY: 52, tipMin: 39, tipMax: 46 });
      case "bob": return F({ n: 6, sweep: 0, templeY: 64, tipMin: 42, tipMax: 45 });
      case "fade": return <path d="M30 44 C30 33 32 27 50 27 C68 27 70 33 70 44 C66 39 58 37 50 37 C42 37 34 39 30 44Z" fill={hc} />;
      case "buzz": return <path d="M30.5 44 C30.5 31 69.5 31 69.5 44 C65 38 57 36 50 36 C43 36 35 38 30.5 44Z" fill={hc} opacity="0.78" />;
      case "cornrows": return <g><path d="M30.5 44 C30.5 31 69.5 31 69.5 44 C65 38 57 36 50 36 C43 36 35 38 30.5 44Z" fill={hc} />{[40, 46, 52, 58].map((x) => <path key={x} d={`M${x} 36.5 L${x + (x - 49) * 0.2} 30`} stroke={PAPER} strokeOpacity="0.3" strokeWidth="0.8" />)}</g>;
      case "locs": return <g><path d="M30 44 C30 30 70 30 70 44 C65 38 57 35 50 35 C43 35 35 38 30 44Z" fill={hc} />{[[36, 34, 33, 46], [42, 31, 40, 43], [50, 30, 50, 41], [58, 31, 60, 43], [64, 34, 67, 46]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={hc} strokeWidth="3.4" strokeLinecap="round" />)}</g>;
      case "curlyTop": return <g fill={hc}><path d="M30 44 C30 32 70 32 70 44 C65 39 57 37 50 37 C43 37 35 39 30 44Z" />{[[39, 31, 9], [50, 28, 9.5], [61, 31, 9]].map(([x, y, rr], i) => <circle key={i} cx={x} cy={y} r={rr} />)}</g>;
      case "afro": return <path d="M30 44 C30 30 70 30 70 44 C64 37 36 37 30 44Z" fill={hc} />;
      case "curlyUpdo": return <g fill={hc}><path d="M30 44 C30 31 70 31 70 44 C64 37 36 37 30 44Z" /><circle cx="31.5" cy="52" r="2.6" /><circle cx="68.5" cy="52" r="2.6" /></g>;
      case "hijab": return <path d="M30.5 47 C30.5 33 69.5 33 69.5 47" stroke={SCARF} strokeWidth="5" fill="none" />;
      case "longCurly": case "puffs": return curlyFront;
      // long styles, braids, ponytail, bun: a center part
      default: return F({ part: true, n: 4, templeY: ["longStraight", "longWavy", "boxBraids", "longCurly"].includes(hair) ? 60 : 53, tipMin: 40, tipMax: 47 });
    }
  })();

  // braids that fall in front of the shoulders from below the ear, with a tie
  const braid = (x: number, dir: number) => (
    <g fill={hc}>
      {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={x + dir * i * 0.6} cy={64 + i * 6.2} rx="3.9" ry="3.6" />)}
      <rect x={x + dir * 3 - 2.2} y="94" width="4.4" height="2.4" rx="1" fill={INK} />
    </g>
  );

  // The career simulations' eye, reduced: a heavy upper lid that flicks out
  // at the corner, a tall iris tucked under it with one big highlight, and a
  // short lower lid. One shape for everyone, so faces stay generic.
  const eye = (ex: number, side: -1 | 1) => (
    <g>
      <ellipse cx={ex} cy={eyeY + 1.4} rx="3.4" ry="4.4" fill={INK} />
      <ellipse cx={ex} cy={eyeY + 2.8} rx="2.2" ry="1.9" fill="#6c6c6c" />
      <circle cx={ex - side * 1.1} cy={eyeY - 0.1} r="1.35" fill={PAPER} />
      <circle cx={ex + side * 1.2} cy={eyeY + 3.2} r="0.5" fill={PAPER} />
      <path d={`M${ex - side * 5.2} ${eyeY - 0.2} Q${ex - side * 0.4} ${eyeY - 5.4} ${ex + side * 5} ${eyeY - 1.6} L${ex + side * 6.6} ${eyeY - 3} L${ex + side * 5.4} ${eyeY - 0.4} Q${ex - side * 0.4} ${eyeY - 3.8} ${ex - side * 5.2} ${eyeY - 0.2}Z`} fill={INK} stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
      <path d={`M${ex - side * 2.4} ${eyeY + 5.6} L${ex + side * 2.8} ${eyeY + 5.2}`} {...ink} strokeWidth="0.9" opacity="0.5" />
    </g>
  );

  const showEars = !["hijab", "longStraight", "longWavy", "boxBraids", "bob", "longCurly"].includes(hair);
  const blush = 0;

  return (
    <svg viewBox="0 0 100 100" {...(size ? { width: size, height: size } : {})} className={`flex-none ${className}`} aria-hidden style={{ borderRadius: "50%" }}>
      <defs><clipPath id={`c${uid}`}><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath={`url(#c${uid})`}>
        <rect width="100" height="100" fill={DISC} />
        <g transform={`translate(50 50) scale(1.16) translate(-50 -51) rotate(${lean} 50 62)`}>
          {back}
          {/* neck, and a dark polo with a white tee at the collar, like the portraits */}
          <path d="M46.2 70 L45.6 83 L54.4 83 L53.8 70Z" fill={skin} />
          <path d="M8 104 C10 89 28 83 50 83 C72 83 90 89 92 104Z" fill="#161616" />
          <path d="M44.5 83 L50 89 L55.5 83Z" fill={PAPER} />
          <path d="M43 83 L48 91 M57 83 L52 91" stroke="#3a3a3a" strokeWidth="1.2" />
          {showEars && <><ellipse cx="31" cy="53" rx="2.6" ry="4" fill={skin} /><ellipse cx="69" cy="53" rx="2.6" ry="4" fill={skin} /></>}
          <path d={`M31 47 C31 31 69 31 69 47 ${chin}Z`} fill={skin} stroke={INK} strokeWidth="1.1" />
          {/* soft shading like the painted portraits: under the hairline, below the chin */}
          <path d="M46 71 C48 75 52 75 54 71 L54 75.5 L46 75.5Z" fill={INK} opacity="0.14" />
          {front}
          {hair === "twoBraids" && <>{braid(31.5, -1)}{braid(68.5, 1)}</>}
          {hair === "sideBraid" && braid(33, -1)}
          <path d={`M${50 - eyeGap - 4.6} ${eyeY - 6.4} Q${50 - eyeGap} ${eyeY - 8.2} ${50 - eyeGap + 4} ${eyeY - 7}`} {...ink} strokeWidth={g === "m" ? 1.5 : 1.1} />
          <path d={`M${50 + eyeGap - 4} ${eyeY - 7} Q${50 + eyeGap} ${eyeY - 8.2} ${50 + eyeGap + 4.6} ${eyeY - 6.4}`} {...ink} strokeWidth={g === "m" ? 1.5 : 1.1} />
          {eye(50 - eyeGap, -1)}
          {eye(50 + eyeGap, 1)}
          <path d={`M50.8 ${eyeY + 7.4} L49.8 ${eyeY + 9.6} L51 ${eyeY + 9.8}`} {...ink} strokeWidth="0.9" opacity="0.5" />
          <ellipse cx={50 - eyeGap - 1} cy={eyeY + 9.4} rx="3.4" ry="1.4" fill={INK} opacity={blush} />
          <ellipse cx={50 + eyeGap + 1} cy={eyeY + 9.4} rx="3.4" ry="1.4" fill={INK} opacity={blush} />
          {freckles && <g fill={INK} opacity="0.45">{[[-11, 7.5], [-8.6, 8.8], [-10, 10.4], [11, 7.5], [8.6, 8.8], [10, 10.4]].map(([dx, dy], i) => <circle key={i} cx={50 + dx} cy={eyeY + dy} r="0.6" />)}</g>}
          {/* mouth: always happy */}
          {mouth === "smile" && <path d={`M47 ${eyeY + 13.4} Q50 ${eyeY + 15.4} 53 ${eyeY + 13.4}`} {...ink} strokeWidth="1.2" />}
          {mouth === "soft" && <path d={`M47.4 ${eyeY + 13} Q50 ${eyeY + 15} 52.6 ${eyeY + 13}`} {...ink} strokeWidth="1.5" />}
          {mouth === "open" && <g><path d={`M45.6 ${eyeY + 12} Q50 ${eyeY + 18.4} 54.4 ${eyeY + 12} Z`} fill={INK} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" /><path d={`M47.4 ${eyeY + 15.2} Q50 ${eyeY + 13.8} 52.6 ${eyeY + 15.2} Q50 ${eyeY + 17.2} 47.4 ${eyeY + 15.2}Z`} fill="#8a8a8a" /></g>}
          {facialHair === "mustache" && <path d={`M46.6 ${eyeY + 11} Q50 ${eyeY + 9.9} 53.4 ${eyeY + 11}`} {...ink} strokeWidth="1.3" opacity="0.55" />}
          {facialHair === "stubble" && <g fill={INK} opacity="0.32">{[[-4, 19], [-2, 20.4], [0, 21], [2, 20.4], [4, 19], [-1, 18.6], [1, 18.6]].map(([dx, dy], i) => <circle key={i} cx={50 + dx} cy={eyeY + dy} r="0.45" />)}</g>}
          {glasses === "round" && <g {...ink} strokeWidth="1.3"><circle cx={50 - eyeGap} cy={eyeY + 0.6} r="6.6" /><circle cx={50 + eyeGap} cy={eyeY + 0.6} r="6.6" /><path d={`M${50 - eyeGap + 6.6} ${eyeY} Q50 ${eyeY - 1.6} ${50 + eyeGap - 6.6} ${eyeY}`} /></g>}
          {glasses === "square" && <g {...ink} strokeWidth="1.3"><rect x={50 - eyeGap - 6.6} y={eyeY - 4.6} width="13.2" height="10" rx="3" /><rect x={50 + eyeGap - 6.6} y={eyeY - 4.6} width="13.2" height="10" rx="3" /><path d={`M${50 - eyeGap + 6.6} ${eyeY - 0.6} L${50 + eyeGap - 6.6} ${eyeY - 0.6}`} /></g>}
        </g>
      </g>
    </svg>
  );
}
