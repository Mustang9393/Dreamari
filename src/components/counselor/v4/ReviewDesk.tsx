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
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, X } from "lucide-react";
import { SubTabs } from "./SubTabs";
import { IconTip } from "@/components/app/IconTip";
import { cv } from "@/lib/counselorBase";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { lastReminder, reminderDate, sendReminder, useReminders } from "@/lib/counselorReminders";
import { useCounselorFilters } from "../shell";
import { Reviews } from "../v5/Workspace";
import { StudentFace } from "../v5/StudentFace";
import { DreamyMoment } from "./overviewShared";
import "./prepare.css";

type Tab = "awaiting" | "progress" | "missed";
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";

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
      {tab === "awaiting" && <Reviews key={`${gradeFilter}|${chip ?? ""}`} only={only} milestone={fMilestone} />}
      {tab === "progress" && <Queue rows={progress} word="Started, not sent yet" empty="Nobody has a draft in progress." />}
      {tab === "missed" && <Queue rows={missed} word="Missed the deadline" empty="No missed deadlines." risk />}
    </div>
  );
}

function Queue({ rows, word, empty, risk = false }: { rows: { s: CounselorStudent; k: MilestoneKey }[]; word: string; empty: string; risk?: boolean }) {
  const reminders = useReminders();
  if (!rows.length) {
    return <div className="flex flex-col items-center gap-[var(--space-3)] py-[var(--space-12)] text-center"><DreamyMoment mood="celebrate" size={72} /><p className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{empty}</p></div>;
  }
  return (
    <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
      {rows.map(({ s, k }) => {
        const last = lastReminder(reminders, s.id, k);
        return (
          <li key={`${s.id}-${k}`} className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] border-b py-[12px]" style={{ borderColor: RULE }}>
            <Link href={`${cv("students")}&studentId=${encodeURIComponent(s.id)}`} className="dm-quiet dm-row flex min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
              <StudentFace s={s} size={40} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-semibold">{s.name} <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>· Grade {s.grade}</span></span>
                <span className="truncate text-[13.5px]"><span className="font-semibold">{k}</span> <span className={risk ? "v5-risk" : ""} style={risk ? undefined : { color: "var(--muted-foreground)" }}>· {word}</span></span>
              </span>
            </Link>
            {last && <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Reminded {reminderDate(last)}</span>}
            <button type="button" onClick={() => sendReminder(s.id, k, s.name)} className="dm-quiet inline-flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}>
              <Bell className="h-[14px] w-[14px]" aria-hidden />{last ? "Remind again" : "Send a reminder"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
