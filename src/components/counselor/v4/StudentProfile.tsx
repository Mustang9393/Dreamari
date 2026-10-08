"use client";

// DEMO-ONLY v2 fork of ../StudentProfile.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx).
//
// 25 Sept 2026 pass under the v2 budget: the identity card leads with what
// needs the counselor (a "Needs you" line built from the student's own
// milestones), the milestone grid is grade-scoped and ordered attention
// first, dates read "Jan 8", no "You" badge (this is the counselor's view,
// not the student's), plain notes copy.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { goBackOr } from "@/components/app/chrome";
import {
  ChevronLeft, Bell, MessageSquare, StickyNote, Target, GraduationCap, BookOpen, Flag, Compass,
  Sparkles, Sunrise, Gamepad2, Bookmark, Landmark, Trophy, HelpCircle, MessageCircle, FileText, Briefcase, Info,
} from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import { COLLEGES, type College } from "@/components/colleges/data";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { careerById, toV5 } from "@/lib/counselorV5";
import { reviewItemId } from "@/lib/counselorReviews";
import { lastReminder, reminderDate, sendReminder, useReminders } from "@/lib/counselorReminders";
import { seedHash } from "@/lib/localRecord";
import { openCareer, openSchool } from "../v5/ExploreSheets";
import { QUESTIONS, useConnectLive } from "./CounselorConnect";
import { SidePanel } from "./SidePanel";
import { Go } from "./chips";
import { MetricTile } from "./viz";
import { SubTabs } from "./SubTabs";
import { HoverBeam } from "@/components/app/HoverBeam";
import { lastActiveLabel, milestonesForGrade, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { getReviewedStudentById, useReviewDecisions } from "@/lib/counselorReviews";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar, CardLink, STATUS_COLORS } from "./chips";
import { signalsFor } from "@/lib/studentSignals";
import { DraftTools } from "./ProductivitySuite";
import { Disclosure } from "./Disclosure";
import { FamilyCard, MeetingsCard, MessagesCard, PlanSignoffCard, TodosCard } from "./Casefile";
import { GLASS_INSET } from "../surfaces";
import { careerArtFor, DreamyMoment } from "./overviewShared";



const fmtDate = lastActiveLabel;


/** What this student needs from the counselor: their own milestones, plus
 *  the reference's two non-milestone rules (an undecided senior, an active
 *  support flag). `review` marks the ones the Review Queue can act on. */
type NeedsYou = { text: string; key?: MilestoneKey; review?: boolean; overdue?: boolean; changes?: boolean; alert?: boolean };
function needsYou(s: CounselorStudent, keys: MilestoneKey[]): NeedsYou[] {
  const out: NeedsYou[] = [];
  for (const k of keys) {
    if (s.milestones[k] === "Pending Review") out.push({ text: `Review ${k}`, key: k, review: true });
    else if (s.milestones[k] === "Overdue") out.push({ text: `${k} overdue`, key: k, overdue: true, alert: true });
    else if (s.milestones[k] === "Changes Requested") out.push({ text: `${k} awaiting resubmission`, key: k, changes: true });
  }
  if (s.grade === 12 && s.postsecondaryIntent === "Undecided") out.push({ text: "Postsecondary plan not finalized", alert: true });
  return out;
}

// Attention first, done last, so the grid reads as a to-do list.
const MILESTONE_RANK: Record<MilestoneStatus, number> = { Overdue: 0, "Changes Requested": 1, "Pending Review": 2, "In Progress": 3, "Not Started": 4, "Not Applicable": 6, Approved: 5, Completed: 5 };

type ProfileTab = "overview" | "plan" | "activity" | "notes" | "drafts";


import { GLASS_CARD as TINTED_CARD } from "../surfaces";



function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="v4-tool-button dm-quiet flex h-9 cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <Icon className="h-[15px] w-[15px]" aria-hidden />
      {label}
    </button>
  );
}

function CardHead({ icon: Icon, title, accent = "var(--primary)" }: { icon: typeof Bell; title: string; accent?: string }) {
  return (
    <span className="flex items-center gap-[10px]">
      <span className="flex size-[30px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
        <Icon className="h-[15px] w-[15px]" aria-hidden />
      </span>
      <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
    </span>
  );
}

/** v4's metric tile, with the number as a button when the tile opens a
 *  list (8 Oct 2026 audit: Careers saved, Colleges saved and Questions
 *  submitted were counts with nothing behind them). */
function ActivityTile({ icon: Icon, value, label, description, onOpen }: { icon: typeof Bell; value: string; label: string; description?: string; onOpen?: () => void }) {
  return (
    <div className="v4-metric-detail">
      <span className="v4-metric-label"><Icon className="size-4" aria-hidden />{label}{description && <IconTip label={description}><button type="button" aria-label={`About ${label}`} className="v4-metric-help"><Info size={13} /></button></IconTip>}</span>
      {onOpen ? (
        <button type="button" onClick={onOpen} aria-label={`${label}: ${value}. Open the list`} className="dm-quiet group flex w-fit cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] text-left"><strong>{value}</strong><Go className="opacity-60 transition-opacity group-hover:opacity-100" /></button>
      ) : <strong>{value}</strong>}
    </div>
  );
}

/** A career by its title, in the shape the career sheet opens. */
function careerByTitle(title: string): CatalogCareer | undefined {
  const t = title.toLowerCase();
  const c = ALL_CATALOG_CAREERS.find((x) => x.title.toLowerCase() === t) ?? ALL_PROFILE_CAREERS.find((x) => x.title.toLowerCase() === t);
  return c ? { title: c.title, world: c.world, photo: c.photo } : undefined;
}

function readLocalList(key: string): string[] {
  try { const v = JSON.parse(window.localStorage.getItem(key) ?? "[]"); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; } catch { return []; }
}

/** The careers this student saved: the live student's own list, else the
 *  roster's seeded picks (counselorV5's savedFor, the same list v5 shows). */
function savedCareers(s: CounselorStudent): CatalogCareer[] {
  const ids = s.id === "real-student" && typeof window !== "undefined" ? readLocalList("dreamari-saved-careers") : toV5(s).dreamari.saved;
  return ids.map((id) => careerById(id)).filter((c) => !!c).map((c) => ({ title: c!.title, world: c!.world, photo: c!.photo }));
}

/** DEMO-ONLY: the roster stores a saved-college COUNT, not which schools;
 *  pick that many, rotated per student, until the student app's saved
 *  colleges reach the counselor. The live student's own list is real. */
function savedColleges(s: CounselorStudent, count: number): College[] {
  if (s.id === "real-student" && typeof window !== "undefined") return readLocalList("dm-colleges-saved").map((slug) => COLLEGES.find((c) => c.slug === slug)).filter((c): c is College => !!c);
  const h = seedHash(s.id);
  const step = 7 + (h % 5);
  return Array.from({ length: Math.min(count, 8) }, (_, i) => COLLEGES[(h + i * step) % COLLEGES.length]).filter((c, i, all) => all.indexOf(c) === i);
}

type ActivityList = "careers" | "colleges" | "questions";

// DEMO-ONLY: the roster counts a student's questions but Connect holds only
// the 15 seeded ones, so the rest of the count is filled with earlier,
// answered questions until the question history comes from the backend.
const EARLIER_QUESTIONS: { text: string; tag: string }[] = [
  { text: "How do I sign up for the SAT?", tag: "Testing" },
  { text: "Can I switch out of my elective?", tag: "Course Selection" },
  { text: "When is the next college fair?", tag: "School Search" },
  { text: "What do I need for a work permit?", tag: "Career Exploration" },
  { text: "Can you check my resume before I apply for a job?", tag: "Resume" },
  { text: "Is there tutoring for algebra?", tag: "Academic Planning" },
  { text: "How many volunteer hours do I need?", tag: "Graduation" },
  { text: "Who should write my recommendation letters?", tag: "Recommendations" },
];
function earlierQuestions(s: CounselorStudent, n: number): { id: string; text: string; tag: string; date: string }[] {
  const h = seedHash(`${s.id}:questions`);
  return Array.from({ length: Math.max(0, Math.min(n, EARLIER_QUESTIONS.length)) }, (_, i) => {
    const q = EARLIER_QUESTIONS[(h + i * 3) % EARLIER_QUESTIONS.length];
    const d = new Date(2026, 8, 5 - i * 9 - (h % 4));
    return { id: `earlier-${i}`, ...q, date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  }).filter((q, i, all) => all.findIndex((x) => x.text === q.text) === i);
}

export function StudentProfileView({ studentId }: { studentId: string }) {
  const router = useRouter();
  const decisions = useReviewDecisions();
  const reminders = useReminders();
  const connect = useConnectLive();
  const [activityList, setActivityList] = useState<ActivityList | null>(null);
  const student = getReviewedStudentById(studentId);
  const careers = useMemo(() => (student ? savedCareers(student) : []), [student]);
  const [notes, setNotes] = useState(() => readNotes(studentId));
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [moreOpen, setMoreOpen] = useState(false);


  if (!student) {
    return (
      <div className="flex flex-col items-center gap-[10px] rounded-[var(--radius-lg)] border py-[60px] text-center" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
        <DreamyMoment mood="explore" size={72} />
        <p style={{ color: "var(--muted-foreground)" }}>Student not found.</p>
        <button type="button" onClick={() => goBackOr(router, "/counselor?view=students")} className="dm-link text-[13px] font-bold" style={{ color: "var(--primary)" }}>Back to Students</button>
      </div>
    );
  }

  const gradeKeys = milestonesForGrade(student.grade);
  const approvedCount = gradeKeys.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length;
  const actions = needsYou(student, gradeKeys);
  const signals = signalsFor(student);
  const orderedKeys = [...gradeKeys].sort((a, b) => MILESTONE_RANK[student.milestones[a]] - MILESTONE_RANK[student.milestones[b]]);
  const topMatch = student.topMatches[0]?.title;
  const art = careerArtFor(topMatch);

  // The reference's eight On Dreamari tiles, live from the student app
  // where a live signal exists, then v2's three extra signals folded below.
  const engagement = [
    { icon: Sparkles, value: String(signals.dreamScore), label: "Dream Score", description:"Experience points earned by completing student-app milestones." },
    { icon: Sunrise, value: String(student.engagement.dailyDropsCompleted), label: "Daily Drops completed", description:"Completed daily learning activities in the student app." },
    { icon: Gamepad2, value: String(signals.simulationsCompleted), label: "Career simulations", description:"Career simulations the student has completed." },
    { icon: Bookmark, value: String(signals.careersSaved), label: "Careers saved", description:"Careers bookmarked by the student.", list: "careers" as ActivityList },
    { icon: Landmark, value: String(signals.collegesSaved), label: "Schools saved", description:"Schools on the student’s saved list.", list: "colleges" as ActivityList },
    { icon: Trophy, value: String(signals.glossaryLessonsCompleted), label: "Career challenges", description:"Completed glossary and career-learning lessons." },
    { icon: HelpCircle, value: String(student.engagement.questionsSubmitted), label: "Questions submitted", description:"Questions the student has submitted to their counselor.", list: "questions" as ActivityList },
    { icon: MessageCircle, value: String(student.engagement.communityPosts), label: "Community posts", description:"Posts the student has contributed to the community." },
  ];
  const engagementMore = [
    { icon: FileText, value: signals.resumeAtsScore === null ? "None" : String(signals.resumeAtsScore), label: "Resume score", description:"Latest resume ATS review score, out of 100. None means no review yet." },
    { icon: Briefcase, value: String(signals.reportVersions), label: "Career report versions", description:"Saved versions of the student’s career report." },
    { icon: BookOpen, value: String(signals.experiencesLogged), label: "Experiences logged", description:"Work, volunteering, projects and other experiences recorded by the student." },
  ];

  const colleges = savedColleges(student, signals.collegesSaved);
  const questions = QUESTIONS.filter((q) => q.name === student.name);
  const earlier = earlierQuestions(student, student.engagement.questionsSubmitted - questions.length);
  const reviewHref = (k: MilestoneKey) => `/counselor?view=review-queue&studentId=${encodeURIComponent(student.id)}&milestone=${encodeURIComponent(k)}&v=4`;
  const listRow = "dm-quiet group flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[6px] py-[8px] text-left";

  const openNote = () => {
    setTab("notes");
    window.setTimeout(() => document.getElementById("counselor-note-input")?.focus(), 50);
  };

  return (
    <div className="v4-page v4-profile flex flex-col gap-[var(--space-5)]">
      <div className="v4-profile-toolbar flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => goBackOr(router, "/counselor?view=students")} className="dm-quiet flex cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Students
        </button>
        <div className="flex flex-wrap items-center gap-[8px]">
          <ActionButton icon={MessageSquare} label="Message" onClick={() => router.push(`/counselor?view=connect&compose=1&ids=${student.id}&v=4`)} />
          <ActionButton icon={StickyNote} label="Note" onClick={openNote} />
        </div>
      </div>

      {/* Identity, calm: who, one status, and what they need from you --
         nothing that the tabs below already say (direct feedback on the
         first pass: "the student profile header is making my head spin. So
         many signals all at once"). Student number, school and DOB live in
         About the student; the milestone count lives on the Milestones card;
         the support flag is one of the "Needs you" items, not its own banner. */}
      <HoverBeam strength={0.6} className="v4-profile-identity h-full">
        <div className="v4-profile-summary v4-surface relative flex flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="relative z-[1] flex min-w-0 items-center gap-[14px]">
            <Avatar name={student.name} size={56} index={student.avatarIndex} />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <h1 className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{student.name}</h1>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.careerTrack} · active {fmtDate(student.lastActive).toLowerCase()}</span>
            </div>
            <StatusChip status={student.status} />
          </div>
          {(actions.length > 0 || student.supportFlagReason) && (
            <ul className="relative z-[1] flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
              {actions.map((a) => {
                // the last reminder and the last feedback, so the profile
                // says what was already done (8 Oct 2026 audit)
                const reminded = a.overdue && a.key ? lastReminder(reminders, student.id, a.key) : undefined;
                const feedback = a.changes && a.key ? decisions[reviewItemId(student.id, a.key)]?.feedback : undefined;
                return (
                  <li key={a.text} className="flex flex-col gap-[2px]">
                    <span className="flex items-center justify-between gap-[10px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                      <span className="flex items-center gap-[8px]">
                        <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: a.alert ? "var(--v4-risk)" : "var(--primary)" }} />
                        {a.text}
                      </span>
                      <span className="flex flex-none items-center gap-[10px]">
                        {a.review && a.key && <CardLink onClick={() => router.push(reviewHref(a.key!))}>Review</CardLink>}
                        {a.overdue && a.key && <CardLink onClick={() => sendReminder(student.id, a.key!, student.name)}>{reminded ? "Remind again" : "Send a reminder"}</CardLink>}
                      </span>
                    </span>
                    {reminded && <span className="pl-[15px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Reminded {reminderDate(reminded)}</span>}
                    {feedback && <span className="pl-[15px] text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>My feedback: &ldquo;{feedback}&rdquo;</span>}
                  </li>
                );
              })}
              {student.supportFlagReason && (
                <li className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  <Flag aria-hidden className="h-[13px] w-[13px] flex-none" style={{ color: "var(--v4-warn)" }} />
                  {/* The reference's flag text uses em dashes; shown with a comma (no em dashes in UI copy). */}
                  {student.supportFlagReason.replace(/\s*[\u2014\u2013]\s*/g, ", ")}
                </li>
              )}
            </ul>
          )}
          {/* The student's top career match as the student app's own poster,
             faded in like the Career & College focus card: from the right on a wide row, as a cover behind the portrait in the desktop sidebar
             (Maisha, 7 Oct 2026: "loves the Explore cards art"; "draw it a
             little closer to the student experience"). Decorative; the
             match itself is named in the line below the name. Last child so the
             sidebar layout's `>div:first-child` rules still apply. */}
          {art && <span aria-hidden className="v4-career-art" style={{ backgroundImage: `url(${art.src})`, backgroundPosition: art.position }} />}
        </div>
      </HoverBeam>

      {/* Everything else, one group at a time (direct instruction: "organise
         and consolidate similar functions together into different tabs, the
         drafts, recommendation etc dont need to be on the main page"). */}
      <SubTabs
        ariaLabel="Student profile section"
        options={[
          { key: "overview", label: "Overview" },
          { key: "plan", label: "Plan" },
          { key: "activity", label: "Activity" },
          { key: "notes", label: "Notes" },
          { key: "drafts", label: "Drafts" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as ProfileTab)}
      />

      {tab === "overview" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <HoverBeam strength={0.6} className="h-full">
            <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <span className="flex flex-wrap items-baseline gap-x-[8px]">
                <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Milestones</h2>
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{approvedCount} of {gradeKeys.length} complete</span>
              </span>
              <div className="v4-student-milestone-list">
                {orderedKeys.map((key) => (
                  <span key={key} className="v4-student-milestone-row" style={GLASS_INSET}>
                    <span className="truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{key}</span>
                    <MilestoneChip status={student.milestones[key]} />
                  </span>
                ))}
              </div>
            </div>
          </HoverBeam>
          {/* the calendar and the family, beside each other. The week's
             check-in card left with check-ins (9 Oct 2026, Maisha: remove
             them "from the demo") */}
          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            <HoverBeam strength={0.6} className="h-full"><MeetingsCard student={student} /></HoverBeam>
            <HoverBeam strength={0.6} className="h-full"><FamilyCard student={student} /></HoverBeam>
          </div>
          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            <HoverBeam strength={0.6} className="h-full">
              <div className="v4-surface flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <CardHead icon={BookOpen} title="About the Student" />
                <dl className="flex flex-col gap-[12px] text-[13px]">
                  {[
                    { icon: GraduationCap, label: "Education goals", value: student.educationGoals.join(" → ") },
                    { icon: Target, label: "Favorite career cluster", value: student.careerCluster },
                    { icon: Compass, label: "Postsecondary plan", value: student.postsecondaryIntent === "Undecided" ? "Undecided" : student.postsecondaryIntent },
                    { icon: BookOpen, label: "Student", value: `${student.tag} · ${student.school} · born ${student.dob}` },
                  ].map((r) => (
                    // dl > div > dt + dd (the only grouping a <dl> allows; the
                    // icon rides inside the dt), an axe fix from this pass.
                    <div key={r.label} className="relative flex flex-col gap-[1px] pl-[25px]">
                      <dt className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}><r.icon className="absolute top-[2px] left-0 h-[15px] w-[15px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />{r.label}</dt>
                      <dd className="font-semibold" style={{ color: "var(--foreground)" }}>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </HoverBeam>
            <HoverBeam strength={0.6} className="h-full">
              <div className="v4-surface flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <CardHead icon={Target} title="Top 5 Career Matches" />
                <div className="flex flex-col gap-[10px]">
                  {student.topMatches.map((m, i) => {
                    // each match opens its career sheet (8 Oct 2026 audit)
                    const career = careerByTitle(m.title);
                    const row = student.topMatches.map((x) => careerByTitle(x.title)).filter((c): c is CatalogCareer => !!c);
                    const body = (
                      <>
                        <span className="flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>{i + 1}</span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
                          <span className="flex items-center justify-between text-[13px] font-semibold">
                            <span style={{ color: "var(--foreground)" }}>{m.title}</span>
                            <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{m.pct}%</span>
                          </span>
                          <span className="relative block h-[6px] overflow-hidden rounded-[3px]" style={{ background: "var(--inset-border)" }}>
                            <span className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${m.pct}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 35%, transparent), var(--primary))" }} />
                          </span>
                        </span>
                      </>
                    );
                    return career ? (
                      <button key={m.title} type="button" onClick={() => openCareer(career, row)} aria-label={`${m.title}, ${m.pct}% match. Open the career`} className="dm-quiet -mx-[6px] flex cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[2px] text-left">{body}</button>
                    ) : <div key={m.title} className="flex items-center gap-[12px]">{body}</div>;
                  })}
                  {student.topMatches.length === 0 && <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No saved matches yet.</p>}
                </div>
              </div>
            </HoverBeam>
          </div>
        </div>
      )}

      {tab === "plan" && (
        <div className="v4-student-plan">
          <HoverBeam strength={0.6} className="h-full"><TodosCard student={student} /></HoverBeam>
          <HoverBeam strength={0.6} className="h-full"><PlanSignoffCard student={student} /></HoverBeam>
        </div>
      )}

      {tab === "activity" && (
        <div className="flex flex-col gap-[var(--space-4)]">
        <HoverBeam strength={0.6} className="h-full">
          <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Sparkles} title="On Dreamari" />
            <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
              {engagement.map((e) => <ActivityTile key={e.label} icon={e.icon} value={e.value} label={e.label} description={e.description} onOpen={e.list ? () => setActivityList(e.list) : undefined} />)}
            </div>
            <Disclosure id="profile-more-activity" title="More From the Student App" open={moreOpen} onToggle={() => setMoreOpen((v) => !v)}>
              <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
                {engagementMore.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} description={e.description} accent="var(--primary)" />)}
              </div>
            </Disclosure>
          </div>
        </HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><MessagesCard student={student} /></HoverBeam>
        </div>
      )}

      {tab === "notes" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="v4-surface flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={StickyNote} title="Notes" />
            <div className="flex flex-col gap-[8px]">
              <textarea
                id="counselor-note-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="A note about this student"
                rows={2}
                className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              />
              <button
                type="button"
                disabled={draft.trim().length === 0}
                onClick={() => {
                  setNotes(addNote(studentId, draft.trim()));
                  setDraft("");
                }}
                className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 w-fit cursor-pointer items-center justify-center self-end rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add note
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No notes yet.</p>
            ) : (
              <ul className="flex flex-col gap-[8px]">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                    <p className="text-[13px]" style={{ color: "var(--foreground)" }}>{n.text}</p>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "drafts" && (
        <HoverBeam strength={0.6} className="h-full">
          <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Sparkles} title="Drafts" />
            <DraftTools student={student} />
          </div>
        </HoverBeam>
      )}

      {/* the lists behind three Activity tiles */}
      <SidePanel open={activityList !== null} onClose={() => setActivityList(null)} title={activityList === "careers" ? "Careers Saved" : activityList === "colleges" ? "Schools Saved" : "Questions Submitted"} subtitle={student.name}>
        {activityList === "careers" && (careers.length ? (
          <ul className="flex flex-col gap-[2px]">
            {careers.map((c) => <li key={c.title}><button type="button" onClick={() => { setActivityList(null); openCareer(c, careers); }} className={listRow}><Bookmark className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} /><span className="flex min-w-0 flex-1 flex-col leading-tight"><span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.title}</span><span className="truncate text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.world}</span></span><Go className="flex-none opacity-0 transition-opacity group-hover:opacity-100" /></button></li>)}
            {signals.careersSaved > careers.length && <li className="px-[6px] pt-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>The latest {careers.length} of {signals.careersSaved}</li>}
          </ul>
        ) : <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No careers saved yet.</p>)}
        {activityList === "colleges" && (colleges.length ? (
          <ul className="flex flex-col gap-[2px]">
            {colleges.map((c) => <li key={c.slug}><button type="button" onClick={() => { setActivityList(null); openSchool(c, colleges); }} className={listRow}><Landmark className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} /><span className="flex min-w-0 flex-1 flex-col leading-tight"><span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span><span className="truncate text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.city}, {c.state}</span></span><Go className="flex-none opacity-0 transition-opacity group-hover:opacity-100" /></button></li>)}
            {signals.collegesSaved > colleges.length && <li className="px-[6px] pt-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>The latest {colleges.length} of {signals.collegesSaved}</li>}
          </ul>
        ) : <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No schools saved yet.</p>)}
        {activityList === "questions" && (questions.length + earlier.length ? (
          <ul className="flex flex-col gap-[2px]">
            {questions.map((q) => {
              const st = connect.statusOf(q.id);
              const open = st !== "responded" && st !== "resolved";
              return <li key={q.id}><button type="button" onClick={() => router.push(`/counselor?view=connect&question=${q.id}&v=4`)} className={listRow}><HelpCircle className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} /><span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-tight"><span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{q.question}</span><span className="text-[12px] font-semibold" style={{ color: open ? STATUS_COLORS["Needs Attention"] : "var(--muted-foreground)" }}>{open ? "Needs a reply" : "Answered"} · {q.tag}</span></span><Go className="flex-none opacity-0 transition-opacity group-hover:opacity-100" /></button></li>;
            })}
            {earlier.map((q) => (
              <li key={q.id} className="flex items-center gap-[10px] px-[6px] py-[8px]">
                <HelpCircle className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-tight"><span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{q.text}</span><span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Answered {q.date} · {q.tag}</span></span>
              </li>
            ))}
          </ul>
        ) : <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No questions yet.</p>)}
      </SidePanel>
    </div>
  );
}
