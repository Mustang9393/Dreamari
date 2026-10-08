# Signal readability and Horizon neon signs

9 October 2026. Baseline `60b78447`, fetched from main before editing. This is a scoped follow-up to the previous visual pass, not a full-platform accessibility certification.

## Why

Chandu supplied four laptop screenshots: pixel sentences and images were too small, match columns were cramped, the five unlocked cards needed more presence, and success dialogue crowded the stage. Chandu also rejected Horizon's painted cyberpunk objects: "Use more vice city neon sign board stuff in there. Forget cyber punk."

Lesson data, copy, questions, choices, order, correctness and progression remain unchanged. Changes apply to Glossary LAB only. Its hamburger Quick Links entry is unchanged. No bitmap background was generated.

## Numbered journey review

1. **Welcome and teaching:** Horizon now uses retro Miami enamel/neon illustrations. The five objects and three Dreamy expressions share one illustration medium. Dreamy is only a floating cloud. Signal keeps its original pixel art, rig, panorama and music. Signal definitions use readable mono sentences rather than tiny pixel lettering.
2. **Five-term payoff:** Signal retains Dreamy at the centre and five cards around it. Desktop cards are 192×132 at the 1440×780 sample, with 92px artwork; mobile uses a three-column composition. A legacy absolute-position rule and duplicate cloud were removed from this state. Start practice stays directly under the group.
3. **Applying knowledge:** Signal prompts and answers use stronger, larger mono type on opaque ink surfaces. Pixel type is retained for short labels. HUD, question and feedback share a stage width. HUD term icons are larger, with existing accessible mastery labels.
4. **Matching:** drag a term to an example. A glowing curved tether follows the pointer, and the target lights up without revealing correctness. Drop uses the existing match handler. Wrong drops do not lock a selection or change grading. Tap-to-match, keyboard button activation and tap-to-unlink remain. Pointer capture supports mouse, pen and touch. Coordinates account for the existing viewport-fit transform. Timer cleanup prevents an older animation clearing the newest match feedback.
5. **Matching composition:** concept and visual columns have a distinct gutter. Signal sentence labels use mono, art is 86×62 on desktop, and tile height stays consistent. Connector dots sit on facing edges, not beneath labels. Completed phone rows measured 54px tall at 360×640.
6. **Inline payoff:** keep the existing pixel coin/cloud animation and authored explanation. Bound the decoration beside Dreamy, align title and Continue, and reserve the explanation row. Completed phone feedback measured about 133px, compared with the initial 228px inherited layout. Undo clears stale feedback and returns the board to its unanswered layout.
7. **Sorting, maths, bonus and finish:** larger Signal sorting art and clearer labels. Real bucket dragging, original seven-question progression, editable maths, five Power Play blanks and 100% completion were exercised. No interaction type was replaced with multiple choice.

## Horizon asset direction

Reusable generation brief: an isolated transparent retro Miami neon sign illustration, flat enamel fills with cream/gold tubing, hot pink and turquoise accents, a dark navy rim and crisp readable silhouette. Not a clay render, painterly cyberpunk object, chrome robot, UI card, scene or background. No lettering, trademark logos or other characters. Preserve Dreamy's cloud lobes, navy star eyes and joyful face; no limbs or torso.

Semantic briefs:

- Company: a sneaker boutique with striped awning, sneaker sign and sneaker window.
- Product: one clearly legible lateral sneaker.
- Service: sneaker customization with a paintbrush and palette.
- Customer: Dreamy beside a shopping bag with sneaker, holding nothing.
- Profit: three star-marked coin stacks.
- Dreamy: happy, curious and celebration cloud portraits in the same enamel/neon medium.

Three asset-only workers used the native ImageGen tool, then the main agent visually inspected all eight originals. Initial swoosh-like shoe marks were rejected and regenerated as plain stitch panels. The unavailable Creative Production board was replaced with local visual review. No agent edited application code.

`scripts/glossary-art/normalize-neon.mjs` records exact source identifiers. Technical processing trims empty alpha, preserves aspect ratio and centres each asset in a 768px canvas. Each has a 256px WebP variant for HUD/activity use. The full set is approximately 732 KiB. Previous artwork remains available for rollback; runtime now selects `horizon-signs` paths.

## Evidence and verification

Local images: `/Users/chandump/dreamari-glossary-oct08-artifacts/signal-readability-oct08/`.

- `07-unlock-phone-after.png`: compact reward composition.
- `09-match-phone-after.png`: completed matching and inline explanation at 360×640.
- `10-horizon-neon-welcome.png`: new neon signs in the welcome composition.
- `11-horizon-neon-terms.png`: all five objects and Dreamy together.
- `12-signal-match-laptop.png`: separated matching at 1280×720.
- `13-signal-match-tablet.png`: matching at 768×1024.

Browser checks: 360×640 and 390×844 phones, 768×1024 tablet, 1280×720 laptop, 1440×780 desktop and 1920×1080 wide screen. Measured samples had no page scroll. Real native browser drags successfully matched, recovered from a wrong drop and sorted an item. Completed matching could be undone and rematched. Horizon welcome/teaching/unlock assets loaded without distortion or missing images.

React review: no new package or network request, pointer state stays local, transient gesture state uses refs, animation timers are cleaned up, decorative tether is hidden from assistive technology, accessible tap/keyboard alternatives remain. Existing reduced-motion rule disables tether animation.

Static checks: TypeScript passed; scoped ESLint has zero errors and one existing font-link warning; 508 semantic tokens validated and generated artifacts current; diff whitespace check passed. Initial full production build generated 36 pages. Final refined bundle compilation also passed. The existing middleware deprecation notice is unrelated.

Limits: this is not every lesson/theme/device combination. Native iOS/Android touch, keyboards, Safari/Firefox, Windows and Chromebook display scaling were not exercised. No subjective sound-quality review or new audio assets in this pass. Later lessons and extreme text enlargement need hardware accessibility QA. The existing short-landscape scale-to-fit fallback is unchanged.
