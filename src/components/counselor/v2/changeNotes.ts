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
  { change: "One blue for every chart; green only for an upward trend; amber and red only where something needs you", why: "The Replit colored each chart differently (green, yellow, purple), so color carried no meaning. Here a warm color always means a problem, green always means growth, and a healthy number never competes with either." },
  { change: "Charts fill in when they appear and morph when you switch a tab or filter", why: "Taken from the Replit, which animates its charts. Movement shows what changed between two views instead of repainting silently." },
  { change: "Progressive disclosure: the answer first, detail one click away", why: "The Replit showed every section at full length at once. Counselors need the answer at a glance and the detail when they act; nothing is deleted, it is layered." },
];

const PROGRESS_NOTE: ChangeNote = {
  summary: "The Replit's Student Progress: nine readiness reports with filters and export.",
  decisions: [
    { change: "Its own menu item again, as in the Replit", why: "Maisha, 27 Sept 2026: \"I'm not sure if we should call this part 'reports' ... they feel different.\" Student Progress, Career + College Insights and Platform Engagement are three items, the Replit's structure." },
    { change: "The nine reports as underline sub-tabs above one chart", why: "The Replit spent a 300px side column on nine report names, squeezing the chart. Sub-tabs keep all nine visible and give the chart the full width; switching morphs the bars." },
    { change: "Grade comes from the header filter; the report keeps the pathway filter", why: "The Replit asked for grade twice (header and report). One grade control, everywhere." },
    { change: "Each report leads with its answer (72% approved, 5 overdue) beside the chart", why: "The Replit's charts had no headline, so the reader had to estimate bar heights to get the number that matters." },
  ],
  kept: "All nine reports with the Replit's own categories per report, the pathway filter, CSV and PDF, Summary by Grade.",
  order: "The Replit's report order.",
};

const INSIGHTS_NOTE: ChangeNote = {
  summary: "What students save, and what to do about it.",
  decisions: [
    { change: "Top 10 saved careers and top 10 saved colleges only", why: "Maisha, 27 Sept 2026: \"lets remove simulations and majors ... top 10 saved careers and colleges ... those two are the main things students can save.\"" },
    { change: "The two lists side by side at the top, the recommendations full width below them", why: "Maisha: \"have top 10 saved careers + top 10 saved colleges at the top. Below that have 'Dreamari recommendations for you' like the replit. Side by side doesn't make sense.\" The earlier layout put the recommendations beside one tabbed chart." },
    { change: "Each list shows its top five, one number and a slim bar per row, with Show all 10", why: "A ten-row list with a rank badge and two numbers per row was hard to process (27 Sept 2026). Five rows read at a glance and the bar ranks them without reading." },
    { change: "Each recommendation is the share, what students did, and the one idea to try first; the card opens the rest", why: "Direct feedback: \"simplify the dreamari recommendation cards ... much easier to scan.\" Its drill holds every idea, the students in that pathway and a message to them." },
    { change: "Career-fair interests open a Counselor Connect private message to that pathway's students", why: "The Replit's interest chips looked like buttons and did nothing. Group message now lives in Connect." },
  ],
  kept: "The Replit's top 10 saved careers and colleges, all three recommendations with all nine actions, the career-fair note and its four clusters.",
  order: "Careers first, matching the first recommendation. Ranked lists largest first.",
};

export const CHANGE_NOTES: Record<CounselorView, ChangeNote> = {
  overview: {
    summary: "Three snapshots, each opening the full picture: who needs you, how the caseload stands, what students are drawn to.",
    decisions: [
      { change: "Three cards only: Needs attention, Student Status, Career Pathways", why: "Maisha, 27 Sept 2026: \"simplify this further and keep: Needs attention, Student status ... Career pathways. Remove everything else. This will make the overview much cleaner.\"" },
      { change: "Needs attention (critical) stays at the top", why: "Maisha: \"Lets keep the 'needs attention - critical' part at the top.\" The Replit opened on three equal donuts; a counselor's first question is who to help." },
      { change: "Student Status also shows progress across all milestones: % done and the four checkpoint states", why: "Maisha: \"This can show overall progress snapshot across all milestones.\" It uses the Milestone Tracker's own data and colors, so the snapshot and the tracker agree." },
      { change: "Career Pathways as bars of the top five saved careers, with See all 10", why: "Maisha: \"I don't love the 'career pathways' snapshot. It feels hard to follow ... a bar or a pie chart ... top 3-5 careers and then they click the insights button to see all.\" Bars, not a pie: ranked counts read faster as lengths." },
      { change: "Every snapshot opens its own screen", why: "Maisha: \"I also like how each snapshot on the overview leads to a broader picture by a click to a different tab.\"" },
    ],
    kept: "The attention list, the status split with its click-through to students, and the top saved careers. Postsecondary plans and the readiness charts moved off the Overview at Maisha's request; their data is on Students, Student Progress and My Impact.",
    order: "At Risk students first in the attention card, overdue work before not-started work. Then status, then pathways.",
  },
  students: {
    summary: "The whole caseload in one list, worst first, and each student's full profile.",
    decisions: [
      { change: "No Roadmap or Plan column", why: "Maisha, 27 Sept 2026: \"Remove roadmap column. Remove plan column.\" The plan filter stays in the toolbar, and both are on the student's profile." },
      { change: "Grade and pathway sit under the name", why: "The Replit repeated the school and \"Approved\" on every row. Fewer, denser columns read faster and fit a laptop." },
      { change: "Sorted by who needs you, with the reason under the status", why: "The Replit sorted by position. Worst first means the top of the list is the work." },
      { change: "One list that grows in place (Show 20 more)", why: "A box that scrolls inside the page, plus pages, did not read as one list." },
      { change: "Profile: a calm header with a short \"Needs you\" list, and tabs", why: "The Replit's profile showed every signal at once. The header says what to do next; the rest waits in tabs." },
    ],
    kept: "Name, grade, pathway, status, milestones and last active on every row; roadmap and plan on the profile; the profile's education goals, cluster, plan, top matches, the 3/6/12 month plan, activity tiles and notes.",
    order: "At Risk, then Needs Attention, then On Track; overdue work before not-started work. Other sorts are one click away on the headers.",
  },
  milestones: {
    summary: "Each grade's checkpoints and how many students have done each one, as the Replit shows them.",
    decisions: [
      { change: "No grade heading or focus sentence above the cards; the Replit's three numbers only", why: "Maisha, 27 Sept 2026: the Grade 9/10/11 box and its explanation \"feel repetitive. They are already on that grade's tab so we don't have to say the grade again.\"" },
      { change: "No \"Furthest behind\" hero; one card per checkpoint, as in the Replit", why: "Maisha: \"the grade breakdown + further behind makes it more complicated to read ... I would keep this part similar to the replit. That was easier to comprehend.\"" },
      { change: "Each card: name, classification, a large ring with N of M, the four states counted, View details", why: "The Replit's card, in the dashboard's colors: one blue family for done and in progress, gray for not started." },
      { change: "View details opens a side panel with the students and actions", why: "The Replit's button went nowhere; here it opens the breakdown without leaving the page." },
    ],
    kept: "The Replit's named checkpoints per grade, completion counts, needs-attention and N/A counts, classifications, students / milestones / avg. done, the counselor picker and the CSV.",
    order: "The Replit's curriculum order.",
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
  progress: PROGRESS_NOTE,
  insights: INSIGHTS_NOTE,
  connect: {
    summary: "Students' questions first, then announcements and messages, then groups.",
    decisions: [
      { change: "Questions are Needs reply or Answered", why: "Maisha, 27 Sept 2026: \"whats the difference between 'need a reply' and 'in progress'. Seems like the same thing. Lets just keep 'needs reply'.\"" },
      { change: "Groups as board tiles, like the student Connect boards", why: "Maisha: \"on the replit you will see I had them in boxes to mirror how the connect boards look like ... It feels more enjoyable to follow and comprehend.\" Each box has the group's name, what it is for, member and post counts and Open, on the dashboard's own surface (no board photography)." },
      { change: "One New message button: an Announcement, or a Private message to chosen students", why: "Maisha asked whether the Productivity Suite's Group message duplicated Connect. It did not quite: an announcement is posted for a whole grade, a private message goes only to the students picked by status, pathway or name. Both are outgoing messages, so both start here." },
      { change: "Opens on Questions, with the count that needs you on the tab", why: "The Replit opened on announcements. Unanswered questions are the work." },
    ],
    kept: "Every question, announcement and group from the Replit, with their authors, dates and counts; group messaging from the Replit's Productivity Suite.",
    order: "Questions: needs reply first, newest first. Announcements newest first. Groups by most recent activity.",
  },
  productivity: {
    summary: "A document workspace: pick a student, generate a letter, brief or plan on a real US Letter page, edit, print.",
    decisions: [
      { change: "Two modes: Documents and Needs attention", why: "Group message moved to Counselor Connect (Maisha, 27 Sept 2026: \"idk if this is necessary because they can technically send group messages via the counselor connect\"). Message all from Needs attention opens it there, already addressed." },
      { change: "The four document tools as one Document picker", why: "Maisha: \"I like all the documents consolidated into a selection of options.\" One workflow, four templates." },
      { change: "A setup panel beside a desk holding a real US Letter page, with full screen and Print", why: "The Replit was a form with a text box. These go to colleges and families, so they should look like official documents." },
      { change: "Needs attention rows open a drafted success plan or meeting brief", why: "The Replit's list only repeated the Overview." },
    ],
    kept: "The Replit's recommendation letter with its four letter types, student and parent meeting briefs, success plan and students needing attention; group messaging now in Counselor Connect.",
    order: "Documents first; the recommendation letter is the default document.",
  },
  engagement: {
    summary: "How much students use Dreamari, by day, month, student or site, for any of three school years.",
    decisions: [
      { change: "Logins by day, month, student or site, for the current year, 2024-2025 or 2023-2024", why: "Maisha, 27 Sept 2026: \"in the replit they had the option to see logins by month, year, day ... This is important.\" The Replit's own picker: a school year crossed with those four views." },
      { change: "By student and by site use the Replit's numbers; by day and by month climb to their latest point", why: "Standing rule for demos: engagement never shows a declining trend. Labels and scale stay the Replit's." },
      { change: "Each stat carries a sparkline and the change since the month before, for the year chosen", why: "The Replit's numbers had no direction; growth is the question a principal asks." },
    ],
    kept: "The four engagement stats, logins by day / month / student / site for three years, the monthly login summary and students to check in with by grade.",
    order: "Month first, the Replit's default view.",
  },
  impact: {
    summary: "The counselor's report for a principal, with the Replit's numbers and none of its repetition.",
    decisions: [
      { change: "One page, no tabs", why: "Maisha, 27 Sept 2026: \"I don't think this needs so many tabs within it.\"" },
      { change: "Every figure is the Replit's (120 students, 86% on track, 66% with a plan, 33% answered)", why: "Maisha: \"utilize the same numbers as the replit because its standard per actual caseload of counselors.\"" },
      { change: "All eight notable achievements as win tiles: the number, a short label, the comparison drawn as a bar with the target marked", why: "Maisha wanted the snapshot back; direct feedback asked for it \"not so wordy\". The Replit's full sentence opens in each tile's drill." },
      { change: "Every number, row and card opens a drill: the full wording, the breakdown, the students it counts, and one button to act", why: "Direct instruction: \"we'll need drill down for more details if we considerably reduced clutter\" and \"Offer drilldown capability of EVERY SINGLE CARD that can afford it\"." },
      { change: "Principal report opens as a one-page US Letter document, with Print and Share", why: "Maisha: \"Am I able to see the principal report? So I can show during demos.\" Every line of the Replit's report, composed as something a counselor hands a principal: the school's masthead with Dreamari as the data source, who prepared it and for whom, the headline figures, numbered achievements and the compliance table." },
      { change: "No separate District Compliance section; each target sits on the number it judges, with a Met or In progress chip", why: "The Replit stated those three comparisons twice. The full compliance table is in the Principal report." },
      { change: "Counselor activity and student engagement share one card", why: "Both answer \"what happened this period\"; two cards of tiles read as one list split in half." },
    ],
    kept: "Every data point on the Replit's My Impact: the four headline numbers, plans by pathway, progress by grade, the four readiness milestones, seniors applying, plans reviewed and pending, questions, announcements, support flags, review turnaround, the five engagement counts, the ASCA domains, the eight achievements and the three district comparisons.",
    order: "Headline numbers, then the achievements snapshot, then the detail a principal asks about next.",
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
