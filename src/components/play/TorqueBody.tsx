"use client";

// AMT screen 18, "follow the task sequence", as the job itself: set a torque
// wrench to the manual's mark, pull until it clicks, and stop at the click.
// Chandu, 5 Oct 2026: "can we do an interactive animated torque wrench usage
// with the clicking etc?", then 6 Oct: "it needs better graphics and UI and
// also when it gets to the hold to tighten thing and it rotates it loses its
// centre and the two things start to overlap and then move away from each
// other."
//
// How a click-type torque wrench works, which is what this teaches: you dial
// in the setting, pull, and at that exact tightness the head breaks with a
// click you hear and feel. Keep pulling past it and you over-tighten the
// fitting, which can crack it. So: set, pull, stop at the click.
//
// The pivot bug: the wrench rotated through framer's transform-origin in CSS
// pixels on an SVG that is scaled to fit, so the origin drifted off the nut
// as the box resized and the head and the fitting slid apart. Every
// rotation here is an SVG `rotate(deg cx cy)` attribute in viewBox units,
// about the nut's centre, so the head stays on the nut at any size.

import { animate, useMotionValueEvent, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Question, type Resolve } from "./interactions";
import { playRatchetBack, playSelect, playTorqueClick, playTorqueStrain, playWrong } from "./sound";
import type { TorqueBeat } from "./types";

const GRIP = "var(--world-building-construction)";
const OK = "var(--color-feedback-success)";
// How long you may keep pulling after the click before it counts as over.
const OVER_MS = 650;
const STEPS = ["Set", "Pull", "Let go at the click"];
// Seconds of pulling from loose to the set tightness, if the arc were
// unlimited.
const PULL_SECONDS = 2.6;
// How much of that one swing of the handle covers. Real tightening is a
// SEQUENCE: pull through the arc, let the ratchet run back, pull again,
// until the click (Chandu, 6 Oct 2026: "should it be one continuous hold to
// tighten or is it a sequence of turning the wrench?"). With 0.38 per
// pull the click lands partway through the third.
const PULL_ARC = 0.38;
// The nut's centre, in viewBox units: everything rotates about it.
const CX = 150;
const CY = 136;
// The handle rests a little below level and sweeps up through level to the
// click, so the whole wrench stays inside the panel at every angle.
const REST_DEG = 9;
const SWEEP_DEG = 20;

type Phase = "set" | "tighten" | "clicked" | "over" | "done";

export function TorqueBody({ beat, onResolve, locked }: { beat: TorqueBeat; onResolve: Resolve; locked: string | null }) {
  const [phase, setPhase] = useState<Phase>("set");
  const [setting, setSetting] = useState(0.18);
  const [tension, setTension] = useState(0);
  const [holding, setHolding] = useState(false);
  const inBand = Math.abs(setting - beat.target) <= beat.band;
  const timer = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const clickedAt = useRef<number | null>(null);
  const lastTick = useRef(0);
  const knobShake = useRef<HTMLDivElement>(null);

  // The handle's swing and the head's click shake, as degrees about the nut.
  // Springs so a re-grip swings the handle back smoothly; `jump` while
  // pulling so the handle follows the hand without lag.
  const swing = useSpring(REST_DEG, { stiffness: 140, damping: 16 });
  const [swingDeg, setSwingDeg] = useState(REST_DEG);
  useMotionValueEvent(swing, "change", (v) => setSwingDeg(v));
  const shake = useSpring(0, { stiffness: 900, damping: 30 });
  const [shakeDeg, setShakeDeg] = useState(0);
  useMotionValueEvent(shake, "change", (v) => setShakeDeg(v));

  // --- set: drag the scale to the manual's mark, let go inside it to lock.
  const commitSetting = () => {
    if (phase !== "set" || locked !== null) return;
    if (inBand) {
      playSelect();
      setSetting(beat.target);
      setPhase("tighten");
    } else {
      const el = knobShake.current;
      if (el) {
        el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 350 });
      }
    }
  };

  // --- tighten: tension builds only while you hold; the head breaks at 1.
  // Kept in a ref (sounds and the click fire once, outside React's updaters)
  // and mirrored to state for the drawing.
  const tensionRef = useRef(0);
  // Where this pull started, so one hold covers one arc of the handle.
  const pullFrom = useRef(0);
  const [arcEnd, setArcEnd] = useState(false);
  const press = () => {
    if (locked !== null || (phase !== "tighten" && phase !== "clicked")) return;
    setHolding(true);
    setArcEnd(false);
    pullFrom.current = tensionRef.current;
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
      // The handle stops at the end of its arc; past the click there is no
      // arc limit, because over-tightening is the mistake being taught.
      const limit = clickedAt.current !== null ? 1.25 : Math.min(1.25, pullFrom.current + PULL_ARC);
      const next = Math.min(limit, t + dt / PULL_SECONDS);
      tensionRef.current = next;
      swing.jump(REST_DEG - Math.min(1, (next - pullFrom.current) / PULL_ARC) * SWEEP_DEG);
      if (next >= limit && clickedAt.current === null) setArcEnd(true);
      if (Math.floor(next * 10) > lastTick.current && next < 1) {
        lastTick.current = Math.floor(next * 10);
        playTorqueStrain(next);
      }
      if (t < 1 && next >= 1) {
        clickedAt.current = now;
        playTorqueClick();
        animate(shake, [0, -7, 3, 0], { duration: 0.26 });
        setPhase("clicked");
      }
      setTension(next);
      if (clickedAt.current !== null && now - clickedAt.current > OVER_MS) {
        // Kept pulling past the click: over-tightened.
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setHolding(false);
        setPhase("over");
        playWrong();
        window.setTimeout(() => onResolve("wrong", beat.whenWrong), 900);
        return;
      }
    };
    timer.current = window.setInterval(loop, 30);
  };
  const release = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setHolding(false);
    // A re-grip: the handle ratchets back, the nut stays where it got to.
    if (tensionRef.current > 0.05 && phase === "tighten") playRatchetBack();
    setArcEnd(false);
    swing.set(REST_DEG);
    if (phase === "clicked") {
      setPhase("done");
      window.setTimeout(() => onResolve("best", beat.whenRight), 700);
    }
  }, [phase, beat.whenRight, onResolve, swing]);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  // The three steps of the job, and the one instruction for right now.
  const stepIndex = phase === "set" ? 0 : phase === "tighten" ? 1 : 2;
  const hint =
    phase === "set"
      ? "Drag the slider until the orange marker sits on the green mark."
      : phase === "tighten"
        ? holding
          ? arcEnd
            ? "End of the swing. Let go to ratchet back."
            : "Pull. Listen for the click."
          : tension > 0
            ? "Hold again for the next pull."
            : "Press and hold the button to pull the wrench. It takes a few pulls."
        : phase === "clicked"
          ? "Click! Let go now."
          : phase === "done"
            ? "Tight. You stopped at the click."
            : "You pulled past the click.";

  const nutTurn = Math.min(1, tension) * 50;
  const overT = phase === "over";
  const clicked = phase === "clicked" || phase === "done";
  const readout = Math.round(setting * 100);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div
        className="relative overflow-hidden rounded-[14px]"
        style={{ background: "linear-gradient(180deg, #30343b 0%, #1a1d22 55%, #121418 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.05), 0 18px 40px -24px rgba(0,0,0,0.85)" }}
      >
        <svg viewBox="0 0 640 260" className="block h-auto w-full" role="img" aria-label="A torque wrench on a hydraulic line fitting">
          <defs>
            <linearGradient id="tw-chrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f6f9" />
              <stop offset="0.38" stopColor="#c3c9d1" />
              <stop offset="0.52" stopColor="#6e7682" />
              <stop offset="0.7" stopColor="#9aa2ad" />
              <stop offset="1" stopColor="#dde1e7" />
            </linearGradient>
            <linearGradient id="tw-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a929d" />
              <stop offset="0.5" stopColor="#3f454e" />
              <stop offset="1" stopColor="#737b86" />
            </linearGradient>
            <linearGradient id="tw-tube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b9c0c9" />
              <stop offset="0.45" stopColor="#5a616b" />
              <stop offset="0.6" stopColor="#3b4149" />
              <stop offset="1" stopColor="#8d949e" />
            </linearGradient>
            <linearGradient id="tw-grip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${GRIP} 80%, white)` }} />
              <stop offset="0.45" style={{ stopColor: GRIP }} />
              <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${GRIP} 45%, black)` }} />
            </linearGradient>
            <radialGradient id="tw-head" cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#eef1f5" />
              <stop offset="0.55" stopColor="#aab2bc" />
              <stop offset="1" stopColor="#5c646f" />
            </radialGradient>
            <radialGradient id="tw-light" cx="0.3" cy="0.2" r="0.9">
              <stop offset="0" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <pattern id="tw-knurl" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="transparent" />
              <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(0,0,0,0.32)" strokeWidth="1.4" />
            </pattern>
            <pattern id="tw-knurl2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
            </pattern>
            <clipPath id="tw-window">
              <rect x="372" y="124" width="54" height="24" rx="4" />
            </clipPath>
          </defs>

          {/* The hangar panel behind: a riveted aluminium sheet under a work light. */}
          <rect x="0" y="0" width="640" height="260" fill="url(#tw-light)" />
          <line x1="0" y1="52" x2="640" y2="52" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="0" y1="232" x2="640" y2="232" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <circle cx={32 + i * 64} cy="52" r="3" fill="#2a2e35" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <circle cx={32 + i * 64} cy="232" r="3" fill="#2a2e35" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            </g>
          ))}

          {/* The hydraulic line coming in from the left, into the union. */}
          <rect x="0" y={CY - 9} width="104" height="18" rx="4" fill="url(#tw-tube)" />
          <rect x="0" y={CY - 5} width="104" height="3" fill="rgba(255,255,255,0.28)" />
          {/* The sleeve and the union body behind the nut. */}
          <rect x="100" y={CY - 15} width="26" height="30" rx="3" fill="url(#tw-steel)" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
          <rect x="104" y={CY - 11} width="18" height="3" fill="rgba(255,255,255,0.3)" />
          {/* The puddle and the drip that stops once it is tight. */}
          {phase !== "done" && (
            <>
              <ellipse cx="150" cy="226" rx="26" ry="4" fill="rgba(200,164,74,0.35)" />
              <circle cx="150" cy="170" r="4" fill="#d4ac4a" className="motion-safe:animate-[tw-drip_1.4s_ease-in_infinite]" style={{ transformOrigin: "150px 170px" }} />
            </>
          )}

          {/* The flare nut: a chrome hex with faceted shading that turns as
             it seats. Red, and cracked, once over-tightened. */}
          <g transform={`rotate(${nutTurn} ${CX} ${CY})`}>
            <polygon points={`${CX},${CY - 30} ${CX + 26},${CY - 15} ${CX + 26},${CY + 15} ${CX},${CY + 30} ${CX - 26},${CY + 15} ${CX - 26},${CY - 15}`} fill={overT ? "#b8453a" : "url(#tw-chrome)"} stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
            {/* facet shading */}
            <polygon points={`${CX},${CY - 30} ${CX + 26},${CY - 15} ${CX + 13},${CY - 7} ${CX},${CY - 15}`} fill="rgba(255,255,255,0.18)" />
            <polygon points={`${CX - 26},${CY + 15} ${CX},${CY + 30} ${CX},${CY + 15} ${CX - 13},${CY + 7}`} fill="rgba(0,0,0,0.22)" />
            <circle cx={CX} cy={CY} r="10" fill="#1a1c20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {overT && (
              <path d={`M${CX - 18} ${CY - 6} L${CX - 8} ${CY - 1} L${CX - 12} ${CY + 9} M${CX + 6} ${CY - 20} L${CX + 10} ${CY - 10} L${CX + 18} ${CY - 6}`} fill="none" stroke="#2b0d0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>

          {/* The wrench, pivoting on the nut. Both rotations are SVG attributes
             about (CX, CY), so the head never leaves the nut. */}
          <g transform={`rotate(${swingDeg} ${CX} ${CY})`}>
            <g transform={`rotate(${shakeDeg} ${CX} ${CY})`}>
              {/* ratchet head: outer ring, knurled rim, square drive */}
              <circle cx={CX} cy={CY} r="44" fill="url(#tw-head)" stroke="rgba(0,0,0,0.65)" strokeWidth="1.5" />
              <circle cx={CX} cy={CY} r="44" fill="url(#tw-knurl)" />
              <circle cx={CX} cy={CY} r="34" fill="url(#tw-chrome)" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" />
              <circle cx={CX} cy={CY} r="25" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5" />
              <rect x={CX - 7} y={CY - 7} width="14" height="14" rx="2" fill="#262a30" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              {/* direction lever on the back of the head */}
              <rect x={CX - 6} y={CY - 56} width="12" height="18" rx="3" fill="url(#tw-steel)" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
              {/* neck into the tube */}
              <path d={`M${CX + 40} ${CY - 14} L${CX + 62} ${CY - 15} L${CX + 62} ${CY + 15} L${CX + 40} ${CY + 14} Z`} fill="url(#tw-steel)" stroke="rgba(0,0,0,0.55)" strokeWidth="1" />
              {/* the beam */}
              <rect x={CX + 60} y={CY - 13} width="300" height="26" rx="9" fill="url(#tw-chrome)" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" />
              <rect x={CX + 70} y={CY - 9} width="282" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
              {/* the engraved scale along the beam: 0 to 100 in tens */}
              {Array.from({ length: 21 }, (_, i) => (
                <line key={i} x1={CX + 88 + i * 6.2} y1={CY + 2} x2={CX + 88 + i * 6.2} y2={i % 5 === 0 ? CY + 11 : CY + 7} stroke="rgba(20,24,30,0.7)" strokeWidth={i % 5 === 0 ? 1.4 : 1} />
              ))}
              {/* the manual's mark on the scale, and the setting pointer */}
              <rect x={CX + 88 + (beat.target - beat.band) * 124} y={CY + 11} width={beat.band * 2 * 124} height="3" rx="1.5" fill={OK} />
              <polygon points={`${CX + 88 + setting * 124},${CY + 3} ${CX + 92 + setting * 124},${CY - 4} ${CX + 84 + setting * 124},${CY - 4}`} fill={GRIP} stroke="rgba(0,0,0,0.5)" strokeWidth="0.8" />
              {/* the readout window */}
              <rect x="372" y="124" width="54" height="24" rx="4" fill="#0b0d10" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              <g clipPath="url(#tw-window)">
                <text x="399" y="141" textAnchor="middle" fill={inBand || phase !== "set" ? OK : "#f5f7fa"} style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>{readout}</text>
              </g>
              <text x="399" y="118" textAnchor="middle" fill="rgba(255,255,255,0.45)" style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.18em" }}>SET</text>
              {/* lock ring, then the grip */}
              <rect x="432" y={CY - 17} width="18" height="34" rx="4" fill="url(#tw-steel)" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
              <rect x="432" y={CY - 17} width="18" height="34" rx="4" fill="url(#tw-knurl)" />
              <rect x="452" y={CY - 19} width="160" height="38" rx="15" fill="url(#tw-grip)" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" />
              <rect x="452" y={CY - 19} width="160" height="38" rx="15" fill="url(#tw-knurl)" />
              <rect x="452" y={CY - 19} width="160" height="38" rx="15" fill="url(#tw-knurl2)" />
              <rect x="462" y={CY - 13} width="140" height="4" rx="2" fill="rgba(255,255,255,0.22)" />
              {/* end cap */}
              <rect x="606" y={CY - 15} width="14" height="30" rx="5" fill="url(#tw-steel)" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
            </g>
          </g>

          {/* The click: a flash ring off the head and the word. */}
          {clicked && (
            <g>
              <circle cx={CX} cy={CY} r="46" fill="none" stroke="#fff" strokeWidth="3" className="motion-safe:animate-[tw-ring_0.6s_ease-out_both]" style={{ transformOrigin: `${CX}px ${CY}px` }} />
              <g className="motion-safe:animate-[tw-pop_0.35s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ transformOrigin: `${CX}px 66px` }}>
                <text x={CX} y="72" textAnchor="middle" fill="#fff" style={{ fontSize: 30, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>
                  CLICK
                </text>
                {[-1, 1].map((s) => (
                  <g key={s}>
                    <line x1={CX + s * 64} y1="60" x2={CX + s * 84} y2="50" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    <line x1={CX + s * 68} y1="72" x2={CX + s * 90} y2="72" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </g>
                ))}
              </g>
            </g>
          )}
        </svg>

        {/* The pull gauge: how tight it is against the setting, the click
           marked where the head will break. */}
        <div className="absolute inset-x-[14px] bottom-[10px] flex items-center gap-[10px]">
          <span className="text-[9px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Pull</span>
          <div className="relative h-[8px] flex-1 overflow-visible rounded-full" style={{ background: "rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(1, tension / 1.25) * 100}%`,
                background: overT ? "var(--destructive)" : tension >= 1 ? OK : `linear-gradient(90deg, color-mix(in srgb, ${GRIP} 70%, black), ${GRIP})`,
                boxShadow: tension >= 1 && !overT ? `0 0 12px ${OK}` : undefined,
                transition: holding ? "none" : "width 200ms",
              }}
            />
            <span aria-hidden className="absolute top-[-5px] bottom-[-5px] w-[2px] rounded-full" style={{ left: `${(1 / 1.25) * 100}%`, background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.8)" }} />
            <span aria-hidden className="absolute top-[-18px] -translate-x-1/2 text-[8px] font-extrabold tracking-[0.16em] uppercase" style={{ left: `${(1 / 1.25) * 100}%`, color: "rgba(255,255,255,0.7)" }}>Click</span>
          </div>
        </div>
      </div>

      {/* First-time guidance: where you are in the job, and the one thing
         to do right now. */}
      <div className="flex flex-col gap-[8px]">
        <ol className="flex items-center gap-[6px]" aria-label="Steps">
          {STEPS.map((label, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li
                key={label}
                className="flex flex-1 items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[12px] font-extrabold"
                style={{
                  background: active ? `color-mix(in srgb, ${GRIP} 22%, transparent)` : "var(--glass-surface-1)",
                  color: active ? "var(--foreground)" : done ? OK : "var(--muted-foreground)",
                  border: `1px solid ${active ? GRIP : "transparent"}`,
                }}
                aria-current={active ? "step" : undefined}
              >
                <span className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[11px]" style={{ background: done ? OK : active ? GRIP : "color-mix(in srgb, var(--foreground) 14%, transparent)", color: "#05070f" }}>
                  {done ? "✓" : i + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <p
          key={hint}
          className={`text-[15px] font-bold motion-safe:animate-[fade-slide-up_0.25s_ease-out_both] ${phase === "clicked" ? "motion-safe:animate-[play-pulse_0.5s_ease-in-out_infinite]" : ""}`}
          style={{ color: phase === "clicked" ? OK : "var(--foreground)" }}
          aria-live="polite"
        >
          {hint}
        </p>
      </div>
      {phase === "set" ? (
        <div ref={knobShake} className="relative flex flex-col gap-[6px]">
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
        </div>
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
          {holding ? (arcEnd ? "Let go" : "Pulling...") : phase === "done" ? "Tight" : tension > 0 ? "Hold to pull again" : "Hold to pull"}
        </button>
      )}
    </div>
  );
}
