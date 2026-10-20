"use client";

// v7 Opportunities' catalog (20 Oct 2026). The Replit's shelves are Part-time
// jobs, Volunteer, Career events, Summer programs and Internships. Internships,
// apprenticeships and summer programs are the student Opportunities tab's
// real, verified records (components/opportunities). The student catalog has
// no part-time jobs, volunteering or career events yet, so those three
// shelves carry the Replit's own listings, seeded below.
//
// DEMO-ONLY: SEEDED_* listings are the Replit's examples (local employers,
// food banks, career days), not verified records. Production reads them from
// the district's own posts (Connect partner posts already flow in as
// `postedBy` programs) and a jobs/volunteer feed.

import { INTERNSHIP_ITEMS, PROGRAM_ITEMS } from "@/components/opportunities/data";
import type { Enriched } from "@/components/opportunities/Card";
import { timing } from "@/components/opportunities/match";
import type { Field, Item, Program } from "@/components/opportunities/types";
import type { CounselorStudent } from "@/lib/counselorRoster";

export type ShelfKey = "jobs" | "volunteer" | "events" | "summer" | "internships" | "apprenticeships";
export const SHELVES: { key: ShelfKey; title: string }[] = [
  { key: "events", title: "Career events" },
  { key: "internships", title: "Internships" },
  { key: "summer", title: "Summer programs" },
  { key: "apprenticeships", title: "Apprenticeships" },
  { key: "jobs", title: "Part-time jobs" },
  { key: "volunteer", title: "Volunteer" },
];

export type Opp = { e: Enriched; shelf: ShelfKey; kindLabel?: string; /** what a counselor reads in the sheet */ about: string; format: string | null };

// student-app career worlds to the catalog's fields (v5 HomeExtras' map)
export const FIELD_FOR: Record<string, Field> = {
  "Tech & Engineering": "Tech & Engineering",
  "Business & Finance": "Business & Finance",
  "Health & Medicine": "Health & Medicine",
  "Science & Research": "Science & Research",
  "Arts, Media & Sport": "Arts & Media",
  "Law, Safety & Justice": "Public Service & Law",
  "Building & Construction": "Skilled Trades",
  "Fixing Machines & Engines": "Skilled Trades",
  "Factories & Making Things": "Skilled Trades",
  "Driving, Flying & Shipping": "Skilled Trades",
};

type Seed = { id: string; name: string; org: string; location: string; deadline: string; fields: Field[]; grades: number[]; about: string; apply: string; format?: string };

const seed = (kindLabel: string, shelf: ShelfKey, s: Seed): { program: Program; kindLabel: string; shelf: ShelfKey; about: string; format: string } => ({
  shelf,
  kindLabel,
  about: s.about,
  format: s.format ?? "In person",
  program: {
    id: `v7-${s.id}`, name: s.name, org: s.org,
    // the kind only feeds the student tab's filters, which never see these
    kind: "leadership", paid: shelf === "jobs" ? "paid" : "free", costNote: null,
    fields: s.fields, grades: s.grades, states: ["NJ"], location: s.location, when: null,
    eligibility: "Students who are curious about this field and can meet the listed schedule.",
    requires: [s.apply], opens: null, deadline: s.deadline, deadlineNote: null, url: "", verifiedOn: "",
    setting: s.format ?? "In person",
  },
});

// DEMO-ONLY: the Replit's listings (see the header).
const SEEDED = [
  seed("Career event", "events", { id: "jpm-day", name: "JPMorgan Career Exploration Day", org: "JPMorgan Chase", location: "New York, NY", deadline: "2026-11-12", fields: ["Business & Finance"], grades: [10, 11, 12], about: "A day inside a global bank: talks with analysts, a trading floor visit and a resume workshop.", apply: "Short online form and a teacher reference." }),
  seed("Job shadow", "events", { id: "hmh-shadow", name: "Hackensack Meridian Health Job Shadow", org: "Hackensack Meridian Health", location: "Hackensack, NJ", deadline: "2026-11-18", fields: ["Health & Medicine"], grades: [11, 12], about: "Follow a nurse or therapist for a morning and see a real hospital shift.", apply: "Online form, health forms and a parent signature." }),
  seed("Info session", "events", { id: "elec-info", name: "Electrical Apprenticeship Info Session", org: "Newark Workforce Partners", location: "Newark, NJ", deadline: "2026-11-22", fields: ["Skilled Trades"], grades: [11, 12], about: "Meet working electricians and learn how a paid apprenticeship starts after high school.", apply: "RSVP online." }),
  seed("Career event", "events", { id: "tech-day", name: "Technology Career Day", org: "Newark Tech Collaborative", location: "Newark, NJ", deadline: "2026-12-10", fields: ["Tech & Engineering"], grades: [9, 10, 11, 12], about: "Hands-on stations with local software, data and robotics teams.", apply: "RSVP online." }),
  seed("Career event", "events", { id: "media-panel", name: "Media & Entertainment Career Panel", org: "Garden State Media Lab", location: "Newark, NJ", deadline: "2026-12-12", fields: ["Arts & Media"], grades: [9, 10, 11, 12], about: "Animators, editors and producers talk about how they got started.", apply: "RSVP online.", format: "Hybrid" }),
  seed("Part-time job", "jobs", { id: "retail", name: "Retail Associate", org: "Maple Street Market", location: "Newark, NJ", deadline: "2026-12-14", fields: ["Business & Finance"], grades: [10, 11, 12], about: "Help customers, stock seasonal items and learn day-to-day retail. Weekend shifts available.", apply: "Apply with a short resume at the store." }),
  seed("Part-time job", "jobs", { id: "library", name: "Library Assistant", org: "Newark Public Library", location: "Newark, NJ", deadline: "2026-12-18", fields: ["Public Service & Law"], grades: [10, 11, 12], about: "Shelve books, help visitors find what they need and run the kids' reading hour.", apply: "Online application." }),
  seed("Part-time job", "jobs", { id: "rec", name: "Recreation Center Assistant", org: "Jersey City Recreation", location: "Jersey City, NJ", deadline: "2026-12-20", fields: ["Health & Medicine"], grades: [10, 11, 12], about: "Run after-school games and help coaches with youth leagues.", apply: "Online application and an interview." }),
  seed("Part-time job", "jobs", { id: "youth", name: "Youth Program Assistant", org: "Boys & Girls Club of Newark", location: "Newark, NJ", deadline: "2027-01-04", fields: ["Public Service & Law"], grades: [11, 12], about: "Help with homework, snacks and activities for younger kids.", apply: "Online application and a background check." }),
  seed("Volunteer", "volunteer", { id: "foodbank", name: "Community Food Bank Volunteer", org: "Community FoodBank of NJ", location: "Hillside, NJ", deadline: "2026-12-09", fields: ["Public Service & Law"], grades: [9, 10, 11, 12], about: "Sort and pack food for families across the state. Counts toward service hours.", apply: "Sign up for a shift online." }),
  seed("Volunteer", "volunteer", { id: "hospital-vol", name: "Hospital Volunteer Program", org: "Hackensack Meridian Health", location: "Hackensack, NJ", deadline: "2026-12-16", fields: ["Health & Medicine"], grades: [10, 11, 12], about: "Greet patients, run the gift cart and help nurses with non-medical tasks.", apply: "Online form, health forms and an orientation." }),
  seed("Volunteer", "volunteer", { id: "shelter", name: "Animal Shelter Volunteer", org: "Newark Animal Shelter", location: "Newark, NJ", deadline: "2026-12-19", fields: ["Science & Research"], grades: [9, 10, 11, 12], about: "Walk dogs, socialize cats and help at adoption days.", apply: "Sign up online and attend one training." }),
  seed("Volunteer", "volunteer", { id: "cleanup", name: "Neighborhood Clean-Up Crew", org: "Passaic River Coalition", location: "Newark, NJ", deadline: "2026-12-13", fields: ["Science & Research"], grades: [9, 10, 11, 12], about: "Clean up parks and the riverbank, and test water quality with scientists.", apply: "Sign up for a Saturday online." }),
];

const toEnriched = (item: Item, todayIso: string): Enriched => ({ item, fit: { when: "now", score: 0, reasons: [], checks: [] }, time: timing(item, todayIso) });

/** Every open listing a high schooler can join, soonest deadline first. */
export function catalog(todayIso: string): Opp[] {
  const real: Opp[] = [...INTERNSHIP_ITEMS, ...PROGRAM_ITEMS]
    .filter((p): p is Extract<Item, { type: "program" }> => p.type === "program" && p.grades.some((g) => g >= 9))
    .flatMap((p) => {
      const shelf: ShelfKey | null = p.kind === "internship" ? "internships" : p.kind === "apprenticeship" ? "apprenticeships" : p.kind === "summer" ? "summer" : null;
      if (!shelf) return [];
      return [{ e: toEnriched(p, todayIso), shelf, about: p.whatYouDo?.join(" ") ?? p.eligibility, format: p.setting ?? null }];
    });
  const seeded: Opp[] = SEEDED.map((x) => ({ e: toEnriched({ type: "program", ...x.program }, todayIso), shelf: x.shelf, kindLabel: x.kindLabel, about: x.about, format: x.format }));
  return [...seeded, ...real]
    .filter((o) => o.e.time.status !== "closed")
    .sort((a, b) => (a.e.time.days ?? 999) - (b.e.time.days ?? 999));
}

/** The caseload students a listing fits: their world maps to its field and
 *  their grade can apply. */
export function matchesFor(o: Opp, roster: CounselorStudent[]): CounselorStudent[] {
  const item = o.e.item;
  return roster.filter((s) => {
    const f = FIELD_FOR[s.careerTrack];
    return f && item.fields.includes(f) && (item.grades.length === 0 || item.grades.includes(s.grade));
  });
}
