Art intake: aviation-maintenance-technician (Kestrel Aero Maintenance)
====================================================

Drop source art here, then run:
  node scripts/play-art/play-art.mjs process aviation-maintenance-technician

sprites/<character>-<expression>.(png|jpg|webp)
  Expression is one of: welcoming, proud, concerned, confident, focused, uncertain, composed, assessing.
  If Codex couldn't produce true alpha, generate on a flat #00FF00
  background instead -- `process` chroma-keys it automatically. Full
  figure, head to shoes, ~4% margin above hair / ~2% below shoes; see
  docs/handoff/sprite-master-prompt.md for the exact spec, or run
  `node scripts/play-art/play-art.mjs prompts aviation-maintenance-technician --cast cast.json --rooms rooms.json`
  to generate the Codex prompt text from a cast list.

plates/<location-id>.(png|jpg|webp)
  One people-free room per file, any size; `process` resizes to 1920x1080.
  Optionally drop a rooms.json here (see scripts/play-art/templates/
  rooms.example.json) to carry each room's semantic `role` into the
  manifest for the beat-to-room mapper.

heroes/<beat>.(png|jpg|webp)
  One illustrated beat scene per file, named after the script's beat id.

What process does for you automatically: chroma-key + despeckle + trim +
place sprites on the 1024x2048 standard canvas, cut a face chip per
character (flagged for a human glance), resize plates/heroes, write
portraitRatios/cast/locations into the manifest, and auto-place every new
room's focal point (no dragging a slider -- see `place`).

The only human step left: art QA (identity, brands, style) -- see
docs/handoff/play-sop/07-art-direction-and-prompts.md section 5 -- and a
glance at the auto-generated face chips. Run `qa aviation-maintenance-technician` before
calling a career done.
