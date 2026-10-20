"use client";

// v7 Prepare (20 Oct 2026): the Replit's "Prepare for a student meeting".
// The week's meetings by day, each with what the student has open and
// whether it needs prep, a Prepare button into the meeting brief, requests
// to Confirm / Suggest a time / Decline, Add meeting, and the counselor's
// availability. Agenda or Calendar.
//
// The brief itself (Prepare on a row) is v5's, untouched: Joshua, 20 Oct:
// "when a counselor clicks Prepare next to a student like Omar and opens the
// individual meeting brief, do not update that screen yet."
//
// Changed from the Replit: one line per meeting (the reason and the first
// open item, not a stack of three lines), the status as a dot and a word,
// the later weeks as one quiet line each, and the week stepper in place of
// a twelve-month dropdown (a counselor plans by the week).

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { addMeeting, MEETING_TYPES, officeHoursLabel, setOfficeHours, timeLabel, useOfficeHours, type Meeting, type MeetingType, type OfficeHours } from "@/lib/counselorMeetings";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { isoDay } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { notify } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { V5Prepare } from "../v5/Prepare";
import { STUDENT_ID } from "@/components/profile/BookCounselorSheet";
import { addDays, answerMeeting, flagsFor, inWeek, markPrepped, mondayOf, prepFor, PREP_DOT, PREP_LABEL, useAllMeetings, useAnswers, usePrepped, type Prep } from "./data";
import { moment, CARD, CARD_STYLE, DISPLAY, Field, FIELD, FIELD_STYLE, Modal, MUTED, PageHead, PrimaryButton, QuietButton, RULE, TextLink, Toggle, briefHref } from "./ui";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const range = (m: Date) => { const f = addDays(m, 4); return `${MON[m.getMonth()]} ${m.getDate()} – ${m.getMonth() === f.getMonth() ? "" : `${MON[f.getMonth()]} `}${f.getDate()}`; };

export function V7Prepare({ studentId }: { studentId?: string }) {
  if (studentId) return <V5Prepare studentId={studentId} />;
  return <Agenda />;
}

type Row = { m: Meeting; s: CounselorStudent; prep: Prep };

function Agenda() {
  const roster = useReviewedRoster();
  const meetings = useAllMeetings(roster);
  const answers = useAnswers();
  const prepped = usePrepped();
  const [now] = useState(() => new Date());
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<"agenda" | "calendar">("agenda");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingHours, setEditingHours] = useState(false);
  const hours = useOfficeHours();
  const monday = addDays(mondayOf(now), offset * 7);
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);

  const rows: Row[] = useMemo(() => {
    const week = meetings.filter((m) => inWeek(m, monday));
    // DEMO-ONLY: the demo week always shows one request to answer. A
    // student's own booking from My Plan (studentId real-student) is a real
    // request; without one, the week's last seeded meeting stands in.
    const stand = week.some((m) => m.studentId === STUDENT_ID) ? null : week[week.length - 1]?.id;
    return week
      .filter((m) => answers[m.id] !== "declined")
      .map((m) => {
        const s = byId.get(m.studentId)!;
        const booked = m.studentId === STUDENT_ID || m.id === stand;
        return { m, s, prep: prepFor(m, s, booked, answers, prepped) };
      })
      .filter((r) => !q || r.s.name.toLowerCase().includes(q.toLowerCase()));
  }, [meetings, monday, answers, prepped, byId, q]);

  const needPrep = rows.filter((r) => r.prep === "prep" || r.prep === "action").length;
  const days = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));
  const later = [1, 2, 3].map((w) => ({ w, n: meetings.filter((m) => inWeek(m, addDays(monday, w * 7))).length }));

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Prepare" action={<PrimaryButton onClick={() => setAdding(true)} icon={<CalendarPlus className="h-4 w-4" aria-hidden />}>Add meeting</PrimaryButton>} />

      <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-[var(--space-3)]">
          <QuietButton label="Previous week" onClick={() => setOffset((o) => o - 1)} icon={<ChevronLeft className="h-4 w-4" aria-hidden />} />
          <div className="flex min-w-[150px] flex-col">
            <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={DISPLAY}>{range(monday)}</span>
            <span className="text-[13px]" style={MUTED}>{rows.length} {rows.length === 1 ? "meeting" : "meetings"}{needPrep ? ` · ${needPrep} need prep` : ""}</span>
          </div>
          <QuietButton label="Next week" onClick={() => setOffset((o) => o + 1)} icon={<ChevronRight className="h-4 w-4" aria-hidden />} />
          {offset !== 0 && <button type="button" onClick={() => setOffset(0)} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}>This week</button>}
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <label className="relative flex min-w-0 flex-1 items-center md:w-[240px] md:flex-none">
            <Search className="pointer-events-none absolute left-[12px] h-4 w-4" style={MUTED} aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a student" aria-label="Find a student in this week's meetings" className="h-10 w-full rounded-[var(--radius-md)] border bg-transparent pr-[10px] pl-[36px] text-[14px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
          </label>
          <Toggle label="View" value={mode} onChange={setMode} options={[{ key: "agenda", label: "Agenda" }, { key: "calendar", label: "Calendar" }]} />
        </div>
      </div>

      {mode === "agenda" ? (
        rows.length ? (
          <div className="flex flex-col gap-[var(--space-6)]">
            {days.map((d) => {
              const today = rows.filter((r) => r.m.day === isoDay(d));
              if (!today.length) return null;
              return (
                <section key={isoDay(d)} id={`day-${isoDay(d)}`} aria-label={DAY[d.getDay()]} className="flex scroll-mt-[96px] flex-col gap-[var(--space-3)]">
                  <h2 className="text-[15px] font-semibold">{DAY[d.getDay()]}, {MON[d.getMonth()]} {d.getDate()}{isoDay(d) === isoDay(now) && <span style={MUTED}> · Today</span>}</h2>
                  <ul className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
                    {today.map((r) => <AgendaRow key={r.m.id} r={r} />)}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-6)]">
            <p className="text-[16px] font-semibold">{q ? "No meetings match." : "No meetings booked this week."}</p>
            {!q && <TextLink onClick={() => setAdding(true)}>Add a meeting</TextLink>}
          </div>
        )
      ) : (
        <CalendarWeek days={days} rows={rows} />
      )}

      <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
        {later.map(({ w, n }) => (
          <button key={w} type="button" onClick={() => setOffset((o) => o + w)} className="dm-quiet -mx-[8px] flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] px-[8px] py-[8px] text-left">
            <span className="text-[15px] font-semibold">Week of {range(addDays(monday, w * 7)).split(" – ")[0]}</span>
            <span className="flex items-center gap-[6px] text-[14px]" style={MUTED}>{n ? `${n} ${n === 1 ? "meeting" : "meetings"}` : "Open"}<ChevronRight className="h-4 w-4" aria-hidden /></span>
          </button>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] pt-[var(--space-3)]">
          <span className="text-[14px]" style={MUTED}>Office hours: {officeHoursLabel(hours)}</span>
          <TextLink onClick={() => setEditingHours(true)}>Edit availability</TextLink>
        </div>
      </div>

      {adding && <AddMeeting roster={roster} onClose={() => setAdding(false)} />}
      {editingHours && <Availability hours={hours} onClose={() => setEditingHours(false)} />}
    </div>
  );
}

function AgendaRow({ r }: { r: Row }) {
  const { m, s, prep } = r;
  // one line: the open item that makes it need prep, else what the student wrote
  const why = flagsFor(s)[0] ?? (m.topic || m.type);
  const requested = prep === "requested";
  const body = (
    <>
      <span className="w-[76px] flex-none text-[15px] font-semibold tabular-nums">{timeLabel(m.time)}</span>
      <StudentFace s={s} size={32} />
      <span className="w-[132px] flex-none truncate text-[15px] font-semibold sm:w-[180px]">{s.name}</span>
      <span className="min-w-0 flex-1 truncate text-[14px]" style={MUTED}>{why}</span>
      {/* only what needs something is said; a ready meeting stays quiet */}
      <span className="inline-flex w-[124px] flex-none items-center justify-end gap-[7px] text-[13px] font-semibold whitespace-nowrap">
        {prep !== "ready" && <><span aria-hidden className="size-[8px] rounded-full" style={{ background: PREP_DOT[prep] }} />{PREP_LABEL[prep]}</>}
      </span>
    </>
  );
  const row = "flex flex-wrap items-center gap-x-[14px] gap-y-[8px] px-[var(--space-5)] py-[11px] md:flex-nowrap";
  // The row itself opens the brief (the Replit's Prepare button, one per row,
  // repeated seven times down the page); only a request keeps buttons,
  // because it needs an answer.
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: RULE }}>
      {requested ? (
        <div className={row}>
          {body}
          <span className="flex flex-none flex-wrap items-center gap-[var(--space-2)]">
            <QuietButton onClick={() => { answerMeeting(m.id, "confirmed"); notify(`Confirmed with ${s.name.split(" ")[0]}`); moment(true); }}>Confirm</QuietButton>
            <QuietButton onClick={() => notify(`Asked ${s.name.split(" ")[0]} to pick another time`)}>Suggest time</QuietButton>
            <QuietButton label="Decline" icon={<X className="h-4 w-4" aria-hidden />} onClick={() => { answerMeeting(m.id, "declined"); notify(`Declined ${s.name.split(" ")[0]}'s request`); }} />
          </span>
        </div>
      ) : (
        <Link href={briefHref(s.id)} onClick={() => markPrepped(m.id)} aria-label={`Prepare for ${s.name}, ${timeLabel(m.time)}`} className={`dm-quiet group ${row}`}>
          {body}
          <ChevronRight className="hidden h-4 w-4 flex-none opacity-60 transition-transform group-hover:translate-x-[2px] md:block" aria-hidden />
        </Link>
      )}
    </li>
  );
}

/** The week as five columns, a block per meeting. */
function CalendarWeek({ days, rows }: { days: Date[]; rows: Row[] }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <div className={`${CARD} grid min-w-[720px] grid-cols-5 overflow-hidden`} style={CARD_STYLE}>
        {days.map((d, i) => {
          const list = rows.filter((r) => r.m.day === isoDay(d));
          return (
            <div key={isoDay(d)} className={`flex min-h-[320px] flex-col gap-[8px] p-[12px] ${i ? "border-l" : ""}`} style={{ borderColor: RULE }}>
              <span className="pb-[4px] text-[13px] font-semibold">{DAY[d.getDay()].slice(0, 3)} <span style={MUTED}>{d.getDate()}</span></span>
              {list.map((r) => (
                  <Link key={r.m.id} href={briefHref(r.s.id)} onClick={() => markPrepped(r.m.id)} className="dm-quiet flex flex-col gap-[2px] rounded-[10px] border-l-[3px] px-[10px] py-[8px]" style={{ background: "var(--glass-surface-3)", borderColor: PREP_DOT[r.prep] }}>
                    <span className="text-[13px] tabular-nums" style={MUTED}>{timeLabel(r.m.time)}</span>
                    <span className="truncate text-[13px] font-semibold">{r.s.name}</span>
                    <span className="sr-only">{PREP_LABEL[r.prep]}</span>
                  </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- sheets --------------------------------------------------------------------

const TYPE_LABEL: Record<MeetingType, string> = { "Check-in": "Check-in", Applications: "Applications", "Financial aid": "FAFSA and aid", "Course planning": "Course planning", Resume: "Resume", "Career exploration": "Career planning" };

function AddMeeting({ roster, onClose }: { roster: CounselorStudent[]; onClose: () => void }) {
  const [studentId, setStudentId] = useState("");
  const [day, setDay] = useState(() => isoDay(new Date()));
  const [time, setTime] = useState("10:00");
  const [minutes, setMinutes] = useState(30);
  const [type, setType] = useState<MeetingType>("Check-in");
  const sorted = useMemo(() => [...roster].sort((a, b) => a.name.localeCompare(b.name)), [roster]);
  const save = () => {
    const s = roster.find((x) => x.id === studentId);
    if (!s) return;
    addMeeting({ studentId, type, day, time, minutes, topic: "" });
    notify(`Meeting with ${s.name.split(" ")[0]} added`);
    moment();
    onClose();
  };
  return (
    <Modal title="Add a meeting" onClose={onClose} footer={<PrimaryButton onClick={save}>Add meeting</PrimaryButton>}>
      <Field label="Student">
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={FIELD} style={FIELD_STYLE}>
          <option value="" disabled>Pick a student</option>
          {sorted.map((s) => <option key={s.id} value={s.id}>{s.name} · Grade {s.grade}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <Field label="Date"><input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Time"><input type="time" value={time} step={900} onChange={(e) => setTime(e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <Field label="Length">
          <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={FIELD} style={FIELD_STYLE}>
            {[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} min</option>)}
          </select>
        </Field>
        <Field label="Reason">
          <select value={type} onChange={(e) => setType(e.target.value as MeetingType)} className={FIELD} style={FIELD_STYLE}>
            {MEETING_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  );
}

const WEEKDAYS = [1, 2, 3, 4, 5];
const WD = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function Availability({ hours, onClose }: { hours: OfficeHours; onClose: () => void }) {
  const [draft, setDraft] = useState<Record<number, { on: boolean; from: string; to: string }>>(() =>
    Object.fromEntries(WEEKDAYS.map((w) => { const h = hours.find((x) => x.weekday === w); return [w, { on: !!h, from: h?.from ?? "09:00", to: h?.to ?? "15:00" }]; })));
  const save = () => {
    setOfficeHours(WEEKDAYS.filter((w) => draft[w].on && draft[w].from < draft[w].to).map((w) => ({ weekday: w, from: draft[w].from, to: draft[w].to })));
    notify("Office hours saved");
    moment();
    onClose();
  };
  return (
    <Modal title="Office hours" onClose={onClose} footer={<PrimaryButton onClick={save}>Save</PrimaryButton>}>
      <ul className="flex flex-col">
        {WEEKDAYS.map((w) => {
          const d = draft[w];
          const set = (p: Partial<typeof d>) => setDraft((x) => ({ ...x, [w]: { ...x[w], ...p } }));
          return (
            <li key={w} className="flex items-center gap-[var(--space-3)] border-b py-[10px] last:border-b-0" style={{ borderColor: RULE }}>
              <label className="flex w-[130px] flex-none cursor-pointer items-center gap-[10px] text-[15px] font-semibold">
                <input type="checkbox" checked={d.on} onChange={(e) => set({ on: e.target.checked })} className="size-[18px] accent-[var(--primary)]" />{WD[w]}
              </label>
              {d.on ? (
                <span className="flex flex-1 items-center gap-[8px]">
                  <input type="time" aria-label={`${WD[w]} from`} value={d.from} step={900} onChange={(e) => set({ from: e.target.value })} className={`${FIELD} h-10`} style={FIELD_STYLE} />
                  <span style={MUTED}>to</span>
                  <input type="time" aria-label={`${WD[w]} to`} value={d.to} step={900} onChange={(e) => set({ to: e.target.value })} className={`${FIELD} h-10`} style={FIELD_STYLE} />
                </span>
              ) : <span className="text-[14px]" style={MUTED}>Off</span>}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
