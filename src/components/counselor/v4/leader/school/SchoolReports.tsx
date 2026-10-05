"use client";

// What this screen answers: can I hand a populated report to my board or my
// district, and how far have the headline outcomes moved since launch.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.5 (Reports) and 3.6 (the
// reports and Impact Since Launch bars are school-specific). The v2
// decisions still hold: Open report shows the US Letter page in the
// full-screen viewer (a report is something a leader prints or forwards),
// Export PDF opens the same page and prints it (print = save as PDF), Export
// CSV downloads the rows as a real file named school, report and year, and
// Impact Since Launch marks the baseline as a tick (the Replit hid it).
//
// v4 rebuild (6 Oct 2026). WHY: this was v2 (four OverviewCards with a solid
// blue button and two outline buttons each, a DrillCard hero of bars, and a
// report page in v2's own masthead and green figures). Direct instruction:
// make the leader roles "like this version" in every aspect, and the
// generated report should look like v4's report documents. Now:
//   - The four reports are a shelf of the real documents: each card shows
//     the report's own first page as a scaled thumbnail (the Review desk's
//     DocumentThumbnail), then the title, the "Updated today" line, the
//     description, and Open report · Export PDF · Export CSV as quiet
//     actions. The thumbnail opens the report too.
//   - The report page itself (SchoolReportPage in schoolKit.tsx) is v4's
//     editorial publication: the school's letterhead, a tracked eyebrow, a
//     Source Serif title with the italic accent, a byline, numbered ruled
//     sections, key figures in the publication ink, the ruled table, the
//     source line and folio, exactly the type ImpactPublication and the
//     Review desk documents use. Every field of the Replit's report modal is
//     still on the page.
//   - Impact Since Launch is a glass sheet of Today's lanes, the dark tick at
//     the launch baseline, the current share and "from x%" at the right.

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { FullScreenDocument, printDocumentPage } from "../../DocumentDesk";
import { DocumentThumbnail } from "../../DocumentPreview";
import { DrillPanel, type Drill } from "../../Drill";
import type { SchoolDetail, SchoolReport } from "@/lib/leaderData";
import { SchoolReportPage, dec, downloadReportCsv, num, schoolLine, useSchoolDetail } from "./schoolKit";
import { Lane, LaneAxis, TextAction } from "../kit";

type Open = { report: SchoolReport; print: boolean };

export function SchoolReports() {
  const detail = useSchoolDetail();
  const { reports, reportsPage, school } = detail;
  const [open, setOpen] = useState<Open | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const imp = reportsPage.impactSinceLaunch;

  const impactDrill: Drill = {
    title: imp.title,
    subtitle: schoolLine(detail),
    lead: imp.tooltip,
    rowsLabel: "Launch baseline to current",
    rows: imp.rows.map((r) => ({ label: r.label, value: `${r.display} (+${dec(r.current - r.baseline)} pts)`, pct: r.current })),
  };

  return (
    <div className="v4-leader-page">
      <div className="v4-school-shelf">
        {reports.map((r) => (
          <article key={r.id} className="v4-school-doc">
            <button type="button" className="v4-school-doc-open" onClick={() => setOpen({ report: r, print: false })} aria-label={`Open ${r.title}`}>
              <DocumentThumbnail><SchoolReportPage detail={detail} report={r} /></DocumentThumbnail>
            </button>
            <div className="v4-school-doc-body">
              <span className="v4-overline">{r.updated}</span>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </div>
            <div className="v4-school-doc-foot">
              <TextAction onClick={() => setOpen({ report: r, print: false })}>{r.openLabel.replace(" →", "").replace("Report", "report")}</TextAction>
              <span>
                <button type="button" className="v4-school-doc-tool" onClick={() => setOpen({ report: r, print: true })}><Download size={14} aria-hidden />{r.exportPdfLabel}</button>
                <button type="button" className="v4-school-doc-tool" onClick={() => downloadReportCsv(detail, r)}><Download size={14} aria-hidden />{r.exportCsvLabel}</button>
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="v4-progress-landscape v4-school-impact !mt-0">
        <header className="v4-section-head">
          <div><h2>{imp.title === "Impact Since Launch" ? "Impact since launch" : imp.title}</h2></div>
          <TextAction onClick={() => setDrill(impactDrill)}>Details</TextAction>
        </header>
        <div className="v4-leader-lanes mt-[22px]">
          {imp.rows.map((r) => (
            <Lane
              key={r.label}
              label={r.label}
              value={r.current}
              baseline={r.baseline}
              display={`${dec(r.current)}%`}
              sub={`from ${dec(r.baseline)}%`}
              onClick={() => setDrill(impactDrill)}
              aria={`${r.label}: ${dec(r.baseline)}% at launch, ${dec(r.current)}% now. Open details`}
            />
          ))}
          <LaneAxis />
        </div>
        <div className="v4-sheet-foot mt-[14px] !pb-0">
          <span>{imp.subtitle}</span>
          <span className="v4-school-key !mt-0"><span><i />{imp.legend.baseline}</span><span><i className="is-fill" />{imp.legend.current}</span></span>
        </div>
      </section>

      <p className="v4-data-note">{school.name} · {num(school.enrollment)} students · demo data. Reports use the same figures as every School screen; the launch baseline is the school&apos;s first term on Dreamari.</p>
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
