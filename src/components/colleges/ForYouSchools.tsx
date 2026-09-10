"use client";

import Link from "next/link";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronRight, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { BIG, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { ACCENT, CollegeCard, MarkBadge, SOFT, useTopSchool } from "./shared";
import { COLLEGES } from "./data";
import { Star } from "lucide-react";
import { FIT_WORDS, careerTitle, costLine, parseGpa, pathwayFor, schoolsFor, shortProgram, type SchoolMatch } from "./pathway";

const HOME_STATE_NAME = "New Jersey";

// Explore Schools, "For you": the student's own pathway turned into a short,
// curated set of schools (Joshua Pierce, Slack, 10 Sept 2026, after the
// Replit reference): Career -> Education route -> Program -> Schools that
// actually offer it -> grouped by how realistic each is. Different careers
// produce different sets; trade schools never show up for a banker.

const DEMO_TOP3 = ["investment-banking", "registered-nurse", "software-engineer"];

export function ForYouSchools({
  saved,
  onSave,
  compare,
  onCompare,
}: {
  saved: Set<string>;
  onSave: (slug: string) => void;
  compare: string[];
  onCompare: (slug: string) => void;
}) {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const profile = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  // Their Top 3 (demo default when nothing is saved yet); the focus career
  // leads, and the others are one tap away.
  const top3 = picks.ids.length ? picks.ids : DEMO_TOP3;
  const [chosen, setChosen] = useState<string | null>(null);
  const careerId = chosen && top3.includes(chosen) ? chosen : picks.focus && top3.includes(picks.focus) ? picks.focus : top3[0];
  const pathway = useMemo(() => pathwayFor(careerId), [careerId]);
  const groups = useMemo(() => (pathway ? schoolsFor(pathway, profile) : null), [pathway, profile]);
  const [switching, setSwitching] = useState(false);
  const [details, setDetails] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [top, setTop] = useTopSchool();
  const gpa = parseGpa(profile.gpa);

  if (!pathway || !groups) {
    return (
      <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
        <p className={BIG}>No pathway yet for {careerTitle(careerId)}.</p>
        <p className={`${SMALL} mt-[6px]`} style={{ color: "var(--muted-foreground)" }}>Browse all schools instead, or pick another career above.</p>
      </section>
    );
  }

  // One chip (the fit), one line (program · cost). Distance waits for data.
  const card = (m: SchoolMatch) => {
    const cost = costLine(m.college);
    return (
      <li key={m.college.slug}>
        <CollegeCard
          c={m.college}
          saved={saved.has(m.college.slug)}
          onSave={() => onSave(m.college.slug)}
          compared={compare.includes(m.college.slug)}
          onCompare={() => onCompare(m.college.slug)}
          href={`/colleges/${m.college.slug}?route=${pathway.careerId}`}
          badges={[{ label: FIT_WORDS[m.fit], tone: m.fit === "Reach" ? "reach" : m.fit === "Target" ? "target" : m.fit === "Safety" ? "safety" : m.fit === "Open admission" ? "open" : "muted" }]}
          subline={[shortProgram(m.program), m.path, cost].filter(Boolean).join(" · ")}
          hideTags
        />
      </li>
    );
  };
  const grid = "grid list-none gap-[var(--space-4)] p-0 sm:grid-cols-2 lg:grid-cols-3";
  const heading = (text: string, note?: string) => (
    <div className="flex flex-col gap-[4px]">
      <h2 className="text-[20px] leading-[24px] font-extrabold sm:text-[24px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>{text}</h2>
      {note && <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>{note}</p>}
    </div>
  );

  // Curated means short: about ten schools, best fits first, the realistic
  // moves next, stretches last. Everything else lives in Browse all.
  const sections: { key: string; title: string; note?: string; list: SchoolMatch[] }[] =
    gpa === null
      ? [{ key: "path", title: "More schools for your path", note: `Schools with ${pathway.program}.`, list: [...groups.target, ...groups.safety, ...groups.reach, ...groups.unplaced].slice(0, 8) }]
      : [
          { key: "target", title: "Target", note: "Your grades line up with these schools.", list: groups.target.slice(0, 4) },
          { key: "safety", title: "Safety", note: "Very likely to get in.", list: groups.safety.slice(0, 4) },
          { key: "reach", title: "Reach", note: "Harder to get into.", list: groups.reach.slice(0, 2) },
        ];
  if (groups.start2.length) sections.splice(gpa === null ? 1 : 2, 0, { key: "start", title: "Lower-cost ways to start", note: "Start here, then continue toward a 4-year degree.", list: groups.start2.slice(0, 3) });
  if (groups.trade.length) sections.push({ key: "trade", title: "Trade & technical", note: "Hands-on programs for this career.", list: groups.trade.slice(0, 3) });
  const shown = sections.filter((s) => s.list.length > 0);
  const detailChips = [gpa !== null ? `${profile.gpa} GPA` : null, profile.states.length ? profile.states.slice(0, 2).join(", ") : `${HOME_STATE_NAME} (home)`, profile.travelDistance || null].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* The header is one sentence. The career is the only control in it. */}
      <section className="flex flex-col gap-[var(--space-3)]">
        <p className="text-[17px] leading-[24px] font-semibold sm:text-[19px] sm:leading-[26px]" style={{ color: "var(--muted-foreground)" }}>
          Planning for{" "}
          <button
            type="button"
            onClick={() => setSwitching((v) => !v)}
            aria-expanded={switching}
            aria-label={`Career: ${pathway.careerTitle}. Change career`}
            className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-extrabold"
            style={{ color: "var(--foreground)", textDecoration: "underline", textUnderlineOffset: "5px", textDecorationThickness: "2px", textDecorationColor: ACCENT }}
          >
            {pathway.careerTitle}
            {top3.length > 1 && <ChevronRight className={`h-4 w-4 transition-transform ${switching ? "rotate-90" : ""}`} aria-hidden />}
          </button>
          {" "}<span className="whitespace-nowrap">· {pathway.route} in <strong style={{ color: "var(--foreground)" }}>{pathway.program}</strong></span>
        </p>
        {switching && top3.length > 1 && (
          <div className="flex flex-wrap items-center gap-[6px]" aria-label="Choose a career">
            {top3.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === pathway.careerId}
                onClick={() => { setChosen(id); setSwitching(false); }}
                className="dm-quiet min-h-[34px] cursor-pointer rounded-full border px-[12px] text-[13.5px] font-bold"
                style={{ background: id === pathway.careerId ? ACCENT : "transparent", color: id === pathway.careerId ? "#fff" : "var(--foreground)", borderColor: id === pathway.careerId ? ACCENT : "var(--glass-border)" }}
              >
                {careerTitle(id)}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <button type="button" onClick={() => setDetails((v) => !v)} aria-expanded={details} className="dm-quiet flex min-h-[30px] cursor-pointer items-center gap-[5px] rounded-full border px-[10px]" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            Why these schools? <ChevronRight className={`h-[14px] w-[14px] transition-transform ${details ? "rotate-90" : ""}`} aria-hidden />
          </button>
          {detailChips.map((chip) => <span key={chip} className="rounded-full px-[10px] py-[5px]" style={{ background: "var(--glass-surface-1)" }}>{chip}</span>)}
        </div>
        {details && (
          <div className="relative rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] leading-[20px]" style={{ background: "var(--glass-surface-1)" }}>
            <button type="button" aria-label="Close" onClick={() => setDetails(false)} className="dm-quiet absolute top-[6px] right-[6px] flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
            <p className="pr-[32px]">
              <strong>{pathway.careerTitle}</strong> usually starts with a {pathway.route.toLowerCase()} in <strong>{pathway.program}</strong>
              {pathway.alsoRelevant.length > 0 && <> (also {pathway.alsoRelevant.join(", ")})</>}. These schools offer that program.
              {pathway.twoYearStart && <> A two-year start is a real route here, so community colleges appear too.</>}
              {!pathway.trade && <> Trade schools are left out because this career doesn&rsquo;t have a trade route.</>}
              {gpa !== null && <> Reach, Target and Safety compare your GPA with each school&rsquo;s acceptance rate; a guide, not a prediction.</>}
            </p>
            <p className="mt-[8px] text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              GPA, states and distance come from your Build answers. <Link href="/profile?tab=settings" className="dm-link font-bold" style={{ color: SOFT }}>Change them in Settings</Link>.
            </p>
          </div>
        )}
      </section>

      {/* My plan: the decision board (the Replit's Saved page, folded into
         the page that produces the decisions). Four facts, one of them still
         to make -- the #1 school -- and the saved shortlist under it. */}
      <section aria-labelledby="my-plan" className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:p-[var(--space-5)]" style={PANEL}>
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
          <h2 id="my-plan" className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: SOFT }}>My plan</h2>
          {saved.size > 0 && (
            <button type="button" onClick={() => setSavedOpen((v) => !v)} aria-expanded={savedOpen} className="dm-link flex cursor-pointer items-center gap-[4px] text-[13px] font-bold" style={{ color: SOFT }}>
              Saved schools · {saved.size} <ChevronRight className={`h-[14px] w-[14px] transition-transform ${savedOpen ? "rotate-90" : ""}`} aria-hidden />
            </button>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[10px] sm:grid-cols-4">
          {[
            { k: "Career", v: pathway.careerTitle },
            { k: "Education", v: pathway.route },
            { k: "Program", v: pathway.program },
          ].map((row) => (
            <div key={row.k} className="flex min-w-0 flex-col gap-[2px]">
              <dt className="text-[11.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>{row.k}</dt>
              <dd className="m-0 truncate text-[15px] font-extrabold">{row.v}</dd>
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-[2px]">
            <dt className="text-[11.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>#1 school</dt>
            <dd className="m-0 truncate text-[15px] font-extrabold" style={{ color: top ? SOFT : "var(--muted-foreground)" }}>
              {top ? <Link href={`/colleges/${top}?route=${pathway.careerId}`} className="dm-link">{COLLEGES.find((c) => c.slug === top)?.name ?? "Not chosen yet"}</Link> : "Not chosen yet"}
            </dd>
          </div>
        </dl>
        {savedOpen && saved.size > 0 && (
          <>
          <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>A short list is more useful than a giant one. Keep the options you are seriously considering.</p>
          <ul className="flex list-none flex-col gap-[6px] p-0" aria-label="Saved schools">
            {[...saved].map((slug) => COLLEGES.find((c) => c.slug === slug)).filter((c): c is NonNullable<typeof c> => !!c).map((c) => (
              <li key={c.slug} className="flex items-center gap-[10px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[8px]" style={{ background: "var(--glass-surface-1)" }}>
                <MarkBadge c={c} size={32} />
                <Link href={`/colleges/${c.slug}?route=${pathway.careerId}`} className="dm-link flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-extrabold">{c.name}</span>
                  <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{c.city}, {c.stateName}{costLine(c) ? ` · ${costLine(c)}` : ""}</span>
                </Link>
                <button type="button" aria-pressed={top === c.slug} onClick={() => setTop(top === c.slug ? null : c.slug)} className="dm-quiet flex min-h-[32px] flex-none cursor-pointer items-center gap-[4px] rounded-full border px-[10px] text-[12.5px] font-bold" style={{ background: top === c.slug ? ACCENT : "transparent", borderColor: top === c.slug ? ACCENT : "var(--glass-border)", color: top === c.slug ? "#fff" : "var(--foreground)" }}>
                  <Star className="h-[13px] w-[13px]" fill={top === c.slug ? "currentColor" : "none"} aria-hidden /> {top === c.slug ? "Your #1" : "Make my #1"}
                </button>
                <button type="button" aria-label={`Remove ${c.name} from saved`} onClick={() => { if (top === c.slug) setTop(null); onSave(c.slug); }} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
              </li>
            ))}
          </ul>
          </>
        )}
      </section>

      {shown.length === 0 && (
        <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
          <p className={BIG}>No schools in our list offer {pathway.program} yet.</p>
          <p className={`${SMALL} mt-[6px]`} style={{ color: "var(--muted-foreground)" }}>Browse all schools, or try another career.</p>
        </section>
      )}

      {shown.map((s) => (
        <section key={s.key} className="flex flex-col gap-[var(--space-3)]">
          {heading(s.title, s.note)}
          <ul className={grid}>{s.list.map(card)}</ul>
        </section>
      ))}
    </div>
  );
}
