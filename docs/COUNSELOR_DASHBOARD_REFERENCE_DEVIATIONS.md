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

---

## Overview

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

---

_Sections for the remaining screens (Review Queue, Student Progress,
Counselor Connect, Career + College Insights, Productivity Suite, Platform
Engagement, My Impact, Settings) get added here as each is worked on._
