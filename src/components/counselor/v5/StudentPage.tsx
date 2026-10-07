"use client";

// v5 student page, restructured 7 Oct 2026 (Chandu: "the student detail
// pages from the drill-downs NEED BETTER information hierarchy, layouts,
// structure, overall everything"). The first version was one long column
// where everything had the same weight and "Needs your attention" repeated
// rows of the milestone list below it. Now, top to bottom, in the order a
// counselor reads a student:
// 1. Who: face, name, grade, plan, status with its reason, and the three
//    actions (Prepare, Message, Book).
// 2. Vitals: one strip of the five numbers that describe them (milestones
//    as a ring, GPA, attendance, credits, last active), each said once.
// 3. Tabs for depth, so the page never stacks everything at once:
//    Overview (what is waiting on you, flags, next meeting, last note,
//    their Top 3), Milestones (a timeline with the action on each step),
//    Academics (graduation requirements, courses, attendance, tests),
//    Path (Top 3 and every saved career), Notes (your notes and meetings).

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarPlus, Check, ChevronRight, MessageCircle, TrendingDown, TrendingUp } from "lucide-react";
import { PosterCard } from "@/components/app/PosterCard";
import { NotFoundView } from "@/components/app/states";
import { TextTabs } from "@/components/app/TextTabs";
import { careerSlug } from "@/components/career/slug";
import { cv } from "@/lib/counselorBase";
import { isPast, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { addNote, readNotes, type CounselorNote } from "@/lib/counselorNotes";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { lastActiveLabel, milestonesForGrade, type MilestoneStatus } from "@/lib/counselorRoster";
import { sisFor } from "@/lib/counselorSis";
import { careerById, toV5 } from "@/lib/counselorV5";
import { MILESTONE_ICON } from "./milestoneIcons";
import { useMeetings } from "./Prepare";
import { openLog } from "./LogSheet";
import { StudentFace } from "./StudentFace";
import { StudentSearch } from "./StudentSearch";
import { MilestoneRing, RING } from "./StudentsViews";
import { waitingFor } from "./waiting";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const STATUS_CLASS = { "On Track": "v5-ok", "Needs Attention": "v5-warn", "At Risk": "v5-risk" } as const;
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** How a milestone status reads, its ink, and its dot on the timeline. */
const MILESTONE_WORD: Record<MilestoneStatus, { word: string; cls?: string; accent?: boolean; dot: string }> = {
  Approved: { word: "Done", cls: "v5-ok", dot: "var(--color-feedback-success-solid)" },
  Completed: { word: "Done", cls: "v5-ok", dot: "var(--color-feedback-success-solid)" },
  "Pending Review": { word: "Waiting for you", accent: true, dot: "var(--primary)" },
  "Changes Requested": { word: "Changes requested", cls: "v5-warn", dot: "var(--color-feedback-warning-solid)" },
  "In Progress": { word: "In progress", dot: "color-mix(in srgb, var(--primary) 45%, var(--background))" },
  "Not Started": { word: "Not started", dot: "color-mix(in srgb, var(--foreground) 18%, transparent)" },
  Overdue: { word: "Overdue", cls: "v5-risk", dot: "var(--color-feedback-danger-solid)" },
  "Not Applicable": { word: "Not needed", dot: "color-mix(in srgb, var(--foreground) 10%, transparent)" },
};

type Tab = "overview" | "milestones" | "academics" | "path" | "notes";

function Title({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-[var(--space-4)]">
      <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
      {aside && <span className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{aside}</span>}
    </div>
  );
}

export function StudentPage({ studentId }: { studentId: string }) {
  const router = useRouter();
  const roster = useReviewedRoster();
  const row = roster.find((r) => r.id === studentId);
  const s = useMemo(() => (row ? toV5(row) : null), [row]);
  const meetings = useMeetings(roster);
  const done = useMeetingsDone();
  const [tab, setTab] = useState<Tab>("overview");
  // notes written from the log sheet land in the store; remount to reread
  const notesKey = Object.keys(done).length;
  if (!s || !row) return <div className="py-[var(--space-12)]"><NotFoundView what="student" home="Back to Students" homeHref={cv("students")} /></div>;

  const sis = sisFor(row);
  const keys = milestonesForGrade(s.grade);
  const count = (set: MilestoneStatus[]) => keys.filter((k) => set.includes(row.milestones[k])).length;
  const doneN = count(["Approved", "Completed"]);
  const now = new Date();
  const mine = meetings.filter((m) => m.studentId === row.id);
  const next = mine.find((m) => !isPast(m, now) && !done[m.id]);
  const plan = row.postsecondaryIntent === "Undecided" ? "Still exploring" : row.postsecondaryIntent;
  const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => router.push(cv("students"))} className="dm-link inline-flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Students
        </button>
        <StudentSearch compact students={roster} hrefFor={studentHref} placeholder="Switch student" />
      </div>

      {/* 1. Who, and what to do */}
      <header className="flex flex-col gap-[var(--space-6)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-[var(--space-5)]">
          <StudentFace s={row} size={96} />
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h1 className="text-[32px] leading-[1.05] font-semibold text-balance sm:text-[42px]" style={{ fontFamily: "var(--font-display)" }}>{s.name}</h1>
            <p className="text-[15px] leading-[20px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {plan} · {s.user.identifier}</p>
            <p className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px] text-[15px] leading-[20px]">
              <span className={`inline-flex items-center gap-[6px] font-semibold ${STATUS_CLASS[s.status]}`}><span aria-hidden className="size-[8px] rounded-full bg-current" />{s.status}</span>
              {s.attention && <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>{s.attention.reason}</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[var(--space-2)] lg:items-end">
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Link href={`${cv("prepare")}&studentId=${encodeURIComponent(row.id)}`} className="dm-solid inline-flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Prepare a meeting
            </Link>
            <Link href={cv("workspace", "&tab=messages")} className="dm-quiet inline-flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
              <MessageCircle className="h-4 w-4" aria-hidden /> Message
            </Link>
            {!next && (
              <button type="button" onClick={() => openLog({ mode: "book", studentId: row.id })} className="dm-quiet inline-flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
                <CalendarPlus className="h-4 w-4" aria-hidden /> Book
              </button>
            )}
          </div>
          {next && (
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>
              Next meeting {DAY[new Date(`${next.day}T12:00:00`).getDay()]} {timeLabel(next.time)} · {next.type}
            </span>
          )}
        </div>
      </header>

      {/* 2. Vitals, each number once */}
      <dl className="grid grid-cols-2 gap-y-[var(--space-5)] border-y py-[var(--space-5)] sm:grid-cols-3 lg:grid-cols-5" style={{ borderColor: RULE }}>
        <div className="col-span-2 flex items-center gap-[var(--space-4)] sm:col-span-1">
          <MilestoneRing size={64} stroke={7} total={keys.length} parts={[
            { n: doneN, color: RING.done },
            { n: count(["Pending Review"]), color: RING.waiting },
            { n: count(["In Progress", "Changes Requested"]), color: RING.moving },
            { n: keys.length - doneN - count(["Pending Review", "In Progress", "Changes Requested"]), color: RING.none },
          ]}>
            <span className="text-[14px] font-semibold tabular-nums">{Math.round((doneN / keys.length) * 100)}%</span>
          </MilestoneRing>
          <Vital value={`${doneN} of ${keys.length}`} label="Milestones done" />
        </div>
        <Vital value={sis.gpa.toFixed(2)} label={`GPA · ${sis.weightedGpa.toFixed(2)} weighted`} />
        <Vital value={`${Math.round(sis.attendance.rate)}%`} label={`Attendance · ${sis.attendance.absences} ${sis.attendance.absences === 1 ? "absence" : "absences"}`} cls={sis.attendance.rate < 90 ? "v5-risk" : undefined} />
        <Vital value={`${sis.credits.earned}/${sis.credits.required}`} label={sis.credits.earned >= sis.credits.expected ? "Credits · on pace" : "Credits · behind pace"} cls={sis.credits.earned < sis.credits.expected ? "v5-warn" : undefined} />
        <Vital value={lastActiveLabel(s.dreamari.lastActive)} label="Last in Dreamari" />
      </dl>

      {/* 3. Depth, one tab at a time */}
      <TextTabs items={[{ key: "overview", label: "Overview" }, { key: "milestones", label: "Milestones" }, { key: "academics", label: "Academics" }, { key: "path", label: "Path" }, { key: "notes", label: "Notes" }]} value={tab} onChange={setTab} ariaLabel="Student" layoutId="v5-student-tabs" />
      {tab === "overview" && <Overview row={row} roster={roster} top3={s.dreamari.top3} onTab={setTab} />}
      {tab === "milestones" && <Milestones row={row} keys={keys} />}
      {tab === "academics" && <Academics sis={sis} />}
      {tab === "path" && <Path top3={s.dreamari.top3} saved={s.dreamari.saved} simulations={s.dreamari.simulations} />}
      {tab === "notes" && <Notes key={notesKey} studentId={row.id} meetings={mine.filter((m) => done[m.id]).map((m) => ({ m, notes: done[m.id].notes }))} />}
    </div>
  );
}

function Vital({ value, label, cls }: { value: string; label: string; cls?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[2px]">
      <dd className={`m-0 truncate text-[24px] leading-[30px] font-semibold tabular-nums ${cls ?? ""}`} style={{ fontFamily: "var(--font-display)" }}>{value}</dd>
      <dt className="truncate text-[13px] leading-[17px] font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</dt>
    </div>
  );
}

function Overview({ row, roster, top3, onTab }: { row: ReturnType<typeof useReviewedRoster>[number]; roster: ReturnType<typeof useReviewedRoster>; top3: string[]; onTab: (t: Tab) => void }) {
  const router = useRouter();
  const waiting = waitingFor(row, roster);
  const flags = [...sisFor(row).flags].sort((a, b) => b.severity - a.severity);
  const careers = top3.map(careerById).filter((c) => !!c);
  const notes = readNotes(row.id);
  return (
    <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-12)]">
      <div className="flex min-w-0 flex-col gap-[48px]">
        <section aria-label="Waiting on you" className="flex flex-col gap-[var(--space-3)]">
          <Title aside={waiting.length ? String(waiting.length) : undefined}>Waiting on You</Title>
          {waiting.length ? (
            <ul className="flex flex-col">
              {waiting.map((w) => (
                <li key={w.key} className="border-b" style={{ borderColor: RULE }}>
                  <Link href={w.href} className="dm-quiet group -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[12px]">
                    <span className="flex size-[36px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}><w.icon className="h-[16px] w-[16px]" /></span>
                    <span className="min-w-0 flex-1 truncate text-[15px] leading-[20px] font-medium">{w.text}</span>
                    <span className="inline-flex flex-none items-center gap-[2px] text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{w.action}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="flex items-center gap-[8px] text-[15px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />Nothing waiting on you</p>}
        </section>

        <section aria-label="Their Top 3" className="flex max-w-[720px] flex-col gap-[var(--space-4)]">
          <Title>Their Top 3</Title>
          {careers.length ? (
            <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-[var(--space-5)] sm:overflow-visible sm:px-0">
              {careers.map((c) => (
                <div key={c!.id} className="w-[200px] flex-none sm:w-auto">
                  <PosterCard fill career={{ title: c!.title, world: c!.world, photo: c!.photo }} onClick={() => router.push(`/career/${careerSlug(c!.title)}`)} />
                </div>
              ))}
            </div>
          ) : <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>No Top 3 yet.</p>}
        </section>
      </div>

      <aside className="flex min-w-0 flex-col gap-[40px] lg:border-l lg:pl-[var(--space-10)]" style={{ borderColor: RULE }}>
        <section aria-label="Flags" className="flex flex-col gap-[var(--space-3)]">
          <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>From the SIS</span>
          {flags.length ? (
            <ul className="flex flex-col gap-[var(--space-3)]">
              {flags.slice(0, 4).map((f) => (
                <li key={f.text} className="flex items-start gap-[10px] text-[14.5px] leading-[20px] font-medium">
                  <AlertTriangle className={`mt-[2px] h-4 w-4 flex-none ${f.severity >= 3 ? "v5-risk" : "v5-warn"}`} aria-hidden />{f.text}
                </li>
              ))}
            </ul>
          ) : <p className="flex items-center gap-[8px] text-[14.5px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />No flags</p>}
        </section>
        <section aria-label="Last note" className="flex flex-col gap-[var(--space-3)]">
          <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Last note</span>
          {notes[0] ? <p className="line-clamp-4 text-[14.5px] leading-[21px] whitespace-pre-line">{notes[0].text}</p> : <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>No notes yet.</p>}
          <button type="button" onClick={() => onTab("notes")} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{notes[0] ? "All notes" : "Add a note"}</button>
        </section>
      </aside>
    </div>
  );
}

/** Their grade's milestones as a timeline, the action on the step itself. */
function Milestones({ row, keys }: { row: ReturnType<typeof useReviewedRoster>[number]; keys: ReturnType<typeof milestonesForGrade> }) {
  return (
    <ol className="flex max-w-[760px] flex-col">
      {keys.map((k, i) => {
        const Icon = MILESTONE_ICON[k];
        const st = row.milestones[k];
        const m = MILESTONE_WORD[st];
        const last = i === keys.length - 1;
        return (
          <li key={k} className="relative flex gap-[var(--space-4)]">
            <span className="relative flex w-[20px] flex-none justify-center">
              <span aria-hidden className="relative z-[1] mt-[18px] size-[14px] rounded-full" style={{ background: m.dot, boxShadow: "0 0 0 4px var(--background)" }} />
              {!last && <span aria-hidden className="absolute top-[30px] bottom-[-18px] w-[2px]" style={{ background: RULE }} />}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-[var(--space-3)] border-b py-[14px]" style={{ borderColor: last ? "transparent" : RULE }}>
              <Icon className="h-[18px] w-[18px] flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[15.5px] leading-[20px] font-semibold">{k}</span>
              <span className={`text-[13.5px] font-semibold ${m.cls ?? ""}`} style={m.accent ? { color: "var(--accent)" } : m.cls ? undefined : { color: "var(--muted-foreground)" }}>{m.word}</span>
              {st === "Pending Review" && (
                <Link href={cv("workspace", "&tab=reviews")} className="dm-quiet inline-flex h-8 flex-none items-center rounded-full border px-[12px] text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}>Review</Link>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Academics({ sis }: { sis: ReturnType<typeof sisFor> }) {
  const reqs = sis.requirements.filter((r) => r.area !== "Total");
  return (
    <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-12)]">
      <div className="flex min-w-0 flex-col gap-[48px]">
        <section aria-label="Courses" className="flex flex-col gap-[var(--space-3)]">
          <Title aside={`${sis.courses.length} this term`}>Courses</Title>
          <ul className="flex flex-col">
            {sis.courses.map((c) => (
              <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto_44px] items-center gap-x-[var(--space-4)] border-b py-[12px] sm:grid-cols-[minmax(0,1fr)_120px_auto_44px]" style={{ borderColor: RULE }}>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] leading-[20px] font-semibold">{c.name}</span>
                  <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{c.level === "Regular" ? c.subject : `${c.level} · ${c.subject}`}</span>
                </span>
                <span className="hidden text-[13px] font-medium sm:block" style={{ color: "var(--muted-foreground)" }}>{c.teacher}</span>
                <span className="flex w-[64px] items-center justify-end gap-[4px] text-[13px] font-semibold tabular-nums">
                  {c.trend > 0 && <><TrendingUp className="v5-ok h-[14px] w-[14px]" aria-hidden /><span className="v5-ok">+{c.trend}</span></>}
                  {c.trend < 0 && <><TrendingDown className="v5-risk h-[14px] w-[14px]" aria-hidden /><span className="v5-risk">{c.trend}</span></>}
                </span>
                <span className="text-right text-[18px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{c.letter}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Graduation requirements" className="flex flex-col gap-[var(--space-4)]">
          <Title aside={`${sis.credits.earned} of ${sis.credits.required} credits`}>Graduation Requirements</Title>
          <ul className="grid grid-cols-1 gap-x-[var(--space-8)] gap-y-[var(--space-4)] sm:grid-cols-2">
            {reqs.map((r) => (
              <li key={r.area} className="flex flex-col gap-[6px]">
                <span className="flex items-baseline justify-between gap-[var(--space-3)] text-[14px] font-semibold"><span className="truncate">{r.area}</span><span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.earned}{r.inProgress ? ` + ${r.inProgress}` : ""} / {r.required}</span></span>
                <span className="relative h-[8px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, ((r.earned + r.inProgress) / r.required) * 100)}%`, background: "color-mix(in srgb, var(--primary) 35%, transparent)" }} />
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (r.earned / r.required) * 100)}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, var(--background)), var(--primary))" }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="flex min-w-0 flex-col gap-[40px] lg:border-l lg:pl-[var(--space-10)]" style={{ borderColor: RULE }}>
        <section aria-label="Attendance" className="flex flex-col gap-[var(--space-3)]">
          <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Attendance, last six weeks (80 to 100%)</span>
          <div className="flex h-[72px] items-end gap-[8px]">
            {sis.attendance.weeks.map((w, i) => (
              <span key={i} className="flex flex-1 flex-col items-center gap-[4px]">
                <span className="w-full rounded-t-[4px]" style={{ height: `${Math.max(4, ((Math.min(100, w) - 80) / 20) * 56)}px`, background: w < 90 ? "var(--color-feedback-danger-solid)" : "linear-gradient(180deg, var(--primary), color-mix(in srgb, var(--primary) 55%, var(--background)))" }} />
                <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--muted-foreground)" }}>{Math.round(w)}</span>
              </span>
            ))}
          </div>
          <p className="text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{sis.attendance.absences} {sis.attendance.absences === 1 ? "absence" : "absences"} · {sis.attendance.tardies} {sis.attendance.tardies === 1 ? "tardy" : "tardies"}</p>
        </section>
        {sis.tests.length > 0 && (
          <section aria-label="Tests" className="flex flex-col gap-[var(--space-3)]">
            <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Tests</span>
            <ul className="flex flex-col">
              {sis.tests.map((t) => (
                <li key={t.name} className="flex items-center gap-[var(--space-3)] border-b py-[10px] last:border-b-0" style={{ borderColor: RULE }}>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{t.name}</span>
                  <span className="text-[16px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{t.score}</span>
                  <span className={`w-[74px] text-right text-[12.5px] font-semibold ${t.met ? "v5-ok" : "v5-warn"}`}>{t.met ? "Benchmark" : "Below"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}

function Path({ top3, saved, simulations }: { top3: string[]; saved: string[]; simulations: number }) {
  const router = useRouter();
  const rest = saved.filter((id) => !top3.includes(id)).map(careerById).filter((c) => !!c);
  const careers = top3.map(careerById).filter((c) => !!c);
  return (
    <div className="flex flex-col gap-[48px]">
      <section aria-label="Their Top 3" className="flex flex-col gap-[var(--space-4)]">
        <Title aside={`${simulations} simulations played`}>Their Top 3</Title>
        <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-[var(--space-5)] sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {careers.map((c) => (
            <div key={c!.id} className="w-[200px] flex-none sm:w-auto">
              <PosterCard fill career={{ title: c!.title, world: c!.world, photo: c!.photo }} onClick={() => router.push(`/career/${careerSlug(c!.title)}`)} />
            </div>
          ))}
        </div>
      </section>
      {rest.length > 0 && (
        <section aria-label="Also saved" className="flex flex-col gap-[var(--space-4)]">
          <Title aside={String(rest.length)}>Also Saved</Title>
          <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-[var(--space-5)] sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {rest.map((c) => (
              <div key={c!.id} className="w-[160px] flex-none sm:w-auto">
                <PosterCard fill career={{ title: c!.title, world: c!.world, photo: c!.photo }} onClick={() => router.push(`/career/${careerSlug(c!.title)}`)} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Notes({ studentId, meetings }: { studentId: string; meetings: { m: { id: string; day: string; type: string }; notes: string }[] }) {
  const [notes, setNotes] = useState<CounselorNote[]>(() => readNotes(studentId));
  const [draft, setDraft] = useState("");
  // your notes and finished meetings, newest first, in one list
  const items = [
    ...notes.map((n) => ({ key: n.id, when: n.createdAt.slice(0, 10), label: "Note", text: n.text })),
    ...meetings.map(({ m, notes: t }) => ({ key: m.id, when: m.day, label: m.type, text: t || "Meeting completed." })),
  ].sort((a, b) => b.when.localeCompare(a.when));
  return (
    <div className="flex max-w-[760px] flex-col gap-[var(--space-6)]">
      <form onSubmit={(e) => { e.preventDefault(); const t = draft.trim(); if (!t) return; setNotes(addNote(studentId, t)); setDraft(""); }} className="flex flex-col gap-[var(--space-2)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
          <span className="text-[14px] font-semibold">Add a note</span>
          <button type="button" onClick={() => openLog({ mode: "walkin", studentId })} className="dm-link inline-flex cursor-pointer items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--accent)" }}>Log a meeting instead</button>
        </div>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="What you want to remember" aria-label="Add a note" className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
        <button type="submit" disabled={!draft.trim()} className="dm-solid inline-flex min-h-[40px] items-center justify-center self-end rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Save note</button>
      </form>
      {items.length ? (
        <ul className="flex flex-col">
          {items.map((it) => (
            <li key={it.key} className="flex flex-col gap-[4px] border-b py-[var(--space-4)]" style={{ borderColor: RULE }}>
              <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{new Date(`${it.when}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {it.label}</span>
              <p className="text-[15px] leading-[22px] whitespace-pre-line">{it.text}</p>
            </li>
          ))}
        </ul>
      ) : <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>No notes or meetings yet.</p>}
    </div>
  );
}
