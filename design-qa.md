# Partner composition QA — 10 September 2026

final result: passed

## Scope and source

User requested the reference logo layout, ordering, relative scale and exact
positioning, with monochrome for students and original colors for schools.
The surrounding landing-page heading, copy and section backgrounds are retained.

Source screenshot: `/Users/chandump/Downloads/Screenshot 2026-09-09 at 3.00.39 PM.png`
(2026 × 1464 pixels). Original transparent artwork:
`public/images/marketing/partners/partner-composition.png` (1920 × 1080), copied
byte-for-byte from `/Users/chandump/Downloads/Logos Page (Landscape)/40.png`.

## Browser evidence

In-app browser at `http://localhost:3017/`.
Desktop CSS viewport: 1440 × 1000. Saved viewport captures: 1440 × 1000, 1×.
Mobile CSS viewport: 390 × 844. Saved viewport captures: 390 × 844, 1×.

- `work/partner-grid/student-desktop.png`
- `work/partner-grid/schools-desktop.png`
- `work/partner-grid/student-mobile.png`
- `work/partner-grid/schools-mobile.png`
- Combined source and implementation comparison: `work/partner-grid/comparison.jpg`.

Comparison normalizes the screenshot logo region (85,319)–(1901,1321) and
browser artwork ink regions to 960 × 530. Source headline/background are excluded
because this change concerns the logos. Browser group bounds are recorded in
`work/partner-grid/student-box.json` and `schools-box.json`. Whole desktop captures
were also inspected at native size to check the fine-print and badge details.

## Findings and fidelity

No remaining actionable P0/P1/P2 findings within scope.

- Typography: original logo lettering retained in the supplied artwork; no
  substitute fonts or HTML wordmarks. Existing landing headings remain unchanged.
- Layout: original artwork fixes every position, overlap and relative size;
  no flex wrap or equal-area sizing. Both variants maintain 16:9 canvas proportions.
- Color: school image is unfiltered at full opacity. Student grayscale inversion
  retains internal badge detail. Contrast adjustment keeps the EY beam visible.
  Background differences from the screenshot are intentional audience treatments.
- Image fidelity: all 50 names represented, including Adult Swim. GDC, Pop-Tarts,
  Blackstone, IWCE, MAGIC, WildBrain and Pringles retain their internal detail.
  Image is the original 1920px source, not a screenshot crop or redrawn logos.
- Copy/accessibility: landing copy retained; 50 partner names exposed as a
  screen-reader list, with the composite image decorative to avoid duplicate reading.
- Mobile: school artwork 292px wide, student artwork 342px wide; no overflow.
  Small wordmarks become small by design when preserving the entire composition.
  Browser zoom remains available; no rearranged mobile rows are introduced.

## Comparison history

1. Original implementation normalized individual logo sizes and wrapped rows,
   losing the reference's positioning. Replaced with the original transparent composition.
2. Initial student inversion made bright-source details, especially EY's beam,
   too dark. Added a contrast floor and brightness adjustment. Final native-size
   browser inspection confirms the beam and badge lettering remain visible.
3. Replaced initial clipped captures (which used document coordinates) with actual
   viewport screenshots before producing the final comparison.

## Validation

- Audience toggle: Student → Enterprise → Student works.
- Both image variants load with natural width 1920.
- No horizontal page overflow at 390px.
- Browser console error log: empty.
- Targeted ESLint: passed.
- TypeScript `tsc --noEmit`: passed.
- `npm run tokens:check`: passed (464 tokens, both modes, generated files current).
- `git diff --check`: passed.

## Implementation checklist

- [x] Preserve supplied composition and original asset.
- [x] Apply student monochrome and school color treatments.
- [x] Preserve all accessible partner names.
- [x] Compare source and browser output together.
- [x] Verify desktop, mobile, audience switching and static checks.

## Follow-up polish

No required follow-ups. Individual source assets remain available if future work
requires independently editable logos. The current component intentionally uses
the supplied composition to guarantee the requested arrangement.
