"use client";

import type { ResumeData } from "@/lib/resume";
import { dateRange, resumeSkillLines } from "./ResumeDocument";
import { CARD_CLASS, INSET, NOT_A_GUARANTEE_NOTE, ResumeModal } from "./ui";

// What an ATS parser typically sees: flattened plain text, no layout, no
// styling. Built straight from the data model (not scraped off the visual
// document) so it can never drift from what's actually in the resume.
function resumeToPlainText(resume: ResumeData): string {
  const lines: string[] = [];
  const name = `${resume.profile.firstName} ${resume.profile.lastName}`.trim();
  if (name) lines.push(name);
  const contact = [resume.profile.email, resume.profile.phone, [resume.profile.city, resume.profile.state].filter(Boolean).join(", ")].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);

  if (resume.education.length > 0) {
    lines.push("", "EDUCATION");
    for (const edu of resume.education) {
      lines.push([edu.schoolName, edu.cityState].filter(Boolean).join(" | "));
      const meta = [edu.program && `${edu.program} Program`, edu.gpa && `GPA: ${edu.gpa}`, edu.gradYear].filter(Boolean).join(" | ");
      if (meta) lines.push(meta);
    }
  }

  if (resume.experience.length > 0) {
    lines.push("", "EXPERIENCE");
    for (const exp of resume.experience) {
      lines.push([exp.title, exp.where].filter(Boolean).join(" | "));
      const range = dateRange(exp.startDate, exp.endDate, exp.current);
      if (exp.location || range) lines.push([exp.location, range].filter(Boolean).join(" | "));
      for (const bullet of exp.bullets) if (bullet.trim()) lines.push(`* ${bullet}`);
    }
  }

  const skillLines = resumeSkillLines(resume);
  if (skillLines.length > 0) lines.push("", "SKILLS", ...skillLines);

  if (resume.certifications.length > 0) {
    lines.push("", "CERTIFICATIONS");
    for (const cert of resume.certifications) lines.push([cert.name, cert.issuer, cert.issueDate].filter(Boolean).join(" | "));
  }

  return lines.join("\n");
}

export function TextPreviewModal({ resume, onClose }: { resume: ResumeData; onClose: () => void }) {
  return (
    <ResumeModal title="ATS Text Preview" onClose={onClose}>
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>How your resume looks as plain text. {NOT_A_GUARANTEE_NOTE}</p>
      <pre className={`${CARD_CLASS} overflow-x-auto text-[12.5px] leading-[1.6] whitespace-pre-wrap`} style={{ ...INSET, fontFamily: "var(--font-mono, monospace)", color: "var(--foreground)" }}>
        {resumeToPlainText(resume)}
      </pre>
    </ResumeModal>
  );
}
