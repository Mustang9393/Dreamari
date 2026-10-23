# Dreamari accessibility status report: WCAG 2.1 / 2.2 A, AA and AAA

**Date:** 23 October 2026
**Build audited:** branch `counselor-replit-v7` at `3457d132` plus the fixes in this report, run as a **dev build** on `localhost:3089` (the 21 October report used a production build; see "Reading the numbers").
**Compared against:** `docs/ACCESSIBILITY_STATUS_REPORT_2026-10-21.md` and `docs/WCAG_2_2_AA_AUDIT_2026-10-21.md`.
**Harness and data:** `docs/reference/wcag-audit-2026-10-23/` (the 21 October harness re-run unchanged: Playwright + axe-core 4.12, pixel contrast pass, 45-stop focus walk, reflow 320 / zoom 200, text spacing, target size, reduced-motion and forced-colours probes; `routes.txt` lists the 33 routes, `numbers-before-fixes.json` the raw counts).
**Out of scope, as before (Chandu, 21 Oct 2026):** labs, the PIN gate, demo-only toggles. The Classic and Storm switches are demo-only but were fixed anyway because every outside scanner flags them.

---

## 1. Where we are

| Question | Answer |
|---|---|
| Can Dreamari claim WCAG 2.2 AA today? | **Not yet, but the gap is now a short list of hand checks, not code.** After this round no AA criterion fails outright in the automated and source review. What remains is the human pass: screen readers (NVDA, VoiceOver, ChromeVox), a keyboard walk by a person, and listening to the video captions. |
| What changed since 21 October? | The 21 Oct blockers B1 to B9 stay fixed. This run found one new critical (a table role on the counselor Students list), a handful of ink and heading slips, two small-target controls, one unfocusable scrolling chart, and the two preview switches outside every landmark. All are fixed in this commit (section 5). |
| What about the new day sky? | It passes the criteria that matter for it: one lightning swell per strike, never faster than one a second (2.3.1, 2.3.2), nothing moves under reduced motion (2.3.3), the canvases are hidden from assistive tech, the flare layer never takes a pointer. See section 6. |
| Can we reach AAA? | Not full AAA, and no one should claim it (sign language for ten videos, extended audio description). But the **AAA items that are worth having are within reach**: section 7 gives the plan, in order of value per hour. |

### Scorecard (automated + source review; "Test" = needs a person)

| Level | Pass | Partial | Fail | Test | N/A | Total |
|---|---|---|---|---|---|---|
| **WCAG 2.2 A + AA, 23 Oct (after fixes)** | 36 | 12 | 0 | 2 | 5 | 55 |
| WCAG 2.2 A + AA, 21 Oct (after Phase 1 + captions) | 30 | 18 | 0 | 2 | 5 | 55 |
| **WCAG 2.2 AAA, 23 Oct** | 8 | 10 | 8 | 1 | 4 | 31 |
| WCAG 2.2 AAA, 21 Oct | 4 | 10 | 11 | 1 | 5 | 31 |

WCAG 2.1 AA is a strict subset of 2.2 AA (2.2 adds 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8 and drops 4.1.1), so a 2.2 AA claim covers 2.1 AA.

---

## 2. Reading the numbers: dev build versus production build

This run used the dev server, not `next build`, because the worktree's `.next` folder was serving the dev session. Three things follow and are accounted for below:

- **The Next.js dev overlay (`NEXTJS-PORTAL`) sits in the Tab order.** It shows up in every focus walk as "no ring", "covered" or "offscreen". It does not exist in production. Every focus count below excludes it.
- **The pixel contrast pass samples a screenshot.** On a dev build the hero carousel and page entrances are still fading when the shot is taken, so several solid buttons were measured mid-fade (the Home hero button read 1.08:1; its real colours are #0b1a33 on #8fb3f5 in dark, 8.2:1, and white on #2f5fb1 in light, 6.2:1). Gradient text (`[data-grad-text]`, the career hero figures) reads as 1:1 because the sampler cannot see a gradient fill. These are listed as artifacts, each confirmed by computed colours in the browser.
- **Hydration is slower**, so a few axe results were transient (the college detail page once reported a missing skip-link target; on reload `main#main` is present).

For the launch claim, re-run `docs/reference/wcag-audit-2026-10-23/run.sh` against a production build; the harness is unchanged from 21 October so the numbers will be directly comparable.

---

## 3. What the run measured

33 routes (26 student, 7 counselor v7 views) in three modes: desktop dark, desktop light, phone dark. 99 page scans.

| Measure | 21 Oct (prod) | 23 Oct raw (dev) | 23 Oct after removing artifacts | After this commit |
|---|---|---|---|---|
| axe critical | 0 | 2 (one node, students list) | 2 | **0** |
| axe serious, AA rules | contrast 5 | contrast 7 dark / 10 light / 4 phone; scrollable region 1 | reel labels, month chip, resume CTA, switches | **reel labels only (halo added, confirm by eye)** |
| axe moderate | region 0 after skip-link fix | region 34 / 58 / 60; heading-order 2 | preview switches outside landmarks; 2 heading skips | **0 (Next dev badge remains, dev only)** |
| Real text below AA (4.5:1 / 3:1 large), desktop dark / light / phone | 9 / 44 / 24 | 57 / 72 / 34 | about 6 / 5 / 4 (see 4.1) | **2 / 2 / 1 to confirm by eye** |
| Text below AAA 7:1 (AAA only), desktop dark / light / phone | 177 / 575 | 74 / 290 / 53 | same | same, see section 7 |
| Controls under 24x24 (2.5.8), excluding the skip link | 82 | 118 / 141 / 87 | 11 distinct controls (logo, switches, See all, Open week, Explore careers, Show more) | **4 left: "See all N" ×3, "Show 25 more"** |
| Controls under 44x44 (2.5.5, AAA) | 64% | 62% / 62% / 52% | same | same |
| Focus: no visible ring | 0 real | 22 / 22 / 25 | 4 to confirm by hand (two search inputs, counselor Toggle radios) | same, see 4.3 |
| Focus: fully covered | 14 | 9 / 8 / 7 | Opportunities card "Open" buttons (ring draws round the card edge; confirm by keyboard) | same |
| Reflow at 320px, zoom 200% | pass | **0 failures in all 99 scans** | | |
| Text spacing (1.4.12) | pass | only the sr-only skip link and one placeholder clip | | |
| Pages with exactly one `<h1>` | all | all but counselor Workspace (2) | | **all** |
| Heading level skips | 0 | 2 (Colleges browse grid, counselor Analytics) | | **0** |
| Generic link names ("View all", "See more") | 37 | **0** | | |
| Running animation under `prefers-reduced-motion` (10 routes) | several | **0 moving elements on every sampled route** | | |
| Controls with no visible edge in forced colours (5 routes) | 0 | **0** | | |

---

## 4. Findings in detail

### 4.1 Contrast (1.4.3 AA, 1.4.11 non-text)

Real failures found, and what was done:

| Where | Text | Measured | Cause | Fix |
|---|---|---|---|---|
| Profile > Resume, "Create My Resume" | white 14px on the periwinkle fill | 2.1:1 dark | `text-white` on `--primary`; in Black & Blue the fill is light and its ink is `--primary-foreground` | ink token (`ResumeExperience.tsx`) |
| Opportunity detail, month chip ("Mar") | white 10px on the periwinkle fill | 2.1:1 dark | same class of bug (`DetailParts.tsx`) | ink when the tone is the primary fill |
| Classic and Storm switches | 10.5px label at 55% opacity | 1.5:1 light, 2.7:1 dark | resting opacity | 80% opacity on the muted ink: 5.5:1 light, 6.1:1 dark (`ColorThemeSwitch.tsx`, `WeatherSwitch.tsx`) |
| Explore For You reel, "Save" / "Dislike" / "Not for me" labels | white 11px over the photo | 1.1:1 light on bright photos (the shadow is not sampled) | white text over user photos | a thicker halo (`labUi.tsx`); WCAG counts a halo as background, confirm by eye on the brightest photos |
| Counselor Workspace document preview, "Postsecondary intent" and section numbers | 19px #202729-on-white preview scaled down | 1.8:1 and 1.2:1 by pixels | the preview is scaled and the grey numbers are light by design | **confirm by hand**; if real, darken `.publication-section span` in `v4.css` |
| Counselor Students, status text | 13px | 1.97:1 once | plain foreground text; likely sampled on a hover band | **confirm by hand** |

Confirmed artifacts (not failures): Home hero buttons (6.2:1 light, 8.2:1 dark by computed colours), Colleges "Likely" / "Target" chips (#1c6b4a on #f4f7ff, 6.4:1), career hero gradient figures, the phone "Apply", "Connect" and wordmark samples taken mid-entrance.

### 4.2 Structure (1.3.1, 2.4.6, 2.4.1)

- **Critical, fixed:** the counselor Students list header had `role="row"` with no table around it and no cells inside (axe `aria-required-children` and `aria-required-parent`). The role is gone; the header is plain text above a list of links. If the list ever becomes a real grid, give it `role="table"`, `columnheader` and `cell` together.
- **Fixed:** counselor Workspace had two `<h1>`: the page title and the student document preview's title. The preview's title is now `<h2>` and its numbered sections `<h3>` (`DocumentPreview.tsx`).
- **Fixed:** heading skips. Colleges browse had card `<h3>` with no `<h2>` on the page (an sr-only "Schools" `<h2>` now heads the results); counselor Analytics card titles were `<h3>` directly under the `<h1>` (now `<h2>`).
- **Fixed:** the two preview switches sat outside every landmark (axe `region`, every route). They now share one `<aside aria-label="Preview switches">` (`PreviewSwitches.tsx`).
- **Fixed:** the Analytics "Student milestones" chart scrolls sideways but could not take keyboard focus (`scrollable-region-focusable`); it has `tabIndex={0}` now.
- Every route still has `lang`, a title, one visible `<main>`, a skip link that lands, and landmarks for nav, header and footer.

### 4.3 Keyboard and focus (2.1.1, 2.4.3, 2.4.7, 2.4.11)

- The 45-stop walk found no trap on any route.
- **Confirm by hand (4 controls):** the Colleges search field and Connect "Search professionals" use `dm-beam-input` with `outline-none`; the visible ring is the beam on the wrapper (focus-within), which the walker cannot see on the input itself. Counselor Prepare / Explore / Opportunities view toggles (`dm-seg` radios) draw their ring with a `::before`, which the walker also cannot see. A person pressing Tab decides these; if the beam or the `::before` is not clearly visible, add a plain `focus-visible:outline` fallback.
- **Confirm by keyboard:** Opportunities card "Open …" buttons are full-card overlays; the walker reports them covered because their corners sit under the card's own content, but the 2px outline with 2px offset draws outside the card. If it is hidden by the shelf's overflow, move the ring to the card (`:has(:focus-visible)`).
- College detail "Save this college" reported offscreen is a timing artifact; it is in view at 428px when focused.

### 4.4 Target size (2.5.8 AA, 24px)

Fixed this round: the header wordmark link (22 to 24px), the Classic and Storm switches (20 to 24px), counselor "Open week" and every `TextLink` (20 to 24px), Profile "Explore careers" quiet links (20 to 24px). Left: the Explore shelf "See all 34" style links (65x21) and the Students "Show 25 more" (97x21), both inline text links; the inline exception arguably applies but padding them to 24px is a one-class change in `Shelf` and `Students.tsx`.

### 4.5 Reflow, spacing, language, media

- Reflow at 320px and 200% zoom: no horizontal scroll and no clipped content on any of the 99 scans.
- Text spacing override: only the sr-only skip link (exempt) and the Colleges search placeholder clip; no content loss.
- Videos: all ten reels carry caption tracks and transcripts (21 Oct); the human listen-through of flagged lines is still owed (B1).
- `lang="en"` on every page; abbreviations expand on first use (21 Oct).

---

## 5. Fixed in this commit

| # | Fix | Files | WCAG |
|---|---|---|---|
| 1 | Students list header: `role="row"` removed | `counselor/v7/Students.tsx` | 1.3.1, 4.1.2 |
| 2 | Resume CTA and opportunity month chip use the fill's ink | `resume/ResumeExperience.tsx`, `opportunities/DetailParts.tsx` | 1.4.3 |
| 3 | Preview switches: one landmark, AA label contrast, 24px tall | `app/PreviewSwitches.tsx` (new), `ColorThemeSwitch.tsx`, `WeatherSwitch.tsx`, `app/layout.tsx` | 1.3.1 (region), 1.4.3, 2.5.8 |
| 4 | Document preview title `h2`, sections `h3` | `counselor/v4/DocumentPreview.tsx` | 1.3.1, 2.4.6 |
| 5 | Colleges results get an sr-only `h2`; Analytics card heads are `h2` | `colleges/BrowseV2.tsx`, `counselor/v7/Analytics.tsx` | 1.3.1 |
| 6 | Analytics scrolling chart is focusable | `counselor/v7/Analytics.tsx` | 2.1.1 |
| 7 | Wordmark link, TextLink, Profile quiet links at 24px | `app/chrome.tsx`, `counselor/v7/ui.tsx`, `profile/AboutMeTab.tsx` | 2.5.8 |
| 8 | Reel action labels: thicker halo | `actions-lab/labUi.tsx` | 1.4.3 |
| 9 | Storm veil fade off under reduced motion | `app/StormVeil.tsx` | 2.3.3 |

---

## 6. The day sky, storm and flare (new since 21 Oct)

| Criterion | Status | How |
|---|---|---|
| 2.3.1 Three flashes or below threshold (A) | Pass | A lightning strike is one swell: a 140ms rise and a fall of 0.3 to 0.65s. Strikes are at least 1s apart (2.5s unless it is the deliberate follow-up), unprompted ones 6 to 14s apart. The lit area is cloud only, capped at 85% toward white, so the luminance step stays under the general flash threshold in both themes. |
| 2.3.2 Three flashes (AAA) | Pass | Same as above; nothing in the sky flashes more than once per strike. |
| 2.3.3 Animation from interactions (AAA) | Pass | Under `prefers-reduced-motion` the sky draws one still frame, no strikes fire, the flare layer never shows, the moment waves do not play, and the storm veil switches without a fade. |
| 1.1.1, 4.1.2 | Pass | Both canvases are `aria-hidden`; the flare canvas is `pointer-events: none` and `display: none` between moments; the Storm switch is `role="switch"` with `aria-checked` and a name. |
| 2.4.11 Focus not obscured | Pass | The flare layer is transparent except during a 2s moment and never takes focus or pointer. |
| 1.4.3 over the sky | Pass by design | Text never sits on the sky's brightest band: the limb light lives in the bottom sixth and the cirrus in the top third, with the page's own scrims and glass between; the light-mode scrim tokens from 23 Oct keep photo text at AA. |

One thing to watch: the Storm switch is a demo toggle. If storm ever ships as a product state, the rain and deck darken the page by design; the veil keeps body text above 4.5:1 on cards, but check any text that sits directly on the page ground in storm.

---

## 7. How to reach AAA where it is worth it

Full AAA is not a sensible target (W3C says so, and 1.2.6 sign language and 1.2.7 extended audio description alone would cost more than the rest of the product). What follows is the AAA list sorted by value per hour. Doing the first six moves the AAA scorecard from 8 pass to about 16 pass with no redesign.

| Order | SC | Today | What it takes |
|---|---|---|---|
| 1 | **1.4.6 Contrast 7:1** | 74 texts in dark, 290 in light (desktop) | Light mode: raise `--muted-foreground` and the chip inks one step (the 21 Oct token pass got the body text; the leftovers are muted labels, counselor overlines and the nav's current-page pill, ink on periwinkle at 5.7:1 in light). Dark: the 64px leaderboard ranks (3.2:1 large text, AAA wants 4.5) and world-colour category labels. About a day. |
| 2 | **2.5.5 Target size 44px** | 62% of controls under 44px | Not all of them: pad the icon-only controls (Save dots, close buttons, carousel arrows, counselor row actions) to 44px hit areas with negative margin so the visual size stays. Half a day in the shared components. Chandu's density rule means we do not grow the visuals, only the hit area. |
| 3 | **2.2.3 No timing** | Timers switch exists, default on | Default the game timers off for new accounts, or off whenever reduced motion is set. One line in `MotionPrefs`. |
| 4 | **3.2.5 Change on request** | Home hero rotates on its own; Explore reel auto-flip pauses on hover | Add a visible pause on the Home hero like the reel has, and respect reduced motion by not auto-advancing. Small. |
| 5 | **2.4.12 Focus not obscured (enhanced)** | Partly covered focus in shelves and sticky headers | `scroll-padding-top` under the sticky header, and `:has(:focus-visible)` rings on cards whose overlay button is the focusable. Small. |
| 6 | **1.4.8 Visual presentation** | Line height 1.4 on some body text; no user colour choice | Body `line-height: 1.5` in the type scale; the light/dark themes already give a colour choice. Small. |
| 7 | 3.1.5 Reading level | Career profile text runs high | Content pass under the team's 8th-grade rule; the Hemingway-style check can run in CI on `profiles.*.ts`. Content work. |
| 8 | 2.1.3 Keyboard (no exception) | Counselor trend scrub is pointer-only | Arrow keys on the scrub. Small. |
| 9 | 3.3.6 Error prevention (all) | Connect messages send with no undo | A 5s undo toast like Saves already have. Small. |
| 10 | 2.4.8 Location | Back only on detail pages | A breadcrumb on career, school and opportunity detail. Medium, design decision. |
| 11 | 3.3.5 Help | Inline hints only | A help link in the header menu to `/accessibility` and a short help page. Small. |
| Already pass | 2.3.2, 2.3.3, 2.4.9 (generic links are gone), 2.4.13 (2px ring, 3:1), 3.1.4 (abbreviations), 2.2.4 (quiet tips setting), 2.5.6, 3.3.9, 1.2.8 | | |
| Not worth it | 1.2.6 sign language, 1.2.7 extended AD, 1.4.9 images of text on video covers, 3.1.6 pronunciation | | |

---

## 8. What a person still has to do before any claim

1. Screen readers: NVDA + Chrome on Windows, VoiceOver + Safari, ChromeVox on a Chromebook. One pass each over Home, Explore (reel and browse), a career, Opportunities, Play (one sim start to finish), Profile, and the counselor Home and Students views.
2. Keyboard only, by hand: the four controls in 4.3, the Opportunities card ring, every dialog and sheet (focus in, trapped, Escape, focus back).
3. Listen to the ten video captions against the audio.
4. Re-run `run.sh` on a production build and attach the numbers.
5. Then: an outside audit letter, the VPAT/ACR, and the published statement at `/accessibility` updated with the date.

---

## 9. Roadmap

| When | What | Outcome |
|---|---|---|
| Now (this commit) | Section 5 fixes | No automated AA failures left; the dev-only and artifact items documented |
| This week | 4.3 hand checks, the two "confirm by hand" contrast items, the last four 24px links | AA clean by hand and by tool |
| Next week | Human screen-reader pass, caption listen-through, production re-run | Evidence for the AA claim |
| Following two weeks | AAA items 1 to 6 | AAA where it helps students: 7:1 text, 44px hit areas, no forced timing |
| Before launch | Outside audit, VPAT/ACR, statement dated | Defensible position for districts and OCR |

---

## 10. Verification after the fixes

The ten routes the fixes touch were re-scanned in both desktop modes once the code had settled (`docs/reference/wcag-audit-2026-10-23/numbers-after-fixes.json`):

- axe critical: 0 (the Students row role is gone).
- axe `heading-order`: 0; every page has exactly one `h1`, including the counselor Workspace.
- axe `scrollable-region-focusable`: 0.
- axe `region`: 0 on student routes; 1 node remains on each counselor view. It is not the preview switches (those do not render on `/counselor`); it is the counselor shell's own fixed chrome, to be given a landmark in the counselor pass.
- axe `color-contrast` (AA rules): 1 node left, the reel action label on the career page in light mode, which axe reads without its halo. Confirm by eye.
- Controls under 24px left on these routes: the opportunity detail's "Scholarships" and "All scholarships" chip links (21px), the `/accessibility` "Back to Dreamari" link (21px), the career page's "Explore" back link (22px), and an unnamed full-width 22px control on `/colleges` to identify. All are one-class pads.
- Pixel contrast "fails" left on these routes are the known artifacts (gradient figures, mid-fade buttons) plus the two counselor Workspace items marked "confirm by hand".
