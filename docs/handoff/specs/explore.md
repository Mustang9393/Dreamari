# Explore (`/explore`)

Status: Locked.

## Tabs
For You (reel of matched careers) and Browse All (poster grid by world, search, sort by Recommended / A–Z / Salary).

## Rules
- Every salary shown is one U.S. median per career, labelled "Median salary" (reel) or shown as a chip on posters. Values match the Career Report.
- Browse carries the "Videos Inside Leading Companies" rail: Mars, JPMorgan Chase, EY, AT&T, WildBrain, Kellogg's, in that order, no company twice in a row. Designed covers with the title baked in; a play badge top right; the company mark below; an X on the card closes the player. Logos use the ink token so they read in light mode.
- Current brand marks: JPMorganChase wordmark (2024), HSBC (2018) mark.

## Files
`src/components/app/ExploreExperience.tsx`, `catalog.ts`, `CompanyVideoCards.tsx`, `companyVideos.ts`, `PosterCard.tsx`.

## Cards answer the pointer (Joshua Pierce, Slack, 7 Sept 2026)
A tester hovered the career cards and never clicked. The fix is feedback, not copy: no instruction line, no button. On hover a poster card lifts 6px and grows 2%, the photo eases in 5%, a ring in the accent appears, and a small open-arrow chip fades in at the top-left; keyboard focus shows the same chip. On touch devices the first card carries a one-time light sweep (twice) and the chip pulses, remembered in `dreamari:explore-card-hint-seen`. `PosterCard` and `RankedPosterCard`, styles under `.poster-card` in globals.css. If the next round of testing still misses it, the next step is a first-visit hint, not permanent copy.
