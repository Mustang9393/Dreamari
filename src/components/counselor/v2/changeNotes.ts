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
    changed: ["Attention list leads the page, students ranked by severity with the reason", "One hero card, plain glass elsewhere; one blue hue plus status colors", "Pathways are the reference's own seven career tracks, verbatim, in a spectral color sequence, six largest plus Other", "Career Readiness and Academic Readiness are the reference's own two bar charts, same grouping and grades, in this dashboard's solid bar style", "Every card opens its screen; every clickable row carries an arrow (leaves the screen) or a chevron (opens here)"],
    why: "The reference showed three equal donuts and no way to act.",
    better: "Worst first, one glance, one click to the student, the same pathway names and readiness charts the reference shows.",
    order: "Needs your attention shows At Risk students only, ranked Critical (an overdue or rejected milestone) before High (three or more not started) before Medium, ties by the least-complete roadmap; three rows, See all for the rest. Legends and pathways are ordered by size.",
  },
  students: {
    changed: ["Six columns instead of thirteen; grade and pathway sit under the name", "Sorted attention first, with the reason under the status", "Status and plan pickers in the toolbar, a counselor column for oversight roles", "Opens pre-filtered from the tracker: Not done: [step]", "Card list on phones, paginated at twenty", "Profile: Plan sign-off (student, you, guardian), To-dos you assign with due dates, and a folded Check-ins card, mocked from the SchooLinks staff dashboard as demo-only"],
    why: "The reference's 120-row, 13-column table repeated Lincoln High School and Approved on every row and blank-rendered on phones.",
    better: "The students to act on are at the top with why, on any device, and the tracker hands you exactly the ones who owe a step.",
    order: "Default sort is priority: At Risk, then Needs Attention, then On Track; within a status the same Critical / High / Medium ranking the Overview uses; ties by the least-complete roadmap.",
  },
  milestones: {
    changed: ["Rows are the reference's own named checkpoints for the grade, verbatim (Grade 9 has 7, Grade 10 has 8, Grade 11 has 11, Grade 12 has 10), each with its exact completion % and classification", "Grouped into Fall / Winter / Spring by the reference's own listed order; the grade tabs pick the grade, three season tiles pick the season, closed until you open one", "The Lead Counselor's counselor picker scales every number to that counselor's own share of the grade", "Every row opens Students filtered to who has not done it", "CSV of the grid"],
    why: "A content audit (25 Sept 2026, Maisha: \"keep content the same as that's needed for counselors\") found an earlier pass had replaced this screen's rows with the student app's own My Plan steps instead of keeping the reference's curriculum alongside it, so the checkpoints a counselor actually reports against had gone missing from v2.",
    better: "The exact checklist the reference tracked, with the same drill-through and one-click-to-the-students this dashboard already does everywhere else.",
    order: "The checkpoint with the largest share not started (needing attention counts half) leads as Focus first; within each season the same order.",
  },
  "review-queue": {
    changed: ["One item per pending submission, ordered by due date", "Decisions recorded and shared with every screen, with Undo", "Attachment opens in a centered document viewer, a realistic page built from the student's own data; the student's name opens the profile", "Pane opens as a sheet on phones"],
    why: "The reference hid a student's second submission, ordered by position, and lost the decision on click. The attachment used to expand into a plain-text card in place; reported as unrealistic and asked for a real preview.",
    better: "Overdue first, a real record of what you said, the review done without leaving the screen, and a document that reads like the file it stands in for.",
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
    changed: ["Recommendations as one number, one subject, one action, with \"+2 more\" for the reference's other two suggestions", "Ranked lists as full-width bars; chart/list toggles removed", "One blue hue", "Each list opens with its top five; Show all reveals ten"],
    why: "Twelve lines of advice and four tiny sparkline lists asked for reading, not glancing.",
    better: "The three things to do this semester, then the ranking, in one look; every suggestion the reference gave is still one click away.",
    order: "Recommendations are the three largest interest clusters, largest first; ranked lists are by count.",
  },
  productivity: {
    changed: ["Back in the menu on 25 Sept 2026: this is the batch workspace (many students, one tool); the profile Drafts card is the one-student version", "Drafts are built from the student's own plan, editable, with Copy, Download, Save to notes, or Write my own", "Group Message tool: an audience by grade, status or pathway, or students you pick by name; one message, reminder or to-do to all of them; letters and briefs stay one student at a time", "Tool switcher is a left rail on desktop (the same active-row language as the app's own sidebar nav), a chip row on phones; every tool's long description sentence is gone; a dashed empty-state pane fills the space before a draft exists"],
    why: "Pick a student, then generate something belongs inside the student profile, not on its own page (Usman); reported later the same day as \"the worst UI right now, lots of long copy, not looking like a proper workspace tool.\"",
    better: "A draft where the student already is, from their own data, with a manual option; the tool itself reads as a workspace, not a form with a paragraph above it.",
    order: "Tools list top to bottom in the rail/chip row: the four personal drafts, then Group Message, then Students Needing Attention (no student needed).",
  },
  engagement: {
    changed: ["Two-word tile labels; qualifiers moved into muted units", "One blue hue for both series", "District role sees schools compared first"],
    why: "Labels ran to a clause each and the second series was green, a color reserved for On Track.",
    better: "The same numbers, read in half the time, with the district's comparison on top.",
    order: "District view: schools with the lowest active share first.",
  },
  impact: {
    changed: ["Outcomes against targets as the hero scorecard, always visible", "Activity & Engagement, By Grade (and Counselor), and ASCA Framework are tabs: one on screen at a time", "Print and Principal report compile every tab together, whichever one is open", "Achievements list and compliance summary reshaped into the page's own cards, not deleted: the school-average comparator, the seniors-applying count and the confidentiality line are folded into Outcomes, Activity and the footer"],
    why: "The reference stated each number three times across eight sections; showing all three tabs' worth of cards at once on screen repeated that overload.",
    better: "A principal reads whether the period moved the numbers in one screen; a counselor viewing it reads one section at a time, and the printed or shared report still has everything, including the two figures a content audit found had gone missing.",
    order: "Outcomes are shown against their target, the one furthest below target named in the verdict; grades and counselors are ranked lowest on-track first; tabs read left to right in the order a counselor would check them.",
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
