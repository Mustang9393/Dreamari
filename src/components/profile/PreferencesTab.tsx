"use client";

// My Profile > Preferences. Built from Joshua's Slack spec (25 Sept 2026):
// seven sections, every field he listed, his limits, his top line. His
// reference build (dceeai.replit.app/my-profile#preferences) set the
// interaction shape (rows with the current answers, a sheet per section,
// Save closes and confirms); the spec wins where the two differ (direct
// instruction: "incorporate all, his replit might be just a quick
// example"). Design pass on top: answers shown as chips with a section
// icon in a two-column grid, posters for the careers picker, the app's
// own hover patterns. It must not feel like retaking Build.

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Activity, BookOpen, Briefcase, Check, ChevronRight, GraduationCap, Minus, Plus, School, SlidersHorizontal, Target, Wrench, X, type LucideIcon } from "lucide-react";
import { LIMITS, preferencesSnapshot, serverPreferencesSnapshot, subscribePreferences, writePreferences, type JobPrefs, type Preferences } from "@/lib/preferences";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { useSavedCareers } from "@/lib/savedCareers";
import { careerSlug } from "@/components/career/slug";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { HoverBeam } from "@/components/app/HoverBeam";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS } from "./data";
import * as O from "./preferencesOptions";

type SectionId = "career" | "subjects" | "work" | "education" | "college" | "skills" | "jobs";

const SECTIONS: { id: SectionId; title: string; icon: LucideIcon; optional?: boolean }[] = [
  { id: "career", title: "Career & Industries", icon: Target },
  { id: "subjects", title: "Subjects & Skills", icon: BookOpen },
  { id: "work", title: "Work Style", icon: Activity },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "college", title: "College & Trade School", icon: School },
  { id: "skills", title: "Skills & Software", icon: Wrench },
  { id: "jobs", title: "Internship & Job Preferences", icon: Briefcase, optional: true },
];

const shortBudget = (b: string) => b.replace(/\$(\d+),000/, (_, n) => `$${n}K`);
const abbr = (s: string) => O.STATE_ABBR[s] ?? s;
const gpaTypeLabel = (id: string) => O.GPA_TYPES.find((t) => t.id === id)?.label ?? "";

/** The answers a row shows, as chips, most identifying first. */
function chipsFor(id: SectionId, p: Preferences): string[] {
  switch (id) {
    case "career": return [...p.industries, ...p.careers];
    case "subjects": return [...p.subjects, ...p.skillsToBuild];
    case "work": return [p.pace, p.workWith, p.structure, ...p.teamSize, ...p.environments].filter(Boolean);
    case "education": return [p.gpa ? `${p.gpa} GPA${p.gpaType && p.gpaType !== "unsure" ? ` ${gpaTypeLabel(p.gpaType).toLowerCase()}` : ""}` : "", p.educationLevel, ...p.pathways].filter(Boolean);
    case "college": return [...p.states.map(abbr), p.distance, p.budget ? shortBudget(p.budget) : "", ...p.schoolTypes, ...p.campus, ...p.sizes].filter(Boolean);
    case "skills": return [...p.skillsHave, ...p.softwareKnow, ...p.softwareLearn];
    case "jobs": return [...p.jobs.types, ...p.jobs.roles, ...p.jobs.modes];
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
  // Save confirmation (the reference's copy) plus a brief accent on the row
  // that changed, so the eye lands on what just moved.
  const [savedNote, setSavedNote] = useState<SectionId | null>(null);
  useEffect(() => {
    if (!savedNote) return;
    const t = window.setTimeout(() => setSavedNote(null), 4000);
    return () => window.clearTimeout(t);
  }, [savedNote]);
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
          <p className="text-[14.5px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Your interests can change. Update them anytime and Dreamari will adjust your recommendations.</p>
          {updated && <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>Last updated {updated}</p>}
        </div>
      </div>

      {savedNote && (
        <div role="status" className="flex items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--color-feedback-success) 45%, var(--glass-border))", background: "color-mix(in srgb, var(--color-feedback-success) 10%, transparent)", color: "var(--foreground)" }}>
          <Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--color-feedback-success)" }} /> Saved. Your recommendations will update.
        </div>
      )}

      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const chips = chipsFor(s.id, prefs);
          const Icon = s.icon;
          const shown = chips.slice(0, 4);
          const rest = chips.length - shown.length;
          const justSaved = savedNote === s.id;
          return (
            <HoverBeam key={s.id} strength={0.6} className="min-w-0">
              <button
                type="button"
                onClick={() => setOpen(s.id)}
                aria-label={`${s.title}: ${chips.length ? chips.join(", ") : "not set yet"}. Edit`}
                className="dm-tap flex h-full w-full cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
                style={{ borderColor: justSaved ? "color-mix(in srgb, var(--color-feedback-success) 55%, var(--glass-border))" : "var(--glass-border)", background: "color-mix(in srgb, var(--card) 85%, transparent)", transition: "border-color 400ms ease" }}
              >
                <span className="flex items-center gap-[10px]">
                  <span className="flex size-8 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{s.title}</span>
                  {s.optional && <span className="flex-none rounded-full border px-[7px] py-[1px] text-[10px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
                  <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                </span>
                <span className="flex flex-wrap gap-[6px]">
                  {shown.length === 0 ? (
                    <span className="text-[13px] font-medium" style={{ color: "color-mix(in srgb, var(--muted-foreground) 70%, transparent)" }}>Not set yet</span>
                  ) : (
                    <>
                      {shown.map((c) => (
                        <span key={c} className="max-w-full truncate rounded-full border px-[10px] py-[3px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{c}</span>
                      ))}
                      {rest > 0 && <span className="rounded-full px-[8px] py-[3px] text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>+{rest}</span>}
                    </>
                  )}
                </span>
              </button>
            </HoverBeam>
          );
        })}
      </div>

      {open && <SectionEditor id={open} prefs={prefs} namedCareers={namedCareers} onClose={() => setOpen(null)} onSaved={() => setSavedNote(open)} />}
    </div>
  );
}

// ---------------------------------------------------------------- editors ----

function SectionEditor({ id, prefs, namedCareers, onClose, onSaved }: { id: SectionId; prefs: Preferences; namedCareers: string[]; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<Preferences>(prefs);
  const patch = (next: Partial<Preferences>) => setDraft((d) => ({ ...d, ...next }));
  const patchJobs = (next: Partial<JobPrefs>) => setDraft((d) => ({ ...d, jobs: { ...d.jobs, ...next } }));
  const save = () => { writePreferences(draft); onClose(); onSaved(); };
  const section = SECTIONS.find((s) => s.id === id)!;
  const firstCareer = draft.careers[0] ?? namedCareers[0];
  const suggest = useMemo(() => O.suggestionsFor(firstCareer), [firstCareer]);
  const industries = O.INDUSTRY_OPTIONS;

  const body: Record<SectionId, ReactNode> = {
    career: (
      <>
        <Multi label="Industries I'm interested in" options={industries} value={draft.industries} max={LIMITS.industries} onChange={(v) => patch({ industries: v })} initial={9} />
        <CareerTiles label="Careers I'm considering" options={O.careerOptions(draft.industries, [...namedCareers, ...draft.careers])} value={draft.careers} max={LIMITS.careers} onChange={(v) => patch({ careers: v })} />
      </>
    ),
    subjects: (
      <>
        <Multi label="Subjects I enjoy most" options={O.SUBJECT_OPTIONS} value={draft.subjects} max={LIMITS.subjects} onChange={(v) => patch({ subjects: v })} />
        <Multi label="Skills I want to build" options={Array.from(new Set([...O.SKILL_OPTIONS, ...suggest.skills]))} value={draft.skillsToBuild} max={LIMITS.skillsToBuild} onChange={(v) => patch({ skillsToBuild: v })} initial={12} />
      </>
    ),
    work: (
      <>
        <Single label="Pace" options={O.PACE} value={draft.pace} onChange={(v) => patch({ pace: v })} />
        <Single label="Independent or team" options={O.WORK_WITH} value={draft.workWith} onChange={(v) => patch({ workWith: v })} />
        <Single label="Structured or flexible" options={O.STRUCTURE} value={draft.structure} onChange={(v) => patch({ structure: v })} />
        <Multi label="Preferred team size" options={O.TEAM_SIZE} value={draft.teamSize} max={LIMITS.teamSize} onChange={(v) => patch({ teamSize: v })} />
        <Multi label="Preferred work environment" options={O.ENVIRONMENTS} value={draft.environments} max={LIMITS.environments} onChange={(v) => patch({ environments: v })} />
      </>
    ),
    education: (
      <>
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
            GPA
            <input type="number" min={0} max={5} step={0.01} placeholder="For example, 3.7" value={draft.gpa} onChange={(e) => patch({ gpa: e.target.value })} className={INPUT} style={INPUT_STYLE} />
          </label>
          <Single label="GPA type" options={O.GPA_TYPES.map((t) => t.label)} value={gpaTypeLabel(draft.gpaType)} onChange={(label) => patch({ gpaType: O.GPA_TYPES.find((t) => t.label === label)?.id ?? "" })} />
        </div>
        <Single label="How much education after high school am I comfortable completing?" options={O.EDUCATION_LEVELS} value={draft.educationLevel} onChange={(v) => patch({ educationLevel: v })} />
        <Multi label="Education pathways I would consider" options={O.PATHWAYS} value={draft.pathways} max={LIMITS.pathways} onChange={(v) => patch({ pathways: v })} />
      </>
    ),
    college: (
      <>
        <Multi label="Preferred states" options={O.STATES as string[]} value={draft.states} max={LIMITS.states} onChange={(v) => patch({ states: v })} initial={8} />
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <Single label="Distance" options={O.DISTANCES} value={draft.distance} onChange={(v) => patch({ distance: v })} />
          <label className="flex flex-col gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
            Yearly tuition budget
            <select value={draft.budget} onChange={(e) => patch({ budget: e.target.value })} className={INPUT} style={INPUT_STYLE}>
              <option value="">Choose a budget</option>
              {O.BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
        </div>
        <Multi label="School type" options={O.SCHOOL_TYPES} value={draft.schoolTypes} max={LIMITS.schoolTypes} onChange={(v) => patch({ schoolTypes: v })} />
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <Multi label="Campus setting" options={O.CAMPUS} value={draft.campus} max={LIMITS.campus} onChange={(v) => patch({ campus: v })} />
          <Multi label="School size" options={O.SIZES} value={draft.sizes} max={LIMITS.sizes} onChange={(v) => patch({ sizes: v })} />
        </div>
      </>
    ),
    skills: (
      <>
        {firstCareer && <p className="text-[12.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>Suggested for {firstCareer}</p>}
        <Multi label="Skills I have" options={suggest.skills} value={draft.skillsHave} onChange={(v) => patch({ skillsHave: v })} initial={8} />
        <Multi label="Software I know" options={suggest.software} value={draft.softwareKnow} onChange={(v) => patch({ softwareKnow: v })} initial={8} />
        <Multi label="Software I want to learn" options={suggest.software} value={draft.softwareLearn} max={LIMITS.softwareLearn} onChange={(v) => patch({ softwareLearn: v })} initial={8} />
      </>
    ),
    jobs: (
      <>
        <Multi label="Opportunity type" options={O.OPPORTUNITY_TYPES} value={draft.jobs.types} onChange={(v) => patchJobs({ types: v })} />
        <Multi label="Preferred roles" options={Array.from(new Set([...suggest.roles, ...draft.jobs.roles]))} value={draft.jobs.roles} max={LIMITS.jobRoles} onChange={(v) => patchJobs({ roles: v })} />
        <Multi label="Preferred industries" options={Array.from(new Set([...draft.industries, ...industries]))} value={draft.jobs.industries} max={LIMITS.jobIndustries} onChange={(v) => patchJobs({ industries: v })} initial={6} />
        <Multi label="Preferred work locations" options={Array.from(new Set([...draft.states, "Open to other locations", ...(O.STATES as string[])]))} value={draft.jobs.locations} max={LIMITS.jobLocations} onChange={(v) => patchJobs({ locations: v })} initial={6} />
        <Multi label="Remote, hybrid or in-person" options={O.WORK_MODES} value={draft.jobs.modes} max={LIMITS.jobModes} onChange={(v) => patchJobs({ modes: v })} />
        <Expander label="More job preferences" openLabel="Hide job preferences">
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <Text label="Graduation year" type="number" value={draft.jobs.gradYear} placeholder="2028" onChange={(v) => patchJobs({ gradYear: v })} />
            <Text label="Availability" value={draft.jobs.availability} placeholder="Weekends, summer, after school" onChange={(v) => patchJobs({ availability: v })} />
          </div>
          <Single label="Willing to relocate" options={O.RELOCATE} value={draft.jobs.relocate} onChange={(v) => patchJobs({ relocate: v })} />
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <Text label="Languages" value={draft.jobs.languages} placeholder="For example, English, Spanish" onChange={(v) => patchJobs({ languages: v })} />
            <Text label="Certifications / licenses" value={draft.jobs.certifications} placeholder="Add any certifications you have" onChange={(v) => patchJobs({ certifications: v })} />
          </div>
          <Text label="Portfolio or professional profile" type="url" value={draft.jobs.portfolio} placeholder="https://" onChange={(v) => patchJobs({ portfolio: v })} />
        </Expander>
      </>
    ),
  };

  return (
    <Modal title={section.title} optional={section.optional} onCancel={onClose} onSave={save}>
      {body[id]}
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

function GroupLabel({ label, count, max }: { label: string; count?: number; max?: number }) {
  const full = max !== undefined && count !== undefined && count >= max;
  return (
    <div className="flex items-baseline justify-between gap-[var(--space-3)]">
      <p className="text-[13px] font-extrabold" style={{ color: "var(--foreground)" }}>{label}</p>
      {max !== undefined && <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: full ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{count} of {max}</span>}
    </div>
  );
}

/** Build's chip: the same lift-and-accent hover every tappable card in the
 *  app uses (dm-tap), never a brightness change. */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="dm-tap flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[8px] text-left text-[13.5px] font-semibold" style={{ borderColor: on ? "color-mix(in srgb, var(--accent-subtle) 70%, transparent)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "color-mix(in srgb, var(--glass-surface-1) 70%, transparent)", color: "var(--foreground)" }}>
      <span aria-hidden className="h-2 w-2 flex-none rounded-full transition-transform duration-150" style={{ background: on ? "var(--accent-subtle)" : "var(--glass-border)", transform: on ? "scale(1.25)" : "scale(1)" }} />
      {children}
    </button>
  );
}

function SeeMore({ more, onToggle }: { more: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>
      {more ? "Show less" : "See more"} <ChevronRight className={`h-4 w-4 transition-transform ${more ? "-rotate-90" : ""}`} aria-hidden />
    </button>
  );
}

/** Multi-select chips with an optional cap and a "See more" fold; selected
 *  options always stay visible. At the cap the oldest pick makes room
 *  (Build's own rule, 24 Sept 2026: locking new picks out "creates
 *  friction"). */
function Multi({ label, options, value, onChange, max, initial }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number; initial?: number }) {
  const [more, setMore] = useState(false);
  // Folded lists lead with what is already picked, then the first N.
  const shown = initial && !more ? [...options.filter((o) => value.includes(o)), ...options.filter((o, i) => i < initial && !value.includes(o))] : options;
  const full = max !== undefined && value.length >= max;
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : full ? [...value.slice(1), o] : [...value, o]);
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <GroupLabel label={label} count={value.length} max={max} />
      <div className="flex flex-wrap gap-[8px]">
        {shown.map((o) => <Chip key={o} on={value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
      </div>
      {initial && options.length > initial && <SeeMore more={more} onToggle={() => setMore((m) => !m)} />}
    </div>
  );
}

function Single({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]" role="group" aria-label={label}>
      <GroupLabel label={label} />
      <div className="flex flex-wrap gap-[8px]">
        {options.map((o) => <Chip key={o} on={value === o} onClick={() => onChange(value === o ? "" : o)}>{o}</Chip>)}
      </div>
    </div>
  );
}

/** Careers look like posters everywhere else in the app, so they do here
 *  too: the poster with its world face, a selection ring and a check. */
function CareerTiles({ label, options, value, onChange, max }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max: number }) {
  const [more, setMore] = useState(false);
  const INITIAL = 8;
  const shown = more ? options : options.filter((o, i) => i < INITIAL || value.includes(o));
  const full = value.length >= max;
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : full ? [...value.slice(1), o] : [...value, o]);
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <GroupLabel label={label} count={value.length} max={max} />
      {options.length === 0 ? (
        <p className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Pick an industry first.</p>
      ) : (
        <div className="grid grid-cols-3 gap-[8px] sm:grid-cols-4">
          {shown.map((title) => {
            const on = value.includes(title);
            const meta = O.careerPhoto(title);
            const accent = meta ? (WORLD_COLORS[meta.world] ?? "var(--primary)") : "var(--primary)";
            return (
              <button key={title} type="button" aria-pressed={on} onClick={() => toggle(title)} className="dm-tap relative aspect-[3/4] cursor-pointer overflow-hidden rounded-[var(--radius-md)] border text-left" style={{ borderColor: on ? accent : "var(--glass-border)", boxShadow: on ? `0 0 0 2px color-mix(in srgb, ${accent} 55%, transparent)` : undefined, background: "var(--glass-surface-1)" }}>
                {meta && <Image src={meta.photo} alt="" fill sizes="160px" className="object-cover" draggable={false} />}
                <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[6px] pt-8 pb-[8px] text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)" }}>
                  <span className="line-clamp-2 [overflow-wrap:normal] [word-break:keep-all]" style={{ ...(meta ? posterTitleFont(meta.world) : {}), fontSize: 12, lineHeight: 1.15, color: "var(--poster-title)" }}>{title}</span>
                </span>
                <span aria-hidden className="absolute top-[6px] right-[6px] flex size-6 items-center justify-center rounded-full border-2" style={{ background: on ? accent : "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: on ? accent : "rgba(255,255,255,0.5)" }}>
                  {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {options.length > INITIAL && <SeeMore more={more} onToggle={() => setMore((m) => !m)} />}
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

function Modal({ title, optional, onCancel, onSave, children }: { title: string; optional?: boolean; onCancel: () => void; onSave: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onCancel]);
  return createPortal(
    <div className="marketing-v2 themeable no-print fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)" }} onPointerUp={(e) => { if (e.target === e.currentTarget) onCancel(); }} role="dialog" aria-modal="true" aria-labelledby="preference-editor-title">
      <div className="flex max-h-[94dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:max-h-[88dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
        <header className="flex flex-none items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <div className="flex min-w-0 items-center gap-[8px]">
            <h3 id="preference-editor-title" className="truncate text-[20px] leading-tight font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
            {optional && <span className="flex-none rounded-full border px-[8px] py-[2px] text-[10.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
          </div>
          <button type="button" aria-label="Close editor" onClick={onCancel} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[18px] w-[18px]" aria-hidden /></button>
        </header>
        <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[var(--space-5)] overflow-y-auto px-[var(--space-5)] py-[var(--space-5)]">{children}</div>
        <footer className="flex flex-none items-center justify-end gap-[var(--space-3)] border-t px-[var(--space-5)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
          <button type="button" onClick={onCancel} className="dm-link cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-[14px] font-bold" style={{ color: "var(--foreground)" }}>Cancel</button>
          <button type="button" onClick={onSave} className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Save</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
