"use client";

// DistrictReports: the four district reports, each openable as a printable
// US Letter document, plus the school comparison as a CSV or a PDF.
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 3.5 (Reports).
//
// Deliberate deviations from the Replit, with the WHY:
// - "Open report" opens a US Letter document in the full-screen viewer (the
//   PrincipalReport pattern), not a modal table. A leader forwards or files
//   a report; a document prints and saves as PDF, a modal does not. Every
//   cell the modal showed is on the page: the three-stat summary strip, every
//   report row, and each column's definition (the Replit's header (i)) as a
//   note at the foot of the page.
// - The modal's "Download this PDF" is the viewer's "Print or save PDF". Its
//   "Export this CSV" is the viewer's menu entry of the same name (the
//   viewer's only extension slot is its Share menu).
// - The header "Export school comparison CSV" is a real CSV of all 11 schools
//   with every measure and its change since launch, follow-up need and
//   coverage (a superset of the report's six columns). "PDF" opens the School
//   performance comparison report and prints it.
// - Report cards are one whole target; the "Open report" label and a chevron
//   sit at the foot. No hero glow: a list of equals has no centrepiece.

import { useEffect, useRef, useState } from "react";
import { Download, FileDown } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Go } from "../../../chips";
import { GLASS_CARD } from "../../../surfaces";
import { BRAND, FullScreenDocument, PAGE_H, PAGE_W, SANS, SERIF, printDocumentPage } from "../../DocumentDesk";
import { PAPER_VARS } from "../../DocumentPreview";
import {
  DISTRICT,
  DISTRICT_REPORTS,
  DISTRICT_REPORTS_COPY,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  sortSchools,
  type DistrictReport,
} from "@/lib/leaderData";
import { EYEBROW, downloadCsv } from "./districtKit";

const COMPARISON_ID = "school-comparison";

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A CSV of every school with every measure: current, launch baseline and change. */
function schoolComparisonCsv() {
  const head = [
    "School", "City", "Status", "Students", "Counselors",
    "Career exploration %", "Career change (pts)",
    "Postsecondary exploration %", "Postsecondary change (pts)",
    "Experiential learning %", "Experiential change (pts)",
    "Professional exposure %", "Professional change (pts)",
    "Planning milestones %", "Planning change (pts)",
    "Students requiring follow-up", "Follow-up coverage %",
  ];
  const rows = sortSchools(SCHOOLS, "planning").map((s) => [
    s.name, s.city, SCHOOL_STATUS_LABELS[s.status].pill, s.enrollment, s.counselors,
    s.career.value, s.career.delta.toFixed(1),
    s.postsecondary.value, s.postsecondary.delta.toFixed(1),
    s.experiential.value, s.experiential.delta.toFixed(1),
    s.professional.value, s.professional.delta.toFixed(1),
    s.planning.value, s.planning.delta.toFixed(1),
    s.followUps, s.coverage,
  ]);
  downloadCsv("metro-heights-school-comparison-2026-27.csv", [head, ...rows]);
}

function reportCsv(r: DistrictReport) {
  downloadCsv(`metro-heights-${slug(r.title)}-2026-27.csv`, [r.modal.columns.map((c) => c.label), ...r.modal.rows]);
}

/** A shield monogram for the district, as the school reports draw one for a school. */
function DistrictCrest({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="flex-none">
      <path d="M20 2 L36 8 V19 C36 29 29 35 20 38 C11 35 4 29 4 19 V8 Z" fill={BRAND} />
      <path d="M20 5.2 L33 10.1 V19 C33 27.3 27.4 32.3 20 34.8 C12.6 32.3 7 27.3 7 19 V10.1 Z" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
      <text x="20" y="24.2" textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily={SERIF} fill="#fff" letterSpacing="0.5">{DISTRICT.sidebar.initials}</text>
    </svg>
  );
}

/** One report as a printed US Letter page: masthead, summary figures, the rows. */
function ReportPage({ report, pageRef }: { report: DistrictReport; pageRef: React.Ref<HTMLDivElement> }) {
  const m = report.modal;
  const kicker = { fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const };
  // Long tables (28 rows) get tighter rows so the report stays on one sheet.
  const tight = m.rows.length > 14;
  const cellY = tight ? 3.5 : 7;
  const notes = [
    ...m.summary.filter((s) => s.tooltip).map((s) => ({ k: s.label, v: s.tooltip as string })),
    ...m.columns.filter((c) => c.tooltip).map((c) => ({ k: c.label, v: c.tooltip as string })),
  ];
  return (
    <div ref={pageRef} data-doc-page className="flex flex-col" style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "44px 72px 36px", background: "var(--paper)", color: "var(--ink)" }}>
      <header className="flex items-center justify-between gap-[20px] border-b pb-[16px]" style={{ borderColor: "var(--rule)" }}>
        <span className="flex items-center gap-[12px]">
          <DistrictCrest />
          <span className="flex flex-col gap-[3px]">
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, lineHeight: 1.1, color: "var(--ink)" }}>{DISTRICT.name}</span>
            <span style={{ ...kicker, fontSize: 8, color: BRAND }}>{DISTRICT.metaLine}</span>
          </span>
        </span>
        <span style={{ ...kicker, fontSize: 8, color: "var(--ink-faint)", textAlign: "right" }}>Academic year 2026–27<br />Synthetic planning data</span>
      </header>

      <section className="mt-[24px] flex flex-col gap-[8px]">
        <span style={{ ...kicker, color: BRAND }}>{m.eyebrow}</span>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.015em" }}>{m.title}</h1>
        <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: "var(--ink-soft)" }}>{m.description}</p>
      </section>

      <section className="mt-[18px] grid grid-cols-3 border-y" style={{ borderColor: "var(--rule)" }}>
        {m.summary.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-[3px] py-[12px]" style={{ paddingLeft: i === 0 ? 0 : 18, borderLeft: i === 0 ? undefined : "1px solid var(--rule)" }}>
            <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>{s.value}</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: "var(--ink)" }}>{s.label}</span>
            {s.caption && <span style={{ fontFamily: SANS, fontSize: 9.5, color: "var(--ink-faint)" }}>{s.caption}</span>}
          </div>
        ))}
      </section>

      <section className="mt-[20px] flex flex-col gap-[6px]">
        <div className="flex items-baseline gap-[12px] border-b pb-[8px]" style={{ borderColor: "var(--ink)" }}>
          <span style={{ ...kicker, color: BRAND }}>01</span>
          <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{m.rowsHeading}</h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {m.columns.map((c, i) => (
                <th key={c.label} className="pt-[4px] pb-[6px] pr-[8px]" style={{ ...kicker, fontSize: 8, color: "var(--ink-faint)", textAlign: "left", paddingLeft: i === 0 ? 0 : undefined }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rows.map((row, ri) => (
              <tr key={ri} style={{ borderTop: "1px solid var(--rule)" }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="pr-[8px] align-top" style={{ paddingTop: cellY, paddingBottom: cellY, fontFamily: ci === 0 || cell.length < 24 ? SERIF : SANS, fontSize: ci === 0 || cell.length < 24 ? (tight ? 10.5 : 12) : tight ? 8.5 : 10.5, fontWeight: ci === 0 ? 600 : 400, lineHeight: 1.3, color: ci === 0 || cell.length < 24 ? "var(--ink)" : "var(--ink-soft)" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {notes.length > 0 && (
        <section className="mt-[14px] flex flex-col gap-[4px]">
          <span style={{ ...kicker, fontSize: 8, color: "var(--ink-faint)" }}>Notes</span>
          {notes.map((n) => (
            <p key={n.k} style={{ fontFamily: SANS, fontSize: 8, lineHeight: 1.45, color: "var(--ink-faint)" }}><b style={{ fontWeight: 700, color: "var(--ink-soft)" }}>{n.k}.</b> {n.v}</p>
          ))}
        </section>
      )}

      <footer className="mt-auto flex items-center justify-between gap-[24px] border-t pt-[10px] whitespace-nowrap" style={{ borderColor: "var(--rule)", fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.02em", color: "var(--ink-faint)" }}>
        <span><b style={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginRight: 6 }}>Source</b>{DISTRICT.name} synthetic planning view, 2026–27</span>
        <span>Confidential · Page 1 of 1</span>
      </footer>
    </div>
  );
}

/** The report in the full-screen document viewer. `autoPrint` is the header PDF button. */
function ReportViewer({ report, autoPrint, onClose }: { report: DistrictReport; autoPrint: boolean; onClose: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const print = () => printDocumentPage(pageRef.current, `${report.title}, ${DISTRICT.name}`);
  useEffect(() => {
    if (!autoPrint) return;
    // After the page has laid out, so the printout is the finished sheet.
    const t = window.setTimeout(() => printDocumentPage(pageRef.current, `${report.title}, ${DISTRICT.name}`), 700);
    return () => window.clearTimeout(t);
  }, [autoPrint, report.title]);
  return (
    <FullScreenDocument open title={`${report.title} · ${DISTRICT.name}`} onClose={onClose} onPrint={print} share={[{ label: report.modal.exportCsvLabel, icon: Download, onClick: () => reportCsv(report) }]}>
      <ReportPage report={report} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

const HEADER_BTN = "dm-quiet flex h-9 cursor-pointer items-center gap-[7px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-bold";

export function DistrictReports() {
  const [open, setOpen] = useState<{ id: string; print: boolean } | null>(null);
  const report = open ? DISTRICT_REPORTS.find((r) => r.id === open.id) : undefined;
  const [csvLabel, pdfLabel] = DISTRICT_REPORTS_COPY.headerExports;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{DISTRICT_REPORTS_COPY.sectionTitle}</h2>
        <div className="flex flex-wrap items-center gap-[8px]">
          <button type="button" onClick={schoolComparisonCsv} className={HEADER_BTN} style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <Download className="h-[14px] w-[14px]" aria-hidden />{csvLabel.label}
          </button>
          <button type="button" onClick={() => setOpen({ id: COMPARISON_ID, print: true })} className={HEADER_BTN} style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <FileDown className="h-[14px] w-[14px]" aria-hidden />{pdfLabel.label}
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
        {DISTRICT_REPORTS.map((r) => (
          <li key={r.id}>
            <HoverBeam strength={0.6} className="h-full">
              <button type="button" onClick={() => setOpen({ id: r.id, print: false })} aria-label={`${r.openLabel}: ${r.title}`} className="dm-quiet group flex h-full w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={GLASS_CARD}>
                <span className={EYEBROW} style={{ color: "var(--primary)" }}>{r.typeTag}</span>
                <span className="text-[16px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                <span className="text-[13px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.description}</span>
                <span className="mt-auto flex items-center justify-between gap-[10px] pt-[8px]">
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.preparedFor}</span>
                  <span className="flex items-center gap-[4px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{r.openLabel}<Go kind="open" /></span>
                </span>
              </button>
            </HoverBeam>
          </li>
        ))}
      </ul>

      {report && open && <ReportViewer key={`${open.id}-${open.print}`} report={report} autoPrint={open.print} onClose={() => setOpen(null)} />}
    </div>
  );
}
