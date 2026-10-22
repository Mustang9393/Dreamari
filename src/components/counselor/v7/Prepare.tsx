"use client";

// v7 Prepare (20 Oct 2026): the Replit's "Prepare for a student meeting".
// The week's meetings by day, each with what the student has open and
// whether it needs prep, a Prepare button into the meeting brief, requests
// to Confirm / Suggest a time / Decline, and the counselor's availability.
// Agenda or Calendar.
//
// The brief itself (Prepare on a row) is v5's, untouched: Joshua, 20 Oct:
// "when a counselor clicks Prepare next to a student like Omar and opens the
// individual meeting brief, do not update that screen yet."
//
// 22 Oct 2026, Usman's review (Slack: "we're going to bring a few elements
// from Maisha's V4 into the official V7"): Add meeting is "Book a meeting"
// with "Log a walk-in" beside it; a Meetings section with v4's two views,
// Upcoming and Needs Outreach (Outreach.tsx); every meeting carries equal
// weight ("A counselor may need to prioritize a later meeting over the next
// chronological one"), so the focal card is gone and a row expands on tap
// for detail; no Dreamy anywhere on this page ("reduce visual
// stimulation").
//
// Changed from the Replit: one line per meeting (the reason and the first
// open item, not a stack of three lines), the status as a dot and a word,
// the later weeks as one quiet line each, and the week stepper in place of
// a twelve-month dropdown (a counselor plans by the week).

import { useMemo, useState } from "react";
import { CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";
import { TextTabs } from "@/components/app/TextTabs";
import { Listbox } from "@/components/app/Listbox";
import { addMeeting, isPast, MEETING_TYPES, officeHoursLabel, setOfficeHours, timeLabel, useOfficeHours, type Meeting, type MeetingType, type OfficeHours } from "@/lib/counselorMeetings";
import { addNote } from "@/lib/counselorNotes";
import { logTime } from "@/lib/counselorTimeLog";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { isoDay } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { notify } from "../v5/LogSheet";
import { V5Prepare } from "../v5/Prepare";
import { StudentFace } from "../v5/StudentFace";
import { BriefExtras } from "./BriefExtras";
import { STUDENT_ID } from "@/components/profile/BookCounselorSheet";
import { addDays, inWeek, mondayOf, prepFor, useAllMeetings, useAnswers, usePrepped } from "./data";
import { AgendaCard, AgendaView, CalendarView, firstWeekdayOf, monthOf, type CalMode, type Row } from "./Schedule";
import { Outreach, useOutreach } from "./Outreach";
import { moment, briefHref, CARD, CARD_STYLE, DISPLAY, Field, FIELD, FIELD_STYLE, H2, Modal, MUTED, OVERLINE, PageHead, PrimaryButton, QuietButton, RULE, TextLink, Toggle } from "./ui";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const range = (m: Date) => { const f = addDays(m, 4); return `${MON[m.getMonth()]} ${m.getDate()} – ${m.getMonth() === f.getMonth() ? "" : `${MON[f.getMonth()]} `}${f.getDate()}`; };

type View = "upcoming" | "outreach";
/** What the two booking sheets open with (an outreach row's Book / Walk-in). */
export type BookRequest = { mode: "book" | "walkin"; studentId?: string };

export function V7Prepare({ studentId }: { studentId?: string }) {
  // v5's brief (Joshua, 20 Oct: not redesigned), with the Replit's Actions
  // to complete and After the Conversation under it, v7 only (BriefExtras)
  if (studentId) return <><V5Prepare studentId={studentId} /><BriefExtras studentId={studentId} /></>;
  return <Meetings />;
}

function Meetings() {
  const roster = useReviewedRoster();
  const meetings = useAllMeetings(roster);
  const answers = useAnswers();
  const prepped = usePrepped();
  const [now] = useState(() => new Date());
  const [view, setView] = useState<View>("upcoming");
  const [offset, setOffset] = useState(0);
  // One view switch, Agenda | Week | Month (22 Oct 2026, Chandu: "agenda
  // calendar and week month tabs are the same design and clash and there is
  // no hierarchy"): the Replit's Week | Month pill nested inside Calendar
  // became a third option of the one pill instead of a second pill.
  const [mode, setMode] = useState<"agenda" | "week" | "month">("agenda");
  const cal: CalMode = mode === "month" ? "month" : "week";
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState<BookRequest | null>(null);
  const [editingHours, setEditingHours] = useState(false);
  const hours = useOfficeHours();
  const monday = addDays(mondayOf(now), offset * 7);
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const outreach = useOutreach(roster, meetings, now);

  const { rows, later, allRows } = useMemo(() => {
    const toRows = (list: Meeting[], stand?: string): Row[] => list
      .filter((m) => answers[m.id] !== "declined")
      .map((m) => {
        const s = byId.get(m.studentId)!;
        const booked = m.studentId === STUDENT_ID || m.id === stand;
        return { m, s, prep: prepFor(m, s, booked, answers, prepped) };
      });
    const week = meetings.filter((m) => inWeek(m, monday));
    // DEMO-ONLY: the demo week always shows one request to answer. A
    // student's own booking from My Plan (studentId real-student) is a real
    // request; without one, the week's last seeded meeting stands in.
    const stand = week.some((m) => m.studentId === STUDENT_ID) ? undefined : week[week.length - 1]?.id;
    return {
      rows: toRows(week, stand),
      // the three weeks after this one, each with its rows: the Replit's
      // "Week of" cards open inline (22 Oct 2026, "1:1 with the replit")
      later: [1, 2, 3].map((w) => ({ w, rows: toRows(meetings.filter((m) => inWeek(m, addDays(monday, w * 7)))) })),
      // every meeting on the books, for the calendar's month grid
      allRows: toRows(meetings, stand),
    };
  }, [meetings, monday, answers, prepped, byId]);

  const days = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));
  // weeks from this week to the one holding a day (a month cell, a month step)
  const offsetTo = (d: Date) => Math.round((mondayOf(d).getTime() - mondayOf(now).getTime()) / 6048e5);
  // In the month grid the arrows step a month, landing on the week that
  // holds its first weekday (the Replit's rule); everywhere else a week.
  const byMonth = mode === "month";
  // in Month the stepper names and counts the month, not the week
  const month = monthOf(monday);
  const monthRows = useMemo(() => allRows.filter((r) => { const d = new Date(`${r.m.day}T12:00:00`); return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear(); }), [allRows, month]);
  const shownRows = byMonth ? monthRows : rows;
  const shownNeedPrep = shownRows.filter((r) => r.prep === "prep" || r.prep === "action").length;
  // The arrows step a month in every view, to the week holding its first
  // weekday, and the picker names a month (the Replit's rule, ported 22 Oct
  // 2026 on Chandu's "port all four"; the week stepper was v7's own). The
  // next weeks are still one tap away in the Week of rows below.
  const toMonth = (y: number, m: number) => setOffset(offsetTo(firstWeekdayOf(new Date(y, m, 1))));
  const step = (dir: 1 | -1) => toMonth(month.getFullYear(), month.getMonth() + dir);
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return roster.filter((s) => s.name.toLowerCase().includes(needle)).slice(0, 6).map((s) => {
      const mine = allRows.filter((r) => r.s.id === s.id);
      const next = mine.find((r) => !isPast(r.m, now));
      const past = mine.filter((r) => isPast(r.m, now)).slice(-3).reverse();
      return { s, next, past };
    });
  }, [q, roster, allRows, now]);

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Prepare" action={
        <>
          <QuietButton onClick={() => setSheet({ mode: "walkin" })} icon={<UserRound className="h-4 w-4" aria-hidden />}>Log a walk-in</QuietButton>
          <PrimaryButton onClick={() => setSheet({ mode: "book" })} icon={<CalendarPlus className="h-4 w-4" aria-hidden />}>Book a meeting</PrimaryButton>
        </>
      } />

      {/* the Meetings section: v4's two views (Usman, 22 Oct 2026) */}
      <section aria-label="Meetings" className="flex flex-col gap-[var(--space-6)]">
        <div className="flex flex-col gap-[var(--space-3)]">
          <h2 className={H2} style={DISPLAY}>Meetings</h2>
          <TextTabs layoutId="v7-meetings-view" ariaLabel="Meetings view" value={view} onChange={setView} soft caps={false}
            items={[{ key: "upcoming", label: "Upcoming" }, { key: "outreach", label: outreach.toReach.length ? `Needs outreach · ${outreach.toReach.length}` : "Needs outreach" }]} />
        </div>

        {view === "outreach" ? (
          <Outreach {...outreach} now={now} onBook={(r) => setSheet(r)} />
        ) : (
          <>
            <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-[var(--space-3)]">
                <QuietButton label="Previous month" onClick={() => step(-1)} icon={<ChevronLeft className="h-4 w-4" aria-hidden />} />
                <div className="flex min-w-[150px] flex-col">
                  <span className="text-[22px] leading-[26px] font-extrabold tabular-nums" style={DISPLAY}>{byMonth ? `${MONTH_LONG[month.getMonth()]} ${month.getFullYear()}` : range(monday)}</span>
                  <span className="text-[13px]" style={MUTED}>{shownRows.length} {shownRows.length === 1 ? "meeting" : "meetings"}{shownNeedPrep ? ` · ${shownNeedPrep} need prep` : ""}</span>
                </div>
                <QuietButton label="Next month" onClick={() => step(1)} icon={<ChevronRight className="h-4 w-4" aria-hidden />} />
                {offset !== 0 && <button type="button" onClick={() => setOffset(0)} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>{byMonth ? "This month" : "This week"}</button>}
                <Listbox ariaLabel="Month" value={`${month.getFullYear()}-${month.getMonth()}`} onChange={(v) => { const [y, m] = v.split("-").map(Number); toMonth(y, m); }}
                  options={Array.from({ length: 12 }, (_, m) => ({ value: `${month.getFullYear()}-${m}`, label: `${MONTH_LONG[m]} ${month.getFullYear()}` }))}
                  className="h-10 rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" }} />
              </div>
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                {/* phones: the search takes its own line, the three-way pill keeps its room */}
                <label className="relative flex min-w-0 basis-full items-center sm:flex-1 sm:basis-auto md:w-[240px] md:flex-none">
                  <Search className="pointer-events-none absolute left-[12px] h-4 w-4" style={MUTED} aria-hidden />
                  <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a student" aria-label="Find a student in this week's meetings" className="h-10 w-full rounded-[var(--radius-md)] border bg-transparent pr-[10px] pl-[36px] text-[14px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
                </label>
                <Toggle label="View" value={mode} onChange={setMode} options={[{ key: "agenda", label: "Agenda" }, { key: "week", label: "Week" }, { key: "month", label: "Month" }]} />
              </div>
            </div>

            {/* the Replit's Matching students panel: the search finds people,
                the agenda below stays whole */}
            {q.trim() && (
              <section aria-label="Matching students" className={`flex flex-col gap-[var(--space-3)] p-[var(--space-5)] ${CARD}`} style={CARD_STYLE}>
                <span className={OVERLINE} style={MUTED}>Matching students{matches.length ? ` · ${matches.length}` : ""}</span>
                {matches.length ? (
                  <ul className="flex flex-col">
                    {matches.map(({ s, next, past }) => (
                      <li key={s.id} className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] border-t py-[12px] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                        <StudentFace s={s} size={40} />
                        <span className="flex min-w-0 flex-1 basis-[240px] flex-col gap-[2px]">
                          <span className="text-[15px] font-semibold">{s.name} · Grade {s.grade}</span>
                          <span className="text-[13.5px]" style={MUTED}>{next ? `Next: ${DAY_LONG[new Date(`${next.m.day}T12:00:00`).getDay()]}, ${MON[new Date(`${next.m.day}T12:00:00`).getMonth()]} ${new Date(`${next.m.day}T12:00:00`).getDate()} · ${timeLabel(next.m.time)}` : "No meeting booked"}</span>
                          {past.length > 0 && <span className="truncate text-[13px]" style={MUTED}>Meeting history: {past.map((r) => `${MON[new Date(`${r.m.day}T12:00:00`).getMonth()]} ${new Date(`${r.m.day}T12:00:00`).getDate()} · ${r.m.type}`).join(" · ")}</span>}
                        </span>
                        <QuietButton href={briefHref(s.id)}>Prepare</QuietButton>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-[14px]" style={MUTED}>No student matches.</p>}
              </section>
            )}
            {mode === "agenda" ? (
              rows.length ? <AgendaView days={days} rows={rows} /> : (
                <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-6)]">
                  <p className="text-[16px] font-semibold">No meetings booked this week.</p>
                  {<TextLink onClick={() => setSheet({ mode: "book" })}>Book a meeting</TextLink>}
                </div>
              )
            ) : (
              <CalendarView days={days} rows={rows} allRows={allRows} hours={hours} cal={cal} onCal={(c) => setMode(c)}
                onDay={(iso) => { setMode("agenda"); window.setTimeout(() => document.getElementById(`day-${iso}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
                onWeek={(iso) => { const [y, m, d] = iso.split("-").map(Number); setOffset(offsetTo(new Date(y, m - 1, d))); }} />
            )}

            <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
              {/* each later week opens in place with its rows (the Replit's
                  "Week of" accordions); keyed by its Monday so stepping
                  closes them; "Open week" moves the page there */}
              {later.map(({ w, rows: wk }) => {
                const wkMonday = addDays(monday, w * 7);
                const n = wk.length;
                return (
                  <details key={isoDay(wkMonday)} className="group/wk">
                    <summary className="dm-quiet -mx-[8px] flex cursor-pointer list-none items-center justify-between rounded-[var(--radius-md)] px-[8px] py-[8px] text-left [&::-webkit-details-marker]:hidden">
                      <span className="text-[15px] font-semibold">Week of {range(wkMonday).split(" – ")[0]}</span>
                      <span className="flex items-center gap-[6px] text-[14px]" style={MUTED}>{n ? `${n} ${n === 1 ? "meeting" : "meetings"}` : "Open"}<ChevronDown className="h-4 w-4 transition-transform group-open/wk:rotate-180" aria-hidden /></span>
                    </summary>
                    <div className="flex flex-col items-start gap-[var(--space-3)] pt-[var(--space-2)] pb-[var(--space-4)]">
                      {n ? (
                        <ul className="flex w-full flex-col gap-[var(--space-3)]">
                          {wk.map((r) => <li key={r.m.id}><AgendaCard r={r} past={false} /></li>)}
                        </ul>
                      ) : <p className="text-[14px]" style={MUTED}>Nothing booked yet.</p>}
                      <TextLink onClick={() => setOffset((o) => o + w)}>Open week</TextLink>
                    </div>
                  </details>
                );
              })}
              <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] pt-[var(--space-3)]">
                <span className="text-[14px]" style={MUTED}>Office hours: {officeHoursLabel(hours)}</span>
                <TextLink onClick={() => setEditingHours(true)}>Edit availability</TextLink>
              </div>
            </div>
          </>
        )}
      </section>

      {sheet?.mode === "book" && <BookMeeting roster={roster} studentId={sheet.studentId} onClose={() => setSheet(null)} />}
      {sheet?.mode === "walkin" && <LogWalkIn roster={roster} studentId={sheet.studentId} onClose={() => setSheet(null)} />}
      {editingHours && <Availability hours={hours} onClose={() => setEditingHours(false)} />}
    </div>
  );
}

// ---- sheets --------------------------------------------------------------------

const TYPE_LABEL: Record<MeetingType, string> = { "Check-in": "Check-in", Applications: "Applications", "Financial aid": "FAFSA and aid", "Course planning": "Course planning", Resume: "Resume", "Career exploration": "Career planning" };
type MeetingFormat = NonNullable<Meeting["format"]>;
const MEETING_FORMATS: MeetingFormat[] = ["In person", "Virtual"];

function StudentPick({ roster, value, onChange }: { roster: CounselorStudent[]; value: string; onChange: (id: string) => void }) {
  const sorted = useMemo(() => [...roster].sort((a, b) => a.name.localeCompare(b.name)), [roster]);
  return (
    <Field label="Student">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={FIELD} style={FIELD_STYLE}>
        <option value="" disabled>Pick a student</option>
        {sorted.map((s) => <option key={s.id} value={s.id}>{s.name} · Grade {s.grade}</option>)}
      </select>
    </Field>
  );
}

function ReasonPick({ value, onChange }: { value: MeetingType; onChange: (t: MeetingType) => void }) {
  return (
    <Field label="Reason">
      <select value={value} onChange={(e) => onChange(e.target.value as MeetingType)} className={FIELD} style={FIELD_STYLE}>
        {MEETING_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
      </select>
    </Field>
  );
}

/** Book a meeting (v4's name, Usman 22 Oct 2026; was "Add a meeting"). */
function BookMeeting({ roster, studentId: initial = "", onClose }: { roster: CounselorStudent[]; studentId?: string; onClose: () => void }) {
  const [studentId, setStudentId] = useState(initial);
  const [day, setDay] = useState(() => isoDay(new Date()));
  const [time, setTime] = useState("10:00");
  const [minutes, setMinutes] = useState(30);
  const [type, setType] = useState<MeetingType>("Check-in");
  // the Replit's Meeting Type and Location (22 Oct 2026, "1:1 with the replit")
  const [format, setFormat] = useState<MeetingFormat>("In person");
  const [place, setPlace] = useState("");
  const save = () => {
    const s = roster.find((x) => x.id === studentId);
    if (!s) return;
    addMeeting({ studentId, type, day, time, minutes, topic: "", format, place: place.trim() || undefined });
    notify(`Meeting with ${s.name.split(" ")[0]} booked`);
    moment();
    onClose();
  };
  return (
    <Modal title="Book a meeting" onClose={onClose} footer={<PrimaryButton onClick={save}>Book</PrimaryButton>}>
      <StudentPick roster={roster} value={studentId} onChange={setStudentId} />
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
        <ReasonPick value={type} onChange={setType} />
      </div>
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <Field label="Meeting type">
          <select value={format} onChange={(e) => setFormat(e.target.value as MeetingFormat)} className={FIELD} style={FIELD_STYLE}>
            {MEETING_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Location"><input type="text" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Counselor office or video call" className={`${FIELD} placeholder:text-[color:var(--muted-foreground)]`} style={FIELD_STYLE} /></Field>
      </div>
    </Modal>
  );
}

/** Log a walk-in (v4's second action, Usman 22 Oct 2026). One save does
 *  what v5's LogSheet does: the meeting is recorded as done, the note lands
 *  on the student's profile, and the minutes go to the use-of-time log. */
function LogWalkIn({ roster, studentId: initial = "", onClose }: { roster: CounselorStudent[]; studentId?: string; onClose: () => void }) {
  const [studentId, setStudentId] = useState(initial);
  const [minutes, setMinutes] = useState(15);
  const [type, setType] = useState<MeetingType>("Check-in");
  const [notes, setNotes] = useState("");
  const save = () => {
    const s = roster.find((x) => x.id === studentId);
    if (!s) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    addMeeting({ studentId, type, day: isoDay(now), time, minutes, topic: "Walk-in" }, notes.trim());
    if (notes.trim()) addNote(studentId, `${type} (walk-in, ${minutes} min): ${notes.trim()}`);
    logTime({ activity: `Walk-in: ${type.toLowerCase()}`, minutes, kind: "direct", studentId, auto: true });
    notify(`Logged ${minutes} min with ${s.name.split(" ")[0]}`);
    moment();
    onClose();
  };
  return (
    <Modal title="Log a walk-in" onClose={onClose} footer={<PrimaryButton onClick={save}>Log it</PrimaryButton>}>
      <StudentPick roster={roster} value={studentId} onChange={setStudentId} />
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <ReasonPick value={type} onChange={setType} />
        <Field label="How long">
          <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={FIELD} style={FIELD_STYLE}>
            {[5, 15, 30, 45].map((n) => <option key={n} value={n}>{n} min</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What you talked about, and the next step" className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[12px] py-[10px] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2" style={FIELD_STYLE} />
      </Field>
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
