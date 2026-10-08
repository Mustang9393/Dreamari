"use client";

// One scope for all of Insights (9 Oct 2026, Maisha: "Counselors should be
// able to filter the entire section without repeatedly resetting context.
// Suggested filters: Grade, Cohort/Class Year, Student Group, School Year.
// Filters should persist when moving between relevant charts/drill-downs.").
//
// One small store, read by Readiness, College & Career, Engagement and My
// Impact, so a filter set on one page is still set on the next, and every
// drill opened from a filtered chart lists the same scoped students. It is
// kept in sessionStorage, not localStorage: it should survive moving between
// pages and reloading, not greet the next demo with last week's filter.
//
// Grade and Class Year are ONE control here: on a current-year roster every
// grade is exactly one graduating class, so two dropdowns would only let a
// counselor pick a combination that can never match (Grade 9 and the Class
// of 2027). Each option names both ("Grade 12 · Class of 2027").

import { useMemo, useSyncExternalStore } from "react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { seedHash } from "@/lib/localRecord";
import { INTEGRATIONS, sisFor } from "@/lib/counselorSis";

export const GRADES = [9, 10, 11, 12] as const;
export type GradeKey = "all" | "9" | "10" | "11" | "12";
export const STUDENT_GROUPS = ["AVID", "CTE", "First-Gen", "ELL", "IEP/504"] as const;
export type StudentGroup = (typeof STUDENT_GROUPS)[number];
export type GroupKey = "all" | StudentGroup;

/** The school years Insights can look back on. `back` is how many years
 *  before the current one. */
export const SCHOOL_YEARS = [
  { key: "2026-27", label: "2026–27", back: 0 },
  { key: "2025-26", label: "2025–26", back: 1 },
  { key: "2024-25", label: "2024–25", back: 2 },
  { key: "2023-24", label: "2023–24", back: 3 },
] as const;
export type SchoolYearKey = (typeof SCHOOL_YEARS)[number]["key"];

export type InsightsFilter = { grade: GradeKey; group: GroupKey; year: SchoolYearKey };
export const DEFAULT_FILTER: InsightsFilter = { grade: "all", group: "all", year: "2026-27" };

/** The class a grade graduates with, this school year (2026–27). */
export const classOf = (grade: number) => 2027 + (12 - grade);

// ---- store ------------------------------------------------------------------

const KEY = "dreamari:counselor-insights-filters";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: InsightsFilter } = { raw: null, value: DEFAULT_FILTER };

function read(): InsightsFilter {
  if (typeof window === "undefined") return DEFAULT_FILTER;
  let raw: string | null = null;
  try { raw = window.sessionStorage.getItem(KEY); } catch { return cache.value; }
  if (raw === cache.raw) return cache.value;
  let value = DEFAULT_FILTER;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<InsightsFilter>) : {};
    value = {
      grade: (["all", "9", "10", "11", "12"] as string[]).includes(String(parsed.grade)) ? (parsed.grade as GradeKey) : "all",
      group: parsed.group === "all" || STUDENT_GROUPS.includes(parsed.group as StudentGroup) ? ((parsed.group ?? "all") as GroupKey) : "all",
      year: SCHOOL_YEARS.some((y) => y.key === parsed.year) ? (parsed.year as SchoolYearKey) : DEFAULT_FILTER.year,
    };
  } catch { value = DEFAULT_FILTER; }
  cache = { raw, value };
  return value;
}

export function setInsightsFilter(patch: Partial<InsightsFilter>): void {
  const next = { ...read(), ...patch };
  const raw = JSON.stringify(next);
  try { window.sessionStorage.setItem(KEY, raw); } catch { /* no storage: this page view only */ }
  cache = { raw, value: next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useInsightsFilter(): InsightsFilter {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_FILTER);
}

// ---- membership ---------------------------------------------------------------

// DEMO-ONLY: student groups come from the SIS's program flags in production
// (AVID, ELL and IEP/504 rosters, first-generation status from enrollment
// forms). CTE reads the imagined SIS's own concentrator flag; the rest are
// a steady seeded share of the roster until those flags are imported.
const GROUP_SHARE: Record<Exclude<StudentGroup, "CTE">, number> = { AVID: 18, "First-Gen": 34, ELL: 14, "IEP/504": 12 };
export function inGroup(s: CounselorStudent, g: StudentGroup): boolean {
  if (g === "CTE") return sisFor(s).cte.concentrator;
  return seedHash(`${s.id}:${g}`) % 100 < GROUP_SHARE[g];
}

/** DEMO-ONLY: what a student had done by the end of an earlier school year.
 *  There are no stored year-end snapshots yet, so an earlier year counts a
 *  steady, seeded subset of what each student has done now (about one in
 *  nine fewer per year back). Every number therefore grows toward today,
 *  and a drill from an earlier year still lists real students, the same
 *  ones its count includes. */
export function doneBy(s: CounselorStudent, key: string, back: number): boolean {
  return back <= 0 || seedHash(`${s.id}:${key}`) % 100 >= back * 11;
}

/** On Track to Graduate needs the SIS (9 Oct 2026, Maisha: "Only show On
 *  Track to Graduate if the necessary SIS/student data is actually
 *  available"). True only when the SIS integration is connected. */
export function sisConnected(): boolean {
  return INTEGRATIONS.some((i) => i.kind.startsWith("OneRoster") && i.status === "connected");
}

// ---- the scope ------------------------------------------------------------------

export function useInsightsScope() {
  const filter = useInsightsFilter();
  const all = useReviewedRoster();
  return useMemo(() => {
    const year = SCHOOL_YEARS.find((y) => y.key === filter.year) ?? SCHOOL_YEARS[0];
    const roster = all.filter((s) => (filter.grade === "all" || s.grade === Number(filter.grade)) && (filter.group === "all" || inGroup(s, filter.group)));
    const parts = [filter.grade !== "all" ? `Grade ${filter.grade}` : "", filter.group !== "all" ? filter.group : ""].filter(Boolean);
    return {
      filter,
      all,
      roster,
      year,
      back: year.back,
      current: year.back === 0,
      /** "Grade 12 · AVID" or "" when unscoped: drill subtitles name it */
      scopeLabel: parts.join(" · "),
      /** "All my students" or the scope, for empty states */
      who: parts.length ? parts.join(", ") : "my students",
    };
  }, [all, filter]);
}

export type InsightsScope = ReturnType<typeof useInsightsScope>;

export const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
