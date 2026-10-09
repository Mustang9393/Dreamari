"use client";

// Prepare > Review, Awaiting me, as a session rather than a to-do list
// (10 Oct 2026, Chandu: "The review UI needs work. It needs to feel more
// engaging and not boring and like work"). A v4 fork of v5's Reviews desk
// (v5/Workspace.tsx, which v5 and v6 still use): the same queue, the same
// stores (decideReview / undoReview / logTime), the same three columns
// (the page sized to the screen, the student, the decision). What changed:
// - Progress you can see: a slim session bar, "2 of 13 cleared · 11 to go",
//   that sparks forward on every decision (SparkBar, the app's own).
// - A decision you can feel: Approve stamps a green "Approved" onto the page
//   with a burst of confetti and a chime; Ask for changes stamps an amber
//   "Changes asked". Then the next submission slides in, like a deck.
// - A person, not a form: what the student wrote is a chat bubble from
//   their face.
// - Less typing: Dreamy (the counselor's assistant, who reads first and
//   drafts) offers two or three replies that fit the milestone and whether
//   the student asked something; one tap fills the box.
// - Faster: A approves, C asks for changes (once there is feedback), J and K
//   move through the queue. The keys are in the buttons' tooltips, not on
//   the screen.
// - A finish line: the last decision ends on Dreamy celebrating, a fanfare,
//   and "13 cleared in N min".
// Sounds follow the app's mute setting (play/sound.ts); motion stops under
// reduced motion.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Maximize2, RotateCcw, Sparkles } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { playCorrect, playFanfare, playSelect } from "@/components/play/sound";
import { decideReview, undoReview, useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { cv } from "@/lib/counselorBase";
import { logTime } from "@/lib/counselorTimeLog";
import { MILESTONE_ICON } from "../v5/milestoneIcons";
import { StudentFace } from "../v5/StudentFace";
import { submissionFor } from "../v5/submission";
import { DocumentPage, DocumentPreviewModal } from "./DocumentPreview";
import { FitPage } from "./DocumentDesk";
import { DreamyMoment } from "./overviewShared";
import { Dreamy } from "./InsightCharts";

type Item = { student: CounselorStudent; milestone: MilestoneKey };
type Stamp = { kind: "approved" | "changes"; key: string } | null;
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const rank = (s: CounselorStudent) => (s.status === "At Risk" ? 0 : s.status === "Needs Attention" ? 1 : 2);

/** Dreamy's draft replies: short, warm, specific to the milestone, and an
 *  answer first when the student asked something. DEMO-ONLY wording until
 *  drafts come from the model. */
function draftsFor(first: string, milestone: MilestoneKey, asks: boolean): string[] {
  const thing = milestone.toLowerCase();
  const answer = asks
    ? [`Good question, ${first}. Let's talk it through at your next check-in.`, `Yes, that can work. Keep an eye on your schedule, and tell me if it gets heavy.`]
    : [];
  return [...answer, `Great work on your ${thing}, ${first}. Approved!`, `Almost there. Add one more detail to your ${thing} and send it back.`].slice(0, 3);
}

export function ReviewSession({ only, milestone }: { only?: (s: CounselorStudent) => boolean; milestone?: MilestoneKey } = {}) {
  const all = useReviewedRoster();
  const roster = useMemo(() => (only ? all.filter(only) : all), [all, only]);
  const queue = useMemo<Item[]>(() => roster
    .flatMap((s) => MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review" && (!milestone || k === milestone)).map((k) => ({ student: s, milestone: k })))
    .sort((a, b) => rank(a.student) - rank(b.student)), [roster, milestone]);

  // the session: how many were waiting when it began, and when
  const [startCount] = useState(() => queue.length);
  const [startedAt] = useState(() => Date.now());
  const [cleared, setCleared] = useState(0);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const total = Math.max(startCount, cleared + queue.length);

  const params = useSearchParams();
  const wantStudent = params.get("studentId");
  const wantMilestone = params.get("milestone");
  const [current, setCurrent] = useState(() => Math.max(0, queue.findIndex((q) => (!wantStudent || q.student.id === wantStudent) && (!wantMilestone || q.milestone === wantMilestone))));
  const [feedback, setFeedback] = useState("");
  const [last, setLast] = useState<{ item: Item; word: string } | null>(null);
  const [full, setFull] = useState(false);
  const [stamp, setStamp] = useState<Stamp>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const index = Math.min(current, Math.max(0, queue.length - 1));
  const item = queue[index];

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
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const decide = useCallback((status: "Approved" | "Changes Requested") => {
    if (!item || stamp) return;
    if (status === "Changes Requested" && !feedback.trim()) return;
    const approved = status === "Approved";
    setStamp({ kind: approved ? "approved" : "changes", key: `${item.student.id}-${item.milestone}` });
    if (approved) { setBurst((n) => n + 1); playCorrect(); } else playSelect();
    // the stamp lands, then the item leaves and the next slides in
    timer.current = window.setTimeout(() => {
      decideReview(item.student.id, item.milestone, status, feedback);
      logTime({ activity: `Reviewed ${item.milestone}`, minutes: 5, kind: "indirect", studentId: item.student.id });
      setLast({ item, word: approved ? "Approved" : "Changes asked" });
      setFeedback("");
      setStamp(null);
      setCleared((n) => n + 1);
      if (queue.length === 1) { playFanfare(); setFinishedAt(Date.now()); }
    }, 720);
  }, [item, stamp, feedback, queue.length]);

  // keys: A approve, C ask for changes, J / K next and previous (never while
  // typing in the feedback box)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable))) return;
      if (full) return;
      const k = e.key.toLowerCase();
      if (k === "a") { e.preventDefault(); decide("Approved"); }
      else if (k === "c") { e.preventDefault(); decide("Changes Requested"); }
      else if (k === "j") { e.preventDefault(); setCurrent((i) => Math.min(queue.length - 1, i + 1)); }
      else if (k === "k") { e.preventDefault(); setCurrent((i) => Math.max(0, i - 1)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, queue.length, full]);

  const undo = () => { if (!last) return; undoReview(last.item.student.id, last.item.milestone); setCleared((n) => Math.max(0, n - 1)); setLast(null); };
  const pct = total ? Math.round((cleared / total) * 100) : 0;
  const bar = (
    <div className="v4-rs-bar" role="status" aria-live="polite">
      <span className="v4-rs-bar-copy"><b>{cleared} of {total}</b> cleared{queue.length > 0 && <span> · {queue.length} to go</span>}</span>
      <SparkBar percent={pct} min={2} height={6} fill="linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))" glow="var(--primary)" memoryKey="v4-review-session" />
    </div>
  );

  if (!item) {
    const minutes = Math.max(1, Math.round(((finishedAt ?? startedAt) - startedAt) / 60000));
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        {cleared > 0 && bar}
        <div className="v4-rs-done">
          <LocalBurst nonce={cleared > 0 ? 1 : 0} />
          <DreamyMoment mood="celebrate" size={96} />
          <p className="v4-rs-done-title">{cleared > 0 ? `All ${cleared} cleared` : "All caught up"}</p>
          {cleared > 0 && <p className="v4-rs-done-sub">{cleared === 1 ? "One review" : `${cleared} reviews`} in {minutes} {minutes === 1 ? "minute" : "minutes"}. Every student heard back.</p>}
          {last && <UndoLink last={last} onUndo={undo} />}
        </div>
      </div>
    );
  }

  const Icon = MILESTONE_ICON[item.milestone];
  const sub = submissionFor(item.student, item.milestone);
  const first = item.student.name.split(" ")[0];
  const top = item.student.topMatches[0]?.title;
  const due = sub.dueInDays < 0 ? `${-sub.dueInDays} ${sub.dueInDays === -1 ? "day" : "days"} late` : sub.dueInDays === 0 ? "Due today" : `Due in ${sub.dueInDays} ${sub.dueInDays === 1 ? "day" : "days"}`;
  const drafts = draftsFor(first, item.milestone, sub.asks);
  const itemKey = `${item.student.id}-${item.milestone}`;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {bar}
      <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[auto_minmax(0,1fr)_320px] lg:gap-[var(--space-8)]">
        <section ref={docRef} aria-label="Submission" className="order-2 flex min-w-0 flex-col lg:order-1" style={docW ? { width: docW } : undefined}>
          <div key={itemKey} className={`v4-rs-page ${stamp ? "is-leaving" : "is-arriving"}`}>
            <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="block w-full cursor-zoom-in text-left">
              <FitPage fitHeight={fitH} shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage>
            </button>
            <button type="button" onClick={() => setFull(true)} className="v4-rs-full dm-quiet"><Maximize2 className="h-[13px] w-[13px]" aria-hidden /> Full screen</button>
            {stamp && <span className={`v4-rs-stamp is-${stamp.kind}`} aria-hidden>{stamp.kind === "approved" ? "Approved" : "Changes asked"}</span>}
            <LocalBurst nonce={burst} />
          </div>
          <DocumentPreviewModal open={full} onClose={() => setFull(false)} fileName={`${item.student.name} · ${item.milestone}`} kb={0}>
            <DocumentPage student={item.student} milestone={item.milestone} />
          </DocumentPreviewModal>
        </section>

        <section aria-label="Student" className="order-1 flex min-w-0 flex-col gap-[var(--space-6)] lg:order-2">
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <Link href={`${cv("students")}&studentId=${encodeURIComponent(item.student.id)}`} className="dm-quiet dm-row flex min-w-0 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[22px] leading-[26px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{item.student.name}</span>
                <span className="flex items-center gap-[6px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}><Icon className="h-[15px] w-[15px]" aria-hidden />{item.milestone} · Grade {item.student.grade}</span>
              </span>
            </Link>
            <span className="v4-rs-count">{index + 1} / {queue.length}</span>
          </div>

          {/* what they wrote, as a message from them */}
          <div className="v4-rs-message">
            <StudentFace s={item.student} size={44} />
            <div className="v4-rs-bubble">
              {sub.asks && <span className="v4-rs-asks">Has a question</span>}
              <p>{sub.note}</p>
            </div>
          </div>

          {sub.secondTry && sub.lastFeedback && (
            <p className="v4-rs-second"><b>Second try.</b> You asked: “{sub.lastFeedback}”</p>
          )}

          <dl className="v4-rs-facts">
            <div><dt>Sent</dt><dd>{sub.sentDaysAgo === 1 ? "Yesterday" : `${sub.sentDaysAgo} days ago`}</dd></div>
            <div><dt>Deadline</dt><dd className={sub.dueInDays < 0 ? "v5-risk" : sub.dueInDays <= 2 ? "v5-warn" : undefined}>{due}</dd></div>
            <div><dt>Status</dt><dd className={item.student.status === "On Track" ? "v5-ok" : item.student.status === "At Risk" ? "v5-risk" : "v5-warn"}>{item.student.status}</dd></div>
            <div><dt>Top career</dt><dd>{top ?? "Not picked yet"}</dd></div>
          </dl>
        </section>

        <aside aria-label="Decision and queue" className="order-3 flex min-w-0 flex-col gap-[var(--space-6)] lg:sticky lg:top-[100px] lg:self-start">
          <div className="flex flex-col gap-[var(--space-3)]">
            {/* Dreamy reads first and drafts; one tap fills the box */}
            <div className="v4-rs-drafts">
              <span className="v4-rs-drafts-head"><Dreamy mood="idea" size={26} /> Dreamy suggests</span>
              {drafts.map((d) => <button key={d} type="button" onClick={() => setFeedback(d)} aria-pressed={feedback === d} className="v4-rs-draft dm-quiet">{d}</button>)}
            </div>
            <label className="flex flex-col gap-[var(--space-2)]">
              <span className="sr-only">Feedback</span>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder={sub.asks ? `Answer ${first}, or say what to change` : "Add a note, or say what to change"} className="v4-rs-textarea" />
            </label>
            <div className="grid grid-cols-2 gap-[var(--space-2)]">
              <IconTip label="Approve (A)">
                <button type="button" onClick={() => decide("Approved")} disabled={!!stamp} className="v4-rs-approve dm-solid"><Check className="h-4 w-4" aria-hidden /> Approve</button>
              </IconTip>
              <IconTip label={feedback.trim() ? "Ask for changes (C)" : "Write what to change first"}>
                <button type="button" disabled={!feedback.trim() || !!stamp} onClick={() => decide("Changes Requested")} className="v4-rs-changes dm-quiet">Ask for changes</button>
              </IconTip>
            </div>
            {last && <UndoLink last={last} onUndo={undo} />}
          </div>
          <div className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
            <span className="v4-rs-next-head">Up next <span>J / K</span></span>
            <ul className="dm-scroll flex max-h-[calc(30vh/var(--vz,1))] flex-col overflow-y-auto">
              {queue.map((q, i) => {
                const QIcon = MILESTONE_ICON[q.milestone];
                const on = i === index;
                return (
                  <li key={`${q.student.id}-${q.milestone}`}>
                    <button type="button" onClick={() => setCurrent(i)} aria-current={on ? "true" : undefined} className="v4-rs-next dm-quiet">
                      <StudentFace s={q.student} size={30} />
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
    </div>
  );
}

function UndoLink({ last, onUndo }: { last: { item: Item; word: string }; onUndo: () => void }) {
  return (
    <span role="status" className="v4-rs-undo">
      <Sparkles className="h-[14px] w-[14px]" aria-hidden />{last.word}: {last.item.student.name.split(" ")[0]}
      <button type="button" onClick={onUndo} className="dm-link"><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
    </span>
  );
}
