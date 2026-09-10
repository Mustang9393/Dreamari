"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronRight, HelpCircle, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { BIG, PANEL, SMALL } from "@/components/career/CareerDetailExperience";
import { ACCENT, CollegeCard, SOFT } from "./shared";
import { FIT_WORDS, careerTitle, parseGpa, pathwayFor, schoolsFor, type SchoolMatch } from "./pathway";

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
  const gpa = parseGpa(profile.gpa);

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
        badges={[
          { label: m.program.replace(/,.*$/, "").replace(/\/.*$/, ""), tone: "program" },
          { label: m.path, tone: "path" },
          { label: FIT_WORDS[m.fit], tone: m.fit === "Reach" ? "reach" : m.fit === "Target" ? "target" : m.fit === "Safety" ? "safety" : m.fit === "Open admission" ? "open" : "muted" },
        ]}
      />
    </li>
  );
  const grid = "grid list-none gap-[var(--space-4)] p-0 sm:grid-cols-2 lg:grid-cols-3";
  const eyebrow = (text: string) => <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase" style={{ color: SOFT }}>{text}</p>;
  const heading = (text: string, count?: number) => (
    <h2 className="text-[20px] leading-[24px] font-extrabold sm:text-[24px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>
      {text}{typeof count === "number" && <span className="ml-[8px] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>{count}</span>}
    </h2>
  );

  const fitGroups = [
    { key: "reach", label: "Reach", note: "Competitive for you; worth a shot", list: groups.reach },
    { key: "target", label: "Target", note: "Your grades line up", list: groups.target },
    { key: "safety", label: "Safety", note: "Very likely to get in", list: groups.safety },
  ].filter((g) => g.list.length > 0);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* the pathway strip: what this list is built from */}
      <section className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:p-[var(--space-5)]" style={PANEL}>
        <div className="flex flex-wrap items-center gap-[6px] text-[14px] font-bold" aria-label="Your pathway">
          {top3.length > 1 ? (
            <span className="flex flex-wrap items-center gap-[4px]">
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
            </span>
          ) : (
            <span className="rounded-full px-[12px] py-[6px]" style={{ background: ACCENT, color: "#fff" }}>{pathway.careerTitle}</span>
          )}
          <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <span className="rounded-full border px-[12px] py-[6px]" style={{ borderColor: "var(--glass-border)" }}>{pathway.route}</span>
          <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <span className="rounded-full border px-[12px] py-[6px]" style={{ borderColor: "var(--glass-border)" }}>{pathway.program}</span>
        </div>
        <div className="flex flex-wrap items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <span className="rounded-full px-[10px] py-[4px]" style={{ background: "var(--glass-surface-1)" }}>{gpa !== null ? `${profile.gpa} GPA` : "No GPA yet"}</span>
          {profile.travelDistance && <span className="rounded-full px-[10px] py-[4px]" style={{ background: "var(--glass-surface-1)" }}>{profile.travelDistance}</span>}
          {profile.states.length > 0 && <span className="rounded-full px-[10px] py-[4px]" style={{ background: "var(--glass-surface-1)" }}>{profile.states.slice(0, 2).join(", ")}{profile.states.length > 2 ? ` +${profile.states.length - 2}` : ""}</span>}
          <button type="button" onClick={() => setWhy((v) => !v)} aria-expanded={why} className="dm-link flex cursor-pointer items-center gap-[4px] rounded-full px-[6px] py-[4px]" style={{ color: SOFT }}>
            <HelpCircle className="h-[14px] w-[14px]" aria-hidden /> Why these schools?
          </button>
          {gpa === null && (
            <Link href="/profile?tab=settings" className="dm-link ml-auto flex items-center gap-[4px] rounded-full px-[6px] py-[4px]" style={{ color: SOFT }}>
              Add your GPA for Reach / Target / Safety <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
            </Link>
          )}
        </div>
        {why && (
          <div className="relative rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] leading-[20px]" style={{ background: "var(--glass-surface-1)" }}>
            <button type="button" aria-label="Close" onClick={() => setWhy(false)} className="dm-quiet absolute top-[6px] right-[6px] flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
            <p className="pr-[32px]">
              <strong>{pathway.careerTitle}</strong> usually starts with a <strong>{pathway.route.toLowerCase()}</strong> in <strong>{pathway.program}</strong>
              {pathway.alsoRelevant.length > 0 && <> (also {pathway.alsoRelevant.join(", ")})</>}. These schools actually offer that program.
              {pathway.twoYearStart && <> A two-year start is a real route here, so community colleges appear too.</>}
              {!pathway.trade && <> Trade schools are left out because this career doesn&rsquo;t have a trade route.</>}
              {" "}Reach / Target / Safety compares your GPA with each school&rsquo;s acceptance rate; it&rsquo;s a guide, not a prediction, and open-admission schools aren&rsquo;t ranked.
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
          <div className="flex flex-col gap-[2px]">
            {eyebrow(g.note)}
            {heading(g.label, g.list.length)}
          </div>
          <ul className={grid}>{g.list.map(card)}</ul>
        </section>
      ))}

      {groups.start2.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            {eyebrow("A practical first step")}
            {heading("Lower-cost ways to start", groups.start2.length)}
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>Start here, then continue toward a 4-year degree.</p>
          </div>
          <ul className={grid}>{groups.start2.map(card)}</ul>
        </section>
      )}

      {groups.trade.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            {eyebrow("Hands-on route")}
            {heading("Trade and technical", groups.trade.length)}
          </div>
          <ul className={grid}>{groups.trade.map(card)}</ul>
        </section>
      )}

      {groups.unplaced.length > 0 && (
        <section className="flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-col gap-[2px]">
            {eyebrow(`${groups.unplaced.length} more`)}
            {heading("More schools for your path")}
            {gpa === null && <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>Add your GPA in Settings and these sort into Reach, Target and Safety.</p>}
          </div>
          <ul className={grid}>{groups.unplaced.map(card)}</ul>
        </section>
      )}
    </div>
  );
}
