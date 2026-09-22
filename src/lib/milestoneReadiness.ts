// Grade-required milestone content for the Milestone Tracker screen, copied
// verbatim from the reference (web-app-prototype-maishak.replit.app/readiness,
// all 4 grade tabs) -- this is a distinct taxonomy from the per-student
// MILESTONE_KEYS in counselorRoster.ts (that one drives the roster table,
// Student Profile, Review Queue, Overview and Student Progress, which are all
// modeled on the reference's own generic "approval workflow" milestones).
// The reference itself keeps these two milestone systems separate; so does
// this file. Aggregate counts here are static seed content, matching the
// reference's own fixed "30 students per grade" cohort.

export type MilestoneCard = {
  name: string;
  subtitle: string;
  // Second, lower-emphasis line the reference shows under certain subtitles
  // (e.g. "Counselor Review" -> "Counselor review"). Present only where the
  // reference itself renders it.
  reviewNote?: string;
  pct: number;
  completed: number;
  total: number;
  inProgress: number;
  needsAttention: number;
  notStarted: number;
  notApplicable?: number;
};

export type GradeReadiness = {
  grade: 9 | 10 | 11 | 12;
  focus: string;
  students: number;
  avgDone: number;
  cards: MilestoneCard[];
};

export const GRADE_READINESS: Record<9 | 10 | 11 | 12, GradeReadiness> = {
  9: {
    grade: 9,
    focus: "Career exploration and building a foundation for a four-year academic plan.",
    students: 30,
    avgDone: 80,
    cards: [
      { name: "Career Assessment", subtitle: "Student Completion", pct: 97, completed: 29, total: 30, inProgress: 1, needsAttention: 0, notStarted: 0 },
      { name: "Career Exploration", subtitle: "Student Completion", pct: 87, completed: 26, total: 30, inProgress: 3, needsAttention: 0, notStarted: 1 },
      { name: "Career Goals", subtitle: "Student Submission / Counselor Visibility", pct: 77, completed: 23, total: 30, inProgress: 4, needsAttention: 1, notStarted: 2 },
      { name: "Four-Year Academic Plan", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 80, completed: 24, total: 30, inProgress: 3, needsAttention: 1, notStarted: 2 },
      { name: "Next-Year Course Plan", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 73, completed: 22, total: 30, inProgress: 4, needsAttention: 2, notStarted: 2 },
      { name: "Postsecondary Pathways Exploration", subtitle: "Student Completion", pct: 77, completed: 23, total: 30, inProgress: 4, needsAttention: 0, notStarted: 3 },
      { name: "Grade 9 College & Career Reflection", subtitle: "Student Submission / Counselor Visibility", pct: 70, completed: 21, total: 30, inProgress: 7, needsAttention: 0, notStarted: 2 },
    ],
  },
  10: {
    grade: 10,
    focus: "Deepening career pathways, building a resume, and beginning college exploration.",
    students: 30,
    avgDone: 73,
    cards: [
      { name: "Updated Career Assessment & Interests", subtitle: "Student Completion", pct: 90, completed: 27, total: 30, inProgress: 2, needsAttention: 0, notStarted: 1 },
      { name: "Career Comparison", subtitle: "Student Completion", pct: 80, completed: 24, total: 30, inProgress: 4, needsAttention: 0, notStarted: 2 },
      { name: "Career Pathway Focus", subtitle: "Student Submission / Counselor Visibility", pct: 73, completed: 22, total: 30, inProgress: 5, needsAttention: 1, notStarted: 2 },
      { name: "Updated Four-Year Academic Plan", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 77, completed: 23, total: 30, inProgress: 4, needsAttention: 1, notStarted: 2 },
      { name: "Next-Year Course Plan", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 70, completed: 21, total: 30, inProgress: 5, needsAttention: 2, notStarted: 2 },
      { name: "Resume Draft", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 67, completed: 20, total: 30, inProgress: 5, needsAttention: 3, notStarted: 2 },
      { name: "Career Experience / Opportunity Plan", subtitle: "Student Submission / Counselor Visibility", pct: 60, completed: 18, total: 30, inProgress: 9, needsAttention: 0, notStarted: 3 },
      { name: "Grade 10 College & Career Reflection", subtitle: "Student Submission / Counselor Visibility", pct: 63, completed: 19, total: 30, inProgress: 8, needsAttention: 0, notStarted: 3 },
    ],
  },
  11: {
    grade: 11,
    focus: "Postsecondary planning, college lists, and preparing for the application process.",
    students: 30,
    avgDone: 62,
    cards: [
      { name: "Graduation Progress Review", subtitle: "Counselor Verification", reviewNote: "Counselor verification", pct: 77, completed: 23, total: 30, inProgress: 0, needsAttention: 3, notStarted: 4 },
      { name: "Grade 12 Course Plan", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 73, completed: 22, total: 30, inProgress: 4, needsAttention: 2, notStarted: 2 },
      { name: "Postsecondary Intention", subtitle: "Student Submission / Counselor Visibility", pct: 67, completed: 20, total: 30, inProgress: 8, needsAttention: 0, notStarted: 2 },
      { name: "Postsecondary List", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 60, completed: 18, total: 30, inProgress: 6, needsAttention: 2, notStarted: 4 },
      { name: "Application-Ready Resume", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 57, completed: 17, total: 30, inProgress: 6, needsAttention: 3, notStarted: 4 },
      { name: "Career / Work-Based Learning Experience", subtitle: "Student Submission / Counselor Visibility", pct: 53, completed: 16, total: 30, inProgress: 11, needsAttention: 0, notStarted: 3 },
      { name: "Recommendation Plan", subtitle: "Student Submission / Counselor Visibility", pct: 60, completed: 18, total: 30, inProgress: 9, needsAttention: 0, notStarted: 3 },
      { name: "Application & Deadline Plan", subtitle: "Student Completion / Counselor Visibility", pct: 57, completed: 17, total: 30, inProgress: 9, needsAttention: 4, notStarted: 0 },
      { name: "Financial Aid & Affordability Preparation", subtitle: "Student Completion / Counselor Visibility", pct: 60, completed: 18, total: 30, inProgress: 9, needsAttention: 0, notStarted: 3 },
      { name: "Grade 11 College & Career Reflection", subtitle: "Student Submission / Counselor Visibility", pct: 57, completed: 17, total: 30, inProgress: 9, needsAttention: 0, notStarted: 4 },
    ],
  },
  12: {
    grade: 12,
    focus: "Completing applications, securing admissions, and finalizing the postsecondary path.",
    students: 30,
    avgDone: 55,
    cards: [
      { name: "Graduation Status", subtitle: "Counselor Verification", reviewNote: "Counselor verification", pct: 60, completed: 18, total: 30, inProgress: 7, needsAttention: 3, notStarted: 2 },
      { name: "Application Progress", subtitle: "Student + Counselor Tracking", pct: 47, completed: 14, total: 30, inProgress: 15, needsAttention: 1, notStarted: 0 },
      { name: "Transcript & Document Status", subtitle: "Counselor Tracking", reviewNote: "Counselor verification", pct: 53, completed: 16, total: 30, inProgress: 9, needsAttention: 3, notStarted: 2 },
      { name: "Recommendation Status", subtitle: "Student + Counselor Tracking", pct: 50, completed: 15, total: 30, inProgress: 14, needsAttention: 0, notStarted: 1 },
      { name: "Financial Aid & FAFSA Status", subtitle: "Student + Counselor Tracking", pct: 48, completed: 13, total: 27, inProgress: 11, needsAttention: 3, notStarted: 0, notApplicable: 3 },
      { name: "Application & Admission Results", subtitle: "Student Submission / Counselor Visibility", pct: 63, completed: 19, total: 30, inProgress: 9, needsAttention: 2, notStarted: 0 },
      { name: "Final Resume", subtitle: "Counselor Review", reviewNote: "Counselor review", pct: 60, completed: 18, total: 30, inProgress: 5, needsAttention: 3, notStarted: 4 },
      { name: "Interview Readiness", subtitle: "Student Completion", pct: 60, completed: 18, total: 30, inProgress: 7, needsAttention: 0, notStarted: 5 },
      { name: "Postsecondary Decision & Transition Plan", subtitle: "Student Submission / Counselor Verification", reviewNote: "Counselor verification", pct: 60, completed: 18, total: 30, inProgress: 7, needsAttention: 0, notStarted: 5 },
      { name: "Senior Exit Survey", subtitle: "Student Completion / Counselor Visibility", pct: 53, completed: 16, total: 30, inProgress: 10, needsAttention: 0, notStarted: 4 },
    ],
  },
};
