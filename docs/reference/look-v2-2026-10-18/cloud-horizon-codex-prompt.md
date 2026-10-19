# Cloud horizon for the Black & Blue sky: Codex prompt

**Why (19 Oct 2026).** Joshua: the Black & Blue look "feels slightly gloomy" and should keep "the dreamy, optimistic feeling of our previous design". Glows alone are generic; a soft bank of clouds at the bottom of the night sky is ownable, because clouds are the brand (Dreamy is a cloud). This is a graphic, so it is made by Codex, not faked in CSS.

**Where it goes.** The fixed app background (`src/components/app/AppBackdrop.tsx`), dark Black & Blue only, pinned to the bottom of the viewport, under the cards, above the black ground and the star layer (`NightSky.tsx`). Once the file exists, add one `<img>` in AppBackdrop after `<NightSky />` with `data-cloud-horizon`, and in `src/app/look-v2.css` show it only under `html.look-v2:not(.light)` (absolute, `inset-x-0 bottom-0`, `width: 100%`, `height: auto`, `object-fit: cover`, `object-position: bottom`, `pointer-events: none`). No animation on it (no filters on moving layers; perf rule).

**File.** `public/images/app/sky/cloud-horizon-dark.webp`, 2400 x 720 px, with alpha (transparent sky above the clouds), under 220 KB. Also a phone crop `cloud-horizon-dark-phone.webp`, 1200 x 600, same treatment, clouds a little taller in frame.

---

## Paste into Codex

Create a wide, photographic-quality night cloudscape strip for a website background, 2400 x 720 px, exported as WebP with a transparent background above the clouds.

Subject: the top of a soft, low bank of cumulus clouds seen from slightly above, stretching the full width along the bottom edge, as if the viewer floats above a cloud sea at night. The cloud tops rise gently and unevenly, tallest in the left third and right third, lower in the middle (the middle stays low so interface content above it is never crowded). Clouds fill roughly the bottom 45% of the frame at their highest point and fade to fully transparent above.

Light: moonlight from directly above and slightly behind, so cloud tops carry a cool silver-blue rim light and their bodies fall into deep blue shadow. Palette strictly black, deep navy (#04101e to #0b2f5b) and luminous sky blue highlights (#59a0f8, #9ec6fa, near-white #e2eefd on the brightest rims). No purple, no violet, no pink, no teal, no warm tones, no orange glow, no sunset.

Style: realistic and quiet, like a premium phone wallpaper or an Apple product page backdrop. Soft volumetric forms, fine natural detail, subtle film grain. Low contrast overall: the brightest rims are the only highlights. Absolutely no stars, moon, planets, birds, text, logos, cities, mountains, characters or Dreamy. No lens flare, no bokeh, no glow orbs, no fantasy sparkles.

Edges: the left and right edges must tile seamlessly when repeated horizontally. The top edge of the clouds feathers into transparency over about 120 px so it sits on any black sky without a visible line. The very bottom 40 px is the darkest, so it meets the page bottom cleanly.

Deliver: `cloud-horizon-dark.webp` (2400 x 720) and a phone version `cloud-horizon-dark-phone.webp` (1200 x 600, same scene reframed so the cloud tops sit a little higher). Put both in `public/images/app/sky/`. Do not change any code.

---

## Light mode: the day sky (second image)

**Why.** Stars only make sense at night: `NightSky.tsx` runs in dark Black & Blue only (Chandu: "i doubt the stars work there"). Light mode's version of "aspirational" is a bright day sky: the ice-blue light from the top that is already there, plus a daytime cloud bank along the bottom. Same slot in AppBackdrop, shown only under `html.look-v2.light`, file `public/images/app/sky/cloud-horizon-light.webp` (and `-phone`), same sizes and alpha rules.

### Paste into Codex

Create the daytime companion to `cloud-horizon-dark.webp`: same size (2400 x 720, WebP, transparent above the clouds), same composition (a low cumulus bank along the full bottom edge, taller at the left and right thirds, low in the middle, tiling seamlessly left to right, tops feathering into transparency over about 120 px).

Light: a clear, bright late-morning sky, sun high and behind the viewer, so the clouds are soft white with cool, airy ice-blue shadows. Palette strictly white (#ffffff), cool off-white (#f3f6f9), ice blue (#d6e7fa, #bcd8fb) and the faintest sky blue in the deepest shadows (#94c2f9). No warm tones, no yellow or golden light, no grey storm tones, no purple or pink, no sunset.

Style: realistic, calm and high-key, like a premium phone wallpaper; very low contrast so dark text above it stays readable. No sun disc, no birds, no planes, no text, no logos, no land, no Dreamy, no lens flare or sparkles.

Deliver `cloud-horizon-light.webp` (2400 x 720) and `cloud-horizon-light-phone.webp` (1200 x 600) in `public/images/app/sky/`. Do not change any code.

---

**Checks after it lands.** Dark Black & Blue on Home, Explore and Connect at 1440 and 375 px: the clouds sit behind cards and never under body text; text over the cloud tops (if any) stays 4.5:1; Classic shows neither; light mode shows only the light file and dark only the dark one; Lighthouse shows no new layout shift (the image is fixed, out of flow).
