// DEMO-ONLY seeds, real product shape: recommendation-letter requests,
// the evidence a letter is written from, and the letter check (Counselor
// Dashboard v3, 29 Sept 2026).
//
// Why: the Productivity Suite already drafts a letter from a student's
// milestones, but AI letter drafts are now standard (SchooLinks'
// Recommendation Letter Agent, Naviance's 2025-26 release). What a
// counselor at 376 students per counselor lacks is (1) one list of who
// asked, for where, due when; (2) the student's own evidence beside the
// draft, so the letter says something only this student did; (3) a check
// that the letter is as full and specific as the counselor's others. A
// 2025 study found counselors write shorter letters for students of color
// (Inside Higher Ed, July 2025); the check compares every letter with the
// counselor's own average, so no student gets the short version by
// accident. There is deliberately no demographic comparison: the
// dashboard holds no demographic data (docs/handoff/specs/counselor-
// dashboard.md), and the per-letter check reaches the same goal.
//
// Status comes from the roster's own "Recommendation Letter" milestone so
// this list never disagrees with the Milestone Tracker: Completed = sent,
// In Progress = requested, Not Started = not requested yet. The counselor's
// own actions (drafting, marking sent) are stored on top.

import type { CounselorStudent } from "./counselorRoster";
import { createLocalRecord, daysFromToday, seedHash } from "./localRecord";
import { readResume } from "./resume";
import { signalsFor } from "./studentSignals";

export type LetterStatus = "requested" | "drafting" | "sent";

export type LetterRequest = {
  studentId: string;
  status: LetterStatus;
  type: "College Application" | "Scholarship" | "Internship" | "Employment";
  /** where it goes */
  recipients: string[];
  /** ISO date */
  due: string;
  /** ISO date the student asked */
  requestedOn: string;
  /** words in the sent letter, when sent */
  words?: number;
};

type Override = { status?: LetterStatus; words?: number; sentAt?: string };
const overrides = createLocalRecord<Record<string, Override>>("dreamari-counselor-letter-requests", {});

const FOUR_YEAR = ["University of Illinois Urbana-Champaign", "Illinois State University", "Northwestern University", "Loyola University Chicago", "Bradley University", "Southern Illinois University", "University of Iowa", "Purdue University"];
const TWO_YEAR = ["Lincoln Land Community College", "Richland Community College"];
const TRADES = ["Lincoln Land Community College", "Ranken Technical College", "Illinois Central College"];

/** The application calendar a senior's letter runs on: early deadlines in
 *  October and November, regular ones in January. The year follows today's
 *  date, so the seeded deadlines always sit in the current application
 *  season. */
function dueDates(now: Date): string[] {
  const fallYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return [`${fallYear}-10-15`, `${fallYear}-11-01`, `${fallYear}-11-01`, `${fallYear}-11-15`, `${fallYear}-12-01`, `${fallYear + 1}-01-01`, `${fallYear + 1}-01-15`];
}

function baseRequest(s: CounselorStudent, now: Date): LetterRequest | null {
  if (s.grade !== 12) return null;
  const m = s.milestones["Recommendation Letter"];
  if (m === "Not Applicable" || m === "Not Started") return null;
  const h = seedHash(s.id);
  const intent = s.postsecondaryIntent;
  const type: LetterRequest["type"] = intent === "Workforce" ? "Employment" : intent === "Trade/Technical School" || intent === "2-Year College" ? "Scholarship" : intent === "Military" ? "Scholarship" : "College Application";
  const pool = intent === "4-Year College" || intent === "Undecided" ? FOUR_YEAR : intent === "2-Year College" ? TWO_YEAR : intent === "Military" ? ["Army ROTC scholarship"] : intent === "Workforce" ? ["Memorial Health, patient services"] : TRADES;
  const n = pool.length === 1 ? 1 : 2 + (h % 3);
  const recipients = Array.from({ length: Math.min(n, pool.length) }, (_, i) => pool[(h + i * 3) % pool.length]).filter((v, i, a) => a.indexOf(v) === i);
  const dates = dueDates(now);
  const due = dates[h % dates.length];
  const req = new Date(due);
  req.setDate(req.getDate() - 45 - (h % 20));
  const done = m === "Completed" || m === "Approved";
  return { studentId: s.id, status: done ? "sent" : "requested", type, recipients, due, requestedOn: req.toISOString().slice(0, 10), words: done ? 300 + (h % 140) : undefined };
}

export function letterRequests(roster: CounselorStudent[], o: Record<string, Override> = overrides.read(), now: Date = new Date()): LetterRequest[] {
  const out: LetterRequest[] = [];
  for (const s of roster) {
    const base = baseRequest(s, now);
    if (!base) continue;
    const ov = o[s.id];
    out.push(ov ? { ...base, status: ov.status ?? base.status, words: ov.words ?? base.words } : base);
  }
  // Open letters by due date, sooner first; sent ones last.
  return out.sort((a, b) => (a.status === "sent" ? 1 : 0) - (b.status === "sent" ? 1 : 0) || a.due.localeCompare(b.due));
}

/** Seniors who have not asked for a letter yet (the milestone says Not Started). */
export function notRequested(roster: CounselorStudent[]): CounselorStudent[] {
  return roster.filter((s) => s.grade === 12 && s.milestones["Recommendation Letter"] === "Not Started");
}

export function useLetterOverrides(): Record<string, Override> {
  return overrides.useValue();
}

export function markDrafting(studentId: string): void {
  overrides.update((o) => (o[studentId]?.status === "sent" ? o : { ...o, [studentId]: { ...o[studentId], status: "drafting" } }));
}

export function markSent(studentId: string, words: number): void {
  overrides.update((o) => ({ ...o, [studentId]: { status: "sent", words, sentAt: new Date().toISOString() } }));
}

export function reopenLetter(studentId: string): void {
  overrides.update((o) => ({ ...o, [studentId]: { status: "drafting" } }));
}

export function daysLeft(r: LetterRequest): number {
  return daysFromToday(r.due);
}

// ---- Evidence --------------------------------------------------------------

export type Evidence = {
  id: string;
  /** what it is, short: "Robotics club" */
  label: string;
  /** one line of detail */
  detail: string;
  /** the student's own reflection, when they wrote one */
  reflection?: string;
  source: "Brag sheet" | "Resume" | "Dreamari";
  /** the sentence the letter uses when the counselor inserts it */
  sentence: string;
};

// Brag sheet entries by Build world, two each. Seeded students wrote these
// in the prototype's story; the live student has no brag sheet yet (a
// student-side feature still to build), so their evidence is their real
// resume and Dreamari activity only.
const BRAG: Record<string, { label: string; detail: string; reflection: string; sentence: (first: string) => string }[]> = {
  "Tech & Engineering": [
    { label: "Robotics team", detail: "Led the drivetrain build for the regional competition", reflection: "I learned to test one change at a time instead of guessing.", sentence: (f) => `On our robotics team, ${f} led the drivetrain build for the regional competition and taught the team to test one change at a time rather than guess.` },
    { label: "Summer coding camp", detail: "Built a bus-arrival app for classmates", reflection: "Real users found bugs I never would have.", sentence: (f) => `At a summer coding camp, ${f} built a bus-arrival app that classmates still use, and treated every bug report as a lesson.` },
  ],
  "Science & Research": [
    { label: "Science fair", detail: "Studied nitrate levels in the Sangamon River", reflection: "My first hypothesis was wrong, and that was the interesting part.", sentence: (f) => `${f} spent a semester measuring nitrate levels in the Sangamon River for the science fair, and was most energized when the first hypothesis turned out to be wrong.` },
    { label: "Lab assistant", detail: "Prepared chemistry labs after school", reflection: "Precision matters more than speed.", sentence: (f) => `As an after-school lab assistant, ${f} prepared chemistry labs for younger students with a care for precision that teachers noticed.` },
  ],
  "Health & Medicine": [
    { label: "Hospital volunteer", detail: "120 hours at Memorial Medical Center", reflection: "Listening to patients is part of the care.", sentence: (f) => `${f} volunteered more than 120 hours at Memorial Medical Center and speaks about patients with real empathy.` },
    { label: "HOSA chapter", detail: "Organized a CPR training day for 60 students", reflection: "Teaching something is the best way to learn it.", sentence: (f) => `Through our HOSA chapter, ${f} organized a CPR training day for sixty classmates.` },
  ],
  "Business & Finance": [
    { label: "DECA", detail: "State qualifier in business finance", reflection: "Pitching made me better at listening to questions.", sentence: (f) => `${f} qualified for the state DECA competition in business finance and became a sharper listener through every pitch.` },
    { label: "Part-time job", detail: "Cashier and inventory lead at a local grocer", reflection: "Customers remember how you made them feel.", sentence: (f) => `${f} works as a cashier and inventory lead at a local grocer, balancing a real job with a full course load.` },
  ],
  "Building & Construction": [
    { label: "Habitat for Humanity", detail: "Framed walls on two builds", reflection: "Measure twice, and ask when you are not sure.", sentence: (f) => `${f} framed walls on two Habitat for Humanity builds and earned the site lead's trust by asking good questions.` },
    { label: "Construction class", detail: "Built the school's new greenhouse benches", reflection: "A plan on paper changes on site.", sentence: (f) => `In our construction class, ${f} built the benches for the school greenhouse, adapting the plan when the site did not match the drawing.` },
  ],
  "Fixing Machines & Engines": [
    { label: "Auto shop", detail: "Rebuilt a small engine from parts", reflection: "Patience is a tool too.", sentence: (f) => `${f} rebuilt a small engine from parts in auto shop, showing patience that is rare at seventeen.` },
    { label: "Family business", detail: "Helps at a relative's repair garage on weekends", reflection: "Every repair starts with listening to the customer.", sentence: (f) => `On weekends ${f} helps at a family repair garage, where customers trust the work.` },
  ],
  "Factories & Making Things": [
    { label: "Maker club", detail: "Runs the 3D printers for the club", reflection: "Failure prints teach the most.", sentence: (f) => `${f} runs the 3D printers for our maker club and helps younger members learn from failed prints.` },
    { label: "Welding course", detail: "Earned a first welding certificate", reflection: "Safety habits have to be automatic.", sentence: (f) => `${f} earned a first welding certificate and holds to safety habits without being reminded.` },
  ],
  "Driving, Flying & Shipping": [
    { label: "Civil Air Patrol", detail: "Cadet, logged ground school hours", reflection: "Checklists exist for a reason.", sentence: (f) => `As a Civil Air Patrol cadet, ${f} completed ground school and brings a checklist discipline to everything.` },
    { label: "Delivery job", detail: "Part-time delivery driver for a pharmacy", reflection: "Being on time is a way of being kind.", sentence: (f) => `${f} works part time delivering prescriptions for a local pharmacy, a job that depends on reliability.` },
  ],
  "Farming, Animals & Nature": [
    { label: "FFA", detail: "Chapter treasurer, raised show livestock", reflection: "Animals do not take days off.", sentence: (f) => `${f} serves as our FFA chapter treasurer and raised show livestock, work that does not take days off.` },
    { label: "Park volunteer", detail: "Trail restoration at Lincoln Memorial Garden", reflection: "Small work adds up over a season.", sentence: (f) => `${f} volunteers on trail restoration at Lincoln Memorial Garden.` },
  ],
  "Food & Cooking": [
    { label: "Culinary program", detail: "Catered the staff appreciation lunch", reflection: "Timing a kitchen is like leading a team.", sentence: (f) => `${f} led the culinary program's catering of our staff appreciation lunch for eighty people.` },
    { label: "Restaurant job", detail: "Line cook at a local diner", reflection: "Calm is contagious on a busy night.", sentence: (f) => `${f} works as a line cook at a local diner and stays calm on the busiest nights.` },
  ],
  "Teaching & Education": [
    { label: "Peer tutor", detail: "Tutors Grade 9 algebra twice a week", reflection: "Explaining it three ways is sometimes the only way.", sentence: (f) => `${f} tutors ninth graders in algebra twice a week and will explain a problem three different ways until it lands.` },
    { label: "Summer camp counselor", detail: "Led a cabin of eight-year-olds", reflection: "Kids notice when you are fair.", sentence: (f) => `As a summer camp counselor, ${f} led a cabin of eight-year-olds with a fairness they noticed.` },
  ],
  "Counseling & Social Work": [
    { label: "Peer mentoring", detail: "Mentors two freshmen through their first year", reflection: "Sometimes the job is just showing up.", sentence: (f) => `${f} mentors two freshmen through their first year and simply shows up for them, week after week.` },
    { label: "Food pantry", detail: "Weekly shifts at the community food pantry", reflection: "Dignity matters as much as the food.", sentence: (f) => `${f} works weekly shifts at our community food pantry and treats every visitor with dignity.` },
  ],
  "Personal Care & Community Services": [
    { label: "Senior center", detail: "Weekly visits and tech help for residents", reflection: "Patience is a form of respect.", sentence: (f) => `${f} visits a senior center every week to help residents with their phones and tablets.` },
    { label: "Cosmetology course", detail: "Completed the first clinical hours", reflection: "Clients relax when you explain what you are doing.", sentence: (f) => `${f} completed the first clinical hours of our cosmetology course and puts clients at ease.` },
  ],
  "Arts, Media & Sport": [
    { label: "School paper", detail: "Arts editor, 14 published features", reflection: "Editing my own work is the hardest part.", sentence: (f) => `As arts editor of our school paper, ${f} has published fourteen features and edits their own work hardest of all.` },
    { label: "Varsity athletics", detail: "Team captain, two seasons", reflection: "A captain sets the tone at practice, not just at games.", sentence: (f) => `${f} captained a varsity team for two seasons and set the tone at practice, not just at games.` },
  ],
  "Law, Safety & Justice": [
    { label: "Mock trial", detail: "Lead attorney at the state tournament", reflection: "The best argument answers the other side.", sentence: (f) => `${f} was lead attorney for our mock trial team at the state tournament and argues by answering the other side first.` },
    { label: "Youth police academy", detail: "Completed the summer academy", reflection: "Community trust is earned slowly.", sentence: (f) => `${f} completed the summer youth police academy and talks thoughtfully about community trust.` },
  ],
};

/** Everything a letter can be written from, most specific first: the
 *  student's own brag sheet, their resume, then what they did on Dreamari. */
export function evidenceFor(s: CounselorStudent): Evidence[] {
  const first = s.name.split(" ")[0];
  const out: Evidence[] = [];
  if (s.isReal) {
    const resume = readResume();
    for (const x of resume.experience.slice(0, 3)) {
      const what = [x.title, x.where].filter(Boolean).join(", ");
      if (!what) continue;
      const line = x.bullets.find((b) => b.trim())?.trim();
      out.push({ id: `resume-${x.id}`, label: x.title || x.where, detail: line ?? what, source: "Resume", sentence: `${first} has worked as ${what}${line ? `, where ${line.charAt(0).toLowerCase()}${line.slice(1).replace(/\.$/, "")}` : ""}.` });
    }
  } else if (s.grade >= 11) {
    for (const [i, b] of (BRAG[s.careerTrack] ?? []).entries()) {
      out.push({ id: `brag-${i}`, label: b.label, detail: b.detail, reflection: b.reflection, source: "Brag sheet", sentence: b.sentence(first) });
    }
  }
  const sig = signalsFor(s);
  const top = s.topMatches[0]?.title;
  if (sig.simulationsCompleted > 0) {
    out.push({ id: "dm-sims", label: "Career simulations", detail: `${sig.simulationsCompleted} completed on Dreamari${top ? `, top match ${top}` : ""}`, source: "Dreamari", sentence: `${first} has completed ${sig.simulationsCompleted} hands-on career simulations on Dreamari${top ? `, and ${top} has emerged as a clear direction` : ""}.` });
  }
  if (sig.careersSaved + sig.collegesSaved > 0) {
    out.push({ id: "dm-explore", label: "Career and college research", detail: `${sig.careersSaved} careers and ${sig.collegesSaved} colleges saved`, source: "Dreamari", sentence: `${first} has researched ${sig.careersSaved} careers and ${sig.collegesSaved} colleges in depth before choosing where to apply.` });
  }
  if (sig.questionsAsked > 0) {
    out.push({ id: "dm-questions", label: "Questions to professionals", detail: `${sig.questionsAsked} asked in Connect`, source: "Dreamari", sentence: `${first} has asked working professionals ${sig.questionsAsked} questions about their careers, a curiosity that goes beyond the classroom.` });
  }
  return out;
}

// ---- Letter check ----------------------------------------------------------

/** Praise that could describe any student. Each one is a prompt to say
 *  what the student actually did. */
const GENERIC = ["hard-working", "hardworking", "hard worker", "works hard", "good student", "nice", "pleasant", "polite", "quiet", "well-behaved", "helpful", "a joy", "great kid", "responsible"];

export type LetterCheck = {
  words: number;
  /** the counselor's average across sent letters */
  average: number;
  /** evidence items the letter uses */
  specifics: number;
  generic: string[];
  /** the one verdict, a phrase */
  verdict: string;
  ok: boolean;
};

export function averageWords(requests: LetterRequest[]): number {
  const sent = requests.filter((r) => r.status === "sent" && r.words).map((r) => r.words!);
  return sent.length ? Math.round(sent.reduce((a, b) => a + b, 0) / sent.length) : 360;
}

export function checkLetter(text: string, evidence: Evidence[], average: number): LetterCheck {
  const words = text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
  const lower = text.toLowerCase();
  const specifics = evidence.filter((e) => lower.includes(e.label.toLowerCase()) || lower.includes(e.sentence.slice(0, 40).toLowerCase())).length;
  const generic = GENERIC.filter((g) => new RegExp(`\\b${g.replace("-", "[- ]?")}\\b`, "i").test(text));
  const short = words < average * 0.8;
  let verdict = "In line with your other letters";
  if (short) verdict = `Shorter than your usual ${average} words`;
  else if (specifics < 2) verdict = "Add a specific example";
  else if (generic.length) verdict = "Swap general praise for specifics";
  return { words, average, specifics, generic, verdict, ok: !short && specifics >= 2 && generic.length === 0 };
}
