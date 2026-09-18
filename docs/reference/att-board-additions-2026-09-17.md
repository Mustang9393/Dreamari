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

Not built, on purpose: a site-coordinator view (center staff scheduling, hardware loans), consent and COPPA/FERPA flows, and any real integration. All module copy, requests and counts are demo text.
