// The caseload as the school's student system sends it (7 Oct 2026:
// "rostering from the school's student system"). Shape follows OneRoster
// (enrollments with a beginDate and endDate). DEMO-ONLY: a nightly sync is
// simulated with seeded changes; production pulls from PowerSchool, Infinite
// Campus or Skyward through the district's OneRoster endpoint.

import { createLocalRecord } from "./localRecord";

export type RosterChange = { id: string; kind: "in" | "out" | "moved"; name: string; grade: number; detail: string; daysAgo: number };

export const ROSTER_SOURCE = { system: "PowerSchool", via: "OneRoster 1.2", schedule: "Every night at 5:00 AM" };

const SEED: RosterChange[] = [
  { id: "rc-1", kind: "in", name: "Ana Ruiz", grade: 10, detail: "Transferred in from Edison High School, assigned to you", daysAgo: 1 },
  { id: "rc-2", kind: "in", name: "Kwame Mensah", grade: 9, detail: "New enrollment, assigned to you", daysAgo: 3 },
  { id: "rc-3", kind: "out", name: "Jake Morrison", grade: 11, detail: "Transferring to Brookfield Academy on Oct 18", daysAgo: 2 },
  { id: "rc-4", kind: "moved", name: "Fatima Al-Rashid", grade: 12, detail: "Moved to Daniel Okafor's caseload (last name change)", daysAgo: 4 },
];

const store = createLocalRecord<{ syncedAt: string | null; reviewed: string[] }>("dreamari-counselor-roster-sync", { syncedAt: null, reviewed: [] });

export function useRosterSync() {
  const s = store.useValue();
  const last = s.syncedAt ? new Date(s.syncedAt) : (() => { const d = new Date(); d.setHours(5, 0, 0, 0); return d; })();
  return { lastSync: last, changes: SEED, reviewed: s.reviewed };
}

export function syncNow(): void {
  store.update((s) => ({ ...s, syncedAt: new Date().toISOString() }));
}

export function markReviewed(id: string): void {
  store.update((s) => ({ ...s, reviewed: [...new Set([...s.reviewed, id])] }));
}
