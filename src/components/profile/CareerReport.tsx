"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ExternalLink, List, Plus, Printer, Send, X } from "lucide-react";
import type { ProfileCareer, PathwayRoute } from "./data";
import {
  ACADEMIC_RECORD,
  EVIDENCE,
  PATHWAY_STAGES,
  SUGGESTED_QUESTIONS,
  reportV2,
  type CareerReportV2,
  type CollegeStatus,
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

export const REPORT_SECTIONS = [
  { id: "direction", n: 1, label: "My direction" },
  { id: "glance", n: 2, label: "At a glance" },
  { id: "salary", n: 3, label: "Pay and outlook" },
  { id: "education", n: 4, label: "How people get in" },
  { id: "majors", n: 5, label: "Majors to consider" },
  { id: "colleges", n: 6, label: "Colleges to research" },
  { id: "actions", n: 7, label: "What I do next" },
  { id: "questions", n: 8, label: "For my counselor" },
  { id: "sources", n: 9, label: "Sources and limits" },
] as const;

const STATUS_NOTE: Record<CollegeStatus, string> = {
  Saved: "You saved this one.",
  Explore: "Worth a look, you have not saved it yet.",
  "Check requirements": "Admission has an extra step. Read it before applying.",
  "Discuss with counselor": "Bring this one to a conversation before counting on it.",
};

function Rule() {
  return <hr className="my-0 border-0 border-t" style={{ borderColor: "var(--rule)" }} />;
}

// Editorial side note: sources and caveats live beside the claim, not in a
// footnote nobody reads.
function SideNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 pl-3 text-[11.5px] leading-[16px]" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>
      {children}
    </p>
  );
}

function SourceLink({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" data-print-url={url} className="inline-flex items-center gap-[3px] font-semibold underline decoration-[color:var(--rule-strong)] underline-offset-2" style={{ color: "var(--ink)" }}>
      {children} <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}

// A numbered report section. `summary` is what a first scan gets; `children`
// is the detail, kept in the DOM while collapsed so print can reveal it.
function Section({
  id,
  n,
  title,
  standfirst,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  n: number;
  title: string;
  standfirst?: string;
  summary?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const panelId = `${id}-detail`;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[84px] pt-[38px]">
      <Rule />
      <div className="flex gap-[14px] pt-[18px] sm:gap-[22px]">
        <span aria-hidden className="dm-report-num flex-none pt-[6px] text-[13px] font-bold sm:text-[15px]">{String(n).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <h3 id={`${id}-title`} className="text-[23px] leading-[27px] font-extrabold tracking-[-0.01em] sm:text-[27px] sm:leading-[31px]" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          {standfirst && (
            <p className="mt-[7px] max-w-[62ch] text-[14.5px] leading-[21px]" style={{ color: "var(--ink-soft)" }}>
              {standfirst}
            </p>
          )}
          {summary && <div className="mt-[16px]">{summary}</div>}
          <div id={panelId} hidden={!open} className="mt-[18px] flex flex-col gap-[18px]">
            {children}
          </div>
          <button
            type="button"
            data-disclosure-control
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="mt-[16px] inline-flex min-h-[44px] cursor-pointer items-center gap-[6px] text-[13px] font-bold"
            style={{ color: "var(--ink)" }}
          >
            {open ? "Show less" : "Show the detail"}
            <ChevronDown className="h-4 w-4 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[2px] py-[9px]">
      <dt className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>{label}</dt>
      <dd className="text-[14px] leading-[20px]" style={{ color: "var(--ink)" }}>{value}</dd>
    </div>
  );
}

// Salary drawn as a range, never as one number. Greyscale-safe: the bar has a
// border and every value is printed as text beside it.
function SalaryRange({ entry, median, experienced }: { entry: string; median: string; experienced: string }) {
  const rows = [
    { label: "Starting out", value: entry, width: 34 },
    { label: "National median", value: median, width: 62 },
    { label: "With experience", value: experienced, width: 100 },
  ];
  return (
    <figure className="m-0 flex flex-col gap-[12px]" data-keep-together>
      <figcaption className="sr-only">
        Pay by stage: starting out {entry}; national median {median}; with experience {experienced}.
      </figcaption>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-[5px]">
          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
            <span className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>{row.label}</span>
            <span className="text-[14.5px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{row.value}</span>
          </div>
          <span data-bar className="relative block h-[8px] overflow-hidden rounded-full" style={{ background: "var(--paper-sunken)", border: "1px solid var(--rule)" }}>
            <span data-bar-fill className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${row.width}%`, background: "color-mix(in srgb, var(--primary) 55%, #6d6f7a)" }} />
          </span>
        </div>
      ))}
    </figure>
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
  const [open, setOpen] = useState<Record<string, boolean>>({ glance: true });
  const [tocOpen, setTocOpen] = useState(false);
  const [active, setActive] = useState<string>("direction");
  const [draftQuestion, setDraftQuestion] = useState("");
  // The draft resets by keying off the saved value rather than syncing in an
  // effect, so a half-typed reflection is never wiped by a re-render.
  const [reflectionEdit, setReflectionEdit] = useState<{ base: string; value: string } | null>(null);
  const reflectionDraft = reflectionEdit && reflectionEdit.base === direction.reflection ? reflectionEdit.value : direction.reflection;
  const editingReflection = reflectionEdit !== null && reflectionEdit.base === direction.reflection;
  const setReflectionDraft = (value: string) => setReflectionEdit({ base: direction.reflection, value });
  const setEditingReflection = (on: boolean) => setReflectionEdit(on ? { base: direction.reflection, value: direction.reflection } : null);
  const [preview, setPreview] = useState<null | "full" | "summary">(null);
  const questionInputId = useId();
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

  const evidenceForCareer = useMemo(() => EVIDENCE.filter((item) => item.careerId === career.id), [career.id]);

  if (!report) {
    return (
      <div className="rounded-[var(--radius-2xl)] border p-[var(--space-8)] text-center" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">No report yet for {career.title}</p>
        <p className="mt-[6px] text-[13px]" style={{ color: "var(--muted-foreground)" }}>Play a simulation or save it from Explore and the report will build itself.</p>
      </div>
    );
  }

  const toggle = (id: string) => setOpen((value) => ({ ...value, [id]: !value[id] }));
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
              <h2 className="mt-[10px] text-[38px] leading-[40px] font-extrabold tracking-[-0.03em] sm:text-[52px] sm:leading-[52px]" style={{ fontFamily: "var(--font-display)" }}>
                {student.name}
              </h2>
              <p className="mt-[10px] text-[15px] leading-[22px]" style={{ color: "var(--ink-soft)" }}>
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

            {/* 1. Direction */}
            <Section
              id="direction" n={1} title="What I am working out"
              standfirst="In my own words, before any of the data."
              open={!!open.direction} onToggle={() => toggle("direction")}
              summary={
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[16px] leading-[24px]">I&apos;m currently exploring <strong>{direction.exploring}</strong>.</p>
                  <p className="text-[16px] leading-[24px]">My goal right now is to <strong>{direction.goal.charAt(0).toLowerCase() + direction.goal.slice(1)}</strong>.</p>
                </div>
              }
            >
              <blockquote className="m-0 border-l-2 pl-[16px] text-[17px] leading-[26px] italic" style={{ borderColor: "var(--rule-strong)" }}>
                {editingReflection ? (
                  <>
                    <label htmlFor="reflection" className="sr-only">Your reflection</label>
                    <textarea
                      id="reflection"
                      value={reflectionDraft}
                      onChange={(event) => setReflectionDraft(event.target.value)}
                      rows={6}
                      className="w-full resize-y rounded-[var(--radius-md)] border p-[10px] text-[15px] leading-[22px] not-italic"
                      style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink)" }}
                    />
                    <span data-print-hide className="mt-[8px] flex gap-[8px] not-italic">
                      <button type="button" onClick={() => { props.onReflectionChange(reflectionDraft); setEditingReflection(false); }} className="min-h-[44px] cursor-pointer rounded-[var(--radius-md)] px-[16px] text-[12.5px] font-bold" style={{ background: "var(--ink)", color: "var(--paper)" }}>Save</button>
                      <button type="button" onClick={() => { setReflectionDraft(direction.reflection); setEditingReflection(false); }} className="min-h-[44px] cursor-pointer px-[8px] text-[12.5px] font-semibold">Cancel</button>
                    </span>
                  </>
                ) : (
                  <>
                    {direction.reflection}
                    <button type="button" data-print-hide onClick={() => setEditingReflection(true)} className="mt-[10px] block min-h-[44px] cursor-pointer text-[12.5px] font-bold not-italic underline underline-offset-2">Edit what I wrote</button>
                  </>
                )}
              </blockquote>
              <div className="grid gap-[16px] sm:grid-cols-3">
                {[
                  { label: "Interests I picked", items: direction.interests },
                  { label: "Strengths I confirmed", items: direction.strengths },
                  { label: "What matters to me", items: direction.values },
                ].map((group) => (
                  <div key={group.label}>
                    <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>{group.label}</h4>
                    <ul className="mt-[6px] list-none p-0 text-[13.5px] leading-[21px]">
                      {group.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <SideNote>These come from what you chose in Build and confirmed in Evidence. You can change any of them.</SideNote>
            </Section>

            {/* 2. At a glance */}
            <Section
              id="glance" n={2} title={`${career.title} at a glance`}
              standfirst={report.glance.simple}
              open={!!open.glance} onToggle={() => toggle("glance")}
              summary={
                <>
                  <p className="text-[15px] leading-[23px]">{report.glance.example}</p>
                  <dl className="mt-[14px] grid gap-x-[24px] sm:grid-cols-2">
                    <Fact label="What you would do" value={report.glance.whatYouDo} />
                    <Fact label="Where you would work" value={report.glance.environment} />
                    <Fact label="Hours" value={report.glance.schedule} />
                    <Fact label="Typical education" value={report.glance.education} />
                  </dl>
                </>
              }
            >
              <div className="grid gap-[18px] sm:grid-cols-2">
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>A normal day includes</h4>
                  <ul className="mt-[6px] list-disc pl-[18px] text-[13.5px] leading-[21px]">
                    {report.glance.responsibilities.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="flex flex-col gap-[14px]">
                  <div>
                    <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>Skills that matter</h4>
                    <p className="mt-[5px] text-[13.5px] leading-[20px]">{report.glance.skills.join(" · ")}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>Industries that hire for it</h4>
                    <p className="mt-[5px] text-[13.5px] leading-[20px]">{report.glance.industries.join(" · ")}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>Example employers</h4>
                    <p className="mt-[5px] text-[13.5px] leading-[20px]">{report.glance.employers.join(" · ")}</p>
                    <SideNote>Examples of who does this work, to show you the shape of the industry. Not openings, and not places Dreamari can get you hired.</SideNote>
                  </div>
                </div>
              </div>
            </Section>

            {/* 3. Pay and outlook */}
            <Section
              id="salary" n={3} title="Pay and outlook"
              standfirst="A range, not a promise. Where you live and how long you have been doing it move this number a lot."
              open={!!open.salary} onToggle={() => toggle("salary")}
              summary={<SalaryRange entry={report.salary.entry} median={report.salary.median} experienced={report.salary.experienced} />}
            >
              <dl className="grid gap-x-[24px] sm:grid-cols-2">
                <Fact label="Job outlook" value={`${report.salary.outlook} — ${report.salary.outlookDetail}`} />
                <Fact label="Where you live" value={report.salary.geography} />
                {report.salary.variablePay && <Fact label="Bonus and other pay" value={report.salary.variablePay} />}
                <Fact label="What the median means" value="Half the people in this job earn more than this, half earn less. It is not a starting salary." />
              </dl>
              <SideNote>
                {report.salary.source.org}, {report.salary.source.year} data. Last checked {report.salary.source.verified}.{" "}
                <SourceLink url={report.salary.source.url}>See the source</SourceLink>
              </SideNote>
            </Section>

            {/* 4. Education and training */}
            <Section
              id="education" n={4} title="How people get in"
              standfirst="More than one route works. The most common one is not automatically the right one for you."
              open={!!open.education} onToggle={() => toggle("education")}
              summary={
                <p className="text-[15px] leading-[23px]">
                  Most common: <strong>{report.education.find((route) => route.common)?.name}</strong>. There are {report.education.length - 1} other routes worth knowing about.
                </p>
              }
            >
              <ul className="flex list-none flex-col gap-[2px] p-0">
                {report.education.map((item) => (
                  <li key={item.name} className="border-t py-[12px]" style={{ borderColor: "var(--rule)" }} data-keep-together>
                    <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
                      <h4 className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{item.name}</h4>
                      <span className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ color: "var(--ink-faint)" }}>
                        {item.common ? "Most common · " : ""}{item.kind} · {item.time}
                      </span>
                    </div>
                    <p className="mt-[4px] text-[13.5px] leading-[20px]">{item.note}</p>
                    <p className="mt-[3px] text-[12px] leading-[17px]" style={{ color: "var(--ink-faint)" }}>
                      Needs: {item.prerequisites}{item.licensure ? ` · License: ${item.licensure}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 5. Majors */}
            <Section
              id="majors" n={5} title="Majors to consider"
              standfirst="Three that connect to this work. None of them are required, and people arrive here from other majors too."
              open={!!open.majors} onToggle={() => toggle("majors")}
              summary={<p className="text-[15px] leading-[23px]">{report.majors.map((major) => major.name).join(" · ")}</p>}
            >
              <div className="flex flex-col gap-[2px]">
                {report.majors.map((major) => (
                  <div key={major.name} className="border-t py-[12px]" style={{ borderColor: "var(--rule)" }} data-keep-together>
                    <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
                      <h4 className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{major.name}</h4>
                      <button
                        type="button"
                        data-print-hide
                        aria-pressed={savedMajors.has(major.name)}
                        onClick={() => props.onToggleMajor(major.name)}
                        className="flex min-h-[44px] cursor-pointer items-center gap-[5px] text-[12px] font-bold"
                        style={{ color: "var(--ink)" }}
                      >
                        {savedMajors.has(major.name) ? <><Check className="h-3.5 w-3.5" aria-hidden /> Saved</> : <><Plus className="h-3.5 w-3.5" aria-hidden /> Save major</>}
                      </button>
                    </div>
                    <p className="mt-[3px] text-[13.5px] leading-[20px]"><span style={{ color: "var(--ink-faint)" }}>What it teaches:</span> {major.teaches}</p>
                    <p className="mt-[2px] text-[13.5px] leading-[20px]"><span style={{ color: "var(--ink-faint)" }}>How it connects:</span> {major.connection}</p>
                    <p className="mt-[2px] text-[12.5px] leading-[18px]" style={{ color: "var(--ink-faint)" }}>Close alternatives: {major.alternatives.join(", ")}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 6. Colleges and programs to research */}
            <Section
              id="colleges" n={6} title="Colleges and programs to research"
              standfirst="A research list, not a ranking. Cost is the published figure before aid, so treat it as a starting point."
              open={!!open.colleges} onToggle={() => toggle("colleges")}
              summary={
                <p className="text-[15px] leading-[23px]">
                  {report.colleges.filter((college) => college.status === "Saved").length} saved,{" "}
                  {report.colleges.length - report.colleges.filter((college) => college.status === "Saved").length} to look into.
                </p>
              }
            >
              <div className="flex flex-col gap-[2px]">
                {report.colleges.map((college) => (
                  <div key={college.name} className="border-t py-[13px]" style={{ borderColor: "var(--rule)" }} data-keep-together>
                    <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
                      <h4 className="text-[15.5px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{college.name}</h4>
                      <span className="rounded-full border px-[9px] py-[2px] text-[10px] font-bold tracking-[0.5px] uppercase" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }}>
                        {college.status}
                      </span>
                    </div>
                    <p className="mt-[3px] text-[12px] leading-[17px]" style={{ color: "var(--ink-faint)" }}>
                      {college.location} · {college.control} · {college.length} · {college.program}
                    </p>
                    <dl className="mt-[7px] grid gap-x-[20px] sm:grid-cols-2">
                      <Fact label="Cost" value={college.cost} />
                      {college.outcome && <Fact label="Graduation rate" value={college.outcome} />}
                      <Fact label="Getting in" value={college.requirements} />
                      <Fact label="Why it is on my list" value={college.why} />
                    </dl>
                    <p className="text-[12px] leading-[17px]" style={{ color: "var(--ink-faint)" }}>{STATUS_NOTE[college.status]}</p>
                  </div>
                ))}
              </div>
              <SideNote>
                No school here is labelled reach, target or safety. Those labels need an admissions model your school has not turned on, and a GPA alone cannot support them honestly.
                Cost and graduation figures: U.S. Department of Education College Scorecard, 2024-25, checked August 2026.
              </SideNote>
            </Section>

            {/* 7. Action plan */}
            <Section
              id="actions" n={7} title="What I do next"
              standfirst="Small enough to actually finish, and each one exists for a reason."
              open={open.actions !== false} onToggle={() => toggle("actions")}
              summary={
                <p className="text-[15px] leading-[23px]">
                  {report.actions.filter((action) => doneActions.has(action.id)).length} of {report.actions.length} done.
                </p>
              }
            >
              <ul className="flex list-none flex-col gap-[2px] p-0">
                {report.actions.map((action) => {
                  const done = doneActions.has(action.id);
                  return (
                    <li key={action.id} className="border-t py-[11px]" style={{ borderColor: "var(--rule)" }} data-keep-together>
                      <div className="flex items-start gap-[11px]">
                        <button
                          type="button"
                          data-print-hide
                          role="checkbox"
                          aria-checked={done}
                          onClick={() => props.onToggleAction(action.id)}
                          className="mt-[1px] flex size-[22px] flex-none cursor-pointer items-center justify-center rounded-[6px] border"
                          style={{ borderColor: "var(--rule-strong)", background: done ? "var(--ink)" : "transparent" }}
                        >
                          {done && <Check className="h-3.5 w-3.5" style={{ color: "var(--paper)" }} aria-hidden />}
                          <span className="sr-only">{action.label}</span>
                        </button>
                        <span aria-hidden className="hidden text-[13px] font-bold print:inline">{done ? "[x]" : "[ ]"}</span>
                        <div className="min-w-0">
                          <p className="text-[14.5px] leading-[20px] font-bold" style={{ textDecoration: done ? "line-through" : "none" }}>{action.label}</p>
                          <p className="mt-[2px] text-[12.5px] leading-[18px]" style={{ color: "var(--ink-soft)" }}>{action.reason}</p>
                          <p className="mt-[2px] text-[11.5px] leading-[16px]" style={{ color: "var(--ink-faint)" }}>
                            Goes to {action.destination}{action.due ? ` · ${action.due}` : ""} · {done ? "Done" : "Not started"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>

            {/* 8. Counselor conversation */}
            <Section
              id="questions" n={8} title="For my counselor"
              standfirst="What I want to get out of the meeting, written before I am sitting in it."
              open={open.questions !== false} onToggle={() => toggle("questions")}
              summary={
                <div className="flex flex-col gap-[8px]">
                  <p className="text-[15px] leading-[23px]"><span style={{ color: "var(--ink-faint)" }}>Leaning toward:</span> {career.title}, {route.short.charAt(0).toLowerCase() + route.short.slice(1)} route.</p>
                  <p className="text-[15px] leading-[23px]"><span style={{ color: "var(--ink-faint)" }}>Unsure about:</span> {direction.question}</p>
                </div>
              }
            >
              <div>
                <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>Questions I want to ask</h4>
                <ol className="mt-[8px] flex list-none flex-col gap-[2px] p-0">
                  {questions.map((question, index) => (
                    <li key={question.id} className="flex items-start gap-[10px] border-t py-[9px]" style={{ borderColor: "var(--rule)" }}>
                      <span aria-hidden className="dm-report-num pt-[2px] text-[12px] font-bold">{index + 1}</span>
                      <span className="min-w-0 flex-1 text-[14px] leading-[20px]">{question.text}</span>
                      <button type="button" data-print-hide onClick={() => props.onRemoveQuestion(question.id)} className="flex size-[32px] flex-none cursor-pointer items-center justify-center rounded-full" aria-label={`Remove question: ${question.text}`}>
                        <X className="h-4 w-4" style={{ color: "var(--ink-faint)" }} aria-hidden />
                      </button>
                    </li>
                  ))}
                  {questions.length === 0 && (
                    <li className="border-t py-[10px] text-[13.5px]" style={{ borderColor: "var(--rule)", color: "var(--ink-faint)" }}>
                      No questions yet. Add one below, or use a suggestion.
                    </li>
                  )}
                </ol>
                <form
                  data-print-hide
                  className="mt-[12px] flex flex-wrap gap-[8px]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!draftQuestion.trim()) return;
                    props.onAddQuestion(draftQuestion.trim());
                    setDraftQuestion("");
                  }}
                >
                  <label htmlFor={questionInputId} className="sr-only">Add a question for your counselor</label>
                  <input
                    id={questionInputId}
                    value={draftQuestion}
                    onChange={(event) => setDraftQuestion(event.target.value)}
                    placeholder="Add a question"
                    className="min-h-[44px] min-w-0 flex-1 rounded-[var(--radius-md)] border px-[12px] text-[13.5px]"
                    style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink)" }}
                  />
                  <button type="submit" className="min-h-[44px] cursor-pointer rounded-[var(--radius-md)] px-[18px] text-[12.5px] font-bold" style={{ background: "var(--ink)", color: "var(--paper)" }}>Add</button>
                </form>
                <div data-print-hide className="mt-[10px] flex flex-wrap gap-[6px]">
                  {SUGGESTED_QUESTIONS.filter((text) => !questions.some((question) => question.text === text)).map((text) => (
                    <button key={text} type="button" onClick={() => props.onAddQuestion(text)} className="cursor-pointer rounded-full border px-[11px] py-[7px] text-[11.5px] font-semibold" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }}>
                      + {text}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-bold tracking-[0.7px] uppercase" style={{ color: "var(--ink-faint)" }}>Notes from the meeting</h4>
                <div className="mt-[6px] rounded-[var(--radius-md)] border border-dashed p-[14px] text-[12.5px] leading-[19px]" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-faint)" }}>
                  Space to write during the meeting, and to record what you agreed to do next.
                </div>
              </div>
            </Section>

            {/* 9. Sources and limitations */}
            <Section
              id="sources" n={9} title="Sources and limits"
              standfirst="Where these numbers came from, and what they cannot tell you."
              open={!!open.sources} onToggle={() => toggle("sources")}
              summary={<p className="text-[14.5px] leading-[21px]" style={{ color: "var(--ink-soft)" }}>{report.sources.length} sources, all checked August 2026.</p>}
            >
              <ul className="flex list-none flex-col gap-[2px] p-0">
                {report.sources.map((source) => (
                  <li key={source.url + source.label} className="border-t py-[9px] text-[13px] leading-[19px]" style={{ borderColor: "var(--rule)" }}>
                    <strong>{source.label}</strong> — {source.org}, {source.year} data. Checked {source.verified}.{" "}
                    <SourceLink url={source.url}>Open</SourceLink>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-[12px] text-[12.5px] leading-[19px]" style={{ borderColor: "var(--rule)", color: "var(--ink-soft)" }}>
                <p>Pay, hiring and program information changes. Salary figures describe people already working in the job, not what you would be offered. College costs are published prices before financial aid, and admission requirements change year to year.</p>
                <p className="mt-[8px]">Everything in this report supports exploration. Nothing in it is a guarantee, a prediction, or a substitute for talking to your counselor.</p>
                <p className="mt-[8px]">Built from {evidenceForCareer.length} things you did in Dreamari for this career, plus the sources above.</p>
                <button type="button" data-print-hide onClick={props.onOpenEvidence} className="mt-[8px] inline-flex min-h-[44px] cursor-pointer items-center gap-[5px] text-[12.5px] font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
                  See and correct every input
                </button>
              </div>
            </Section>
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
