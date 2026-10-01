"use client";

// The Opportunities shelf of the Profile's Saved (1 Oct 2026). Chandu:
// "let's have a central place for saved, and with every relevant
// interaction train the students to reach the saved and learn where it
// lives." So the Opportunities tab has no Saved view of its own; a Save
// there lands here, and the confirmation says so with a way here.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { opportunityStore, setOpportunityStatus } from "@/lib/opportunities";
import { Card, type Enriched } from "./Card";
import { INTERNSHIP_ITEMS, PROGRAM_ITEMS, SCHOLARSHIP_ITEMS } from "./data";
import { fitFor, timing, today, useStudent } from "./match";

export function useSavedOpportunityCount(): number {
  const r = opportunityStore.useValue();
  return Object.keys(r.status).length;
}

export function OpportunitiesShelf() {
  const router = useRouter();
  const record = opportunityStore.useValue();
  const student = useStudent();
  const [todayIso] = useState(() => today());
  const all = [...SCHOLARSHIP_ITEMS, ...PROGRAM_ITEMS, ...INTERNSHIP_ITEMS];
  const rows: Enriched[] = Object.entries(record.status)
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .map(([id]) => all.find((i) => i.id === id))
    .filter((i): i is Enriched["item"] => !!i)
    .map((item) => ({ item, fit: fitFor(item, student), time: timing(item, todayIso) }));
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">Nothing saved yet. Tap the bookmark on any scholarship, program or internship and it shows up here.</p>
        <Link href="/opportunities" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>See opportunities</Link>
      </div>
    );
  }
  const tabOf = (e: Enriched) => (e.item.type === "scholarship" ? "scholarships" : e.item.kind === "internship" || e.item.kind === "apprenticeship" ? "internships" : "programs");
  return (
    <ul className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((e) => (
        <li key={e.item.id} className="min-w-0">
          <Card e={e} status={record.status[e.item.id]?.status ?? null} onOpen={() => router.push(`/opportunities?tab=${tabOf(e)}&open=${e.item.id}`)} onSave={() => setOpportunityStatus(e.item.id, record.status[e.item.id] ? null : "saved")} />
        </li>
      ))}
    </ul>
  );
}
