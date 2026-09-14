"use client";

import { Download, Minus, Plus, ZoomIn, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ResumeData } from "@/lib/resume";
import { Portal } from "@/components/profile/CareerReport";
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

// Backgrounds stay light TINTS, never a solid accent fill behind text: most
// browsers suppress background colors on print unless "background graphics"
// is explicitly turned on, and text color never changes -- a solid fill
// with light text on top would print invisible. A tint just disappears
// safely, since every text color here is already dark.
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
    "--accent-tint": `color-mix(in srgb, ${template.accent} 7%, white)`,
    "--name-font": template.nameFont,
  } as CSSProperties;
}

function Rule({ width = "100%" }: { width?: string }) {
  return <div className="h-px" style={{ width, background: "var(--rule)" }} />;
}

/** "rule": classic/sidebar -- label over a full-width line.
 *  "bar": banner -- a colored bar to the left of the label.
 *  "plain": minimal -- label alone, a short tick instead of a full rule. */
function SectionLabel({ children, variant = "rule" }: { children: ReactNode; variant?: "rule" | "bar" | "plain" }) {
  if (variant === "bar") {
    return (
      <div className="border-l-[3px] pl-[10px]" style={{ borderColor: "var(--accent)" }}>
        <span className="text-[12px] font-extrabold tracking-[0.12em] uppercase" style={{ color: "var(--accent)" }}>{children}</span>
      </div>
    );
  }
  if (variant === "plain") {
    return (
      <div className="flex flex-col gap-[6px]">
        <span className="text-[11.5px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--accent)" }}>{children}</span>
        <Rule width="32px" />
      </div>
    );
  }
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

// ---- Shared entry content -- identical across layouts, just arranged
// differently by each one below. ----

function EducationEntries({ resume, tight }: { resume: ResumeData; tight?: boolean }) {
  if (resume.education.length === 0) return null;
  return (
    <div className="flex flex-col gap-[14px]">
      {resume.education.map((edu) => (
        <div key={edu.id} className="flex flex-col gap-[2px]">
          <div className={tight ? "flex flex-col gap-[1px]" : "flex items-baseline justify-between gap-[12px]"}>
            <span className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>{edu.schoolName}</span>
            {edu.gradYear && <span className="flex-none text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>{edu.gradYear}</span>}
          </div>
          {(edu.cityState || edu.program || edu.gpa) && (
            <span className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
              {[edu.cityState, edu.program && `${edu.program} Program`, edu.gpa && `GPA: ${edu.gpa}`].filter(Boolean).join(" · ")}
            </span>
          )}
          {edu.honors.length > 0 && <span className="text-[12.5px]" style={{ color: "var(--ink-faint)" }}>{edu.honors.join(", ")}</span>}
        </div>
      ))}
    </div>
  );
}

function ExperienceEntries({ resume }: { resume: ResumeData }) {
  if (resume.experience.length === 0) return null;
  return (
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
  );
}

function SkillsBlock({ resume, stacked }: { resume: ResumeData; stacked?: boolean }) {
  const total = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length;
  if (total === 0) return null;
  const groups: [string, string[]][] = [
    ["People", resume.skills.people],
    ["Tech", resume.skills.tech],
    ["Languages", resume.skills.languages],
  ].filter(([, v]) => v.length > 0) as [string, string[]][];
  return (
    <div className="flex flex-col gap-[6px]">
      {groups.map(([label, values]) =>
        stacked ? (
          <div key={label} className="flex flex-col gap-[2px]">
            <span className="text-[11.5px] font-bold" style={{ color: "var(--ink)" }}>{label}</span>
            <span className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{values.join(", ")}</span>
          </div>
        ) : (
          <p key={label} className="text-[13.5px]" style={{ color: "var(--ink-soft)" }}><span className="font-bold" style={{ color: "var(--ink)" }}>{label}: </span>{values.join(", ")}</p>
        ),
      )}
    </div>
  );
}

function CertificationEntries({ resume, tight }: { resume: ResumeData; tight?: boolean }) {
  if (resume.certifications.length === 0) return null;
  return (
    <div className="flex flex-col gap-[10px]">
      {resume.certifications.map((cert) => {
        const range = dateRange(cert.issueDate, cert.expirationDate, false);
        return (
          <div key={cert.id} className={tight ? "flex flex-col gap-[1px]" : "flex items-baseline justify-between gap-[12px]"}>
            <span className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
              <span className="font-bold" style={{ color: "var(--ink)" }}>{cert.name}</span>
              {cert.issuer && `, ${cert.issuer}`}
              {cert.credentialId && <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}> · ID: {cert.credentialId}</span>}
            </span>
            {range && <span className="flex-none text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>{range}</span>}
          </div>
        );
      })}
    </div>
  );
}

function ContactLine({ resume, align = "center" }: { resume: ResumeData; align?: "center" | "left" }) {
  const parts = [
    resume.profile.email,
    resume.profile.phone,
    [resume.profile.city, resume.profile.state].filter(Boolean).join(", "),
    resume.profile.country,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className={`mt-[8px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[13px] font-semibold ${align === "center" ? "justify-center" : "justify-start"}`} style={{ color: "var(--ink-soft)" }}>
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-[8px]">
          {i > 0 && <span aria-hidden style={{ color: "var(--ink-faint)" }}>·</span>}
          {part}
        </span>
      ))}
    </p>
  );
}

function fullNameOf(resume: ResumeData) {
  return `${resume.profile.firstName} ${resume.profile.lastName}`.trim() || "Your Name";
}

// ---- Layouts -- same underlying content, four different arrangements. ----

function SingleColumnLayout({ resume }: { resume: ResumeData }) {
  return (
    <>
      <header data-print-keep data-section="profile" className="flex flex-col items-center text-center">
        <h1 className="text-[26px] leading-[30px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }}>{fullNameOf(resume)}</h1>
        <ContactLine resume={resume} align="center" />
        {resume.profile.bio.trim() && (
          <p className="mt-[14px] max-w-[560px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>{resume.profile.bio.trim()}</p>
        )}
      </header>
      <div className="mt-[28px] flex flex-col gap-[24px]">
        {resume.education.length > 0 && <section data-section="education" className="flex flex-col gap-[14px]"><SectionLabel>Education</SectionLabel><EducationEntries resume={resume} /></section>}
        {resume.experience.length > 0 && <section data-section="experience" className="flex flex-col gap-[14px]"><SectionLabel>Experience &amp; Activities</SectionLabel><ExperienceEntries resume={resume} /></section>}
        {(resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length) > 0 && <section data-section="skills" className="flex flex-col gap-[14px]"><SectionLabel>Skills</SectionLabel><SkillsBlock resume={resume} /></section>}
        {resume.certifications.length > 0 && <section data-section="certifications" className="flex flex-col gap-[14px]"><SectionLabel>Certifications</SectionLabel><CertificationEntries resume={resume} /></section>}
      </div>
    </>
  );
}

function SidebarLayout({ resume }: { resume: ResumeData }) {
  const hasSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0;
  return (
    <div className="flex gap-[28px]">
      <aside data-section="profile" className="flex w-[210px] flex-none flex-col gap-[22px] rounded-[8px] p-[16px]" style={{ background: "var(--accent-tint)" }}>
        <div>
          <h1 className="text-[19px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }}>{fullNameOf(resume)}</h1>
        </div>
        <div className="flex flex-col gap-[4px] text-[12px] font-semibold" style={{ color: "var(--ink-soft)" }}>
          {resume.profile.email && <span>{resume.profile.email}</span>}
          {resume.profile.phone && <span>{resume.profile.phone}</span>}
          {(resume.profile.city || resume.profile.state) && <span>{[resume.profile.city, resume.profile.state].filter(Boolean).join(", ")}</span>}
          {resume.profile.country && <span>{resume.profile.country}</span>}
        </div>
        {hasSkills && <div data-section="skills" className="flex flex-col gap-[8px]"><SectionLabel variant="plain">Skills</SectionLabel><SkillsBlock resume={resume} stacked /></div>}
        {resume.certifications.length > 0 && <div data-section="certifications" className="flex flex-col gap-[8px]"><SectionLabel variant="plain">Certifications</SectionLabel><CertificationEntries resume={resume} tight /></div>}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
        {resume.profile.bio.trim() && <p className="text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>{resume.profile.bio.trim()}</p>}
        {resume.education.length > 0 && <section data-section="education" className="flex flex-col gap-[12px]"><SectionLabel>Education</SectionLabel><EducationEntries resume={resume} /></section>}
        {resume.experience.length > 0 && <section data-section="experience" className="flex flex-col gap-[12px]"><SectionLabel>Experience &amp; Activities</SectionLabel><ExperienceEntries resume={resume} /></section>}
      </div>
    </div>
  );
}

function MinimalLayout({ resume }: { resume: ResumeData }) {
  return (
    <>
      <header data-print-keep data-section="profile" className="flex flex-col items-start text-left">
        <h1 className="text-[24px] leading-[28px] font-semibold tracking-[0.01em]" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }}>{fullNameOf(resume)}</h1>
        <ContactLine resume={resume} align="left" />
        {resume.profile.bio.trim() && (
          <p className="mt-[14px] max-w-[560px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>{resume.profile.bio.trim()}</p>
        )}
      </header>
      <div className="mt-[32px] flex flex-col gap-[28px]">
        {resume.education.length > 0 && <section data-section="education" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Education</SectionLabel><EducationEntries resume={resume} /></section>}
        {resume.experience.length > 0 && <section data-section="experience" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Experience &amp; Activities</SectionLabel><ExperienceEntries resume={resume} /></section>}
        {(resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length) > 0 && <section data-section="skills" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Skills</SectionLabel><SkillsBlock resume={resume} /></section>}
        {resume.certifications.length > 0 && <section data-section="certifications" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Certifications</SectionLabel><CertificationEntries resume={resume} /></section>}
      </div>
    </>
  );
}

function BannerLayout({ resume }: { resume: ResumeData }) {
  return (
    <>
      <header data-print-keep data-section="profile" className="flex flex-col gap-[4px]">
        <h1 className="text-[30px] leading-[34px] font-bold" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }}>{fullNameOf(resume)}</h1>
        <ContactLine resume={resume} align="left" />
        <div className="mt-[10px] h-[4px] w-full rounded-full" style={{ background: "var(--accent)" }} />
        {resume.profile.bio.trim() && (
          <p className="mt-[10px] max-w-[600px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>{resume.profile.bio.trim()}</p>
        )}
      </header>
      <div className="mt-[24px] flex flex-col gap-[24px]">
        {resume.education.length > 0 && <section data-section="education" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Education</SectionLabel><EducationEntries resume={resume} /></section>}
        {resume.experience.length > 0 && <section data-section="experience" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Experience &amp; Activities</SectionLabel><ExperienceEntries resume={resume} /></section>}
        {(resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length) > 0 && <section data-section="skills" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Skills</SectionLabel><SkillsBlock resume={resume} /></section>}
        {resume.certifications.length > 0 && <section data-section="certifications" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Certifications</SectionLabel><CertificationEntries resume={resume} /></section>}
      </div>
    </>
  );
}

function ResumeSheetContent({ resume, templateId }: { resume: ResumeData; templateId: string }) {
  const layout = templateFor(templateId).layout;
  if (layout === "sidebar") return <SidebarLayout resume={resume} />;
  if (layout === "minimal") return <MinimalLayout resume={resume} />;
  if (layout === "banner") return <BannerLayout resume={resume} />;
  return <SingleColumnLayout resume={resume} />;
}

const CROPPED_WINDOW_HEIGHT = 520;
// Extra scale on top of fit-to-width when a section is focused -- enough to
// read more easily, not so much the page's own side padding (56px at full
// PAGE_WIDTH) stops covering the overflow once centered. Direct feedback,
// 14 Sept 2026: "zoom in a bit more without making it look ugly."
const SECTION_ZOOM_BOOST = 1.12;

/** Renders the fixed-size sheet at real dimensions, scaled to fit whatever
 *  width its container offers -- the same technique document editors use
 *  for their page preview, so what's on screen is proportionally identical
 *  to a full-size page rather than an arbitrary content-sized box.
 *
 *  `cropped` + `focusSection` trades the usual "whole page, no scroll"
 *  window for a shorter scrollable one that auto-scrolls to (and zooms
 *  into) the section matching the active wizard step -- re-centering as
 *  the resume's own content changes, not just once per step. No
 *  `focusSection` (the first step) leaves the window at its natural resting
 *  position: the full header, margin included, nothing to scroll to yet. */
function ScaledSheet({ resume, templateId, cropped, focusSection }: { resume: ResumeData; templateId: string; cropped?: boolean; focusSection?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!cropped || !focusSection || !scale) return;
    const target = sheetRef.current?.querySelector(`[data-section="${focusSection}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });
    // Re-centers as the section's own content grows/shrinks (a new bullet,
    // another education entry), not only when the step itself changes --
    // "I want the zoom to follow the updates."
  }, [cropped, focusSection, scale, resume]);

  const zoomed = cropped && !!focusSection;
  const effectiveScale = scale ? scale * (zoomed ? SECTION_ZOOM_BOOST : 1) : null;
  const fullHeight = scale ? PAGE_HEIGHT * scale : undefined;
  const containerHeight = cropped ? CROPPED_WINDOW_HEIGHT : fullHeight;
  // transform-origin stays top-left (matching the always-correct base fit),
  // so a translateX shifts the now-wider box back by half the extra width
  // it gained -- the same effect as center-anchored scaling, but derived in
  // real container pixels instead of the element's own 816px-wide local
  // space, which is what actually keeps it centered against the container.
  const extraWidth = scale && zoomed ? scale * PAGE_WIDTH * (SECTION_ZOOM_BOOST - 1) : 0;
  const transform = effectiveScale ? `translateX(${-extraWidth / 2}px) scale(${effectiveScale})` : undefined;

  return (
    <div
      ref={containerRef}
      className="print:hidden"
      style={{ width: "100%", height: containerHeight, overflowY: cropped ? "auto" : "hidden", overflowX: "hidden" }}
    >
      <div
        ref={sheetRef}
        data-doc="resume"
        className="dm-report overflow-hidden rounded-[var(--radius-lg)] p-[56px] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)]"
        style={{ ...paperStyle(templateId), width: PAGE_WIDTH, height: PAGE_HEIGHT, transform, transformOrigin: "top left", visibility: scale ? "visible" : "hidden" }}
      >
        <ResumeSheetContent resume={resume} templateId={templateId} />
      </div>
    </div>
  );
}

export function ResumeDocument({ resume, templateId = "classic", cropped, focusSection }: { resume: ResumeData; templateId?: string | ResumeTemplateId; cropped?: boolean; focusSection?: string | null }) {
  return (
    <>
      <ScaledSheet resume={resume} templateId={templateId} cropped={cropped} focusSection={focusSection} />
      {/* Print gets its own natural-flow copy -- the scaled screen version
         is a fixed 1-page box (print:hidden above), but a resume longer
         than one page needs to paginate through the browser's own @page
         rule (app.css) instead of being clipped to that box. */}
      <article data-doc="resume-print" className="dm-report hidden rounded-[var(--radius-lg)] p-[var(--space-8)] print:block" style={paperStyle(templateId)}>
        <ResumeSheetContent resume={resume} templateId={templateId} />
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

const ZOOM_STEP = 25;
const ZOOM_MIN = 50;
const ZOOM_MAX = 200;

/** Full-screen zoom view -- a separate "window" over the same document, with
 *  its own scroll so a zoomed-in page can be panned rather than clipped.
 *  Reuses ScaledSheet's own container-width scaling: at 100% the container
 *  is exactly PAGE_WIDTH (true actual size on screen), so +/- just changes
 *  how much of that real size the container claims. */
export function ZoomResumeButton({ resume, templateId, title }: { resume: ResumeData; templateId?: string | ResumeTemplateId; title: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  return (
    <>
      <button
        type="button"
        data-print-hide
        onClick={() => setOpen(true)}
        className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold"
        style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <ZoomIn className="h-4 w-4" aria-hidden /> Zoom
      </button>
      {open && (
        <Portal>
          <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: "rgba(8,10,18,0.94)" }}>
            <div className="flex flex-none items-center justify-between px-5 py-4">
              <span className="text-[13px] font-bold tracking-[0.06em] text-white uppercase">{title}</span>
              <div className="flex items-center gap-[var(--space-3)]">
                <div className="flex items-center gap-[2px] rounded-full border border-white/20 p-[2px]">
                  <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full text-white">
                    <Minus className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="w-[44px] text-center text-[12.5px] font-bold text-white tabular-nums">{zoom}%</span>
                  <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full text-white">
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-8 pb-8">
              <div className="mx-auto" style={{ width: Math.round(PAGE_WIDTH * (zoom / 100)) }}>
                <ResumeDocument resume={resume} templateId={templateId} />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
