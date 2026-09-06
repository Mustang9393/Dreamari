# Dream Score (XP)

Status: Locked for the Build milestone. Later milestones and values are not specified yet.

## Concept (Joshua Pierce, Slack, 5 Sept 2026)
Complete a milestone → earn Dream Score → see it rise → want the next milestone. The unit shown to students is "XP"; the name of the system is Dream Score.

## Implemented
- Build completion awards 100 XP once (`build-complete`), with the count-up moment described in build.md.
- The score shows as a small chip beside the menu on Build and Match (`FlowChrome`) as "<n> XP" with a sparkle; it bounces in with a ring flash when it changes.
- Store: `src/lib/dreamScore.ts` (`readDreamScore`, `awardDreamScore(milestone, points)`, `useDreamScore`). Prototype keeps it in `localStorage`; production stores it server-side and awards once per milestone id.

## Not yet specified
Points for Match, Top 3 saved, first simulation, roadmap steps; where the score appears in the main app header (the header currently shows a placeholder "15,980 XP" from the design).
