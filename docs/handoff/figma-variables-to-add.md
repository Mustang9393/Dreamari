# Variables to add in Figma — Semantic collection (2026-08-19)

Executable spec: a human in the Variables panel, or an AI agent with
Figma write access, can apply this directly. Every addition is an ALIAS
to an existing variable wherever possible — no new hues enter the
system except the five chart slots (which alias primitives).

Conventions: add to the **Semantic** collection with both **Light** and
**Dark** mode values, matching the existing `background`/`foreground`
naming style. Scope colors to fill/text as noted. If any "verify" name
below already exists, skip it — this list was compiled without full
Variables API access (names confirmed only through node-level pulls).

## A. shadcn contract gaps (16)

| Name | Light | Dark | Notes |
|---|---|---|---|
| `card-foreground` | alias `foreground` | alias `foreground` | text scope |
| `popover` | alias `card` | alias `glass-surface-3` | fill scope |
| `popover-foreground` | alias `foreground` | alias `foreground` | |
| `accent-foreground` | alias `foreground` | alias `foreground` | |
| `destructive-foreground` | `#f4f7ff` | `#f4f7ff` | pair of the `#F04438` correction — may already exist |
| `input` | alias `glass-surface-2` | alias `glass-surface-2` | fill scope |
| `ring` | `primary` @ 50% alpha | `primary` @ 50% alpha | Figma variables can't hold color-mix; store a literal 50%-alpha of primary (`#2f6bf280`) or leave to the adapter file |
| `chart-1` | alias brand-500 primitive (`#2f6bf2`) | same | |
| `chart-2` | alias green-500 primitive (`#1fc76e`) | same | |
| `chart-3` | alias amber-500 primitive (`#ffb81f`) | same | |
| `chart-4` | alias purple-500 primitive (`#8b5cf6`) | same | |
| `chart-5` | alias cyan-500 primitive (`#00c8dc`) | same | |
| `sidebar` | alias `card` | alias `card` | |
| `sidebar-foreground` | alias `foreground` | alias `foreground` | |
| `sidebar-primary` | alias `primary` | alias `primary` | |
| `sidebar-primary-foreground` | alias `primary-foreground` | alias `primary-foreground` | |
| `sidebar-accent` | alias `secondary` | alias `secondary` | |
| `sidebar-accent-foreground` | alias `foreground` | alias `foreground` | |
| `sidebar-border` | alias `glass-border` | alias `glass-border` | |
| `sidebar-ring` | same treatment as `ring` | same | |

## B. Bridge names to verify / add (used by the code-canonical surfaces)

Confirm these exist in the pull; add any that don't (values below are
the prototype's, which mirrored the dev handoff docs):

| Name | Light | Dark |
|---|---|---|
| `night-background` | `#f4f7ff` | `#05070f` (alias `background`) |
| `night-card` | `#d8dbe8` | `#0e0f18` (alias `card`) |
| `night-foreground` | `#05070f` | `#f4f7ff` (alias `foreground`) |
| `night-muted-foreground` | `#4a4f6d` | `rgba(255,255,255,0.62)` |
| `glass-stroke` | `rgba(0,0,0,0.28)` | `rgba(255,255,255,0.30)` |
| `glass-hover` | `rgba(0,0,0,0.14)` | `rgba(255,255,255,0.18)` |
| `accent-purple` | DONE — points directly at purple/600 (`#7d5cff`), deliberately NOT aliasing `accent` (which moved to brand blue 2026-08-19) | same |
| `feedback-success-dark-surface` | `#33c78c` | `#33c78c` |
| brand ramp exposure (`brand-300/400/500/900`) | `#7fa8ff` / `#4a82ff` / `#2f6bf2` / `#0c2560` | same — likely exist as primitives; confirm the primitive naming the pull emits |

## D. Glass `raised` rung (2026-08-24, added to the prototype's DTCG source)

Additive — no existing glass variable changes. Add to the **Semantic**
collection beside the other `glass-*` variables, both modes.

| Name | Light | Dark | Notes |
|---|---|---|---|
| `glass-raised` | `#ffffffad` (frosted white) | `#ffffff11` | fill scope. Rest fill for a tile the reader must be able to find; sits between `glass-surface-1` and `glass-surface-2`. Light is WHITE, not black-alpha — the black film goes muddy over the pastel aurora |
| `glass-border-raised` | `#0000002e` | `#ffffff29` | stroke scope. Pairs with the above; sits between `glass-border` and `glass-hover` |

Rationale, the DTCG source to mirror into `packages/ui/tokens`, and the
rule for which rung to reach for: `docs/handoff/glass-raised-rung.md`.

## C. After adding

Re-run the Variables pull; every fallback literal in `bridge.css` and
`shadcn-adapter.css` becomes dead weight (the `var()` references win).
At that point regenerate both files from the pipeline and delete the
snapshots.
