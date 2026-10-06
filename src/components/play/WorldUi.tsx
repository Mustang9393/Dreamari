"use client";

// The world-UI instrument library (6 Oct 2026). Pieces of a career's own
// world drawn beside a beat, the way AMT's departure board is: a bedside
// monitor, a desk clock, a lights board, a record sheet, an inbox, a badge
// reader, an elevator. Chandu: "we can get creative like this with the UI
// with the IB game and the Nursing game too", then "make sure things react
// properly too, based on selections", then "are these all scalable? ...
// there will be eventually 900 careers."
//
// So the library is built to scale, not to three careers:
// - Every instrument is a generic KIND with its content in data
//   (`Beat.world`, see types.ts `WorldUi` and docs/handoff/specs/world-ui.md).
//   A generator picks a kind and fills its fields from the script.
// - No instrument names a firm, a ward or a person. Names come from
//   `WorldContext` (the simulation's `firm`, the level's `place`), which the
//   player provides once.
// - Looks come from the career WORLD, not the career: `worldSkin()` maps the
//   app's worlds to a paper stock and a device palette, so a new career
//   inherits its world's skin. Two primitives, `Paper` and `Device`, carry
//   that skin; every instrument is built from them, with one header line,
//   one rule, one row grid and one chip style.
// - Every instrument that can react takes `outcome` (the picked answer's
//   tier) and decides its own reaction.
//
// DEMO-ONLY: the monitor's readings are illustrative, not patient data, and
// no script line depends on them.

import { motion } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, Siren } from "lucide-react";
import type { Tier, WorldUi } from "./types";

// ------------------------------------------------------------ context

/** Who and where this level is, so instruments never hard-code a name. */
export type WorldInfo = { firm: string; place?: string; world: string };
export const WorldContext = createContext<WorldInfo>({ firm: "", world: "" });
export function useWorld(): WorldInfo {
  return useContext(WorldContext);
}

// ------------------------------------------------------------- tokens

export const MONO = { fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" } as const;
export const INK = "#1c2433";
export const INK_MUTED = "rgba(28,36,51,0.56)";
export const INK_RULE = "rgba(28,36,51,0.12)";
const GREEN = "#3df58a";
const CYAN = "#5ad7ff";
const YELLOW = "#ffd23f";
const RED = "#ff5a5a";
const AMBER = "#ffb020";
const GOOD = GREEN;
const OK_INK = "#2e9e6b";
const BAD_INK = "#c93838";
const DUE_INK = "#8a94a6";

export type WorldSkin = { paper: string; paperEdge: string; device: string; glow: string };

/** The world's skin: a paper stock and a device palette. Worlds that share
 *  a feel share a skin; a new career inherits its world's. Names match
 *  `WORLD_COLORS` in components/app/worlds.ts. */
export function worldSkin(world: string): WorldSkin {
  switch (world) {
    case "Health & Medicine":
    case "Science & Research":
    case "Counseling & Social Work":
      return { paper: "linear-gradient(180deg, #fdfdfc 0%, #f3f5f6 100%)", paperEdge: "rgba(0,0,0,0.05)", device: "linear-gradient(180deg, #0a0f12 0%, #07090c 100%)", glow: GREEN };
    case "Fixing Machines & Engines":
    case "Driving, Flying & Shipping":
    case "Building & Construction":
    case "Factories & Making Things":
      return { paper: "linear-gradient(180deg, #f9f4e8 0%, #ede4d2 100%)", paperEdge: "rgba(0,0,0,0.07)", device: "linear-gradient(180deg, #0b0c0f 0%, #121419 100%)", glow: YELLOW };
    case "Tech & Engineering":
      return { paper: "linear-gradient(180deg, #fcfcfd 0%, #f1f3f8 100%)", paperEdge: "rgba(0,0,0,0.05)", device: "linear-gradient(180deg, #090c14 0%, #070910 100%)", glow: CYAN };
    default:
      return { paper: "linear-gradient(180deg, #fcfbf6 0%, #f3f0e7 100%)", paperEdge: "rgba(0,0,0,0.06)", device: "linear-gradient(180deg, #0b0e13 0%, #070a0e 100%)", glow: AMBER };
  }
}

// --------------------------------------------------------- primitives

/** A sheet of the world's paper: header line (title left, meta right), a
 *  rule in the world colour, then the rows. Lands with a soft settle. */
export function Paper({ title, meta, accent, children, tilt = -0.4, label, className = "" }: { title: string; meta?: string; accent: string; children: React.ReactNode; tilt?: number; label?: string; className?: string }) {
  const skin = worldSkin(useWorld().world);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotate: tilt * 2.5 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={`relative w-full rounded-[8px] px-[16px] pt-[11px] pb-[12px] text-left ${className}`}
      style={{ background: skin.paper, color: INK, boxShadow: `0 24px 48px -26px rgba(0,0,0,0.75), 0 2px 0 rgba(0,0,0,0.05), inset 0 0 0 1px ${skin.paperEdge}` }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div className="flex items-baseline justify-between gap-[12px]">
        <span className="truncate text-[10px] leading-[14px] font-extrabold tracking-[0.18em] uppercase" style={{ color: INK_MUTED }}>{title}</span>
        {meta && <span className="flex-none text-[10px] leading-[14px] font-extrabold tracking-[0.12em] uppercase" style={{ ...MONO, color: INK_MUTED }}>{meta}</span>}
      </div>
      <span aria-hidden className="mt-[8px] mb-[2px] block h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 30%, transparent))` }} />
      {children}
    </motion.div>
  );
}

/** A piece of the world's equipment: dark glass, one inner stroke, a header
 *  line in tracked caps, then the face of the device. */
export function Device({ left, right, children, tone, className = "", label }: { left?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; tone?: string; className?: string; label?: string }) {
  const skin = worldSkin(useWorld().world);
  return (
    <div
      className={`flex flex-col gap-[10px] rounded-[14px] px-[14px] py-[12px] ${className}`}
      style={{ background: skin.device, boxShadow: `inset 0 0 0 1px ${tone ? `color-mix(in srgb, ${tone} 40%, transparent)` : "rgba(255,255,255,0.07)"}, inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 36px -22px rgba(0,0,0,0.9)` }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {(left || right) && (
        <div className="flex items-center justify-between gap-[10px] text-[10px] leading-[14px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.55)" }}>
          <span className="flex min-w-0 items-center gap-[8px]">{left}</span>
          <span className="flex flex-none items-center gap-[8px]">{right}</span>
        </div>
      )}
      {children}
    </div>
  );
}

/** A small status pill, on paper or on a device. */
export function Chip({ children, tone, dark = false, pulse = false }: { children: React.ReactNode; tone: string; dark?: boolean; pulse?: boolean }) {
  return (
    <motion.span
      className="inline-flex h-[20px] items-center gap-[4px] rounded-[5px] px-[7px] text-[9.5px] leading-none font-extrabold tracking-[0.12em] whitespace-nowrap uppercase"
      style={{ background: tone, color: dark ? "#05070f" : "#fff" }}
      animate={pulse ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
      transition={pulse ? { duration: 0.9, repeat: Infinity } : undefined}
    >
      {children}
    </motion.span>
  );
}

/** A lit dot on a device. */
function Led({ color, pulse = true }: { color: string; pulse?: boolean }) {
  return <motion.span aria-hidden className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} animate={pulse ? { opacity: [1, 0.35, 1] } : { opacity: 1 }} transition={pulse ? { duration: 1.4, repeat: Infinity } : undefined} />;
}

// -------------------------------------------------------------- panel

/** Draws a beat's `world`. `outcome` is the tier of the answer just
 *  locked, so the instrument can react. `cells` are a card's facts folded
 *  into a clock. Kinds whose bodies hold their own state (lights, inbox,
 *  wristband, sheet) are drawn by those bodies and return nothing here. */
export function WorldPanel({ ui, accent, outcome = null, cells }: { ui: WorldUi; accent: string; outcome?: Tier | null; cells?: { label: string; value: string }[] }) {
  switch (ui.kind) {
    case "monitor":
      return <VitalsMonitor state={ui.state} time={ui.time} room={ui.room} place={ui.place} accent={accent} outcome={outcome} />;
    case "record":
      return <RecordSheet title={ui.title} rows={ui.rows} labels={ui.labels} accent={accent} outcome={outcome} />;
    case "elevator":
      return <Elevator floor={ui.floor} label={ui.label} />;
    case "badge":
      return <IdBadge org={ui.org} role={ui.role} accent={accent} />;
    case "clock":
      return <DeskClock now={ui.now} deadline={ui.deadline} deadlineLabel={ui.deadlineLabel} status={ui.status} zone={ui.zone} cells={[...(ui.cells ?? []), ...(cells ?? [])]} />;
    default:
      return null;
  }
}

// ----------------------------------------------------- live readout

/** One normal-sinus beat of ECG in a 100 x 40 box, repeated across the
 *  strip. The strip scrolls at the displayed heart rate: six beats cross in
 *  six beats' worth of seconds. */
const BEAT_PATH = "M0 24 L14 24 L18 21 L22 24 L30 24 L33 27 L36 6 L39 32 L42 24 L52 24 L58 19 L64 24 L100 24";

function Trace({ alarm, hr, color }: { alarm: boolean; hr: number; color: string }) {
  const beats = 6;
  const seconds = (beats * 60) / hr;
  const line = alarm ? YELLOW : color;
  return (
    <div className="relative h-[72px] overflow-hidden rounded-[8px]" style={{ background: `repeating-linear-gradient(90deg, color-mix(in srgb, ${line} 8%, transparent) 0 1px, transparent 1px 12px), repeating-linear-gradient(180deg, color-mix(in srgb, ${line} 8%, transparent) 0 1px, transparent 1px 12px), #04070a` }}>
      <motion.svg viewBox={`0 0 ${100 * beats} 40`} preserveAspectRatio="none" className="absolute inset-y-0 h-full" style={{ width: "200%" }} animate={{ x: ["0%", "-50%"] }} transition={{ duration: seconds, ease: "linear", repeat: Infinity }} aria-hidden>
        {Array.from({ length: beats * 2 }, (_, i) => (
          <path key={i} d={BEAT_PATH} transform={`translate(${i * 100} 0)`} fill="none" stroke={line} strokeWidth="1.7" vectorEffect="non-scaling-stroke" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 3px ${line})` }} />
        ))}
      </motion.svg>
    </div>
  );
}

/** A bedside monitor: four readings and the trace. `alarm` is a patient
 *  getting worse; the answer moves the picture (a good call brings help and
 *  the numbers settle, a bad one and she worsens). */
export function VitalsMonitor({ state, time, room, place, accent, outcome = null }: { state: "stable" | "alarm"; time?: string; room?: string; place?: string; accent: string; outcome?: Tier | null }) {
  const info = useWorld();
  const where = [info.firm.split(" ")[0], place ?? info.place, room].filter(Boolean).join(" · ");
  const alarm = state === "alarm";
  const helped = alarm && (outcome === "best" || outcome === "acceptable");
  const worse = alarm && (outcome === "wrong" || outcome === "risky");
  const base = alarm ? { hr: 118, spo2: 92, rr: 28, bp: "138/88" } : { hr: 76, spo2: 98, rr: 16, bp: "118/76" };
  const target = helped ? { hr: 96, spo2: 96, rr: 22 } : worse ? { hr: 132, spo2: 87, rr: 34 } : { hr: base.hr, spo2: base.spo2, rr: base.rr };
  const [hr, setHr] = useState(base.hr);
  const [spo2, setSpo2] = useState(base.spo2);
  const [rr, setRr] = useState(base.rr);
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
  const tile = (label: string, value: string | number, unit: string, color: string, flag = false) => (
    <motion.div key={label} className="flex min-w-0 flex-col gap-[2px] rounded-[10px] px-[10px] py-[8px]" style={{ background: "rgba(255,255,255,0.035)", boxShadow: flag ? `inset 0 0 0 1px ${YELLOW}` : "inset 0 0 0 1px rgba(255,255,255,0.07)" }} animate={flag ? { opacity: [1, 0.55, 1] } : { opacity: 1 }} transition={flag ? { duration: 0.9, repeat: Infinity } : undefined}>
      <span className="text-[9.5px] leading-[12px] font-bold tracking-[0.16em] uppercase" style={{ color: flag ? YELLOW : "rgba(255,255,255,0.5)" }}>{label}</span>
      <span className="flex items-baseline gap-[3px]">
        <span className="text-[24px] leading-[26px] font-extrabold" style={{ ...MONO, color: flag ? YELLOW : color }}>{value}</span>
        {unit && <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{unit}</span>}
      </span>
    </motion.div>
  );
  return (
    <Device
      tone={worse ? RED : bad ? YELLOW : helped ? GREEN : undefined}
      label={`Bedside monitor${helped ? ", help at the bedside" : alarm ? ", alarm" : ", stable"}: heart rate ${hr}, oxygen ${spo2} percent, breathing ${rr} a minute`}
      left={<><Led color={accent} pulse={false} /><span className="truncate">{where || "Monitor"}</span></>}
      right={<>
        {helped ? <Chip tone={GREEN} dark><Check className="h-[10px] w-[10px]" strokeWidth={3} aria-hidden /> Help at bedside</Chip>
          : alarm ? <Chip tone={RED} dark pulse><Siren className="h-[10px] w-[10px]" aria-hidden /> {worse ? "Deteriorating" : "Alarm"}</Chip>
          : null}
        {time && <span style={{ ...MONO, color: "rgba(255,255,255,0.8)" }}>{time}</span>}
      </>}
    >
      <Trace alarm={bad} hr={hr} color={GREEN} />
      <div className="grid grid-cols-4 gap-[6px]">
        {tile("HR", hr, "bpm", GREEN, worse)}
        {tile("SpO2", spo2, "%", CYAN, bad)}
        {tile("RR", rr, "/min", YELLOW, bad)}
        {tile("BP", base.bp, "", "#fff")}
      </div>
    </Device>
  );
}

// ------------------------------------------------------- desk clock

/** True when a card's whole title is just a clock time ("7:00 P.M."), so
 *  the clock can stand in for it. */
export function isClockTitle(title: string): boolean {
  return /^\d{1,2}(:\d{2})?\s*(A\.?M\.?|P\.?M\.?)$/i.test(title.trim());
}
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
/** When each script hour first appeared, so beats sharing an hour show ONE
 *  clock still running, not one reset to :00 per screen. Twenty minutes
 *  old is a replay and starts again. */
const CLOCK_EPOCH = new Map<string, number>();
function epochFor(key: string): number {
  const t = CLOCK_EPOCH.get(key);
  if (t && Date.now() - t < 20 * 60 * 1000) return t;
  const fresh = Date.now();
  CLOCK_EPOCH.set(key, fresh);
  return fresh;
}

/** The wall clock of a deadline-driven floor: local time in the world's
 *  glow, ticking from the script's hour; a deadline counting down beside
 *  it; DELIVERED in green when met; extra facts as further cells. */
export function DeskClock({ now, deadline, deadlineLabel = "Deadline", status, zone = "Local time", cells = [] }: { now: string; deadline?: string; deadlineLabel?: string; status?: "due" | "delivered"; zone?: string; cells?: { label: string; value: string }[] }) {
  const glow = worldSkin(useWorld().world).glow;
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
  const cur = clockText(startSec + elapsed);
  const left = dueSec !== null ? Math.max(0, dueSec - startSec - elapsed) : null;
  const leftText = left !== null ? `${two(Math.floor(left / 3600))}:${two(Math.floor((left % 3600) / 60))}:${two(left % 60)}` : null;
  const tight = left !== null && left < 60 * 60;
  const extra = cells.filter((c) => c.label.toLowerCase() !== deadlineLabel.toLowerCase());
  const digits = "text-[30px] leading-[32px] font-extrabold tracking-[0.01em] sm:text-[36px] sm:leading-[38px]";
  const cell = (label: string, body: React.ReactNode, first = false) => (
    <div key={label} className={`flex min-w-0 flex-col gap-[5px] ${first ? "" : "border-t pt-[10px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[14px]"}`} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <span className="text-[10px] leading-[14px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      {body}
    </div>
  );
  const columns = 1 + (deadline || status === "delivered" ? 1 : 0) + extra.length;
  return (
    <Device className="!gap-0">
      <div className={`grid gap-[12px] ${columns === 1 ? "" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {cell(zone, (
          <span className="flex items-baseline gap-[6px]" role="timer" aria-label={`${cur.time} ${cur.ampm}`}>
            <span className={digits} style={{ ...MONO, color: glow, textShadow: `0 0 14px color-mix(in srgb, ${glow} 55%, transparent)` }}>{cur.time}</span>
            <span className="text-[12px] font-extrabold" style={{ color: glow }}>{cur.ampm}</span>
          </span>
        ), true)}
        {(deadline || status === "delivered") && cell(deadlineLabel, status === "delivered" ? (
          <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }} className={`flex items-center gap-[8px] ${digits}`} style={{ ...MONO, color: GOOD, textShadow: `0 0 14px color-mix(in srgb, ${GOOD} 55%, transparent)` }}>
            <Check className="h-[26px] w-[26px]" strokeWidth={3} aria-hidden /> Delivered
          </motion.span>
        ) : (
          <motion.span className={digits} style={{ ...MONO, color: tight ? RED : "#fff", textShadow: tight ? `0 0 14px color-mix(in srgb, ${RED} 55%, transparent)` : undefined }} animate={tight ? { opacity: [1, 0.6, 1] } : { opacity: 1 }} transition={tight ? { duration: 1, repeat: Infinity } : undefined} role="timer" aria-label={`${deadlineLabel}: ${leftText} left`}>
            {leftText}
          </motion.span>
        ))}
        {extra.map((c) => cell(c.label, <span className={/^[\d:]+$/.test(c.value) ? digits : "text-[20px] leading-[32px] font-extrabold sm:text-[22px] sm:leading-[38px]"} style={{ ...MONO, color: "#fff" }}>{c.value}</span>))}
      </div>
    </Device>
  );
}

// ---------------------------------------------------- lights board

/** A board of lights, one per location named in the rank's rows ("Room
 *  12", "Gate 4", "Bay 2"), numbered in the student's order; on submit they
 *  clear one by one in that order. Any triage-by-location beat can use it. */
export function LightsBoard({ rows, locked, accent, place, title = "Call lights" }: { rows: string[]; locked: boolean; accent: string; place?: string; title?: string }) {
  const info = useWorld();
  const rooms = rows.map((r, i) => /(?:Room|Bed|Bay|Gate|Line|Table|Stand|Dock)\s+(\w+)/i.exec(r)?.[1] ?? String(i + 1));
  return (
    <Device
      label={`${title} on for ${rooms.join(", ")}`}
      left={<span className="truncate">{place ?? info.place ?? info.firm} · {title}</span>}
      right={
        <span className="flex gap-[6px]">
          {rooms.map((room, i) => (
            <motion.span key={`${room}-${i}`} layout className="relative flex h-[42px] w-[46px] flex-col items-center justify-center rounded-[8px]" style={{ background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} animate={locked ? { opacity: [1, 1, 0.3] } : { opacity: 1 }} transition={locked ? { duration: 0.6, delay: 0.5 + i * 0.5, times: [0, 0.6, 1] } : undefined}>
              <motion.span aria-hidden className="absolute top-[5px] right-[5px] h-[6px] w-[6px] rounded-full" style={{ background: locked ? "rgba(255,255,255,0.25)" : accent, boxShadow: locked ? "none" : `0 0 8px ${accent}` }} animate={locked ? {} : { opacity: [1, 0.35, 1] }} transition={locked ? {} : { duration: 0.9 + i * 0.13, repeat: Infinity }} />
              <span className="text-[15px] leading-none font-extrabold text-white" style={MONO}>{room}</span>
              <span className="mt-[3px] text-[9px] leading-none font-extrabold" style={{ color: accent }}>{i + 1}</span>
            </motion.span>
          ))}
        </span>
      }
    >
      <span className="sr-only">{rooms.length} lights</span>
    </Device>
  );
}

// ----------------------------------------------------- record sheet

export type RecordRow = { time: string; label: string; status: "done" | "flag" | "due" };
export type RecordLabels = { flag?: string; fixed?: string; worse?: string; done?: string; due?: string };

/** A record with one flagged row (a late dose, a missed check, an overdue
 *  entry). The answer writes the flagged row's next state: a safe recovery
 *  marks it done late with the real time; anything else leaves it flagged. */
export function RecordSheet({ title, rows, labels, accent, outcome = null }: { title?: string; rows: RecordRow[]; labels?: RecordLabels; accent: string; outcome?: Tier | null }) {
  const info = useWorld();
  const good = outcome === "best" || outcome === "acceptable";
  const bad = outcome === "wrong" || outcome === "risky";
  const L = { flag: "Overdue", fixed: "Done late · real time", worse: "Still overdue", done: "Done", due: "Due", ...labels };
  const chip = (row: RecordRow) => {
    if (row.status === "done") return <Chip tone={OK_INK}>{L.done}</Chip>;
    if (row.status === "due") return <Chip tone={DUE_INK}>{L.due}</Chip>;
    if (good) return <Chip tone={OK_INK}>{L.fixed}</Chip>;
    return <Chip tone={BAD_INK} pulse={!bad}>{bad ? L.worse : L.flag}</Chip>;
  };
  return (
    <Paper title={title ?? `Record · ${info.place ?? info.firm}`} meta="Today" accent={accent} label={good ? "Record: the flagged entry done late and charted with the real time" : "Record: one entry overdue"}>
      <div>
        {rows.map((row) => (
          <div key={`${row.time}-${row.label}`} className="grid h-[40px] grid-cols-[56px_1fr_auto] items-center gap-[10px] border-b text-[13px]" style={{ borderColor: INK_RULE }}>
            <span className="font-extrabold" style={MONO}>{row.time}</span>
            <span className="truncate font-semibold" style={{ color: "rgba(28,36,51,0.75)" }}>{row.label}</span>
            {chip(row)}
          </div>
        ))}
      </div>
    </Paper>
  );
}

// ------------------------------------------------------ report sheet

/** A report with numbered lines that fill as cards are picked (the night
 *  handover, a shift report, a brief). Line labels are the doc's framing. */
export function ReportSheet({ picks, slots, labels, title, meta, accent }: { picks: string[]; slots: number; labels?: string[]; title?: string; meta?: string; accent: string }) {
  const info = useWorld();
  return (
    <Paper title={title ?? `Report · ${info.place ?? info.firm}`} meta={meta} accent={accent}>
      <ol className="m-0 list-none p-0">
        {Array.from({ length: slots }, (_, i) => {
          const text = picks[i];
          return (
            <li key={i} className="grid min-h-[48px] grid-cols-[22px_1fr] items-start gap-[10px] border-b py-[8px]" style={{ borderColor: INK_RULE }}>
              <span className="mt-[2px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-extrabold" style={{ background: text ? accent : "rgba(28,36,51,0.1)", color: text ? "#05070f" : INK_MUTED }}>{i + 1}</span>
              <span className="flex min-w-0 flex-col gap-[3px]">
                {labels?.[i] && <span className="text-[9.5px] leading-[12px] font-extrabold tracking-[0.12em] uppercase" style={{ color: INK_MUTED }}>{labels[i]}</span>}
                {text ? (
                  <motion.span key={text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="text-[14.5px] leading-[20px] font-semibold" style={{ color: INK, fontFamily: "var(--font-display)" }}>{text}</motion.span>
                ) : (
                  <span aria-hidden className="mt-[7px] block h-[2px] w-[68%] rounded-full" style={{ background: "rgba(28,36,51,0.1)" }} />
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </Paper>
  );
}

// ------------------------------------------------------- wristband

/** An ID band with the two things that belong to the person, not the room.
 *  Scanning it is the right answer: a sweep runs and it checks green. */
export function Wristband({ outcome = null, org }: { outcome?: "right" | "wrong" | null; org?: string; accent?: string }) {
  const info = useWorld();
  const tone = outcome === "right" ? GREEN : RED;
  return (
    <div className="relative mx-auto w-full max-w-[420px] py-[4px]" role="img" aria-label="Patient wristband with name and date of birth">
      <motion.div initial={{ opacity: 0, y: 10, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="relative overflow-hidden rounded-full px-[18px] py-[9px]" style={{ background: "linear-gradient(180deg, #fbfbfd, #e6e9f0)", boxShadow: "0 12px 26px -14px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(0,0,0,0.08)" }}>
        <div className="grid grid-cols-[1fr_auto] items-center gap-[12px]">
          <div className="flex flex-col gap-[3px]" style={{ color: INK }}>
            <span className="text-[8.5px] leading-[11px] font-extrabold tracking-[0.2em] uppercase" style={{ color: INK_MUTED }}>{org ?? info.firm}</span>
            <span className="flex gap-[14px] text-[11px] leading-[14px] font-extrabold">
              <span className="flex items-center gap-[4px]">NAME <span className="inline-block h-[8px] w-[72px] rounded-[2px]" style={{ background: "rgba(28,36,51,0.25)" }} /></span>
              <span className="flex items-center gap-[4px]">DOB <span className="inline-block h-[8px] w-[48px] rounded-[2px]" style={{ background: "rgba(28,36,51,0.25)" }} /></span>
            </span>
          </div>
          <span aria-hidden className="flex h-[26px] items-end gap-[1.5px]">
            {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2].map((w, i) => <span key={i} className="block h-full" style={{ width: w, background: INK }} />)}
          </span>
        </div>
        {outcome === "right" && <motion.span aria-hidden className="absolute inset-y-0 w-[18%]" style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${GREEN} 55%, transparent), transparent)` }} initial={{ left: "-20%" }} animate={{ left: "110%" }} transition={{ duration: 0.7, ease: "easeInOut" }} />}
      </motion.div>
      {outcome && (
        <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: outcome === "right" ? 0.6 : 0, type: "spring", stiffness: 320, damping: 16 }} className="absolute -top-[4px] -right-[4px] flex h-[28px] w-[28px] items-center justify-center rounded-full text-black" style={{ background: tone, boxShadow: `0 0 14px ${tone}` }}>
          {outcome === "right" ? <Check className="h-[16px] w-[16px]" strokeWidth={3} aria-hidden /> : <span className="text-[14px] leading-none font-extrabold">×</span>}
        </motion.span>
      )}
    </div>
  );
}

// ------------------------------------------------------------ inbox

/** A question as an email in the firm's inbox: header bar, who it is
 *  from, the question as the subject. The replies stay the beat's options. */
export function InboxHeader({ from, role, subject, index, total, org }: { from: string; role?: string; subject: string; index: number; total: number; org?: string }) {
  const info = useWorld();
  return (
    <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 72%, transparent)" }}>
      <div className="flex h-[32px] items-center justify-between border-b px-[12px] text-[10px] font-extrabold tracking-[0.16em] uppercase" style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
        <span className="truncate">Inbox · {org ?? info.firm}</span>
        <span className="flex-none" style={MONO}>{index + 1} / {total}</span>
      </div>
      <div className="flex items-start gap-[10px] px-[12px] py-[10px]">
        <span aria-hidden className="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 30%, var(--glass-surface-2))", color: "var(--foreground)" }}>{from.slice(0, 2).toUpperCase()}</span>
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span className="text-[12px] leading-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{from}{role ? ` · ${role}` : ""}</span>
          <span className="text-[16px] leading-[21px] font-extrabold" style={{ color: "var(--foreground)" }}>{subject}</span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------- red pen

/** A red-pen circle around one word: the reviewer's mark. */
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

/** The picked line from the page, re-set on the verdict with the circles
 *  drawn on it (the verdict covers the page the moment a line is tapped). */
export function MarkedLine({ label, marks, paper }: { label: string; marks: string[]; paper: "chart" | "slide" }) {
  const skin = worldSkin(useWorld().world);
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
    <motion.p initial={{ opacity: 0, y: 8, rotate: chart ? -1 : 0 }} animate={{ opacity: 1, y: 0, rotate: chart ? -0.5 : 0 }} transition={{ type: "spring", stiffness: 240, damping: 22 }} className="m-0 rounded-[8px] px-[16px] py-[12px] text-[16px] leading-[26px] font-semibold" style={chart ? { background: skin.paper, color: INK, boxShadow: `0 14px 30px -14px rgba(0,0,0,0.7), inset 0 0 0 1px ${skin.paperEdge}`, fontFamily: "var(--font-display)" } : { background: "linear-gradient(160deg, #0d1733, #0a1024)", color: "#e9eef7", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
      {parts}
    </motion.p>
  );
}

// ------------------------------------------------------- zone badge

/** What a storage zone did with the file, shown on the verdict. */
export function ZoneBadge({ label, tone }: { label: string; tone: string }) {
  const data = /data room|vault|archive|locked/i.test(label);
  const shared = /chat|email|group|public|shared/i.test(label);
  return (
    <motion.span initial={{ scale: 0.7, opacity: 0, y: 6 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.2 }} className="flex h-[30px] w-fit items-center gap-[8px] rounded-full pr-[12px] pl-[5px] text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 50%, transparent)` }}>
      <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full" style={{ background: tone, color: "#05070f" }}>
        {data ? (
          <motion.svg viewBox="0 0 24 24" className="h-[12px] w-[12px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <motion.path d="M8 10V7a4 4 0 0 1 8 0v3" initial={{ y: -3 }} animate={{ y: 0 }} transition={{ delay: 0.55, type: "spring", stiffness: 500, damping: 18 }} />
          </motion.svg>
        ) : (
          <Check className="h-[12px] w-[12px]" strokeWidth={3} aria-hidden />
        )}
      </span>
      {label} · {data ? "Locked" : shared ? "Shared" : "Personal"}
    </motion.span>
  );
}

// --------------------------------------------------------- elevator

/** The elevator's indicator on the way up: digits climb, the arrow pulses,
 *  "Arrived" on the floor. An act break as a ride, not a title card. */
export function Elevator({ floor, label }: { floor: number; label?: string }) {
  const info = useWorld();
  const { glow } = worldSkin(info.world);
  const [cur, setCur] = useState(0);
  useEffect(() => {
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setCur(n);
      if (n >= floor) window.clearInterval(id);
    }, Math.max(28, 1600 / floor));
    return () => window.clearInterval(id);
  }, [floor]);
  const arrived = cur >= floor;
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <Device label={`Elevator at floor ${cur}`} className="!flex-row items-center justify-between !gap-[14px] !px-[16px]">
        <span className="flex min-w-0 flex-col gap-[3px] text-left">
          <span className="truncate text-[10px] leading-[14px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{label ?? info.firm}</span>
          <motion.span className="text-[11px] leading-[14px] font-extrabold tracking-[0.1em] uppercase" style={{ color: arrived ? GOOD : glow }} animate={arrived ? { opacity: 1 } : { opacity: [1, 0.4, 1] }} transition={{ duration: 0.8, repeat: arrived ? 0 : Infinity }}>
            {arrived ? "Arrived" : "Going up"}
          </motion.span>
        </span>
        <span className="flex flex-none items-center gap-[10px]">
          <motion.svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke={glow} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden animate={arrived ? { opacity: 0.35 } : { y: [0, -3, 0], opacity: 1 }} transition={{ duration: 0.9, repeat: arrived ? 0 : Infinity }}>
            <path d="M12 19V5M5 12l7-7 7 7" />
          </motion.svg>
          <span className="flex h-[46px] min-w-[68px] items-center justify-center rounded-[8px] px-[10px] text-[30px] leading-none font-extrabold" style={{ ...MONO, color: glow, background: "#000", boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 18px color-mix(in srgb, ${glow} 25%, transparent)`, textShadow: `0 0 14px color-mix(in srgb, ${glow} 60%, transparent)` }}>
            {cur === 0 ? "G" : cur}
          </span>
        </span>
      </Device>
    </div>
  );
}

// ------------------------------------------------------------ badge

/** Badge-in: the ID on its lanyard (header band in the world colour, photo,
 *  barcode, clip) swings to the wall reader; the ring wakes, the LED goes
 *  green. No name: the student's is not ours to invent. */
export function IdBadge({ org, role, accent }: { org?: string; role: string; accent: string }) {
  const info = useWorld();
  const name = org ?? info.firm;
  return (
    <div className="mx-auto flex w-full max-w-[380px] items-center justify-center gap-[22px] py-[6px]" role="img" aria-label={`${name} ID badge, ${role}, tapped on the reader`}>
      <motion.div className="relative flex flex-col items-center" initial={{ rotate: -10, x: -10 }} animate={{ rotate: [-10, 5, 3], x: [-10, 26, 24] }} transition={{ duration: 1.4, times: [0, 0.72, 1], ease: "easeInOut" }} style={{ transformOrigin: "50% -40px" }}>
        <span aria-hidden className="block h-[26px] w-[14px] rounded-b-[4px]" style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 70%, black), ${accent}, color-mix(in srgb, ${accent} 70%, black))` }} />
        <span aria-hidden className="-mt-[2px] block h-[7px] w-[22px] rounded-[3px]" style={{ background: "linear-gradient(180deg, #d9dde6, #9aa3b3)" }} />
        <span className="flex w-[196px] flex-col overflow-hidden rounded-[9px]" style={{ background: "#ffffff", boxShadow: "0 22px 40px -18px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,0,0,0.08)" }}>
          <span className="flex h-[26px] items-center justify-between px-[11px]" style={{ background: accent }}>
            <span className="truncate text-[8.5px] leading-[11px] font-extrabold tracking-[0.14em] text-white uppercase">{name}</span>
            <span aria-hidden className="relative ml-[8px] flex h-[12px] w-[12px] flex-none items-center justify-center rounded-full bg-white/90">
              <span className="block h-[7px] w-[2px] rounded-full" style={{ background: accent }} />
              <span className="absolute block h-[2px] w-[7px] rounded-full" style={{ background: accent }} />
            </span>
          </span>
          <span className="flex items-center gap-[10px] px-[11px] pt-[9px] pb-[8px]">
            <span aria-hidden className="relative h-[44px] w-[36px] flex-none overflow-hidden rounded-[5px]" style={{ background: "linear-gradient(180deg, #e3e8f0, #c3ccd9)" }}>
              <span className="absolute top-[8px] left-1/2 h-[14px] w-[14px] -translate-x-1/2 rounded-full" style={{ background: "#8e9bb0" }} />
              <span className="absolute top-[24px] left-1/2 h-[22px] w-[26px] -translate-x-1/2 rounded-t-[12px]" style={{ background: "#8e9bb0" }} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <span aria-hidden className="block h-[8px] w-[82px] rounded-[2px]" style={{ background: "rgba(28,36,51,0.28)" }} />
              <span aria-hidden className="block h-[6px] w-[54px] rounded-[2px]" style={{ background: "rgba(28,36,51,0.16)" }} />
              <span className="mt-[1px] text-[9.5px] leading-[12px] font-extrabold uppercase" style={{ color: accent }}>{role}</span>
            </span>
          </span>
          <span aria-hidden className="mx-[11px] mb-[8px] flex h-[14px] items-end gap-[1.5px]">
            {[2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1].map((w, i) => <span key={i} className="block h-full" style={{ width: w, background: INK, opacity: 0.85 }} />)}
          </span>
        </span>
      </motion.div>
      <span className="relative flex h-[84px] w-[58px] flex-none flex-col items-center justify-between rounded-[10px] px-[8px] pt-[10px] pb-[9px]" style={{ background: "linear-gradient(180deg, #2a2e37, #171a20)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1), 0 14px 26px -14px rgba(0,0,0,0.9)" }}>
        <span className="relative flex h-[30px] w-[30px] items-center justify-center">
          <motion.span aria-hidden className="absolute inset-0 rounded-full" style={{ border: `2px solid ${GOOD}` }} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1.5], opacity: [0, 0.8, 0] }} transition={{ delay: 1.05, duration: 0.9, times: [0, 0.3, 1] }} />
          <span aria-hidden className="h-[22px] w-[22px] rounded-full" style={{ background: "radial-gradient(circle at 50% 40%, #3b404b, #202329)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.14)" }} />
          <span aria-hidden className="absolute h-[12px] w-[9px] rounded-[2px]" style={{ background: "rgba(255,255,255,0.25)" }} />
        </span>
        <motion.span aria-hidden className="h-[7px] w-[7px] rounded-full" initial={{ background: BAD_INK, boxShadow: `0 0 6px ${BAD_INK}` }} animate={{ background: [BAD_INK, BAD_INK, GOOD], boxShadow: [`0 0 6px ${BAD_INK}`, `0 0 6px ${BAD_INK}`, `0 0 14px ${GOOD}`] }} transition={{ duration: 1.3, times: [0, 0.78, 1] }} />
      </span>
    </div>
  );
}

// ---------------------------------------------------------- logbook

/** The final review as the trade's log page: entries stamped in turn, then
 *  the signature drawn on the line. */
export function LogbookReview({ lead, lines, firm, title = "Log", meta = "Year 1", accent = "var(--primary)" }: { lead?: string; lines: string[]; firm?: string; title?: string; meta?: string; accent?: string }) {
  const info = useWorld();
  return (
    <div className="w-full max-w-[520px]">
      <Paper title={`${title} · ${firm ?? info.firm}`} meta={meta} accent={accent} label="Log" tilt={-0.5}>
        {lead && <p className="mt-[6px] mb-[2px] text-[12.5px] leading-[17px] font-semibold whitespace-pre-line" style={{ color: "rgba(28,36,51,0.7)" }}>{lead}</p>}
        <ul className="m-0 grid list-none grid-cols-1 gap-x-[18px] p-0 sm:grid-cols-2">
          {lines.map((line, i) => (
            <li key={line} className="flex h-[34px] items-center justify-between gap-[8px] border-b text-[13px] font-semibold" style={{ borderColor: INK_RULE, fontFamily: "var(--font-display)" }}>
              <span className="truncate">{line}</span>
              <motion.span initial={{ scale: 1.8, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ delay: 0.3 + i * 0.16, type: "spring", stiffness: 420, damping: 18 }} className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[3px] border-2" style={{ borderColor: OK_INK, color: OK_INK }} aria-hidden>
                <Check className="h-[11px] w-[11px]" strokeWidth={3.2} />
              </motion.span>
            </li>
          ))}
        </ul>
        <div className="mt-[8px] flex h-[30px] items-end justify-between gap-[12px] border-t pt-[4px]" style={{ borderColor: "rgba(28,36,51,0.2)" }}>
          <span className="text-[9px] leading-[12px] font-extrabold tracking-[0.16em] uppercase" style={{ color: INK_MUTED }}>Signed</span>
          <motion.svg viewBox="0 0 160 36" className="h-[24px] w-[120px]" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" aria-label="Signed">
            <motion.path d="M6 26 C14 8, 22 6, 26 20 C29 30, 34 30, 40 14 C44 4, 50 6, 52 20 C54 30, 60 28, 68 14 C76 2, 82 10, 86 22 C90 32, 98 30, 108 18 C116 8, 128 10, 150 20" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 + lines.length * 0.16, duration: 1.1, ease: "easeInOut" }} />
          </motion.svg>
        </div>
      </Paper>
    </div>
  );
}
