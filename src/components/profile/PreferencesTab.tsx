"use client";

// My Profile > Preferences. Ported from Joshua's reference
// (dceeai.replit.app/my-profile#preferences, 25 Sept 2026) with his Slack
// spec's limits: section rows with the current answers, an editor per
// section, Save writes here and to the Build answers the rest of the app
// reads. It must not feel like retaking Build (his words), so every editor
// is one screen of chips, never a multi-step flow.

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { LIMITS, preferencesSnapshot, serverPreferencesSnapshot, subscribePreferences, writePreferences, type JobPrefs, type Preferences } from "@/lib/preferences";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { useSavedCareers } from "@/lib/savedCareers";
import { careerSlug } from "@/components/career/slug";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { ALL_PROFILE_CAREERS } from "./data";
import * as O from "./preferencesOptions";

type SectionId = "career" | "subjects" | "work" | "education" | "location" | "school" | "skills" | "jobs";

const SECTIONS: { id: SectionId; title: string; optional?: boolean }[] = [
  { id: "career", title: "Career Focus" },
  { id: "subjects", title: "Subjects" },
  { id: "work", title: "Work Style" },
  { id: "education", title: "Education" },
  { id: "location", title: "Location & Cost" },
  { id: "school", title: "School Experience" },
  { id: "skills", title: "Skills & Software" },
  { id: "jobs", title: "Internships & Jobs", optional: true },
];

const shortBudget = (b: string) => b.replace(/\$(\d+),000/, (_, n) => `$${n}K`);
const joinDots = (xs: (string | null | undefined)[]) => xs.filter((x): x is string => !!x).join(" · ");

function summaryFor(id: SectionId, p: Preferences): string {
  switch (id) {
    case "career": return joinDots([...p.industries, p.careers.length ? `+${p.careers.length} career${p.careers.length === 1 ? "" : "s"}` : null]);
    case "subjects": return joinDots(p.subjects);
    case "work": return joinDots([p.pace, p.workWith === "With a team" ? "Team-oriented" : p.workWith, p.teamSize[0]]);
    case "education": return joinDots([p.gpa ? `${p.gpa} GPA` : null, ...p.pathways]);
    case "location": return joinDots([...p.states.map((s) => O.STATE_ABBR[s] ?? s), p.budget ? shortBudget(p.budget) : null]);
    case "school": return joinDots([p.schoolTypes[0], p.campus.length ? p.campus.join("/") : null, p.sizes[0]]);
    case "skills": return joinDots([...p.skillsToBuild.slice(0, 2), p.skillsToBuild.length > 2 ? `+${p.skillsToBuild.length - 2} more` : null]);
    case "jobs": return joinDots([...p.jobs.types, ...p.jobs.modes]);
  }
}

function titleFor(id: string): string {
  return ALL_PROFILE_CAREERS.find((c) => c.id === id)?.title ?? ALL_CATALOG_CAREERS.find((c) => careerSlug(c.title) === id)?.title ?? id;
}

export function PreferencesTab() {
  const prefs = useSyncExternalStore(subscribePreferences, preferencesSnapshot, serverPreferencesSnapshot);
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const [saved] = useSavedCareers();
  const [open, setOpen] = useState<SectionId | null>(null);
  // Careers the student already named elsewhere come first in the picker.
  const namedCareers = useMemo(() => Array.from(new Set([...picks.ids.map(titleFor), ...Array.from(saved).map(titleFor)])), [picks.ids, saved]);
  const updated = prefs.updatedAt ? new Date(prefs.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div role="tabpanel" id="profile-panel-preferences" aria-labelledby="profile-tab-preferences" className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-3)]">
        <span className="flex size-10 flex-none items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--accent-subtle)" }}>
          <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-[4px]">
          <h2 className="text-[26px] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Preferences</h2>
          <p className="text-[14.5px] leading-[20px]" style={{ color: "var(--foreground)" }}>Your interests can change. Update them anytime and Dreamari adjusts your recommendations.</p>
          <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Dreamari uses this to personalize your experience.</p>
          <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>{updated ? `Last updated ${updated}` : "From your Build answers"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        {SECTIONS.map((s) => {
          const summary = summaryFor(s.id, prefs);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setOpen(s.id)}
              className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)] text-left"
              style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 85%, transparent)" }}
            >
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="flex items-center gap-[8px]">
                  <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{s.title}</span>
                  {s.optional && <span className="rounded-full border px-[8px] py-[2px] text-[10.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
                </span>
                <span className="truncate text-[13px] font-medium" style={{ color: summary ? "var(--muted-foreground)" : "color-mix(in srgb, var(--muted-foreground) 70%, transparent)" }}>{summary || "Not set yet"}</span>
              </span>
              <span className="flex flex-none items-center gap-[4px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>Edit <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /></span>
            </button>
          );
        })}
      </div>

      {open && <SectionEditor id={open} prefs={prefs} namedCareers={namedCareers} onClose={() => setOpen(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------- editors ----

function SectionEditor({ id, prefs, namedCareers, onClose }: { id: SectionId; prefs: Preferences; namedCareers: string[]; onClose: () => void }) {
  const [draft, setDraft] = useState<Preferences>(prefs);
  const patch = (next: Partial<Preferences>) => setDraft((d) => ({ ...d, ...next }));
  const patchJobs = (next: Partial<JobPrefs>) => setDraft((d) => ({ ...d, jobs: { ...d.jobs, ...next } }));
  const save = () => { writePreferences(draft); onClose(); };
  const section = SECTIONS.find((s) => s.id === id)!;
  const firstCareer = draft.careers[0] ?? namedCareers[0];
  const suggest = useMemo(() => O.suggestionsFor(firstCareer), [firstCareer]);

  const body: Record<SectionId, { instruction: string; content: ReactNode }> = {
    career: {
      instruction: "Choose the industries and careers that fit you best.",
      content: (
        <>
          <Multi label="What industries interest you most?" options={O.INDUSTRY_OPTIONS} value={draft.industries} max={LIMITS.industries} onChange={(industries) => patch({ industries })} initial={8} />
          <Multi label="What careers are you considering?" options={O.careerOptions(draft.industries, [...namedCareers, ...draft.careers])} value={draft.careers} max={LIMITS.careers} onChange={(careers) => patch({ careers })} initial={6} />
        </>
      ),
    },
    subjects: {
      instruction: `Pick up to ${LIMITS.subjects} subjects you enjoy most.`,
      content: <Multi label="Subjects I enjoy most" options={O.SUBJECT_OPTIONS} value={draft.subjects} max={LIMITS.subjects} onChange={(subjects) => patch({ subjects })} />,
    },
    work: {
      instruction: "Choose the ways of working that feel right for you.",
      content: (
        <>
          <Single label="How do you like to work?" options={O.WORK_WITH} value={draft.workWith} onChange={(workWith) => patch({ workWith })} />
          <Single label="What pace feels best?" options={O.PACE} value={draft.pace} onChange={(pace) => patch({ pace })} />
          <Single label="Structured or flexible?" options={O.STRUCTURE} value={draft.structure} onChange={(structure) => patch({ structure })} />
          <Multi label="What team size do you prefer?" options={O.TEAM_SIZE} value={draft.teamSize} max={LIMITS.teamSize} onChange={(teamSize) => patch({ teamSize })} />
          <Multi label="Where would you like to work?" options={O.ENVIRONMENTS} value={draft.environments} max={LIMITS.environments} onChange={(environments) => patch({ environments })} />
        </>
      ),
    },
    education: {
      instruction: "Update your GPA and education plans.",
      content: (
        <>
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
              Current GPA
              <input type="number" min={0} max={5} step={0.01} placeholder="For example, 3.7" value={draft.gpa} onChange={(e) => patch({ gpa: e.target.value })} className={INPUT} style={INPUT_STYLE} />
            </label>
            <Single label="GPA type" options={O.GPA_TYPES.map((t) => t.label)} value={O.GPA_TYPES.find((t) => t.id === draft.gpaType)?.label ?? ""} onChange={(label) => patch({ gpaType: O.GPA_TYPES.find((t) => t.label === label)?.id ?? "" })} />
          </div>
          <div className="flex flex-col gap-[var(--space-2)]">
            <p className="text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>How much education are you open to after high school?</p>
            <Multi label="Education pathways" options={O.PATHWAYS} value={draft.pathways} max={LIMITS.pathways} onChange={(pathways) => patch({ pathways })} />
          </div>
        </>
      ),
    },
    location: {
      instruction: "Where would you consider going to school?",
      content: (
        <>
          <Multi label="Preferred states" options={O.STATES as string[]} value={draft.states} max={LIMITS.states} onChange={(states) => patch({ states })} initial={8} />
          <Single label="How far would you travel?" options={O.DISTANCES} value={draft.distance} onChange={(distance) => patch({ distance })} />
          <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
            Yearly tuition budget
            <select value={draft.budget} onChange={(e) => patch({ budget: e.target.value })} className={INPUT} style={INPUT_STYLE}>
              <option value="">Choose a budget</option>
              {O.BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
        </>
      ),
    },
    school: {
      instruction: "What kind of school feels right for you?",
      content: (
        <>
          <Multi label="School type" options={O.SCHOOL_TYPES} value={draft.schoolTypes} max={LIMITS.schoolTypes} onChange={(schoolTypes) => patch({ schoolTypes })} />
          <Multi label="Campus setting" options={O.CAMPUS} value={draft.campus} max={LIMITS.campus} onChange={(campus) => patch({ campus })} />
          <Multi label="School size" options={O.SIZES} value={draft.sizes} max={LIMITS.sizes} onChange={(sizes) => patch({ sizes })} />
        </>
      ),
    },
    skills: {
      instruction: "Choose what you want to build next.",
      content: (
        <>
          {firstCareer && <p className="text-[12.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>Suggested for {firstCareer}</p>}
          <Multi label="What I want to build next" caps options={Array.from(new Set([...suggest.skills.slice(0, 6), ...suggest.software.slice(0, 6), ...suggest.skills.slice(6), ...suggest.software.slice(6)]))} value={draft.skillsToBuild} max={LIMITS.skillsToBuild} onChange={(skillsToBuild) => patch({ skillsToBuild })} initial={8} />
          <Expander label="Add skills or software I already know" openLabel="Hide skills and software I already know">
            <Multi label="Skills I have" options={suggest.skills} value={draft.skillsHave} onChange={(skillsHave) => patch({ skillsHave })} initial={8} />
            <Multi label="Software I know" options={suggest.software} value={draft.softwareKnow} onChange={(softwareKnow) => patch({ softwareKnow })} initial={8} />
          </Expander>
        </>
      ),
    },
    jobs: {
      instruction: "Tell us what kinds of opportunities interest you.",
      content: (
        <>
          <Multi label="What opportunities are you interested in?" options={O.OPPORTUNITY_TYPES} value={draft.jobs.types} onChange={(types) => patchJobs({ types })} />
          <Multi label="What roles interest you?" options={Array.from(new Set([...suggest.roles, ...draft.jobs.roles]))} value={draft.jobs.roles} max={LIMITS.jobRoles} onChange={(roles) => patchJobs({ roles })} />
          <Multi label="Where would you work?" options={Array.from(new Set([...draft.states, "Open to other locations", ...(O.STATES as string[])]))} value={draft.jobs.locations} max={LIMITS.jobLocations} onChange={(locations) => patchJobs({ locations })} initial={6} />
          <Multi label="How would you like to work?" options={O.WORK_MODES} value={draft.jobs.modes} max={LIMITS.jobModes} onChange={(modes) => patchJobs({ modes })} />
          <Expander label="More job preferences" openLabel="Hide job preferences">
            <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
              <Text label="Graduation year" type="number" value={draft.jobs.gradYear} placeholder="2028" onChange={(gradYear) => patchJobs({ gradYear })} />
              <Text label="Availability" value={draft.jobs.availability} placeholder="Weekends, summer, after school" onChange={(availability) => patchJobs({ availability })} />
            </div>
            <Single label="Willing to relocate" options={O.RELOCATE} value={draft.jobs.relocate} onChange={(relocate) => patchJobs({ relocate })} />
            <Text label="Languages" value={draft.jobs.languages} placeholder="For example, English, Spanish" onChange={(languages) => patchJobs({ languages })} />
            <Text label="Certifications / licenses" value={draft.jobs.certifications} placeholder="Add any certifications you have" onChange={(certifications) => patchJobs({ certifications })} />
            <Text label="Portfolio or professional profile" type="url" value={draft.jobs.portfolio} placeholder="https://" onChange={(portfolio) => patchJobs({ portfolio })} />
          </Expander>
        </>
      ),
    },
  };

  return (
    <Modal title={section.title} optional={section.optional} instruction={body[id].instruction} onCancel={onClose} onSave={save}>
      {body[id].content}
    </Modal>
  );
}

// -------------------------------------------------------------- primitives ----

const INPUT = "min-h-[44px] w-full rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14px] font-medium outline-none focus-visible:ring-2";
const INPUT_STYLE = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;

function Text({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT} style={INPUT_STYLE} />
    </label>
  );
}

function Chip({ on, disabled, onClick, children }: { on: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className="dm-quiet flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[14px] py-[8px] text-left text-[12.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: on ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "var(--glass-surface-1)", color: "var(--foreground)" }}>
      {on && <Check className="h-[14px] w-[14px] flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--accent-subtle)" }} />}
      {children}
    </button>
  );
}

/** Multi-select chips with an optional cap ("2 of 3 selected") and a "See
 *  more" fold for long lists; selected options always stay visible. */
function Multi({ label, options, value, onChange, max, initial, caps = false }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number; initial?: number; caps?: boolean }) {
  const [more, setMore] = useState(false);
  const shown = initial && !more ? options.filter((o, i) => i < initial || value.includes(o)) : options;
  const full = max !== undefined && value.length >= max;
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : full ? value : [...value, o]);
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <div className="flex items-baseline justify-between gap-[var(--space-3)]">
        <p className={`text-[13px] font-extrabold ${caps ? "tracking-[0.06em] uppercase" : ""}`} style={{ color: caps ? "var(--muted-foreground)" : "var(--foreground)" }}>{label}</p>
        {max !== undefined && <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: full ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{value.length} of {max} selected</span>}
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {shown.map((o) => <Chip key={o} on={value.includes(o)} disabled={full && !value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
      </div>
      {initial && options.length > initial && (
        <button type="button" onClick={() => setMore((m) => !m)} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>
          {more ? "Show less" : "See more"} <ChevronRight className={`h-4 w-4 transition-transform ${more ? "-rotate-90" : ""}`} aria-hidden />
        </button>
      )}
    </div>
  );
}

function Single({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]" role="group" aria-label={label}>
      <p className="text-[13px] font-extrabold" style={{ color: "var(--foreground)" }}>{label}</p>
      <div className="flex flex-wrap gap-[8px]">
        {options.map((o) => <Chip key={o} on={value === o} onClick={() => onChange(value === o ? "" : o)}>{o}</Chip>)}
      </div>
    </div>
  );
}

function Expander({ label, openLabel, children }: { label: string; openLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="dm-link flex w-fit cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>
        {open ? <Minus className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />} {open ? openLabel : label}
      </button>
      {open && children}
    </div>
  );
}

function Modal({ title, optional, instruction, onCancel, onSave, children }: { title: string; optional?: boolean; instruction: string; onCancel: () => void; onSave: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onCancel]);
  return createPortal(
    <div className="marketing-v2 themeable no-print fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(e) => { if (e.target === e.currentTarget) onCancel(); }} role="dialog" aria-modal="true" aria-labelledby="preference-editor-title">
      <div className="flex max-h-[92dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
        <header className="flex flex-none items-start justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-[8px]">
              <h3 id="preference-editor-title" className="text-[22px] leading-tight font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
              {optional && <span className="rounded-full border px-[8px] py-[2px] text-[10.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
            </div>
            <p className="mt-[2px] text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>{instruction}</p>
          </div>
          <button type="button" aria-label="Close editor" onClick={onCancel} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[18px] w-[18px]" aria-hidden /></button>
        </header>
        <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[var(--space-5)] overflow-y-auto px-[var(--space-5)] py-[var(--space-5)]">{children}</div>
        <footer className="flex flex-none items-center justify-end gap-[var(--space-3)] border-t px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <button type="button" onClick={onCancel} className="dm-link cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-[14px] font-bold" style={{ color: "var(--foreground)" }}>Cancel</button>
          <button type="button" onClick={onSave} className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Save</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

