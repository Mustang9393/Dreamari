# My Profile → Figma build pack

Faithful reconstruction pack for the /profile experience (prototype, branch v4, 2026-08-20).
Audience: the Figma agent (Codex). Goal: rebuild every screen below in the
**Dreamari Design System v2.0** file using ONLY existing variables, text styles,
and components. Nothing here requires a new token.

## Hard rules

1. **No new variables, no raw values.** Every color, radius, and spacing in the
   captures is written as `var(--token)` inline or as a Tailwind arbitrary like
   `px-[var(--space-5)]`. Each `--token` exists in the certified DTCG export:
   `src/components/marketing/tokens.css` lists the exact Figma source path for
   every variable in a trailing comment (e.g. `--primary: #2f6bf2; /* blue.600 */`,
   collections Primitives.Default / Semantic.Dark / Semantic.Light). Bind the
   Figma variable with that path; never paste the hex.
2. **Both modes.** Everything binds semantic variables so Semantic.Light resolves
   automatically. Do not hand-pick light values.
3. **Reuse components.** Where a capture shows a poster card, nav, tab bar, or
   chip that already exists as a Figma component, place an INSTANCE and override
   text/photo only. Only the genuinely new pieces (list under "New components")
   become new components, and they are assembled from variables + existing styles.
4. **No em dashes in any student-facing string.** Copy is final in the captures;
   transcribe it exactly.
5. One deviation already flagged for the design file: `--card` is `#151829` in
   code (lightened from neutral.800 `#0e0f18` after theme review). Re-point the
   Figma `card` variable to match; do not fork a second variable.

## The captures (desktop DOM, responsive classes included)

Each file is the full rendered `.marketing-v2` subtree of http://localhost:3000/profile
in a given state. `md:` classes = desktop values, unprefixed = mobile values, so
one file yields both breakpoints. Ignore `<script>`/Next.js internals; decode
`/_next/image?url=%2Fimages%2F...` to the real asset path under `public/images/`
(these are the certified Figma exports already in the file).

| File | State it freezes |
| --- | --- |
| 01-overview-default.html | Overview tab: header, tab bar, My Top 3 cards (2 careers + "Add a career" dashed slot), Career Report card, receipts, next-action banner, readiness chips, Locker strip |
| 02-career-report-overlay.html | Export overlay open: dark chrome bar (Engagement/Pathway/Plan toggles, Print) + the white counselor-facing report page |
| 03-path-top3-routes-plan.html | My Path tab: My Top 3 rows (grip, rank, thumb, match ring, focus target, remove, open slot row), Routes cards view (one expanded: journey strip + bento stats + next-step strip), Plan levels (Level 1 open with ring, 2–3 locked) |
| 04-path-routes-compare.html | My Path with Routes toggled to Compare: four single-measure bar charts |
| 05-top3-preview-sheet.html | Career preview sheet open over My Path (poster hero, receipts, Set focus) |
| 06-swap-sheet.html | "Top 3 is full" swap sheet over the Locker (three Replace rows + Never mind) |
| 07-locker.html | Locker tab: poster grid with match rings and Add/Swap actions |
| 08-resume.html | Resume tab (stub state) |
| 09-overview-empty.html | Overview with no Top 3: "Pick a Top 3 to start" empty state |

## Typography

- `--font-display` = Dreamari display face (headings, numerals); `--font-body` =
  body face. Use the existing text styles at the sizes shown; the captures'
  pixel sizes map onto the type scale already in the file.
- Poster/world title faces (focus cards, locker posters, preview hero) come from
  the existing Browse poster variants, one face per world:

| World | Face (weight, tracking) |
| --- | --- |
| Business & Money | poster serif var `--font-poster` (400, 0.81px) |
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

Use the poster COMPONENT variants; they already carry these faces. Do not retype.

## Existing Figma components to instance

- **Career poster card** (Browse variants): basis for Locker posters, focus
  cards, and the preview-sheet hero. Override photo, title, world label only.
- **App navigation** (desktop top nav, mobile bottom nav incl. avatar tab),
  **quick-links menu**, **Logo Identity mark** (the wordmark component).
- **World color chips / labels**: bind `--world-*` variables listed in tokens.css.
- **Text scrim**: the Browse Card's own gradient scrim stops (token-based), used
  at the base of every poster/focus card.

## New components to create (from variables only)

1. **MatchRing**: SVG ring, track `--secondary`, progress `--primary`, percent
   centered in `--font-display`; sizes used: 26, 34, 44/46, 48. Tier label text:
   75+ "Strong match", 50–74 "Solid match", 25–49 "Early match", under 25
   "Low signal" (matches the shipped code; Airline Pilot at 75 renders
   "Strong match").
2. **ReadinessMeter** (header): caption "READINESS", value `46/100`,
   track with stage ticks; stages Building (25) / Pipeline Ready (75) / Opted In
   (100). Sits on the header's progress-blue backdrop: a 90° gradient,
   transparent 30% → `--primary` 16% over `--background` 88% at 62% → `--primary`
   30% mixed into `--background` at 100% (see 01 capture inline style; build it
   as one gradient fill layer in the header component).
3. **Receipt tile**: `--glass-surface-1` fill, icon in `--accent-subtle`, big
   value in `--font-display`, caption in `--muted-foreground`.
4. **Top 3 row** (grip / rank / thumb / title+meta / target / remove) + its
   dashed "Open slot" and "Add a career" placeholder variants.
5. **Route card** (collapsed + expanded disclosure) and **Compare bar chart**
   (one measure per chart, single hue: selected route solid `--accent-subtle`,
   others 45% mix; value labels; LOWER/HIGHER IS BETTER captions).
   The expanded card stacks three pieces, in order:
   - **Journey strip**: Today → school → credential → first paycheck. Icon in a
     `--glass-surface-2` circle, 13px bold label over 10.5px `--muted-foreground`
     sub, connectors `--primary` at 40%. 2x2 grid on mobile, one line on desktop.
   - **Bento stats**: tiles on `--glass-surface-2`, radius `--radius-xl`. TWO
     value sizes only, importance-ordered: First-year pay + Total cost 30/32
     display, Time + Loan payoff 20/24 display. Values use the GRADIENT NUMERAL
     treatment (below). Caption row is the standard 10px tracking caption.
   - **Next-step strip**: full-width row. If the step is a program/school action
     it is a live link to /colleges with a "College lookup" trailing label in
     `--accent-subtle` and a `--primary` 45% border; otherwise it is static with
     a "DO THIS IRL" tag in `--muted-foreground`.
   Collapsed cards show First-year pay / Total cost / Time as caption-over-
   gradient-number clusters (17px), same hierarchy, NO tile chrome.
6. **Plan level row** (open, summary, locked states): numbered chip (size 32,
   `--primary` fill when unlocked, `--glass-surface-2` when locked), "LEVEL n"
   caption in `--accent-subtle`, title + subtitle, right side a progress ring
   (same ring component as MatchRing, % centered) and chevron; locked rows show
   a lock icon + "UNLOCKS AT 40% OF LEVEL n-1". Plus the "Add your own step"
   input row (custom steps get the YOURS chip).

### Gradient numeral treatment (new pattern — add to the design file)

Every bento/collapsed stat value uses a text-fill gradient:
`linear-gradient(100deg, var(--foreground) 8%, var(--accent-subtle) 92%)`,
clipped to the glyphs (background-clip: text), font `--font-display` extrabold.
Create it once in Figma as a reusable style (fill the text layer with that
2-stop linear gradient using the foreground and accent-subtle VARIABLES, 100°)
so both modes resolve automatically. Do not hardcode the stops as hex.

### Top 3 drag interaction (prototype spec)

Press the grip: the row lifts (scale 1.03 + shadow `0 16px 40px` background
mix). It follows the pointer; other rows slide out of the way (160ms ease).
Release commits the order. Dropping a row into slot 1 ALSO sets it as the
focus career (report/routes/plan follow). Keyboard: arrow keys on the focused
grip reorder; reaching slot 1 sets focus the same way. Text selection is
suppressed on the rows (select-none, no touch callout).
7. **Report page** (the white page in 02): this is a light print document, the
   one place with fixed neutral grays; bind to the neutral primitives, not
   Semantic.Dark. Counselor-facing copy is final; transcribe exactly.
8. **Sheets/dialogs**: preview sheet, swap sheet ("Top 3 is full"), both on
   `--glass-surface-3` panels with `--glass-border`.

## Frame checklist

Build desktop (1200 content width) + mobile (375) frames per capture: 9 states
× 2 breakpoints. Wire prototype flows: tab bar between 01/03/07/08; focus-card
tap swaps Career Report content; Export report → 02; row tap → 05; add-when-full
→ 06; empty state 09 links to Swipe careers / Open Locker.

## Data used in the mock (transcribe as-is)

Student: Jordan Rivera, Grade 11, Westfield High School, 12-day streak,
readiness 46/100 "Building Readiness". Top 3 default: Investment Banking (86%),
Airline Pilot (75%), open slot. Locker: Private Equity 88, Software Engineer 84,
Asset Management 80, Registered Nurse 78, Food Scientist 73.
