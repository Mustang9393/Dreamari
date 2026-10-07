# Counselor dashboard: the reimagine brief (Slack, 7 Oct 2026)

Saved verbatim from the team channel so the reasoning travels with the repo. Nothing here is built yet. The current v4 dashboard stays as is until the team agrees on architecture and specs (see "Where this leaves us" at the end).

## Maisha, follow-up to her v4 review

> All the updates look good @Chandu great job. I'll share more detailed notes on each thing you mentioned after my meetings today. I'll lyk how we can consolidate milestones and student progress tabs.

Next focus, her last bullet from the previous message:

- Overall direction: making the counselor experience more exciting.
- v4 is leaps better than v2 and v3; moving forward with this direction. Easier to navigate, far less information overload, cleaner, easier to process.
- Right now it is a very polished, intuitive experience. Information delivery is close.
- The next push is making the experience more exciting to receive. Draw it closer to the student experience, which has the polish and intuitiveness plus "an extra kick of excitement" (Explore cards, games, visual moments) that makes you want to play around with the product.
- Mimic some of that in the counselor dashboard without losing the clean, professional, easy-to-process experience.
- "We've drawn from the explore cards in Insights but it feels too subtle and barely noticeable."

## Joshua, "rethink the Counselor Dashboard V2 more fundamentally" (2:28 AM)

> Right now it is functional, but visually it feels like a traditional administrative dashboard and is a major step down from the student experience. Dreamari is visual, immersive, and engaging for students. The counselor product should feel like the same world, just designed for an adult advisor.

Main goal: when a counselor opens Dreamari or is preparing to meet with a student, they should feel more informed, prepared, and confident within a few clicks.

Proposed top-level architecture: **Home | Students | Explore | Prepare | Workspace | Analytics**. Each area has its own sub-tabs (like Connect). Nothing forced onto one screen.

### 1. Home: what is happening with my students?
Strongest first impression, much more visual than a standard dashboard.
- Top careers students are saving, with the actual Explore career imagery
- Top industries/interests
- Most-watched career videos, playable thumbnails
- Most-played simulations
- Only the most important numbers: Students, % On Track, Need Attention
- Visual "Students Who Need You"
- Student Momentum: meaningful activity across the school
- "Turn Interest Into Opportunity" recommendations from student interests

Home answers: what are my students excited about, who needs me, what should I do next?

### 2. Explore: help me become a better advisor
Highly visual, same design language students see. Sub-tabs: Careers | Schools | Labor Market.
- Search careers by subject, skill, interest, industry, keyword (search "Math", see careers where math matters)
- Browse careers with the existing Explore imagery
- Search colleges, community colleges, trade schools, other pathways
- Top 25 In-Demand Careers by State; change the state and recommendations update
- Toggle Professional Careers / Skilled Trades
- Eventually compare states (Florida vs New Jersey)
- Pay, education, growth, related majors, local demand, pathways

Answers in real time: "I like biology", "I want to move to Florida", "I don't want a four-year degree."

### 3. Prepare: get me ready for my next student meeting
Possibly the strongest differentiator. Pick a student; Dreamari builds a visual Student Brief from what it already knows: Career Report, Top 3 and saved careers, interests/subjects/skills, GPA and academic progress, education preferences, location preferences, tuition budget, activity, verified progress.

Then surface: best-fit careers, relevant majors/pathways, colleges aligned to GPA/location/budget/interests, Reach/Target/Safety, trade and non-degree pathways, in-demand careers in preferred states, issues to discuss, preferences or progress needing review. Minutes to prepare instead of manual research.

### 4. Analytics: much broader than Dreamari engagement
What schools, districts and states expect counselors to measure. Configurable by state/district. Sub-tabs: Readiness | Postsecondary | Career & WBL | Risk | Outcomes | Engagement.
- Readiness: GPA/grades, graduation requirements, course-plan completion, academic milestones, SAT/ACT/TSI/AP/IB, on track vs off track
- Postsecondary: plan completed, college list, applications started/submitted, Common App progress, transcripts, recommendations, FAFSA/state aid, scholarships, final reports, 4-year/2-year/trade/apprenticeship/military/workforce plans
- Career & WBL: participation, hours, internships, job shadows, apprenticeships, employer evaluations, CTE/pathway completion, industry certifications
- Risk: academically at risk, missing graduation requirements, missing FAFSA/applications, no postsecondary plan, behind on milestones, prioritized intervention list with reasons
- Outcomes: graduation, postsecondary enrollment, 2-year vs 4-year, trade/apprenticeship/workforce, persistence, cohort/school/counselor/district comparisons
- Engagement: the Dreamari-specific analytics (careers explored/saved, videos, simulations, schools explored, Planner completion, Connect participation). One part of Analytics, not the whole.

Analytics should change by district/state (Texas vs New Jersey vs Massachusetts), not one generic national dashboard.

### 5. Students + Workspace
Keep the operational tools (directory, reviews, messages, questions, announcements, plans, resumes, applications, documents). Important, but they should not define the visual identity.

### Overall UI direction
"Dreamari for adults, not another SIS or spreadsheet dashboard." Bring over student-side visual DNA: career photography, college imagery, video thumbnails, student avatars, larger cards, gradients, clear hierarchy, subtle interaction, progressive disclosure. Reduce spreadsheet rows, excessive borders, redundant labels, walls of text, every data point at the same level.

The five questions the whole experience answers: What are my students interested in? Who needs my help? What do I need to know to advise them well? How do I prepare for my next meeting? Are my students meeting the requirements that matter?

Establish architecture and visual language first (Home, Explore, Prepare, Analytics), then apply the system across the rest. Key distinction: Explore makes the counselor smarter while advising; Analytics tells the school whether students are on track; Prepare connects the two to one student meeting.

### Joshua, 2:47 AM
> When I do demos currently people literally say "wow" "this is so good" "it looks amazing". Think about the fact that people who work with BOEING (MRO) to Google (Zack) to Enterprise Connect (Microsoft, Zoom, AWS), Coach and more... are literally "wowed". The counselor dashboard needs to create that same effect or it's not ready. It has to be the best in the world, period.

### Joshua, voice note (transcript, 4:48)
- Innovation is not the "Virgil Abloh 3% rule" of copying and changing 3%. Aim for transformative innovation that is hard to compete with.
- Essentials stay: analytics, the percentages the district, state and country need. Match competitors 1 to 1 there. Everything else is open season; complete creative freedom before investors.
- Counselors need to counsel better, not just stand behind a desk. How do they learn about careers? We spent 10 to 11 months pulling educational information from government APIs. Let counselors learn the way students do, so when a student says "finance" they can say investment banking, quant, asset management, private equity, not just "accountant".
- Counselors are in their 30s and older, they use Instagram and TikTok; they do not want a boring graphs-and-numbers experience. Give them the same immersive experience. The cards and information already exist. Keep 8th-grade reading level; adults like that too.
- What are they doing in the app: the analytics districts need, exploration, and preparation for student meetings.
- Thesis from the pitch deck: 376 students per counselor; how will a counselor know the difference between a food scientist, an aviation maintenance technician and an investment banker? In the current dashboard they still do not. "We made the students better, but this is a two-way street."
- A prettier dashboard is not enough. Bring something competitors cannot match with a quick UI/UX update; they would need to change their whole system and feature set.

## Usman (3:55 AM, 3:59 AM)
- Happy Dreamy is coming to the counselor dashboard. Gamify the experience. Same design system for counselors as for students.
- Improve the light mode experience for both.

## Maisha, additions (9:41 AM)
- **Explore College + Career Cards.** In Insights (top 10 careers, top 10 colleges), make the Explore cards prominent and the insight interactive: scroll through career and college cards, fun, not just a bar chart. Same for "Career Interests" in Today. References: a rotating carousel of the 10 careers with the top ones highlighted; college cards can move the same way or differently.
  - https://www.pinterest.com/pin/977984875393279935/
  - https://www.pinterest.com/pin/663436588894973816/
  - https://www.pinterest.com/pin/970525788471216497/
  - https://www.pinterest.com/pin/1113515076612136744/
- **Counselor Profiles.** Not a generic homepage; personalized, feels like a profile. A school may have 4 to 5 counselors; give them cards. Aesthetic: a version of the corporate professional profiles.
  - https://www.pinterest.com/pin/2674081024957552/
  - https://www.pinterest.com/pin/1074249317382377514/
- **Incorporate Imagery.** Reduce copy and number overload with imagery. "My Next Conversations" in Today can move horizontally like a "choose your personal doctor" box. Recurring words (Academic Plan, Resume, Financial Aid) get icons so the eye gets a break.
  - https://www.pinterest.com/pin/868913321878100792/
- **Different ways to showcase metrics.** More interactive presentations beyond how education has historically shown them. The 85% milestone completion could be a sphere-style breakdown; Approved milestones could be shown differently than bar charts. Apply across the dashboard.
  - https://dribbble.com/shots/27591556-Nexin-Finance-Management-Dashboard-UI-UX-Design
  - https://www.pinterest.com/pin/306526318408067930/

## Where this leaves us (Chandu, 7 Oct 2026)

Usman's standing note (29 Sept): he has a method for studying competitors and writing specs for the Counselor and School Admin dashboards; authentication/authorization, user roles, counselor dashboard and Common App have to come together; all views are data driven, so he builds the features first and design happens once on top. He asked that we proceed to Play and Connect in the meantime.

Decision pending a call: the real counselor product (its own app, not a demo dashboard) should be built once, on agreed architecture and specs, so we are not redoing the work. Until then: no new counselor build; the team can spend time on United Way and other boards. See the plan in the session summary of 7 Oct for how the design side proposes to prepare without building.
