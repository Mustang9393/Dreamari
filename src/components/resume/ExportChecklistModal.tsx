"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import type { ResumeData } from "@/lib/resume";
import { downloadDocx } from "./resumeExport";
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

export function ExportChecklistModal({ resume, onClose }: { resume: ResumeData; onClose: () => void }) {
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
