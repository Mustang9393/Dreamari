"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ResumeData } from "@/lib/resume";
import { EXPERIENCE_TYPES, RESUME_TEMPLATES, type ResumeTemplateId } from "./data";

// The actual resume, rendered as a real document -- not a form summary.
// Reuses the app's existing printable-document system (`.dm-report`, the
// same class Career Report's export uses) for the print/structural behavior,
// but pins the color tokens to its own print variant unconditionally (direct
// feedback, 14 Sept 2026: "keep white background black text as it would be
// actually sent") rather than the dark-on-screen default `.dm-report`
// normally shows -- a resume you'd send out doesn't have a dark mode.

// A real US Letter page at 96dpi, the same convention document editors use
// for their own "page" canvas. The sheet is ALWAYS laid out at this exact
// pixel size with real point-equivalent type (direct feedback, 14 Sept
// 2026: "the scale layout etc needs to be realistic") -- ScaledSheet then
// uniformly scales that fixed canvas down to fit whatever width it's given
// (the full document view, or the wizard's narrower sidebar), so proportions
// never lie about what actually prints.
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;

function templateFor(id: string) {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}

function paperStyle(templateId: string): CSSProperties {
  const template = templateFor(templateId);
  return {
    "--paper": "#ffffff",
    "--paper-raised": "#ffffff",
    "--paper-sunken": "#f5f5f5",
    "--ink": "#000000",
    "--ink-soft": "#2b2b2b",
    "--ink-faint": "#555555",
    "--rule": "#cccccc",
    "--rule-strong": "#999999",
    "--accent": template.accent,
    "--name-font": template.nameFont === "serif" ? "Georgia, 'Times New Roman', serif" : "var(--font-body, system-ui, sans-serif)",
  } as CSSProperties;
}

function Rule() {
  return <div className="h-px w-full" style={{ background: "var(--rule)" }} />;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-[12px] font-extrabold tracking-[0.12em] uppercase" style={{ color: "var(--accent)" }}>{children}</span>
      <Rule />
    </div>
  );
}

function dateRange(start: string, end: string, current: boolean) {
  const from = start.trim();
  const to = current ? "Present" : end.trim();
  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;
  return `${from} – ${to}`;
}

function ResumeSheetContent({ resume }: { resume: ResumeData }) {
  const fullName = `${resume.profile.firstName} ${resume.profile.lastName}`.trim() || "Your Name";
  const contactLine = [
    resume.profile.email,
    resume.profile.phone,
    [resume.profile.city, resume.profile.state].filter(Boolean).join(", "),
    resume.profile.country,
  ].filter(Boolean);
  const totalSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length;

  return (
    <>
      <header data-print-keep className="flex flex-col items-center text-center">
        <h1 className="text-[26px] leading-[30px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }}>{fullName}</h1>
        {contactLine.length > 0 && (
          <p className="mt-[8px] flex flex-wrap items-center justify-center gap-x-[8px] gap-y-[4px] text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>
            {contactLine.map((part, i) => (
              <span key={i} className="flex items-center gap-[8px]">
                {i > 0 && <span aria-hidden style={{ color: "var(--ink-faint)" }}>·</span>}
                {part}
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="mt-[28px] flex flex-col gap-[24px]">
        {resume.education.length > 0 && (
          <section className="flex flex-col gap-[14px]">
            <SectionLabel>Education</SectionLabel>
            <div className="flex flex-col gap-[14px]">
              {resume.education.map((edu) => (
                <div key={edu.id} className="flex flex-col gap-[2px]">
                  <div className="flex items-baseline justify-between gap-[12px]">
                    <span className="text-[14.5px] font-bold" style={{ color: "var(--ink)" }}>{edu.schoolName}</span>
                    {edu.gradYear && <span className="flex-none text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>{edu.gradYear}</span>}
                  </div>
                  {(edu.cityState || edu.program || edu.gpa) && (
                    <span className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
                      {[edu.cityState, edu.program && `${edu.program} Program`, edu.gpa && `GPA: ${edu.gpa}`].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  {edu.honors.length > 0 && <span className="text-[13px]" style={{ color: "var(--ink-faint)" }}>{edu.honors.join(", ")}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.experience.length > 0 && (
          <section className="flex flex-col gap-[14px]">
            <SectionLabel>Experience &amp; Activities</SectionLabel>
            <div className="flex flex-col gap-[16px]">
              {resume.experience.map((exp) => {
                const kind = EXPERIENCE_TYPES.find((t) => t.type === exp.type);
                const range = dateRange(exp.startDate, exp.endDate, exp.current);
                return (
                  <div key={exp.id} className="flex flex-col gap-[4px]">
                    <div className="flex items-baseline justify-between gap-[12px]">
                      <span className="text-[14.5px] font-bold" style={{ color: "var(--ink)" }}>
                        {exp.title}{exp.where && <span className="font-semibold" style={{ color: "var(--ink-soft)" }}> at {exp.where}</span>}
                      </span>
                      {range && <span className="flex-none text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>{range}</span>}
                    </div>
                    {(exp.location || kind) && (
                      <span className="text-[12.5px]" style={{ color: "var(--ink-faint)" }}>{[kind?.label, exp.location].filter(Boolean).join(" · ")}</span>
                    )}
                    {exp.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-[2px] flex flex-col gap-[3px] pl-[18px]" style={{ listStyleType: "disc", color: "var(--ink-soft)" }}>
                        {exp.bullets.filter((b) => b.trim()).map((b, i) => (
                          <li key={i} className="text-[13.5px] leading-[19px]">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {totalSkills > 0 && (
          <section className="flex flex-col gap-[14px]">
            <SectionLabel>Skills</SectionLabel>
            <div className="flex flex-col gap-[6px]">
              {resume.skills.people.length > 0 && (
                <p className="text-[13.5px]" style={{ color: "var(--ink-soft)" }}><span className="font-bold" style={{ color: "var(--ink)" }}>People: </span>{resume.skills.people.join(", ")}</p>
              )}
              {resume.skills.tech.length > 0 && (
                <p className="text-[13.5px]" style={{ color: "var(--ink-soft)" }}><span className="font-bold" style={{ color: "var(--ink)" }}>Tech: </span>{resume.skills.tech.join(", ")}</p>
              )}
              {resume.skills.languages.length > 0 && (
                <p className="text-[13.5px]" style={{ color: "var(--ink-soft)" }}><span className="font-bold" style={{ color: "var(--ink)" }}>Languages: </span>{resume.skills.languages.join(", ")}</p>
              )}
            </div>
          </section>
        )}

        {resume.certifications.length > 0 && (
          <section className="flex flex-col gap-[14px]">
            <SectionLabel>Certifications</SectionLabel>
            <div className="flex flex-col gap-[10px]">
              {resume.certifications.map((cert) => (
                <div key={cert.id} className="flex items-baseline justify-between gap-[12px]">
                  <span className="text-[13.5px]" style={{ color: "var(--ink-soft)" }}>
                    <span className="font-bold" style={{ color: "var(--ink)" }}>{cert.name}</span>
                    {cert.issuer && `, ${cert.issuer}`}
                  </span>
                  {cert.date && <span className="flex-none text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>{cert.date}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/** Renders the fixed-size sheet at real dimensions, scaled to fit whatever
 *  width its container offers -- the same technique document editors use
 *  for their page preview, so what's on screen is proportionally identical
 *  to a full-size page rather than an arbitrary content-sized box. */
function ScaledSheet({ resume, templateId }: { resume: ResumeData; templateId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setScale(el.offsetWidth / PAGE_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="print:hidden" style={{ width: "100%", height: scale ? PAGE_HEIGHT * scale : undefined, overflow: "hidden" }}>
      <div
        data-doc="resume"
        className="dm-report overflow-hidden rounded-[var(--radius-lg)] p-[56px] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)]"
        style={{ ...paperStyle(templateId), width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: scale ? `scale(${scale})` : undefined, transformOrigin: "top left", visibility: scale ? "visible" : "hidden" }}
      >
        <ResumeSheetContent resume={resume} />
      </div>
    </div>
  );
}

export function ResumeDocument({ resume, templateId = "classic" }: { resume: ResumeData; templateId?: string | ResumeTemplateId }) {
  return (
    <>
      <ScaledSheet resume={resume} templateId={templateId} />
      {/* Print gets its own natural-flow copy -- the scaled screen version
         is a fixed 1-page box (print:hidden above), but a resume longer
         than one page needs to paginate through the browser's own @page
         rule (app.css) instead of being clipped to that box. */}
      <article data-doc="resume-print" className="dm-report hidden rounded-[var(--radius-lg)] p-[var(--space-8)] print:block" style={paperStyle(templateId)}>
        <ResumeSheetContent resume={resume} />
      </article>
    </>
  );
}

export function PrintResumeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print-hide
      className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[13.5px] font-bold text-white"
      style={{ background: "var(--primary)" }}
    >
      <Download className="h-4 w-4" aria-hidden /> Print / Save PDF
    </button>
  );
}
