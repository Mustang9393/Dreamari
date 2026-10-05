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
//   - RuleDraw: a section card's arrival -- a career-colour rule that draws
//     out from the centre, plus one soft light sweep.
// Reduced motion gets the finished state, no movement.

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

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
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="rgba(5,7,15,0.82)" style={{ fontSize: 30, fontWeight: 900, fontFamily: "var(--font-display)" }}>
          {initial}
        </text>
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

/** Behind the promotion ending: the career world's own signature. */
export function EndingBackdrop({ world, accent }: { world: string; accent: string }) {
  const reduced = useReducedMotion();
  if (world === "Health & Medicine") {
    // A heartbeat trace drawn across the frame, a steady rhythm with one big
    // beat at the centre, leaving a faint afterglow.
    const d = "M0 100 H330 l14 -8 l12 8 H400 l10 -62 l14 124 l12 -86 l10 24 H560 l14 -10 l12 10 H760 l10 -40 l12 80 l10 -48 H1000";
    return (
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-[16%] z-[1] h-[22vh]">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="h-full w-full" style={{ overflow: "visible" }}>
          <motion.path
            d={d}
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduced ? false : { pathLength: 0, opacity: 0.95 }}
            animate={{ pathLength: 1, opacity: [0.95, 0.95, 0.35] }}
            transition={{ duration: 2.2, ease: "easeInOut", times: [0, 0.75, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${accent}) drop-shadow(0 0 16px color-mix(in srgb, ${accent} 60%, transparent))` }}
          />
        </svg>
      </div>
    );
  }
  // Business & Finance (and the default): slow light rays fanning from
  // behind the seal, the way a vault door opens onto a lit room.
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-[38%] left-1/2 z-[1] h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, rotate: -8 }}
      animate={reduced ? { opacity: 0.55 } : { opacity: 0.55, rotate: 8 }}
      transition={{ opacity: { duration: 1.2, ease: "easeOut" }, rotate: { duration: 14, ease: "linear" } }}
      style={{
        background: `repeating-conic-gradient(from 0deg, color-mix(in srgb, ${accent} 38%, transparent) 0deg 5deg, transparent 5deg 18deg)`,
        maskImage: "radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 18%, transparent 46%)",
        WebkitMaskImage: "radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 18%, transparent 46%)",
      }}
    />
  );
}

/** A section card's arrival: a rule drawing out from the centre and one soft
 *  light sweep across the card. */
export function RuleDraw({ accent }: { accent: string }) {
  const reduced = useReducedMotion();
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <motion.span
        className="absolute top-0 left-1/2 h-[2px] w-[70%] -translate-x-1/2 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 12px ${accent}`, transformOrigin: "center" }}
        initial={reduced ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
      />
      {!reduced && (
        <motion.span
          className="absolute inset-y-0 w-[35%] skew-x-[-16deg]"
          style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${accent} 16%, transparent), transparent)` }}
          initial={{ x: "-140%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.35 }}
        />
      )}
    </span>
  );
}
