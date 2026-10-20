"use client";

// Career Detail > Education > "Where you would study it" (20 Oct 2026).
// Chandu: "Right now it shows bachelors/masters as accordions but i think
// its not obvious that there is a drill down there." The old rows were a
// dot, the credential in words and a 14px chevron: they read as a list of
// facts, not as doors. Each credential is now a card (the house card:
// HoverBeam + dm-tap, a chevron that is always drawn and nudges on hover)
// with real school photos on it, so the card itself says "schools are in
// here". It opens a sheet over the page (Back never loses the student's
// place) listing schools that teach the career's majors at that level; each
// school leaves for its own page, and the sheet ends with Browse all.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { Working } from "@/components/app/Working";
import { CollegePicture } from "@/components/colleges/shared";
import { useAllColleges } from "@/components/colleges/dataset";
import { shortProgram } from "@/components/colleges/pathway";
import type { College } from "@/components/colleges/data";
import { BIG, DISPLAY, SMALL } from "@/components/career/CareerDetailExperience";

type Where = { count: string; credential: string; href?: string };
type Study = { name: string };

// Degree index, the dataset's own order (dataset.ts DEGREES).
const DEGREE_WORD = ["Certificate", "Associate", "Bachelor", "Master", "Doctor"] as const;

type Kind = { degree: number; title: string; line: string; browse: "trade" | "2-year" | "4-year"; browseLabel: string };

/** The credential in plain words: what it is and how long it takes. Null
 *  when no school is involved (a diploma, on-the-job training). */
function kindOf(credential: string): Kind | null {
  const c = credential.toLowerCase();
  if (/certificate/.test(c)) {
    const line = /under a year/.test(c) ? "Less than a year at a trade school" : /1-2 years/.test(c) ? "1 to 2 years at a trade school" : "A short program at a trade school";
    // two certificate cards side by side need two names, not one
    return { degree: 0, title: /under a year/.test(c) ? "Short certificate" : "Certificate", line, browse: "trade", browseLabel: "trade schools" };
  }
  if (/associate/.test(c)) return { degree: 1, title: "Associate degree", line: "About 2 years at a 2-year college", browse: "2-year", browseLabel: "2-year colleges" };
  if (/bachelor/.test(c)) return { degree: 2, title: "Bachelor's degree", line: "About 4 years at a 4-year college", browse: "4-year", browseLabel: "4-year colleges" };
  if (/master/.test(c)) return { degree: 3, title: "Master's degree", line: "1 to 2 more years after a bachelor's", browse: "4-year", browseLabel: "4-year colleges" };
  if (/law degree|j\.d\./.test(c)) return { degree: 4, title: "Law degree", line: "3 years of law school after a bachelor's", browse: "4-year", browseLabel: "4-year colleges" };
  if (/doctor/.test(c)) return { degree: 4, title: "Doctorate", line: "Several more years after a bachelor's", browse: "4-year", browseLabel: "4-year colleges" };
  return null;
}

const STOP = new Set(["general", "studies", "study", "science", "sciences", "and", "other", "the", "pre", "arts", "technology", "management"]);
/** One telling word per major ("Computer Science" -> computer, "Pre-Law" ->
 *  law, "Nursing (BSN)" -> nursing), matched against each school's own
 *  federal program names. */
function majorMatcher(studies: Study[]): RegExp | null {
  const words = studies
    .map((s) => s.name.replace(/\(.*?\)/g, "").split(/[\s/,-]+/).map((w) => w.toLowerCase()).find((w) => w.length > 2 && !STOP.has(w)))
    .filter((w): w is string => !!w);
  const uniq = [...new Set(words)].map((w) => w.replace(/[^a-z]/g, "")).filter(Boolean);
  return uniq.length ? new RegExp(`\\b(${uniq.join("|")})`, "i") : null;
}

function programNames(c: College): string[] {
  if (c.programsList?.length) return c.programsList.map((p) => p.name);
  if (c.detail && !c.detail.sample) return c.detail.programmes.map((p) => p.name);
  return [];
}

function offersDegree(c: College, degree: number): boolean {
  if (c.degreesList) return c.degreesList.some((d) => d.startsWith(DEGREE_WORD[degree]));
  if (c.detail && !c.detail.sample) return c.detail.levels.some((l) => l.n > 0 && l.label.startsWith(DEGREE_WORD[degree]));
  return degree === 0 ? c.level === "Certificates" : degree === 1 ? c.level === "Associate degrees" : c.level === "Bachelor's degrees";
}

type Match = { college: College; program: string };

// The program lists are per school, not per degree level, so "teaches
// Finance and grants master's degrees" stands in for "has a Finance
// master's". Close enough to point a student at real schools; production
// should match on the program at that level.
function schoolsFor(all: College[], degree: number, rx: RegExp | null): Match[] {
  if (!rx) return [];
  const out: Match[] = [];
  for (const c of all) {
    if (!offersDegree(c, degree)) continue;
    const hit = programNames(c).find((n) => rx.test(n));
    if (hit) out.push({ college: c, program: shortProgram(hit) });
  }
  // a school whose main level is this one first (a trade school before a
  // university's certificate), then the hand-built schools (reviewed photos
  // and full pages), then the ones where more students finish
  const home = (c: College) => (degree === 0 ? c.level === "Certificates" : degree === 1 ? c.level === "Associate degrees" : c.level === "Bachelor's degrees") ? 0 : 1;
  return out.sort((a, b) => home(a.college) - home(b.college) || Number(!!a.college.dataset) - Number(!!b.college.dataset) || (b.college.finish ?? -1) - (a.college.finish ?? -1));
}

const SHEET_MAX = 8;

export function WhereToStudy({ where, studies, accent, careerTitle }: { where: Where[]; studies: Study[]; accent: string; careerTitle: string }) {
  const { colleges, error, retry } = useAllColleges();
  const rx = useMemo(() => majorMatcher(studies), [studies]);
  const rows = useMemo(() => where.map((w) => ({ w, kind: kindOf(w.credential) })), [where]);
  const matches = useMemo(() => (colleges ? rows.map((r) => (r.kind ? schoolsFor(colleges, r.kind.degree, rx) : [])) : null), [colleges, rows, rx]);
  // each card previews different schools where it can, so two cards never
  // show the same three photos
  const previews = useMemo(() => {
    if (!matches) return null;
    const used = new Set<string>();
    return matches.map((list) => {
      const fresh = list.filter((m) => !used.has(m.college.slug));
      const picks = [...fresh, ...list.filter((m) => used.has(m.college.slug))].slice(0, 3).map((m) => m.college);
      picks.forEach((c) => used.add(c.slug));
      return picks;
    });
  }, [matches]);
  const [open, setOpen] = useState<number | null>(null);

  // Back from a school page reopens the sheet it was picked from: the
  // school link writes ?tab=education&where=<n> into this entry first.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("where"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time URL read after mount
    if (Number.isInteger(n) && n > 0 && n <= rows.length && rows[n - 1].kind) setOpen(n - 1);
  }, [rows]);

  const cards = rows.filter((r) => r.kind).length;
  const majors = studies.map((s) => s.name.replace(/\s*\(.*?\)/g, ""));
  const majorsLine = [...new Set(majors)].join(", ").replace(/, ([^,]*)$/, " or $1");

  return (
    <>
      <ul className={`grid gap-[var(--space-4)] ${cards >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : cards === 2 ? "sm:grid-cols-2" : ""}`}>
        {rows.map(({ w, kind }, i) =>
          kind ? (
            <li key={w.credential} className="min-w-0">
              <HoverBeam strength={0.7} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-haspopup="dialog"
                  className="dm-tap group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border text-left"
                  style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                >
                  <Strip picks={previews?.[i] ?? null} />
                  <span className="flex flex-1 flex-col gap-[var(--space-3)] p-[var(--space-4)]">
                    <span className="flex flex-col gap-[2px]">
                      <span className="text-[17px] leading-[22px] font-bold" style={DISPLAY}>{kind.title}</span>
                      <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{kind.line}</span>
                    </span>
                    <span className="mt-auto flex items-center gap-[4px] text-[14px] leading-[20px] font-semibold" style={{ color: accent }}>
                      See schools
                      <ChevronRight aria-hidden className="h-[16px] w-[16px] flex-none transition-transform duration-150 group-hover:translate-x-[3px]" />
                    </span>
                  </span>
                </button>
              </HoverBeam>
            </li>
          ) : (
            // no school to show (a diploma, training on the job): said in
            // words, not drawn as a card, since there is nothing behind it
            <li key={w.credential} className={`${SMALL} flex items-center sm:col-span-full`} style={{ color: "var(--muted-foreground)" }}>
              {w.credential}: no school needed to start.
            </li>
          ),
        )}
      </ul>

      {open !== null && rows[open]?.kind && (
        <SchoolsSheet
          kind={rows[open].kind!}
          index={open}
          careerTitle={careerTitle}
          majorsLine={majorsLine}
          matches={matches?.[open] ?? null}
          error={error}
          retry={retry}
          browseHref={rows[open].w.href ?? `/colleges?type=${rows[open].kind!.browse}`}
          onClose={() => {
            setOpen(null);
            // drop the reopen marker a school link may have left behind
            const url = new URL(window.location.href);
            if (url.searchParams.has("where")) {
              url.searchParams.delete("where");
              window.history.replaceState(window.history.state, "", url);
            }
          }}
        />
      )}
    </>
  );
}

/** Three school photos edge to edge across the top of the card: the
 *  picture that tells a student "there are schools in here" before they
 *  read a word. Fewer than three matches share the width; a plain band
 *  when none match, so the cards in a row keep one shape. Pulses while
 *  the school list loads. */
function Strip({ picks }: { picks: College[] | null }) {
  const cell = "relative min-w-0 flex-1 overflow-hidden";
  const blank = { background: "color-mix(in srgb, var(--foreground) 8%, transparent)" };
  return (
    <span aria-hidden className="flex h-[92px] gap-[2px] overflow-hidden rounded-t-[inherit]">
      {picks === null
        ? [0, 1, 2].map((k) => <span key={k} className={`${cell} animate-pulse`} style={blank} />)
        : picks.length === 0
          ? <span className={cell} style={blank} />
          : picks.map((c) => <CollegePicture key={c.slug} c={c} sizes="(min-width: 640px) 120px, 33vw" className={`${cell} h-full`} />)}
    </span>
  );
}

function SchoolsSheet({ kind, index, careerTitle, majorsLine, matches, error, retry, browseHref, onClose }: {
  kind: Kind; index: number; careerTitle: string; majorsLine: string; matches: Match[] | null; error: boolean; retry: () => void; browseHref: string; onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Leaving for a school: remember the tab and this sheet in the current
  // history entry, so Back lands here again, sheet open.
  const remember = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "education");
    url.searchParams.set("where", String(index + 1));
    window.history.replaceState(window.history.state, "", url);
  };

  if (typeof document === "undefined") return null;
  const list = matches?.slice(0, SHEET_MAX) ?? [];
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="where-sheet-title" style={{ fontFamily: "var(--font-body)", background: "transparent" }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.62)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
      <div
        className="dm-scroll relative z-[1] flex max-h-[calc(92dvh/var(--vz,1))] w-full max-w-[600px] flex-col gap-[var(--space-5)] overflow-y-auto rounded-t-[var(--radius-xl)] border p-[var(--space-5)] sm:rounded-[var(--radius-lg)] sm:p-[var(--space-6)]"
        style={{ background: "color-mix(in srgb, var(--background) 95%, var(--foreground))", borderColor: "var(--glass-border)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)", color: "var(--foreground)" }}
      >
        <div className="flex items-start justify-between gap-[var(--space-4)]">
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h2 id="where-sheet-title" className={BIG} style={DISPLAY}>{kind.title}</h2>
            <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>
              {majorsLine ? `Schools that teach ${majorsLine}` : `Schools for ${careerTitle}`}
            </p>
          </div>
          <IconTip label="Close">
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </IconTip>
        </div>

        {matches === null && !error && <Working label="Finding schools" />}
        {matches === null && error && (
          <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>
            Couldn&apos;t load schools.{" "}
            <button type="button" onClick={retry} className="dm-link cursor-pointer font-semibold" style={{ color: "var(--foreground)" }}>Try again</button>
          </p>
        )}
        {matches !== null && list.length === 0 && (
          <p className={SMALL} style={{ color: "var(--muted-foreground)" }}>No schools on our list match yet. You can still browse them all.</p>
        )}

        {list.length > 0 && (
          <ul className="-mx-[8px] flex flex-col">
            {list.map((m) => (
              <li key={m.college.slug}>
                <Link
                  href={`/colleges/${m.college.slug}`}
                  onClick={remember}
                  className="dm-quiet group flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[8px] py-[8px]"
                  style={{ color: "var(--foreground)" }}
                >
                  <CollegePicture c={m.college} sizes="112px" className="size-[52px] flex-none rounded-[var(--radius-sm)]" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] leading-[20px] font-semibold">{m.college.name}</span>
                    <span className="truncate text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
                      {m.college.city}, {m.college.state} · {m.program}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="h-[16px] w-[16px] flex-none transition-transform duration-150 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" style={{ color: "var(--muted-foreground)" }} />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={browseHref}
          className="dm-solid group flex min-h-[44px] items-center justify-center gap-[6px] rounded-full px-[var(--space-5)] text-[15px] font-semibold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
        >
          Browse all {kind.browseLabel}
          <ArrowUpRight aria-hidden className="h-[16px] w-[16px] transition-transform duration-150 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
        </Link>
      </div>
    </div>,
    document.body,
  );
}
