# Match (`/match-grid`)

Status: Locked (27 Sept 2026). Joshua's simplified Mini Explore replaced the six-card grid, which replaced the swipe deck (both dormant: `MatchGrid.tsx`, `MatchLab.tsx` at `/match-lab`). Build's "See my matches" and "Skip" and every Match link still route to `/match-grid`.

## Why
Joshua, Slack, 27 Sept 2026: "simplify the current Match / Mini Explore flow and reduce the amount of information students have to process", so "the low-effort student [can] complete Build, save one career, and immediately leave with a Profile and Career Report". "This can replace the current 'MATCH' and be in the actual demo."

## Mini Explore
- Title "Save careers you like". World tabs: the student's first Build world, their second, then "Explore all" (any other world, neighbours first).
- Careers per world ordered by the student's Build answers (`rankForStudent`: matched subjects, then the college/trades answer). DEMO-ONLY: the demo's own careers come first (`demoFirst`), Investment Banking at the top.
- Six careers at a time; more load in on scroll (`RevealGrid`).
- Card shows only: Learn more and the title in its world's poster face. No "Fits..." chip (removed 28 Sept 2026: the world chip was implied by the tab, then all chips were dropped), no salary (inconsistent across careers; it lives in the detail modal), no world label (the tab says it). The Build fit still decides the order. Save pill top right, pulsing on the first card until the first save.
- Tapping a card opens the detail modal (What You'd Do / Good Fit If You Like / School & Path, with salary there).
- Up to 3 saves. The bottom bar's tray shows three slots; a fourth save shows "Remove one first to save this career."
- CTA: "Save a career" (disabled at 0), "Continue" at 1, "See my Top 2" / "See my Top 3" at 2 or 3. Every CTA goes straight to Profile.
- No intro splash or coachmarks: the screens teach themselves.
- No Build answers in this browser (Build skipped): a short stand-in asks for worlds, subjects and college/trades first.

## No ranking screen (removed 28 Sept 2026)
Joshua: "remove the page or the screen that says your top 3 for now... it just brings them straight to the my profile... people said that it was unclear that they could remove a career." Saves cap at 3, so the screen only re-ordered the same cards. The save order is the starting rank; Profile's Top Three is where the student reorders (arrows on each card's rank pill) or removes (X on each card, Undo in the freed slot). The rank step's code stays for the Flow Lab's own "Saved" button only.

## Handoff
`writePicks({ ids, focus: ids[0] })` then `/profile?picks=...&focus=<first>&tab=top3&welcome=1`, so the first save arrives as #1 instead of being re-sorted by match strength. One save lands with #1 filled and #2, #3 open (Profile's own open-slot and Explore affordances). DEMO-ONLY: `demoPicks` maps a career Profile cannot show to the next unused demo career.

## Files
`src/components/match-lab/MiniExploreMatch.tsx` (route wrapper and handoff), `src/components/flow-lab/V2Flow.tsx` (the flow, `onFinish` = demo mode), `shared.tsx` (card, tray, rank slots), `lab.ts` (ordering, `MAX_SAVED = 3`, demo mapping). The Flow Lab at `/flow-lab` plays the same flow in isolation and still ends on its own Top Three mock.
