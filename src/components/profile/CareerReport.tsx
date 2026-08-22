"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Check, Compass, DollarSign, ExternalLink, GraduationCap, List, MapPin, Printer, Search, Send, Target, X } from "lucide-react";
import type { ProfileCareer, PathwayRoute } from "./data";
import {
  ACADEMIC_RECORD,
  reportV2,
  type CareerReportV2,
  type PathwayStage,
  type StudentDirection,
} from "./report-data";

// The Career & Pathway Report.
//
// A document, not a dashboard: a warm paper surface inside Dreamari's dark
// shell, numbered sections, a contextual table of contents, and progressive
// disclosure that the print stylesheet undoes so an export is complete
// without the student expanding anything by hand.
//
// It is student-owned. Every claim either comes from the student's own
// activity or carries a named source, year and last-verified date. Nothing
// from the internal Career Intelligence scores (interest score, feed rank,
// signal confidence, readiness) reaches this page.

// Scoped to what the report has to say. The action plan lives in My Plan,
// where a student works; the report is the document they hand over.
export const REPORT_SECTIONS = [
  { id: "glance", n: 1, label: "At a Glance" },
  { id: "majors", n: 2, label: "Three Majors" },
  { id: "education", n: 3, label: "Education" },
  { id: "colleges", n: 4, label: "Colleges" },
] as const;


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
    <a href={url} target="_blank" rel="noreferrer" data-print-url={url} className="inline-flex items-center gap-[3px] font-bold underline decoration-[color:var(--rule-strong)] underline-offset-2" style={{ color: "var(--ink)" }}>
      {children} <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}

// A numbered report section. Nothing here collapses: the export has to carry
// everything, and a dropdown is exactly how information goes missing from a
// printed document.
function ReportSection({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[84px] pt-[40px] sm:pt-[46px]">
      <div className="flex items-baseline gap-[10px] sm:gap-[16px]">
        <span aria-hidden className="dm-report-num flex-none text-[23px] leading-[27px] font-extrabold tabular-nums sm:text-[28px] sm:leading-[32px]" style={{ fontFamily: "var(--font-display)" }}>{String(n).padStart(2, "0")}</span>
        <h3 id={`${id}-title`} className="text-[23px] leading-[27px] font-extrabold text-balance uppercase sm:text-[28px] sm:leading-[32px]" style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.004em" }}>
          {title}
        </h3>
      </div>
      <div className="mt-[16px] border-t pt-[18px]" style={{ borderColor: "var(--rule-strong)" }}>
        {children}
      </div>
    </section>
  );
}

function Fact({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: typeof Check }) {
  return (
    <div className="flex gap-[12px] py-[13px]">
      {Icon && <Icon className="mt-[2px] h-[18px] w-[18px] flex-none" style={{ color: "var(--ink-faint)" }} aria-hidden />}
      <div className="min-w-0">
        <dt className="text-[18px] leading-[23px] font-extrabold tracking-[-0.012em]" style={{ color: "var(--ink)" }}>{label}</dt>
        <dd className="mt-[4px] text-[17px] leading-[24px] tracking-[-0.012em]" style={{ color: "var(--ink-soft)" }}>{value}</dd>
      </div>
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
              <th scope="col" className="w-[150px] border-b pb-[10px] text-[11px] font-bold tracking-[0.7px] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>
                Factor
              </th>
              {entries.map(({ career }) => (
                <th key={career.id} scope="col" className="border-b pb-[10px] pl-[16px] text-[15px] font-extrabold" style={{ borderColor: "var(--rule-strong)", fontFamily: "var(--font-display)" }}>
                  {career.title}
                  {career.id === focusId && <span className="ml-[6px] align-middle text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>· current</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_FIELDS.map((field) => (
              <tr key={field.key}>
                <th scope="row" className="border-b py-[10px] pr-[12px] align-top text-[11px] font-bold tracking-[0.7px] uppercase" style={{ borderColor: "var(--rule)", color: "var(--ink-faint)" }}>
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
            <h4 className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {career.title}
              {career.id === focusId && <span className="ml-[6px] text-[12px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>· current</span>}
            </h4>
            <dl className="mt-[6px] divide-y" style={{ borderColor: "var(--rule)" }}>
              {COMPARE_FIELDS.map((field) => (
                <div key={field.key} className="grid grid-cols-[104px_minmax(0,1fr)] gap-[10px] border-t py-[8px]" style={{ borderColor: "var(--rule)" }}>
                  <dt className="text-[12px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--ink-faint)" }}>{field.label}</dt>
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
function MeetingSummary({
  student,
  career,
  entries,
  direction,
  actions,
  route,
  reportDate,
}: {
  student: { name: string; grade: string; school: string };
  career: ProfileCareer;
  entries: { career: ProfileCareer; report: CareerReportV2 }[];
  direction: StudentDirection;
  actions: { label: string; done: boolean }[];
  route: PathwayRoute;
  reportDate: string;
}) {
  return (
    <div data-doc="summary" className="dm-report px-[var(--space-6)] py-[var(--space-8)] sm:px-[var(--space-10)] sm:py-[var(--space-12)]">
      <header>
        <p className="text-[12px] font-bold tracking-[2px] uppercase" style={{ color: "var(--ink-faint)" }}>Meeting summary</p>
        <h2 className="mt-[8px] text-[36px] leading-[38px] font-extrabold tracking-[-0.035em] sm:text-[44px] sm:leading-[44px]" style={{ fontFamily: "var(--font-display)" }}>
          {student.name}
        </h2>
        <dl className="mt-[16px] flex flex-wrap items-end gap-x-[32px] gap-y-[12px] border-t pt-[14px]" style={{ borderColor: "var(--rule-strong)" }}>
          {[
            { label: "Grade", value: student.grade.replace("Grade ", "") },
            { label: "School", value: student.school },
            ...(ACADEMIC_RECORD.verified ? [{ label: "GPA", value: ACADEMIC_RECORD.gpa }] : []),
            { label: "Date", value: reportDate },
          ].map((fact) => (
            <div key={fact.label} className="flex flex-col gap-[1px]">
              <dt className="text-[12px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>{fact.label}</dt>
              <dd className="text-[19px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-[26px]" data-keep-together>
        <h3 className="text-[12px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>What I am working toward</h3>
        <p className="mt-[7px] max-w-[60ch] text-[21px] leading-[29px] font-extrabold tracking-[-0.015em]" style={{ fontFamily: "var(--font-display)" }}>
          {direction.goal}
        </p>
        <p className="mt-[8px] max-w-[62ch] text-[14px] leading-[21px]" style={{ color: "var(--ink-soft)" }}>
          Leaning toward <strong style={{ color: "var(--ink)" }}>{career.title}</strong> by the {route.short.toLowerCase()} route: {route.duration}, {route.cost.split(",")[0]}.
        </p>
      </section>

      <section className="mt-[24px] border-t pt-[16px]" style={{ borderColor: "var(--rule)" }} data-keep-together>
        <h3 className="text-[12px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>My careers, side by side</h3>
        <table className="mt-[10px] w-full border-collapse text-left">
          <thead>
            <tr>
              {["Career", "Education", "Time", "Pay starting out", "Where I am"].map((head) => (
                <th key={head} scope="col" className="border-b pb-[6px] pr-[12px] text-[12px] font-bold tracking-[1px] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ career: item, report }) => (
              <tr key={item.id}>
                <td className="border-b py-[9px] pr-[12px] align-top text-[14px] leading-[19px] font-extrabold" style={{ borderColor: "var(--rule)", fontFamily: "var(--font-display)" }}>{item.title}</td>
                <td className="border-b py-[9px] pr-[12px] align-top text-[12.5px] leading-[18px]" style={{ borderColor: "var(--rule)" }}>{report.comparison.education}</td>
                <td className="border-b py-[9px] pr-[12px] align-top text-[12.5px] leading-[18px] tabular-nums" style={{ borderColor: "var(--rule)" }}>{report.comparison.timeToEnter}</td>
                <td className="border-b py-[9px] pr-[12px] align-top text-[12.5px] leading-[18px] tabular-nums" style={{ borderColor: "var(--rule)" }}>{report.comparison.salaryRange}</td>
                <td className="border-b py-[9px] align-top text-[12.5px] leading-[18px]" style={{ borderColor: "var(--rule)" }}>{report.comparison.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-[24px] grid gap-x-[36px] gap-y-[22px] border-t pt-[16px] sm:grid-cols-2" style={{ borderColor: "var(--rule)" }}>
        <section className="sm:col-span-2" data-keep-together>
          <h3 className="text-[12px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>What I am unsure about</h3>
          <p className="mt-[7px] text-[15px] leading-[23px]">{direction.question}</p>
        </section>
        <section className="sm:col-span-2" data-keep-together>
          <h3 className="text-[12px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>Next actions</h3>
          <ul className="mt-[7px] grid list-none gap-x-[28px] p-0 sm:grid-cols-2">
            {actions.map((action) => (
              <li key={action.label} className="flex items-start gap-[9px] border-b py-[7px] text-[13.5px] leading-[19px]" style={{ borderColor: "var(--rule)" }}>
                <span aria-hidden className="mt-[2px] flex size-[14px] flex-none items-center justify-center border text-[12px] font-bold" style={{ borderColor: "var(--rule-strong)" }}>{action.done ? "x" : ""}</span>
                <span style={{ textDecoration: action.done ? "line-through" : "none" }}>{action.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-[22px] border-t pt-[12px] text-[12px] leading-[15px]" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>
        Prepared by the student with Dreamari. Pay and outlook from the U.S. Bureau of Labor Statistics; college figures from the College Scorecard.
        This supports a conversation about options. It is not a decision, a prediction, or a guarantee.
      </p>
    </div>
  );
}


export type ReportViewProps = {
  student: { name: string; grade: string; school: string };
  career: ProfileCareer;
  route: PathwayRoute;
  top3: ProfileCareer[];
  stage: PathwayStage;
  direction: StudentDirection;
  onReflectionChange: (value: string) => void;
  doneActions: Set<string>;
  onToggleAction: (id: string) => void;
  onSwitchCareer: (id: string) => void;
  savedMajors: Set<string>;
  onToggleMajor: (name: string) => void;
  onOpenShare: () => void;
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
  return (
    <article
      data-doc="full"
      className="dm-report overflow-hidden rounded-[var(--radius-2xl)] px-[var(--space-6)] py-[var(--space-8)] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)] sm:px-[var(--space-10)] sm:py-[var(--space-12)]"
    >
      <div className="mx-auto max-w-[68ch]">
        {/* Masthead */}
        <header data-print-keep>
          <p className="text-[30px] leading-[33px] font-extrabold uppercase sm:text-[42px] sm:leading-[45px]" style={{ fontFamily: "var(--font-display)", color: "var(--ink-faint)", letterSpacing: "0.004em" }}>
            Career &amp; Pathway Report
          </p>
          <h2 className="mt-[2px] text-[30px] leading-[33px] font-extrabold tracking-[-0.022em] sm:text-[42px] sm:leading-[45px]" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>{student.name}</h2>
          <p className="mt-[18px] flex flex-wrap items-center gap-x-[22px] gap-y-[5px] border-t pt-[14px] text-[17px] leading-[24px] font-bold tracking-[-0.012em]" style={{ borderColor: "var(--rule-strong)", color: "var(--ink)" }}>
            <span>{`${ordinal(student.grade.replace(/\D/g, ""))} Grade`}</span>
            {ACADEMIC_RECORD.verified && (
              <span>
                {`${ACADEMIC_RECORD.gpa} GPA`}
                <BadgeCheck className="ml-[5px] inline h-[15px] w-[15px] align-[-2px]" aria-hidden />
                <span className="sr-only">verified by {ACADEMIC_RECORD.source}, {ACADEMIC_RECORD.updated}</span>
              </span>
            )}
            <span>{student.school}</span>
            <span className="tabular-nums">{reportDate}</span>
          </p>
        </header>

        {/* 01 — At a Glance. Four facts, exactly the reference's set. */}
        <ReportSection id={`${idPrefix}glance`} n={1} title={`${career.title} at a Glance`}>
          <dl className="grid gap-x-[40px] gap-y-[2px] sm:grid-cols-2" data-keep-together>
            <Fact icon={Target} label="What You Do" value={report.glance.whatYouDo} />
            <Fact icon={MapPin} label="Potential Employers" value={report.glance.employers.slice(0, 3).join(", ")} />
            <Fact icon={DollarSign} label="U.S. Median Salary" value={`${report.salary.median} a year`} />
            <Fact icon={GraduationCap} label="Education" value={report.glance.education} />
          </dl>
          <Link
            href="/explore?tab=browse"
            data-print-hide
            className="dm-tap mt-[24px] inline-flex min-h-[46px] items-center gap-[8px] rounded-[10px] border px-[18px] text-[16px] font-bold tracking-[-0.012em]"
            style={{ borderColor: "var(--rule-strong)", color: "var(--ink)", background: "var(--paper-raised)" }}
          >
            <Compass className="h-4 w-4" aria-hidden /> See full career details
          </Link>
        </ReportSection>

        {/* 02 — Three Majors to Explore */}
        <ReportSection id={`${idPrefix}majors`} n={2} title="Three Majors to Explore">
          <div className="grid gap-[12px] sm:grid-cols-3" data-keep-together>
            {report.majors.map((major) => (
              <div key={major.name} className="rounded-[10px] border px-[16px] py-[15px]" style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)" }}>
                <h4 className="text-[18px] leading-[23px] font-extrabold tracking-[-0.012em]" style={{ color: "var(--ink)" }}>{major.name}</h4>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* 03 — Education */}
        <ReportSection id={`${idPrefix}education`} n={3} title="Education">
          <div className="flex flex-col gap-[20px]" data-keep-together>
            <div>
              <h4 className="text-[18px] leading-[23px] font-extrabold tracking-[-0.012em]" style={{ color: "var(--ink)" }}>Most Common Path</h4>
              <p className="mt-[5px] max-w-[50ch] text-[17px] leading-[24px] tracking-[-0.012em]" style={{ color: "var(--ink-soft)" }}>
                {report.education.find((route) => route.common)?.name}
              </p>
            </div>
            <div className="border-t pt-[16px]" style={{ borderColor: "var(--rule)" }}>
              <h4 className="text-[18px] leading-[23px] font-extrabold tracking-[-0.012em]" style={{ color: "var(--ink)" }}>Other Viable Pathways</h4>
              <ul className="mt-[10px] flex list-none flex-wrap gap-[8px] p-0">
                {report.education.filter((route) => !route.common).map((route) => (
                  <li key={route.name}>
                    <span className="inline-flex items-baseline gap-[7px] rounded-full border px-[13px] py-[7px]" style={{ borderColor: "var(--rule-strong)" }}>
                      <span className="text-[15px] leading-[21px] font-bold">{route.name}</span>
                      <span className="text-[15px] leading-[21px] tabular-nums" style={{ color: "var(--ink-faint)" }}>{route.time}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ReportSection>

        {/* 04 — Colleges */}
        <ReportSection id={`${idPrefix}colleges`} n={4} title="Colleges">
          <div className="grid gap-[12px] sm:grid-cols-2">
            {report.colleges.map((college) => (
              <Link
                key={college.name}
                href={`/colleges?school=${encodeURIComponent(college.name)}`}
                className="dm-tap flex flex-col gap-[4px] rounded-[10px] border px-[16px] py-[14px]"
                style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)" }}
                data-keep-together
              >
                <div className="flex items-start justify-between gap-[10px]">
                  <h4 className="min-w-0 text-[18px] leading-[23px] font-extrabold tracking-[-0.012em]" style={{ color: "var(--ink)" }}>{college.name}</h4>
                  <span className="flex-none rounded-[5px] border px-[7px] py-[2px] text-[14px]" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)", background: "var(--paper-sunken)" }}>
                    {college.status}
                  </span>
                </div>
                <p className="mt-[3px] text-[15px] leading-[21px]" style={{ color: "var(--ink-soft)" }}>{college.why}</p>
                <span data-print-hide className="mt-[6px] inline-flex items-center gap-[4px] text-[15px]" style={{ color: "var(--ink-faint)" }}>
                  Look this up <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/colleges"
            data-print-hide
            className="dm-solid mt-[20px] inline-flex min-h-[46px] items-center gap-[8px] rounded-[10px] px-[20px] text-[16px] font-bold tracking-[-0.012em]"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            <Search className="h-4 w-4" aria-hidden /> Open College Lookup
          </Link>
        </ReportSection>

        {/* Sources: a footer, not a section a student has to open */}
        <footer className="mt-[52px] border-t pt-[16px]" style={{ borderColor: "var(--rule-strong)" }}>
          <h4 className="text-[18px] leading-[23px] font-extrabold tracking-[-0.012em]" style={{ color: "var(--ink)" }}>Where this comes from</h4>
          <ul className="mt-[10px] flex list-none flex-col gap-[5px] p-0 text-[15px] leading-[22px]" style={{ color: "var(--ink-faint)" }}>
            {report.sources.map((source) => (
              <li key={source.url + source.label}>
                {source.label} — {source.org}, {source.year}. Checked {source.verified}.{" "}
                <SourceLink url={source.url}>Open</SourceLink>
              </li>
            ))}
          </ul>
          <p className="mt-[12px] max-w-[64ch] text-[15px] leading-[22px]" style={{ color: "var(--ink-faint)" }}>
            Prepared by the student with Dreamari. It supports a conversation with a counselor; it is not a decision or a prediction.
            Employers are examples of who hires for this work, not job openings.
            Reach, Target and Safety are indicative bands to guide research, not predictions of admission. Salary figures describe people already
            working in the job. Pay, programs and admission requirements change, so treat everything here as a starting point for a conversation
            rather than a guarantee.
          </p>
        </footer>
      </div>

      {/* Running footer: repeats on every printed page */}
      <div className="dm-print-footer" aria-hidden>
        {student.name} · Career &amp; Pathway Report · {reportDate} · v1.0 · Prepared with Dreamari
      </div>
    </article>
  );
}

export { ComparisonTable };

export function CareerReportView(props: ReportViewProps) {
  const { student, career, route, top3, direction, doneActions } = props;
  const report = reportV2(career.id);
  const [tocOpen, setTocOpen] = useState(false);
  const [preview, setPreview] = useState<null | "full" | "summary">(null);
  const [active, setActive] = useState<string>("glance");
  const tocButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    REPORT_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [career.id]);

  const reportDate = "Aug 22, 2026";

  const entries = useMemo(
    () => top3.map((item) => ({ career: item, report: reportV2(item.id) })).filter((entry): entry is { career: ProfileCareer; report: CareerReportV2 } => Boolean(entry.report)),
    [top3],
  );


  if (!report) {
    return (
      <div className="rounded-[var(--radius-2xl)] border p-[var(--space-8)] text-center" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">No report yet for {career.title}</p>
        <p className="mt-[6px] text-[13px]" style={{ color: "var(--muted-foreground)" }}>Play a simulation or save it from Explore and the report will build itself.</p>
      </div>
    );
  }

  const jump = (id: string) => {
    setTocOpen(false);
    setActive(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const print = (doc: "full" | "summary") => {
    document.body.setAttribute("data-print", doc);
    const cleanup = () => {
      document.body.removeAttribute("data-print");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 1500);
  };

  const actionList = report.actions.map((action) => ({ label: action.label, done: doneActions.has(action.id) }));

  return (
    <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-start lg:gap-[var(--space-8)]">
      {/* Contextual table of contents — desktop only, beside the page */}
      <nav aria-label="Report contents" data-print-hide className="no-print sticky top-[16px] hidden w-[190px] flex-none lg:block">
        <p className="pb-[10px] text-[12px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Contents</p>
        <ol className="flex list-none flex-col gap-[1px] p-0">
          {REPORT_SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => jump(section.id)}
                aria-current={active === section.id ? "true" : undefined}
                className="flex w-full cursor-pointer items-baseline gap-[8px] rounded-[var(--radius-md)] px-[8px] py-[7px] text-left text-[12.5px] leading-[17px] font-bold"
                style={{ background: active === section.id ? "var(--glass-surface-2)" : "transparent", color: active === section.id ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                <span className="text-[12px] tabular-nums" style={{ color: "var(--accent-subtle)" }}>{String(section.n).padStart(2, "0")}</span>
                {section.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-w-0 flex-1">
        {/* Document controls — app chrome, never printed */}
        <div data-print-hide className="no-print mb-[var(--space-4)] flex flex-wrap items-center gap-[var(--space-2)]">
          <button type="button" onClick={() => setTocOpen(true)} ref={tocButtonRef} className="flex min-h-[44px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[12.5px] font-bold lg:hidden" style={{ borderColor: "var(--border)" }}>
            <List className="h-4 w-4" aria-hidden /> Contents
          </button>
          <button type="button" onClick={() => setPreview("full")} className="flex min-h-[44px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[12.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Printer className="h-4 w-4" aria-hidden /> Export
          </button>
          <button type="button" onClick={props.onOpenShare} className="flex min-h-[44px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[12.5px] font-bold" style={{ borderColor: "var(--border)" }}>
            <Send className="h-4 w-4" aria-hidden /> Share
          </button>
          <span className="order-first w-full text-[11.5px] font-bold sm:order-none sm:ml-auto sm:w-auto" style={{ color: "var(--muted-foreground)" }}>Updated {props.updatedLabel}</span>
        </div>

        {/* ---------------- The document ---------------- */}
        <ReportDocument student={student} career={career} report={report} reportDate={reportDate} />

        {/* One-page meeting summary, print-only unless previewed */}
        <MeetingSummary
          student={student} career={career} entries={entries} direction={direction}
          actions={actionList} route={route} reportDate={reportDate}
        />
        <div className="dm-print-footer" aria-hidden>
          {student.name} · Meeting summary · {reportDate} · v1.0
        </div>
      </div>

      {/* Mobile contents drawer — replaces the horizontally scrolling rail */}
      {tocOpen && (
        <div data-print-hide className="no-print fixed inset-0 z-[100] lg:hidden">
          <button type="button" aria-label="Close contents" onClick={() => setTocOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)", backdropFilter: "blur(6px)" }} />
          <div role="dialog" aria-label="Report contents" className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-[var(--radius-2xl)] border-t px-5 pt-[var(--space-5)] pb-[calc(env(safe-area-inset-bottom)+var(--space-6))]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-center justify-between pb-[var(--space-3)]">
              <h3 className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Contents</h3>
              <button type="button" onClick={() => setTocOpen(false)} className="flex size-[44px] cursor-pointer items-center justify-center rounded-full" aria-label="Close contents">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ol className="flex list-none flex-col p-0">
              {REPORT_SECTIONS.map((section) => (
                <li key={section.id}>
                  <button type="button" onClick={() => jump(section.id)} className="flex min-h-[48px] w-full cursor-pointer items-center gap-[12px] border-b text-left text-[15px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
                    <span className="text-[11px] tabular-nums" style={{ color: "var(--accent-subtle)" }}>{String(section.n).padStart(2, "0")}</span>
                    {section.label}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Export preview: pick the document, see it, then print */}
      {preview && (
        <div data-print-hide className="no-print fixed inset-0 z-[110] flex flex-col" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", backdropFilter: "blur(8px)" }}>
          <div className="flex flex-wrap items-center gap-[var(--space-2)] border-b px-5 py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className="mr-auto text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Export preview</h3>
            <div role="radiogroup" aria-label="Which document" className="flex gap-[3px] rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)" }}>
              {([["full", "Full report"], ["summary", "One-page summary"]] as const).map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={preview === value} onClick={() => setPreview(value)} className="min-h-[38px] cursor-pointer rounded-full px-[14px] text-[12px] font-bold" style={{ background: preview === value ? "var(--primary)" : "transparent", color: preview === value ? "var(--primary-foreground)" : "var(--foreground)" }}>
                  {label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => print(preview)} className="flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[12.5px] font-bold" style={{ background: "var(--foreground)", color: "var(--background)" }}>
              <Printer className="h-4 w-4" aria-hidden /> Print or save PDF
            </button>
            <button type="button" onClick={() => setPreview(null)} className="flex size-[44px] cursor-pointer items-center justify-center rounded-full" aria-label="Close preview">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5" data-preview={preview}>
            <p className="mx-auto mb-[var(--space-3)] max-w-[820px] text-[11.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>
              {preview === "full"
                ? "This is the document exactly as it will print: US Letter, no app navigation, nothing hidden. Page numbers come from your browser's print settings."
                : "One page, sized for US Letter. Your goal, your top careers, what you are unsure about, your questions and your next actions."}
            </p>
            {/* Paper proxy: sized near US Letter's printable width. */}
            <div className="mx-auto max-w-[816px] overflow-hidden rounded-[6px] shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]">
              {preview === "summary" ? (
                <MeetingSummary
                  student={student} career={career} entries={entries} direction={direction}
                  actions={actionList} route={route} reportDate={reportDate}
                />
              ) : (
                <ReportDocument student={student} career={career} report={report} reportDate={reportDate} idPrefix="preview-" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
