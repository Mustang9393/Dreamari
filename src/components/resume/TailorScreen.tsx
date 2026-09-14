"use client";

import { useState } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { DreamyGuide } from "@/components/build/DreamyGuide";
import { addSkill, makeId, upsertVersion, type ResumeData, type ResumeSkills, type ResumeVersion } from "@/lib/resume";
import { DEFAULT_RESUME_TEMPLATE, RESUME_TEMPLATES } from "./data";
import { CARD_CLASS, Field, INSET, TextInput, WizardFooter } from "./ui";

const EMPTY_VERSION: ResumeVersion = { id: "", name: "", createdAt: 0, updatedAt: 0, educationIds: [], experienceIds: [], jobDescription: "", targetPosition: "", targetCompany: "", template: DEFAULT_RESUME_TEMPLATE };

type SkillCategory = keyof ResumeSkills;
type SkillSuggestion = { category: SkillCategory; skill: string; reason: string };
type TailorAnalysis = { matchScore: number; matchLabel: string; qualityScore: number; suggestions: SkillSuggestion[]; gaps: string[]; improvements: string[] };

const CATEGORY_LABEL: Record<SkillCategory, string> = { people: "People", tech: "Tech", languages: "Languages" };

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
            style={selected ? { borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : { borderColor: "var(--glass-border)" }}
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

/** One number, one label, one quiet color cue by tier -- the same "small
 *  stat, not a gauge" restraint the rest of this app uses for scores
 *  (direct feedback, 15 Sept 2026: reference's version of this was a big
 *  purple modal; ours should look like it belongs on this screen, not
 *  interrupt it). */
function ScoreChip({ label, value, sublabel }: { label: string; value: number; sublabel?: string }) {
  const tone = value >= 75 ? "var(--world-food-farming-nature, #3aa66b)" : value >= 45 ? "var(--accent-subtle)" : "var(--muted-foreground)";
  return (
    <div className="flex flex-1 flex-col gap-[2px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
      <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="flex items-baseline gap-[6px]">
        <span className="text-[22px] leading-none font-extrabold tabular-nums" style={{ color: tone, fontFamily: "var(--font-display)" }}>{value}</span>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>/100{sublabel ? ` · ${sublabel}` : ""}</span>
      </span>
    </div>
  );
}

function SuggestionRow({ suggestion, added, onAdd }: { suggestion: SkillSuggestion; added: boolean; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
      <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
        <span className="flex items-center gap-[6px] text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>
          {suggestion.skill}
          <span className="rounded-full border px-[6px] py-[1px] text-[10px] font-bold tracking-[0.04em] uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{CATEGORY_LABEL[suggestion.category]}</span>
        </span>
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{suggestion.reason}</span>
      </span>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className="dm-tap flex flex-none cursor-pointer items-center gap-[4px] rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold disabled:cursor-default"
        style={added ? { borderColor: "var(--world-food-farming-nature, #3aa66b)", color: "var(--world-food-farming-nature, #3aa66b)", background: "color-mix(in srgb, var(--world-food-farming-nature, #3aa66b) 12%, transparent)" } : { borderColor: "var(--primary)", color: "var(--primary)" }}
      >
        {added ? <><Check className="h-3.5 w-3.5" aria-hidden /> Added</> : <><Plus className="h-3.5 w-3.5" aria-hidden /> Add</>}
      </button>
    </div>
  );
}

// Choose & Tailor: name a resume, pick which education/experience entries
// from the master profile go into THIS version, optionally paste a job
// description to match against. Skills and certifications always carry
// through (plan's original scope) -- only these two lists are picked per
// version, which is the actual point of having more than one saved resume.
export function TailorScreen({ resume, initial, initialTemplateId, onCancel, onSaved }: { resume: ResumeData; initial: ResumeVersion | null; initialTemplateId?: string; onCancel: () => void; onSaved: (version: ResumeVersion) => void }) {
  const [draft, setDraft] = useState<ResumeVersion>(
    initial ?? { ...EMPTY_VERSION, id: makeId(), educationIds: resume.education.map((e) => e.id), experienceIds: resume.experience.map((e) => e.id), template: initialTemplateId ?? DEFAULT_RESUME_TEMPLATE },
  );
  const canSave = draft.name.trim().length > 0;

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TailorAnalysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const toggleEducation = (id: string) => setDraft((d) => ({ ...d, educationIds: d.educationIds.includes(id) ? d.educationIds.filter((x) => x !== id) : [...d.educationIds, id] }));
  const toggleExperience = (id: string) => setDraft((d) => ({ ...d, experienceIds: d.experienceIds.includes(id) ? d.experienceIds.filter((x) => x !== id) : [...d.experienceIds, id] }));

  const save = () => {
    const now = Date.now();
    const entry: ResumeVersion = { ...draft, createdAt: draft.createdAt || now, updatedAt: now };
    upsertVersion(entry);
    onSaved(entry);
  };

  async function findMatchingSkills() {
    setAnalyzing(true);
    setAnalyzeError(false);
    try {
      const res = await fetch("/api/resume-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: draft.jobDescription,
          targetPosition: draft.targetPosition,
          targetCompany: draft.targetCompany,
          experience: resume.experience.map((e) => ({ id: e.id, title: e.title, where: e.where, bullets: e.bullets })),
          skills: resume.skills,
        }),
      });
      const data = (await res.json()) as { ok: boolean } & Partial<TailorAnalysis>;
      if (data.ok && typeof data.matchScore === "number") {
        setAnalysis({ matchScore: data.matchScore, matchLabel: data.matchLabel ?? "", qualityScore: data.qualityScore ?? 0, suggestions: data.suggestions ?? [], gaps: data.gaps ?? [], improvements: data.improvements ?? [] });
      } else {
        setAnalyzeError(true);
      }
    } catch {
      setAnalyzeError(true);
    } finally {
      setAnalyzing(false);
    }
  }

  const dreamyLine = !analysis
    ? ""
    : analysis.matchScore >= 75
      ? "You're a strong fit for this one! ✨"
      : analysis.matchScore >= 45
        ? "You've got some good matches. ✨"
        : "A few more skills would help this land. ✨";

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

      <div className={CARD_CLASS} style={INSET}>
        <div className="flex flex-col gap-[2px]">
          <span className="flex items-center gap-[6px] text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>
            <Sparkles className="h-4 w-4 flex-none" style={{ color: "var(--accent-subtle)" }} aria-hidden /> Match to a Job
          </span>
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Optional -- paste a real posting and this resume will line up with it: matching skills, a job-fit score, and what&apos;s still worth adding.</span>
        </div>
        <Field label="Job Description" htmlFor="tailor-jd">
          <textarea
            id="tailor-jd"
            value={draft.jobDescription}
            onChange={(e) => setDraft({ ...draft, jobDescription: e.target.value })}
            placeholder="Paste the full job description here to line your resume up with it."
            rows={4}
            className="w-full rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] text-[14px] font-semibold outline-none focus:border-[var(--primary)]"
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          />
        </Field>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
          <Field label="Target Position (optional)" htmlFor="tailor-position">
            <TextInput id="tailor-position" value={draft.targetPosition} onChange={(v) => setDraft({ ...draft, targetPosition: v })} placeholder="e.g. Marketing Intern" />
          </Field>
          <Field label="Target Company (optional)" htmlFor="tailor-company">
            <TextInput id="tailor-company" value={draft.targetCompany} onChange={(v) => setDraft({ ...draft, targetCompany: v })} placeholder="e.g. Acme Corp" />
          </Field>
        </div>

        {draft.jobDescription.trim().length > 0 && !analysis && (
          <button
            type="button"
            onClick={findMatchingSkills}
            disabled={analyzing}
            className="dm-tap flex min-h-[44px] cursor-pointer items-center justify-center gap-[8px] self-start rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: "var(--primary)" }}
          >
            <Sparkles className="h-4 w-4" aria-hidden /> {analyzing ? "Finding matches…" : "Find Matching Skills"}
          </button>
        )}
        {analyzeError && <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-feedback-error, #ff6b6b)" }}>Couldn&apos;t match this job right now. You can still save without it.</p>}

        {analysis && (
          <div className="flex flex-col gap-[var(--space-4)] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
            <DreamyGuide sprite="/images/dreamy/v2/dreamy-puzzle.png" line={dreamyLine} />

            <div className="flex gap-[var(--space-3)]">
              <ScoreChip label="Resume Quality" value={analysis.qualityScore} />
              <ScoreChip label="Job Match" value={analysis.matchScore} sublabel={analysis.matchLabel} />
            </div>

            {analysis.suggestions.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Skills worth adding</span>
                {analysis.suggestions.map((s) => (
                  <SuggestionRow
                    key={s.skill}
                    suggestion={s}
                    added={added.has(s.skill) || resume.skills[s.category].some((have) => have.toLowerCase() === s.skill.toLowerCase())}
                    onAdd={() => { addSkill(s.category, s.skill); setAdded((cur) => new Set(cur).add(s.skill)); }}
                  />
                ))}
                <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Add the ones you actually have. Skills are only added to your profile -- never invented.</p>
              </div>
            )}

            {analysis.improvements.length > 0 && (
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Worth strengthening</span>
                <ul className="flex flex-col gap-[3px] pl-[16px]" style={{ listStyleType: "disc", color: "var(--muted-foreground)" }}>
                  {analysis.improvements.map((tip) => <li key={tip} className="text-[12.5px]">{tip}</li>)}
                </ul>
              </div>
            )}

            {analysis.gaps.length > 0 && (
              <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Not yet covered by your profile: {analysis.gaps.join(", ")}.</p>
            )}
          </div>
        )}
      </div>

      <WizardFooter onBack={onCancel} backLabel="Cancel" onNext={save} nextDisabled={!canSave} nextLabel="Save Resume" />
    </div>
  );
}
