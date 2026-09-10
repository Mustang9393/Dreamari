"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronRight, HelpCircle, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { BIG, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { ACCENT, CollegeCard, SOFT } from "./shared";
import { FIT_COUNSELOR, FIT_WORDS, careerTitle, parseGpa, pathwayFor, schoolsFor, shortProgram, type SchoolMatch } from "./pathway";

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
  const [why, setWhy] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const gpa = parseGpa(profile.gpa);
  const CAP = 6;

  if (!pathway || !groups) {
    return (
      <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
        <p className={BIG}>No pathway yet for {careerTitle(careerId)}.</p>
        <p className={`${SMALL} mt-[6px]`} style={{ color: "var(--muted-foreground)" }}>Browse all schools instead, or pick another career above.</p>
      </section>
    );
  }

  const card = (m: SchoolMatch) => (
    <li key={m.college.slug}>
      <CollegeCard
        c={m.college}
        saved={saved.has(m.college.slug)}
        onSave={() => onSave(m.college.slug)}
        compared={compare.includes(m.college.slug)}
        onCompare={() => onCompare(m.college.slug)}
        href={`/colleges/${m.college.slug}?route=${pathway.careerId}`}
        // One chip, not a row of them (direct feedback, 10 Sept 2026): the
        // fit. The programme is a plain line under the place; "2-year start"
        // / "Trade route" only appear when the path is NOT the straight one.
        badges={[
          ...(m.path === "Direct path" ? [] : [{ label: m.path, tone: "path" as const }]),
          { label: FIT_WORDS[m.fit], tone: m.fit === "Reach" ? "reach" : m.fit === "Target" ? "target" : m.fit === "Safety" ? "safety" : m.fit === "Open admission" ? "open" : "muted" },
        ]}
        subline={shortProgram(m.program)}
        hideTags
      />
    </li>
  );
  const grid = "grid list-none gap-[var(--space-4)] p-0 sm:grid-cols-2 lg:grid-cols-3";
  const heading = (text: string, count?: number) => (
    <h2 className="text-[20px] leading-[24px] font-extrabold sm:text-[24px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>
      {text}{typeof count === "number" && <span className="ml-[8px] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{count}</span>}
    </h2>
  );

  // Good matches lead, likely ones next, stretches last (leading with a 5%
  // acceptance rate set the wrong tone). Without a GPA there is no sorting to
  // show, so the degree schools are one plain list.
  const fitGroups = gpa === null
    ? [{ key: "all", label: "Schools for your path", note: null as string | null, list: [...groups.target, ...groups.safety, ...groups.reach, ...groups.unplaced] }]
    : [
        { key: "target", label: "Good match", note: `Your grades line up. Counselors call these ${FIT_COUNSELOR.Target} schools.`, list: groups.target },
        { key: "safety", label: "Likely to get in", note: `Very likely a yes. Counselors call these ${FIT_COUNSELOR.Safety} schools.`, list: groups.safety },
        { key: "reach", label: "A stretch", note: `Harder to get into, still worth a look. Counselors call these ${FIT_COUNSELOR.Reach} schools.`, list: groups.reach },
      ].filter((g) => g.list.length > 0);
  const visible = (key: string, list: SchoolMatch[]) => (expanded.has(key) ? list : list.slice(0, CAP));
  const showAll = (key: string, list: SchoolMatch[]) =>
    list.length > CAP && !expanded.has(key) ? (
      <button type="button" onClick={() => setExpanded((cur) => new Set(cur).add(key))} className="dm-quiet mx-auto flex min-h-[40px] w-fit cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
        Show all {list.length} <ChevronRight className="h-4 w-4 rotate-90" aria-hidden />
      </button>
    ) : null;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* the pathway strip: what this list is built from */}
      <section className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:p-[var(--space-5)]" style={PANEL}>
        {/* row 1: whose plan (the student's Top 3, focus first) */}
        {top3.length > 1 && (
          <div className="flex flex-wrap items-center gap-[6px]" aria-label="Planning for">
            <span className="mr-[2px] text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Planning for</span>
            {top3.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === pathway.careerId}
                onClick={() => setChosen(id)}
                className="dm-quiet min-h-[32px] cursor-pointer rounded-full border px-[12px] text-[13.5px] font-bold"
                style={{ background: id === pathway.careerId ? ACCENT : "transparent", color: id === pathway.careerId ? "#fff" : "var(--foreground)", borderColor: id === pathway.careerId ? ACCENT : "var(--glass-border)" }}
              >
                {careerTitle(id)}
              </button>
            ))}
          </div>
        )}
        {/* row 2: the path, as one sentence that never orphans an arrow */}
        <p className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[15px] leading-[20px] font-bold" aria-label="Your pathway">
          {/* the selected chip above already names the career when there are several */}
          {top3.length > 1 ? <span>{pathway.route}</span> : <><span>{pathway.careerTitle}</span><span className="inline-flex items-center gap-[8px]"><ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />{pathway.route}</span></>}
          <span className="inline-flex items-center gap-[8px]"><ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} /><span style={{ color: SOFT }}>{pathway.program}</span></span>
        </p>
        <div className="flex flex-wrap items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          {gpa !== null && <span className="rounded-full px-[10px] py-[4px]" style={{ background: "var(--glass-surface-1)" }}>{profile.gpa} GPA</span>}
          {profile.travelDistance && <span className="rounded-full px-[10px] py-[4px]" style={{ background: "var(--glass-surface-1)" }}>{profile.travelDistance}</span>}
          {profile.states.length > 0 && <span className="rounded-full px-[10px] py-[4px]" style={{ background: "var(--glass-surface-1)" }}>{profile.states.slice(0, 2).join(", ")}{profile.states.length > 2 ? ` +${profile.states.length - 2}` : ""}</span>}
          <button type="button" onClick={() => setWhy((v) => !v)} aria-expanded={why} className="dm-link flex cursor-pointer items-center gap-[4px] rounded-full px-[6px] py-[4px]" style={{ color: SOFT }}>
            <HelpCircle className="h-[14px] w-[14px]" aria-hidden /> Why these schools?
          </button>
        </div>
        {why && (
          <div className="relative rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] leading-[20px]" style={{ background: "var(--glass-surface-1)" }}>
            <button type="button" aria-label="Close" onClick={() => setWhy(false)} className="dm-quiet absolute top-[6px] right-[6px] flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
            <p className="pr-[32px]">
              <strong>{pathway.careerTitle}</strong> usually starts with a <strong>{pathway.route.toLowerCase()}</strong> in <strong>{pathway.program}</strong>
              {pathway.alsoRelevant.length > 0 && <> (also {pathway.alsoRelevant.join(", ")})</>}. These schools actually offer that program.
              {pathway.twoYearStart && <> A two-year start is a real route here, so community colleges appear too.</>}
              {!pathway.trade && <> Trade schools are left out because this career doesn&rsquo;t have a trade route.</>}
              {gpa !== null ? <> &ldquo;Good match&rdquo;, &ldquo;Likely&rdquo; and &ldquo;A stretch&rdquo; compare your GPA with each school&rsquo;s acceptance rate. It&rsquo;s a guide, not a prediction, and schools where everyone gets in aren&rsquo;t ranked.</> : <> Schools where everyone gets in are shown as that.</>}
            </p>
          </div>
        )}
      </section>

      {groups.total === 0 && (
        <section className="rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={PANEL}>
          <p className={BIG}>No schools in our list offer {pathway.program} yet.</p>
          <p className={`${SMALL} mt-[6px]`} style={{ color: "var(--muted-foreground)" }}>Browse all schools, or try another career above.</p>
        </section>
      )}

      {fitGroups.map((g) => (
        <section key={g.key} className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[4px]">
            {heading(g.label, g.list.length)}
            {g.note && <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>{g.note}</p>}
          </div>
          <ul className={grid}>{visible(g.key, g.list).map(card)}</ul>
          {showAll(g.key, g.list)}
        </section>
      ))}

      {groups.start2.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            {heading("Lower-cost ways to start", groups.start2.length)}
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>Start here, then continue toward a 4-year degree.</p>
          </div>
          <ul className={grid}>{visible("start2", groups.start2).map(card)}</ul>
          {showAll("start2", groups.start2)}
        </section>
      )}

      {groups.trade.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            {heading("Trade and technical", groups.trade.length)}
          </div>
          <ul className={grid}>{groups.trade.map(card)}</ul>
        </section>
      )}

      {gpa !== null && groups.unplaced.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[4px]">
            {heading("More schools for your path", groups.unplaced.length)}
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>These don&rsquo;t publish an acceptance rate, so there&rsquo;s nothing to compare your GPA against.</p>
          </div>
          <ul className={grid}>{visible("unplaced", groups.unplaced).map(card)}</ul>
          {showAll("unplaced", groups.unplaced)}
        </section>
      )}
    </div>
  );
}
