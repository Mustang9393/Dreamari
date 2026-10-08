"use client";

// Bespoke celebration moments for the cinematic levels (5 Oct 2026). Chandu:
// "let's not use generic confetti etc, it makes it really AI reading. Please
// use bespoke design." Each piece is made of something from the career
// itself rather than coloured particles:
//   - CareerSeal: the firm's own foil seal, stamped onto the promotion
//     ending (its name round the ring, its initial in the middle).
//   - EndingBackdrop: what the room does behind that seal -- Business &
//     Finance gets slow gold light rays; Health & Medicine gets a heartbeat
//     trace drawn across the screen.
// Reduced motion gets the finished state, no movement.

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";


/** The firm's seal, stamped in: scales down from big with a slight turn,
 *  lands with a spring, throws one shockwave ring, then a sheen crosses it. */
export function CareerSeal({ firm, accent, size = 104 }: { firm: string; accent: string; size?: number }) {
  const reduced = useReducedMotion();
  const raw = useId().replace(/:/g, "");
  const ring = `seal-ring-${raw}`;
  const foil = `seal-foil-${raw}`;
  // The scalloped edge: 40 points alternating between two radii.
  const points = Array.from({ length: 80 }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 46.5;
    const a = (i / 80) * Math.PI * 2 - Math.PI / 2;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  const label = `${firm.toUpperCase()} • `;
  const initial = firm.trim().charAt(0).toUpperCase();
  return (
    <span className="relative flex items-center justify-center" style={{ width: size, height: size }} aria-hidden>
      {!reduced && (
        <motion.span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: accent }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: [0.9, 2.3], opacity: [0, 0.75, 0] }}
          transition={{ delay: 0.42, duration: 0.9, ease: "easeOut", times: [0, 0.15, 1] }}
        />
      )}
      <motion.svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        initial={reduced ? false : { scale: 2.1, rotate: -22, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 17, delay: 0.1 }}
        style={{ filter: `drop-shadow(0 10px 22px color-mix(in srgb, ${accent} 45%, transparent)) drop-shadow(0 4px 6px rgba(0,0,0,0.45))`, overflow: "visible" }}
      >
        <defs>
          <linearGradient id={foil} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: `color-mix(in srgb, ${accent} 45%, white)` }} />
            <stop offset="48%" style={{ stopColor: accent }} />
            <stop offset="100%" style={{ stopColor: `color-mix(in srgb, ${accent} 62%, black)` }} />
          </linearGradient>
          <path id={ring} d="M 50 50 m -33 0 a 33 33 0 1 1 66 0 a 33 33 0 1 1 -66 0" />
        </defs>
        <polygon points={points} fill={`url(#${foil})`} />
        <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(5,7,15,0.35)" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(5,7,15,0.35)" strokeWidth="0.8" />
        <text fill="rgba(5,7,15,0.72)" style={{ fontSize: 7.4, fontWeight: 800, letterSpacing: "0.12em", fontFamily: "var(--font-display)" }}>
          <textPath href={`#${ring}`} startOffset="0" textLength={2 * Math.PI * 33 - 2} lengthAdjust="spacing">
            {label.repeat(label.length > 18 ? 1 : 2)}
          </textPath>
        </text>
        <SealMark firm={firm} initial={initial} />
      </motion.svg>
      {/* The sheen crossing the foil once it has landed. */}
      {!reduced && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <motion.span
            className="absolute inset-y-0 w-[40%] skew-x-[-18deg]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
            initial={{ x: "-120%" }}
            animate={{ x: "320%" }}
            transition={{ delay: 0.75, duration: 0.9, ease: "easeInOut" }}
          />
        </span>
      )}
    </span>
  );
}

const INK = "rgba(5,7,15,0.8)";

/** The monogram in the seal's centre: the firm's own mark as it appears in
 *  the game art (Cobalt Capital's hexagonal C on the office walls,
 *  Riverbend's six-petal star on the lobby wall), engraved into the foil.
 *  Any other firm falls back to its initial. (Chandu, 5 Oct 2026: "maybe
 *  have more artistic monograms for the seals too. For both careers.") */
function SealMark({ firm, initial }: { firm: string; initial: string }) {
  if (/cobalt/i.test(firm)) {
    // Pointy-top hexagon, its open-sided inner hex forming the C, framed by
    // a laurel sprig on each side.
    const hex = (r: number) => Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const;
    });
    const outer = hex(15.5).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const inner = hex(8.6);
    // The C: the inner hexagon with its right-hand side left open.
    const c = `M${inner[1][0].toFixed(2)} ${inner[1][1].toFixed(2)} L${inner[0][0].toFixed(2)} ${inner[0][1].toFixed(2)} L${inner[5][0].toFixed(2)} ${inner[5][1].toFixed(2)} L${inner[4][0].toFixed(2)} ${inner[4][1].toFixed(2)} L${inner[3][0].toFixed(2)} ${inner[3][1].toFixed(2)} L${inner[2][0].toFixed(2)} ${inner[2][1].toFixed(2)}`;
    const leaves = (side: 1 | -1) =>
      [0, 1, 2, 3].map((k) => {
        // Up each side of the hexagon, from low to high, like a laurel.
        const a = side === 1 ? 152 + k * 17 : 28 - k * 17; // degrees
        const rad = (a * Math.PI) / 180;
        const x = 50 + 20.5 * Math.cos(rad);
        const y = 50 + 20.5 * Math.sin(rad);
        return <ellipse key={`${side}-${k}`} cx={x} cy={y} rx="1.2" ry="2.7" fill={INK} transform={`rotate(${a + 90 - side * 22} ${x} ${y})`} />;
      });
    return (
      <g>
        <polygon points={outer} fill="rgba(5,7,15,0.08)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d={c} fill="none" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="butt" />
        {leaves(1)}
        {leaves(-1)}
      </g>
    );
  }
  if (/riverbend/i.test(firm)) {
    // Six outlined petals around a small centre, the lobby's wall mark.
    const petal = "M50 50 C46.2 45.2 46 38.4 50 34.2 C54 38.4 53.8 45.2 50 50 Z";
    return (
      <g>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path key={deg} d={petal} fill="rgba(5,7,15,0.1)" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" transform={`rotate(${deg} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="2.4" fill={INK} />
      </g>
    );
  }
  return (
    <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill={INK} style={{ fontSize: 30, fontWeight: 900, fontFamily: "var(--font-display)" }}>
      {initial}
    </text>
  );
}

/** Behind the promotion ending: the career world's own signature, drawn
 *  across the clear band between the HUD and the result card so the card
 *  never covers it (direct feedback, 5 Oct 2026: "the ecg thing looks great
 *  but I'm worried it's being hidden by the modal? And what's its
 *  counterpart for IB?"). Health & Medicine: a heartbeat trace. Business &
 *  Finance: a market line climbing through its dips to a glowing high.
 *  Fixing Machines & Engines (AMT): a takeoff, a flat run down the runway
 *  then the climb, for "is this aircraft actually ready to fly?". All draw
 *  left to right across the whole screen, glow, then settle to an
 *  afterglow.
 *
 *  The draw is a mask sweeping across, not an animated pathLength: the line
 *  keeps an even stroke on a stretched viewBox (non-scaling-stroke), and
 *  pathLength measures in the stretched units, so it stopped ~60% across a
 *  wide screen ("they stop about 60% of the way of the screen"). */
export function EndingBackdrop({ world, accent }: { world: string; accent: string }) {
  const reduced = useReducedMotion();
  const kind = world === "Health & Medicine" ? "ecg" : world === "Fixing Machines & Engines" ? "takeoff" : "market";
  const d =
    kind === "ecg"
      ? "M0 120 H330 l14 -8 l12 8 H400 l10 -78 l14 150 l12 -104 l10 32 H560 l14 -10 l12 10 H760 l10 -46 l12 92 l10 -56 H1000"
      : kind === "takeoff"
        ? "M0 182 H330 C430 182 520 166 610 128 C720 82 840 38 960 14"
        : "M0 176 L70 164 L120 171 L190 146 L245 156 L315 128 L370 138 L440 108 L495 118 L565 88 L620 99 L690 68 L745 78 L815 46 L865 56 L920 28 L960 14";
  const glow = `drop-shadow(0 0 6px ${accent}) drop-shadow(0 0 16px color-mix(in srgb, ${accent} 60%, transparent))`;
  const id = `ending-${useId().replace(/:/g, "")}`;
  const DRAW = 2.2;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+92px)] z-[1] h-[clamp(90px,calc(15dvh/var(--vz,1)),170px)]">
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="h-full w-full" style={{ overflow: "visible" }}>
        <defs>
          <clipPath id={`${id}-reveal`}>
            <motion.rect
              x="-20"
              y="-60"
              height="320"
              initial={reduced ? false : { width: 0 }}
              animate={{ width: 1040 }}
              transition={{ duration: DRAW, ease: "easeInOut" }}
            />
          </clipPath>
          {kind !== "ecg" && (
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: accent, stopOpacity: kind === "takeoff" ? 0.22 : 0.32 }} />
              <stop offset="100%" style={{ stopColor: accent, stopOpacity: 0 }} />
            </linearGradient>
          )}
        </defs>
        <g clipPath={`url(#${id}-reveal)`}>
          {kind === "takeoff" && (
            // The runway's centre-line dashes under the take-off run.
            <path d="M0 194 H360" stroke={accent} strokeOpacity="0.45" strokeWidth="3" strokeDasharray="22 16" vectorEffect="non-scaling-stroke" fill="none" />
          )}
          {kind !== "ecg" && (
            // The area under the line fills in behind it.
            <motion.path
              d={`${d} V200 H0 Z`}
              fill={`url(#${id})`}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            />
          )}
          <motion.path
            d={d}
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduced ? false : { opacity: 1 }}
            animate={{ opacity: [1, 1, kind === "ecg" ? 0.4 : 0.75] }}
            transition={{ duration: DRAW + 0.8, times: [0, 0.75, 1] }}
            style={{ filter: glow }}
          />
        </g>
      </svg>
      {kind !== "ecg" && (
        // Where the line tops out: the market's new high, the aircraft away.
        <motion.span
          className="absolute top-[7%] right-[4%] h-[12px] w-[12px] -translate-y-1/2 translate-x-1/2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 25%, transparent), 0 0 22px ${accent}` }}
          initial={reduced ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: 1 }}
          transition={{ delay: DRAW - 0.1, duration: 0.6 }}
        />
      )}
    </div>
  );
}
