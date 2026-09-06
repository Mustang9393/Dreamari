# My Profile: My Plan (roadmap)

Status: Locked for finance careers (Investment Banking, Private Equity). Other careers keep placeholder steps that follow the same rules but are not official copy.

## Rules (Joshua Pierce, Slack, 5 Sept 2026)
- Action label leads every task: EXPLORE, PLAY, CONNECT, DECIDE, BUILD, PLAN, EXPERIENCE, APPLY.
- No minutes anywhere.
- Each level groups tasks under In app and Out of app.
- In-app rows link straight to the feature. Out-of-app rows have no link unless a supporting page exists (the counselor meeting opens the Career Report).
- BUILD: Build Profile is the first Level 1 task and is already checked, so a plan opens at 1 of 13 (8%), never 0%.
- The Next step banner (see top-three.md) sits under the plan header.
- Progress bar sparks on growth and every 7 to 15 seconds.

## Finance roadmap (verbatim)
Level 1 · Next 3 Months · Foundation
- In app: BUILD Build Profile (done) · EXPLORE 10 Finance Careers and save your Top 3 (`/explore?tab=browse`) · PLAY 3 Career Simulations from your Top 3 (`/play`) · CONNECT Ask 2 Finance Professionals one career question each (`/connect`)
- Out of app: PLAN Meet your counselor to align next year's classes (`/profile?tab=report`)

Level 2 · Next 6 Months · Skills + People
- In app: DECIDE Choose your #1 Career from your Top 3 (`/profile?tab=top3`) · PLAY Complete 3 Skill Games for your #1 Career (`/play`) · CONNECT Ask 3 Professionals in your #1 Career about starting (`/connect`)
- Out of app: EXPERIENCE Complete 1 Club, Project, or Job Shadow

Level 3 · Professional Readiness
- In app: BUILD Complete your Resume for your #1 Career (`/profile?tab=resume`) · PLAY Complete 3 Glossary Games for your #1 Career (`/play/glossary/investment-banking`) · CONNECT Ask 3 Professionals in your #1 Career for advice (`/connect`)
- Out of app: APPLY Apply to 5 Internships, Programs, or Job Shadows

## Data
`PlanTask { id, label, action, href?, outOfApp?, doneByDefault?, custom? }`, `FINANCE_PLAN(prefix)` in `src/components/profile/data.ts`. Student-added steps are `custom` with action PLAN, out of app.
