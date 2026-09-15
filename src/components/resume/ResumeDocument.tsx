"use client";

import { Expand, Maximize2, Minus, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BorderBeam } from "border-beam";
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

export function dateRange(start: string, end: string, current: boolean) {
  const from = start.trim();
  const to = current ? "Present" : end.trim();
  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;
  return `${from} – ${to}`;
}

/** "People Skills: ...", "Tech Skills: ...", "Languages: ..." -- one line
 *  per non-empty category, shared by every place that flattens the resume
 *  to text (Text Preview, .docx export) so they never drift from each
 *  other. */
export function resumeSkillLines(resume: ResumeData): string[] {
  return [
    resume.skills.people.length > 0 && `People Skills: ${resume.skills.people.join(", ")}`,
    resume.skills.tech.length > 0 && `Tech Skills: ${resume.skills.tech.join(", ")}`,
    resume.skills.languages.length > 0 && `Languages: ${resume.skills.languages.join(", ")}`,
  ].filter((line): line is string => !!line);
}

// ---- Shared entry content -- identical across layouts, just arranged
// differently by each one below. ----

// A field with nothing typed yet still renders -- muted, italic, the same
// placeholder copy its input shows -- rather than an empty span. Two
// reasons at once (direct feedback, 15 Sept 2026): the live-tracking
// camera needs a real `data-field` node to pan to from the moment a new
// entry's modal opens, not just once there's a value to show; and a
// student zooming into a genuinely blank patch of white page reads as
// broken, where a soft placeholder reads as "type here."
function FieldText({ value, placeholder, dataField, className, style }: { value: string; placeholder: string; dataField: string; className: string; style: React.CSSProperties }) {
  const empty = !value.trim();
  return (
    <span data-field={dataField} className={className} style={empty ? { ...style, color: "var(--ink-faint)", fontStyle: "italic" } : style}>
      {empty ? placeholder : value}
    </span>
  );
}

function EducationEntries({ resume, tight }: { resume: ResumeData; tight?: boolean }) {
  if (resume.education.length === 0) return null;
  return (
    <div className="flex flex-col gap-[14px]">
      {resume.education.map((edu) => (
        <div key={edu.id} className="flex flex-col gap-[2px]">
          <div className={tight ? "flex flex-col gap-[1px]" : "flex items-baseline justify-between gap-[12px]"}>
            <FieldText value={edu.schoolName} placeholder="High School Name" dataField={`${edu.id}:schoolName`} className="text-[14px] font-bold" style={{ color: "var(--ink)" }} />
            <FieldText value={edu.gradYear} placeholder="Graduation Year" dataField={`${edu.id}:gradYear`} className="flex-none text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }} />
          </div>
          <FieldText
            value={[edu.cityState, edu.program && `${edu.program} Program`, edu.gpa && `GPA: ${edu.gpa}`].filter(Boolean).join(" · ")}
            placeholder="City, State"
            dataField={`${edu.id}:cityState`}
            className="text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          />
          {edu.honors.length > 0 && <span data-field={`${edu.id}:honors`} className="text-[12.5px]" style={{ color: "var(--ink-faint)" }}>{edu.honors.join(", ")}</span>}
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
              <span data-field={`${exp.id}:title`} className="text-[14.5px] font-bold" style={exp.title.trim() ? { color: "var(--ink)" } : { color: "var(--ink-faint)", fontStyle: "italic" }}>
                {exp.title.trim() || "Job Title"}
                <span className="font-semibold" style={exp.where.trim() ? { color: "var(--ink-soft)" } : { color: "var(--ink-faint)", fontStyle: "italic" }}> at {exp.where.trim() || "Company / Organization"}</span>
              </span>
              <FieldText value={range} placeholder="Start – End" dataField={`${exp.id}:dates`} className="flex-none text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }} />
            </div>
            <FieldText
              value={[kind?.label, exp.location].filter(Boolean).join(" · ")}
              placeholder="City, State"
              dataField={`${exp.id}:location`}
              className="text-[12.5px]"
              style={{ color: "var(--ink-faint)" }}
            />
            {exp.bullets.filter((b) => b.trim()).length > 0 && (
              <ul className="mt-[2px] flex flex-col gap-[3px] pl-[18px]" style={{ listStyleType: "disc", color: "var(--ink-soft)" }}>
                {exp.bullets.filter((b) => b.trim()).map((b, i) => (
                  <li key={i} data-field={`${exp.id}:bullet:${i}`} className="text-[13.5px] leading-[19px]">{b}</li>
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
            <span data-field={`${cert.id}:name`} className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
              <span className="font-bold" style={cert.name.trim() ? { color: "var(--ink)" } : { color: "var(--ink-faint)", fontStyle: "italic" }}>{cert.name.trim() || "Certification Name"}</span>
              {cert.issuer.trim() ? `, ${cert.issuer}` : <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>, Issuing Organization</span>}
              {cert.credentialId && <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}> · ID: {cert.credentialId}</span>}
            </span>
            <FieldText value={range} placeholder="Issue – Expiration" dataField={`${cert.id}:dates`} className="flex-none text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }} />
          </div>
        );
      })}
    </div>
  );
}

// `data-field="profile:contact"` matches the Personal Info step's email/
// phone/country/state/city inputs (direct feedback, 15 Sept 2026: field
// tracking should work on the first page too). A placeholder line shows in
// the wizard preview (`placeholders`) even with nothing typed yet, so
// focusing one of those fields doesn't zoom the camera in on blank space
// -- same "Nothing added yet" muted treatment as every other empty section.
function ContactLine({ resume, align = "center", placeholders }: { resume: ResumeData; align?: "center" | "left"; placeholders?: boolean }) {
  const parts = [
    resume.profile.email,
    resume.profile.phone,
    [resume.profile.city, resume.profile.state].filter(Boolean).join(", "),
    resume.profile.country,
  ].filter(Boolean);
  if (parts.length === 0) {
    if (!placeholders) return null;
    return (
      <p data-field="profile:contact" className={`mt-[8px] text-[13px] italic ${align === "center" ? "text-center" : "text-left"}`} style={{ color: "var(--ink-faint)" }}>
        Email · Phone · City, State
      </p>
    );
  }
  return (
    <p data-field="profile:contact" className={`mt-[8px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[13px] font-semibold ${align === "center" ? "justify-center" : "justify-start"}`} style={{ color: "var(--ink-soft)" }}>
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

// Matches the First/Last Name inputs (`data-field="profile:name"`). Styled
// muted/italic instead of the real accent-colored name whenever both are
// still empty, so the placeholder ("Your Name") reads as a placeholder,
// not as if the student already typed something.
function ProfileName({ resume, className, style }: { resume: ResumeData; className: string; style: CSSProperties }) {
  const hasName = resume.profile.firstName.trim().length > 0 || resume.profile.lastName.trim().length > 0;
  return (
    <h1 data-field="profile:name" className={className} style={hasName ? style : { ...style, color: "var(--ink-faint)", fontStyle: "italic" }}>
      {fullNameOf(resume)}
    </h1>
  );
}

// Matches the Short Bio textarea (`data-field="profile:bio"`). Unlike the
// other placeholders, bio has no natural fallback line to show muted --
// omitting it out of the flow entirely (the pre-existing behavior) is fine
// once the field-tracking fit falls back to framing the whole header
// instead of a field that isn't there yet.
function ProfileBio({ resume, className, style }: { resume: ResumeData; className: string; style: CSSProperties }) {
  if (!resume.profile.bio.trim()) return null;
  return <p data-field="profile:bio" className={className} style={style}>{resume.profile.bio.trim()}</p>;
}

// ---- Layouts -- same underlying content, four different arrangements. ----

/** Nothing typed yet, but this is the empty resume's own "you are here"
 *  hint -- shown only in the wizard's live preview (`placeholders`), never
 *  on the real document/print output, which just omits an empty section
 *  entirely as before. Direct feedback, 14 Sept 2026: "the skills title
 *  should already be there on the preview so i know where its going to be
 *  populating" -- as soon as the Skills step (or its modal) is open, not
 *  only after the first skill is actually saved. */
function EmptyHint() {
  return <p className="text-[12.5px] italic" style={{ color: "var(--ink-faint)" }}>Nothing added yet</p>;
}

function SingleColumnLayout({ resume, placeholders }: { resume: ResumeData; placeholders?: boolean }) {
  const hasSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0;
  return (
    <>
      <header data-print-keep data-section="profile" className="flex flex-col items-center text-center">
        <ProfileName resume={resume} className="text-[26px] leading-[30px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }} />
        <ContactLine resume={resume} align="center" placeholders={placeholders} />
        <ProfileBio resume={resume} className="mt-[14px] max-w-[560px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }} />
      </header>
      <div className="mt-[28px] flex flex-col gap-[24px]">
        {(resume.education.length > 0 || placeholders) && <section data-section="education" className="flex flex-col gap-[14px]"><SectionLabel>Education</SectionLabel>{resume.education.length > 0 ? <EducationEntries resume={resume} /> : <EmptyHint />}</section>}
        {(resume.experience.length > 0 || placeholders) && <section data-section="experience" className="flex flex-col gap-[14px]"><SectionLabel>Experience &amp; Activities</SectionLabel>{resume.experience.length > 0 ? <ExperienceEntries resume={resume} /> : <EmptyHint />}</section>}
        {(hasSkills || placeholders) && <section data-section="skills" className="flex flex-col gap-[14px]"><SectionLabel>Skills</SectionLabel>{hasSkills ? <SkillsBlock resume={resume} /> : <EmptyHint />}</section>}
        {(resume.certifications.length > 0 || placeholders) && <section data-section="certifications" className="flex flex-col gap-[14px]"><SectionLabel>Certifications</SectionLabel>{resume.certifications.length > 0 ? <CertificationEntries resume={resume} /> : <EmptyHint />}</section>}
      </div>
    </>
  );
}

function SidebarLayout({ resume, placeholders }: { resume: ResumeData; placeholders?: boolean }) {
  const hasSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0;
  return (
    <div className="flex gap-[28px]">
      <aside data-section="profile" className="flex w-[210px] flex-none flex-col gap-[22px] rounded-[8px] p-[16px]" style={{ background: "var(--accent-tint)" }}>
        <div>
          <ProfileName resume={resume} className="text-[19px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }} />
        </div>
        {resume.profile.email || resume.profile.phone || resume.profile.city || resume.profile.state || resume.profile.country ? (
          <div data-field="profile:contact" className="flex flex-col gap-[4px] text-[12px] font-semibold" style={{ color: "var(--ink-soft)" }}>
            {resume.profile.email && <span>{resume.profile.email}</span>}
            {resume.profile.phone && <span>{resume.profile.phone}</span>}
            {(resume.profile.city || resume.profile.state) && <span>{[resume.profile.city, resume.profile.state].filter(Boolean).join(", ")}</span>}
            {resume.profile.country && <span>{resume.profile.country}</span>}
          </div>
        ) : placeholders ? (
          <div data-field="profile:contact" className="flex flex-col gap-[2px] text-[12px] italic" style={{ color: "var(--ink-faint)" }}>
            <span>Email</span>
            <span>Phone</span>
            <span>City, State</span>
          </div>
        ) : null}
        {(hasSkills || placeholders) && <div data-section="skills" className="flex flex-col gap-[8px]"><SectionLabel variant="plain">Skills</SectionLabel>{hasSkills ? <SkillsBlock resume={resume} stacked /> : <EmptyHint />}</div>}
        {(resume.certifications.length > 0 || placeholders) && <div data-section="certifications" className="flex flex-col gap-[8px]"><SectionLabel variant="plain">Certifications</SectionLabel>{resume.certifications.length > 0 ? <CertificationEntries resume={resume} tight /> : <EmptyHint />}</div>}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
        <ProfileBio resume={resume} className="text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }} />
        {(resume.education.length > 0 || placeholders) && <section data-section="education" className="flex flex-col gap-[12px]"><SectionLabel>Education</SectionLabel>{resume.education.length > 0 ? <EducationEntries resume={resume} /> : <EmptyHint />}</section>}
        {(resume.experience.length > 0 || placeholders) && <section data-section="experience" className="flex flex-col gap-[12px]"><SectionLabel>Experience &amp; Activities</SectionLabel>{resume.experience.length > 0 ? <ExperienceEntries resume={resume} /> : <EmptyHint />}</section>}
      </div>
    </div>
  );
}

function MinimalLayout({ resume, placeholders }: { resume: ResumeData; placeholders?: boolean }) {
  const hasSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0;
  return (
    <>
      <header data-print-keep data-section="profile" className="flex flex-col items-start text-left">
        <ProfileName resume={resume} className="text-[24px] leading-[28px] font-semibold tracking-[0.01em]" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }} />
        <ContactLine resume={resume} align="left" placeholders={placeholders} />
        <ProfileBio resume={resume} className="mt-[14px] max-w-[560px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }} />
      </header>
      <div className="mt-[32px] flex flex-col gap-[28px]">
        {(resume.education.length > 0 || placeholders) && <section data-section="education" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Education</SectionLabel>{resume.education.length > 0 ? <EducationEntries resume={resume} /> : <EmptyHint />}</section>}
        {(resume.experience.length > 0 || placeholders) && <section data-section="experience" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Experience &amp; Activities</SectionLabel>{resume.experience.length > 0 ? <ExperienceEntries resume={resume} /> : <EmptyHint />}</section>}
        {(hasSkills || placeholders) && <section data-section="skills" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Skills</SectionLabel>{hasSkills ? <SkillsBlock resume={resume} /> : <EmptyHint />}</section>}
        {(resume.certifications.length > 0 || placeholders) && <section data-section="certifications" className="flex flex-col gap-[14px]"><SectionLabel variant="plain">Certifications</SectionLabel>{resume.certifications.length > 0 ? <CertificationEntries resume={resume} /> : <EmptyHint />}</section>}
      </div>
    </>
  );
}

function BannerLayout({ resume, placeholders }: { resume: ResumeData; placeholders?: boolean }) {
  const hasSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0;
  return (
    <>
      <header data-print-keep data-section="profile" className="flex flex-col gap-[4px]">
        <ProfileName resume={resume} className="text-[30px] leading-[34px] font-bold" style={{ fontFamily: "var(--name-font)", color: "var(--accent)" }} />
        <ContactLine resume={resume} align="left" placeholders={placeholders} />
        <div className="mt-[10px] h-[4px] w-full rounded-full" style={{ background: "var(--accent)" }} />
        <ProfileBio resume={resume} className="mt-[10px] max-w-[600px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }} />
      </header>
      <div className="mt-[24px] flex flex-col gap-[24px]">
        {(resume.education.length > 0 || placeholders) && <section data-section="education" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Education</SectionLabel>{resume.education.length > 0 ? <EducationEntries resume={resume} /> : <EmptyHint />}</section>}
        {(resume.experience.length > 0 || placeholders) && <section data-section="experience" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Experience &amp; Activities</SectionLabel>{resume.experience.length > 0 ? <ExperienceEntries resume={resume} /> : <EmptyHint />}</section>}
        {(hasSkills || placeholders) && <section data-section="skills" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Skills</SectionLabel>{hasSkills ? <SkillsBlock resume={resume} /> : <EmptyHint />}</section>}
        {(resume.certifications.length > 0 || placeholders) && <section data-section="certifications" className="flex flex-col gap-[12px]"><SectionLabel variant="bar">Certifications</SectionLabel>{resume.certifications.length > 0 ? <CertificationEntries resume={resume} /> : <EmptyHint />}</section>}
      </div>
    </>
  );
}

function ResumeSheetContent({ resume, templateId, placeholders }: { resume: ResumeData; templateId: string; placeholders?: boolean }) {
  const layout = templateFor(templateId).layout;
  if (layout === "sidebar") return <SidebarLayout resume={resume} placeholders={placeholders} />;
  if (layout === "minimal") return <MinimalLayout resume={resume} placeholders={placeholders} />;
  if (layout === "banner") return <BannerLayout resume={resume} placeholders={placeholders} />;
  return <SingleColumnLayout resume={resume} placeholders={placeholders} />;
}

type ContentZoom = { scale: number; tx: number; ty: number };

const CONTENT_PAD = 28;

/** The real, tight horizontal extent of a section's TEXT -- not its box.
 *  Every section wrapper stretches to fill the page column (flex layouts
 *  do that by default), and bullet `<li>`s stretch the same way inside
 *  their flex `<ul>`, so `offsetWidth` on either one is the column width
 *  regardless of how short the actual words are; a decorative full-width
 *  `<Rule/>` under a section heading makes even a text-node walk of the
 *  wrong element lie the same way. Walking only non-empty TEXT NODES and
 *  measuring each one's own Range rect sidesteps all of that -- a Range
 *  around a text node (not an element) only ever reports the glyphs'
 *  actual line-box rects, never a stretched container's. Coordinates come
 *  back in CURRENT screen space (whatever transform is already applied),
 *  so the caller un-scales/un-translates them back to the page's own
 *  untransformed pixels. */
function measureTextExtent(root: HTMLElement): { left: number; right: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.textContent && n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const range = document.createRange();
  let left = Infinity;
  let right = -Infinity;
  let node = walker.nextNode();
  while (node) {
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      left = Math.min(left, rect.left);
      right = Math.max(right, rect.right);
    }
    node = walker.nextNode();
  }
  return Number.isFinite(left) ? { left, right } : null;
}

/** Renders the fixed-size sheet at real dimensions, scaled to fit whatever
 *  width its container offers -- the same technique document editors use
 *  for their page preview, so what's on screen is proportionally identical
 *  to a full-size page rather than an arbitrary content-sized box.
 *
 *  Fit-to-screen -- the whole page always visible -- is the baseline now,
 *  not a manual opt-out from an automatic zoom (direct feedback, 16 Sept
 *  2026, after review with a second designer: automatic zoom-to-field lost
 *  the "where on the page am I" context a live preview exists to answer --
 *  "I put a date, it zoomed in... without me knowing where it is in the
 *  whole resume"). The camera-tracking behaviour still exists in full --
 *  `cropped` + `focusSection` fits the focused section/field into the frame
 *  and re-fits as it grows, panning smoothly between targets -- but only
 *  once the student explicitly turns on "Follow Me". That choice sticks
 *  across steps in either direction (no more resetting on every section
 *  change, which is what made the old manual toggle feel like it didn't
 *  actually work as a preference). */
function ScaledSheet({ resume, templateId, cropped, focusSection, activeField }: { resume: ResumeData; templateId: string; cropped?: boolean; focusSection?: string | null; activeField?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [contentZoom, setContentZoom] = useState<ContentZoom | null>(null);
  const [followMe, setFollowMe] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setScale(el.offsetWidth / PAGE_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fits either the focused FIELD (while a drawer input for it is
  // focused) or, failing that, the focused SECTION's real text into the
  // available frame. Both width and height bound the scale so whichever
  // axis is tighter wins (direct feedback, 15 Sept 2026: a wide line was
  // getting cropped when only height drove it; a *dead gap* appeared when
  // the fit was measured off each section's full-width box instead, since
  // the box is always the whole column no matter how short its text is --
  // the actual fix is measuring the real content, not guessing a
  // compromise). Re-runs on every resume change so the frame follows
  // content as it grows, and on every `activeField` change so the camera
  // tracks field-by-field while a drawer is open (also direct feedback:
  // "when I am on the graduation year input field, pan the zoom to show
  // the year... the camera tracking all updates one by one, per field").
  // Reads real DOM layout -- an external system, exactly what
  // set-state-in-effect exists to allow.
  useEffect(() => {
    if (!cropped || !scale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContentZoom(null);
      return;
    }
    const container = containerRef.current;
    const root = sheetRef.current;
    if (!container || !root) {
      setContentZoom(null);
      return;
    }
    // The field the drawer is currently focused on, if it exists in the
    // rendered resume yet -- a brand new entry being added has nothing to
    // find here until it's saved, which just falls back to the section fit
    // below (still useful context while typing a new entry). Looked up
    // across the WHOLE sheet, not scoped to `focusSection` -- Personal
    // Info (step 0) has no section of its own (direct feedback, 14 Sept
    // 2026: nothing to zoom to there by default), but its fields still
    // live under `data-section="profile"` and should track like any other
    // field once one is actually focused (direct feedback, 15 Sept 2026:
    // "the tracking zoom and panning should also work for the first page").
    const fieldTarget = activeField ? root.querySelector<HTMLElement>(`[data-field="${activeField}"]`) : null;
    const sectionTarget = focusSection ? root.querySelector<HTMLElement>(`[data-section="${focusSection}"]`) : null;
    const target = fieldTarget ?? sectionTarget;
    if (!target) {
      setContentZoom(null);
      return;
    }
    const fieldMode = !!fieldTarget;

    const extent = measureTextExtent(target);
    if (!extent) {
      setContentZoom(null);
      return;
    }
    const availW = container.clientWidth;
    const availH = container.clientHeight;
    const containerRect = container.getBoundingClientRect();
    // extent.left/right are in CURRENT on-screen pixels (whatever
    // transform is already painted) -- un-scale/un-translate by that same
    // transform to get back to the page's own untransformed pixels.
    const currentScale = contentZoom?.scale ?? scale;
    const currentTx = contentZoom?.tx ?? 0;
    const contentLeft = (extent.left - containerRect.left - currentTx) / currentScale;
    const contentWidth = Math.max((extent.right - extent.left) / currentScale, 40);
    const heightFit = (availH - CONTENT_PAD * 2) / target.offsetHeight;
    const widthFit = (availW - CONTENT_PAD * 2) / contentWidth;
    // `coverScale` is the CSS `background-size: cover` idea: whatever
    // scale the content wants, never drop below what it takes for the
    // full page to cover the frame in both directions, so there's always
    // real page at every edge and never a blank gap.
    const coverScale = Math.max(availW / PAGE_WIDTH, availH / PAGE_HEIGHT);
    // Section mode: height alone drives HOW MUCH we zoom in (direct
    // feedback, 15 Sept 2026: width capping the scale meant sections near
    // the top of the page barely zoomed at all). Field mode: BOTH axes
    // bound the scale, so the one field's whole value -- a full paragraph,
    // not just a line -- stays fully visible rather than cropping like a
    // section can ("try and show the entire paragraph... if we are on
    // that field").
    const targetScale = fieldMode
      ? Math.min(Math.max(Math.min(widthFit, heightFit), scale, coverScale), scale * 2.5, 1.8)
      : Math.min(Math.max(heightFit, scale, coverScale), scale * 2.5, 1.8);
    const centerLocalY = target.offsetTop + target.offsetHeight / 2;
    const minTx = availW - PAGE_WIDTH * targetScale;
    const minTy = availH - PAGE_HEIGHT * targetScale;
    // Section mode anchors to the LEFT edge of the real text, not its
    // center -- once zoomed in, a wide row (name left, date pinned far
    // right) can't show both ends, and the left-aligned name/title is what
    // identifies the section, so that stays in frame while the date runs
    // off the right. Field mode centers instead: a single field's value is
    // meant to be read whole, not anchored past an edge. Both modes clamp
    // inside the page's own edges, so a short line never drags the whole
    // page off-center to "center" itself.
    const tx = fieldMode
      ? Math.min(0, Math.max(minTx, availW / 2 - (contentLeft + contentWidth / 2) * targetScale))
      : Math.min(0, Math.max(minTx, CONTENT_PAD - contentLeft * targetScale));
    const ty = Math.min(0, Math.max(minTy, availH / 2 - centerLocalY * targetScale));
    setContentZoom({ scale: targetScale, tx, ty });
    // contentZoom itself is read only to invert the CURRENTLY-painted
    // transform above, not as a trigger -- this effect already owns every
    // update to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropped, focusSection, scale, resume, activeField]);

  // `contentZoom` being non-null already means a real target was found
  // (field or section) -- not gated on `focusSection` itself, since step
  // 0 (Personal Info) has none by default but still zooms once a field on
  // it is actually focused. Zooming itself now only happens with Follow
  // Me explicitly on.
  const zoomed = cropped && !!contentZoom && followMe;
  // translate3d/scale3d, not the 2D form -- promotes this to its own GPU
  // layer up front instead of only while the transition is actually
  // running, which is what was reading as a soft/blurry moment on the
  // text every time the camera panned to a new field or section (direct
  // feedback, 16 Sept 2026: "theres some unintentional distortion
  // happening when it updates"). No blur/glass filter was ever applied
  // here (removed for good in an earlier pass, see the comment below) --
  // this was a rasterization artifact of animating `scale()` on a
  // text-heavy layer, not a leftover effect.
  const transform = zoomed && contentZoom
    ? `translate3d(${contentZoom.tx}px, ${contentZoom.ty}px, 0) scale3d(${contentZoom.scale}, ${contentZoom.scale}, 1)`
    : scale
      ? `scale3d(${scale}, ${scale}, 1)`
      : undefined;
  const containerHeight = cropped ? "100%" : scale ? PAGE_HEIGHT * scale : undefined;
  const accent = templateFor(templateId).accent;
  const canFollow = cropped && !!contentZoom;

  return (
    <div
      className="relative min-w-0 overflow-hidden print:hidden"
      style={{
        width: "100%",
        height: containerHeight,
        minWidth: 0,
        minHeight: 0,
        borderRadius: zoomed ? 28 : "var(--radius-lg)",
        transition: "border-radius 0.25s ease, box-shadow 0.25s ease",
        // A solid dark bezel (not a blur) plus a lifted shadow, matched
        // against a real loupe photo (15 Sept 2026): the rim itself reads
        // sharp against the page, the way an actual glass edge does.
        boxShadow: zoomed
          ? `0 30px 60px -16px rgba(0,0,0,0.55), 0 12px 28px -10px rgba(0,0,0,0.4), 0 0 0 2px rgba(20,20,20,0.55), 0 0 0 5px color-mix(in srgb, ${accent} 20%, transparent)`
          : undefined,
      }}
    >
      <div ref={containerRef} className="relative h-full w-full overflow-hidden">
        <div
          ref={sheetRef}
          data-doc="resume"
          className="dm-report overflow-hidden rounded-[var(--radius-lg)] p-[56px] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.75)]"
          style={{
            ...paperStyle(templateId),
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            transform,
            transformOrigin: "top left",
            transition: "transform 0.38s cubic-bezier(0.3,0.1,0.2,1)",
            visibility: scale ? "visible" : "hidden",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <ResumeSheetContent resume={resume} templateId={templateId} placeholders={cropped} />
        </div>
        {/* An SVG turbulence+displacement "glass" layer was tried here
           three times over (14-15 Sept 2026) -- backdrop-filter: url(...)
           referencing the filter (poor/no cross-browser support, nothing
           rendered), then the same filter applied directly and masked to
           a rim, which instead painted a large grey smear because the
           frame wasn't fully covered by the page at the time (the fit-
           scale bug fixed above) and a decorative full-width `<Rule/>`
           was inflating what counted as "edge." Retired for good: a
           bezel + shine reads as "glass" reliably in every browser, which
           three attempts at real refraction did not. */}
        {/* Light falling on the glass: a bright sheen toward the top-left
           (the Figma glass panel's own default light angle) and a fainter
           secondary reflection lower down. Plain static gradients, no
           filter cost. */}
        {zoomed && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                "radial-gradient(140% 90% at 18% 8%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%)",
                "radial-gradient(90% 60% at 82% 96%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 45%)",
                "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 88%, rgba(0,0,0,0.08) 100%)",
              ].join(", "),
            }}
          />
        )}
      </div>
      {canFollow && (
        <div className="absolute top-3 right-3 z-10">
          {followMe ? (
            <button
              type="button"
              data-print-hide
              aria-label="Stop following -- show the whole page"
              title="Stop following -- show the whole page"
              onClick={() => setFollowMe(false)}
              className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[7px] text-[12px] font-bold"
              style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 88%, transparent)", color: "var(--foreground)" }}
            >
              <Expand className="h-3.5 w-3.5" aria-hidden /> Fit to Screen
            </button>
          ) : (
            // The invitation itself gets the flashy treatment -- once it's
            // on, the camera motion is already the interesting part, so the
            // button settles into a plain state rather than competing with
            // the page it's supposed to help read (direct feedback, 16
            // Sept 2026: "a toggle like follow me with the beam border...
            // for a cooler effect").
            <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active>
              <button
                type="button"
                data-print-hide
                aria-label="Follow Me -- zoom in on whatever you're editing"
                title="Follow Me -- zoom in on whatever you're editing"
                onClick={() => setFollowMe(true)}
                className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full border px-[12px] py-[7px] text-[12px] font-bold"
                style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 88%, transparent)", color: "var(--foreground)" }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Follow Me
              </button>
            </BorderBeam>
          )}
        </div>
      )}
    </div>
  );
}

export function ResumeDocument({ resume, templateId = "classic", cropped, focusSection, activeField }: { resume: ResumeData; templateId?: string | ResumeTemplateId; cropped?: boolean; focusSection?: string | null; activeField?: string | null }) {
  return (
    <>
      <ScaledSheet resume={resume} templateId={templateId} cropped={cropped} focusSection={focusSection} activeField={activeField} />
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
        <Maximize2 className="h-4 w-4" aria-hidden /> Full Screen
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
