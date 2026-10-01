# scripts/play-art

Turns a career's raw art (Codex/Joshua sprites and room plates) into the
standard on-disk assets and the manifest the engine reads
(`src/components/play/art/<career>.json`), so shipping a new career's art
doesn't mean a human repeating the same eight post-processing steps by hand.
With 900+ careers on the roadmap, positioning is fully automatic too: no one
drags a focal-point slider per room.

Background: `docs/handoff/play-sop/07-art-direction-and-prompts.md` (sections
1, 3-5) and `docs/handoff/sprite-master-prompt.md` specify the standard this
script implements; `src/components/play/art/career-art.schema.json` and
`types.ts` are the manifest's shape.

## The flow

```
new-career  ->  prompts  ->  (Codex generates the images)  ->  process  ->  qa
```

1. **`new-career <id> --folder <short> --firm "<Firm Name>"`**
   Scaffolds `art-intake/<id>/{sprites,plates,heroes}/` (with a README of
   naming rules) and a starter manifest. Refuses to overwrite an existing
   manifest. `--out <dir>` redirects both into a scratch directory instead,
   for testing.

2. **`prompts <id> --cast cast.json --rooms rooms.json`**
   Writes `art-intake/<id>/PROMPTS.md`: the frozen sprite master prompt with
   only its `== CAST ==` block rewritten from `cast.json` (name, role,
   identity sentence; expression set chosen from role
   mentor/judge/peer/top), plus one people-free plate prompt per room from
   `rooms.json`. These prompts run in Codex, an image-generating model --
   Claude cannot generate the images itself. Templates: `templates/cast.example.json`,
   `templates/rooms.example.json`.

3. Save Codex's output into `art-intake/<id>/sprites/`, `plates/` and
   `heroes/` using the names printed in PROMPTS.md (or by hand, following the
   README.txt `new-career` wrote into that folder).

4. **`process <id> [--in <dir>] [--out <dir>] [--green]`**
   - **Sprites** (`<character>-<expression>.png|jpg|webp`): chroma-keys a
     green background if the file has no real alpha (soft green-dominance
     ramp + despill, not a hard cutout), despeckles stray alpha islands,
     trims to the alpha bounding box, and places the figure on the
     1024x2048 standard canvas (~4% margin above hair, ~2% below shoes).
     Exports webp with alpha to `<out>/expressions/`.
   - **Face chips**: one per character, auto-framed from their default
     sprite (hairline/chin estimated from the alpha mask and a standard
     7.5-heads-tall proportion, since there's no face detector here) to
     `<out>/face-<character>.webp`. Always flagged in the report for a
     human glance -- this is an estimate, not a measurement.
   - **Plates** (`<location-id>.png|jpg|webp`): resized to 1920x1080 webp
     q82. A new location's `alt` is left as `"TODO: describe"` (the one
     thing `validate`/`qa` will still fail on) and its `role` is copied
     from an optional `rooms.json` dropped in the intake folder. An
     existing location's tuning is never touched.
   - **Heroes** (`<beat>.png|jpg|webp`): webp q82, native size if already
     16:9, else a top-anchored crop (never centre-crop -- that cut a
     forehead once).
   - **Auto-places** every location that isn't `"locked": true` (see below)
     -- no human step left here either.
   - Updates the manifest: `portraitRatios`, `cast` (default/tiers/face per
     the role-mapping table in the SOP), new `locations`.

5. **`qa <id>`**: deterministic geometry checks, no screenshots. For every
   cast sprite, checks (at 390x844, 768x1024, 1440x900, 1920x1080, 2560x1080)
   whether the head clears the top of frame at the standard slot and the
   face lands in the readable top 40% -- errors on a cropped head, warns on
   a low face. For every location, warns if the standing column is cluttered
   at the phone crop. Includes everything `validate` does. Exit code is
   non-zero on any error.

6. **`validate <id>`**: schema rules, every referenced file exists and is
   the right shape (sprite dimensions/alpha for the full-figure standard,
   plate ~16:9), every `portraitRatios` entry matches the real file (±0.002),
   no `alt` left as `TODO`, a green-fringe percentage on sprite edges, files
   over ~250KB, and orphaned files the manifest doesn't reference. Errors
   fail the command; warnings don't.

7. **`measure <id>`**: prints every sprite's stored vs. real ratio, for a
   quick "did anything drift" check.

8. **`place <id> [--force]`**: recomputes `focal`/`mobileFocal`/
   `characterAnchor` for every unlocked location from the plate image
   itself -- no dragging a slider. It finds the least-cluttered "standing
   column" (edge density on a downscaled greyscale probe, biased toward
   centre) in the lower ~55% of the frame, points `focal`/`mobileFocal` at
   it via the object-cover math, and reports the standing column's actual
   on-screen position at all five check viewports (flagging anything that
   would land off-screen). `process` calls this automatically for new
   locations; run it by hand to re-place after editing a plate.
   `"locked": true` on a location (`career-art.schema.json`, `types.ts`)
   means hand-tuned -- `place`/`process` leave it alone unless `--force`
   overrides that, which only exists for the auto-vs-hand-tuned comparison
   described below. Every existing IB and RN location is `locked: true`.
   Locations also carry an optional semantic `role` (`work-floor`,
   `work-floor-night`, `private-meeting`, `formal-meeting`, `break`,
   `transition`, `arrival`, `specialist`) for the beat-to-room mapper in
   `scripts/play-beats`.

## What's still a human step

Art QA of identity, brands and style
(`docs/handoff/play-sop/07-art-direction-and-prompts.md` section 5) -- and a
glance at whatever `process`/`qa` flagged (face chip framing, any error or
warning). Everything else -- framing, sizing, cast wiring, ratios, and now
placement -- is automatic.

## Options every command shares

- `--manifest <path>`: manifest file to read/write (default
  `src/components/play/art/<id>.json`).
- `--public <dir>`: the root that a manifest's `/images/play/...` asset
  paths resolve against (default `public/`). Point it at a scratch
  directory to validate/qa a test career's output without touching the
  real `public/` tree.
