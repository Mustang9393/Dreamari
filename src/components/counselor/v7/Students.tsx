"use client";

// v7 Students (20 Oct 2026): the Replit's Student Directory. Search,
// filters, Export, and one row per student with grade, status, career
// interest, plan, progress and last active. Opening a row opens the
// student's profile (StudentProfile.tsx).
//
// From the Replit, kept: every column. Changed: students who need you come
// first (standing rule: "always display what needs attention first"); the
// status is a dot and a word, not a colored pill; no row checkboxes (batch
// sends live with the review and message tools, Chandu 25 Sept: "the batch
// thing should be in productivity suite not in the students tab itself");
// filters are three pickers in the toolbar instead of a panel.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Search } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { attentionRank, lastActiveLabel, type CounselorStudent } from "@/lib/counselorRoster";
import { StudentFace } from "../v5/StudentFace";
import { flagsFor } from "./data";
import { StudentProfile } from "./StudentProfile";
import { CARD, CARD_STYLE, MUTED, OVERLINE, PageHead, QuietButton, RULE, Status, studentHref } from "./ui";

const PAGE = 25;
const STATUS_ORDER = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 } as const;
const PICKER = "h-11 min-w-[150px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold";
const PICKER_STYLE = { borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" };
const GRID = "lg:grid-cols-[minmax(0,2.2fr)_70px_150px_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.8fr)_100px]";

export function V7Students({ studentId, tab }: { studentId?: string; tab?: string }) {
  if (studentId) return <StudentProfile studentId={studentId} initialTab={tab} />;
  return <Directory />;
}

/** The interest a counselor recognises: their #1 match, else their world. */
export const interestOf = (s: CounselorStudent) => s.topMatches[0]?.title ?? s.careerTrack;
export const planOf = (s: CounselorStudent) => (s.postsecondaryIntent === "Undecided" ? "Exploring" : s.postsecondaryIntent);
export function progressOf(s: CounselorStudent): string {
  const f = flagsFor(s);
  if (f.length) return f[0];
  const k = (Object.keys(s.milestones) as (keyof typeof s.milestones)[]).find((m) => s.milestones[m] === "In Progress");
  return k ? `${k} in progress` : "All caught up";
}

function Directory() {
  const roster = useReviewedRoster();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [status, setStatus] = useState(params.get("status") === "need" ? "need" : "all");
  const [plan, setPlan] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const plans = useMemo(() => [...new Set(roster.map(planOf))].sort(), [roster]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return roster
      .filter((s) => !needle || s.name.toLowerCase().includes(needle) || interestOf(s).toLowerCase().includes(needle))
      .filter((s) => grade === "all" || String(s.grade) === grade)
      .filter((s) => status === "all" || (status === "need" ? s.status !== "On Track" : s.status === status))
      .filter((s) => plan === "all" || planOf(s) === plan)
      // status first (At Risk, then Needs Attention), then the most urgent item
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || attentionRank(a, b));
  }, [roster, q, grade, status, plan]);

  const exportCsv = () => {
    const rows = [["Student", "Grade", "Status", "Career interest", "Plan", "Progress", "Last active"], ...list.map((s) => [s.name, String(s.grade), s.status, interestOf(s), planOf(s), progressOf(s), lastActiveLabel(s.lastActive)])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Students" line="Find a student and see who needs you." action={<span className="text-[14px] font-semibold tabular-nums" style={MUTED}>{list.length} of {roster.length}</span>} />

      <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-[14px] h-4 w-4" style={MUTED} aria-hidden />
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Search students or careers" aria-label="Search students"
            className="h-11 w-full rounded-[var(--radius-md)] border bg-transparent pr-[12px] pl-[40px] text-[15px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
        </label>
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Listbox ariaLabel="Grade" value={grade} onChange={(v) => { setGrade(v); setShown(PAGE); }} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "All grades" }, ...[9, 10, 11, 12].map((g) => ({ value: String(g), label: `Grade ${g}` }))]} />
          <Listbox ariaLabel="Status" value={status} onChange={(v) => { setStatus(v); setShown(PAGE); }} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "Any status" }, { value: "need", label: "Need you" }, { value: "At Risk", label: "At risk" }, { value: "Needs Attention", label: "Needs attention" }, { value: "On Track", label: "On track" }]} />
          <Listbox ariaLabel="Plan" value={plan} onChange={(v) => { setPlan(v); setShown(PAGE); }} className={PICKER} style={PICKER_STYLE}
            options={[{ value: "all", label: "Any plan" }, ...plans.map((p) => ({ value: p, label: p }))]} />
          <QuietButton onClick={exportCsv} icon={<Download className="h-4 w-4" aria-hidden />}>Export</QuietButton>
        </div>
      </div>

      <section aria-label="Student directory" className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
        <div className={`hidden gap-[var(--space-4)] border-b px-[var(--space-5)] py-[12px] lg:grid ${GRID}`} style={{ borderColor: RULE }}>
          {["Student", "Grade", "Status", "Career interest", "Plan", "Progress", "Last active"].map((h) => <span key={h} className={OVERLINE} style={MUTED}>{h}</span>)}
        </div>
        {list.length ? (
          <ul>
            {list.slice(0, shown).map((s) => <Row key={s.id} s={s} />)}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-8)]">
            <p className="text-[16px] font-semibold">No students match.</p>
            <button type="button" onClick={() => { setQ(""); setGrade("all"); setStatus("all"); setPlan("all"); }} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}>Clear filters</button>
          </div>
        )}
      </section>
      {list.length > shown && (
        <div className="flex justify-center">
          <QuietButton onClick={() => setShown((n) => n + PAGE)}>Show {Math.min(PAGE, list.length - shown)} more</QuietButton>
        </div>
      )}
    </div>
  );
}

function Row({ s }: { s: CounselorStudent }) {
  const progress = progressOf(s);
  const flagged = flagsFor(s).length > 0;
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: RULE }}>
      <Link href={studentHref(s.id)} className={`dm-quiet dm-row grid grid-cols-[1fr_auto] items-center gap-x-[var(--space-4)] gap-y-[4px] px-[var(--space-5)] py-[12px] lg:grid ${GRID}`}>
        <span className="flex min-w-0 items-center gap-[12px]">
          <StudentFace s={s} size={36} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] leading-[20px] font-semibold">{s.name}</span>
            {/* phones: the facts the hidden columns carry, in one line */}
            <span className="truncate text-[13px] leading-[18px] lg:hidden" style={MUTED}>Grade {s.grade} · {interestOf(s)}</span>
          </span>
        </span>
        <span className="hidden text-[14px] tabular-nums lg:block" style={MUTED}>{s.grade}</span>
        <span className="justify-self-end lg:justify-self-start"><Status status={s.status} /></span>
        <span className="hidden truncate text-[14px] lg:block">{interestOf(s)}</span>
        <span className="hidden truncate text-[14px] lg:block" style={MUTED}>{planOf(s)}</span>
        <span className="col-span-2 truncate pl-[48px] text-[13.5px] lg:col-span-1 lg:pl-0 lg:text-[14px]" style={flagged ? undefined : MUTED}>{progress}</span>
        <span className="hidden text-[13.5px] lg:block" style={MUTED}>{lastActiveLabel(s.lastActive)}</span>
      </Link>
    </li>
  );
}
