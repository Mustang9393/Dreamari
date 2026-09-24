# Counselor Dashboard: deviations from the Replit reference

The Counselor Dashboard was originally built as a 1:1 port of a reference
implementation (`web-app-prototype-maishak.replit.app`) -- same structure,
copy, and vocabulary, our own visual execution. Since then we've been going
screen by screen improving it, and some of those changes move content, data,
or structure away from what the reference (and our own original port) had.

**This file is that running log.** Every time a screen-by-screen pass
changes something more than a color or a spacing value -- a column removed
or added, a control that starts doing something it didn't before, a data
shape that changes, copy that now says something different -- it gets an
entry here, with the reason. Purely visual polish (surfaces, glows, chart
mark styles) that doesn't touch content/data/structure is not logged here;
it's in the commit history and `docs/AI_HANDOFF.md` instead.

Format per entry: **what changed** -> **why it was necessary** -> **why this
was the optimal way to solve it, not just a way** -> **what it replaced**.
"Why" alone isn't enough -- a change is justified against the alternatives
that were available, not just against doing nothing.

**24 Sept 2026: v1 reset to 1:1 in structure AND content; every deviation
now lives in v2.** Direct instructions: "make sure everything new is in
v2.0. Let's reset v1.0 to match the Replit 1:1 except for design language
and visuals", then "make sure the contents of cards etc match the replit
1:1 in v1... Always compare 1:1 visually, and on desktop screen size
first." So `src/components/counselor/` (v1) is the reference, screen by
screen, compared live against it at 1440px:

- **Data is the reference's own, verbatim.** The 120-row Students table
  (`src/lib/counselorRosterData.ts`) and every student's drill-down
  (`src/lib/counselorProfileData.ts`: DOB, grade-scoped milestone statuses,
  engagement counts, support-flag reason) were captured off the live
  reference, so Overview's 86% / 103 / 11 / 6, "79 have a plan", the seven
  pathways at 24 / 21 / 18 / 16 / 15 / 14 / 12, the readiness charts, the
  Summary-by-Grade table, My Impact's 7,293 / 852 / 1,101 / 1,246 / 410 and
  every profile are the reference's numbers, not a seeded approximation.
  The roster's vocabulary is the reference's too: seven pathways
  (Technology, Healthcare, Finance & Business, Skilled Trades, Education,
  Arts & Media, Law & Government), "Trade/Technical School", and three
  milestone states the first port lacked (Completed, Overdue, Not
  Applicable, the reference's dash).
- **Content the reference fixes, v1 fixes.** Review Queue is its 15
  submissions (messages and attachments included); Settings' caseload is
  40 / 68% / 7; My Impact's "15 plans reviewed · 0 approved · 10 pending"
  and "10 announcements"; Connect's 10 announcements; all dates are the
  reference's (2023-2024 academic year, January 2024 activity), no longer
  relabelled to 2026.
- **Composition the reference has, v1 has.** Overview's donut on top with
  the legend beneath, the Postsecondary center as a count, the readiness
  subtitle under the title; the roster in the reference's own row order
  with "Lincoln" and "92%" cells; the Student Profile's "← Student Profile"
  header, hero card with student number, DOB and "Reports Done" ring,
  About the Student, grade-scoped milestone grid (3 / 5 / 6 / 11), Pending
  Counselor Action, the fixed Plan Progress list.
- **What stays ours:** the glass surfaces and avatars, the validated
  single-hue readiness ramp, amber "Needs Attention", the muted-foreground
  "Not Started", the responsive shell, pagination on the roster (the
  reference's unpaginated 120-row table is a confirmed blank-render bug
  on phones), and the shell's flex-column shrink guard (a visual bug, not
  content).

Every content/data/structure entry below describes
`src/components/counselor/v2/`, switched live by the bottom-center version
chip (`counselor/version.tsx`, `?v=2`). v1 entries that were reverted are
left in place as the record of why v2 made each change.

---

## v2 design rules (25 Sept 2026, apply to every v2 screen)

Direct feedback that set these: "Let's lose the red glow on needs your
attention and let's have better contrast for the nested cards everywhere.
Let's not use so many different colors. Choose a hue and stick to that.
Blue is best. Lose the glow from anything that isn't a hero card.
Milestone tracker: don't tint cards. Review queue: do not tint cards."
Then: "Lose the equalizer style graphs too, just do a blueish tinted one
with gradient running brighter to top and more transparent towards
bottom."

- **One hue.** Every magnitude, series and category mark draws from the
  blue ramps in `src/components/counselor/palette.ts` (3, 5 and 7 steps,
  each validated as an ordinal ramp on the dark surface). The only other
  colors are the three reserved status colors, and they mean state (On
  Track, Needs Attention, At Risk; met, close, behind), never identity.
  Replaced: seven-hue pathway bar (reused status green and amber), pink /
  amber / purple / teal tile accents on My Impact, Platform Engagement and
  the Student Profile, a bronze target line (now a neutral dashed line).
  Alternative: a validated eight-hue categorical palette. Passes the
  validator, fails the brief; a dashboard a counselor scans daily does not
  need series identity by hue when a legend and rank order carry it.
- **Glow is hero-only.** One card per screen carries the saturated
  surface and glow; everything else is the plain glass. Removed: the
  quiet per-card glows on Overview's donut and pathway cards and the
  attention strip, Milestone Tracker's severity tints, Review Queue's
  priority glows and tinted detail pane, the role Overviews' sidekick
  glows. Severity now lives in one dot or one word on the card, not its
  surface.
- **Nested surfaces contrast.** `GLASS_INSET` (surfaces.ts) is white at
  7% with a 14% border, up from 4% / 8%, and every nested row (attention
  strip, role Overview rows, phone student cards) uses it.
- **Bars are one gradient.** The shared `BarChart` gained
  `barStyle="solid"`: one rounded bar, the series color at the top fading
  toward the baseline, no track behind it. Every counselor v2 chart passes
  it; Connect keeps the segmented style it was designed with. Alternative:
  change the shared default. Connect's charts were reviewed and approved
  in the equalizer style, so the counselor dashboard opts in instead.

## Role shell (v2)

- **The left menu is decided by the role in Settings, 24 Sept 2026.** The
  reference has one persona (a school counselor) and one fixed 11-item menu;
  Dreamari sells the dashboard to four (Settings' role dropdown: School
  Counselor, Lead Counselor, School Administrator, District Administrator),
  and a district administrator has no Review Queue to work and no caseload
  to "Connect" with. The four menus live in one file
  (`src/components/counselor/roles.ts`) and are PROPOSED, built as proposed
  so they can be reviewed live, pending Joshua's sign-off:
  - School Counselor: Overview, Students, Milestone Tracker, Review Queue,
    Student Progress, Counselor Connect, Career + College Insights,
    Productivity Suite, My Impact, Settings.
  - Lead Counselor: the above plus Counselors (after Overview), with My
    Impact becoming School Impact.
  - School Administrator: Overview, Readiness, Students, Counselors,
    Platform Engagement, Reports, Settings.
  - District Administrator: Overview, Schools, Readiness, Engagement,
    Reports, Settings.
  Why one file: the menus will move after review, and a per-screen or
  per-shell hard-coding would mean touching several files per change.
  Alternative considered: a permissions matrix (view x capability) with the
  menu derived from it. Richer, but Settings' own "Role Permissions" card
  is prose, not data, and a matrix invents structure nobody has asked for
  yet; an ordered list per role is the smallest thing that can be
  reviewed and changed in one edit.
- **A screen the role does not have is absent, not greyed or locked.** A
  locked item advertises something the user can buy or unlock; an
  administrator is never going to review a resume, so a locked Review
  Queue would be a permanent dead control. Alternative: greyed with a
  tooltip explaining why. Rejected for the same reason: it costs a menu
  row on every visit to explain a screen that is not for this person.
- **A view the role does not have redirects to that role's Overview.**
  `CounselorApp` checks the requested view against the role's menu (on v2)
  or the reference's 11 (on v1) and replaces the URL with Overview, which
  every role has. A stale bookmark or a role change while on a screen the
  new role lacks lands somewhere useful. Alternative: render a "not
  available for your role" page. That page would exist only to be left;
  Overview is where the person would go next anyway. The check waits for
  the version to be read after mount (`version.tsx`'s `ready`), because the
  pre-hydration render always says v1, and bouncing a v2-only link on that
  placeholder would make every direct link to Counselors or Schools land
  on Overview.
- **Platform Engagement leaves the School Counselor's menu.** It is a
  school-wide login/activity view (its own subtitle is "Login & activity
  tracking · Lincoln High School"), an administrator's question, not a
  caseload counselor's. It stays for School Administrator and, as
  "Engagement", for District Administrator. Alternative: keep all 11 for
  the counselor for fidelity. The whole point of the role shell is that
  each role sees its own work; a counselor menu identical to v1 would show
  nothing had changed.
- **New screens start as honest "Coming soon" placeholders** (Counselors,
  Readiness, Reports, Schools, School Impact; `v2/ComingSoon.tsx`), per the
  playbook's tier 1 + tier 6 default: a bordered card, "Coming soon" tag,
  a bold line, the screen's own subtitle stating what it will answer, one
  CTA back to Overview. The menu item is real so the four shells can be
  reviewed whole; the copy says the screen is not. Alternative: hide the
  items until each screen is built. Then the menus under review would not
  be the menus being proposed.
- **v1 is untouched.** The role-driven menu and the redirect apply on v2
  only; v1 shows the reference's 11 items for every role, and a v1 link to
  a v2-only view goes to Overview.

## Overview per role (v2)

The reference has one Overview for one persona. In v2 each role's Overview
answers that role's own question, on the same rules the counselor Overview
was redesigned under (one hero surface, sidekicks in plain glass, reserved
status colors for state, single-hue bars for magnitude, validated ramps,
every card opens something). School Counselor keeps the improved v2 Overview
logged under "Overview" below. The three new ones, 24 Sept 2026:

- **Rebuilt same day under a hard copy and color budget** (direct
  feedback: "SO MUCH COPY AND RED ... everything looks super overwhelming.
  V2 is the design layer, it needs to be super intuitive, skimmable,
  glanceable, actionable, beautifully composed"). What the first cut did
  wrong: every card had a subtitle, a verdict sentence in red or amber, a
  footnote explaining the tick, and every row carried a chip ("ON TARGET",
  "BEHIND"), a big number and a metadata line, so a healthy row shouted as
  loudly as a failing one. The budget now:
  - **One verdict per card, a phrase** ("Renee Alvarez is furthest
    behind", "2 of 4 met · FAFSA completion furthest behind"). Text in the
    foreground color; only a leading dot carries the status color.
  - **One line per row:** name, one short muted note (students, targets
    met, logins), the value, a bar with the target tick. No chips, no
    distance sentences, no footnotes.
  - **Color means "below target."** A row that meets its target is quiet
    (primary-blue bar, white value). Amber within 10 points, red further.
    Green is never painted on rows; the absence of alarm is the signal, so
    a page with one problem shows one colored row.
  - **Card titles are nouns** ("Counselors", "Grades", "Targets",
    "Schools", "Platform use") with an optional unit ("% on track") instead
    of question sentences; the question is what the page is for and the
    verdict answers it.
  Alternative considered: keep the sentences but shrink them. A smaller
  sentence is still a sentence to read on every card; the point of the
  screen is to not read.
- **Glow only on the hero.** A first cut tinted every card's glow and
  border by its own worst band; corrected same day (direct feedback: "the
  different glows per card is not required everywhere ... only have it
  genuinely where it needs to be"). Now the single hero card per Overview
  carries the status tint and every sidekick is the plain glass with the
  quiet primary glow the rest of the dashboard uses. The verdict line and
  band chips still state each card's reading; the glow no longer repeats
  it. The counselor Overview (below) and Milestone Tracker keep their
  existing, separately justified tints.
- **One "vs target" language for all three** (`v2/overviewShared.tsx`,
  `targetBand` in `src/lib/counselorOrg.ts`): met = On Track green, within
  10 points = Needs Attention amber, further = At Risk red, always icon +
  word ("On target" / "Close" / "Behind"), never color alone. Each card's
  glow and border take the worst band on the card, and each card leads with
  one verdict sentence ("Grade 11 is behind: 74% on track, 8 students need
  attention"). Alternative: a numeric score per card. A number needs a
  legend; a sentence in the status color needs nothing. Alternative: reuse
  the attention strip's Critical/High/Medium. Those rank students within
  "At Risk"; distance from a target is a different scale and reusing the
  chips would have made one badge mean two things.
- **Targets** (`SCHOOL_TARGETS`): 80% for on-track, plans on file and senior
  plans is the "district target" the reference's own My Impact quotes; FAFSA
  65% and students-active 60% are seeded (no target exists in the
  reference). Marked seeded in code. Alternative: one 80% for everything.
  A FAFSA target of 80% would make every school read "Behind" on a measure
  where 60% is a strong real-world result, so the card would cry wolf.
- **Senior plan compliance keeps the reference's definition** (seniors with
  a declared postsecondary plan, 87%), and FAFSA is the separate, stricter
  measure (seniors with Financial Aid approved or completed, 40%). A first
  cut used the milestone check for both and read 40% for senior plans,
  which contradicted v1 My Impact's 87%; corrected before commit.

### Lead Counselor

- **Hero: "Which counselor is behind."** Three caseloads ranked worst first
  by on-track rate (tiebreak: overdue + changes requested), each row a
  status distribution bar (the same three-segment mark Career Pathways
  uses), the on-track % and its band chip, and "pending · overdue" counts;
  rows open Counselors. Caseloads are SEEDED by last-name range (A-G / H-R /
  S-Z, `SCHOOL_COUNSELORS` in `counselorOrg.ts`): the reference has one
  counselor and no counselor field per student. Why last-name ranges: it is
  how many schools really assign, it is deterministic, and it is uneven
  (45 / 47 / 28), which is what makes the question answerable (Renee
  Alvarez, S-Z: 75% on track, 54% with a plan). Alternatives tried on the
  real roster before choosing: every third student (three caseloads within
  five points of each other, no story) and three contiguous blocks of 40
  (caseloads segregated by grade, which would have confounded the grade
  card beside it).
- **Sidekick: "Which grade is behind."** On-track rate per grade with the
  80% tick, worst first; selecting a grade sets the shared grade filter and
  opens Students, the same cross-view filter mechanism the donuts use.
- **Second row: school status donut, review backlog, postsecondary donut.**
  The two donuts are the counselor Overview's `DonutCard` with a caption
  instead of a trend delta (no hand-authored "+2 pts" here: the counselor
  card's deltas are already flagged as fixed demo numbers, and a lead's
  school-wide figures should not add more). Review backlog reads the same
  review store as the queue (pending, overdue, awaiting the student, per
  counselor) and opens the Review Queue. Not included: the counselor
  Overview's attention strip and readiness charts; a lead's first job is
  the people and grades, not individual students, and two rows is the
  density budget.

### School Administrator

- **Hero: "Is the school on target."** Four `TargetRow`s (senior plan
  compliance, FAFSA completion, postsecondary plans on file, on-track rate):
  value, bar with the target tick, distance from target in words, band chip.
  Verdict counts targets met and names the one furthest behind. A seniors-
  only measure under a non-senior grade filter reads "n/a · Not measurable
  under this filter" rather than 0%. Alternative: four stat tiles with a
  delta arrow. A delta against last month is a trend; the administrator's
  question is distance from a target, and the tick on the bar shows it
  without a second number.
- **Sidekick: "Is the platform used."** Students active this month against
  the 60% target (Lincoln's 71 of 120 from Platform Engagement, kept as a
  share so the grade filter scales it), weekly active and logins per
  student; opens Platform Engagement.
- **"Readiness by grade" bar chart** on the validated single-hue ramp with
  the bronze target line, three series: on track, Career Report approved,
  Academic Plan approved. Whole school, not the filtered roster, since the
  chart exists to compare grades.
- **"Equity cuts": on-track rate by pathway or by postsecondary plan
  (Segmented toggle), lowest first, verdict is the gap between the highest
  and lowest group.** The roster has no demographic fields, so cuts by free
  or reduced lunch, English learner and IEP status are named as coming with
  SIS data (playbook tier 6), not fabricated onto 120 named students.
  Alternative: seed subgroup flags deterministically. Rejected: invented
  demographics on named students would be indistinguishable from real ones
  in a demo, which is exactly the kind of fabricated signal this dashboard
  avoids elsewhere (see the salary-threshold rule).

### District Administrator

- **Hero: "Which schools are behind."** Five schools ranked by readiness
  targets met (tiebreak: on-track rate), each row: enrollment, plans %,
  senior plans %, FAFSA %, on-track bar with the 80% tick and an "N/4 met"
  chip; rows open Schools. Lincoln is live; the other four are SEEDED
  (`SIBLING_SCHOOLS` in `counselorOrg.ts`, `seeded: true`): each is Lincoln
  scaled by an enrollment factor plus fixed per-metric offsets, so they
  move with the grade filter and with review decisions exactly as Lincoln
  does and always sit in the same relation to it (Jefferson ahead,
  Washington behind on readiness and usage, Roosevelt large and behind on
  FAFSA and usage, Kennedy close). Alternative: four independent seeded
  rosters. Four more 120-row datasets would be more to maintain, would not
  react to the demo's own actions, and would imply real per-student data
  the prototype does not have.
- **Sidekick: district student status donut**, counts summed across the
  five schools, rates recomputed from the sums (`districtRollup`).
- **"Is the platform used": students active this month per school against
  the 60% target, lowest first**, with active count and logins per student;
  verdict is how many schools reach the target. Opens Engagement.
- **"District against targets": the four readiness `TargetRow`s for the
  rollup**, compact. The same component as the school administrator's hero
  so the two roles read the same numbers the same way.
- **Shell:** the topbar org chip and the account line read the district
  (`DISTRICT_NAME`, short form in the account line) for this role on v2.
  The grade filter and student search stay; the search still targets
  Lincoln's roster, which is the only real one.

## Overview

- **Attention strip rebuilt quiet, 25 Sept 2026** (direct feedback: "lose
  the red glow on needs your attention" and, the day before, the standing
  budget). No glow, no filled red reason blocks, no three-column grid: one
  row per student on the raised inset surface, name and grade left, the
  reason in plain text and the severity as one colored word on the right,
  three rows then "See all". What it replaced: three equal chips each with
  a colored severity badge and a color-filled reason pill, which put six
  red surfaces on a healthy page. The severity word and the sort order
  keep the "which first" answer.
- **Top row restructured from 3 equal cards to an asymmetric hero layout**
  (Student Status wide + tinted to its own reading, Career Pathways
  medium, Postsecondary Plans compact) instead of 3 equal-width boxes.
  Why: "dominance over equality" -- one card should carry the visual
  weight, direct feedback that the original equal-card grid had "no design
  experimentation."
- **Career Pathways changed from a set of independent ranked bars to one
  stacked distribution bar.** Why: direct correction -- independent bars
  read as each pathway having its own progress goal; the data is actually
  a breakdown of one whole roster.
- **Added a "Needs your attention this week" strip**, not present in the
  reference, now the first thing on the page. Shows the roster's At-Risk
  students, sorted by a new severity score (Critical/High/Medium, derived
  from each student's own milestone data: an unaddressed "Changes
  Requested" outranks a merely "Not Started" milestone), each with a
  specific reason ("College List needs changes") instead of just a name.
- **Added trend deltas** ("+2 pts vs last month") to the two donut cards.
  Hand-authored, fixed numbers -- there's no historical snapshot in this
  prototype to compute them from. Flagged here explicitly so this is never
  mistaken for a live computation later.
- **Donut segments and pathway segments are now click targets.** Clicking
  a Student Status or Postsecondary Plans segment navigates to Students
  pre-filtered by that status/plan. Clicking a Career Pathways segment
  cross-filters the whole Overview page by that pathway. Neither existed
  in the reference or the original port.
- **Career/Academic Readiness bar charts gained a district-target
  reference line** (dashed, labeled in the legend, value 80% -- matches
  the existing "district target" convention already used on My Impact).
  Not present in the reference.
- **Student avatars are the app's own illustrated portrait set**
  (`src/lib/avatar.ts`), not initials or the reference's own avatar
  treatment -- ties the roster into the same "no real student photo ever
  stored" policy the rest of the app already follows.
- **Sidebar/topbar wordmark is the real Dreamari brandmark**
  (`src/components/app/chrome.tsx`'s `Wordmark`), not a hand-drawn "D"
  square -- this dashboard is a Dreamari product like every other screen.

## Students (roster)

**25 Sept 2026, v2 rebuilt on the budget above** (the first pass in the
list below is v1's history):

- **Six columns, not eight.** Grade and Career Track fold into the
  student cell as one muted line under the name ("Grade 12 · Healthcare"),
  which is how every other row on the dashboard already names a student.
  Alternative: keep them sortable as columns. Grade is already a topbar
  filter, and a pathway sort was never asked for.
- **Status sorts by severity** (At Risk, Needs Attention, On Track; ties by
  roadmap), not alphabetically, so one click puts the students to act on
  first. Last active is sortable too.
- **Two pickers replace the "Filters" popover.** Status and Plan sit in
  the toolbar as `Listbox`es (guardrails: never a native select), showing
  the current value, "Any status" / "Any plan" to clear. The Overview's
  "With Plan / Undecided" click-through and this screen's own intent
  filter are the same question at two grains, so one picker shows either.
  Removed: the removable chips that repeated the same state next to a
  button that hid the control.
- **Phone and tablet get a card list, not a sideways table.** Below the
  desktop breakpoint each row is a card: student, status, roadmap,
  milestones. Alternative: the 1100px table with horizontal scroll. The
  roster is the one screen a counselor most plausibly opens on a phone
  between meetings; a table that needs two-axis scrolling is not usable
  there (and the guardrails flag paired-scrollbar CSS as a known
  Windows/Chromebook trap).
- **Roadmap is a plain blue bar with the percent beside it**, replacing
  the shared `Meter`'s "92/100" reading.
- **Dates read "Jan 15"** instead of ISO.
- **Empty result is one line** (playbook tier 5).

- **Table collapsed from 13 columns to 8.** The "School" column is
  removed entirely -- every row said "Lincoln High School" (a one-school
  demo, already shown in the topbar), so the column carried zero
  information. The five separate milestone-status pill columns (Career
  Report/Resume/Applications/Rec. Letter/Transcript) collapse into one
  "Milestones" column.
- **The Milestones column now covers all 11 milestones, not 5.** The
  original five-column view was an arbitrary subset that silently
  excluded 6 of the student's 11 milestones (Career Assessment, Academic
  Plan, Career Pathway, College Exploration, College List, Financial
  Aid) from the roster view entirely. The new column shows a real
  "X/11 approved" count plus a compact per-milestone segment strip
  (titled on hover) covering the full set.
- **"Filters" is now a working control.** In the reference and the
  original port it was decorative (rendered, did nothing on click). It
  now opens a real Postsecondary Intent filter, applied as a removable
  chip -- the only place on this screen to narrow by intent beyond the
  binary With Plan / Undecided already reachable from Overview.
- **Table is now a bounded, internally-scrolling region with a sticky
  header**, instead of an unpaginated-feeling tall block with the column
  header scrolling away. (Pagination itself -- 20 rows/page -- was
  already in place before this pass.)

## Milestone Tracker

- **"View Details & Student Breakdown" is now a working control.** In the
  reference and the original port it rendered with no `onClick` at all
  (one of 8 dead controls flagged in the original audit). It now navigates
  to Students, pre-filtered to the tracker's current grade tab. It does
  *not* yet filter by the specific milestone card clicked -- this
  dashboard's grade-cohort milestone taxonomy (`completed`/`inProgress`/
  `needsAttention`/`notStarted`/`notApplicable`, in `milestoneReadiness.ts`)
  and the roster's own per-student taxonomy (`MILESTONE_KEYS`/
  `MilestoneStatus`, in `counselorRoster.ts`) were never reconciled into
  one shared vocabulary -- a pre-existing structural split, not something
  this pass introduced. Flagged here since it's the reason the fix is
  "jump to the grade" rather than "jump to exactly these students."
- **"Needs Attention" recolored from red to amber**, on this screen only.
  It was using the same red as this dashboard's "At Risk" status
  everywhere else, while rendering the literal words "Needs Attention" --
  the phrase Overview and Students both already reserve for amber. Same
  label, different color across screens; now consistent.
- **The 4 milestone cards restructured from an equal 2x2 grid into one
  hero card + 3 sidekick cards**, each card's glow tinted to its own
  severity. Why it was necessary: direct feedback that 4 visually-
  identical cards "pass distinguishability checks but not design checks"
  -- nothing on the page told a counselor which milestone actually needed
  their time first. Why this direction, not an alternative: a sort-order
  change alone (worst card first, same size) fixes *scanning order* but
  not *visual weight*; a color-only fix (tint every card, same size) fixes
  severity-at-a-glance but leaves the "4 equal boxes" problem Overview's
  own redesign specifically named and rejected. Combining both -- size for
  "look here first," color for "here's how bad" -- reuses a pattern
  already proven on this exact dashboard (Overview's Student Status hero)
  rather than inventing a third, screen-local convention.
  **First version of the severity metric was wrong and got corrected
  same-session** (direct feedback: "the colors dont actually match the
  dominant progress, whats the logic we're going for?"): it thresholded
  each card's own `pct` (completed/total) -- but `pct` treats "still
  actively In Progress" and "actually stuck" as the same missing chunk, so
  a card with 7 of 9 remaining students In Progress and **zero** Needs
  Attention (`Grade 9 College & Career Reflection`, pct 70) scored *worse*
  than a card with real stuck students (`Next-Year Course Plan`,
  needsAttention 2 + notStarted 2, pct 73) purely because 70 < 73. Fixed
  by computing `stuckShare = (needsAttention + notStarted) / total` and
  driving both the hero pick and every card's tint off that instead --
  this is the metric that actually matches what a counselor means by
  "needs attention," and it's the same wedges the ring itself already
  draws in amber/gray, so the glow now agrees with the ring instead of
  contradicting it. What it replaced: a uniform `lg:grid-cols-2` grid
  where every card used the same plain glass surface, the same 110px
  ring, and a color legend but no card-level severity signal at all.
- **Every milestone card now states in plain text what its own glow color
  means** ("4 of 30 need attention or haven't started" in the tint color,
  or "Nobody stuck -- just finishing up" in green), directly under the
  ring. Why it was necessary: even the corrected `stuckShare` logic above
  still means a card's glow can be red while its ring is still
  majority-green (most students are always "Completed" or healthy "In
  Progress") -- direct feedback: "the dominant graph is green right? I
  dont understand whats deciding the card glow." Why this direction, not
  an alternative: recoloring the ring itself to make stuck students look
  more dominant would misrepresent the actual proportions (lying about
  the data to make the UI easier to read is worse than the confusion it
  fixes); this states the real number in the color that's asking for
  attention, the same "don't make the reader infer it from color alone"
  fix already applied to Overview's attention-strip reasons. What it
  replaced: a card whose only signal for "why is this glowing red" was
  the glow itself, plus a legend a reader would have to manually add up.
- **"Not Started" gray changed twice, settling on the dashboard's own
  `--muted-foreground` token.** First pass: `#5B6470` measured 2.9:1
  against the dark surface, below the dataviz skill's 3:1 floor (direct
  report: "not sure if the grey is properly visible" -- a real,
  measurable failure, not a preference); lightened to a hand-picked
  `#7A8296` that cleared 3:1 with the smallest possible change. Follow-up
  question ("should the grey be brighter/more white?") led to a better
  answer than a bigger hand-picked number: this dashboard already has an
  established muted-gray -- `--muted-foreground`, white at 62% opacity,
  used for every other piece of secondary text on every screen -- and it
  composites to roughly `#A6A7AE` over this card's surface, well past
  3:1. Switched to referencing that token directly instead of a second
  bespoke hex, so "Not Started" reads as the same neutral gray the eye is
  already calibrated to everywhere else on the dashboard, and stays in
  sync automatically if the token itself ever changes.
- **"View Details & Student Breakdown" upgraded from a bare text link to a
  pill button with a chevron.** Why: matches the affordance language
  "See all" already uses on Overview -- a link-styled control with no
  visible boundary reads as informational text first, clickable second;
  the established pattern on this dashboard is a bordered, tinted pill for
  anything that navigates. Not logged as its own item above since the
  underlying behavior (still navigates to the grade-filtered roster)
  didn't change, only its visual affordance.
- **Card composition rebuilt around one hierarchy, 24 Sept 2026** (direct
  feedback: "needs better composition and alignment and information
  hierarchy WITHIN cards"). What was wrong, specifically: each card mixed
  three alignment axes (a left-aligned header, a centered ring cluster, a
  2x2 legend whose `ml-auto` values floated to each column's far edge so
  "Completed 22" read as "22 ... In Progress"); the same fact was stated
  three times in three type styles ("73% completed" in the ring, "22 of
  30" under it, then "4 of 30 need attention or haven't started"); and
  the full-width hero held one narrow centered column with dead space
  either side. Content/structure changes, each with the alternative it
  beat:
  - **Legend is now the shared `StatRow`** (moved from Overview into
    `chips.tsx`): one column, dot + label left, value pinned right, so
    every value lands in a single right-hand column. Alternative
    considered: keep 2x2 and right-align values within each column --
    still two value columns, still a wide gap between a label and its
    number on any card wider than ~300px. One column costs ~40px of
    height (cards already stretch to equal height) and makes Overview and
    Milestone Tracker legends identical, which they were not before.
  - **"completed" inside the ring replaced by "22 of 30"; the separate
    "22 of 30" line removed; the tinted sentence becomes the single
    verdict line.** Each number now appears once: ring = how far along,
    verdict = the one fact the glow encodes, legend = per-state
    breakdown. Alternative: drop the verdict and rely on the legend -- but
    the verdict is the only line that explains the card's own color, which
    the previous entry above fought to keep. Alternative: keep all three
    lines but unify their type -- still three lines saying two things.
  - **`reviewNote` no longer rendered.** In every entry in
    `milestoneReadiness.ts` it restates the subtitle in lowercase
    ("Counselor Review" -> "Counselor review", "Counselor Verification" ->
    "Counselor verification") or restates who is responsible when the
    subtitle already says so. The reference showed it; on this card it was
    the third header line at the smallest size carrying zero new
    information. Data field kept (the reference vocabulary is preserved
    in data), only the render dropped.
  - **Info icon removed.** It had no tooltip and no action -- an icon-only
    element promising information it never delivers, and the 22px indent
    it forced on the subtitle aligned with nothing else on the card. The
    app-wide rule (icon-only controls carry a label tooltip) would have
    meant inventing content for it; removing it is the honest fix.
  - **"View Details & Student Breakdown" -> "See students."** The control
    navigates to the grade roster and cannot yet filter to this milestone
    (taxonomy split, first entry above), so the long label overpromised a
    breakdown it does not deliver. Alternative: keep reference copy for
    fidelity -- fidelity to a promise the control breaks is worse than a
    short honest label. Same pill affordance as Overview's "See all."
  - **Hero uses its width.** On a card 640px or wider (a container query,
    not a viewport breakpoint, so it holds whether the hero spans the full
    row or two thirds of it) the same five parts spread into
    title + verdict + control | ring | legend. Below that it stacks in the
    sidekick order. Alternative: cap the hero's content width and center
    it -- the hero exists for prominence, and a centered narrow column in
    a wide glowing card reads as empty, not prominent. Alternative: a
    separate hero component -- two components drifting apart is how the
    original alignment mess happened; one DOM order with two grid-area
    arrangements keeps them one thing.
  - **No orphaned card.** Grade 10 has 8 milestones: full-width hero + 7
    sidekicks in three columns strands one card alone on the last row.
    When `rest.length % 3 === 1` the hero spans two columns and the first
    sidekick sits beside it. Alternative: four columns for that grade --
    card widths would jump between grade tabs; the shared-row hero keeps
    sidekick size constant across all four tabs and the hero still the
    largest thing on the page.

## Review Queue (v2)

- **Every pending milestone is its own queue item.** v1 (and the reference)
  built one item per student from the *first* pending milestone, so a
  student with two submissions had one silently hidden. Why this direction:
  the queue's unit of work is a submission, not a student; a counselor
  reviews a resume and a college list separately. Alternative: group by
  student with sub-items -- adds a level of nesting to a list that is
  usually 20 to 40 items, for a case (two pending at once) the seeded
  roster never produces and a real one produces rarely.
- **Priority and order come from the due date.** v1 assigned Urgent/High
  by list position (`i % 5`, `i % 3`) and listed items in roster order.
  Now: overdue is Urgent, due within two days is High, else Normal; sorted
  most-overdue first, then due soonest, then longest-waiting. Cards and the
  detail pane carry the same severity glow the Milestone Tracker cards use,
  in the reserved status colors (red / amber / neutral), so the list reads
  worst-first before a word is read. Alternative: keep a separate priority
  the "student" set at submission -- there is no such input in the
  reference or in Dreamari, so it would be invented data dressed up as a
  signal. Due dates are deterministic per item (seeded hash, relative to
  today) so a demo stays stable within a day.
- **Decisions are recorded and shared.** `src/lib/counselorReviews.ts`
  persists Approve / Request Changes with the feedback text and a
  timestamp; `getReviewedRoster()` overlays those decisions on the roster
  and every v2 screen reads the roster through it. Result: approving on
  the queue changes the student's milestone on their profile, the Students
  roster strip, Settings' "Pending Reviews", Student Progress' review
  activity and Overview's attention strip ("Changes Requested" becomes a
  Critical flag), all from one source. Why this over v1's local state:
  three screens counted "pending" three different ways and none moved when
  a counselor acted, which is the thing a demo viewer notices first.
  Alternative considered: mutate the roster in place -- the seeded roster
  is regenerated per load and the live row is re-read on every access, so
  an overlay is the only shape that survives both. Feedback is kept because
  the Replit's UI asks for it and then threw it away.
- **A "Reviewed" section below the queue, with Undo.** v1 made the item
  vanish on click with no trace. The section shows each decision (student,
  milestone, status chip, the feedback, when), newest first, and Undo
  removes the decision and returns the item to Pending. Alternative: a
  toast -- gone in three seconds, no way back, no record of what was said.
- **Detail pane leads with the submission.** Student message first, then
  the attachment chip, then feedback and actions. The v1 metadata grid
  (Student / Type / Submitted / Due / Priority / Status) collapses into the
  header and one due-date line; "Status: Pending Review", true of every
  item in a pending queue, is gone. The attachment is a chip, not a
  link-styled span that doesn't open anything.
- **Honors the topbar grade filter** like Overview, Students and Milestone
  Tracker, with the grade shown in the "Pending (N) · Grade 9" heading.
- **Empty state is reachable.** v1 checked total items, not pending ones,
  so clearing the queue never showed "Nothing pending review right now."
- Not changed: the canned per-milestone messages (now covering all 11
  milestones instead of 5), which remain demo copy until Dreamari has a
  student-to-counselor share action (report history's "Shared with
  counselor" label is the natural source).

---

## Student Progress (v2)

- **The report-type side list is gone; the report is the first control in
  the filter row.** The reference (and v1) pin a 300px column of nine
  report names beside the content for the whole visit, so the chart and the
  Summary by Grade table fit in what is left (direct feedback, 24 Sept 2026:
  "a submenu is taking up space inside its container. Why?"). A report is
  chosen once per visit, then read; it belongs with the other two filters,
  not as a second navigation. The chart and the table now take the full
  width, and the chosen report's icon sits in the chart title so the choice
  stays visible. Alternative offered in the same feedback: take over the
  left nav with a back button. Rejected for this screen: the nine reports
  are not destinations, they are one parameter of one screen, and a nav
  takeover would make "Student Progress" a mode the counselor has to leave.
  Alternative: a row of nine pills. Nine labels of 20 to 30 characters wrap
  to two rows at 1440 and four on a phone, which is the same space problem
  laid sideways.
- **All three pickers are the app's `Listbox`, not native selects**, per
  the cross-browser guardrails (a native select popup renders in the OS's
  own chrome, which reads as a foreign control on Windows and Chromebooks).
- **A report with no chart says so.** Application Progress and Financial
  Aid Progress render table-only in the reference; v2 adds one muted line
  naming that, so the missing chart reads as "not this report" rather than
  "broken".
- Not changed: the nine report taxonomies, the CSV/PDF exports, the Summary
  by Grade table.

_Sections for the remaining screens (Counselor Connect, Career + College Insights, Productivity Suite, Platform
Engagement, My Impact, Settings) get added here as each is worked on._
