"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { US_STATES, serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile, writeStudentProfile } from "@/lib/studentProfile";
import { GPA_OPTIONS } from "@/components/build/types";
import { ACADEMIC_RECORD } from "@/components/profile/report-data";
import { BIG, PANEL } from "@/components/career/CareerDetailExperience";
import { ACCENT, SchoolCard, SOFT } from "./shared";
import { HoverBeam } from "@/components/app/HoverBeam";
import { FIT_WORDS, careerTitle, defaultRoute, parseGpa, pathwayFor, routesFor, schoolsForRoute, shortProgram, type Route, type SchoolMatch } from "./pathway";

// Explore Schools, "For you". The Replit's architecture, delivered leaner
// (direct feedback, 11 Sept 2026): the Career -> Route -> Program breadcrumb
// IS the control strip; the inputs that shape the list (GPA, state,
// distance) are one visible "Based on" line; "Why these schools?" opens a
// designed sheet instead of a paragraph; cards carry a three-number stat
// row. Saved schools live behind their own link, as on the Replit.

const DEMO_TOP3 = ["investment-banking", "registered-nurse", "software-engineer"];
const HOME_STATE_NAME = "New Jersey";
const USE_GPA_KEY = "dreamari:schools-use-gpa";
const HIDDEN_KEY = "dm-colleges-hidden";

export function ForYouSchools({
  saved,
  onSave,
  compare,
  onCompare,
  onShowSaved,
}: {
  saved: Set<string>;
  onSave: (slug: string) => void;
  compare: string[];
  onCompare: (slug: string) => void;
  /** opens Browse all filtered to the saved schools */
  onShowSaved: () => void;
}) {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const stored = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  // Build writes the GPA on hand-off; until then use the GPA the Profile
  // card already shows, so the sorting is there from the first visit.
  // The GPA chip is a toggle (direct feedback, 11 Sept 2026): off means the
  // list isn't sorted into Target / Safety / Reach at all. Remembered.
  const [useGpa, setUseGpa] = useState(true);
  useEffect(() => {
    // read after paint (the set-state-in-effect rule); storage is external state
    const t = window.setTimeout(() => {
      try { if (window.localStorage.getItem(USE_GPA_KEY) === "0") setUseGpa(false); } catch {}
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const setGpaUse = (on: boolean) => {
    try { window.localStorage.setItem(USE_GPA_KEY, on ? "1" : "0"); } catch {}
    setUseGpa(on);
  };
  const withGpa = useMemo(() => (stored.gpa ? stored : { ...stored, gpa: ACADEMIC_RECORD.gpa }), [stored]);
  const profile = useMemo(() => (useGpa ? withGpa : { ...withGpa, gpa: "" }), [withGpa, useGpa]);
  const gpaLabel = withGpa.gpa;
  const top3 = picks.ids.length ? picks.ids : DEMO_TOP3;
  const [chosen, setChosen] = useState<string | null>(null);
  const careerId = chosen && top3.includes(chosen) ? chosen : picks.focus && top3.includes(picks.focus) ? picks.focus : top3[0];
  const pathway = useMemo(() => pathwayFor(careerId), [careerId]);
  const routes = useMemo(() => routesFor(careerId), [careerId]);
  const [routePick, setRoutePick] = useState<Record<string, string>>({});
  const route = routes.find((r) => r.id === routePick[careerId]) ?? defaultRoute(routes, profile.path);
  const schools = useMemo(() => (pathway && route ? schoolsForRoute(pathway, route, profile) : null), [pathway, route, profile]);
  const [open, setOpen] = useState<"career" | "route" | "gpa" | null>(null);
  // "Not for me" hides a school from For you; remembered.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { setHidden(new Set(JSON.parse(window.localStorage.getItem(HIDDEN_KEY) ?? "[]") as string[])); } catch {}
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const dismiss = (slug: string) => {
    setHidden((cur) => {
      const next = new Set(cur).add(slug);
      try { window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };
  // close any open menu on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (!(e.target as HTMLElement).closest?.("[data-menu]")) setOpen(null); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", close);
    window.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", close); window.removeEventListener("keydown", key); };
  }, [open]);
  const [why, setWhy] = useState(false);
  const [edit, setEdit] = useState(false);
  // one-time nudge on the Edit chip: label slides in, beam runs one loop
  // Sequence: a bright glow swells around the chip and, as it fades, the
  // beam takes over and runs one loop while "Edit" slides in; then
  // everything waits for hover. Glow and beam overlap so it reads as one
  // motion, not two effects.
  const [glow, setGlow] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    const t0 = window.setTimeout(() => setGlow(true), 700);
    const t1 = window.setTimeout(() => { setRevealed(true); setNudge(true); }, 700 + 700);
    const t2 = window.setTimeout(() => setGlow(false), 700 + 1600);
    const t3 = window.setTimeout(() => setNudge(false), 700 + 700 + 3600);
    return () => { window.clearTimeout(t0); window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, []);
  const place = profile.states[0] ?? HOME_STATE_NAME;
  const gpa = parseGpa(profile.gpa);

  if (!pathway || !route || !schools) {
    return (
      <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
        <p className={BIG}>No pathway yet for {careerTitle(careerId)}.</p>
      </section>
    );
  }

  const program = route.institution === "4-year" ? pathway.program : route.program;
  const sections: { key: string; title: string; list: SchoolMatch[] }[] = [];
  if (schools.fit) {
    const g = schools.fit;
    if (gpa === null) {
      // GPA off: the school's own selectivity, in plain words, so the page
      // keeps its shape without putting the student's grades into it.
      const all = [...g.target, ...g.safety, ...g.reach, ...g.unplaced];
      const rate = (m: SchoolMatch) => (m.college.admission === "open" ? 100 : (m.college.admitRate ?? 60));
      sections.push(
        { key: "hard", title: "Hardest to get into", list: all.filter((m) => rate(m) < 30).slice(0, 4) },
        { key: "mid", title: "Selective", list: all.filter((m) => rate(m) >= 30 && rate(m) < 70).slice(0, 4) },
        { key: "easy", title: "Most students get in", list: all.filter((m) => rate(m) >= 70).slice(0, 4) },
      );
    } else sections.push({ key: "target", title: "Target", list: g.target.slice(0, 4) }, { key: "safety", title: "Safety", list: g.safety.slice(0, 4) }, { key: "reach", title: "Reach", list: g.reach.slice(0, 2) });
  } else if (route.institution === "2-year") sections.push({ key: "start", title: "Lower-cost ways to start", list: schools.list.slice(0, 8) });
  else sections.push({ key: "trade", title: "Trade and technical programs", list: schools.list.slice(0, 8) });
  const shown = sections.map((s) => ({ ...s, list: s.list.filter((m) => !hidden.has(m.college.slug)) })).filter((s) => s.list.length > 0);
  const RAIL_COPY: Record<string, { note?: string }> = {
    start: { note: "Start here, then continue toward a 4-year degree." },
  };

  const whyFor = (m: SchoolMatch) => {
    if (m.why) return m.why;
    const c = m.college;
    const bits = [`Offers ${shortProgram(m.program)}`];
    if (c.state === "NJ" || profile.states.some((st) => st.toLowerCase() === c.stateName.toLowerCase())) bits.push("close to home");
    if (c.netPrice !== null && c.netPrice < 15000) bits.push("among the lower-cost options");
    if (c.finish !== null && c.finish >= 80) bits.push(`${c.finish}% finish`);
    return bits.join(" · ") + ".";
  };
  const card = (m: SchoolMatch, showFit: boolean) => (
    <li key={m.college.slug} className="w-[min(84vw,320px)] flex-none">
      <SchoolCard
        c={m.college}
        saved={saved.has(m.college.slug)}
        onSave={() => onSave(m.college.slug)}
        compared={compare.includes(m.college.slug)}
        onCompare={() => onCompare(m.college.slug)}
        href={`/colleges/${m.college.slug}?route=${pathway.careerId}`}
        program={shortProgram(m.program)}
        fit={showFit && FIT_WORDS[m.fit] ? { label: FIT_WORDS[m.fit], tone: m.fit === "Reach" ? "reach" : m.fit === "Target" ? "target" : m.fit === "Safety" ? "safety" : "open" } : undefined}
        why={whyFor(m)}
        onDismiss={() => dismiss(m.college.slug)}
      />
    </li>
  );
  const rail = "dreamari-card-rail -mx-5 -my-[28px] flex list-none gap-[var(--space-4)] overflow-x-auto px-5 py-[28px] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]";

  return (
    <div className="flex flex-col gap-[var(--space-10)]">
      {/* Header: one row. The result on the left ("Schools for <career v>",
         the page's one control) and the inputs on the right as a single quiet
         chip that opens the "Why these schools?" sheet, where they are edited.
         Was a heading plus a caption line under it; with the page title and
         section tabs above, that stacked five text tiers before the first
         card (direct feedback, 11 Sept 2026: "too many text elements so close
         together"). On phones the chip wraps under the heading. */}
      <section className="flex flex-wrap items-center justify-between gap-x-[var(--space-6)] gap-y-[var(--space-3)] sm:flex-nowrap">
        <h2 className="min-w-0 text-[24px] leading-[30px] font-extrabold sm:text-[28px] sm:leading-[34px]" style={{ fontFamily: "var(--font-display)" }}>
          <span style={{ color: "var(--muted-foreground)" }}>Schools for </span>
          <Menu open={open === "career"} onToggle={() => setOpen(open === "career" ? null : "career")} label={pathway.careerTitle} disabled={top3.length < 2} big>
            {top3.map((id) => <MenuItem key={id} on={id === careerId} label={careerTitle(id)} onClick={() => { setChosen(id); setOpen(null); }} />)}
          </Menu>
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] sm:flex-none sm:flex-nowrap">
          {/* The inputs, as one chip that edits them. "Edit" with a pencil
             sits at its trailing edge (a pencil alone is not understood),
             always visible and in full white: phones have no hover, and a
             label that vanished left the chip reading as static text.
             Nudge, once per visit: the beam runs one loop and "Edit" slides
             in shortly after load, then both wait for hover (direct
             feedback, 11 Sept 2026). */}
          <HoverBeam strength={0.85} active={nudge ? true : undefined} className="max-w-full">
            <button
              type="button"
              onClick={() => setEdit(true)}
              aria-label={`Edit preferences: ${route.label} in ${program}, ${useGpa ? `${gpaLabel} GPA` : "GPA off"}, ${place}`}
              className={`dm-quiet group flex min-h-[38px] max-w-full cursor-pointer items-center gap-[10px] rounded-[19px] border px-[14px] py-[8px] text-left text-[13px] leading-[18px] font-semibold sm:whitespace-nowrap ${glow ? "dm-nudge-glow" : ""}`}
              style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
            >
              <span>{route.label} in {program} · {useGpa ? `${gpaLabel} GPA` : "GPA off"} · {place}</span>
              {/* Slides out from behind the divider. Its width is reserved
                 from the first paint, so the chip never widens and the
                 heading beside it never re-wraps mid-animation. */}
              <span
                aria-hidden={!revealed}
                className="flex flex-none items-center gap-[10px] overflow-hidden transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ opacity: revealed ? 1 : 0 }}
              >
                <span aria-hidden className="h-[14px] w-px flex-none" style={{ background: "var(--glass-border)" }} />
                <span className="flex flex-none items-center gap-[5px] font-bold transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ color: "var(--foreground)", transform: revealed ? "translateX(0)" : "translateX(-10px)" }}>
                  <Pencil className="h-[13px] w-[13px]" aria-hidden />Edit
                </span>
              </span>
            </button>
          </HoverBeam>
          {saved.size > 0 && (
            <button type="button" onClick={onShowSaved} className="dm-link flex cursor-pointer items-center gap-[2px] text-[13px] leading-[18px] font-bold whitespace-nowrap" style={{ color: SOFT }}>
              Saved · {saved.size} <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
            </button>
          )}
        </div>
      </section>

      {shown.length === 0 && (
        <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
          <p className={BIG}>No schools in our list offer {program} yet.</p>
        </section>
      )}

      {shown.map((s) => (
        <section key={s.key} className="flex flex-col gap-[var(--space-3)]">
          {/* Netflix / Hotstar row header: title left, the count small on the right */}
          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
            <div className="flex min-w-0 flex-col gap-[2px]">
              <h2 className="text-[20px] leading-[24px] font-extrabold sm:text-[22px] sm:leading-[26px]" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
              {RAIL_COPY[s.key]?.note && <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{RAIL_COPY[s.key]!.note}</p>}
            </div>
            <span className="flex-none text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>{s.list.length} {s.list.length === 1 ? "school" : "schools"}</span>
          </div>
          <ul className={rail} aria-label={s.title}>{s.list.map((m) => card(m, s.key === "start" || s.key === "trade"))}</ul>
        </section>
      ))}

      {/* "Why these schools?" after the rails: it is about the whole list, so
         it sits neither on one row header (read as Target-only) nor beside
         the Edit chip (direct feedback, 11 Sept 2026). */}
      {shown.length > 0 && (
        <button type="button" onClick={() => setWhy(true)} className="dm-link flex cursor-pointer items-center gap-[2px] self-start text-[14px] leading-[20px] font-bold" style={{ color: SOFT }}>
          Why these schools? <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      )}

      {why && (
        <WhySheet
          onClose={() => setWhy(false)}
          onEdit={() => { setWhy(false); setEdit(true); }}
          career={pathway.careerTitle}
          route={route}
          program={program}
          gpaLabel={useGpa ? gpaLabel : null}
          place={place}
        />
      )}
      {edit && (
        <EditSheet
          onClose={() => setEdit(false)}
          career={pathway.careerTitle}
          routes={routes}
          route={route}
          onRoute={(id) => setRoutePick((cur) => ({ ...cur, [careerId]: id }))}
          place={place}
          onPlace={(v) => writeStudentProfile({ states: [v, ...stored.states.filter((x) => x !== v)] })}
          gpa={useGpa ? gpaLabel : null}
          onGpa={(v) => { if (v === null) setGpaUse(false); else { setGpaUse(true); writeStudentProfile({ gpa: v }); } }}
          gpaType={stored.gpaType || "unsure"}
          onGpaType={(v) => writeStudentProfile({ gpaType: v })}
        />
      )}
    </div>
  );
}

// ---- text dropdowns for the breadcrumb ------------------------------------

function Menu({ label, sub, open, onToggle, disabled, big, children }: { label: string; sub?: string; open: boolean; onToggle: () => void; disabled?: boolean; big?: boolean; children: React.ReactNode }) {
  const subEl = sub ? <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}> · {sub}</span> : null;
  if (disabled) return <span className="whitespace-nowrap" style={{ color: "var(--foreground)" }}>{label}{subEl}</span>;
  return (
    <span className="relative inline-block" data-menu>
      <button type="button" onClick={onToggle} aria-haspopup="menu" aria-expanded={open} className="dm-link flex cursor-pointer items-center gap-[6px] text-left whitespace-nowrap" style={{ color: "var(--foreground)" }}>
        <span>{label}{subEl}</span>
        <span className="flex flex-none items-center justify-center rounded-full border" style={{ width: big ? 30 : 22, height: big ? 30 : 22, borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""} ${big ? "h-4 w-4" : "h-[13px] w-[13px]"}`} aria-hidden style={{ color: SOFT }} />
        </span>
      </button>
      {open && (
        <ul role="menu" className="absolute top-[calc(100%+8px)] left-0 z-40 flex min-w-[220px] list-none flex-col gap-[2px] rounded-[var(--radius-lg)] border p-[6px] shadow-xl" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
          {children}
        </ul>
      )}
    </span>
  );
}
function MenuItem({ label, sub, on, onClick }: { label: string; sub?: string; on: boolean; onClick: () => void }) {
  return (
    <li role="none">
      <button type="button" role="menuitemradio" aria-checked={on} onClick={onClick} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] px-[12px] py-[9px] text-left text-[14px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", background: on ? `color-mix(in srgb, ${ACCENT} 18%, transparent)` : "transparent" }}>
        <span>{label}{sub && <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}> · {sub}</span>}</span>
        {on && <Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} />}
      </button>
    </li>
  );
}

// ---- sheets -------------------------------------------------------------
// Two separate sheets (direct feedback, 11 Sept 2026: the explanation and
// the editing should not be one thing). "Why these schools?" only explains
// how the list was built; the chip opens the editor.

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-5 pb-[calc(20px+env(safe-area-inset-bottom))]" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)", backdropFilter: "blur(10px)" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section role="dialog" aria-modal="true" aria-labelledby="schools-sheet" className="relative flex max-h-[calc(100dvh-40px)] w-full max-w-[400px] flex-col gap-[var(--space-6)] overflow-y-auto rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ ...PANEL, background: "var(--card)", color: "var(--foreground)" }}>
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <h2 id="schools-sheet" className="text-[22px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet -mr-[8px] flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}

const FIELD = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)" } as const;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <span className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {children}
      {hint && <span className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{hint}</span>}
    </div>
  );
}

/** One full-width segmented control; every option is visible, one tap to change. */
function Segmented({ value, options, onChange, ariaLabel }: { value: string; options: { id: string; label: string }[]; onChange: (id: string) => void; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid gap-[4px] rounded-[var(--radius-md)] border p-[4px]" style={{ ...FIELD, gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.id)} className={`min-h-[38px] cursor-pointer rounded-[calc(var(--radius-md)-4px)] px-[8px] text-[13px] leading-[16px] font-bold transition-colors ${on ? "" : "dm-quiet"}`} style={{ background: on ? ACCENT : "transparent", color: on ? "#fff" : "var(--foreground)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Select({ value, options, onChange, ariaLabel }: { value: string; options: string[]; onChange: (v: string) => void; ariaLabel: string }) {
  return (
    <span className="relative flex items-center">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel} className="dm-quiet min-h-[46px] w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border px-[14px] pr-[40px] text-[15px] font-bold outline-none" style={FIELD}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[14px] h-4 w-4" aria-hidden style={{ color: SOFT }} />
    </span>
  );
}

function WhySheet({ onClose, onEdit, career, route, program, gpaLabel, place }: {
  onClose: () => void;
  onEdit: () => void;
  career: string;
  route: Route;
  program: string;
  /** null when GPA sorting is off */
  gpaLabel: string | null;
  place: string;
}) {
  const line = (t: string) => (
    <li className="flex items-start gap-[10px] text-[15px] leading-[22px] font-semibold"><Check className="mt-[3px] h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} />{t}</li>
  );
  return (
    <Sheet title="Why these schools?" onClose={onClose}>
      <ul className="flex list-none flex-col gap-[12px] p-0">
        {line(`They offer ${program}, the usual ${route.label.toLowerCase()} route into ${career}.`)}
        {line(gpaLabel ? `Target, Safety and Reach compare your ${gpaLabel} GPA with each school's average.` : "GPA is off, so the rows show how selective each school is instead.")}
        {line(`Schools in ${place} come first.`)}
      </ul>
      <button type="button" onClick={onEdit} className="dm-quiet flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border text-[15px] font-bold" style={FIELD}>
        <Pencil className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> Edit preferences
      </button>
    </Sheet>
  );
}

const GPA_OFF = "Don't use my GPA";

function EditSheet({ onClose, career, routes, route, onRoute, place, onPlace, gpa, onGpa, gpaType, onGpaType }: {
  onClose: () => void;
  career: string;
  routes: Route[];
  route: Route;
  onRoute: (id: string) => void;
  place: string;
  onPlace: (state: string) => void;
  /** the GPA in use, or null when sorting by GPA is off */
  gpa: string | null;
  /** null turns GPA sorting off */
  onGpa: (v: string | null) => void;
  gpaType: string;
  onGpaType: (v: string) => void;
}) {
  // The GPA on file may be a plain number from the demo record rather than
  // one of Build's ranges; keep it selectable so nothing changes underneath.
  // Build's "My school does not use GPA" means the same as off here, so it is
  // not offered twice.
  const ranges = GPA_OPTIONS.filter((g) => /\d/.test(g));
  const gpaOptions = [...(gpa && !ranges.includes(gpa) ? [gpa] : []), ...ranges, GPA_OFF];
  return (
    <Sheet title="Edit your list" onClose={onClose}>
      <div className="flex flex-col gap-[var(--space-5)]">
        <Field label="Path" hint={routes.length > 1 ? undefined : `The only route into ${career} in our data.`}>
          {routes.length > 1 ? (
            <Segmented ariaLabel="Education path" value={route.id} options={routes.map((r) => ({ id: r.id, label: r.label }))} onChange={onRoute} />
          ) : (
            <p className="flex min-h-[46px] items-center rounded-[var(--radius-md)] border px-[14px] text-[15px] font-bold" style={{ ...FIELD, color: "var(--muted-foreground)" }}>{route.label}</p>
          )}
        </Field>
        <Field label="Where">
          <Select ariaLabel="State" value={place} options={[...US_STATES]} onChange={onPlace} />
        </Field>
        <Field label="GPA" hint={gpa ? "Sorts schools into Target, Safety and Reach." : "Off: rows show how selective each school is."}>
          <Select ariaLabel="Your GPA" value={gpa ?? GPA_OFF} options={gpaOptions} onChange={(v) => onGpa(v === GPA_OFF ? null : v)} />
          {gpa && (
            <Segmented ariaLabel="GPA type" value={gpaType} options={[{ id: "weighted", label: "Weighted" }, { id: "unweighted", label: "Unweighted" }, { id: "unsure", label: "Not sure" }]} onChange={onGpaType} />
          )}
        </Field>
      </div>
      <button type="button" onClick={onClose} className="dm-solid flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>
        Done
      </button>
    </Sheet>
  );
}
