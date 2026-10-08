# Glossary game layout standard

Status: implemented in the shared glossary theme frame. 9 October 2026.

## Why

The laptop game HUD and inline feedback currently span roughly 1120 CSS pixels while the matching board is bounded at 680. These disconnected edges make the game feel excessively wide. Chandu requested a scalable standard below the full-width top navigation and more room between Dreamy and feedback copy.

## Shared contract

| Region | Baseline maximum | Rules |
| --- | --- | --- |
| Top navigation and animated world | Full viewport | Unchanged. Decorative world can extend outside the play area. |
| Game frame, HUD and feedback | 960 CSS px | Centred shared outside edges. Width is `min(960px, viewport - 2 * gutter)`. |
| General activity | 800 CSS px | Nested centrally. Explicit compact/dense variants, not arbitrary theme widths. |
| Flashcard and reading surface | 640 CSS px | Keep the text column around 45–60 characters; artwork can occupy a distinct section. |
| Five-pair matching board | 680 CSS px portrait / 760 short landscape | Equal tiles, centred content groups, open connection lane. No per-term sizes. |

Phone gutter 16px; tablet/desktop gutter 24px. All values are CSS pixels, not hardware pixels. The app's global body zoom must be accounted for when enforcing physical viewport bounds.

## Large displays

The baseline sizes above are before the app's existing body zoom. A CSS `zoom` on the shared frame enlarges HUD, activity, text, imagery, feedback and controls together. It does not stretch tile widths independently. Top navigation, scenery, theme dock and level-map overlay remain outside this frame.

| CSS viewport | Frame zoom | Existing app zoom | Rendered frame maximum |
| --- | --- | --- | --- |
| 1280x720 laptop | 1 | 1 | 960px |
| 1920x1080 desktop | 1 | 1.25 | 1200px |
| 2560x1440 large desktop | 1.15 | 1.25 | 1380px |
| 3840x2160 full 4K | 1.5 | 1.25 | 1800px |

The extra 1.15 scale requires at least 2400x1000 CSS pixels; 1.5 requires at least 3200x1400. Both width and height are tested so a wide, short split-screen window does not inherit the full 4K enlargement. A Retina display at a logical 1440px viewport uses that logical viewport, not its hardware resolution. Nested viewport-height clamps divide by the combined body/frame scale. Existing drag/link measurements already convert viewport coordinates to local geometry.

Short-landscape Signal also reserves a compact two-column HUD and inline feedback row. Ten equal match tiles keep a separate inter-row connection lane rather than being reduced to a tiny board by desktop-sized supporting UI.

Feedback: 24px horizontal Dreamy-to-copy gap on desktop; 12px compact grid gap on phones. Keep Dreamy, the title and Continue separated, with the original explanation underneath on phones. Decoration must not invade the copy or CTA.

Activity and feedback compose as one vertically centred group below the HUD. Fit by changing composition first: columns/rows, image slot, compact HUD, landscape arrangement. Scaling is a fallback, not the default way to make text fit. Avoid truncating authored questions or answers. Very long content, accessibility text enlargement and the on-screen keyboard must be tested explicitly rather than hidden behind a no-scroll claim.

Themes own font, material, colour, imagery, sounds and motion. They share geometry tokens. Layout tokens should be changed centrally, not by duplicated per-theme maximum widths. Automated content should be validated for text length and image aspect ratio against the same interaction templates.

## Research and limits

- Duolingo describes making lesson layouts and transitions consistent across features and devices: https://blog.duolingo.com/duolingo-android-reboot-2021/
- Quizlet Match keeps a bounded set of six pairs rather than showing an entire glossary: https://help.quizlet.com/hc/en-us/articles/360031183611-Playing-Match/
- Kahoot's single-screen experience places questions and answers together on the player's device for accessibility: https://kahoot.com/blog/2022/08/08/tech-tip-single-screen/
- Roblox's cross-platform guidance warns that percentage-only dimensions become enormous on large screens and recommends viewport-aware constraints, legible text and layout containers: https://create.roblox.com/docs/projects/cross-platform
- Material's layout guidance recommends bounded content and readable text measures: https://m2.material.io/design/layout/understanding-layout.html

The 960/800/640/680 values are a Dreamari design decision, not published dimensions claimed for those products. Validate at 360x640, 390x844, 768x1024, 1280x720, 1920x1080, 2560x1440, 3840x2160 and short landscape, in empty, selected, wrong, corrected and completed states. Also test real touch/keyboard devices and text enlargement before calling it an accessibility-certified standard.
