# Paste-to-Figma-agent — READ-ONLY integrity audit (2026-08-19)

This is an AUDIT. You must not create, modify, re-bind, or delete
ANYTHING in any step. Report findings only. Steps in order, report
after each, STOP and report if a step's expectation fails.

## STEP 1 — Broken alias chains (variables)

Walk every variable in the Semantic collection. For each mode, follow
its alias chain to the end. Report any variable whose chain hits a
missing/deleted variable (a dangling alias) or that cannot resolve to
a concrete value in either mode. Expected result: zero.

## STEP 2 — Orphaned styles

List every local paint style, text style, and effect style with its
usage count. Report any with zero usages. Expected result: zero (the
old-taxonomy gradient cleanup already ran). Do NOT delete anything you
find — report only.

## STEP 3 — Ghost references to the deleted components

Search the whole file for any INSTANCE whose main component is missing
or named like the removed components ("MobileReelCard", "Career World
Tile"). Report page, frame path, and node name for each hit. Expected
result: zero.

## STEP 4 — Raw (unbound) fills on the build-target surfaces

For EACH of these, one at a time, walk its layer tree and report every
fill or stroke that is a raw color — i.e. NOT bound to a variable and
NOT a named style. Ignore image fills (photos) and the numeral/text
layers inside ranked cards if their fill is variable-bound.

1. `CTA` component set (all variants)
2. `Search Bar`
3. `FormInput`
4. Desktop Navigation + Mobile Navigation
5. `Env Card`
6. `World Filter Pills` (all 15)
7. `Subject Row` / `Subject Icon`
8. `Career Poster Card` (all 46 variants — spot-check at least one
   variant per world if the full sweep is too slow, and say which you
   checked)
9. The Explore-Browse screen (desktop and mobile frames)

For every raw value found, report: frame path, node name, property
(fill/stroke), and the hex. Do not fix — some may be intentional
(e.g. pure-white spotlight layers in Background Space at literal
#ffffff are EXPECTED and not violations; list them as "expected").

## STEP 5 — Violet Nebula binding check

Report the current fill binding of every layer named "Violet Nebula"
in the file: bound to `accent-subtle` (stale — renders blue since the
accent family moved to brand blue) or `accent-purple` (correct,
violet). Report counts only — the re-bind itself is a separate,
already-issued instruction; do not perform it here.

## STEP 6 — Summary

One table: check name | expected | found | verdict. Anything not
matching "expected" gets a one-line explanation. This is the final
gate before the developer's Variables pull is declared trustworthy.
