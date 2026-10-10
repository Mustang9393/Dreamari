"use client";

// Shared pieces for the five School Leader screens.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.0 to 2.5 and 3.6.
//
// v4 rebuild (6 Oct 2026). WHY: this kit held the v2 vocabulary (DrillCard,
// KpiCardButton, ColorBar, StatusPill, the extrabold ShareRing and PctBars),
// which made the leader screens a different product from the counselor's v4.
// Direct instruction: "make those changes in every aspect, design, layout,
// structure everything... EVERYTHING needs to be like this version." Those
// v2 pieces are gone; what is left is either data plumbing or the counselor's
// own v4 patterns, wrapped once so the four School screens share them:
//   - ReportBars: Student progress's report canvas rows (v4-report-bar),
//     plus the leader's launch baseline. Points of light since the 10 Oct
//     glow pass (no bars).
//   - PortionRing (Your impact's ring) was retired the same day: parts of
//     one whole are charts/ldViz PlanFlow now, a Sankey of light.
//
// Maisha's v4 review (7 Oct 2026): measures side by side share ONE colour
// (the series token: one calm blue, or a hue each in Bright), "so there
// isn't too much competing for our attention"; parts of one whole that
// must be told apart step through one hue (the step token), with
// Undecided in the neutral step, as on her Plans After Graduation.
//   - SchoolReportPage: the report as v4's editorial document (the
//     .publication-* type ImpactPublication and the Review desk use), so a
//     generated school report looks like every other v4 document.
//
// What lives here, and why:
// - useSchoolDetail: every screen reads the same school (the leader's own, or
//   the one a district leader drilled into, context.ts) through schoolDetail().
// - kpiDrill / reportCsv: the Replit's (i) tooltips and the CSV export.

import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { PAGE_H, PAGE_W } from "../../DocumentDesk";
import { PAPER_VARS } from "../../DocumentPreview";
import { usePublicationStyle } from "../../SchoolPublication";
import type { Drill } from "../../Drill";
import { schoolDetail, type SchoolDetail, type SchoolKpi, type SchoolReport } from "@/lib/leaderData";
import { useLeaderSchoolId } from "../context";
import { series } from "../kit";
import { DotTrack } from "../../charts/ldViz";
import "./school.css";

/** The school being shown, with every screen's data bundle. */
export function useSchoolDetail(): SchoolDetail {
  const id = useLeaderSchoolId();
  return useMemo(() => schoolDetail(id), [id]);
}

export const ACADEMIC_YEAR_LABEL = "2026–27";

export const num = (n: number): string => n.toLocaleString("en-US");
/** One decimal at most: 59.5, 18, 20.6. */
export const dec = (n: number): string => String(Math.round(n * 10) / 10);

/** "Northbridge Academy · 964 students · 2026–27": every drill's subtitle. */
export const schoolLine = (detail: SchoolDetail) => `${detail.school.name} · ${num(detail.school.enrollment)} students · ${ACADEMIC_YEAR_LABEL}`;

/** A round top for a count scale: four equal steps that cover the largest value. */
export function niceScale(max: number): number {
  const step = [1, 2, 5, 10, 15, 20, 25, 30, 50, 75, 100, 150, 250, 500].find((s) => s * 4 >= max) ?? Math.ceil(max / 400) * 100;
  return step * 4;
}

export type BarItem = { key: string; label: string; value: number; display: React.ReactNode; color?: string; baseline?: number; aria?: string };

/** Student progress's report rows (counselor v4, StudentProgress.tsx): a
 *  label, a wide scale, the value. Selecting one marks it (aria-pressed)
 *  the way the counselor's chart picks the students below. 10 Oct 2026
 *  glow pass ("I dont like bar graphs"; "i want them to be made of
 *  LIGHT"): the filled bars became points of light on a hairline scale,
 *  with a lit outline at `baseline` and a light trail to today. */
export function ReportBars({ items, scale = 100, selected, onSelect, unit, label, ticks }: { items: BarItem[]; scale?: number; selected?: string; onSelect: (key: string) => void; unit: string; label: string; ticks?: string[] }) {
  const marks = ticks ?? [0, 0.25, 0.5, 0.75, 1].map((n) => String(Math.round(n * scale)));
  return (
    <div className="v4-report-bars v4-school-bars" role="group" aria-label={label}>
      {items.map((b, i) => (
        <button key={b.key} type="button" className="v4-report-bar" aria-pressed={selected === b.key} onClick={() => onSelect(b.key)} aria-label={b.aria}>
          <span className="v4-report-bar-label">{b.label}</span>
          <DotTrack value={b.value} baseline={b.baseline} scale={scale} color={b.color ?? series(i)} />
          <strong>{b.display}</strong>
          <ArrowUpRight size={14} aria-hidden />
        </button>
      ))}
      <div className="v4-report-scale" aria-hidden>{marks.map((m, i) => <span key={`${m}-${i}`}>{m}</span>)}</div>
      <small className="v4-report-unit">{unit}</small>
    </div>
  );
}

/** The Replit's (i) on a KPI, as a drill: the full sentence, the three numbers
 *  it states, and what is counted out of what. */
export function kpiDrill(kpi: SchoolKpi, detail: SchoolDetail): Drill {
  const rel = kpi.deltaUnit === "%";
  const { school } = detail;
  return {
    title: kpi.label,
    subtitle: schoolLine(detail),
    lead: kpi.tooltip,
    stats: [
      { value: kpi.displayValue, label: "Current" },
      { value: rel ? "0%" : `${dec(kpi.baseline)}%`, label: rel ? "Prior workflow" : "Launch baseline" },
      { value: rel ? `+${kpi.delta}%` : `+${dec(kpi.delta)} pts`, label: rel ? "Relative gain, not points" : "Change since launch" },
      { value: kpi.definition.population.replace(" enrolled students", "").replace(" counselors", "").replace(" counselor", ""), label: rel ? (school.counselors === 1 ? "Counselor" : "Counselors") : "Enrolled students" },
    ],
    itemsLabel: "How it is counted",
    items: [`Counted: ${kpi.definition.numerator}`, `Out of: ${kpi.definition.denominator}`],
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

// ---------------------------------------------------------------------------
// The report document
// ---------------------------------------------------------------------------

const schoolInitials = (name: string) => name.split(" ").filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join("").slice(0, 3) || name.slice(0, 2).toUpperCase();

/** The letterhead of v4's documents (DocumentDesk's Letterhead), set for
 *  THIS school: DocumentDesk's reads the signed-in account's school, which
 *  is the wrong name when a district leader opens another school. */
function SchoolMasthead({ name, ink }: { name: string; ink: string }) {
  return (
    <header className="publication-masthead editorial" style={{ borderColor: ink, color: ink }}>
      <div className="publication-school">
        <svg width={34} height={34} viewBox="0 0 40 40" aria-hidden className="flex-none">
          <path d="M20 2 L36 8 V19 C36 29 29 35 20 38 C11 35 4 29 4 19 V8 Z" fill={ink} />
          <path d="M20 5.2 L33 10.1 V19 C33 27.3 27.4 32.3 20 34.8 C12.6 32.3 7 27.3 7 19 V10.1 Z" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
          <text x="20" y="24.2" textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily="'Source Serif 4', Georgia, serif" fill="#fff" letterSpacing="0.5">{schoolInitials(name)}</text>
        </svg>
        <div><strong>{name}</strong><span>School leadership report</span></div>
      </div>
    </header>
  );
}

/** "Career Exploration Report" -> "Career Exploration" + italic "report." */
function titleParts(title: string): [string, string] {
  const words = title.split(" ");
  if (words.length < 2) return ["", title];
  return [words.slice(0, -1).join(" "), words[words.length - 1].toLowerCase()];
}

/** One school report as a US Letter page in v4's editorial report type
 *  (ImpactPublication): letterhead, tracked eyebrow, Source Serif title with
 *  the italic accent, a byline over a hairline, numbered sections, key
 *  figures, the Metric / Current / Baseline / Change table with each
 *  definition, the source line and a ruled folio. Every field of the
 *  Replit's report modal is on the page. */
export function SchoolReportPage({ detail, report, pageRef }: { detail: SchoolDetail; report: SchoolReport; pageRef?: React.Ref<HTMLDivElement> }) {
  const { style } = usePublicationStyle();
  const { school } = detail;
  const m = report.modal;
  const [lead, accent] = titleParts(m.title);
  const place = detail.header.metaLine.split(" · ")[0];
  // The first three rows are the figures a reader takes away; the table has all of them.
  const figures = m.rows.slice(0, 3);
  return (
    <div ref={pageRef} className="publication-book">
      <article data-doc-page className="publication-report-page v4-school-report" style={{ ...PAPER_VARS, "--publication-ink": style.accent, width: PAGE_W, minHeight: PAGE_H } as React.CSSProperties}>
        <SchoolMasthead name={school.name} ink={style.accent} />
        <div className="publication-eyebrow">School Report<span>Academic year {ACADEMIC_YEAR_LABEL}</span></div>
        <h1 className="publication-title small">{lead && <>{lead} </>}<em>{accent}.</em></h1>
        <div className="publication-byline">
          <div><strong>{school.name}</strong><span>{place} · {num(school.enrollment)} enrolled students</span></div>
          <div><strong>Compared with the launch baseline</strong><span>{report.updated} · Generated on Dreamari</span></div>
        </div>
        <h2 className="publication-section"><span>01</span>Summary</h2>
        <p className="publication-lede">{m.description}</p>
        <div className="publication-key-figures">
          {figures.map((f) => (
            <div key={f.metric}><strong>{f.current}</strong><b>{f.metric}</b><span>{f.change !== "-" ? `${f.change} since launch` : "Current academic year"}</span></div>
          ))}
        </div>
        <h2 className="publication-section"><span>02</span>Measures</h2>
        <table className="publication-table v4-school-report-table">
          <thead><tr>{m.columns.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r.metric}>
                <td><strong>{r.metric}</strong><small>{r.definition}</small></td>
                <td><strong>{r.current}</strong></td>
                <td>{r.baseline}</td>
                <td className={r.change.startsWith("+") ? "is-gain" : ""}>{r.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="publication-source">Source: Dreamari demonstration dataset. Shares are of {num(school.enrollment)} enrolled students unless the definition says otherwise. A dash means the measure has no launch comparison; counts are not percentages.</p>
        <footer className="publication-folio"><span>{m.subline}</span><span>01 / 01</span></footer>
      </article>
    </div>
  );
}
