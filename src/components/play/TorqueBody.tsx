"use client";

// LOCAL EXPERIMENT (branch amt-torque-lab, not pushed). AMT screen 18, "follow
// the task sequence", as the job itself: set a torque wrench to the manual's
// mark, pull until it clicks, and stop at the click. Chandu, 5 Oct 2026: "can
// we do an interactive animated torque wrench usage with the clicking etc?"
//
// How a click-type torque wrench works, which is what this teaches: you dial
// in the setting, pull, and at that exact tightness the head breaks with a
// click you hear and feel. Keep pulling past it and you over-tighten the
// fitting, which can crack it. So: set, pull, stop at the click.

import { motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Question, type Resolve } from "./interactions";
import { playSelect, playTick, playTorqueClick, playWrong } from "./sound";
import type { TorqueBeat } from "./types";

const GRIP = "var(--world-building-construction)";
const OK = "var(--color-feedback-success)";
// How long you may keep pulling after the click before it counts as over.
const OVER_MS = 650;
// Seconds of pulling from loose to the set tightness.
const PULL_SECONDS = 2.6;

type Phase = "set" | "tighten" | "clicked" | "over" | "done";

export function TorqueBody({ beat, onResolve, locked }: { beat: TorqueBeat; onResolve: Resolve; locked: string | null }) {
  const [phase, setPhase] = useState<Phase>("set");
  const [setting, setSetting] = useState(0.18);
  const [tension, setTension] = useState(0);
  const [holding, setHolding] = useState(false);
  const inBand = Math.abs(setting - beat.target) <= beat.band;
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const clickedAt = useRef<number | null>(null);
  const lastTick = useRef(0);
  const head = useAnimationControls();
  const knob = useAnimationControls();

  // --- set: drag the scale to the manual's mark, let go inside it to lock.
  const commitSetting = () => {
    if (phase !== "set" || locked !== null) return;
    if (inBand) {
      playSelect();
      setSetting(beat.target);
      setPhase("tighten");
    } else {
      knob.start({ x: [0, -6, 6, -3, 0], transition: { duration: 0.35 } });
    }
  };

  // --- tighten: tension builds only while you hold; the head breaks at 1.
  // Kept in a ref (sounds and the click fire once, outside React's updaters)
  // and mirrored to state for the drawing.
  const tensionRef = useRef(0);
  const press = () => {
    if (locked !== null || (phase !== "tighten" && phase !== "clicked")) return;
    setHolding(true);
    last.current = null;
    // The pull loop, on a 30ms timer measured against the real clock rather
    // than animation frames: frames throttle on a busy Chromebook (and in
    // a hidden tab), the clock doesn't, so the click lands at the same
    // moment on every machine.
    const loop = () => {
      const now = performance.now();
      const dt = last.current === null ? 0 : (now - last.current) / 1000;
      last.current = now;
      const t = tensionRef.current;
      const next = Math.min(1.25, t + dt / PULL_SECONDS);
      tensionRef.current = next;
      if (Math.floor(next * 12) > lastTick.current && next < 1) {
        lastTick.current = Math.floor(next * 12);
        playTick();
      }
      if (t < 1 && next >= 1) {
        clickedAt.current = now;
        playTorqueClick();
        head.start({ rotate: [0, -7, 0], transition: { duration: 0.22 } });
        setPhase("clicked");
      }
      setTension(next);
      if (clickedAt.current !== null && now - clickedAt.current > OVER_MS) {
        // Kept pulling past the click: over-tightened.
        if (raf.current) window.clearInterval(raf.current);
        raf.current = null;
        setHolding(false);
        setPhase("over");
        playWrong();
        window.setTimeout(() => onResolve("wrong", beat.whenWrong), 900);
        return;
      }
    };
    raf.current = window.setInterval(loop, 30);
  };
  const release = useCallback(() => {
    if (raf.current) window.clearInterval(raf.current);
    raf.current = null;
    setHolding(false);
    if (phase === "clicked") {
      setPhase("done");
      window.setTimeout(() => onResolve("best", beat.whenRight), 700);
    }
  }, [phase, beat.whenRight, onResolve]);

  useEffect(() => () => {
    if (raf.current) window.clearInterval(raf.current);
  }, []);

  // The handle swings up as you pull (a re-grip swings it back between
  // pulls); the nut turns with it, a little less each pull as it seats.
  const swing = holding ? -Math.min(1, tension) * 26 : 0;
  const nutTurn = Math.min(1, tension) * 50;
  const overT = phase === "over";

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div
        className="relative overflow-hidden rounded-[14px]"
        style={{ background: "radial-gradient(120% 90% at 30% 40%, #2a2d33, #121317 70%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 40px -24px rgba(0,0,0,0.85)" }}
      >
        <svg viewBox="0 0 640 260" className="block h-auto w-full" role="img" aria-label="A torque wrench on a fluid-line fitting">
          <defs>
            <linearGradient id="tw-chrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2f4f7" />
              <stop offset="0.42" stopColor="#bfc5cd" />
              <stop offset="0.55" stopColor="#6c7480" />
              <stop offset="1" stopColor="#d9dde3" />
            </linearGradient>
            <linearGradient id="tw-line" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9aa1ab" />
              <stop offset="0.5" stopColor="#4b5059" />
              <stop offset="1" stopColor="#7d848e" />
            </linearGradient>
            <linearGradient id="tw-grip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${GRIP} 85%, white)` }} />
              <stop offset="0.5" style={{ stopColor: GRIP }} />
              <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${GRIP} 50%, black)` }} />
            </linearGradient>
          </defs>
          {/* the fluid line and the fitting it leaks from */}
          <rect x="0" y="122" width="170" height="16" rx="3" fill="url(#tw-line)" />
          <rect x="0" y="126" width="170" height="3" fill="rgba(255,255,255,0.22)" />
          {/* the drip that stops once it's tight */}
          {phase !== "done" && (
            <motion.circle cx="150" cy="150" r="4" fill="#c8a44a" animate={{ cy: [148, 200], opacity: [1, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeIn" }} />
          )}
          <g transform="translate(150 130)">
            <motion.polygon
              points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
              fill={overT ? "#b8453a" : "url(#tw-chrome)"}
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="1.5"
              animate={{ rotate: nutTurn }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <circle r="9" fill="#1a1c20" />
          </g>
          {/* the wrench, pivoting on the fitting */}
          <motion.g style={{ originX: "150px", originY: "130px" }} animate={{ rotate: swing }} transition={holding ? { duration: 0.08 } : { type: "spring", stiffness: 140, damping: 16 }}>
            <motion.g animate={head} style={{ originX: "150px", originY: "130px" }}>
              {/* ratchet head over the socket */}
              <circle cx="150" cy="130" r="40" fill="url(#tw-chrome)" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
              <circle cx="150" cy="130" r="30" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
              <circle cx="150" cy="130" r="8" fill="#2b2f35" />
              {/* tube */}
              <rect x="182" y="117" width="290" height="26" rx="8" fill="url(#tw-chrome)" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" />
              <rect x="190" y="121" width="270" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
              {/* the setting scale on the tube */}
              <rect x="360" y="119" width="96" height="22" rx="4" fill="#0e1013" />
              {Array.from({ length: 11 }, (_, i) => (
                <line key={i} x1={364 + i * 8.8} y1="121" x2={364 + i * 8.8} y2={i % 5 === 0 ? 133 : 128} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
              ))}
              <rect x={364 + (beat.target - beat.band) * 88} y="134" width={beat.band * 2 * 88} height="4" rx="2" fill={OK} opacity="0.85" />
              <polygon points="0,0 5,-8 -5,-8" fill={GRIP} transform={`translate(${364 + setting * 88} 139)`} />
              {/* grip */}
              <rect x="466" y="112" width="150" height="36" rx="14" fill="url(#tw-grip)" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" />
              {Array.from({ length: 9 }, (_, i) => (
                <line key={i} x1={482 + i * 14} y1="116" x2={482 + i * 14} y2="144" stroke="rgba(0,0,0,0.28)" strokeWidth="3" strokeLinecap="round" />
              ))}
            </motion.g>
          </motion.g>
          {/* the click */}
          {(phase === "clicked" || phase === "done") && (
            <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ originX: "150px", originY: "60px" }}>
              <text x="150" y="58" textAnchor="middle" fill="#fff" style={{ fontSize: 30, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>
                CLICK
              </text>
              {[-1, 1].map((s) => (
                <line key={s} x1={150 + s * 62} y1="48" x2={150 + s * 82} y2="40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              ))}
            </motion.g>
          )}
        </svg>
        {/* how tight it is, against the setting */}
        <div className="absolute inset-x-[14px] bottom-[12px] h-[6px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(1, tension / 1.25) * 100}%`,
              background: overT ? "var(--destructive)" : tension >= 1 ? OK : GRIP,
              transition: holding ? "none" : "width 200ms",
            }}
          />
          <span aria-hidden className="absolute top-[-3px] bottom-[-3px] w-[2px]" style={{ left: `${(1 / 1.25) * 100}%`, background: "rgba(255,255,255,0.8)" }} />
        </div>
      </div>

      {phase === "set" ? (
        <motion.div animate={knob} className="relative flex flex-col gap-[6px]">
          {/* the manual's mark, on the track itself */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-[10px] -translate-y-1/2 rounded-full"
            style={{ left: `${(beat.target - beat.band) * 100}%`, width: `${beat.band * 200}%`, background: OK, opacity: 0.55, boxShadow: `0 0 10px ${OK}` }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={setting}
            aria-label="Wrench setting"
            onChange={(event) => setSetting(Number(event.target.value))}
            onPointerUp={commitSetting}
            onKeyUp={(event) => {
              if (event.key === "Enter" || event.key === " ") commitSetting();
            }}
            className="relative w-full cursor-pointer"
            style={{ accentColor: inBand ? OK : GRIP }}
          />
        </motion.div>
      ) : (
        <button
          type="button"
          disabled={locked !== null || phase === "done" || phase === "over"}
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={() => holding && release()}
          onKeyDown={(event) => {
            if ((event.key === " " || event.key === "Enter") && !holding) {
              event.preventDefault();
              press();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") release();
          }}
          className="w-full cursor-pointer rounded-[var(--radius-md)] px-[18px] py-[14px] text-[15px] font-bold select-none disabled:cursor-default"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", touchAction: "none" }}
        >
          {holding ? "Pulling..." : phase === "done" ? "Tight" : "Hold to tighten"}
        </button>
      )}
    </div>
  );
}
