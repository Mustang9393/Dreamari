"use client";

// A centered document viewer, the shape every real PDF viewer takes (a dark
// toolbar, a darker viewer surface, a white page floating in the middle) --
// not the inline expand-in-place card this used to be. Direct feedback,
// 25 Sept 2026: "in the counselor connect etc where there are document
// previews, please open the document in a central document preview like
// you would for pdfs. Mock those up too to look realistic." There is no
// file store in this prototype (Review Queue is the one screen with
// attachments today; see the note below on where "etc" landed), so the
// "file" is a realistic paper page built from the student's own seeded
// data -- a backend replaces `DOCUMENT_PAGES[milestone]` with the file's
// actual rendered pages or an embedded PDF viewer; the chrome around it
// (the toolbar, the paper frame, the open/close) stays exactly as built.
//
// Chrome and Portal match this app's own established modal convention
// (ResumeModal in resume/ui.tsx, "overlay" presentation): Portal (escapes
// <main>'s stacking context), a backdrop button that closes on click,
// role="dialog", aria-modal, Escape-to-close.
//
// The page is v4's own document, not a generic white sheet (reported 4 Oct
// 2026: "the document preview and the thumbnail in review desk is broken.
// Can we match it to the aesthetics of the v4 design?"). Every type draws
// the same US Letter sheet the My Impact export and the Workspace composer
// draw (ImpactPublication.tsx, DocumentDesk.tsx): the school letterhead,
// the .publication-* type (Source Serif 4 title with an italic emphasis,
// numbered ruled sections, small tracked labels, ruled folio) and the
// school's publication ink instead of a stock indigo. It is drawn at real
// size (816 x 1056) and SCALED to fit, never reflowed, so the thumbnail,
// the viewer and the printout are one layout at three zooms.

import { useRef } from "react";
import { useDialogFocus } from "./useDialogFocus";
import { Printer, X } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { printDocumentPage } from "./documentPrint";
import { COLLEGES } from "@/components/colleges/data";
import type { CounselorStudent, MilestoneKey } from "@/lib/counselorRoster";
import { FitPage, Letterhead, PAGE_H, PAGE_W } from "./DocumentDesk";
import { usePublicationStyle } from "./SchoolPublication";

export const PAPER_VARS = {
  "--paper": "#ffffff",
  "--paper-sunken": "#f4f4f5",
  "--ink": "#1a1a1a",
  "--ink-soft": "#40424a",
  "--ink-faint": "#75767e",
  "--rule": "#e2e2e6",
} as const;

function seededOffset(seed: string, span: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % span;
}

function fmtToday(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ---- The chrome ------------------------------------------------------------

export function DocumentPreviewModal({ open, onClose, fileName, pageLabel = "Page 1 of 1", children }: { open: boolean; onClose: () => void; fileName: string; kb: number; pageLabel?: string; children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open,dialogRef,onClose);
  if (!open) return null;
  return (
    <Portal>
      <div ref={dialogRef} tabIndex={-1} className="v4-document-overlay v4-popover fixed inset-0 z-[130] flex items-center justify-center p-[16px] sm:p-[32px]" role="dialog" aria-modal="true" aria-label={`Preview of ${fileName}`}>
        <button type="button" aria-label="Close preview" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[6px]" style={{ background: "rgba(5,7,15,0.72)" }} />
        <div className="relative z-[1] flex max-h-full w-full max-w-[880px] flex-col overflow-hidden rounded-[var(--radius-lg)] border motion-safe:animate-[resume-drawer-in_0.18s_ease-out_both]" style={{ borderColor: "var(--glass-border)", background: "#26272b", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.85)" }}>
          {/* Toolbar: the file's name and the two things a viewer does. The
             v4 skin (v4.css, .v4-document-overlay) paints it as the same
             card surface as the full-screen report viewer. */}
          <div className="flex flex-none items-center justify-between gap-[10px] border-b px-[16px] py-[10px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="flex min-w-0 items-center gap-[10px]">
              <span className="flex size-[28px] flex-none items-center justify-center rounded-[8px]" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}>
                <svg width="13" height="16" viewBox="0 0 13 16" fill="none" aria-hidden><path d="M1 1.5C1 0.947715 1.44772 0.5 2 0.5H8L12 4.5V14.5C12 15.0523 11.5523 15.5 11 15.5H2C1.44772 15.5 1 15.0523 1 14.5V1.5Z" stroke="currentColor" strokeWidth="1.1" /><path d="M8 0.5V4.5H12" stroke="currentColor" strokeWidth="1.1" /></svg>
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{fileName}</span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Sample document · {pageLabel}</span>
              </span>
            </span>
            <span className="flex flex-none items-center gap-[2px]">
              <IconTip label="Print / Save PDF">
                <button type="button" aria-label="Print / Save PDF" onClick={()=>printDocumentPage(pageRef.current,fileName)} className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-[6px]" style={{color:"var(--foreground)"}}><Printer className="h-[15px] w-[15px]" aria-hidden /></button>
              </IconTip>
              <IconTip label="Close">
                <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "var(--foreground)" }}><X className="h-[16px] w-[16px]" aria-hidden /></button>
              </IconTip>
            </span>
          </div>
          {/* Viewer surface: the tinted desk the sheet lies on, scrollable
             when the page runs taller than the window. The sheet is the
             real Letter page scaled to the surface's width; the ref is the
             plain wrapper so printing gets the sheet and nothing else. */}
          <div className="flex-1 dm-scroll overflow-y-auto p-[16px] sm:p-[32px]" style={{ background: "#1c1d20" }}>
            <FitPage shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)">
              <div ref={pageRef}>{children}</div>
            </FitPage>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** The submission's thumbnail: the first page, scaled to the card's width
 *  with margins around the sheet, fading out at the bottom the way a
 *  document list's preview does. Decorative (the file row below it names
 *  and opens the document), so it is hidden from assistive technology. */
export function DocumentThumbnail({ children }: { children: React.ReactNode }) {
  return (
    <div className="v4-review-paper-crop" aria-hidden="true">
      <FitPage shadow="0 1px 2px rgba(35,51,46,0.14), 0 16px 40px -18px rgba(35,51,46,0.4)">{children}</FitPage>
    </div>
  );
}

// ---- The sheet -------------------------------------------------------------

/** One US Letter sheet in v4's publication style: school letterhead, a
 *  tracked eyebrow, a serif title with an italic emphasis, a byline over a
 *  hairline, numbered sections, a ruled folio. Same classes as the My
 *  Impact report (v4.css .publication-*). */
function Sheet({ student: s, eyebrow, title, children }: { student: CounselorStudent; eyebrow: string; title: string; children: React.ReactNode }) {
  const { style } = usePublicationStyle();
  const [first, ...rest] = title.split(" ");
  return (
    <article data-doc-page className="publication-report-page publication-student-doc" style={{ ...PAPER_VARS, "--publication-ink": style.accent, width: PAGE_W, minHeight: PAGE_H } as React.CSSProperties}>
      <Letterhead />
      <div className="publication-eyebrow">{eyebrow}<span>Grade {s.grade}</span></div>
      <h1 className="publication-title small">{rest.length ? <>{first} <em>{rest.join(" ")}.</em></> : <em>{first}.</em>}</h1>
      <div className="publication-byline"><div><strong>{style.school}</strong><span>Class of {2026 + (12 - s.grade)}</span></div><div><strong>{fmtToday()}</strong><span>Generated on Dreamari</span></div></div>
      {children}
      <footer className="publication-folio"><span>{s.name} · Grade {s.grade} · {eyebrow}</span><span>01 / 01</span></footer>
    </article>
  );
}
const section = (n: string, title: string) => <h2 className="publication-section"><span>{n}</span>{title}</h2>;

// ---- One realistic page per milestone type ---------------------------------

function CareerReportPage({ student: s }: { student: CounselorStudent }) {
  return (
    <Sheet student={s} eyebrow="Dreamari career report" title={s.name}>
      {section("01", "Top career matches")}
      <div className="publication-matches">
        {s.topMatches.slice(0, 3).map((m) => (
          <div key={m.title}><span>{m.title}</span><span className="publication-inline-meter"><i style={{ width: `${m.pct}%` }} /></span><strong>{m.pct}%</strong></div>
        ))}
      </div>
      {section("02", "Career pathway")}
      <p className="publication-lede">{s.careerTrack} &middot; {s.careerCluster}</p>
      {section("03", "Engagement snapshot")}
      <div className="publication-key-figures">
        {[{ value: `${s.roadmapPct}%`, label: "Roadmap complete" }, { value: String(s.engagement.dreamScore), label: "Dream Score" }, { value: String(s.engagement.simulations), label: "Career simulations played" }].map((f) => <div key={f.label}><strong>{f.value}</strong><b>{f.label}</b></div>)}
      </div>
    </Sheet>
  );
}

function ResumePage({ student: s }: { student: CounselorStudent }) {
  const grad = 2026 + (12 - s.grade);
  return (
    <Sheet student={s} eyebrow="Résumé" title={s.name}>
      {section("01", "Education")}
      <p className="publication-lede"><strong>Lincoln High School</strong></p>
      <p className="publication-detail">Grade {s.grade} &middot; Expected graduation {grad}</p>
      {section("02", "Activities & experience")}
      <ul className="publication-list">
        <li>Completed {s.engagement.simulations} career simulations in {s.careerTrack}</li>
        <li>{s.engagement.challenges} career challenges on Dreamari, tracking toward a Dream Score of {s.engagement.dreamScore}</li>
        <li>Explored {s.engagement.careersSaved} careers and {s.engagement.collegesSaved} colleges through Dreamari</li>
      </ul>
      {section("03", "Skills")}
      <p className="publication-intro">Core interest area: {s.careerTrack}. Top match: {s.topMatches[0]?.title ?? "not yet set"}.</p>
    </Sheet>
  );
}

const PATHWAY_ELECTIVE: Record<string, string> = {
  Technology: "Intro to Computer Science", Healthcare: "Anatomy & Physiology", "Finance & Business": "Business Fundamentals",
  "Skilled Trades": "Applied Technology", Education: "Intro to Education", "Arts & Media": "Studio Art", "Law & Government": "Civics & Government",
};
function AcademicPlanPage({ student: s }: { student: CounselorStudent }) {
  const elective = PATHWAY_ELECTIVE[s.careerCluster] ?? PATHWAY_ELECTIVE[s.careerTrack] ?? "Career Pathway Elective";
  const rows = [
    { grade: 9, courses: ["English 9", "Algebra I", "Biology"] },
    { grade: 10, courses: ["English 10", "Geometry", "Chemistry"] },
    { grade: 11, courses: ["English 11", "Algebra II", elective] },
    { grade: 12, courses: ["English 12", "Pre-Calculus", elective] },
  ];
  return (
    <Sheet student={s} eyebrow="Four-year academic plan" title={s.name}>
      {section("01", "Course plan")}
      <table className="publication-table publication-plan">
        <thead><tr><th>Grade</th><th>Courses</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.grade} data-current={r.grade === s.grade || undefined}><td><strong>{r.grade}</strong></td><td>{r.courses.join(", ")}</td></tr>
          ))}
        </tbody>
      </table>
      {section("02", "Postsecondary intent")}
      <p className="publication-lede">{s.postsecondaryIntent}</p>
    </Sheet>
  );
}

// Tier colors are v4's status inks on white paper: brick, ochre, evergreen.
function collegeTier(admitRate: number | null): { label: string; color: string } {
  if (admitRate === null) return { label: "Safety", color: "#2f6b52" };
  if (admitRate < 0.3) return { label: "Reach", color: "#9a4a3c" };
  if (admitRate < 0.6) return { label: "Target", color: "#8a6732" };
  return { label: "Safety", color: "#2f6b52" };
}
function CollegeListPage({ student: s }: { student: CounselorStudent }) {
  const n = Number(s.id.replace(/^\D+/, "")) || 0;
  const picks = [0, 1, 2].map((i) => COLLEGES[(n * 7 + i * 41) % COLLEGES.length]);
  return (
    <Sheet student={s} eyebrow="College list" title={s.name}>
      {section("01", "Colleges")}
      <div className="publication-colleges">
        {picks.map((c) => {
          const tier = collegeTier(c.admitRate);
          return (
            <div key={c.slug}>
              <span><strong>{c.name}</strong><small>{c.city}, {c.stateName}</small></span>
              <em style={{ color: tier.color, borderColor: tier.color }}>{tier.label}</em>
            </div>
          );
        })}
      </div>
      {section("02", "Saved on Dreamari")}
      <p className="publication-intro">{s.engagement.collegesSaved} colleges saved &middot; Intent: {s.postsecondaryIntent}</p>
    </Sheet>
  );
}

function FinancialAidPage({ student: s }: { student: CounselorStudent }) {
  const efc = 500 + seededOffset(`${s.id}:efc`, 8) * 750;
  return (
    <Sheet student={s} eyebrow="FAFSA worksheet" title={s.name}>
      {section("01", "Worksheet")}
      <dl className="publication-fields">
        {[
          ["Dependency status", "Dependent student"],
          ["Household size", String(3 + (seededOffset(`${s.id}:hh`, 3)))],
          ["Estimated Family Contribution", `$${efc.toLocaleString("en-US")}`],
          ["Postsecondary intent", s.postsecondaryIntent],
        ].map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <div className="publication-method"><strong>Status</strong><p>Awaiting counselor review before submission.</p></div>
    </Sheet>
  );
}

function GenericPage({ student: s, milestone }: { student: CounselorStudent; milestone: MilestoneKey }) {
  return (
    <Sheet student={s} eyebrow={milestone} title={s.name}>
      {section("01", "Details")}
      <p className="publication-lede">Grade {s.grade} &middot; {s.careerTrack}</p>
    </Sheet>
  );
}

/** The realistic page for a milestone attachment. A backend replaces this
 *  switch with the file's actual rendered pages. */
export function DocumentPage({ student, milestone }: { student: CounselorStudent; milestone: MilestoneKey }) {
  switch (milestone) {
    case "Career Report": return <CareerReportPage student={student} />;
    case "Resume": return <ResumePage student={student} />;
    case "Academic Plan": return <AcademicPlanPage student={student} />;
    case "College List": return <CollegeListPage student={student} />;
    case "Financial Aid": return <FinancialAidPage student={student} />;
    default: return <GenericPage student={student} milestone={milestone} />;
  }
}
