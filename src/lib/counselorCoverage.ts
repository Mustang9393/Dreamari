// Covering for an absent teammate (7 Oct 2026: "a coverage mode for an
// absent counselor"). Cover is for one school day; their students join
// yours in the directory's Caseload filter and a banner says so on Home and
// Students. DEMO-ONLY store; production reads absences from the school's
// staff calendar and grants access for the day.

import { createLocalRecord } from "./localRecord";

export type Coverage = { name: string; day: string };
const store = createLocalRecord<Coverage | null>("dreamari-counselor-coverage", null);
const today = () => new Date().toISOString().slice(0, 10);

export function useCoverage(): Coverage | null {
  const c = store.useValue();
  return c && c.day === today() ? c : null;
}

export function startCoverage(name: string): void {
  store.update(() => ({ name, day: today() }));
}

export function endCoverage(): void {
  store.update(() => null);
}
