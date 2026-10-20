# WCAG 2.2 AA audit: dreamari.vercel.app

**Date:** 21 Oct 2026
**Build audited:** the live Vercel deploy, origin/main `74107143`
**Target:** WCAG 2.2 Level AA (https://www.w3.org/TR/WCAG22/)

## Verdict

**Dreamari does not meet WCAG 2.2 AA today.** It is not far off, though. The base is sound:

- Every route has `lang`, a title, landmarks and one H1.
- All images have alt text.
- Icon buttons have labels.
- There is a global `:focus-visible` ring.
- Pages reflow to 320px.
- Infinite CSS animations are behind `motion-safe`.
- Game music only starts after a click.
- The shared `Listbox` combobox is built correctly.

**What blocks a conformance claim:**

- **5 serious, fixable issues**, listed below. Most live in shared components, so one fix covers many screens.
- **A contrast cleanup** on a short list of colors.
- **Screen-reader testing**, which has not been done yet.

Three things should not be assumed:

- **Screen-reader testing.** No assistive-technology pass has been done yet (NVDA, JAWS, VoiceOver, ChromeVox). Districts will ask for it.
- **The formal claim.** An ACR/VPAT should wait for that pass and an outside validator, as the brief says.
- **Video speech.** I could not tell whether the company videos contain speech. If they do, captions are required.

## How this was tested

| Method | Coverage |
|---|---|
| axe-core 4.10 (WCAG 2.0/2.1/2.2 A+AA rules plus best practices), headless Chromium at 1366x768 | 30 routes: landing, gate, signup, flow, home, explore, career detail ×2, colleges + detail, opportunities + detail, connect, profile ×3 tabs, play hub, career sim, express sim, glossary game, resume builder, career report, leaderboard, counselor (home, students, insights, meetings, settings) |
| Pixel contrast check: text hidden, real background sampled from a screenshot, median ratio per text element | 25 routes, about 2,100 text elements. axe could not decide contrast on 2,000+ of these because the text sits on images or gradients, so this check fills that gap. |
| Keyboard walk: 35 Tabs per route, checking for a focus ring and whether the focused element is covered or offscreen | 30 routes |
| Reflow at 320px (equivalent to 400% zoom) and the text-spacing override (1.4.12) | 30 routes |
| Target size under 24x24 (2.5.8) | 30 routes |
| Source review of origin/main: dialogs, widgets, forms, motion, timing, media, live regions | `src/app` and `src/components`, excluding the internal labs |

**Out of scope (Chandu, 21 Oct 2026):**
- Labs (`*-lab`, `play-tools`, `component-lab`, `match-grid`).
- The PIN gate (`/gate`). It is private-demo protection, it stays, and it is not part of the product. Outside checkers that can't get past it scan only `/gate`.
- Demo-only toggles: the Classic theme switch, Play's v0/v1 art switch, the counselor's V4–V7 pill, and the Glossary Signal/Drift font picker.

## Progress

**Step 1 done on branch `a11y-wcag-step1` (21 Oct 2026, not yet merged):**
- **S1, partly.** The shared detail sheets (PageSheet, PeekSheet, CareerPeek) use the shared `useDialogFocus`: focus moves in, Tab stays inside, Escape closes, and focus returns to the card. This was tested by keyboard at 1366 and 390 wide. The other dialogs listed under S1 are still to do.
- **M2.** The skip link finds the visible `<main>` and works on `/`, every student page and the sims. The sims now render inside a `<main>`.
- **M5.** IconTip tooltips close on Escape, and the pointer can move onto them.
- **M1, mostly.** Brand blue used as text now uses `--color-text-brand` (173 places), so it is `#59a0f8` in dark and unchanged in light. Counselor past days, faded rows and inactive tabs were raised. The Opportunities card scrim is darker. A re-scan of Counselor Meetings, Insights and Students shows 0 contrast fails.
- **M11, partly.** The sim "decisions made" counter has `role="img"`.

**Step 2 done on the same branch (Play):**
- **S2.** A Timers switch sits in the sim HUD, beside Music and Sound, on levels that have a timed question. When it's off, no clock shows, nothing times out, and the prompt drops "before the timer runs out". The setting is kept per browser. Tested on IB L1-18: with timers on, the question times out at 45s; with them off, it waits.
- **S4.** The card deck (Play hub on phones, Profile Top 3) has Previous/Next buttons, an "N of M" counter that is announced, and arrow keys. Only the front card is in the Tab order. When you use the arrow keys, focus follows to the new front card.

**Step 3 done on the same branch (forms):**
- **M7, signup.**
  - Every field has `autoComplete` (`name`/`given-name`, `email`, `new-password`), `required`, `aria-invalid`, and `aria-describedby` pointing to its error.
  - A failed submit moves focus to the first field in error.
  - The birthdate error is `role="alert"`.
- **M7, resume.** The contact fields autofill (`given-name`, `family-name`, `email`, `tel`, `address-level1`/`address-level2`). Required labels say "(required)" to screen readers. `TextInput` passes `aria-invalid`.
- **S5.** Resume bullets have Move up / Move down buttons next to the drag handle. Focus follows the line.
- **M8.** The Explore search (×2), the Glossary typed answer and the Tailor job description have labels.

## Serious issues (fix before any claim)

| # | WCAG SC | Issue | Where | Fix |
|---|---|---|---|---|
| S1 | 2.4.3, 2.1.2, 4.1.2 | Dialogs and sheets don't manage focus. Of 85 `role="dialog"`, only 8 files move focus in, trap Tab and return focus on close. Keyboard and screen-reader users land behind the sheet. Some sheets don't close on Escape at all. | Shared `app/peek.tsx:180` (PageSheet), `app/PeekSheet.tsx:104`. Also Inbox, GlobalSearch, Connect (6), Profile (7), Preferences, Career detail, Colleges, Resume, PaySheet. No Escape: `ProProfile.tsx:732`, `WeeklyCheckIn.tsx:41`, `AtsCheckStage.tsx:57`, `BookCounselorSheet.tsx:75`, `counselor/v5/Videos.tsx:78`, `MeetingsWeek.tsx:330` | Reuse `counselor/v4/useDialogFocus.ts` in PageSheet/PeekSheet first (this covers most of them), then in every dialog |
| S2 | 2.2.1 | Timed sim questions can't be turned off or extended. When the timer runs out, the answer is scored wrong ("Time ran out."). | `play/SimulationPlayer.tsx:1699-1727`, about 19 timed steps | Add a "Turn off timers" or "More time" setting in Play. While it is on, skip timeout scoring. |
| S4 | 2.5.7, 2.1.1 | The card deck can only be moved by swiping. Phones get no Prev/Next and there are no arrow keys. | `play/PlayHub.tsx:638` (used on Play hub ×2 and Profile Top 3) | Add Prev/Next buttons and arrow keys |
| S5 | 2.5.7, 2.1.1 | Resume bullets can only be reordered by drag. | `resume/ExperienceModal.tsx:286` | Add Move up / Move down buttons |
| S6 | 4.1.2 | Nested interactive controls: a card with `role="button"` contains real buttons or links. Screen readers announce it badly, and keyboard order is confusing. axe flagged 6 on Connect and 6 on Explore. | `connect/PeopleTab.tsx:51, 247`, `ConnectExperience.tsx:4086`, `ProfileExperience.tsx:2437`, `ExploreExperience.tsx:922` | Stretched-link pattern: the card link and the inner buttons become siblings |

## Moderate issues

| # | WCAG SC | Issue | Where | Fix |
|---|---|---|---|---|
| M1 | 1.4.3 | Text contrast failures. Details are in the contrast table below. | Site-wide toggle, Opportunities cards, counselor Meetings, signup | Change the colors listed below |
| M2 | 2.4.1 | The skip link is broken on every student page. It jumps to `#main`, but student pages have no `id="main"`. On `/` the first `<main>` is hidden, and the gate and sims have no `<main>`. Landmarks still give a way to bypass blocks, so this is a defect, not a hard fail. | `app/SkipLink.tsx`, `marketing/MarketingApp.tsx:93,102`, SimulationPlayer, gate | One `<main id="main">` per route, and target `main:not([hidden])` |
| M3 | 2.4.7, 2.4.11 | On `/`, the "Chapter progress" side nav is invisible (`opacity:0; pointer-events:none`) but can still be focused. Tab lands on 6 invisible 14x14 buttons. | `marketing/` chapter nav | Add `inert` (or `tabIndex=-1`) while it is hidden |
| M4 | 1.2.2 | No captions. There are 7 `<video>` elements with sound on by default and 0 `<track>`s. | `CompanyVideoCards.tsx:182,298`, `ExploreExperience.tsx:1211`, `ProfileExperience.tsx:3811`, `counselor/v5/Videos.tsx:85` | If the videos contain speech, add WebVTT captions |
| M5 | 1.4.13 | Tooltips (`IconTip`, about 338 uses) can't be dismissed with Escape. The pointer also can't move onto them, because they disappear. | `app/IconTip.tsx:48-70` | Add an Escape listener and a short hide delay, and make the bubble hoverable. `DreamScoreTip.tsx` already does this correctly. |
| M6 | 4.1.2, 2.1.1 | Tabs: the main nav uses `role="tab"` for page links. 51 tablists have no arrow keys and no `aria-controls`. | `app/chrome.tsx:79,115`, `app/TextTabs.tsx:34`, Segmented | Main nav: `<nav>` with links and `aria-current`. Add roving-tabindex arrows to TextTabs and Segmented. |
| M7 | 3.3.1, 3.3.2, 1.3.5 | Signup errors have no `aria-invalid`, are not linked with `aria-describedby`, are not announced, and focus doesn't move to the first error. There is no `autoComplete` on name, email or password. Resume contact fields also have no autocomplete, and their required `*` is only visual. | `signup/SignupExperience.tsx:173-185, 307, 456-490`, `resume/wizardSteps.tsx:107`, `resume/ui.tsx:39` | Add `autoComplete` (`name`, `email`, `new-password`, `given-name`, `family-name`, `tel`), `aria-invalid` + `aria-describedby`, focus the first error, and mark required fields with `required`/`aria-required` |
| M8 | 1.3.1, 3.3.2 | Some inputs are labelled only by their placeholder. | `ExploreExperience.tsx:1753, 2015`, `GlossaryGameExperience.tsx:987`, `resume/TailorScreen.tsx:206` | Add `aria-label` |
| M9 | 4.1.3 | XP awards are never announced (the flight animation is `aria-hidden`). Explore wraps the whole results grid in `aria-live`, which is very noisy. | `app/xpFlight.ts:50` (5 call sites), `ExploreExperience.tsx:284` | Call `announce("+N XP")`, and announce only the result count |
| M10 | 2.5.8 | Targets under 24px with no spacing: Connect page dots (6x6, flagged by axe). | Connect carousel dots | Give the dots a 24px hit area (padding, visual size unchanged) |
| M11 | 4.1.2 | `aria-label` on a plain `<span>` gets ignored by screen readers: 45 date badges on Opportunities, and the "0 of 7 decisions made" counter in sims. | Opportunities date badge, SimulationPlayer progress | Add `role="img"`, or use sr-only text instead |

## Contrast failures (1.4.3)

The default dark theme was measured on real rendered backgrounds. Required ratio: 4.5:1, or 3:1 for large text.

| Element | Measured | Where |
|---|---|---|
| "AWARD" eyebrow over a light logo image (white at 56-65%) | 1.8-2.2:1 | Opportunities cards (18) |
| Award amount green `#6EE7B7` over a light logo image | 2.2-2.9:1 (large) | Opportunities cards (11) |
| "In New Jersey" / "Your GPA fits" `#7FA8FF` | 3.5:1 | Opportunities cards |
| "Log in" link `#176ACF` on `#181E28` | 3.2:1 | Signup |
| `--primary` `#176ACF` as small text (initials avatar "SC", "Mark done", "Explore all schools") | 3.35-3.8:1 | Counselor (all views) |
| Inactive large tabs (white at 34%) | 2.8:1 (large) | Counselor Students / Insights / Meetings sub-tabs |
| Meeting dates "Tue / Oct" (white at 28%), "30 min", "Done" (white at 37%) | 2.3-3.3:1 | Counselor Meetings |
| "Drift" chip `#071027` on `#6366F1` | 4.2:1 | Glossary game |
| "YOU" `#2F6BF2`, "VS" (white at 37%) | 3.2-3.5:1 | Leaderboard |
| "Express mode", "Fixing Machines & Engines" `#64748B` | 3.8-4.2:1 | Play hub |
| "Communities" / "View profile" over imagery | spot-check | Connect |

The biggest fix is one token. `#176ACF` as *text* on the dark surfaces fails everywhere. Use the lighter blue for text and keep `#176ACF` for button fills. Also raise every "white at under 55%" text step to at least about 60%.

## Minor issues

- **2.2.2:** The Home carousel has Pause, but it doesn't pause on hover, focus or reduced-motion. 43 framer `repeat: Infinity` loops lack a global `MotionConfig reducedMotion="user"`.
- **2.2.1:** UndoToast closes after 6s with no pause on hover or focus.
- **2.4.2:** `/` and `/flow` use the generic root title. All counselor views share one title.
- **2.4.6 / 1.3.1:** Heading order skips (H3 with no H2) on Colleges and Meetings. The express sim has no H1. Sims have a second `<header>` banner.
- **1.4.10:** At 320px the Opportunities Scholarships / Programs / Internships segment is cut off ("Inte…"). This is the known tabs-overflow-to-dropdown gap.

## Passes

| SC | Result |
|---|---|
| 1.1.1 Non-text content | All 185 img/Image have alt. Icon buttons are labelled. |
| 1.3.4 Orientation | No orientation lock |
| 1.4.2 Audio control | Music starts only after user action and has a mute |
| 1.4.4 Resize text / 1.4.10 Reflow | No zoom blocking. No page-level horizontal scroll at 320px on any of the 30 routes. |
| 1.4.12 Text spacing | No clipped content beyond line-clamped card titles, which is acceptable |
| 2.1.1 Keyboard | Main nav, cards, filters and the Listbox are all reachable. Exceptions are S4, S5 and M6. |
| 2.3.1 Three flashes | No flashing found |
| 2.4.7 Focus visible | A global ring shows on every route |
| 2.5.7 in sims | Drag questions have tap alternatives |
| 3.1.1 Language | `lang="en"` |
| 3.2.6 Consistent help | Not applicable: there is no help mechanism yet. Once one is added, keep it in the same place on every page. |
| 3.3.8 Accessible auth | Counselor login is a redirect, with no cognitive test. |

## Recommended order

1. **One PR, shared components, highest leverage:**
   - Add focus management to PageSheet/PeekSheet (S1).
   - Fix the skip link and add `<main id="main">` (M2).
   - Add Escape to IconTip (M5).
   - Make the text-blue token and low-alpha text steps pass (M1).
3. **Play:**
   - Timer setting (S2)
   - Card deck buttons (S4)
   - Sim landmarks
4. **Forms:** signup and resume autocomplete, errors and required fields (M7, M8), plus resume reorder buttons (S5).
5. **Connect, Explore and Profile cards:** nested interactive controls (S6), tab keyboard (M6), live announcements (M9).
6. **Screen-reader pass:**
   - NVDA + Chrome on Windows
   - ChromeVox on a Chromebook (that's where students are)
   - VoiceOver on iOS
7. **External validation, then the ACR/VPAT.**

Re-run the scanners in `docs/reference/wcag-audit-2026-10-21/` (`node scan.mjs /home /explore ...`, needs `playwright` and `axe-core`) after each step, then add axe to CI so regressions are caught.
