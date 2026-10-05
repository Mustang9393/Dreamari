"use client";

// DistrictReports: the four district reports, each a printable US Letter
// document, plus the school comparison as a CSV or a PDF.
// DEMO-ONLY data (2 Oct 2026, NOTES.md 3.5).
//
// Decisions kept from the v2 build (2 Oct 2026), with the WHY:
// - "Open report" opens a US Letter document in the full-screen viewer,
//   not a modal table: a leader forwards or files a report, and a document
//   prints and saves as PDF. Every cell the Replit's modal showed is on the
//   page: the three-stat summary, every report row, and each column's
//   definition (the Replit's header (i)) as a note.
// - The modal's "Download this PDF" is the viewer's "Print or save PDF";
//   its "Export this CSV" is the viewer's Share menu entry of that name.
// - "Export school comparison CSV" is a real CSV of all 11 schools with
//   every measure and its change, follow-up need and coverage (a superset of
//   the report's six columns). "PDF" opens the School performance
//   comparison report and prints it.
//
// v4 rebuild (6 Oct 2026). WHY: the list was v2 HoverBeam glass cards with
// bold uppercase tags, and the document was a one-off v2 layout (sans
// kicker labels, a heavy summary strip). Direct instruction: make the
// leader roles "like this version" (the counselor's v4) "in every
// aspect...". So:
//   - The document is v4's editorial report, the same .publication-* type
//     as the counselor's Impact report and the Review desk documents:
//     letterhead rule and crest in the publication ink, tracked eyebrow,
//     Source Serif title with an italic close, byline over a hairline,
//     numbered sections, key figures on a tinted band, ruled tables, a
//     "Reading this report" method box, a ruled folio. The long "Student
//     outcomes & pathways" report is set as two pages, one numbered section
//     per kind of measure; a definition shared by every row of a section is
//     printed once under its heading (every cell is still on the page, and
//     the CSV keeps the Replit's exact rows).
//   - Each report in the list shows its first page as a thumbnail, the way
//     the Review desk shows a submission, in a v4 glass sheet with the
//     type, title, description and "Prepared for" line under it.
//   - The two exports are v4 tool buttons beside the section line.

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, FileDown } from "lucide-react";
import { FullScreenDocument, PAGE_H, PAGE_W, SERIF, printDocumentPage } from "../../DocumentDesk";
import { DocumentThumbnail, PAPER_VARS } from "../../DocumentPreview";
import { usePublicationStyle } from "../../SchoolPublication";
import {
  DISTRICT,
  DISTRICT_REPORTS,
  DISTRICT_REPORTS_COPY,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  sortSchools,
  type DistrictReport,
} from "@/lib/leaderData";
import { downloadCsv } from "./districtKit";

const COMPARISON_ID = "school-comparison";

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

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

/** The district's shield, in the publication ink, as the school letterhead draws a school's. */
function DistrictCrest({ ink, size = 34 }: { ink: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="flex-none">
      <path d="M20 2 L36 8 V19 C36 29 29 35 20 38 C11 35 4 29 4 19 V8 Z" fill={ink} />
      <path d="M20 5.2 L33 10.1 V19 C33 27.3 27.4 32.3 20 34.8 C12.6 32.3 7 27.3 7 19 V10.1 Z" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
      <text x="20" y="24.2" textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily={SERIF} fill="#fff" letterSpacing="0.5">{DISTRICT.sidebar.initials}</text>
    </svg>
  );
}

/** "District readiness pulse" -> District readiness <em>pulse.</em> */
function EditorialTitle({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return <h1 className="publication-title small">{words.join(" ")} <em>{last}.</em></h1>;
}

const PLURAL: Record<string, string> = {
  "Career interest": "Career interests",
  "Postsecondary choice": "Postsecondary choices",
  "Postsecondary intention": "Postsecondary intentions",
  "Planning milestone": "Planning milestones",
  "Career experience": "Career experiences",
};

type Block = { heading: string; columns: string[]; rows: string[][]; caption?: string; wide: boolean[] };

/** The report's rows as numbered sections. A report whose first column is a
 *  SECTION becomes one section per kind of measure; a definition every row
 *  of a section shares is printed once as the section's caption. */
function blocksOf(report: DistrictReport): Block[] {
  const m = report.modal;
  const labels = m.columns.map((c) => sentence(c.label));
  const isText = (col: number, rows: string[][]) => rows.some((r) => (r[col] ?? "").length > 24);
  if (m.columns[0]?.label !== "SECTION") {
    return [{ heading: m.rowsHeading, columns: labels, rows: m.rows, wide: labels.map((_, i) => i > 0 && isText(i, m.rows)) }];
  }
  const order = [...new Set(m.rows.map((r) => r[0]))];
  return order.map((name) => {
    const rows = m.rows.filter((r) => r[0] === name).map((r) => r.slice(1));
    const defs = new Set(rows.map((r) => r[r.length - 1]));
    const shared = defs.size === 1;
    const body = shared ? rows.map((r) => r.slice(0, -1)) : rows;
    const cols = shared ? labels.slice(1, -1) : labels.slice(1);
    return { heading: PLURAL[name] ?? name, columns: cols, rows: body, caption: shared ? `${[...defs][0]}.` : undefined, wide: cols.map((_, i) => i > 0 && isText(i, body)) };
  });
}

/** One report as v4 publication pages. `firstOnly` is the list thumbnail. */
function ReportDocument({ report, pageRef, firstOnly = false }: { report: DistrictReport; pageRef?: React.Ref<HTMLDivElement>; firstOnly?: boolean }) {
  const { style } = usePublicationStyle();
  const m = report.modal;
  const blocks = blocksOf(report);
  // Long reports run to more pages. A section's cost is its rows (a row
  // with a long definition counts double) plus its heading; page one has
  // room for about 12 after the summary, later pages for about 26.
  const cost = (b: Block) => 2.5 + b.rows.reduce((n, r) => n + (b.wide.some((w, i) => w && (r[i] ?? "").length > 60) ? 2 : 1), 0);
  const pages: Block[][] = [[]];
  let used = 0;
  for (const b of blocks) {
    const room = pages.length === 1 ? 12 : 26;
    if (pages[pages.length - 1].length > 0 && used + cost(b) > room) { pages.push([]); used = 0; }
    pages[pages.length - 1].push(b);
    used += cost(b);
  }
  const shown = firstOnly ? pages.slice(0, 1) : pages;
  const notes = [
    ...m.summary.filter((s) => s.tooltip).map((s) => ({ k: s.label, v: s.tooltip as string })),
    ...m.columns.filter((c) => c.tooltip).map((c) => ({ k: sentence(c.label), v: c.tooltip as string })),
  ];
  let n = 1;
  const section = (title: string) => { n += 1; return <h2 className="publication-section"><span>{String(n).padStart(2, "0")}</span>{title}</h2>; };

  return (
    <div ref={pageRef} className="publication-book">
      {shown.map((page, p) => (
        <article key={p} data-doc-page className="publication-report-page v4-district-doc" style={{ ...PAPER_VARS, "--publication-ink": style.accent, width: PAGE_W, minHeight: PAGE_H } as React.CSSProperties}>
          <header className="publication-masthead editorial" style={{ borderColor: style.accent, color: style.accent }}>
            <div className="publication-school"><DistrictCrest ink={style.accent} /><div><strong>{DISTRICT.name}</strong><span>{DISTRICT.metaLine}</span></div></div>
          </header>
          {p === 0 ? (
            <>
              <div className="publication-eyebrow">{sentence(report.typeTag)}<span>Academic year 2026–27</span></div>
              <EditorialTitle text={m.title} />
              <div className="publication-byline">
                <div><strong>{DISTRICT.name}</strong><span>District leader · synthetic planning data</span></div>
                <div><strong>{report.preparedFor}</strong><span>{m.eyebrow.charAt(0) + m.eyebrow.slice(1).toLowerCase()}</span></div>
              </div>
              <h2 className="publication-section"><span>01</span>Summary</h2>
              <p className="publication-lede">{m.description}</p>
              <div className="publication-key-figures">
                {m.summary.map((s) => <div key={s.label}><strong>{s.value}</strong><b>{s.label}</b>{s.caption && <span>{s.caption}</span>}</div>)}
              </div>
            </>
          ) : (
            <div className="publication-eyebrow">{m.title}<span>Continued</span></div>
          )}
          {page.map((b) => (
            <div key={b.heading}>
              {section(b.heading)}
              {b.caption && <p className="publication-caption" style={{ marginTop: 0, marginBottom: 6 }}>{b.caption}</p>}
              <table className="publication-table">
                <thead><tr>{b.columns.map((c, i) => <th key={c} style={b.wide[i] ? { textAlign: "left", paddingLeft: 18 } : undefined}>{c}</th>)}</tr></thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={b.wide[ci] ? { textAlign: "left", paddingLeft: 18, color: "#4e5265", fontSize: 9.5, lineHeight: 1.45 } : ci === 0 ? { fontWeight: 500 } : undefined}>{ci === 1 && !b.wide[ci] ? <strong>{cell}</strong> : cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {p === pages.length - 1 && notes.length > 0 && (
            <div className="publication-method">
              <strong>Reading this report</strong>
              {notes.map((x) => <p key={x.k}><b>{x.k}.</b> {x.v}</p>)}
            </div>
          )}
          {p === pages.length - 1 && <p className="publication-source">Source: {DISTRICT.name} synthetic planning view, 2026–27. Values are synthetic planning measures, not live student records.</p>}
          <footer className="publication-folio"><span>{DISTRICT.name} · {report.title} · Confidential</span><span>{String(p + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span></footer>
        </article>
      ))}
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
      <ReportDocument report={report} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

export function DistrictReports() {
  const [open, setOpen] = useState<{ id: string; print: boolean } | null>(null);
  const report = open ? DISTRICT_REPORTS.find((r) => r.id === open.id) : undefined;
  const [csvLabel, pdfLabel] = DISTRICT_REPORTS_COPY.headerExports;

  return (
    <div className="v4-page v4-leader-page">
      <div className="v4-district-toolbar">
        <span className="v4-district-meta"><strong>{DISTRICT_REPORTS_COPY.sectionTitle}</strong> · {DISTRICT_REPORTS_COPY.sectionSubtitle}</span>
        <div>
          <button type="button" className="v4-tool-button" onClick={schoolComparisonCsv}><Download size={15} aria-hidden />{csvLabel.label}</button>
          <button type="button" className="v4-tool-button" onClick={() => setOpen({ id: COMPARISON_ID, print: true })}><FileDown size={15} aria-hidden />{pdfLabel.label}</button>
        </div>
      </div>

      <div className="v4-leader-grid cols-2">
        {DISTRICT_REPORTS.map((r) => (
          <button key={r.id} type="button" className="v4-district-report" onClick={() => setOpen({ id: r.id, print: false })} aria-label={`${r.openLabel}: ${r.title}`}>
            <DocumentThumbnail><ReportDocument report={r} firstOnly /></DocumentThumbnail>
            <span className="v4-district-report-copy">
              <span className="v4-overline">{sentence(r.typeTag)}</span>
              <span className="v4-district-report-title">{r.title}</span>
              <span className="v4-district-report-text">{r.description}</span>
            </span>
            <span className="v4-sheet-foot"><span>{r.preparedFor}</span><span className="v4-text-action">{r.openLabel}<ArrowUpRight size={16} aria-hidden /></span></span>
          </button>
        ))}
      </div>

      {report && open && <ReportViewer key={`${open.id}-${open.print}`} report={report} autoPrint={open.print} onClose={() => setOpen(null)} />}
    </div>
  );
}
