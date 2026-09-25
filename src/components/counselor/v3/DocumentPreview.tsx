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
// role="dialog", aria-modal, Escape-to-close. The page itself uses the
// same --paper/--ink token set the Resume and Career Report documents
// already print with (ResumeDocument.tsx, CareerReport.tsx), so it reads
// as genuine paper regardless of the app's own dark/light mode -- a real
// PDF viewer never re-themes the page inside it.

import { useEffect } from "react";
import { Download, Printer, X } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { COLLEGES } from "@/components/colleges/data";
import type { CounselorStudent, MilestoneKey } from "@/lib/counselorRoster";

const PAPER_VARS = {
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

export function DocumentPreviewModal({ open, onClose, fileName, kb, pageLabel = "Page 1 of 1", children }: { open: boolean; onClose: () => void; fileName: string; kb: number; pageLabel?: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-[16px] sm:p-[32px]" role="dialog" aria-modal="true" aria-label={`Preview of ${fileName}`}>
        <button type="button" aria-label="Close preview" onClick={onClose} className="absolute inset-0 cursor-default backdrop-blur-[6px]" style={{ background: "rgba(5,7,15,0.72)" }} />
        <div className="relative z-[1] flex max-h-full w-full max-w-[720px] flex-col overflow-hidden rounded-[var(--radius-lg)] border motion-safe:animate-[resume-drawer-in_0.18s_ease-out_both]" style={{ borderColor: "var(--glass-border)", background: "#26272b", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.85)" }}>
          {/* Toolbar: the one part of a real PDF viewer that stays dark
             regardless of the page underneath it. */}
          <div className="flex flex-none items-center justify-between gap-[10px] border-b px-[16px] py-[10px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="flex min-w-0 items-center gap-[10px]">
              <span className="flex size-[28px] flex-none items-center justify-center rounded-[6px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                <svg width="13" height="16" viewBox="0 0 13 16" fill="none" aria-hidden><path d="M1 1.5C1 0.947715 1.44772 0.5 2 0.5H8L12 4.5V14.5C12 15.0523 11.5523 15.5 11 15.5H2C1.44772 15.5 1 15.0523 1 14.5V1.5Z" stroke="#E5453C" strokeWidth="1.1" /><path d="M8 0.5V4.5H12" stroke="#E5453C" strokeWidth="1.1" /></svg>
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13px] font-bold" style={{ color: "#fff" }}>{fileName}</span>
                <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>PDF · {kb} KB · {pageLabel}</span>
              </span>
            </span>
            <span className="flex flex-none items-center gap-[2px]">
              <IconTip label="Download">
                <button type="button" className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "rgba(255,255,255,0.8)" }}><Download className="h-[15px] w-[15px]" aria-hidden /></button>
              </IconTip>
              <IconTip label="Print">
                <button type="button" className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "rgba(255,255,255,0.8)" }}><Printer className="h-[15px] w-[15px]" aria-hidden /></button>
              </IconTip>
              <IconTip label="Close">
                <button type="button" onClick={onClose} className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "rgba(255,255,255,0.8)" }}><X className="h-[16px] w-[16px]" aria-hidden /></button>
              </IconTip>
            </span>
          </div>
          {/* Viewer surface: darker than the toolbar (the same relationship
             every real PDF viewer uses so the white page reads as paper,
             not as "the app's own light mode"), the page centered and
             scrollable when it runs long. */}
          <div className="flex-1 overflow-y-auto p-[20px] sm:p-[32px]" style={{ background: "#1c1d20" }}>
            <div className="mx-auto w-full max-w-[560px] rounded-[2px] p-[36px] sm:p-[44px]" style={{ ...PAPER_VARS, background: "var(--paper)", boxShadow: "0 12px 40px -10px rgba(0,0,0,0.5)" }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function PaperHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-[18px] flex flex-col gap-[3px] border-b pb-[14px]" style={{ borderColor: "var(--rule)" }}>
      <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--ink-faint)" }}>{eyebrow}</span>
      <span className="text-[20px] font-extrabold" style={{ color: "var(--ink)" }}>{title}</span>
    </div>
  );
}
function PaperSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[16px] flex flex-col gap-[6px]">
      <span className="text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--ink-faint)" }}>{label}</span>
      {children}
    </div>
  );
}
function PaperFooter({ student }: { student: CounselorStudent }) {
  return (
    <div className="mt-[24px] flex items-center justify-between border-t pt-[10px] text-[10px] font-semibold" style={{ borderColor: "var(--rule)", color: "var(--ink-faint)" }}>
      <span>Generated on Dreamari · {fmtToday()}</span>
      <span>{student.name} · Grade {student.grade}</span>
    </div>
  );
}

// ---- One realistic page per milestone type ---------------------------------

function CareerReportPage({ student: s }: { student: CounselorStudent }) {
  return (
    <>
      <PaperHeading eyebrow="Dreamari Career Report" title={s.name} />
      <PaperSection label="Top Career Matches">
        <div className="flex flex-col gap-[8px]">
          {s.topMatches.slice(0, 3).map((m) => (
            <div key={m.title} className="flex flex-col gap-[3px]">
              <span className="flex items-baseline justify-between text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>{m.title}<span style={{ color: "var(--ink-soft)" }}>{m.pct}%</span></span>
              <span className="block h-[5px] w-full overflow-hidden rounded-full" style={{ background: "var(--paper-sunken)" }}><span className="block h-full rounded-full" style={{ width: `${m.pct}%`, background: "#5B6CF9" }} /></span>
            </div>
          ))}
        </div>
      </PaperSection>
      <PaperSection label="Career Pathway">
        <p className="text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>{s.careerTrack} &middot; {s.careerCluster}</p>
      </PaperSection>
      <PaperSection label="Engagement Snapshot">
        <p className="text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>Roadmap {s.roadmapPct}% complete &middot; Dream Score {s.engagement.dreamScore} &middot; {s.engagement.simulations} career simulations played</p>
      </PaperSection>
      <PaperFooter student={s} />
    </>
  );
}

function ResumePage({ student: s }: { student: CounselorStudent }) {
  const grad = 2026 + (12 - s.grade);
  return (
    <>
      <div className="mb-[18px] flex flex-col gap-[2px] border-b pb-[14px]" style={{ borderColor: "var(--rule)" }}>
        <span className="text-[19px] font-extrabold" style={{ color: "var(--ink)" }}>{s.name}</span>
        <span className="text-[11.5px] font-semibold" style={{ color: "var(--ink-faint)" }}>Lincoln High School &middot; Class of {grad}</span>
      </div>
      <PaperSection label="Education">
        <p className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>Lincoln High School</p>
        <p className="text-[12px]" style={{ color: "var(--ink-soft)" }}>Grade {s.grade} &middot; Expected graduation {grad}</p>
      </PaperSection>
      <PaperSection label="Activities & Experience">
        <ul className="flex flex-col gap-[4px] pl-[16px] text-[12.5px] leading-[18px]" style={{ color: "var(--ink-soft)", listStyleType: "disc" }}>
          <li>Completed {s.engagement.simulations} career simulations in {s.careerTrack}</li>
          <li>{s.engagement.challenges} career challenges on Dreamari, tracking toward a Dream Score of {s.engagement.dreamScore}</li>
          <li>Explored {s.engagement.careersSaved} careers and {s.engagement.collegesSaved} colleges through Dreamari</li>
        </ul>
      </PaperSection>
      <PaperSection label="Skills">
        <p className="text-[12.5px] leading-[18px]" style={{ color: "var(--ink-soft)" }}>Core interest area: {s.careerTrack}. Top match: {s.topMatches[0]?.title ?? "not yet set"}.</p>
      </PaperSection>
      <PaperFooter student={s} />
    </>
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
    <>
      <PaperHeading eyebrow="Four-Year Academic Plan" title={s.name} />
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule)" }}>
            <th className="py-[6px] text-left font-bold" style={{ color: "var(--ink-faint)" }}>Grade</th>
            <th className="py-[6px] text-left font-bold" style={{ color: "var(--ink-faint)" }}>Courses</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.grade} style={{ borderBottom: "1px solid var(--rule)", background: r.grade === s.grade ? "var(--paper-sunken)" : "transparent" }}>
              <td className="py-[8px] pr-[10px] align-top font-bold" style={{ color: "var(--ink)" }}>{r.grade}</td>
              <td className="py-[8px] align-top" style={{ color: "var(--ink-soft)" }}>{r.courses.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-[14px]"><PaperSection label="Postsecondary Intent"><p className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{s.postsecondaryIntent}</p></PaperSection></div>
      <PaperFooter student={s} />
    </>
  );
}

function collegeTier(admitRate: number | null): { label: string; color: string } {
  if (admitRate === null) return { label: "Safety", color: "#1f8a4c" };
  if (admitRate < 0.3) return { label: "Reach", color: "#c0392b" };
  if (admitRate < 0.6) return { label: "Target", color: "#b7791f" };
  return { label: "Safety", color: "#1f8a4c" };
}
function CollegeListPage({ student: s }: { student: CounselorStudent }) {
  const n = Number(s.id.replace(/^\D+/, "")) || 0;
  const picks = [0, 1, 2].map((i) => COLLEGES[(n * 7 + i * 41) % COLLEGES.length]);
  return (
    <>
      <PaperHeading eyebrow="College List" title={s.name} />
      <div className="flex flex-col gap-[10px]">
        {picks.map((c) => {
          const tier = collegeTier(c.admitRate);
          return (
            <div key={c.slug} className="flex items-center justify-between gap-[10px] border-b pb-[10px]" style={{ borderColor: "var(--rule)" }}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-bold" style={{ color: "var(--ink)" }}>{c.name}</span>
                <span className="text-[11.5px]" style={{ color: "var(--ink-faint)" }}>{c.city}, {c.stateName}</span>
              </span>
              <span className="flex-none rounded-full px-[9px] py-[3px] text-[10px] font-extrabold uppercase" style={{ color: "#fff", background: tier.color }}>{tier.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-[14px]"><PaperSection label="Saved on Dreamari"><p className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{s.engagement.collegesSaved} colleges saved &middot; Intent: {s.postsecondaryIntent}</p></PaperSection></div>
      <PaperFooter student={s} />
    </>
  );
}

function FinancialAidPage({ student: s }: { student: CounselorStudent }) {
  const efc = 500 + seededOffset(`${s.id}:efc`, 8) * 750;
  return (
    <>
      <PaperHeading eyebrow="FAFSA Worksheet" title={s.name} />
      <div className="grid grid-cols-2 gap-x-[16px] gap-y-[12px]">
        {[
          ["Dependency status", "Dependent student"],
          ["Household size", String(3 + (seededOffset(`${s.id}:hh`, 3)))],
          ["Estimated Family Contribution", `$${efc.toLocaleString("en-US")}`],
          ["Postsecondary intent", s.postsecondaryIntent],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-[2px]">
            <span className="text-[10.5px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--ink-faint)" }}>{label}</span>
            <span className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-[18px] rounded-[4px] border px-[12px] py-[8px] text-[11.5px] font-semibold" style={{ borderColor: "#f0c14b", background: "#fdf6e3", color: "#8a6d1a" }}>Awaiting counselor review before submission.</div>
      <PaperFooter student={s} />
    </>
  );
}

function GenericPage({ student: s, milestone }: { student: CounselorStudent; milestone: MilestoneKey }) {
  return (
    <>
      <PaperHeading eyebrow={milestone} title={s.name} />
      <PaperSection label="Details">
        <p className="text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>Grade {s.grade} &middot; {s.careerTrack}</p>
      </PaperSection>
      <PaperFooter student={s} />
    </>
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
