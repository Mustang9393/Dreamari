# SchooLinks staff side, watched 25 Sept 2026

Source: "SchooLinks Demo (High School & Beyond Plan Universal Platform)",
Alicia Buxton for Washington OSPI, youtu.be/_Ep_AtU1Fpc, staff section
13:09 to 29:00. Watched frame by frame in the browser; these are
observations, not the vendor's own descriptions. Shared by Usman as the
best picture of the counselor persona.

## What the staff dashboard is

One screen, seven tabs across the top, a live student activity feed down
the left ("Craig Coppa finished the assessment Find Your Path, 7 days ago").

- **Action Items** (default tab): suggested actions for the counselor
  (add a profile photo, fill out the staff profile, set meeting
  availability) and "Outstanding Student Requests" (e.g. "400 applications
  with materials due").
- **Student To Dos**: a dated list of what students have been assigned
  this month and next ("Explore Careers, 20 min, 11th grade, 5th",
  "Complete the Find Your Path assessment"), each with a completion pill.
- **Learning & Motivation**, **Social-Emotional Learning**: not demoed.
- **Career Interest**: "Top Career Goals" (ranked list, e.g. Electrical
  and Electronic Engineering Tech, Medicine, Registered Nursing) and "Top
  Career Clusters" (Science, Technology, Engineering and Math; Health
  Science; Arts, A/V Tech and Communications; Business, Management and
  Administration). Selecting a row shows a card with the cluster's image,
  a description, and a "View students" count (e.g. 391).
- **Post-Secondary**: "Future Pathway" as a pie chart (4-year 77.5%,
  2-year 9.3%, trade, workforce, military, gap year) and "Most Favorited
  Schools" (UT Austin, Texas A&M, Rice, U of Houston, Texas Tech) with a
  school card and "455 students"; "Most Popular Majors" below.
- **Check-ins**: latest results across Emotional / Social / Physical /
  Cognitive as stacked percentage bars (green / amber / red buckets),
  plus a "Notes from students" feed. Settings hold tracked alert words
  (harmful language) and celebration words, with email alerts to
  designated staff.

## Student list and caseload

- A table: name, grade, last active, meetings and notes, To do (mostly
  "Overdue"), assigned tags (At-risk, Gifted), quick links. Filters by
  school, grade, and a big-picture filter; checkbox selection; search by
  name, email, student number.
- Rostering is decided by the district (who sees which students).
- A student opens to a **Student Casefile**: a To Do List with tabs
  Staff To Dos, Student To Dos, Guardian To Dos, Reminders; items grouped
  Overdue (30+ days), Due within the next four weeks, Completed; each item
  named with grade and a Not Done / Done toggle ("Financial Aid Learning
  Unit", "Complete College Financing", "Set/Update Post-Secondary Goal",
  "Explore Careers").
- The casefile menu lists everything on a student: Student Activities
  (To Dos, Assessments, Learning Chapters, Game of Life, Form Responses,
  Events and Reminders), Planning (Course Plans, Personalized Plans,
  Goals), Accountability and Performance (Indicators, Student
  Performance, Washington Graduation Pathways), College (College Lists
  and Favorites, Admission Stats, Applications, Student Records, Athletic
  Eligibility), Career (Career Exploration), Check-ins (Check-in
  History), Other (Guardians, Documents, Meetings and Notes, Experience
  Tracking, Programs).

## Analytics

- Analytics menu: Scope and Sequence Analytics, Student Analytics,
  Industry Partner Analytics, Form Responses, Senior Year End Analytics,
  Washington Graduation Pathways, Report Center.
- **Scope and Sequence Overview**: a grid of indicators (rows) by grade
  (columns 5th to 12th), grouped Platform Usage / Self Discovery /
  Academic Planning and Progress; each cell a ring showing the share of
  that grade who completed the indicator; hovering gives "90% of students
  completed this". Refreshes every 15 minutes. A Timeline view lists
  upcoming indicators by due date with a completion bar and "View
  breakdown". Clicking a cell gives a **customized student list** ("Submit
  Personalized Plan: Not Met") of exactly the students who have not done
  it, so the counselor can act.
- **Student Analytics**: students as rows, chosen indicators as columns,
  green or red per cell.
- **Report Center**: every report is a template with a filter panel
  (scope, schools, grades, tags, caseload) and a column picker; exports
  CSV or PDF; can be saved and **scheduled** (email delivery, weekly, day
  and time, or SFTP). Reports include Student Check-in Completion, Student
  List, Student On-track Status, On-track Totals by Category, Course Plan
  Completion, Next Year's Course Requests, Guardian Accounts.

## Personalized Plans (the High School and Beyond Plan)

- District view: a plan per student per year with a funnel bar (Not
  submitted / Counselor missing / Guardian missing / All approved) and a
  table (student, modified, guardian contact, student / counselor /
  guardian approval ticks, PDF, View plan / Start plan). Deadline schedule
  and scheduled reminders.
- A plan opens as a document with numbered sections (What is the plan,
  Career Interest Inventory with personality profile, Career and Education
  Goals with postsecondary plan and college goal, Graduation Pathways,
  ...), a header showing Student submitted / Counselor approved / Guardian
  pending, and an Approve or Undo action per party.

## What this says about the persona

- The counselor's unit of work is the **student who has not done the
  thing**: every aggregate drills to a list of exactly those students.
- **Completion of assigned steps by grade** is the core measure, not
  abstract readiness percentages. Steps have due dates and an overdue
  state.
- Three parties sign a plan: student, counselor, guardian. Guardian
  involvement is first-class.
- **Check-ins** (well-being, with alert words) are a counselor feature,
  not a student one.
- Reports are templated, filtered, exported and **scheduled**; nobody
  reads analytics on screen for its own sake.
- Course planning and graduation pathways are central (state-mandated),
  and outside what Dreamari does today.

## Where Dreamari v2 already lines up, and where it does not

Lines up: attention-first lists that open the student; a caseload table
with overdue and status; a per-student casefile with to-dos by window
(Plan card); career interest and post-secondary aggregates with
drill-through; report templates that export CSV; a counselor approval
step on submitted work.

Does not, yet: an indicator-by-grade grid that drills to the students
who have not completed it (the single most useful screen in the demo);
guardian as a party; well-being check-ins; scheduled report delivery;
course planning; a live activity feed. See the response in
docs/AI_HANDOFF.md (25 Sept 2026, "Feedback round") for what was decided.
