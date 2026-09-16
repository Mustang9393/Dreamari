"use client";

import { useEffect, useState } from "react";
import { Award, Briefcase, Check, CircleDashed, GraduationCap, HelpCircle, Pencil, Plus, Sparkles, Trash2, User } from "lucide-react";
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
// Empty-state CTA -- the "Add X" action itself fills the empty-state slot
// (a plain icon in a dashed box, with a separate small "Add" button up top,
// was two things doing one job -- direct feedback, 16 Sept 2026: "i dont
// like the big frame with the education icon in the middle... put the cta
// where that is"). Once the first entry exists, this collapses away and
// the small top-right "Add" button (already in every one of these steps)
// takes over for adding more -- same shared shape wherever a step lists
// entries with an "Add" action (Education, Experience, Certifications).
// A real filled surface + a leading "+", not a dashed outline -- the
// dashed-box version read as an inert placeholder graphic rather than
// something tappable (direct feedback, 16 Sept 2026: "needs to read more
// like a button... some sort of surface and a + leading").
// ---------------------------------------------------------------------------
function EmptyStateAdd({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="dm-tap flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-lg)] border py-[var(--space-5)] text-[14.5px] font-bold"
      style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}
    >
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </button>
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
      {/* No bio field here -- the reference's own Personal Information step
         only ever asks for name/email/phone/address, nothing else (direct
         instruction, 16 Sept 2026: "take no liberties"). */}
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

export function EducationStep({ resume, onNext, showToast, onFieldFocus }: { resume: ResumeData; onNext: () => void; showToast: (m: string) => void; onFieldFocus?: (field: string | null) => void }) {
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
      {resume.education.length === 0 ? (
        <EmptyStateAdd label="Add Education" onAdd={() => setEditing("new")} />
      ) : (
        <>
          <div className="flex items-center justify-end gap-[var(--space-3)]">
            <button type="button" onClick={() => setEditing("new")} className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
              <Plus className="h-4 w-4" aria-hidden /> Add Education
            </button>
          </div>
          <div className="flex flex-col gap-[var(--space-3)]">
            {resume.education.map((e) => (
              <EntryRow key={e.id} title={e.schoolName} subtitle={e.program ? `${e.program} Program` : "High School"} meta={`Expected Graduation: ${e.gradYear}`} onEdit={() => setEditing(e)} onRemove={() => removeEducation(e.id)} />
            ))}
          </div>
        </>
      )}
      <WizardFooter onNext={onNext} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Experience & Activities -- list view only; the 4-part add/edit flow
//    lives in ExperienceModal.tsx (kept in its own file, it's the biggest
//    piece of this feature).
// ---------------------------------------------------------------------------
export function ExperienceStep({ resume, onNext, onAdd, onEdit }: { resume: ResumeData; onNext: () => void; onAdd: () => void; onEdit: (entry: ResumeExperience) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {resume.experience.length === 0 ? (
        <EmptyStateAdd label="Add Experience" onAdd={onAdd} />
      ) : (
        <>
          <div className="flex items-center justify-end gap-[var(--space-3)]">
            <button type="button" onClick={onAdd} className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
              <Plus className="h-4 w-4" aria-hidden /> Add Experience
            </button>
          </div>
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
        </>
      )}
      <WizardFooter onNext={onNext} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Skills
// ---------------------------------------------------------------------------
// Dreamy asks the actual question here in the reference, not just a plain
// hint line (direct feedback, 16 Sept 2026: "bring dreamy into the places
// wherever it was in the replit... make dreamy follow the users screens
// more and be more involved").
const SKILL_DREAMY: Record<"people" | "tech" | "languages", { line: string; sprite: string }> = {
  people: { line: "What are your people skills? 🤝", sprite: "/images/dreamy/v2/dreamy-happy.png" },
  tech: { line: "What tools or programs do you use? 💻", sprite: "/images/dreamy/v2/dreamy-idea.png" },
  languages: { line: "What languages do you speak or write? 🌍", sprite: "/images/dreamy/v2/dreamy-glasses.png" },
};

function SkillsPicker({ categoryKey, label, suggestions, selected, onClose, onSave }: { categoryKey: "people" | "tech" | "languages"; label: string; suggestions: string[]; selected: string[]; onClose: () => void; onSave: (values: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [custom, setCustom] = useState("");
  const toggle = (s: string) => setPicked((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.length >= MAX_SKILLS_PER_CATEGORY ? cur : [...cur, s]));
  return (
    <ResumeModal title={label} onClose={onClose}>
      <p className="mb-[var(--space-4)] text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Select up to 3.</p>
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
              className="dm-tap flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[8px] text-[13.5px] font-bold"
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

export function SkillsStep({ resume, onNext, onSubDreamy }: { resume: ResumeData; onNext: () => void; onSubDreamy?: (dreamy: { sprite: string; line: string } | null) => void }) {
  const [open, setOpen] = useState<"people" | "tech" | "languages" | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  // Reports this category's own line up to the single Dreamy that lives
  // outside the card (direct feedback, 16 Sept 2026: "just have it update
  // to say what each modal was saying" -- one Dreamy, not one per modal).
  useEffect(() => {
    onSubDreamy?.(open ? SKILL_DREAMY[open] : null);
    return () => onSubDreamy?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  if (open) {
    const cat = SKILL_CATEGORIES.find((c) => c.key === open)!;
    return (
      <SkillsPicker
        categoryKey={cat.key}
        label={cat.label}
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
      <button
        type="button"
        onClick={() => setShowHelp((v) => !v)}
        className="dm-link flex cursor-pointer items-center gap-[6px] self-start text-[13px] font-bold"
        style={{ color: "var(--muted-foreground)" }}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden /> Not sure what these mean?
      </button>
      {showHelp && (
        <div className={CARD_CLASS} style={INSET}>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)" }}>People Skills</strong> — how you work and communicate with others, like teamwork or leadership.
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)" }}>Tech Skills</strong> — tools and technology you know how to use, like Excel or Canva.
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)" }}>Languages</strong> — languages you can speak, read, or write.
          </p>
        </div>
      )}
      {SKILL_CATEGORIES.map((cat) => {
        const values = resume.skills[cat.key];
        return (
          <div key={cat.key} className={CARD_CLASS} style={INSET}>
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{cat.label}{values.length > 0 ? ` (${values.length})` : ""}</span>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{cat.hint}</span>
              </div>
              <button type="button" onClick={() => setOpen(cat.key)} className="dm-tap flex flex-none cursor-pointer items-center gap-[4px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[6px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--accent-subtle)" }}>
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
      <WizardFooter onNext={onNext} />
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

export function CertificationsStep({ resume, onNext, showToast, onFieldFocus }: { resume: ResumeData; onNext: () => void; showToast: (m: string) => void; onFieldFocus?: (field: string | null) => void }) {
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
      {resume.certifications.length === 0 ? (
        <EmptyStateAdd label="Add Certification" onAdd={() => setEditing("new")} />
      ) : (
        <>
          <div className="flex items-center justify-end gap-[var(--space-3)]">
            <button type="button" onClick={() => setEditing("new")} className="dm-tap flex flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] py-[8px] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
              <Plus className="h-4 w-4" aria-hidden /> Add Certification
            </button>
          </div>
          <div className="flex flex-col gap-[var(--space-3)]">
            {resume.certifications.map((c) => (
              <EntryRow key={c.id} title={c.name} subtitle={c.issuer || undefined} meta={c.issueDate || undefined} onEdit={() => setEditing(c)} onRemove={() => removeCertification(c.id)} />
            ))}
          </div>
        </>
      )}
      <WizardFooter onNext={onNext} nextLabel="Review" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Review -- checklist is computed live from actual data, never a
//    separately-tracked flag that can drift from reality (plan bug-fix #3).
// ---------------------------------------------------------------------------
function ChecklistRow({
  Icon,
  label,
  optional,
  subtitle,
  done,
  onEdit,
  last,
}: {
  Icon: typeof User;
  label: string;
  optional?: boolean;
  subtitle: string;
  done: boolean;
  onEdit: () => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-[var(--space-3)] py-[12px] ${last ? "" : "border-b"}`} style={{ borderColor: "var(--glass-border)" }}>
      <div className="flex min-w-0 items-center gap-[12px]">
        <span className="flex size-9 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--accent-subtle)" }}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-[1px]">
          <span className="flex items-center gap-[6px] text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>
            {label}
            {optional && <span className="rounded-full border px-[6px] py-[1px] text-[10px] font-bold uppercase" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
          </span>
          <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{subtitle}</span>
        </div>
      </div>
      <div className="flex flex-none items-center gap-[10px]">
        <span
          className="flex items-center gap-[4px] rounded-full px-[10px] py-[4px] text-[11px] font-bold whitespace-nowrap"
          style={done ? { background: "color-mix(in srgb, var(--world-food-farming-nature, #3aa66b) 16%, transparent)", color: "var(--world-food-farming-nature, #3aa66b)" } : { background: "color-mix(in srgb, var(--color-amber-500, #f59e0b) 16%, transparent)", color: "var(--color-amber-500, #f59e0b)" }}
        >
          {done ? <Check className="h-3 w-3" aria-hidden /> : <CircleDashed className="h-3 w-3" aria-hidden />}
          {done ? "Done" : "Not started"}
        </span>
        <button type="button" onClick={onEdit} className="dm-link cursor-pointer text-[12.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>Edit</button>
      </div>
    </div>
  );
}

export function ReviewStep({ resume, onEditStep, onFinish }: { resume: ResumeData; onEditStep: (step: number) => void; onFinish: () => void }) {
  // The "good start" tip: real in the reference, a real centered popup
  // shown at export time, not the inline checklist-summary card this step
  // used to show instead (direct instruction, 16 Sept 2026: "take no
  // liberties... each modal... needs to be there"). Checked live: it
  // showed on every Save & Export click in the reference, not just once,
  // so that's what this matches too, rather than guessing at some other
  // trigger condition never actually observed.
  const [showTip, setShowTip] = useState(false);
  const fullName = `${resume.profile.firstName} ${resume.profile.lastName}`.trim();
  const totalSkills = resume.skills.people.length + resume.skills.tech.length + resume.skills.languages.length;
  const items = [
    { Icon: User, label: "Personal Information", subtitle: fullName || "Not started yet", done: fullName.length > 0, step: 0 },
    { Icon: GraduationCap, label: "Education", subtitle: resume.education.length > 0 ? `${resume.education.length} school${resume.education.length === 1 ? "" : "s"} added` : "No schools added", done: resume.education.length > 0, step: 1 },
    { Icon: Briefcase, label: "Experience & Activity", subtitle: resume.experience.length > 0 ? `${resume.experience.length} ${resume.experience.length === 1 ? "entry" : "entries"} added` : "No entries added", done: resume.experience.length > 0, step: 2 },
    { Icon: Sparkles, label: "Skills", optional: true, subtitle: totalSkills > 0 ? `${totalSkills} skill${totalSkills === 1 ? "" : "s"} selected` : "Optional – none added", done: totalSkills > 0, step: 3 },
    { Icon: Award, label: "Certifications", optional: true, subtitle: resume.certifications.length > 0 ? `${resume.certifications.length} certification${resume.certifications.length === 1 ? "" : "s"} added` : "Optional – none added", done: resume.certifications.length > 0, step: 4 },
  ];
  const complete = items.filter((i) => i.step !== 4).every((i) => i.done);
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-col">
        {items.map((i, idx) => (
          <ChecklistRow key={i.label} Icon={i.Icon} label={i.label} optional={i.optional} subtitle={i.subtitle} done={i.done} onEdit={() => onEditStep(i.step)} last={idx === items.length - 1} />
        ))}
      </div>
      <WizardFooter onNext={() => setShowTip(true)} nextLabel="Save & Export" nextDisabled={!complete} />
      {showTip && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center p-4 sm:items-center"
          style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)" }}
          onPointerDown={(e) => { if (e.target === e.currentTarget) setShowTip(false); }}
        >
          <div className="flex w-full max-w-[380px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-center gap-[10px]">
              <span className="flex size-9 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}>
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>You&apos;ve got a good start! ☁️</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>More experiences can make your resume stronger. Explore activities or ask a counselor for ideas.</p>
            <div className="flex items-center justify-end gap-[var(--space-3)]">
              <button type="button" onClick={() => { setShowTip(false); onEditStep(2); }} className="dm-tap cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                Add Experiences
              </button>
              <button type="button" onClick={() => { setShowTip(false); onFinish(); }} className="dm-solid flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[13.5px] font-bold text-white" style={{ background: "var(--primary)" }}>
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
