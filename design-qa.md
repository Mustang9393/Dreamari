# Student Home Design QA

## Comparison target

- Source visual truth: Figma UIKIT desktop node `790:35798`, mobile node `745:36522`, and exact career-card node `793:36808`.
- Source captures: `work/figma-home-source-desktop-top.png` and the related desktop sequence in `work/figma-home-source-desktop-*.png`; `work/figma-home-source-mobile-top.png`, `work/figma-home-source-mobile-header.png`, and `work/figma-home-source-mobile-hero.png`.
- Implementation: `http://localhost:3001/home`.
- Implementation captures: `work/home-hero-desktop-final.png` and `work/home-mobile-final.png`.
- Exact card source capture: `work/figma-card-reference-793-36808.png`; normalized component crop: `work/figma-card-reference-crop.png`.
- Exact card implementation crop: `work/home-card-implementation-final.png`.
- Combined comparison evidence: `work/home-design-qa-desktop-final.png`, `work/home-design-qa-mobile.png`, and the focused 1:1 component comparison `work/home-card-design-qa-final.png`.

## Normalization and state

- Desktop implementation viewport: 1280 × 720 CSS px at device density 1; capture is 1280 × 720 px.
- Mobile implementation viewport: 390 × 844 CSS px at device density 1; capture is 390 × 844 px.
- Source page captures: 1280 × 720 px. The full desktop/mobile frames were evaluated for composition, hierarchy, section order and responsive intent. The card node was separately viewed at 100% and normalized to its measured 427 × 336 px component size.
- State: dark theme, student home/Play landing state, Product Manager featured story selected, challenge incomplete for primary comparison.
- Focused evidence: `work/home-card-design-qa-final.png` places the 427 × 336 Figma card and 427 × 336 implementation together at 1:1 density. It makes the 180 px image, 156 px body, badge, duration, typography, metadata, CTA and component spacing directly comparable. Mobile was separately checked at its actual 390 × 844 viewport.

## Findings

- No actionable P0, P1 or P2 differences remain.
- Typography: Montserrat uses the existing licensed-font fallback path and preserves the source's heavy display hierarchy. The desktop hero title and description each occupy one line at the reference width, while mobile wraps naturally without widows or clipping.
- Spacing and layout: the featured story is now full-bleed directly below navigation, 520 px high at desktop and 470 px at mobile, with no container border, inset gutter or rounded shell. Progress percentage shares the bar row, the scene label sits beneath it, pagination is centered, and the four Quick Actions use the source's compact 72 px anatomy. The primary career-card variant is exactly 427 × 336 px on desktop, with a 180 px image and 156 px information panel. No horizontal page overflow occurs at 390 px.
- Colors and tokens: all new surfaces, borders, type, category accents, feedback states, radii and shadows reference the generated DTCG semantic/primitives variables. No page-local palette was introduced.
- Image quality: the Product Manager hero uses a new 1915 × 821 cinematic campus panorama composed for the full-bleed stage. Every visible career image has one clear subject and responsive object cropping. Cards add a token-mapped image-to-navy gradient so artwork blends into the information panel without a hard seam.
- Copy and content: the desktop source-of-truth labels and content are retained for the featured story, quick actions, journey, recommendations, daily challenge, popular careers, mystery unlocks and sponsored Mars challenge.
- Interactions and accessibility: desktop tabs and mobile bottom navigation work, quick actions scroll or navigate, challenge completion supplies a disabled success state and live feedback, streak feedback works, semantic controls have names, focus rings are visible and tap targets meet the existing control scale. Career rails use touch swipe, snap positions, partial-next-card affordances and accessible Next/Previous controls. Cards use a restrained 500 ms focus/hover lift and image push-in. The hero advances continuously every 5.5 seconds, including while hovered, with clickable dots, accessible arrows, 700 ms crossfades and a reduced-motion opt-out.

## Comparison history

1. Initial full-view comparison (`work/home-design-qa-desktop.png`) found one P2 hierarchy mismatch: the implementation hero title used a 72 px maximum and wrapped to four lines, materially overpowering the source.
2. Fix: changed the title to a token-aligned responsive 32–44 px range, widened its text measure, and kept mobile at 32 px.
3. Post-fix comparison (`work/home-design-qa-desktop-final.png`) shows the title in a compact two-line grouping with the image subject, description, CTA and progress retaining the intended hierarchy. No new P0/P1/P2 issue appeared.
4. Follow-up comparison against card node `793:36808` found a P1 component mismatch in the first implementation: imagery and copy were overlaid, metadata used chips, CTA styling was inverted, and card proportions did not match the 427 × 336 UIKIT component.
5. Fix: rebuilt the shared card into the source's 180 px image/156 px navy body anatomy; added match badges, durations, plain dot-separated metadata, the full-width blue CTA, exact vertical spacing and token-mapped surface color. Applied wide, standard and compact width variants without changing the component anatomy.
6. The final focused comparison (`work/home-card-design-qa-final.png`) shows matching 427 × 336 dimensions and internal geometry. Desktop controls were measured moving `scrollLeft` from `0 → 113 → 0`; mobile moved one 336 px card step while document `scrollWidth` remained equal to the 390 px viewport. No P0/P1/P2 issue remains.
7. The follow-up hero audit at 100% found a P1 structural mismatch: the implementation was an inset, rounded 608 px panel with an eyebrow, tall icon actions, left-aligned dots and hover-paused autoplay; the source is a shorter full-bleed stage with compact text-only actions and centered pagination.
8. Fix: rebuilt the hero at 520 px desktop/470 px mobile, generated the restrained campus panorama, removed the shell and eyebrow, matched the CTA/progress hierarchy, centered pagination, reduced Quick Actions to 72 px, enabled uninterrupted 5.5-second autoplay, and blended card images into their body surface. Browser verification observed the active story advance from UX Researcher to Mars while the page remained open.

## Residual test gap

- The connected Figma account still lacks edit access, so the connector could not return the node's code/export package. The public canvas did expose node `793:36808` at 100%, allowing an exact 427 × 336 focused visual comparison. Source imagery remains visually equivalent in direction rather than byte-identical because the home uses the approved generated Dreamari career art set.

## Validation

- Browser-rendered evidence captured at desktop, tablet and mobile widths.
- Primary interactions tested: Career Report home link, Explore tab, mobile tab state and URL, quick-action scroll, daily challenge success/disabled feedback, streak acknowledgement, rail Next/Previous state, mobile rail scroll/snap, hero arrows/dots, and hero crossfade state.
- Browser layout measurements: `scrollWidth === innerWidth` at 390, 768 and 1440 px.
- ESLint, TypeScript, token validation and production build pass.
- Current browser checks showed no framework error overlay or broken asset requests.

final result: passed
