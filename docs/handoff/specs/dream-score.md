# Dream Score (XP)

Status: Locked for the Build milestone. Later milestones and values are not specified yet.

## Concept (Joshua Pierce, Slack, 5 Sept 2026)
Complete a milestone → earn Dream Score → see it rise → want the next milestone. The unit shown to students is "XP"; the name of the system is Dream Score.

Framing for students: competitors (Duolingo, Khan Academy, Codecademy) award XP per completed activity and larger bonuses at milestones. Dreamari's spec so far awards XP at milestones (Build complete +100), so the one-time intro tooltip says "Your Dream Score. Earn XP as you complete milestones." Revisit the wording if per-activity XP is added.

## Implemented
- Build completion awards 100 XP once (`build-complete`), with the count-up moment described in build.md.
- The score shows as a small chip beside the menu on Build and Match (`FlowChrome`) as "<n> XP" with a sparkle; it bounces in with a ring flash when it changes. The app header (`DesktopNavigation`, from md, on every page including Profile) and Home show the same live figure (0 XP before Build). The Profile hero does not carry a Dream Score tile (Joshua Pierce, Slack, 6 Sept 2026).
- Store: `src/lib/dreamScore.ts` (`readDreamScore`, `awardDreamScore(milestone, points)`, `useDreamScore`). Prototype keeps it in `localStorage`; production stores it server-side and awards once per milestone id.

## Glossary lessons (6 Sept 2026)
Finishing a glossary lesson awards its `xpReward` (20 XP today) to the shared Dream Score once per lesson (`glossary:<career>:<lesson>`), and the completion screen shows the shared total. The game no longer keeps a private "Dream Score" multiplied by 100, which is where the 15,000-plus figures came from.

## Hover tooltip (Joshua Pierce, Slack, 6 Sept 2026)
Hovering or focusing the score chip (Build and Match chip beside the menu, and the app header score) shows a compact tooltip under it: "Earn Dream Score by exploring careers, playing games, and building your profile. The higher your score, the more you unlock." 240px wide, two lines, closes on leave, blur or Escape. `DreamScoreTip` in `src/components/app/DreamScoreTip.tsx`. The one-time intro tooltip after Build is unchanged.

## Not yet specified
Points for Match, Top 3 saved, first simulation, roadmap steps. The 15,980 placeholder is gone; a student who has earned nothing sees 0 XP.

A full proposal for everything after Build (Dreams, Your Sky, Altitude levels, milestone badges, six badge families, editions, secrets, XP table) is in progression-system.md. It is a proposal for Joshua's review, not a locked spec.
