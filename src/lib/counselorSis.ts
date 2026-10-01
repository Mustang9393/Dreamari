// DEMO-ONLY: an imagined school integration (Counselor Dashboard v3, 29
// Sept 2026). Chandu: "imagine what it would look like with school
// integration so we have grades, transcripts, basically everything our
// research said it would need... everything with mock data."
//
// In production this whole file is replaced by the school's systems:
// rosters, schedules, grades, attendance and discipline from the SIS over
// OneRoster 1.2 (PowerSchool here), sign-in through Clever, transcripts
// through Parchment, school forms through Common App, the state's FAFSA
// completion data, and enrollment outcomes from the National Student
// Clearinghouse. The shapes below are what those feeds carry.
//
// Every record is generated from the roster row deterministically, and
// tuned to agree with it: an At Risk student has the weaker grades and
// attendance, an On Track one the stronger, so the new numbers never
// contradict the status a counselor already sees.

import type { CounselorStudent } from "./counselorRoster";
import { daysFromToday as daysUntil, seedHash } from "./localRecord";

export type Subject = "English" | "Math" | "Science" | "Social Studies" | "World Language and Arts" | "PE and Health" | "Career and Technical" | "Elective";
export type Level = "Regular" | "Honors" | "AP" | "Dual credit";
export type Letter = "A" | "B" | "C" | "D" | "F";

export type Course = { id: string; name: string; subject: Subject; level: Level; teacher: string; period: number; credits: number; pct: number; letter: Letter; /** points vs four weeks ago */ trend: number };
export type TranscriptCourse = { name: string; subject: Subject; level: Level; credits: number; letter: Letter };
export type TranscriptYear = { grade: number; year: string; courses: TranscriptCourse[] };
export type Requirement = { area: Subject | "Total"; required: number; earned: number; inProgress: number };
export type Flag = { kind: "attendance" | "behavior" | "course" | "credits"; text: string; severity: 1 | 2 | 3 };
export type TestScore = { name: string; score: number; benchmark: number; met: boolean; when: string };
export type ReadinessPart = { id: string; label: string; met: boolean };

export type SisRecord = {
  studentId: string;
  gpa: number;
  weightedGpa: number;
  credits: { earned: number; required: number; expected: number };
  onTrackToGraduate: boolean;
  requirements: Requirement[];
  courses: Course[];
  transcript: TranscriptYear[];
  attendance: { rate: number; absences: number; tardies: number; /** last six weeks, oldest first */ weeks: number[] };
  behavior: { incidents: number; last?: { date: string; type: string } };
  tests: TestScore[];
  cte: { program: string; courses: string[]; concentrator: boolean; wblHours: number; credential?: string };
  readiness: ReadinessPart[];
  flags: Flag[];
};

/** Lincoln High School's graduation requirements (mock, built on the
 *  Illinois minimums): 24 credits. */
export const GRAD_REQUIREMENTS: { area: Subject; required: number }[] = [
  { area: "English", required: 4 },
  { area: "Math", required: 3 },
  { area: "Science", required: 3 },
  { area: "Social Studies", required: 3 },
  { area: "World Language and Arts", required: 2 },
  { area: "Career and Technical", required: 1 },
  { area: "PE and Health", required: 2 },
  { area: "Elective", required: 6 },
];
export const CREDITS_REQUIRED = 24;
/** Instructional days so far this fall (school started Aug 11, the date
 *  Settings shows; Labor Day off). */
export const SCHOOL_DAYS_SO_FAR = 34;
/** The attendance line under which a student is chronically absent. */
export const CHRONIC_ABSENCE = 90;

const SCHOOL_YEARS: Record<number, string> = { 9: "2023-24", 10: "2024-25", 11: "2025-26" };

const TEACHERS = ["Ms. Alvarez", "Mr. Brooks", "Ms. Chen", "Mr. Dawson", "Ms. Ellis", "Mr. Foster", "Ms. Garcia", "Mr. Hughes", "Ms. Iqbal", "Mr. Jensen", "Ms. Kowalski", "Mr. Lopez", "Ms. Morgan", "Mr. Nguyen", "Ms. Okafor", "Mr. Patel"];

// Core sequence by grade, [regular, advanced].
const ENGLISH: Record<number, [string, string]> = { 9: ["English 9", "Honors English 9"], 10: ["English 10", "Honors English 10"], 11: ["American Literature", "AP English Language"], 12: ["English 12: Composition", "AP English Literature"] };
const MATH: Record<number, [string, string]> = { 9: ["Algebra I", "Geometry"], 10: ["Geometry", "Algebra II"], 11: ["Algebra II", "Precalculus"], 12: ["Statistics", "AP Calculus AB"] };
const SCIENCE: Record<number, [string, string]> = { 9: ["Biology", "Honors Biology"], 10: ["Chemistry", "Honors Chemistry"], 11: ["Physics", "AP Biology"], 12: ["Anatomy and Physiology", "AP Environmental Science"] };
const SOCIAL: Record<number, [string, string]> = { 9: ["World Geography", "Honors World Geography"], 10: ["World History", "AP World History"], 11: ["US History", "AP US History"], 12: ["Civics and Economics", "AP Government"] };
const WORLD: Record<number, string> = { 9: "Spanish I", 10: "Spanish II", 11: "Art and Design", 12: "Spanish III" };

/** A career and technical program of study per Build world: three courses
 *  in sequence (two make a concentrator under Perkins V), a credential. */
const PROGRAMS: Record<string, { program: string; courses: [string, string, string]; credential: string }> = {
  "Tech & Engineering": { program: "Engineering and Computer Science", courses: ["Intro to Engineering Design", "Computer Science Principles", "Engineering Capstone"], credential: "CompTIA IT Fundamentals" },
  "Science & Research": { program: "Biomedical Science", courses: ["Principles of Biomedical Science", "Human Body Systems", "Medical Interventions"], credential: "Lab Safety certificate" },
  "Health & Medicine": { program: "Health Science", courses: ["Health Science I", "Medical Terminology", "Certified Nursing Assistant"], credential: "CNA" },
  "Business & Finance": { program: "Business and Finance", courses: ["Intro to Business", "Accounting I", "Business Finance"], credential: "Microsoft Office Specialist" },
  "Building & Construction": { program: "Construction Trades", courses: ["Construction Trades I", "Construction Trades II", "Building Trades Lab"], credential: "OSHA 10" },
  "Fixing Machines & Engines": { program: "Automotive Technology", courses: ["Automotive Technology I", "Automotive Technology II", "Auto Service Internship"], credential: "ASE Entry-Level" },
  "Factories & Making Things": { program: "Manufacturing", courses: ["Intro to Manufacturing", "Welding I", "Advanced Manufacturing"], credential: "AWS Welding" },
  "Driving, Flying & Shipping": { program: "Transportation and Logistics", courses: ["Intro to Logistics", "Aviation Fundamentals", "Logistics Capstone"], credential: "FAA Part 107 (drone)" },
  "Farming, Animals & Nature": { program: "Agriculture", courses: ["Agricultural Science", "Animal Science", "Agribusiness"], credential: "FFA Proficiency" },
  "Food & Cooking": { program: "Culinary Arts", courses: ["Culinary Arts I", "Culinary Arts II", "Restaurant Management"], credential: "ServSafe Food Handler" },
  "Teaching & Education": { program: "Education", courses: ["Teaching as a Profession", "Child Development", "Educational Practicum"], credential: "Paraprofessional prep" },
  "Counseling & Social Work": { program: "Human Services", courses: ["Psychology", "Human Services I", "Community Practicum"], credential: "Mental Health First Aid" },
  "Personal Care & Community Services": { program: "Human Services", courses: ["Intro to Human Services", "Cosmetology I", "Community Service Lab"], credential: "CPR and First Aid" },
  "Arts, Media & Sport": { program: "Arts, Media and Communication", courses: ["Digital Media Production", "Graphic Design", "Media Capstone"], credential: "Adobe Certified Professional" },
  "Law, Safety & Justice": { program: "Law and Public Safety", courses: ["Criminal Justice I", "Forensic Science", "Public Safety Practicum"], credential: "CPR and First Aid" },
};

const letterOf = (pct: number): Letter => (pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F");
const POINTS: Record<Letter, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const round2 = (n: number) => Math.round(n * 100) / 100;

/** A small, repeatable number stream per student. */
function stream(key: string) {
  let h = seedHash(key);
  return (n: number) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    return (h >>> 0) % n;
  };
}

function profile(s: CounselorStudent) {
  // Center and spread of this student's percentages, and how many
  // advanced courses they take, by caseload status.
  if (s.status === "At Risk") return { center: 73, spread: 9, advanced: 0, attendance: [82, 89], incidents: [1, 3] };
  if (s.status === "Needs Attention") return { center: 81, spread: 7, advanced: 1, attendance: [89, 94], incidents: [0, 1] };
  return { center: 88 + (s.roadmapPct % 6), spread: 6, advanced: s.roadmapPct >= 85 ? 3 : 2, attendance: [94, 99], incidents: [0, 0] };
}

/** Which program course (0-2) a student takes in a grade, or -1 for none:
 *  the sequence runs in order, and about one year in five a student takes
 *  a general elective instead. Fixed per student and grade. */
function cteStep(s: CounselorStudent, grade: number): number {
  let step = 0;
  for (let g = 10; g <= grade; g++) {
    const skip = seedHash(`${s.id}-cte-${g}`) % 5 === 0;
    if (g === grade) return skip || step > 2 ? -1 : step;
    if (!skip) step++;
  }
  return -1;
}

function coursesFor(s: CounselorStudent, grade: number, rnd: (n: number) => number, advanced: number): { name: string; subject: Subject; level: Level; credits: number }[] {
  const adv = (i: number) => i < advanced;
  const lvl = (name: string): Level => (name.startsWith("AP ") ? "AP" : name.startsWith("Honors") ? "Honors" : "Regular");
  const pick = (set: Record<number, [string, string]>, i: number) => set[grade][adv(i) ? 1 : 0];
  const program = PROGRAMS[s.careerTrack] ?? PROGRAMS["Tech & Engineering"];
  const cteIndex = cteStep(s, grade);
  const list = [
    { name: pick(ENGLISH, 0), subject: "English" as Subject },
    { name: pick(MATH, 1), subject: "Math" as Subject },
    { name: pick(SCIENCE, 2), subject: "Science" as Subject },
    { name: pick(SOCIAL, 3), subject: "Social Studies" as Subject },
    { name: WORLD[grade], subject: "World Language and Arts" as Subject },
    { name: cteIndex >= 0 ? program.courses[cteIndex] : grade === 9 ? "Intro to Careers" : "Study Skills and Writing", subject: (cteIndex >= 0 ? "Career and Technical" : "Elective") as Subject },
    { name: grade % 2 ? "PE and Health" : "Physical Education", subject: "PE and Health" as Subject },
  ];
  return list.map((c) => ({ ...c, level: c.subject === "Career and Technical" && grade === 12 && rnd(3) === 0 ? "Dual credit" : lvl(c.name), credits: c.subject === "PE and Health" ? 0.5 : 1 }));
}

const cache = new Map<string, SisRecord>();

export function sisFor(s: CounselorStudent): SisRecord {
  const key = `${s.id}:${s.status}:${s.grade}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rnd = stream(s.id);
  const p = profile(s);
  const pctAround = () => Math.max(48, Math.min(99, p.center - p.spread + rnd(p.spread * 2 + 1)));

  // Prior years: final letters. An At Risk student failed one core course
  // along the way, which is where their credit gap comes from.
  const transcript: TranscriptYear[] = [];
  const failYear = s.status === "At Risk" && s.grade > 9 ? 9 + rnd(s.grade - 9) : -1;
  for (let g = 9; g < s.grade; g++) {
    const courses = coursesFor(s, g, rnd, Math.max(0, p.advanced - (11 - g > 0 ? 1 : 0))).map((c, i) => {
      const letter = g === failYear && i === 1 ? "F" : letterOf(pctAround());
      return { ...c, letter } as TranscriptCourse;
    });
    transcript.push({ grade: g, year: SCHOOL_YEARS[g], courses });
  }

  // This semester, six weeks in.
  const failNow = s.status === "At Risk" ? 1 + rnd(2) : -1;
  const courses: Course[] = coursesFor(s, s.grade, rnd, p.advanced).map((c, i) => {
    const pct = i === failNow ? 48 + rnd(10) : s.status === "Needs Attention" && i === 2 && seedHash(s.id) % 2 === 0 ? 64 + rnd(6) : pctAround();
    const trend = i === failNow ? -(4 + rnd(7)) : rnd(9) - 3;
    return { ...c, id: `${s.id}-c${i}`, teacher: TEACHERS[(seedHash(c.name) + i) % TEACHERS.length], period: i + 1, pct, letter: letterOf(pct), trend };
  });

  const graded = [...transcript.flatMap((y) => y.courses), ...(transcript.length ? [] : courses)];
  const pts = graded.reduce((n, c) => n + POINTS[c.letter] * c.credits, 0);
  const wpts = graded.reduce((n, c) => n + (POINTS[c.letter] + (c.letter !== "F" ? (c.level === "AP" || c.level === "Dual credit" ? 1 : c.level === "Honors" ? 0.5 : 0) : 0)) * c.credits, 0);
  const creditSum = graded.reduce((n, c) => n + c.credits, 0) || 1;
  const gpa = round2(pts / creditSum);
  const weightedGpa = round2(wpts / creditSum);

  const earnedBy = (area: Subject) => transcript.flatMap((y) => y.courses).filter((c) => c.subject === area && c.letter !== "F").reduce((n, c) => n + c.credits, 0);
  const inProgBy = (area: Subject) => courses.filter((c) => c.subject === area).reduce((n, c) => n + c.credits, 0);
  // Credits past an area's requirement count as electives, the usual rule.
  const core = GRAD_REQUIREMENTS.filter((r) => r.area !== "Elective");
  const overflow = core.reduce((n, r) => n + Math.max(0, earnedBy(r.area) - r.required), 0) + earnedBy("Elective");
  const overflowInProg = core.reduce((n, r) => n + Math.max(0, inProgBy(r.area) - Math.max(0, r.required - earnedBy(r.area))), 0) + inProgBy("Elective");
  const requirements: Requirement[] = GRAD_REQUIREMENTS.map((r) => r.area === "Elective"
    ? { area: r.area, required: r.required, earned: Math.min(r.required, overflow), inProgress: Math.max(0, Math.min(r.required - Math.min(r.required, overflow), overflowInProg)) }
    : { area: r.area, required: r.required, earned: Math.min(r.required, earnedBy(r.area)), inProgress: Math.max(0, Math.min(inProgBy(r.area), r.required - earnedBy(r.area))) });
  const earned = transcript.flatMap((y) => y.courses).filter((c) => c.letter !== "F").reduce((n, c) => n + c.credits, 0);
  const expected = transcript.flatMap((y) => y.courses).reduce((n, c) => n + c.credits, 0);
  const onTrackToGraduate = earned >= expected;

  const [aLo, aHi] = p.attendance;
  const rate = aLo + rnd((aHi - aLo) * 10 + 1) / 10;
  const absences = Math.round(((100 - rate) / 100) * SCHOOL_DAYS_SO_FAR);
  const weeks = Array.from({ length: 6 }, (_, i) => Math.max(60, Math.min(100, Math.round(rate + (s.status === "At Risk" ? (2 - i) * 2 : 0) + rnd(5) - 2))));
  const [iLo, iHi] = p.incidents;
  const incidents = iLo + rnd(iHi - iLo + 1);
  const behavior = { incidents, last: incidents ? { date: `2026-09-${String(8 + rnd(18)).padStart(2, "0")}`, type: ["Class disruption", "Tardy, repeated", "Phone policy", "Left class without a pass"][rnd(4)] } : undefined };

  const tests: TestScore[] = [];
  const base = 620 + Math.round(gpa * 130) + rnd(140);
  if (s.grade >= 10) tests.push({ name: "PSAT 10", score: Math.min(1520, base - 60), benchmark: 910, met: base - 60 >= 910, when: "Spring 2025" });
  if (s.grade >= 11) tests.push({ name: "PSAT/NMSQT", score: Math.min(1520, base - 20), benchmark: 970, met: base - 20 >= 970, when: "Fall 2025" });
  if (s.grade >= 12) tests.push({ name: "SAT (state school day)", score: Math.min(1600, base), benchmark: 1010, met: base >= 1010, when: "Spring 2026" });

  const program = PROGRAMS[s.careerTrack] ?? PROGRAMS["Tech & Engineering"];
  const cteDone = transcript.flatMap((y) => y.courses).filter((c) => c.subject === "Career and Technical" && c.letter !== "F").map((c) => c.name);
  const concentrator = cteDone.length >= 2;
  const wblHours = s.grade >= 11 ? (s.status === "At Risk" ? rnd(20) : rnd(85)) : 0;
  const credential = s.grade === 12 && concentrator && rnd(2) === 0 ? program.credential : undefined;
  const cte = { program: program.program, courses: cteDone, concentrator, wblHours, credential };

  const bestTest = tests[tests.length - 1];
  const readiness: ReadinessPart[] = [
    { id: "gpa", label: "GPA 2.8 or higher", met: gpa >= 2.8 },
    { id: "attendance", label: "Attendance 90% or higher", met: rate >= 90 },
    { id: "test", label: "Meets the SAT benchmark", met: !!bestTest?.met },
    { id: "advanced", label: "AP, dual credit or college-level course", met: [...transcript.flatMap((y) => y.courses), ...courses].some((c) => c.level === "AP" || c.level === "Dual credit") },
    { id: "career", label: "CTE concentrator, credential or 60 hours of work-based learning", met: concentrator || !!credential || wblHours >= 60 },
  ];

  const flags: Flag[] = [];
  if (rate < CHRONIC_ABSENCE) flags.push({ kind: "attendance", text: `Attendance ${rate.toFixed(1)}%, ${absences} days missed`, severity: rate < 85 ? 3 : 2 });
  for (const c of courses) if (c.letter === "F") flags.push({ kind: "course", text: `F in ${c.name}, ${c.pct}%`, severity: 3 });
  for (const c of courses) if (c.letter === "D") flags.push({ kind: "course", text: `D in ${c.name}, ${c.pct}%`, severity: 2 });
  if (incidents >= 2) flags.push({ kind: "behavior", text: `${incidents} behavior incidents this fall`, severity: incidents >= 3 ? 3 : 2 });
  if (!onTrackToGraduate) flags.push({ kind: "credits", text: `${expected - earned} ${expected - earned === 1 ? "credit" : "credits"} behind for graduation`, severity: s.grade >= 11 ? 3 : 2 });
  flags.sort((a, b) => b.severity - a.severity);

  const rec: SisRecord = { studentId: s.id, gpa, weightedGpa, credits: { earned, required: CREDITS_REQUIRED, expected }, onTrackToGraduate, requirements, courses, transcript, attendance: { rate: Math.round(rate * 10) / 10, absences, tardies: rnd(s.status === "On Track" ? 3 : 7), weeks }, behavior, tests, cte, readiness, flags };
  cache.set(key, rec);
  return rec;
}

export function flagScore(r: SisRecord): number {
  return r.flags.reduce((n, f) => n + f.severity, 0);
}

export const FLAG_LABEL: Record<Flag["kind"], string> = { attendance: "Attendance", behavior: "Behavior", course: "Course performance", credits: "Credits" };

// ---- College documents (seniors) --------------------------------------------

export type DocState = "done" | "pending" | "missing";
export type CollegeFile = { college: string; deadline: string; plan: "Early action" | "Early decision" | "Regular" | "Rolling"; application: DocState; transcript: DocState; schoolReport: DocState; letter: DocState; scores: DocState | "optional" };

/** Per college: what the school owes and what the student owes. Built on
 *  the letter request (same colleges, same deadline) so the Applications
 *  screen and Letter requests always agree. */
export function collegeFiles(s: CounselorStudent, recipients: string[], due: string, letterSent: boolean): CollegeFile[] {
  const rnd = stream(`${s.id}-apps`);
  const ready = s.status === "On Track" ? 2 : s.status === "Needs Attention" ? 1 : 0;
  return recipients.map((college, i) => {
    const st = (bias: number): DocState => (rnd(4) + ready + bias >= 3 ? "done" : rnd(2) ? "pending" : "missing");
    const plan = i === 0 && due.endsWith("-11-01") ? (rnd(4) === 0 ? "Early decision" : "Early action") : due.endsWith("-10-15") ? "Rolling" : due.startsWith(`${due.slice(0, 4)}-11`) ? "Early action" : "Regular";
    // Six weeks before an early deadline most applications are still
    // drafts; the regular-deadline ones mostly are not started.
    const near = daysUntil(due) <= 30;
    return { college, deadline: due, plan, application: near ? st(0) : st(-2), transcript: st(0), schoolReport: st(-1), letter: letterSent ? "done" : "pending", scores: /Northwestern|Purdue|Illinois Urbana/.test(college) ? st(0) : "optional" };
  });
}

// ---- Alumni outcomes (National Student Clearinghouse) ----------------------

export const ALUMNI = {
  className: "Class of 2025",
  graduates: 312,
  enrolledFall: 66,
  fourYear: 41,
  twoYear: 21,
  lessThanTwo: 4,
  persistedClass: "Class of 2024",
  persisted: 79,
  topColleges: [
    { name: "Lincoln Land Community College", n: 58 },
    { name: "University of Illinois Springfield", n: 24 },
    { name: "Illinois State University", n: 21 },
    { name: "University of Illinois Urbana-Champaign", n: 17 },
    { name: "Southern Illinois University", n: 12 },
  ],
} as const;

// ---- Integrations ----------------------------------------------------------

export type Integration = { name: string; kind: string; carries: string; synced: string; status: "connected" | "attention" };

export const INTEGRATIONS: Integration[] = [
  { name: "PowerSchool SIS", kind: "OneRoster 1.2", carries: "Rosters, schedules, grades, attendance, behavior, transcripts", synced: "Today, 6:02 AM", status: "connected" },
  { name: "Clever", kind: "Single sign-on", carries: "Student and staff sign-in", synced: "Live", status: "connected" },
  { name: "State FAFSA data", kind: "ISAC completion report", carries: "Student-level FAFSA status", synced: "Yesterday, 11:40 PM", status: "connected" },
  { name: "Parchment", kind: "Transcripts", carries: "Transcript requests and delivery", synced: "Today, 7:15 AM", status: "connected" },
  { name: "Common App", kind: "School forms", carries: "School reports, counselor letters, mid-year reports", synced: "Today, 7:15 AM", status: "attention" },
  { name: "National Student Clearinghouse", kind: "StudentTracker for High Schools", carries: "Alumni enrollment and persistence", synced: "Aug 30", status: "connected" },
];

export const SIS_SYNC_LABEL = "PowerSchool · synced 6:02 AM";
