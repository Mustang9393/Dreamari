// How an opportunity fits the student, in reasons a 14-year-old can read,
// not a percentage (SchooLinks shows a match ring with 100 or 88; the data
// cannot support that precision, so Dreamari says why instead).

import { useSyncExternalStore } from "react";
import { STUDENT, ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { ACADEMIC_RECORD } from "@/components/profile/report-data";
import { parseGpa } from "@/components/colleges/pathway";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { daysFromToday, isoDay, shortDate } from "@/lib/localRecord";
import { WORLD_COLORS } from "@/components/app/worlds";
import type { Field, Item } from "./types";

export type Student = { grade: number; state: string; gpa: number | null; fields: Field[] };

// DEMO-ONLY: the demo student's home state (Westfield High School, NJ,
// the pilot). The profile's `states` are where they would go to school,
// which is a different question; production reads the school record.
const HOME_STATE = "NJ";

const STATE_NAME: Record<string, string> = { NJ: "New Jersey", NY: "New York", PA: "Pennsylvania", IL: "Illinois", TX: "Texas", FL: "Florida", AZ: "Arizona", SD: "South Dakota", CA: "California" };
export const stateName = (s: string) => STATE_NAME[s] ?? s;

/** The app's career worlds, folded onto the fields opportunities use. */
export function worldToField(world: string): Field | null {
  switch (world) {
    case "Tech & Engineering": case "Business & Finance": case "Health & Medicine": case "Science & Research": return world;
    case "Arts, Media & Sport": return "Arts & Media";
    case "Teaching & Education": return "Public Service & Law";
    case "Farming, Animals & Nature": return "Science & Research";
    case "Driving, Flying & Shipping": return "Skilled Trades";
    default: return null;
  }
}

/** The world a field belongs to, with the colour that world owns everywhere
 *  else in the app (Explore's posters, Connect's boards). "Any" has none. */
const FIELD_WORLD: Record<Exclude<Field, "Any">, string> = {
  "Tech & Engineering": "Tech & Engineering", "Business & Finance": "Business & Finance", "Health & Medicine": "Health & Medicine", "Science & Research": "Science & Research",
  "Arts & Media": "Arts, Media & Sport", "Public Service & Law": "Law, Safety & Justice", "Skilled Trades": "Building & Construction",
};
export function fieldWorld(fields: Field[]): { name: string; color: string } | null {
  const f = fields.find((x) => x !== "Any") as Exclude<Field, "Any"> | undefined;
  if (!f) return null;
  const name = FIELD_WORLD[f];
  return { name, color: WORLD_COLORS[name] ?? "var(--primary)" };
}

export function useStudent(): Student {
  const profile = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const grade = parseInt(STUDENT.grade.replace(/\D/g, ""), 10) || 11;
  const fields = [...new Set(picks.ids.map((id) => ALL_PROFILE_CAREERS.find((c) => c.id === id)?.world).map((w) => (w ? worldToField(w) : null)).filter((f): f is Field => !!f))];
  return { grade, state: HOME_STATE, gpa: parseGpa(profile.gpa || ACADEMIC_RECORD.gpa), fields };
}

export type Timing = { status: "open" | "closed" | "unknown"; iso: string | null; label: string; days: number | null; approx: boolean; tone: "plain" | "soon" | "muted" };

/** When it closes, rolled forward when the provider still shows last
 *  cycle's date ("Usually closes Nov 13"), so the list never claims a date
 *  the page did not give. */
export function timing(item: Item, today: string): Timing {
  if (!item.deadline) return { status: "unknown", iso: null, label: "Date not posted", days: null, approx: false, tone: "muted" };
  let iso = item.deadline;
  let approx = false;
  let days = daysFromToday(iso, new Date(today));
  if (days < -14) {
    // last cycle's date: the same month and day next time round
    const [, m, d] = iso.split("-");
    const y = parseInt(today.slice(0, 4), 10);
    for (const yy of [y, y + 1]) {
      const cand = `${yy}-${m}-${d}`;
      if (daysFromToday(cand, new Date(today)) >= 0) { iso = cand; break; }
    }
    approx = true;
    days = daysFromToday(iso, new Date(today));
  }
  if (days < 0) return { status: "closed", iso, label: `Closed ${shortDate(iso)}`, days, approx, tone: "muted" };
  const word = approx ? "Usually closes" : "Closes";
  const soon = days <= 14;
  return { status: "open", iso, label: days === 0 ? "Closes today" : soon && !approx ? `${word} ${shortDate(iso)}, in ${days} day${days === 1 ? "" : "s"}` : `${word} ${shortDate(iso)}`, days, approx, tone: soon ? "soon" : "plain" };
}

export function gradeWord(grades: number[]): string {
  if (!grades.length) return "College students";
  const s = [...grades].sort((a, b) => a - b);
  if (s.length === 4) return "Every high-school grade";
  if (s.length === 1) return `Grade ${s[0]}`;
  if (s.length === 2 && s[1] - s[0] === 1) return `Grades ${s[0]} and ${s[1]}`;
  if (s[s.length - 1] - s[0] === s.length - 1) return `Grades ${s[0]} to ${s[s.length - 1]}`;
  return `Grades ${s.join(", ")}`;
}

export type Fit = { when: "now" | "later" | "no"; score: number; reasons: string[]; checks: string[] };

export function fitFor(item: Item, st: Student): Fit {
  const reasons: string[] = [];
  const checks: string[] = [];
  let score = 0;
  let when: Fit["when"] = "now";
  if (!item.grades.length) { when = "later"; checks.push("For college students, so this one is for later"); }
  else if (item.grades.includes(st.grade)) { score += 3; reasons.push(`Grade ${st.grade} can apply`); }
  else if (Math.min(...item.grades) > st.grade) { when = "later"; checks.push(`Opens to you in grade ${Math.min(...item.grades)}`); }
  else { when = "no"; checks.push(`For ${gradeWord(item.grades).toLowerCase()}`); }

  if (item.states.includes("Any")) { score += 1; }
  else if (item.states.includes("Remote")) { score += 1; reasons.push("Online, from anywhere"); }
  else if (item.states.includes(st.state)) { score += 2; reasons.push(`Open in ${stateName(st.state)}`); }
  else { when = "no"; checks.push(`Only in ${item.states.map(stateName).join(", ")}`); }

  const shared = item.fields.filter((f) => f !== "Any" && st.fields.includes(f));
  if (shared.length) { score += 2; reasons.push(`Fits your Top 3: ${shared[0]}`); }
  else if (item.fields.includes("Any")) { score += 1; reasons.push("Any career field"); }

  if (item.type === "scholarship") {
    if (item.minGpa !== null && st.gpa !== null) {
      if (st.gpa >= item.minGpa) { score += 1; reasons.push(`Your ${st.gpa.toFixed(1)} GPA is above the ${item.minGpa.toFixed(1)} needed`); }
      else { checks.push(`Needs a ${item.minGpa.toFixed(1)} GPA`); }
    }
    if (item.needBased) checks.push("Based on family income, so check the income rules");
  }
  return { when, score, reasons, checks };
}

export const today = () => isoDay(new Date());
