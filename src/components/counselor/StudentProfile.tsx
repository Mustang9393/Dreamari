"use client";

// v1: the reference's Student Profile, 1:1 in content and composition
// (captured from the reference's /students/:id pages, 24 Sept 2026): a
// "Student Profile" header row with the three actions, a hero card (avatar,
// name and student number, grade / school / DOB, status and pathway chips,
// last active, a "Reports Done" ring), About the Student, Top 5 Career
// Matches, a Pending Counselor Action list when there is one, the
// grade-scoped Milestone Status grid, Plan Progress (the reference's one
// fixed list; its 6- and 12-month tabs are placeholder text), Platform
// Engagement, Counselor Notes. Only the visual language is ours. The v2
// fork (v2/StudentProfile.tsx) is where the profile changes.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bell, MessageSquare, StickyNote, BookOpen, GraduationCap, Target, CircleCheck, Flag,
  Sparkles, Sunrise, Gamepad2, Bookmark, Landmark, Trophy, HelpCircle, MessageCircle,
} from "lucide-react";
import { MetricTile, Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getStudentById, milestonesForGrade, type CounselorStudent } from "@/lib/counselorRoster";
import { PLAN_PROGRESS_3MO } from "@/lib/counselorProfileData";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar } from "./chips";

import { GLASS_CARD as TINTED_CARD, GLASS_CARD_HERO, glowBackdrop } from "./surfaces";

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

function CardTitle({ icon: Icon, title }: { icon?: typeof Bell; title: string }) {
  return (
    <h2 className="flex items-center gap-[8px] text-[14px] font-bold" style={{ color: "var(--foreground)" }}>
      {Icon && <Icon className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} />}
      {title}
    </h2>
  );
}

function AboutRow({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: string }) {
  return (
    <span className="flex items-start gap-[12px]">
      <Icon className="mt-[2px] h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      <span className="flex flex-col gap-[2px]">
        <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <span className="text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{value}</span>
      </span>
    </span>
  );
}

// The reference's own rules for what it lists under "Pending Counselor
// Action" (read off its bundle).
function pendingActions(s: CounselorStudent): string[] {
  const out: string[] = [];
  if (s.milestones["Career Report"] === "Pending Review") out.push("Career Report awaiting your approval");
  if (s.milestones["Academic Plan"] === "Pending Review") out.push("Academic Plan awaiting your approval");
  if (s.milestones["Resume"] === "Pending Review") out.push("Resume awaiting your review");
  if (s.grade === 12 && s.postsecondaryIntent === "Undecided") out.push("Senior needs postsecondary plan finalized");
  if (s.supportFlagReason) out.push(`Support flag: ${s.supportFlagReason}`);
  return out;
}

export function StudentProfileView({ studentId }: { studentId: string }) {
  const router = useRouter();
  const student = getStudentById(studentId);
  const [notes, setNotes] = useState(() => readNotes(studentId));
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [planTab, setPlanTab] = useState<PlanBucket>("3mo");

  if (!student) {
    return (
      <div className="flex flex-col items-center gap-[10px] rounded-[var(--radius-lg)] border py-[60px] text-center" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
        <h2 className="text-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Student Not Found</h2>
        <p style={{ color: "var(--muted-foreground)" }}>The student you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <button type="button" onClick={() => router.push("/counselor?view=students")} className="dm-link text-[13px] font-bold" style={{ color: "var(--primary)" }}>Back to Students</button>
      </div>
    );
  }

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  };

  const shownMilestones = milestonesForGrade(student.grade);
  const approvedCount = shownMilestones.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length;
  const total = shownMilestones.length;
  const ringPct = Math.round((approvedCount / Math.max(1, total)) * 100);
  const actions = pendingActions(student);

  const engagement = [
    { icon: Sparkles, value: String(student.engagement.dreamScore), label: "Dream Score", accent: "#7C5CFA" },
    { icon: Sunrise, value: String(student.engagement.dailyDropsCompleted), label: "Daily Drops Completed", accent: "#F5A623" },
    { icon: Gamepad2, value: String(student.engagement.simulations), label: "Career Simulations", accent: "#5B6CF9" },
    { icon: Bookmark, value: String(student.engagement.careersSaved), label: "Careers Saved", accent: "#33C78C" },
    { icon: Landmark, value: String(student.engagement.collegesSaved), label: "Colleges Saved", accent: "#4AB8D8" },
    { icon: Trophy, value: String(student.engagement.challenges), label: "Career Challenges", accent: "#EC5FA6" },
    { icon: HelpCircle, value: String(student.engagement.questionsSubmitted), label: "Questions Submitted", accent: "#8FE3D9" },
    { icon: MessageCircle, value: String(student.engagement.communityPosts), label: "Community Posts", accent: "#F5A623" },
  ];

  const R = 15.9;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex items-center gap-[12px]">
          <button type="button" aria-label="Back to Students" onClick={() => router.push("/counselor?view=students")} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--foreground)" }}>
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <h1 className="text-[22px] leading-[1.15] font-extrabold sm:text-[26px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Student Profile</h1>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <ActionButton icon={Bell} label="Send Reminder" onClick={() => flash(`Reminder sent to ${student.name}.`)} />
          <ActionButton icon={MessageSquare} label="Message Student" onClick={() => flash(`Message thread opened with ${student.name}.`)} />
          <ActionButton icon={StickyNote} label="Add Note" onClick={() => document.getElementById("counselor-note-input")?.focus()} />
        </div>
      </div>

      {toast && (
        <div className="rounded-[var(--radius-md)] border px-[14px] py-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 12%, var(--card))", color: "var(--foreground)" }}>
          {toast}
        </div>
      )}

      {/* Hero: the reference's saturated identity card. Same one-hero-per-
         screen surface Overview uses. */}
      <HoverBeam strength={0.7} className="h-full">
        <div className="relative flex flex-wrap items-center justify-between gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={GLASS_CARD_HERO}>
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.3) }} />
          <div className="relative flex min-w-0 items-center gap-[var(--space-5)]">
            <Avatar name={student.name} size={72} />
            <div className="flex min-w-0 flex-col gap-[6px]">
              <span className="flex flex-wrap items-baseline gap-x-[10px] gap-y-[2px]">
                <span className="text-[24px] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{student.name}</span>
                <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{student.tag}</span>
                {student.isReal && <span className="rounded-full px-[8px] py-[2px] text-[10.5px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>You</span>}
              </span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.school} · DOB: {student.dob}</span>
              <span className="flex flex-wrap items-center gap-[8px]">
                <StatusChip status={student.status} />
                <span className="rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{student.careerTrack}</span>
              </span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Last active: {student.lastActive}</span>
            </div>
          </div>
          <div className="relative flex flex-col items-center gap-[4px]">
            <span className="relative flex size-[84px] items-center justify-center">
              <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
                <circle cx="18" cy="18" r={R} fill="none" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(ringPct / 100) * C} ${C}`} />
              </svg>
              <span className="flex flex-col items-center leading-none">
                <span className="text-[20px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{approvedCount}</span>
                <span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of {total}</span>
              </span>
            </span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Reports Done</span>
          </div>
        </div>
      </HoverBeam>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardTitle icon={BookOpen} title="About the Student" />
            <div className="flex flex-col gap-[14px]">
              <AboutRow icon={GraduationCap} label="Education Goals" value={student.educationGoals.join(" → ")} />
              <AboutRow icon={Target} label="Favourite Career Cluster" value={student.careerCluster} />
              <AboutRow icon={CircleCheck} label="Postsecondary Intention" value={student.postsecondaryIntent} />
              {student.supportFlagReason && (
                <span className="flex items-start gap-[12px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={{ borderColor: "color-mix(in srgb, #F5A623 40%, transparent)", background: "color-mix(in srgb, #F5A623 12%, transparent)" }}>
                  <Flag className="mt-[2px] h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "#F5A623" }} />
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[11.5px] font-bold" style={{ color: "#F5A623" }}>Support Flag Active</span>
                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{student.supportFlagReason}</span>
                  </span>
                </span>
              )}
            </div>
          </div>
        </HoverBeam>

        <HoverBeam strength={0.6} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardTitle title="Top 5 Career Matches" />
            <div className="flex flex-col gap-[10px]">
              {student.topMatches.map((m, i) => (
                <div key={m.title} className="flex items-center gap-[12px]">
                  <span className="flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
                    <span className="flex items-center justify-between text-[13px] font-semibold">
                      <span style={{ color: "var(--foreground)" }}>{m.title}</span>
                      <span className="tabular-nums" style={{ color: "var(--primary)" }}>{m.pct}%</span>
                    </span>
                    <span className="relative block h-[6px] overflow-hidden rounded-[3px]" style={{ background: "rgba(255,255,255,0.12)" }}>
                      <span className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${m.pct}%`, background: "var(--primary)" }} />
                    </span>
                  </span>
                </div>
              ))}
              {student.topMatches.length === 0 && <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No saved matches yet.</p>}
            </div>
          </div>
        </HoverBeam>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ ...TINTED_CARD, borderColor: "color-mix(in srgb, #F5A623 35%, var(--glass-border))" }}>
          <CardTitle icon={Flag} title="Pending Counselor Action" />
          <ul className="flex flex-col gap-[4px]">
            {actions.map((a) => (
              <li key={a} className="flex items-start gap-[8px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                <span aria-hidden style={{ color: "#F5A623" }}>•</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-col gap-[2px]">
            <CardTitle title="Milestone Status" />
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{approvedCount} of {total} milestones approved</span>
          </div>
          <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
            {shownMilestones.map((key) => (
              <span key={key} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{key}</span>
                <span><MilestoneChip status={student.milestones[key]} /></span>
              </span>
            ))}
          </div>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <CardTitle title="Plan Progress" />
          <Segmented ariaLabel="Plan Progress timeframe" value={planTab} onChange={setPlanTab} options={PLAN_TABS.map((t) => ({ key: t.key, label: t.label }))} />
          {planTab === "3mo" ? (
            <ul className="flex flex-col gap-[8px]">
              {PLAN_PROGRESS_3MO.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[14px] py-[11px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{t.name}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Due: {t.due}</span>
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

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <CardTitle title="Platform Engagement" />
          <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
            {engagement.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} accent={e.accent} />)}
          </div>
        </div>
      </HoverBeam>

      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <CardTitle title="Counselor Notes" />
        <div className="flex flex-col gap-[8px]">
          <textarea
            id="counselor-note-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note about this student..."
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
            {notes.length === 0 ? "Add First Note" : "Add Note"}
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No notes have been added for this student yet.</p>
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
