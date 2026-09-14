"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import type { ResumeData } from "@/lib/resume";
import { CARD_CLASS, INSET, ResumeModal } from "./ui";

const CONFIRMATIONS = [
  "My contact information is correct.",
  "My education information is correct.",
  "These skills accurately represent me.",
  "My experience descriptions are truthful.",
  "I reviewed all generated bullet points.",
  "I understand that ATS compatibility does not guarantee an interview.",
] as const;

async function downloadDocx(resume: ResumeData) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");
  const name = `${resume.profile.firstName} ${resume.profile.lastName}`.trim() || "Resume";
  const contact = [resume.profile.email, resume.profile.phone, [resume.profile.city, resume.profile.state].filter(Boolean).join(", ")].filter(Boolean).join("  |  ");

  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: name.toUpperCase(), bold: true, size: 32 })] }),
    ...(contact ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: contact, size: 20 })] })] : []),
  ];

  if (resume.education.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: "EDUCATION", bold: true })] }));
    for (const edu of resume.education) {
      children.push(new Paragraph({ children: [new TextRun({ text: edu.schoolName, bold: true }), new TextRun({ text: edu.cityState ? `  |  ${edu.cityState}` : "" })] }));
      const meta = [edu.program && `${edu.program} Program`, edu.gpa && `GPA: ${edu.gpa}`, edu.gradYear].filter(Boolean).join("  |  ");
      if (meta) children.push(new Paragraph({ children: [new TextRun({ text: meta, italics: true, size: 20 })] }));
    }
  }

  if (resume.experience.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: "EXPERIENCE", bold: true })] }));
    for (const exp of resume.experience) {
      children.push(new Paragraph({ children: [new TextRun({ text: exp.title || "Role", bold: true }), new TextRun({ text: exp.where ? ` at ${exp.where}` : "" })] }));
      const range = exp.startDate || exp.endDate ? `${exp.startDate}${exp.current ? " - Present" : exp.endDate ? ` - ${exp.endDate}` : ""}` : "";
      const meta = [exp.location, range].filter(Boolean).join("  |  ");
      if (meta) children.push(new Paragraph({ children: [new TextRun({ text: meta, italics: true, size: 20 })] }));
      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: bullet, size: 21 })] }));
      }
    }
  }

  const skillLines = [
    resume.skills.people.length > 0 && `People Skills: ${resume.skills.people.join(", ")}`,
    resume.skills.tech.length > 0 && `Tech Skills: ${resume.skills.tech.join(", ")}`,
    resume.skills.languages.length > 0 && `Languages: ${resume.skills.languages.join(", ")}`,
  ].filter(Boolean) as string[];
  if (skillLines.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: "SKILLS", bold: true })] }));
    for (const line of skillLines) children.push(new Paragraph({ children: [new TextRun({ text: line, size: 21 })] }));
  }

  if (resume.certifications.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: "CERTIFICATIONS", bold: true })] }));
    for (const cert of resume.certifications) children.push(new Paragraph({ children: [new TextRun({ text: [cert.name, cert.issuer, cert.issueDate].filter(Boolean).join("  |  "), size: 21 })] }));
  }

  const doc = new Document({
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_") || "Resume"}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportChecklistModal({ resume, onClose }: { resume: ResumeData; templateId: string; onClose: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => CONFIRMATIONS.map(() => false));
  const allChecked = checked.every(Boolean);
  const [downloading, setDownloading] = useState(false);
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));

  return (
    <ResumeModal title="Review Before Exporting" onClose={onClose}>
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Confirm before downloading.</p>
      <div className={CARD_CLASS} style={INSET}>
        {CONFIRMATIONS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => toggle(i)}
            className="dm-tap flex cursor-pointer items-start gap-[10px] text-left"
          >
            <span
              className="mt-[1px] flex size-[18px] flex-none items-center justify-center rounded-[5px] border text-[11px] font-bold"
              style={checked[i] ? { background: "var(--primary)", borderColor: "var(--primary)", color: "white" } : { borderColor: "var(--glass-border)" }}
            >
              {checked[i] ? "✓" : ""}
            </span>
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
          </button>
        ))}
      </div>
      <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Check what file type the employer wants. If they don&apos;t say, .docx usually works best.</p>
      <div className="flex flex-wrap items-center justify-end gap-[var(--space-3)]">
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!allChecked}
          className="dm-tap flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <Printer className="h-4 w-4" aria-hidden /> Export PDF
        </button>
        <button
          type="button"
          onClick={async () => { setDownloading(true); try { await downloadDocx(resume); } finally { setDownloading(false); } }}
          disabled={!allChecked || downloading}
          className="dm-tap flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          <Download className="h-4 w-4" aria-hidden /> {downloading ? "Preparing…" : "Download .docx"}
        </button>
      </div>
    </ResumeModal>
  );
}
