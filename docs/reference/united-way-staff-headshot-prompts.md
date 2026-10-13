# United Way staff headshots: prompts

**Why (13 Oct 2026, Chandu):** "For the staff people, let's generate actual images of them like we do the Connect professional profiles. It needs to look as cool and polished as that. The United Way logo pic is not it."

The eight United Way of South Central Michigan staff on the board are demo people (first names and roles only, DEMO-ONLY). Their headshots need to sit beside the Connect professionals' (`public/images/connect/avatars/pro-*.jpg|png`) without looking like a different set. Claude can't generate images in this repo, so these prompts are for the image model the team already uses for the pro headshots (Codex / the same tool Joshua used).

## How to land them

1. Generate one image per person with the shared style block plus their line.
2. Save as a 1:1 PNG, at least 1024 px, under `public/images/connect/avatars/` with the file name given.
3. In `src/components/connect/unitedway/uwSouthCentral.ts`, uncomment that person's line in `STAFF_PHOTOS`.
4. They now wear the photo in the Team board, feed rows, post bylines, replies and the composer. Anyone without one keeps the United Way mark.

## Shared style (paste before every person)

> Photorealistic professional headshot, square 1:1, head and shoulders, centred, looking at the camera with a warm, relaxed, genuine smile. Soft natural window light from one side, gentle shadows, true skin texture, no retouched plastic look. Background: a softly blurred modern nonprofit office or community space (warm lights, plants, a bulletin board), shallow depth of field. Smart-casual clothes in plain colours, no logos, no text, no lanyards with words. Shot on a 50 mm lens at f/2. Same look as a modern company team page. One person only.

## The eight people

| File | Person | Line to add after the style block |
|---|---|---|
| `uw-kz-chris.png` | Chris · Youth programs · Kalamazoo | A man in his early 30s, Black, short twists, navy crew-neck sweater. Friendly, energetic. |
| `uw-kz-jess.png` | Jess · Community impact · Kalamazoo | A woman in her late 40s, white, shoulder-length auburn hair, glasses, olive blazer over a cream top. Calm, warm. |
| `uw-lan-maya.png` | Maya · Youth programs · Lansing | A woman in her late 20s, South Asian, long dark hair, mustard cardigan. Bright, open smile. |
| `uw-lan-rob.png` | Rob · Events · Lansing | A man in his early 40s, white, light beard, rolled-sleeve chambray shirt. Easygoing. |
| `uw-jx-tess.png` | Tess · Volunteer center · Jackson | A woman in her mid 50s, Black, short natural grey hair, teal blouse. Kind, steady. |
| `uw-jx-lena.png` | Lena · Youth programs · Jackson | A woman in her early 30s, Latina, curly hair pulled back, denim jacket over a white tee. Playful. |
| `uw-bc-dana.png` | Dana · Community impact · Battle Creek | A woman in her mid 40s, East Asian, chin-length straight hair, charcoal knit top. Confident. |
| `uw-bc-alex.png` | Alex · Volunteer engagement · Battle Creek | A man in his late 20s, Latino, short dark hair, green henley. The demo's own staff member: approachable. |

## Checks before adding

- Matches the pro set at a glance: same light, same crop, same lens look.
- Nobody looks like an existing pro (compare against `pro-*.jpg|png`).
- No logos or readable text anywhere in the frame.
- Reads clearly at 28 px (the smallest avatar on the board).
