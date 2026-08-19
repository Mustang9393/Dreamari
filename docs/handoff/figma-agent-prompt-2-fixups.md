# Paste-to-Figma-agent — verification fix-ups round 2 (2026-08-19)

Same rules as before: steps IN ORDER, verify and report after each,
STOP on any mismatch instead of improvising. Do not touch anything a
step doesn't name.

## STEP 1 — Report the raw Light-mode values (read-only)

For each of these semantic variables, report the LIGHT mode value and
whether that value is a literal or an alias (and to what):
`background`, `foreground`, `card`, `secondary`, `muted-foreground`,
`glass-surface-1`, `glass-surface-2`, `glass-surface-3`.

Do not change anything in this step. I expect Light `foreground` to be
a dark ink (#05070f-ish) and Light `card` to be a light surface. If
instead they hold dark-theme values, say so plainly — that means the
file's Light mode was never authored for those tokens.

## STEP 2 — Fix the alias-vs-literal errors from round 1

For each of: `card-foreground`, `sidebar-foreground`,
`sidebar-accent-foreground` — inspect how it is defined in EACH mode.
Required end state: BOTH modes are a variable ALIAS to `foreground`
(not a pasted color). If any mode holds a literal, replace it with the
alias. Then report the resolved Light and Dark values — they must
exactly match `foreground`'s own values per mode.

Do the same for `input`: both modes must ALIAS `glass-surface-2`.
Report resolved values (Light should come out as the black-alpha
glass value, not white-alpha).

And `popover`: Light mode must ALIAS `card`, Dark mode must ALIAS
`glass-surface-3`. Report resolved values.

## STEP 3 — Re-point chart-4

`chart-4` currently aliases `worlds/teaching-learning`. Re-point it to
the purple PRIMITIVE with value #8b5cf6 (e.g. purple/500) in both
modes. If no purple primitive with that exact value exists, replace
the alias with the literal `#8B5CF6` instead. Rationale: chart colors
must not follow a world's identity if that world is ever re-tinted.
Report the new definition.

## STEP 4 — Re-bind the Violet Nebula layers (accent moved to blue)

The `accent` family moved to brand blue, so any layer still bound to
`accent-subtle` that is MEANT to be violet now renders blue. Find every
layer named "Violet Nebula" across all pages (they live inside frames
named "Background Space"). Report the count and each one's current fill
binding. For every one bound to `accent-subtle`, re-bind the fill to
`accent-purple`. Change nothing else about them (size, opacity, blur).
Report before/after per layer.

## STEP 5 — Final table

Re-output the full table of the ~28 variables from round 1 plus these
fixes, with per-mode RESOLVED values and, for each, whether each mode
is an alias (to what) or a literal. The developer will diff the next
Variables API pull against this table.
