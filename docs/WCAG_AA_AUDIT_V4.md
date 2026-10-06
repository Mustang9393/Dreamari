# WCAG 2.2 AA audit: Counselor Dashboard v4

**Date:** 6 Oct 2026. **Scope:** every v4 screen for all three roles in light and dark mode. That is 42 screen states:
- School Counselor: 11 screens
- School Leader: 5 screens
- District Leader: 5 screens

The audit was asked for after the brand blue palette change: "run a full WCAG AA audit, im sure some of the text sizes and contrasts need work here."

## Method

1. **axe-core** (the project's own copy) with the `wcag2a`, `wcag2aa`, `wcag21aa` and `wcag22aa` rules on each screen.
2. **Pixel-measured text contrast.** axe can't measure text on v4's glass and gradient surfaces; it reported "unknown" for 40 to 185 elements per screen. So each screen was rendered with all text made transparent, the real background behind every visible text element was sampled, and the ratio was computed against the text colour after its opacity. The worst 10% of samples counts. The thresholds are 4.5:1 for normal text and 3:1 for large text (24px and up, or 18.66px bold).
   - Hidden, `aria-hidden`, clipped and decorative text (such as report thumbnails) was excluded.
   - Disabled controls are exempt under 1.4.3.
3. **Text sizes:** every visible text element under 12px was logged.
4. **Non-text contrast (1.4.11)** on form-field edges, reviewed by hand.

## Findings and fixes

| # | Finding | Criterion | Before | Fix | After |
|---|---|---|---|---|---|
| 1 | Muted text (`#5C6579` light, `#9EA7BC` dark) on tinted glass | 1.4.3 | 4.3 to 4.5:1, about 40 instances | Muted ink `#4F586C` light, `#B0B8CC` dark | 5.6:1 and up |
| 2 | Brand blue used as text (`#1F5FF0`) on blue-tinted surfaces | 1.4.3 | about 3.3:1 (initials, numbers, overlines) | Text blue uses the token `accent-deep` `#0F4CD1`. Buttons keep `#1F5FF0`. Initials sit on a lighter tint | 5:1 and up |
| 3 | Status words: Needs Attention, At Risk, On Track | 1.4.3 | 4.1 to 4.3:1 | Ochre `#7F5A1C`, risk `#9E3D30`, positive `#33604C` | 5:1 and up |
| 4 | Counts printed on the "Plans after graduation" segments | 1.4.3 | 3.3:1 (navy on cobalt) | Ink follows each segment's fill: white on the strong blues, navy on the pale ones, per theme | 4.6:1 and up |
| 5 | Hard-coded grey "Auto signature" caption in Settings | 1.4.3 | 2.8:1 at 9.5px | `#5F6470` at 11px | 6:1 |
| 6 | Version tabs (v1 and v2) in the Writing studio | 1.4.3 | 4.0:1 in dark | 78% ink at 11px | passes |
| 7 | Select placeholder dimmed to 60% opacity | 1.4.3 | 3.9:1 | Full-opacity muted ink, v4 only | 6:1 |
| 8 | Student dots on Today, 15px with 5px gaps | 2.5.8 target size | 121 failures | Grid sizes its own columns to a 24px pitch at any width | 0 |
| 9 | `aria-label` on a plain span (Students list progress track) and on SVG rects (Engagement chart) | 4.1.2 | 26 failures | `role="img"` | 0 |
| 10 | Form-field edges (inputs, selects, search) were only a glass hairline | 1.4.11 | about 1.3:1 | Field edges at 55% ink. Cards and sheets keep the soft hairline because their edges are decoration | 3:1 and up |
| 11 | Text at 8 to 10.5px across labels, captions, overlines and keys | not an AA rule (AA relies on 200% zoom, which works) | about 1,000 elements | 11px minimum across v4 and leader app styles (97 declarations plus 4 inline) | 11px minimum |

**Result:** axe reports 0 violations on all 42 states. The pixel check finds 0 text-contrast failures. The only remaining flags are disabled buttons (Send reply, Save Changes, Cancel, Previous, Request Changes), which 1.4.3 exempts.

## Not changed (follow-ups)

- **Report documents** (the `.publication-*` letter pages, the school and district report pages, and the document desk letterhead) still use 8 to 10px print type. They are fixed-height Letter pages, each tuned to fit one sheet, so raising their type needs a page-fit pass, not a blanket floor. At 96 dpi, 9px prints at 6.75pt. Raising the body type to at least 9pt (12px) means reflowing the pages.
- **Hover and focus states** were not sampled. The default states were. v4's focus ring is a 2px outline in the text blue (`:focus-visible`), which passes 1.4.11 on every v4 surface.
- **Production (dreamonna):** take the token values above (muted ink, text blue versus action blue, status inks, field edge) into the certified Figma tokens. Don't copy this CSS.

## Re-check, 7 Oct 2026 (after Maisha's review and the leader rebuild)

- axe: 0 violations on all 42 screen states.
- Pixel contrast: two 11px overlines had slipped to 4.3:1 on tinted glass and faded career art ("Students Behind the Number" on Student Progress, "Most Chosen" on School Leader Career & Postsecondary). Overlines now carry 80% muted ink mixed with 20% foreground and pass.
- Remaining flags are not failures: disabled controls (exempt under 1.4.3), a screen-reader-only copy of a counted-up number, and the local dev server's Next.js badge overlapping one overline in the screenshot.
