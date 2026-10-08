# Glossary game layout proposal

Status: proposed width contract, not yet applied globally. 9 October 2026.

## Why

The laptop game HUD and inline feedback currently span roughly 1120 CSS pixels while the matching board is bounded at 680. These disconnected edges make the game feel excessively wide. Chandu requested a scalable standard below the full-width top navigation and more room between Dreamy and feedback copy.

## Recommended contract

| Region | Proposed maximum | Rules |
| --- | --- | --- |
| Top navigation and animated world | Full viewport | Unchanged. Decorative world can extend outside the play area. |
| Game frame, HUD and feedback | 960 CSS px | Centred shared outside edges. Width is `min(960px, viewport - 2 * gutter)`. |
| General activity | 800 CSS px | Nested centrally. Explicit compact/dense variants, not arbitrary theme widths. |
| Flashcard and reading surface | 640 CSS px | Keep the text column around 45–60 characters; artwork can occupy a distinct section. |
| Five-pair matching board | 680 CSS px portrait / 760 short landscape | Equal tiles, centred content groups, open connection lane. No per-term sizes. |

Phone gutter 16px; tablet/desktop gutter 24px. All values are CSS pixels, not hardware pixels. The app's global body zoom must be accounted for when enforcing physical viewport bounds.

Feedback: 24px horizontal Dreamy-to-copy gap on desktop; 12px compact grid gap on phones. Keep Dreamy, the title and Continue separated, with the original explanation underneath on phones. Decoration must not invade the copy or CTA.

Activity and feedback compose as one vertically centred group below the HUD. Fit by changing composition first: columns/rows, image slot, compact HUD, landscape arrangement. Scaling is a fallback, not the default way to make text fit. Avoid truncating authored questions or answers. Very long content, accessibility text enlargement and the on-screen keyboard must be tested explicitly rather than hidden behind a no-scroll claim.

Themes own font, material, colour, imagery, sounds and motion. They share geometry tokens. Layout tokens should be changed centrally, not by duplicated per-theme maximum widths. Automated content should be validated for text length and image aspect ratio against the same interaction templates.

## Research and limits

- Duolingo describes making lesson layouts and transitions consistent across features and devices: https://blog.duolingo.com/duolingo-android-reboot-2021/
- Quizlet Match keeps a bounded set of six pairs rather than showing an entire glossary: https://help.quizlet.com/hc/en-us/articles/360031183611-Playing-Match/
- Kahoot's single-screen experience places questions and answers together on the player's device for accessibility: https://kahoot.com/blog/2022/08/08/tech-tip-single-screen/
- Roblox's cross-platform guidance warns that percentage-only dimensions become enormous on large screens and recommends viewport-aware constraints, legible text and layout containers: https://create.roblox.com/docs/projects/cross-platform
- Material's layout guidance recommends bounded content and readable text measures: https://m2.material.io/design/layout/understanding-layout.html

The 960/800/640/680 values are a Dreamari design recommendation, not published dimensions claimed for those products. Validate the proposal at 360x640, 390x844, 768x1024, 1280x720, 1920x1080 and short landscape, in empty, selected, wrong, corrected and completed states. Also test real touch/keyboard devices and text enlargement before calling it an accessibility-certified standard.
