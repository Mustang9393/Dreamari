# Counselor Dashboard v2: every state, every screen

For the backend integration. The demo never reaches most of these states
(its data is seeded and synchronous), so each one is previewable on demand
and specified here with its exact copy. Source of truth for the
whole-screen states is `src/components/counselor/v2/states.tsx`
(`SCREEN_EMPTY`, `LoadingState`, `ErrorState`, `StateGate`); in-screen
states live in each screen's file and are quoted below verbatim.

**Preview any state:** open a v2 screen and append `?state=loading`,
`?state=empty` or `?state=error` (DEMO-ONLY; `readStateParam()` in
`states.tsx`). Example: `/counselor?view=review-queue&v=2&state=empty`.

**Treatments** (from `docs/COMPONENT_STATES_PLAYBOOK.md`): loading is a
skeleton in the cards' own shape (three pulsing glass cards, `aria-busy`),
never a spinner over the page. A whole-screen empty is playbook tier 1: a
bordered card, one bold line, one muted line, at most one CTA. An error is
one line, one muted line and Retry (re-requests the view). In-screen
empties (a filter that matched nothing, a list with no rows) are one plain
muted line, no border, no icon.

## Contract the backend fills

- **Loading:** while the screen's data request is in flight, render
  `LoadingState`. The gate is `StateGate` in `CounselorApp.tsx`; wire it
  to the request state instead of the `?state=` param.
- **Error:** any failed request renders `ErrorState`; Retry re-requests.
  Partial failures (one card of several) are not modelled: the screen is
  one request.
- **Empty:** the whole-screen empty renders when the request succeeds with
  no rows for the role's scope (see per-screen definition). Everything
  else is in-screen.
- **Writes** (Approve, Request Changes, Undo, notes, replies, posts,
  announcements, groups, settings save, report generation): today they
  resolve synchronously. The backend should keep the optimistic update the
  UI already performs and, on failure, revert it and show the in-screen
  error line "Could not save. Try again." next to the control (not yet
  built, since nothing can fail in the prototype; the copy is fixed here).

## Per screen

Role column: SC School Counselor, LC Lead Counselor, SA School
Administrator, DA District Administrator.

### Overview (all roles; a different screen per role)
- Data: the school roster (`useReviewedRoster`), seeded siblings for DA.
- Whole-screen empty: "No students yet" / "Once students are enrolled and start their plans, the school's status, pathways and attention list appear here." CTA Students.
- In-screen: attention strip with nobody at risk: "Nothing needs attention under the current filters."; a grade filter that leaves 0 students: cards render 0 counts and 0% rings (no crash; verified with the Grade filter); SA's seniors-only rows under a non-senior grade filter: value "n/a"; LC with fewer than two caseloads: verdict still names the one.
- Edge: the trend deltas (+2 pts, +4 pts) on SC's donuts are hand-authored; the backend supplies real month-over-month or removes the chip.

### Students (SC, LC, SA)
- Data: roster; LC and SA add a Counselor column and picker; an optional `stepFilter` from the tracker narrows to students who have not done one My Plan step (chip "Not done: [step]", X clears it).
- Whole-screen empty: "No students enrolled" / "The roster fills as students join Dreamari at your school."
- In-screen: filters return nothing: "No students match these filters."; a student with no pathway shows "Undeclared"; Undecided plan renders muted; long names wrap in the card list, truncate in the table cell (title on hover is not provided, the profile has the full name).
- Edge: pagination at 20; last-active dates format "Jan 5"; sort by status is severity, ties by roadmap.

### Student Profile (SC, LC, SA)
- Data: one student by id, notes from localStorage, My Plan readings and "On Dreamari" tiles from `studentSignals.ts`, the Drafts card (formerly Productivity Suite).
- In-screen: a step awaiting the counselor shows Approve (writes `counselorReviews`); a student-reported step reads "Not tracked yet"; a live student with nothing done reads every in-app step "Not started".
- Not found: "Student not found." with "Back to Students".
- In-screen: no career matches: "No saved matches yet."; nothing due in a plan window: "Nothing due in this window."; no notes: "No notes yet."; no "needs you" items: the line is omitted, not shown as "none".
- Edge: a grade with fewer required milestones shows only those (3 / 5 / 6 / 11); a student with every milestone approved shows the plan card empty across all windows.

### Milestone Tracker (SC, LC)
- Data: the grade's My Plan steps (`gradePlanData.ts`) with each student's status from `studentSignals.ts` (live stores for the live student, the reference's counts for seeded ones); LC can narrow to a counselor. Rows open Students with `stepFilter` set.
- Backend: in-app steps need the student's real events (saves, completed runs, resume sections, report shares); counselor-verified steps read `counselorReviews`; student-reported steps need My Plan's checkbox state persisted (today "Not tracked yet", row disabled).
- Whole-screen empty: "No milestones to track" / "Milestones appear once a grade has students and a curriculum assigned."
- In-screen: no students in the grade (or in the chosen counselor's grade): "No Grade N students." / "No Grade N students on this counselor's caseload."; a step with nothing outstanding: "Everyone is done"; a student-reported step: "Student reports this; not tracked in the app yet" and no drill-through.
- Edge: a grade with one milestone renders the hero only (the "All milestones" card is omitted when there is nothing else).

### Review Queue (SC, LC)
- Data: every Pending Review milestone in the roster, due dates seeded per item; decisions persisted (`counselorReviews.ts`).
- Whole-screen empty: "Nothing to review" / "Submissions land here when students share work for approval." CTA Students.
- In-screen: no pending under the current filter: "Nothing pending review right now." with the pane hidden; nothing selected: "Select a submission to review."; a decision undone returns the item to its due-date position.
- Edge: header counts are 0 / 0 / 0 when empty; the attachment preview is built from student data until a file URL exists; on phones the pane is a bottom sheet with Close.

### Student Progress (SC, LC)
- Data: roster, filtered by the header grade, a pathway, and (LC) a counselor.
- Whole-screen empty: "No progress data yet" / "Reports build from student milestones once the first ones are recorded."
- In-screen: a table-only report: "{Report} has no chart; the grade summary below is the report."; filters that leave 0 students: chart shows 0 bars, table shows 0s.
- Edge: axis rounds up to the next 10 above the tallest bar; CSV export is disabled for table-only reports.

### Counselor Connect (SC, LC)
- Data: reference questions, announcements and groups; replies, posts and new items are session state.
- Whole-screen empty: "No conversations yet" / "Questions, announcements and groups appear once students are active." CTA Students.
- In-screen: all questions answered: the list is empty and the header stats read 0 / 0 / N (the pane keeps the last selection); an answered question's pane: "You have replied." or "Resolved."; a new announcement starts at 0% read; a new group starts at 0 members and 0 posts; a group with no posts renders an empty feed under the composer.
- Edge: a question from a name not on the roster renders without a profile link.

### Career + College Insights (SC, LC)
- Data: reference lists (seeded); no live source yet.
- Whole-screen empty: "No insights yet" / "Saved careers, simulations, majors and colleges show once students start exploring."
- In-screen: a list shorter than ten renders as many as exist; a list with all zeros renders bars at 0.
- Not built: rows do not drill down (no career id exists in the roster); when the backend supplies ids, rows should open Career Detail.

### Productivity Suite (SC, LC)
- Data: roster for the student picker and drafts; notes store for Save to notes.
- Whole-screen empty: "No students to draft for" / "Drafts are built from a student's plan; add students first." CTA Students.
- In-screen: Students Needing Attention with everyone on track: "Everyone is on track."; Generate is disabled until a student is chosen; Save to notes reads "Saved to notes" after saving.
- Edge: drafts for a student with no matches use "their chosen pathway"; the clipboard call is guarded for browsers without it.

### Platform Engagement (SA, DA)
- Data: the reference's fixed months for Lincoln; DA adds seeded schools.
- Whole-screen empty: "No activity recorded" / "Logins and activity show once students use Dreamari."
- Edge: fewer than two months renders a single point; months are the reference's values shifted to this year's labels.

### My Impact (SC) and School Impact (LC)
- Data: roster, questions, announcements; targets from `counselorOrg.ts`.
- Whole-screen empty: "Nothing to report yet" / "Your impact report builds from milestones, reviews and replies over the period." (school: "The school's impact report...").
- In-screen: seniors-only outcomes with no seniors: "n/a"; a grade with no students is omitted from By grade.
- Edge: "Reviews average 2.1 days" and the reporting period are fixed copy until the backend supplies them; Print uses the browser; Share and Principal report are not wired (no export service).

### Settings (all roles)
- Data: the account record (`counselorAccount.ts`), roster for the caseload card.
- Whole-screen empty: "No account" / "Sign in to manage your profile and preferences."
- In-screen: Save disabled until a field changes; "Saved." for two seconds after saving; the permissions card follows the role in the form before it is saved.
- Edge: changing the role while on a screen the new role lacks redirects to Overview after save.

### Counselors (LC, SA)
- Data: roster split by the seeded caseloads.
- Whole-screen empty: "No counselors assigned" / "Caseloads appear once counselors are assigned to students."
- In-screen: no students under the current filters: "No students under the current filters."; a single counselor renders one row and no size comparison.

### Readiness (SA, DA)
- Whole-screen empty: "No readiness data" / "Targets are measured once students have plans and milestones."
- In-screen: a target with no measurable rows (no seniors anywhere) omits its card; seniors-only measures show only rows that have seniors.

### Reports (SA, DA)
- Whole-screen empty: "Nothing to report" / "Reports build from live readiness data once students are enrolled."
- In-screen: nothing generated: "Nothing generated yet."
- Edge: CSV values are today's numbers; a generated list is session-only until the backend stores reports.

### Schools (DA)
- Whole-screen empty: "No schools in the district" / "Schools appear once they are set up on Dreamari."
- Edge: one school in the district renders one row and every card's verdict names it; seniors-only targets drop out when no school has seniors (grade filter).

## Cross-cutting

- **Role without the screen:** the URL redirects to that role's Overview (`CounselorApp.tsx`, `RoutedView`).
- **Signed out:** every `/counselor` route redirects to `/counselor/login`.
- **Unknown view:** renders Overview.
- **Long names and labels:** rows wrap their note under the name below 640px; table cells truncate; chip rows scroll sideways with a fade and peek instead of clipping.
- **Zero and 100%:** bars render at 0 and 100 without overflow; verdicts read "Every ... is on target" when nothing is below target.
- **Light mode:** every surface, glow, chart gridline, label and nested row uses tokens that flip (`--inset-bg`, `--inset-border`, `--inset-shadow`, `--foreground` mixes); nested rows are always lighter than their card.
- **Devices:** 12-column heroes stack below 1280px; master-detail panes become a bottom sheet below 1024px; tables become card lists below 1024px; the content column caps at 1400px on wide displays.
