"use client";

// DEMO-ONLY v2: the casefile cards mocked from the SchooLinks staff
// dashboard (25 Sept 2026, direct instruction: build the ones skipped as
// "would read as a copy", then see how to make them ours). Cards on the
// Student Profile: Plan sign-off (three parties), To-dos (counselor-
// assigned, due dates, overdue), the weekly check-in, meetings, family, and
// what was sent to the student. Data: src/lib/counselorCasefile.ts and the
// stores each card names.
//
// 8 Oct 2026 audit pass: the check-in card read "no check-in asked yet"
// from activity proxies while Today already raised a real check-in alert;
// it now shows the student's real weekly check-in and opens the shared
// check-in sheet. Meetings, family and sends were recorded elsewhere and
// never shown on the profile; each has a card here now.

import { DatePicker } from "@/components/app/DatePicker";
import { IconTip } from "@/components/app/IconTip";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, Briefcase, CalendarClock, CalendarPlus, Check, ChevronRight, ClipboardList, HeartPulse, Landmark, Mail, MessageSquare, Phone, Send, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { addTodo, daysUntil, planSignoff, readSignoff, removeTodo, sendsFor, toggleTodo, useSends, useTodos, writeSignoff, type PartyState } from "@/lib/counselorCasefile";
import { useHandledAlerts } from "@/lib/counselorOutbox";
import { useMessages } from "@/lib/counselorMessages";
import { isPast, seededMeetings, timeLabel, useAddedMeetings, useMeetingsDone, type Meeting } from "@/lib/counselorMeetings";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { sharesFor, useShares } from "@/lib/counselorShares";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { COLLEGES } from "@/components/colleges/data";
import { CHECK_DIMS, LEVEL_INK, LEVEL_WORD, alertIn, alertKey, checkInFor, guardiansFor, whenText } from "../v5/family";
import { openCheckIn } from "../v5/CheckInSheet";
import { openLog } from "../v5/LogSheet";
import { openCareer, openSchool } from "../v5/ExploreSheets";
import { Go, STATUS_COLORS } from "./chips";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";
import { PRIMARY } from "./palette";

function Head({ icon: Icon, title, aside }: { icon: React.ComponentType<{ className?: string }>; title: string; aside?: React.ReactNode }) {
  return (
    <span className="flex flex-wrap items-center justify-between gap-[8px]">
      <span className="flex items-center gap-[10px]">
        <span className="flex size-[30px] items-center justify-center rounded-[8px]" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--primary)" }}><Icon className="h-[15px] w-[15px]" /></span>
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
      </span>
      {aside}
    </span>
  );
}

const CARD = "v4-casefile-surface v4-surface flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]";
const QUIET_BUTTON = "dm-quiet flex h-8 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[10px] text-[12px] font-bold";
const SOLID_BUTTON = "dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-8 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[12px] text-[12.5px] font-bold";
const day = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function partyColor(p: PartyState): string {
  return p.state === "done" ? STATUS_COLORS["On Track"] : p.state === "pending" ? STATUS_COLORS["Needs Attention"] : "var(--muted-foreground)";
}

/** Three parties on the year's plan. The student's submission is read from
 *  the Academic Plan milestone; the counselor signs here; the guardian is
 *  invited here, by name (8 Oct 2026 audit: "Invite" never said who). */
export function PlanSignoffCard({ student }: { student: CounselorStudent }) {
  const [record, setRecord] = useState(() => readSignoff(student.id));
  const so = planSignoff(student, record);
  const first = student.name.split(" ")[0];
  const guardian = guardiansFor(student)[0];
  const gFirst = guardian?.name.split(" ")[0] ?? "guardian";
  const guardianStatus = so.guardian.state === "done" ? "Signed"
    : so.guardian.state === "pending" ? `${record.guardianRemindedAt ? "Reminded" : "Invited"} ${guardian?.name ?? "guardian"}, ${day(record.guardianRemindedAt ?? record.guardianInvitedAt ?? new Date().toISOString())}`
    : "Not yet";
  const rows: { key: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; party: PartyState; status: string; action?: React.ReactNode }[] = [
    { key: "student", icon: UserRound, label: first, party: so.student, status: so.student.state === "done" ? "Signed" : "Not yet" },
    {
      key: "counselor", icon: ShieldCheck, label: "Me", party: so.counselor, status: so.counselor.state === "done" ? "Signed" : so.counselor.state === "pending" ? "Waiting" : "Not yet",
      action: so.counselor.state === "pending"
        ? <button type="button" onClick={() => setRecord(writeSignoff(student.id, { counselorAt: new Date().toISOString() }))} className={SOLID_BUTTON}>Sign</button>
        : record.counselorAt ? <button type="button" onClick={() => setRecord(writeSignoff(student.id, { counselorAt: undefined }))} className={QUIET_BUTTON} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Undo</button> : undefined,
    },
    {
      key: "guardian", icon: Users, label: guardian ? `Guardian · ${guardian.relation}` : "Guardian", party: so.guardian, status: guardianStatus,
      action: so.guardian.state === "done" ? undefined
        : <button type="button" onClick={() => setRecord(writeSignoff(student.id, so.guardian.state === "pending" ? { guardianRemindedAt: new Date().toISOString() } : { guardianInvitedAt: new Date().toISOString() }))} className={QUIET_BUTTON} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{so.guardian.state === "pending" ? `Remind ${gFirst}` : `Invite ${gFirst}`}</button>,
    },
  ];
  const signed = rows.filter((r) => r.party.state === "done").length;
  return (
    <div className={CARD} style={GLASS_CARD}>
      <Head icon={ShieldCheck} title="Plan Sign-Off" aside={<span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{signed} of 3 signed · Grade {student.grade} plan</span>} />
      <ul className="flex flex-col gap-[6px]">
        {rows.map((r) => (
          <li key={r.key} className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
            <r.icon className="h-[15px] w-[15px] flex-none" style={{ color: "var(--muted-foreground)" }} />
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.label}</span>
            <span className="flex items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: partyColor(r.party) }}>
              {r.party.state === "done" && <Check className="h-[13px] w-[13px]" aria-hidden />}
              {r.status}
            </span>
            {r.action}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tasks the counselor assigns this student, each with a due date. Overdue
 *  reads in the At Risk red; done rows fade. Live: a to-do sent to many
 *  from Connect lands here without a reload. */
export function TodosCard({ student }: { student: CounselorStudent }) {
  const todos = useTodos(student.id);
  const [text, setText] = useState("");
  const [due, setDue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); });
  const open = todos.filter((t) => !t.done);
  const overdue = open.filter((t) => daysUntil(t.due) < 0).length;
  const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return (
    <div className={CARD} style={GLASS_CARD}>
      <Head icon={ClipboardList} title="Assigned Tasks" aside={<span className="text-[12.5px] font-semibold" style={{ color: overdue ? STATUS_COLORS["At Risk"] : "var(--muted-foreground)" }}>{open.length === 0 ? "Nothing open" : overdue ? `${overdue} overdue · ${open.length} open` : `${open.length} open`}</span>} />
      <form
        className="v4-task-form flex flex-wrap items-center gap-[8px]"
        onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; addTodo(student.id, text.trim(), due); setText(""); }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Ask ${student.name.split(" ")[0]} to…`} aria-label="To-do" className="h-9 min-w-[200px] flex-1 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle} />
        <DatePicker value={due} onChange={setDue} ariaLabel="Due date" />
        <button type="submit" disabled={!text.trim()} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">Assign</button>
      </form>
      {todos.length === 0 ? (
        // Truthful about where a task shows (8 Oct 2026 audit: it said
        // "show up in My Plan", which the student app does not read yet).
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No tasks yet. Tasks you assign here or from Connect show on {student.name.split(" ")[0]}&apos;s profile.</p>
      ) : (
        <ul className="flex flex-col gap-[6px]">
          {todos.map((t) => {
            const days = daysUntil(t.due);
            const dueLabel = t.done ? "Done" : days < 0 ? `Overdue by ${-days} day${days === -1 ? "" : "s"}` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days} days`;
            const color = t.done ? "var(--muted-foreground)" : days < 0 ? STATUS_COLORS["At Risk"] : days <= 2 ? STATUS_COLORS["Needs Attention"] : "var(--muted-foreground)";
            return (
              <li key={t.id} className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={{ ...GLASS_INSET, opacity: t.done ? 0.6 : 1 }}>
                <button type="button" onClick={() => toggleTodo(student.id, t.id)} aria-label={`${t.done ? "Reopen" : "Complete"}: ${t.text}`} className="flex size-[20px] flex-none cursor-pointer items-center justify-center rounded-[6px] border" style={{ borderColor: t.done ? PRIMARY : "var(--glass-border)", background: t.done ? PRIMARY : "transparent", color: "#fff" }}>{t.done && <Check className="h-[12px] w-[12px]" aria-hidden />}</button>
                <span className={`min-w-0 flex-1 text-[13.5px] font-semibold ${t.done ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>{t.text}</span>
                <span className="flex flex-none items-center gap-[6px] text-[12px] font-semibold" style={{ color }}><CalendarClock className="h-[13px] w-[13px]" aria-hidden />{dueLabel}</span>
                <IconTip label="Remove task"><button type="button" onClick={() => removeTodo(student.id, t.id)} aria-label="Remove" className="dm-quiet flex size-[26px] flex-none cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "var(--muted-foreground)" }}><Trash2 className="h-[13px] w-[13px]" aria-hidden /></button></IconTip>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** One red-rule line at the top of the profile when this week's check-in
 *  tripped an alert word and nobody has handled it (the same alert Today
 *  raises). Opens the shared check-in sheet. */
export function CheckInAlertLine({ student }: { student: CounselorStudent }) {
  const handled = useHandledAlerts();
  const c = checkInFor(student);
  if (!alertIn(c.note) || handled[alertKey(student.id)]) return null;
  return (
    <button type="button" onClick={() => openCheckIn(student.id)} className="dm-quiet group flex w-full cursor-pointer items-center gap-[10px] rounded-r-[var(--radius-md)] border-l-[3px] py-[10px] pr-[12px] pl-[14px] text-left text-[13.5px]" style={{ borderColor: STATUS_COLORS["At Risk"], background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
      <AlertTriangle className="h-[16px] w-[16px] flex-none" aria-hidden style={{ color: STATUS_COLORS["At Risk"] }} />
      <span className="min-w-0 flex-1"><span className="font-bold" style={{ color: STATUS_COLORS["At Risk"] }}>Check-in needs a response today:</span> <span className="italic">&ldquo;{c.note}&rdquo;</span></span>
      <ChevronRight className="h-4 w-4 flex-none transition-transform group-hover:translate-x-[2px]" aria-hidden />
    </button>
  );
}

/** This week's well-being check-in, sent from the student's Home: four
 *  areas, the note, when, and the sheet with the school's next steps. */
export function CheckInCard({ student }: { student: CounselorStudent }) {
  const handled = useHandledAlerts();
  const c = checkInFor(student);
  const word = alertIn(c.note);
  const done = handled[alertKey(student.id)];
  return (
    <div className={CARD} style={GLASS_CARD}>
      <Head icon={HeartPulse} title="This Week's Check-In" aside={<span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.answered ? `Sent ${whenText(c.daysAgo)}` : "Not answered yet"}</span>} />
      {c.answered ? (
        <>
          <ul className="grid grid-cols-2 gap-[8px]">
            {CHECK_DIMS.map((d) => (
              <li key={d} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{d}</span>
                <span className="flex items-center gap-[6px] text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}><span aria-hidden className="size-[8px] rounded-full" style={{ background: LEVEL_INK[c.levels[d]] }} />{LEVEL_WORD[c.levels[d]]}</span>
              </li>
            ))}
          </ul>
          {c.note && <p className="text-[13.5px] leading-[20px] italic" style={{ color: "var(--foreground)" }}>&ldquo;{c.note}&rdquo;</p>}
          {word && <p className="text-[12.5px] font-semibold" style={{ color: done ? "var(--muted-foreground)" : STATUS_COLORS["At Risk"] }}>{done ? `Handled ${day(done)}` : "Needs a response today"}</p>}
        </>
      ) : (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{student.name.split(" ")[0]} has not sent this week&apos;s check-in yet.</p>
      )}
      <button type="button" onClick={() => openCheckIn(student.id)} className={`${word && !done ? SOLID_BUTTON : QUIET_BUTTON} mt-auto w-fit`} style={word && !done ? undefined : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Open check-in</button>
    </div>
  );
}

const DAY_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const meetingDay = (m: Meeting) => { const d = new Date(`${m.day}T12:00:00`); return `${DAY_NAME[d.getDay()]} ${day(m.day)}`; };

/** This student's meetings: what is booked next, and the recent ones with
 *  their notes (walk-ins included). Book and Log open the shared log sheet,
 *  which writes the same store. */
export function MeetingsCard({ student }: { student: CounselorStudent }) {
  const roster = useReviewedRoster();
  const added = useAddedMeetings();
  const done = useMeetingsDone();
  const mine = useMemo(() => [...seededMeetings(roster), ...added].filter((m) => m.studentId === student.id).sort((a, b) => `${a.day}${a.time}`.localeCompare(`${b.day}${b.time}`)), [roster, added, student.id]);
  const now = new Date();
  const upcoming = mine.filter((m) => !isPast(m, now) && !done[m.id]);
  const recent = mine.filter((m) => isPast(m, now) || done[m.id]).reverse().slice(0, 3);
  // a walk-in is saved done at the moment it is added (its id carries that time)
  const walkIn = (m: Meeting) => m.id.startsWith("a-") && !!done[m.id] && Math.abs(new Date(done[m.id].at).getTime() - parseInt(m.id.slice(2), 36)) < 10000;
  const row = (m: Meeting, past?: boolean) => (
    <li key={m.id} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
      <span className="flex items-baseline justify-between gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
        <span className="truncate">{walkIn(m) ? "Walk-in" : m.type}</span>
        <span className="flex-none text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{meetingDay(m)}{walkIn(m) ? "" : ` · ${timeLabel(m.time)}`}</span>
      </span>
      <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{past ? (done[m.id]?.notes ? done[m.id].notes : "No notes yet") : m.topic}</span>
    </li>
  );
  return (
    <div className={CARD} style={GLASS_CARD}>
      <Head icon={CalendarClock} title="Meetings" aside={<span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{upcoming.length ? `${upcoming.length} upcoming` : "None booked"}</span>} />
      {upcoming.length > 0 && <ul className="flex flex-col gap-[6px]">{upcoming.slice(0, 3).map((m) => row(m))}</ul>}
      {recent.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Recent</span>
          <ul className="flex flex-col gap-[6px]">{recent.map((m) => row(m, true))}</ul>
        </div>
      )}
      {mine.length === 0 && <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No meetings yet.</p>}
      <span className="mt-auto flex flex-wrap gap-[8px]">
        <button type="button" onClick={() => openLog({ mode: "book", studentId: student.id })} className={SOLID_BUTTON}><CalendarPlus className="h-[14px] w-[14px]" aria-hidden />Book</button>
        <button type="button" onClick={() => openLog({ mode: "walkin", studentId: student.id })} className={`${QUIET_BUTTON} min-h-[44px]`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Log a walk-in</button>
      </span>
    </div>
  );
}

/** Who to call at home: each guardian's relation, number, email and home
 *  language. Logging a contact goes into notes and the time log. */
export function FamilyCard({ student }: { student: CounselorStudent }) {
  const guardians = guardiansFor(student);
  return (
    <div className={CARD} style={GLASS_CARD}>
      <Head icon={Users} title="Family" />
      {guardians.length === 0 ? <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No guardian on file.</p> : (
        <ul className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
          {guardians.map((g) => (
            <li key={g.name} className="flex flex-col gap-[4px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
              <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{g.name} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {g.relation}</span></span>
              <a href={`tel:${g.phone.replace(/[^\d+]/g, "")}`} className="dm-link flex w-fit items-center gap-[6px] text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--primary)" }}><Phone className="h-[13px] w-[13px]" aria-hidden />{g.phone}</a>
              <a href={`mailto:${g.email}`} className="dm-link flex w-fit min-w-0 items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: "var(--primary)" }}><Mail className="h-[13px] w-[13px] flex-none" aria-hidden /><span className="truncate">{g.email}</span></a>
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Speaks {g.language}</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => openLog({ mode: "family", studentId: student.id })} className={`${QUIET_BUTTON} mt-auto w-fit`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Log a contact</button>
    </div>
  );
}

const SEND_KIND: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = { message: { label: "Message", icon: MessageSquare }, reminder: { label: "Reminder", icon: Bell }, todo: { label: "To-do", icon: ClipboardList } };

/** What went to this student from the dashboard: messages, reminders and
 *  to-dos (alone or in a group send), and careers or schools shared from
 *  Explore. Newest first. */
export function MessagesCard({ student }: { student: CounselorStudent }) {
  const router = useRouter();
  const sends = useSends();
  const shares = useShares();
  const thread = useMessages().threads.find((t) => t.studentId === student.id);
  const rows = useMemo(() => [
    ...(thread?.messages ?? []).map((m, i) => ({ id: `thread-${i}`, at: m.at, ...SEND_KIND.message, text: m.text, group: "", open: undefined as (() => void) | undefined })),
    ...sendsFor(student.id, sends).map((s) => ({ id: s.id, at: s.at, ...(SEND_KIND[s.kind] ?? SEND_KIND.message), text: s.text, group: s.studentIds.length > 1 ? `with ${s.studentIds.length - 1} other${s.studentIds.length === 2 ? "" : "s"}` : "", open: undefined as (() => void) | undefined })),
    ...sharesFor(student.id, shares).map((sh) => {
      const career = sh.kind === "career" ? ALL_CATALOG_CAREERS.find((c) => c.title === sh.title) : undefined;
      const school = sh.kind === "school" ? COLLEGES.find((c) => c.slug === sh.ref) : undefined;
      return { id: sh.id, at: sh.at, label: sh.kind === "career" ? "Career shared" : sh.kind === "school" ? "School shared" : "Shared", icon: sh.kind === "school" ? Landmark : Briefcase, text: sh.title, group: "", open: career ? () => openCareer(career) : school ? () => openSchool(school) : undefined };
    }),
  ].sort((a, b) => b.at.localeCompare(a.at)), [sends, shares, thread, student.id]);
  return (
    <div className={CARD} style={GLASS_CARD}>
      <Head icon={Send} title="Messages and Shares" aside={<span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{rows.length ? `${rows.length} sent` : "Nothing sent yet"}</span>} />
      {rows.length > 0 && (
        <ul className="flex flex-col gap-[6px]">
          {rows.slice(0, 8).map((r) => {
            const body = (
              <>
                <span className="flex size-[28px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}><r.icon className="h-[13px] w-[13px]" /></span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="flex items-baseline justify-between gap-[8px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>
                    <span className="truncate">{r.label}{r.group && <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}> · {r.group}</span>}</span>
                    <span className="flex-none text-[11.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{day(r.at)}</span>
                  </span>
                  <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{r.text}</span>
                </span>
              </>
            );
            return (
              <li key={r.id}>
                {r.open ? (
                  <button type="button" onClick={r.open} className="dm-quiet group flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border px-[10px] py-[8px] text-left" style={GLASS_INSET}>{body}<Go className="flex-none opacity-0 transition-opacity group-hover:opacity-100" /></button>
                ) : (
                  <div className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[10px] py-[8px]" style={GLASS_INSET}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <span className="mt-auto flex flex-wrap gap-[8px]">
        <button type="button" onClick={() => router.push(`/counselor?view=connect&compose=1&ids=${student.id}&v=4`)} className={QUIET_BUTTON} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><MessageSquare className="h-[13px] w-[13px]" aria-hidden />Message</button>
        {rows.length > 8 && <button type="button" onClick={() => router.push("/counselor?view=connect&tab=sent&v=4")} className={QUIET_BUTTON} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>All sent</button>}
      </span>
    </div>
  );
}
