# AT&T × Connected Learning Centers board: what we added beyond Joshua's Replit, and why

Source of truth for copy and flow: Joshua's Replit (`docs/reference/joshua-connect-replit-2026-09/`).
Board code: `src/components/connect/att/` (`attData.ts` holds every string, `AttCommunityView.tsx` renders it).

## Revert to Replit-only in one go

Set `REPLIT_ONLY = true` in `src/components/connect/att/attData.ts`. That single switch:

- restores Joshua's original first names (Marcus Reed, Jordan Lee, Maya Patel, Andre Johnson, Elena Rodriguez)
- turns opportunity cards back into plain cards with Save (no sheet, no status chips, no date tiles, no interest counts)
- removes the poll tally and response count
- shows Like and Comment as words instead of counts on insights, and removes the counts on Recent Answers
- stops People tiles and names from opening a profile

Design-language choices (elevated cards, the insight mark, the standard composer, the phone rail, the board banner) are not gated: they are how the board is drawn, not what it says or does.

Full pre-build snapshot of Connect: tag `connect-before-att-board-2026-09-17`, branch `connect-snapshot-2026-09-17`.

## Additions and the reason for each (all direct requests, 17 Sept 2026)

| Addition | Why |
| --- | --- |
| Opportunity cards open a detail sheet (about, who, when, where, how, status) | A card with only a title gave a student nothing to act on |
| Add to My Plan, Tailor or Build your résumé, Save in the sheet | Turns an opportunity into a next step inside the app instead of a dead end |
| Interest and applied or registered counts | Social proof, the same signal the rest of Connect uses |
| Status (Open, Soon, Upcoming) and dates as calendar tiles, deadlines as chips | Faster to scan than a sentence |
| Poll response count and a percentage tally after voting | The source saved the vote and showed nothing back |
| Helpful and comment counts on insights and answers | Consistency with every other Connect card |
| Six professionals open the shared profile page, with their own portraits | Every other pro in Connect has one; pros never wear the generated student avatars |
| Five first names changed | They clashed with people already in Connect (Marcus, Andre, Elena are existing pros; Jordan and Maya are students) |
| People rows spread across the six people | The source repeated the same two people in every row |
| Student, Volunteer, Enterprise switch behind a Demo chip | The three audiences are demo views, not tabs a student would see |

Demo content we wrote, to be replaced by AT&T's own text before anything ships: opportunity descriptions and details, profile stories, all counts.

## 18 Sept 2026: reach first, one theme, a launchpad, closed loops

Direction: the board extends AT&T's program to students anywhere; a Connected Learning Center is one optional way in, never the entry point. Sources: the AT&T Connected Learning Integration & Role Analysis report and the six observations at the end of `joshua-connect-replit-2026-09/README.md`.

| Change | Report or observation it answers |
| --- | --- |
| `THEME` in attData drives the student Home card, the volunteer Today prompt and the Program planner; September everywhere | Observation 1 (topic drift across views); the planner header and topic can no longer disagree |
| Student tabs: Home · Learn · Ask · Opportunities. People folded into Ask as "Professionals who answer here", with answer counts | Observation 5 (tiles carried nothing to choose on); one fewer tab |
| Learn: The Achievery and DigitalLearn modules, virtual, with progress, a sheet, XP flight and Add to My Plan | Report: the curricular launchpad, done without a center |
| Home: theme + poll in one card, Continue learning, "Prefer in person?" card marked Optional | Report: local center visibility, reframed as optional; density: one question per block |
| Opportunities: All · Virtual · In person filter | Reach first; in person is a choice |
| Volunteer Today: theme prompt plus three time-boxed requests with minutes; Accept counts toward hours | Report: structured, time-bounded micro-volunteering, skill matched |
| Volunteer Questions: "Your answers" with reads and helpful; sending shows "Live in Recent Answers" | Observation 2 (one-directional loop) |
| Volunteer Impact replaces Year-Round: hours by month, students you have helped, AT&T Believes sync, calendar collapsed | Report: hour logging and the Believes bridge; observation 3 (nothing carries across the year) |
| Share chip reworded to "What do you wish students knew about your career?" | Observation 6 (negative framing) |
| Enterprise opens on Impact; This Month and This Year differ; "Students Active" and "Reads" instead of "reached"; How students take part (virtual vs center); 2026 volunteer hours goal | Observation 4 (units and identical ranges); report: ESG telemetry, reach beyond centers |
| Program planner: one card per period, Students see / Volunteers see, source as chips, one vocabulary | Cognitive load; the source's three panels and three vocabularies |
| Banner: "Students anywhere connect..." and 15 States instead of a center count | Reach first |
| Theme card acts: with picks saved it shows them as chips into each career page and opens My Plan; without picks it sends to Explore. Ask a pro beside it | "What action can I take from the banner?" and app-wide context (the student already has picks) |
| Student pulse: sourced from the planner's biweekly period, +5 XP on vote with the flying capsule, the pick chooses the next module; volunteers see the leading answer on Today, AT&T sees the split on Impact | "Where does the poll come from, why answer it, does it scale?" |
| People back as its own tab (Home · Learn · Ask · Opportunities · People), answer counts kept | Long scroll on Ask |
| XP pills wherever XP is earned (module cards, Continue learning, module sheet, pulse); short copy throughout; tab content fades in on change | "XP more prominent, copy short, motion, scannable" |
| Learn modules flag "Fits your picks" by world; the résumé module hands off to Resume Builder; the volunteer's résumé-review request names the student's latest saved résumé | App-wide context: picks, My Plan, resumes connect wherever relevant |
| Insights rail scrolls one by one below lg; the 3-up grid only at desktop | Cards shrank and overlapped on tablet |

Not built, on purpose: a site-coordinator view (center staff scheduling, hardware loans), consent and COPPA/FERPA flows, and any real integration. All module copy, requests and counts are demo text.
| Declutter pass: one accent per card (muted eyebrows), one CTA per block, Continue learning as one row, the center as one quiet line at the bottom, the pulse as its own weekly row, Learn without a duplicate heading, no employee-impact card repeating the tiles, banner copy back to the source's | "Elements competing for attention, cognitive overload"; "do not expand the banner copy" |

## 18 Sept 2026, later: not redundant with AT&T's own platforms

Research (AT&T sustainability pages, newsroom, Compudopt, PLA, life.att.jobs) corrected the report: 100 centers in 25 states by July 2026, $3.62B of $5B invested and 16.1M of 25M people reached by end 2025, 194,000 devices placed 2021 to 2025, The Achievery at 1,600+ units with accounts, 468,000 volunteer hours in 2025, Believes Volunteer Rewards ($1,000 grant on hours). Decision: import AT&T's assets, never replicate them; Dreamari is the career outcomes layer.

| Change | Why |
| --- | --- |
| Learn units open in The Achievery or DigitalLearn (new tab); Dreamari keeps the plan and the progress; sheet says where it opens and that progress syncs | The Achievery is AT&T's platform with its own accounts; a rival library would be redundant |
| Home: "Get a laptop or hotspot" (Compudopt, PCs for People) and "Homework help now" (volunteer tutoring, UPchieve model) as one-tap requests with sheets | Devices are AT&T's biggest reach lever; tutoring is what employees already do; both work from anywhere |
| Volunteer Today: a tutoring request leads the list | Matches the student request; the loop closes on both sides |
| Volunteer Impact: Believes Volunteer Rewards progress, 25 hours to a $1,000 grant | Hours have real cash value to a nonprofit; the strongest motivator AT&T offers |
| Enterprise Impact: outcome headline (62% took a career step within 30 days) and an access-to-outcome funnel first; tiles in AT&T's vocabulary (People Served, Devices Placed, Achievery Units, Career Steps); Content Views and Questions Answered dropped; trend metrics follow | AT&T reports outcomes, not optics; the outcome number is what Dreamari adds that no AT&T platform can |
| Device request is a gated waitlist: pick laptop or hotspot, confirm three eligibility statements (enrolled, no working computer at home, household qualifies), Join the list; the confirmation says names are drawn at random before the next event. Tutoring shows the Title I or low-income ZIP rule and "your school is on file" | Compudopt and PCs for People gate devices by enrolment, need and income with a random draw; UPchieve gates tutoring by Title I or ZIP. Nobody simply requests and receives (direct challenge, 18 Sept 2026) |
| Bank it in Dreamari: once a unit is started, its sheet offers Add to résumé skills (writes the skill into the student's real résumé store, respects the three-per-category cap), Add to My Plan, and Ask an AT&T pro about this (lands on the Ask tab). Tutoring copy says the session happens here, in a moderated chat | Usage has to stay on Dreamari: units may open on AT&T's platform, but the résumé line, the plan step and the question live here (direct instruction, 18 Sept 2026). Employers value verified skills on applications; the résumé is where a unit becomes evidence |
