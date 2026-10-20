"use client";

// Career Detail > Education: "What people study for it" and "Where you
// would study it", laid out and behaving like dreamari.com's Education tab
// (Chandu, 20 Oct 2026: "refer how the education tab and the interactions
// and how things are displayed look in dreamari.com and try to incorporate
// the same behaviours. IT shows number of colleges and when you click on it
// it should take you to that curated list of colleges").
//
// As on dreamari.com: two lists side by side. A major opens Explore Schools
// searched for that major; a credential reads "Bachelor's degree · 28
// colleges" and opens Browse all filtered "For <career> · Bachelor's
// degree" (careerSchools.ts, so the count and the list always agree).
// No boxes (a first pass drew each row as a bordered card; Chandu: "lets
// not do the boxes"), but not dreamari.com's long text lines either
// (Chandu: "make it evident that clicking bachelors degree/etc is a doable
// action or has a proper cta"): each credential is a short line with its
// own button on the right, "See 53 colleges", so the count is the call to
// action. Majors stay plain links, as on dreamari.com. Unlike dreamari.com,
// Back lands on this tab, not on Overview at the top.

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useAllColleges } from "@/components/colleges/dataset";
import { careerSchoolsHref, degreeOf, majorWords, teaches } from "@/components/colleges/careerSchools";
import { DISPLAY, MEDIUM, SMALL } from "@/components/career/CareerDetailExperience";

type Where = { count: string; credential: string; href?: string };
type Study = { name: string; href?: string };

/** Leaving for Explore Schools: write this tab into the current history
 *  entry first, so Back reopens Education, scrolled to it. */
function remember() {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", "education");
  window.history.replaceState(window.history.state, "", url);
}

/** A major, as on dreamari.com: a dot, the words, a chevron that nudges
 *  right on hover. */
function Row({ href, label, accent }: { href: string; label: string; accent: string }) {
  return (
    <li className={`${SMALL} flex items-start gap-[var(--space-3)]`}>
      <span aria-hidden className="mt-[8px] h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />
      <Link href={href} onClick={remember} className="dm-link group inline-flex min-h-[28px] flex-wrap items-center gap-x-[6px]" style={{ color: "var(--foreground)" }}>
        <span>{label}</span>
        <ChevronRight aria-hidden className="h-[14px] w-[14px] flex-none transition-transform duration-150 group-hover:translate-x-[3px]" style={{ color: accent }} />
      </Link>
    </li>
  );
}

/** A credential: its name on the left, the button on the right. The whole
 *  line is the link (a bigger target); the pill is what reads as the CTA,
 *  filling in and nudging its chevron on hover. */
function CredentialRow({ href, label, n, loading, accent }: { href: string; label: string; n: number | null; loading: boolean; accent: string }) {
  return (
    <li>
      <Link href={href} onClick={remember} className="group flex min-h-[52px] items-center justify-between gap-[var(--space-3)] py-[8px]" style={{ color: "var(--foreground)", ["--acc" as string]: accent }}>
        <span className={`${SMALL} min-w-0 font-semibold`}>{label}</span>
        {loading ? (
          <span aria-hidden className="h-[34px] w-[136px] flex-none animate-pulse rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} />
        ) : (
          <span className="inline-flex h-[34px] flex-none items-center gap-[4px] rounded-full border bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] pr-[10px] pl-[14px] text-[14px] font-semibold whitespace-nowrap tabular-nums transition-colors duration-150 group-hover:bg-[color-mix(in_srgb,var(--acc)_24%,transparent)] group-focus-visible:bg-[color-mix(in_srgb,var(--acc)_24%,transparent)]" style={{ borderColor: "color-mix(in srgb, var(--acc) 45%, transparent)", color: accent }}>
            {n === null ? "See colleges" : `See ${n.toLocaleString("en-US")} ${n === 1 ? "college" : "colleges"}`}
            <ChevronRight aria-hidden className="h-[16px] w-[16px] transition-transform duration-150 group-hover:translate-x-[3px]" />
          </span>
        )}
      </Link>
    </li>
  );
}

export function WhereToStudy({ where, studies, accent, careerSlug }: { where: Where[]; studies: Study[]; accent: string; careerSlug: string }) {
  const { colleges, error } = useAllColleges();
  const words = useMemo(() => majorWords(studies), [studies]);
  const counts = useMemo(
    () => (colleges ? where.map((w) => { const d = degreeOf(w.credential); return d ? colleges.filter((c) => teaches(c, d, words)).length : 0; }) : null),
    [colleges, where, words],
  );

  return (
    <div className="grid gap-[var(--space-6)] sm:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
        <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>What people study for it</h3>
        <ul className="flex flex-col gap-[var(--space-2)]">
          {studies.map((s) => {
            const name = s.name.replace(/\s*\(.*?\)/g, "");
            return <Row key={s.name} accent={accent} href={s.href ?? `/colleges?view=browse&q=${encodeURIComponent(name)}`} label={s.name} />;
          })}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col gap-[var(--space-3)]">
        <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Where you would study it</h3>
        <ul className="-mt-[8px] flex flex-col divide-y divide-[var(--glass-border)]">
          {where.map((w, i) => {
            if (!degreeOf(w.credential)) {
              // no school behind it (a diploma, training on the job): said
              // in words, not drawn as a row, since there is nothing to open
              return <li key={w.credential} className={`${SMALL} flex min-h-[52px] items-center`} style={{ color: "var(--muted-foreground)"}}>{w.credential}: no school needed</li>;
            }
            const n = counts?.[i] ?? null;
            if (n === 0) {
              return <li key={w.credential} className={`${SMALL} flex min-h-[52px] items-center`} style={{ color: "var(--muted-foreground)"}}>{w.credential}: none on our list yet</li>;
            }
            // a pulsing pill while the school list loads; on a failed load
            // the button still opens the list, without a number
            return <CredentialRow key={w.credential} accent={accent} href={w.href ?? careerSchoolsHref(careerSlug, w.credential)} label={w.credential} n={n} loading={n === null && !error} />;
          })}
        </ul>
      </div>
    </div>
  );
}
