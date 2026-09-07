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

## Cards answer the pointer (Joshua Pierce, Slack, 7 Sept 2026; streaming-style per Chandu)
A tester hovered the career cards and never clicked. The fix is feedback, not copy: no instruction line, no button. On hover a poster card lifts 10px and grows 9%, above its neighbours, after a 120ms intent delay so a pointer crossing the row does not make every card jump; the photo eases in 6% and an accent ring appears. Keyboard focus shows the same state. Poster rows carry vertical padding (`poster-row`, `py-5`) so the grown card is not clipped by the scroller, on Explore, Home, the career detail rail and the report chooser. Hover-only, deliberately (Chandu, 7 Sept 2026): a one-time touch-device sweep hint on the first Explore card was tried and removed as unjustified noise -- the original finding was specific to desktop's lack of a hover-equivalent affordance signal (flat design without a way to test interactivity before clicking), never evidenced on touch, where a poster tile already reads as tappable by convention (Netflix/Spotify/App Store). The hover rule uses a doubled class so it outranks the shared `dm-tap` lift. `PosterCard` and `RankedPosterCard`, styles under `.poster-card` in globals.css. If a future test shows a genuine mobile tap-discovery problem, diagnose what specifically fails before reaching for animation again.

## Open cue moved dead center (Chandu, 7 Sept 2026)
The open-arrow's first placement -- a small round chip top right -- still read as ambiguous ("the arrow doesn't really make sense... make it obvious," direct feedback). Tucked in a corner it competed for attention with the salary chip and never sat where the eye already was (the photo's center). Replaced with the exact language a video thumbnail's own play button uses everywhere -- YouTube, Spotify, this app's own Play hub featured-card overlay (`FeaturedPlayOverlay` in `PlayHub.tsx`): the whole photo dims (`rgba(5,8,20,0.32)`) and one bold 52px circular badge (dark glass, white border, backdrop-blur) pops in dead center with a small bounce, `ArrowUpRight` at 24px. No caption, no button copy -- the single most over-taught "this is clickable" signal there is. Salary chip and title stay legible above the dim (they render after it in DOM, same z-layer). `.poster-dim`/`.poster-cue` in globals.css; the cue's centering lives entirely in the CSS transform now (not a Tailwind translate utility) so the pop-in's scale/opacity animation can't clobber its position.
