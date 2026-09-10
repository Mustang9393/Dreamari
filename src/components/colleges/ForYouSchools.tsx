"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile, writeStudentProfile } from "@/lib/studentProfile";
import { ACADEMIC_RECORD } from "@/components/profile/report-data";
import { BIG, PANEL } from "@/components/career/CareerDetailExperience";
import { ACCENT, SchoolCard, SOFT } from "./shared";
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
  const toggleGpa = () => {
    setUseGpa((v) => {
      try { window.localStorage.setItem(USE_GPA_KEY, v ? "0" : "1"); } catch {}
      return !v;
    });
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
    <div className="flex flex-col gap-[var(--space-8)]">
      {/* Header: one sentence (the result), one caption (the inputs). Every
         input is edited inside the "Why these schools?" sheet -- the page
         itself holds one control, the career (direct feedback, 11 Sept 2026:
         "there has to be a better way"). */}
      <section className="flex flex-col gap-[8px]">
        <h2 className="text-[24px] leading-[30px] font-extrabold sm:text-[28px] sm:leading-[34px]" style={{ fontFamily: "var(--font-display)" }}>
          <span style={{ color: "var(--muted-foreground)" }}>Schools for </span>
          <Menu open={open === "career"} onToggle={() => setOpen(open === "career" ? null : "career")} label={pathway.careerTitle} disabled={top3.length < 2} big>
            {top3.map((id) => <MenuItem key={id} on={id === careerId} label={careerTitle(id)} onClick={() => { setChosen(id); setOpen(null); }} />)}
          </Menu>
        </h2>
        <p className="flex flex-wrap items-center gap-x-[6px] gap-y-[4px] text-[14px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span>{route.label} in {program}</span>
          <span aria-hidden>·</span>
          <span>{useGpa ? `${gpaLabel} GPA` : "GPA off"}</span>
          <span aria-hidden>·</span>
          <span>{profile.states[0] ?? HOME_STATE_NAME}</span>
          <span aria-hidden>·</span>
          <button type="button" onClick={() => setWhy(true)} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>Why these schools?</button>
          {saved.size > 0 && (
            <button type="button" onClick={onShowSaved} className="dm-link ml-auto flex cursor-pointer items-center gap-[2px] font-bold" style={{ color: SOFT }}>
              Saved · {saved.size} <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
            </button>
          )}
        </p>
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

      {why && (
        <WhySheet
          onClose={() => setWhy(false)}
          career={pathway.careerTitle}
          routes={routes}
          route={route}
          onRoute={(id) => setRoutePick((cur) => ({ ...cur, [careerId]: id }))}
          program={program}
          gpaLabel={gpaLabel}
          useGpa={useGpa}
          onToggleGpa={toggleGpa}
          gpaType={stored.gpaType || "unsure"}
          onGpaType={(v) => writeStudentProfile({ gpaType: v })}
          place={profile.states[0] ?? HOME_STATE_NAME}
          distance={profile.travelDistance || null}
        />
      )}
    </div>
  );
}

// ---- text dropdowns for the breadcrumb ------------------------------------

function Menu({ label, sub, open, onToggle, disabled, big, children }: { label: string; sub?: string; open: boolean; onToggle: () => void; disabled?: boolean; big?: boolean; children: React.ReactNode }) {
  const subEl = sub ? <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}> · {sub}</span> : null;
  if (disabled) return <span style={{ color: "var(--foreground)" }}>{label}{subEl}</span>;
  return (
    <span className="relative inline-block" data-menu>
      <button type="button" onClick={onToggle} aria-haspopup="menu" aria-expanded={open} className="dm-link flex cursor-pointer items-center gap-[6px] text-left" style={{ color: "var(--foreground)" }}>
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

// ---- "Why these schools?" -------------------------------------------------
// The Replit's "A clear starting point" checklist, with the inputs editable
// in place: the route, whether the GPA sorts the list, which kind of GPA it
// is. The page stays a result; this sheet is where it gets tuned.

function WhySheet({ onClose, career, routes, route, onRoute, program, gpaLabel, useGpa, onToggleGpa, gpaType, onGpaType, place, distance }: {
  onClose: () => void; career: string; routes: Route[]; route: Route; onRoute: (id: string) => void; program: string;
  gpaLabel: string; useGpa: boolean; onToggleGpa: () => void; gpaType: string; onGpaType: (v: string) => void; place: string; distance: string | null;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const rowCls = "flex flex-col gap-[8px] border-b pb-[12px] last:border-b-0 last:pb-0";
  const label = (t: string) => <span className="flex items-center gap-[8px] text-[14px] font-bold"><Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} />{t}</span>;
  const pill = (on: boolean) => ({ background: on ? ACCENT : "transparent", borderColor: on ? ACCENT : "var(--glass-border)", color: on ? "#fff" : "var(--foreground)" });
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-5 pb-[calc(20px+env(safe-area-inset-bottom))]" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)", backdropFilter: "blur(10px)" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section role="dialog" aria-modal="true" aria-labelledby="why-schools" className="relative flex max-h-[calc(100dvh-40px)] w-full max-w-[440px] flex-col gap-[var(--space-5)] overflow-y-auto rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ ...PANEL, background: "var(--card)", color: "var(--foreground)" }}>
        <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet absolute top-[12px] right-[12px] flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
        <div className="flex flex-col gap-[6px] pr-[40px]">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: SOFT }}>Why these schools?</p>
          <h2 id="why-schools" className="text-[24px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>A clear starting point</h2>
        </div>
        <ul className="flex list-none flex-col gap-[12px] p-0">
          <li className={rowCls} style={{ borderColor: "var(--glass-border)" }}>{label(`Your career: ${career}`)}</li>
          <li className={rowCls} style={{ borderColor: "var(--glass-border)" }}>
            {label(`Your education path: ${route.label}`)}
            {routes.length > 1 && (
              <div role="radiogroup" aria-label="Education path" className="flex flex-wrap gap-[6px] pl-[24px]">
                {routes.map((r) => (
                  <button key={r.id} type="button" role="radio" aria-checked={r.id === route.id} onClick={() => onRoute(r.id)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[4px] rounded-full border px-[11px] text-[12.5px] font-bold" style={pill(r.id === route.id)}>
                    {r.label}<span className="font-semibold" style={{ opacity: 0.75 }}>· {r.time}</span>
                  </button>
                ))}
              </div>
            )}
          </li>
          <li className={rowCls} style={{ borderColor: "var(--glass-border)" }}>{label(`Your recommended program: ${program}`)}</li>
          <li className={rowCls} style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex items-center justify-between gap-[var(--space-3)]">
              {label(useGpa ? `Your academic profile: ${gpaLabel} GPA` : "Your academic profile: not used")}
              <button type="button" role="switch" aria-checked={useGpa} aria-label="Sort by my GPA" onClick={onToggleGpa} className="relative inline-flex h-[24px] w-[42px] flex-none cursor-pointer items-center rounded-full transition-colors" style={{ background: useGpa ? ACCENT : "var(--glass-surface-2)" }}>
                <span className="absolute size-[20px] rounded-full bg-white transition-transform" style={{ transform: `translateX(${useGpa ? 20 : 2}px)` }} />
              </button>
            </div>
            {useGpa && (
              <div className="flex flex-col gap-[6px] pl-[24px]">
                <div role="radiogroup" aria-label="GPA type" className="flex flex-wrap gap-[6px]">
                  {([["weighted", "Weighted"], ["unweighted", "Unweighted"], ["unsure", "Not sure"]] as const).map(([v, l]) => (
                    <button key={v} type="button" role="radio" aria-checked={gpaType === v} onClick={() => onGpaType(v)} className="dm-quiet min-h-[32px] cursor-pointer rounded-full border px-[11px] text-[12.5px] font-bold" style={pill(gpaType === v)}>{l}</button>
                  ))}
                </div>
                <p className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Weighted can go above 4.0, so we adjust it first. Not sure counts as unweighted.</p>
              </div>
            )}
          </li>
          <li className={rowCls} style={{ borderColor: "var(--glass-border)" }}>{label(`Your location preference: ${place}${distance ? ` · ${distance}` : ""}`)}</li>
        </ul>
        <Link href="/profile?tab=settings" className="dm-solid flex min-h-[48px] w-full items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>
          Adjust preferences <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </div>,
    document.body,
  );
}
