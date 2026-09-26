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
//
// 26 Sept 2026, Joshua's second pass (Slack) plus a design pass:
// - Top line is his: "Update your preferences to improve your
//   recommendations as your interests change." No supporting paragraph:
//   each editor says in one line what it shapes, and each save confirms
//   what is updating, so the student learns it at the moment it is true
//   (the user's call: "when they take an action the feedback or the UI
//   then tells them what's happening").
// - Career & Industries split into Industries and Saved Careers; Saved
//   Careers reads what the student already saved elsewhere, never asks
//   again. Work Style keeps pace, team size, environment (independent/team
//   and structured/flexible removed). Education is GPA plus one question,
//   pathways (max 2). College drops School Type (Education has it). Jobs
//   drops Preferred Industries (it carries over from Industries).
// - Eight rows became three groups (your interests, after high school,
//   work), each one card with divided rows, so the page reads in three
//   chunks, not eight identical cards. Empty rows say "Add".

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronRight, Compass, Minus, Plus, Sparkles, X } from "lucide-react";
import { COLLEGES } from "@/components/colleges/data";
import { LIMITS, preferencesSnapshot, serverPreferencesSnapshot, subscribePreferences, writePreferences, type JobPrefs, type Preferences } from "@/lib/preferences";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { useSavedCareers } from "@/lib/savedCareers";
import { careerSlug } from "@/components/career/slug";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { HoverBeam } from "@/components/app/HoverBeam";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { ALL_PROFILE_CAREERS } from "./data";
import * as O from "./preferencesOptions";

type SectionId = "industries" | "saved" | "subjects" | "skills" | "education" | "college" | "work" | "jobs";

type Section = { id: SectionId; title: string; optional?: boolean; /** what this section shapes, said once in its editor and on save */ shapes: string[] };
const SECTIONS: Record<SectionId, Section> = {
  industries: { id: "industries", title: "Industries", shapes: ["Explore careers", "Play and Connect"] },
  saved: { id: "saved", title: "Saved Careers", shapes: ["Career Report", "My Plan"] },
  subjects: { id: "subjects", title: "Subjects", shapes: ["Explore careers", "Career Report"] },
  work: { id: "work", title: "Work Style", shapes: ["Explore careers"] },
  education: { id: "education", title: "Education", shapes: ["school recommendations", "My Plan"] },
  college: { id: "college", title: "College & Trade School", shapes: ["school recommendations"] },
  skills: { id: "skills", title: "Skills & Software", shapes: ["Career Report", "My Plan"] },
  jobs: { id: "jobs", title: "Internship & Job Preferences", optional: true, shapes: ["internship and job matches"] },
};
// Joshua's order (Slack, 25 and 26 Sept 2026), one list, no group headers.
const ORDER: SectionId[] = ["industries", "saved", "subjects", "work", "education", "college", "skills", "jobs"];
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

const shortBudget = (b: string) => b.replace(/\$(\d+),000/, (_, n) => `$${n}K`);
const abbr = (s: string) => O.STATE_ABBR[s] ?? s;
const gpaTypeLabel = (id: string) => O.GPA_TYPES.find((t) => t.id === id)?.label ?? "";

/** The answers a row shows, as chips, most identifying first. */
function chipsFor(id: SectionId, p: Preferences): string[] {
  switch (id) {
    case "industries": return p.industries;
    case "saved": return [];
    case "subjects": return p.subjects;
    case "skills": return [...p.skillsHave, ...p.skillsToBuild, ...p.softwareKnow, ...p.softwareLearn];
    case "education": return [p.gpa ? `${p.gpa} GPA${p.gpaType && p.gpaType !== "unsure" ? ` ${gpaTypeLabel(p.gpaType).toLowerCase()}` : ""}` : "", ...p.pathways].filter(Boolean);
    case "college": return [...p.states.map(abbr), p.distance, p.budget ? shortBudget(p.budget) : "", ...p.campus, ...p.sizes].filter(Boolean);
    case "work": return [p.pace, ...p.teamSize, ...p.environments].filter(Boolean);
    case "jobs": return [...p.jobs.types, ...p.jobs.roles, ...p.jobs.modes];
  }
}

/** What a save visibly changed, shown in the confirmation (26 Sept 2026:
 *  "can't we do something with UI and feedback... to better do this?"):
 *  the student SEES their recommendations move instead of reading that
 *  they will. Concrete where the data allows it (Industries: careers now
 *  surfacing; College: schools that now match); a named update otherwise. */
type Proof = { text: string; posters?: string[]; href?: string; cta?: string };
function proofFor(id: SectionId, p: Preferences): Proof {
  if (id === "industries" && p.industries.length) {
    const posters = p.industries.flatMap((w) => ALL_CATALOG_CAREERS.filter((c) => c.world === w).slice(0, 2)).slice(0, 3).map((c) => c.photo);
    return { text: `New in Explore for ${list(p.industries.map((w) => w.split(" & ")[0]))}`, posters, href: "/explore", cta: "See them" };
  }
  if (id === "college" && p.states.length) {
    const max = Number(p.budget.replace(/[^0-9]/g, "")) || Infinity;
    const n = COLLEGES.filter((c) => p.states.includes(c.stateName) && (c.netPrice === null || c.netPrice <= max)).length;
    return { text: `${n} ${n === 1 ? "school matches" : "schools match"} in ${list(p.states.map(abbr))}`, href: "/colleges", cta: "See schools" };
  }
  return { text: `Updating your ${list(SECTIONS[id].shapes)}` };
}

/** A saved career as the app shows it: title, poster and world. */
function savedCard(id: string): { id: string; title: string; photo: string | null; world: string } {
  const prof = ALL_PROFILE_CAREERS.find((c) => c.id === id);
  if (prof) return { id, title: prof.title, photo: prof.photo, world: prof.world };
  const cat = ALL_CATALOG_CAREERS.find((c) => careerSlug(c.title) === id);
  return { id, title: cat?.title ?? id, photo: cat?.photo ?? null, world: cat?.world ?? "" };
}


// Loading: the server render has no answers, so until the client has
// read them the rows show skeletons, never a flash of "Add" on every row.
// With a backend this is the fetch in flight. DEMO-ONLY: `?prefs=loading`
// holds this state and `?prefs=error` makes every save fail, so each can
// be reviewed (docs/handoff/specs/preferences.md, States).
const noopSubscribe = () => () => {};
function useDemoPrefsState(): "loading" | "error" | null {
  return useSyncExternalStore(noopSubscribe, () => {
    const v = new URLSearchParams(window.location.search).get("prefs");
    return v === "loading" || v === "error" ? v : null;
  }, () => null);
}

export function PreferencesTab() {
  const prefs = useSyncExternalStore(subscribePreferences, preferencesSnapshot, serverPreferencesSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const demoState = useDemoPrefsState();
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const [saved, toggleSaved] = useSavedCareers();
  const [open, setOpen] = useState<SectionId | null>(null);
  // The save confirmation names what is updating, and the row that changed
  // gets a brief accent, so the eye lands on what just moved.
  const [savedNote, setSavedNote] = useState<SectionId | null>(null);
  useEffect(() => {
    if (!savedNote) return;
    const t = window.setTimeout(() => setSavedNote(null), 7000);
    return () => window.clearTimeout(t);
  }, [savedNote]);
  // Top 3 first, then everything else saved: the careers the student has
  // already chosen, never asked for again here.
  const savedIds = useMemo(() => Array.from(new Set([...picks.ids, ...Array.from(saved)])), [picks.ids, saved]);
  const savedCareers = useMemo(() => savedIds.map(savedCard), [savedIds]);
  const namedCareers = useMemo(() => savedCareers.map((c) => c.title), [savedCareers]);
  const updated = prefs.updatedAt ? new Date(prefs.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  const reduce = useReducedMotion();
  // One nudge: the first empty section's "Add" glints (the app's text
  // glint, Explore's "For you"); every other empty row stays plain.
  const firstEmpty = ORDER.find((id) => (id === "saved" ? savedCareers.length === 0 : chipsFor(id, prefs).length === 0));

  const row = (id: SectionId) => {
    const sec = SECTIONS[id];
    const chips = chipsFor(id, prefs);
    const empty = id === "saved" ? savedCareers.length === 0 : chips.length === 0;
    const justSaved = savedNote === id;
    return (
      <li className="list-none">
        <button
          type="button"
          onClick={() => setOpen(id)}
          aria-label={`${sec.title}: ${id === "saved" ? `${savedCareers.length} saved` : chips.length ? chips.join(", ") : "not set yet"}. Edit`}
          className="dm-quiet group flex w-full cursor-pointer flex-col gap-[10px] px-[var(--space-4)] py-[14px] text-left sm:flex-row sm:items-center sm:gap-[var(--space-5)]"
          style={{ background: justSaved ? "color-mix(in srgb, var(--color-feedback-success) 9%, transparent)" : undefined, transition: "background-color 500ms ease" }}
        >
          {/* No icon tiles (26 Sept 2026: "we can lose the icons too"): the
             title leads; a saved row shows a check beside it for a moment. */}
          <span className="flex items-center gap-[8px] sm:w-[290px] sm:flex-none">
            <span className="min-w-0 text-[15px] leading-[20px] font-extrabold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{sec.title}</span>
            {justSaved && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 20 }} className="flex-none"><Check className="h-4 w-4" strokeWidth={3} aria-label="Saved" style={{ color: "var(--color-feedback-success)" }} /></motion.span>}
            <span className="flex-1" />
            {sec.optional && <span className="flex-none rounded-full border px-[7px] py-[1px] text-[10px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
          </span>
          {id === "saved" && !empty ? (
            <SavedStrip careers={savedCareers} />
          ) : empty ? (
            <span className="flex min-w-0 flex-1 items-center gap-[4px] text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}><Plus className="h-4 w-4" aria-hidden /> <span className={id === firstEmpty ? "dm-text-nudge" : undefined}>Add</span></span>
          ) : (
            <FitChips chips={chips} />
          )}
          <span className={`hidden flex-none items-center gap-[2px] text-[12.5px] font-semibold transition-colors group-hover:text-[var(--foreground)] ${empty ? "" : "sm:flex"}`} style={{ color: "var(--muted-foreground)" }}>Edit <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-[2px]" aria-hidden /></span>
        </button>
        <AnimatePresence initial={false}>{justSaved && <ProofBand key="proof" proof={proofFor(id, prefs)} />}</AnimatePresence>
      </li>
    );
  };

  return (
    <div role="tabpanel" id="profile-panel-preferences" aria-labelledby="profile-tab-preferences" className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-start justify-between gap-x-[var(--space-4)] gap-y-[6px]">
        <div className="flex min-w-0 items-start gap-[var(--space-3)]">
          <div className="flex min-w-0 flex-col gap-[4px]">
            <h2 className="text-[26px] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Preferences</h2>
            {/* Joshua's line, verbatim (Slack, 26 Sept 2026). His optional
               supporting line is left out: the save confirmation says what
               is updating at the moment it happens. */}
            <p className="text-[15px] leading-[21px] [text-wrap:balance]" style={{ color: "var(--muted-foreground)" }}>Update your preferences to improve your recommendations as your interests change.</p>
          </div>
        </div>
        {updated && <p className="text-[11.5px] sm:pt-[10px]" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>Last updated {updated}</p>}
      </div>

      {(!hydrated || demoState === "loading") && (
        <ul aria-busy="true" aria-label="Preferences, loading" className="flex flex-col divide-y divide-[color:var(--glass-border)] overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 85%, transparent)" }}>
          {ORDER.map((id) => (
            <li key={id} className="flex items-center gap-[12px] px-[var(--space-4)] py-[16px]">
              <span className="size-9 flex-none animate-pulse rounded-[var(--radius-md)]" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} />
              <span className="h-[12px] w-[140px] animate-pulse rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} />
              <span className="ml-auto hidden h-[22px] w-[180px] animate-pulse rounded-full sm:block" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }} />
            </li>
          ))}
        </ul>
      )}

      {/* One list in Joshua's order. The rows fade up in sequence on open. */}
      {hydrated && demoState !== "loading" && (
        <HoverBeam strength={0.5} className="min-w-0">
          <ul className="flex flex-col divide-y divide-[color:var(--glass-border)] overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 85%, transparent)" }}>
            {ORDER.map((id, i) => (
              <motion.div key={id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.035, ease: [0.22, 1, 0.36, 1] }}>{row(id)}</motion.div>
            ))}
          </ul>
        </HoverBeam>
      )}


      {open === "saved" ? (
        <SavedEditor careers={savedCareers} topIds={picks.ids} onRemove={(id) => toggleSaved(id)} onClose={() => setOpen(null)} />
      ) : open ? (
        <SectionEditor id={open} prefs={prefs} namedCareers={namedCareers} failSaves={demoState === "error"} onClose={() => setOpen(null)} onSaved={() => setSavedNote(open)} />
      ) : null}
    </div>
  );
}

/** A saved-careers row: the first few posters, then the count. */
function SavedStrip({ careers }: { careers: { id: string; title: string; photo: string | null }[] }) {
  const shown = careers.slice(0, 5);
  return (
    <span className="flex min-w-0 flex-1 items-center gap-[10px]">
      <span className="flex -space-x-[8px]">
        {shown.map((c) => (
          <span key={c.id} className="relative h-[34px] w-[26px] flex-none overflow-hidden rounded-[6px] border-2" style={{ borderColor: "var(--card)", background: "var(--glass-surface-2)" }}>
            {c.photo && <Image src={c.photo} alt="" fill sizes="26px" className="object-cover" />}
          </span>
        ))}
      </span>
      <span className="truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{careers.length} saved</span>
    </span>
  );
}

/** What a save changed, opened right under the row just edited (26 Sept
 *  2026: a floating confirmation at the bottom "appears on a black bar...
 *  people might not even see it. It needs more presence but not in a way
 *  that it breaks your flow"). The eye is already on that row when the
 *  sheet closes, so the proof lands in the eye line, inline, then folds
 *  away on its own. */
function ProofBand({ proof }: { proof: Proof }) {
  const reduce = useReducedMotion();
  return (
    <motion.div role="status" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px] px-[var(--space-4)] pt-[2px] pb-[14px]">
        <span className="flex min-w-0 flex-1 items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={{ borderColor: "color-mix(in srgb, var(--color-feedback-success) 40%, var(--glass-border))", background: "color-mix(in srgb, var(--color-feedback-success) 10%, transparent)" }}>
          {proof.posters && proof.posters.length > 0 && (
            <span className="flex flex-none -space-x-[10px]" aria-hidden>
              {proof.posters.map((src, i) => (
                <motion.span key={src} initial={reduce ? false : { opacity: 0, y: 6, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: (i - 1) * 4 }} transition={{ delay: reduce ? 0 : 0.18 + i * 0.08, type: "spring", stiffness: 380, damping: 22 }} className="relative h-[46px] w-[35px] overflow-hidden rounded-[6px] border-2 shadow-md" style={{ borderColor: "var(--card)" }}>
                  <Image src={src} alt="" fill sizes="35px" className="object-cover" />
                </motion.span>
              ))}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-[6px] text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}><Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--color-feedback-success)" }} />{proof.text}</span>
          </span>
          {proof.href && (
            <a href={proof.href} className="dm-solid flex flex-none items-center gap-[2px] rounded-full px-[14px] py-[7px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{proof.cta} <ChevronRight className="h-4 w-4" aria-hidden /></a>
          )}
        </span>
      </div>
    </motion.div>
  );
}

/** Saved Careers: what the student already saved, never re-picked here.
 *  Remove unsaves (the same store Explore and Match use); more are added
 *  where careers live, in Explore. */
function SavedEditor({ careers, topIds, onRemove, onClose }: { careers: { id: string; title: string; photo: string | null; world: string }[]; topIds: string[]; onRemove: (id: string) => void; onClose: () => void }) {
  return (
    <Modal title="Saved Careers" onCancel={onClose} onSave={onClose} saveLabel="Done">
      {careers.length === 0 ? (
        <p className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-[10px] sm:grid-cols-4">
          {careers.map((c) => {
            const rank = topIds.indexOf(c.id);
            const accent = WORLD_COLORS[c.world] ?? "var(--primary)";
            return (
              <div key={c.id} className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: rank >= 0 ? accent : "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                {c.photo && <Image src={c.photo} alt="" fill sizes="160px" className="object-cover" draggable={false} />}
                <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[6px] pt-8 pb-[8px] text-center uppercase" style={{ backgroundImage: "var(--poster-scrim)" }}>
                  <span className="line-clamp-2 [overflow-wrap:normal] [word-break:keep-all]" style={{ ...(c.world ? posterTitleFont(c.world) : {}), fontSize: 12, lineHeight: 1.15, color: "var(--poster-title)" }}>{c.title}</span>
                </span>
                {rank >= 0 && <span className="absolute top-[6px] left-[6px] flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: accent }}>{rank + 1}</span>}
                {rank < 0 && (
                  <button type="button" aria-label={`Remove ${c.title} from saved`} onClick={() => onRemove(c.id)} className="dm-quiet absolute top-[6px] right-[6px] flex size-7 cursor-pointer items-center justify-center rounded-full backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--background) 60%, transparent)", color: "#fff" }}>
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <a href="/explore" className="dm-link flex w-fit items-center gap-[4px] text-[13.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>
        <Compass className="h-4 w-4" aria-hidden /> Find more in Explore <ChevronRight className="h-4 w-4" aria-hidden />
      </a>
    </Modal>
  );
}

// ---------------------------------------------------------------- editors ----

function SectionEditor({ id, prefs, namedCareers, failSaves = false, onClose, onSaved }: { id: SectionId; prefs: Preferences; namedCareers: string[]; /** DEMO-ONLY: ?prefs=error */ failSaves?: boolean; onClose: () => void; onSaved: () => void }) {
  const [saveFailed, setSaveFailed] = useState(false);
  const [draft, setDraft] = useState<Preferences>(prefs);
  const patch = (next: Partial<Preferences>) => setDraft((d) => ({ ...d, ...next }));
  const patchJobs = (next: Partial<JobPrefs>) => setDraft((d) => ({ ...d, jobs: { ...d.jobs, ...next } }));
  // A failed save keeps the sheet open with every edit intact, says so in
  // one line, and turns Save into Try again. With a backend this is the
  // write rejecting (network, 5xx); nothing is lost.
  const save = () => {
    try {
      if (failSaves) throw new Error("demo save failure");
      writePreferences(draft);
      onClose();
      onSaved();
    } catch {
      setSaveFailed(true);
    }
  };
  // Save wakes up only once something changed: a sheet never asks for a
  // meaningless save.
  const dirty = JSON.stringify(draft) !== JSON.stringify(prefs);
  const section = SECTIONS[id];
  const firstCareer = namedCareers[0] ?? draft.careers[0];
  const suggest = useMemo(() => O.suggestionsFor(firstCareer), [firstCareer]);

  const body: Record<Exclude<SectionId, "saved">, ReactNode> = {
    industries: (
      <Multi label="Industries I'm interested in" options={O.INDUSTRY_OPTIONS} value={draft.industries} max={LIMITS.industries} onChange={(v) => patch({ industries: v })} />
    ),
    subjects: (
      <Multi label="Subjects I enjoy most" options={O.SUBJECT_OPTIONS} value={draft.subjects} max={LIMITS.subjects} onChange={(v) => patch({ subjects: v })} />
    ),
    skills: (
      <>
        {firstCareer && <p className="text-[11.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>Suggested for {firstCareer}</p>}
        <Multi label="Skills I have" options={suggest.skills} value={draft.skillsHave} onChange={(v) => patch({ skillsHave: v })} initial={8} />
        <Multi label="Skills I want to build" options={Array.from(new Set([...suggest.skills, ...O.SKILL_OPTIONS]))} value={draft.skillsToBuild} max={LIMITS.skillsToBuild} onChange={(v) => patch({ skillsToBuild: v })} initial={8} />
        <Multi label="Software I know" options={suggest.software} value={draft.softwareKnow} onChange={(v) => patch({ softwareKnow: v })} initial={8} />
        <Multi label="Software I want to learn" options={suggest.software} value={draft.softwareLearn} onChange={(v) => patch({ softwareLearn: v })} initial={8} />
      </>
    ),
    work: (
      <>
        <Single label="Fast-paced or steady" options={O.PACE} value={draft.pace} onChange={(v) => patch({ pace: v })} />
        <Multi label="Preferred team size" options={O.TEAM_SIZE} value={draft.teamSize} max={LIMITS.teamSize} onChange={(v) => patch({ teamSize: v })} />
        <Multi label="Preferred work environment" options={O.ENVIRONMENTS} value={draft.environments} max={LIMITS.environments} onChange={(v) => patch({ environments: v })} />
      </>
    ),
    education: (
      <>
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <label className="flex flex-col gap-[8px] text-[14.5px] leading-[20px] font-extrabold" style={{ color: "var(--foreground)" }}>
            GPA
            <input type="number" min={0} max={5} step={0.01} placeholder="For example, 3.7" value={draft.gpa} onChange={(e) => patch({ gpa: e.target.value })} className={INPUT} style={INPUT_STYLE} />
          </label>
          <Single label="GPA type" options={O.GPA_TYPES.map((t) => t.label)} value={gpaTypeLabel(draft.gpaType)} onChange={(label) => patch({ gpaType: O.GPA_TYPES.find((t) => t.label === label)?.id ?? "" })} />
        </div>
        <Multi label="Education pathways I would consider" options={O.PATHWAYS} value={draft.pathways} max={LIMITS.pathways} onChange={(v) => patch({ pathways: v })} />
      </>
    ),
    college: (
      <>
        <Multi label="Preferred states" options={O.STATES as string[]} value={draft.states} max={LIMITS.states} onChange={(v) => patch({ states: v })} initial={8} />
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <Single label="Distance" options={O.DISTANCES} value={draft.distance} onChange={(v) => patch({ distance: v })} />
          <label className="flex flex-col gap-[8px] text-[14.5px] leading-[20px] font-extrabold" style={{ color: "var(--foreground)" }}>
            Yearly tuition budget
            <select value={draft.budget} onChange={(e) => patch({ budget: e.target.value })} className={INPUT} style={INPUT_STYLE}>
              <option value="">Choose a budget</option>
              {O.BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <Multi label="Campus setting" options={O.CAMPUS} value={draft.campus} max={LIMITS.campus} onChange={(v) => patch({ campus: v })} />
          <Multi label="School size" options={O.SIZES} value={draft.sizes} max={LIMITS.sizes} onChange={(v) => patch({ sizes: v })} />
        </div>
      </>
    ),
    jobs: (
      <>
        <Multi label="Opportunity type" options={O.OPPORTUNITY_TYPES} value={draft.jobs.types} onChange={(v) => patchJobs({ types: v })} />
        <Multi label="Preferred roles" options={Array.from(new Set([...suggest.roles, ...draft.jobs.roles]))} value={draft.jobs.roles} max={LIMITS.jobRoles} onChange={(v) => patchJobs({ roles: v })} />
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
    <Modal title={section.title} optional={section.optional} onCancel={onClose} onSave={save} saveDisabled={!dirty} saveLabel={saveFailed ? "Try again" : "Save"} error={saveFailed ? "Couldn't save your changes. Your edits are still here." : undefined}>
      {body[id as Exclude<SectionId, "saved">]}
    </Modal>
  );
}

// -------------------------------------------------------------- primitives ----

/** Chip and summary-chip outline: readable against the sheet, not the
 *  near-invisible glass hairline (direct feedback, 25 Sept 2026). */
const CHIP_BORDER = "color-mix(in srgb, var(--foreground) 24%, transparent)";
const INPUT = "min-h-[44px] w-full rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14px] font-medium outline-none focus-visible:ring-2";
const INPUT_STYLE = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;

function Text({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-[8px] text-[14.5px] leading-[20px] font-extrabold" style={{ color: "var(--foreground)" }}>
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT} style={INPUT_STYLE} />
    </label>
  );
}

/** One row of chips that never wraps: a hidden copy measures every chip,
 *  the visible row shows the ones that fit beside a "+n" count, and a
 *  ResizeObserver re-fits on any width change. */
function FitChips({ chips }: { chips: string[] }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(chips.length);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const meas = measureRef.current;
    if (!wrap || !meas) return;
    const GAP = 6;
    const PLUS = 36;
    const compute = () => {
      const width = wrap.clientWidth;
      const widths = Array.from(meas.children).map((c) => (c as HTMLElement).getBoundingClientRect().width);
      let used = 0;
      let n = 0;
      for (let i = 0; i < widths.length; i++) {
        const tail = i < widths.length - 1 ? GAP + PLUS : 0;
        if (used + (n ? GAP : 0) + widths[i] + tail <= width) { used += (n ? GAP : 0) + widths[i]; n++; } else break;
      }
      setCount(Math.max(1, n));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [chips]);
  const chip = (c: string) => <span key={c} className="max-w-[200px] flex-none truncate rounded-full border px-[10px] py-[3px] text-[12.5px] leading-[16px] font-medium" style={{ borderColor: CHIP_BORDER, color: "var(--foreground)" }}>{c}</span>;
  return (
    <span ref={wrapRef} className="relative flex min-w-0 flex-1 items-center gap-[6px] overflow-hidden">
      <span ref={measureRef} aria-hidden className="pointer-events-none invisible absolute top-0 left-0 flex flex-nowrap items-center gap-[6px] whitespace-nowrap">{chips.map(chip)}</span>
      {chips.slice(0, count).map(chip)}
      {chips.length > count && <span className="flex-none rounded-full px-[6px] py-[3px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>+{chips.length - count}</span>}
    </span>
  );
}

function GroupLabel({ label, count, max }: { label: string; count?: number; max?: number }) {
  const full = max !== undefined && count !== undefined && count >= max;
  return (
    <div className="flex items-baseline justify-between gap-[var(--space-3)]">
      <p className="text-[14.5px] leading-[20px] font-extrabold" style={{ color: "var(--foreground)" }}>{label}</p>
      {/* The limit as dots that fill, not "1 of 3" text: readable at a
         glance, and visibly full. Short caps only; long ones keep a count. */}
      {max !== undefined && (max <= 5 ? (
        <span className="flex items-center gap-[4px]" role="img" aria-label={`${count} of ${max} chosen`}>
          {Array.from({ length: max }, (_, i) => (
            <motion.span key={i} animate={{ scale: i < (count ?? 0) ? 1 : 0.8 }} transition={{ type: "spring", stiffness: 500, damping: 24 }} className="block size-[7px] rounded-full" style={{ background: i < (count ?? 0) ? "var(--accent-subtle)" : "color-mix(in srgb, var(--foreground) 18%, transparent)" }} />
          ))}
        </span>
      ) : (
        <span className="text-[11.5px] font-semibold whitespace-nowrap" style={{ color: full ? "var(--accent-subtle)" : "var(--muted-foreground)" }}>{count} of {max}</span>
      ))}
    </div>
  );
}

/** Build's chip: the same lift-and-accent hover every tappable card in the
 *  app uses (dm-tap), never a brightness change. */
function Chip({ on, onClick, dim = false, children }: { on: boolean; onClick: () => void; /** the group is at its cap and this chip is not picked */ dim?: boolean; children: ReactNode }) {
  return (
    <motion.button type="button" aria-pressed={on} onClick={onClick} whileTap={{ scale: 0.95 }} className="dm-tap flex min-h-[40px] cursor-pointer items-center gap-[7px] rounded-[var(--radius-md)] border px-[12px] py-[7px] text-left text-[13px] leading-[16px] transition-opacity" style={{ borderColor: on ? "color-mix(in srgb, var(--accent-subtle) 75%, transparent)" : CHIP_BORDER, background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: on ? 600 : 500, opacity: dim ? 0.55 : 1 }}>
      {on && <motion.span aria-hidden initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 22 }} className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: "var(--accent-subtle)" }} />}
      {children}
    </motion.button>
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
    <div className="flex flex-col gap-[var(--space-3)]">
      <GroupLabel label={label} count={value.length} max={max} />
      <div className="flex flex-wrap gap-[8px]">
        {shown.map((o) => <Chip key={o} on={value.includes(o)} dim={full && !value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
      </div>
      {initial && options.length > initial && <SeeMore more={more} onToggle={() => setMore((m) => !m)} />}
    </div>
  );
}

function Single({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]" role="group" aria-label={label}>
      <GroupLabel label={label} />
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

function Modal({ title, subtitle, optional, onCancel, onSave, saveLabel = "Save", saveDisabled = false, error, children }: { title: string; /** one line: what this section shapes */ subtitle?: string; optional?: boolean; onCancel: () => void; onSave: () => void; saveLabel?: string; saveDisabled?: boolean; /** a failed save, shown above the footer */ error?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onCancel]);
  return createPortal(
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className="marketing-v2 themeable no-print fixed inset-0 z-[60] flex items-end justify-center backdrop-blur-[3px] sm:items-center sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)" }} onPointerUp={(e) => { if (e.target === e.currentTarget) onCancel(); }} role="dialog" aria-modal="true" aria-labelledby="preference-editor-title">
      <motion.div initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="flex max-h-[94dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border sm:max-h-[88dvh] sm:rounded-[var(--radius-lg)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
        <header className="flex flex-none items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <div className="flex min-w-0 flex-col gap-[2px]">
            <span className="flex min-w-0 items-center gap-[8px]">
              <h3 id="preference-editor-title" className="truncate text-[20px] leading-tight font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
              {optional && <span className="flex-none rounded-full border px-[8px] py-[2px] text-[10.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>Optional</span>}
            </span>
            {subtitle && <span className="flex items-center gap-[5px] text-[12.5px] font-semibold" style={{ color: "var(--accent-subtle)" }}><Sparkles className="h-3.5 w-3.5 flex-none" aria-hidden />{subtitle}</span>}
          </div>
          <button type="button" aria-label="Close editor" onClick={onCancel} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[18px] w-[18px]" aria-hidden /></button>
        </header>
        <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[var(--space-5)] overflow-y-auto px-[var(--space-5)] py-[var(--space-5)] [&>*+*]:border-t [&>*+*]:border-[color:var(--glass-border)] [&>*+*]:pt-[var(--space-5)]">{children}</div>
        {error && (
          <p role="alert" className="flex flex-none items-center gap-[8px] border-t px-[var(--space-5)] py-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--color-feedback-error, #E0453C) 10%, transparent)", color: "var(--foreground)" }}>
            <X className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--color-feedback-error, #E0453C)" }} /> {error}
          </p>
        )}
        <footer className="flex flex-none items-center justify-end gap-[var(--space-3)] border-t px-[var(--space-5)] py-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
          {/* Saved Careers edits in place, so it has one button, not two. */}
          {saveLabel !== "Done" && <button type="button" onClick={onCancel} className="dm-link cursor-pointer rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-[14px] font-bold" style={{ color: "var(--foreground)" }}>Cancel</button>}
          <button type="button" onClick={onSave} disabled={saveDisabled} className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-40" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Check className="h-4 w-4" strokeWidth={3} aria-hidden /> {saveLabel}</button>
        </footer>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
