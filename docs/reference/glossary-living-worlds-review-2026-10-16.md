# Living worlds review

Scope: the shared scenery and the Software, Aviation and Nursing Level 1 art packs. Chandu subsequently authorized pushing. This work does not change content, question mechanics, scoring, release flags or Finance art. Claude's subsequent content changes from `7e5aae21` were merged intact before release verification.

## Evidence before changes

Captures are under `output/glossary-living-worlds/before/`:

- `nursing-drift-question.png`: readable question panels, but one generic cloud mood through the level set.
- `software-signal-question.png`: the shared dusk city, with no visible sense of level progression.
- `software-signal-map.png`: current icon-led map and inline selected-level details. Keep this information architecture rather than replacing it with new navigation.
- `finance-drift.png`: protected welcome rendering path.

## Decisions

- Make variation deterministic and asset-free. A world chooses weather and its starting hour; levels move through a four-hour cycle. This avoids asking an artist for a background per lesson.
- Keep the existing shaded cloud geometry and pixel panorama, their slow depth motion, the inline feedback and Dreamy reactions. Add light, not another character or a busy environment behind the answers.
- Use existing semantic colours. A tier changes atmospheric depth, mastery warms the horizon, and correct/repair/selection cues briefly answer the student.
- Keep Finance on the original path, including its original map colour treatment. Registered custom map/backdrop files continue to work.
- Keep Level 2+ words-only. New art belongs to the five authored Level 1 terms and a welcome scene per industry, in each theme.

## Verification record

The final handoff records checks and screenshot coverage. Captures are local review artefacts, not served app assets. The code budget is twelve extra decorative nodes per non-Finance scene, no new event listeners, timers, raster background downloads or canvas. Real Windows/Chromebook GPU frame-time testing is not available on this Mac.

- Production build: `next build --webpack`, including TypeScript and 37 static pages, passes after merging Claude's changes.
- Reactions, 190 scored screens across 22 generated levels, scene contracts, 72 image hashes/alpha/byte budgets and all 508 tokens pass. Touched-file ESLint has zero errors and three existing engine warnings.
- Recaptured all 64 question/map states after the merge: Software and Nursing, Levels 1–4, Drift and Signal, at 1280×800 and 375×812. All checked page/internal map overflow values are zero; every selected map Play action is visible. Reviewed the eight layout contact sheets. The compact Drift secondary map row now spans the grid instead of squeezing its title into half a row.
- Twelve welcome/first-teach art captures cover all three industries in both themes. Flip-to-example/back, later-level words-only cards, direct wrong-to-right correction, and the Finance bypass were also checked. Original sources and rejected generations remain local; only 2,231,694 bytes of validated WebPs are served.
- Release scope is code and assets only. The hub release flags remain unchanged. No new per-level background assets are required.
