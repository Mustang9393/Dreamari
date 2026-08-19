# Dreamari tokens → shadcn/ui theming adapter (proposal, 2026-08-19)

For Usman: maps the Dreamari Figma variable set onto shadcn's theming
contract (https://ui.shadcn.com/docs/theming) so shadcn components theme
themselves from the same pipeline that styles the bespoke student UI.

RULE FROM THE HANDOFF STILL APPLIES: values shown here are illustrative
snapshots — generate this file FROM the live Variables API pull
(`GET /v1/files/sV90J9zEKarhCYJMQKbYxx/variables/local`) as a Style
Dictionary output target ("shadcn.css"), never hand-maintain it.

## 1. Direct mappings (exist in Figma today, both modes)

| shadcn var | Dreamari variable | Dark value (snapshot) |
|---|---|---|
| `--background` | `background` | `#05070f` |
| `--foreground` | `foreground` | `#f4f7ff` |
| `--card` | `card` | `#0e1018` (semantic surface/card) |
| `--primary` | `primary` | `#2f6bf2` |
| `--primary-foreground` | `primary-foreground` | `#ffffff` |
| `--secondary` | `secondary` | `#ffffff17` |
| `--secondary-foreground` | `secondary-foreground` | `#f4f7ff` |
| `--muted` | `muted` | `#ffffff08` |
| `--muted-foreground` | `muted-foreground` | `#ffffff9e` |
| `--accent` | `accent` | `#7d5cff` |
| `--destructive` | `destructive` | `#F04438` — CONFIRM live: correction from `#ef4444` was in progress at handoff time |
| `--border` | `border` / `glass-border` | `#ffffff17` |
| `--font-sans` | `font-body` (Montserrat) | — |

Radius: shadcn derives everything from one `--radius` via multipliers.
Don't fight it — either set `--radius: 16px` (Dreamari `radius-lg`) and
accept shadcn's derived steps, or (better) override shadcn's derived
vars directly with the discrete Dreamari scale:
`--radius-sm: var(--dreamari-radius-sm /*8*/)`, `md: 12`, `md-alt: 14`,
`lg: 16`, `xl: 20`, `full: 999`.

## 2. Gaps — shadcn needs these; Figma doesn't define them yet

Two ways to close each gap: add a Semantic variable in Figma (preferred,
keeps Figma the source of truth) or alias in the adapter layer. Proposed
aliases so nothing blocks day one:

| shadcn var | Proposed alias | Rationale |
|---|---|---|
| `--card-foreground` | `foreground` | cards use default text everywhere in the DS |
| `--popover` | `glass-surface-3` (dark) / `card` (light) | the DS's elevated overlay surface |
| `--popover-foreground` | `foreground` | |
| `--accent-foreground` | `foreground` | accent is used as tint, text stays default |
| `--destructive-foreground` | `#f4f7ff` per handoff correction — confirm it landed as a variable | |
| `--input` | `glass-surface-2` | the DS's input-field fill (matches FormInput) |
| `--ring` | `primary` at 50% (`color-mix(in srgb, var(--primary) 50%, transparent)`) | focus ring = brand |
| `--chart-1..5` | five well-spaced PRIMITIVES: `#2f6bf2` (brand blue), `#1fc76e` (green), `#ffb81f` (amber), `#8b5cf6` (purple), `#00c8dc` (cyan) | positional palette for arbitrary admin data — distinct hue families, no new colors. Do NOT use world colors positionally (they carry identity), and don't stretch to 15: shadcn's contract is 5 slots |
| `--sidebar` | `surface-navigation` (nav surface) | |
| `--sidebar-foreground` | `foreground` | |
| `--sidebar-primary` | `primary` | |
| `--sidebar-primary-foreground` | `primary-foreground` | |
| `--sidebar-accent` | `secondary` | hover fill in the DS nav |
| `--sidebar-accent-foreground` | `foreground` | |
| `--sidebar-border` | `glass-border` | |
| `--sidebar-ring` | same as `--ring` | |

## 2b. Charting world data — bypass chart-* entirely

When a chart's series ARE career worlds (signups by world, top explored
worlds), color each series with its world token directly — the world
colors are identity, and world data should wear them everywhere. The
`chart-1..5` slots are only for arbitrary positional series. Both sets
flow through the same pipeline, so the admin app has the 15 world
variables available regardless.

## 3. Mode wiring

Figma has real Light and Dark modes on every Semantic variable — emit
`:root` = Light, `.dark` = Dark, exactly matching his
`@custom-variant dark (&:is(.dark *))` setup. NOTE the product is
dark-first: internal/admin shadcn screens will default light unless he
adds `class="dark"` at the root — worth an explicit decision.

## 4. Known drift to verify on the live pull (from the handoff docs)

- `destructive` `#ef4444` → `#F04438` correction status.
- `CTA Secondary-Disabled` opacity bug: build from token intent, not the
  Figma instance.
- Destructive CTA family was still being added — check before building
  delete actions.

## 5. What this does NOT cover (by design)

Named gradients (text-scrim, card-surface, cta-accent, shimmer…) and the
Background Space spec don't flow through the Variables API — they're in
the bootstrap prompt as literal CSS, and they're for the bespoke student
surface anyway; shadcn admin UI shouldn't use them.
