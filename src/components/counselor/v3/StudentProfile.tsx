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

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sisFor } from "@/lib/counselorSis";
import { ProfileAcademics, ProfileApplications, SchoolRecordStrip } from "./ProfileAcademics";
import { SidePanel } from "./SidePanel";
import { addSend } from "@/lib/counselorCasefile";
import { logTime } from "@/lib/counselorTimeLog";
import { MeetingForm } from "./MeetingForm";
import { ChevronLeft, CalendarPlus, Bell, MessageSquare, StickyNote, Target, GraduationCap, BookOpen, Flag, Compass, Sparkles, MoreHorizontal } from "lucide-react";
import { BarChart, Ring, Segmented } from "@/components/connect/viz";
import { IconTip } from "@/components/app/IconTip";
import { PRIMARY } from "../palette";
import { BTN_PRIMARY } from "./kit";
import { HoverBeam } from "@/components/app/HoverBeam";
import { lastActiveLabel, milestonesForGrade, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { PLAN_PROGRESS_3MO } from "@/lib/counselorProfileData";
import { getReviewedStudentById, useReviewDecisions } from "@/lib/counselorReviews";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar, CardLink } from "../chips";
import { signalsFor } from "@/lib/studentSignals";
import { DraftTools } from "./ProductivitySuite";
import { Disclosure } from "./Disclosure";
import { CheckinsCard, PlanSignoffCard, TodosCard } from "./Casefile";
import { GLASS_INSET } from "../surfaces";



const fmtDate = lastActiveLabel;


/** What this student needs from the counselor beyond their milestones: the
 *  reference's undecided-senior rule (the support flag renders on its own).
 *  2 Oct 2026 redundancy pass: "Review X", "X overdue" and "X awaiting
 *  resubmission" are gone from here; they repeated the Milestones card's
 *  chips on the same tab. That card leads with them and carries the one
 *  Review link. */
function needsYou(s: CounselorStudent): { text: string; alert?: boolean }[] {
  return s.grade === 12 && s.postsecondaryIntent === "Undecided" ? [{ text: "Postsecondary plan not finalized", alert: true }] : [];
}

/** The reference's static next-3-months list, each item tied to the
 *  milestone it is, so its status is the student's own (2 Oct 2026: the
 *  static "FAFSA Submission: Not Started" could contradict an approved
 *  Financial Aid milestone). Items outside the student's grade are left out. */
const PLAN_ITEM_MILESTONE: Record<string, MilestoneKey> = {
  "College Application Essays": "Applications",
  "FAFSA Submission": "Financial Aid",
  "Recommendation Letter Request": "Recommendation Letter",
  "Transcript Submission": "Transcript Submission",
};

// Attention first, done last, so the grid reads as a to-do list.
const MILESTONE_RANK: Record<MilestoneStatus, number> = { Overdue: 0, "Changes Requested": 1, "Pending Review": 2, "In Progress": 3, "Not Started": 4, "Not Applicable": 6, Approved: 5, Completed: 5 };

// 2 Oct 2026 redundancy pass: seven tabs became five. Activity folded into
// Overview (it was one card); Drafts and Check-ins live under Notes (the
// written record of the student). The Plan tab's 6- and 12-month sub-tabs
// held only placeholder sentences and are gone.
type ProfileTab = "overview" | "academics" | "applications" | "plan" | "notes";
const PROFILE_TABS: ProfileTab[] = ["overview", "academics", "applications", "plan", "notes"];

import { GLASS_CARD as TINTED_CARD } from "../surfaces";

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dm-quiet flex h-9 cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
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

export function StudentProfileView({ studentId }: { studentId: string }) {
  const router = useRouter();
  useReviewDecisions();
  const student = getReviewedStudentById(studentId);
  const [notes, setNotes] = useState(() => readNotes(studentId));
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  // v3: `?tab=academics` (from Academics and search) opens that tab.
  const params = useSearchParams();
  const wanted = params.get("tab") as ProfileTab | null;
  const [tab, setTab] = useState<ProfileTab>(wanted && PROFILE_TABS.includes(wanted) ? wanted : "overview");
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  // The header's overflow menu (Remind lives here, 2 Oct 2026).
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const away = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [menu]);


  if (!student) {
    return (
      <div className="flex flex-col items-center gap-[10px] rounded-[var(--radius-lg)] border py-[60px] text-center" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Student not found.</p>
        <button type="button" onClick={() => router.push("/counselor?view=students")} className="dm-link text-[13px] font-bold" style={{ color: "var(--primary)" }}>Back to Students</button>
      </div>
    );
  }

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  };

  const gradeKeys = milestonesForGrade(student.grade);
  const approvedCount = gradeKeys.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length;
  // v3: the school record's most serious signals lead "Needs you".
  const actions = [...sisFor(student).flags.filter((f) => f.severity === 3).slice(0, 2).map((f) => ({ text: f.text, alert: true })), ...needsYou(student)];
  const hasReview = gradeKeys.some((k) => student.milestones[k] === "Pending Review");
  const planItems = PLAN_PROGRESS_3MO.filter((t) => gradeKeys.includes(PLAN_ITEM_MILESTONE[t.name])).map((t) => ({ ...t, status: student.milestones[PLAN_ITEM_MILESTONE[t.name]] }));
  const signals = signalsFor(student);
  const orderedKeys = [...gradeKeys].sort((a, b) => MILESTONE_RANK[student.milestones[a]] - MILESTONE_RANK[student.milestones[b]]);

  // On Dreamari, 2 Oct 2026 redundancy pass: eleven icon tiles became two
  // rings and one chart. Dream Score and Resume score are 0 to 100 scores
  // (progress to a full mark: rings). The nine counts are the same kind of
  // thing (things the student did in the app), so they share one column
  // chart instead of nine title-and-number tiles. Order is fixed, not
  // ranked, so a student's chart reads the same way every visit. Labels are
  // short so nine fit on one axis.
  const counts: [string, number][] = [
    ["Drops", student.engagement.dailyDropsCompleted],
    ["Simulations", signals.simulationsCompleted],
    ["Careers", signals.careersSaved],
    ["Colleges", signals.collegesSaved],
    ["Challenges", signals.glossaryLessonsCompleted],
    ["Posts", student.engagement.communityPosts],
    ["Questions", student.engagement.questionsSubmitted],
    ["Reports", signals.reportVersions],
    ["Experiences", signals.experiencesLogged],
  ];
  const countMax = Math.max(4, Math.ceil(Math.max(...counts.map((c) => c[1])) / 4) * 4);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => router.push("/counselor?view=students")} className="dm-quiet flex cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Students
        </button>
        {/* 2 Oct 2026 redundancy pass: four header buttons became two and a
           menu. Log meeting is the primary; Message opens Counselor Connect
           addressed to this student; Remind (a real reminder plus its two
           logged minutes) moved under More; Note is gone (it only opened
           the Notes tab, one click away). */}
        <div className="flex flex-wrap items-center gap-[8px]">
          <button type="button" onClick={() => setLogging(true)} className={BTN_PRIMARY}>
            <CalendarPlus className="h-[15px] w-[15px]" aria-hidden /> Log meeting
          </button>
          <ActionButton icon={MessageSquare} label="Message" onClick={() => router.push(`/counselor?view=connect&compose=1&ids=${student.id}`)} />
          <div ref={menuRef} className="relative">
            <IconTip label="More" off={menu}>
              <button type="button" aria-label="More actions" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <MoreHorizontal className="h-[16px] w-[16px]" aria-hidden />
              </button>
            </IconTip>
            {menu && (
              <div role="menu" className="absolute top-[calc(100%+6px)] right-0 z-30 flex min-w-[190px] flex-col rounded-[var(--radius-md)] border p-[4px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 14px 30px -16px rgba(0,0,0,0.7)" }}>
                <button type="button" role="menuitem" onClick={() => { setMenu(false); addSend({ kind: "reminder", text: "Your counselor would like to check in this week. Stop by office hours or book a time in Dreamari.", studentIds: [student.id], audience: student.name }); logTime({ activity: `Reminder, ${student.name}`, minutes: 2, kind: "indirect", studentId: student.id }); flash(`Reminder sent to ${student.name.split(" ")[0]}.`); }} className="dm-quiet flex h-9 cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] px-[10px] text-left text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  <Bell className="h-[15px] w-[15px]" aria-hidden /> Send a reminder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="rounded-[var(--radius-md)] border px-[14px] py-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 12%, var(--card))", color: "var(--foreground)" }}>
          {toast}
        </div>
      )}

      {/* Identity, calm: who, one status, and what they need from you --
         nothing that the tabs below already say (direct feedback on the
         first pass: "the student profile header is making my head spin. So
         many signals all at once"). Student number, school and DOB live in
         About the student; the milestone count lives on the Milestones card;
         the support flag is one of the "Needs you" items, not its own banner. */}
      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex min-w-0 items-center gap-[14px]">
            <Avatar name={student.name} size={56} index={student.avatarIndex} />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{student.name}</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.careerTrack} · active {fmtDate(student.lastActive).toLowerCase()}</span>
            </div>
            <StatusChip status={student.status} />
          </div>
          {(actions.length > 0 || student.supportFlagReason) && (
            <ul className="flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
              {actions.map((a) => (
                <li key={a.text} className="flex items-center justify-between gap-[10px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  <span className="flex items-center gap-[8px]">
                    <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: a.alert ? "var(--cd-red)" : "var(--primary)" }} />
                    {a.text}
                  </span>
                </li>
              ))}
              {student.supportFlagReason && (
                <li className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  <Flag aria-hidden className="h-[13px] w-[13px] flex-none" style={{ color: "var(--cd-amber)" }} />
                  {/* The reference's flag text uses em dashes; shown with a comma (no em dashes in UI copy). */}
                  {student.supportFlagReason.replace(/\s*[\u2014\u2013]\s*/g, ", ")}
                </li>
              )}
            </ul>
          )}
        </div>
      </HoverBeam>

      {/* Everything else, one group at a time (direct instruction: "organise
         and consolidate similar functions together into different tabs, the
         drafts, recommendation etc dont need to be on the main page"). */}
      <Segmented
        ariaLabel="Student profile section"
        options={[
          { key: "overview", label: "Overview" },
          { key: "academics", label: "Academics" },
          ...(student.grade === 12 ? [{ key: "applications", label: "Applications" }] : []),
          { key: "plan", label: "Plan" },
          { key: "notes", label: "Notes" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as ProfileTab)}
      />

      {tab === "academics" && <ProfileAcademics student={student} />}
      {tab === "applications" && <ProfileApplications student={student} />}

      {tab === "overview" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <SchoolRecordStrip student={student} onOpen={() => setTab("academics")} />
          <HoverBeam strength={0.6} className="h-full">
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <span className="flex flex-wrap items-center justify-between gap-x-[8px] gap-y-[6px]">
                <span className="flex flex-wrap items-baseline gap-x-[8px]">
                  <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Milestones</h2>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{approvedCount} of {gradeKeys.length} done · roadmap {student.roadmapPct}%</span>
                </span>
                {hasReview && <CardLink onClick={() => router.push("/counselor?view=review-queue")}>Review</CardLink>}
              </span>
              <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2 lg:grid-cols-3">
                {orderedKeys.map((key) => (
                  <span key={key} className="flex items-center justify-between gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
                    <span className="truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{key}</span>
                    <MilestoneChip status={student.milestones[key]} />
                  </span>
                ))}
              </div>
            </div>
          </HoverBeam>
          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            <HoverBeam strength={0.6} className="h-full">
              <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <CardHead icon={BookOpen} title="About the student" />
                <dl className="flex flex-col gap-[12px] text-[13px]">
                  {[
                    { icon: GraduationCap, label: "Education goals", value: student.educationGoals.join(" → ") },
                    { icon: Target, label: "Favorite career cluster", value: student.careerCluster },
                    { icon: Compass, label: "Postsecondary plan", value: student.postsecondaryIntent === "Undecided" ? "Undecided" : student.postsecondaryIntent },
                    { icon: BookOpen, label: "Student", value: `${student.tag} · ${student.school} · born ${student.dob}` },
                  ].map((r) => (
                    <span key={r.label} className="flex items-start gap-[10px]">
                      <r.icon className="mt-[2px] h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                      <span className="flex flex-col gap-[1px]">
                        <dt className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.label}</dt>
                        <dd className="font-semibold" style={{ color: "var(--foreground)" }}>{r.value}</dd>
                      </span>
                    </span>
                  ))}
                </dl>
              </div>
            </HoverBeam>
            <HoverBeam strength={0.6} className="h-full">
              <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <CardHead icon={Target} title="Top 5 career matches" />
                <div className="flex flex-col gap-[10px]">
                  {student.topMatches.map((m, i) => (
                    <div key={m.title} className="flex items-center gap-[12px]">
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
                    </div>
                  ))}
                  {student.topMatches.length === 0 && <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No saved matches yet.</p>}
                </div>
              </div>
            </HoverBeam>
          </div>
          <HoverBeam strength={0.6} className="h-full">
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <CardHead icon={Sparkles} title="On Dreamari" />
              <div className="grid grid-cols-1 items-center gap-[var(--space-5)] md:grid-cols-[auto_minmax(0,1fr)]">
                <div className="flex justify-center gap-[var(--space-5)] md:flex-col">
                  <ScoreRing label="Dream Score" value={signals.dreamScore} />
                  <ScoreRing label="Resume score" value={signals.resumeAtsScore} />
                </div>
                <BarChart barStyle="solid" height={190} groups={counts.map((c) => c[0])} series={[{ label: "Activity", accent: PRIMARY, values: counts.map((c) => c[1]) }]} max={countMax} valueSuffix="" maxBarWidth={26} />
              </div>
            </div>
          </HoverBeam>
        </div>
      )}

      {tab === "plan" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <HoverBeam strength={0.6} className="h-full">
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <span className="flex flex-wrap items-baseline gap-x-[8px]">
                <CardHead icon={Target} title="Plan progress" />
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>next 3 months</span>
              </span>
              {planItems.length === 0 ? (
                <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Nothing due in the next 3 months.</p>
              ) : (
                <ul className="flex flex-col gap-[8px]">
                  {planItems.map((t) => (
                    <li key={t.name} className="flex items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[11px]" style={GLASS_INSET}>
                      <span className="flex min-w-0 flex-col gap-[2px]">
                        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{t.name}</span>
                        <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Due {fmtDate(t.due)}</span>
                      </span>
                      <MilestoneChip status={t.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </HoverBeam>
          <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
            <HoverBeam strength={0.6} className="h-full"><PlanSignoffCard student={student} /></HoverBeam>
            <HoverBeam strength={0.6} className="h-full"><TodosCard student={student} /></HoverBeam>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
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
          <HoverBeam strength={0.6} className="h-full"><CheckinsCard student={student} /></HoverBeam>
          {/* Drafts, folded under Notes (was its own tab until 2 Oct 2026). */}
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <Disclosure id="profile-drafts" variant="card" title={<CardHead icon={Sparkles} title="Drafts" />} summary="Letters, briefs and plans" open={draftsOpen} onToggle={() => setDraftsOpen((v) => !v)}>
              <DraftTools student={student} />
            </Disclosure>
          </div>
        </div>
      )}
      <SidePanel open={logging} onClose={() => setLogging(false)} title={`Log a meeting with ${student.name.split(" ")[0]}`} subtitle="A walk-in, or book one ahead">
        <MeetingForm student={student} onDone={(msg) => { setLogging(false); flash(msg); setNotes(readNotes(student.id)); }} />
      </SidePanel>
    </div>
  );
}

/** A 0 to 100 score as a ring, the number inside, the name under. */
function ScoreRing({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="flex flex-col items-center gap-[6px]">
      <Ring pct={value ?? 0} size={76} stroke={7} accent={PRIMARY}>
        <span className="text-[17px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: value === null ? "var(--muted-foreground)" : "var(--foreground)" }}>{value ?? "none"}</span>
      </Ring>
      <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}
