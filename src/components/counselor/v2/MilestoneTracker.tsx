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
import { Segmented } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GRADE_PLANS, type GradeWindow } from "@/components/profile/gradePlanData";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { planReadings, KIND_LABEL, type StepKind, type StepStatus } from "@/lib/studentSignals";
import { CardLink, STATUS_COLORS } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { OverviewCard, Stat, Verdict } from "./overviewShared";

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
  const [grade, setGrade] = useState<Grade>(gradeFilter === "All Grades" ? 9 : gradeFilter);
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
              <div className="relative flex flex-col gap-[var(--space-4)]">
                <div className="flex flex-wrap items-start justify-between gap-[8px]">
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Focus first · {WINDOW_TITLE[focus.window]} · {KIND_LABEL[focus.kind]}</span>
                    <h2 className="text-[17px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{focus.title}</h2>
                  </span>
                  <CardLink onClick={() => openNotDone(focus)}>{focus.total - focus.counts.done} not done</CardLink>
                </div>
                <Verdict band={focus.counts["not-started"] / Math.max(1, focus.total) >= 0.5 ? "missed" : focus.counts["not-started"] > 0 || focus.counts["awaiting-review"] > 0 ? "near" : "met"}>{outstanding(focus)}</Verdict>
                <div className="flex items-center gap-[12px]">
                  <span className="flex-none text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{focus.donePct}%</span>
                  <StatusBar r={focus} />
                </div>
              </div>
            </div>
          </HoverBeam>

          <OverviewCard title={`Grade ${grade} My Plan`} unit={`${rows.length} steps · by season`} aside={<CardLink onClick={openAll}>Students</CardLink>}>
            <span className="flex flex-wrap gap-x-[14px] gap-y-[4px]">
              {STATES.map((s) => (
                <span key={s.key} className="flex items-center gap-[6px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  <span aria-hidden className="size-[8px] rounded-full" style={{ background: s.color }} />{s.label}
                </span>
              ))}
            </span>
            {(["fall", "winter", "spring"] as const).map((w) => {
              const list = rows.filter((r) => r.window === w).sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct);
              if (list.length === 0) return null;
              return (
                <div key={w} className="flex flex-col gap-[8px]">
                  <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>{WINDOW_TITLE[w]}</span>
                  <ul className="flex flex-col gap-[6px]">
                    {list.map((r) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => r.tracked && openNotDone(r)} disabled={!r.tracked} className="dm-quiet flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left disabled:cursor-default" style={GLASS_INSET}>
                          <span className="flex flex-wrap items-baseline justify-between gap-x-[10px] gap-y-[2px]">
                            <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
                              <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                              <span className="text-[11.5px] font-semibold" style={{ color: r.counts["awaiting-review"] > 0 ? PRIMARY : "var(--muted-foreground)" }}>{outstanding(r)}</span>
                            </span>
                            <span className="flex flex-none items-baseline gap-[8px]">
                              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.kind === "in-app" ? "auto" : r.kind === "counselor-verified" ? "you verify" : "student reports"}{r.deadlineBound ? " · deadline" : ""}</span>
                              {r.tracked && <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.donePct}% <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span></span>}
                            </span>
                          </span>
                          {r.tracked && <StatusBar r={r} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </OverviewCard>
        </>
      )}
    </div>
  );
}
