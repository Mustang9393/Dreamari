# Paste-to-Figma-agent — canvas fix pass (2026-08-19, post-audit)

The Variables layer is certified; these are the four canvas-level fixes
from the integrity audit. Same rules as always: steps IN ORDER, verify
and report after each, STOP on mismatch instead of improvising, touch
nothing a step doesn't name.

## STEP 1 — Re-bind the 37 Violet Nebulas

Find every layer named "Violet Nebula" (audit found 37: 13 on the
Design page, 24 on Onboarding Experience). For each, re-bind the FILL
variable from `accent-subtle` to `accent-purple`. Change nothing else
(size, position, opacity, blur stay untouched). Verify: report the new
count bound to `accent-purple` (expect 37) and to `accent-subtle`
(expect 0).

## STEP 2 — Discover the Career Poster Card gradient-style convention

READ-ONLY step. Look at ONE world whose variants are correctly bound —
e.g. Health & Medicine — and report: the exact name(s) of the paint
style(s) its Default / Hover / Focused variants use on the card root
gradient, and whether all three states share ONE style or use one
style per state. Also report the naming pattern of all 11 bound
worlds' gradient styles so the new ones can follow it exactly. Do not
create anything yet.

## STEP 3 — Create the 4 missing gradient styles and bind the 12 variants

For each of: Business & Money, Arts Media & Sport, Driving Flying &
Shipping, Factories & Making Things —

1. Read the CURRENT raw gradient values off that world's Default
   variant root (these are the correct values; do not invent or copy
   another world's).
2. Create the paint style(s) named EXACTLY per the convention from
   Step 2, holding those values.
3. Bind the world's Default, Hover, and Focused variants' root
   gradient to the new style(s), matching the per-state pattern from
   Step 2. If Hover/Focused raw values differ from Default where the
   convention says they should share one style, STOP and report the
   difference instead of averaging or guessing.

Verify: re-run the raw-fill check on Career Poster Card — expect 0 raw
gradients across all 46 variants. Report style names created.

## STEP 4 — Repair and re-attach UI/Rank Number

The style is not junk — the Explore screens' ranked-card digits SHOULD
use it, but the style's size drifted from what's on screen. In order:

1. READ the current text properties of the big rank digits on the
   Explore-Browse Trending row (the "1"–"7" numerals in the Ranked
   cards): font family, style/weight, size, line height, letter
   spacing. Report them next to UI/Rank Number's current definition
   and state the differences. (Expect Bricolage Grotesque ExtraBold,
   ~180px, tight negative tracking.)
2. UPDATE the UI/Rank Number text style's definition to exactly match
   the on-screen values. The SCREEN is the source of truth here, not
   the stale style.
3. BIND every rank-digit text node in the Ranked card component (and
   any detached copies on the Explore screens) to UI/Rank Number.
4. Verify: report UI/Rank Number's usage count (expect ≥7 — one per
   ranked card) and confirm the digits' rendered appearance did not
   change (same values before/after, only the binding is new).

## STEP 5 — Post-fix mini-audit

Re-run three checks and report a final table:
- Zero-usage styles (expect 0 now).
- Raw gradient fills on Career Poster Card (expect 0).
- Violet Nebula bindings (expect 37 on accent-purple).
Nothing else in the file should have changed — if any other diff shows
up, report it.
