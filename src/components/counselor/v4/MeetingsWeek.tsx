"use client";

// Prepare > Meetings > Upcoming as a week calendar (9 Oct 2026, Chandu,
// reviewing the row list live: "I think meetings can have a more calendar
// look"), then, on the first hour-grid version the same day: "Instead of
// the whole time block view it can be a calendar columns + list view so we
// don't leave out boxes for empty slots etc." So: Monday to Friday as
// columns, and inside each column that day's meetings stacked as compact
// cards in time order (time and length, student, reason; the student's own
// line on hover). No hour rows, no time gutter, no empty slot boxes; each
// column is as tall as its list. Under every list one quiet Book link opens
// v5's booking sheet with that day picked; a day's office hours are one
// muted line under its header. A card opens the student. Phones get a day
// strip and that day's list instead of five narrow columns.
//
// Design budget: v4 tokens only. Column lines are the hairline (--v4-line),
// cards a soft primary surface, today's next meeting the primary itself. A
// card's hover grows the card to fit its full text with 10px of air, so
// nothing is ever clipped on hover.

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { isPast, timeLabel, useOfficeHours, type Meeting, type OfficeHours } from "@/lib/counselorMeetings";
import { openLog } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
// "10 to 11:30 AM", "1:30 to 3 PM": one day's office hours, short
const short = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""}`; };
const ampm = (t: string) => (Number(t.split(":")[0]) < 12 ? "AM" : "PM");
function hoursLine(oh: OfficeHours): string {
  return oh.map((o) => (ampm(o.from) === ampm(o.to) ? `${short(o.from)} to ${short(o.to)} ${ampm(o.to)}` : `${short(o.from)} ${ampm(o.from)} to ${short(o.to)} ${ampm(o.to)}`)).join(" · ");
}

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
  const range = days[0].getMonth() === days[4].getMonth() ? `${fmt(days[0])} to ${days[4].getDate()}` : `${fmt(days[0])} to ${fmt(days[4])}`;
  // phone: the day strip's pick, today by default
  const [picked, setPicked] = useState(() => Math.max(0, Math.min(4, (now.getDay() + 6) % 7)));
  const touchX = useRef<number | null>(null);
  const swipe = (dx: number) => { if (Math.abs(dx) < 48) return; setPicked((p) => Math.max(0, Math.min(4, p + (dx < 0 ? 1 : -1)))); };
  // the booking sheet, on that day (it picks the first free slot of the day)
  const book = (day: string) => openLog({ mode: "book", day });

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

      {/* phones: the day strip, then that day's meetings as rows. A plain
         group, not a tablist: the shell styles every tablist as the page
         pill, and this strip is a different shape. */}
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
        <DayList day={keys[picked]} meetings={week.filter((m) => m.day === keys[picked])} byId={byId} now={now} done={done} nextId={next?.id} onBook={() => book(keys[picked])} />
      </div>

      {/* tablets and up: five columns, each a list */}
      <div className="cal-grid">
        {days.map((d, i) => {
          const key = keys[i];
          const list = week.filter((m) => m.day === key);
          const oh = officeHours.filter((o) => o.weekday === d.getDay());
          return (
            <div key={key} className={`cal-col${key === today ? " is-today" : ""}`}>
              <div className="cal-col-head">
                <small>{key === today ? "Today" : DAY[d.getDay()]}</small>
                <strong>{d.getDate()}</strong>
                {oh.length > 0 && <span className="cal-hours">Office hours {hoursLine(oh)}</span>}
              </div>
              <div className="cal-list">
                {list.length === 0 && <span className="cal-none">Nothing booked</span>}
                {list.map((m) => {
                  const s = byId.get(m.studentId);
                  if (!s) return null;
                  const over = isPast(m, now) || !!done[m.id];
                  return (
                    <Link key={m.id} href={studentHref(s.id)} className={`cal-card${m.id === next?.id ? " is-next" : ""}${over ? " is-past" : ""}`} aria-label={`${timeLabel(m.time)}, ${s.name}, ${m.type}. Open ${s.name}`}>
                      <small>{timeLabel(m.time)} · {m.minutes} min</small>
                      <strong>{s.name}</strong>
                      <span className="cal-card-reason">{m.type}</span>
                      {m.topic && <span className="cal-card-more">“{m.topic}”</span>}
                    </Link>
                  );
                })}
                <button type="button" className="cal-book dm-link" onClick={() => book(key)} aria-label={`Book a meeting on ${DAY[d.getDay()]} ${fmt(d)}`}><Plus size={14} aria-hidden /> Book</button>
              </div>
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
