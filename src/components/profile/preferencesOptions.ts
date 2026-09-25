// Option lists for My Profile > Preferences, in the reference's vocabulary
// (dceeai.replit.app/my-profile#preferences, 25 Sept 2026) with Joshua's
// selection limits. Career-specific suggestions (skills, software, roles)
// come from the data the app already holds for that career.

import { EDUCATION_OPTIONS, INTEREST_WORLDS, SUBJECTS } from "@/components/build/types";
import { US_STATES } from "@/lib/studentProfile";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { DECK } from "@/components/match-lab/data";
import { careerProfile } from "@/components/career/profiles";
import { reportV2 } from "@/components/profile/report-data";
import { CAREER_EXTRAS } from "@/components/career/data";
import { careerSlug } from "@/components/career/slug";

export const INDUSTRY_OPTIONS = INTEREST_WORLDS.map((w) => w.label);
// Build's list plus the reference's extras; a student's Build answers stay valid.
export const SUBJECT_OPTIONS = Array.from(new Set([...SUBJECTS, "Statistics", "Economics", "Writing"]));
export const WORK_WITH = ["Independent", "Mix of both", "With a team"];
export const PACE = ["Fast-paced", "Balanced", "Steady"];
export const STRUCTURE = ["Structured", "Flexible", "Mix of both"];
export const TEAM_SIZE = ["Mostly solo", "Small team", "Medium team", "Large team"];
export const ENVIRONMENTS = ["Office", "Remote", "Outdoors", "Lab", "Hospital or clinic", "Workshop or job site", "Classroom", "Studio"];
export const GPA_TYPES: { id: string; label: string }[] = [{ id: "weighted", label: "Weighted" }, { id: "unweighted", label: "Unweighted" }, { id: "unsure", label: "Not sure" }];
export const EDUCATION_LEVELS = EDUCATION_OPTIONS.map((o) => o.title);
// Joshua's own examples for "skills I want to build" (Slack, 25 Sept 2026).
export const SKILL_OPTIONS = ["Leadership", "Coding", "Public speaking", "Financial analysis", "Writing", "Design", "Problem solving", "Teamwork", "Research", "Data analysis", "Time management", "Negotiation"];
export const PATHWAYS = ["Trade / Certificate", "2-Year College", "4-Year College", "Graduate / Professional", "Not sure"];
export const DISTANCES = ["25 miles", "50 miles", "100 miles", "Best opportunity"];
export const BUDGETS = ["Up to $10,000/year", "Up to $25,000/year", "Up to $50,000/year", "Over $50,000/year", "Need to explore financial aid"];
export const SCHOOL_TYPES = ["4-Year College", "Community College", "Trade School", "Apprenticeship / Training Program"];
export const CAMPUS = ["City", "Suburban", "Rural"];
export const SIZES = ["Small", "Medium", "Large"];
export const OPPORTUNITY_TYPES = ["Internship", "Summer Job", "Part-Time", "Apprenticeship", "Full-Time"];
export const WORK_MODES = ["In-person", "Hybrid", "Remote"];
export const RELOCATE = ["Yes", "Maybe", "No"];
export const STATES = US_STATES as readonly string[];

export const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

const GENERIC_SKILLS = ["Communication", "Problem Solving", "Leadership", "Public Speaking", "Writing", "Teamwork", "Time Management", "Attention to Detail"];
const GENERIC_SOFTWARE = ["Excel", "PowerPoint", "Google Docs", "Google Sheets", "Canva"];
const uniq = (xs: (string | undefined)[]) => Array.from(new Set(xs.filter((x): x is string => !!x)));

/** Careers a student can name: their Top 3 and saved careers first, then
 *  the catalog careers in their chosen industries. */
export function careerOptions(industries: string[], first: string[]): string[] {
  const inWorlds = ALL_CATALOG_CAREERS.filter((c) => industries.includes(c.world)).map((c) => c.title);
  return uniq([...first, ...inWorlds]);
}
/** The poster the app already shows for a career, for the picker tiles. */
export function careerPhoto(title: string): { photo: string; world: string } | null {
  const c = ALL_CATALOG_CAREERS.find((x) => x.title === title);
  return c ? { photo: c.photo, world: c.world } : null;
}

/** Skills and software the app already connects to a career (Career
 *  Report, career profile, Explore's software list, the Match deck). */
export function suggestionsFor(careerTitle: string | undefined): { skills: string[]; software: string[]; roles: string[] } {
  if (!careerTitle) return { skills: GENERIC_SKILLS, software: GENERIC_SOFTWARE, roles: ["Summer Intern", "Research Intern", "Office Assistant"] };
  const slug = careerSlug(careerTitle);
  const report = reportV2(slug);
  const profile = careerProfile(slug);
  const deck = DECK.find((d) => d.id === slug || d.title === careerTitle);
  // Kept in the data's own sentence case; title-casing turned "Programming
  // in Python or R" into a headline.
  const skills = uniq([...(report?.glance.skills ?? []), ...(profile?.goodAt ?? []), ...(deck?.skills.split(", ") ?? []), ...GENERIC_SKILLS]);
  const software = uniq([...(profile?.software ?? []).map(shortSoftware), ...(CAREER_EXTRAS[slug]?.software ?? []), ...GENERIC_SOFTWARE]);
  const short = careerTitle.replace(/ing$/, "ing").replace(/^Investment Banking$/, "Investment Banking");
  const roles = uniq([`${short} Intern`, `Summer Analyst`, `${short} Assistant`, `Junior ${short}`, "Research Intern", "Operations Intern"]);
  return { skills, software, roles };
}

function shortSoftware(s: string): string {
  return s.replace(/^Microsoft /, "").replace(/^Intuit /, "").replace(/ software$/, "");
}
