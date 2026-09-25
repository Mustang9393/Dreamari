"use client";

// DEMO-ONLY v2 Milestone Tracker, rebuilt 25 Sept 2026 on My Plan itself
// (the bridge Usman asked for: "the student app in general, and My Plan in
// particular, should define what the counselor dashboard shows").
//
// Rows are the grade's own My Plan steps (gradePlanData.ts), grouped Fall /
// Winter / Spring; each row's counts come from what students have actually
// done (src/lib/studentSignals.ts): IN APP steps auto-track, counselor-
// verified steps read the counselor's decisions, student-reported steps say
// "not tracked yet" until the backend stores them. Every row opens Students
// filtered to the students who have not done that step, which is what the
// SchooLinks staff dashboard does best and what a counselor acts on.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Segmented, SegmentedRing } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GRADE_PLANS, type GradeWindow } from "@/components/profile/gradePlanData";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { planReadings, KIND_LABEL, type StepKind, type StepStatus } from "@/lib/studentSignals";
import { CardLink, Go, STATUS_COLORS } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { OverviewCard, Stat, Verdict } from "./overviewShared";
import { SeasonStrip } from "./PlanMap";
import { Disclosure } from "./Disclosure";

type Grade = 9 | 10 | 11 | 12;
type Row = { id: string; title: string; window: GradeWindow["id"]; kind: StepKind; total: number; counts: Record<StepStatus, number>; donePct: number; behindShare: number; tracked: boolean; deadlineBound: boolean };

const STATES: { key: StepStatus; label: string; color: string }[] = [
  { key: "done", label: "Done", color: PRIMARY },
  { key: "awaiting-review", label: "Awaiting your review", color: BLUE_3[0] },
  { key: "in-progress", label: "In progress", color: "#C9D0FE" },
  { key: "not-started", label: "Not started", color: NEUTRAL_SLICE },
];
const WINDOW_TITLE: Record<GradeWindow["id"], string> = { fall: "Fall", winter: "Winter", spring: "Spring" };

function outstanding(r: Row): string {
  if (!r.tracked) return "Student reports this; not tracked in the app yet";
  const parts: string[] = [];
  if (r.counts["awaiting-review"]) parts.push(`${r.counts["awaiting-review"]} awaiting your review`);
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
  const [openWindow, setOpenWindow] = useState<GradeWindow["id"] | null>(null);
  const setGrade = (g: Grade) => { setGradeState(g); setOpenWindow(null); };
  const roster = useReviewedRoster();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";
  const students = useMemo(() => roster.filter((s) => s.grade === grade && (!showCounselor || counselorFilter === "All" || counselorFor(s).id === counselorFilter)), [roster, grade, showCounselor, counselorFilter]);

  const rows = useMemo<Row[]>(() => {
    const plan = GRADE_PLANS.find((p) => p.grade === grade)!;
    const byStep = new Map<string, Row>();
    for (const w of plan.windows) for (const st of w.steps) if (!st.optional) byStep.set(st.id, { id: st.id, title: st.title, window: w.id, kind: st.inApp ? "in-app" : st.counselorVerified ? "counselor-verified" : "student-reported", total: 0, counts: { done: 0, "in-progress": 0, "not-started": 0, "awaiting-review": 0, "not-tracked": 0 }, donePct: 0, behindShare: 0, tracked: true, deadlineBound: !!st.deadlineBound });
    for (const s of students) for (const r of planReadings(s)) { const row = byStep.get(r.step.id); if (!row) continue; row.total++; row.counts[r.status]++; }
    for (const row of byStep.values()) {
      row.tracked = row.counts["not-tracked"] < row.total;
      const tracked = row.total - row.counts["not-tracked"];
      row.donePct = tracked ? Math.round((row.counts.done / tracked) * 100) : 0;
      row.behindShare = tracked ? (row.counts["not-started"] + row.counts["awaiting-review"] * 0.5) / tracked : -1;
    }
    return [...byStep.values()];
  }, [students, grade]);

  const tracked = rows.filter((r) => r.tracked);
  const focus = tracked.slice().sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct)[0];
  const overallDone = tracked.length ? Math.round(tracked.reduce((a, r) => a + r.donePct, 0) / tracked.length) : 0;
  const awaiting = rows.reduce((a, r) => a + r.counts["awaiting-review"], 0);
  const notStarted = rows.reduce((a, r) => a + r.counts["not-started"], 0);

  const openNotDone = (r: Row) => {
    setGradeFilter(grade);
    setStepFilter({ id: r.id, title: r.title, grade });
    router.push("/counselor?view=students");
  };
  const openAll = () => { setGradeFilter(grade); setStepFilter(null); router.push("/counselor?view=students"); };
  const exportCsv = () => {
    const lines = [["Window", "Step", "Tracked as", "Students", "Done", "Awaiting review", "In progress", "Not started", "Done %"], ...rows.map((r) => [WINDOW_TITLE[r.window], r.title, KIND_LABEL[r.kind], String(r.total), String(r.counts.done), String(r.counts["awaiting-review"]), String(r.counts["in-progress"]), String(r.counts["not-started"]), r.tracked ? String(r.donePct) : ""])];
    const csv = lines.map((l) => l.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `grade-${grade}-my-plan.csv`; a.click(); URL.revokeObjectURL(url);
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
          <Stat value={String(rows.length)} label="steps" />
          <Stat value={`${overallDone}%`} label="done" />
          <Stat value={String(awaiting)} label="awaiting review" color={awaiting > 0 ? PRIMARY : undefined} />
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
              {/* One ring instead of a stacked bar (direct feedback, 25 Sept
                 2026: "the hero graph can be something else ... simpler,
                 much more cleaner"): the same completion mark as the
                 season tiles and the Overview donuts, the four states as
                 arcs, done in the middle, the counts beside it. */}
              <div className="relative flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-start sm:justify-between sm:gap-[var(--space-6)]">
                <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-3)]">
                  <div className="flex flex-wrap items-start justify-between gap-[8px]">
                    <span className="flex flex-col gap-[2px]">
                      <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Focus first · {WINDOW_TITLE[focus.window]} · {KIND_LABEL[focus.kind]}</span>
                      <h2 className="text-[17px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{focus.title}</h2>
                    </span>
                    {/* Phones only: the pill stays with the title. On wider
                       cards it moves to the hero's top-right corner (below),
                       direct report 25 Sept 2026: "should be in the top
                       right corner but currently sits in the middle". */}
                    <span className="sm:hidden"><CardLink onClick={() => openNotDone(focus)}>{focus.total - focus.counts.done} not done</CardLink></span>
                  </div>
                  <Verdict band={focus.counts["not-started"] / Math.max(1, focus.total) >= 0.5 ? "missed" : focus.counts["not-started"] > 0 || focus.counts["awaiting-review"] > 0 ? "near" : "met"}>
                    {focus.total - focus.counts.done === 0 ? "Everyone is done" : `${focus.total - focus.counts.done} of ${focus.total} students still need this${focus.counts["awaiting-review"] ? `, ${focus.counts["awaiting-review"]} waiting on you` : ""}`}
                  </Verdict>
                </div>
                <div className="flex flex-none flex-col items-end gap-[var(--space-3)]">
                  <span className="hidden sm:block"><CardLink onClick={() => openNotDone(focus)}>{focus.total - focus.counts.done} not done</CardLink></span>
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
                        <span style={{ color: "var(--muted-foreground)" }}>{st.label.toLowerCase().replace("awaiting your review", "awaiting you")}</span>
                      </li>
                    ))}
                  </ul>
                  </div>
                </div>
              </div>
            </div>
          </HoverBeam>

          <OverviewCard title={`Grade ${grade} My Plan`} unit={`${rows.length} steps · by season`} aside={<CardLink onClick={openAll}>Students</CardLink>}>
            {/* The grade's three seasons as rings: the season picker for
               the list below (the grade itself comes from the tabs above;
               a four-grade map here was "genuinely confusing"). */}
            <SeasonStrip roster={students} grade={grade} activeWindow={openWindow} onPick={(w) => setOpenWindow(openWindow === w ? null : w)} />
            {(["fall", "winter", "spring"] as const).map((w) => {
              const list = rows.filter((r) => r.window === w).sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct);
              if (list.length === 0) return null;
              const trackedHere = list.filter((r) => r.tracked);
              const seasonDone = trackedHere.length ? Math.round(trackedHere.reduce((a, r) => a + r.donePct, 0) / trackedHere.length) : 0;
              const toReview = list.reduce((a, r) => a + r.counts["awaiting-review"], 0);
              const isOpen = openWindow === w;
              return (
                <Disclosure key={w} id={`season-${w}`} title={WINDOW_TITLE[w]} open={isOpen} onToggle={() => setOpenWindow(isOpen ? null : w)}
                  summary={`${list.length} step${list.length === 1 ? "" : "s"} · ${trackedHere.length ? `${seasonDone}% done` : "student reports"}${toReview ? ` · ${toReview} to review` : ""}`}>
                  {/* The legend lives inside the open season only (direct
                     instruction, 25 Sept 2026: "contextual and not above all
                     of them"). */}
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
                        <button type="button" onClick={() => r.tracked && openNotDone(r)} disabled={!r.tracked} className="dm-quiet group flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left disabled:cursor-default" style={GLASS_INSET}>
                          <span className="flex flex-wrap items-baseline justify-between gap-x-[10px] gap-y-[2px]">
                            <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
                              <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                              <span className="text-[11.5px] font-semibold" style={{ color: r.counts["awaiting-review"] > 0 ? PRIMARY : "var(--muted-foreground)" }}>{outstanding(r)}</span>
                            </span>
                            <span className="flex flex-none items-baseline gap-[8px]">
                              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.kind === "in-app" ? "auto" : r.kind === "counselor-verified" ? "you verify" : "student reports"}{r.deadlineBound ? " · deadline" : ""}</span>
                              {r.tracked && <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.donePct}% <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span></span>}
                              {r.tracked && <Go className="self-center" />}
                            </span>
                          </span>
                          {r.tracked && <StatusBar r={r} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              );
            })}
          </OverviewCard>
        </>
      )}
    </div>
  );
}
