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
  summary: "Where are my students interested in going? Top career fields, postsecondary direction, the most saved careers and the schools students are exploring.",
  decisions: [
    { change: "'Career Interests' is 'Top Career Fields' (broad fields); 'Plans After Graduation' is 'Postsecondary Direction'", why: "Maisha, 9 Oct 2026: \"The current Career Interests wording is confusing because individual careers are also shown directly underneath it\"; \"simplify and rename it 'Postsecondary Direction'.\"" },
    { change: "The card row is 'Most Saved Careers'; the Schools view mirrors it as 'Top Schools Students Are Exploring', both in the student app's posters", why: "Maisha: \"The language needs to match exactly what the underlying number represents\": careers count saves, schools count juniors and seniors looking at a school. \"Build the Colleges view to mirror the Careers view\", with 'Schools' everywhere, like the student app." },
    { change: "Every row, segment and card opens the students it counts, with Message All; Build My Outreach List is gone", why: "Maisha: \"Clicking the career should show the students represented by that number\"; \"Remove 'Build My Outreach List' as a standalone section.\"" },
    { change: "'Turn Interest Into Opportunity' is 'From Interest to Experience'", why: "Maisha's rename, 9 Oct 2026." },
  ],
  kept: "Top fields, postsecondary direction, the career cards, the opportunity ideas and the student artwork on both sides of the product.",
  order: "Fields and direction, then the cards, then ideas to act on.",
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
      { change: "The tab is Home, not Today", why: "Maisha, 9 Oct 2026: \"Rename the 'Today' tab to Home.\" It is where the counselor starts, whatever the day holds." },
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
    summary: "Milestones and Student Progress are one page: By Milestone (slim rows, a drawer with the students behind each number) and By Student (a dot per milestone, who needs help first).",
    decisions: [
      { change: "The two tabs merged, with a By Milestone | By Student pill at the upper right", why: "Maisha, 9 Oct 2026: \"Merge 'milestones' and 'student progress' into one tab and call it 'Milestones'\"; the toggle is \"a small pill/toggle, not another major navigation tab\"." },
      { change: "Compact rows with v5's icons and 'N waiting for you', instead of large cards with rings", why: "Maisha: \"make those cards significantly more compact ... once there are 7-12 milestones, the page becomes too long\"; 'waiting for you' \"turns the data into something actionable\". Clicking it opens Prepare > Reviews filtered to those submissions." },
      { change: "Cohort Pulse on All Grades; grades collapse into sections so the page stays short", why: "Maisha: \"preserve this concept as a small Cohort Pulse section when 'All Grades' is selected ... Once someone selects Grade 10, the Cohort Pulse can disappear\"." },
      { change: "A milestone opens a drawer: counts, the students behind them, intervention first, message one or many", why: "Maisha: \"Clicking any milestone should not require navigating to another separate dashboard page ... See issue, identify students, take action.\"" },
      { change: "By Student rows with one dot per milestone; the dot matrix and bar chart are gone", why: "Maisha: \"the milestone dots actually mean something because each dot represents one of that student's milestones\"; the matrix and chart \"are repeating information\"." },
      { change: "No breadcrumb over the title; larger summary figures on All Grades; the grade lines show only once a grade is picked", why: "Maisha, 9 Oct 2026: \"Remove the 'Students / Lincoln High School' breadcrumb\", \"slightly increase the size of the summary metrics\", and the grade breakdown \"should appear only when an individual grade is selected\". The grade sections already carry each grade's percentage on All Grades." },
      { change: "Bars | Donuts at the top right of each grade's card, remembered for the page", why: "Maisha: \"a view toggle for the milestone breakdown, allowing users to switch between the current line/bar view and a donut chart view, as discussed during our call.\" The donut reads like the bar: green done, amber needs attention, the percentage in the middle; a donut opens the same drawer." },
    ],
    kept: "Every milestone's counts and classification, the four states, the students behind each number, the grade picker, status and pathway filters, group messaging and the CSV.",
    order: "The curriculum order by milestone; students needing help first by student.",
  },
  "review-queue": {
    summary: "Student submissions waiting on me, under Prepare. Opens already filtered when I come from Milestones.",
    decisions: [
      { change: "Reviews lives under Prepare, not Students", why: "Maisha, 9 Oct 2026: \"Move 'Review' out of Students and into Prepare ... The actual reviewing/approving/giving-feedback workflow should live under Prepare.\"" },
      { change: "A 'waiting for you' link opens the desk filtered to those submissions, with a chip like 'Academic Plan · 4 students' and an x to see everything", why: "Maisha: \"If a milestone says '4 waiting for you,' clicking it should take the counselor directly to Prepare → Reviews, already filtered to those submissions.\"" },
      { change: "v5's desk layout with v4's three queues: Awaiting me, In progress, Missed deadline", why: "Chandu, 8 Oct 2026: \"Use the layout in v5.\" Unsubmitted items keep Send a reminder." },
    ],
    kept: "Every submission's student, milestone, dates, attachment, feedback, approve / ask for changes, and the grade picker.",
    order: "Most overdue first, then due soonest, then longest waiting.",
  },
  progress: PROGRESS_NOTE,
  insights: INSIGHTS_NOTE,
  checkins: {
    summary: "Students' weekly check-ins, the ones that need a response today, and sending the next one.",
    decisions: [
      { change: "A Check-ins tab under Students, and Send a check-in", why: "Chandu, 8 Oct 2026: \"remove the 'how's your week' thing from the student side. Just make sure there is a workflow to trigger these from the counselor side.\" Students answer only when a counselor sends one." },
    ],
    kept: "Every check-in answer, note, alert and the safety steps.",
  },
  explore: {
    summary: "Careers and pay in the student app's own look; every card opens a counselor sheet.",
    decisions: [
      { change: "A new Explore item: v5's Explore careers (curated ranked rows per world) and Pay by state", why: "Chandu, 7 Oct 2026, after the Replit's Career Intelligence: \"counselors need to have information on trends and what's popular etc in which state and which industries\"." },
      { change: "Trends live in the rows, not a separate tab", why: "Chandu, 8 Oct 2026: \"the trends addition is bad... Show the trend as a part of the explore page. Use the cards, simpler data, not a bunch of lists and bars\". Most in demand, growing fastest and what your students save are ranked rows; each card shows its one figure; a world swaps in its own rows." },
      { change: "Cards open a counselor sheet, never the student app", why: "Chandu: \"the career details open into the student app from counselor, that's bad... open in MODALS like we did for the top 3 cards\". The sheet shows which of my students saved it, the path in, pay by state and talking points." },
      { change: "Added beside Career + College Insights, nothing else changed", why: "Chandu: \"without changing the structure of things in v4\"." },
    ],
    kept: "The Replit's Career Intelligence: in-demand careers by industry, top 10 each, pay, growth, and a career opening to its plain-words line, education and major.",
  },
  connect: {
    summary: "Messages: one inbox for student questions and conversations, and Sent for announcements to a grade, a group or the school and everything else I have sent.",
    decisions: [
      { change: "Connect is Messages, under Prepare, with Inbox | Sent", why: "Maisha, 9 Oct 2026: \"Replace the current Connect section with 'Messages' inside Prepare. I think this is clearer than having Connect as a completely separate area.\" Then: \"Keep only two tabs: Inbox and Sent.\"" },
      { change: "Sent is the old Broadcasts tab, same layout and content; messages, reminders, to-dos and Explore shares sit behind one dropdown at its top left", why: "Maisha: \"Rename the existing 'Broadcasts' tab to 'Sent,' retaining its current layout and content. Remove the existing separate 'Sent' tab.\" The old Sent log's rows were still worth reaching, so they are a kind in that dropdown, not a third tab." },
      { change: "Questions are not their own tab; they sit in the Inbox with student, grade, topic, question, date, Reply and Resolve", why: "Maisha: \"Student questions are simply incoming messages, so they can live within Messages → Inbox.\"" },
      { change: "Groups are gone", why: "Maisha: \"Remove 'Groups' as student-to-student discussion boards for now ... creates moderation/safety complexity without being central to the career-readiness experience.\"" },
      { change: "Broadcasts can also go to a pathway group; the By Audience / Pick Students switch is a pill, not a second tab row", why: "Maisha: \"announcements sent to grades, groups, or the full school\"; one tab row per card (Chandu's standing rule)." },
    ],
    kept: "Every question, announcement and sent item, the composer, read receipts, and the compose links other pages use (Message these N).",
    order: "Inbox: needs reply first, newest first. Sent newest first.",
  },
  productivity: {
    summary: "Assist: five first drafts for routine counseling work, with the inputs a recommendation letter draws on shown beside it.",
    decisions: [
      { change: "Five templates: Recommendation Letter, Student Meeting Brief, Parent/Guardian Meeting Brief, Meeting Summary, Action Plan", why: "Maisha, 9 Oct 2026: \"Within Assist only keep these\"; Student Success Plan is \"Action Plan\" for now." },
      { change: "The brag sheet and family form are letter inputs, not templates: a checklist (received / available / Ask for it) above Generate Letter, and the draft uses them", why: "Maisha: \"These should instead be inputs students/families complete that Dreamari can use when helping generate a Recommendation Letter.\"" },
      { change: "No Needs Attention tab", why: "Maisha: \"This is duplicative. Students needing attention should already surface in Today, Students → Milestones, Prepare → Meetings → Needs Outreach.\"" },
    ],
    kept: "The document desk on a real US Letter page, preview, print and PDF, copy, save to notes, saved drafts, the signature, full screen and the phone studio.",
    order: "Templates in Maisha's order; the recommendation letter is the default.",
  },
  engagement: {
    summary: "Are my students actually using Dreamari? v4's engagement page with Dreamari's own activity indicators and an Inactive list you can act on.",
    decisions: [
      { change: "A Dreamari Activity row: exploring careers, finished a Play experience, connected with a professional, engaged with an opportunity", why: "Maisha, 9 Oct 2026: these \"are more meaningful than only showing logins because they explain what students are actually doing inside Dreamari.\" DEMO-ONLY seeded shares until Usman confirms each can be tracked." },
      { change: "Inactive 7+ Days: a grade opens exactly those students, with View, Message and Message All", why: "Maisha: \"If Grade 12 shows three inactive students, clicking Grade 12 should immediately open those three students.\"" },
      { change: "The Insights filter row replaces the page's own year picker", why: "Maisha: \"Counselors should be able to filter the entire section without repeatedly resetting context.\"" },
      { change: "Logins by Day | Month | Student; no Site view", why: "Maisha, 9 Oct 2026: \"remove the tab called 'site' completely.\"" },
      { change: "Inactive 7+ Days is four tiles with the count large, not four bars", why: "Maisha: \"the numbers are 2, 1, 1, 3. Does it make sense for this to be a line chart? Maybe the numbers should be larger or this data can be represented differently?\" Counts this small compare as figures, not as lengths; each tile still opens its students." },
    ],
    kept: "The four engagement stats with sparklines, logins by day / month / student, the monthly data table and the by-grade inactive breakdown.",
    order: "Month first, the Replit's default view.",
  },
  impact: {
    summary: "What difference is my counseling work making? v4's report page with Use of Time, v5's ASCA columns, and My Work as a quiet strip.",
    decisions: [
      { change: "Use of Time from v5: share of time with or for students against ASCA's 80%, and one bar across Student Meetings, Career & Postsecondary Support, Reviews, Group Programming and Administrative Work", why: "Maisha, 9 Oct 2026: \"Bring 'Use of Time' from V5 into V4 My Impact. Add a clear, digestible visualization showing where counselor time is going.\"" },
      { change: "ASCA Alignment in v5's cleaner columns, Academic and Career only", why: "Maisha: \"the V5 visual treatment is cleaner. Bring the V5 design into V4. Remove Social-Emotional from Dreamari's current ASCA section.\"" },
      { change: "My Work is a small strip (reviews, questions, meetings, letters) under the student sections", why: "Maisha: \"make it visually secondary to student impact ... they should not be the hero metrics.\"" },
      { change: "The two report buttons read exactly 'Export Impact Report' and 'Principal Report'", why: "Maisha: \"Keep both reporting actions in My Impact. Use exactly\" those names." },
    ],
    kept: "Every number on v4's My Impact: the on-track hero, plans by pathway, progress by grade, the readiness checkpoints, the reporting period, drills and both reports.",
    order: "Student momentum, direction, readiness, ASCA, then the counselor's own work.",
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
    summary: "Are my students prepared for what comes next? Four indicators, the trend, by grade, and the students behind each number.",
    decisions: [
      { change: "v5's Readiness layout with four indicators: On Track to Graduate, Academic Plan Complete, Postsecondary Plan Defined, Career Pathway Identified", why: "Maisha, 9 Oct 2026: \"Bring 'Readiness' from v5. Use the v5 Readiness structure, but update the content. Replace the current headline indicators with\" these four; GPA 2.0+ and Attendance 90%+ \"should not define readiness\"." },
      { change: "On Track to Graduate shows only while the SIS is connected; no combined readiness score", why: "Maisha: \"Only show On Track to Graduate if the necessary SIS/student data is actually available\" and \"Do not combine the four indicators into one universal readiness score yet.\"" },
      { change: "'Not Yet' is 'Needs Support'; every number opens its students with View, Message and Schedule", why: "Maisha: \"Change 'Not Yet' to something more action-oriented\"; \"Every metric should be clickable and open the students represented by the number.\"" },
    ],
    kept: "The trend over time, the by-grade comparison and the student list from v5's Readiness.",
    order: "Indicators, trend, by grade, then the students who need support.",
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
  meetings: {
    summary: "Who I am meeting this week, and who may need a meeting next. Upcoming | Needs Outreach, Book a meeting, Log a walk-in.",
    decisions: [
      { change: "This Week and Needs a Meeting are one Meetings page with two views", why: "Maisha, 9 Oct 2026: \"Combine 'This Week' and 'Needs a Meeting' into one section called 'Meetings' ... This keeps the calendar functionality without making Prepare feel like a separate calendar product.\"" },
      { change: "Each upcoming row: time and length, student, reason, the student's own words; Needs Outreach rows book in one tap", why: "Maisha: \"Keep: Book a meeting, Log a walk-in, Student name, Meeting reason, Date/time.\"" },
    ],
    kept: "v5's week, its Needs a Meeting list and its booking sheet.",
    order: "Upcoming by day and time; Needs Outreach neediest first.",
  },
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

