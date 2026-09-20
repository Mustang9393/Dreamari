// The .docx export itself -- moved out of the (now-deleted)
// ExportChecklistModal.tsx so it has a home independent of any UI around
// it. Two callers: the Saved Resumes list's own Download icon
// (ResumeExperience.tsx, always immediate, no confirmation) and the
// document toolbar's Export button (ResumeBuilderExperience.tsx, made
// immediate too -- see the comment at that call site for why).
import { dateRange, resumeSkillLines } from "./ResumeDocument";
import type { ResumeData } from "@/lib/resume";

export async function downloadDocx(resume: ResumeData) {
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
    // Row order matches the reference and the on-screen preview: company +
    // location first, title + dates second, then bullets.
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: "PROFESSIONAL EXPERIENCES", bold: true })] }));
    for (const exp of resume.experience) {
      children.push(new Paragraph({ children: [new TextRun({ text: exp.where || "Company / Organization", bold: true }), new TextRun({ text: exp.location ? `  |  ${exp.location}` : "" })] }));
      const range = dateRange(exp.startDate, exp.endDate, exp.current);
      const titleLine = [exp.title || "Job Title", range || (exp.title.trim() ? "Not Specified" : "")].filter(Boolean).join("  |  ");
      children.push(new Paragraph({ children: [new TextRun({ text: titleLine, italics: true, size: 20 })] }));
      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: bullet, size: 21 })] }));
      }
    }
  }

  const skillLines = resumeSkillLines(resume);
  if (skillLines.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: "SKILLS & INTEREST", bold: true })] }));
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
