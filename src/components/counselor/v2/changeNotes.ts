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
    changed: ["Attention list leads the page, students ranked by severity with the reason", "One hero card, plain glass elsewhere; one blue hue plus status colors", "Pathways as one distribution bar with a fixed spectral order", "Every card opens its screen"],
    why: "The reference showed three equal donuts and no way to act. A counselor's first question is who needs me today.",
    better: "Worst first, one glance, one click to the student. Fewer colors, each meaning something.",
    order: "Needs your attention shows At Risk students only, ranked Critical (an overdue or rejected milestone) before High (three or more not started) before Medium (one or two not started, or a low roadmap), ties by the least-complete roadmap; three rows, See all for the rest. The strip leads the page because it is the only card that says act now; everything under it is context. Legends and pathways are ordered by size.",
  },
  students: {
    changed: ["Six columns instead of thirteen; grade and pathway sit under the name", "Sorted attention first, with the reason under the status", "Status and plan pickers in the toolbar, a counselor column for oversight roles", "Card list on phones, paginated at twenty"],
    why: "The reference's 120-row, 13-column table repeated 'Lincoln High School' and 'Approved' on every row and blank-rendered on phones.",
    better: "The students to act on are at the top with why, on any device.",
    order: "Default sort is priority: At Risk, then Needs Attention, then On Track; within a status the same Critical / High / Medium ranking the Overview uses; ties by the least-complete roadmap. Name, roadmap and last active are one click on their headers. The reason under the chip is derived from the student's own milestones.",
  },
  milestones: {
    changed: ["One ring for the milestone that needs the most focus, then every milestone as a stacked status bar", "Four states, one color code, attention first", "Counts scaled to the students the role sees; a counselor picker for the Lead"],
    why: "Seven identical ring cards per grade asked the reader to decode each one; the question is which milestone first.",
    better: "One answer at the top, the full breakdown in one column of bars below.",
    order: "The milestone with the largest share of students needing attention (weighted double) plus not started leads as the hero; the rest follow the same score, then the lowest percent done. A milestone everyone is still working on is not treated as behind.",
  },
  "review-queue": {
    changed: ["One item per pending submission, ordered by due date", "Decisions recorded and shared with every screen, with Undo", "Attachment previewed in place; the student's name opens the profile", "Pane opens as a sheet on phones"],
    why: "The reference hid a student's second submission, ordered by position, and lost the decision on click.",
    better: "Overdue first, a real record of what you said, and the review done without leaving the screen.",
    order: "Most overdue first, then due soonest, then longest waiting. Overdue is Urgent, due within two days is High, else Normal. Nothing here is ordered by who submitted or by roster position.",
  },
  progress: {
    changed: ["Nine reports as a chip row instead of a 300px side menu", "Grade comes from the header filter; the Lead can pick a counselor", "Verdict beside a readable chart; pathway filter uses the roster's pathways"],
    why: "The side menu cost a third of the width; the old pathway filter listed careers that no student had, so every choice emptied the report.",
    better: "Full-width chart, every report one tap away, filters that return results.",
    order: "Report chips are in the reference's order; chart categories keep the reference's order for each report.",
  },
  connect: {
    changed: ["Opens on Questions with the open count; unanswered first", "Announcements can be written, and open to who read them", "Groups open to their feed and can be created"],
    why: "The reference opened on announcements, listed questions in arbitrary order, and its buttons did nothing.",
    better: "The tab with work comes first, and every control does what it says.",
    order: "Questions: new and follow-up first, then viewed and in progress, then answered; newest first within each. Groups: most recently active first. Announcements: newest first.",
  },
  insights: {
    changed: ["Recommendations as one number, one subject, one action", "Ranked lists as full-width bars; chart/list toggles removed", "One blue hue"],
    why: "Twelve lines of advice and four tiny sparkline lists asked for reading, not glancing.",
    better: "The three things to do this semester, then the ranking, in one look.",
    order: "Recommendations are the three largest interest clusters, largest first; ranked lists are by count.",
  },
  productivity: {
    changed: ["Tools as a chip row instead of a side column", "Drafts built from the student's own plan, editable, with Copy, Download and Save to notes", "Students Needing Attention is a ranked list that opens profiles"],
    why: "The reference generated the same paragraph for every student and left it on screen with nowhere to go.",
    better: "A draft that is specific, and three ways to use it.",
    order: "Students Needing Attention uses the Overview's ranking: Critical, High, Medium, then the least-complete roadmap; ten rows.",
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
    changed: ["Role is a proper picker and drives the whole dashboard", "Permissions shown for your role only", "Caseload card titled by role"],
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
    changed: ["New screen for administrators", "Templates built from live numbers, downloaded as CSV"],
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
