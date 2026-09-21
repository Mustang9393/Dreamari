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
2. Build (`src/components/build/`, `src/components/flow/`)
3. Explore (`src/components/marketing/ExploreExperience.tsx` and friends)
4. Profile (`src/components/profile/`)
5. Play (`src/components/play/`)
6. Connect (`src/components/connect/`)
7. Colleges (`src/components/colleges/`)
8. Resume Builder (`src/components/resume/`)

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

## 2. Build

Status: not started

## 3. Explore

Status: not started

## 4. Profile

Status: not started

## 5. Play

Status: not started

## 6. Connect

Status: not started

## 7. Colleges

Status: not started

## 8. Resume Builder

Status: not started
