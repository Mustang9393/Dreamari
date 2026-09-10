"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, Info, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { ACADEMIC_RECORD } from "@/components/profile/report-data";
import { BIG, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { ACCENT, CollegeCard, SOFT } from "./shared";
import { FIT_WORDS, careerTitle, defaultRoute, parseGpa, pathwayFor, routesFor, schoolsForRoute, shortProgram, type Route, type SchoolMatch } from "./pathway";

// Explore Schools, "For you". The Replit's architecture, delivered leaner
// (direct feedback, 11 Sept 2026): the Career -> Route -> Program breadcrumb
// IS the control strip; the inputs that shape the list (GPA, state,
// distance) are one visible "Based on" line; "Why these schools?" opens a
// designed sheet instead of a paragraph; cards carry a three-number stat
// row. Saved schools live behind their own link, as on the Replit.

const DEMO_TOP3 = ["investment-banking", "registered-nurse", "software-engineer"];
const HOME_STATE_NAME = "New Jersey";

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
  const profile = useMemo(() => (stored.gpa ? stored : { ...stored, gpa: ACADEMIC_RECORD.gpa }), [stored]);
  const top3 = picks.ids.length ? picks.ids : DEMO_TOP3;
  const [chosen, setChosen] = useState<string | null>(null);
  const careerId = chosen && top3.includes(chosen) ? chosen : picks.focus && top3.includes(picks.focus) ? picks.focus : top3[0];
  const pathway = useMemo(() => pathwayFor(careerId), [careerId]);
  const routes = useMemo(() => routesFor(careerId), [careerId]);
  const [routePick, setRoutePick] = useState<Record<string, string>>({});
  const route = routes.find((r) => r.id === routePick[careerId]) ?? defaultRoute(routes, profile.path);
  const schools = useMemo(() => (pathway && route ? schoolsForRoute(pathway, route, profile) : null), [pathway, route, profile]);
  const [open, setOpen] = useState<"career" | "route" | null>(null);
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
    if (gpa === null) sections.push({ key: "path", title: `Schools with ${pathway.program}`, list: [...g.target, ...g.safety, ...g.reach, ...g.unplaced].slice(0, 8) });
    else sections.push({ key: "target", title: "Target", list: g.target.slice(0, 4) }, { key: "safety", title: "Safety", list: g.safety.slice(0, 4) }, { key: "reach", title: "Reach", list: g.reach.slice(0, 2) });
  } else if (route.institution === "2-year") sections.push({ key: "start", title: "Community colleges near you", list: schools.list.slice(0, 8) });
  else sections.push({ key: "trade", title: "Trade and technical programs", list: schools.list.slice(0, 8) });
  const shown = sections.filter((s) => s.list.length > 0);
  const basedOn = [gpa !== null ? `${profile.gpa} GPA` : null, profile.states[0] ?? HOME_STATE_NAME, profile.travelDistance || null].filter(Boolean).join(" · ");

  const card = (m: SchoolMatch, showFit: boolean) => (
    <li key={m.college.slug} className="w-[min(84vw,320px)] flex-none">
      <CollegeCard
        c={m.college}
        saved={saved.has(m.college.slug)}
        onSave={() => onSave(m.college.slug)}
        compared={compare.includes(m.college.slug)}
        onCompare={() => onCompare(m.college.slug)}
        href={`/colleges/${m.college.slug}?route=${pathway.careerId}`}
        badges={[{ label: shortProgram(m.program), tone: "program" }, ...(showFit && FIT_WORDS[m.fit] ? [{ label: FIT_WORDS[m.fit], tone: m.fit === "Reach" ? ("reach" as const) : m.fit === "Target" ? ("target" as const) : m.fit === "Safety" ? ("safety" as const) : ("open" as const) }] : [])]}
        stats
        hideTags
      />
    </li>
  );
  const rail = "dreamari-card-rail -mx-5 flex list-none gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]";

  // One chip of the pathway strip: a control when there is a choice.
  const chip = (label: string, opts?: { onClick?: () => void; open?: boolean; accent?: boolean }) => {
    const base = "flex min-h-[38px] items-center gap-[6px] rounded-full border px-[14px] text-[14px] font-bold whitespace-nowrap";
    const style = opts?.accent ? { background: ACCENT, borderColor: ACCENT, color: "#fff" } : { background: "var(--glass-surface-1)", borderColor: opts?.open ? ACCENT : "var(--glass-border)", color: "var(--foreground)" };
    return opts?.onClick ? (
      <button type="button" onClick={opts.onClick} aria-expanded={opts.open} className={`dm-quiet cursor-pointer ${base}`} style={style}>
        {label} <ChevronDown className={`h-4 w-4 transition-transform ${opts.open ? "rotate-180" : ""}`} aria-hidden style={{ opacity: 0.75 }} />
      </button>
    ) : (
      <span className={base} style={style}>{label}</span>
    );
  };
  const arrow = <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />;
  const option = (label: string, on: boolean, onClick: () => void, sub?: string) => (
    <button key={label} type="button" aria-pressed={on} onClick={onClick} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[13.5px] font-bold" style={{ background: on ? ACCENT : "transparent", borderColor: on ? ACCENT : "var(--glass-border)", color: on ? "#fff" : "var(--foreground)" }}>
      {label}{sub && <span className="font-semibold" style={{ color: on ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)" }}>· {sub}</span>}
    </button>
  );

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* The pathway strip: Career -> Route -> Program. Tap a chip with a
         chevron to change it; the options appear right under the strip. */}
      <section className="flex flex-col gap-[var(--space-3)]">
        <div className="-mx-5 flex items-center gap-[6px] overflow-x-auto px-5 pb-[2px] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Your pathway">
          {chip(pathway.careerTitle, top3.length > 1 ? { onClick: () => setOpen(open === "career" ? null : "career"), open: open === "career", accent: true } : { accent: true })}
          {arrow}
          {chip(`${route.label} · ${route.time}`, routes.length > 1 ? { onClick: () => setOpen(open === "route" ? null : "route"), open: open === "route" } : undefined)}
          {arrow}
          {chip(program)}
        </div>
        {open === "career" && (
          <div className="flex flex-wrap gap-[6px]" aria-label="Choose a career">
            {top3.map((id) => option(careerTitle(id), id === careerId, () => { setChosen(id); setOpen(null); }))}
          </div>
        )}
        {open === "route" && (
          <div className="flex flex-wrap gap-[6px]" aria-label="Choose a route">
            {routes.map((r: Route) => option(r.label, r.id === route.id, () => { setRoutePick((cur) => ({ ...cur, [careerId]: r.id })); setOpen(null); }, r.time))}
          </div>
        )}
        {/* what shapes the list, the door to the full explanation, and the saved list */}
        <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <span>Based on {basedOn}</span>
          <button type="button" onClick={() => setWhy(true)} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}>
            <Info className="h-[14px] w-[14px]" aria-hidden /> Why these schools?
          </button>
          {saved.size > 0 && (
            <button type="button" onClick={onShowSaved} className="dm-link ml-auto flex cursor-pointer items-center gap-[2px] font-bold" style={{ color: SOFT }}>
              Saved schools · {saved.size} <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
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
          <h2 className="text-[20px] leading-[24px] font-extrabold sm:text-[24px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>
            {s.title}<span className="ml-[8px] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{s.list.length}</span>
          </h2>
          <ul className={rail} aria-label={s.title}>{s.list.map((m) => card(m, s.key === "path" || s.key === "start" || s.key === "trade"))}</ul>
        </section>
      ))}

      {why && (
        <WhySheet
          onClose={() => setWhy(false)}
          career={pathway.careerTitle}
          route={`${route.label} · ${route.time}`}
          program={program}
          gpa={gpa !== null ? profile.gpa : null}
          place={profile.states[0] ?? HOME_STATE_NAME}
          distance={profile.travelDistance || null}
          twoYear={pathway.twoYearStart}
          trade={pathway.trade}
        />
      )}
    </div>
  );
}

// ---- "Why these schools?" -------------------------------------------------
// The Replit's explainer, designed instead of written: your path as three
// chips, how we sort as a three-colour legend, what we use as facts with a
// link to change them. A sheet, so the page itself stays almost wordless.

function WhySheet({ onClose, career, route, program, gpa, place, distance, twoYear, trade }: { onClose: () => void; career: string; route: string; program: string; gpa: string | null; place: string; distance: string | null; twoYear: boolean; trade: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const legend: { label: string; color: string; text: string }[] = [
    { label: "Target", color: "rgba(40,140,255,0.95)", text: "Your GPA matches who gets in." },
    { label: "Safety", color: "rgba(51,199,140,0.95)", text: "Very likely to get in." },
    { label: "Reach", color: "rgba(255,160,30,0.95)", text: "Harder to get into." },
  ];
  const row = "flex items-baseline justify-between gap-[var(--space-3)] border-b pb-[8px] text-[14px]";
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-5" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)", backdropFilter: "blur(10px)" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section role="dialog" aria-modal="true" aria-labelledby="why-schools" className="relative flex w-full max-w-[480px] flex-col gap-[var(--space-5)] rounded-t-[var(--radius-xl)] border p-[var(--space-5)] pb-[calc(var(--space-6)+env(safe-area-inset-bottom))] sm:rounded-[var(--radius-lg)] sm:p-[var(--space-6)]" style={{ ...PANEL, background: "var(--card)", color: "var(--foreground)" }}>
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <h2 id="why-schools" className="text-[22px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Why these schools?</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><X className="h-4 w-4" aria-hidden /></button>
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: SOFT }}>Your path</p>
          <div className="flex flex-wrap items-center gap-[6px] text-[14px] font-bold">
            <span className="rounded-full px-[12px] py-[6px]" style={{ background: ACCENT, color: "#fff" }}>{career}</span>
            <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            <span className="rounded-full border px-[12px] py-[6px]" style={{ borderColor: "var(--glass-border)" }}>{route}</span>
            <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
            <span className="rounded-full border px-[12px] py-[6px]" style={{ borderColor: "var(--glass-border)" }}>{program}</span>
          </div>
          <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>
            Every school here offers {program}.{twoYear ? " A two-year start is a real route for this career." : ""}{trade ? "" : " No trade schools: this career has no trade route."}
          </p>
        </div>

        {gpa && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: SOFT }}>How we sort</p>
            <ul className="flex list-none flex-col gap-[6px] p-0">
              {legend.map((l) => (
                <li key={l.label} className="flex items-center gap-[10px] text-[14px]">
                  <span aria-hidden className="size-[10px] flex-none rounded-full" style={{ background: l.color }} />
                  <span className="w-[64px] flex-none font-extrabold">{l.label}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{l.text}</span>
                </li>
              ))}
            </ul>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>A guide, not a prediction. Schools where everyone gets in aren&rsquo;t sorted.</p>
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <p className="text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: SOFT }}>What we use</p>
          <dl className="flex flex-col gap-[8px]">
            <div className={row} style={{ borderColor: "var(--glass-border)" }}><dt style={{ color: "var(--muted-foreground)" }}>GPA</dt><dd className="m-0 font-bold">{gpa ?? "Not set"}</dd></div>
            <div className={row} style={{ borderColor: "var(--glass-border)" }}><dt style={{ color: "var(--muted-foreground)" }}>Where</dt><dd className="m-0 font-bold">{place}</dd></div>
            <div className={row} style={{ borderColor: "var(--glass-border)" }}><dt style={{ color: "var(--muted-foreground)" }}>How far</dt><dd className="m-0 font-bold">{distance ?? "Not set"}</dd></div>
          </dl>
          <Link href="/profile?tab=settings" className="dm-link flex w-fit items-center gap-[4px] text-[14px] font-bold" style={{ color: SOFT }}>Change in Settings <ChevronRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>
    </div>,
    document.body,
  );
}
