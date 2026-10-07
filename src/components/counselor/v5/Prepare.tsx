"use client";

// v5 Prepare (rethought 7 Oct 2026; Chandu: "Prepare is NOT good... it can
// look and be a lot better than just a row of cards. What's relevant there?
// Isn't the workspace relevant to prepare? Think of everything").
// What a counselor needs before a meeting, in order:
// - when and why: the booking, and what the student wrote when they booked
// - what is waiting on you from this student (the Workspace items: their
//   submissions to review, unanswered questions, letter requests, FAFSA)
// - an agenda to tick off: suggested points plus your own
// - context: their Top 3, schools that fit, academics, last time's notes
// - the outcome: notes for this meeting and Complete meeting, which saves
//   them as next time's "last time"
// The landing is this week's calendar, plus who needs a meeting and has
// none booked, with a Book button.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus, Check, ChevronLeft, ChevronRight, MessageCircle, Plus, Printer, RotateCcw, UserRound } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { TextTabs } from "@/components/app/TextTabs";
import { PosterCard } from "@/components/app/PosterCard";
import { careerSlug } from "@/components/career/slug";
import { pathwayFor, schoolsFor, type SchoolMatch } from "@/components/colleges/pathway";
import { SchoolCard, type CardBadge } from "@/components/colleges/shared";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank, attentionReason, milestonesForGrade, type CounselorStudent } from "@/lib/counselorRoster";
import { addMeeting, readOfficeHours, useOfficeHours, completeMeeting, isPast, removeAddedMeeting, seededMeetings, timeLabel, useAddedMeetings, useMeetingsDone, type Meeting } from "@/lib/counselorMeetings";
import { sisFor } from "@/lib/counselorSis";
import { careerById, toV5 } from "@/lib/counselorV5";
import { EMPTY_PROFILE } from "@/lib/studentProfile";
import { StudentSearch } from "./StudentSearch";
import { StudentFace } from "./StudentFace";
import { cv } from "@/lib/counselorBase";
import { waitingFor } from "./waiting";
import { ABSwitch, useAB } from "../abTests";
import { Reviews } from "./Workspace";
import { V5Messages } from "./Messages";
import { V5Documents } from "./Documents";
import { openLog } from "./LogSheet";
import { logTime } from "@/lib/counselorTimeLog";
import { addNote } from "@/lib/counselorNotes";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const STATUS_CLASS = { "On Track": "v5-ok", "Needs Attention": "v5-warn", "At Risk": "v5-risk" } as const;
const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
const FIT_TONE: Record<string, CardBadge["tone"]> = { Reach: "reach", Target: "target", Safety: "safety", "Open admission": "open" };
const PREP = cv("prepare");
const briefHref = (id: string) => `${PREP}&studentId=${encodeURIComponent(id)}`;
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px] sm:leading-[30px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>;
}

/** Every meeting, booked and seeded, with the student on the roster. */
export function useMeetings(roster: CounselorStudent[]) {
  const added = useAddedMeetings();
  return useMemo(() => {
    const ids = new Set(roster.map((s) => s.id));
    return [...seededMeetings(roster, new Date()), ...added].filter((m) => ids.has(m.studentId)).sort((a, b) => `${a.day}${a.time}`.localeCompare(`${b.day}${b.time}`));
  }, [roster, added]);
}

/** The next free office-hours slot after now (for Book). */
export function nextSlot(meetings: Meeting[], hours = readOfficeHours()): { day: string; time: string } {
  const taken = new Set(meetings.map((m) => `${m.day} ${m.time}`));
  const now = new Date();
  for (let k = 1; k < 21; k++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
    const oh = hours.find((o) => o.weekday === d.getDay());
    if (!oh) continue;
    const [fh, fm] = oh.from.split(":").map(Number);
    const [th, tm] = oh.to.split(":").map(Number);
    for (let t = fh * 60 + fm; t + 15 <= th * 60 + tm; t += 15) {
      const time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      if (!taken.has(`${iso(d)} ${time}`)) return { day: iso(d), time };
    }
  }
  return { day: iso(new Date(now.getTime() + 86400000)), time: "10:00" };
}

/** Workspace inside Prepare, or Workspace as its own area (Joshua's map).
 *  Shared by both builds and both shells, so one switch flips the nav too. */
export function usePrepareMerged(): boolean {
  return useAB<"merged" | "separate">("prepare-ia", "merged")[0] === "merged";
}

export function PrepareMergeSwitch() {
  return <ABSwitch<"merged" | "separate"> test="prepare-ia" fallback="merged" options={[{ key: "merged", label: "Workspace inside" }, { key: "separate", label: "Separate" }]} why="Joshua's map keeps Workspace as its own area. Inside Prepare, everything around a meeting (your week, who needs one, reviews, messages, letters) is in one place and the nav loses an item. Open until counselors try both." />;
}

type PrepTab = "week" | "needs" | "reviews" | "messages" | "documents";
const WORK_TABS = new Set<PrepTab>(["reviews", "messages", "documents"]);

export function V5Prepare({ studentId, initialTab }: { studentId?: string; initialTab?: string }) {
  const roster = useReviewedRoster();
  // Home's own urgency order, so "next conversation" means the same student
  const ordered = useMemo(() => [...roster].sort((a, b) => NEED[a.status] - NEED[b.status] || (a.status === "On Track" ? a.name.localeCompare(b.name) : attentionRank(a, b))), [roster]);
  const meetings = useMeetings(ordered);
  if (!studentId) return <PrepareHome ordered={ordered} meetings={meetings} initialTab={initialTab} />;
  const row = ordered.find((r) => r.id === studentId);
  if (!row) return null;
  return <Brief row={row} ordered={ordered} meetings={meetings} />;
}

// ---- Landing ------------------------------------------------------------------
// What Prepare is for (Chandu, 7 Oct 2026: "let's define the function of the
// Prepare tab, maybe Workspace should be inside Prepare"): getting ready for
// conversations and clearing what students wait on before them. Your week,
// who needs a meeting and has none, and (merged) the review, message and
// letter queues. Each is a tab, so the page never stacks two big lists.

function PrepareHome({ ordered, meetings, initialTab }: { ordered: CounselorStudent[]; meetings: Meeting[]; initialTab?: string }) {
  const merged = usePrepareMerged();
  const [picked, setTab] = useState<PrepTab>((["week", "needs", "reviews", "messages", "documents"] as PrepTab[]).includes(initialTab as PrepTab) ? (initialTab as PrepTab) : "week");
  // a work tab picked while merged falls back to the week once separated
  const tab: PrepTab = !merged && WORK_TABS.has(picked) ? "week" : picked;
  const now = new Date();
  // anyone met or booked this week or later is covered
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const booked = new Set(meetings.filter((m) => m.day >= iso(monday)).map((m) => m.studentId));
  const needs = ordered.filter((s) => s.status !== "On Track" && !booked.has(s.id));
  const items: { key: PrepTab; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "needs", label: `Needs a Meeting${needs.length ? ` (${needs.length})` : ""}` },
    ...(merged ? [{ key: "reviews" as const, label: "Reviews" }, { key: "messages" as const, label: "Messages" }, { key: "documents" as const, label: "Documents" }] : []),
  ];

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Prepare</h1>
          <PrepareMergeSwitch />
        </div>
        {/* find a brief, or book and log right here (the shared LogSheet) */}
        <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-[640px]"><StudentSearch students={ordered} hrefFor={briefHref} placeholder="Who are you meeting? Type a name or ID" /></div>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <button type="button" onClick={() => openLog({ mode: "walkin" })} className="dm-quiet inline-flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
              <UserRound className="h-4 w-4" aria-hidden /> Log a walk-in
            </button>
            <button type="button" onClick={() => openLog({ mode: "book" })} className="dm-solid inline-flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <CalendarPlus className="h-4 w-4" aria-hidden /> Book a meeting
            </button>
          </div>
        </div>
        <TextTabs items={items} value={tab} onChange={setTab} ariaLabel="Prepare" layoutId="v5-prepare-tabs" />
      </header>
      {tab === "week" && <WeekView ordered={ordered} meetings={meetings} />}
      {tab === "needs" && <NeedsView needs={needs} meetings={meetings} />}
      {tab === "reviews" && <Reviews />}
      {tab === "messages" && <V5Messages />}
      {tab === "documents" && <V5Documents />}
    </div>
  );
}

/** The week as a calendar: a date column per weekday, today circled, each
 *  meeting a time over a face and name, the next one marked. Phones read it
 *  as a day-by-day agenda. */
function WeekView({ ordered, meetings }: { ordered: CounselorStudent[]; meetings: Meeting[] }) {
  const officeHours = useOfficeHours();
  const byId = useMemo(() => new Map(ordered.map((s) => [s.id, s])), [ordered]);
  const done = useMeetingsDone();
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const days = [0, 1, 2, 3, 4].map((k) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + k));
  const today = iso(now);
  const next = meetings.find((m) => !isPast(m, now) && !done[m.id]);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const range = days[0].getMonth() === days[4].getMonth() ? `${fmt(days[0])} to ${days[4].getDate()}` : `${fmt(days[0])} to ${fmt(days[4])}`;
  const total = meetings.filter((m) => m.day >= iso(days[0]) && m.day <= iso(days[4])).length;

  return (
    <section aria-label="Your week" className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <div className="flex items-center gap-[4px]">
          <button type="button" aria-label="Previous week" onClick={() => setOffset((o) => o - 1)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
          <button type="button" aria-label="Next week" onClick={() => setOffset((o) => o + 1)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full"><ChevronRight className="h-5 w-5" aria-hidden /></button>
        </div>
        <span className="text-[18px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{range}</span>
        <span className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>{total} {total === 1 ? "meeting" : "meetings"}</span>
        {offset !== 0 && <button type="button" onClick={() => setOffset(0)} className="dm-link text-[14px] font-semibold" style={{ color: "var(--accent)" }}>This week</button>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {days.map((d, i) => {
          const key = iso(d);
          const list = meetings.filter((m) => m.day === key);
          const isToday = key === today;
          const hours = officeHours.find((o) => o.weekday === d.getDay());
          return (
            <div key={key} className={`flex min-w-0 gap-[var(--space-5)] border-b py-[var(--space-4)] lg:min-h-[300px] lg:flex-col lg:gap-[var(--space-4)] lg:border-b-0 lg:px-[var(--space-4)] lg:py-0 ${i ? "lg:border-l" : "lg:pl-0"}`} style={{ borderColor: RULE }}>
              <div className="flex w-[52px] flex-none flex-col items-center gap-[4px] lg:w-auto lg:flex-row lg:items-center lg:gap-[10px]" style={{ opacity: hours || list.length ? 1 : 0.5 }}>
                <span className="flex size-[40px] items-center justify-center rounded-full text-[20px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", ...(isToday ? { background: "var(--accent)", color: "#fff" } : {}) }}>{d.getDate()}</span>
                <span className="flex flex-col items-center lg:items-start">
                  <span className={OVERLINE} style={{ color: isToday ? "var(--accent)" : "var(--muted-foreground)" }}>{isToday ? "Today" : DAY[d.getDay()]}</span>
                  <span className="hidden text-[12.5px] font-medium tabular-nums lg:block" style={{ color: "var(--muted-foreground)" }}>{hours ? `${timeLabel(hours.from)} to ${timeLabel(hours.to)}` : "No office hours"}</span>
                </span>
              </div>
              <ul className="flex min-w-0 flex-1 flex-col gap-[var(--space-2)]">
                {list.map((m) => {
                  const st = byId.get(m.studentId)!;
                  const past = isPast(m, now) || !!done[m.id];
                  const isNext = next?.id === m.id;
                  return (
                    <li key={m.id}>
                      <Link href={briefHref(st.id)} className="dm-quiet group relative flex flex-col gap-[6px] rounded-[var(--radius-md)] py-[8px] pr-[var(--space-2)] pl-[14px]" style={{ opacity: past ? 0.55 : 1, background: isNext ? "color-mix(in srgb, var(--accent) 10%, transparent)" : undefined }}>
                        <span aria-hidden className="absolute top-[8px] bottom-[8px] left-0 w-[3px] rounded-full" style={{ background: past ? "color-mix(in srgb, var(--foreground) 22%, transparent)" : "var(--accent)" }} />
                        <span className="flex items-center gap-[6px] text-[13px] font-semibold tabular-nums" style={{ color: isNext ? "var(--accent)" : "var(--muted-foreground)" }}>
                          {past && <Check className="h-[13px] w-[13px]" aria-hidden />}
                          {timeLabel(m.time)}
                          {isNext && <span className="ml-auto text-[11px] tracking-[0.06em] uppercase">Next</span>}
                        </span>
                        <span className="flex min-w-0 items-center gap-[8px]">
                          <StudentFace s={st} size={28} />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-[14px] leading-[18px] font-semibold">{st.name}</span>
                            <span className="truncate text-[12.5px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{m.type}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {/* an office-hours day still to come: book straight into it */}
                {hours && key > today && (
                  <li>
                    <button type="button" onClick={() => openLog({ mode: "book", day: key })} className="dm-quiet inline-flex h-9 w-full cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border border-dashed px-[12px] text-[13.5px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)", color: "var(--accent)" }}>
                      <Plus className="h-[14px] w-[14px]" aria-hidden /> Book
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Students who need you and have nothing booked, neediest first. Book takes
 *  the next free office-hours slot; Undo puts them back. */
function NeedsView({ needs, meetings }: { needs: CounselorStudent[]; meetings: Meeting[] }) {
  const [all, setAll] = useState(false);
  const [last, setLast] = useState<{ name: string; id: string; when: string } | null>(null);
  const book = (s: CounselorStudent) => {
    const slot = nextSlot(meetings);
    const m = addMeeting({ studentId: s.id, type: "Check-in", day: slot.day, time: slot.time, minutes: 15, topic: "" });
    setLast({ name: s.name.split(" ")[0], id: m.id, when: `${DAY[new Date(`${slot.day}T12:00:00`).getDay()]} ${timeLabel(slot.time)}` });
  };
  const shown = all ? needs : needs.slice(0, 12);
  return (
    <section aria-label="Needs a meeting" className="flex max-w-[920px] flex-col gap-[var(--space-3)]">
      {last && (
        <span role="status" className="flex items-center gap-[8px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>
          <Check className="h-4 w-4 v5-ok" aria-hidden /> {last.name} booked for {last.when}
          <button type="button" onClick={() => { removeAddedMeeting(last.id); setLast(null); }} className="dm-link inline-flex items-center gap-[4px] font-semibold" style={{ color: "var(--accent)" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
        </span>
      )}
      {needs.length ? (
        <ul className="flex flex-col">
          {shown.map((st) => (
            <li key={st.id} className="flex items-center gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE }}>
              <Link href={briefHref(st.id)} className="dm-quiet group -mx-[var(--space-2)] flex min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[4px]">
                <StudentFace s={st} size={40} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] leading-[19px] font-semibold">{st.name}</span>
                  <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {st.grade} · {attentionReason(st)}</span>
                </span>
              </Link>
              <span className={`hidden w-[130px] flex-none text-[13.5px] font-semibold sm:block ${STATUS_CLASS[st.status]}`}>{st.status}</span>
              <button type="button" onClick={() => book(st)} className="dm-quiet inline-flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}>
                <Plus className="h-[14px] w-[14px]" aria-hidden /> Book
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-[var(--space-8)] text-[16px] font-semibold v5-ok">Everyone who needs you has a meeting.</p>
      )}
      {needs.length > 12 && (
        <button type="button" onClick={() => setAll((a) => !a)} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{all ? "Show fewer" : `Show all ${needs.length}`}</button>
      )}
    </section>
  );
}

// ---- The brief -----------------------------------------------------------------


function Brief({ row, ordered, meetings }: { row: CounselorStudent; ordered: CounselorStudent[]; meetings: Meeting[] }) {
  const router = useRouter();
  const done = useMeetingsDone();
  const s = toV5(row);
  const sis = sisFor(row);
  const now = new Date();
  const mine = meetings.filter((m) => m.studentId === row.id);
  const next = mine.find((m) => !isPast(m, now) && !done[m.id]);
  const last = [...mine].reverse().find((m) => done[m.id]);
  const top3 = s.dreamari.top3.map(careerById).filter((c) => !!c);
  const lead = top3[0];
  const plan = row.postsecondaryIntent === "Undecided" ? "Still exploring" : row.postsecondaryIntent;
  const nextMilestone = milestonesForGrade(s.grade).find((k) => row.milestones[k] === "Not Started");

  // What is waiting on you from this student: the Workspace, for one person.
  const waiting = waitingFor(row, ordered);

  // The agenda: suggested points, then your own.
  const suggested = [
    ...(s.attention ? [s.attention.reason] : []),
    ...(lead ? [`Why ${lead.title}?`] : []),
    ...(nextMilestone && !s.attention?.reason.startsWith(nextMilestone) ? [`Start ${nextMilestone}`] : []),
    ...(row.postsecondaryIntent === "Undecided" ? ["College, 2-year or trade?"] : []),
  ];
  const [extra, setExtra] = useState<string[]>([]);
  const [ticked, setTicked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const agenda = [...suggested, ...extra];
  // DEMO-ONLY: a "last time" note until real meeting history exists.
  const lastNote = last ? done[last.id].notes : lead ? `Talked about ${lead.title}. Agreed next step: ${nextMilestone ?? "keep exploring careers"}.` : "First meeting.";
  const lastWhen = last ? new Date(`${last.day}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Sep 18";

  return (
    <div className="flex flex-col gap-[40px] pt-[var(--space-2)] lg:gap-[48px] lg:pt-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => router.push(PREP)} className="dm-link inline-flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> This week
        </button>
        <div className="flex w-full items-center gap-[var(--space-2)] sm:w-auto">
          <StudentSearch compact students={ordered} hrefFor={briefHref} placeholder="Switch student" />
          <button type="button" onClick={() => window.print()} className="dm-quiet hidden h-10 items-center gap-[8px] rounded-full border px-[14px] text-[14px] font-semibold sm:inline-flex" style={{ borderColor: "var(--glass-border)" }}>
            <Printer className="h-4 w-4" aria-hidden /> Print
          </button>
        </div>
      </div>

      {/* who, and when and why */}
      <header className="flex flex-col gap-[var(--space-5)] lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-[var(--space-5)]">
          <StudentFace s={row} size={80} />
          <div className="flex min-w-0 flex-col gap-[4px]">
            <h1 className="text-[30px] leading-[1.1] font-semibold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>{s.name}</h1>
            <p className="text-[15px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {plan}</p>
            <p className={`flex items-center gap-[6px] text-[15px] font-semibold ${STATUS_CLASS[s.status]}`}><span aria-hidden className="size-[8px] rounded-full bg-current" />{s.status}</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-[4px] lg:items-end lg:text-right">
          {next ? (
            <>
              <span className={OVERLINE} style={{ color: "var(--accent)" }}>{DAY[new Date(`${next.day}T12:00:00`).getDay()]} {timeLabel(next.time)} · {next.type}</span>
              {next.topic && <span className="max-w-[420px] text-[16px] leading-[22px] font-medium italic">“{next.topic}”</span>}
            </>
          ) : (
            <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>No meeting booked</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-12)]">
        <div className="flex min-w-0 flex-col gap-[48px]">
          {waiting.length > 0 && (
            <section aria-label="Waiting on you" className="flex flex-col gap-[var(--space-3)]">
              <Title>Waiting on You</Title>
              <ul className="flex flex-col">
                {waiting.map((w) => (
                  <li key={w.key} className="border-b" style={{ borderColor: RULE }}>
                    <Link href={w.href} className="dm-quiet group -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[12px]">
                      <span className="flex size-[34px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}><w.icon className="h-[16px] w-[16px]" /></span>
                      <span className="min-w-0 flex-1 text-[15px] leading-[20px] font-semibold">{w.action}: {w.text}</span>
                      <ChevronRight className="h-4 w-4 flex-none transition-transform group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Agenda" className="flex flex-col gap-[var(--space-3)]">
            <Title>Agenda</Title>
            <ul className="flex flex-col">
              {agenda.map((a) => {
                const on = ticked.includes(a);
                return (
                  <li key={a} className="border-b" style={{ borderColor: RULE }}>
                    <button type="button" role="checkbox" aria-checked={on} onClick={() => setTicked((l) => (on ? l.filter((x) => x !== a) : [...l, a]))} className="dm-quiet -mx-[var(--space-2)] flex w-[calc(100%+var(--space-4))] cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[12px] text-left">
                      <span className="flex size-[22px] flex-none items-center justify-center rounded-[6px] border-2" style={{ borderColor: on ? "var(--accent)" : "color-mix(in srgb, var(--foreground) 30%, transparent)", background: on ? "var(--accent)" : "transparent" }}>{on && <Check className="h-[14px] w-[14px] text-white" strokeWidth={3} aria-hidden />}</span>
                      <span className="text-[16px] leading-[21px] font-semibold" style={{ textDecoration: on ? "line-through" : "none", color: on ? "var(--muted-foreground)" : "var(--foreground)" }}>{a}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <form onSubmit={(e) => { e.preventDefault(); const t = draft.trim(); if (t && !agenda.includes(t)) setExtra((l) => [...l, t]); setDraft(""); }} className="flex items-center gap-[var(--space-2)]">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a point" aria-label="Add an agenda point" className="h-10 min-w-0 flex-1 rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px] outline-none" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
              <button type="submit" className="dm-quiet inline-flex h-10 items-center gap-[6px] rounded-[var(--radius-md)] border px-[14px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)" }}><Plus className="h-4 w-4" aria-hidden /> Add</button>
            </form>
          </section>

          <section aria-label="Their Top 3" className="flex flex-col gap-[var(--space-4)]">
            <Title>Their Top 3</Title>
            {top3.length ? (
              <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-[var(--space-5)] sm:overflow-visible sm:px-0">
                {top3.map((c) => (
                  <div key={c!.id} className="w-[200px] flex-none sm:w-auto">
                    <PosterCard fill career={{ title: c!.title, world: c!.world, photo: c!.photo }} onClick={() => router.push(`/career/${careerSlug(c!.title)}`)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>No Top 3 yet.</p>
            )}
          </section>

          {lead && <Schools row={row} careerId={lead.id} careerTitle={lead.title} gpa={sis.gpa} />}
        </div>

        {/* the meeting itself: last time, this time's notes, then the facts */}
        <aside className="flex min-w-0 flex-col gap-[36px] lg:sticky lg:top-[100px] lg:self-start">
          <section aria-label="Notes" className="flex flex-col gap-[var(--space-3)]">
            <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Last time · {lastWhen}</span>
            <p className="text-[14.5px] leading-[21px]">{lastNote}</p>
            <label className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
              <span className="text-[14px] font-semibold">Notes for this meeting</span>
              <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} rows={5} placeholder="What you agreed, and the next step" className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
            </label>
            {next && (
              <button type="button" disabled={!notes.trim() || saved} onClick={() => { completeMeeting(next.id, notes.trim()); logTime({ activity: `${next.type} meeting`, minutes: next.minutes, kind: "direct", studentId: row.id }); addNote(row.id, `${next.type}: ${notes.trim()}`); setSaved(true); }} className="dm-solid inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <Check className="h-4 w-4" aria-hidden /> {saved ? "Meeting completed" : "Complete meeting"}
              </button>
            )}
          </section>
          <Facts title="Academics" items={[
            { value: sis.gpa.toFixed(1), label: "GPA" },
            { value: `${sis.credits.earned}/${sis.credits.required}`, label: "Credits" },
            { value: `${Math.round(sis.attendance.rate)}%`, label: "Attendance" },
          ]} />
          <Facts title="In Dreamari" items={[
            { value: String(s.dreamari.saved.length), label: "Careers saved" },
            { value: String(s.dreamari.simulations), label: "Simulations" },
            { value: String(s.source.engagement.collegesSaved), label: "Schools saved" },
          ]} />
          <Link href={cv("workspace", "&tab=messages")} className="dm-quiet inline-flex min-h-[44px] items-center justify-center gap-[8px] self-start rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
            <MessageCircle className="h-4 w-4" aria-hidden /> Message {s.user.givenName}
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Facts({ title, items }: { title: string; items: { value: string; label: string }[] }) {
  return (
    <section aria-label={title} className="flex flex-col gap-[var(--space-4)]">
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>{title}</span>
      <dl className="grid grid-cols-3 gap-[var(--space-4)]">
        {items.map((it) => (
          <div key={it.label} className="flex min-w-0 flex-col gap-[2px]">
            <dd className="m-0 text-[20px] leading-[26px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{it.value}</dd>
            <dt className="text-[13px] leading-[17px] font-medium" style={{ color: "var(--muted-foreground)" }}>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Schools for their first career, by GPA and home state: one Reach, one
 *  Target, one Safety where they exist, on the student app's school card. */
function Schools({ row, careerId, careerTitle, gpa }: { row: CounselorStudent; careerId: string; careerTitle: string; gpa: number }) {
  // Save here is a meeting shortlist for this brief, not the student's list.
  const [short, setShort] = useState<string[]>([]);
  const list = useMemo(() => {
    const pathway = pathwayFor(careerId);
    if (!pathway) return [] as SchoolMatch[];
    const path = row.postsecondaryIntent === "Trade/Technical School" ? "trades" : row.postsecondaryIntent === "Undecided" ? "both" : "college";
    // DEMO-ONLY: the counselor demo school is in New Jersey; production
    // reads the student's own state preferences.
    const g = schoolsFor(pathway, { ...EMPTY_PROFILE, gpa: gpa.toFixed(2), gpaType: "unweighted", states: ["New Jersey"], path });
    // One of each where it exists, three in all: a full row, no orphan card.
    const firsts = [g.reach[0], g.target[0], g.safety[0]].filter((m): m is SchoolMatch => !!m);
    const rest = [...g.target.slice(1), ...g.safety.slice(1), ...g.reach.slice(1)];
    return [...firsts, ...rest].slice(0, 3);
  }, [careerId, row.postsecondaryIntent, gpa]);
  return (
    <section aria-label="Schools that fit" className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-end justify-between gap-[var(--space-4)]">
        <Title>Schools That Fit</Title>
        <span className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>For {careerTitle}</span>
      </div>
      {list.length ? (
        <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-[var(--space-5)] lg:overflow-visible lg:px-0">
          {list.map((m) => (
            <div key={m.college.slug} className="w-[280px] flex-none lg:w-auto">
              <SchoolCard c={m.college} href={`/colleges/${m.college.slug}`} saved={short.includes(m.college.slug)} onSave={() => setShort((l) => (l.includes(m.college.slug) ? l.filter((x) => x !== m.college.slug) : [...l, m.college.slug]))} compared={false} program={m.program} fit={FIT_TONE[m.fit] ? { label: m.fit, tone: FIT_TONE[m.fit] } : undefined} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>No match yet.</p>
      )}
    </section>
  );
}
