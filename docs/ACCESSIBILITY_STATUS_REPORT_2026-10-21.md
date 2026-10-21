# Dreamari accessibility status report: WCAG 2.2 A, AA and AAA

**Date:** 21 October 2026
**Build audited:** `main` at `d497d51f`, which includes all five accessibility fix rounds. It was run as a production build.
**Prepared for:** launch readiness and US K-12 procurement.
**Out of scope:**
- Demo-only controls: the Classic theme switch, the v0/v1/v2 art switches, the counselor V4–V7 version pill, the qaSkip and Demo shortcuts, and `?sheets` previews.
- The private PIN gate.
- Internal labs.

---

## Progress: Phase 1 done (21 October 2026)

The nine AA blockers B2–B9 are fixed and on main. Only **B1 (video captions and transcripts)** still blocks an AA claim, and it is content work. Measured on a production build, same 96-scan harness, before → after:

| Measure | Before | After |
|---|---|---|
| Real text-contrast failures (dark / light / phone, demo-only and known false positives removed) | 85 / 93 / 61 | 9 / 44 / 24 |
| Text below AAA 7:1 (all modes) | 874 | 607 |
| axe `target-size` nodes | 160 | 0 |
| axe `aria-prohibited-attr` nodes | 186 | 0 |
| axe `skip-link` | 75 | 0 |
| Focused element fully covered | 66 | 14 (Opportunities rail Save buttons, to confirm by hand) |
| Controls under 24px (excluding inline links) | 87 | 82 (mostly inline text links and select labels, which are exempt) |

Game keyboard test (Investment Banker): the start card is modal; after Start, focus lands in the question box once the card has gone; number keys do nothing unless focus is in the box; the verdict is announced once ("Strong move. Plus 6 reputation, now 56. Learn the systems first…"); Continue moves focus to the next screen.

**B1 done (21 Oct 2026, later):** captions and transcripts for all 10 company videos are on main; a person still needs to confirm the flagged lines by ear. **Still open from Phase 1:** the light-mode leftovers in section 5; counselor phone Insights axis labels; AI loading announcements; menus without arrow keys. Then Phase 2 and 3 as planned.

**Phase 2 progress (21 Oct 2026, on main):**
- **Text and contrast:** light-mode text tokens at AAA 7:1; screen-reader context on generic links ("View all …"); "(opens in a new tab)" on external links.
- **Motion and High Contrast:** global reduced motion (`MotionPrefs` plus a CSS reduce rule); forced-colors outlines for the current page, selected tabs and pressed buttons.
- **Headings:** a screen-reader-only h1 wherever a page hides its own.
- **Explore reel:** a Pause button, and the 6s auto-flip now holds on hover and focus.
- **Settings and help:** Profile Settings now has an Accessibility section (hide tips, game timers, video captions on or off), and a public `/accessibility` statement linked from Quick links.
- **Terms and announcements:** first-use abbreviation expansions (FAFSA, GPA, SAT, ACT, ATS); the AI checks are announced.
- **Skipped for now:** a CC button on the reel; arrow keys on `role="menu"` lists are covered app-wide by TabKeys but not yet checked by hand.

## 1. Summary

| Level | Pass | Partial | Fail | Needs a person to test | Not applicable | Total |
|---|---|---|---|---|---|---|
| **WCAG 2.2 A + AA** (after Phase 1 and captions) | 30 | 18 | 0 | 2 | 5 | 55 |
| WCAG 2.2 A + AA (after Phase 1) | 28 | 18 | 2 | 2 | 5 | 55 |
| WCAG 2.2 A + AA (before Phase 1) | 23 | 15 | 10 | 2 | 5 | 55 |
| **WCAG 2.2 AAA** | 4 | 10 | 11 | 1 | 5 | 31 |

**Can Dreamari claim WCAG 2.2 AA today? No, not yet.** It is close, and the remaining work is clear and bounded. Ten AA criteria fail outright. All of them are fixable in code and none needs a redesign. Six of the ten sit in two places:
- the career simulation games;
- the company videos.

**AAA should not be the launch target.** No US law requires AAA. The W3C itself says: "It is not recommended that Level AAA conformance be required as a general policy for entire sites" ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/conformance)). The AAA section below lists what is cheap and worth doing anyway, mostly around motion and focus.

**About "100% safe from any compliance issue":** no audit, tool or vendor can promise that. What protects you in US K-12 is a defensible position:
1. Meet WCAG 2.2 AA, which also covers 2.1 AA, the legal standard.
2. Have a person verify it with screen readers.
3. Get an outside audit letter.
4. Publish an accessibility statement and a VPAT/ACR (the standard accessibility report districts ask for).
5. Keep a dated fix roadmap and a way for users to report problems.

Districts and the Office for Civil Rights (OCR) look for exactly that process. Section 9 lists the steps. Have counsel review contract language before you sign warranties.

### What blocks a WCAG 2.2 AA claim (fix first)

| # | Issue | WCAG | Where | Effort |
|---|---|---|---|---|
| B1 | Company videos have sound but no captions or transcripts | 1.2.2, 1.2.3, 1.2.5 | 10 reels in Explore, company cards and Profile | Medium: needs caption files, which are content work |
| B2 | Game feedback is silent for screen readers: "Not quite", the reputation change and the next question are not announced | 4.1.3 | `SimulationPlayer.tsx` | Small |
| B3 | Number keys answer game questions from anywhere on the page, with no off switch | 2.1.4 | `play/interactions.tsx` `useDigitKeys` | Small |
| B4 | Input borders and the counselor focus ring are too faint (1.3:1 and 2.76:1; 3:1 needed) | 1.4.11 | Shared field styles, counselor `v4.css` | Small: a token change |
| B5 | Text contrast: about 300 failing text elements across 32 pages and 3 modes. Most are in light mode, the game start screens, 10px category labels in world colors, and red "late" text | 1.4.3 | See section 5 | Medium |
| B6 | Keyboard focus lands on controls hidden behind other layers: the game start screen covers its own toolbar, the landing page's invisible side nav takes focus, and the counselor review controls are covered | 2.4.11, 2.4.3 | Sim start screen, `MarketingApp` chapter nav, Review | Small |
| B7 | Tap targets under 24px: Connect page dots (6px), phone Explore Save buttons (23px), phone landing links (8–11px) | 2.5.8 | `/connect`, `/explore`, `/` | Small |
| B8 | Caseload status is shown by color only, so colorblind counselors can't read it | 1.4.1 | Counselor `SchoolPulse` dot matrix | Small |
| B9 | Instructions that depend on sight: "until the orange marker sits on the green mark", "Tap the blue Reserve button" | 1.3.3 | Torque game, UX level 1 | Small |

Fixing B1 to B9 plus the 15 partial items (section 4) gets the product to a supportable WCAG 2.2 AA claim, pending the human screen-reader pass.

---

## 2. US legal and procurement context

This section is research, not legal advice. Every fact has a source; have counsel confirm before relying on it in contracts.

- **ADA Title II web rule (2024).** It covers public school districts, and explicitly covers apps they provide "through contractual, licensing, or other arrangements". That means Dreamari. The standard is **WCAG 2.1 AA**. ([ada.gov](https://www.ada.gov/resources/2024-03-08-web-rule/))
  - **The deadlines moved.** A DOJ interim final rule on 20 April 2026 set **26 April 2027** for districts in areas of 50,000+ people and **26 April 2028** for smaller ones. ([Federal Register 2026-07663](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web))
  - The National Federation of the Blind sued on 21 May 2026 to undo that extension ([case](https://clearinghouse.net/case/48281/)). There was no ruling as of this report. **Plan as if the earlier dates could return.**
  - The final rule has **no exception for course content** a vendor provides.
- **Section 504 and OCR.** OCR settles school complaints with resolution agreements. These require an audit, a fix plan, a way to report problems, and accessible vendor content. They have used WCAG as the yardstick. ([example agreement](https://www.ed.gov/media/document/06161306-bpdf-26151.pdf))
- **Section 508** (WCAG 2.0 AA) binds federal agencies. California applies it to state-funded programs, and districts there ask vendors to certify it.
- **State rules that matter for Dreamari:**
  - **New Jersey** (N.J.S.A. 18A:36-35.1). District sites **and third-party online products offered to students** must meet AA of "the current version" of WCAG, which NJDOE reads as **2.2**. Districts attest to this every two years. ([NJDOE](https://nj.gov/education/atoz/digital_accessibility.shtml))
  - **Maryland.** Districts must test digital tools before buying them and must collect a **VPAT/ACR**. ([MSDE](https://marylandpublicschools.org/programs/Pages/ITSLM/Accessibility/local-accessibility.aspx))
  - **Colorado** HB21-1110: WCAG 2.1 AA, with fines of up to $3,500 per violation according to secondary sources.
  - **Washington** state agencies: WCAG 2.2 AA from 1 July 2026, plus a VPAT and third-party testing.
  - **New York** state agencies: "current version" of WCAG.
  - Not yet verified: Texas, Florida, Virginia, Minnesota and Massachusetts K-12 vendor rules, and Illinois HB 26's WCAG version.
- **Lawsuit pattern.** Districts get sued, then push the cost to vendors through indemnity clauses or by not renewing. Examples: Seattle Public Schools (2015), Berkeley Unified (2022), and LA Community College District, where a jury awarded $242,500 in 2023 for inaccessible educational software.
- **What districts will ask Dreamari for:**
  - A **VPAT 2.5Rev, INT edition**, which covers WCAG 2.2, Section 508 and EN 301 549.
  - A public accessibility statement.
  - A dated fix roadmap.
  - A third-party audit letter that includes screen-reader testing.
  - A warranty clause with fix times.
  - Sometimes the 1EdTech accessibility rubric.

**Target:** WCAG 2.2 AA. It contains 2.1 AA, so one target covers federal law and the stricter states (NJ, WA, NY). Have the audit and VPAT done well before 26 April 2027.

---

## 3. How this was tested

| Method | Coverage |
|---|---|
| axe-core 4.10: every WCAG 2.0/2.1/2.2 A, AA and AAA rule, plus best practices | 32 routes × 3 modes (desktop dark, desktop light, phone 390px) = 96 page scans |
| Pixel-measured text contrast (real backgrounds, including text on photos), at both AA (4.5:1 and 3:1) and AAA (7:1 and 4.5:1) | 7,234 text elements |
| Keyboard walk: 45 Tab stops per page, checking for a focus ring, ring thickness, whether the focused item is covered, and whether it is off screen | 96 page scans |
| Reflow at 320px, zoom 200% (683px), and the 1.4.12 text-spacing override | 96 page scans |
| Target size at 24px (AA) and 44px (AAA); generic link names; label-in-name; duplicate IDs; titles; heading structure; video and canvas inventory | 96 page scans |
| Windows High Contrast (forced colors) emulation, screenshots | 5 key pages |
| Reduced-motion emulation: animations still running after the page settles | 10 pages |
| Screen-reader view, approximated from Chromium's accessibility tree | Home, a game, Signup |
| Source review of every A, AA and AAA criterion that needs a person or code reading | `src/app` and `src/components` on main |
| Scripted keyboard tests of every fix shipped in rounds 1–5 | Sheets, dialogs, tabs, deck, timers, forms |

**Routes:**
- Student: landing, Home, Explore, Explore Browse, 2 career pages, Colleges, a college page, Opportunities, a scholarship page, Connect, Profile (3 tabs), Play, 2 career simulations, the Glossary game, Resume Builder (2 views), Career Report, Leaderboard, Signup, Flow, the 404 page.
- Counselor (v4, the production build): Overview, Students, Explore, Review queue, Meetings, Insights, Settings.

**Not done yet, and needed before a formal claim:**
- A person testing with real assistive technology: NVDA + Chrome on Windows, ChromeVox on a Chromebook, VoiceOver on iPhone, voice control and switch access.
- Listening to the video audio.
- Checking flash frequency.
- An outside validator.

---

## 4. WCAG 2.2 Level A and AA, every criterion

Status: **Pass**, **Partial** (mostly met, named gaps), **Fail**, **Test** (needs a person), **N/A**.

### Perceivable

| SC | Lvl | Status | Finding | Fix |
|---|---|---|---|---|
| 1.1.1 Non-text content | A | Pass | All 185 images have alt text; icon buttons are labelled. Decorative star-field canvases have no label | Add `aria-hidden` to decorative canvases |
| 1.2.1 Audio-only / video-only | A | N/A | No audio-only or silent video content | – |
| 1.2.2 Captions (prerecorded) | A | Pass* | All 10 company reels have WebVTT captions, on by default in every player (`public/videos/app/captions/`, `CaptionTrack`). Generated with Whisper and corrected where certain. *A person must still confirm the flagged lines (`VIDEO_TRANSCRIPTS` header) before a formal claim | Spot-check by ear |
| 1.2.3 Audio description or media alternative | A | Pass | A full transcript under every player ("Transcript"). The music-only JPMorgan Ohio clip describes what is shown | – |
| 1.2.4 Captions (live) | AA | N/A | No live media | – |
| 1.2.5 Audio description | AA | Test | On-screen text in tours may not be spoken | Listen to each clip. If visuals carry meaning, add a described version or put it in the transcript |
| 1.3.1 Info and relationships | A | Partial | Game screens have no h1 and the question is a `<p>`. On phones, 10 pages hide their only h1. Heading levels skip on Colleges and counselor Meetings. Opportunities date badges use `aria-label` on plain spans (45 per page; also 14 on counselor Explore) | Sim title becomes the h1 and the question an h2. Keep an sr-only h1 on phones. Use `role="img"` or sr-only text on the date badges |
| 1.3.2 Meaningful sequence | A | Pass | Visual reorders keep DOM order | – |
| 1.3.3 Sensory characteristics | A | Pass | Fixed in Phase 1: Torque reads "Move the slider into the green safe range" and the range announces "In the safe range / Too low / Too high"; "Pull until the wrench clicks"; "Put them in order". ("Tap the blue Reserve button" is a wrong answer in a UX lesson, not an instruction.) | Reword, and give the Torque range `aria-valuetext` ("in the safe band") |
| 1.3.4 Orientation | AA | Pass | No orientation lock | – |
| 1.3.5 Identify input purpose | AA | Partial | Signup and resume are fixed. Left: signup birth month/year, and the counselor Settings name, email and school fields | Add `autoComplete` values (`bday-month`/`bday-year`, `name`, `email`, `organization`) |
| 1.4.1 Use of color | A | Pass | Fixed in Phase 1: caseload statuses are a filled square (On Track), a ring (Needs Attention) and a warning triangle (At Risk), in the dots and the key, and they hold up in forced colors | A glyph or shape per status (✓ ! ×) |
| 1.4.2 Audio control | A | Partial | Game music needs a click and can be muted. Company video cards start playing **on keyboard focus**, and play with sound if the shared sound setting is on | Don't autoplay on focus |
| 1.4.3 Contrast (minimum) | AA | Partial | Phase 1 cut real failures from about 239 to about 77 (dark 85→9, light 93→44, phone 61→24). Left: light-mode Leaderboard state chips, small Opportunities date/award labels, counselor phone Insights axis labels (33-40% white), career "Not for me" in light mode, Glossary "Cloud route" chip. Section 5 | Section 5 |
| 1.4.4 Resize text | AA | Pass | No zoom blocking. At 200% zoom, no page scrolls sideways (all 32 routes) | – |
| 1.4.5 Images of text | AA | Partial | Company video covers have the title baked into the image, and the HTML title is hidden until the clip plays | Keep the HTML title visible |
| 1.4.10 Reflow | AA | Pass | Every route works at 320px with no sideways scroll | – |
| 1.4.11 Non-text contrast | AA | Partial | Fixed in Phase 1: every text field, select and picker edge is now 50% of the text colour (3:1+ in both themes); counselor focus ring uses the text-safe brand (#cbe0fb dark); counselor chart series 1 is #6f9cf0 in dark. Left: a few search fields whose border is drawn on a wrapper (Colleges, Connect) | Field borders at least rgba(148,194,249,.45) dark and #8a96a6 light. Counselor ring and chart: #8fb3f5 |
| 1.4.12 Text spacing | AA | Pass | No content clipped under the override, apart from hidden carousel slides | – |
| 1.4.13 Content on hover or focus | AA | Partial | IconTip, DreamScoreTip, FactPopover and Reactions pass. The counselor Meetings hover card has no Escape | Add Escape and make the card hoverable |

### Operable

| SC | Lvl | Status | Finding | Fix |
|---|---|---|---|---|
| 2.1.1 Keyboard | A | Partial | All 16 game interaction types work by keyboard. Gaps: counselor leader trend points are mouse-hover only. 4 `role="menu"` lists have no arrow keys (ForYouSchools, Mentorship ×2, DocumentDesk) | Focusable points or a data table. Arrow keys on menus, or plain button lists |
| 2.1.2 No keyboard trap | A | Pass | Every modal releases on Escape; no traps found | – |
| 2.1.4 Character key shortcuts | A | Pass | Fixed in Phase 1: number-key answers only work while focus is inside the question box, which takes focus on every new screen, and never inside a text field | Fire only when the play area has focus and no text field is active. Add an off switch next to Timers |
| 2.2.1 Timing adjustable | A | Partial | Game timers can now be turned off. Left: the Explore reel card flips after 6s, and Undo disappears after 6s, neither pausing on hover or focus | Pause on hover/focus (FeedbackBar already does) |
| 2.2.2 Pause, stop, hide | A | Partial | The Explore reel video loops with no pause button. The landing-page mascot float and border-beam spin, and the Play "next step" wash, keep animating under reduced motion | Add Play/Pause. Stop the decorative loops under reduced motion |
| 2.3.1 Three flashes | A | Test | Split-flap tiles reshuffle every 55ms (≈18Hz) for a short burst, probably below the area threshold | Measure. Settle instantly under reduced motion |
| 2.4.1 Bypass blocks | A | Pass | The skip link works on every page. axe still flags it because `id="main"` is only set when the link takes focus | Put `id="main"` on `<main>` at render |
| 2.4.2 Page titled | A | Partial | `/` and `/flow` use the generic site title. All counselor views share one title | One title per view |
| 2.4.3 Focus order | A | Pass | Fixed in Phase 1: each new game screen takes focus; the game start card is modal; the landing page chapter nav is inert while hidden | Focus the new question heading. Make the background `inert`. `inert` on the hidden nav |
| 2.4.4 Link purpose (in context) | A | Pass | Generic "View all" links sit under a heading that names them | – |
| 2.4.5 Multiple ways | AA | Pass | Main navigation, Explore search, and cross-links | – |
| 2.4.6 Headings and labels | AA | Partial | Games have no headings | As 1.3.1 |
| 2.4.7 Focus visible | AA | Partial | The student ring passes in both themes. Colleges and Connect search fields, and resume fields, show focus only as a faint border change | Use a `focus-visible:ring-2` field style |
| 2.4.11 Focus not obscured (minimum) | AA | Partial | Fixed in Phase 1: game toolbar no longer reachable behind the start card, landing nav inert, `scroll-padding` keeps focus clear of the sticky header and phone tab bar (covered-focus hits 66→14). Left to confirm by hand: Save buttons on the Opportunities card rails (likely the rail clipping, not real cover) | `inert` on covered layers. `html{scroll-padding-top:90px;scroll-padding-bottom:110px}` |
| 2.5.1 Pointer gestures | A | Pass | Every swipe and drag has a button alternative | – |
| 2.5.2 Pointer cancellation | A | Pass | Down events only start drags | – |
| 2.5.3 Label in name | A | Partial | Resume "Tap to read" button is labelled "Read full screen" | Make the label start with the visible text |
| 2.5.4 Motion actuation | A | N/A | No device-motion input | – |
| 2.5.7 Dragging movements | AA | Pass | Fixed in round 2: deck buttons, resume reorder, and game tap paths | – |
| 2.5.8 Target size (minimum) | AA | Pass | Fixed in Phase 1: Connect page dots and landing stage dots have 24px hit areas; poster Save is 32px (25px on the phone deck). axe target-size: 160 → 0 | 24px hit areas (padding; the visual stays the same) |

### Understandable

| SC | Lvl | Status | Finding | Fix |
|---|---|---|---|---|
| 3.1.1 Language of page | A | Pass | `lang="en"` | – |
| 3.1.2 Language of parts | AA | N/A | No other languages | – |
| 3.2.1 On focus | A | Pass | Nothing navigates on focus | – |
| 3.2.2 On input | A | Pass | Pickers commit on Enter or click | – |
| 3.2.3 Consistent navigation | AA | Pass | One shared header and bottom nav | – |
| 3.2.4 Consistent identification | AA | Partial | `/explore` is "Explore" in the nav and "Careers" in the section switcher, which is also built as tabs that navigate | One name. Links with `aria-current` |
| 3.2.6 Consistent help | A | N/A | No repeated help mechanism yet | When support or contact is added, put it in the same place everywhere |
| 3.3.1 Error identification | A | Pass | Fixed in round 3 | – |
| 3.3.2 Labels or instructions | A | Pass | Fixed in round 3 | – |
| 3.3.3 Error suggestion | AA | Pass | Messages say what to do; AI errors offer a retry | – |
| 3.3.4 Error prevention | AA | Pass | Deletes confirm, removals have Undo, and bulk messages preview | – |
| 3.3.7 Redundant entry | A | Pass | The resume seeds from the profile | – |
| 3.3.8 Accessible authentication | AA | Pass | No CAPTCHA, paste allowed. **Re-check when real login ships** | – |

### Robust

| SC | Lvl | Status | Finding | Fix |
|---|---|---|---|---|
| 4.1.2 Name, role, value | A | Partial | Opportunities and counselor date badges now `role="img"` (axe aria-prohibited-attr 186 → 0). Left: 4 menus with no arrow keys, section switcher built as tabs that navigate, Review "Draft saved" dot | As above |
| 4.1.3 Status messages | AA | Partial | Fixed in Phase 1: game verdicts are read out ("Strong move. Plus 6 reputation, now 56. …") and each new question takes focus. Left: AI "Generating…" states are not announced | `role="status"` on the verdict. Announce "Question N" and the loading text |

---

## 5. Contrast detail (1.4.3 AA)

Measured on real rendered backgrounds. The ratios needed are 4.5:1, or 3:1 for large text. Results below 1.5:1 on document previews were checked by eye and turned out to be scanner false positives (the counselor Review document); they are left out.

| Where | Text | Measured | Notes |
|---|---|---|---|
| **Game start screens, light mode** (IB, RN) | "INTERN" eyebrow, ID card text, "Level 1 · Intern", Start button text | 1.2–2.9 | The light theme washes out the art; confirmed in a screenshot. **Easiest fix: game screens always use the dark theme** |
| Game ID cards (dark) | "Tap ID", "Locked" at 7.5px | 3.5–3.7 | Below 9px is also a legibility problem; make them at least 11px |
| Career category labels (10px, world colors) | "Tech & Engineering" #6366f1, "Teaching & Education" #8b5cf6, "Law, Safety & Justice" #e5484d, "Fixing Machines & Engines" #64748b | 2.8–4.4 | Use a light tint of each world color for text, and keep the strong color for dots and bars |
| Counselor "late" text | `--color-feedback-danger-solid` #e5484d | 3.4 (light) – 4.2 (dark) | Text-safe red: about #ff8a8f dark, #c4282d light |
| Counselor Meetings, light mode | "Next · tomorrow", "Today", "Edit availability" #94c2f9 | 1.5–1.7 | Use the light brand text token |
| Counselor Meetings, light mode | Past-day labels and rows at 75–80% opacity | 3.8–4.3 | Full opacity in light mode |
| Career hero "Play" button | White on world color | 3.3 | Darken the button fill |
| Career "Not for me", light mode | White on light | 1.4 | Theme-aware ink |
| Opportunities card labels over logos | "Award", "Up to", "Date" (10px, 65–75% white) | 3.5–3.9 | 90% white, or 12px |
| Home "FROM A PARTNER" | 10px | 3.8 dark, 1.8 light | Theme-aware, at least 12px |
| Flow nav labels | 62% white, 10–12px | 3.9–4.3 | 80% white |
| Leaderboard state chips | "NJ", "NY", score in bronze | 3.0–3.9 (dark), 1.05 (light) | Darker chip ink |
| Glossary game | "Drift" chip, "Cloud route", light-mode hero | 2.4–4.2 | The font picker is demo-only; the rest are real |
| Landing, light mode | "Source: Harvard FAS…" at 38% white | 3.6 | 70% |

**Text that passes AA but not AAA (1.4.6):** 177 elements in dark mode and 575 in light mode. The main causes are white on `--primary` buttons (6.2:1), the light brand text #2f5fb1 (5.7:1), and light muted text #4b5664 (6.9:1). Raising them to #24508f and #434c58 would meet AAA cheaply.

---

## 6. WCAG 2.2 AAA, every criterion

AAA is aspirational. Fix the cheap items; do not claim AAA conformance.

| SC | Status | Finding | Worth doing? |
|---|---|---|---|
| 1.2.6 Sign language | Fail | None for the 10 clips | No |
| 1.2.7 Extended audio description | Fail | None | Covered by transcripts |
| 1.2.8 Media alternative | Pass | Transcripts under every player | Done |
| 1.2.9 Audio-only (live) | N/A | – | – |
| 1.3.6 Identify purpose | Partial | Landmarks and autocomplete are mostly present | Mostly done |
| 1.4.6 Contrast (enhanced, 7:1) | Fail | 177 dark / 575 light below 7:1 | **Yes** for the light tokens (2 values) |
| 1.4.7 Low background audio | N/A | No voiceover | – |
| 1.4.8 Visual presentation | Partial | No justified text, and line lengths are capped. Much body text has 1.4 line height (needs 1.5). No user color choice beyond the dark/light theme | Yes: default body line height 1.5 |
| 1.4.9 Images of text (no exception) | Fail | Video covers | With 1.4.5 |
| 2.1.3 Keyboard (no exception) | Partial | Counselor trend scrub | With 2.1.1 |
| 2.2.3 No timing | Fail | Timers are on by default; toasts last 3–6s; a live countdown in the AMT game | Optional: timers off by default for users who prefer reduced motion |
| 2.2.4 Interruptions | Partial | Nudges and welcomes have no global "quiet tips" setting | **Yes**: one setting |
| 2.2.5 Re-authenticating | N/A | No sessions yet | Keep drafts when login ships |
| 2.2.6 Timeouts | N/A | – | – |
| 2.3.2 Three flashes | Test | Split-flap 18Hz bursts | **Yes**: settle instantly under reduced motion |
| 2.3.3 Animation from interactions | Fail | No global reduced-motion switch: 21 of 66 framer-motion files ignore the setting, and 321 CSS keyframes have no global override. Reduced-motion emulation showed 4 loops still running | **Yes**: `<MotionConfig reducedMotion="user">` plus a global CSS reduce rule. This fixes 2.2.2 and 2.3.2 too |
| 2.4.8 Location | Partial | `aria-current` is used. Detail pages have Back only, no breadcrumb | Optional |
| 2.4.9 Link purpose (link only) | Fail | 37 "View all", "See all", "Show more" and similar | **Yes**: sr-only context ("View all scholarships") |
| 2.4.10 Section headings | Partial | Games have no headings | With 1.3.1 |
| 2.4.12 Focus not obscured (enhanced) | Fail | Partly covered focus on many pages; no scroll-padding | With 2.4.11 |
| 2.4.13 Focus appearance | Partial | Student ring passes. Counselor ring is 2.76:1. About 10 custom focusables fall back to the low-contrast ring | **Yes**: one token |
| 2.5.5 Target size (enhanced, 44px) | Fail | 64% of controls are under 44px (991 of 1,551 on desktop) | Partly: pad the common 28–36px icon buttons |
| 2.5.6 Concurrent input | Pass* | A touch-guard script ignores mouse moves for 1s after a touch, so hover popups can stick on touch-screen Chromebooks | Optional: filter by pointer type |
| 3.1.3 Unusual words | Partial | A glossary game exists, but there are no inline definitions | Optional |
| 3.1.4 Abbreviations | Fail | GPA (210), FAFSA (101), SAT, ACT, ATS and AP are never expanded | **Yes**: expand on first use per screen |
| 3.1.5 Reading level | Partial | Samples range from grade 1.5 to 10.2; career profile text runs high | Yes: the team's 8th-grade rule already applies |
| 3.1.6 Pronunciation | N/A | – | – |
| 3.2.5 Change on request | Fail | Home carousel and Explore flip run on their own. 5 external links open new tabs with no warning | **Yes**: "(opens in new tab)" |
| 3.3.5 Help | Partial | Inline hints, no general help | Optional |
| 3.3.6 Error prevention (all) | Partial | Connect messages send with no undo | Optional |
| 3.3.9 Accessible authentication (enhanced) | Pass | – | – |

---

## 7. Beyond WCAG

| Area | Status | Finding | Fix |
|---|---|---|---|
| **Screen-reader experience in games** | Fail | Silent verdicts and questions (4.1.3). The start screen leaves the game behind it exposed | Covered by B2 and B6 |
| **Windows High Contrast / forced colors** | Partial | Pages stay usable (screenshots), but the current nav item and selected pills lose their highlight, and status dots disappear. Only 2 `forced-colors` rules exist, both counselor-only | Add `@media (forced-colors: active)` borders for selected and current states |
| **Reduced motion** | Partial | Most pages are still. 4 loops keep running (landing mascot, border beams, Play wash) | Global reduce rule (2.3.3) |
| **Chromebook / Windows** | Pass | Covered by `CROSS_BROWSER_GUARDRAILS.md`. Tooltips are clamped and scrollbars paired | Keep running the self-check |
| **Exports** | Partial | The resume .docx has real headings but no title or language metadata. PDFs come from browser print and are tagged by the browser | Set the .docx title and language |
| **Duplicate IDs / aria-hidden focusables** | Pass | None found in 96 scans | – |
| **Canvas / 3D** | Pass | Decorative and hidden from screen readers. Dreamy 3D is lab-only | – |
| **Mobile (390px)** | Partial | Layout passes. Small targets (B7). 10 pages hide their h1 on phones | As above |

---

## 8. Already fixed (5 rounds, all on main)

1. **Focus handling for every modal:**
   - The shared `useDialogFocus` hook is used in the career, school and page sheets, and in every dialog that had no Escape.
   - An app-wide `DialogFocusHost` covers the rest: focus moves in, Tab stays inside, Escape closes, and focus returns to the opener.
2. Skip link targets the visible `<main>`; sims render inside `<main>`.
3. Tooltips close on Escape and can be hovered.
4. Brand-blue text uses the text-safe token (173 places). Counselor past days, rows and tabs are brighter. The Opportunities card scrim is darker.
5. **Games:** a Timers off setting, and Prev/Next buttons plus arrow keys on the card deck.
6. **Forms:**
   - Signup and resume autofill.
   - Errors tied to their fields, with focus moving to the first error.
   - Required fields announced.
   - Resume bullets have Move up/down buttons.
   - Placeholder-only inputs got labels.
7. No more buttons inside card buttons (Connect, Profile, video cards). Arrow keys on every tab row, with one Tab stop per row. XP awards and search counts are announced.

---

## 9. Roadmap to a defensible launch

**Phase 1: AA blockers.** About 1–2 engineering weeks, plus caption content.
- B2, B3, B6 and B9 (games: announcements, digit keys, start-screen `inert`, wording). This is mostly `SimulationPlayer.tsx` and `interactions.tsx`.
- B4 and B5 (tokens and contrast). B8 (status glyphs). B7 (hit areas).
- B1: caption and transcript files for the 10 reels. Content work: get them from the partners, or generate them and have a person review.
- The 15 partial AA items in section 4.

**Phase 2: cheap AAA and robustness.** About 1 week.
- Global reduced motion (`MotionConfig` plus a CSS reduce rule).
- AAA contrast tokens, sr-only link context, abbreviation expansion, "(opens in new tab)".
- A quiet-tips setting, forced-colors states, scroll-padding.

**Phase 3: verification and paperwork.** Run alongside Phase 1 and 2.
1. **Human screen-reader pass:** NVDA + Chrome (Windows), ChromeVox (Chromebook), VoiceOver (iPhone), plus keyboard-only and 200% zoom. Use the scripts in `docs/reference/wcag-audit-2026-10-21/` for regression runs.
2. **Add axe to CI**, so every push is checked.
3. **External audit** by a firm such as Deque, Level Access, TPGi or WebAIM, with a dated **audit letter**.
4. **VPAT 2.5Rev INT edition**, one each for the student app, the counselor dashboard and the games. Fill it in after Phase 1 so it can say "Supports" honestly.
5. **Public accessibility statement:**
   - the standard targeted (WCAG 2.2 AA);
   - known gaps;
   - a way to report a problem (an email or form) and the response time.

   This also starts the "consistent help" pattern (3.2.6).
6. **Contract kit:** an accessibility warranty (WCAG 2.2 AA, with fix times), limited indemnity, and the 1EdTech rubric self-assessment. **Have counsel review these.**
7. **Process:**
   - name an accessibility owner;
   - add an a11y check to the definition of done;
   - re-audit every quarter and before each major release.

**Dates to plan around:**
- **Now:** NJ district attestations and Maryland pre-purchase reviews are already live.
- **26 April 2027:** large-district Title II date, earlier if the NFB suit succeeds.
- Aim to have Phase 1 and the external audit done **before the first district contract**.

---

*Sources and raw data: `docs/WCAG_2_2_AA_AUDIT_2026-10-21.md` (the earlier audit and fix log), `docs/reference/wcag-audit-2026-10-21/` (scanners). Legal research citations are inline in section 2. This report is a technical audit, not legal advice.*
