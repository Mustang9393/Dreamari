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
import { SubTabs } from "./SubTabs";
import { IconTip } from "@/components/app/IconTip";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { useCounselorFilters } from "../shell";
import { ReviewSession } from "./ReviewSession";
import { NudgeSession } from "./NudgeSession";
import "./prepare.css";

type Tab = "awaiting" | "progress" | "missed";

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
      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-3)]">
        {/* the page view switch, level 3 of the tab hierarchy: the same
           pill as Meetings' and Messages' (9 Oct 2026) */}
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
      </div>
      {tab === "awaiting" && <ReviewSession key={`${gradeFilter}|${chip ?? ""}`} only={only} milestone={fMilestone} />}
      {tab === "progress" && <NudgeSession key={`p|${gradeFilter}|${chip ?? ""}`} rows={progress} kind="progress" />}
      {tab === "missed" && <NudgeSession key={`m|${gradeFilter}|${chip ?? ""}`} rows={missed} kind="missed" />}
    </div>
  );
}
