"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { DreamyGuide } from "@/components/build/DreamyGuide";
import { makeId, upsertVersion, type ResumeData, type ResumeVersion } from "@/lib/resume";
import { DEFAULT_RESUME_TEMPLATE, RESUME_TEMPLATES } from "./data";
import { CARD_CLASS, Field, INSET, selectedRowStyle, TextInput, WizardFooter } from "./ui";

const EMPTY_VERSION: ResumeVersion = { id: "", name: "", createdAt: 0, updatedAt: 0, educationIds: [], experienceIds: [], jobDescription: "", targetPosition: "", targetCompany: "", template: DEFAULT_RESUME_TEMPLATE, atsCheck: null };

// A quick way to change an already-picked template -- the real, informed
// choice happens in the full gallery (with a genuine example preview per
// layout), so this stays a simple swatch + name rather than trying to
// re-mimic four different real layouts in a 52px box.
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
            className="dm-tap flex cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-3)] text-left"
            style={selectedRowStyle(selected)}
          >
            <span className="size-8 flex-none rounded-full border" style={{ background: t.accent, borderColor: "var(--glass-border)" }} aria-hidden />
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
      style={selectedRowStyle(checked)}
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

// Which education/experience entries from the master profile go into THIS
// version, and its template -- name it, pick what's in it. Matching to a
// job is its own separate thing now, reachable anytime from the finished
// resume via "Tailor Resume" (JobMatchPanel.tsx), not bundled in here
// (direct feedback, 15 Sept 2026: "AND THE TAILORING HAPPENS AS A SEPERATE
// THING FROM THE LAST NAMING/TEMPLATE CHANGER ETC").
export function TailorScreen({ resume, initial, initialTemplateId, skippable = false, onCancel, onSaved }: { resume: ResumeData; initial: ResumeVersion | null; initialTemplateId?: string; skippable?: boolean; onCancel: () => void; onSaved: (version: ResumeVersion) => void }) {
  const [draft, setDraft] = useState<ResumeVersion>(
    initial ?? { ...EMPTY_VERSION, id: makeId(), educationIds: resume.education.map((e) => e.id), experienceIds: resume.experience.map((e) => e.id), template: initialTemplateId ?? DEFAULT_RESUME_TEMPLATE },
  );
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
      {/* Copy matches the reference exactly (direct instruction, 16 Sept
         2026: "check everything... give me a report of the identified
         gaps") -- title, Dreamy's own line for this screen, and each
         section's heading + explainer were all missing before. "Match to
         a Job" is deliberately NOT here -- that's its own separate action
         on the finished resume now (JobMatchPanel), not bundled into
         naming/picking (direct feedback, 15 Sept 2026: "the tailoring
         happens as a seperate thing from the last naming/template
         changer"). */}
      <div className="flex flex-col gap-[2px]">
        <h2 className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Choose &amp; Tailor Your Resume</h2>
        <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Pick what stands out, or match your resume to a job.</p>
      </div>
      <DreamyGuide sprite="/images/dreamy/v2/dreamy-idea.png" line="Choose your strongest experiences. Have a job in mind? I can help you pick what fits best." />

      <div className="flex flex-col gap-[2px]">
        <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Name This Resume</span>
        <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Give this version a name so you can find it later.</span>
      </div>
      <Field label="Resume Name" htmlFor="tailor-name" required>
        <TextInput id="tailor-name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="e.g. Retail and Customer Service Resume" />
      </Field>

      <div className="flex flex-col gap-[var(--space-3)]">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Your Education</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Choose the school information to show.</span>
        </div>
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
        <div className="flex flex-col gap-[2px]">
          <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Choose Your Experiences</span>
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Pick the activities and experiences that show you best.</span>
        </div>
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

      <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Skills from your profile will be automatically included.</p>

      <Field label="Template" htmlFor="tailor-template">
        <div id="tailor-template">
          <TemplatePicker value={draft.template} onChange={(template) => setDraft({ ...draft, template })} />
        </div>
      </Field>

      {/* Reached right after finishing the wizard (or picking a template for
         another resume), this step is optional, not a gate -- nothing here
         is required beyond the name, which is already prefilled, so
         "skip" and "save" both just move on (direct feedback, 15 Sept
         2026: "we also need to make tailoring an optional step in the
         actual flow not a hidden step"). Reopened later to edit an
         already-finished resume (resume-home's "Edit" button, or "Edit
         Selection" on the finished document), there's nothing to skip
         past -- that's Cancel, back to Profile, discarding whatever was
         changed here. */}
      <WizardFooter onBack={skippable ? save : onCancel} backLabel={skippable ? "Skip for now" : "Cancel"} onNext={save} nextDisabled={!canSave} nextLabel={initial ? "Save Resume" : "Create This Resume"} />
    </div>
  );
}
