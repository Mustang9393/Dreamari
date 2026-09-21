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

Status: **in progress**

| Component / state | Status | Notes |
|---|---|---|
| Grid: `DECK` has fewer than 6 careers | **Done, 22 Sept** | See below. |
| GridCard: zero careers in `DECK` | Not started | |
| GridCard: very long career title | Not started | |
| GridCard: picks fail to save (`writePicks` throws) | Not started | |
| DetailModal: missing/failed cover image | Not started | |
| DetailModal: empty "What You'd Do" / "Good Fit If" content | Not started | |
| Splash: zero careers matched at all | Not started | |

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
