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
  /** the two section labels, when the note compares against something
   *  other than the Replit (v3 compares against v2) */
  changedHeading?: string;
  keptHeading?: string;
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
    { change: "Recommendations are three flat columns: the share, what students did, the first idea; no tiles, chips or captions", why: "The user, 2 Oct 2026, found the screen \"so dense and hard to read\" next to the Replit, whose recommendations are plain bullets in a banner. Each was a bordered tile inside a card, with a TRY FIRST chip and a \"2 more ideas\" caption. A column opens its drill: every idea, the students in that pathway and a message to them, so nothing was dropped." },
    { change: "The career-fair card is a title and one flat row of four links (pathway, student count)", why: "Same feedback: four more bordered tiles with icon boxes inside a card. Each link still opens a Counselor Connect private message to that pathway's students (the Replit's interest chips looked like buttons and did nothing)." },
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
      { change: "Student Status is students only; progress across all milestones is its own card, Milestone progress", why: "Maisha, 27 Sept 2026, asked for \"an overall progress snapshot across all milestones\" on the Overview. Put inside Student Status it mixed two datasets, so \"Needs attention\" read 11 (students) beside 40 (checkpoints); the user, 2 Oct 2026, found the page \"so dense and hard to read\". Same figures and Tracker colors, now under a title that says what is counted." },
      { change: "The at-risk 7 is said once; no CRITICAL chip; \"+2 pts vs last month\" moved into Student Status' Details", why: "The audit found the same 7 three times plus a chip and a caption on top. Each attention row carries a small red dot (Critical) instead of a chip; Details holds the trend, the breakdown and the at-risk students." },
      { change: "Needs attention rows are flat, split by hairlines", why: "They were bordered tiles nested inside a card, the pattern My Impact dropped the same day." },
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
  explore: {
    summary: "Careers, trends, schools and pay in the student app's own look.",
    decisions: [
      { change: "A new Explore item: v5's Explore (career posters and curated rows, Schools, Pay by state) plus a Trends tab", why: "Chandu, 7 Oct 2026, after the Replit's Career Intelligence: \"counselors need to have information on trends and what's popular etc in which state and which industries\". The Replit lists in-demand careers by industry; Trends adds the state, what's rising fastest and what this school's students save." },
      { change: "Added beside Career + College Insights, nothing else changed", why: "Chandu: \"without changing the structure of things in v4\"." },
    ],
    kept: "The Replit's Career Intelligence: in-demand careers by industry, top 10 each, pay, growth, and a career opening to its plain-words line, education and major.",
  },
  connect: {
    summary: "Students' questions first, then announcements and messages, then groups. One tab row.",
    decisions: [
      { change: "Questions are Needs reply or Answered", why: "Maisha, 27 Sept 2026: \"whats the difference between 'need a reply' and 'in progress'. Seems like the same thing. Lets just keep 'needs reply'.\"" },
      { change: "Groups as board tiles, like the student Connect boards", why: "Maisha: \"on the replit you will see I had them in boxes to mirror how the connect boards look like ... It feels more enjoyable to follow and comprehend.\" Each box has the group's name, what it is for, member and post counts and Open, on the dashboard's own surface (no board photography)." },
      { change: "One New message button: an Announcement, or a Private message to chosen students", why: "Maisha asked whether the Productivity Suite's Group message duplicated Connect. It did not quite: an announcement is posted for a whole grade, a private message goes only to the students picked by status, pathway or name. Both are outgoing messages, so both start here." },
      { change: "Opens on Questions", why: "The Replit opened on announcements. Unanswered questions are the work." },
      { change: "One tab row only; Needs reply / Answered is a dropdown in the question list's header", why: "The user, 2 Oct 2026, found the screen \"so dense and hard to read\" next to the Replit's single tab row. Two stacked tab rows break the house rule, so the second became a small dropdown with its count (the tab badge went, so each number is said once)." },
      { change: "Questions are one card of flat rows beside the open question; a row is name, date and a one-line preview; an amber dot marks a question still owed a reply", why: "Every question carried a NEW / FOLLOW UP / VIEWED chip, a two-line preview and its own box, and the open question had a quote box inside a card. Grade, category, date and the exact status moved to the open question's header." },
      { change: "Announcements are one card of dividing rows; a group's member and post counts are one line", why: "Ten bordered cards and two stat tiles inside every group box were boxes inside boxes. Every figure is still shown." },
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
      { change: "A sticky section index (Achievements, Caseload, Readiness, Your work, ASCA) with the section in view lit", why: "Our answer to \"so many tabs\": one continuous page, with the navigation tabs used to give." },
      { change: "A reporting-period switch: Fall 2023, Spring 2023, the 2022-23 school year", why: "A counselor brings My Impact to an evaluation, and the period changes with it. Fall 2023 is the Replit's numbers; earlier periods are seeded history. The drills and the Principal report follow the period." },
      { change: "ASCA last and collapsed to its three headline numbers, evidence on request", why: "It matters for annual accountability, not the week's work." },
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
    summary: "New for the District Leader: which school needs support, on which measure.",
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
  // School Leader and District Leader (2 Oct 2026). Every screen is
  // rebuilt from the Replit's own leader views; see
  // docs/reference/school-district-leader-replit-2026-10/NOTES.md.
  "leader-progress": {
    summary: "Is the school on track with planning milestones, and which students need support?",
    decisions: [
      { change: "The Grade, Counselor and Student group filters sit on the Student sample card only", why: "In the Replit they sit at the top of every screen but only ever filter the 20-student sample; its own (i) says so. Filters that look global but change nothing else mislead a principal." },
      { change: "Every number opens its definition, baseline and breakdown", why: "The Replit puts numerator, denominator and baseline in hover tooltips. A drill holds the same text and works on touch and keyboard." },
      { change: "A Support status bar on Overview opens this screen already filtered to that status", why: "The Replit's own deep link, kept." },
      { change: "A student opens in a side panel", why: "The same panel every other drill in the dashboard uses, so it reads the same everywhere." },
    ],
    kept: "All five milestone figures with their baselines, the Career experiences and access counts, the 20-student sample with every column, and the student profile.",
    order: "Milestones first (the school's progress), then experiences, then the students.",
  },
  postsecondary: {
    summary: "What students are interested in, and what they plan to do after high school.",
    decisions: [
      { change: "Career interests in one blue, not eight category colours", why: "Bar length already separates the categories; eight colours added noise without adding meaning." },
      { change: "Postsecondary choices are bars, not a plain list", why: "A share is easier to compare as a length than as a number in a list." },
      { change: "The programming cue is its own strip", why: "It is the one action on the screen, so it sits apart from the cards it summarises." },
    ],
    kept: "Career interests, emerging interests, pathway discovery, postsecondary intentions and choices, with every value.",
    order: "Interests first, then intentions and choices: exploration leads to plans.",
  },
  team: {
    summary: "Counseling coverage and capacity: reach, planning completion and follow-up coverage by counselor.",
    decisions: [
      { change: "Each counselor opens a drill instead of an accordion", why: "Same drill as every other card, and the list stays one line per counselor." },
      { change: "\"Not staff rankings\" is said once, above the cards", why: "The Replit repeats it inside every card; once is enough to set the frame." },
    ],
    kept: "The six team figures, every counselor's students, planning completion, follow-ups and coverage.",
    order: "Team totals first, then counselors in the Replit's order. No sort, because these are not rankings.",
  },
  "leader-reports": {
    summary: "Ready-made school reports to open, print or export.",
    decisions: [
      { change: "Open report shows a letter-size document, and Export PDF prints it", why: "A report a principal shares should look like a report, the same as the Principal report on My Impact." },
      { change: "Export CSV downloads a real file", why: "So a demo can show the data leaving the dashboard." },
      { change: "Impact since launch shows the baseline as a tick on each bar", why: "The Replit states the baseline as text; a tick shows the gain at a glance." },
    ],
    kept: "All four reports with their contents, and the Impact since launch card.",
  },
  "school-performance": {
    summary: "Every school's measures against the launch baseline, side by side.",
    decisions: [
      { change: "Sorting is one Sort control", why: "Phones have no column headers to click. School name sorts A to Z; the Replit ended Z to A." },
      { change: "The Trend column is cut", why: "It repeated the Planning change in the same row." },
      { change: "Each school opens that school's own view, with a way back to the district", why: "The Replit drills in but offers no way back except its demo selector." },
      { change: "On phones each school is one stacked row: status, then the sorted measure, Career and Planning", why: "A nine-column table does not fit a phone; the row keeps what decides the sort." },
    ],
    kept: "All 11 schools, the grade, status and search filters with the grade rule, every measure and its change, and the empty state.",
  },
  outcomes: {
    summary: "How outcomes compare by school or by grade across the district.",
    decisions: [
      { change: "One ranked bar list, with the district value marked on every bar", why: "The comparison the screen exists for, readable in one glance." },
      { change: "A school's bar opens that school", why: "The next question after seeing who is behind is why." },
      { change: "Distributions and milestone lists sort high to low", why: "Biggest first is how the eye reads a list." },
      { change: "\"Not a completion rate, no baseline\" is said once as a note", why: "The Replit repeats the same tooltip on every card." },
    ],
    kept: "Both comparisons with all five metrics, the three distribution cards, participation, emerging interests and the milestone list.",
    order: "The comparison first, then the detail behind it.",
  },
  capacity: {
    summary: "Students per counselor, follow-up load and coverage at every school.",
    decisions: [
      { change: "The four headline figures each open a drill", why: "Same as every other card that can afford one." },
      { change: "Counselor capacity is labelled a relative change, not points", why: "The Replit is explicit that +19% is relative, not percentage points; the label keeps it from being misread." },
      { change: "A school row opens that school's Counseling team", why: "The Replit's own destination, kept; the separate Open link became the row's chevron." },
    ],
    kept: "The district coverage figures and every school's staffing row with its load label.",
  },
  "district-reports": {
    summary: "District reports to open, print or export, plus the school comparison export.",
    decisions: [
      { change: "Open report shows a letter-size document", why: "A report for a board or superintendent should read as a document, not a modal table." },
      { change: "Export school comparison CSV downloads a real file of all 11 schools", why: "So a demo can show the data leaving the dashboard." },
    ],
    kept: "All four reports with every row and column definition, and both header exports.",
  },
  // v3-only screens (roles.ts); v2's menus never open them, the entries
  // only satisfy the Record. v3/changeNotes.ts holds their real notes.
  meetings: { summary: "A v3 screen.", decisions: [], kept: "Not in the Replit." },
  "financial-aid": { summary: "A v3 screen.", decisions: [], kept: "Not in the Replit." },
  academics: { summary: "A v3 screen.", decisions: [], kept: "Not in the Replit." },
  applications: { summary: "A v3 screen.", decisions: [], kept: "Not in the Replit." },
  time: { summary: "A v3 screen.", decisions: [], kept: "Not in the Replit." },
};

/** The leaders' Overviews share the "overview" view with the counselor's,
 *  so their notes live here and the shell picks by role (2 Oct 2026). */
export const LEADER_OVERVIEW_NOTES: Record<"School Leader" | "District Leader", ChangeNote> = {
  "School Leader": {
    summary: "Student pathways and counseling reach across the school, against the launch baseline.",
    decisions: [
      { change: "Career exploration is the hero card", why: "It is the Replit's first measure, the chart's default and the first data definition: the school's headline." },
      { change: "Every measure opens its definition and baseline", why: "The Replit's hover tooltips, as drills that also work on touch." },
      { change: "Decorative sparklines are gone", why: "The Replit draws the same static line on every card; it is not data." },
      { change: "The chart's Details lists every month's value", why: "The chart labels only its latest point." },
      { change: "Each support status opens Student progress filtered to it", why: "The Replit's own deep link, kept." },
    ],
    kept: "All five measures with their changes, Impact over time for five metrics and three periods, support status and counseling coverage.",
    order: "Measures, then the trend behind them, then who needs support and who supports them.",
  },
  "District Leader": {
    summary: "How the district's 11 schools are doing, and which ones need support.",
    decisions: [
      { change: "Planning milestones is the hero card", why: "A school's status follows it, so it is the measure the rest of the page is read against." },
      { change: "Each measure opens every school's value, lowest first", why: "The Replit's tooltip defines the measure; the drill also answers the next question, which schools are behind." },
      { change: "The Outcome measures card is cut", why: "It repeated the six measures above it. Its weighting note moved under them." },
      { change: "A school anywhere opens that school's view, with a way back", why: "The Replit drills in but only its demo selector leads back." },
    ],
    kept: "All six measures with baselines, schools by status and the top five by career exploration.",
    order: "Measures first, then status, then the schools leading.",
  },
};

