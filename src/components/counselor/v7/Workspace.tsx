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
import { Check, ChevronLeft, ChevronRight, Maximize2, RotateCcw } from "lucide-react";
import { DocumentPage, DocumentPreviewModal } from "@/components/counselor/v4/DocumentPreview";
import { FitPage } from "@/components/counselor/v4/DocumentDesk";
import { DreamyMoment } from "@/components/counselor/v4/overviewShared";
import { decideReview, undoReview, useReviewedRoster } from "@/lib/counselorReviews";
import { logTime } from "@/lib/counselorTimeLog";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { StudentFace } from "../v5/StudentFace";
import { submissionFor } from "../v5/submission";
import { V7Messages } from "./Messages";
import { V5Documents } from "../v5/Documents";
import { CARD, CARD_STYLE, DISPLAY, MUTED, PageHead, QuietButton, RULE, Toggle, studentHref } from "./ui";

type Tab = "reviews" | "messages" | "documents";
const TITLE: Record<Tab, string> = { reviews: "Reviews", messages: "Messages", documents: "Documents" };

export function V7Workspace({ initial }: { initial?: string }) {
  const [tab, setTab] = useState<Tab>(initial === "messages" || initial === "documents" ? initial : "reviews");
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title={TITLE[tab]} action={<Toggle label="Workspace" value={tab} onChange={setTab} options={[{ key: "reviews", label: "Reviews" }, { key: "messages", label: "Messages" }, { key: "documents", label: "Documents" }]} />} />
      {tab === "reviews" && <Reviews />}
      {tab === "messages" && <V7Messages />}
      {tab === "documents" && <V5Documents />}
    </div>
  );
}

type Item = { student: CounselorStudent; milestone: MilestoneKey };
const URGENCY = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 } as const;

/** `only` and `milestone` narrow the queue (v4 borrows this desk for its
 *  Review tab, 20 Oct 2026, with its grade picker and milestone links);
 *  v7 passes neither. */
export function Reviews({ only, milestone }: { only?: (s: CounselorStudent) => boolean; milestone?: MilestoneKey } = {}) {
  const roster = useReviewedRoster();
  // every submission waiting, students who need the most support first
  const queue = useMemo<Item[]>(() => roster
    .filter((s) => !only || only(s))
    .flatMap((s) => MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review" && (!milestone || k === milestone)).map((k) => ({ student: s, milestone: k })))
    .sort((a, b) => URGENCY[a.student.status] - URGENCY[b.student.status]), [roster, only, milestone]);
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
  const index = Math.min(current, queue.length - 1);
  const item = queue[index];

  // the reading canvas takes the room from its top to the bottom of the
  // screen and scrolls on its own, so the decision column never moves
  const docRef = useRef<HTMLDivElement>(null);
  const [fitH, setFitH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const measure = () => {
      const el = docRef.current;
      if (!el || window.innerWidth < 1024) { setFitH(undefined); return; }
      const top = el.getBoundingClientRect().top + window.scrollY;
      setFitH(Math.max(420, window.innerHeight - top - 44));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [item?.student.id, item?.milestone]);

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
    // the Documents desk's shape (Chandu: "I like the documents space. Use
    // more of that here"): the queue as a panel of pages, one stage with the
    // document and, at its foot, the decision
    <div className="grid grid-cols-1 gap-[var(--space-5)] lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside aria-label="Waiting for you" className={`flex min-w-0 flex-col gap-[var(--space-3)] self-start p-[var(--space-4)] lg:sticky lg:top-[96px] lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto ${CARD}`} style={CARD_STYLE}>
        <span className="flex items-center justify-between px-[6px] text-[12px] font-semibold tracking-[0.08em] uppercase" style={MUTED}>Waiting for you<span className="tabular-nums">{queue.length}</span></span>
        {last && <span className="px-[6px]"><UndoLine last={last} onUndo={undo} /></span>}
        <ul className="flex flex-col gap-[4px]">
          {queue.map((q, i) => {
            const on = i === index;
            const qs = submissionFor(q.student, q.milestone);
            const qLate = qs.dueInDays < 0;
            return (
              <li key={`${q.student.id}-${q.milestone}`}>
                <button type="button" onClick={() => setCurrent(i)} aria-current={on ? "true" : undefined}
                  className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[14px] border px-[10px] py-[9px] text-left"
                  style={on ? { borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)", background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : { borderColor: "transparent" }}>
                  <PageThumb />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] leading-[18px] font-semibold">{q.student.name}</span>
                    <span className="truncate text-[12.5px]" style={MUTED}>{q.milestone}{qLate ? <span style={{ color: "color-mix(in srgb, var(--color-feedback-danger-solid) 70%, var(--foreground))" }}> · late</span> : ""}</span>
                  </span>
                  {on && <Check className="h-4 w-4 flex-none" style={{ color: "var(--pc-link, var(--color-text-brand))" }} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section aria-label="Submission" className={`flex min-w-0 flex-col self-start overflow-hidden ${CARD}`} style={CARD_STYLE}>
        {/* the stage's title bar */}
        <header className="flex items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: RULE }}>
          <Link href={studentHref(item.student.id)} className="dm-quiet flex min-w-0 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
            <StudentFace s={item.student} size={40} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[17px] leading-[22px] font-semibold">{item.student.name}</span>
              <span className="truncate text-[13px]" style={MUTED}>{item.milestone} · Grade {item.student.grade}</span>
            </span>
          </Link>
          <span className="flex items-center gap-[6px]">
            <span className="mr-[6px] hidden text-[13px] tabular-nums sm:inline" style={MUTED}>{index + 1} of {queue.length}</span>
            <QuietButton label="Previous" onClick={() => setCurrent(Math.max(0, index - 1))} icon={<ChevronLeft className="h-4 w-4" aria-hidden />} />
            <QuietButton label="Next" onClick={() => setCurrent(Math.min(queue.length - 1, index + 1))} icon={<ChevronRight className="h-4 w-4" aria-hidden />} />
            <QuietButton label="Full screen" onClick={() => setFull(true)} icon={<Maximize2 className="h-4 w-4" aria-hidden />} />
          </span>
        </header>

        {/* the document beside the decision: nothing waits below a scroll
           (Chandu: "forces the content and message to sit below a tiny
           preview and requires a scroll to see the message") */}
        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* the page at reading size (Chandu: "this preview isn't valuable if
             it's so zoomed out"): a full Letter page, as wide as the canvas
             up to 100%, so it reads. The canvas fills the whole height of
             its row and scrolls on its own (Chandu, 21 Oct: "instead of this
             sitting cropped vertically, let it be the full page so the
             scroll still works but it doesn't leave a lot of space"). Reading
             the document is the review, so it stays in place, not behind a
             thumbnail and a click (SpeedGrader and Google Classroom grade
             the same way: the paper beside the comment box). */}
          <div ref={docRef} className="relative min-w-0" style={{ minHeight: fitH }}>
            <div className="dm-scroll overflow-y-auto px-[var(--space-5)] py-[var(--space-5)] xl:absolute xl:inset-0" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)" }}>
              <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="mx-auto block w-full max-w-[816px] cursor-zoom-in text-left">
                <FitPage shadow="0 1px 2px rgba(0,0,0,0.2), 0 30px 70px -28px rgba(0,0,0,0.75)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage>
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-[var(--space-5)] border-t p-[var(--space-5)] xl:border-t-0 xl:border-l" style={{ borderColor: RULE }}>
            <div className="flex flex-col gap-[var(--space-2)]">
              <span className="text-[12px] font-semibold tracking-[0.08em] uppercase" style={MUTED}>{first} wrote</span>
              <blockquote className="m-0 text-[17px] leading-[26px]">“{sub.note}”</blockquote>
              {sub.secondTry && sub.lastFeedback && <p className="text-[13.5px] leading-[20px]" style={MUTED}>Second try. You asked: “{sub.lastFeedback}”</p>}
            </div>
            <p className="text-[13.5px]" style={MUTED}>{sent} · <span className="font-semibold" style={late ? { color: "color-mix(in srgb, var(--color-feedback-danger-solid) 70%, var(--foreground))" } : sub.dueInDays <= 2 ? { color: "var(--color-feedback-warning-solid)" } : undefined}>{due}</span></p>
            <div className="mt-auto flex flex-col gap-[var(--space-3)]">
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} aria-label="Feedback"
                placeholder={sub.asks ? `Answer ${first}, or say what to change` : "Feedback (needed to ask for changes)"}
                className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[var(--space-4)] py-[var(--space-3)] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2"
                style={{ borderColor: "var(--glass-border)" }} />
              <button type="button" onClick={() => decide("Approved")} className="dm-solid inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <Check className="h-4 w-4" aria-hidden /> Approve
              </button>
              <button type="button" disabled={!feedback.trim()} onClick={() => decide("Changes Requested")} className="dm-quiet inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-45" style={{ borderColor: "var(--glass-border)" }}>
                Ask for changes
              </button>
            </div>
          </div>
        </div>
        <DocumentPreviewModal open={full} onClose={() => setFull(false)} fileName={`${item.student.name} · ${item.milestone}`} kb={0}>
          <DocumentPage student={item.student} milestone={item.milestone} />
        </DocumentPreviewModal>
      </section>
    </div>
  );
}

/** A tiny page, the Documents desk's thumbnail for a submission. */
function PageThumb() {
  return (
    <span aria-hidden className="flex h-[40px] w-[31px] flex-none flex-col gap-[3px] rounded-[4px] bg-white px-[5px] pt-[6px] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.5)]">
      <span className="h-[2px] w-[60%] rounded-full bg-[#1d2a55]" />
      {[90, 75, 85, 60].map((w) => <span key={w} className="h-[2px] rounded-full bg-[#c9cfdb]" style={{ width: `${w}%` }} />)}
    </span>
  );
}

function UndoLine({ last, onUndo }: { last: { item: Item; word: string }; onUndo: () => void }) {
  return (
    <span role="status" className="flex items-center gap-[8px] text-[14px]" style={MUTED}>
      {last.word}: {last.item.student.name.split(" ")[0]}
      <button type="button" onClick={onUndo} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
    </span>
  );
}
