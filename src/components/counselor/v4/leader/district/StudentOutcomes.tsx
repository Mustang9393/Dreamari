"use client";

// StudentOutcomes: how are students doing across the district, by school and
// by grade, and what are they choosing?
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 3.3 (Student Outcomes).
//
// Deliberate deviations from the Replit, with the WHY:
// - One ranked list driven by the By school / By grade switch and a Metric
//   select. The district rollup is a neutral tick on every bar plus a
//   caption, so each school reads as ahead of or behind the district at a
//   glance. The comparison card is the screen's one glow.
// - School bars are buttons that open the school, like every other school row
//   in the District view. The Replit's bars were not clickable.
// - The six sections are reordered outcomes first: comparison, milestone
//   completion and participation totals, then the three distribution cards
//   (interests, intentions, choices), then emerging interests.
// - Distribution and milestone rows are sorted high to low (the Replit's
//   milestone order and its "Regional trade" row were not), so every list
//   ranks the same way. Milestone numerals 01-05 are the ranks.
// - The per-row (i) tooltips repeat one template ("a distribution share, not
//   a completion rate; no launch baseline"). It is said once, in a note under
//   the cards, instead of 20 times. Participation counts keep their one-line
//   description on the tile, because each one differs.
// - Cards in a row are always the same height (standing rule, 2 Oct 2026:
//   "cards should always be the same height in rows"): grid items stretch, each
//   card fills its cell, and notes / footers sit at the bottom (mt-auto). The
//   milestone / participation pair is 5 / 7 columns with the five counts in a
//   3 + 2 grid, so the shorter card's extra height is small and reads as
//   spacing, not a void (audit, 2 Oct 2026).
// - The distribution cards are two a row: interests (8 rows) with choices
//   (7), then intentions (4) with emerging interests (a short chip card).
//   Three across put a 4-row card beside an 8-row one and left a 200px void.

import { useMemo, useState } from "react";
import { Segmented } from "../../viz";
import { Listbox } from "@/components/app/Listbox";
import { GLASS_INSET } from "../../../surfaces";
import { OverviewCard } from "../../overviewShared";
import {
  DISTRICT_GRADE_STUDENTS,
  DISTRICT_STUDENT_OUTCOMES,
  DISTRICT_TOTALS,
  OUTCOME_METRICS,
  outcomeComparisonFooter,
  schoolById,
  type OutcomeMetricId,
  type ShareRow,
} from "@/lib/leaderData";
import { Bar, EYEBROW, ROWS, Note, SchoolRow, int, pts, useOpenSchool } from "./districtKit";

const FIELD = "flex h-9 w-full min-w-[200px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
const GRADES = [9, 10, 11, 12] as const;

/** A row with a name, a value and a bar. Shared by the school, grade and distribution lists. */
function BarLine({ label, note, value, display, pct, reference, rank }: { label: string; note?: string; value?: number; display?: string; pct: number; reference?: number; rank?: string }) {
  return (
    <span className="flex w-full flex-col gap-[6px]">
      <span className="flex items-baseline justify-between gap-[10px]">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
          {rank && <span className="w-[18px] flex-none text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{rank}</span>}
          <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
          {note && <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
        </span>
        <span className="flex-none text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{display ?? `${value}%`}</span>
      </span>
      <span className={rank ? "pl-[26px]" : ""}><Bar value={pct} reference={reference} /></span>
    </span>
  );
}

/** A distribution as bars. `abs`: bars are % of all students; otherwise relative to the largest share. */
function ShareCard({ title, subtitle, rows, abs = false, ranked = false }: { title: string; subtitle: string; rows: readonly ShareRow[]; abs?: boolean; ranked?: boolean }) {
  const sorted = useMemo(() => [...rows].sort((a, b) => b.value - a.value), [rows]);
  const max = sorted[0]?.value || 1;
  return (
    <OverviewCard title={title}>
      <Note>{subtitle}</Note>
      <ul className="flex flex-col gap-[14px]">
        {sorted.map((r, i) => (
          <li key={r.label}><BarLine label={r.label} value={r.value} pct={abs ? r.value : (r.value / max) * 100} rank={ranked ? String(i + 1).padStart(2, "0") : undefined} /></li>
        ))}
      </ul>
    </OverviewCard>
  );
}

export function StudentOutcomes() {
  const open = useOpenSchool();
  const O = DISTRICT_STUDENT_OUTCOMES;
  const [by, setBy] = useState<"school" | "grade">("school");
  const [metricId, setMetricId] = useState<OutcomeMetricId>("career");
  const metric = OUTCOME_METRICS.find((m) => m.id === metricId) ?? OUTCOME_METRICS[0];
  const roll = metric.rollup;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <OverviewCard
        hero
        title={O.comparison.title}
        aside={
          <span className="flex flex-col items-start gap-[2px] sm:items-end">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>District rollup</span>
            <span className="text-[30px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{roll.value}%</span>
            <span className="text-[12.5px] font-bold" style={{ color: "var(--primary)" }}>{pts(roll.delta)} vs launch baseline</span>
          </span>
        }
      >
        <div className="flex flex-wrap items-end gap-[var(--space-3)]">
          <Segmented ariaLabel="Compare by" value={by} onChange={setBy} options={O.comparison.toggles.map((t) => ({ key: t.id, label: t.label }))} />
          <div className="flex min-w-[200px] flex-col gap-[6px]">
            <span className={EYEBROW} style={{ color: "var(--muted-foreground)" }}>Metric</span>
            <Listbox ariaLabel="Metric" value={metricId} onChange={(v) => setMetricId(v as OutcomeMetricId)} options={OUTCOME_METRICS.map((m) => ({ value: m.id, label: m.label }))} className={FIELD} style={FIELD_STYLE} />
          </div>
        </div>

        {by === "school" ? (
          <div className={`-mx-[10px] ${ROWS}`}>
            {metric.bySchool.map((r) => {
              const s = schoolById(r.schoolId);
              if (!s) return null;
              return (
                <SchoolRow key={s.id} school={s} onOpen={open}>
                  <BarLine label={s.name} note={O.comparison.studentsCaption(s.enrollment)} value={r.value} pct={r.value} reference={roll.value} />
                </SchoolRow>
              );
            })}
          </div>
        ) : (
          <ul className="flex flex-col gap-[14px]">
            {GRADES.map((g, i) => (
              <li key={g}><BarLine label={`Grade ${g}`} note={O.comparison.studentsCaption(DISTRICT_GRADE_STUDENTS[g])} value={metric.byGrade[i]} pct={metric.byGrade[i]} reference={roll.value} /></li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-[4px]">
          <Note>The tick on each bar is the district rollup, {roll.value}%. Launch baseline {roll.baseline}%.</Note>
          <Note>{outcomeComparisonFooter(metric)}</Note>
        </div>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-5">
          <ShareCard title={O.milestones.title} subtitle={O.milestones.subtitle} rows={O.milestones.rows} abs ranked />
        </div>
        <div className="xl:col-span-7">
          <OverviewCard title={O.participation.title}>
            <Note>{O.participation.eyebrow.charAt(0) + O.participation.eyebrow.slice(1).toLowerCase()}, district totals for 2026–27.</Note>
            <ul className="grid grid-cols-1 gap-[8px] sm:grid-cols-6">
              {O.participation.rows.map((r) => (
                <li key={r.label} className="flex flex-col gap-[3px] rounded-[var(--radius-md)] border p-[12px] sm:col-span-3 sm:last:col-span-6 xl:col-span-2 xl:nth-[n+4]:col-span-3" style={GLASS_INSET}>
                  <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{int(r.value)}</span>
                  <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.label}</span>
                  <span className="text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.tooltip}</span>
                </li>
              ))}
            </ul>
          </OverviewCard>
        </div>
      </div>

      {/* Two cards a row, long lists together and short ones together, so each
          row's cards are close to the same height. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <ShareCard title={O.interests.title} subtitle={O.interests.subtitle} rows={O.interests.rows} />
        <ShareCard title={O.choices.title} subtitle={O.choices.subtitle} rows={O.choices.rows} />
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <ShareCard title={O.intentions.title} subtitle={O.intentions.subtitle} rows={O.intentions.rows} />
        <OverviewCard title={O.emerging.title}>
          <ul className="flex flex-wrap gap-[8px]">
            {O.emerging.chips.map((c) => (
              <li key={c} className="rounded-full border px-[12px] py-[5px] text-[12.5px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{c}</li>
            ))}
          </ul>
          <div className="mt-auto"><Note>{O.emerging.note}</Note></div>
        </OverviewCard>
      </div>
      <Note>These are shares of responses, not completion rates, out of {int(DISTRICT_TOTALS.enrollment)} students represented. No launch baseline is recorded for these categories or for the milestones, so no change is shown.</Note>
    </div>
  );
}
