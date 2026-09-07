# My Profile: header, Overview, Resume (`/profile`)

Status: Overview in review (Do this next pattern open with Joshua); header locked; Resume placeholder.

## Header
Cover photo (six options, picker) with name and school over it. Three compact tiles, left-aligned, one row at every width, in this order: "Grade 11", "GPA 3.7", "12 day streak · Active 142 of 190 days" (subtext from desktop only). Icons stay. Cover / Saved / Settings controls top right. The Dream Score is not a tile here: it stays in the app header on every page, Profile included, the way it lands there after Build (Joshua Pierce, Slack, 6 Sept 2026).

## Tabs
Overview · Top Three · My Plan · Report · Resume. Query `?tab=`. Links to `/profile?tab=…` from inside the profile switch tabs.

## Arrival from Match (`?welcome=1`)
The profile assembles in (title, then header card, then tab card), then the "Welcome to Your Profile" popup (Dreamy, caption "Your Top 3 is saved.", Continue) over a light scrim. Continue clears the flag and scrolls so the tabs sit 84px under the nav with the Top Three cards below.

## Overview
Three tiles: My Top Three (n of 3 chosen), My Plan (n of 13 steps + bar), Career Report (5 sections).
"Do this next" (official copy, buttons are the verbs of the sentences):
- [Explore] 10 Finance Careers and save your Top 3 → `/explore?tab=browse`
- OR
- [Play] Your #1: Day in the Life of an Investment Banker Simulation → `/play/investment-banking`
Open question with Joshua: whether the button-as-verb pattern stays, and whether to show one line based on Top 3 state.

## Resume tab
"Resume Builder" + "Coming soon" chip. Nothing else until the feature exists.

## Files
`src/components/profile/ProfileExperience.tsx`, `data.ts`.

## Next step banner (Joshua Pierce, Slack, 5 and 6 Sept 2026)
"Your next step · Play your #1 Career Simulation to see if it’s really your #1." with a Play button and an X (dismissal remembered in `dreamari:top3-next-step-dismissed`, shared by both tabs). `NextStepBanner` with `emphasis="priority"`. Top Three: under the cards. My Plan: at the foot of the plan, under Level 3, so it never interrupts the plan's order. After the simulation is completed the banner should update to the next recommended action (not built).

The Play button routes to `/play?focus=investment-banking` -- the Play hub, with Investment Banking pre-selected as the hero card -- not straight into the simulation (Joshua Pierce, Slack, 7 Sept 2026: the Prime Video/Apple TV pattern, the content page — trailer, Express mode, level ladder — before playback). "Routes to Investment Banking for now; the dynamic #1 routing is a later step" still holds -- this only changed the DESTINATION shape, not which career it targets. See "HUD deep-links..." in `play.md` for how `?focus=` is read.

The `priority` surface itself changed the same day: it used to be a solid brand-blue-to-violet gradient with white type -- the one saturated, off-palette block on an otherwise dark page (direct feedback: "not sure about the color... doesn't feel cohesive with the page"). It now uses the same dark inset surface as the `quiet` banner; "priority" reads through a shorter, more insistent pulse/flash on the border glow and the CTA's ring instead of a color that doesn't belong. See `NextStepBanner.tsx`.
