# Dream Score (XP)

Status: Locked for the Build milestone. Later milestones and values are not specified yet.

## Concept (Joshua Pierce, Slack, 5 Sept 2026)
Complete a milestone → earn Dream Score → see it rise → want the next milestone. The unit shown to students is "XP"; the name of the system is Dream Score.

Framing for students: competitors (Duolingo, Khan Academy, Codecademy) award XP per completed activity and larger bonuses at milestones. Dreamari's spec so far awards XP at milestones (Build complete +100), so the one-time intro tooltip says "Your Dream Score. Earn XP as you complete milestones." Revisit the wording if per-activity XP is added.

## Implemented
- Build completion awards 100 XP once (`build-complete`), with the count-up moment described in build.md.
- The score shows as a small chip beside the menu on Build and Match (`FlowChrome`) as "<n> XP" with a sparkle; it bounces in with a ring flash when it changes. The app header (`DesktopNavigation`, from md), the Profile phone bar and Home show the same live figure; until any XP is earned they show the design placeholder 15,980.
- Store: `src/lib/dreamScore.ts` (`readDreamScore`, `awardDreamScore(milestone, points)`, `useDreamScore`). Prototype keeps it in `localStorage`; production stores it server-side and awards once per milestone id.

## Not yet specified
Points for Match, Top 3 saved, first simulation, roadmap steps; what replaces the 15,980 placeholder for a student who has not earned anything yet (0 XP, or hide).
