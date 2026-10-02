"use client";

// Related opportunities on School and Career detail (1 Oct 2026; Chandu:
// "add sections to the college/career details listing some of these as
// related opportunities"). A school shows scholarships a student there
// could use (open everywhere, or in that school's state); a career shows
// programs in its field. Three cards in the same rail Similar Schools
// uses, then the way to the whole list. Opening a card lands on the
// item's own page.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { College } from "@/components/colleges/data";
import { SOFT } from "@/components/colleges/shared";
import { opportunityStore, setOpportunityStatus } from "@/lib/opportunities";
import { Card, type Enriched } from "./Card";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "./data";
import { fitFor, timing, today, useStudent, worldToField } from "./match";
import type { Item } from "./types";

function useRelated(items: Item[], keep: (e: Enriched) => boolean, first?: (e: Enriched) => boolean): Enriched[] {
  const student = useStudent();
  const [todayIso] = useState(() => today());
  const rows = items.map((item) => ({ item, fit: fitFor(item, student), time: timing(item, todayIso) })).filter((e) => e.fit.when !== "no" && keep(e));
  const lead = (e: Enriched) => (first?.(e) ? 0 : 1);
  rows.sort((a, b) => lead(a) - lead(b) || (a.fit.when === b.fit.when ? b.fit.score - a.fit.score : a.fit.when === "now" ? -1 : 1));
  return rows.slice(0, 3);
}

function Rail({ rows, tab, more }: { rows: Enriched[]; tab: "scholarships" | "programs"; more: { href: string; label: string } }) {
  const router = useRouter();
  const record = opportunityStore.useValue();
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <ul className="dreamari-card-rail -mx-5 flex list-none gap-[var(--space-4)] overflow-x-auto px-5 py-[6px] sm:-mx-6 sm:px-6" aria-label={more.label}>
        {rows.map((e) => (
          <li key={e.item.id} className="w-[min(84vw,320px)] flex-none">
            <Card e={e} status={record.status[e.item.id]?.status ?? null} onOpen={() => router.push(`/opportunities?tab=${e.item.type === "program" && (e.item.kind === "internship" || e.item.kind === "apprenticeship") ? "internships" : tab}&open=${e.item.id}`)} onSave={() => setOpportunityStatus(e.item.id, record.status[e.item.id] ? null : "saved")} />
          </li>
        ))}
      </ul>
      <Link href={more.href} className="dm-link flex w-fit items-center gap-[4px] text-[14px] leading-[20px] font-bold" style={{ color: SOFT }}>{more.label} <ChevronRight className="h-4 w-4" aria-hidden /></Link>
    </div>
  );
}

/** Scholarships a student at this school could use. Null when none fit. */
export function RelatedScholarships({ college }: { college: College }) {
  const rows = useRelated(SCHOLARSHIP_ITEMS, (e) => e.item.states.includes("Any") || e.item.states.includes(college.state));
  if (!rows.length) return null;
  return <Rail rows={rows} tab="scholarships" more={{ href: `/opportunities?tab=scholarships&school=${college.slug}`, label: "All scholarships you could use here" }} />;
}

/** Programs and internships in this career's field, the ones that lead to
 *  this exact career first. Null when none fit. */
export function RelatedPrograms({ world, career }: { world: string; career?: string }) {
  const field = worldToField(world);
  const rows = useRelated(
    [...INTERNSHIP_ITEMS, ...PROGRAM_ITEMS],
    (e) => !!field && e.item.fields.includes(field),
    (e) => !!career && e.item.type === "program" && !!e.item.careers?.includes(career),
  );
  if (!field || !rows.length) return null;
  return <Rail rows={rows} tab="programs" more={{ href: `/opportunities?tab=programs&field=${encodeURIComponent(field)}`, label: `All ${field} programs` }} />;
}
