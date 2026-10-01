// The lists Opportunities shows. Scholarships and programs are real, read
// from each provider's page (see types.ts). Partner postings come from
// Connect's own Updates (the same JPMorgan, Goldman, Amazon, Google, EY and
// Morgan Stanley posts), so a partner's internship appears here under
// "Posted by", one tap from the tab, instead of four taps into a board
// (Joshua, 30 Sept 2026: "I had to click Connect, Communities, Finance,
// then Updates, and even then it's not clear the opportunity was there").

import { OPPORTUNITIES as CONNECT_POSTS } from "@/components/connect/data";
import { SCHOLARSHIPS } from "./scholarships";
import { PROGRAMS } from "./programs";
import type { Field, Item, Program, ProgramKind } from "./types";

const BOARD_FIELD: Record<string, Field[]> = { "business-money": ["Business & Finance"], "tech-engineering": ["Tech & Engineering"], "event-ey": ["Business & Finance"] };

function postedKind(kind: string): ProgramKind {
  const k = kind.toLowerCase();
  if (k.includes("fellow")) return "fellowship";
  if (k.includes("summer") || k.includes("workshop") || k.includes("program")) return "summer";
  return "internship";
}
function postedGrades(eligibility: string): number[] {
  const e = eligibility.toLowerCase();
  if (e.includes("college") || e.includes("sophomore") || e.includes("undergrad") || e.includes("university")) return [];
  if (e.includes("senior") && e.includes("junior")) return [11, 12];
  if (e.includes("senior")) return [12];
  if (e.includes("junior")) return [11];
  return [9, 10, 11, 12];
}
function postedDeadline(s: string): { deadline: string | null; note: string | null } {
  const t = Date.parse(s);
  if (!Number.isNaN(t)) { const d = new Date(t); return { deadline: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, note: null }; }
  return { deadline: null, note: s };
}

export const PARTNER_POSTS: Program[] = CONNECT_POSTS.map((o) => {
  const dl = postedDeadline(o.deadline);
  const body = o.body.toLowerCase();
  return {
    id: `post-${o.id}`,
    name: o.title,
    org: o.org,
    kind: postedKind(o.kind),
    paid: body.includes("paid") ? "paid" : "unknown",
    costNote: body.includes("paid") ? "Paid" : null,
    fields: BOARD_FIELD[o.boardId] ?? ["Any"],
    grades: postedGrades(o.eligibility),
    states: ["Any"],
    location: o.location,
    when: null,
    eligibility: o.eligibility,
    requires: [],
    opens: null,
    deadline: dl.deadline,
    deadlineNote: dl.note,
    url: /^https?:/.test(o.sourceLabel) ? o.sourceLabel : `https://${o.sourceLabel}`,
    verifiedOn: o.verifiedDate.replace("Verified ", ""),
    postedBy: { org: o.org, boardId: o.boardId },
  };
});

export const SCHOLARSHIP_ITEMS: Item[] = SCHOLARSHIPS.map((s) => ({ type: "scholarship" as const, ...s }));
export const PROGRAM_ITEMS: Item[] = [...PROGRAMS, ...PARTNER_POSTS].map((p) => ({ type: "program" as const, ...p }));
