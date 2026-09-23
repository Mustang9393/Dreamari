"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X } from "lucide-react";
import { Meter } from "@/components/connect/viz";
import { getRoster, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useCounselorFilters } from "./shell";
import { StatusChip, MilestonesMini, Avatar } from "./chips";

const INTENT_OPTIONS: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade / Technical School", "Workforce", "Military", "Undecided"];

type SortKey = "name" | "grade" | "roadmapPct" | "status";

function HeaderCell({ label, sortable, keyName, sortKey, sortDir, onSort }: { label: string; sortable?: boolean; keyName?: SortKey; sortKey: SortKey; sortDir: "asc" | "desc"; onSort: (k: SortKey) => void }) {
  return (
    <th className="px-[var(--space-4)] py-[var(--space-3)] text-left text-[11.5px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>
      {sortable && keyName ? (
        <button type="button" onClick={() => onSort(keyName)} className="dm-quiet flex cursor-pointer items-center gap-[4px]" style={{ color: sortKey === keyName ? "var(--foreground)" : "var(--muted-foreground)" }}>
          {label}
          {sortKey === keyName && (sortDir === "asc" ? <ChevronUp className="h-[13px] w-[13px]" aria-hidden /> : <ChevronDown className="h-[13px] w-[13px]" aria-hidden />)}
        </button>
      ) : label}
    </th>
  );
}

const PAGE_SIZE = 20;

export function StudentsRoster() {
  const router = useRouter();
  const { gradeFilter, search, statusFilter, setStatusFilter, planFilter, setPlanFilter } = useCounselorFilters();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  // Local to this table, not the shared cross-view context (setStatusFilter/
  // setPlanFilter above) -- this is the only place a counselor can narrow by
  // postsecondary intent, so nothing outside this screen needs to read or
  // set it. Previously the "Filters" button did nothing at all when clicked
  // (direct feedback, earlier audit: a dead control); this is what it opens.
  const [intentFilter, setIntentFilter] = useState<PostsecondaryIntent | "All">("All");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const roster = useMemo(() => {
    let list = getRoster();
    if (gradeFilter !== "All Grades") list = list.filter((s) => s.grade === gradeFilter);
    if (statusFilter !== "All") list = list.filter((s) => s.status === statusFilter);
    if (planFilter === "With Plan") list = list.filter((s) => s.postsecondaryIntent !== "Undecided");
    if (planFilter === "Undecided") list = list.filter((s) => s.postsecondaryIntent === "Undecided");
    if (intentFilter !== "All") list = list.filter((s) => s.postsecondaryIntent === intentFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || s.careerTrack.toLowerCase().includes(q));
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "grade") return (a.grade - b.grade) * dir;
      if (sortKey === "roadmapPct") return (a.roadmapPct - b.roadmapPct) * dir;
      return a.status.localeCompare(b.status) * dir;
    });
  }, [gradeFilter, search, statusFilter, planFilter, intentFilter, sortKey, sortDir]);

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
      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Showing {pageRows.length ? effectivePage * PAGE_SIZE + 1 : 0}–{effectivePage * PAGE_SIZE + pageRows.length} of {roster.length} student{roster.length === 1 ? "" : "s"}</span>
        <div className="flex flex-wrap items-center gap-[8px]">
          {/* Set by clicking a donut segment on Overview -- shown here as a
             removable chip so it's obvious the list is narrowed and how to
             get back, not just a table that quietly came up short. */}
          {statusFilter !== "All" && (
            <button type="button" onClick={() => setStatusFilter("All")} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--foreground)" }}>
              {statusFilter} <span aria-hidden style={{ color: "var(--muted-foreground)" }}>✕</span>
            </button>
          )}
          {planFilter !== "All" && (
            <button type="button" onClick={() => setPlanFilter("All")} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--foreground)" }}>
              {planFilter} <span aria-hidden style={{ color: "var(--muted-foreground)" }}>✕</span>
            </button>
          )}
          {intentFilter !== "All" && (
            <button type="button" onClick={() => setIntentFilter("All")} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--foreground)" }}>
              {intentFilter} <span aria-hidden style={{ color: "var(--muted-foreground)" }}>✕</span>
            </button>
          )}
          {/* Used to be a plain decorative span -- clicking it did nothing
             at all (direct feedback from the earlier audit: a dead
             control). Opens a real filter, postsecondary intent, that
             wasn't reachable any other way on this screen. */}
          <div className="relative">
            <button
              type="button" onClick={() => setFiltersOpen((o) => !o)}
              className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold"
              style={{ borderColor: filtersOpen ? "color-mix(in srgb, var(--primary) 35%, var(--glass-border))" : "var(--glass-border)", color: "var(--foreground)" }}
            >
              <Filter className="h-[14px] w-[14px]" aria-hidden />
              Filters
            </button>
            {filtersOpen && (
              <>
                <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="fixed inset-0 z-10 cursor-default" />
                <div className="absolute top-[calc(100%+6px)] right-0 z-20 flex w-[240px] flex-col gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--card)", boxShadow: "0 16px 40px -12px rgba(0,0,0,0.6)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>Postsecondary intent</span>
                    <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="dm-quiet flex size-6 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                      <X className="h-[13px] w-[13px]" aria-hidden />
                    </button>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    {INTENT_OPTIONS.map((opt) => (
                      <button
                        key={opt} type="button"
                        onClick={() => { setIntentFilter(opt === intentFilter ? "All" : opt); setFiltersOpen(false); }}
                        className="dm-quiet flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left text-[13px] font-semibold"
                        style={{ background: intentFilter === opt ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: intentFilter === opt ? "var(--foreground)" : "var(--muted-foreground)" }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unpaginated, this table rendered all 120 rows in one pass -- a
         ~10,000px-tall page. Real UX problem on its own (nobody scrolls
         that far to find a student), and it's also the confirmed cause of
         a genuine blank-render bug on mobile (direct report: "the student
         screen has absolutely nothing"), so this fixes both at once.
         Bounded to a max height with its own internal scroll (rather than
         letting even 20 rows stretch the page) so the header can stick
         within it -- a table this tall with no sticky header meant the
         column meaning scrolled away with the first few rows. "School" is
         dropped entirely: every single row said "Lincoln High School" (a
         one-school demo, already shown in the topbar), so the column was
         width spent on zero information. The five separate milestone
         pill columns (Career Report/Resume/Applications/Rec. Letter/
         Transcript, mostly repeating "Approved") collapse into one
         Milestones column covering all 11 -- see MilestonesMini in
         chips.tsx for why that's more complete, not just more compact. */}
      <div className="max-h-[70vh] overflow-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 4%, var(--card))" }}>
        <table className="w-full min-w-[1100px] border-collapse">
          <thead className="sticky top-0 z-10" style={{ background: "var(--card)" }}>
            <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
              <HeaderCell label="Student" sortable keyName="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Grade" sortable keyName="grade" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Career Track" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Roadmap" sortable keyName="roadmapPct" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Status" sortable keyName="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <HeaderCell label="Milestones" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
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
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{s.careerTrack}</td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]">
                  <Meter value={s.roadmapPct} max={100} accent="#2F6BF2" />
                </td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><StatusChip status={s.status} /></td>
                <td className="px-[var(--space-4)] py-[var(--space-3)]"><MilestonesMini milestones={s.milestones} /></td>
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
