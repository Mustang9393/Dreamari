# SchooLinks student profile, About Me: what it does (19 Oct 2026)

Watched frame by frame for Joshua's About Me spec:
- "Schoolinks Lesson 10 Profile STUDENT TUTORIAL WITHIN LESSON" (Felicia Kern), youtube.com/watch?v=jrN1ZN24zS8, 10:41
- "SchooLinks: Student Profile" (Brian LaPorte), youtube.com/watch?v=BqKwhqN_qRQ, 1:16 (a shorter, empty-profile walk-through of the same page)

## Shape of the page

- **One long scrolling page.** The tab row (About me, My story, Experience, Bragging rights, Academics, Portfolio, Credentials, My videos, References) jumps down the page; it does not swap views.
- **Header:** cover photo, avatar, name, class of + school, "+ Add preferred name", "+ Add pronouns", "Write a headline", "Write an objective", "Public profile" toggle, "+ Add social accounts". Export-resume icon at the end of the tab row.

## The goals block ("My Story", first thing under the header)

- A row of **equal picture tiles**, one per goal: Post-Secondary Goal, Career Goal, Career Cluster, College Goal, Major/Training Goal. The label sits above the tile; the chosen name sits on the picture.
- Under each tile: "Updated on 7/7/26" and a "View history" link. Career Cluster says "Added based on your career goal" (derived, not picked).
- **Empty tile:** a small icon and "No college goal chosen", same size as a filled tile.
- **One shared "Change goals" button** under the row. It opens a separate page (Plan > My Goals) with the same tiles, each with its own "Change goal" button, which opens a search modal ("Choose a career goal", search box, "Show military careers" toggle, Keep goal). Below that page: S.M.A.R.T. goals.
- **Goals are picked by search, not by saving.** Nothing in either video connects saving a career or school to a goal. Joshua's "save in Explore feeds the goal" flow is his own idea, not SchooLinks'.
- There are **no Reach/Target/Likely lists** in About Me and no Top 3; the College Goal is one school.

## The rest of the page (all add-forms with an emoji empty state)

- **My story:** My strengths, Things I'm proud of, My interests & hobbies (chips picked from a list).
- **Experience:** Job, internship & volunteer experience; Extracurricular activities & leadership roles (modal forms).
- **Bragging rights:** Awards & achievements, My skills, My languages (chip picker).
- **Academics:** education history, GPA, class rank, test scores.
- **Portfolio, Credentials.**
- **My videos:** record answers to prompts ("Can you briefly describe yourself in one minute?", "What are your strengths?").
- **References:** name, relationship, phone, email.

## Compared with our About Me

| SchooLinks | Ours | Call |
|---|---|---|
| Goal picture tiles at the top, label + name on the picture | Same: Career Goal + College Goal picture cards | Matches. Theirs carry dates and history links; ours don't, on purpose (less to read). |
| 5 goal types (post-secondary, career, cluster, college, major) | 2 (career, college) | Keep 2. Joshua named only these two. Cluster and major would be 3 more tiles to read. |
| Goals picked through a search modal | Goals fed by Explore saves, then sorted | Ours is Joshua's design and needs no separate picking step. |
| Separate My Goals page for changing goals | Tap a card to open that goal | Ours is one step shorter. |
| Strengths, proud of, hobbies, experience, awards, skills, references on the profile | Lives in our Resume tab | Don't duplicate on About Me. |
| Empty goal tile: icon + "No X chosen" | Empty card: "Pick a … you're working toward" | Same idea. |

**Bottom line:** the part Joshua borrowed, goal tiles first on the profile, is the part we built. The rest of SchooLinks' About Me is a long form-filled page that our Resume tab already covers, and copying it would add a lot of reading. Nothing here argues for adding text to the My Goals cards.

---

# Joshua's Replit About Me, clicked through (19 Oct 2026, second pass)

dceeai.replit.app/my-profile#overview. Every control on About Me and its two goal pages was clicked.

**About Me:** College Goal card on the left, Career Goal on the right. My Build rows: Industries, Subjects, Work style, Education, Location, Skills to build. "Edit My Build" opens the Preferences tab.

**College Goal is wired, through "Make #1", not through saving.** Saving NYU alone left the card on "Choose a school you're working toward". Pressing Make #1 on the Saved schools page (/colleges/saved) turned the card into "New York University · Finance · Location", with "View College Goal".

**College Goal page:**
- Primary college panel with "Change goal": opens an in-panel picker of ten schools, then Done.
- Reach / Target / Likely as stacked sections, two school rows per line. Each row's menu: Move to (the other two), Remove from Plan. The primary has a PRIMARY tag. These schools are demo seeds (Columbia, Rutgers, Fordham, Pace, William Paterson), not the student's saves.
- **Majors I'm considering:** Finance, Economics, Applied Mathematics; Edit Majors makes them removable and suggests "+ Computer Science", "+ Business"; Explore Majors link.
- Saved schools drawer ("0 saved" although NYU was saved: the Replit's two saved lists disagree), then a full-width Explore Schools button.

**Career Goal page:** primary career (Learn More, Career Report), My Top 3 (3 rows, PRIMARY tag), Saved careers (empty), full-width Explore Careers.

**Saved schools page (/colleges/saved, "Your decision board"):** a My Plan strip (career, education, program, #1 school), each saved school with an application status menu (Saved, Finalist, Applying, Applied, Accepted, Waitlisted, Denied, Enrolled), Compare, Make #1, remove; Goal history ("Today · #1 school changed to New York University"); a counselor snapshot preview.

**His answer to the Top 3 dead end:** the Top 3 tab ends with "Choose your #1 career to create your plan. Investment Banking is your #1" and **Go to My Plan**. My Plan is an 11-step checklist for the #1 career; step 5 is "Find your school fit". Each Top 3 card also has a "Suggested schools" slot (empty in the Replit: "School matches not available in this report").

## Ours vs his

| His | Ours |
|---|---|
| College Goal left, Career right | Career left, College right |
| Goal set by Make #1 (saves don't map) | Saves map straight in, #1 by star |
| Remove from Plan in each row's menu | Move only; removing means unsaving elsewhere |
| Majors I'm considering on College Goal | Not on About Me (saved majors live in the Career Report) |
| Change goal picker | Star a row |
| Skills to build in My Build | Not shown (our Build doesn't ask it) |
| Top 3 → Go to My Plan → "Find your school fit" | v2 (in progress): Top 3 banner → Find schools |
