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
  // The detail page's sections (3 Oct 2026, Joshua's redesign after
  // Scholarship America's own page): each read from the provider's official
  // page, null when it does not say. Optional so a record without them
  // still renders; the section is simply left out.
  /** what the money can pay for; null when the provider does not say */
  levels?: Level[] | null;
  /** the rules as short plain bullets, one rule each */
  eligibilityBullets?: string[] | null;
  /** how many are given, as the provider states it ("105 scholarships") */
  awardCount?: string | null;
  /** one sentence: one time or renewable, paid to the school, over how long */
  payout?: string | null;
  /** what the winners are picked on, as the provider lists it */
  selectedOn?: string[] | null;
  /** one sentence: when or how winners hear */
  notification?: string | null;
  /** one sentence: what a winner must do after winning; null when nothing */
  obligations?: string | null;
};

/** What a scholarship can pay for (Joshua, 3 Oct 2026: a "Level of Study"
 *  filter). His list came from a site for every age (Graduate Degree,
 *  Professional Development); a high-school student's real choice is these
 *  three, named the way an 8th grader would. */
export type Level = "4-year" | "2-year" | "trade";
export const LEVELS: Level[] = ["4-year", "2-year", "trade"];
export const LEVEL: Record<Level, { label: string; note: string }> = {
  "4-year": { label: "4-year college", note: "A bachelor's degree" },
  "2-year": { label: "2-year college", note: "Community college or an associate degree" },
  trade: { label: "Trade school", note: "Technical school, a certificate or an apprenticeship" },
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
  /** career slugs it leads to most directly; a career page shows these first */
  careers?: string[];
  // The detail page's "at a glance" and "what you'll do" (3 Oct 2026, after
  // Handshake's job page): read from the official page, null when unstated.
  /** two to four plain bullets on what a student actually does there */
  whatYouDo?: string[] | null;
  /** "Full-time, 6 weeks", "Part-time" */
  schedule?: string | null;
  /** "In person", "Online", "Hybrid" */
  setting?: string | null;
  /** the pay as stated, "$16.50 an hour" */
  pay?: string | null;
};

export type Item = ({ type: "scholarship" } & Scholarship) | ({ type: "program" } & Program);
