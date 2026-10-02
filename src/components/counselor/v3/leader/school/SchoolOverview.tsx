"use client";

// What this screen answers: how are this school's students doing on career
// and postsecondary exploration, how much has that moved since Dreamari
// launched, and how many students still need support.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.1 (Overview) and 3.6 (the
// same screen for any of the 11 schools, through schoolDetail()).
//
// Deliberate deviations from the Replit, with why:
// - Hero: Career Exploration. It is the first KPI, the default Impact tab and
//   the lead card of the Data definitions, so it is the headline; the one
//   glow on this screen is spent on it.
// - KPI cards open a drill (the Replit's (i) tooltip, which a keyboard or
//   touch reader could not get at comfortably): the full definition plus
//   current, baseline and change. The decorative sparkline is dropped (the
//   notes confirm it is one static path, not data) and so are the icon chips;
//   in its place each outcome card carries a real bar whose tick is the launch
//   baseline (the District cards' shape), so the gain reads at a glance.
// - On a phone the five metric tabs become one dropdown: five tabs overflow a
//   375px card and the hidden ones read as missing.
// - Impact Over Time: ONE tab row (the metric). The period select became a
//   Listbox in the card header (no native select, and no second tab row
//   stacked under the first: direct feedback, 2 Oct 2026). The chart's (i)
//   became a "Details" drill that also lists every month's value, because
//   AreaChart labels only the peak and the Replit's hover tooltip shows each one.
// - Impact Over Time shows no 0 to 100 axis ticks; the value of the latest
//   month is printed as the headline above the chart instead.
// - Support Status rows keep their click-through to Student Progress with
//   that status pre-filtering the sample. The "View student progress" link
//   is the drill's action rather than a second link on the card.
// - Counseling Coverage: Planning Milestone Completion (with its launch tick)
//   and Follow-up coverage carry a bar, so the card holds two real graphs and
//   fills the row beside Support Status instead of leaving a void. Those two
//   open drills (the Replit's (i) text); the Replit's "View team" link is the
//   card's CardLink.
// - Planning Milestone Completion is not a KPI card (as in the Replit); it
//   appears here, in Counseling Coverage.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Segmented } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { CardLink, Go } from "@/components/counselor/chips";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { OverviewCard, SeeLink, Stat } from "../../overviewShared";
import { DrillPanel, DrillTile, type Drill } from "../../Drill";
import { metricBaseline, type ImpactMetricId, type ImpactPeriodId, type SupportStatus } from "@/lib/leaderData";
import { ColorBar, Delta, KpiCardButton, STATUS_COLOR, dec, kpiDrill, num, useSchoolDetail } from "./schoolKit";

const KPI_FOR_METRIC: Record<ImpactMetricId, string> = {
  career: "career",
  postsecondary: "postsecondary",
  simulations: "experiential",
  professional: "professional",
  efficiency: "efficiency",
};

export function SchoolOverview() {
  const router = useRouter();
  const detail = useSchoolDetail();
  const { overview, school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const [metric, setMetric] = useState<ImpactMetricId>(overview.impact.defaultMetric);
  const [period, setPeriod] = useState<ImpactPeriodId>(overview.impact.defaultPeriod);

  const tab = overview.impact.tabs.find((t) => t.id === metric)!;
  const points = overview.impact.series[metric][period];
  const kpi = overview.kpis.find((k) => k.id === KPI_FOR_METRIC[metric])!;
  const rel = kpi.deltaUnit === "%";
  const values = points.map((p) => p.value);
  const peak = Math.max(...values, 1);

  const openStatus = (status: SupportStatus) => router.push(`/counselor?view=leader-progress&status=${encodeURIComponent(status)}`);
  const sub = `${school.name} · ${num(school.enrollment)} students · 2026–27`;

  const impactDrill: Drill = {
    title: tab.label,
    subtitle: sub,
    lead: tab.tooltip,
    stats: [
      { value: kpi.displayValue, label: "Current" },
      { value: rel ? "0%" : `${dec(kpi.baseline)}%`, label: rel ? "Prior workflow" : "Launch baseline" },
    ],
    rowsLabel: `By month, ${overview.impact.periods.find((p) => p.id === period)!.label}`,
    // Counselor Efficiency bars scale to their own peak; the outcome shares scale to 100.
    rows: points.map((p) => ({ label: p.month, value: `${dec(p.value)}${rel ? "% vs prior workflow" : "%"}`, pct: rel ? (p.value / peak) * 100 : p.value })),
  };

  const supportDrill: Drill = {
    title: overview.support.title,
    subtitle: sub,
    lead: overview.support.tooltip,
    stats: [{ value: num(overview.support.total), label: overview.support.totalCaption }],
    rowsLabel: "Share of enrolled students",
    rows: overview.support.rows.map((r) => ({ label: r.status, value: `${num(r.count)} · ${dec(r.widthPct)}%`, pct: r.widthPct })),
    action: { label: overview.support.linkLabel.replace(" →", ""), onClick: () => router.push("/counselor?view=leader-progress") },
  };

  const coverageDrill = (id: "planning" | "follow-up"): Drill => {
    if (id === "planning") {
      const s = overview.coverage.stats.find((x) => x.id === "planning")!;
      return { title: s.label, subtitle: sub, lead: s.tooltip, stats: [{ value: s.value, label: "Current" }, { value: `${dec(metricBaseline(school.planning))}%`, label: "Launch baseline" }] };
    }
    const f = overview.coverage.followUpCoverage;
    return {
      title: f.label,
      subtitle: sub,
      lead: f.tooltip,
      stats: [
        { value: `${f.value}%`, label: "Current" },
        { value: String(school.followUps), label: "Students requiring follow-up" },
      ],
    };
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* The five KPIs. One hero (Career Exploration), one glow. */}
      <div className="grid grid-cols-2 gap-[var(--space-4)] md:grid-cols-3 xl:grid-cols-5">
        {overview.kpis.map((k, i) => {
          const isRel = k.deltaUnit === "%";
          return (
            <KpiCardButton
              key={k.id}
              hero={i === 0}
              label={k.label}
              value={k.displayValue}
              onOpen={() => setDrill(kpiDrill(k, detail))}
              className={i === 4 ? "col-span-2 md:col-span-1" : ""}
              // Counselor efficiency is a relative gain with no 0 to 100 scale, so no bar.
              delta={isRel ? <Delta stack text="relative" caption="vs prior workflow" /> : <Delta stack text={`+${dec(k.delta)} pts`} caption="vs launch" />}
              bar={isRel ? undefined : { value: k.value, baseline: k.baseline }}
            />
          );
        })}
      </div>

      {/* Impact Over Time. */}
      {/* One tab row only (metric). The period is a compact dropdown in the
         card header, not a second tab row stacked under the first (direct
         feedback, 2 Oct 2026: "Do not repeat tab components like this. It
         messes with hierarchy"). */}
      <OverviewCard
        title={overview.impact.title}
        unit={tab.label}
        aside={
          <span className="flex items-center gap-[8px]">
            <Listbox ariaLabel={overview.impact.periodLabel} value={period} onChange={(v) => setPeriod(v as ImpactPeriodId)} options={overview.impact.periods.map((p) => ({ value: p.id, label: p.label }))} className="h-8 rounded-full border px-[12px] text-[12.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "transparent" }} />
            <CardLink onClick={() => setDrill(impactDrill)}>Details</CardLink>
          </span>
        }
      >
        {/* Five tabs do not fit a phone; there the metric is a dropdown (still one control, no second tab row). */}
        <div className="hidden sm:block">
          <Segmented ariaLabel="Impact metric" value={metric} onChange={setMetric} options={overview.impact.tabs.map((t) => ({ key: t.id, label: t.label }))} />
        </div>
        <Listbox ariaLabel="Impact metric" value={metric} onChange={(v) => setMetric(v as ImpactMetricId)} options={overview.impact.tabs.map((t) => ({ value: t.id, label: t.label }))} className="flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold sm:hidden" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
        <div className="flex flex-wrap items-baseline gap-x-[12px] gap-y-[4px]">
          <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{kpi.displayValue}</span>
          {rel ? <Delta text="relative" caption="gain vs prior workflow, not points" /> : <Delta text={`+${dec(kpi.delta)} pts`} caption="vs launch" />}
        </div>
        <div key={`${metric}-${period}`} className="relative">
          {/* AreaChart's own three-label caption is hidden; every month is
             labelled under its own point instead, as in the Replit. */}
          <div className="[&_figcaption]:hidden" aria-hidden>
            <AreaChart points={values} accent="var(--primary)" height={150} labels={["", "", ""]} />
          </div>
          <MonthAxis months={points.map((p) => p.month)} />
        </div>
        <p className="sr-only">{tab.label}: {points.map((p) => `${p.month} ${dec(p.value)}%`).join(", ")}</p>
      </OverviewCard>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        {/* Support Status. */}
        <OverviewCard title={overview.support.title} aside={<CardLink onClick={() => setDrill(supportDrill)}>Details</CardLink>}>
          <Stat value={num(overview.support.total)} label={overview.support.totalCaption} />
          <ul className="flex flex-col gap-[4px]">
            {overview.support.rows.map((r) => (
              <li key={r.status}>
                <button type="button" onClick={() => openStatus(r.status)} className="dm-quiet group -mx-[6px] flex w-[calc(100%+12px)] cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[6px] text-left">
                  <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                    <span className="flex items-baseline justify-between gap-[10px]">
                      <span className="flex min-w-0 items-center gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
                        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: STATUS_COLOR[r.status] }} />
                        <span className="min-w-0">{r.status}</span>
                      </span>
                      <span className="flex-none text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{num(r.count)}</span>
                    </span>
                    {/* Width is the status's share of every enrolled student, as in the Replit. */}
                    <ColorBar pct={r.widthPct} color={STATUS_COLOR[r.status]} />
                  </span>
                  <Go />
                </button>
              </li>
            ))}
          </ul>
        </OverviewCard>

        {/* Counseling Coverage. */}
        <OverviewCard title={overview.coverage.title} aside={<SeeLink onClick={() => router.push("/counselor?view=team")}>Team</SeeLink>}>
          {/* The two shares carry a bar (planning with its launch tick), the counts do not; the grid fills the card so it matches Support Status's height. */}
          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-[8px]">
            {overview.coverage.stats.map((s) => {
              const body = (
                <>
                  <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{s.value}</span>
                  <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                  {s.id === "planning" && <span className="mt-[6px] block w-full"><ColorBar pct={school.planning.value} reference={metricBaseline(school.planning)} /></span>}
                </>
              );
              return s.id === "planning" ? (
                <DrillTile key={s.id} onOpen={() => setDrill(coverageDrill("planning"))} label={s.label} className="justify-center gap-[2px] rounded-[var(--radius-md)] border p-[12px]">{body}</DrillTile>
              ) : (
                <span key={s.id} className="flex flex-col justify-center gap-[2px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>{body}</span>
              );
            })}
            <DrillTile onOpen={() => setDrill(coverageDrill("follow-up"))} label={overview.coverage.followUpCoverage.label} className="justify-center gap-[2px] rounded-[var(--radius-md)] border p-[12px]">
              <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{overview.coverage.followUpCoverage.value}%</span>
              <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{overview.coverage.followUpCoverage.label}</span>
              <span className="mt-[6px] block w-full"><ColorBar pct={overview.coverage.followUpCoverage.value} /></span>
            </DrillTile>
          </div>
        </OverviewCard>
      </div>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}

/** Month labels, each centred under its point (AreaChart draws points at
 *  8/600 in from the edge and spreads the rest evenly). */
function MonthAxis({ months }: { months: string[] }) {
  const n = months.length;
  return (
    <div className="relative mt-[6px] h-[16px]" aria-hidden>
      {months.map((m, i) => {
        const left = ((8 + (i / Math.max(1, n - 1)) * 584) / 600) * 100;
        return (
          <span key={`${m}-${i}`} className="absolute top-0 -translate-x-1/2 text-[11px] leading-[16px] font-semibold whitespace-nowrap" style={{ left: `${left}%`, color: "var(--muted-foreground)" }}>{m}</span>
        );
      })}
    </div>
  );
}
