"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronRight, Info, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { ACADEMIC_RECORD } from "@/components/profile/report-data";
import { BIG, PANEL } from "@/components/career/CareerDetailExperience";
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
        badges={showFit && FIT_WORDS[m.fit] ? [{ label: FIT_WORDS[m.fit], tone: m.fit === "Reach" ? ("reach" as const) : m.fit === "Target" ? ("target" as const) : m.fit === "Safety" ? ("safety" as const) : ("open" as const) }] : []}
        subline={shortProgram(m.program)}
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
    <div className="flex flex-col gap-[var(--space-8)]">
      {/* The pathway strip: Career -> Route -> Program. Tap a chip with a
         chevron to change it; the options appear right under the strip. */}
      <section className="flex flex-col gap-[var(--space-4)]">
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
        <div className="flex flex-col gap-[6px] text-[13.5px] font-semibold sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--muted-foreground)" }}>
          <span>Based on {basedOn}</span>
          <span className="flex items-center gap-[var(--space-4)]">
            <button type="button" onClick={() => setWhy(true)} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}>
              <Info className="h-[14px] w-[14px]" aria-hidden /> Why these schools?
            </button>
            {saved.size > 0 && (
              <button type="button" onClick={onShowSaved} className="dm-link flex cursor-pointer items-center gap-[2px] font-bold" style={{ color: SOFT }}>
                Saved schools · {saved.size} <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
              </button>
            )}
          </span>
        </div>
      </section>

      {shown.length === 0 && (
        <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
          <p className={BIG}>No schools in our list offer {program} yet.</p>
        </section>
      )}

      {shown.map((s) => (
        <section key={s.key} className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: SOFT }}>{s.list.length} {s.list.length === 1 ? "school" : "schools"}</p>
            <h2 className="text-[22px] leading-[26px] font-extrabold sm:text-[26px] sm:leading-[30px]" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
          </div>
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
// The Replit's sheet, as is: an eyebrow, "A clear starting point", a
// checklist of what shaped the list, one CTA to adjust it.

function WhySheet({ onClose, career, route, program, gpa, place, distance }: { onClose: () => void; career: string; route: string; program: string; gpa: string | null; place: string; distance: string | null; twoYear?: boolean; trade?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const items = [
    `Your career: ${career}`,
    `Your education path: ${route}`,
    `Your recommended program: ${program}`,
    gpa ? `Your academic profile: ${gpa} GPA` : null,
    `Your location preference: ${place}${distance ? ` · ${distance}` : ""}`,
  ].filter(Boolean) as string[];
  return createPortal(
    // Centred on every size, never bottom-anchored: a sheet flush with the
    // bottom edge collided with the fixed nav and clipped the CTA (direct
    // feedback, 11 Sept 2026). Capped height with its own scroll.
    <div className="marketing-v2 themeable fixed inset-0 z-[120] flex items-center justify-center p-5 pb-[calc(20px+env(safe-area-inset-bottom))]" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)", backdropFilter: "blur(10px)" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section role="dialog" aria-modal="true" aria-labelledby="why-schools" className="relative flex max-h-[calc(100dvh-40px)] w-full max-w-[420px] flex-col gap-[var(--space-5)] overflow-y-auto rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ ...PANEL, background: "var(--card)", color: "var(--foreground)" }}>
        <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet absolute top-[12px] right-[12px] flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
        <div className="flex flex-col gap-[6px] pr-[40px]">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: SOFT }}>Why these schools?</p>
          <h2 id="why-schools" className="text-[24px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>A clear starting point</h2>
        </div>
        <ul className="flex list-none flex-col gap-[12px] p-0 text-[15px] leading-[20px] font-semibold">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-[10px]">
              <Check className="mt-[2px] h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <Link href="/profile?tab=settings" className="dm-solid flex min-h-[48px] w-full items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: ACCENT, color: "#fff" }}>
          Adjust preferences <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </div>,
    document.body,
  );
}
