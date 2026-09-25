"use client";

// DEMO-ONLY v2 Milestone Tracker.
//
// Rebuilt 25 Sept 2026 on the student app's own My Plan steps (the bridge
// Usman asked for), then rebuilt again the same day after a content audit
// against v1/the Replit reference found that pass had replaced the
// reference's own named per-grade curriculum instead of keeping it: v1's
// `milestoneReadiness.ts` (Grade 9 has 7 checkpoints, Grade 10 has 8,
// Grade 11 has 11, Grade 12 has 10, each with its own name, completion %
// and classification) had gone completely unused. Maisha, 25 Sept 2026:
// "keep content the same as that's needed for counselors... open to you
// making it visually look better as long as content and comprehension
// isn't reduced." Rows here are that curriculum, verbatim
// (`src/lib/counselorCurriculum.ts`), wearing the same visual language
// this screen already had: a hero ring for the checkpoint furthest
// behind, three season tiles, drill-through to the students who have not
// done it.
//
// A tile used to open its own accordion inline, stacked among the other
// two seasons' collapsed summaries. Changed 26 Sept 2026 (direct
// instruction: "instead of when i click the rows under it expand, make
// it so that the entire section under the tiles reflect what i click
// with a close button or back button"): a tile now replaces the whole
// area below the tiles with just that season's checklist, with a Back
// button to return to nothing selected.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";
import { Segmented, SegmentedRing } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { curriculumForGrade, curriculumFocus, curriculumAvgDone, statusesForItem, type CurriculumStatus, type CurriculumWindow } from "@/lib/counselorCurriculum";
import { CardLink, Go, STATUS_COLORS } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { OverviewCard, Stat, Verdict } from "./overviewShared";
import { Ring } from "./PlanMap";

type Grade = 9 | 10 | 11 | 12;
type Row = { id: string; title: string; window: CurriculumWindow; classification: string; kind: "auto" | "counselor-verified"; total: number; counts: Record<CurriculumStatus, number>; donePct: number; behindShare: number };

const STATES: { key: CurriculumStatus; label: string; color: string }[] = [
  { key: "done", label: "Done", color: PRIMARY },
  { key: "awaiting-review", label: "Needs attention", color: BLUE_3[0] },
  { key: "in-progress", label: "In progress", color: "#C9D0FE" },
  { key: "not-started", label: "Not started", color: NEUTRAL_SLICE },
];
const WINDOW_TITLE: Record<CurriculumWindow, string> = { fall: "Fall", winter: "Winter", spring: "Spring" };

function outstanding(r: Row): string {
  const parts: string[] = [];
  if (r.counts["awaiting-review"]) parts.push(`${r.counts["awaiting-review"]} need attention`);
  if (r.counts["not-started"]) parts.push(`${r.counts["not-started"]} not started`);
  if (r.counts["in-progress"]) parts.push(`${r.counts["in-progress"]} in progress`);
  return parts.length ? parts.join(" · ") : "Everyone is done";
}

function StatusBar({ r }: { r: Row }) {
  return (
    <span className="flex h-[10px] w-full gap-[2px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 6%, transparent)" }} aria-hidden>
      {STATES.map((s) => {
        const n = r.counts[s.key];
        if (!n) return null;
        return <span key={s.key} title={`${s.label}: ${n}`} className="h-full flex-none first:rounded-l-full last:rounded-r-full" style={{ width: `${(n / Math.max(1, r.total)) * 100}%`, background: s.color }} />;
      })}
    </span>
  );
}

export function MilestoneTracker() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter, counselorFilter, setCounselorFilter, setStepFilter } = useCounselorFilters();
  const [grade, setGradeState] = useState<Grade>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  // Which season is open. None by default (direct instruction, 25 Sept
  // 2026: "do not open any of the accordions ... by default. The three
  // tiles with the graphs do the job of giving glanceable info"); a tile
  // or a header opens one season at a time, reset on a grade change.
  const [openWindow, setOpenWindow] = useState<CurriculumWindow | null>(null);
  const setGrade = (g: Grade) => { setGradeState(g); setOpenWindow(null); };
  const roster = useReviewedRoster();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";
  const gradeRoster = useMemo(() => roster.filter((s) => s.grade === grade), [roster, grade]);
  const students = useMemo(() => gradeRoster.filter((s) => !showCounselor || counselorFilter === "All" || counselorFor(s).id === counselorFilter), [gradeRoster, showCounselor, counselorFilter]);
  const scopedToCounselor = showCounselor && counselorFilter !== "All";

  const items = useMemo(() => curriculumForGrade(grade), [grade]);

  // The reference's own aggregate counts by default (30 students, exactly
  // what the Replit showed); scaled to one counselor's own share of the
  // grade when the Lead Counselor narrows to a caseload, using the same
  // per-student assignment the "Not done" drill-through reads.
  const rows = useMemo<Row[]>(() => {
    return items.map((item) => {
      let counts: Record<CurriculumStatus, number>;
      let total: number;
      if (scopedToCounselor) {
        const statusMap = statusesForItem(item, gradeRoster);
        const ids = new Set(students.map((s) => s.id));
        const tally: Record<CurriculumStatus, number> = { done: 0, "awaiting-review": 0, "in-progress": 0, "not-started": 0, "not-tracked": 0 };
        let t = 0;
        for (const [id, status] of statusMap) {
          if (!ids.has(id) || status === "not-tracked") continue;
          tally[status]++;
          t++;
        }
        counts = tally;
        total = t;
      } else {
        counts = { done: item.completed, "awaiting-review": item.needsAttention, "in-progress": item.inProgress, "not-started": item.notStarted, "not-tracked": item.notApplicable };
        total = item.total;
      }
      const donePct = total ? Math.round((counts.done / total) * 100) : 0;
      const behindShare = total ? (counts["not-started"] + counts["awaiting-review"] * 0.5) / total : -1;
      return { id: item.id, title: item.name, window: item.window, classification: item.classification, kind: item.kind, total, counts, donePct, behindShare };
    });
  }, [items, scopedToCounselor, gradeRoster, students]);

  const focus = rows.slice().sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct)[0];
  // The reference's own precomputed grade average when unscoped (exactly
  // what the Replit shows); an average of this counselor's own rows once
  // narrowed to a caseload.
  const overallDone = scopedToCounselor ? (rows.length ? Math.round(rows.reduce((a, r) => a + r.donePct, 0) / rows.length) : 0) : curriculumAvgDone(grade);
  const awaiting = rows.reduce((a, r) => a + r.counts["awaiting-review"], 0);
  const notStarted = rows.reduce((a, r) => a + r.counts["not-started"], 0);

  const openNotDone = (r: Row) => {
    setGradeFilter(grade);
    setStepFilter({ id: r.id, title: r.title, grade });
    router.push("/counselor?view=students");
  };
  const openAll = () => { setGradeFilter(grade); setStepFilter(null); router.push("/counselor?view=students"); };
  const exportCsv = () => {
    const lines = [["Window", "Checkpoint", "Classification", "Students", "Done", "Needs attention", "In progress", "Not started", "Done %"], ...rows.map((r) => [WINDOW_TITLE[r.window], r.title, r.classification, String(r.total), String(r.counts.done), String(r.counts["awaiting-review"]), String(r.counts["in-progress"]), String(r.counts["not-started"]), String(r.donePct)])];
    const csv = lines.map((l) => l.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `grade-${grade}-milestones.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center gap-[10px]">
          <Segmented ariaLabel="Grade level" options={([9, 10, 11, 12] as const).map((g) => ({ key: String(g), label: `Grade ${g}` }))} value={String(grade)} onChange={(k) => setGrade(Number(k) as Grade)} />
          {showCounselor && (
            <Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{ value: "All", label: "All counselors" }, ...SCHOOL_COUNSELORS.map((c) => ({ value: c.id, label: c.name }))]} className="flex h-9 min-w-[170px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-6)]">
          <Stat value={String(students.length)} label="students" />
          <Stat value={String(rows.length)} label="checkpoints" />
          <Stat value={`${overallDone}%`} label="done" />
          <Stat value={String(awaiting)} label="need attention" color={awaiting > 0 ? PRIMARY : undefined} />
          <Stat value={String(notStarted)} label="not started" color={notStarted > 0 ? STATUS_COLORS["Needs Attention"] : undefined} />
          <button type="button" onClick={exportCsv} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Download className="h-[14px] w-[14px]" aria-hidden /> CSV</button>
        </div>
      </div>

      {students.length === 0 || !focus ? (
        <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No Grade {grade} students{showCounselor && counselorFilter !== "All" ? " on this counselor's caseload" : ""}.</p>
      ) : (
        <>
          <HoverBeam strength={0.7} className="h-full">
            <div className="group relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
              <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
              {/* Composition: title without an eyebrow, then the ring
                 with its legend beside it, the insight alone in the
                 middle behind a hairline, the pill in the corner. */}
              <span className="absolute top-[var(--space-5)] right-[var(--space-5)] z-[1] hidden sm:block"><CardLink onClick={() => openNotDone(focus)}>{focus.total - focus.counts.done} not done</CardLink></span>
              <div className="relative flex flex-col gap-[var(--space-5)] sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-[var(--space-8)] sm:pr-[150px]">
                <div className="flex flex-col gap-[var(--space-4)]">
                  <div className="flex flex-wrap items-start justify-between gap-[8px]">
                    <h2 className="text-[18px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{focus.title}</h2>
                    <span className="sm:hidden"><CardLink onClick={() => openNotDone(focus)}>{focus.total - focus.counts.done} not done</CardLink></span>
                  </div>
                  <div className="flex items-center gap-[var(--space-4)]">
                    <SegmentedRing size={104} stroke={11} segments={STATES.map((st) => ({ value: focus.counts[st.key], color: st.color }))}>
                      <span className="flex flex-col items-center leading-none">
                        <span className="text-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{focus.donePct}%</span>
                        <span className="mt-[3px] text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span>
                      </span>
                    </SegmentedRing>
                    <ul className="flex flex-col gap-[4px]">
                      {STATES.filter((st) => st.key !== "done" && focus.counts[st.key] > 0).map((st) => (
                        <li key={st.key} className="flex items-center gap-[7px] text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>
                          <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: st.color }} />
                          <span className="tabular-nums">{focus.counts[st.key]}</span>
                          <span style={{ color: "var(--muted-foreground)" }}>{st.label.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col gap-[6px] sm:max-w-[420px] sm:border-l sm:pl-[var(--space-8)]" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Focus first</span>
                  <Verdict band={focus.counts["not-started"] / Math.max(1, focus.total) >= 0.5 ? "missed" : focus.counts["not-started"] > 0 || focus.counts["awaiting-review"] > 0 ? "near" : "met"}>
                    {focus.total - focus.counts.done === 0 ? "Everyone is done" : `${focus.total - focus.counts.done} of ${focus.total} students still need this${focus.counts["awaiting-review"] ? `, ${focus.counts["awaiting-review"]} waiting on you` : ""}`}
                  </Verdict>
                  <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{WINDOW_TITLE[focus.window]} checkpoint · {focus.classification}</span>
                </div>
              </div>
            </div>
          </HoverBeam>

          <OverviewCard title={`Grade ${grade} curriculum`} unit={curriculumFocus(grade)} aside={<CardLink onClick={openAll}>Students</CardLink>}>
            {/* Three season tiles -- the same tile/ring language the rest
               of v2 uses, computed from the reference's own checkpoints
               grouped into thirds by their own listed order (fall/winter/
               spring; see counselorCurriculum.ts). A tile picks the
               season accordion below. */}
            <div className="grid grid-cols-3 gap-[8px]">
              {(["fall", "winter", "spring"] as const).map((w) => {
                const list = rows.filter((r) => r.window === w);
                if (list.length === 0) return <span key={w} aria-hidden />;
                const tracked = list.reduce((a, r) => a + r.total, 0);
                const done = list.reduce((a, r) => a + r.counts.done, 0);
                const pct = tracked ? Math.round((done / tracked) * 100) : 0;
                const needAttn = list.reduce((a, r) => a + r.counts["awaiting-review"], 0);
                const notDone = list.reduce((a, r) => a + r.counts["not-started"], 0);
                const active = openWindow === w;
                return (
                  <button
                    key={w}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setOpenWindow(active ? null : w)}
                    className="dm-quiet flex min-w-0 cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border px-[10px] py-[9px] text-left sm:px-[12px]"
                    style={{ ...GLASS_INSET, ...(active ? { borderColor: `color-mix(in srgb, ${PRIMARY} 55%, var(--glass-border))` } : null) }}
                  >
                    <Ring pct={pct} size={36} stroke={4.5} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: active ? PRIMARY : "var(--muted-foreground)" }}>{WINDOW_TITLE[w]}</span>
                      <span className="text-[15px] leading-[1.1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{pct}%</span>
                      <span className="hidden truncate text-[11px] font-semibold sm:block" style={{ color: needAttn > 0 ? PRIMARY : "var(--muted-foreground)" }}>{needAttn > 0 ? `${needAttn} to review` : notDone > 0 ? `${notDone} to do` : "all done"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {/* A tile picks a season; the whole area below the tiles then
               shows ONLY that season's checklist, not a list of three
               accordions (direct instruction, 26 Sept 2026: "instead of
               when i click the rows under it expand, make it so that the
               entire section under the tiles reflect what i click with a
               close button or back button"). Nothing renders here until a
               tile is picked. */}
            {openWindow && (() => {
              const list = rows.filter((r) => r.window === openWindow).sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct);
              const seasonDone = list.length ? Math.round(list.reduce((a, r) => a + r.donePct, 0) / list.length) : 0;
              const toReview = list.reduce((a, r) => a + r.counts["awaiting-review"], 0);
              return (
                <div className="flex flex-col gap-[var(--space-4)]">
                  <div className="flex flex-wrap items-center justify-between gap-[10px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                    <button type="button" onClick={() => setOpenWindow(null)} className="dm-quiet flex cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
                      <ChevronLeft className="h-4 w-4" aria-hidden /> Back
                    </button>
                    <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{WINDOW_TITLE[openWindow]} · {list.length} checkpoint{list.length === 1 ? "" : "s"} · {seasonDone}% done{toReview ? ` · ${toReview} to review` : ""}</span>
                  </div>
                  <span className="flex flex-wrap gap-x-[14px] gap-y-[4px]">
                    {STATES.map((st) => (
                      <span key={st.key} className="flex items-center gap-[6px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        <span aria-hidden className="size-[8px] rounded-full" style={{ background: st.color }} />{st.label}
                      </span>
                    ))}
                  </span>
                  <ul className="flex flex-col gap-[6px]">
                    {list.map((r) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => openNotDone(r)} className="dm-quiet group flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left" style={GLASS_INSET}>
                          <span className="flex flex-wrap items-baseline justify-between gap-x-[10px] gap-y-[2px]">
                            <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
                              <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                              <span className="text-[11.5px] font-semibold" style={{ color: r.counts["awaiting-review"] > 0 ? PRIMARY : "var(--muted-foreground)" }}>{outstanding(r)}</span>
                            </span>
                            <span className="flex flex-none items-baseline gap-[8px]">
                              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.classification}</span>
                              <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.donePct}% <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span></span>
                              <Go className="self-center" />
                            </span>
                          </span>
                          <StatusBar r={r} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </OverviewCard>
        </>
      )}
    </div>
  );
}
