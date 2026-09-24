"use client";

// DEMO-ONLY v2 fork of ../ReviewQueue.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.
//
// What changed from v1, and why (full reasoning in
// docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md, "Review Queue (v2)"):
// - Every pending milestone is its own item (v1 took only a student's first).
// - Priority and order come from the submission's own due date, not its
//   position in the roster.
// - Approve / Request Changes are recorded (src/lib/counselorReviews.ts) so
//   the roster, Settings and Student Progress all see the same state, the
//   feedback text is kept, and a Reviewed list with Undo makes the action
//   visible instead of the item just vanishing.
// - The detail pane leads with what the counselor actually reviews (the
//   student's message and attachment); the always-true "Status: Pending
//   Review" row is gone.
// - Honors the topbar grade filter like the other roster-driven screens.

import { useState } from "react";
import { Paperclip, Undo2 } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { decideReview, undoReview, useReviewDecisions, getReviewedRoster, reviewItemId, type ReviewDecision } from "@/lib/counselorReviews";
import { Avatar, MilestoneChip, STATUS_COLORS } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";

type Priority = "Normal" | "High" | "Urgent";
type ReviewItem = {
  id: string;
  student: CounselorStudent;
  milestone: MilestoneKey;
  submitted: Date;
  due: Date;
  /** Negative = overdue by that many days. */
  daysToDue: number;
  priority: Priority;
  message: string;
  attachment: string;
};

const MESSAGES: Partial<Record<MilestoneKey, string>> = {
  Resume: "Please review my updated resume. I added my volunteer work and recent internship.",
  "Career Report": "Just finished my career report. Let me know if anything's missing before I share it with my family.",
  "Academic Plan": "Updated my four-year plan with the new elective. Can you take a look?",
  "Financial Aid": "Submitted my FAFSA worksheet. Wanted to confirm I filled it out right.",
  "Recommendation Letter": "Requesting a recommendation letter for my top-choice school. The deadline is coming up soon!",
  "College List": "Here's my college list so far. Is it balanced enough between reach and safety schools?",
  Applications: "My Common App is ready to submit. Could you check the activities section?",
  "Transcript Submission": "Please review my transcript request before it goes out.",
  "College Exploration": "Finished my college exploration notes. Which of these should I visit first?",
  "Career Pathway": "Picked my pathway. Does it line up with the classes I'm taking?",
  "Career Assessment": "Retook the career assessment. Do the new results change my plan?",
};

// FNV-1a, same seeding technique as counselorRoster.ts, so an item's dates
// are stable for the life of a demo instead of shifting on every render.
function seededOffset(seed: string, span: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % span;
}

const DAY = 86400000;
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY);
}
function fmt(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Priority is the due date, nothing else: overdue is urgent, due within two
// days is high, the rest is normal. v1 assigned it by list position.
function priorityFor(daysToDue: number): Priority {
  return daysToDue < 0 ? "Urgent" : daysToDue <= 2 ? "High" : "Normal";
}
const PRIORITY_COLORS: Record<Priority, string> = {
  Urgent: STATUS_COLORS["At Risk"],
  High: STATUS_COLORS["Needs Attention"],
  Normal: "var(--muted-foreground)",
};
function dueLabel(daysToDue: number): string {
  if (daysToDue < 0) return `Overdue by ${-daysToDue} day${daysToDue === -1 ? "" : "s"}`;
  if (daysToDue === 0) return "Due today";
  if (daysToDue === 1) return "Due tomorrow";
  return `Due in ${daysToDue} days`;
}

function buildQueue(roster: CounselorStudent[]): ReviewItem[] {
  const base = today();
  const items: ReviewItem[] = [];
  for (const student of roster) {
    for (const milestone of MILESTONE_KEYS) {
      if (student.milestones[milestone] !== "Pending Review") continue;
      const id = reviewItemId(student.id, milestone);
      const submittedDaysAgo = 1 + seededOffset(`${id}:submitted`, 9);
      const daysToDue = seededOffset(`${id}:due`, 12) - 3;
      items.push({
        id,
        student,
        milestone,
        submitted: addDays(base, -submittedDaysAgo),
        due: addDays(base, daysToDue),
        daysToDue,
        priority: priorityFor(daysToDue),
        message: MESSAGES[milestone] ?? `Please review my ${milestone.toLowerCase()}.`,
        attachment: `${student.name.toLowerCase().replace(/\s+/g, "_")}_${milestone.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      });
    }
  }
  // Most overdue first, then due soonest, then whoever has waited longest.
  return items.sort((a, b) => a.daysToDue - b.daysToDue || a.submitted.getTime() - b.submitted.getTime());
}

function PriorityPill({ priority }: { priority: Priority }) {
  const color = PRIORITY_COLORS[priority];
  return (
    <span className="flex-none rounded-full px-[8px] py-[2px] text-[10px] font-extrabold tracking-[0.02em] uppercase" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
      {priority}
    </span>
  );
}

function QueueCard({ item, selected, onSelect }: { item: ReviewItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="dm-quiet relative flex w-full cursor-pointer flex-col gap-[8px] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
      style={{
        ...GLASS_CARD,
        borderColor: selected ? "color-mix(in srgb, var(--primary) 55%, var(--glass-border))" : GLASS_CARD.borderColor,
      }}
    >
      <span className="relative flex items-center justify-between gap-[10px]">
        <span className="flex min-w-0 items-center gap-[10px]">
          <Avatar name={item.student.name} size={32} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{item.student.name}</span>
            <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {item.student.grade} · {item.student.careerTrack}</span>
          </span>
        </span>
        <PriorityPill priority={item.priority} />
      </span>
      <span className="relative text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.milestone}</span>
      <span className="relative flex items-center gap-[6px] text-[11.5px] font-bold" style={{ color: "var(--foreground)" }}>
        <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: item.priority === "Normal" ? "var(--muted-foreground)" : PRIORITY_COLORS[item.priority] }} />
        {dueLabel(item.daysToDue)}
        <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· submitted {fmt(item.submitted)}</span>
      </span>
    </button>
  );
}

function ReviewedRow({ decision, roster, onUndo }: { decision: ReviewDecision; roster: CounselorStudent[]; onUndo: () => void }) {
  const student = roster.find((s) => s.id === decision.studentId);
  if (!student) return null;
  const when = new Date(decision.decidedAt);
  const isToday = when.toDateString() === new Date().toDateString();
  return (
    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, #FFFFFF 4%, transparent)" }}>
      <Avatar name={student.name} size={28} />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{student.name} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {decision.milestone}</span></span>
        {decision.feedback && <span className="truncate text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>&ldquo;{decision.feedback}&rdquo;</span>}
      </span>
      <MilestoneChip status={decision.status} />
      <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{isToday ? "Today" : fmt(when)}</span>
      <button type="button" onClick={onUndo} className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold" style={{ color: "var(--foreground)", borderColor: "var(--glass-border)" }}>
        <Undo2 className="h-[12px] w-[12px]" aria-hidden /> Undo
      </button>
    </div>
  );
}

export function ReviewQueue() {
  const { gradeFilter } = useCounselorFilters();
  const decisions = useReviewDecisions();
  const roster = getReviewedRoster();
  const scoped = gradeFilter === "All Grades" ? roster : roster.filter((s) => s.grade === gradeFilter);
  const pending = buildQueue(scoped);
  const reviewed = Object.values(decisions)
    .filter((d) => scoped.some((s) => s.id === d.studentId))
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const selected = pending.find((i) => i.id === selectedId) ?? pending[0] ?? null;

  const resolve = (status: ReviewDecision["status"]) => {
    if (!selected) return;
    decideReview(selected.student.id, selected.milestone, status, feedback);
    setFeedback("");
    setSelectedId(null);
  };

  // The pane is the screen's one hero surface, in the brand blue; priority
  // is the pill on each card, not a tint (direct feedback, 25 Sept 2026:
  // "Review queue: do not tint cards").
  const detailSurface = GLASS_CARD_HERO;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-[var(--space-3)]">
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Pending ({pending.length}){gradeFilter !== "All Grades" ? ` · Grade ${gradeFilter}` : ""}
          </span>
          {pending.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "var(--muted-foreground)" }}>
              Nothing pending review right now.
            </div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {pending.map((item) => (
                <QueueCard key={item.id} item={item} selected={selected?.id === item.id} onSelect={() => { setSelectedId(item.id); setFeedback(""); }} />
              ))}
            </div>
          )}
        </div>

        <HoverBeam strength={0.5} className="h-full">
          <div className="relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={detailSurface}>
            <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.22) }} />
            {!selected ? (
              <p className="relative text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Select a submission to review.</p>
            ) : (
              <>
                <div className="relative flex flex-wrap items-start justify-between gap-[var(--space-3)]">
                  <div className="flex min-w-0 items-center gap-[12px]">
                    <Avatar name={selected.student.name} size={44} />
                    <div className="flex min-w-0 flex-col gap-[2px]">
                      <h2 className="text-[17px] leading-[1.2] font-bold" style={{ color: "var(--foreground)" }}>{selected.milestone}</h2>
                      <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        {selected.student.name} · Grade {selected.student.grade} · {selected.student.careerTrack}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[6px]">
                    <PriorityPill priority={selected.priority} />
                    <span className="text-[11.5px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>
                      {dueLabel(selected.daysToDue)} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· due {fmt(selected.due)} · submitted {fmt(selected.submitted)}</span>
                    </span>
                  </div>
                </div>

                <div className="relative flex flex-col gap-[6px]">
                  <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>From {selected.student.name.split(" ")[0]}</span>
                  <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[14px] leading-[21px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{selected.message}</p>
                  <span className="flex w-fit items-center gap-[8px] rounded-full border px-[10px] py-[5px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                    <Paperclip className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--muted-foreground)" }} /> {selected.attachment}
                  </span>
                </div>

                <div className="relative flex flex-col gap-[6px]">
                  <label htmlFor="review-feedback" className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your feedback</label>
                  <textarea
                    id="review-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Kept with the decision so you can see later what you told the student."
                    rows={3}
                    className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                    style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                  />
                </div>
                <div className="relative mt-auto flex gap-[10px]">
                  <button type="button" onClick={() => resolve("Approved")} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[13.5px] font-bold">Approve</button>
                  <button type="button" onClick={() => resolve("Changes Requested")} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Request Changes</button>
                </div>
              </>
            )}
          </div>
        </HoverBeam>
      </div>

      {reviewed.length > 0 && (
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
          <div className="flex items-center justify-between gap-[8px]">
            <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Reviewed</h2>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{reviewed.length} decision{reviewed.length === 1 ? "" : "s"}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            {reviewed.map((d) => (
              <ReviewedRow key={reviewItemId(d.studentId, d.milestone)} decision={d} roster={roster} onUndo={() => undoReview(d.studentId, d.milestone)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
