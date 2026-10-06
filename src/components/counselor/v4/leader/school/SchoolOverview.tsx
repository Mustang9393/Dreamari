"use client";

// What this screen answers: how are this school's students doing on career
// and postsecondary exploration, how much has that moved since Dreamari
// launched, and how many students still need support.
//
// v4 rebuild (6 Oct 2026). WHY: this was the v2 screen inside v4's frame:
// five boxed KPI cards with extrabold numbers, a card with a tab row, a grid
// of six stat tiles. Direct instruction: make the leader roles "like this
// version" in every aspect. It is now the counselor's Today, read for a
// school instead of a caseload:
//   - Welcome line with the key counts as links, and one primary action
//     (Today's v4-welcome). The Replit's subtitle is the sentence's job.
//   - The five measures as Today's hairline signal strip, not five cards.
//     Each still opens its definition drill.
//   - Impact over time as Today's landscape sheet: the headline number and
//     its launch baseline on the left, the line on the right. One tab row
//     (the metric) and the period as a dropdown in the header, never a
//     second tab row (feedback, 2 Oct 2026).
//   - Support status and Counseling coverage as Today's sheet + island pair.
//     Every count, the four statuses, the six coverage figures and every
//     drill from the v2 screen are kept (Maisha's rule: never drop a data
//     point the Replit shows).
//
// Maisha's v4 review (7 Oct 2026): "for the School Leader + District Leader
// views, we can follow this direction aesthetically so I can share during
// demos", the direction being "make the experience more exciting to
// receive... without losing the clean, professional, easy-to-process
// experience". The reference structure above is unchanged; added, one
// moment per region:
//   - Count-up on the signal strip and the two hero numbers.
//   - Support Status lanes in the status colours she asked for (On Track
//     green, Needs Exploration amber, Incomplete report blue for "in
//     progress", No Recent Activity red) with the student app's SparkBar.
//   (A "Wins This Term" section was added here and removed the same day:
//   Chandu, 7 Oct 2026, "Remove ... anything like that you added to a screen
//   as a section or CONTENT/DATA wise that Maisha didn't ask for.")
//   - Headers in Title Case ("Impact Over Time", "Support Status").

import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileCheck2, Users } from "lucide-react";
import { Listbox } from "../../Listbox";
import { SubTabs } from "../../SubTabs";
import { DrillPanel, type Drill } from "../../Drill";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { metricBaseline, type ImpactMetricId, type ImpactPeriodId, type SupportStatus } from "@/lib/leaderData";
import { dec, kpiDrill, num, useSchoolDetail } from "./schoolKit";
import { CountUp, InlineLink, Lane, LaneAxis, LeaderWelcome, SignalStrip, SUPPORT_TONE, TextAction, TrendLine, titleCase, titled } from "../kit";

const KPI_FOR_METRIC: Record<ImpactMetricId, string> = {
  career: "career",
  postsecondary: "postsecondary",
  simulations: "experiential",
  professional: "professional",
  efficiency: "efficiency",
};


const subscribeDate = (notify: () => void) => { const t = window.setInterval(notify, 60000); return () => window.clearInterval(t); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

export function SchoolOverview() {
  const router = useRouter();
  const detail = useSchoolDetail();
  const { overview, school } = detail;
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const date = useSyncExternalStore(subscribeDate, dateSnapshot, () => "Today");
  const [drill, setDrill] = useState<Drill | null>(null);
  const [metric, setMetric] = useState<ImpactMetricId>(overview.impact.defaultMetric);
  const [period, setPeriod] = useState<ImpactPeriodId>(overview.impact.defaultPeriod);
  const chartRef = useRef<HTMLElement>(null);

  const tab = overview.impact.tabs.find((t) => t.id === metric)!;
  const points = overview.impact.series[metric][period];
  const kpi = overview.kpis.find((k) => k.id === KPI_FOR_METRIC[metric])!;
  const rel = kpi.deltaUnit === "%";
  const values = points.map((p) => p.value);
  const peak = Math.max(...values, 1);
  const go = (view: string) => router.push(`/counselor?view=${view}&v=4`);
  const openStatus = (status: SupportStatus) => router.push(`/counselor?view=leader-progress&v=4&status=${encodeURIComponent(status)}`);
  const sub = `${school.name} · ${num(school.enrollment)} students · 2026–27`;
  const career = overview.kpis[0];
  const onTrack = overview.support.rows.find((r) => r.status === "On Track")?.count ?? 0;
  const needSupport = overview.support.total - onTrack;
  const stat = (id: string) => overview.coverage.stats.find((s) => s.id === id)!;
  const first = account.name ? account.name.split(" ")[0] : "";

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
    action: { label: overview.support.linkLabel.replace(" →", ""), onClick: () => go("leader-progress") },
  };

  const coverageDrill = (id: "planning" | "follow-up"): Drill => {
    if (id === "planning") {
      const s = stat("planning");
      return { title: s.label, subtitle: sub, lead: s.tooltip, stats: [{ value: s.value, label: "Current" }, { value: `${dec(metricBaseline(school.planning))}%`, label: "Launch baseline" }] };
    }
    const f = overview.coverage.followUpCoverage;
    return { title: f.label, subtitle: sub, lead: f.tooltip, stats: [{ value: `${f.value}%`, label: "Current" }, { value: String(school.followUps), label: "Students requiring follow-up" }] };
  };

  return (
    <div className="v4-daily v4-leader-page">
      <LeaderWelcome
        overline={date || "Today"}
        title={`Welcome back${first ? `, ${first}` : ""}`}
        sentence={<>
          <InlineLink onClick={() => setDrill(kpiDrill(career, detail))}>{career.displayValue} of students</InlineLink> at {school.name} are exploring careers, up {dec(career.delta)} points since launch.{" "}
          <InlineLink onClick={() => go("leader-progress")}>{num(needSupport)} students</InlineLink> still need support.
        </>}
        action={{ label: "Open student progress", onClick: () => go("leader-progress") }}
      />

      <SignalStrip
        label="School outcomes since launch"
        items={overview.kpis.map((k) => ({
          label: k.label,
          value: k.displayValue,
          small: k.deltaUnit === "%" ? "relative to the prior workflow" : `+${dec(k.delta)} pts since launch`,
          onClick: () => setDrill(kpiDrill(k, detail)),
          aria: `${k.label}: ${k.displayValue}. Open the definition`,
        }))}
      />

      <section className="v4-progress-landscape scroll-mt-[90px]" ref={chartRef}>
        <header className="v4-section-head">
          <div><h2>Impact Over Time</h2></div>
          <span className="flex items-center gap-[10px]">
            <Listbox ariaLabel={overview.impact.periodLabel} value={period} onChange={(v) => setPeriod(v as ImpactPeriodId)} options={overview.impact.periods.map((p) => ({ value: p.id, label: p.label }))} />
            <TextAction onClick={() => setDrill(impactDrill)}>By month</TextAction>
          </span>
        </header>
        <div className="mt-[18px] hidden sm:block"><SubTabs ariaLabel="Impact metric" value={metric} onChange={setMetric} options={overview.impact.tabs.map((t) => ({ key: t.id, label: t.label }))} /></div>
        <div className="mt-[14px] sm:hidden"><Listbox ariaLabel="Impact metric" value={metric} onChange={(v) => setMetric(v as ImpactMetricId)} options={overview.impact.tabs.map((t) => ({ value: t.id, label: t.label }))} className="w-full" /></div>
        <div className="v4-landscape-grid">
          <div className="v4-caseload-map">
            <div className="v4-map-label"><strong><CountUp value={rel ? `+${dec(kpi.value)}` : dec(kpi.value)} /><span>%</span></strong><p>{tab.label.toLowerCase()}<br />{rel ? "relative to the prior workflow" : `up ${dec(kpi.delta)} pts since launch`}</p></div>
            {!rel && (
              <div className="mt-[22px] flex flex-col">
                <Lane label="At launch" value={kpi.baseline} display={`${dec(kpi.baseline)}%`} color="var(--v4-chart-6)" />
                <Lane label="Today" value={kpi.value} display={`${dec(kpi.value)}%`} baseline={kpi.baseline} />
              </div>
            )}
            <small>{rel ? "A relative gain, not percentage points" : "The tick marks the launch baseline"}</small>
          </div>
          <div key={`${metric}-${period}`}>
            <TrendLine
              label={tab.label}
              points={points.map((p) => ({ label: p.month, value: p.value }))}
              format={(v) => rel ? `+${dec(v)}%` : `${dec(v)}%`}
              baseline={rel ? undefined : { value: kpi.baseline, label: `Launch baseline ${dec(kpi.baseline)}%` }}
            />
          </div>
        </div>
      </section>

      <div className="v4-daily-grid">
        <section className="v4-focus-sheet">
          <header className="v4-section-head"><div><h2>{titleCase(overview.support.title)}</h2></div><span className="v4-pill">{num(overview.support.total)} {overview.support.totalCaption}</span></header>
          <div className="v4-leader-lanes mt-[22px]">
            {overview.support.rows.map((r) => (
              <Lane
                key={r.status}
                label={r.status === "Incomplete Career + Postsecondary Report" ? "Incomplete report" : r.status}
                value={r.widthPct}
                display={num(r.count)}
                sub={`${dec(r.widthPct)}%`}
                color={SUPPORT_TONE[r.status]}
                spark
                onClick={() => openStatus(r.status)}
                aria={`${r.status}: ${num(r.count)} students, ${dec(r.widthPct)} percent. Open these students`}
              />
            ))}
            <LaneAxis />
          </div>
          <div className="v4-sheet-foot"><span>Share of every enrolled student · select a status to see its students</span><TextAction onClick={() => setDrill(supportDrill)}>Details</TextAction></div>
        </section>

        <section className="v4-review-island">
          <header className="v4-section-head"><span className="v4-overline">Counseling Coverage</span><Users size={22} aria-hidden /></header>
          <div className="v4-review-number"><strong><CountUp value={stat("caseload").value} /></strong><span>students per counselor<br />{stat("counselors").value} counselors · {stat("students").value} students</span></div>
          <div className="v4-review-stack">
            <button type="button" onClick={() => setDrill(coverageDrill("planning"))}><span className="v4-mini-document" style={{ color: "var(--v4-chart-1)" }}><FileCheck2 size={17} aria-hidden /></span><span>{stat("planning").label}</span><b>{stat("planning").value}</b></button>
            <button type="button" onClick={() => setDrill(coverageDrill("follow-up"))}><span className="v4-mini-document" style={{ color: "var(--v4-chart-2)" }}><FileCheck2 size={17} aria-hidden /></span><span>{overview.coverage.followUpCoverage.label}</span><b>{overview.coverage.followUpCoverage.value}%</b></button>
            <button type="button" onClick={() => go("team")}><span className="v4-mini-document" style={{ color: "var(--v4-chart-3)" }}><FileCheck2 size={17} aria-hidden /></span><span>{stat("follow-ups").label}</span><b>{stat("follow-ups").value}</b></button>
          </div>
          <button type="button" className="v4-island-action" onClick={() => go("team")}>Open the counseling team <ArrowRight size={18} aria-hidden /></button>
        </section>
      </div>

      <p className="v4-data-note">{school.name} · {num(school.enrollment)} students · 2026–27 · demo data. Percentages are this school&apos;s students; the launch baseline is the school&apos;s first term on Dreamari.</p>
      <DrillPanel drill={titled(drill)} onClose={() => setDrill(null)} />
    </div>
  );
}
