"use client";

// v5 Students (7 Oct 2026): the operational area, on the student design
// system (plan section 4: "Students: Directory, Milestones, Student
// Progress, Review Desk... same features"). One tab row for its parts;
// Directory first. The list keeps every data point v4's directory shows
// (Maisha's rule: cut clutter, never drop a data point she needs): the
// student, status and the reason, milestones, the top career, last active,
// with grade, status and plan filters and sorting. Open rows divided by
// hairlines, not a boxed table (Chandu: "avoid boxes wherever possible").

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Search, X } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { TextTabs } from "@/components/app/TextTabs";
import { EmptyView } from "@/components/app/states";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { lastActiveLabel, milestonesForGrade, type CaseloadStatus, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { toV5, type V5Student } from "@/lib/counselorV5";
import { StudentPage } from "./StudentPage";
import { AvatarSwitch } from "./StudentFace";
import { MilestonesView, ProgressView } from "./StudentsViews";
import { CoverageBanner } from "./Coverage";
import { useCoverage } from "@/lib/counselorCoverage";
import { useHandoffs } from "@/lib/counselorHandoffs";
import { counselorFor } from "@/lib/counselorOrg";

// DEMO-ONLY: the signed-in counselor
const ME = "Sarah Chen";
import { CheckInsView } from "./CheckIns";
import { StudentFace } from "./StudentFace";
import { cv } from "@/lib/counselorBase";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const PAGE = 30;

// Reviews is not a tab here: the review desk lives in Workspace, and two
// ways into the same queue would repeat it.
type Part = "directory" | "milestones" | "progress" | "checkins";
const PARTS: { key: Part; label: string }[] = [
  { key: "directory", label: "Directory" },
  { key: "milestones", label: "Milestones" },
  { key: "progress", label: "Progress" },
  { key: "checkins", label: "Check-ins" },
];

const STATUS_CLASS: Record<CaseloadStatus, string> = { "On Track": "v5-ok", "Needs Attention": "v5-warn", "At Risk": "v5-risk" };
const STATUS_RANK: Record<CaseloadStatus, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
const GRADES = [9, 10, 11, 12] as const;
const STATUSES: CaseloadStatus[] = ["At Risk", "Needs Attention", "On Track"];
const PLANS: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Workforce", "Military", "Undecided"];
type Sort = "need" | "name" | "active" | "milestones";
const SORTS: { key: Sort; label: string }[] = [
  { key: "need", label: "Needs you first" },
  { key: "name", label: "Name" },
  { key: "active", label: "Last active" },
  { key: "milestones", label: "Fewest milestones done" },
];

function milestoneProgress(s: V5Student) {
  const keys = milestonesForGrade(s.grade);
  const done = keys.filter((k) => s.source.milestones[k] === "Approved" || s.source.milestones[k] === "Completed").length;
  const started = keys.filter((k) => ["In Progress", "Pending Review", "Changes Requested"].includes(s.source.milestones[k])).length;
  return { done, started, total: keys.length };
}

export function V5Students({ studentId }: { studentId?: string }) {
  // ?tab= opens a part directly (Home's check-in alert links to Check-ins)
  const tabParam = useSearchParams().get("tab");
  const [part, setPart] = useState<Part>(PARTS.some((x) => x.key === tabParam) ? (tabParam as Part) : "directory");
  if (studentId) return <StudentPage studentId={studentId} />;
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
          <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Students</h1>
          <AvatarSwitch />
        </div>
        <TextTabs items={PARTS} value={part} onChange={setPart} ariaLabel="Students" layoutId="v5-students-tabs" />
        <CoverageBanner />
      </header>
      {part === "directory" && <Directory />}
      {part === "milestones" && <MilestonesView />}
      {part === "progress" && <ProgressView />}
      {part === "checkins" && <CheckInsView />}
    </div>
  );
}

function Directory() {
  const roster = useReviewedRoster();
  const all = useMemo(() => roster.map(toV5), [roster]);
  const [query, setQuery] = useState("");
  const [grades, setGrades] = useState<number[]>([]);
  const [statuses, setStatuses] = useState<CaseloadStatus[]>([]);
  const [plans, setPlans] = useState<PostsecondaryIntent[]>([]);
  const [sort, setSort] = useState<Sort>("need");
  const [shown, setShown] = useState(PAGE);
  // whose students: the whole school, yours (your range, plus handoffs in,
  // minus handoffs out), or the teammate you're covering today
  const coverage = useCoverage();
  const handoffs = useHandoffs();
  const [scope, setScope] = useState<"all" | "mine" | "covering">(coverage ? "covering" : "all");
  const inScope = (s: V5Student) => {
    if (scope === "all") return true;
    const h = handoffs[s.user.sourcedId];
    const owner = h ? h.to : counselorFor(s.source).name;
    if (scope === "mine") return owner === ME;
    return !!coverage && owner === coverage.name;
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter((s) =>
      inScope(s) &&
      (!q || s.name.toLowerCase().includes(q) || s.user.identifier.toLowerCase().includes(q)) &&
      (!grades.length || grades.includes(s.grade)) &&
      (!statuses.length || statuses.includes(s.status)) &&
      (!plans.length || plans.includes(s.source.postsecondaryIntent)));
    const by: Record<Sort, (a: V5Student, b: V5Student) => number> = {
      need: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      active: (a, b) => b.dreamari.lastActive.localeCompare(a.dreamari.lastActive),
      milestones: (a, b) => milestoneProgress(a).done / milestoneProgress(a).total - milestoneProgress(b).done / milestoneProgress(b).total,
    };
    return [...list].sort(by[sort]);
  }, [all, query, grades, statuses, plans, sort, scope, handoffs, coverage]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const filtered = grades.length + statuses.length + plans.length > 0 || query.trim() !== "";
  const clear = () => { setQuery(""); setGrades([]); setStatuses([]); setPlans([]); };
  const count = (pred: (s: V5Student) => boolean) => all.filter(pred).length;

  return (
    <section aria-label="Directory" className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-12 w-full items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] lg:max-w-[420px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          <Search className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
          <span className="sr-only">Search students</span>
          <input value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }} placeholder="Search by name or student ID" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="dm-quiet flex size-7 items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>}
        </label>
        <div className="-mx-1 flex flex-wrap items-center gap-[2px]">
          <Dropdown quiet label="Caseload" value={scope === "all" ? "Whole school" : scope === "mine" ? "My students" : `Covering ${coverage?.name.split(" ")[0] ?? ""}`} active={scope !== "all"} panel={(close) => ({
            title: "Caseload", description: "Whose students to show.", count: rows.length, noun: "student", width: 320,
            children: <div className="flex flex-col p-[8px]">{([["all", "Whole school"], ["mine", "My students"], ...(coverage ? [["covering", `Covering ${coverage.name}`]] : [])] as [typeof scope, string][]).map(([k, l]) => <Option key={k} radio on={scope === k} onToggle={() => { setScope(k); close(); }} label={l} />)}</div>,
          })} />
          <Dropdown quiet label="Grade" value={grades.length ? [...grades].sort((x, y) => x - y).join(", ") : undefined} active={grades.length > 0} panel={() => ({
            title: "Grade", description: "Show students in these grades.", count: rows.length, noun: "student", width: 320, onClear: grades.length ? () => setGrades([]) : undefined,
            children: <div className="flex flex-col p-[8px]">{GRADES.map((g) => <Option key={g} on={grades.includes(g)} onToggle={() => toggle(grades, setGrades, g)} label={`Grade ${g}`} count={count((s) => s.grade === g)} />)}</div>,
          })} />
          <Dropdown quiet label="Status" value={statuses.length === 1 ? statuses[0] : statuses.length ? `${statuses.length} chosen` : undefined} active={statuses.length > 0} panel={() => ({
            title: "Status", description: "On track, needs attention or at risk.", count: rows.length, noun: "student", width: 340, onClear: statuses.length ? () => setStatuses([]) : undefined,
            children: <div className="flex flex-col p-[8px]">{STATUSES.map((st) => <Option key={st} on={statuses.includes(st)} onToggle={() => toggle(statuses, setStatuses, st)} label={st} count={count((s) => s.status === st)} />)}</div>,
          })} />
          <Dropdown quiet label="Plan" value={plans.length === 1 ? plans[0] : plans.length ? `${plans.length} chosen` : undefined} active={plans.length > 0} panel={() => ({
            title: "Plan after high school", description: "What each student says they plan to do.", count: rows.length, noun: "student", width: 360, onClear: plans.length ? () => setPlans([]) : undefined,
            children: <div className="flex flex-col p-[8px]">{PLANS.map((p) => <Option key={p} on={plans.includes(p)} onToggle={() => toggle(plans, setPlans, p)} label={p} count={count((s) => s.source.postsecondaryIntent === p)} />)}</div>,
          })} />
          <Dropdown quiet label="Sort" value={SORTS.find((x) => x.key === sort)!.label} active={false} panel={(close) => ({
            title: "Sort", description: "Choose the order of the list.", count: rows.length, noun: "student", width: 320,
            children: <div className="flex flex-col p-[8px]">{SORTS.map((x) => <Option key={x.key} radio on={sort === x.key} onToggle={() => { setSort(x.key); close(); }} label={x.label} />)}</div>,
          })} />
        </div>
      </div>

      <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {rows.length} {rows.length === 1 ? "student" : "students"}
        {filtered && <> · <button type="button" onClick={clear} className="dm-link font-bold" style={{ color: "var(--accent)" }}>Clear filters</button></>}
      </p>

      {rows.length === 0 ? (
        <div className="py-[var(--space-8)]"><EmptyView tier={5} query={query.trim() || "these filters"} line="Try another name." cta="Clear filters" onAction={clear} /></div>
      ) : (
        <>
          {/* Column labels on wide screens only; rows explain themselves on phones. */}
          <div className={`hidden gap-x-[var(--space-6)] border-b pb-[var(--space-3)] text-[12px] font-semibold tracking-[0.06em] uppercase lg:grid ${GRID}`} style={{ color: "var(--muted-foreground)", borderColor: RULE }}>
            <span>Student</span><span>Status</span><span>Milestones</span><span>Last active</span><span />
          </div>
          <ul className="flex flex-col">
            {rows.slice(0, shown).map((s) => <Row key={s.user.sourcedId} s={s} />)}
          </ul>
          {rows.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="dm-quiet mx-auto flex h-10 cursor-pointer items-center gap-[6px] rounded-full border px-[18px] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
              Show {Math.min(PAGE, rows.length - shown)} more <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {rows.length - shown} left</span>
            </button>
          )}
        </>
      )}
    </section>
  );
}

function Portrait({ s, size }: { s: V5Student; size: number }) {
  return <StudentFace s={s.source} size={size} />;
}

function MilestoneBar({ s }: { s: V5Student }) {
  const { done, started, total } = milestoneProgress(s);
  return (
    <span className="flex min-w-0 flex-col gap-[6px]">
      <span className="text-[14px] leading-[18px] font-semibold tabular-nums">{done} of {total}</span>
      <span className="flex h-[5px] w-full max-w-[140px] gap-[3px]" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="h-full flex-1 rounded-full" style={{ background: i < done ? "var(--primary)" : i < done + started ? "color-mix(in srgb, var(--primary) 35%, transparent)" : "color-mix(in srgb, var(--foreground) 12%, transparent)" }} />
        ))}
      </span>
    </span>
  );
}

const GRID = "lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_150px_110px_16px]";

/** One student row, the same order at every width (Chandu, 7 Oct 2026: the
 *  directory was confusing): who, how they are doing and why, milestones,
 *  last active. Phones show the first two; the rest is one tap away. */
function Row({ s }: { s: V5Student }) {
  const plan = s.source.postsecondaryIntent;
  const href = `${cv("students")}&studentId=${encodeURIComponent(s.user.sourcedId)}`;
  return (
    <li className="border-b" style={{ borderColor: RULE }}>
      <Link href={href} className={`dm-quiet group -mx-[var(--space-2)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[var(--space-4)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[14px] lg:gap-x-[var(--space-6)] ${GRID}`}>
        <span className="flex min-w-0 items-center gap-[var(--space-3)]">
          <Portrait s={s} size={44} />
          <span className="flex min-w-0 flex-col gap-[2px]">
            <span className="truncate text-[16px] leading-[20px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{s.name}</span>
            <span className="truncate text-[13px] leading-[17px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {plan !== "Undecided" ? plan : "Still exploring"}</span>
          </span>
        </span>
        <span className="flex min-w-0 flex-col items-end gap-[2px] lg:items-start">
          <span className={`flex items-center gap-[6px] text-[14px] leading-[18px] font-semibold ${STATUS_CLASS[s.status]}`}><span aria-hidden className="size-[7px] rounded-full bg-current" />{s.status}</span>
          <span className="hidden max-w-full truncate text-[13px] leading-[17px] font-medium lg:block" style={{ color: "var(--muted-foreground)" }}>{s.attention?.reason ?? ""}</span>
        </span>
        <span className="hidden lg:block"><MilestoneBar s={s} /></span>
        <span className="hidden text-[13px] font-semibold tabular-nums lg:block" style={{ color: "var(--muted-foreground)" }}>{lastActiveLabel(s.dreamari.lastActive)}</span>
        <ChevronRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-[2px] lg:block" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </Link>
    </li>
  );
}
