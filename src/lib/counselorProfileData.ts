// Per-student drill-down data from the Replit reference, captured from all
// 120 rendered /students/:id pages on 24 Sept 2026, so v1's Student Profile
// matches the reference 1:1. Row order matches counselorRosterData.ts (row i
// is reference student id i + 1).
//
// Each row: [dob, statuses, dreamScore, dailyDrops, simulations,
//            careersSaved, collegesSaved, challenges, questions, posts, flag]
//
// `statuses` is one letter per milestone the reference shows for that
// student's grade, in MILESTONE_KEYS order (Grade 9 shows the first 3,
// Grade 10 the first 5, Grade 11 the first 6, Grade 12 all 11):
//   A Approved · P Pending Review · C Changes Requested · I In Progress
//   N Not Started · D Completed · O Overdue
// `flag` is the reference's support-flag reason, or null.

export type ReferenceProfile = [
  dob: string,
  statuses: string,
  dreamScore: number,
  dailyDrops: number,
  simulations: number,
  careersSaved: number,
  collegesSaved: number,
  challenges: number,
  questions: number,
  posts: number,
  flag: string | null,
];

export const STATUS_CODES = {
  A: "Approved",
  P: "Pending Review",
  C: "Changes Requested",
  I: "In Progress",
  N: "Not Started",
  D: "Completed",
  O: "Overdue",
} as const;

/** How many of the 11 milestones the reference tracks per grade. */
export const MILESTONES_FOR_GRADE: Record<number, number> = { 9: 3, 10: 5, 11: 6, 12: 11 };

/** The reference's career-cluster label per pathway (its `Kue` table). */
export const CLUSTER_BY_TRACK: Record<string, string> = {
  Technology: "Information Technology & Engineering",
  Healthcare: "Health Science & Medicine",
  "Finance & Business": "Business, Finance & Marketing",
  "Skilled Trades": "Architecture & Construction",
  "Arts & Media": "Arts, Audio/Video & Communications",
  Education: "Education & Training",
  "Law & Government": "Law, Public Safety & Government",
};

/** The reference's Top 5 career matches per pathway (its `PD` table). */
export const TOP5_BY_TRACK: Record<string, { title: string; pct: number }[]> = {
  Technology: [{ title: "Software Engineer", pct: 94 }, { title: "Data Scientist", pct: 88 }, { title: "Cybersecurity Analyst", pct: 82 }, { title: "UX / UI Designer", pct: 76 }, { title: "IT Project Manager", pct: 71 }],
  Healthcare: [{ title: "Registered Nurse", pct: 93 }, { title: "Physician / Doctor", pct: 87 }, { title: "Physical Therapist", pct: 84 }, { title: "Healthcare Administrator", pct: 79 }, { title: "Medical Lab Scientist", pct: 73 }],
  "Finance & Business": [{ title: "Financial Analyst", pct: 91 }, { title: "Entrepreneur / Business Owner", pct: 86 }, { title: "Investment Banker", pct: 82 }, { title: "Marketing Manager", pct: 77 }, { title: "Accountant / CPA", pct: 74 }],
  "Skilled Trades": [{ title: "Electrician", pct: 95 }, { title: "HVAC Technician", pct: 90 }, { title: "Plumber / Pipefitter", pct: 86 }, { title: "Construction Manager", pct: 81 }, { title: "Welder", pct: 77 }],
  "Arts & Media": [{ title: "Graphic Designer", pct: 92 }, { title: "Film & Video Director", pct: 87 }, { title: "Content Creator", pct: 83 }, { title: "Art Director", pct: 78 }, { title: "Photographer", pct: 74 }],
  Education: [{ title: "Teacher / Educator", pct: 93 }, { title: "School Counselor", pct: 89 }, { title: "School Principal", pct: 83 }, { title: "Curriculum Developer", pct: 79 }, { title: "Social Worker", pct: 74 }],
  "Law & Government": [{ title: "Attorney / Lawyer", pct: 91 }, { title: "Policy Analyst", pct: 86 }, { title: "Public Administrator", pct: 82 }, { title: "Paralegal", pct: 78 }, { title: "Law Enforcement Officer", pct: 73 }],
};

/** "Education Goals" on the reference's profile, derived from the plan. */
export function educationGoalsFor(plan: string): string[] {
  switch (plan) {
    case "4-Year College": return ["High School", "College / University"];
    case "2-Year College": return ["High School", "Community College"];
    case "Trade/Technical School": return ["High School", "Trade / Technical School"];
    case "Military": return ["High School", "Military Service"];
    case "Workforce": return ["High School", "Enter Workforce"];
    default: return ["High School Diploma"];
  }
}

/** The reference's Plan Progress list (identical for every student; its
 *  6- and 12-month tabs are placeholder text). */
export const PLAN_PROGRESS_3MO: { name: string; status: "In Progress" | "Not Started"; due: string }[] = [
  { name: "College Application Essays", status: "In Progress", due: "2024-02-01" },
  { name: "FAFSA Submission", status: "Not Started", due: "2024-02-15" },
  { name: "Recommendation Letter Request", status: "In Progress", due: "2024-02-20" },
  { name: "Transcript Submission", status: "Not Started", due: "2024-03-01" },
];

export const REFERENCE_PROFILES: ReferenceProfile[] = [
  ["Feb 08, 2005", "AAAAAAAIIIA", 88, 87, 12, 15, 22, 8, 3, 7, null],
  ["Mar 15, 2006", "AAAAPI", 82, 74, 9, 11, 18, 6, 2, 5, null],
  ["Apr 22, 2007", "AAAAI", 75, 62, 7, 9, 12, 4, 1, 3, null],
  ["May 02, 2005", "AAAAAAAIIIA", 79, 80, 10, 8, 5, 7, 4, 6, null],
  ["Jun 09, 2006", "ACAINI", 68, 48, 5, 12, 15, 3, 5, 2, "Behind on resume and career pathway selection"],
  ["Jul 16, 2008", "API", 71, 35, 4, 7, 3, 2, 2, 1, null],
  ["Aug 23, 2005", "AAAAAAAIPIA", 85, 82, 11, 10, 20, 9, 3, 8, null],
  ["Sep 03, 2007", "AAIAN", 72, 55, 6, 8, 10, 4, 1, 3, null],
  ["Oct 10, 2006", "AACANI", 64, 42, 3, 6, 8, 2, 6, 1, "Low activity, missing key milestones"],
  ["Nov 17, 2008", "AIN", 69, 32, 3, 5, 2, 1, 1, 0, null],
  ["Dec 24, 2005", "AAAAAAADADD", 91, 92, 15, 18, 25, 12, 2, 10, null],
  ["Jan 04, 2006", "AAAAII", 80, 68, 8, 10, 14, 5, 2, 4, null],
  ["Feb 11, 2007", "AAAAN", 74, 58, 6, 9, 11, 4, 1, 3, null],
  ["Mar 18, 2008", "AIN", 67, 28, 2, 8, 1, 1, 0, 0, null],
  ["Apr 25, 2005", "AAOANINNNNN", 58, 22, 1, 3, 2, 0, 8, 0, "Senior with very low completion rate, multiple overdue items"],
  ["May 05, 2006", "AAAAAI", 84, 76, 10, 13, 19, 7, 2, 6, null],
  ["Jun 12, 2007", "AAAAI", 77, 64, 7, 8, 13, 5, 1, 4, null],
  ["Jul 19, 2005", "AAAAAAAIIIA", 86, 84, 11, 7, 4, 8, 3, 7, null],
  ["Aug 26, 2008", "API", 70, 36, 4, 6, 5, 2, 1, 1, null],
  ["Sep 06, 2006", "AAIANI", 66, 46, 4, 7, 9, 2, 4, 2, "Falling behind on Grade 11 milestones"],
  ["Oct 13, 2005", "AAAAAIIINIA", 81, 71, 9, 14, 17, 6, 2, 5, null],
  ["Nov 20, 2007", "AAAAI", 78, 66, 8, 11, 13, 5, 1, 4, null],
  ["Dec 27, 2008", "AIP", 72, 38, 4, 6, 4, 3, 2, 1, null],
  ["Jan 07, 2006", "AAAAPI", 80, 70, 9, 10, 16, 6, 1, 5, null],
  ["Feb 14, 2005", "AAAAAAAIAIA", 89, 88, 13, 16, 24, 10, 2, 9, null],
  ["Mar 21, 2007", "AAAAN", 73, 56, 6, 6, 3, 4, 1, 3, null],
  ["Apr 01, 2008", "AIN", 68, 30, 3, 5, 2, 1, 1, 0, null],
  ["May 08, 2006", "AAIANI", 62, 40, 3, 9, 7, 2, 5, 1, "Low engagement, behind on key milestones"],
  ["Jun 15, 2005", "AAAAAAAIPIA", 85, 82, 11, 15, 21, 8, 2, 7, null],
  ["Jul 22, 2007", "AAAAI", 76, 62, 7, 9, 12, 5, 1, 4, null],
  ["Aug 02, 2008", "API", 71, 34, 4, 7, 4, 2, 1, 1, null],
  ["Sep 09, 2006", "AAAAII", 77, 65, 8, 10, 14, 5, 2, 4, null],
  ["Oct 16, 2005", "AAAAAAAIIIA", 83, 78, 10, 8, 6, 7, 3, 6, null],
  ["Nov 23, 2007", "AAIAN", 71, 52, 5, 10, 8, 3, 2, 2, null],
  ["Dec 03, 2008", "AIN", 69, 33, 3, 6, 3, 2, 1, 1, null],
  ["Jan 10, 2006", "AAAAII", 78, 67, 8, 9, 15, 6, 1, 5, null],
  ["Feb 17, 2005", "ACOININNNNN", 55, 18, 1, 4, 2, 0, 9, 0, "At-risk senior with multiple overdue items"],
  ["Mar 24, 2007", "AAAAN", 75, 59, 6, 9, 11, 4, 1, 3, null],
  ["Apr 04, 2008", "AIN", 68, 31, 3, 5, 2, 1, 1, 0, null],
  ["May 11, 2006", "AAAAAI", 82, 74, 10, 13, 18, 7, 2, 6, null],
  ["Jun 18, 2008", "AIN", 73, 43, 7, 9, 3, 5, 1, 3, null],
  ["Jul 25, 2008", "API", 76, 51, 7, 9, 3, 5, 1, 3, null],
  ["Aug 05, 2008", "AIN", 68, 36, 6, 8, 3, 4, 1, 3, null],
  ["Sep 12, 2008", "AIN", 74, 47, 7, 9, 3, 5, 1, 3, null],
  ["Oct 19, 2008", "AIN", 70, 39, 7, 8, 3, 5, 1, 3, null],
  ["Nov 26, 2008", "API", 77, 54, 7, 9, 3, 5, 1, 3, null],
  ["Dec 06, 2008", "AIN", 62, 29, 6, 7, 2, 4, 5, 2, "Low early engagement, behind on career assessment"],
  ["Jan 13, 2008", "AIN", 72, 46, 7, 9, 3, 5, 1, 3, null],
  ["Feb 20, 2008", "AIN", 71, 41, 7, 8, 3, 5, 1, 3, null],
  ["Mar 27, 2008", "API", 78, 56, 7, 9, 3, 5, 1, 3, null],
  ["Apr 07, 2008", "AIN", 67, 33, 6, 8, 3, 4, 1, 3, null],
  ["May 14, 2008", "API", 75, 49, 7, 9, 3, 5, 1, 3, null],
  ["Jun 21, 2008", "AIN", 72, 42, 7, 9, 3, 5, 1, 3, null],
  ["Jul 01, 2008", "API", 79, 58, 7, 9, 3, 5, 1, 3, null],
  ["Aug 08, 2008", "AON", 58, 23, 5, 7, 2, 4, 5, 2, "Very low activity, missing career assessment and academic plan"],
  ["Sep 15, 2008", "AIN", 73, 45, 7, 9, 3, 5, 1, 3, null],
  ["Oct 22, 2008", "AIN", 70, 40, 7, 8, 3, 5, 1, 3, null],
  ["Nov 02, 2008", "API", 76, 52, 7, 9, 3, 5, 1, 3, null],
  ["Dec 09, 2008", "AIN", 64, 31, 6, 8, 2, 4, 5, 3, "Behind on academic plan, needs check-in"],
  ["Jan 16, 2008", "API", 78, 59, 7, 9, 15, 5, 1, 3, null],
  ["Feb 23, 2008", "AIN", 69, 37, 6, 8, 3, 4, 1, 3, null],
  ["Mar 03, 2007", "AAAAI", 77, 65, 7, 9, 15, 5, 1, 3, null],
  ["Apr 10, 2007", "AAAAI", 80, 69, 8, 10, 16, 5, 1, 4, null],
  ["May 17, 2007", "AAAAN", 74, 55, 7, 9, 14, 5, 1, 3, null],
  ["Jun 24, 2007", "AAAAI", 81, 72, 8, 10, 16, 5, 1, 4, null],
  ["Jul 04, 2007", "AAAAN", 76, 60, 7, 9, 3, 5, 1, 3, null],
  ["Aug 11, 2007", "AAAAN", 69, 50, 6, 8, 13, 4, 4, 3, "Behind on resume draft, needs encouragement"],
  ["Sep 18, 2007", "AAAAP", 84, 78, 8, 10, 16, 6, 0, 4, null],
  ["Oct 25, 2007", "AAAAI", 77, 62, 7, 9, 15, 5, 1, 3, null],
  ["Nov 05, 2007", "AAAAI", 79, 67, 7, 9, 15, 5, 1, 3, null],
  ["Dec 12, 2007", "AAIAN", 66, 43, 6, 8, 3, 4, 4, 3, "Behind on career pathway selection"],
  ["Jan 19, 2007", "AAAAI", 82, 72, 8, 10, 16, 5, 1, 4, null],
  ["Feb 26, 2007", "AAAAI", 78, 64, 7, 9, 15, 5, 1, 3, null],
  ["Mar 06, 2007", "AAAAN", 75, 58, 7, 9, 3, 5, 1, 3, null],
  ["Apr 13, 2007", "AAAAI", 82, 73, 8, 10, 16, 5, 1, 4, null],
  ["May 20, 2007", "AAAAN", 73, 49, 7, 9, 14, 5, 1, 3, null],
  ["Jun 27, 2007", "AAAAI", 80, 68, 8, 10, 16, 5, 1, 4, null],
  ["Jul 07, 2007", "AAIAN", 60, 36, 6, 7, 2, 4, 5, 2, "Very behind, low engagement, no career pathway selected"],
  ["Aug 14, 2007", "AAAAI", 78, 66, 7, 9, 15, 5, 1, 3, null],
  ["Sep 21, 2007", "AAAAN", 76, 61, 7, 9, 3, 5, 1, 3, null],
  ["Oct 01, 2007", "AAAAI", 83, 75, 8, 10, 16, 5, 0, 4, null],
  ["Nov 08, 2007", "AAAAI", 77, 63, 7, 9, 15, 5, 1, 3, null],
  ["Dec 15, 2006", "AAAAAA", 85, 81, 8, 10, 17, 6, 0, 4, null],
  ["Jan 22, 2006", "AAAAII", 81, 73, 8, 10, 16, 5, 1, 4, null],
  ["Feb 02, 2006", "AAAAII", 78, 65, 7, 9, 15, 5, 1, 3, null],
  ["Mar 09, 2006", "AAAAII", 80, 71, 8, 10, 16, 5, 1, 4, null],
  ["Apr 16, 2006", "AAAAII", 79, 68, 7, 9, 3, 5, 1, 3, null],
  ["May 23, 2006", "AAAAAA", 86, 83, 8, 10, 17, 6, 0, 4, null],
  ["Jun 03, 2006", "AAIANI", 65, 42, 6, 8, 2, 4, 4, 3, "Missing key Grade 11 milestones, needs intervention"],
  ["Jul 10, 2006", "AAAAAA", 83, 77, 8, 10, 16, 5, 0, 4, null],
  ["Aug 17, 2006", "AAAAII", 80, 70, 8, 10, 16, 5, 1, 4, null],
  ["Sep 24, 2006", "AAAAII", 77, 63, 7, 9, 15, 5, 1, 3, null],
  ["Oct 04, 2006", "AAAAAA", 87, 86, 8, 10, 17, 6, 0, 4, null],
  ["Nov 11, 2006", "AAAANI", 72, 56, 7, 9, 14, 5, 4, 3, "Behind on college exploration and postsecondary planning"],
  ["Dec 18, 2006", "AAAAII", 82, 74, 8, 10, 16, 5, 1, 4, null],
  ["Jan 25, 2006", "AAAAAA", 84, 79, 8, 10, 16, 6, 0, 4, null],
  ["Feb 05, 2006", "AAAAII", 79, 67, 7, 9, 3, 5, 1, 3, null],
  ["Mar 12, 2006", "AAIANI", 58, 30, 5, 7, 2, 4, 5, 2, "At risk: very low completion for Grade 11, multiple overdue milestones"],
  ["Apr 19, 2006", "AAAAII", 81, 72, 8, 10, 16, 5, 1, 4, null],
  ["May 26, 2006", "AAAANI", 76, 60, 7, 9, 15, 5, 1, 3, null],
  ["Jun 06, 2006", "AAAAAI", 83, 76, 8, 10, 16, 5, 0, 4, null],
  ["Jul 13, 2005", "AAAAAAADADD", 89, 89, 8, 11, 17, 6, 0, 4, null],
  ["Aug 20, 2005", "AAAAAAAIAIA", 86, 84, 8, 10, 17, 6, 0, 4, null],
  ["Sep 27, 2005", "AAAAAAAIAIA", 85, 85, 8, 10, 3, 6, 0, 4, null],
  ["Oct 07, 2005", "AAAAAAADADD", 90, 91, 9, 11, 18, 6, 0, 4, null],
  ["Nov 14, 2005", "AAAAAAAIIIA", 82, 76, 8, 10, 16, 5, 1, 4, null],
  ["Dec 21, 2005", "AAAAAAAIIIA", 84, 81, 8, 10, 16, 6, 0, 4, null],
  ["Jan 01, 2005", "AAAAAAAIIIA", 80, 72, 8, 10, 16, 5, 1, 4, null],
  ["Feb 08, 2005", "AAAAAAADADD", 88, 88, 8, 11, 17, 6, 0, 4, null],
  ["Mar 15, 2005", "AAAAAAAIIIA", 83, 79, 8, 10, 3, 5, 0, 4, null],
  ["Apr 22, 2005", "AAAAAAADADD", 92, 94, 9, 11, 18, 6, 0, 4, null],
  ["May 02, 2005", "AAAAAAAIIIA", 76, 67, 7, 9, 3, 5, 4, 3, "Senior without finalized postsecondary plan, needs counselor meeting"],
  ["Jun 09, 2005", "AAAAAAAIAIA", 87, 86, 8, 10, 17, 6, 0, 4, null],
  ["Jul 16, 2005", "AAAAAAAIIIA", 81, 74, 8, 10, 16, 5, 1, 4, null],
  ["Aug 23, 2005", "AAAAAAAIIIA", 84, 80, 8, 10, 16, 6, 0, 4, null],
  ["Sep 03, 2005", "AOOININNNNN", 52, 17, 5, 6, 2, 3, 5, 2, "Critical: senior with very low completion and multiple overdue items — urgent intervention needed"],
  ["Oct 10, 2005", "AAAAAAAIAIA", 87, 86, 8, 10, 17, 6, 0, 4, null],
  ["Nov 17, 2005", "AAAAAAADADD", 91, 92, 9, 11, 18, 6, 0, 4, null],
  ["Dec 24, 2005", "AAAAAAAIIIA", 82, 75, 8, 10, 16, 5, 1, 4, null],
  ["Jan 04, 2005", "AAAAAAAIAIA", 85, 82, 8, 10, 3, 6, 0, 4, null],
];
