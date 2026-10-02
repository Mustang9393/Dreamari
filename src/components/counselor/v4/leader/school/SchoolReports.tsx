"use client";

// What this screen answers: can I hand a populated report to my board or my
// district, and how far have the headline outcomes moved since launch.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.5 (Reports) and 3.6 (the
// reports and Impact Since Launch bars are school-specific).
//
// Deliberate deviations from the Replit, with why:
// - "Open report" opens a US Letter document in the full-screen viewer
//   (CounselorImpact's PrincipalReport pattern) rather than a modal table:
//   a report is something a leader prints or forwards, so it is shown as the
//   page that prints. The modal's Metric / Current / Baseline / Change table,
//   definitions and synthetic-data sentence are all on the page.
// - Export PDF opens the same document and prints it (print = save as PDF).
//   The Replit's exports were never exercised (NOTES.md 6.1), so there is no
//   file format to match.
// - Export CSV downloads the report's rows (Metric, Definition, Current,
//   Baseline, Change) as a real file named school, report and year.
// - Impact Since Launch marks the baseline with a tick on the bar. In the
//   Replit the baseline layer sat underneath a longer current layer and was
//   invisible, leaving the baseline readable only as a number. The card is a
//   drill (the (i) tooltip plus each metric's change in points). It is the
//   screen's hero.
// - "Updated today / yesterday" is kept, as the small caption beside each title.

import { useEffect, useRef, useState } from "react";
import { OverviewCard } from "../../overviewShared";
import { FullScreenDocument, printDocumentPage } from "../../DocumentDesk";
import { DrillPanel, type Drill } from "../../Drill";
import type { SchoolDetail, SchoolReport } from "@/lib/leaderData";
import { DrillCard, ExportButtons, SchoolReportPage, dec, downloadReportCsv, num, useSchoolDetail } from "./schoolKit";

type Open = { report: SchoolReport; print: boolean };

export function SchoolReports() {
  const detail = useSchoolDetail();
  const { reports, reportsPage, school } = detail;
  const [open, setOpen] = useState<Open | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const imp = reportsPage.impactSinceLaunch;

  const impactDrill: Drill = {
    title: imp.title,
    subtitle: `${school.name} · ${num(school.enrollment)} students · 2026–27`,
    lead: imp.tooltip,
    rowsLabel: "Launch baseline to current",
    rows: imp.rows.map((r) => ({ label: r.label, value: `${r.display} (+${dec(r.current - r.baseline)} pts)`, pct: r.current })),
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        {reports.map((r) => (
          <OverviewCard key={r.id} title={r.title} unit={r.updated}>
            <p className="text-[13.5px] leading-[19px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.description}</p>
            <div className="mt-auto flex flex-wrap items-center gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
              <button type="button" onClick={() => setOpen({ report: r, print: false })} className="dm-solid flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-[14px] text-[13px] font-bold text-[var(--primary-foreground)]">{r.openLabel.replace(" →", "").replace("Report", "report")}</button>
              <ExportButtons pdfLabel={r.exportPdfLabel} csvLabel={r.exportCsvLabel} onPdf={() => setOpen({ report: r, print: true })} onCsv={() => downloadReportCsv(detail, r)} />
            </div>
          </OverviewCard>
        ))}
      </div>

      <DrillCard hero title={imp.title} subtitle={imp.subtitle} onOpen={() => setDrill(impactDrill)}>
        <ul className="flex flex-col gap-[14px]">
          {imp.rows.map((r) => (
            <li key={r.label} className="flex flex-col gap-[7px]">
              <span className="flex items-baseline justify-between gap-[12px] text-[13px]">
                <span className="min-w-0 font-semibold" style={{ color: "var(--foreground)" }}>{r.label}</span>
                <span className="flex-none tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                  {dec(r.baseline)}% <span aria-hidden>→</span><span className="sr-only">to</span> <b className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{dec(r.current)}%</b>
                </span>
              </span>
              <span className="relative block h-[8px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }} aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${r.current}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 35%, transparent), var(--primary))" }} />
                <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${r.baseline}% - 1px)`, background: "var(--foreground)" }} />
              </span>
            </li>
          ))}
        </ul>
        <span className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-[6px]"><span aria-hidden className="h-[12px] w-[2px] rounded-[1px]" style={{ background: "var(--foreground)" }} />{imp.legend.baseline}</span>
          <span className="flex items-center gap-[6px]"><span aria-hidden className="h-[8px] w-[16px] rounded-full" style={{ background: "var(--primary)" }} />{imp.legend.current}</span>
        </span>
      </DrillCard>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      {open && <ReportDoc detail={detail} report={open.report} autoPrint={open.print} onClose={() => setOpen(null)} />}
    </div>
  );
}

/** The report at print size, in the full-screen viewer. `autoPrint` is the
 *  Export PDF path: open it and hand it to the print dialog. */
function ReportDoc({ detail, report, autoPrint, onClose }: { detail: SchoolDetail; report: SchoolReport; autoPrint: boolean; onClose: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const title = `${report.title}, ${detail.school.name}`;
  useEffect(() => {
    if (!autoPrint) return;
    // Give the portalled page a moment to mount before it is cloned for print.
    const t = window.setTimeout(() => printDocumentPage(pageRef.current, title), 450);
    return () => window.clearTimeout(t);
  }, [autoPrint, title]);
  return (
    <FullScreenDocument open title={title} onClose={onClose} onPrint={() => printDocumentPage(pageRef.current, title)}>
      <SchoolReportPage detail={detail} report={report} pageRef={pageRef} />
    </FullScreenDocument>
  );
}
