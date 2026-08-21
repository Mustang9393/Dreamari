"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { Clock3, Flame, Sparkle, X } from "lucide-react";
import {
  SPRING_BOUNCY,
  SPRING_SOFT,
  TACTILE_PRESS,
  bobAnimate,
  bobTransition,
  popIn,
} from "./duo-motion";

// Bouncy pop with a start delay (variant transitions override the element
// transition prop, so delayed pops are declared inline with this helper).
const popAt = (delay: number): Transition => ({
  ...SPRING_BOUNCY,
  delay,
  opacity: { duration: 0.15, delay },
});

// Orchestration lives in the container variant so the chips pop one by one.
const chipRow: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.14, delayChildren: 0.85 } },
};

// Sequence 01 — Daily Drop. Banner plays one reveal (star + trail fly in,
// Dreamy pops in alongside), then holds an ambient loop where only the star's
// float and the trail flow keep moving. Clicking takes over the screen with
// the Duolingo lesson-complete grammar: diagonal streak band -> settle scene
// -> headline pop -> staggered stat chips -> CTA rises.

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

const TRAIL_BARS = [
  { w: 86, y: -26, delay: 0 },
  { w: 132, y: 0, delay: 0.35 },
  { w: 72, y: 26, delay: 0.7 },
];

function ShootingStar({ size = 108 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img alt="" src="/images/app/star-character.svg" className="block size-full max-w-none" />
      <img
        alt=""
        src="/images/app/star-face.svg"
        className="absolute top-[calc(50%+5px)] left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 0.64 }}
      />
    </div>
  );
}

// The trail: bars stream away behind the star forever (the "stays flowing"
// part of the banner loop).
function Trail({ tint = "rgba(255,255,255,0.85)" }: { tint?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute top-1/2 right-[72%] w-[220px] -translate-y-1/2">
      {TRAIL_BARS.map((bar, index) => (
        <motion.span
          key={index}
          className="absolute right-0 block h-[10px] rounded-full"
          style={{ width: bar.w, top: `calc(50% + ${bar.y}px)`, background: tint }}
          animate={reduced ? { opacity: 0.5 } : { x: [0, -46], opacity: [0.85, 0], scaleX: [1, 0.55] }}
          transition={{ duration: 1.1, delay: bar.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      {!reduced &&
        [0, 1, 2, 3].map((index) => (
          <motion.span
            key={`p${index}`}
            className="absolute block size-[7px] rounded-full"
            style={{ right: 20 + index * 42, top: `calc(50% + ${index % 2 ? -38 : 34}px)`, background: tint }}
            animate={{ x: [0, -34], opacity: [0.8, 0], scale: [1, 0.4] }}
            transition={{ duration: 0.9, delay: index * 0.28, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}

// Duolingo-style stat chip: bordered tile, tiny label riding the top border.
function StatChip({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
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

// Little gold diamonds that pop around the character, like the refs' sparkles.
function SparkleBurst() {
  const spots = [
    { x: -120, y: -60, s: 12 },
    { x: 118, y: -78, s: 9 },
    { x: -88, y: 52, s: 8 },
    { x: 132, y: 38, s: 11 },
    { x: 6, y: -112, s: 8 },
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

// Phase A of the takeover: the full-bleed diagonal band with the star (and
// Dreamy chasing it) streaking across, headline popping underneath.
function StreakPhase() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[-12%] top-[34%] h-[30vh] w-[124%] -rotate-[13deg]"
        style={{
          background: `linear-gradient(90deg, color-mix(in srgb, ${V.primary} 75%, ${V.purple}), ${V.primary})`,
          transformOrigin: "0% 50%",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute top-[42%] left-0 -rotate-[13deg]"
        initial={{ x: "-35vw", y: "8vh" }}
        animate={{ x: "108vw", y: "-14vh" }}
        transition={{ duration: reduced ? 0 : 1.15, ease: "easeInOut", delay: 0.25 }}
      >
        <div className="relative flex items-center">
          <Trail />
          <ShootingStar size={128} />
          <motion.img
            alt=""
            src="/images/dreamy/v2/dreamy-happy.png"
            className="absolute -left-[104px] top-[52px] w-[86px]"
            animate={reduced ? undefined : { y: [-5, 5] }}
            transition={{ ...SPRING_SOFT, repeat: Infinity, repeatType: "mirror" }}
          />
        </div>
      </motion.div>
      <motion.p
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={popAt(0.55)}
        className="absolute inset-x-0 top-[68%] text-center text-[34px] font-extrabold sm:text-[44px]"
        style={{ fontFamily: "var(--font-display)", color: V.gold }}
      >
        Today&apos;s Drop!
      </motion.p>
    </div>
  );
}

// Phase B: settle scene — Dreamy celebrates, headline, drop card, chips, CTA.
function RevealPhase({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="relative">
        <SparkleBurst />
        <motion.img
          alt="Dreamy celebrating"
          src="/images/dreamy/v2/dreamy-party.png"
          className="w-[150px] sm:w-[180px]"
          initial={{ scale: 0, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ ...SPRING_BOUNCY, opacity: { duration: 0.15 } }}
          style={{ transformOrigin: "50% 100%" }}
        />
      </div>

      <motion.h2
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={popAt(0.2)}
        className="text-[30px] font-extrabold sm:text-[38px]"
        style={{ fontFamily: "var(--font-display)", color: V.gold }}
      >
        Drop unlocked!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.3 }}
        className="max-w-[340px] text-[14px]"
        style={{ color: V.muted }}
      >
        A new career just landed in your sky.
      </motion.p>

      <motion.div
        initial={{ scale: 0, rotate: -6, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={popAt(0.5)}
        className="flex w-[250px] flex-col items-center gap-1 rounded-3xl px-6 py-5"
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

      <motion.div className="flex items-end gap-3 pt-1" variants={chipRow} initial="hidden" animate="shown">
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
        className="flex w-full max-w-[340px] flex-col gap-2 pt-3"
        initial={{ y: 46, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING_BOUNCY, delay: 1.3, opacity: { duration: 0.2, delay: 1.3 } }}
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
    const t = setTimeout(() => setPhase("reveal"), reduced ? 200 : 1650);
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
      {/* ——— The banner: one reveal, then ambient loop ——— */}
      <button
        type="button"
        onClick={launch}
        className="relative block w-full cursor-pointer overflow-hidden rounded-3xl text-left"
        style={{
          background: `linear-gradient(115deg, ${V.purple} 0%, color-mix(in srgb, ${V.purple} 55%, ${V.bg}) 60%, ${V.bg} 100%)`,
          border: `1px solid ${V.border}`,
          minHeight: 210,
        }}
      >
        <div className="relative z-[2] flex h-full min-h-[210px] max-w-[55%] flex-col justify-center gap-2 p-7">
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

        {/* Art side: star flies in once (outer = entrance), then only the bob
           and the trail keep moving (inner loops). */}
        <motion.div
          aria-hidden
          className="absolute top-1/2 right-[6%] z-[1] -translate-y-1/2"
          initial={reduced ? false : { x: 260, y: -150, opacity: 0, rotate: 10 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          transition={SPRING_BOUNCY}
        >
          <div className="relative -rotate-[14deg]">
            <Trail tint={`color-mix(in srgb, ${V.primaryFg} 80%, transparent)`} />
            <motion.div animate={reduced ? undefined : bobAnimate} transition={bobTransition}>
              <ShootingStar />
            </motion.div>
          </div>
        </motion.div>
        <motion.img
          aria-hidden
          alt=""
          src="/images/dreamy/v2/dreamy-happy.png"
          className="absolute bottom-[10px] right-[24%] z-[1] w-[74px]"
          initial={reduced ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={popAt(0.4)}
        />
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
