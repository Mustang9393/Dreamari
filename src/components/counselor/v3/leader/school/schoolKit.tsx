"use client";

// Shared pieces for the five School Leader screens (2 Oct 2026). Kept in one
// file so the screens stay short and read the same way.
//
// DEMO-ONLY v3 (2 Oct 2026). Implements NOTES.md 2.0 to 2.5 and 3.6.
// 2 Oct 2026 redundancy pass: ExportButtons removed (Reports cards are one
// target; CSV is in the document viewer's Share menu).
//
// What lives here, and why:
// - useSchoolDetail: every screen reads the same school (the leader's own, or
//   the one a district leader drilled into, context.ts) through schoolDetail().
// - DrillCard: a card-sized drill target. DrillTile (Drill.tsx) wraps its
//   children in `dm-quiet`, whose hover forces a flat background over the
//   glass gradient; right for a small inset tile, wrong for a whole card, so
//   card-sized targets use this instead (a kit change is suggested in the
//   hand-off note).
// - kpiDrill / reportCsv / SchoolReportPage: the Replit's (i) tooltips and
//   report modals, rebuilt as the app's own drill panel and US Letter
//   document (CounselorImpact's PrincipalReport pattern).

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Go } from "@/components/counselor/chips";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "@/components/counselor/surfaces";
import { BLUE_5, NEUTRAL_SLICE, TREND_UP } from "@/components/counselor/palette";
import { SegmentedRing } from "@/components/connect/viz";
import { PAGE_H, PAGE_W, SANS, SERIF, BRAND } from "../../DocumentDesk";
import { PAPER_VARS } from "../../DocumentPreview";
import { RankBar } from "../../overviewShared";
import type { Drill } from "../../Drill";
import { schoolDetail, type ImpactPoint, type SchoolDetail, type SchoolKpi, type SchoolReport, type SupportStatus } from "@/lib/leaderData";
import { useLeaderSchoolId } from "../context";

/** The school being shown, with every screen's data bundle. */
export function useSchoolDetail(): SchoolDetail {
  const id = useLeaderSchoolId();
  return useMemo(() => schoolDetail(id), [id]);
}

export const ACADEMIC_YEAR_LABEL = "2026–27";

export const num = (n: number): string => n.toLocaleString("en-US");
/** One decimal at most: 59.5, 18, 20.6. */
export const dec = (n: number): string => String(Math.round(n * 10) / 10);

/** Support-status colours: green and amber and red are state, blue is the one
 *  in-between category ("Incomplete report": the Replit's purple became our blue). */
export const STATUS_COLOR: Record<SupportStatus, string> = {
  "On Track": "var(--cd-green)",
  "Needs Exploration": "var(--cd-amber)",
  "Incomplete Career + Postsecondary Report": "var(--primary)",
  "No Recent Activity": "var(--cd-red)",
};

/** Support statuses, the ones that need a counselor first (2 Oct 2026
 *  redundancy pass: Overview and the Progress chips read the same order). */
export const ATTENTION_FIRST: SupportStatus[] = ["No Recent Activity", "Incomplete Career + Postsecondary Report", "Needs Exploration", "On Track"];

export const FIELD = "flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
export const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
export const LABEL = "text-[11px] font-bold tracking-[0.04em] uppercase";

/** A gain, green, with what it is measured against in muted text. `stack`
 *  puts the caption on its own line, so a row of KPI cards carries the same
 *  two lines whatever the card width (inline, the caption wraps on some cards
 *  and not others and the big numbers stop lining up). */
export function Delta({ text, caption, stack }: { text: string; caption: string; stack?: boolean }) {
  return (
    <span className={`flex ${stack ? "flex-col items-start gap-[1px]" : "flex-wrap items-center gap-x-[5px]"} text-[12px] leading-[16px] font-extrabold tabular-nums`} style={{ color: TREND_UP }}>
      <span className="flex items-center gap-[5px]">
        <TrendingUp className="h-[12px] w-[12px] flex-none" aria-hidden />
        {text}
      </span>
      <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>{caption}</span>
    </span>
  );
}

/** A card the whole surface of which opens a drill. Same glass as
 *  OverviewCard; `hero` spends the screen's one glow. */
export function DrillCard({ title, subtitle, onOpen, hero, children }: { title: string; subtitle?: string; onOpen: () => void; hero?: boolean; children: React.ReactNode }) {
  return (
    <HoverBeam strength={hero ? 0.7 : 0.6} className="h-full">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${title}: details`}
        className="group relative flex h-full w-full cursor-pointer flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        style={hero ? GLASS_CARD_HERO : GLASS_CARD}
      >
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.26) }} />}
        <span className="relative flex flex-col gap-[2px]">
          <span className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</span>
          {subtitle && <span className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{subtitle}</span>}
        </span>
        <span className="relative flex flex-1 flex-col gap-[var(--space-4)]">{children}</span>
        <Go className="absolute top-[18px] right-[18px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </button>
    </HoverBeam>
  );
}

/** A thin gradient bar in any one colour (the status colours, or blue). Same
 *  family as RankBar, which is blue only. `reference` draws the neutral tick
 *  the District bars use (a launch baseline, a district value). */
export function ColorBar({ pct, color = "var(--primary)", height = 6, reference }: { pct: number; color?: string; height?: number; reference?: number }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <span className="relative block w-full rounded-full" style={{ height, background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }} aria-hidden>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, transparent), ${color})` }} />
      {reference !== undefined && <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${Math.max(0, Math.min(100, reference))}% - 1px)`, background: "color-mix(in srgb, var(--foreground) 55%, transparent)" }} />}
    </span>
  );
}

/** A leader KPI card's whole surface: label at the top, then the number,
 *  its change and (for an outcome share) a bar whose tick is the launch
 *  baseline, so the gap to the fill reads as the gain. Shared by the School
 *  Overview and Student Progress rows so both read the same way, and the
 *  same shape as the District Overview cards. */
export function KpiCardButton({ label, value, delta, bar, hero, onOpen, className = "" }: { label: string; value: string; delta: React.ReactNode; bar?: { value: number; baseline: number }; hero?: boolean; onOpen: () => void; className?: string }) {
  return (
    <HoverBeam strength={hero ? 0.7 : 0.6} className={`h-full ${className}`}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${label}: details`}
        className="group relative flex h-full w-full cursor-pointer flex-col gap-[var(--space-3)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        style={hero ? GLASS_CARD_HERO : GLASS_CARD}
      >
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.26) }} />}
        <span className="relative pr-[16px] text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
        {/* Number, change and bar sit at the bottom so a row of cards lines up whatever the label wraps to. */}
        <span className="relative mt-auto flex flex-col gap-[var(--space-3)]">
          <span className="text-[34px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
          {delta}
          {/* The bar's own row keeps its height on a card with no bar, so the numbers stay level. */}
          <span className="block h-[6px]">{bar && <ColorBar pct={bar.value} reference={bar.baseline} />}</span>
        </span>
        <Go className="absolute top-[16px] right-[14px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </button>
    </HoverBeam>
  );
}

/** Parts of one whole (postsecondary intentions): a donut and its key,
 *  ranked darkest blue first, "Undecided" in the neutral slice. The same
 *  shape as My Impact's "Postsecondary pathways" ring. 2 Oct 2026
 *  redundancy pass: the centre no longer prints the lead share, which the
 *  key already shows (58% was on screen twice). */
export function ShareRing({ rows }: { rows: readonly { label: string; value: number }[] }) {
  const ramp = [...BLUE_5].reverse();
  const ranked = rows.filter((r) => r.label !== "Undecided").sort((a, b) => b.value - a.value);
  const parts = [...ranked.map((r, i) => ({ ...r, color: ramp[i] ?? ramp[ramp.length - 1] })), ...rows.filter((r) => r.label === "Undecided").map((r) => ({ ...r, color: NEUTRAL_SLICE }))];
  return (
    <span className="flex flex-wrap items-center gap-x-[var(--space-5)] gap-y-[var(--space-4)]">
      <SegmentedRing segments={parts.map((p) => ({ value: p.value, color: p.color }))} size={124} stroke={14} />
      <ul className="flex min-w-[190px] flex-1 flex-col">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-[10px] border-t py-[7px] first:border-t-0 first:pt-0 last:pb-0" style={{ borderColor: "var(--glass-border)" }}>
            <span className="flex min-w-0 items-center gap-[8px]">
              <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: p.color }} />
              <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{p.label}</span>
            </span>
            <span className="flex-none text-[14px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{p.value}%</span>
          </li>
        ))}
      </ul>
    </span>
  );
}

/** A ranked horizontal bar chart: one line per row (label, bar, value) on
 *  one shared scale, for categories whose names are too long to sit under a
 *  column (institution names). 2 Oct 2026 redundancy pass: it was a stack
 *  of title-over-bar pairs; one row per item reads as one chart. Bars scale
 *  to the next ten above the largest value so the longest is not a false 100%. */
export function PctBars({ rows }: { rows: readonly { label: string; value: number }[] }) {
  const max = Math.max(10, Math.ceil(Math.max(...rows.map((r) => r.value)) / 10) * 10);
  return (
    <ul className="flex flex-col gap-[10px]">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-x-[12px] gap-y-[6px] sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_40px]">
          <span className="min-w-0 truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{r.label}</span>
          <span className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"><RankBar value={(r.value / max) * 100} height={8} /></span>
          <span className="text-right text-[14px] leading-[1] font-extrabold tabular-nums sm:col-start-3 sm:row-start-1" style={{ color: "var(--foreground)" }}>{r.value}%</span>
        </li>
      ))}
    </ul>
  );
}

/** Status pill. Same colours as the Overview bars it is reached from. */
export function StatusPill({ status }: { status: SupportStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span className="inline-flex max-w-full items-center gap-[6px] rounded-full px-[9px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: `color-mix(in srgb, ${c} 15%, transparent)`, color: "var(--foreground)" }}>
      <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: c }} />
      <span className="min-w-0">{status}</span>
    </span>
  );
}

/** The Replit's (i) on a KPI, as a drill: the full sentence, the three numbers
 *  it states, and what is counted out of what. `months` adds the since-launch
 *  series as rows (2 Oct 2026 redundancy pass: the one home for the month
 *  values the removed Impact Over Time chart labelled). */
export function kpiDrill(kpi: SchoolKpi, detail: SchoolDetail, months?: readonly ImpactPoint[]): Drill {
  const rel = kpi.deltaUnit === "%";
  const { school } = detail;
  return {
    title: kpi.label,
    subtitle: `${school.name} · ${num(school.enrollment)} students · ${ACADEMIC_YEAR_LABEL}`,
    lead: kpi.tooltip,
    stats: [
      { value: kpi.displayValue, label: "Current" },
      { value: rel ? "0%" : `${dec(kpi.baseline)}%`, label: rel ? "Prior workflow" : "Launch baseline" },
      { value: rel ? `+${kpi.delta}%` : `+${dec(kpi.delta)} pts`, label: rel ? "Relative gain, not points" : "Change since launch" },
      { value: kpi.definition.population.replace(" enrolled students", "").replace(" counselors", "").replace(" counselor", ""), label: rel ? (school.counselors === 1 ? "Counselor" : "Counselors") : "Enrolled students" },
    ],
    itemsLabel: "How it is counted",
    items: [`Counted: ${kpi.definition.numerator}`, `Out of: ${kpi.definition.denominator}`],
    ...(months ? { rowsLabel: "By month since launch", rows: months.map((p) => ({ label: p.month, value: `${dec(p.value)}%`, pct: p.value })) } : {}),
  };
}

// ---------------------------------------------------------------------------
// Report exports
// ---------------------------------------------------------------------------

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** A report's rows as CSV text (Metric, Definition, Current, Baseline, Change). */
export function reportCsv(report: SchoolReport): string {
  const head = ["Metric", "Definition", "Current", "Baseline", "Change"];
  const body = report.modal.rows.map((r) => [r.metric, r.definition, r.current, r.baseline, r.change]);
  return [head, ...body].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

/** Download a report's rows. File name: school, report, academic year. */
export function downloadReportCsv(detail: SchoolDetail, report: SchoolReport) {
  const blob = new Blob(["﻿", reportCsv(report)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(detail.school.name)}-${slug(report.title)}-${ACADEMIC_YEAR_LABEL.replace("–", "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The Dreamari mark and wordmark in ink, for the report masthead. */
function Lockup() {
  return (
    <span className="flex flex-col items-end gap-[5px] text-right">
      <span style={{ fontFamily: SANS, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Data from</span>
      <span className="flex items-center gap-[7px]">
        <span aria-hidden className="h-[13px] w-[23px] flex-none" style={{ background: "var(--ink)", maskImage: "url(/images/app/logo-mark.svg)", WebkitMaskImage: "url(/images/app/logo-mark.svg)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "right center", WebkitMaskPosition: "right center" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", color: "var(--ink)" }}>DREAMARI</span>
      </span>
    </span>
  );
}

/** One school report as a US Letter page: the Replit's report modal (title,
 *  school and period line, description, Metric / Current / Baseline / Change
 *  table with each definition) set as a printed document. */
export function SchoolReportPage({ detail, report, pageRef }: { detail: SchoolDetail; report: SchoolReport; pageRef: React.Ref<HTMLDivElement> }) {
  const { school } = detail;
  const m = report.modal;
  const kicker = { fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const };
  // The first three rows are the figures a reader takes away; the table has all of them.
  const figures = m.rows.slice(0, 3);
  return (
    <div ref={pageRef} data-doc-page className="flex flex-col" style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "44px 72px 36px", background: "var(--paper)", color: "var(--ink)" }}>
      <header className="flex items-center justify-between gap-[20px] border-b pb-[16px]" style={{ borderColor: "var(--rule)" }}>
        <span className="flex items-center gap-[12px]">
          {/* A monogram, not DocumentDesk's Crest: that one is Lincoln High School's, wrong for any other school. */}
          <span aria-hidden className="flex size-[40px] flex-none items-center justify-center rounded-[6px]" style={{ background: BRAND, color: "#fff", fontFamily: SERIF, fontSize: 15, fontWeight: 600, letterSpacing: "0.02em" }}>{detail.header.sidebar.initials}</span>
          <span className="flex flex-col gap-[3px]">
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, lineHeight: 1.1, color: "var(--ink)" }}>{school.name}</span>
            <span style={{ ...kicker, fontSize: 8, color: BRAND }}>School leadership report</span>
          </span>
        </span>
        <Lockup />
      </header>

      <section className="mt-[24px] flex flex-col gap-[8px]">
        <span className="flex items-center justify-between gap-[16px]">
          <span style={{ ...kicker, color: BRAND }}>School report</span>
          <span style={{ ...kicker, color: "var(--ink-faint)" }}>Academic Year {ACADEMIC_YEAR_LABEL}</span>
        </span>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.015em" }}>{m.title}</h1>
        <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.55, color: "var(--ink-soft)" }}>{m.description}</p>
      </section>

      <dl className="mt-[16px] grid grid-cols-3 border-y" style={{ borderColor: "var(--rule)" }}>
        {[
          ["School", `${school.name}, ${detail.header.metaLine.split(" · ")[0]}`],
          ["Enrolled students", num(school.enrollment)],
          ["Compared with", "Launch baseline"],
        ].map(([k, v], i) => (
          <div key={k} className="flex flex-col justify-center gap-[2px] py-[12px]" style={{ paddingLeft: i === 0 ? 0 : 14, borderLeft: i === 0 ? undefined : "1px solid var(--rule)" }}>
            <dt style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)" }}>{k}</dt>
            <dd style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 600, lineHeight: 1.25, color: "var(--ink)" }}>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-[18px] grid grid-cols-3 border-b" style={{ borderColor: "var(--rule)" }}>
        {figures.map((f, i) => (
          <div key={f.metric} className="flex flex-col gap-[3px] py-[12px]" style={{ paddingLeft: i === 0 ? 0 : 18, borderLeft: i === 0 ? undefined : "1px solid var(--rule)" }}>
            <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>{f.current}</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: "var(--ink)" }}>{f.metric}</span>
            {f.change !== "-" && <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: "#157A4A" }}>{f.change} vs launch</span>}
          </div>
        ))}
      </section>

      <section className="mt-[22px] flex flex-col gap-[8px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {m.columns.map((h, i) => (
                <th key={h} className="pt-[4px] pb-[8px]" style={{ ...kicker, fontSize: 8.5, color: "var(--ink-faint)", textAlign: i === 0 ? "left" : "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r.metric} style={{ borderTop: "1px solid var(--rule)" }}>
                <td className="py-[9px] pr-[16px]">
                  <span className="block" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.metric}</span>
                  <span className="block" style={{ fontFamily: SANS, fontSize: 9.5, lineHeight: 1.4, color: "var(--ink-faint)" }}>{r.definition}</span>
                </td>
                <td className="py-[9px] text-right" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.current}</td>
                <td className="py-[9px] text-right" style={{ fontFamily: SANS, fontSize: 11.5, color: "var(--ink-soft)" }}>{r.baseline}</td>
                <td className="py-[9px] text-right" style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: r.change.startsWith("+") ? "#157A4A" : "var(--ink-soft)" }}>{r.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-auto flex items-center justify-between gap-[24px] border-t pt-[10px] whitespace-nowrap" style={{ borderColor: "var(--rule)", fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.02em", color: "var(--ink-faint)" }}>
        <span><b style={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginRight: 6 }}>Source</b>Synthetic data, no live school system connected</span>
        <span>Confidential · Page 1 of 1</span>
      </footer>
    </div>
  );
}
