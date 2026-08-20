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
| Swap sheet / preview on mobile, match-lab guide + rank sheets | profile, match-lab | `Sheet` (side="bottom") |
| Plan level rows, route card disclosure | profile | `Accordion` |
| Build-flow cost step | build | `Slider` |
| Build-flow single-choice steps | build | `RadioGroup` |
| College lookup filters, location picks | colleges | `Select` |
| Nav avatars, profile header photo, Connect posts | app chrome | `Avatar` |
| Talent Pipeline opt-in, settings toggles | profile | `Switch` |
| Readiness updates / system notices | profile | `Alert` |
| Loading rails and reports | everywhere | `Skeleton` |
| Report stat dividers, menu separators | profile | `Separator` |
| Form labels | everywhere | `Label` |
| MatchRing, ReadinessMeter, receipt tiles, journey strip, bento stat tiles | profile | no primitive — port as-is (they only consume theme vars) |
| Career Poster Card, Env Card, activity cards | home, explore | product components (Figma-canonical), not shadcn territory |

The full primitive set is 23 components; the exact install:

```bash
npx shadcn@latest init -b radix -p nova --css-variables
npx shadcn@latest add accordion alert avatar badge button card checkbox dialog dropdown-menu input label progress radio-group select separator sheet skeleton slider switch tabs toggle-group tooltip
```

(`toggle` comes in as a dependency of `toggle-group`.) Every one of these was
installed and visually verified against the Dreamari tokens on the prototype's
`shadcn` branch; https://dreamari.vercel.app/theme-lab lists where each appears
in the product.

## Gradient numeral pattern (new)

Stat values in the profile bento use a text-fill gradient:
`linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)` with
`background-clip: text`, font `--font-display` extrabold. Build it from the
variables; do not hardcode stops.

## Theming shadcn, in one breath

shadcn components are copied into the repo and styled with Tailwind classes
bound to CSS variables (`bg-background`, `text-primary-foreground`,
`border-border`, `ring-ring`). You theme them by defining those variables —
nothing else. Load order: `tokens.css` (Figma pull) → `shadcn-adapter.css`
(contract completions) → components. Dark mode = the `.dark` class scope
(this product is dark-first; see the adapter's note).

## Integration gotchas (all hit and solved on the prototype's shadcn branch)

1. **Portals escape the theme scope.** Radix Dialog/Sheet/Select/DropdownMenu/
   Tooltip render into `document.body`. If the theme classes live on a wrapper
   div, portaled panels fall back to shadcn's default light `:root` values.
   Put the theme scope on `<html>`/`<body>` (theme class on body, scope class
   on html so descendant selectors still match), or pass each portal a
   `container` inside the scope.
2. **The adapter's per-scope alias block is load-bearing.** Custom-property
   aliases declared only at `:root` freeze against `:root` values and ignore
   `.dark`/`.theme-light`. The re-declaration block at the bottom of
   `shadcn-adapter.css` fixes this — keep it when merging the file.
3. **`Tooltip` throws without `TooltipProvider`** (radix-nova preset). Wrap the
   app shell once.
4. **`shadcn init` rewrites `:root` theme vars.** If the app defines its own
   `--background`/`--foreground` at `:root`, re-declare them AFTER shadcn's
   generated block or the app goes light.
5. **`shadcn init` may add Geist via `next/font/google`.** That import pattern
   has broken Dreamari's Vercel builds before — remove it and keep the
   product fonts.
6. **Case-insensitive filesystems:** a legacy `ui/Button.tsx` collides with
   shadcn's `button.tsx`. Point the `ui` alias in components.json at a fresh
   directory (the prototype uses `@/components/shadcn`).

## Known drift to resolve

The adapter's `--chart-1..5` values are 2026-08-19 placeholders from the
proposal. Figma has since gained live chart variables whose current values
differ (design-context emits `chart-2 #ff4585`, `chart-3 #ff9640`, used by the
Home hero labels). Re-pull and regenerate the adapter's chart block, or
re-point the Figma variables — one of the two must win before production.
