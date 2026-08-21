"use client";

import { useState } from "react";
import { motion, useAnimate, useReducedMotion } from "framer-motion";
import { CloudMoon, Play, RotateCcw, Star, Zap } from "lucide-react";
import {
  SPRING_BOUNCY,
  SQUISH_KEYFRAMES,
  SQUISH_TRANSITION,
  TACTILE_PRESS,
  bobAnimate,
  bobTransition,
  popIn,
} from "./duo-motion";

// Local motion sandbox — NOT wired into any product page. Primitives proven
// here get lifted into real pages by importing from duo-motion.ts.

const V = {
  bg: "var(--background)",
  fg: "var(--foreground)",
  card: "var(--card)",
  border: "var(--border)",
  muted: "var(--muted-foreground, color-mix(in srgb, var(--foreground) 55%, transparent))",
  primary: "var(--primary)",
  primaryFg: "var(--primary-foreground)",
};

function Station({
  title,
  note,
  action,
  children,
}: {
  title: string;
  note: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: V.card, border: `1px solid ${V.border}` }}
    >
      <header>
        <h2 className="text-[13px] font-semibold uppercase" style={{ letterSpacing: "0.14em" }}>
          {title}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: V.muted }}>
          {note}
        </p>
      </header>
      <div className="h-40 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: V.bg }}>
        {children}
      </div>
      {action}
    </section>
  );
}

function ReplayButton({ onClick, label = "Replay" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
      style={{ border: `1px solid ${V.border}`, color: V.fg }}
    >
      <RotateCcw size={12} strokeWidth={2.5} aria-hidden />
      {label}
    </button>
  );
}

// 1. Bouncy spring: pop-in entrance + elastic hover/tap on the same physics.
function BouncyStation() {
  const [run, setRun] = useState(0);
  return (
    <Station
      title="Bouncy spring"
      note="stiffness 400 · damping 15 · mass 0.8 — entrances, taps, rewards"
      action={<ReplayButton onClick={() => setRun((n) => n + 1)} />}
    >
      <motion.div
        key={run}
        variants={popIn}
        initial="hidden"
        animate="shown"
        whileHover={{ scale: 1.12, rotate: -4 }}
        whileTap={{ scale: 0.88 }}
        transition={SPRING_BOUNCY}
        className="w-20 h-20 rounded-3xl flex items-center justify-center cursor-pointer"
        style={{ background: V.primary, color: V.primaryFg }}
      >
        <Star size={36} strokeWidth={2.5} fill="currentColor" aria-hidden />
      </motion.div>
    </Station>
  );
}

// 2. Soft spring: an ambient bob loop (mirrored spring, never keyframe-eased).
function SoftStation() {
  const reduced = useReducedMotion();
  return (
    <Station title="Soft spring" note="stiffness 150 · damping 12 — floating idle loops, mascots, hints">
      <motion.div
        animate={reduced ? undefined : bobAnimate}
        transition={bobTransition}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${V.primary} 22%, ${V.card})`,
          border: `1px solid ${V.border}`,
          color: V.fg,
        }}
      >
        <CloudMoon size={34} strokeWidth={2} aria-hidden />
      </motion.div>
    </Station>
  );
}

// 3. Squish: drop on the bouncy spring, then compress Y / expand X on impact.
function SquishStation() {
  const [scope, animate] = useAnimate();
  const play = async () => {
    await animate(scope.current, { y: [-96, 0] }, SPRING_BOUNCY);
    await animate(scope.current, SQUISH_KEYFRAMES, SQUISH_TRANSITION);
  };
  return (
    <Station
      title="Squish impact"
      note="scaleY 0.85 · scaleX 1.15 on landing, overshoot, settle"
      action={<ReplayButton onClick={play} label="Drop" />}
    >
      <div className="flex flex-col items-center gap-0">
        <div
          ref={scope}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: V.primary, color: V.primaryFg, transformOrigin: "50% 100%" }}
        >
          <Zap size={34} strokeWidth={2.5} fill="currentColor" aria-hidden />
        </div>
        <div className="w-24 h-1 rounded-full mt-1" style={{ background: V.border }} />
      </div>
    </Station>
  );
}

// 4. Tactile 3D-flat press: pure Tailwind/CSS, no JS — the bottom border is
// the depth, pressing removes it and drops the face 4px.
function TactileStation() {
  return (
    <Station title="Tactile press" note="border-b-4 → active:border-b-0 + translate-y-[4px], CSS only">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className={`rounded-2xl px-6 py-3 text-[15px] font-extrabold uppercase tracking-wide cursor-pointer ${TACTILE_PRESS}`}
          style={{
            background: V.primary,
            color: V.primaryFg,
            borderColor: `color-mix(in srgb, ${V.primary} 55%, black)`,
          }}
        >
          Continue
        </button>
        <button
          type="button"
          className={`rounded-2xl px-6 py-3 text-[15px] font-extrabold uppercase tracking-wide cursor-pointer ${TACTILE_PRESS}`}
          style={{
            background: V.card,
            color: V.fg,
            borderColor: `color-mix(in srgb, black 45%, ${V.card})`,
            boxShadow: `inset 0 0 0 1px ${V.border}`,
          }}
        >
          Skip
        </button>
      </div>
    </Station>
  );
}

export function MotionLab() {
  return (
    <div className="marketing-v2">
      <div
        className="min-h-dvh px-5 py-10 sm:px-10"
        style={{ background: V.bg, color: V.fg, fontFamily: "var(--font-body)" }}
      >
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-8">
          <header>
            <p className="text-[12px] font-semibold uppercase" style={{ letterSpacing: "0.16em", color: V.muted }}>
              Local sandbox · not linked from the app
            </p>
            <h1 className="font-display text-3xl sm:text-4xl mt-2">Motion Lab</h1>
            <p className="text-[14px] mt-2 max-w-xl" style={{ color: V.muted }}>
              Duolingo-style movement primitives, defined once in{" "}
              <code className="text-[13px]">duo-motion.ts</code>. Sequences get built on the stage below, then lifted
              into product pages.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <BouncyStation />
            <SoftStation />
            <SquishStation />
            <TactileStation />
          </div>

          <section
            className="rounded-3xl min-h-[420px] flex flex-col items-center justify-center gap-3"
            style={{ border: `2px dashed ${V.border}`, background: `color-mix(in srgb, ${V.card} 45%, transparent)` }}
          >
            <Play size={28} strokeWidth={2} style={{ color: V.muted }} aria-hidden />
            <p className="text-[13px] font-semibold uppercase" style={{ letterSpacing: "0.14em", color: V.muted }}>
              Stage — awaiting first sequence
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
