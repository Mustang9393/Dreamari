// What each v2 screen changed from the Replit reference, why, and what makes
// it better: the content behind the (i) next to every page title on v2
// (direct instruction, 25 Sept 2026: "add an i icon tooltip on every screen
// with the justification for what has changed from the Replit and why and
// how and what makes it better"). Short by design; the full reasoning with
// the alternatives each choice beat is docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md.

import type { CounselorView } from "../roles";

export type ChangeNote = { changed: string[]; why: string; better: string; /** how the screen orders things and why */ order?: string };

export const CHANGE_NOTES: Record<CounselorView, ChangeNote> = {
  overview: {
    changed: ["Attention list leads the page, students ranked by severity with the reason", "One hero card, plain glass elsewhere; one blue hue plus status colors", "Pathways are Build's own interest worlds in the colors each world wears across the student app, six largest plus Other", "My Plan by grade: one line per grade with steps done and who still owes something; each line opens the Milestone Tracker, where the full school year map lives", "Reviews approved chart keeps the two milestones every grade has; the old Academic Readiness bars were empty for Grades 9-11", "Every card opens its screen; every clickable row carries an arrow (leaves the screen) or a chevron (opens here)"],
    why: "The reference showed three equal donuts, its own seven career families, readiness bars that were blank for three grades, and no way to act.",
    better: "Worst first, one glance, one click to the student, one line per grade that opens the year map, and the same pathway names the student chose in Build.",
    order: "Needs your attention shows At Risk students only, ranked Critical (an overdue or rejected milestone) before High (three or more not started) before Medium, ties by the least-complete roadmap; three rows, See all for the rest. Legends and pathways are ordered by size.",
  },
  students: {
    changed: ["Six columns instead of thirteen; grade and pathway sit under the name", "Sorted attention first, with the reason under the status", "Status and plan pickers in the toolbar, a counselor column for oversight roles", "Opens pre-filtered from the tracker: Not done: [step]", "Card list on phones, paginated at twenty", "Profile: Plan sign-off (student, you, guardian), To-dos you assign with due dates, and a folded Check-ins card, mocked from the SchooLinks staff dashboard as demo-only"],
    why: "The reference's 120-row, 13-column table repeated Lincoln High School and Approved on every row and blank-rendered on phones.",
    better: "The students to act on are at the top with why, on any device, and the tracker hands you exactly the ones who owe a step.",
    order: "Default sort is priority: At Risk, then Needs Attention, then On Track; within a status the same Critical / High / Medium ranking the Overview uses; ties by the least-complete roadmap.",
  },
  milestones: {
    changed: ["The grade tabs pick the grade; the grade's three seasons sit as tiles above the list, with the student My Plan's own season art, and open the season", "Rows are the grade's own My Plan steps, Fall / Winter / Spring, the same list the student sees; all seasons closed until you open one; each season keeps its summary in its header", "Counts come from what students actually did on Dreamari: in-app steps auto-track, steps you verify read your decisions, student-reported steps say not tracked yet", "Every row opens Students filtered to who has not done it", "CSV of the grid; Student Progress' reports are folded in here"],
    why: "The reference tracked its own list of milestones with fixed numbers that never matched the roster or the student app.",
    better: "One list, the student's and yours, live, and one click from any step to the students who owe it.",
    order: "The step with the largest share not started (awaiting review counts half) leads as Focus first; within each season the same order. A step everyone is still working on is not treated as behind.",
  },
  "review-queue": {
    changed: ["One item per pending submission, ordered by due date", "Decisions recorded and shared with every screen, with Undo", "Attachment previewed in place; the student's name opens the profile", "Pane opens as a sheet on phones"],
    why: "The reference hid a student's second submission, ordered by position, and lost the decision on click.",
    better: "Overdue first, a real record of what you said, and the review done without leaving the screen.",
    order: "Most overdue first, then due soonest, then longest waiting. Overdue is Urgent, due within two days is High, else Normal. Nothing here is ordered by who submitted or by roster position.",
  },
  progress: {
    changed: ["Left the menu; its nine reports are the tracker's rows and CSV now", "Still reachable by link for the reference's report views"],
    why: "Overview, Milestone Tracker, Student Progress and Insights were four analytics screens repeating each other (Usman).",
    better: "One tracker on My Plan replaces the nine reports, with the same export.",
    order: "Not in the menu.",
  },
  connect: {
    changed: ["Opens on Questions with the open count; unanswered first", "Announcements can be written, and open to who read them", "Groups open to their feed and can be created"],
    why: "The reference opened on announcements, listed questions in arbitrary order, and its buttons did nothing.",
    better: "The tab with work comes first, and every control does what it says.",
    order: "Questions: new and follow-up first, then viewed and in progress, then answered; newest first within each. Groups: most recently active first. Announcements: newest first.",
  },
  insights: {
    changed: ["Recommendations as one number, one subject, one action", "Ranked lists as full-width bars; chart/list toggles removed", "One blue hue", "Each list opens with its top five; Show all reveals ten"],
    why: "Twelve lines of advice and four tiny sparkline lists asked for reading, not glancing.",
    better: "The three things to do this semester, then the ranking, in one look.",
    order: "Recommendations are the three largest interest clusters, largest first; ranked lists are by count.",
  },
  productivity: {
    changed: ["Left the menu; the four draft tools now live on each student's profile as Drafts", "Drafts are built from the student's own plan, editable, with Copy, Download, Save to notes, or Write my own", "Back in the menu on 25 Sept 2026: this is the batch workspace (many students, one tool); the profile Drafts card is the one-student version", "Group Message tool: an audience by grade, status or pathway, or students you pick by name; one message, reminder or to-do to all of them; letters and briefs stay one student at a time"],
    why: "Pick a student, then generate something belongs inside the student profile, not on its own page (Usman).",
    better: "A draft where the student already is, from their own data, with a manual option.",
    order: "Not in the menu.",
  },
  engagement: {
    changed: ["Two-word tile labels; qualifiers moved into muted units", "One blue hue for both series", "District role sees schools compared first"],
    why: "Labels ran to a clause each and the second series was green, a color reserved for On Track.",
    better: "The same numbers, read in half the time, with the district's comparison on top.",
    order: "District view: schools with the lowest active share first.",
  },
  impact: {
    changed: ["Outcomes against targets as the hero scorecard", "One row of your activity, one of student engagement", "Grades as bars that open the roster; ASCA as three short columns", "Achievements list and compliance summary removed"],
    why: "The reference stated each number three times across eight sections.",
    better: "A principal reads whether the period moved the numbers in one screen, with the evidence under it.",
    order: "Outcomes are shown against their target, the one furthest below target named in the verdict; grades and counselors are ranked lowest on-track first.",
  },
  settings: {
    changed: ["Role is a proper picker and drives the whole dashboard", "Permissions shown for your role only", "Caseload card titled by role", "Profile stays open; permissions, notifications, caseload and academic year fold behind their summary"],
    why: "The reference listed all four roles' permissions to every reader.",
    better: "Your role, your permissions, and the dashboard follows.",
    order: "No ranking on this screen.",
  },
  counselors: {
    changed: ["New screen for the Lead Counselor and School Administrator", "Caseloads ranked by who needs support, with pending and overdue counts", "Rows open the roster filtered to that counselor"],
    why: "The reference had one persona and no view across counselors.",
    better: "A lead sees which caseload to help first and gets there in one click.",
    order: "Lowest on-track rate first; ties by the most unresolved work (overdue plus changes requested).",
  },
  readiness: {
    changed: ["New screen for administrators", "One card per target, rows by grade or by school, attention first"],
    why: "The reference had no target view; readiness was scattered across screens.",
    better: "Every target, every grade or school, on one page.",
    order: "Within each target, the grade or school with the lowest value first. Rows that meet the target stay quiet; amber within ten points of target, red beyond.",
  },
  reports: {
    changed: ["New screen for administrators", "Templates built from live numbers, downloaded as CSV", "Schedule a template: weekly or monthly, a day, recipients; the list is what a delivery job would run (mocked from the SchooLinks Report Center)"],
    why: "The reference offered a single button that did nothing.",
    better: "A report that reflects today's data, in a format a board can open.",
    order: "Templates in a fixed order; generated reports newest first.",
  },
  schools: {
    changed: ["New screen for the District Administrator", "Schools ranked by targets met, then one card per target"],
    why: "The reference had no district view at all.",
    better: "Which school needs support, and on which measure, at a glance.",
    order: "Fewest targets met first, then lowest on-track rate; each target card ranks lowest first.",
  },
  "school-impact": {
    changed: ["New screen for the Lead Counselor: the impact report for the whole school with a by-counselor card"],
    why: "The reference's report was one counselor's only.",
    better: "The school's story in the same shape a counselor's report uses.",
    order: "Same as My Impact; the by-counselor card ranks the lowest on-track caseload first.",
  },
};
