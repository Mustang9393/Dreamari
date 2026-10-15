# Dreamy Drift: scalable poses and facial animation

Release scope: Drift ONLY. Chandu rejected the candidate Signal sprites.
Signal retains its existing live cloud, SVG eye rig and speaking WebP.
The unapproved Signal candidates remain in the local image-review workspace.

## Character contract

12 reusable cloud poses: welcome, explain, choose, match, sort, calculate,
recall, case, hint, correct, retry, mastery. Floating cloud only, no limbs,
torso, clothing, stretching or fattening. Preserve the canonical ivory/cyan
satin shading, navy glass star eyes, familiar lobes and small blue mouth.
Wrong-answer acting is reassuring, never shame or punishment.

## Reuse across careers

Use the existing activity-to-pose mapping in
`src/components/glossary/dreamyReactions.ts`. These poses are not generated
per word. Question prompts, answers, types, order and scoring stay untouched.
Outcomes override the activity pose. Matching briefly reacts to each pair
attempt and resets after undo. Those callbacks only change the mascot.

## Generate

Use built-in ImageGen with transparent background. The adjacent JSON holds
the exact prompt, original source path and canonical identity reference
for every pose. Inspect the canonical image before each new generation.
Change only the acting brief, keeping the character/style contract.

Request four identical clouds in a 2x2 sheet: resting face, closed blink,
open speaking mouth, rounded speaking mouth. Only the eyelids and mouth
may change. Same silhouette, body size, angle, props and anchor in all cells.
Reject clipped frames, incorrect faces, limbs or a baked background.
Preserve original PNGs. Use a new version name for revisions.

## Package

```sh
node scripts/dreamy-animated.mjs prepare docs/reference/NEW-VERSION.json /absolute/review-pack
node scripts/dreamy-animated.mjs validate docs/reference/NEW-VERSION.json /absolute/review-pack
node scripts/dreamy-animated-review.mjs docs/reference/NEW-VERSION.json /absolute/review-pack
```

Set `themes: ["drift"]` in a release manifest. Source sheets are split into
four cells. Largest connected alpha component registers cloud BODY rather
than detached props. Measurement must resize with `fit: "fill"`: the
default centre crop mis-measures rectangular cells and causes sideways
movement during a blink. Do not stretch the actual artwork; only the
measurement probe uses fill. Export uses proportional scaling.

The exporter checks four-frame centre spread, dimensions, alpha, source/
output SHA-256 hashes and byte budgets. Static files are 768px and 256px.
The atlas is 768px square with four 384px cells. Raw sources are not shipped.

## Runtime

One atlas per visible pose, CSS stepped background positions. Idle blink
about every 5.6 seconds; a 2.6-second speaking burst on a new pose; inline
feedback mouth animation follows its existing typing state. No added
per-frame sound. Existing game sound cues remain authoritative.
Reduced motion loads the still image. Keep the existing responsive actor
slot and compensate its transparent optical margin once, without applying
the old Signal eye overlay or stretching images.

## Review gate

Check every pose on light and dark surfaces, both animation modes, small
56px use and game size. Watch for body/eye drift and verify correction,
matching drag/undo, term-unlock celebration and number-entry screens.
Build, TypeScript, scoped lint, token checks and asset validation must pass.
Push only with user authorization. Do not include unapproved theme files.

These are generated 2D facial sprite animations, not a rigged 3D model or
phoneme lip-sync. The game-dev CLI is unavailable on this host, so built-in
ImageGen and local Sharp packaging are used. No paid external provider.
