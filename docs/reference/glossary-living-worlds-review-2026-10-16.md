# Living worlds review

Scope: the shared scenery and the Software, Aviation and Nursing Level 1 art packs. Local review branch only. Content, question mechanics, scoring, release flags and Finance art are unchanged.

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
