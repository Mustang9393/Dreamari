"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { DEFAULT_SECTION_ORDER, upsertVersion, type ResumeData, type ResumeSectionId, type ResumeVersion } from "@/lib/resume";
import { dateRange, resumeSkillLines } from "./ResumeDocument";
import { CARD_CLASS, INSET, ResumeModal } from "./ui";
import { IconTip } from "@/components/app/IconTip";

const SECTION_LABEL: Record<ResumeSectionId, string> = {
  education: "Education",
  experience: "Professional Experiences",
  skills: "Skills & Interest",
  certifications: "Certifications",
};

// The flattened plain text a raw edit starts from -- same shape as
// TextPreviewModal's per-section text, kept local since that modal builds
// the whole document as one string rather than section by section.
function flattenSection(resume: ResumeData, id: ResumeSectionId): string {
  const lines: string[] = [];
  if (id === "education") {
    for (const edu of resume.education) {
      lines.push([edu.schoolName, edu.cityState].filter(Boolean).join(" | "));
      const meta = [edu.program && `${edu.program} Program`, edu.gpa && `GPA: ${edu.gpa}`, edu.gradYear].filter(Boolean).join(" | ");
      if (meta) lines.push(meta);
    }
  } else if (id === "experience") {
    for (const exp of resume.experience) {
      lines.push([exp.title, exp.where].filter(Boolean).join(" | "));
      const range = dateRange(exp.startDate, exp.endDate, exp.current);
      if (exp.location || range) lines.push([exp.location, range].filter(Boolean).join(" | "));
      for (const bullet of exp.bullets) if (bullet.trim()) lines.push(`* ${bullet}`);
    }
  } else if (id === "skills") {
    lines.push(...resumeSkillLines(resume));
  } else {
    for (const cert of resume.certifications) lines.push([cert.name, cert.issuer, cert.issueDate].filter(Boolean).join(" | "));
  }
  return lines.join("\n");
}

/** The reference's "Edit Sections" panel, opened from a saved resume's
 *  toolbar: reorder sections with up/down arrows, hide one from the
 *  document entirely, or drop into a section's raw flattened text and
 *  hand-edit it directly. State lives on the version itself
 *  (sectionOrder/hiddenSections/sectionOverrides) so it round-trips with
 *  everything else about that resume. */
export function EditSectionsPanel({ resume, version, onClose }: { resume: ResumeData; version: ResumeVersion; onClose: () => void }) {
  const [order, setOrder] = useState<ResumeSectionId[]>(version.sectionOrder ?? DEFAULT_SECTION_ORDER);
  const [hidden, setHidden] = useState<ResumeSectionId[]>(version.hiddenSections ?? []);
  const [overrides, setOverrides] = useState<Partial<Record<ResumeSectionId, string>>>(version.sectionOverrides ?? {});
  const [expanded, setExpanded] = useState<ResumeSectionId | null>(null);

  function move(id: ResumeSectionId, dir: -1 | 1) {
    setOrder((current) => {
      const index = current.indexOf(id);
      const next = index + dir;
      if (next < 0 || next >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  function toggleHidden(id: ResumeSectionId) {
    setHidden((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
  }

  function save() {
    upsertVersion({ ...version, sectionOrder: order, hiddenSections: hidden, sectionOverrides: overrides, updatedAt: Date.now() });
    onClose();
  }

  // Replaces the document view's whole content column, not a small popup
  // -- kept "inline" like it always was (see ResumeModal, ui.tsx).
  return (
    <ResumeModal title="Edit Sections" onClose={onClose} presentation="inline">
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Reorder, hide, or hand-edit what shows up on this resume.</p>
      <div className="flex flex-col gap-[var(--space-3)]">
        {order.map((id, index) => {
          const isHidden = hidden.includes(id);
          const isOpen = expanded === id;
          return (
            <div key={id} className={CARD_CLASS} style={INSET}>
              <div className="flex items-center gap-[var(--space-3)]">
                <div className="flex flex-none flex-col">
                  <IconTip label="Move up">
                  <button type="button" aria-label={`Move ${SECTION_LABEL[id]} up`} disabled={index === 0} onClick={() => move(id, -1)} className="dm-quiet flex size-6 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] disabled:cursor-not-allowed disabled:opacity-30" style={{ color: "var(--muted-foreground)" }}>
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  </IconTip>
                  <IconTip label="Move down">
                  <button type="button" aria-label={`Move ${SECTION_LABEL[id]} down`} disabled={index === order.length - 1} onClick={() => move(id, 1)} className="dm-quiet flex size-6 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] disabled:cursor-not-allowed disabled:opacity-30" style={{ color: "var(--muted-foreground)" }}>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  </IconTip>
                </div>
                <button type="button" onClick={() => setExpanded(isOpen ? null : id)} className="dm-quiet flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-[1px] text-left" style={{ opacity: isHidden ? 0.5 : 1 }}>
                  <span className="text-[14.5px] font-extrabold" style={{ color: "var(--foreground)" }}>{SECTION_LABEL[id]}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{isHidden ? "Hidden" : overrides[id] ? "Custom text" : isOpen ? "Editing" : "Tap to edit as text"}</span>
                </button>
                <button
                  type="button"
                  aria-label={isHidden ? `Show ${SECTION_LABEL[id]}` : `Hide ${SECTION_LABEL[id]}`}
                  onClick={() => toggleHidden(id)}
                  className="dm-tap flex flex-none cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] border px-[10px] py-[6px] text-[12px] font-bold"
                  style={isHidden ? { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" } : { borderColor: "var(--primary)", color: "var(--primary)" }}
                >
                  {isHidden ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
                  {isHidden ? "Hidden" : "Visible"}
                </button>
              </div>
              {isOpen && (
                <div className="flex flex-col gap-[8px]">
                  <textarea
                    value={overrides[id] ?? flattenSection(resume, id)}
                    onChange={(e) => setOverrides((current) => ({ ...current, [id]: e.target.value }))}
                    rows={6}
                    className="w-full rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] text-[13px] leading-[1.6] outline-none focus:border-[var(--primary)]"
                    style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-mono, monospace)" }}
                  />
                  {overrides[id] !== undefined && (
                    <button
                      type="button"
                      onClick={() => setOverrides((current) => { const next = { ...current }; delete next[id]; return next; })}
                      className="dm-link w-fit cursor-pointer text-[12.5px] font-bold"
                      style={{ color: "var(--accent-subtle)" }}
                    >
                      Reset to the entries from your profile
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-[var(--space-3)]">
        <button type="button" onClick={onClose} className="dm-link cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
        <button type="button" onClick={save} className="dm-solid flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
          Save Changes
        </button>
      </div>
    </ResumeModal>
  );
}
