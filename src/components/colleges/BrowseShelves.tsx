"use client";

import { useMemo, useSyncExternalStore } from "react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { primaryCareerId } from "@/components/profile/data";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { COLLEGES, type College } from "./data";
import { SchoolCard } from "./shared";
import { HOME_STATE, pathwayFor, programMatcher, offersProgram } from "./pathway";

// Browse all, at rest (no search, no filters): shelves by the questions a
// student actually asks, so the long tail has shape. Each school appears on
// ONE shelf only (the brief: "show depth without repeating the same schools
// across every category"), and the trade shelf exists only when the
// student's career has a trade route. Searching or filtering replaces the
// shelves with the flat grid.

const DEMO_TOP3 = ["investment-banking", "registered-nurse", "software-engineer"];
const PER_SHELF = 8;

export function BrowseShelves({
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
  const careerId = primaryCareerId(picks) ?? DEMO_TOP3[0];
  const pathway = useMemo(() => pathwayFor(careerId), [careerId]);

  const shelves = useMemo(() => {
    const used = new Set<string>();
    const take = (list: College[]) => {
      const out: College[] = [];
      for (const c of list) {
        if (used.has(c.slug)) continue;
        used.add(c.slug);
        out.push(c);
        if (out.length >= PER_SHELF) break;
      }
      return out;
    };
    const byFinish = (a: College, b: College) => (b.finish ?? -1) - (a.finish ?? -1);
    const home = [...COLLEGES].filter((c) => c.state === HOME_STATE || profile.states.some((s) => s.toLowerCase() === c.stateName.toLowerCase())).sort(byFinish);
    const rx = pathway ? programMatcher(pathway) : null;
    const offers = rx ? COLLEGES.filter((c) => offersProgram(c, rx)).sort(byFinish) : [];
    const cheap = COLLEGES.filter((c) => c.netPrice !== null && c.netPrice < 15000).sort((a, b) => (a.netPrice ?? 0) - (b.netPrice ?? 0));
    const trade = COLLEGES.filter((c) => c.level === "Certificates").sort(byFinish);
    const open = COLLEGES.filter((c) => c.admission === "open").sort(byFinish);
    const rest = [...COLLEGES].sort(byFinish);

    const list: { key: string; title: string; note?: string; items: College[] }[] = [];
    // Shelf names from the Replit's Browse all / filter taxonomy.
    if (pathway) list.push({ key: "program", title: `Schools with ${pathway.program}`, items: take(offers) });
    list.push({ key: "near", title: "Near you", items: take(home) });
    list.push({ key: "cheap", title: "Lower-cost options", items: take(cheap) });
    if (pathway?.trade) list.push({ key: "trade", title: "Trade & technical", items: take(trade) });
    list.push({ key: "open", title: "High acceptance", items: take(open) });
    list.push({ key: "more", title: "More schools for your path", items: take(rest) });
    return list.filter((s) => s.items.length > 0);
  }, [pathway, profile.states]);

  return (
    <div className="flex flex-col gap-[var(--space-7)]">
      {shelves.map((shelf) => (
        <section key={shelf.key} className="flex flex-col gap-[var(--space-3)]">
          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
            <h2 className="min-w-0 text-[20px] leading-[24px] font-extrabold sm:text-[22px] sm:leading-[26px]" style={{ fontFamily: "var(--font-display)" }}>{shelf.title}</h2>
            <span className="flex-none text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>{shelf.items.length} {shelf.items.length === 1 ? "school" : "schools"}</span>
          </div>
          <ul className="dreamari-card-rail -mx-5 -my-[28px] flex list-none gap-[var(--space-4)] overflow-x-auto px-5 py-[28px] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" aria-label={shelf.title}>
            {shelf.items.map((c) => (
              <li key={c.slug} className="w-[min(86vw,320px)] flex-none">
                <SchoolCard c={c} saved={saved.has(c.slug)} onSave={() => onSave(c.slug)} compared={compare.includes(c.slug)} onCompare={() => onCompare(c.slug)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
