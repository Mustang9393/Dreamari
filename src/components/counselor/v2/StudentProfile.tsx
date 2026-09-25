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

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Bell, MessageSquare, StickyNote, Target, GraduationCap, BookOpen, Flag, Compass,
  Sparkles, Sunrise, Gamepad2, Bookmark, Landmark, Trophy, HelpCircle, MessageCircle, FileText, Briefcase,
} from "lucide-react";
import { MetricTile, Ring, Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { milestonesForGrade, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { PLAN_PROGRESS_3MO } from "@/lib/counselorProfileData";
import { getReviewedStudentById, useReviewDecisions } from "@/lib/counselorReviews";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar, CardLink } from "../chips";
import { signalsFor } from "@/lib/studentSignals";
import { DraftTools } from "./ProductivitySuite";
import { Disclosure } from "./Disclosure";
import { CheckinsCard, PlanSignoffCard, TodosCard } from "./Casefile";
import { GLASS_INSET } from "../surfaces";



function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


/** What this student needs from the counselor: their own milestones, plus
 *  the reference's two non-milestone rules (an undecided senior, an active
 *  support flag). `review` marks the ones the Review Queue can act on. */
function needsYou(s: CounselorStudent, keys: MilestoneKey[]): { text: string; review?: boolean; alert?: boolean }[] {
  const out: { text: string; review?: boolean; alert?: boolean }[] = [];
  for (const k of keys) {
    if (s.milestones[k] === "Pending Review") out.push({ text: `Review ${k}`, review: true });
    else if (s.milestones[k] === "Overdue") out.push({ text: `${k} overdue`, alert: true });
    else if (s.milestones[k] === "Changes Requested") out.push({ text: `${k} awaiting resubmission` });
  }
  if (s.grade === 12 && s.postsecondaryIntent === "Undecided") out.push({ text: "Postsecondary plan not finalized", alert: true });
  return out;
}

// Attention first, done last, so the grid reads as a to-do list.
const MILESTONE_RANK: Record<MilestoneStatus, number> = { Overdue: 0, "Changes Requested": 1, "Pending Review": 2, "In Progress": 3, "Not Started": 4, "Not Applicable": 6, Approved: 5, Completed: 5 };

type ProfileTab = "overview" | "plan" | "activity" | "notes" | "drafts";


import { GLASS_CARD as TINTED_CARD } from "../surfaces";

type PlanBucket = "3mo" | "6mo" | "12mo";
const PLAN_TABS: { key: PlanBucket; label: string }[] = [
  { key: "3mo", label: "Next 3 Months" },
  { key: "6mo", label: "Next 6 Months" },
  { key: "12mo", label: "Next 12 Months" },
];

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
  const [planTab, setPlanTab] = useState<PlanBucket>("3mo");
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [moreOpen, setMoreOpen] = useState(false);


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
  const actions = needsYou(student, gradeKeys);
  const signals = signalsFor(student);
  const orderedKeys = [...gradeKeys].sort((a, b) => MILESTONE_RANK[student.milestones[a]] - MILESTONE_RANK[student.milestones[b]]);

  // The reference's eight On Dreamari tiles, live from the student app
  // where a live signal exists, then v2's three extra signals folded below.
  const engagement = [
    { icon: Sparkles, value: String(signals.dreamScore), label: "Dream Score" },
    { icon: Sunrise, value: String(student.engagement.dailyDropsCompleted), label: "Daily Drops completed" },
    { icon: Gamepad2, value: String(signals.simulationsCompleted), label: "Career simulations" },
    { icon: Bookmark, value: String(signals.careersSaved), label: "Careers saved" },
    { icon: Landmark, value: String(signals.collegesSaved), label: "Colleges saved" },
    { icon: Trophy, value: String(signals.glossaryLessonsCompleted), label: "Career challenges" },
    { icon: HelpCircle, value: String(student.engagement.questionsSubmitted), label: "Questions submitted" },
    { icon: MessageCircle, value: String(student.engagement.communityPosts), label: "Community posts" },
  ];
  const engagementMore = [
    { icon: FileText, value: signals.resumeAtsScore === null ? "none" : String(signals.resumeAtsScore), label: "Resume score" },
    { icon: Briefcase, value: String(signals.reportVersions), label: "Career report versions" },
    { icon: BookOpen, value: String(signals.experiencesLogged), label: "Experiences logged" },
  ];

  const openNote = () => {
    setTab("notes");
    window.setTimeout(() => document.getElementById("counselor-note-input")?.focus(), 50);
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => router.push("/counselor?view=students")} className="dm-quiet flex cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Students
        </button>
        <div className="flex flex-wrap items-center gap-[8px]">
          <ActionButton icon={Bell} label="Remind" onClick={() => flash(`Reminder sent to ${student.name}.`)} />
          <ActionButton icon={MessageSquare} label="Message" onClick={() => flash(`Message thread opened with ${student.name}.`)} />
          <ActionButton icon={StickyNote} label="Note" onClick={openNote} />
        </div>
      </div>

      {toast && (
        <div className="rounded-[var(--radius-md)] border px-[14px] py-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 12%, var(--card))", color: "var(--foreground)" }}>
          {toast}
        </div>
      )}

      {/* Identity: who, where they stand, and what they need from you. */}
      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
            <div className="flex min-w-0 items-center gap-[14px]">
              <Avatar name={student.name} size={60} index={student.avatarIndex} />
              <div className="flex min-w-0 flex-col gap-[4px]">
                <span className="flex flex-wrap items-baseline gap-x-[8px]">
                  <span className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{student.name}</span>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{student.tag}</span>
                </span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.school} · DOB {student.dob} · active {fmtDate(student.lastActive)}</span>
                <span className="flex flex-wrap items-center gap-[6px]">
                  <StatusChip status={student.status} />
                  <span className="rounded-full border px-[9px] py-[3px] text-[11.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{student.careerTrack}</span>
                </span>
              </div>
            </div>
            <span className="flex items-center gap-[10px]">
              <Ring pct={(approvedCount / Math.max(1, gradeKeys.length)) * 100} size={64} stroke={6} accent="var(--primary)">
                <span className="text-[14px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{approvedCount}/{gradeKeys.length}</span>
              </Ring>
              <span className="flex flex-col text-[12px] font-semibold leading-[16px]" style={{ color: "var(--muted-foreground)" }}>
                <span>milestones done</span>
                <span>roadmap {student.roadmapPct}%</span>
              </span>
            </span>
          </div>
          {student.supportFlagReason && (
            <span className="flex items-start gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={{ borderColor: "color-mix(in srgb, #F5A623 40%, transparent)", background: "color-mix(in srgb, #F5A623 10%, transparent)" }}>
              <Flag className="mt-[2px] h-[14px] w-[14px] flex-none" aria-hidden style={{ color: "#F5A623" }} />
              <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}><b style={{ color: "#F5A623" }}>Support flag</b> · {student.supportFlagReason}</span>
            </span>
          )}
          {actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[11.5px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Needs you</span>
              {actions.map((a) => (
                <span key={a.text} className="flex items-center gap-[7px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
                  <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: a.alert ? "#E0453C" : "var(--primary)" }} />
                  {a.text}
                  {a.review && <CardLink onClick={() => router.push("/counselor?view=review-queue")}>Review</CardLink>}
                </span>
              ))}
            </div>
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
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <span className="flex flex-wrap items-baseline gap-x-[8px]">
                <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Milestones</h2>
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {approvedCount} of {gradeKeys.length} done</span>
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
        </div>
      )}

      {tab === "plan" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <HoverBeam strength={0.6} className="h-full">
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <CardHead icon={Target} title="Plan progress" />
              <Segmented ariaLabel="Plan Progress timeframe" value={planTab} onChange={setPlanTab} options={PLAN_TABS.map((t) => ({ key: t.key, label: t.label }))} />
              {planTab === "3mo" ? (
                <ul className="flex flex-col gap-[8px]">
                  {PLAN_PROGRESS_3MO.map((t) => (
                    <li key={t.name} className="flex items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[11px]" style={GLASS_INSET}>
                      <span className="flex min-w-0 flex-col gap-[2px]">
                        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{t.name}</span>
                        <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Due {fmtDate(t.due)}</span>
                      </span>
                      <MilestoneChip status={t.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
                  {planTab === "6mo" ? "6-month view: milestones due in the next 6 months." : "12-month view: milestones due in the next 12 months."}
                </p>
              )}
            </div>
          </HoverBeam>
          <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
            <HoverBeam strength={0.6} className="h-full"><PlanSignoffCard student={student} /></HoverBeam>
            <HoverBeam strength={0.6} className="h-full"><TodosCard student={student} /></HoverBeam>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Sparkles} title="On Dreamari" />
            <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
              {engagement.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} accent="#5B6CF9" />)}
            </div>
            <Disclosure id="profile-more-activity" title="More from the student app" open={moreOpen} onToggle={() => setMoreOpen((v) => !v)}>
              <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
                {engagementMore.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} accent="#5B6CF9" />)}
              </div>
            </Disclosure>
          </div>
        </HoverBeam>
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
        </div>
      )}

      {tab === "drafts" && (
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Sparkles} title="Drafts" />
            <DraftTools student={student} />
          </div>
        </HoverBeam>
      )}
    </div>
  );
}
