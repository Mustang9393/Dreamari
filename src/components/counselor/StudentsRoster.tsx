"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, ChevronRight, ChevronLeft } from "lucide-react";
import { getRoster } from "@/lib/counselorRoster";
import { useCounselorFilters } from "./shell";
import { StatusChip, MilestoneChip, Avatar } from "./chips";

// "none" = the reference's own row order (its data order, Emma Rodriguez
// first), which is what the table shows until a header is clicked.
type SortKey = "none" | "name" | "grade" | "roadmapPct" | "status";

function HeaderCell({ label, sortable, keyName, sortKey, sortDir, onSort }: { label: string; sortable?: boolean; keyName?: SortKey; sortKey: SortKey; sortDir: "asc" | "desc"; onSort: (k: SortKey) => void }) {
  return (
    <th className="px-[var(--space-4)] py-[var(--space-3)] text-left text-[11.5px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>
      {sortable && keyName ? (
        <button type="button" onClick={() => onSort(keyName)} className="dm-quiet flex cursor-pointer items-center gap-[4px]" style={{ color: sortKey === keyName ? "var(--foreground)" : "var(--muted-foreground)" }}>
          {label}
          {sortKey === keyName && <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
        </button>
      ) : label}
    </th>
  );
}

const PAGE_SIZE = 20;

export function StudentsRoster() {
  const router = useRouter();
  const { gradeFilter, search } = useCounselorFilters();
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const roster = useMemo(() => {
    let list = getRoster();
    if (gradeFilter !== "All Grades") list = list.filter((s) => s.grade === gradeFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || s.careerTrack.toLowerCase().includes(q));
    if (sortKey === "none") return list;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "grade") return (a.grade - b.grade) * dir;
      if (sortKey === "roadmapPct") return (a.roadmapPct - b.roadmapPct) * dir;
      return a.status.localeCompare(b.status) * dir;
    });
  }, [gradeFilter, search, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(roster.length / PAGE_SIZE));
  // Clamped at read time, not reset via an effect: if a filter shrinks the
  // list below the current page, this falls back to the last real page
  // instead of a blank one -- no extra state, no effect needed.
  const effectivePage = Math.min(page, pageCount - 1);
  const pageRows = roster.slice(effectivePage * PAGE_SIZE, effectivePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Showing {pageRows.length ? effectivePage * PAGE_SIZE + 1 : 0}–{effectivePage * PAGE_SIZE + pageRows.length} of {roster.length} student{roster.length === 1 ? "" : "s"}</span>
        <span className="dm-quiet flex h-9 cursor-default items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          <Filter className="h-[14px] w-[14px]" aria-hidden />
          Filters
        </span>
      </div>

      {/* Unpaginated, this table rendered all 120 rows in one pass -- a
         ~10,000px-tall page. Real UX problem on its own (nobody scrolls
         that far to find a student), and it's also the confirmed cause of
         a genuine blank-render bug on mobile (direct report: "the student
         screen has absolutely nothing"), so this fixes both at once. */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 4%, var(--card))" }}>
        <table className="w-full min-w-[1440px] border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
              <HeaderCell label="Student" sortable keyName="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Grade" sortable keyName="grade" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="School" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Career Track" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Roadmap" sortable keyName="roadmapPct" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Status" sortable keyName="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Career Report" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Resume" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Applications" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Rec. Letter" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Transcript" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Postsecondary Plan" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Last Active" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-[var(--space-4)] py-[var(--space-3)]" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s) => (
              <tr
                key={s.id}
                onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)}
                className="dm-quiet cursor-pointer border-b transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <td className="px-[var(--space-4)] py-[var(--space-3)]">
                  <span className="flex items-center gap-[10px]">
                    <Avatar name={s.name} />
                    <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}{s.isReal && <span className="ml-[6px] rounded-full px-[6px] py-[1px] text-[10px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>You</span>}</span>
                  </span>
                </td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-[13px] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{s.grade}</td>
                {/* The reference's table abbreviates the school ("Lincoln")
                   and prints the roadmap as a bar with "92%" under it, not
                   "92/100" beside it -- matched 1:1. */}
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{s.school.replace(/ High School$/, "")}</td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{s.careerTrack}</td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]">
                  <span className="flex flex-col gap-[4px]" aria-label={`Roadmap ${s.roadmapPct}%`}>
                    <span className="relative block h-[7px] w-[72px] overflow-hidden rounded-[4px]" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }} aria-hidden>
                      <span className="absolute inset-y-0 left-0 rounded-[4px]" style={{ width: `${s.roadmapPct}%`, background: "linear-gradient(90deg, color-mix(in srgb, #2F6BF2 70%, transparent), #2F6BF2)", boxShadow: "0 0 8px color-mix(in srgb, #2F6BF2 65%, transparent)" }} />
                    </span>
                    <span className="text-[11.5px] leading-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{s.roadmapPct}%</span>
                  </span>
                </td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><StatusChip status={s.status} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><MilestoneChip status={s.milestones["Career Report"]} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><MilestoneChip status={s.milestones["Resume"]} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><MilestoneChip status={s.milestones["Applications"]} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><MilestoneChip status={s.milestones["Recommendation Letter"]} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><MilestoneChip status={s.milestones["Transcript Submission"]} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{s.postsecondaryIntent}</td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{s.lastActive}</td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={effectivePage === 0}
            className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          >
            <ChevronLeft className="h-[14px] w-[14px]" aria-hidden /> Previous
          </button>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Page {effectivePage + 1} of {pageCount}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={effectivePage >= pageCount - 1}
            className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          >
            Next <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
