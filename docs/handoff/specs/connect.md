# Connect (`/connect`)

Status: Locked (5 Sept 2026). Role switch and volunteer picker are demo-only.

## Student home
Community / Events switch, search, "Your Communities" cards, "What should we launch next?" votes, Professionals to Follow (faces, first name, role, company, Follow).

## Community card (one component, everywhere)
`src/components/connect/CommunityCard.tsx`: cover photo, name, three stat tiles (Students, Pros, Companies), two company marks then a "+N" chip (opens a panel; closes on outside tap or scroll), Open button. The whole card is the tap target. Used on the home, the professional profile and the volunteer dashboard.

## Community boards
Tabs Questions / Posts / About; the ask composer sits under the board header. Answers carry Like, Share, Report, Follow.

## Event boards
Ticket cards (whole ticket tappable: opens the board, or the code sheet when not joined). Board tabs: Questions, Posts, Insights, Resources, People, About. Resources: Photos (gallery of one large and four small frames with the remaining count; full-screen viewer) then Files (icon, title, one meta line; folders expand on tap). Photos are licensed Commons photography for the prototype (`public/images/connect/events/ATTRIBUTION.md`).

## Professional profile (as students see it)
Personal cover from the same six covers as the student profile (never the employer's colours; the professional can pick one on their own view), name, tier badge, role · company mark, Follow. Views · Followers · Likes in short form (48.1K). Personal story and verification line. Panels: "Ask Me" (composer, then answered questions in the same card), "My Posts", "Communities" (the shared card), "About Me" (Education, Can help with). Dreamari blue for every industry.

## Volunteer view
The Volunteer role opens the profile as students see it; "My dashboard" opens the private dashboard (My Profile: routed questions, posts, communities; My Impact: numbers, chart, activity status, company card, impact summary) in Dreamari blue. Back returns to the profile.

## Content rules
- All 24 professionals use the new headshots (`pro-<id>.jpg`).
- No question or answer describes long hours, boredom, dislike, or any downside of an employer or profession. Questions are framed as career insight.
- Students never have follower counts; there is no messaging.

## Files
`src/components/connect/ConnectExperience.tsx`, `ProProfile.tsx`, `ProDashboard.tsx`, `CommunityCard.tsx`, `primitives.tsx`, `data.ts`.

## Demo role switcher (6 Sept 2026)
The five-role switcher (Student, Attendee, Volunteer, Partner, Staff) is hidden behind a small "Demo" button at the top of Connect. A student sees only the button; pressing it reveals the roles. Once a non-student role is showing the roles stay visible so the way back is obvious. Demo only, never a product feature (Joshua Pierce, Slack, 6 Sept 2026).

## People tab (Joshua Pierce, Slack, 6 Sept 2026)
Connect has three tabs: Communities, Events, People. Notifications (your questions, new from people you follow) moved behind the bell beside the tabs. People: the shared search box (placeholder "Search professionals, careers, companies") plus three filters, careers (field), industries (world), companies (org), all derived from the verified professionals in `data.ts`. With no search or filter, three rows of four cards: Recommended for You (ranked against the student's worlds), Popular This Week (followers), New Professionals (most recent verification). With a search or filter, one grid of matches. Card: portrait, name with the verified mark, role, company, View profile, Follow, "students reached · followers". `src/components/connect/PeopleTab.tsx`. Nothing ranks students. Reference: Joshua's Replit People tab, 6 Sept.

## Professional profile, one surface (Joshua Pierce, Slack, 6 Sept 2026)
The header (cover, portrait, name, tier, role, company mark, Follow, three numbers, story, verification) is the anchor. Under it, one panel holds four ruled sections in a fixed order: Ask Me, My Posts, Communities (rows with the community's accent mark, name, students and companies), About Me (education, can help with). Plain section titles, no eyebrows. No section is its own floating card. `ProfileSection` in `ProProfile.tsx`.
