# Career photo tools (face detection)

Added 4 Oct 2026. These keep the subject's head in view wherever a career's
portrait poster is shown through a wide window (the Career Detail header on
desktop and on phones). Run them whenever new career posters are added.

## What is here

- `faces.swift`: finds faces (and people) in each photo with Apple's Vision
  framework. macOS only. Prints one line per photo: size, face boxes (centre
  x, top, bottom, width, confidence) and person boxes, as fractions.
- `hero-focus.mjs`: turns that output into a crop (CSS `object-position`) per
  photo, separately for the desktop header window and the phone header
  window, so the main face sits in the upper part of each. Writes
  `src/components/career/heroFocus.ts`, which both Career Detail components
  read. Hand fixes go in its `OVERRIDES`, never in the generated file.
- `contact-sheet.mjs`: renders every header exactly as cropped, desktop and
  phone side by side, numbered, so every photo can be checked by eye.

## Run it

```sh
swiftc -O -o /tmp/faces scripts/career-photos/faces.swift
find public/images/app -name '*.webp' > /tmp/photos.txt
/tmp/faces "$PWD" /tmp/photos.txt > /tmp/faces.tsv
node scripts/career-photos/hero-focus.mjs /tmp/faces.tsv
node scripts/career-photos/contact-sheet.mjs /tmp/photos.txt /tmp/hero-sheets
```

Then look at every sheet in `/tmp/hero-sheets`. If a poster itself was cut
badly (the person pushed to an edge when a wide original was cropped to
portrait), re-cut the poster from the original around the face first, then
re-run. That is how Dental Hygienist, EMT, Agricultural Inspector,
Astronomer, Epidemiologist, College Dean and Cloud Systems Engineer were
fixed. The same face data also built the Top 3 card crops
(`src/components/profile/top3PhotoFocus.ts`).

## Production

The app would store a focal point per image (set once when an image is
uploaded, from this same detection, with a manual override) instead of a
generated TypeScript file.
