# Paste-to-Figma-agent prompt — variable additions + cleanup (2026-08-19)

Copy everything below the line into the Figma AI agent (or hand it to
any assistant with Figma write access) with the Dreamari Design System
v2.0 file open. It is deliberately micro-stepped: the agent must do the
steps IN ORDER, one at a time, verifying after each, and STOP on any
mismatch rather than improvising.

---

You are working in the file "Dreamari-Design-System-v2.0". Follow these
steps EXACTLY, in order, one step at a time. After each step, report
what you did and what you verified before moving on. If anything you
find does not match what a step expects, STOP and report instead of
guessing. Do not rename, move, or delete ANYTHING except where a step
explicitly says so.

## STEP 0 — Discover (read-only, do this first)

List every variable collection in this file with its exact name and its
mode names. I expect a primitives-style collection and a semantic-style
collection whose modes are Light and Dark. Report the exact names, then
use THOSE exact names everywhere below. Also report whether variables
named `background`, `foreground`, `card`, `primary`, `secondary`,
`muted-foreground`, `destructive`, `glass-surface-1` exist in the
semantic collection. If they do NOT exist, STOP — wrong file or wrong
collection.

## STEP 1 — Verify two corrections landed

In the semantic collection, check the current values:
- `destructive` must be `#F04438` in both Light and Dark. If it is
  still `#ef4444`, update BOTH modes to `#F04438`.
- Check whether `destructive-foreground` exists. If not, create it in
  the semantic collection, color type, value `#f4f7ff` in BOTH modes,
  scoped to text fill.
Report the before/after values.

## STEP 2 — Create the foreground-companion aliases (5 variables)

In the semantic collection, create these COLOR variables. Every one is
an ALIAS to an existing variable (use variable aliasing, not copied hex
values). Both modes. Skip any that already exist and say so.

1. `card-foreground` → alias `foreground` (both modes)
2. `popover` → Light: alias `card`; Dark: alias `glass-surface-3`
3. `popover-foreground` → alias `foreground` (both modes)
4. `accent-foreground` → alias `foreground` (both modes)
5. `input` → alias `glass-surface-2` (both modes)

Verify by listing the 5 new variables with their resolved values in
both modes, then continue.

## STEP 3 — Create `ring` (1 variable)

Create `ring` in the semantic collection, color type, literal value
`#2F6BF280` (the primary blue at 50% alpha) in BOTH modes. (Figma
variables cannot hold a computed color-mix; this literal is the agreed
stand-in. If the file's primary is not #2f6bf2, STOP and report.)

## STEP 4 — Create the chart palette (5 variables)

Create `chart-1` … `chart-5` in the semantic collection, color type,
same value in both modes. If a primitive with the matching value exists
(e.g. the brand/green/amber/purple/cyan 500 ramp entries), alias it;
otherwise use the literal:

- `chart-1` = `#2f6bf2`
- `chart-2` = `#1fc76e`
- `chart-3` = `#ffb81f`
- `chart-4` = `#8b5cf6`
- `chart-5` = `#00c8dc`

Verify all five, then continue.

## STEP 5 — Create the sidebar family (8 variables)

All aliases, both modes:

1. `sidebar` → alias `card`
2. `sidebar-foreground` → alias `foreground`
3. `sidebar-primary` → alias `primary`
4. `sidebar-primary-foreground` → alias `primary-foreground`
5. `sidebar-accent` → alias `secondary`
6. `sidebar-accent-foreground` → alias `foreground`
7. `sidebar-border` → alias `glass-border`
8. `sidebar-ring` → alias `ring` (created in Step 3)

Verify all eight, then continue.

## STEP 6 — Verify/create the night + glass extras (6 variables)

Check whether each of these exists in the semantic collection. Create
only the missing ones with these values:

| Name | Light | Dark |
|---|---|---|
| `night-background` | `#f4f7ff` | alias `background` |
| `night-card` | `#d8dbe8` | alias `card` |
| `night-foreground` | `#05070f` | alias `foreground` |
| `night-muted-foreground` | `#4a4f6d` | `#FFFFFF9E` |
| `glass-stroke` | `#00000047` | `#FFFFFF4D` |
| `glass-hover` | `#00000024` | `#FFFFFF2E` |

Report exists/created for each.

## STEP 7 — Verify/create accent + feedback extras (2 variables)

- `accent-purple`: if missing, create → alias `accent` in both modes.
- `feedback-success-dark-surface`: if missing, create with `#33c78c`
  in both modes.

## STEP 8 — Cleanup: ONLY the already-approved deletions

Delete ONLY the orphaned gradient fill styles left over from the old
8-world taxonomy — the ones with ZERO usages. Procedure: list all local
fill styles whose names reference old world/gradient names; for each,
report its usage count; delete ONLY those with zero usages, and list
what you deleted. If you cannot determine a style's usage count, do NOT
delete it — report it instead. Do not delete any variable, component,
or any style that has usages.

## STEP 9 — Final report

Output a table of every variable created or changed in Steps 1–7 with
its resolved Light and Dark values, plus the list of styles deleted in
Step 8. The developer will re-run the Variables API pull against this
and expects every name above to resolve.
