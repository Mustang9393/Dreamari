// Opportunities (1 Oct 2026): the two things the tab holds. Every record is
// a REAL scholarship or program, with its facts read from the provider's own
// page on `verifiedOn` (Chandu: "use real data to populate these tabs");
// nothing is invented, and a fact the page did not state is null, never
// guessed. See docs/reference/schoolinks-scholarships-and-applications-notes-2026-10.md.

export type Field = "Tech & Engineering" | "Business & Finance" | "Health & Medicine" | "Arts & Media" | "Public Service & Law" | "Skilled Trades" | "Science & Research" | "Any";
export const FIELDS: Exclude<Field, "Any">[] = ["Tech & Engineering", "Business & Finance", "Health & Medicine", "Science & Research", "Arts & Media", "Public Service & Law", "Skilled Trades"];

export type ScholarshipKind = "need" | "merit" | "field" | "identity" | "local" | "trade" | "arts" | "service" | "athletic";
/** Plain words for the kinds (8th-grade reading level, no jargon). */
export const SCHOLARSHIP_KIND: Record<ScholarshipKind, { label: string; note: string }> = {
  need: { label: "Based on family income", note: "For students whose families need help paying" },
  merit: { label: "Based on grades and activities", note: "Strong grades, leadership or test scores" },
  field: { label: "For a career field", note: "Tied to what you want to study" },
  identity: { label: "For who you are", note: "Background, heritage or first in your family" },
  local: { label: "New Jersey only", note: "State programs and local awards" },
  trade: { label: "For the trades", note: "Trade school, apprenticeships and technical programs" },
  arts: { label: "For artists", note: "Visual arts, music, writing, film and design" },
  service: { label: "For volunteers", note: "Community service and leadership" },
  athletic: { label: "For athletes", note: "Student athletes" },
};

export type Scholarship = {
  id: string;
  name: string;
  provider: string;
  /** exactly as the provider states it, e.g. "$20,000" or "Full cost of attendance" */
  amount: string;
  /** the largest total award in dollars, for sorting and the amount filter; null when the page gives no number */
  amountMax: number | null;
  renewable: boolean | null;
  kind: ScholarshipKind;
  fields: Field[];
  /** high-school grades that can apply */
  grades: number[];
  /** ["Any"] or state codes */
  states: string[];
  needBased: boolean | null;
  minGpa: number | null;
  eligibility: string;
  requires: string[];
  opens: string | null;
  /** ISO date of the cycle the provider shows; may be last cycle's, see deadlineNote */
  deadline: string | null;
  deadlineNote: string | null;
  url: string;
  verifiedOn: string;
  notes?: string | null;
};

export type ProgramKind = "internship" | "summer" | "fellowship" | "competition" | "apprenticeship" | "leadership";
export const PROGRAM_KIND: Record<ProgramKind, { label: string; note: string }> = {
  internship: { label: "Internship", note: "Work at a real company or lab" },
  summer: { label: "Summer program", note: "A few weeks on a campus or online" },
  fellowship: { label: "Fellowship", note: "A longer program with mentors" },
  competition: { label: "Competition", note: "Build or make something and win" },
  apprenticeship: { label: "Apprenticeship", note: "Learn a trade while you earn" },
  leadership: { label: "Leadership", note: "Seminars and leadership weekends" },
};
export type Paid = "paid" | "free" | "stipend" | "tuition" | "unknown";
export const PAID: Record<Paid, string> = { paid: "Pays you", stipend: "Pays you", free: "Free", tuition: "Has tuition", unknown: "Pay not listed" };

export type Program = {
  id: string;
  name: string;
  org: string;
  kind: ProgramKind;
  paid: Paid;
  costNote: string | null;
  fields: Field[];
  /** high-school grades that can apply; [] means college students only */
  grades: number[];
  states: string[];
  location: string;
  when: string | null;
  eligibility: string;
  requires: string[];
  opens: string | null;
  deadline: string | null;
  deadlineNote: string | null;
  url: string;
  verifiedOn: string;
  notes?: string | null;
  /** set when a Connect partner posted it (SchooLinks: "Posted by your district") */
  postedBy?: { org: string; boardId: string };
};

export type Item = ({ type: "scholarship" } & Scholarship) | ({ type: "program" } & Program);
