"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { Clock3, Flame, Sparkle, X } from "lucide-react";
import { SPRING_BOUNCY, TACTILE_PRESS, popIn } from "./duo-motion";
import { DreamyRig } from "./characters/DreamyRig";

// Sequence 01 — Daily Drop, Super-Duolingo style (ref: Nick Parente's Super
// campaign frames): deep indigo night, Dreamy FLYING solo with a thick solid
// light band trailing behind, neon speed streaks, floating glowing diamonds,
// an aurora horizon. Banner: flight reveal once, then the ambient hold.
// Click: takeover — Dreamy decelerates INTO CENTER (camera fixed, the
// environment carries the speed), then the landing celebration.

const V = {
  bg: "var(--background)",
  fg: "var(--foreground)",
  card: "var(--card)",
  border: "var(--border)",
  muted: "var(--muted-foreground, color-mix(in srgb, var(--foreground) 55%, transparent))",
  primary: "var(--primary)",
  primaryFg: "var(--primary-foreground)",
  gold: "var(--chart-3)",
  purple: "var(--hero-accent-purple)",
};

// Super-frame palette accents (illustrative, lab-only)
const NEON = { cyan: "#6EE7FF", violet: "#A78BFA", magenta: "#FF7ACF", mint: "#46E3C8" };

const popAt = (delay: number): Transition => ({
  ...SPRING_BOUNCY,
  delay,
  opacity: { duration: 0.15, delay },
});

const chipRow: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.14, delayChildren: 1.0 } },
};

const SKY = `linear-gradient(155deg, color-mix(in srgb, ${V.purple} 72%, #10134a) 0%, color-mix(in srgb, ${V.purple} 35%, ${V.bg}) 55%, ${V.bg} 100%)`;

// ——— The light band: the thick SOLID trail from the Super frames. Bright
// rounded head tucked under the character, long tail fading out. Grows in
// once, then FLOWS: highlight streaks travel from the head down the tail,
// the whole band breathes, sparkle dots peel away.
const BAND_STREAKS = [
  { top: "16%", h: "13%", left: "72%", w: 0.5, dur: 1.3, d: 0 },
  { top: "44%", h: "17%", left: "80%", w: 0.62, dur: 1.7, d: 0.45 },
  { top: "70%", h: "12%", left: "66%", w: 0.42, dur: 1.1, d: 0.85 },
];
function LightBand({ length = 560, thickness = 120, delay = 0 }: { length?: number; thickness?: number; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      style={{ width: length, height: thickness, transformOrigin: "100% 50%" }}
      initial={reduced ? false : { scaleX: 0, opacity: 0 }}
      animate={reduced ? { opacity: 0.9 } : { scaleX: 1, opacity: 1, scaleY: [1, 1.05, 1] }}
      transition={{
        scaleX: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.3, delay },
        scaleY: { duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: delay + 0.7 },
      }}
    >
      <div
        className="relative size-full overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${NEON.violet} 34%, transparent) 20%, color-mix(in srgb, #ffffff 66%, ${NEON.cyan}) 58%, #FFFFFF 82%)`,
        }}
      >
        {/* flow: soft streaks born at the head, racing down the tail */}
        {!reduced &&
          BAND_STREAKS.map((s, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full"
              style={{
                top: s.top,
                height: s.h,
                left: s.left,
                width: length * s.w,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.95))",
              }}
              animate={{ x: [0, -length * 1.15], opacity: [0, 0.9, 0] }}
              transition={{ duration: s.dur, delay: delay + 0.8 + s.d, repeat: Infinity, ease: "easeIn" }}
            />
          ))}
      </div>
      {/* sparkles peeling off the tail */}
      {!reduced &&
        [0.25, 0.45, 0.62].map((at, index) => (
          <motion.span
            key={`p${index}`}
            className="absolute rotate-45"
            style={{ left: length * at, top: index % 2 ? "8%" : "78%", width: 7, height: 7, background: "#FFFFFF" }}
            animate={{ x: [0, -60], y: index % 2 ? [0, -18] : [0, 18], opacity: [0.9, 0], scale: [1, 0.3] }}
            transition={{ duration: 1.5, delay: delay + 1 + index * 0.5, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
    </motion.div>
  );
}

// ——— Dreamy in flight: leaning into the band's direction, riding its bright
// head, with a soft bob layered over whatever path the parent runs.
function FlyingDreamy({ size = 150, urgent = false }: { size?: number; urgent?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -8, 0], rotate: [0, 2.5, 0] }}
      transition={{ duration: urgent ? 0.55 : 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="rotate-[8deg]">
        <DreamyRig size={size} lookX={14} shadow={false} />
      </div>
    </motion.div>
  );
}

// ——— Floating glowing diamonds (the Super frames' drifting squares).
const DIAMONDS = [
  { left: "12%", top: "22%", s: 9, c: NEON.cyan, d: 0 },
  { left: "30%", top: "74%", s: 6, c: NEON.magenta, d: 0.9 },
  { left: "48%", top: "14%", s: 7, c: NEON.violet, d: 1.6 },
  { left: "66%", top: "78%", s: 8, c: NEON.cyan, d: 0.4 },
  { left: "84%", top: "30%", s: 6, c: NEON.magenta, d: 2.2 },
  { left: "92%", top: "62%", s: 9, c: NEON.violet, d: 1.2 },
];
function FloatingDiamonds() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {DIAMONDS.map((p, index) => (
        <motion.span
          key={index}
          className="absolute rotate-45 rounded-[1px]"
          style={{ left: p.left, top: p.top, width: p.s, height: p.s, background: p.c, boxShadow: `0 0 12px ${p.c}` }}
          animate={reduced ? { opacity: 0.5 } : { y: [0, -14, 0], opacity: [0.35, 0.95, 0.35], rotate: [45, 90, 45] }}
          transition={{ duration: 3.4, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ——— Tiny twinkling stars.
const SPECKS = [
  { left: "8%", top: "18%", s: 3, d: 0 },
  { left: "22%", top: "66%", s: 2, d: 0.8 },
  { left: "38%", top: "10%", s: 2.5, d: 1.4 },
  { left: "55%", top: "34%", s: 2, d: 0.4 },
  { left: "63%", top: "20%", s: 3, d: 2.1 },
  { left: "78%", top: "58%", s: 2, d: 1.0 },
  { left: "88%", top: "12%", s: 2.5, d: 1.8 },
  { left: "95%", top: "44%", s: 2, d: 0.2 },
  { left: "15%", top: "42%", s: 2, d: 2.6 },
  { left: "72%", top: "40%", s: 2, d: 3.1 },
];
function NightSpecks() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {SPECKS.map((p, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full"
          style={{ left: p.left, top: p.top, width: p.s, height: p.s, background: "#EAF2FE" }}
          animate={reduced ? { opacity: 0.5 } : { opacity: [0.15, 0.9, 0.15], scale: [1, 1.5, 1] }}
          transition={{ duration: 2.6, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ——— Aurora horizon glow (banner/streak floor).
function AuroraHorizon() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
      <motion.div
        className="h-[42px]"
        style={{
          background: `linear-gradient(0deg, color-mix(in srgb, ${NEON.violet} 26%, transparent), transparent)`,
        }}
        animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="h-[3px]"
        style={{ background: `linear-gradient(90deg, ${NEON.mint}, ${NEON.cyan}, ${NEON.violet}, ${NEON.magenta})` }}
        animate={reduced ? undefined : { opacity: [0.55, 1, 0.55], backgroundPositionX: ["0%", "100%"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ——— Neon speed streaks raking past (opposite to flight).
const STREAKS = [
  { top: "12%", w: 220, d: 0, dur: 0.6 },
  { top: "26%", w: 130, d: 0.22, dur: 0.75 },
  { top: "40%", w: 260, d: 0.45, dur: 0.55 },
  { top: "54%", w: 150, d: 0.1, dur: 0.7 },
  { top: "68%", w: 230, d: 0.34, dur: 0.6 },
  { top: "82%", w: 140, d: 0.55, dur: 0.8 },
];
function NeonStreaks() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div aria-hidden className="absolute inset-[-10%] -rotate-[13deg]">
      {STREAKS.map((l, index) => (
        <motion.span
          key={index}
          className="absolute h-[4px] rounded-full"
          style={{
            top: l.top,
            width: l.w,
            background: `linear-gradient(90deg, transparent, ${index % 2 ? NEON.magenta : NEON.cyan}, ${NEON.violet}, transparent)`,
            opacity: 0.8,
          }}
          initial={{ x: "115vw" }}
          animate={{ x: "-35vw" }}
          transition={{ duration: l.dur, delay: l.d, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ——— Confetti for the reveal.
const CONFETTI = [
  { x: -150, w: 9, h: 14, c: "#FFC95C", d: 0, r: 40 },
  { x: -96, w: 7, h: 7, c: NEON.magenta, d: 0.5, r: -70, round: true },
  { x: -48, w: 8, h: 13, c: NEON.mint, d: 1.1, r: 120 },
  { x: 6, w: 10, h: 10, c: "#FFC95C", d: 0.3, r: -50, round: true },
  { x: 58, w: 8, h: 14, c: NEON.cyan, d: 0.8, r: 90 },
  { x: 112, w: 7, h: 7, c: NEON.magenta, d: 1.4, r: -110, round: true },
  { x: 156, w: 9, h: 13, c: NEON.mint, d: 0.15, r: 60 },
  { x: -180, w: 7, h: 12, c: NEON.violet, d: 1.7, r: -80 },
  { x: 188, w: 8, h: 8, c: "#FFC95C", d: 1.0, r: 100, round: true },
];
function Confetti() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex h-[420px] justify-center overflow-hidden">
      {CONFETTI.map((p, index) => (
        <motion.span
          key={index}
          className="absolute top-[-24px]"
          style={{
            marginLeft: p.x * 2,
            width: p.w,
            height: p.h,
            background: p.c,
            borderRadius: p.round ? "50%" : 2,
          }}
          animate={{ y: [0, 460], rotate: [0, p.r * 4], x: [0, p.x * 0.3] }}
          transition={{ duration: 2.6, delay: p.d, repeat: Infinity, ease: [0.3, 0, 0.8, 1] }}
        />
      ))}
    </div>
  );
}

// ——— Impact dressing: white flash + expanding shockwave rings + sunburst.
function ImpactBurst() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{ background: "#FFF7E6" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.75, 0] }}
        transition={{ duration: 0.5, times: [0, 0.18, 1], ease: "easeOut" }}
      />
      {[0, 0.16].map((delay, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute left-1/2 top-1/2 size-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: `3px solid ${V.gold}` }}
          initial={{ scale: 0.25, opacity: 0.9 }}
          animate={{ scale: 3 + index, opacity: 0 }}
          transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </>
  );
}

function SunRays() {
  const reduced = useReducedMotion();
  const mask = "radial-gradient(circle, black 0%, transparent 66%)";
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: `repeating-conic-gradient(from 0deg, color-mix(in srgb, ${V.gold} 20%, transparent) 0deg 9deg, transparent 9deg 30deg)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1, rotate: reduced ? 0 : 360 }}
      transition={{
        opacity: { duration: 0.5, delay: 0.1 },
        scale: { duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
      }}
    />
  );
}

// ——— Duolingo-style stat chip.
function StatChip({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={popIn}
      className="relative rounded-2xl px-5 pt-4 pb-3"
      style={{ border: `2px solid ${color}`, background: V.card }}
    >
      <span
        className="absolute -top-[9px] left-1/2 -translate-x-1/2 rounded-full px-2 text-[10px] font-extrabold uppercase whitespace-nowrap"
        style={{ letterSpacing: "0.1em", background: color, color: V.bg }}
      >
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-[17px] font-extrabold" style={{ color }}>
        {children}
      </span>
    </motion.div>
  );
}

function SparkleBurst() {
  const spots = [
    { x: -130, y: -60, s: 12 },
    { x: 128, y: -80, s: 9 },
    { x: -95, y: 55, s: 8 },
    { x: 140, y: 40, s: 11 },
    { x: 8, y: -118, s: 8 },
  ];
  return (
    <>
      {spots.map((spot, index) => (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 block rotate-45"
          style={{ width: spot.s, height: spot.s, background: V.gold }}
          initial={{ x: spot.x * 0.3, y: spot.y * 0.3, scale: 0, opacity: 0 }}
          animate={{ x: spot.x, y: spot.y, scale: 1, opacity: 0.9 }}
          transition={popAt(0.35 + index * 0.07)}
        />
      ))}
    </>
  );
}

// ——— Phase A: the flight. Dreamy sweeps in from the lower left and
// DECELERATES INTO CENTER — the camera holds on the character while the
// streaks, diamonds and the growing light band carry the speed.
function StreakPhase() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: SKY }}>
      <NightSpecks />
      <NeonStreaks />
      <FloatingDiamonds />
      <AuroraHorizon />

      <motion.div
        className="absolute"
        style={{ left: "calc(50% - 95px)", top: "calc(36% - 95px)" }}
        initial={reduced ? { opacity: 0 } : { x: "-60vw", y: "44vh", scale: 0.5, opacity: 1 }}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0.2 : 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <div className="relative -rotate-[13deg]">
          {/* the band roots at Dreamy and stretches back down the path */}
          <div className="absolute right-[30%] top-1/2 -translate-y-1/2">
            <LightBand length={760} thickness={132} delay={0.55} />
          </div>
          <FlyingDreamy size={190} urgent />
        </div>
      </motion.div>

      <motion.p
        initial={{ scale: 0, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={popAt(0.7)}
        className="absolute inset-x-0 top-[66%] text-center text-[36px] font-extrabold sm:text-[48px]"
        style={{ fontFamily: "var(--font-display)", color: V.gold, textShadow: `0 4px 30px color-mix(in srgb, ${V.gold} 45%, transparent)` }}
      >
        Today&apos;s Drop!
      </motion.p>
    </div>
  );
}

// ——— Phase B: the landing. Flash + shockwave + sunburst sell the impact;
// Dreamy holds a grounded squash-stretch joy hop; card, chips, CTA stage in.
function RevealPhase({ onClose }: { onClose: () => void }) {
  const reduced = useReducedMotion();
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${V.purple} 78%, #10134a), ${V.bg} 64%)` }}
    >
      <NightSpecks />
      <FloatingDiamonds />
      <ImpactBurst />
      <Confetti />

      <div className="relative">
        <SunRays />
        <SparkleBurst />
        {/* impact entrance: slam down, squash hard, then the joy-hop hold */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { y: -240, scaleY: 1.25, scaleX: 0.85, opacity: 0 }}
          animate={
            reduced
              ? { opacity: 1 }
              : { y: 0, scaleY: [1.25, 0.72, 1.12, 1], scaleX: [0.85, 1.28, 0.94, 1], opacity: 1 }
          }
          transition={{
            y: { duration: 0.42, ease: [0.5, 0, 0.9, 0.4] },
            scaleY: { duration: 0.75, times: [0, 0.55, 0.8, 1], ease: "easeOut" },
            scaleX: { duration: 0.75, times: [0, 0.55, 0.8, 1], ease: "easeOut" },
            opacity: { duration: 0.12 },
          }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    y: [0, 0, -22, 0, 0],
                    scaleY: [1, 0.88, 1.06, 0.9, 1],
                    scaleX: [1, 1.09, 0.96, 1.07, 1],
                  }
            }
            transition={{ duration: 1.5, times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, repeatDelay: 0.7, ease: "easeInOut", delay: 1.1 }}
            style={{ transformOrigin: "50% 100%" }}
          >
            <DreamyRig size={220} mood="joy" />
          </motion.div>
        </motion.div>
      </div>

      <motion.h2
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={popAt(0.45)}
        className="relative z-[2] text-[32px] font-extrabold sm:text-[40px]"
        style={{ fontFamily: "var(--font-display)", color: V.gold, textShadow: `0 4px 30px color-mix(in srgb, ${V.gold} 40%, transparent)` }}
      >
        Drop unlocked!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="relative z-[2] max-w-[340px] text-[14px]"
        style={{ color: V.muted }}
      >
        A new career just landed in your sky.
      </motion.p>

      <motion.div
        initial={{ scale: 0, rotate: -6, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={popAt(0.7)}
        className="relative z-[2] flex w-[250px] flex-col items-center gap-1 rounded-3xl px-6 py-5"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${V.primary} 40%, ${V.card}), ${V.card})`,
          border: `1px solid color-mix(in srgb, ${V.primary} 55%, ${V.border})`,
          boxShadow: `0 0 44px color-mix(in srgb, ${V.primary} 35%, transparent)`,
        }}
      >
        <span className="text-[10px] font-extrabold uppercase" style={{ letterSpacing: "0.16em", color: V.muted }}>
          Science &amp; Space
        </span>
        <span className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: V.fg }}>
          Robotics Engineer
        </span>
      </motion.div>

      <motion.div className="relative z-[2] flex items-end gap-3 pt-1" variants={chipRow} initial="hidden" animate="shown">
        <StatChip label="Streak" color={V.gold}>
          <Flame size={16} strokeWidth={3} aria-hidden /> 13
        </StatChip>
        <StatChip label="Drop" color={V.primary}>
          <Sparkle size={16} strokeWidth={3} aria-hidden /> NEW
        </StatChip>
        <StatChip label="Time" color="var(--chart-2)">
          <Clock3 size={16} strokeWidth={3} aria-hidden /> 0:20
        </StatChip>
      </motion.div>

      <motion.div
        className="relative z-[2] flex w-full max-w-[340px] flex-col gap-2 pt-3"
        initial={{ y: 46, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={popAt(1.45)}
      >
        <button
          type="button"
          onClick={onClose}
          className={`w-full rounded-2xl px-6 py-3.5 text-[15px] font-extrabold uppercase tracking-wide cursor-pointer ${TACTILE_PRESS}`}
          style={{
            background: V.primary,
            color: V.primaryFg,
            borderColor: `color-mix(in srgb, ${V.primary} 55%, black)`,
          }}
        >
          Save to My Sky
        </button>
      </motion.div>
    </div>
  );
}

export function DailyDropDemo() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"streak" | "reveal">("streak");

  useEffect(() => {
    if (!open || phase !== "streak") return;
    const t = setTimeout(() => setPhase("reveal"), reduced ? 200 : 1750);
    return () => clearTimeout(t);
  }, [open, phase, reduced]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const launch = () => {
    setPhase(reduced ? "reveal" : "streak");
    setOpen(true);
  };

  return (
    <>
      {/* ——— The banner: flight reveal once, then the ambient hold ——— */}
      <button
        type="button"
        onClick={launch}
        className="relative block w-full cursor-pointer overflow-hidden rounded-3xl text-left"
        style={{ background: SKY, border: `1px solid ${V.border}`, minHeight: 236 }}
      >
        <NightSpecks />
        <FloatingDiamonds />
        <AuroraHorizon />
        <div className="relative z-[2] flex h-full min-h-[236px] max-w-[50%] flex-col justify-center gap-2 p-7">
          <span className="text-[11px] font-extrabold uppercase" style={{ letterSpacing: "0.16em", color: V.gold }}>
            Today&apos;s Drop
          </span>
          <span
            className="text-[22px] leading-[1.15] font-extrabold sm:text-[26px]"
            style={{ fontFamily: "var(--font-display)", color: V.fg }}
          >
            A new career is falling into view.
          </span>
          <span
            className="mt-2 inline-flex w-fit items-center rounded-full px-4 py-2 text-[12px] font-extrabold uppercase tracking-wide"
            style={{ background: V.primary, color: V.primaryFg }}
          >
            Open today&apos;s drop →
          </span>
        </div>

        {/* flight: Dreamy sweeps in once, then holds a drift; the light band
           streams behind, bleeding off the banner's corner */}
        <motion.div
          aria-hidden
          className="absolute top-[46%] right-[10%] z-[1] -translate-y-1/2"
          initial={reduced ? false : { x: 300, y: -140, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.25 } }}
        >
          <div className="relative -rotate-[16deg]">
            <div className="absolute right-[34%] top-1/2 -translate-y-1/2">
              <LightBand length={420} thickness={88} delay={0.5} />
            </div>
            <motion.div
              animate={reduced ? undefined : { x: [0, 8, 0, -8, 0], y: [0, -9, 0, 7, 0] }}
              transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <FlyingDreamy size={128} />
            </motion.div>
          </div>
        </motion.div>
      </button>

      {/* ——— The fullscreen takeover ——— */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: V.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {phase === "streak" ? <StreakPhase /> : <RevealPhase onClose={() => setOpen(false)} />}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-5 right-5 z-[2] flex size-9 items-center justify-center rounded-full"
              style={{ border: `1px solid ${V.border}`, color: V.muted, background: V.card }}
            >
              <X size={16} strokeWidth={2.5} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
