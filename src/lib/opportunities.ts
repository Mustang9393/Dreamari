// The student's own record for Opportunities (1 Oct 2026): which
// scholarships and programs they saved, applied to, won or passed on.
// One store, so a Save from Connect's Updates, from a school's page or from
// the Opportunities tab all land in the same list, and My Plan's "Apply to
// 5 internships or programs" can count real applications instead of a
// self-reported checkbox (studentSignals.programsApplied). Same helper as
// the counselor v3 stores; a backend replaces it with an API.

import { createLocalRecord } from "./localRecord";

export type OpportunityStatus = "saved" | "applied" | "won" | "passed";
export type FafsaStatus = "not-started" | "in-progress" | "submitted";

export type OpportunityRecord = {
  status: Record<string, { status: OpportunityStatus; at: string }>;
  fafsa: FafsaStatus;
};

export const OPPORTUNITIES_KEY = "dreamari-opportunities";
const EMPTY: OpportunityRecord = { status: {}, fafsa: "not-started" };

export const opportunityStore = createLocalRecord<OpportunityRecord>(OPPORTUNITIES_KEY, EMPTY);

export function setOpportunityStatus(id: string, status: OpportunityStatus | null) {
  opportunityStore.update((prev) => {
    const next = { ...prev.status };
    if (status === null) delete next[id];
    else next[id] = { status, at: new Date().toISOString() };
    return { ...prev, status: next };
  });
}

export function setFafsaStatus(fafsa: FafsaStatus) {
  opportunityStore.update((prev) => ({ ...prev, fafsa }));
}

/** How many ids (of the given set, or all) the student marked applied or won. */
export function countApplied(ids?: Set<string>): number {
  const r = opportunityStore.read();
  return Object.entries(r.status).filter(([id, s]) => (s.status === "applied" || s.status === "won") && (!ids || ids.has(id))).length;
}
