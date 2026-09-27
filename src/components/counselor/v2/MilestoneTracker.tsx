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
import { Download } from "lucide-react";
import { Segmented, SegmentedRing } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { curriculumForGrade, curriculumAvgDone, statusesForItem, type CurriculumStatus, type CurriculumWindow } from "@/lib/counselorCurriculum";
import { CardLink, Go } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { SidePanel } from "./SidePanel";

type Grade = 9 | 10 | 11 | 12;
type Row = { id: string; title: string; window: CurriculumWindow; classification: string; kind: "auto" | "counselor-verified"; total: number; counts: Record<CurriculumStatus, number>; donePct: number; behindShare: number };

const STATES: { key: CurriculumStatus; label: string; color: string }[] = [
  { key: "done", label: "Done", color: PRIMARY },
  { key: "awaiting-review", label: "Needs attention", color: BLUE_3[0] },
  { key: "in-progress", label: "In progress", color: "var(--cd-blue-pale)" },
  { key: "not-started", label: "Not started", color: NEUTRAL_SLICE },
];
const WINDOW_TITLE: Record<CurriculumWindow, string> = { fall: "Fall", winter: "Winter", spring: "Spring" };



export function MilestoneTracker() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter, counselorFilter, setCounselorFilter, setStepFilter } = useCounselorFilters();
  const [grade, setGradeState] = useState<Grade>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setGrade = (g: Grade) => { setGradeState(g); setSelectedId(null); };
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

  // The reference's own precomputed grade average when unscoped (exactly
  // what the Replit shows); an average of this counselor's own rows once
  // narrowed to a caseload.
  const overallDone = scopedToCounselor ? (rows.length ? Math.round(rows.reduce((a, r) => a + r.donePct, 0) / rows.length) : 0) : curriculumAvgDone(grade);

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

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  // The Replit's own structure (27 Sept 2026, Maisha: "keep this part
  // similar to the replit. That was easier to comprehend"): grade tabs, the
  // three grade numbers, then one card per milestone with its ring and all
  // four states counted. Each card's actions open in a side panel.
  // The Fall/Winter/Spring grouping is gone: the reference has no seasons,
  // they were an even three-way split of its list, not real timing.
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented ariaLabel="Grade level" options={([9, 10, 11, 12] as const).map((g) => ({ key: String(g), label: `Grade ${g}` }))} value={String(grade)} onChange={(k) => setGrade(Number(k) as Grade)} />
        <span className="flex flex-wrap items-center gap-[8px]">
          {showCounselor && (
            <Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{ value: "All", label: "All counselors" }, ...SCHOOL_COUNSELORS.map((c) => ({ value: c.id, label: c.name }))]} className="flex h-9 min-w-[170px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
          )}
          <button type="button" onClick={exportCsv} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Download className="h-[14px] w-[14px]" aria-hidden /> CSV</button>
        </span>
      </div>

      {students.length === 0 || rows.length === 0 ? (
        <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No Grade {grade} students{showCounselor && counselorFilter !== "All" ? " on this counselor's caseload" : ""}.</p>
      ) : (
        <>
          {/* The reference's three grade numbers, and nothing else above the
             cards (27 Sept 2026, Maisha: the "Grade 9/10/11" heading and its
             explanation "feel repetitive. They are already on that grade's
             tab so we don't have to say the grade again"; the grade
             breakdown plus "Furthest behind" hero "makes it more complicated
             to read ... I would keep this part similar to the replit"). */}
          <div className="flex flex-wrap items-center gap-x-[var(--space-8)] gap-y-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)]" style={GLASS_CARD}>
            {[
              { value: String(students.length), label: "Students" },
              { value: String(rows.length), label: "Milestones" },
              { value: `${overallDone}%`, label: "Avg. done" },
            ].map((x) => (
              <span key={x.label} className="flex items-baseline gap-[8px]">
                <span className="text-[24px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{x.value}</span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{x.label}</span>
              </span>
            ))}
            <span className="ml-auto"><CardLink onClick={openAll}>Students</CardLink></span>
          </div>

          {/* One card per milestone, as the reference lays them out: the
             name and its classification, the ring with "N of M", the four
             states counted, and the way into the student breakdown. */}
          <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2 2xl:grid-cols-3">
            {rows.map((r) => (
              <li key={r.id}>
                <HoverBeam strength={0.6} className="h-full">
                  <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
                    <span className="flex flex-col items-start gap-[8px]">
                      <h3 className="text-[14.5px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</h3>
                      <span className="rounded-full border px-[9px] py-[2px] text-[11px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{r.classification}</span>
                    </span>
                    <span className="flex justify-center py-[var(--space-2)]">
                      <SegmentedRing size={132} stroke={14} segments={STATES.map((st) => ({ value: r.counts[st.key], color: st.color }))}>
                        <span className="flex flex-col items-center leading-none">
                          <span className="text-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.donePct}%</span>
                          <span className="mt-[4px] text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done · {r.counts.done} of {r.total}</span>
                        </span>
                      </SegmentedRing>
                    </span>
                    <ul className="grid grid-cols-2 gap-[6px]">
                      {STATES.map((st) => (
                        <li key={st.key} className="flex items-center justify-between gap-[8px] rounded-[var(--radius-sm)] px-[10px] py-[6px] text-[12px] font-semibold" style={{ background: "var(--inset-bg)", color: "var(--muted-foreground)" }}>
                          <span className="flex min-w-0 items-center gap-[7px]"><span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: st.color }} /><span className="truncate">{st.label}</span></span>
                          <b className="tabular-nums" style={{ color: st.key === "awaiting-review" && r.counts[st.key] > 0 ? PRIMARY : "var(--foreground)" }}>{r.counts[st.key]}</b>
                        </li>
                      ))}
                    </ul>
                    {r.counts["not-tracked"] > 0 && <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.counts["not-tracked"]} not applicable</span>}
                    <button type="button" onClick={() => setSelectedId(r.id)} className="dm-quiet mt-auto flex w-full cursor-pointer items-center justify-center gap-[4px] rounded-[var(--radius-sm)] border px-[10px] py-[8px] text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                      View details & student breakdown <Go />
                    </button>
                  </div>
                </HoverBeam>
              </li>
            ))}
          </ul>
        </>
      )}

      <SidePanel open={!!selected} onClose={() => setSelectedId(null)} title={selected?.title ?? ""} subtitle={selected ? `Grade ${grade} · ${selected.classification}` : undefined}>
        {selected && (
          <>
            <span className="flex items-center gap-[var(--space-5)]">
              <SegmentedRing size={112} stroke={12} segments={STATES.map((st) => ({ value: selected.counts[st.key], color: st.color }))}>
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{selected.donePct}%</span>
                  <span className="mt-[3px] text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{selected.counts.done} of {selected.total}</span>
                </span>
              </SegmentedRing>
              <ul className="flex flex-1 flex-col gap-[8px]">
                {STATES.map((st) => (
                  <li key={st.key} className="flex items-center justify-between gap-[10px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                    <span className="flex items-center gap-[8px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: st.color }} />{st.label}</span>
                    <span className="tabular-nums">{selected.counts[st.key]}</span>
                  </li>
                ))}
                {selected.counts["not-tracked"] > 0 && (
                  <li className="flex items-center justify-between gap-[10px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    <span>Not applicable</span><span className="tabular-nums">{selected.counts["not-tracked"]}</span>
                  </li>
                )}
              </ul>
            </span>
            <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
              {selected.total - selected.counts.done > 0 && (
                <button type="button" onClick={() => openNotDone(selected)} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] text-[13px] font-bold">
                  See the {selected.total - selected.counts.done} students not done
                </button>
              )}
              {selected.counts["awaiting-review"] > 0 && (
                <button type="button" onClick={() => { setGradeFilter(grade); router.push("/counselor?view=review-queue"); }} className="dm-quiet flex h-10 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  Review {selected.counts["awaiting-review"]} waiting on you
                </button>
              )}
              {selected.total - selected.counts.done === 0 && <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Every student has completed this.</p>}
            </div>
          </>
        )}
      </SidePanel>
    </div>
  );
}
