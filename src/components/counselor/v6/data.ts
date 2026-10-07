import { attentionRank, getRoster, type CounselorStudent } from "@/lib/counselorRoster";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
// DEMO-ONLY: V6 is a separate interaction prototype. Academic, preference,
// labor-market and meeting fixtures below are assumptions, not SIS/API records.
// Need first (Chandu, 7 Oct 2026: "prioritise based on what's most valuable
// and actionable"): at-risk and needs-attention students lead, most urgent
// first, so the suggested next conversation, Prepare's default student and
// the directory all open on someone who needs the counselor.
const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
export const students = [...getRoster()].sort((a, b) =>
  NEED[a.status] - NEED[b.status] || (a.status === "On Track" ? a.name.localeCompare(b.name) : attentionRank(a, b)));
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
export function briefFor(s: CounselorStudent) {
  const i = students.findIndex((p) => p.id === s.id);
  return {
    gpa: (2.7 + (i % 12) / 10).toFixed(1),
    state: i % 2 ? "New Jersey" : "Florida",
    budget: 15000 + (i % 4) * 5000,
    subject: s.careerTrack.includes("Health")
      ? "Biology"
      : s.careerTrack.includes("Business")
        ? "Math"
        : "Problem solving",
    credits: 18 + (i % 5),
    requiredCredits: 24,
  };
}
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
export function indicators(domain: Domain): Indicator[] {
  const all = students.map((s) => s.id),
    seniors = students.filter((s) => s.grade === 12).map((s) => s.id);
  const metric = (
    name: string,
    eligible: string[],
    test: (s: CounselorStudent, i: number) => boolean,
    definition: string,
    action: string,
  ) => ({
    name,
    eligible,
    ids: students
      .filter((s, i) => eligible.includes(s.id) && test(s, i))
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
    case "Career & WBL":
      return [
        metric(
          "WBL participation",
          all,
          (_, i) => i % 3 === 0,
          "Assumed participation in a placement, job shadow or internship.",
          "Find a placement",
        ),
        metric(
          "Hours verified",
          all,
          (_, i) => i % 5 === 0,
          "Assumed students with at least 20 verified WBL hours.",
          "Review hours",
        ),
        metric(
          "Certification earned",
          seniors,
          (_, i) => i % 4 === 0,
          "Assumed senior certification completions.",
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
    case "Outcomes":
      return [
        metric(
          "Graduation confirmed",
          seniors,
          (_, i) => i % 8 !== 0,
          "Illustrative prior-cohort graduation outcome, using demo senior identities.",
          "Review records",
        ),
        metric(
          "Enrollment confirmed",
          seniors,
          (_, i) => i % 3 !== 0,
          "Illustrative postsecondary enrollment, not Clearinghouse data.",
          "Follow up",
        ),
        metric(
          "Destination verified",
          seniors,
          (_, i) => i % 4 !== 0,
          "Illustrative verified college, trade, military or workforce destination.",
          "Verify destination",
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
