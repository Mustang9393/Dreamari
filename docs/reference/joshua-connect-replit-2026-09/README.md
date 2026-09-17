# Joshua's Connect update on Replit (walkthrough, 17 Sept 2026)

Reference capture of Joshua's concept build for the Connect update, so nobody has to click through the site again to remember what is in it. Everything new here is Joshua's idea; this doc only records what is there and how it behaves.

- Site: https://dceeai.replit.app/community-boards, then **AT&T × Connected Learning Centers → Enter Community**. Three toggles at the top of the community: **Student View**, **Volunteer View**, **Enterprise View** (demo scaffolding: one person switches roles).
- Screenshots: `screens/*.jpg` (one per state, stable names). Visible text per screenshot: `walk-text.md`.
- Regenerate: `walk.mjs` drives the locally installed Chrome. From a scratch folder: `npm i playwright@1.47.2 && node walk.mjs /path/to/docs/reference/joshua-connect-replit-2026-09`. It re-clicks every state below and rewrites `screens/` and `walk-text.md`.

## Connect landing (`/community-boards`)

`connect-communities.jpg`. Header "CONNECT, Learn from professionals who do the work", badge "Verified professionals · Moderated questions", tabs **COMMUNITIES / PEOPLE**.

Four official communities, each a card with students / professionals / posts counts, topic chips, company chips, "Enter Community →":

| Community | Students | Pros | Posts | Companies |
| --- | --- | --- | --- | --- |
| General Professional Development | 3,987 | 518 | 216 | EY, JPMorgan Chase, Mars, AT&T, Informa |
| Finance Careers | 2,265 | 297 | 99 | Goldman Sachs, Morgan Stanley, JP Morgan, BlackRock |
| Technology Careers | 1,865 | 301 | 116 | AT&T, Google, IBM |
| AT&T × Connected Learning Centers | 620 | 54 | 8 centers | AT&T, 8 Connected Learning Centers |

**PEOPLE tab** (`connect-people-tab.jpg`): "Find a professional", "People to follow" carousel (1 / 4) with ACTIVE DAILY / WEEKLY / BI-WEEKLY badges and View Profile + Follow; "Browse by industry" with counts per world (Business & Money 7, Tech & Engineering 9, Health & Medicine 3, Arts & Media 4, others 0 to 1); "New from people you follow" (Dr. Maya Patel, Sarah Chen, Priya Nair, each "Read answer").

## Community header (all views)

Blue banner: ACTIVE COMMUNITY, title, **620 students · 54 AT&T professionals · 8 Connected Learning Centers**. The small (i) "About this community" expands one line inside the banner: "A moderated career community connecting students with AT&T professionals and opportunities." (`student-home-about.jpg`). "Back to communities" returns to the landing.

Each view remembers its last sub-tab when you toggle away and back.

## Student View

Tabs: **HOME / QUESTIONS / OPPORTUNITIES / PEOPLE**.

### Home (`student-home.jpg`)
- **Professional Insights**: 3 cards (Marcus Reed, Network Engineering Manager; Jordan Lee, Cybersecurity Analyst; Maya Patel, AI Product Manager; all AT&T, all verified). Each card: a question headline, a one-sentence quote, and **Like / Comment / Ask**. Carousel arrows ("Previous cards" / "Next cards") scroll the same 3 cards (`student-home-carousel-next.jpg`).
  - **Like**: toggles to a filled state inline. No count shown (`student-home-liked.jpg`).
  - **Comment**: opens an inline "Add a comment..." textarea with **Post** under the card (`student-home-comment-box.jpg`).
  - **Ask**: jumps to the Questions tab (it is a shortcut, not a per-card ask).
- **This Week** poll: "Which skill will matter most in your future career?" with Communication / Technology / Problem solving / Leadership. Picking one shows a check and "Your response is saved." No results, no tie to the month's program topic (`student-home-poll-answered.jpg`).
- **Opportunities for You**: 4 cards (internship, program, virtual panel, event) with **Save**, which toggles to **Saved** (`student-home-saved.jpg`). "See all →" opens the Opportunities tab.

### Questions (`student-questions.jpg`)
- **ASK AT&T PROFESSIONALS**: textbox "What would you like to know?" + **Ask**. Submitting shows a check, "Question submitted for moderation", and "Ask another" (`student-questions-submitted.jpg`). No routing state, no "who will see this".
- **RECENT ANSWERS**: question in quotes, answering pro, **Read answer** expands the answer inline and becomes **Hide answer** (`student-questions-answer-open.jpg`). **Show more →** adds a third (Andre Johnson, Cloud Solutions Architect) and becomes **Show less** (`student-questions-show-more.jpg`).

### Opportunities (`student-opportunities.jpg`)
13 cards in 4 groups, each with a type label, title, audience/date line, and **Save**:
- Internships: AT&T Technology Internship (College sophomores · Applications open), Network Engineering Internship, Cybersecurity Internship (Opening soon).
- Programs: Summer Technology Exploration Program (High school · Virtual), Connected Futures Program (Grades 10–12 · Summer), Career Discovery Program.
- Events & Panels: Inside AT&T Cybersecurity (Oct 22 · Online), Connected Learning Center Career Day (Detroit · Nov 14), Careers Behind the Network (Dallas · Limited seats), Technology Careers Workshop (Virtual · Dec 4).
- Scholarships & More: Connected Learning Scholarship (apply by Jan 12), Network Operations Job Shadow (Spring), AT&T Student Innovation Challenge (teams of 2–4).

### People (`student-people.jpg`)
Three rows: **Recommended for You**, **Most Active**, **Technology & Engineering**. Tiles show avatar, name, verified check, role, "AT&T", and **Follow**. Follow toggles to **Following** and syncs for that person across all rows (`student-people-following.jpg`). The same 3 to 4 people fill every row; tiles carry no reach, follower or answer counts; names are not clickable.

## Volunteer View

Tabs: **HOME / QUESTIONS / SHARE / YEAR-ROUND IMPACT**.

### Home (`volunteer-home.jpg`)
One card under "What should I do right now?": topic **AI & Future of Work**, prompt "Share how AI is showing up in your work.", button **Answer prompt**, footer "23 students engaged this month." Answer prompt opens an inline textarea ("Share what students should know...") with **Submit answer / Cancel** (`volunteer-home-answer-form.jpg`). Note the Home card shows the October monthly topic while Year-Round Impact opens on Sep 1–15.

### Questions (`volunteer-questions.jpg`)
"Questions waiting. Answer what you know." Two questions each with **Answer**, which opens an inline "Share your experience..." textarea with **Send answer** (`volunteer-questions-answer-form.jpg`). **View more questions →** reveals two more (four total) and becomes **Show fewer questions** (`volunteer-questions-more.jpg`).

### Share (`volunteer-share.jpg`)
"What would you like to share?" with two tiles: **INSIGHT** ("Advice or trends students should know", Share insight) and **OPPORTUNITY** ("Internships, events, programs, or panels", Share opportunity).
- **Share an insight** (`volunteer-share-insight.jpg`): "What would you like students to know?", three prompt chips (What is changing in your industry? / What skill matters most? / What do students misunderstand about your career?) that prefill the textarea (`volunteer-share-insight-prefilled.jpg`), **Post insight**, **Back**.
- **Share an opportunity** (`volunteer-share-opportunity.jpg`): "Choose type" select (Internship, Program, Virtual Panel, Office Visit, Event, Scholarship), "Add a short description or link..." textarea, **Share opportunity** (disabled until filled), **Back**.

### Year-Round Impact (`volunteer-year-round-biweekly.jpg`)
"Stay connected with students all year." **Monthly / Biweekly** toggle (opens on Biweekly), period chips, one card per period with a theme, a prompt for the volunteer, one line on what students are doing then, and a CTA. **View full year →** expands all 12 months and becomes **Hide full year** (`volunteer-year-round-full-year.jpg`).

Biweekly periods seen:
- Sep 1–15 **Welcome + Career Access**: "Share one thing you wish you knew before your first job." / "Students are choosing careers they want to explore this year." CTA **Answer Prompt** → inline textarea + **Submit / Cancel**; submitting shows "Submitted for moderation" (`volunteer-year-round-answer-form.jpg`, `volunteer-year-round-submitted.jpg`).
- Sep 16–30 **Skills + Student Pulse**: "Share the skill that matters most in your role today." (`volunteer-year-round-sep16.jpg`)
- Oct 1–15 **AI at Work**: "Show students one way AI is changing your job." CTA is **Share Insight**, not Answer Prompt (`volunteer-year-round-oct1.jpg`).
- Oct 16–31 (not opened).

Monthly (`volunteer-year-round-monthly.jpg`): September **Back to School + Career Access**, same prompt as Sep 1–15. Full year: Sep Back to School + Career Access · Oct AI & Future of Work · Nov Careers Behind AT&T · Dec Advice Worth Keeping · Jan Internships & Applications · Feb Networking + Employee Groups · Mar Hackathons + Skill Building · Apr Panels + Career Conversations · May Summer Readiness · Jun Student Pulse · Jul Career Inspiration · Aug New Year Reset. The plan is a single 12-month loop; nothing carries a student or a relationship across years.

## Enterprise View

Tabs (role=tab): **PROGRAM / IMPACT / TEAM**.

### Program (`enterprise-program-september.jpg` and siblings)
"Community Program. Plan how AT&T stays connected with students." **AUTO-PILOT** switch ("Dreamari fills unscheduled periods."), on by default; switching it off changes nothing else visible (`enterprise-program-autopilot-off.jpg`). **Monthly / Biweekly** toggle and period chips (Sep–Dec, or Sep 1–15 … Oct 16–31).

Each period card: period label, the month's theme as a header, then **TOPIC SOURCE** with three options: **Dreamari** (Suggested automatically), **AT&T** (Your team chooses), **School Partner** (Educators choose). The body changes with the selected source:
- **Dreamari**: "DREAMARI SUGGESTION", a topic, "Prompt for employees: …", "Prompt for students: …", then **Topic selected / Suggest Another** (already-selected months) or **Use This Topic / Suggest Another** (unscheduled periods) (`enterprise-program-source-dreamari.jpg`, `enterprise-program-suggest-another.jpg`).
- **AT&T**: "AT&T TOPIC" with three editable fields (topic, employee prompt, student prompt) and **Save**; for October it shows the saved topic with **Edit Topic / Saved** (`enterprise-program-source-att.jpg`, `enterprise-program-october.jpg`).
- **School Partner**: "SCHOOL PARTNER TOPIC", topic, "Suggested by Detroit Connected Learning Center", "Employee prompt: …", "Student activity: …", **Approve / Edit** (`enterprise-program-source-school.jpg`, `enterprise-program-november.jpg`).

Months as configured in the demo:
- September: Dreamari, **AI & Future of Work** (How is AI changing your role? / Which AI-related career interests you most?), Topic selected.
- October: header **AI & Future of Work**, source AT&T, saved topic **Careers Behind AT&T** (Volunteer activity: How is AI changing your role? / Student activity: Explore AI-related careers). Header and chosen topic disagree; the volunteer calendar lists Careers Behind AT&T as November.
- November: header **Careers Behind AT&T**, source School Partner, **Career Readiness Month** (What skill has helped you most professionally? / Ask one professional about that skill), Approve / Edit.
- December: header **Advice Worth Keeping**, source Dreamari, **Skills That Matter** (Which skill has mattered most in your career? / Which skill do you want to build next?), Topic selected.
- Biweekly Sep 1–15 **Welcome + Career Access**: Dreamari suggestion AI & Future of Work, **Use This Topic** (`enterprise-program-biweekly.jpg`).

Vocabulary for the same two fields varies by source: "Prompt for employees / Prompt for students", "Volunteer activity / Student activity", "Employee prompt / Student activity".

### Impact (`enterprise-impact-month.jpg`)
"Community Impact. A clear view of AT&T's community contribution." **This Month / This Year** toggle (the numbers are identical in both, `enterprise-impact-year.jpg`). Six tiles: **620 Students Reached · 54 AT&T Volunteers · 48.2K Content Views · 286 Questions Answered · 174 Volunteer Hours · 37 Opportunities Shared**. **IMPACT TREND** line chart Apr–Sep with a native select for the metric (Students Reached / Views / Engagements) (`enterprise-impact-trend-views.jpg`). **EMPLOYEE IMPACT** dark card repeating the totals with **View Team Impact** (opens the Team tab).

### Team (`enterprise-team.jpg`)
"AT&T Volunteers. See who is contributing to the community." **TOP CONTRIBUTORS** 1–3 with reached / answers / hours: Marcus Reed 12.8K / 31 / 14, Jordan Lee 9.4K / 24 / 11, Maya Patel 7.8K / 19 / 9. **All Volunteers** table (Name, Role, Activity, Students Reached, Hours) with filters **All / Most Active / Needs Engagement** (`enterprise-team-most-active.jpg`, `enterprise-team-needs-engagement.jpg`):

| Name | Role | Activity | Reached | Hours |
| --- | --- | --- | --- | --- |
| Marcus Reed | Network Engineering Manager | Active this week | 12.8K | 14 |
| Jordan Lee | Cybersecurity Analyst | Active this week | 9.4K | 11 |
| Maya Patel | AI Product Manager | Active this month | 7.8K | 9 |
| Elena Rodriguez | Customer Experience Director | Active this month | 4.2K | 7 |
| Andre Johnson | Cloud Solutions Architect | Needs engagement | 2.8K | 5 |
| Amina Thompson | Technology Program Manager | Needs engagement | 2.1K | 4 |

Footer card **AT&T COMMUNITY IMPACT** (54 volunteers · 620 students · 174 hours) with **Download Impact Summary** (not clicked: it is a download).

"Reached" cannot be students: the top three alone total 30K in a 620-student community, so it is views.

## Related route in the top nav

`/volunteer/dashboard` (`nav-volunteer-dashboard.jpg`): a separate, dark-themed volunteer profile ("Sarah Chen, Investment Banking Associate | JPMorgan Chase, DIAMOND VOLUNTEER"; 87.6k views · 1.1k followers · 8.9k likes; My Profile / My Impact; Overview / Ask Me & Posts; About me, Experience, "I can help with", Communities). Not part of the three-view community, but it is where a volunteer's own profile lives in this build.

## Observations worth carrying into discussion

1. The program topic is not shared across views: Student Home's poll is generic, Volunteer Home shows October's monthly topic while Year-Round opens on Sep 1–15, and the Enterprise October card's header and chosen topic disagree.
2. The volunteer loop is one-directional: after answering, a volunteer only sees "23 students engaged this month", nothing about their own answer.
3. Nothing carries across years (no class year, no cohort, no "students you've connected with"); the calendar resets in August.
4. Units: "reached" is views; This Month and This Year show the same numbers.
5. People tiles carry nothing to choose on (no reach, answers, or logos) and repeat the same people in every row.
6. One share-insight chip is negatively framed ("What do students misunderstand about your career?").
