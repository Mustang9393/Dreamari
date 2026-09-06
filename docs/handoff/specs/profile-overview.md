# My Profile: header, Overview, Resume (`/profile`)

Status: Overview in review (Do this next pattern open with Joshua); header locked; Resume placeholder.

## Header
Cover photo (six options, picker) with name and school over it. Four compact tiles, left-aligned, one line each, in this order: "Dream Score 100 XP" (live; phone label "Score"), "12 day streak · Active 142 of 190 days" (subtext from desktop only), "Grade 11", "GPA 3.7". Phones show them as a 2×2 grid. Icons stay. Cover / Saved / Settings controls top right. On this page the top nav hides its streak and XP counters (the hero carries them).

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
