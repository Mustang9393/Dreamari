"use client";

// v7 Workspace (20 Oct 2026; Chandu: "the reviews workspace, basically all the
// workspace stuff. The UI needs to be much more premium, cleaner, calmer and
// useable"). v5's workspace was three columns at once (the document, a block
// of facts, the decision with an eleven-row queue under it) under a page that
// still said HOME in the nav.
//
// Now:
// - The title is the place (Reviews, Messages, Documents) and the three are
//   one switch on the title row, so where you are is never in doubt.
// - Reviews is a focus mode: the document, large, and one calm panel beside
//   it: who, what they wrote, when it is due, feedback, Approve. The queue is
//   "1 of 11" with previous and next; the whole list opens on demand. Status
//   and top career left the panel (one tap away on the student's profile).
// Decisions go through the same store as every build (counselorReviews), so
// Home's count, the student page and the sky (an approval is a big moment)
// all follow.

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ListOrdered, Maximize2, RotateCcw } from "lucide-react";
import { DocumentPage, DocumentPreviewModal } from "@/components/counselor/v4/DocumentPreview";
import { FitPage } from "@/components/counselor/v4/DocumentDesk";
import { DreamyMoment } from "@/components/counselor/v4/overviewShared";
import { decideReview, undoReview, useReviewedRoster } from "@/lib/counselorReviews";
import { logTime } from "@/lib/counselorTimeLog";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { StudentFace } from "../v5/StudentFace";
import { submissionFor } from "../v5/submission";
import { V5Messages } from "../v5/Messages";
import { V5Documents } from "../v5/Documents";
import { CARD, CARD_STYLE, DISPLAY, Modal, MUTED, PageHead, QuietButton, RULE, Toggle, studentHref } from "./ui";

type Tab = "reviews" | "messages" | "documents";
const TITLE: Record<Tab, string> = { reviews: "Reviews", messages: "Messages", documents: "Documents" };

export function V7Workspace({ initial }: { initial?: string }) {
  const [tab, setTab] = useState<Tab>(initial === "messages" || initial === "documents" ? initial : "reviews");
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title={TITLE[tab]} action={<Toggle label="Workspace" value={tab} onChange={setTab} options={[{ key: "reviews", label: "Reviews" }, { key: "messages", label: "Messages" }, { key: "documents", label: "Documents" }]} />} />
      {tab === "reviews" && <Reviews />}
      {tab === "messages" && <V5Messages />}
      {tab === "documents" && <V5Documents />}
    </div>
  );
}

type Item = { student: CounselorStudent; milestone: MilestoneKey };
const URGENCY = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 } as const;

function Reviews() {
  const roster = useReviewedRoster();
  // every submission waiting, students who need the most support first
  const queue = useMemo<Item[]>(() => roster
    .flatMap((s) => MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").map((k) => ({ student: s, milestone: k })))
    .sort((a, b) => URGENCY[a.student.status] - URGENCY[b.student.status]), [roster]);
  // a link can open one submission: &studentId=, &milestone=, or both
  const params = useSearchParams();
  const [current, setCurrent] = useState(() => {
    const ws = params.get("studentId");
    const wm = params.get("milestone");
    return Math.max(0, queue.findIndex((q) => (!ws || q.student.id === ws) && (!wm || q.milestone === wm)));
  });
  const [feedback, setFeedback] = useState("");
  const [last, setLast] = useState<{ item: Item; word: string } | null>(null);
  const [full, setFull] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const index = Math.min(current, queue.length - 1);
  const item = queue[index];

  // the page takes the room from its top to the bottom of the screen, at US
  // Letter proportions, so the whole document reads without a scroll
  const docRef = useRef<HTMLElement>(null);
  const [fitH, setFitH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const measure = () => {
      const el = docRef.current;
      if (!el || window.innerWidth < 1024) { setFitH(undefined); return; }
      const top = el.getBoundingClientRect().top + window.scrollY;
      setFitH(Math.max(320, window.innerHeight - top - 32));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [item?.student.id, item?.milestone]);
  const docW = fitH ? Math.round((fitH * 816) / 1056) : undefined;

  const decide = (status: "Approved" | "Changes Requested") => {
    if (!item) return;
    decideReview(item.student.id, item.milestone, status, feedback);
    logTime({ activity: `Reviewed ${item.milestone}`, minutes: 5, kind: "indirect", studentId: item.student.id });
    setLast({ item, word: status === "Approved" ? "Approved" : "Changes asked" });
    setFeedback("");
    // the decided item leaves the queue: the same index is now the next one
  };
  const undo = () => { if (last) { undoReview(last.item.student.id, last.item.milestone); setLast(null); } };

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] py-[var(--space-16)] text-center">
        <DreamyMoment mood="celebrate" size={88} />
        <p className="text-[22px] font-extrabold" style={DISPLAY}>All caught up</p>
        {last && <UndoLine last={last} onUndo={undo} />}
      </div>
    );
  }

  const sub = submissionFor(item.student, item.milestone);
  const first = item.student.name.split(" ")[0];
  const late = sub.dueInDays < 0;
  const due = late ? `${-sub.dueInDays} ${sub.dueInDays === -1 ? "day" : "days"} late` : sub.dueInDays === 0 ? "Due today" : `Due in ${sub.dueInDays} ${sub.dueInDays === 1 ? "day" : "days"}`;
  const sent = sub.sentDaysAgo === 1 ? "Sent yesterday" : `Sent ${sub.sentDaysAgo} days ago`;

  return (
    <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[auto_minmax(360px,520px)] lg:justify-center lg:gap-[var(--space-10)]">
      <section ref={docRef} aria-label="Submission" className="order-2 min-w-0 lg:order-1" style={docW ? { width: docW } : undefined}>
        <div className="group relative">
          <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="block w-full cursor-zoom-in text-left">
            <FitPage fitHeight={fitH} shadow="0 1px 2px rgba(0,0,0,0.2), 0 30px 70px -28px rgba(0,0,0,0.75)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage>
          </button>
          <span className="absolute top-[12px] right-[12px] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <QuietButton label="Full screen" onClick={() => setFull(true)} icon={<Maximize2 className="h-4 w-4" aria-hidden />} />
          </span>
        </div>
        <DocumentPreviewModal open={full} onClose={() => setFull(false)} fileName={`${item.student.name} · ${item.milestone}`} kb={0}>
          <DocumentPage student={item.student} milestone={item.milestone} />
        </DocumentPreviewModal>
      </section>

      <aside aria-label="Decision" className={`order-1 flex min-w-0 flex-col gap-[var(--space-6)] self-start p-[var(--space-6)] lg:sticky lg:top-[96px] lg:order-2 ${CARD}`} style={CARD_STYLE}>
        {/* where you are in the queue, and the way through it */}
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <button type="button" onClick={() => setListOpen(true)} className="dm-quiet inline-flex cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] text-[14px] font-semibold tabular-nums" style={MUTED}>
            <ListOrdered className="h-4 w-4" aria-hidden />{index + 1} of {queue.length}
          </button>
          <span className="flex items-center gap-[6px]">
            <QuietButton label="Previous" onClick={() => setCurrent(Math.max(0, index - 1))} icon={<ChevronLeft className="h-4 w-4" aria-hidden />} />
            <QuietButton label="Next" onClick={() => setCurrent(Math.min(queue.length - 1, index + 1))} icon={<ChevronRight className="h-4 w-4" aria-hidden />} />
          </span>
        </div>

        <Link href={studentHref(item.student.id)} className="dm-quiet flex min-w-0 items-center gap-[var(--space-4)] rounded-[var(--radius-md)]">
          <StudentFace s={item.student} size={56} />
          <span className="flex min-w-0 flex-col gap-[2px]">
            <span className="truncate text-[22px] leading-[28px] font-extrabold" style={DISPLAY}>{item.student.name}</span>
            <span className="truncate text-[14px]" style={MUTED}>{item.milestone} · Grade {item.student.grade}</span>
          </span>
        </Link>

        {/* what they said when they sent it */}
        <blockquote className="m-0 text-[17px] leading-[26px]">“{sub.note}”</blockquote>
        {sub.secondTry && sub.lastFeedback && (
          <p className="-mt-[8px] text-[14px] leading-[21px]" style={MUTED}><span className="font-semibold" style={{ color: "var(--foreground)" }}>Second try.</span> You asked: “{sub.lastFeedback}”</p>
        )}

        <p className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] border-t pt-[var(--space-4)] text-[14px]" style={{ borderColor: RULE, ...MUTED }}>
          <span>{sent}</span>
          <span aria-hidden>·</span>
          <span className="font-semibold" style={late ? { color: "var(--color-feedback-danger-solid)" } : sub.dueInDays <= 2 ? { color: "var(--color-feedback-warning-solid)" } : undefined}>{due}</span>
        </p>

        <div className="flex flex-col gap-[var(--space-3)]">
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} aria-label="Feedback"
            placeholder={sub.asks ? `Answer ${first}, or say what to change` : "Feedback (needed to ask for changes)"}
            className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[var(--space-4)] py-[var(--space-3)] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2"
            style={{ borderColor: "var(--glass-border)" }} />
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            <button type="button" onClick={() => decide("Approved")} className="dm-solid inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Check className="h-4 w-4" aria-hidden /> Approve
            </button>
            <button type="button" disabled={!feedback.trim()} onClick={() => decide("Changes Requested")} className="dm-quiet inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-45" style={{ borderColor: "var(--glass-border)" }}>
              Ask for changes
            </button>
          </div>
          {last && <UndoLine last={last} onUndo={undo} />}
        </div>
      </aside>

      {listOpen && (
        <Modal title="Waiting for you" overline={`${queue.length} ${queue.length === 1 ? "review" : "reviews"}`} onClose={() => setListOpen(false)}>
          <ul className="-mx-[8px] flex flex-col">
            {queue.map((q, i) => (
              <li key={`${q.student.id}-${q.milestone}`}>
                <button type="button" onClick={() => { setCurrent(i); setListOpen(false); }} aria-current={i === index ? "true" : undefined}
                  className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] px-[8px] py-[8px] text-left"
                  style={i === index ? { background: "color-mix(in srgb, var(--primary) 14%, transparent)" } : undefined}>
                  <StudentFace s={q.student} size={32} />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{q.student.name}</span>
                  <span className="flex-none text-[13px]" style={MUTED}>{q.milestone}</span>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}

function UndoLine({ last, onUndo }: { last: { item: Item; word: string }; onUndo: () => void }) {
  return (
    <span role="status" className="flex items-center gap-[8px] text-[14px]" style={MUTED}>
      {last.word}: {last.item.student.name.split(" ")[0]}
      <button type="button" onClick={onUndo} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
    </span>
  );
}
