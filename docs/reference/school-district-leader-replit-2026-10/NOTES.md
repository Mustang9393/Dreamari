# Replit reference: School Leader and District Leader views (Oct 2026)

Source: https://web-app-prototype-maishak.replit.app ("Dreamari Counselor Dashboard" Replit), analysed live on 2 Oct 2026 at a 1440x900 viewport. The author is Maisha (same Replit as the counselor reference). Nothing was edited in the app. All data is synthetic (the app says so itself, repeatedly).

Method note: info (i) icons are hover tooltips whose full text is also in `aria-label`; those strings are copied verbatim below. Chart series were read from the Recharts props, so the numbers are exact, not eyeballed.

---

## 1. Overview

### 1.1 The DEMO VIEW selector

A select labelled "DEMO VIEW" (with an (i) "About Demo View" icon) sits at the right of the dark top bar in every role. Its trigger shows the current role name; a second (i) next to it ("About <role> view") shows the role's description as a tooltip. The menu is a four-option popover; each option has a bold name, a one-line description and a check mark on the current one:

| Option | Description (verbatim) |
|---|---|
| Counselor (default on first load) | "Student-level view for counselors, advisors, coaches, and other professionals directly supporting students." |
| School Leader | "Schoolwide view for principals, assistant principals, CCR/CTE leaders, counseling leaders, and other school administrators." |
| District Leader | "Multi-school view for superintendents, assistant superintendents, district CCR/CTE leaders, counseling leaders, and other district administrators." |
| Nonprofit Leader | "Organization-wide impact view for executives, program leaders, career-readiness teams, funders/reporting teams, and other leaders overseeing youth programs." |

Behaviour: choosing a role swaps the whole shell (sidebar, header, filters, identity chip in the sidebar footer) and routes to `/`. The select is keyboard operable (Enter opens, arrows move, Enter chooses). It is the only way to move between roles; it is a demo device, not an authenticated role switch.
Persistence: the app remembers the last school opened from the District view. Switching District -> School Leader afterwards shows that school (e.g. Kingsbridge Preparatory) rather than resetting to Northbridge Academy; Northbridge is the default school the first time. There is no school picker inside the School Leader view.

### 1.2 Top-bar controls per role

| Control | Counselor | School Leader | District Leader | Nonprofit Leader |
|---|---|---|---|---|
| School picker | "Lincoln High School" select, single option | none (school is in the header text) | none | none |
| Academic year | select "2023-2024" (options 2023-2024, 2024-2025) | "Academic Year" select, single option "2026–27", in the filter row | only inside School Performance (single option 2026–27) | none |
| Grade | select "All Grades" (All Grades, Grade 9..12) | "Grade" select (All grades, Grade 9..12) in the filter row | Grade select on School Performance only; By school / By grade toggle on Student Outcomes | "All grades" in the Impact filters row |
| Other filters | Search box "Search students...", bell with red "7" badge | Counselor (All + 4 names), Student Group (All students / Needs support / Recent activity) | School status, search by school name (School Performance); Metric select (Student Outcomes) | programs, locations, cohorts, career clusters, period |
| Identity block (left) | none, logo + "Dreamari / Command Center" | "SCHOOL LEADER · SYNTHETIC DATA", school name, "City · N students · 2026–27", tagline, (i) | "DISTRICT LEADER · SYNTHETIC DATA", "Metro Heights Public Schools", "11 schools · 13,058 students · 39 counselors · 2026–27", tagline, (i) | "NONPROFIT LEADER · DEMO", "FuturePath Alliance" |
| Theme toggle | no | yes (light default, dark option) | yes | no |
| "Data definitions" button | no | yes (modal) | yes (modal) | no |
| Sidebar footer chip | "SC / Sarah Chen / Lincoln High School" | initials + school name + "School Leader" | "MH / Metro Heights Public ... / District Leader" | "FP / FuturePath Alliance / Nonprofit Leader" |

### 1.3 Navigation per role (side by side)

| # | Counselor (11, route) | School Leader (5, route) | District Leader (5, route) | Nonprofit Leader (1) |
|---|---|---|---|---|
| 1 | Overview (`/`) | Overview (`/`) | Overview (`/`) | Overview (`/`) |
| 2 | Students (`/students`) | Student Progress (`/student-progress`) | School Performance (`/school-performance`) | |
| 3 | Milestone Tracker (`/readiness`) | Career + Postsecondary (`/career-postsecondary`) | Student Outcomes (`/student-outcomes`) | |
| 4 | Review Queue (`/review-queue`) | Counseling Team (`/counseling-team`) | Counseling Capacity (`/district-capacity`) | |
| 5 | Student Progress (`/reports`) | Reports (`/reports`) | Reports (`/district-reports`) | |
| 6 | Counselor Connect (`/connect`) | | | |
| 7 | Career + College Insights (`/career-insights`) | | | |
| 8 | Productivity Suite (`/productivity`) | | | |
| 9 | Platform Engagement (`/engagement`) | | | |
| 10 | My Impact (`/impact`) | | | |
| 11 | Settings (`/settings`) | | | |

Same names across roles: only "Overview", "Reports" and (confusingly) "Student Progress" (but it is a different screen in each role: the Counselor's "Student Progress" is the report generator at `/reports`). No Counselor screen is re-used unchanged by either leader role. Neither leader role has Settings, Students, Review Queue, Counselor Connect, Productivity Suite, Platform Engagement, My Impact or Milestone Tracker.

### 1.4 Structural facts worth knowing before building

- Both leader roles are **read-only dashboards**: no create/edit/approve actions anywhere (only filter, drill, open modal, export).
- All data is declared synthetic in the UI. Every KPI has an (i) tooltip with a numerator, denominator, population and launch baseline. The (i) text is also the accessible name (aria-label / title), so the tooltips are keyboard and screen-reader reachable.
- The app is a Replit prototype built on React + Recharts + lucide icons; School and District screens use separate CSS namespaces (`school-*` and `district-*`), so the two roles look related but not identical (School = cards with purple accent and a bold dashboard feel; District = airy editorial tables).
- Launch baseline language everywhere ("vs launch baseline", "since launch") means the baseline before Dreamari was introduced; deltas are percentage points ("pts") except counselor capacity, which is a relative % and is explicitly flagged "not percentage points".
- Two clickable-hierarchy paths exist: **District Overview/School Performance/Counseling Capacity -> a school's School Leader view** (cross-role drill) and **School Overview support-status bars -> Student Progress filtered by status**.
- The seed school in the School Leader view, **Northbridge Academy (Brooklyn, 964 students)**, is also school #4 of the district, with identical numbers in both places (career 78%, planning 88%, 4 counselors, 38 follow-ups, 90% coverage). The only place the two views disagree on the same fact is the district "Counselor capacity" (+19%) versus the school (+21%), which is expected (district is a rollup).
- Sample student names (Amara Lewis, Mateo Rivera ...) are the same 20 across every school.

---

## 2. School Leader

Persona shown in header: "SCHOOL LEADER · SYNTHETIC DATA", school **Northbridge Academy**, "Brooklyn, NY · 964 students · 2026–27", tagline "Helping school leaders track student pathways, counseling reach, and planning progress." Sidebar footer: avatar "NA", "Northbridge Academy", "School Leader". (Counselor view footer was "Sarah Chen / Lincoln High School".)

Routes: `/` (Overview), `/student-progress`, `/career-postsecondary`, `/counseling-team`, `/reports`. The sidebar is 5 items, much shorter than the counselor's 11.

Sidebar (in order): Overview, Student Progress, Career + Postsecondary, Counseling Team, Reports.

### 2.0 School Leader shell (applies to every School Leader screen)

Header block (left): small caps "SCHOOL LEADER · SYNTHETIC DATA" followed by an (i) icon (tooltip = the role description: "Schoolwide view for principals, assistant principals, CCR/CTE leaders, counseling leaders, and other school administrators."), then bold "Northbridge Academy", then "Brooklyn, NY · 964 students · 2026–27", then the tagline.

Header (right): a light/dark theme segmented toggle (two icon buttons, aria-labels "Use light theme" / "Use dark theme"; the header is always dark navy, the toggle flips the content area; light is the default), a "Data definitions" button (opens a modal, see 2.0.1), then "DEMO VIEW" label + (i) + the Demo View select showing "School Leader" + another (i) ("About School Leader view", same tooltip text as above).

The Counselor top bar (school picker "Lincoln High School", year "2023-2024", grade "All Grades", "Search students...", bell with a red "7" badge) is **gone** in School Leader view. There is no school picker (single school) and no student search or notifications bell.

Filter row (a "FILTERS" label, then four native selects, then an (i)):
- Academic Year: only "2026–27" (single option).
- Grade: All grades, Grade 9, Grade 10, Grade 11, Grade 12.
- Counselor: All counselors, Danielle Brooks, Marcus Chen, Sofia Martinez, Aisha Thompson.
- Student Group: All students, Needs support, Recent activity.
- (i) tooltip: "Schoolwide aggregates use 964 enrolled students and do not change with these filters. Grade, counselor, and student-group selections scope only the 20 synthetic student profiles."

Important behaviour: the four filters are global (they persist across School Leader screens) but they ONLY filter the 20-row "Student Sample" table on Student Progress. Every KPI, chart and count is schoolwide and unaffected. Student Group semantics: "Needs support" = every student whose status is not On Track (4 of 20); "Recent activity" = all except the one with 46 days since last activity (19 of 20).

#### 2.0.1 "Data definitions" modal

Title "Data definitions", subtitle "Northbridge Academy · 964 enrolled students · 2026–27 academic year · compared with the launch baseline". Round X button top right plus a "Close" button at the bottom. Content, in order:

Section "Student outcome percentages": five cards, each with title, Numerator line, Denominator line, and on the right "Current X% · Launch baseline Y% · +Z% points" (green delta):
1. Career Exploration. Numerator: "Unique enrolled students with at least one meaningful career exploration action, such as saving a pathway or completing a career simulation." Denominator: "All enrolled students in the selected scope." Current 78% · Launch baseline 59.5% · +18.5% points.
2. Postsecondary Exploration. Numerator: "Unique enrolled students with a recorded postsecondary exploration action, such as saving an institution or reviewing a program." Denominator same. Current 69% · baseline 51% · +18% points.
3. Experiential Career Learning. Numerator: "Unique enrolled students who completed at least one career-connected simulation or experiential learning activity." Current 67% · baseline 46.4% · +20.6% points.
4. Professional Exposure. Numerator: "Unique enrolled students who engaged with at least one industry professional." Current 54% · baseline 35.3% · +18.7% points.
5. Planning Milestone Completion. Numerator: "Unique enrolled students who completed the required career and postsecondary planning milestones." Current 88% · baseline 59.1% · +28.9% points.

Further text blocks:
- "Counselor capacity": "The school’s +21% and district’s +19% values estimate relative capacity returned for direct student support compared with the prior workflow. They are relative changes, not student outcome percentages or percentage-point gains. The comparison period is the prior workflow."
- "Selected period and scope": "The current snapshot covers the 2026–27 academic year. School percentages use that school’s enrolled students; district percentages use enrollment-weighted school rollups. Follow-up coverage uses only students identified as requiring follow-up."
- "Prototype data notice": "All figures and student profiles in this workspace are synthetic. No live student information system, school roster, or district data source is connected."
- "Potential production data sources": "With appropriate authorization, a production setup could use Dreamari activity and report events, verified program participation, student enrollment and counselor assignments from an SIS, and documented follow-up activity. These are possible sources only; none are connected here."

Note the modal confirms: district counselor efficiency = **+19%** (school = +21%); district percentages are **enrollment-weighted** rollups.

### 2.1 Overview (`/`)

Eyebrow "SCHOOL SNAPSHOT". H1-style heading "Student pathways and counseling reach". Subtitle "A current view of exploration, planning progress, and student support across the school."

**A. KPI row: five cards** (each: small-caps label, (i) icon, a purple rounded icon chip top right, a big number, a green delta line, and a decorative sparkline). The sparkline is the SAME static hand-drawn SVG path on all five cards (viewBox 86x24, purple #7759d6, rising), so it is decorative, not data-bound.

| Card | Value | Delta line | (i) tooltip (verbatim) |
|---|---|---|---|
| CAREER EXPLORATION | 78% | +18.5 pts since launch | "Share of enrolled students with a recorded career exploration action, such as saving a pathway, completing a simulation, or reviewing a career profile, during the selected academic year. A student counts when they meet the action in this definition. Population: 964 enrolled students. 78% currently, compared with 59.5% at launch, during the 2026–27 academic year." |
| POSTSECONDARY EXPLORATION | 69% | +18 pts since launch | "Share of enrolled students with a recorded postsecondary exploration action, such as saving an institution or reviewing a program, during the selected academic year. A student counts when they meet the action in this definition. Population: 964 enrolled students. 69% currently, compared with 51% at launch, during the 2026–27 academic year." |
| EXPERIENTIAL CAREER LEARNING | 67% | +20.6 pts since launch | "Share of enrolled students who completed at least one career-connected simulation or experiential learning activity during the selected academic year. A student counts when they meet the action in this definition. Population: 964 enrolled students. 67% currently, compared with 46.4% at launch, during the 2026–27 academic year." |
| PROFESSIONAL EXPOSURE | 54% | +18.7 pts since launch | "Share of enrolled students who engaged with at least one industry professional during the selected academic year. A student counts when they meet the action in this definition. Population: 964 enrolled students. 54% currently, compared with 35.3% at launch, during the 2026–27 academic year." |
| COUNSELOR EFFICIENCY | +21% | vs prior workflow (neutral grey/green text, not "pts") | "Estimated relative increase in counselor capacity based on time returned for direct student support. Current value: +21% across 4 counselors, compared with the prior workflow. This is not a percentage-point change in student outcomes." |

The KPI cards are not clickable (no navigation).

**B. "Impact Over Time" chart card.** Title "Impact Over Time" + (i) (tooltip = the tooltip of the currently selected metric, e.g. for Career Exploration the longer text shown above "...The value is the share of students meeting this metric definition. Population: 964 enrolled students. 78% currently, compared with 59.5% at launch..."). Subtitle under the title = the selected metric name ("Career Exploration").
- Segmented metric tabs (single select, default Career Exploration): Career Exploration, Postsecondary Exploration, Career Simulations, Professional Exposure, Counselor Efficiency. (Note the tab label "Career Simulations" corresponds to the KPI card "EXPERIENTIAL CAREER LEARNING" and the definition "Experiential Career Learning".)
- "Impact period" select (native, default "Since Launch"): Since Launch, This Semester, This School Year.
- Chart: Recharts single-series LINE chart (purple line, round dots at each point), horizontal dashed gridlines, X axis month labels, Y axis percent 0%–100% ticks at 0/25/50/75/100 (for Counselor Efficiency the same axis shows ticks 0%, 7%, 14%, 25%: a non-uniform top tick, a prototype quirk not worth copying). Hover shows a vertical cursor line and a tooltip: month label bold, then "<Metric name> : <value>%" in purple. For Counselor Efficiency the tooltip reads "Counselor Efficiency : 4% vs prior workflow".
- Period behaviour: Since Launch = 9 points starting at "Launch"; This Semester = last 4 months only (Jan to Apr); This School Year = 8 points (Sep to Apr, no "Launch" point).

Exact series (value, % ; Counselor Efficiency is the relative % gain):

| Month | Career Exploration | Postsecondary Exploration | Career Simulations | Professional Exposure | Counselor Efficiency |
|---|---|---|---|---|---|
| Launch | 59.5 | 51 | 46.4 | 35.3 | 0 |
| Sep | 59.5 | 51 | 46.4 | 35.3 | 0 |
| Oct | 60.8 | 52.3 | 47.8 | 36.6 | 1.5 |
| Nov | 63 | 54.4 | 50.3 | 38.9 | 4 |
| Dec | 66.2 | 57.5 | 53.8 | 42 | 7.6 |
| Jan | 70.1 | 61.3 | 58.1 | 46 | 12 |
| Feb | 73.8 | 64.9 | 62.3 | 49.7 | 16.2 |
| Mar | 76.5 | 67.6 | 65.4 | 52.5 | 19.3 |
| Apr | 78 | 69 | 67 | 54 | 21 |

(Semester view = Jan, Feb, Mar, Apr rows; School Year view = Sep to Apr rows. Apr is the "current" value shown on the KPI cards.) The chart ignores the Grade / Counselor / Student Group filters.

**C. "Student Support" card** (left half). Eyebrow "STUDENT SUPPORT", title "Support Status" + (i), small icon chip top right (people icon). Big number "964" + "students in scope". Four horizontal progress-bar rows (label left, bar, count right):
- On Track 784 (green bar, near full)
- Needs Exploration 77 (amber)
- Incomplete Career + Postsecondary Report 78 (purple)
- No Recent Activity 25 (red)
(784 + 77 + 78 + 25 = 964. Bar widths are proportional to each count out of the 964 total: On Track fills ~81% of the track, the other three are short stubs.)
(i) tooltip: "Counts are mutually exclusive support categories across 964 enrolled students for the 2026–27 academic year. Select a category to inspect its synthetic student sample."
Each row is a button: clicking navigates to `/student-progress?status=<Category>` (URL-encoded, e.g. `?status=On%20Track`) which opens Student Progress with the Student Sample "Support Status" select pre-set to that status. Link at the bottom "View student progress →" goes to `/student-progress` (unfiltered).

**D. "Counseling Coverage" card** (right half). Eyebrow "SCHOOLWIDE SNAPSHOT", title "Counseling Coverage", graduation-cap icon chip. A 2-column grid of five stats:
- Counselors: 4
- Students: 964
- Average Caseload: 241 (= 964 / 4)
- Planning Milestone Completion: 88% with an (i): "Share of enrolled students who completed the required career and postsecondary planning milestones during the selected academic year."
- Students Requiring Follow-Up: 38
Footer row: "Follow-up coverage 90%" + (i): "Share of students flagged as needing follow-up who have a follow-up action recorded. Numerator: students with documented follow-up. Denominator: students requiring follow-up. 90% currently; 2026–27 academic year." and, right-aligned, link "View team →" (goes to `/counseling-team`).
(Follow-up numbers: 38 flagged x 90% = 34.2, i.e. ~34 with a recorded action; not stated in UI.)

No empty/loading/error states were visible on this screen. No tabs other than the metric tabs.

### 2.2 Student Progress (`/student-progress`)

Eyebrow "STUDENT PROGRESS". Heading "Student progress and support". Subtitle "Review current planning milestones, activity, and a representative student sample."

**A. KPI row: five cards** (each: label, (i) top right, big %, grey delta line; no sparkline, no icon chip). The four milestone (i) tooltips share a prefix: "Completion percentages are the share of 964 enrolled students meeting the named milestone in 2026–27. Follow-up coverage is the share of students flagged for follow-up who have an action recorded. " then the card-specific tail.

| Card | Value | Delta | Card-specific tooltip tail |
|---|---|---|---|
| Career + Postsecondary Report Completion | 62% | +11 pts since launch | "Career + Postsecondary Report Completion: numerator is students who completed a Career + Postsecondary Report; denominator is all enrolled students. Current 62%; launch baseline 51%." |
| Postsecondary Shortlist Planning Milestone Completion | 61% | +7 pts since launch | "...numerator is students who saved at least one postsecondary option; denominator is all enrolled students. Current 61%; launch baseline 54%." |
| Top Three Completion | 71% | +7 pts since launch | "...numerator is students who selected three career pathways; denominator is all enrolled students. Current 71%; launch baseline 64%." |
| Resume Completion | 54% | +8 pts since launch | "...numerator is students who completed a resume; denominator is all enrolled students. Current 54%; launch baseline 46%." |
| Follow-Up Coverage | 90% | helper text "Share of flagged students with a follow-up action recorded. +5 pts since launch" | "Follow-Up Coverage: Share of students flagged as needing follow-up who have a follow-up action recorded. Numerator: students with a recorded follow-up action. Denominator: students flagged for follow-up. Current 90%; launch baseline 85%." |

**B. "Career Experiences and Access" card.** Title "Career Experiences and Access", subtitle "Counts of experiences available to students during the selected academic year." (i) top right: "Counts are schoolwide totals for the 2026–27 academic year. The five labels each describe the event or verified participation being counted; counts are not percentages. School population: 964 enrolled students." Five tiles on a soft grey background, each with a small purple icon, a big count, a label and a helper sentence:
- 72 · Professionals Engaged · "Unique professionals participating in student career experiences."
- 89 · Career Conversations · "Recorded structured student-professional interactions."
- 7 · Career Events · "Career exposure events made available to students."
- 36 · Work-Based Learning Experiences · "Verified career-connected experiences during the selected period."
- 340 · Career Simulations Completed · "Completed Dreamari career simulation experiences."
(Not clickable. Counts are raw numbers, not percentages.)

**C. "Student Sample" table.** Title "Student Sample", subtitle "Synthetic profiles for focused review; schoolwide category counts appear on the overview." Right-aligned counter "Showing N of 20 synthetic records". Two table-local filters (native selects, left aligned): "Support Status" (All statuses, On Track, Needs Exploration, Incomplete Career + Postsecondary Report, No Recent Activity) and "Interest Area" (All interest areas, Healthcare, Technology, Business + Finance, Creative Industries, Engineering, Skilled Trades, Public Service, Other). These combine (AND) with the four global filters in the header. Arriving from an Overview category click pre-sets Support Status and shows e.g. "Showing 16 of 20" for On Track. (The select value changes do not rewrite the URL.)

Columns (no sorting; headers are plain text, uppercase): STUDENT (initials avatar circle + name + id like N-001), GRADE, COUNSELOR, PRIMARY INTEREST, SUPPORT STATUS (pill), LAST ACTIVITY. Status pill: On Track = green tint; every other status = amber tint. Row hover = soft background. Only the student name button is clickable.

All 20 rows (this is the whole dataset):

| id | Name | Gr | Counselor | Primary interest | Status | Last activity |
|---|---|---|---|---|---|---|
| N-001 | Amara Lewis | 9 | Danielle Brooks | Healthcare | On Track | 2 days ago |
| N-002 | Mateo Rivera | 10 | Marcus Chen | Technology | On Track | 5 days ago |
| N-003 | Jada Williams | 11 | Sofia Martinez | Business + Finance | On Track | 8 days ago |
| N-004 | Eli Park | 12 | Aisha Thompson | Creative Industries | On Track | 11 days ago |
| N-005 | Nia Okafor | 9 | Danielle Brooks | Engineering | On Track | 14 days ago |
| N-006 | Jonah Patel | 10 | Marcus Chen | Skilled Trades | On Track | 17 days ago |
| N-007 | Lena Torres | 11 | Sofia Martinez | Public Service | On Track | 20 days ago |
| N-008 | Samira Yusuf | 12 | Aisha Thompson | Other | On Track | 3 days ago |
| N-009 | Theo Morgan | 9 | Danielle Brooks | Healthcare | On Track | 6 days ago |
| N-010 | Zoe Bennett | 10 | Marcus Chen | Technology | On Track | 9 days ago |
| N-011 | Iris Coleman | 11 | Sofia Martinez | Business + Finance | On Track | 12 days ago |
| N-012 | Noah Grant | 12 | Aisha Thompson | Creative Industries | On Track | 15 days ago |
| N-013 | Maya Foster | 9 | Danielle Brooks | Engineering | On Track | 18 days ago |
| N-014 | Owen Ellis | 10 | Marcus Chen | Skilled Trades | On Track | 21 days ago |
| N-015 | Ava Reed | 11 | Sofia Martinez | Public Service | On Track | 4 days ago |
| N-016 | Caleb Brooks | 12 | Aisha Thompson | Other | On Track | 7 days ago |
| N-017 | Leila Harris | 9 | Danielle Brooks | Healthcare | Needs Exploration | 10 days ago |
| N-018 | Miles Carter | 10 | Marcus Chen | Technology | Needs Exploration | 13 days ago |
| N-019 | Rina Shah | 11 | Sofia Martinez | Business + Finance | Incomplete Career + Postsecondary Report | 16 days ago |
| N-020 | Darius King | 12 | Aisha Thompson | Creative Industries | No Recent Activity | 46 days ago |

Filter results: Grade 9 shows 5 (N-001, 005, 009, 013, 017); Counselor Marcus Chen shows 5 (N-002, 006, 010, 014, 018); Student Group "Needs support" shows 4 (N-017 to N-020); "Recent activity" shows 19 (all but N-020). Each counselor owns 5 students, all in one grade in this sample: Danielle Brooks = Grade 9, Marcus Chen = Grade 10, Sofia Martinez = Grade 11, Aisha Thompson = Grade 12.

Empty state (e.g. Grade 9 + Marcus Chen): the table body is replaced with the line "No synthetic student profiles match these filters." and the counter reads "Showing 0 of 20 synthetic records".

Student profile modal (click the name): title = name; subline "N-001 · Grade 9 · Danielle Brooks"; X button top right; three stat blocks "Primary Interest", "Support Status", "Last Activity" (large values, e.g. Healthcare / On Track / 2 days ago); footer line "This is a synthetic profile in a representative sample; it is not a live student record." and a "Close" button. There is no deeper student detail page.

(The 20-row sample is a small subset, 20 of 964, while the Overview's Support Status says 784/77/78/25. The sample has 16/2/1/1.)

### 2.3 Career + Postsecondary (`/career-postsecondary`)

Eyebrow "CAREER + POSTSECONDARY". Heading "Student interests, options, and intentions". Subtitle "Explore interests alongside students’ next-step planning." All content is schoolwide and static (not driven by the filter row). Nothing on this screen is clickable except the one link noted. Bars have no hover tooltips.

Layout: row 1 = two cards side by side (Career Interests wide, Emerging Career Interests narrower); row 2 = Postsecondary Intentions (full width); row 3 = Postsecondary Choices (full width, two-column list, not bars); row 4 = a Pathway Discovery stat card.

**Career Interests** (title, subtitle "Primary interest area among enrolled students", (i)). Horizontal progress-bar rows (label | multi-coloured bar on grey track | bold %). Each category has its own colour (purple, blue, green, amber, pink, violet, teal, grey):
Healthcare 22%, Technology 19%, Business + Finance 16%, Creative Industries 12%, Engineering 11%, Skilled Trades 8%, Public Service 7%, Other 5% (sums to 100).
(i): "Each percentage is the share of 964 enrolled students who selected this as their primary career-interest area during the 2026–27 academic year. Categories are mutually exclusive and total 100%; no launch comparison is supplied for this breakdown."
Same 8 interest areas as the Student Sample "Interest Area" filter.

**Emerging Career Interests** (title, subtitle "Signals gaining attention this term", (i)). Five rounded chips (non-interactive): Cybersecurity, Biotechnology, UX Design, Renewable Energy, Sports Management.
(i): "Emerging interests are exploratory signals observed during the selected term. They are not schoolwide percentage metrics and are not compared with a launch baseline."
Inside the same card, a lavender callout: eyebrow "PROGRAMMING CUE", text "Technology interest is outpacing access to related professional exposure.", link-button "Review student progress →" which navigates to `/student-progress` (unfiltered).

**Postsecondary Intentions** (subtitle "Current student intent, separate from future outcomes.", (i)). Four bar rows, all one blue colour: 4-Year College / University 58%, 2-Year College 17%, Trade / Technical Education 13%, Undecided 12% (sums to 100).
(i): "Share of 964 enrolled students who recorded each current postsecondary intention for the 2026–27 academic year. The categories are current stated intentions, not enrollment outcomes; the displayed share is not compared with a launch baseline."

**Postsecondary Choices** (subtitle "Institutions and programs students have saved or explored.", (i)). Plain two-column list, label left and bold % right, reading order is column-by-column interleaved: CUNY Brooklyn College 14%, Baruch College 12%, Hunter College 10%, New York City College of Technology 9%, Stony Brook University 8%, Rutgers University–New Brunswick 7%, New York University 6%. (Does not sum to 100; multi-select.)
(i): "Share of 964 enrolled students who saved or explored each listed postsecondary choice during the 2026–27 academic year. A student can explore multiple institutions, so these percentages do not need to total 100%. This describes exploration, not admission or enrollment."

**Pathway Discovery stat card**: eyebrow "PATHWAY DISCOVERY", big "292", label "NEW CAREERS DISCOVERED", sub "New career pathways explored by students this term.", (i): "A new career discovery is a career pathway a student explored for the first time in the selected term, based on a meaningful exploration action. This is a count, not a percentage."

### 2.4 Counseling Team (`/counseling-team`)

Eyebrow "COUNSELING TEAM". Heading "Counseling Coverage + Capacity". Subtitle "Review student reach, planning completion, and follow-up coverage."

**Summary card** (single wide card, six stats in a row, then a footer):
- Counselors 4
- Students 964
- Average Caseload 241
- Planning Milestone Completion 88% + (i): "Share of enrolled students who completed the required career and postsecondary planning milestones during the selected academic year. Numerator: students completing required milestones. Denominator: 964 enrolled students. Current 88%; launch baseline 59.1%; 2026–27 academic year."
- Students Requiring Follow-Up 38
- Counselor Efficiency +21% + (i): "Estimated relative increase in counselor capacity compared with the prior workflow. This is not a student outcome percentage-point change. Current estimate across 4 counselors: +21%."
- Footer left: "Estimated administrative time returned per counselor: 6.4 hrs/week." Footer right (green): "Follow-up coverage 90%" + (i): "Share of students flagged as needing follow-up who have a follow-up action recorded. Numerator: students requiring follow-up with a documented counselor follow-up. Denominator: 38 students requiring follow-up. Current 90%; 2026–27 academic year."

**Counselor cards** (2x2 grid, one per counselor, each an expandable accordion, chevron-down top right, card lifts slightly on hover). Collapsed: initials avatar, name, caption "Operational coverage view", then three stats (Students, Planning Milestone Completion with (i), Students Requiring Follow-Up). Expanded (accordion: opening one closes any other): adds a tinted box "Documented follow-up coverage <N>%" with (i), a purple progress bar, and the caption "Operational signals support planning; they are not staff rankings."

| Counselor | Students | Planning Milestone Completion | Students Requiring Follow-Up | Documented follow-up coverage (expanded) |
|---|---|---|---|---|
| Danielle Brooks (DB) | 241 | 91% | 8 | 94% |
| Marcus Chen (MC) | 238 | 87% | 11 | 89% |
| Sofia Martinez (SM) | 247 | 86% | 12 | 87% |
| Aisha Thompson (AT) | 238 | 90% | 7 | 95% |

Totals reconcile exactly: students 241+238+247+238 = 964; follow-up 8+11+12+7 = 38; the school 88% is the student-weighted mean of 91/87/86/90 (88.5%); school 90% follow-up is the weighted mean of the four (90.5%). Average caseload = 964/4 = 241.
Counselor milestone (i): "Share of this counselor's assigned students completing the required career and postsecondary planning milestones during 2026–27. Current 91%; school launch baseline 59.1%." (numbers per counselor). Follow-up coverage (i): "Share of 8 assigned students requiring follow-up who have a documented counselor follow-up during 2026–27. This is counselor-specific operational coverage, not a student-outcome comparison." (8 / 11 / 12 / 7 per counselor).
Design intent worth copying: the screen deliberately avoids a ranking or leaderboard (no sort, no colour coding, explicit "not staff rankings" copy). Counselor cards do not click through to a counselor profile.

### 2.5 Reports (`/reports`)

Eyebrow "REPORTS". Heading "School reports". Subtitle "Open a populated report or download a copy of the current synthetic data."

**Four report cards** (2x2 grid; each: title, doc icon top right, one-line description, "Updated ..." caption, divider, then three buttons: purple primary "Open Report →", outlined "Export PDF" (download icon), outlined "Export CSV" (download icon)):
1. Career Exploration Report: "Career exploration and saved pathways across the selected year." Updated today.
2. Postsecondary Planning Report: "Student intentions, saved options, and planning milestones." Updated today.
3. Career Experiences Report: "Simulation, professional, event, and work-based learning activity." Updated yesterday.
4. Student Support Report: "Current student support groups and counselor follow-up coverage." Updated today.

I did NOT click any Export PDF / Export CSV button (they would download files; not authorised). Their filenames and format are therefore unknown. Treat as "downloads a file".

**"Open Report" opens a modal** (not a page): title = report name; subline "Northbridge Academy · 964 enrolled students · 2026–27 academic year"; description sentence + " All figures are synthetic and no live school data is connected."; a 4-column table Metric | Current | Baseline | Change (each metric row has a bold name and a grey definition sentence); footer buttons "Export PDF", "Export CSV", "Close"; X in the corner.

Report modal contents (verbatim values):
- Career Exploration Report: Career Exploration 78% / 59.5% / +18.5 pts; Experiential Career Learning 67% / 46.4% / +20.6 pts; Professional Exposure 54% / 35.3% / +18.7 pts; New Careers Discovered 292 / — / — ("New career pathways explored for the first time during the selected term.").
- Postsecondary Planning Report: Postsecondary Exploration 69% / 51% / +18 pts; Planning Milestone Completion 88% / 59.1% / +28.9 pts; then four intention rows with baseline and change "—": 4-Year College / University 58%, 2-Year College 17%, Trade / Technical Education 13%, Undecided 12% ("Share of enrolled students recording this current intention during the academic year.").
- Career Experiences Report: Professionals Engaged 72, Career Conversations 89, Career Events 7, Work-Based Learning Experiences 36, Career Simulations Completed 340 (all baseline "—"), plus Career Simulation Participation 67% / 46.4% / +20.6 pts ("Share of enrolled students who completed at least one Dreamari career simulation during the selected academic year.").
- Student Support Report: On Track 784, Needs Exploration 77, Incomplete Career + Postsecondary Report 78, No Recent Activity 25 (each: "Count of enrolled students assigned to this mutually exclusive support status."), Students Requiring Follow-Up 38 ("Students identified as requiring a documented counselor follow-up."), Follow-Up Coverage 90% ("Share of students requiring follow-up with a documented counselor follow-up in 2026–27."); baseline and change "—" for all.

**"Impact Since Launch" card** (below the report cards). Title, subtitle "A compact before-and-after view of student outcome metrics.", (i): "Each row compares the current share of 964 enrolled students meeting the metric definition with its launch baseline. The current period is the 2026–27 academic year." Five rows (label | purple progress bar | "baseline → current" right-aligned with the current in bold): Career Exploration 59.5% → 78%; Postsecondary Exploration 51% → 69%; Experiential Career Learning 46.4% → 67%; Professional Exposure 35.3% → 54%; Planning Milestone Completion 59.1% → 88%. Legend underneath: "Launch baseline" (light dot) and "Current" (purple dot). Implementation note: the bar is a grey track with a pale layer at the baseline width underneath and a solid purple layer at the current width on top; because the current layer is always longer, the baseline layer is invisible in practice (the baseline only shows as the number).

### 2.6 Theme

The header has a light/dark segmented toggle. Light is default. Dark mode restyles the whole content area (dark navy cards, same purple accents). The sidebar and header are dark in both modes.

---

## 3. District Leader

Persona shown in header: "DISTRICT LEADER · SYNTHETIC DATA", **Metro Heights Public Schools**, "11 schools · 13,058 students · 39 counselors · 2026–27", tagline "A shared view of student outcomes and counseling capacity across the district." The (i) next to the eyebrow shows the role description: "Multi-school view for superintendents, assistant superintendents, district CCR/CTE leaders, counseling leaders, and other district administrators." Sidebar footer: avatar "MH", "Metro Heights Public ..." (truncated), "District Leader".

Sidebar (in order, 5 items): Overview (`/`), School Performance (`/school-performance`), Student Outcomes (`/student-outcomes`), Counseling Capacity (`/district-capacity`), Reports (`/district-reports`).

Every District screen carries a quiet page eyebrow line above the H1: location pin + "NEW YORK DISTRICT WORKSPACE · PLANNING VIEW · SYNTHETIC DATA" (small caps, grey, dot separators). The H1 on each screen is a plain title (no subtitle): "District overview", "School performance", "Student outcomes", etc. The visual language is calmer and more editorial than the School view: big white page background, thin dividers, serif-free large H1, purple eyebrow labels over card titles ("SCHOOL STATUS / Schools by status"), numeric rank tags "01"-"05", teal / orange / blue / purple progress bars. It reuses the same dark navy header and sidebar, the same light/dark toggle, the same "Data definitions" button and Demo View select.

There is **no filter row** in the District header (the School view's Academic Year / Grade / Counselor / Student Group row does not appear). Filters, where they exist, live inside the screen (School Performance, Student Outcomes).

### 3.0 Data definitions modal (District)

Same structure as the School one, with these differences: subtitle "Metro Heights Public Schools · 13,058 enrolled students · 11 schools · 2026–27 academic year · compared with the launch baseline". The five outcome cards show district values: Career Exploration Current 76% · Launch baseline 58% · +18% points; Postsecondary Exploration 69% · 51% · +18%; Experiential Career Learning 65% · 45% · +20%; Professional Exposure 52% · 34% · +18%; Planning Milestone Completion 61% · 41% · +20% (numerator text: "...completed the required career and postsecondary planning milestones."). Then the same four prose blocks (Counselor capacity, Selected period and scope, Prototype data notice, Potential production data sources). The counselor-capacity block reads "The school’s +20% and district’s +19% values..." (the school number is whichever school was last drilled into, +20% = Metro Arts & Sciences; it was +21% when Northbridge was the school). Key rule stated verbatim: "district percentages use enrollment-weighted school rollups."

### 3.1 District Overview (`/`)

H1 "District overview". Four blocks.

**A. KPI row: six cards** (label, (i) under the label, an icon chip top right (line-chart icon; the Planning milestones card has a target icon; Counselor capacity has a people icon), big number, purple up-arrow delta "↑ +18.0 pts", grey caption "vs. launch baseline"):

| Card | Value | Delta | Baseline | (i) tooltip (verbatim) |
|---|---|---|---|---|
| Career exploration | 76% | ↑ +18.0 pts vs. launch baseline | 58% | "Definition: Action: students who have completed meaningful career exploration. Numerator: students recorded as meeting this measure. Denominator: 13,058 students represented in the district population. 2026–27 shows 76%. Launch baseline: 58%; change: +18.0 percentage points." |
| Postsecondary exploration | 69% | ↑ +18.0 pts | 51% | "...students who have explored postsecondary pathways. ... 2026–27 shows 69%. Launch baseline: 51%; change: +18.0 percentage points." |
| Experiential learning | 65% | ↑ +20.0 pts | 45% | "...students with a verified career-connected experience. ... 65%. Launch baseline: 45%; change: +20.0 percentage points." |
| Professional exposure | 52% | ↑ +18.0 pts | 34% | "...students with structured exposure to professionals. ... 52%. Launch baseline: 34%; change: +18.0 percentage points." |
| Planning milestones | 61% | ↑ +20.0 pts | 41% | "...students who have completed the planning milestone. ... 61%. Launch baseline: 41%; change: +20.0 percentage points." |
| Counselor capacity | 19% | "19% relative" / vs. launch baseline | 0% relative | "Definition: Action: compare counselor-capacity improvement. Numerator: district counselor-capacity index change. Denominator: prior workflow launch baseline. 2026–27 shows 19% relative capacity improvement, not percentage points. Launch baseline: 0% relative improvement." |
Tooltip template for the five outcome cards: "Definition: Action: <what the measure counts>. Numerator: students recorded as meeting this measure. Denominator: 13,058 students represented in the district population. 2026–27 shows X%. Launch baseline: Y%; change: +Z percentage points."
Labels differ from School view in wording only: School view says "Experiential Career Learning", District says "Experiential learning"; School "Planning Milestone Completion", District "Planning milestones". District has a 6th card (Counselor capacity, "19%" with no plus sign) and no sparklines.

**B. "Schools by status" card** (left, eyebrow "SCHOOL STATUS"). Three pills: purple circle "3" + "Above target"; blue circle "5" + "Meeting target"; orange circle "3" + "Support needed". 3+5+3 = 11 schools. Not clickable on this screen (the full filterable list is School Performance).

**C. "Outcome measures" card** (right, eyebrow "STUDENT OUTCOMES"). Five numbered rows "01"-"05" (orange numerals), each: label, small (i), progress bar, bold % and another (i): 01 Career exploration 76% (purple bar), 02 Postsecondary exploration 69% (purple), 03 Experiential learning 65% (purple), 04 Professional exposure 52% (orange bar, the lowest), 05 Planning milestones 61% (blue bar). Both (i)s per row carry the same definition text as the matching KPI card. Footer note: "How to read this" + "Percentages are weighted by district student enrollment, not averaged school scores."
(Same five numbers as the KPI row; this card is the "ranked bar" view of the same data. Rows are in fixed order 01-05, not sorted by value.)

**D. "Top five by career exploration" table** (eyebrow "SCHOOL PERFORMANCE"). Columns: SCHOOL, STATUS, CAREER EXPLORATION, PLANNING MILESTONES, TREND, and an unlabeled last column with an up-right arrow icon button. Sorted by career exploration descending. Each school cell: school name as a link-button with a small up-right arrow, caption "City, NY · N students". Status pill with a coloured dot ("Above Target" purple, "Meeting Target" blue, "Support Needed" orange). Career exploration shows "85%" with (i) and a short teal progress track under it. Planning milestones shows "70%" with (i). Trend = a small rising sparkline (decorative: the same fixed 8-point polyline on every row, class "is-rising") plus a green "+23.0 pts". The TREND value equals the **planning milestones** change since launch, not career exploration (e.g. Metro Arts career +20.1 but trend +23.0).

| School | Status | Career expl. | Planning | Trend |
|---|---|---|---|---|
| Metro Arts & Sciences Academy (Queens, NY · 528) | Above Target | 85% (baseline 65%, +20.1) | 70% (47%, +23.0) | +23.0 pts |
| East River Preparatory Academy (Manhattan, NY · 684) | Above Target | 83% (63%, +19.7) | 69% (46%, +22.6) | +22.6 pts |
| Crescent Academy (Queens, NY · 812) | Meeting Target | 81% (62%, +19.2) | 65% (44%, +21.3) | +21.3 pts |
| Northbridge Academy (Brooklyn, NY · 964) | Above Target | 78% (60%, +18.5) | 88% (59%, +28.9) | +28.9 pts |
| Riverside Innovation High School (Bronx, NY · 1,015) | Meeting Target | 78% (60%, +18.5) | 63% (42%, +20.7) | +20.7 pts |

(i) per cell: "Definition: Action: review <School> career exploration. Numerator: students recorded as meeting the measure. Denominator/population: 528 students at this school in 2026–27. Current rate: 85%. Launch baseline: 65%; change: +20.1 percentage points." and the planning twin ("...planning milestone completion. Numerator: students recorded as complete..."). Sparkline aria-label: "+23.0 percentage point trend vs launch baseline".
**Drilldown behaviour (important):** clicking a school name, or the up-right arrow button at the end of the row (button title/aria-label "Open <School>"), switches the whole app to the **School Leader view of that school** (Demo View select flips to "School Leader", sidebar becomes the 5 School items, header becomes that school). There is no breadcrumb or "Back to district" control in the school view; the only way back is the Demo View select (which then resets to the District overview). The school view keeps working for every school (see 3.6).

No empty or loading states on this screen.

### 3.2 School Performance (`/school-performance`)

Eyebrow line then H1 "School performance". This is the district's main comparison table.

**Filter bar** (one rounded white card): left label "FILTER VIEW" with a sliders icon, then three native selects with small caps labels and a search box on the right:
- ACADEMIC YEAR: 2026–27 (single option).
- GRADE: All grades (value "All"), Grade 9, Grade 10, Grade 11, Grade 12.
- SCHOOL STATUS: All schools, Above target, Meeting target, Support needed.
- Search box "Search by school name" (case-insensitive substring match on the school NAME only: "bridge" returns Northbridge and Kingsbridge, "HIGH" returns 5, "academy" returns 5; a city such as "Queens" returns nothing).
Helper line under the bar with a funnel icon: "Data period: 2026–27."

**"STATUS GROUPS" strip** (soft panel): left "STATUS GROUPS" eyebrow + "11 of 11 schools in view" (updates with filters, e.g. "3 of 11 schools in view"); right three pills 3 Above target / 5 Meeting target / 3 Support needed (counts reflect the filtered set).

**Table** (horizontal scroll inside the card; TREND and the last arrow column sit off to the right at narrow widths). Columns: SCHOOL, STATUS, CAREER EXPLORATION, POSTSECONDARY, EXPERIENTIAL, PLANNING, TREND. Each metric cell shows a big % with an (i) icon and, below it, a purple "+X.X pts vs launch baseline" line. Header cells are sort buttons (SCHOOL, STATUS and the four metrics; TREND is not sortable). The active sort column shows a down arrow; inactive columns show a "···" icon. Default sort = PLANNING (high to low). Observed sort behaviour: clicking a header sorts that column in a fixed direction (metrics high to low; SCHOOL ends up Z to A; STATUS puts "Support needed" first, then Meeting, then Above, i.e. most-in-need first). Repeated clicks on the same header did NOT flip the direction in my tests (single-direction sort), so treat "toggle asc/desc" as unconfirmed.
School name = link-button with an up-right arrow icon; clicking opens that school's School Leader view (same drilldown as the Overview). The row itself is not clickable.

**All 11 schools (All grades, default view; values are "current, +delta vs launch baseline"):**

| School | City · students | Status | Career | Postsecondary | Experiential | Planning | Trend (= planning delta) |
|---|---|---|---|---|---|---|---|
| Northbridge Academy | Brooklyn · 964 | Above Target | 78% +18.5 | 69% +18.0 | 67% +20.6 | 88% +28.9 | +28.9 |
| Metro Arts & Sciences Academy | Queens · 528 | Above Target | 85% +20.1 | 80% +20.9 | 74% +22.8 | 70% +23.0 | +23.0 |
| East River Preparatory Academy | Manhattan · 684 | Above Target | 83% +19.7 | 76% +19.8 | 73% +22.5 | 69% +22.6 | +22.6 |
| Crescent Academy | Queens · 812 | Meeting Target | 81% +19.2 | 74% +19.3 | 70% +21.5 | 65% +21.3 | +21.3 |
| Riverside Innovation High School | Bronx · 1,015 | Meeting Target | 78% +18.5 | 71% +18.5 | 68% +20.9 | 63% +20.7 | +20.7 |
| Central Point High School | Manhattan · 1,128 | Meeting Target | 77% +18.2 | 70% +18.3 | 67% +20.6 | 62% +20.3 | +20.3 |
| Liberty Grove Academy | Staten Island · 1,244 | Meeting Target | 76% +18.0 | 70% +18.3 | 66% +20.3 | 61% +20.0 | +20.0 |
| Summit Heights High School | Brooklyn · 1,390 | Meeting Target | 76% +18.0 | 69% +18.0 | 66% +20.3 | 60% +19.7 | +19.7 |
| Kingsbridge Preparatory | Bronx · 1,535 | Support Needed | 73% +17.3 | 68% +17.7 | 63% +19.4 | 57% +18.7 | +18.7 |
| Harborview High School | Brooklyn · 1,748 | Support Needed | 71% +16.8 | 66% +17.2 | 60% +18.5 | 53% +17.4 | +17.4 |
| Gateway Technical High School | Queens · 2,010 | Support Needed | 73% +17.4 | 63% +16.4 | 59% +18.1 | 50% +16.6 | +16.6 |

Student counts sum to exactly **13,058**. Boroughs used: Brooklyn (3), Queens (3), Manhattan (2), Bronx (2), Staten Island (1). Enrollment-weighted career exploration = 75.95%, which is the 76% shown, so district numbers are enrollment-weighted school rollups (not simple averages and not a sum of counts).
Status rule (inferred, not stated): status tracks the planning milestone completion value: 69%+ = Above target (Northbridge 88, Metro 70, East River 69), 60 to 65% = Meeting target, below 60% = Support needed (57, 53, 50). Summit Heights (60%) is still "Meeting". Career exploration alone does not explain it (Riverside 78% is Meeting while Northbridge 78% is Above).

**Grade filter behaviour.** Selecting a grade keeps all 11 rows and the statuses/deltas, but (a) the student count per school becomes the grade's share (about one quarter, e.g. Northbridge 964 -> 241, Metro Arts 528 -> 132, Gateway 2,010 -> 503 / 503 / 502 / 502; small rounding differences between grades) and (b) every current % is shifted by a fixed grade offset applied to all schools equally (the tooltip says "Grade view applies the district all grades offset from districtGradeOutcomes"):

| Grade | Career | Postsecondary | Experiential | Planning |
|---|---|---|---|---|
| Grade 9 | -5 pts | -7 | -8 | -14 |
| Grade 10 | -2 | -3 | -3 | -6 |
| Grade 11 | +3 | +3 | +3 | +5 |
| Grade 12 | +4 | +7 | +8 | +15 (capped at 100%: Northbridge 88+15 shows 100%) |

Deltas "+X pts vs launch baseline" and statuses do not change with grade. Example Grade 9 Northbridge: 241 students, 73 / 62 / 59 / 74.
Cell (i) tooltip: "Definition: Action: review Northbridge Academy career exploration for all grades. Numerator: students recorded as meeting the measure. Denominator/population: 964 students at this school in 2026–27. Current rate: 78%. Launch baseline comparison: 60% and +18.5 percentage points for the school measure. Grade view applies the district all grades offset from districtGradeOutcomes." (the phrase "for all grades" becomes the grade name when filtered). Note this tooltip text leaks a developer identifier ("districtGradeOutcomes"); do not copy it.

**Empty state** (any filter/search with no match): table body shows "No schools match this view." / "Try clearing the search or changing a filter." with a "Clear filters" button; the strip reads "0 of 11 schools in view" with all three pills at 0.

### 3.3 Student Outcomes (`/student-outcomes`)

H1 "Student outcomes". One long scrolling page of six sections, all district-wide.

**A. "Compare by school or grade"** (eyebrow "OUTCOME COMPARISONS"). One card:
- Segmented toggle "By school" (default) | "By grade".
- Select "METRIC" with five options: Career exploration (default), Postsecondary exploration, Experiential learning, Professional exposure, Planning milestones.
- Top-right "DISTRICT ROLLUP" block: big district %, purple "+18.0 pts vs launch baseline", with (i) icons (rollup tooltip = the same district definition as the Overview KPI).
- Below: ranked horizontal bars. By school: one bar per school (11), sorted high to low for the selected metric, each row: school name, purple bar, bold % with (i), and a grey "N students" caption on the right. By grade: four bars Grade 9..12 with 3,266 / 3,266 / 3,264 / 3,262 students.
- Footer line: "Definition <metric definition>. Values are synthetic planning measures, not live student records. Launch baseline is X% for this district rollup." e.g. "Definition Students who have completed meaningful career exploration. Values are synthetic planning measures, not live student records. Launch baseline is 58% for this district rollup."
- Row (i): "Definition: Action: review Metro Arts & Sciences Academy career exploration for all grades. ... Current rate: 85%. Launch baseline comparison: 65% and +20.1 percentage points for the school measure. Grade view applies the district all grades offset from districtGradeOutcomes."
- Not clickable bars (no drilldown to a school from here).

By-school values per metric (rollup in brackets; schools in the order the bars appear):
- Career exploration [76%, +18.0, baseline 58%]: Metro Arts 85, East River 83, Crescent 81, Northbridge 78, Riverside 78, Central Point 77, Liberty Grove 76, Summit Heights 76, Gateway 73, Kingsbridge 73, Harborview 71.
- Postsecondary exploration [69%, +18.0, baseline 51%]: Metro Arts 80, East River 76, Crescent 74, Riverside 71, Central Point 70, Liberty Grove 70, Northbridge 69, Summit Heights 69, Kingsbridge 68, Harborview 66, Gateway 63.
- Experiential learning [65%, +20.0, baseline 45%]: Metro Arts 74, East River 73, Crescent 70, Riverside 68, Northbridge 67, Central Point 67, Liberty Grove 66, Summit Heights 66, Kingsbridge 63, Harborview 60, Gateway 59.
- Professional exposure [52%, +18.0, baseline 34%]: Metro Arts 60, East River 60, Crescent 57, Riverside 55, Northbridge 54, Central Point 54, Liberty Grove 53, Summit Heights 53, Kingsbridge 50, Harborview 47, Gateway 46.
- Planning milestones [61%, +20.0, baseline 41%]: Northbridge 88, Metro Arts 70, East River 69, Crescent 65, Riverside 63, Central Point 62, Liberty Grove 61, Summit Heights 60, Kingsbridge 57, Harborview 53, Gateway 50.
By-grade values (grade 9 / 10 / 11 / 12): Career 71 / 74 / 79 / 80; Postsecondary 62 / 66 / 72 / 76; Experiential 57 / 62 / 68 / 73; Professional exposure 43 / 49 / 55 / 61; Planning 47 / 55 / 66 / 76 (district rollup shown on top stays 76 / 69 / 65 / 52 / 61).
(Definition sentences per metric: Career "Students who have completed meaningful career exploration."; Postsecondary "Students who have explored postsecondary pathways."; Experiential "Students with a verified career-connected experience."; Professional "Students with structured exposure to professionals."; Planning "Students who have completed the planning milestone.")

**B. "Career interests"** card (subtitle "Share of student-selected career interest areas."): rows with (i), bar, %: Technology 21%, Healthcare 19%, Business + Finance 17%, Engineering 13%, Creative Industries 11%, Skilled Trades 8%, Public Service 6%, Other 5% (=100). Note these differ from Northbridge's own breakdown (Healthcare 22 / Technology 19 / ...), i.e. district has Technology first. (i) text: "Definition: Action: review technology. Numerator: students in the technology category, shown as 21% of responses. Denominator/population: 13,058 students represented in the 2026–27 synthetic planning view. This is a distribution share, not a completion rate. Launch baseline value: not supplied for this category in administrativeData.ts, so no change is inferred." (identifier leak again; same template for every distribution row, with the category and % swapped).

**C. "Postsecondary intentions"** (subtitle "Current intended next step across participating students."): 4-Year College / University 56%, 2-Year College 18%, Trade / Technical Education 14%, Undecided 12% (=100).

**D. "Postsecondary choices"** (subtitle "Share of recorded named pathways and institutions."): CUNY colleges 28%, SUNY institutions 21%, New York City College of Technology 12%, Stony Brook University 10%, Rutgers University 8%, New York University 7%, Regional trade / technical programs 14% (=100, so here they sum to 100, unlike the school view's multi-select 14/12/10/9/8/7/6). Note the ordering is not strictly descending (Regional trade 14% is last).

**E. "Emerging career interests"** (eyebrow "EMERGING INTERESTS"): chips Cybersecurity, Biotechnology, UX Design, Renewable Energy, Sports Management (same as school view). Note: "Emerging interests are qualitative signals; they are not ranked or interpreted as enrollment forecasts."

**F. "Participation totals"** (eyebrow "CAREER EXPERIENCES"): five counts each with (i): Professionals Engaged 634 ("Unique verified professionals participating in Dreamari or related career experiences."), Career Conversations 792 ("Recorded structured student-professional interactions."), Career Events 61 ("Career exposure events made available to participating students."), Work-Based Learning Experiences 318 ("Verified career-connected experiences recorded during the selected period."), Career Simulations Completed 3,420 ("Completed Dreamari career simulation experiences.").
(These are NOT the sum of the school-level counts: Northbridge alone shows 72 / 89 / 7 / 36 / 340.)

**G. "Milestone completion"** (eyebrow "PLANNING MILESTONE COMPLETION", subtitle "Share of students completing each named planning artifact in 2026–27."): five numbered rows 01-05 sorted by value? Order shown: 01 Top Three 79%, 02 Career + Postsecondary Report 63%, 03 My Plan 66%, 04 Resume 57%, 05 Postsecondary Shortlist 54% (fixed order, not sorted). Each has (i): "Definition: Action: review completion of the Top Three planning artifact. Numerator: students recorded with Top Three complete. Denominator/population: 13,058 students represented in 2026–27. Current rate: 79%. Launch baseline value: not supplied for this milestone in administrativeData.ts, so no change is inferred." Note this is a **different set of 5 artifacts** from the School view's Student Progress KPIs (Report 62 / Shortlist 61 / Top Three 71 / Resume 54), and includes "My Plan" which the school view lacks. Also the district numbers do not equal the school's (Top Three 79 vs 71).

### 3.4 Counseling Capacity (`/district-capacity`)

H1 "Counseling capacity". No filters, no tabs.

**Hero card "DISTRICT COVERAGE"** (lavender panel). Left: big **335**, purple caption "students per counselor on average", grey line "Across 39 counselors serving 13,058 students." (13,058 / 39 = 334.8). Right, three stat blocks separated by thin dividers:
- "Students requiring follow-up": **284**, caption "identified across schools".
- "Follow-up coverage" + (i): **88%**, caption "district weighted coverage". (i): "Definition: Follow-up coverage is the share of students flagged for follow-up who have an action recorded. Current district coverage: 88% of 284 students."
- "Counselor capacity improvement" + (i): **+19%**, caption "relative change vs prior workflow". (i): "Definition: Action: compare counselor-capacity improvement. Numerator: district counselor-capacity index change. Denominator: prior workflow launch baseline. 2026–27 shows 19% relative capacity improvement, not percentage points. Launch baseline: 0% relative improvement."

**"Staffing and follow-up by school" table** (eyebrow "SCHOOL COVERAGE", subtitle "Open a school to view its counseling team."). Columns: SCHOOL (name link-button with up-right arrow + city caption), COUNSELORS, STUDENTS, STUDENTS / COUNSELOR (number + small coloured label "within range" in purple or "higher load" in orange), FOLLOW-UP NEED (number + "students"), COVERAGE (small progress bar + %, + (i); bar is teal for every school except Kingsbridge (86%, the lowest) which is coral, so the colour likely flips below ~87%), and a last column with an "Open view ↗" link-button. Rows are in a fixed order, sorted by follow-up need descending. Headers are NOT sortable here. No search.

| School | City | Counselors | Students | Students / counselor | Load label | Follow-up need | Coverage |
|---|---|---|---|---|---|---|---|
| Harborview High School | Brooklyn | 6 | 1,748 | 291 | within range | 42 | 87% |
| Northbridge Academy | Brooklyn | 4 | 964 | 241 | within range | 38 | 90% |
| Kingsbridge Preparatory | Bronx | 4 | 1,535 | 384 | higher load | 35 | 86% |
| Summit Heights High School | Brooklyn | 4 | 1,390 | 348 | within range | 31 | 88% |
| Gateway Technical High School | Queens | 6 | 2,010 | 335 | within range | 29 | 90% |
| Liberty Grove Academy | Staten Island | 4 | 1,244 | 311 | within range | 27 | 88% |
| Central Point High School | Manhattan | 3 | 1,128 | 376 | higher load | 25 | 87% |
| Riverside Innovation High School | Bronx | 3 | 1,015 | 338 | within range | 21 | 88% |
| Crescent Academy | Queens | 2 | 812 | 406 | higher load | 16 | 89% |
| East River Preparatory Academy | Manhattan | 2 | 684 | 342 | within range | 12 | 87% |
| Metro Arts & Sciences Academy | Queens | 1 | 528 | 528 | higher load | 8 | 88% |

Reconciliation: counselors sum to exactly 39; students to 13,058; follow-up need to 284; the district 88% is the follow-up-need-weighted mean of the school coverages (88.0%). "higher load" appears to start above roughly 350 students per counselor (348 is still "within range"; 376 and 384 are "higher load") (threshold inferred, not stated). Per-school (i): "Definition: Action: review Harborview High School follow-up coverage. Numerator: students with a recorded follow-up action. Denominator/population: 42 students requiring follow-up at this school. 2026–27 coverage is 87%. Launch baseline value: not supplied for school follow-up coverage in administrativeData.ts, so no change is inferred." (again leaks a file name).
Drilldowns: clicking the school name or "Open view" switches to the **School Leader view of that school, landing directly on its Counseling Team screen** (e.g. Harborview shows "Counselors 6 · Students 1,748 · Average Caseload 291 · Planning Milestone Completion 53% · Students Requiring Follow-Up 42 · Counselor Efficiency +18% · 6.1 hrs/week · Follow-up coverage 87%" and six generic cards "Counselor A" to "Counselor F" with 292/292/291/291/291/291 students, milestone 51/53/55/51/53/55% and 7 follow-ups each). The school name link in this table goes to the same place as "Open view" (tested for both: the app lands on the school's Counseling Team screen). The load label colours: "within range" is green/purple (positive), "higher load" is orange/red (negative).
Footer note under the table: "Capacity context" + "Student-to-counselor ratios provide staffing context; they do not measure service quality."

### 3.5 Reports (`/district-reports`)

H1 "Reports". Section title "Available reports", subtitle "Open a report for details or export the school comparison." Two header-level buttons on the right: "Export school comparison CSV" and "Export school comparison PDF" (not clicked: they download files).

Four report cards (2x2 or 4 across; each: small-caps type tag, title, one-line description, grey "Prepared for 2026–27 planning", an "Open report" button):
1. LEADERSHIP BRIEF / **District readiness pulse**: "A concise read of the six district measures, status groups, and planning priorities."
2. SCHOOL COMPARISON / **School performance comparison**: "All 11 schools with current measures, change against baseline, and status context."
3. OUTCOME REVIEW / **Student outcomes & pathways**: "Career interests, postsecondary intentions, experiences, and milestone completion."
4. CAPACITY REVIEW / **Counseling capacity review**: "School-level staffing, caseload context, follow-up need, and coverage."

"Open report" opens a modal (not a page): eyebrow (type tag), title, description + " This report is populated from the 2026–27 synthetic planning view.", a three-stat summary strip (identical in all four): "Students represented 13,058" (no (i)), "District rollup 61%" (with (i) = the planning-milestone definition), "School statuses 3 / 5 / 3" caption "above · meeting · support"; then a "Report rows" table; footer buttons "Export this CSV" and "Download this PDF"; top-right "Close report" button. Column headers carry (i) tooltips.

Report tables:
- District readiness pulse: columns DISTRICT READINESS PULSE (measure), 2026–27, LAUNCH BASELINE, CHANGE, MEANING. Rows: Career exploration 76% / 58% / +18.0 pts / "Students who have completed meaningful career exploration."; Postsecondary exploration 69% / 51% / +18.0 pts; Experiential learning 65% / 45% / +20.0 pts; Professional exposure 52% / 34% / +18.0 pts; Planning milestones 61% / 41% / +20.0 pts; Counselor capacity 19% / 0% / "+19% relative" / "Relative capacity improvement, not percentage points"; Status groups "3 above / 5 meeting / 3 support" / "School status count". (Header tooltip: "Definition: Action: read the district readiness measure in the 2026–27 report. Numerator: students recorded as meeting the named measure. Denominator/population: 13,058 students represented. Current values are compared with the launch baseline shown in the adjacent column; counselor capacity is relative improvement, not percentage points.")
- School performance comparison: columns SCHOOL, STATUS, STUDENTS, CAREER EXPLORATION, PLANNING COMPLETION, CHANGE VS LAUNCH; 11 rows in student-count ascending order (Metro Arts 528 first, Gateway 2,010 last), values as in 3.2 (all-grades): e.g. Metro Arts & Sciences Academy / Above Target / 528 / 85% / 70% / +23.0 pts; Northbridge Academy / Above Target / 964 / 78% / 88% / +28.9 pts; Gateway Technical High School / Support Needed / 2,010 / 73% / 50% / +16.6 pts.
- Student outcomes & pathways: columns SECTION, MEASURE, VALUE, DEFINITION; 28 rows in sections Career interest (8: Technology 21 ... Other 5; definition "Share of recorded student-selected interests"), Postsecondary choice (7: CUNY colleges 28 ... Regional trade / technical programs 14; "Share of recorded named pathways and institutions explored"), Postsecondary intention (4: 56 / 18 / 14 / 12; "Share of recorded intended next steps"), Planning milestone (5: Top Three 79, Career + Postsecondary Report 63, My Plan 66, Resume 57, Postsecondary Shortlist 54; "Share with the named artifact complete"), Career experience (5 counts: 634, 792, 61, 318, 3420 (no thousands separator in this table); definitions as in 3.3-F). The VALUE header tooltip explains percentage rows vs count rows.
- Counseling capacity review: columns SCHOOL, COUNSELORS, STUDENTS, STUDENTS / COUNSELOR, FOLLOW-UP NEED, FOLLOW-UP COVERAGE; 11 rows in student-count ascending order with the same values as 3.4 (Metro Arts 1 / 528 / 528 / 8 / 88% ... Gateway 6 / 2,010 / 335 / 29 / 90%).

I did NOT click any export / download button. The header "Export school comparison" buttons are scoped to the school-comparison table specifically (not to the whole district).

### 3.6 What a drilled-in school looks like (School Leader view for any of the 11 schools)

Opening any school from the District screens re-uses the five School Leader screens with that school's data. The header, headline numbers, Impact Over Time series, Support Status counts, Counseling Coverage, Counseling Team cards and the Reports "Impact Since Launch" bars are school-specific; most other content is a shared template. What I verified for Metro Arts & Sciences (528 students) and Harborview (1,748):

| Item | Northbridge (964) | Metro Arts (528) | Harborview (1,748) |
|---|---|---|---|
| Career / Postsecondary / Experiential / Professional exposure | 78 / 69 / 67 / 54 | 85 / 80 / 74 / 60 | 71 / 66 / 60 / 47 |
| Deltas since launch (same four) | +18.5 / +18 / +20.6 / +18.7 | +20.1 / +20.9 / +22.8 / +20.8 | +16.8 / +17.2 / +18.5 / +16.3 |
| Counselor efficiency | +21% | +20% | +18% |
| Admin hrs returned per counselor | 6.4 | 6.3 | 6.1 |
| Support status (on track / needs exploration / incomplete report / no activity) | 784 / 77 / 78 / 25 | 429 / 42 / 43 / 14 | 1419 / 140 / 142 / 47 |
| Counselors | 4 (Danielle Brooks, Marcus Chen, Sofia Martinez, Aisha Thompson) | 1 ("Counselor A") | 6 ("Counselor A" to "Counselor F") |
| Planning milestone completion | 88% | 70% | 53% |
| Students requiring follow-up / coverage | 38 / 90% | 8 / 88% | 42 / 87% |

- Only Northbridge has named counselors; every other school uses "Counselor A, B, C..." (count from the capacity table). Counselor filter options in the header follow the same list ("All counselors, Counselor A").
- Impact Over Time curves share one easing shape across schools: the value at each month is `launch + delta x [0, 0, 0.07, 0.19, 0.36, 0.57, 0.77, 0.92, 1.0]` for Launch, Sep ... Apr (e.g. Harborview career 54.2, 54.2, 55.4, 57.4, 60.2, 63.8, 67.1, 69.7, 71.0).
- Support status split is the same percentages for every school (about 81.3% on track, 8% needs exploration, 8.1% incomplete report, 2.6% no recent activity).
- The Student Progress screen is mostly a **shared template**: the milestone KPIs (62 / 61 / 71 / 54) and the five Career Experiences counts (72 / 89 / 7 / 36 / 340) are identical for every school (not tied to the school's size). Only Follow-Up Coverage changes (Metro Arts 88%). The 20-row sample is the same 20 synthetic students with the id prefix per school (Northbridge "N-001..N-020", Metro Arts "MA-001..MA-020") and the counselor column "Counselor A".
- The Career + Postsecondary screen is identical for every school (same interest %, same colleges incl. CUNY Brooklyn College, same 292 new careers), even for a school in Staten Island or the Bronx.
- The Data definitions modal and the (i) tooltips pick up the school's own numbers (e.g. "Population: 528 enrolled students. 85% currently, compared with 64.9% at launch").
- Reports "Impact Since Launch" per school (Metro Arts): Career 64.9% -> 85%, Postsecondary 59.1% -> 80%, Experiential 51.2% -> 74%, Professional exposure 39.2% -> 60%, Planning milestones 47% -> 70%.
- Kingsbridge Preparatory (1,535 students, checked once): career 73%, postsecondary 68%, experiential 63%, professional exposure 50% with deltas +17.3 / +17.7 / +19.4 / +17.3, counselor efficiency +17%.
- Open question: Northbridge's planning milestone number is 88% in its school view but district Student Outcomes lists Top Three 79%, Report 63%, My Plan 66%, Resume 57%, Shortlist 54%, which cannot average to 61% by any obvious rule. The district "planning milestones" is a composite not shown elsewhere.

---

## 4. Nonprofit Leader (brief)

Persona: "NONPROFIT LEADER · DEMO", organisation **FuturePath Alliance** ("4 cities · 18 partner schools · 3,860 youth served"; cities New York, Chicago, Detroit, Los Angeles). Description (Demo View option): "Organization-wide impact view for executives, program leaders, career-readiness teams, funders/reporting teams, and other leaders overseeing youth programs."

Shell: header shows only "NONPROFIT LEADER · DEMO / FuturePath Alliance" on the left and the Demo View select on the right (no theme toggle, no "Data definitions"). Sidebar has **one item only: Overview** (`/`), plus a helper paragraph: "Explore the cards, filters, and drilldowns in this nonprofit leader view. Counselor tools remain available in the Counselor demo view." Sidebar footer "FP / FuturePath Alliance / Nonprofit Leader".

The single Overview screen, top to bottom (one-line purpose each):
1. Header block: breadcrumb "FuturePath Alliance", eyebrow "NONPROFIT LEADER VIEW", H1 "FuturePath Alliance", sub "4 cities · 18 partner schools · 3,860 youth served", four city chips (pin icons), and an "Export Report" button (not clicked: download). Line "Headline scope: organization-wide. Cohort, grade, cluster, and period controls filter only the synthetic youth sample, not published aggregate metrics." (changes to "Headline scope: College Access program." etc.).
2. Seven KPI cards: Active Participants 82%, Career Exploration Participation 79%, Play / Simulations Completed 2,946, Professional Connections 1,284, Career Experiences 736, Opportunities Accessed 428, Placements 162 (each with (i) and an icon). They re-label when a program is picked (e.g. College Access: Active Participants 84%, Career Exploration Participation 78%, Youth Served 1,180, Professional Exposure 44%, Experience Participation 31%, Opportunities Accessed 108, Outcome Progress 74%).
3. "Impact filters" (subtitle "Program and location switch reported aggregate scopes; cohort, grade, cluster, and period filter the synthetic youth sample only."): six custom dropdowns: All programs / All locations / All cohorts / All grades / All career clusters / This year.
4. "Youth Impact Journey" (subtitle "Organization-wide reach through opportunity. Rate-derived counts in scoped views are illustrative."): an 8-node connected funnel, Reach 3860 (breadth), Engage 3165 (participation), Explore 3049 (exposure), Immerse 2946 (experience), Connect 1284 (progression), Experience 736 (progression), Opportunity 428 (progression), Placement 162 (progression); note "Stages can overlap. Students may enter at different points; this is not a mandatory or linear journey."
5. "Impact at a Glance" (subtitle "Reported dimensions and data sources for the current aggregate scope."): rows with a data-source tag: Career discovery breadth 3,049 (Dreamari), Simulation participation 2,946 (Dreamari), Professional exposure 1,284 (Dreamari + Manual Verification), Experience participation 736 (Manual Verification), Opportunity progression 428 (Partner reporting (sample)), Placements 162 (Partner reporting (sample)).
6. "Program Performance" (subtitle "Select a program to focus the organization view and open its drilldown. Rows remain separate aggregate data even when a city is selected."): table Program | Youth served | Engagement | Exploration | Professional exposure | Experiences | Opportunities | Outcome progress | Trend: College Access 1,180 / 84% / 78% / 44% / 31% / 108 / 74% / +5.1 pts; Career Discovery 924 / 87% / 91% / 51% / 43% / 126 / 82% / +7.4; Professional Mentorship 612 / 79% / 76% / 88% / 48% / 82 / 77% / +3.6; Work-Based Learning 534 / 76% / 69% / 64% / 82% / 74 / 71% / +4.8; Summer Career Accelerator 610 / 81% / 83% / 59% / 67% / 38 / 79% / +9.2. Clicking a row re-scopes the whole page to that program (KPIs, journey, glance).
7. "Location Performance" (subtitle "Compare city-level reach, access, and outcomes. Select up to three locations.", counter "0/3 selected"): four city cards (New York 1,240 youth, Engagement 84%, Exploration 81%, Connections 438, Experiences 242, Opportunities 148, Placements 61; Chicago 986, 81%, 78%, 318, 190, 109, 42; Detroit 742, 79%, 75%, 226, 142, 79, 31; Los Angeles 892, 83%, 82%, 302, 162, 92, 28), each with a "Compare" toggle (max 3) and an "Open location drilldown" button.
8. "PARTNER NETWORK DRILLDOWN / Choose a location": a stepped drilldown "Organization → Location → Program → Partner School / Cohort → Student" (1 Select location, 3 Select a partner school / cohort), then a "Filtered youth sample" of synthetic student cards (8 records by default, e.g. Ari Bennett · New York · Career Discovery / Oakline STEM Academy · Grade 11 · Technology). Footer: "Data sources in this demo: Dreamari event data, partner-reported outcomes, and Manual Verification. Placement is shown as applicable outcome context, not as a universal requirement for every youth pathway."
No separate Data definitions modal exists for this role. This role is not requested for build in this pass.

---

## 5. Shared with Counselor vs new or different, per screen

Nothing in either leader role is a straight reuse of a Counselor screen. What is shared is vocabulary and a few interaction patterns; the layouts and data models are new. (Counselor screens sampled for comparison: Overview, Student Progress at `/reports`, Career + College Insights, My Impact, Platform Engagement.)

### School Leader

| Screen | Closest Counselor screen | Shared | New or different |
|---|---|---|---|
| Overview | Overview (`/`) | Welcome-style status summary, "on track / needs attention / at risk" concept, support status colours (green / amber / red), grade-level thinking | Counselor Overview = three donuts (Student Status 86% on track 103/11/6, Postsecondary Plans 79 vs 41, Career Pathways 120 students) + two grouped bar charts by grade. School Overview = 5 outcome KPI cards with launch deltas, a switchable 5-metric trend line chart with period select, 4-category Support Status bars (784/77/78/25) and a Counseling Coverage block. Support taxonomy differs: Counselor has 3 states, School has 4 mutually exclusive categories. Everything is a % of enrolled students vs a launch baseline. |
| Student Progress | Students + Milestone Tracker + Student Progress (`/reports`) | Student status vocabulary; interest areas; a student table with names | Counselor tools are per-student and actionable (review queue, approve milestones). School screen is a 20-record representative sample with a profile modal, five milestone % KPIs, five "career experience" counts, no approvals. Status filter pre-set by deep link from Overview. |
| Career + Postsecondary | Career + College Insights | Career interest areas, saved colleges, "emerging" and recommendation idea | Counselor page = "Dreamari Recommendations for You" action cards plus Top 10 Saved Careers (chart/list). School page = pure distribution (8 interest areas, 4 intentions, 7 institutions, emerging chips, one "programming cue" nudge, 292 new careers). |
| Counseling Team | My Impact + Platform Engagement | Caseload, on-track, response-style accountability concepts | Entirely new: team-level coverage (4 counselors, caseload 241, follow-up 38 at 90%), expandable per-counselor cards with explicit "not staff rankings" copy. Counselor "My Impact" is a self-view ("Sarah Chen", caseload 120) with a "Generate Principal / District Report" button that this role's Reports is the receiving end of. |
| Reports | Student Progress (`/reports`, report type picker + CSV/PDF) | CSV + PDF export idea | School Reports = 4 pre-built report cards each with Open (modal table) / Export PDF / Export CSV, plus an "Impact Since Launch" before/after bar card. No generator filters. |

### District Leader

| Screen | Closest Counselor screen | Shared | New or different |
|---|---|---|---|
| Overview | Overview | KPI-first landing page | New: 6 KPI cards, school-status counts, ranked outcome bars, "Top five by career exploration" table with drilldown. |
| School Performance | none (nearest: Counselor "Students" list) | table + filter + search pattern, status pills | New: 11-school comparison table with grade filter (offsets), status filter, school-name search, single-direction column sort, empty state, drill into a school. |
| Student Outcomes | Career + College Insights, My Impact | interest and college distributions | New: By school / By grade comparison with metric select; district-level distributions (Technology first, CUNY/SUNY groupings), participation totals, milestone completion with a "My Plan" artifact. |
| Counseling Capacity | My Impact, Platform Engagement | caseload concept | New: students per counselor (335) with "within range / higher load" labels per school, follow-up need and coverage by school, "Open view" into a school's Counseling Team. |
| Reports | Student Progress (`/reports`) | CSV/PDF exports | New: 4 report modals (readiness pulse, school comparison, outcomes & pathways, capacity review) with shared 3-stat strip, plus two header export buttons scoped to the school comparison. |

### Reusable pieces across the two leader roles (build once)

1. Role header block + (i) role description + Data definitions button + theme toggle + Demo View select.
2. "Data definitions" modal (outcome cards with numerator/denominator/current/baseline/delta; four prose blocks) fed by the active scope (school or district).
3. KPI card with (i) tooltip carrying numerator/denominator/population/current/baseline text; `+X pts since launch` delta convention; relative-% exception for counselor capacity.
4. Status pill family: Above Target / Meeting Target / Support Needed (District) and On Track / Needs Exploration / Incomplete Career + Postsecondary Report / No Recent Activity (School); amber vs green pill styles.
5. Horizontal ranked-bar row (label | bar | % | optional (i)); used in 8+ places in both roles.
6. Report modal with table, export buttons and Close.
7. Table + native select filter bar + empty state ("No schools match this view." / "No synthetic student profiles match these filters.").

---

## 6. Open questions and ambiguities

1. **Exports.** I did not click any "Export PDF / CSV / Report" control (they download files). The file names, columns and whether PDF is a print-to-PDF or a generated file are unknown. Only the on-screen report tables are known.
2. **Drill from District to School has no way back.** After opening a school the app is in School Leader mode with no breadcrumb or "Back to district". Is that intentional? A production build probably needs a visible back path or a school switcher for district users.
3. **School switcher.** School Leader view has no school picker; the school is whichever was last drilled into from District (default Northbridge). How a real school leader with one school, or a district admin with many, picks a school is unspecified.
4. **Status rule for schools.** Above / Meeting / Support needed is not documented in the UI. Observed values fit a rule on planning milestone completion (>= 69 Above, 60 to 65 Meeting, < 60 Support), but it could equally be a composite. Needs a spec (and who sets targets: the Counselor view mentions a "district target: 80%" for senior plan compliance, so district-set targets exist as a concept).
5. **"Higher load" threshold** for students per counselor appears to sit between 348 (within range) and 376 (higher load), probably ~350. Not stated; also whether the coverage bar turns coral below 87% is inferred from one data point (Kingsbridge 86%).
6. **District "planning milestones" 61%** (and each school's) is a composite that is not reconcilable with the five artifact percentages on Student Outcomes (79 / 63 / 66 / 57 / 54) nor with the School Student Progress KPIs (62 / 61 / 71 / 54). Also the district artifact list includes "My Plan" while the school list does not. Which artifacts define "required planning milestones"?
7. **School Student Progress KPIs and career-experience counts are identical for every school** (62 / 61 / 71 / 54 and 72 / 89 / 7 / 36 / 340 even for a 528-student and a 2,010-student school), and the district total counts (634 / 792 / 61 / 318 / 3,420) are not their sum. Treat as placeholder data; real data must be per school and rolled up.
8. **Career + Postsecondary is the same for every school** (even the named NYC colleges, e.g. CUNY Brooklyn College for a Staten Island school) and differs from the district distributions (Technology 21% vs Healthcare 22% at school level; CUNY/SUNY groupings at district level vs named institutions at school level). Whether the school view should be school-specific is a spec call.
9. **Counselor efficiency +21% / +19%.** District value is +19%; weighting unknown (only 4 of 11 schools sampled: Northbridge +21, Metro Arts +20, Harborview +18, Kingsbridge +17). "6.4 hrs/week returned per counselor" is only shown per school (6.4, 6.3, 6.1 sampled); no district hours figure.
10. **Sorting.** District School Performance column headers act as single-direction sort buttons (metrics high to low; name Z to A; status "Support needed" first); repeated clicks did not reverse in my tests, and one set of real mouse clicks did not visibly change the order. Treat asc/desc toggle and arrow icons as unconfirmed.
11. **Row clicks.** School Student Sample: only the name button opens the profile modal; rows and headers do nothing. District tables: the name link and arrow open a school; rows do nothing. The Overview "Top five" has both a name link and an arrow button for the same action.
12. **Developer identifiers leak into tooltips** ("administrativeData.ts", "districtGradeOutcomes") in District (i) texts. Do not copy those strings; they need real copy.
13. **Decorative sparklines.** School KPI sparklines are one static path reused on all five cards; District Trend sparklines are one static 8-point polyline on every row. They are not data driven; the real values behind the "trend" column are only the "+X pts since launch" numbers.
14. **Trend column meaning** in the District Overview/School Performance tables equals the planning milestone delta, not the career exploration delta, which is easy to misread as "trend of the column next to it".
15. **Academic year** is a single-option select in both roles (2026–27); the Counselor view uses 2023-2024 / 2024-2025. Whether leaders can compare years is unspecified. Impact period (Since Launch / This Semester / This School Year) only exists on the School Overview chart; the chart months are Launch, Sep to Apr only (no May/Jun, no summer).
16. **Filters on the School Leader screens do nothing except scope the 20-row sample.** The (i) says so, but the filter row appears on every screen including Reports and Career + Postsecondary where nothing responds. Decide whether to hide it where it has no effect.
17. **Nonprofit Leader** is a single-screen role (7 KPIs, funnel, programs, locations, drilldown). Only its structure was recorded.
18. **Data definitions modal wording drift**: the School modal calls the fifth card "Planning Milestone Completion ... required career and postsecondary planning milestones"; the Reports Impact card calls the metric the same, but the KPI row on the School Overview omits it entirely (it only appears in the modal, the Reports card and Counseling Coverage as "88%").
19. **Accessibility behaviours seen:** tooltips are `aria-label`/`title`-backed info buttons; the Demo View select and accordion cards are keyboard operable; the table on School Performance scrolls horizontally rather than collapsing columns at narrow widths. No loading or error states were observed anywhere (everything renders from local fixtures). Empty states exist only for the School student table and the District school table.
20. **Responsive behaviour** was not tested beyond a 1440 px viewport (the first screenshot at 800 px shows the sidebar and filter row wrapping; the sidebar has an "Open navigation" button, so there is a mobile drawer).
