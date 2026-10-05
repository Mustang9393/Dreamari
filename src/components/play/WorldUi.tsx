"use client";

// Pieces of a career's own world, drawn on a beat the way AMT's departure
// board and Operations chat are (6 Oct 2026). Chandu, after the AMT board
// flipped to DELAYED: "we can get creative like this with the UI with the IB
// game and the Nursing game too. Show vitals, ecg, etc etc wherever they
// could work", picked up again the same night: "lets revisit the creative
// UI thinking we set aside for IB and Nursing, like we did for Aviation
// with the career relevant world UI like the departure board and the timer".
//
// Presentation only. Every word of the doc's copy stays where it was; these
// sit beside it. Nursing gets a bedside monitor (numbers and a live ECG
// trace; an alarm state for the beats where a patient is getting worse).
// IB gets the trading-floor wall clock: New York time in amber on black and
// a deadline that counts down, or reads DELIVERED when it was met.
//
// DEMO-ONLY: the monitor's readings are illustrative (a plausible set for
// "stable" and for "confused and breathing fast"), not patient data, and no
// script line depends on them.

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, Siren } from "lucide-react";
import type { Tier, WorldUi } from "./types";

const MONO = { fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" } as const;

/** `outcome` is the tier of the answer just locked on this beat, so the
 *  world can react to it the way AMT's board flips to DELAYED. */
export function WorldPanel({ ui, accent, outcome = null, cells }: { ui: WorldUi; accent: string; outcome?: Tier | null; cells?: { label: string; value: string }[] }) {
  if (ui.kind === "monitor") return <VitalsMonitor state={ui.state} time={ui.time} room={ui.room} accent={accent} outcome={outcome} />;
  return <DeskClock now={ui.now} deadline={ui.deadline} deadlineLabel={ui.deadlineLabel} status={ui.status} cells={cells} />;
}

// ------------------------------------------------------------- Nursing

const GREEN = "#3df58a";
const CYAN = "#5ad7ff";
const YELLOW = "#ffd23f";
const RED = "#ff5a5a";

/** One normal-sinus beat of ECG as an SVG path in a 100-wide, 40-tall box:
 *  flat, a small P bump, the QRS spike, a T wave, flat. Repeated across the
 *  strip; in alarm the strip runs faster (a higher rate). */
const BEAT_PATH = "M0 24 L14 24 L18 21 L22 24 L30 24 L33 27 L36 6 L39 32 L42 24 L52 24 L58 19 L64 24 L100 24";

/** The strip scrolls right to left at the displayed heart rate: six beats
 *  cross the strip in exactly six beats' worth of seconds, so 76 bpm reads
 *  as 76 and 118 as 118. (A scrolling strip, the way most bedside monitors
 *  show it; the old sweeping eraser moved the wrong way for a scroll.) */
function Trace({ alarm, hr }: { alarm: boolean; hr: number }) {
  const beats = 6;
  const seconds = (beats * 60) / hr;
  return (
    <div className="relative h-[64px] overflow-hidden rounded-[8px]" style={{ background: "repeating-linear-gradient(90deg, rgba(61,245,138,0.07) 0 1px, transparent 1px 12px), repeating-linear-gradient(180deg, rgba(61,245,138,0.07) 0 1px, transparent 1px 12px), #050a08" }}>
      <motion.svg
        viewBox={`0 0 ${100 * beats} 40`}
        preserveAspectRatio="none"
        className="absolute inset-y-0 h-full"
        style={{ width: "200%" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: seconds, ease: "linear", repeat: Infinity }}
        aria-hidden
      >
        {Array.from({ length: beats * 2 }, (_, i) => (
          <path key={i} d={BEAT_PATH} transform={`translate(${i * 100} 0)`} fill="none" stroke={alarm ? YELLOW : GREEN} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 3px ${alarm ? YELLOW : GREEN})` }} />
        ))}
      </motion.svg>
    </div>
  );
}

/** A bedside monitor: four readings and the trace. `alarm` is the picture
 *  of a patient getting worse (fast breathing, oxygen slipping, heart rate
 *  up) with the alarm chip lit and the two bad readings blinking. */
export function VitalsMonitor({ state, time, room = "Rm 12", accent, outcome = null }: { state: "stable" | "alarm"; time?: string; room?: string; accent: string; outcome?: Tier | null }) {
  const alarm = state === "alarm";
  // The answer moves the picture (Chandu, 6 Oct 2026: "make sure things
  // react properly too, based on selections"): a good call gets help to the
  // bedside and the numbers start to settle; a bad one and she keeps
  // getting worse. Only on an alarm beat; a steady monitor stays steady.
  const helped = alarm && (outcome === "best" || outcome === "acceptable");
  const worse = alarm && (outcome === "wrong" || outcome === "risky");
  const base = alarm ? { hr: 118, spo2: 92, rr: 28, bp: "138/88" } : { hr: 76, spo2: 98, rr: 16, bp: "118/76" };
  const target = helped ? { hr: 96, spo2: 96, rr: 22 } : worse ? { hr: 132, spo2: 87, rr: 34 } : { hr: base.hr, spo2: base.spo2, rr: base.rr };
  const [hr, setHr] = useState(base.hr);
  const [spo2, setSpo2] = useState(base.spo2);
  const [rr, setRr] = useState(base.rr);
  // The numbers breathe a little, the way a real monitor's do, so the
  // panel reads as live and not a printout; after an answer they drift
  // toward where that answer takes her, a step every tick.
  useEffect(() => {
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      const step = (cur: number, to: number, by: number) => (Math.abs(to - cur) <= by ? to : cur + Math.sign(to - cur) * by);
      setHr((cur) => step(cur, target.hr, 3) + [0, 1, -1, 0][tick % 4]);
      setSpo2((cur) => step(cur, target.spo2, 1) - (alarm && !helped && !worse ? [0, 0, 1, 0][tick % 4] : 0));
      setRr((cur) => step(cur, target.rr, 1));
    }, 1100);
    return () => window.clearInterval(id);
  }, [alarm, helped, worse, target.hr, target.spo2, target.rr]);
  const bad = alarm && !helped;
  const tile = (label: string, value: string | number, unit: string, color: string, bad = false) => (
    <motion.div
      key={label}
      className="flex min-w-0 flex-col rounded-[10px] px-[10px] py-[7px]"
      style={{ background: "rgba(255,255,255,0.04)", boxShadow: bad ? `inset 0 0 0 1px ${YELLOW}` : "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
      animate={bad ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
      transition={bad ? { duration: 0.9, repeat: Infinity } : undefined}
    >
      <span className="text-[9.5px] leading-[12px] font-bold tracking-[0.16em] uppercase" style={{ color: bad ? YELLOW : "rgba(255,255,255,0.55)" }}>{label}</span>
      <span className="flex items-baseline gap-[3px]">
        <span className="text-[24px] leading-[26px] font-extrabold" style={{ ...MONO, color: bad ? YELLOW : color }}>{value}</span>
        <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{unit}</span>
      </span>
    </motion.div>
  );
  return (
    <div
      role="img"
      aria-label={`Bedside monitor${helped ? ", help at the bedside" : alarm ? ", alarm" : ", stable"}: heart rate ${hr}, oxygen ${spo2} percent, breathing ${rr} a minute`}
      className="flex flex-col gap-[10px] rounded-[14px] px-[12px] py-[11px] sm:px-[14px]"
      style={{ background: "linear-gradient(180deg, #0a0f12, #07090c)", boxShadow: `inset 0 0 0 1px ${worse ? "rgba(255,90,90,0.5)" : bad ? "rgba(255,210,63,0.35)" : helped ? "rgba(61,245,138,0.35)" : "rgba(255,255,255,0.08)"}, inset 0 12px 24px -16px rgba(0,0,0,0.9), 0 14px 30px -18px rgba(0,0,0,0.9)` }}
    >
      <div className="flex items-center justify-between gap-[10px] text-[10.5px] font-extrabold tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
        <span className="flex items-center gap-[8px]">
          <span aria-hidden className="h-[7px] w-[7px] rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
          Riverbend · Four West · {room}
        </span>
        <span className="flex items-center gap-[8px]">
          {helped ? (
            <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 16 }} className="flex items-center gap-[4px] rounded-[5px] px-[6px] py-[2px] text-[9.5px] text-black" style={{ background: GREEN }}>
              <Check className="h-[10px] w-[10px]" strokeWidth={3} aria-hidden /> Help at bedside
            </motion.span>
          ) : alarm ? (
            <motion.span className="flex items-center gap-[4px] rounded-[5px] px-[6px] py-[2px] text-[9.5px] text-black" style={{ background: RED }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: worse ? 0.45 : 0.8, repeat: Infinity }}>
              <Siren className="h-[10px] w-[10px]" aria-hidden /> {worse ? "Deteriorating" : "Alarm"}
            </motion.span>
          ) : null}
          {time && <span style={{ ...MONO, color: "rgba(255,255,255,0.8)" }}>{time}</span>}
        </span>
      </div>
      <Trace alarm={bad} hr={hr} />
      <div className="grid grid-cols-4 gap-[6px]">
        {tile("HR", hr, "bpm", GREEN, worse)}
        {tile("SpO2", spo2, "%", CYAN, bad)}
        {tile("RR", rr, "/min", YELLOW, bad)}
        {tile("BP", base.bp, "", "#fff")}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ IB

const AMBER = "#ffb020";
const GOOD = "#3df58a";

/** True when a card's whole title is just a clock time ("7:00 P.M."), so
 *  the desk clock can stand in for it instead of saying it twice. */
export function isClockTitle(title: string): boolean {
  return /^\d{1,2}(:\d{2})?\s*(A\.?M\.?|P\.?M\.?)$/i.test(title.trim());
}

/** "3:00 PM" to minutes past midnight. */
function toMinutes(t: string): number {
  const m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i.exec(t.trim());
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if ((m[3] ?? "").toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2] ?? 0);
}
const two = (n: number) => String(n).padStart(2, "0");
function clockText(totalSec: number) {
  const s = ((totalSec % 86400) + 86400) % 86400;
  const h24 = Math.floor(s / 3600);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return { time: `${h}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`, ampm: h24 >= 12 ? "PM" : "AM" };
}

/** The desk clock on a trading floor: New York time ticking from the
 *  script's hour, and the deadline beside it counting down second by
 *  second (3:00 PM, due 6:00 PM, so 03:00:00 and falling). `status`
 *  "delivered" freezes the clock on the hour and sets the deadline side to
 *  DELIVERED in green: the deck went out. */
/** When each script hour first appeared on screen, so a run of beats that
 *  share an hour (7:00, her deadline, the rank) shows ONE clock still
 *  running, not a clock that resets to :00 on every screen (Chandu, 6 Oct
 *  2026: "when I click next from there I'm still in that same situation so
 *  why does the 7pm reset?"). An entry older than twenty minutes is stale
 *  (a replay) and starts again. */
const CLOCK_EPOCH = new Map<string, number>();
function epochFor(key: string): number {
  const t = CLOCK_EPOCH.get(key);
  if (t && Date.now() - t < 20 * 60 * 1000) return t;
  const fresh = Date.now();
  CLOCK_EPOCH.set(key, fresh);
  return fresh;
}

export function DeskClock({ now, deadline, deadlineLabel = "Deadline", status, cells = [] }: { now: string; deadline?: string; deadlineLabel?: string; status?: "due" | "delivered"; cells?: { label: string; value: string }[] }) {
  const startSec = useMemo(() => toMinutes(now) * 60, [now]);
  const dueSec = useMemo(() => (deadline ? toMinutes(deadline) * 60 : null), [deadline]);
  const key = `${now}|${deadline ?? ""}`;
  const [elapsed, setElapsed] = useState(() => (status === "delivered" ? 0 : Math.floor((Date.now() - epochFor(key)) / 1000)));
  useEffect(() => {
    if (status === "delivered") return;
    const t0 = epochFor(key);
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [status, key]);
  // A fact that names the same deadline the countdown already shows is the
  // countdown; the rest ride along as cells of their own.
  const extra = cells.filter((c) => c.label.toLowerCase() !== deadlineLabel.toLowerCase());
  const cur = clockText(startSec + elapsed);
  const left = dueSec !== null ? Math.max(0, dueSec - startSec - elapsed) : null;
  const leftText = left !== null ? `${two(Math.floor(left / 3600))}:${two(Math.floor((left % 3600) / 60))}:${two(left % 60)}` : null;
  const tight = left !== null && left < 60 * 60;
  const digits = "text-[30px] leading-[32px] font-extrabold tracking-[0.02em] sm:text-[36px] sm:leading-[38px]";
  return (
    <div
      className={`grid gap-[12px] rounded-[12px] px-[14px] py-[12px] sm:px-[16px] ${extra.length ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      style={{ background: "linear-gradient(180deg, #08090b, #101216)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 12px 24px -16px rgba(0,0,0,0.9), 0 14px 30px -18px rgba(0,0,0,0.9)" }}
    >
      <div className="flex flex-col gap-[4px]">
        <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>New York</span>
        <span className="flex items-baseline gap-[6px]" role="timer" aria-label={`${cur.time} ${cur.ampm}`}>
          <span className={digits} style={{ ...MONO, color: AMBER, textShadow: `0 0 14px color-mix(in srgb, ${AMBER} 60%, transparent)` }}>{cur.time}</span>
          <span className="text-[12px] font-extrabold" style={{ color: AMBER }}>{cur.ampm}</span>
        </span>
      </div>
      {(deadline || status === "delivered") && (
        <div className="flex flex-col gap-[4px] border-t pt-[10px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[14px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{deadlineLabel}</span>
          {status === "delivered" ? (
            <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }} className={`flex items-center gap-[8px] ${digits}`} style={{ ...MONO, color: GOOD, textShadow: `0 0 14px color-mix(in srgb, ${GOOD} 55%, transparent)` }}>
              <Check className="h-[26px] w-[26px]" strokeWidth={3} aria-hidden /> Delivered
            </motion.span>
          ) : (
            <motion.span className={digits} style={{ ...MONO, color: tight ? RED : "#fff", textShadow: tight ? `0 0 14px color-mix(in srgb, ${RED} 55%, transparent)` : undefined }} animate={tight ? { opacity: [1, 0.6, 1] } : { opacity: 1 }} transition={tight ? { duration: 1, repeat: Infinity } : undefined} role="timer" aria-label={`${deadlineLabel}: ${leftText} left`}>
              {leftText}
            </motion.span>
          )}
        </div>
      )}
      {extra.map((c) => (
        <div key={c.label} className="flex flex-col gap-[4px] border-t pt-[10px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[14px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{c.label}</span>
          <span className={digits} style={{ ...MONO, color: "#fff" }}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}
