# Build (`/flow`)

Status: Locked (5 Sept 2026).

## Steps
Interests → Subjects → Work vibe → 50% milestone ("You're moving fast." + Continue) → Education → Cost (slider) → Location → Profile Basics (name, school, grade, GPA, zip, distance) → Completion.

## Completion screen (the only end screen)
Copy, in order: "Congratulations!", "+100 XP" (counts 1→100 over about 1.1s), "Your personalized career matches are ready.", button "Reveal My Matches" → `/match-lab`. Back is available.

Moment, in order: count-up with a low square-wave rising tone; on landing the number pops, Dreamy celebrates with bursts, the chime plays, the background pulses out from Dreamy (glow only, no ring), fine round sparkles bloom; after ~0.9s the number lifts, floats and shrinks into the header chip slot with a trail of sparks; the chip "100 XP" bounces in beside the menu. Points bank when the score arrives, or on leaving the screen if Reveal is tapped first. Awarded once (`build-complete`).

Removed by instruction: the loading beat with the hard-hat Dreamy, the second "matches are ready" screen, confetti.

## Flight target fix (Chandu, 7 Sept 2026)
The "+100 XP" flight's landing spot used to assume the header chip is always 84px wide (a hardcoded half-width of 42px next to the menu button) -- exactly right only for a fresh score's first-ever "100 XP", off-center for any other total, and on a narrow viewport a wide total could push the assumed landing spot toward the edge (direct feedback: "doesn't perfectly slot into the chip properly... goes off screen"). It now measures the REAL chip width before the flight: an invisible probe carrying the chip's own classes and the exact total the milestone will bank to (`peekDreamScoreAfter` in `dreamScore.ts`, a read-only preview of what `awardDreamScore` would return) sits offscreen just long enough to read its rendered width, then is removed. Verified with a 3-digit ("100 XP") and a comma'd 4-digit ("3,950 XP") total: the clone lands exactly centered on the real chip both times.

## Other rules
- Skip link (no underline) → `/match-lab`.
- Full-screen aurora ripple only at the 50% milestone and the completion; every other tap is Dreamy-local.
- Header HUD stays pinned; content scrolls inside.

## Files
`src/components/build/BuildFlowExperience.tsx`, `steps.tsx`, `ui.tsx`, `sound.ts`, `src/lib/dreamScore.ts`, `src/components/app/FlowChrome.tsx`.

## Profile Basics (Joshua Pierce and Usman, Slack, 6 Sept 2026)
Full Name and School Email are not asked; they come from sign-up. The step asks Grade, GPA, Zip Code (cleared for FERPA and COPPA; a street address is never asked) and how far the student would go for school. Finish needs Grade and GPA.
