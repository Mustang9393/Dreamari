# Component states design log

Custom-designed (not generic-default) empty, loading, error, and edge-case
treatments, one component/surface at a time, verified live and
screenshotted before being marked done. This is the bespoke-design
companion to `docs/COMPONENT_STATES_PLAYBOOK.md` (the app-wide *default*
catalog) -- entries here override that default for their specific
component once designed.

**Scope, honestly**: this app has 139 component files and several hundred
actual components once sub-components inside large files are counted. This
log will not be complete in one sitting. It's worked feature-by-feature, in
priority order, and updated every session. Treat "Not started" as the
accurate current state, not a gap to be embarrassed about -- that's what
`COMPONENT_STATES_PLAYBOOK.md`'s defaults are for in the meantime.

**Priority order** (per Usman's own report that Build/Match/Explore demo
data is complete but real data will be sparse):

1. Match (`src/components/match-lab/`)
2. Career Detail (`src/components/career/`) -- elevated 22 Sept 2026, see
   below: confirmed as the single highest-impact gap in the app (137 of
   214 real catalog careers, 64%, render with zero data beyond title/
   world/photo).
3. Build (`src/components/build/`, `src/components/flow/`)
4. Explore (`src/components/marketing/ExploreExperience.tsx` and friends)
5. Profile (`src/components/profile/`)
6. Play (`src/components/play/`)
7. Connect (`src/components/connect/`)
8. Colleges (`src/components/colleges/`)
9. Resume Builder (`src/components/resume/`)

**Cross-cutting theme, flagged 22 Sept 2026**: "important edge case
throughout is missing data for almost any type of content, career,
college, school, etc." -- not scoped to one feature. Confirmed as real and
large (see Career Detail below) rather than theoretical. Also flagged:
this isn't only whole-section gaps -- "sometimes a few points inside a
section or 1 point inside a section will be missing (1 field)." Both are
now being checked for on every component touched, not just whole-section
absence.

**Two separate tracks, clarified 22 Sept 2026**: the state/edge-case
*handling code* (TabComingSoon, DotList filtering, Match's placeholder
cards, etc.) is permanent, documented reference behavior for Usman's own
build -- keep designing and pushing all of it regardless of the demo.
Separately, and only for the demo actually pushed to Vercel: real content
coverage matters, not fallback text, specifically for whatever's reachable
from the Explore tab (a demo viewer clicking a world filter is one click
from real careers, and several worlds were 100% thin -- see "Mock content
for Explore-reachable careers" below). The fallback code stays in place
either way; it just shouldn't be what a demo viewer actually sees, since
the demo is deliberately curated, not a random sample of real data.

Screenshots referenced below live in
`docs/reference/component-states-2026-09-22/`.

---

## 1. Match (`src/components/match-lab/MatchGrid.tsx`)

Status: **in progress** -- 5 of 6 known states done, 1 remaining (image
load failure).

| Component / state | Status | Notes |
|---|---|---|
| Grid: `DECK` has fewer than 6 careers | **Done, 22 Sept** | Placeholder tiles. |
| Grid: `DECK` has zero careers | **Done, 22 Sept** | Whole-route empty state. |
| GridCard / DetailModal: very long career title | **Done, 22 Sept** | line-clamp-3, defensive. |
| DetailModal: empty "What You'd Do" / "Good Fit If" / "School & Path" | **Done, 22 Sept** | "Details coming soon." fallback. |
| GridCard: picks fail to save (`writePicks` throws) | **Verified, already handled** | See below -- no change needed. |
| DetailModal / GridCard: missing/failed cover image | Not started | |
| Splash: zero careers matched at all | Superseded | Covered by the grid's own empty state; splash copy unchanged since it's shown before the count is known. |

### Grid: `DECK` has fewer than 6 careers -- Done, 22 Sept 2026

**Why this matters**: `DECK` is a fixed array of 6 today, but a real
personalized-match backend (Usman's own concern: "real data will be
sparse") can return fewer for a student with narrow stated interests. The
grid was hard-coded to a 2x3 (mobile) / 3x2 (desktop) layout -- confirmed
live with a temporary 4-item test slice that anything short of 6 left
dead, unexplained empty cells in the bottom-right corner of the grid, with
no visual explanation for why.

**Design**: pad any missing slot with a `PlaceholderMatchCard` -- dashed
border, a muted `Sparkles` icon, "More matches coming" -- reusing this
app's own existing "nothing here yet" visual language (the dashed-shelf
tier from `COMPONENT_STATES_PLAYBOOK.md`) instead of a new invented look.
This is also honestly what's true: the splash immediately before this
screen already promises "later our EXPLORE feature will recommend more
careers like the ones you save," so the placeholder isn't covering for a
gap, it's stating it.

**Verified live**: tested with 4-item and 5-item slices of `DECK` at both
desktop (1440-ish) and mobile (375px) widths -- placeholder tiles render
correctly at every count and reflow with the existing responsive grid
with no extra per-breakpoint logic needed. Confirmed the real, full
6-item `DECK` renders zero placeholder tiles (no regression). `npx tsc
--noEmit -p .` and `npx eslint` clean.

**Behavior notes for review**: the placeholder tile is `aria-hidden`,
non-interactive, and carries no hover state -- there is nothing to tap
yet, so it should not look tappable. It does not currently count toward
"X of 3" selection logic (correct -- it isn't a real career). Screenshots
were shown inline in the session that built this; ask Chandu for a
shareable packet if you want one exported for review with Usman
specifically, since screenshots aren't automatically saved as files in
this repo.

### Grid: `DECK` has zero careers -- Done, 22 Sept 2026

**Why this matters**: a genuinely empty deck is a different situation
from a sparse one, not just a bigger version of it. Padding all 6 slots
with `PlaceholderMatchCard` would leave a student staring at six "more
matches coming" tiles with zero real content, plus a permanently-disabled
Continue button -- a dead end with no way forward, not a graceful
degradation.

**Design**: whole-route empty state (`COMPONENT_STATES_PLAYBOOK.md`'s
tier 4 -- the largest treatment, for when there's nothing to build the
page around at all): a muted Sparkles icon, "No matches yet," one line of
explanation, and a real CTA ("Explore careers") routing to `/explore`.
The sticky continue bar at the bottom of the screen is hidden entirely in
this state (a "save up to 3" message and a Continue button that can never
enable is a second dead end stacked on the first) and the "Tap a card..."
instruction line is suppressed too, since there's nothing to tap.

**Verified live**: tested with a temporary zero-length `DECK` override,
confirmed the empty state renders correctly, the sticky bar is absent,
and the "Explore careers" button actually navigates to `/explore` and
opens that page's own splash correctly. Confirmed the real 6-item `DECK`
is completely unaffected (both conditions fully reverted, `git diff`
clean on `data.ts`, `tsc`/`eslint` clean on the final state).

### GridCard / DetailModal: very long career title -- Done, 22 Sept 2026

**Why this matters**: neither the card's title (a `career.font`-styled
`<p>` with no `line-clamp`) nor the modal's own larger version had an
upper bound on how many lines a title could grow to.

**Verified first, before designing anything**: tested live with a
48-character title ("Industrial-Organizational Psychology Research
Consultant"). Both the card and modal already degrade gracefully --
neither uses a fixed-height container for its title (the card's scrim is
`flex-col justify-end` inside `absolute inset-0`; the modal's hero title
sits in its own bottom-anchored gradient scrim), so a long title simply
grows the scrim taller rather than clipping or overlapping the world
label, salary chip, or prev/next arrows. This was NOT a broken state.

**Design**: added `line-clamp-3` to both as a defensive cap only, matching
this app's own established truncation convention (already used ~130
times elsewhere) -- not because the current behavior was wrong, but so a
truly pathological title (many more characters, or accidentally
concatenated text) can't grow unbounded and dominate the card.

**Verified live**: screenshotted both the card grid and the open detail
modal with the long test title before AND after adding the clamp; real
6-item deck confirmed unaffected after reverting the test title
(`git diff` clean).

### DetailModal: empty content sections -- Done, 22 Sept 2026

**Why this matters**: `BulletList` rendered `items.map(...)` with no
check for `items.length === 0` -- every `DECK` entry today is fully
authored, so this never fires yet, but a newly-added or thin real career
(the exact "Career Detail thin content" issue already known elsewhere in
this app) would hit an empty `<ul>` under a section heading with nothing
below it, reading as broken rather than "not written yet."

**Design**: when `items` is empty, `BulletList` now renders one line of
italic muted text, "Details coming soon," instead of an empty list --
matching this app's own established "Coming soon" convention for
unauthored content (`COMPONENT_STATES_PLAYBOOK.md`).

**Verified**: `tsc`/`eslint` clean; not screenshotted live since no
current `DECK` entry has an empty section to trigger it naturally, and a
synthetic override wasn't worth the added test-data risk for a one-line
text swap already covered by the same code path other empty-content spots
in the app use.

### GridCard: picks fail to save -- Verified, already handled, 22 Sept 2026

Checked `src/lib/picks.ts`'s `writePicks()`: it already wraps its
`localStorage.setItem` in a `try/catch` with an explicit comment
explaining the fallback ("Private browsing, quota, disabled storage: the
flow still works for the length of one navigation because the ids also
travel in the URL"). No code change needed -- logged here so this item
doesn't read as "not checked."

---

## 2. Career Detail (`src/components/career/CareerDetailExperience.tsx`)

Status: **in progress** -- the app-wide missing-data problem confirmed and
fixed at the code level; a few tracked items remain.

| Component / state | Status | Notes |
|---|---|---|
| A tab with no data for it renders nothing (dead gap before "Careers like this one") | **Done, 22 Sept** | `TabComingSoon`, all 5 tabs. |
| Quick-facts strip with exactly 1 fact leaves a dead empty grid column | **Done, 22 Sept** | grid-cols-1 for the 1-fact case. |
| `DotList` bullet with a blank/whitespace-only item in an otherwise-real array | **Done, 22 Sept** | Filtered; shared with College Detail. |
| `DotList` where EVERY item in the array is blank | **Done, 22 Sept** | "Not written up yet." fallback. |
| `Rung` (career ladder) with some fields missing (pay, description, sub-lists) | **Verified, already handled** | Every field independently optional-checked; no change needed. |
| `PayRows` / Pay tab with a partial `payByState` (missing `yourStates` but has `best`, or vice versa) | Not started | |
| Missing/failed cover photo | Not started | |
| Structural order (facts vs. tabs) | **Investigated, kept as-is** | See below -- a real reversal was requested, then reverted same session after confirming the original order was a deliberate 15 Sept decision, not a mistake. |

### The core finding: this is real and large, not theoretical

Direct flag: "important edge case throughout is missing data for almost
any type of content, career, college, school, etc." Rather than guess,
counted it. Extracted all 219 catalog career titles (`catalog.ts` +
`browseLibrary.ts`), converted each to its real URL slug (respecting the
two `SLUG_OVERRIDES` in `career/slug.ts`), and fetched all 214 resolvable
career pages from the running dev server, counting each page's
`data-fact-cell` elements.

**137 of 214 real catalog careers (64%) render with ZERO facts at all** --
not a rare edge case, the majority case. Spot-verified live and
screenshotted: "Financial Advisor" (a completely mainstream career, not an
obscure one) shows no scenario line, no facts row at all, and every one of
its 5 tabs used to go straight from the tab bar to "Careers like this one"
with nothing in between.

### Fix 1: every tab gets a real fallback instead of rendering nothing

Each of the 5 tabs (`Overview`/`Education`/`Career Ladder`/`Pay`/`Software`)
only ever rendered when its specific data existed (`vm.payByState`,
`vm.ladder.length > 0`, etc.) -- when it didn't, the tab area was
completely empty, reading as a broken page rather than "not written up
yet." New shared `TabComingSoon` component (a muted Sparkles icon + "{tab}
coming soon" + a one-line explanation naming the career), rendered as the
`else` branch for every tab's existing condition. Deliberately NOT wrapped
in the same bordered `Section` panel real content uses, so it reads as
"nothing here," not "here's real content in a panel that happens to be
short."

### Fix 2: the facts strip's own single-item dead-space bug

The same class of bug already fixed in Match's grid, found here too: a
thin career with exactly one fact (median salary survives from the
catalog; degree/majors are the literal "Coming soon" placeholder and get
filtered out) still got `grid-cols-2`, leaving a dead empty second column
inside the same full-bleed bordered panel. `grid-cols-1` for the
single-fact case only; 2/3/4-fact layouts unchanged.

### Fix 3: field-level gaps within an otherwise-populated list (`DotList`)

Follow-up flag: "its not just the case of 1 whole section being missing,
sometimes a few points inside a section or 1 point inside a section will
be missing (1 field if you will)." `DotList` (shared between Career
Detail's own Know-About/Good-At lists AND College Detail's admissions
factor lists -- `CollegeDetailExperience.tsx` imports it directly) now
filters blank/whitespace-only items before rendering, so one gap in an
otherwise-real array doesn't render an empty bullet marker with nothing
after it; and falls back to "Not written up yet." in the rarer case where
every item was blank (callers gate the section heading on the raw array's
length, so without this the heading would show with nothing under it).

### Investigated: should facts move below the tabs? -- kept as-is

Direct instruction mid-session to move the facts card below the tab
switcher ("header > tabs > rest of the content"). Implemented, verified
live, then a follow-up question ("was this intentional or a mistake?")
surfaced that the current order (facts above tabs) was itself a deliberate
15 Sept 2026 decision ("keep Typical Degree and Typical Pay visible near
the top before the tabs") -- confirmed also live on the deployed Vercel
prototype, not just local. Reverted back to the original order same
session once that history was confirmed. No net change; logged so the
back-and-forth doesn't get re-litigated blind next time.

**Verified live throughout**: `tsc`/`eslint` clean on every touched file.
Built and tested against a synthetic zero-data test career (added
temporarily to `catalog.ts`, fully reverted after -- `git diff` clean) to
control the exact scenario, THEN cross-checked against a real, common,
live career ("Financial Advisor") to confirm it wasn't a synthetic-only
fix. All 5 tabs screenshotted in both the broken (before) and fixed
(after) states.

---

## Mock content for Explore-reachable careers (demo-only concern)

Status: **in progress** -- 1 of ~9 affected worlds fully closed.

Not a UI/state-handling task -- this is content authoring, tracked
separately from the design log above. Scope, per direct instruction: "I
want there to be data for everything visible in the explore tab. Others
can wait" -- not all 137 thin careers, just the ones a demo viewer can
actually reach from Explore.

**Method**: Explore's default Browse view (no filter clicked) renders 7
curated rails + the Arts world -- 67 unique titles, checked against the
137-thin list: **zero overlap**. The default view was already clean.
The real risk is one click away: clicking ANY world filter pill renders
`ALL_CATALOG_CAREERS` filtered to that world, and most worlds have
significant thin counts:

| World | Thin / Total |
|---|---|
| Fixing Machines & Engines | ~~18/18~~ **0/18 -- closed 22 Sept** |
| Business & Finance | ~~25/36~~ **0/36 -- closed 22 Sept** |
| Building & Construction | ~~18/23~~ **0/23 -- closed 22 Sept** |
| Driving, Flying & Shipping | ~~18/23~~ **0/23 -- closed 22 Sept** |
| Driving, Flying & Shipping | 18/23 |
| Factories & Making Things | 11/12 |
| Health & Medicine | 11/17 |
| Law, Safety & Justice | 9/12 |
| Counseling & Social Work | 8/12 |
| Personal Care & Community Services | 6/7 |
| Tech & Engineering | 7/14 |
| Farming, Animals & Nature | 2/7 |
| Science & Research | 1/2 |
| Food & Cooking | 1/1 |
| Arts, Media & Sport | 0/27 (already clean) |
| Teaching & Education | 0/1 (already clean) |

**Format**: every entry follows `profiles.generated.ts`'s own established
convention exactly (its own header comment, unchanged): "GENERATED
PROTOTYPE DATA... figures are approximate, drawn from the BLS Occupational
Outlook Handbook and O*NET... rounded... do not treat as sourced." Skips
the optional `factDetails` block (the memory on this file already notes
that's safe to omit -- the (i) icon just doesn't render). Every entry has:
summary, scenario, 2 facts (degree + pay), `payByState` (3 states),
knowAbout, goodAt, software (where relevant), a 3-rung career ladder, and
education -- matching the Carpenter/Asset Manager blueprint shape exactly
(confirmed via `tsc` -- every entry satisfies `CareerProfile` with no type
errors).

### Fixing Machines & Engines -- Done, 22 Sept 2026 (18 careers)

100% thin before (the worst of any world) -- now 0% thin. Auto Body
Technician, Auto Mechanic, Aviation Maintenance Technician, Avionics
Technician, Biomedical Equipment Technician, Diesel Mechanic, Heavy
Equipment Mechanic, HVAC Technician, Industrial Maintenance Technician,
Locksmith, Low Voltage Technician, Millwright, Motorcycle Mechanic, Office
Equipment Technician, Power-Line Technician, Semiconductor Equipment
Technician, Telecom Technician, Wind Turbine Technician.

Verified live: HVAC Technician screenshotted in full (header, facts,
Overview, Career Ladder), all 18 confirmed populated via a batch fetch
check (`data-fact-cell` count 0 -> 2 for every one). `tsc`/`eslint` clean.

**Follow-up same day**: initially skipped the optional `factDetails` block
(the (i) icon behind Typical Degree/Typical Pay) to keep scope down, per
the memory's own note that it's safe to omit. Direct feedback caught the
inconsistency: the fully hand-built careers (Asset Manager, Carpenter) DO
have it, so skipping it read as a different, lesser tier of content, not
a deliberate simplification. Added `factDetails.degree` (education
distribution, 7 buckets summing to exactly 100% for all 18, checked
programmatically) and `factDetails.pay` (starting/typical/top) to every
one of the 18, matching Carpenter's own trade-appropriate template rather
than Asset Manager's white-collar one. Verified live: HVAC Technician's
(i) icon opens the full "What you need to get in" sheet correctly.
`tsc`/`eslint` clean.

### Aside: Glossary Game background music extended (not a states task, logged for continuity)

Direct feedback: "the music for the glossary games are too short of loops
being repeated and causes fatigue we need full songs that vary... things
like mario, pokemon etc." Every `src/components/play/glossaryThemeSound.ts`
background pattern was an 8-16-note phrase looping every 2-8 seconds --
catchy on first listen, fatiguing on repeat. Rewrote all four (v1
twinkle/v2 NES/v3 ambient/v4 synthwave) as genuinely sectioned
compositions (Intro/Theme A/Theme B or Bridge/Return, or a verse+chorus-
register-lift pair for v4), 5-8x longer per loop (v1: 2.1s -> 11.7s, v2:
1.8s -> 8.7s, v3: 7.7s -> 23.0s, v4: 1.7s -> 13.4s), each with real
harmonic movement (a bridge to the relative minor for v1, a dominant-key
second theme for v2, a pentatonic register shift for v3, a full 4-chord
progression played twice for v4) rather than the same notes repeating.
`tsc`/`eslint` clean; verified live on v4 with no console/server errors
over a full loop cycle.

### Business & Finance -- Done, 22 Sept 2026 (25 careers)

The largest single gap by career count, and the world most likely to be
clicked in a demo of a career-guidance product -- now 0% thin. Bank
Teller, Claims Adjuster, Customer Service Representative, Entrepreneur,
Event Director, Event Marketing Manager, Event Operations Manager,
Exhibition Sales Manager, Fashion E-Commerce Manager, Fashion
Merchandiser, Financial Advisor, Insurance Agent, Management Consultant,
Market Research Analyst, Marketing Manager, Medical Office Assistant,
Office Clerk, Operations Manager, Project Manager, Real Estate Agent,
Receptionist, Recruiter, Retail Sales Associate, Retail Store Supervisor,
Stockbroker.

`factDetails` included from the start this time (learned from the
Fixing Machines follow-up). One entry needed a real judgment call:
"Entrepreneur" has no BLS occupation code, so pay is honestly "Varies
widely" / "Unbounded" rather than a fabricated false-precision number --
matching the project's own standing rule against inflating figures to
fit a format. Verified live (screenshotted) that this renders as an
honest, readable state, not a broken one.

Verified: all 25 confirmed populated via batch fetch check. Caught and
fixed two rounding errors (claims-adjuster, event-director distributions
summing to 99.5% instead of 100%) via a programmatic sum check across all
25 -- now exact. `tsc`/`eslint` clean.

### Building & Construction -- Done, 22 Sept 2026 (18 careers)

Now 0% thin. Boilermaker, Bricklayer, Building Inspector, Concrete
Finisher, Construction Foreman, Construction Laborer, Construction
Manager, Drywall Installer, Elevator Technician, Glazier, Hazardous
Materials Worker, Heavy Equipment Operator, Highway Maintenance Worker,
Iron Worker, Painter, Pest Control Technician, Plumber, Solar Panel
Installer.

Verified: all 18 confirmed populated via batch fetch check (0 exceptions
from the expected `factCellCount: 2`), Elevator Technician screenshotted
live with its (i) icons in place. `tsc`/`eslint` clean, all 18
distributions checked programmatically to sum to exactly 100%.

### Driving, Flying & Shipping -- Done, 22 Sept 2026 (18 careers)

Now 0% thin. Ambulance Driver and Attendant, Cargo Handling Supervisor,
Commercial Pilot, Delivery Driver, Demand Planner, Driver and Sales
Worker, Flight Attendant, Hand Packer, Parking Attendant, Railroad
Conductor, Sanitation Worker, Ship Captain or Mate, Shuttle Driver or
Chauffeur, Stocker and Order Picker, Supply Chain Manager, Transit Bus
Driver, Vehicle Cleaner, Warehouse Worker.

Verified: all 18 confirmed populated via batch fetch check, `tsc`/`eslint`
clean, all 18 distributions checked programmatically to sum to exactly
100%.

### Remaining worlds -- not started

Factories & Making Things (11), Health & Medicine (11), Law Safety &
Justice (9), Counseling & Social Work (8), Tech & Engineering (7),
Personal Care & Community Services (6), Farming Animals & Nature (2),
Science & Research (1), Food & Cooking (1).

---

## 3. Build

Status: not started

## 4. Explore

Status: not started

## 5. Profile

Status: not started

## 6. Play

Status: not started

## 7. Connect

Status: not started

## 8. Colleges

Status: not started

## 9. Resume Builder

Status: not started
