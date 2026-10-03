// The list an opportunity was opened from (3 Oct 2026), kept in
// sessionStorage between the list and the detail page: the page steps
// through `ids` ("3 of 24"), and Back puts the tab, filters, sort and scroll
// back exactly as they were. Only Back: a browser back (popstate, noted
// below) or the page's own link to its list (markReturning). A plain visit
// to Opportunities starts fresh.

import type { Field, Level } from "./types";

export const RETURN_KEY = "dm-opportunities-list";

export type ListReturn = {
  tab: "scholarships" | "programs" | "internships";
  closes: "any" | "month" | "3mo" | "later";
  fields: Field[];
  kinds: string[];
  levels: Level[];
  amount: 0 | 1000 | 5000 | 20000 | "full";
  cost: ("free" | "paid" | "tuition")[];
  grade: number | null;
  school: string | null;
  sort: "fit" | "closing" | "amount" | "az";
  laterOpen: boolean;
  y: number;
  ids: string[];
  label: string;
};

export function readListReturn(): ListReturn | null {
  try { return JSON.parse(window.sessionStorage.getItem(RETURN_KEY) ?? "null") as ListReturn | null; } catch { return null; }
}

let lastPop = 0;
if (typeof window !== "undefined") window.addEventListener("popstate", () => { lastPop = Date.now(); });

/** The detail page's own link back to its list counts as Back. */
export function markReturning() {
  try { window.sessionStorage.setItem(`${RETURN_KEY}:back`, String(Date.now())); } catch { /* the list just starts fresh */ }
}

/** True once, right after Back. */
export function consumeReturning(): boolean {
  let marked = 0;
  try { marked = Number(window.sessionStorage.getItem(`${RETURN_KEY}:back`) ?? 0); window.sessionStorage.removeItem(`${RETURN_KEY}:back`); } catch { /* nothing marked */ }
  const now = Date.now();
  return now - lastPop < 3000 || now - marked < 3000;
}
