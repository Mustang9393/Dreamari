# Counselor Dashboard (v2) — spec

Six-part format agreed with Usman (Who, Use cases, Journeys, Rules, Data,
Acceptance). This is the living spec; the design is `src/components/counselor/v2/`
on main, and every change to either gets a dated line under Decisions.
Companion docs: `docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md` (why each
change beat its alternative), `docs/COUNSELOR_V2_STATES.md` (every state),
`docs/reference/schoolinks-counselor-notes-2026-09.md` (persona reference).

## 1. Who

Four roles, set in Settings (one per real account; the demo's bottom pill
switches for review):

| Role | Sees | First question |
|---|---|---|
| School Counselor | Overview, Students, Milestone Tracker, Review Queue, Counselor Connect, Career + College Insights, My Impact, Settings | Who needs me today, and which step are they on? |
| Lead Counselor | the above plus Counselors and School Impact (instead of My Impact); a counselor filter on Students, Tracker, Review Queue | Which counselor and which grade need support? |
| School Administrator | Overview, Readiness, Students, Counselors, Platform Engagement, Reports, Settings | Is the school on target? |
| District Administrator | Overview, Schools, Readiness, Engagement, Reports, Settings | Which schools are behind, is the platform used? |

Everyone sees the whole school's students (caseload scoping exists behind
`SCOPE_COUNSELOR_TO_CASELOAD`, off). A URL a role lacks redirects to that
role's Overview. Persona notes from SchooLinks: the counselor's unit of work
is the student who has not done the assigned step; aggregates exist to
reach that student.

## 2. Use cases

1. See which students need attention today, and why, and open them.
2. See, for a grade, which My Plan step the cohort is behind on, and get
   the list of students who have not done it.
3. Review a submission (career report, plan, resume), approve or request
   changes with a note, undo.
4. Answer a student's question; announce to a grade; run a group.
5. Draft a letter or brief for a student from their own data, edit, keep.
6. Report the period's outcomes to a principal (counselor), the school's
   to the district (lead), a school or district against targets
   (administrators), as a screen and as CSV.
7. Compare counselors' caseloads (lead, administrator) and schools
   (district).

## 3. Journeys

- **Morning:** Overview → attention row → Student Profile → Approve the
  waiting step or Remind → back to Overview (Back returns to the spot).
- **Cohort push:** Milestone Tracker → grade tab → "N not done" on the
  focus step → Students with the "Not done" chip → Message / Remind.
- **Review:** Review Queue (overdue first) → read the message, View the
  attachment in place → feedback → Approve or Request Changes → the item
  moves to Reviewed with Undo; Students, Profile, Tracker and Impact all
  reflect it.
- **Lead check:** Overview (counselors ranked) → Counselors → a counselor
  row → Students filtered to that caseload.
- **Administrator check:** Overview targets → Readiness by grade →
  Reports → CSV.

## 4. Rules

- Attention first, everywhere: lists and rows are ordered by who needs
  the counselor most; copy stays constructive ("needs the most support",
  "Focus first"), never "worst".
- One hue (blue) for data; green / amber / red only for state; glow on one
  hero card per screen; nested rows lighter than their card in both modes.
- Every avatar and name opens the profile; every card has a visible link;
  Back returns to the exact spot.
- My Plan defines the tracker and the profile: in-app steps auto-complete
  from real actions and are never manually ticked; counselor-verified
  steps complete only by the counselor's decision; student-reported steps
  complete by the student's own checkbox.
- A report shared with the counselor is a submission (Pending Review);
  saved or printed is not.
- Targets: 80% on-track, plans on file and senior plans (the reference's
  district target); FAFSA 65% and active students 60% are placeholders
  until the district sets them. Met / within 10 points / further.
- Manual option beside every generated thing (Write my own, Add your own).
- Icon-only controls carry a tooltip; no em dashes in copy.

## 5. Data

- **Student**: id, name, grade, pathway (one of Build's fifteen interest
  worlds), postsecondary intent, status (On Track / Needs Attention / At
  Risk), roadmap %, last active, the eleven milestone statuses, top
  matches, engagement counts, counselor (assignment), portrait.
- **Signals** (`src/lib/studentSignals.ts`): profile built, avatar set,
  interests, subjects, path, GPA, top 3 and focus career, careers saved,
  colleges saved, simulations completed, glossary lessons completed,
  questions asked, resume started / sections / ATS score, report versions
  and shared-with-counselor, experiences logged, dream score, stage.
- **My Plan** (`gradePlanData.ts`): grade → seasons → steps (id, title,
  in-app, counselor-verified, deadline-bound, optional). Step status:
  done / in-progress / awaiting-review / not-started / not-tracked.
- **Reviews** (`counselorReviews.ts`): student id + milestone → Approved
  or Changes Requested, feedback, timestamp. **Notes**: student id →
  text, timestamp.
- **Org** (`counselorOrg.ts`, seeded): counselors and caseloads, targets,
  sibling schools scaled from the home school.
- **School year map** (`v2/PlanMap.tsx`): per grade and season, tracked
  (student, step) pairs, done, done %, students with something still to
  do, steps awaiting the counselor. Cells open the Milestone Tracker.
- **Seeded mid-year progress** (`counselorSeedProgress.ts`, DEMO-ONLY,
  v2 only): deterministic overlay on the captured roster so every grade
  has done, in-progress and not-started work; delete in production.
- **Connect**: questions (student, text, category, status), announcements
  (title, audience, body, read %), groups (name, members, posts, feed).
- Not in the student app yet (backend or product decision): counselor
  assignment, grade and school on a student, submit-to-counselor for
  plans and resumes, announcements and read receipts, groups, questions
  asked per student, logins and active counts, transcript and
  recommendation milestones, guardian party, well-being check-ins.

## 6. Acceptance

- Each role's menu matches the table in Who; a URL outside it redirects.
- Students opens with At Risk first; a flagged row shows its reason; the
  Not done chip from the tracker filters correctly and clears.
- The tracker's rows sum to the grade's student count; a row's "N not
  done" equals the filtered Students count.
- Approving on the profile or queue changes the student's milestone on
  every screen and can be undone.
- Sharing a career report in the student app (same browser) creates a
  Review Queue item; approving it clears it.
- Every screen renders loading, empty and error states from
  `docs/COUNSELOR_V2_STATES.md`; every in-screen empty uses its listed copy.
- Light mode: no white-on-white; nested rows lighter than their card.
- Widths 375, 768, 1024, 1280, 1440, 2560: no horizontal scroll, no
  clipped chips, panes become sheets below 1024.
- `npx tsc --noEmit -p .` and `npx eslint` clean.

## Decisions

- 24 Sept 2026: v1 frozen as the Replit reference 1:1; all change in v2.
- 24 Sept 2026: role menus proposed and built (no external sign-off gate).
- 25 Sept 2026: one blue hue, hero-only glow, no card tints, attention
  first with constructive copy, gradient bars (user).
- 25 Sept 2026: every role sees the whole school; caseload scoping off
  (user: "numbers need to make sense").
- 25 Sept 2026: My Plan drives the tracker and the profile; pathways use
  Build's worlds; Student Progress and Productivity Suite leave the menus;
  drafts live on the profile (Usman's review, user: "do what you think is
  optimal").
