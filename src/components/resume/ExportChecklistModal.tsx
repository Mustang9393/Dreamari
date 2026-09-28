"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import type { ResumeData } from "@/lib/resume";
import { downloadDocx } from "./resumeExport";
import { ErrorView } from "@/components/app/states";
import { CARD_CLASS, INSET, ResumeModal } from "./ui";

// Confirmed live against the reference (20 Sept 2026): its own "Export"
// button opens this exact checklist ("Review Before Exporting", these six
// statements verbatim) before either download unlocks. The Saved Resumes
// list's own download icon stays instant -- that one skips the checklist
// on the reference too.
const CONFIRMATIONS = [
  "My contact information is correct.",
  "My education information is correct.",
  "These skills accurately represent me.",
  "My experience descriptions are truthful.",
  "I reviewed all generated bullet points.",
  "I understand that ATS compatibility does not guarantee an interview.",
] as const;

/** Resume v2, 28 Sept 2026: real, data-derived pass/fail checks, not the
 *  six self-attestation checkboxes above (v1 keeps those exactly as they
 *  are -- this function is never called from the v1 path). Only items
 *  that can actually be evaluated from the resume's own data are here;
 *  disclaimers like "ATS compatibility does not guarantee an interview"
 *  have nothing to check, so v2 drops them rather than inventing a
 *  pass/fail for a sentence. DocumentScreen calls this before ever opening
 *  the panel: if every check passes, Export skips the checklist and
 *  downloads immediately (mirroring how the Saved Resumes list's own
 *  one-click download already skips it); only a real gap opens this
 *  modal, and only with the gaps that are actually there. */
export function exportChecksFor(resume: ResumeData): { label: string; pass: boolean }[] {
  const totalSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length;
  return [
    { label: "Add an email or phone number so employers can reach you.", pass: resume.profile.email.trim().length > 0 || resume.profile.phone.trim().length > 0 },
    { label: "Add at least one school, with its expected graduation year.", pass: resume.education.length > 0 && resume.education.every((e) => e.schoolName.trim().length > 0 && e.gradYear.trim().length > 0) },
    { label: "Add at least one experience with a real bullet point, not just a title.", pass: resume.experience.length > 0 && resume.experience.some((e) => e.bullets.some((b) => b.trim().length > 0)) },
    { label: "Add at least one skill.", pass: totalSkills > 0 },
  ];
}

export function ExportChecklistModal({ resume, onClose, checks }: { resume: ResumeData; onClose: () => void; /** Resume v2 only: the real failing checks to show, computed once by the caller via exportChecksFor -- omitted (v1) keeps the original six-item self-attestation list unchanged. */ checks?: { label: string }[] }) {
  const items = checks ? checks.map((c) => c.label) : CONFIRMATIONS;
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const allChecked = checked.every(Boolean);
  const [downloading, setDownloading] = useState(false);
  // COMPONENT_INVENTORY row 38: downloadDocx (the docx package's dynamic
  // import + Packer.toBlob) had no failure path at all before -- a reject
  // there just left the button stuck on "Preparing…" forever. 27 Sept 2026.
  const [downloadError, setDownloadError] = useState(false);
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));
  const download = async () => {
    setDownloading(true);
    setDownloadError(false);
    try {
      await downloadDocx(resume);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ResumeModal title="Review Before Exporting" onClose={onClose}>
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>{checks ? "A few things to double check before exporting." : "Confirm before downloading."}</p>
      <div className={CARD_CLASS} style={INSET}>
        {items.map((label, i) => (
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
      {downloadError && <ErrorView variant="inline" message="Couldn't prepare the download. Try again, or export a PDF instead." onRetry={download} />}
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
          onClick={download}
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
