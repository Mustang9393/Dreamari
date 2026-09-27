# Match (`/match-grid`)

Status: Locked (27 Sept 2026). Joshua's simplified Mini Explore replaced the six-card grid, which replaced the swipe deck (both dormant: `MatchGrid.tsx`, `MatchLab.tsx` at `/match-lab`). Build's "See my matches" and "Skip" and every Match link still route to `/match-grid`.

## Why
Joshua, Slack, 27 Sept 2026: "simplify the current Match / Mini Explore flow and reduce the amount of information students have to process", so "the low-effort student [can] complete Build, save one career, and immediately leave with a Profile and Career Report". "This can replace the current 'MATCH' and be in the actual demo."

## Mini Explore
- Title "Save careers you like". World tabs: the student's first Build world, their second, then "Explore all" (any other world, neighbours first).
- Careers per world ordered by the student's Build answers (`rankForStudent`: matched subjects, then the college/trades answer). DEMO-ONLY: the demo's own careers come first (`demoFirst`), Investment Banking at the top.
- Six careers at a time; more load in on scroll (`RevealGrid`).
- Card shows only: Learn more, the title in its world's poster face, and the "Fits..." chip at the bottom (e.g. "Fits Mathematics", "Fits Tech & Engineering"). No salary (inconsistent across careers), no world label (the tab says it). Save pill top right, pulsing on the first card until the first save.
- Tapping a card opens the detail modal (What You'd Do / Good Fit If You Like / School & Path, with salary there).
- Up to 3 saves. The bottom bar's tray shows three slots; a fourth save shows "Remove one first to save this career."
- CTA: "Save a career" (disabled at 0), "Continue" at 1, "Rank my top 2" / "Rank my top 3" at 2 or 3.
- No intro splash or coachmarks: the screens teach themselves.
- No Build answers in this browser (Build skipped): a short stand-in asks for worlds, subjects and college/trades first.

## Rank (two or three saves only)
"Your top 2, for now" / "Your top 3, for now": one numbered slot per save above the saved cards. Tap order fills #1, #2, #3; tap a filled slot to clear it. CTA "Pick N more", then "See my Top 3". Back arrow returns to browsing.

## Handoff (unchanged)
`writePicks({ ids, focus: null })` then `/profile?picks=...&tab=top3&welcome=1`. One save lands with #1 filled and #2, #3 open (Profile's own open-slot and Explore affordances). DEMO-ONLY: `demoPicks` maps a career Profile cannot show to the next unused demo career.

## Files
`src/components/match-lab/MiniExploreMatch.tsx` (route wrapper and handoff), `src/components/flow-lab/V2Flow.tsx` (the flow, `onFinish` = demo mode), `shared.tsx` (card, tray, rank slots), `lab.ts` (ordering, `MAX_SAVED = 3`, demo mapping). The Flow Lab at `/flow-lab` plays the same flow in isolation and still ends on its own Top Three mock.
