"use client";

import { useEffect, useState } from "react";
import { Award, Briefcase, Check, CircleDashed, GraduationCap, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  type ResumeData,
  type ResumeCertification,
  type ResumeEducation,
  type ResumeExperience,
  makeId,
  MAX_SKILLS_PER_CATEGORY,
  readResume,
  removeCertification,
  removeEducation,
  removeExperience,
  upsertCertification,
  upsertEducation,
  writeResume,
} from "@/lib/resume";
import { COUNTRIES, EDUCATION_PROGRAMS, EXPERIENCE_TYPES, SKILL_CATEGORIES } from "./data";
import { CARD_CLASS, Field, INSET, ResumeModal, SelectInput, TextInput, WizardFooter } from "./ui";

// ---------------------------------------------------------------------------
// Empty-state tile -- one shared shape for every step's "nothing yet" state.
// ---------------------------------------------------------------------------
function EmptyTile({ Icon }: { Icon: typeof GraduationCap }) {
  return (
    <div className="flex items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-[var(--space-8)]" style={{ borderColor: "var(--glass-border)" }}>
      <Icon className="h-6 w-6" style={{ color: "var(--muted-foreground)" }} aria-hidden />
    </div>
  );
}

function EntryRow({ title, subtitle, meta, onEdit, onRemove }: { title: string; subtitle?: string; meta?: string; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className={CARD_CLASS} style={INSET}>
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{title}</span>
          {subtitle && <span className="text-[13px] font-semibold" style={{ color: "var(--accent-subtle)" }}>{subtitle}</span>}
          {meta && <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{meta}</span>}
        </div>
        <div className="flex flex-none items-center gap-[6px]">
          <button type="button" aria-label="Edit" onClick={onEdit} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="Remove" onClick={onRemove} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Personal Information
// ---------------------------------------------------------------------------
export function PersonalInfoStep({ resume, onNext, showToast, onFieldFocus }: { resume: ResumeData; onNext: () => void; showToast: (m: string) => void; onFieldFocus?: (field: string | null) => void }) {
  const p = resume.profile;
  // Reads the freshest stored profile at write time, not the render-time `p`
  // closure -- successive keystrokes across fields can otherwise fire before
  // a re-render lands, and a stale closure would silently drop the earlier
  // field's write when it rebuilds the full profile object.
  const set = (patch: Partial<ResumeData["profile"]>) => writeResume({ profile: { ...readResume().profile, ...patch } });
  const canContinue = p.firstName.trim().length > 0 && p.lastName.trim().length > 0;
  // Matches the `data-field="profile:*"` markers the header carries
  // (ResumeDocument.tsx) -- field tracking works on the first page too
  // (direct feedback, 15 Sept 2026), not just inside a drawer.
  const track = (field: string) => () => onFieldFocus?.(field);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <Field label="First Name" htmlFor="rb-first" required>
          <TextInput id="rb-first" value={p.firstName} onChange={(v) => set({ firstName: v })} onFocus={track("profile:name")} placeholder="Jordan" />
        </Field>
        <Field label="Last Name" htmlFor="rb-last" required>
          <TextInput id="rb-last" value={p.lastName} onChange={(v) => set({ lastName: v })} onFocus={track("profile:name")} placeholder="Rivers" />
        </Field>
      </div>
      <Field label="Email" htmlFor="rb-email">
        <TextInput id="rb-email" type="email" value={p.email} onChange={(v) => set({ email: v })} onFocus={track("profile:contact")} placeholder="you@school.org" />
      </Field>
      <Field label="Phone (optional)" htmlFor="rb-phone">
        <TextInput id="rb-phone" type="tel" value={p.phone} onChange={(v) => set({ phone: v })} onFocus={track("profile:contact")} placeholder="(555) 123-4567" />
      </Field>
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <Field label="Country" htmlFor="rb-country">
          <SelectInput id="rb-country" value={p.country} onChange={(v) => set({ country: v })}>
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectInput>
        </Field>
        <Field label="State / Province / Region" htmlFor="rb-state">
          <TextInput id="rb-state" value={p.state} onChange={(v) => set({ state: v })} onFocus={track("profile:contact")} placeholder="California" />
        </Field>
      </div>
      <Field label="City" htmlFor="rb-city">
        <TextInput id="rb-city" value={p.city} onChange={(v) => set({ city: v })} onFocus={track("profile:contact")} placeholder="San Jose" />
      </Field>
      <Field label="Short Bio (optional)" htmlFor="rb-bio">
        <textarea
          id="rb-bio"
          value={p.bio}
          onChange={(e) => set({ bio: e.target.value })}
          onFocus={track("profile:bio")}
          placeholder="A sentence or two about what you're looking for and what makes you a strong candidate."
          rows={3}
          maxLength={400}
          className="w-full rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] text-[15px] font-semibold outline-none focus:border-[var(--primary)]"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        />
      </Field>
      <WizardFooter
        nextDisabled={!canContinue}
        onNext={() => {
          onFieldFocus?.(null);
          showToast("Personal information saved");
          onNext();
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Education
// ---------------------------------------------------------------------------
const EMPTY_EDU: ResumeEducation = { id: "", schoolName: "", cityState: "", gradYear: "", program: "", gpa: "", honors: [] };

function EducationModal({ initial, onClose, onSaved, onFieldFocus }: { initial: ResumeEducation | null; onClose: () => void; onSaved: (name: string) => void; onFieldFocus?: (field: string | null) => void }) {
  const [draft, setDraft] = useState<ResumeEducation>(initial ?? { ...EMPTY_EDU, id: makeId() });
  const [honorDraft, setHonorDraft] = useState("");
  const canSave = draft.schoolName.trim().length > 0 && draft.gradYear.trim().length > 0;
  // Matches the `data-field` markers EducationEntries puts on the live
  // preview (ResumeDocument.tsx) -- lets the wizard's camera pan to
  // whichever field is actually focused, e.g. the graduation year that
  // sits at the far right edge of its row (direct feedback, 15 Sept 2026).
  const track = (kind: string) => () => onFieldFocus?.(`${draft.id}:${kind}`);

  // Live-write on every change, same as ExperienceModal (direct feedback,
  // 14-15 Sept 2026: every nested modal should track+update live, not
  // just Experience) -- gives the camera a real field to pan to and the
  // preview real (or placeholder) text from the moment this opens.
  useEffect(() => {
    upsertEducation(draft);
  }, [draft]);
  const closeAndClear = () => {
    onFieldFocus?.(null);
    if (initial) upsertEducation(initial);
    else removeEducation(draft.id);
    onClose();
  };
  return (
    <ResumeModal title="Add Your High School" onClose={closeAndClear}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <Field label="High School Name" htmlFor="edu-name" required>
          <TextInput id="edu-name" value={draft.schoolName} onChange={(v) => setDraft({ ...draft, schoolName: v })} onFocus={track("schoolName")} placeholder="Lincoln High School" />
        </Field>
        <Field label="City and State (optional)" htmlFor="edu-city">
          <TextInput id="edu-city" value={draft.cityState} onChange={(v) => setDraft({ ...draft, cityState: v })} onFocus={track("cityState")} placeholder="City, State" />
        </Field>
        <Field label="Expected Graduation Year" htmlFor="edu-grad" required>
          <TextInput id="edu-grad" value={draft.gradYear} onChange={(v) => setDraft({ ...draft, gradYear: v })} onFocus={track("gradYear")} placeholder="e.g. June 2027" />
        </Field>
        <Field label="High School Program (optional)" htmlFor="edu-program">
          <SelectInput id="edu-program" value={draft.program} onChange={(v) => setDraft({ ...draft, program: v })}>
            <option value="">Select program…</option>
            {EDUCATION_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </SelectInput>
        </Field>
        <Field label="GPA (optional)" htmlFor="edu-gpa">
          <TextInput id="edu-gpa" value={draft.gpa} onChange={(v) => setDraft({ ...draft, gpa: v })} onFocus={track("cityState")} placeholder="e.g. 3.8" />
        </Field>
        <Field label="Awards or Honors (optional)" htmlFor="edu-honors">
          <div className="flex gap-[var(--space-2)]">
            <TextInput id="edu-honors" value={honorDraft} onChange={setHonorDraft} onFocus={track("honors")} placeholder="e.g. Honor Roll, AP Scholar" />
            <button
              type="button"
              onClick={() => {
                if (!honorDraft.trim()) return;
                setDraft({ ...draft, honors: [...draft.honors, honorDraft.trim()] });
                setHonorDraft("");
              }}
              className="dm-tap flex-none cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold"
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              Add
            </button>
          </div>
          {draft.honors.length > 0 && (
            <div className="mt-[6px] flex flex-wrap gap-[6px]">
              {draft.honors.map((h, i) => (
                <span key={`${h}-${i}`} className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[12.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  {h}
                  <button type="button" aria-label={`Remove ${h}`} onClick={() => setDraft({ ...draft, honors: draft.honors.filter((_, j) => j !== i) })} className="cursor-pointer" style={{ color: "var(--muted-foreground)" }}>×</button>
                </span>
              ))}
            </div>
          )}
        </Field>
        <div className="flex items-center justify-end gap-[var(--space-3)] pt-[var(--space-2)]">
          <button type="button" onClick={closeAndClear} className="dm-link cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => { onFieldFocus?.(null); onSaved(draft.schoolName); }}
            className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--primary)" }}
          >
            Save Education
          </button>
        </div>
      </div>
    </ResumeModal>
  );
}

export function EducationStep({ resume, onNext, onBack, showToast, onFieldFocus }: { resume: ResumeData; onNext: () => void; onBack: () => void; showToast: (m: string) => void; onFieldFocus?: (field: string | null) => void }) {
  const [editing, setEditing] = useState<ResumeEducation | null | "new">(null);
  // Swaps this whole card's body for the form rather than layering a modal
  // over the list (see ResumeModal, ui.tsx) -- only one is ever mounted.
  if (editing) {
    return (
      <EducationModal
        initial={editing === "new" ? null : editing}
        onClose={() => { onFieldFocus?.(null); setEditing(null); }}
        onSaved={(name) => {
          onFieldFocus?.(null);
          setEditing(null);
          showToast(`${name} added`);
        }}
        onFieldFocus={onFieldFocus}
      />
    );
  }
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Add your school details</p>
        <button type="button" onClick={() => setEditing("new")} className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-full px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
          <Plus className="h-4 w-4" aria-hidden /> Add Education
        </button>
      </div>
      {resume.education.length === 0 ? (
        <EmptyTile Icon={GraduationCap} />
      ) : (
        <div className="flex flex-col gap-[var(--space-3)]">
          {resume.education.map((e) => (
            <EntryRow key={e.id} title={e.schoolName} subtitle={e.program ? `${e.program} Program` : "High School"} meta={`Expected Graduation: ${e.gradYear}`} onEdit={() => setEditing(e)} onRemove={() => removeEducation(e.id)} />
          ))}
        </div>
      )}
      <WizardFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Experience & Activities -- list view only; the 4-part add/edit flow
//    lives in ExperienceModal.tsx (kept in its own file, it's the biggest
//    piece of this feature).
// ---------------------------------------------------------------------------
export function ExperienceStep({ resume, onNext, onBack, onAdd, onEdit }: { resume: ResumeData; onNext: () => void; onBack: () => void; onAdd: () => void; onEdit: (entry: ResumeExperience) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Jobs, clubs, volunteering, and projects all count!</p>
        <button type="button" onClick={onAdd} className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-full px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
          <Plus className="h-4 w-4" aria-hidden /> Add Experience
        </button>
      </div>
      {resume.experience.length === 0 ? (
        <EmptyTile Icon={Briefcase} />
      ) : (
        <div className="flex flex-col gap-[var(--space-3)]">
          {resume.experience.map((exp) => {
            const kind = EXPERIENCE_TYPES.find((t) => t.type === exp.type);
            return (
              <div key={exp.id} className={CARD_CLASS} style={INSET}>
                <div className="flex items-start justify-between gap-[var(--space-3)]">
                  <div className="flex min-w-0 flex-col gap-[2px]">
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{exp.title || "Untitled"}</span>
                      <span className="rounded-full border px-[8px] py-[2px] text-[10.5px] font-bold uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{kind?.label}</span>
                      {exp.aiAssisted && <span className="rounded-full px-[8px] py-[2px] text-[10.5px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}>✨ AI</span>}
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "var(--accent-subtle)" }}>{exp.where}</span>
                    {exp.bullets.slice(0, 2).map((b, i) => (
                      <span key={i} className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>· {b}</span>
                    ))}
                    {exp.bullets.length > 2 && <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>+{exp.bullets.length - 2} more…</span>}
                  </div>
                  <div className="flex flex-none items-center gap-[6px]">
                    <button type="button" aria-label="Edit" onClick={() => onEdit(exp)} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" aria-label="Remove" onClick={() => removeExperience(exp.id)} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <WizardFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Skills
// ---------------------------------------------------------------------------
function SkillsPicker({ categoryKey, label, hint, suggestions, selected, onClose, onSave }: { categoryKey: "people" | "tech" | "languages"; label: string; hint: string; suggestions: string[]; selected: string[]; onClose: () => void; onSave: (values: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [custom, setCustom] = useState("");
  const toggle = (s: string) => setPicked((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.length >= MAX_SKILLS_PER_CATEGORY ? cur : [...cur, s]));
  return (
    <ResumeModal title={label} onClose={onClose}>
      <p className="mb-[var(--space-4)] text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{hint} Pick up to 3.</p>
      <div className="mb-[var(--space-4)] flex gap-[var(--space-2)]">
        <TextInput id={`skill-${categoryKey}-custom`} value={custom} onChange={setCustom} placeholder="Type your own…" />
        <button
          type="button"
          onClick={() => {
            if (!custom.trim() || picked.length >= MAX_SKILLS_PER_CATEGORY) return;
            setPicked([...picked, custom.trim()]);
            setCustom("");
          }}
          className="dm-tap flex-none cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold"
          style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {Array.from(new Set([...suggestions, ...picked])).map((s) => {
          const on = picked.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-full border px-[var(--space-4)] py-[8px] text-[13.5px] font-bold"
              style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" } : { borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              {on && <Check className="h-3.5 w-3.5" aria-hidden />}
              {s}
            </button>
          );
        })}
      </div>
      <div className="mt-[var(--space-5)] flex items-center justify-end gap-[var(--space-3)]">
        <button type="button" onClick={onClose} className="dm-link cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
        <button type="button" onClick={() => onSave(picked)} className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white" style={{ background: "var(--primary)" }}>
          {picked.length > 0 ? `Add ${picked.length} skill${picked.length === 1 ? "" : "s"}` : "Save"}
        </button>
      </div>
    </ResumeModal>
  );
}

export function SkillsStep({ resume, onNext, onBack }: { resume: ResumeData; onNext: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<"people" | "tech" | "languages" | null>(null);
  if (open) {
    const cat = SKILL_CATEGORIES.find((c) => c.key === open)!;
    return (
      <SkillsPicker
        categoryKey={cat.key}
        label={cat.label}
        hint={cat.hint}
        suggestions={cat.suggestions}
        selected={resume.skills[cat.key]}
        onClose={() => setOpen(null)}
        onSave={(values) => {
          writeResume({ skills: { ...readResume().skills, [cat.key]: values } });
          setOpen(null);
        }}
      />
    );
  }
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {SKILL_CATEGORIES.map((cat) => {
        const values = resume.skills[cat.key];
        return (
          <div key={cat.key} className={CARD_CLASS} style={INSET}>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{cat.label}</span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{cat.hint}</span>
              </div>
              <button type="button" onClick={() => setOpen(cat.key)} className="dm-tap flex flex-none cursor-pointer items-center gap-[4px] rounded-full border px-[var(--space-3)] py-[6px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--accent-subtle)" }}>
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add
              </button>
            </div>
            {values.length > 0 ? (
              <div className="flex flex-wrap gap-[6px]">
                {values.map((v) => <span key={v} className="rounded-full border px-[10px] py-[4px] text-[12.5px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{v}</span>)}
              </div>
            ) : (
              <p className="text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>None added yet – click Add to get started.</p>
            )}
          </div>
        );
      })}
      <WizardFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Certifications
// ---------------------------------------------------------------------------
const EMPTY_CERT: ResumeCertification = { id: "", name: "", issuer: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "" };

// Matches the reference's actual fields exactly (checked live, 15 Sept
// 2026): Name and Issuing Organization both required, separate issue/
// expiration dates rather than one combined date, plus optional credential
// ID/URL for verification -- the shape any real certification (AWS, food
// handler, CPR) actually needs.
function CertificationModal({ initial, onClose, onSaved, onFieldFocus }: { initial: ResumeCertification | null; onClose: () => void; onSaved: (name: string) => void; onFieldFocus?: (field: string | null) => void }) {
  const [draft, setDraft] = useState<ResumeCertification>(initial ?? { ...EMPTY_CERT, id: makeId() });
  const canSave = draft.name.trim().length > 0 && draft.issuer.trim().length > 0;
  // Matches the `data-field` markers CertificationEntries puts on the live
  // preview (ResumeDocument.tsx).
  const track = (kind: string) => () => onFieldFocus?.(`${draft.id}:${kind}`);

  // Live-write on every change, same as ExperienceModal/EducationModal.
  useEffect(() => {
    upsertCertification(draft);
  }, [draft]);
  const closeAndClear = () => {
    onFieldFocus?.(null);
    if (initial) upsertCertification(initial);
    else removeCertification(draft.id);
    onClose();
  };
  return (
    <ResumeModal title="Add Certification" onClose={closeAndClear}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <Field label="Certification Name" htmlFor="cert-name" required>
          <TextInput id="cert-name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} onFocus={track("name")} placeholder="e.g. AWS Certified Cloud Practitioner" />
        </Field>
        <Field label="Issuing Organization" htmlFor="cert-issuer" required>
          <TextInput id="cert-issuer" value={draft.issuer} onChange={(v) => setDraft({ ...draft, issuer: v })} onFocus={track("name")} placeholder="e.g. Amazon Web Services" />
        </Field>
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <Field label="Issue Date" htmlFor="cert-issue-date">
            <TextInput id="cert-issue-date" value={draft.issueDate} onChange={(v) => setDraft({ ...draft, issueDate: v })} onFocus={track("dates")} placeholder="e.g. Jan 2024" />
          </Field>
          <Field label="Expiration Date" htmlFor="cert-exp-date">
            <TextInput id="cert-exp-date" value={draft.expirationDate} onChange={(v) => setDraft({ ...draft, expirationDate: v })} onFocus={track("dates")} placeholder="e.g. Jan 2027 or No Expiry" />
          </Field>
        </div>
        <Field label="Credential ID (optional)" htmlFor="cert-credential-id">
          <TextInput id="cert-credential-id" value={draft.credentialId} onChange={(v) => setDraft({ ...draft, credentialId: v })} onFocus={track("name")} placeholder="e.g. ABC123XYZ" />
        </Field>
        <Field label="Credential URL (optional)" htmlFor="cert-credential-url">
          <TextInput id="cert-credential-url" value={draft.credentialUrl} onChange={(v) => setDraft({ ...draft, credentialUrl: v })} placeholder="e.g. https://www.credly.com/badges/…" />
        </Field>
        <div className="flex items-center justify-end gap-[var(--space-3)] pt-[var(--space-2)]">
          <button type="button" onClick={closeAndClear} className="dm-link cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => { onFieldFocus?.(null); onSaved(draft.name); }}
            className="dm-solid flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--primary)" }}
          >
            Save Certification
          </button>
        </div>
      </div>
    </ResumeModal>
  );
}

export function CertificationsStep({ resume, onNext, onBack, showToast, onFieldFocus }: { resume: ResumeData; onNext: () => void; onBack: () => void; showToast: (m: string) => void; onFieldFocus?: (field: string | null) => void }) {
  const [editing, setEditing] = useState<ResumeCertification | null | "new">(null);
  if (editing) {
    return (
      <CertificationModal
        initial={editing === "new" ? null : editing}
        onClose={() => { onFieldFocus?.(null); setEditing(null); }}
        onSaved={(name) => { onFieldFocus?.(null); setEditing(null); showToast(`${name} added`); }}
        onFieldFocus={onFieldFocus}
      />
    );
  }
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <p className="text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Add any certifications you have</p>
        <button type="button" onClick={() => setEditing("new")} className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-full px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
          <Plus className="h-4 w-4" aria-hidden /> Add Certification
        </button>
      </div>
      {resume.certifications.length === 0 ? (
        <EmptyTile Icon={Award} />
      ) : (
        <div className="flex flex-col gap-[var(--space-3)]">
          {resume.certifications.map((c) => (
            <EntryRow key={c.id} title={c.name} subtitle={c.issuer || undefined} meta={c.issueDate || undefined} onEdit={() => setEditing(c)} onRemove={() => removeCertification(c.id)} />
          ))}
        </div>
      )}
      <WizardFooter onBack={onBack} onNext={onNext} nextLabel="Review" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Review -- checklist is computed live from actual data, never a
//    separately-tracked flag that can drift from reality (plan bug-fix #3).
// ---------------------------------------------------------------------------
function ChecklistRow({ label, done, onEdit, last }: { label: string; done: boolean; onEdit: () => void; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-[var(--space-3)] py-[10px] ${last ? "" : "border-b"}`} style={{ borderColor: "var(--glass-border)" }}>
      <div className="flex items-center gap-[10px]">
        {done ? <Check className="h-4 w-4 flex-none" style={{ color: "var(--accent-subtle)" }} aria-hidden /> : <CircleDashed className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />}
        <span className="text-[14px] font-semibold" style={{ color: done ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
      </div>
      <button type="button" onClick={onEdit} className="dm-link cursor-pointer text-[12.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>{done ? "Edit" : "Add"}</button>
    </div>
  );
}

export function ReviewStep({ resume, onBack, onEditStep, onFinish }: { resume: ResumeData; onBack: () => void; onEditStep: (step: number) => void; onFinish: () => void }) {
  const items = [
    { label: "Personal Information", done: resume.profile.firstName.trim().length > 0 && resume.profile.lastName.trim().length > 0, step: 0 },
    { label: "Education", done: resume.education.length > 0, step: 1 },
    { label: "Experience & Activities", done: resume.experience.length > 0, step: 2 },
    { label: "Skills", done: resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length > 0, step: 3 },
    { label: "Certifications", done: resume.certifications.length > 0, step: 4 },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const complete = items.filter((i) => i.step !== 4).every((i) => i.done);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className={CARD_CLASS} style={INSET}>
        <div className="flex items-center gap-[10px]">
          <Sparkles className="h-4 w-4" style={{ color: "var(--accent-subtle)" }} aria-hidden />
          <span className="text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>
            {complete ? "You've got a good start!" : `${doneCount} of ${items.length} sections done`}
          </span>
        </div>
        <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
          {complete ? "Everything you need is here. You can always add more later." : "Certifications are optional. Finish the rest to build your resume."}
        </p>
      </div>
      <div className="flex flex-col">
        {items.map((i, idx) => (
          <ChecklistRow key={i.label} label={i.label} done={i.done} onEdit={() => onEditStep(i.step)} last={idx === items.length - 1} />
        ))}
      </div>
      <WizardFooter onBack={onBack} onNext={onFinish} nextLabel="Finish" nextDisabled={!complete} />
    </div>
  );
}
