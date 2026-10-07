# Counselor app: personas, pain points, stories, flows, edge cases

Written 7 Oct 2026 for v5 (`/counselor?v=5`) and v6 (`/counselor?v=6`), which share every screen named here except where noted. Sources: Joshua's reimagine brief (`docs/reference/counselor-reimagine-notes-2026-10-07.md`), the SchooLinks staff-side teardown (`docs/reference/schoolinks-counselor-notes-2026-09.md`), the v3 counselor research (29 Sept, carried in `src/lib/counselorMeetings.ts` and `counselorTimeLog.ts`), ASCA's National Model (4th ed.) and the v2 spec (`docs/handoff/specs/counselor-dashboard.md`).

The five questions the whole app answers (Joshua): **What are my students interested in? Who needs my help? What do I need to know to advise them well? How do I prepare for my next meeting? Are my students meeting the requirements that matter?**

Status key used throughout: **Built** (works end to end), **Demo data** (works, data is seeded and tagged `DEMO-ONLY` in code), **Partial** (some of the story), **Gap** (not built).

---

## 1. Personas

### P1. Sarah Chen, school counselor (primary)
- High school counselor, 6 years in. Caseload 121 in the demo; real caseloads run 250 (ASCA's ratio) to 450+.
- Her day is mostly walk-ins, not scheduled meetings. She checks the app in two-minute gaps between students, often on a laptop, sometimes a phone in the hallway.
- Owns: reviews of student work, recommendation letters, transcripts, FAFSA pushes, meetings, notes, family contact.
- Measured by: on-track rate, senior plans, FAFSA completion, ASCA use of time (80% with or for students).
- Quote she would say: "I know who needs me. I just never have time to find out why before they walk in."

### P2. Renee Alvarez, lead counselor
- Counselor with a caseload plus team duties: covers absences, balances caseloads (A to H, I to R, S to Z), reports up.
- Needs: who on the team is behind, handoffs that keep notes, one report for the school.

### P3. Principal (receives, rarely logs in)
- Reads a one-page report, asks "are we on target, and what's next?" Wants it in the inbox, not a dashboard.

### P4. District administrator
- Compares schools against district targets; cares about platform use and compliance.
- Out of scope for v5/v6 screens (v4 keeps the district and school leader views); the reports serve P3 and P4.

### Indirect personas (the app acts on their behalf)
- **Student (Jordan Rivera, Grade 11):** uses the Dreamari student app; books office hours, submits work, saves careers, answers a weekly check-in, asks questions. A minor: never a photo in the counselor app.
- **Guardian (Maria Rivera):** may not speak English; reached by call, text or email; owns FAFSA steps with the student.

---

## 2. Pain points (with the answer in the app)

| # | Pain point | Who | Where the app answers it | Status |
|---|---|---|---|---|
| 1 | Too many students to know who needs me today | P1 | Home "Need you", My Next Conversations; Students sorted "Needs you first" | Built |
| 2 | No time to prepare before a student walks in | P1 | Prepare brief: waiting on you, agenda, Top 3, schools that fit, last note | Built |
| 3 | Walk-ins are most of the day and never get recorded | P1 | Log sheet, Walk-in: one save records the meeting, the note and the minutes | Built |
| 4 | Can't show the principal where my time goes (80/20) | P1, P3 | Auto time logging, Log time, My Impact > Use of Time | Built |
| 5 | Scheduling eats time | P1 | Office hours set once on Profile; Book uses only free slots; calendar "+ Book" | Built |
| 6 | Reviewing without context (why did they send this?) | P1 | Review desk: the student's note, second-try feedback, deadline, status | Demo data |
| 7 | Letters pile up before deadlines | P1 | Documents: due-soonest list, drafting desk, Mark sent | Built |
| 8 | Questions get lost in email | P1 | Messages tab, "Has a question" in reviews | Built |
| 9 | Deadlines sneak up (EA, scholarships, FAFSA) | P1 | Home Closing soon row | Built |
| 10 | Well-being problems surface too late | P1 | Students > Check-ins: reach out first, notes from students | Demo data |
| 11 | Families are hard to reach and contact isn't recorded | P1 | Family on the student page; Log sheet, Family | Demo data |
| 12 | Students say "I like biology" and I don't know the careers | P1 | Explore: subject search, worlds, curated rows, pay by state | Built |
| 13 | Reports are rebuilt by hand every month | P1, P3 | Principal and impact reports with previews; scheduled send | Partial (send is demo) |
| 14 | Analytics show numbers, not who to act on | P1, P2 | Every Analytics measure lists the students behind it | Built |
| 15 | Handoffs lose notes | P2 | Profile > Your Team with caseload ranges and Message | Partial (no transfer) |
| 16 | Dashboards feel like admin software, not Dreamari | all | Student design system, career posters, carousel, video cards | Built |

---

## 3. User stories

Each story: as P1 unless noted. "Where" names the screen; status as above.

### Home: what is happening with my students?
| Story | Where | Status |
|---|---|---|
| See the three numbers that matter (students, on track, need you) and open the students behind each | Home hero | Built |
| Start the day's main job in one click (review queue, or students if none) | Home, Start reviewing | Built |
| Log time without leaving Home | Home, Log time | Built |
| See deadlines closing soon and how many students each affects | Home, Closing soon | Built |
| See the next students to talk to and why | Home, My Next Conversations | Built |
| See what students are saving, by world, as career art | Home carousel / row, world filters | Built |
| See the videos students watch most, with counts | v6 Home, Most watched | Demo data |
| Get "turn interest into opportunity" suggestions | not yet | Gap |
| See most-played simulations | not yet (no play logging) | Gap |

### Students: who needs my help?
| Story | Where | Status |
|---|---|---|
| Find any student fast in a caseload of hundreds, by name or ID | Students search; Prepare search; every picker | Built |
| Filter by grade, status, plan; sort by need | Students > Directory | Built |
| See which milestone the caseload is stuck on, and who | Students > Milestones (rings, open a ring for the list) | Built |
| See which grade needs me | Students > Progress | Built |
| See this week's well-being check-ins and reach out first to students with low answers | Students > Check-ins | Demo data |
| Open one student and see, in order: who, what to do, vitals, then depth | Student page (vitals strip, tabs) | Built |
| See what is waiting on me from one student, with the action on each line | Student page > Overview | Built |
| Contact a student's family and record it | Student page > Family, Log a contact | Demo data |
| Keep notes and see past meetings in one timeline | Student page > Notes | Built |

### Explore: help me advise well
| Story | Where | Status |
|---|---|---|
| Answer "I like biology" with careers where it matters | Explore > Careers, subject search | Built (hand map, `DEMO-ONLY`) |
| Browse careers by world and curated rows | Explore > Careers | Built |
| Switch the whole page to skilled trades | Explore pathway switch (all tabs) | Built |
| Browse schools by value, finish rate, open admission, close to home | Explore > Schools | Built |
| See pay by state, top paying, most openings, fastest growing | Explore > Pay by state / Labor market | Built (openings and growth demo) |
| Compare two states | not yet | Gap |

### Prepare: get me ready for my next meeting
| Story | Where | Status |
|---|---|---|
| See my week as a calendar and open a meeting's brief | Prepare > This Week | Built |
| Book a student into my next free slot, from anywhere | Book (Prepare, calendar day, student page, Needs a Meeting, Check-ins) | Built |
| Log a walk-in with a note in under 15 seconds | Log a walk-in (Prepare, Check-ins, student page) | Built |
| See who needs a meeting and has none booked | Prepare > Needs a Meeting | Built |
| Get a one-page brief: why they booked, what's waiting, agenda, Top 3, schools that fit, last time | Prepare brief | Built |
| Close a meeting with notes that land on the student's profile and in my time | Prepare brief, Complete meeting | Built |
| Set my office hours once and have booking follow them | Profile > Office hours | Built |

### Workspace (inside Prepare by default): clear what students wait on
| Story | Where | Status |
|---|---|---|
| Review a submission with the document, the student's note and context on one screen, no scrolling | Reviews | Built (notes demo) |
| Approve or ask for changes, undo, move to the next | Reviews | Built |
| Answer student questions | Messages | Built |
| Write a recommendation letter from a real letterhead draft, sign, print | Documents > drafting desk | Built |
| Send transcripts | Documents | Demo data |

### Analytics: are students meeting the requirements that matter?
| Story | Where | Status |
|---|---|---|
| See each requirement area as measures, its trend, by grade, and the students not there | Readiness, Postsecondary, Career & WBL, Risk | Built (trends demo) |
| See how students use Dreamari | Dreamari Engagement | Demo data |
| See where graduates went | Outcomes | Demo data |
| See my own impact: use of time, targets, my work, ASCA, benchmarks | My Impact | Built (benchmarks demo) |
| Preview and print the principal report and the full impact report | My Impact, report thumbnails | Built |
| Send a report on a schedule | My Impact, Send a report on a schedule | Partial (saved, not sent) |

### Lead counselor (P2)
| Story | Where | Status |
|---|---|---|
| See who covers which students | Profile > Your Team | Built |
| Hand a student to a teammate with notes | not yet | Gap |
| See team-wide progress by counselor | v4 School Impact only | Gap in v5/v6 |

### Principal (P3)
| Story | Where | Status |
|---|---|---|
| Receive a one-page brief on a schedule | Scheduled report | Partial |
| Read targets met, the next focus, and compliance | Principal report | Built |

---

## 4. User flows

Each flow lists the steps a counselor takes in the app today. Every step was checked on screen (v5, 1440 and 375).

**F1. Morning triage (2 minutes).** Home → read Need you and Closing soon → Start reviewing (or open the first student in My Next Conversations) → review → next.

**F2. Prepare for a booked meeting.** Prepare > This Week → click the meeting → brief (why they booked, waiting on you, agenda) → add an agenda point → meet → notes → Complete meeting (notes to profile, time logged).

**F3. Walk-in.** Any page with Log a walk-in (or Home > Log time > Walk-in) → type the name → pick About and length → note → Save (meeting, note, time). Toast confirms.

**F4. Book a meeting.** Book from Prepare, a calendar day ("+ Book" preselects that day), the student page, Needs a Meeting or Check-ins → pick a free slot (only office hours, never a taken one) → optional topic → Book. The calendar shows it.

**F5. Review queue.** Prepare > Reviews (or Home > Start reviewing) → read the page (fits the screen) and the student's note → Approve, or write feedback and Ask for changes → next item loads; Undo is one tap.

**F6. Recommendation letter.** Prepare > Documents → Write on the soonest-due letter → Generate or Write my own → edit on the page → sign → Mark sent (time logged) or Print.

**F7. Check-in follow-up.** Students > Check-ins → Reach out first (lowest answers first, note shown) → walk-in or book icon on the row.

**F8. Family contact.** Student page > Family (phone, email, language) → Log a contact → Call / Email / Text / In person, length, note → Save (note on profile, indirect time).

**F9. "I like biology" in a meeting.** Explore > Careers → type "biology" → careers in Health, Science, Farming worlds → open a career → back. Skilled trades switch narrows everything.

**F10. Report to the principal.** Analytics > My Impact → Principal report thumbnail → preview → Print or save PDF, or Share (email or copy) → optionally Send a report on a schedule.

**F11. Log time outside meetings.** Home > Log time → pick a preset (or type) → length → counts as → Save. Shows in My Impact > Use of Time.

**F12. Set office hours.** Avatar → Profile → toggle days, set from and to → the card preview, calendar and booking slots update.

---

## 5. Edge cases and how each is handled

| Case | Handling | Status |
|---|---|---|
| Caseload of 400+ | Search by name or ID everywhere; lists cap with Show all; no dropdown of names | Built |
| Empty review queue | "All caught up" with Dreamy | Built |
| Nobody needs a meeting | "Everyone who needs you has a meeting." | Built |
| No office hours set | Book shows "Set your office hours in Profile" with a link instead of slots | Built |
| Booking a past time or a taken slot | Slots start after now and skip taken ones | Built |
| Student with no Top 3, no notes, no SIS flags | "No Top 3 yet", "No notes yet", "No flags" | Built |
| Student with no guardian on file | "No guardian on file" in Family | Built |
| Guardian who doesn't speak English | Language shown on the contact | Demo data |
| Check-in not answered | "Not answered yet this week" | Built |
| Several low check-in answers | Marked "Reach out today" and listed first | Built |
| Harmful-language alerts in check-in notes | SchooLinks tracks alert words and emails staff; needs a district policy and a server | Gap |
| Mistaken decision on a review | Undo | Built |
| Mistaken walk-in or time entry | Remove from My Impact > Use of Time entries | Built |
| Second try on a submission | Shows what you asked last time | Demo data |
| Long names and long career titles | Truncate in rows; posters step type size | Built |
| Phone use between classes | Every flow works at 375; the sheet is a bottom sheet | Built |
| Minors' privacy | No student photos; illustrated or generated faces only | Built |
| Notes visibility (FERPA) | Notes say who can see them: your counseling team | Built |
| Student transfers in or out, shared caseloads | Needs rostering from the SIS | Gap |
| Counselor out sick, a teammate covers | Team on Profile; no coverage mode | Gap |
| Report period with no data yet | Reports read the latest issued period (labeled) | Built |

---

## 6. Alignment rules (every screen follows these)

1. **Every number opens the students behind it.** Aggregates exist to reach the student who has not done the step.
2. **Every action is one click from where the need shows.** Book, walk-in, review, write and contact appear on the row that calls for them.
3. **One save does everything a counselor would otherwise repeat** (meeting + note + time).
4. **Say each fact once per screen.** No figure is repeated between a hero and a panel.
5. **Open layout, hairlines, breathing room**; boxes only for documents, sheets and pictures.
6. **Status colors only for status** (`--color-feedback-*`); everything else is one blue.
7. **Mock what's missing, never drop the feature**, and tag it `DEMO-ONLY:` in code.
8. **Phones are first-class**: every flow above works at 375.

---

## 7. Gaps to build next (ranked by value)

1. Harmful-language alerts on check-in notes, with a district escalation path (needs policy and server).
2. Hand a student to a teammate, with notes and open items moving together; a coverage mode for absences.
3. Real sends for scheduled reports.
4. Lead counselor team view in v5/v6 (progress by counselor).
5. "Turn interest into opportunity" on Home (matches saved careers to local programs, internships and events).
6. Most-played simulations on Home, once plays are logged.
7. State compare in Explore.
