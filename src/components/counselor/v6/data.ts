import { useMemo } from "react";
import { attentionRank, type CounselorStudent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { sisFor } from "@/lib/counselorSis";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
// DEMO-ONLY: V6 is a separate interaction prototype. Academic, preference,
// labor-market and meeting fixtures below are assumptions, not SIS/API records.
// Need first (Chandu, 7 Oct 2026: "prioritise based on what's most valuable
// and actionable"): at-risk and needs-attention students lead, most urgent
// first, so the suggested next conversation, Prepare's default student and
// the directory all open on someone who needs the counselor.
const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
export const sortByNeed = (roster: CounselorStudent[]) => [...roster].sort((a, b) =>
  NEED[a.status] - NEED[b.status] || (a.status === "On Track" ? a.name.localeCompare(b.name) : attentionRank(a, b)));
/** The live caseload, need first (8 Oct 2026): v6 had copied getRoster()
 *  once at import, so review decisions, the live student and coverage never
 *  reached Home, Students or Analytics. This is the reviewed roster v5 reads. */
export function useStudents(): CounselorStudent[] {
  const roster = useReviewedRoster();
  return useMemo(() => sortByNeed(roster), [roster]);
}
export const featured = [
  "Registered Nurse",
  "Software Engineer",
  "Investment Banking",
  "Electrician",
  "Food Scientist",
  "Animator",
  "Data Scientist",
  "School Counselor",
  "Air Traffic Controller",
  "Truck Driver",
]
  .map((title) => ALL_CATALOG_CAREERS.find((c) => c.title === title)!)
  .filter(Boolean);
export const domains = [
  "Readiness",
  "Postsecondary",
  "Career & WBL",
  "Risk",
  "Outcomes",
  "Engagement",
] as const;
export type Domain = (typeof domains)[number];
export type Indicator = {
  name: string;
  ids: string[];
  eligible: string[];
  definition: string;
  action: string;
};
/** Outcomes is not a caseload measure: it is prior graduating classes
 *  (OUTCOMES below), so it has no indicators over today's students. */
export function indicators(domain: Exclude<Domain, "Outcomes">, students: CounselorStudent[]): Indicator[] {
  const all = students.map((s) => s.id),
    seniors = students.filter((s) => s.grade === 12).map((s) => s.id);
  const metric = (
    name: string,
    eligible: string[],
    test: (s: CounselorStudent) => boolean,
    definition: string,
    action: string,
  ) => ({
    name,
    eligible,
    ids: students
      .filter((s) => eligible.includes(s.id) && test(s))
      .map((s) => s.id),
    definition,
    action,
  });
  switch (domain) {
    case "Readiness":
      return [
        metric(
          "On track",
          all,
          (s) => s.status === "On Track",
          "Students with an On Track caseload status. Prototype status, not a verified graduation audit.",
          "Review progress",
        ),
        metric(
          "Academic plan reviewed",
          all,
          (s) => s.milestones["Academic Plan"] === "Approved",
          "Counselor-approved academic plans in the reference roster.",
          "Review academic plans",
        ),
        metric(
          "Assessment complete",
          all,
          (s) =>
            ["Approved", "Completed"].includes(
              s.milestones["Career Assessment"],
            ),
          "Students who completed their career assessment.",
          "Discuss assessment",
        ),
      ];
    case "Postsecondary":
      return [
        metric(
          "Plan chosen",
          seniors,
          (s) => s.postsecondaryIntent !== "Undecided",
          "Seniors with a stated destination after high school.",
          "Discuss a destination",
        ),
        metric(
          "Applications ready",
          seniors,
          (s) => ["Approved", "Completed"].includes(s.milestones.Applications),
          "Seniors with an approved or completed application milestone.",
          "Review applications",
        ),
        metric(
          "Aid complete",
          seniors,
          (s) =>
            ["Approved", "Completed"].includes(s.milestones["Financial Aid"]),
          "Senior financial-aid milestone marked complete; not a verified FAFSA feed.",
          "Review financial aid",
        ),
      ];
    // From each student's SIS record, the same one v5 Analytics reads
    // (8 Oct 2026): these were picked by list position (i % 3), so a
    // student's place in the list decided their WBL hours.
    case "Career & WBL":
      return [
        metric(
          "WBL participation",
          all,
          (s) => sisFor(s).cte.wblHours > 0,
          "Students with any logged work-based learning hours.",
          "Find a placement",
        ),
        metric(
          "Hours verified",
          all,
          (s) => sisFor(s).cte.wblHours >= 20,
          "Students with at least 20 work-based learning hours.",
          "Review hours",
        ),
        metric(
          "Certification earned",
          seniors,
          (s) => !!sisFor(s).cte.credential,
          "Seniors who earned their program's industry credential.",
          "Review evidence",
        ),
      ];
    case "Risk":
      return [
        metric(
          "Needs attention",
          all,
          (s) => s.status !== "On Track",
          "Students marked Needs Attention or At Risk in the reference roster.",
          "Prepare an intervention",
        ),
        metric(
          "No destination",
          seniors,
          (s) => s.postsecondaryIntent === "Undecided",
          "Seniors without a stated postsecondary plan.",
          "Explore options",
        ),
        metric(
          "Behind on milestones",
          all,
          (s) => Object.values(s.milestones).includes("Overdue"),
          "Students with at least one overdue milestone.",
          "Agree a next step",
        ),
      ];
    default:
      return [
        metric(
          "Careers saved",
          all,
          (s) => s.engagement.careersSaved > 0,
          "Students who saved at least one career.",
          "Discuss interests",
        ),
        metric(
          "Simulation explored",
          all,
          (s) => s.engagement.simulations > 0,
          "Students with at least one recorded simulation.",
          "Discuss experience",
        ),
        metric(
          "Schools saved",
          all,
          (s) => s.engagement.collegesSaved > 0,
          "Students who saved at least one school.",
          "Review school list",
        ),
      ];
  }
}

// Outcomes are prior graduating classes, never today's seniors (8 Oct 2026:
// v6 listed current seniors as graduated). DEMO-ONLY: the same figures as
// v5's Outcomes (v5/Analytics.tsx) until National Student Clearinghouse
// data is connected.
export const OUTCOME_CLASSES = ["2021", "2022", "2023", "2024", "2025"];
export const OUTCOMES: { label: string; byClass: number[] }[] = [
  { label: "Enrolled the fall after", byClass: [58, 61, 60, 64, 68] },
  { label: "Still enrolled, year two", byClass: [74, 76, 78, 79, 81] },
  { label: "Working or serving", byClass: [18, 19, 21, 20, 22] },
];
export const CLASS_2025_DESTINATIONS = [
  { label: "4-year college", value: 41 },
  { label: "2-year college", value: 27 },
  { label: "Working", value: 17 },
  { label: "Trade school", value: 9 },
  { label: "Military", value: 5 },
];
