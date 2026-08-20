# Prototype components → shadcn/ui map

The prototype's app screens (/home, /explore, /profile, /colleges, /match-lab)
are **bespoke React + Tailwind — no shadcn code is installed here**. They are,
however, written against shadcn's theming contract: every color/radius they
use resolves through the same CSS variables shadcn components read
(`--background`, `--foreground`, `--card`, `--primary`, `--secondary`,
`--muted`, `--border`, `--radius-*`), defined in
`src/components/marketing/tokens.css` (the certified Figma pull) and completed
by `docs/handoff/shadcn-adapter.css`.

That means the production rebuild is a primitive swap, not a redesign: drop
real shadcn/ui components into the same scope and they wear Dreamari
automatically. This table says which primitive each bespoke piece becomes.

| Prototype piece | Where | shadcn/ui primitive |
|---|---|---|
| Tab bars (Overview/My Path/Locker/Resume; Cards/Compare; For You/Browse All) | profile, explore | `Tabs` |
| Primary/ghost buttons (Export report, Find schools, Set focus) | everywhere | `Button` (default / outline variants) |
| Swap sheet, career preview sheet | profile | `Dialog` (desktop) / `Drawer` (mobile) |
| Quick-links hamburger menu | app chrome | `DropdownMenu` |
| Filter/sort pills, world chips, readiness status chips | explore, profile | `Badge` (interactive: `Toggle` / `ToggleGroup`) |
| Plan task checkboxes | profile | `Checkbox` |
| Plan/readiness progress bars | profile | `Progress` |
| Search input (expanding) | explore | `Input` + `Command` when real search lands |
| Icon-button tooltips (title attrs today) | profile | `Tooltip` |
| Add-your-own-step form | profile | `Input` + `Button` |
| Route compare bars | profile | shadcn Charts (Recharts `BarChart`) or keep the bespoke bars — both read `--chart-*` |
| MatchRing, ReadinessMeter, receipt tiles | profile | no primitive — port as-is (they only consume theme vars) |
| Career Poster Card, Env Card, activity cards | home, explore | product components (Figma-canonical), not shadcn territory |

## Theming shadcn, in one breath

shadcn components are copied into the repo and styled with Tailwind classes
bound to CSS variables (`bg-background`, `text-primary-foreground`,
`border-border`, `ring-ring`). You theme them by defining those variables —
nothing else. Load order: `tokens.css` (Figma pull) → `shadcn-adapter.css`
(contract completions) → components. Dark mode = the `.dark` class scope
(this product is dark-first; see the adapter's note).

## Known drift to resolve

The adapter's `--chart-1..5` values are 2026-08-19 placeholders from the
proposal. Figma has since gained live chart variables whose current values
differ (design-context emits `chart-2 #ff4585`, `chart-3 #ff9640`, used by the
Home hero labels). Re-pull and regenerate the adapter's chart block, or
re-point the Figma variables — one of the two must win before production.
