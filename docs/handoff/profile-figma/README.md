# My Profile → Figma build pack (v2, 2026-08-20)

Complete, audited replacement for the earlier pack. Everything below reflects
the code on `main` as of this commit; every earlier README contradicted by
this one is superseded. Audience: the Figma agent (Codex), building in
**Dreamari Design System v2.0**.

## Phase 0 rulings (confirmed, act on these)

1. **`card` variable**: set Semantic.Dark `card` to raw `#151829` (keep the
   Light alias on neutral/100). Add a variable description: "re-pointed
   2026-08-20 per theme review; prototype tokens.css is the reference."
2. **Match tiers come from the CODE**: 75+ "Strong match", 50-74 "Solid
   match", 25-49 "Early match", under 25 "Low signal". (Airline Pilot at 75
   renders "Strong match" in the shipped UI.)
3. **Logo Identity and Quick Links**: componentize the existing artwork as
   standalone components, exact geometry, no redrawing.
4. **Gradient numeral style**: create ONE reusable Figma style. 2-stop linear
   gradient at 100 degrees, `foreground` variable at 8% to `accent-subtle`
   variable at 92%, clipped to the glyphs, display face extrabold. Used by
   every stat numeral in this pack. Bind the variables, never hex.
5. **Drag-lift elevation**: one scoped addition to the elevation family:
   0 16px 40px, background color at 70% mix.
6. **Semantic.Light additions** (recently completed in code, author the same):
   secondary `#00000017`, secondary-foreground `#05070f` (neutral/900),
   muted `#00000008`, glass-border `#00000017`, accent `#1e4fcc` (blue/700),
   accent-subtle `#1e4fcc`. Also: accent-foreground pairs with
   primary-foreground (white), NOT with foreground.

## Hard rules

1. **No new variables, no raw values.** Every color/radius/spacing in the
   captures is a `var(--token)`; `src/components/marketing/tokens.css` maps
   each token to its Figma variable path in a trailing comment. Bind
   variables; never paste hex. Exceptions already ruled: the report page's
   print grays (a light paper document, bind neutral primitives) and the
   `#000` inside mask alpha ramps (transparency math, not color).
2. **Both modes** resolve via Semantic Dark/Light. No hand-picked light values.
3. **Instance existing components** (Career Poster Card 46-variant set,
   Desktop Navigation, Mobile Nav); override photo/text only. New components
   are listed below and built only from variables + existing text styles.
4. **No em dashes** in student-facing strings. Copy in the captures is final.

## Information architecture

- The identity header holds: avatar (editable), name/grade/school, a
  **utility pill row** (archive icon + "Locker", gear + "Settings"), then the
  streak + ReadinessMeter row. Utility pills stack ABOVE the stats,
  right-aligned on desktop, left on mobile. The focus career's poster art
  fills the header's right side behind a progress-blue legibility gradient.
- **My Top 3** sits above the tab bar: full-size poster cards that act as
  career tabs. Tap = focus (report, routes, plan all follow). Drag the rank
  chip horizontally to reorder; dropping into slot 1 also sets focus. X
  removes. The dashed slot opens the **Add sheet** in place. Under the
  cards (Overview only): the **Locker peek**, a collapsed row that expands
  into the mini poster strip.
- **Tabs: Overview / Path / Plan / Resume.** Locker and Settings are NOT
  tabs: opening either replaces everything under the header (Top 3 and tab
  bar hidden) with a full view that closes back to Overview.
- **Path** = a ONE-AT-A-TIME route carousel on every breakpoint: the focused
  card centered with neighbors peeking in from the edges, route-name pills
  above (synced both ways), and floating prev/next chevrons on desktop.
  Cards = deep-dive one route; the Compare view owns side-by-side. Each card
  carries its own section tabs (Stats / Fit / Life / Payoff); tapping swaps
  ONE content window in place, so a card never stacks sections. On desktop
  the card interior is two-column: identity + CTA left, tabs + pane right.
- **Plan** = the levels for the chosen route.

## The captures (12 states, desktop DOM, responsive classes included)

Full rendered `.marketing-v2` subtree per state. `md:` classes = desktop,
unprefixed = mobile; one file covers both breakpoints. Decode
`/_next/image?url=...` to the asset path under `public/images/`.

| File | State |
| --- | --- |
| 01-overview-default.html | Header, Top 3 (2 careers + Add slot), collapsed Locker peek, tabs, Career Report with bento stat tiles + bento receipts, next action, readiness chips |
| 02-career-report-overlay.html | Counselor-facing export overlay (chrome bar with section toggles + white report page) |
| 03-path-routes-cards.html | Path tab: route-pill switcher + hero carousel (focused card, peeking neighbors, prev/next arrows) with in-card Stats/Fit/Life/Payoff tabs; Fit/Life/Payoff pane contents spec'd below and sourced from ROUTE_DETAILS |
| 04-path-routes-compare.html | Compare view: category table with benefit tags + four single-measure charts |
| 05-plan-levels.html | Plan tab: Level 1 open with ring, 2-3 locked, add-your-own-step, Change route link |
| 06-add-career-sheet.html | Add-to-Top-3 sheet: locker list with rings + Add buttons |
| 07-swap-sheet.html | "Top 3 is full" swap sheet |
| 08-locker.html | Locker full view (poster grid, Add/Swap, X back to Overview); Top 3 + tabs hidden |
| 09-resume.html | Resume tab (stub) |
| 10-overview-empty.html | No Top 3: three dashed Add slots + "Pick a Top 3 to start" |
| 11-settings-view.html | Settings full view: photo hint, stub rows with SOON chips, sign out |
| 12-overview-locker-peek.html | Overview with the Locker peek EXPANDED (mini poster strip + "Open full Locker") |

## Typography

`--font-display` for headings and every numeral; `--font-body` for body.
Poster titles use the existing per-world faces already carried by the Career
Poster Card variants:

| World | Face (weight, tracking) |
| --- | --- |
| Business & Money | `--font-poster` (400, 0.81px) |
| Tech & Engineering | `--font-poster-science` (700, -2px) |
| Health & Medicine | `--font-poster-nunito` (700, 0.81px) |
| Arts, Media & Sport | Rozha One (400, 0.81px) |
| Science & Research | `--font-poster-mono` (600, 0.81px) |
| Teaching & Education | Merriweather (700, 0.72px) |
| Building & Construction | Heebo (700, 1px) |
| Law, Safety & Justice | `--font-poster-zcool` (400, 0.81px) |
| Farming, Animals & Nature | Lora (700, 0.81px) |
| Counseling & Social Work | Zain (900, 0.81px) |
| Driving, Flying & Shipping | `--font-poster-sekuya` (400, 0.72px) |

## Component inventory

### Instance from the file (exists)
- Career Poster Card (basis of Top 3 cards, locker posters, add-sheet thumbs)
- Desktop Navigation, Mobile Nav
- Logo Identity + Quick Links (componentize first, ruling 3)
- World chips: bind `--world-*` variables
- Text scrim: the Browse Card's own token-based gradient stops

### Create (each from variables + the gradient style)
1. **MatchRing**: track `--secondary`, progress `--primary`, percent centered
   in display face. Sizes in use: 26, 32, 34, 38, 44, 52. Tier labels per
   ruling 2.
2. **ReadinessMeter**: "READINESS" caption, `46/100`, staged track with ticks
   (Building 25 / Pipeline Ready 75 / Opted In 100).
3. **Header** assembly: identity + utility pills (h32 pill, glass-surface-3
   fill, glass-border; active = primary border + accent-subtle text) + stats
   row + focus art with mask and the progress-blue gradient (90 degrees,
   transparent 30% -> primary 16% over background 88% at 62% -> primary 30%
   into background at 100%).
4. **Top 3 card** (from the poster component): rank chip (glass-surface-3
   circle, display face), FOCUS badge + X in one top-right cluster, MatchRing
   in a glass circle above the title, focus state = primary border at
   scale 1.0, unfocused = 72% opacity at scale 0.97. Variants: focus,
   default, drag-lift (elevation ruling 5), dashed add-slot placeholder.
5. **Locker peek**: collapsed row (archive icon, "Locker", count, chevron) +
   expanded strip of 106x150 mini posters with MatchRing 26 and "Open full
   Locker" link.
6. **Bento stat tile**: `--glass-surface-2` fill, radius `--radius-xl`,
   caption row (10px tracking uppercase, optional small icon right), value in
   the gradient numeral style. Two sizes only wherever tiles sit together.
   Used for: report stat band (Match/Route/Plan), receipts, route money
   blocks (boxless variant: same hierarchy, no fill).
7. **Route column**: type icon in glass circle + YOUR PATH chip (selected),
   type caption, program title, credential + location line, pitch, money
   block in decision order (Time, Total cost, First-year pay; boxless bento
   rows on a `--glass-surface-1` panel) as the default Stats pane. Under the
   identity block sits a 4-segment in-card tab bar (glass-surface-2 track,
   active segment primary fill + primary-foreground text, 10.5px bold:
   Stats / Fit / Life / Payoff); tapping swaps the single content window.
   Pane contents:
   - *Good fit*: tagline chip, ACCEPTANCE GAUGE (track accent-subtle 22%,
     fill accent-subtle, % in gradient numerals, source text as caption),
     aid + where-you-would-work fact rows, placement chip (High = feedback
     success at 22% fill).
   - *Student life*: three bullets, community feel, study abroad fact rows.
   - *Loan payoff*: payoff numeral + tag chip, avg loan + starting salary
     line, SALARY BAR CHART (3 bars, final year solid accent-subtle, earlier
     years 45% mix, amounts above, year captions + bonus notes below),
     MONTHLY BUDGET two-segment bar (loan solid / keep 22% mix) with legend
     dots, takeaway line in accent-subtle.
   Panes render bare (no disclosure chrome).
   Selected column: primary border, primary 10% wash, CTA "Open your plan
   for this path"; unselected CTA "Continue with {short}". Next-step footer
   line links to /colleges when the step is a program/school action,
   otherwise carries a "DO THIS IRL" tag.
8. **Route switcher pills** (all breakpoints): route.short pills above the
   carousel, active pill = primary fill, synced with the scroll position; the
   recommended route's pill carries a sparkle icon. Desktop adds floating
   prev/next chevron buttons (size 40 glass circles, 30% opacity at ends).
   One route per career is RECOMMENDED (data flag): its card gets a sparkle
   "Recommended" chip (accent-subtle 18% fill) next to "Your path", and its
   Compare column header gets the same tag. The rail is full-bleed to the
   viewport with padding back to the content edge, so card 1 aligns with the
   section header and peeking neighbors are never clipped.
   PLAN PING: whenever focus or the chosen route changes, the Plan tab shows
   a brief "UPDATED" chip (accent-subtle fill, ~2.6s, reveal animation).
9. **Compare table**: first column category labels, one column per route,
   value + benefit tag chip (primary 18% fill, accent-subtle text) per cell,
   selected column washed primary 7% with a YOURS chip.
10. **Compare chart**: one measure per chart, single hue (selected solid
    `--accent-subtle`, others 45% mix), value labels, LOWER/HIGHER IS BETTER
    captions.
11. **Plan level row**: number chip (primary when unlocked), LEVEL n caption,
    title + subtitle, progress ring + chevron; locked = 55% opacity with
    lock icon + "UNLOCKS AT 40% OF LEVEL n-1". Task rows with checkbox,
    YOURS chip on custom steps, minutes, action icon; dashed add-your-own
    input row.
12. **Sheets**: Add-to-Top-3 (locker rows: thumb, title, world + tier,
    MatchRing 32, Add button) and Swap ("Top 3 is full", Replace rows,
    Never mind). Card fill on `--card`, backdrop = background at 78%.
13. **Settings view + Locker view**: full-width views under the header
    (no Top 3, no tabs) with an X back to Overview.
14. **Report page** (02): light print document; bind neutral primitives.
    Counselor-facing copy is final; transcribe exactly.

## Prototype wiring

Tabs switch Overview/Path/Plan/Resume. Top 3 card tap -> focus swap across
all tabs. Add slot -> 06. Locker pill -> 08; Settings pill -> 11; X on
either -> 01. Route CTA -> selected state; selected CTA -> 05. Export ->
02. Empty state (10) links to Match Lab / Add sheet. Locker peek row toggles
12. Frames: 12 states x 2 breakpoints (desktop 1200 content, mobile 375).

## Mock data (transcribe as-is)

Jordan Rivera, Grade 11, Westfield High School, 12-day streak, readiness
46/100 "Building Readiness". Top 3 default: Investment Banking 86, Airline
Pilot 75, open slot. Locker: Private Equity 88, Software Engineer 84, Asset
Management 80, Registered Nurse 78, Food Scientist 73. Route facts and the
full fit/life/payoff details live in the captures (source:
src/components/profile/data.ts, ROUTE_DETAILS).
