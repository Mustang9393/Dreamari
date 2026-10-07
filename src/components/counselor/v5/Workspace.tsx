"use client";

// v5 Workspace (7 Oct 2026): the operational tools (plan section 4), Reviews
// first because it is the one with a queue. One submission at a time: the
// student's actual document (v4's DocumentPage), Approve or Ask for changes,
// then the next one. Decisions go through the same store v4 uses
// (counselorReviews.ts), so Home's counts and the student page update too.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Maximize2, RotateCcw } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { TextTabs } from "@/components/app/TextTabs";
import { DocumentPage, DocumentPreviewModal } from "@/components/counselor/v4/DocumentPreview";
import { FitPage } from "@/components/counselor/v4/DocumentDesk";
import { DreamyMoment } from "@/components/counselor/v4/overviewShared";
import { decideReview, undoReview, useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { MILESTONE_ICON } from "./milestoneIcons";
import { StudentFace } from "./StudentFace";
import { cv } from "@/lib/counselorBase";
import { V5Messages } from "./Messages";
import { V5Documents } from "./Documents";

type Tab = "reviews" | "messages" | "documents";
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";

export function V5Workspace({ initial }: { initial?: string }) {
  const [tab, setTab] = useState<Tab>(initial === "messages" || initial === "documents" ? initial : "reviews");
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)]">
        <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Workspace</h1>
        <TextTabs items={[{ key: "reviews", label: "Reviews" }, { key: "messages", label: "Messages" }, { key: "documents", label: "Documents" }]} value={tab} onChange={setTab} ariaLabel="Workspace" layoutId="v5-workspace-tabs" />
      </header>
      {tab === "reviews" && <Reviews />}
      {tab === "messages" && <V5Messages />}
      {tab === "documents" && <V5Documents />}
    </div>
  );
}

type Item = { student: CounselorStudent; milestone: MilestoneKey };

/** The review desk, shared with v6. */
export function Reviews() {
  const roster = useReviewedRoster();
  // every submission waiting for the counselor, most urgent students first
  const queue = useMemo<Item[]>(() => roster.flatMap((s) => MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").map((k) => ({ student: s, milestone: k })))
    .sort((a, b) => (a.student.status === "At Risk" ? 0 : a.student.status === "Needs Attention" ? 1 : 2) - (b.student.status === "At Risk" ? 0 : b.student.status === "Needs Attention" ? 1 : 2)), [roster]);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [last, setLast] = useState<{ item: Item; word: string } | null>(null);
  const [full, setFull] = useState(false);
  const item = queue[Math.min(current, queue.length - 1)];

  const decide = (status: "Approved" | "Changes Requested") => {
    if (!item) return;
    decideReview(item.student.id, item.milestone, status, feedback);
    setLast({ item, word: status === "Approved" ? "Approved" : "Changes asked" });
    setFeedback("");
    // the decided item leaves the queue, so the same index is the next one
  };

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] py-[var(--space-12)] text-center">
        <DreamyMoment mood="celebrate" size={80} />
        <p className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>All caught up</p>
        {last && <UndoLink last={last} onUndo={() => { undoReview(last.item.student.id, last.item.milestone); setLast(null); }} />}
      </div>
    );
  }
  const Icon = MILESTONE_ICON[item.milestone];
  const index = Math.min(current, queue.length - 1);
  return (
    // The document fills its column; the decision sits in a sticky panel
    // beside it so feedback and the buttons never need a scroll (Chandu,
    // 7 Oct 2026: "the input field is too low and I need to scroll to take
    // action"; "the preview should be full width, openable full screen").
    <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-10)]">
      <section aria-label="Submission" className="flex min-w-0 flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <Link href={`${cv("students")}&studentId=${encodeURIComponent(item.student.id)}`} className="dm-quiet flex min-w-0 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
            <Portrait s={item.student} size={48} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[20px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{item.student.name}</span>
              <span className="flex items-center gap-[6px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}><Icon className="h-[15px] w-[15px]" aria-hidden />{item.milestone} · Grade {item.student.grade}</span>
            </span>
          </Link>
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{index + 1} of {queue.length}</span>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="block w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left sm:p-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)", borderColor: "var(--glass-border)" }}>
            <span className="mx-auto block max-w-[816px]"><FitPage shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage></span>
          </button>
          <button type="button" onClick={() => setFull(true)} className="dm-quiet absolute top-[12px] right-[12px] inline-flex h-9 items-center gap-[6px] rounded-full border px-[12px] text-[13px] font-semibold" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <Maximize2 className="h-[14px] w-[14px]" aria-hidden /> Full screen
          </button>
        </div>
        <DocumentPreviewModal open={full} onClose={() => setFull(false)} fileName={`${item.student.name} · ${item.milestone}`} kb={0}>
          <DocumentPage student={item.student} milestone={item.milestone} />
        </DocumentPreviewModal>
      </section>

      <aside aria-label="Decision and queue" className="flex min-w-0 flex-col gap-[var(--space-6)] lg:sticky lg:top-[100px] lg:self-start">
        <div className="flex flex-col gap-[var(--space-3)]">
          <label className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[14px] font-semibold">Feedback</span>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Needed if you ask for changes" className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
          </label>
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            <button type="button" onClick={() => decide("Approved")} className="dm-solid inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Check className="h-4 w-4" aria-hidden /> Approve
            </button>
            <button type="button" disabled={!feedback.trim()} onClick={() => decide("Changes Requested")} className="dm-quiet inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: "var(--glass-border)" }}>
              Ask for changes
            </button>
          </div>
          {last && <UndoLink last={last} onUndo={() => { undoReview(last.item.student.id, last.item.milestone); setLast(null); }} />}
        </div>
        <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
          <span className="text-[12px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Up next</span>
          <ul className="dm-scroll flex max-h-[44vh] flex-col overflow-y-auto">
            {queue.map((q, i) => {
              const QIcon = MILESTONE_ICON[q.milestone];
              const on = i === index;
              return (
                <li key={`${q.student.id}-${q.milestone}`} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
                  <button type="button" onClick={() => setCurrent(i)} aria-current={on ? "true" : undefined} className="dm-quiet flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[var(--space-2)] py-[9px] text-left" style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                    <Portrait s={q.student} size={30} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[14px] leading-[18px] font-semibold">{q.student.name}</span>
                      <span className="flex items-center gap-[5px] truncate text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}><QIcon className="h-[13px] w-[13px] flex-none" aria-hidden />{q.milestone}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function UndoLink({ last, onUndo }: { last: { item: Item; word: string }; onUndo: () => void }) {
  return (
    <span role="status" className="flex items-center gap-[8px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>
      {last.word}: {last.item.student.name.split(" ")[0]}
      <button type="button" onClick={onUndo} className="dm-link inline-flex items-center gap-[4px] font-semibold" style={{ color: "var(--accent)" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
    </span>
  );
}

function Portrait({ s, size }: { s: CounselorStudent; size: number }) {
  return <StudentFace s={s} size={size} />;
}
