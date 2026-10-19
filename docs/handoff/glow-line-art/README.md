# Missing-picture art: the school hall

For Usman, 19 Oct 2026. What to build in dreamonna, why, and everything needed to do it. Chandu signed off the design on 19 Oct 2026.

## What it is

A line drawing of a school hall in the Black & Blue look. It sits on a near-black ground under one soft blue glow with film grain, and its lines brighten near the light and fade away from it. Schools only: careers always have photos (Chandu, 19 Oct 2026: "careers will have images for sure. Lets only do the schools").

| Art | Shows when | File in this repo |
|---|---|---|
| **School hall** (dome, pediment with the Dreamari mark, four columns, two wings) | A school card, school page header or About Me's College Goal has no real campus photo | `src/components/colleges/CollegePlaceholder.tsx` |

`CollegePlaceholder` is a thin wrapper around `src/components/app/GlowLineArt.tsx`, which owns the glow, the line treatment and the grain.

## Why it looks like this

- The old fallback (a faint grey campus sketch) "does not feel as polished".
- Brief that stuck: the glow card treatment from the Black & Blue references, a college line graphic that "catches the light" from the background, no orb, no Dreamy.
- Then: not "overly detailed", not "too narrow", nothing that "looks broken", soft corners, and a glow that is "consistent" and "symmetric" on every card. So every school gets the same art. Each part is one joined outline with rounded joins, and the glow is mirrored about the centre line.

## Build notes

- **Gradients only, no blur filters.** Card hover zooms the picture, and blur on a zooming layer is what lagged on Glossary.
- **Do not use `vector-effect: non-scaling-stroke`.** With a gradient stroke, Chrome maps the gradient in screen space and parts of the drawing drop out. That was the "looks broken" bug.
- **Crop:** `viewBox 0 0 800 800`, `preserveAspectRatio="xMidYMid slice"`. The drawing fits above the card's name and stats on every card size.
- **`wide` prop:** short, wide cards (About Me's goal cards, about 2.3:1) shift the frame (`viewBox 0 -110 800 800`), so the top of the drawing stays in view and the title sits over its base.
- **`dark` prop:** cards that stay dark with white text in light mode (About Me's goal cards) keep the dark art.
- **Light mode:** comes from CSS, not props. The colours are read through `--cp-*` custom properties. Dark values are the fallbacks in the component; light values are set by one rule in `src/app/globals.css` (search `data-glow-art`). Copy that rule into the app's theme layer.

## Colours

The new Black & Blue ramp (`src/app/look-v2.css`). Use the app's tokens where a name exists; these are the raw values.

| Property | Dark | Light | Used for |
|---|---|---|---|
| `--cp-ground` / `--cp-ground-2` | #000105 / #03070f | #eaf3fd / #f7fafd | Ground, top to bottom |
| `--cp-bloom` | #2780ec | #59a0f8 | The wide wash |
| `--cp-bloom-2` | #59a0f8 | #94c2f9 | Side lobes, line fade |
| `--cp-core` | #9ec6fa | #ffffff | Pale centre of the light |
| `--cp-navy` | #0b2f5b | #ffffff | The darker band under the light |
| `--cp-line` / `--cp-line-2` | #e2eefd / #59a0f8 | #0e4281 / #2780ec | Lines near / far from the light |
| `--cp-mark` | #ffffff | #176acf | The Dreamari mark |
| `--cp-grain` | .07 | .04 | Grain opacity |

## Assets (`assets/`, and `preview.html` to see them together)

The hall in dark and light, square (1600 × 1600) and wide (1600 × 640), as SVG with every colour resolved (opens in Figma and browsers) and as WebP. Use the SVGs for design review. In the app, render the component so the art follows the theme and the card's size.

## Where it is wired in the prototype

- School cards and pictures: `CollegeCard`, `SchoolCard` and `CollegePicture` in `src/components/colleges/shared.tsx` fall back to `CollegePlaceholder` when the photo is missing or fails to load (`onError`).
- About Me (`src/components/profile/AboutMeTab.tsx`): College Goal with no #1 school shows `<CollegePlaceholder dark wide />` in production. **DEMO-ONLY:** the demo shows a real campus photo there instead (the first saved school with one, else a hand-built school), because the demo shows no fallbacks anywhere. Career Goal with no chosen #1 shows the top-ranked Top 3 career's photo, reads "Pick your #1 career" and opens Top 3. `ProfileExperience.tsx` passes the chosen #1 as `primary`. It is `null` until the student picks one; Top 3's first item is not treated as their #1.

## School photos (data, not design)

On 19 Oct 2026 only **143 of the 4,617** campus photo links in the dataset you exported resolved on `cdn.dreamonna.com/media/<id>/campus.webp`. The other 4,474 return 403, which is S3's reply for a missing key, with or without browser headers. `scripts/colleges/verify-images.mjs` checks every link and removes the dead ones from `public/data/colleges/index.json` and `detail/<slug>.json`. Re-run it after the CDN gains photos (run `build-dataset.mjs` first so live links come back).

**DEMO-ONLY:** the Vercel demo lists only schools with a real photo (192: the 143, plus 55 hand-built schools with local photos, 6 of them in both). That filter is in `loadAllColleges` in `src/components/colleges/dataset.ts`. In production, show every school and let the hall art cover missing photos. The real fix is filling the CDN.

## In the zip

`glow-line-art-handoff.zip` holds this README, `assets/`, and the source files above (`GlowLineArt.tsx`, `CollegePlaceholder.tsx`, `college-brand-mark.ts` for the mark's path, the light-mode CSS rule, `verify-images.mjs`).
