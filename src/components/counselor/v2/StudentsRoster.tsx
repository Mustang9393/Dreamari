"use client";

// DEMO-ONLY v2 fork of ../StudentsRoster.tsx. Rebuilt 25 Sept 2026 under the
// v2 budget (skimmable, one hue, color only for state): the student cell
// carries name, grade and pathway so the table is six columns instead of
// eight; Status sorts by severity, not alphabet; the two filters are
// pickers in the toolbar instead of a popover behind a "Filters" button;
// the default order is worst first; a flagged student's row says why; the
// Lead Counselor and School Administrator see (and filter by) counselor;
// and below the desktop breakpoint the same rows render as a card list
// instead of a sideways-scrolling 1100px table.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { attentionRank, attentionReason, type CaseloadStatus, type CounselorStudent, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, SCOPE_COUNSELOR_TO_CASELOAD, counselorFor, myCounselor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { useCounselorFilters, type StatusRosterFilter } from "../shell";
import { StatusChip, MilestonesMini, Avatar } from "../chips";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";
import { PRIMARY } from "../palette";

const INTENT_OPTIONS: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Workforce", "Military", "Undecided"];
const STATUS_OPTIONS: StatusRosterFilter[] = ["All", "At Risk", "Needs Attention", "On Track"];
// Worst first is the DEFAULT order (direct feedback, 25 Sept 2026: "things
// needing attention surfaced first, based on severity"): At Risk before
// Needs Attention before On Track, then the same severity ranking the
// Overview's attention strip uses (overdue and rejected work outranks
// merely not-started), then the least-complete roadmap. Name, roadmap and
// last-active sorts are still one click away on their headers.
const STATUS_RANK: Record<CaseloadStatus, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
function priorityRank(a: CounselorStudent, b: CounselorStudent): number {
  return STATUS_RANK[a.status] - STATUS_RANK[b.status] || attentionRank(a, b) || a.roadmapPct - b.roadmapPct;
}

type SortKey = "name" | "roadmapPct" | "status" | "lastActive";

const PICKER = "flex h-9 min-w-[150px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const pickerStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

function HeaderCell({ label, keyName, sortKey, sortDir, onSort, className = "" }: { label: string; keyName?: SortKey; sortKey: SortKey; sortDir: "asc" | "desc"; onSort: (k: SortKey) => void; className?: string }) {
  const on = keyName !== undefined && sortKey === keyName;
  return (
    <th className={`px-[var(--space-4)] py-[var(--space-3)] text-left text-[11.5px] font-bold tracking-[0.04em] uppercase ${className}`} style={{ color: "var(--muted-foreground)" }}>
      {keyName ? (
        <button type="button" onClick={() => onSort(keyName)} className="dm-quiet flex cursor-pointer items-center gap-[4px] text-[11.5px] font-bold tracking-[0.04em] uppercase" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
          {label}
          {on && (sortDir === "asc" ? <ChevronUp className="h-[13px] w-[13px]" aria-hidden /> : <ChevronDown className="h-[13px] w-[13px]" aria-hidden />)}
        </button>
      ) : label}
    </th>
  );
}

/** The one blue, sized to the value, the number beside it. */
function Roadmap({ pct }: { pct: number }) {
  return (
    <span className="flex items-center gap-[8px]">
      <span className="relative block h-[6px] w-[64px] rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: PRIMARY }} />
      </span>
      <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{pct}%</span>
    </span>
  );
}

/** The chip, and for anyone not On Track the one-line reason from the
 *  student's own milestones (the Overview's attention strip's wording), so
 *  the row says what to do without opening the profile. */
function StatusCell({ s }: { s: CounselorStudent }) {
  return (
    <span className="flex flex-col items-start gap-[4px]">
      <StatusChip status={s.status} />
      {s.status !== "On Track" && <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{attentionReason(s)}</span>}
    </span>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StudentCell({ s }: { s: CounselorStudent }) {
  return (
    <span className="flex min-w-0 items-center gap-[10px]">
      <Avatar name={s.name} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>
          {s.name}
          {s.isReal && <span className="ml-[6px] rounded-full px-[6px] py-[1px] text-[10px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>You</span>}
        </span>
        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.careerTrack}</span>
      </span>
    </span>
  );
}

const PAGE_SIZE = 20;

export function StudentsRoster() {
  const router = useRouter();
  const { gradeFilter, search, statusFilter, setStatusFilter, planFilter, setPlanFilter } = useCounselorFilters();
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [intentFilter, setIntentFilter] = useState<PostsecondaryIntent | "All">("All");
  const [counselorFilter, setCounselorFilter] = useState<string>("All");
  // Roles that oversee counselors see whose caseload each student is on and
  // can narrow to one counselor; a School Counselor sees the school roster
  // as the reference does. Caseloads are seeded (counselorOrg.ts).
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor" || account.role === "School Administrator";

  const reviewed = useReviewedRoster();
  const roster = useMemo(() => {
    let list = reviewed;
    if (gradeFilter !== "All Grades") list = list.filter((s) => s.grade === gradeFilter);
    if (statusFilter !== "All") list = list.filter((s) => s.status === statusFilter);
    if (planFilter === "With Plan") list = list.filter((s) => s.postsecondaryIntent !== "Undecided");
    if (planFilter === "Undecided") list = list.filter((s) => s.postsecondaryIntent === "Undecided");
    if (intentFilter !== "All") list = list.filter((s) => s.postsecondaryIntent === intentFilter);
    if (showCounselor && counselorFilter !== "All") list = list.filter((s) => counselorFor(s).id === counselorFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || s.careerTrack.toLowerCase().includes(q));
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "roadmapPct") return (a.roadmapPct - b.roadmapPct) * dir;
      if (sortKey === "lastActive") return a.lastActive.localeCompare(b.lastActive) * dir;
      return priorityRank(a, b) * dir;
    });
  }, [reviewed, gradeFilter, search, statusFilter, planFilter, intentFilter, counselorFilter, showCounselor, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(roster.length / PAGE_SIZE));
  const effectivePage = Math.min(page, pageCount - 1);
  const pageRows = roster.slice(effectivePage * PAGE_SIZE, effectivePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const open = (s: CounselorStudent) => router.push(`/counselor?view=students&studentId=${s.id}`);

  // The Overview's "With Plan / Undecided" click-through and this screen's
  // own intent picker are the same question at two grains; the picker
  // shows whichever is set, and choosing here clears the coarse one.
  const planValue = intentFilter !== "All" ? intentFilter : planFilter === "Undecided" ? "Undecided" : planFilter === "With Plan" ? "With Plan" : "All";
  const setPlan = (v: string) => {
    if (v === "All") { setIntentFilter("All"); setPlanFilter("All"); return; }
    if (v === "With Plan") { setIntentFilter("All"); setPlanFilter("With Plan"); return; }
    setPlanFilter("All");
    setIntentFilter(v as PostsecondaryIntent);
  };

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {roster.length} student{roster.length === 1 ? "" : "s"}{!showCounselor && SCOPE_COUNSELOR_TO_CASELOAD ? ` · your caseload, ${myCounselor(account).range}` : ""}{pageCount > 1 ? ` · showing ${effectivePage * PAGE_SIZE + 1} to ${effectivePage * PAGE_SIZE + pageRows.length}` : ""}
        </span>
        <div className="flex flex-wrap items-center gap-[8px]">
          {showCounselor && (
            <Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{ value: "All", label: "All counselors" }, ...SCHOOL_COUNSELORS.map((c) => ({ value: c.id, label: c.name }))]} className={PICKER} style={pickerStyle} />
          )}
          <Listbox ariaLabel="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as StatusRosterFilter)} options={STATUS_OPTIONS.map((o) => ({ value: o, label: o === "All" ? "All statuses" : o }))} className={PICKER} style={pickerStyle} />
          <Listbox ariaLabel="Postsecondary plan" value={planValue} onChange={setPlan} options={[{ value: "All", label: "All plans" }, { value: "With Plan", label: "Has a plan" }, ...INTENT_OPTIONS.map((o) => ({ value: o, label: o }))]} className={PICKER} style={pickerStyle} />
        </div>
      </div>

      {roster.length === 0 ? (
        // Playbook tier 5: a filter returned nothing; one plain line.
        <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No students match these filters.</p>
      ) : (
        <>
          {/* Desktop: the table. Bounded height with its own scroll so the
             header stays put over 20 rows. */}
          <div className="hidden max-h-[70vh] overflow-auto rounded-[var(--radius-lg)] border lg:block" style={GLASS_CARD}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10" style={{ background: "var(--card)" }}>
                <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                  <HeaderCell label="Student" keyName="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <HeaderCell label="Roadmap" keyName="roadmapPct" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <HeaderCell label="Status" keyName="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  {showCounselor && <HeaderCell label="Counselor" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />}
                  <HeaderCell label="Milestones" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <HeaderCell label="Plan" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <HeaderCell label="Last active" keyName="lastActive" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="w-[44px] px-[var(--space-4)] py-[var(--space-3)]" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => open(s)}
                    className="dm-quiet cursor-pointer border-b transition-colors last:border-b-0 hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                    style={{ borderColor: "var(--glass-border)" }}
                  >
                    <td className="px-[var(--space-4)] py-[10px]"><StudentCell s={s} /></td>
                    <td className="px-[var(--space-4)] py-[10px]"><Roadmap pct={s.roadmapPct} /></td>
                    <td className="px-[var(--space-4)] py-[10px]"><StatusCell s={s} /></td>
                    {showCounselor && <td className="px-[var(--space-4)] py-[10px] text-[13px] font-semibold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{counselorFor(s).name}</td>}
                    <td className="px-[var(--space-4)] py-[10px]"><MilestonesMini milestones={s.milestones} /></td>
                    <td className="px-[var(--space-4)] py-[10px] text-[13px] font-semibold" style={{ color: s.postsecondaryIntent === "Undecided" ? "var(--muted-foreground)" : "var(--foreground)" }}>{s.postsecondaryIntent}</td>
                    <td className="px-[var(--space-4)] py-[10px] text-[12.5px] font-semibold tabular-nums whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{fmtDate(s.lastActive)}</td>
                    <td className="px-[var(--space-4)] py-[10px]"><ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone and tablet: the same rows as cards, no sideways scroll. */}
          <ul className="flex flex-col gap-[8px] lg:hidden">
            {pageRows.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => open(s)} className="dm-quiet flex w-full cursor-pointer flex-col gap-[10px] rounded-[var(--radius-md)] border p-[12px] text-left" style={GLASS_INSET}>
                  <span className="flex items-center justify-between gap-[10px]">
                    <StudentCell s={s} />
                    <StatusChip status={s.status} />
                  </span>
                  {(s.status !== "On Track" || showCounselor) && (
                    <span className="flex flex-wrap items-center justify-between gap-x-[10px] gap-y-[2px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      {s.status !== "On Track" && <span>{attentionReason(s)}</span>}
                      {showCounselor && <span>{counselorFor(s).name}</span>}
                    </span>
                  )}
                  <span className="flex items-center justify-between gap-[10px]">
                    <Roadmap pct={s.roadmapPct} />
                    <MilestonesMini milestones={s.milestones} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={effectivePage === 0} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <ChevronLeft className="h-[14px] w-[14px]" aria-hidden /> Previous
          </button>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Page {effectivePage + 1} of {pageCount}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={effectivePage >= pageCount - 1} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            Next <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
