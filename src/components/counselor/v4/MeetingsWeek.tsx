"use client";

// Prepare > Meetings > Upcoming, the Calendar view.
//
// History: a row list, then (9 Oct 2026, Chandu: "I think meetings can have
// a more calendar look") an hour grid, then the same day ("Instead of the
// whole time block view it can be a calendar columns + list view so we
// don't leave out boxes for empty slots etc.") columns of stacked cards,
// then (10 Oct 2026, "The calendar can be designed better and cooler") a
// time grid with no slot boxes, office hours as the one shape for free time.
//
// This pass (10 Oct 2026, Chandu: "The calendar view needs better design in
// meetings too. This calendar isn't enough. Make it POP."). What it borrows:
// - Cron / Notion Calendar: blocks as soft gradient tiles with a left accent
//   bar, a hover card with the full detail and quick actions, a ghost slot
//   that follows the pointer in free time and books on click.
// - Amie: color by kind of meeting, and a small summary of the week by kind
//   (colored dots with counts) beside a progress ring.
// - Google Calendar's newer week view: the weekday small above a big date
//   numeral, today in a filled circle, a "now" line with a dot and the time.
// Inside the v4 budget: the meeting kinds are tints of the blue family and
// the status colors only (Applications blue, Course planning sky, Resume
// ink blue, Financial aid green, Career exploration amber, Check-in slate),
// no new hues. Today's column is lit and its "now" dot is the page's only
// glow. Office hours are a hatched band, labelled. Past blocks recede, done
// blocks carry a check. Weeks slide in from the side they came from.
// Motion stops under reduced motion; no backdrop-filter, no blur on
// anything that moves (Chromebook guardrails).
//
// Every tool from before is still here: week paging and "This week", the
// range, the week's count as "2/7 done", office hours per day, "+" to book
// per day, each meeting's time, length, student, reason and what they
// wrote (the hover card, and the block's accessible name), past and done
// states, every face and name opening the student. Phones keep the day
// strip; the day's list uses the same block style.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CalendarClock, CalendarPlus, Check, ChevronLeft, ChevronRight, Plus, UserRound } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { playCorrect } from "@/components/play/sound";
import { cv } from "@/lib/counselorBase";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { completeMeeting, isPast, timeLabel, useOfficeHours, type Meeting, type MeetingType, type OfficeHours } from "@/lib/counselorMeetings";
import { logTime } from "@/lib/counselorTimeLog";
import { openLog } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { STATUS_COLORS } from "./chips";
import { logNote } from "./meetingsModel";
import { LightStrip } from "./charts/lit";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
// "10 to 11:30 AM", "1:30 to 3 PM": one day's office hours, short
const short = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""}`; };
const ampm = (t: string) => (Number(t.split(":")[0]) < 12 ? "AM" : "PM");
function hoursLine(oh: OfficeHours): string {
  return oh.map((o) => (ampm(o.from) === ampm(o.to) ? `${short(o.from)} to ${short(o.to)} ${ampm(o.to)}` : `${short(o.from)} ${ampm(o.from)} to ${short(o.to)} ${ampm(o.to)}`)).join(" · ");
}
const hourLabel = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 || h === 24 ? "AM" : "PM"}`;
/** Pixels per hour before the grid is measured (and on the server). On the
 *  client the hour rows grow to fill the screen's height, between these
 *  bounds, so a tall 1440p or 4K screen gets a calendar with no dead band
 *  under it (10 Oct 2026: "make sure there is no stupid awkward alignment
 *  and spacing on wide big tall screens"). */
const PX_DEFAULT = 88;
const PX_MIN = 76;
const PX_MAX = 140;
/** Each kind of meeting has a tone (meetings.css .t-*), blue family and status colors only. */
const TONE: Record<MeetingType, string> = { Applications: "t-app", "Financial aid": "t-aid", "Course planning": "t-course", Resume: "t-resume", "Career exploration": "t-career", "Check-in": "t-check" };
const KINDS: MeetingType[] = ["Applications", "Financial aid", "Course planning", "Resume", "Career exploration", "Check-in"];

type Hover = { m: Meeting; s: CounselorStudent; rect: DOMRect };

export function MeetingsWeek({ meetings, roster, now, done }: { meetings: Meeting[]; roster: CounselorStudent[]; now: Date; done: Record<string, { notes: string; at: string }> }) {
  const officeHours = useOfficeHours();
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const [offset, setOffset] = useState(0);
  // which way the last page went, so the next week slides in from that side
  const [dir, setDir] = useState(0);
  const page = (d: number) => { setDir(d); setOffset((o) => (d === 0 ? 0 : o + d)); };
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const all7 = [0, 1, 2, 3, 4, 5, 6].map((k) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + k));
  const today = iso(now);
  const week = meetings.filter((m) => m.day >= iso(all7[0]) && m.day <= iso(all7[6]));
  // weekdays always; a weekend day only when it is today or holds a meeting
  const days = all7.filter((d, k) => k < 5 || iso(d) === today || week.some((m) => m.day === iso(d)));
  const keys = days.map(iso);
  const weekDone = week.filter((m) => done[m.id]).length;
  const kinds = KINDS.map((k) => ({ k, n: week.filter((m) => m.type === k).length })).filter((x) => x.n);
  // the next meeting still to come
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
  // hour rows sized to the screen: the grid's body fills the viewport below its top
  const gridRef = useRef<HTMLDivElement>(null);
  const [PX, setPx] = useState(PX_DEFAULT);
  const span = (end - start) / 60;
  useLayoutEffect(() => {
    const fit = () => {
      const el = gridRef.current;
      if (!el || el.offsetParent === null) return;
      const head = el.querySelector<HTMLElement>(".mtg-day-head")?.offsetHeight ?? 70;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const room = window.innerHeight - top - head - 20 - 32;
      setPx(Math.round(Math.max(PX_MIN, Math.min(PX_MAX, room / span))));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [span]);
  // 10px of air above the first hour line and below the last, so their labels never clip
  const y = (m: number) => ((m - start) / 60) * PX + 10;
  const hours = Array.from({ length: (end - start) / 60 + 1 }, (_, i) => start / 60 + i);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // the "now" line sits at the time, or pinned to the edge it is past
  const nowY = y(Math.max(start, Math.min(end, nowMin)));
  const nowLabel = timeLabel(hhmm(nowMin));

  // phone: the day strip's pick, today by default
  const [picked, setPicked] = useState(() => (keys.indexOf(today) >= 0 ? keys.indexOf(today) : Math.min(4, (now.getDay() + 6) % 7)));
  const pick = Math.min(picked, keys.length - 1);
  const touchX = useRef<number | null>(null);
  const swipe = (dx: number) => { if (Math.abs(dx) < 48) return; setPicked((p) => Math.max(0, Math.min(keys.length - 1, p + (dx < 0 ? 1 : -1)))); };
  // the booking sheet, on that day (and time, from a click in office hours)
  const book = (day: string, time?: string) => openLog({ mode: "book", day, time });
  const pickedHours = ohFor(days[pick]);

  // free time inside office hours: a ghost slot follows the pointer, a click books it
  const [ghost, setGhost] = useState<{ day: string; min: number } | null>(null);
  const slotAt = (e: React.MouseEvent<HTMLElement>, from: number, to: number) => {
    const r = e.currentTarget.getBoundingClientRect();
    const m = from + Math.floor((((e.clientY - r.top) / PX) * 60) / 15) * 15;
    return Math.max(from, Math.min(to - 15, m));
  };

  // the hover card: shown after a short pause, kept while the pointer is on it
  const [hover, setHover] = useState<Hover | null>(null);
  const showT = useRef<number | undefined>(undefined);
  const hideT = useRef<number | undefined>(undefined);
  const show = (h: Hover) => { window.clearTimeout(hideT.current); window.clearTimeout(showT.current); showT.current = window.setTimeout(() => setHover(h), 140); };
  const hide = () => { window.clearTimeout(showT.current); hideT.current = window.setTimeout(() => setHover(null), 160); };
  const keep = () => window.clearTimeout(hideT.current);
  useEffect(() => () => { window.clearTimeout(showT.current); window.clearTimeout(hideT.current); }, []);
  useEffect(() => {
    if (!hover) return;
    const off = () => setHover(null);
    window.addEventListener("scroll", off, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", off, { capture: true } as EventListenerOptions);
  }, [hover]);

  return (
    <section aria-label="Week calendar" className="cal mtg-cal">
      <div className="mtg-cal-head">
        <div className="cal-nav">
          <IconTip label="Previous week"><button type="button" aria-label="Previous week" className="v4-row-action" onClick={() => page(-1)}><ChevronLeft size={18} aria-hidden /></button></IconTip>
          <IconTip label="Next week"><button type="button" aria-label="Next week" className="v4-row-action" onClick={() => page(1)}><ChevronRight size={18} aria-hidden /></button></IconTip>
        </div>
        <span className="mtg-cal-range">{range}</span>
        {offset !== 0 && <button type="button" className="cal-today-link dm-link" onClick={() => page(0)}>This week</button>}
        <span className="mtg-cal-sum">
          {week.length > 0 ? (
            <span className="mtg-ring-wrap" role="status" aria-label={`${weekDone} of ${week.length} meetings done`}>
              {/* a short light trail to one point (10 Oct 2026 glow pass; was a
                 ring: "why is everything a ring to you?", "made of LIGHT") */}
              <LightStrip pct={(weekDone / week.length) * 100} className="mtg-week-strip" />
              <span className="cal-count"><b>{weekDone}/{week.length}</b> done</span>
            </span>
          ) : <span className="cal-count">0 meetings</span>}
          {kinds.length > 0 && (
            <span className="mtg-kinds" aria-label="Meetings by kind">
              {kinds.map(({ k, n }) => (
                <IconTip key={k} label={`${k}: ${n}`}>
                  <span className={`mtg-kind ${TONE[k]}`} tabIndex={0} aria-label={`${k}: ${n}`}><i aria-hidden />{n}</span>
                </IconTip>
              ))}
            </span>
          )}
        </span>
      </div>

      {/* phones: the day strip, then that day's meetings as blocks. A plain
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
        {pickedHours.length > 0 && <p className="mtg-day-hours"><span className="mtg-hatch-chip" aria-hidden />Office hours {hoursLine(pickedHours)}</p>}
        <DayList day={keys[pick]} meetings={week.filter((m) => m.day === keys[pick])} byId={byId} now={now} done={done} nextId={next?.id} onBook={() => book(keys[pick])} />
      </div>

      {/* tablets and up: the time grid; a new week slides in from its side */}
      <div ref={gridRef} key={keys[0]} className={`mtg-grid${dir > 0 ? " is-from-next" : dir < 0 ? " is-from-prev" : ""}`} style={{ "--cols": days.length } as CSSProperties}>
        <div className="mtg-grid-corner" aria-hidden />
        {days.map((d, i) => {
          const key = keys[i];
          const isToday = key === today;
          return (
            <div key={key} className={`mtg-day-head${isToday ? " is-today" : ""}`}>
              <span className="mtg-day-date">
                <span className="mtg-day-name">{isToday ? "Today" : DAY[d.getDay()]}</span>
                <span className="mtg-day-num">{d.getDate()}</span>
              </span>
              <IconTip label={`Book on ${DAY[d.getDay()]} ${fmt(d)}`} className="ml-auto">
                <button type="button" className="mtg-day-book" onClick={() => book(key)} aria-label={`Book a meeting on ${DAY[d.getDay()]} ${fmt(d)}`}><Plus size={15} aria-hidden /></button>
              </IconTip>
            </div>
          );
        })}

        <div className="mtg-axis" style={{ height: y(end) + 10 }} aria-hidden>
          {hours.map((h) => <span key={h} style={{ top: y(h * 60) }}>{hourLabel(h)}</span>)}
        </div>
        {days.map((d) => {
          const key = iso(d);
          const isToday = key === today;
          const list = week.filter((m) => m.day === key);
          return (
            <div key={key} className={`mtg-col${isToday ? " is-today" : ""}`} style={{ height: y(end) + 10, backgroundSize: `100% ${PX}px` }}>
              {ohFor(d).map((o) => {
                const from = mins(o.from);
                const to = mins(o.to);
                const g = ghost && ghost.day === key && ghost.min >= from && ghost.min < to ? ghost.min : null;
                return (
                  <div key={o.from} className="mtg-band-wrap" style={{ top: y(from), height: y(to) - y(from) }}>
                    <span className="mtg-band-label" aria-hidden>Office hours {hoursLine([o])}</span>
                    <button type="button" className="mtg-band" aria-label={`Book in office hours, ${DAY[d.getDay()]} ${fmt(d)}, ${hoursLine([o])}`}
                      onMouseMove={(e) => { const m = slotAt(e, from, to); if (!ghost || ghost.min !== m || ghost.day !== key) setGhost({ day: key, min: m }); }}
                      onMouseLeave={() => setGhost(null)}
                      onClick={(e) => (e.detail === 0 ? book(key) : book(key, hhmm(slotAt(e, from, to))))}>
                      {g !== null && <span className="mtg-ghost" style={{ top: ((g - from) / 60) * PX, height: (15 / 60) * PX - 2 }}><Plus size={13} aria-hidden />Book {timeLabel(hhmm(g)).replace(":00", "")}</span>}
                    </button>
                  </div>
                );
              })}
              {list.map((m) => {
                const s = byId.get(m.studentId);
                if (!s) return null;
                const over = isPast(m, now) || !!done[m.id];
                const h = Math.max(24, (m.minutes / 60) * PX - 3);
                const tall = h >= 34;
                const roomy = h >= 62 && !!m.topic;
                return (
                  <div key={m.id} className="mtg-block-pos" style={{ top: y(mins(m.time)) + 1, height: h }}>
                    <Link href={studentHref(s.id)}
                      className={`mtg-block ${TONE[m.type]}${tall ? " is-tall" : ""}${m.id === next?.id ? " is-next" : ""}${over ? " is-past" : ""}${done[m.id] ? " is-done" : ""}`}
                      aria-label={`${s.name}, ${timeLabel(m.time)}, ${m.minutes} min, ${m.type}${m.topic ? `, “${m.topic}”` : ""}${done[m.id] ? ", done" : ""}. Open ${s.name}`}
                      onMouseEnter={(e) => show({ m, s, rect: e.currentTarget.getBoundingClientRect() })}
                      onMouseLeave={hide}
                      onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) show({ m, s, rect: e.currentTarget.getBoundingClientRect() }); }}
                      onBlur={hide}>
                      <StudentFace s={s} size={h >= 44 ? 24 : tall ? 20 : 16} />
                      <span className="mtg-block-text">
                        <strong>{s.name}</strong>
                        <small>{tall ? `${m.type} · ` : ""}{timeLabel(m.time).replace(":00", "")}</small>
                        {roomy && <small className="mtg-block-topic">“{m.topic}”</small>}
                      </span>
                      {done[m.id] && <span className="mtg-block-check" aria-hidden><Check size={11} strokeWidth={3.2} /></span>}
                    </Link>
                  </div>
                );
              })}
              {isToday && <div className="mtg-now" style={{ top: nowY }} aria-hidden><i /><b>{nowLabel}</b></div>}
            </div>
          );
        })}
      </div>

      {hover && <HoverCard h={hover} now={now} done={!!done[hover.m.id]} onEnter={keep} onLeave={hide} onClose={() => setHover(null)} />}
    </section>
  );
}

/** Hovering a block: the whole meeting and three quick actions. Portalled
 *  to the body so no column clips it, placed beside the block, then
 *  measured and clamped to the viewport (the cross-browser guardrail). */
function HoverCard({ h, now, done, onEnter, onLeave, onClose }: { h: Hover; now: Date; done: boolean; onEnter: () => void; onLeave: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const hh = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = h.rect.right + 10;
    if (left + w > vw - 12) left = h.rect.left - w - 10;
    left = Math.max(12, Math.min(vw - w - 12, left));
    const top = Math.max(12, Math.min(vh - hh - 12, h.rect.top - 6));
    setPos({ left, top });
  }, [h]);
  const { m, s } = h;
  const over = isPast(m, now);
  const end = timeLabel(hhmm(mins(m.time) + m.minutes));
  const markDone = () => {
    completeMeeting(m.id, logNote(m));
    logTime({ activity: `Meeting: ${m.type.toLowerCase()}`, minutes: m.minutes, kind: "direct", studentId: s.id, auto: true });
    playCorrect();
    onClose();
  };
  return createPortal(
    <div className="marketing-v2 themeable mtg-pop-layer">
      <div ref={ref} role="dialog" aria-label={`${s.name}, ${m.type}`} className={`mtg-pop ${TONE[m.type]}`} style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: 0 }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <span className="mtg-pop-kind"><i aria-hidden />{m.type}</span>
        <Link href={studentHref(s.id)} className="mtg-pop-who">
          <StudentFace s={s} size={44} />
          <span className="flex min-w-0 flex-col">
            <strong className="truncate">{s.name}</strong>
            <small>Grade {s.grade} · <span style={{ color: STATUS_COLORS[s.status] }}>{s.status}</span></small>
          </span>
        </Link>
        <p className="mtg-pop-when">{DAY[new Date(`${m.day}T12:00:00`).getDay()]}, {fmt(new Date(`${m.day}T12:00:00`))} · {timeLabel(m.time)} to {end} · {m.minutes} min</p>
        {m.topic && <p className="mtg-pop-topic">“{m.topic}”</p>}
        {done && <p className="mtg-pop-done"><Check className="h-[14px] w-[14px]" aria-hidden />Done</p>}
        <div className="mtg-pop-actions">
          <Link href={studentHref(s.id)} className="mtg-pop-btn"><UserRound className="h-[14px] w-[14px]" aria-hidden />Open</Link>
          {over && !done && <button type="button" className="mtg-pop-btn is-solid" onClick={markDone}><Check className="h-[14px] w-[14px]" aria-hidden />Mark done</button>}
          {!over && <button type="button" className="mtg-pop-btn" onClick={() => { onClose(); openLog({ mode: "book", studentId: s.id }); }}><CalendarClock className="h-[14px] w-[14px]" aria-hidden />Reschedule</button>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** One day's meetings (phones), in the same block style as the grid. */
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
    <ul className="mtg-day-blocks">
      {meetings.map((m) => {
        const s = byId.get(m.studentId);
        if (!s) return null;
        const over = isPast(m, now) || !!done[m.id];
        return (
          <li key={m.id}>
            <Link href={studentHref(s.id)} className={`mtg-block is-row ${TONE[m.type]}${m.id === nextId ? " is-next" : ""}${over ? " is-past" : ""}${done[m.id] ? " is-done" : ""}`}>
              <span className="mtg-row-time">{timeLabel(m.time)}<small>{m.minutes} min</small></span>
              <StudentFace s={s} size={34} />
              <span className="mtg-block-text">
                <strong>{s.name}{m.id === nextId && <span className="prep-next-tag">Next</span>}</strong>
                <small>{m.type} · Grade {s.grade}</small>
                {m.topic && <small className="mtg-row-topic">“{m.topic}”</small>}
              </span>
              {!!done[m.id] && <span className="mtg-block-check" aria-label="Done"><Check size={11} strokeWidth={3.2} /></span>}
            </Link>
          </li>
        );
      })}
      <li><button type="button" className="cal-book dm-link" onClick={onBook}><Plus size={14} aria-hidden /> Book</button></li>
    </ul>
  );
}
