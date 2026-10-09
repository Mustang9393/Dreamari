"use client";

// Prepare > Meetings > Upcoming: the week calendar.
//
// History: a row list, then (9 Oct 2026, Chandu: "I think meetings can have
// a more calendar look") an hour grid, then the same day ("Instead of the
// whole time block view it can be a calendar columns + list view so we
// don't leave out boxes for empty slots etc.") columns of stacked cards.
//
// Now a time grid again, built to answer that objection (10 Oct 2026,
// Chandu, reviewing the engaging pass: "The calendar can be designed better
// and cooler"; the brief: time on a vertical axis, meetings as blocks sized
// by length, office hours as a soft band, a clear "now" line on today,
// today's column emphasized, faces on blocks, hover inside each block's
// shape, blue plus status colors only). There are no slot boxes at all:
// free time is plain space, and the one shape for it is the office hours
// band. The axis only spans the hours that hold something (office hours,
// meetings, plus a half hour of air), so a week never shows an empty
// morning. Saturday and Sunday appear only when they are today or hold a
// walk-in, so a weekend walk-in is never lost and today always has a
// column for its "now" line.
//
// Every block opens the student; its full line (time, length, reason, what
// they wrote) is the block's tooltip and its accessible name, so nothing
// needs to grow on hover. A done meeting carries a green check. Per day,
// "+" books into that day (v5's booking sheet). The head keeps the week
// range and the count as one figure, "2/7 done", over a sparking bar that
// moves when a meeting is marked done above (MeetingsNext.tsx). Phones keep
// the day strip and that day's rows.

import { useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { cv } from "@/lib/counselorBase";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { isPast, timeLabel, useOfficeHours, type Meeting, type OfficeHours } from "@/lib/counselorMeetings";
import { openLog } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
// "10 to 11:30 AM", "1:30 to 3 PM": one day's office hours, short
const short = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""}`; };
const ampm = (t: string) => (Number(t.split(":")[0]) < 12 ? "AM" : "PM");
function hoursLine(oh: OfficeHours): string {
  return oh.map((o) => (ampm(o.from) === ampm(o.to) ? `${short(o.from)} to ${short(o.to)} ${ampm(o.to)}` : `${short(o.from)} ${ampm(o.from)} to ${short(o.to)} ${ampm(o.to)}`)).join(" · ");
}
const hourLabel = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 || h === 24 ? "AM" : "PM"}`;
/** Pixels per hour: a 15-minute check-in is one line, 30 minutes is two. */
const PX = 88;

export function MeetingsWeek({ meetings, roster, now, done }: { meetings: Meeting[]; roster: CounselorStudent[]; now: Date; done: Record<string, { notes: string; at: string }> }) {
  const officeHours = useOfficeHours();
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const [offset, setOffset] = useState(0);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const all7 = [0, 1, 2, 3, 4, 5, 6].map((k) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + k));
  const today = iso(now);
  const week = meetings.filter((m) => m.day >= iso(all7[0]) && m.day <= iso(all7[6]));
  // weekdays always; a weekend day only when it is today or holds a meeting
  const days = all7.filter((d, k) => k < 5 || iso(d) === today || week.some((m) => m.day === iso(d)));
  const keys = days.map(iso);
  const weekDone = week.filter((m) => done[m.id]).length;
  // the next meeting still to come, marked in the primary
  const next = meetings.find((m) => !isPast(m, now) && !done[m.id]);
  const last = days[days.length - 1];
  const range = all7[0].getMonth() === last.getMonth() ? `${fmt(all7[0])} to ${last.getDate()}` : `${fmt(all7[0])} to ${fmt(last)}`;

  // the axis: only the hours that hold something, plus a half hour of air
  const ohFor = (d: Date) => officeHours.filter((o) => o.weekday === d.getDay());
  const spans = [
    ...days.flatMap((d) => ohFor(d).map((o) => [mins(o.from), mins(o.to)])),
    ...week.filter((m) => keys.includes(m.day)).map((m) => [mins(m.time), mins(m.time) + m.minutes]),
  ];
  const lo = spans.length ? Math.min(...spans.map((s) => s[0])) : 9 * 60;
  const hi = spans.length ? Math.max(...spans.map((s) => s[1])) : 15 * 60;
  const start = Math.max(0, Math.floor((lo - 30) / 60) * 60);
  const end = Math.min(24 * 60, Math.max(start + 4 * 60, Math.ceil((hi + 30) / 60) * 60));
  // 10px of air above the first hour line and below the last, so their labels never clip
  const y = (m: number) => ((m - start) / 60) * PX + 10;
  const hours = Array.from({ length: (end - start) / 60 + 1 }, (_, i) => start / 60 + i);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // the "now" line sits at the time, or pinned to the edge it is past
  const nowY = y(Math.max(start, Math.min(end, nowMin)));

  // phone: the day strip's pick, today by default
  const [picked, setPicked] = useState(() => (keys.indexOf(today) >= 0 ? keys.indexOf(today) : Math.min(4, (now.getDay() + 6) % 7)));
  const pick = Math.min(picked, keys.length - 1);
  const touchX = useRef<number | null>(null);
  const swipe = (dx: number) => { if (Math.abs(dx) < 48) return; setPicked((p) => Math.max(0, Math.min(keys.length - 1, p + (dx < 0 ? 1 : -1)))); };
  // the booking sheet, on that day (it picks the first free slot of the day)
  const book = (day: string) => openLog({ mode: "book", day });
  const pickedHours = ohFor(days[pick]);

  return (
    <section aria-label="Week calendar" className="cal mtg-cal">
      <div className="cal-head">
        <div className="cal-nav">
          <IconTip label="Previous week"><button type="button" aria-label="Previous week" className="v4-row-action" onClick={() => setOffset((o) => o - 1)}><ChevronLeft size={18} aria-hidden /></button></IconTip>
          <IconTip label="Next week"><button type="button" aria-label="Next week" className="v4-row-action" onClick={() => setOffset((o) => o + 1)}><ChevronRight size={18} aria-hidden /></button></IconTip>
        </div>
        <span className="cal-range">{range}</span>
        {week.length > 0 ? (
          <span className="mtg-week-progress" role="status" aria-label={`${weekDone} of ${week.length} meetings done`}>
            <SparkBar percent={Math.round((weekDone / week.length) * 100)} min={2} height={5} fill="linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))" glow="var(--primary)" memoryKey={`v4-meetings-week-${keys[0]}`} className="mtg-week-bar" />
            <span className="cal-count"><b>{weekDone}/{week.length}</b> done</span>
          </span>
        ) : <span className="cal-count">0 meetings</span>}
        {offset !== 0 && <button type="button" className="cal-today-link dm-link" onClick={() => setOffset(0)}>This week</button>}
      </div>

      {/* phones: the day strip, then that day's meetings as rows. A plain
         group, not a tablist: the shell styles every tablist as the page
         pill, and this strip is a different shape. */}
      <div className="cal-strip" role="group" aria-label="Day" style={{ gridTemplateColumns: `repeat(${days.length},1fr)` }}>
        {days.map((d, i) => {
          const n = week.filter((m) => m.day === keys[i]).length;
          return (
            <button key={keys[i]} type="button" aria-pressed={pick === i} onClick={() => setPicked(i)} className={`cal-strip-day${keys[i] === today ? " is-today" : ""}`}>
              <small>{keys[i] === today ? "Today" : DAY[d.getDay()]}</small>
              <strong>{d.getDate()}</strong>
              <i aria-hidden style={{ opacity: n ? 1 : 0 }} />
            </button>
          );
        })}
      </div>
      <div className="cal-day-list" onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchX.current !== null) swipe(e.changedTouches[0].clientX - touchX.current); touchX.current = null; }}>
        {pickedHours.length > 0 && <p className="mtg-day-hours">Office hours {hoursLine(pickedHours)}</p>}
        <DayList day={keys[pick]} meetings={week.filter((m) => m.day === keys[pick])} byId={byId} now={now} done={done} nextId={next?.id} onBook={() => book(keys[pick])} />
      </div>

      {/* tablets and up: the time grid */}
      <div className="mtg-grid" style={{ "--cols": days.length } as CSSProperties}>
        <div className="mtg-grid-corner" aria-hidden />
        {days.map((d, i) => {
          const key = keys[i];
          const isToday = key === today;
          return (
            <div key={key} className={`mtg-day-head${isToday ? " is-today" : ""}`}>
              <span className="mtg-day-name">{isToday ? "Today" : DAY[d.getDay()]}</span>
              <span className="mtg-day-num">{d.getDate()}</span>
              <IconTip label={`Book on ${DAY[d.getDay()]} ${fmt(d)}`} className="ml-auto">
                <button type="button" className="mtg-day-book" onClick={() => book(key)} aria-label={`Book a meeting on ${DAY[d.getDay()]} ${fmt(d)}`}><Plus size={15} aria-hidden /></button>
              </IconTip>
            </div>
          );
        })}

        <div className="mtg-axis" style={{ height: y(end) + 10 }} aria-hidden>
          {hours.map((h) => <span key={h} style={{ top: y(h * 60) }}>{hourLabel(h)}</span>)}
        </div>
        {days.map((d, i) => {
          const key = keys[i];
          const isToday = key === today;
          const list = week.filter((m) => m.day === key);
          return (
            <div key={key} className={`mtg-col${isToday ? " is-today" : ""}`} style={{ height: y(end) + 10, backgroundSize: `100% ${PX}px` }}>
              {ohFor(d).map((o) => (
                <div key={o.from} className="mtg-band" style={{ top: y(mins(o.from)), height: y(mins(o.to)) - y(mins(o.from)) }}>
                  <span>Office hours {hoursLine([o])}</span>
                </div>
              ))}
              {list.map((m) => {
                const s = byId.get(m.studentId);
                if (!s) return null;
                const over = isPast(m, now) || !!done[m.id];
                const h = Math.max(24, (m.minutes / 60) * PX - 3);
                const label = `${timeLabel(m.time)} · ${m.minutes} min · ${m.type}${m.topic ? ` · “${m.topic}”` : ""}`;
                return (
                  <div key={m.id} className="mtg-block-pos" style={{ top: y(mins(m.time)) + 1, height: h }}>
                    <IconTip label={label} className="h-full w-full">
                      <Link href={studentHref(s.id)} className={`mtg-block${h >= 38 ? " is-tall" : ""}${m.id === next?.id ? " is-next" : ""}${over ? " is-past" : ""}${done[m.id] ? " is-done" : ""}`} aria-label={`${s.name}, ${label}${done[m.id] ? ", done" : ""}. Open ${s.name}`}>
                        <span className="mtg-block-line">
                          <StudentFace s={s} size={18} />
                          <strong>{s.name}</strong>
                          {done[m.id] ? <Check className="mtg-done-check" size={13} strokeWidth={3} aria-hidden /> : <small>{timeLabel(m.time).replace(":00", "")}</small>}
                        </span>
                        {h >= 38 && <span className="mtg-block-type">{m.type} · {m.minutes} min</span>}
                      </Link>
                    </IconTip>
                  </div>
                );
              })}
              {isToday && <div className="mtg-now" style={{ top: nowY }} aria-hidden><i /></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** One day's meetings as rows (phones). */
function DayList({ day, meetings, byId, now, done, nextId, onBook }: { day: string; meetings: Meeting[]; byId: Map<string, CounselorStudent>; now: Date; done: Record<string, unknown>; nextId?: string; onBook: () => void }) {
  if (!meetings.length) {
    return (
      <div className="cal-day-empty">
        <span>Nothing booked {day === iso(now) ? "today" : "this day"}.</span>
        <button type="button" className="prep-action is-quiet" onClick={onBook}><CalendarPlus className="h-4 w-4" aria-hidden />Book this day</button>
      </div>
    );
  }
  return (
    <ul className="prep-rows">
      {meetings.map((m) => {
        const s = byId.get(m.studentId);
        if (!s) return null;
        const over = isPast(m, now) || !!done[m.id];
        return (
          <li key={m.id} className={`prep-row${over ? " is-past" : ""}`}>
            <span className="prep-row-time">{timeLabel(m.time)}{done[m.id] ? <Check className="mtg-done-check" size={13} strokeWidth={3} aria-label="Done" /> : null}<small>{m.minutes} min</small></span>
            <Link href={studentHref(s.id)} className="prep-row-who dm-quiet">
              <StudentFace s={s} size={40} />
              <span className="flex min-w-0 flex-col">
                <span className="flex min-w-0 items-center text-[15px] leading-[19px] font-semibold"><span className="truncate">{s.name}</span>{m.id === nextId && <span className="prep-next-tag">Next</span>}</span>
                <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
              </span>
            </Link>
            <span className="prep-row-reason">
              <strong>{m.type}</strong>
              {m.topic && <span>“{m.topic}”</span>}
            </span>
          </li>
        );
      })}
      <li className="pt-[var(--space-3)]"><button type="button" className="cal-book dm-link" onClick={onBook}><Plus size={14} aria-hidden /> Book</button></li>
    </ul>
  );
}
