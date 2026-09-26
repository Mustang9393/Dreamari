// What each v2 screen changed from the Replit reference and why: the
// content behind the (i) at the top right of every v2 screen. Rewritten
// 26 Sept 2026 to describe the FINAL designs (direct instruction: "in the
// (i) button on each screen show the final justification of the final
// designs. Explain what changed from the replit and why and justify the
// decisions"). Each decision is paired with its reason, and `kept` states
// what content from the Replit the screen still carries, per Maisha's rule
// that content stays the same and only its presentation changes.
// Commit messages and docs/AI_HANDOFF.md hold the full history.
//
// UI copy: no em dashes (standing rule).

import type { CounselorView } from "../roles";

export type Decision = { change: string; why: string };
export type ChangeNote = {
  /** the screen's job in one line */
  summary: string;
  decisions: Decision[];
  /** what the Replit showed that this screen still shows */
  kept: string;
  /** what comes first, and why */
  order?: string;
};

// Applies to every screen, so each note does not repeat it.
export const SHARED_DECISIONS: Decision[] = [
  { change: "One blue for every chart; amber and red only where something needs you", why: "The Replit colored each chart differently (green, yellow, purple), so color carried no meaning. Here a warm color always means a problem, and a healthy number never competes with one." },
  { change: "Charts fill in when they appear and morph when you switch a tab or filter", why: "Taken from the Replit, which animates its charts. Movement shows what changed between two views instead of repainting silently." },
  { change: "Progressive disclosure: the answer first, detail one click away", why: "The Replit showed every section at full length at once. Counselors need the answer at a glance and the detail when they act; nothing is deleted, it is layered." },
];

const REPORTS_NOTE: ChangeNote = {
  summary: "The Replit's Student Progress, Career + College Insights and Platform Engagement, as three tabs of one Reports screen.",
  decisions: [
    { change: "Three menu items became one Reports screen with tabs", why: "All three answer \"how is my caseload doing\" with charts and exports. One home is easier to find and keeps the sidebar to screens where you do work." },
    { change: "Student progress: the nine reports as underline sub-tabs above one chart", why: "The Replit spent a 300px side column on nine report names, squeezing the chart. Sub-tabs keep all nine visible and give the chart the full width; switching morphs the bars." },
    { change: "Grade comes from the header filter; the report keeps the pathway filter", why: "The Replit asked for grade twice (header and report). One grade control, everywhere." },
    { change: "Each report leads with its answer (72% approved, 5 overdue) beside the chart", why: "The Replit's charts had no headline, so the reader had to estimate bar heights to get the number that matters." },
    { change: "Career + college: four top-10 lists became one chart with four lenses", why: "Forty bars in four identical cards asked the same question four ways. One chart, switched by lens, answers it once; the leader glows, and brightness follows rank." },
    { change: "Recommendations sit beside the chart, each with a ring and one action, the other ideas one click away", why: "The Replit gave twelve lines of advice on every visit. One action per insight is what a counselor can act on this week." },
    { change: "Career-fair interests are invites: each opens Group message for that pathway's students", why: "The Replit's interest chips looked like buttons and did nothing. Now the insight leads straight to the action it suggests." },
    { change: "Engagement: each stat carries its trend (a sparkline and the change since last month)", why: "The Replit's four numbers had no direction, so growth was invisible. Weekly and daily have no history, so they show their share of students instead of an invented trend." },
    { change: "Logins by month drawn at real size with smooth lines and a hover readout of all three numbers", why: "Same chart as the Replit, but readable: the earlier version was stretched and squished, and the table was the only way to get a month's exact figures." },
  ],
  kept: "All nine reports with the Replit's own categories per report, the pathway filter, CSV and PDF, Summary by Grade; all three recommendations with all nine actions; all four top-10 lists; the career-fair note and its four clusters; the four engagement stats, the monthly login table, and students to check in with by grade.",
  order: "Student progress first, the tab counselors report from most. Within Career + college, saved careers first, matching the recommendation it supports. Ranked lists largest first.",
};

export const CHANGE_NOTES: Record<CounselorView, ChangeNote> = {
  overview: {
    summary: "What needs you today, then how the caseload is doing.",
    decisions: [
      { change: "\"Needs your attention\" leads the page, the most urgent students first with the reason", why: "The Replit opened on three equal donuts: a status report, not a to-do. A counselor's first question is who to help, so that comes first." },
      { change: "Severity is stated once in the card header when every row shares it", why: "Repeating \"Critical\" on every row was noise; one label says it." },
      { change: "Donuts show the share with a trend chip; each legend row opens the matching students", why: "The Replit's donuts could not be acted on. Every number here is a door to the students behind it." },
      { change: "Career pathways use Dreamari's 15 Build worlds as a treemap, sized by students", why: "The Replit's 7 pathways do not exist in Dreamari; students pick from Build's 15 worlds, so the counselor sees the same names and colors the student sees." },
      { change: "Career and academic readiness keep the Replit's two bar charts, in the shared bar style", why: "The content was right; the style now matches the rest of the dashboard, and a real 0% draws a visible bar instead of an empty gap." },
    ],
    kept: "Total students, the status split, postsecondary plans, pathway counts, career and academic readiness by grade.",
    order: "At Risk students only in the attention card, overdue or rejected work before not-started work, then the least-complete roadmap. Three rows, See all for the rest.",
  },
  students: {
    summary: "The whole caseload in one list, worst first, and each student's full profile.",
    decisions: [
      { change: "Six columns instead of thirteen: grade and pathway sit under the name", why: "The Replit repeated the school and \"Approved\" on every row. Fewer, denser columns read faster and fit a laptop." },
      { change: "Sorted by who needs you, with the reason under the status", why: "The Replit sorted by position. Worst first means the top of the list is the work." },
      { change: "One list that grows in place (Show 20 more), no inner scroll box or Previous / Next", why: "A bounded box that scrolls inside the page, plus pages, did not read as one list. Now there is one scroll." },
      { change: "Status and plan pickers in the toolbar; a counselor column for lead roles", why: "The Replit hid filters behind a button. Visible pickers show what is filtered at a glance." },
      { change: "Profile: a calm header with a short \"Needs you\" list, and Overview / Plan / Activity / Notes / Drafts tabs", why: "The Replit's profile showed every signal at once. The header says what to do next; the rest waits in tabs." },
      { change: "Drafts tab: the Productivity Suite's documents for this one student", why: "Writing a letter or brief starts from the student you are looking at." },
    ],
    kept: "Every roster field (name, grade, pathway, status, roadmap, plan, last active, milestones), the profile's education goals, cluster, plan, top matches, the 3/6/12 month plan, activity tiles and notes.",
    order: "At Risk, then Needs Attention, then On Track; within a status, overdue work before not-started work; ties by the least-complete roadmap. Other sorts are one click away on the headers.",
  },
  milestones: {
    summary: "Each grade's checkpoints, how many students are done, and who is furthest behind.",
    decisions: [
      { change: "A hero card: the grade's three numbers on one half, the checkpoint furthest behind on the other with one action", why: "The Replit spread these across a sentence and a wide card. One card answers \"how is this grade doing and what do I do first\"." },
      { change: "\"Furthest behind\" is the lowest % done, with one primary action (Review, or See the students)", why: "Two equal pills gave no hierarchy. One action is the one that moves the number." },
      { change: "Checkpoints as a grid of ring cards; a card opens a side panel with the full breakdown and actions", why: "The Replit showed every breakdown inline. The grid is the overview; the panel is the detail, without leaving the page." },
      { change: "No Fall / Winter / Spring grouping", why: "The Replit has no seasons; they were our invention and did not match how counselors track checkpoints." },
    ],
    kept: "The Replit's own named checkpoints per grade, their completion counts, needs-attention and N/A counts, classifications, the counselor picker and the CSV.",
    order: "The checkpoint with the lowest % done leads the hero card; the grid keeps the Replit's curriculum order.",
  },
  "review-queue": {
    summary: "Every submission waiting on you, most urgent first, reviewed without leaving the screen.",
    decisions: [
      { change: "Generated from the roster: one item per pending submission", why: "The Replit's queue was a fixed list that hid a student's second submission. Built from the roster, it is always complete." },
      { change: "Status tabs with counts and one caption line (N past due, N due within 2 days)", why: "The Replit had a stat row repeating the tab counts. One line says how urgent the queue is." },
      { change: "\"Missed deadline\" instead of \"Overdue\"; unsubmitted items offer Send a reminder", why: "Those items were never submitted, so there is nothing to review; the useful action is a nudge." },
      { change: "Attachments open in a document viewer; decisions are recorded with Undo", why: "The Replit lost the decision on click and showed attachments as plain text." },
    ],
    kept: "Every submission's student, milestone, submitted date, due date, attachment and the approve / request changes decision.",
    order: "Most overdue first, then due soonest, then longest waiting.",
  },
  progress: REPORTS_NOTE,
  insights: REPORTS_NOTE,
  connect: {
    summary: "Students' questions first, then announcements and groups.",
    decisions: [
      { change: "Opens on Questions, with the count that needs you on the tab", why: "The Replit opened on announcements. Unanswered questions are the work, so they come first." },
      { change: "Questions grouped as Need a reply, In progress, Answered, with counts; the counts are the list's own filter", why: "The Replit listed questions in arbitrary order with a status pill each. Groups say where each question stands without reading every row." },
      { change: "Status pills only when a group mixes statuses", why: "Inside \"Need a reply\" every row has the same status; a pill on each repeated it." },
      { change: "Announcements can be written and show who read them; groups open to their feed", why: "The Replit's buttons did nothing." },
    ],
    kept: "Every question, announcement and group from the Replit, with their authors, dates and replies.",
    order: "Questions: need a reply, then in progress, then answered, newest first within each. Announcements newest first. Groups by most recent activity.",
  },
  productivity: {
    summary: "A document workspace: pick a student, generate a letter, brief or plan on a real US Letter page, edit, print.",
    decisions: [
      { change: "Three modes (Documents, Group message, Needs attention) instead of six tool tiles", why: "The four document tools are one workflow with four templates, so the template is a Document picker next to Student and Letter type. Group message and Needs attention are different workflows and keep their own tabs." },
      { change: "A setup panel beside a desk holding a real page", why: "The Replit was a form with a text box. A workspace shows the document you are making the whole time." },
      { change: "US Letter pages (8.5 x 11 in, one-inch margins) with a school letterhead or memo header, in Source Serif", why: "A counselor sends these to colleges and families. They should look like official documents, and what you see is exactly what prints." },
      { change: "Full screen at print size; Print or PDF prints the page alone", why: "Reviewing a letter at its real size before sending it is what a counselor does with any document." },
      { change: "Briefs and plans have headings, bold labels and bullets; letters are five proper paragraphs", why: "The Replit's drafts were a block of text. Structure makes a brief scannable in a meeting, and a letter reads like a letter." },
      { change: "\"Built from\" shows the student facts the draft used", why: "A counselor can check the facts before trusting the words." },
      { change: "Needs attention rows open a drafted success plan or meeting brief; Message all", why: "The Replit's list only repeated the Overview. Here each student leads to the document that helps them." },
    ],
    kept: "All six Replit tools (recommendation letter with its four letter types, student and parent meeting briefs, success plan, group messaging, students needing attention), the draft, copy, save and the \"you are always in control\" message.",
    order: "Documents first, the tools used most; the recommendation letter is the default document.",
  },
  engagement: {
    summary: "How much students use Dreamari, and whether it is growing.",
    decisions: [
      { change: "Each stat carries a sparkline and the change since last month", why: "The Replit's numbers had no direction. Growth is the question a principal asks." },
      { change: "Weekly and daily active show their share of students", why: "There is no history for them, so a share is honest where a trend would be invented." },
      { change: "Logins by month at real size, smooth lines, a hover readout", why: "Same chart as the Replit, readable at any width." },
      { change: "The District Administrator sees schools compared first", why: "A district's first question is which school needs support." },
    ],
    kept: "The four engagement stats, the logins chart, the monthly table and students to check in with by grade.",
    order: "District view: schools with the lowest active share first.",
  },
  impact: {
    summary: "The counselor's report for a principal: outcomes against targets, then the work behind them.",
    decisions: [
      { change: "A photo header with Print, Share and Principal report in one row", why: "This is a report about a person; the Replit's plain header read like any other page." },
      { change: "Four tabs (Outcomes, Activity, Readiness, ASCA); Print compiles all of them", why: "The Replit stated each number up to three times across eight sections. On screen one section at a time; the printed report still has everything." },
      { change: "Outcomes as rings against their targets, each opening the students keeping it below target", why: "The Replit's KPI tiles had no targets and no action." },
      { change: "Notable Achievements became \"Against benchmarks\": each comparison as a gap and a bar", why: "The eight sentences restated numbers shown elsewhere; the facts only they carried were the comparisons (school average, district target, 5-day standard)." },
      { change: "Your work as four tiles; engagement as ranked bars; grades as rows with a ring", why: "These match the data: four separate counts, five counts of very different size, and a per-grade rate plus completion, as the Replit showed them." },
      { change: "ASCA as rings and count badges per domain, with the unmeasured practice checked", why: "The Replit's ASCA section was three bullet lists of sentences." },
      { change: "Rings stay blue; only \"N to go\" is amber or red", why: "Two red charts made a good report read as a failing one." },
    ],
    kept: "Caseload, on-track rate, postsecondary plans, question response rate, pathways, per-grade progress and completion, the four milestone rates, seniors applying, plans reviewed with approved and pending, questions, announcements, support flags, review turnaround, the five engagement counts, the ASCA domains and the district compliance comparisons.",
    order: "Outcomes first, the question a principal asks. Tabs left to right in the order a counselor checks them.",
  },
  settings: {
    summary: "Your profile, your role, and what it can do.",
    decisions: [
      { change: "Role is a picker, and it drives the whole dashboard", why: "The Replit had one persona. Picking a role changes the menu and the Overview for that role." },
      { change: "Permissions shown for your role only", why: "The Replit listed all four roles' permissions to every reader." },
      { change: "Profile stays open; permissions, notifications, caseload and academic year fold behind a summary", why: "Settings are visited rarely; the summary line answers the question without opening each section." },
    ],
    kept: "Profile fields, notification preferences, caseload assignment and academic year dates.",
    order: "Profile first; the rest in the Replit's order.",
  },
  counselors: {
    summary: "New for lead roles: which caseload needs support.",
    decisions: [
      { change: "Caseloads ranked by who needs support, with pending and overdue counts; rows open that counselor's roster", why: "The Replit had one persona and no view across counselors." },
    ],
    kept: "Not in the Replit; built from the same roster data.",
    order: "Lowest on-track rate first; ties by the most unresolved work.",
  },
  readiness: {
    summary: "New for administrators: every target by grade or school.",
    decisions: [
      { change: "One card per target, rows by grade or school, attention first", why: "The Replit had no target view; readiness was scattered across screens." },
    ],
    kept: "Not in the Replit; built from the same readiness metrics.",
    order: "Within each target, the lowest value first. Amber within ten points of target, red beyond.",
  },
  reports: {
    summary: "New for administrators: report templates from live numbers.",
    decisions: [
      { change: "Templates generate from live data as CSV, and can be scheduled weekly or monthly", why: "The Replit offered one button that did nothing." },
    ],
    kept: "Not in the Replit.",
    order: "Templates in a fixed order; generated reports newest first.",
  },
  schools: {
    summary: "New for the District Administrator: which school needs support, on which measure.",
    decisions: [
      { change: "Schools ranked by targets met, then one card per target", why: "The Replit had no district view." },
    ],
    kept: "Not in the Replit.",
    order: "Fewest targets met first, then the lowest on-track rate.",
  },
  "school-impact": {
    summary: "New for the Lead Counselor: My Impact for the whole school.",
    decisions: [
      { change: "The same report as My Impact for the whole school, with a by-counselor card", why: "The Replit's report covered one counselor only." },
    ],
    kept: "Every My Impact figure, school-wide.",
    order: "Same as My Impact; counselors ranked lowest on-track first.",
  },
};
