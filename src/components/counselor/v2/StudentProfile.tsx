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
import {
  ChevronLeft, Bell, MessageSquare, StickyNote, Target, Compass, GraduationCap,
  Sparkles, Sunrise, Gamepad2, Bookmark, Landmark, Trophy, HelpCircle, MessageCircle,
} from "lucide-react";
import { MetricTile, Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { MILESTONE_KEYS, milestonesForGrade, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { getReviewedStudentById, useReviewDecisions } from "@/lib/counselorReviews";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar } from "../chips";

// The reference's own Plan Progress task names are more specific than the
// Milestone Status grid's labels above them ("Applications" the milestone
// vs. "College Application Essays" the task) -- same vocabulary the
// reference itself used (Emma Rodriguez's plan: College Application
// Essays / FAFSA Submission / Recommendation Letter Request / Transcript
// Submission), generalized to whichever milestones aren't approved yet.
const PLAN_TASK_NAMES: Partial<Record<MilestoneKey, string>> = {
  Applications: "College Application Essays",
  "Financial Aid": "FAFSA Submission",
  "Recommendation Letter": "Recommendation Letter Request",
  "Transcript Submission": "Transcript Submission",
  "Career Report": "Career Report Draft",
  "Academic Plan": "Academic Plan Review",
  "College List": "College List Finalization",
  "College Exploration": "College Exploration Checklist",
  Resume: "Resume Draft",
  "Career Pathway": "Career Pathway Selection",
  "Career Assessment": "Career Assessment Retake",
};

type PlanBucket = "3mo" | "6mo" | "12mo";
const PLAN_TABS: { key: PlanBucket; label: string }[] = [
  { key: "3mo", label: "3 months" },
  { key: "6mo", label: "6 months" },
  { key: "12mo", label: "12 months" },
];

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Attention first: what needs the counselor, then what the student owes,
// then what is moving, then what is done.
const STATE_RANK: Record<MilestoneStatus, number> = { Overdue: 0, "Changes Requested": 1, "Pending Review": 2, "Not Started": 3, "In Progress": 4, Approved: 5, Completed: 5, "Not Applicable": 6 };

/** What this student needs from the counselor, from their own milestones. */
function needsYou(m: Record<MilestoneKey, MilestoneStatus>, keys: MilestoneKey[]): string[] {
  const out: string[] = [];
  for (const k of keys) {
    if (m[k] === "Pending Review") out.push(`Review ${k}`);
    else if (m[k] === "Overdue") out.push(`${k} overdue`);
    else if (m[k] === "Changes Requested") out.push(`${k} awaiting resubmission`);
  }
  return out;
}

function seededOffset(seed: string, min: number, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
  return min + (h % (max - min + 1));
}

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
  const [planTab, setPlanTab] = useState<PlanBucket>("3mo");
  // Read once via a lazy initializer, not inside the memo below --
  // Date.now() is an impure call and isn't allowed directly in a
  // render-time computation or ref access.
  const [now] = useState(() => Date.now());

  // Every unapproved milestone becomes a plan task, bucketed by how soon
  // it's due -- deterministic per student+key so the same task always
  // lands in the same bucket with the same due date across renders.
  const planTasks = useMemo(() => {
    if (!student) return [];
    const notApprovedKeys = MILESTONE_KEYS.filter((k) => student.milestones[k] !== "Approved");
    return notApprovedKeys.map((key, i) => {
      const bucket: PlanBucket = i === 0 ? "3mo" : i <= 2 ? "6mo" : "12mo";
      const dayOffset = seededOffset(`${student.id}-${key}`, 5, bucket === "3mo" ? 45 : bucket === "6mo" ? 120 : 300);
      const due = new Date(now + dayOffset * 86400000).toISOString().slice(0, 10);
      const status: "In Progress" | "Not Started" = student.milestones[key] === "In Progress" || student.milestones[key] === "Pending Review" ? "In Progress" : "Not Started";
      return { key, label: PLAN_TASK_NAMES[key] ?? key, due, status, bucket };
    });
  }, [student, now]);

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
  const orderedKeys = [...gradeKeys].sort((a, b) => STATE_RANK[student.milestones[a]] - STATE_RANK[student.milestones[b]]);
  const approvedCount = gradeKeys.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length;
  const actions = needsYou(student.milestones, gradeKeys);

  const engagement = [
    { icon: Sparkles, value: String(student.engagement.dreamScore), label: "Dream Score", accent: "#5B6CF9" },
    { icon: Sunrise, value: String(student.engagement.dailyDropsCompleted), label: "Daily Drops", accent: "#5B6CF9" },
    { icon: Gamepad2, value: String(student.engagement.simulations), label: "Simulations", accent: "#5B6CF9" },
    { icon: Bookmark, value: String(student.engagement.careersSaved), label: "Careers Saved", accent: "#5B6CF9" },
    { icon: Landmark, value: String(student.engagement.collegesSaved), label: "Colleges Saved", accent: "#5B6CF9" },
    { icon: Trophy, value: String(student.engagement.challenges), label: "Challenges", accent: "#5B6CF9" },
    { icon: HelpCircle, value: String(student.engagement.questionsSubmitted), label: "Questions asked", accent: "#5B6CF9" },
    { icon: MessageCircle, value: String(student.engagement.communityPosts), label: "Community Posts", accent: "#5B6CF9" },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => router.push("/counselor?view=students")} className="dm-quiet flex cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Students
        </button>
        <div className="flex flex-wrap items-center gap-[8px]">
          <ActionButton icon={Bell} label="Remind" onClick={() => flash(`Reminder sent to ${student.name}.`)} />
          <ActionButton icon={MessageSquare} label="Message" onClick={() => flash(`Message thread opened with ${student.name}.`)} />
          <ActionButton icon={StickyNote} label="Note" onClick={() => document.getElementById("counselor-note-input")?.focus()} />
        </div>
      </div>

      {toast && (
        <div className="rounded-[var(--radius-md)] border px-[14px] py-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 12%, var(--card))", color: "var(--foreground)" }}>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <div className="flex items-start gap-[14px]">
              <Avatar name={student.name} size={56} index={student.avatarIndex} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <span className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{student.name}</span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.careerTrack} · active {fmtDate(student.lastActive)}</span>
              </div>
            </div>
            <span className="flex"><StatusChip status={student.status} /></span>
            {/* The one thing to read first: what this student needs from the
               counselor, derived from their own milestones. */}
            {actions.length > 0 && (
              <ul className="flex flex-col gap-[4px]">
                {actions.map((a) => (
                  <li key={a} className="flex items-center gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: a.startsWith("Review") ? "var(--primary)" : "#E0453C", boxShadow: `0 0 6px ${a.startsWith("Review") ? "var(--primary)" : "#E0453C"}` }} />{a}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex flex-col gap-[10px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
              <span className="flex items-center gap-[10px] text-[13px]" style={{ color: "var(--foreground)" }}>
                <GraduationCap className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                {student.postsecondaryIntent === "Undecided" ? "No postsecondary plan yet" : student.postsecondaryIntent}
              </span>
              <span className="flex items-center gap-[10px] text-[13px]" style={{ color: "var(--foreground)" }}>
                <Compass className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                Roadmap {student.roadmapPct}% · {approvedCount} of {gradeKeys.length} milestones approved
              </span>
            </div>
          </div>
        </HoverBeam>

        <HoverBeam strength={0.6} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Target} title="Top 5 Career Matches" accent="#5B6CF9" />
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
          <span className="flex flex-wrap items-center justify-between gap-[8px]">
            <CardHead icon={Target} title="Milestones" accent="#5B6CF9" />
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{gradeKeys.length} required in Grade {student.grade} · {approvedCount} approved</span>
          </span>
          <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
            {orderedKeys.map((key) => (
              <span key={key} className="flex items-center justify-between rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{key}</span>
                <MilestoneChip status={student.milestones[key]} />
              </span>
            ))}
          </div>
        </div>
      </HoverBeam>

      {planTasks.length > 0 && (
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <span className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <CardHead icon={Sunrise} title="Plan" accent="#5B6CF9" />
              <Segmented ariaLabel="Plan Progress timeframe" value={planTab} onChange={setPlanTab} options={PLAN_TABS.map((t) => ({ key: t.key, label: t.label }))} />
            </span>
            {(() => {
              const rows = planTasks.filter((t) => t.bucket === planTab);
              if (rows.length === 0) return <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Nothing due in this window.</p>;
              // Row treatment borrowed from the student's own My Plan tab
              // (Profile > My Plan): a status dot standing in for that
              // view's checkbox -- a counselor doesn't complete these
              // tasks, the student does, so a tickable box would be
              // misleading here, but the same "small status mark, task
              // name, meta line" rhythm keeps the two screens legible as
              // the same product seen from different sides.
              return (
                <ul className="flex flex-col gap-[6px]">
                  {rows.map((t) => (
                    <li key={t.key} className="flex items-center gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[11px] transition-colors" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                      <span
                        aria-hidden
                        className="flex size-[20px] flex-none items-center justify-center rounded-full border-2"
                        style={{ borderColor: t.status === "In Progress" ? "#5B6CF9" : "var(--glass-border)", background: t.status === "In Progress" ? "color-mix(in srgb, #5B6CF9 22%, transparent)" : "transparent" }}
                      >
                        {t.status === "In Progress" && <span className="size-[8px] rounded-full" style={{ background: "#5B6CF9" }} />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{t.label}</span>
                        <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Due {fmtDate(t.due)}</span>
                      </span>
                      <MilestoneChip status={t.status} />
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </HoverBeam>
      )}

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <CardHead icon={Sparkles} title="On Dreamari" accent="#5B6CF9" />
          <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
            {engagement.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} accent={e.accent} />)}
          </div>
        </div>
      </HoverBeam>

      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <CardHead icon={StickyNote} title="Notes" accent="#5B6CF9" />
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
  );
}
