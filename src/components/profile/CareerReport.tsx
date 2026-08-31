"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AlertCircle, ArrowRight, BadgeCheck, BookOpen, Building2, Check, CheckCircle2, ChevronDown, Clock, Copy, DollarSign, ExternalLink, GraduationCap, ListChecks, MapPin, PenLine, Printer, Search, Send, Target, Trash2 } from "lucide-react";
import type { ProfileCareer } from "./data";
import {
  ACADEMIC_RECORD,
  COURSE_SUGGESTIONS,
  reportV2,
  type CollegeStatus,
  type CareerReportV2,
} from "./report-data";

// The Career Report.
//
// A document, not a dashboard: a warm paper surface inside Dreamari's dark
// shell, numbered sections, and progressive disclosure that the print
// stylesheet undoes so an export is complete without the student expanding
// anything by hand. It flows as one document (the Aug 29 doc removed the
// Contents rail); Share, Counselor Review and Download are tabs on top of it.
//
// It is student-owned. Every claim either comes from the student's own
// activity or carries a named source, year and last-verified date. Nothing
// from the internal Career Intelligence scores (interest score, feed rank,
// signal confidence, readiness) reaches this page.

// Scoped to what the report has to say. The action plan lives in My Plan,
// where a student works; the report is the document they hand over.
export const REPORT_SECTIONS = [
  { id: "glance", n: 1, label: "Overview" },
  { id: "majors", n: 2, label: "Three Majors" },
  { id: "education", n: 3, label: "Education" },
  { id: "courses", n: 4, label: "Courses to Consider" },
  { id: "colleges", n: 5, label: "Colleges" },
] as const;


// Overlays must escape <main>, which is `relative z-10` and therefore a
// stacking context: a z-[110] modal inside it still paints beneath the z-40
// header. Portalling is the fix; raising the z-index is not. The host carries
// `marketing-v2 themeable` because every --space-*, --glass-* and --primary
// token is scoped to that class, and without it padding silently collapses.
function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const host = useMemo(() => {
    if (typeof document === "undefined") return null;
    const node = document.createElement("div");
    node.className = "marketing-v2 themeable";
    return node;
  }, []);
  useEffect(() => {
    if (!host) return;
    document.body.appendChild(host);
    return () => host.remove();
  }, [host]);
  if (!mounted || !host) return null;
  return createPortal(children, host);
}

// Colleges read as three even rows: reach, then target, then safety.
const BAND_ORDER: Record<CollegeStatus, number> = { Reach: 0, Target: 1, Safety: 2 };

// 11 -> "11th". Grades only, so the teen rules are all that matter.
function ordinal(n: string): string {
  const value = Number(n);
  if (!Number.isFinite(value)) return n;
  const tens = value % 100;
  if (tens >= 11 && tens <= 13) return `${value}th`;
  return `${value}${["th", "st", "nd", "rd"][value % 10] ?? "th"}`;
}

function SourceLink({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" data-print-url={url} className="inline-flex items-center gap-[3px] underline decoration-[color:var(--rule-strong)] underline-offset-2" style={{ color: "var(--ink-soft)" }}>
      {children} <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}

// A report section. Each one is its own contained module -- a raised card
// with a labeled header rail -- so a scrolling student sees repeating blocks
// instead of one continuous column of text. Nothing here collapses: the
// export has to carry everything, and a dropdown is exactly how information
// goes missing from a printed document.
function ReportSection({ id, n, title, icon: Icon, action, children }: { id: string; n: number; title: string; icon?: typeof Check; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[84px] overflow-hidden rounded-[14px] border" style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}>
      <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[8px] border-b px-[16px] py-[13px] sm:px-[20px]" style={{ borderColor: "var(--rule)" }}>
        {Icon && <Icon className="h-[17px] w-[17px] flex-none" style={{ color: "var(--primary)" }} aria-hidden />}
        <span aria-hidden className="dm-report-num sr-only">{String(n).padStart(2, "0")}</span>
        {/* The one hierarchy, everywhere: section heading (18) > label (14)
           > body (13). Never let a value render larger than the heading
           above it, whatever the value "deserves". */}
        <h3 id={`${id}-title`} className="text-[18px] leading-[23px] font-extrabold text-balance uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.05em" }}>
          {title}
        </h3>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <div className="px-[16px] py-[16px] sm:px-[20px] sm:py-[18px]">
        {children}
      </div>
    </section>
  );
}

// One labeled fact as a sunken tile: caps label on top, value under it. The
// repeated tile shape is what makes the section skimmable -- the eye reads
// labels first, values second, and never has to parse a sentence.
function Fact({ label, value, icon: Icon, className }: { label: string; value: React.ReactNode; icon?: typeof Check; className?: string }) {
  return (
    <div className={`rounded-[10px] border px-[14px] py-[12px] ${className ?? ""}`} style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}>
      <dt className="flex items-center gap-[6px] text-[14px] leading-[18px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--ink-faint)" }}>
        {Icon && <Icon className="h-[14px] w-[14px] flex-none" aria-hidden />}
        {label}
      </dt>
      <dd className="mt-[6px] text-[13px] leading-[19px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink)" }}>{value}</dd>
    </div>
  );
}

// Top 3 side by side. A real table on desktop (headers repeat when printed);
// one block per career on phones, same field order.
const COMPARE_FIELDS: { key: string; label: string; get: (r: CareerReportV2["comparison"]) => string }[] = [
  { key: "work", label: "What the work is", get: (r) => r.work },
  { key: "setting", label: "Where you do it", get: (r) => r.setting },
  { key: "education", label: "Typical education", get: (r) => r.education },
  { key: "time", label: "Time to get in", get: (r) => r.timeToEnter },
  { key: "cost", label: "What it costs", get: (r) => `${r.costBand} · ${r.costNote}` },
  { key: "salary", label: "Pay starting out", get: (r) => r.salaryRange },
  { key: "outlook", label: "Job outlook", get: (r) => r.outlook },
  { key: "majors", label: "Majors that fit", get: (r) => r.majors.join(", ") },
  { key: "tradeoff", label: "The trade-off", get: (r) => r.tradeoff },
  { key: "why", label: "Why it is on my list", get: (r) => r.whySaved },
  { key: "evidence", label: "Where I am with it", get: (r) => r.evidence },
  { key: "next", label: "Still need to find out", get: (r) => r.investigate },
];

function ComparisonTable({ entries, focusId }: { entries: { career: ProfileCareer; report: CareerReportV2 }[]; focusId: string }) {
  return (
    <>
      {/* Desktop and print */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-[13px]">
          <caption className="sr-only">Comparison of your top {entries.length} careers across twelve factors</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[150px] border-b pb-[10px] text-[14px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>
                Factor
              </th>
              {entries.map(({ career }) => (
                <th key={career.id} scope="col" className="border-b pb-[10px] pl-[16px] text-[16px] font-extrabold" style={{ borderColor: "var(--rule-strong)", fontFamily: "var(--font-display)" }}>
                  {career.title}
                  {career.id === focusId && <span className="ml-[6px] align-middle text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>· current</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_FIELDS.map((field) => (
              <tr key={field.key}>
                <th scope="row" className="border-b py-[10px] pr-[12px] align-top text-[14px] leading-[18px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: "var(--rule)", color: "var(--ink-faint)" }}>
                  {field.label}
                </th>
                {entries.map(({ career, report }) => (
                  <td key={career.id} className="border-b py-[10px] pl-[16px] align-top leading-[18px]" style={{ borderColor: "var(--rule)" }}>
                    {field.get(report.comparison)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: one career per block, identical field order */}
      <div className="flex flex-col gap-[20px] md:hidden">
        {entries.map(({ career, report }) => (
          <div key={career.id} data-keep-together>
            <h4 className="text-[16px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {career.title}
              {career.id === focusId && <span className="ml-[6px] text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>· current</span>}
            </h4>
            <dl className="mt-[6px] divide-y" style={{ borderColor: "var(--rule)" }}>
              {COMPARE_FIELDS.map((field) => (
                <div key={field.key} className="grid grid-cols-[110px_minmax(0,1fr)] gap-[10px] border-t py-[8px]" style={{ borderColor: "var(--rule)" }}>
                  <dt className="text-[14px] leading-[18px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--ink-faint)" }}>{field.label}</dt>
                  <dd className="text-[13px] leading-[18px]">{field.get(report.comparison)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

// The one-page meeting summary. Print-only by default; the export preview can
// show it on screen. Everything a counselor needs in the first two minutes.
const REPORT_DATE = "Aug 22, 2026";

export type ReportViewProps = {
  student: { name: string; grade: string; school: string };
  career: ProfileCareer;
  savedMajors: Set<string>;
  onToggleMajor: (name: string) => void;
  onOpenEvidence: () => void;
  updatedLabel: string;
};


// The document itself, rendered identically on the page and in the export
// preview. One component means the preview genuinely is what prints — there
// is no second, prettier version of the report to drift out of sync.
function ReportDocument({
  student, career, report, reportDate, idPrefix = "",
}: {
  student: { name: string; grade: string; school: string };
  career: ProfileCareer;
  report: CareerReportV2;
  reportDate: string;
  idPrefix?: string;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  return (
    <article
      data-doc="full"
      className="dm-report overflow-hidden rounded-[var(--radius-2xl)] px-[var(--space-5)] py-[var(--space-8)] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)] sm:px-[var(--space-7)] sm:py-[var(--space-9)]"
    >
      <div className="mx-auto max-w-[920px]">
        {/* Masthead: one big line (the student's name), everything else as
           small labeled chips -- the old double stack of 42px lines competed
           with itself and with every section heading below it. */}
        <header data-print-keep className="flex flex-col items-start">
          <p className="inline-flex items-center gap-[7px] rounded-full border px-[13px] py-[6px] text-[11px] leading-[14px] font-bold tracking-[0.11em] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>
            <BadgeCheck className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--primary)" }} />
            Dreamari Career Report
          </p>
          <h2 className="mt-[14px] text-[30px] leading-[33px] font-extrabold tracking-[-0.022em] sm:text-[40px] sm:leading-[43px]" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>{student.name}</h2>
          <p className="mt-[12px] flex flex-wrap items-center gap-[7px] text-[13px] leading-[17px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink-soft)" }}>
            <span className="rounded-[7px] border px-[10px] py-[4px]" style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}>{`${ordinal(student.grade.replace(/\D/g, ""))} Grade`}</span>
            {ACADEMIC_RECORD.verified && (
              <span className="rounded-[7px] border px-[10px] py-[4px]" style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}>
                {`${ACADEMIC_RECORD.gpa} GPA`}
                <BadgeCheck className="ml-[5px] inline h-[14px] w-[14px] align-[-2.5px]" aria-hidden style={{ color: "var(--primary)" }} />
                <span className="sr-only">verified by {ACADEMIC_RECORD.source}, {ACADEMIC_RECORD.updated}</span>
              </span>
            )}
            <span className="rounded-[7px] border px-[10px] py-[4px]" style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}>{student.school}</span>
          </p>
          {/* suppressHydrationWarning: the generated date is the reader's
             "today", so a server render across midnight must not error. */}
          <p className="mt-[10px] text-[12.5px] leading-[17px] tracking-[-0.008em]" style={{ color: "var(--ink-faint)" }} suppressHydrationWarning>
            Report generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </header>

        {/* The sections stack as separate modules with real air between them,
           not one continuous ruled column. */}
        <div className="mt-[26px] flex flex-col gap-[16px] sm:mt-[30px] sm:gap-[18px]">

        {/* 01 — At a Glance. The same facts as labeled tiles: what-you-do
           spans the row, employers and salary sit side by side under it. */}
        <ReportSection
          id={`${idPrefix}glance`}
          n={1}
          title={`${career.title} Overview`}
          icon={Target}
          action={
            <Link
              href="/explore?tab=browse"
              data-print-hide
              className="dm-tap inline-flex min-h-[32px] items-center gap-[6px] rounded-[8px] border px-[11px] text-[12.5px] leading-[16px] font-bold tracking-[-0.008em]"
              style={{ borderColor: "var(--rule-strong)", color: "var(--ink)", background: "var(--paper-sunken)" }}
            >
              Career details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        >
          <dl className="grid gap-[10px] sm:grid-cols-2" data-keep-together>
            <Fact icon={Target} label="What You Do" value={report.glance.whatYouDo} className="sm:col-span-2" />
            <Fact icon={MapPin} label="Potential Employers" value={report.glance.employers.slice(0, 3).join(", ")} />
            <Fact icon={DollarSign} label="U.S. Median Salary" value={`${report.salary.median} a year`} />
          </dl>
        </ReportSection>

        {/* 02 — Three Majors to Explore */}
        <ReportSection id={`${idPrefix}majors`} n={2} title="Three Majors to Explore" icon={BookOpen}>
          <div className="grid grid-cols-3 gap-[8px] sm:gap-[10px]" data-keep-together>
            {report.majors.map((major) => (
              <div key={major.name} className="flex items-center gap-[8px] rounded-[10px] border px-[12px] py-[13px] sm:px-[14px]" style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}>
                <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: "var(--primary)" }} />
                <h4 className="text-[13px] leading-[18px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink)" }}>{major.name}</h4>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* 03 — Education. The common path gets the one accented tile on the
           page; the alternatives are even rows under a caps label. */}
        <ReportSection id={`${idPrefix}education`} n={3} title="Education" icon={GraduationCap}>
          <div className="flex flex-col gap-[14px]" data-keep-together>
            <div className="rounded-[10px] border px-[14px] py-[12px]" style={{ borderColor: "color-mix(in srgb, var(--primary) 38%, var(--rule))", background: "color-mix(in srgb, var(--primary) 7%, var(--paper-sunken))" }}>
              <h4 className="text-[14px] leading-[18px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--primary)" }}>Most Common Path</h4>
              <p className="mt-[6px] max-w-[50ch] text-[13px] leading-[19px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink)" }}>
                {report.education.find((route) => route.common)?.name}
              </p>
            </div>
            <div>
              <h4 className="text-[14px] leading-[18px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--ink-faint)" }}>Other Viable Pathways</h4>
              <ul className="mt-[8px] grid list-none gap-[8px] p-0 sm:grid-cols-2">
                {report.education.filter((route) => !route.common).map((route) => (
                  <li key={route.name} className="flex items-center justify-between gap-[10px] rounded-[10px] border px-[14px] py-[11px]" style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}>
                    <span className="text-[13px] leading-[18px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink)" }}>{route.name}</span>
                    <span className="flex-none rounded-full border px-[9px] py-[2px] text-[11.5px] leading-[16px] font-bold tabular-nums" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>{route.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ReportSection>

        {/* 04 — Courses to Consider. The first two suggestions per career are
           the actual classes (the third is an experience, which stays on My
           Plan). Mapping subjects to O*NET knowledge areas and SCED codes is
           a backend data-model note, not UI. */}
        <ReportSection id={`${idPrefix}courses`} n={4} title="Courses to Consider" icon={ListChecks}>
          <div data-keep-together>
            <h4 className="text-[14px] leading-[18px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--ink-faint)" }}>Classes that support this route</h4>
            <ul className="mt-[8px] flex list-none flex-wrap gap-[8px] p-0">
              {(COURSE_SUGGESTIONS[career.id]?.slice(0, 2) ?? [{ label: "Statistics", why: "" }, { label: "Economics", why: "" }]).map((course) => (
                <li key={course.label}>
                  <span title={course.why || undefined} className="inline-flex items-baseline rounded-full border px-[13px] py-[7px]" style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}>
                    <span className="text-[13px] leading-[18px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink)" }}>{course.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ReportSection>

        {/* 05 — Colleges */}
        <ReportSection
          id={`${idPrefix}colleges`}
          n={5}
          title="Colleges"
          icon={Building2}
          action={
            <Link
              href="/colleges"
              data-print-hide
              className="dm-tap inline-flex min-h-[32px] items-center gap-[6px] rounded-[8px] border px-[11px] text-[12.5px] leading-[16px] font-bold tracking-[-0.008em]"
              style={{ borderColor: "var(--rule-strong)", color: "var(--ink)", background: "var(--paper-sunken)" }}
            >
              <Search className="h-3.5 w-3.5" aria-hidden /> College Lookup
            </Link>
          }
        >
          <div className="grid gap-[10px] sm:grid-cols-2">
            {[...report.colleges].sort((a, b) => BAND_ORDER[a.status] - BAND_ORDER[b.status]).map((college) => (
              <Link
                key={college.name}
                href={`/colleges?school=${encodeURIComponent(college.name)}`}
                className="dm-tap flex flex-col rounded-[10px] border px-[14px] py-[12px]"
                style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}
                data-keep-together
              >
                <span className="mb-[8px] inline-flex w-fit items-center rounded-full border px-[9px] py-[2px] text-[10.5px] leading-[15px] font-bold tracking-[0.08em] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)", background: "var(--paper-raised)" }}>
                  {college.status}
                </span>
                <h4 className="text-[13px] leading-[18px] font-bold tracking-[-0.008em]" style={{ color: "var(--ink)" }}>{college.name}</h4>
                <span data-print-hide className="mt-[5px] inline-flex items-center gap-[4px] text-[12px] leading-[17px]" style={{ color: "var(--ink-faint)" }}>
                  Look this up <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </ReportSection>

        {/* Sources: the same module shape as the sections, so the page ends
           contained rather than trailing off into loose text */}
        <footer className="rounded-[14px] border" style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}>
          {/* Collapsed on screen to keep the page short. The print stylesheet
              reveals [hidden], so an export still carries every source. */}
          <button
            type="button"
            data-print-hide
            aria-expanded={sourcesOpen}
            aria-controls="report-sources"
            onClick={() => setSourcesOpen((open) => !open)}
            className="dm-link flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-[var(--space-3)] px-[16px] text-left sm:px-[20px]"
          >
            <span className="text-[18px] leading-[23px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.05em" }}>Where this comes from</span>
            <ChevronDown className="h-4 w-4 flex-none transition-transform" style={{ color: "var(--ink-faint)", transform: sourcesOpen ? "rotate(180deg)" : "none" }} aria-hidden />
          </button>
          <span aria-hidden className="hidden px-[16px] pt-[14px] text-[18px] leading-[23px] font-extrabold uppercase print:block" style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.05em" }}>Where this comes from</span>
          <div id="report-sources" hidden={!sourcesOpen} className="border-t px-[16px] pt-[14px] pb-[16px] sm:px-[20px]" style={{ borderColor: "var(--rule)" }}>
          <ul className="flex list-none flex-col gap-[5px] p-0 text-[13px] leading-[19px]" style={{ color: "var(--ink-faint)" }}>
            {report.sources.map((source) => (
              <li key={source.url + source.label}>
                {source.label} — {source.org}, {source.year}. Checked {source.verified}.{" "}
                <SourceLink url={source.url}>Open</SourceLink>
              </li>
            ))}
          </ul>
          <p className="mt-[12px] max-w-[64ch] text-[13px] leading-[19px]" style={{ color: "var(--ink-faint)" }}>
            Prepared by the student with Dreamari. It supports a conversation with a counselor; it is not a decision or a prediction.
            Employers are examples of who hires for this work, not job openings.
            Reach, Target and Safety are indicative bands to guide research, not predictions of admission. Salary figures describe people already
            working in the job. Pay, programs and admission requirements change, so treat everything here as a starting point for a conversation
            rather than a guarantee.
          </p>
          </div>
        </footer>

        </div>
      </div>

      {/* Running footer: repeats on every printed page */}
      <div className="dm-print-footer" aria-hidden>
        {student.name} · Career Report · {reportDate} · v1.0 · Prepared with Dreamari
      </div>
    </article>
  );
}

export { ComparisonTable, Portal };

// The document on its own, with no rail, no toolbar and no export preview --
// for places that show the report rather than let you work on it (the report
// chooser renders three of these side by side). Same component the profile
// renders and the printer prints, so there is still only one report.
export function CareerReportDocument({
  student, career, idPrefix,
}: {
  student: { name: string; grade: string; school: string };
  career: ProfileCareer;
  idPrefix: string;
}) {
  const report = reportV2(career.id);
  if (!report) return null;
  return <ReportDocument student={student} career={career} report={report} reportDate={REPORT_DATE} idPrefix={idPrefix} />;
}

// ---- The report surface: one document, four views on top of it ----
// Share, Counselor Review and Download are TABS above the report (the Aug 29
// doc), not toolbar buttons opening sheets. "Report" is the document itself.

const REPORT_TABS = [
  { id: "report", label: "Report" },
  { id: "share", label: "Share" },
  { id: "counselor", label: "Counselor Review" },
  { id: "download", label: "Download" },
] as const;
type ReportTabId = (typeof REPORT_TABS)[number]["id"];

export function CareerReportView(props: ReportViewProps) {
  const { student, career } = props;
  const report = reportV2(career.id);
  const [tab, setTab] = useState<ReportTabId>("report");

  if (!report) {
    return (
      <div className="rounded-[var(--radius-2xl)] border p-[var(--space-8)] text-center" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">No report yet for {career.title}</p>
        <p className="mt-[6px] text-[13px]" style={{ color: "var(--muted-foreground)" }}>Play a simulation or save it from Explore and the report will build itself.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* App chrome, never printed */}
      <div data-print-hide className="no-print flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)]">
        <div
          role="tablist"
          aria-label="Career report views"
          onKeyDown={(event) => {
            const order = REPORT_TABS.map((item) => item.id);
            const index = order.indexOf(tab);
            let next: ReportTabId | null = null;
            if (event.key === "ArrowRight") next = order[(index + 1) % order.length];
            if (event.key === "ArrowLeft") next = order[(index + order.length - 1) % order.length];
            if (next) {
              event.preventDefault();
              setTab(next);
              document.getElementById(`report-tab-${next}`)?.focus();
            }
          }}
          className="flex max-w-full items-center gap-[var(--space-1)] overflow-x-auto rounded-[var(--radius-xl)] border p-[var(--space-1)] [scrollbar-width:none]"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
        >
          {REPORT_TABS.map((item) => (
            <button
              key={item.id}
              id={`report-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`report-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              className="dm-quiet min-h-[40px] flex-none cursor-pointer rounded-[var(--radius-md-alt)] px-[14px] text-[13.5px] leading-[17px] font-bold whitespace-nowrap"
              style={{ background: tab === item.id ? "var(--primary)" : "transparent", color: tab === item.id ? "var(--primary-foreground)" : "var(--foreground)" }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-[11.5px] font-bold sm:ml-auto" style={{ color: "var(--muted-foreground)" }}>Updated {props.updatedLabel}</span>
      </div>

      {tab === "report" && (
        <div role="tabpanel" id="report-panel-report" aria-labelledby="report-tab-report" className="flex flex-col gap-[var(--space-4)]">
          <ReportDocument student={student} career={career} report={report} reportDate={REPORT_DATE} />
          {/* Keyed so a focus swap re-reads the right career's saved answers. */}
          <ReflectionCard key={career.id} careerId={career.id} careerTitle={career.title} />
        </div>
      )}
      {tab === "share" && (
        <div role="tabpanel" id="report-panel-share" aria-labelledby="report-tab-share">
          <ShareTab />
        </div>
      )}
      {tab === "counselor" && (
        <div role="tabpanel" id="report-panel-counselor" aria-labelledby="report-tab-counselor">
          <CounselorReviewTab />
        </div>
      )}
      {tab === "download" && (
        <div role="tabpanel" id="report-panel-download" aria-labelledby="report-tab-download">
          <DownloadTab student={student} career={career} report={report} />
        </div>
      )}
    </div>
  );
}

// ---- My Reflection (Maisha's section) ----
// The student's own read on the career after doing the work. Persisted per
// career the same way picks are: localStorage IS the prototype's backend.

const INTEREST_OPTIONS = ["Very Interested", "Interested", "Not Sure Yet", "Probably Not For Me", "Definitely Not For Me"] as const;
const INFLUENCE_OPTIONS = ["The actual work", "Salary", "Work-life balance", "Education required", "My skills/interests", "Career opportunities", "Something else"] as const;

type StoredReflection = { interest: string | null; influences: string[]; notes: string };

function readReflection(key: string): StoredReflection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReflection>;
    return {
      interest: typeof parsed.interest === "string" && (INTEREST_OPTIONS as readonly string[]).includes(parsed.interest) ? parsed.interest : null,
      influences: Array.isArray(parsed.influences) ? parsed.influences.filter((item): item is string => typeof item === "string" && (INFLUENCE_OPTIONS as readonly string[]).includes(item)) : [],
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
    };
  } catch {
    return null;
  }
}

function ReflectionCard({ careerId, careerTitle }: { careerId: string; careerTitle: string }) {
  const storageKey = `dreamari-reflection:${careerId}`;
  // Lazy init is safe here: the card only ever mounts after an interaction
  // (a tab click), never in server-rendered HTML, so there is no hydration
  // pass for a stored value to disagree with. The parent keys this component
  // by career id, so a focus swap runs the initializer again.
  const [stored] = useState<StoredReflection | null>(() => readReflection(storageKey));
  const [interest, setInterest] = useState<string | null>(stored?.interest ?? null);
  const [influences, setInfluences] = useState<string[]>(stored?.influences ?? []);
  const [notes, setNotes] = useState(stored?.notes ?? "");
  const [saved, setSaved] = useState(stored !== null);

  const edit = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setSaved(false);
  };
  const setInterestEdited = edit(setInterest);
  const setNotesEdited = edit(setNotes);
  const toggleInfluence = (option: string) => {
    setInfluences((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]));
    setSaved(false);
  };
  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ interest, influences, notes } satisfies StoredReflection));
    } catch {
      // Private mode etc: the session still holds the state; only persistence is lost.
    }
    setSaved(true);
  };

  const pill = (active: boolean) =>
    ({
      background: active ? "var(--ink)" : "var(--paper-raised)",
      borderColor: active ? "var(--ink)" : "var(--rule-strong)",
      color: active ? "var(--paper)" : "var(--ink-soft)",
    }) as const;

  return (
    <section aria-labelledby="reflection-title" className="dm-report rounded-[var(--radius-2xl)] px-[var(--space-5)] pt-[var(--space-7)] pb-[var(--space-8)] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)] sm:px-[var(--space-7)] sm:pt-[var(--space-8)] sm:pb-[var(--space-9)]">
      <div className="mx-auto max-w-[920px]">
        <h3 id="reflection-title" className="flex items-center gap-[10px] text-[18px] leading-[23px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.05em" }}>
          <PenLine className="h-[17px] w-[17px] flex-none" style={{ color: "var(--primary)" }} aria-hidden />
          My Reflection
        </h3>

        <div className="mt-[14px] flex flex-col gap-[22px] border-t pt-[18px]" style={{ borderColor: "var(--rule)" }}>
          <fieldset>
            <legend className="text-[14px] leading-[19px] font-extrabold tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
              After learning more about {careerTitle}, how interested are you?
            </legend>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {INTEREST_OPTIONS.map((option) => (
                <button key={option} type="button" aria-pressed={interest === option} onClick={() => setInterestEdited(interest === option ? null : option)} className="dm-tap cursor-pointer rounded-full border px-[13px] py-[7px] text-[13px] leading-[18px] font-bold" style={pill(interest === option)}>
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[14px] leading-[19px] font-extrabold tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
              What influenced your decision most? <span className="font-normal" style={{ color: "var(--ink-faint)" }}>(Select all that apply)</span>
            </legend>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {INFLUENCE_OPTIONS.map((option) => (
                <button key={option} type="button" aria-pressed={influences.includes(option)} onClick={() => toggleInfluence(option)} className="dm-tap cursor-pointer rounded-full border px-[13px] py-[7px] text-[13px] leading-[18px] font-bold" style={pill(influences.includes(option))}>
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-[14px] leading-[19px] font-extrabold tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
              What stood out to you? <span className="font-normal" style={{ color: "var(--ink-faint)" }}>(Optional)</span>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotesEdited(event.target.value)}
              rows={4}
              placeholder="Jot down any thoughts, questions, or surprising facts here..."
              className="mt-[10px] w-full resize-y rounded-[10px] border p-[14px] text-[13px] leading-[19px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--ink-faint)]"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink)" }}
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <button type="button" onClick={save} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[10px] px-[22px] text-[14px] font-bold" style={{ background: "var(--ink)", color: "var(--paper)" }}>
              Save Reflection
            </button>
            <span aria-live="polite" className="flex items-center gap-[5px] text-[13px] font-bold" style={{ color: saved ? "var(--ink-soft)" : "var(--ink-faint)" }}>
              {saved && <Check className="h-3.5 w-3.5" aria-hidden />}
              {saved ? "Reflection saved" : "Not saved yet"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Share tab ----
// The ShareSheet's content, inline. The student starts sharing, but access is
// a school setting, so the copy never promises control we cannot deliver.

const SHARE_TARGETS = [
  { id: "counselor", title: "Share with Counselor", note: "Send directly to your assigned counselor" },
  { id: "family", title: "Share with Parent / Guardian", note: "Email a secure link to your family" },
] as const;

function ShareTab() {
  const [shared, setShared] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const link = "https://dreamari.app/report/3704cbe0-ef";
  const copy = () => {
    try {
      void navigator.clipboard?.writeText(link);
    } catch {
      // Clipboard can be unavailable (permissions, http): the field is still selectable.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section aria-labelledby="share-title" className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-2xl)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      <div className="flex flex-col gap-[3px]">
        <h3 id="share-title" className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Share Your Report</h3>
        <p className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--muted-foreground)" }}>Choose who you want to share your career exploration progress with.</p>
      </div>

      <div className="flex flex-col gap-[var(--space-2)]">
        {SHARE_TARGETS.map((target) => (
          <button
            key={target.id}
            type="button"
            onClick={() => setShared((current) => ({ ...current, [target.id]: true }))}
            className="dm-tap flex cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-xl)] border px-[var(--space-5)] py-[var(--space-4)] text-left"
            style={{ background: "var(--glass-surface-1)", borderColor: shared[target.id] ? "color-mix(in srgb, var(--color-feedback-success, #33c78c) 45%, var(--glass-border))" : "var(--glass-border)" }}
          >
            <span className="flex min-w-0 flex-col gap-[2px]">
              <span className="text-[16px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{target.title}</span>
              <span className="text-[13.5px] leading-[17px] font-bold" style={{ color: "var(--muted-foreground)" }}>{target.note}</span>
            </span>
            {shared[target.id] ? (
              <span className="flex flex-none items-center gap-[5px] text-[13px] font-bold" style={{ color: "var(--color-feedback-success, #33c78c)" }}>
                <Check className="h-4 w-4" aria-hidden /> Sent
              </span>
            ) : (
              <Send className="h-4 w-4 flex-none" style={{ color: "var(--accent-subtle)" }} aria-hidden />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-[6px]">
        <span className="text-[12px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--muted-foreground)" }}>Or copy link</span>
        <div className="flex items-stretch gap-[var(--space-2)]">
          <input readOnly value={link} onFocus={(event) => event.target.select()} aria-label="Report link" className="min-w-0 flex-1 rounded-[var(--radius-md)] border bg-transparent px-[var(--space-3)] text-[13.5px] font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }} />
          <button type="button" onClick={copy} className="dm-solid flex min-h-[44px] flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[13.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <p className="text-[12px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
        Prototype: sharing is simulated locally and does not send anything yet.
      </p>
    </section>
  );
}

// ---- Counselor Review tab ----
// Staff-facing, so it says so up top. Choices are cards, never color alone.

const PATHWAY_STATUS = [
  { id: "approve", label: "Approve Pathway", note: "Student has explored sufficiently", Icon: CheckCircle2 },
  { id: "continue", label: "Continue Exploring", note: "Needs additional exploration", Icon: Clock },
  { id: "needs-review", label: "Needs Review", note: "Planning considerations to discuss", Icon: AlertCircle },
] as const;

function CounselorReviewTab() {
  const [status, setStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [reviewedOn, setReviewedOn] = useState<string | null>(null);

  return (
    <section aria-labelledby="counselor-title" className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-2xl)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      <div className="flex flex-col gap-[3px]">
        <span className="text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>For staff use only</span>
        <h3 id="counselor-title" className="text-[20px] leading-[25px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Counselor Review</h3>
      </div>

      <fieldset>
        <legend className="text-[14px] font-bold">Pathway Status</legend>
        <div className="mt-[10px] grid grid-cols-1 gap-[var(--space-2)] sm:grid-cols-3">
          {PATHWAY_STATUS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={status === option.id}
              onClick={() => { setStatus(option.id); setReviewedOn(null); }}
              className="dm-tap flex cursor-pointer flex-col gap-[6px] rounded-[var(--radius-xl)] border p-[var(--space-4)] text-left"
              style={{
                borderColor: status === option.id ? "var(--primary)" : "var(--glass-border)",
                background: status === option.id ? "color-mix(in srgb, var(--primary) 10%, var(--glass-surface-1))" : "var(--glass-surface-1)",
              }}
            >
              <option.Icon className="h-[18px] w-[18px]" style={{ color: status === option.id ? "var(--accent-subtle)" : "var(--muted-foreground)" }} aria-hidden />
              <span className="text-[14.5px] leading-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{option.label}</span>
              <span className="text-[12.5px] leading-[16px] font-bold" style={{ color: "var(--muted-foreground)" }}>{option.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-[14px] font-bold">Review Notes</span>
        <textarea
          value={notes}
          onChange={(event) => { setNotes(event.target.value); setReviewedOn(null); }}
          rows={3}
          placeholder="Add internal notes about this student's pathway..."
          className="mt-[8px] w-full resize-y rounded-[var(--radius-lg)] border bg-transparent p-[var(--space-3)] text-[14px] leading-[20px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
          style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        />
      </label>

      <div className="flex flex-wrap items-center gap-[var(--space-4)]">
        <button
          type="button"
          onClick={() => setReviewedOn(new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }))}
          className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          Save Review
        </button>
        <span aria-live="polite" className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          {reviewedOn ? `Reviewed on ${reviewedOn}` : "Not reviewed yet"}
        </span>
        <button type="button" onClick={() => { setStatus(null); setNotes(""); setReviewedOn(null); }} className="dm-link ml-auto flex min-h-[44px] cursor-pointer items-center gap-[5px] text-[13px] font-bold" style={{ color: "var(--destructive)" }}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove Pathway
        </button>
      </div>

      <p className="text-[12px] leading-[15px]" style={{ color: "var(--muted-foreground)" }}>
        Prototype: reviews are simulated locally and are not sent to the school yet.
      </p>
    </section>
  );
}

// ---- Download tab ----
// The old export preview, inline: the page you see IS the page that prints,
// so the Print button needs no separate modal anymore.

function DownloadTab({ student, career, report }: { student: { name: string; grade: string; school: string }; career: ProfileCareer; report: CareerReportV2 }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-center gap-[var(--space-4)]">
        <button type="button" onClick={() => window.print()} className="dm-solid flex min-h-[44px] flex-none cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[13.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Printer className="h-4 w-4" aria-hidden /> Print or save PDF
        </button>
        <p className="min-w-[220px] flex-1 text-[11.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>
          This is the document exactly as it will print: US Letter, no app navigation, nothing hidden. Page numbers come from your browser&apos;s print settings.
        </p>
      </div>
      <div data-preview="full">
        <div className="mx-auto w-full max-w-[816px] overflow-hidden rounded-[6px] shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]">
          <ReportDocument student={student} career={career} report={report} reportDate={REPORT_DATE} idPrefix="download-" />
        </div>
      </div>
    </div>
  );
}

