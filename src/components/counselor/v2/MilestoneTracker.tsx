"use client";

// DEMO-ONLY v2 Milestone Tracker (final shape, 25 Sept 2026).
//
// Goal of the screen: for one grade, which required milestone is the cohort
// behind on, and how. Students answers "which student"; this answers
// "which milestone".
//
// Data, decided for the demo (direct instruction: "do what's best for the
// demo"): the reference's grade curriculum (src/lib/milestoneReadiness.ts,
// seven to eight named milestones per grade with its own status
// proportions) SCALED to the students the signed-in role actually sees in
// that grade, so totals agree with Students and the caseload (a School
// Counselor's Grade 9 of 9 students reads 9, not the reference's fixed 30)
// while the curriculum stays rich. The roster's own three-per-grade
// milestone template was tried first and made Grade 9 look like three
// items; neither set is Dreamari's real curriculum, which is a product
// question. Caveat: proportions are the reference's, so a Review Queue
// approval moves Students and the Overview, not this screen.
//
// Shape (direct feedback: "I like the one ring and the others in bars"):
// grade tabs and four stats; one hero card for the milestone furthest
// behind (header row, then the ring with its breakdown directly beside it,
// nothing repeated); one card listing every other milestone as a row with
// a four-segment status bar. One color code for the whole screen.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Listbox } from "@/components/app/Listbox";
import { Segmented, SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GRADE_READINESS, type MilestoneCard } from "@/lib/milestoneReadiness";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { CardLink, StatRow, STATUS_COLORS } from "../chips";
import { useCounselorFilters } from "../shell";
import { GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { OverviewCard, Stat } from "./overviewShared";

type Grade = 9 | 10 | 11 | 12;
type StateKey = "done" | "inProgress" | "notStarted" | "needsAttention";
type Row = { name: string; subtitle: string; total: number; counts: Record<StateKey, number>; donePct: number; behindShare: number };

// Done is the brand blue; in progress a lighter step of the same ramp; not
// started the neutral slice (expected, not alarming); needs attention the
// reserved amber, because that is exactly what the word means everywhere
// else on the dashboard.
const STATES: { key: StateKey; label: string; color: string }[] = [
  { key: "done", label: "Done", color: PRIMARY },
  { key: "inProgress", label: "In progress", color: BLUE_3[0] },
  { key: "notStarted", label: "Not started", color: NEUTRAL_SLICE },
  { key: "needsAttention", label: "Needs attention", color: STATUS_COLORS["Needs Attention"] },
];
const COLOR = Object.fromEntries(STATES.map((s) => [s.key, s.color])) as Record<StateKey, string>;

/** The reference card's proportions applied to a cohort of `n`, rounded so
 *  the four states sum to exactly `n` (largest remainder). */
function scale(card: MilestoneCard, n: number): Row {
  const src: Record<StateKey, number> = { done: card.completed, inProgress: card.inProgress, notStarted: card.notStarted, needsAttention: card.needsAttention };
  const base = Math.max(1, card.completed + card.inProgress + card.notStarted + card.needsAttention);
  const raw = (Object.keys(src) as StateKey[]).map((k) => ({ k, exact: (src[k] / base) * n }));
  const counts = Object.fromEntries(raw.map((r) => [r.k, Math.floor(r.exact)])) as Record<StateKey, number>;
  let left = n - Object.values(counts).reduce((a, b) => a + b, 0);
  for (const r of raw.slice().sort((a, b) => (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact)))) {
    if (left <= 0) break;
    counts[r.k]++;
    left--;
  }
  return { name: card.name, subtitle: card.subtitle, total: n, counts, donePct: n ? Math.round((counts.done / n) * 100) : 0, behindShare: n ? (counts.needsAttention * 2 + counts.notStarted) / n : 0 };
}

/** "2 need attention · 3 not started": the non-zero states that need
 *  something, in the order a counselor acts on them. */
function outstanding(r: Row): string {
  const parts: string[] = [];
  if (r.counts.needsAttention) parts.push(`${r.counts.needsAttention} need${r.counts.needsAttention === 1 ? "s" : ""} attention`);
  if (r.counts.notStarted) parts.push(`${r.counts.notStarted} not started`);
  if (r.counts.inProgress) parts.push(`${r.counts.inProgress} in progress`);
  return parts.length ? parts.join(" · ") : "Everyone is done";
}

function StatusBar({ r }: { r: Row }) {
  return (
    <span className="flex h-[10px] w-full gap-[2px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} aria-hidden>
      {STATES.map((s) => {
        const n = r.counts[s.key];
        if (!n) return null;
        return <span key={s.key} title={`${s.label}: ${n}`} className="h-full flex-none first:rounded-l-full last:rounded-r-full" style={{ width: `${(n / Math.max(1, r.total)) * 100}%`, background: s.color }} />;
      })}
    </span>
  );
}

function Legend() {
  return (
    <span className="flex flex-wrap gap-x-[14px] gap-y-[4px]">
      {STATES.map((s) => (
        <span key={s.key} className="flex items-center gap-[6px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span aria-hidden className="size-[8px] rounded-full" style={{ background: s.color }} />{s.label}
        </span>
      ))}
    </span>
  );
}

export function MilestoneTracker() {
  const router = useRouter();
  const { gradeFilter, setGradeFilter } = useCounselorFilters();
  const [grade, setGrade] = useState<Grade>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  const roster = useReviewedRoster();
  // The Lead Counselor can narrow the grade to one counselor's students;
  // the curriculum proportions then scale to that cohort. Same control the
  // Lead has on Students and the Review Queue.
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const showCounselor = account.role === "Lead Counselor";
  const [counselorFilter, setCounselorFilter] = useState("All");
  const n = useMemo(() => roster.filter((s) => s.grade === grade && (!showCounselor || counselorFilter === "All" || counselorFor(s).id === counselorFilter)).length, [roster, grade, showCounselor, counselorFilter]);
  const rows = useMemo(() => GRADE_READINESS[grade].cards.map((c) => scale(c, n)).sort((a, b) => b.behindShare - a.behindShare || a.donePct - b.donePct), [grade, n]);
  const hero = rows[0];
  const rest = rows.slice(1);
  const overallDone = rows.length ? Math.round(rows.reduce((a, r) => a + r.donePct, 0) / rows.length) : 0;
  const totalAttention = rows.reduce((a, r) => a + r.counts.needsAttention, 0);

  const openStudents = () => {
    setGradeFilter(grade);
    router.push("/counselor?view=students");
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
        <div className="flex gap-[var(--space-6)]">
          <Stat value={String(n)} label="students" />
          <Stat value={String(rows.length)} label="milestones" />
          <Stat value={`${overallDone}%`} label="done" />
          <Stat value={String(totalAttention)} label="need attention" color={totalAttention > 0 ? COLOR.needsAttention : undefined} />
        </div>
      </div>

      {n === 0 || !hero ? (
        <p className="py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No Grade {grade} students{showCounselor && counselorFilter !== "All" ? " on this counselor's caseload" : ""}.</p>
      ) : (
        <>
          {/* Hero: header row (what it is, the way in), then the ring with
             its breakdown beside it. The ring says how far along; the rows
             beside it say how many are in each state; nothing is said
             twice. */}
          <HoverBeam strength={0.7} className="h-full">
            <div className="group relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
              <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
              <div className="relative flex flex-col gap-[var(--space-5)]">
                <div className="flex flex-wrap items-start justify-between gap-[8px]">
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Focus first · {hero.subtitle}</span>
                    <h2 className="text-[17px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{hero.name}</h2>
                  </span>
                  <CardLink onClick={openStudents}>Students</CardLink>
                </div>
                {/* The ring's glow reaches past its box, so the gap to the
                   legend is generous; the legend column is narrow so each
                   value sits beside its label (direct feedback, 25 Sept
                   2026: "give it some space between the graph and the
                   legend ... bring the values closer to their labels"). */}
                <div className="flex flex-col items-start gap-[var(--space-5)] sm:flex-row sm:items-center sm:gap-[56px]">
                  <SegmentedRing segments={STATES.map((s) => ({ value: hero.counts[s.key], color: s.color })).filter((s) => s.value > 0)} size={152} stroke={17}>
                    <span className="flex flex-col items-center gap-[2px]">
                      <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{hero.donePct}%</span>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span>
                    </span>
                  </SegmentedRing>
                  <div className="flex w-full max-w-[230px] flex-col gap-[6px]">
                    {STATES.map((s) => <StatRow key={s.key} label={s.label} value={hero.counts[s.key]} color={s.color} />)}
                  </div>
                </div>
              </div>
            </div>
          </HoverBeam>

          {rest.length > 0 && (
            <OverviewCard title="All milestones" unit="biggest opportunity first" aside={<CardLink onClick={openStudents}>Students</CardLink>}>
              <Legend />
              <ul className="flex flex-col gap-[8px]">
                {rest.map((r) => (
                  <li key={r.name}>
                    <button type="button" onClick={openStudents} className="dm-quiet flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left" style={GLASS_INSET}>
                      <span className="flex flex-wrap items-baseline justify-between gap-x-[10px] gap-y-[2px]">
                        <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
                          <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.name}</span>
                          <span className="text-[11.5px] font-semibold" style={{ color: r.counts.needsAttention > 0 ? COLOR.needsAttention : "var(--muted-foreground)" }}>{outstanding(r)}</span>
                        </span>
                        <span className="flex-none text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{r.donePct}% <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span></span>
                      </span>
                      <StatusBar r={r} />
                    </button>
                  </li>
                ))}
              </ul>
            </OverviewCard>
          )}
        </>
      )}
    </div>
  );
}
