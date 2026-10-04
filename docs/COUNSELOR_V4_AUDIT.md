# Counselor v4 workspace audit

Updated 4 October 2026. Scope: the counselor workspace at `/counselor?v=4` and its student detail workflows. School/district leadership pages inherit v4 controls and materials; they have not received the same screen-by-screen content audit.

## Why

Chandu asked for a complete redesign, then specifically asked that everything be understood, valuable, functional, and free of unnecessary or repeated copy. The persistent, unrelated summary in Student Progress was the clearest example. V4 remains an independent comparison behind the v2/v3/v4 switch.

## Screen decisions

| Screen | Primary job and information | Decision and action |
| --- | --- | --- |
| Today | Decide who needs help and what needs review | Daily context; priority students; pending submission count; grade-eligible milestone completion; career and destination overview. Counts open the relevant workflow. Removed ornamental numbered captions and repeated motivational copy. |
| Student directory | Find and prioritize people | Stored status plus a concrete grade-eligible milestone explanation; completed / applicable milestones; last activity. Sorting, filters, profiles, and list/cards retained. Unstarted senior milestones no longer appear in younger students’ explanations. |
| Student profile — Overview | Understand the student and next action | Identity and current support facts; grade-eligible milestone rows; goals; career matches. Message opens a composer with this student selected. Removed duplicate Remind action. |
| Student profile — Plan | Assign and follow through | Per-student tasks with dates/completion/removal, plus student/counselor/guardian sign-off. Removed a shared 2024 task list and empty 6/12-month tabs; these were not student records. |
| Student profile — Activity | Understand student-app participation | XP, completed learning activities/simulations, saved careers/colleges, challenges, questions, posts, resume ATS score, report versions and experiences. Definitions are available beside each metric. Missing resume review is a dash. |
| Student profile — Notes / Drafts | Record context and prepare communication | Notes, activity-based check-in indicators and student-specific drafting tools retained. No fabricated clinical interpretation added. |
| Milestones | Find incomplete curriculum checkpoints | Grade curriculum cards use actual checkpoint status counts and proportions; details open the corresponding students. Curriculum checkpoints are distinct from submission milestones in Student Progress. |
| Review desk | Review one submission at a time | Priority-ordered inbox, student link, due/submission dates, attachment, feedback and decisions. Removed redundant urgency pill; due information remains. Mobile details use a closeable sheet. |
| Conversations | Read and respond; compose for selected students | Inbox/detail layout and compose workflow retained; shared pearl controls and responsive detail sheet replace inherited primitives. |
| Writing studio | Prepare usable documents | Setup and document canvas remain distinct. Paper stays white in either mode; viewer chrome follows v4. Print/save PDF and zoom are real actions. |
| Student Progress | Explain a report and identify its students | Each of nine reports has its own chart, denominator, selected category roster and group-message action. Grade comparison is optional and uses the same report/filters. Removed unrelated persistent grade summary. |
| Career & college | Identify popular interests and plan opportunities | Ranked bars show saved-interest counts. Explicit 120-student sample; interests may overlap. Opportunity drilldowns identify broader pathway students rather than falsely claiming the exact saved-interest cohort. |
| Engagement | See historical use and current inactivity | Historical series and reporting period are explicit. Student ranking units are logins. Exact monthly data is a disclosure. Check-in rows derive from current roster inactivity of 7+ days and open those exact students. |
| Your Impact | Review outcomes and prepare a report | Four sections: Student outcomes, Your work, Achievements, Standards. One full-report action. Historical periods are labeled; current roster is not represented as historical evidence. Corrected claims that a 33% response rate meant every question was answered. |
| Preferences | Manage account and workspace preferences | Account/signature, permissions, notification preferences and year dates. Removed repeated caseload metrics. Notification/year values persist in this browser; demo delivery limitations are explicit. |

## Metric contracts

- **Milestone completion:** Approved or Completed divided by students eligible for that milestone’s grade requirements; Not Applicable excluded. Student mini-track denominator is the count applicable to that student’s grade.
- **Progress statuses:** Approved, Completed, Pending Review, In Progress, Changes Requested, Overdue, Not Started remain distinct. No relabeling of Not Started as Overdue.
- **Declared plans:** All students whose intent is not Undecided. Four-year, two-year, trade, workforce, military, and undecided remain distinct.
- **Pending reviews:** Submission count across all 11 milestone keys; separate distinct-student count. A student can have several pending submissions.
- **Support:** Stored Needs Attention plus At Risk; On Track is a separate cohort. Descriptive milestone evidence does not change stored support classification.
- **Engagement:** Total login events and distinct active students are different series; average is logins / active students. Current inactivity is a separate roster snapshot.
- **Dream Score:** XP earned for student-app milestones, not an academic score or readiness percentage.
- **Impact:** Seeded historical aggregates for the selected period, not the current 121-person roster. Export language must make only claims supported by those figures.

## Granular components

V4 owns its tabs, status labels/icons, portrait frames, milestone mini-tracks, select styling, metric displays, ruled rows, detail sheets and document chrome. Dropdowns use the shared keyboard/clamping behavior with an opaque v4 portal surface. Dialogs contain focus, close on Escape, restore focus and lock background scrolling. Reduced-motion behavior remains respected. Main navigation groups work by Today / Students / Workspace / Analytics, with contextual links below.

## Validation and limits

- TypeScript and v4 ESLint pass; token validation passes (464 tokens, both modes); scrollbar audit and diff whitespace checks pass.
- Browser: all main counselor routes loaded; profile tabs, all nine progress reports, category rosters, grade comparison, eligibility empty state, engagement grade drilldown, monthly disclosure, settings disclosures, review attachment and full-report viewers checked.
- v2 → v3 → v4 switch verified through rendered version attributes.
- Light and dark visuals inspected; light dropdown computed surface `rgb(240,244,238)` and text `rgb(35,51,46)` checked. Main screens tested at desktop and 390px without document overflow; mobile review sheet visually checked.
- CSV handler remains implemented, but the in-app browser did not produce a download event during verification. Print-dialog output was not saved to PDF during this pass.
- This remains a local prototype: no production authorization, notification transport, historical event store, or competitor-feature-parity claim. Demo/local storage behavior is retained and identified.
