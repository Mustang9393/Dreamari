"use client";

// Students > Milestones, By Student (9 Oct 2026). Replaces the old Student
// Progress tab (Maisha: "Merge 'milestones' and 'student progress' into
// one tab"). One row per student: "Emma Rodriguez · Grade 10", "86%
// complete", a dot per milestone ("● ● ● ● ● ◐ ○"), the counts, the
// status and, when the student needs help, the specific reason. Kept from
// Student Progress: real names, the status breakdown, the filters, who sits
// behind each number, and acting on one student or a hand-picked group.
// Dropped: the big Milestone Completion dot matrix and the separate bar
// chart (the dots on each row already say it per student), and then the
// counts column too (Chandu, 9 Oct 2026: "super dense and wordy ... not
// overwhelming like it is now"): the dots carry the counts as their
// tooltip and label. Students who need help sort first.
//
// The dots became a stepped track (Chandu, 10 Oct 2026: "try better types
// of graphs, more beautiful ones ... don't be traditional"): one pill per
// milestone in curriculum order (MilestoneDots in milestoneViz.tsx), so a
// row reads as how far along the year's path a student is. Same data, same
// tooltip; full, half, amber and outline pills keep the four states
// readable without colour.
// Drilldowns (Chandu, 10 Oct 2026: "everything needs drilldowns that are
// logical"): each pill opens that milestone's drawer focused on this
// student; the face and the name open the student's profile.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, X } from "lucide-react";
import { CAREER_TRACKS } from "@/lib/counselorRoster";
import { EmptyView } from "@/components/app/states";
import { IconTip } from "@/components/app/IconTip";
import { Listbox } from "./Listbox";
import { BatchComposer } from "./Batch";
import { Avatar, Go, SelectBox, StatusChip } from "./chips";
import { attentionRank, attentionReason } from "./studentAttention";
import { notify } from "../v5/LogSheet";
import { MilestoneDots } from "./milestoneViz";
import { STATUS_RANK, studentHref, type Mark, type StudentRow } from "./milestonesModel";

const PAGE = 25;
export type StudentStatusFilter = "All" | "Need Help" | "At Risk" | "Needs Attention" | "On Track";
const STATUS_OPTIONS: { value: StudentStatusFilter; label: string }[] = [
  { value: "All", label: "All Statuses" },
  { value: "Need Help", label: "At Risk or Needs Attention" },
  { value: "At Risk", label: "At Risk" },
  { value: "Needs Attention", label: "Needs Attention" },
  { value: "On Track", label: "On Track" },
];

export function MilestonesByStudent({ rows, status, setStatus, onOpenMilestone }: { rows: StudentRow[]; status: StudentStatusFilter; setStatus: (s: StudentStatusFilter) => void; onOpenMilestone: (r: StudentRow, m: Mark) => void }) {
  const router = useRouter();
  const [pathway, setPathway] = useState("All");
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [composing, setComposing] = useState(false);

  const list = useMemo(() => rows
    .filter((r) => status === "All" || (status === "Need Help" ? r.s.status !== "On Track" : r.s.status === status))
    .filter((r) => pathway === "All" || r.s.careerTrack === pathway)
    .sort((a, b) => STATUS_RANK[a.s.status] - STATUS_RANK[b.s.status] || attentionRank(a.s, b.s) || a.pct - b.pct || a.s.name.localeCompare(b.s.name)), [rows, status, pathway]);
  const page = list.slice(0, shown);
  const left = list.length - page.length;
  const chosen = list.filter((r) => picked.has(r.s.id)).map((r) => r.s);
  const allPicked = page.length > 0 && page.every((r) => picked.has(r.s.id));
  const toggle = (id: string, on: boolean) => setPicked((prev) => { const next = new Set(prev); if (on) next.add(id); else next.delete(id); return next; });
  const reset = () => { setShown(PAGE); setPicked(new Set()); setComposing(false); };
  const open = (id: string) => router.push(studentHref(id));
  const pathways = useMemo(() => CAREER_TRACKS.filter((p) => rows.some((r) => r.s.careerTrack === p)), [rows]);

  return (
    <section aria-label="Milestones by student" className="v4-ms-students v4-surface">
      <header className="v4-ms-students-head">
        <span className="flex min-w-0 items-center gap-[10px]">
          {page.length > 0 && <SelectBox checked={allPicked} label={allPicked ? "Clear selection" : "Select every student shown"} onChange={(on) => setPicked(on ? new Set(page.map((r) => r.s.id)) : new Set())} />}
          {picked.size > 0 ? (
            <span className="flex items-center gap-[10px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
              {picked.size} selected
              <button type="button" aria-expanded={composing} onClick={() => setComposing((v) => !v)} className="v4-inline-link" style={{ color: "var(--primary)" }}><Users className="h-[14px] w-[14px]" aria-hidden />Message {picked.size}</button>
              <IconTip label="Clear selection"><button type="button" aria-label="Clear selection" onClick={() => { setPicked(new Set()); setComposing(false); }} className="v4-ms-icon"><X className="h-[14px] w-[14px]" aria-hidden /></button></IconTip>
            </span>
          ) : (
            // the total is already in the summary strip; the header counts only a filtered list
            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{list.length === rows.length ? "Select All" : `${list.length} of ${rows.length} students`}</span>
          )}
        </span>
        <span className="v4-ms-students-filters">
          <Listbox ariaLabel="Status" value={status} onChange={(v) => { setStatus(v as StudentStatusFilter); reset(); }} options={STATUS_OPTIONS} />
          <Listbox ariaLabel="Career pathway" value={pathway} onChange={(v) => { setPathway(v); reset(); }} options={[{ value: "All", label: "All Pathways" }, ...pathways.map((p) => ({ value: p, label: p }))]} />
        </span>
      </header>
      {composing && chosen.length > 0 && (
        <div className="px-[var(--space-4)] pb-[var(--space-3)]">
          <BatchComposer students={chosen} audience="Milestones" onCancel={() => setComposing(false)} onDone={(summary) => { notify(summary); setComposing(false); setPicked(new Set()); }} />
        </div>
      )}

      {list.length === 0 ? (
        <div className="py-[var(--space-4)]">
          <EmptyView tier={5} query={[status !== "All" ? STATUS_OPTIONS.find((o) => o.value === status)?.label : "", pathway !== "All" ? pathway : ""].filter(Boolean).join(", ") || "these filters"} line="Try another status or pathway." cta="Clear filters" onAction={() => { setStatus("All"); setPathway("All"); reset(); }} />
        </div>
      ) : (
        <ul className="v4-ms-student-list">
          {page.map((r) => {
            const help = r.s.status !== "On Track";
            return (
              <li key={r.s.id} onClick={() => open(r.s.id)} className="v4-ms-student dm-quiet">
                <span className="v4-ms-student-pick" onClick={(e) => e.stopPropagation()}>
                  <SelectBox checked={picked.has(r.s.id)} label={`Select ${r.s.name}`} onChange={(on) => toggle(r.s.id, on)} />
                </span>
                <span className="v4-ms-student-who">
                  <Link href={studentHref(r.s.id)} onClick={(e) => e.stopPropagation()} aria-label={`Open ${r.s.name}'s profile`} tabIndex={-1} className="v4-ms-face"><Avatar name={r.s.name} index={r.s.avatarIndex} size={36} /></Link>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <Link href={studentHref(r.s.id)} onClick={(e) => e.stopPropagation()} className="v4-ms-name truncate">{r.s.name}</Link>
                    <span className="v4-ms-sub">Grade {r.s.grade}</span>
                  </span>
                </span>
                <span className="v4-ms-student-pct">{r.pct}%</span>
                <span className="v4-ms-student-dots"><MilestoneDots marks={r.marks} counts={r.counts} who={r.s.name} onPick={(m) => onOpenMilestone(r, m)} /></span>
                <span className="v4-ms-student-status">
                  <StatusChip status={r.s.status} />
                  {help && <span className="v4-ms-student-reason">{attentionReason(r.s)}</span>}
                </span>
                <span className="v4-ms-student-go"><Go /></span>
              </li>
            );
          })}
        </ul>
      )}
      {left > 0 && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="dm-quiet mx-auto my-[var(--space-3)] flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[16px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          Show {Math.min(PAGE, left)} more <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {left} left</span>
        </button>
      )}
    </section>
  );
}
