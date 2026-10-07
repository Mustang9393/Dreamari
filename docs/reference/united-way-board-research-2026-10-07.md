# United Way in Dreamari: community board or mentorship program? (research memo, 7 Oct 2026)

**Question.** We have two partner shapes in the app. The AT&T board is a community board: a program that reaches students anywhere, with learning, questions answered by professionals, opportunities and a volunteer side. The Coach Foundation Dream It Real program is a mentorship program: a scholar matched one to one with an employee mentor, a year plan, a private message dock and hours that roll up. Which shape fits United Way?

**Short answer.** Start with a community board, built on the AT&T board's bones, with a local chapter picker. Add the mentorship module (the Coach pattern) only inside the chapters that run one-to-one matching. United Way is a network of local organisations running many program types with many employer partners, not one scholarship cohort, so the mentorship shape alone would leave most of what they do with nowhere to live.

## 1. What we know about United Way

From Jenny's research (18 Sept 2026, condensed in `united-way-programs-research-2026-09-18.md`):

- United Way Worldwide names College & Career Readiness as a core Youth Opportunity priority. The work is delivered by local United Ways and differs by place.
- Six programs studied. Their ingredients, in order of how often they appear: career exposure through employers (speakers in classrooms, site visits, employer visits), work-based learning (internships, job shadows, four-week workplace mentorships), mentorship (adult, professional, virtual), college prep (visits, financial aid, scholarships, applications), career prep (employability, interviews, financial literacy, leadership).
- Only two of the six are one-to-one mentorship programs in the Coach sense: Orange County's e-Mentorship (seniors, low income, virtual, coming back for the Class of 2027) and the Midlands' Young Men United (100% matched with an adult mentor, paid internships, laptops). The other four are exposure and work-based learning programs for whole classes or cohorts.
- No network-wide student platform. Technology is local: virtual workshops, laptops, evaluation surveys with a university partner.
- What they count: students and teachers served (15,399 in Orange County since 2016), volunteer hours (65,922), workplace mentorships (2,262), mentor matches, paid internships, job shadows.

One more data point from our own history: AT&T and United Way already run a program together (Digital Bridges, laptops for adult learners), so the two partners overlap in the real world.

## 2. The two shapes we already have

| | AT&T board (community board) | Coach Dream It Real (mentorship program) |
| --- | --- | --- |
| Who the partner is | One corporation, one national program, students anywhere | One foundation, one scholarship cohort, college students |
| Relationship | Many students to many professionals, public answers help everyone | One scholar to one mentor, private |
| Structure in the app | Home · Learn · Ask · Opportunities · People, plus volunteer and enterprise views | Program page, mentor and mentee, year plan, message dock, hours and KPIs |
| Content that feeds it | Theme of the month, learning modules, opportunities, polls, pro answers | Meeting cadence, year plan tasks, conversation, program stats by country |
| What the partner measures | Students active, reads, questions answered, devices placed, career steps, volunteer hours | Mentorship hours per employee, matches, meetings, debt at graduation |
| Where it lives | A Connect community board with a brand mark | Connect's Mentorship tab, college stage only |

## 3. Scoring United Way against the two

| Criterion | Points to | Why |
| --- | --- | --- |
| Many programs, many employers per chapter | Board | A board holds Programs, Opportunities and People from many employers at once. A mentorship program holds one cohort. |
| Local, varies by chapter | Board, with a chapter picker | The AT&T board already models "reach first, local center optional". A chapter picker (Orange County, Midlands, Long Island) is the same idea with United Way's own geography. |
| Career exposure is employer-driven | Board | Speakers, site visits and employer visits are events and Q&A, the board's native content. |
| Work-based learning (internships, job shadows, four-week placements) | Board, Opportunities tab | Already how the AT&T board hands a student an internship with Add to My Plan and Save. |
| College prep (financial aid, scholarships, applications) | Board, Learn or Programs tab | Destination Graduation's checklist maps onto My Plan tasks. |
| One-to-one mentoring (e-Mentorship, Young Men United) | Mentorship module | Needs private messages, a cadence, hours, a mentor profile. That is the Coach pattern, not a board. |
| What they report to funders | Both | Students served and volunteer hours come from the board's enterprise Impact view (AT&T already has it). Mentor matches and meetings come from the mentorship KPIs (Coach already has them). |
| Who the students are | Board | High school first, mostly whole classes and cohorts from partner schools; a scholar cohort is the exception. |
| Audience for 1:1 | Mentorship | Seniors and low income students in specific chapters. |

Seven criteria point to the board, two to mentorship, and the two mentorship criteria only apply inside some chapters. So: a board with mentorship as a module, switched on per chapter.

## 4. What the United Way board would be

Working name: **United Way Student Success**, after Orange County's "United for Student Success" umbrella.

- **Chapter picker** in the banner: start with Orange County (richest programs, strongest numbers), add the Midlands and Long Island as data arrives. Students anywhere see the national content; a chapter adds its own programs and people.
- **Home**: this month's theme, the chapter's featured program, a poll, "Students who did this" momentum, one quiet line to the local chapter.
- **Programs**: Youth Career Connections, e-Mentorship, Destination Graduation, as cards with who it is for, when, what you get, and a one-tap "I'm interested" that puts the student on the chapter's list. Programs that are mentorship open the mentorship module.
- **Ask**: student questions, answered by professionals from the chapter's employer partners, public, with Report on every card (the AT&T safeguarding pass).
- **Opportunities**: internships, job shadows, site visits and speaker days as the Opportunities card with Add to My Plan, Save, status and dates. Filter: Virtual · In person.
- **People**: the professionals who answer here, verified ("Work email verified", "Background checked", "United Way volunteer"), with the same profile page every pro in Connect has.
- **Volunteer side**: Today with time-boxed requests (answer a question, review a résumé, speak in a class), Impact with hours by month, the chapter's volunteer hour goal.
- **Chapter side (the United Way staff view)**: students served, volunteer hours, mentorships, internships, job shadows, in their own vocabulary, so the numbers they already publish come straight out of Dreamari.
- **Mentorship module**, per chapter: the Coach pattern (match, year plan, message dock, hours), labelled with the chapter's program name (e-Mentorship, Young Men United), high school stage allowed, since these programs serve seniors.

## 5. Why this beats a mentorship-first build

- It gives every chapter something on day one, including the four of six programs that have no one-to-one component.
- It reuses the most-built partner surface we have (the AT&T board, two versions, safeguarding, device request, enterprise impact) instead of forking the Coach program for a partner whose core is not scholarship mentoring.
- It answers United Way's own stated gap, no shared student platform, with a product they can show funders: the board's Impact view is the report they already write by hand.
- It keeps the door open: a chapter that matches one to one gets the full mentorship module without a second product.

## 6. Competitors to name in the pitch

- Mentorship platforms local United Ways might otherwise buy: **MentorcliQ**, **Chronus**, **Mentor Collective**, **iCouldBe**. All do matching and hours; none has career exploration, games or a student community around it.
- Career exposure platforms: **Nepris / Pathful** (virtual industry speakers in classrooms), **CareerVillage** (public Q&A with professionals). Nepris covers speakers only; CareerVillage covers Q&A only. The board does speakers, Q&A, opportunities and the student's own plan in one place.

## 7. What we still need before design lock

1. Which chapter is the partner. Orange County is the reference in the research; confirm who Jenny or Joshua is talking to.
2. Brand: the United Way mark and its rules (the live united, the rainbow and hand mark, chapter lockups). We only ever draw a mark the brand publishes in one colour, or full colour on a light plate.
3. The professionals: which employer partners volunteer in that chapter, and whether they are background checked.
4. Which programs run one to one this year (e-Mentorship is "coming back for the Class of 2027"), so we know whether the mentorship module ships in v1.
5. The numbers they report to funders, verbatim, so the chapter view uses their words.
6. A partner call. We have none on record for United Way; the Coach call shaped the Coach program, and this one would shape the board.

## 8. Proposed sequence (design side, no engineering dependency)

1. This week: this memo to Jenny and Joshua, agree the shape and the chapter.
2. Next: the board on a branch, copied from the AT&T v2.0 structure with United Way content from Jenny's research as placeholder, chapter picker, Programs tab, Impact in United Way vocabulary. Demo content clearly marked, replaced after the call.
3. After: the mentorship module switched on for e-Mentorship if the chapter confirms it.
