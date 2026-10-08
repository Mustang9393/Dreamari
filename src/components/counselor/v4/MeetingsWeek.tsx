"use client";

// Prepare > Meetings > Upcoming as a week calendar (9 Oct 2026, Chandu,
// reviewing the row list live: "I think meetings can have a more calendar
// look"). Monday to Friday as columns, the counselor's working day as rows,
// each meeting a block at its time whose height is its length. The
// counselor's office hours are shaded softly in their columns, so free,
// bookable time reads at a glance; a free slot is itself the way to book
// (it opens v5's booking sheet with that day and time already picked), and
// a block opens the student. Phones get a day strip and that day's list
// instead of five narrow columns; tablets keep the grid with name-only
// blocks and the reason on hover.
//
// Design budget: v4 tokens only. Grid lines are the hairline (--v4-line),
// blocks a soft primary surface, today's next meeting the primary itself,
// office hours a very light primary wash. A block's hover grows the block
// to fit its full text (name, reason, the student's line) with 10px of air,
// so nothing is ever clipped on hover.

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { isPast, timeLabel, useOfficeHours, type Meeting } from "@/lib/counselorMeetings";
import { openLog } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";

const HOUR_PX = 88;
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const hourLabel = (m: number) => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1} ${h < 12 ? "AM" : "PM"}`; };
const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function MeetingsWeek({ meetings, roster, now, done }: { meetings: Meeting[]; roster: CounselorStudent[]; now: Date; done: Record<string, { notes: string; at: string }> }) {
  const officeHours = useOfficeHours();
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const [offset, setOffset] = useState(0);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const days = [0, 1, 2, 3, 4].map((k) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + k));
  const keys = days.map(iso);
  const today = iso(now);
  const week = meetings.filter((m) => m.day >= keys[0] && m.day <= keys[4]);
  // the next meeting still to come, marked in the primary
  const next = meetings.find((m) => !isPast(m, now) && !done[m.id]);
  // The working day: the earliest and latest booking this week (and the
  // office hours) with 30 minutes of margin, never narrower than 8 to 4.
  const [startMin, endMin] = useMemo(() => {
    let lo = 8 * 60, hi = 16 * 60;
    for (const m of week) { lo = Math.min(lo, mins(m.time) - 30); hi = Math.max(hi, mins(m.time) + m.minutes + 30); }
    for (const o of officeHours) { lo = Math.min(lo, mins(o.from) - 30); hi = Math.max(hi, mins(o.to) + 30); }
    return [Math.floor(lo / 60) * 60, Math.ceil(hi / 60) * 60];
  }, [week, officeHours]);
  const hours = Array.from({ length: (endMin - startMin) / 60 }, (_, i) => startMin + i * 60);
  const y = (m: number) => ((m - startMin) / 60) * HOUR_PX;
  const range = days[0].getMonth() === days[4].getMonth() ? `${fmt(days[0])} to ${days[4].getDate()}` : `${fmt(days[0])} to ${fmt(days[4])}`;
  // phone: the day strip's pick, today by default
  const [picked, setPicked] = useState(() => Math.max(0, Math.min(4, (now.getDay() + 6) % 7)));
  const touchX = useRef<number | null>(null);
  const swipe = (dx: number) => { if (Math.abs(dx) < 48) return; setPicked((p) => Math.max(0, Math.min(4, p + (dx < 0 ? 1 : -1)))); };
  const book = (day: string, time: string) => openLog({ mode: "book", day, time });

  return (
    <section aria-label="Week calendar" className="cal">
      <div className="cal-head">
        <div className="cal-nav">
          <IconTip label="Previous week"><button type="button" aria-label="Previous week" className="v4-row-action" onClick={() => setOffset((o) => o - 1)}><ChevronLeft size={18} aria-hidden /></button></IconTip>
          <IconTip label="Next week"><button type="button" aria-label="Next week" className="v4-row-action" onClick={() => setOffset((o) => o + 1)}><ChevronRight size={18} aria-hidden /></button></IconTip>
        </div>
        <span className="cal-range">{range}</span>
        <span className="cal-count">{week.length} {week.length === 1 ? "meeting" : "meetings"}</span>
        {offset !== 0 && <button type="button" className="cal-today-link dm-link" onClick={() => setOffset(0)}>This week</button>}
      </div>

      {/* phones: the day strip, then that day's meetings as rows */}
      {/* a plain group, not a tablist: the shell styles every tablist as
         the page pill, and this strip is a different shape */}
      <div className="cal-strip" role="group" aria-label="Day">
        {days.map((d, i) => {
          const n = week.filter((m) => m.day === keys[i]).length;
          return (
            <button key={keys[i]} type="button" aria-pressed={picked === i} onClick={() => setPicked(i)} className={`cal-strip-day${keys[i] === today ? " is-today" : ""}`}>
              <small>{keys[i] === today ? "Today" : DAY[d.getDay()]}</small>
              <strong>{d.getDate()}</strong>
              <i aria-hidden style={{ opacity: n ? 1 : 0 }} />
            </button>
          );
        })}
      </div>
      <div className="cal-day-list" onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchX.current !== null) swipe(e.changedTouches[0].clientX - touchX.current); touchX.current = null; }}>
        <DayList day={keys[picked]} meetings={week.filter((m) => m.day === keys[picked])} byId={byId} now={now} done={done} nextId={next?.id} onBook={() => book(keys[picked], hhmm(startMin + 60))} />
      </div>

      {/* tablets and up: the grid */}
      <div className="cal-grid" style={{ "--cal-hours": hours.length, "--cal-hour": `${HOUR_PX}px` } as React.CSSProperties}>
        <div className="cal-corner" aria-hidden />
        {days.map((d, i) => (
          <div key={keys[i]} className={`cal-col-head${keys[i] === today ? " is-today" : ""}`}>
            <small>{keys[i] === today ? "Today" : DAY[d.getDay()]}</small>
            <strong>{d.getDate()}</strong>
          </div>
        ))}
        <div className="cal-gutter" aria-hidden>
          {hours.map((h) => <span key={h} style={{ top: y(h) }}>{hourLabel(h)}</span>)}
        </div>
        {days.map((d, i) => {
          const key = keys[i];
          const list = week.filter((m) => m.day === key);
          const oh = officeHours.filter((o) => o.weekday === d.getDay());
          return (
            <div key={key} className={`cal-col${key === today ? " is-today" : ""}`}>
              {oh.map((o) => <span key={`${o.from}${o.to}`} className="cal-office" aria-hidden style={{ top: y(mins(o.from)), height: y(mins(o.to)) - y(mins(o.from)) }} />)}
              {/* every free half hour still to come is a way to book */}
              {hours.flatMap((h) => [h, h + 30]).map((t) => {
                const past = key < today || (key === today && t <= now.getHours() * 60 + now.getMinutes());
                const taken = list.some((m) => mins(m.time) < t + 30 && mins(m.time) + m.minutes > t);
                if (past || taken) return null;
                return (
                  <button key={t} type="button" className="cal-slot" style={{ top: y(t), height: HOUR_PX / 2 }} aria-label={`Book ${DAY[d.getDay()]} ${fmt(d)} at ${timeLabel(hhmm(t))}`} onClick={() => book(key, hhmm(t))}>
                    <span><CalendarPlus size={13} aria-hidden /> Book</span>
                  </button>
                );
              })}
              {list.map((m) => {
                const s = byId.get(m.studentId);
                if (!s) return null;
                const over = isPast(m, now) || !!done[m.id];
                return (
                  <Link key={m.id} href={studentHref(s.id)} className={`cal-block${m.id === next?.id ? " is-next" : ""}${over ? " is-past" : ""}${m.minutes <= 15 ? " is-short" : ""}`} style={{ top: y(mins(m.time)), height: (m.minutes / 60) * HOUR_PX - 2 }} aria-label={`${timeLabel(m.time)}, ${s.name}, ${m.type}. Open ${s.name}`}>
                    <strong>{s.name}</strong>
                    <span className="cal-block-reason">{m.type}</span>
                    <span className="cal-block-more">{timeLabel(m.time)} · {m.minutes} min{m.topic ? ` · “${m.topic}”` : ""}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
        {week.length === 0 && (
          <div className="cal-empty">
            <strong>Nothing booked this week</strong>
            <span>Tap a free slot to book a meeting.</span>
          </div>
        )}
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
            <span className="prep-row-time">{timeLabel(m.time)}<small>{m.minutes} min</small></span>
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
    </ul>
  );
}
