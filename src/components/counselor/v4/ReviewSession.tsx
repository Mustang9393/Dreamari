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

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Pencil, ChevronDown, ChevronLeft, ChevronRight, Maximize2, MessageSquareText, RotateCcw, Sparkles, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { playCorrect, playFanfare, playSelect } from "@/components/play/sound";
import { decideReview, undoReview, useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { cv } from "@/lib/counselorBase";
import { logTime } from "@/lib/counselorTimeLog";
import { StudentFace } from "../v5/StudentFace";
import { submissionFor } from "../v5/submission";
import { DocumentPage, DocumentPreviewModal } from "./DocumentPreview";
import { FitPage } from "./DocumentDesk";
import { GlassesDreamy } from "./InsightCharts";

type Item = { student: CounselorStudent; milestone: MilestoneKey };
type Stamp = { kind: "approved" | "changes"; key: string } | null;
const rank = (s: CounselorStudent) => (s.status === "At Risk" ? 0 : s.status === "Needs Attention" ? 1 : 2);

/** Dreamy's draft replies: short, warm, specific to the milestone, and an
 *  answer first when the student asked something. DEMO-ONLY wording until
 *  drafts come from the model. */
function draftsFor(first: string, milestone: MilestoneKey, asks: boolean): { label: string; text: string }[] {
  const thing = milestone.toLowerCase();
  const answer = asks
    ? [{ label: "Talk at check-in", text: `Good question, ${first}. Let's talk it through at your next check-in.` }, { label: "Yes, watch the load", text: `Yes, that can work. Keep an eye on your schedule, and tell me if it gets heavy.` }]
    : [];
  return [...answer, { label: "Great work", text: `Great work on your ${thing}, ${first}. Approved!` }, { label: "One more detail", text: `Almost there. Add one more detail to your ${thing} and send it back.` }].slice(0, 3);
}

/** One desktop layout (10 Oct 2026). Three panes and Canvas were compared
 *  the same day; after Chandu's notes on Canvas ("these 2 should not be
 *  inside a box", "the right pane should be sticky and no needing scroll",
 *  "the documents cant be full size in the middle with scrolling") the two
 *  had converged, so the switch went: a rail of faces, the page sized to
 *  the screen, and the reply pane beside it with its buttons always in view. */
// lg and up gets the desktop layouts; below that, the touch layout
const WIDE = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => { const q = window.matchMedia(WIDE); q.addEventListener("change", cb); return () => q.removeEventListener("change", cb); };
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true);

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
  // each submission keeps its own reply, so moving through the queue never
  // carries one student's words into another's box
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [last, setLast] = useState<{ item: Item; word: string } | null>(null);
  const [full, setFull] = useState(false);
  const [stamp, setStamp] = useState<Stamp>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const index = Math.min(current, Math.max(0, queue.length - 1));
  // A decided submission stays on screen, stamped, with what was sent, until
  // Next (10 Oct 2026, Chandu on Messages: "there should be a moment to edit
  // or delete ... Dont make them disappear unless i click done"; the same
  // rule here). The store has it as decided already, so it has left the
  // queue; `held` keeps showing it.
  const [held, setHeld] = useState<{ item: Item; kind: "approved" | "changes"; text: string } | null>(null);
  const item = held?.item ?? queue[index];
  const replyKey = item ? `${item.student.id}-${item.milestone}` : "";
  const feedback = replies[replyKey] ?? "";
  const setFeedback = useCallback((text: string) => setReplies((r) => ({ ...r, [replyKey]: text })), [replyKey]);

  const docRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);
  const wide = useWide();
  const canvas = wide;
  // the rail's scroll cues: fades at the ends and "N more below"
  const [rail, setRail] = useState({ atTop: true, atBottom: true, below: 0 });
  const measureRail = useCallback((el: HTMLElement) => {
    const atTop = el.scrollTop < 4;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    const edge = el.scrollTop + el.clientHeight - 12;
    const below = [...el.children].filter((c) => (c as HTMLElement).offsetTop - el.offsetTop > edge).length;
    setRail((r) => (r.atTop === atTop && r.atBottom === atBottom && r.below === below ? r : { atTop, atBottom, below }));
  }, []);
  const [sheet, setSheet] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  // the touch layout's filmstrip keeps the current page in view, sideways only
  useEffect(() => {
    const strip = stripRef.current;
    const cell = strip?.querySelector<HTMLElement>('[data-on="true"]');
    if (!strip || !cell) return;
    const left = cell.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + cell.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: Math.max(0, left - 16), behavior: "smooth" });
  }, [index, queue.length, wide]);
  // the reply sheet: the box takes focus, Escape closes it
  useEffect(() => {
    if (!sheet) return;
    replyRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSheet(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[data-on="true"]');
    if (!list || !row) return;
    const top = row.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" });
  }, [index, queue.length]);
  const [fitH, setFitH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const measure = () => {
      const el = docRef.current;
      if (!el || window.innerWidth < 1024) { setFitH(undefined); return; }
      const top = el.getBoundingClientRect().top + window.scrollY;
      // the three panes put a 44px document bar above the page
      setFitH(Math.max(280, window.innerHeight - top - 16));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [item?.student.id, item?.milestone, wide]);
  // a new submission starts at the top of its page
  useEffect(() => {
    if (!canvas) return;
    const el = docRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 120) window.scrollTo({ top: window.scrollY + top - 140, behavior: "smooth" });
  }, [canvas, item?.student.id, item?.milestone]);
  useEffect(() => {
    const el = listRef.current;
    if (!el || !canvas) return;
    const ro = new ResizeObserver(() => measureRail(el));
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvas, queue.length, measureRail]);
  const docW = fitH ? Math.round((fitH * 816) / 1056) : undefined;
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const decide = useCallback((status: "Approved" | "Changes Requested") => {
    if (!item || stamp || held) return;
    if (status === "Changes Requested" && !feedback.trim()) return;
    const approved = status === "Approved";
    setStamp({ kind: approved ? "approved" : "changes", key: `${item.student.id}-${item.milestone}` });
    if (approved) { setBurst((n) => n + 1); playCorrect(); } else playSelect();
    // the stamp lands and stays; the page waits for Next
    timer.current = window.setTimeout(() => {
      decideReview(item.student.id, item.milestone, status, feedback);
      logTime({ activity: `Reviewed ${item.milestone}`, minutes: 5, kind: "indirect", studentId: item.student.id });
      setLast({ item, word: approved ? "Approved" : "Changes asked" });
      setHeld({ item, kind: approved ? "approved" : "changes", text: feedback.trim() });
      setFeedback("");
      setStamp(null);
      setSheet(false);
      setCleared((n) => n + 1);
    }, 520);
  }, [item, stamp, held, feedback, setFeedback]);

  /** Move on from a decided submission; the last one ends the session. */
  const next = useCallback(() => {
    if (!held) return;
    setHeld(null);
    if (queue.length === 0) { playFanfare(); setFinishedAt(Date.now()); }
  }, [held, queue.length]);
  /** Take the decision back: the submission returns to the queue with what
   *  was written still in the box. */
  const editHeld = () => {
    if (!held) return;
    const key = `${held.item.student.id}-${held.item.milestone}`;
    undoReview(held.item.student.id, held.item.milestone);
    setReplies((r) => ({ ...r, [key]: held.text }));
    setCleared((n) => Math.max(0, n - 1));
    setLast(null);
    setHeld(null);
  };
  const go = (i: number) => { setHeld(null); if (held && queue.length === 0) { playFanfare(); setFinishedAt(Date.now()); } setCurrent(i); };

  // keys: A approve, C ask for changes, J / K next and previous (never while
  // typing in the feedback box)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable))) return;
      if (full) return;
      const k = e.key.toLowerCase();
      if (held) {
        if (k === "n" || k === "j" || k === "enter") { e.preventDefault(); next(); }
        return;
      }
      if (k === "a") { e.preventDefault(); decide("Approved"); }
      else if (k === "c") { e.preventDefault(); decide("Changes Requested"); }
      else if (k === "j") { e.preventDefault(); setCurrent((i) => Math.min(queue.length - 1, i + 1)); }
      else if (k === "k") { e.preventDefault(); setCurrent((i) => Math.max(0, i - 1)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, next, held, queue.length, full]);

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
          <GlassesDreamy size={112} hop={cleared > 0 ? 1 : 0} />
          <p className="v4-rs-done-title">{cleared > 0 ? `All ${cleared} cleared` : "All caught up"}</p>
          {cleared > 0 && <p className="v4-rs-done-sub">{cleared === 1 ? "One review" : `${cleared} reviews`} in {minutes} {minutes === 1 ? "minute" : "minutes"}. Every student heard back.</p>}
          {last && !held && <UndoLink last={last} onUndo={undo} />}
        </div>
      </div>
    );
  }

  const sub = submissionFor(item.student, item.milestone);
  const first = item.student.name.split(" ")[0];
  const due = sub.dueInDays < 0 ? `${-sub.dueInDays} ${sub.dueInDays === -1 ? "day" : "days"} late` : sub.dueInDays === 0 ? "Due today" : `Due in ${sub.dueInDays} ${sub.dueInDays === 1 ? "day" : "days"}`;
  const drafts = draftsFor(first, item.milestone, sub.asks);
  const itemKey = `${item.student.id}-${item.milestone}`;
  const profileHref = `${cv("students")}&studentId=${encodeURIComponent(item.student.id)}`;

  // v1's review detail shows Submitted, Due Date and Status (ReviewQueue.tsx);
  // those three stay, as one line. Top career was only ever v5's, and it
  // is one click away on the student's profile.
  const facts = [
    { k: "sent", text: `Sent ${sub.sentDaysAgo === 1 ? "yesterday" : `${sub.sentDaysAgo} days ago`}` },
    { k: "due", text: due, tone: sub.dueInDays < 0 ? "v5-risk" : sub.dueInDays <= 2 ? "v5-warn" : undefined },
    { k: "status", text: item.student.status, tone: item.student.status === "On Track" ? "v5-ok" : item.student.status === "At Risk" ? "v5-risk" : "v5-warn" },
  ];

  // Three panes (10 Oct 2026, Chandu: "The up next is now sort of hidden
  // and i think the composer needs more space? Maybe the thumbnail or doc
  // can have a text scrim with the student's question or note ... up next
  // gets its own thing like youtube does"; then "the sent/deadline etc all
  // of that is taking too much space imo, and dreamy can be bigger and
  // break containers' frames"):
  // 1. the page, with what the student wrote on a scrim at its foot, so the
  //    work, who wrote it and their words read together (the page and Up
  //    next already name the student and milestone, so the middle doesn't);
  // 2. the composer in the middle, the widest free space, and nothing but
  //    the reply ("Middle column is too cluttered now"): one frame with
  //    Dreamy sitting across its top edge, "Reply to Lily" and one quiet
  //    line of facts, Dreamy's drafts as short chips (a tap puts the full
  //    sentence in the box), a reply box that grows to fill, the two
  //    decisions;
  // 3. Up next as its own full-height panel, YouTube's playlist: the
  //    session's progress on top, then each submission as the student's
  //    face with their name and milestone ("instead of the tiny thumbnails
  //    ... show the avatars? we cant really see whats in the thumbnails").
  // From the touch layout, desktop kept one thing: a "‹ 3 of 13 ›" pager on
  // the page, so moving on doesn't depend on knowing J and K.
  const shownStamp = stamp?.kind ?? held?.kind ?? null;
  const upNext = held ? queue[index] : undefined;
  const heldPanel = held && (
    <div className="v4-rs-held" role="status">
      <span className="v4-rs-held-head"><Check className="h-4 w-4" aria-hidden />{held.kind === "approved" ? "Approved" : "Changes asked"} · sent to {first}</span>
      {held.text ? <p className="v4-rs-held-bubble">{held.text}</p> : <p className="v4-rs-held-none">No note. {first} sees it was approved.</p>}
      <span className="v4-rs-held-actions">
        <IconTip label="Take it back and edit"><button type="button" onClick={editHeld} className="v4-rs-changes dm-quiet"><Pencil className="h-4 w-4" aria-hidden />Edit</button></IconTip>
        <IconTip label="Next (N)"><button type="button" onClick={next} className="v4-rs-approve dm-solid">{upNext ? <>Next: {upNext.student.name.split(" ")[0]}</> : "Finish"}<ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
      </span>
    </div>
  );
  const pager = queue.length > 1 && (
    <div className="v4-rs-pager" role="group" aria-label="Move through the queue">
      <IconTip label="Previous (K)"><button type="button" onClick={() => go(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous" className="dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
      <span className="tabular-nums">{index + 1} of {queue.length}</span>
      <IconTip label="Next (J)"><button type="button" onClick={() => go(Math.min(queue.length - 1, index + 1))} disabled={index >= queue.length - 1} aria-label="Next" className="dm-quiet"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
    </div>
  );
  const fullBtn = <button type="button" onClick={() => setFull(true)} className="v4-rs-full dm-quiet"><Maximize2 className="h-[13px] w-[13px]" aria-hidden />Full screen</button>;
  const preview = (
    <DocumentPreviewModal open={full} onClose={() => setFull(false)} fileName={`${item.student.name} · ${item.milestone}`} kb={0}>
      <DocumentPage student={item.student} milestone={item.milestone} />
    </DocumentPreviewModal>
  );
  const page = (
    <section ref={docRef} aria-label="Submission" className="flex min-w-0 flex-col" style={docW ? { width: docW } : undefined}>
      {wide && <div className="v4-rs-pagebar">{pager || <span />}{fullBtn}</div>}
      <div key={itemKey} className="v4-rs-page is-arriving">
        <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="block w-full cursor-zoom-in text-left">
          <FitPage fitHeight={fitH} shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage>
        </button>
        {/* what they wrote, on the page itself */}
        <div className="v4-rs-scrim">
          <Link href={profileHref} className="v4-rs-scrim-who"><StudentFace s={item.student} size={26} /><span className="truncate">{item.student.name}</span></Link>
          <p className="v4-rs-scrim-note">{sub.note}</p>
          {sub.secondTry && sub.lastFeedback && <p className="v4-rs-scrim-second"><b>Second try.</b> You asked: “{sub.lastFeedback}”</p>}
        </div>
        {!wide && (
          <IconTip label="Full screen" className="v4-rs-full-tip">
            <button type="button" onClick={() => setFull(true)} className="v4-rs-full dm-quiet" aria-label="Full screen"><Maximize2 className="h-[13px] w-[13px]" aria-hidden /></button>
          </IconTip>
        )}
        {shownStamp && <span className={`v4-rs-stamp is-${shownStamp}`} aria-hidden>{shownStamp === "approved" ? "Approved" : "Changes asked"}</span>}
        <LocalBurst nonce={burst} />
      </div>
      {preview}
    </section>
  );

  const composer = (
    <div className="v4-rs-composer">
      {/* Dreamy reads first and drafts; sits across the frame's edge */}
      <span className="v4-rs-dreamy"><GlassesDreamy size={108} thinking={!!feedback.trim()} hop={burst} /></span>
      {!wide && (
        <IconTip label="Close">
          <button type="button" onClick={() => setSheet(false)} className="v4-rs-sheet-close dm-quiet" aria-label="Close"><X className="h-4 w-4" aria-hidden /></button>
        </IconTip>
      )}
      <div className="v4-rs-composer-head">
        <h2 className="v4-rs-composer-title">Reply to {first}</h2>
        <p className="v4-rs-facts">{facts.map((f) => <span key={f.k} className={f.tone}>{f.text}</span>)}</p>
      </div>
      {heldPanel || <>
      <div className="v4-rs-drafts" role="group" aria-label="Dreamy's drafts">
        {drafts.map((d) => <IconTip key={d.label} label={d.text}><button type="button" onClick={() => setFeedback(d.text)} aria-pressed={feedback === d.text} className="v4-rs-draft dm-quiet"><Sparkles className="h-[13px] w-[13px]" aria-hidden />{d.label}</button></IconTip>)}
      </div>
      <label className="flex flex-1 flex-col">
        <span className="sr-only">Feedback</span>
        <textarea ref={replyRef} value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder={sub.asks ? `Answer ${first}, or say what to change` : "Add a note, or say what to change"} className="v4-rs-textarea" />
      </label>
      <div className="v4-rs-actions grid grid-cols-2 gap-[var(--space-2)]">
        <IconTip label="Approve (A)">
          <button type="button" onClick={() => decide("Approved")} disabled={!!stamp} className="v4-rs-approve dm-solid"><Check className="h-4 w-4" aria-hidden /> Approve</button>
        </IconTip>
        <IconTip label={feedback.trim() ? "Ask for changes (C)" : "Write what to change first"}>
          <button type="button" disabled={!feedback.trim() || !!stamp} onClick={() => decide("Changes Requested")} className="v4-rs-changes dm-quiet">Ask for changes</button>
        </IconTip>
      </div>
      </>}
    </div>
  );

  // Phones and tablets (10 Oct 2026, Chandu: "for tablet and mobile Im
  // pretty sure we'll need a better UI for reviews etc with the floating
  // controls etc like canva/photoshop/doc software"). The page is the
  // canvas, full width; the queue is a filmstrip of pages along the top
  // (Canva's page strip); the controls float in one toolbar at the thumb's
  // reach (Previous, Reply, Approve, Next); Reply opens the same composer
  // as a bottom sheet, Dreamy across its edge.
  if (!wide) {
    return (
      <div className="flex flex-col gap-[var(--space-4)] pb-[112px]">
        {bar}
        <ol ref={stripRef} className="v4-rs-strip dm-scroll" aria-label="Up next">
          {queue.map((q, i) => {
            const on = !held && i === index;
            return (
              <li key={`${q.student.id}-${q.milestone}`} data-on={on ? "true" : undefined}>
                <button type="button" onClick={() => go(i)} aria-current={on ? "true" : undefined} aria-label={`${q.student.name}, ${q.milestone}`} className="v4-rs-strip-cell">
                  <span className="v4-rs-strip-face"><StudentFace s={q.student} size={52} /></span>
                  <span className="v4-rs-strip-name">{q.student.name.split(" ")[0]}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {page}
        {last && !held && <UndoLink last={last} onUndo={undo} />}
        <nav className="v4-rs-toolbar" aria-label="Review controls">
          <IconTip label="Previous (K)">
            <button type="button" onClick={() => go(Math.max(0, index - 1))} disabled={index === 0} className="v4-rs-tool" aria-label="Previous"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
          </IconTip>
          {held ? <button type="button" onClick={() => setSheet(true)} className="v4-rs-tool is-label"><Check className="h-[18px] w-[18px]" aria-hidden />Sent</button> : <button type="button" onClick={() => setSheet(true)} className="v4-rs-tool is-label" aria-haspopup="dialog" aria-expanded={sheet}>
            <MessageSquareText className="h-[18px] w-[18px]" aria-hidden />Reply{feedback.trim() && <span className="v4-rs-tool-dot" aria-label="Draft saved" />}
          </button>}
          {held
            ? <button type="button" onClick={next} className="v4-rs-tool is-approve">{upNext ? "Next" : "Finish"}<ChevronRight className="h-[18px] w-[18px]" aria-hidden /></button>
            : <button type="button" onClick={() => decide("Approved")} disabled={!!stamp} className="v4-rs-tool is-approve"><Check className="h-[18px] w-[18px]" aria-hidden />Approve</button>}
          <IconTip label="Next (J)">
            <button type="button" onClick={() => go(Math.min(queue.length - 1, index + 1))} disabled={index >= queue.length - 1} className="v4-rs-tool" aria-label="Next"><ChevronRight className="h-5 w-5" aria-hidden /></button>
          </IconTip>
        </nav>
        {sheet && (
          <>
            <div className="v4-rs-sheet-scrim" onClick={() => setSheet(false)} aria-hidden />
            <div role="dialog" aria-modal="true" aria-label={`Reply to ${first}`} className="v4-rs-sheet">{composer}</div>
          </>
        )}
      </div>
    );
  }

  // Desktop: Canvas, the default (10 Oct 2026, Chandu: "why are you
  // refusing to make the canvas the default surface on reviews again? The
  // current size doesnt make it legible at all"; earlier "the right pane
  // should be sticky and no needing scroll", "these 2 should not be inside
  // a box", "the documents can be full size in the middle with scrolling").
  // Built like a document app: the page at reading size (up to 100%) in the
  // window's own scroll, no frame and no inner scroll box; the rail of
  // faces and the reply pane pinned beside it, so Approve and Ask for
  // changes never leave view while you read.
  // The reply pane (10 Oct 2026, Chandu: "the composer should be accessible
  // and easy to use and DESIGNED properly"). Built like Intercom's and
  // Front's reply panes instead of a form:
  // - a header: the student (opens their profile), the milestone and grade,
  //   the deadline and status as two small tags;
  // - the thread: their note as their message; on a second try your last
  //   feedback sits above it as your message, so the back and forth reads
  //   in order; after a decision your note joins the thread;
  // - the composer at the foot, always in view: Dreamy peeking over its
  //   edge beside his drafts, a box that grows as you write (its
  //   placeholder names who reads it), and Ask for changes / Approve in its
  //   footer. After a decision: Edit and Next.
  const replyPane = (
    <section className="v4-rp" aria-label={`Reply to ${first}`}>
      <header className="v4-rp-head">
        <Link href={profileHref} className="v4-rp-who">
          <StudentFace s={item.student} size={40} />
          <span className="flex min-w-0 flex-col">
            <b className="truncate">{item.student.name}</b>
            <small className="truncate">{item.milestone} · Grade {item.student.grade}</small>
          </span>
        </Link>
        <span className="v4-rp-tags">
          <span className={`v4-rp-tag ${sub.dueInDays < 0 ? "v5-risk" : sub.dueInDays <= 2 ? "v5-warn" : ""}`}>{due}</span>
          <span className={`v4-rp-tag ${item.student.status === "On Track" ? "v5-ok" : item.student.status === "At Risk" ? "v5-risk" : "v5-warn"}`}>{item.student.status}</span>
        </span>
      </header>
      <div className="v4-rp-thread dm-scroll">
        {sub.secondTry && sub.lastFeedback && (
          <div className="v4-rp-msg is-mine is-old"><p>{sub.lastFeedback}</p><span>You · last review</span></div>
        )}
        <div className="v4-rp-msg is-theirs"><p>{sub.note}</p><span>{first} · {sub.sentDaysAgo === 1 ? "yesterday" : `${sub.sentDaysAgo} days ago`}{sub.asks ? " · asked a question" : ""}</span></div>
        {held && (
          <div className="v4-rp-msg is-mine is-new" role="status">
            {held.text && <p>{held.text}</p>}
            <span className={held.kind === "approved" ? "is-ok" : "is-warn"}><Check className="h-[12px] w-[12px]" aria-hidden />{held.kind === "approved" ? "Approved" : "Changes asked"} · just now</span>
          </div>
        )}
      </div>
      {held ? (
        <div className="v4-rp-done">
          <span className="v4-rp-done-dreamy"><GlassesDreamy size={64} hop={burst} /></span>
          <span className="v4-rp-done-copy">Sent to {first}</span>
          <IconTip label="Take it back and edit"><button type="button" onClick={editHeld} className="v4-rp-btn is-quiet dm-quiet"><Pencil className="h-4 w-4" aria-hidden />Edit</button></IconTip>
          <IconTip label="Next (N)"><button type="button" onClick={next} className="v4-rp-btn is-primary dm-solid">{upNext ? <>Next: {upNext.student.name.split(" ")[0]}</> : "Finish"}<ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
        </div>
      ) : (
        <div className="v4-rp-composer">
          <span className="v4-rp-dreamy"><GlassesDreamy size={64} thinking={!!feedback.trim()} hop={burst} /></span>
          <div className="v4-rp-suggest" role="group" aria-label="Dreamy's drafts">
            <span className="v4-rp-suggest-label">Dreamy suggests</span>
            {drafts.map((d) => <IconTip key={d.label} label={d.text}><button type="button" onClick={() => { setFeedback(d.text); replyRef.current?.focus(); }} aria-pressed={feedback === d.text} className="v4-rp-chip dm-quiet"><Sparkles className="h-[12px] w-[12px]" aria-hidden />{d.label}</button></IconTip>)}
          </div>
          <label htmlFor="v4-rp-box" className="sr-only">Reply to {first}</label>
          <textarea id="v4-rp-box" ref={replyRef} value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder={sub.asks ? `Answer ${first}, or say what to change` : `Add a note for ${first}, or say what to change`} className="v4-rp-box" />
          <div className="v4-rp-foot">
            {last ? <UndoLink last={last} onUndo={undo} /> : <span />}
            <IconTip label={feedback.trim() ? "Ask for changes (C)" : "Write what to change first"}>
              <button type="button" disabled={!feedback.trim() || !!stamp} onClick={() => decide("Changes Requested")} className="v4-rp-btn is-quiet dm-quiet">Ask for changes</button>
            </IconTip>
            <IconTip label="Approve (A)">
              <button type="button" onClick={() => decide("Approved")} disabled={!!stamp} className="v4-rp-btn is-primary dm-solid"><Check className="h-4 w-4" aria-hidden />Approve</button>
            </IconTip>
          </div>
        </div>
      )}
    </section>
  );

  const R = 17;
  const C = 2 * Math.PI * R;
  return (
    <div className="v4-rs-cv">
      <nav className="v4-rs-rail" aria-label="Up next">
        <span className="v4-rs-rail-ring" role="img" aria-label={`${cleared} of ${total} cleared`}>
          <svg viewBox="0 0 40 40" aria-hidden><circle cx="20" cy="20" r={R} className="is-track" /><circle cx="20" cy="20" r={R} className="is-fill" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} /></svg>
          <b>{cleared}<small>/{total}</small></b>
        </span>
        <div className={`v4-rs-rail-scroll ${rail.atTop ? "" : "is-fade-top"} ${rail.atBottom ? "" : "is-fade-bottom"}`}>
          <ul ref={listRef} className="v4-rs-rail-list" onScroll={(e) => measureRail(e.currentTarget)}>
            {queue.map((q, i) => {
              const on = !held && i === index;
              const qs = submissionFor(q.student, q.milestone);
              const late = qs.dueInDays < 0;
              return (
                <li key={`${q.student.id}-${q.milestone}`} data-on={on ? "true" : undefined}>
                  <IconTip label={`${q.student.name} · ${q.milestone}${late ? " · late" : qs.asks ? " · has a question" : ""}`}>
                    <button type="button" onClick={() => go(i)} aria-current={on ? "true" : undefined} aria-label={`${q.student.name}, ${q.milestone}`} className="v4-rs-rail-btn">
                      <span className="v4-rs-rail-face"><StudentFace s={q.student} size={40} />{(late || qs.asks) && <span className={`v4-rs-rail-dot ${late ? "is-late" : "is-ask"}`} aria-hidden />}</span>
                      <span className="v4-rs-rail-name">{q.student.name.split(" ")[0]}</span>
                    </button>
                  </IconTip>
                </li>
              );
            })}
          </ul>
        </div>
        {rail.below > 0 && (
          <button type="button" onClick={() => listRef.current?.scrollBy({ top: 240, behavior: "smooth" })} className="v4-rs-rail-more dm-quiet" aria-label={`${rail.below} more below`}>
            <ChevronDown className="h-[14px] w-[14px]" aria-hidden />{rail.below}
          </button>
        )}
      </nav>

      <section ref={docRef} aria-label="Submission" className="v4-rs-cv-doc">
        <div className="v4-rs-pagebar">
          {pager || <span />}
          <IconTip label="Full screen"><button type="button" onClick={() => setFull(true)} aria-label="Full screen" className="v4-rs-cv-icon dm-quiet"><Maximize2 className="h-4 w-4" aria-hidden /></button></IconTip>
        </div>
        <div key={itemKey} className="v4-rs-page is-arriving">
          <button type="button" onClick={() => setFull(true)} aria-label={`Open ${item.milestone} full screen`} className="block w-full cursor-zoom-in text-left">
            <FitPage shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)"><DocumentPage student={item.student} milestone={item.milestone} /></FitPage>
          </button>
          {shownStamp && <span className={`v4-rs-stamp is-${shownStamp}`} aria-hidden>{shownStamp === "approved" ? "Approved" : "Changes asked"}</span>}
          <LocalBurst nonce={burst} />
        </div>
        {preview}
      </section>

      {replyPane}
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
