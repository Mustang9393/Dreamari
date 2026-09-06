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
