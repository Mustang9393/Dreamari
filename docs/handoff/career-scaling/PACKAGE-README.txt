Dreamari career scaling pack · v1.2 · 20 October 2026

Start with README.md, game-build-prompt.txt, art-master-prompt.txt and artifact-master-prompt.txt.
The UX example is an AI-authored Level 1 QA candidate. Human content and art approval remains pending.
37 beats, 10 decisions, 15 selected full scenes, 7 canonical work graphics on 13 beats, one mid-game review.
This source package plugs into the Dreamari engine; it is not a standalone executable game.
Implementation release: 6150d86740ce642562b0045cb2e80e450325e355.
Playable: https://dreamari.vercel.app/play/ui-ux-designer (hamburger → UX Designer · QA draft).

Selected artwork is in assets/ux/v4, with matching face chips. No runtime sprites.
ux-scene-generation-v4.json records final POV generation prompts and original local reference provenance. Earlier intermediate input images are not all bundled; these records are an audit trail, not a portable deterministic rerun recipe. Use the bundled selected scene as the anchor for future scoped edits. Exact file reuse is pixel-identical; fresh generations are not guaranteed identical.
exact-image-prompts.json and the failed protected-pixel experiment document the original three-scene proof. Their findings are historical; see the current coverage map, cast record and v4 scene prompts for the selected revision.

Shared native flow, notes, interface and comparison renderers use canonical data. Two other-career fixtures show structural reuse; they do not constitute completed additional games.
See ux-runtime-checks.json for checks actually run and open QA. Later levels are unbuilt. Resume remains disabled by the prototype's DEMO_START_FRESH setting.
