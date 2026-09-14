"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { makeId, upsertVersion, type ResumeData, type ResumeVersion } from "@/lib/resume";
import { DEFAULT_RESUME_TEMPLATE, RESUME_TEMPLATES } from "./data";
import { CARD_CLASS, Field, INSET, TextInput, WizardFooter } from "./ui";

const EMPTY_VERSION: ResumeVersion = { id: "", name: "", createdAt: 0, updatedAt: 0, educationIds: [], experienceIds: [], jobDescription: "", template: DEFAULT_RESUME_TEMPLATE };

function TemplatePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
      {RESUME_TEMPLATES.map((t) => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="dm-tap flex cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-3)] text-left"
            style={selected ? { borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : { borderColor: "var(--glass-border)" }}
          >
            <div className="flex h-[52px] w-full flex-col gap-[4px] rounded-[6px] bg-white p-[8px]">
              <div className="h-[6px] w-[60%] rounded-[2px]" style={{ background: t.accent, fontFamily: t.nameFont === "serif" ? "Georgia, serif" : undefined }} />
              <div className="h-[3px] w-[85%] rounded-[2px]" style={{ background: t.accent, opacity: 0.35 }} />
              <div className="h-[3px] w-[70%] rounded-[2px]" style={{ background: "#d0d0d0" }} />
              <div className="h-[3px] w-[75%] rounded-[2px]" style={{ background: "#d0d0d0" }} />
            </div>
            <span className="flex items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>
              {selected && <Check className="h-3.5 w-3.5 flex-none" style={{ color: "var(--primary)" }} aria-hidden />}
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PickRow({ label, meta, checked, onToggle }: { label: string; meta?: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="dm-tap flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-left"
      style={checked ? { borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : { borderColor: "var(--glass-border)" }}
    >
      <span
        className="flex size-5 flex-none items-center justify-center rounded-[6px] border"
        style={checked ? { background: "var(--primary)", borderColor: "var(--primary)" } : { borderColor: "var(--glass-border)" }}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
      </span>
      <span className="flex flex-col gap-[1px]">
        <span className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
        {meta && <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{meta}</span>}
      </span>
    </button>
  );
}

// Choose & Tailor: name a resume, pick which education/experience entries
// from the master profile go into THIS version, optionally paste a job
// description. Skills and certifications always carry through (plan's
// original scope) -- only these two lists are picked per version, which is
// the actual point of having more than one saved resume.
export function TailorScreen({ resume, initial, onCancel, onSaved }: { resume: ResumeData; initial: ResumeVersion | null; onCancel: () => void; onSaved: (version: ResumeVersion) => void }) {
  const [draft, setDraft] = useState<ResumeVersion>(initial ?? { ...EMPTY_VERSION, id: makeId(), educationIds: resume.education.map((e) => e.id), experienceIds: resume.experience.map((e) => e.id) });
  const canSave = draft.name.trim().length > 0;

  const toggleEducation = (id: string) => setDraft((d) => ({ ...d, educationIds: d.educationIds.includes(id) ? d.educationIds.filter((x) => x !== id) : [...d.educationIds, id] }));
  const toggleExperience = (id: string) => setDraft((d) => ({ ...d, experienceIds: d.experienceIds.includes(id) ? d.experienceIds.filter((x) => x !== id) : [...d.experienceIds, id] }));

  const save = () => {
    const now = Date.now();
    const entry: ResumeVersion = { ...draft, createdAt: draft.createdAt || now, updatedAt: now };
    upsertVersion(entry);
    onSaved(entry);
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <Field label="Resume Name" htmlFor="tailor-name" required>
        <TextInput id="tailor-name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="e.g. Retail and Customer Service Resume" />
      </Field>

      <div className="flex flex-col gap-[var(--space-3)]">
        <span className="text-[13px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Education to include</span>
        {resume.education.length === 0 ? (
          <p className={CARD_CLASS} style={INSET}>No education on file yet. Add some from Edit My Info first.</p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {resume.education.map((edu) => (
              <PickRow key={edu.id} label={edu.schoolName} meta={edu.gradYear} checked={draft.educationIds.includes(edu.id)} onToggle={() => toggleEducation(edu.id)} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        <span className="text-[13px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Experience to include</span>
        {resume.experience.length === 0 ? (
          <p className={CARD_CLASS} style={INSET}>No experience on file yet. Add some from Edit My Info first.</p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {resume.experience.map((exp) => (
              <PickRow key={exp.id} label={exp.title} meta={exp.where} checked={draft.experienceIds.includes(exp.id)} onToggle={() => toggleExperience(exp.id)} />
            ))}
          </div>
        )}
      </div>

      <Field label="Template" htmlFor="tailor-template">
        <div id="tailor-template">
          <TemplatePicker value={draft.template} onChange={(template) => setDraft({ ...draft, template })} />
        </div>
      </Field>

      <Field label="Job Description (optional)" htmlFor="tailor-jd">
        <textarea
          id="tailor-jd"
          value={draft.jobDescription}
          onChange={(e) => setDraft({ ...draft, jobDescription: e.target.value })}
          placeholder="Paste a job description here to line your resume up with it."
          rows={4}
          className="w-full rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] text-[14px] font-semibold outline-none focus:border-[var(--primary)]"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        />
      </Field>

      <WizardFooter onBack={onCancel} backLabel="Cancel" onNext={save} nextDisabled={!canSave} nextLabel="Save Resume" />
    </div>
  );
}
