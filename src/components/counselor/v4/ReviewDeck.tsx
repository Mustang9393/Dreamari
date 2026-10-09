"use client";

// Pending Reviews as a carousel of the submissions waiting (10 Oct 2026,
// Chandu: "we can have 1 additional caption or detail under the doc and
// then 13 waiting, and we can have controls to move through them and make
// it a carousel like the reminders"). It fills the column's three bands,
// which line up with the conversation cards beside it:
// - the picture band: the current submission's real first page as a sheet
//   of paper (square corners, a paper shadow), its letterhead and name sharp
//   and the rest under a progressive blur, with two plain sheets behind it
//   in the Play deck's geometry so it reads as a pile; it opens that
//   submission;
// - the text band: one caption, the milestone (the student's name is on the
//   page), then "13 waiting";
// - the button band: one dot per submission, the current one a short bar,
//   and a pause that shows on hover or focus. Like the reminders it moves
//   on every 8 seconds, stops while hovered, focused or paused, and never
//   moves under reduced motion (WCAG 2.2.2).

import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import type { CounselorStudent, MilestoneKey } from "@/lib/counselorRoster";
import { CardProgressiveBlur } from "@/components/app/cardChrome";
import { DocumentPage } from "./DocumentPreview";
import { FitPage } from "./DocumentDesk";
import { CountUp } from "./overviewShared";

type Doc = { s: CounselorStudent; k: MilestoneKey };
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducedServerSnapshot = () => true;
function subscribeReduced(notify: () => void) {
  const q = window.matchMedia("(prefers-reduced-motion: reduce)");
  q.addEventListener("change", notify);
  return () => q.removeEventListener("change", notify);
}

export function ReviewDeck({ docs, total, onOpen }: { docs: Doc[]; total: number; onOpen: (d: Doc) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, reducedServerSnapshot);
  const count = docs.length;
  const current = count ? index % count : 0;
  const stopped = paused || hovered || focused || reduced;
  useEffect(() => {
    if (stopped || count < 2) return;
    const t = window.setInterval(() => { if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count); }, 8000);
    return () => window.clearInterval(t);
  }, [stopped, count]);
  if (!count) return null;
  const doc = docs[current];
  return (
    <div className="v4-review-bands v4-review-deck" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      aria-roledescription="carousel" aria-label="Submissions waiting">
      <div className="v4-review-faces">
        {count > 2 && <span className="v4-review-sheet is-back2" aria-hidden />}
        {count > 1 && <span className="v4-review-sheet is-back1" aria-hidden />}
        <button key={`${doc.s.id}-${doc.k}`} type="button" className="v4-review-thumb dm-quiet is-entering" onClick={() => onOpen(doc)} aria-label={`Review ${doc.s.name}'s ${doc.k}`} aria-roledescription="slide">
          <span className="v4-review-thumb-page" aria-hidden><FitPage shadow="none"><DocumentPage student={doc.s} milestone={doc.k} /></FitPage></span>
          <CardProgressiveBlur direction="up" size="64%" maxBlur={10} />
          <span className="v4-review-thumb-fade" aria-hidden />
        </button>
      </div>
      <div className="v4-review-text" aria-live={focused ? "polite" : "off"}>
        <strong className="v4-review-caption">{doc.k}</strong>
        <small><b><CountUp value={total} /></b> waiting</small>
      </div>
      {count > 1 && <div className="v4-review-controls" role="group" aria-label="Submission controls">
        {docs.map((d, n) => <button key={`${d.s.id}-${d.k}`} type="button" className="v4-reminder-dot" aria-label={`Submission ${n + 1} of ${count}: ${d.s.name}, ${d.k}`} aria-current={n === current ? "true" : undefined} onClick={() => setIndex(n)}><span aria-hidden /></button>)}
        {!reduced && <button type="button" className="v4-reminder-pause dm-quiet" aria-label={paused ? "Resume" : "Pause"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={11} aria-hidden /> : <Pause size={11} aria-hidden />}</button>}
      </div>}
    </div>
  );
}
