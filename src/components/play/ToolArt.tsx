"use client";

// Illustrated hand tools for AMT's shadow board (screen 3, "account for your
// tools"). Drawn, not icons (Chandu, 5 Oct 2026: "use proper vector
// illustrations or something rather than icons"): brushed chrome, rubber
// grips, a knurled flashlight, laid at an angle in their foam cut-outs.
//
// Every tool is one geometry rendered three ways, so the cut-out always fits
// the tool exactly:
// - "tool": the illustration itself;
// - "pocket": the tool's outline grown a few pixels, solid, for the dark
//   cut-out it sits in;
// - "foam": the same grown outline in the bright under-layer, for the slot
//   whose tool is missing. Two-layer shadow foam is how real hangars show a
//   missing tool at a glance, so the empty slot reads as a real one.

import { useId } from "react";

export type ToolKind = "wrench" | "small-wrench" | "pliers" | "hammer" | "flashlight" | "ruler" | "socket";
type Mode = "tool" | "pocket" | "foam";
type Part = "metal" | "dark" | "grip" | "hole" | "lens";

export function toolKindFor(label: string): ToolKind {
  if (/hammer/i.test(label)) return "hammer";
  if (/flashlight|torch/i.test(label)) return "flashlight";
  if (/ruler|rule|measure/i.test(label)) return "ruler";
  if (/socket/i.test(label)) return "socket";
  if (/pliers/i.test(label)) return "pliers";
  if (/small/i.test(label)) return "small-wrench";
  return "wrench";
}

const POCKET = "#030304";
const FOAM = "var(--world-building-construction)";

export function ToolArt({ kind, mode = "tool", className }: { kind: ToolKind; mode?: Mode; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const solid = mode !== "tool";
  const fillOf = mode === "foam" ? FOAM : POCKET;
  // Grown outline for the cut-out; the tool itself draws crisp.
  // The foam under-layer grows less than the pocket, so a dark cut edge
  // rings it and its holes (the wrench's ring, its jaw) stay open: the
  // empty slot keeps the tool's real outline.
  const grow = solid ? { stroke: fillOf, strokeWidth: mode === "foam" ? 2.5 : 7, strokeLinejoin: "round" as const } : {};
  const paint = (part: Part): React.SVGAttributes<SVGElement> => {
    if (solid) return { fill: fillOf, ...grow };
    switch (part) {
      case "metal":
        return { fill: `url(#${id("chrome")})`, stroke: "rgba(0,0,0,0.55)", strokeWidth: 0.8 };
      case "dark":
        return { fill: `url(#${id("anod")})`, stroke: "rgba(0,0,0,0.6)", strokeWidth: 0.8 };
      case "grip":
        return { fill: `url(#${id("grip")})`, stroke: "rgba(0,0,0,0.6)", strokeWidth: 0.8 };
      case "hole":
        return { fill: "#0a0b0d" };
      case "lens":
        return { fill: `url(#${id("lens")})`, stroke: "rgba(0,0,0,0.5)", strokeWidth: 0.8 };
    }
  };

  const geometry = (() => {
    switch (kind) {
      case "wrench":
      case "small-wrench":
        // A combination wrench lying almost flat: a ring end with a big
        // 12-point hole (the hole is what makes it read as a wrench, never a
        // blob), a flat I-beam shaft, an open jaw angled 15 degrees.
        return (
          <g transform={`translate(60 45) rotate(-12) scale(${kind === "small-wrench" ? 0.78 : 1}) translate(-60 -45)`}>
            <path d="M27 40 L91 41.5 L91 48.5 L27 50 Z" {...paint("metal")} />
            <path d="M8.5 45 A12.5 12.5 0 1 1 33.5 45 A12.5 12.5 0 1 1 8.5 45 Z M14 45 A7 7 0 1 0 28 45 A7 7 0 1 0 14 45 Z" fillRule="evenodd" {...paint("metal")} />
            <path transform="rotate(-15 101 45)" d="M114.6 39 L102 39 A6 6 0 0 0 102 51 L114.6 51 A14.5 14.5 0 1 1 114.6 39 Z" {...paint("metal")} />
            {!solid && (
              <>
                <path d="M14.6 41.7 L17.6 39.4 L21 38.6 L24.4 39.4 L27.4 41.7 L28 45 L27.4 48.3 L24.4 50.6 L21 51.4 L17.6 50.6 L14.6 48.3 L14 45 Z" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
                <path d="M33 43.2 L88 44.1" stroke="rgba(0,0,0,0.35)" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M30 41.4 L90 42.8" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinecap="round" />
              </>
            )}
          </g>
        );
      case "pliers":
        // Combination pliers, closed, nose up: the A of two handles under a
        // riveted joint is unmistakable even as a flat foam cut-out.
        return (
          <g transform="translate(60 45) rotate(62) scale(0.92) translate(-60 -45)">
            <path d="M54 44 Q47 62 39.5 84.5 Q39.5 88.5 43.5 88 L47.5 87 Q52.5 64 59 48 Z" {...paint("grip")} />
            <path d="M66 44 Q73 62 80.5 84.5 Q80.5 88.5 76.5 88 L72.5 87 Q67.5 64 61 48 Z" {...paint("grip")} />
            <path d="M57.4 4 L62.6 4 L67.5 21 L68.5 31 L66.5 38 L53.5 38 L51.5 31 L52.5 21 Z" {...paint("metal")} />
            <circle cx="60" cy="41" r="8" {...paint("metal")} />
            {!solid && (
              <>
                <path d="M60 5 L60 33" stroke="rgba(10,11,13,0.9)" strokeWidth="1" />
                {[11, 15, 19, 23].map((y) => (
                  <path key={y} d={`M56.5 ${y} L63.5 ${y}`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" />
                ))}
                <circle cx="60" cy="41" r="3.6" fill="#8a919b" stroke="rgba(0,0,0,0.6)" strokeWidth="0.8" />
                <circle cx="59" cy="40" r="1.2" fill="rgba(255,255,255,0.7)" />
                <path d="M57.8 6 L54.6 23" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinecap="round" />
                {[62, 68, 74, 80].map((y, i) => (
                  <g key={y}>
                    <path d={`M${50.6 - i * 2.4} ${y} L${55.4 - i * 2.4} ${y + 1}`} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
                    <path d={`M${69.4 + i * 2.4} ${y} L${64.6 + i * 2.4} ${y + 1}`} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
                  </g>
                ))}
              </>
            )}
          </g>
        );
      case "hammer":
        // A claw hammer: round striking face, the split claw curving back,
        // a steel neck into a safety-orange grip.
        return (
          <g transform="translate(60 45) rotate(-34) translate(-60 -45)">
            <path d="M56 26 L64 26 L64.5 56 L55.5 56 Z" {...paint("metal")} />
            <path d="M54 54 Q54 52 56 52 L64 52 Q66 52 66 54 L66.5 84 Q66.5 88 62.5 88 L57.5 88 Q53.5 88 53.5 84 Z" {...paint("grip")} />
            <path d="M52.5 14 L67.5 14 L67.5 30 L52.5 30 Z" {...paint("metal")} />
            <path d="M52.5 17.5 L38 18.5 L38 25.5 L52.5 26.5 Z" {...paint("metal")} />
            <path d="M33.5 15 Q31 15 31 17.5 L31 26.5 Q31 29 33.5 29 L38.5 29 L38.5 15 Z" {...paint("metal")} />
            <path d="M67.5 15 C79 14.5 89 19 95 30 L91.5 32.5 C86 25.5 78 22.5 67.5 25 Z" {...paint("metal")} />
            {!solid && (
              <>
                <path d="M70 19.6 C79 19.6 86.5 23.5 92.6 31" stroke="rgba(10,11,13,0.9)" strokeWidth="1.2" fill="none" />
                {[60, 65, 70, 75, 80].map((y) => (
                  <path key={y} d={`M54.5 ${y} L65.5 ${y}`} stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                ))}
                <path d="M54 16.5 L66 16.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1" strokeLinecap="round" />
                <path d="M33 17 L37 17" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
              </>
            )}
          </g>
        );
      case "flashlight":
        return (
          <g transform="translate(60 45) rotate(-18) translate(-60 -45)">
            <rect x="14" y="37" width="70" height="16" rx="4" {...paint("dark")} />
            <path d="M82 36 L92 30 L104 30 Q107 30 107 33 L107 57 Q107 60 104 60 L92 60 L82 54 Z" {...paint("metal")} />
            <rect x="8" y="38.5" width="8" height="13" rx="2.5" {...paint("metal")} />
            <ellipse cx="107" cy="45" rx="3.2" ry="13" {...paint("lens")} />
            {!solid && (
              <>
                {/* knurled grip band, the rubber switch, the light catching the barrel */}
                {[26, 29, 32, 35, 38, 41, 44, 47, 50].map((x) => (
                  <path key={x} d={`M${x} 37.6 L${x + 2.4} 52.4`} stroke="rgba(255,255,255,0.13)" strokeWidth="0.9" />
                ))}
                <rect x="60" y="34.5" width="10" height="4" rx="2" fill="#1c1e22" stroke="rgba(0,0,0,0.6)" strokeWidth="0.6" />
                <path d="M17 40.5 L82 40.5" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M93 33.5 L104 33.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round" />
              </>
            )}
          </g>
        );
      case "ruler":
        return (
          <g transform="translate(60 45) rotate(-10) translate(-60 -45)">
            <rect x="6" y="36" width="108" height="18" rx="2" {...paint("metal")} />
            {!solid && (
              <>
                <circle cx="12" cy="45" r="2.2" fill="#0a0b0d" />
                {Array.from({ length: 24 }, (_, i) => 18 + i * 4).map((x, i) => (
                  <path key={x} d={`M${x} 36.5 L${x} ${i % 5 === 0 ? 45 : i % 5 === 2 ? 41.5 : 40}`} stroke="rgba(20,22,26,0.8)" strokeWidth="0.9" />
                ))}
                {[0, 1, 2, 3, 4].map((n) => (
                  <text key={n} x={18 + n * 20} y="51.5" fontSize="5.2" fontWeight="700" textAnchor="middle" fill="rgba(20,22,26,0.8)" style={{ fontFamily: "var(--font-body)" }}>
                    {n}
                  </text>
                ))}
                <path d="M7 37.4 L113 37.4" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
              </>
            )}
          </g>
        );
      case "socket":
        return (
          <g>
            {/* seen end-on: the chrome barrel, its size band, the hex opening */}
            <circle cx="60" cy="45" r="25" {...paint("metal")} />
            {!solid && (
              <>
                <circle cx="60" cy="45" r="19.5" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
                <circle cx="60" cy="45" r="22.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
                <polygon points="60,32 71.3,38.5 71.3,51.5 60,58 48.7,51.5 48.7,38.5" fill="#0a0b0d" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                <polygon points="60,36.5 67.4,40.75 67.4,49.25 60,53.5 52.6,49.25 52.6,40.75" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <path d="M42 33 A25 25 0 0 1 66 20.8" stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );
    }
  })();

  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden>
      {!solid && (
        <defs>
          {/* brushed chrome: a bright band, a dark horizon, a cool lower edge */}
          <linearGradient id={id("chrome")} x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0" stopColor="#f5f7fa" />
            <stop offset="0.38" stopColor="#c4cad2" />
            <stop offset="0.52" stopColor="#6f7782" />
            <stop offset="0.7" stopColor="#a9b0ba" />
            <stop offset="1" stopColor="#e3e7ec" />
          </linearGradient>
          <linearGradient id={id("anod")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b616b" />
            <stop offset="0.45" stopColor="#2b2f35" />
            <stop offset="1" stopColor="#15171a" />
          </linearGradient>
          {/* the safety-orange rubber grip */}
          <linearGradient id={id("grip")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="color-mix(in srgb, var(--world-building-construction) 55%, black)" />
            <stop offset="0.45" stopColor="var(--world-building-construction)" />
            <stop offset="1" stopColor="color-mix(in srgb, var(--world-building-construction) 45%, black)" />
          </linearGradient>
          <radialGradient id={id("lens")} cx="0.5" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#fffbe9" />
            <stop offset="0.6" stopColor="#f3e3b0" />
            <stop offset="1" stopColor="#9c8b5c" />
          </radialGradient>
        </defs>
      )}
      {mode === "foam" ? <g style={{ filter: "drop-shadow(0 0 0.5px rgba(0,0,0,0.9))" }}>{geometry}</g> : mode === "tool" ? <g style={{ filter: "drop-shadow(0 2.5px 1.5px rgba(0,0,0,0.85))" }}>{geometry}</g> : geometry}
    </svg>
  );
}
