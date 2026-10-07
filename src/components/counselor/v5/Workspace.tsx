"use client";

// v5 Workspace (7 Oct 2026): the operational tools (plan section 4), Reviews
// first because it is the one with a queue. One submission at a time: the
// student's actual document (v4's DocumentPage), Approve or Ask for changes,
// then the next one. Decisions go through the same store v4 uses
// (counselorReviews.ts), so Home's counts and the student page update too.

import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Maximize2, MessageSquare, RotateCcw } from "lucide-react";
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
import { submissionFor } from "./submission";
// Documents is v4's own Productivity Suite (8 Oct 2026: "for the documents
// section of v5, please go back to how we had it in v4"), under the letters
// queue (V5Documents, same day)
import { V5Documents } from "./Documents";
import { logTime } from "@/lib/counselorTimeLog";

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
export function Reviews({ only }: { /** narrows the queue (v4's grade picker) */ only?: (s: CounselorStudent) => boolean } = {}) {
  const all = useReviewedRoster();
  const roster = useMemo(() => (only ? all.filter(only) : all), [all, only]);
  // every submission waiting for the counselor, most urgent students first
  const queue = useMemo<Item[]>(() => roster.flatMap((s) => MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").map((k) => ({ student: s, milestone: k })))
    .sort((a, b) => (a.student.status === "At Risk" ? 0 : a.student.status === "Needs Attention" ? 1 : 2) - (b.student.status === "At Risk" ? 0 : b.student.status === "Needs Attention" ? 1 : 2)), [roster]);
  // a link can open one submission (8 Oct 2026 audit: "Resume 4" on Home and
  // a student's Review button opened whatever came first):
  // &milestone=Resume, &studentId=ref-3, or both
  const params = useSearchParams();
  const wantStudent = params.get("studentId");
  const wantMilestone = params.get("milestone");
  const [current, setCurrent] = useState(() => {
    const i = queue.findIndex((q) => (!wantStudent || q.student.id === wantStudent) && (!wantMilestone || q.milestone === wantMilestone));
    return Math.max(0, i);
  });
  const [feedback, setFeedback] = useState("");
  const [last, setLast] = useState<{ item: Item; word: string } | null>(null);
  const [full, setFull] = useState(false);
  const item = queue[Math.min(current, queue.length - 1)];
  // the room from the document's top to the bottom of the screen; the page
  // takes that height and the matching width (US Letter, 8.5 x 11)
  const docRef = useRef<HTMLElement>(null);
  const [fitH, setFitH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const measure = () => {
      const el = docRef.current;
      if (!el || window.innerWidth < 1024) { setFitH(undefined); return; }
      const top = el.getBoundingClientRect().top + window.scrollY;
      setFitH(Math.max(300, window.innerHeight - top - 24));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [item?.student.id, item?.milestone]);
  const docW = fitH ? Math.round((fitH * 816) / 1056) : undefined;

  const decide = (status: "Approved" | "Changes Requested") => {
    if (!item) return;
    decideReview(item.student.id, item.milestone, status, feedback);
    // reviews log their own time (indirect: work done for a student)
    logTime({ activity: `Reviewed ${item.milestone}`, minutes: 5, kind: "indirect", studentId: item.student.id });
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
  const sub = submissionFor(item.student, item.milestone);
  const first = item.student.name.split(" ")[0];
  const top = item.student.topMatches[0]?.title;
  const due = sub.dueInDays < 0 ? `${-sub.dueInDays} ${sub.dueInDays === -1 ? "day" : "days"} late` : sub.dueInDays === 0 ? "Due today" : `Due in ${sub.dueInDays} ${sub.dueInDays === 1 ? "day" : "days"}`;
  return (
    // Three columns (Chandu, 7 Oct 2026): the page, sized to the screen's
    // height so the whole document shows without a scroll; what the student
    // said and the context around it; and the decision, so feedback and the
    // buttons never need a scroll either.
    <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[auto_minmax(0,1fr)_300px] lg:gap-[var(--space-8)]">
      <section ref={docRef} aria-label="Submission" className="order-2 flex min-w-0 flex-col lg:order-1" style={docW ? { width: docW } : undefined}>
        <div className="relative">
          <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="block w-full cursor-zoom-in text-left">
            <FitPage fitHeight={fitH} shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage>
          </button>
          <button type="button" onClick={() => setFull(true)} className="dm-quiet absolute top-[10px] right-[10px] inline-flex h-8 items-center gap-[6px] rounded-full border px-[10px] text-[12.5px] font-semibold" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <Maximize2 className="h-[13px] w-[13px]" aria-hidden /> Full screen
          </button>
        </div>
        <DocumentPreviewModal open={full} onClose={() => setFull(false)} fileName={`${item.student.name} · ${item.milestone}`} kb={0}>
          <DocumentPage student={item.student} milestone={item.milestone} />
        </DocumentPreviewModal>
      </section>

      <section aria-label="Context" className="order-1 flex min-w-0 flex-col gap-[var(--space-6)] lg:order-2">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <Link href={`${cv("students")}&studentId=${encodeURIComponent(item.student.id)}`} className="dm-quiet flex min-w-0 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
            <Portrait s={item.student} size={52} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[20px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{item.student.name}</span>
              <span className="flex items-center gap-[6px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}><Icon className="h-[15px] w-[15px]" aria-hidden />{item.milestone} · Grade {item.student.grade}</span>
            </span>
          </Link>
          <span className="flex-none text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{index + 1} of {queue.length}</span>
        </div>

        {/* what they said when they sent it */}
        <figure className="m-0 flex flex-col gap-[var(--space-2)] border-l-[3px] pl-[var(--space-4)]" style={{ borderColor: "var(--accent)" }}>
          <figcaption className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <MessageSquare className="h-[14px] w-[14px]" aria-hidden /> {first} wrote
            {sub.asks && <span className="rounded-full px-[8px] py-[1px] text-[11.5px] font-semibold" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}>Has a question</span>}
          </figcaption>
          <blockquote className="m-0 text-[17px] leading-[25px] font-medium">“{sub.note}”</blockquote>
        </figure>

        {sub.secondTry && sub.lastFeedback && (
          <div className="flex flex-col gap-[4px]">
            <span className="text-[13px] font-semibold v5-warn">Second try</span>
            <p className="text-[14.5px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>You asked: “{sub.lastFeedback}”</p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-[var(--space-5)] gap-y-[var(--space-4)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
          <Fact label="Sent" value={sub.sentDaysAgo === 1 ? "Yesterday" : `${sub.sentDaysAgo} days ago`} />
          <Fact label="Deadline" value={due} cls={sub.dueInDays < 0 ? "v5-risk" : sub.dueInDays <= 2 ? "v5-warn" : undefined} />
          <Fact label="Status" value={item.student.status} cls={item.student.status === "On Track" ? "v5-ok" : item.student.status === "At Risk" ? "v5-risk" : "v5-warn"} />
          <Fact label="Top career" value={top ?? "Not picked yet"} />
        </dl>
      </section>

      <aside aria-label="Decision and queue" className="order-3 flex min-w-0 flex-col gap-[var(--space-6)] lg:sticky lg:top-[100px] lg:self-start">
        <div className="flex flex-col gap-[var(--space-3)]">
          <label className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[14px] font-semibold">Feedback</span>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder={sub.asks ? `Answer ${first}, or say what to change` : "Needed if you ask for changes"} className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
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
          <ul className="dm-scroll flex max-h-[34vh] flex-col overflow-y-auto">
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

function Fact({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[2px]">
      <dt className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</dt>
      <dd className={`m-0 truncate text-[15px] leading-[20px] font-semibold ${cls ?? ""}`}>{value}</dd>
    </div>
  );
}

function Portrait({ s, size }: { s: CounselorStudent; size: number }) {
  return <StudentFace s={s} size={size} />;
}
