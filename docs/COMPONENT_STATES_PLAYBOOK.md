# Component states playbook: loading, empty, error, and edge cases

Every component eventually has to render with nothing, with only some data,
mid-fetch, or after a failure, not just the happy path. Today those states
are hand-built per feature with real drift between them (two different
"nothing saved yet" layouts, two different "Top 3 is full" treatments) and
some states (skeleton loaders, an error boundary, offline handling) don't
exist anywhere yet. This file exists so you never have to invent a state
from scratch or wait on a bespoke design for it: **when a screen needs an
empty, loading, error, or edge-case treatment and no locked spec says
otherwise, use the default in this file.** If a locked spec in
`docs/handoff/specs/` says something different for that screen, the spec
wins; this file is the fallback, not an override.

Flag anything you build from this file back to Chandu so it can go into the
design pipeline for a real pass later, per the standing agreement -- these
defaults are meant to be functionally and visually reasonable, not final.

Every pattern below is grounded in real, already-shipping code, not
invented. Where a `file:line` is given, that's the reference implementation
to copy, not just an example.

## Quick reference

| Situation | Default | Reference |
|---|---|---|
| An AI/fetch action is running | `Working` chip | `src/components/app/Working.tsx` |
| A button triggers a generate/analyze action | Swap its icon for a spinning `Loader2`, disable, change label to a present-participle phrase | `src/components/resume/ExperienceModal.tsx:260` |
| An AI/fetch action failed | Inline text below the control: "Couldn't [verb]. Try again[, or fallback]." | `src/components/resume/ATSCheckPanel.tsx:91` |
| An ongoing check (not a one-shot action) failed | Replace the `Working` chip with a quiet "X didn't finish · Retry" pill | `src/components/resume/ResumeBuilderExperience.tsx:411` |
| A whole tab/page has nothing yet | Solid-border block: heading + muted line + CTA button | `src/components/profile/ProfileExperience.tsx:1377` |
| One shelf/section within a page has nothing yet | Dashed-border block: one bold line + CTA link, smaller | `src/components/profile/ProfileExperience.tsx:2729` |
| A dense panel or sheet has nothing yet | Bare one line of muted text, no border, no CTA | `src/components/connect/ConnectExperience.tsx:2057` |
| A whole route has nothing to build the page around | Large heading + muted paragraph + primary button | `src/components/report/ReportChooser.tsx:146` |
| A search or filter returned nothing | One plain paragraph naming the query, no icon | `src/components/app/GlobalSearch.tsx:174` |
| Content exists but isn't authored yet | Literal `"Coming soon"` text in place of the value | `src/components/profile/ProfileExperience.tsx:1149` |
| A card represents something not built/unlocked yet | `locked` flag + `CornerBadge kind="lock"` + "Coming soon" | `src/components/play/PlayHub.tsx` (`CornerBadge`, ~699/918/938) |
| A max-count selection is full and swapping is supported | Modal listing current picks with per-item "Replace" | `src/components/career/Top3SwapModal.tsx` |
| A max-count selection is full and swapping isn't the flow | Relabel/disable the add button itself | `src/components/match-lab/MatchGrid.tsx:551` |
| A title/label might be long | `truncate` (one line) or `line-clamp-N` (multi-line); for card titles specifically, downshift font size + zero-width-space after hyphens | `src/components/app/PosterCard.tsx:59` |
| Singular vs. plural count text | Branch manually for now (`count === 1 ? "slot" : "slots"`) | `src/components/profile/ProfileExperience.tsx:988` |
| Offline / no network | Not handled anywhere yet -- see "Known gaps" | -- |
| A component throws / a render error | Not handled anywhere yet -- see "Known gaps" | -- |

## Loading states

**An AI or network action that takes a moment and isn't tied to one button**
(a document check, a generation step with its own status line) gets the
`Working` chip: `<Working label="Checking" />` -- a pill with a border-beam
ring, a spinning icon, a shimmering label, and three stepping dots. Pass the
verb only, the chip supplies its own ellipsis. `src/components/app/Working.tsx`.

**An action tied directly to one button** (Generate, Analyze, Check) doesn't
need the chip -- swap that button's own icon for a spinning `Loader2`,
disable the button, and change its label to a present-participle phrase
("Generating…", "Finding matches…") for the duration. Reference:
`src/components/resume/ExperienceModal.tsx:260`,
`src/components/resume/JobMatchPanel.tsx:128`.

**Skeleton loaders don't exist anywhere in this codebase yet.** Until one is
built, default to the `Working` chip centered in the space the content will
occupy, rather than a bare spinner or a blank area. A card/list-shaped
skeleton (shadcn's `Skeleton` primitive, which this app's token bridge
already supports) is the right long-term answer and worth building as a
shared component the first time a real one is needed -- flag it rather than
hand-rolling a one-off pulse div.

**Full-page loading screens don't exist either** (no route has a
`loading.tsx`, and the two `Suspense` boundaries in the app both use
`fallback={null}` purely to satisfy `useSearchParams`, not to show anything).
Until a real one exists, use the same `Working` chip centered in the page.

**One thing to NOT confuse for a loading state**: `dm-title-shimmer` is a
purely decorative heading treatment (a gradient sweep on static text), not
an in-progress indicator. Defined in `src/components/app/app.css:558`.

## Empty states

Pick the tier that matches how much of the screen is empty, not just
whichever pattern is closest at hand -- these three are visually distinct on
purpose so a student can tell "nothing here in this whole tab" from "nothing
in this one shelf" from "nothing in this list, but you're mid-flow."

1. **Whole tab or primary destination has nothing** (My Plan with no picks,
   Top 3 with nothing saved): solid border, generous padding
   (`rounded-lg border p-[space-6] text-center`), a bold heading, a muted
   line under it, and a real CTA button. `ProfileExperience.tsx:1377`
   (`Top3Tab`).
2. **One shelf or section inside an otherwise-populated page** (one of the
   Locker's four shelves): dashed border, one bold line, one CTA link,
   smaller footprint than tier 1. `ProfileExperience.tsx:2729`.
3. **A dense panel, sheet, or list mid-flow** (a Connect panel, a Match
   dense list): one line of plain muted text, no border, no icon, usually no
   CTA since the surrounding UI already implies the action. `ConnectExperience.tsx:2057`.
4. **A whole route with nothing to build the page around at all** (no Top 3
   chosen yet, so there's nothing to compare): the largest treatment --
   display-size heading, a muted paragraph, one primary button.
   `ReportChooser.tsx:146`, its local `EmptyState`.
5. **Search or filter returned nothing**: one plain paragraph naming what
   was searched, no icon, no illustration. `GlobalSearch.tsx:174`
   ("Nothing matches "{query}". Try a shorter word, a city, or a company.").
6. **Content that should exist but isn't authored yet** (a thin catalog
   career, an unauthored report section): don't let the section just
   disappear -- show the literal string `"Coming soon"` (or a one-line
   variant naming what's coming) in its place, so the screen reads as
   "not yet" rather than "broken." `ProfileExperience.tsx:1149`.

**Do not invent a fourth visual tier.** If a new screen's empty state
doesn't obviously map to one of the four above, treat it as tier 1 (whole
destination) or tier 3 (dense panel) depending on how much of the screen it
occupies, and flag it rather than designing a new one.

## Error and retry states

**Copy voice, codified**: "Couldn't [do the thing]. Try again[, or
{fallback}]." Every real error message in the app already follows this --
keep it exact, don't paraphrase per screen. Examples: "Couldn't match this
job. Try again in a moment." (`JobMatchPanel.tsx:134`), "Couldn't generate
bullets. Try again, or write your own." (`ExperienceModal.tsx:248`, note the
fallback clause when a manual path exists).

**Placement**: inline text directly under the control that failed, styled
`text-[12.5px] font-semibold` in the app's error token
(`var(--color-feedback-error, #ff6b6b)`). Not a toast, not a modal, for a
form-level or single-action failure.

**Exception**: an ongoing, header-level check (not a single button press)
replaces its own `Working` chip with a quiet retry pill instead of adding
text below it: `<AtsIcon/> Check didn't finish · Retry`.
`ResumeBuilderExperience.tsx:411`.

**Known gap: no error boundary exists.** `ErrorReporter.tsx` only wires
`window.onerror` to silent telemetry -- nothing renders when a component
actually throws, the screen just goes blank. Until a real
`ErrorBoundary` is built, this is a real risk area; if you're building
something with a meaningful chance of throwing (a new AI integration, a
data-shape assumption that might not hold for a sparse real record), wrap
the risky part in a defensive check with a plain "Something went wrong. Try
again." fallback rather than letting it throw unguarded, and flag it for a
real error boundary later.

**`Toast`/`UndoToast` exist but aren't wired for errors today** (only
success/confirmation and undo). Don't repurpose them for error copy without
checking first, since their visual language reads as positive.

## Edge cases

**Long text and titles.** Two identical hand-rolled implementations already
exist (`PosterCard.tsx:59`, `PlayHub.tsx:261`): a two-tier font-size
downshift when text doesn't fit in ~2 lines, plus a zero-width space
inserted after hyphens so compound words (e.g.
"INDUSTRIAL-ORGANIZATIONAL") wrap instead of clipping. For a new card-style
title, copy this idiom rather than just clamping. For body text and
single-line labels elsewhere, `truncate` (single line) or `line-clamp-N`
(multi-line) are already used ~130 times across the app and are the right
default for anything that isn't a card's own headline.

**Locked / not-yet-available cards.** `PlayHub.tsx`'s own pattern is the
reference: a `locked` boolean drives a `CornerBadge kind="lock"` plus
"Coming soon" text, shown as a small top-left pill on compact cards and
inline under the title on hero-sized cards. It's local to that one file
today despite applying cleanly to any card grid -- reuse the same visual
language (badge + "Coming soon", not a full dim/disable) rather than
inventing a new locked-card look, and flag it if it's worth promoting to a
shared component.

**A max-count selection is full.** Two valid treatments, scoped to
different situations, not a single winner:
- If swapping one selection for another is a real, expected action (Top 3),
  use the modal pattern: list the current picks, a "Replace" action on
  each, a cancel. `Top3SwapModal.tsx`.
- If the max is just a hard stop with no swap flow, relabel and disable the
  add control itself ("Your Top 3 is full") rather than opening a modal.
  `MatchGrid.tsx:551`.

**Singular vs. plural.** No shared helper exists yet; branch manually
(`count === 1 ? "slot" : "slots"`) as `ProfileExperience.tsx:988` does. If a
third or fourth spot needs this, it's worth a two-line `pluralize()` util
instead of a fourth manual branch.

## Known gaps (not solved by this file, flag before you need them)

- **No offline/no-network handling anywhere** -- no `navigator.onLine`
  check, no offline banner. If a feature genuinely needs one, flag it
  rather than building a one-off.
- **No error boundary.** See "Error and retry states" above.
- **No skeleton loader component.** See "Loading states" above.

## What's actually reusable today

Only three primitives in the app are genuinely shared (exported and used
across more than one feature) -- everything else described above is a
pattern to copy, not a component to import:

- `Working` (`src/components/app/Working.tsx`) -- `{ label, className? }`.
- `ConfirmShimmer` (`src/components/flow/ConfirmShimmer.tsx`) -- a one-shot
  "your choice registered" light-sweep overlay, `{ active }`, needs a
  `position: relative` parent.
- `Toast` / `UndoToast` (`src/components/app/Toast.tsx`,
  `src/components/app/UndoToast.tsx`) -- transient success/undo messaging,
  not currently wired for errors.

Anything named `EmptyState` elsewhere in the codebase (`ReportChooser.tsx`,
`wizardSteps.tsx`'s `EmptyStateAdd`) is locally scoped to that one file
despite the generic name -- don't import it expecting it to work elsewhere.

## If none of the above covers it

This prototype repo has no shadcn/Radix installed at all (`src/components/ui/`
is four hand-built files, none shadcn-generated) -- there is nothing to
"fall back to shadcn" here, every pattern above is this app's own Tailwind.
Shadcn only exists in **Usman's production app repo**, themed through the
existing token adapter (`docs/handoff/shadcn-adapter.css`,
`SHADCN-ADAPTER-PROPOSAL.md`). If a state genuinely isn't covered by
anything above (an admin/data-grid pattern this consumer product never
needed, for instance), shadcn's own primitives (`Alert`, `Skeleton`, `Empty`)
are an acceptable last resort there, but only run through that adapter first
-- unthemed shadcn defaults (default gray border, default radius, no
BorderBeam glow, no world-color accent) will look visibly foreign next to
the rest of the app the moment they ship. Check this playbook before
reaching for shadcn, not after.
