"use client";

// Prepare's two views, redone (20 Oct 2026; Chandu: "redo the meeting agenda
// and calendar views to be much more engaging and premium and use better
// hierarchy and layout and design. What's some starry element stuff we can
// use here as well?", with four references and "do not default to the
// easiest thing to replicate or closest matching reference").
//
// Taken from the references, made ours:
// - a huge date numeral beside the day's meetings (Google's widget): each
//   agenda day leads with its number, sticky as you scroll;
// - big type for who and why, time small above it (the phone schedule);
// - days as tall lanes with an hour rail, meetings placed by time (the week
//   planner), today's lane the lit one, days without office hours textured
//   so they recede (the dark month grid's weekends);
// - fill means booked, outline means waiting (Google): ready is a filled
//   card, needs prep carries an amber edge, a request is a dashed outline.
// Ours: one focal card, the next meeting, larger, with a countdown and its
// Prepare inside; and the sky: a line of light marks now across today with a
// star riding it, and a finished meeting settles into a faint star, so by
// Friday the week reads as a trail of conversations had.

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, ChevronDown, X } from "lucide-react";
import { timeLabel, type OfficeHours } from "@/lib/counselorMeetings";
import { isoDay } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";
import type { Meeting } from "@/lib/counselorMeetings";
import { StudentFace } from "../v5/StudentFace";
import { notify } from "../v5/LogSheet";
import { answerMeeting, flagsFor, markPrepped, PREP_DOT, PREP_LABEL, type Prep } from "./data";
import { DISPLAY, MUTED, QuietButton, briefHref, moment } from "./ui";

export type Row = { m: Meeting; s: CounselorStudent; prep: Prep };

const DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// the clock, ticking once a minute (the now line and "in 2 h")
const subscribeMinute = (cb: () => void) => { const t = window.setInterval(cb, 60000); return () => window.clearInterval(t); };
const nowMinute = () => Math.floor(Date.now() / 60000);
export function useNow(): Date {
  const m = useSyncExternalStore(subscribeMinute, nowMinute, () => 0);
  return m ? new Date(m * 60000) : new Date(0);
}

const isPastRow = (r: Row, now: Date) => {
  const today = isoDay(now);
  if (r.m.day !== today) return r.m.day < today;
  return mins(r.m.time) + r.m.minutes <= now.getHours() * 60 + now.getMinutes();
};
const whyOf = (r: Row) => flagsFor(r.s)[0] ?? (r.m.topic || r.m.type);
const endLabel = (r: Row) => { const e = mins(r.m.time) + r.m.minutes; return timeLabel(`${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`); };

/** "in 25 min", "in 2 h", "tomorrow", "Thu" */
function untilLabel(r: Row, now: Date): string {
  const start = new Date(`${r.m.day}T${r.m.time}:00`);
  const diff = Math.round((start.getTime() - now.getTime()) / 60000);
  if (diff < 1) return "now";
  if (diff < 60) return `in ${diff} min`;
  if (r.m.day === isoDay(now)) return `in ${Math.round(diff / 60)} h`;
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return r.m.day === isoDay(tomorrow) ? "tomorrow" : DAY3[start.getDay()];
}

/** The state as a surface: filled = ready, amber edge = needs prep, dashed =
 *  waiting on you; a finished meeting goes quiet. */
function surface(prep: Prep, past: boolean): React.CSSProperties {
  if (past) return { background: "transparent", borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" };
  if (prep === "requested") return { background: "transparent", borderColor: "color-mix(in srgb, var(--primary) 70%, transparent)", borderStyle: "dashed" };
  if (prep === "prep" || prep === "action") return { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: `inset 3px 0 0 ${PREP_DOT[prep]}` };
  return { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)" };
}

function StateWord({ prep, past }: { prep: Prep; past: boolean }) {
  if (past) return <span className="inline-flex items-center gap-[8px] text-[13px] font-semibold" style={MUTED}><DoneStar />Done</span>;
  if (prep === "ready") return null;
  return <span className="inline-flex items-center gap-[7px] text-[13px] font-semibold whitespace-nowrap"><span aria-hidden className="size-[7px] rounded-full" style={{ background: PREP_DOT[prep] }} />{PREP_LABEL[prep]}</span>;
}

/** A finished meeting: a quiet check (the soft star read as "cotton balls",
 *  Chandu, 20 Oct 2026). */
function DoneStar({ size = 14 }: { size?: number }) {
  return <Check aria-hidden className="flex-none" style={{ width: size, height: size, color: "var(--muted-foreground)" }} />;
}

function RequestActions({ r }: { r: Row }) {
  const first = r.s.name.split(" ")[0];
  return (
    <span className="flex flex-wrap items-center gap-[var(--space-2)]">
      <QuietButton onClick={() => { answerMeeting(r.m.id, "confirmed"); notify(`Confirmed with ${first}`); moment(true); }}>Confirm</QuietButton>
      <QuietButton onClick={() => notify(`Asked ${first} to pick another time`)}>Suggest time</QuietButton>
      <QuietButton label="Decline" icon={<X className="h-4 w-4" aria-hidden />} onClick={() => { answerMeeting(r.m.id, "declined"); notify(`Declined ${first}'s request`); }} />
    </span>
  );
}

// ---- Agenda ------------------------------------------------------------------

export function AgendaView({ days, rows }: { days: Date[]; rows: Row[] }) {
  const now = useNow();
  const today = isoDay(now);
  // the one focal card: the next meeting still to come this week
  const next = rows.find((r) => !isPastRow(r, now) && r.prep !== "requested");
  return (
    <div className="flex flex-col gap-[var(--space-10)]">
      {days.map((d) => {
        const iso = isoDay(d);
        const list = rows.filter((r) => r.m.day === iso);
        if (!list.length) return null;
        const isToday = iso === today;
        const pastDay = iso < today;
        return (
          <section key={iso} id={`day-${iso}`} aria-label={`${DAY3[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`} className="grid scroll-mt-[96px] grid-cols-[64px_minmax(0,1fr)] gap-x-[var(--space-5)] sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-x-[var(--space-8)]">
            {/* the date, large, staying with its day as you scroll */}
            <div className="self-start sm:sticky sm:top-[96px]" style={{ opacity: pastDay ? 0.9 : 1 }}>
              <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: isToday ? "var(--pc-link, var(--color-text-brand))" : "var(--muted-foreground)" }}>{isToday ? "Today" : DAY3[d.getDay()]}</span>
              <span className="block text-[44px] leading-[48px] font-extrabold tabular-nums sm:text-[64px] sm:leading-[68px]" style={DISPLAY}>{d.getDate()}</span>
              <span className="block text-[13px]" style={MUTED}>{MON[d.getMonth()]}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
              {/* what's done folds into its trail of stars; what's ahead stays open */}
              <Trail rows={list.filter((r) => isPastRow(r, now))} />
              <ul className="flex min-w-0 flex-col gap-[var(--space-3)] empty:hidden">
                {list.filter((r) => !isPastRow(r, now)).map((r) => <li key={r.m.id}>{r === next ? <FocalCard r={r} now={now} /> : <AgendaCard r={r} past={false} />}</li>)}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** A day's finished meetings, folded into one quiet line that opens on tap. */
function Trail({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <details className="group/trail">
      <summary className="dm-quiet flex cursor-pointer list-none items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-2)] [&::-webkit-details-marker]:hidden">
        <DoneStar />
        <span className="text-[14px] font-semibold" style={MUTED}>{rows.length} done</span>
        <span className="min-w-0 truncate text-[13px] group-open/trail:hidden" style={MUTED}>{rows.map((r) => r.s.name.split(" ")[0]).join(", ")}</span>
        <ChevronDown className="h-4 w-4 flex-none transition-transform group-open/trail:rotate-180" style={MUTED} aria-hidden />
      </summary>
      <ul className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
        {rows.map((r) => <li key={r.m.id}><AgendaCard r={r} past /></li>)}
      </ul>
    </details>
  );
}

function FocalCard({ r, now }: { r: Row; now: Date }) {
  return (
    <Link href={briefHref(r.s.id)} onClick={() => markPrepped(r.m.id)} data-focal className="dm-tap group relative flex flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-6)] v7-glass"
      style={{ ...surface(r.prep, false), background: "radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 62%), var(--glass-surface-2)" }}>
      <span className="flex items-center justify-between gap-[var(--space-3)] text-[13px] font-semibold">
        <span className="tracking-[0.1em] uppercase" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Next · {untilLabel(r, now)}</span>
        <span className="tabular-nums" style={MUTED}>{timeLabel(r.m.time)} – {endLabel(r)}</span>
      </span>
      <span className="flex min-w-0 items-center gap-[var(--space-4)]">
        <StudentFace s={r.s} size={56} />
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="truncate text-[24px] leading-[30px] font-extrabold" style={DISPLAY}>{r.s.name}</span>
          <span className="truncate text-[15px]" style={MUTED}>{whyOf(r)}</span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-[var(--space-3)]">
        <StateWord prep={r.prep} past={false} />
        <span className="dm-solid inline-flex min-h-[42px] items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Prepare</span>
      </span>
    </Link>
  );
}

function AgendaCard({ r, past }: { r: Row; past: boolean }) {
  const requested = r.prep === "requested" && !past;
  const body = (
    <>
      <span className="flex w-[88px] flex-none flex-col">
        <span className="text-[16px] leading-[20px] font-semibold whitespace-nowrap tabular-nums">{timeLabel(r.m.time)}</span>
        <span className="text-[12.5px]" style={MUTED}>{r.m.minutes} min</span>
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-[var(--space-3)]">
        <StudentFace s={r.s} size={36} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[16px] leading-[20px] font-semibold">{r.s.name}</span>
          <span className="truncate text-[13.5px]" style={MUTED}>{whyOf(r)}</span>
        </span>
      </span>
      <span className="flex-none"><StateWord prep={r.prep} past={past} /></span>
    </>
  );
  const cls = "flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)] md:flex-nowrap";
  if (requested) {
    return (
      <div className={cls} style={surface(r.prep, false)}>
        {body}
        <span className="flex-none"><RequestActions r={r} /></span>
      </div>
    );
  }
  return (
    <Link href={briefHref(r.s.id)} onClick={() => markPrepped(r.m.id)} aria-label={`${past ? "Notes for" : "Prepare for"} ${r.s.name}, ${timeLabel(r.m.time)}`}
      className={`dm-quiet ${cls}`} style={{ ...surface(r.prep, past), opacity: past ? 0.9 : 1 }}>
      {body}
    </Link>
  );
}

// ---- Calendar (the week as lanes) ---------------------------------------------

const HOUR = 76; // px per hour

export function WeekView({ days, rows, hours, onDay }: { days: Date[]; rows: Row[]; hours: OfficeHours; /** open a day in the agenda (a crowded slot's card) */ onDay: (iso: string) => void }) {
  const now = useNow();
  const today = isoDay(now);
  // the rail spans office hours and every meeting, rounded to the hour
  const starts = rows.map((r) => mins(r.m.time));
  const ends = rows.map((r) => mins(r.m.time) + r.m.minutes);
  const from = Math.floor(Math.min(9 * 60, ...hours.map((h) => mins(h.from)), ...starts) / 60);
  // half an hour of room after the last meeting, so no card is cut off
  const to = Math.ceil((Math.max(15 * 60, ...hours.map((h) => mins(h.to)), ...ends) + 30) / 60);
  const span = to - from;
  const nowM = now.getHours() * 60 + now.getMinutes();
  const showNow = days.some((d) => isoDay(d) === today) && nowM >= from * 60 && nowM <= to * 60;
  const nowTop = ((nowM - from * 60) / 60) * HOUR;

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
      <div className="grid min-w-[760px] grid-cols-[52px_repeat(5,minmax(0,1fr))] gap-x-[10px]">
        {/* lane heads */}
        <span />
        {days.map((d) => {
          const iso = isoDay(d);
          const isToday = iso === today;
          const n = rows.filter((r) => r.m.day === iso).length;
          return (
            <div key={iso} className="flex items-end justify-between gap-[8px] px-[10px] pb-[12px]" style={{ opacity: iso < today ? 0.9 : 1 }}>
              <span className="flex flex-col">
                <span className="text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: isToday ? "var(--pc-link, var(--color-text-brand))" : "var(--muted-foreground)" }}>{DAY3[d.getDay()]}</span>
                <span className="text-[30px] leading-[34px] font-extrabold tabular-nums" style={DISPLAY}>{d.getDate()}</span>
              </span>
              {n > 0 && <span className="pb-[4px] text-[12.5px] tabular-nums" style={MUTED}>{n}</span>}
            </div>
          );
        })}

        {/* the hour rail */}
        <div className="relative" style={{ height: span * HOUR }}>
          {Array.from({ length: span + 1 }, (_, i) => (
            <span key={i} className="absolute right-[6px] -translate-y-1/2 text-[11.5px] tabular-nums" style={{ top: i * HOUR, ...MUTED }}>
              {timeLabel(`${String(from + i).padStart(2, "0")}:00`).replace(":00", "")}
            </span>
          ))}
        </div>

        {/* the lanes */}
        {days.map((d) => {
          const iso = isoDay(d);
          const isToday = iso === today;
          const office = hours.some((h) => h.weekday === d.getDay());
          const list = rows.filter((r) => r.m.day === iso);
          return (
            <div key={iso} className={`relative overflow-hidden rounded-[var(--radius-lg)] border ${office ? "" : "v7-lane-off"}`}
              style={{ height: span * HOUR, borderColor: isToday ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "var(--glass-border)", background: isToday ? "linear-gradient(180deg, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%), var(--glass-surface-1)" : "var(--glass-surface-1)" }}>
              {/* hour lines, the faintest ink */}
              {Array.from({ length: span - 1 }, (_, i) => <span key={i} aria-hidden className="absolute inset-x-0 h-px" style={{ top: (i + 1) * HOUR, background: "color-mix(in srgb, var(--foreground) 6%, transparent)" }} />)}
              {/* past hours on today fade back */}
              {isToday && showNow && <span aria-hidden className="absolute inset-x-0 top-0" style={{ height: nowTop, background: "color-mix(in srgb, var(--background) 45%, transparent)" }} />}
              {layoutLane(list).map((item) => item.group
                ? <ClusterCard key={item.group[0].m.id} rows={item.group} from={from} past={item.group.every((r) => isPastRow(r, now))} onOpen={() => onDay(iso)} />
                : <LaneCard key={item.r.m.id} r={item.r} from={from} past={isPastRow(item.r, now)} col={item.col} cols={item.cols} />)}
              {/* now: a line of light across today, a star riding it */}
              {isToday && showNow && (
                <span aria-hidden className="v7-now pointer-events-none absolute inset-x-0" style={{ top: nowTop }}>
                  <span className="v7-now-line" />
                  <span className="v7-now-star" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MIN_CARD = 46; // px: a short meeting still shows its time and name

type LaneItem = { r: Row; col: number; cols: number; group?: undefined } | { group: Row[]; r?: undefined; col?: undefined; cols?: undefined };

/** Meetings that overlap on screen share the lane side by side: each gets a
 *  column, and every card in an overlapping cluster takes 1/N of the width.
 *  Three or more side by side is too narrow to read, so that cluster becomes
 *  one card that names how many and opens the day. */
function layoutLane(list: Row[]): LaneItem[] {
  const minMins = (MIN_CARD / HOUR) * 60;
  const items = [...list].sort((a, b) => mins(a.m.time) - mins(b.m.time)).map((r) => ({ r, start: mins(r.m.time), end: mins(r.m.time) + Math.max(r.m.minutes, minMins), col: 0 }));
  const clusters: (typeof items)[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -1;
  for (const it of items) {
    if (it.start >= clusterEnd && cluster.length) { clusters.push(cluster); cluster = []; }
    const taken = new Set(cluster.filter((c) => c.end > it.start).map((c) => c.col));
    let col = 0;
    while (taken.has(col)) col++;
    it.col = col;
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.end);
  }
  if (cluster.length) clusters.push(cluster);
  return clusters.flatMap((c): LaneItem[] => {
    const cols = Math.max(...c.map((x) => x.col + 1));
    return cols >= 3 ? [{ group: c.map((x) => x.r) }] : c.map((x) => ({ r: x.r, col: x.col, cols }));
  });
}

function ClusterCard({ rows, from, past, onOpen }: { rows: Row[]; from: number; past: boolean; onOpen: () => void }) {
  const start = Math.min(...rows.map((r) => mins(r.m.time)));
  const top = ((start - from * 60) / 60) * HOUR;
  const label = timeLabel(rows.find((r) => mins(r.m.time) === start)!.m.time);
  const worst = rows.find((r) => r.prep === "action") ?? rows.find((r) => r.prep === "prep") ?? rows[0];
  return (
    <button type="button" onClick={onOpen} aria-label={`${rows.length} meetings from ${label}: ${rows.map((r) => r.s.name).join(", ")}. Open the day`}
      className="dm-quiet absolute inset-x-[6px] flex cursor-pointer flex-col gap-[6px] overflow-hidden rounded-[12px] border px-[10px] py-[7px] text-left"
      style={{ top: top + 2, minHeight: 64, ...surface(past ? "ready" : worst.prep, past), opacity: past ? 0.9 : 1 }}>
      <span className="flex items-center justify-between text-[11.5px] tabular-nums" style={MUTED}>{label}{past && <DoneStar size={11} />}</span>
      <span className="flex items-center gap-[8px]">
        <span className="flex -space-x-[8px]">{rows.slice(0, 4).map((r) => <span key={r.m.id} className="rounded-full ring-2" style={{ ["--tw-ring-color" as string]: "var(--card)" }}><StudentFace s={r.s} size={22} /></span>)}</span>
        <span className="text-[13px] font-semibold">{rows.length} meetings</span>
      </span>
    </button>
  );
}

function LaneCard({ r, from, past, col, cols }: { r: Row; from: number; past: boolean; col: number; cols: number }) {
  const top = ((mins(r.m.time) - from * 60) / 60) * HOUR;
  const height = Math.max(MIN_CARD, (r.m.minutes / 60) * HOUR - 4);
  const roomy = height >= 64 && cols === 1;
  const requested = r.prep === "requested" && !past;
  // side by side when overlapping: 6px lane padding, 4px between columns
  const width = `calc((100% - 12px - ${(cols - 1) * 4}px) / ${cols})`;
  const left = `calc(6px + ${col} * ((100% - 12px - ${(cols - 1) * 4}px) / ${cols} + 4px))`;
  const style: React.CSSProperties = { top: top + 2, height, left, width, ...surface(r.prep, past), opacity: past ? 0.9 : 1 };
  const inner = (
    <>
      <span className="flex items-center justify-between gap-[6px] text-[11.5px] tabular-nums" style={MUTED}>
        <span>{timeLabel(r.m.time)}</span>
        {past ? <DoneStar size={11} /> : r.prep !== "ready" && <span aria-hidden className="size-[6px] rounded-full" style={{ background: PREP_DOT[r.prep] }} />}
      </span>
      <span className="truncate text-[13.5px] leading-[17px] font-semibold">{r.s.name}</span>
      {roomy && <span className="truncate text-[12px]" style={MUTED}>{whyOf(r)}</span>}
    </>
  );
  const cls = "absolute flex flex-col gap-[1px] overflow-hidden rounded-[12px] border px-[10px] py-[6px] text-left";
  if (requested) {
    return (
      <button type="button" title={`${r.s.name} asked for this time`} onClick={() => { answerMeeting(r.m.id, "confirmed"); notify(`Confirmed with ${r.s.name.split(" ")[0]}`); moment(true); }}
        aria-label={`${r.s.name} requested ${timeLabel(r.m.time)}. Confirm`} className={`dm-quiet cursor-pointer ${cls}`} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={briefHref(r.s.id)} onClick={() => markPrepped(r.m.id)} aria-label={`${past ? "Notes for" : "Prepare for"} ${r.s.name}, ${timeLabel(r.m.time)}, ${PREP_LABEL[r.prep]}`}
      className={`dm-quiet ${cls}`} style={style}>
      {inner}
    </Link>
  );
}
