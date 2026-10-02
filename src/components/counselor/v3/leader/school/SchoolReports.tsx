"use client";

// What this screen answers: can I hand a populated report to my board or my
// district.
//
// DEMO-ONLY v3 (2 Oct 2026). Implements NOTES.md 2.5 (Reports) and 3.6 (the
// reports are school-specific).
//
// Deliberate deviations from the Replit, with why:
// - A report opens as a US Letter document in the full-screen viewer
//   (CounselorImpact's PrincipalReport pattern) rather than a modal table:
//   a report is something a leader prints or forwards. The modal's Metric /
//   Current / Baseline / Change table, definitions and synthetic-data
//   sentence are all on the page.
// - "Updated today / yesterday" is kept, as the small caption beside each title.
//
// 2 Oct 2026 redundancy pass, with why:
// - Removed Impact Since Launch. Every row (current, launch baseline, change
//   for the five outcomes) is on the Overview KPI cards and inside these
//   report documents, and the Data definitions panel holds each one too.
//   Its baseline/current legend went with it.
// - Removed the card's Export PDF button: it opened the same document as
//   Open report and printed it, which the viewer's "Print or save PDF" does.
// - Export CSV moved into the viewer's Share menu (DistrictReports does the
//   same), so each card is ONE whole-surface button with one action.
// - No hero glow: a list of equal reports has no centrepiece.

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Go } from "@/components/counselor/chips";
import { GLASS_CARD } from "@/components/counselor/surfaces";
import { FullScreenDocument, printDocumentPage } from "../../DocumentDesk";
import type { SchoolDetail, SchoolReport } from "@/lib/leaderData";
import { SchoolReportPage, downloadReportCsv, useSchoolDetail } from "./schoolKit";

export function SchoolReports() {
  const detail = useSchoolDetail();
  const { reports } = detail;
  const [open, setOpen] = useState<SchoolReport | null>(null);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <ul className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        {reports.map((r) => {
          const openLabel = r.openLabel.replace(" →", "").replace("Report", "report");
          return (
            <li key={r.id}>
              <HoverBeam strength={0.6} className="h-full">
                <button type="button" onClick={() => setOpen(r)} aria-label={`${openLabel}: ${r.title}`} className="dm-quiet group flex h-full w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={GLASS_CARD}>
                  <span className="flex flex-wrap items-baseline gap-x-[8px] gap-y-[2px]">
                    <span className="text-[16px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{r.title}</span>
                    <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.updated}</span>
                  </span>
                  <span className="text-[13px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.description}</span>
                  <span className="mt-auto flex items-center justify-end gap-[4px] pt-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{openLabel}<Go kind="open" /></span>
                </button>
              </HoverBeam>
            </li>
          );
        })}
      </ul>

      {open && <ReportDoc detail={detail} report={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

/** The report at print size, in the full-screen viewer; CSV is in its Share menu. */
function ReportDoc({ detail, report, onClose }: { detail: SchoolDetail; report: SchoolReport; onClose: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const title = `${report.title}, ${detail.school.name}`;
  return (
    <FullScreenDocument
      open
      title={title}
      onClose={onClose}
      onPrint={() => printDocumentPage(pageRef.current, title)}
      share={[{ label: report.exportCsvLabel, icon: Download, onClick: () => downloadReportCsv(detail, report) }]}
    >
      <SchoolReportPage detail={detail} report={report} pageRef={pageRef} />
    </FullScreenDocument>
  );
}
