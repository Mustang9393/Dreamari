"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, DollarSign, ExternalLink, GraduationCap, List, MapPin, Plus, Printer, Send, Target, X } from "lucide-react";
import type { ProfileCareer, PathwayRoute } from "./data";
import {
  ACADEMIC_RECORD,
  PATHWAY_STAGES,
  reportV2,
  type CareerReportV2,
  type CounselorQuestion,
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

// Scoped to what the report has to say. The action plan and the counselor
// questions moved to My Plan, where a student works; the report is the
// document they hand over.
export const REPORT_SECTIONS = [
  { id: "glance", n: 1, label: "At a Glance" },
  { id: "majors", n: 2, label: "Three Majors" },
  { id: "education", n: 3, label: "Education" },
  { id: "colleges", n: 4, label: "Colleges" },
] as const;


function SourceLink({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" data-print-url={url} className="inline-flex items-center gap-[3px] font-semibold underline decoration-[color:var(--rule-strong)] underline-offset-2" style={{ color: "var(--ink)" }}>
      {children} <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}

// A numbered report section. Nothing here collapses: the export has to carry
// everything, and a dropdown is exactly how information goes missing from a
// printed document.
function ReportSection({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[84px] pt-[46px]">
      <div className="flex items-baseline gap-[12px] sm:gap-[16px]">
        <span aria-hidden className="dm-report-num flex-none text-[13px] font-bold tabular-nums sm:text-[15px]">{String(n).padStart(2, "0")}</span>
        <h3 id={`${id}-title`} className="text-[26px] leading-[30px] font-extrabold tracking-[-0.03em] text-balance sm:text-[32px] sm:leading-[35px]" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h3>
      </div>
      <div className="mt-[16px] border-t pt-[18px]" style={{ borderColor: "var(--rule-strong)" }}>
        {children}
      </div>
    </section>
  );
}

// Majors keep the reference's colour coding, drawn from our accent tokens.
const MAJOR_INK = ["var(--primary)", "#1f7a52", "#6d4ab8"];

function Fact({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: typeof Check }) {
  return (
    <div className="flex gap-[12px] py-[13px]">
      {Icon && <Icon className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: "var(--ink-faint)" }} aria-hidden />}
      <div className="min-w-0">
        <dt className="text-[10px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>{label}</dt>
        <dd className="mt-[3px] text-[14.5px] leading-[21px]" style={{ color: "var(--ink)" }}>{value}</dd>
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
                  {career.id === focusId && <span className="ml-[6px] align-middle text-[10px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>· current</span>}
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
              {career.id === focusId && <span className="ml-[6px] text-[10px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>· current</span>}
            </h4>
            <dl className="mt-[6px] divide-y" style={{ borderColor: "var(--rule)" }}>
              {COMPARE_FIELDS.map((field) => (
                <div key={field.key} className="grid grid-cols-[104px_minmax(0,1fr)] gap-[10px] border-t py-[8px]" style={{ borderColor: "var(--rule)" }}>
                  <dt className="text-[10.5px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--ink-faint)" }}>{field.label}</dt>
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
  questions,
  actions,
  route,
  stageLabel,
  reportDate,
}: {
  student: { name: string; grade: string; school: string };
  career: ProfileCareer;
  entries: { career: ProfileCareer; report: CareerReportV2 }[];
  direction: StudentDirection;
  questions: CounselorQuestion[];
  actions: { label: string; done: boolean }[];
  route: PathwayRoute;
  stageLabel: string;
  reportDate: string;
}) {
  return (
    <div data-doc="summary" className="dm-report px-[var(--space-6)] py-[var(--space-8)] sm:px-[var(--space-10)]">
      <header className="flex flex-wrap items-end justify-between gap-[var(--space-3)] border-b pb-[10px]" style={{ borderColor: "var(--rule-strong)" }}>
        <div>
          <p className="text-[10.5px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--ink-faint)" }}>Meeting summary · one page</p>
          <h2 className="mt-[3px] text-[24px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{student.name}</h2>
        </div>
        <p className="text-[11.5px] leading-[16px]" style={{ color: "var(--ink-faint)" }}>
          {student.grade} · {student.school}<br />
          {reportDate} · Stage: {stageLabel}
        </p>
      </header>

      <div className="grid gap-x-[28px] gap-y-[14px] pt-[14px] sm:grid-cols-2">
        <section data-keep-together>
          <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--ink-faint)" }}>My goal</h3>
          <p className="mt-[3px] text-[13.5px] leading-[19px]">{direction.goal}</p>
        </section>
        <section data-keep-together>
          <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--ink-faint)" }}>Leaning toward</h3>
          <p className="mt-[3px] text-[13.5px] leading-[19px]">{career.title} · {route.short} ({route.duration}, {route.cost.split(",")[0]})</p>
        </section>
        <section className="sm:col-span-2" data-keep-together>
          <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--ink-faint)" }}>My top {entries.length}, in short</h3>
          <table className="mt-[5px] w-full border-collapse text-left text-[12px]">
            <thead>
              <tr>
                {["Career", "Education", "Time", "Pay starting out", "Where I am"].map((h) => (
                  <th key={h} scope="col" className="border-b pb-[4px] pr-[10px] text-[10px] font-bold tracking-[0.5px] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(({ career: item, report }) => (
                <tr key={item.id}>
                  <td className="border-b py-[5px] pr-[10px] font-bold" style={{ borderColor: "var(--rule)" }}>{item.title}</td>
                  <td className="border-b py-[5px] pr-[10px]" style={{ borderColor: "var(--rule)" }}>{report.comparison.education}</td>
                  <td className="border-b py-[5px] pr-[10px]" style={{ borderColor: "var(--rule)" }}>{report.comparison.timeToEnter}</td>
                  <td className="border-b py-[5px] pr-[10px]" style={{ borderColor: "var(--rule)" }}>{report.comparison.salaryRange}</td>
                  <td className="border-b py-[5px]" style={{ borderColor: "var(--rule)" }}>{report.comparison.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section data-keep-together>
          <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--ink-faint)" }}>What I am unsure about</h3>
          <p className="mt-[3px] text-[13.5px] leading-[19px]">{direction.question}</p>
        </section>
        <section data-keep-together>
          <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--ink-faint)" }}>Questions I want to ask</h3>
          <ol className="mt-[3px] list-decimal pl-[16px] text-[13px] leading-[19px]">
            {questions.map((question) => <li key={question.id}>{question.text}</li>)}
          </ol>
        </section>
        <section className="sm:col-span-2" data-keep-together>
          <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--ink-faint)" }}>Next actions</h3>
          <ul className="mt-[3px] list-none pl-0 text-[13px] leading-[20px]">
            {actions.map((action) => (
              <li key={action.label}>{action.done ? "[x]" : "[ ]"} {action.label}</li>
            ))}
          </ul>
        </section>
        <section className="sm:col-span-2 border-t pt-[10px]" style={{ borderColor: "var(--rule)" }}>
          <p className="text-[10.5px] leading-[15px]" style={{ color: "var(--ink-faint)" }}>
            Prepared by the student with Dreamari. Pay and outlook figures come from the U.S. Bureau of Labor Statistics; college figures from the College Scorecard. This summary supports a conversation about options. It is not a decision, a prediction, or a guarantee.
          </p>
        </section>
      </div>
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
  questions: CounselorQuestion[];
  onAddQuestion: (text: string) => void;
  onRemoveQuestion: (id: string) => void;
  doneActions: Set<string>;
  onToggleAction: (id: string) => void;
  onSwitchCareer: (id: string) => void;
  savedMajors: Set<string>;
  onToggleMajor: (name: string) => void;
  onOpenShare: () => void;
  onOpenEvidence: () => void;
  updatedLabel: string;
};

export { ComparisonTable };

export function CareerReportView(props: ReportViewProps) {
  const { student, career, route, top3, stage, direction, questions, doneActions, savedMajors } = props;
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

  const reportDate = "August 22, 2026";
  const stageLabel = PATHWAY_STAGES.find((item) => item.id === stage)?.label ?? "Explore";

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
        <p className="pb-[10px] text-[10px] font-bold tracking-[1.4px] uppercase" style={{ color: "var(--accent-subtle)" }}>Contents</p>
        <ol className="flex list-none flex-col gap-[1px] p-0">
          {REPORT_SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => jump(section.id)}
                aria-current={active === section.id ? "true" : undefined}
                className="flex w-full cursor-pointer items-baseline gap-[8px] rounded-[var(--radius-md)] px-[8px] py-[7px] text-left text-[12.5px] leading-[17px] font-semibold"
                style={{ background: active === section.id ? "var(--glass-surface-2)" : "transparent", color: active === section.id ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                <span className="text-[10px] tabular-nums" style={{ color: "var(--accent-subtle)" }}>{String(section.n).padStart(2, "0")}</span>
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
          <button type="button" onClick={props.onOpenShare} className="flex min-h-[44px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[12.5px] font-semibold" style={{ borderColor: "var(--border)" }}>
            <Send className="h-4 w-4" aria-hidden /> Share
          </button>
          <span className="ml-auto text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Updated {props.updatedLabel}</span>
        </div>

        {/* ---------------- The document ---------------- */}
        <article
          data-doc="full"
          className="dm-report overflow-hidden rounded-[var(--radius-2xl)] px-[var(--space-5)] py-[var(--space-7)] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)] sm:px-[var(--space-10)] sm:py-[var(--space-10)]"
        >
          <div className="mx-auto max-w-[68ch]">
            {/* Masthead */}
            <header data-print-keep>
              <p className="text-[10.5px] font-bold tracking-[2px] uppercase" style={{ color: "var(--ink-faint)" }}>Career &amp; Pathway Report</p>
              <h2 className="mt-[12px] text-[44px] leading-[44px] font-extrabold tracking-[-0.04em] sm:text-[64px] sm:leading-[62px]" style={{ fontFamily: "var(--font-display)" }}>
                {student.name}
              </h2>
              <p className="mt-[12px] text-[17px] leading-[24px]" style={{ color: "var(--ink-soft)" }}>
                {student.grade} · {student.school}
              </p>
              <dl className="mt-[18px] grid grid-cols-2 gap-x-[20px] border-t pt-[12px] sm:grid-cols-4" style={{ borderColor: "var(--rule)" }}>
                <Fact label="Report date" value={reportDate} />
                <Fact label="Last updated" value={props.updatedLabel} />
                <Fact label="Stage" value={stageLabel} />
                {ACADEMIC_RECORD.verified && (
                  <Fact
                    label="GPA"
                    value={
                      <>
                        {ACADEMIC_RECORD.gpa}
                        <span className="block text-[10.5px] leading-[14px]" style={{ color: "var(--ink-faint)" }}>
                          {ACADEMIC_RECORD.scale} · verified by {ACADEMIC_RECORD.source}, {ACADEMIC_RECORD.updated}
                        </span>
                      </>
                    }
                  />
                )}
              </dl>
              <p className="mt-[14px] text-[11.5px] leading-[16px]" style={{ color: "var(--ink-faint)" }}>
                Prepared by the student with Dreamari. It supports a conversation with a counselor. It is not a decision or a prediction.
              </p>
            </header>

            {/* 01 — At a Glance. Four facts, exactly the reference's set. */}
            <ReportSection id="glance" n={1} title={`${career.title} at a Glance`}>
              <dl className="grid gap-x-[40px] gap-y-[2px] sm:grid-cols-2" data-keep-together>
                <Fact icon={Target} label="What You Do" value={report.glance.whatYouDo} />
                <Fact
                  icon={MapPin}
                  label="Potential Employers"
                  value={
                    <>
                      {report.glance.employers.slice(0, 3).join(", ")}
                      <span className="mt-[4px] block text-[11.5px] leading-[16px]" style={{ color: "var(--ink-faint)" }}>
                        Examples of companies that hire for this work, not job openings.
                      </span>
                    </>
                  }
                />
                <div className="flex gap-[12px] py-[13px]">
                  <DollarSign className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: "var(--ink-faint)" }} aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>U.S. Median Salary</dt>
                    <dd className="mt-[2px] flex items-baseline gap-[5px]">
                      <span className="text-[38px] leading-[40px] font-extrabold tracking-[-0.04em] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{report.salary.median}</span>
                      <span className="text-[15px] font-bold" style={{ color: "var(--ink-faint)" }}>/yr</span>
                    </dd>
                    <dd className="mt-[2px] text-[11.5px] leading-[16px]" style={{ color: "var(--ink-faint)" }}>
                      {report.salary.source.org}, {report.salary.source.year}
                    </dd>
                  </div>
                </div>
                <Fact icon={GraduationCap} label="Education" value={report.glance.education} />
              </dl>
            </ReportSection>

            {/* 02 — Three Majors to Explore */}
            <ReportSection id="majors" n={2} title="Three Majors to Explore">
              <div className="grid gap-[12px] sm:grid-cols-3" data-keep-together>
                {report.majors.map((major, index) => (
                  <div key={major.name} className="flex flex-col gap-[6px] rounded-[10px] border px-[16px] py-[15px]" style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)" }}>
                    <div className="flex items-start justify-between gap-[8px]">
                      <h4 className="text-[17px] leading-[22px] font-extrabold tracking-[-0.015em]" style={{ fontFamily: "var(--font-display)", color: MAJOR_INK[index % MAJOR_INK.length] }}>{major.name}</h4>
                      <button
                        type="button"
                        data-print-hide
                        aria-pressed={savedMajors.has(major.name)}
                        aria-label={savedMajors.has(major.name) ? `${major.name} saved` : `Save ${major.name}`}
                        onClick={() => props.onToggleMajor(major.name)}
                        className="-mr-[6px] -mt-[6px] flex size-[32px] flex-none cursor-pointer items-center justify-center rounded-full"
                      >
                        {savedMajors.has(major.name) ? <Check className="h-4 w-4" style={{ color: "var(--ink)" }} aria-hidden /> : <Plus className="h-4 w-4" style={{ color: "var(--ink-faint)" }} aria-hidden />}
                      </button>
                    </div>
                    <p className="text-[12.5px] leading-[18px]" style={{ color: "var(--ink-soft)" }}>{major.teaches}</p>
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* 03 — Education */}
            <ReportSection id="education" n={3} title="Education">
              <div className="flex flex-col gap-[20px]" data-keep-together>
                <div>
                  <h4 className="text-[10px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>Most Common Path</h4>
                  <p className="mt-[6px] max-w-[52ch] text-[19px] leading-[27px] font-semibold tracking-[-0.015em]" style={{ fontFamily: "var(--font-display)" }}>
                    {report.education.find((route) => route.common)?.name}
                  </p>
                </div>
                <div className="border-t pt-[16px]" style={{ borderColor: "var(--rule)" }}>
                  <h4 className="text-[10px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>Other Viable Pathways</h4>
                  <ul className="mt-[10px] flex list-none flex-wrap gap-[8px] p-0">
                    {report.education.filter((route) => !route.common).map((route) => (
                      <li key={route.name}>
                        <span className="inline-flex items-baseline gap-[7px] rounded-full border px-[13px] py-[7px]" style={{ borderColor: "var(--rule-strong)" }}>
                          <span className="text-[13px] font-bold">{route.name}</span>
                          <span className="text-[11px] tabular-nums" style={{ color: "var(--ink-faint)" }}>{route.time}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ReportSection>

            {/* 04 — Colleges */}
            <ReportSection id="colleges" n={4} title="Colleges">
              <div className="grid gap-[12px] sm:grid-cols-2">
                {report.colleges.map((college) => (
                  <div key={college.name} className="flex flex-col gap-[4px] rounded-[10px] border px-[16px] py-[14px]" style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)" }} data-keep-together>
                    <div className="flex items-start justify-between gap-[10px]">
                      <h4 className="min-w-0 text-[16px] leading-[21px] font-extrabold tracking-[-0.015em]" style={{ fontFamily: "var(--font-display)" }}>{college.name}</h4>
                      <span className="flex-none rounded-[5px] border px-[7px] py-[2px] text-[9.5px] font-bold tracking-[0.7px] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)", background: "var(--paper-sunken)" }}>
                        {college.status}
                      </span>
                    </div>
                    <p className="text-[12.5px] leading-[18px]" style={{ color: "var(--ink-soft)" }}>{college.why}</p>
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* Sources: a footer, not a section a student has to open */}
            <footer className="mt-[52px] border-t pt-[16px]" style={{ borderColor: "var(--rule-strong)" }}>
              <h4 className="text-[10px] font-bold tracking-[1.3px] uppercase" style={{ color: "var(--ink-faint)" }}>Where this comes from</h4>
              <ul className="mt-[8px] flex list-none flex-col gap-[3px] p-0 text-[11.5px] leading-[17px]" style={{ color: "var(--ink-faint)" }}>
                {report.sources.map((source) => (
                  <li key={source.url + source.label}>
                    {source.label} — {source.org}, {source.year}. Checked {source.verified}.{" "}
                    <SourceLink url={source.url}>Open</SourceLink>
                  </li>
                ))}
              </ul>
              <p className="mt-[10px] max-w-[70ch] text-[11.5px] leading-[17px]" style={{ color: "var(--ink-faint)" }}>
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

        {/* One-page meeting summary, print-only unless previewed */}
        <MeetingSummary
          student={student} career={career} entries={entries} direction={direction}
          questions={questions} actions={actionList} route={route} stageLabel={stageLabel} reportDate={reportDate}
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
                  <button type="button" onClick={() => jump(section.id)} className="flex min-h-[48px] w-full cursor-pointer items-center gap-[12px] border-b text-left text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
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
                ? "The export opens every section, drops the app navigation, and prints on US Letter. Page numbers come from your browser's print settings."
                : "One page, sized for US Letter. Goal, top three, where you are, what you are unsure about, your questions and your next actions."}
            </p>
            <div className="mx-auto max-w-[820px] overflow-hidden rounded-[var(--radius-xl)]">
              {preview === "summary" ? (
                <MeetingSummary
                  student={student} career={career} entries={entries} direction={direction}
                  questions={questions} actions={actionList} route={route} stageLabel={stageLabel} reportDate={reportDate}
                />
              ) : (
                <div className="dm-report px-[var(--space-6)] py-[var(--space-6)] text-[13px] leading-[19px]">
                  <p className="text-[10.5px] font-bold tracking-[1.6px] uppercase" style={{ color: "var(--ink-faint)" }}>Career &amp; Pathway Report</p>
                  <p className="mt-[6px] text-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{student.name}</p>
                  <p className="mt-[2px]" style={{ color: "var(--ink-soft)" }}>{student.grade} · {student.school} · {reportDate}</p>
                  <ol className="mt-[14px] flex list-none flex-col p-0">
                    {REPORT_SECTIONS.map((section) => (
                      <li key={section.id} className="flex items-baseline gap-[10px] border-t py-[7px]" style={{ borderColor: "var(--rule)" }}>
                        <span className="dm-report-num text-[11px] font-bold">{String(section.n).padStart(2, "0")}</span>
                        <span className="font-semibold">{section.label}</span>
                        <span className="ml-auto text-[11px]" style={{ color: "var(--ink-faint)" }}>included, fully expanded</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
