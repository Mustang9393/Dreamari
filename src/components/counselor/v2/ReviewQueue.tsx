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
// 25 Sept 2026 pass under the v2 budget: header stats (pending, overdue,
// due in 2 days) like the Milestone Tracker, two-line cards on the inset
// surface with the priority pill as the only colored element, a bounded
// scrolling list beside a sticky-feeling pane, a Counselor picker and
// counselor names for the Lead Counselor.

import { useState, useSyncExternalStore } from "react";
import { Undo2, FileText, Eye } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { decideReview, undoReview, useReviewDecisions, useReviewedRoster, reviewItemId, type ReviewDecision } from "@/lib/counselorReviews";
import { Avatar, DetailPane, MilestoneChip, STATUS_COLORS, StudentLink, Go } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD, GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { DocumentPage, DocumentPreviewModal } from "./DocumentPreview";

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

const QUEUE_STATUSES: MilestoneStatus[] = ["Pending Review", "In Progress", "Overdue"];
// "Missed deadline", not "Overdue": this tab is items the student never
// submitted, and "Overdue" read as the same thing as an overdue REVIEW in the
// Awaiting-you list (the two counts disagreed on screen, 6 vs 5).
const QUEUE_STATUS_LABEL: Record<MilestoneStatus, string> = { "Pending Review": "Awaiting you", "In Progress": "In progress", Overdue: "Missed deadline", Approved: "Approved", "Changes Requested": "Changes requested", "Not Started": "Not started", Completed: "Completed", "Not Applicable": "Not applicable" };

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

function buildQueue(roster: CounselorStudent[], status: MilestoneStatus): ReviewItem[] {
  const base = today();
  const items: ReviewItem[] = [];
  for (const student of roster) {
    for (const milestone of MILESTONE_KEYS) {
      if (student.milestones[milestone] !== status) continue;
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

// One card per submission, two lines: who and what, then when. The
// priority pill is the one colored element (a status: overdue is urgent,
// due within two days is high); the due line's dot repeats it, its text
// stays neutral. "Submitted" lives in the detail pane, not here.
function QueueCard({ item, selected, showCounselor, submitted, onSelect }: { item: ReviewItem; selected: boolean; showCounselor: boolean; /** only a real submission has a sent date */ submitted: boolean; onSelect: () => void }) {
  const color = item.priority === "Normal" ? "var(--muted-foreground)" : PRIORITY_COLORS[item.priority];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="dm-quiet group flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left"
      style={{ ...GLASS_INSET, borderColor: selected ? "color-mix(in srgb, var(--primary) 60%, var(--glass-border))" : GLASS_INSET.borderColor, background: selected ? "color-mix(in srgb, var(--primary) 12%, transparent)" : GLASS_INSET.background }}
    >
      <span className="flex items-center justify-between gap-[10px]">
        <span className="flex min-w-0 items-center gap-[10px]">
          <Avatar name={item.student.name} size={32} index={item.student.avatarIndex} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{item.student.name}</span>
            <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.milestone} · Grade {item.student.grade}{showCounselor ? ` · ${counselorFor(item.student).name}` : ""}</span>
          </span>
        </span>
        {/* No priority pill here: priority IS the due date in this queue, so
           the pill only repeated the due line below (every overdue row read
           "URGENT" + "Overdue by N days"). It stays in the detail pane. */}
        <Go kind="open" className="flex-none opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      <span className="flex items-center gap-[6px] text-[11.5px] font-semibold" style={{ color: "var(--foreground)" }}>
        <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: color }} />
        {dueLabel(item.daysToDue)}
        {submitted && <span style={{ color: "var(--muted-foreground)" }}>· sent {fmt(item.submitted)}</span>}
      </span>
    </button>
  );
}

// The attachment, opened in a centered document viewer -- the shape every
// real PDF viewer takes, not the inline expand this used to be. Direct
// feedback, 25 Sept 2026: "in the counselor connect etc where there are
// document previews, please open the document in a central document
// preview like you would for pdfs ... mock those up too to look
// realistic." Review Queue is the one screen with attachments today
// (Counselor Connect has none yet); the modal itself lives in
// DocumentPreview.tsx so any future screen with a document opens the same
// way.
function AttachmentCard({ item, open, onOpen, onClose }: { item: ReviewItem; open: boolean; onOpen: () => void; onClose: () => void }) {
  const kb = 40 + seededOffset(`${item.id}:kb`, 380);
  return (
    <>
      <button type="button" onClick={onOpen} className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left" style={GLASS_INSET}>
        <span className="flex size-[32px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>
          <FileText className="h-[16px] w-[16px]" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{item.attachment}</span>
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>PDF · {kb} KB</span>
        </span>
        <span className="flex flex-none items-center gap-[4px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}><Eye className="h-[14px] w-[14px]" aria-hidden /> View</span>
      </button>
      <DocumentPreviewModal open={open} onClose={onClose} fileName={item.attachment} kb={kb}>
        <DocumentPage student={item.student} milestone={item.milestone} />
      </DocumentPreviewModal>
    </>
  );
}

function ReviewedRow({ decision, roster, onUndo }: { decision: ReviewDecision; roster: CounselorStudent[]; onUndo: () => void }) {
  const student = roster.find((s) => s.id === decision.studentId);
  if (!student) return null;
  const when = new Date(decision.decidedAt);
  const isToday = when.toDateString() === new Date().toDateString();
  return (
    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
      <Avatar name={student.name} size={28} index={student.avatarIndex} />
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
  const { gradeFilter, counselorFilter, setCounselorFilter } = useCounselorFilters();
  const decisions = useReviewDecisions();
  const roster = useReviewedRoster();
  // The Lead Counselor reviews across caseloads and can narrow to one
  // counselor; a School Counselor's queue has no such control.
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";
  let scoped = gradeFilter === "All Grades" ? roster : roster.filter((s) => s.grade === gradeFilter);
  if (showCounselor && counselorFilter !== "All") scoped = scoped.filter((s) => counselorFor(s).id === counselorFilter);
  // v1's queue mixed four statuses (Pending Review, Submitted, In Progress,
  // Overdue) in one undifferentiated list; a content audit found v2's own
  // roster-driven rebuild had kept only Pending Review. Restored as a
  // filter, defaulting to Pending Review (the actionable one), rather than
  // one long list -- "Submitted" isn't a distinct roster status here (a
  // resubmission after Changes Requested is still Pending Review), so the
  // three real statuses this roster tracks are the three tabs.
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus>("Pending Review");
  const counts = QUEUE_STATUSES.map((s) => buildQueue(scoped, s).length);
  const pending = buildQueue(scoped, statusFilter);
  const overdue = pending.filter((i) => i.daysToDue < 0).length;
  const dueSoon = pending.filter((i) => i.daysToDue >= 0 && i.daysToDue <= 2).length;
  const reviewed = Object.values(decisions)
    .filter((d) => scoped.some((s) => s.id === d.studentId))
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reminded, setReminded] = useState<Set<string>>(() => new Set());
  const selected = pending.find((i) => i.id === selectedId) ?? pending[0] ?? null;

  const resolve = (status: ReviewDecision["status"]) => {
    if (!selected) return;
    decideReview(selected.student.id, selected.milestone, status, feedback);
    setFeedback("");
    setSelectedId(null);
    setSheetOpen(false);
  };

  // The pane is the screen's one hero surface, in the brand blue; priority
  // is the pill on each card, not a tint (direct feedback, 25 Sept 2026:
  // "Review queue: do not tint cards").
  const detailSurface = GLASS_CARD_HERO;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* The tabs carry the counts; the header row of big numbers only
         repeated them. What the tabs can't say (how many of the waiting
         items are late or nearly late) is one quiet caption beside them. */}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented ariaLabel="Status" value={statusFilter} onChange={(k) => { setStatusFilter(k as MilestoneStatus); setSelectedId(null); }} options={QUEUE_STATUSES.map((s, i) => ({ key: s, label: `${QUEUE_STATUS_LABEL[s]} (${counts[i]})` }))} />
        <span className="flex flex-wrap items-center gap-[var(--space-3)]">
          {statusFilter === "Pending Review" && (overdue > 0 || dueSoon > 0) && (
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {overdue > 0 && <span style={{ color: STATUS_COLORS["At Risk"] }}>{overdue} past due</span>}
              {overdue > 0 && dueSoon > 0 && " · "}
              {dueSoon > 0 && <span style={{ color: STATUS_COLORS["Needs Attention"] }}>{dueSoon} due within 2 days</span>}
            </span>
          )}
          {showCounselor && (
            <Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{ value: "All", label: "All counselors" }, ...SCHOOL_COUNSELORS.map((c) => ({ value: c.id, label: c.name }))]} className="flex h-9 min-w-[170px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
          )}
        </span>
      </div>
      {/* items-start: the pane hugs its content instead of stretching to
         the list's height, which left the actions floating far below a
         short submission (direct feedback, 25 Sept 2026). */}
      <div className="grid grid-cols-1 items-start gap-[var(--space-4)] lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* The list fills the height under the header on desktop, like a
           mail client's (26 Sept 2026 sweep: a 70vh cap ended the list
           mid-screen with empty page below it). Thin scrollbar per
           docs/CROSS_BROWSER_GUARDRAILS.md. */}
        <div className="flex max-h-[70vh] flex-col gap-[var(--space-3)] overflow-y-auto pr-[2px] [scrollbar-width:thin] lg:max-h-[calc(100dvh-190px)]">
          {pending.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "var(--muted-foreground)" }}>
              Nothing here right now.
            </div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {pending.map((item) => (
                <QueueCard key={item.id} item={item} selected={selected?.id === item.id} showCounselor={showCounselor} submitted={statusFilter === "Pending Review"} onSelect={() => { setSelectedId(item.id); setFeedback(""); setPreviewOpen(false); setSheetOpen(true); }} />
              ))}
            </div>
          )}
        </div>

        <DetailPane open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <HoverBeam strength={0.5}>
          <div className="relative flex flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={detailSurface}>
            <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.22) }} />
            {!selected ? (
              <p className="relative text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Select a submission to review.</p>
            ) : (
              <>
                {/* One header row: student (opens the profile) left, the
                   pill flex-none on the same line, so nothing wraps under
                   the name on a phone; the due line is its own line. */}
                <div className="relative flex items-start justify-between gap-[var(--space-3)]">
                  <StudentLink id={selected.student.id} name={selected.student.name} index={selected.student.avatarIndex}>
                    <span className="truncate text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{selected.milestone} · Grade {selected.student.grade} · {selected.student.careerTrack}</span>
                  </StudentLink>
                  <PriorityPill priority={selected.priority} />
                </div>
                <span className="relative text-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>
                  {dueLabel(selected.daysToDue)} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· due {fmt(selected.due)}{statusFilter === "Pending Review" ? ` · submitted ${fmt(selected.submitted)}` : ""}</span>
                </span>

                {statusFilter === "Pending Review" ? (
                  <>
                    <div className="relative flex flex-col gap-[6px]">
                      <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>From {selected.student.name.split(" ")[0]}</span>
                      {/* Solid, not glass -- direct feedback: "more solid
                         background with more prominent text so it stand
                         out more." This is the one thing the student
                         actually said; it shouldn't read as quiet as the
                         chrome around it. */}
                      <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[15px] leading-[22px] font-medium" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "var(--foreground)" }}>{selected.message}</p>
                      <AttachmentCard item={selected} open={previewOpen} onOpen={() => setPreviewOpen(true)} onClose={() => setPreviewOpen(false)} />
                    </div>

                    <div className="relative flex flex-col gap-[6px]">
                      <label htmlFor="review-feedback" className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your feedback</label>
                      <textarea
                        id="review-feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="A note for the student"
                        rows={3}
                        className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                        style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                      />
                    </div>
                    <div className="relative flex gap-[10px]">
                      <button type="button" onClick={() => resolve("Approved")} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[13.5px] font-bold">Approve</button>
                      <button type="button" onClick={() => resolve("Changes Requested")} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Request Changes</button>
                    </div>
                  </>
                ) : (
                  // Nothing submitted yet for these two statuses -- no
                  // message, no attachment, no Approve/Request Changes to
                  // fake a review that hasn't happened.
                  // Not a dead end: the one thing a counselor can do about
                  // an unsubmitted item is nudge the student.
                  <div className="relative flex flex-col gap-[var(--space-3)]">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{selected.student.name.split(" ")[0]} hasn&apos;t submitted this yet.</p>
                    {reminded.has(selected.id) ? (
                      <p className="text-[13px] font-bold" style={{ color: "var(--primary)" }}>Reminder sent</p>
                    ) : (
                      <button type="button" onClick={() => setReminded((r) => new Set(r).add(selected.id))} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 w-fit cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[18px] text-[13.5px] font-bold">Send a reminder</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </HoverBeam>
        </DetailPane>
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
