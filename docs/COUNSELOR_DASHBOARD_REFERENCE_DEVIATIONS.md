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

## Who sees which students (v2, 25 Sept 2026)

- **Reversed the same day: everyone sees the whole school.** After the
  scoping below shipped, a School Counselor's Milestone Tracker read "12
  students" for Grade 9 against the school's 30, and the direct call was
  "our numbers need to make sense, this is a school counsellor's dashboard
  of a whole school". So `SCOPE_COUNSELOR_TO_CASELOAD` (counselorOrg.ts)
  is off: every role reads the same 121 students, as the reference does,
  and roles differ by what their screens show (the Lead's counselor
  comparison and Counselor column, the administrators' targets and
  schools), not by hiding students. The seeded caseload split stays as the
  Counselor column and picker for the Lead and School Administrator, and
  as the Lead Overview's comparison. The mechanism below is kept behind the
  flag for when real counselor assignments exist.
- **(Superseded) The roster is scoped by role.** Direct question: "is the lead
  counsellor only seeing Sarah Chen's caseload? Is the number 121 supposed
  to be the same for school counsellor and lead?" It was, and it should not
  be. `useReviewedRoster()` (the one hook every v2 screen reads through)
  now returns `scopeRosterForRole()`: a School Counselor sees their own
  caseload (the seeded last-name split, matched to the account name, so
  "Sarah Chen" carries A-H, 45 students, plus the one live demo student who
  is always theirs); Lead Counselor and School Administrator see the whole
  school (121). So a counselor's Overview, Students, Review Queue,
  Progress, Settings' caseload and My Impact all read their caseload, and
  the oversight roles' read the school, from one rule. The Lead's Overview
  ranks all three caseloads through `useSchoolReviewedRoster()`.
  Alternative: scope only the Students screen. Then a counselor's Overview
  would say 121 while their roster said 45. Alternative: keep everyone on
  121 as the reference does. The reference has one persona; with four
  roles the same number for a counselor and their lead is a contradiction
  the demo viewer notices first. Known limit: an account whose name is not
  one of the three seeded counselors falls back to the A-H caseload, and
  the Students toolbar says whose caseload is showing.

## The bridge to the student app, 25 Sept 2026 (latest)

Usman: "the student app in general, and My Plan in particular, should
define what the counselor dashboard shows." Direct instruction: "find
ways to bring things from the Dreamari app into this dashboard, things in
the app that aren't being tracked here."

- **`src/lib/studentSignals.ts` is the bridge.** One module reads every
  store the student app writes (profile, picks, saved careers and
  colleges, resume and its versions, report history, play and glossary
  progress, dream score, career exploration, stage) into one shape, and
  derives the status of every My Plan step for the student's grade
  (`gradePlanData.ts`): in-app steps auto-complete from real actions,
  counselor-verified steps read the counselor's decisions, student-
  reported steps say "not tracked yet" until the backend persists My
  Plan's checkboxes. Seeded students get the same shape from the
  reference's per-student counts. Alternative: keep two vocabularies (the
  roster's eleven milestones and My Plan's steps). That is what made the
  tracker and the profile disagree with the student's own plan.
- **Milestone Tracker is My Plan by grade.** Rows are the grade's steps
  by season, each a stacked status bar, each opening Students filtered to
  the students who have not done it (the shared `stepFilter`, a removable
  "Not done: [step]" chip). The SchooLinks demo's best screen is this
  drill-through. CSV of the grid replaces Student Progress' reports.
- **Student Profile shows the student's My Plan** by season, with how
  each step is tracked (auto / you verify / student reports), its status
  and progress, and Approve on steps awaiting the counselor, recorded in
  the same review store as the queue. "On Dreamari" tiles read the real
  signals. The Drafts card (the Productivity Suite's four tools) sits on
  the profile, per Usman.
- **Pathways are Build's fifteen interest worlds**, not the reference's
  seven families. Seeded students are spread deterministically from each
  family onto the worlds it covers (`TRACK_TO_WORLDS`); the live
  student's pathway is their first Build interest by name. The families
  remain behind the scenes for the reference's cluster and Top 5 tables.
  Overview's bar shows the six largest worlds plus Other.
- **A career report shared with the counselor is a submission.** The live
  student's "Shared with counselor" report version puts Career Report in
  Pending Review, so it reaches the Review Queue and the tracker; a report
  only saved or printed reads Completed.
- **Insights' saved careers are computed** from every student's top
  matches plus the live student's real picks. Majors, simulations by
  career and colleges by id stay the reference's lists until the app
  records them.
- **Menus consolidate (Usman):** Student Progress and Productivity Suite
  leave the School Counselor and Lead Counselor menus; both routes still
  resolve. Overview, Milestone Tracker and Insights remain as the three
  analytics screens, each answering a different question.

## Cross-cutting, 25 Sept 2026 (late)

- **A manual option beside every AI-generated thing** (direct instruction,
  25 Sept 2026): Productivity Suite has "Write my own" next to "Generate
  draft" (a blank with the tool's headings, same editor, same Copy /
  Download / Save to notes; no student needed to start writing);
  Insights' recommendations have "Add your own" (what you noticed, what to
  do), shown as "Your note" tiles beside Dreamari's three. Nothing else in
  v2 is generated.
- **The (i) note also states each screen's ordering and why** ("What
  comes first, and why"), by direct instruction: the attention strip's
  Critical / High / Medium ranking, the roster's priority sort, the
  tracker's focus score, the queue's due-date order, and so on.
- **Portraits are hand-matched to names** (`src/lib/counselorRosterPortraits.ts`).
  First pass hashed first names (every "Aisha" got one face); second pass
  assigned by roster position (no repeats nearby, but faces no longer
  matched the names: "genders are wrong, races are wrong"). Now each of the
  120 names is classed by gender and likely background and drawn from the
  matching group of the 48-portrait set, walked in order so repeats are as
  far apart as the set allows (at most six names share a portrait; there
  are 22 white masculine names and five such portraits). Unmatched names
  fall back to a deterministic pick. Alternative: generate more portraits;
  out of scope for this pass and noted as the real fix.
- **Every v2 screen has an (i) at the top right that opens the screen's
  change note as an overlay** (`v2/changeNotes.ts`: what changed, why,
  what makes it better), by direct instruction. First placed beside the
  title with the note expanding under it; moved the same day ("put it in
  the top right corner ... display as an overlay thing that can be closed
  so it doesn't confuse the layout"): the panel now floats over the page,
  closed by its X, the backdrop or Escape, and the layout beneath never
  moves. The note is the short form of this file.
- **Every screen has loading, error and whole-screen empty states**
  (`v2/states.tsx`, previewed with `?state=`), catalogued with in-screen
  states and edge cases in `docs/COUNSELOR_V2_STATES.md`, so the backend
  has one contract per screen even though the demo never reaches them.
- **Devices.** Twelve-column heroes and chart pairs go side by side only
  from 1280px (at 1024 they were cramped and chart labels shrank);
  master-detail panes (Review Queue, Connect) become a bottom sheet with a
  Close bar below 1024 instead of sitting under the list; grid tracks are
  `minmax(0,1fr)` so a long meta line can never push a pane past the right
  edge; chip rows (`ScrollChips`) bleed into the gutter and peek instead
  of clipping.
- **Light mode.** Hardcoded whites became `--foreground` mixes so tracks,
  legends and dots flip; nested rows use `--inset-bg / --inset-border /
  --inset-shadow` (app.css) so a row is lighter than its card in both
  modes, a white lift in dark and white with a soft shadow in light
  (standing rule: layers get lighter with elevation, never darker); chart
  gridlines, value labels and tooltips use tokens.
- **Drilldowns.** Avatars and names in the review and reply panes open
  the profile; Counselors, Impact by-counselor and by-grade rows open
  Students with the shared counselor or grade filter; announcement cards
  open to their recipients; groups open to their feed. Insights rows do
  not drill down yet (no career id in the roster).
- **Counselor Connect works end to end:** New announcement is an inline
  composer; cards expand to read receipts and recipients; groups open to
  a seeded feed with a composer; New group is an inline form. The
  reference's buttons did nothing.
- **Productivity Suite drafts are built from the student's own data**
  (milestones, matches, plan), are editable, and can be copied,
  downloaded or saved to the student's notes; Students Needing Attention
  is a ranked list that opens profiles. The reference produced one
  paragraph for every student.
- **My Impact and School Impact rebuilt as a scorecard** (see "My Impact
  (v2)" below): outcomes against targets as the hero, one row of activity,
  one of engagement, grades as bars, ASCA as three short columns.

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
  rows open Counselors. Caseloads are SEEDED by last-name range (A-H / I-R /
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

- **Career Pathways bar: seven distinct hues in spectral order (25 Sept
  2026, fourth and final pass).** Direct feedback after a three-cluster
  attempt repeated colors: "Each thing in that legend has to be different
  but stick to a known sequence like a rainbow style ... instead of these
  random colors with things repeating." So: blue, cyan, green, yellow,
  orange, pink, violet (the spectrum starting on the brand blue and
  wrapping), assigned in rank order, so the legend reads as one
  spectrum top to bottom and no two pathways share a hue. This is the one
  deliberate exception to the one-hue rule, and the green, yellow and
  orange steps sit near the status hues; accepted because a pathway
  segment never appears beside a status chip. What it replaced, in order:
  a seven-hue set that reused the exact status green and amber; a
  single-hue blue ramp whose neighbours blended; three cluster hues that
  repeated. The validator's adjacent-pair result for the final sequence is
  recorded in `palette.ts`.
- **Career Pathways bar: one hue, interleaved.** The seven segments draw
  from the 7-step blue ramp, but not in rank order: as a straight light-to-
  dark ramp, neighbouring segments were one step apart and blended (direct
  feedback: "education and skilled trades are blending together").
  Alternating ends of the ramp puts three or more steps between any two
  adjacent segments, a 2px surface gap separates them (dataviz mark spec),
  and the legend dots use the same mapping. Alternative: seven distinct
  hues. Passes distinguishability, breaks the one-hue rule set the same
  day.
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

### 2026-09-25: School year map and Reviews approved (v2 Overview)

- **Progressive disclosure (25 Sept 2026, later the same day).** The
  school year map moved to the Milestone Tracker only ("let's not show
  the grid in two places"); the Overview shows "My Plan by grade", one
  line per grade that opens the tracker. Alternative: keep the map here
  and drop it from the tracker; the tracker is where the counselor acts
  on a step, and the Lead Counselor's Overview has no map at all, so the
  tracker is the one place both counselor roles reach it.
- **The Academic Readiness bars are gone; the school year map sat
  there first, now the grade lines do.** The bars measured "% approved" for College List and FAFSA,
  which the reference marks Not Applicable in Grades 9-11, so three of
  four grade columns rendered empty (direct report: "i see empty graphs
  in overview"). The map (`v2/PlanMap.tsx`) shows every grade's My Plan
  by season with a completion ring per cell and opens the Milestone
  Tracker at that grade. Alternative: keep the bars and hide
  Not-Applicable series per grade; a grouped chart whose series change
  per column is unreadable. Alternative: copy SchooLinks' Scope &
  Sequence indicator grid; rejected on instruction ("don't make it too
  similar to SchooLinks"), and Dreamari's plans differ per grade, so the
  shared axis is time, not indicators.
- **Career Readiness became Reviews approved** (Career Report and
  Academic Plan only). Both exist at every grade and both are the
  counselor's own decisions, so the chart answers "how much of my review
  work is done per grade". Resume dropped: it has no Grade 9 step.
- **Seeded mid-year progress, v2 only** (`src/lib/counselorSeedProgress.ts`,
  DEMO-ONLY, applied in `counselorReviews.ts`). The captured reference had
  Grade 9 with zero approved reports or plans and Grade 10 with zero
  approved resumes; the overlay moves a deterministic share forward and
  never touches Overdue, Changes Requested or Pending Review. v1 reads
  the untouched roster.

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
- **Worst first by default** (direct feedback: "things needing attention
  surfaced first, based on severity"): At Risk, then Needs Attention, then
  On Track; within a status the Overview's own severity ranking (overdue
  and rejected work before merely not-started), then the least-complete
  roadmap. Alternative: alphabetical with a status filter. That makes the
  counselor do the sort every visit.
- **A flagged row says why.** Under the status chip, anyone not On Track
  shows the one-line reason from their own milestones ("Career Report
  overdue"), the same wording as the Overview's attention strip, so the
  row is actionable without opening the profile.
- **Lead Counselor and School Administrator see a Counselor column and a
  counselor picker**; a School Counselor does not (they see only their own
  caseload, see "Who sees which students" above).
- **Every card has a visible way in** (`CardLink` in chips.tsx: a word
  plus a chevron in a small pill in the card header, visible at rest, in
  the foreground color, never blue; on hover the pill's background and
  border lift and the chevron slides right). Two corrections in-session:
  "don't make the CTAs blue" (blue is spent on data marks and the active
  nav item, so a blue word beside a blue chart read as chart) and "the
  padding that appears on hover is wrong, too tight and overlapping with
  the text, no shape" (the first cut had no padding at rest, so the hover
  fill hugged the letters). Direct question: "make all cards clickable, show the obvious
  chevron ... or is this a bad approach considering the users might be
  older?" Cards do open something, but the affordance is never hover-only:
  older users and touch screens never see hover. So the link is always
  there, and hover (the card beam, the chevron nudge) only reinforces it.
  Rows inside a card stay their own targets, so the card is not itself one
  big button (nested buttons are invalid and confuse screen readers).

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

**25 Sept 2026, v2 rebuilt on roster data** (direct questions: "are we
getting the proper data, have we done the proper hierarchy of information,
is it all readable, understandable, do things align? Is everything on that
screen genuinely valuable? Next-Year Course Plan: the components are
overlapping"). Everything below this block describes the earlier v2 pass;
kept as history.

- **Data: the reference's grade curriculum, scaled to the cohort the role
  sees.** Decided for the demo (direct instruction: "do what's best for the
  demo"). The reference's tracker (`milestoneReadiness.ts`) defines seven
  to eight named milestones per grade with fixed counts for 30 students;
  the roster's own template tracks only three at Grade 9 (the Student
  Profile grid). The roster version was built and rejected: it made Grade
  9 look like three items ("are grade 9 milestones genuinely only these
  3?"). Neither set is Dreamari's real curriculum, a product question for
  the team. v2 keeps the reference's curriculum names and status
  proportions and scales every card to the number of students the signed-
  in role actually has in that grade (largest-remainder rounding so the
  four states sum exactly), so a School Counselor's Grade 9 reads 12
  students, the Lead's 30, and the totals agree with Students. Caveat,
  stated in code: proportions are the reference's, so an approval on the
  Review Queue moves Students and the Overview, not this screen.
- **Four states, one color code:** done (brand blue), in progress (light
  blue), not started (neutral slice: expected for a freshman, not
  alarming), needs attention (the reserved amber, because that is what the
  word means everywhere else on the dashboard). "Not applicable" is not
  drawn.
- **One ring, then bars; worst first** (direct feedback: "I like the one
  ring and the others in bars", and the standing rule "always display what
  needs attention first"). The hero is the milestone furthest behind (needs
  attention weighs double, then not started): a header row (eyebrow with
  the reference's review type, the name, the way in), then the ring with
  its four counts directly beside it; the ring says how far along, the
  rows say how many in each state, nothing said twice. The other
  milestones are one card, worst first, each a row on the raised inset
  surface: name, its outstanding counts in one muted line (amber only when
  someone needs attention), % done, and a four-segment status bar with 2px
  gaps and per-segment titles. Rows open the grade roster. Replaces the
  reference's one ring card per milestone (up to eight, each with a legend
  and a button), and two intermediate v2 shapes the same day (a hero ring
  with a percent-only list, which dropped each milestone's breakdown; and
  a single card of bars with no ring, which lost the "look here first").
- **Summary is four stats in the header row** (students, milestones, %
  done, need attention), replacing the grade card with its "Focus"
  sentence and three stats. The Focus copy was the reference's grade
  description; it explained the grade, not the state of it.
- **Whole school for every role; the Lead Counselor can narrow to one
  counselor.** After the scoping revert (see "Who sees which students")
  the tracker reads the school's grade cohort for everyone. The Lead gets
  the same Counselor picker as on Students and the Review Queue (direct
  question: "Milestone tracker for lead and school counsellor are the
  same?"); picking a counselor scales the curriculum proportions to that
  counselor's students in the grade.
- **Picker aggregates say "All", not "Any"** ("All counselors", "All
  statuses", "All plans"), across Students, the Review Queue and the
  tracker. Direct question: "should it be any or all counselors?" "All"
  describes what is shown; "Any" reads as a search condition.

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

### 2026-09-25: School year map on top (v2)

- **Hero composition, third pass (25 Sept 2026).** Title without the
  eyebrow, the ring and its legend under it, the insight alone in the
  middle behind a hairline, the pill in the corner. Alternative: the
  ring pushed to the far right; on a 2000px card that opened a void.
- **Hero is a ring, not a bar (25 Sept 2026).** The Focus first step's
  four states are arcs of one `SegmentedRing` with done % inside and the
  open counts beside it; the verdict is one action line. Alternative:
  keep the stacked bar; direct feedback asked for "simpler, much more
  cleaner ... with some beauty", and the ring is the mark the tiles and
  the Overview already use.
- **Season tiles carry the student My Plan's season scene; accordions
  are plain and closed by default; the legend sits inside the open
  season (25 Sept 2026).** Three direct instructions in one sitting.
- **Every clickable row shows its affordance at rest (25 Sept 2026).**
  `Go` in chips.tsx: arrow = leaves the screen, chevron = opens here,
  turning chevron = unfolds. Visible without hover because tablets and
  phones have none and the users may be older; hover only adds motion.
- **Pathways wear the app's world colors (25 Sept 2026)**, `WORLD_COLORS`
  from `src/components/app/worlds.ts`, so a world is the same colour on
  Home, Explore and here. The spectral rank order is retired.
- **The four-grade map is gone; the grade tabs pick the grade and the
  grade's three seasons sit as rings above the list (25 Sept 2026).**
  Direct feedback: "the tabs are under the school year map now. The
  school year map is genuinely confusing me ... we already have a grade
  toggle, let's use that." The season rings double as the season picker
  for the accordions below. Alternative: keep the map and move the tabs
  above it; two grade controls on one screen is the confusion, not the
  order.
- **Seasons are accordions (25 Sept 2026).** One season open at a time,
  the Focus first step's season by default, each closed season keeping
  its summary in the header, the same shape as the student's own My Plan.
  Alternative: all three seasons open (the previous build); nine rows of
  bars at once was "everything thrown at the user".
- **The map leads the tracker and is its navigator.** Four grades by
  three seasons, a ring per cell, the active grade highlighted; picking a
  cell selects that grade for the hero and the step list below. The
  segmented grade control stays for keyboard and screen-reader users.
  Alternative: a separate "School" screen for the map; the tracker is
  where a counselor acts on a step, and the map is how they choose which
  grade, so they belong together. Alternative: per-step rings like
  SchooLinks; 30-plus rings on one screen is the wall the map avoids.

## Student Profile casefile mocks (v2, 25 Sept 2026)

Built on request from the SchooLinks staff dashboard, DEMO-ONLY
(`src/lib/counselorCasefile.ts`, `v2/Casefile.tsx`):

- **Plan sign-off**: three parties, student from the Academic Plan
  milestone, counselor signs here, guardian invited here. Alternative:
  hide the guardian until an account exists; showing the row is how the
  product gap gets decided.
- **To-dos**: counselor-assigned tasks with due dates and an overdue
  state. Alternative: fold into My Plan steps; a to-do is ad hoc and the
  counselor's own, a step is curriculum.
- **Check-ins**, folded: four words from Dreamari activity as a proxy,
  with the honest line that a real check-in needs a student-side prompt.
- **Reports, Schedule**: cadence, day, recipients per template; the
  Scheduled list is what a delivery job would run.
- **Batch sends (25 Sept 2026)**: the Productivity Suite's Group
  Message tool only, an audience by grade, status and pathway or a
  hand-picked list, one composer for a message, reminder or to-do. Tick
  boxes on the Students table were built first and removed the same
  hour on instruction ("the batch thing should be in Productivity Suite
  not in the Students tab itself"): Students stays the place to find
  and open one student. Alternative: batch letters too; rejected on instruction, they
  are personal. Alternative: only Connect announcements; those reach a
  grade, not a hand-picked set or a filtered audience.
- **Readiness card on the Overview (25 Sept 2026)**: Maisha's five
  readiness measures as one row each over the grades they apply to,
  replacing two bar charts that rendered empty columns for Grades 9-11.
- **Productivity Suite back in the menus**: the batch workspace (many
  students, one tool); the profile Drafts card is the one-student
  version. Alternative: profile only (Usman's note); it made the batch
  job eight clicks per student.

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
- **25 Sept 2026 pass under the v2 budget.** Header stats (pending,
  overdue, due in 2 days) in the same header language as the Milestone
  Tracker, replacing the "Pending (16)" caption. Queue cards are two lines
  on the raised inset surface (name; milestone · grade; the due line with
  a colored dot and neutral text), the priority pill the only colored
  element; "submitted" moved to the detail pane, where the meta line is
  now "Overdue by 3 days · submitted Sep 21" instead of three dates. The
  list is bounded and scrolls beside the pane. The Lead Counselor gets a
  Counselor picker and the counselor's name on each card (a School
  Counselor's queue has no such control). Reviewed rows use the inset
  surface. Alternative: keep the earlier three-line cards. Sixteen cards
  each with a red due line read as a wall of alarm; one pill per card
  says the same.

**25 Sept 2026, later the same day: the attachment opens as a centered
document, not an inline expand.** Direct feedback: "in the counselor
connect etc where there are document previews, please open the document
in a central document preview like you would for pdfs, etc. Mock those
up too to look realistic." Review Queue is the one screen with
attachments today (Counselor Connect has none yet -- questions,
announcements and groups carry no files). The new `DocumentPreview.tsx`:

- **Chrome matches this app's own established modal convention**
  (`ResumeModal`'s "overlay" presentation in resume/ui.tsx): a `Portal`
  (escapes `<main>`'s stacking context), a backdrop button that closes on
  click, `role="dialog"`, `aria-modal`, Escape-to-close. A dark toolbar
  (filename, size, page count, Download/Print/Close) over a darker
  viewer surface, with a white page centered in the middle -- the exact
  relationship every real PDF viewer uses, and deliberately NOT
  re-themed to the app's own dark mode, because a real PDF never is.
- **The page itself is realistic, not three bullet lines.** Each
  milestone type gets its own layout built from the student's own
  seeded data: Career Report (top matches with bars, pathway, cluster,
  engagement), Resume (education, activities and experience as bullets,
  skills, a computed class year), Academic Plan (an actual four-year
  course table, the current grade row tinted), College List (three
  colleges sampled from the app's own `COLLEGES` catalog, tagged
  Reach/Target/Safety by admit rate), Financial Aid (a FAFSA worksheet
  grid with dependency status, household size, an estimated EFC, an
  "awaiting review" banner). All share `--paper`/`--ink` tokens, the
  same set `ResumeDocument.tsx` and `CareerReport.tsx` already print
  with, so paper reads as paper regardless of the dashboard's theme.
- **Alternative considered:** keep the inline expand and just improve
  its copy; rejected, because "look realistic like a PDF" is a shape
  request, not a wording one -- a plain-text card inside the row can't
  read as a document no matter what it says.
- Chip changed from "Hide/View" with a chevron to a plain "View" with an
  eye icon, since there's no in-place expanded state to hide anymore.

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
- **25 Sept 2026 pass under the v2 budget.** The chart is capped at 720px
  (its SVG text scales with width; full-bleed at 1100px it read as a
  poster with 18px axis labels) and a verdict column sits beside it: the
  leading category as a big percent ("72% Approved · 87 of 121") and, only
  when non-zero, the trailing category that needs something ("5 Overdue")
  in its own color. Axis rounds to the next 10 above the tallest bar, not
  the roster size (ticks read 121 / 91 / 61 before). Category labels are
  capitalised. Bug fixed: the Career Pathway filter listed the student
  app's 15 interest worlds, none of which is a roster pathway, so every
  choice emptied the report; it now lists the roster's seven pathways.
- Not changed: the nine report taxonomies, the CSV/PDF exports, the Summary
  by Grade table.

## Counselor Connect (v2)

25 Sept 2026 pass under the v2 budget. Data (three announcements, fifteen
questions, ten groups) is the reference's, verbatim.

- **Opens on Questions, with the open count on the tab.** The reference
  opens on Announcements; the tab with work in it is Questions (standing
  rule: what needs attention first). Tabs read "Questions · Announcements
  · Groups"; three header stats say need a reply / in progress /
  answered.
- **Questions sorted to act in:** new and follow-up, then viewed and in
  progress, then answered; by date within each. Cards are two lines on
  the inset surface (avatar, name, "Grade 11 · Career Exploration · Sep
  14", the status pill, two lines of the question). Color only where the
  counselor owes something: new and follow-up amber, viewed and in
  progress light blue, answered neutral. Replaced: red "New" on every
  fresh question, green on every answered one, and cards in reference
  order.
- **Detail pane leads with the student, one meta line**, the question,
  the reply box, "Send reply" and "Mark resolved". Replaced the four-row
  metadata grid (Student / Category / Submitted / Related Milestone) that
  restated the card.
- **Announcements:** "Grade 12 · Sep 10" on the title line, "87% read" in
  the foreground color, tag chips without the "Related:" prefix.
- **Groups are one card of rows, most active first** (name, "142 members
  · 87 posts · active Sep 15"). The reference's ten description cards
  restated each group's name in a sentence; dropped. Alternative: keep the
  cards and shorten the descriptions. Ten cards for ten names is the
  wrong form when a name is the whole content.

## Career + College Insights (v2)

25 Sept 2026 pass under the v2 budget. Data is the reference's, verbatim.

- **Recommendations are the hero: one stat, one action each.** The
  reference gave each of the three stats three bullet actions and an
  emoji, twelve lines of advice on every visit; v2 keeps the stat and the
  first action. The other two actions stay in data for a later "more"
  affordance. Alternative: keep all three and collapse. A collapsed list
  on a screen meant to be glanced is a list nobody opens.

**25 Sept 2026: the other two actions are reachable again.** Direct
content audit ("have we removed content from the v1/Replit?") found the
first cut's "later 'more' affordance" was never built -- the code's own
comment said so ("kept for a later affordance ... but is not rendered").
Fixed: each tile now shows its first action plus a quiet "+2 more" that
expands to the reference's other two bullets in place, so all three
survive and the default view stays one line per tile.
- **The four ranked lists are always bars.** The reference's Chart / List
  toggle only hid the bar; removed. The lede under each title ("Careers
  most frequently saved to student profiles") restated the title;
  replaced by a "top 10" unit. Titles shortened to nouns ("Saved
  careers", "Saved majors"). The colleges list drops its decorative emoji.
- **Career-fair note is one line plus its chips.** The reference's
  paragraph named the same three clusters the chips already name.

## Productivity Suite (v2)

25 Sept 2026 pass under the v2 budget. Draft copy is the reference's.

- **Tools are a row of tabs, not a side column.** Same fix as Student
  Progress: five names do not need a permanent 300px column beside the
  form. The card takes the full width.
- **One sentence per tool**, the first of the reference's description
  (which ran to three sentences each), with the tool's sub-line beside
  the title.
- **Student and letter type are `Listbox`es in one row with the button;**
  the student picker lists the whole roster by name, not the first 30.
  The "You are always in control" banner and the repeated helper
  paragraph are one muted line under the button: "A first draft from the
  student's Dreamari data. Review and edit before you use it."

**25 Sept 2026, later the same day, redesigned again** (direct report:
"the Productivity Suite is the worst UI right now, lots of long copy,
not looking like a proper workspace tool. How can we improve this?").
Two causes, both fixed at the cause rather than trimmed further:

- **The one-sentence description above is gone entirely.** The icon,
  the tool's name and its short sub-line (already 2-6 words, e.g.
  "Pre-meeting one-pager") already say what the tool is for; a workspace
  tool does not caption its own toolbar. Alternative: shorten the
  sentence further; even one clause read as an explainer no other tool
  in this dashboard carries.
- **The tool switcher is a left rail at `lg` and up, not a horizontal
  row of full names.** It is the exact active/inactive language the
  app's own sidebar nav already uses for its own current item (a quiet
  row, a tinted pill and a primary-coloured icon when selected, in
  `SidebarNav`, shell.tsx) -- so the Suite now reads as a tool with its
  own tool list, the same idiom as the rest of the app, instead of a
  form with a stack of buttons above it. Below `lg` the horizontal chip
  row stays: there is no room for a persistent rail on a phone, and nav
  items compress worse than tool switches do at that width. Alternative:
  icon-only rail with tooltips; rejected, the older-user/no-hover
  affordance rule this dashboard already follows elsewhere means the
  label should stay visible at rest, and six short labels fit a 228px
  rail without truncating.
- **A draft tool always shows its editor pane, even before Generate is
  pressed.** A dashed empty state ("Generate a draft, or write your own,
  to fill this in.") now occupies the space a blank card used to leave
  under the button row, so the workspace looks intentional mid-task
  rather than half-built. Group Message and Students Needing Attention
  never show it -- their own body (the composer, the ranked list)
  already fills the card.

**25 Sept 2026, same session: is a rail next to the app's own sidebar
good UX?** Direct question after the redesign shipped. Answer given and
acted on: nested left-side navigation is a well-established pattern
(VS Code's activity bar plus explorer, Slack's workspace rail plus
channel list, Notion's sidebar plus page tree) and not inherently a
problem -- the two rails here already read as different things on
inspection, since the app's own sidebar is the page's full-height frame
(logo top, account footer bottom, no border) while the tool rail is a
bordered card scoped to the page content, starting and ending with it.
The one real risk was that both use an identical active-row treatment
(tinted pill, primary-colored icon), which could still read as
"duplicated nav" at a glance before that structural difference is
noticed. Fix: a small "TOOLS" header label above the rail's rows, the
same device Slack's channel list and VS Code's explorer panel both use
for exactly this -- it makes the scoping explicit without adding a
second visual language.

## Platform Engagement (v2)

25 Sept 2026 copy pass only; the reference's numbers are unchanged. Tile
labels are two words ("Active this month", "Logins per student") instead
of a label plus a clause; card titles carry their qualifier as a muted
unit ("Logins by month · Lincoln High School, this academic year"); the
intervention card is "Students to check in with" with one closing count.
The second line series is a light step of the blue ramp, not green.

## My Impact (v2)

**Rebuilt later the same day** after "My Impact etc are especially
cluttered ... a huge overload of information at once with so much copy":
the report answers one question (did this period move the numbers?), so
the hero is the four outcomes against their targets with one verdict, then
one row of the counselor's activity, one of student engagement, grades as
bars that open the roster, and ASCA as three columns of two short lines.
Dropped: the pathway bar list (the Overview donut shows it), the milestone
stat tiles (folded into the scorecard), and the two sections that
restated the page. School Impact is the same report headed by the school
with a by-counselor card. The earlier pass, below, is history.

25 Sept 2026 pass. This is the printable report a counselor hands a
principal, so it keeps its sections; what changed is that every number is
said once.

- **Removed "Notable Achievements" and "District Compliance Summary".**
  Both restated numbers already on the page (the achievements list was
  seven sentences, each wrapping a stat shown above; the compliance tiles
  repeated the milestones card). Alternative: keep them for a printout.
  A principal reading the printout reads the same figure three times.

**25 Sept 2026: two figures that were genuinely gone, restored.** A
direct content audit against v1's Notable Achievements list found each
bullet's underlying number does survive somewhere on the page except
two: the "well above the school average of 71%" comparator on the
on-track rate, and the count of seniors with an application underway
(distinct from having a postsecondary plan on file). Both are back --
the first as a note beside on-track rate in Outcomes, the second folded
into the Activity card's own fact line, the same place "Reviews average
2.1 days" already lives. The footer's "Confidential -- for authorized
personnel only" line, also dropped, is back too.
- **Senior plan compliance uses the reference's definition** (seniors
  with a declared plan), the same figure the School Administrator
  Overview shows; the earlier fork computed it from application
  milestones and read 40% against the reference's 87%.
- **One color rule:** blue tiles and bars; a number wears amber only when
  it misses its target. The reference painted every tile a different hue
  and every target a green or red.
- **Sentences under cards became the card's sub-line** ("Plan reviews
  average 2.1 days against the district's 5-day standard"), the
  engagement disclaimer is gone, the footer is one line.
- ASCA cards kept as the report's substance, on the inset surface, with
  shorter bullets.

**25 Sept 2026, tabbed** (direct instruction: "for My Impact, we can do
the tabbed version and have the export just compile everything together
when that is needed. So its easy on UI load and the report brings
everything together when exported"; the same day, more generally: "let's
do tabbed UI to reduce cognitive load wherever necessary. ONLY wherever
necessary"). Outcomes stays outside the tabs -- it is the one number a
counselor reads every visit, not a section to page through. Everything
else (Activity & Engagement, By Grade/Counselor, ASCA) is a `Segmented`
tab, one rendered at a time, the same tab control the Milestone Tracker's
grade picker uses. Print and Principal report both call `window.print()`;
a `hidden print:block` container renders every section stacked together
for that path, built from the exact same section-renderer functions the
on-screen tabs call, so the printed/shared report and the screen can
never show different numbers. Share stays unwired (still no export
service; unchanged from the earlier pass). A side effect worth noting:
the reference's "By Grade" and ASCA columns used to share one grid row
for the School Counselor's report (paired only because they needed a
second column to fill); now each has its own tab, which also removed the
one place ASCA was rendered twice for School Impact (once paired with By
Grade for `mine`-scope logic that never applied to `scope="school"`,
once again unconditionally below) -- a de-duplication, not a visual bug
fix, since the second render was already gated correctly.

**Why not tab other screens the same day:** surveyed against the same
"ONLY wherever necessary" instruction. Counselor Connect already tabs
Questions / Announcements / Groups. Settings already folds four of its
five cards behind a disclosure summary. The Milestone Tracker already
tabs by grade and folds each grade's seasons behind an accordion. The
Student Profile already folds Drafts and Check-ins and opens one My Plan
season at a time. Career + College Insights' four cards each open with
five rows and a "Show all" rather than a full tab switch, because a
counselor typically wants to glance across all four categories (careers,
majors, colleges, simulations) in one visit, not pick one. The Overview
is deliberately never tabbed: it is the one screen meant to be scanned
whole, attention-first, in a single glance.

## Settings (v2)

25 Sept 2026 pass. Role is the app's `Listbox` (guardrails: never a
native select). "Role Permissions" shows only the chosen role's list,
titled "What School Counselor can do", instead of all four roles' lists
at once; three of the four were never the reader's.

_Sections for the remaining screens ( Career + College Insights, Productivity Suite, Platform
Engagement, My Impact, Settings) get added here as each is worked on._


## 2026-09-25: Direct demo entry

User requested removal of counselor login/signup. The prototype now opens directly at `/counselor`, including on fresh browsers. Legacy login/signup routes redirect there; simulated auth forms and desktop/mobile sign-out controls are removed. Local profile and role preferences remain. This is DEMO-ONLY; production authentication is not specified by this change.
