"use client";

// v4's Review Desk on v5's layout (8 Oct 2026, Chandu on the v4 desk: "This
// is buggy. Use the layout in v5."): Awaiting me is v5's desk itself (the
// document sized to the screen, what the student wrote, the decision, Up
// next). v4's two other queues stay, as v5-style hairline rows with the
// reminder they need: In progress (started, not sent) and Missed deadline.
// The page's grade picker narrows all three; &studentId=&milestone= opens
// the matching item and tab.
//
// Prepare > Reviews (9 Oct 2026, Maisha: "The actual reviewing/approving/
// giving-feedback workflow should live under Prepare"). Students >
// Milestones now only points here ("4 waiting for you"), so a link with
// &milestone= and/or &ids= opens already narrowed to those submissions, with
// one small chip that says what the filter is ("Academic Plan · 4 students")
// and an x to show everyone again. The chip, not a second tab row, carries
// the filter (never stack two tab rows).

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { HeadingControls } from "./Workspace";
import { SubTabs } from "./SubTabs";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { useCounselorFilters } from "../shell";
import { Reviews as V7Reviews } from "../v7/Workspace";
import { SparkBar } from "@/components/flow/SparkBar";
import { NudgeSession } from "./NudgeSession";
import "./prepare.css";
import "./messages.css";

type Tab = "awaiting" | "progress" | "missed";
// DEMO-ONLY: reviews already done today before the demo opens the desk
const REVIEWED_EARLIER = 4;

export function ReviewDesk() {
  const roster = useReviewedRoster();
  const { gradeFilter } = useCounselorFilters();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const want = params.get("studentId");
  const wantK = params.get("milestone");
  const wantIds = params.get("ids");
  // A link names a milestone and/or a set of students. One student plus a
  // milestone still just opens that item (the desk's own deep link); the
  // narrowed view is for a group or a whole milestone.
  const linkMilestone = wantK && (MILESTONE_KEYS as readonly string[]).includes(wantK) ? (wantK as MilestoneKey) : undefined;
  const linkIds = useMemo(() => (wantIds ? new Set(wantIds.split(",").filter(Boolean)) : null), [wantIds]);
  const [cleared, setCleared] = useState(false);
  const filtering = !cleared && (!!linkIds || (!!linkMilestone && !want));
  const fMilestone = filtering ? linkMilestone : undefined;
  const fIds = filtering ? linkIds : null;

  const only = useCallback((s: CounselorStudent) => (gradeFilter === "All Grades" || s.grade === gradeFilter) && (!fIds || fIds.has(s.id)), [gradeFilter, fIds]);
  const scoped = useMemo(() => roster.filter(only), [roster, only]);
  const items = (status: string) => scoped.flatMap((s) => MILESTONE_KEYS.filter((k) => s.milestones[k] === status && (!fMilestone || k === fMilestone)).map((k) => ({ s, k })));
  const awaitingItems = items("Pending Review");
  const progress = items("In Progress");
  const missed = items("Overdue");
  // the run's progress bar (20 Oct 2026, Chandu: "keep the progress bar,
  // never start at 0 though"): reviewed of all that were waiting when the
  // page opened. DEMO-ONLY: REVIEWED_EARLIER stands in for the reviews the
  // counselor already finished today; production counts today's decisions.
  const [startCount] = useState(() => awaitingItems.length);
  const reviewed = REVIEWED_EARLIER + Math.max(0, startCount - awaitingItems.length);
  const reviewTotal = REVIEWED_EARLIER + Math.max(startCount, awaitingItems.length);
  const [tab, setTab] = useState<Tab>(() => {
    const st = roster.find((s) => s.id === want)?.milestones[wantK as MilestoneKey];
    return st === "In Progress" ? "progress" : st === "Overdue" ? "missed" : "awaiting";
  });

  // "Academic Plan · 4 students": the milestone (or "Selected"), then how
  // many students the link named, or how many have that milestone waiting.
  const students = fIds ? fIds.size : new Set(awaitingItems.map((i) => i.s.id)).size;
  const chip = filtering ? `${fMilestone ?? "Selected"} · ${students} ${students === 1 ? "student" : "students"}` : null;
  const clear = () => {
    setCleared(true);
    // drop the filter from the address too, so a reload shows everyone
    const next = new URLSearchParams(params.toString());
    next.delete("ids");
    if (!want) next.delete("milestone");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* the queues switch on the title's row, beside the grade picker
         (20 Oct 2026 hierarchy pass: it was a second control row) */}
      <HeadingControls>
        <SubTabs ariaLabel="Review queues" value={tab} onChange={setTab}
          options={[{ key: "awaiting", label: "Awaiting me", count: awaitingItems.length }, { key: "progress", label: "In progress", count: progress.length }, { key: "missed", label: "Missed deadline", count: missed.length }]} />
        {chip && (
          <span className="prep-filter-chip" role="status">
            <span className="truncate">{chip}</span>
            <IconTip label="Show all submissions">
              <button type="button" onClick={clear} aria-label="Clear filter, show all submissions" className="prep-filter-chip-x"><X className="h-[13px] w-[13px]" aria-hidden /></button>
            </IconTip>
          </span>
        )}
      </HeadingControls>
      {/* Awaiting me is v7's review focus mode (20 Oct 2026, Chandu: "match
         the prepare stuff to the v7 as much as possible"): the document
         large, one panel beside it, "1 of N" with the list on demand */}
      {tab === "awaiting" && (
        <>
          <div className="msg-bar" role="status" aria-live="polite">
            <span className="msg-bar-copy"><b>{reviewed} of {reviewTotal}</b> reviewed today</span>
            <SparkBar percent={reviewTotal ? Math.round((reviewed / reviewTotal) * 100) : 100} min={2} height={6} fill="linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))" glow="var(--primary)" memoryKey="v4-review-session" />
          </div>
          <V7Reviews key={`${gradeFilter}|${chip ?? ""}`} only={only} milestone={fMilestone} />
        </>
      )}
      {tab === "progress" && <NudgeSession key={`p|${gradeFilter}|${chip ?? ""}`} rows={progress} kind="progress" />}
      {tab === "missed" && <NudgeSession key={`m|${gradeFilter}|${chip ?? ""}`} rows={missed} kind="missed" />}
    </div>
  );
}
