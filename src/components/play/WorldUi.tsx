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
  if (ui.kind === "mar") return <MarSheet outcome={outcome} />;
  // The board, the inbox and the wristband are drawn by their own bodies,
  // which hold the rows and the step they need.
  if (ui.kind !== "clock") return null;
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

// ------------------------------------------------- Nursing: the ward board

/** The call-light board at the station: one light per room in the rank,
 *  numbered in the order the student has them. Rooms come from the rows
 *  themselves ("Room 12 says..."). Once the rank is in, the lights go dark
 *  one by one in that order, the way a nurse clears them. */
export function CallLightBoard({ rows, locked, accent }: { rows: string[]; locked: boolean; accent: string }) {
  const rooms = rows.map((r) => /Room\s+(\d+)/i.exec(r)?.[1] ?? "?");
  return (
    <div className="flex items-center justify-between gap-[10px] rounded-[12px] px-[12px] py-[10px]" style={{ background: "linear-gradient(180deg, #0a0f12, #07090c)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 14px 30px -18px rgba(0,0,0,0.9)" }} role="img" aria-label={`Call lights on for rooms ${rooms.join(", ")}`}>
      <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.55)" }}>Four West · Call lights</span>
      <span className="flex gap-[8px]">
        {rooms.map((room, i) => (
          <motion.span
            key={room}
            layout
            className="relative flex h-[40px] w-[46px] flex-col items-center justify-center rounded-[8px]"
            style={{ background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
            animate={locked ? { opacity: [1, 1, 0.35] } : { opacity: 1 }}
            transition={locked ? { duration: 0.6, delay: 0.5 + i * 0.5, times: [0, 0.6, 1] } : undefined}
          >
            <motion.span aria-hidden className="absolute top-[4px] right-[5px] h-[6px] w-[6px] rounded-full" style={{ background: locked ? "rgba(255,255,255,0.25)" : accent, boxShadow: locked ? "none" : `0 0 8px ${accent}` }} animate={locked ? {} : { opacity: [1, 0.35, 1] }} transition={locked ? {} : { duration: 0.9 + i * 0.13, repeat: Infinity }} />
            <span className="text-[13px] leading-none font-extrabold" style={{ ...MONO, color: "#fff" }}>{room}</span>
            <span className="mt-[2px] text-[9px] leading-none font-bold" style={{ color: accent }}>{i + 1}</span>
          </motion.span>
        ))}
      </span>
    </div>
  );
}

/** The medication record: the day's doses as a sheet, with the 12:00 dose
 *  flagged OVERDUE. The answer writes the next line: a safe recovery charts
 *  it late with the real time; any other move leaves it overdue, in red. */
export function MarSheet({ outcome = null }: { outcome?: Tier | null }) {
  const INK = "#1b2a3a";
  const good = outcome === "best" || outcome === "acceptable";
  const bad = outcome === "wrong" || outcome === "risky";
  const row = (time: string, label: string, status: string, tone: string, strong = false) => (
    <div key={time} className="grid grid-cols-[52px_1fr_auto] items-center gap-[10px] border-t py-[7px] text-[13px]" style={{ borderColor: "rgba(27,42,58,0.14)", color: INK }}>
      <span className="font-extrabold" style={MONO}>{time}</span>
      <span className="font-semibold" style={{ color: "rgba(27,42,58,0.75)" }}>{label}</span>
      <span className={`rounded-[5px] px-[7px] py-[2px] text-[10px] font-extrabold tracking-[0.1em] uppercase ${strong ? "motion-safe:animate-[play-pulse_1s_ease-in-out_infinite]" : ""}`} style={{ background: tone, color: "#fff" }}>{status}</span>
    </div>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 12, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: -0.4 }} transition={{ type: "spring", stiffness: 240, damping: 22 }} className="rounded-[6px] px-[14px] pt-[10px] pb-[6px]" style={{ background: "linear-gradient(180deg, #fdfdfb, #f4f5f1)", boxShadow: "0 14px 30px -14px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.06)" }} role="img" aria-label={good ? "Medication record: 12:00 dose given late and charted with the real time" : "Medication record: 12:00 dose overdue"}>
      <p className="flex items-center justify-between text-[10px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "rgba(27,42,58,0.55)" }}>
        <span>Medication record · Four West</span>
        <span style={MONO}>Today</span>
      </p>
      <span aria-hidden className="mt-[6px] block h-[3px] w-full" style={{ background: "linear-gradient(90deg, #1f6fb2, #4fa3e3)" }} />
      <div className="mt-[4px]">
        {row("08:00", "Scheduled dose", "Given", "#2e9e6b")}
        {good ? row("12:00", "Scheduled dose", "Given late · real time", "#2e9e6b") : row("12:00", "Scheduled dose", bad ? "Still overdue" : "Overdue", "#c93838", !bad)}
        {row("16:00", "Scheduled dose", "Due", "#8a94a6")}
      </div>
    </motion.div>
  );
}

/** A patient wristband: the two things that belong to the person and not
 *  the room. Scanning it is the right answer; a scan sweep runs and the
 *  band checks green when it is picked, red when it is not. */
export function Wristband({ outcome = null, accent }: { outcome?: "right" | "wrong" | null; accent: string }) {
  const tone = outcome === "right" ? GREEN : outcome === "wrong" ? RED : "rgba(255,255,255,0.5)";
  return (
    <div className="relative mx-auto w-full max-w-[420px]" role="img" aria-label="Patient wristband with name and date of birth">
      <motion.div initial={{ opacity: 0, y: 10, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="relative overflow-hidden rounded-full px-[18px] py-[9px]" style={{ background: "linear-gradient(180deg, #fbfbfd, #e6e9f0)", boxShadow: "0 12px 26px -14px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(0,0,0,0.08)" }}>
        <div className="grid grid-cols-[1fr_auto] items-center gap-[12px]">
          <div className="flex flex-col gap-[2px] text-[#1b2a3a]">
            <span className="text-[8.5px] font-extrabold tracking-[0.2em] uppercase" style={{ color: "rgba(27,42,58,0.55)" }}>Riverbend Medical Center</span>
            <span className="flex gap-[14px] text-[11px] font-extrabold">
              <span>NAME <span className="ml-[4px] inline-block h-[8px] w-[72px] rounded-[2px] align-middle" style={{ background: "rgba(27,42,58,0.25)" }} /></span>
              <span>DOB <span className="ml-[4px] inline-block h-[8px] w-[48px] rounded-[2px] align-middle" style={{ background: "rgba(27,42,58,0.25)" }} /></span>
            </span>
          </div>
          <span aria-hidden className="flex h-[26px] items-end gap-[1.5px]">
            {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2].map((w, i) => <span key={i} className="block h-full bg-[#1b2a3a]" style={{ width: w }} />)}
          </span>
        </div>
        {outcome === "right" && (
          <motion.span aria-hidden className="absolute inset-y-0 w-[18%]" style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${GREEN} 55%, transparent), transparent)` }} initial={{ left: "-20%" }} animate={{ left: "110%" }} transition={{ duration: 0.7, ease: "easeInOut" }} />
        )}
      </motion.div>
      {outcome && (
        <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: outcome === "right" ? 0.6 : 0, type: "spring", stiffness: 320, damping: 16 }} className="absolute -top-[10px] -right-[6px] flex h-[28px] w-[28px] items-center justify-center rounded-full text-black" style={{ background: tone, boxShadow: `0 0 14px ${tone}` }}>
          {outcome === "right" ? <Check className="h-[16px] w-[16px]" strokeWidth={3} aria-hidden /> : <span className="text-[14px] font-extrabold leading-none">×</span>}
        </motion.span>
      )}
      <span className="sr-only">{accent}</span>
    </div>
  );
}

// ------------------------------------------------------- IB: the inbox

/** The rapid round's question as an email in the Cobalt Capital inbox:
 *  the header bar, who it is from, the question as the subject line. The
 *  replies underneath stay the beat's own options. */
export function InboxHeader({ from, role, subject, index, total }: { from: string; role: string; subject: string; index: number; total: number }) {
  return (
    <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 70%, transparent)" }}>
      <div className="flex items-center justify-between border-b px-[12px] py-[7px] text-[10.5px] font-extrabold tracking-[0.14em] uppercase" style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
        <span>Inbox · Cobalt Capital</span>
        <span style={MONO}>{index + 1} / {total}</span>
      </div>
      <div className="flex items-start gap-[10px] px-[12px] py-[10px]">
        <span aria-hidden className="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 30%, var(--glass-surface-2))", color: "var(--foreground)" }}>{from.slice(0, 2).toUpperCase()}</span>
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>{from} · {role}</span>
          <span className="text-[16px] leading-snug font-extrabold" style={{ color: "var(--foreground)" }}>{subject}</span>
        </span>
      </div>
    </div>
  );
}

/** A red-pen circle around one word on the page: the reviewer's mark,
 *  drawn when the line with the mistakes is picked. */
export function PenCircle({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="relative inline-block">
      {children}
      <motion.svg aria-hidden className="pointer-events-none absolute -inset-x-[7px] -inset-y-[5px] h-[calc(100%+10px)] w-[calc(100%+14px)]" viewBox="0 0 100 40" preserveAspectRatio="none">
        <motion.path d="M8 20 C10 6, 90 4, 94 18 C97 32, 14 38, 6 24 C3 16, 20 8, 40 7" fill="none" stroke="#e23b3b" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay, duration: 0.5, ease: "easeOut" }} />
      </motion.svg>
    </span>
  );
}

/** The picked line from the page, re-set on the verdict with the reviewer's
 *  circles drawn on it, since the verdict card covers the page the moment a
 *  line is tapped. `paper` picks the sheet it came from. */
export function MarkedLine({ label, marks, paper }: { label: string; marks: string[]; paper: "chart" | "slide" }) {
  const chart = paper === "chart";
  const parts: React.ReactNode[] = [];
  let rest = label;
  let k = 0;
  for (const word of marks) {
    const at = rest.indexOf(word);
    if (at < 0) continue;
    parts.push(rest.slice(0, at));
    parts.push(<PenCircle key={`${word}-${k}`} delay={0.3 + k * 0.4}>{word}</PenCircle>);
    k += 1;
    rest = rest.slice(at + word.length);
  }
  parts.push(rest);
  return (
    <motion.p
      initial={{ opacity: 0, y: 8, rotate: chart ? -1 : 0 }}
      animate={{ opacity: 1, y: 0, rotate: chart ? -0.5 : 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="m-0 rounded-[6px] px-[16px] py-[12px] text-[16px] leading-[26px] font-semibold"
      style={chart ? { background: "linear-gradient(180deg, #fdfdfb, #f4f5f1)", color: "#1b2a3a", boxShadow: "0 14px 30px -14px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.06)", fontFamily: "var(--font-display)" } : { background: "linear-gradient(160deg, #0d1733, #0a1024)", color: "#e9eef7", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
    >
      {parts}
    </motion.p>
  );
}

/** What a storage zone did with the client file, shown on the verdict (the
 *  zone grid is gone by then): the data room's padlock shut, the chat
 *  passing it on, the drive keeping it as yours. */
export function ZoneBadge({ label, tone }: { label: string; tone: string }) {
  const data = /data room/i.test(label);
  const chat = /chat/i.test(label);
  return (
    <motion.span initial={{ scale: 0.7, opacity: 0, y: 6 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.2 }} className="flex w-fit items-center gap-[8px] rounded-full px-[12px] py-[6px] text-[12px] font-extrabold tracking-[0.08em] uppercase" style={{ background: `color-mix(in srgb, ${tone} 18%, transparent)`, color: tone, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 55%, transparent)` }}>
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full" style={{ background: tone, color: "#05070f" }}>
        {data ? (
          <motion.svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <motion.path d="M8 10V7a4 4 0 0 1 8 0v3" initial={{ y: -3 }} animate={{ y: 0 }} transition={{ delay: 0.55, type: "spring", stiffness: 500, damping: 18 }} />
          </motion.svg>
        ) : (
          <Check className="h-[13px] w-[13px]" strokeWidth={3} aria-hidden />
        )}
      </span>
      {label} · {data ? "Locked" : chat ? "Shared" : "Personal"}
    </motion.span>
  );
}
