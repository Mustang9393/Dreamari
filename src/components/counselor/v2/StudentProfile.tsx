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
  ChevronLeft, Bell, MessageSquare, StickyNote, Target, Compass, GraduationCap,
  Sparkles, Sunrise, Gamepad2, Bookmark, Landmark, Trophy, HelpCircle, MessageCircle,
} from "lucide-react";
import { MetricTile, Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { milestonesForGrade, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { PLAN_PROGRESS_3MO } from "@/lib/counselorProfileData";
import { getReviewedStudentById, useReviewDecisions } from "@/lib/counselorReviews";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar } from "../chips";
import { signalsFor } from "@/lib/studentSignals";
import { DraftTools } from "./ProductivitySuite";
import { Disclosure } from "./Disclosure";
import { CheckinsCard, PlanSignoffCard, TodosCard } from "./Casefile";
import { GLASS_INSET } from "../surfaces";



function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


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
  const [draftsOpen, setDraftsOpen] = useState(false);


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
  const actions = needsYou(student.milestones, gradeKeys);
  const signals = signalsFor(student);

  const engagement = [
    { icon: Sparkles, value: String(signals.dreamScore), label: "Dream Score", accent: "#5B6CF9" },
    { icon: Bookmark, value: String(signals.careersSaved), label: "Careers saved", accent: "#5B6CF9" },
    { icon: Landmark, value: String(signals.collegesSaved), label: "Colleges saved", accent: "#5B6CF9" },
    { icon: Gamepad2, value: String(signals.simulationsCompleted), label: "Simulations", accent: "#5B6CF9" },
    { icon: Trophy, value: String(signals.glossaryLessonsCompleted), label: "Skill games", accent: "#5B6CF9" },
    { icon: HelpCircle, value: signals.resumeAtsScore === null ? "none" : String(signals.resumeAtsScore), label: "Resume score", accent: "#5B6CF9" },
    { icon: Sunrise, value: String(signals.reportVersions), label: "Career reports", accent: "#5B6CF9" },
    { icon: MessageCircle, value: String(signals.experiencesLogged), label: "Experiences logged", accent: "#5B6CF9" },
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
          <CardHead icon={Target} title="Plan Progress" accent="#5B6CF9" />
          <Segmented ariaLabel="Plan Progress timeframe" value={planTab} onChange={setPlanTab} options={PLAN_TABS.map((t) => ({ key: t.key, label: t.label }))} />
          {planTab === "3mo" ? (
            <ul className="flex flex-col gap-[8px]">
              {PLAN_PROGRESS_3MO.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[11px]" style={GLASS_INSET}>
                  <span className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{t.name}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Due: {fmtDate(t.due)}</span>
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

      {/* Mocked from SchooLinks on request (25 Sept 2026): the three-party
         plan sign-off and counselor-assigned to-dos sit right under the
         plan they belong to; check-ins fold below On Dreamari. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full"><PlanSignoffCard student={student} /></HoverBeam>
        <HoverBeam strength={0.6} className="h-full"><TodosCard student={student} /></HoverBeam>
      </div>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          {/* Collapsed until needed: four tools and a form is the heaviest
             card on the page and most visits are a status check, not a
             letter (progressive disclosure, 25 Sept 2026). */}
          <Disclosure id="profile-drafts" variant="card" title={<CardHead icon={Sparkles} title="Drafts" accent="#5B6CF9" />} summary="Letters, briefs and plans, generated or your own" open={draftsOpen} onToggle={() => setDraftsOpen((v) => !v)}>
            <DraftTools student={student} />
          </Disclosure>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <CardHead icon={Sparkles} title="On Dreamari" accent="#5B6CF9" />
          <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
            {engagement.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} accent={e.accent} />)}
          </div>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full"><CheckinsCard student={student} /></HoverBeam>

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
