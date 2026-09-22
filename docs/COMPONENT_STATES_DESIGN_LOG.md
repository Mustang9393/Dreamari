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

Status: **Done** -- all 6 known states designed and verified live.

| Component / state | Status | Notes |
|---|---|---|
| Grid: `DECK` has fewer than 6 careers | **Done, 22 Sept** | Placeholder tiles. |
| Grid: `DECK` has zero careers | **Done, 22 Sept** | Whole-route empty state. |
| GridCard / DetailModal: very long career title | **Done, 22 Sept** | line-clamp-3, defensive. |
| DetailModal: empty "What You'd Do" / "Good Fit If" / "School & Path" | **Done, 22 Sept** | "Details coming soon." fallback. |
| GridCard: picks fail to save (`writePicks` throws) | **Verified, already handled** | See below -- no change needed. |
| DetailModal / GridCard: missing/failed cover image | **Done, 22 Sept** | New shared `CareerPhoto`, see below. |
| Splash: zero careers matched at all | Superseded | Covered by the grid's own empty state; splash copy unchanged since it's shown before the count is known. |

### DetailModal / GridCard: missing or failed cover image -- Done, 22 Sept 2026

**Why this matters**: `career.photo` was rendered with a bare `next/image`
in both the grid card and the detail modal's hero, with no `onError`
handler -- `next/image` has no built-in fallback, so a 404'd or missing
photo used to leave a blank box (grid, since the card's own dark gradient
sits behind it) or the browser's raw broken-image glyph (modal, on a plain
white-ish box). Neither read as an intentional state.

**Design**: new shared `CareerPhoto` component wrapping both call sites --
tracks load failure in local state, and on failure renders a world-tinted
gradient (`career.color` mixed into `--color-night-card`, fading to
`--color-night-background`) with a centered, muted `ImageOff` icon --
same "nothing here yet" visual family as `PlaceholderMatchCard`, not a
broken-page look.

**Verified live**: temporarily pointed the first `DECK` entry's `photo` at
a nonexistent path, confirmed the gradient + `ImageOff` fallback rendered
correctly in both the grid card (inspected via DOM query -- the fallback
div and `lucide-image-off` svg were present, using
`var(--color-world-business-money-office)` as its tint) and the open
detail modal (screenshotted). Reverted the test path (`git diff` clean on
`data.ts`), re-verified the real 6-item deck renders all real photos with
no regression. `npx tsc --noEmit -p .` and `npx eslint` clean.

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

Status: **Done** -- every tracked item designed and verified live.

| Component / state | Status | Notes |
|---|---|---|
| A tab with no data for it renders nothing (dead gap before "Careers like this one") | **Done, 22 Sept** | `TabComingSoon`, all 5 tabs. |
| Quick-facts strip with exactly 1 fact leaves a dead empty grid column | **Done, 22 Sept** | grid-cols-1 for the 1-fact case. |
| `DotList` bullet with a blank/whitespace-only item in an otherwise-real array | **Done, 22 Sept** | Filtered; shared with College Detail. |
| `DotList` where EVERY item in the array is blank | **Done, 22 Sept** | "Not written up yet." fallback. |
| `Rung` (career ladder) with some fields missing (pay, description, sub-lists) | **Verified, already handled** | Every field independently optional-checked; no change needed. |
| `PayRows` / Pay tab with a partial `payByState` (missing `yourStates` but has `best`, or vice versa) | **Done, 22 Sept** | See below -- `best` empty now falls back to text instead of a dead list. |
| Missing/failed cover photo | **Done, 22 Sept** | New `HeroPhoto`, see below. |
| Structural order (facts vs. tabs) | **Investigated, kept as-is** | See below -- a real reversal was requested, then reverted same session after confirming the original order was a deliberate 15 Sept decision, not a mistake. |

### `PayRows` / partial `payByState` -- Done, 22 Sept 2026

**Why this matters**: `payByState.yourStates` was already guarded (only
rendered, with a heading, when non-empty), but `payByState.best` was
rendered unconditionally through `PayRows`, which mapped over `rows` with
no empty check. A `payByState` object that exists (so the tab doesn't fall
back to `TabComingSoon`) but whose `best` array is empty used to render
either a bare "Best states" heading over nothing, or -- with `yourStates`
also absent -- a "Pay by state" section with its Your-states/Whole-country
toggle and no content underneath at all. The "Whole country" map view
(`PayMap.tsx`) was already fully defensive (falls back to the career's
`typical` pay with a deterministic per-state spread when it has no real
figures), so this only affected the list view.

**Design**: `PayRows` now checks `rows.length === 0` first and renders
"Pay data coming soon." (italic, muted) instead of an empty `<ul>` --
matching this app's established "coming soon" convention for unauthored
content, same as `DotList`'s own blank-array fallback one section over.

**Verified live**: temporarily emptied Asset Manager's `payByState.best`
array, confirmed "Your states" still shows its one real row (South Dakota,
$118K) and "Best states" now shows the fallback text instead of a blank
list (screenshotted). Reverted (`git diff` clean), re-verified the real
data renders all three "best" states with no regression. `tsc`/`eslint`
clean.

### Missing / failed cover photo -- Done, 22 Sept 2026

**Why this matters**: the header photo (`career.photo`, resolved from
profile/catalog/reel data by `resolveCareer()`) had no `onError` handling,
unlike Match's grid this header already sits on a solid dark base
(`#0e0c20`) with its own gradient/blur scrims as separate sibling
elements, so a failed photo didn't need a new placeholder graphic -- it
just needed to stop trying to paint a broken image on top of an
already-complete backdrop.

**Design**: new local `HeroPhoto` component wrapping both the mobile and
desktop `<Image>` calls -- tracks load failure in state, renders `null` on
failure. The existing dark base, gradient scrims, and title (which never
depended on the photo) carry the header exactly as designed either way.

**Verified live**: temporarily pointed Financial Advisor's `photo` at a
nonexistent path, confirmed the header renders as a clean dark card with
title and no broken-image glyph (screenshotted). Reverted (`git diff`
clean), re-verified the real photo renders with no regression.
`tsc`/`eslint` clean.

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

## 3. Build (`src/components/build/`, `src/components/flow/`)

Status: **Done** -- the real state/edge-case gaps in this area, found via a
full audit of the step flow, its shared UI shell, and everything they
import. Build has **zero async/fetch actions** (`persistAnswers` /
`writeStudentProfile` are synchronous localStorage writes already wrapped
in try/catch, `src/lib/studentProfile.ts:110-119`), so there was no
missing `Working`-chip gap to close here, unlike Match/Career Detail.

| Component / state | Status | Notes |
|---|---|---|
| `EducationStep`'s icon lookup can throw and blank the step | **Done, 22 Sept** | Bounds-checked with a fallback icon. |
| Every Dreamy sprite (Welcome, QuestionHeading, Milestone, Completion) has no failed-load handling | **Done, 22 Sept** | New `DreamySprite` / `QuestionSprite`, see below. |

### `EducationStep`'s positional icon array -- Done, 22 Sept 2026

**Why this matters**: `EDUCATION_ICONS` (`steps.tsx`) is a plain 5-item
array indexed positionally against `EDUCATION_OPTIONS` (`types.ts`), with
no bounds check -- unlike this same file's other per-option lookups
(`SUBJECT_ICONS`, `WORLD_ACCENTS`), which are keyed with a `?? fallback`.
`EDUCATION_OPTIONS`'s wording has already changed more than once in this
file's own git history without the icon array being touched. An option
added or reordered without a matching icon entry throws "Element type is
invalid" at render -- and per `COMPONENT_STATES_PLAYBOOK.md`'s own "no
error boundary" gap, that blanks the whole step with no recovery, not a
graceful degradation.

**Design**: `EDUCATION_ICONS[optionIndex] ?? FALLBACK_EDUCATION_ICON`
(Sparkles, already the array's own last icon) -- a one-line defensive
guard, not a redesign.

**Verified live**: stepped through Build to the Education step; all 5
real icons (Rocket, Wrench, GraduationCap, BookOpen, Sparkles) render
exactly as before. `tsc`/`eslint` clean.

### Dreamy sprite failure handling -- Done, 22 Sept 2026

**Why this matters**: every Dreamy sprite across Build (`WelcomeScreen`'s
hero, `QuestionHeading`'s per-step icon, Milestone's and Completion's
celebration art) rendered with no `onError` handling -- all bundled static
assets, not per-record data like Match/Career's photos, so the real-world
risk is lower, but it's the broadest surface area of any missing-image gap
in the app since it repeats on every single Build screen.

**Design**: two new shared pieces in `ui.tsx` -- `DreamySprite` (the
`fill`-based case: Welcome's hero, Milestone/Completion's celebration art)
and `QuestionSprite` (`QuestionHeading`'s own small, plain-`<img>`,
src-keyed sprite, kept separate since it needs to remount per reaction
swap rather than use `fill`). Both fall back to `DreamyFallback` -- a
brand-blue-tinted circle with a centered Sparkles glyph, the same
"nothing here yet" visual family as Match/Career's photo fallbacks --
instead of a broken-image glyph on a screen that's supposed to feel alive.

**Verified live**: stepped through Welcome -> Interests (confirms
`QuestionSprite`) -> ... -> Milestone -> Education, screenshotting each;
all four real sprites render unchanged. Temporarily broke Welcome's own
sprite path, confirmed `DreamyFallback` renders cleanly in its place
(screenshotted), reverted (`git diff` clean). `tsc`/`eslint` clean (one
pre-existing `no-img-element` warning on the relocated `<img>`, not a
regression).

### Found during the audit, deliberately NOT fixed here (flagged, not state/edge-case work)

Three more real issues turned up while auditing Build -- logged here for
visibility since they're genuine bugs, but out of scope for this pass:
they're data-correctness/product-behavior bugs, not empty/loading/error/
edge-case *rendering* gaps, and two of them (Skip's data loss, a possible
behavior change) are product calls, not unilateral fixes to make mid-sweep.

- **`persistAnswers` can overwrite a real stored email/path with blank.**
  `BuildFlowExperience.tsx:53-65` merges `state.email`/`state.path` into
  the shared student-profile store on every Build completion, but neither
  is ever set anywhere in Build (`email` is deliberately not asked per
  `steps.tsx`'s own comment; `path` has no step or `patch()` call at all)
  -- so both are permanently blank in `INITIAL_BUILD_STATE` and every
  completion silently blanks whatever was really stored. Highest-impact of
  the three: hits every real user, silently, no error surfaced.
- **`CostStep.tsx:126-135` hand-duplicates `COST_STOPS`'s 6 labels** in a
  second array instead of deriving from the one in `types.ts` (whose own
  comment already flags it's been edited before) -- any future add/
  remove/reorder desyncs the two.
- **Skip discards in-progress answers with no confirmation**, for every
  real user, not just demos -- `BuildFlowExperience.tsx:100` passes
  `onSkip` unconditionally despite the code's own comment calling it
  demo-only chrome.

## 4. Explore (`src/components/app/ExploreExperience.tsx`, `PosterCard.tsx`)

Status: **Done** -- the real gaps found via a full audit, same rigor as
Match/Career Detail/Build. Note the actual file is
`src/components/app/ExploreExperience.tsx`; `src/components/marketing/
chapters/Explore.tsx` is a separate, static landing-page teaser with
hardcoded data, not in scope here.

| Component / state | Status | Notes |
|---|---|---|
| `PosterCard`/`RankedPosterCard`: missing/failed cover photo | **Done, 22 Sept** | New shared `PosterPhoto`, see below -- fixes this app-wide (7+ importers), not just Explore. |
| World filter with 1-2 results leaves dead grid tracks | **Done, 22 Sept** | `auto-fill` -> `auto-fit`, see below. |
| Trending rail's rank badges desync from the Sort control | **Done, 22 Sept** | Trending no longer takes the sort, see below. |
| `EnvCard`'s description/mainSkills can overflow a fixed-height card | **Done, 22 Sept** | `line-clamp-2` on both. |

### `PosterCard` / `RankedPosterCard`: missing or failed cover photo -- Done, 22 Sept 2026

**Why this matters**: neither card had `onError` handling on its
`next/image` -- and unlike Match/Career Detail's photo fixes, which only
touched their own single file, `PosterCard` is imported by **7 other
files** (`CareerDetailExperience.tsx`, `HomeExperience.tsx`,
`ExploreExperience.tsx`, `colleges/shared.tsx`, `motion-lab/
DailyDropDemo.tsx`, `MatchGrid.tsx`, `ReportChooser.tsx`, `PlayHub.tsx`),
so a bad photo asset broke silently across every rail, world grid, and
search result app-wide, not just one screen.

**Design**: new shared `PosterPhoto` in `PosterCard.tsx` -- same
world-tinted-gradient-plus-muted-`ImageOff` pattern as Match's
`CareerPhoto` and Career Detail's `HeroPhoto`, using `WORLD_COLORS`
(already imported here) for the tint. Required promoting `PosterCard.tsx`
to a Client Component (`"use client"`) to hold the failure state -- safe,
since every current importer already renders inside a client tree.

**Verified live**: temporarily broke the Trending rail's #1 card
(Software Engineer) photo path, confirmed the DOM shows the gradient +
`ImageOff` fallback in place of a broken image (inspected directly).
Reverted (`git diff` clean), re-verified the real trending rail renders
normally. `tsc`/`eslint` clean.

### World filter with 1-2 results: dead grid tracks -- Done, 22 Sept 2026

**Why this matters**: `SearchResults`'s grid (shared by both real search
and world-filter views) uses `grid-cols-[repeat(auto-fill,minmax(...,1fr))]`
-- `auto-fill` reserves a full row of equal-width tracks even when the
grid has almost nothing to put in them. Three worlds hit this for real:
Food & Cooking and Teaching & Education have exactly 1 career each,
Science & Research has 2 -- all three directly reachable from the visible
filter pill row, not a contrived edge case.

**Design**: `auto-fill` -> `auto-fit`. This is the standard CSS fix for
exactly this failure mode (collapses tracks with no content instead of
reserving their width) and, in this specific grid, it's also consistent
with the row's own already-stated design intent ("a grid that fills the
width... cards stretching to share the row" -- 19 Sept 2026 feedback):
a 1-result row now correctly stretches that one card to fill the row,
the same behavior already applied to a partially-filled last row of a
larger result set.

**Verified live**: Food & Cooking filter (1 result) now renders one
card stretched edge-to-edge at both narrow and 1100px-wide viewports, no
dead tracks (screenshotted both). Multi-item rails/grids re-checked
unaffected. `tsc`/`eslint` clean.

### Trending rail: rank badges desync from the Sort control -- Done, 22 Sept 2026

**Why this matters**: the Trending rail's cards were piped through the
same `view()` helper as every other rail, which applies the page's
Sort control (A-Z / Salary). But Trending's whole point is
`BROWSE_TRENDING`'s own curated order, shown with #1-#5 rank badges under
a "Top 5 Trending" heading -- switching Sort re-ordered the cards while
the heading and badges kept claiming "#1 trending" for whatever the sort
happened to put first. A real, one-tap-away semantic bug, not theoretical.

**Design**: Trending now calls `applyCatalogView(BROWSE_TRENDING,
effectiveWorld, "", "Recommended")` directly -- the world filter still
applies (trending within a world is a reasonable question), but sort
never does, since the rank badges are the entire premise of the rail.

**Verified live**: captured Trending's order (Software Engineer,
Emergency Medicine Doctor, Nurse Anesthetist, Lawyer, Airline Pilot,
Therapist), switched Sort to A-Z, confirmed Trending's order was
byte-identical while a different rail ("Careers You Might Not Know")
correctly re-sorted alphabetically in the same view. `tsc`/`eslint` clean.

### `EnvCard` description/mainSkills overflow -- Done, 22 Sept 2026

**Why this matters**: `EnvCard`'s root `<article>` is `h-full` +
`overflow-hidden` (a fixed-footprint reel card, no scroll), but its
description `<p>` and "Main Skills" value `<span>` had no cap -- a longer
future string can grow the stacked, bottom-anchored content past the
card's own bounds, clipping something else in it.

**Design**: `line-clamp-2` on both, matching this app's own established
truncation convention rather than a bespoke treatment.

**Verified**: `tsc`/`eslint` clean; not screenshotted with a forced
long string since no current real record is long enough to trigger it --
same call as Match's `BulletList` empty-fallback earlier, a one-line
defensive cap already covered by the same pattern used elsewhere.

### Found during the audit, deliberately NOT fixed here (lower priority / consistency-only)

- `CompanyVideoCards.tsx`'s `<video>` elements have no `onError` fallback
  either (a silent black box if a clip 404s) -- same gap class as the
  photo fixes above, lower traffic than the poster rails. Flag if it
  becomes real.
- `COMPANY_VIDEOS` rail renders unconditionally with no `.length > 0`
  guard, unlike every other rail in `BrowseFace` -- currently safe (the
  array is static and non-empty), just inconsistent with the rest of the
  file's pattern. Not a live bug.
- Explore's own "no results" copy (`ExploreExperience.tsx`) and
  `GlobalSearch.tsx`'s "no results" copy have diverged wording for what's
  functionally the same moment. A copy-consistency nit, not a functional
  gap -- left alone rather than unifying voice without being asked.

## 5. Profile (`src/components/profile/ProfileExperience.tsx`)

Status: **Done** -- the real gaps found via a full audit, same rigor as
the areas before it.

| Component / state | Status | Notes |
|---|---|---|
| Unvalidated `?picks=` URL ids can crash the whole page | **Done, 22 Sept** | No error boundary anywhere in the app -- see below. |
| `OverviewTabV2` renders blank for a zero-Top3 student | **Done, 22 Sept** | Shared `NothingSavedYet` with v1, see below. |
| Top3 grid leaves dead space with 1-2 picks | **Done, 22 Sept** | Column count now matches the real count. |
| Top3/Locker/Add-sheet career photos: missing/failed | **Done, 22 Sept** | New `ProfilePhoto`, distinct from the app-wide `PosterCard` fix -- `PosterCard` isn't imported here. |
| Student's own avatar: missing/failed | **Done, 22 Sept** | New `StudentAvatarImage`, keyed by src. |

### Unvalidated `?picks=` URL ids can crash the whole page -- Done, 22 Sept 2026

**Why this matters**: `base`'s `fromHandoff` branch trusted
`initialPicks`/`initialFocus` (straight from the `?picks=`/`?focus=` URL
params -- `parsePicksParam` only trims/dedupes/caps at 3, never checks
against the real catalog) completely unfiltered, while the `stored.ids`
branch two lines below it already validates every id against
`ALL_PROFILE_CAREERS`. Several call sites downstream read a Top3 id with a
non-null assertion (`careerById(id)!`) -- a stale bookmark, a renamed or
removed career, or a hand-edited share URL puts an unresolvable id there,
the `!` lies to TypeScript, and the resulting `null.title` read throws.
Per the playbook, there's no error boundary anywhere in this app, so that
blanks the entire page, not just one section -- the single highest-
likelihood real-user path found across any area audited so far.

**Design**: the handoff branch now filters `initialPicks` against
`ALL_PROFILE_CAREERS` the same way the stored branch already does, and
falls through to the student's own real saved picks (then the demo
default) if every handed-off id turned out to be bad, rather than hard-
failing on a corrupted link.

**Verified live**: `/profile?picks=totally-bogus-career-id-xyz` loads
normally (screenshotted) -- no crash, no blank page, falls through
cleanly to the real stored Top3. Console showed only the known,
already-investigated 400/404 telemetry noise, no React errors.
`tsc`/`eslint` clean.

### `OverviewTabV2` blank for a zero-Top3 student -- Done, 22 Sept 2026

**Why this matters**: `OverviewTabV2` (`overviewVersion` toggle, an
always-visible real control, not demo-gated) just `return null`ed when
`focus` was null -- the identical condition v1's `OverviewTab` already had
a full "Nothing saved yet" empty state for. Reachable by any real student
who removes all 3 Top3 picks in one sitting while on v2, not a contrived
case.

**Design**: extracted v1's existing empty-state block into a shared
`NothingSavedYet({ onGoLocker })`, used by both versions -- no new design,
just closing the gap where v2 skipped it. Required adding `onGoLocker` to
`OverviewTabV2`'s own props (v2 didn't need it before since it never had
an empty state to link out from).

**Verified live**: switched to v2, removed both of the demo student's Top3
picks through the real UI (the "More options" menu -> "Remove from Top
3" -> confirm, for each), confirmed Overview now shows "Nothing saved
yet" with working "Browse careers"/"Open Saved" CTAs instead of a blank
tab body (screenshotted). Storage self-healed back to the demo default on
reload, as designed -- no manual cleanup needed. `tsc`/`eslint` clean.

### Top3 grid: dead space with 1-2 picks -- Done, 22 Sept 2026

**Why this matters**: Top3 has a maximum of 3 but no minimum, yet the
grid was a fixed `md:grid-cols-3` -- a student with only 1 or 2 saved
picks got a lopsided row with an obviously empty column. Same dead-space-
grid bug class already fixed for Match's deck and Career Detail's facts
strip.

**Design**: column count now matches the real count
(`top3.length === 1/2/else` -> `md:grid-cols-1/2/3`), literal Tailwind
classes per the ternary (not an interpolated class string, which
Tailwind's scanner won't pick up).

**Verified live**: the demo student's real 2-pick state renders as a
clean 2-column grid, no dead third column (screenshotted at 1000px
width). `tsc`/`eslint` clean.

### Career photo failures: Top3, Locker, Add-to-Top3 sheet -- Done, 22 Sept 2026

**Why this matters**: distinct from Explore's app-wide `PosterCard` /
`PosterPhoto` fix (22 Sept, earlier the same day) -- `PosterCard` is never
actually imported into `ProfileExperience.tsx`, so that fix didn't reach
here. Three raw `next/image` calls (Top3's card hero, the Add-to-Top3
sheet's 38px thumbnail, Locker's poster grid) had no `onError` handling.

**Design**: new shared `ProfilePhoto` (same world-tinted-gradient +
muted-`ImageOff` pattern as `PosterPhoto`/`CareerPhoto`/`HeroPhoto`
elsewhere this session, using this file's own `WORLD_COLORS` import).

**Verified live**: temporarily broke the Investment Banking pick's photo
path, confirmed the Top3 card shows the gradient + `ImageOff` fallback
while the other real card (Airline Pilot) renders normally
(screenshotted, side by side). Reverted (`git diff` clean). `tsc`/`eslint`
clean.

### Student avatar failure -- Done, 22 Sept 2026

**Why this matters**: `avatarSrc` (`src/lib/avatar.ts`) can be a
student-picked override persisted in `localStorage`
(`writeAvatarOverride`) with no check that the file still exists -- shown
on every single Profile visit (the header), not a photo a student might
never scroll to.

**Design**: new `StudentAvatarImage`, keyed by `src` (same remount-on-key
idiom as Build's `QuestionSprite` -- avoids a `setState`-in-effect lint
error from trying to reset failure state on prop change) -- falls back to
a generic `UserRound` glyph on a soft brand-tinted circle instead of a
broken-image icon on the student's own identity.

**Verified**: real avatar renders correctly on every page load this
session; not forced-broken separately since the underlying `onError`
mechanism is identical to and already verified via `ProfilePhoto`/
`CareerPhoto` above. `tsc`/`eslint` clean.

### Found during the audit, deliberately NOT fixed here (lower priority)

- `VideosShelf`/`SchoolsShelf` poster images (Locker's saved-videos and
  saved-schools grids) have the same missing-`onError` gap, lower traffic
  than Top3/Locker's own career photos. Flag if it becomes real.

## 6. Play (`src/components/play/PlayHub.tsx`, `src/components/glossary/GlossaryGameExperience.tsx`)

Status: **Done** -- the real gaps found via a full audit.

| Component / state | Status | Notes |
|---|---|---|
| RowCard/HeroShelfCard: missing/failed cover image | **Done, 22 Sept** | New shared `CoverPhoto` -- `PosterCard`'s app-wide fix doesn't reach here, Play has its own bespoke cards. |
| Glossary Complete screen: `NaN%` mastery on a zero-term lesson | **Done, 22 Sept** | Zero-guard. |
| Glossary: a zero-question lesson gets permanently stuck | **Done, 22 Sept** | Skips to Power Play instead. |
| `DreamyFace`: missing/failed image, used on 9 screens | **Done, 22 Sept** | Same class as Build's `DreamySprite`, ported here. |
| `TermIcon` positional/keyed lookup | **Verified, already handled** | Already `?? Sparkles`, no gap. |
| Locked/coming-soon card treatment | **Verified, already handled** | Consistent `locked` + `CornerBadge` everywhere. |

### RowCard/HeroShelfCard: missing or failed cover image -- Done, 22 Sept 2026

**Why this matters**: confirmed `PlayHub.tsx` never imports `PosterCard`
-- it has its own bespoke card components (`RowCard`, `HeroShelfCard`), so
Explore's app-wide `PosterPhoto` fix doesn't reach Play at all. Hits
every card on the hub: Career Simulations, Glossary Games, "In the
works." `HeroShelfCard` already had a fallback for a *missing* `cover`
(`BookOpen` on a tinted circle) but not one that's present and 404s;
`RowCard` had no fallback at all.

**Design**: new shared `CoverPhoto`, reusing `HeroShelfCard`'s own
existing no-cover visual for a failed one too (rather than introducing a
second "missing image" look on the same page) -- `BookOpen` on a
world-tinted circle (`WORLD_COLORS[world]`, falling back to
`--glossary-accent` when no world is known, same as the original).

**Verified live**: temporarily broke Investment Banker's cover path,
confirmed the hero card shows the `BookOpen` fallback in place of a
broken image (screenshotted). Reverted (`git diff` clean), real covers
confirmed unaffected. `tsc`/`eslint` clean.

### Glossary Complete screen: `NaN%` mastery -- Done, 22 Sept 2026

**Why this matters**: `masteryPct = Math.round((masteredCount /
lesson.terms.length) * 100)` divides by zero for any lesson authored with
no terms -- and lessons are added incrementally per this feature's own
`data.ts`, so an in-progress one reaching this screen isn't theoretical.
Would render the literal string "NaN%" on the celebratory finish screen.

**Design**: one-line zero-guard -- 0 terms reads as 0% mastered, not NaN.

### Glossary: a zero-question lesson gets permanently stuck -- Done, 22 Sept 2026

**Why this matters**: once every term was unlocked, `UnlockCompleteScreen`
always sent the student to the "question" screen. If `lesson.questions`
is empty, `current` (`queue[queueIndex]`) is `undefined`, so the
`screen === "question" && current && (...)` guard renders nothing --  not
a crash, a permanently blank main area with no button and no way forward,
since only `QuestionScreen`/`FeedbackPanel` (which never mount) can
advance the game.

**Design**: `onStartPractice` now checks `queue.length` and skips straight
to `powerPlayIntro` when there's nothing to practice, the same way the
"unlock" branch already skips ahead once every term is unlocked.

### `DreamyFace`: missing or failed image -- Done, 22 Sept 2026

**Why this matters**: same gap class as Build's already-fixed
`DreamySprite`/`QuestionSprite` (a bundled static asset, lower real risk
than a per-record photo) -- but `DreamyFace` is the single most-repeated
unguarded image in Play, rendered on 9 different screens (Intro,
DreamyIntro, LessonIntro, Unlock, FeedbackPanel, StreakModal,
PowerPlayIntro, MasteryLoading, Complete).

**Design**: already keyed by `pose` (remounts cleanly on a pose change,
same idiom as `QuestionSprite`) -- added local failed-state, falling back
to a brand-tinted circle with a muted Sparkles glyph at the same size.

**Verified live**: real Dreamy face confirmed rendering normally on the
Investment Banking lesson's intro screen after the change; not
force-broken separately since the mechanism is identical to and already
verified via `CoverPhoto` above. `tsc`/`eslint` clean.

## 7. Connect (`src/components/connect/`)

Status: **Done** -- the real gaps found via a full audit.

| Component / state | Status | Notes |
|---|---|---|
| Unvalidated id-driven views (`?pro=`, `?board=`, `?insight=`, `?event=`, `?thread=`) render a genuinely empty page, no way back | **Done, 22 Sept** | New `ConnectNotFound`, see below. |
| Shared `Avatar` primitive: missing/failed photo | **Done, 22 Sept** | New `AvatarImage` -- ProBadge, CommentRow, every pro headshot. |
| `InsightThreadView` missing a "no comments yet" state | **Done, 22 Sept** | Ported from `ThreadView`'s existing pattern. |
| `ProfileHeaderCard` cover photo: missing/failed | **Done, 22 Sept** | New `CoverImage`, same class as Career Detail's `HeroPhoto`. |
| `CommunityCard`/`CompactCommunityRow`: missing/failed cover | **Done, 22 Sept** | New `CommunityCover`/`CommunityThumb`. |
| `PeopleTab`'s search/filter grid: dead space with 1-2 results | **Done, 22 Sept** | Column count now matches the real count. |

### Unvalidated id-driven views: a genuine dead end -- Done, 22 Sept 2026

**Why this matters**: `queryToView` builds a `View` straight from
`?pro=`/`?board=`/`?insight=`/`?event=`/`?thread=` URL params with no
validation, and every render site resolved its id with a plain
`if (!x) return null;`. Doesn't crash (unlike Profile's old `?picks=`
bug), but the header's own back-nav is itself gated on
`view.kind === "home" || role !== "student"` -- false for a student on a
bad view -- so a stale bookmark, a renamed/removed pro or community, or a
hand-edited share link rendered a completely empty `<main>`: no message,
no back button, nothing. Worse than the playbook's own "dense panel, one
muted line" tier, since there wasn't even a line.

**Design**: new `ConnectNotFound({ onBack, backLabel })` -- tier-4
treatment (nothing to build the page around, same family as every other
whole-route empty state this session), with the one thing these views
actually need that the others don't: a real way back, since the header's
own back button isn't present for this state. Swapped in at all 5
`return null;` sites (pro, board/community, insight, event, thread).
`ProDashboardView` was checked separately and already falls back
gracefully (`given ?? PROS.find("pro-okafor") ?? PROS[0]`) -- no change
needed there.

**Verified live**: `/connect?pro=totally-bogus-pro-id` and
`/connect?board=totally-bogus-board-id` both render "We couldn't find
that" with a working "Back to Connect" button instead of a blank page
(screenshotted); clicking it correctly returns to the Communities home.

### Shared `Avatar` primitive: missing or failed photo -- Done, 22 Sept 2026

**Why this matters**: `Avatar` (`primitives.tsx`) is the single most-
reused image in Connect -- `ProBadge`, `CommentRow`, every pro headshot
including `ProProfile`'s own hero all go through it. Neither branch (a
pro's real portrait or a generated student avatar) had `onError`
handling.

**Design**: new `AvatarImage`, keyed by the resolved src (same
remount-on-key idiom as Build's `QuestionSprite`/Profile's
`StudentAvatarImage`) -- falls back to a generic `UserRound` glyph on a
muted circle.

**Verified live**: Trevor Johnson's profile (headshot + `ProBadge`
instances throughout the People grid) all render correctly post-change.

### `InsightThreadView`: missing "no comments yet" -- Done, 22 Sept 2026

**Why this matters**: `ThreadView` already has this exact fallback ("No
answer yet.", a `Card`) for its own zero-response case -- the sibling
Insight page went straight from the "Comments (0)" heading to the reply
composer with nothing in between when an insight has no comments yet,
missing the same treatment its sibling already established.

**Design**: ported the identical pattern ("No comments yet." / "Be the
first to weigh in."), gated on `insight.replies.length + posted.length
=== 0`.

### `ProfileHeaderCard` / `CommunityCard` cover photos -- Done, 22 Sept 2026

**Why this matters**: `ProfileHeaderCard`'s cover is the full-bleed hero
of every pro's profile page; `CommunityCard`'s cover is the primary
Connect landing grid, every community tile. Neither had `onError`
handling.

**Design**: both sit on a solid dark base (`#0e0c20`) with their own
gradient scrim as a separate sibling element -- same structural case as
Career Detail's `HeroPhoto`, so both new components (`CoverImage`,
`CommunityCover`) simply render `null` on failure rather than needing a
new placeholder graphic. `CompactCommunityRow`'s small 52px thumbnail has
no such backdrop to fall back on, so it gets a real placeholder instead
(`CommunityThumb`, world-tinted `ImageOff`).

**Verified live**: real covers and thumbnails confirmed rendering
correctly across the Communities grid and Trevor Johnson's profile after
the change.

### `PeopleTab` grid: dead space with 1-2 results -- Done, 22 Sept 2026

**Why this matters**: `Grid`'s fixed `sm:grid-cols-2 lg:grid-cols-3`
against 40 total `PROS` across many worlds/companies means a niche
company or career search plausibly returns 1-2 results, leaving a
lopsided row -- same dead-space-grid class already fixed 4x this session
(`FollowCarousel`, a few lines above this same file, was already fixed
for it; `Grid` itself was missed).

**Design**: column count now matches the real result count, same literal-
ternary approach as Profile's Top3 grid fix.

### Found during the audit, deliberately NOT fixed here (lower priority)

- Several more `Image` call sites with the same missing-`onError` gap
  (`CommunityCard`'s `brandMark` logo, scattered covers in
  `ConnectExperience.tsx` and `MentorshipTab.tsx`) -- lower traffic/lower
  visual impact than the ones fixed above (a small partner logo, or
  covers reachable only a few clicks deep). Flag if they become real.
- `proById(reply.proId!)`-style assertions on app-authored data (not user
  input) -- lower risk than the URL-param case since this data doesn't
  change at runtime, left alone per "trust internal invariants."

## 8. Colleges (`src/components/colleges/`)

Status: **Done** -- the real gaps found via a full audit.

| Component / state | Status | Notes |
|---|---|---|
| `CollegePicture`/`CollegeCard`/`SchoolCard`/`MarkBadge`: missing/failed image | **Done, 22 Sept** | Failed load now falls through to each component's own existing no-image tier, see below. |
| Browse results grid: dead space with 1-2 results | **Done, 22 Sept** | Column count now matches the real count. |
| Unsaving the last college while "Saved" filter is active gets stuck | **Done, 22 Sept** | `savedOnly` is now a no-op once nothing is saved, see below. |
| Enrollment %: latent `NaN` risk (`fullTime + partTime === 0`) | **Done, 22 Sept** | Zero-guard, same class as Play's `masteryPct`. |
| `DotList` (admissions-factor lists) | **Verified, already handled** | Imported directly from Career Detail -- gets the blank-item fallback for free. |

### College images: missing or failed load -- Done, 22 Sept 2026

**Why this matters**: `shared.tsx` has its own bespoke image call sites
(does not reuse Explore's `PosterCard`/`PosterPhoto`, which is typed to
`CatalogCareer`) -- `CollegePicture`, `CollegeCard`'s cover,
`SchoolCard`'s cover (plus its own inner mark badge), and `MarkBadge`'s
logo, none tracking load failure. Every college card and the detail
page's hero go through one of these four. All 55 current colleges'
images physically exist today, so this was a pure defensive gap, not a
live bug -- but exactly the class already closed for every other feature
this session.

**Design**: each of these four already has a real "no image" fallback
tier (the school's mark, or a quiet color field, or an initial letter) --
a failed *load* now falls through to that same existing tier instead of
needing a new placeholder, treated identically to "no image was ever
provided."

**Verified live**: dispatched a synthetic `error` event on a real
rendered college cover (`the-college-of-new-jersey.webp`) and confirmed
via DOM inspection the broken `<img>` was replaced by the mark-tier
fallback, matching the design exactly.

### `savedOnly` filter stuck after unsaving the last college -- Done, 22 Sept 2026

**Why this matters**: `matches()` applied `f.savedOnly` unconditionally.
The "Saved" quick-pick chip only renders `if (saved.size)`, so unsaving
the last college while that filter was active made the chip (the only
control that turns it off) vanish while `filters.savedOnly` stayed `true`
in state -- every college then failed `saved.has(c.slug)` against an
empty set, and the zero-results panel's generic "take off a filter" copy
pointed at a filter with no visible control left. Recoverable only via
the unrelated "Start over" button -- a real, reachable, confusing dead
end, not a crash.

**Design**: `saved.size > 0` gates the filter in `matches()` -- once
there's nothing saved to filter by, `savedOnly` becomes a no-op, same as
every other empty-set filter in this file already behaves, rather than a
stuck filter for a set that no longer has anything in it.

**Verified live**: saved Princeton, applied the Saved filter (1 result),
unsaved it from the card while the filter was still active, confirmed
results correctly reverted to the full unfiltered list ("Schools with
Finance (8)") instead of staying stuck empty.

### Enrollment percentage: latent `NaN` -- Done, 22 Sept 2026

**Why this matters**: `Math.round((d.fullTime / (d.fullTime +
d.partTime)) * 100)` has no zero-guard -- same unguarded-arithmetic class
as Play's own `masteryPct` bug. No current college has both fields at 0,
so not reachable today, but undefended against any future data gap.

**Design**: one-line zero-guard on both the full-time and part-time rows,
rendering "—" instead of "NaN%".

## 9. Resume Builder (`src/components/resume/`)

Status: **Done** -- audited in full; genuinely in good shape already.

**This feature had state-handling as an explicit design goal from the
start**, confirmed by reading the code, not just the plan: `src/lib/
resume.ts` normalizes every field on read (no trust in stored/URL
shape); all three AI-backed routes (`resume-bullets`, `resume-tailor`,
`resume-ats-check`) have real, working template/heuristic fallbacks when
`ANTHROPIC_API_KEY` is absent (verified by reading the fallback code
paths, not just the comments); the two examples
`COMPONENT_STATES_PLAYBOOK.md`'s own quick-reference table already cites
as canonical good patterns (`ExperienceModal.tsx:260`,
`ATSCheckPanel.tsx:91`) plus the "ongoing check" retry pill
(`ResumeBuilderExperience.tsx:411`) are intact and consistent with every
other AI action's loading/error pattern elsewhere in the app; zero-
education/zero-experience/zero-saved-resume all have real, dedicated
empty-state UI (`ResumeExperience.tsx` "No resume yet", `wizardSteps.tsx`
`EmptyStateAdd`, `TailorScreen.tsx`'s explicit "on file yet" copy); Save
& Export is actually gated (`wizardSteps.tsx` `disabled={!complete}`) so
a resume can't be exported empty; the `.docx` exporter guards every
section with `.length > 0` and falls back to "Resume" for a blank name.
No images anywhere in this feature, so the app-wide image-`onError` gap
class doesn't apply here.

| Component / state | Status | Notes |
|---|---|---|
| `?version=` URL param: bad id silently drops into the wizard | **Done, 22 Sept** | See below. |
| AI action loading/error states (bullets, tailor, ATS check) | **Verified, already handled** | Matches this session's own established standard everywhere. |
| Zero education/experience/saved-resume states | **Verified, already handled** | Real, dedicated empty-state UI throughout. |
| `.docx` export with mostly-empty sections | **Verified, already handled** | Every section guarded, name falls back to "Resume". |

### `?version=` URL param: bad id silently drops into the wizard -- Done, 22 Sept 2026

**Why this matters**: `activeVersion` is read straight from the URL
(`?version=`) with no validation beyond a null-safe `.find() ?? null`. A
stale bookmark, a deleted resume, or a hand-edited link matching no saved
version fell through every `view === ...` branch (none of them match
`"version"` once `activeVersion` is null) and landed on the full
multi-step wizard at step 0 -- silently, with no message that the
requested resume wasn't found. Doesn't crash (unlike Profile's old
`?picks=` bug, since `activeVersion` was already null-safe), but the same
confusing-dead-end class already fixed this session in Profile and
Connect.

**Design**: routes back to the resume list (`ResumeExperience`, the
`view === "list"` shell) instead of inventing a new not-found screen --
this feature's own natural "nothing to show here" destination, which
already has real empty/populated states of its own.

**Verified live**: `/resume-builder?view=version&version=totally-bogus-id`
now lands on "Saved Resumes" showing its existing "No resume yet" empty
state, instead of silently opening the wizard (screenshotted). No console
errors beyond the known, already-investigated telemetry noise.
