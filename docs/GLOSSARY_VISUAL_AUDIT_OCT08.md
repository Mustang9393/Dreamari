# Glossary Lab visual audit, 8 October 2026

## Baseline and scope

Started at `d50a04a0`, incorporating Claude's interactive-world, viewport-fit, Signal eye and Orbit contrast fixes. Fetched and fast-forwarded to `396334c6` before release; its unrelated Play/counselor changes remain intact.

User direction: "different ILLUSTRATION STYLE", richer Vice City/cyberpunk Horizon, matching Dreamy, less clutter. Questions, choices, definitions, examples, sequence, scoring and correction handlers were not edited. Signal art and panorama are unchanged. No generated raster backgrounds. Lab navigation remains in hamburger Quick Links.

## Journey audit

| Step | Finding | Change | Verification |
| --- | --- | --- | --- |
| 1. Welcome | Horizon wireframes still felt like the same medium; dark gates lacked richness | Five painted word assets, painted Dreamy, procedural dusk/sunset/city parallax and street reflections | Visually inspected desktop 1366×768, phone 390×844; image loads complete |
| 2. Teaching | Theme-specific Dreamy was missing; image padding could vary | Horizon painted portraits, Orbit ink/watercolor portraits; normalized alpha canvases and 256px HUD variants | Flipped definition to original example, progressed all five terms |
| 3. Unlocked terms | Reward composition needs a compact payoff, not a bottom-pinned CTA | Retained Dreamy-centered five-card composition and existing viewport-fit safeguard | Horizon phone reward fits with CTA directly under gallery |
| 4. Choice feedback | Full-height question stage left a large gap before feedback | Content-sized stage measured against parent budget, sibling feedback and gaps | Wrong choice corrected freely; mastery credited at Continue; phone feedback follows answers |
| 5. Matching | One generic treatment across materials | Paper print/ink-link treatment for Orbit; neon flash/link treatment for Horizon; soft seat for Drift | Matched five pairs, unlinked and rematched; 360×640 final feedback visible, no scroll |
| 6. Sorting | Nested panel clutter, missing paper-text contrast | Removed redundant wrappers outside Signal, consistent bucket sizing, landing motion, Orbit ink labels | Native browser drag into Signal bucket; moved wrong placement back by tap; Orbit tablet all four placements |
| 7. Maths | Orbit mission text was white on light paper | Ink-colored mission, themed input/surface styling preserved | Original $100,000 revenue/$40,000 profit validated; 844×390 landscape fit |
| 8. Power Play and completion | Heavy generic CTA shadow leaked into Orbit | Lighter paper CTA depth; retained themed bonus/completion surfaces | Five original blanks completed, mastery loading and lesson completion reached |
| 9. Controls | Audit persistent controls, not just first page | Existing theme/restart controls preserved, focus and press cues improved | Changed themes mid-question; restart returns to welcome; mute toggles; level map chapters 1–4 to 5–8, closes correctly |

## Art direction and asset provenance

- Drift: retained soft 3D cloud/objects.
- Signal: retained bespoke pixel art and animated panorama.
- Orbit: existing paper-cut words plus new ink-and-watercolor Dreamy happy, curious and celebration portraits.
- Horizon: opaque angular painted planes, visible brush texture, indigo shadows, cream/cyan highlights and magenta edge light. Five word illustrations plus happy, curious and celebration Dreamy portraits. No limbs or human mascot.
- Three portrait anchors map guidance, curiosity and celebration. These are raster illustrations with existing motion, not a rigged 3D character.
- Eleven native ImageGen originals were personally inspected before integration. Creative Production board invocation was unavailable; local review used instead.
- `scripts/glossary-art/normalize-painted.mjs` records original output identifiers and technical normalization. It trims alpha margins, preserves aspect ratio, centers within a padded 768px canvas and produces 768/256px WebP pairs. No recoloring or generated-background compositing.
- Reference principles: [Fortiche/Arcane behind the scenes](https://www.netflix.com/tudum/features/arcane-season-two-behind-the-scenes), [Riot material and gameplay clarity](https://www.riotgames.com/en/news/valorant-shaders-and-gameplay-clarity). Reference medium and painted light, not copied characters or scenes.

## Validation and limits

- TypeScript: passed. ESLint: zero errors, one pre-existing page font-link warning. Tokens: 508 validated, generated artifacts current. Production build: 36 pages generated. `git diff --check`: clean.
- IAB visual checks: 1366×768 desktop, 768×1024 tablet, 390×844 and 360×640 phones, 844×390 landscape. Observed screens did not scroll; desktop current images all loaded. Latest console error/warning scan was empty.
- Scoped scrollbar/native-control self-check: no added scrolling containers, native pickers, browser dialogs or unbounded portal-position calculations. Reduced-motion alternatives remain in place.
- Not exhaustive platform certification: Windows/ChromeOS/Firefox/Safari hardware and display scaling were not exercised. Very short landscape layouts still use the existing scale-to-fit fallback; inputs become smaller with feedback present. Smallest-phone matched tiles measured about 43px, so a future touch-target pass should improve that without reintroducing scrolling.
- No new music or sound generation in this pass. Existing sound hooks preserved; mute and playback-start controls checked. Subjective audio quality is not certified by this visual audit.

## Evidence

Local screenshots: `/Users/chandump/dreamari-glossary-oct08-artifacts/audit-post-claude-oct08/`.

Key frames: `horizon-before.png`, `horizon-final-desktop.png`, `horizon-flash-phone.png`, `horizon-reward-phone.png`, `horizon-match-final-phone.png`, `orbit-sort-tablet.png`, `drift-final-desktop.png`.
