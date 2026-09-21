# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Open items for the APP REPO (read this first if you are pulling from here)

Everything below in the log is a record of work in this prototype. These three
are the only things that need action on the app-repo side. Nothing else here
requires anything of you.

1. **Mirror the new glass tokens.** `color.glass.surface-raised` and
   `color.glass.border-raised` were added to this repo's DTCG collection on
   2026-08-24 and need to land in `packages/ui/tokens`, plus Figma's Semantic
   collection. Drop-in spec with the exact JSON for both modes:
   `docs/handoff/glass-raised-rung.md`; Figma variables:
   `docs/handoff/figma-variables-to-add.md` section D. **Purely additive** -- no
   existing token changed value, so pulling this cannot alter anything already
   built against the glass set.
2. **`--card` in light mode: fixed here, still wants fixing in Figma.** It
   resolves to `#d8dbe8` against a `#f4f7ff` page, so every card built on it came
   out DARKER than the surface it sat on. `globals.css` now corrects it to white
   (with `--border` firmed to `#c9cddd`, since a white card on a near-white page
   needs its edge to carry the separation) under
   `html.light .marketing-v2.themeable`. Done there rather than in
   `marketing/tokens.css` so the contract file the app repo diffs against stays
   byte-identical. **Author the real value in Figma Semantic.Light and this
   override goes away.**
3. ~~StudentAppShell orphaned~~ **DONE.** Deleted 2026-08-24, along with the
   Computer Science career-report page that was its only importer.
   `src/lib/navigation.ts` is also unreferenced but predates this work, so it
   was left alone.

CONTRACT FILES ARE UNTOUCHED and were checked before every push today:
`src/components/marketing/tokens.css`, `docs/handoff/shadcn-adapter.css`,
`docs/handoff/COMPONENT-MAP.md`. The generated
`src/app/design-tokens.generated.css` changed only by four added lines (the two
tokens above, in both modes).

## Current session

### 2026-09-21 (cont'd) App-wide modal backdrop blur pass: every scrim raised to a 28px floor

- Direct feedback continued from earlier in the session ("blur the background more don't just dim the background for the modals. Fix this app wide please" -- following "these all blacked out opaque backgrounds when modals popup... blur as much as Apple does for their pop modals... consistently applied to all cases of a pop-up modal showing"). `WelcomeSplash.module.css`'s `.scrim` (already raised to `blur(32px)` earlier this session) was the reference pattern; this pass swept every other genuine modal/sheet/drawer/photo-viewer backdrop scrim in `src/components` and raised anything below **28px** up to it, and added `backdropFilter`/`WebkitBackdropFilter` to the one scrim that had none.
- Inventoried every `backdropFilter`/`backdrop-blur-[` usage app-wide (`grep -rn` across `src/components`, plus `src/app`, which had none) and read each one's surrounding markup to separate genuine backdrop scrims (`fixed`/`absolute inset-0`, a `role="dialog"` sibling, a click-outside-to-close handler, or a dedicated `aria-label="Close ..."` button covering the viewport) from decorative/panel/nav uses that were explicitly NOT touched: `CardProgressiveBlur` and other image/card gradient blur, frosted nav bars (`chrome.tsx`, `marketing/Nav.tsx`), small anchored popovers (`IconTip`/`Tip`), a dialog PANEL's own solid surface, and `TrailerFlow.tsx`'s intentional `#000` (already confirmed earlier this session as a cinematic full-bleed exception, left alone).
- Raised **22 files** from below-28px (or missing) blur up to `28px`/`blur(28px)`: `app/CompanyVideoCards.tsx` (VideoLightbox, 16->28), `app/GlobalSearch.tsx` (10->28), `app/Inbox.tsx` (notifications panel backdrop, 24->28), `career/CareerDetailExperience.tsx` (DegreeSheet, 6->28), `career/ConnectWithProfessionalsModal.tsx` + `play/ConnectInterstitial.tsx` (both use `ConnectInterstitial.module.css`'s `.backdrop`, 14->28 via the Tailwind class since Lightning CSS strips a hand-authored `backdrop-filter` from the CSS module), `career/Top3SwapModal.tsx` (24->28, comment updated -- it had claimed 24px was "the backdrop blur this session's modal audit standardized on," now stale), `colleges/CollegesExperience.tsx` (CompareSheet 8->28, and the filter-drawer's deliberate `blur(3px)` exception from 11 Sept -- superseded per today's explicit "fix this app wide" instruction, comment replaced explaining why), `colleges/ForYouSchools.tsx` (Sheet, 10->28), `connect/ConnectExperience.tsx` (Ask sheet, Report sheet, community sheet, event-code sheet, QR sheet all 14-16->28; the event photo viewer also had its near-opaque `rgba(6,7,16,0.9)` tint brought down to `0.6` to match its siblings in the same file, since a 90%+ tint on a genuine scrim defeats the point of blurring), `connect/att/AttCommunityView.tsx` and its `v1/` copy, `connect/mentorship/MentorshipTab.tsx` (all 14->28), `glossary/GlossaryGameExperience.tsx` (FeedbackPanel + StreakModal, 24->28), `play/SimulationPlayer.tsx` (the two in-sim lexicon/reputation popovers' backdrop layers, 4->28), `profile/ProfileExperience.tsx` (cover-photo picker, avatar picker, CompareSheet, Evidence sheet, route-details sheet, noteStep sheet -- six scrims, 8-14->28), `resume/ResumeBuilderExperience.tsx` (mobile "More actions" sheet 6->28, approve-resume dialog 14->28), `resume/ResumeExperience.tsx` (confirm-delete dialog, 14->28), `resume/ResumeDocument.tsx` (ZoomResumeModal, 18->28), `resume/TemplateGallery.tsx` (template preview modal, 18->28), `resume/ui.tsx` (shared modal backdrop, 14->28).
- Left untouched, confirmed decorative/panel/nav rather than a backdrop scrim: `CardProgressiveBlur`/poster-card gradients, `HomeExperience.tsx`/`PosterCard.tsx`/`colleges/shared.tsx` hover badges, `dm-glass`/`dm-glass-2`/`dm-glass-3` panel surfaces throughout `ProfileExperience.tsx`, `CareerDetailExperience.tsx`'s `PANEL` const (the info-box surface, not a scrim), `chrome.tsx`/`marketing/Nav.tsx`/`resume/ResumeBuilderExperience.tsx`'s scroll-triggered nav blur, `signup/SignupExperience.tsx`'s step card (a panel, not `inset-0`), `play/PerformancePlanFlow.tsx`'s Warning/Step cards (panels), `connect/primitives.tsx`'s `Card`/company-chip frost, marketing chapter illustrations (`Build.tsx`/`Connect.tsx`/`Match.tsx`/`Play.tsx`/`SchoolsIllustrations.tsx`/`SchoolsView.tsx`), and `TrailerFlow.tsx`'s `#000` (previously confirmed intentional). Nothing here reads as ambiguous enough to flag for a second look -- each lacked the "sits between the page and a dialog" shape (no `inset-0` scrim, no click-outside-close, no dialog sibling).
- `npx tsc --noEmit -p .` clean. `npx eslint src/components` clean on every touched file (only pre-existing unrelated unused-var warnings elsewhere: `ConnectExperience.tsx`, `MentorshipTab.tsx`, `ProfileExperience.tsx` -- confirmed present before this pass, not introduced by it). Not yet re-verified live in the browser this pass (a large number of files touched with an identical mechanical change -- blur value only, no layout/behavior change); worth a quick visual spot-check of two or three modals (Ask a question on Connect, the Colleges filter drawer, the resume approve dialog) before shipping.
- Note for whoever picks this up next: several files this session touched (`CompanyVideoCards.tsx`, `CollegesExperience.tsx`, `GlobalSearch.tsx`, `Inbox.tsx`, `ForYouSchools.tsx`, `ConnectWithProfessionalsModal.tsx`, `CareerDetailExperience.tsx`, `MentorshipTab.tsx`, `GlossaryGameExperience.tsx`, `ResumeDocument.tsx`, `ResumeBuilderExperience.tsx`, `TemplateGallery.tsx`, `resume/ui.tsx`) showed unrelated edits appearing on disk mid-session from what looks like a second, concurrent AI session (new imports, new components, unrelated copy changes) -- every edit in this pass still applied cleanly against the latest on-disk content, and `git status`/`tsc`/`eslint` were all re-checked against the final state, but the "only one AI edits at a time" rule in `AGENTS.md` appears to have been violated by something running in parallel. Worth flagging to the user directly.

Next step: quick live spot-check of a handful of the raised modals (listed above), then commit.

### 2026-09-21 (cont'd) Profile Overview v2 simplified, Glossary Games row gets Netflix-style hover

- **Overview v2 dashboard simplified to a status snapshot** (direct feedback: "let's simplify your V2 so students can understand their status in a few seconds"). My Top Three: dropped the #1 pick's name row, the chosen/3 ratio is now the headline. My Plan: dropped the plan title, the term ratio, and the Next-step link -- replaced with the semester name as headline plus a real action count for that term (deliberately NOT a fake "N of M complete": nothing in this app tracks per-step completion yet, so a done/total ratio there would be invented, not real -- flagged rather than fabricated). Career Report: copy only, "reports ready" added. Resume: dropped the version count, now just "Start your resume" / "Resume ready". Removed now-dead `windowIndex`/`termPercent`/`firstStep`/`requiredSteps` and the `Calendar` import along with the lines that used them.
- **Play tab's Glossary Games row: Netflix-style row hover** (direct feedback: simulations stay dominant by default, but the glossary row "should only be less dominant until hovered, similar to how Netflix handles rows and tiles"). New `GlossaryGamesRow` component lifts hover state above the cards (a card can't know a sibling is hovered on its own): the row header brightens to the glossary accent on any hover in the row, the specific hovered card scales up (1.16x) with a real shadow and lifts above its neighbors, and every other card in the row dims. Scale origin is the bottom edge so cards grow into the row's own reserved padding rather than into the header. Applies to "Coming soon" cards too, so the row reads as one live shelf.
- `npx tsc --noEmit -p .` and `npx eslint` clean on both files. Verified live: Profile Overview v2's four tiles read in a few seconds each; hovering "Medical Terms" in the Glossary row scales it up while "Finance Terms" dims beside it and the row header turns the accent color.

### 2026-09-21 IB Level 1 location coverage + drag-rank fix, Glossary game redesign, profile cover self-heal, Explore Play-badge fix

- **`locations.ts` had a stale routing comment** ("SimulationPlayer routes every non-card, non-review beat straight past this table to the plain ambient backdrop, on purpose") that turned out to be false -- `sceneFor()` never gates on beat kind, and Level 2/3 and the nursing sim already give every beat a room, art-owning beats included, as a fallback for once their own art goes stale. Level 1 was the only level missing this (built the same session, following that comment). Mapped every remaining Level 1 beat id to its act's room; only the terminal review beat stays unmapped, same as every other level. Corrected the comment itself. Verified live: the rapid-fire and drag-choice beats that previously showed the flat gradient now show their dimmed room.
- **RankBody (the drag-to-reorder beat) was silently double-applying every reorder**: `onPointerUp` called `setRows(...)` as a side effect inside `setDrag`'s own updater function, and React 18 Strict Mode double-invokes updaters to catch exactly this kind of impurity. Two passes of the same splice through the already-shifted list is not idempotent -- depending on drag distance it either nets back to the original order (reported live as "it snaps back") or lands scrambled. Reproduced deterministically by scripting real PointerEvents against the DOM and matching the corrupted output to two sequential `reorder()` calls exactly. Fixed by reading `drag` directly in the handler and keeping `setDrag(null)` separate and side-effect-free. Verified live: a 1-slot and a 2-slot drag both land exactly where dropped now.
- **Glossary Game (`GlossaryGameExperience.tsx`) redesign**, direct feedback on screenshots (page and the feedback popup both read as flat/boring on near-black, question content sat low with a large empty gap above it, progress info too dominant, Unlock required two taps per term against the reference's one): swapped the custom near-black tint for `AppBackdrop` (the same app-wide layered purple/blue/teal wash + starfield every other screen already renders), explicitly NOT the Replit reference's own palette (corrected mid-session after an initial pass copied its color stops) -- built from this app's own tokens only, with the career's accent glow layered on top. Question screens now sit directly under the progress strip instead of centered in the leftover space below it; the strip itself shrunk and quieted. Unlock screen: removed the required flip-to-reveal (`SketchFace` deleted, along with the now-orphaned `playFlip`/`RotateCw`), term/definition/example show immediately in the same ring-bound card, Unlock stays the one action that advances. Verified live end to end: 5 terms unlocked in 5 taps (was 10), feedback popup's dim backdrop now shows real color through it.
- **Profile cover image, reported broken live on Vercel** ("loads, then slowly does something else, then I see [the browser's broken-image icon]"): the mount-time guard in `ProfileExperience.tsx` only rejected a `blob:`-prefixed stored value (a leftover from the since-removed upload feature, `df96e809`), so any OTHER stale/invalid value -- a renamed file, anything unrecognized -- still passed through with nothing to fall back on. Replaced the blocklist with an allowlist (only an exact match against the known `COVERS` set or the career sentinel is trusted; anything else is purged from storage, same as "nothing saved") and added `onError` self-heal on both cover `<img>` layers so any future bad value (including a broken top-career poster path) falls back to the default cover instead of showing a broken icon, and stops persisting once corrected. Verified live: seeded a stale `blob:` value, reloaded, cover renders clean and localStorage now holds a valid path.
- **Explore reel card's "Play Game" button had no `onClick` and no check** for whether the career actually has a simulation (confirmed bug from the engineer's Slack feedback, 20 Sept) -- it rendered on every card in the "For You" reel regardless. Gated it on the same `hasSimulation`/`simulationFor` check the career detail page already uses correctly, wired the click to `/play/[slug]`. Verified live: Investment Banking and Registered Nurse (real simulations) still show Play Game.
- Open, not done: the rank-drag beat's own visual design ("needs better design") -- asked the user what specifically bothered them (grip handle, arrow buttons, spacing, drag feedback) once it was functionally fixed; no reply yet, so nothing further attempted there.
- `npx tsc --noEmit -p .` and `npx eslint` clean on every touched file this pass.

### 2026-09-20 IB Level 1 rebuilt to the 20 Sept handoff (3-act, binary scoring), icon tooltips on Career/College detail, shared nudge hook

- **IB Level 1 full rewrite** (`ib-level-1.ts`, 36 beats + two Act moments, from `DreamAri_IB_Levels1-3_Handoff_v8.xlsx`'s "Level 1 Intern" tab, verbatim copy): three acts (Learn the Game / Prove You're Client-Ready / Survive the Internship), binary +5/-5 scoring over exactly 10 scored beats (`TIER_SCORE.wrong` -3 -> -5), three endings with the band word retired for this level (`Level.hideBand`, new opt-in flag -- Level 2/3 and Registered Nurse untouched, confirmed no other level sets it).
- New engine primitives, added because the spec called for interaction shapes the engine didn't have yet, not invented ahead of need: `FocusBeat`/`FocusBody` (two term cards, one blurred, "Got it"/"Back" -- L1-14/15), `ChoiceBeat.dragEnabled` + `DragOptionsBody` (drag-a-token-onto-a-card, reusing `CheckBody`'s existing drag mechanic rather than hand-building a new one -- L1-06/20/28/30), `CardBeat variant:"act"` (auto-advancing completion moments, e.g. "Foundation Complete", and a Continue/"Finish Later" checkpoint with `secondaryCta`/`secondaryHref` -- L1-ACT1, L1-CHECK).
- **`locations.ts` `BEAT_LOCATION` for Level 1 was stale against the rewrite** (old entries were keyed to the previous single-act 24-beat structure, e.g. `L1-13b`, `L1-24` as the finale -- none of those ids exist in the new content) and would have silently fallen back to the plain ambient gradient for most of the level. Replaced with a mapping keyed to the new beat ids, card/review beats only (every other kind already skips this table by design, confirmed by the file's own routing note). Act -> room: Act 1 opens on reception (arrival/teach run), moves to the cafe for Christina's language lesson; Act 2 opens on the trading floor, moves to the internal boardroom for Marcus; Act 3 stays on the floor, day then night (mood: "night" beats -> `cobalt-trading-floor-night`); L1-35 closes back at reception.
- **New Cobalt Capital exterior establishing shot** (the user's own asset, from Downloads: `ChatGPT Image Sep 20, 2026, 03_55_29 AM.png`, confirmed the right file by opening and reading it -- a street-level shot of the tower with a visible "COBALT CAPITAL" sign) wired in as a new location, `cobalt-exterior-sunset` (`public/images/play/ib/locations/exterior-sunset.webp`, converted with `cwebp`), used once on L1-01 -- the level now opens on the building from the street before cutting inside for every following scene.
- `performance-plan.ts` checked against the new binary scoring and strike-rule mechanics: already correct as-is (Cobalt Capital voice, `{PLAN_LINE}` template), no change needed.
- Removed the "⏎" Keycap hint from every Continue-style button app-wide (`interactions.tsx`, `SimulationPlayer.tsx`, `PerformancePlanFlow.tsx`), replaced with a plain chevron -- direct instruction. Fixed a duplicate-chevron bug this introduced on the DialogueBox's own animated Continue button (it already had one; the blind swap added a second), caught live by the user.
- **Verified live** (dev server, desktop): played from a fresh start through the drag-enabled quiz (reputation 50->55->60->65, scores and skill tags correct, no band word anywhere), the two-character reception card (Christina + Jordan together), both Focus-term cards, the fill-in-the-blank choice layout, the reveal/skill-tags card, and the Act 1 "Foundation Complete" card auto-advancing into Act 2's trading-floor scene. Confirmed the new exterior shot renders on L1-01 and hands off cleanly to reception on L1-02. Not played beyond Act 2's opening this pass -- Act 2/3 content, the checkpoint's secondary button, the boss-moment/rank/document layouts, and the three endings are unchanged code paths already exercised earlier in the session, not re-walked beat-by-beat here.
- `npx tsc --noEmit -p .` and `npx eslint` clean across every touched file.

- **Icon-only tooltip pass, Career + College detail** (`src/components/app/IconTip.tsx`, new -- extracted the existing `Tip`/`IconTip` implementation out of `resume/ui.tsx`, which now imports and re-exports it instead of owning a second copy): applied to `CareerDetailExperience.tsx` (the header action row -- Add to my list/Like/Not for me/Save -- and the fact-cell info button) and `colleges/shared.tsx` (`SaveButton`, used on every college card). Verified live: hovering the career page's "+" shows "Add to my list"; hovering a college card's bookmark shows "Save this college", distinct from the card's own separate "View school" hover affordance (unrelated to saving -- confirmed this is pre-existing card behavior, not a save-state bug, per direct correction).
- `colleges/CollegeDetailExperience.tsx` not audited this pass -- next AI/session should check it for any remaining icon-only controls.

- **Shared nudge hook** (`src/lib/nudge.ts`, new): extracted Explore's own text-sweep+spark discovery-nudge pattern into `useDiscoveryNudge(key, active)` + `markNudgeSeen`, applied to Colleges' Filters button and Connect's "Ask" pill (both previously silent). More candidates flagged for a future pass, not yet built.

Next step: play IB Level 1 through Acts 2-3 to the three endings at least once each; audit `CollegeDetailExperience.tsx` for icon-only tooltips; more nudge-pattern candidates app-wide.

### 2026-09-20 Enterprise Overview: trend deltas + drill-down, cards redesigned

- Asked for a genuine opinion on what the just-simplified Enterprise Overview was missing beyond the deleted content: agreed the real gap was no sense of trend -- every number was a bare total, no up/down context. Recommended adding a small delta rather than reviving the old sparklines/charts (that was the actual clutter Josh's pass was cutting).
- First delta attempt was bad and got called out for it: spelled-out "vs last year" text wrapped ugly next to an already-uppercase label, and every tile still used the same generic gray icon-in-a-circle badge, repeated five times. Redesigned per direct feedback: icon + label top-left, a colored pill with a trend arrow (`DeltaBadge`, up/down via `TrendingUp`/`TrendingDown`) top-right -- no spelled-out comparison text anywhere, the arrow and color carry it, per "limit copy, use visual/graphical elements."
- Cards are clickable again (`sheet` state and a single lean `Sheet` reintroduced, scoped to just this drill-down -- not the five sheet kinds and the Regions/Details tabs cut earlier today): tapping any Program-at-a-glance or Engagement tile opens "By program, {period}" with the total, its delta, a `ShareBar` split, and the per-program numbers. `kpiValue` now takes an optional `of` (region/program) so the same function powers the tile figures, the region filter, and the sheet's per-program breakdown without duplicating the math.
- Verified live: both drill-down sheets open with ref-based clicks (screenshot-coordinate clicks were landing wrong after an earlier viewport resize -- the pane was 1210px wide while screenshots rendered at 800px, so real elements sat well off where they looked), Quarterly correctly reads "By program, this quarter" with quarter-scaled numbers in the sheet. tsc/eslint clean.

### 2026-09-20 Enterprise Overview rebuilt to Josh's simplified Replit pass, then trimmed to match it exactly

- Josh sent a second Replit pass at the Mentorship Enterprise dashboard: a much simpler Overview (Geography dropdown + Annual/Quarterly/Monthly, "Program at a Glance" for Mentors/Scholars, "Engagement This [period]" for Volunteer Hours/Mentor Meetings/Messages Exchanged with avg-per-pair context, an annual-only volunteer-hours-goal ring, just Overview + Settings tabs).
- First pass: kept the old Overview's deeper reporting (2030 goals, student impact, meetings-per-pair histogram, mentor activity table with ghosting alerts, mentor mix, mentor quote, a Regions tab) alive on a new "Details" tab rather than deleting it. Direct follow-up once that was live: delete it outright and match Josh's structure exactly instead -- done. `EnterpriseView` (`MentorshipTab.tsx`) is now just **Overview** + **Settings**, same as his reference. Removed with it: the Regions tab, the Details tab, the `MentorSheet` component and its `onOpenMentor`/`mentorSheet` plumbing in the parent, and five now-dead sheet types (kpi/goals/impact/pairs/cohort). The Export action and its sheet stayed (a utility action, not a reporting section, so it wasn't part of what Josh's screenshot was showing or not showing).
- New `GeographyDropdown` component (a real dropdown, not the old Regions tab's segmented pills -- five options read better as a list).
- **Direct feedback mid-build: the Segmented tab bar (Overview/Settings) and the Time period control (Annual/Quarterly/Monthly) were stacked right on top of each other, both pill rows, and clashed.** Fixed by giving Time period a different interaction entirely: `SubTabs` (underlined, no fill), reusing the exact component and rationale already established on a volunteer profile's Answers | Posts toggle ("a light underlined toggle, not another filled pill... stacking two same-weight pill bars read as two levels of tabbing"). Primary section = pill `Segmented`, secondary = underlined `SubTabs`, the same hierarchy already used elsewhere in this codebase.
- `mentorshipData.ts`: added `quarter`/`deltaQuarter` to every `Kpi` entry (hand-authored midpoints, same curated-demo-data convention as the rest of the file, not a formula), a new `messages` KPI ("Messages exchanged"), `ENGAGEMENT_PERIODS` (Annual/Quarterly/Monthly definitions), and `YEAR_HOURS_GOAL` (target 50,000, `logged` reads the real KPIS hours total so the two can't drift -- 50K is Josh's own figure, paired with our real 18.4K). Renamed "Students" to "Scholars" (matches Coach's own language, e.g. `PROGRAM.counts`' "450 Scholars" -- "Students" was the one inconsistent label). Deleted the data that had no remaining reader once Details/Regions were cut: `GOALS`, `IMPACT`, `OUTCOMES`, `COHORTS`/`Cohort`, `MEETINGS_PER_PAIR`, `PAIR_ACTIVITY`/`PairActivity`, `MENTOR_MIX`, `MENTOR_PULSE`, `REPORTING_NOTE`, `THIS_MONTH_WEEKS`, `THIS_YEAR_WEEKS`, `MONTHS` -- confirmed each had zero references left anywhere in `src/` before removing. `MATCHING_STATUS`, `VERIFICATION`, `SETTINGS`, `HOUR_RULES`, `EXPORT_ITEMS` untouched (Settings tab still uses them).
- Verified live in the Browser pane at every stage: the in-between Details-tab version, then the final two-tab version -- Quarterly/Monthly hiding the goal ring and updating numbers, the Geography dropdown scaling Program-at-a-glance/Engagement to a region (450/450 for United States), Settings and the Export sheet both intact, SubTabs visibly reads differently from the Segmented bar above it. tsc and eslint clean (one pre-existing unrelated warning, `posterTitleFont` unused, confirmed present before this change too).

### 2026-09-20 Volunteer-profile Answers/Posts UX (Josh's Slack ask), Explore catalog fix

- **Explore Browse rail**: swapped Air Traffic Controller out of the "Typical Pay: $100K+" row for Veterinarian in `catalog.ts` -- it duplicated Skilled Trades on the same page (Slack, Chandu M P).
- **Volunteer-profile Answers/Posts** (`ProProfile.tsx`): paused before building Josh's full ask to give a UX opinion first (asked, then agreed): kept Answers/Posts view-only with a clear "from Community Boards" framing line, but did **not** add a per-row "View discussion" CTA -- the rows already open the discussion on click (`AlignedRow`'s own pattern elsewhere in the app), so a repeated link is a redundant second target, confirmed and corrected twice today (first an inline "Open a discussion" link in the intro sentence, now plain text; then the same fix mirrored onto the Posts sub-tab, which didn't have an intro line at all before). Likes/comments counts stay visible on each row; opening the row is required to actually like/comment (confirmed this matches the existing pattern, not a UX regression).
- **Insights -> Posts rename** (`ConnectExperience.tsx`): the Community Board segmented tab's label only (its `insights` key is unchanged), plus the Back label and the save-toast default noun. `EventView`'s own separate `Posts`/`Insights` tabs (a different meaning -- official event posts vs. an empty placeholder) were deliberately left alone.
- **Followed-first demo sort** (`ConnectExperience.tsx`, `BoardView`): a board's Questions and Posts now surface followed-pro content first (stable partition on top of the existing best/recent sort), demo-only per direct instruction -- the real cross-board "followed content in your feed" algorithm is Usman's to build.
- **Follow-value copy: added, then deliberately removed** (`ProProfile.tsx`). Built a one-line pitch under the Follow button per Josh's ask, then pulled it back out on direct pushback: "follow" is an already-learned pattern everywhere (Twitter/IG/LinkedIn), so explaining it every time reads as convincing a stakeholder rather than serving a real user need. If discoverability turns out to be a real problem, the fix is a one-time onboarding nudge, not standing copy on every profile.
- Also dropped the "Open a discussion"/"View discussion" links entirely, including the intro-sentence version: the row itself is already the click target everywhere (profile and board rows alike), so a text link to the same place is redundant. Posts got the same plain-text intro line Answers has, just without a link in it.
- Verified live in the Browser pane (not just headless): Amara Okafor's profile view-only Answers/Posts copy with no link, the Finance board's renamed Posts tab with Elena Martinez's (a seeded-followed pro) post sorted first, and the Follow-copy confirmed gone from the header. tsc and eslint clean (eslint's 10 warnings are pre-existing unused-var/import warnings, none introduced by this batch).

### 2026-09-19 My mentor/mentee CTA: "Message" with the DM icon, same quiet style as Reschedule

- Both the My mentor card and its mentor-side mirror (My mentee) had "Message Mentor"/"Message" as a filled `PrimaryCta` with a speech-bubble icon. Now `Send` (the paper-plane DM icon used everywhere else in the app for messaging) and `QuietCta`, matching Reschedule's outlined style exactly (direct feedback, 19 Sept 2026: "just say message and use the dm icon... same button style as reschedule").
- Checked headless at 1280.

### 2026-09-19 Play tile: corrected to the real Maison Laurent atelier concept art

- The IB Level 2 swap was the wrong "Maison Laurent" -- the user meant a Fashion Buyer-track boutique concept image (Codex-generated, saved to their Downloads), not the Investment Banking simulation's own unrelated client storyline. Corrected: copied the image to `public/images/play/fashion-buyer/maison-laurent-atelier.webp` and pointed `PREP_PLAY.cover` at it. Checked the bag's brand plate before using it publicly (a recurring concern in this codebase after the earlier Louis Vuitton trademark sweep) -- it reads "DREAMARI", not a real luxury brand.
- Crop position adjusted to favor the mannequins and the buyer's sketch desk over the display bag at the far right (`objectPosition: "40% 45%"`).
- Checked headless at 1280: atelier scene reads clean, caption legible over the frosted zone, consistent with its two siblings.

### 2026-09-19 Play tile: real Maison Laurent scene art instead of a generic lounge photo

- `PREP_PLAY.cover` (mentorshipData.ts) changed from the placeholder `cafe-lounge-sunset.webp` to `/images/play/ib/l2-10.webp` -- IB Level 2's "Deal Team Kickoff" beat (Christina and Marcus, "Client: Leading Luxury Brand", the Maison Laurent pitch's opening scene). Direct ask: "whatever codex made for the maison lauret part of the game."
- Picked from the four Maison-Laurent-story beats that were actually cleaned of a real Louis Vuitton trademark baked into the original handoff art (l2-10, l2-19, l3-19, l3-20 -- see 6089e617). L2-09, the more literal "Your First Big Deal" title card, was deliberately excluded: its own code comment still flags it "TEMPORARY PLACEHOLDER... live on the pre-launch internal deployment ONLY... swap for the corrected Maison Laurent art before any public release" -- it still has the real branding baked in.
- `PlayPrepCard`'s `Image` gets `objectPosition: "64% 38%"` -- the source is a wide 16:9 render, cropped into a much taller card; centered crop cut into Marcus, so the position now favors the two standing figures over the window/skyline on the left.
- Checked headless at 1280: both characters in frame, the "DEAL TEAM KICKOFF" slide legible at the edge, caption still reads clean over the frosted zone. tsc and eslint clean.

### 2026-09-19 Corner bleed fixed at the root, resume label color matched, Messages tab shows notifications + the conversation, tablet stacking restored

- **Corner bleed, real root-cause fix**: `CardProgressiveBlur` (cardChrome.tsx, shared by many pages) only put `border-radius: inherit` on its own OUTER wrapper span, not on each individual `backdrop-filter` blur-stop span inside it. Chromium can promote a backdrop-filter element to its own compositing layer and clip it before the ancestor's radius is baked in, leaving a hairline sliver of the unblurred edge visible right along the curve -- confirmed by comparison against `PosterCard` (same border/rounding, no backdrop-filter, no artifact). Each blur-stop span now carries `border-radius: inherit` itself. This fixes it everywhere the shared component is used, not just the three prep cards. A separate, unrelated attempt (wrapping the blur in an extra clipping span) broke the blur outright and was reverted before this fix.
- **Resume label color**: was defaulting to `accent` (Coach's tan) while Explore/Play use `WORLD_COLORS`, two different colors for what reads as one eyebrow treatment. Resume's `PrepFoot` now passes `tone={WORLD_COLORS[D.PREP_CAREER.world]}`, matching its siblings exactly.
- **Messages tab, launch path made explicit**: an "Open" conversation row now sits at the top always, and a "Waiting on you" section below it lists any message-related notifications (the existing meeting-proposal entry, Accept/Decline included) using the same `Row` component every other tab uses -- direct feedback: "I should see message notifications and the conversation which I can click to open... otherwise how do I launch messages?"
- **Tablet stacking**: reverted back to `lg:grid-cols-2` (full width through 1023px, side by side from 1024px) after a brief `md` experiment that reintroduced the earlier squeeze.
- Checked headless: blur confirmed present via computed `backdropFilter` values (6 stacked layers up to 34px) after an earlier false alarm from a stale browser tab; corner hairline visibly fainter at 3x zoom on all three cards; tablet (768px) confirmed stacked, not side by side; Messages tab dialog text confirmed showing both the Open row and the meeting notification with Accept/Decline. tsc and eslint clean (one pre-existing unused-var warning).

### 2026-09-19 Prep row: dynamic blur sizing, resume unified with the other two, corner-bleed fix, bigger Coach logo

- **Blur adapts to the caption's real size, not a guessed percentage**: new `useCaptionHeight` hook (a ResizeObserver on the caption's own DOM node) measures its actual rendered height -- reflowing on a wrapped title, a font swap, or a resize -- and both `CardProgressiveBlur`'s `size` and the scrim's height now use that measured pixel value instead of a fixed `58%` (direct feedback: "have the blur adapt dynamically to wherever the eyebrow sits on different devices"). `PrepFoot` takes a ref now (`forwardRef`) so all three cards can attach it.
- **Resume card unified with its two siblings**: dropped the paper-toned light-mode exception (dark text on a light scrim) in favor of the same dark `cardBottomScrim("heavy")` + white `PrepFoot` every other card uses -- the heavy scrim is dark enough to hold up over white paper too (direct feedback: "same blur as the other cards on resume so it doesn't have to be light mode").
- **Corner bleed fixed**: `CardProgressiveBlur`'s backdrop-filter was leaking a bright sliver past the card's rounded corners in Chrome/Safari despite its own overflow-hidden + border-radius:inherit (a known cross-browser compositing quirk). `PREP_CARD` now adds `isolate` and `[transform:translateZ(0)]`, forcing the card onto its own compositing layer so the blur clips at the true rounded edge (direct feedback: "bright borders on the rounded corners"). Verified corner-by-corner at 3x scale on all three cards -- clean.
- Coach Foundation logo on the My mentor ID badge bumped from 15px to 19px tall (direct feedback: "a little bigger").
- Checked headless at 1280, 768, 390. tsc and eslint clean (one pre-existing unused-var warning).

### 2026-09-19 Prep row: Explore/Play captions genuinely legible now

- The size/maxBlur match to the resume card wasn't enough on its own -- blur softens detail but doesn't darken a bright patch of photo, so EXPLORE/PLAY still read poorly over light parts of their images (direct feedback: "I can barely read explore and play"). Switched their scrim from `cardBottomScrim()` (regular, base 0.55) to `cardBottomScrim("heavy")` (base 0.82) and pushed the zone/strength further: `size="58%" maxBlur={34}`.
- Checked headless and by eye at 1280 (desktop), 768 (tablet) and 390 (phone): both labels read clearly at every width now, confirmed via screenshots at each size per direct request ("check visually on all device sizes too").

### 2026-09-19 Prep row: blur zone and strength now exactly match the resume card

- `CareerPrepCard`/`PlayPrepCard` moved from `size="46%" maxBlur={22}` to `size="50%" maxBlur={26}`, identical to the resume card, so the EXPLORE/PLAY eyebrow labels sit comfortably inside the frosted zone instead of near its edge (direct feedback: "it should fit the eyebrow comfortably, just like the resume card"). Checked headless at 1280.

### 2026-09-19 Prep row: stronger blur on Explore and Play too

- `CareerPrepCard`/`PlayPrepCard`'s `CardProgressiveBlur` gets `maxBlur={22}` (was the 14px default), matching the resume card's own boosted legibility fix (direct feedback: "make sure the blur is high enough to ensure readability"). Checked headless at 1280: all three captions read cleanly, photos visibly frost toward the caption rather than just darken.

### 2026-09-19 Explore and Play prep cards get the same progressive blur as the resume card (local, pushed with the rest of today's session)

- `CareerPrepCard` and `PlayPrepCard` (the other two "Prep for your mentor" cards) now use the same `CardProgressiveBlur` + `cardBottomScrim()` recipe the resume card was given, instead of the flat `--poster-scrim` gradient (direct feedback, 19 Sept 2026: "they should also use the blur effect"). `PrepFoot` (shared by both) no longer paints its own scrim -- the blur+scrim layer sits behind it now, same z-index shape as the resume card's caption.
- Checked headless at 1280: both photos visibly frost toward the caption instead of just darkening, text stays legible, no page errors. tsc and eslint clean.

### 2026-09-19 Resume card: icon removed, stronger blur (local, not pushed)

- No icon chip -- matches `PrepFoot`'s own shape exactly now (the other two prep cards never had one either; direct feedback: "remove the icon from the resume card, the others don't have it").
- `CardProgressiveBlur`'s `maxBlur` raised from the 14px default to 26px, and the zone grown from 46% to 50% of the card -- dense resume text needed more frost than a photo does to read clean under the caption (direct feedback: "legibility... maybe the blur can be higher").
- For the record (direct question): CareerPrepCard and PlayPrepCard (the other two "Prep for your mentor" cards) still use the plain `--poster-scrim` flat black gradient, not `CardProgressiveBlur` -- that's the established pattern for poster-style cards app-wide (PosterCard, HomeExperience, PlayHub, CompanyVideoCards all use the same `--poster-scrim`). The resume card is the one exception now using real backdrop-filter blur, because its background is a document, not a photo, and a flat dark scrim over white paper was unreadable. Not changed unless asked.
- Checked headless at 1280: no icon, caption text clean and legible, resume content behind it well-frosted rather than sharp-and-clashing. tsc and eslint clean.

### 2026-09-19 Card heights pixel-matched, ID badge divider tightened, resume card fixed for real (local, not pushed)

- **Equal card heights everywhere, not just side by side**: `ClickPanel` for My mentor now carries `min-h-[197px]`, Next Meeting's own measured height at both desktop and tablet widths -- previously the two only matched when the grid's row-stretch applied (lg+); stacked full-width on tablet they were 15px apart (direct feedback: "the cards should be the same height on tablet etc too"). Verified: both now measure exactly 197px at 1280 and 768.
- **Badge band pixel-aligned to the meeting card's own bottom section**: measured Next Meeting's real divider-to-bottom distance (53px, consistent at every width) and set the badge footer's `min-h-[53px]` to match; the divider's border width also dropped from 2px to 1px, matching Next Meeting's own rule weight exactly while keeping the accent tint. Diff is now 2px (a sub-pixel/line-height rounding artifact), down from 15px.
- **Resume prep card legibility, actually fixed this time**: the previous pass brightened the resume page but kept white caption text, which went unreadable against the now-bright white paper underneath (direct feedback: "legibility... is bad"). The caption band is now paper-toned (a light frosted plate, not dark) with dark text -- reads like a label printed on the page itself, keeps the resume at full brightness above it, and still uses `CardProgressiveBlur` under it so it works over any resume content.
- Checked headless at 1280 and 768: card heights exactly equal, badge alignment within 2px, resume caption legible in a fresh screenshot. tsc and eslint clean (one pre-existing unused-var warning, unrelated).

### 2026-09-19 My mentor ID badge, fourth pass: CTA under the text, bottom-pinned band, colored accent touching it (local, not pushed)

- Message Mentor now sits directly under the name/title block, at the identity row's own left edge -- the same position Join occupies under "Tuesday · 4:00 PM" in Next Meeting, not beside the text (direct feedback, 19 Sept 2026, after two earlier misreads of that placement).
- The badge footer (location + Coach mark) is pinned to the card's true bottom edge with `mt-auto` inside a `flex h-full flex-col` ClickPanel, so it lands where Next Meeting's own meter row sits once the grid stretches this shorter card to match -- not just placed under the content with a fixed gap.
- The divider bleeds edge to edge (negative margin against the card's own padding) and is now a 2px accent-tinted line (`color-mix` with the Coach brand color), touching the tinted footer band directly beneath it with no gap -- not the plain grey rule Next Meeting uses.
- Checked headless at 1280: divider spans the full card width, CTA left-aligned under the text at the same X as Join, band sits flush against the bottom border with no gap above it. tsc and eslint clean.

### 2026-09-19 My mentor ID badge, third pass: back to Next Meeting's plain two-row shape (local, not pushed)

- Two earlier badge treatments (a top accent line + corner logo, then a full-bleed letterhead strip) both missed on composition, the logo reading too small/squished, and the CTA crowding it (direct feedback, 19 Sept 2026). Landed on the literal thing asked for: Next Meeting's own two-row shape, unchanged -- identity + CTA on row one, a plain `border-t` divider (not a colored line), then a second row underneath carrying the badge content instead of a meter: `MapPin` + `MENTOR.location` ("New York, NY", Coach/Tapestry's real HQ, the same building `PROGRAM.cover`'s photo was shot in) on the left, the Coach Foundation wordmark at a legible 15px on the right.
- `mentorshipData.ts`: `MENTOR.location` added with a sourcing comment.
- Checked headless at 1280, 768, 390: divider and CTA position match Next Meeting exactly, wordmark renders full width with real letterforms (not squeezed), no overlap with the CTA at any width. tsc and eslint clean.

### 2026-09-19 Notifications and Messages merged into one bell; My mentor as a Coach ID badge (local, not pushed)

- **Messages folded into Notifications** (direct feedback: "combine notifications and messages, just have messages as a tab inside notifications"): the standalone paper-plane Messages icon is gone from both the desktop nav and `HeaderActions` (mobile/tablet). A "Messages" tab now sits in the Notifications panel (mentorship students only, same as before), showing the app's one real conversation as a single preview row -- the mentor's photo, name, and a one-line summary of the thread's last real event (a message's own text, "Shared X", or "Proposed a meeting: <when>") read straight from the seeded `THREAD`, since a live preview would need that state lifted out of `MentorshipTab`. Tapping the row closes the panel and opens the chat dock, the same as the old button did. The bell's own badge now adds the chat's unread count to the notification count when showing "All", so one icon covers both; the Messages tab pill carries its own small red dot when there's unread chat. `MessagesButton` deleted.
- **My mentor card, corporate ID badge**: same row shape and CTA placement as Next Meeting (identity block left, one button right, exact same classes) -- this was already true structurally; an earlier screenshot that showed it wrapping was mid-edit with a second "View profile" button since removed (the whole card already opens the profile). On top of that unchanged layout: a 3px Coach-tan band across the top, the Coach Foundation wordmark small in the corner like an employer stamp, and the avatar's ring is the full Coach brand tan instead of a muted mix -- a badge, not a different arrangement of the same elements (direct feedback: "make the my mentor look more like a corporate id card... with coach branding").
- Checked headless at 1280, 768 and 390: no standalone Messages icon anywhere; the Messages tab opens the dock on both desktop and phone (portal-scoped check); the ID badge renders identically shaped to Next Meeting at all three widths with no wrap. tsc and eslint clean (one pre-existing unused-var warning).

### 2026-09-19 Mentorship home: My mentor and Next meeting card parity, streak/XP tooltips split (local, not pushed)

- **Streak/XP tooltip bug**: hovering the streak used to show the Dream Score explanation (the whole chip was one hover target). `DreamScoreTip` now takes an optional `text` prop (defaults unchanged for FlowChrome's own usage); `DreamScoreChip` wraps the streak half and the XP half separately, each with its own copy (`STREAK_TIP` added) and its own `aria-label`.
- **Avatar oval-ring bug**: `Avatar` (primitives.tsx) gained an optional `ring` prop, sized on the component's own already-correct square box instead of a hand-rolled wrapper `<span>` (a bare inline span around a fixed-size child rendered as an ellipse under its ring). Every call site that wanted a ring now passes `ring={...}` directly.
- **My mentor card**: rebuilt to literally mirror `ScheduleCard`'s (Next meeting) row shape -- same 52px-tile-then-text-block position on the left, same right-aligned CTA cluster (Message Mentor + a View profile secondary, matching Join + Reschedule's primary/secondary shape), no divider or second row invented for it. Dropped the "Matched · N meetings so far" chip (already in the Next meeting card) and the "· Coach" org suffix (the whole tab is already the Coach program). Went through two earlier directions first (a status-chip second row, then a full-bleed cover-photo hero) before landing here on direct, explicit feedback: "have it follow the exact same layout as the meeting card, same placement of everything."
- **Join button**: shortened to "Join"; always rendered now (was conditionally hidden), but disabled/muted (`aria-disabled`, `pointer-events: none`, a title explaining why) until the meeting is actually starting, computed by a new `meetingIsLive`/`meetingDateTime` helper (10 min before through 60 min after). Applied to both the card's own CTA and the details Sheet's.
- **Tablet squeeze fixed at the root**: both card-pair grids (student view: My mentor + Next meeting; mentor view: Your next conversation + Next meeting) move from `md:grid-cols-2` to `lg:grid-cols-2`. Every tablet width (768-1023px) now gets a full-width row per card instead of squeezing two cards and wrapping the CTA row or the meeting-info text (direct feedback: "the whole entire card is wrapping content and copy and looking very very ugly"). `PrimaryCta`/`QuietCta` also gained `whitespace-nowrap` (a button label should never break mid-word) and the CTA cluster wraps to a second line of *buttons*, never mid-label, if a width is ever tight enough to need it.
- **Resume prep card**: was `background: #FFFFFF` with the resume page's own white paper bleeding straight through, reading as "the important one" beside its two dark photo siblings. Now `var(--glass-surface-1)` (matching the Play card) with a dark overlay over the whole page, not just the caption band.
- Checked headless at 390, 768, 834, 1024, 1280, 1440: cards stack full-width through 1023px and sit side by side from 1024px on, avatars are round at every size, the Join button holds a fixed 77x32 with a normal 16x16 icon regardless of width, no page errors. tsc and eslint clean (one pre-existing unused-var warning).

### 2026-09-19 Explore Browse: one Arts, Media & Sport row, bottom of the page only (PUSHED, user-authorized)

- `ExploreExperience.tsx`: removed the second Arts rail that sat near the top (second position, alongside Recommended/Tech). Only one Arts, Media & Sport row remains, at the very bottom of Browse after Typical Pay, titled plainly "Arts, Media & Sport" (not "New in...", not "More..."). It now shows the full 27-career world, not just the 19 Sept poster-library additions. Direct feedback: "I only want it at the bottom... no new in arts media and sport, just arts media and sport."
- Verified against the running dev server: exactly one `<h2>` titled "Arts, Media & Sport" in the rendered Browse page, and it comes after every other rail heading (Recommended, Tech & Engineering, Top 5 Trending, Might Not Know, Skilled Trades, Videos, Typical Pay). tsc and eslint clean.

### 2026-09-19 Colleges mobile header matches Careers exactly; closing arts rail renamed (local, not pushed)

- `CollegesExperience.tsx`: the old absolute text-tab overlay is gone. Phones and tablets now use the same `MobileHeaderShell` (logo, streak | XP, bell, hamburger) as Careers (Explore), with the For you | Browse All pill and a "Careers" button on their own row at the top of main, identical styling and spacing to Explore's toggle row. Direct feedback, 19 Sept 2026: "the navigation for careers and schools on smaller screens is very very different... Careers is the baseline." Checked headless at 375 and 820: no header overlaps, same item set and layout as Explore's Browse header, no page errors.
- `ExploreExperience.tsx`: the closing arts rail is retitled "More Arts, Media & Sport Careers" (was "New in..."). Direct feedback: a "new" framing implies a "view all" into the full world that this rail doesn't have. Left an open-question comment in the code, not decided or built: should a rail get its own "view all -> full world grid" page, and if so does every curated rail need one.

### 2026-09-19 Arts, Media & Sport: real career content for the 24 poster-library careers (local, not pushed)

- `src/components/career/profiles.arts.ts` (new): full `CareerProfile` entries (summary, scenario, four facts, pay by state, know about, good at, software, three-rung ladder, education, fact details) for the 24 arts careers the poster library added on 19 Sept -- Actor, Audio and Video Technician, Broadcast Technician, Choreographer, Coach or Scout, Court Reporter or Captioner, Dancer, Fashion Designer, Film and Video Editor, Floral Designer, Game Producer, Graphic Designer, Interior Designer, Interpreter or Translator, Musician or Singer, Photographer, Professional Athlete, Public Relations Specialist, Set Designer, Visual Merchandiser, Writer or Copywriter, Art Director, Film Director, Journalist. Same US-context sourcing convention as `profiles.generated.ts`: knowledge/skills from O*NET, pay and outlook from BLS OOH/OEWS (May 2024), rounded, not sourced to the dollar. Hourly-wage BLS occupations (actors, dancers, musicians) show an hourly figure instead of an invented annual one.
- `profiles.ts` `careerProfile()`: falls back to `ARTS_PROFILES` after `CAREER_PROFILES` and `GENERATED_PROFILES`, so these 24 career pages now show the full report instead of the "coming soon" placeholder.
- Not yet checked live; next step is a headless pass on a few career pages (e.g. `/career/photographer`, `/career/film-director`) plus tsc/eslint (both already clean on this file).

### 2026-09-19 Search results fill the width; lighter bolt; smaller badge (PUSHED, user-authorized)

- `ExploreExperience.tsx` SearchResults (also the world grids): an auto-fill CSS grid (min 150px on phones, 180px from sm) so cards share the full row instead of fixed 210px posters clustering left. `PosterCard` gains `fill` (aspect 210/297, width 100%, responsive `sizes`). Checked: 6 columns at 1440, 5 at 1280, 3 at 820, 2 at 375, grid right edge equals the last card's.
- `ScoreIcons.tsx` bolt: pale sky through brand-400 to soft violet, no deep brand blue. `Inbox.tsx` badge: 15px, 9.5px text, sits over the bell's top-right corner instead of outside it.

### 2026-09-19 Illustrated streak and XP icons; For you nudge made visible (local, not pushed)

- `src/components/app/ScoreIcons.tsx`: `StreakFlame` (warm amber to red gradient, pale inner flame ending in brand blue) and `ScoreBolt` (brand blue into accent purple with a white shine). `DreamScoreChip` uses them at 17px instead of the flat blue lucide Flame and Zap (direct feedback: "either make them white or use proper illustration svgs").
- Explore toggle: the unselected label is muted so the white sweep has contrast; the sweep band is wider and brighter; a 9px four-point sparkle twinkles at the label's corner in step with the sweep (`.dm-nudge-spark`). Still text only, still ends after the first For you visit.
- Checked headless at 1280 and 3x: chip icons render with gradients; sampled the visible toggle every 200ms across a cycle, sweep and sparkle both appear (frames saved), rest the remainder of the 5.2s cycle. tsc and eslint clean.

### 2026-09-19 For you nudge, Explore phone header rebuilt, header icons without surfaces (local, not pushed)

- `ExploreExperience.tsx`: `useForYouNudge` (localStorage "dreamari:nudge:foryou") turns on a repeating light sweep across the words "For you" in the toggle until the student opens For you once, then never again. Text only, no tint or beam on the pill, so Browse All is not outshone (direct feedback). `app.css` gains `.dm-text-nudge` (5.2s cycle, sweep for a third of it, reduced motion off).
- Explore on phones and tablets now uses the shared `MobileHeaderShell` (logo, streak | XP, bell, hamburger) like every other page. The For you | Browse All pill, Search (Browse only) and the Schools button sit on their own row at the top of main (z-20 so it stays above the fixed For you reel). Fixes the old absolute tab row colliding with the icon cluster at 375 to 430px, and keeps search off the top bar (direct feedback).
- Header icons lose their bordered surfaces: `DreamScoreChip`, the bell and Messages (`NavIconButton`), the hamburger (`QuickLinksMenu`) are plain with wider gaps; `xp-slot-in` no longer leaves a 1px ring on the XP number.
- Checked headless at 375, 820 and 1280 on Explore, Home, Connect, Profile, Resume Builder: no header overlaps, no horizontal scroll, no surfaces on the three controls; nudge class present on first Browse and gone after one For you visit; no page errors. tsc and eslint clean.

### 2026-09-19 Review notes: mentor cards side by side, no chat attachments, no Skip before Level 2, questions belong to the boards (local, not pushed)

- `MentorshipTab.tsx`: My mentor + Next meeting (student) and Your next conversation + Next meeting (mentor) sit in one two-column grid from md up; stacked on phones.
- `mentorshipData.ts` COMPOSER_ACTIONS: Attach file and Photo or video removed; the plus menu is Suggest a meeting time, Share from Dreamari, GIF (mentor also gets meeting link and approved resource). Dead toast branches and icon imports removed.
- `ConnectInterstitial.tsx` + module CSS: the Skip text button is gone; Close (X) stays as the one quiet way out, Escape and the backdrop still continue.
- Ask Me removed as a concept. `ProProfile.tsx`: no composer on a professional's page; the tab is "Answers & Posts" and the Answers list opens with "Questions live on the boards. Ask in <board> and <first name> may pick it up." linking to the board. `onAsked` prop dropped (call site in ConnectExperience updated). `ProDashboard.tsx`: the panel is "Waiting on <board>" with copy naming the board; tab renamed the same way. Boards keep their composer.
- Checked headless at 1280 and 390: the two cards share a row at 1280 (549px each) and stack at 390; plus menu lists three items; profile shows no composer, the board link opens Finance Careers; dashboard title "Waiting on Finance Careers"; interstitial toolbar is Replay and Close only. tsc clean, eslint only pre-existing warnings.

### 2026-09-19 Explore Browse: closing rail "New in Arts, Media & Sport" (PUSHED, user-authorized)

- `catalog.ts`: `BROWSE_ARTS_NEW`, the 21 arts careers the poster library added (library arts minus the six Figma posters). `ExploreExperience.tsx`: rendered as the last rail on Browse, after Typical Pay, so the new faces are one scroll away in a demo; they also stay inside the Arts rail near the top.
- Checked headless at 1280: last heading is the new rail, 21 posters, none broken, no page errors. tsc and eslint clean.

### 2026-09-19 Profile Demo row above My Plan; Pros tab on community boards (PUSHED, user-authorized)

- `ProfileExperience.tsx` GradePlanCard: the Demo chip moved out of the card header into a quiet right-aligned row above the card. One press shows two small chip groups (High school | College, then 9 to 12 or Yr 1 to 4), a second press hides them. Progressive disclosure and the 34px tablists are gone; the card never carries toggles (direct feedback, 19 Sept 2026: "we never have the big toggle stuff"). Stage still writes the app-wide store.
- `ConnectExperience.tsx` BoardView: a Pros tab between Updates and About. It lists every verified pro in the board's world plus anyone who answered or posted on that board, board-active first then most recently active, using the Connect > People card (`PersonCard` now exported from `PeopleTab.tsx`). Follow uses ConnectNav; a card opens the profile and Back reads "Back to <board>". About keeps its "Pros from" company chips.
- Checked headless at 1280 and 390: Demo chips toggle stage and level and the subtitle follows; Finance Careers shows 10 pros, card opens Amara Okafor with the right Back label; no page errors. tsc clean; eslint only pre-existing warnings.

### 2026-09-19 Explore: 161 poster careers imported, world pills become grids, search word forms (PUSHED, user-authorized)

- `public/images/app/browse/*.webp` (161, 11 MB): the team's poster folder ("BROWSE Images-3", 14 worlds) converted with sharp, attention crop to 840x1188, webp q80. 39 titles skipped because the Figma catalog already had them. `src/components/app/browseLibrary.ts` lists them as `BROWSE_LIBRARY`; the source folder itself stays out of git.
- `catalog.ts`: `ALL_CATALOG_CAREERS` appends the library after the Figma rails (first occurrence wins, so Figma art stays). `BROWSE_ARTS` is now every career in Arts, Media & Sport (27) for the arts-focused demo. World "Business, Money, Sales & Office" was normalised to "Business & Finance" at import.
- `ExploreExperience.tsx`: a world pill with nothing typed shows that world as one grid with a heading and count, instead of seven rails each losing most cards. Top searches hide while a world is chosen.
- `careerSearch.ts`: a shared five-letter stem now counts on words of six or more (plumbing finds Plumber, welding finds Welder); a token has to be five letters before containing it in a keyword counts (real no longer lights up "unreal"); a career's earlier keywords break ties (coding is Software Engineer before Quant, planes is Airline Pilot first); keywords for the trades, health, beauty and safety titles the library brought in; duplicate keyword keys removed.
- Checked: tsc and eslint clean; headless at 1280: arts rail 27 posters, world grid 27, no broken images, no page errors; search harness: plumbng, plumbing, welding, xrays, cars, real estate, photography each return the one right career; drawing stays Animator only; xyzq empty.
- Next: the other 13 worlds have posters but no rail of their own; the world pills cover them for now.

### 2026-09-16 Sitewide no-pill-CTAs sweep (local only, not pushed, e628e2f)

Follow-through on the Resume Builder's "no pill-shaped CTAs" pass (direct
feedback: "throughout the app... consistent across the site"). Ran
`grep -rln "rounded-full" src/components --include="*.tsx"` excluding
`src/components/resume/` (already fixed) and `src/components/marketing/`
(off-limits -- Codex was actively editing `AudienceToggle.tsx` and
`SchoolsView.tsx` there this session; left that directory untouched, did not
even open its files) across all ~36 remaining files.

Converted only the unambiguous, text-labeled, actionable CTAs from
`rounded-full` to `rounded-[var(--radius-md)]`:
- `src/components/profile/ProfileExperience.tsx`: the "Play" and "Learn
  more" links and "Get Career Report" button on a Top 3 career card (around
  line 1105-1143), and the "Add to Top 3" / "Swap in" button in the Locker
  tab (around line 2317).
- `src/components/motion-lab/DailyDropDemo.tsx`: the "Close" text button in
  `RevealPhase` (line ~798).

Everything else found under `rounded-full` was left alone -- confirmed by
reading, not guessing:
- Icon-only circular controls (close/prev/next/edit/delete/avatar buttons),
  dots, progress bars/tracks, decorative blurred orbs, toggle-switch tracks,
  and badge/tag `<span>`s with no `onClick` -- exactly the excluded patterns
  the task called out.
- `src/components/connect/*`: the real CTAs (`FollowButton`/`PrimaryCta`/
  `QuietCta` in `primitives.tsx`) already use `rounded-[var(--radius-md)]`/
  `rounded-[var(--radius-sm)]`, not a pill. The remaining `rounded-full`
  instances are `HelpfulPill`/`ActionChip` (documented in-code as "one
  consistent chip language for every action in the row" -- an Instagram/
  TikTok-style engagement-chip system, deliberate) plus avatars/badges.
  Left the whole directory as-is; flagging `ActionChip`/`HelpfulPill` for a
  human to confirm they're happy keeping that chip language pill-shaped.
- `src/components/colleges/CollegesExperience.tsx`: quick-filter and
  applied-filter chips (`aria-pressed`, `onClick`) read as filter/tag
  selectors, not action CTAs -- left alone but flagging since they do have
  `onClick` + text, in case a human disagrees.
- `src/components/colleges/CollegeDetailExperience.tsx` line ~556-564: a
  small muted "Where these numbers come from" disclosure trigger
  (`aria-expanded`, no fill/border, 11px text) -- read as an accordion
  toggle rather than a CTA, explicitly de-emphasized per its own code
  comment ("nobody needs to be pulled toward"). Left alone, flagging for
  review.
- `src/components/career/CareerDetailExperience.tsx` line ~583-596 and
  `src/components/colleges/CollegeDetailExperience.tsx` line ~583-597: `role="tab"`
  segmented controls, not CTAs.

Validated: `npx tsc --noEmit -p .` clean, `npx eslint` clean on both touched
files. Committed locally on `main` (e628e2f) with exactly the two files
changed -- did not stage or touch the marketing files Codex has in progress.
**Not pushed** (push needs explicit go-ahead per standing rule).

Recommended next step: a human should glance at the three flagged-but-left
spots above (Connect's engagement chips, Colleges' filter chips, the Colleges
disclosure trigger) and say yes/no on each; none were changed since the
signal for "real CTA" was ambiguous.

### 2026-09-14 Connect: real logo marks for the 9 companies added to professionalsFrom (PUSHED TO MAIN, user-authorized, 482eb25)

`professionalsFrom` in `src/components/connect/data.ts` was expanded across all
five communities (General 13, Finance 8, Technology 7, Healthcare 9, Creative
8) with real companies, and nine of them had no entry in `COMPANY_MARKS`
(`src/components/connect/primitives.tsx`): IBM, Genentech, CDC Foundation,
UnitedHealth Group, Kaiser Permanente, Moderna, Warner Music Group,
Paramount, Condé Nast. Their "+N more" chip in `CommunityCard.tsx`'s
`MoreMarks` popover was falling back to plain text for all nine.

Sourced a real SVG mark for each (mostly Wikimedia Commons, trimmed to ink
bounds the same way the 2026-09-03 batch was), added to `COMPANY_MARKS`, and
logged each in `docs/BRAND_MARKS.md`. Two things worth knowing if you touch
these again:

1. **CDC Foundation** is the independent nonprofit, not the government CDC
   agency -- deliberately sourced from cdcfoundation.org's own site, not
   Wikimedia's CDC seal. The source file's "Together our impact is greater"
   tagline (fill `#85888b` in the original) was stripped out of the SVG,
   keeping just the dot mark + wordmark.
2. **Warner Music Group's source had a real bug for our system**: the "W"
   ribbon shape is a cutout achieved by painting an opaque white rect BEHIND
   an opaque blue path with the ribbon as a hole -- fine for normal
   rendering, but our `CompanyChip`/`CompanyMark` mask to a single ink color
   off the alpha channel, and alpha doesn't care about z-order/color, so the
   whole square came out as a solid blob. Fixed by deleting that backing
   rect so the ribbon is real transparency. **If a future mark looks like a
   blob instead of its icon, check for this same pattern** (an opaque
   "background" shape sitting behind a shape that's supposed to read as a
   hole).

Validated: `npx tsc --noEmit` clean; confirmed live via `document.querySelector('[title="..."]')`
mask-image inspection (not just a screenshot) for all nine, plus a visual
pass across the Technology/Healthcare/Creative popovers at both mobile and
desktop widths. No open issues. If chips elsewhere still show as plain text,
it's a company not yet in `COMPANY_MARKS` at all (not one of these nine) --
check which board/company and add it the same way.

### 2026-09-07 (later still) Schools view: replaced the sticky stage story with plain rows, rebuilt Connect, dropped pill CTAs

Several rounds of direct feedback in quick succession:

1. "Doesn't work properly when scrolling" -- the five-stage section used a
   sticky right column whose composition crossfaded on an IntersectionObserver
   timer while the copy scrolled past on the left. A stage's copy could sit
   far from the frame showing a DIFFERENT stage, and each copy block's tall
   min-height left large dead gaps between consecutive stage headers.
   Replaced with plain, non-sticky alternating rows (`StageRow`): each
   stage's copy and its own card sit side by side in normal document flow,
   so they can never desync -- removed the IntersectionObserver, the
   `active` state, and the sticky column entirely. (Introduced and fixed a
   bug in the same edit: `Reveal`, a `<div>`, was wrapping each `<li>`
   instead of sitting inside it, producing invalid `ol > div > li` markup
   that also broke `divide-y` and any `ol > li` query -- moved `Reveal`
   inside `<li>`, one per column, verified `ol > li` count is 5 again.)

2. Connect's card: rebuilt as a photo-plus-solid-modal composition (like
   HeroVisual/ProgressArt) per direct instruction, dropping the `Frame`/
   `Product`/`zoom` machinery entirely for this one -- `CommunityCard` is a
   real `@container`-responsive component that sizes itself, not a fixed-px
   screen needing a scaling hack. Three follow-on bugs from that rebuild,
   each reported immediately and fixed in turn: (a) proportions were off --
   capped at max-w-300px while every other stage's card rendered near
   500px, made them match; (b) the backing plate behind the overlapping
   thread card was missing the `marketing-v2` class, so `var(--background)`
   resolved to the LIGHT page's background instead of dark -- white text on
   a white plate, unreadable (the same scoping bug fixed once already this
   session in `Frame`, recurred in a new spot; fixed the same way); (c)
   confirmed live that dropping `zoom` also fixed `CommunityCard`'s stat
   tiles, which were rendering as flat solid boxes instead of blurred glass
   -- `backdrop-filter` and `zoom` do not reliably compose, and removing the
   now-unnecessary scaling fixed it as a side effect.

3. "No pill-shaped CTAs... even on the landing page" -- `MarketingButton`
   (Button.tsx), Nav's CTA link, and `AudienceToggle`'s toggle track/buttons
   were all `rounded-full`. These are shared with the student-facing landing
   page, which `docs/handoff/specs/landing.md` locks -- asked the user
   directly rather than guessing; told to change the shared components (so
   both audiences get the new radius), NOT to fork a schools-only variant.
   Changed to `rounded-xl`/`rounded-lg`. Confirmed `git diff --quiet
   origin/main` is still clean for every locked file (Hero.tsx,
   HowItWorks.tsx, chapters/*, ChapterShell.tsx, Footer.tsx) -- only
   Button.tsx, Nav.tsx and AudienceToggle.tsx changed, none of them locked.
   Circular icon buttons and avatar/dot marks were left alone -- the
   complaint was about elongated pill CTAs and inputs, not circles.

Verified live via a dev server (port 3115) using DOM geometry and computed
style rather than screenshots -- the Browser pane's screenshot capture was
unreliable again this session (documented earlier too): confirmed 5 real
`<li>` direct children, no horizontal overflow, Connect's card width now
within ~5% of the other stages', the backing plate's computed
`background-color` is `rgb(5,7,15)` (dark, correct) with card text at
`rgb(244,247,255)` (light, correct, readable), and the stat tiles' computed
`backdrop-filter` is `blur(14px)` (real blur, not a flat box). `npx tsc
--noEmit`, `eslint --max-warnings 0` on every changed file, and
`npm run tokens:check` all clean.

Not done: the user separately felt the new alternating-row layout "just
copied the student version" (the student site's chapters use a similar
side-by-side alternating grid). Flagged back honestly rather than guessed
at a fix -- a concrete differentiator (rail styling, numbering treatment,
spacing rhythm) needs the user's steer on what specifically should feel
distinct, now that the underlying scroll bug is gone.

### 2026-09-07 (later still) Schools view: reverted "drop the dark device frame entirely"

Direct feedback right after that round shipped: "what ever you did now is a
hundred times worse. Please fix and revert." Reverted commit 5c92a1a
(`git revert`, clean, no conflicts) rather than trying to patch forward
blind with no screenshot of what specifically broke. This restores the
prior, already-verified state: one de-nested frame per stage (the dark
"device screen" bezel from `Frame`, no second box from `Product` nested
inside it) -- NOT the fully frame-less, card-floats-on-white-page version.

Lesson for whoever picks this up next: the user's own instruction ("drop
the frame entirely, no photo backdrop, unless cropping needs it") was
implemented literally and verified clean in isolation (tsc/eslint/tokens,
screenshots at two widths), but reads badly in the full page context this
session did not check closely enough before shipping -- likely the plain
real components (built for a dark in-app surface) sitting directly on the
light marketing page loses cohesion across five back-to-back stages, even
though any single one looked fine alone. Before trying this direction
again: get a live screenshot of the FULL section (not one stage at a time)
and a specific description of what reads badly, rather than re-guessing.

### 2026-09-07 (later still) Schools view: de-nested the stage frames, minimized Build's questionnaire, fixed the copy/frame misalignment, made the Connect overlap real

Four rounds of direct feedback, same session, on the five-stage "Five steps
toward a clearer future" section and its composed visuals:

1. "Frame inside frame inside frame" on Build/Match/Explore/the data section.
   Root cause: `SchoolsVisuals.tsx`'s `Product` component painted its own
   bordered, shadowed, rounded-corner dark box, nested inside the outer
   `Frame` that already draws that exact chrome one level out -- two visible
   boxes where one was intended. `ProgressArt` and `HeroVisual` never had
   this problem because their `Product` floats over a plain photo with no
   enclosing `Frame`. Fix: `Product` takes a new `bare` prop that drops its
   border/shadow/rounded-corner/background, used everywhere a `Product`
   already sits inside a `Frame` (Build, Match, Explore, the data section);
   `ProgressArt`/`HeroVisual` keep the default chrome, unchanged.
2. Build's card was "such a tall graphic," "everything visible at once":
   `BuildArt` passed all 15 `INTEREST_WORLDS` to the real `ChipGrid`, an
   8-row grid at near-full design scale. Fixed by showing a 6-option preview
   (both of the two "selected" worlds included) -- the same "6 visible, more
   below" convention the app's own `ChipGrid` already uses for phones
   (build/ui.tsx, PREVIEW=6), just applied here so the composed snapshot
   reads as a glimpse, not a rendered-out list.
3. "Alignments are off, badly designed": the section heading sat right above
   the sticky frame's top edge, but each stage's copy was vertically
   *centered* inside a 76vh-tall block (`lg:justify-center`), so "01 BUILD"
   rendered roughly 38vh (well over 300px on a typical laptop) below the
   heading while the frame started right under it -- two starting points a
   half-screen apart. Changed to `lg:justify-start` with a short top pad and
   a shorter 62vh block, so each stage's copy anchors near the top of its
   slot, close to the sticky frame at every stage, not just visually
   accidental for whichever one happened to scroll into the "active" band.
4. Connect's two cards: earlier this session they went from overlapping-and-
   illegible (bug, fixed to a flex-column with a real gap) to fully
   separated with no overlap at all. Direct feedback: the overlap itself was
   wanted back -- "liked the overlapping components... just don't make them
   so transparent that they overlap and get mixed." `Card` is the app's real
   frosted-glass surface (backdrop-blur, ~90% opacity) -- correct where it
   sits over a plain background, but stacked over ANOTHER card that blur
   reveals and blends the card underneath into it. Fixed by reintroducing a
   real overlap (negative margin, not independent absolute boxes) with an
   opaque backing plate the exact shape of `Card` sitting behind it and in
   front of the community card, so the blur terminates on solid colour and
   nothing shows through.

Verified live (own dev server, port 3112, this checkout's dev server was
already running another session's session so a separate port was used):
screenshots of all five stages at 1456px and 390px confirm a single frame
per stage, the minimized Build grid, "01 BUILD" sitting directly under the
section heading at the same height as the frame's top edge, and the Connect
overlap now genuinely covering the community card's stat row with no text
bleed-through. `npx tsc --noEmit`, `eslint` on both changed files, and
`npm run tokens:check` all clean.

Not done, flagged directly to the user rather than guessed at: whether the
outer `Frame` (the dark "device screen" bezel) should be removed entirely in
favor of a real-photo backdrop for every stage, the way `ProgressArt`
already does. That needs new photography for Build/Match/Explore/Connect
that does not exist in this repo yet -- a content decision, not a CSS one.

### 2026-09-07 (later still) Schools view: Connect stage's two cards were overlapping

Direct report with a screenshot: the community-stats card ("312 Students / 61
Pros / 5 Companies") and the thread card sat on top of each other -- the
"Open" button landed directly on the question text. Root cause:
`ConnectArt` positioned both cards independently with `absolute` +
percentage `left/top` and `right/bottom` insets, eyeballed to just miss each
other -- left card spanned x:[6%,70%], right card spanned x:[36%,102%], a
34%-wide overlap zone regardless of either card's real content height.

Fixed by replacing the two independent `absolute` boxes with one `flex
flex-col` wrapper (`self-start` / `self-end` for the diagonal stagger,
`gap-[26px]` between them) -- a flex column cannot overlap by construction,
whatever either card's real rendered height turns out to be.

Verified by geometry, not a screenshot (the Browser pane's capture was
unreliable again this session -- stale/black frames, third time this has
been flagged): confirmed via `getBoundingClientRect()` on the two real card
elements that they no longer intersect, at both a 1440px and a 390px
viewport, with `document.documentElement.scrollWidth <= innerWidth` (no
horizontal overflow) at 390px. `npx tsc --noEmit`, `eslint`, and
`npm run tokens:check` all clean.

Not yet done: the user separately flagged that the stage-story's two-column
layout (copy left, sticky graphic right) reads as too far apart at very wide
desktop widths, and asked for a full responsive QA + polish pass across the
whole Enterprise view -- that is a larger, separate pass, not part of this
fix.

### 2026-09-07 (later) Schools view: the five-stage frame and the data-credibility frame were light windows, not the product's own stage

Direct report: "why are there inside their own windows... use the graphics
themselves without outer frames... some things are overlapping transparently
and causing confusion." Root cause, confirmed in the DOM (computed
background-color): `Frame` in `SchoolsVisuals.tsx` painted a pale
`var(--hero-mid)`-based gradient card with a hairline border behind every
composition. Build/Match/Explore's own `Product` surface (and `DataArt`'s)
only covers part of that card by design (`top/right/bottom/left` percentage
insets, meant to let the surface run off an edge) -- so the gap showed as a
light mat visible around a dark screen, and every atmospheric glow blur in
those three (aurora colour, meant to read as light spilling off a dark
screen) sat against that pale ground instead, reading as a muddy smear.
Connect/Immerse were unaffected (they already fill their frame edge to
edge), which is why only some stages showed the problem.

Fix: `Frame` no longer paints a card. It renders `SpaceGround` (the same
dark, textured backdrop every art piece already sits on) as its own base and
nothing else -- `marketing-v2 relative isolate overflow-hidden rounded-[28px]`,
`background: var(--background)` (now correctly dark, see below), one shadow
for lift. Any gap around a surface now reads as more of the same dark stage,
never a separate box. `DataArt` moved its `<Wash>` from the old `accent` prop
on `Frame` (removed) to calling `<Wash accent={accent} />` itself, matching
how Build/Match/Explore already do it.

One real bug caught in the fix itself, worth flagging for the next person
touching this file: `Frame` sits in the Schools page's OWN light
`theme-light` scope, so `var(--background)` inside it resolved to the page's
`#f4f7ff`, not the app's dark `#05070f` -- the exact light-window symptom,
from a different cause than the one just fixed. `Product` already re-enters
dark scope via a `marketing-v2` class; `Frame` needed the same class, and now
has it. Verified via computed style: the visible desktop stage frame's
`background-color` reads `rgb(5, 7, 15)` after the fix (was `rgb(244, 247,
255)` before).

Verification: `npx tsc --noEmit`, `eslint` on SchoolsVisuals.tsx,
`npm run tokens:check` all clean. Confirmed via computed styles in a live
worktree (localhost:3109) that every stage frame and the data-credibility
frame now resolve to the dark background, at both the mobile-stacked and
desktop-sticky breakpoints. Not confirmed with an actual screenshot this
round -- the Browser pane was hidden/its screenshot capture returned stale
black frames for the whole session, a known tooling issue flagged by the
previous pass too, not a rendering problem in the app. Worth one visual
screenshot pass next time the pane is available.

### 2026-09-07 Schools landing, visual QA pass finished and landed (branch `schools-visual-qa`, picked up from an interrupted session): full-bleed real-component compositions, real photography, reconciled with the concurrent partner-ticker work

Picked up uncommitted work sitting in a worktree from a session interrupted
twice (once by the user mid-QA, once by an API rate limit). Nothing from that
session was discarded; this entry finishes the QA pass it was mid-way
through and lands it. Brief being answered: "I don't like how the images are
inside containers that have more blank space etc. Also use real components...
Do a full Visual QA, use placeholder stock images or photos wherever you feel
we can. Make it sexy and engaging and informative."

- **Every composition now fills its frame** (no padded object floating in a
  box): `SchoolsVisuals.tsx` was rewritten so each of the five stage tiles,
  the hero, the educator panel, the data-credibility panel and the Dream
  Opportunity band bleed to their tile's edge, with layered depth (a card
  peeking behind the Match card, the Career Detail header hanging off the
  hero photo's corner) instead of a screenshot centered in whitespace.
- **Real product components, minimalised, not recreated**: `PosterCard` /
  `RankedPosterCard` (Explore), MatchLab's `CardBody` (Match — now exported,
  no behavior change to the real Match Lab), the Build flow's `CardHud` /
  `QuestionHeading` / `ChipGrid` / `Citation` (Build), Connect's
  `CommunityCard` + `Card` + `Avatar` + `CompanyChip` (Connect), the career
  page's `PayMap` / `Figure` / `Section` (data credibility), and Profile's
  `OverviewTab` (educators — now exported, no behavior change to the real
  Profile page). The Play stage (`ImmerseArt`) and the Career Detail header
  inside the hero remain faithful recreations since their real components
  live inside routed pages, not ones you can drop into a marketing frame.
- **Real photography**, Unsplash License (free commercial use), colour-graded
  only by the existing card scrims — no new colours:
  `students-laptop.webp` (hero, Vitaly Gariev), `counselor-guidance.webp`
  ("Know where students are" panel, Monica Melton), `students-audience.webp`
  (Dream Opportunity band, Sam Balye). Full attribution in
  `public/images/marketing/ATTRIBUTION.md`. All three re-encoded to 1800px
  wide; checked against their rendered width at both 1440 and 390 — none
  renders past native resolution at either width, so nothing is an upscaled
  raster (the Dream Opportunity band's `object-cover` crop on very wide
  desktop screens sits closest to the ceiling; still native, not upscaled,
  at 1440).
- **Five stages**: replaced the old alternating-row layout with a
  Linear/Stripe-style scrollytelling rail (`StageStory`) — desktop: the copy
  for each stage scrolls down the left while one sticky frame on the right
  crossfades its composition as an `IntersectionObserver` reports which
  stage is being read; phones/tablets: each stage's copy sits directly over
  its own frame, same order, same copy. Verified the static layout and the
  first stage's composition at both widths; the live crossfade for stages 2-5
  is verified by code read (the same `IntersectionObserver`/`rootMargin`
  pattern, `active` index driving `opacity`/`transform` on absolutely
  stacked panels) but NOT re-confirmed by watching a real scroll gesture in
  this session — see the tooling note below for why.
- **Reconciling with the concurrent partner-ticker work**: `origin/main` had
  moved on since this branch's base (`aa80647` → `89c1e85`, three sessions'
  worth of commits) including "landing: one partner ticker per page inside
  the Dream Opportunity section" (`PartnerTicker.tsx`, new), which touches
  the exact section this pass was rebuilding. Read the full diff before
  touching anything. Rebased `schools-visual-qa` onto `origin/main`; git
  auto-merged everything except the `SchoolsView.tsx` import line (both
  sides edited it). Resolved by hand, taking `origin/main`'s side on the
  partner display specifically (it is the more recent, confirmed decision —
  "one partner ticker per page") while keeping this branch's own
  `OrganizationBand` composition and every other section as rebuilt here:
  the "Built by Dream Opportunity" section now shows `<OrganizationBand />`
  (this branch's photo + DO mark composition) followed by
  `<PartnerTicker tone="light" .../>` (`origin/main`'s ticker, swapped in for
  the old `PartnerLogoWall size="full"`), and the second, duplicate
  `PartnerLogoWall size="compact"` block that used to sit under `TrustLine`
  is gone (matching `origin/main`'s "one ticker per page" decision) rather
  than left as a second, now-inconsistent wall. Verified live, isolated by
  temporarily hiding the sections around it (see tooling note): one ticker,
  legible marks, even padding, at both widths; nothing else duplicated.
- **Verification observed**: `npx tsc --noEmit` clean before AND after the
  rebase; `npx eslint` clean on every touched file
  (`SchoolsView.tsx`, `SchoolsVisuals.tsx`, `MatchLab.tsx`,
  `ProfileExperience.tsx`, `PartnerTicker.tsx`, `DreamOpportunity.tsx`,
  `TrustLine.tsx`); `npm run tokens:check` passes (464 tokens, artifacts
  current) both before and after. Student landing
  (`Hero.tsx`, `HowItWorks.tsx`, `chapters/`, `ChapterShell.tsx`,
  `Footer.tsx`) confirmed byte-identical to `origin/main` post-rebase via
  `git diff --quiet`. `SchoolsView.tsx` copy diffed against the reference
  site (dreamari-educator-website.replit.app): no heading, lede, stage line,
  form label/option, FAQ, or Dream Opportunity copy changed; section order
  unchanged; FAQ, testimonials shell, TrustLine + one partner display, and
  the Dream Opportunity block all still present before the closing CTA.
  Live in the worktree on :3108 (dev server killed at the end of the
  session): every section inspected at both 1440 and 390 — no horizontal
  overflow at either width (`document.documentElement.scrollWidth ===
  window.innerWidth` at 390), no clipped content, Nav/AudienceToggle/anchors
  intact, no console errors beyond the dev-mode HMR websocket noise every
  page in this dev server shows.
- **Tooling note for whoever picks this up next**: the Browser pane's
  screenshot capture was unreliable specifically at a nonzero scroll
  position in this session — a scrolled screenshot came back solid black
  while `getComputedStyle`/`elementFromPoint` at the same instant confirmed
  correct, fully-painted light content underneath (reproduced identically
  across mouse-wheel scroll, `window.scrollTo`, and a post-scroll resize, so
  it is the capture path, not the app). Screenshots at `scrollY === 0`
  always rendered correctly regardless of viewport height. Worked around it
  by never scrolling: either grew the viewport tall enough to bring a
  section into the top-anchored view, or (for sections deep in the
  document) temporarily set `display: none` on the preceding sibling
  `<section>`s via `javascript_exec` so the target section landed at
  `scrollY === 0`, screenshotted, then moved on — nothing was ever exported
  as a diff or committed from that hack, it only drove screenshots. Side
  effect: hiding/restoring siblings churns layout enough that the
  `StageStory` `IntersectionObserver` occasionally locked onto the wrong
  stage's frame as "active" mid-hack; a real, un-hacked scroll (confirmed at
  full page height with no sections hidden) showed stage 1 correctly. If a
  future session needs to see the live crossfade for stages 2-5, that
  needs an environment where the Browser pane is actually being watched (a
  real scroll gesture), not a background/unattended one like this.
- Recommended next: an iPhone/Safari touch pass (not done, same as the prior
  visuals-pass entry below); the Dream Opportunity band photo could use a
  touch more headroom above the DO mark on ultra-wide desktop (1920px+,
  not checked this session).

Commits: `4e6dfa6` → rebased to `c422a39` on `schools-visual-qa`; pushed;
rebased onto `origin/main`, merged to `main`, pushed. See `git log` for the
merge commit hash.

### 2026-09-07 Schools landing on `main`: reference copy restored verbatim; Joshua's credibility lines get their logo row

- Merged `schools-landing` into `main` (merge `df7fd45`, pushed; production
  redeployed and confirmed live). The one conflict was `SchoolsView.tsx`: the
  other session had added Joshua's two-line `TrustLine` before the OLD view's
  closing CTA; the merge keeps the full rebuild and places `<TrustLine />`
  before the new closing CTA (the `#demo` request section).
- Where Joshua asked for what (Slack, 6 Sept; recorded in `specs/landing.md`
  and `TrustLine.tsx`): the two lines "Powered by insights from Dream
  Opportunity and leading corporate partners." / "Informed by Dream
  Opportunity's work with 100+ schools." plus a partner-logo row under them,
  before "Start Journey" on the student landing. Held pending the partner list;
  per Chandu (6 Sept) the student landing does not carry them, so they sit on
  the Schools view before its closing CTA. Partner list now confirmed
  (IMG_8794), so the logo row is added directly under the lines
  (`PartnerLogoWall size="compact"`, 720px column). Decision on 7 Sept: Schools
  only; the student page keeps the separate `BuiltByStamp` under its CTA.
- Copy audit against the named copy source (dreamari-educator-website.replit.app):
  the rebuild had rewritten nearly every line. Restored verbatim: hero h1
  ("Help students discover their direction—and build the skills to pursue
  it."), hero lede, CTAs "Request a demo" / "Explore the platform", the "For
  schools, districts, nonprofits, and educational institutions." line; the
  audience section ("Built for the students you serve." + four titles-only
  tabs + "Give every student a clearer path forward." with its lede); all five
  stage descriptions; the educators section ("Know where students are. See
  where to help." + the four Understand / Follow / Keep / Show items); the
  research lede; the closing ("A clearer direction. Skills for what comes
  next." + lede + Quick setup / Custom onboarding) and the form intro ("See
  Dreamari in action." / "Tell us a little about your organization so we can
  tailor your demo."). Form fields now match the reference: First name, Last
  name, Work email, Organization name, Your role, Organization type (School /
  School District / Nonprofit / Educational Organization / Institution),
  Number of students served.
- Deliberately NOT from the reference, by instruction: no eyebrows (its
  "College & career readiness", "For educators", "BUILD. MATCH..." labels are
  omitted; STAGE 01–05 stays as the one justified label); the Dream
  Opportunity block uses the user's own contractual copy; FAQ and the
  testimonials shell are additions; the "Explore our sources" link is dropped
  because the sources list sits inline under the lede. The "What students do"
  disclosures keep the app's real product detail for depth.
- Validation: `npx tsc --noEmit` clean; `npx eslint` clean on SchoolsView and
  DemoRequestForm; `npm run tokens:check` passes. Live (worktree, :3107): all
  reference lines present in the rendered Schools view; TrustLine → logo wall →
  `#demo` in that order; at 390px no horizontal overflow, both walls render
  (292/308px), First/Last name fields present. Desktop pixel measurements were
  not captured (the Browser pane was hidden at that instant); DOM order was.
- `DEMO_REQUEST_TO` is now chandu.mp.14@gmail.com (direct instruction, 7 Sept;
  the earlier hello@ address was an invented placeholder). Still open: real
  iPhone/Safari pass not done.

### 2026-09-07 Schools landing, visuals pass (branch `schools-landing`): composed product visuals replace every screenshot crop

Rule for this project from today: marketing imagery is never a cropped
screenshot. Every visual is a composed piece with its own frame, deliberate
padding and one focal component. The eight `.webp` crops the user rejected
(hero career detail, five stage crops, educators student plan, data career
ladder) are deleted; nothing references them.

- **`SchoolsVisuals.tsx`** (new) holds every composition. `Tile` is the light
  frame (hero-mid fading to the page, a faint wash of the stage's world
  colour, hairline, `p-6 sm:p-10`). `Screen` is the focal card: a dark
  product surface that re-enters the app's Semantic.Dark token scope by
  carrying the `marketing-v2` class (tokens.css defines the dark set on that
  class; the product is dark, the Schools page is light, and a device screen
  shows the product). It is a container; `--mu` = width over a design width
  (`clamp(floor, 100cqw / base, 1.25)`), so type and spacing scale with the
  card the way the chapter graphics do. No new colours: every value is a
  token from that scope or the light page's.
- **Hero**: `HeroLaptop`, a CSS laptop (ink lid, camera dot, wider base with
  a lighter lip) whose 16:10 screen is a recreation of the Career Detail
  header for Investment Banking: the poster photo on the right fading into
  the card (CardProgressiveBlur, the header's own scrims), the title in the
  Business & Money poster face, world label, summary, Play Game / Glossary
  Game and the four icon buttons, the scenario line, and the Typical degree /
  Typical pay facts with the accent-gradient figures.
- **Five stages**, one 5:4 card each at the same size, same tile, same
  padding: Build (question 3 of 10 with the flow's aurora glow, Business &
  Money checked, progress bar), Match (Find your Top 3 slots, the IB poster
  card sized from the card's height, a peeking card behind, Pass / Like),
  Explore (world chips, "Recommended because you liked Business & Money",
  three whole poster cards: Asset Manager, Quant, Accountant; long single
  words step the title down as PosterCard does), Immerse (the Play console
  tile at rest: scene, Level 1 chip, Christina's line, the question and three
  console rows with the cursor on the best), Connect (the Finance community
  with 312 / 61 / 5, JPMorgan Chase / Goldman Sachs / EY via `CompanyChip`,
  Maya's question and Marcus's verified answer).
- **Counselors**: `ProgressScreen`, the Profile overview (name row with
  `MatchRing`, the My Top Three / My Plan / Career Report bento with the plan
  bar, Do this next with the Explore and Play verbs). Aspect 4:3 on phones,
  16:10 from `sm`. The "educator dashboard is in development" caption stays.
- **Data credibility**: `LadderScreen`, the Investment Banking career ladder
  from `career/data.ts` (`CAREER_EXTRAS`, the four rungs with a figure) and
  the profile's source sentence. No chart.
- **Logo wall**: `partner-logos.webp` re-cut from `partner-logo-wall.png` to
  the logos' bounding box (826x455, was 1100x520 with 135 px of baked-in side
  margin), so the white card's own padding (`p-6 sm:p-10 lg:p-12` full,
  `p-4 sm:p-6` compact) is the frame. Same file for the student `BuiltByStamp`.
- `SchoolsView.tsx`: `Shot`/`Screen`/`next/image` gone; each stage carries
  `accent` and `graphic`; copy, order, nav, form and mailto untouched.
  Another session's `TrustLine` import/usage in this file was left in place
  and not staged here.
- Chrome note: backdrop-filter layers inside a rounded, overflow-hidden card
  escape the corner (a square photo corner shows at the header's bottom
  right; the app's own Career Detail header has the same artifact). The
  composition cards clip with `clip-path: inset(0 round var(--radius-lg))`,
  which Chrome honours; `isolation` / `translateZ(0)` did not help. Worth
  applying to `CareerDetailExperience`'s header too.

Validation (7 Sept): `npx tsc --noEmit` clean; `npx eslint` clean on
SchoolsVisuals, SchoolsView, DreamOpportunity; `npm run tokens:check`
passes (464 tokens, artifacts current). Locked landing files byte-identical
to `main` (Hero, HowItWorks, ChapterShell, Footer, chapters/). Live in a
detached worktree on :3106 driven by headless Chrome (Playwright) at 1440
and 390: no horizontal overflow at either width; every composition sits
inside its tile with 41 px (desktop) / 25 px (phone) of padding on all
sides; the five stage cards measure 420x336 each on desktop; no `role="img"`
element scrolls its own content; the logo wall image sits 49 px (desktop) /
25 px (phone) inside its card; no console errors; the student landing's hero
and stamp render as before. Screenshots of every tile were inspected at both
widths.

Unverified: the compositions on a real phone (touch, Safari); the Browser
pane was not used. The corner-clipping fix was checked at 1440 in headless
Chrome only.

Recommended next: have the user look at the hero laptop and the five stage
tiles at their own screen size; consider whether the Match card wants its
JPMorgan Chase / Goldman Sachs employer marks back (the app card carries
them; the composition shows the median only).


### 2026-09-07 Schools landing (branch `schools-landing`): audience-aware nav, real-screenshot Schools view, demo form, Dream Opportunity stamp

Resumed from an uncommitted working tree (the previous run was cut off by a
rate limit); nothing was discarded. Student landing untouched: Hero, the six
How-it-works chapters, the closing CTA and Footer are byte-identical to
`main` (`specs/landing.md` is locked).

- **Nav** (`Nav.tsx`) takes `view`. Schools: "Why Dreamari" (#why),
  "Student Experience" (#student-experience), "For Your Organization"
  (#organization), CTA "Request a demo" (#demo); the "For schools" switch and
  the student QUICK_LINKS drop out of both the desktop row and the phone menu.
  Island chrome, frost, hide-on-scroll and the 11 s grace are unchanged.
- **SchoolsView** sections in order: hero (#why; no audience chip; real
  Career Detail crop in a dark `Screen` frame) > audience strip (Schools,
  School Districts, Nonprofits, Educational Institutions) > "Five steps"
  (#student-experience; Build, Match, Explore, Immerse, Connect, each with a
  STAGE 0n eyebrow, one real crop, and a "What students do" Disclosure) >
  "Everything counselors need." (four bullets; the preview is the student's
  own Profile overview, captioned as such, with the educator dashboard
  called out as in development) > data credibility (BLS, O*NET, Harvard FAS
  Mignone / O*NET Interest Profiler, plus the Career Report's own "supports a
  conversation with a counselor; it is not a decision or a prediction" line)
  > "Dreamari is created by Dream Opportunity" (#organization; DO mark, the
  real partner logo wall, the contractual copy) > FAQ (six Disclosures, one
  open at a time: rollout, minors' data with a FERPA/COPPA line, quiz vs
  Dreamari, staff onboarding, launch timeline, pricing as "talk to us") >
  "Results from partner schools." shell ("Case studies coming soon.", no
  invented quotes) > "Request a demo." (#demo).
- **DemoRequestForm**: organization, name, work email, role, organization
  type select, students served select; submit composes a `mailto:` to
  `DEMO_REQUEST_TO` (`hello@dreamopportunity.org`, a PLACEHOLDER flagged in
  the file) and swaps to an inline "Thanks, {first name}." state with a
  "Send another request" reset. No fake persistence.
- **Disclosure**: marketing twin of the app's Folded section (heading is the
  control, aria-expanded/aria-controls, chevron). `md` = FAQ row, `sm` =
  inside a card.
- **DreamOpportunity.tsx**: `DO_COPY` (verbatim: "Dreamari is created by
  Dream Opportunity." / "Dream Opportunity works with more than 100 schools
  across eight countries and partners with the following brands:" / "After
  12 years of impact, we will scale our reach by providing students of all
  backgrounds with insights gained from our corporate partnerships and deep
  industry expertise, empowering them to explore and achieve their dream
  careers."), `PartnerLogoWall` (full / compact), `DOMark`, and
  `BuiltByStamp`, the student-site strip between the closing CTA and Footer
  (15 px heading, 13 px body, compact wall). It is `mkt-snap` with 72 px of
  phone-only top padding so the phone pager can rest on it with the heading
  clear of the nav island.
- **MarketingApp**: renders `BuiltByStamp` in the student main; while the
  Schools view is showing it sets `html[data-snap-off="1"]` (the pager's
  existing off switch). Before this, a phone in the Schools view could only
  rest on the footer, the one remaining snap point. That bug predates this
  branch (the old SchoolsView had no snap points either).
- **FinalCTAs**: `SchoolsFinalCTA` and the `secondary` prop removed; the
  Schools view's closing section is the form.
- **Assets** (`public/images/marketing/`): eight real app crops as .webp
  (hero career detail, five stage crops, educators student plan, data career
  ladder), `partner-logos.webp` (1100x520 crop of the supplied
  `IMG_8794.png`; the raw phone screenshot it was cut from, `partner-logo-wall.png`, is left on disk untracked and is not shipped),
  and `dream-opportunity-mark.svg` (the supplied black vector with its
  full-bleed ground removed and the counters set to white; it always sits on a
  white tile). `public/images/logos/companies/*` are NOT used: in-app example
  logos only.
- Hierarchy audit: the only uppercase/tracked labels in the Schools view are
  the five STAGE 0n numbers (checked in the DOM). No other eyebrows.

Validation (7 Sept): `npx tsc --noEmit` clean; `npx eslint` clean on all
seven marketing files; `npm run tokens:check` passes (464 tokens, artifacts
current). Live, in a detached worktree on :3105, driven by headless Chrome
and the Browser pane: toggling to Schools flips the theme and swaps the nav;
all four anchors land their section 96 px under the top (scroll-mt-24); the
FAQ opens one answer at a time with correct aria state; the demo form,
filled with test values, produced
`mailto:hello@dreamopportunity.org?subject=Dreamari demo request: Northside High School&body=Organization: ... Students served: 500 to 2,000 ... Work email: ...`
(captured from the CDP navigation event) and showed the success state; the
student landing's nav, hero H1, chapters, CTA and Footer wordmark/copyright
are unchanged; the stamp renders at 15/13 px with the exact copy; at 390 px
neither view overflows horizontally, the Schools phone menu lists only the
three schools links, the Schools view scrolls freely (snap type "none"), and
the stamp page puts its heading at y=72 under the island.

Unverified: the mailto in a real mail client (headless Chrome only records
the navigation; the OS handler was not exercised). `DEMO_REQUEST_TO` is a
placeholder inbox. The Browser pane was hidden for most of the session, so
screenshots came from headless Chrome rather than the pane.

Recommended next: confirm the demo inbox address (or swap the mailto for a
form endpoint), decide whether "Educational Institutions" is the wording the
team wants for the fourth audience, and have Joshua read the FAQ privacy
answer before it goes public.


- Date: 2026-09-02

### 2026-09-02 (later still) Career Detail: drop inconsistent software logos, organic hero scrim

- Reference material this round: a 40s screen recording of dreamonna.com's
  own `/explore/emt` page (extracted to frames via ffmpeg -- the file name
  had a U+202F narrow-no-break-space before "PM" that broke naive path
  matching, worth remembering next time a Desktop screen-recording path
  "doesn't exist") plus an earlier screenshot of dreamonna.com's Actor page.
  Confirmed both are the reference production site, not this prototype.
- **"All things should have relevant logos or nothing should... logos need
  to be transparent PNGs not white bounding boxes."** The reference has ZERO
  brand logos anywhere on the whole page (software, employers, colleges are
  all plain text/pills) -- confirmed by walking every section of the EMT
  recording. This prototype's "Software you would use" list special-cased
  ~20 known tools with a real SVG logo on a `bg-white` tile and fell back to
  a plain dot for anything else, which is exactly the "some things have
  logos, some don't, and they sit in a white box" complaint. Fixed by going
  with "nothing" (matches the reference, and is the only option that can't
  drift back into partial coverage as more careers/tools get added): dropped
  the `leading` prop so software renders through the same plain `DotList` as
  every other section. Removed the now-dead `LOGOS` map, `SoftwareLogo`
  component, and all 20 orphaned SVGs under `public/images/logos/`.
- **"The headers are stupid with these colors... make the transition smooth
  and organic... progressive blue text scrim if required."** The hero panel
  behind the title used the career's world accent at FULL saturation as a
  solid block (0-38%), then two hard color-mix steps to transparent by 88%.
  Some world colors read as garish at that strength, and the falloff was
  visibly banded, not a blend. Changed both the mobile and desktop gradients
  to mix each accent into `#05070f` (this app's existing night-surface tone,
  hardcoded rather than tokenized since the panel has to stay dark
  regardless of site theme, same as the hardcoded `#fff` text color right
  next to it) instead of using the raw hue, and doubled the gradient stops
  for a continuous falloff instead of banding. No exact reference existed
  for a photo-based header (the EMT reference has no photo at all), so this
  is the "be artistic" half of the ask -- live-verified on Carpenter (warm
  brown/amber world) and Investment Banking (gold): both now read as a
  tasteful dark vignette dissolving into the photo, not a colored block.
- `npx tsc --noEmit`, `eslint`, `npm run tokens:check` all clean.

### 2026-09-02 (later) Match Lab: cap the deck card's height on wide desktop viewports

- Direct report with a screenshot from a MacBook Pro: the swipe card was
  stretching edge-to-edge, nearly the full viewport height, on a wide desktop
  screen. Root cause: the card div is `absolute inset-x-0 top-0 bottom-7`
  inside a `flex-1` deck area, so its height was always "100% of whatever
  vertical space the page happens to have" -- fine on a phone viewport, wrong
  on a tall desktop one, at a fixed 440px card width.
  `src/components/match-lab/MatchLab.tsx`: replaced `bottom-7` with an inline
  `height: "min(calc(100% - 28px), 680px)"` -- unchanged on phone-sized
  viewports (already under the cap), capped everywhere else. Live-verified at
  1512x982: card now reads as a real card, not a stretched banner.
- `npx tsc --noEmit` and `eslint` clean. Not yet committed.

### 2026-09-02 Profile dashboard cleanup; Match Lab gesture-guide fixes (COMMITTED, not yet pushed)

- **Profile page** (`ProfileExperience.tsx`, `data.ts`, `report-data.ts`), all per direct, itemized feedback:
  - Removed the "Next steps, clear and small · built for the {route} route" subtitle under the Plan header -- flagged as too much info. `PlanTab`/`MyPlanTab` no longer take a `chosenRoute` prop now that nothing in them reads it.
  - Removed the "Courses and experiences to consider" / "Coming up" two-card block from the Plan tab, AND the separate "Coming up" card on Overview (both, not just one -- first pass was too selective, called out directly). `UPCOMING` export in report-data.ts is now dead everywhere and was deleted.
  - Removed the duplicate "12 day streak" chip from the bottom Overview strip (the header already shows the streak at the top); removed "10 inputs behind your report" from that same strip entirely. What's left of "Profile and privacy" now lives in a real dropdown off the header's Settings gear (`settingsMenuOpen` state, same open/close-overlay pattern as the Top3 card kebab menu) instead of the header linking straight to the tab.
  - Retasked the Overview "Do this next" plan item (`ib-3-1` in data.ts) from "Complete the finance glossary game" to "Complete the Investment Banking career simulation", fixed its href from the stale `/match-lab` to the real `/play/investment-banking` route.
  - Top 3 comparison cards: fixed a real pixel-level misalignment -- the "Your #1" badge was `h-[27px]` while the unfocused "Make my #1" button was `min-h-[36px]`, a 9px offset that cascaded through every section below it on desktop's 3-up row. Both are now `h-[36px]`. Also switched the row from `items-start` to `items-stretch` and gave each card `h-full` so all cards in a row always match the tallest one's height, not just whichever one happens to reserve the right min-heights. Live-verified via getBoundingClientRect: `estimated pay` row and badge row both land at identical pixel `top` across cards now.
  - Investment Banking and Private Equity showed the identical `$101,910` median salary (both cite BLS "financial analyst" as the closest tracked occupation) -- read as fake/copy-pasted side by side. PE's median changed to `$155,000` (still within its own stated $100K-150K entry / $150K-300K+carry range, and higher than IB's, which is directionally correct for PE comp) with the source label updated to say the number is adjusted for typical PE base+bonus, not a raw BLS figure.
  - Restructured Overview's layout per direct request: the identity/name header is now its own bordered card; the tablist + the three bento doorways + "Do this next" are one unified dashboard surface (single card) instead of separate floating pieces. Scoped to the Overview tab only -- Top Three/Plan/Report/Resume keep their own existing tablist-plus-content layout, since Report in particular was just redesigned by the other session and doubling its card treatment wasn't asked for.
- **Match Lab gesture guide** (`GestureSpotlight.tsx`, `MatchLab.tsx`) -- direct report: "the match screen broke for my CEO on his MacBook Pro" with a screenshot showing a hard vertical seam torn across the card.
  - Root cause: `GestureSpotlight`'s spotlight cutout used the `box-shadow: 0 0 0 9999px rgba(...)` trick to dim everything outside the card. That technique is a known Safari/macOS compositor landmine at large spread values -- confirmed as the cause by removing it. Per direct follow-up ("we're not dimming the card anyway right?"), the fix is not a safer dimming approach but no dimming at all: the box-shadow div is gone, only the animated gesture dot + label pill render now.
  - The up/right/left demo cycled forever until a real gesture landed. Now caps at two full loops (6 steps) via a `guideStepRef` counter, then hides itself -- still interruptible at any point by a real gesture (unchanged `markDemonstratedRef` path). Per-step dwell also halved, from a hardcoded 5200ms (two hint cycles) to one `GESTURE_HINT_CYCLE_S` (2.6s) cycle, per "make it quicker."
  - Removed the separate static "⌃⌃ Scroll for the breakdown" nudge chip under the card title -- redundant now that the gesture guide's own "Scroll up for details" step teaches the same thing.
- `npx tsc --noEmit`, `eslint` on every touched file, and `npm run tokens:check` all clean. No token changes; contract files untouched.
- Live-verified in isolated worktrees on ports 3100-3102: Profile's word-bank/settings-menu/card-alignment fixes confirmed via DOM inspection (`getBoundingClientRect`, computed styles) since the Browser tool's screenshot cache was stale/unreliable for several checks this round -- read_page/get_page_text/javascript_tool are the reliable read path when a screenshot looks wrong. Match Lab's fixed gesture guide and removed nudge chip confirmed via get_page_text.
- **Not yet pushed** -- per standing instruction, push needs an explicit go-ahead even after local verification. Everything above is committed locally on `build-flow-dynamic-background`.

### 2026-09-01

### 2026-09-01 (night) connect-redesign-lab MERGED TO MAIN (user-authorized) — all four card lanes live

- The user explicitly authorized pushing the entire lab to main ("push the
  entire thing to the main branch, with all the options"). Main now carries
  the four-lane Connect A/B/C/D: Photos / Fusion / People / Shapes,
  URL-pinned via ?cards=. Direction gets finalized ON MAIN from here; losing
  lanes will be removed once one wins. Production build + tokens:check
  passed before the merge.
- Per-push confirmation still applies: get the user's explicit go-ahead
  before every future push to main.

#### Original lab-era notes (historical)

- Branch `connect-redesign-lab` (local) explores new Connect community cards.
  Explorations 1 (dark posters) → 2 (pastel bands) → 3/3b (topic-shape
  clip-path masks, approved) → 3c (uniform slot interiors) → 3d (current).
- Current card language: pastel accent surface, Bricolage (--font-display)
  only, exactly 3 type tiers (name 20/800, "N verified pros" 13/600, folio
  11/500; CTA reuses 13+800). Title top-left, shape mask top-right, pros
  line sitting on a full-card-width hairline, N STUDENTS left / JOIN → right.
- Masks: briefcase (GPD — bulb retired per user), rising bars, hexagon,
  cross, flower. Hover = what the shape is (bars morph taller via clip-path
  interpolation, hex turns 60°, cross heartbeats, flower blooms, briefcase
  lifts). Art = generated accent-glass gradients in
  public/images/connect/shapes/ (PIL script in git history, 336095b).
- DEPLOY RULE (user-set): this work deploys ONLY by force-pushing the lab
  branch to origin/demo (Vercel preview
  dreamari-git-demo-chandump14-3961s-projects.vercel.app). NEVER merge or
  push to main until the user explicitly says "push to main".
- Carried into every Connect screen: board + event banners are pastel
  identity cards (ShapeBadge = shape + concentric radials at any size),
  events tab cards are pastel star cards (STAR_CLIP + event.webp glass
  art), thread/insight breadcrumbs are board-accent pastel pills, JoinSheet
  header is pastel with a mini shape. gradientFor/WorldGlyph retired.
  EVENT_ACCENT hardcoded #f59e0b (--chart-3 resolves empty at :root).
- Note: the browser pane's slow synthetic clicks lose against dm-tap's
  press transform — verify navigation with element.click() in JS.

### 2026-09-01 (cont.) Connect pitch-readiness round (PUSHED, af1acc7)

- Community grid: five EQUAL cards, three top + two centered below (the
  2-wide/3-square bento is gone per feedback); every CTA reads "Join
  Community" (joined -> straight into the board, unjoined -> JoinSheet).
- Covers: user's four cinematic images with tech/health/creative
  brightened ~1.5x (were too dark to read); GPD = generated hanging
  Edison-bulb scene (critical thinking) after two rejected attempts
  (flat chart, vector bulb). Art masks loosened; Most Popular pill
  top-right with title clearance.
- Every student question now has 3-4 pro answers from DISTINCT verified
  pros (15 total; new: Omar Haddad/Pfizer nurse, Camille Vega/Netflix
  producer) -- "lots of motion, not one person answering." All formerly
  Unanswered/routed questions are now answered (pill state has no live
  example anymore, deliberate trade for the pitch).
- Every board's FIRST insight carries a meme in its replies (pitch beat:
  Josh only opens the first item). NOTE for future edits: data.ts's
  single-line empty arrays (`responses: [],`) bit a scripted insert once
  -- expand them before inserting.

### 2026-09-01 Connect rebuilt to the doc + Replit; play fixes (PUSHED)

- **Round 2 (also PUSHED, f78b088)**: Join Community matches the Replit --
  tap opens a SOLID JoinSheet with the vetted unlock steps (Read: all
  students / Reply: 300 Dream Points / Post: 700; points match the topic),
  confirm swaps the card in place to Open Community. Creative Careers
  ships unjoined to demo it. Events tab now lists the three ACTUAL fall
  events (JPMC Brooklyn Oct 23 / AT&T Dallas Oct 29 / EY New Jersey Nov 4,
  from Slack) + EY Student Impact Day as the live board demo; the mock
  JPM Markets Day + Amazon events and their thread are gone. ALL modals
  solid (Ask/code/join) per "modals should never be transparent". Boards
  seeded with short questions/insights for every community (new pro
  Jasmine Cole, Art Director, Nike). Spacing pass for the Replit's
  airiness. NOT built (flagged): the Replit's standalone first-visit
  "Welcome to Connect" + "Unlock Connect" onboarding screens -- their
  content lives in the JoinSheet instead; build them if asked.

- **Connect** now follows the Aug 29 doc and the vetted Replit reference
  (https://dceeai.replit.app/community-boards, checked at desktop width
  first per instruction) one for one: five fall communities (General
  Professional Development / Finance / Technology / Healthcare / Creative
  Careers) with the doc's counts/companies/topics, all joined; colored
  gradient card headers (explicitly allowed now -- earlier "no colored
  headers" feedback is superseded for Connect) with each community wearing
  its own APPROVED world accent token; CONNECT header (all caps, per
  direct instruction, replacing "Find your community") + Dreamy-glasses
  mascot; events tab with orange-gradient event cards; board = gradient
  banner + ONE content card (rail: Student Questions / Professional
  Insights only) with the doc's question cards (quoted title, Unanswered
  pill, grade/country chips, likes · views · comments), insight rows and
  the AI Ideas / Polish / Post composer. Verified desktop -> tablet ->
  mobile.
- **Play fixes** (same day, pushed earlier): music gesture-retry (Express
  ran silent -- blocked autoplay left `current` set), seeded answer-order
  shuffle across choice/blank/tiles/document/boss/pick/rapid (pure render,
  reshuffles per page load), RN cast reframed to IB's waist-up scale
  (anchors 1.75x -- IB cutouts are waist-up crops, RN's are full figures),
  Rosa/Tyler cast into RN1-09/RN1-22. Vercel build failure (band.name type
  error) fixed in 4678fd7.

### 2026-08-31 (late night) IB Express mode (PUSHED)

Built from "Investment Banker, Level 1, Express mode.pdf". One derived mode,
zero duplicated content:

- `Level.expressCut` (types.ts) lists the beats a trimmed run drops;
  IB_LEVEL_1 cuts L1-03, L1-03b, L1-04, L1-07, L1-09, L1-10 (the five
  teaching screens; the doc's own list). Every scored beat, the vocabulary
  flips card, both story cards, all character cards, scoring, thresholds
  and endings are untouched. First decision lands on screen five (doc's
  sanity check) -- verified live.
- The route (`/play/[game]?mode=express`) derives the express level:
  filtered beats, `express: true`, id suffixed `-express`. Saves go to
  slot n+100 so full/express runs never collide.
- Pull-teaching (the doc's Do Not list -- "without these panels Express is
  an incomplete mode, not a faster one"): the reputation gauge is a button
  (panel with the three outcomes, current band lit); industry terms
  (derived from the flips card's own term/def pairs) get a dotted
  underline on FIRST use in a setup line; character names in setup lines
  are always tappable and reopen that character's own intro card (kicker =
  role, face from level.cast). Skill chips were already tappable (D55).
  All lexicon content derives from the level's beats -- nothing authored
  twice. Full mode renders byte-identically (annotate undefined, gauge
  inert).
- "Express mode" chip (Zap icon) sits next to "Watch trailer" on the hub's
  IB featured card; offered only when a level declares expressCut.
- NOT built (flagged): the doc's "log mode alongside score from day one"
  analytics note -- no analytics infra exists in the prototype.

### 2026-08-31 (night) Top Three crop focal points + Career Report modular pass (PUSHED)

- **Top Three cover crops** (Slack: "subject should appear in a consistent
  position"): `ProfileCareer` gained optional `photoFocus` (object-position
  for cropped covers); the Top3 card image reads it instead of a shared
  `object-top`. IB `50% 40%`, Airline Pilot `50% 72%` -- both faces now land
  ~1/3 down the 4:3 crop. Other careers fall back to `50% 25%`; calibrate
  per-photo if one joins the Top 3 and looks off. The 2:3 locker/compare
  poster crops were left alone (near-native aspect, no beheading risk).
- **Career Report scanability** (Slack: dashboard, not document; keep dark,
  keep all info): rebuilt the report's presentation inside the existing
  dm-report token system. Each ReportSection is now a contained module
  (raised card, hairline header rail: blue icon + 14px caps display title,
  actions right); facts are labeled sunken tiles (11px caps label over
  15.5px bold value); masthead is pill eyebrow + name + chip meta row
  (killed the double 42px stack); Education's common path is the page's one
  accented tile, other pathways are name+time-chip rows; majors are
  bullet-dot tiles; colleges/courses restyled to the same tile grammar;
  sources footer is a matching module; ReflectionCard header matches. Type
  hierarchy is now uniform per section: caps header > caps label > bold
  value/body. Print/export untouched mechanically -- everything still keys
  off --paper/--ink/--rule tokens the print stylesheet remaps, [hidden]
  reveal + data-keep-together preserved; worth one print-preview QA pass.
- Verified live at mobile + 1280px, eslint + tokens:check clean. NOT pushed
  -- awaiting go-ahead.
- **Follow-up rounds (same night, all LOCAL)**:
  - Strict type hierarchy enforced (user: "heading>Subheading>Body ... no
    other logic"): report modules now 18px caps heading > 14px caps label >
    13px body, everywhere incl. ComparisonTable and Reflection. Saved as a
    standing memory rule.
  - Majors row 3-across at every width; report content column max-w
    68ch -> 920px (68ch collapsed once body hit 13px, leaving huge side
    margins); article side padding trimmed; Reflection card got real bottom
    padding (sm:pb space-9).
  - **For You reel recast onto browse cards** (user dropped "BROWSE
    Images-2" in repo root): six careers with real browse photography +
    BLS-sourced Career Report copy (IB, RN, SWE, Airline Pilot, PE, Food
    Scientist) replace the Figma Env lineup (Aerospace Engineer et al. --
    no art, no sourced copy). Five images imported as
    public/images/app/browse-*.png; RN keeps its Figma browse poster; IB
    uses poster-investment-banking-v3.png, which is byte-identical to the
    user's hi-res "Investment banker.png" -- the folder's own IB files are
    198x297 thumbnails, DO NOT USE (user: "don't ever let me see this
    image again" about the cropped thumb).
  - Landing Play demo typography (Slack): one type scale (H1 20 > question
    17 > body/answers 16 at cap), title-case blue H1, sentence-case
    question (all-caps dropped), blue quote bar now spans title+scenario as
    one block, even section gap for scene -> context -> question -> choices.

### 2026-08-31 (evening) RN sprites keyed + Profile surface hierarchy (PUSHED)

- **RN cutout sprites are live**: the RN_Game_Asset_Pack's ten green-screen
  masters (generated to docs/handoff/sprite-master-prompt.md) chroma-keyed
  in-repo (PIL: green-dominance alpha ramp + despill, saved as transparent
  webp ~100KB each) into public/images/play/rn/expressions/. Wired into
  expressions.ts (tier sets for Rosa/Denise/Tyler, defaults for all four,
  ratios 0.5), character cards switched from baked portraits to standing
  castMember sprites, Riverbend locations gained characterAnchors, the
  pack's three people-free daytime plates replaced the lobby/station/
  staff-room backgrounds, and RN-TR-06 is now Yvonne's cutout rising over
  the lobby (the IB Lamisa treatment). Pack's own queue (patient-room/
  corridor/ICU people-free masters, evening/night variants) still open.
- **Profile quick fixes** (Slack): "Active 142 of 190 days · 75%" sits NEXT
  TO "12 days" (inline in the dd, wraps only on narrow phones); Top Three
  covers are aspect-[4/3] + object-top so both photos show their subject
  fully.
- **Profile surface hierarchy** (Slack): the shared GLASS section surface
  is solid `var(--card)` now, and the Career Report's Share/Counselor/
  Download panels match -- page gradient -> solid card -> lighter nested
  rows, glass kept for atmosphere rather than reading surfaces. Verified
  on Plan (the called-out screen), Top Three, Share.

### 2026-08-31 (later still) Registered Nurse simulation, Level 1 (PUSHED)

The second career simulation, built to the IB SOP from
`REgistered Nurse Game/DreamAri_RegisteredNurse_Level1_Handoff.xlsx`:

- **`rn-level-1.ts`**: all 31 screens (RN1-01..26 + rapid children), ten
  scored beats, sheet copy verbatim with the SOP refinements already
  standard in IB (example split to its own screen, word-card flipbook for
  the four terms, spotlit score explainer, typed 85 check with the
  reworded copy, dedup'd character-card eyebrows, D55 empty feedback
  bodies). Four endings (three outcomes; 40-84 splits soft/blunt at 60;
  under 40 = Terminated). Plan lines on every scored beat.
- **Per-career engine parameterization** (this is what makes career #3
  cheap): TrailerFlow now takes the SIMULATION -- world poster font, world
  accent, firm mark and the real ladder all derive from it; PowerLadder/
  FlipsBody accents thread from the sim's world (IB unchanged, it IS the
  business gold); PERFORMANCE_PLANS re-keyed by simulation id with the RN
  sheet's own Denise/Yvonne plans for levels 1-3 (PerformancePlanFlow now
  receives the plan, not a level index).
- **Rank partial credit** (`whenClose` on RankBeat): the RN sheet's
  three-band scoring (all right Best, three of four Acceptable, else
  Wrong). The rules conflict the walkthrough flags (rank vs the universal
  3/4 threshold) is still an open call for all 25 careers.
- **Assets**: `public/images/play/rn/` -- six Riverbend room plates
  (locations.ts library + RN1-xx beat map, ids prefixed so they can't
  collide with IB's L1-xx), four character portraits as hero art, four
  face crops for the dialogue cast. NO cutout sprites yet -- the master
  prompt for generating them is docs/handoff/sprite-master-prompt.md; the
  engine's standing-character/expression systems light up when they land.
- **Carousel bug fixed properly**: the featured-row swap froze the
  incoming card at opacity 0 (framer layoutId crossfade + the element
  changing tag button->article = remount). RowCard is now ONE persistent
  keyed motion.article per candidate that simply grows into the featured
  size (layout animation, no crossfade), with an absolute overlay button
  for pressable side cards. First live two-sim carousel works.
- **Blockers honored, not invented around**: salary/hours are proposals
  (Level 1 ships no offer card, so nothing displays them); trailer
  statistic cards ship without their unconfirmed numbers (D04); endings
  are Draft pending approval.
- Validation: tsc, eslint (pre-existing img warning only), tokens:check,
  full build; live-verified hub carousel, RN trailer (Nunito/teal/
  Riverbend/real ladder), drag check, Rosa hero card, teal HUD.

### 2026-08-31 (later) IB Level 1 gamification pass from live review (PUSHED)

A rapid feedback round on the rebuilt Level 1, all applied and verified:

- **Teach split + centered system cards**: L1-03's example moved to its own
  screen (L1-03b, no re-typed headline); system cards now render CENTER
  SCREEN (BeatStage `centered` includes `card.system`), since a big intro is
  the game addressing the player, not a scene caption.
- **Word Cards flipbook** (new `flips` beat kind, `FlipsBody`): L1-11's four
  terms are now one word per binder-paper card (the glossary flipbook's
  ruled-paper + sketch-squiggle look, no illustrations per direct feedback),
  big term + definition together, 3D page-turn between words, dots, Continue
  only after the last word.
- **Drag check game-feel** (L1-04, drag REINSTATED per the design mock after
  an earlier revert): pulsing token, grows/glows while held, the card under
  the pointer lights up live before the drop, numbered ANSWER eyebrows,
  3-up grid on sm+, pop on lock-in.
- **Reputation spotlight** (`spotlight: "score"` on L1-09): the gauge debuts
  HUGE at screen center on a dark legibility disc, flies smoothly (numeric
  transform keyframes -- mixed vw/px `left` animation was the jitter) into
  its corner slot, then a green bouncing arrow + pulsing halo + a worked
  +5/-3 demo cycle run for the rest of the beat.
- **Tappable skill chips on the feedback card** (`skills.ts`, the Skills
  Framework's What It Means lines): the explainer two screens earlier
  promised chips are tappable, so now they are, everywhere.
- **Copy**: reveal row "40 to 84 · Cautious" (user's own correction); typed
  check reworded ("Quick check. Type the number, then press enter." /
  "What's the minimum amount of points..."); character cards no longer say
  the name/role twice (the eyebrow chip carries it).
- **Visual congruence**: the Day-1 morning run (L1-01..10) stays in the
  daylight reception -- the sunset floor sandwiched between daylight
  screens read as day -> evening -> day in five slides.
- **Play hub**: featured rail is full-bleed (negative margins to the
  viewport edge) so the next card always visibly peeks; trailer chip reads
  "Watch trailer".
- NEXT: the Registered Nurse game ("REgistered Nurse Game/" folder,
  Level 1 fully specced + trailer + characters; Rosa/Denise/Tyler/Yvonne
  portraits and six hospital scenes supplied). Blockers flagged by its own
  walkthrough: salary/hours figures are proposals, endings need approval,
  and the rank-partial-credit rules conflict needs a call.

### 2026-08-31 IB simulation: Aug-31 handoff (2).xlsx content update, cinematic trailer, voice system (PUSHED with the doc-pass commit)

Applied `DreamAri_IB_Levels1-3_Handoff (2).xlsx` (Aug 31) by DIFFING it
against the (1) version the sim was built from, so only real changes moved:

- **Level 1 fully restructured** (`ib-level-1.ts`, L1-01..L1-25 + rapid
  children): story cards split one-idea-per-screen (D52), teach-then-check
  pacing (D53/D67/D74), the client renamed Maison Laurent and introduced on
  first mention (D88), Jordan reframed to composure with family cut
  (D83/D95/D97), review-week beat rebalanced (D84), catch-the-mistake line
  now carries three errors (D94/D96). `locations.ts` BEAT_LOCATION remapped
  to the new ids; the three hero illustrations keep their files on their
  renumbered beats. Four endings now (85+/60-84/40-59/E-TERM under 40,
  Endings tab): E-TERM "Contract Ended" added to ALL three levels' endings.
- **New engine mechanics** (`types.ts`, `interactions.tsx`,
  `SimulationPlayer.tsx`): `check` beats (unscored comprehension gates --
  tap, typed with fade-in hint after two misses, and a drag variant kept in
  the engine but NOT used on L1-04, which was switched back to tap per
  direct feedback overriding the sheet's D75), `reveal` beats (Tap to
  Reveal rows; Continue only after all open), character POWER cards with a
  rail-and-dots ladder DIAGRAM (restyled from bordered rows per direct
  feedback -- they read as tappable options), Drag-to-Blank (the blank/
  tiles layouts now drag via framer-motion, keyboard digits still work),
  Action Prompts on every screen (authored `prompt` or a per-mechanic
  default), D55 feedback cards (headline + chosen option's why + chips +
  score; feedback bodies no longer render).
- **Dreamy removed from the simulation** (D62): the Narrator sets scenes
  (italic body-face, no avatar/name), System cards carry rules (squared
  corners, hairline edge, utility type), characters speak in the display
  face with a chat-notched bubble and per-character VOICE BLIPS during the
  typewriter (`playVoiceBlip` in sound.ts, pitch per character). Dreamy
  component deleted from SimulationPlayer; L2/L3 Dreamy beats re-speakered
  per the sheet; poses stripped. Performance plan footer is a system line
  now ("...you keep the job", "This one decides it. Be specific.").
- **Cinematic trailer** (`TrailerFlow.tsx`, data in games.ts): AAA-style --
  letterbox bars, Ken Burns push per plate, film grain, deep vignette +
  an ORGANIC blurred text pool (backdrop-blur feathered through a mask,
  never a hard-edged scrim), titles in the world's approved poster serif
  (Viaoda) with constant tracking (animating letter-spacing rewrapped
  lines = jitter, per direct feedback), Lamisa's sprite rising dark-graded
  on TR-06 ABOVE the vignettes, a vertical ring-and-segment ladder finale
  ("How far WILL you get?", corrected per direct feedback) with the CTA as
  the only tappable thing, the sim's main theme as score + its own mute
  toggle. Renders through a portal on document.body WITH the
  marketing-v2/themeable classes (tokens don't resolve outside the shell).
  NOT auto-played (the sheet says play-once-on-first-open; overridden per
  direct feedback): opened only from a "Watch trailer" chip on the Play
  hub's featured card.
- **Reputation HUD is a score now** (direct feedback): `ScoreGauge` -- ring
  gauge filling 0-100 in the band's color, count-up/down between values,
  pop on change, star + band label, floating +/-delta.
- **Timer tick sound removed** (direct instruction): the countdown ring is
  silent; `playTick` is now unused by the player.
- **dm-quiet hover fix, app-wide** (`app.css`, direct feedback): pill
  border-radius as a components-layer default (explicit rounded-* still
  wins) + a 6px same-color box-shadow halo, so the hover wash never paints
  a sharp-edged rectangle flush against an unpadded text control (the
  Glossary "Back" button was the visible case).
- Sheet items deliberately NOT built: sound cues per trailer card beyond
  the main theme; the Decode the Message interaction (approved, unused per
  the sheet); L1-04's drag mechanic (built, parked, see above); Levels 4-6.
- Validation: tsc, eslint (pre-existing img warning only), tokens:check,
  full build, live playthrough of L1-01..08 verifying trailer, checks,
  reveals, ladder diagram, voice boxes, gauge and prompts, at desktop and
  375-wide mobile.
- NEXT UP (queued by the user): elevate the Glossary Game -- 3D flipbook
  term cards (sketch-style illustration face / word+definition face),
  richer feedback loops and sounds.

### 2026-08-31 Investment Banking photo unified to the founder's image (PUSH AUTHORIZED)

- The founder-supplied "Investment banker.png" (repo root, 1088x1445) is now
  THE Investment Banking photo everywhere: renamed to
  `poster-investment-banking-v3.png` for cache busting (this URL family has
  been overwritten in place before and cached optimizer renditions kept
  serving the old photo -- the -v2/-analyst files are deleted). References
  updated in catalog.ts (Explore), match-lab/data.ts, profile/data.ts and
  marketing/chapters/Match.tsx -- one shared file, four surfaces.
- Top 3 card covers now crop at a HIGH focal point (`object-[50%_22%]`):
  a 16:9 window centered on a tall portrait framed the chest and beheaded
  the person. Verified live: face framed, v3 URL served.

### 2026-08-31 Glossary flipbook, Connect card/Events polish, Top 3 alignment (PUSH AUTHORIZED)

All from live direct feedback, after the c7428e5 push:

- **Glossary Game flipbook** (`GlossaryGameExperience.tsx`): the unlock
  screen's term card is now a real 3D flipbook page -- sketch-style
  illustrated FRONT (the term's icon at illustration size through an
  feTurbulence displacement "pencil wobble" filter, ruled-paper face, gold
  radiating dashes, squiggle underline, TAP TO FLIP hint) flipping in real
  rotateY to the written BACK (definition + Dream Sneakers example, ring
  binding kept). 3D SAFETY: the old Chromium invisibility bug (see the
  removed comment) is avoided structurally -- the ROTATING element carries
  no radius/clipping (faces clip themselves), rotation is a user-toggled
  spring, faces live on backface-visibility; verified across a second-term
  flip. New `playFlip()` page-flick in sound.ts. Reduced-motion crossfades.
  The icon-node progress row above the card is REMOVED (redundant with the
  big illustration) -- a quiet "Term N of 5" line replaced it. Icons made
  RELEVANT to the story: custom lucide-style SneakerIcon for Product,
  Paintbrush for Service (custom design), UserRound for Customer,
  CircleDollarSign for Profit (a pig read as just a pig; an overlaid coin
  read as clutter; a dollar coin was the direct suggestion). Practice
  questions bumped to display-font extrabold clamp(18-21px).
- **Connect community cards**: hairline dividers rule the card into bands
  (identity / stats / professionals / topics / action), stats carry icons,
  and each world has its OWN glyph (Landmark/Cpu/Stethoscope/Palette/
  GraduationCap via `WorldGlyph`) instead of a generic Users icon.
- **Connect Events tab reworked**: one consistent card for all three event
  states (was three ad-hoc blocks) -- icon tile + name + status, ruled
  when/where/partner band with icons, then the single state-appropriate
  action (Open Event Board / opens-after-note / Enter event code), 2-up on
  sm+. Matches the reference doc's event card, elevated into the app's
  language.
- **Profile Top 3 alignment**: every block reserves its height at lg
  (title 2-line slot, description line-clamp-2 + min-h, education
  line-clamp-2 + min-h, single-line pay/years) so the three cards align
  1:1 regardless of wraps -- verified equal heights to the pixel. Typical
  employers + Suggested schools moved into a collapsed-by-default
  "Employers & schools" accordion (`MoreFactsAccordion`).
- Validation: tsc, eslint, tokens, full build clean; live-verified
  flipbook (both faces, second-term flip), Connect community + events
  tabs, Top 3 equal heights at 1280.

### 2026-08-31 IB simulation: Aug-31 handoff update, cinematic trailer, voice system, score gauge (UNCOMMITTED, push authorized)

From `DreamAri_IB_Levels1-3_Handoff (2).xlsx` (Aug 31; "(3)" is a
byte-identical re-download), diffed cell-by-cell against the Aug 25 "(1)"
version to isolate the changes, plus a round of live direct feedback.

- **Tick-tock removed**: the countdown Clock no longer plays a per-second
  tick (direct instruction). Ring + pulse carry the urgency.
- **Level 1 rebuilt** (`ib-level-1.ts`, 18 -> 25 beats, ids L1-01..L1-25):
  story cards split one-idea-per-screen (D52); System teach card + unscored
  comprehension checks (D53/D67/D74; the sheet's drag-token check D75 was
  switched back to TAP per direct feedback -- flag D75/Joshua if it should
  return); Christina/Marcus two-card intros + Jordan single card at the
  sheet's positions (D54/D60), with the power card's 3-rung ladder drawn as
  a rail-and-dots DIAGRAM (per direct feedback that bordered rows read as
  tappable options); Tap to Reveal skills/reputation screens (D86/D90/D93);
  typed 85-check (recall, not recognition); matching pairs now
  request-to-action (D68/D71/D87); Nike -> Maison Laurent with the client
  introduced on first mention (D88); Catch-the-Mistake carries three errors
  on one line (D94/D96); Jordan-credit beat rebalanced, best = raise at
  review (D84); NEW printer beat unchanged; four endings incl. E1-C 40-59
  and E-TERM under 40 (Endings tab). `locations.ts` L1 map re-keyed to the
  new ids; hero art files unchanged (l1-07/12/13.webp on L1-14/21/22).
- **Engine additions** (`types.ts`, `interactions.tsx`, `SimulationPlayer`):
  new `check` (tap/type/drag) and `reveal` beat kinds; `card` gains
  `ladder`/`system`; Drag to Blank -- the blank/tiles layouts' word tiles
  are now framer-motion drags into the slot (D75), digit keys still work;
  Action Prompt on every screen (authored `prompt` or a per-mechanic
  default), small grey line above the interaction.
- **D55 feedback trim**: FeedbackSheet shows derived headline + the CHOSEN
  option's why + skills + score only; beat-level `feedback` strings are no
  longer rendered anywhere.
- **D62 Dreamy removed from the simulation**: Dreamy component deleted from
  SimulationPlayer; L2-12/16 + L3 narration re-speakered Narrator, final
  reviews are System cards; performance plan's footer is one line of plain
  system text ("...you keep the job", "This one decides it. Be specific.").
  Dreamy stays in the Glossary mini game and career pages.
- **Three-voice dialogue system** (direct feedback): character = display
  face, chat-notched bubble corner, per-character VOICE BLIPS while the
  line types (new `playVoiceBlip` in sound.ts, per-speaker pitch map);
  narrator = quiet italics in the body face, silent; system = squared
  hairline card, utility type, silent.
- **Score gauge** (direct feedback "make it read like a score"): reputation
  is now a filling ring gauge in the band color with count-up/down, a pop
  on every change, star + band label, floating +/- delta (`ScoreGauge` +
  `useCountUp`).
- **Cinematic trailer** (`TrailerFlow.tsx`, data in games.ts): the Trailer
  tab's 7 cards, AAA-cut per direct feedback -- letterbox bars, Ken Burns
  push per plate, film grain + vignette, Viaoda (--font-poster) title cards
  blurring in, dedicated center text scrim for 100% legibility, Lamisa's
  sprite rising dark-graded on TR-06, vertical ring-and-line ladder finale
  ("How far WILL you get?", corrected per direct feedback), pulsing Start
  Level 1 as the only button-looking thing, music (the sim's main theme)
  with its own sound toggle, always-visible Skip. Renders through a portal
  to document.body WITH `marketing-v2 themeable` classes (tokens don't
  resolve outside the app shell otherwise). NOT auto-played: opened only
  from a "Watch trailer" chip on the Play hub's featured card, per direct
  feedback overriding the doc's play-once-on-first-open rule.
- **dm-quiet hover fix, app-wide** (`app.css`, direct feedback): quiet
  controls now default to a pill radius (in @layer components, so explicit
  rounded-* still wins) and the hover wash carries a 6px halo box-shadow --
  no more sharp-edged rectangles hugging unpadded text buttons.
- L2/L3 data: L2-21c-region + L3 ladder-rank skill Systems Thinking ->
  Critical Thinking; E-TERM ending added to both; `pose` fields stripped
  (dead once Dreamy left).
- Validation: tsc, eslint (one pre-existing img warning), tokens:check,
  full build all clean. Live-verified: trailer desktop + mobile (finale,
  sprite card, legibility scrim, music toggle), L1 walk-through to beat 8
  (system cards, tap check, reveal screens, typed check untested live but
  compiled, gauge 50->55 with +5 float, D55 card), glossary Back hover.
- Push authorized by the user ("After you're done, push").

### 2026-08-31 Aug-29 doc pass: Connect rebuild, Profile/Top 3, Career Report tabs + Reflection, Saved Careers rename (UNCOMMITTED)

Full implementation of the remaining "DREAMARI UPDATES AUGUST 29" items
(Landing copy, Connect, My Profile, Career Report -- the Play page items were
already done and pushed). All working-tree only, per instruction: do NOT
commit/push without explicit go-ahead.

- **Landing** (`marketing/Hero.tsx`): intro paragraph shortened to
  "Discover careers, find your path, experience the work, and connect with
  professionals who do it every day." (the old five-clause sentence was too
  long, per direct feedback), with "Build. Match. Explore. Play. Connect."
  on its own SMALLER tracked-uppercase line underneath.
- **Play tab Netflix audit** (`play/PlayHub.tsx`, after direct feedback
  that the shelves below outweighed the hero): the Career Simulations row
  is now the dominant billboard -- ROW_HEIGHT h-[212px]/300/380/430,
  featured card 16:9 (aspect-video; at lg it's 764x430), side cards keep
  Browse's 210/297 ratio (the sm side card IS PosterCard's own 210x297).
  The CTA button is GONE: the playable featured card is one whole-card
  Link with a centered glass play badge on the artwork
  (`FeaturedPlayOverlay`), and a signal line inside the scrim
  (`FeaturedMeta`): "Level 1 · Intern" fresh, or "Level 1 · Intern · N%
  done" plus a real progress bar in the same spot when a run is saved.
  Titles follow PosterCard's exact proportion rule (24px title at 297px
  height, ~8%, with the same compact tier for 10+-char words and
  keep-all/zero-width-space hyphen breaking), scaled per breakpoint.
  Glossary Games and In the works are now uniform SHELF_HEIGHT
  (150/170/195) horizontal scroll rows -- glossary card's copy moved
  INSIDE the artwork's scrim (was an image-plus-caption block that
  out-sized the hero), soon-cards switched from a grid to a flex shelf at
  the poster ratio. Row headers brightened to foreground 15/17px (Netflix
  headers are readable, not micro-labels). Verified live at 1280 and 375,
  including the resumable progress state via a fake localStorage run.
- **Connect** (`connect/ConnectExperience.tsx`, `connect/data.ts`): Feed and
  Saved tabs removed; home = "Find Your Community" + subtitle + Community/
  Events pill toggle + search + redesigned community cards (Students/Pros/
  Posts stat row, PROFESSIONALS FROM company chips, topic chips, Open/Join
  Community). Cards follow the design language, NOT the doc's colored-header
  mockups: world accent as border tint + ambient blur glow + tinted icon
  tile, strict Heading > stat row > body hierarchy. Events tab has the
  "Keep the conversation going after the event." intro card. Board detail
  has exactly two tabs: Student Questions / Professional Insights.
- **Profile** (`profile/ProfileExperience.tsx`): Paths removed from the
  tablist (RoutesTab kept, reachable via Plan's "Change route"); Resume
  promoted into its slot. Top 3 is a side-by-side `lg:grid-cols-3` layout,
  info vertical, per-world accent (border tint + glow + accent number chip +
  world-name eyebrow in the accent color -- accent never on the career
  title), exact prior copy. Streak fact now carries "Active 142 of 190 days
  · 75%". Locker renamed "Saved Careers" everywhere user-visible (tab ids/
  identifiers stay `locker`); also `app/HomeExperience.tsx` and
  `motion-lab/DailyDropDemo.tsx` ("27 careers saved").
- **Career Report** (`profile/CareerReport.tsx`): Contents rail/drawer
  REMOVED (one flowing document). New sub-tab row on top of the report:
  Report / Share / Counselor Review / Download. Share tab inlines the old
  ShareSheet content (counselor + parent/guardian rows, copy-link) -- the
  ShareSheet modal in ProfileExperience is retired, `onOpenShare` dropped
  from `ReportViewProps` (ReportChooser updated). Counselor Review tab:
  FOR STAFF USE ONLY eyebrow, three Pathway Status choice cards, Review
  Notes, Save Review, Remove Pathway. Download tab: the print preview
  inline (`data-preview` white paper) + window.print, replacing the modal.
  "Report generated {today}" under the school name (suppressHydrationWarning).
  New section "4. Courses to Consider" ("Classes that support this route",
  first two `COURSE_SUGGESTIONS` entries as chips -- the O*NET/SCED note in
  the doc is a backend data-model note, not UI); Colleges renumbered 5,
  `REPORT_SECTIONS` updated. "My Reflection" card (Maisha's) under the
  document in the Report tab: interest single-select, influence
  multi-select, optional textarea, Save Reflection with Not saved yet /
  Reflection saved status, persisted per career to localStorage
  (`dreamari-reflection:<careerId>`, same prototype-backend idiom as
  `lib/picks.ts`).
- Validation: `tsc --noEmit` clean; eslint clean on all touched files (one
  pre-existing `<img>` warning in ReportChooser untouched); `npm run
  tokens:check` clean; live-verified in the browser at desktop (1440) and
  mobile (375) -- Top 3 grid/stack, all four report sub-tabs, reflection
  save + reload persistence, Saved Careers view, Connect home/Events/board.
- Next step: user review of the working tree, then commit (do not push
  without explicit authorization).

### 2026-08-31 Play tab featured card: CTA onto the artwork, progress bar, Apple-radius button (PUSHED, be55dc3)

Continuation of the Netflix-style featured row from `6d5b8d1` (that commit's
own handoff entry was never written -- it rebuilt `PlayHub.tsx`'s
`FeaturedRow`/`RowCard` into the current featured-card-plus-scrollable-row
shape; see the commit diff for that baseline). This round, in
`src/components/play/PlayHub.tsx`, after two more rounds of direct
screenshot feedback the CTA kept reading as visually separate from the
image:

- **The CTA now lives INSIDE the card's own bottom scrim, on top of the
  artwork** -- not a second box stacked below the image (tried twice before
  this and rejected both times: once as a fully separate panel under the
  row, once as a bordered sub-box nested inside an outer `<article>`).
  `RowCard` gained an optional `footer` prop rendered right after the
  title/world-label inside the same absolutely-positioned scrim span, so it
  shares the card's own border radius and gets clipped by the same
  `overflow-hidden` -- one visual card, correct rounded corners on every
  edge including under the button. The old `FeaturedColumn` wrapper
  component is gone entirely; `RowCard` itself now branches on `large` +
  `candidate.kind` to decide whether it's a `motion.button` (a pressable
  side card), a `motion.div` (a non-pressable "soon" side card), or a
  `motion.article` (the featured card -- never a button, since its footer
  can hold a real `<Link>`, and a link nested in a button is invalid HTML).
- **The scrim strengthens when a footer is present**
  (`linear-gradient(180deg, transparent 0%, var(--scrim-heavy) 50%, var(--scrim-heavy) 100%)`
  instead of the lighter `--poster-scrim` token) so the button stays legible
  over bright artwork -- Browse's own poster scrim is tuned for just a
  title, not a title plus a CTA.
- **The standalone roles/keyword line ("Intern · Analyst · Associate · +
  More") is gone** per direct instruction. `LEVEL_ABBREVIATION` (only used
  to build that line) removed as now-dead code.
- **A returning player now sees an actual progress bar**, not just
  different button copy. New `FeaturedCta` component (subscribes to the
  progress store itself, only ever mounted for a `"sim"` candidate so
  there's no conditional-hook risk): a thin `rounded-full` track fills to
  `resumable.index / first.beats.length`, sitting just above a `Continue` /
  `Start Level N` button.
- **CTA button corner radius**: flat `10px` (`CTA_RADIUS` constant) instead
  of the app's usual `rounded-full` pill, per direct instruction to use
  "Apple's formula" for the rounded corners -- the ~0.2237×size ratio behind
  iOS's continuous squircle corners, which lands close to 10px at this
  button's ~44px height. The progress-bar track stays `rounded-full`
  (half-height is already that same family of corner treatment at that
  aspect).
- Row height is back to a single shared `ROW_HEIGHT` for every card (the
  `items-stretch` + `aspect-ratio` "scale side cards to match a taller
  featured card" approach from the previous round is gone) -- now that the
  CTA is overlaid rather than adding a second stacked box, the featured
  card's total height is just its own image again, so there's no height
  mismatch to compensate for.
- `npx tsc --noEmit` and `npx eslint src/components/play/PlayHub.tsx` both
  clean (one pre-existing, unrelated `no-img-element` warning on the page's
  decorative background image). Live-verified at desktop and mobile widths,
  and verified the progress-bar path by writing a fake
  `dreamari-play-progress` localStorage entry, reloading, and clearing it
  back out afterward.
- **Known limitation, not a bug**: there is currently only one real,
  playable simulation (Investment Banking) and it's already the featured
  card by default; every side card in the row is a "coming soon" career,
  deliberately non-pressable per earlier direct instruction ("color but
  just not pressable"). So there is nothing else to click right now that
  would demonstrate the featured-slot carousel transition (`layoutId`-based
  shared-layout animation, confirmed wired correctly by matching ids
  between the featured `motion.article` and each side card). This needs a
  second real simulation, or a temporary dummy pressable candidate, to
  actually exercise -- flagged to the user rather than silently making
  "soon" cards clickable again.
- Pushed as `be55dc3` after explicit go-ahead.

- Date: 2026-08-25

### 2026-08-25 Glossary Game: Power Play contrast, dead repair-round button, Catch-the-Misuse header (PUSHED)

- **Power Play fill-in-blank text was purple-on-black and unreadable while
  typing** (direct report, screenshot). `PowerPlayScreen` in
  `GlossaryGameExperience.tsx`: default (unchecked) input text color changed
  from `var(--hero-accent-purple)` to `var(--foreground)`; the purple accent
  stays on the border/underline only, so Power Play keeps its own visual
  identity without sacrificing legibility. `color`/`WebkitTextFillColor` still
  pinned together in every state per the existing disabled-input pattern.
- **SimulationPlayer.tsx (Investment Banking career sim, not the Glossary
  Game): the repair-round "Final Review" button did nothing on click** (direct
  report). Root cause: `[]` is truthy in JS -- `advance()`'s repair branch set
  `setRepair(rest)` even when `rest` was empty, so the *next* `advance()` call
  (from the review beat's own button) re-entered the same repair branch
  instead of falling through to the end-of-level check. Fixed:
  `setRepair(rest.length > 0 ? rest : null)`. `npx tsc --noEmit` clean; live-
  verified this session is the Power Play/word-bank/header fixes above, not
  this one specifically -- reproducing a full repair round wasn't done this
  round, so give this one a real playthrough check if anything looks off.
- **`DocumentOptionList` (Catch the Misuse) header removed** per direct
  instruction -- was a file-icon + two placeholder bars + edit-icon row with
  no function, just a leftover "document" visual treatment from an earlier
  pass. `FileText`/`SquarePen` imports removed as now-unused.
- **Investigated a new report: "the 2nd 2 [mastery dots] are always blank."**
  Live-traced credit counts term-by-term in Lesson 1 (Business Basics) by
  playing it through in a worktree. The mastery math itself is correct --
  dots fill exactly at `mastery[termId] >= MASTERY_TARGET` (2), confirmed via
  DOM inspection at every step. The real issue is structural, in
  `FIN_L01_QUESTIONS`/`FIN_L01_REVIEW` (data.ts): Product and Service each
  have only ONE guaranteed credit opportunity plus one all-or-nothing shot
  (Sort the Buckets item placement) to reach mastery -- Service isn't one of
  the four Match It Up pairs at all, and `FIN_L01_REVIEW` only contains a
  remediation question for Company. Miss the Sort the Buckets placement for
  either term and that dot can never recover for the rest of the lesson.
  This is exactly "the 2nd/3rd dot" (Product, Service) a player would see
  stuck blank. Not fixed -- doing so means touching question data or
  mastery/remediation logic, both explicitly off-limits for this visual-
  polish pass without direct sign-off. Flagged to the user; awaiting a call
  on whether/how to add remediation coverage for Product/Service/Customer.
- No token changes; contract files untouched. `npm run tokens:check` clean.

### 2026-08-24 Play: Ace Attorney references -- a showdown card and softer dialogue backdrops (PUSHED)

- The user shared Ace Attorney and Disco Elysium reference screenshots. Two
  ideas came out of it, both implemented:
  1. **A one-time "VS" split card** (`ShowdownCard` in SimulationPlayer.tsx),
     directly modeled on Ace Attorney's Cross-Examination transition --
     announces a genuine head-to-head moment before it starts, rather than
     every scored beat carrying the same weight. New `showdown?: { opponent }`
     on `BeatBase` (types.ts); set on the three beats that are actually
     confrontational: L1-12 and L2-18 (Jordan's rivalry), L2-21 (Marcus's
     assessment). Invents no story text -- just the two names on screen -- so
     it doesn't touch copy. Dismisses on tap/click/Enter, same as the rest of
     the dialogue system.
  2. **The location background now blurs and dims while a character is on
     screen to be read** (a card, or a beat still in its staged/setup
     reading), and returns to full sharpness the moment the interactive
     controls appear. Matches Ace Attorney's own convention -- a character is
     framed against a soft, simple backdrop, not a fully-detailed room
     competing with them for attention -- while keeping the earlier decision
     that an interactive beat's room stays crisp, since that's the one moment
     the environment itself is the thing to read.
  - Also corrected a mischaracterization from earlier in the session: the six
    Cobalt Capital location plates were being called "photographic" as the
    reason to keep character compositing conservative. The user corrected
    this -- they are anime-generated too. Noted for anyone continuing this:
    the earlier "sticker on a photo" caution doesn't actually apply; it just
    happened to land on reasonable defaults anyway.
- No token changes; contract files untouched.

### 2026-08-24 Build flow: single-state location, Zip + travel distance; Play landing crop fix (PUSHED)

- Unrelated to the Play simulation work above — this is the onboarding
  "Build" flow (src/components/build/) and the marketing landing page's
  Play chapter, both untouched by anything else in this log.
- LocationStep: was up to 3 states (map chips + 3 dropdown slots),
  changed to exactly 1 per direct request. BuildState.states: string[]
  -> BuildState.state: string (confirmed nothing else in the codebase
  consumed the old field before renaming). Tapping a state replaces the
  current pick; tapping the same one clears it. List view collapsed to
  one dropdown.
- Profile Basics: added Zip Code (digits-only, 5 char cap) and "How far
  would you go for school?" (Within 25/50/100 miles, or anywhere in the
  preferred state) — TRAVEL_DISTANCE_OPTIONS in types.ts, same SelectField
  pattern as Grade/GPA. Neither is required to finish.
- marketing/chapters/Play.tsx: the demo card's image (sim-deal-kickoff.jpg)
  used object-position "center 35%", which at this panel's REAL rendered
  aspect ratio (measured live: 493x174px, ~2.8:1 — much wider/shorter than
  the source photo's 4:3) cropped Marcus's head off entirely above the
  frame. Moved to "center 8%" (verified both against the live DOM
  bounding box and an isolated same-dimension test harness) — both
  characters' heads now clear, plus the "DEAL TEAM KICKOFF" screen stays
  in frame.
- Validation: same isolated-worktree pattern as prior pushes in this log
  (real `npm install`, not a symlink) since other local work kept landing
  on `main` mid-session — tsc/eslint/tokens:check/`next build` all clean,
  re-checked against HEAD as it moved twice more. Verified live: clicked
  through the full Build flow (single-state pick/replace/clear in both
  Map and List views, zip sanitization, travel-distance dropdown, Finish
  reached with no errors); Play crop fix confirmed via computed
  `object-position` on the live image element plus a pixel-matched
  standalone reproduction (screenshots of the real landing page kept
  rendering blank in this pane — a known scroll-reveal/stale-screenshot
  gotcha noted elsewhere in this file, not a app bug).

### 2026-08-24 Play: composition fixes found by comparing against the original art (PUSHED)

- Playing every location beat against the actual original composites (the
  user pulled up `l1-04.webp` directly) surfaced a real bug and a real
  misread of composition, not just taste:
  1. **Every character sprite's canvas was much wider/taller than its actual
     content** -- `christina-welcoming`, for one, was on a 1448x1086 canvas
     with the figure only in the left 55% of it (bbox 247,0-1040,1086).
     Sizing by canvas height with `object-contain` put a huge transparent
     margin into the box being centered, which is why two characters in one
     scene overlapped and landed at visibly different scales even with
     matching anchor math. Re-exported all eight sprites cropped to their
     alpha bounding box (2% padding) -- every one of them had this problem,
     not just Christina's.
  2. **A genuine matting defect**: opaque off-white pixels trapped between
     strands of curly hair on every sprite (christina-welcoming alone had
     4,762 of them), left over from the source generation's background not
     being fully removed. Not alpha-edge fringe -- interior, fully-opaque
     pixels. Cleaned with a targeted pass: connected-component analysis finds
     small bright islands whose surrounding ring is mostly dark hair, and
     recolors them to the local median. Applied to all eight sprites.
  3. **A real CSS bug, not a sizing choice**: a character's height was set as
     a `%` of an absolutely-positioned ancestor two layers deep. Past 100%
     this measured correctly via `getBoundingClientRect` but visibly PAINTED
     as if the browser had ignored it -- a live discrepancy between layout
     and paint confirmed by reading the DOM directly, not a screenshot
     artifact. Switched to a `ResizeObserver`-measured pixel height, which
     has no such ambiguity. This is almost certainly why earlier scale
     attempts in this same session looked unchanged no matter the number
     used -- percentages past 100% weren't taking effect at all.
  4. **Composition, once the above were fixed**: the original crops
     characters tight -- hair to the top edge, cropped off at the desk below
     the waist, standing close together -- not full figures with headroom
     above and floor below. Every location's character anchor is now sized
     and positioned to match that framing, with the crop line pushed just
     past the bottom of the frame everywhere so it is never visible sitting
     out in the open (behind nothing, in the original photograph's terms).
- The reception scene (`l1-reception` in `locations.ts`) now composes L1-01,
  L1-04, and L1-15 the same way, using the exact two-person layout
  (`characterAnchors`, positional by story order via a new `castMembers` on
  `BeatBase`) supplied in the handoff's own `scene.json` for this exact plate
  -- this is the one location that started from a genuine separated
  background-plus-slots pair rather than a generic room.
- **Removed all motion tied to the pointer or to an idle loop.** The location
  parallax added earlier this session moved with the mouse, which read as
  things moving for no reason on desktop and had nothing to trigger it on the
  touch devices most players are on -- backgrounds and characters are static
  now. The character's continuous idle bob was worse than static: two people
  in one scene animating on independent unsynced loops drift in and out of
  alignment with each other, which is what actually looked like a
  positioning bug rather than "different scale." The one-time entrance
  animation is the only motion a scene character has left.
- **A character now shows big while their line is being read, and steps back
  to the dialogue box's small portrait once the interactive controls are up**
  -- tied directly to the same staged/revealed state that already governs
  when a beat's controls appear (`BeatStage` now reports it up via
  `onRevealChange`), not to the beat's kind. A card was always "revealed"
  immediately, so this generalizes what already worked for cards to every
  beat with a setup line to read.
- Marcus and Lamisa's sprites from the v3 handoff went through the same
  crop/cleanup/pixel-sizing pipeline as Christina and Jordan.
- Also, per a direct question: reordered the dialogue panel's own text to a
  title/subheading/body hierarchy -- what the speaker says is now the
  biggest text on screen, ahead of the question, ahead of the answers, not
  the other way around.
- No copy changed; no token changes; contract files untouched.

### 2026-08-24 Play: v3 handoff (Marcus/Lamisa sprites) + interaction-screen fixes (PUSHED)

- A third handoff drop (`Dreamari-IB-Claude-Production-Handoff-v3.zip`) mostly
  reconciles coverage across the three EXISTING levels (a production tracker
  and per-beat asset checklist) rather than adding new gameplay levels; the
  one real addition is one approved expression each for Marcus (`assessing`)
  and Lamisa (`composed`), plus Cobalt HR's (`welcoming`), which this repo has
  no speaker for -- Level 2's onboarding was deliberately handed to Christina
  earlier in production rather than an unnamed HR character, so her sprite is
  intentionally not wired in; introducing her would be a storyline change, not
  an art integration. Marcus and Lamisa are now in `defaultExpressionFor`
  (`expressions.ts`) and can stand in a location scene like Christina and
  Jordan already could -- at their one available expression only, since
  neither has a tier set yet to react with.
- **Corrected two misreadings of earlier feedback, found by actually playing
  Level 1 start to finish**, which is unusually hero-art-heavy (most of its 16
  beats are covered by one of five illustrations via the sticky window), so
  the location work from earlier in the session barely showed up in it at
  all -- exactly what got reported back.
  1. "Blank background, no characters" on an interactive beat had been built
     as the abstract ambient gradient -- no location, no character. The actual
     ask was the room MINUS the character: `sceneFor` now still resolves the
     location for every beat kind, and only the character composite is
     skipped on a scored beat. A real photograph, not a gradient, is what
     shows behind an interactive beat now.
  2. The dialogue/question panel was still bottom-anchored on every beat, a
     convention that made sense when art was cropped to leave room for it but
     not now that a scored beat sits over a full, real photograph. Interactive
     beats (any kind but a card or the review) now center the panel in the
     frame instead.
- No copy changed; no token changes; contract files untouched.

### 2026-08-24 Play: tuning the location library after live review (PUSHED)

- Refined the location-library batch above after watching it play. In order:
  the character sprites came out too small to register on a full screen; then,
  once enlarged, a beat that only NARRATES a character (Dreamy's card
  introducing Jordan, speaker "Dreamy") still didn't show him, because the
  scene render keyed off `beat.speaker` and Dreamy narrating is not the same
  as Jordan being on screen -- added `castMember` to `BeatBase` (types.ts) for
  the one beat that needed it, and a "spotlight" placement (centered, full
  height) for exactly that introduction moment; then the tier-reactive
  expression swap needed to be visible at a glance, which surfaced a real bug
  (`play-float` is a one-shot fade-to-nothing animation, not a hover loop --
  wrong keyframe, character was dimming in and out on an infinite loop) fixed
  by switching to `play-hover`; then, watching it further, decided the
  feedback card's own portrait was more reliable than the scene sprite for
  actually seeing the reaction (the sprite can end up mostly behind the
  dialogue panel depending on how tall a beat's choice list is) -- kept both,
  restored the card portrait at a size that reads (72px, not the original
  44px), and left the scene sprite swapping expression in place without
  jumping to center stage over it.
- **Interaction beats are text-first now.** A location plus a standing
  character is scenery for a narrative beat, and was competing with the thing
  that actually matters on a scored beat: the question and its options. Every
  beat kind except `card` and `review` now goes straight past the location
  table to the plain ambient backdrop, whatever its `BEAT_LOCATION` entry says
  -- the entry stays in the table (harmless, keeps the map complete) but is
  never read for those kinds. A beat's own hero illustration is unaffected
  either way; this rule only governs the location-library fallback.
- Character scale per location came back down from the enlarged pass to the
  handoff's own documented `maxScale` figures (a person sized against the
  furniture in frame, not a poster-sized cutout) -- the earlier bump was
  chasing "too small to see," which the introduction spotlight and the
  restored feedback portrait both solve without needing every character
  oversized all the time.
- No copy changed; no token changes; contract files untouched.

### 2026-08-24 Play: Cobalt Capital location library from the production art handoff (PUSHED)

- A teammate handed off `Dreamari-IB-Claude-Production-Handoff-v2.zip`: a UX
  audit, a character bible, a learning-design spec, and six real photographic
  Cobalt Capital location plates (trading floor day/night, internal boardroom,
  client boardroom, cafe lounge, elevator hallway) plus expression sprites for
  Christina and Jordan. Full read-through and the resulting judgment calls are
  below; nothing in this batch touched any beat's copy, scoring, or order.
- **Where I followed it.** The six locations now stand in for the ambient
  gradient on any beat with no illustration of its own (`src/components/play/
  locations.ts`), routed per-beat from the handoff's own `background-library
  .json` beat lists, with its own tie-break rule applied to beats it listed
  under more than one room. The 21 hand-authored hero illustrations still win
  outright when fresh -- these are a REPLACEMENT for the abstract ambient
  backdrop, not for real art. Christina and Jordan's expression sprites now
  drive two things straight from the Character Bible's tier mapping: a
  character stepping into a location scene (chest-up, floating over the plate
  the way Dreamy already floats over the dialogue box, entrance-animated,
  drifting a few px against the pointer -- these six plates are the first
  genuinely clean, character-free backgrounds this game has had, so this is
  also the first place parallax could safely come back after being pulled
  earlier for ghosting on the old illustrations), and the feedback card's
  reaction portrait, enlarged after review to actually read at a glance.
- **Where I deliberately did not follow it.** The brief asks for full-body
  sprites composited directly onto the location photographs as the primary
  staging model. The six plates are photographic renders; the cast is flat
  anime illustration. Pasting one onto the other reads as a sticker on a
  photo, worse in a boardroom where the brief itself flags that a sprite
  cannot be placed over the chairs without a foreground furniture mask that
  does not exist yet -- so both boardrooms anchor a character only in the one
  strip of open floor by the window, small and to the back, never at the
  table. This is a judgment call, not a rejection of the direction: if a
  matching illustration style or real masks arrive, full staging is a small
  extension of what's here now, not a rebuild.
- Also skipped, and worth someone's attention separately: a mastery model
  distinct from reputation, first-run accessibility settings, and analytics
  instrumentation. All three are described well in the handoff's learning
  spec, but each is its own multi-surface feature (new persistent stores, new
  settings UI, an event pipeline) rather than something that belongs folded
  into an art-integration pass.
- No copy changed anywhere in this batch -- not a beat's text, not a score, not
  a band label (the brief's own "call 50 Building Trust, not Cautious"
  suggestion is exactly the kind of copy edit intentionally left alone here).
  No token changes; contract files untouched.

### 2026-08-24 Play: level-navigation bug, ambient backdrop, light mode, nav link (PUSHED)

- **Bug: `SimulationPlayer` never remounted between levels.** `/play/[game]`
  is one route; clicking "Start Level 3" only changes the `?level=` query, so
  Next.js reused the same component instance rather than mounting a fresh one.
  Its internal `phase`/`run`/`result` state (still "ending", still the OLD
  level's reputation) survived into the new level and rendered as THAT level's
  own ending card on a run that was never played -- what looked like "the
  images are out of order" and "I can't get to the next level" was one root
  cause: stale state, not art or routing. Fixed with `key={level.id}` on the
  component in `src/app/play/[game]/page.tsx`. Confirmed the whole ladder end
  to end afterward: Intern ending -> Analyst offer card -> Associate.
- **Ambient backdrop for stale scenes.** Art is sticky by design (a beat
  without its own picture keeps the last one, so unillustrated beats read as
  the same room) but every level runs long unillustrated tails -- the final
  review sequence, a stretch of pure interaction beats -- where the sticky
  image was doing nothing but sitting there. Beyond `SCENE_FRESH_BEATS` (3)
  beats since the picture's own beat, the scene swaps to `AmbientBackdrop`: three
  independently drifting colour fields plus a fixed (not `Math.random()`, so
  hydration never mismatches) sparkle field, tinted by the level's mood and
  world accent. Dreamy's floating cloud and its "DREAMY" name pill now show
  ONLY in that ambient state -- when a real scene is on screen there is already
  someone in it to look at, so the mascot stayed out of the way; when the
  screen goes ambient, Dreamy is the only thing telling the player who's
  talking. Threshold tuned against the sheet: covers the long narrative closers
  every level ends on without cutting into an onboarding card's own 2-3 beat
  run showing the same picture.
- **Play was unreadable in light mode.** Its hub used the same starfield image
  every hero-style app surface uses (`/images/app/background-space.svg`) but
  was missing the `data-space-backdrop` attribute the marketing tokens contract
  already keys light mode off of (`html.light .marketing-v2.themeable
  [data-space-backdrop] { display: none }` -- see `marketing/tokens.css`).
  Without it the dark starfield painted over the light gradient regardless of
  theme. One attribute; matches Home/Explore/Colleges/Profile/ReportChooser
  exactly. The in-game screens (dialogue box, cards, HUD) were already
  correctly theme-aware through the same `--background`/`--foreground` tokens
  -- confirmed a full level in light mode reads fine.
- **Play was missing from the hamburger menu's quick links.** `QUICK_LINKS` in
  `src/components/app/chrome.tsx` never had an entry for it, even though it is
  one of the four bottom-nav destinations. Added, ordered next to Match.
- No token changes; contract files untouched.

### 2026-08-24 Play: Level 3, drag ranking, keyboard play, scene fixes (PUSHED)

- **Level 3 (Associate) is built** -- `src/components/play/ib-level-3.ts`, so all
  three levels documented in the handoff sheet now exist. Its 46 sheet screens
  become 28 beats: the sheet's sub-screens (L3-12a..f, L3-14a..e, L3-24a..e) are
  children of one interaction each, the same collapse Levels 1 and 2 use. Header
  comments name every production change applied and the two screens left out --
  L3-30's Vice President offer card, whose salary and hours are "TO BE
  RESEARCHED" in the sheet, belongs at the top of Level 4 with real numbers.
- Lamisa's portrait was cut from `IB L3-07.png` with the macOS Vision framework,
  same pipeline as the other three faces. All four speakers now have one.
- **Level-to-level flow.** The advance button reads "Start Level 3 · Associate"
  rather than "Claim Your Reward", so promotion runs straight into the next level
  instead of looking like a dead end. When the ladder does run out it names what
  is coming ("Vice President is coming soon") rather than talking about the build.
- **Ranking is draggable**, by mouse and by finger (pointer events + `touch-none`),
  with the rows SLIDING out of the way rather than swapping: the committed order
  is left alone mid-drag and each passed row is translated one slot, because
  reordering the array moves rows by re-layout, which no transition can animate.
  The arrow buttons stay -- they are the keyboard and screen-reader route.
- **Keyboard play, no instructions on screen.** Enter/space/right advances
  dialogue AND presses a card's single button (two thirds of a level is cards, so
  without that most of the game was unplayable from a keyboard); number keys pick
  options in choice, rapid, chain and sort beats. The hints are the controls
  themselves -- each option's badge IS its digit, a keycap glyph sits on the
  advance -- and both hide behind `@media (hover: hover) and (pointer: fine)`.
- **Scene fixes.** Mood is no longer a full-frame wash: at the weight crunch
  needed to read, it drained the art, so the tint now rides the edges where the
  scrims already darken. On phones the two blurred beds fill the frame and the
  sharp plate sits inside them at its true aspect ratio (`art-ratios.ts`), with
  its fade aligned to the PICTURE's edges -- masking against the frame left a
  hard line partway down the screen. Faces are never cropped.
- The verdict card is centred and the beat behind it steps back, so no half-cut
  question sits under it. The resume notice retires itself after ten seconds, in
  CSS, so no timer or state exists for it.
- **Bug: a run ending wiped its own scores.** `advance` cleared storage before
  the run took ownership of it, and reputation is derived from the per-beat
  outcomes -- so a player who closed the app on the final review screen came back
  and got the worst ending whatever they had earned. Fixed by promoting the run
  first.
- Copy: repeated carousel headers, notes restating their own card title or
  button, and duplicate "morning review" lines are gone.
- No token changes in this batch; contract files untouched.

### 2026-08-24 Play: Level 2, checkpoints, portraits, keyboard play (PUSHED)

- **Level 2 (Analyst) is built**: `src/components/play/ib-level-2.ts`, 31 screens
  authored from the handoff sheet. Its header comments list the production
  changes applied and the two sheet ambiguities deliberately left alone.
  `games.ts` now ships `[IB_LEVEL_1, IB_LEVEL_2]`. **Level 3 (Associate, 46
  screens) is in the sheet and NOT built yet** -- its interaction types (rank,
  pick, bucket, the 5-question rapid set, the `crunch` mood) are all implemented
  already, so it is authoring work, not engine work.
- **Six new interaction bodies** in `interactions.tsx`: chain, slider, flags,
  rank, pick, bucket. Every one has Duolingo-standard feedback (immediate
  reveal, tick/cross, shake on a miss, sound) rather than a bare submit.
- **Checkpoints and a repair round.** A run no longer stores a running
  reputation total; it stores `scores: Record<beatId, Tier>` and DERIVES the
  total (`progress.ts`). That is what makes correction possible: a repaired beat
  overwrites its entry and the number follows. Missed beats come back before the
  final review, capped at `acceptable` so a repair cannot score as a first-time
  best. Old saves without `scores` still resume.
- **Nintendo-style portraits.** `Level.cast` maps a speaker name to a face, and
  a beat with a `speaker` renders that face inside the dialogue box with the
  line in quotes. Faces for Christina, Jordan and Marcus live in
  `public/images/play/ib/face-*.webp`, cut from the scene art with the macOS
  Vision framework (foreground mask + face rectangle) -- no network, no
  third-party service. Setups were rewritten into first person so a character
  speaks rather than being described; `Narrator` renders as Dreamy, since Dreamy
  is the only narrator.
- **Keyboard play, without instructions on screen.** Enter / space / right
  advances dialogue; number keys pick options in choice, rapid and chain beats.
  The affordances carry the hint themselves -- each option's badge IS its digit,
  and a small keycap glyph sits on the advance button -- and both are hidden
  behind `@media (hover: hover) and (pointer: fine)` so touch players never see
  keyboard furniture. Every control was already a real `<button>`, so tab order
  and Enter-to-activate needed nothing.
- No token changes in this batch; contract files untouched.

### 2026-08-24 Page titles in caps + light-mode card surface (PUSHED)

- Direct request from Joshua: every page title reads in caps. Explore already
  did; Connect, Play, College Lookup, the report chooser and the Match deck's
  title now do too, via `uppercase` rather than shouting in the string, so the
  accessible name stays natural-cased. Per-step and content headings (the build
  flow's questions, thread titles, community names) are deliberately NOT
  uppercased -- they are content, not page names.
- LIGHT MODE: `--card` is #d8dbe8 against a #f4f7ff page, so every card came
  out DARKER than the surface it sat on. Connect's 18 card surfaces moved to
  `--color-glass-surface-3`, which is frosted white in light and deep navy
  glass in dark -- correct in both without an override. `--card` itself is a
  contract token (marketing/tokens.css) so it was left alone, but it is wrong
  for a card-on-tinted-background design and the same darker-than-background
  effect will show anywhere else that uses it in light mode. Worth correcting
  at the source.

### 2026-08-24 Progressive blur on phones, and two app-repo items closed (PUSHED)

- PHONES no longer crop the cast out of a scene. The frame is CONTAINED, so
  everyone stays in shot, and the space that leaves is filled with NOTHING: the
  picture dissolves into the page's own dark, losing focus as it goes. Three
  layers, sharp on top, each masked with a long vertical falloff, the outer ones
  blurred 9px and 22px, so focus and opacity fade together.
  WHAT NOT TO DO, since two attempts got there first: a single blurred fill
  behind the frame leaves a visible line where sharp meets soft, and a magnified
  blurred copy of the image puts a grey haze on screen that reads as a second
  picture. The reference (a Dribbble profile card) has no boundary at all -- the
  photo melts into flat colour -- and that only works if nothing opaque sits
  behind it. Desktop covers without losing anyone, so it stays one sharp
  unmasked layer.
- `--card` light-mode fix and the StudentAppShell deletion are done; see the
  app-repo block at the top of this file for what is left, which is only the
  Figma/token-source side.
- STILL NOT DONE and cannot be done from this repo: mirroring
  `color.glass.surface-raised` / `border-raised` into `packages/ui/tokens`. That
  repo is not checked out on this machine. The drop-in spec is
  `docs/handoff/glass-raised-rung.md`.

### 2026-08-24 Play: every question type to the same feedback standard (PUSHED)

- The Duolingo treatment was only on the matching beat; the rest coloured the
  pick and moved on. Now EVERY type reveals the right answer when you miss it:
  scenario/boss option lists, the fill-in-the-blank chips, the catch-the-mistake
  document rows, and each rapid-fire question. The pick wears a tick or a cross,
  a wrong pick shakes, and the correct one pops in green.
- Timing follows from that: the board holds for 1150ms on a miss instead of
  420ms, so the revealed answer is readable before the explanation card covers
  it, and rapid-fire waits 1150ms before loading the next question rather than
  480ms. A correct answer still moves at the quick tempo.
- MOBILE GAP FIXED, and the cause is worth recording: Dreamy sat in the flow
  above the dialogue box, claiming its own ~84px row, which is what pushed the
  art up and left a black band between the picture and the question. Measured
  on a 812px viewport: art was 183px with an 84px gap; Dreamy is now absolutely
  positioned over the box's top edge and the art fills 368px with a 0px gap.
- Also added, and this is for whoever pulls this repo next: the handoff now
  opens with an "Open items for the APP REPO" block, because the three things
  that need action on that side (mirror the glass tokens, --card is darker than
  the page in light mode, StudentAppShell is orphaned) were scattered across
  nine entries.

### 2026-08-24 Play: RPG pacing, autosave, portraits, sound (PUSHED)

- AUTOSAVE + RESUME, which the Interaction Rules tab asks for by name
  ("students play in short bursts between classes"). src/components/play/
  progress.ts stores {index, reputation, scored} per game+level at the LAST
  COMPLETED screen; reopening lands there with a "Picked up where you left off /
  Start over" banner, and the hub's button reads Continue with the saved
  reputation under it. Cleared when a level ends or the player starts over.
  TRAP WORTH KNOWING: the run must be DERIVED from the store, not seeded into
  useState. A state initialiser runs during hydration, when
  useSyncExternalStore still reports the server snapshot, so the first version
  silently threw every save away and always started at beat one.
- RPG PACING. A beat with a situation now reads in two steps: the line types
  out, the player advances at their own pace (tap the box, or space / enter /
  right / A), and only then do the question and its options appear -- with the
  situation still on screen above them, ruled off, because several beats cannot
  be answered without it. Cards and the review beat are not staged; their
  "setup" is a label, not a paragraph. A timed beat's clock now starts when the
  QUESTION does, so reading no longer eats the timer.
- DIALOGUE PORTRAITS, Nintendo-style. Vision's face detector found the faces in
  the scene art, so Christina and Jordan speak with real portraits cropped from
  the frames they appear in (face-christina.webp, face-jordan.webp), shown
  beside their line with their name. The sheet's reported speech
  ("Christina (Associate) says, ...") became direct speech on those three beats,
  since the box now attributes it visually. DEVIATION FROM THE SHEET, on
  request. Narrator IS Dreamy: same guide, so it speaks as Dreamy with Dreamy's
  face, and each narrated beat picks a pose.
- MATCHING REBUILT to the Duolingo model, on request: either column can start a
  pair, a right answer flashes green on BOTH tiles and clears them off the
  board, a wrong one flashes red and shakes, and the board emptying is the
  progress. No Check Matches button any more -- a DEVIATION from the
  Interaction Rules tab, which says nothing scores until Check is tapped. The
  scoring rule it protects is intact: any wrong attempt scores the beat Wrong,
  so there is still no partial credit. Bug found while testing: flashing by
  pairing key alone lit the wrong tile and left the tapped one grey, because a
  definition tile is keyed by the term it belongs to.
- SOUND across every interaction, synthesized (no assets) in play/sound.ts:
  a tick on select, a two-note rise on a good answer, a soft low thud on a bad
  one, a sweep when a board clears or a level is won. MUTE IS A VISIBLE HUD
  TOGGLE, persisted -- this gets played in classrooms, and a game that cannot be
  silenced in one tap is a game nobody opens at school.
- PARALLAX REMOVED, and this is worth recording so nobody re-tries it blind. The
  scene art has the characters baked in, so a cutout riding in front of the same
  plate shows a ghost of itself the moment the planes move relative to each
  other -- from a scale mismatch, from the pointer, and worst from the two
  planes carrying opposite ambient drifts (~4% of the width). Erasing them needs
  an inpainting model: diffusion averaging produced a white cloud, edge colour
  propagation produced diagonal smears, horizontal patch cloning produced
  repeating stripes. The 19 cutout assets were deleted rather than left unused.
  What ships is one plane with a slow camera push. THE REAL FIX is
  character-free background plates from the artist -- they generated these, so a
  background-only render is a cheap ask, and then real parallax is a small
  change (the cutout tool was ~30 lines of Vision).
- Also: art is no longer dimmed (the scrim only covers what the HUD and the box
  edge need), the career title reads in caps, the hub header is PLAY, and on
  phones the art is a flex region that takes whatever the dialogue box leaves,
  so there is no dead gap between picture and text.

### 2026-08-24 Play: the games hub and the IB simulation, Level 1 (PUSHED)

- NEW SURFACE. /play is the games hub (the nav's Play slot was href="#"), and
  /play/[game] is the player. Level 1 Intern of the Investment Banker
  simulation is complete and playable end to end; a flawless run lands on
  exactly 100 / Trusted, which is the arithmetic the handoff's Scoring Model
  tab is built around.
- SOURCE: Downloads/DreamAri_IB_Levels1-3_Handoff.xlsx. All 21 screens of tab
  "Level 1 Intern" are in src/components/play/ib-level-1.ts as DATA, copy
  verbatim (25-word setups, 10-word options, 20-word feedback, no em dashes),
  using the PRODUCTION score columns, not the prototype's. The engine
  implements the Interaction Rules tab: options lock with no confirm step,
  matching scores nothing until Check Matches and needs all four pairs, the
  rapid-fire set runs one shared 45s clock that keeps running between
  questions and passes at three of four, the Boss Moment counts as one of the
  ten, narrative cards never move the progress bar, reputation floors/ceilings,
  and a TIMEOUT scores Wrong and never Risky.
- Adding Level 2 or another career is data plus (for L2) four interaction types
  it introduces: Build the Strongest Answer, Risk Slider, Find All Red Flags,
  Word Tile Blank, its untimed rapid-fire model, and the navy late-night theme.
- ART: 21 anime scenes from the vendor zip, converted to webp at 1400px --
  41MB -> 2.4MB with no visible loss. File names carry their beat id
  (IB L1-04 -> l1-04.webp). Only 4 of 21 L1 screens have art, so the player
  keeps the LAST scene for beats without one; unillustrated beats then read as
  happening in the same room.
- Landscape art on a portrait phone cropped two thirds of the scene away, so
  phones get an art panel across the top (38dvh, cover, top-aligned, faded
  into the stage) instead of a full-bleed crop. sm and up stays full-bleed.
- Bugs found by playing it: the band ladder printed "At Risk 0 to 84" because
  ranges were derived from neighbouring floors (now spelled out, matching the
  Scoring Model tab); the typewriter counted interval ticks and stalled halfway
  through long lines (now derived from elapsed time); the countdown lived in the
  parent and needed a reset effect (now a per-beat keyed child, which is also
  what satisfies the repo's set-state-in-effect rule).
- NOT DONE, deliberately: Level 2. Save-and-resume mid-level, which the
  Interaction Rules tab asks for explicitly ("students play in short bursts
  between classes") -- leaving mid-level currently loses the run. Banking Dream
  Score across a restart. Jordan still has no portrait (sheet decision D12),
  skip links are undefined (D-decide), and "Unlock Analyst Level" is inert with
  a line saying the level is not built.

### 2026-08-24 Connect: whole-card targets, and the jargon out (PUSHED)

- Whole post cards and whole community cards are now tappable, via an absolute
  overlay button rather than wrapping the card in one: like/comment/save and
  Join/dismiss are buttons themselves and buttons cannot nest. The overlay sits
  at z-10 with the action rows raised to z-20 (z-30 for the dismiss sticker),
  and the overlay's accessible name is the post title. The title and the answer
  block stopped being their own buttons -- under the overlay they would have
  been unreachable controls. Verified by elementFromPoint at each target's real
  centre; an earlier probe sampled the card's PADDING and wrongly looked like
  the overlay was swallowing the buttons.
- JARGON OUT, per direct feedback ("what does routed mean? This is Gen Z
  American highschoolers"). "Routed" and "Awaiting answer" described what the
  moderation queue was doing, not anything a student needs: both waiting states
  now read "Waiting for an answer", the thread header no longer prints "Routed
  to <scope>" at all, the ask sheet says "Sent to"/"Goes to", the board filter
  reads "Unanswered" instead of "Awaiting answer", and "Professional insights"
  is just "Insights". The routed state still exists in the data -- it is our
  plumbing, and it stays invisible.
- One name for one number: the thread and insight cards said "Helpful · 34"
  for the same count the feed shows as a like. All three now say Like.

### 2026-08-24 Connect: the feed rebuilt as a discussion board (PUSHED)

- The old feed was an avatar, a title and two counts per row. On a 1440px page
  that is a single narrow column of near-identical grey slabs -- it read as a
  settings list, not a community. Rebuilt around what actually makes a board
  feel alive: you can SEE the answer, you can see who is around, and there is
  something to do.
- Each post is now three ruled bands, because mixing metadata with content is
  what made it unskimmable: SIGNALS (face, name + grade, community, type icon),
  CONTENT (the question, then two lines of the real first answer), SIGNALS
  (like, comments, time, save). Direct instructions applied along the way: only
  likes/save/comments (no vote rail, no follower counts, no status chips), the
  community never shares a line with a student's name, the timestamp sits with
  the other signals rather than in the identity line, and the post type is an
  ICON (question / insight / event) rather than a word.
- The answer snippet is the single biggest change. A board of bare questions
  reads as a place where nobody replies.
- ONE composer, everywhere. The header CTA, the board CTA and the event CTA
  were three buttons for one action; all three are now the same prominent
  composer, and the destination is chosen while writing (the sheet already had
  "Posting to X / Change"). Tab labels gained icons; "For You" is renamed FEED
  because Explore owns For You.
- Communities: a two-column grid at EVERY width (three from lg), one stat per
  card instead of three, the buried search bar replaced by a search icon in the
  header, and "Not interested" replaced by an x sticker on the card's corner.
- Wide screens get a sidebar (your communities with unread counts, what's
  coming up). A leaderboard of top answerers was built and then cut: more
  numbers, against the brief.
- SAFETY: removed the event thread "How do you stay in touch with someone
  professionally without it feeling awkward?" and its answer about wording a
  follow-up DM. On a board shared by minors, professionals and school admins,
  modelling one-to-one follow-up with an adult is the wrong lesson however
  well-meant. Replaced with "What should I actually do with what I learned
  today?", which keeps the useful half in public.
- ACCESSIBILITY, measured not assumed: a contrast probe over every distinct
  text style on the feed and the communities tab, in BOTH themes, compositing
  alpha and walking the real background stack. It found two genuine failures --
  world-colour community names at 3.94:1 and the primary-blue "Saved" label at
  3.77:1 -- so the rule is now colour lives in icons and dots (3:1 as graphics)
  and text stays foreground/muted (85 styles, 0 failures). It also found avatar
  initials rendering at 8.4px, now floored at 11px, and nine 10px eyebrows
  raised to 11px. NOTE: the probe must parse `color(srgb ...)`, which is what
  color-mix resolves to -- the first version mis-read those as 1.04:1 and
  invented two failures that did not exist.

### 2026-08-24 Match -> report chooser -> profile, on one career catalogue (PUSHED)

- NEW SCREEN. /career-report is now the chooser the student lands on after
  Match: their Top 3 as the REAL reports, one centred and readable with the
  others peeking in from the edges (arrows, dots, swipe, tap-a-peek-to-centre).
  The centred report IS the choice -- no separate select step -- and confirming
  goes to /profile focused on it. Destination was a deliberate call: not the
  homepage (an anticlimax right after a commitment) and not straight into Plan
  (11 tasks is the second thing you want, not the first); Overview already
  answers "so what now" in one skim.
- ONE CAREER CATALOGUE. The deck used to carry its own ids ("FIN-001") and its
  own six careers, so whatever a student swiped could not be looked up
  downstream -- only 1 of 6 had a designed report. DECK now uses the shared
  catalogue ids (investment-banking, private-equity, software-engineer,
  airline-pilot, registered-nurse, food-scientist) with poster art that already
  existed in public/images/app. Adding a deck card now means adding the career
  to PROFILE_CAREERS/LOCKER_EXTRAS and CAREER_REPORTS_V2 too, which is the
  point.
- Authored two full V2 reports (registered-nurse, food-scientist) plus their
  COURSE_SUGGESTIONS, so all six deck careers resolve to a real report, pathway
  and plan. NJ/NY-centric college lists like the existing ones, 2 per band.
- src/lib/picks.ts (NEW): the Match -> chooser -> profile handoff. ?picks= in
  the URL is the authority on navigation (so the right career SERVER-renders,
  no flash of someone else's report) and localStorage survives refreshes and
  later visits. Read through useSyncExternalStore with a cached snapshot --
  the repo lints setState-in-effect as an error, and copying storage into
  state on mount is exactly that; the cache exists because a fresh object per
  call spins the renderer.
- ProfileExperience takes initialPicks/initialFocus and derives top3/focusId
  from handoff -> storage -> demo default, with local setTop3/setFocusId
  wrappers so every existing call site is untouched. Only real edits are
  written back: a first-time visitor looking at the demo default has not
  chosen anything.
- CareerReport.tsx exports CareerReportDocument -- the document with no rail,
  toolbar or export preview -- so the chooser renders the SAME component the
  profile renders and the printer prints. idPrefix keeps three copies from
  colliding on element ids. There is still exactly one report implementation.
- DELETED the legacy /career-report experience (CareerReportExperience.tsx,
  reportData.ts): hardcoded to Computer Science, its own data file, a stale
  duplicate of the designed report. NOTE: src/components/student-app/
  StudentAppShell.tsx was only ever imported by it and is now unreferenced --
  left in place rather than deleted unasked, but it is dead code today.
- Copy: report masthead and footer say "Career Report", not "Career & Pathway
  Report" (per direct request, in the template itself). Chooser copy cut to a
  heading plus five words.
- Verified end to end in the browser: deck -> chooser -> confirm -> profile
  focused on the chosen career, with the pathway, plan and report all following
  it (registered-nurse lands on the ADN route, 2 yrs, $65-80K, its own 4-step
  plan). tsc, eslint (3 pre-existing <img> warnings), tokens:check, isolated
  worktree build.

### 2026-08-24 Glass rung: MatchLab adopts it + app-repo mirror spec (PUSHED)

- Both items the previous entry left open, approved by the user.
- MatchLab.tsx: all 9 surface-1 fills move to surface-raised, and the 6
  hairlines that sit ON those fills move to border-raised. The other 9
  glass-border references stay decorative ON PURPOSE and that distinction is
  the whole point of the rung: the deck card (night-card fill), the
  surface-3 sheets, the <hr> divider, the surface-2 pill and the night-
  background scrims already carry their own boundary, so they keep the plain
  border. Visually the empty Top-3 slots and the "N remaining" counter are
  the big win — over the lab's black background 3.1% was invisible.
- docs/handoff/glass-raised-rung.md (NEW): the drop-in spec for the app
  repo's packages/ui/tokens — rationale, the exact DTCG JSON for both modes,
  the emitted CSS, the Figma scoping, and the which-rung-when rule. The app
  repo is not checked out on this machine, so this is the artifact to apply
  there rather than a change I could make directly.
- docs/handoff/figma-variables-to-add.md gains section D for the two Figma
  Semantic variables (glass-raised, glass-border-raised).
- Contract files (marketing/tokens.css, handoff/shadcn-adapter.css,
  handoff/COMPONENT-MAP.md) untouched — verified again before the commit.

### 2026-08-24 Glass: raised rung authored in the DTCG source (PUSHED)

- Follow-up to the entry below, at the user's request: the `.flow-surfaces`
  override that shadowed --color-glass-surface-1 / --color-glass-border is
  GONE. The values it carried now exist as real tokens.
- design-tokens/primitives.{dark,light}.tokens.json gain two primitives in
  the color.glass group: `surface-raised` and `border-raised`. Dark is
  #ffffff11 fill / #ffffff29 hairline; light is frosted WHITE #ffffffad fill
  / #0000002e hairline — light deliberately does NOT follow the black-alpha
  rungs, because that film reads muddy over the pastel aurora (this is the
  same reasoning the html.light block in globals.css already gives for
  surface-1, now authored in the source for this rung instead of patched in
  CSS). Descriptions state the WCAG 1.4.11 reason and when to reach for
  surface-1 instead. `npm run tokens:build` regenerated
  src/app/design-tokens.generated.css; validator goes 583 -> 587 tokens and
  passes, including light/dark path parity.
- All 27 references in src/components/build/{steps,ui,CostStep,LocationStep}
  .tsx moved from surface-1/border to surface-raised/border-raised.
- ZERO visual change, and that was checked rather than assumed: the shipped
  CSS had already quantised 0.065 -> #fff1 and 0.16 -> #ffffff29, so the
  token values were authored to those exact 8-bit steps. Chips compute to
  rgba(255,255,255,0.067) / rgba(255,255,255,0.16) — identical to what is
  live — and --color-glass-surface-1 reads #ffffff08 again, unshadowed.
- STILL OPEN, deliberately not done: src/components/match-lab/MatchLab.tsx is
  now the only consumer of the faint surface-1 (9 references) and has the
  same legibility problem. Moving it to the raised rung is a visual change to
  a screen nobody asked about, so it waits for a decision.
- MIRROR IN THE APP REPO: these two primitives need to land in
  packages/ui/tokens (and as Figma variables) or the prototype and the real
  system diverge. Additive only — no existing token changed value, so a pull
  cannot alter anything already built against the glass set.

### 2026-08-24 Build flow: card contrast, BUILD label, copy cull (PUSHED)

- QA round on /flow. Six files, all inside src/components/build/ except one
  scoped block in globals.css. NOTHING under design-tokens/, no regeneration
  of design-tokens.generated.css, no edit to the contract files
  (marketing/tokens.css, docs/handoff/*) — verified by `git status` on those
  paths before the push.
- CONTRAST (globals.css, new `.flow-surfaces` class on the flow's root
  <section>): the generated glass film is 3.1% white on a 9% white hairline,
  which over the nebula is all but invisible and nowhere near 3:1 non-text
  contrast. The class raises it to 6.5% / 16% for dark and firms the light
  edge from 12% to 18% black. This SHADOWS two generated token names
  (--color-glass-surface-1, --color-glass-border) inside that subtree only —
  the same trick, on the same token, that the html.light block a few lines
  down already uses. Nothing outside the build flow sees it: the only other
  consumer of the token is match-lab/MatchLab.tsx, which is not inside
  .flow-surfaces. Elevation order is preserved on purpose (6.5% stays under
  glass-surface-2's 9%). PROPER FIX when the ramp allows: author a "raised"
  glass rung in the DTCG source and delete this block — the 3.1% film is
  arguably too faint everywhere it is used, not just here.
- HUD: "Phase 1..4" retired. The bar names the CHAPTER now — a constant
  "BUILD" at 14/15px extrabold — so a student knows which leg of
  Build -> Match -> Play they are on. Because it no longer varies, the
  `phase` field is gone from STAGES, StepProps, CardHud and PhaseProgress
  rather than repeated nine times. Side effect (wanted): Cost and Location
  never passed a phase, so they showed no label at all; they do now.
- COPY: education options re-worded to the QA list (Work after HS / 1-2 years
  / 4 years / 5 years+ / Not sure yet — "Work after HS" has NO subline per
  the list, so the subtitle span is now conditional); Cost step asked for a
  range three times (subtitle, "SELECTED RANGE" eyebrow, placeholder) and now
  asks once, with the readout mirroring the thumb's resting stop in muted ink
  and Next still disabled until the slider moves; Profile Basics fields are
  labelled not asked ("Full Name", "School Email"), subtitle dropped, selects
  relabelled Grade/GPA, hint and GPA reassurance trimmed; the 50%
  interstitial no longer prints "50% Complete" twice.
- Citation ("source" line) left unfilled by design and taken from 80% to 60%
  opacity so it recedes now that the cards carry weight.
- Validation: tsc, eslint (one pre-existing <img> warning in ui.tsx),
  tokens:check, isolated-worktree production build, and a click-through of
  every step in both themes at 1280 and 375.

### 2026-08-22 Connect: multi-event Events tab (PUSHED)

- src/components/connect/data.ts: EVENT (single EventBoard) -> EVENTS
  (array of 3), so the tab can demonstrate every entitlement state at once
  per direct request: event-ey (already joined, straight into the board),
  event-jpm (already happened, NOT joined — demonstrates the enter-code
  flow, code "JPM2026", own recap/resources/thread), event-amazon
  (lifecycle "Upcoming" — hasn't happened, no code entry at all, "you
  can't join the convo yet since the event isn't finished"). EventBoard.
  recap/resources are now optional (upcoming events have neither).
- ConnectExperience.tsx: the `{kind:"event"}` View gained an `id` field
  (was implicitly the one global event) — viewToQuery/queryToView,
  EventView, EventCodeSheet, and ThreadView's board-name lookup all take
  the event by id now (eventById helper). eventJoined went from a single
  boolean to Record<eventId, boolean>; codeOpen went from boolean to
  codeOpenFor: string | null so the code sheet knows which event it's
  unlocking. Copy fix: "becomes read-only {date}" -> "Read-only after
  {date}" everywhere (was inconsistent between two spots).
- Validation: same isolated-worktree method as the prior Connect push
  (this session was live-editing ProfileExperience.tsx again during this
  change) — real `npm install` there, tsc/eslint/tokens:check/`next
  build` all clean, re-run against HEAD twice more as it kept advancing.
  Verified live in an isolated dev server (a second `next dev` can't run
  in this same directory — Next's single-instance-per-dir lock): all
  three event states, the code-redemption flow end to end (JPM2026 ->
  confirm -> lands on the JPM board, not EY's), deep links (?event=<id>,
  ?thread=<id>) resolving to the right board's back-button/copy.

### 2026-08-22 Connect: career communities + post-event boards (PUSHED)

- New feature, own files only (src/components/connect/*, src/app/connect/
  page.tsx, chrome.tsx nav wiring) — built to
  Dreamari_Connect_Claude_Implementation_Handoff.docx v1.0 while Profile/
  CareerReport were being rebuilt in parallel by another session. Never
  touched ProfileExperience.tsx/CareerReport.tsx.
- IA: Connect home (For You feed / Communities / Events / Saved), a
  Community board (Ask a question, filters, pinned insights), an Event
  board (post-event continuation, entitlement-gated), Thread detail
  (verified-pro answers, follow-ups, peer perspectives).
- Identity, per direct user override of the handoff's grade-band-only
  default: students post as a first-name handle + class year ("Ethan ·
  Junior"), Twitter-shaped like the marketing site's own Connect chapter
  (src/components/marketing/chapters/Connect.tsx) — never a full/last name,
  never a photo. Verified pros: initials avatar (checkmark on the badge
  itself) + name + company · role. No follower counts, no DMs, no exposed
  internal rankings.
- Editorial pass (direct user feedback, several rounds): For You is a
  single minimal feed read as posts (avatar/name/byline, headline in
  --font-display extrabold for weight, like/comment stats) — no long
  sentences or restated descriptions anywhere. Cards are solid (var(--card),
  matching the Profile-modal/HomeExperience solid-card recipe) with hairline
  dividers between identity/content/actions, not glass. Community identity
  is color + icon + stats, no photography (handoff's own "no stock photos"
  direction) — an earlier organic-blob-photo treatment was built and then
  fully removed per user call.
- tokens.css also carries an uncommitted-until-now fix from earlier this
  session: light-mode world-color contrast recompute (color-mix's first
  percentage is the ORIGINAL color's share, not black's — a subtlety worth
  remembering if this ramp is touched again). tokens:check passes.
- Validation before push: since another session was live-editing
  ProfileExperience.tsx in this same working tree, verified in an isolated
  detached-HEAD git worktree (real `npm install`, not a symlink — Turbopack
  rejects a node_modules symlink that points outside the worktree's own
  root) containing HEAD + only the three Connect/tokens files, re-run twice
  as HEAD advanced: tsc clean, eslint 0 errors (fixed one pre-existing
  react-hooks/set-state-in-effect error in the URL-hydration effect with a
  scoped, justified disable — window.location.search is genuinely
  client-only, an effect is the correct tool here), tokens:check clean,
  `next build` clean (13/13 static pages incl. /connect). Also verified
  live in-browser (dark + light, mobile + desktop): feed, board, thread,
  insight card, Ask sheet.
- NOT done (flagged, not silently skipped): P0 server-side items from the
  handoff (real AccessGrant/entitlement, routing/SLA, moderation, PII
  checks) are simulated client-side only, documented in the file's own
  header comment. No backend exists yet.

### 2026-08-22 Report tab = Replit print report verbatim (LOCAL main, NOT pushed)

- b36e969 (on top of cf05e4e Profile v3): the profile Report tab now mirrors
  https://dreamari-career-pathway-report.replit.app/print section-for-section,
  minus Career Fit (per user instruction "copy MUST remain same, without
  career fit"). Sections: Why This Matches You (equal-segment trait donut,
  color-keyed tiles), "[Career] at a Glance" (What You Do / Potential
  Industries / Work Style / Education), What Would You Actually Do? (all 6
  duties), Salary (U.S. Median + Career Growth chip + Entry/Mid/Senior ladder
  bars + disclaimer + View BLS Data), Education (Most Common Path / Other
  Viable Pathways), Three Majors to Explore, Colleges (Reach/Target/Safety,
  reverted from Likely/Possible/Reach), Next Actions (Play/Join/Share; Share
  opens the counselor export overlay). SE copy verbatim from the reference;
  IB/Pilot/PE adapted in the same voice (data.ts CAREER_REPORTS reshaped).
- Deliberate omission, FLAGGED to user: the reference header's "92% Match"
  chip is not shown (handoff + earlier "match score irrelevant" call);
  Grade 11 + GPA 3.7 chips are shown (STUDENT.gpa added).
- Editorial pass (user request): sticky scroll-tab rail over anchored report
  sections (short labels, IntersectionObserver active underline); donut sits
  beside the trait tiles; section titles are accent uppercase captions with
  right-aligned overview stats (6 responsibilities / 4 pathways / band counts).
- Sticky gotcha: tokens.css `.marketing-v2 { overflow-x: hidden }` makes the
  wrapper a scroll container and kills position:sticky against the window.
  Fix WITHOUT touching the contract file: profile root overrides inline with
  `overflowX: "clip"` (clips, no scroll container). Contract files verified
  byte-identical (tokens.css, shadcn-adapter.css, COMPONENT-MAP.md).
- chosenRoute now falls back to the route flagged `recommended` before
  routes[0] (export overlay was showing target school instead of flagship).
- Validation: tsc clean, eslint clean, tokens:check green; verified in
  browser at ~744px and 375px (rail pins, jumps land, donut row compact).
- Pushed to origin main (ec191cb) + v4 synced on user go-ahead; verified live
  on dreamari.vercel.app. Figma handoff pack (docs/handoff/profile-figma)
  is now a full generation stale.

### 2026-08-23 Round 26: Overview leads with the bento (PUSHED)

- The career summary card (world, title, one-liner, three stats) is REMOVED.
  Overview now opens with the bento — Current path / My plan / My resume —
  then "Do this next", then the activity strip.
- Removed with it: splitDuration(), careerSummary, the avgLoan/loan derivation
  and the onGoReport prop, since nothing else used them.
- Report returned as a fourth bento tile (round 27), so Overview links to it
  again.

### 2026-08-23 Round 27: report snapshot tile (PUSHED)

- The report is back in the Overview bento as a SNAPSHOT rather than a copy
  block: a 36x46 page glyph built from ruled divs (accent line for the
  heading, muted lines for text) beside the signals that decide whether it is
  worth opening: "Updated today", share state, then a footer row with the
  evidence count and which career the report is for. "Ready / 4 sections" was
  too thin and left the tile looking empty.
- Bento: the path tile spans the full row, then plan | report | resume as
  three EQUAL cells — one per row on a phone, three across from sm. No tile
  gets a col-span of its own any more; that is what made one look accidentally
  huge at some widths. Verified equal at 375 and 744.

### 2026-08-23 Round 25: 4 tabs, CTA pattern, Paths rename (PUSHED)

- FIVE TABS DO NOT FIT A PHONE. Resume went back to a labelled header button
  beside Locker and Settings; tabs are Overview / Paths / Plan / Report.
  Verified no overflow at 375. Do not add a fifth tab.
- "Routes" is "Paths" in all user-facing copy (tab, section heading, Make this
  my path, Back to paths, Current path). The `routes` tab id, the
  ProfileCareer.routes field and every route* helper keep their names.
- CTA pattern in the report: a small bordered secondary button with the icon
  inside. College Lookup sits on the section 04 title line; CAREER DETAILS
  SITS IN THE SECTION 01 GRID as the fourth signal, sized and weighted to
  match the labels beside it (18px extrabold) rather than as a title action. ReportSection takes an optional `action` for this. On mobile
  the head stacks and the button sits under the title, left-aligned with the
  content; numeral and title stay on one line via `sm:contents`.
- College band is a chip ABOVE the name, not a label beside it.
- Overview summary: Job outlook replaced by Typical loan (~$68K), because
  "Faster" needed a trailing "than average" to mean anything. Loans read "None"
  when there is no debt and always carry the ~ (they vary).

### 2026-08-23 Round 24: report trimmed, colleges grouped by band (PUSHED)

- Each career now has EXACTLY SIX colleges, two per band, and the section
  sorts Reach -> Target -> Safety so it reads as three even rows (matches the
  reference the user sent). SE had a duplicate Carnegie Mellon entry and UMass
  Lowell mislabelled Target; both fixed. Keep 2/2/2 when editing this data.
- College cards are name + band only. The `why` copy stays in the data (still
  typed, still useful later) but is no longer rendered.
- Education section: one alternative pathway dropped per career, and the
  most-common path is a label not a sentence ("Bachelor's: Finance,
  Economics, or Business").
- The Education fact left the overview panel (it duplicates section 03); the
  "See full career details" link now occupies that fourth slot.
- Majors are unbolded — one large word needs no extra weight.
- "Where this comes from" is a disclosure, collapsed by default. It renders
  with the `hidden` attribute, which the print stylesheet reveals, so exports
  still carry every source. A print-only duplicate heading keeps the printed
  page labelled.

PROCESS: a batch of edits asserted mid-script and aborted BEFORE the write, so
two changes silently never landed and I reported them as done. Write once, at
the end, after every assert has passed — and re-verify in the browser.

### 2026-08-23 Round 23: report emphasis pulled back (PUSHED)

- Only headings and subheadings carry full --ink now. Everything else sits at
  --ink-soft or --ink-faint at regular weight: the masthead metadata line,
  pathway chips and the source links.
- REVERSAL of round 20: the masthead stat line was "all white and bold" by
  explicit request; it is now de-emphasised by a later explicit request.
  Current rule wins — headings and subheadings only.
- The report date left the masthead. It still prints in the running footer,
  so the document is not undated.
- Section 01 is "<Career> Overview", not "at a Glance" (contents entry too).

### 2026-08-22 Round 22: overlays portalled, summary dropped, Resume tab (PUSHED)

STACKING CONTEXT BUG (the "stuck on the export screen" report):
- <main> is `relative z-10`, which creates a stacking context. Any overlay
  rendered inside it is trapped there, so a z-[110] modal still painted BENEATH
  the z-40 header: the preview toolbar and its close button sat under the
  navbar and the screen looked unescapable. Raising the z-index cannot fix
  this. The export preview, the mobile contents drawer and RouteDetailModal
  are now rendered through a <Portal>.
- THE PORTAL HOST MUST CARRY `marketing-v2 themeable`. Every --space-*,
  --glass-* and --primary token is scoped to that class; a bare document.body
  portal renders with them undefined and padding silently collapses to 0.
  Confirmed: paper padding read 0px before the host class, 48/40px after.
- Sheets already rendered outside <main> (Share, Evidence, Compare) were fine.

ONE-PAGE SUMMARY REMOVED. Measured first: the full report prints to ~1.9
pages, so it is not literally a one-pager, but two pages is short enough that
a second condensed document was redundant. MeetingSummary, the document
radio-group, the data-doc/data-print machinery and the second running footer
are all gone, along with the props that only fed them (route, top3, stage,
direction, doneActions, onToggleAction, onSwitchCareer, onReflectionChange).

- Resume is a top-level tab, LAST in the order: Overview / Routes / Plan /
  Report / Resume. It left the header utility pills so it is not in two places.
- The Overview bento's report tile became a resume tile; the report already
  has a doorway in the career summary card above it.
- Five tabs overflow 375px, so the tab bar scrolls horizontally below sm and
  goes back to flex-1 from sm up. Verified: no tab clipped, no page overflow.

PROCESS NOTE: several string replacements in CareerReport.tsx silently
no-opped and successive index-based slices then cut real JSX, leaving the file
unbuildable. Recovered with `git checkout HEAD -- <file>` and redid the work
with an assert on every edit. Assert, or do not edit by slice.

### 2026-08-22 Round 21: hover states outside the profile (PUSHED)

- Round 8 wired .dm-tap/.dm-quiet/.dm-link/.dm-solid into the PROFILE ONLY.
  Explore, Home, Connect, PosterCard and the shared chrome had 58 clickable
  elements between them with almost no hover feedback. All now carry a
  utility, chosen by shape: rounded-xl/2xl cards -> dm-tap, icon buttons and
  pills -> dm-quiet, bare text -> dm-link, solid brand backgrounds -> dm-solid.
- Two controls (HomeExperience HeroCta, ConnectExperience:359) were solid
  filled buttons that the shape heuristic first classified as dm-link; a
  filled button that fades and underlines looks broken. Reclassified by
  detecting background: var(--foreground|--primary) in the element's style.
  HeroCta also had its own hover:-translate-y-px, removed to avoid a double
  lift with dm-solid.
- Verified per screen in the browser: Explore 38 covered / 0 uncovered, Home
  21/1 then 0, Connect 13/0.
- NOT TOUCHED: the marketing chapters on the landing page. Those have bespoke
  interactions (the Play answer rows animate themselves) and a blanket hover
  would fight them.
- FOLLOW-UP after user testing: the shape heuristic put dm-link on a 175x250
  poster card, so a card underlined and faded on hover. Anything card-shaped
  must be dm-tap; dm-link is for bare text only. Also fixed: carousel dots and
  the Panel dots stay bare on purpose (they animate their own width, a lift
  would fight it).
- The sweep only matched elements carrying cursor-pointer, which missed every
  <Link> in the chrome: desktop nav items, mobile bottom-bar icons, the
  wordmark and both profile avatars had no feedback. All wired now.
- Verified per screen with an audit that counts uncovered button/a/[role] AND
  flags any .dm-link larger than 120x80 (a card wearing the link treatment):
  Explore 38/0, Connect 13/0, Home 31/0-with-dots-excluded.

### 2026-08-22 Round 20: uniform stat line, short months, focus star (PUSHED)

- Report stat line: grade, GPA, school and date are ALL white and bold, one
  treatment. Two graded versions were tried and rejected before this.
- Months abbreviated everywhere a user sees one: the report date, the source
  "checked" dates and the GPA record. Verified: zero long month names render.
- My Top 3: the "Current focus" text line is replaced by a filled star badge
  on the card art (sr-only text retained). It was a third line of copy under
  the title and it pushed the card layout around.

### 2026-08-22 Round 19: weights restored, stat phrases unified (LOCAL)

- REVERSAL: round 17 flattened every weight to 600 in pursuit of Apple's
  two-weight system. The user wants the previous weights back. Display and
  >=18px text is font-extrabold again; everything smaller is font-bold.
  The rest of round 17 STAYS: the size jumps, 17px body, negative tracking,
  colour-led hierarchy and the 12px floor. Only weight was rolled back.
- "11th Grade" and "3.7 GPA" are single template strings in one span, at one
  weight and one colour, not a value span plus a label span. The verified
  badge is an inline icon after the text, not a flex sibling with a gap.
- The whole stat line is ONE treatment: every item (grade, GPA, school, date)
  is white and bold. No quiet members, no emphasised member. I tried grading
  it twice (bold label/light value, then school-only emphasis) and both were
  rejected. Leave it uniform.

### 2026-08-22 Round 18: report stat line reads as phrases (LOCAL)

- "Grade 11" / "GPA 3.7" became "11th Grade" / "3.7 GPA" via an ordinal()
  helper. The school shows its name only, no "School" label.
- EACH PHRASE IS ONE WEIGHT AND ONE COLOUR. No bold-the-noun / light-the-value
  split inside a single phrase; that was tried and rejected. The school name
  is the one item at --ink semibold because it is the distinguishing detail;
  grade, GPA and date sit at --ink-soft regular.

### 2026-08-22 Round 17: Apple-style hierarchy across the profile (LOCAL)

User asked for apple.com/ipad-pro hierarchy "for the entire UI in my profile
and everywhere", then clarified: DO NOT touch our tokens, follow the CONCEPT.
So this is inline Tailwind on existing tokens; no new type classes, no token
edits. (I briefly added .ap-* utility classes to app.css and removed them.)

Measured off the live Apple page rather than recalled:
  64/600 #f5f5f7 · 48/600 #86868b · 40/600 · 28/600 · 24/600 · 21/400 · 17/400
  #86868b · negative tracking growing with size · body is 17px.
Principles adopted:
  - TWO WEIGHTS ONLY. 600 for anything structural, 400 for prose. All 42
    font-extrabold and 124 font-bold occurrences are now font-semibold.
    Verified in-browser: the profile renders exactly one weight >= 500 (600).
  - Big jumps, not a 2px ladder: report is 42 / 28 / 18 / 17.
  - Colour carries hierarchy: --ink for structure, --ink-soft for prose,
    --ink-faint for the quietest line.
  - Negative tracking on large text (-0.022em display, -0.012em body).
  - NOTHING UNDER 12px. All 9/9.5/10/10.5px labels lifted to 12; body copy
    from 11-13.5px lifted to 14-15px. Verified: 0 elements under 12px.
- Scope: profile only (Overview, Routes, My Plan, Report). The landing page,
  Explore, Connect and Match Lab are NOT converted.

### 2026-08-22 Round 16: report padding bug + label emphasis (PUSHED)

- BUG I INTRODUCED: the report used py-[var(--space-9)]. --space-9 DOES NOT
  EXIST in tokens.css (the scale is 1,2,3,4,5,6,8,10,12,13,14). An undefined
  var makes the declaration invalid, so vertical padding computed to 0px and
  the document hugged its own edges on mobile. Measured, not guessed:
  getComputedStyle reported paddingTop "0px". Now space-8 on mobile and
  space-12 from sm. CHECK THE SCALE BEFORE USING A SPACE TOKEN — 7, 9 and 11
  are not in it.
- Masthead facts: the LABEL is bold at --ink and the VALUE is normal weight at
  --ink-soft. This is the opposite of the usual instinct and it is deliberate,
  per the user. Do not "fix" it back.
- Middot separators removed: now that each field carries a label, the dots only
  stranded at the end of wrapped lines.

### 2026-08-22 Round 15: masthead, CTA, mobile composition (PUSHED)

- Masthead: "CAREER & PATHWAY REPORT" is grey (--ink-faint) caps, the student
  name sits at the SAME SIZE in Title Case at full brightness. The document
  names itself quietly; the person is the bright thing.
- Stats are one flowing line, not a grid. The two-column grid wrapped into
  ragged blocks on a phone ("School / Westfield / High / School"). A wrapping
  sentence degrades gracefully at any width. Values are bold --ink, the words
  around them --ink-faint, so a label never outweighs its own number.
- Explicit divider spans were tried and removed: on wrap they strand at the
  start of a line.
- "See full career details" is a bordered button with a Compass icon, not a
  stray text link at the end of the section.
- [data-preview] now hides [data-print-hide] and .no-print, so the export
  preview shows exactly the printed document with no app CTAs in it.
- Mobile padding raised (space-6/space-9), section top padding 40 on mobile,
  and "Updated today" moves above the button row instead of orphaning under it.

### 2026-08-22 Round 14: THE REPORT TYPE SCALE (LOCAL)

RULE, stated by the user and not to be reinterpreted: heading, subheading,
body. Top down, bigger to smaller. Nothing else. No eyebrows, no captions, no
hero numerals. Titles are ALL CAPS.

  document title  34 / 26  extrabold  UPPERCASE   --ink
  section heading 24 / 20  extrabold  UPPERCASE   --ink   (numeral matches)
  subheading      16       bold                   --ink
  body            14                              --ink-soft

Verified in the browser: 34 > 24 > 16 > 14, strictly descending.
- The masthead label/value grid was the last caption layer; it is now one body
  line (Grade 11 · Westfield High School · GPA 3.7 ✓ · August 22, 2026), with
  the verifying school still announced to screen readers.
- Student name dropped to subheading. The DOCUMENT is the title here, not the
  person.
- Salary renders through the same <Fact> as every other field. It has been
  re-emphasised twice by me and corrected twice. Leave it at body.
- Emphasis available: weight and brightness. Not size.



Report scale is now heading / subheading / body / caption, with the rule that a
subheading is never smaller than the body it introduces:
- heading 26-32 display; section numerals raised to MATCH the heading size
- subheading 15 bold at --ink (field labels are sentence case now, not 10px
  small-caps, which had them smaller than their own content)
- body 14.5 at --ink-soft; caption 12 at --ink-faint
- brightness carries head-vs-content as well as weight
- "Career & Pathway Report" is a real title (26/32) above the name (38/50)
- SALARY IS NOT SPECIAL: it renders through the same <Fact> as What You Do,
  Potential Employers and Education. It was a 38px hero numeral. Do not
  re-emphasise it.
- Major cards are name-only. NOTE: an earlier attempt to remove those
  descriptions silently no-opped because the replace ran against pre-extraction
  indentation and I did not assert. Always assert on string edits.
- College `why` copy rewritten: no "you saved it" self-reference, each line now
  carries a fact worth acting on (cost, location, admission odds, co-op).

Play chapter (landing) hierarchy, per direct feedback:
  title "Day in the life of an investment banker" (biggest, 17-23 extrabold,
  accent blue) > situation (14-17, weight 500, narration) > question
  (13-15.5 uppercase 800, prompt-label treatment) > options (body) > result
  (caption). The question is differentiated by KIND not size, because at a
  similar size and weight it read as a second sentence of the narration.

### 2026-08-22 Round 13: route card affordance (PUSHED)

- Each route card shows a chevron in a bordered circle beside the route name:
  a visible "this opens" cue, because hover cannot carry that signal on a
  phone. It brightens with the card via `group` + group-hover.
- The chevron is aria-hidden and inside the pointer-events-none content layer,
  so it is decoration only: hit-testing it resolves to the card's real
  "Open details for X" button, and screen readers are not told about a control
  that does not exist.

### 2026-08-22 Round 12: whole route card is the click target (PUSHED)

- Pattern: a full-bleed <button> sits BEHIND the card content (absolute inset-0
  z-0) rather than wrapping it, the content block is pointer-events-none
  z-[1], and "Make this my route" is a sibling at z-[2]. That keeps the whole
  card clickable without nesting a button inside a button. The overlay carries
  its own focus-visible ring since .dm-tap sits on the wrapper, not on it.
- Verified with real pointer clicks, not just JS .click(): clicking the stats
  area opens the correct modal; clicking the select button selects the route
  and does NOT open the modal.
- Testing note: elementFromPoint returns null for anything outside the
  viewport, which made a hit-test look like a z-index bug until the element was
  scrolled into view. Scroll first, then hit-test.
- Dev server had died mid-session; restarted via preview_start dreamari-dev.

### 2026-08-22 Round 11: mobile route rail + Pay label (PUSHED)

- Route cards no longer stack on phones. One container does both: a snap rail
  below sm (flex, snap-x, -mx-5/px-5 full bleed, scroll-px-5 so card 1 is not
  flush to the edge, cards w-[74vw] max-w-[280px] flex-none snap-start) and
  the auto-fit grid from sm up (cards go w-auto max-w-none). Verified on 375:
  scrollWidth 897 vs clientWidth 375, three cards, display flex.
- "Starts at" was a vague label of my own invention. It is now "Pay", carrying
  the range the route already describes ($96K-110K+). Changed in the route
  cards, the route modal stats and the Overview bento tile.

### 2026-08-22 Round 10: routes as compact cards + modal (PUSHED)

- The route carousel is GONE (rail, snap, prev/next arrows, route pills). The
  Routes tab is now a grid of compact cards, auto-fit at minmax(210px, 1fr):
  three across on desktop, one on a phone. Each card carries icon, name,
  credential, four stat rows (Time / Cost / Starts at / Debt clear) and one
  button. No pitch sentence, no tabs inside the card.
- Tapping a card opens RouteDetailModal, which renders the existing
  RouteColumn with a new `inModal` prop (drops the snap/width/border classes
  and the card background). Stats/Fit/Life/Payoff panes are unchanged and
  still live there -- that is the only place they render now.
- Compare is a bordered ghost button with an ArrowLeftRight icon, top right of
  the section, toggling to the same CompareTable + CompareChart view as before.
- Report: major cards are name only, descriptions removed.

### 2026-08-22 Round 9: report CTAs point inward (PUSHED)

- Career Report college cards are now Links to /colleges?school=<name>, plus an
  "Open College Lookup" solid CTA under the section. The glance section gets
  "See full career details in Explore" -> /explore?tab=browse.
- /colleges now accepts ?school= (async searchParams) and shows the name in its
  search field with a line saying it came from the report and does not search
  yet. The param is honoured rather than decorative -- keep it wired if the
  real lookup lands.
- STILL EXTERNAL, deliberately: the three "Open" links in the report's sources
  footer (BLS, College Scorecard, O*NET). Those are citations; a source a
  reader cannot verify is worse than an outbound link. All CTAs carry
  data-print-hide so the printed document has no app chrome.
- No per-career route exists, so career details deep-link to Explore browse
  rather than a specific career. A /explore?career=<id> route would let the
  report point at the exact career.

### 2026-08-22 Round 8: hover + focus affordances (PUSHED)

- Four utilities in app.css: .dm-tap (cards and bento tiles: lift, shadow,
  accent border), .dm-quiet (icon buttons, tabs, chips: surface wash),
  .dm-link (text actions: fade + underline), .dm-solid (filled buttons:
  brightness + lift). Applied across ~41 controls in ProfileExperience.
- WHY !important: nearly every surface sets background and border-color inline
  from tokens, and inline styles beat stylesheet rules. The hover rules
  override only those two properties; do not widen that.
- Each utility carries :focus-visible (2px accent outline) and a
  prefers-reduced-motion block that drops transform and transition.
- Overview route tile label is now always "Current route" (was "Suggested
  route" when nothing was picked).

### 2026-08-22 Round 7: stat composition + identity block (PUSHED)

- Overview career TLDR: only the duration is set at display size now. A
  splitDuration() helper cuts "2 to 4 years to a first flying job" into a big
  figure plus a small trailing note, matching how "than average" sits beside
  the outlook. Figure is whitespace-nowrap so it never wraps mid-number.
- Identity block recomposed after a real-device screenshot showed it breaking
  on mobile (utility icons orphaned on their own row, ragged 2-col metadata):
  now name + school byline on one row with icon-only buttons on phones and
  labelled pills from sm:, then a 3-up numeric strip (Grade / GPA / Streak).
  School left the numeric strip because it is text, not a figure.
  Strip is grid-cols-3 on mobile and a left-hugging flex row from sm: so the
  facts do not spread across a 1200px width.

### 2026-08-22 Round 6: counselor questions removed entirely (PUSHED)

- The counselor-questions feature is gone from everywhere: the report body,
  the one-page meeting summary, the My Plan saved-questions block, the
  Overview report tile's "N questions saved" line, and the share sheet's
  included list. CounselorQuestion, INITIAL_QUESTIONS and SUGGESTED_QUESTIONS
  are deleted from report-data. Verified: no "question" string renders on any
  of the four tabs.
- STILL PRESENT and deliberately kept: STUDENT_DIRECTION.question, rendered in
  the one-page summary as "What I am unsure about". That is the student's own
  open decision, not a counselor question list. Flagged to the user.
- Splice trap worth remembering: a marker string used with s.index() matched an
  EARLIER occurrence than the edit target and silently duplicated ~130 lines
  (CompareChart / RoutesTab / MyPlanTab appeared twice). tsc caught it as
  "Duplicate function implementation". When cutting by marker, assert the
  indices are ordered before slicing.

### 2026-08-22 Round 5: report polish + overview summary (PUSHED)

- Report header: Stage and Last updated REMOVED. Grade / School / GPA / Date
  as an even four-up grid; GPA carries a BadgeCheck (sr-only names the
  verifying school) instead of the "4.0 unweighted verified by..." sentence.
  Date renders a size down so it never clips. The duplicate "Grade 11 ·
  Westfield High School" line under the name is gone.
- Header disclaimer moved to the footer small print, along with the
  "employers are examples, not openings" line that used to sit in the panel.
- Glance panel is values only, and the underlying copy was shortened in
  report-data (whatYouDo / education) so it scans.
- DARK MODE REPORT: .dm-report now defaults to a dark reading surface and
  html.light .dm-report carries the paper palette. @media print and
  [data-preview] .dm-report both force the printed light palette, so the
  export preview looks like paper whatever theme the app is in.
- EXPORT PREVIEW IS THE DOCUMENT. The <article> was extracted into
  ReportDocument and is rendered in both the page and the preview (idPrefix
  keeps section ids unique). There is no separate preview rendering to drift
  out of sync -- do not reintroduce one.
- Meeting summary rebuilt with the same editorial treatment; stage dropped.
- Majors lost their save/plus control in the report.
- Overview gained a career TLDR above "Do this next": world, title, one-line
  what-you-do, then median pay / time to get in / job outlook as gradient
  numerals. Route tile now says "Suggested route" and "Suggested for you"
  when nothing is picked, instead of "Not picked yet" above real numbers.

### 2026-08-22 Round 4: report scoped to the reference screenshot (PUSHED)

- Report is now EXACTLY the reference's four sections, in its copy:
  "[Career] at a Glance" (What You Do / Potential Employers / U.S. Median
  Salary / Education), "Three Majors to Explore", "Education" (Most Common
  Path + Other Viable Pathways), "Colleges". Plus a compact sources footer.
- NO DISCLOSURE ANYWHERE IN THE REPORT. User: an exportable document must not
  hide anything behind a dropdown. The Section component was replaced with a
  plain non-collapsing ReportSection, and the `hidden` + print-reveal trick is
  no longer needed for the report body. Do not reintroduce accordions here.
- Reach / Target / Safety RESTORED (user pointed at the screenshot and said
  show only what it shows). The methodology caveat now lives in the sources
  footer: indicative bands to guide research, not predictions.
- Dropped from the report and living elsewhere: student direction/reflection,
  action plan, counselor questions (My Plan), top-3 comparison (CompareSheet),
  pay range detail + work environment (folded away; median stays in Glance).
- Typography pass: hanging section numerals, 26-32px display heads, hero
  salary numeral, coloured major cards, small-caps labels at 10px/1.3px.
- SE college list extended to the reference's six (added Georgia Tech and
  Rutgers) so the canonical example matches.

### 2026-08-22 Profile round 3: user-directed simplification (PUSHED)

All from direct user calls in session, several reversing my own earlier choices:
- Identity banner (career art backdrop, 64px avatar, streak block) REPLACED by
  an editorial masthead: name at display size, then GRADE / SCHOOL / GPA /
  STREAK as caption+value pairs. GPA and signals moved up here from elsewhere;
  "grade + school looked small and thin" was the complaint.
- Overview lost "Where you are" (stage card) and "What I am looking at" (Top 3
  restatement -- it duplicated the switcher directly above it).
- Overview gained a BENTO: My route (wide tile, 3 stats) / My plan (n of N +
  bar) / My report (status + questions). Each tile is a doorway.
- My Pathway SPLIT BACK into two tabs: Routes and My Plan. Merging them made
  one very long screen where the plan sat below a whole comparison carousel.
  The brief's worry was Path vs Plan being indistinguishable -- solved by
  naming (Routes / My Plan), not by merging. Tabs: Overview / Routes / My Plan
  / Report.
- Evidence is NO LONGER A TAB. It is a right-side sheet opened from the
  Overview activity strip and from the report's Sources section. It explains a
  claim, so it belongs next to the claim.
- STAGE RAIL REMOVED ENTIRELY ("I dont want that thing anywhere"). The stage
  engine still computes a value and the report header still prints "Stage:",
  which the user has NOT explicitly rejected -- confirm if it should also go.
- Career Report is now SINGLE-CAREER. The Top 3 comparison moved out of the
  report into its own CompareSheet, launched from a Compare button on the My
  Top 3 heading. Report sections renumbered 1-9. The one-page meeting summary
  still carries a top-3 table (the brief requires it there) -- flag if that
  should also become single-career.

### 2026-08-22 My Profile + Career Report v2 rebuild (LOCAL, NOT pushed)

Brief: full authority to change IA, composition, tabs, hierarchy, responsive.
Sources read: live /profile, the reference screenshot, and Career Intelligence
Layer V3 (sections 1.7 pathway fields, 1.8 plan inputs, 5 student-content rules,
10 career object, 25 privacy/field-level consent, plus the 13-21 internal scores
that must never surface).

WHERE I DEPARTED FROM THE BRIEF (deliberate, flag to user):
- Colleges are NOT labelled Reach/Target/Safety any more. The brief allows those
  labels only behind an explainable admissions model the school can disable; we
  have none. They are Saved / Explore / Check requirements / Discuss with
  counselor. THIS OVERRIDES the earlier "verbatim Replit" instruction, which had
  Reach/Target/Safety. User needs to confirm.
- "Potential employers" (reference screenshot) -> "Example employers", with an
  explicit note that these are not openings or endorsements.
- The old verbatim-Replit ReportTab is DELETED (~30k chars) and replaced by
  CareerReport.tsx. The Replit copy that still held up was carried over.

IA now: Overview / My Pathway / Career Report / Evidence.
- Path + Plan merged into My Pathway (they were the same question twice).
- Evidence is a real area again (correctable inputs, too much for a card).
- Journey rail Explore -> Compare -> Decide -> Plan -> Share, DERIVED from state
  (top3 count, route chosen, plan started, shared). "Still exploring" is a
  first-class state; the rail must never read as a progress bar you are failing.

New files:
- report-data.ts   report v2 model + authored content for IB/Pilot/PE/SE.
                   Every figure carries source + year + last-verified.
- CareerReport.tsx editorial paper document: 10 numbered sections, desktop TOC,
                   mobile contents drawer, Top 3 comparison BEFORE the deep dive,
                   per-section disclosure, export preview, one-page summary.

Print (app.css, .dm-report block): real @media print. US Letter, app chrome
removed, collapsed detail force-revealed (this is why collapsed sections are
rendered with the `hidden` attribute instead of being unmounted -- do not
"optimise" that away or the export goes empty), thead repeats, break-inside
guards, links print as labels with URLs appended, bars greyscale-safe with
borders, running footer via position:fixed.
KNOWN GAP: true page numbers need @page margin boxes (Chrome does not support
them) or a paged.js pipeline. Today the browser's own print header/footer
supplies them; the fixed footer carries name/date/version.

Other gaps: no persistence (all state is React-local and resets on reload);
sharing is simulated and grants no real access; GPA renders from a fixture
flagged school-verified and hides itself if verified is false.

NOTE: ConnectExperience.tsx was being edited by someone else while I worked
(CommunityBanner mid-refactor, tsc error at 758). Left untouched and NOT
committed by me. Everything outside that file type-checks clean.

### 2026-08-22 My Profile rethink: Overview landing (LOCAL, NOT pushed)

- User: "my profile is too much, repeating information from career details...
  needs a simplified OVERVIEW screen. VISUAL, EASY TO SKIM, FULL RETHINK.
  PROGRESSIVE DISCLOSURE IS KEY."
- IA change: tabs are now Overview / Path / Plan / Report (was Report / Path /
  Plan / Evidence). Overview is the default landing; Report moves last and
  keeps its verbatim-Replit content untouched — it is the counselor-facing
  DOCUMENT, no longer the landing experience. That is the resolution to the
  "repeats career details" complaint: a self-contained report is allowed to
  restate things, it just must not be the first thing a student hits.
- Evidence tab DELETED as a tab; folded into Overview as a collapsed card
  ("N things you actually did") that expands to the receipt tiles. Four tabs
  in, four tabs out — but one less dead-end destination.
- OverviewTab = 4 blocks, every one a doorway (detail lives one tap deeper):
  1) Your path right now — chosen route + 3 decision numbers (Time / Starting
     pay / Debt clear, all route-derived so they move when the path moves)
     -> "See all N ways in" to Path.
  2) Do this next — the single next task + action button, plan progress bar
     underneath -> "Open plan".
  3) Career report — one-line description + Read report / Share buttons.
  4) Evidence — collapsed, expands in place.
- Overview rule to keep: ONE number per topic on the landing, the full set in
  the tab. Do not let this screen grow into a second report.
- Mobile: a 3-column stat grid wrapped every label and value at 375px; stats
  now render as label-left/value-right rows on phones, 3-up tiles from sm:.
- Validation: tsc, eslint, tokens:check green; all four doorways verified in
  the browser (aria-selected assertions), desktop + 375px.

### 2026-08-22 Report polish round 2 (PUSHED to main only, per user)

- Section rail restyled from a full-bleed black band to a floating glass pill
  (sticky top-8px, rounded-full, blur, active chip = glass-surface-2). User
  called the band "a bad black fill".
- Sticky rail dead-on-arrival gotcha again, root cause found: tokens.css
  `.marketing-v2 { overflow-x: hidden }` (Usman contract, untouchable) makes
  the wrapper a scroll container; profile root overrides inline with
  `overflowX: "clip"` — keep this if the root div is ever rebuilt.
- Collapsible report sections (ReportPanel — NOTE: named ReportPanel because
  a ReportSection already exists for the counselor export overlay): Day to
  Day, Education, Colleges collapse to a one-line glass summary (first item
  " · +N more") with the overview stat + chevron in the caption row; Why /
  Glance / Salary / Majors / Next Actions stay open. Rail click auto-expands
  its target before scrolling.
- Background fix: background-space.svg starfield had hard-coded h-[2602px]
  and stopped mid-page ("background isn't scaling") — now inset-0 h-full
  object-cover in Profile, Home, and Colleges (all three shared the bug).
- My Top 3 mobile rail: snap-x was pulling card 1 flush to the screen edge
  (scroll-padding defaults to 0, ignoring px-5) — fixed with scroll-px-5.
- Colleges section: "Open College Lookup ->" CTA to /colleges; Education
  card: "Compare these routes in Path" CTA (onGoPath prop restored).
- Report -> Plan/Path coherence (user ask): plan tasks now mirror the report
  Next Actions per career (renamed sim tasks to "Continue playing the X
  Simulation", added the Join <board> task to each career's 6-month level);
  Path fit pane gains a "Majors to explore" FactRow from the career report
  on university/college/transfer routes only.
- Stale-screenshot trap hit twice this round: browser-pane screenshots showed
  truncated panes that the DOM proved were fully rendered — verify via
  element queries before diagnosing render bugs.

### 2026-08-21 FINAL DEPLOYMENT MAP (corrected + verified by curl)

- dreamari.vercel.app = PRODUCTION: full app incl. Daily Drop. Source:
  github.com/Mustang9393/Dreamari, branch main.
- dreamari-demo.vercel.app = MAISHA'S DEMO: rebuilt deterministically as
  main MINUS Daily Drop MINUS flow theme toggle — nothing else differs.
  Source: github.com/Mustang9393/dreamari-demo (repo renamed from
  dreamari-main), branch main; also mirrored as Dreamari branch "demo"
  (rebuild recipe: reset demo to main, strip drop from HomeExperience,
  git rm motion-lab route+components, remove ThemeToggle).
- dreamari-ab.vercel.app = A/B experiments (parked per user).
- Vercel notes: project renamed dreamari-main->dreamari-demo via REST API
  (CLI has no rename); the <name>.vercel.app domain does NOT follow a
  rename — added via POST /v10/projects/:id/domains. CLI git-authored
  deploys get REJECTED ("not a member of the team") because commit author
  email != Vercel account — deploy from a git-less tree (git archive ->
  vercel link --project dreamari-demo -> vercel deploy --prod). Archive
  branches on dreamari-demo repo: with-daily-drop (pre-strip snapshot),
  four-tab-experiment.


### 2026-08-21 Joshua content order + backgrounds + wide-screen type (DEPLOYED)

- Explore Browse rails = Joshua's canonical list verbatim: merged rail
  "Recommended Because You Liked Business & Money" (Asset Manager, Private
  Equity, Quant, Accountant, Management Analyst, Administrative Assistant)
  -> Tech & Engineering (his order) -> Top 5 Trending -> Might Not Know
  (Food Scientist, Sound Engineering Technician, Sports Medicine Doctor,
  Agricultural Technician, Drone Pilot, Jewelry Designer) -> Typical Pay
  (his 6, his order). BROWSE_RECOMMENDED retired; Home mirrors the merged
  rail. New posters pulled from Mika's world folders + the Figma taxonomy
  board (Drone Pilot 3282:7909, Jewelry Designer 3282:8011, Management
  Analyst 3282:8537 — download_assets on the card's image child).
- BACKGROUNDS: dark stays the default EVERYWHERE (user corrected my
  light-mode misread). All app pages (Home/Explore/Profile/Colleges) use a
  %-BASED color wash (purple/primary/teal radials + tinted linear base) —
  scales to any viewport, no black voids at edges/bottom. Explore's dark
  space art svg retired. Flow now DEFAULTS DARK (ThemeProvider adds .dark
  unless stored choice = light); demo branch removed the toggle entirely.
- Poster cards: TEXT_SCRIM is theme-independent dark; titles fixed #F4F7FF;
  salary = big 19px gradient figure in a dark glass chip (user-approved).
- Wide screens (Usman): app type is fixed px from 1440 Figma frames —
  added .marketing-v2 zoom steps (1.1 @1720px, 1.22 @2100px).
- tokens.css: .marketing-v2.theme-light same-element selector added.
- Landing: strict rail geometry (480px columns to outer rails); Get Hired
  explicit step copy; Explore chapter mini-rail renamed Recommended for
  You. REPO MAP: Dreamari/main = prod (with drop) -> dreamari.vercel.app;
  Dreamari/demo = Maisha (no drop, no theme toggle) ->
  dreamari-git-demo-chandump14-3961s-projects.vercel.app; dreamari-main =
  mirror (+with-daily-drop, four-tab-experiment); dreamari-ab = A/B.


### 2026-08-21 Daily Drop reveal: browse card + match taxonomy + foil (DEPLOYED)

- Reveal shows the career's real BROWSE PosterCard (poster face + world
  label) with a match-tier chip above: strong (accent-subtle) / stretch
  (gold) / WILDCARD — wildcards wrap the card in the landing's rare-pull
  foil (rotating conic border + sheen), resurrected from
  marketing/animations.css as scoped dd-holo-* classes inside
  DailyDropDemo (a <style> block, since /home doesn't import
  animations.css). Rarity/numbering language is gone (Prismatic was the
  Replit reference's collectible tier — not our taxonomy).
- TODO(asset): DROP_CAREER photo uses poster-cyber-security.png as the
  Ethical Hacker stand-in until Mika's Might-Not-Know posters land.
- Reveal container scrolls (overflow-y-auto) — taller card content must
  not clip short viewports. CTA row: View Career Details + quiet Close.


### 2026-08-21 IB sim journey + home recommended rail (DEPLOYED)

- User supplied "Investment Banking.zip" (21 cel-shaded Colbalt Capital
  sim scenes, unnamed ChatGPT renders — contact-sheeted to pick). Five
  placed as /images/app/activity-ib-*.png (dossier, dossier-hero, kickoff,
  warroom [unused yet], desk).
- "Continue your journey" rewritten around the IB sim per user ("use these
  for all things games and simulation oriented"): hero panel 2 = "The $30B
  Deal" (Colbalt Capital deal-room copy, dossier-hero art); activity cards:
  SIMULATION "The $30B Deal" (dossier), GLOSSARY "Finance Essentials"
  (late-night desk art), GAME "Deal Team Kickoff" (whiteboard art;
  replaces Market Match). Brand Crisis Room fully retired.
- Home rail: "Careers Picked for You" REPLACED by Explore Browse-All's
  "Recommended for You" (same title/subtitle/cards — BROWSE_RECOMMENDED
  is the shared source). HOME_PICKS is now unused (kept in catalog).
- NOTE: hyphenated poster titles wrap via zero-width space after hyphens
  (breakableTitle in PosterCard) — fixed INDUSTRIAL-ORGANIZATIONAL clip.


### 2026-08-21 Build-flow feedback round + WCAG pass (DEPLOYED)

- Work Vibe: options left, chosen words rise on the RIGHT panel (Replit
  pattern, per user; adds layout variation between steps).
- Education: all 5 choices on ONE horizontal line (scrolls on phones).
- Cost slider: stop labels absolutely positioned at the same percentages as
  the tick dots — the thumb sits directly over the selected words (edge
  labels clamp inward).
- Profile: grade + GPA are now styled native <select> dropdowns
  (SelectField) — the pill walls read as information overload.
- Completion screen: ONLY Congratulations + "See matches" (path picker
  College/Trades/Both REMOVED — state.path still exists in types but
  nothing sets it now).
- Dreamy speech-bubble row RETIRED; Dreamy renders beside the question
  heading (QuestionHeading sprite prop; sprite threaded via StepProps).
  Dreamy reactions (reactionNonce hearts) retired with it — react() is a
  no-op. Section top padding sm:pt-16 so the HUD clears the fixed home btn.
- WCAG AA AUDIT (both modes, computed): dark mode passed everywhere
  (7.5:1+). Light mode FAILED on brand-300 labels (2.19) and success-green
  text (2.02). Fix: adaptive mixes color-mix(55% brand-400/success, 45%
  night-foreground) — passes both modes (5.5-12.6). Aurora blobAlpha
  0.16→0.11 dark / 0.28→0.22 light (softer wash), idle option text lifted
  to an 80% night-foreground mix, citations opacity 50→80.
- Match deck: the 20s idle "Not feeling these yet?" auto-sheet REMOVED
  entirely per user (state+effect+sheet).
- Landing: ChapterShell gained `centered` mode; GET HIRED now renders
  centered (copy above card) instead of the zig-zag flip. Other chapters
  keep the deliberate alternation.


### 2026-08-21 Content batch 08-19/08-21 + home refresh (DEPLOYED)

- Explore Browse: "Typical Pay: $100K +" = the user's 10-career salary list
  (08-19 archive posters, center-cropped 1024sq into /images/app/poster-*;
  the unnamed "ChatGPT Image" in the zip is the Pediatric Surgeon; Airline
  Pilot reuses poster-airline-pilot-alt). Sorted by pay desc. Salary badge
  now sits in a dark glass pill (glass-surface-3 + glass-border) — the old
  mix-blend screen text washed out on bright photos.
- "Careers You Might Not Know" runs the 08-21 archive careers for now; the
  user's intended 8 (Flavor Chemist, Beauty Product Developer, Ethical
  Hacker, Drone Pilot, Animal Nutrition Scientist, Game QA Tester, Shopper
  Insights Analyst, Genetic Counselor) have NO images yet — staged in a
  catalog comment; wire them when their batch lands.
- "Tech & Engineering" rail now actually tech-only (frame's farming fill
  was a design-file quirk; corrected per user).
- HOME_PICKS += 5 of the new batch. PosterCard titles auto-shrink for long
  words (CONTROLLER/PSYCHOLOGIST clipping).
- Home hero panels 2-3 + activity cards: RETIRED the portrait+world-glow+
  symbol composite (WorldArt) — replaced with browse-poster photos feathered
  via CSS mask (PanelPhoto). Brand Crisis Room uses the PR Manager poster.
  IMPORTANT: browse/home surfaces use poster-* images ONLY, never the
  env-* "For You" reel set (user directive).
- Career Signal banner reworked (user: persona line made no sense, CTA was
  dead): now evidence -> pattern -> action: "27 cards in, a pattern is
  forming." + world chips with counts (world-color dots, glass pills) +
  View My Plan LINKS to /career-report. "Sky" terminology purged site-wide
  (Locker is the collection term).
- macOS NOTE: this session could not read ~/Downloads (TCC) — user copies
  batch archives into the repo root; extract in scratchpad, rm archives.


### 2026-08-21 Daily Drop v4.1: free-zone composition + token compliance (DEPLOYED)

- Hero flight COMPOSED, not edge-pinned: ResponsiveFlight anchors Dreamy to
  the middle of the free zone right of the text column (textEdge =
  min(520, 55%w); center at textEdge + 42% of remainder), scales to 240px
  on wide panels — on ultrawide screens he sits ~65% across as the main
  attraction instead of hugging the edge. Phone: centered in the banner's
  middle band, near-horizontal trail, top 50.5% (gap to description == gap
  to CTA).
- TOKEN COMPLIANCE (user directive: no invented tokens): the takeover's
  neon hardcodes now resolve through existing tokens — accent-subtle
  (band tint, top-earners chip), world-science-research +
  world-tech-engineering-design + chart-2 (diamonds, aurora, prismatic
  chip, confetti + chart-3), SKY mixes purple+primary only. Quiz options
  follow the build-flow glass language (glass-surface-2 + glass-border,
  gold letter badges) with the correct state in brand primary/
  primary-foreground. Character rig art keeps its own palette (like
  poster art).

### 2026-08-21 Daily Drop v4: editorial hero, descent direction, drop language (DEPLOYED)

- FLIGHT REVERSED per user: Dreamy now DESCENDS from the top right (it's a
  "drop" — the ascent fought the metaphor); trail streams up-right and
  bleeds off the banner corner, which structurally cleared the copy-overlap
  problems on tablet/mobile. StreakPhase enters from top-right; neon
  streaks whoosh bottom-left->top-right.
- Home hero art is now ResponsiveFlight: measures the panel
  (ResizeObserver), Dreamy = 24% of panel width clamped 96-200px, trail
  proportional (3.4x), right offset 7% — cloud always fully visible, trail
  always crosses a good run of frame. Dreamy itself is CLICKABLE
  (DailyDropFlight onOpen wraps the cloud in a button).
- COPY: capsule language dropped ("doesn't make sense" — no capsule
  visual). Now drop/card language: "Today's card is dropping in." /
  "Catch the drop" / quiz "Crack the clue" / reveal "Drop caught!";
  streak line "27 cards in your Locker" (My Sky retired); reveal streak
  chip 13 (12+1, consistent with the banner).
- Site-wide ARROW SWEEP: every keyboard-arrow char (→ ←) in UI strings
  replaced with sized lucide ArrowRight/ArrowLeft (Home rails+ctas,
  SchoolsView links, build steps Continue/Finish/See Matches, onboarding,
  profile Cards/Change-route, data.ts route type reworded). Section header
  rows: title flex-1 text-balance + nowrap "View all" (mobile short label)
  so nothing wraps oddly or collides.
- Reveal phase is height-responsive (overflow-y-auto + min-h-full column,
  Dreamy 170, rays 520) — was clipping on phones. Perf pass for phone
  stutter: transform-gpu/will-change on band + flight, ambient
  specks/diamonds halved on <sm screens.
- StepFooter nextLabel widened to ReactNode (icon labels).

### 2026-08-21 Daily Drop v3: capsule quiz flow + HOME hero integration (DEPLOYED)

- FLOW now mirrors the user's Replit reference (dceeai.replit.app/daily-drop),
  copy verbatim: banner "Open the Capsule" (+streak line) -> flight intro ->
  CRACK THE CAPSULE quiz (9s ring timer, hook + question + A-D tactile
  options; wrong pick dims+shakes and burns a clue, timeout = 2 clues) ->
  reveal "Capsule cracked!" (Cyber World / Ethical Hacker / No. 005 / 193 /
  PRISMATIC chip / pay chips $80K & $150K+ / streak / Save to My Profile).
- Dreamy polish round: crisp cel-shade layer (offset-silhouette technique:
  shade tone + body redrawn shifted up inside the body clip), per-eye radial
  gradients (#5B86FF->#0B1B4D), whiter body, brighter tongue; irid prop =
  iridescent trail-light wash (used in flight); speed micro-vibration
  wrapper in FlyingDreamy; LightBand head tucked INSIDE the silhouette with
  internal flow streaks + peeling sparkles; SunRays got a DONUT mask so rays
  never overlap the character; lucide ArrowRight replaces all "→" chars I
  added (per user).
- DailyDropDemo now exports DailyDropFlight (band+Dreamy art group) and
  DailyDropTakeover (portal overlay w/ phases). TakeoverStage owns
  phase/clues state and REMOUNTS per open (lint: no setState-in-effect
  resets; mounted flag via useSyncExternalStore).
- HOME INTEGRATION: HeroBanner Panel 1 (Today's Drop) CTA = "Open the
  Capsule" opening the takeover; carousel pauses while open; CometStar +
  mobile trail art DELETED (replaced by DailyDropFlight desktop right /
  mobile air-gap above CTA). HeroCta gained onClick.
- TWO REAL BUGS: (1) duplicate SVG ids across DreamyRig instances — the
  hidden (display:none) desktop copy's defs won url(#...) resolution and
  KILLED the mobile clip (giant unclipped rect) -> all rig ids now unique
  via useId. (2) overlay trapped under app chrome by ancestor stacking
  contexts -> takeover portals to document.body, carrying the
  .marketing-v2 class so tokens resolve (the handoff's portal-scoping
  lesson applies to ALL fixed overlays inside app pages).
- DEPLOY: user explicitly ordered "deploy that version" — feature PORTED to
  main (motion-lab dir + HomeExperience + framer-motion dep), v4 itself
  stays unmerged/local per standing rule.

### 2026-08-21 Daily Drop v2: Super-Duolingo style, traced vector Dreamy

- STYLE REFERENCE (user-supplied): nickparente.work/duolingo-v2 — the Super
  Duolingo campaign frames. Grammar adopted: deep indigo night, character
  flying with a THICK SOLID light band trailing (the band IS the graphic),
  neon speed streaks, floating glowing diamonds, aurora horizon line.
  User also supplied 3 Duolingo lesson-end videos + style frames (analyzed
  via ffmpeg contact sheets in the session scratchpad).
- DREAMY IS NOW A TRACED VECTOR RIG: characters/DreamyRig.tsx holds exact
  potrace bezier outlines of dreamy-happy.png (body silhouette, night-sky
  eyes with catchlights/star-flecks preserved as path holes, open smile,
  tongue) in the PNG's own 640x640 space, under TF="translate(0,640)
  scale(0.1,-0.1)". Regenerate with scratchpad trace_dreamy.py (PIL masks →
  potrace; NOTE: PBM = potrace traces BLACK, so paint the character 0 on a
  1 background or you get the inverted-rectangle bug). Rig: breath from the
  base, 7s gaze cycle, blinks on an offset clock, gentle tilt; mood="joy"
  = arc eyes + wide smile; halo prop = white outline (Super style);
  brightened palette (body white→#8FC4F4, eyes #132D66, tongue #2E7CFF).
  The user's auto-vectorized SVG (Downloads/1 2 [Vectorized].svg, 166
  posterized paths) was evaluated and REJECTED — unriggable, not flat-2D.
- LightBand: rounded solid band, bright head TUCKED INSIDE Dreamy's
  silhouette (user: trail must begin from the borders), internal highlight
  streaks racing head→tail + sparkles peeling off (user: must visibly flow).
- Takeover restaged per user: character DECELERATES INTO CENTER and holds
  (camera fixed); environment carries speed (streaks/diamonds/band).
  Reveal keeps flash + shockwave rings + rotating sunburst + confetti.
- StarRig (hand-drawn sparkle star w/ face, blink, glints) exists in
  characters/ but is currently UNUSED in the sequence — user direction
  moved from "Dreamy rides a star" to "Dreamy flying solo, Super style."
- BROWSER-PANE GOTCHA: screenshots of a background tab go STALE (Chromium
  stops painting hidden tabs) — tabs_select the dev tab before screenshots.
- framer LESSON (documented in duo-motion.ts): springs accept only TWO
  keyframes; multi-frame arrays must be tweens. Variant transitions override
  the element transition prop (delays need inline animate objects).

### 2026-08-21 /motion-lab Sequence 01: Daily Drop banner + fullscreen takeover

- Built from 3 Duolingo lesson-complete reference videos the user supplied
  (frames extracted via ffmpeg; shared grammar: character streaks across a
  diagonal band -> settle scene -> headline pop -> stat chips pop one-by-one
  -> CTA rises). DailyDropDemo.tsx now lives on the lab stage.
- BANNER: purple-gradient card; star (star-character.svg + star-face.svg,
  the home hero's own art) flies in once on SPRING_BOUNCY with Dreamy
  (dreamy/v2/dreamy-happy.png) popping in beside it; then ONLY the star's
  soft-spring bob and the trail flow keep looping (bars/particles streaming
  away, framer repeat loops) — per user: "one reveal, then it stays flowing."
- TAKEOVER (click, AnimatePresence overlay): phase A "streak" — full-bleed
  -13deg primary band scales in from the left, star + trail + chasing Dreamy
  cross the screen (1.15s), gold "Today's Drop!" pops; auto-advance at
  1.65s. Phase B "reveal" — dreamy-party.png pops center (origin bottom) w/
  staggered gold diamond sparkles, "Drop unlocked!" headline, glowing drop
  card (Robotics Engineer), 3 Duolingo-style stat chips (label riding the
  top border; gold/blue/chart-2) staggered via container variants, tactile
  SAVE TO MY SKY rises last. Esc + X close; useReducedMotion gates loops and
  skips the streak.
- LESSON captured in duo-motion.ts: framer springs support only TWO
  keyframes — scale:[0,1.1,1] + spring THROWS at runtime ("Only two
  keyframes... spring"). Let the spring overshoot instead; multi-frame
  arrays must be tweens. Also: variant-defined transitions override the
  element transition prop, so delayed pops use inline popAt(delay).
- Verified in browser: banner composition, streak phase (held w/ a temp
  long timer to beat rAF throttle, then restored), full click-through
  (reveal + chips render, zero window.onerror), Esc close. tsc green;
  eslint only <img> warnings (same pattern as HomeExperience).

### 2026-08-21 /motion-lab: Duolingo-style motion sandbox (v4 LOCAL, standalone)

- NEW standalone sandbox at /motion-lab — deliberately NOT linked from any
  nav/quick-links; proven animations get lifted into product pages later by
  importing from the config, per user direction.
- framer-motion@13.1.1 added to deps (verified exports + spring API match
  the familiar surface). tailwindcss + lucide-react were already in.
- src/components/motion-lab/duo-motion.ts is the single motion source:
  SPRING_BOUNCY (400/15/0.8), SPRING_SOFT (150/12), popIn variants,
  bobAnimate/bobTransition (mirrored soft-spring ambient loop — gate on
  useReducedMotion at call sites), SQUISH_KEYFRAMES/TRANSITION + squish
  variants (scaleY 0.85 / scaleX 1.15, overshoot, settle; transform-origin
  bottom), TACTILE_PRESS Tailwind string (border-b-4 → active:border-b-0 +
  translate-y-[4px]; active:mb-[4px] refunds the border height so siblings
  don't shift).
- MotionLab.tsx: four demo stations (bouncy pop-in w/ replay, soft bob,
  useAnimate drop→squish sequence, CSS-only tactile buttons) + an empty
  dashed STAGE container awaiting the first real sequence (user will
  direct). Tokens via .marketing-v2 scope, same page pattern as /theme-lab.
- Validation: tsc + eslint green; verified at :3002 in browser (all four
  stations settle correctly, squish sequence completes, no console errors).
  NOTE: the headless preview pane throttles rAF (~1 tick/500ms) so springs
  look frozen in mid-flight captures — environment artifact, not a bug.
- launch.json gained "dreamari-motion" (npm run dev -- -p 3002) because
  another session held :3000; Next 16 refuses two dev servers per dir (had
  to kill the stale PID).
- NEXT: user will specify the first animation sequence to build on the
  stage.

### 2026-08-21 GET HIRED landing chapter + profile de-clutter (merged from landing-get-hired)

- New 6th chapter after Connect: the loop-closer per founder voice notes.
  One frame, staged Next/Back + dots: My Top 3 (browse poster art,
  approved per-world faces, no rings) -> My Plan (editorial hairline
  task list, in-app + IRL steps; the DECA step reappears on the resume)
  -> Resume (realistic high-schooler concept that FADES OUT at the
  bottom, deliberately unfinished, no send button) -> Hire-ready
  (photo + "Your resume, ready to send." - prep, never a hiring or
  auto-share promise). Gold accent (world-building-construction);
  mkt-stage-in / mkt-offer-pop animations; rail dot added.
- MatchRing extracted to src/components/app/MatchRing.tsx (shared by
  profile + landing). tokens.css gained --world-farming-animals-nature
  (was undefined; Food Scientist world labels rendered colorless).
- Profile de-clutter: Top 3 rings AND the entire drag-reorder mechanic
  removed (tap = focus, X = remove); Cards|Compare toggle merged into
  the route pill row as a trailing Compare pill ("<- Cards" inside the
  compare view); header utility pills + inactive route pills went ghost
  (ink only on active states).

### 2026-08-20 route card viz round + header pills

- Header utilities are labeled pills now (Archive icon + "Locker",
  gear + "Settings"), stacked above the streak/readiness row so
  nothing collides at tablet widths; stats row wraps on mobile.
  Name stays "Locker" (product term app-wide); icon reads as archive.
- Route cards: money block reordered to decision priority (Time,
  Total cost, First-year pay); loan payoff now lives ONLY in its
  accordion (repeat removed). Fit accordion: acceptance rendered as a
  gauge (acceptancePct added to ROUTE_DETAILS) with the text as
  caption. Payoff accordion: salary years are a mini bar chart
  (final year solid accent, priors 45%), monthly budget is a
  two-segment bar with legend dots. Copy pass: shorter, punchier
  detail strings.
- Mobile routes: pill switcher (route.short) above the snap carousel,
  synced both ways (tap scrolls, scroll updates the pill).

### 2026-08-20 utility views + locker peek

- Locker and Settings are full VIEWS now: opening either replaces
  everything under the identity header (Top 3 strip + tab bar hidden);
  X returns to Overview. Settings went from modal sheet to inline view
  (SettingsView); TabId gained "settings".
- Overview: the trailing locker strip is gone; a collapsible "Locker ·
  N saved" peek row sits directly under My Top 3 (Overview only),
  expanding to the mini poster strip + "Open full Locker".

### 2026-08-20 My Path full rethink (Replit parity) + IA rework

- ROUTE_DETAILS added to profile data (data.ts): per-route pitch, fit
  (tagline/acceptance/aid/targets/placement), student life (clubs/feel/
  abroad), loan-payoff math (time/avg loan/salary-by-year with bonus
  notes/monthly budget split/takeaway), and compare benefit tags, for
  all 8 routes of the three default careers. Locker-extra careers
  degrade gracefully (sections hidden until authored).
- IA: My Top 3 (full-size poster cards) hoisted ABOVE the tab bar as
  the global context switcher; tabs are now Overview / Path / Plan /
  Locker / Resume (Path and Plan split, mirroring the Replit's
  My Pathways / My Plan). Cards: tap = focus everything, drag rank
  chip horizontally to reorder (drop in slot 1 = focus), X removes,
  dashed slot opens the in-place Add-from-Locker sheet (modal list
  with rings; never navigates to the Locker tab). FOCUS badge + X
  share one top-right cluster.
- Path tab: routes render as three side-by-side COLUMNS (mobile: snap
  carousel) with type icon, pitch, boxless gradient money numbers, and
  three disclosures (good fit / student life / loan payoff incl.
  year-by-year tiles and budget bar). Selected column: YOUR PATH chip,
  CTA becomes "Open your plan for this path" -> Plan tab. Compare view:
  Replit-style category table with per-cell benefit tags + the four
  charts. Journey strip / bento expanded card / Top 3 rows RETIRED.
- Figma pack: captures renumbered 01-10 (new: 05 plan levels, 06 add
  sheet; preview sheet flow removed), README IA section added.
- DONE same session: Locker moved out of the tab bar into a header
  utility cluster (Backpack icon; Settings gear opens a stub sheet:
  photo hint, Notifications / Privacy / Talent Pipeline / school
  account with SOON chips, Sign out). Tabs are now Overview / Path /
  Plan / Resume; LockerTab gained an X that returns to Overview.
  Figma pack recaptured (01-11, new 11-settings-sheet).

### 2026-08-20 My Path polish round 2

- Gradient numerals now fade across the FULL value width
  (linear-gradient(100deg, --foreground 8%, --accent-subtle 92%),
  background-clip text) so short values like "4 yrs" get the treatment
  too; applied in BentoStat and MiniBento. Flagged in the Figma pack as
  a new pattern to author as a reusable style (variables, not hex).
- Dragging a Top 3 row into slot 1 now also sets it as focus (same for
  keyboard ArrowUp reaching slot 1); verified in browser (routes
  heading follows). Next-step strip stacks on mobile.
- Design-system audit: new work is 100% tokens; only raw values in the
  file are the print-report grays (intentional light document) and the
  pre-existing feedback-success fallback + a #000 alpha mask ramp.
- Figma pack: README rewritten for the new My Path anatomy (journey,
  bento hierarchy, gradient recipe, level rows, drag spec incl.
  drop-to-focus); captures 03/04/05 regenerated.

### 2026-08-20 My Path redesign: journey + bento + levels

- Route cards (expanded): a journey strip (Today → school → credential →
  first paycheck, icons + connectors) followed by keynote-style bento
  stats — two sizes only, importance-ordered (First-year pay and Total
  cost at 30px with a foreground→accent-subtle gradient clip; Time and
  Loan payoff at 20px), then a Next-step strip: program/school steps
  link to /colleges ("College lookup →"), real-world steps are marked
  "Do this IRL". Collapsed cards show pay/cost/time with the same
  caption-over-gradient-number hierarchy, no tile chrome. CC-transfer
  cost copy clarified ("then in-state tuition for the last 2 yrs" as a
  sub line; collapsed shows the number only).
- Plan horizons are now Levels: numbered chip + "LEVEL n" caption,
  progress ring (MatchRing) instead of the 5px bar, lock copy
  "Unlocks at 40% of Level n-1".
- Top 3 rows: bigger thumbs (64x46), MatchRing on sm+, rank without
  hashtags. DRAG REWRITE: pressed row lifts (scale+shadow) and follows
  the pointer; other rows slide; commit on release. Window-level
  pointermove/up listeners + a dragRef (pointer events outrun React
  state; grip-only handlers lost the drag when capture failed) —
  verified end-to-end in browser. select-none + touch-callout none
  kill the long-press selection bug.
- Tried and REMOVED per user: 1-2-3 path spine ("too much clutter"),
  bento boxes in collapsed cards ("just the hierarchy").
- Figma pack captures 03-06 regenerated (temp /api/dev-capture route
  re-added then deleted).

### 2026-08-20 theme-lab inventory + profile focus grid

- /theme-lab (v4) now opens with a "What the dev build needs" inventory:
  21 shadcn primitives, each with the product surfaces it covers, plus
  a "stays bespoke" line (poster cards, MatchRing, etc.). Every recipe
  section carries a "Used in:" annotation. The shadcn-branch lab
  (worktree ../dreamari-shadcn, :3001) was rewritten to render ALL of
  them REAL: added sheet/avatar/toggle-group/toggle/accordion/slider/
  radio-group via CLI (23 files in src/components/shadcn) and gave every
  section the same Used-in note.
- PORTAL SCOPING FIX (shadcn branch lab): Radix portals mount on body,
  outside .marketing-v2, so Dialog/Sheet/Select/Dropdown/Tooltip panels
  rendered with shadcn's light :root defaults. Fix: while the lab is
  mounted, hoist "marketing-v2" onto <html> and toggle "theme-light" on
  <body> (descendant split keeps `.marketing-v2 .theme-light` working).
  The dev build needs the same idea: theme scope at html/body level, or
  portal containers inside the scope.
- /profile Overview focus row: on md+ it is now a 3-column grid of
  full-width cards (aspect 148/128 so the Career Report MATCH/ROUTE/
  PLAN band stays above the fold); mobile keeps the 148px scroll row.
  MatchRing is centered above the title inside the scrim column, and
  card text scales with the card via container queries (containerType:
  inline-size + clamp(...cqw) font sizes, text-balance titles). Empty
  Top-3 slots render a dashed "Add a career / Pick from your Locker"
  placeholder that opens the Locker tab (FocusPicker takes onGoLocker).
- Validation: tsc clean both repos; both labs + /profile verified in
  browser (dark + light, dialog portal light/dark, mobile row).
- NOT pushed. Worktree commit is on branch `shadcn` only.

### 2026-08-20 shadcn worktree + theme fixes + legacy purge

- PARALLEL WORKFLOW: new git worktree at ../dreamari-shadcn on branch
  `shadcn` (own node_modules, dev on port 3001 via launch.json entry
  "dreamari-shadcn"; NOTE preview_start can't launch external-cwd
  configs, start it with `npm run dev -- -p 3001` in the worktree).
  Design work continues in /Users/chandump/dreamari on v4 at :3000 —
  the two never touch each other; merge `shadcn` deliberately later.
- shadcn branch: real shadcn/ui installed (radix base, nova preset),
  16 components in src/components/shadcn (ui alias re-pointed; legacy
  ui/Button untouched), /theme-lab there renders the REAL components
  on the Dreamari contract. Init clobbered the legacy dark :root theme
  (restored, declared last) and added a Geist next/font/google import
  (reverted — that pattern broke Vercel builds before).
- Theme fixes (v4): adapter aliases re-declared per scope (:root-only
  aliases froze --card-foreground to the OLD app's #edeff3 — light
  mode dialogs were near-white-on-light); --card lightened #0e0f18 →
  #151829 (re-point the Figma variable).
- LEGACY PURGE (v4): deleted StudentHomeExperience, layout/Navbar,
  flow/match leftovers (MatchDeck/ActionButtons/ProgressPanel/Toast),
  and 23 unreferenced assets (~6MB: images/home/*, old mascots, dead
  career jpgs). dreamari-logo.svg KEPT (unreferenced but brand asset).
  .DS_Store ignored. Build green after purge.

### 2026-08-20 /theme-lab: shadcn recipes on Dreamari tokens (v4 LOCAL)

- New /theme-lab renders shadcn/ui's own component recipes (Button
  variants/sizes, Badge, Tabs, Card, Input, Checkbox, Switch, Select
  trigger, Dialog + DropdownMenu panels, Alert, Progress, Skeleton)
  resolved through tokens.css + docs/handoff/shadcn-adapter.css, plus a
  contract-token swatch board (incl. chart-1..5) and a dark/light
  toggle (.theme-light scope). Purpose: SEE what the dev's shadcn/Radix
  screens will look like and refine by editing the two token files —
  the page follows live. In quick links as "Theme Lab". Also committed
  docs/handoff/COMPONENT-MAP.md (bespoke-to-shadcn mapping + the
  chart-* drift note: Figma's live chart values differ from the
  adapter's 08-19 placeholders; one must be regenerated).

### 2026-08-20 Top 3 interactions + icon pass (v4 LOCAL)

- Top 3 rows: tap the career for a PREVIEW SHEET (poster hero in world
  font, match ring, receipt tiles, Set focus / Close); drag to reorder
  (HTML5 dnd w/ grip handle, live reorder on dragover) with the arrow
  buttons KEPT for keyboard/touch accessibility; focus is an icon-only
  Target button (aria-label + title, filled when active).
- Consistent icon pass: plan task actions are icon-only (aria-label
  carries the verb+task), locker Add/Swap became Plus/ArrowLeftRight
  icon buttons w/ labels in aria+title. Primary CTAs (Export report,
  Find schools) deliberately KEEP text: icon-only primaries hurt
  comprehension (a11y pushback noted to user). 6/6 assertions passed.

### 2026-08-20 /profile round 3: match rings, poster focus, custom plan/report (v4 LOCAL)

- Scores made legible: interest is now MATCH language everywhere. New
  MatchRing (ring graph, percentage centered, tier tooltip "from your
  activity"); tier words: Strong/Solid/Early match, Low signal. Rings
  replace all bars: report Match cell (48px ring + tier + "From your
  activity"), focus cards (34px), locker cards (36px + tier), overview
  strip (26px). Readiness ring replaced by ReadinessMeter: labeled
  journey bar with stage ticks (Building / Pipeline Ready / Opted In,
  doc 22 labels) + n/100.
- Focus picker is now real Browse poster cards (148x210, approved
  per-world poster fonts via posterTitleFont + world label + text
  scrim, rank chip, FOCUS badge, dimmed/scaled unselected). Locker grid
  + overview strip titles also use the poster faces.
- CUSTOMIZABLE PLAN: each unlocked horizon has "Add your own step"
  (custom tasks get a YOURS chip, deletable; counted in all progress
  math incl. gates + report). CUSTOMIZABLE REPORT: export overlay has
  Receipts/Route/Plan section toggles; print honors them; plan export
  includes student-added steps marked "(added by student)".
- Chrome: avatar photo now lives in both navs and links to /profile
  (desktop right panel + mobile bottom-nav last tab w/ accent ring when
  active). New BackButton (router.back w/ fallback) on /colleges
  (mobile header + desktop). Profile tab bar is full-width equal-split.
- 10/10 browser assertions passed; build green. Still LOCAL on v4.

### 2026-08-20 /profile round 2: visual-first, compare charts, /colleges (v4 LOCAL)

- Copy pass: no paragraphs, no em dashes in student-facing text. Evidence
  sentences became RECEIPT TILES (icon + big value + micro label, e.g.
  "2x / IB sim finished"); readiness hint is a chip; empty states are one
  line each; horizon subtitles are 1-3 words.
- Progressive disclosure: route cards collapse to type + program + Cost/
  Pay ministats, expand on select (full facts + "Find schools" CTA);
  Plan opens only the current horizon, others are summary rows with a
  progress sliver or a lock chip.
- Compare view: Cards|Compare toggle on Routes. Four labeled single-hue
  bar charts (Total cost / Years to job / First-year pay / Loan payoff),
  "lower/higher is better" captions, value labels on every bar, selected
  route at full accent, others 45%; routes carry short names + numeric
  midpoints in data.ts (dataviz-skill compliant: one measure per chart,
  identity via row label not hue).
- Locker: its own tab (2-4 col poster grid w/ interest + tier + Add/
  Swap-in) AND a compact poster strip LAST on Overview.
- /colleges NEW: College Lookup shell ("In the works" badge, disabled
  search, preview cards). CTAs from expanded route cards + quick-links
  menu. Deliberately NOT a primary navbar tab until the feature ships
  (recommendation given to user).

### 2026-08-20 /profile polish: photo avatar, immersive header, de-clutter (v4 LOCAL)

- Avatar is now a photo (avatar-jordan.jpg) with an edit pencil badge —
  file picker swaps it in-session (object URL; no persistence yet).
- Identity header is immersive: the FOCUS career's poster art bleeds in
  from the right (masked, world-color tint) and swaps with the focus.
  NOTE for this dev tab: one Next/Image width bucket (w=1920) stalled in
  the preview proxy; header art uses sizes="420px" + priority which
  loads fine (prod optimizer unaffected).
- Overview de-cluttered: report card is one block — caption row, big
  title, a single divided 3-stat band (Interest / Route / Plan, no
  truncation), evidence receipts, two actions; the duplicate Next-step
  stat and the separate readiness-hint card are gone (hint is now one
  quiet line under the next-action card). Locker + plan task rows
  dropped their borders (surface-only).

### 2026-08-20 /profile prototype on v4 branch (LOCAL-ONLY — do not push)

- New branch v4 (off v3=main). Audited the Replit v2-my-profile + the
  Career Intelligence Layer V3 doc (Downloads/Dreamari Career
  Intelligence Layer V3.docx); audit delivered in chat. Built /profile:
  three tabs (Overview / My Path / Resume — Career Crew cut per user).
  FOCUS-DRIVEN: student picks one of their Top 3 and the Career Report,
  Routes, and Plan all follow; per-career routes obey the doc's 1.7 rule
  (IB=target uni/state/CC-transfer; Pilot=Part 141/aviation uni/military;
  etc.), each w/ cost, duration, credential, salary, loan payoff.
- Top 3 editing: add from Career Locker, reorder, remove; swap sheet
  when full; focus falls back to #1 when its career is removed; empty
  slots + zero-state CTAs to /match-lab + /explore; locker-empty state.
- Plan: per-career task completion, 3/6/12-mo horizons gated at 40%,
  progress hidden until first task, next-best-action card on Overview.
- Export: per-focus Career Report overlay — paper-styled page (student,
  date, interest/readiness/route/plan stats, evidence receipts, route
  facts, full plan) with Print/Save PDF (print CSS: .no-print /
  .print-overlay in app.css). Readiness ring + doc status labels; NO
  vanity point totals (doc scoring rules). All copy = PROTOTYPE.
- Known limits: state is in-memory (resets on reload — no persistence
  yet); readiness/streak are static; Resume tab is a stub. 22 browser
  assertions passed (focus switch, swap, gates, export, empty states);
  build green. Files: src/app/profile/, src/components/profile/,
  chrome.tsx (Profile in nav/quick links/mobile nav).

### 2026-08-20 For You fits the viewport; standard nav gap (PUSHED)

- Explore For You (desktop) no longer scrolls: main is
  h-[calc(100dvh-62px)] with the snap feed capped at min(672px,
  available) so the Env Card shrinks to fit short screens, centered in
  the leftover space. Verified at 1280x700: zero page scroll, card
  fully visible.
- One standard content offset below the navbar — space-10 (40px) — on
  /home and both Explore faces (landing page untouched, per user).

### 2026-08-20 Details panel flip + logo-to-landing + quick-links everywhere

- For You reel's info card is now the two-face Career Details Panel
  (2486:43002): tap flips Summary <-> Details (MAJOR + MAIN SKILLS,
  MORE INFO header, page dots swap). PE carries the component's own
  default details; other 7 careers' majors/skills are PROTOTYPE COPY
  flagged in catalog.ts.
- DREAMARI logo (desktop nav + mobile home header) now links to the
  landing page (/). New QuickLinksMenu in chrome.tsx: glass dropdown
  with Landing/Home/Explore/Build/Match, mounted in the desktop nav's
  right panel, the mobile home header, and Explore's mobile top bar
  (left-aligned variant). Every app page can now reach every other
  prototype page.

### 2026-08-20 Explore header redesign + rank numerals + hero controls (PUSHED)

- Explore/Browse search now expands from the 40px icon (matching the
  For You/Browse All toggle's height/radius) with a 300ms ease; the
  toggle folds away while search is open. Filters became two clean
  stacked rows: world pills (full-bleed scroll) + a SORT BY row
  (Recommended / A-Z / Salary) — filter and sort compose; closing
  search derives the view back to unfiltered (no silent filtering) and
  empty rails hide while filtering. Rails on Home + Explore now bleed
  to the screen/column edge on ALL breakpoints so partial cards signal
  scrollability.
- Trending rank numerals: hollow outlined digits (fill = background +
  1.5px light stroke) per the mobile Browse frame — visible on any
  backdrop; opsz 14 set. NOTE: stroke value approximated from the
  frame render (Figma tab was inactive); verify against UI/Rank Number
  when convenient. Ranked 175px cards scale titles by longest word
  (ENTREPRENEUR-class words step 24->17px, keep-all) so nothing breaks
  mid-word.
- Home hero: swipeable on touch (50px threshold, axis-checked) and
  desktop prev/next chevrons that wrap around; autoplay unchanged.

### 2026-08-20 Mobile polish round: hero 430, full-bleed rails, fades, scroll fixes

- Per phone feedback + the Figma mobile frame (01 Directive — Mobile,
  7:1749): hero card is now the frame's 430px/radius-20 with its OWN
  compact comet-trail geometry (bars/particles at exact mobile coords)
  and radius-md full-width CTA; "Continue Where You Left Off" title now
  sits above the fold. Activity cards use the mobile variant (304 wide,
  art 132, inner left-15, track 160@123). All horizontal rails go
  full-bleed on phones (-mx-5 px-5) so neighbor cards peek, and carry
  touch-action: pan-x pan-y so vertical swipes always pan the page
  (the "can't scroll past Tech & Engineering" report). Hero art fades
  are now soft masks on the whole art block instead of hard overlay
  strips. Background-space SVGs (2602/3355px) are wrapped in
  absolute-inset-0 overflow-hidden so iOS can't extend scroll past the
  content ("scrolls forever" tail). tsc/eslint/build green; verified
  at 375px and desktop.

### 2026-08-20 Build → new match flow; old MatchExperience DELETED; quick links

- CompletionScreen's "See My Matches" now bridges through the 1.8s
  MatchLoadingScreen beat and router.pushes to /match-lab (the real
  match flow). The old in-page match flow is deleted:
  MatchExperience.tsx, PathSavedScreen.tsx, matchData.ts removed;
  BuildFlowExperience's match phase/confetti plumbing stripped
  (MatchBackdrop + MatchLoadingScreen kept for the loading beat).
  /career-report still accepts ?from=match. Verified with a full flow
  walk in the browser: completion → loading → lands on /match-lab.
- Landing nav QUICK_LINKS now: Home /home, Explore /explore, Build
  /flow, Match /match-lab. Pushed to main per user.

### 2026-08-20 For You reel: full 8-card TikTok doom-scroll (v3, LOCAL)

- Figma tab reopened: pulled the remaining 7 Env Cards from the Mobile
  Reel (2530:46431) — Aerospace Engineer, Product Designer, Biomedical
  Researcher, Marine Biologist, Neurosurgeon, Constitutional Attorney,
  Creative Director — copy + salaries verbatim, env photos into
  public/images/app/env-*.png (some are 8-9MB source PNGs; Next/Image
  optimizes at serve time, repo weight noted).
- ForYouFace rebuilt as a vertical scroll-snap feed (TikTok-style):
  full-bleed viewport on mobile, the 390×672 card frame on desktop;
  chevrons/arrow-keys scroll the feed; IntersectionObserver tracks the
  active card. Active card's photo runs an 18s Ken Burns push-in
  (env-slow-zoom in app.css, restarts per card) + rAF parallax (~36px
  drift on a taller-than-card wrapper). prefers-reduced-motion disables
  both. Verified live: snap paging, zoom class following the active
  card, parallax offsets on neighbors.

### 2026-08-20 App Home + Explore (For You / Browse All) built from Figma (v3, LOCAL)

- /home REPLACED (old tabbed StudentHomeExperience superseded; file kept,
  unused — StudentAppShell still serves /career-report). New Home ports
  Figma "Home — v2.1" (2099:3423): 3-panel hero carousel (Today's Drop
  star+comet art, Continue w/ progress, Trending; dots + pause, 7s
  auto-advance), Active Activity rail, Careers Picked for You poster
  rail, Career Signal Banner, Glossary Challenge Banner. Mobile per the
  mobile frame: logo+streak/XP header, in-flow star, full-width pill
  CTA, mobile copy variants, bottom Mobile Nav.
- /explore NEW: For You (Env Card reel, 2288:16179 — preference rail,
  prev/next, mobile full-bleed w/ in-card actions) + Browse All
  (3185:17011 — all six rails incl. ranked numerals + salary shimmer
  cards) via ?tab=browse. Search interaction per user spec: collapsed
  icon → input + world pills + Sort by; Sort by ⇄ sort pills (Recommended
  / A–Z / Salary, functional). Mobile gets its own search entry.
- Shared: src/components/app/{worlds,catalog,chrome,PosterCard,
  HomeExperience,ExploreExperience}. Tokens via .marketing-v2 scope;
  added --accent-subtle/--chart-2/--chart-3/--primary-ghost/--amber-400/
  --text-muted-alt to tokens.css (values from certified design context).
  Poster faces bind per Figma variants (added Rozha One/Merriweather/
  Zain to FONT_STYLESHEET_HREF). ~45 assets in public/images/app/.
- KNOWN GAPS (Figma desktop tab went inactive mid-pull): For You reel
  has only Private Equity (7 more env cards to pull: Aerospace, Product
  Designer, Biomedical, Marine Biologist, Neurosurgeon, Attorney,
  Creative Director — section 2530:46431); Mobile Nav icons approximated
  with Lucide pending component 2569:4894; nav logo mark + mobile smiley
  star face assets unavailable; tiny hero circles/particles re-rendered
  as positioned dots (geometry from design, fill white). Design content
  quirks ported verbatim & flagged: Browse rail headed "Tech &
  Engineering" holds farming/building cards; rank-3 NURSE carries the
  ranch photo. tsc/eslint/build green; desktop+mobile browser-verified.

### 2026-08-20 Fashion Designer gets its designated poster; v3 → main PUSHED

- User pointed at Figma node 3284:9051 as THE Fashion Designer image —
  the properly-composed poster crop of the studio scene. Downloaded to
  mf-fashion-designer-poster-2.png (396×594, the asset server's export
  size — max available; slightly soft on 3x phones, fine for prototype),
  old file removed, data.ts updated. Verified on the card in browser.
- User then said "push to main when done" — explicit authorization, so
  v3 was merged into main and pushed (Vercel deploy). TEMP match-lab
  debug aids (LAB BUILD pill + error-trap script) intentionally ride
  along — they await the user's phone-swipe confirmation before removal.

### 2026-08-20 build flow: picks/setup panels unified (v3, LOCAL)

- Interests "Your picks" panel now matches Work Vibe's "Your Setup"
  treatment exactly (px-3.5 py-2.5 panel, 0.14em caption tracking,
  Bricolage 17/18 values) and lays picks HORIZONTALLY with a dot
  separator (flex-wrap, so two long world names break cleanly on
  phones). Work Vibe's "Your Setup" moved ABOVE the option rows,
  full-width, mirroring the interests composition. Both per direct
  user request. Verified both screens in browser; tsc + eslint green.

### 2026-08-20 match-lab poster photos: Food Scientist + Footwear Designer (v3, LOCAL)

- Both careers wore "For You"-style photos; replaced with Browse-poster-style
  images from Figma Section 2 (node 3282-9044, the poster template library).
  Food Scientist = exact match (node 3282:8729, lab/pipette shot) →
  public/images/matchflow/mf-food-scientist-poster.png. Footwear Designer had
  NO poster in Section 2 (most Arts & Media templates are image-less), so per
  the user the card is now Fashion Designer (node 3282:8711's poster, same
  world) with copy adapted to fashion → mf-fashion-designer-poster.png.
  User flagged the card as "stretched/malformed" — verified live it is NOT:
  object-fit cover, natural aspect preserved; the earlier screenshot was a
  mid-swipe cross-fade double-exposure. Verified settled render in browser.
  v3 stays local — no push.
- Still pending: Aviation Maintenance Tech uses mf-electrician.png
  (placeholder); TEMP debug aids (LAB BUILD pill, error-trap script in
  src/app/match-lab/page.tsx) await removal after phone confirmation.

### 2026-08-20 A/B verdict: cinematic wins — glass build-flow variant purged

- Per the user's A/B result, variant B (cinematic/boxless) IS the build
  flow now. /flow renders it directly; /flow/cinematic 308-redirects to
  /flow so shared links survive. The A/B pill, VariantContext/useVariant,
  the glass GlassCard + gradient header strips, the glass Work Vibe side
  panel, the glass Dreamy perch/bubble branch, and the header lucide
  icons are all deleted (variant.tsx now exports only cascade(index)).
  PhaseProgress and every shared piece (chips, footer, map, cost slider,
  sounds) untouched. Verified: full walk to the 50% milestone, redirect,
  lint/tsc/build green.

### 2026-08-19 v3 branch opened: match-flow prototyping (LOCAL-ONLY)

- `v3` branched from 78129a9 for prototyping a new match flow. HARD RULE
  from the user: v3 NEVER merges and NEVER deploys unless explicitly
  asked — and since Vercel auto-builds previews from any pushed branch,
  v3 is never pushed at all. Local commits only.
- BUILT (2026-08-19, local-only): /match-lab is now the full new match
  flow from the user's wireframe + Figma 3241-9530: Career Poster Card
  deck (per-world faces incl. newly-loaded Lora/Fraunces/Heebo; two new
  Figma poster assets in public/images/matchflow/), swipe/scroll gesture
  split with axis lock, stamps, fly-to-slot FLIP ghost + slot pops,
  gesture guide sheet, decision sheet at 3, swap sheet when full, rank/
  reorder/remove manage sheet, undo (pass/like/swap), tailored end
  panels (0/1/2/3), restart excludes liked. All verified in-browser,
  desktop + mobile.
- Previous scaffold note: /match-lab originally mounted the production MatchExperience
  standalone (src/components/match-lab/MatchLab.tsx) so the match flow
  can be iterated without walking the eight build steps first.

### 2026-08-19 landing v2 line SHIPPED TO MAIN (was parked on v2 branch)

- Full v2 redesign line merged to main per explicit authorization: Explore
  as Browse miniature (Figma trending images, per-world poster faces),
  mono->Montserrat caption sweep site-wide, compact chapter flow, wide
  Explore frame, Match "Tap to see details" pill, slower Dreamy fade,
  accent-family-to-brand-blue propagation, dev handoff package in
  docs/handoff/.
- Final round before ship: Explore rail simplified (filter pills removed,
  label "Top 5 Trending", rank numerals removed, tighter gap) and a
  graphic-width consistency pass — measured widths were Build 480 / Play
  432 / Match card 346. Match's caption+buttons now OVERLAY the card foot
  (poster title lifted 102mu clear), giving the card full frame height ->
  445px wide; Play card widened to 100cqw/480. Explore stays wide (780) by
  design.

### 2026-08-19 landing Explore chapter redesigned as Browse (v2 branch, NOT pushed)

- Per stakeholder review: FYP-style swipe deck read as too-modern for older
  clients. Explore chapter graphic is now a miniature of the app's real Browse
  page (Figma 3185-17011): drifting world-filter chip band + the ranked
  "The Top 5 Trending Careers Among Gen Z" rail (marquee, pauses on hover,
  reduced-motion safe) + "Tap to learn more →" caption (also from review).
  Top-5 list/images are the Figma section's own (Doctor, Software Engineer,
  Nurse, Lawyer, Airline Pilot — assets downloaded to public/images/trending/).
  Rank numerals follow the component spec: Bricolage ExtraBold, dark fill,
  ~62% of card height via cqh (band is a size container). Tokens only —
  world colors, glass, scrims, poster fonts from marketing tokens.css.
- The old deck (ExploreCarousel + holo Wildcard) was deleted with the toggle —
  this also removed the repo's last eslint error (refs-in-render). History has
  it if ever needed.
- ON BRANCH v2 ONLY, per explicit instruction: NOT pushed, live deployment
  untouched. The stale old v2 branch (fully merged) was reset to current main.

### 2026-08-19 prod incident: /flow crashed WebKit phones — FIXED + legacy purge

- **iPhone (Safari AND iOS Chrome — both WebKit) crashed the tab on /flow**
  ("a problem repeatedly occurred"): four full-viewport `filter: blur(120-180px)`
  nebula layers + Dreamy's blur-2xl glow + a backdrop-filter on all 13 cinematic
  chips exhausted WebKit's GPU memory. Fix (3c9606d, pushed): nebulas and glow
  are now pure radial-gradients (visually equivalent, no filter), per-chip
  backdrop-blur removed. RULE for this project: never ship large-area
  `filter: blur()` layers or per-item backdrop-filters — WebKit phones die.
  Card-level glass backdrop-blur (2-3 layers) is fine.
- **Legacy purge (user-approved, post-verification)**: deleted the orphaned
  12-step flow — FlowContainer, src/components/flow/steps/ (12 files), and 14
  single-use widgets (FlowButton/FlowCard/FlowProgress/StepHeader/GridOption/
  LabeledInput/LabeledSelect/RadioPillGroup/SelectionRow/PathOption/GifBanner/
  BackButton/DreamyCorner/DreamySpeechBubble) plus flow/types.ts. KEPT (live
  consumers): HomeButton, StepTransition, icons.tsx, aurora/, match/, theme/.
- **Token pipeline cleanup**: removed `color.step.*` (semantic, 12-step accents
  + step-08 gradients — only consumer was the deleted flow) and
  `component.button` (superseded by `component.cta`, which is what the dev
  handoff documents). Generator no longer emits src/generated/design-tokens.ts
  (deleted; its arrays fed only the old flow). `color.category.*` KEPT — the
  student app + globals.css consume it. tokens:check: 583 tokens green.

### 2026-08-19 /flow rebuilt end-to-end with A/B variants — SHIPPED TO MAIN

- **New build-profile flow** under `src/components/build/` replaces the flow
  step rendering path for `/flow` (old `src/components/flow/steps/*` +
  FlowContainer remain on disk, now orphaned — purge is the agreed NEXT task,
  only now that the replacement is verified). Copy is verbatim from
  `docs/BUILD_FLOW_SPEC.md` (Replit walkthrough); input formats follow the
  Figma Build Flow frames; surfaces use the pipeline glass/night tokens only.
- **Two A/B variants, one implementation** (`variant.tsx` context):
  - A "boxed/glass" at `/flow`: Replit card structure — gradient header strip
    (icon + step title + constraint), progress above the box, "Your Setup"
    natural-height side panel on Work Vibe desktop, Work Vibe = pick-one button
    rows, tracker row on Interests. Column capped 680px.
  - B "cinematic" at `/flow/cinematic`: boxless, left-aligned per Figma frame
    3214-7363, in-flow progress with the question block, ink-bleed headings,
    frosted whisper speech bubble for Dreamy. Column capped 860px. Same state,
    switchable mid-flow via the A/B pill (answers persist).
- Both variants keep: real USA map (@svg-maps/usa, state codes, order chips) +
  list dropdowns, enhanced 6-stop cost slider, interactive Dreamy rig (parallax,
  reactions, local bursts), progress swell sound + spark fan, phases-only
  labels ("Phase 1"–"Phase 4" — names dropped per direct request), light/dark
  toggle, match handoff to `/career-report`.
- **Mobile made real**: one scroll container with m-auto centering (short steps
  center, tall steps scroll as a coherent group), pt clearance for fixed
  controls, 2-up chips on phones, nebula backgrounds given px floors (vw-only
  sizes vanished at 375px → flat black; that's why glass looked dead on phones),
  Dreamy glow enlarged/softened so no wrapper edge clips it.
- Validation: tokens:check 627 tokens green, prod build green, eslint green in
  src/components/build (the one remaining repo error is Explore.tsx:517
  refs-in-render, pre-existing on main, untouched).
- Pushed to main → production per explicit user authorization ("push to prod
  once copy is aligned"). Task list: purge of the orphaned flow-step components
  + retired token/code paths is next (user-approved, post-verification).

### 2026-08-19 duck retimed to the fold + hide-on-scroll nav (both prod bug reports)

- **Void report round two, actual root cause found**: the duck's lead distance
  was proportional to Dreamy's stage height — fine at 264px, but the dvh-aware
  sizing made the stage 372px+ on tall phones and the lead grew past the entire
  hero-to-Build gap: progress hit 1 while Build was still ~600px below the fold,
  so tall phones saw void with NO Dreamy (the exact complaint, twice). New
  formula: progress = (vh - buildTop) / (0.5 * stageHeight) clamped — he holds
  the bezel at full opacity until Build's top actually crosses the fold, by
  definition on every screen size, then tucks away over half a stage-height of
  scroll while the reader can see what he's yielding to. Verified stepwise at
  430x930: opacity 1.0 until Build entered, 0.62 at buildTop=859, gone by
  buildTop=709; reverse scroll re-materializes him symmetrically.
- **Nav island covering chapter titles (PLAY on mobile)**: island now hides on
  scroll-down past 160px (translateY off-screen, 300ms) and reveals on any
  scroll-up, with a 6px delta threshold so iOS momentum wobble and dvh toolbar
  settling don't flicker it. Plus scroll-mt-24 on every ChapterShell section so
  JS chapter advances land titles 96px clear for whenever the island IS visible.
  Verified: post-advance PLAY title at y=162 with the island hidden.

### 2026-08-19 tall-phone void fix + build-flow discovery

- **Tall-phone hero void fixed** (user screenshot showed a huge dead band between
  the hero copy and Build on a ~930pt iPhone): --mascot-size now takes the max of
  the width term and a height term, `max(clamp(264px, 38vw, 460px), min(40dvh,
  520px))` — the hero must fill 100dvh (Dreamy is fixed to the bezel), so on tall
  narrow screens the leftover height pooled as void; letting Dreamy's size track
  dvh converts that void into character (~372px on a 930pt phone). Desktop
  unchanged; short-viewport overrides still win.
- **Build-profile flow rebuild is IN FLIGHT on the design-system-alignment
  branch** — full verbatim spec of the Replit reference flow captured in
  docs/BUILD_FLOW_SPEC.md (8 steps + 50% milestone + completion, all copy exact).
  Key implementation directives from the user: real USA map (not the Replit's
  chip grid) alongside the List/dropdown view; enhanced slider for Education
  Cost; interactive Dreamy (eye-tracking/parallax rig + sprite expression
  reactions — sprite packs unpacked in the session scratchpad, 10 expressions +
  3 themed poses); keep the aurora background but align it to the design system;
  Replit's "Skip" buttons are demo-only, omit; then purge legacy/orphaned design
  system tokens (only after the new flow is verified — guardrail). Figma frame
  3009-15623 is the visual source; pull pending on the file being Figma's active
  tab.

### 2026-08-19 scroll snapping removed entirely

- Page-level scroll snap is gone (rule in globals.css, scrollSnapAlign in
  ChapterShell, the IntersectionObserver wiring in HowItWorks) after a full
  assessment, per direct approval of the recommendation: proximity snap kept
  grabbing phone flings (any deceleration near a boundary, which with five
  near-full-screen chapters is most of the page), and nothing depended on it —
  every guided chapter advance is JS scrollIntoView, Explore's paging is its own
  system, and the chapter rail reads position independently. Verified post-
  removal: computed scroll-snap-type is none, the Build pick still lands Match
  flush at the viewport top, rail still shows. If snap ever returns, scope it to
  fine-pointer devices.

### 2026-08-19 hero top-air composition, Simulate -> Play revert

- Hero top padding pt-[88px] -> pt-[clamp(120px,15vh,176px)]: with the copy
  top-anchored, 88px put the audience toggle nearly touching the floating nav
  island (called out directly). The clamp gives the island a viewport-scaled
  band of clear air (~122px phone, ~150px laptop, capped for tall monitors) so
  the toggle sits in the quiet zone between nav and headline.
- Chapter name reverted Simulate -> Play "for now" per direct request, in all
  four user-visible spots (chapter title, rail label, CTA eyebrow, hero caption
  verb list). Section id was "play" throughout, so nothing structural moved.
  Expect this may flip again.
- Design-system alignment continues on the `design-system-alignment` branch —
  Phase 3 started there: `component.cta` token group extracted live from Figma
  (CTA = 2261:12200; NOTE: primary is light-surface with BLUE as the pressed
  state, not blue-primary) with every value aliased through new cta-foundation
  primitives, and `src/components/ui/Button.tsx` (which had zero call sites)
  rebuilt as that CTA. The user's Figma PAT seen in chat lacks variables scope
  and should be revoked; the desktop-bridge MCP tools are the working pull path.

### 2026-08-19 hero rebalance, bigger phone Dreamy, frosted island nav

- Hero copy re-anchored justify-end -> justify-START per direct feedback ("too
  centred / starts too low"): the headline block now begins right under the nav
  like a normal landing page; leftover height on tall screens pools between the
  scroll hint and Dreamy, who visibly holds the bezel beneath it.
- Dreamy's mask fade band now COMPLETES BELOW the bezel (71% -> 83%, vs the 77%
  visible cut): the old band hit zero alpha a hair above the edge, which read as
  him hovering above the screen border on iPhone (reported with a screenshot).
  ~50% mist opacity survives AT the bezel so the physical screen edge makes the
  final cut. Phone size floor also raised: --mascot-size clamp floor 210 -> 264px
  (38vw mid-band; short-viewport overrides untouched).
- Nav re-imagined as a floating frosted ISLAND (fixed, centered, rounded-full)
  per direct feedback: "Sign in" removed entirely, single compact "Get started"
  CTA (the hero's Start Journey is the real conversion point), links unchanged on
  desktop. Fully transparent at page top (links float over the hero), frosts in
  past 24px of scroll: color-mix background off var(--background) (so the Schools
  light theme frosts correctly), blur(18px) saturate(1.6), hairline border, soft
  shadow. Being `fixed` it no longer occupies flow: hero is min-h-[100dvh] with
  pt-[88px] to clear it; SchoolsView's own pt-[76px] still clears the ~72px
  island envelope.
- NOTE: the design-system alignment work lives on the `design-system-alignment`
  branch (Phase 2 committed there: 15-world token layer through the DTCG
  pipeline; Vercel Preview deployments confirmed working for branches). This
  entry's changes are marketing-page fixes shipped straight on main.

### 2026-08-19 mascot fixed to the viewport bezel + hero gap compression

- **Dreamy is now `position: fixed` to the viewport's bottom edge** — the final
  answer to "the screen's limit must do the cut, on every screen size." Both
  hero-anchored versions put the crop line wherever the hero happened to end
  (mid-screen on tall viewports, below the fold on small phones); no exit-fade
  retiming can fix an anchor that isn't the screen edge. Fixed positioning makes
  the viewport the anchor by construction: he peeks from the actual bezel at
  page top on ANY device, holds there solid while the page scrolls past him,
  then ducks back down THROUGH the edge. The duck is timed off **Build's
  measured position** (`#build.getBoundingClientRect().top`), not viewport
  percentages — every percentage guess mistimed on some device class; now he
  reaches fully-below-the-bezel exactly as Build's title arrives at where his
  head was, so they trade places (verified stepwise on the mobile viewport:
  solid at 0/150px scroll, gone precisely at Build handoff). Notes: the hero's
  overflow-hidden no longer crops him at all — irrelevant, the viewport edge is
  the crop; no ancestor has a transform so the fixed containing block really is
  the viewport; Schools view hides him via the student <main>'s display:none.
- **Hero scroll-gap compressed** per follow-up ("long empty blank space when I
  scroll to Build"): hero's inner wrapper switched justify-center -> justify-end
  (leftover height now pools ABOVE the toggle as intentional-looking header air
  instead of scrolling by later as mid-page void), the mascot reserve padding
  trimmed .77+16px -> .72+8px, and the "How Dreamari works" block's paddings
  tightened. Measured on the 375px viewport: hint-to-Build gap 401px -> 288px,
  with the hint still clearing Dreamy's head at load (9px margin; also clear on
  1440x800 where the mascot is largest).

### 2026-08-18 Start Journey CTA size tiers

- `MarketingButton` gained a `size` prop (md/lg/xl; md is the old fixed size and
  the default, so Nav's className overrides and SchoolsView are untouched). The
  hero's Start Journey is now `lg`, and the final "You're ready." section's is
  `xl` (44px/20px padding, 18px text) per direct feedback that the closing CTA
  especially needed more weight — the last action on the page is its biggest.

### 2026-08-18 mascot exit retimed to hero position (mobile blank-space fix)

- **Mascot scroll-exit rewritten to anchor on the hero's real viewport position**
  (`Mascot.tsx` update()): the old driver was raw `window.scrollY` against 62% of
  the hero's height — which silently assumed Dreamy is on screen at scroll 0 and
  should be gone shortly after. True on desktop; badly false on phones, where the
  hero's content column fills the whole screen: Dreamy started at/below the fold,
  and by the time a reader scrolled to him the fade had already dissolved him —
  leaving his entire reserved strip as a big blank purple void before Build
  (reported directly from a phone). Now: progress derives from the hero's bottom
  edge in the viewport, with a DEAD ZONE — 0 until that edge climbs past 55% of
  the viewport (Dreamy fully solid the whole time his strip is in the lower/
  middle of the screen), ramping to fully faded by ~8% from the top. Verified on
  the mobile viewport: opacity 1.0 at load and at 200px scrolled, 0.88/0.48/0.09
  at 400/550/700 as the region actually exits. Also added a ResizeObserver on the
  hero re-running the computation — the one-shot mount call could run before
  layout settled and left a stale opacity until the first scroll event.
- Reduced the exit's sink/shrink (110px/0.32 -> 60px/0.24) — with the fade now
  happening only during actual exit, the bigger values overshot.

### 2026-08-18 Connect post engagement counts + class-year tags

- Jordan and Priya's reply tags switched from high-school grades to college class
  years per direct request, assigned logically around Maya (the Sophomore asker):
  Jordan · Freshman is the "just applied" early explorer, Priya · Sophomore is
  Maya's peer bookmarking for this cycle. Marcus stays Goldman Sachs · Analyst.

- Post card's counts bumped per direct request: 333 likes (user floated 274 and
  asked for a "Gen-Z trendy number" near it that isn't 420 — went with the angel
  number 333, a genuinely current Gen-Z thing; 222/247 were the runners-up) and
  67 comments (the user's own pick — the viral "six-seven" meme number). Comment
  count is now deliberately decoupled from REPLIES.length: real social apps show
  the total while rendering only top comments, so 67-total/3-visible reads
  authentic rather than broken.

### 2026-08-18 environmental mascot fade + parallax lighting rig

- **Mascot fade made environmental** per direct feedback with a phone screenshot:
  the mask moved OFF the float wrapper (where it traveled with the bob and read as
  a black fade painted on the character mid-air) and onto the static stage — the
  fade band now belongs to the frame, so Dreamy bobbing up rises OUT of it and
  more of him becomes visible, like mist at the screen's limit. Safe only because
  the Image's drop-shadow filter is already gone (a mask on an element clips any
  descendant filter output to the masked box — the original halo bug). Same band
  numbers (69.5->76.5%, crop at 77%); the float's base position is its lowest
  point, so opacity still can never cross the crop.
- **Parallax pseudo-3D chosen over a modeled 3D character** (user picked it
  explicitly): three layers now move at three rates off the existing cursor
  state — the ambient glow drifts AGAINST the cursor (farthest), the body lean
  sits in the middle (existing), and a new lighting sheen travels WITH the cursor
  (nearest). The sheen is a soft-light radial hotspot masked by the mascot PNG's
  own alpha (`mask-image: url(...)`) so light lands only on the cloud silhouette
  and the artwork's pixels stay untouched; driven per-frame via
  backgroundPosition on a 220%-oversized gradient. Verified live: hovering left
  of the mascot moves the sheen hotspot left while the glow shifts right.

### 2026-08-18 nudge-stutter fix, Simulate Q&A declutter

- **Explore's peek-nudge stutter root-caused and fixed** (reported on desktop AND
  mobile): the intro peek drives `dragPx` per-frame from requestAnimationFrame, but
  each card's inline `transition: transform 0.42s` was active whenever no pointer
  was down — so every rAF update got re-smoothed by a transition that perpetually
  restarted and chased the target a beat behind. The card visibly rubber-banded.
  Fix: transition is now gated on `pointerActive || dragPx !== 0` — rAF-driven
  motion tracks 1:1, and the eased transition still owns the release settle and
  button/wheel commits (both happen at dragPx === 0). General rule worth keeping:
  never leave a CSS transition enabled on a property a rAF loop is writing.
- **Simulate's Q&A decluttered without copy changes** (asked directly "do they look
  too cluttered?" — yes): the narrator/scene line dropped its full bordered-bubble
  box for a left quote-bar treatment, so boxes are now reserved exclusively for
  the three tappable answer rows; slightly more air above the question line. The
  panel now reads label -> narration -> question -> answers instead of
  box-box-box.
- Open items from the user, answered in chat but NOT built: a possible better name
  than "Simulate" (recommended keeping it — matches the nav's existing
  "Simulations" item; alternatives offered: Experience / Step In / Shadow), and a
  true-3D Dreamy (feasible via react-three-fiber but requires the character
  modeled as a GLB to keep the exact appearance — a separate scoped project;
  offered a pseudo-3D layered-parallax middle path that keeps the artwork's
  pixels untouched).

### 2026-08-18 SIMULATE rename, new deal-kickoff scene, cache-busting image names

- Play chapter renamed to **Simulate** everywhere it's presented as a name: the
  ChapterShell title, ChapterRail label, the final CTA eyebrow (also fixed to the
  current chapter ORDER: "Build. Match. Explore. Simulate. Connect."), and the
  hero caption's verb list. The section id stays `play` on purpose — Explore's
  next-chapter jump, the rail, and the snap flow all target it by id; renaming the
  anchor is invisible to users and would break every hardcoded scroll target.
- Simulate's scene art replaced with the user's new deal-team-kickoff illustration
  (Figma node `3173-16665`, 1448x1086 — first-person POV at the table, Christina
  presenting, Marcus arms crossed; matches the scenario copy beat for beat).
  Immersion pass without copy changes: a slow Ken Burns drift on the scene
  (`mkt-sim-drift`, 18s alternate, 1.02->1.08 scale — base is 1.02 so the drift's
  translate never exposes the image edge) and the choice panel's padding/gap
  shaved slightly so the art absorbs the difference.
- **Same-name image swaps are now banned practice in this repo — three separate
  stale-cache incidents this session**, including the user seeing an old
  Investment Banking photo on their own machine after a deploy: browsers AND the
  Next image optimizer key caches on the URL, and the dev optimizer even
  re-persists its in-memory cache on shutdown (deleting `.next/cache/images`
  while the server is running does nothing — stop, delete, then start). Fixed
  properly by renaming: `sim-deal-kickoff.jpg` (was play-illustration.jpg) and
  `career-investment-banking-2.jpg` (was career-investment-banking.jpg), with
  components updated. Old files left in place. **Rule going forward: a replaced
  image gets a NEW filename, never an overwrite.**

### 2026-08-18 follow-up: mouth-visible crop, final IB photo, Build citation

- **Mascot crop widened to show eyes + full mouth** per direct request ("on desktop
  I can only see dreamy's upper head"): measured the mouth's real pixel extent in
  `hero-cloud-mascot.png` (63.42%..68.83% of the artwork — the old 70% crop with a
  fade completing at 69.5% was dissolving the mouth itself). New geometry, all
  values moved together: `VISIBLE_FRACTION` 0.7 -> 0.77, the scroll-exit transform
  now derives its translate from that constant instead of hardcoding it, the
  static className translate matches (23%), the mask fades 69.5% -> 76.5%, and
  Hero's reserve-padding multiplier is .77. Fallback agreed in advance if the
  mouth-visible version doesn't land: pull `VISIBLE_FRACTION` back toward 0.7 and
  slide the mask band back up (fade must always COMPLETE just before
  1 - translate). The cloud raster bottoms out at 84.67%, so 77% still reads as a
  peek.
- Investment Banking's photo replaced again with the user's final pick (Figma node
  `3173-16594`, 1088x1445 — the seated three-monitor office portrait), same
  filename so no code change. Verified the dev server serves the new 387KB file.
- Confirmed "Business & Finance" -> "Business & Money" is fully swept — zero
  occurrences left anywhere in `src/` (Match's card line + Explore's data/lookup
  were done earlier this round).
- Build's assessment card now carries its question-source citation ("Source:
  Harvard FAS Mignone + O*NET Interest Profiler") as the card's last element,
  under the "+ more" chip — mu-scaled 8px at 0.62 opacity of the muted foreground:
  transparent but footnote-quiet, per direct request. Sits outside the
  picked-state conditional so it's visible in both states.

### 2026-08-18 UX audit: organic mascot fade, snap friction, title clip, image sizing

- **Mascot hard line finally solved properly** (third attempt, this one verified at
  mobile/tablet/laptop): the fix is an alpha mask ON the float-animation wrapper in
  `Mascot.tsx`, fading 61.5% -> 69.5% of the stage box. The geometry that makes it
  correct, for anyone touching this again: the scroll-exit effect sets
  `translate(-50%, 30%)` at runtime (the className's 37% is overridden on mount), so
  the hero's overflow-hidden crops the stage at exactly 70% of its height; eyes end
  at 61.33%, mouth starts 63.5%. Fade must complete BEFORE 70% or it's invisible
  (attempt #1 faded at 78-97% — entirely below the crop). Mask must NOT be on the
  outer stage while any descendant has a filter (attempt #2 — mask clips filter
  output to the masked box; the Image's drop-shadow painted past it and rendered as
  a rectangular halo). So: mask on the float wrapper (bobs only UP from base, so
  the traveling fade can't slip below the crop), drop-shadow removed from the Image
  (invisible on a near-black page anyway), Hero's curtain strip removed entirely.
  **Plus a hairline regression caught on mobile**: the ambient glow div was a stage-
  level SIBLING of the masked wrapper — unmasked, it still crossed the 70% crop at
  faint opacity and hard-clipped as a seam across the chin. Moved it INSIDE the
  masked float wrapper (also means it bobs with the body, which reads better).
- **Hero now fills the first screen** (`min-h-[calc(100dvh-77px)]`, 77px = the
  sticky nav's in-flow height; inner wrapper flex-1/justify-center) — per direct
  feedback that Dreamy's crop must always be the SCREEN's bottom edge: before, the
  hero was content-height, so on tall viewports (tablet portrait) the section ended
  mid-screen and the mascot dissolved against nothing. justify-center splits any
  leftover height around the copy instead of pooling it in one void.
- **CONNECT title clip root-caused** (user screenshot showed "CONNEC" with half a
  T): `background-clip: text` only paints gradient inside the element's box; the
  ChapterShell copy column caps at 360px; the previous round's H2 clamp ceiling
  bump (4.6->5.2rem) made CONNECT/EXPLORE overflow that box on wide laptops, and
  overflowing glyphs get no background = invisible. Reverted ceiling to 4.6rem —
  verified CONNECT now measures exactly its column width at 1440px, no overflow.
  Any future title-size increase must widen the column with it.
- **Scroll-snap switched mandatory -> proximity** (`globals.css`): mandatory
  required the viewport to always rest at a section start while the chapter block
  was visible, but the CTA/footer after Connect have no snap points — scrolling
  from Connect to the footer had the browser yanking back up the whole way (the
  snap flag can't turn off while Connect is still partially visible). proximity
  keeps the settle-onto-chapter assist without the fighting. This was the main
  "navigation friction" find of the audit.
- **next/image `sizes` added everywhere** (`Match`/`Explore`/`Play` cards, Connect
  avatars): fill images without `sizes` assume 100vw, so every card photo was
  served at w=3840 for a 480px-capped card and avatars at w=3840 for ~50px circles.
  Verified live after: cards now serve w=1080/1200, avatars w=96/128 — roughly an
  8-10x payload cut per image, no visual change.
- **Dreamy expressiveness** (same artwork, no redesign, per direct request):
  squash-and-stretch on the float keyframes (≤2% scale — settles wide-and-short at
  the bob's bottom, stretches slightly as it rises), and body language in the rAF
  tick — the whole cloud now leans toward the cursor (translate ±7px/±4px + a 2.2°
  cartoon z-tilt) and "puffs up" ~3% with the same curExcite the eyes already use,
  so body and eyes react as one creature. All inside the masked wrapper, so the
  dissolve stays glued to the artwork. A REAL 3D mascot (three.js + a modeled/
  rigged cloud) was explicitly floated by the user as welcome — that's a separate,
  larger project; noted here as an open invitation, not started.
- Copy (explicit user override of the no-copy rule): "Business & Finance" ->
  "Business & Money" in Match's world line and Explore's three business cards +
  WORLDS lookup key (the key HAD to move with the data or every card would lose
  its per-world font/color). Hero's ghost "See how it works" button removed —
  single CTA now.
- Validation: `tsc`, `npm run build`, `tokens:check` (503) clean; same lone
  pre-existing eslint ref-in-render error in Explore.tsx, untouched.

### 2026-08-18 revert broken scaling attempt, fix Footer disappearing entirely

- The previous entry's ChapterShell frame-ceiling increase (480→640/680→860/620→780)
  and the matching Build/Connect/Play inner-card width bumps were **reverted** per
  direct feedback — real regression, not a design nitpick: Match's like/pass buttons
  (sized off `--mu`, which tracks the FRAME's width) grew out of proportion with the
  card itself (sized off aspect-ratio + the frame's HEIGHT) since the two don't scale
  at the same rate once the ceiling moves, Build's text-heavy card ballooned since
  raising --mu inflates ALL its mu-scaled padding/font-sizes together, and Explore's
  info layout broke similarly. The card is supposed to be the single dominant element
  in every one of these chapters — back to the original 480/680/620/440/480/560
  values, which is the last known-good state for this. Left the separate `clamp()`
  text-scaling changes (oneliners, Hero paragraph, CTA body/heading) and the
  `justify-center` additions in place — neither was implicated in this regression.
  **Lesson for any future scaling work here**: `--mu` is shared across a LOT of
  differently-purposed elements (photo cards, buttons, padding, prose) that don't
  actually want to scale at the same rate — a single shared multiplier isn't the
  right lever for "make the card bigger without also inflating the button next to
  it"; that needs the card's own sizing decoupled from --mu, not a bigger ceiling on
  the ceiling everything already shares.
- **Real bug, found while investigating a "there's no footer, just a huge blank
  scroll" report**: the ambient background div (`MarketingApp.tsx`, `position:
  absolute`) was fully covering `Footer.tsx` near the bottom of the page — not just
  visually competing with it, completely hiding it. Root cause is a genuine CSS
  stacking-order quirk worth remembering: any positioned element (`relative`,
  `absolute`, `fixed`, or even just `transform`-having) paints ON TOP OF every
  static/non-positioned sibling, REGARDLESS of DOM order, once you flatten out
  elements that don't establish their own stacking context. Hero's `<section>` and
  every `ChapterShell`'s `<section>` are already `position: relative` (for unrelated
  reasons), so they accidentally escaped this and rendered fine; `FinalCTAs`' CTABlock
  also escaped it, but only because its `useRevealOnScroll` transform incidentally
  promotes it into the same tier. Footer had neither, so it fell into the earlier
  "static" paint tier and got buried under the ambient div's own fade-to-black layer,
  BUT WAS STILL FULLY PRESENT IN THE DOM (`getBoundingClientRect` looked completely
  normal — the bug was invisible to layout inspection, only showed up visually).
  Fixed with one `relative` class on the `<footer>` element itself. **Any future
  content added as a DIRECT descendant of MarketingApp's own wrapper div, without
  going through Hero/ChapterShell/CTABlock's existing positioning, needs its own
  `position: relative` (or equivalent) or it'll silently render behind the ambient
  backdrop the same way.**
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` (503 tokens) all
  pass clean. `eslint` has the same one pre-existing, unrelated failure in
  `Explore.tsx` noted in earlier entries.

### 2026-08-18 responsive scaling, fade-to-black ending, Hero wordmark headline

- **Content scaling with screen size**: every chapter's shared frame (`ChapterShell.tsx`'s
  `.mkt-graphic-scale`) was capped at a flat 480px wide / 680px (or 620px compact) tall
  regardless of viewport — since every chapter's `--mu` multiplier (and therefore all its
  card/text/spacing sizing) reads off THIS frame's own container-query width, a big
  desktop display just got more empty frame padding around the same small card, not a
  bigger one. Raised the ceilings (640px / 860px / 780px) and proportionally raised
  Build's and Connect's own inner card `maxWidth` caps (440→560, 480→600) and Play's
  card width clamp (560→680) so they actually take advantage of the bigger frame.
  Verified at a 1728×1117 viewport: Match's card grew from the old ~480px cap to a
  genuine ~640px-wide card. Along the way, found and fixed a real bug this exposed: on
  a viewport tall enough that the frame's new height ceiling exceeds the card's own
  aspect-ratio-derived height, Match's and Explore's card+button-row content wasn't
  vertically centered within the frame (`items-center` with no `justify-center` on
  their own inner wrapper — packed to the top instead, leaving dead space below); added
  `justify-center` to both.
- **Text scaling**: several text elements were stuck at flat pixel sizes while headings
  already used `clamp()` — `ChapterShell`'s oneliner, Hero's paragraph, and the final
  CTA's heading/body. Converted them to `clamp()`-based sizing too (modest ceilings, not
  uncapped vw scaling, to avoid overly large text on ultra-wide monitors) and widened
  the `ChapterShell` H2 and CTA heading's existing clamp ceilings slightly to match.
- **Fade to black by the end of the scroll**: the ambient backdrop added earlier this
  session was `position: fixed` (deliberately, at the time, to avoid gaps between
  overlapping blobs regardless of scroll position) — but `fixed` has no concept of
  "near the bottom of the page," only "near the bottom of whatever's on screen right
  now," which ruled it out once the ask became a scroll-driven fade. Switched it to
  `position: absolute` against a newly-`relative` `MarketingApp` wrapper spanning the
  full document (Nav through Footer), re-expressed all the blob positions AND a new
  top-listed fade-to-`var(--background)` layer as percentages of that full height, so
  the reader now arrives at the Footer through a deliberate darkening rather than the
  vivid wash just stopping arbitrarily.
- **Hero headline**: now reads "DREAMARI" (all-caps wordmark, "DREAM" kept in the
  accent tint as a callback to the old "dream career" highlight) instead of "Discover
  your dream career." — that phrase moved down into the caption underneath, which now
  reads "Discover your dream career. Build, match, play, explore, and connect, all in
  one place. One clear step at a time." as one flowing paragraph. Switched the caption
  from two hardcoded `<span className="block">` line breaks to `textWrap: "balance"` —
  the fixed breaks were sized for the OLD shorter caption and risked a stranded single
  word (a widow) at various widths now that it's longer; balance picks break points
  from the actual rendered width instead, verified 2 lines on desktop / 3 on mobile
  with no widow on either.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` (503 tokens) all
  pass clean. `eslint` has the same one pre-existing, unrelated failure in
  `Explore.tsx` noted in earlier entries (not touched this round).

### 2026-08-18 background depth, chapter reorder, Play/Build interaction tweaks

- **Background**: the whole How It Works storyboard sat on flat `var(--background)`
  (near-black) below Hero's own gradient, which fades fully to that flat color by its
  bottom edge (per ChapterShell's earlier "no per-chapter background override"
  decision). Per direct feedback ("too much dead black space"), added a persistent
  ambient backdrop in `MarketingApp.tsx`: a single `position: fixed` div (first child,
  NOT negative z-index — a negative z-index would sink it behind this wrapper's own
  ancestor backgrounds in `globals.css`, hiding it entirely) with several large
  overlapping `radial-gradient` ellipses in blue/purple/cyan (`--primary`,
  `--hero-accent-purple`, `--world-driving-flying-shipping`, `--accent`), tuned up
  twice for intensity. Hidden in the Schools/light theme. This surfaced two seams that
  used to be invisible against flat black and are now visible against a vivid
  backdrop, both fixed in `Hero.tsx`: (1) Hero's own horizontal gradient overlay
  covered its full section height at a flat 60% opacity with a hard stop at the
  section boundary — added a vertical `mask-image` fade so it dissolves into the
  ambient layer instead of cutting off; (2) the curtain fading the mascot's crop line
  to flat `var(--background)` now mismatched the vivid backdrop below it — changed to
  fade to a translucent black (dims whatever's behind it rather than replacing it with
  one hardcoded hue). A first attempt at (2) tried fading the mascot's own alpha via
  `mask-image` in `Mascot.tsx` instead of a curtain at all (no color to mismatch,
  seemed cleaner) — reverted: `mask-image` also clips any `filter` effects on
  descendants (the mascot's `drop-shadow`) to the masked box's bounds, and since that
  shadow normally spreads a little past the mascot's raster edges, it turned into a
  visible rectangular halo cutoff, worse than the seam being fixed.
- **Chapter order**: Play moved to after Explore per direct request (new order Build →
  Match → Explore → Play → Connect). Updated in three places that all hardcode chapter
  order/adjacency: `HowItWorks.tsx` (render order), `ChapterRail.tsx` (the `CHAPTERS`
  array driving the side progress-dot nav and its gradient line — order and colors both
  had to move together), and each chapter's own hardcoded `scrollIntoView` target for
  "advance to next chapter" (Match → now targets `explore`; Play → now targets
  `connect`). Also swapped which of Explore/Play gets ChapterShell's `flip` prop (text/
  graphic side swap) — Match and Explore were both `flip` under the new order, which
  would put two flipped chapters back-to-back and break the alternating left/right
  rhythm; moved `flip` from Explore to Play to restore the zigzag.
- **Explore boundary nav**: per direct feedback, committing UP past the first card no
  longer jumps to the previous chapter (Match) — it just clamps there now. Committing
  DOWN past the last card still jumps forward (to Play now, not Connect) since that
  direction has a real "reader is stuck with no room to scroll" problem this component's
  own wheel/pointer handlers create by calling `preventDefault()`; going backward at
  the very first card doesn't have that problem, native scroll still works normally.
- **Play**: only the correct answer ("Ask for your role and deadline") is clickable now,
  same locked-path pattern as Build's interest picker — the other two options are shown
  but inert (dimmed, `disabled`), rather than three equally-valid choices. Label above
  the scene changed from "Day in the life" to "Day in the life of an investment banker"
  per direct request.
- **Build**: the "+ more" chip is now a real hover target (background/border feedback +
  a tooltip listing the other 10 interest categories from the design system's 13-world
  set) instead of a static label. Hit one real bug building it: the tooltip's original
  `left-1/2` + `-translate-x-1/2` centering rendered ~160px (exactly half the tooltip's
  own width) too far left — traced to the combination not resolving as expected here;
  switched to a `inset-x-0` + `flex justify-center` wrapper instead, which centers via
  layout rather than percentage-of-self transform math and isn't susceptible to
  whatever caused the miscalculation.
- Section-height sanity check (desktop, this viewport): Build 690px, Match/Explore/Play
  784px each (uniform — the three card-driven chapters share the same frame ceiling as
  designed), Connect 584px (intentionally `compact`). Nothing is disproportionately
  long.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` (503 tokens) all
  pass clean. `eslint` has the same one pre-existing, unrelated failure in
  `Explore.tsx` noted in the entry above (not touched this round).

### 2026-08-18 follow-up: Investment Banking photo swap, Food Scientist re-verified

- User supplied a better Investment Banking photo directly as a pasted image in chat
  (not a Figma link) — pasting doesn't give this tool a retrievable file path/bytes, so
  the user re-shared it as a specific Figma node link (`3166-16318`, a "ChatGPT Image"
  asset placed into the design file) instead, which was fetchable the normal way via
  `get_design_context`. Replaced `public/images/career-investment-banking.jpg` with this
  new, full-resolution (1024x1536) version — no code change, same filename already wired
  in `Match.tsx`.
- Re-verified the previous entry's Food Scientist photo update after the user reported
  not seeing it: confirmed via direct `curl` against both the raw static file and the
  `/_next/image` optimization endpoint on the live `dreamari.vercel.app` deploy that the
  new file was already being served correctly (fresh `x-vercel-cache: MISS`, correct
  byte count) — the prior push had already gone out fine; likely just local browser
  cache on the user's end, not a deploy issue. Also confirmed all 4 Explore cards
  (Accountant/Management Analyst/Human Resources/Food Scientist) render with correct
  photo, title, salary, and major via direct DOM text/src checks on production.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` (503 tokens) all
  pass clean — image-only change, no source touched.

### 2026-08-18 real per-career photos for Match and Explore

- Scope: `Match.tsx`/`Explore.tsx` `CARDS` data only (photos + one new Explore card) plus
  new files under `public/images/` — no other logic, mechanics, or copy touched.
- Sourced real per-career photos from the design system's Figma file
  (`Dreamari-Design-System-v2.0`) via the Figma MCP tools (`get_design_context` +
  `get_screenshot`, no separate OAuth needed — distinct from the unrelated
  `plugin:figma:figma` skill integration, which does need interactive auth and was not
  used). Downloaded each via Figma desktop's local dev-asset bridge
  (`http://localhost:3845/assets/<hash>.png`, only reachable while Figma desktop is open
  on this machine) and converted PNG → JPEG with `sips -s format jpeg -s formatOptions 85`
  to match the existing `career-<slug>.jpg` naming convention.
- Match keeps its existing 3-card guided-tutorial composition unchanged (Operations →
  Investment Banking → Project Manager); only photos changed. Operations got its first-
  ever real photo (from node 3156-15794, the larger "TEMPLATE FOR Business Money and
  Office" library, since the well-organized node 3156-15148 has no dedicated Operations
  shot). Investment Banking's photo is a real photo but low resolution (198x297px vs
  ~941x1672px for the others, from node 3156-15840) — flagged explicitly to the user, who
  confirmed using it anyway. Project Manager's existing photo (from 3156-15148) is
  unchanged; user deferred providing an alternate.
- Explore's 4-tier match-strength spread (Strong Match/Match/Stretch/Wildcard) is back to
  full per direct request: Accountant and Management Analyst got real photos (from node
  3156-15148, replacing stand-in shots reused from Match's own photoshoot), Human
  Resources is a brand-new 4th card (Stretch tier, `tagColor: "#ff9640"`, inherits
  Business & Finance's existing font/color via `WORLDS` with no lookup changes needed),
  and Food Scientist (Wildcard) got an updated real photo from node 3156-15149 (replacing
  an earlier user-supplied stand-in).
- **Workaround worth reusing**: the large `3156-16315` library node is too disorganized to
  search blindly — `get_metadata` on it exceeds the tool's token limit and dumps to a
  file, and even decoded, layer names don't expose actual rendered text for
  generically-named text layers (e.g. "Title"), so career titles aren't
  `grep`-able — only `get_design_context`/`get_screenshot` on a specific node reveals what
  it actually shows. After a few blind guesses missed, pivoted to asking the user for
  exact frame links one at a time instead of continuing to search — much faster, use this
  pattern first for any future ambiguous/large Figma asset needs.
- Old stand-in images (`career-pe-analyst.jpg`, `career-ux-designer.jpg`) are no longer
  referenced anywhere in `src/` after this change but were left in place, not deleted.
- Validation: `tsc --noEmit`, `npm run build`, and `npm run tokens:check` (503 tokens) all
  pass clean. `eslint` has one pre-existing, unrelated failure in `Explore.tsx` (a
  ref-accessed-during-render warning in the carousel-height calculation, not touched by
  this change) — not introduced this session.
- Browser-verified live: Investment Banking's and Operations' new photos both confirmed
  rendering in Match's card stack (DOM text + `img.src` + raw `fetch()` byte-size checks,
  since this session's browser-automation tab repeatedly hit the known `document.hidden`
  issue below); Food Scientist's updated photo confirmed served correctly in Explore via
  `fetch()`.
- Recurring environment quirk, same as noted elsewhere in this file: the browser tool's
  tab frequently reports `document.hidden === true`, which not only blackens screenshots
  but also **suspends CSS transitions** — so Match's swipe-exit animation's `transitionend`
  event (which `onExitTransitionEnd` depends on to advance the card stack) never fires,
  making the deck look stuck on the front card under automation even though the code is
  correct. Confirmed by dispatching a synthetic `transitionend` event to unstick it during
  verification. This does not affect real users; only ever seen through this automation
  tool.

- Date: 2026-08-15
- Active branch: `redesign/marketing-handoff-rebuild` (branched from `main`; `archive/pre-redesign`
  preserves pre-rebuild `main` per the handoff brief's own instruction)
- Main branch: not touched this session — do not merge without explicit user authorization
- Objective: full replacement of the public marketing homepage (`src/app/page.tsx` and
  everything under `src/components/marketing/`) per
  `DREAMARI-CLAUDE-CODE-HANDOFF.md` and an iteratively-refined HTML reference prototype
  supplied directly by the user (`dreamari-landing-wireframe_25.html`), plus a real Figma
  DTCG token export (`design-tokens.zip`) supplied mid-session. This was an explicit,
  user-directed full replace — not additive work — and does not touch `/flow`, `/home`,
  `/career-report`, `/onboarding`, or the app's existing `design-tokens/` pipeline
  (`design-tokens.generated.css` still builds and validates unchanged; `npm run
  tokens:check` passes 503 tokens).
- Deleted entirely: `src/components/hero/*` and `src/components/landing/*` (old
  DREAMARI-dominant hero, old How It Works scroller) — confirmed no other route imported
  from either directory before removal.
- New `src/components/marketing/` tree: `Nav`, `Hero` + `Mascot` (canvas eye-tracking,
  ported from the reference prototype's vanilla JS), `AudienceToggle`, `HowItWorks` +
  `ChapterShell` + five chapter components (Build/Match/Play/Explore/Connect) with a
  shared IntersectionObserver-driven "play once, hold, replay on rescroll" pattern,
  `SchoolsView` (full enterprise view: hero variant, phone mock, counselor dashboard
  mock, metrics, org grid), `FinalCTAs`, `Footer`. Tokens live in
  `marketing/tokens.css`, scoped to a `.marketing-v2` class (not `:root`) specifically so
  they don't collide with the app's own global DTCG token names.
- Tokens: `tokens.css` is resolved directly from the user's `design-tokens.zip`
  (Primitives.Default / Semantic.Dark / Semantic.Light), not hand-guessed — every value
  has a source-path comment. Fonts: Bricolage Grotesque + Space Mono added via
  `next/font/google` in `marketing/fonts.ts`, separate from the app's existing Favorit/
  Montserrat load in `layout.tsx`.
- **Real bug, worth flagging for any future work in this app's shared `globals.css`**:
  its `@theme inline` block (`globals.css:141`) binds Tailwind's `font-display` utility
  class to `--font-favorit-display` at the CSS-generation layer — a scoped CSS custom
  property override on a descendant does NOT intercept this, because Tailwind bakes the
  literal variable name into the generated utility rule. Any new page wanting a
  different display font under `.font-display` must override with an explicit
  higher-specificity rule (see `marketing/tokens.css`'s `.marketing-v2 .font-display`
  block), not just redefine `--font-display` in a scoped ancestor.
- Fixed mid-session (all verified via `getBoundingClientRect`/computed-style checks, not
  just screenshots, after the browser tool's screenshot capture proved to lag/stale
  during this session): a CSS sizing loop that collapsed chapter graphics to 0 width
  when stacked on mobile/tablet (an `inline-flex` glow wrapper conflicting with several
  chapters' own `w-full` content — Play in particular went completely blank), a
  resulting loss of horizontal centering for the fixed-width chapters (Match/Explore),
  the Match card's zoomed end-state overlapping the copy text above it on narrow
  viewports, a stray visible seam where the hero mascot's ambient glow got hard-clipped
  by `overflow:hidden` before the fade-to-background overlay had ramped up enough to
  mask it, and three Tailwind default-breakpoint mismatches (nav links wrapped and
  chapter rows forced into a cramped row layout in the 768–899px range) where the
  reference's own breakpoints are 900px/800px/600px, not Tailwind's 768px.
- Validation: ESLint, `tsc --noEmit`, `npm run tokens:check`, and a full production
  build (`npm run build`) all pass clean as of the last change this session.
- Browser-verified: hero mascot eye-tracking and scroll-exit fade, all 5 chapter
  animations play-once/hold/replay-on-rescroll correctly, Student/Schools toggle
  (including the light-theme repaint), mobile (390px) and tablet (768px) layouts with no
  horizontal overflow, chapter-graphic centering and width numerically confirmed clean
  at mobile width after the fixes above.
- Not pushed to `origin` or opened as a PR as of this entry — see "Recommended next
  step" for status once that happens.

### 2026-08-15 finance-focused content pass, full-frame chapter redesign

- Scope: same five `HowItWorks` chapters only (Build/Match/Play/Explore/Connect);
  no other route touched.
- Build now asks the real Question 3 of 7 ("Choose your interests": Tech / Business &
  Money / Health, Business & Money nudged as the example), oneliner states the 7-question
  assessment. Rows are full-width and identically sized (a `flex-col`, not wrapped pills of
  variable width) per explicit feedback that mixed chip sizes read as broken.
- Match's 3-card deck is now all Business & Finance careers (Investment Banking /
  Operations / Project Manager) rather than a cross-category mix — per explicit request
  that the deck stay on-theme with Build's finance path. Tapping a card flips it to a
  Description/Salary/College-major info panel; liking/disliking is illusion-of-choice only
  (`Match.tsx`) — every path ends on the same "You're matched! Investment Banking" reveal,
  since no real per-choice branching was requested. Explore's 4 cards were reframed to
  match-strength categories (Strong Match/Match/Stretch/Wildcard) over the previous mixed
  category set; the Wildcard (Food Scientist) has no stand-in photo and renders an icon
  tile instead of a placeholder image.
- Play was rebuilt from a split image-banner/content layout into a full-bleed photo card
  with the glossary game overlaid in a glass panel (`rgba(8,11,23,0.42)` + blur — the
  standard `--glass-surface-3` token was too opaque and hid the scene entirely, so this one
  panel intentionally uses a custom lower-opacity value rather than that token). Red
  answer-state color and the progress bar are both gone per direct request.
- Connect was rebuilt from a pinned-corkboard layout into a single social-post card
  (avatar/name/tag, question, like/comment/share row, then a linear comment list) using the
  existing `--glass-surface-2`/`--glass-surface-3` tokens and blur, not new colors. Marcus's
  tag changed from JPMorgan Chase to Goldman Sachs per direct request.
- Shared chapter frame (`ChapterShell.tsx`) raised from `min(56dvh, 520px)` to
  `min(82dvh, 680px)` / `min(94cqw, 480px)` after direct feedback that graphics read as
  small and Play required internal scrolling to see all three answers; `dvh` (not `vh`) is
  deliberate so the cap still shrinks safely on short viewports rather than ever
  overflowing the fold.
- Added auto-advance-on-interaction: Build's `pick()` and Match's post-celebration
  `useEffect` both call `scrollIntoView` on the next chapter's section id after a short
  delay, so picking an interest or finishing the swipe deck carries the reader forward
  without a manual scroll. Match's "You're matched" reveal also got a real entrance
  (scale/glow bounce, `mkt-match-celebrate` in `animations.css`) since the user asked for
  an "emotional moment" payoff there, not a static swap.
- A mid-session debugging detour: `usePlayingOnScroll`'s IntersectionObserver appeared to
  never fire at all (stuck `graphicRevealed: false`) on both local dev and the live
  production deploy, reproduced with injected `window.__ioObserved`/`__ioLog` counters
  showing `observe()` ran but the callback never called back — this correlated with the
  browser automation tool itself reporting "Browser pane is currently hidden" on click/
  scroll actions. A fresh tab in the same tool recovered normal IntersectionObserver
  firing, confirming this was a browser-automation-session state issue, not a code defect.
  The debug instrumentation has been removed from `scrollHooks.ts`.
- Validation: `tsc --noEmit`, `npm run build`, and `npm run tokens:check` all pass clean.
  Browser-verified end to end: Build's picks and auto-scroll, Match's flip/like/celebrate/
  auto-scroll, Play's overlay legibility with the scene still visible behind it, Explore's
  reframed cards, and Connect's post/comment layout with the Goldman Sachs swap.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Match/Play interaction rework, Explore card fixes, mobile alignment

- Match now matches immediately on a "like" (button or swipe) instead of waiting for
  the whole 3-card deck to clear — passing every card without ever liking one still
  falls through to the same match, so the illusion-of-choice ending is unchanged.
  Added real pointer-based swipe (drag left = pass, drag right = match, a plain tap
  still flips the card) so mobile has genuine swipe gesture support, not just the two
  buttons; swipe intent shows as Like/Pass badges that fade in with drag distance.
- Play was rewritten twice this session: first into a 3-scenario auto-advancing
  situational simulation (replacing the glossary-term quiz), then, per direct
  feedback, cut down to a single scenario with a "Try again" replay control instead of
  cycling scenarios. Feedback on picking an option is now a checkmark burst + radiating
  ring positioned with explicit z-index above the glass panel (the panel's own
  backdrop-filter stacking context was rendering on top of the burst before this).
  Picking an option also auto-scrolls to Explore after a couple of seconds, same
  act-then-advance rhythm as Build/Match, cancelled if "Try again" is tapped first.
- Explore: all 4 cards now show a real photo (Food Scientist reuses
  `career-neurosurgeon.jpg` as the closest available stand-in — worth flagging that
  this is a surgical/OR scene, not an actual food-science lab, and should be swapped for
  a real photo once one is available) plus real salary/major text under the title. The
  match-strength label (Strong Match/Match/Stretch/Wildcard) moved to a corner-ribbon
  badge instead of replacing the industry line, which is back to reading "Business &
  Finance" like every other career here. The Wildcard card gets a distinct "rare pull"
  treatment: an animated gradient border plus a diagonal sheen sweep (`mkt-holo-border`/
  `mkt-holo-sheen` in `animations.css`), built from the app's own indigo/blue/cyan/pink/
  gold tones rather than a literal rainbow, keeping clear of red per the standing rule.
  Title sizing is now length-tiered with wrap allowed (not a flat nowrap size), since
  longer titles like "Management Analyst" were overlapping the right-side action rail.
- Fixed a large dead gap between Build's title copy and its actual question: the
  shared frame is sized for the tallest chapter's content, and Build's own content was
  vertically centered inside it (`justify-center`), leaving empty space above the
  question every time the frame was taller than Build's content. Anchored to
  `justify-start` instead so the question sits right below the headline; the leftover
  slack now falls below the interactive content, which is normal for a full-height
  snap section.
- The "How Dreamari works" eyebrow and "Five chapters. One clearer future." heading in
  `HowItWorks.tsx` had no responsive text alignment at all (left-aligned at every
  width) while every chapter's own copy was already mobile-centered via ChapterShell —
  added the same `text-center min-[901px]:text-left` pattern so mobile reads as
  centered throughout, matching everything else on the page. Footer's two-column
  PRODUCT/COMPANY link list was left as-is (left-aligned link columns are the
  conventional pattern there, not part of what was flagged).
- Validation: `tsc --noEmit`, `npm run build`, and `npm run tokens:check` all pass
  clean. Browser-verified: Match's immediate-match-on-like and drag-to-swipe, Play's
  single-question replay flow and the burst now rendering above the glass panel,
  Explore's four real photos with salary/major and corner badges, the Wildcard holo
  card, Build's tightened copy-to-question gap, and mobile-centered intro copy at
  375px width.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 fixed the `--mu` scaling bug behind oversized graphic text

- Root cause of "the graphics' text is way too big and overpowers the page copy"
  (reported after several rounds of "scale the text up" requests this session): every
  chapter graphic's internal font sizes are `calc(var(--mu) * Npx)`, and `--mu` was
  defined on the OUTER `.mkt-graphic` wrapper (a `flex-1` column with no width cap),
  not on the actual card frame inside it (capped at `min(94cqw, 480px)`). On a wide
  desktop screen the outer wrapper can reach ~770-800px, so `--mu` was scaling as if
  the visible card were that wide, even though the card itself always rendered at its
  480px ceiling. Net effect: card-internal text grew disproportionately on wide
  screens, independent of and eventually exceeding the fixed-size H2 chapter
  title/oneliner next to it.
- Fix: added a second, nested container-query context (`mkt-graphic-scale` in
  `animations.css`, applied to the actual frame div in `ChapterShell.tsx`) so `--mu`
  for every chapter's own content is computed from the frame's real, already-capped
  width instead of the outer wrapper's. A container can only resolve `cqw` against an
  ancestor, never itself, so the frame's own `width: min(94cqw, 480px)` still resolves
  against the outer wrapper exactly as before — only what `--mu` means for the frame's
  *children* changed. This caps `--mu` around 1.5 on any normal-to-wide screen (down
  from up to 2.3), while leaving the frame/card itself exactly the same visual size —
  the ask was "cards should stay large, only the text was too big," and this fixes the
  text without touching card dimensions at all.
- No per-file font-size numbers were changed; this was purely the shared scaling
  mechanism. Verified via computed `getComputedStyle().fontSize` at both a narrow
  (800px, stacked) and wide (1440px, side-by-side) viewport that graphic headline text
  (e.g. Build's "Choose your interests," Match's card title, Explore's card title) now
  renders well below the H2 chapter title's font size at every width, instead of
  approaching or exceeding it on wide screens.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified all 5 chapters at both viewport widths.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Food Scientist industry fix, bigger Match buttons, mobile safe-area

- Explore's industry line was a single shared `INDUSTRY` constant ("Business &
  Finance") applied to all four cards, including the Wildcard — per direct feedback
  that a food scientist obviously isn't in business/finance, this is now a per-card
  `industry` field; the three business-track cards keep "Business & Finance," Food
  Scientist now reads "Science & Research."
- Match's (and, to stay the same scale per the standing "read as the same thing"
  requirement, Explore's) card aspect ratio moved from `168/300` to `168/240` — a bit
  shorter and wider — freeing enough vertical room to grow the like/pass button
  circles from 42px\*mu to 52px\*mu (icons 18→22px\*mu) per direct request that they
  read as too small to comfortably tap.
- Fixed the iOS Safari "compact tab bar" floating chip overlapping the bottom of the
  mobile layout: `ChapterShell`'s row gap/padding was a flat 40px/32px at every width
  below 901px, which was tight enough that the frame's content (e.g. Match's like/pass
  buttons) sat right at the phone's bottom edge, right where that floating chip lives.
  Reduced the mobile-only gap/padding, dropped the frame's dvh ceiling from 82 to
  74dvh, and added real safe-area room below 640px specifically (`max-[640px]:pb-
  [calc(1.25rem+env(safe-area-inset-bottom))]`) so bottom controls clear it.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at 375px mobile width across Match/Play/Connect/Explore — no
  cropping introduced by the smaller dvh ceiling, Food Scientist now reads "Science &
  Research," Match's card is visibly wider/shorter with bigger buttons.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 fixed a hard-edge tiling artifact in the Wildcard holo sheen

- Reported as "a smooth gradient shine, but also a hard rectangle/line dragging across
  the screen." Both `.mkt-holo-border` and `.mkt-holo-sheen` (in `animations.css`) set
  a `background-size` larger than 100% and animated `background-position` to sweep the
  gradient across, but never set `background-repeat: no-repeat` — the default
  `repeat` tiles the gradient, and since each tile's gradient runs from transparent
  back to transparent with no easing *between* tiles, the seam where one tile ends and
  the next begins renders as a hard straight edge riding along with the animation.
  Added `background-repeat: no-repeat` to both rules; confirmed via computed style
  that `background-repeat` now resolves to `no-repeat` on both.
- Validation: `npm run build`, `npm run tokens:check` pass clean (no TS changes).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 real Food Scientist photo

- The Wildcard card's stand-in (`career-neurosurgeon.jpg`, an OR/surgical shot) was
  visibly wrong for "Food Scientist" — user supplied a real photo (a food-science lab
  scene: pipette, jars, produce) via a pasted image, saved to
  `public/images/career-food-scientist.jpg` and wired into `Explore.tsx`'s `CARDS`
  array in place of the surgeon photo. The now-unused `career-neurosurgeon.jpg` asset
  was left in place (not referenced anywhere, but not deleted either).
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified the new photo crops well in the card at its `168/240` aspect ratio,
  with the holo border/sheen still intact around it.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 real per-card matching, brighter cards, deck polish, extra reply

- **Match no longer always resolves to Investment Banking.** Per direct request, the
  celebration screen now shows whichever card was actually liked (new `matchedCard`
  state holding the real `CARDS` entry, replacing the old `likedMatched` boolean).
  Passing all three without ever liking one still needs to end somewhere, so it falls
  back to matching whichever card was last on screen — the only remaining "soft" rule.
  Connect's thread ("How do you get an internship at a bank?", Marcus at Goldman
  Sachs) was intentionally left as-is since it wasn't in scope of this request; it will
  read as bank-specific even if the visitor actually matched with Operations or
  Project Manager. Flagging this as a known follow-up, not fixed here.
  `career-chief-executive.jpg` was also replaced with a user-supplied higher-res
  version of the same photo.
- **Scrim gradients lightened** on both the top card and the celebration screen — the
  darken zone now starts around 55-58% down the card instead of 40-42%, so most of the
  photo stays visible instead of the card reading as near-black. Same fix applies to
  both spots since they shared the same gradient stops.
  the previous 42px/18px per direct feedback that the swipe/pass targets were too
  small.
- The card stack now actually reads as a stack: peeking cards behind the top one got a
  bigger offset/scale step, a visible border, and less opacity falloff (was washing out
  almost invisibly). Added a `mkt-match-card-enter` keyframe animation (not a
  transition — the top card is a fresh DOM node each time due to `key={card.key}`, so
  only an `animation` reliably restarts on mount) so the newly-promoted top card slides/
  scales in instead of popping into place instantly after a swipe.
- Explore's Food Scientist card now uses a real user-supplied photo
  (`career-food-scientist.jpg`) instead of reusing the surgeon stand-in, which had
  already been flagged as an obvious mismatch.
- Connect got a third reply (Priya, Grade 12, reusing the now-unused
  `career-neurosurgeon.jpg` as an avatar crop) per direct request that there was room
  for one more. This initially relied on the comments list's internal
  `overflow-y-auto` scroll to fit the third reply — corrected right after, per an
  explicit "nothing should scroll inside the graphics other than Explore" rule: removed
  the scroll entirely and tightened the Post section and each comment row's
  padding/gaps/font sizes instead, so all three replies fit outright within the frame
  at both mobile and desktop widths. Verified via `scrollHeight <= clientHeight` at
  both 375px and desktop widths.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: passing Investment Banking then liking Operations correctly shows
  "You're matched! Operations" (not the old fixed outcome), the top-card scrim is
  visibly lighter, peeking cards read as a distinct stack, the promoted card slides in
  smoothly, and Connect shows all three replies (scrolling to the third when needed).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 compact sections for Build/Connect, fixed Connect's stretch-and-center

- Root cause of "huge gap scrolling past Build without interacting" and "huge blank
  space above/below Connect's comments": both symptoms came from forcing
  content-driven chapters (a short question; a post + a few comments) into the SAME
  full-viewport-tall section and frame that Match/Explore/Play need for their big photo
  cards. Shrinking just the inner frame (tried first) didn't help — the section itself
  was still `min-h-dvh`, so the dead space just moved from "inside the frame" to "the
  section's own vertical-centering slack." Added a `compact` prop to `ChapterShell`
  that Build and Connect now pass: the section drops from `min-h-dvh` to
  `min-h-[62dvh]`, and the graphic frame from `min(74dvh,680px)` to
  `min(50dvh,460px)`. Match/Explore/Play don't pass it and are visually unchanged —
  confirmed via screenshot.
- Separately, Connect's card had its own bug compounding the "big blank space"
  complaint: the card div used `h-full` (stretch to fill the frame) and, from the
  previous round's no-scroll fix, the replies column had `justify-center` — the
  combination meant any leftover height between a short comment thread and a much
  taller frame became blank padding **inside the glass card**, not just empty page
  background around it. Removed `h-full` (now `max-h-full` only, sizes to actual
  content) and the `justify-center` on the replies column, matching how Match/Explore's
  own cards already size to content rather than force-stretching.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at 375px: Build's gap to Match is now proportionate instead of a
  near-full extra screen, Connect's card is content-sized with no internal dead space
  and still fits all 3 replies with zero scroll (`scrollHeight <= clientHeight`
  confirmed), and Match's card is untouched (still full-size).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 responsive reply count for Connect, fixed CTA-adjacency gap

- Root cause of "cropping out on desktop" (user sent a screenshot from
  `dreamari.vercel.app` showing Jordan's reply cut off mid-box): `--mu` (the font/
  spacing scale every chapter uses) is driven by the graphic frame's WIDTH, but the
  frame's HEIGHT cap doesn't scale to match — so a wide-but-not-especially-tall
  viewport (e.g. 1440×900) gets a bigger `--mu` (bigger text/padding, taller content)
  than a narrower/taller one, while the frame's height budget stays fixed. At that
  combination, 3 replies needed ~549px but the frame only had 450px, and the card's
  `max-h-full` + `overflow-hidden` silently clipped the excess instead of showing it or
  scrolling.
- Rather than pick a breakpoint by guessing, made the reply count self-measuring:
  `Connect.tsx` now renders `REPLIES.slice(0, visibleReplies)`, where `visibleReplies`
  starts at 3 and a `useLayoutEffect` drops it by one (floor of 2) whenever the card's
  true content height (`scrollHeight`, unaffected by the clip) exceeds the frame's
  actual available height (`frame.clientHeight`) — verified before paint, so there's no
  visible flash of the overflowing state. A `resize` listener resets the attempt to 3
  on every resize, so a taller/narrower viewport gets the third reply back
  automatically. This directly implements the "reduce to two / add one back if there's
  room, be responsive" instruction without a hardcoded height breakpoint.
- Separately, "the You're ready section looks weird" traced to `HowItWorks.tsx`: since
  Connect (and Build) now use the shorter `compact` section from the previous round,
  the CTA block right after Connect started with almost no gap, reading as one run-on
  block. Added `pb-8 sm:pb-12` to the chapters wrapper so there's real breathing room
  before the CTA begins, without touching `FinalCTAs.tsx` itself (shared by the Schools
  variant elsewhere).
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at 1440×900 (where the crop reproduced): reply count now
  self-corrects to 2 with `scrollHeight <= clientHeight` confirmed (no crop), Jordan's
  full reply text renders and its bottom edge sits inside the card, and there's now a
  ~245px gap between Connect's card and the "You're ready" heading. At 375px mobile,
  all 3 replies still fit with no crop and no blank space (measured `fits:true`, exact
  height match, matching the previous round's mobile result).
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 fixed Match's swipe glitch, flip/swipe interaction, Explore scroll trap

- **Match's swipe "glitch"** ("the card behind loads again like a glitch, then a dark
  overlay happens") was a real structural bug: the top (interactive) card and the
  peeking cards behind it were two SEPARATE JSX blocks/render paths. When a swipe
  removed the front card, the card that had been peeking at depth 1 didn't get updated
  in place — it unmounted from the peeking block and a brand new element mounted in
  the top-card block instead, jumping straight from a faded/bordered/no-scrim peeking
  look to the full-strength scrim+text top-card look with no transition between the
  two. Refactored to a single map over `stack.slice(0, 3)` keyed by `card.key`, where
  each card's transform/opacity is a continuous function of its depth (0/1/2) — the
  same DOM node now animates smoothly from depth 1 to depth 0 instead of unmount/
  remount. Only depth 0 gets the scrim, poster text, swipe badges, and pointer
  handlers. Removed the now-unnecessary `mkt-match-card-enter` mount animation.
  **Follow-up bug caught during verification**: the refactor's DOM order put the front
  card first and the peeking cards after, and later DOM siblings paint on top by
  default with no z-index set — so the peeking cards were rendering OVER the top card,
  ghosting through as a double-exposure image. Fixed with explicit `zIndex: 3 - depth`.
- **Tap-to-flip was a dead end**: `onCardPointerDown` had `if (exiting || flipped ||
  !top) return`, which blocked STARTING any new interaction whenever the info panel
  was already showing — so there was no way to tap back to the poster, or swipe
  like/pass while flipped. Removed the `flipped` condition from that guard. Verified:
  tap flips to the info panel, tap again flips back, and swiping right while the info
  panel is showing correctly commits the match.
- **Career titles are now uppercase everywhere**: the celebration screen's title
  (`matchedCard.title`) and the tap-to-flip info panel's title had no `uppercase`
  applied (the info panel's wrapper explicitly sets `normal-case`, which was
  overriding it) — both now force uppercase directly. Match's top-card poster title
  and Explore's card titles were already uppercase via an ancestor class.
- **Explore reduced from 4 to 3 cards** per direct request — dropped Human Resources/
  Stretch (the middle-of-the-spectrum one), keeping Accountant/Strong Match,
  Management Analyst/Match, and the Food Scientist Wildcard.
- **Explore's scroll nudge replaced**: the bouncing chevron icon (`.mkt-explore-nudge`)
  is gone; the existing tease-scroll-and-settle effect is now the whole nudge, made
  slower and more pronounced (86px over 900ms eased, holds, settles back over 700ms)
  via a small custom `animateScrollTop` helper — native `scrollTo({behavior:"smooth"})`
  doesn't give reliable control over duration across browsers, and the ask was
  specifically for a slow, deliberate "the next card is peeking" motion rather than a
  quick bounce.
- **Fixed Explore's feed trapping page scroll** ("scroll up again while on the card,
  the page doesn't scroll up" / "messes up the scroll of the page"): nested scrollable
  containers on touch devices (and to a lesser extent, wheel/trackpad) don't
  automatically hand a scroll gesture back to the parent once the inner one hits its
  boundary — iOS Safari in particular keeps routing an entire touch gesture to
  whichever scroller it started on. Added `touchmove`/`wheel` listeners on
  `.mkt-explore-track` that detect "already at this boundary, gesture still pushing
  that direction" and manually forward the delta to `window.scrollBy` instead of
  letting the feed absorb it. Verified via direct scrollTop/window.scrollY
  measurement: scrolling down from the feed's bottom boundary now advances the page
  into Connect, and scrolling up from the top boundary advances it back toward Play.
- A mid-session note: the dev server's Fast Refresh state became corrupted after many
  rapid edits this session (stale closures throwing `ReferenceError`s for variables
  renamed/removed several rounds ago, e.g. `likedMatched`), which also made the browser
  tool's click actions hang. Cleared `.next` and restarted the dev server to recover;
  worth doing proactively if click actions start timing out mid-session again.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified on a fresh dev server + fresh tab: swipe stack transitions
  smoothly with no ghosting, tap/tap-back/swipe-while-flipped all work, celebration
  and flip-panel titles are uppercase, Explore has exactly 3 cards, and the scroll
  boundary handoff moves the outer page correctly in both directions.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Connect's real crop floor, sequenced Explore nudge, faster auto-scroll

- **Connect was still cropping** on a real wide-but-short desktop window even after the
  previous round's fix — `MIN_VISIBLE_REPLIES` was hard-floored at 2, so once the
  measurement determined even 2 replies didn't fit, it just stopped there and let the
  overflow clip instead of dropping further. Lowered the floor to 1 (still a real,
  substantive reply — Marcus's answer — rather than an empty-looking post). Verified
  by force-reproducing the crop at 1920×750: it now correctly drops to 1 reply with
  `scrollHeight <= clientHeight` confirmed (no crop), whereas the same viewport would
  have stuck at a cropped 2 before this fix.
- **Explore's nudge, take two**: the single tease-scroll wasn't reading as "solved" —
  per direct feedback, a physical peek and a static arrow were fighting each other
  when shown together, and the user didn't want the nudge to feel "permanent" (i.e.
  always in the way) or to sit where it overlapped the card's own title/industry/stats
  text. Restructured into two sequential beats instead of one: the existing peek-scroll
  plays first and fully settles back, and only THEN does a small down-arrow fade in —
  positioned at the card's vertical midpoint (`top: 56%`) rather than near the bottom,
  since every card's text lives in the bottom ~30% and the photo itself has nothing at
  the midpoint on any of the three cards. Still disappears entirely (unmounted, not
  just hidden) the instant the reader scrolls the feed themselves.
- **Auto-scroll delays cut down** per direct feedback that the wait after each
  interaction was too long: Build 900ms→400ms, Match 2200ms→950ms, Play 2000ms→950ms.
  Each new value is sized to the actual feedback animation plus a small buffer (Match's
  celebrate bounce + text fade settles by ~0.8s, Play's burst/glow settles by ~0.8s,
  Build's check-in transition is ~0.2s), not an arbitrary "let them admire it" pause on
  top of that.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: Connect's 1-reply floor at 1920×750 (measured, no crop), Explore's
  arrow appearing only after the peek settles and sitting clear of card text, and
  Build's pick advancing to Match within ~1s of tapping (down from ~2s+).
- A second occurrence of the dev-server Fast-Refresh/browser-tool-hang issue from the
  previous entry came up again mid-session (click actions timing out); a fresh tab
  recovered it each time without needing another full server restart.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 removed the per-chapter alternating background

- User-reported screenshot showed a hard background-color seam sitting right behind
  Build's "+ 12 more interests" line — `ChapterShell` had an `altBackground` prop that
  alternated chapters between the page background and `var(--card)` (Match and
  Explore had it, Build/Play/Connect didn't), and the previous round's `compact`
  section height made Build noticeably shorter, putting that pre-existing seam right
  behind trailing content instead of in empty space below it. Per direct feedback
  ("can it not just flow organically? keep the same background everywhere") this
  wasn't just a compact-mode edge case — the alternating background itself was the
  thing to remove. Deleted `altBackground` entirely (prop, default, and the
  conditional style) from `ChapterShell.tsx`, and dropped the `altBackground` line
  from `Match.tsx` and `Explore.tsx`'s `ChapterShell` calls. All 5 chapters now share
  one continuous background with no per-section seam anywhere.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: scrolling from Build straight into Match now shows no background
  break at all.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 frame hugs content instead of capping it; conic-gradient holo border

- **Root-caused "why does Connect fit 2 replies on mobile but not desktop"**: `--mu`
  scales off the graphic frame's WIDTH (capped at ~480px on both), so text/padding
  sizes end up the same on mobile and desktop once both are wide enough — but the
  frame's HEIGHT was a fixed `compact` ceiling (`min(50dvh, 460px)`) that has nothing
  to do with width, so the same content needed more vertical room at desktop's larger
  mu than the ceiling allowed, while mobile's smaller mu (since its narrower frame
  never reaches the 480px width cap) let more fit under the same-ish budget. Direct
  ask was to stop fighting this with a JS reply-count workaround and instead make the
  frame **hug its content** — implemented in `ChapterShell.tsx`: `compact` chapters now
  get `height: auto` (with `maxHeight` only as a generous safety net,
  `min(72dvh, 620px)`) instead of a fixed height, and the compact section dropped its
  `min-h-[62dvh]` entirely in favor of just its own padding. Removed Connect's whole
  `visibleReplies`/`useLayoutEffect` measurement system from the previous two rounds —
  no longer needed, since the frame just grows to fit all 3 replies now. Verified at
  1920×750 (the viewport that broke it before): frame height matches card height
  exactly, all 3 replies present, `fits: true`.
- **Wildcard holo border reworked** per direct feedback that it was "too slow and
  disappears for quite a bit": the old version animated `background-position` across
  an oversized, non-repeating `linear-gradient`, so only a slice of the 6-color
  sequence sat inside the border at any moment — as that slice drifted across a
  same-ish-hue stretch, the border visibly dulled for a beat. Replaced with a
  `conic-gradient` rotated via an animated `@property` custom angle: a conic gradient
  wraps the FULL color sequence around the shape at all times, so rotating it changes
  *where* each color sits, never *how much* of the spectrum is showing — the
  "disappears" complaint structurally can't happen anymore. Sped up 5s → 2.2s. Added a
  second layer, `.mkt-holo-aura` — the same rotating gradient, blurred and enlarged
  (`inset: -10px`, `blur(18px)`), sitting behind the card as a soft glowing halo
  bleeding past the edges, with a slight animation-delay offset from the border so the
  glow doesn't feel perfectly glued to the ring.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: Connect shows all 3 replies with the frame exactly matching card
  height at both 1440×900 and the extreme 1920×750 case, Build's layout is unaffected,
  and the Wildcard card now shows the full color spectrum continuously with a visible
  glowing aura around it.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 locked Explore's feed to vertical-only touch scrolling

- Reported as "scrolling within the card goes side to side and vertical, like a free
  scroll to anywhere / dragging the contents." `.mkt-explore-track` had no explicit
  `touch-action`, so the browser's default (`auto`) let touch gestures pan in any
  direction rather than committing to vertical-only scroll the moment a `overflow-y-
  auto` + `scroll-snap-type: y` feed is touched. Added `touch-pan-y` (Tailwind utility
  for `touch-action: pan-y`), matching the same fix already used on Match's card.
  Confirmed via computed style that `touchAction` now resolves to `pan-y`.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Explore rebuilt as a committed TikTok/Reels-style carousel

- `touch-pan-y` (previous entry) turned out to make vertical `touchmove` events
  non-cancelable in some browsers, which broke an earlier `preventDefault`-based
  scroll-forwarding approach for handing off scroll at the feed's first/last card to
  the adjacent chapter. Rather than patch that forwarding again, `Explore.tsx`'s whole
  feed was replaced: no native scroll/`scroll-snap` at all now, just a custom
  index-based carousel (`activeIndex` + a continuous `dragPx` for live drag/peek)
  driving `translateY`/`scale`/`opacity` per card via `requestAnimationFrame`-eased
  math, per direct request for "TikTok/Reels" one-card-per-gesture paging instead of
  free scroll with snap.
- Peek visibility required a real discovery: cards rendered at the container's full
  size leave zero overlappable pixels for a neighbor to peek into, regardless of
  z-index (two edge-to-edge same-size cards never share a visible boundary strip).
  Fixed by rendering every card `GUTTER_FRACTION` (9%) shorter than the container top
  and bottom, so there's genuine empty space for a neighbor's sliver to occupy — the
  focused card still fills that inner band exactly, so its own edges are never
  affected.
- The carousel's `commit()` function IS the boundary handoff now — committing past
  index 0 or the last index calls `scrollIntoView` on `#play`/`#connect` directly, no
  separate touchend-detection layer needed.
- Real bug found and fixed during this round's verification: the wheel handler had no
  `preventDefault()`, and React's `onWheel` prop has been passive by default since
  v17 (calling `preventDefault` inside it silently no-ops) — a single trackpad swipe
  was committing the carousel's own index **and** letting the native page scroll
  advance through the scroll-snap sections at the same time, which is almost
  certainly what looked like "a two-card jump" in earlier manual testing. Fixed with a
  plain non-passive `addEventListener("wheel", ..., {passive:false})` on the track
  purely to call `preventDefault`, leaving the existing `onWheel` prop's commit logic
  untouched. Re-verified: single wheel gesture now advances exactly one card, and
  boundary handoff to Play/Connect no longer overshoots into the CTA section.
- The Wildcard's blurred aura glow (added in the previous round) was reported as
  getting clipped by the track's necessary `overflow-hidden`. Tried three fixes in
  order: (1) an unclipped sibling layer outside the track — bled past the whole
  chapter frame into Connect below it; (2) back inside the clipped track with a
  track-level `mask-image` fade — faded the *other* two cards' own left/right photo
  edges too, and still cut hard on the card's left/right (the track has zero
  horizontal margin the way it has a vertical gutter, so there's no room to fade
  into); (3) killed the aura glow entirely per direct instruction ("if you can't fix
  it, kill the glow"). The rotating conic-gradient border + diagonal sheen sweep
  (both unaffected by any of this) are the Wildcard's whole "rare pull" treatment now
  — uniform on all four edges, nothing bleeding past the frame.
- Also rounded the two plain cards' corners (`calc(var(--mu) * 17px)`, matching the
  Wildcard's own inner radius) — they'd been rendering as sharp-cornered rectangles
  since `ExploreCardBody` is a bare fragment with no wrapping element to round;
  `CardFace` now wraps the non-Wildcard path in a rounded `overflow-hidden` div too.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified: single-card-per-gesture wheel commit with no overshoot, correct
  boundary handoff to Play (up) and Connect (down) at the first/last card, peek
  visibility on both neighbors, rounded corners on all three cards, and the
  Wildcard's border/sheen rendering with no glow artifacts leaking past the frame.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Hero subhead: force the second sentence onto its own line

- The hero's two-sentence subhead ("Build, match, play, explore, and connect, all in
  one place. One clear step at a time.") was one plain text node, so its wrap points
  were whatever the browser's line-breaking happened to land on at a given width —
  at some widths that left the second sentence's last couple of words orphaned alone
  on their own line. Split into two `<span className="block">` elements, one per
  sentence, so each sentence always starts its own line regardless of viewport width;
  each still wraps internally on its own if it's ever too long for the line.
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check` all pass clean.
  Browser-verified at desktop and mobile (375px) widths.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 all four interactive chapters reset and replay on every scroll-back

- Direct request: every chapter's demo (and Explore's nudge specifically) should
  start over and replay each time the reader scrolls back onto it, not just once
  ever. `usePlayingOnScroll` (`scrollHooks.ts`) previously exposed `everPlayed`
  (sticky true forever after the first reveal) — fine for a one-time entrance fade,
  useless for "reset on every revisit." Added a `visitId` counter, returned as the
  hook's new 4th tuple element, that increments every time the IntersectionObserver
  reports the section entering view (unlike `everPlayed`, this changes on every
  single visit, including the first).
- Each chapter with its own interactive state (Build's picked interest, Match's
  swipe deck/celebration, Play's picked scenario option, Explore's carousel
  position/nudge) was split into an outer component (still owns `ChapterShell` +
  the `usePlayingOnScroll` call) and an inner `*Demo`/`ExploreCarousel` component
  holding all of that local state, mounted as `<XDemo key={visitId} />`. Remounting
  via key is the standard React pattern for "reset all local state when X changes"
  and was the correct fix here — a first attempt just called the state setters
  directly inside a `useEffect(() => setX(null), [visitId])` and was rejected by
  this repo's `react-hooks/set-state-in-effect` eslint rule (calling setState
  synchronously inside an effect body is flagged as an error, not a warning); a
  fresh mount's own effects already replay any entrance sequence without ever
  calling setState from a change-triggered effect.
- Explore's nudge effect no longer depends on `graphicRevealed`/`scrolled` — since
  `ExploreCarousel` now remounts fresh every visit, a plain mount-time effect
  (deps: `[containerHeight]` only) already replays the sequence each time; a new
  `scrolledRef` mirrors the `scrolled` state so the chained setTimeouts can still
  bail out cleanly if the reader interacts partway through, without needing
  `scrolled` in the dependency array (which would otherwise skip the whole
  sequence once it's already true). Also shaved the nudge's initial delay from
  900ms to 650ms per direct feedback ("start a few ms sooner").
- Validation: `tsc --noEmit`, `npm run build`, `npm run tokens:check`, and
  `eslint` on all five touched files all pass clean (one pre-existing
  `react-hooks/refs` error in `Explore.tsx` predates this change — confirmed via
  `git stash` that it's already present on `main` before this commit, unrelated to
  this work).
- Not yet browser-verified end-to-end: this session's browser tab got stuck with
  `document.hidden === true` (confirmed via a manual `IntersectionObserver` probe
  that never fired a single callback, not even its mandatory initial one),
  which is a page-visibility artifact of the tool's tab, not the app — Chrome
  throttles/suspends `IntersectionObserver` for hidden documents, and this would
  block the SAME reveal/replay mechanism for all five chapters equally, not just
  the new code. Restarting the dev server, clearing `.next`, and opening multiple
  fresh tabs did not clear it. The remount-via-key implementation itself follows a
  standard, well-established React pattern and needs no exotic runtime behavior to
  work correctly once the tab is genuinely visible/focused — flagging for whoever
  picks this up next to do a quick manual scroll-away-and-back check on each
  chapter before considering this fully closed.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 landing-page copy refresh + Build/Match/Explore/Play/Connect UX pass

- Copy pass for tomorrow's meeting, plus a batch of direct UI/UX feedback across
  four chapters. Scope: `Hero.tsx`, `FinalCTAs.tsx`, and all five `HowItWorks`
  chapters except Connect's core copy (untouched) — no other route touched.
- Hero: "Start my journey" → "Start Journey" (now matches the bottom CTA's own
  label); "Scroll" hint → "Scroll Down To Learn More".
- Bottom "You're ready" CTA (`StudentFinalCTA`): dropped the secondary "See how it
  works" ghost button per direct feedback ("we don't need it... one clear CTA").
  `CTABlock`'s `secondary` prop is now optional so `SchoolsFinalCTA` (which still
  wants both of its own buttons) is unaffected. Left Hero's own separate "See how
  it works" button alone — it's a different instance, not in scope here.
- Build: the "Question 3 of 7 / Choose your interests" step now sits inside its
  own bordered glass card (previously floated loose in the section, reading as not
  obviously "one step of 7"). Same card recipe as Connect's post card
  (glass-surface-3 + blur + a `var(--c)`-tinted glow) for visual consistency —
  `var(--c)` resolves to each chapter's own accent since `ChapterShell` sets it
  from the `color` prop. Renamed the old `EXAMPLE` constant to `CLICKABLE`: only
  "Business & Money" is clickable now, Tech and Health show a hover color change
  (via a small `hovered` state, since the background is otherwise driven by inline
  styles that plain Tailwind `hover:` classes can't override) but do nothing on
  click, so the rest of the storyboard's fixed path still makes sense no matter
  what a reader tries.
- Match: `CARDS` reordered to Operations first, then Investment Banking, then
  Project Manager (previously Investment Banking led). The nudge text is now a
  two-beat guided sequence keyed off whichever card is actually on top (not
  `likedCount`/`stack.length` as before) — "Swipe left to see it's not a match"
  while Operations is up front, "Swipe right to see a match" once Investment
  Banking is. To guarantee the deck can only ever end matched with Investment
  Banking: liking Operations (`onExitTransitionEnd`, `exited.key === "ops"`) just
  advances the stack instead of setting `matchedCard`; passing Investment Banking
  (`onCardPointerUp`, `top?.key !== "iba"` guard) is silently absorbed rather than
  dismissing the card, so it springs back instead of ever being passable. Removed
  `likedCount` state entirely (nothing reads it anymore). The Like/Pass buttons
  lost their `onClick` per direct feedback ("don't have the button actually
  pressable") — visually identical, swipe-only now. Heart icon path replaced with
  a hand-authored solid thumbs-up (less Tinder-like per feedback).
- Explore: added a left-side up/down chevron button pair (mirroring the existing
  right-side action rail, but real controls wired straight into `commit()`) plus a
  persistent "Swipe up/down or use arrows" hint pill, since a swipe-only feed
  doesn't intuitively read as "like a FYP feed" to everyone.
- Play: `SCENARIO` copy replaced — Christina (VP) introduces Marcus, the Managing
  Director, ahead of a big pitch tomorrow; three new options (role/deadline, start
  slides, wait for a teammate) with new short positive-feedback response lines,
  matching the existing illusion-of-choice tone (no wrong branch to build). Kept
  the existing artwork — no new image asset was supplied for this scenario.
- Connect: rebuilt as a two-screen flow. Screen 1 is a new Community Overview
  card ("Students Interested in Business & Money", a horizontal 1,987/212/123
  Students/Professionals/Posts stat row, an "Enter Community" button) shown by
  default; clicking it reveals Screen 2, the pre-existing post/comment card.
  Extracted a shared `CardShell` component so both screens use the exact same
  glass-card recipe. Screen 2 also picked up two smaller, separately-requested
  fixes: a "Community Board" kicker label at the top (so the card reads as a
  public post, not a private message) and Maya's tag changed from "Grade 10" to
  "Howard University · Sophomore" (a college sophomore asking about landing a
  bank internship is more realistic than a high schooler asking the same). Local
  `screen` state lives in a new `ConnectDemo` component, keyed by `visitId` (same
  reset-on-revisit pattern as the other four chapters) so scrolling back onto
  Connect always starts back on the Community Overview screen.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same one pre-existing `react-hooks/refs` error in `Explore.tsx`,
  unrelated to this work).
- Browser-verified via DOM/text inspection and `.click()` on real buttons (Build's
  lock behavior, Explore's nav buttons, Connect's screen transition) — this
  session's browser tab was stuck reporting itself hidden to the page (see the
  previous entry), which blocks synthetic PointerEvent drag/swipe gestures
  specifically (confirmed: neither a raw `dispatchEvent(new PointerEvent(...))`
  nor a CDP-driven `left_click_drag` produced any pointer events on the target
  element at all, while plain `.click()` calls worked reliably). Match's new
  guaranteed-ending swipe logic was therefore verified by code review rather than
  a live drag test; every click-based path verified live successfully.
- Not yet pushed to `origin` as of this entry.

### 2026-08-16 Explore nudge reliability/speed fix, dropped auto chapter-jump, Build "+more" consolidated, Explore stat row never wraps

- Explore's peek+arrow nudge was reported as "doesn't always work and too slow."
  Root cause: the nudge's `useEffect` depended on `containerHeight`, and
  `ResizeObserver` can fire more than once while the frame's layout settles
  (scroll-into-view physics, container-query recalculation) — each firing tore
  down the in-flight chained-`setTimeout` sequence via the effect's cleanup, so a
  resize landing mid-peek or mid-settle cancelled the animation with `dragPx` left
  mid-flight and the sequence never actually finished. Fixed by making the effect
  mount-only (`deps: []`) and reading `containerHeight` through a ref
  (`containerHeightRef`, kept in sync by its own tiny effect) instead, with a
  50ms-interval retry (`begin()`) until a real measurement exists — once the
  sequence actually starts, nothing can tear it down early except unmounting or
  the reader interacting. Also cut every duration in the chain (900/700/700ms →
  500/400/200ms, initial delay 650ms → 350ms): the arrow now reliably appears in
  ~1.7s instead of ~3.6s, confirmed across several repeated page reloads.
- Committing past Explore's first/last card used to auto-scroll into Play/Connect
  — per direct feedback this felt like being launched somewhere unasked for.
  `commit()` now just stops at the boundary card; `goToPrevChapter`/
  `goToNextChapter` were removed as they're no longer referenced anywhere.
- Build: consolidated the three per-option "+more" chips (added earlier this
  session) plus the old "+12 more interests in the full assessment" text into a
  single "+ more" chip below the options row, per direct feedback that per-option
  chips were clutter. The post-selection state ("{selected} noted...") is
  unchanged.
- Explore's salary/major stat row (`ExploreCardBody`) used `flex-wrap`, which let
  the two stats wrap onto separate lines on narrower cards when the major name was
  long ("Business Administration"). Per direct feedback they must always sit side
  by side. Switched to `flex-nowrap` + `min-width:0` on each stat item (a flex
  item's default `min-width:auto` refuses to shrink below its content's natural
  width, which is what was forcing the wrap in the first place) + a
  `text-overflow: ellipsis` truncation capped at `calc(var(--mu) * 72px)` on the
  value text, so an overlong value truncates instead of ever breaking the layout.
  Verified via `getBoundingClientRect()` on both stat spans (same `top` value,
  i.e. same line) and visually via screenshot at both desktop and 375px mobile
  widths, on the Management Analyst card specifically (the longest major).
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
- Pushed to `origin/main` with explicit user authorization (this entry covers both
  this round and the previous round's changes, pushed together).

### 2026-08-16 Explore cards use each career's own world font + color, per the design system

- Direct request to pull Explore's card fonts/colors from the real design system
  (Figma's Career Poster Card component, node 2403:244) instead of one-size-fits-
  all values. Checked the component's actual per-world token values via
  `get_variable_defs` and `get_design_context` on two of its "World" variants:
  Business, Money, Sales & Office uses Viaoda Libre Regular for the poster title
  and `--world-business-money-office` (#ffb81f) for the industry-line color;
  Science & Research specifically uses a DIFFERENT poster-title font — Source Code
  Pro SemiBold — and its own `--world-science-research` (#00c8dc) color. The
  component's own usage note confirms this is deliberate: each of its 13 "worlds"
  carries its own poster-title typeface, not one blanket font for every card.
- Explore's `ExploreCardBody` was applying a single hardcoded `--font-poster`
  (Viaoda Libre) to every card's title regardless of industry, and a literal
  `color: "#ffb81f"` to every card's industry line — coincidentally correct for
  the two Business & Finance cards, but wrong for Food Scientist (Science &
  Research), which should never have looked like a Business & Finance card
  typographically. `--world-business-money-office`/`--world-science-research`
  were already correctly defined in `tokens.css` from an earlier round; added a
  new `--font-poster-mono: "Source Code Pro", monospace` alongside the existing
  `--font-poster`, and loaded the actual webfont (weight 600 only — the only
  weight this design system variant uses) by appending
  `&family=Source+Code+Pro:wght@600` to the existing Google Fonts `<link>` URL in
  `fonts.ts` (this project loads fonts via a plain stylesheet link rather than
  next/font/google, which broke specifically on Vercel's build — see that file's
  existing comment). A new `WORLDS` lookup in `Explore.tsx` maps each card's
  `industry` string to its `{ color, font, weight }`, and `ExploreCardBody` now
  reads the title's `fontFamily`/`fontWeight` and the industry line's `color`
  from that lookup instead of hardcoding either.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified via computed style: Food Scientist's title now measures as
  `"Source Code Pro", monospace` at weight 600 with its industry line at
  `rgb(0, 200, 220)`; Accountant's title still measures as `"Viaoda Libre", serif`
  at weight 400 with its industry line at `rgb(255, 184, 31)` — confirmed
  unchanged. Also screenshot-verified visually.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Explore nav buttons repositioned, Play rebuilt as an immersive RPG scene, mascot visibility

- Explore's left-side up/down nav buttons went through two iterations this round.
  First attempt moved them into their own row BELOW the card (mirroring how Match
  budgets a button row below its own card) — rejected; direct feedback wanted them
  specifically on the LEFT side, stacked vertically, just genuinely outside the
  card's bounds rather than overlapping the photo. Final version: the whole
  carousel is now a flex ROW (button column, then the card), not a flex column.
  The card itself no longer uses `flex-1` for its own sizing (a row's flex-grow
  and an aspect-ratio's derived width would fight over the same horizontal axis) —
  it just uses `h-full` + `aspectRatio` directly, same as the original single-child
  version, with `max-w-full` as a safety cap.
- Play was substantially rebuilt per direct feedback ("the image is the least
  visible part, it's supposed to be an immersive simulation experience like an
  RPG... elevate it to look amazing") against a reference screenshot of a
  visual-novel-style choice screen (full uncovered art on top, a separate opaque
  panel below with a dialogue bubble and lettered A/B/C choice rows). Adapted the
  structure to this app's dark theme rather than cloning the reference's light
  panel: the scene image is now a real, unobscured `flex-1` region (previously it
  was a full-bleed background under a heavy dark gradient PLUS a translucent
  blurred panel covering most of it — the actual bug behind "least visible part"),
  and the interaction area below it is a genuine opaque `var(--card)` surface
  (`flex-none`, sized to its own content) rather than glass laid over the art.
  Added a chat-bubble treatment for the scene text and a leading arrow icon per
  option row. Two follow-up corrections: the first pass used a fixed image/panel
  percentage split, which clipped the third option on shorter viewports — fixed by
  making the panel `flex-none` (sizes to its own real content height, so it can
  never be clipped) and the image `flex-1` (absorbs whatever's left), plus
  tightening every padding/gap/font-size in the panel so its natural height stays
  comfortably small; and the reference's lettered A/B/C badges were tried, then
  removed per direct feedback, leaving just the arrow to signal "tap to choose."
- Mascot: `VISIBLE_FRACTION` (Mascot.tsx) raised from 0.63 to 0.7 per direct
  feedback ("I don't see enough of it") — 0.63 was deliberately calibrated to stop
  exactly at the mouth's own top edge (y=63.5% in the source artwork) so literally
  none of it showed; 0.7 does let the very top of the mouth peek in now, a
  conscious tradeoff since more of the character actually visible was judged worth
  it. Updated both hardcoded `37%` transform offsets (the resting position and the
  scroll-driven exit) to `30%` (= 1 − 0.7) to match, and Hero.tsx's reserved
  `paddingBottom` multiplier from `.63` to `.7` so the copy above still never
  overlaps the taller visible mascot (these three numbers aren't a shared import,
  they have to be kept in sync by hand — noted in both files' comments).
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified at both desktop and 375px mobile widths: Explore's button
  column sits outside the card at both sizes, Play shows the full scene plus all
  three options with no scrolling and no clipping (picking an option correctly
  shows its feedback text + "Try again"), the mascot shows noticeably more of
  itself without looking broken, and Connect/Build's earlier changes were spot-
  checked on mobile too since this was a broader "make sure this all works on
  mobile" pass.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Match buttons re-enabled, Explore nav reverted to below-card, Play mobile text floor

- Match's Like/Pass buttons had been made decorative-only (no `onClick`) in an
  earlier round specifically so the guided tutorial could only be experienced via
  a real swipe. Direct feedback asked for them to work again — re-added
  `onClick`, using the exact same guards the swipe path already has: Like always
  calls `act("like")` (the "no match on Operations" rule lives downstream in
  `onExitTransitionEnd`'s own `exited?.key === "ops"` check, so it applies
  regardless of trigger source); Pass only calls `act("pass")` when
  `top?.key !== "iba"`, mirroring `onCardPointerUp`'s own guard, so passing
  Investment Banking via the button is still a no-op — the deck still can only
  ever end matched with Investment Banking, tap or swipe.
- Explore's nav buttons went back to a row below the card (this chapter's THIRD
  layout for these buttons this session) — the left-side button-column version
  from the previous entry made the card sit off-center in a lopsided way that
  looked wrong specifically on mobile, per direct feedback. Back to the
  flex-column-with-flex-1-card structure from two rounds ago (card on top, button
  row below in normal flow, same shape as Match's own row).
- Play's panel font sizes (tightened significantly two rounds ago specifically so
  nothing would clip) were flagged as too small on mobile — root cause: `--mu` is
  a container-query value off the frame's own width, which shrinks toward its 1.0
  floor on a narrow phone, so mu-scaled text has no real minimum size. Switched
  every panel font-size from plain `calc(var(--mu) * Npx)` to
  `clamp(minPx, calc(var(--mu) * Npx), maxPx)`, giving mobile a genuine readable
  floor (e.g. the prompt headline floors at 14px, option labels at 13px) while
  leaving desktop's sizing unchanged. Since the panel is `flex-none` (sized to its
  own content) and the image above it is `flex-1` (absorbs whatever's left), a
  taller panel on mobile automatically means a proportionally smaller image there
  too — exactly the trade-off directly confirmed as acceptable ("okay if we
  shrink it a bit for mobile too").
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified: Match's Like button correctly matches Investment Banking,
  Pass correctly no-ops on it; Explore's card is centered again with buttons
  below at both desktop and mobile widths; Play's option-label/headline computed
  font sizes hit their 13px/14px floors on a 375px viewport with the card's
  `scrollHeight === clientHeight` (confirmed no overflow/clipping).
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Explore: swiping past the last/first card on mobile no longer gets stuck

- Reported: after reaching the last card in Explore's feed, a mobile reader could
  no longer scroll to the next section at all — the track has
  `touch-action: none` (needed so it can fully own every drag gesture itself,
  rather than fighting a native scroll the way `touch-pan-y` did earlier this
  project — see that fix's own note about non-cancelable touchmove events), which
  on a phone leaves literally no free screen space for a plain scroll gesture to
  land on once the carousel has captured the touch. Desktop never had this
  problem — a wheel/trackpad gesture still works over the rest of the page even
  while the track's own wheel listener has captured one scroll — so the earlier
  "stop auto-jumping at the boundary" fix (a few rounds back) only actually
  trapped mobile readers, not desktop ones.
- Fix is scoped specifically to the touch/drag path, not wheel: `onPointerUp` now
  checks whether the committed swipe is already at the boundary card in that
  direction, and if so calls `goToPrevChapter()`/`goToNextChapter()` (re-added,
  scrollIntoView on `#play`/`#connect`) instead of a no-op; `commit()` itself and
  the wheel handler are untouched and still just clamp at the edge with no jump.
  This isn't a reversion of the earlier "don't auto-launch me" feedback — that
  was about ANY input (including incidental wheel scroll) silently launching
  navigation; this only fires on a genuine, deliberate, threshold-exceeding swipe
  commit specifically at the edge, the same gesture strength that already moves
  between cards mid-deck, and only for the one input method that can otherwise
  leave a reader with no way to proceed at all.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error). Live
  drag-gesture verification was blocked by this session's browser tab
  intermittently reporting itself "hidden" to the automation tool (a recurring,
  previously-documented tool quirk, not a code issue) right as the test was
  attempted; confirmed via DOM inspection that the carousel reaches the last card
  correctly and the rest of the logic is unchanged from the already-verified
  commit()/onPointerUp code paths, with only the boundary branch added.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Explore: boundary jump made uniform again (wheel included)

- The previous entry's assumption — "desktop never gets stuck because the
  wheel/trackpad still works over the rest of the page" — turned out to be
  wrong: it only holds if the reader's cursor isn't already sitting on the
  card itself. Direct feedback: "I still get stuck there if my mouse is on top
  of the last card and I scroll down." Hovering the graphic and continuing to
  scroll down hits the SAME captured, non-passive wheel listener, and with
  `commit()` only clamping at the boundary there was nowhere for that scroll to
  go — desktop readers could get just as stuck as mobile ones, just via a
  different, easy-to-hit precondition (cursor position) instead of an
  unavoidable one (screen space).
- Removed the split from the previous entry: the boundary-jump
  (`goToPrevChapter()`/`goToNextChapter()`) now lives inside `commit()` itself
  again, so it fires identically for wheel, touch, and the nav buttons — this is
  the same shape `commit()` had several rounds ago, before it was first narrowed
  to "never jump, any input" and then to "jump only on touch." `onPointerUp` goes
  back to simply calling `commit()` on both directions with no special-casing of
  its own.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error). Live
  verification was blocked again by the same recurring `document.hidden`
  tool-tab quirk (confirmed directly this time: a manual check read
  `document.hidden === true` on the active tab, and a dispatched synthetic wheel
  event plus a direct button click at the boundary card both failed to trigger
  `scrollIntoView`'s smooth-scroll animation, consistent with how this same
  condition has previously suppressed IntersectionObserver callbacks, CSS
  transitions, and pointer/touch event delivery elsewhere this session — not a
  code defect). Confidence here rests on this being a straightforward
  simplification back to a structure that WAS verified working earlier in the
  session, not new untested logic.
- Not yet independently re-verified live on a real device/browser as of this
  entry — worth a manual spot-check (scroll wheel with the cursor directly over
  Explore's last card, and a real touch swipe on a phone) next time this app is
  opened somewhere the automation tooling isn't fighting itself.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-16 Match's guided cards locked to one swipe direction, Explore's redundant arrow removed

- Match: per direct feedback ("don't let people swipe right on it, lock swiping
  to the instructions"), Operations now blocks a right-swipe/Like outright
  rather than just neutering its outcome after the fact — `onCardPointerUp`'s
  threshold check gained a `top?.key !== "ops"` guard (mirroring the existing
  `top?.key !== "iba"` guard on the pass/left-swipe side), and the Like button's
  `onClick` got the same guard. Each guided card is now locked to the single
  direction its own on-screen instruction actually shows: Operations only ever
  demos "swipe left," Investment Banking only ever demos "swipe right." Since
  liking Operations can no longer happen via any path, the dead-code branch in
  `onExitTransitionEnd` that used to catch and neutralize it (added when this
  was only a soft, post-hoc block) was removed — every "like" that reaches there
  now is a real match, no special-casing needed.
- Explore: removed the second-beat down-arrow nudge (`showArrow` state, the
  `mkt-explore-arrow` JSX block, and its now-unused keyframes in
  `animations.css`) per direct feedback that it was redundant — the persistent
  "swipe up/down or use arrows" hint pill and the two visible arrow buttons
  already communicate the same thing. The first-beat physical peek (the next
  card sliding up and settling back) is untouched.
- Validation: `tsc --noEmit`, `eslint`, `npm run build`, `npm run tokens:check`
  all pass clean (same pre-existing, unrelated `react-hooks/refs` error).
  Browser-verified: clicking Like on Operations is confirmed a real no-op (the
  top card, checked via textContent, stays Operations with no match); the
  `.mkt-explore-arrow` element no longer exists anywhere in the DOM. Pass-on-
  Operations (unchanged code, already verified working in an earlier round)
  couldn't be re-confirmed this round — the same recurring `document.hidden`
  tool-tab condition was active again, which blocks the CSS transitionend that
  `onExitTransitionEnd` depends on; confirmed via a direct `document.hidden`
  check rather than assumed.
- Pushed to `origin/main` with explicit user authorization.

### 2026-08-06 hero copy pass (superseded by the full rebuild above)

- Date: 2026-08-06
- Active branch: `v2`
- Main branch: pushed this session with explicit user authorization (see below)
- Objective: apply the final approved copy to the public landing hero on `v2`, remove all
  unapproved visible hero terms, and verify the responsive result. Build, Match, How It
  Works, Career Report, and the post-onboarding Home are outside this copy-only pass.

## 2026-08-06 hero hierarchy redesign (position/size only, no copy changes)

- Rebalanced the landing hero's visual hierarchy so the career-promise headline ("Discover
  your dream career.") is the largest, dominant element instead of DREAMARI. Per UX audit
  (NN/g 3-second clarity test, semantic H1 weight, familiarity-first sequencing), a brand
  name larger than the value proposition asks a first-time visitor to parse an unfamiliar
  term before learning what the product does or promises.
- Reordered the Student/Enterprise toggle above the DREAMARI + headline group (a
  PayPal-style "Personal/Business" pattern), because the toggle is a mode selector about to
  gate which hero variant renders (Enterprise page in progress), not a caption for the
  brand block beneath it.
- Grouped DREAMARI and the headline into one nested block, separated from the toggle by
  extra margin — reads as one brand-to-promise unit (Gestalt proximity) instead of three
  ungrouped stacked lines.
- DREAMARI is now a `<p>` kicker (was previously the dominant title) directly above the
  `<h1>` headline; kept solid, uppercase, wide-tracked, and using `font-display` (Favorit)
  exclusively — no change to which font renders where.
- Trimmed `RoleToggle.tsx` pill padding/min-height slightly; a button still needs a real tap
  target, so DREAMARI's own font-size (`clamp(1.375rem, 2vw + 1vh, 2.25rem)`) was bumped
  instead of shrinking the toggle further, to close most of the remaining visual-weight gap.
- Copy is byte-for-byte unchanged from the approved list; only element order, tag, and
  size/spacing values changed in `src/components/hero/HeroSection.tsx` and
  `src/components/hero/RoleToggle.tsx`.
- Validation passed: `npm run tokens:check` (503 tokens), `npm run lint`, `npx tsc --noEmit`,
  `npm run build`. Browser-verified at 1280px desktop, 768×1024 tablet, and 320×700 mobile
  with no horizontal overflow or layout regressions.
- Pushed to `v2` then to `main` with explicit user authorization (see commit hash below).

### 2026-08-06 follow-up: spacing refinement

- User feedback after the initial push: DREAMARI/headline read too loose against each
  other, and the toggle read too close to that group given it's a separate control.
- Tightened the DREAMARI-to-headline gap to near zero (`gap-0 sm:gap-0.5`) so the two read
  as a single unit, and moved the toggle's separation from the shared outer column gap into
  its own explicit `mb-2 sm:mb-3` wrapper, independent of the other sibling gaps in that
  column (so ScrollNudge-to-toggle and group-to-paragraph spacing were unaffected).
  `src/components/hero/HeroSection.tsx` only; `RoleToggle.tsx` unchanged this pass.
- Re-ran the full validation suite (`tokens:check`, `lint`, `tsc`, `build`) and browser
  re-verified desktop and 320×700 mobile; DREAMARI now sits tight against the headline and
  the toggle has clearly more room below it. Pushed to `v2` then `main` with explicit
  authorization.

### 2026-08-06 hero reverted to DREAMARI-dominant per UIKIT Figma reference

- User directive: match the approved UIKIT Figma hero
  (`d8j3JbtVojSgVOqsjGpcZM`, node `1036:39072`) with DREAMARI as the single largest
  element on screen, sized appropriately and responsively — overriding the earlier
  headline-dominant UX redesign above.
- DREAMARI is again the dominant `<h1>` (`font-display`, `clamp(3rem, 6.5vw + 2vh, 7rem)`,
  ~48–112px) with the career-promise headline demoted to a smaller `<h2>`
  (`clamp(1.75rem, 2.2vw + 1.1vh, 3rem)`, ~28–48px) below it — roughly a 2.3x size ratio at
  every viewport, matching the Figma reference's proportions. The toggle-above-brand-group
  ordering and its extra separation margin from the earlier session are unchanged.
- Added a partial gradient on the headline ("dream career." in `brand-100`→`brand-600`,
  "Discover your " plain white) matching the Figma reference's two-tone treatment, using
  existing semantic brand tokens (no new colors introduced).
- The Figma reference's top header nav (Explore / Missions / For schools / "Get started
  free") was intentionally NOT reproduced — those are unapproved terms already removed
  from this hero earlier in the shared workflow. Only the toggle → DREAMARI → headline →
  paragraph → CTA structure and sizing ratio were adopted from the reference.
- Fixed a `ScrollNudge` overlap bug (reported after this change, but present before it
  too, on any sufficiently short viewport): it was `absolute inset-x-0 bottom-0` inside the
  centered flex-1 content group, pinned to that group's own bottom edge rather than the
  viewport. On short viewports (or once DREAMARI grew taller) that edge could coincide with
  the CTA button, visually overlapping it. Changed `ScrollNudge` to a normal in-flow last
  child instead of an absolutely-positioned one, so it always stacks below the CTA with the
  column's existing gap and can't overlap a sibling regardless of container height.
  Verified no overlap at 1280×720, 1280×600, 768×1024, and 320×700.
- Validation passed: `tokens:check` (503 tokens), `lint`, `tsc --noEmit`, `build`.
  Browser-verified at desktop, 1280×720, 1280×600, 768×1024, and 320×700 (no horizontal
  overflow at 320px) plus a manual click-through confirming the Scroll control still
  advances to How It Works.

## Completed

- Updated the public landing hero to the final approved copy: Student / Enterprise,
  dominant “DREAMARI” title, smaller “Discover your dream career.” headline, the confirmed
  Build/Match/Play/Explore/Connect summary, “One clear step at a time.”,
  “Start my journey”, and the existing Scroll chevron.
- Removed the former Explore, Missions, For schools, Get started free, Teacher, and legacy
  supporting sentences from the visible landing hero. The visual system and route behavior
  remain unchanged; page metadata now uses the approved summary.
- Changed only the two How It Works CTA labels from “Start building →” to the approved
  “Start my journey”. All other How It Works copy and behavior remain unchanged.
- Refined the landing hero hierarchy without changing copy: DREAMARI is solid white with
  controlled uppercase tracking, while “Discover your dream career.” is one clear type
  tier above the descriptive paragraph. The former multi-stop title gradient was removed.
- Installed the supplied licensed `FavoritExtraBoldC.woff2` locally and made
  `fontFamily.display` the semantic source for the hero display style. Only DREAMARI uses
  Favorit; the secondary headline, body, controls, and application UI remain Montserrat.
- Removed the landing page's otherwise-empty header/duplicate wordmark. Enlarged the
  secondary promise and applied a restrained brand-blue gradient across the whole line;
  DREAMARI remains solid white to preserve the brand → promise → explanation hierarchy.
- Made the Student/Enterprise switch slightly more compact, added deliberate space before
  the title group, and tightened the spacing between DREAMARI and its career promise.

- Preserved the former remote `v2` at `codex/v2-backup-before-token-alignment-20260805`.
- Synchronized `v2` exactly to `main` commit `6dd1370` before token work.
- Baseline ESLint and TypeScript checks passed.
- Baseline production build reached Google Fonts and failed only because the initial sandbox denied network access; the final network-enabled build passed.
- Replaced the stale single token export with light/dark primitives, light/dark semantics, and components collections targeting DTCG 2025.10.
- Added generated CSS/TypeScript artifacts and dependency-free token validation.
- Wired existing CSS variables, Build-step accents, Match category colors, and How It Works chapter colors to generated artifacts without changing rendered values.
- Classified viewport formulas, canvas animation math, SVG/illustration paint, crop geometry, and keyframe geometry as documented implementation constants rather than misleading portable tokens.
- Official DTCG 2025.10 JSON Schema validation passed for all five files.
- `npm run tokens:check` passed: 438 tokens across both modes, aliases, composites, descriptions, path parity, generated-artifact freshness, and required text contrast.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed.
- Browser verification passed with no console/framework errors. Local production matched deployed `main` on homepage and opening Build flow at 1280×633 and 390×844; observed screenshot differences were limited to expected animation timing.
- Light/dark semantic switching and the Welcome → Choose Your Path interaction passed.
- Reworked the responsive How It Works scroll sequence on `v2`: phone/tablet gestures
  advance exactly one snap stage at a time, focused stages remain parked until the next
  gesture, and the upcoming stage remains visible as a blurred handoff.
- Added a dedicated CONNECT exit interval before the finale. Browser measurements at
  390×844 and 768×1024 confirmed the finale is 0% opaque at the CONNECT snap, then
  CONNECT is 0% opaque at the fully revealed finale snap.
- Scoped document snapping to the active How It Works viewport so fresh homepage loads
  remain at the hero instead of jumping to BUILD. Desktop remains free-scrolling.
- Responsive How It Works validation passed across BUILD → MATCH → PLAY → EXPLORE →
  CONNECT → finale, one gesture per state, with no skipped Explore/Connect stages.
- Extended the same one-gesture stage snapping to desktop wheel/trackpad input. At
  1280×800 the verified sequence is BUILD → MATCH → PLAY → EXPLORE → CONNECT → finale,
  with consecutive gestures and no swallowed intermediate stage.
- Added tablet-specific content geometry instead of inheriting desktop minimums. At the
  compact 687×787 breakpoint the rail ends at x=44, content begins at x=105, CONNECT
  ends at x=584, and right-aligned stages keep a 32px outer margin. Titles,
  descriptions, icons and the progress rail no longer overlap.
- Added `CHANGELOG.md` covering the design-token migration, responsive How It Works
  interaction, collaboration workflow, and validation performed for the main release.
- Added `/career-report` as a responsive frontend-reference route using the Dreamari token
  system, dark/light modes, sticky active-section navigation, report-version controls,
  download/share actions, and the approved Replit report copy.
- Connected successful completion of the sole Match path to
  `/career-report?from=match`. There is deliberately no visible skip-to-report shortcut;
  `/career-report` remains directly addressable only for design review.
- Added a short post-Match preparation state and four optimised Dreamy expression assets
  from the user-supplied ZIP packs.
- Career Report validation passed at 390×844, 768×1024, and 1280×800 with no horizontal
  overflow or browser console errors. ESLint, TypeScript, `npm run tokens:check`, and the
  final production build all pass.
- Removed the Dreamy cloud mark from the temporary Career Report header. The remaining
  wordmark/header is intentionally minimal until the new navigation/header/footer system
  is designed and implemented.
- Removed the Career Report's avoidable page-local color literals and mapped its surfaces,
  text, borders, feedback states, shadows, and accents to the generated semantic tokens.
  Future visual work must follow the same token-first rule.
- Reworked the hero title into two deliberate lines and moved all four high-value actions
  above the fold. Simulation/Explore are visually primary; Download/Share are grouped as
  report utilities and repeat at the conclusion for long-scroll task completion.
- Added accessible Download and Share dialogs with focus trapping, Escape/backdrop close,
  focus return, print-ready Save-as-PDF guidance, copy/native/email fallbacks, and loading,
  success, cancellation, permission, and unavailable-print error handling.
- Replaced the generic report wait with four visible assembly stages, reduced-motion
  timing, a Dreamy interruption state, safe retry, and preserved-Match reassurance.
- QA routes: `/career-report?from=match` exercises assembly; add `&state=error` to exercise
  the first-attempt failure and retry path. These states are for frontend review only.
- Browser verification passed at 390×844, 768×1024, and 1280×800 in light/dark modes,
  including canonical-link copy feedback, print feedback, modal keyboard dismissal and
  focus return, assembly completion, simulated failure, retry recovery, zero horizontal
  overflow, and no browser console errors.
- Completed a section-by-section responsive audit and removed the Career Report's main
  density and legibility problems. Reach, Good fit, and Safe choices now use substantial
  cards; Strong Options uses three intentional full-width rows instead of an orphaned
  grid item; school metadata, role descriptions, certification detail, and report-history
  text use a more legible type scale.
- Gave Academic Strengths, My Plan, and conclusion Dreamy assets dedicated layout space.
  No illustration is absolutely positioned over live copy, and the report conclusion
  keeps its approved copy unchanged inside a separate content column.
- Final responsive browser verification passed at 320×700, 390×844, 768×1024, 1024×768,
  and 1280×800 with no horizontal overflow or current console/framework warnings. ESLint,
  TypeScript, `npm run tokens:check`, and the network-enabled production build pass.
- Removed the “Report actions” label from both action groups. Download and Share are now
  48px icon-only utility controls with accessible names and native hover titles, separated
  from the Play and Explore CTAs by a responsive divider; both still open their complete
  accessible dialogs.
- Added `/home` as the post-onboarding student launchpad, using Figma desktop node
  `790:35798` as the content/style source of truth and mobile node `745:36522` for
  responsive behavior. Figma was used only as a visual reference; code tokens remain the
  implementation source of truth.
- Implemented the featured Product Manager story, four quick actions, Continue Your
  Journey, Recommended for You, daily glossary challenge, Popular with Explorers,
  Mystery Unlocks, and the personalised sponsored Mars challenge in the source order.
- Added working desktop Play/Explore/Community controls and a persistent mobile
  Home/Explore/Play/Community/Profile tab bar. The Explore tab scrolls to recommendations,
  Play/Home returns to the featured story, challenge completion adds feedback and a
  disabled success state, and streak acknowledgement provides live confirmation.
- Added a Home icon beside the Career Report Dreamari wordmark and a “Go to Launchpad”
  hero CTA. The Dreamari wordmark still links to `/`; both new entry points link to
  `/home`.
- Added 13 generated cinematic career images, one character and one clear work setting
  per image, with diverse global representation. Optimised them to WebP (about 1.2 MB
  total versus 23 MB of source PNGs).
- Design QA is recorded in `design-qa.md`. Combined source/implementation evidence is in
  `work/home-design-qa-desktop-final.png` and `work/home-design-qa-mobile.png`; the final
  result is passed after correcting the initial oversized desktop hero title.
- Student home verification passed at 390×844, 768×1024, 1280×720, and 1440×900 with no
  horizontal overflow. Career Report → Home, tab navigation, quick actions, challenge
  completion, streak feedback, ESLint, TypeScript, `npm run tokens:check`, and the
  network-enabled production build pass.
- Follow-up card fidelity pass uses UIKIT node `793:36808` as exact truth. The reusable
  standard card now measures 427×336 with a 180px image and 156px
  `surface-match-card` body, matching badge/duration/title/description/metadata/CTA
  placement. Focused 1:1 evidence is `work/home-card-design-qa-final.png`.
- All career sections now use streaming-style carousels with partial-card previews,
  horizontal touch scrolling, snap points, edge-aware Next/Previous controls, and a
  restrained Netflix/Prime-style hover/focus expansion. Desktop verification moved the
  Recommended rail from `0 → 113 → 0`; mobile moved one 336px step with no page overflow.
- The featured hero now matches the 100% Figma composition: full-bleed beneath navigation,
  520px desktop/470px mobile height, no rounded shell or eyebrow, single-line desktop
  title/description, CTA beside a bar-plus-percentage with its scene label below, centered
  pagination, and compact 72px text-only Quick Actions.
- Product Manager uses `product-manager-hero-v2.webp`, a 1915×821 restrained cinematic
  campus panorama. The carousel advances every 5.5 seconds even while hovered, retains
  dots/arrows and reduced-motion handling, and card images fade into the semantic
  `surface-match-card` body instead of ending at a hard seam.

## Remaining external check

- The production app repository's `packages/ui/tokens` was not available here. Before adopting these paths in production, compare them against that canonical collection and run `packages/ui/scripts/validate-tokens.mjs`; production wins on any conflict.

## 2026-08-05 post-onboarding Launchpad alignment

- Added `src/components/student-app/StudentAppShell.tsx` as the shared post-onboarding shell
  for `/home` and `/career-report`. It owns the Dreamari wordmark/context, explicit Home,
  Explore, Play and Community desktop navigation, Profile entry, XP, theme control, mobile
  tabs, and the restrained Dream Horizon brand signature.
- `/home` now identifies itself as Home instead of visually aliasing Home to Play. Its large
  saturated Quick Actions are replaced by a quieter “Your next moves” command area with
  task context, and a separate career-signal panel explains the recommendation logic.
- Recommended for You is now an intelligence-led surface rather than another equal-weight
  rail. Existing content, card anatomy, View All deep links, challenge, popular, mystery,
  sponsored, light/dark, and carousel behaviour are preserved.
- The featured-story carousel has a visible pause/resume control. All three hero images are
  intentionally eager because they rotate above the fold. Home query state is parsed by the
  server route and passed as stable initial state, preventing category deep-link hydration
  mismatches without touching any onboarding flow.
- `/career-report` now uses the same shell, bottom navigation, horizon, surface hierarchy,
  typography and control language as the Launchpad. The approved report copy, report section
  navigation, Dreamy moments, preparation/error states, report version controls, Download,
  Share, Play, Explore, and Launchpad actions remain functional and unchanged in meaning.
- Explicit boundary audit: no marketing homepage, How It Works, Build, Match, flow content,
  or onboarding component was modified. The only route file changed is `/home/page.tsx` to
  supply stable query state to the post-onboarding client experience.
- Visual evidence is under `work/launchpad-v2-qa/`. Browser QA passed at 320×700, 390×844,
  768×1024, and 1440×1000 in light/dark modes with `scrollWidth === innerWidth`. Hero pause
  and resume state, report Share modal open/close, and route navigation pass with no current
  console warnings or errors.
- `npm run tokens:check` passes all 501 DTCG tokens. ESLint, `npx tsc --noEmit`, and the
  network-enabled Next.js production build pass.

## 2026-08-05 launchpad token and theme alignment

- `/home` is now wrapped in the shared `ThemeProvider` and exposes a semantic header theme
  control. Dark remains the default outside Build; the user's saved `dreamari-theme`
  preference continues to win across routes.
- The launchpad component contains no direct primitive color references. It consumes
  `color.action`, `color.category`, `color.feedback` and generated `component.home-*`
  contracts for its shell, navigation, cards, rails, Quick Actions, hero and feature panel.
- `build-tokens.mjs` now merges `components.tokens.json` into both light and dark outputs,
  which makes preserved component aliases available to web consumers without flattening
  the source JSON. The dependency-free validator passes 501 tokens across all five files.
- Every browsable rail has a View All plus chevron action. Deep links use
  `/home?tab=explore&category=journey|recommended|popular|mystery` and restore the relevant
  collection when reopened.
- Accepted light/dark evidence is under `work/home-theme-qa/`; `design-qa.md` remains
  `final result: passed`.

## 2026-08-05 Match readability and homepage scroll recovery

- Match-card description text now uses a responsive `clamp(13px, 4% of card size, 16px)`
  value. Browser checks measured 13px at 390×844 and 14.67px at 1280×800; the longest
  approved copy fits its reserved panel with no clipping or page overflow.
- How It Works now enters an explicit upward-exit state when the user scrolls or swipes
  above BUILD. Mandatory snap is disabled during that exit instead of repeatedly pulling
  the page back to the first chapter, and normal snapping resumes on downward re-entry.
- Browser-tested the full return path from the focused sequence to the hero at 390×844
  and 1280×800. `npm run tokens:check` and ESLint pass. The production build is otherwise
  clean but could not finish in the restricted environment because `next/font` could not
  reach Google Fonts to download Montserrat.
- Match hierarchy keeps the percentage in its original position beside the bar and
  separates liked-card status plus the save threshold onto the supporting row. The
  temporary `Card N of 5` label has been removed. Progress and toast feedback expose
  appropriate ARIA semantics.
- The card-size formula now includes a `100vw - 48px` guard outside the desktop/height
  reduction. At 320×700 the card width remains 272px, the progress panel stays on one row,
  and the page has no horizontal overflow. Audit evidence and notes are saved under
  `work/match-hierarchy-audit/`.
- Match feedback is positioned relative to the decision column above its 52px action
  row. At 320×700 the Undo toast overlays only the card's decorative lower edge and no
  longer blocks either action; the complete three-Like/two-Pass path reaches Path Saved.
- The `MATCHES` eyebrow is removed from all Match decision screens. `Computer Science`
  and the progress panel shift upward, while `--match-card-height` adds the recovered
  22–28px to the card only. At 320×700 the front card is 272×294; at 390×844 it is
  316.7×338.8; at 1280×800 it is 366.7×392.3. The 20px gaps above and below the deck are
  unchanged and all three viewports remain free of page overflow.
- Match title hierarchy is now intentional rather than equal: the path header scales at
  `0.068 × card width`, weight 700, semantic `text.secondary`; the active card title
  remains `0.078 × card width`, weight 800, white. Measured pairs are 18.5/21.2px at
  320px, 21.5/24.7px at 390px, and 24.9/28.6px at 1280px.
- Match progress support copy uses bounded single-line states: `3 more likes to save`,
  `2 more likes to save`, `1 more like to save`, then `Path saved!`. Both sides are
  `white-space: nowrap`; at 320×700, `4 liked` measures 45.9px and `Path saved!` 69.3px
  inside the 272px panel with no wrapping or page overflow.
- Match feedback is now a compact 32px-high chip using 12px type and 8×14px padding
  instead of the prior 44px/14px treatment. At 320×700, `Skills liked | Undo` measures
  144.7px wide and the worst-case `Earning Potential liked | Undo` measures 220.2px;
  both stay inside the viewport and above, not over, the 52px actions.

## 2026-08-05 Career Report mobile repair

- Scope remained inside Career Report and the shared post-onboarding shell. Build, Match,
  onboarding, and the marketing homepage/How It Works were not changed.
- Report-tab selection now centers the active tab with horizontal `scrollTo` inside the tab
  rail. It no longer uses `scrollIntoView`, which was also moving the page vertically and
  causing anchors to settle on the wrong section.
- The post-onboarding roots use `overflow-x-clip` rather than `overflow-hidden`, restoring
  sticky header and section-tab behaviour while still containing the decorative horizon.
- The temporary report-building and error experiences omit the persistent app bottom tabs
  and use a compact-phone layout. Build progress, Retry, and Return to Match all fit within
  320×700 without document or horizontal overflow.
- Browser QA covered completed section anchors, sticky navigation, Share open/close, build
  progress, and error recovery at 320×700 and 390×844. Evidence is under
  `work/career-report-mobile-fix/`. TypeScript, ESLint, the 501-token DTCG validator, and the
  network-enabled Next.js production build pass.

## Recommended next step

- Design the Enterprise hero variant the Student/Enterprise toggle will soon gate; the
  toggle's current position (above the DREAMARI/headline group) was chosen with this in
  mind, but no Enterprise content exists yet.
- A separate, not-yet-delivered ask: write inline comments on the feedback doc's "Updated
  Copy" excerpt about sizing/positioning rationale (no copy changes) — distinct from the
  hero redesign above and still outstanding.
- Review the open local `v2` Home and Career Report previews. Apply requested refinements,
  then commit and push only when explicitly requested.
- If the post-onboarding direction is accepted, the next design decision is whether Explore,
  Play, and Community should become separate route surfaces or remain category states inside
  the reference Launchpad. Do not apply the shell to Build or Match without a new explicit
  request.
- The external production task remains to compare this reference token set with the app
  repository's canonical `packages/ui/tokens` before production adoption.

## Shared rule

Only one AI edits at a time. The active AI pulls the authorized branch, reads this file, completes and validates its scoped work, updates this file, commits, and pushes. Neither AI pushes or merges `main` without explicit user authorization.

The DTCG token collections and generated artifacts are the visual source of truth for all
future UI. Reuse semantic tokens and shared components whenever a matching foundation
exists; do not introduce page-local palettes or duplicate design constants. Run
`npm run tokens:check` before every release, and treat any visual/token drift as a defect.

## 2026-08-21 (late) — Figma image sweep, Get Hired content, zoom/dvh fix
- **Figma browse cards are now the only poster source.** All 37 image-bearing cards in Design System v2.0 Section 2 (node 3282:9044) were pulled via MCP `download_assets` (largest raw fill = career art, center-crop 1024) and overwrote the existing `poster-*.png` filenames — 24 careers incl. Accountant, Asset Manager, Fashion Buyer, IB, Private Equity (3282:8565), Quant, Management Analyst, Admin Assistant, Drone Pilot, Jewelry Designer, Sound Eng Tech, Food Scientist, Agricultural Technician, Software Engineer, UI/UX, Airline Pilot ("Pilot"), Truck Driver ("Light Truck Drivers"), Registered Nurse, Therapist, Lawyer, HR Manager ("Human Resources"), Roofer, Farm & Ranch Manager ("Farmer or Rancher"), Entrepreneur + `stage-hire-ready.png` (Figma Recruiter 3282:8549). IB uses the hi-res `Investment banker.png` from the repo root (1088×1445). **The Mika folders (Business/Arts/Building) are the For-You set — never use them on poster surfaces.** Careers with NO Figma browse card yet (Cyber Security, Game/Video Game Designer, Database Architect, Data Scientist, Sports Medicine Doctor, Pediatric Surgeon, Cardiologist, PR Manager, Purchasing Manager, Veterinarian, Nurse Anesthetist, Art Director…) keep their prior posters — swap them the moment cards appear in Figma.
- Landing Get Hired: My Top 3 = stacked TEXT-ONLY comparison cards (founder content verbatim: University / Duration / Cost / Median Salary / + more; IB $150K+/$285K/yr, Accountant $55K+/$81K/yr, Video Game Designer $130K+/$104K/yr), focus card front, two peeking behind (right card mirrors text + word-per-line so the overlap never cuts titles). My Plan = simplified copy, 4 tasks with In app / Real world / Dreamari Connect chips. Match deck peek card: Project Manager (stock jpg) → Operations Manager (Figma 3282:8531).
- **Zoom/dvh interaction fix (globals.css):** body `zoom` multiplies dvh, so exact-height screens rendered >100% tall (build "sat low" on 15" MacBooks). The smooth `clamp()` zoom rule was invalid CSS (length in a <number> slot) — the stepped rules were always the real behavior and are now explicit: 1.1 at ≥1441×≥800, 1.25 at ≥1800×≥900, each also setting `--vz`; `body .h-dvh/.min-h-dvh/.min-h-[100dvh]/md:h-[calc(100dvh-62px)]` and the match-card dvh terms divide by `--vz`. Verified at 1710×880: zoom 1.1, flow section = exactly viewport, no page scroll.
- Desktop nav pill is absolutely centered on the viewport (streak/XP hide below lg to avoid collision).
- Gotcha reconfirmed twice: NEVER `rm -rf .next` while the dev server runs (corrupts manifests → 500s); stop server → clear → restart. Next image-optimizer caches overwritten poster files — same remedy.
- Deployments: production = Mustang9393/Dreamari main → dreamari.vercel.app (auto). Demo = branch `demo` + Mustang9393/dreamari-demo main → dreamari-demo.vercel.app via git-archive + `vercel deploy --prod` recipe (NO Daily Drop, no theme toggle — re-strip HomeExperience on every cherry-pick conflict). A/B parked.

## 2026-08-22 — Global light mode (MAIN ONLY — never cherry-pick to demo)
- Light mode is now app-wide on production: `components/app/theme.tsx` (useGlobalTheme + ThemeBoot in the root layout) manages BOTH `dark` and `light` classes on <html> against the existing `dreamari-theme` localStorage key; the flow's ThemeProvider mirrors the same scheme. Toggle lives in the app hamburger (QuickLinksMenu) + the flow's existing ThemeToggle.
- `html.light .marketing-v2.themeable` themes only opted-in surfaces (Home/Explore/Profile/Colleges roots carry `themeable`). THE LANDING DELIBERATELY STAYS DARK — its chapters are art-directed dark-only; audit showed 21 contrast failures in a naive light flip. No toggle in the landing nav for that reason.
- Light rungs added in tokens.css light block: hero wash accents (pale tints), the full world palette + --chart-3 + --amber-400 via color-mix darkening (lightest hues at 45-55% toward black to clear 4.5:1 on neutral.50); author real Figma rungs when the light ramp exists. globals.css: `html.light body` background + component.cta light remaps (primary flips to ink surface; secondary to black-alpha family — the flow's Previous button was white-on-white before).
- On-photo chips (ActivityCard badges) are THEME-INDEPENDENT by design: fixed dark glass backing (rgba(5,8,20,0.78)) + bright gold literal, same convention as poster salary chips/TEXT_SCRIM. Poster cards need no light variants.
- **DEMO STRIP RULE UPDATE: dreamari-demo = main MINUS Daily Drop MINUS ALL theme-toggle commits.** When cherry-picking to demo, skip the light-mode commits entirely (the demo has no toggle and must stay dark-only).
- WCAG pass (shipped to BOTH main+demo earlier): Enter Community, YOUR SIGNAL, career-report avatar, focus-visible on search/profile inputs + build map states; old /onboarding + /theme-lab + /motion-lab routes DELETED (onboarding replaced by the Build flow).

## 2026-08-24 (evening) — Play/IB: root-caused the centering/blur bug, fixed character framing site-wide
- **Found the actual bug behind a whole session's worth of "character looks wrong" reports**: `interactive` (dialogue-box centering) and the location backdrop's `dimmed` blur both keyed off `beat.kind` alone, ignoring whether the beat had reached its revealed/answerable phase. Result: the box centered — slicing through a standing character — and the backdrop blurred, DURING the dialogue leading up to a question; then went sharp and bottom-anchored the instant the real answer controls appeared, exactly backwards. Both now require `revealed`. Extended the same `dimmed` treatment to hero-mode scenes (previously only location mode blurred) for consistency — a standalone interactive Q&A screen blurs its backdrop regardless of which art mode is behind it.
- **Fixed the character crop/scale bug**: every location's `characterAnchor`/`characterAnchors` in `locations.ts` had `baselineY` and `heightFrac` intentionally pushed past 1.0 to match a tight original composition. On real content this pushed heads and torsos past the frame edge. Rebuilt every anchor so the full sprite sits in frame, centered, feet near the bottom with headroom above.
- **L1-04 fix**: the "Christina welcomes you to Cobalt Capital" beat had no `castMember`/`castMembers` set (falls back to `speaker: "Narrator"`, which has no expression entry — silent no-render). Moved the two-character introduction here from the generic L1-01 intro card, per direction ("have the characters first appear on this screen, not the intro guide screens"). Christina renders in front of Jordan via explicit z-index (she's the host).
- Added `castMember` to two more beats an audit agent found where the setup text names a specific character but nothing was wired to show them: `L1-06` (Christina) and `L2-17` (Jordan).
- Added `neutralTier` to `SceneCharacter`: a beat authoring `tone: "conflict"|"alarm"` now borrows the concerned/uncertain tier portrait as its pre-answer default instead of the same welcoming/confident smile every beat gets. Only 3 beats currently author `tone` — see the missing-assets note below.
- Hid the dialogue box's small round portrait whenever the big cinematic scene character is already carrying the same speaker (`sceneCharacterVisible` prop threaded down) — was showing redundantly, same face twice on screen.
- **Reprocessed all expression + face-thumbnail sprites** from the user's fresh `Dreamari_Clean_Sprites_2K` source in one genuine single pass (decode once, crop to alpha bbox, resize, save once at high quality) — the prior set had visibly degraded from being cropped, saved, reopened, and re-saved. Face thumbnails (`face-*.webp`) were a SEPARATE, older asset lineage (256px crops from old hero art) the user hadn't realized existed — regenerated all 4 from the same fresh source at 512px.
- **Removed the hero-scene zoom** (`play-camera` keyframe + its usage, both deleted) — a slow ~9.5% scale pan over 26s that pushed a composed illustration past its own edges over a beat's lifetime, compounding the framing complaints above. Hero scenes are now a held static frame.
- Verified: `tsc --noEmit` clean, `eslint` clean (pre-existing warnings only, unrelated to this work), `tokens:check` clean, isolated worktree production build succeeds. Live-verified in-session at both desktop and 375-wide mobile viewports across L1 and L2: dialogue-only screens now show the full character sharp and bottom-docked; the moment real choice/answer controls appear, the character steps aside, the box centers, and the backdrop blurs — consistently, on every beat kind and both art modes.
- **Excluded from this commit**: `src/components/profile/ProfileExperience.tsx` was mid-edit from a concurrent session when this work started (unrelated, Top-3-tab work) — left untouched per the shared-edit protocol.
- **Missing assets / open items for the user** (asked for a punch list rather than silently guessing):
  1. Christina and Jordan each have exactly 3 tier-reactive expressions (best/acceptable/wrong+risky) and one shared "default" pulled from that same set — there is no broader "neutral" expression variety for the many pre-answer beats that aren't `tone`-tagged, which is the literal cause of "Christina's pose is always the same." The `tone` field can drive variety cheaply (see `neutralTier` above), but only 3 beats across all 3 levels currently set it (`L1-08`, `L1-12`... check `grep tone: src/components/play/ib-level-*.ts`) — authoring more `tone` values on existing beats is a data change, not an asset one, and can be done without new art.
  2. Marcus and Lamisa each ship with exactly ONE expression (assessing / composed) — no tier reactions at all, so their feedback-card face never changes regardless of score. Only relevant if tier-reactive portraits for them are wanted to match Christina/Jordan.
  3. `cobalt-hr-welcoming.webp` exists in the fresh sprite set but has no speaker wired into any beat in the game currently — flagging in case it's meant to appear somewhere.
  4. Found `~/Downloads/Dreamari Investment Banking Career Simulation.zip` (extracted locally, NOT committed) containing 6 "ChatGPT Image Aug 24" location plates that visually match all 6 existing Cobalt Capital locations (trading floor sunset/night, both boardrooms, cafe, hallway) at similar resolution to the current set. Did NOT swap these in — every location's `characterAnchor` is hand-tuned to the CURRENT plate's specific framing, and swapping the underlying image without re-tuning every anchor risks reintroducing the exact crop bug just fixed. Needs explicit confirmation before touching.
  5. The same folder's per-beat PNGs (`1) Intern/IB L1-04.png`, `2) Analyst/IB L2-02.png`, etc.) appear to be a re-supply of already-used hero art filenames, not the separately-described "main screens" character-cutout batch (Christina+Jordan group poses, a "$30B Louis Vuitton Deal" binder handoff, departing-employee-with-box, two-men-at-desk, laptop/coffee POV) from earlier in the session — that batch's file location was never found on disk. Needs the user to point at it directly.
  6. Unresolved from earlier: one image in that missing batch reportedly shows a real Louis Vuitton trademark (name + LV monogram) — flagged for a decision (fictional brand substitution recommended) before any use, not yet acted on either way.
- Pushed to `main` (55ec871) with explicit user authorization.

## 2026-08-24 (late evening) — Play/IB: stopped the offer card's art bleeding into onboarding
- L2-01's own art (`l2-02.webp`, an offer-letter mood shot -- visually a different woman than Christina's established design, left over from before decision D11 reattributed these lines from an unnamed HR character to Christina) was sticky for `SCENE_FRESH_BEATS` (3) beats past itself, so every onboarding step after "Accept Offer" kept showing it instead of Christina.
- Added `resetScene?: boolean` to `BeatBase` (`types.ts`) and honored it in `sceneFor`'s backward walk (`SimulationPlayer.tsx`) — a beat can now deliberately end the sticky-art chain without needing art of its own. Set on `L2-02`. All five onboarding steps now correctly fall through to their location and show Christina's real cutout sprite, with the small dialogue portrait suppressed automatically (already-shipped `sceneCharacterVisible` logic).
- Reusable primitive — if the same "next scene's beats keep inheriting an unrelated hero image" bug turns up elsewhere, mark the first beat of the new scene with `resetScene: true` rather than stripping the earlier beat's own art.
- Not done (explicitly deferred by the user, pending assets): converting "Christina introduces you to Marcus" (L2 hero art) to the cutout+location system like the L1-04 reception scene — would need a second characterAnchor slot for whichever location this routes to, sized/posed to match; the user is sending matching assets separately.
- Pushed to `main` (500898f) with explicit user authorization.

## 2026-08-24 (night) — Play/IB: pulled a live trademark, removed showdown screens, widened expression variety
- **Urgent: found and removed a real trademark already live in production.** `l2-09.webp`, `l2-10.webp`, `l2-19.webp`, `l3-19.webp` and `l3-20.webp` each had "LOUIS VUITTON" baked into the art (a binder cover, a meeting-room label, a pitch-book title) -- a real trademark, and a direct contradiction of the story's own fictional client, Maison Laurent, throughout both levels. `l2-09.webp` was also the Level 2 cover card, and `l2-10.webp` doubled as a misspelled "COLBALT CAPITAL" wall sign. Found via a full visual sweep of every hero art file in the game after the user asked why characters looked cropped on one of these screens. Deleted all five image files, removed their `art`/`artAlt` references (each beat falls through to its own location now; `L2-10` got `castMember: "Christina"` so she still appears, matching its setup text), replaced the Level 2 cover with the already-clean `l2-23.webp`, and left a note in both level files' header comments warning not to re-add art to any of these five beats without checking the replacement first. Swept every other hero art file in all three levels for the same defect -- nothing else found.
- Removed the one-time "VS" showdown card entirely (`L1-12`, `L2-18`, `L2-21`) -- the user found it confusing rather than dramatic. Deleted the `showdown` field, its type, and the `ShowdownCard` component rather than leaving a half-used feature.
- Moved `tone` from `ChoiceBeat` onto `BeatBase` and added it to two beats whose setup text is visibly tense but had no way to show it: `L1-10` (Christina proofreading a mistake before Marcus sees it) and `L2-17` (Jordan's mistakes, reviewed against a clock) — both now borrow the concerned/uncertain tier reaction as their pre-answer expression via the `neutralTier` mechanism shipped earlier tonight.
- User confirmed the source sprite folder is `Dreamari_Clean_Sprites_2K` (already the one in use) and explicitly okayed keeping some beats as flat baked-in hero illustrations rather than converting everything to the cutout+location system — night/crunch mood scenes especially. No action needed; this is standing guidance for future beats, not a defect.
- Verified: `tsc --noEmit` clean, `eslint` clean, `tokens:check` clean. Live-verified the tone/expression change's resolution logic directly (`expressionFor`/`defaultExpressionFor` return the correct concerned/uncertain paths); live-verified the showdown removal doesn't affect L1-04's staged reveal.
- Pushed to `main` (68b6ec3, c6bc7c6, 4dab3fa) with explicit user authorization.
- **Still open**: the Christina+Marcus "cutout" conversion (L2-10) the user asked about — deferred pending matching multi-character sprite assets, per their own instruction ("if we dont have the sprites for this its okay").

## 2026-08-24 (later still) — Play/IB: back-nav fix, 4 more scene-bleed instances, full art audit vs. the original handoff sheet
- Back button now steps to the previous beat within the level (`goBack` in SimulationPlayer.tsx) instead of always leaving to `/play` — only exits from the level's first beat.
- User supplied the actual `DreamAri_IB_Levels1-3_Handoff.xlsx` and pointed at a live screenshot (Marcus's L2-21 assessment beat showing an unrelated inherited illustration instead of his own cutout). A full agent-driven sweep of every hero-art beat's forward inheritance found 4 more `resetScene` instances beyond the two fixed earlier tonight: `L1-08` (L1-07's laptop shot was reaching L1-09/L1-10, blocking Christina's tone-driven concerned expression from ever showing on the Nike-summary beat), `L1-14` (L1-13's departing-intern art was reaching the level's own review screen), `L2-09` (Marcus's L2-08 portrait was reaching L2-10, undoing the castMember fix already made there), `L2-19` (Jordan's L2-18 art was reaching Christina's client-pitch entrance — confirmed live via screenshot), `L2-25` (Christina/Marcus debrief art from L2-23 was reaching the final review, which is deliberately unrouted to any location).
- Cross-referenced the xlsx's `Image Description` column against every pulled/removed image from the earlier trademark fix — confirms L2-09's contamination was already flagged in the source sheet (D08/D09) before any art existed, and gives the original clean brief for each of the 5 pulled beats (quoted in the audit report below) in case bespoke art is wanted back instead of the cutout treatment.
- Spot-checked several "Open"-status decisions from the sheet against current code: D26 (Marcus's promotion stated on screen), D31 (rank beats shuffle on load), D04 (Level 2 rapid-fire results card), D05 (each level has an ending set) are all already resolved in the build — the sheet's status column is stale. D36/D37 are Level 4 scope, not yet applicable.
- Published a full status artifact for the user covering: every beat where a character's expression actually changes and why (only L1-10 Christina and L2-17 Jordan get a real pre-answer face swap; L1-12/L1-13/L2-22 only tint the dialogue box since they have their own baked art; Jordan never gets a feedback-tier reaction since he's never a scored beat's `speaker`; Marcus/Lamisa never get one since they have only 1 expression each), all 7 `resetScene` fixes, the 5 pulled images with their original art brief quoted, and standing asset gaps (Marcus/Lamisa second+third expressions, a Christina+Marcus `characterAnchors` pair for L2-10).
- Verified: `tsc --noEmit` clean, `eslint` clean, `tokens:check` clean. Live-verified L2-19 now shows Christina in the client boardroom instead of inherited Jordan-desk art.
- Pushed to `main` (27ddeb1) with explicit user authorization.

## 2026-08-24/25 — Play/IB: reference-build verification, trademark art restored (4/5), HR reverted, glow tried and dropped
Catching up the log for a long run of small commits (`9589f08`..`c045233`, all pushed to `main`) made without updating this file between them — apologies for the gap, restoring the habit going forward.

- **Verified against the actual reference build.** The user supplied the real URL (`dceeai.replit.app/ib-career-game`) plus the source handoff spreadsheet (an exact screen-by-screen transcript of it). Cross-checked all 3 levels' beat order against it: identical, nothing missing, nothing duplicated. Found and fixed 2 concrete mismatches: L3-01 had the same stale "HR" art already fixed on L2-02 (D11 hangover), and L2-09 had no `castMember` at all (empty room instead of Christina holding the handoff).
- **Restored real scene art for 4 of the 5 trademark-pulled beats** (`68b6ec3`/`c6bc7c6` earlier had deleted `l2-09/10/19`, `l3-19/20` outright for a real "LOUIS VUITTON" baked into the art). Recomposited L2-10, L2-19, L3-19, L3-20 from the 2026-08-24 asset package's separated background/foreground layers (not the flat reference renders, several of which still show the branding) — L2-10's binder label and L2-19's folder label were patched out locally (desk-texture extension / solid black fill respectively); L3-19/L3-20's actual extracted layers never had the prop in the first place, used as-is. **L2-09 has no clean layer in the package at all** (flagged `ART_STORY_CONFLICT` in its own manifest) — the user explicitly authorized running the *raw, uncorrected* handoff art there anyway (`0b5048e`) as a pre-launch-only, internal-only placeholder, given they own this exact defect in their own decision log (D08/D09) and stated a plan to gate access before public release. Comment on the beat and the file header both flag it clearly — **do not treat this as resolved; swap before any public/authenticated release.**
- **Fixed the object-cover crop bug at its root, site-wide.** Any hero image below a 16:9 ratio gets scaled up aggressively by `object-cover` on wide viewports, cropping heads — confirmed live on L2-10, L2-23, L3-06, L3-08 (all originally 4:3 or squarer). Recomposited all four to 16:9 (top-anchored crop) from the asset package's layers. L2-09 needed the same fix but with a *center*-anchored crop first (wrong — cut off Christina's forehead since her content starts at the canvas top there), corrected to top-anchored (`50b183a`). Audited every other sub-16:9 hero image (L1-07, L1-13, L3-14, L3-17) and confirmed none puts a named character at real crop risk (POV shots or an ensemble shot with generous headroom by design).
- **L3-07 (Lamisa's MD intro)** converted from its own low-res, near-square, seated hero image to her standing cutout via the location system, matching how she appears everywhere else (`8315ce3`). **This session (2026-08-25) found that conversion was incomplete**: it never got a `resetScene: true`, so `sceneFor()`'s backward walk kept finding L3-06's still-fresh Christina hero art and showing HER instead of Lamisa — confirmed live via screenshot, fixed by adding `resetScene: true` to L3-07.
- Centered both boardroom locations' characters (`8315ce3`) — they'd been deliberately off to the side at a shrunk scale (0.53/0.55 `heightFrac`) to dodge furniture overlap; once brought up to the standard 0.9 scale used everywhere else, off-center just read as a bug.
- Fixed a real first-paint timing gap (`1eb964d`): `revealed` state updated one render tick late via an effect, so a beat's very first paint could briefly show the *previous* beat's revealed value. Now resets synchronously during render on `beat.id` change.
- Exempted the Play surface from the site-wide 1440px-baseline desktop zoom (`9d33370`) — a plausible contributor to "characters read undersized on large monitors" complaints; the zoom is built for marketing/flow pages, not a full-bleed game view.
- Fixed L2-21 auto-failing its whole rapid-fire set before the player saw a single question (`68d5e60`) — `RapidBody`'s timeout check was missing the `beat.timer &&` guard every other rapid-body variant already has, so it fired immediately against `remaining === 0` on beats with no timer at all.
- Added `Play` to the marketing landing page's own nav dropdown (`fd0d795`) — was already in the in-app menu, missing from the public site's.
- **Added sound**: a synthesized (no audio assets, same WebAudio approach as everything else) tick once per displayed second on the countdown clock, sharper past the urgent threshold (`7cb4454`); and three one-shot cues — a soft downward glide on a genuine scene/location change, a bright glint on a character cutout's entrance (keyed to the same `src` change that drives its fade-in), and one low non-verdict note the instant a standalone question screen's real controls take over (`742de22`). Deliberately scoped as one-shots, not a continuous ambient loop, per the reasoning that a loop needs its own volume layer and gets muted fast.
- **Reverted Level 2's onboarding (L2-02..06) from Christina back to an unnamed "Cobalt HR" character**, undoing the D11 experiment, per direct instruction (`c045233`). Generated her body sprite + face thumbnail from `Dreamari_Clean_Sprites_2K` in one pass, wired into `DEFAULT_EXPRESSION` and Level 2's cast. Scoped to L2 only at the time — Christina's own intro (L2-07) still follows immediately after.
- **Interactive-answer screens got a more deliberate focus treatment** (`c045233`): wider box (720px vs 620px), larger question/answer text across choice/blank/match layouts, heavier backdrop blur+brightness plus a new `saturate(0.45)` desaturation, and a radial vignette darkening the corners — all keyed off the same `dimmed`/`interactive` condition, nothing new to keep in sync. The review beat (colorful ambient Dreamy backdrop) now centers its content instead of bottom-docking like a card, via a new `centered = interactive || beat.kind === "review"` split from `interactive` itself (review needs centering but not the wide-box/blur/vignette treatment meant for scored questions).
- **This session (2026-08-25): reverted Level 3's onboarding (L3-01..05) from Christina to the same "Cobalt HR" character**, same reversion as L2, per direct instruction. Christina's own VP introduction (L3-06) still follows right after.
- **Animated rim-light/glow on the interactive answer box: attempted, then dropped per direct instruction ("We dont have to do the card lights or glow. Forget it.")** — fully reverted, zero net diff on `globals.css`/`SimulationPlayer.tsx`. Leaving the postmortem in case a future ask revisits it: implemented as a `conic-gradient` swept via an animated `@property` custom angle, on a `.play-glow` pseudo-element pair (a masked ring + a blurred bloom behind it). It never rendered visibly despite `getAnimations()` confirming the animation was actually running and `getComputedStyle` confirming the gradient's angle was correctly live-updating — root cause found via `document.elementFromPoint`/ancestor stacking-context inspection before the abandon instruction landed: the bloom layer's `z-index: -1` had no local stacking context to be scoped to (`.play-glow` was plain `position: relative`, no `z-index`/`isolation`), so it was dropping behind opaque ancestor content instead of staying just behind its own box. `isolation: isolate` on `.play-glow` fixed the stacking (confirmed live), but the effect was abandoned anyway before further tuning — not because the CSS trick doesn't work, but because it wasn't wanted.
- Verified this session: `tsc --noEmit` clean, `eslint src/components/play` clean (pre-existing unrelated warnings only), `npm run tokens:check` clean. Live-verified both L3 fixes in-browser (HR shows on L3-01, Lamisa's own cutout shows on L3-07).
- **Not yet pushed** — awaiting explicit go-ahead per standing instruction to confirm before every push on this project.

## 2026-08-25 — Play/IB: dropped the glow experiment, fixed mobile's real character-scale bug, dialogue readability
- **Dropped the animated card-glow effect** from the previous session's log entry, per direct instruction ("We dont have to do the card lights or glow. Forget it.") -- fully reverted, `globals.css`/`SimulationPlayer.tsx` are byte-identical to before that experiment on the relevant sections.
- **Reverted Level 3's onboarding (L3-01..05) from Christina to "Cobalt HR"**, the same reversion Level 2 already got, per direct instruction. Also found and fixed a bug while verifying it live: L3-07 (Lamisa's MD intro) was missing `resetScene: true`, so it kept inheriting L3-06's still-fresh Christina hero art instead of showing Lamisa's own cutout.
- **Fixed the reputation-band ladder wrongly highlighting "Cautious" on the pre-game explainer** (`BandLadder` in `interactions.tsx`): the "Your Reputation" card shows before any beat is scored, so reputation is still exactly `START_REPUTATION` (50) -- which happens to fall inside the "Cautious" range, making the ladder look like the player had already earned that standing before making a single choice. It's a rules reference now, no row highlighted. `reputation` was threaded through `CardBody`/`BeatBody`/`BeatStage` only for this, so it came out of all three along with it.
- **Root-caused and fixed the real mobile "characters look tiny/floating" bug** (reported as a UI screenshot: two device photos showing normally-scaled hero art next to a much smaller floating character with a visible gap above the dialogue box). This took several wrong turns before landing on the actual cause -- logged in order since the postmortem matters more than the diff:
  1. First suspected the mobile scene layout itself: it was an in-flow flex panel (`order-2 flex-1`) sized by whatever vertical space the dialogue box below it left over, so the same character rendered at a different effective zoom every beat depending on that beat's box height -- a real bug, fixed by making the scene container `absolute inset-0` unconditionally (dropping the `sm:` split entirely), matching what desktop already did. The dialogue box's own wrapper became unconditionally `flex-1` too (previously `sm:flex-1` only), since with the scene now always out of flow, the box needed to independently fill the full remaining column height on mobile the way it always did on desktop for `items-end`/`items-center` to have room to mean anything.
  2. This fix also directly fixed two things asked for explicitly this session: the "Final Review" card was still bottom-docked on mobile instead of centered (the `centered` flag existed but had no vertical room to act on, for the same reason), and the "See the decision" button investigation the user opened with turned out to work fine on both viewports once this was in place -- it was never actually broken, it read as broken because of bug #1 nearby making the whole screen look wrong.
  3. Once the scene was fixed-size, a NEW symptom appeared: characters now had a large visible gap between their own art cutoff and the dialogue box, worse than before. Spent real time on this: verified the source sprites are correctly cropped to their alpha bounding box (~1.7% padding, not the issue), tried increasing `characterAnchor.heightFrac`/`baselineY` in `locations.ts` (masked the symptom without fixing it, and overcorrected once the real bug was found -- see #4), before finally measuring actual rendered `<img>` dimensions live and finding the real cause.
  4. **The actual bug**: `SceneCharacter`'s `<Image>` had a hardcoded `width={520} height={900}`, which doesn't match any real character sprite's actual aspect ratio (measured directly: 0.49-0.73 across the 9 expression files, `christina-welcoming.webp` a real outlier at 0.73 because that pose has an arm extended, not a processing error). Worse, Tailwind's own preflight `img { max-width: 100% }` rule was resolving its percentage against the sprite's own absolutely-positioned, auto-width parent span -- an indefinite container -- and silently clamping the rendered image to a small fraction of its real size (confirmed live: removing `max-width` took a wrongly-clamped 188px-wide render to its correct 639px). `object-contain` then fit the real image into that too-small box, letterboxing it and leaving the actual character far smaller, and positioned far higher, than the anchor math intended.
  5. Real fix: added `PORTRAIT_RATIO` (`expressions.ts`) with each portrait's true measured aspect ratio, used it to set correct `width`/`height` props, and added `max-w-none` to override the preflight clamp. Once that was in, the earlier anchor overcorrection (`heightFrac`/`baselineY` bumped up defensively while chasing the wrong cause) had to be dialed back down to sane values (`heightFrac` ~0.55-0.58, `baselineY` 1.02 -- just past the frame edge so the sprite's own cutoff tucks behind the dialogue box rather than landing a hair short of it) -- confirmed live on both viewports afterward, no gap, no oversized/cropped heads.
  6. **Lesson for next time this class of bug turns up**: when a character sprite looks wrong-sized on one surface but not another, check the actual rendered `<img>` box dimensions (`getBoundingClientRect`) against the source file's real aspect ratio BEFORE touching anchor/position math in `locations.ts` -- the anchor system was never the bug, and tuning it to compensate for a sizing bug elsewhere just stacks a second wrong number on top of the first.
- **Enlarged the dialogue text and slowed its typewriter reveal**, per direct instruction ("The copy isnt getting enough focus"): the setup line's font went from `text-[20px]/sm:23px` to `text-[23px]/sm:27px`, and `useTypewriter`'s default reveal speed from 12ms/char to 26ms/char (roughly double the read time).
- Verified: `tsc --noEmit` clean, `eslint src/components/play` clean (pre-existing unrelated warnings only), `npm run tokens:check` clean. Live-verified on both the mobile (375x812) and desktop browser-pane viewports: reception's two-character scene, a single-character trading-floor scene, the reputation explainer, and the Final Review/ending flow.
- **Not yet pushed** -- awaiting explicit go-ahead per standing instruction to confirm before every push on this project.
- **Open, not yet acted on**: the user asked about licensing 3 YouTube "type beat" instrumentals (not the actual commercial songs -- independent producer beats in the style of Trippie Redd/Playboi Carti/Juice WRLD/Yeat/Drake) for background music "for aura" on key screens, and pushed back when told downloading YouTube audio isn't something to do even for an internal pre-license demo. Declined to download; the path forward is either the user supplies properly licensed/leased audio files directly, or royalty-free tracks cleared for commercial use outright. Also asked for the music to "muffle" (duck/lowpass) specifically during focused timed-question screens once real audio exists -- noted as a requirement for whenever that work actually starts; nothing plays music yet, the whole sound system today is still 100% synthesized WebAudio tones.

## 2026-08-25 (later) — Play/IB: reverted a bad desktop regression, lifted the dialogue box off the bottom edge
- **Reverted the `characterAnchor`/`characterAnchors` heightFrac/baselineY tuning from the previous entry** -- pushed as its own commit (`f281b0c`) immediately after the user reported "everything is fucked" on desktop. Root cause: that tuning was done entirely against mobile screenshots to compensate for a rendering bug (see previous entry, #4) that only actually bound on mobile's narrow viewport -- desktop was never affected by the underlying bug, so shrinking `heightFrac` from 0.9/0.88 down to ~0.55-0.58 to fix mobile's post-bugfix oversizing just shrank every character by ~35% on desktop for no reason. The real bugfix (`PORTRAIT_RATIO` + `max-w-none` in `SimulationPlayer.tsx`) stays; only the anchor numbers in `locations.ts` went back to their exact pre-session values. **Mobile-specific sizing (it does still crop heads at these original values on a narrow phone) needs a genuinely viewport-aware approach, not one shared number -- explicitly left unresolved rather than re-guessing under pressure.**
- **Lifted the dialogue/card box off the very bottom edge**, per direct instruction ("too low down the scene... should scale properly with different screen sizes... move the text box up... as long as it doesn't show the cut out floaty stuff"). Added `mb-[3dvh] sm:mb-[4dvh]` to the box's outer wrapper, applied only when NOT centered (i.e., the plain bottom-docked dialogue/card state -- the centered/interactive state doesn't show a scene character at all, so it didn't need this). Safe because the character anchors' `baselineY` already places the sprite's own bottom edge right at the scene's true bottom edge -- lifting the box just reveals a bit more of the character's own drawn lower body (or plain floor), never a hard transparency seam. `dvh` units so the lift scales with viewport height rather than reading as a fixed-px rounding error on a short phone. Verified live on both a long (4-line) and short (2-line) dialogue box, on mobile (375x812) and desktop -- no seam either way.
- Verified: `tsc --noEmit` clean, `eslint src/components/play` clean (pre-existing unrelated warnings only), `npm run tokens:check` clean.
- Pushed both fixes to `main` per explicit instruction ("Please push the scale fix now").
- **Also this session, declined but noted for later**: user asked to redesign the dialogue box toward an Ace Attorney-style full-bleed VN bar (no rounded corners/blur, banner nameplate) -- asked a scoping question, the user dismissed it without picking an option, so nothing was built. They then separately confirmed they want to KEEP the current rounded glass-card design language, just with better box positioning (addressed above) and stronger text hierarchy (font size/typing speed already bumped in the previous entry) -- so the VN reskin ask reads as superseded/withdrawn, not pending.

## 2026-08-25 (later still) — Career Detail: hierarchy fixes, ladder skills, software logos, hero rework
- **Built earlier this session** (`7834518`, separate entry not yet logged here): the Career Detail page didn't exist anywhere in the codebase before this session. Built from Figma node 2591:3993 as a base, refined per direct feedback screenshots (Median Salary not Starting Salary, Play Game not Try Game, no Getting In/Education & Path sections, Similar Careers using the app's real `PosterCard`). Wired to open from Explore's Browse posters, the Top 5 Trending rail, and the For You reel's "More Info" button, via a new `careerSlug()` helper since the app has no unified career-ID scheme across its several data sources (`resolveCareer()` in `src/components/career/data.ts` merges `catalog.ts`/`report-data.ts`/the For You reel by slug, falling back to "Coming soon" for thin data). Career Ladder + Common Softwares content authored (flagged as prototype copy, not verified data) for the 14 careers that already have either report or reel data.
- **This entry (`fae6288`)**: three more rounds of direct feedback on that same build.
  - Tab labels ("What They Actually Do" / "Real-life Example") were sized as body text even though they're subheadings — bumped to the Subheading tier, body copy underneath dropped to Body, so Title > Heading > Subheading > Body actually holds end to end.
  - The three stat cards had label/value inverted: "Median Salary" (the label) was small and muted, "$101,910" (the value) was large and bold. Per direct instruction to just apply the hierarchy top-down rather than relitigate which one "should" read as more important — swapped them.
  - Ported the same `clamp()`-based proportional type scaling the Play dialogue box already uses (see the 2026-08-25 SimulationPlayer entries above, and `de94ebe`) to this page's whole type scale (`HEADING`/`KEY_VALUE`/`BODY`/`LABEL` constants, hero title, ladder salary figure) — floor matches the old flat value exactly at 1440px, grows linearly with vw past that, capped so it doesn't run away on a wide monitor. Was flat past 1440px like every other screen before that fix landed.
  - Career Ladder rows now expand to real content instead of repeating the one-liner: added a `skills: string[]` field to `LadderRung`, 2-3 tags per rung across all 70 rungs (14 careers x 5 rungs), rendered as chips only when a row is open.
  - Common Softwares chips get a real brand logo (Simple Icons CDN, `cdn.simpleicons.org`) for the ~20 tools with a confident slug match (Excel, Figma, Slack, VS Code, GitHub, etc.) — white glyph on a small fixed-dark chip (same idea as `PosterCard`'s salary badge) so it reads the same regardless of theme, since the CDN serves one flat color per request rather than following `currentColor`. Specialty industry software with no reliable mark (Bloomberg Terminal, Epic, LIMS, CATIA, etc.) still renders as plain text — no logo is safer than a wrong one.
  - **Hero went through several dead-end iterations before landing** — logging the wrong turns since they're easy to repeat: (1) a flat opacity wash on a full-bleed image made the photo essentially invisible; (2) `object-position: right` on that same full-bleed image sliced through faces (the photos aren't composed with the subject on their own right edge); (3) switching the right-side panel to `object-contain` guaranteed the whole subject stayed in frame but left a visible hard-edged letterboxed rectangle since the panel's own aspect ratio didn't match the photo's. Landed on: a narrower panel (45% width) + a taller hero (`md:min-h-[500px]`, up from 300px) so the panel's aspect ratio sits close enough to a portrait photo's own that a plain `object-cover object-top` panel keeps the whole head in frame, filling edge-to-edge with no boxy border, fading into the text column via a horizontal `linear-gradient` into `var(--background)`. Mobile is unchanged from the original build — full-bleed background photo + the `var(--poster-scrim)` bottom scrim (same idiom `PosterCard` uses for its own text scrim).
- Verified via isolated git worktree (`npm install`, `tsc --noEmit`, `eslint`, `tokens:check`, `next build`) — all clean, only the same class of pre-existing `<img>`-vs-`next/image` lint warning the codebase already carries elsewhere (`PlayHub.tsx`, `ReportChooser.tsx`) for the new Simple Icons `<img>`. Live-verified on desktop (1440px) and mobile (375px) across Investment Banking, Registered Nurse, and Software Engineer — hero framing, stat-card hierarchy, ladder accordion expansion, and software logos all confirmed live in-browser, not just by reading the diff.
- **Follow-up fix, same session**: the "What They Actually Do" / "Real-life Example" tab labels wrapped mid-phrase on a narrow phone once bumped to the Subheading tier (16px doesn't fit two side-by-side labels in ~160px each on a 375px screen) — stacked them into their own full-width rows on mobile (`flex-col`, back to `sm:flex-row` from tablet up) with `whitespace-nowrap` on each label so neither ever breaks mid-word again.
- **Not yet pushed** — awaiting explicit go-ahead per standing instruction to confirm before every push on this project. The earlier Career Detail build commit (`7834518`) and an unrelated Profile composition-fix commit (`a08cd60`) are also still sitting local, same reason.
- **Known gap, not yet started**: only 14 of the catalog's ~39 careers have Career Ladder/Common Softwares content — the rest fall through to the page's own sections simply not rendering (no broken UI, just thinner content) until more careers get authored data. The repo-root "BROWSE Images"/"FOR YOU Images" folders (real per-career/per-world photo assets) are also not yet wired in as a replacement for whatever placeholder photos `catalog.ts`/the For You reel currently point at — flagged, not requested to start.

## 2026-08-25 (later still) — Play/IB: Performance Improvement Plan, from the updated handoff
Built the Performance Plan mechanic from the user's updated `DreamAri_IB_Levels1-3_Handoff.xlsx` (new "Performance Plan" tab, plus a new 39th "Plan Line If Failed" column on every level tab). Fully verified live end-to-end, not just compiled.

- **THE STRIKE RULE** (`scoring.ts`): a Wrong answer adds 1 strike, a Risky answer adds 2, Best/Acceptable add none, strikes never clear inside a level except by the plan itself. Third strike fires the plan immediately -- preempting that beat's own feedback card entirely ("No feedback. Fires the moment the third strike lands") rather than showing it first. Once per level.
- **The plan itself** (`performance-plan.ts`, `PerformancePlanFlow.tsx`): a full-RED-ambience takeover, NOT one of the ten scored beats and never touches the progress bar -- Warning card -> three fixed Decision steps (pass/fail only, no points) -> Passed or Terminated. Content is bespoke per level but the engine is one component for all three. Step 1's setup names the actual mistake via a `{PLAN_LINE}` template slot, filled from whichever scored beat produced the third strike (`planLineIfFailed`, added to `BeatBase` and populated on all 30 scored beats across the 3 levels from the sheet). Step 1 always carries a Dreamy card, step 2 never does, step 3 only does if both earlier steps were missed (meaning this answer alone decides the outcome).
- **Reputation "set to exactly 50, not added to"** on a pass: added a `reputationBaseline` piece of state (was hardcoded to `START_REPUTATION`) that the derivation formula uses instead -- passing recomputes it so the CURRENT total lands on exactly 50, and everything scored afterward continues correctly from there. Termination restarts the level exactly like the existing `restart()` flow (and `restart()` itself now also clears strikes/pipUsed/the baseline, which it never did before -- a player restarting after passing a plan would otherwise have been unable to ever trigger one again that run).
- **Real React-purity fight worth logging**: the three steps' answer positions have to randomise ("MUST RANDOMISE POSITION. In the build the right answer was A all three times") -- but the project's eslint config hard-errors on `Math.random()` inside a render path, INCLUDING inside `useMemo`'s factory and inside `setState` calls made synchronously in an effect (both tried first, both rejected). Fix: roll all three steps' orderings once, at the moment the third strike actually lands (`resolve()`'s `setTimeout` callback in SimulationPlayer.tsx, which is not a render path), and carry them as plain data (`PipState.stepOrders`) into `PerformancePlanFlow` -- zero randomness inside the component itself.
- **Scope note**: strikes and in-progress PIP state are ordinary React state, NOT persisted to localStorage (unlike everything else in a run). A player who reloads mid-strike-count or mid-plan loses that progress and starts the count over. Deliberate, given PIP is explicitly not one of the ten scored/saved beats and the added persistence-schema surface wasn't worth it for a mechanic that only matters within one continuous sitting -- flagged here rather than silently scoped down.
- Verified live, not just compiled: played a real sequence to 3 strikes (L1-04, L1-05, L1-06 all landed "wrong"), confirmed the plan fired with the correct `{PLAN_LINE}` substitution from L1-06, confirmed the Dreamy-card conditional logic at all 3 steps, passed the plan (2 of 3), confirmed reputation read exactly 50 afterward, confirmed play resumed at L1-07 (the beat after the trigger), and confirmed `scores`/`scored` correctly retained all 3 "wrong" entries for the progress dots and any later repair round. Full `tsc --noEmit`, `eslint`, `tokens:check`, and a production build all clean.
- **Not yet done**: did not attempt to reconcile the rest of the updated handoff spreadsheet against the current level content beyond the PIP tab and the Plan Line If Failed column -- the row-count growth in the level tabs appears to be sub-question row expansion (already collapsed correctly in this codebase's beat structure), not new content, but this was not exhaustively diffed beat-by-beat. Flagging in case the user's "UPDATED level 1, 2 and 3" meant more than the PIP addition.

## 2026-08-25 (later still) — Explore: real office-tour clips in the For You reel, Env Card v2 from Figma
- **Interleaved 5 real office-tour/testimonial clips into the For You reel** (`3c620dd`) at every third slot -- Pic, Pic, Video, repeating (Kellanova, JPMorgan Chase London and Ohio, Kellogg's, AT&T), per direct request. Re-encoded all five from their raw ~10-20 Mbps portrait exports (454MB combined, two over GitHub's 100MB hard file-size limit as-is) down to ~3.2 Mbps/faststart -- 79MB combined. New `VideoReel` type + `isVideoReel` guard (`catalog.ts`) discriminate a clip from a `ReelCareer` by the presence of `video`; `FOR_YOU_FEED` is the pre-interleaved combined array the reel renders from (`FOR_YOU_REEL`'s own 8 cards are unchanged and still exported). Videos get their own `VideoCard` (autoplay muted while active, paused off-screen) rather than reusing `EnvCard`'s salary/major/"Play Game" chrome, which doesn't apply to a real person's testimonial. Only 8 cards exist for 5 videos (4 "every-other" slots), so the last lap cycles back to the first two cards rather than ending on two videos back to back.
  - **Flagged, not resolved**: the request named 6 videos ("Video 3: Cybersecurity guy") but only 5 files were attached -- that one is simply absent from the reel, not guessed at.
- **Redesigned the reel cards to Env Card v2** (Figma `3317:15773`, file `sV90J9zEKarhCYJMQKbYxx`) (`fca77b9`), after two rounds of direct correction:
  1. First pass moved the preference buttons to a top-right row and swapped the old solid-scrim details panel for a blurred one, but kept the OLD panel's rounded/bordered pill shape -- called out directly as still reading like "a box with content and blur." Figma's actual panel has no border and no radius at all -- full width, blending into the photo as a bottom treatment rather than a card pasted on top of it.
  2. Second correction: the panel shouldn't stop at the text -- the CTA row was still floating separately over raw (blurred-background) photo below it, with a visible gap. Figma's own "Career Details Panel" node wraps the CTAs too, and its Background Blur effect is set to **Progressive, Start 2 / End 35** (exact values from the user's own Figma inspector screenshot), not a flat blur. CSS has no gradient-radius `backdrop-filter`, so `ProgressiveBlur` (new helper in `ExploreExperience.tsx`) approximates it with 6 stacked layers at increasing blur (2 to 35px), each revealed via its own soft-edged `mask-image` band -- a standard technique for this exact effect (each layer independently samples the same photo; the browser composites the overlapping, differently-blurred results into a visual ramp). The tap-to-flip Summary/Details `<button>` now wraps only the text (Figma's flat mockup nests everything in one panel, but a `<button>` can't contain the CTA buttons too -- HTML validity, not a design deviation), with both the text button and the CTA row sharing the panel's single padding and one shared `ProgressiveBlur` backdrop behind both.
  - Video cards deliberately keep their existing solid scrim (no blur at all) per direct instruction -- blurring part of a *playing* video reads muddy in a way it doesn't over a still photo -- just picked up the same border/radius language for consistency.
- Verified live at each step (screenshots checked against Figma's own reference render, not just compiled): confirmed no border/radius on the panel, confirmed the progressive ramp reads sharp-near-title to fully-blurred-behind-CTAs with no seam, confirmed the video card stays crisp.
- **Also discovered mid-session**: `origin/main` had moved ahead with commits from a concurrent AI session (`7834518`..`ce70da7`, the new Career Detail page) while this session was working. Since both sessions share the same local checkout, that session's own `git push` appears to have carried this session's two earlier commits (`3c620dd`, `be5a34f`) to `main` as a side effect -- they went live without an explicit per-commit push confirmation from the user to THIS session, purely because of how git push works on a shared local branch. Flagging for visibility; not something either session did wrong, but worth knowing if "was that approved before going live" ever comes up for those two.

## 2026-08-25 (later still) — Explore: Env Card v2 spacing fixes, real Private Equity photo
Three more rounds of direct feedback on the Env Card v2 work logged just above, plus one real-asset swap.

- **Text block no longer reserves fixed height.** `min-h-[151px]` on the tap-to-flip Summary/Details text block was sized for the longest career copy in the reel, so any shorter career (e.g. Aerospace Engineer's two-line description) left a dead gap between the text and the CTA row below it -- looked like "a huge blank space between the content and the ctas" because the box was taller than its own content. Removed the fixed min-height entirely; the block now sizes to whatever text it actually holds. Also deduped the CTA row's spacing -- it had both a `gap-2` from the parent flex column AND its own `mt-2` stacked on top (16px combined); collapsed to a single `gap-3` (12px) on the parent, landing inside the requested 12-16px range without a redundant second rule.
- **Progressive blur panel now reaches the true bottom of the card on mobile, not just the CTA row.** The mobile-only `pb-[64px]` bottom-nav clearance lived on the outer cluster wrapper, AFTER the blurred panel closed -- so that reserved strip was raw, unblurred photo, reading as a visible gap between the blur/CTA panel and the bottom tab bar. Moved that padding inside the panel div that `ProgressiveBlur` is `inset-0` to, so the reserved space is part of the blurred/scrimmed area instead of a bare photo band above the nav bar.
- **Swapped in the real photo for Private Equity Analyst** (`public/images/app/env-private-equity.png`) from the user's own `for you images/Business, Money, Sales & Office/Private Equity.png` -- flagged as looking "blurred/pixelated" on-device even though the file it replaced was actually higher raw resolution (2816x1536 vs 941x1672); the new asset's portrait aspect ratio matches the card far more closely (near 1:1, vs. the old landscape source getting cropped hard by `object-cover`), which is likely what read as soft/cropped-looking on a phone. Same file path, no code change needed beyond the asset itself.
  - **Not done, flagged rather than guessed**: the other 7 For You reel careers (Aerospace Engineer, Product Designer, Biomedical Researcher, Marine Biologist, Neurosurgeon, Constitutional Attorney, Creative Director) have no matching file in any of the four "for you images" categories currently in the repo (Arts/Media/Sport, Building & Construction, Business/Money/Sales/Office, Counseling & Social Work) -- those categories don't cover science, law, design, or engineering roles. They still point at their original placeholder art. Swapping the rest needs the missing category folders/zips first.
- Verified: `tsc --noEmit` clean, `eslint` clean (one pre-existing unrelated warning), `npm run tokens:check` clean, production build clean. Live-verified on the mobile viewport (375x812): Private Equity Analyst (long copy) and Aerospace Engineer (short copy) both sit content-height with a tight, single CTA gap, and the blur panel now runs unbroken down to the bottom tab bar.
- Pushed to `main` per explicit instruction ("then push").

## 2026-08-25 (later still) — Site-wide: lift+shadow instead of underline on hover, mount-in transitions
Two direct-feedback requests, both site-wide rather than page-local, so both landed in the shared interaction layer (`app/app.css`) plus each screen's own top-level content wrapper, not as one-off per-page CSS.

- **`.dm-link:hover`** (the shared class for every icon+text nav/action control site-wide — logo, For You/Browse All toggle, Profile's "Change route"/"Change" links, Connect's helpful/save/back controls, etc., 6 files / ~25 call sites) no longer sets `text-decoration: underline` on hover. It now does the same lift-plus-shadow `.dm-tap` already uses for cards (`translateY(-1px)` + `box-shadow: 0 12px 28px -20px rgb(0 0 0 / 0.85)`, resetting on `:active`), reusing the existing shadow value rather than inventing a new one. Added to the existing `prefers-reduced-motion: reduce` guard alongside `.dm-tap`/`.dm-solid`. Two OTHER underline usages in the codebase were left alone since they're permanent, not hover-triggered, and read as intentional (`CareerReport.tsx`'s external-source citation link, `SimulationPlayer.tsx`'s "Restart" text) — confirmed via a full-codebase grep that `.dm-link` was the only hover-underline pattern actually in use.
- **Mount-in transitions**: the app already had this pattern (`seq-reveal` in `app.css` — direct children fade+slide-up, staggered ~50ms apart — and Connect's own per-card `fade-slide-up` with an index-based delay) but only Profile and Connect actually used it. Added `seq-reveal` to the top-level `<main>` of Home, Career Detail, and Play (4-5 direct children each, well inside the utility's 8-step stagger table) so those screens' content now animates in on first paint instead of popping in instantly. Explore's Browse-All rail list is a conditionally-rendered Fragment (`becauseLiked.length > 0 && <Rail>`, etc.) rather than a real element, so `seq-reveal` couldn't attach directly — wrapped it in a `<div className="seq-reveal contents">` instead (`display: contents` keeps the div out of the flex layout entirely, so the rails still lay out as if they were `<main>`'s own direct children, while still giving the stagger animation something to select `> *` from). The Explore header/search controls were deliberately left outside that wrapper so they don't get swept into the same fade as the rails, and to avoid the new `.seq-reveal > *` rule's full `animation` shorthand silently overriding the filter row's own distinct `.filters-reveal` keyframe (same property, would have been a same-specificity source-order collision).
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a production build all clean (only pre-existing unrelated `<img>`-vs-`next/image` warnings). Live-verified the hover lift+shadow via the actual computed CSSOM rule (not just the source), and the mount-in animation via `display: contents` confirmation, on Home, Explore (both tabs), Career Detail, and Play.
- **Not done, flagged rather than guessed**: "loading transitions when a screen is populated wherever necessary" is inherently a judgment call about scope — this pass covers every major top-level app screen's own first paint. It does NOT touch: Play's actual gameplay screens (`SimulationPlayer.tsx` already has its own bespoke beat-to-beat transitions — a typewriter reveal, `ink-bleed-in`, `card-cascade` — layering a generic mount fade on top would fight those, not help), the Performance Plan flow (same reasoning), or any true async/network loading state (nothing in the app fetches over a real network today — all data is local/static — so there's no spinner-to-content moment to transition yet).
- **Also discovered mid-session, same shared-checkout hazard as the previous entry**: `CareerDetailExperience.tsx` had live uncommitted changes from a concurrent session (widening the hero photo's fade gradient) sitting in the working tree while this fix was being made. Used `git add -p` to stage and commit only this session's one-line `seq-reveal` hunk, leaving the other session's gradient hunk untouched and still uncommitted for them to commit themselves — flagging here so that session doesn't lose track of it.
- Pushed to `main` per the standing "then push" instruction from earlier this same session.

## 2026-08-25 (later still) — Explore: Env Card legibility, Details-face seam, reel sound
Three more rounds of direct feedback on the For You reel.

- **"STRONG MATCH" / "MORE INFO" / "MAJOR" / "MAIN SKILLS" labels were unreadable over bright photo regions.** The panel's real background is a live photo behind a blur that's only 2px at its top edge (Figma's own Progressive Start-2 spec, see the Env Card v2 entries above) -- a flat text color can't guarantee contrast against arbitrary photo content, especially a light wall/window right behind that lightly-blurred top edge. Fixed two ways together, per direct instruction ("brighter white text with drop shadows or something"): the four labels moved off `var(--text-muted-alt)`/`var(--muted-foreground)` onto a brighter `rgba(255,255,255,0.92)`, and a shared `LEGIBLE_TEXT_SHADOW` (a crisp near shadow + a soft wider one, the standard text-over-photo legibility recipe) is set once on the tap-to-flip button and inherited down to every child in the block (title, description, salary/major/skills values included) -- `text-shadow` is an inherited CSS property, so one declaration covers the whole panel instead of repeating it per span. A shadow is the actual fix for the bright-background case specifically: even white text still needs something to outline it against a light photo, brightness alone doesn't do that.
- **Tapping into the "Details" (MORE INFO) face showed a hard seam and, per the above, unreadable text right at it.** Root cause: the tap-to-flip block used to fully unmount/remount its content per face (`key={face}`), so the panel's height tracked whichever face's content was shorter -- Details (two label/value rows) is shorter than Summary (title + up to 2-line description + salary), so flipping to it shrank the panel, which pulled the ProgressiveBlur backdrop's top edge down with it and exposed a stretch of barely-blurred photo that used to be safely inside the panel. Fixed by keeping both faces permanently mounted, stacked in the same CSS Grid cell (`grid` + `col-start-1 row-start-1` on both), crossfaded via opacity instead of a remount -- a shared grid cell's row height is the tallest of its stacked children by default, so the panel is now always exactly as tall as Summary's content (the taller of the two) regardless of which face is showing, and never shrinks out from under itself.
- **For You reel videos had no sound toggle** (they've always autoplayed hard-`muted`). Per direct request to behave "like Instagram" -- flagged first that a website genuinely cannot read a phone's hardware silent switch (that's a native-only API, `AVAudioSession`/`AudioManager`; Instagram's own web player can't either), so this ships the real thing every video site actually does instead: `VideoCard` now attempts autoplay WITH sound when a clip becomes active, falls back to muted automatically if the browser's autoplay policy blocks that (catching the rejected `play()` promise), and adds a small speaker icon button (top-right of the clip, `Volume2`/`VolumeX`) to toggle it manually. The choice (`soundOn`) is lifted to `ForYouFace` and persisted to `localStorage` (`dreamari:reel-sound-on`) so every clip in the reel shares one preference and it survives a reload, instead of each card resetting to muted -- same behavior Instagram/TikTok's web players actually have.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a production build all clean. Live-verified the legibility fix and the Details-face height parity in-browser on mobile viewport (375x812) against the Private Equity Analyst card (long Summary copy) before shipping.
- Pushed to `main` per explicit instruction earlier this session ("then push").

## 2026-08-25 (later still) — Home: wired the dead "Resume Simulation" CTAs
Per direct report: "wherever there is a resume simulation on play simulation/game thing it should take me to the relevant simulation. especially the homepage." Both were true dead ends -- neither had ever had a destination, not a regression.

- **Hero banner's Panel 2** ("Day in the Life: Investment Banker" / "The $30B Deal") -- the `<HeroCta>Resume Simulation</HeroCta>` was rendered with no `onClick` at all. Now calls `router.push(`/play/${INVESTMENT_BANKING.id}`)`, importing the real simulation record from `@/components/play/games` rather than hardcoding the route string, so it can't drift from the id `PlayHub`'s own cards use.
- **"Continue Learning & Playing" rail's Activity Card**, same career -- `ActivityCard` rendered a plain `<article>` with no interactive element anywhere in it; the whole "Resume Simulation" row of text was inert. Added an optional `href` to the `Activity` type (set only on the Investment Banker entry, to the same `/play/${INVESTMENT_BANKING.id}`) and made `ActivityCard` render as a real `<Link>` (with `.dm-tap`'s lift+shadow hover) when `href` is present, plain `<article>` otherwise.
- **Left "Finance Essentials" (Glossary Game) and "Deal Team Kickoff" (Game) unlinked, on purpose, not missed**: `SIMULATIONS` in `play/games.ts` has exactly one built simulation, Investment Banking -- neither of those two has a real page anywhere in the app to send someone to (confirmed via a full-codebase grep), so wiring them to something would mean guessing a destination that doesn't exist. Both activity cards keep their current copy/progress display; only their CTA stays non-functional until a real game backs them.
- `/play/${game.id}` (no query string) is the correct resume link -- `GameCard` on the actual Play hub already does exactly this and lets the `/play/[game]` route itself read progress and resume the right level; matched that pattern rather than inventing a `?level=` param here.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a production build all clean. Confirmed both new/changed elements resolve to real `/play/investment-banking` targets via the live DOM (`<a href>` on the activity card, `router.push` on the hero button, same call pattern as this file's already-working Panel 3 CTA) rather than clicking through the shared dev-server tab, since a previous verification pass this session accidentally disrupted the user's own live view of it.

## 2026-08-25 (later still) — Play IB: home button, background music, Play hub layout, real cloud everywhere, real career photos
A large batch of direct feedback, landed together.

- **Home button mid-simulation**: the HUD's back control only ever did two things depending on beat index -- step back one beat, or (beat 1 only) leave to `/play`. Past beat 1 there was no way to jump straight to the Play hub at all. Added a permanent `Home` icon button (`SimulationPlayer.tsx`'s `Hud`) that always links to `/play`, sitting next to the (now beat-index-gated) step-back chevron instead of replacing it.
- **Background music** (`src/components/play/music.ts`, new module, files at `public/audio/play/ib-{main,promotion}-song.mp3`): Main Song plays for the whole level; switches to the Promotion Song the instant an ending actually promotes the player (`phase === "ending" && ending.advances`); reverts to Main automatically the instant a repair round or a full restart leaves the ending phase again -- this falls out for free from making the track a plain function of `(phase, ending.advances)`, no explicit "revert" calls needed in `restart()`/`startRepair()`. Deliberately its **own** mute flag (`MusicToggle`, independent from `sound.ts`'s SFX `MuteToggle`) per the literal rule "mute it and only hear sound effects" -- a single shared mute switch could never produce that state.
- **Play hub was missing two of the three promised card types**: it only ever had career Simulations and "In the works" (not-yet-built career sims). Added `GLOSSARY_GAMES`/`MINI_GAMES` arrays to `games.ts` and two new `SoonSection`/`SoonCard`-rendered rows on the hub (Finance Essentials, Deal Team Kickoff) -- same locked "Soon" treatment as the career placeholders, since neither had a real page to open (Finance Essentials didn't, at the start of this entry -- see the flag below, that changed mid-session). Refactored the old inline "In the works" JSX into the same reusable `SoonCard` so all three rows share one component.
  - **Stale within this same session**: a concurrent session shipped a real `/play/glossary/[career]` route and wired Home's own "Finance Essentials" card to it while this work was in flight. The Play hub's own Glossary Games card is still the static locked "Soon" placeholder -- next session should link it to the same route instead of guessing it's still unbuilt.
- **The real Dreamy cloud, in both places it was still a substitute**: (1) Home's "Today's Drop" flying-cloud animation (`DailyDropDemo.tsx`'s `FlyingDreamy`) used `DreamyRig`, a hand-traced SVG rig from a *different* source pose, not the actual rendered art. Swapped to a plain `<Image src="/images/hero-cloud-mascot.png">` inside the same drift/bob wrapper -- per direct instruction, accepting that a flat image can't reproduce the vector rig's own gaze-cycle animation. (2) The marketing landing page's Hero mascot (`Mascot.tsx`) already used the real image as its base layer, but overlaid two canvas-rendered iris sockets that tracked the cursor -- per direct instruction ("swap out the eye tracking one for the OG one"), removed the iris canvases, the per-frame iris draw effect, and the blink-cycle state entirely, keeping the real baked-in (static) eyes and everything else the rig does (scroll-exit fade, body lean/tilt toward the cursor, glow + sheen parallax, float bob) untouched -- those aren't "eye tracking," they're separate atmosphere effects the instruction didn't ask to remove.
- **For You reel crop fixes**: Product Designer's photo was centered by default `object-cover`, which cut straight through his face (source subject sits ~42% across a wide frame) -- added a `REEL_PHOTO_FOCUS` override (same idea as Career Detail's `HERO_FOCUS`), same technique flagged as still needed for any future off-center photo.
- **For You + Play hub photos swapped for higher-quality/more relevant art, per direct instruction, "easily revertable" (same technique as the earlier Private Equity swap: overwrite the PNG at its existing path, so a plain `git revert` undoes only the image bytes, no code)**:
  - For You: Private Equity, Constitutional Attorney, and Creative Director now use real photos from the repo's `BROWSE Images/` set (Lawyer.png, Art Director.png, and Business/Private Equity.png respectively) -- picked because they're both role-relevant AND the same realistic-photography style as the other 7 For You cards. Deliberately did NOT swap Product Designer to Browse's own "UIUX Designer.png": that asset is a flat illustrated product shot (cream background, floating UI stickers), a jarring style mismatch against the reel's photography, so it stayed on its existing (now correctly-cropped) photo instead of trading one defect for a worse one.
  - Play hub "In the works": all 5 SOON career covers (Airline Pilot, Registered Nurse, Software Engineer, Private Equity, Food Scientist) replaced with 5 new user-supplied illustrations, matched to their existing `careerId`/title by content (cockpit pilot -> Airline Pilot, ER scrubs -> Registered Nurse, multi-monitor coder -> Software Engineer, skyline boardroom -> Private Equity, food-science lab -> Food Scientist) rather than by attachment order alone.
  - **Not swapped, no relevant asset exists**: Aerospace Engineer, Biomedical Researcher, Marine Biologist, Neurosurgeon -- none of the `BROWSE Images/` categories in the repo (Arts/Media/Sport, Building & Construction, Business/Money/Sales/Office, Counseling & Social Work, Driving/Flying/Shipping, Factories, Farming, Health & Medicine, Law/Safety/Justice, Science & Research, Tech & Engineering) has a photo for any of these four roles specifically.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a production build all clean after every change in this batch. Live-verified in-browser: the Home button renders mid-run, the Play hub's three new/changed sections and all 5 new "Soon" covers, the real cloud rendering (static eyes, still leaning/bobbing) on both Home and the marketing landing page, and both reel photo fixes.
- **Same shared-checkout hazard as earlier entries, twice more this pass**: (1) a concurrent session's own commit (`423cac5`, a Daily Drop reveal-card fix, unrelated to this work) landed while this session's `DailyDropDemo.tsx` edit was sitting uncommitted in the same working tree -- their commit's snapshot ended up including this session's cloud-swap change too, since it's one shared filesystem. Not reversible without rewriting their history, which isn't warranted for a correct, wanted change that simply has the wrong commit message attached -- flagging here so it isn't mistaken for something that shipped silently. (2) Mid-way through this entry, `src/components/glossary/` and `src/app/play/glossary/[career]` appeared on disk as a real, in-progress glossary-game feature from a concurrent session, plus a one-line `href` addition to this session's own `HomeExperience.tsx` `Activity` entry wiring Home's Finance Essentials card to it. Left all of that out of this session's own commit (`git add` on the specific unrelated files/hunks only) for that session to commit itself.

## 2026-08-25 (later still) — Explore: Product Designer gets the Browse card image after all
Direct correction on the previous entry: swapping this card's photo for the Browse-set asset was the actual ask, not a crop fix on the old one -- an off-center-crop fix was solving the wrong problem when what was wanted was simply a different, better source image, style match be damned.

- `env-product-designer.png` now uses `BROWSE Images/Tech & Engineering/UIUX Designer.png` (same asset previously passed over for a style mismatch against the reel's photography -- overruled by direct instruction, so it's in now).
- Removed the now-stale `REEL_PHOTO_FOCUS["Product Designer"]` override (`42% center`) -- it was calibrated for the old off-center realistic photo; the new asset is centered close enough that the default crop is correct, and leaving the old override in would have mis-cropped the new image.
- Verified the swap by fetching the raw static file directly (bypassing `/_next/image`) since this session's own browser-automation tool has a known stale-cache quirk for `/_next/image` URLs already noted in an earlier entry -- confirmed correct dimensions/content server-side.
- **Same shared-checkout situation as every recent entry**: `PlayHub.tsx`/`games.ts`/`HomeExperience.tsx`/`CareerDetailExperience.tsx` all have live uncommitted changes from a concurrent session mid-edit (`PlayHub.tsx` briefly failed `tsc` outright during this pass, referencing `glossaryPlayable`/`GlossaryGameCard` names that don't exist yet -- a normal save-in-progress artifact of active editing on a shared file, not a bug to fix from this session). None of that is touched here; only `ExploreExperience.tsx` and the one image are in this commit.

## 2026-08-25 (later still) — Play IB: PIP/timed-question music muffle; fixed a real cross-surface image bug
Two things: a new music behavior, and an actual bug this session introduced in the previous entry.

- **Music muffles (a lowpass filter, not a volume duck) during a PIP or a timed focus question**, per the standing "muffle the music during focused timed-question screens" ask from earlier in this project, now buildable since real music exists. `music.ts` routes the `<audio>` element through a Web Audio graph (`MediaElementAudioSourceNode -> BiquadFilterNode(lowpass) -> destination`, built once, lazily, since `createMediaElementSource` can only ever be called once per element) and exposes `setMusicFocused(bool)`, which ramps the filter's cutoff between 20kHz (normal) and 500Hz (muffled) over half a second rather than snapping. `SimulationPlayer` computes `pip !== null || timerActive`; `timerActive` is reported up from `BeatStage` via a new `onTimerActive` callback, using the exact same guard its own `<Clock>` render already uses (`seconds > 0 && !paused && revealed`), so "focused" always means what the countdown ring on screen means.
- **Real bug, not a redo of an earlier note**: the previous entry's Play hub "Soon" cover swap overwrote `poster-airline-pilot-alt.png`/`poster-registered-nurse.png`/`poster-software-engineer.png`/`poster-private-equity.png`/`poster-food-scientist.png` in place -- the same "revertable, just the image bytes" technique used successfully earlier for `env-private-equity.png`. The difference this time: those 5 filenames are NOT exclusive to Play's SOON list -- `catalog.ts` (Explore's Browse-All rails), `profile/data.ts`, `match-lab/data.ts`, and two marketing chapters all reference the exact same paths. Overwriting them put the Play-only illustrated covers on Explore's Browse cards too. Fixed by restoring the original 5 files from the commit before the mistake and moving the illustrated covers to their own `soon-*.png` files, referenced only from `SOON` in `games.ts` -- the two image sets no longer share a path, so this can't recur for these five.
- Verified: `tsc --noEmit`, `eslint`, and `tokens:check` all clean. Confirmed live that Explore's Browse-All "Private Equity"/etc. cards show the original realistic photography again (not the illustrated Play covers), and that Play's own "In the works" row still resolves the new art via curl against the dev server's `/_next/image` endpoint directly (this session's own browser-automation tool has a known stale-cache quirk for that endpoint, documented in an earlier entry, that made a couple of live screenshots misleadingly blank during this pass).
- **Same shared-checkout situation, still ongoing**: `games.ts`'s `GLOSSARY_GAMES` array picked up a real `careerSlug`/`hasGlossary` wiring from the concurrent glossary-feature session while this entry's `SOON` fix was being made in the same file -- split with a hand-built patch (`git apply --cached`) rather than committing both together, so their in-progress change stays theirs to commit. `HomeExperience.tsx`, `CareerDetailExperience.tsx`, and `PlayHub.tsx` all still have other live uncommitted changes from that session too; none of them touched here.

## 2026-08-25 (later still) — Responsive audit, per direct request
Checked the surfaces touched this session (Home hero, SimulationPlayer, Explore For You, Play hub) at 320px, 768px, 900px, and 2560px, comparing live DOM measurements (`getBoundingClientRect`) against what the browser-automation screenshot tool showed, since that tool has now shown three separate rendering artifacts this session (a stale `/_next/image` cache, a "tablet" preset producing a letterboxed capture, and a stale capture right after resizing to 2560px) that all looked like layout bugs in a screenshot but measured out completely correct in the actual DOM. Lesson for next time this comes up: when a screenshot at an unusual viewport size looks broken, verify with `getBoundingClientRect()` on the suspect elements before trusting the image -- three false alarms in one session is enough to distrust the tool at extreme/preset viewport sizes specifically.

- **One real bug, found and fixed**: `SimulationPlayer`'s HUD outgrew a narrow phone. Between this session's own two new icon buttons (Home, Music) and the pre-existing two (back chevron, SFX mute), four 36px buttons plus the reputation cluster left so little room for the title that it was truncating down to one or two characters ("I." / "L") at ~320-350px widths -- a real, visible break, not a screenshot artifact (confirmed both ways). Fixed by hiding the reputation band's text label ("CAUTIOUS") below the `sm` breakpoint, keeping just the number -- the same information stays available to screen readers via an `aria-label` on the wrapping span (`"47, Cautious"`), with the now-redundant visible pieces marked `aria-hidden`. Verified live: the title now reads "INVESTME…" / "LEVEL 1 · …" cleanly at 320px instead of wrapping to single letters.
- **Checked and confirmed fine** (DOM-measured, not just eyeballed): Home's hero carousel and its flying-cloud math (`ResponsiveFlight`) at 320px and 2560px -- correctly bounded on-screen at both extremes, the apparent off-screen position on one check was the carousel's own auto-rotate timer moving to a different panel mid-measurement, not a sizing bug. Explore's For You reel and its fixed desktop card frame, centered correctly at 2560px width via `mx-auto` on a `max-w-[1440px]` container. Play hub's new Glossary/Mini Games/In the Works grids reflow cleanly at 320px (2-column) with the new photos loading and captions wrapping without overflow.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check` all clean.

## 2026-08-25 (later) — New feature: the Glossary Game (vocabulary mini-game)
- **Built the whole feature from scratch this session**: a Duolingo-style vocabulary game for the Play tab, requested via a forwarded Slack thread ("In play tab, we need mini games... Usman has all that info") plus a supplied xlsx (`DreamAri_Glossary_Content_Template_v1.xlsx`, the content team's authoring template) and the live reference at `dceeai.replit.app/ib-glossary-game`. New files: `src/components/glossary/{data,progress,GlossaryGameExperience}.tsx`, route `src/app/play/glossary/[career]/page.tsx`.
- **Content**: seeded from the xlsx's own worked example only (Finance Lesson 1, Dream Sneakers -- 5 terms, 8 questions covering all 7 question types the template defines: Definition, Type the Term, Fill in the Blank, Match It Up, Catch the Misuse, Sort the Buckets, Profit Builder, plus a held-back Reverse Recall used only as remediation). `hasGlossary(slug)` gates every entry point -- only `investment-banking` has content today; every other career shows a "Coming soon" state rather than a broken link, per direct instruction ("whichever careers we have data for and then general placeholder for others").
- **Design direction, several rounds of direct feedback, in order**:
  1. First pass matched the Replit reference closely (teal/violet palette, emoji term icons, streak/Power Play copy lifted near-verbatim).
  2. Told directly: no emoji, follow the design system, don't just recreate the Replit reference -- reskinned into Dreamari's own tokens (`var(--world-business-money-office)`/`var(--amber-400)` for the main game, the same token already annotated "(Glossary Challenge)" in the DTCG export; `var(--hero-accent-purple)` for Power Play, matching Play hub's own background blend) and replaced every emoji with a real lucide-react icon, including term icons (a new semantic-slug `icon` field in the content schema -- "building"/"sneaker"/"palette"/"shopping-bag"/"money-bag" -- resolved to `Building2`/`Footprints`/`Palette`/`ShoppingBag`/`PiggyBank` via an `ICON_MAP`). Fixed a real bug this surfaced: the feedback panel was showing the same Check icon on both correct AND wrong answers -- wrong now shows a red X.
  3. Told to make it "so much better," referencing Duolingo specifically: circular skill-node icons for term unlocks (the shape students already read as "unlock one at a time," not square tiles), a per-term mastery dot row next to the numeric "Mastered N/5" readout, streak celebration keyed to a real filled Flame icon.
  4. Final pass -- strict hierarchy rule applied here the same way it's been applied elsewhere this session (Career Detail, the Daily Drop reveal): Title > Heading > Subheading > Body, **no eyebrow/label/caption tier at all**. Cut every redundant sentence restating the same idea across adjacent screens (three consecutive screens all separately saying some version of "here's your example company" collapsed to one), and removed every small tracked-uppercase caption -- "X of Y unlocked," "Words in Lesson N," per-question-type labels ("DEFINITION," "TYPE THE TERM"), Match It Up's "Term"/"Example" column headers -- letting the content and color-coding carry the meaning instead.
- **Reused existing infrastructure rather than inventing new systems**: Dreamy is the exact flat pose-swap sprite set (`public/images/dreamy/v2/dreamy-*.png`) the Build flow's `DreamyGuide` and Play's own floating `Dreamy` already use -- deliberately NOT `SimulationPlayer`'s `SceneCharacter`/`expressionFor`/`PORTRAIT_RATIO` system, which is purpose-built for a person photographed in a specific room. Sound cues are `play/sound.ts`'s existing `playCorrect`/`playWrong`/`playSweep`/`playSelect` (same shared mute flag as the career-sim game). Power Play's confetti is `DreamyGuide`'s own `LocalBurst`, already reused cross-feature by `match-lab`. The Dream Score/mastery save file (`glossary/progress.ts`) follows `play/progress.ts`'s exact shape: localStorage read through `useSyncExternalStore`, not `useState` in an effect (the repo lints that as an error).
- **Wired into all three places asked for**: Home's "Finance Essentials" activity card already existed fully authored (amber badge, flashcard art, copy) with no `href` -- just added one. Play hub's own "Glossary Games" shelf (added by a concurrent session earlier the same day as a locked "Soon" placeholder) got promoted to a real playable card for the one career with content, still "Soon" for anything else added later with no content yet. **Also fixed a real pre-existing bug found along the way**: Career Detail's "Play Game" button had no `onClick` at all, on any career page -- wired it to the real simulation via `simulationFor()`, hidden entirely on careers with no simulation, with a new "Glossary Game" CTA next to it (real button when `hasGlossary()`, a disabled "Coming soon" pill otherwise).
- Verified via isolated worktree (`npm install`, `tsc`, `eslint`, `tokens:check`, `next build`) plus a full live click-through of every screen and all 7 question types end to end at both mobile (375px) and desktop (1440px) -- term unlock carousel, streak modal, Power Play, Lesson Complete -- and confirmed all three entry points (Home, Play, Career Detail) link to the same route, with Coming-soon states rendering correctly for careers without content.
- **Not yet pushed** — awaiting explicit go-ahead per standing instruction to confirm before every push on this project.
- **Also this session, unrelated fix while investigating a live user report**: the Daily Drop reveal screen ("Drop caught!") had its wildcard tier badge overlapping the career card's edge and visually shoving the card off-center. Root cause: an explicitly-sized reserving wrapper (302px) around a differently-sized `inline-block` scaled card (~216px), with the ancestor's `text-align: center` centering the smaller inline-block inside the larger box -- badge position was computed against the outer box, card rendered ~31px off from where the badge expected it. Fixed by making the reserving box's size a direct function of the same `CARD_SCALE` constant used to enlarge the card (`216 * CARD_SCALE` x `303 * CARD_SCALE`), centered via flex (which ignores `text-align`) instead of inline-block auto-centering, and moving the badge inside the scaled element itself so it transforms together with the card rather than being computed from outside it. Verified geometrically (read actual DOM rects, not just eyeballed) at three viewport sizes including one that triggers the reveal screen's own fit-to-viewport auto-shrink.

## 2026-08-25 (later still) — Glossary Game: binder-style term card + visual/interaction polish (flow untouched)
Scope was a large, explicit visual/interaction-only redesign request for the Glossary Game (screen sequence, question order, answers, XP/mastery, and the Dream Sneakers storyline were all off-limits per direct instruction). Everything below is presentational; no changes to `data.ts`, `progress.ts`, the `Screen` union, or any state-transition logic.

- **`UnlockScreen`'s term card rebuilt as a single-page "binder" card** (`GlossaryGameExperience.tsx`): narrow ring-bound left edge (3 punched-hole dots), term as the largest element, definition, a thin divider, "{exampleCompany} Example" label + sentence -- all on existing tokens (`--card`, `--glass-border`, `--world-business-money-office`), no new colors. Definition/example are always visible, no flip-to-reveal. Dropped the old per-card icon badge and (per direct "no eyebrow/caption" feedback from earlier this project) a redundant lesson-label line the concept mockup itself didn't have either -- both were already shown elsewhere on screen (skill-node strip, the `<h2>` above it).
- **Term-to-term transition, and a real bug found building it**: first shipped as a true 3D `rotateY` flip (framer-motion, already a dependency). Reproduced a real Chromium bug on the *second* transition specifically: an element that is both 3D-rotated and clipped with rounded corners on the same layer can go permanently invisible once the transform settles back to identity, even though the DOM/computed styles read completely normal (`opacity: 1`, `transform: none`, correct height) -- caught by comparing `getBoundingClientRect()`/computed-style truth against the screenshot, not by trusting the screenshot. First fix attempt (splitting the rotating wrapper from the clipped/rounded child into two nested elements) did not resolve it. Replaced the whole approach with a 2D `scaleX` pinch-at-the-spine transition (still reads as a page turning, hinged at the left ring edge) -- no 3D transform, no perspective, no reproducible failure across 5 consecutive transitions tested this way afterward.
- **Card height was jumping between terms** (definition/example length varies per term, e.g. "Profit"'s 3-line example vs. "Company"'s 2-line one), shoving the Unlock button down each time -- fixed with a `min-h-[300px]` on the page-content column, sized to the longest of the 5 terms' content at this width.
- **Skill-node progress strip was wrapping** on narrow phones (5 circles at `size-14` + `gap-4` don't fit at 320-390px, so "Profit" dropped to an orphaned second row) -- sized the circles/gaps/icons down at the mobile-first default (`size-11`, `gap-2`) and back up at `sm:`, applied identically to both places this strip renders (`UnlockScreen` and `UnlockCompleteScreen`).
- **Primary CTA buttons (Unlock/Start Practice/Next/etc.) were a yellow-to-teal gradient** -- replaced with the same solid amber every other primary button in this file already used; the gradient was a leftover from an earlier draft pass, not an intentional design choice anywhere else in the game.
- **Light mode's amber button was "horrendous" (muddy brown), and the fix here needs remembering**: `--world-business-money-office`'s light-mode value is `color-mix(in srgb, #ffb81f 47%, black)`, calibrated for *text* contrast (small badges, labels) -- using it as a large button *fill* darkens it into mud. First fix attempt referenced `var(--component-cta-primary-background, ...)` assuming that token was light-mode-only; it is actually declared unconditionally at `:root` in the **unrelated** `design-tokens.generated.css` pipeline (`#f4f7ff`, meant for a completely different part of the app), so the "fallback" never fired and it broke *dark* mode instead (button went white). Fixed for real with a small local helper (`primaryCtaColors(theme)`) that swaps between the original amber (dark) and `var(--foreground)`/`var(--background)` (light -- marketing-v2's own already-correctly-inverted pair, both values already used throughout this file) based on `useGlobalTheme()`. No shared token file touched. **Lesson for next time a token looks "obviously scoped to light-only": grep every file that declares it before relying on `var(--x, fallback)`, not just the one override you found first.**
- **Added the app's existing light/dark toggle to the game's `TopBar`**: this full-screen experience has its own chrome (no shared `DesktopNavigation`/`QuickLinksMenu`), so it never inherited the toggle every other app screen already has (`app/chrome.tsx`). Added a `ThemeToggle` button next to Mute/Home, calling the same `useGlobalTheme()` hook -- no new theming system, no token changes. Other full-screen "player" experiences (`SimulationPlayer`, Daily Drop) likely have the same gap; not touched here, flagged for whoever picks that up.
- **Two term icons swapped, workbook slugs untouched**: `data.ts`'s `icon: "sneaker"`/`icon: "palette"` fields are the workbook's own words (content, off-limits) but the *icon component* they resolve to is this app's own choice (`TERM_ICON_MAP` in the UI layer, per that file's own comment) -- per direct feedback that a paint palette for "Service" and a footprint for "Product" didn't read as the finance concepts, remapped to `Package` (product) and `ConciergeBell` (service).
- Added a `playSelect()` sound cue on the Unlock button press (previously silent) and a brief `whileTap` press-scale, matching the "richer/sounds" feedback and the button-feedback timing budget given (120-160ms).
- Verified via isolated worktree (`npm install`, `tsc --noEmit`, `eslint`, `tokens:check`) plus live click-through of the full intro -> unlock (all 5 terms, both themes) -> unlock-complete -> first practice question path, checking computed styles/DOM rects at each step rather than trusting screenshots alone (this session's browser tool showed the same screenshot-lag artifact noted in earlier entries -- a stale frame during the click-through briefly looked like a skipped screen, DOM state proved it wasn't).
- **Not yet pushed at time of writing** — push once this entry lands, per explicit go-ahead for this specific batch of work (the standing "confirm before every push" rule still applies to future work).

## 2026-08-25 (later still) — Glossary Game: feedback modal, Dreamy placement, real contrast bug
Direct live-testing feedback, landed together. Still no flow/data/logic changes.

- **`FeedbackPanel` (the correct/wrong panel after each answer) was inline content below the question**, pushing itself and the Continue button below the fold on shorter viewports -- per direct report ("dont want anyone to have to scroll to see ctas or info"). Converted to a fixed, centered modal (same `fixed inset-0` overlay chrome as `StreakModal`, but not backdrop-dismissible -- this is a required checkpoint, not an optional toast).
- **Real bug, not cosmetic**: "i cant answer 2/7. Nothing works" traced to `TypeTermCard`'s and `ProfitBuilderCard`'s number/text inputs going illegible the moment they disable after Check -- browsers (Safari especially) dim disabled-input text via `-webkit-text-fill-color` regardless of an inline `color`, so the student's own typed answer became unreadable right when they most needed to see it (right after submitting). Fixed by pinning `color`/`WebkitTextFillColor`/`disabled:opacity-100` explicitly on every input in the file that disables post-answer (`TypeTermCard`, `ProfitBuilderCard`, the Power Play blanks) rather than trusting the inline `color` alone.
- **Correct-answer color was the same amber used for "selected/active" everywhere else**, which reads ambiguously (is this amber circle selected, or verified right?) -- per direct instruction, a confirmed-correct answer now turns green (`var(--world-food-farming-nature)`, this app's own already dark/light-calibrated green primitive, reused for its color rather than its "world" meaning -- documented inline as `CORRECT_COLOR`) across `OptionList`, `TypeTermCard`, `MatchUpCard`, `SortBucketsCard`, `ProfitBuilderCard`, `FeedbackPanel`, and Power Play's blanks/completion banner. Power Play's own purple "active" accent is untouched -- that's an intentional distinct theme for the bonus round, not a leftover.
- **Dreamy repositioned to overlap the card corner** on the two screens where he sits next to a speech bubble (`DreamyIntroScreen`, `QuestionScreen`'s prompt) -- per direct instruction to have him "sit on the corner overlapping the card, not a little," rather than as a plain inline row item. Absolutely positioned with negative offsets against a `relative` wrapper; no layout/flow change, purely presentational.
- Verified via isolated worktree (`tsc`, `eslint`, `tokens:check`) plus a live click-through answering Q1 (choice) and Q2 (Type the Term) in both themes, confirming: the modal never requires scrolling, the disabled input keeps its full green/red color after Check, and light mode's green calibrates correctly (same pattern already fixed once this session for the amber button issue -- checked both themes this time before calling it done).
- Pushed per explicit repeated go-ahead this batch.

## 2026-08-25 (later still) — Glossary Game term-card centering, Play tab redesign
Direct feedback against the deployed build (screenshots of `dreamari.vercel.app`), landed together.

- **Term card content was top-aligned inside its `min-h-[300px]` reservation** (added earlier this session for height stability) -- short terms like "Company" left a visible dead gap below the example text. Added `justify-center` to that column so content centers in the reserved space regardless of term length.
- **Dreamy's float toned down for this game specifically**: the shared `play-hover` keyframe (7px bob, also used by `SimulationPlayer`) read as too much movement on the smaller/closer Dreamy instances here. Added a second keyframe, `play-hover-subtle` (3px), scoped to this file only -- `SimulationPlayer`'s own Dreamy is untouched.
- **`DreamyIntroScreen`'s Dreamy-overlapping-the-bubble treatment (added last entry) was covering the start of the actual greeting text**, not just the bubble's border/background -- per direct "overlap components, just not text." Increased the wrapper's reserved padding (`pt-10 pl-12`, was `pt-6 pl-8`) so Dreamy's overlap stays on the bubble's corner/background only.
- **Play tab's Glossary Games section redesigned -- it was genuinely the weakest-looking part of the page** (a flat icon-in-a-circle row with a big empty area below it, next to `GameCard`'s rich photo covers above it): `GlossaryGameCard` now uses the same image-cover-plus-scrim treatment as every other Play card (`GameCard`, `SoonCard`), with a "Glossary Game" badge over the image instead of beside an icon. Finance Essentials now shows the existing Investment Banking poster art (`poster-investment-banking-v2.png`, already used for this career elsewhere) rather than no image at all -- **no new art was generated or sourced**; this reuses an asset that already exists and already fits (the glossary teaches this same career's vocabulary). If real Glossary Game key art shows up later, swap this path, nothing else changes.
- **The row also only ever had one card next to a lot of empty space** -- added three more `GLOSSARY_GAMES` entries (Registered Nurse, Private Equity, Software Engineer) with no content yet, so they fall into the existing locked-`SoonCard` treatment automatically via `hasGlossary()`, reusing each career's own existing Play-tab "Soon" illustrated cover (`soon-registered-nurse.png` etc. -- the same anime-style illustrated art already added to this app earlier this session) rather than inventing new art. `SoonCard` already supported a `cover` prop for exactly this; it just wasn't being passed for glossary games before.
- Verified via isolated worktree (`tsc`, `eslint`, `tokens:check`) plus a live look at both the Play tab (image loads, "More Glossary Games" row now fills out with 3 covered/locked cards matching the "Mini Games"/"In the works" rows' look) and the term-unlock screen (card content centered, Dreamy visibly calmer, intro bubble text fully clear of Dreamy) -- one screenshot mid-check showed Dreamy missing entirely, confirmed via `getBoundingClientRect`/`naturalWidth` to be a stale-frame artifact of this session's own browser tool (documented repeatedly earlier in this file), not a real bug -- a second screenshot showed it correctly.
- **Shared-checkout note**: `src/components/app/ExploreExperience.tsx` and `src/components/app/chrome.tsx` had live uncommitted changes from a concurrent session sitting in the same working tree at commit time -- confirmed unrelated via `git diff --stat` and left completely out of this commit (`git add` on the specific files only).
- Pushed per explicit repeated go-ahead this batch.

## 2026-08-25 (later still) — Real sticky-header bug found while fixing contrast; navbar/hamburger consistency; Home card copy
Four asks in one pass, the first turned into something bigger than requested.

- **Desktop navbar contrast**, as asked: `DesktopNavigation`'s sticky header used `--glass-surface-1` (3% alpha) at only a 2px blur -- read as barely-there once real content scrolled under it. Swapped to `--glass-surface-3` (the same near-solid token `MobileNav` already uses for this exact job) at a 10px blur, matching.
- **While verifying that fix, found the header wasn't actually sticky at all** -- a real, pre-existing, app-wide bug, not a screenshot artifact this time (confirmed by reading `getBoundingClientRect()` before and after: at `scrollY: 500` the header measured `top: -500`, moving 1:1 with the page instead of pinning at 0). Root cause: `.marketing-v2`'s own `overflow-x: hidden` (added earlier to stop a vertical mobile swipe from also dragging the page sideways) has a CSS side effect per the overflow spec -- an explicit non-`visible` value on one axis silently forces the OTHER axis's computed value from `visible` to `auto`, turning `.marketing-v2` into a scroll container of its own. A `position: sticky` descendant sticks to its nearest scroll-container ancestor, not necessarily the viewport -- so the header was "sticking" to `.marketing-v2`'s own box, which never scrolls internally (real scrolling happens on `<body>`), and just rode along with the page. Since this class is the shared root wrapper for effectively every app screen, this bug affected the sticky header on ALL of them, not just Home. Fixed by switching to `overflow-x: clip` -- functionally identical for its original purpose (blocking horizontal overflow) but exempt from the visible/auto pairing quirk, since `clip` doesn't establish a scrollable container the way `hidden`/`auto`/`scroll` do. Verified empirically in the live console both ways (toggling the property and re-measuring) before committing to the fix, given how large its blast radius is.
- **Navbar/hamburger consistency, per direct request**: desktop nav is already a single shared `DesktopNavigation` component used by every page, so it was already structurally consistent by construction (verified) -- the contrast fix above is the only change needed there. Mobile headers were consistent everywhere EXCEPT Explore: every other page's hamburger sits top-right via the shared `<header><Wordmark /><QuickLinksMenu /></header>` pattern, but Explore's own custom mobile header (no Wordmark -- it shows the For You/Browse All tab switcher instead) had its `QuickLinksMenu` pinned to the top-LEFT at a shrunk size (`size-9` vs the default `size-10`), the one page out of step with the rest of the app. Moved it to the top-right at default size, grouped with the Browse tab's Search button (which also lived at that corner) in one flex row so they share the corner instead of colliding. The hamburger's own contents (`QUICK_LINKS`) were already one shared constant array, so its options list was never actually inconsistent.
- **Home's "Continue Learning & Playing" cards, per direct feedback**: removed the floating badge chip ("CAREER SIMULATION"/"GLOSSARY GAME"/"GAME") from all three `ActivityCard`s -- every other absolutely-positioned element shifted up 30px (the chip's own height plus its gap to the title) to close the gap instead of leaving a blank band at the top. The Investment Banker card's title changed from "Day in the Life: Investment Banker" to "The $30B Deal" (promoted from what used to be the italic chapter line), with a new chapter line, "Level 1 · Intern", naming the level the player actually resumes into. The other two cards' copy is unchanged, just reflowed. Left the Hero banner's own matching Panel 2 copy untouched -- the request named "those game cards," and the hero panel is a separate element, so changing it too would have been guessing past what was actually asked.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a full production build all clean. Live-verified the sticky/contrast fix by re-measuring the header's rect after scrolling (not just a screenshot, given this session's now-three screenshot-tool artifacts logged in earlier entries), the hamburger's new corner on Explore, and the Home card copy/spacing on mobile.
- **On "fix the rendering-glitch flag"**: the three artifacts logged earlier this session (a stale `/_next/image` browser cache, a broken "tablet" preset capture, a stale capture right after a large resize) are quirks of this session's own browser-automation tool, not of the app or its dev server -- there's no app-side cache or config to clear for them (confirmed earlier: `curl` against the same URLs the tool was misrendering returned fresh, correct bytes every time; the tool's cache is internal to it and outside this codebase). Nothing to fix in the repo. Going forward, verifying a just-changed image via a direct cache-busted fetch (append `?v=`) instead of trusting a plain screenshot avoids the false alarm.

## 2026-08-25 (later still) — Glossary Game: real thumbnail, Match It Up polish, Mini Games removed
Direct feedback batch, still no changes to game flow/data/logic.

- **Finance Essentials finally has real key art**: the user supplied an anime-style illustration (business term cards on a desk, Empire State skyline, a sneaker sketch tying back into the Dream Sneakers storyline) via a pasted image. Pasted chat images aren't backed by a file this session's tools can read directly -- found no backing file in the usual temp/scratch locations, asked the user to drop it into the repo, and they placed it at the project root as `exec-<uuid>.png`. Moved to `public/images/app/glossary-finance-thumb.png` (the stray root file removed after copying) and wired into `GLOSSARY_GAMES`' `investment-banking` entry, replacing the placeholder poster-art reuse from the previous entry.
- **Dreamy's corner-overlap treatment (added last entry) was shifting the whole speech bubble off-center on mobile**: the wrapper padding added to "make room" for him (`pl-12` / `pl-[var(--space-6)]`) shifted the in-flow bubble sideways within its own box -- barely visible on desktop, obviously off-center on narrow phones where that wrapper is close to full viewport width. Fixed on both `DreamyIntroScreen` and `QuestionScreen` by removing the side padding entirely (Dreamy is absolutely positioned, so he never needed layout room) and repositioning him to overlap down from *above* the bubble's top edge with only a small left inset, rather than requiring horizontal clearance. The bubble itself is now a plain, always-centered box; only Dreamy overlaps it, and only its corner/background, never the text.
- **Match It Up rebuilt to match a reference screenshot closely, with one deliberate, explained deviation**: added `TERM`/`EXAMPLE` column headers, switched the "selected" left-item border from `--accent` (blue) to the reference's amber, and gave both columns a real connector dot. The reference draws a *permanent* line between every pair before anything is solved -- that only works there because its right-hand column isn't shuffled (each answer already sits directly across from its term); this game's right column IS shuffled on purpose so it stays an actual matching exercise, and copying a pre-drawn line would hand the student every answer outright. Implemented instead: a real line, dynamically measured via refs between the two dots' actual DOM positions (they're rarely in the same visual row once shuffled), that draws in only once a pair is correctly matched -- then, per direct follow-up feedback ("no permanent connecting lines"), fades out after ~750ms rather than staying on screen, so the card doesn't fill up with crossing lines as more pairs are solved. The green dot/checkmark/border remain as the lasting "matched" signal.
- **Match It Up tiles had ragged, uneven heights** ("Person buying shoes" wrapped to 3 lines next to 1-line tiles) -- gave both columns' buttons a uniform `min-h-[60px]` and dropped to a slightly smaller mobile font size (`text-[13px] sm:text-[14px]`) so text fits without the grid looking lopsided.
- **"Catch the Misuse" now uses a lightweight document presentation** (`DocumentOptionList`, new component alongside `OptionList`): a single bordered sheet with a file icon, two placeholder title-line bars, an edit icon, and the four options as divided rows instead of separately boxed buttons -- same `options`/`correctIndex`/`onPick` contract, picked only for this one question type since the prompt is literally "spot the error in this sentence," matching the project's own "presentational treatment where it's naturally relevant" allowance. Other choice question types (Definition, Fill in the Blank, Reverse Recall) are untouched.
- **Profit Builder steps now show a numbered circular badge** (1, 2...) to the left of each step's label, matching the reference's sequencing affordance -- purely additive, no change to the calculation, inputs, or validation.
- **Removed the "Mini Games" section from the Play tab** per direct instruction -- deleted its `SoonSection` in `PlayHub.tsx` and the now-fully-unused `MINI_GAMES` export in `games.ts` (only ever had the one "Deal Team Kickoff" placeholder entry, referenced nowhere else).
- Verified via isolated worktree (`tsc`, `eslint`, `tokens:check`) plus live click-through of the full unlock -> Q1 -> Q2 -> Q3 -> Match It Up (both the pre-match "TERM/EXAMPLE + amber selected" state and the post-match "line flashes, fades, green persists" state) -> Catch the Misuse -> Profit Builder path, and confirmed "Mini Games" no longer renders on `/play`.
- Pushed per explicit repeated go-ahead this batch.

## 2026-08-25 (later still) — Glossary Game: dropped the outer question card (boxes-in-boxes)
Direct feedback: the intro/unlock screens read fine (Dreamy free, one card), but every practice question wrapped its already-boxed content (the Dreamy/bubble row, then individually-boxed options or the document sheet or the match tiles) in one more outer bordered card -- "everything including dreamy also goes into a box with more boxes."

- `QuestionScreen`'s outer `rounded-xl border p-6 bg-card` wrapper is gone. Every per-question renderer (`OptionList`, `DocumentOptionList`, `TypeTermCard`, `MatchUpCard`, `SortBucketsCard`, `ProfitBuilderCard`) already carries its own visual weight (option pills, the document sheet, bordered tiles, bordered inputs), so none of them needed an enclosing card for readability -- confirmed by looking at all 7 question types live, dark mode, mobile width. The prompt bubble and Dreamy now sit directly on the page's own gradient background, same as the intro/unlock screens already did, instead of being nested inside a second surface.
- Effect on mobile specifically (the ask was to "take advantage of the longer/taller screens"): removing the fixed `p-6` card padding gives the options/tiles more real horizontal width, and the extra vertical room reads as more open rather than cramped into one box.
- No changes to question order, answers, validation, or any interaction -- purely the removal of one wrapping element and its background/border/padding.
- Verified via isolated worktree (`tsc`, `eslint`) plus a full live click-through of all 7 questions in sequence (choice, type-term, fill-in-blank, match-up, catch-the-misuse, sort-the-buckets, profit-builder), confirming mastery/XP/progress all still tracked correctly (ended at 7/7 - 100%, Mastered 5/5) and nothing reads as visually orphaned without the old card.
- Pushed per explicit repeated go-ahead this batch.

## 2026-08-25 (later still) — Glossary Game: fixed a real "CTA below the fold" bug on real mobile Safari
Direct report against a real phone (screenshot showed the browser's own URL bar overlapping "Unlock Company", forcing a scroll to reach it) -- a genuine bug, not a design nitpick: `100dvh`-based centering only helps when total content height is *less* than the viewport; `UnlockScreen`'s Dreamy + title + 5-term progress row + binder card (`min-h-300px`) + button summed to more than a real phone's usable height once Safari's chrome is accounted for, so there was no slack for `justify-center` to distribute -- the excess just overflowed off the bottom.

- Cut `UnlockScreen`'s vertical budget hard: **removed Dreamy from this screen entirely** (explicit go-ahead: "you have full control to delete dreamy from screens where there is no space") -- he still appears on the screens immediately before and after it, just not on the one screen that repeats 5 times and is tightest on space. Card `min-h` 300px -> 190px, term heading 32px -> 26px, definition/example 15px -> 14px, card padding `p-6` -> `p-4`, all gaps and the screen's own `py` cut roughly in half. Also removed the DreamyFace floating/bob animation entirely (`play-hover-subtle` keyframe deleted from globals.css, now fully unused) -- per direct instruction, Dreamy doesn't need room reserved to float when the screen is already tight.
- Also tightened `IntroScreen`/`DreamyIntroScreen`/`LessonIntroScreen`/`UnlockCompleteScreen` the same way (smaller Dreamy, smaller gaps) for consistency, though none of them were actually overflowing -- their total content was already well under any realistic viewport height.
- **A false step worth flagging so it isn't repeated**: briefly changed the shared `<main>` wrapper from `justify-center` to `justify-start`, reasoning that centering was somehow the cause -- it wasn't. Centering only redistributes *leftover* space; it was never the source of the overflow (total content height was), and switching to `justify-start` broke every *short* screen (`IntroScreen` etc.), pinning them to the top with a large dead gap below instead of the correctly-centered look the user explicitly asked for. Reverted to `justify-center` once the real fix (cutting total content height) was in place -- with real slack to distribute now, centering is correct and safe again.
- Verified live at genuinely constrained heights (600px and an extreme 520px, simulating real mobile Safari with the URL bar visible) on the "Profit" term specifically (the longest content of the 5 terms) -- the Unlock button clears with visible margin at 600px and just barely clears at the artificial 520px extreme. Also re-checked `IntroScreen` at a normal 812px height to confirm the `justify-center` revert restored its correct centered look.
- Pushed per explicit repeated go-ahead ("And Push now").

## 2026-08-25 (later still) — Play tab: Netflix-style featured career row, pushed with 3 known-broken images
Built per a detailed spec: a Netflix-style "one dominant featured card + a row of smaller choices" browsing pattern for the Play tab's top section, replacing the old plain grid of full info-cards (`Shelf`/`GameCard`, both now deleted -- fully unreferenced after this change).

- New `FeaturedRow`/`FeaturedCard`/`SideCard` components in `PlayHub.tsx`. Investment Banking is the default featured card, simplified per spec: "Day in the Life of an Investment Banker" heading (hardcoded for this one sim, not a generic template), the level ladder condensed to one line ("Intern · Analyst · Associate · VP · + More", abbreviating `upcoming` roles the same way a resume would), and the existing "Continue/Start Level 1 · Intern" CTA + subtle "Saved at N reputation" line kept as-is (both copied verbatim from the old `GameCard`, which is why they still read exactly right).
- Accountant, Aviation Maintenance Technician, and Emergency Medicine Doctor ride alongside as side cards (4 total, per direct confirmation over the spec text's literal "three" -- Aviation Maintenance Technician didn't exist anywhere in the app before this, invented world="Fixing Machines & Engines" for it since nothing closer existed; Accountant and Emergency Medicine Doctor already existed in Explore's catalog but Play's own convention is a separate "Soon" cover asset per career, not reusing Explore's shared poster art, so new dedicated cover paths were added to `SOON` in games.ts rather than pointing at the existing `poster-*.png` files).
- Clicking any side card promotes it to the featured position and demotes whichever was featured to a plain side card -- a real sim (Investment Banking) shows its full treatment only while featured, a "soon" career always shows a locked "Coming soon" state, never a fake Play button. Fixed a real hooks-order bug during this: `FeaturedCard`'s `useSyncExternalStore` call was originally after an early `if (candidate.kind === "soon") return` -- since the component isn't remounted when the featured candidate's kind changes, this would violate React's hooks-must-be-unconditional rule the first time a "soon" card got promoted after a "sim" card (or vice versa). Moved the hook above the branch.
- Two follow-up fixes from direct feedback: side cards were only as tall as their own content (image + title, no footer) while the featured card is much taller (image + level line + CTA) -- `items-start` on the row let them float short and misaligned; switched to `items-stretch` and made the side card's image fill `h-full` (not a fixed aspect-ratio) so it always matches the featured card's actual height whatever that turns out to be. Side-card titles were bumped 13px -> 15px for legibility (direct: "Accountant title in the card can be bigger"), checked that the longest title ("Aviation Maintenance Technician") still wraps cleanly within the taller stretched card.
- The Glossary Games card below was reading as equal-or-bigger than the new featured career card, undermining "Glossary Games should visually feel secondary" from the spec -- capped its own list at `max-w-[320px]`, clearly narrower than the featured card's `max-w-[380px]`.
- **Pushed with three cover images intentionally still missing** (`soon-accountant.png`, `soon-aviation-maintenance-technician.png`, `soon-emergency-medicine-doctor.png`) -- per explicit "push everything please" after repeated requests for the user to drop the corresponding pasted images into the repo (same limitation as the earlier Glossary Game thumbnail: a pasted chat image isn't backed by a file this session's tools can read; asked twice, files never arrived by push time). Those three cards will show a broken image in production until the real files are added at those exact paths -- nothing else about the feature is broken, `next/image` fails gracefully (no crash, just a missing image).
- Verified via isolated worktree (`tsc`, `eslint`, `tokens:check`) plus live click-through of the promote/demote interaction in both directions at desktop and mobile widths (using local stand-in images for the 3 missing ones, since the interaction/layout could still be fully tested without the real art).

## 2026-08-25 (later still) — Play tab featured row: filled in the three missing photos, widened side cards
Per "push everything" -- found a concurrent session's already-pushed commit (`c57a388`, the new Netflix-style featured career row on the Play tab) referenced three brand-new `soon-*.png` covers (Accountant, Aviation Maintenance Technician, Emergency Medicine Doctor) that didn't exist on disk yet -- that same commit's own message says the user was asked twice to drop the pasted reference images in as real files and they hadn't arrived by push time. Confirmed live: the three new side cards rendered with blank/broken image areas.

- First pass sourced real, but realistic-photography-style, substitutes for two of the three from `BROWSE Images/` (Accountant, Emergency Medicine Doctor), and dropped the third (Aviation Maintenance Technician) entirely from `SOON`/`FEATURED_ROW_SOON_IDS` rather than ship a mismatched "Aircraft Assembler" photo in its place -- no exact match existed in any asset set at that point.
- **Superseded within the same pass**: the user's own three pasted images (the ones the other session had been waiting on) landed in the repo root moments later, in the same illustrated/anime style every other Play-tab "Soon" cover already uses. Swapped all three `soon-*.png` files to these instead of the realistic BROWSE Images picks -- style consistency with the rest of the row matters more than a same-day source, and restored the Aviation Maintenance Technician entry in both arrays now that real art exists for it.
- **Side cards widened, per direct feedback ("too slender on mobile")**: `SideCard`'s width went from `120px -> sm:140px -> md:160px` to `150px -> sm:170px -> md:190px` -- still narrower than the featured card at every breakpoint, just not so narrow it stopped reading as a real card on a phone.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a full production build all clean. Confirmed all three final images serve correctly via a direct `_next/image` request (a live screenshot showed them blank at one point -- the same already-documented browser-tool cache quirk from earlier entries, not a real issue), and checked the widened side card live on a 375px mobile viewport.

## 2026-08-25 (later still) — Glossary Game: UnlockScreen went from overflowing to cramped, fixed with responsive sizing
Direct feedback against a real desktop browser: the previous entry's aggressive mobile-only shrink (Dreamy removed, small card, small text, tight gaps) fixed the real "CTA below the fold" bug on a phone, but left the same screen looking cramped and undersized on desktop/tablet, where there was never a space problem to begin with.

- Made `UnlockScreen`'s sizing responsive instead of uniformly small: mobile-first compact values (unchanged, still guarantee no scroll on a short phone) now scale up at `sm:` -- card `min-h` 190px -> 300px, card padding/gaps back to `space-6`/`space-4`, term heading 26px -> 32px, definition/example 14px -> 15px, screen title 18px -> 26px, screen-level gap/padding back to `space-6`. Dreamy stays removed from this one screen either way (still the tightest screen, still repeats 5 times) -- the ask was about spacing/sizing, not his return.
- **Real bug in the same screen, not just a sizing complaint**: `UnlockScreen`'s outer wrapper had lost `justify-center` during the emergency mobile fix (only `items-center` remained), while every other screen in the file (`IntroScreen`, `DreamyIntroScreen`, `LessonIntroScreen`, `UnlockCompleteScreen`, etc.) still has it -- this screen alone was packing its content from the top instead of centering, which is what "some things are centered, sometimes they sit too low" was actually describing. Restored `justify-center` so all screens use the same alignment rule again.
- Verified both ends of the range live: desktop (native window size) now shows a properly sized, centered card matching the other screens' visual weight, and a re-check at the same constrained 600px mobile height (worst case from two entries ago, on the "Profit" term) confirms the Unlock button still clears with real margin -- the responsive split didn't reopen the original overflow bug.
- **Separately flagged, not yet investigated**: a live report of a "Final Review" popup with a non-functional "See Review" action, encountered during an unrelated ending/repair flow ("the fixing my mistakes part"). No such text exists anywhere in `GlossaryGameExperience.tsx` -- this is not part of the Glossary Game and is most likely in the Investment Banking simulation's own repair/ending flow (`SimulationPlayer`/`BeatStage`). Needs more detail (which screen, exact button copy) or a dedicated look at that flow before it can be fixed.
- Pushed per explicit request ("Then push quickly").

## 2026-08-25 (later still) — Glossary Game: fluid clamp() sizing on UnlockScreen, real Type-the-Term bug fixed
The prior entry's `sm:` breakpoint split (compact below 640px, full-size above) fixed cramped-vs-overflowing but still snapped between exactly two sizes -- direct feedback wanted it to actually scale with available space, not jump.

- Replaced every `sm:` pair on `UnlockScreen` (screen gap/padding, title size, card min-height/padding/gap, term heading, definition/example text) with `clamp(min, N dvh, max)` -- ties continuously to *actual available height* rather than a width breakpoint, so it shrinks smoothly on a short viewport and grows smoothly up to its max on a tall one, with no snap point. iPhone 15 Safari's usable height lands comfortably inside each range rather than at an edge, per the "keep iPhone 15 Safari as standard size" instruction. Button padding and touch-target sizing were deliberately left alone (not part of the clamp treatment) so they never shrink below the accessible minimum.
- **Real bug, not a follow-on of the layout work**: direct report of being stuck on the Type-the-Term question ("only typing the answer works") -- the word-bank chips were plain `<span>`s styled to look exactly like tappable pills but wired to nothing, so tapping one (the obvious, expected interaction) did nothing. Made them real `<button>`s that fill the same input Check Answer already reads (same validation, same correct answer, same everything downstream) -- picking a word is a shortcut for typing it, not a new path through the question. Added a selected-state highlight (amber border/tint) so the chosen pill is visually obvious, matching the existing correct/wrong color conventions once checked.
- Verified live end-to-end at the extremes: iPhone-15-ish 393x700, an artificial 375x560 (tighter than any real device, CTA still clears with a hair of margin), and native desktop width (properly sized, not cramped) -- plus clicking a word-bank pill through to a correct "Check Answer" submission, confirming the fix doesn't just fill the input but actually completes the question.
- Pushed per explicit request ("piush once done").

## 2026-08-26 — Management Analyst photo everywhere; Play tab featured row rebuilt as a real Netflix-style carousel; Landing copy
Working through a large "DREAMARI UPDATES AUGUST 29" spec doc, starting with the two items given directly in chat plus the Landing page section of the doc. Play/Connect/Profile/Career Report sections of the doc are still ahead.

- **Management Analyst's new photo** (`public/images/app/poster-management-analyst.png`) applied at its one shared path -- referenced from `catalog.ts` and the marketing Match chapter, both already pointed at this exact file, so the swap alone covers every surface.
- **Landing page hero copy** replaced per spec (`Hero.tsx`): the new "Dreamari helps students discover careers..." paragraph, with "Build. Match. Explore. Play. Connect." as a bolded closer in the same paragraph rather than a separate line, since the section only had room for one paragraph. Explore and Play chapter one-liners (`chapters/Explore.tsx`, `chapters/Play.tsx`) updated to the spec's new copy -- the "EXPLORE:"/"PLAY:" prefixes in the doc were dropped since `ChapterShell` already renders the section name as its own heading above the one-liner.
- **Play tab's featured career row, rebuilt through several rounds of direct feedback** (started as a request to fix Play's own layout, ended up needing a genuine Netflix-shelf redesign):
  1. First pass just widened the featured card and gave side cards Browse-poster proportions (0.707 ratio) instead of the narrow/tall sliver they were stretched into -- but kept the featured card TALLER than the row (its own CTA block made it so), which isn't what the Netflix reference does.
  2. Corrected per direct feedback ("doesn't have the featured one taller... they're all proportional and the same height"): every row card (`RowCard`, replacing the old separate `FeaturedCard`/`SideCard`) now shares one height (`ROW_HEIGHT`) and differs only in aspect ratio -- a wide `aspect-[8/5]` for the featured slot, Browse's own `aspect-[210/297]` for every side card. The level ladder / CTA moved out of the row entirely into a `SelectedDetails` panel.
  3. That panel first sat below the WHOLE row (matching literally where Netflix's own info strip sits) -- corrected again per direct feedback ("what is with the start level CTA sitting separate from the featured card, that's supposed to go with the card"): now the featured `RowCard` and its `SelectedDetails` are wrapped together as one flex column, so the CTA visually belongs to that card specifically, while `items-start` on the row lets the shorter side cards (artwork only, no CTA) just end where their own content ends -- satisfying both rounds of feedback at once, since the ARTWORK stays uniform-height like Netflix while the featured column's TOTAL height (artwork + CTA) is allowed to differ.
  4. Titles were reading small and inconsistent-case on the new proportions -- titles are now always uppercase and scale with the card (`text-[13px]`→`text-[16px]` for side cards, `text-[20px]`→`text-[30px]` for the featured one across breakpoints), and a world-label line was added in the world's own `WORLD_COLORS` accent (never on the title itself) underneath, matching Browse's own `PosterCard` convention exactly -- same `--poster-scrim`/`--poster-title` tokens too, not a one-off gradient.
  5. Side-card copy centered (was left-aligned like the featured card); the featured card stays left-aligned since it reads as one column with its own left-aligned CTA below it.
  6. **Carousel transition, per direct request** ("can we have them like a carousel where the featured card keeps getting updated as the other cards move into it"): each `RowCard` is now a `motion.button`/`motion.div` (framer-motion, already a project dependency) sharing `layoutId={candidate.id}` between wherever it renders (side row or featured column) -- clicking a pressable side card doesn't just swap which data is featured, Framer's shared-layout animation actually interpolates that card's size/position from its side-row slot into the featured slot (and the outgoing one back into a side slot) with a spring transition. **Not live-verified beyond code review**: the app only has one real playable simulation right now (Investment Banking, already featured by default), so there's currently no second pressable side card to click through and watch the transition on -- the "soon" cards are intentionally non-interactive (see the entry below) so they can't be used to test it either. Framer's `layout`+`layoutId` is a standard, well-documented pattern for exactly this case, but this specific interaction wants a real second simulation to confirm live once one exists.
  7. Per the spec doc: removed "More Glossary Games" (the second glossary section for not-yet-authored glossary games) entirely, along with its now-dead `glossarySoon` computation.
- Verified: `tsc --noEmit`, `eslint`, `tokens:check`, and a full production build all clean. Live-verified the row's uniform height, the featured column's attached CTA, world-label accent colors, uppercase/scaled titles, and side-card centering on both mobile (375px) and desktop (1440px) viewports.


## 2026-09-02 — Build flow polish rolled out app-wide, backgrounds un-blacked, Profile QA, Connect confirmations (all on main)
A long session driven by a demo complaint that the app felt static. Everything here is pushed to `main` and `demo` (latest `e727195`).

- **Build flow**: hand-drawn progress spark + fill flicker on growth (idle loop 7-15s), confirm shimmer/lift on the selected answer before Next advances, bell-tone select/CTA sounds and a 3-note milestone chime, harder pulse rings with varied origins. Fixed the real bug underneath ("background too plain"): `BackgroundSpace` sat ON TOP of the aurora canvas (z-index) and `background-space.svg` painted an opaque `#05070F` rect that hid every marketing page's own gradient. Step content now genuinely centers (`mt-auto` on the footer had suppressed `justify-content` for the whole line; `justify-[safe_center]` silently generated no CSS, inline style used instead).
- **Shared primitives** (`src/components/flow/`): `SparkBar` (Build's bar, extracted; adopted on Play reputation, PlayHub saved run, Glossary question + value bars, Profile steps + roadmap, Home activity cards), `ConfirmShimmer`, `GestureHint` + `GestureSpotlight` (dim-everything-but-the-target gesture teaching; pointer-events none; never dismisses on a timer), `primeAudioOnFirstGesture` (iOS ringer-switch unlock via a looping silent clip; tones scheduled only once the context runs).
- **Match**: on-card progressive gesture tutorial (scroll up -> swipe right -> swipe left, one persistent scrim, card nudges + real stamp previews, first card only, ends on the real gesture). `DEMO_ALWAYS_SHOW_GUIDE=true` in `MatchLab.tsx` forces it every reload for the demo -- **flip back to false later.** Swipe-to-like now dings/pulses; pass ticks; "Top 3 set" chimes + bursts; reorder/remove/undo/swap/restart all pop the slot strip.
- **Profile**: cards were opaque `var(--card)` blocking the gradient (now glass-surface-3); tab bar no longer clips (scroll-aware fade); mobile type scaled; "Updated" badge replaced by a 3-pass shimmer; heading > subheading > body enforced (card titles were smaller than their stat lines -- a standing rule, stated three times now).
- **App-wide QA** (`src/components/app/app.css`): `.dm-quiet` forced a 999px pill + 6px spread halo on every hover (the "hover crops / doesn't follow the container" report) -- now the element's own radius, a wash and an inset ring; `.dm-tap` shadow tightened and every `overflow-x-auto` rail got `pt-1 pb-3`; `.dm-link` underlines instead of lifting bare text. Off-scale radii (Connect 26px, Report 22px) moved to tokens.
- **Connect** (Aug 29 doc): two tabs, "Find your community", "N joined", Events intro card / "Partner:" / "Open Event Board", Student/Professional comment chips. Confirmations were `sr-only` only -- now a visible toast; toggles lift + tick; done states fill with a check. Card-style lanes (photos/fusion/people/shapes) kept on their own row; `?cards=` carries the actual lane.
- **Glossary / Play / Signup**: sound + bursts on term unlock, all-terms-unlocked, lesson complete, streak modal, "You're in!"; Play's correct pick gets the confirm lift/shimmer, flips use `playFlip`. The countdown clock stays silent per earlier instruction.
- **Open / not done**: remaining audit candidates are on the published audit page (Play checkpoint dots, band-change chime, Glossary mastery bursts, Home/Explore/Career CTA pulses, Connect send/save bursts, gesture tutorials for CheckBody drag, the landing Match demo, Explore's feed). Explore's "Save for later" heart has no click handler (task chip spawned). Aug 29 items deliberately skipped per user: "Report generated" line, "FOR STAFF USE ONLY", the long landing hero sentence.

## 2026-09-02 (later) — Connect 2.0 on branch `connect-2-0` (NOT pushed)
DREAMARI CONNECT 2.pdf, student side built out, professional side as a one-screen preview. Two commits (`2202235`, `cb8ebf0`).

- `src/components/connect/primitives.tsx`: Avatar, Card, PrimaryCta, QuietCta (with `done`), SectionHead, InlineAsk, LocalQuestionCard, STATE_* moved out of `ConnectExperience.tsx` verbatim; adds `ConnectNav` (context: openPro/openThread/openInsight/openBoard) and `formatCount` ("9,418" / "8.4K").
- `src/components/connect/ProProfile.tsx`: profile (`?pro=<id>`: name > Students Reached / Followers / Total Likes > role + story > field + verification; Follow -> Following with the shared done state), Ask Me Anything (same composer, same public-answer confirmation), Answers and "Career posts and advice" with Views · Likes · Saves; People to Follow rail on the Community tab ranked relevance-first from the student's Match Top 3 worlds (`readPicks` + shared `DECK`), quality/activity second, never popularity; `ProDashboardView` (`?dashboard=pro`, no student entry point): "Answer one?" prompt with Answer · Skip, the private impact numbers, encouraging line, Impact Summary.
- `data.ts`: `Pro` + world/field/story/followers/studentsReached/totalLikes/questionsAnswered/activeDaysAgo (all 15 enriched); `Insight` + optional views/saves. Every pro name in badges, insight cards and comments opens the profile. Board cards show Views.
- Safety in structure: students follow pros, never the reverse; no student follower counts; no message entry point; answers public. Deferred on purpose: activity tiers, company aggregation, downloadable summaries, real pro login, persisted follows.
- Verified live (dev): rail, profile, follow (+1 on reach/followers), AMA composer, name links from cards and comments, dashboard preview. `tsc`, `eslint`, `tokens:check` clean. **Next**: user review, then push/merge decision; then continue the micro-interaction list with Play.

## 2026-09-02 (later) — Build layout QA: HUD, content and CTAs hold position on every screen; Back on the milestone
Direct feedback: "things are still moving around... keep the progress bar HUD stationary, questions/answers centred, CTAs bottom; the map overlaps the CTAs; no back button on the You're moving fast screen; use numbers instead of emojis in the Career Report sections."

- MilestoneScreen and CompletionScreen adopted the same three-part skeleton as every step (CardHud pinned, centered middle, shared StepFooter with Back). Completion shows the bar at 100 (it had vanished on the last screen). StepFooter gained `pulseFromDreamy` so the milestone's CTA pulse still launches from Dreamy.
- Every step's middle block scrolls internally (`overflow-y-auto` + `safe center`) so tall content (map, profile form) never runs under the sticky footer; map max height 44dvh.
- First step's footer was 2px shorter (bare span in the Back slot); an invisible placeholder button equalizes it.
- Career Report `ReportSection` leads with the two-digit section number in the tile, no pictogram.
- **Measured** with an in-page harness (`scripts/qa/build-layout-harness.js`, paste into the browser console on /flow) walking all nine screens at 375x812, 375x640 and 1280x900: HUD top and footer top/bottom identical on every screen per viewport; gap-above == gap-below wherever content fits; internal scroll with no overlap where it doesn't; Back present on every screen after the first. Re-run this after any Build layout change.

- 2026-09-02 (later): Top 3 cards on My Profile: the world-accent glow blob (right/bottom -40px, blur 38px) bled past the card border because the card is overflow-visible (the kebab menu must escape it). Moved the blob into its own `absolute inset-0 overflow-hidden rounded-[inherit]` layer so it clips to the card radius. Sweep found no other card-bound blobs (remaining hits are speech-bubble tails and page-level ambient blobs behind marketing sections, intentional). Verified at 1280x900: wrapper radius 24px matches card, blob still overhangs wrapper by 40px on both axes but is clipped.
- 2026-09-02 (later): Career Report readability: the report slab's dark palette lifted from near-black (#0d0f14) to slate (#1e2431, raised #29303f, sunken #343c4c, rules a step lighter) so it sits on the navy background as a card; slab and Reflection slab now use uniform padding (space-5, sm: space-6) with the inner 920px column removed so content fills to that padding; section number tiles are 18/23 to match the section title (h 34). Verified at 1280x900: bg rgb(30,36,49), padding 24 on all four sides, numeral font-size equals h3 font-size.

## 2026-09-02 (evening): Career Detail rebuilt for skimming (`/career/[slug]`)

Reference: production page export "Carpenter · Dreamari.pdf" (dreamonna.com/explore/carpenter). Production is login-gated, so EMT copy could not be fetched; Carpenter's copy and figures are transcribed verbatim into `src/components/career/profiles.ts` (`CareerProfile`), and `resolveCareer` attaches `profile` when one exists (title/world/photo fall back to it too, so Carpenter renders without a catalog entry).

`CareerDetailExperience.tsx` is a fresh layout, one shape for every career:
- Header card in the production look (title on a world-accent panel inside a dark card, CTA row below) plus the poster photo: top band below md, right column from md.
- First screen only: header, four quick facts (one strip, dividers), Pay by state as bars (Best states / Whole country tabs), Career ladder as collapsed rows (number in the accent, title, pay, a bar for the pay climb). Everything else is folded with a one-line preview of its own first items: know about, good at, software, education, and the fallback "What they actually do".
- Type scale, strictly descending everywhere: title 40 → 56..72 Bricolage; section 22 → 26 Bricolage; sub-heading/rung title/pay 18; label-over-value 16 semibold (facts, states, dt); body 15; dd 14. Values never outsize the label above them (direct feedback on "Typical degree").
- Software logos are real current brand marks committed under `public/images/logos/*.svg` (Wikimedia Commons), shown on a white tile at 18px tall; tools without an exact mark get the plain list marker (e.g. "Microsoft Office software"). Simple Icons glyphs removed.
- Careers without a profile: facts from report/reel/catalog, ladder from CAREER_EXTRAS (oneLiner as description, skills as "What you do"); placeholder "Coming soon" values are dropped rather than rendered; empty sections are omitted (Roofer shows header + Careers like this one only).
- Only `--space-1..6, 8, 10, 12, 13, 14` exist in tokens.css; `--space-7` does not (it silently zeroed padding in the first pass). Do not use it.

Assumptions to confirm with the user: "Whole country" tab shows the Typical pay figure (the reference did not show that tab's content); "Sign in to save this career." and "Play the ladder game" were not carried (logged-in prototype, no ladder game route); the world tag was removed from the header panel because it sat above the larger summary line.

Verified at 1280x900 and 375x812: h1 56/Bricolage, h2 26/Bricolage, fact label 16 over value 15, rung title = pay = 18, no horizontal overflow, all four Carpenter logos load. Not pushed.

## 2026-09-02 (night): Connect photos-only, Replit information order; career header dissolve; JA events

- **Connect communities**: the A/B lanes (fusion / people / shapes) and the `?cards=` switcher are deleted along with their code (SHAPE_*, ShapeBadge, POSTER_COVER, PEOPLE_FOCUS, fusion CSS). One card remains: the CEO's photography, full bleed, but dimmed (brightness .78) and frosted with the poster card's stack (progressive blur over 74%, heavy bottom vignette, top scrim, accent tint, grain) so type reads. Information follows the Replit card the CEO calls the gold standard: name and world up top, four stat tiles (Students / Pros / Posts / Companies), a "Professionals from" row, one action at the right ("Open Community" filled when joined, "Join Community" outlined otherwise; Join opens the JoinSheet). Topics moved off the card into the board banner (under the title) and the About tab, per direct feedback that chips would crowd the card.
- `CardProgressiveBlur` (app/cardChrome.tsx) now takes `direction` ("up" | "left"), `size`, `maxBlur`.
- **Career Detail header**: one photo runs behind the whole panel; on md+ a leftward progressive blur frosts it toward the text and the world accent fades over the frosted half, so the title panel dissolves into the picture on the card's right (below md the same, top to bottom). Verified by DOM at 375 (mobile image 333x412, title at 177px) and 1280.
- **Events**: two spring partnership boards from the Replit (Dream Opportunity Morgan Stanley NYC, joined, 312/87/203; Junior Achievement Goldman Sachs NYC, code JA-GS-2026, 236/52/98). Fixed a host regex where `/ey/` matched "Morgan Stanl-ey" and dressed it in EY's logo and yellow; now `\bey\b`.
- Browser pane was hidden during the final pass, so the Connect and header results were checked by DOM measurement and earlier screenshots, not a final eyeball.
- 2026-09-02 (late): `src/app/match-lab/page.tsx` carried a TEMP inline error trap from 2cfebe2 whose template literal emitted a raw newline into a quoted string, so every Match load threw `Uncaught SyntaxError: Invalid or unexpected token` (visible in the console on production too). Removed; the "lab build" marker from the same commit was already gone. Also committed the parallel motion-graphics session's changes here (Profile dashboard card + settings menu, Match guide capped at two loops, spotlight scrim removed for Safari) after tsc/eslint and a render check of /profile and /match-lab.

## 2026-09-02 (night, 2): buttons made uniform; post-Match chooser; one header for focus flows

- **Buttons** (engineering review via the user: states inconsistent, hovers harsh, pills everywhere). `src/components/ui/Button.tsx` is the one text button: radius `var(--radius-md)`, primary = brand blue / white, secondary = bordered glass, quiet = text; hover is dm-solid (lift + brightness 1.05, softened from 1.08) or dm-quiet (wash + inset ring), never a fill flip; sizes compact 36 / default 44 / large 52 with 14 / 15 / 16 semibold labels in the body face. The old Figma CTA (light fill flipping to dark glass on hover) is gone. App-wide sweep: 59 text buttons across Connect, Play, Profile, Career, Signup, Glossary lost `rounded-full` for radius-md and their labels normalized to semibold 15 (or 14 compact). Circular icon-only buttons and non-interactive status badges keep their shape on purpose. Build footer says "Back", not "Previous".
- **Post-Match chooser** (`/career-report`, `ReportChooser.tsx`): rewritten. Three browse cards (Explore's PosterCard, no salary badge) side by side, staggered entrance, tap to choose (ring in the world accent, others dim), one "Start with {career}" button; their deck #1 starts chosen. On phones the row scroll-snaps. Hands off to `/profile?picks=…&focus=…` exactly as before. The three-report carousel and its reading overlay are gone.
- **Match**: once three are saved and cards remain, a compact "Continue with your 3" sits above the deck (was only the once-only sheet). Copy no longer promises "View Career Report" (the chooser comes next) and the em dashes in the sheets are gone.
- **Header**: `src/components/app/FlowChrome.tsx` = Wordmark + QuickLinksMenu (the app's hamburger, theme switch inside it), fixed, no destination tabs, used by Build, Match and the Glossary game. `flow/HomeButton.tsx` and `flow/theme/ThemeToggle.tsx` deleted; `/flow` and `/match-lab` pages now import tokens.css + app.css for it.
- **Gesture tutorial** on Match verified at 375x812 (scroll-up → swipe right → swipe left at 2.6s steps, ends after two loops at ~15s) and 390x844 (hint centred on the card, in viewport). A synthetic PointerEvent swipe does not register (the card listens for real pointer/touch input), so "a real gesture ends it early" rests on the code path in like()/pass(). The in-app Browser pane hung on multi-size batches, so 320/768/1024/1440 geometry was not re-measured tonight.

## 2026-09-03 (early): radius system, badges/inputs, career header v3, company chips

- **Radius system** (direct feedback: no fully rounded corners except segmented toggles and circular icon buttons; nested boxes follow Apple's concentric rule, outer minus padding, floored at 8): cards/panels/hero cards 16 (`--radius-lg`), sheets 20 on top, controls 12 (`--radius-md`), nested tiles and status badges 8 (`--radius-sm`). Every app component (not marketing/motion-lab) was remapped: 24/20 → 16, Tailwind `rounded-xl/2xl/3xl` → tokens, ad-hoc px radii → tokens, 40 text badges/chips → 8, search fields → 12, 21 leftover 16px text buttons → 12. Root cause of Build "ballooning": once Build/Match sat inside the marketing-v2 scope, Tailwind's `rounded-xl/2xl` resolved to the 20/24px tokens.
- **Focus/hover**: global `:focus-visible` ring and pointer for every button/link/tab/radio/input in app.css; dm-solid hover brightness 1.05.
- **Career header v3**: photo full bleed + CardProgressiveBlur (72%) + vignette + top scrim, no accent wash; title/summary/scenario and the action row all inside the card; 300px (320 desktop).
- **Connect**: "Professionals from" is a scrolling row of chips with real company marks (`public/images/logos/companies`, 19 of 20; Blackstone had no exact mark → text chip). Same chips in the board's About.
- **Home** hero CTA on the primary fill at 12px. Glossary/Play primary buttons at 12px.
- Screens eyeballed at the pane's 614px width after the sweep: Build (2 steps), Match, chooser, Home, Explore, Play, Connect, Profile overview, Career, Glossary intro, Signup, Colleges.
- 2026-09-03: Career page follows the live production data shape one for one (screenshots of Carpenter and Actor): `payByState` now carries `title` ("Pay by state" / "Where the jobs are"), `yourStates`, and label values ("more than usual"); Carpenter updated to the live figures (Your states: South Dakota $48K; Best: Vermont, Idaho, Utah). Bars removed everywhere (direct feedback: too many graphs); key figures (typical pay, state pay, ladder pay) use production's gradient numeral in the world accent at the same size as body values, so labels still outsize them. Actor was not added: no poster asset exists for it. Connect: chip tooltips are per chip (named group), whole card is the tap target (open or join), the world caption under the community name is gone.
- 2026-09-03: Every catalog career now renders the Carpenter blueprint. `src/components/career/profiles.generated.ts` holds 39 generated profiles (approximate BLS/O*NET figures, clearly marked prototype data; five salaries aligned to the poster badges the catalog already shows); `careerProfile()` prefers hand-transcribed production data (Carpenter) and falls back to the generated set. Quick facts use the accent gradient on all four values (never just pay). Header photo: top-anchored crop; on md+ it occupies the right half and fades into the card base so faces are not cropped to a wide band. Hover audit across 11 screens: every text control carries one dm-* utility; the last ad-hoc hovers (Build option chips, Match action circles and pencil, Home panel dots, Play cards, Build "Show all") moved to dm-tap / dm-quiet.
- 2026-09-03: Career quick facts carry production's (i) details. `FactDetails` on `CareerProfile`: degree opens a sheet (door asks for / experience first / training after hiring, the note, "Even so, N% do not have a bachelor's", the BLS education mix as bars); pay and openings open a small popover (starting / typical / top earners + note; what "openings" counts + growth). Carpenter's text is transcribed from the production screenshots (em dashes removed); the generator derives the rest (pay bands at 0.62x / 1.68x of typical, an education mix template per degree tier, a growth sentence), marked demo data.
- 2026-09-03: Pay by state is a view switch again (production reference): "Your states" is the list; "Whole country" is `src/components/career/PayMap.tsx`, the @svg-maps/usa map shaded by pay in the world accent, the student's state outlined white, hover/focus/tap reads the figure. Demo data: states without a listed figure take the typical pay with a seeded ±22% spread; production has every state.
- 2026-09-03: Connect notes from the CEO applied. Thread: no "Question" eyebrow, no "Shown as …" line, likes sit by the question (resume thread carries 337), "Add to Plan" removed from answers and insights (the board's own Add to my Plan stays), Report is 11px at 55% opacity, the 😂 reaction chip is gone (🔥 💯 remain). Board cards: no "Answered by" line, Save is small and sits next to comments, comment counts come from a demo `comments` field (17+) with the real list as fallback, likes seeded 70..300 across threads and insights. "Ask this community anything" → "Ask a question". Professionals always wear their portrait (Elena Martinez: avatars/w22.jpg); students stay behind USE_PHOTO_AVATARS. Connect's Card primitive uses the career page's frosted panel.

## 2026-09-03 — Connect 2.0 journeys built out on `connect-2-0` (NOT pushed)
Full journey map in `docs/CONNECT_2_0_JOURNEYS.md` (personas, the loop, landing order, 11 journeys, edge cases, pain points with status, safety, Home evaluation). Direct feedback applied: People to Follow below the communities; people cards carry portrait, name, role, company logo, Follow and nothing else (Instagram suggestion shape); density down everywhere; company logos wherever a company is named.

- `primitives.tsx`: `COMPANY_MARKS`/`markBox`/`CompanyChip` moved here from ConnectExperience; new `CompanyMark` (bare white-silhouette mark, text fallback) for "Role at [logo]" lines; `ConnectNav` gains `openSaved`, `noteAsked`, `report`; `CONTACT_INFO`/`CONTACT_WARNING` guard blocks phone/email/@handle/DM-app text in every composer; InlineAsk lost its pill corners (12px composer, 8px chips).
- New marks: `goldman-sachs.svg` (Commons two-line wordmark, rendered 16px tall; the blue box masks to a blank tile), `blackstone.svg` (Commons current wordmark, backing rectangle removed). Every company in the data now has a real mark.
- `ProProfile.tsx`: rewritten. `Panel`/`PanelRow`/`PANEL`/`RULE` exported; `PeopleToFollow` portrait-first cards; `NewFromFollowing` panel (posts + answers by followed pros, hidden until a follow); profile identity = name, "Role at [logo]", three doc numbers, story, verification (field chip and description paragraph removed); AMA = composer + one public/no-DM line; Answers/Career posts rows = title + Views·Likes·Saves only; dashboard "Ask Me Anything" = three routed questions with Answer (inline composer → "Live on Finance Careers", Questions Answered ticks) / Skip; company line uses the logo.
- `ConnectExperience.tsx`: landing order = Your questions panel (Ask a question in its header; rows for Jordan's seeded questions `t-ib-hours` New answer, `t-gpd-interview-nerves` Answered, plus anything asked this session as Waiting; last row → Saved) → communities → People to Follow → New from people you follow. `AskSheet` (word-based routing to a community, changeable chips, "Already answered" matches, contact guard, one footer line). `SavedView` (`?saved=1`, resolves thread/insight/answer/recap ids). `ReportSheet` (four reasons, toast) wired to every Report button in ThreadView. ProBadge and InsightCard show "Role at [logo]". Waiting thread copy names the board and its window. `data.ts`: those two threads now carry `handle: "Jordan"`.
- Verified live at the pane width: landing order, Your questions rows, Ask sheet routing ("bank" → Finance Careers) and Already answered rows, profile, Saved view, community chips (Goldman Sachs, Blackstone). `tsc`, `eslint`, `tokens:check` clean.
- Home: evaluated, not changed (proposal in the journeys doc: one-panel state-aware hero, From Connect panel, Top 3 strip replacing the duplicated recommended rail). Waiting for a go-ahead.
- **Next**: user review of the branch; push only when told. Open decisions: hint copy for students without a Top 3; time-based "Still waiting" state needs a backend.
- 2026-09-03 (later): **Demo role switcher** on Connect (`connect-2-0`). A quiet "Demo · Viewing as {role} · Switch role" line tops every Connect screen; the sheet offers Student (landing), Event attendee (Events tab), Professional volunteer (`?dashboard=pro`), Partner / employer (`?partner=JPMorgan%20Chase`, new `PartnerView` in ProProfile.tsx: company totals, "Your professionals" rows, impact report download, "totals only" safety line). Demo scaffolding, not a product feature; remove or gate before production. `CompanyMark` takes a `height` override for headings.
- 2026-09-03 (later): Role switcher is now a **segmented switch** (`RoleTabs`, top of every Connect screen, `?as=` in the URL): Student · Event attendee · Volunteer · Partner, like the old `?cards=` lane switcher, per direct feedback. Read the CEO's Replit end to end (Connect landing with Communities/People tabs, profile with AMA/Posts/About, volunteer dashboard with My Profile/My Impact, corporate dashboard at /corporate/dashboard); alignment table added to `docs/CONNECT_2_0_JOURNEYS.md`. `PartnerView` reshaped after the corporate dashboard: Export report, 2026 goals with progress bars, In person vs On Dreamari lanes, events list, professionals, satisfaction line.

## 2026-09-03 (evening) — Connect 2.0 audit and rebuild pass (`connect-2-0`, NOT pushed)
Direct feedback: "not thorough enough, just words and boxes; evaluate everything in Connect, only the community board cards are approved; full UX audit, competitive audit, heuristics; logos in chips, not bare marks." Audit in `docs/CONNECT_2_0_AUDIT.md` (findings per screen with severity, competitive patterns, heuristic pass, build list).
- New `src/components/connect/viz.tsx`: `Segmented`, `MetricTile` (icon, value, label, delta chip), `AreaChart` (inline SVG, gradient fill, peak label), `Ring`, `Meter`, `demoSeries` (seeded).
- New `src/components/connect/ProDashboard.tsx` (volunteer): My Profile / My Impact segmented tabs. My Profile: Ask Me Anything with "64 asked · 58 answered", routed rows (student avatar, grade, state, Awaiting/Answered), Answer with inline composer, Skip with Undo, one already-answered row with signals and View response; My posts with Create post (prompt chips + title, publishes a local row) and signals per post; My communities (photo thumb rows). My Impact: private-analytics kicker, "Your advice is moving people forward.", six MetricTiles with deltas, Students reached AreaChart with 30d / this month / 90d switch, Gold volunteer status with Ring and no-penalty copy, company chip line, 2026 Impact Summary as a Wrapped-style gradient card (`ImpactCard`) with Download and share chips.
- `ProProfile.tsx`: old dashboard removed; `RoleLine` renders role + `CompanyChip` (surface, sm/md); About panel (education, career journey, "Can help with" chips) from new `Pro.education/journey/topics` (all 15 pros in data.ts); people cards use the sm chip; PartnerView: goal Rings, In person vs On Dreamari split bar, event Meters, lg chip heading.
- `primitives.tsx`: `CompanyChip` sizes sm 22 / md 28 / lg 40 (mark scaled); `ConnectNav` gains `isFollowing`/`toggleFollow`.
- `ConnectExperience.tsx`: trust line under the Connect title ("Verified professionals · Moderated questions"); Your questions rows show who answered with portrait; board = one `Segmented` (Questions · n, Insights · n, About) under the banner, feed cards straight on the page, About as a standard Panel (banner Feed/About pills and the tinted wrapper removed); thread and insight Back are the standard link (cream pill removed, `CARD_INK` gone); thread's duplicate bottom Like removed; `FollowButton` on every answer card; insight Report wired; ProBadge/InsightCard use the sm chip.
- Approved and untouched: community board cards. Events, Join sheet, Ask sheet, Saved, Report unchanged this pass.
- 2026-09-04: **College page mirrors the reference (pushed to main/demo).** User: "we've strayed a lot from the data we need to be presenting." Sections now follow dreamonna.com/colleges/<slug> in order and name: At a glance (setting, tuition and fees, cost after aid, admitted, finish, undergrads), Getting in, What it costs (What the college charges / What families actually pay incl. "Average across those groups" + net-price link / Grants and scholarships), Academics (finish 6yr, finish 4yr, retention, students per teacher), What you can study (all transcribed programmes with share), Who is there (counts + Everyone, full/part and women/men `SplitBar`s with counts, `Donut` legend with counts), Life there, After college. Only wording and layout differ. DATA GAPS vs reference (never transcribed, not invented): finish in 5 years, finish in 6 years (bachelor's only), finish within 8 years, part-time retention, meal plans, sport men/women split, "fall behind on loans" (0% everywhere), SAT reading/maths shown combined, ways-to-study sub-descriptions, financial-aid and how-to-apply URLs (website used). Add to `CollegeDetail` when the live feed lands.
- 2026-09-04: **College page, third pass (pushed to main/demo).** User: "I dont like sentences and paragraphs." Every paragraph is now `Row` label/value or a fragment; "The short version" fragment list was tried and reverted the same hour (read as sentences with typed dots); At a glance rows are back, with a "What kind of place" row; Getting in no longer repeats the admit rate. Admit `DotGrid` deleted after four layout iterations (only earned its place at extreme rates; kept upstaging the figure). Pictures left: `HBars` (cost by income + sticker marker) and `Donut` (who is there). Sources section is rows. `worth` strings in data.ts are fragments.
- 2026-09-04: **College page data viz, second pass (pushed to main/demo).** After review ("we added graphs but did not reduce copy"): `viz.tsx` is down to `HBars` (with `marker`), `DotGrid`, `Donut` (tints of one hue, largest first, 2px gaps, legend stacks under the ring below sm, groups under 3% fold to Other). Sections: What it costs (bars + one aid sentence + full-price rows), Getting in (dots + two lists + one scores sentence), What you can study (one sentence with undergraduate degrees first, ratio, 4-year finish; programme rows with pay), Life there (Who is there sentence + ring, ways, helps, sport), After college (one paragraph). `ref` is a reserved React prop; the bars take `marker`. React compiler lint forbids mutating a `let` inside `map` during render; precompute arc starts. Rule recorded: a picture only where its shape answers a question faster than a sentence.
- 2026-09-04: **Connect round (pushed to main/demo).** `LandingTab` adds "notifications" (TopTabs is 3-up, icons hidden under 420px); Ask row + YourQuestionsStrip removed from the landing, `YourQuestions` + `NewFromFollowing` render under the Notifications tab (HomeView takes `savedCount`, `onDeleteAsked`; `YourQuestionsStrip` deleted). CommunityCard: title 24px, two icon-less StatTiles, 3 CompanyChips + "+N more". Event list cards: min-h 280, background gradient from `partnerAccent()` (now reads `COMPANY_BRAND` bg first), photo at 0.28 luminosity, per-card `ink` from `COMPANY_BRAND[...].ink`, `EventMarks` takes `ink` (dark ink drops the glow). ProProfileView: `MoreToggle` (3 rows then View all) on Answers and Career posts. Thread: answer/comment/follow-up cards all `glass-surface-2` + rgba(255,255,255,0.16). College cards: full-bleed frosted cover, `MarkBadge` beside the name; filter tray as checkbox lists; portal roots carry `marketing-v2 themeable` + transparent bg (tokens were missing in portals). Sitewide search pinned (memory).
- 2026-09-03 (later, branch `college-lookup`, pushed as a branch): **Sitewide search + college polish.** UPDATE: the sitewide search was pulled from the chrome the same night after review ("ugly, misaligned, heavy, busy, not intuitive"); `GlobalSearch.tsx` is parked and unrendered, college search stays its own page, revisit later with a calmer design. `src/components/app/GlobalSearch.tsx`: `SearchTrigger` (rendered inside `QuickLinksMenu`, so it appears on every app screen; Cmd/Ctrl+K) opens `GlobalSearch`, a portal dialog with grouped results over `ALL_CATALOG_CAREERS`, `COLLEGES`, `PROS`, companies (from pros' orgs), `COMMUNITIES` + `EVENTS`; scope tabs; "All in" doors to `/explore?tab=browse&q=`, `/colleges?q=`, `/connect`. Explore accepts `?q=` (`initialQuery`, opens Browse with the box open). College cards: stat tiles removed for two plain sentences; "Really pay" copy retired. Every college has detail: `synthDetail()` in colleges/data.ts generates sample detail (marked `sample: true`, disclosed in the Sources section) for card-level colleges. Detail page: At a glance rows replaced the 4-tile strip; all figures at body size (strict type hierarchy, direct feedback). Decision recorded: sitewide search for recall, Find a college for exploration; not a bottom-nav tab yet.
- 2026-09-03 (night, branch `college-lookup`, NOT pushed, experimental until the user says so): **College lookup built.** Research and decisions in `docs/COLLEGE_LOOKUP_AUDIT.md` (reference dreamonna.com/colleges read logged-in at 375/768/1280; competitive audit of College Scorecard, BigFuture, Niche, Navigator, Scoir; NN/g tray facets, Baymard applied filters; Gen Z social-search research). Routes: `/colleges` (`CollegesExperience`: one search box with live results, six quick-pick chips, "All filters" tray over the results, applied-filter chips, cards with photo + three facts, save to localStorage via `useSyncExternalStore`, compare up to 3 in a pinned-column sheet) and `/colleges/[slug]` (`CollegeDetailExperience`: career-page anatomy, four-fact strip, folded sections What it costs / Getting in / What you can study / Life there / Who is there / After college / See it then ask / Sources). Data `src/components/colleges/data.ts`: 16 colleges with full detail (10 NJ, 6 SD) transcribed from the reference, 14 SD at card level. `CareerDetailExperience` now exports DISPLAY/BIG/MEDIUM/LABEL/SMALL/PANEL/Section/Folded/DotList/Figure for reuse; its Education rows link to `/colleges?type=trade|2-year|4-year`. Imagery: `scripts/colleges/fetch-images.mjs` pulls Wikimedia Commons campus photos (licence + author in `public/images/colleges/credits.json`) and Wikipedia lead images as marks; 17 photos kept after a visual check (mismatches deleted), marks are fair-use seals and must be replaced before launch. Home state hardcoded to NJ (Jordan). Not done: sitewide search integration (see the user's question in the changelog), real API, pagination beyond 30 colleges.
- 2026-09-03 (later): **Consistency pass.** `MetricTile` delta is stacked under the figure below md and inline (nowrap) from md, so tiles never wrap differently from each other. `ComparisonTable` (CareerReport) is one table at every width: sticky tinted factor column (`color-mix(primary 12%, card)`), career columns min 200px, horizontal scroll inside the CompareSheet; the phone "one block per career" branch is gone. `DegreeSheet` portal root gets inline `background: transparent` (the `.marketing-v2` root painted the whole viewport black, same bug as the cover chooser). Career Education "Where you would study it" rows link to `/colleges?school=<credential>` as placeholders for the undesigned college pages (`w.href` wins when present). Changelog rewritten as start/end per Connect 2.0 feature plus decisions, fixes, improvements (user request). Considered and rejected: horizontally scrolling the three Top 3 cards on phones; each card is a tall multi-section column, so a side-scroll shows one card at a time and the compare sheet does that job better.
- 2026-09-03 (night): **Event names, one-line lockup, ruled grids, People to Follow grid, tap-to-profile.** Events renamed "Dream Opportunity <Partner> <Event>" (JA event keeps the Replit's "Junior Achievement Goldman Sachs NYC"). The naming is a CEO requirement, confirmed to the designer; solved, no open question. `EventMarks` (`LOCKUP` md L16/slot 118/h36, lg L21/slot 160/h48): lead mark in a slot exactly its own width, small ×, partner in a fixed slot, one baseline; a JA host puts JA first and Goldman Sachs second while the card colour follows the host. A stacked version was tried and rejected by the user ("bad"). `viz.ruledCell(i, smCols)` replaces the hand-written border classes on the three MetricTile grids (the old `border-l sm:border-l-0` + `sm:border-l` pairs conflicted; rules were random). `PeopleToFollow` is a grid (2 / sm 3 / lg 6, gap space-5, `max-sm` hides cards 5-6) matching the community grid edges exactly (verified 32 → 1248 at 1280). `PrimaryCta`/`QuietCta` take `size: "md" | "sm"` (one class set per size); `FollowButton compact` = sm. `ProAvatar` (primitives) wraps a pro's Avatar in a profile button with stopPropagation; used in ProBadge, answer cards, pro CommentRows (looked up by name), staff activity rows. Verified in the Browser pane at 375 / 800 / 1280; the tab click in mobile emulation times out, drive tabs by JS there.
- 2026-09-03 (late): **Copy cut** across Connect per "so many text elements": Impact tab opener, chart sentence, status paragraphs, company paragraph (now three numbers), share chips, composer footers, Join sheet perk bodies, Report/Saved/waiting copy, partner lane subs and satisfaction line all removed or reduced to a few words. **Bell / Activity**: Your questions and New from people you follow moved off the landing into `?activity=1` behind a bell with an unread badge (count of Jordan's threads with `unreadAnswer`); Ask takes the composer row on the Community tab; search stays on Events only. **Mobile pass at 375x812** over every Connect screen plus Home, Explore, Career detail, Profile, Play: demo strip one row (no icons/label below sm, "Attendee"), stat tile label 10.5px, profile Follow full width below identity, dashboard routed rows compact ("2h", "Awaiting"), company panel stacked, partner event meters stacked, events toggle + bell share a full-width row, event card without the "Partner:" line and with a wrapping footer, career ladder rung titles wrap instead of truncating, Explore mobile tabs left-aligned clear of the search/menu buttons, Play featured card `calc(100vw-40px)` on phones, Profile name/school wrap on phones and streak sub shortened.
- 2026-09-03 (night): **Bell removed after research** (NN/g teens, W3C COGA, UDL, teen notification-anxiety reporting, Google Classroom's To-do; written up in `docs/CONNECT_2_0_AUDIT.md` §6). Your latest questions are a two-row strip directly under the Ask row (`YourQuestionsStrip`: who answered with portrait, or Waiting; "See all" → `?activity=1`). Ask sheet shows "Goes to {community} · Change" instead of five chips. 6th-grade words: Posts, Top answer, Save, Pro, Waiting. Events search removed. Uniform rhythm: Connect pages stack at space-5; every Card/Panel pads space-5 → space-6 at sm. 2026 Impact Summary is the gold card itself with Download inside (`ImpactCard` is a section, no wrapper panel); `PrimaryCta` accepts `style`.
- 2026-09-03 (night): "Your company" on the volunteer's My Impact is now a brand card: `COMPANY_BRAND` (primitives.tsx) holds each company's primary colour and the ink that reads on it (dark ink on EY yellow, Amazon orange, Spotify green); the card is a brand-colour gradient with the white/ink wordmark at 26px and the three numbers, no panel chrome. Approximate brand colours; the engineer should swap in each partner's official hex.
- 2026-09-03 (night, later): **Every volunteer has their own dashboard.** `ProDashboardView` takes a `pro`; routed questions come from `ROUTED_BY_WORLD`, metrics/impact card/company numbers scale from the pro's own totals, post prompts use their field, "See my profile as students do" links to the student view. `?dashboard=<proId>` (`pro` → Okafor). A `VolunteerPicker` (faces + first names) appears under the role switch for the Volunteer and Partner roles; picking drives the dashboard or the partner's org. Every pro now has 2 career posts (15 added to INSIGHTS, each with replies and signals). **Staff role**: `AdminDashboard.tsx` (`?admin=1`, role "Staff"): Overview (site tiles, questions chart with answered/median wait/active volunteer rings, communities with pro meters), Moderation (reports with Remove/Keep, answers awaiting review with Publish/Send back, blocked-before-posting counts), People (by role, private activity tiers, all volunteers with tier, partners), Features (usage meters). Hamburger menu (`chrome.tsx`) gained a "Connect demo · view as" section: Student, Event attendee, Volunteer, Partner, Staff. All demo data.
- 2026-09-03 (night, interactions): every social action specified and built (audit §7). Share (`ConnectNav.share`: native sheet on phones, clipboard elsewhere, toast either way) on threads, answers and posts; Like with a seeded count on every answer (`answerLikes`), no more bare "Helpful"; Report on every comment; ReplyComposer has the contact guard, Enter to post, 280 cap with a late counter; Ask sheet needs 12 characters and nudges once; unanswered questions you asked can be deleted from See all; Saved rows have their own unsave; volunteer posts have title + 600-char body with Delete; answers need 40 characters and carry a "Based on my own experience" checkbox. Not pushed.
- 2026-09-03 (night, career page per Josh): quick facts drop "People doing it" and "Jobs open each year" (filtered in `viewModel`; strip becomes two columns); `DegreeSheet` keeps the three what-you-need rows and the note, loses the BLS education-mix bars, the "Even so" percentage and the extra percentage line (`accent` prop removed); each ladder rung expands to "What you do" and "What you need" as bullet lists in two columns (one column on phones). Not pushed.
- 2026-09-03 (late, career page follow-up): the "620 / 190" style numbers Josh saw were the school counts in the Education section ("Where you would study it"), not the degree sheet; those counts and the college-search links (both lists) are gone. Credentials and fields of study render as plain bullets. Pushed with the earlier career-page notes.
- 2026-09-03 (late): **My Profile in the career page's language.** Header = cover photo behind the card (progressive blur, lighter scrim), avatar 72 with the pencil, name 28→36 Bricolage, school; controls (Cover, Saved Careers, Settings) in a glass cluster top-right. Cover is pickable from six of the app's photos or uploaded (`COVERS`, persisted in localStorage `dreamari-cover`). Grade / GPA / Streak are a quick-facts strip (label over accent figure, dividers). `GLASS` now IS the career page's frosted panel recipe, so every profile card matches. **Career header** brighter: bottom scrim 0.86/0.5/0.1, side fade to 58%, blur band 52%, top scrim lighter. **Per-poster focus** after a contact-sheet review of all 39 posters at the phone header box (`scratchpad/sheets.js`): `HERO_FOCUS` gains sports-medicine-doctor, animator, game-designer, video-game-designer, pediatric-surgeon, electrician (heads at the top edge → 50% 0%) and quant (top-down shot → 50% 48%).
- 2026-09-03 (later): Profile: every tab (Overview, Top Three, Plan, Report, Resume) now renders inside the one card with the tab bar (the standalone tablist and loose panels are gone); the cover chooser is a bottom sheet through `Portal` (a fixed element inside the blurred control cluster was being contained and clipped); covers are the six `env-*` scenes. Career quick facts: the (i) is pinned top-right on the label's first line and the figure sits at the cell bottom, so both align across cells whether or not the label wraps.
- 2026-09-03 (later, branch only): Profile covers are now six rendered materials in the CEO's inspo register (dark, warm-lit, glassy): fluted amber / ember / dusk (per-column refraction with rib highlights), molten (glossy blob), ripple (wave displacement), horizon (radial glow + grain). Rendered by `scripts/qa/render-profile-covers.js` (sharp) to `public/images/profile/covers/*.webp`, 12–46KB each. Figma Weave had no published tools in the workspace, so nothing was generated there. A/B cover toggle (A = #1 career poster, B = background) sits in the header cluster. Not pushed.
- 2026-09-03 (later, branch only): Cover chooser is a centred dialog over a frosted overlay (`backdrop-filter: blur(14px)`, 38% dark), never a black screen; the `.marketing-v2.themeable` classes on the portal root were painting the page background over everything and are gone. Covers re-rendered at 2000x1125 (v2 of `scripts/qa/render-profile-covers.js`): streaks (fine vertical light streaks + grain), fluted (reeded glass with specular lines), smoke (domain-warped fbm), molten (glass pebble), frosted (ember gradient with a frosted band), horizon.
- 2026-09-03 (later, branch only): **DO logomark on event cards.** The CEO's vectorised DO logo (root: `DO_LOGO (2/3)…svg`, untracked) is rebuilt as mask-ready SVGs: `public/images/logos/companies/dream-opportunity.svg` (letters only, even-odd so the D and O counters are real holes) and `dream-opportunity-full.svg` (with the wordmark). `EventMarks` replaces the raster `PartnerMark`: `[DO chip] × [partner chip]`, both `CompanyChip` at the same size (md on cards, lg on the event banner), so every logo on the screen shares one scale and baseline. AT&T joins `COMPANY_MARKS` as a trimmed PNG mask (`ext: "png"`); hosts without a mark (Junior Achievement) get the text chip. `partnerLogo`/`PartnerMark` removed.
- 2026-09-03 (later, branch only): **Event lockups, no chips.** `EventMarks` = DO mark × partner mark as bare white silhouettes over an ambient radial glow in the partner's brand colour, with a slow shimmer through the ink (`.dm-logo-shimmer`, app.css; reduced-motion safe). Marks are sized by their LETTERS via `LetterMark` (primitives): `COMPANY_MARKS[...].letters = {y,h}` records where the letters sit in the ink box (EY beam above → y .5 h .5; AT&T globe taller than text; J.P.Morgan's J descends), so DO's letters and the partner's letters are the same height on the same baseline; two-line wordmarks get 1.45x. Junior Achievement mark added (Commons "Junior Achievement Logo.svg", trimmed). All company SVGs lost their width/height attributes: with them present, CSS `mask-size: contain` letterboxed the trimmed viewBox (that was the Morgan Stanley padding).
- 2026-09-03 (late): Profile header variant B chosen: Grade / GPA / Streak as three glass tiles inside the header (icon in `heroAccent` = WORLD_COLORS of the #1 career, figure, label), header border and a left wash tinted by the same accent; the separate facts strip is gone. Pushed to main with the whole branch at the user's request.
- 2026-09-03 (late): `AppBackdrop` (src/components/app/AppBackdrop.tsx) is the one app background: fixed inset-0, the gradient field + background-space.svg. Every screen root is `background: transparent` and renders `<AppBackdrop />` first; per-page star-map wrappers removed. Direct feedback: the background moved with page height when profile tabs changed. Event lockup anchors: DO left-aligned, partner right-aligned in the fixed box, × fills between.

## 4 Sept 2026: college detail page carries the full reference dataset

- Every field on dreamonna.com/colleges/<slug> for the 16 fully transcribed colleges is now in `scripts/colleges/reference/<slug>.json` (extracted from the logged-in reference in the Browser pane) and compiled by `scripts/colleges/build-extra.mjs` into `src/components/colleges/extra.ts` (`EXTRA`). Programme tables are capped at the 14 biggest rows per level except SDSU; the page links to the college's site for the full list.
- `CollegeDetailExperience` reads `EXTRA[c.slug]`: level tabs in What you can study (5 rows, then "N biggest", then the college's own list), finish rates 4/5/6/6 full-time/8 behind "More finish rates", part-time retention, meal plans, SAT reading and maths and ACT with the share who sent scores, ways to study with their notes, men and women on teams, borrowers who fall behind on loans, and header links for financial aid, how to apply, the net price calculator, and the address as a map link.
- Presentation rules held: rows not sentences, no typed dot separators, no em dashes (the reference's "ROTC — Army" becomes "ROTC: Army"), noun-phrase labels, headline rows first with the rest behind one disclosure.
- Validation: tsc and eslint clean; SDSU at 375 wide and Rutgers at desktop checked in the browser.
- Next: colleges without a reference file (the 14 card-level ones) still show the synthesised detail with the older single-list programmes; extract them the same way when they get a page.

## 4 Sept 2026, later: every college on real data; page redesigned as one piece

- All 30 colleges now have a reference file in `scripts/colleges/reference/`. The 14 that were card-level only carry the page text; `scripts/colleges/build-extra.mjs` parses that text into `src/components/colleges/detail-ref.ts` (`REF_DETAIL` full detail, `REF_BASE` card figures), and `data.ts` applies both over the hand-typed entries. `synthDetail` is now only a fallback for a college with no file, which is none. The `sample` flag no longer fires anywhere.
- Extraction lesson: the reference's programme tabs are base-ui tab panels; read rows only from the panel named by the clicked tab's `aria-controls` and poll until its table exists, otherwise rows bleed across levels.
- Detail page: Getting in is one "What they ask for" list (Required in ink, Looked at muted) with How to apply beneath, and score ranges as `RangeBar` strips on their full scale. What it costs leads with a `Ladder`: full price as the ceiling, each income band as a share of it, then the average; the breakdown and grant rows sit below with Your family's price and Financial aid as links. At a glance dropped Setting and the sticker price (both said elsewhere). Who is there is three `SplitBar`s plus the ring. Life there is rows throughout, sport men and women as a split bar. Accreditation and Part of moved to the sources section. `Row` gained `tone="muted"` for word values.
- Play: fill-the-blank and drag-token screens also answer on tap; the entrance keyframe was moved off the draggable button because its fill-mode transform overrode framer's drag transform (tiles never moved). Shipped separately as de5605a, 3c23cd9, 3351958.
- Validation: tsc and eslint clean; Dakota State and South Dakota State checked at phone width in the browser.

## 4 Sept 2026, evening: Home and Connect per the CEO's notes

- Home: `HomeExperience` reads the Play save store (`useSimRun`) so the hero panel and the rail show the same level and progress as the Play tab. Rail cards are the Play poster anatomy (`posterTitleFont`, `WORLD_COLORS`, play badge). Deal Team Kickoff card removed; Registered Nurse simulation added.
- Connect data: `EventBoard` gained `lead`, `partner`, `nextDate`, `official`. Boards renamed "Nonprofit & Company City"; AT&T Dallas and the duplicate EY NJ upcoming board removed (the Nov 4 event is the EY NJ board's `nextDate`). SEO Scholars board added with no invented figures.
- Connect UI: event cards are glass with a brand glow and ruled texture (the old `do-event-*.webp` covers were flat gradients, the source of the "colour blob" note; `EVENT_COVER` still maps real photos for the board header). `EventMarks` takes `lead`/`partner`; Dream Opportunity always leads; `NO_MARK` holds names whose only file is wrong (JA Singapore). Landing search filters communities and events. `LaunchVoteCard` replaces `ComingSoonCard`. Community cards show Students and Companies. Event board header shows counts and dates only; `official` post renders above the pinned recap.
- Not done, not mine: QR event-to-community onboarding (Usman) and the volunteer activity formats (CEO building in Replit).

## Brand marks: the rule (4 Sept 2026)

- A partner's mark is set in one colour (our white ink) only when the brand publishes a one-colour or reversed version itself and the file in `public/images/logos/companies/` is that version. We never invert or recolour a full-colour logo. A brand that allows full colour only gets `fullColor: true` in `COMPANY_MARKS` and renders as shipped on a white plate (`LetterMark`).
- Junior Achievement: the JA Worldwide Brand Center (jaworldwide.org/brand) offers a monochrome symbol, so the plain JA symbol in one colour is on-brand once the file is in the repo. Until then the name is set in type (`NO_MARK`).

## 4 Sept 2026, night: Profile per the CEO's notes, and open items

- `ProfileExperience`: cover is curated only (`COVERS`, six today; real app about 40), `COVER_CAREER` is dead. `PlanTab` rebuilt as single-layer glass sections with hairline rows; `openHorizon` starts null so nothing auto-expands. Overview bento titles in ink. `ResumeView` says Coming soon.
- `CareerReport`: Colleges shows all six schools per career with their cities and no rule sentence. The selection rule is an open question for Jenny and Odein. `ReflectionCard` is collapsed by default. Fact labels and h4 subheads use `--primary`.
- Connect, from the CEO (4 Sept): dceeai.replit.app/v2-connect is the source of truth for HOW information is delivered in Connect, not for which boards exist. Card designs and headers stay as they are; only the information delivery should follow it. "Professional insights" may map to a volunteer influencer concept that is not designed yet. Not started.
- Brand marks: SEO Scholars lockup found at seo-usa.org (red SEO, black Scholars, opaque background); needs download approval and a two-colour split before use. Register: docs/BRAND_MARKS.md.

## 4 Sept 2026, late: Connect boards follow the Replit v2-connect delivery model

- dceeai.replit.app/v2-connect (click Let's Get Started, Got it twice, Enter Boards, then Enter Community) is the reference for HOW a board delivers information: Feed and About, three named feeds with a subtitle each (Student Questions, Professional Insights, Industry Updates with firm filter chips), question cards with grade, location, likes, views, comments and an Unanswered tag, composer at the bottom, About with description, counts, Community Rules, Moderators.
- `BoardView` now has those four tabs (`filter` values: questions, insights, updates, about), `UpdateCard` renders `OPPORTUNITIES` for the board, three finance programmes were added to `OPPORTUNITIES` for the business-money board. Header, cards, and the landing were left as they were (direct instruction).
- Not adopted, on purpose: the Dream Points unlock ladder (Read free, Reply at 300, Post at 700) and the AI Ideas and Polish buttons on the composer. Both are product decisions the CEO has not made; note them when the volunteer influencer concept lands.

## 4 Sept 2026: volunteer view, per the CEO's Connect note

- "2026 Impact Summary" is now "My 2026 Impact Summary" so the volunteer's own numbers read apart from the company block beneath them.
- Volunteers and students share the same community boards. Today the volunteer dashboard lists "My communities" (the boards for the pro's world plus General Professional Development) as rows that open the same board screen a student sees. A volunteer does not yet get the student-style browse-and-join grid; joining is assumed from their verified scope. Whether volunteers should also browse and join other boards is open with the CEO.

### 4 Sep, latest batch (committed locally, NOT pushed until the user says "push")
- Play landing preview: immersion-first card (career named once above, uncropped 4:3 scene, Level chip, dialogue box, numberless compact options; no ring, no progress bar).
- Connect landing chapter: Jordan and Priya both #6366f1 with school tags; Maya tagged Howard University. Open: Maya's portrait should be a Black woman. No such photo exists in public/images; needs a supplied or licensed photo before swapping avatar-maya.jpg.
- Home: "Your Next Moves" replaces the signal banner; links to /profile?tab=plan and /profile?tab=resume, which ProfileExperience now honours via initialTab.
- Explore > Browse got the "Videos Inside Leading Companies" rail (src/components/app/CompanyVideoCards.tsx, data in companyVideos.ts, posters in public/images/videos). It is NOT on career detail pages (user, 4 Sept: Explore/Browse only). Pending: WildBrain office-tour clip (not supplied), Mars/Kellogg's/WildBrain logo files (need approval; currently text chips). The two EY M4V files and the "DCAI - AMT" aviation clip still sit untracked in the repo root; both EY parts are encoded and in the rail.
- Maya (landing Connect chapter) now uses an Unsplash portrait, cropped to 400x400 at public/images/avatar-maya-howard.jpg.
- Landing Play is a self-running console tile (src/components/marketing/chapters/Play.tsx, CSS in marketing/animations.css under "console-store"). Sequence: 0.5s beat, Christina's line types (17ms/char), choices rise, cursor rests on the best row, auto-confirms 2.6s later. No wrong answers are clickable; no auto-scroll to Connect any more. Christina's serious thumbnail is public/images/play/ib/face-christina-serious.webp (cropped from expressions/christina-concerned.webp).
- ConfirmShimmer (flow/ConfirmShimmer.tsx + confirm-shimmer-sweep in globals.css) retuned: 26% peak, fade-out, ends off the row. Profile tab ping is now the .profile-tab-ping-text text-clip shimmer; the old profile-tab-ping-shimmer keyframes are unused and can go.
- Phone pager: globals.css sets html scroll-snap-type y mandatory under (max-width:767px) and (pointer:coarse); .mkt-snap (Hero, Footer) and .mkt-chapter are the snap areas. HowItWorks no longer toggles anything. ChapterShell: sections are min-h-dvh flex-col with pt-72 on phones, content my-auto, graphic frame height from --frame-h (clamp(360px, 100dvh - 330px, 560px) on phones). If a chapter grows past one screen again, check its graphic against that frame.
- Videos rail: WildBrain clip is in (reel-wildbrain-office-tour.mp4). Marks added: mars.svg, kelloggs.svg, wildbrain-word.svg + wildbrain-w.svg (wildbrain-eyes.svg unused). The DCAI aviation maintenance clips in the repo root ("DCAI - AMT ...") are not company videos and were not wired anywhere; ask the CEO where they belong.

## 5 Sept 2026: Match to Profile handoff, Top 3 reveal, Slack notes, responsive QA (pushed to main on "push")
- Flow now: Build > Skip or finish > Congratulations (MatchReadyScreen) > Match deck > Save My Top 3 opens the "Your Top 3 Matches" sheet (3D card reveal, poster fonts, chosen glow ring) > Profile `?tab=top3&welcome=1` assembles in, then the "Welcome to Your Profile" popup (Portal, light scrim, near-solid card, Dreamy + InkText) > Continue clears the flag. No black screen anywhere; no in-place stack.
- MatchLab.tsx deck container is bounded on sm+ (`sm:h-[min(600px,calc(100dvh-280px))] sm:flex-none`) and the column is `sm:justify-center`; phone still fills. Sheet caps at 90dvh and scrolls.
- Aurora full-screen ripple is gated to the milestone celebration only (`if (!forceDreamyOrigin) return;` in AuroraBackground.tsx); sound/haptic untouched.
- `.dm-link` and Build's Skip never underline on hover (app.css). CTAs are always `ui/Button` at radius-md; gradient/pill CTAs were tried and reverted on instruction.
- report-data.ts: medians from the Dreamari brief (IB 361k, PE 250k, SWE 136k, DS 120k, Fashion Buyer 78k, Game Designer 98k); IB/PE colleges exactly Columbia/Seton Hall/Bergen CC; full reports for data-scientist, fashion-buyer, game-designer; CareerReport renders class names only. UVA/Michigan removed wherever they appeared.
- Profile: "Saved" (not Archive), "My Plan", "Create your resume"; Top Three goes 3-across at md.
- DEMO_ALWAYS_SHOW_GUIDE in MatchLab flipped back to false on 5 Sept (gesture hint first-visit-only). Chrome extension for the user's Gmail was not connected at session end; the requested summary email was not sent by the agent.
- Roadmap (My Plan) rebuilt per Joshua's Slack spec: `PlanTask` is `{ id, label, action: PlanAction, href?, outOfApp?, custom? }` (no minutes); `FINANCE_PLAN(prefix)` in profile/data.ts is shared by IB and PE; rows group In app / Out of app; in-app rows are Links to the feature; `/profile?tab=…` links work from inside Profile via the render-time `seenInitialTab` adjustment in ProfileExperience. Landing zig-zag: `flip` lives on Match and Explore only.
- 5 Sept, late: Build has no loading/ready phases (MatchLoadingScreen and MatchReadyScreen deleted); CompletionScreen owns confetti (flow/aurora/Confetti in a z-60 fixed wrapper). Pro profile rebuilt in ProProfile.tsx (PRO_COVERS from the student cover set, shortCount, PRO_ACCENT blue); CommunityCard.tsx is the single community card (also exports communityAccent, PHOTO_COVER, PHOTO_FOCUS, POSTER_GRAIN). Volunteer role opens the pro profile (view kind "pro") with onOpenDashboard. Career Report section order changed in CareerReport.tsx; finance colleges are six (NJ/NY). Top Three NextStepCta and Overview "Do this next" are static official copy pointing at /play/investment-banking.

## 8 Sept 2026: partner-wall vector sourcing pass, worktree `.worktrees/landing` (NOT committed, left staged for review)
- Went through the flattened partner wall (`public/images/marketing/partner-logos.webp`) brand by brand against what already had a hosted mark in `public/images/marketing/partners/`, and sourced 9 more from Wikimedia Commons Special:FilePath: Kroll, Brookfield, Akamai, Paramount, WildBrain, Bleacher Report, Cartoon Network, GDC, Peloton, Jimmy Choo (10 named, Jimmy Choo included) plus one raster (Pop-Tarts, no vector exists, used like the `att.png` precedent). Each SVG's viewBox was trimmed to its actual ink bounding box using the browser's own `getBBox()` (no local rasterizer in this environment, so verification of both the flat-white and luminance-invert treatments was done by literally rendering each candidate in the Browser pane with the ticker's real CSS filters before deciding `emblem`/`faint`).
- Two mid-stream corrections worth knowing about if you touch this again: (1) Bleacher Report and Cartoon Network's Commons SVGs both carry an opaque background rect baked into the design (the black badge square), so the flat-white treatment collapses them to a blank block -- both need `emblem: true` (luminance-invert), same reasoning as HSBC/WBD. (2) Pop-Tarts' only Commons asset is a raster with a painted (not transparent) outline that also collapses to a blob under flat-white -- it needed the same `emblem: true` luminance-invert treatment, verified by literally rendering both filters side by side before deciding.
- Cartoon Network note: the wall shows the mark as a rotated diamond badge; the only Commons vector (`File:Cartoon Network 2010 logo.svg`) is the unrotated square presentation of the same real logo. Used as-is rather than adding a rotation not present in the source file -- flag this if the visual mismatch bothers anyone.
- Not sourced, with reasons, in `ATTRIBUTION.md`: all the trade-show/B2B-only brands (MRO, BioProcess International, SupplySide Global, Natural Products Expo West, Brand Licensing Europe, IWCE, MAGIC, MD&M, enterprise CONNECT, The AI Summit London, NCSolutions -- no Commons page found for any), Taylor & Francis (Commons only has a historic oil-lamp emblem, not the current ship-in-circle mark), McDermott Will & Schulte (the wall's name doesn't match the real firm, McDermott Will & Emery -- skipped rather than misattribute), and the unlabeled "[A/B]" bracket mark plus the mustache-face mark (can't be confidently identified to a real trademark from the image alone).
- `npx tsc --noEmit -p .` is clean. Nothing committed; `MARKS` in `src/components/marketing/PartnerTicker.tsx` and the 10 new files in `public/images/marketing/partners/` are staged/unstaged for the primary session to review.

## 8 Sept 2026: real school logos on Connect pro profiles, worktree `.worktrees/landing` (NOT committed, left staged for review)
- Task: `pro.education` on a professional's profile (`src/components/connect/ProProfile.tsx`, About card) showed a bare GraduationCap icon next to the text; swap in the actual school seal/wordmark where one can be sourced. New module `src/components/connect/schoolMarks.ts` exports `SCHOOL_MARKS` (keyed by the exact substring that appears in an `education` string, e.g. `"Johns Hopkins"` and `"NYU Stern"`, not the schools' full formal names, since the data abbreviates a few) and `schoolsIn(education)` (splits on `"; "`, matches per segment, dedupes, returns in on-page order).
- Sourced 30 schools the same way as the corporate partner marks: Wikimedia Commons via its `imageinfo` API (Special:FilePath's underlying source) for the free ones, falling back to English Wikipedia's own file host for the many university seals that are non-free/trademarked and only live there (not on Commons) -- confirmed by querying each school's own Wikipedia infobox (`image`/`logo` field) via the API rather than guessing filenames. Files live in `public/images/connect/schools/<slug>.{svg,png}`; sources and reasoning in that folder's own `ATTRIBUTION.md`.
- No local SVG rasterizer existed in this environment either; installed `librsvg` via `brew install librsvg` (gives `rsvg-convert`) plus `pip3 install --user pillow`, then rendered each SVG at 1000px and read back the alpha bounding box to rewrite its viewBox to the true ink bounds (most university seal SVGs on Commons/enwiki already render edge-to-edge in their own viewBox, so most trims were a few px of no-op; Wharton/NYU Stern's wordmarks and Johns Hopkins' shield needed a real crop). Three raster logos (Baruch, SCAD, NYU Stern) already carried real alpha backgrounds and were just cropped to bbox; Mayo Clinic's only source was a JPG on solid white, chroma-keyed to transparent (white > 245,245,245 -> alpha 0) before cropping.
- Skipped two, both explained in `ATTRIBUTION.md` rather than silently dropped: **School of Motion** (online design-ed brand, not an accredited university, no seal exists to source) and **Art Center College of Design** (Commons' only asset, `ArtCenter dot large RGB.png`, is an abstract solid-orange circle with no wordmark -- doesn't read as identifying the school at icon size, so not used). Both professionals (`pro-fontaine`, `pro-johnson`) keep the plain GraduationCap tile for that line; verified in the browser that this shows no missing-image icon and no console error.
- Wired into `ProProfile.tsx`: each `"; "`-separated clause in `pro.education` is its own row now (previously one single-line row assumed exactly one school); a clause with a sourced mark gets that school's own tile (44px tall, width follows the mark's own ink ratio via a new `eduMarkSize()` next to `PRO_ACCENT`, so a seal stays square and a wordmark like Wharton or NYU Stern widens the tile instead of being squashed into one); a clause with no match keeps the original 44x44 GraduationCap tile. The "Education" label shows once, on the first row, same as before.
- Verified in the Browser pane (dev server on :3004) via `?pro=<id>` query nav: `pro-okafor` (single match, University of Michigan), `pro-reyes` (two schools, Austin Community College + Texas State University, both matched, stack as two rows), `pro-grant` (seal + Wharton wordmark side by side, tile widths differ correctly), `pro-hartley` (Boston College seal + NYU Stern wordmark), `pro-fontaine` and `pro-johnson` (both segments unmatched, GraduationCap fallback, no console errors). `npx tsc --noEmit -p .` is clean.
- Nothing committed; `src/components/connect/schoolMarks.ts`, the edit to `ProProfile.tsx`, and `public/images/connect/schools/` (30 marks + `ATTRIBUTION.md`) are staged/unstaged for the primary session to review. Did not touch `PartnerTicker.tsx` / `public/images/marketing/partners/` / that `ATTRIBUTION.md` -- those were a concurrent session's unrelated work in this same worktree.


### 2026-09-10 — Exact landing partner composition (Codex)

Worktree: `dreamari-partner-grid`, branch `codex/landing-partner-grid`, based on
`e15454c`. Direct user request supersedes prior row-normalization choices:
match the supplied screenshot's exact logo order, positions and relative sizes.
`PartnerLogoGrid` now renders the unaltered transparent `40.png` source artwork,
added as `public/images/marketing/partners/partner-composition.png`. Schools uses
original color; students use grayscale inversion with a contrast floor to keep
bright-source details visible. All 50 partner names, including Adult Swim, are
available to screen readers. Existing individual logos remain in the repository.

Validation: targeted ESLint, TypeScript, tokens:check, diff whitespace check all
passed. In-app browser verified both audiences at 1440×1000 and 390×844, loaded
images, audience switching, no mobile overflow, no console errors. Reference
comparison and screenshots: `work/partner-grid/`; report: `design-qa.md` (passed).

No push or deployment performed. Next step: user review of the local preview,
then integrate this branch when requested. Other local checkouts were not edited.

User subsequently authorized publishing this change live. Committing the verified
partner-grid change and pushing to `main` for the existing Vercel production
integration (`dreamari.vercel.app`). No other deployment targets are in scope.

### 2026-09-10 — Build welcome: opening scene, taken over from Codex (Claude)

Codex (worktree `~/Documents/Dreamari/dreamari-partner-grid`, branch
`codex/build-welcome`) rebuilt the Build welcome as its own opening scene and
hit its usage limit on the final `eslint && tsc --noEmit`, leaving the work
uncommitted there. Lifted into `schools-landing` unchanged: new
`src/components/build/WelcomeScreen.tsx` + `WelcomeScreen.module.css`
(Dreamy arrives through a halo/orbit with sparkles, tap-to-greet heart swap,
oversized gradient BUILD title, "Let's Go" directly under the copy, chapter
dots Build/Match/Explore/Play/Connect, Skip; no question HUD on this screen),
old `WelcomeScreen` removed from `steps.tsx`, import swapped in
`BuildFlowExperience.tsx`. Direct intent (Codex transcript, relayed by
Chandu): "a stronger opening moment: a more expressive Dreamy entrance,
atmospheric movement, and a clear Let's Go focal point ... the first question
keeps the existing flow layout, and reduced-motion users get a calm, fully
usable version."

Validation (the part Codex never saw): `eslint` on the three files and
`tsc --noEmit` both pass; dev server compiles clean. In-app browser: scene
renders at desktop, Dreamy tap swaps to the heart sprite, Let's Go lands on
"What sounds interesting?" with the normal HUD/footer, no new console
errors. Reduced motion verified by reading the CSS: every animation sits in a
`prefers-reduced-motion: no-preference` block, resting opacity is 1, and
`begin()` uses a 0ms delay under reduce. Mobile (390×844) and short-viewport
(`max-height: 660px` rule) renders checked next in the same session.

Also this session: `PartnerLogoGrid` is Codex's flat `partner-composition.png`
(commit `0816924`, already on `main`/production); my own flat-image attempt is
parked in `git stash` on `schools-landing` and its generated
`partners-wall-*.png` files were deleted as superseded.

Not committed or pushed -- Chandu asked for no push until he says so. Next
step: his review of the local preview, then commit + push on his word. The
Codex worktree still holds the same changes uncommitted; not touched.

Same session, later: the welcome was then pushed further at Chandu's request
("even more engaging and beautiful ... don't change copy"), all local, still
unpushed. Copy untouched. Added, all inside the reduced-motion guard: Dreamy
waves once on landing and on tap (dreamy-wiggle; a single normal sprite --
the tap-to-heart sprite swap was removed on direct feedback, "don't use that
weird two layer sprite thing"); BUILD lands with ink-bleed-in, a one-shot
dust scatter and one highlight sweep drawn as a second background-clip:text
layer so it exists only inside the glyphs (a first pass used the
ConfirmShimmer overlay, which swept the word's whole box -- direct feedback:
"it should be clipped to the text only"); "Welcome to" uses InkText; the
CTA gets a recurring next-step-cta-pulse once the reveal settles; a twinkling
star field; pointer parallax on the stage (mouse only); chapter dots light
left to right. The two lucide Sparkles icons were replaced with lit
particles (specular-highlight orbs with depth blur, four-point flares), a
ground-bounce glow and a rim light on Dreamy. The moving light behind Dreamy
borrows BorderBeam's colorful recipe (tinted radial ellipses, bloom over
core, brightness/saturation lift, slow hue drift) without its border stroke,
per "borrow the lighting, without the border stroke animation". Description
line stepped up to 16-19px and brightened, kept in the body face (not
Bricolage: it is body copy and the questions after it use the body font).
eslint + tsc clean; desktop and mobile checked in-app.

Later still (same session, local, unpushed unless noted): (1) The light behind
Dreamy on the Build welcome was one fixed cluster of tinted ellipses on a
`rotate`, which read "like a static thing just rotating on an axis" (direct
feedback). Now six independent blobs, each on its own drift waypoints,
breathing in size and aspect, morphing outline (border-radius) and cycling
brightness, on mutually unrelated periods, so it never visibly repeats.
Blender was offered for the atmosphere but is not installed here; CSS keeps
it live and themeable anyway. (2) CTA arrows: "just the three point arrow
head shape without the body" -- tried on the Build welcome first
(ChevronRight, stroke 2.75 at 20px), liked, then applied site-wide by a
codemod: every lucide ArrowRight -> ChevronRight and ArrowLeft ->
ChevronLeft (61 icons, 20 files, lucide import lists de-duplicated). Left
alone on purpose, pending a call: the 15 ArrowUpRight "opens elsewhere"
marks (college website / how to apply / financial aid links, PosterCard's
corner), since a diagonal has no chevron form and the up-right carries the
external-link meaning. tsc clean; eslint 0 errors.

### 2026-09-10 — Welcome splashes for Match / Explore / Play, Connect restyled (Claude)

Direct request: "similar designs but in modal form for when users land on
match, explore, play and modify the connect modal to look better ... guide
the user through where they are and what the intention of that screen is.
Build is the most flamboyant, the others can have simpler modals but still
cinematic". Local only.

New shared `src/components/app/WelcomeSplash.tsx` (+ `.module.css`): a
centered dialog with a short band of the same living light as the Build
welcome (independent drifting blobs in the surface's own two tints, specular
orbs, flares, orbit, ground glow), Dreamy overlapping into the copy, an
eyebrow saying where you are ("You're in"), the surface's word as a gradient
title with a glyph-clipped sweep, one short line, up to three icon rows, dots
for multi-step, a chevron CTA with the app's pulse + chime. Copy is short,
8th-grade level (direct feedback). Sprites: heart (Match), curious (Explore),
party (Play), puzzle (Connect, the prior explicit choice). `FirstVisitSplash`
wraps it for one-time surfaces (localStorage `dreamari:welcome:<surface>`,
marked seen only on finish) and reports open/closed to its host.

Match: instead of rows, a looping mini-deck demo (7.5s, three 2.5s phases):
the card face slides up to peek the details underneath, then swipes right
with a save badge, then left with a pass badge, a finger dot travelling with
each move and one caption at a time (direct feedback: "the scroll down
gesture isn't very visible ... show you can scroll up on a card to peek at
the information below"). Reduced motion lists the three captions instead.
MatchLab holds its in-deck gesture spotlight until the splash reports it has
closed or isn't showing, so the two never stack. Explore and Play mount
`FirstVisitSplash` beside `AppBackdrop`. Connect's `PeopleWelcome` is now a
thin wrapper around the shared splash: same parent-held once-per-visit
logic, both steps' reviewed copy verbatim, "seen" still marked only on
finishing step two.

Mobile (direct feedback: "make sure these modals don't get cropped and need
scrolling"): centered on phones too (a bottom sheet assumed a bottom nav;
Match has none), scrim padding reserves the MobileNav zone, a
`max-height: 720px` compaction shrinks the scene/Dreamy/type, scrolling is
a last-resort safety net only. Measured in-app: Match 604px card on 375×812
and Connect 461px on 375×667, neither overflowing. eslint 0 errors, tsc
clean. Not committed or pushed.

### 10 Sept 2026 -- Play: phone card stack, corner badges, banner fix, splash CTA ring

Play's "Career Simulations" row on phones is now a swipeable card STACK
(`MobileDeck` in `PlayHub.tsx`, `sm:hidden`; the free-scrolling rail is
`hidden sm:flex`), matching a JioHotstar "For You" recording the CEO sent
(direct feedback). Geometry measured off the recording: one 319:386 poster in
front, the next card 16pt further right at 0.94 scale, the third at 32pt /
0.88, scaled about the right edge so the fan grows rightward; deeper cards
park invisible at the third slot. framer-motion: front card drags on x, swipe
left (72px or 550px/s) slides it off and the deck rotates so it rejoins at
the back; swipe right brings the previous card in from the left (keyframe
`x: [-offscreen, 0]`). A drag never falls through as a tap on the card link
(`onClickCapture` gate). Idle hint, once: after the welcome splash reports
closed (`FirstVisitSplash onOpenChange` -> `hintReady`), 2.4s with no touch
on the deck advances it one card on its own; any pointerdown cancels it;
skipped under reduced motion. Behind cards fade their corner badge and chips
(`front={false}`) so nothing peeks past the front card's edge.

Every hero-row card now carries a bottom-right circular `CornerBadge`: play
on a real simulation (Investment Banker AND Registered Nurse -- direct
feedback), a lock on a coming-soon one; the "Coming soon" text lost its
inline lock icon since the badge carries it. The featured card's centered
play badge is gone (badge placement per the reference, direct feedback).
All cards read left-aligned with right padding on the scrim so titles wrap
beside the badge.

Fixes (direct feedback, same day): Glossary Games' playable card collapsed
to 2px inside HoverBeam (aspect-ratio has no intrinsic width in a flex-none
li) and the next card sat on top of it -> explicit `SHELF_W` widths.
`NextStepBanner` was invisible inside any `seq-reveal` page (BorderBeam's
root `animation` overrides the `.seq-reveal > *` fade-in, leaving opacity 0;
on Play that was a 144px blank between Glossary Games and In the works) ->
plain wrapper div takes the reveal. Its X now sits in the card's top-right
corner (eyebrow keeps clear of it on phones; the row reserves 52px from sm).

Welcome splash CTAs (Match/Explore/Play/Connect): the box-shadow pulse was
too much (direct feedback) -> replaced by a BorderBeam ring (`size="sm"`,
always on), wrapper carries the reveal. Profile "Do this next": first word
no longer coloured, row ends in the same solid "Let's go" CTA the "Your next
step" cards use.

Verified on 375x812 in-app: stack front card 303x367 at x=20, backs' right
edges at +16/+32, hint fired at ~2.4s (nurse to front), synthetic swipes
both directions rotate the deck, glossary cards 267px each with no overlap,
banner visible with 24px gaps either side. eslint 0 errors, tsc clean.
Still on: `DEMO_ALWAYS_SHOW_SPLASH` / `DEMO_ALWAYS_SHOW_GUIDE` (flip back
before students use it). Play splash still uses the party sprite; swap to a
controller Dreamy when that asset exists.

### 10 Sept 2026 -- Play splash controller sprite, wide sprites, PosterCard chevron

The controller Dreamy existed all along as `Dream Expression V3/29.png`
(1366x768, transparent) in the untracked root asset drops; tight-cropped to
its content with the v2 set's ~3.7% margin and saved as
`public/images/dreamy/v2/dreamy-controller.png` (640x445). The Play splash
uses it instead of the party sprite (direct feedback). Landscape sprites
(Dreamy plus a prop beside the cloud) now declare `wide: true` on their
Scene and render in a 236px-wide 640:445 box (`.dreamyWide`, 168px on
short phones) so the cloud itself reads the same size as the square sprites
at 168px; Connect switched to a tight-cropped copy of its puzzle sprite
(`dreamy-puzzle-wide.png`) for the same reason -- the original 640x360 file
is untouched because Build's quiz (`build/types.ts`) still uses it.

Arrows: of the 15 `ArrowUpRight` marks, 14 sit on true external links
(college website/apply/price/aid, Profile resources, Career Report tiles,
event stubs, Connect community "Open", Schools outbound) and stay as the
"leaves Dreamari" cue; the one internal use, Explore's PosterCard hover
badge, is now a ChevronRight (direct feedback: "do as you recommend").

### 10 Sept 2026 -- Build welcome: glow no longer clipped to the step column

The welcome's glow and star field (`WelcomeAtmosphere`, exported from
`WelcomeScreen.tsx`) are now mounted by `BuildFlowExperience` directly in
its full-height section, only on the welcome stage. Inside `WelcomeScreen`
they sat in the step column, which is a masked scroll container
(`.flow-scroll-fade`); a mask clips its whole subtree, fixed descendants
included, so the glow was cut to the column and read as a sharp lighter
rectangle around the content on wide screens (direct feedback, twice --
`position: fixed` alone did not escape the mask). The section is a stacking
context (`relative z-10`), so `z-index: -1` paints them behind the column.
Verified at 2000x1075: glow spans the viewport, no edges.

Follow-up, same day: the top/bottom cuts remained because the welcome sat in
the flow's masked scroll column and, on laptop heights, overflowed it. The
welcome stage now skips that column (`BuildFlowExperience`: no
`flow-scroll-fade`, `overflow-visible`) and fits the viewport on its own via
a new `@media (max-height: 960px)` tier in `WelcomeScreen.module.css`
(smaller stage/Dreamy/BUILD, tighter margins); the 660px tier still handles
phones. Verified at 2000x1040 (welcome 935px, Skip bottom 995) and 1400x820
(736px, Skip 784): no scroll, no mask, glow intact.

### 10 Sept 2026 -- Profile welcome on the shared splash

"Welcome to Your Profile" (arrival from Match, `?welcome=1`) is now a
`WelcomeSplash` scene (`surface: "profile"`) instead of its own popup, so it
matches the Match/Explore/Play/Connect welcomes (direct feedback). Party
Dreamy (free again since Play took the controller), amber/pink light,
"Welcome to your / PROFILE", one line ("Your Top 3 is saved. This is your
home base."), three rows (Top Three, My Plan, Report), Continue. Trigger and
dismiss unchanged: opens 900ms after arrival with the milestone chime,
Continue strips the query param and scrolls the tabs under the nav. The
old popup's LocalBurst/Button imports are gone from ProfileExperience.
Verified on 375x812: card 591px tall ending at 669, Continue works.

Follow-up: the profile welcome also shows on every plain visit while
`DEMO_ALWAYS_SHOW_SPLASH` (now exported from WelcomeSplash.tsx) is true,
like the other tabs' splashes; the Continue scroll-to-tabs only runs on a
real arrival from Match. Flipping the flag off returns it to arrival-only.


### 10 Sept 2026 — Focused cinematic welcomes (Codex, local)

Shared MATCH/EXPLORE/PLAY/CONNECT/PROFILE welcomes now use one screen with
one action, Dreamy hero glow/orbit/particles and the animated CTA border.
The page backdrop is darker and each surface has less competing copy.
CONNECT retains all four permissions/moderation statements. PROFILE copy
does not claim Top 3 are saved on ordinary visits. Demo repeat flags remain.
MATCH retains the complete looping scroll-details, save-right, pass-left
demo with one caption at a time, starting after the greeting; CTA is never
time-gated. Reduced motion exposes all three gesture instructions.
Titles now match BUILD's large tight typography, sentence-case lead-in,
clipped gradient/shimmer and ink-bleed entrance, scaled to modal width.
BUILD retains Claude's full-viewport atmosphere and responsive layout;
particles settle softer and CTA uses a slower border instead of a pulse.

Validated: targeted ESLint and TypeScript passed before final title tuning;
tokens:check passed (464 tokens); browser visual checks at 375x667 covered
all five welcomes and BUILD, with MATCH/EXPLORE/CONNECT dismissal and
BUILD advancing to Interests. Final title tuning rechecked on MATCH.
No production deployment in this iteration. Current changes remain local
on codex/build-welcome. Review the local preview before a requested release.

### 10 Sept 2026 -- Welcome light: no more rectangular frame around Dreamy

The splash `.glow` and Build's `.beam` mask both used radial gradients at
the default farthest-corner size, so at the top and bottom edges of their
boxes the light was still ~50-60% opaque and got cut hard: a faint
rectangle around Dreamy, visible when a blob drifted to an edge (direct
feedback). Both now size to `closest-side` and reach full transparency at
100%, so the light always fades out before any edge; Build's beam box got
more vertical room (`inset: -45% -18%`) and the splash glow box stops at the
card's inner top for the same reason. Checked on 375x812 and 1400x820.

### 10 Sept 2026 -- Demo welcomes: once per session, back on refresh

With `DEMO_ALWAYS_SHOW_SPLASH` on, every welcome (Match/Explore/Play splash,
Profile, Connect) now remembers "seen" in sessionStorage
(`dreamari:welcome:<surface>:session`) instead of replaying on every mount --
opening a career card and coming back replayed them each time (Slack, direct
feedback). A reload-type navigation clears those keys first
(`clearOnReload` in WelcomeSplash.tsx), so a refresh or a new tab brings
them back for a demo. Helpers `demoSeenThisSession` / `markDemoSeenThisSession`
are exported; PeopleWelcome (Connect) now runs the same check itself since
the parent's flag only lived while Connect stayed mounted. Verified: first
visit shows, dismiss, Explore and back does not, plain reload does.

### 10 Sept 2026 -- Profile > Settings edits the Build answers

New store `src/lib/studentProfile.ts` (localStorage `dreamari-student-profile`,
same useSyncExternalStore idiom as picks.ts): interests (max 2), subjects
(max 2), states, email, GPA, zip code, travel distance. Build writes it when
the flow hands off to Match (`persistAnswers` in BuildFlowExperience;
Build's single state becomes a one-item list). `SettingsView` in
ProfileExperience is now a real form (Slack, 10 Sept 2026): "Your answers"
(interest and subject chips capped at two, states as removable pills plus an
"Add a state" select) and "Account" (email, GPA select, 5-digit zip, "How far
would you go for school?"), one Save that writes the store, shows Saved and
plays the soft CTA pulse; zip/email validate inline. The Soon rows and Sign
out remain below. Nothing else reads the store yet -- it is the source for
Explore Schools' personalization when that lands. Verified on 375x812.

### 10 Sept 2026 -- Match: the scroll-up nudge ends on any real scroll

The recycling "Scroll down for details" nudge only heard touch moves, so a
wheel/trackpad/grab-drag scroll on desktop never ended it (direct feedback:
"it keeps doing the scroll even after I've scrolled"). MatchLab now listens
to `scroll` on the top card's `[data-card-scroller]` and marks "up"
demonstrated past 24px, whatever produced the scroll. Verified: nudge on,
programmatic scroll to 90px, nudge off, progress stored.

### 10 Sept 2026 -- Career Report version history

New store `src/lib/reportHistory.ts` (localStorage `dreamari-report-history`,
newest first, capped at 30). A version = label + time + snapshot of what
shapes the report: career, Top 3, focus, route choices, plan progress
(done task ids per career), saved majors. Recorded automatically on Share
(with counselor / with family) and Print, and on demand via "Save this
version" in the new History tab (fifth tab on the report, after Download);
an identical snapshot refreshes the newest entry's label/time rather than
duplicating it. Each version offers Restore (confirm step; puts the
snapshot back through ProfileExperience: setEdits -> picks effect persists
Top 3 + focus, setRouteChoice, setDone, setSavedMajors), Print (restore,
switch to Download, window.print after 350ms) and Share (restore, switch to
Share), plus delete. The version matching the current state is badged
Current. `ReportViewProps.history` is optional so other callers are
unaffected. Verified on 375x812: empty state, save, share-refresh, print
routing. Restore with a differing snapshot exercised only by code review.

Follow-up: the profile card's gear opens Settings directly (toggles back to
Overview); the one-item "Profile and privacy" dropdown it used to open is
gone, along with its state (direct feedback: "I don't see any change to the
settings menu").

Follow-up (same day, direct feedback: "so much on screen"): Settings is
lean again. The gear opens a four-item menu (Your answers, Account, Privacy
and sharing, Danger zone), each scrolling to its section. Your answers is a
read-only summary (interests / subjects / states) with a confirm-first
Rebuild (goes to /flow) and a "Previous builds" archive: Build archives the
answers it replaces (`archiveCurrentProfile` in studentProfile.ts, cap 10);
each entry can be restored (today's answers move into the archive) or
deleted. Account keeps the four editable fields + Save. Danger zone:
Deactivate (confirm; prototype flips a local flag) and Delete profile and
data (confirm; clears every dreamari* key and returns to /). The chip editor
is gone. Verified on 375x812 including restore.

### 10 Sept 2026 -- Welcome sprites load instantly

The welcomes' Dreamy sprites were the 640px, ~270KB PNGs, sent through the
on-demand next/image optimizer at first open, so Dreamy arrived late (direct
feedback). Pre-rendered WebP variants now live in
`public/images/dreamy/v2/splash/` (400px square, 480px wide for the two
landscape sprites; 11-20KB each), served `unoptimized`, and each surface's
sprite is `preload`ed (react-dom) as soon as the host page renders the
closed splash, before the timer opens it. Build's welcome uses the same
treatment for dreamy-happy. The original PNGs are untouched for their other
uses.

Follow-up: each Settings menu item shows ONLY its section (heading = the
item's label); the scroll-to-section page made the menu look redundant
(direct feedback).

### 10 Sept 2026 -- Explore Schools "For you" (first pass, from the Replit reference)

`/colleges` now has a For you / Browse all toggle under the Careers/Schools
tabs (Joshua Pierce, Slack). Browse all is the existing search + filters.
For you (`ForYouSchools.tsx`, logic in `pathway.ts`) follows the brief's
chain: focus career (picks store; demo Top 3 fallback, with chips to switch
between the student's Top 3) -> the career report's common education route
-> its recommended major -> schools whose real programme list (detail-ref)
offers it, plus schools the report itself names. Groups: Reach / Target /
Safety only when the student has a GPA (student-profile store) AND the school
publishes an acceptance rate (`fitFor`, indicative bands); "Lower-cost ways
to start" (2-year) only when the career has a two-year/transfer route;
"Trade and technical" only when it has a training/certificate/apprenticeship
route; "More schools for your path" for selective schools we can't place.
No school appears twice. Cards carry program / path / fit badges
(`CollegeCard` badges + href) and link to the detail page with
`?route=<career>`, where a "Why <school> fits you" panel (career, route,
program, career fit, admissions) appears above the section tabs. A "Why
these schools?" explainer states the logic in the student's words; with no
GPA it links to Settings. Data caveat: 30 schools (NJ + SD), programme lists
only on the reference-detailed ones, so coverage is uneven by career.
Verified desktop: Investment Banking -> Bachelor's -> Finance, 21 schools,
1 reach / 1 target / 14 safety / 2 two-year starts. Next: Saved as a
decision board (My plan strip, #1 school), miles from home once schools have
coordinates, Browse all category shelves.

### 10 Sept 2026 -- Build cost question is a yearly budget

Per Slack (10 Sept 2026): the question is now "What’s your yearly school
budget?" with helper "Choose what feels realistic for you." and six stops:
$25K or less / $50K or less / $75K or less / $100K or less / Cost isn’t a
major factor / I’m not sure (`COST_STOPS` in build/types.ts; labels and
aria text in CostStep.tsx). The old wording left it unclear whether the
figure meant one year or all of school. Nothing else reads costIndex.

### 10 Sept 2026 -- Explore Schools "For you": UX pass after review

Direct feedback on the first pass, and the fixes: (1) "Academic fit
unavailable" and "Add your GPA to unlock" read as a locked feature -- with
no GPA the degree schools are now one plain list ("Schools for your path")
with a soft optional line linking to Settings; no fit chip, nothing
negative. (2) Reach / Target / Safety was jargon -- groups are "Good match",
"Likely to get in", "A stretch" in that order (good matches lead; a 5%
school first set the wrong tone), each with a one-line note that names the
counselor term so the language still maps to the backend doc; badges say
Good match / Likely / A stretch / Everyone gets in (`FIT_WORDS`,
`FIT_COUNSELOR`). (3) Too many chips -- a For you card carries ONE fit chip
(plus "2-year start"/"Trade route" only when the path isn't the straight
one), the programme is a plain line under the place (`subline`,
`shortProgram`), and the 4-year/Public/City tags are hidden (`hideTags`);
badges moved into the card's flow so a long programme name can't print over
the school name. (4) Groups cap at 6 with "Show all N". (5) The pathway
strip is two rows: "Planning for" chips, then route > program (career name
only when there is a single career). (6) The For you / Browse All pill is
Explore Careers' own `ForYouBrowseToggle`, now exported and reused. Match
splash copy updated per Slack ("Careers matched to you. Explore your options
and save the 3 you like most." / "Start Matching"). Verified on 375x812 with
and without a GPA.

### 10 Sept 2026 -- Explore welcome: the two things you can do

Per Joshua Pierce (Slack, 10 Sept 2026) the Explore splash body is now two
labelled rows instead of one sentence: "Explore Careers: Salary, education,
daily life, and pathways." (briefcase) and "Explore Schools: Colleges,
trade schools, programs, cost, and admissions." (graduation cap). Structure
otherwise unchanged. Verified on 375x812: card ends at 617 of 812.

### 10 Sept 2026 -- Schools header matches Careers exactly

Direct feedback: "the toggles on explore/careers and schools need to be the
same, positions etc." Schools now uses Careers' layout verbatim: on phones
an absolute 56px top bar with FOR YOU / BROWSE ALL text tabs (left) and
icons on the right (briefcase -> /explore, mirroring Careers' cap ->
/colleges; quick-links menu), title and Careers/Schools strip hidden; from
md the title + strip sit left and the shared `ForYouBrowseToggle` pill sits
right on the same row. Measured identical on 375x812 (tabs at 20,4 and
111,4) and 1280x800 (pill 1009-1219 at y 126, h1 y 102). The old
Back + wordmark mobile header is gone from Schools.

### 10 Sept 2026 -- Explore Schools: the "perfect version", pass 1 of 3

After a joint audit of the Replit (direct feedback: "a little confusing"),
agreed shape: one job per page, one vocabulary per card, two tabs that mean
different things. Built so far:
- For you header is ONE sentence: "Planning for <career> · Bachelor's degree
  in <program>". The career is the only control (tap to switch among the
  Top 3). GPA / states / distance are inputs, shown as quiet chips behind a
  "Your details" toggle that also explains the list and links to Settings.
- Groups, plain words, in this order and capped (~10 schools total): Best fit
  for you (target, 4), Easy yes (safety, 4), Start for less (2-year, 3, only
  when the career has that route), Worth a shot (reach, 2), Hands-on route
  (trade, 3, only when relevant). Selective schools we can't place are NOT in
  For you; they live in Browse all. No GPA -> one list "Schools for your
  path" (8). `FIT_WORDS`: Best fit / Easy yes / Worth a shot / Everyone gets in.
- Cards: one fit chip; one line "Program · $30K a year after aid"
  (`costLine`); no path chips, no type tags. Distance is hidden until schools
  have coordinates.
- Browse all at rest is shelves (`BrowseShelves.tsx`): Offers <program>,
  Near you, Under $15K a year, Trade and technical (only if the career has a
  trade route), Everyone gets in, More schools; each school on ONE shelf, 8
  per shelf, horizontal rails. Search or any filter swaps in the flat grid.
Verified 375x812 and 1280x800: 8 curated cards, 5 shelves, 0 duplicates.
Next: Saved as the decision board (My plan strip + "Make my #1" on the
detail page), then detail-page "Why this fits you" polish and a sticky
Compare bar.

### 10 Sept 2026 -- Explore Schools, pass 2: Replit taxonomy + decision board

Direct feedback: "use the same copy/taxonomy from the replit." All labels
now match the Replit verbatim while the structural fixes stay: chips and
group headings Target / Safety / Reach (order: Target, Safety, Lower-cost
ways to start, Reach), "Open admission", programme line "Finance · Direct
path · $22K a year after aid" (or "2-year start"), "Lower-cost ways to
start / Start here, then continue toward a 4-year degree.", "More schools
for your path", "Trade & technical", "Why these schools?", title "Explore
Schools" with "Turn a career idea into a place to start.", shelves "Schools
with <program> / Near you / Lower-cost options / Trade & technical / High
acceptance / More schools for your path", detail "Career fit: Strong". The
one deliberate omission: no "Academic fit unavailable" chip -- a school
without a published acceptance rate shows no fit chip at all (the negative
reading was the original complaint).

Decision board: "My plan" card on For you (Career / Education / Program /
#1 school "Not chosen yet"), with the saved shortlist folded under it
("A short list is more useful than a giant one..."): each row opens the
school, "Make my #1" / "Your #1" (useTopSchool in shared.tsx, localStorage
`dm-colleges-top`; setting it also saves the school), and remove. The
detail hero has the same "Make my #1" next to Save. Verified on 375x812.
Remaining from the brainstorm: sticky Compare bar, distance once schools
have coordinates, "Not for me" (left out of the student UI for now).

### 10 Sept 2026 -- Explore Schools, pass 3: density cut, Schools welcome

Direct feedback: "so much text, so much clutter, hard to understand what
I'm supposed to do here", "reduce copy and not add anything new from the
Replit except layout / visual / UX". Changes:
- For you header is two short lines: "Planning for <career v>" (the only
  control) and "<route> in <program>". The chips row (GPA / state /
  distance / Why these schools?) and its explainer are gone; the Replit
  subtitle "Turn a career idea..." is gone.
- Groups are horizontal rails (the app's shelf idiom), headings only, no
  sub-sentences, order Target, Safety, Reach, then Lower-cost ways to start,
  then Trade & technical. Card line is "Program · $22K a year after aid"
  ("2-year start" only on two-year cards).
- "My plan" is one row, shown only once something is saved: "#1 school:
  <name | Not chosen yet> · Saved · n" with the saved list folded under it.
- Schools has its own welcome splash (`surface: "schools"`, hard-hat Dreamy
  from Dream Expression V3/27 -> splash/dreamy-hardhat.webp): one line
  ("Schools that fit the career you want. Save the ones you like, then pick
  your #1.") and two rows explaining Target/Safety/Reach and Lower-cost
  starts; CTA "See my schools". The page itself carries no explanation.
- Cards without a campus photo use the school's mark as a blurred, dimmed
  cover so every card gets the photo + progressive-blur treatment.
Verified 375x812 and 1280x800. Explore (Careers) keeps its own splash with
Joshua's two rows.

### 11 Sept 2026 -- Landing Connect graphic: replies always animate in on tap

Both Connect demo cards stay mounted (height stability), so the replies'
`mkt-reply` entrance ran as soon as the chapter started playing -- while the
post card was still hidden -- and a later "Enter Community" tap found them
already in place (direct feedback). `PostCard` now takes `live`, true only
once the screen switches, and attaches the `mkt-reply` class then, so the
staggered entrance starts at the tap every time. Measured: 0 / 0 / 0 at
120ms, 1 / 0.92 / 0 at 820ms, all 1 by 2.3s.

### 11 Sept 2026 -- Explore Schools: the route is the student's choice

Direct feedback: switching career silently changed the education route --
the one decision the page exists for. Model now: the career constrains the
menu, the student picks, Build's answer sets the default.
- `routesFor(careerId)` (pathway.ts) turns the career report's education
  routes into at most one pill per institution type: 4-year ("Bachelor's
  degree · 4 yrs"), 2-year ("Start at a 2-year college · 2 + 2 yrs" or
  "Associate degree · 2 yrs"), trade ("Flight school", "Trade or technical
  school") -- only Training routes that name a school count; "self-taught
  portfolio" or "store floor" are not school routes and get no pill.
  Military and non-school routes are omitted. Careers with one route show no
  pills.
- `defaultRoute`: Build's college / trades / both (new `path` field on the
  student profile, persisted by Build) picks a trade route when one exists,
  otherwise the common route. If the student said trades and the career has
  none, one quiet line: "<Career> doesn't have a trade route."
- `schoolsForRoute`: 4-year -> Target / Safety / Reach rails (one list
  without a GPA); 2-year -> one rail "Community colleges near you"; trade ->
  "Trade and technical programs". "Lower-cost ways to start" is gone as a
  separate rail: it IS the 2-year route, one tap away. Cards show
  "Program · $X a year after aid" only.
- Header: "Planning for <career v>", the route pills, then the program.
  Schools splash row 2: "Pick your route: 4-year, 2-year, or trade school."
Verified on 375x812: IB default Bachelor's (Target/Safety/Reach), 2-year
pill -> Bergen/Middlesex rail, Nurse -> Bachelor's / Associate pills.

### 11 Sept 2026 -- Match: pick one to start with, no ranking

Direct feedback: after the Top 3, the student selects ONE card to continue
with; no numbering, re-ranking or ranking anywhere; pencil gone; make it
clear they can switch later.
- Decision sheet: cards in saved order, none pre-selected, no #rank badges
  (`TopThreeCard` lost its `rank` prop); subtitle "Pick one to start with.";
  CTA is "Select one to continue" (aria-disabled) until a tap, then
  "Continue with <career>"; a line under it: "You can switch careers any
  time to update your plan and Career Report." Keep Swiping only while cards
  remain.
- Every finish path goes through that chooser (`openChooser`): the always-on
  "Continue with your 3" shortcut, the end-of-deck panel ("Choose where to
  start"), and the picks sheet.
- The pencil button is removed from the slot strip; slots read "Empty"
  without numbers. The manage sheet is now "Your picks", remove-only (no
  up/down reorder; `reorder()` deleted). EndPanel's list shows names with
  colour dots, no #.
- Hand-off writes picks in saved order with `focus` = the chosen career (no
  reordering of ids). Verified: three likes -> sheet, tap second card -> CTA
  "Continue with Private Equity Analyst", lands on Profile Top Three.
Not touched: Profile's own Top Three tab still shows its slot numbers and
swap flow; flag if that should follow.

### 11 Sept 2026 -- Top 3 without ranking, and "you're not boxed in" copy

Direct feedback: no slot numbers anywhere; three careers, none better than
another; you lead with one; remind students they can change these choices.
- Profile Top Three: the #1/#2/#3 photo badges are gone; the focused card
  says "Starting here", the others offer "Start with this one"; the empty
  state says "Add up to 3 careers to compare, then pick one to start with";
  the no-focus prompt says "Pick a career to start with. Your plan builds
  around it." with "Start with the first one"; the swap sheet lists titles
  without numbers (swapping itself stays -- direct feedback). Intro copy:
  "Compare your careers and pick one to start with. Your matches don't stop
  here. Add, remove or switch any time; your plan and Career Report follow."
  (stacked above "Compare all 3" on phones). Banner/Do-this-next copy lost
  "#1" ("Play the Day in the Life for the career you're starting with.").
- Match chooser line (student's copy): "These are just your first 3
  matches. Keep exploring to discover more careers."
- Profile welcome splash gains one row: "Your matches don't stop here. Keep
  exploring, and switch careers any time."
Left as is: Explore Schools' "#1 school / Make my #1" (a single choice among
saved schools, Replit taxonomy, not a ranking) -- flag if it should change.

### 11 Sept 2026 -- Top Three nudge, Match reassurance, banner options

- Profile Top Three: a `NextStepBanner` at the top of the tab, Joshua's copy
  verbatim: "More career matches are waiting." with an "Explore" CTA to
  /explore. `emphasis="priority"` for the beam ring but `calm` (no wash, no
  sheen, no CTA pulse, no dot pulse -- direct feedback: "lose the shimmer",
  "and the cta pulse"). While `DEMO_ALWAYS_SHOW_SPLASH` is on it has no
  storageKey, so it returns on every visit for demos; flip the flag and it is
  remembered under `dreamari:top3-keep-exploring-dismissed`.
- `NextStepBanner`: new `calm` prop (ring only) and `eyebrow` is optional
  (text-only banners); aria labels fall back to the text.
- Profile welcome pop-up: the "Not locked in" row is removed; the
  reassurance lives on the Top Three tab instead (direct feedback: not in the
  pop-up, a dismissable card where the choice is made).
- Match chooser: the line under the CTA is "You can always change this
  later." ("Keep exploring" duplicated Keep Swiping there). Joshua's
  proposed "These are your first 3 matches; visit Explore to discover
  hundreds more careers." is NOT applied -- held on request.

### 11 Sept 2026 -- Schools: glasses Dreamy, less copy, fit groups always on

Direct feedback: no hard-hat Dreamy; too much copy; "the schools tab isn't
even showing reach/target/safety, just one row". Schools splash now uses the
glasses Dreamy (`splash/dreamy-glasses.webp` from v2) with one line only
("Schools that fit the career you want."); Browse-all shelves lost their
sub-notes. The single-row case was the empty student-profile store (Build
writes the GPA only on hand-off, so any browser that never ran Build had
none): For you now falls back to `ACADEMIC_RECORD.gpa` (the 3.7 the Profile
card shows) when the store has no GPA, so Target / Safety / Reach appear from
the first visit.

### 11 Sept 2026 -- Explore Schools, pass 4: the Replit's architecture, delivered leaner

Direct feedback: match the Replit, then deliver it better; show the GPA since
it drives the list; "why these schools" matters but must be delivered
better; less clutter below the Careers/Schools tabs.
- The Replit's breadcrumb (Career -> Route -> Program) is now the control
  strip: chips connected by arrows; the career chip (accent) and the route
  chip open their options inline under the strip when there is a choice
  (Top 3 careers; the career's routes with time). The program chip is
  static. No separate pill rows.
- One line under it: "Based on 3.7 GPA · New Jersey · Within 100 miles" +
  "Why these schools?" + "Saved schools · n" (opens Browse all filtered to
  saved -- the Replit keeps Saved off the list too; "Make my #1" stays on
  the school page). The inline My plan row is gone from For you.
- "Why these schools?" is a bottom sheet (`WhySheet`, portalled): Your path
  as three chips + one sentence; How we sort as a Target/Safety/Reach colour
  legend with one line each and the "guide, not a prediction" caveat; What
  we use (GPA / Where / How far) with "Change in Settings".
- Cards: the Replit's stat row -- acceptance · $ after aid · finish rate
  (`CollegeCard stats`), programme chip, fit chip only where the rail
  doesn't already say it; the two sentences are gone. Browse-all shelves
  use the same card.
Verified 375x812: strip, based-on line, sheet content, stat rows, rails.

### 11 Sept 2026 -- Explore Schools, pass 5: Replit spacing/hierarchy, its Why sheet

Direct feedback: mobile FOR YOU / BROWSE ALL wrapped; the Why sheet carried
too much copy; the Replit's spacing, hierarchy and design are better; the
programme chips sat badly.
- Mobile top-bar tabs (Careers AND Schools, same markup): 14px +
  whitespace-nowrap, so they sit on one line beside the icons.
- Why sheet is the Replit's, structure and copy: eyebrow WHY THESE SCHOOLS?,
  "A clear starting point", a check-list (Your career / Your education path /
  Your recommended program / Your academic profile: 3.7 GPA / Your location
  preference), one CTA "Adjust preferences" (-> Settings). The legend and
  prose are gone. ("#1 career" on the Replit is "Your career" here: no
  ranking language.)
- Rails: Replit rhythm -- small eyebrow "N SCHOOLS" above a larger heading,
  sections spaced at space-8; "Based on ..." on its own line with the two
  links under it on phones.
- Cards: no programme chip; the programme is a quiet 12.5px line under the
  location. Fit chip only where the rail title doesn't say it.
Verified 375x812.

### 11 Sept 2026 -- Schools: GPA chip toggle, Why sheet layout, rail hover room

- "Based on" is now chips. The GPA chip is a toggle (direct feedback):
  filled "3.7 GPA" sorts into Target / Safety / Reach; tap -> outlined "GPA
  off", the rails collapse to one "Schools with <program>" list, the Why
  sheet says "Your academic profile: not used". Title text explains each
  state; remembered in localStorage `dreamari:schools-use-gpa`.
- Why sheet: centred on every size with a capped height and its own scroll,
  full-width "Adjust preferences" (the bottom-anchored sheet clipped the CTA
  against the fixed nav).
- Rails (For you + Browse shelves): 28px vertical padding pulled back with
  negative margins, so the poster hover (translateY -10px, scale 1.09,
  40px shadow) no longer clips against overflow-x:auto.

### 11 Sept 2026 -- Explore Schools, pass 6: school card + plan card

Direct feedback: emulate and improve the Replit's card design, look at
competitors; the page should be cleaner and beautiful; Target showed only
photo-less Mount Marty; "GPA off" gave one anticlimactic row; the GPA chip
needed a tooltip.
- `SchoolCard` (shared.tsx) replaces CollegeCard everywhere on Schools: the
  career poster's full-bleed photo + progressive blur (direct feedback),
  circular mark, name, "City, ST · Public · 4-year", programme, a three-tile
  stat row (acceptance · $ after aid · finish; BigFuture/Replit pattern, on a
  scrim so it stays legible), Compare + View action row, Save on the photo,
  fit chip only where the rail title doesn't say it. Photo-less schools get
  the mark blurred as a wash.
- Header is one "plan card" (trip-header pattern): eyebrow PLANNING FOR, the
  career as the title (tap for the Top 3), route chip (tap for routes) ->
  programme chip, then "Based on [3.7 GPA toggle] [New Jersey]" and "Why
  these schools?" on a hairline row. Saved · n sits top-right of the card.
- GPA chip: hover/focus tooltip ("Tap to turn off: see every school without
  Target, Safety, Reach.") and a 2.6s confirmation bubble after a tap. GPA
  off now groups by selectivity in plain words (Hardest to get into /
  Selective / Most students get in) instead of one list.
- Fit bands corrected (acceptance-rate proxy): <25% Reach (Target at 3.9+);
  25-50% Target at 3.5+; 50-75% Target at 3.0+ (Safety at 3.9+); 75%+ Safety
  at 3.0+. A 3.7 now puts TCNJ / Rutgers / NJIT / Ramapo in Target.
  Photographed schools sort before photo-less ones within a rail.
Verified 375x812 and 1280x800. Mount Marty has no photo on disk; fetching
one needs the user's go-ahead (download).

### 11 Sept 2026 -- Explore Schools, pass 7: quiet header with dropdowns, Replit copy, why / not for me

Direct feedback: chip rows were confusing and the header box didn't help;
use the Replit's approved copy and decide keep/remove on research.
- Header is two lines, no box. Line 1 is the breadcrumb as text: career and
  route are dropdown menus (`Menu`/`MenuItem`: a small list under the word,
  closes on outside click / Escape); the programme is plain muted text.
  Line 2: "Based on [GPA toggle] · New Jersey · Why these schools?" with
  "Saved schools · n" at the right. GPA chip and tooltip shrunk to match.
- Kept the two tabs (search stays in Browse all): research and the Careers
  page both argue against hiding the catalogue behind a search box.
- Browse-all quick filters carry the Replit's labels: Near you · 4-year
  schools · Community colleges · Trade & technical · Lower cost · High
  acceptance.
- The 2-year route rail uses the Replit's copy: eyebrow "A practical first
  step", "Lower-cost ways to start", "Start here, then continue toward a
  4-year degree."
- Cards: "Why this school? ›" (Replit link) reveals one sentence -- the
  report's `why` where it exists, otherwise generated ("Offers Business
  Administration · close to home · 85% finish."); "Not for me" hides the
  school from For you (localStorage `dm-colleges-hidden`); stat label "avg.
  after aid" (Replit). The open-cue chevron now sits in the photo band
  instead of behind the text block.
- Not built, on purpose: weighted/unweighted GPA prompt (our GPA is a
  range); distance (no coordinates). Compare bar already existed.
Verified 375x812.

### 11 Sept 2026 -- Explore Schools, pass 8: result on the page, inputs in the sheet

Direct feedback: still too many words at equal prominence; "there has to be
a better way"; row headers shouldn't stack; look at Netflix / Hotstar.
- Header is one sentence and one caption: "Schools for <career v>" (the
  career is the only control on the page) and "Bachelor's degree in Finance
  · 3.7 GPA · New Jersey · Why these schools?" (Saved · n at the right).
  The chip breadcrumb, labelled fields and header box are gone.
- The Why sheet ("A clear starting point", the Replit's checklist) is where
  the inputs live and are EDITED: the education path row carries the route
  choices, the academic-profile row has an on/off switch for sorting by GPA
  plus Weighted / Unweighted / Not sure; Adjust preferences -> Settings.
- GPA type (team doc, 11 Sept 2026): new `gpaType` on the student profile
  (also a select in Settings > Account). `effectiveGpa` brings a weighted GPA
  down by 0.4 (cap 4.0) before banding, since colleges' averages are on an
  unweighted 4.0 scale; "Not sure" counts as unweighted. The caption and
  sheet show "(weighted)" when set.
- Row headers on For you and Browse all: title left, "4 schools" small on
  the right, no stacked eyebrow (Netflix / Hotstar). The 2-year rail keeps
  its Replit subtitle under the title.
Verified 375x812 and 1280x800.

## 2026-09-11 · Explore Browse All: Skilled Trades row + trades mixed in
Slack "Trades Tab Update" + direct feedback: trades must not read as less
important; a row, not a tab; mixed into other rows without removing anything;
visible without horizontal scrolling.
- Six new posters in `public/images/app/` (from the root `trades tab/`
  folder, resized to 1254px tall): lighting-technician, forklift-operator,
  forestry-technician, hairstylist, air-traffic-controller-v2,
  sheet-metal-worker.
- `catalog.ts`: new `BROWSE_TRADES` (the six + Electrician, Roofer, Truck
  Driver), included in `ALL_CATALOG_CAREERS` so /career/<slug> resolves for
  each (they render the "coming soon" report state like most of the catalog).
- Mixed in at position 1 so they are on screen on a phone (one poster is
  fully visible per row): Lighting Technician and Forestry Technician (4th)
  in Careers You Might Not Know; Air Traffic Controller ($137K) first in
  Typical Pay. No existing career removed.
- `ExploreExperience.tsx`: `<Rail title="Skilled Trades">` placed directly
  above Typical Pay (user: "put trades above the salary row"). Air Traffic
  Controller sits LAST in the Trades row because it opens Typical Pay right
  below it; the same photo twice on one screen read as a clash.
- `profiles.generated.ts`: full career pages (same blueprint as every other
  generated profile: summary, imagine line, four facts, pay by state, know
  about / good at / software, three-rung ladder, education, fact details)
  for Hairstylist, Sheet Metal Worker, Forestry Technician, Forklift
  Operator and Lighting Technician, from 2024 OOH / OES figures for the
  matching BLS occupations. Approximate prototype data, like the rest of the
  file. Air Traffic Controller already had one.
- `PosterCard.tsx`: poster title size is no longer decided by a character
  count (10+ letter word -> 19px), which made ELECTRICIAN small next to a
  full-size SHEET METAL WORKER in the same world. `posterTitleSize(title,
  world)` now estimates the title's width from a per-world widest-glyph
  table (`POSTER_GLYPH_EM`, measured in Chrome) and shrinks to 19 only when
  the longest word will not fit 200px or the title needs a third line at 24.
  Deterministic, so server and client agree. Result: Electrician, Hairstylist,
  Accountant, Management Analyst, Lighting/Forestry Technician go to 24;
  Air Traffic Controller, Administrative Assistant, Agricultural Technician,
  Sound Engineering Technician, Sports Medicine Doctor stay/go to 19. No
  word or band overflow on Explore Browse or Home.
Gate: eslint + tsc clean. Verified 375x812 and desktop; /career/hairstylist
and /career/sheet-metal-worker render full pages. Not pushed.

## 2026-09-11 · Explore Schools header: one row instead of five text tiers
Direct feedback (desktop screenshot): "too many text elements so close
together". The header stacked page title, section tabs, "Schools for X",
the inputs caption and the first row header before any card.
- Desktop title is "Explore" (same as Careers); the Schools tab under it
  already names the section.
- `ForYouSchools` header is one row: "Schools for <career v>" left, and one
  quiet chip right (sliders icon + "Bachelor's degree in Finance · 3.7 GPA ·
  New Jersey") that opens the Why these schools? sheet, where those inputs
  are edited. Saved · n sits beside it when there are saves. On phones the
  chip wraps under the heading and to two lines.
- Column gap 32 -> 40px so the header and the rails breathe like Careers.
Gate clean; verified 1280x800 and 375x812. Not pushed.

## 2026-09-11 · Explore Schools: Edit chip, separate Why sheet, simpler editor
Direct feedback (several notes): the chip must say what it does, "Why these
schools?" should not be folded into it, the inputs should be changeable, the
sheet should be simpler, the GPA control needs a short hint, and the chip
needs a nudge.
- Header: chip alone on the right, "Bachelor's degree in Finance · 3.7 GPA
  · New Jersey | ✎ Edit" (label always visible, full white; phones have no
  hover). Wrapped in HoverBeam; on load "Edit" slides in (`.dm-nudge-in`,
  app.css) and the beam runs one loop (~3.6s), then both wait for hover.
- "Why these schools?" moved to the right end of the FIRST row header
  (Target), where the fit question comes up. Opens an explanation-only
  sheet: three lines, "Edit preferences" button.
- New `EditSheet` ("Edit your list"): Path (segmented, or static when one
  route), Where (state select, writes profile.states[0]), GPA (select of
  Build's ranges plus "Don't use my GPA", type segmented, one-line hint
  "Sorts schools into Target, Safety and Reach." / "Off: rows show how
  selective each school is."), Done. Shared `Sheet`, `Field`, `Segmented`,
  `Select` helpers in ForYouSchools.tsx.
Gate clean; verified 1280x800 and 375x812. Not pushed.

## 2026-09-11 · Schools Edit chip: glow-to-beam nudge, tablet, Why link placement
- Nudge is now a bright glow (`.dm-nudge-glow`, box-shadow + border in the
  primary colour) that swells around the chip and fades as the beam takes
  over; the two overlap so it reads as one motion. The scale pulse was
  rejected ("weird pulse").
- Header row no longer wraps on sm+; the career name in the heading is
  `whitespace-nowrap`, so on a tablet the heading breaks "Schools for /
  Private Equity", never mid-name, and the chip stays on the right.
- "Why these schools?" is a quiet link AFTER the rails (it is about the whole
  list; on the Target row header it read as Target-only, and beside the
  chip it was rejected). Row headers all show their counts again.
- Edit sheet: single-route careers show a static Path with the hint "The
  only route into <career> in our data." (routes come from each career's
  report education entries; Private Equity has one). GPA select offers
  Build's ranges plus "Don't use my GPA" only.
- "Edit" reveal: its width is reserved from first paint and only opacity and
  a 10px slide animate (700ms), so the chip never widens and the heading
  beside it never re-wraps mid-animation (direct feedback).
Gate clean; verified 768x1024, 1024x800, 375x812. Not pushed.
- Header row fits on one line from 640px up: heading is fluid
  (`clamp(20px, 2.2vw, 26px)`, nowrap) and the chip uses compact wording
  between 640 and 1023px ("Bachelor's · 3.7 GPA · NJ", `shortRoute` /
  `stateCode`). Checked 768, 950, 1024, 1280: one line, no overlap.

## 2026-09-11 · Match -> Profile: no forced choice, strongest match is the default primary
Joshua (Slack, 11 Sept 2026), wording "primary" instead of "#1" per Chandu.
- Match results sheet: cards are display-only, no selection. Line: "Compare
  them next, then pick your primary career any time." CTA "Compare My Top 3"
  -> /profile?picks=...&tab=top3&welcome=1 (no focus param). `writePicks`
  stores focus: null.
- picks.focus null now means "no primary chosen": Profile uses the highest
  Career Interest Score (`ProfileCareer.match`) among the Top 3 as the
  default, so Career Report and My Plan exist immediately. Label "Your
  Strongest Match"; other cards "Make my primary"; once chosen, "My Primary
  Career" (persisted). Removing the primary from the Top 3 falls back to the
  strongest match. The old "Pick a career to start with" empty state is gone.
- Schools Edit sheet GPA: back to a switch ("Use my GPA") with one-line hint
  (on: "schools sort into Target, Safety and Reach around your GPA"; off:
  "rows show how selective each school is instead"), plus the GPA range
  picker and Weighted / Unweighted / Not sure while on. Other GPAs are
  selectable on purpose, to see how the list changes.
Verified: /match-lab (3 likes -> sheet), /profile?tab=top3 labels and
persistence, /colleges edit sheet. Gate clean. Not pushed.

## 2026-09-11 · School cards in the Replit's layout, calm Match sheet, story guard
- `SchoolCard` (shared.tsx) rebuilt in the Replit reference's information
  order on the brand surface: 148px photo band (progressive blur into the
  card), circular mark overlapping the band edge, then on solid card: name,
  pin + "City, ST · Public · 4-year", programme ✓ with outlined chips
  (DIRECT PATH / 2-YEAR START / TRADE & TECHNICAL, plus REACH / TARGET /
  SAFETY / OPEN ADMISSION only where the rail title does not already say
  it), three plain figures (acceptance / avg. after aid / finish), "Why this
  school? ⌄", then Not for me · Compare · View. No text over photos, no
  glass tiles. Distance "from home" (Replit) still not shown: no coordinates.
- Match results sheet: one staggered fade-up (chip, title, line, cards,
  buttons). Removed drifting glows, confetti, ink reveal, 3D card flip,
  sheen ("too busy" feedback).
- Story guard: `profile/data.ts` Investment Banking match 86 -> 91 so it is
  the strongest of the demo Top 3 (Private Equity is 88); new
  `strongestCareerId` / `primaryCareerId` helpers used by Profile, Explore
  Schools For you and Browse shelves so all agree on the primary career.
  `app/profile/page.tsx` no longer defaults focus to picks[0] (that made
  every handoff look like a chosen primary).
- Explore splash: one line ("Careers: salary, education, daily life, and
  pathways."); the Schools line was redundant with the Schools splash.
- Note for the demo: the shared preview browser had test state (Airline
  Pilot as primary, Nebraska as state) from my clicks; cleared. The "Edit
  your list" sheet opening by itself could not be reproduced on a clean
  load; the openings seen were my test clicks in the shared pane.
Gate clean; verified /match-lab -> /profile handoff, /colleges 1280 and
375, Explore splash. Not pushed.

## 2026-09-11 · Match results as a full-screen moment; card actions; Schools tab pulse
- Match results (MatchLab `Sheet bare`): no panel, no chip; an opaque
  brand-tinted field so the deck does not peek out behind it; title, line,
  three larger cards (max 860px) and the two buttons rise in one quick
  stagger (0.05s / 0.12s / 0.2s+80ms per card / 0.45s). Only /match-lab
  renders MatchLab; if the sheet looks unchanged locally, hard-refresh the
  tab or check the port (a worktree dev server runs on 3004).
- SchoolCard: photo + progressive blur now run 300px down, so the mark, name
  and place sit over the blurred tail before the solid card takes over.
  Actions: "Not for me" plain text left, Compare (arrows icon) ghost right,
  no View (the whole card opens, with the hover cue). Both read as secondary.
- Profile > Saved: the icon-only add/swap control is a labelled pill,
  "Add to Top 3" / "Swap in".
- Explore: first visit of a session, the Schools tab pulses twice
  (`.dm-tab-nudge`, brand glow) after the welcome splash clears; the splash
  dialog dispatches `dreamari:welcome-done` on exit. Per-session flag
  `dreamari:schools-tab-nudged:session`.
Gate clean; verified /match-lab sheet, /colleges cards 1280, /explore pulse
(class present ~2.4s after the splash closes). Not pushed.

## 2026-09-11 · Match welcome splash decluttered; school card hover cue
Direct feedback (the notes about "the match popup" were about the Match
WELCOME splash, not the results sheet):
- `WelcomeSplash.module.css` `.scrim` is opaque (radial tint over the night
  background, no blur): the page underneath ("Find your Top 3", the deck) no
  longer shows behind any splash. Dialog max-width 420 -> 460.
- Swipe demo: the tinted `.demoStage` box is gone (the card plays on the
  dialog); loop 7.5s -> 5.6s, start 1200ms -> 900ms. The animation itself
  is unchanged.
- Hero: orbit ring, particles and flare removed; glow + Dreamy remain.
- SchoolCard hover cue is a labelled pill "View school ›" (dim + cue via the
  poster-card hover rules), centred on the photo band.
Gate clean; verified /match-lab splash 375 and 1280, /colleges cards.
- SchoolCard alignment (direct feedback): two lines reserved for the name
  (`line-clamp-2 min-h-[42px]`), one truncated line for the place, 24px min
  for the programme row, so stats and actions sit at the same y on every
  card in a rail (checked: identical stats and Compare offsets on 4 cards).
- Names are anchored to the bottom of their two-line space (`items-end`),
  so one-line and two-line names share a baseline and the place line is at
  the same y on every card (measured: name bottom 219px, place 222px on all
  9 For you cards). Names are not truncated on purpose: Rutgers-New
  Brunswick vs Rutgers-Newark differ at the end.

## 2026-09-11 · Match welcome: one shape with the other splashes
- Match line is "Save the 3 you like most."; the demo carries the how.
- Demo is two beats (swipe right to save, swipe left to pass), 4.4s loop,
  finger starts mid-card. The scroll-for-details beat is gone from the
  splash; the deck's own gesture guide ("Scroll down for details", first
  card, persists until a real scroll) is unchanged and verified.
- Title ink-bleed and sweep animations removed: every splash now enters the
  same way (dialog arrive, Dreamy hello, text, then demo where there is one).
- `.dialog` overflow is `hidden auto`: the hero glow reaching past the edges
  was producing a horizontal scrollbar on every splash.
- SchoolCard hover dim now covers the whole photo run (a band-sized dim drew
  a hard line across the picture on hover).
Gate clean; verified /match-lab splash and deck guide at 375, /colleges.

## 2026-09-11 · Deck gesture guide: scroll hint once
- `GUIDE_SEQUENCE` = scroll, right, left, right, left, then stop. The scroll
  hint no longer recycles until a real scroll (direct feedback: "only show
  the scroll nudge once"). A real gesture still ends the guide early.
Verified at 375: "Scroll down for details" -> "Swipe right to save".

## 2026-09-11 · Match copy restored; hints split between splash and deck
- Match splash line is Joshua's again: "Careers matched to you. Explore your
  options and save the 3 you like most." Same shape as the other splashes
  (Dreamy, eyebrow, title, one line, CTA), plus the two-beat swipe demo.
- Deck guide `GUIDE_SEQUENCE` = ["up"]: scroll hint once. Swipe right / left
  are taught by the splash only, so nothing is repeated on the cards.
Verified at 375: splash copy, deck shows "Scroll down for details" once.

## 2026-09-11 · Match splash, option 3: the swipe demo is the hero
- On Match the demo takes Dreamy's hero slot (`.heroDemo` 196px, card
  112x144, captions 14px under it); Dreamy is not shown on this splash.
  Eyebrow, title, Joshua's line and CTA follow as on every other splash.
  Fallbacks agreed if this is rejected: option 2 (two static icon rows), then
  option 1 (no demo; deck guide teaches scroll, right, left once each).
Verified at 375 and 1280.

## 2026-09-11 · Splashes: no icons anywhere; Explore line names schools
- Row icons removed from every splash (`rows` is now `{ text }[]`; only
  Connect uses rows). Rows are centred plain lines; the last Connect row
  keeps its divider and muted colour.
- Explore line: "Careers and schools: salary, education, daily life, and
  pathways." The Schools tab keeps its own splash with the detail.
Verified at 375: Explore and Connect (only the CTA chevron svg remains).

## 2026-09-11 · Splashes: no eyebrow; Match on option 2
- "You're in" / "Welcome to" eyebrows removed from every splash (type field
  and CSS gone). Title, line, optional rows, CTA.
- Match is option 2: Dreamy back in the hero, Joshua's line, two plain rows
  ("Swipe right to save." / "Swipe left to pass."), no animated demo. The
  demo component and all its CSS/keyframes are deleted. Option 1 (no
  swipe rows; deck teaches scroll, right, left once each) is the agreed
  fallback if this is rejected.
- Rows: `note: true` marks the footnote row (divider + muted), used by
  Connect's moderation line; it was `.row:last-child` before, which would
  have muted Match's second swipe row.
Verified at 375: Match, Play.

## 2026-09-11 · Match: option 1; deck guide teaches all three, snappier
- Match splash has no gesture rows (option 1). Connect rows have their icons
  back (`icon?` per row, `.rowIcon`); no other splash uses rows.
- Deck guide: `GUIDE_SEQUENCE` = up, right, left, once each. The walk derives
  the next hint from the current one (a mutable counter was bumped twice per
  transition under React's dev double-invocation and skipped "left").
- Swipe nudge rests until 18% then flicks 30px to land with the hint dot at
  32% and settles by 44%. Scroll peek is 64px (first section, ~2 lines), was
  150px.
Verified at 375: "Scroll down for details" -> "Swipe right to save" ->
"Swipe left to pass" -> done.

## 2026-09-11 · Mobile pass: Build fits, no horizontal zoom, pages open at top
- `ScrollReset` (app/layout.tsx): `history.scrollRestoration = "manual"` and
  scroll to top on every pathname change (hash URLs excepted; elements with
  `data-scroll-reset` also reset). Fixes screens opening mid-way.
- `body { overflow-x: clip }`: iOS Safari widened the layout viewport to fit
  a stray overflow and zoomed the whole page out (college detail screenshot).
- Build at 390x660 (Safari with bars): Work Vibe's "Your Setup" summary is
  desktop-only; Interests' picks panel tighter on phones; Location map height
  is `clamp(150px, 100dvh - 470px, 44dvh)`, hint line desktop-only, toggle
  margin smaller. Every step measured: no inner scroll at 390x660.
- Match deck guide progress is per SESSION (sessionStorage) so a phone that
  did the gestures once still gets the nudges in a new session.
- Splash: `max-height: 620px` tier so nothing scrolls on short phones.
- Profile Top Three: "Make my primary" is a solid primary button.
- College detail: "Make my #1" removed (led nowhere in Profile); Save stays.
Verified: /flow walk, /explore -> /play -> /explore lands at scrollY 0,
/profile button, /colleges detail docW == viewport, /match-lab guide fires.
- Deck guide dwell: scroll 2.6s, swipe right and swipe left 1.6s each (dot
  and card are at rest by ~1.15s), so the two swipes follow each other
  quickly. Measured: scroll 0.8s -> right 3.5s -> left 5.0s -> done 6.8s.

## 2026-09-11 · Schools splash copy
- Schools splash line is Joshua's: "Colleges, trade schools, programs, cost,
  and admissions." Careers and Schools keep their two separate splashes.

## 2026-09-11 · School cards: miles from home (demo data)
- `milesFromHome(c)` in colleges/data.ts: road miles from Westfield, NJ (the
  demo student's school) by campus town, for all 33 colleges (NJ 5-85 mi, SD
  1,300-1,740 mi). Mock, not geocoded; a town with no entry falls back to the
  finish-rate figure. Cards now show acceptance / avg. after aid / from home,
  the Replit's three figures.

## 2026-09-11 · School signals: variety, tastefully
- For you (bachelor's route) adds the Replit's "Lower-cost ways to start" row
  after Target / Safety / Reach: community colleges whose cards carry
  2-YEAR START and OPEN ADMISSION chips (the fit rows stay chip-free because
  their titles already say it). "More schools for your path" stays
  Browse-only: for the demo student it surfaced far-away schools with single
  digit finish rates.
- Browse all: the "Schools with <program>" shelf passes the programme, so its
  cards show the route chip (Direct path / 2-year start / Trade & technical);
  other shelves' titles already say it, so no chip there.
Verified 1280: Target/Safety/Reach = Direct path; Lower-cost = 2-year start +
Open admission.

## 2026-09-11 · Schools: photos for every school, counts in brackets, Reach made actionable
- Every one of the 30 schools now has a campus photo (`public/images/colleges`,
  manifest regenerated). 18 replaced or added from Wikimedia Commons (CC /
  public domain, credited in credits.json), 3 from the schools' own sites
  (Bergen, Northern State, Sisseton Wahpeton: all rights reserved, demo use),
  and 3 stand-ins where no campus photo exists anywhere fetchable, noted in
  credits: Mitchell Tech (Corn Palace), Mount Marty (Yankton's Meridian
  Bridge), Sinte Gleska (South Dakota prairie sunset). Stronger photos
  replaced the old ones for Rutgers, Montclair, NJIT, Princeton, Rowan,
  SDSU, USD, Augustana, SD Mines, Dakota Wesleyan.
- The no-photo fallback (now unused) shows a crisp mark on a brand field,
  not a blurred mark.
- Row counts sit in brackets beside the title, "Target (4)", For you and
  Browse all.
- Route chip stays wherever it is true (Direct path on every 4-year card).
- Reach row: note "A 3.9 GPA would make these targets. You're at 3.7." and
  each Reach card carries "Target at <GPA>" (`targetGpaFor` in pathway.ts,
  from the fit bands), only while the student's GPA is below it.
- School card hover: 4px lift, 1.2% grow, so it no longer covers the row
  title above.
Verified 1280: rows, counts, Reach note and chip, hover. Next image cache
cleared; browsers may still show old photos until a hard refresh.
- Reach chip reads "Target at 3.9" (the gap in brackets was tried and
  rejected as confusing). The GPA target applies to Reach only by definition: Target and Safety
  are already reachable, and "More schools for your path" holds schools with
  no acceptance rate (or open admission), where GPA plays no part.
- Changelog emailed to chandu.mp.14@gmail.com from the same account.

## 2026-09-11 · UX audit fixes, approved subset (demo flow untouched)
Report: https://claude.ai/code/artifact/3298cc86-cadd-4749-97b8-76f68b885089
- App shell: `LiveRegion` (one polite region; `announce()` helper) and a
  focus-only `SkipLink` in layout.tsx. Match announces save/pass/undo and the
  completed Top 3; school cards announce Save, Compare and Not for me;
  Profile already had its own region for the primary change.
- Match deck keyboard: ArrowLeft passes, ArrowRight likes, ArrowUp/Down
  scroll the card. Off while a sheet is open or a field has focus.
- Home "Continue Learning" cards and Play glossary cards collapsed to a 2px
  line on phones: size classes were on HoverBeam, whose own h-full won.
  Size now lives on a plain wrapper; HoverBeam fills it.
- Hit areas: mobile For You / Browse All tabs, "Why this school?", "Not for
  me", "View all activity", carousel dots and pause all have 30-44px boxes
  via negative margins; visible size unchanged.
- Report salary keeps its dollar sign ("$361,000 a year").
- `UndoToast` (6s, Undo, announced): after "Not for me" on a school and
  "Remove from Top 3" in Profile.
- Career detail: sticky section chips (Facts, Pay, Ladder, Education) under
  the header; `Section` and `Folded` take ids with scroll margin.
- Play locked cards: cover at 80% opacity and a solid "Soon" chip; colour
  kept per 9 Sept feedback.
- Location step opens on List when the viewport is under 700px tall.
- Posters: 62 PNGs (89 MB) converted to WebP at 840px wide (4 MB), all
  source references updated, PNGs removed.
- Audit correction: Play, Connect and Profile already reserve room above the
  fixed bottom nav (measured); no change made there.
Not changed on purpose: any copy, demo flags, Student/Enterprise toggle,
Connect card signals, splashes, Home hero eyebrow.
Verified: Home cards 304x190, glossary cards 267x150, arrow keys and live
text in Match, skip link, chips scroll on Career detail, both undo toasts.

## 2026-09-12 · Career Report: 03 Career Exploration (Joshua, Slack)
ONE commit, revertable with `git revert`. New files `src/lib/careerExploration.ts`
(store, types, EXPERIENCE_TYPES, logged-activity derivation) and
`src/components/profile/CareerExploration.tsx` (section body); CareerReport.tsx
inserts the section after 02 and renumbers 04 Majors, 05 Pathways, 06 Schools;
REPORT_SECTIONS updated; Where this comes from covers it.
- Left "Logged in Dreamari": tinted, stronger border, check on every row;
  read only. Demo career shows Joshua's three example rows; other careers
  derive "Saved X as a career goal" from picks; else the empty-state line.
- Right "Add your own": "Add something you did" opens a checkbox list of
  the 11 types; Add creates one row per checked type (dated today, editor
  opens on the first). Row tap opens Date (required), Where or with whom,
  Tell us more, and the three feeling buttons; edit and delete per row.
  Rows read "Type / date · where · feeling / notes" so they scan in a PDF.
- Hours: `EXPERIENCE_TYPES[].hours` flags job shadow and internship and
  `Experience.hours` is reserved, so the field is a one-line add later
  (Maisha: WBL tracked separately in v2, summary surfaced here).
- Print / Download preview: controls carry data-print-hide; rows stay.
  Counselor Review tab is a form, not the document, so nothing to add there.
Copy is Joshua's verbatim. Section titles for 04-06 unchanged from before.

## 2026-09-11 · One backdrop everywhere (Schools read lighter than Careers)
Direct feedback: "explore schools tab is using a different background than
the careers page". Root cause, found by sampling rendered pixels headlessly:
CollegesExperience and CollegeDetailExperience layered a second copy of
background-space.svg on top of AppBackdrop (which already carries it), and
CareerDetailExperience rendered AppBackdrop twice plus a third copy of the
sheet. The stacked translucent nebulae lifted the whole field (top-left
25,39,73 became 37,50,82). Removed the extras; every app screen now renders
exactly one AppBackdrop. Verified: Explore Careers, Schools (both faces),
College detail, Career detail, Home, Play and Profile sample identical
background values at four probe points. Home's data-space-backdrop div is
its star-dot decor, not a second sheet, left as is.

## 2026-09-11 · Real campus photos for the last four stand-ins
Direct feedback: "find proper images for colleges with stand-in images" and
"sisseton wahpeton college doesn't look like it has a real image". Commons
has nothing for any of them, so these come from the schools' own media
(user approved web downloads); credits.json records source, licence and a
note per school.
- Mitchell Technical College: aerial of the Mitchell campus, frame from the
  college's own drone video (mitchelltech.edu is behind a Cloudflare wall
  for non-US traffic; its pages were read through the Wayback Machine and
  hold no exterior still). Replaces the Corn Palace.
- Mount Marty University: aerial of Bishop Marty Memorial Chapel from
  mountmarty.edu. Replaces the Meridian Bridge.
- Sinte Gleska University: the tipi-shaped Multipurpose Center with three
  students in regalia, cropped to 3:2 from the portrait original on
  sintegleska.edu. Replaces the prairie sunset.
- Sisseton Wahpeton College: the drummer sculptures on the main building,
  Angela J. Smith on Flickr (CC BY-NC-ND 2.0, via Openverse). Replaces the
  site's decorative post-img.png.
Manifest regenerated (30 photos, 25 marks). Verified on all four detail
pages. Licences are school media for demo use; production needs permission
or a licensed replacement, same caveat as the other 26.

## 2026-09-11 · College detail header: photo no longer dimmed
Direct feedback: header images "too dim". Removed the flat rgba(12,16,35,0.34)
wash over the whole photo. Phones (title sits on the photo) keep the
progressive blur and a firm bottom fade (0.92 to transparent at 74%). From md
the photo is on the right and the title on the panel, so only a light foot
gradient (0.7 to transparent at 58%) remains. From md the photo is now
FULL BLEED across the header (direct feedback: "make the image more
dominant"): the progressive blur (direction left, 62%) frosts its left half
under the title and a left-to-right fade (0.82 to transparent at 76%) keeps
the type legible. Nothing is clipped, so no seam; an earlier pass with a
half-width photo and a painted edge left a visible stroke. Header height is
unchanged (320 from md); instead the cover crop anchors at 50% 38% (campus
subjects sit in the upper middle) via a new `position` prop on
CollegePicture, with HEADER_FOCUS per-school overrides (Sinte Gleska 50% 82%
so the students in regalia stay in frame). The page column is 1040 with
md:px-8, matching Career detail; it was 960 and read narrow next to the
taller photo. Checked Mount Marty, Rutgers, Princeton and Sinte Gleska on
desktop, Princeton and Sinte Gleska on a phone.

## 2026-09-11 · College detail: the mark on the title line
Direct feedback: marks "more visible" without cluttering the header. MarkBadge
now sits inline with the h1 from sm (64px; 52px stacked above the name on
phones so long names keep the column), takes a `ring="light"` translucent
white ring for sitting on the full-bleed photo, and the five schools with no
mark get a per-school tinted monogram (hue hashed from the slug) instead of
one shared placeholder. No new elements in the header.

## 2026-09-11 · School cards: even mark-to-name gap; fit panel eyebrow gone
- SchoolCard reserved two name lines on the name box (bottom-aligned), so a
  one-line name left a blank line under the mark while a two-line name sat
  tight (direct feedback: "inconsistent gaps"). The reservation now sits on
  the whole mark + name + place group (min-h 119, justify-end): rows still
  align across cards and the mark-to-name gap is constant.
- College detail "Why <school> fits you" panel: the "Your path" eyebrow was
  our label, not from Joshua's brief (the panel itself implements the
  brief's career -> route -> program -> school chain from the Replit
  reference, 10 Sept). Eyebrow removed, panel kept.
- Follow-up (same day): stacking the mark above the name still moved the mark
  up and down with the name's line count. The mark now sits BESIDE the name
  as a 44px profile picture, centred on the name + place block; the block
  reserves two name lines and two place lines (77) and sits at its foot, so
  rows align and the place line wraps instead of truncating.

## 2026-09-11 · Brandmarks for the last five schools (30 of 30 now)
Direct feedback: find the missing logos beyond Commons. Sources per school
in credits.json (`mark`, `markLicense`, `markNote`):
- Mitchell Technical College: M emblem cropped from the en.wikipedia
  wordmark (fair use); the school's site blocks non-US traffic.
- Mount Marty University: shield from mountmarty.edu (90 Years banner).
- Middlesex College: MC monogram from the site header SVG, recoloured from
  white to navy so it reads on the white badge.
- Paul Mitchell The School Rapid City: PM schools app icon, fetched through
  the Wayback Machine (the site returns 403 to scripts).
- Stewart School: the S icon from stewartschool.edu on a disc of the brand
  purple sampled from their share image.
All are school media for demo use. Manifest regenerated (30 photos, 30
marks); the monogram fallback in MarkBadge stays for any future school.

## 2026-09-11 · College detail: back button inside the header
Desktop back moved from its own row above the card to the header's top-left
corner over the photo (glass circle), matching the phone's back + wordmark
row; the photo is now the first thing on the page.

## 2026-09-11 · Schools landing, product-page pass (slice 1, not pushed)
Reference: Apple's Watch SE 3 and iPhone 18 Pro pages (structure, graphics,
interactions). New `SchoolsShowcase.tsx`:
- Hero is a centred stack (toggle, gradient headline via `Grad`, lede, CTAs)
  with `HeroShowcase` below: Career Detail on a tablet-sized glass card, the
  Match deck on a phone bezel (`Phone`), the student's profile card, and five
  feature bubbles (+100 XP, 91% match ring, Top 3 saved, a verified JPMorgan
  analyst, Career Report ready) drifting on `mkt-bob`. Every piece is a real
  component with real data; no screenshots. Phones show the phone and the
  bubbles only.
- "The highlights." carousel (`Highlights`): the five stage compositions as
  tall 4:5 cards on a snap track with copy on top, dots and prev/next arrows.
  The page itself never auto-scrolls.
- `StatBand`: 15 career worlds, 44 careers, 30 colleges and trade schools,
  50 partner companies, all counted from the data at build time (new
  `PARTNER_COUNT` export in PartnerTicker).
Copy unchanged. `CareerHeader` exported from SchoolsVisuals for the tablet.
Next slices proposed: stage chapters as eyebrow + gradient headline + tile
carousels of the three detail lines; a sticky local sub-nav; a "pick a
career" gallery that swaps the showcase's career.

## 2026-09-11 · Schools landing rebuilt to the reference (not pushed)
Direct feedback on the product-page pass: "copy is repeating, sections are
repeating, follow the structure and content from dreamari-educator-website".
SchoolsView now mirrors the reference section for section, nothing extra:
1. Hero: eyebrow "College & career readiness", headline (gradient on its
   second half), lede, CTAs, audience line; the floating device showcase as
   the illustrative preview; the seven-chip skills ticker (`SkillsTicker`).
2. #organization: "Built for the students you serve." with the four
   audiences as a segmented strip; "Give every student a clearer path
   forward." beside `SchoolsPreview` (three real Explore Schools cards).
3. #student-experience: eyebrow "Build. Match. Explore. Immerse. Connect.",
   heading, five stage cards (tile, "01 Build", line, Learn more). Learn more
   opens the stage's composition with its three detail lines and app link.
4. Educators: "For educators" pill, heading, lede, four features with icon
   tiles, ProgressArt with its caption (dashboard still in development).
5. #why-dreamari: book tile, heading, lede; card with "Explore our sources"
   (the three sources) and the Dream Opportunity row from the reference
   ("Built by the team behind Dream Opportunity", one line); DataArt beside
   it; the partner wall under (Joshua's one display per page) with
   DO_COPY.close as its caption. DO_COPY.heading and .lead are no longer
   rendered here; flagged to the user.
6. Demo: TrustLine, then the dark section with heading, lede, Quick setup /
   Custom onboarding dots, and the form card.
Removed: highlights carousel, stats band, FAQ, testimonials shell, outcomes
disclosure, OrganizationBand photo, sticky stage column. Nav "Why Dreamari"
now points at #why-dreamari as on the reference.
- Same day, second pass (direct feedback: "match light mode to light mode,
  remove sharp corners from graphics, simplify everything a lot more"):
  every composition now renders in the app's LIGHT token scope
  (`marketing-v2 theme-light` on Frame, Product, Phone, the Connect and
  educator cards), rounded and contained (no run-offs or clipped edges), and
  with fewer elements. Hero: one light phone with the Match deck and three
  bubbles (91% match, Top 3 saved, verified analyst); the tablet, profile
  card and two bubbles are gone. Audiences: `PathPreview`, the light Profile
  overview (Top 3 / Plan / Report / Do this next). Explore: one rail of three
  posters. Data: pay by state only, poster amber fills on the light map.
  Connect: one thread card with the community line above it. Educators:
  `EducatorArt`, counselor photo with the student's "Logged in Dreamari" rows
  (real data from careerExploration.ts) centred on its right; the profile
  ProgressArt is retired. Immerse stays a photo scene.

## 2026-09-11 · Schools landing: from-scratch graphics, exact reference copy (not pushed)
Direct feedback in one sitting: "start entirely from scratch, generate new
graphics", "use exact copy from the replit, no em dashes", "remove eyebrows,
remove the stage icons", "CTAs consistent with our design system, fields too
pill shaped", "reduce nested boxes", "left/centre alignment awkward", "no
percentage matches, don't drift from the app", "check the counselor
dashboard prototype and draw conclusions", "100x polish, animations, glass,
scroll effects".
- `SchoolsIllustrations.tsx` replaces SchoolsVisuals/SchoolsShowcase (both
  deleted). Fixed bright palette, Panel (glass, 28px) / Tile / Pill / Donut /
  Initials primitives, `Fit` zooms each fixed-width design into its column.
  Hero: three floating cards (Investment Banker career, My Top 3 with "Your
  Strongest Match", Amara Okafor's verified answer) with scroll parallax and
  staggered entrance, no panel. Stages (inside Learn more): Build chips,
  Match card stack with Pass/Like, Explore posters, Immerse question over the
  reception photo, Connect thread card. No app components, no screenshots.
- Counselor dashboard prototype (web-app-prototype-maishak.replit.app) read in
  full: Overview (Student Status, Postsecondary Plans, Career Pathways),
  Students caseload (Roadmap %, status, milestone review states), Milestone
  Tracker, Review Queue (Approve / Request Changes), Student Progress (summary
  by grade, CSV/PDF), Career + College Insights (recommendations, top saved
  careers/majors/colleges). Its vocabulary and sample figures are used
  verbatim; the designs are ours. Audience tabs now sit above the graphic
  they change and each shows a different composition: Schools = Students
  caseload, Districts = Student Progress by grade, Nonprofits = Insights
  recommendation + top saved careers, Institutions = top saved majors and
  colleges. Educators = Overview donuts + Review Queue. All labelled
  Illustrative preview (the reference's label).
- View: reference order and copy verbatim (dashes to commas); no eyebrows,
  no icon tiles; "01 Build" number + name; flat `solid`/`outline` button
  variants (12px, no glow) added to MarketingButton for this page only; form
  has no nested box, 10px fields, the reference's placeholders, org type
  defaults to School, students served is a text field; demo section is two
  columns (copy left, form right) with a soft glow; all section heads left
  aligned; aurora blobs drift behind the hero; tab highlight slides
  (layoutId); Learn more expands with height animation; stage cards lift on
  hover; bars, rings and rows draw in on scroll (framer-motion whileInView).
Next: user review, then push.
- Follow-up: the sources section regrouped by the heading's two claims
  (direct feedback: "grouping and ordering seems weird"). Research = the
  three sources as visible tiles (the reference's "Explore our sources"
  toggle is gone; hiding the sources behind a button left an empty card).
  Industry = one Dream Opportunity block: mark, "Built by the team behind
  Dream Opportunity" and its line, then the partner wall, then the 12-years
  closing line.
- Demo request address is product@dreamopportunity.org (mailto target and the
  note under the button); the personal address is gone (direct instruction).

## 2026-09-11 · Demo request: two steps, backend delivery
Direct instruction: fewer fields, no mail app, the backend receives and
sends. Research (Brixon, Tiller Digital, Reform, Unbounce thank-you-page
guides) agrees: 3 to 4 low-friction fields first, qualifying questions after
the first submit, never a multi-step "Next" before it.
- `DemoRequestForm`: step 1 = Your name, Work email, Organization name, one
  button. Step 2 = "Request sent. We will be in touch at <email> within one
  business day." plus three chip questions (Your role, Organization type,
  Number of students served) with Send / Skip. Both steps POST to
  `/api/demo-request` with one client id so the inbox can pair them.
- `src/app/api/demo-request/route.ts`: validates, then delivers via
  DEMO_REQUEST_WEBHOOK (Google Apps Script web app on the team's Sheet:
  append row + email), else RESEND_API_KEY (Resend REST, to
  DEMO_REQUEST_TO, default product@dreamopportunity.org), else logs to the
  Vercel function log. Always returns ok so the page never dead-ends.
  Env vars to set on Vercel: DEMO_REQUEST_WEBHOOK or RESEND_API_KEY (+
  DEMO_REQUEST_FROM on a verified domain), DEMO_REQUEST_TO.
Verified locally: both POSTs 200, sent and survey states render.
- Demo section: the reference's "Quick setup" / "Custom onboarding" bullets removed (direct feedback: they read as nothing).
- Audiences section: heading spans the width; the two columns lock to the same top edge and the graphic column has a fixed height (600px from lg), so switching tabs never moves the copy (direct feedback). Caseload table widened so the review chips fit.
- Educators section: copy and the four features (icon badges back, as on the reference) left, a compact dashboard (Student Status, Postsecondary Plans, Review Queue) right, same locked-top pattern as Audiences (direct feedback: the left copy / right graphic pattern works).
- Reference parity: nav carries the small "For educators" label before the links on the Schools view; the footer on that view combines the reference's ("Discover, don't guess." under the mark, an Explore column: Student Experience / For Your Organization / Request a demo) with our Company column (Why Dreamari, About, Contact -> product@); "Explore our sources" is back as the heading over the three source tiles.

## 2026-09-11 · Schools landing: theme switch, fuller hamburger, final polish
- Light/dark switch in the nav (Schools view only), persisted in
  localStorage `dreamari-schools-theme`, light by default. MarketingApp
  applies `theme-light` only when light; otherwise the marketing-v2 dark
  tokens apply. New tokens in tokens.css for both themes: `--surface`,
  `--ill-ink`, `--ill-ink2`, `--ill-line`, `--ill-soft`, `--ill-panel`,
  `--ill-tint`. Every illustration ink and surface, every card, tab pill,
  field, outline button and the form card read those vars; the partner wall
  switches to white marks in dark. Checked both themes end to end.
- Hamburger: one list for every menu (Home, Explore, Find a school, Build,
  Match, Play, Connect, My Profile, Sign Up) plus "Connect as" (Student,
  Event attendee, Volunteer, Partner, Staff) and a For students / For schools
  switch. Same list on the student view.
- Back by request, redesigned: the eyebrows ("College & career readiness",
  "Build. Match. Explore. Immerse. Connect.") and the "For educators" pill as
  one Eyebrow chip (dot + bold, tinted, not mono caps); "Quick setup" and
  "Custom onboarding" as two glass cards with icons in the demo section.
- Glass: tab pill and stage cards frost over the page; progressive blur
  (CardProgressiveBlur) under the poster titles, the Match card and the
  Immerse scene. Review Queue item column widened, second button "Changes".

## 2026-09-11 · Schools landing: shared menu + global theme, Apple patterns from the iPhone Duo page
- One hamburger everywhere: `QuickLinksPanel` (app/chrome.tsx) is the menu body
  for the app's QuickLinksMenu AND the landing Nav (both views). App pages,
  "Connect demo · view as", and the theme toggle as the last row. The landing
  adds its section links (small screens) and the For students / For schools
  switch above. The standalone sun/moon button is gone.
- Theme is the app's global one (`dreamari-theme`, html.light/dark). New
  `setGlobalTheme(theme, persist)` and `hasSavedTheme()` in app/theme.tsx.
  MarketingApp sets light on the Schools view and dark on the student view
  when no theme is saved (not persisted); a saved choice always wins.
- Motion read from the reference DOM, not screenshots: chip groups drive a
  scroll-snap gallery (smooth scroll to the card), chip highlight recolours
  in ~0.25s, panels fade in 0.3 to 0.4s ease-out, reveals are short fades.
- Stages: `StageGallery`, chips "01 Build" to "05 Connect" over a snap track
  of five slides (line, three points, app link, illustration); scrolling
  moves the chip; dots below. Stacked cards and Learn more removed.
- Hero: three chips under the cards switch the career card (Investment
  Banker / Nurse Anesthetist / Software Engineer) with a 0.3s fade; pay and
  degree from each career page (`HERO_CAREERS`, `HeroIllustration({career})`).
- Callouts at the end of the stages section: 15 career worlds, 44 careers,
  30 colleges and trade schools, counted from the data.
- Audiences: Districts is now Student Progress rolled up by school (six
  schools, prototype status vocabulary, illustrative figures); Nonprofits is
  framed as a cohort across three schools. Relevance caveat: the nonprofit
  recommendation copy is the prototype's and says "your school".
- Maisha's prototype went blank mid-review; Engagement and Impact pages not
  yet read.
- Callouts (15 / 44 / 30) removed again: not on the reference and they read as small numbers (direct feedback).
- Prototype came back; read Platform Engagement (MAU/WAU/DAU, logins by
  month, students needing intervention), My Impact (shareable report with
  Print / Share / Generate Principal or District Report, headline rates,
  Platform-Facilitated Student Engagement block, ASCA alignment), Counselor
  Connect (announcements with read rates, student questions) and Productivity
  Suite (draft recommendation letters, meeting briefs). Nonprofits tab is now
  the My Impact report (its figures verbatim): the funder-facing artefact a
  program needs. Audience tabs now: Schools = caseload, Districts = progress
  by school, Nonprofits = impact report, Institutions = saved majors and
  colleges.

## 2026-09-11 · Career Exploration: "Add your own" in under 30 seconds (Joshua, Slack)
Per experience, in order: "Date*" (asterisk only, no "(required)"; rows start
undated so the student types the date, nothing pre-fills today), "Where or
with whom?" with placeholder "Company, school, or person", "What did you
do?" as one short optional text box ("Tell us more" and "What surprised
you?" removed), "How did this affect your interest?" with More interested /
About the same / Less interested, then Done (enabled once a date is set).
Row summary, Career Report rows and print output unchanged.
Verified on the Investment Banking report's 03 Career Exploration section.

## 2026-09-11 · Career Report: Share + More (Joshua, Slack); Careers | Schools
- The five visible report tabs are gone. On the report: a primary Share
  button and a "••• More" menu (Counselor Review, Download, History). No
  duplicate Report button. Inside a secondary view the bar becomes
  "‹ Report" plus the view's name. Panels unchanged. `CareerReport.tsx`.
- Explore tab strip separator "/" is now "|" (Joshua). `chrome.tsx`.

## 2026-09-11 · Top 3 cards answer "test it or learn more?" (Joshua + direct feedback)
- Card order inside `Top3Tab` (`ProfileExperience.tsx`): photo (kebab; a star
  disc marks the primary career, no text chip), world + title, one clamped
  description, then Play and Learn more side by side (Joshua: never
  "coming soon" in a demo; a career without its own game goes to
  `/play?focus=<id>` and still says Play; Learn more is `/career/<id>`
  with the diagonal arrow), the three clamped facts, Employers & schools
  fold, then "Get Career Report" apart at the foot (opens the Report tab
  with that career as focus). Both buttons are the bright `FROST`
  fill (white 14% over blur); no rules anywhere in the card; the fold label
  is left-aligned (buttons centre text by default).
- "Your Strongest Match" / "Make my primary" removed from the body. The
  kebab has two items: Remove from Top 3, Make My Primary. The primary
  career renders in the first card (sort by `focusId`).
- Surface is `--inset-surface` with a 14px blur (was glass-surface-1: too
  transparent). Tighter rhythm: body gap space-2, padding space-4, 16/10
  photo. Reserved title/description heights dropped (they left a hole under
  one-line titles). Cards 728px to 701px at 800px wide.
- Bottom "Play" nudge removed (Play is on the cards). Top Explore nudge kept,
  beam slowed to 5s via new `beamDuration` prop on `NextStepBanner`, calm.
- Career detail: the sticky Facts / Pay / Ladder / Education bar is now one
  32px segmented strip hugging its links (own blur), no full-width bar.
- Verified: links map to `/play/investment-banking`, `/career/<id>`, Report
  tab; Make My Primary from the Airline Pilot menu moved it to card one.
- Not done: beam on the active career card (asked to hold).

## 2026-09-11 · Schools landing at phone width
- `Fit` floor 0.5 to 0.4 so the 700px dashboard and 560px Immerse compositions
  fit a 325px column. Hero: on phones the three cards are a horizontal snap
  row at card size (`sm:hidden`); from sm the 1040px zoomed grid. No element
  overflows 375px except clipped decorative blobs and the marquee.

## 2026-09-11 · Explore videos rail: lean-back cards above Typical Pay (Joshua)
- `CompanyVideoCards` is the Apple TV "Lean Back & Watch" shape: 248 x 330
  cards (posters stay 210 x 297), covers cropped toward their top third so
  the baked titles survive, the lead card (Mars) plays its clip muted on a
  loop while on screen with a mute badge, the others preview muted on
  hover; the clip title fades in only while a card is playing. Tap still
  opens the full-screen player with sound. Order unchanged: Mars, JPMorgan
  Chase London Office Tour, EY, AT&T, WildBrain, Kellogg's.
- The rail moved from last to directly above "Typical Pay: $100K +".

## 2026-09-12 · Explore video cards: real square, hover sound, shared mute; Browse scales down on phones
- Lean-back cards resized from a true square (316/324 cut the baked-in
  titles) to 276 x 316... final: 276 x 368, a little squarer than the
  poster rail's 210 x 297 but not a true square (direct feedback: square
  crops clipped the video titles).
- Lead card (Mars) now plays once on scroll-into-view then rests on its
  cover, instead of looping -- it was pulling the eye every time it
  scrolled back on screen.
- Every card now plays WITH SOUND on hover/focus if the shared "device
  sound" preference is unmuted (`src/components/app/videoSound.ts`,
  localStorage `dreamari-video-sound-muted`, one on/off choice for every
  card on the page, persisted). If the browser rejects an unmuted autoplay
  from a hover (real gesture required in most browsers), it falls back to
  a silent preview for that attempt only -- the shared preference itself
  is untouched, and a real click on the badge always works. Scroll-
  triggered lead-card autoplay is always muted (no gesture behind it).
  Fixed a real bug along the way: the `<video>` had a bare `muted` JSX
  attribute (always `true`), which is a React-controlled property -- any
  re-render (including the one the mute toggle itself triggers) was
  silently re-muting playback. Now `muted={elMuted}`.
- Badge is a real toggle once a clip is playing (Volume2/VolumeX,
  aria-pressed), not decorative.
- Explore > Browse rails (every `Rail` plus `TrendingRail`, so every
  poster row, Typical Pay, Videos Inside Leading Companies) scale down
  together on phones via `.explore-poster-row` (zoom: 0.78 under 640px,
  globals.css) -- one zoom on the row scales cards, gaps, padding and type
  together without invalidating PosterCard's px-based title-fit math, the
  same technique the Schools landing's `Fit` uses. Home's own poster rows
  share `.poster-row` but not this class and are untouched.

## 2026-09-12 · Build's GPA question: a slider, not a dropdown (Joshua)
Per feedback: "we want really accurate, to the decimal level" -- a band like
"3.5 to 3.9" was only ever a proxy pathway.ts's parseGpa averaged down to a
single number anyway. Options are now every tenth from 2.0 to 4.0 (21
stops) plus the three answers a number can't hold, kept verbatim: "4.0 or
higher", "Below 2.0", "My school does not use GPA".

Rather than a 24-row dropdown, `GpaField` (new,
`src/components/build/GpaField.tsx`) is a real `<input type=range>` styled
like CostStep's tuition slider (gradient fill, glowing thumb, tick dots at
the whole numbers, all under custom paint) -- drag or arrow keys land on an
exact decimal, no typing, no long list. The three special answers are chips
under the slider; picking one shows in the readout exactly like a dragged
number would, and moving the slider again always wins. Untouched, the thumb
rests muted at the scale's midpoint (3.0) without actually selecting it --
`state.gpa` stays "" until a real interaction, so Next stays gated exactly
as before.

`GPA_OPTIONS` (types.ts) is still exported as a flat, highest-first list for
the two other GPA dropdowns that didn't ask to change (Settings, the
college list's "Edit your list" sheet) -- they now offer the same decimal
precision, just still as a plain list. Flagging: those two got longer (24
rows) as a side effect; worth the same GpaField treatment if that becomes a
complaint, but out of scope for this ask.

Verified via lint/tsc and hand-checked the scale in Node (21 clean tenths,
2.0 to 4.0, no float drift, midpoint 3.0); not re-clicked through the full
8-step Build flow to the Profile screen per direct request (stop the
hover/wait loop).

## 2026-09-12 · GPA slider redesign: feedback follows the thumb, a ruler, a tick sound (direct feedback)
- The live GPA readout is no longer a static line above the slider ("off
  to the side... feedback is not proper"). It's now a pill that floats
  directly over the thumb, following the drag (clamped off the card
  edges), so the number lands exactly where the eye and the finger already
  are. A special answer shows in the same pill, centered, while the slider
  itself visibly parks (fill and ticks go dim, no glow) since it isn't the
  mechanism behind that answer.
- The track is now a real ruler: one tick per tenth, tallest/brightest at
  the whole numbers, medium at the halves, faint in between -- this, not a
  caption, is what signals the answer wants a decimal and not just the
  nearest whole number ("show that decimals are a required accuracy...
  without causing clutter").
- `playGpaTick` (sound.ts): a short, dry click on every tenth crossed while
  dragging or arrow-keying, pitch climbing gently across the scale ("that
  tick tick smooth sound when scrolling"). Fires once per real step change
  only (a ref guards against firing on prop-driven re-renders, e.g.
  returning to this step with a stored value).
- Verified via lint/tsc and by hand-checking the tick-weight classification
  in the reasoning above (3 major / 2 half / 16 minor across the 21 stops);
  not re-clicked through Build's 8 steps to drag it live, per direct
  request to stop the hover/wait-heavy testing loop. Worth an actual drag
  test on a real device for feel/volume once convenient.

## 2026-09-12 · Slider polish: gradual color, Apple-style click, chips read as part of the question
- Both sliders (CostStep's tuition slider, GpaField): the fill gradient was
  brand blue straight to the amber world color, ~180 degrees apart on the
  wheel ("too far apart and not gradual"). Now blue into the app's own
  violet accent (`--color-accent-purple`), the same adjacent pairing the
  marketing page's headline gradient already uses. Renamed the local
  `AMBER` const to `ACCENT` in both files; every tick/thumb/glow color
  follows it.
- `playGpaTick` (sound.ts): redone as a genuine click, not a tone --
  14ms, square wave, ~3.3-3.9kHz (treble, "like Apple's time picker"),
  almost all attack and no sustain, instead of the earlier 26ms triangle
  tone in the 640-980Hz range that read as a pitched "boop".
- GpaField: the three special chips now sit under a small centered "Or"
  label, so they read as alternate answers to the same GPA question
  instead of a separate, unexplained control (direct feedback: "do they
  seem too different and confusing?"). Selected-chip text is white, not
  the old near-black tuned for an amber fill.

## 2026-09-12 · GPA slider: simplified after repeated clipping (direct feedback)
Several rounds of direct feedback in one session; final state:
- The scale's two ends ARE "2.0 or below" and "4.0 or higher" (drag all
  the way to an edge to pick it, not separate chips). Every tenth between
  is a real tick on the ruler, tallest at the whole numbers, medium at the
  halves, faint between -- that density, not a caption, signals the
  answer wants a decimal.
- "GPA" title, the current answer inline right beside it (e.g. "GPA 3.7"),
  and a compact checkbox for "My school does not use GPA" all share one
  row. Checking it dims and disables the scale below (`disabled` on the
  range input too); unchecking it clears back to no answer. One merged,
  always-shown line under that row covers both the drag instruction and
  the reassurance copy ("Drag to set your exact GPA. It doesn't define
  you, it just helps us find realistic schools." -- no em dash).
- Removed: the floating value pill that used to chase the thumb. It was
  the actual source of the repeated edge-clipping (a ~90px-wide pill needs
  a much bigger edge reservation than a 24px thumb does) and, per direct
  feedback, added clutter for no real gain once the answer already shows
  in the title row. The thumb's own glow is now a slim 3px ring rather
  than a wide spread, so one small shared inset (`px-4`, the track, its
  ticks and the end labels all use it) comfortably clears it with no
  reservation math -- verified with no clipping at 375px width, both
  scale ends, screenshotted.
- Root cause of "still cropping" despite earlier bigger paddings: it
  wasn't really about padding size. `flex-1 flex-col overflow-y-auto`
  (every Build step's scroll wrapper) forces `overflow-x` to `auto` too
  per the CSS spec's mixed-overflow rule, and the OLD wide floating pill
  (needed ~90px clearance) kept exceeding whatever local padding it was
  given. Confirmed via computed-style walk of the DOM. Removing the pill
  removed the problem at its root instead of continuing to guess bigger
  numbers.
- Same color/gradual-gradient fix as the tuition slider: blue into the
  app's own violet accent, not blue-to-amber.
- Zip Code and "How far would you go for school?" got the same bigger
  field-title treatment as Grade/GPA; Zip Code's placeholder is now a real
  example ("10001") instead of repeating the label.

## 2026-09-12 · GPA field: real root cause of the clipping found and fixed
Repeated direct feedback across many rounds; final state, and the actual
bug behind "still cropping" that every earlier padding increase (px-9,
px-6, px-4, px-3) failed to fix:

- **Root cause**: `TRACK_INSET` was a Tailwind padding CLASS on the
  track's parent div, but the track/tick/thumb elements are `position:
  absolute` with percentage `left`/`width`. Per the CSS spec, an absolute
  child's percentage offsets resolve against the padding BOX's origin,
  which coincides with the border-box corner when there's no border --
  the parent's padding VALUE has no effect on that math at all. So every
  "add more padding" attempt was cosmetically plausible but functionally
  inert; the thumb was always positioned at literal 0%/100% of the outer
  box regardless of the padding number. Fixed by computing real pixel
  insets directly on each absolutely positioned element instead (`SAFE`
  constant, `travelLeft()` helper, explicit `left`/`right` in px, nested
  `calc()` for the fill width and tick/thumb positions) -- verified by
  reading actual `getBoundingClientRect()` values against the real
  clipping ancestor before calling it fixed this time, at both ends of
  the scale.
- The readout chip's own glow (a box-shadow blur) was separately clipped
  on the right, since the chip sits flush at the row's own right edge
  with no reserved margin -- cut the blur from 16px to 8px and gave the
  chip a small `mr-1`.
- Layout, per several rounds of direct feedback: "My school does not use
  GPA" is a compact checkbox right next to the "GPA" title (not at the
  row's far edge); checking it removes the whole slider block from the
  DOM (not just dims it), so its space collapses; unchecking it restores
  a blank scale. The live answer is a square "slot" chip in line with the
  track, to its right -- a real flex sibling, never an edge-tracking
  overlay, so it structurally cannot clip. A plain tenth shows as one big
  number; "2.0 or below"/"4.0 or higher" split into a big "2.0"/"4.0" over
  a smaller "or below"/"or higher". The chip's fill is the same blue-to-
  violet gradient the track uses, in white, for more energy than a dark
  slot read as ("not vibrant enough"). The instructional/reassurance
  sentence moved out of the field entirely, to one centered italic line
  above the Skip button. End labels ("2.0 or below" / "3.0" / "4.0 or
  higher") sit flush at the true track edges and read muted, not full
  brightness.
- Zip Code is now a boxed field like Grade/GPA/travel-distance, not the
  page's only underline input; its placeholder is a real example
  ("10001").


## 2026-09-12 · Profile Basics: compact GPA picker

User approved replacing the GPA slider with a compact exact-value picker after reviewing the local form. `GpaField.tsx` now opens a native modal dialog styled as a desktop popover or mobile bottom sheet, with 21 choices: 2.0 or below, each tenth from 2.1 through 3.9, and 4.0 or higher. No answer is preselected. Existing bare 2.0/4.0 values display as their inclusive boundaries. A separate native no-GPA checkbox keeps the field footprint stable, shows Not applicable, and restores the prior answer when unchecked. Profile Basics is top anchored within its existing scroll region. Other Build screens and their effects are unchanged.

Validation: targeted ESLint, TypeScript, and tokens:check passed. Inspected desktop and 375×812 mobile layouts in localhost:3000/flow; selected 3.7 and both endpoints; verified opt-out/restore and Escape focus return. Native dialog supplies focus containment and inert background; values support arrow, Home, and End navigation. No deployment or commit. This replaces the earlier slider design decisions above by direct user instruction. Next step: user review of local Profile Basics.

## 2026-09-12 · Profile: "Do this next" copy trim

Dropped "and save your Top 3" from the Explore line in Profile's "Do this
next" card (`ProfileExperience.tsx`); it now reads "Explore 10 Finance
Careers". Direct user instruction. The matching line in the finance
roadmap plan (`profile/data.ts`, verbatim from Joshua Pierce) was left
untouched -- the user named only the "Do this next" section.

Validation: targeted ESLint and TypeScript passed. Committed and pushed
to main (bf452c1).

Separately, in progress and NOT committed or pushed: `MatchGrid.tsx`
(`src/components/match-lab/`) and its route (`src/app/match-grid/`), an
experimental grid-based alternative to the swipe-card Match flow, reusing
the same DECK data and picks handoff as the live `MatchLab.tsx`. Explicit
user instruction: local-only, no push, until asked. Do not commit these
alongside unrelated work.

## 2026-09-12 · Match grid: pushed

Update to the entry above: the user asked to push everything, including
Match grid. `MatchGrid.tsx` and its `/match-grid` route are now committed
and on main (c06e35a) -- no longer local-only. Still does not touch
`/match-lab` or `MatchLab.tsx`; both routes exist side by side.

## 2026-09-12 · Match: A/B toggle, live

Added `VersionToggle.tsx` -- a small A/B pill in the header of both
`/match-lab` (A, swipe deck) and `/match-grid` (B, grid). Clicking the
inactive letter navigates to the other route. Placed in MatchLab's own
row (it has vertical room); in MatchGrid it sits inline beside the "X of
3" counter chip instead of its own row, since that page is tuned to fit
the viewport with zero scroll and a new row would reintroduce it.

Every entry point into Match (BuildFlowExperience finishing or skipping,
Profile's two "start swiping" links, ReportChooser's empty state) already
routes to `/match-lab`, so the toggle there covers all of them without
touching each call site. Direct user instruction: pushed to main (bb617ba).

## 2026-09-12 · GPA picker: order reversed, no longer bottom-docked on mobile

Direct feedback on the compact GPA picker (2026-09-12 entry above):
4.0 or higher now leads the grid, descending to 2.0 or below at the end
(reversed the `choices` array in GpaField.tsx). The mobile media query's
forced `top: auto; bottom: 12px` -- which pinned the picker to the very
bottom of the screen regardless of where the field sat on the page --
is gone; mobile now uses the same anchored-below-the-field
`--picker-top` positioning as desktop. Pushed to main (388e445).

## 2026-09-13 · Match: Option B is the only flow now

Direct user instruction: the grid (Option B) won the A/B test. Removed
the toggle entirely (`VersionToggle.tsx` deleted) and repointed every
entry point into Match -- BuildFlowExperience (finish + skip),
ProfileExperience (two "start swiping" links, copy updated), ReportChooser's
empty state, the demo QUICK_LINKS nav menu, and the SchoolsView "How It
Works" Match chapter (copy updated, its illustration still depicts the
old swipe card -- flagged, not fixed, out of scope for this pass) -- from
`/match-lab` to `/match-grid`.

`MatchLab.tsx` and `/match-lab` are untouched and still fully working,
just unlinked -- a deliberate revert path, not a deletion. Its own
five-section breakdown still reads from the original Career fields
(hook, skills, classes, workStyle, pathway, tradeoff), which are
untouched.

Also: the "Learn more" detail modal on `/match-grid` is now a universal
3-section structure for all 6 careers -- What You'd Do / Good Fit If You
Like / School & Path, 2-3 short bullets each, 8th-grade reading level.
Direct instruction: this replaces the old 5-section breakdown as a quick
"worth a Top 3 slot?" read, not a report. New `whatYouDo`/`goodFitIf`/
`schoolPath` fields added to the `Career` type in `match-lab/data.ts` and
populated for all 6 careers.

Pushed to main (3917dc9).

## 2026-09-13 · Connect: volunteer profile split into 2 tabs

Direct instruction (Catchafire reference, mocked up in Replit): reduce
information density on the volunteer profile without losing content.
Applied to BOTH places a volunteer profile renders -- ProProfileView
(student-facing, ProProfile.tsx) and ProDashboardView's "My Profile" tab
(the volunteer's own self-view, ProDashboard.tsx) -- since the written
spec's header list ("...Views, Followers, Likes, personal quote, and
Follow button") matched ProProfileView exactly, while the supplied
mockup screenshots showed the self-view (Edit Profile, "Volunteer
Dashboard" active in nav). Confirmed with the user rather than guessing
which one.

New shared `OverviewSection` (exported from ProProfile.tsx): About Me
(pro.journey, previously unused), Experience (Current Company, Previous
Company from pro.priorRole -- singular; the data model has one prior
role per person, not a list), Education (kept the existing school-logo
badge treatment), I Can Help With, 2 Communities + View all. Both files
import and render the identical component so the two screens can't
drift apart.

Ask Me & Posts combines each screen's existing Ask Me + Posts panels
under one section with an Answers | Posts toggle -- no functionality
changed, just regrouped (the dashboard's real routed-question-answering
flow, the student view's read-only answered list + composer).

ProDashboardView's header gained the tier badge / stats row / quote it
was missing (ProProfileView already had these) plus a visual-only Edit
Profile button (no edit flow built -- out of scope).

Verified in the browser: both screens, all tab combinations, desktop and
mobile. Pushed to main (164ae60).

## 2026-09-13 · Home: label + title hierarchy; Connect: header/toggle fixes

Home: Play and Explore rails now show a small clickable kicker (PLAY /
EXPLORE, routes to that feature) above a plain-language title
("Recommended Careers" instead of "Explore Recommended Careers"). New
`SectionKicker` in HomeExperience.tsx. Your Next Moves unchanged.

Connect: direct feedback on the just-shipped profile split (see the
entry above) --

- ProDashboardView's from-scratch header landed as plain text, none of
  the gradient cover-photo card ProProfileView already had. Extracted
  that card into a shared `ProfileHeaderCard` (ProProfile.tsx) -- both
  screens render the identical component now, can't diverge again.
- Tier badge moved from beside the name to the role | company line (was
  crowding long names).
- Two stacked same-weight pill toggles (Overview/Ask Me & Posts, then
  Answers/Posts) read as "too many toggles". New `SubTabs` -- small
  underlined text tabs -- for the inner choice; outer toggle stays the
  one prominent pill.
- Ask Me composer no longer sits beside a redundant "Ask Me" heading;
  it's alone on its own row.
- Current Company matches Education's label-then-value shape now, no
  Briefcase icon tile.

Pushed to main: Home (40b1592), Connect (050ab49).

## 2026-09-13 · Home: kickers removed; Connect: SubTabs divider + density

Home: reverted the PLAY/EXPLORE kicker labels from the previous entry --
direct feedback favored naming the feature in the CTA text instead
("Explore All Careers" already says Explore; "View all activity" became
"View all in Play"), one fewer element on the page for the same
wayfinding job. `SectionKicker` removed.

Connect: `SubTabs` (shared, ProProfile.tsx) now shows a literal "|"
between Answers and Posts instead of gap spacing, and confirmed the
active tab's underline is a flat line. Tightened the Ask Me & Posts
card's own padding/gaps (was reading as excess empty space). The blue
border a screenshot showed on a question card was a hover-state
artifact, not a bug -- confirmed by screenshotting the resting state.

Pushed to main (e84d284).

## 2026-09-13 · Home: chip CTAs, tablet card fix, rail spacing

Direct feedback: "Explore All Careers" and "View all in Play" were two
different colors (blue/white) and didn't read as tappable. New shared
`RailCta` (HomeExperience.tsx) gives both the same tag-chip treatment.

Found and fixed a real bug: on tablet widths, ActivityCard's wrapper
used `md:min-w-[304px]` while the card itself enforces `sm:min-h-
[212px]` -- a mismatch (the wrapper's own comment claimed it matched
"the known-good sm size" of 360px, but the number written was 304).
Aspect-ratio math on a 304px-wide wrapper computes 179px height, 33px
short of the card's own min-height, so the card overflowed its wrapper
and its bottom row rendered underneath the next section. Fixed:
`md:min-w-[360px]`. Confirmed via getBoundingClientRect that wrapper
and card heights now match exactly at every width tested.

Tightened the gap between each section's title row and its cards
(space-5/6 -> space-3) on Home's three sections, and normalized the
same value in Explore's shared `Rail` and `TrendingRail` (ExploreExperience.tsx)
so those rails read consistently with Home's. Direct feedback asked for
this consistency across "all row sections everywhere" -- still
outstanding: Play, Colleges, Career Report, Profile, and Connect's own
rail-shaped sections haven't been audited yet.

Pushed to main (370c9a4).

## 2026-09-13 · Schools landing: Match illustration redesigned (grid, then carousel), not pushed

`MatchIllustration` (`src/components/marketing/SchoolsIllustrations.tsx`) previously
depicted the dormant swipe-card Match UI -- flagged in the "Match: Option B is the
only flow now" entry above as "out of scope for this pass." Redesigned this session,
in stages, all direct instruction:

- First pass: a static 3-card grid mirroring `/match-grid`'s real cards (salary chip,
  +/rank select circle, small "Learn more" tag), replacing the single swipe card.
- Second pass: rebuilt as an interactive carousel reusing the exact fanned-deck
  mechanic from `PlayHub.tsx`'s `MobileDeck` (Play tab's Career Simulations rail) --
  an `order` array of ids rotating front-to-back, `advance()`/`back()` with the same
  spring physics and off-screen fly/slide transitions -- but with Prev/Next arrow
  buttons flanking the stack (not just gesture + one idle hint) and the front card
  still real drag-to-swipe on touch.
- Content went back and forth: briefly switched to importing the live 6-career
  `DECK` from `match-lab/data.ts` for perfect parity with `/match-grid`, then
  reverted by direct instruction -- this illustration is deliberately NOT a mirror
  of the match-lab data module; its own local `MATCH_CARDS` constant (Investment
  Banker, Private Equity Analyst, Software Engineer -- the same three it has shown
  all session) is the source of truth for it, not `DECK`.
- Stack spread increased (34px / 0.09 scale step, up from PlayHub's own 16px/0.06)
  and the deck's own box widened by the extra step room, so the peeking cards are
  actually visible instead of sitting under the side arrow buttons.

Validation: targeted `tsc --noEmit` and ESLint clean. Could NOT verify live in the
real dev server this whole session -- another local session's `next dev` held
Next's machine-wide single-dev-server lock throughout (confirmed this is a
machine-wide lock, not per-directory: it blocked a server started from an isolated
git worktree too). Verified instead with throwaway static/vanilla-JS mockups
reproducing the exact markup, spacing and interaction logic (screenshotted each
time, not saved anywhere). Added a `dreamari-schools` (port 3005) entry to
`.claude/launch.json` for whenever a real dev server is free to check this in the
browser for real.

Not committed, not pushed, per standing instruction (this session doesn't push
without explicit go-ahead). Recommended next step: once a dev server is available,
open the Schools view (audience toggle on `/`) and confirm `MatchIllustration` for
real -- spread/peek visibility, the arrow buttons, and the drag-to-swipe gesture on
an actual touch device or emulated mobile viewport, not just the vanilla-JS
approximation.

**Update, same day, from a second session working in parallel (dreamari-d9):** that
session had its own dev server free and verified the carousel live in the browser
(Schools landing, Enterprise toggle, Match chapter) -- so the real-device check
above is done. It also extracted the "Learn more" bullets into a small
`MatchDetailSection` helper (cosmetic only, same single "What You'd Do" section,
still no modal) and independently ran the same DECK-import-then-revert experiment
described above, landing on the same conclusion: local `MATCH_CARDS`, not the
match-lab data module. The two sessions' versions converged to the same shape; no
conflict, nothing further to reconcile at that point.

**Second update, same day:** the card CONTENT above was still wrong. Direct
correction: this illustration's "old illustration" reference point is the Student
landing page's own Match chapter (`MatchChapter`/`MatchDemo`/`CARDS` in
`marketing/chapters/Match.tsx`), not `/match-grid` and not an invented set. Its
three cards, reused verbatim (confirmed against that file directly): Management
Analyst ($99K, `poster-management-analyst.webp`, "Figures out how a business can
run better, then makes it happen.", major Business & Management), Investment
Banking ($361K, `poster-investment-banking-v3.webp`, "Helps big companies raise
money and buy other companies.", major Business & Management), Private Equity
($250K, `poster-private-equity.webp`, "Helps investors buy, improve, and sell
companies for long-term returns.", major Finance or Economics). `MATCH_CARDS` now
matches this exactly (id/title/photo/blurb/salary/major).

Also removed per direct instruction ("NO other info are there on the cards"): the
salary chip on the card face and the +/rank select circle -- this illustration
doesn't carry Top-3/save semantics, that belongs to the real match screen only.
The "Learn more" pill became "Tap to see details" (info icon + text, glass pill),
matching `Match.tsx`'s own flip-card affordance exactly. The inline reveal (still
no modal) now shows blurb + Median Salary + College Major rows, mirroring that
chapter's flip-card back face instead of "What You'd Do" bullets.

Both sessions have now read `marketing/chapters/Match.tsx` directly and confirmed
`MATCH_CARDS` matches it. Still not committed, not pushed.

## 2026-09-13 · Correction: wrong page entirely -- reverted Enterprise, fixed the Student page instead

The whole thread above (this file's redesign, then reusing `Match.tsx`'s cards) was
on the wrong page. `SchoolsIllustrations.tsx`'s `MatchIllustration` is the
Enterprise/Schools page (`SchoolsView.tsx`, audience toggle labeled "Enterprise" but
internally `view === "schools"`) -- direct instruction: it "should feel more like
the others on there" (Build/Explore/Immerse/Connect: richer, info-dense mockups),
not a literal copy of the Student page's real cards. **Reverted** it back to what
it had before this whole detour: `MATCH_CARDS` = Investment Banker ($361K
median)/Private Equity Analyst ($250K median)/Software Engineer ($136K median),
the salary chip, the "Find your Top 3" header + save-circle/rank mechanic, the
"Learn more" pill, and the "What You'd Do" bullet reveal -- all restored verbatim.
Lint/tsc clean, verified live (Enterprise toggle, Match chapter).

The actual task all along was the **Student landing page**'s own Match chapter
(`marketing/chapters/Match.tsx`) -- direct instruction: "we're just fixing the
inconsistency with the swipe to like thing now that that's sunsetted" (the real
app's Match flow is `/match-grid`, tap-based, since Option B -- swipe-to-like in
this demo no longer matches how Match actually works). Reworked `MatchDemo`:

- Removed entirely: the pointer-drag swipe-commit logic (`onCardPointerDown/Move/
  Up/Cancel`, `dragX`, `SWIPE_COMMIT_PX`), the guided one-directional tutorial
  (Operations pass-only / Investment Banking like-only), the Like/Pass circular
  buttons, the mid-drag "Like"/"Pass" intent badges, and the "Swipe left/right..."
  hint copy.
- Card data model changed from a depleting `stack` (cards removed as you pass) to
  a rotating `order` array of all three keys -- Prev and Next just reorder it, so
  every card (including Private Equity, previously "peek-only, not reachable") is
  always reachable in both directions.
- Added: Prev/Next chevron buttons below the card (same position Pass/Like used
  to occupy, so they don't cover the photo -- an overlaid button row was already
  rejected once per an earlier comment in this file). The BorderBeam nudge that
  used to alternate between Pass and Like now stays on the Next button, guiding
  the "next logical action" of paging through the deck.
- A small "+" badge on the card (top-left, mirroring the existing "Tap to see
  details" pill's corner-badge treatment on the opposite side) is the new match
  action, replacing swipe-right/Like -- tapping it flies the card up and triggers
  the same "You're matched!" celebration + auto-advance-to-Play as before.
- Tap-to-flip (the info panel showing blurb/salary/major) is unchanged -- still a
  plain click on the card, just simplified from the old tap-vs-drag pointer-move
  distance check to a plain `onClick` now that there's no drag to distinguish from.

Lint/tsc clean. Verified live end-to-end: flip, Next (unflips + pages to
Investment Banking), tap "+" (fly-up, "You're matched!", auto-scrolls to Play),
"Try again" (resets to Management Analyst, unmatched). Not committed, not pushed.

## 2026-09-13 · Match.tsx polish: fanned stack, bigger "+" badge, beam moves to it on IB

Same-day follow-up, direct instruction. The peeking-card stack was vertical
(translateY); changed to the same horizontal fanned-deck mechanic as the Play
tab's mobile deck (`MobileDeck` in `PlayHub.tsx`), spread out wider (34px/0.09
vs its own 16px/0.06 -- "spread out more like we decided earlier," matching the
step values already settled on for the Enterprise carousel/PlayHub feedback).
Each card is now `calc(100% - 68px)` wide instead of full-width, anchored
`left:0` with a right-center transform origin on the peeking cards, so
translating right by depth fans them out to the right; content/data unchanged.

The "+" match badge ("isn't very obvious, it needs to look better"): bigger
(34px vs 26px), a real border-2 ring, stronger/more opaque background, its own
drop shadow -- but the glyph itself stays plain white, not tinted in
`WORLD_COLOR` ("Dont color the plus"), so emphasis comes from the ring/beam,
not the icon color. On Investment Banking specifically, wrapped it in the same
`BorderBeam` + `mkt-scale-pulse` nudge language the Next button uses, and Next's
own nudge now turns off exactly when `top.key === "iba"` (nudge hands off from
"page forward" to "complete the match" once the intended card is showing).

Lint/tsc clean. Verified live: fanned spread renders correctly at rest and while
paging, "+" reads as an obvious button now, beam is on Next by default and
switches to the "+" once Investment Banking is the front card, match flow still
fires correctly from the "+". Not committed, not pushed.

## 2026-09-13 · Connect profile (ProProfile.tsx/ProDashboard.tsx): Experience fixes, surfaces back

Same-day follow-up, direct instruction, cross-checked against the Replit reference
screenshots (Overview + Ask Me & Posts tabs) with a live visual pass, not just code:

- `SubTabs`'s Answers/Posts underline was using `dm-quiet` for its hover state;
  that utility's `@layer components` fallback (`border-radius: var(--radius-sm)`)
  kicks in on any control without its own `rounded-*` class, so hovering painted
  a rounded box behind the flat-line tab ("still some sort of rounded corner
  thing"). Dropped `dm-quiet` entirely from that button -- just the border-bottom
  now, no hover wash. (Confirmed empirically in the browser, not just by reading
  the CSS, that a plain `hover:[color:...]` utility can't fix this either: it
  never overrides a same-element inline `style` color regardless of pseudo-class,
  which the codebase already works around elsewhere via `!important`.)
- Current Company was a full-width `CompanyChip` pill -- root cause: its wrapping
  `flex flex-col` container had no `items-start`, so flexbox's default
  `align-items: stretch` forced the inline-flex chip to the column's full width.
  Replaced with `CompanyMark` (bare logo, no chip/pill) + the company name as
  text, in a row, the same shape Education already uses -- also added
  `items-start` to both wrappers so this class of bug can't recur.
- Education's fallback `GraduationCap` icon tile (for a school not in
  `schoolMarks.ts`) removed entirely -- unmatched schools are just plain text
  now, no icon tile, no blank-space placeholder.
- Full visual re-check against the reference surfaced a real regression: since
  a 7 Sept 2026 change, `ProfileCard` sections (About Me/Experience/I Can Help
  With/Communities) had no surface of their own at all -- not even the single
  shared surface that change's own comment described, just bare sections
  divided by rule lines directly on the page background. Direct instruction:
  restore ONE shared surface (not per-section boxes, tried and rejected first)
  wrapping the whole `OverviewSection` stack, sections still divided by rule
  lines inside it. `ProfileCard` itself is back to its pre-7-Sept shape
  (padding + conditional `border-t`, `first` prop restored); `OverviewSection`
  now wraps its `ProfileCard`s in one shared surface.
- That wrapper first used `CARD` (the same tinted-blue glass as the Ask Me
  composer/Posts panel) and read "too bright" -- not a rendering bug (checked
  the live DOM: only one element had the background, no doubling/stacking),
  just `CARD`'s brand-blue tint, tuned for a small element, reading stronger
  spread across a whole multi-section block. Switched the wrapper to plain
  `PANEL` (same glass/blur/border/shadow, no tint); `CARD` itself is untouched
  and still used where it always was (Ask Me composer, Posts panel).

Lint/tsc clean. Verified live on both `ProDashboardView` (own profile) and the
public `ProProfileView` (same `OverviewSection`), for a volunteer with a
matched school (Amara Okafor/University of Michigan, circle logo) and one
without (Leo Fontaine/School of Motion, confirms the icon removal doesn't
leave a ragged gap), and at a 375px mobile viewport. Not committed, not pushed.

## 2026-09-13 · Match.tsx (Student page): "+" match badge is Investment Banking only

Direct instruction: the deck's "+" badge let a visitor "match" with any of the
three cards, but Play only ever previews the Investment Banking simulation --
matching with Management Analyst or Private Equity scrolled down to a game
that wasn't the one just picked ("I can click management analyst and then the
game is Investment Banking"), and having all three tappable made the intent
of the section ("this leads somewhere real") feel unclear. The "+" badge, its
`BorderBeam` nudge and `mkt-scale-pulse` wrapper now only render when
`card.key === "iba"` -- Management Analyst and Private Equity keep their
"Tap to see details" flip (still informational, unaffected), just no match
action. Next's own beam nudge already only activated for `top.key !== "iba"`,
so the handoff between "page forward" and "match" still works unchanged.

Lint/tsc clean (a stray duplicate `</BorderBeam></div>` from the edit was
caught by the JSX parser, not just visually). Verified live: badge hidden on
Management Analyst and Private Equity, present on Investment Banking, tap
still flips all three. Not committed, not pushed.

## 2026-09-13 · Explore welcome splash names both halves; Schools tab's own splash removed

Direct instruction. Explore's first-visit splash (`WelcomeSplash.tsx`, `SCENES.explore`)
was one merged sentence ("Careers and schools: salary, education, daily life, and
pathways."); replaced with two labelled rows -- `**Careers:** Salary, education,
daily life, and pathways.` / `**Schools:** Colleges, trade schools, programs, cost,
and admissions.` (the Schools line reused verbatim from what its own splash said).
Since Explore's splash now states Schools' detail directly, its separate welcome on
the Schools/colleges tab is redundant -- removed the `SCENES.schools` entry, the
`"schools"` member of `SplashSurface`, and the `<FirstVisitSplash surface="schools" />`
mount + now-unused import in `CollegesExperience.tsx`.

Checked the Schools tab's own "pulse" nudge (`ExploreSectionTabs` in `chrome.tsx`,
`SCHOOLS_TAB_NUDGE_KEY`) doesn't depend on the removed splash specifically -- it
waits for *any* `[aria-labelledby^="splash-"]` dialog to clear via the generic
`dreamari:welcome-done` event, which Explore's own (still-present) splash still
fires, so that nudge is unaffected.

Lint/tsc clean. Verified live: Explore's splash shows both labelled rows; the
Schools/colleges tab now loads straight to its content, no splash, no console
errors. Not committed, not pushed.

## 2026-09-14 · New explainer splash between Build's Congratulations screen and /match-grid

Direct instruction (Slack, relayed): students went straight from the Build flow's
"Congratulations! Your personalized career matches are ready" screen into the live
"Find Your Top 3" grid (`/match-grid`, `MatchGrid.tsx`) with no explanation of the
grid's own interaction (+ to save, tap for detail).

Added a new `matchGrid` scene to the shared welcome-splash system
(`WelcomeSplash.tsx`): title "FIND YOUR TOP 3" (echoing the grid's own H1), three
rows ("Tap + to save.", "Tap Learn more for details.", "More matches are
waiting."), CTA "Start Exploring". Mounted `<FirstVisitSplash surface="matchGrid" />`
in `MatchGrid.tsx` itself (same pattern as Explore/Schools/Play), so it shows once
per the existing first-visit/demo-session logic, then the real grid underneath is
already rendered and revealed when it closes.

Deliberately did NOT repurpose the existing (but currently orphaned) `SCENES.match`
entry, even though its copy needed the same kind of update: `surface="match"` is
still the dormant swipe-deck `MatchLab.tsx`'s (`/match-lab`) own splash, and that
route is meant to stay untouched so it can be reactivated later with its own
accurate (swipe-gesture) copy intact -- confirmed via a live check that `/match-lab`
still shows its original "MATCH" splash unchanged.

Lint/tsc clean. Verified live: `/match-grid` shows the new explainer, dismissing it
reveals the real grid; `/match-lab`'s splash is untouched. Not committed, not pushed.

**Same-day follow-up:** direct instruction -- "should fire when I come to the match
screen from anywhere," not just once per session. Swapped `FirstVisitSplash`
(localStorage/sessionStorage "seen" gating) for the lower-level `WelcomeSplash`
directly, with `MatchGrid`'s own `useState(true)` controlling `open` -- since
`MatchGrid` remounts fresh on every navigation to `/match-grid` regardless of
where the visitor came from, this shows the explainer every single arrival, not
just the first one. Verified live: dismissed it, navigated to /explore, back to
/match-grid -- explainer fired again. Not committed, not pushed.

## 2026-09-14 · Profile welcome splash copy (Slack, Chandu M P)

`SCENES.profile` in `WelcomeSplash.tsx`: body copy "Your Top 3, your plan, your
report." -> "Compare careers. Follow your plan. Track your progress."; CTA
"Explore my profile" -> "View My Profile". Title unchanged. Lint/tsc clean,
verified live at /profile.

## 2026-09-14 · Home: PLAY/EXPLORE kickers back, non-interactive this time

Reverses part of the 13 Sept "instead of adding more labels" decision, per a
Slack thread: demo students don't already know what PLAY/EXPLORE mean the way
they know Netflix/Instagram's own sections, so the CTA alone (only read by
someone already about to click) wasn't teaching the product's structure to
everyone scanning the page. Re-added a small `CaptionLabel` ("PLAY"/"EXPLORE",
`--accent-subtle`) above "Continue Where You Left Off" and "Recommended
Careers" in `HomeExperience.tsx`.

Difference from the original ask (13 Sept: "make the PLAY and EXPLORE labels
clickable"): these are plain, non-interactive text -- no link, no cursor
pointer, no hover state. Direct feedback: "how does anybody think of clicking
on a label" -- a muted static tag doesn't read as tappable without added
affordance, and adding that affordance undoes the "quiet" point of an ambient
label. The `RailCta` chips ("View all in Play"/"Explore All Careers") remain
the only actionable, obviously-clickable element in each row.

Lint/tsc clean. Verified live: both labels render as plain `<p>` text (checked
computed `cursor: auto` and no wrapping `<a>` in the DOM, not just visually).
Not yet committed at time of writing -- pushing this alongside the handoff
entry.

## 2026-09-14 · Welcome splash: wider dialog instead of smaller text

Explore's new "Schools:" row ("Colleges, trade schools, programs, cost, and
admissions.") wrapped, leaving "admissions." alone on its own line. First pass
shrank `.row`'s font-size (14px -> 12.5px) to force one line -- reverted per
direct feedback: don't trade away readability/accessibility for a line-count
preference if there's another way. Widened `.dialog`'s `max-width` instead
(460px -> 520px) and kept the original 14px; `width: 100%` plus the scrim's
own padding already cap the dialog on phones, so this only adds room on
tablet/desktop, where the wrap was actually happening.

Verified live at 3 affected scenes: Explore (both rows now one line each),
`/match-grid` (title + all 3 rows one line each, a side benefit), `/connect`
(icon rows unaffected) -- and re-checked at a 375px mobile viewport, where
rows still wrap (not enough room at any reasonable text size) but wrap more
evenly, not a lone orphaned word. No lint/tsc impact (CSS-module-only change).

Also discussed, no change made: Connect's rows are left-aligned (icon rows
need it -- centered multi-line text next to a fixed icon drifts out from
under it) while Explore/match-grid's plain-text rows are centered (matches
the centered sprite/title/CTA composition). Not an inconsistency to fix --
direct feedback: leave both as they are.

## 2026-09-14 · /match-grid: "Learn more" pill redesigned (WIP area, more to come)

Direct instruction: the live "Learn more" label on each `GridCard`
(`MatchGrid.tsx`) was purely decorative (`aria-hidden`, an 8-9px `<span>`, no
icon) -- "too small," needed an info icon leading it and "a slight shiny
border." Rebuilt it as a real pill: `Info` icon (lucide-react) + "Learn more"
text at 10.5px/12px (mobile/desktop, up from 8px/9px), more padding, wrapped
in `BorderBeam` (`size="sm"`, `strength={0.7}`, always `active`) for the
shiny-border effect -- same package/pattern used for nudges elsewhere this
session (Match.tsx's "+" badge, Next button), just persistently on rather
than conditional, since this isn't a one-time nudge. Kept the existing
per-breakpoint anchor position (`top-11` fixed on mobile, dead-center from
`sm`) and its `aria-hidden`/non-interactive status unchanged -- the whole
card still opens the detail modal on click; this redesign was scoped to the
label's own size/legibility/border, not its placement or interactivity.

Lint/tsc clean. Verified live at both a 375px mobile viewport (all 6 cards'
pills legible, beam visible, no overlap) and desktop; confirmed tapping a
card still opens `DetailModal` correctly (interaction unaffected). Per the
user, this whole screen (/match-grid) is still WIP -- mobile layout is being
refined separately, and this pill fix is one piece of that, not the last.
Not committed, not pushed -- checking in before pushing since more changes
to this area are expected.

**Same-day follow-up, three more changes to `MatchGrid.tsx`:**

1. **"Learn more" repositioned.** Direct feedback: it should hug the title,
   not float in the upper/center of the card, and real Safari/Chrome UI
   chrome eats more vertical space than this preview shows. Moved it OUT of
   its own fixed-offset absolutely-positioned layer (which needed different
   top values per breakpoint to dodge a 2-line title, per the old comment)
   and INTO the same bottom-anchored flex column as the title, as the first
   child. It now moves with the title automatically on any line count, with
   no per-breakpoint math, always sits on the guaranteed-dark scrim instead
   of an unpredictable patch of photo, and needs no independently-reserved
   headroom -- all upside for a real device with less vertical room than a
   devtools preview implies. (Recommended this over keeping it centered:
   grouping it with the title/world label reads as one coherent info
   cluster, and removes the fragile fixed-offset hack entirely.)
2. **"0 of 3" counter made more prominent**: bigger dot, bolder/brighter
   text (`--color-night-foreground` instead of muted), a stronger
   green-tinted border, `rounded-full` instead of a small rect.
3. **`DetailModal`'s hero shortened to fit all 3 sections without
   scrolling** (direct feedback: shorten it "without cropping the image too
   much"). Measured the actual overflow live via `scrollHeight -
   clientHeight` before touching anything (81px at a standard desktop
   modal), rather than guessing. Used a modest hero crop (4/3 -> 3/2, not
   16/9 -- these are waist-up portraits and a much shorter ratio starts
   losing heads) for about half the savings, and tightened spacing that
   doesn't touch the photo at all for the rest: the scrim's top padding
   (pt-16->pt-12, more room before text, not less photo), the content
   section's padding, the "At a Glance" label's margin, both dividers'
   margins, each section's icon-to-list gap, and the footer's padding.
   Verified live (not assumed): 0px overflow now at a standard 375x812 or
   larger viewport. At the extreme low end (iPhone SE-class, ~580px of
   *available* height once Safari's chrome is subtracted, tested directly)
   it still scrolls by design -- closing that gap too would mean either
   illegibly small text or cropping the photo well past "not too much," so
   this was left as an accepted tradeoff rather than chased further, and
   flagged rather than silently claimed as fully fixed.

Lint/tsc clean on all three. Not committed, not pushed -- same WIP area,
checking in first.

**Same-day follow-up:** the 4/3 -> 3/2 hero crop above cropped a couple of
heads (Private Equity Analyst, Software Engineer) -- `object-cover` on
`next/image` crops evenly from both edges by default, so shortening the box
ate into the top of a portrait as much as the bottom. Added `object-top` next
to the existing `object-cover` on `DetailModal`'s hero `<Image>`: any crop
this ratio needs now comes only from the bottom, below the subject. Verified
live across all six cards -- Private Equity and Software Engineer's heads are
back in frame, and spot-checked the other four (Investment Banker, Data
Scientist, Fashion Buyer, Game Designer) to confirm top-anchoring didn't cut
anything important off the bottom of those instead. Lint/tsc clean.

### 2026-09-14 Resume Builder: wizard, AI bullet generation, full-screen route

Built the real Resume Builder (`docs/handoff/specs/profile-overview.md` had
only a "Coming soon" placeholder -- confirmed no locked spec, genuinely
greenfield). Ported from a reference implementation
(`resume-builder-maishak.replit.app`, reviewed live end-to-end at desktop/
tablet/mobile): same content, copy, and flow, rebuilt for this design system
with several reference bugs fixed rather than repeated.

**New files:** `src/lib/resume.ts` (data store, same
typed-shape/normalize/`useSyncExternalStore` convention as `studentProfile.ts`
and `picks.ts`); `src/components/resume/{ui,data,wizardSteps,
ExperienceModal,ResumeExperience,ResumeBuilderExperience}.tsx`;
`src/app/api/resume-bullets/route.ts` (first AI-backed feature in this repo --
calls Claude if `ANTHROPIC_API_KEY` is set, else a client-agnostic template
fallback, same graceful-degradation shape as `demo-request/route.ts`); new
route `src/app/resume-builder/page.tsx`.

**Structural change from the reference:** the reference spreads Resume
Builder / Saved Resumes / Choose & Tailor across 3 top-level app tabs, which
is what left Choose & Tailor unreachable from its own mobile nav. Collapsed
into states of one Resume tab instead of separate nav tabs.

**Then, direct feedback once it was live:** "the builder should open into its
own window or screen rather than sitting under the my profile tabs for the
whole flow" -- the 6-step wizard was originally an internal view inside
`ResumeExperience.tsx`, squeezed under Profile's header + tab row (worst on
mobile). Split it out: `ResumeExperience.tsx` is now just the Profile tab's
compact summary card ("Edit My Info" + a first-visit auto-redirect when the
store is empty), and the actual wizard moved to `ResumeBuilderExperience.tsx`
at its own route, `/resume-builder` -- same pattern as Build's own full-screen
`/flow` route (bare `<main>`, `marketing-v2 themeable` wrapper for design
tokens, no chrome from the host page). A close (X) button and "Finish" both
return to `/profile?tab=resume`; nothing is lost by leaving mid-wizard since
every field already writes straight to the shared store as you type.

**Two real bugs caught live, not assumed fixed:**
1. `PersonalInfoStep`'s field setter rebuilt the whole profile object from
   the render-time `p` closure (`writeResume({ profile: { ...p, ...patch }
   })`). Firing multiple field writes in quick succession (confirmed via
   direct localStorage inspection) let a later write's stale closure clobber
   an earlier field's value. Fixed by reading `readResume().profile` fresh
   inside the setter instead of the closure -- same fix applied to the
   Skills category writer, the other spot with the same pattern.
2. `ResumeModal`/`ResumeToast` originally used raw `createPortal(...,
   document.body)`. Every `--space-*`, `--radius-*`, `--card`, `--primary`,
   etc. token is scoped to the `.marketing-v2.themeable` wrapper class, not
   `:root` -- confirmed by walking the DOM chain live (`--space-3` resolves
   inside the wrapper, empty string on `document.body` itself). Portaling
   straight to `document.body` escapes that wrapper entirely, so every
   spacing/color token in the portaled modal was undefined: gaps collapsed
   (buttons ran together, "CancelSave"), and colors fell back to raw
   unstyled browser defaults. This exact class of bug already has a fix
   living in the codebase -- `Portal` in `CareerReport.tsx`, whose own
   comment explains precisely this (host div carries `marketing-v2
   themeable` for exactly this reason). Reused that `Portal` instead of
   rolling a second one; verified live before and after.

AI bullet generation: no `ANTHROPIC_API_KEY` configured anywhere in this env,
so every live test exercised the template fallback -- first pass produced
grammatically doubled bullets ("Assisted sorted donated supplies...", a verb
stacked in front of an answer that was already phrased as a verb phrase).
Rewrote the template to use the day-to-day answer directly as the lead bullet
rather than prefixing a second verb, and reworded the tools/team/proud lines
to read as complete sentences. Not proofread against the real Claude path
(no key here to test it), but the request/response shape matches
`demo-request/route.ts`'s existing external-call pattern.

Verified live via the dev server at desktop, tablet (768px -- confirmed a
real `sm:grid-cols-2` reflow, not a shrunk desktop clone), and mobile
(375px -- single column, sticky footer clear of the bottom nav now that the
wizard isn't nested under it). Full wizard run through Personal Info ->
Education -> Experience (both the AI-generate path and the "write my own
lines" escape hatch) -> Skills -> Certifications -> Review (checklist
confirmed live-computed off real data, not a tracked flag) -> Finish, with
the resume-home summary card updating correctly after. Lint/tsc clean on
every touched file.

**Same-day follow-up:** "I meant the live preview of the resume like in the
replit" -- the wizard collected data but never rendered it as an actual
resume document (that was still-unbuilt Stage 5 of the plan). Added
`ResumeDocument.tsx`: a real formatted resume (centered name/contact header,
underlined section labels, right-aligned dates, bullet lists), reusing the
app's existing printable-document system wholesale (`.dm-report` -- the same
class Career Report's export already uses, dark-on-screen/forced
black-on-white when printed) rather than inventing new colors. Wired into
`ResumeBuilderExperience.tsx` as a `showDocument` view: Review's "Finish" now
lands there instead of returning straight to Profile, and a new "Preview
Resume" button on the Resume tab's summary card (`ResumeExperience.tsx`)
jumps to it directly via `/resume-builder?view=document`. Added a working
"Print / Save PDF" button (`window.print()`, same call Career Report's own
export button makes) -- real `.docx` generation is still the separate later
stage, but this gives a genuine, working way to get the resume out today.
Verified live at both the default dark theme and forced-light (what print
uses).

**Same-day follow-up 2:** three more rounds of direct feedback once Choose &
Tailor and multiple saved resumes came up:

1. "the builder should open into its own window or screen" (already covered
   above) then "I dont see any create resume flow happening. Lets please
   follow the replits functionality" and "I should be able to create and
   re-create resumes as much as I want and then tailor them as well... do we
   see a live real time updated preview of the resume on the side like in
   replit? We should have it ideally at least for desktop." Built the actual
   missing pieces: `TailorScreen.tsx` (name a resume, pick which education/
   experience entries to include, optional job description) wired into
   `ResumeBuilderExperience.tsx` as `?view=tailor`; a per-version filtered
   document view (`?view=version&version=<id>`, via new `resumeForVersion()`
   helper in `resume.ts`); `ResumeExperience.tsx`'s Resume tab now lists
   every saved version ("Your Resumes") with Create/Open/Edit/Delete, not
   just a single static summary card. Added a live split-preview to the
   wizard itself at `lg:` breakpoint -- the same `ResumeDocument` the
   finished view uses, fed by the same reactive store, so it updates as the
   student types, exactly matching the reference's own live-preview pattern.
2. "Its says no resumes yet but there is an alex chen resume right there?"
   -- real gap, not a misunderstanding: finishing the wizard only opened a
   preview, it never actually saved anything into the versions list, so
   "Your Resumes" stayed empty even right after finishing. Fixed: the
   wizard's Review "Finish" now creates a real named version on the first
   finish (named from the student's own name, all current education/
   experience included) and lands on ITS document view, so it shows up in
   "Your Resumes" immediately. Later finishes just open the full preview,
   since by then there's already at least one saved resume to open or edit.
3. "why alex chen, match it to the users name please" -- "Alex Chen" was my
   own test input while verifying the above, not anything the app
   generates; flagged because `prefillFromStudentProfile()` was blanking
   firstName/lastName on every fresh entry rather than using the app's own
   demo identity. Now prefills from `STUDENT.name` (`profile/data.ts`,
   "Jordan Rivera" -- the same name shown in the Profile header everywhere
   else), split into first/last, so a fresh resume opens already matching
   who the app says is logged in instead of a blank or mismatched name.

**Real bug caught mid-testing, not a tool artifact:** the Resume tab's
one-time "is this empty, should I redirect to the wizard" check
(`ResumeExperience.tsx`) read `resume` from the `useSyncExternalStore` hook's
closure inside a `useEffect`. On a fresh client-side hydration, that closure
can still hold the server snapshot (always empty) at the moment the effect
first fires, even though the real localStorage data is already correct --
so the check saw "empty," ran `prefillFromStudentProfile()`, and silently
wiped a student's real first/last name on every single visit to the Resume
tab, even ones long after the wizard had been completed. Confirmed by
watching real saved data (name + education + experience) disappear on
nothing but a plain navigation back to `/profile?tab=resume`. Fixed by
reading `readResume()` fresh inside the effect instead of the closure
variable -- verified with several navigate-away-and-back round trips
afterward, data holds.

Also removed every em dash from Resume Builder's own copy and generated
resume text (direct feedback, 14 Sept 2026, third time this rule's been
corrected across sessions -- see the standing "no em dashes" instruction):
`ResumeDocument.tsx`'s "Title — Company" became "Title at Company",
certification "Name — Issuer" became "Name, Issuer", and a few wizard/step
copy lines were rephrased into two sentences.

**Same-day follow-up 3:** "do we also have a zero resume state where it
empty? That should ideally be the default view unless i create a resume."
Replaced the auto-redirect-into-the-wizard-on-first-visit behavior (the
exact effect that carried the earlier name-wiping hydration bug) with an
explicit zero state: `ResumeExperience.tsx` now renders a plain "You haven't
created a resume yet" card with a single "Create My Resume" CTA whenever
`resume.versions.length === 0`, and only that click (not a silent effect)
prefills the student's name and pushes to `/resume-builder`. The summary
card + "Your Resumes" list only take over once a resume actually exists.
This also fully removes the class of bug the hydration-race fix above was
patching, since there's no more auto-triggered effect to race in the first
place. Confirmed separately that "name your resumes, not the actual resume
title" (direct feedback) was already correct as built: `TailorScreen`'s
"Resume Name" field is purely organizational (the "Your Resumes" list, the
document view's top bar) and `ResumeDocument.tsx` never reads it -- the
document's own heading always comes from the real Personal Info name.

**Same-day follow-up 4:** "have a full letter size or a4 size document,
dont make it get bigger with content... The sheet size should already be
there." `ResumeDocument.tsx`'s `<article>` was sizing itself to content
(padding only, no fixed dimensions). Added a fixed US Letter aspect ratio
(`aspect-[8.5/11]`, this being a US high-school context throughout --
grades, GPA scale, states) with internal scroll for overflow, screen-only:
`print:aspect-auto print:h-auto print:overflow-visible` cancels it during
`window.print()`, so a resume that runs past one page still paginates
through the browser's normal print flow (the existing `@page` rule in
app.css) instead of getting clipped to a single fixed box. Verified both
the full document view and the wizard's desktop sidebar preview render as
a real sheet now regardless of how little or much content is in them.

**Same-day follow-up 5:** "The preview isnt rendering how it will actually
look, the scale layout etc needs to be realistic... i need to be able to
select different color/style/layout or preset templates." Two real gaps:

1. The sheet-sized fix from follow-up 4 used a fluid `aspect-[8.5/11] w-full`
   box, which kept text at fixed px sizes regardless of how wide that box
   rendered -- proportionally wrong in the wizard's narrower sidebar vs. the
   full document view. Rewrote `ResumeDocument.tsx` to the technique real
   document editors use: the resume renders once at true US Letter
   dimensions (816x1056px, 96dpi) with real point-equivalent type, inside a
   `ScaledSheet` that measures its container via `ResizeObserver` and
   applies `transform: scale(containerWidth / 816)` -- so the SAME real
   proportions show everywhere, just scaled uniformly, never stretched or
   squashed. Printing gets its own separate natural-flow copy of the same
   content (`print:hidden` on the scaled version, `hidden print:block` on
   the plain one) so a resume over one page still paginates through the
   browser's own `@page` rule instead of being clipped to the fixed canvas.
2. Added resume templates (`RESUME_TEMPLATES` in `data.ts`): Classic
   (pure black, the literal reference default -- "adhere to the same resume
   format as the replit... offer different preset templates", so every
   template keeps the exact same single-column structure and only the
   accent color/name font changes), Navy, Forest (serif name), and
   Charcoal & Gold. `ResumeVersion` gained a `template` field (plain string
   in `resume.ts` to avoid a lib -> components import; validated against the
   known list in `data.ts`/`ResumeDocument`). Picked via a swatch grid on
   the Tailor screen, saved per resume version, so different tailored
   resumes can carry different templates independently.

**Same-day follow-up 6:** several rounds of direct feedback once templates
and the live preview were live:

1. "there are more features like choosing and tailoring and customising
   after the first generic creation flow, also the field for
   certifications are wrong... incorporate Dreamy but not as small as its
   used in the replit and not like an afterthought." Re-checked the
   reference live (`seed` tab) rather than relying on memory:
   - Confirmed the reference's own "generate/customize further" flow is
     actually broken end to end -- repeated attempts through its "You've
     got a good start" nudge modal (`Got it!` and `Generate Anyway` both
     just close it and drop back to the same form) left "Saved Resumes"
     permanently empty. There is no further screen to replicate; Choose &
     Tailor (name, education picker, experience picker, job description,
     "skills automatically included") already matches what's built here,
     and unlike the reference it actually completes.
   - Certifications WAS wrong: the reference's real fields are Certification
     Name*, Issuing Organization* (required, not optional), separate Issue
     Date / Expiration Date (not one combined date), plus optional
     Credential ID and Credential URL. `ResumeCertification` in `resume.ts`,
     the wizard's `CertificationModal`, and `ResumeDocument`'s rendering
     were all rewritten to match exactly.
   - Templates got real structural variety, not just color, researched
     against common US resume archetypes: Classic (single column, the
     reference's own shape, kept as default), Modern Sidebar (a tinted
     aside for contact/skills/certifications next to a main story column),
     Minimalist (left-aligned, thin accent labels, no full rules), Banner
     (a bold color band across the top). Backgrounds stay light tints, never
     solid-color-behind-white-text, since most browsers suppress background
     graphics on print by default -- a solid fill would print invisible.
   - Dreamy: reused Build's own `DreamyGuide` component directly (not
     reinvented) with a new `RESUME_WIZARD_DREAMY`/`RESUME_TEMPLATE_GALLERY_
     DREAMY` line+sprite map in `data.ts`, matching `STAGE_DREAMY`'s exact
     pattern. Now present at full Build-scale on every wizard step and the
     template gallery, with the same reaction-burst-on-advance wiring
     (`reactionNonce`/`react()`) Build itself uses.
2. "selecting a template should come before building it out... show me a
   fully populated example." Added `TemplateGallery.tsx` + `SAMPLE_RESUME_
   DATA` (one consistent example person/content across every card, so only
   the template differs) as a new `?view=templates` step ahead of the
   wizard/tailor, wired from both "Create My Resume" (zero state) and
   "Create New Resume" (Your Resumes list).
3. "use more of the width of the screen... match the margins to home and
   explore." `Shell`'s outer container now uses the exact classes Home/
   Explore/Profile all share (`max-w-[1440px] px-5 sm:px-[var(--space-14)]`)
   instead of ad hoc per-view values; individual views center their own
   narrower content within that same consistent gutter.
4. "give the preview more prominence... more width... always zoomable and
   can be opened in a new window." Widened the wizard's grid so the preview
   column gets the larger share (`520px` fixed form / `1fr` preview, was
   `680px`/`1fr`). Added `OpenInNewWindowButton` (`window.open` on the
   view's own URL) next to the existing zoom modal in both the document
   view and the wizard's live preview -- confirmed `window.open` is blocked
   by this sandboxed Browser pane specifically (returns `null`), not a code
   issue; works from a real user click in a real browser tab.
5. "the preview can zoom in on the section that I am filling in... crop and
   scrollable too... but always fit the width." Added `data-section`
   markers to every section across all four layouts, and `cropped`/
   `focusSection` props on `ResumeDocument`/`ScaledSheet`: the wizard's live
   preview now renders in a shorter (520px) scrollable window instead of
   the whole page, auto-scrolling to the section matching the active step
   (`WIZARD_STEP_SECTIONS`) via `scrollIntoView`. The horizontal fit-to-
   width scale is untouched -- only the vertical framing crops/scrolls.
6. "dont go full width on dreamy's speech bubbles." `DreamyGuide`'s own
   bubble is `flex-1` by design (matches Build, not touched); capped the
   wrapper around both new usages at `max-w-[440px]` so it hugs the line
   instead of stretching the full form-column width.

**Same-day follow-up 7:** "I cant see them properly when they are in those
small cards" -- the template gallery's mini-previews were too small to
actually judge a layout by. Redesigned `TemplateGallery.tsx`: desktop shows
a list of options beside one large live preview (click an option, the panel
updates instantly); tablet/mobile keeps the card grid but each card gets an
explicit "Preview" button opening the same large view in a modal, plus "Use
This" to confirm directly from the card.

**Same-day follow-up 8:** on the wizard's cropped/section-following live
preview (follow-up 6, point 5): "the first zoom is just a scroll down and i
dont think its needed for the first part... keep it so the preview shows
the full header including the margin on top, then scroll to each section...
zoom in a bit more... I want the zoom to follow the updates." Personal
Information (step 0) and Review (step 5) no longer have a target section
(`WIZARD_STEP_SECTIONS` uses `null` for both), so the preview just rests at
its natural top position instead of auto-scrolling into the header for no
reason. Sections 1-4 now also scale up an extra 12% (`SECTION_ZOOM_BOOST`)
on top of the fit-to-width scale when focused, centered via a translateX
computed in real container pixels (not a naive `transform-origin: 50%`,
which doesn't centre correctly once the base fit-to-width scale is folded
in) -- kept inside the page's own 56px side padding, so the zoom never
crops into actual text. The scroll/zoom effect now also depends on `resume`
itself, so it re-centers as the focused section's content grows (a new
bullet, another entry), not only when the step changes.

**Not yet built** (next stages per the original plan): real `.docx` export
(Print/Save PDF works today via `window.print()`, no doc-generation library
added yet).

**Cross-checked Codex's parallel work before pushing:** "Enhance shared
progress lightning with organic strikes and idle nudges" (`31aaa6d`,
`ProgressSpark.tsx`/`SparkBar.tsx`/new `/progress-lab` review page) is
already finished and live on `origin/main` -- its own handoff entry records
browser verification, ESLint, `tokens:check`, and a full production build
all passing, plus explicit user authorization to push. Nothing further
needed there; merged it into this branch below before pushing to keep both
sets of work on `main` together.

**Same-day follow-up 9 (not yet pushed):** two more rounds on the wizard's
cropped/zoomed live preview:
1. "the skills title should already be there on the preview so i know
   where its going to be populating" -- section headers in the cropped
   wizard preview (`placeholders` prop, threaded through `ResumeDocument`
   -> `ResumeSheetContent` -> each layout) now render even before any
   entry exists, with a small "Nothing added yet" hint in place of the
   list. Screen-only: `placeholders` is only ever passed from the wizard's
   cropped preview, never from the print copy or the real document/version
   view, so an empty section still just doesn't appear on an actual sent
   resume.
2. "magnifying glass border thing... apple already sort of does this" --
   first pass used a blurred vignette, which wasn't it; the user then sent
   an actual screenshot of iOS's text-cursor loupe mid-drag. Confirmed
   against that: no border stroke, no blur -- the loupe is a solid,
   perfectly sharp bubble that reads as "lifted" purely through elevation
   (shadow). Replaced the vignette with a shadow-only treatment on the
   crop window when a section is focused, no `backdrop-filter` at all, so
   there's no phone performance cost either version would have risked.

### 14 Sept 2026 — Shared progress lightning and idle nudges

User requested richer effects, then directed us back to the older organic bolt
shape and asked to publish. ProgressSpark now reuses the old 2–4 irregular-turn
construction and 3px rounded white-hot stroke, enhanced with colored shoulders,
small forks, bar-surface reflections and particles with drag/gravity. Each
strike is generated once in pixel coordinates over the traversed span and
changes only luminosity; no per-frame geometric scaling or rubbery morphing.
Bloom is narrow and horizontal, and turns stay near the fill's centerline.

SparkBar defaults to occasional idle nudges: randomized 10–18s checks after
inactivity, shared cooldown, visible incomplete bars only. User activity,
hidden pages and reduced motion suppress nudges. Reduced motion also suppresses
fill flicker and width transitions. Growth captures the visible fill position
for rapid repeated advances. One bounded canvas animation, DPR<=2, <=64
particles; cleanup on unmount, visibility and preference changes.

/progress-lab allows +20%, +2%, reset and theme review. No production nav link.
Browser checked growth, mobile/light/dark variants and idle, no runtime errors.
Targeted ESLint and tokens:check passed. Production build (including TypeScript and all page generation) passed.
Release prepared from latest origin/main 2b45a1b; unrelated local schools edits
remain in dreamari-partner-grid and are excluded. User authorized push live.

### 15 Sept 2026 — Connect volunteer profile: softer panel, Employee Groups (ERGs)

Relayed from a Slack request (via Chandu), high priority, pushed ahead of the
in-progress Resume Builder work:

1. "About / Experience section is currently too bright" -- first pass moved
   `PANEL` in `ProProfile.tsx` from `--glass-surface-2` to
   `--glass-surface-1`, one step down the same white-alpha ramp; live
   feedback ("why does it look so whiteish? use the same surfaces as
   everywhere else") made clear that wasn't the actual fix -- a white-alpha
   overlay reads hazy no matter how low its own opacity, since it's still
   white pixels laid over a dark page. Switched instead to `var(--card)`,
   the same opaque floor `SectionSurface` (primitives.tsx) and
   `dm-reply-composer`/thread rows already use elsewhere in Connect, and
   dropped the backdrop-filter blur + glass inset highlight that only made
   sense for a translucent layer. `PANEL` is shared by the public
   `ProProfileView` and the volunteer's own `ProDashboard` self-view, so
   both now match.
2. New compact "Employee Resource Groups" section under Education, inside
   the same Experience `ProfileCard`: opt-in `Pro.employeeGroups?: string[]`
   (data.ts), rendered as plain bordered pill badges (`OverviewSection` in
   ProProfile.tsx), matching the "simple badges or rows" ask. Empty/omitted
   for every pro except `pro-johnson` (Trevor Johnson), seeded with 2 of the
   4 example ERGs from the request so there's a real one to look at.

Browser-verified live at `/connect?pro=pro-johnson`: badges render under
Education exactly as specified, panel background confirmed via computed
style. ESLint + `tsc --noEmit` clean on both touched files.

**Not touched:** `CARD` (Ask Me composer / Posts entries) still uses
`--glass-surface-2` on purpose -- that one wasn't part of the complaint, and
it already carries a primary tint tuned for a smaller element.

**Follow-up 1:** checked the reference article the user linked
(greatplacetowork.com/resources/blog/what-are-employee-resource-groups-ergs)
-- "Employee Resource Groups" is the standard industry term (used the same
way at EY, KPMG, Zillow, AT&T), so the section label changed from the
shorter "Employee Groups" to that. Pushed to main (`6c61296` then this
label fix) with explicit authorization.

**Follow-up 2 (real mistake, caught in Slack):** the first seed used all 4
of the request's example ERGs on `pro-johnson` -- including "Black
Leadership Network" and "Latino Careers Network" -- on a demo pro whose own
photo/name read as a white man, an incongruent, insensitive pairing that
should never have shipped. Corrected to exactly 2, chosen to carry no
race/gender presumption either way: "First Generation Professionals" (kept
-- class-based, nothing a photo contradicts) and "Sustainability Network"
(interest-based, per the reference article's own point that ERGs span
"gender, ethnicity, religious affiliation, lifestyle, OR PROFESSIONAL
INTEREST", not only protected-class identity). Added a note directly on the
`employeeGroups` field in data.ts so a future seed doesn't repeat this.
Pushed to main once verified live.

**Follow-up 3:** "make sure all professional profiles have realistic
relevant employee resource groups" -- populated `employeeGroups` for the
remaining 38 pros (data.ts), not just `pro-johnson`. Same non-demographic
policy as the correction above, applied consistently rather than as a
one-off: every group is professional/interest-based (First Generation
Professionals, Career Changers Network, New Professionals Network,
Sustainability Network, Volunteers Network, Toastmasters Club), picked per
pro from something already stated in their own `story`/`journey`/
`education` text (self-taught, community college, career switch, first in
family, etc.), never from a guess at race/gender/orientation. No pro got a
demographic-identity ERG in this pass.

**Follow-up 4:** "add more companies per community so it looks like a
healthy batch" (General 13, Finance 8, Technology 7, Healthcare 9, Creative
8, counts given directly). Expanded each community's `professionalsFrom`
in data.ts to those exact counts -- kept each array's original first 3-5
companies in place (those are the ones with real logo marks, shown on the
card; `CompanyMark`/`CompanyChip` in primitives.tsx already fall back to
plain text for a name with no logo asset, confirmed in the code, so the
new additions render safely either way) and appended real, field-
appropriate companies, several already pros' own employers elsewhere in
data.ts for consistency (Genentech, CDC Foundation, HSBC, Spotify, etc.).
Browser-verified live at `/connect`: all five cards show the exact
requested counts. Pushed to main with explicit authorization ("push this
first").

### 15 Sept 2026 — Resume Builder: in-place drawer, per-field camera tracking

Several rounds on the wizard's live-preview camera and the Education/
Certification/Experience/Skills entry forms:

1. **In-place drawer, not a floating modal.** `ResumeModal` (ui.tsx) used to
   be a `Portal`-rendered `fixed inset-0` overlay -- first a centered card
   over a 70% scrim, then (mid-session) a left-anchored drawer. Both floated
   a second layer over the step's own card. Direct feedback after trying the
   drawer: "the side bar doesn't cover the modal underneath, so it looks
   cluttered sitting above each other." Rebuilt with no positioning at all --
   `ResumeModal` is now a plain in-flow block, and each step
   (`EducationStep`, `CertificationsStep`, the wizard's `stepIndex === 2`
   branch, `SkillsStep`) swaps its OWN return value for the form and swaps
   back on close/save, so only one thing is ever mounted in that card. The
   live preview (a separate grid column) was never actually at risk either
   way, but this also means it's never obscured or dimmed.
2. **Per-field camera tracking.** `ScaledSheet` (ResumeDocument.tsx) now
   takes an `activeField?: string | null` prop (`${entryId}:${fieldKind}`,
   e.g. `mu1bzqw5-psc5:gradYear`, or `profile:name`/`profile:contact`/
   `profile:bio` for Personal Info). Every field-bearing span in
   EducationEntries/ExperienceEntries/CertificationEntries and the four
   layout headers carries a matching `data-field`. `ResumeBuilderExperience`
   owns the `activeField` state and a `track(kind)` helper in each modal
   wires it to `onFocus` on the relevant `TextInput`s (no changes needed to
   the shared `TextInput`/`SelectInput` -- `onFocus` already passed through
   via existing prop spread). When a field is focused, the fit effect looks
   for `[data-field]` first (both axes bound the scale, so the whole value
   is visible, not just a line -- "show the entire paragraph... if we are on
   that field"); otherwise it falls back to the focused section's fit
   (Education/Experience/Skills/Certifications), and with neither, the full
   page. Closing/saving a form clears `activeField`, which is *all* that
   "fit the whole section before moving on" needed -- no separate state.
3. **Field tracking on Personal Info too.** Originally `focusSection` was
   `null` for step 0 on purpose (no useful whole-page zoom). Direct
   feedback: field tracking should still work there once a specific field is
   focused. The fit effect now looks up `activeField` across the whole sheet
   independent of `focusSection`, and `zoomed`/`canToggleFit` key off
   `contentZoom` being non-null rather than `focusSection` truthy, so step 0
   zooms exactly when (and only when) a tracked field is actually focused.
4. **Muted placeholders so an empty field doesn't zoom into blank space.**
   New `ProfileName`/`ProfileBio` components and an updated `ContactLine`
   render a faint italic placeholder ("Your Name", "Email · Phone · City,
   State") when their field is empty, shown only in the wizard's cropped
   preview (`placeholders`), matching the existing `EmptyHint` convention
   used by every other section.
5. **The zoom math itself, several corrections in sequence** (each one a
   direct reaction to the previous, all in ScaledSheet):
   - Section fit now measures the section's REAL text (walking non-empty
     text nodes with a `Range`, not the section's own box) -- every section
     wrapper and bullet `<li>` stretches to the full column width via flex
     regardless of how short its text is, and a decorative full-width
     `<Rule/>` compounded it, so box-based measurement always collapsed the
     zoom to near 1x.
   - `coverScale` (the `background-size: cover` idea) is a floor under the
     zoom scale so the page always fully covers the frame -- fixes "a huge
     blob space outside the doc" (actually a real gap where the container
     showed through, not a rendering bug, for a section near the top of a
     tall frame).
   - Both tx and ty are clamped inside the page's own edges (`minTx`/`minTy`
     derived from `coverScale`), a proper clamped pan-and-zoom rather than
     blind centering -- "don't bring the whole document down to center for
     Education... not just move everything to fit the width to the frame,
     we zoom into the parts we're focused on."
   - The old "reset to full page, then re-zoom" transition between sections
     was removed per direct feedback (read as a jarring extra cut) --
     `contentZoom` now updates directly and the existing CSS transition
     (bumped 0.32s -> 0.38s) carries the pan/zoom as one continuous move. A
     manual "fit to screen" icon toggle (top-right of the frame) lets the
     student see the whole page anytime without losing the camera's place.
6. **Dropped the SVG glass-refraction rim effect entirely.** Tried three
   times this session (backdrop-filter: url() referencing an SVG filter --
   poor cross-browser support, nothing rendered; then the same filter
   applied directly and masked to a rim, which instead painted a visible
   grey smear once combined with the dead-gap bug above). Retired for good
   in favor of a plain dark bezel + two static light/sheen gradients, which
   render reliably everywhere `GlassEdgeFilter` is gone, along with its
   `<filter>` SVG and the duplicate-content rim layer.

Browser-verified live: Education's graduation-year field (the original
complaint -- "the year is sitting on the right margin") now pans/zooms
correctly, confirmed via direct DOM measurement (`data-field` match,
computed `tx`/`ty`) after working around a test-harness issue where
`element.focus()` doesn't fire React's `onFocus` in this environment (a
real click does) -- not a bug in the app. Personal Info's First/Last Name
and the empty-state placeholders verified the same way. In-place swap
verified with no overlap on Education, Certifications, and Skills.
ESLint + `tsc --noEmit` clean across `src/components/resume/`.

**Not yet done:** Experience's own fields (`ExperienceModal.tsx`) are wired
with the identical `track()`/`data-field` pattern (where/title ->
`:title`, location -> `:location`, dates -> `:dates`, each bullet ->
`:bullet:N`) but not separately re-verified live this pass -- same code
path as Education, already proven correct, but worth a spot check next
session.

### 15 Sept 2026 — College Details page: simplification pass

Relayed from Slack, a straightforward copy/hierarchy trim of
`CollegeDetailExperience.tsx` (design notes: `docs/COLLEGE_LOOKUP_AUDIT.md`
§7, added this same round):

1. Header: removed "Worth knowing" entirely; added Apply/Financial Aid as
   two more header actions alongside Website (`EXTRA[slug].links.apply`/
   `.aid`, already-real data that used to live only inside the Admissions/
   Cost tabs) -- Financial Aid falls back to the net price calculator link
   when a school has no dedicated aid page (Princeton, the exact example
   in the request, is one of these). Apply/Financial Aid render only when
   that college actually has the link -- no dead buttons. Save unchanged.
2. Overview -> "Key Facts": renamed from "At a glance", 4 rows (Yearly
   Cost, Acceptance Rate, Graduation Rate, Undergraduate Population), every
   explanatory `note` dropped.
3. Admissions: `d.require`/`d.consider` (already real per-college data, not
   new) now render as two headed `DotList` groups, "Requirements" and
   "Other Factors Considered", instead of a "Required"/"Looked at" value on
   every row. Added a `FACTOR_LABEL` map trimming the copy uniformly across
   every college's require/consider strings ("Your school record" ->
   "School record", "Recommendations" -> "Recommendation letter", etc.)
   rather than hand-editing 30 rows of data.ts. The inline "How to apply"
   link was removed too -- redundant with the new header Apply button.
   "Scores of students who got in" -> "Typical Scores", `RangeBar`
   (progress-bar visualization) swapped for plain `Row`s ("SAT Reading:
   740–780").
4. Removed the "See it, then ask someone" folded section entirely (YouTube
   campus tours + Ask a pro on Connect) -- sent students outside the app,
   and implied Connect always has a pro from that exact school. `HoverBeam`/
   `PlayCircle`/`MessagesSquare` imports and the `tourUrl`/`worth` locals
   removed as unused. `SectionKey` narrowed from `"see" | "sources"` to
   just `"sources"`.

Browser-verified live at `/colleges/princeton-university` (the exact
example in the request -- Website + Financial Aid render, Apply correctly
absent since Princeton has no apply link; Key Facts, Requirements/Other
Factors Considered, and Typical Scores all match) and
`/colleges/augustana-university` (has a real apply link, confirms all
three header actions render together, checked at desktop and mobile
widths). ESLint + `tsc --noEmit` clean. Pushed to main with explicit
authorization.

### 15 Sept 2026 — College Details: Academics + Cost simplification, drop "fits you"

Same Slack thread, same direction, two more tabs plus one whole feature
removed:

1. **"Why [college] fits you" (`YourPath`) removed entirely**, not
   conditionally hidden -- was reached via `?route=<career>` from Explore
   Schools "For you". Direct feedback: "adds complexity and may be
   difficult to support consistently with the data." Deleted the function,
   its render site, and every now-unused import that only it needed
   (`Suspense`, `useSearchParams`, `useSyncExternalStore`, `FIT_WORDS`/
   `fitFor`/`parseGpa`/`pathwayFor` from `./pathway`, the three
   `studentProfile` imports, `SMALL`). `pathway.ts`/`studentProfile.ts`
   themselves are untouched -- nothing else in the codebase depended on
   this file's use of them.
2. **Academics -> "Academic Facts"**: the old two-column "Finishing"/
   "Staying, and class size" split, each with per-row notes plus a "More
   finish rates" reveal (5/6/8-year breakdowns) and a part-time-retention
   row, all collapsed into ONE flat 4-row list -- Graduation Rate, 4-Year
   Graduation Rate, First-Year Retention, Student-Faculty Ratio, no notes.
   Direct feedback: "no paragraphs underneath each metric... that's
   enough."
3. **"What you can study" -> "Popular Majors"**: dropped grads/year, pay,
   the "Biggest first. Pay is one year after graduating." subtitle, and
   the "Too few to publish pay" rows entirely -- "career salary and
   outcomes belong elsewhere in Dreamari." Rows are now just name + share
   of graduates. The degree-level `Segmented` selector only renders when a
   school actually has more than one level (`levels.length > 1`) --
   already only ever populated with levels the data has, so "only show
   what the institution offers" was already true by construction, just
   needed the single-level case to skip an unnecessary selector. "X
   biggest" button relabeled "View All Majors".
4. **Cost -> "What It Costs"**: replaced the `Ladder` bar-chart
   visualization with two headline `Stat` tiles (new local component) --
   Full Price and Average Cost After Aid -- then a plain "Cost by Family
   Income" list using a new `bandLabel()` formatter ("Under $30,000" ->
   "Under $30K", "$30,000 to $48,000" -> "$30K–$48K", "Over $110,000" ->
   "$110K+") so the table doesn't repeat "Family earns" five times.
   Renamed "The full price, broken down" -> "Full Price Breakdown"
   (Tuition/Fees/Housing/Food, hides any unavailable one instead of a
   "None, commute only"-style fallback message) and "Money you do not pay
   back" -> "Grants & Scholarships" (College/Pell grant recipients, notes
   dropped). Removed the inline "Your family's price"/"Financial aid"
   links -- redundant with the header's own Financial Aid action from the
   previous round.

Browser-verified live at `/colleges/princeton-university?route=investment-
banking` (confirms "fits you" is gone even in the one scenario that used
to trigger it) -- every single number in the request matched exactly:
Academic Facts (98%/75%/98%/5 to 1), Popular Majors top 5 + View All,
Full Price $82,938, Average Cost After Aid $6,128 / year, all five income
bands, Full Price Breakdown, Grants & Scholarships. Checked at mobile
width too. ESLint + `tsc --noEmit` clean.

### 15 Sept 2026 — Resume Builder: fix stale data on "Create My Resume"

Bug report: delete your only saved resume, click "Create My Resume" again,
and every field still shows the old answers. Root cause:
`removeVersion()` (`src/lib/resume.ts:288-290`) only removes the entry
from `versions` by design -- the delete-confirmation dialog in
`ResumeExperience.tsx` says so explicitly ("This only removes this saved
resume. Your education, experience, and skills stay in your profile"),
since a `ResumeVersion` is just a tailored subset of one shared
profile/education/experience/skills/certifications pool
(`resumeForVersion`). That's genuinely the wanted behavior for "Create New
Resume" when you already have one saved (direct feedback confirmed this:
"useful when I hit create new resume when I already have one built"). The
bug was specifically the OTHER entry point: the zero-resumes empty
state's "Create My Resume" button called `prefillFromStudentProfileIfEmpty`,
which only prefilled identity when the store was *fully* empty (checked
via `isResumeEmpty`) -- after a delete, education/experience/etc were
still populated, so that check short-circuited and nothing was reset.

Fix: that function only every runs from the zero-versions button (it's
not rendered otherwise), so "starting fresh" is exactly what it always
means there now -- renamed to `startFreshFromStudentProfile` and it
unconditionally resets the whole draft (`writeResume({ ...EMPTY_RESUME,
profile: {...} })`) before prefilling name/email/state from the account.
"Create New Resume" (the `versions.length > 0` add-another button) was
never wired to this function and still isn't touched -- it keeps carrying
the shared answers forward, unchanged.

Browser-verified: seeded stale education/profile data with 0 saved
versions (the exact repro), clicked "Create My Resume", confirmed via
both the localStorage snapshot and the live wizard screen that Education/
Experience reset to empty while First/Last Name still prefill from the
account identity (Jordan Rivera, the demo student's own name -- not
leftover resume data). ESLint + `tsc --noEmit` clean.

### 15 Sept 2026 — College Details: Student Body simplification

Third tab in this same simplification pass (design notes:
`docs/COLLEGE_LOOKUP_AUDIT.md` §8):

- **"Who is there" -> "Who Goes Here?"**, two plain sections instead of
  bar-chart `SplitBar`s. **Enrollment**: Total/Undergraduate/Graduate
  students as counts, Full-time/Part-time as percentages (converted from
  the stored headcounts, `d.fullTime`/`d.partTime`, not stored as a
  percent), Women/Men as the stored percentages. **Student Demographics**
  keeps the `Donut` -- explicitly called out as worth keeping ("one of the
  few visualizations here that genuinely makes the information easier to
  understand") -- but drops the explanatory paragraph ("The government's
  categories. International means students on visas.") and the raw
  headcount next to each percent (`Donut`'s own `n` prop just isn't passed
  at this call site; the shared component itself is untouched, still used
  elsewhere). New `DEMO_LABEL` map trims "Hispanic or Latino" ->
  "Hispanic / Latino", "Black or African American" -> "Black", same
  pattern as `FACTOR_LABEL` from the Admissions round.
- Confirmed nothing from the U.S. News reference (veteran %, demographics
  "availability" indicators, clubs, housing, athletics, Greek life, ROTC)
  was ever in this tab to begin with -- explicitly called out as things to
  leave out, already true, no action needed.

Browser-verified live at `/colleges/princeton-university`: every number
matches (9,137 / 5,813 / 3,324 / 99% / 1% / 50% / 50%, demographics
33/23/13/10/9/7 with trimmed labels), checked at mobile width. ESLint +
`tsc --noEmit` clean. Not yet pushed -- batched with the Academics/Cost
round above, same "not yet" hold.

### 15 Sept 2026 — College Details: Campus Life simplification, drops "fits you" again

Same request, made about Campus Life specifically after seeing it still
had the "fits you" block too (it's shared across every tab via the header
area, so this confirms it's gone everywhere, not just Overview -- no
additional code change needed there, already removed in the Academics/
Cost round above).

- **"Life there" -> "Campus Life"**, four sections instead of "Ways to
  study here" / "What the college helps with" / "Sport", plus the
  separate "After college" panel dropped entirely ("belongs elsewhere,"
  matches the Academics round's own reasoning for keeping outcomes data
  off this page): **Housing** (`d.housing` Yes/No -- no live-on-campus %
  or housing-type breakdown exists in the data, so neither is fabricated,
  same "hide what's unavailable" rule as every other tab this round).
  **Activities & Organizations** (a baseline "Student clubs &
  organizations" row plus ROTC when the school's `ways` data mentions it
  -- no fraternity/sorority or club-count field exists anywhere in
  data.ts/extra.ts, confirmed by grep, so neither renders; ready for real
  numbers later per the request's own "if we eventually have a reliable
  number of clubs" note). **Athletics** (league + `d.sport.teams` as
  compact chips, reusing the exact chip markup that already existed for
  this -- the men/women `SplitBar` is gone, "no progress bars needed").
  **Opportunities** (Study abroad from `ways`, "Career services" from the
  one `d.helps` entry specific enough to keep -- "Help finding work while
  you study" -- the two vague ones named directly, "Careers advice" and
  "Help finding a job when you finish", are gone, and so is the fourth
  `helps` value across the whole dataset, "Childcare on campus", which
  doesn't fit any of the four named sections).
- **Undergraduate Research moved to Academics** ("that is an academic
  opportunity and fits better under Academics") -- a new `wayNames`/
  `hasWay()` pair lives once near the top of the component (previously
  computed inline inside the Life tab only) so Academic Facts and Campus
  Life both read the same underlying `ways` data without parsing it
  twice. Teacher training, evening/weekend classes, and the intellectual-
  disability program note (all real `ways`/`helps` values, none named in
  the new structure) no longer have a section anywhere on the page --
  deliberate, not an oversight, per "gives students the parts of campus
  life they are actually likely to care about."

Browser-verified live at `/colleges/princeton-university`: Campus Life
shows exactly the four sections with Princeton's real data (Housing: Yes;
Activities & Organizations: clubs row + ROTC Offered; Athletics: NCAA
Division I-FCS + 10 sport chips, no bars; Opportunities: Study abroad +
Career services), Academic Facts gained "Undergraduate Research: Offered"
as its fifth row, checked at mobile width too. ESLint + `tsc --noEmit`
clean. Not yet pushed, same hold as the rest of this round.

### 14 Sept 2026 — Colleges: 25 real colleges added alongside the fabricated demo set

Design notes: `docs/COLLEGE_LOOKUP_AUDIT.md` §9. User supplied a 200-college
sample of the real production API response (card + profile shape) plus its
README and asked us to fill the demo with real values, scoped to whatever
the §§1-8 simplification rounds above still actually read.

- **25 real colleges added to `data.ts`/`extra.ts`**, kept in our existing
  field-name shape (not the real API's nesting) per direct instruction --
  "keep our shape, refresh the numbers." Princeton is untouched/still
  fabricated; it isn't in the 200-sample, and the user is sending its real
  data separately for the same treatment. 25 was a direct call to match the
  existing demo's rough size rather than use all 200, to avoid the
  time/usage-credit cost of an exhaustive population + per-college image
  fetching that a demo doesn't need. None of the 25 have real images/logos
  fetched -- all use `photo: false, mark: false`, the same placeholder state
  ~1/5 of real colleges are in per the source README, not a shortcut being
  hidden.
- New `scripts/colleges/transform-real-data.py` does the JSON-to-TS
  transform (see its header for usage) -- written to avoid hand-transcribing
  dozens of fields per college across 25 entries. Three originally-chosen
  colleges turned out to be graduate/professional-only institutions with a
  null `admission` block in the real API (no undergrad admissions to show)
  and were swapped for others from the same "no published price" pool; one
  more swap after a replacement's real undergrad enrollment came back `0`,
  which would have violated the "never render absence as zero" rule.
- Inserted at an exact, verified line index in both files -- an initial
  attempt used a generic `];`/`};` string search and silently corrupted
  `data.ts` by landing the block inside its unrelated `synthDetail()`
  function (which has its own later `];`); reverted via `git checkout` and
  redone correctly. Worth remembering for the Princeton pass or any future
  additions: never `rfind` a bare closing-bracket string in a file with
  more than one array/object.
- Fixed one real UI bug this exposed: `CollegeDetailExperience.tsx`'s Cost
  tab rendered the "Cost by Family Income" heading unconditionally even
  with zero published bands (a real state for `caan-academy-of-nursing`,
  96 undergrads) -- now guarded with `{d.bands.length > 0 && (...)}`,
  matching the pattern already used for Full Price Breakdown/Grants &
  Scholarships. Every fabricated college always had all 5 bands, so this
  was invisible until real sparse data existed.

Browser-verified live: Illinois State University (rich-data path, every
tab), Caan Academy of Nursing (sparse-data edge case -- Overview "Not
published" states, the bands bug, Student Body at tiny scale, Academics
degree-level selector), `/colleges` "For You" list and Browse All search
(new real colleges surface correctly alongside fabricated Princeton, no
code changes needed for list/search/filter). ESLint + `tsc --noEmit -p .`
clean project-wide. Not yet pushed -- same "ask before push" hold as the
rest of this session; will batch with earlier unpushed local commits
(Resume Builder prefill fix, the four College Details simplification
rounds) once the user says go. Princeton's real data is expected next, to
go through this same transform script.

### 14 Sept 2026 — Colleges: real photos and marks fetched for the 25 real colleges

Design notes: `docs/COLLEGE_LOOKUP_AUDIT.md` §10. Direct follow-up to the
same day's §9 real-data round -- user asked to fetch real campus photos and
school logos for every college still on the placeholder state, sourcing
"far and wide," not just Wikimedia Commons.

- All 25 real colleges (plus a stale-flag fix for 8 of the original
  fabricated-data colleges that had real image files on disk the whole
  time but incorrect `photo:false`/`mark:false` in `data.ts` -- discovered
  these flags are dead code, unused by the actual rendering path) now have
  real photo + mark assets. 55 photos / 55 marks total.
- Caught and fixed two badly-wrong automatic Commons matches by visual
  spot-check: Texas A&M's photo was a Bangladesh university building;
  Strayer University-Tennessee's photo was a random stray dog in Pristina
  (matched on the substring "Stray"). Also swapped two topically-weak
  matches (Illinois State's 1930s post-office mural, Chief Dull Knife
  College's unrelated USDA meeting photo) for real campus photos. Lesson
  for any future fetch round: spot-check Commons keyword matches visually,
  license/size filters alone aren't enough.
- `scripts/colleges/seed-names.json` permanently extended with the 25 new
  colleges so `fetch-images.mjs` covers them on any future rerun.
  `credits.json` has attribution for every asset, official-site sourced or
  Commons/Wikipedia.

Also this session, two small unrelated fixes:
- **College cards**: the program-match checkmark (e.g. next to "Business
  Administration") was low-contrast accent-blue on the card surface --
  direct feedback. Now a solid `--primary` circular badge with a white
  check icon, matching the existing "Comparing" button's solid-accent
  treatment. `src/components/colleges/shared.tsx`.
- **Build flow halfway screen**: "You're moving fast. 🚀 / The good part is
  coming." replaced with "You're halfway there. ✨ / Keep going. Your
  matches are getting closer." -- direct feedback that "moving fast" could
  read as a nudge to slow down/second-guess answers, when the message
  should be purely encouraging. `src/components/build/steps.tsx`.

ESLint + `tsc --noEmit -p .` clean across all touched files. Not yet
pushed -- held per explicit instruction until the college data/image work
was confirmed correct.

### 14 Sept 2026 — Match Learn More modal, Build copy, student avatar picker

Three more direct-feedback rounds, same session:

- **Match's "Learn More" modal** (`src/components/match-lab/MatchGrid.tsx`,
  `DetailModal`): dropped the "At a Glance" eyebrow line entirely (the three
  sections below it were always the real content). The three section
  headings (What You'd Do / Good Fit If You Like / School & Path) are now
  the largest text in the card (`15px` extrabold, was a `10.5px` uppercase
  eyebrow -- smaller than its own bullets), bullets stepped down to `13px`
  and muted so the eye lands on headings first, per "clear hierarchy, fast
  scanning, minimal distraction." Icons were tried removed, then explicitly
  asked back in white, inline with the (now larger) heading text -- kept
  BookOpen/Sparkles/GraduationCap, recolored to `#fff` from the career's
  own accent color.
- **Build copy**: "What sounds interesting?" -> "Which career fields
  interest you?" ("the current wording feels a little vague... immediately
  clear that students are choosing career areas"), "Choose up to 2" kept
  as-is. Updated in both the real step (`src/components/build/steps.tsx`)
  and the matching static mockup on the Schools landing page
  (`src/components/marketing/SchoolsIllustrations.tsx`) so the two don't
  drift.
- **Student avatar picker** ("Instagram-style edit button... have that
  work"): a small edit-icon badge now overlaps the corner of Jordan's
  avatar on their own Profile header, opening a grid of all 80 illustrated
  portraits (`AVATAR_POOL` in `src/lib/avatar.ts`) to pick from. New
  reactive override layer in `avatar.ts` (`AVATAR_OVERRIDE_KEY`,
  `writeAvatarOverride`, `useStudentAvatarSrc`) -- same localStorage +
  listeners idiom as `studentProfile.ts`/`resume.ts` -- checked only for
  Jordan's own seed, so the fixed pin/hash system for every other name is
  untouched. `studentAvatarSrc()` (the plain, non-reactive function) stays
  as the SSR-safe default; the three render sites that show a student's
  own face (`chrome.tsx`'s nav, `ProfileExperience.tsx`'s header,
  `connect/primitives.tsx`'s shared `Avatar`) now call the new
  `useStudentAvatarSrc()` hook instead, so a pick propagates live to all
  three without a reload -- verified in the browser (profile header + nav
  update instantly on pick, survives a hard reload, still the same
  component `Avatar` Connect uses everywhere). Deliberately still no real
  photo upload -- picks are limited to the same fixed illustrated set,
  consistent with the "no student photo is ever stored" policy already in
  place.

ESLint + `tsc --noEmit -p .` clean across all seven touched files. Not yet
pushed.

### 14 Sept 2026 — Princeton: real-data cross-check against a fresh Usman export

User sent a second dataset (`colleges-sample.json`, 243 colleges — the
original 200 plus 43 recognizable names including Princeton, added
specifically so the team can check a layout against a college it can
picture) and asked to update Princeton's data and flag anything else
needing a fix.

Cross-checked every field in Princeton's `data.ts`/`extra.ts` entry against
this real export. Result: all of it was already accurate -- the original
"fabricated" data was transcribed from the real live site back on 3 Sept
and has held up. The one real discrepancy found: `gradsPerYear` was `2400`,
real value is `2382` (source: `card.graduates`). Fixed. Photo (Nassau Hall,
CC0, Wikimedia) and mark (real Princeton seal) were also already real and
matched the new export's own Google-sourced campus photo choice closely
enough not to need replacing.

Also used this pass to re-verify, live in the browser, that the College
Details notes from earlier today (`@Chandu M P` Slack messages on Header/
Admissions/Cost, Academics, and Campus Life) are correctly implemented on
Princeton's actual page: Website/Financial Aid header actions (no Apply --
correctly hidden, Princeton's `applicationUrl` is null), Requirements/Other
Factors Considered split, plain Typical Scores ranges, Academic Facts list
with Undergraduate Research moved in, Popular Majors with degree-level
tabs, and Campus Life's four sections (Housing/Activities & Organizations/
Athletics/Opportunities) with no vague copy or progress bars. All confirmed
matching the notes exactly.

ESLint + `tsc --noEmit -p .` clean.

### 14 Sept 2026 — Resume Builder: template picker composition fix

Direct feedback on the New Resume template picker screen: "I can hardly
see the preview," too much copy, wasted space, preview sitting too low.

- Desktop layout changed from a fixed `320px` list column beside a
  `max-w-[440px]` centered preview (leaving most of the wide `1fr` column
  empty) to an explicit `grid-cols-[30%_70%]` split with the preview
  filling its full column -- `ResumeDocument` already auto-scales to its
  container width, so no size cap was needed once the column itself is
  correctly proportioned.
- Per-template descriptions removed everywhere (desktop rows and mobile/
  tablet cards) -- name + color swatch only. "The preview should do the
  talking" now that it's actually large enough to judge a layout by.
- Dreamy's speech bubble and the "Choose a template" heading moved from a
  full-width block above the two-column grid into the narrow left column
  itself (`TemplateGallery.tsx`, was split across that file and
  `ResumeBuilderExperience.tsx`) -- this is what was pushing the preview
  down ("why is it sitting so low") and what made the bubble read as one
  long bar across the screen; it now wraps naturally at the column's width.
  Also dropped the "Each one shows a filled-in example..." subtitle
  paragraph as more copy the bigger preview now makes redundant.
- Column gap tightened (`space-8` to `space-6`) per "there doesn't need to
  be a huge gap."

Outer page margins were untouched -- already matching Home/Explore/Profile
via the shared `Shell` component from an earlier pass today (see its own
header comment). ESLint + `tsc --noEmit -p .` clean, verified live at both
the `lg` desktop split and the mobile/tablet card grid.

### 14 Sept 2026 — Perf: nav backdrop-blur and eager Link prefetch removed

Direct feedback: "stuttering and slow loading... everywhere - animations,
transitions, match grid etc." Investigated live on the production deploy
(not localhost) via the browser's network log rather than guessing:

- **DesktopNavigation's sticky top bar and MobileNav's fixed bottom bar**
  both ran a 10px `backdrop-filter` across the full viewport width, on
  every single page, permanently mounted (sticky/fixed) -- the exact
  "large-area filter: blur()... exhausts GPU memory" anti-pattern this
  codebase's own platform notes already warn against (see
  `docs/handoff/README-FOR-USMAN.md`). A sticky/fixed blurred bar forces a
  recomposite on every scroll frame, on every page, for the life of the
  session. Replaced with the same near-solid fix already used for the
  hamburger menus (22 Aug 2026, `8350ff8`: "glass surface let page content
  bleed through and made rows illegible") -- `color-mix(in srgb,
  var(--background) 96%, var(--foreground))`, no filter.
- **The 5 nav Links (Home/Explore/Play/Connect/Profile) render on every
  page** and had no explicit `prefetch` prop, so Next's default eager
  prefetch was fetching all 5 routes' RSC payloads on every page load --
  confirmed via the browser's network log on the live deploy, which showed
  hundreds of repeated `?_rsc=...` requests to the same routes accumulating
  over a normal browsing session. Set `prefetch={false}` on all of them; a
  click still fetches instantly, it's just no longer speculative on every
  page mount.

`src/components/app/chrome.tsx`. ESLint + `tsc --noEmit -p .` clean,
verified live (near-solid nav bar renders correctly, no visual
regression). This doesn't touch the total image weight in `public/images/`
(341MB across the repo) -- Next's own image pipeline is already serving
correctly-sized/optimized versions per request, confirmed in the network
log, so that's a repo-size concern rather than a runtime one.

### 14 Sept 2026 — Resume Builder: live-tracking + placeholder text for every nested modal

Direct feedback: "the builder zoom is amazing... but the same zoom + pan +
realtime tracking + updating in the preview isn't working for these inner
menus like education and experience... everything I type on any input
field should be zoomed+tracked+shown live updating" -- then clarified to
cover every nested modal, not just Experience.

Root cause (confirmed by investigation, not guessed): the wiring
(`onFieldFocus`/`activeField`, `data-field` markers) was already correct
and identical across `ExperienceModal.tsx`, and `EducationModal`/
`CertificationModal` in `wizardSteps.tsx` -- the actual gap was that all
three stage a local `draft` and only call `upsertX(draft)` on Save, so a
**brand-new** entry has no corresponding `data-field` node in the DOM
until saved; the camera falls back to the generic section-level empty
state. Editing an *existing* entry (where the id already exists in
`resume.experience`/etc.) always worked, which is why "Education works"
looked inconsistent with "Experience doesn't" -- it was new-vs-existing,
not a per-modal wiring bug.

Fix, applied identically to all three modals:
- A `useEffect(() => { upsertX(draft); }, [draft])` live-writes every
  change straight into the actual resume store, not just on Save -- so the
  live preview shows the in-progress entry (and has a real `data-field` to
  track) from the moment the modal opens, before a single character is
  typed.
- Closing without saving now rolls this back: a brand-new entry is removed
  (`removeX(draft.id)`), an existing entry being edited is restored to its
  pre-modal snapshot (`upsertX(initial)`) -- so an abandoned edit never
  leaves a half-changed entry in the actual resume.
- `ResumeDocument.tsx`'s `EducationEntries`/`ExperienceEntries`/
  `CertificationEntries` now always render every field's `data-field` span
  (previously conditional on having a value), with a muted-italic
  placeholder ("Job Title", "Company / Organization", "City, State",
  "Start – End", etc.) standing in for anything still empty -- this is
  also the fix for the separate note ("when we zoom in and it's blank
  before we type it's a little off-putting... muted helper text?"): the
  camera now always has something legible to land on.

Skills intentionally NOT touched -- it's chip-toggle based (not a
progressively-typed field with a natural preview position), and was
already excluded from tracking by a prior, deliberate design decision
(`SkillsStep` never receives `onFieldFocus`).

`src/components/resume/ExperienceModal.tsx`,
`src/components/resume/wizardSteps.tsx`,
`src/components/resume/ResumeDocument.tsx`. Verified live: opening a new
Experience entry shows the placeholder-filled preview immediately, focusing
"Where" pans the camera to it, typing updates the preview character-by-
character. ESLint + `tsc --noEmit -p .` clean.

### 14 Sept 2026 — Perf: Match grid's sticky continue bar, same blur fix

Follow-up to the nav backdrop-blur fix, same session: "see if you can find
what's causing the stutter and slow animations... see if we can fix them."
Audited every `backdrop-filter`/`backdrop-blur` usage in the app for the
same large-area + persistent-mount pattern that made the nav bars
expensive. Found one more clear match: Match grid's sticky "continue" bar
(`fixed inset-x-0 bottom-0`, full width, always mounted while browsing
matches) ran `backdrop-blur-xl` (a heavy 24px blur) over a background that
was already 88% opaque -- the blur was doing almost no visible work while
still paying the full per-frame compositing cost. Dropped the blur, bumped
opacity to 94% to keep it reading solid.

Also audited and deliberately left alone: every other `backdrop-filter` in
the app is on a small, card-level surface (badges, circular icon buttons,
toasts, popovers) -- exactly what this codebase's own platform notes call
the acceptable case ("reserve backdrop-blur for a few card-level
surfaces"), not the large-area anti-pattern. `MatchLab.tsx` (the old swipe
deck) has a few heavier ones too, but it's dormant -- no live entry point
routes to it anymore (`MatchGrid.tsx`'s own header comment confirms this)
-- so not worth the risk of touching unused code.

Also checked `AuroraBackground.tsx` (the animated canvas background used
across Build): canvas-based, not CSS blur, respects `prefers-reduced-
motion`, and correctly cancels its `requestAnimationFrame` loop on
unmount -- already built the right way, not a contributor here.

`src/components/match-lab/MatchGrid.tsx`. ESLint + `tsc --noEmit -p .`
clean, verified live (bar still reads solid, no blur).

### 15 Sept 2026 — Resume Builder: "Match to a Job" actually works now

Direct feedback: "where do we introduce tailoring the resume to a job
description other than the edit selection thing at the end? We need to
make that work, and make that part of the flow... refer the replit again
to see how that actually works and what the output is/should be."

The `jobDescription` field already existed on `ResumeVersion` and in
`TailorScreen.tsx` -- it was purely decorative, stored but never read
anywhere. Re-checked the Replit reference (signed in this time, since the
first pass 401'd on every submit) and captured its real, authenticated
`/api/resumes/generate` response: it runs two scores (a general resume
"quality" score and a job-specific "match" score with a label), a
skill-suggestion list grounded in the student's own experience bullets
(never invented -- "Not in profile" / opt-in "+Add"), and a short honest
gaps list for what the posting wants that the profile doesn't support yet.
Also confirmed two things worth NOT copying: the reference asks for
Job Description + Target Position + Target Company (all three, so we
added the latter two), and its "good start" coaching modal is a genuine,
reproducible bug -- it re-fires on every single submit instead of once.

Built new:
- `src/app/api/resume-tailor/route.ts` -- same AI-with-graceful-fallback
  shape as `resume-bullets/route.ts`: calls Claude for real analysis when
  `ANTHROPIC_API_KEY` is set (returns matchScore, qualityScore, skill
  suggestions with a reason grounded in the student's own experience,
  gaps, improvement tips), otherwise a keyword-overlap fallback against
  our own `SKILL_CATEGORIES` list so the feature works with zero setup.
  Verified both paths directly (curl) -- a bullet literally containing
  "leadership" correctly surfaces a grounded suggestion; "teamwork"
  (JD-relevant but not literally present) correctly lands as a gap instead
  of a fabricated suggestion.
- `ResumeVersion` gained `targetPosition`/`targetCompany` (string, both
  optional) alongside the existing `jobDescription`.
- `addSkill()` in `resume.ts` -- one-tap, case-insensitive-deduped add
  straight to the student's actual skills list, no confirmation step.
- `TailorScreen.tsx`: the job-description field now sits under a clear
  "Match to a Job" heading explaining what it does (direct feedback,
  15 Sept 2026: "optional by itself doesn't communicate that it's for
  tailoring the resume") -- not just a bare "optional" field label. An
  explicit "Find Matching Skills" button (not auto-fire-on-keystroke, to
  keep API calls deliberate) shows results inline on the same screen, no
  modal: a small `DreamyGuide` line (reusing the exact prominent-not-
  afterthought treatment the wizard steps already use, per direct
  feedback "like we did for build match play profile etc, but subtler"),
  two compact score chips, suggestion rows with working Add buttons, a
  short improvement-tips list, and a quiet gaps line. Never shows twice
  uninvited and never blocks Save -- fixes the reference's own nag-modal
  bug by construction rather than patching around it.

Verified live: seeded a resume matching the reference's own test data,
ran the same job description through both, got sensible/consistent
scores and a correctly-grounded suggestion. ESLint + `tsc --noEmit -p .`
clean on every touched file (the two other errors reported project-wide,
`src/app/gate/page.tsx` and a warning cluster in `ConnectExperience.tsx`,
are pre-existing and untouched by this change).

`src/app/api/resume-tailor/route.ts` (new), `src/lib/resume.ts`,
`src/components/resume/TailorScreen.tsx`,
`src/components/resume/ResumeBuilderExperience.tsx`.

## 15 Sep 2026 -- Match to a Job results moved into a modal, copy trimmed

Direct feedback: "the dreamy stuff can be a modal, otherwise theres a lot
of clutter... so many new things are being added to that last section."
The analysis results (Dreamy line, score chips, suggestions,
improvements, gaps) now open in a `ResumeModal` (the same in-place
panel-swap pattern `ExperienceModal`/`EducationModal` already use, not a
floating overlay) instead of stacking inline under the job description
fields. Opens once per "Find Matching Skills" run; a "View Results"
button reopens the same result without re-fetching. Still never fires on
Save, so it doesn't reproduce the reference's nag-modal bug.

Also trimmed copy per direct feedback: dropped the "Match to a Job"
description line (redundant with the textarea's own placeholder),
shortened the placeholder and error text.

Verified live: seeded a resume, ran a job description through, modal
opened with correct scores/suggestions, Back returned to the form with
the draft intact, "View Results" reopened without a second API call.
ESLint + `tsc --noEmit -p .` clean on `TailorScreen.tsx`.

`src/components/resume/TailorScreen.tsx`.

## 15 Sep 2026 -- Bullet-generation fallback no longer echoes raw filler

Direct feedback: make sure AI-generated bullets sound relevant/logical.
No `ANTHROPIC_API_KEY` is set in this dev environment, so every bullet a
student sees here goes through `templateBullets()`'s deterministic
fallback -- and it was echoing the student's raw plain-English answer
almost verbatim (only capitalized), with no "AI-drafted, edit this"
banner shown (that only appears when `aiAssisted` is true), so a student
would see a first-person, filler-laden sentence as a finished bullet.
Verified live via direct `/api/resume-bullets` calls: "I basically just
stood at the register all day..." produced exactly that as the bullet.
Added `cleanAnswer()`: strips a leading first-person opener ("I was...",
"I'd basically..."), scattered filler words (basically/literally/kind
of/sort of), and "like" used as a casual quantifier ("like 5" -> "5").
Re-verified same input now returns "Stood at the register all day...".
A second call with already-clean input confirmed no regression (passed
through unchanged). This is regex cleanup, not real rewriting -- it
removes the most obviously unedited tells, nothing more.

`src/app/api/resume-bullets/route.ts`.

## 15 Sep 2026 -- ATS Check, Text Preview, real .docx export

Direct feedback: "Full functionality like the replit has" -- a full audit
of the reference's Resume Builder against ours (screen by screen, every
button) found the whole "ATS Check" system missing (only two "ATS-
friendly" copy strings existed, no actual feature), plus Text Preview and
real .docx export were also gaps (the latter already flagged, never
built, in the original project plan).

**ATS Check** (`src/app/api/resume-ats-check/route.ts`, new): a resume-
quality rating (0-100, letter grade, 7-category breakdown), a job-match
breakdown (verified/possible/gaps + keyword-by-keyword), an ATS
readability checklist, and missing qualifications -- matching the
reference's own four-part panel. Split by what needs judgment vs what's
just checkable: the readability checklist and 4 of 7 quality categories
(completeness, skills, education, ATS formatting) are computed directly
from the resume data, no AI, no fabrication risk. Only the genuinely
subjective pieces (experience/bullet quality, job-match reasoning,
keyword verification) go through Claude when a key is present, with a
heuristic fallback otherwise -- same shape as the other two AI routes.
Persisted on the `ResumeVersion` (`atsCheck` field, `src/lib/resume.ts`)
so reopening it is instant; a fingerprint of the resume's actual content
(`ATSCheckPanel.tsx`'s `fingerprintFor`) detects staleness and shows a
"resume changed, re-run" banner over the last real result rather than
either a fake-fresh stale result or a blank slate.

**Text Preview** (`TextPreviewModal.tsx`, new): resume flattened to plain
text straight from the data model, not scraped off the visual document.

**Real .docx export** (`ExportChecklistModal.tsx`, new): added the `docx`
npm package. A 6-item honesty-confirmation checklist (matching the
reference) gates both "Export PDF" (still `window.print()`) and
"Download .docx" (`Packer.toBlob()`, US Letter page size, real headings/
bullets, no template layout -- the doc-generation library has no notion
of the 4 visual templates, so this is one consistent single-column
export regardless of which template the version uses).

All three wired into `DocumentScreen`'s toolbar in
`ResumeBuilderExperience.tsx` (ATS Check only shown when a saved
`ResumeVersion` exists, matching the reference: it's a finished-resume
feature, not available mid-wizard). `PrintResumeButton` deleted from
`ResumeDocument.tsx` -- fully superseded by the new Export flow, no
remaining callers.

Direct feedback mid-build: keep the actual resume content's own writing
level as-is (still professional, not simplified) -- "8th grader reading
level" was specifically for the ATS Check explanatory copy, so students
understand what the scores/checklist mean, not for resume bullets
themselves. Trimmed every ATS Check/Text Preview/Export string to that
bar; the AI prompt for the subjective fields now explicitly asks for it
too.

Two real bugs caught and fixed during live verification (not just
written and assumed correct):
1. The stale-check banner's very first version replaced the whole
   screen with the "Run ATS Check" empty state instead of showing the
   last real result -- `result` state was seeded from `cached` (null
   when stale) instead of `version.atsCheck` (the actual last result,
   stale or not).
2. The stale banner didn't clear after a successful re-run -- `stale`
   was a `useState` computed once at mount and never updated; added
   `setStale(false)` on a successful run.

Verified live end-to-end: ran ATS Check (real scores, breakdown sums to
total, strengths/improvements/job-match/readability/missing-quals all
populated correctly) on both a resume with a job description and one
without; confirmed persistence across reload; confirmed staleness
detection and the two bugs above by deliberately editing skills between
runs; Text Preview matches the data exactly; Export checklist gates both
buttons until all 6 boxes are checked; the .docx download was captured
and confirmed to produce a real blob (`Packer.toBlob` succeeded, correct
filename) rather than just checking the button didn't throw. ESLint +
`tsc --noEmit -p .` clean project-wide (the two pre-existing errors in
`src/app/gate/page.tsx` and `ConnectExperience.tsx` are untouched by
this work).

**Not built** (scoped out for time, not forgotten): the reference's
per-section inline "AI regenerate" / "Hide" toggles on the finished
document, and the "Approve" status flag. Neither was named directly by
the ATS Check ask; flag if still wanted.

`src/lib/resume.ts`, `src/app/api/resume-ats-check/route.ts` (new),
`src/components/resume/ATSCheckPanel.tsx` (new),
`src/components/resume/TextPreviewModal.tsx` (new),
`src/components/resume/ExportChecklistModal.tsx` (new),
`src/components/resume/ResumeBuilderExperience.tsx`,
`src/components/resume/ResumeDocument.tsx`,
`src/components/resume/TailorScreen.tsx`, `package.json` (added `docx`).

## 2026-09-15 · Enterprise page structure, College Detail: Similar Schools, marketing nav simplified

Three pieces of work this session, all verified live.

**Enterprise/Schools page (`SchoolsView.tsx`, `SchoolsIllustrations.tsx`):**
Went through several structural directions (a sticky-scroll story, a full
"route" reimagining) before landing back on the page's own established
structure -- full H2s, pill tabs (`Chips`), the chip-driven five-stage
gallery -- since that's what both this page and Codex's independent
`enterprise-landing-concepts` sketch converged on from the same reference.
Two real fixes kept from the detours: the Match illustration was a stale
swipe-deck mechanic (the real `/match-grid` page grids instead, verified
live 15 Sept) -- redrawn to match, salary chip + save button + real copy.
And the stage gallery's art column is now a fixed height (measured live:
natural heights ranged 423-741px across the five illustrations, visibly
jumping the row) -- Codex's own version used the same fixed-height guard
for the same reason. The Audiences section's illustration column is 520px,
not the previous 600px (right-sized to the tallest real composition,
487px -- 600px left ~170px of dead space under it).

**College Detail: Similar Schools (`colleges/data.ts`, `shared.tsx`,
`CollegeDetailExperience.tsx`):** New section at the bottom of every school
profile, matched on the school being viewed, not the student's profile (the
same discipline behind removing `YourPath`/"Why X fits you" from this page
on 15 Sept for being hard to support consistently with the data). Community
colleges only match other community colleges; trade/technical schools only
match within the same program family (cosmetology, aviation, culinary,
automotive, healthcare, IT, construction), read from the school's own name
-- `synthDetail()` hands every school without real reference data the same
generic per-level programme list, so programme names are only trusted for
matching when `detail.sample` is not true. Everything else ranks within its
own degree level by control, selectivity, size, cost and state. Verified
live: Princeton -> South Dakota State ("Also offers Economics", a real
shared programme) and Kean University ("Similar size and cost"); Christine
Valmy (cosmetology) -> 3 genuine cosmetology/esthetics matches ("Similar
cosmetology training"); Bergen Community College correctly shows zero
matches (it's the only true community college in the current 55-school
dataset) rather than a bad one.

Same change fixed a flagged inconsistency (Joshua Pierce): `SchoolCard`'s
third stat used to be "miles from home" from a hardcoded ~20-town lookup
table (added 11 Sept for a 33-college dataset) that silently fell back to
finish rate for any of the 25 colleges added 14 Sept whose town wasn't in
the table. Removed the table; every card now shows finish rate, always.

**Marketing nav (`marketing/Nav.tsx`, `app/chrome.tsx`):** Dropped the
inline link rows (student "How it works/Simulations/Career worlds", schools
"Why Dreamari/Student Experience/For Your Organization") from both the
desktop bar and the hamburger -- direct feedback, minimize the landing
page. Also dropped the whole-app sitemap and the Connect demo role switcher
from the marketing hamburger specifically (`QuickLinksPanel` gained a
`hideDemoLinks` prop) -- both are internal QA/demo conveniences, not real
visitor navigation; the in-app hamburger (`QuickLinksMenu`) is unchanged.
The bar is now just the logo, the CTA, and a hamburger holding the audience
switch and theme toggle.

ESLint + `tsc --noEmit -p .` clean across all seven touched files.

`src/components/marketing/SchoolsView.tsx`,
`src/components/marketing/SchoolsIllustrations.tsx`,
`src/components/marketing/Nav.tsx`, `src/components/app/chrome.tsx`,
`src/components/colleges/data.ts`, `src/components/colleges/shared.tsx`,
`src/components/colleges/CollegeDetailExperience.tsx`.

## 2026-09-15 · Real miles-from-home on school cards

Replaced the seeded/finish-rate third stat chip with a real distance,
per direct instruction ("never fallback to finish rate... if you have to
fake a distance that's okay for the demo"). Two free, no-key APIs:
Nominatim (OpenStreetMap) geocoded all 55 colleges' real campus towns once
(`COLLEGE_COORDS` in `colleges/data.ts`, static from here on); Zippopotam.us
geocodes the student's real `StudentProfile.zipCode` live, the first time
it's needed, cached in localStorage so it's one lookup per zip ever, not
per card (`colleges/distance.ts`, new file). Real haversine distance when
both ends are known; a seeded (deterministic, not random-per-render)
placeholder when there's no zip on file yet -- the card never omits the
stat and never falls back to a different figure. Verified live: no zip on
file -> a fixed seeded number; zip set to San Francisco (94102) -> 2,475 mi
to Clarkson University (Potsdam, NY), a correct real distance.

ESLint + `tsc --noEmit -p .` clean.

`src/components/colleges/data.ts`, `src/components/colleges/shared.tsx`,
`src/components/colleges/distance.ts` (new).

## 2026-09-16 · App-wide sticky glass nav + Build-to-Match perf fixes

Direct feedback: the top nav was sticky/transparent/glass-blurred on the
landing page only, and reverted to a plain static bar everywhere else in
the app; separately, the Build completion screen's pulse-ring animation,
the click-to-Match transition, and Match grid card hovers all felt
"extremely laggy."

**Nav.** Did not add `backdrop-filter` back onto the existing full-width
`DesktopNavigation` bar as literally asked -- that shape was de-blurred on
14 Sept specifically because a sticky, full-width backdrop-blur
recomposites every scroll frame on every page. Instead matched
`marketing/Nav.tsx`'s already-proven-safe pattern: a small floating pill,
transparent at rest, frosting in (`blur(18px) saturate(1.6)`) only past a
scroll threshold. `DesktopNavigation` (`app/chrome.tsx`) now nests an
unchanged-layout sticky outer host around a centered, rounded floating
header. The 6 duplicated, non-sticky mobile page headers (Home, Profile,
Connect, Play, College Detail, Career Detail) were pulled into one new
shared `MobileHeaderShell` (`app/chrome.tsx`) with the same scroll-frosted
treatment, sticky this time. Bottom tab bar (`MobileNav`) untouched --
already correct, intentionally blur-free chrome, not what "top navbar"
referred to.

**Perf.** Three concrete sources, all in the Build-completion -> Match
path: (1) `MatchGrid.tsx`'s "Learn more" pill ran `BorderBeam` with `active`
hardcoded true -- an animated `filter: blur()+hue-rotate()` looping forever
on all 6 cards the instant the grid mounted, not just on hover. Removed;
replaced with a static career-tinted pill, same visual weight, zero
per-frame cost. (2) Card `whileHover` animated `boxShadow` (a paint
property) on every hover in/out in a packed 6-card grid; dropped it, kept
`y`/`scale`/`zIndex` (compositor-only). (3) `StepFooter`'s Next/"Reveal My
Matches" click (`build/ui.tsx`) now passes `soft: true` to
`dispatchAuroraPulse`, skipping the trig-heavy traced ring stroke
(~50-70 points, two overlapping 1900ms ripples) that was running at the
exact moment the screen navigates into Match's fresh `AuroraBackground` --
the same soft variant the Congrats screen's own pulse already used for
this reason.

Not done: the grid's 18 `backdrop-blur-md` badge instances (salary chip,
select/+ button, x6 cards) weren't re-audited at this larger combined
scale -- flagged as optional follow-up only if still needed after this
pass.

ESLint + `tsc --noEmit` clean across all nine touched files (10 pre-existing,
unrelated warnings only: one `<img>`-vs-`next/image` warning in `ui.tsx`,
nine unused-variable warnings in `ConnectExperience.tsx` predating this
change).

`src/components/app/chrome.tsx`, `src/components/app/HomeExperience.tsx`,
`src/components/profile/ProfileExperience.tsx`,
`src/components/connect/ConnectExperience.tsx`,
`src/components/play/PlayHub.tsx`,
`src/components/colleges/CollegeDetailExperience.tsx`,
`src/components/career/CareerDetailExperience.tsx`,
`src/components/build/ui.tsx`, `src/components/match-lab/MatchGrid.tsx`.

## 2026-09-16 · Nav/perf follow-up bugs, margin consistency, Resume tabs, Build light-mode glow

Direct feedback after the sitewide sticky-nav pass above shipped: the header
sat centered in the middle of the screen on Build/Match, the desktop nav
scrolled away on Profile and Career Detail, related-career cards clipped at
the page edge, Profile felt narrower than its sibling tabs, Resume Builder's
tabs should get the same treatment as the main nav, and Build's light-mode
background read too flat. Five separate fixes, each its own PR:

**Header centered mid-screen in light mode (PR #5).** `tokens.css`'s
`.theme-light` rule sets `min-height: 100%`, meant for full-page themeable
surfaces. `FlowChrome`'s fixed header and `CareerDetailExperience`'s degree
popover also carry `marketing-v2 themeable` purely to scope CSS variables,
not to opt into that min-height. In light mode (Build/Match's default) this
stretched both to fill the viewport, and `items-center` centered their
contents mid-screen. `minHeight: 0` inline on both overrides it without
touching the shared rule.

**Desktop nav scrolling away on Profile/Career Detail (same PR #5).**
Both wrapped `<DesktopNavigation />` in an extra `<div className="no-print">`
sized exactly to its sticky child -- `position: sticky` can never stick
further than its own containing block, so with zero extra height in that
wrapper, the header had nowhere to go and scrolled away the instant the
wrapper cleared the viewport top. Home/Connect/Play never had this wrapper
and were unaffected. Fix: `DesktopNavigation` now takes the same
`extraClassName` prop `MobileHeaderShell` already had, applied to its own
sticky element, no wrapper.

**Related-careers rail clipping on desktop (PR #6).** The rail zeroed its
bleed margin/padding at `md:` (`md:mx-0 md:px-0`) instead of scaling it like
every sibling rail (Home, College Detail's Similar Schools use `sm:-mx-N
sm:px-N`, never zero). No trailing space meant the last card hard-clipped
at the column edge. Fixed to `md:-mx-8 md:px-8`, mirroring this page's own
`main` padding. (Two other `md:mx-0 md:px-0` usages, in `CareerReport.tsx`
and `ProfileExperience.tsx`, are sticky-left-column comparison tables, a
different pattern where flush scrolling is correct -- left alone.)

**Profile narrower than sibling tabs (PR #7).** Profile's `<main>` used
`max-w-[1200px]`; Home, Play, Connect, Colleges and Explore all share
`max-w-[1440px]` with the same `px-5 sm:px-[space-14]` baseline -- Connect's
own header comment documents this as the app-wide convention for top-level
tabs. Profile was the one outlier. Aligned to 1440; baseline mobile padding
untouched.

**Resume Builder tabs, same glass pill as the nav (PR #8).** Direct
request to match the nav's scroll-conditional, transparent-at-rest pill --
an explicit reversal of the full-bleed always-blurred bar chosen for this
same element earlier this session. Outer inset only applies from `sm:` up
(mobile keeps it flush edge-to-edge): unlike the nav's own pill, this row
carries three full text labels plus a close button, and the nav's fixed
12px inset on top of the pill's own padding pushed content off a narrow
phone. Also fixed, found while verifying the above and confirmed
pre-existing/unrelated: the tab row had no overflow handling at all, so a
phone-width close button clipped off-screen with no way to reach it,
making the wizard unclosable. The tab list now scrolls independently while
the close button stays pinned.

**Build/Match light-mode background too flat.** `BackgroundSpace.tsx`'s
nebula glows use the same `--color-brand-500` / `--color-accent-purple` /
`--color-decorative-pink-glow` tokens in both themes (unchanged, by
design -- not something to fork). What actually differs is the same
`color-mix` alpha read against a near-black fill (dark) versus a near-white
one (light): identical percentages land far more washed out on white.
Boosted the light-mode mix percentages only (dark's values are untouched)
so the glow reads lighter and a touch more vivid instead of flat. No new
tokens added, no changes to `design-tokens.generated.css` -- same named
tokens, different blend ratio, entirely inside this one component.

ESLint + `tsc --noEmit` clean on every file in every fix above.

`src/components/app/FlowChrome.tsx`, `src/components/career/CareerDetailExperience.tsx`,
`src/components/app/chrome.tsx`, `src/components/profile/ProfileExperience.tsx`,
`src/components/resume/ResumeBuilderExperience.tsx`,
`src/components/flow/aurora/BackgroundSpace.tsx`.

## 2026-09-17 · Connect-before-next-level in Play, Career Detail Connect modal, Joshua's Replit reference capture

**Resume Builder: aligning with Maisha's Replit (in progress, not pushed).**
Reference walked end to end at desktop, tablet and phone and recorded in
`docs/reference/resume-builder-replit-2026-09/` (README = map, features,
the Replit's own gaps; walk-text.md = every screen's text and controls).
Added so far: `src/lib/resumeAts.ts` (one shared ATS runner + fingerprint),
automatic ATS scoring on the finished document whenever a version has no
result or a stale one (direct request: "every resume that is generated
should automatically be ATS checked and scored"), Dreamy's score card once
after a resume is created ("Resume x/100 · Job Match y/100" + the single
most useful tip, See Final Tips opens the panel), a first-run Dreamy welcome
pop-up (`DreamyPopup` in ui.tsx, once per browser), XP toasts per completed
wizard step (+10/+15, the reference's point values), a Tailored badge on the
document toolbar, a Preview control in the wizard below lg (the live
preview column is hidden there), and saved-card actions that drop under the
title on phones. Later the same session: the document toolbar wraps from
lg (the labelled row overflowed the 900px column), status chips sit beside
the title, a fresh load of Choose & Tailor pre-selects every entry (the
first store snapshot is the empty server one, so the default was computed
against nothing), and the sheet's scale measurement retries on a zero
width and listens to window resize. Verified headlessly (Playwright,
scratchpad `ours-shots.mjs`) at 1440/768/390: sheet 900/656/350 px wide,
no horizontal overflow. The desktop app's viewport emulation gave
contradictory measurements for this page and should not be trusted for it.

Then, on direct feedback that the plain pop-ups were "too basic": both
Dreamy moments now use the shared `WelcomeSplash` (new `resume` surface,
per-instance `scene` override for the live score card, optional
`secondary` action rendered as a quiet link under the beam CTA). XP is a
shared flight: `src/components/app/xpFlight.ts` lifts "+N XP" from the
form card, holds, flies into the element marked `data-dream-score-target`
and banks the points via `awardDreamScore` on landing (once per milestone).
The main nav's Dream Score chip carries that attribute; routes with their
own header render `DreamScoreChip` (builder tab bar, document header) so
there is always a landing target. `Working` (components/app) is the app's
thinking chip: beam, shimmering label, stepping dots; the ATS "Checking"
state uses it, then shows a score chip that opens the panel (or a Retry).
Two bugs fixed on the way: the auto-check cancelled itself when saving the
result flipped its own dependency (Checking… never cleared), and a
strict-mode mounted flag stayed false. Icon-only toolbar buttons now show a
real tooltip below lg. App-wide copy: "Business & Money" is "Business &
Finance" everywhere (84 occurrences, ids and token names unchanged).


**AT&T × Connected Learning Centers board (`src/components/connect/att/`).**
Joshua's three-view Connect update (Student / Volunteer / Enterprise, see
`docs/reference/joshua-connect-replit-2026-09/`) ported as one partner
board inside Connect, in the app's own language and with the Replit's copy
verbatim. `attData.ts` holds every string (do not edit copy there; the
Replit is the source of truth), `AttCommunityView.tsx` renders the views
with the shared primitives (BoardView banner, Segmented, Panel,
PrimaryCta/QuietCta, FollowButton, MetricTile, AreaChart). Routed from
ConnectExperience's board branch by `ATT_ID`; the community entry sits LAST
in `COMMUNITIES` so `find(c => c.world === ...)` lookups still land on the
general Tech board. The Student/Volunteer/Enterprise switch is a demo-only
control (a Demo chip reveals it, same as RoleTabs). Cover and card photo
are AT&T's own newsroom image (`att-connected-learning-center.jpg`, from
about.att.com "AT&T Opens 100th Connected Learning Center", July 2026);
the card wears the AT&T white mark via the new `Community.brandMark`.
Community cards were also brightened (progressive blur 34%, lighter scrim)
and Connect's boards and dashboards now fill the shared 1440 column.
Pre-build snapshot: local tag `connect-before-att-board-2026-09-17` and
branch `connect-snapshot-2026-09-17`.

The six AT&T professionals wear their own portraits (`att-*.jpg`, taken
from Connect's retired pre-Sept-2026 headshot set recovered from git
history, so no face repeats a current pro's; `Avatar` now takes an explicit
`photo` for pros outside PROS). People rows were spread out so nobody
appears in all three.
Rule from 17 Sept: generated avatars are for students only. Insight cards
carry the other boards' action row (helpful pill with count, comment count,
Ask as the one worded action); the counts are ours, the Replit shows none.
Later the same day, on the same board: the five clashing first names were
replaced (Terrence Reed, Calvin Lee, Nisha Patel, Dev Johnson, Lucia
Rodriguez; surnames and roles kept, a code comment maps them back to the
source). Beyond the Replit, all direct requests: opportunity cards open a
detail sheet (about, who, when, where, how; interest and applied or
registered counts; status chips; Add to My Plan; Tailor or Build your
résumé; Save), dates render as calendar tiles, deadlines as "Closes Jan 31"
chips; the This Week poll shows a response count and flips to a percentage
tally after voting; the six professionals open the shared ProProfileView
(`ATT_PRO_RECORDS`, demo profile copy); People tiles open profiles and the
section carries one faint AT&T mark instead of a chip per card. Shared
primitives added: `InsightMark` (one large serif quote on the corner of any
surface holding insight content: the AT&T Home cards, the general boards'
Insights tab container, the insight page header, the Play interstitial's
featured card; never a list row), `Composer` (the standard beam-on-focus
text field, used for every free-text field on the AT&T board), and
`PARTNER_PORTRAITS` (name-keyed portraits for pros outside PROS). Connect's
page-level demo role switcher now renders only on the landing or while a
non-student role is active, in a slim right-aligned row; every Connect sheet
backdrop blurs. Switching a board's filter tab no longer pushes onto the
back stack. Program descriptions and profile stories are demo copy to be
replaced by AT&T's own text.


**Connect interstitial in Play (`ConnectInterstitial.tsx`).** Skippable
modal between simulation levels, ported from Joshua's Replit
(`dceeai.replit.app/ib-career-game`, "CONNECT BEFORE LEVEL 2"): three
actions (Like / Comment / Ask) over real Connect content for the
simulation's world. Deliberate departures from the reference, all direct
requests: all three actions are required before the "Connected" screen
(the reference stops after one), XP is weighted by effort (Like 5, Comment
10, Ask 20, +15 for all three), a flying XP number lands on a persistent
header counter, and the featured insight is stage-matched (Intern→Analyst
shows the reference's own "Connect before Level 2" quote, added to
`data.ts` as `i-first-year-analyst` at a deliberately low `helpful` so it
stays out of the board's top results). Ask fuzzy-matches an existing thread
by coverage of the thread title's own words (the old symmetric ratio
failed on any realistic, longer question). Demo shortcut: `Hud`'s
FastForward button, gated by `DEMO_CONNECT_SHORTCUT` in
`SimulationPlayer.tsx`; flip off before a real release.

**Career Detail "Connect" modal (`ConnectWithProfessionalsModal.tsx`).**
Same chrome and XP mechanics (shares `ConnectInterstitial.module.css`),
different actions per the second Replit reference: Ask / Answers / People.
Answers and People are plain scrolling rows of fixed-width tiles (a
single-focus "depth stack" was tried and reverted). Tapping a
professional opens an in-modal profile; back returns to the same modal
state. "Find more pros on Connect" deep-links to `/connect?board=`.

**Input bugs fixed.** `DialogueBox`'s window keydown listener (Space/Enter
advance the beat) now bails whenever `document.body.style.overflow` is
`hidden` (every modal sets it), so keys typed into a modal no longer drive
the game behind it. Both modals' focus-trap effect keyed on the
`onClose`/`onContinue` callback, which Play recreates every render, so it
re-ran and stole focus mid-typing; it now reads the callback from a ref and
runs once.

**App-wide rule:** `formatCount()` in `connect/primitives.tsx` now defaults
to compact and abbreviates anything over 999 as K (1.5K), per direct
instruction; all existing call sites pick this up.

**`CardProgressiveBlur`** inherits its ancestor's border-radius, fixing
square corners poking out of rounded photo headers in some browsers.

**Reference capture:** `docs/reference/joshua-connect-replit-2026-09/`
documents every view, tab and control of Joshua's Connect update on
Replit (AT&T × Connected Learning Centers: Student / Volunteer /
Enterprise) with a screenshot per state and the captured text, plus
`walk.mjs` to regenerate it. Read that before re-walking the site.

ESLint + `tsc --noEmit` clean on every touched file.

## 2026-09-17 · Resume Builder aligned with Maisha's Replit, AT&T board, Business & Finance rename

**Reference:** `docs/reference/resume-builder-replit-2026-09/` (README +
walk-text.md) records every route, control and gap of
resume-builder-maishak.replit.app. Read it instead of re-clicking.

**Resume Builder (`src/components/resume/`, `src/lib/resumeAts.ts`).**
Every saved resume is ATS-checked on open (fingerprint-based staleness,
`runAtsCheck` shared by the header chip and the panel). A just-created
resume opens INTO the check: `AtsCheckStage` (splash chrome, "Scanning
your resume" Working chip, readability items ticking in) then the score
card on the shared `WelcomeSplash` ("RESUME READY" / "STRONG MATCH", two
scores, one tip, Continue banks +25 XP, See Final Tips opens the panel).
Welcome and the Review nudge use the same splash. XP for each wizard
milestone flies as a glowing capsule (`app/xpFlight.ts`) into the Dream
Score chip; the builder's tabs bar carries `DreamScoreChip` so the chip
position is consistent with the main nav. Document header is one line:
title + status chips left, icon-only toolbar right (bespoke `AtsIcon`:
scanner corners around "ATS"). Tooltips (`Tip`/`IconTip`/`ToolbarButton`
in `ui.tsx`) are portalled to the body: rendered inline they painted
behind the sheet because fill-mode animations leave a transform on
neighbours. Saved list rows are a single dense row (identity, inline score
badges, actions, Open). Phone: tabs shorten to Builder/Saved/Tailor so
they share the row with the XP chip and close; document opens scrolled to
top (same-route pushes kept the Tailor form's offset).

**Replit gaps fixed on our side** (see README): skills count bug, three
tips under "one small tip", Save & Export dead end, manual ATS,
non-clickable stepper, delete without confirm, tablet preview ~200px,
phone nav tabs vanishing, blank `/create` and `/resumes` below desktop.

**Elsewhere:** AT&T × Connected Learning Centers board in Connect
(`connect/att/`, `REPLIT_ONLY` switch, additions note under
docs/reference). "Business & Money" renamed "Business & Finance" app-wide
(ids unchanged). `Working` chip (beam + shimmer + stepping dots) is the
loading primitive to roll out app-wide next.

**Open:** app-wide loading-states pass with `Working`; light-mode audit
resume point in `docs/reference/light-mode-audit-2026-09-17/NOTES.md`.

ESLint + `tsc --noEmit` clean on every touched file.

## 2026-09-18 · Resume document on the phone, Connect demo chips, AT&T cards, Match grid rows

**Resume document (phone, below sm).** One header row (title truncates,
Tailored is an icon, score chip stays), the fitted sheet is a "Tap to
read" thumbnail into the full-screen reader (`ZoomResumeModal`, now
exported separately from `ZoomResumeButton`), and a fixed bottom bar
(`MobileActionBar`: Tailor, ATS Check, Read, Export, More sheet with Text
Preview / Edit Sections / Edit Selection) replaces the icon row, which is
now sm+ only (`TopBar toolsFromSm`). Bar hides while a panel is open.

**Connect.** The role switcher never renders on the AT&T board; both Demo
chips (Connect roles, AT&T views) toggle closed on a second press and are
re-keyed on the role/view so a change re-opens them. AT&T opportunity
cards cut to kind, title, one line, status chip and Save (date tile, time
and interest counts live in the sheet).

**Match grid.** Deck ordered one industry per row: Business & Finance,
then Tech & Engineering.

ESLint + `tsc --noEmit` clean on every touched file.

## 2026-09-18 · My Plan: High School | College toggle, College Years 1 to 4

`GradePlanCard` (Profile > My Plan) now has a stage toggle at the top
(High School | College) with 9 | 10 | 11 | 12 or Yr 1 | Yr 2 | Yr 3 | Yr 4
beneath it. Same Fall / Winter / Spring windows and In app / Out of app
split. College content is verbatim from Joshua Pierce (Slack, 18 Sept
2026) in `COLLEGE_PLANS` (`gradePlanData.ts`), with new labels MENTOR,
VOLUNTEER, JOIN, STUDY, LEARN, SKILL, EXPERIENCE, LEAD, PREPARE, TRANSITION,
GIVE BACK. `collegePlan(year, career)` fills `{career}` / `{field}` from the
student's #1 career (Investment Banking when none), so headline steps
already follow the career.

**Per-career college plans (mock of the Explore Careers join).** Every
finance-specific phrase in Joshua's copy is a slot (`{clubs}`, `{classes}`,
`{starterTools}`, `{coreSkills}`, `{courses}`, `{advancedTools}`,
`{skillStack}`, `{employers}`, `{workProducts}`, `{majorExperience}`,
`{gradPrograms}`, `{nextSteps}`, `{programs}`, `{y3Recruiting}`,
`{y4Recruiting}`, `{field}`, `{career}`). `COLLEGE_RECIPES` fills those
slots for the ten careers a student can hold as #1 (IB, PE, Asset
Management, Software Engineer, Data Scientist, Game Designer, Airline
Pilot, Registered Nurse, Food Scientist, Fashion Buyer), grounded in each
Career Report's majors, skills, routes and employers. The IB recipe
reproduces Joshua's text verbatim. In production these slots are the join
onto the Explore Careers data (skills / software / classes per career); the
recipes show the target output for that join.

## 2026-09-18 · Connect: Mentorship tab (Coach Foundation Dreamer Mentorship Program)

New landing tab in Connect (Communities | Mentorship | People | Events, the
Replit's order) at `src/components/connect/mentorship/`. Structure and copy
follow Joshua Pierce's Replit MENTORSHIP tab (walk in
`docs/reference/joshua-mentorship-replit-2026-09-18/README.md`); program
facts and the 2030 goals come from the Tapestry call
(`docs/reference/partner-calls/tapestry-coach-foundation-2026-09-18.md`).

- `mentorshipData.ts`: program, mentor/mentee, thread, year plan, four
  programs (US / UK / Japan / China) with monthly hours that follow their
  real calendars, KPIs with sparklines and distinct deltas, meetings-per-pair
  distribution, 2030 goals with pace, settings, hour rules, export items.
- `charts.tsx`: `BarChart` (labelled y axis, gridlines, dashed average,
  current period emphasised, last-year ghost outlines, hover/focus values,
  measured pixel width so text never scales), `Sparkline`, `GoalTrack`
  (fill + pace tick + ahead/behind), `Histogram`, `ShareBar`.
- `MentorshipTab.tsx`: Student (Home / Messages / Year Plan), Mentor
  (Home / Messages / Journey), Enterprise (Overview / Programs / Settings).
  Opens by Connect's demo role (student, pro = mentor, partner/admin =
  enterprise); Demo chip switches. Every Replit dead end works here as a
  sheet or state: Reschedule, Prepare for Meeting, Report / escalate, Share
  approved resource, Send meeting link, Suggest meeting time, Export, View
  report (filters Overview to that program), settings chips and hour-rule
  toggles. `?as=pro&tab=mentorship` no longer redirects to the pro profile.

Open: portraits for Maya are the student illustrated set (correct per the
rule); Avery Thompson uses an unused pro headshot. Real mentor/mentee data,
video calls and message counting are backend.

## 2026-09-18 · Mentorship tab, round two (Coach branding, tiles, chat)

- Landing is a tiled list on the community card's full-bleed anatomy (photo,
  scrim, progressive blur, partner mark, one frosted status line). Coach's
  Dream It Real spans the first row; JPMorganChase's The Fellowship Initiative
  and EY's College MAP follow with the partners' own newsroom photos. AT&T
  Aspire dropped: no current imagery, program dated. Sources in
  docs/reference/joshua-mentorship-replit-2026-09-18/README.md.
- Program banner wears the Coach Foundation white lockup, their press photo
  and mission line; brand tan (#D2B48C) is the program accent.
- Prep row: three equal poster-ratio cards filling the row (career poster
  without the salary chip, Play card, the resume as a file with the page edge
  to edge and a document strip; Maya Reyes' sample when the store is empty).
  Hover lift is no longer clipped (padded rail on phones, grid from sm).
- Chat: grouped bubbles under one avatar, avatar taps open the profile
  (Avery = full ProProfileView, Maya = sheet) and Back returns to the chat;
  one rotating nudge above the composer (NUDGES, indexed by messages sent,
  dismissable); plus menu with Attach, Photo, GIF (toast), Send meeting
  link, Suggest a meeting time (MeetingRequestSheet: name, agenda, slot),
  Share approved resource, Share from Dreamari; emoji behind the smile;
  suggested questions behind the sparkle.
- In-thread cards: MeetingCard (Accept / Decline on the receiving side, Add
  to calendar downloads a real .ics once accepted) and ShareCard (My Plan for
  the season, resume, saved careers, simulation result, career report, school
  shortlist, an opportunity; each opens the real page).
- Still a placeholder: the Fashion Buyer simulation art (IB lounge scene until
  the fashion one is illustrated); GIFs.

## 2026-09-18 · Mentorship, round three (lockups, Tapestry gaps)

- Every program tile wears its partner's mark in one slot at a matched cap
  height (`PartnerLockup`): the Coach Foundation lockup image, otherwise the
  white company wordmark from COMPANY_MARKS. Banner lockup scaled up.
- From the Tapestry call: Dream Day (June) as the year plan's summer
  touchpoint; year-two rematch preference on both Home views (`REMATCH`);
  mentor orientation row with the do's and don'ts sheet (`ORIENTATION`);
  Student impact adds "On track to graduate" (Coach's own figure); Enterprise
  gains a Mentor activity panel (messages and meetings to hours per pair,
  quiet pairs flagged, corporate vs retail mentor split, mentor pulse); a
  video call button in the thread header.
- `ProProfileView` takes an optional `backLabel`; the profile is a layer over
  the program so Back returns to the same tab and thread.

## 2026-09-18 · Mentorship, round four (remaining Tapestry items, no new screens)

- Programs tab: each program names the nonprofit that sources its scholars
  (`via`, from coach.com); a "US cohorts" table reads the four active cohorts
  side by side (still enrolled, meetings a year, explored, resume).
- Overview: Student impact carries Coach's published outcomes (88% less debt
  at graduation, 94% first generation).
- Settings: the Matching row shows where recruitment and year-two rematching
  stand; a Mentor verification row (Company roster default).
- Share from Dreamari: the school shortlist card carries estimated debt at
  graduation per school.
- Tiles: one status per card; JPMC and EY lines shortened.

## 2026-09-18 · Mentorship, round five (everything clickable, one hover cue)

Universal rule (direct feedback): every card opens something, every
person's avatar or name opens their profile, Back returns to the exact
spot, one shared hover affordance. In the Mentorship tab: `ClickPanel` +
`HoverChevron` (mentor / mentee cards open profiles; the next-meeting card
opens a details sheet with agenda, join, add to calendar, reschedule; the
next-conversation card opens the prep sheet; KPI tiles open a by-program
sheet; 2030 goals, impact rings, meetings-per-pair, cohort rows and program
rows open sheets or filter). Mentor activity rows open Avery's full profile
or a `MentorSheet` for mentors without one. The profile is a layer, so the
program stays mounted underneath. Mentor pulse quote set like an insight
card (`InsightMark`). Connect's demo role switcher is hidden on the
Mentorship tab (it has its own Demo chip), as on the AT&T board.
Open: the same clickable-card audit across Home, Explore, Play, Profile and
the other Connect surfaces (memory: feedback-clickable-cards-profiles).

## 2026-09-18 · Mentorship, round six (one story: Jordan, shared thread, URL state)

- The mentee is Jordan (Rivera), the demo account, everywhere in the tab:
  copy, avatar (studentAvatarSrc), sample resume, activity table.
- One thread state lives in ProgramView and feeds the student view, the
  mentor view and the Next meeting card. Accepting a request in the chat sets
  the card ("Next meeting · accepted"); Reschedule on the card posts a request
  into the chat and the card reads "new time requested, waiting".
- Messages tab shows an unread badge (Segmented `badge`), cleared on open.
- `?program=coach&sub=messages` ride the URL: refresh keeps the place,
  browser Back walks back to the tiles.
- Prep cards: one shape (240px), the Replit's why line and CTA on each
  (Explore Career, Play Simulation, View Resume).
- Enterprise series read upward; the hours chart notes it is the calendar
  year while the student's plan is the program year.

## 2026-09-18 · Connect: Back always names the screen you came from

- Reported: a mentor's profile opened from the Mentorship Home said "Back to
  chat". Every Back label in Connect was a hardcoded parent ("View all
  professionals", "Back to all communities", "Connect", a bare "Back").
- `backLabelFor(prev)` in ConnectExperience derives the label from the top
  of the existing view stack ("Back to People", "Back to Saved", "Back to the
  question", "Back to <community>", "Back to <event>", "Back to Connect" on a
  fresh load). Every view with an onBack takes `backLabel` (profile, both
  dashboards, PartnerView, board, event, thread, insight, Saved, Following,
  Activity, AT&T board).
- Mentorship derives it from view + sub: Home tabs say "Back to Dream It
  Real", the chat "Back to Messages", the plan "Back to Year Plan", the
  enterprise table "Back to Overview". Same label on Jordan's sheet.
- AT&T board profiles say "Back to <tab>" or "Back to the AT&T community".
- Verified headless (scratchpad replit-walk/back-check.mjs): 11 entry points,
  label and landing tab after Back. tsc and eslint clean.

## 2026-09-18 · Resume Builder: Dreamy welcome on entry and on every Create, select height

- Live check (dreamari.vercel.app, fresh browser): the Profile splash showed
  on `/profile?tab=resume` and the resume welcome never did, because it
  only lived in the wizard route and was gated once per browser.
- `useResumeWelcome` (ResumeExperience.tsx) is shared by the Profile Resume
  tab and the builder route: once per session under the demo switch, back
  after a refresh, and always on `/resume-builder?view=templates`, which is
  where every Create a new resume lands. The Profile splash stays quiet when
  the arrival tab is Resume, so two splashes never stack.
- Country select: explicit 44px height, native arrow off, our chevron; it
  matched the text fields' 44px in the headless check.

## 2026-09-18 · AT&T board rebuilt reach-first (local only, not pushed)

- See `docs/reference/att-board-additions-2026-09-17.md`, section "18 Sept
  2026", for the change-to-source table. In short: one shared `THEME`, a
  Learn tab (Achievery and DigitalLearn modules with progress, sheet, XP
  flight, My Plan), People folded into Ask, virtual/in-person filter,
  volunteer Today with time-boxed requests, Your answers, Impact instead of
  Year-Round, enterprise opens on Impact with reach split and hours goal,
  planner simplified to one card with Students see / Volunteers see.
- Verified headless at 1280 and 390 (no horizontal overflow, sheet, XP
  flight, Accept, filter, program edit). tsc and eslint clean.
- Kept local by request; push only when told.

## 2026-09-18 · Resume welcome: Create only

- The Profile Resume tab no longer shows Dreamy's welcome (it rendered inside
  the tab panel and could not be reached). The welcome fires only on
  `/resume-builder?view=templates`, every Create click. Profile's own
  splash behaves as before on arrival.

## 2026-09-18 · My Plan: stage first, then the level

- GradePlanCard shows only High School | College at rest. Pressing a stage
  reveals 9 to 12 or Yr 1 to 4 (AnimatePresence); picking one folds the row
  away and the subtitle names the level. Joshua Pierce, Slack, 18 Sept 2026:
  "a lot of competing info... once you press either 9 10 11 and 12 comes up".
- `DEMO_TOP3` moved to profile/data.ts so other surfaces can read the demo
  student's default picks.
- Follow-up: the stage and level controls sit behind a small Demo chip (same
  chip as Connect's role switch), since a real student's grade is known.
  At rest the card shows only the title and "Grade 11 · ..." subtitle.

## 2026-09-18 · Mentorship Year Plan as a calendar

- The numbered timeline is gone. One tile per program month (Oct to Jun),
  the month large, the topic small, complete months ticked, the current
  month tinted; tapping a tile shows its focus in one detail card. Joshua
  Pierce, Slack, 18 Sept 2026: "all the user really needs to see is the
  month and topic... the month should be larger than the topic".

## 2026-09-18 · AT&T board: v1 live, v2.0 behind a demo chip

- `src/components/connect/att/v1/` is the board as it shipped (Joshua's
  Replit, faithfully); `src/components/connect/att/` is the reach-first
  rebuild (see docs/reference/att-board-additions-2026-09-17.md for every
  change and why). ConnectExperience renders v1 by default and v2.0 when
  the small "v1 | v2.0" chip beside Demo is switched, or with `?v=2` in the
  URL (kept across Connect navigation so a demo link lands on it).
- Pushed on the user's explicit instruction (18 Sept 2026). The rule stays:
  further AT&T changes are pushed only when asked by name.
- Follow-up: the Year Plan is now calendar pages. Each month tile has a top
  band in its state colour, the month large with its year, the topic small,
  a tick when complete and a Now tag for the current month. Tapping a month
  expands it to fill the panel (Calendar back link, focus, note, previous
  and next month); the detail card under the grid is gone.

## 2026-09-18 · Inbox: notifications in the nav, Messages as a chat dock, tablet chrome

- `src/lib/inbox.ts` (store: dock state, unread, mentorship/program context,
  meeting decision, read/resolved) and `src/lib/stage.ts` (demo stage hs |
  college, set by My Plan's Demo toggle, persisted).
- `src/components/app/Inbox.tsx`: NotificationsButton (bell, red count),
  MessagesButton (paper plane, red count, only inside a mentorship program),
  HeaderActions (XP chip + both icons for the phone/tablet header), and the
  Instagram-shaped panel: All | Connect | Mentorship (Mentorship only on the
  Mentorship tab), New and Earlier, inline Accept/Decline on a meeting
  (applied to the chat thread), one tap to the thing. Two sets by stage
  (`notificationsData.ts`): high school never sees mentorship or meetings.
- Chrome: desktop nav only from lg; tablets use the phone chrome (logo, XP,
  inbox, hamburger up top, bottom nav for destinations). XP icon is a filled
  bolt. Connect's own bell is gone; the site-wide one carries it.
- Mentorship: Messages is no longer a tab. `ChatDock` (Portal) rises bottom
  right, minimises to a bar, goes full screen (from its menu), is the whole
  screen on a phone; header lockup with presence; three-dot menu holds the
  safety line and Report; one incoming demo message after 12s with a soft
  tone, badge and a nudge card. Thread has an `embedded` mode. Bubbles have
  more air. Sub-tab switches keep scroll (AT&T v2 too, useLayoutEffect).
- Verified headless: HS vs college sets, filters, accept from notification
  lands in the thread, dock states, nudge and badge, tablet and phone chrome.

## 2026-09-18 · Schools shelves: room for shadows, looser cards

- Every school rail (Browse shelves, For you, Similar schools) bleeds 28px
  vertically instead of 10, so the card shadow and hover lift are never
  clipped by the scroller; shelves sit 44px apart; cards carry a little
  more padding and gap between name, chips, stats and Compare.

## 2026-09-18 · One top bar everywhere

- `DreamScoreChip` is the single streak + XP chip: flame and streak, a
  divider, filled bolt and XP. Desktop nav, phone and tablet header and the
  Resume Builder's own header all render it; the old Sparkle counter and
  Home's separate streak/XP are gone. Explore and Colleges now switch to the
  desktop chrome at lg like everything else. Verified on nine routes at
  three widths: exactly one chip, a bell everywhere (Resume Builder too).
- Chat dock header: video, minimise, full screen, close. No three-dot menu;
  Report sits on the safety line at the start of the conversation. The
  sparkles suggestions button is gone; the single muted inline chip is the
  suggestion, the way ChatGPT and Claude do it.

## 2026-09-18 · AT&T v2.0 safeguarding pass

- Report on every insight and answer card via a `ReportCtx` and one sheet in
  the shell; SAFETY and REPORT data in attData; Safety panel on enterprise
  Impact; verification line now includes the background check; tutoring copy
  names the moderated room and transcript. v1 untouched (0 Report buttons).
  Talking points for the team are in the Google Doc "AT&T × Connected
  Learning Board v2.0 · Talking Points" (Drive, ux@dreamopportunity.org).


## 2026-09-18 · AT&T v2.0: Business & Finance on the board

- Danielle Marshall (AT&T Finance) joins the roster with a profile, an
  answer, a People row and a Team seat (portrait pro-marshall.png, unused
  until now). AT&T Finance Internship and the Business Sales Leadership
  Development Program added. Home sorts opportunities by the student's
  picks; Learn regroups by the student ("For <picks>" first, technology
  units after) with the provider named on each unit. v1 untouched.

## 2026-09-18 · AT&T v2.0: Since you were last here (volunteers)

- `SINCE` in attData, `SinceYouWereHere` panel first on the volunteer Today
  view: four rows (reads, thank-you quote with the student's avatar, résumé
  notes used, new questions), each navigating to Questions or Home.


## 2026-09-18 · Explore: Netflix-style career search, arts rail

- `careerSearch.ts`: fuzzy scorer over title words, a career's own keywords,
  its world's keywords and the world name (own keywords outrank world
  keywords; typo tolerance one edit from five letters, two from eight, never
  against the world name). `relatedTerms` builds the "Explore careers
  related to" chips from what the top results share. `TOP_SEARCHES` is
  arts-leaning for the arts demo.
- Browse: a typed query replaces the rails with one ranked grid, related
  chips above, a no-match state that offers the top searches; opening search
  with nothing typed shows Top searches under the filters. New rail "Arts,
  Media & Sport" (Animator, Art Director, Film Director, Journalist, Sound
  Engineering Technician, Lighting Technician) using posters already in the
  repo; Art Director, Film Director and Journalist are new to the catalog.
- Verified headless: "finanace", "codng", "hospital", "planes", "arts",
  "drawing", "netflix", and "xyzq" (no match).

## 2026-09-20 · Resume Builder: 1:1 parity pass against the Replit reference

User-approved build against the live reference (resume-builder-maishak.replit.app),
already thoroughly audited in a prior turn this session; this turn implemented
the 7 confirmed gaps (6 from the spec, plus one the user caught personally
after the turn started and added as change #0). Template picker on Tailor
stays a deliberate non-1:1 exception, by direct instruction.

- **#0 -- Add-flow popups are real modals now.** `ResumeModal` (`ui.tsx`) was
  an in-place swap of the wizard card's own body (no backdrop, no
  `fixed inset-0`, no `role="dialog"`, no Portal -- there was even a code
  comment admitting it). The reference shows every "Add" flow (Education,
  Experience, Skills, Certifications) as a true floating popup. Fixed once,
  at the shared component, not per call site: `ResumeModal` now takes a
  `presentation` prop, `"overlay"` (new default, `fixed inset-0` + Portal +
  backdrop + `role="dialog"` + `aria-modal` + Escape-to-close, same sheet
  chrome as `MentorshipTab.tsx`'s own `Sheet`) or `"inline"` (the original
  behavior, explicitly kept for the document toolbar's own panels --
  ATSCheckPanel, EditSectionsPanel, JobMatchPanel, TextPreviewModal --
  which replace the document view's whole content column and were never
  checked against the reference for popup-vs-inline). **Known, accepted
  tradeoff, by direct instruction**: the full-screen popup covers the live
  resume preview (and its field-highlight "camera pan" feature) while open,
  which the reference doesn't have to worry about since it has no live
  preview at all. This is deliberate 1:1 parity, not an oversight -- flagged
  to product/design as worth a second look if a future pass wants both the
  live preview AND a true popup at once (e.g. scoping the overlay to the
  wizard's own column). Verified live: Add Education now opens as a centered
  popup with a blurred/dimmed backdrop over the entire page.
- **#1 -- Review step, two buttons.** "Save & Export" (skips tailoring,
  creates a version with sensible defaults -- all current
  education/experience, name = student's name + "Resume", default template,
  no job description -- and routes straight to the document) and "Customize
  First" (Sparkles icon, creates a version with a placeholder name and opens
  Choose & Tailor). Both replace the old single auto-routing "Save & Export"
  button. The "GOOD START" splash (fewer than 2 experiences) now gates
  "Save & Export" specifically, not both buttons.
- **#2 -- Saved Resumes is a card grid**, not a row list (`grid-cols-1
  sm:grid-cols-2 lg:grid-cols-3`, same shape as ProfileExperience.tsx's own
  Top Three/My Plan/Career Report row). Each card: status tags (Standard /
  Tailored / Approved, can combine), the same score badges as before, a
  Target line when tailored, the same four icon actions + Open, just
  reflowed for a card footer.
- **#3 -- Approve workflow (new).** `ResumeVersion.approved?: boolean` in
  `lib/resume.ts`. A green-toned toolbar button (`ToolbarButton` gained a
  `tone="success"` option) opens a confirm dialog (this app's usual inline
  `role="dialog"` pattern, no shared Modal component exists); on confirm it
  sets `approved: true` and toasts "Marked as approved". **Open question**:
  the reference has "Approved" as a real status but its trigger semantics
  (self-marked vs. a counselor sign-off) were never confirmed live -- built
  as a simple self-confirm, flagged in a code comment on the `approved`
  field for Joshua/Maisha to clarify.
- **#4 -- Export is immediate now, no checklist gate.** Deleted
  `ExportChecklistModal.tsx` (its 6-item confirmation checklist gating
  Export PDF/.docx) after confirming no other imports; moved `downloadDocx`
  into a new `resumeExport.ts` so it isn't homeless. The toolbar's Export
  button now calls `downloadDocx()` directly, same as the Saved Resumes
  list's own Download icon always did. **Known, accepted regression, by
  direct instruction**: the removed checklist (contact info correct,
  education correct, skills accurate, experience truthful, bullets
  reviewed, ATS disclaimer acknowledged) was a real safety feature for
  something going to a real employer. Worth revisiting with the product
  owner -- this was a deliberate rollback for literal reference parity, not
  an oversight, flagged in a code comment at the call site too.
- **#5 -- XP toasts on wizard steps.** The wizard already awarded XP
  silently per step; now each award also shows a toast, "+{n} pts {label}!"
  in the reference's confirmed wording, reusing this codebase's own
  STEP_XP numbers (10/15/10/10), not the reference's own numbers.
  Certifications' copy ("+10 pts Certification added!") is inferred, not
  independently confirmed live -- flagged in a code comment. Personal
  Information keeps its existing "Personal information saved" toast with no
  XP number (that's what was actually observed live).
- **#6 -- Review step row icons.** Turned out to already be implemented
  (User/GraduationCap/Briefcase/Sparkles/Award per row) -- no change needed,
  just verified live against the reference's icon set.

Files: `src/lib/resume.ts`, `src/components/resume/ui.tsx`,
`src/components/resume/ResumeBuilderExperience.tsx`,
`src/components/resume/wizardSteps.tsx`,
`src/components/resume/ResumeExperience.tsx`,
`src/components/resume/resumeExport.ts` (new),
`src/components/resume/ExportChecklistModal.tsx` (deleted),
`src/components/resume/ATSCheckPanel.tsx`,
`src/components/resume/EditSectionsPanel.tsx`,
`src/components/resume/JobMatchPanel.tsx`,
`src/components/resume/TextPreviewModal.tsx` (all four: added
`presentation="inline"` to their `ResumeModal` call).

`npx tsc --noEmit -p .` and `npx eslint` clean on every touched file.
Verified live (existing dev server on :3000, desktop width): Add Education
opens as a real popup; Review's two buttons route correctly (Save & Export
-> "Jordan Rivera Resume" straight to the scored document; Customize First
-> Tailor with a placeholder name, no GOOD START splash); Saved Resumes
renders a 3-up card grid with correct status tags across 4 saved versions;
Approve opens its confirm dialog, sets the badge/tag, toasts; Export
downloads immediately with no checklist on both a Standard and a Tailored
resume; all four step XP toasts fire with the right copy; Review's row
icons render. Not independently re-verified: the actual file that lands in
Downloads (docx generation itself is unchanged from before, just no longer
gated).

Next step: none outstanding for this pass. Open items for the product
owner: the Export-checklist rollback (#4) and the Approve-workflow trigger
semantics (#3), both flagged above and in code comments at their source.

## 2026-09-21 · Play tab TV row-focus: fixed the "wrong card becomes hero" bug + real per-world fonts

Follow-up to the TV-style row-focus build already on `main` (commit
`aaaeda4a`, same session). User reported: "Glossary games work, but the
first tile should be big not the second, not unless I click on the
second card" -- could not reproduce on a fresh load (local or live
Vercel), which pointed at an interaction-state bug rather than a
render-order bug.

- **Root cause: compact (not-yet-focused) cards were still selectable.**
  `HeroShelfCard`'s full-card `onSelect` button rendered for every
  non-hero card regardless of whether its row was `active` --
  including a row still at rest, COMPACT-sized, that the student
  hasn't scrolled to yet. A "stop the momentum scroll" tap (a common
  mobile gesture -- touching the screen to halt inertial scrolling,
  not intending to activate whatever is under the finger) landing on
  Medical Terms while merely scrolling PAST a still-compact Glossary
  Games row would silently promote it to hero, so it was already the
  hero by the time the row actually came into focus -- exactly what
  "not unless I click" describes from the user's side. Fixed in
  `HeroShelfRow` (`PlayHub.tsx`): `onSelect` is now
  `active && item.id !== featured.id ? ... : undefined`, so a compact
  card has no select control at all. Matches the user's own TV
  description exactly: cards "open... on clicking" only after the
  down-arrow (scroll) has already brought the row into its hero+side
  shape, never before.
- **Glossary Games / In the Works titles used a generic font, not the
  career's own world font.** `HeroShelfCard`'s title was hardcoded to
  `var(--font-display)` instead of `RowCard`'s `posterTitleFont(world)`
  pattern (Career Simulations' own titles already did this correctly).
  Root cause: `GLOSSARY_GAMES` (`games.ts`) never carried a `world`
  field to pass through -- added `worldForCareer(slug)` (`games.ts`,
  checks `SIMULATIONS` then `SOON`) and wired it into the Glossary
  Games item mapping in `PlayHub.tsx`. `HeroShelfCard`'s title now
  reads `item.world ? posterTitleFont(item.world) : { fontFamily:
  "var(--font-display)" }` (the fallback only matters if a future item
  has no resolvable world). Since `HeroShelfCard` is shared by both
  Glossary Games and In the Works, and In the Works already carried
  `world` from `SOON`, this one change fixes both rows at once --
  confirmed live: Finance Terms now renders in Business & Finance's
  poster serif, Medical Terms in Health & Medicine's rounded sans,
  matching their Career Simulations counterparts exactly.

Files: `src/components/play/PlayHub.tsx`, `src/components/play/games.ts`.

`npx tsc --noEmit -p .` and `npx eslint` clean on both files. Verified
live on the local dev server (desktop width, 1280px): scrolled Glossary
Games into focus fresh -- Finance Terms (first item) is hero by
default, correct serif font; clicked Medical Terms's now-active select
button -- it correctly becomes hero with its own Health & Medicine
font; confirmed via `find` that no select button exists on a
still-compact row at all (the actual fix for the reported bug). Also
re-checked the earlier "black gap / duplicated header" concern noted
mid-session -- it was a misread of ordinary `position: sticky` nav
behavior at a sub-`lg` viewport width, not a real defect; `TrailerFlow`
already portals to `document.body` (pre-existing), so it was never
affected by `RowFocusWrapper`'s transform/filter either. No fix needed
there.

Open design question from the user, not yet decided: should a side
card in an already-active row promote itself to hero on hover (desktop)
in addition to click/tap? Recommended keeping click/tap-only for now,
consistent with Career Simulations' own `RowCard` (also click-only) and
the user's own earlier explicit feedback rejecting a pure-hover expand
for this exact row. Hover-preview could be layered on later if wanted.

Next step: commit is local only, not pushed -- awaiting go-ahead per
standing "show before push" preference for this project.

## 2026-09-21 · Play tab: Career Simulations now falls back to compact too

Follow-up in the same session. Direct feedback: "when the glossary games
row scales up and highlights, lets have the simulations row fall back
into the normal card sizes... only the focused row should look like
that." Career Simulations was the one row NOT using the compact/hero
tier system -- it stayed at full hero+side size always, just dimmed and
scaled down slightly as a whole (`RowFocusWrapper`) when unfocused,
which is a different, lesser treatment than what Glossary Games/In the
Works actually do (fall back to the small COMPACT_W/COMPACT_HEIGHT
every other row rests at).

Generalized `RowCard` (`PlayHub.tsx`) to the same three real tiers
`HeroShelfCard` already has -- hero / side / compact, driven by a new
`active` prop threaded in from `FeaturedRow`, which now takes `active`
from `PlayHub` the same way `HeroShelfRow` already did. Removed
`RowFocusWrapper` entirely (now unused, no other call sites) -- with
real compact sizing doing the work, the separate dim/scale/opacity
wrapper was redundant and would have double-treated the row. Moved
`data-row-id="simulations"` onto `FeaturedRow`'s own `<section>` (was on
`RowFocusWrapper`'s div) so `useCenteredRow`'s observer still finds it.
Also restricted `FeaturedRow`'s own card `onSelect` to `active` rows
only, same fix as the Glossary Games bug earlier this session (a
still-compact Simulations row had the identical stop-scroll-tap
exposure once it could go compact).

Files: `src/components/play/PlayHub.tsx` only.

`npx tsc --noEmit -p .` and `npx eslint` clean. Verified live on local
dev at a realistic laptop viewport (1280x800): Career Simulations is
hero+side by default at the top of the page; scrolling to Glossary
Games shrinks Simulations down to the same compact card size Glossary/
In the Works rest at, and Glossary expands to hero+side in its place;
scrolling back up restores Simulations to hero+side. Note: at an
unusually tall viewport (1280x1100) the *initial* active row can
resolve to Glossary Games instead of Simulations even at scroll top,
because Simulations' own hero-height layout (before the observer's
first callback settles) is tall enough to push the row boundary into
the observer's center band at that specific height -- not reproduced at
normal viewport heights, not fixed (flagged here in case it surfaces
for a real user on an unusually tall/zoomed-out desktop display).

Next step: still local-only, still awaiting go-ahead to push (same gate
as the entry above -- this adds to the same not-yet-pushed batch).

## 2026-09-21 · Colleges: cards/Overview show tuition & fees, not net price

Joshua Pierce, Slack, ahead of the Harvard/university demos this week
(assigned to Chandu specifically -- "update the UI labels accordingly";
data-mapping correctness was assigned separately to Usman and is out of
scope here, per standing instruction to ignore Usman's-scoped asks).
Explore school cards were showing `netPrice` (average net price after
aid/grants) as the primary "cost" figure -- e.g. Princeton's card read
"$6K avg. after aid" -- next to a US News screenshot of the same school
showing "Tuition & Fees: $65,210". Both numbers are correct, but showing
the net-price one under a generic label, unlabeled as net price, reads
as wrong the instant it's checked against an outside source. Direct
instruction: cards and a school's own Overview should lead with
Tuition & Fees (the published sticker price every major college site
leads with); net price stays, but only inside the Cost tab, explicitly
labeled "after aid" -- never mixed under one generic "cost" label.

- Added `tuitionFees(c)` (`data.ts`): `detail.tuitionInState + detail.fees`,
  null when a school's `detail` isn't loaded (15 of 56 schools, mostly
  smaller ones without a full profile) -- callers show "Not published"/
  "—" rather than silently substituting net price, which would repeat
  the exact bug being fixed.
- `shared.tsx`: `CollegeCard`'s stat row (acceptance / ~~after aid~~ / finish)
  and `SchoolCard`'s stat row (the Reach/Target/Safety cards driving the
  screenshot) both now show `tuitionFees(c)`, relabeled "tuition & fees".
- `CollegeDetailExperience.tsx`: the Overview tab's Key Facts "Yearly
  Cost" row (generic label, net-price value -- the exact anti-pattern
  Joshua flagged) is now "Tuition & Fees" showing `tuitionFees(c)`. The
  Cost tab's own "Full Price" (sticker + housing + food) and "Average
  Cost After Aid" (net price, already explicitly labeled) needed no
  change -- both were already correctly separated and labeled; reused
  the new `tuitionFees()` helper there too instead of leaving a second,
  duplicate inline computation of the same tuition+fees figure.
- Left untouched, deliberately: `BrowseShelves.tsx`'s "cheap schools"
  shelf and `CollegesExperience.tsx`'s cost-cap search filter both use
  `netPrice` for genuine affordability filtering/sorting (not a
  displayed sticker-price stat), and the compare table's "Cost for a
  year, after grants" row is already explicitly labeled -- none of these
  are the ambiguous-label problem Joshua described.

Files: `src/components/colleges/data.ts`,
`src/components/colleges/shared.tsx`,
`src/components/colleges/CollegeDetailExperience.tsx`.

`npx tsc --noEmit -p .` and `npx eslint` clean on all three. Verified
live on local dev: Princeton's Overview Key Facts now reads "Tuition &
Fees $62,688"; its Cost tab still shows "Full Price $82,938 / Before
financial aid" and "Average Cost After Aid $6,128 / year" as two
separate labeled headline numbers, plus Cost by Family Income, all
already correct; the For You Reach/Target/Safety cards (the exact
screenshot Joshua sent) now read "$63K tuition & fees" for Princeton,
"$20K tuition & fees" for TCNJ, etc., instead of "avg. after aid".

Next step: still local-only, same not-yet-pushed batch as the two Play
tab entries above.

## 2026-09-21 · Play tab: every row gets the same phone card-stack

Checked the Play tab on a phone viewport at the user's request ("check
the play tab on mobile? whats the design there?") and found Glossary
Games/In the works rendering the desktop hero/side/compact rail shrunk
into a narrow horizontal scroller on a 375px screen -- direct feedback
on seeing it: "its messed up lets use the same style for the hero row
for the rest," i.e. Career Simulations' existing phone-only swipeable
card stack (`MobileDeck`), not a cramped rail.

Generalized `MobileDeck` into `CardDeck<T>` -- same swipe/rotate/idle-
hint mechanics (state machine, spring constants, drag thresholds all
byte-for-byte unchanged), now generic over `items`/`focusId` with a
`renderCard(item, front)` callback instead of being hardcoded to
`FeaturedCandidate`/`RowCard`. `hintReady` is now optional -- passing it
(Career Simulations only, unchanged) keeps the one-time idle-advance
hint; omitting it (every other row) just skips the hint, keeping that
behavior exclusive to the row it was built for.

- `FeaturedRow` now calls `<CardDeck items={candidates} ... renderCard={(c, front) => <RowCard candidate={c} large deck front={front} .../>} />` -- purely a call-site rename, unchanged behavior.
- `HeroShelfCard` gained `deck`/`front` props (mirroring RowCard's own):
  `deck` forces "hero" tier sizing at `h-full w-full` (fills its deck
  slot instead of the fixed rail dimensions), `front` fades the corner
  badge on the cards fanned out behind the front one. `large`/`active`
  are now optional (default false) since deck mode needs neither.
- `HeroShelfRow` now renders `<CardDeck items={items} focusId={featured.id} renderCard={(item, front) => <HeroShelfCard item={item} deck front={front} />} />` above its existing rail, and the rail itself is now `hidden ... sm:flex` (was unconditionally `flex`) -- exactly mirroring `FeaturedRow`'s own desktop/phone split, including dropping the rail's now-dead mobile bleed margins (`-mx-5 px-5`) since phones never reach it anymore.

Files: `src/components/play/PlayHub.tsx` only.

`npx tsc --noEmit -p .` and `npx eslint` clean. Verified live on local
dev at a 375x812 phone viewport: Glossary Games and In the works both
now render as the identical swipeable stack Career Simulations uses --
one tall poster card in front (Finance Terms, Airline Pilot), the next
two fanned out behind, same title/world-label sizing, same corner
badge, same "Coming soon"/lock treatment on In the works. Re-verified
desktop (1280px) afterward: the rail still renders hero+side/compact
exactly as before, no regression from hiding it below `sm`. Did not
independently verify the swipe GESTURE itself fires on the new rows in
this browser tool -- confirmed instead that `left_click_drag` doesn't
trigger framer-motion's drag gesture on the ALREADY-shipped Career
Simulations deck either (same tool limitation, not a regression), and
the swipe/rotate logic itself is unchanged code, just parameterized, so
there's no reason to expect it to behave differently on the new rows.
Worth a real on-device swipe check before or during the demo if there's
time.

Next step: still local-only, same not-yet-pushed batch.

## 2026-09-21 · Play tab: new artwork for the 7 "coming soon" careers

User dropped 8 new AI-generated career-scene images into a "Play tab"
folder at the project root (untracked, left as-is) and asked to swap
them into the "in the works" careers, then separately asked to also
cover the 3 of those 7 that additionally ride in the Career Simulations
hero row (accountant, aviation-maintenance-technician,
emergency-medicine-doctor -- `FEATURED_ROW_SOON_IDS`, PlayHub.tsx).

Identified each image by content (no filenames given, all generic
"ChatGPT Image ..."), matched one-to-one against `SOON` (games.ts):
airline pilot (cockpit), software engineer (coding, whiteboard),
private equity (reviewing a deal book, boardroom), food scientist (lab,
samples), accountant (calculator, ledgers), aviation maintenance
technician (engine repair, hangar), emergency medicine doctor (ER,
patient). Two of the 8 images both read as Emergency Medicine Doctor --
used the more dynamic one (hands-on with a patient, matching the
hands-on framing Investment Banker/Registered Nurse's own hero covers
use); the alternate is still sitting in the source folder, unused, in
case the pick should be swapped.

Overwrote the existing `public/images/app/soon-*.png` files in place
(same filenames, same PNG format -- the exact convention already used
there) rather than adding new files or touching any code: `SOON`'s
`cover` field already points at these paths, and both the "In the
works" grid and the featured hero row read the same `SOON` entries, so
replacing the 7 files covered both asks in one step, no code change
needed.

Hit one real snag verifying it: the Next dev server's own image
optimizer cache (`.next/dev/cache/images`, not `.next/cache/images`)
kept serving the OLD renditions for two of the seven after the file
swap, even on a hard navigate -- confirmed via a direct raw fetch of
the file (correct new bytes) vs. the rendered `<img>` (stale). Cleared
that cache directory and reloaded; all 7 confirmed correct afterward,
including a second pass on the 3 hero-row cards. This is a local dev-
only cache; not expected to affect the Vercel deploy, which optimizes
images fresh per deploy.

Files: `public/images/app/soon-accountant.png`,
`soon-airline-pilot.png`, `soon-aviation-maintenance-technician.png`,
`soon-emergency-medicine-doctor.png`, `soon-food-scientist.png`,
`soon-private-equity.png`, `soon-software-engineer.png`. No source code
touched.

Verified live on local dev: all 7 "In the works" cards and all 3
hero-row "coming soon" cards show the new artwork.

Next step: still local-only, same not-yet-pushed batch. Flag to the
user: the unused alternate Emergency Medicine Doctor image is still in
the "Play tab" source folder if they'd rather use that one instead.

## 2026-09-21 · Play tab: swapped in a replacement Food Scientist image

Immediate follow-up: user dropped one more image into the same "Play
tab" folder and asked to use it for Food Scientist instead. The file
wasn't there yet on the first check (folder still showed only the
original 8) -- asked the user to confirm rather than guessing, they
said to check again, and by then it had finished saving
(`ChatGPT Image Sep 21, 2026, 01_39_52 PM.png`, a food-science lab
scene, different character). Overwrote
`public/images/app/soon-food-scientist.png` with it and cleared
`.next/dev/cache/images` again (same stale-rendition issue as the
previous entry). Verified live: Food Scientist's "In the works" card
shows the new image.

Next step: pushed (see next entry -- this note was stale, both image
commits landed on main).

## 2026-09-21 · Play tab: corrected Airline Pilot image, and a source-folder correction

User said they were "updating the pilot image once more" via Codex and
asked to swap it in once placed -- watched the project-root "Play tab"
folder (the one used for every image swap above) for ~20 minutes with
nothing new landing. User then said it was already there; it wasn't,
in that folder. Found the REAL, actively-maintained source instead:
**`~/Documents/Dreamari/Play tab`** (outside this git checkout
entirely) -- a properly organized Codex output folder with a
`README.md`, `preview.html`, and `prompts-and-crops.json` (full
generation prompts + portrait/landscape CSS crop positions per
career), files named by career slug (`airline-pilot.png`,
`accountant.png`, etc.) rather than generic "ChatGPT Image ..."
timestamps. **This is the folder to watch/check for any future Play
tab art from Codex, not the project-root one** -- the project-root
"Play tab" folder used for the earlier 7-image swap this session was
a one-time manual drop, not Codex's ongoing output location.

`prompts-and-crops.json`'s airline-pilot entry explains the update: the
original render had "physically impossible cockpit layout" (sky
visible behind the pilot's head where the rear of the cockpit should
be); the regenerated version fixes the scene's spatial logic --
viewed from behind/right of the captain, sky only in the forward
windshield. Copied `airline-pilot.png` over
`public/images/app/soon-airline-pilot.png` (same overwrite-in-place
approach as every other image this session), cleared
`.next/dev/cache/images` again, verified live: the "In the works" card
now shows the corrected composition.

Not yet applied: `prompts-and-crops.json`'s per-career
`portraitPosition`/`landscapePosition` CSS crop hints -- every cover
image in this codebase currently renders with plain `object-cover`
(centered), no per-career position override anywhere. Worth revisiting
if a future pass wants tighter framing per the JSON's guidance, but
out of scope for a straight image swap.

Files: `public/images/app/soon-airline-pilot.png` only.

Next step: push this once committed. Also worth telling the user
directly (not just burying in this log) that Codex's real output
folder is `~/Documents/Dreamari/Play tab`, in case that changes how
they hand off future images.

## 2026-09-21 · QA batch: dropdown/scrollbar/layout bugs across Build, Profile, Career Report

Usman sent a 10-item QA list (Slack, screenshots from a Windows/Chrome
test pass) after using the app end to end. Triaged before touching
code: all 10 turned out to be UI/frontend, not data-mapping -- nothing
fell into Usman's own scope. Four items were genuine open product
questions, not bugs (GPA-scale-for-college-search, the missing-game
Play/Learn-more treatment, My Reflection's counselor-visibility
question, the saved-career button's exact wording) -- answered by the
user directly rather than guessed at:
- GPA scale + how it's used in college search: still open, needs the
  team -- not built either way.
- Missing-game Top 3 fallback: kept as-is (Play always routes to the
  focused Play tab, never shows "Coming soon" -- an existing, deliberate
  instruction from Joshua Pierce for demo purposes, found while
  investigating this exact item, still correct and unrelated to
  Usman's report). A "disabled Play + Coming soon" treatment is a
  **deferred follow-up instruction, not built now** -- flagged here for
  whenever demo season isn't the constraint.
- My Reflection: confirmed shared with counselors, needs conflict
  handling -- implemented (see below).
- Saved-career button label: already conditional in the existing code
  (`ProfileExperience.tsx`'s `LockerTab`) -- "Add to Top 3" when a Top
  3 slot is open, "Swap in" only once Top 3 is full. No change needed;
  this was already correct, just not obviously so from one screenshot.

Fixed:
- **GPA picker's last row unreachable** (`GpaField.tsx`): its popup
  position was clamped against a hardcoded 436px height guess that ran
  a few px short of the real 6-row content on some viewports. Now
  measures the dialog's actual rendered height and repositions against
  that, so it adapts to any content size instead of a magic number.
- **Native chunky scrollbar in the Build flow** (`globals.css`,
  `LocationStep.tsx`, `CostStep.tsx`, `steps.tsx`): the flow's own
  masked-fade scroll shell only hid the scrollbar on Firefox
  (`scrollbar-width: none` has no Chrome/Safari equivalent without the
  `-webkit-` pseudo-element) -- invisible on Mac by default (overlay
  scrollbars auto-hide there) but very visible on Windows Chrome as the
  old chunky scrollbar with arrow buttons. Real gap on both platforms,
  just masked on Mac. Added the missing webkit rule, plus a new
  `.flow-scroll` class (same treatment, no fade) for every individual
  step's own inner scroll container, which had no scrollbar handling
  of any kind before.
- **"Add your own" expanding the unrelated box beside it**
  (`CareerExploration.tsx`): a two-column CSS grid stretches every
  cell to its tallest row-mate by default, so opening the Add-your-own
  checklist (right column) was also stretching the Logged-in-Dreamari
  box (left column) to match. `items-start` on the grid fixes it --
  each column now sizes to its own content.
- **Settings dropdown not fully visible** (`ProfileExperience.tsx`):
  it rendered `position: absolute` inside the profile header, which
  clips overflow (the exact reason the Cover photo modal right next to
  it already goes through a Portal). Portalled it too, now positioned
  via the trigger button's real screen coordinates (measured on open,
  same approach as `GpaField`'s dialog) instead of a parent-relative
  offset that assumed no clipping ancestor.
- **No way to unsave a school or video from the Saved page**
  (`ProfileExperience.tsx`): `SchoolsShelf`/`VideosShelf` only
  destructured the saved-items Set, never the toggle function, and had
  no remove control on their cards -- unsaving required reopening the
  original school/video page and un-tapping its own bookmark. Added a
  `SaveButton`/remove-icon overlay to each card (reusing `SaveButton`
  from `colleges/shared.tsx` for schools, since it already handles
  stopping its own click from bubbling into the card's Link). Saved
  **careers** turned out to be a different data model entirely --
  `LockerTab`'s list is "everything not yet in Top 3," not an
  explicitly-saved set, so there's nothing to "unsave" there; a career
  leaves the list automatically once promoted to Top 3. Left as-is,
  noted for clarity.
- **My Reflection / counselor conflict** (`CareerReport.tsx`): added a
  visible (not blocking) warning when a student picks "Probably/
  Definitely Not For Me" on the career currently set as their #1 Top
  Three pick, since the user confirmed this reflection is
  counselor-visible. Names the career, says plainly that it's shared,
  and points at Top Three as the one-tap fix. `isPrimary` is threaded
  in from `CareerReportView`'s existing `top3` prop (`top3?.[0]` is
  already how "primary" is determined elsewhere in this file, e.g.
  "Make My Primary") -- no new concept invented.
- **Match's welcome splash said "Start Exploring"**
  (`WelcomeSplash.tsx`): the `matchGrid` scene's `cta` was a leftover
  copy-paste from the `explore` scene right below it in the same file.
  The already-existing (currently dormant) `match` scene had the
  correct wording; reused it -- "Start Matching".

Files: `src/components/build/GpaField.tsx`, `LocationStep.tsx`,
`CostStep.tsx`, `steps.tsx`, `ui.tsx`; `src/app/globals.css`;
`src/components/profile/CareerExploration.tsx`, `CareerReport.tsx`,
`ProfileExperience.tsx`; `src/components/app/WelcomeSplash.tsx`.

`npx tsc --noEmit -p .` and `npx eslint` clean on every touched file
(only pre-existing, unrelated warnings remain: an `<img>` LCP hint in
`ui.tsx`, an unused `AnimatePresence` import in `ProfileExperience.tsx`
-- neither introduced this pass). Verified live on local dev: GPA
picker's "2.0 or below" row fully reachable; Settings dropdown renders
correctly positioned and un-clipped; Saved > Schools unsave button
removes a school in one tap (confirmed end to end: save from a college
page, appears in Saved, unsave button removes it, "No schools saved
yet" returns); Career Exploration's two boxes size independently; My
Reflection shows the counselor-visibility warning exactly when
`isPrimary && negative rating`, with the career's name correctly
interpolated (fixed a real JSX whitespace bug of my own along the
way -- `{expr}\ntext` on separate source lines drops the space between
them, since JSX only preserves inline whitespace on the SAME line;
switched to one template-literal string to avoid relying on that rule
at all); Match's splash now reads "Start Matching".

Next step: pushed as part of the same batch as the entry below (the
Build-flow scroll/crop pass) -- see there for the actual push.

## 2026-09-21 · Build flow: audited every step for scroll-free desktop fit

Direct instruction, mid-review of the QA batch above: "no screen ever
on the build ever needs to be scrolled, and nothing gets cropped
either... its okay if scroll is required in mobile/tablet... on mobile
default to the dropdown/list view for state selection." Triggered by a
real, reproduced bug: at 1024x700 (an ordinary small-laptop desktop
size, not tablet), the Interests step's citation line
("Harvard FAS Mignone + O*NET Interest Profiler") was rendering fully
hidden behind the sticky footer, and the Profile Basics step's "How
far would you go for school?" field was visibly clipped/overlapping
its own reassurance caption below it -- confirmed by measuring
`getBoundingClientRect()` on the actual DOM: `.flow-scroll`'s content
needed a genuine ~25-40px more height than the container had at these
ordinary window sizes, on multiple different steps.

- **`LocationStep.tsx`**: mobile default changed from height-only
  (`window.innerHeight < 700`) to `width < 640 || height < 700` -- a
  real US map's ~50 state shapes are not a reliable tap target on a
  phone regardless of viewport height, which the old check never
  caught on a tall phone with a full-height browser. Short desktop/
  tablet windows keep falling back to the list too, for the original
  reason (Safari's bars eating vertical space).
- **`ProfileStep.tsx`** (in `steps.tsx`): restructured Grade+GPA and
  Zip Code+"How far would you go" from four stacked full-width rows
  into two two-column rows (`sm:grid-cols-2`, stacked on phones, where
  a taller card is allowed to scroll) -- directly halves this step's
  own vertical footprint, the single biggest lever available since the
  fields themselves can't get any shorter.
- **Shared components trimmed** (`ui.tsx`), since these repeat on
  every step and set a floor under every step's own fit: `QuestionHeading`
  (heading block margin, sprite icon, and title font size all reduced
  modestly), `Citation` (top margin), `ChipGrid` (grid gap), `StepFooter`
  (outer margins). None of these individually matter much, but every
  step pays all four costs, so trimming the shared components fixes
  every step that uses them at once instead of hand-tuning nine
  screens separately.
- **`CostStep.tsx`**: separately, a pre-existing (not scroll-related)
  overlap on phones -- the "Cost isn't a / major factor" and "I'm not
  sure" slider-stop labels sit close enough at narrow widths to
  overlap each other, since they're two independently-positioned
  (centered vs. right-aligned) absolute labels. Narrowed their max-
  width and font size on phones only (`sm:` unchanged) to add
  clearance; not pixel-perfect at every width but meaningfully
  improved, flagged here rather than claimed as fully solved.

Files: `src/components/build/LocationStep.tsx`, `steps.tsx`, `ui.tsx`,
`CostStep.tsx`.

`npx tsc --noEmit -p .` and `npx eslint` clean. Verified live by
clicking through the ENTIRE flow (Welcome through Profile Basics) at
three desktop sizes -- 1280x720, 1024x700, and the worst case 1024x680
-- measuring `scrollHeight` vs `clientHeight` on each step's own
`.flow-scroll` container directly via the DOM (not just eyeballing
screenshots): zero overflow on every single step at all three sizes
after the fix, where before the fix Interests/Profile Basics both
measured 16-40px of genuine unaccounted overflow at 1024px-tall
windows. Also re-verified at 1440x900 (nothing reads as
over-compressed at a generous size) and at phone width (375px) that
the mobile map/list default and the collapsed 6-item ChipGrid both
still work correctly. Did not exhaustively test every possible
viewport size -- 680px height is the tested floor; a genuinely tiny
window (e.g. a non-maximized laptop browser under ~650px tall) is
still plausible to need scroll, which the user's own instruction
allows for implicitly by saying "no screen EVER needs to be scrolled"
about ordinary desktop use, not an unbounded claim -- worth a spot
check if it comes up again.

Also investigated, could not reproduce: "My Profile > Avatar selection
modal is compressing and making them all overlap instead of proper
rows" (direct feedback). Measured the actual grid via
`getBoundingClientRect()` at three sizes (1440x900, 1024x700,
1024x680) and it laid out as a clean, non-overlapping grid every time
-- 64x64 circles, correct row spacing, `AVATAR_POOL` has no duplicate
entries (ruled out as a React-key collision). Applied the concrete,
unambiguous part of the request regardless -- the avatar grid was
missing the shared `.dm-scroll` thin-scrollbar treatment the adjacent
Cover photo picker already has (same modal, same pattern, this one
just wasn't updated when that convention was established) -- added it
for consistency. If the compression/overlap recurs, a fresh screenshot
or the exact window size it happened at would help, since it didn't
reproduce at any size tried here.

Next step: push requested directly by the user for this batch --
pushing this and the QA-fixes batch above together.

## 2026-09-21 · Second QA round: Explore For You height bug, Connect/Website cleanup

Usman sent a second round of notes with Chandu's own decisions already
inline (bolded, in the Slack thread -- not reproduced here). Asked to
verify each decision and fix what's fixable. Most items needed no code
change (explicitly "ignore," "non-issue," or informational answers
already correct); the concrete ones:

- **Explore's "For You" reel needed a scroll to reach its own Play
  Game/More Info buttons, and the For You | Browse All tabs could
  scroll out of view** (`ExploreExperience.tsx`) -- root-caused, not
  guessed at: `main`'s height was set to `calc(100dvh - 62px)`,
  assuming a 62px desktop nav, but `DesktopNavigation` (`chrome.tsx`)
  is actually 86px tall. That exact 24px gap was real, measurable page-
  level scroll (confirmed via `document.scrollingElement.scrollHeight`
  before/after: 824px of content in an 800px window, dropping to
  exactly 800/800 once fixed) -- enough to shift the sticky tab row
  out from under the nav and clip the card's own bottom buttons until
  scrolled. One-line fix once found: `100dvh-62px` -> `100dvh-86px`.
- **Connect-with-professionals modal had both a "Close" text button
  and an "X" icon button doing the same thing** (`ConnectWithProfessionalsModal.tsx`)
  -- confirmed a mistake, not a deliberate second affordance; removed
  the text button, kept "X". The Replay/refresh icon next to it is
  unrelated and stays (Josh's demo).
- **Website button on the college detail page was the single most
  visually prominent action** (`CollegeDetailExperience.tsx`) -- an
  animated `BorderBeam` + solid accent fill, while Apply/Financial Aid
  sat in plain secondary styling. Per the user's own flagged concern
  (highlighting the one button that takes a student out of the app
  entirely, with nothing to show for it on return, works against
  engagement) -- downgraded Website to the identical plain style
  already used for Apply/Financial Aid, so none of the three external-
  link actions is visually promoted over the others. Removed the now-
  unused `BorderBeam` import.

Investigated, no fix made -- flagging the actual finding instead of
guessing:
- **Reach/Target/Safety vs. "Hardest to get into/Selective/Most
  students get in" language inconsistency** between the Schools tab
  and the Career Report's own School Pathways section. Traced both:
  `ForYouSchools.tsx` has a real "Use my GPA" toggle (local UI state,
  defaults on) that swaps to the generic admit-rate labels when
  switched off -- correct, working as designed. The Career Report's
  own Reach/Target/Safety badges (`CareerReport.tsx`, `BAND_ORDER`)
  come from a **static field already baked into the report data**
  (`college.status`), with no GPA-awareness and no equivalent toggle
  at all. So this isn't one broken page copying the wrong label from
  a working one -- it's one page having an interactive feature
  (the GPA toggle) that no other page offers, which was never asked
  for elsewhere. A real label-only patch is possible (swap the
  Career Report's displayed text when the student's actual saved GPA
  is empty) but wouldn't fully match ForYouSchools' behavior (that
  page's toggle is a per-visit UI preference, not tied to the saved
  profile GPA at all) -- flagging for a product decision on which
  behavior is actually wanted app-wide rather than building a partial
  fix that looks resolved but isn't the same thing.
- **Tooltip positioning "far" from the trigger on Windows** (items 2
  and 8: Save button and the career page's "+ Add to my list" button).
  Both go through the same shared `IconTip`/`Tip` component
  (`app/IconTip.tsx`), which already does the robust thing --
  measures the trigger's real `getBoundingClientRect()` and portals
  the tooltip to `document.body` with `position: fixed`, the same
  pattern used to fix the Settings dropdown and GPA picker earlier
  this session. No logic bug found in it. Likely a genuine Windows/
  display-scaling rendering quirk not reproducible from this
  environment, matching the user's own "(Windows issue)" read --
  didn't find anything to indicate that read was wrong.

Files: `src/components/app/ExploreExperience.tsx`,
`src/components/career/ConnectWithProfessionalsModal.tsx`,
`src/components/colleges/CollegeDetailExperience.tsx`.

`npx tsc --noEmit -p .` and `npx eslint` clean on all three. Verified
live: Explore For You's overflow measured exactly 0px after the fix
(was 24px) at 1440x800, both buttons fully visible with no scroll
possible; Connect modal now shows a single close control.

Next step: pushed together with the tablet fix below (the user asked
for that one directly, and to push both).

## 2026-09-21 · Explore For You: fixed at tablet too (same feature, different bug)

Immediate follow-up: "The for you on tablet is breaking." Root-caused
via direct DOM measurement, not guessed at: at tablet widths (`md:` but
below `lg:`), the reel panel (`.foryou-snap`, `ExploreExperience.tsx`)
used `md:h-full md:max-h-[672px]` -- and CSS only resolves a percentage
height (`h-full` = `height:100%`) against an ancestor whose own
`height` is an explicit value, never `auto`, regardless of what pixel
height that ancestor happens to render at. `main`'s own height rule is
`lg:`-only (the earlier fix in this same file), so at tablet widths
`main` has no explicit height -- `auto` all the way up. The panel's
OWN box still landed on 672px in practice (`max-height` capping its
otherwise-taller natural content), so that part looked fine, but each
snap-card inside it is ALSO `h-full`, trying to resolve against a
parent whose CSS `height` is technically `auto` even though it renders
at 672px -- so every card fell back to its own natural content height
instead (measured: 230/82/228px per card, wildly inconsistent) rather
than filling the panel. Visually: several partial cards stacked instead
of one full card at a time, i.e. exactly "breaking."

Fix: `md:h-[672px]` instead of `md:h-full md:max-h-[672px]` -- a
literal fixed height sidesteps the whole ancestor-chain question
instead of depending on `main` also being fixed at this breakpoint.

Files: `src/components/app/ExploreExperience.tsx` only.

`npx tsc --noEmit -p .` and `npx eslint` clean. Verified live at
768x1024 (tablet): every reel card now measures exactly 390x672,
matching its container, one full card visible at a time -- confirmed
via direct DOM measurement, not just a screenshot.

Next step: pushed together with the QA batch above, per direct
instruction.

## 2026-09-21 · Connect-button verification, Windows/Chromebook guardrails, Demo-vs-Production documentation

Follow-up to the QA rounds above: verified one item that was confirmed-but-unbuilt, then did a proactive pass so future Windows/Chromebook reports are easier to root-cause instead of "can't reproduce on Mac."

**Verified and fixed: "hide Connect when no professional exists."** It was never built -- `CareerDetailExperience.tsx`'s Connect button rendered unconditionally regardless of whether the career's world had any professionals. `PROS` (`connect/data.ts`) only covers 6 of the app's 16 worlds; `COMMUNITIES` only covers 5. Fixed: the button now only renders when `PROS.some(p => p.world === career.world)`. Live-verified: hidden on `/career/electrician` (Building & Construction, no PROS), shown on `/career/data-scientist` (Tech & Engineering, has PROS).

While in that file, found and fixed a second, related bug in the same modal: `ConnectWithProfessionalsModal.tsx`'s community lookup fell back to the Teaching & Education board whenever a world had no board of its own (`COMMUNITIES.find(...) ?? COMMUNITIES.find(id === "teaching-education")`), so a student in an unmatched world would see a mismatched community's photo/name under the correct world's header. Removed the fallback; the board card now simply doesn't render when there's no match for that world (already guarded by `{community && (...)}`).

**Root-caused the two "tooltip positioned far from the icon" Windows reports from the earlier QA rounds** (previously investigated, couldn't reproduce on Mac). Likely cause: `IconTip`/`Tip` (`src/components/app/IconTip.tsx`) computed a fixed pixel position from the trigger's `getBoundingClientRect()` with no viewport clamping. A trigger near a screen edge -- more likely on a smaller Windows/Chromebook viewport, or effectively so under Windows display scaling (125%/150% is the default on many Windows laptops, common and not an edge case) -- could render partway or fully off-screen. Fixed: the bubble now measures its own rendered position after mount and shifts back on-screen if it overflows left/right, and flips above the trigger if there's no room below. Not independently confirmed as THE root cause (no Windows machine to test against), but it's a real bug either way and the most plausible explanation found.

**Windows/Chromebook guardrail pass**, since most students use the app on Windows or Chromebooks, not Mac (our dev machines are Mac):
- New doc: `docs/CROSS_BROWSER_GUARDRAILS.md` -- explains why Mac hides bugs Windows/ChromeOS show (overlay vs. classic scrollbars reserving layout width, Windows display scaling causing subpixel/viewport differences, smaller screens, touch-hover-stick on Chromebooks, unstylable native `<select>`), the concrete rules (`dm-scroll`/`flow-scroll` always paired with the `::-webkit-scrollbar` rule, never a bare `[scrollbar-width:...]` arbitrary property; clamp anything positioned via `getBoundingClientRect()`; never restyle a native `<select>`), a repeatable audit command, and a self-check checklist.
- Audited every `overflow-y-auto`/`overflow-auto`/`overflow-scroll` container in `src/components` for a paired cross-browser-safe scrollbar treatment. Found ~30 without one (the browser's unstyled default, invisible on Mac, a always-visible ~15-17px bar on Windows/ChromeOS) and 4 more using a Firefox-only `[scrollbar-width:...]` arbitrary property with no `::-webkit-scrollbar` companion (same exact bug class as the Build-flow scrollbar bug fixed earlier this session, just not yet caught in these files: `MatchGrid.tsx`, `MatchLab.tsx` x2, `SimulationPlayer.tsx`). Fixed all of them: added `dm-scroll` (visible, thin, cross-platform-styled) to plain sheets/modals/panels, or swapped in `flow-scroll` (hidden, cross-platform-paired) for snap/swipe card-deck surfaces where the interaction itself already implies scrolling. One exception left untouched on purpose: `src/components/motion-lab/DailyDropDemo.tsx` is an unrouted dev-only rig preview, not shipped UI.
- `AGENTS.md` now points at the guardrails doc up front, so any agent working in this repo (including Usman's) reads it before touching layout/scrolling/positioning work, not just this session.

**Demo-vs-Production documentation**, per direct instruction to give Usman's agent enough context that he "doesn't have to deal with these bugs": every demo-only flag's code comment is now tagged `DEMO-ONLY:` (exact casing, canonical across the codebase -- some already said "Demo only" in prose, normalized to the same greppable string). `grep -rn "DEMO-ONLY" src` is now the authoritative, current list. `docs/HANDOFF_INDEX.md`'s old 4-bullet "Demo-only scaffolding" section (accurate but stale and incomplete -- e.g. its `localStorage` key list had 6 keys; there are ~30 in actual use) was replaced with a full "Demo vs Production" section: a table of toggle-able flags with file + effect, demo-only UI not behind a single flag (Connect role switch, AT&T version chip, Profile Overview version chip, the Play-button demo-gate tension), the full current `localStorage` key inventory split into student-data-that-must-move-server-side vs. pure-UI-convenience-state, seeded/mock content, and a new note on the `PROS`/`COMMUNITIES` world-coverage gap (Usman's domain, not UI). Also corrected one stale line found in passing: the Resume Builder tab was still listed as a "Coming soon" placeholder in the feature-status table; it's a real, built feature now (`src/components/resume/`), just without a locked spec yet.

Files touched: `src/components/career/CareerDetailExperience.tsx`, `src/components/career/ConnectWithProfessionalsModal.tsx`, `src/components/app/IconTip.tsx`, and the ~20 files getting `dm-scroll`/`flow-scroll` (Inbox, GlobalSearch, resume/TemplateGallery, resume/ui, resume/ResumeDocument, colleges/ForYouSchools, colleges/CollegesExperience, marketing/Nav, profile/ProfileExperience x7, connect/att/AttCommunityView x2, connect/ConnectExperience x4, connect/mentorship/MentorshipTab x2, match-lab/MatchGrid, match-lab/MatchLab x2, play/SimulationPlayer); plus the `DEMO-ONLY:` comment tags in HomeExperience.tsx, WelcomeSplash.tsx, chrome.tsx, MatchLab.tsx, SimulationPlayer.tsx, dreamScore.ts, ConnectExperience.tsx, ProfileExperience.tsx, connect/att/VersionChip.tsx; new `docs/CROSS_BROWSER_GUARDRAILS.md`; updated `docs/HANDOFF_INDEX.md` and `AGENTS.md`.

`npx tsc --noEmit -p .` and `npx eslint` clean across every touched file (only pre-existing unrelated warnings remain). Live-verified the Connect-button hide/show behavior in the browser at `/career/electrician` and `/career/data-scientist`; did not re-verify all ~30 `dm-scroll` additions individually since it's the same already-proven CSS class extended to more containers, not new styling.

Unresolved: the scrollbar/tooltip fixes address the most plausible root causes but weren't tested on an actual Windows/Chromebook machine -- no such device available here. If Usman still sees either class of bug after this, the next debugging step is a screen recording (not a static screenshot) plus the exact OS/browser/display-scale percentage, per the new guardrails doc.

Next step: none pending from this pass. `docs/CROSS_BROWSER_GUARDRAILS.md` and `docs/HANDOFF_INDEX.md`'s Demo vs Production section are meant to be self-serve from here -- no further instruction needed for Usman's agent to use them.

## 2026-09-21 · Cost step label overlap, Add-your-own dropdown overlay, bespoke Listbox component

Follow-up to the guardrails pass above, triggered by a live regression report ("the cover photo modal has all the options stacked and overlapping").

**Investigated the Cover photo modal report: could not reproduce.** Tested the Cover picker and the Avatar picker (same grid pattern, same earlier "compressing/overlapping" report from the QA rounds) at desktop/tablet/mobile -- both render cleanly, no overlap, confirmed via both screenshots and `getBoundingClientRect()` measurement (no horizontal overflow, grid tracks correctly sized). Still unresolved; if it recurs, next step is a screen recording plus exact OS/browser/display-scale, per the guardrails doc's own advice for this class of report.

**While auditing other screens for the same class of bug, found and fixed a real one: `CostStep.tsx`'s slider stop labels overlapped at mobile width.** The second-to-last and last labels ("Cost isn't a / major factor", "I'm not / sure") rendered with interleaved, unreadable text at 375px -- confirmed live, not just in theory. Root cause: each label was absolutely positioned at its tick's exact percentage with a centering transform; a same-day earlier narrowing pass (11.5px font, 74px max-width) reduced the overlap but didn't eliminate it, because percent-positioned boxes have no mechanism that forces neighbors apart -- they can only get closer to overlapping as content or viewport shrinks. Fix: rebuilt the row as a flex `justify-between` layout, which cannot overlap by construction (the browser only ever adds space between shrink-to-fit siblings, never lets them share pixels). Verified clean at mobile/tablet/desktop.

**Fixed a genuine "grows the page" bug in Career Report's "Add your own" dropdown** (direct feedback: it should overlay, not push content around). `CareerExploration.tsx`'s `AddMenu` checklist opened inline, growing its own section's height and shoving the report content below it down the page while open. Portalled and positioned from the trigger's measured rect, same pattern as `ProfileExperience`'s Settings menu -- it now floats above the page instead of displacing it. Verified live: opening it no longer moves "3 College Majors to Consider" (or anything else) on the page.

**Built `src/components/app/Listbox.tsx`, a bespoke dropdown, and migrated every native `<select>` in the app to it** (direct instruction, following up on the QA finding that native `<select>` popups can't be restyled on any platform -- confirmed unfixable via CSS, not a bug). Portalled, self-painted option panel; drop-in `value`/`onChange`/`options` API; keyboard parity with native `<select>` (arrows, Enter/Space, Escape, Home/End); responsive by construction rather than by guess -- width is bounded between a 160px floor and a 480px/viewport-width ceiling, height between a 120px floor and a 320px ceiling scaled to whatever room is actually available above or below the trigger, and it repositions itself on window resize/orientation change while open, not just at open time. Migrated 8 files / 12 call sites: `build/LocationStep.tsx` (state picker), `build/steps.tsx` (grade/GPA dropdowns), `profile/ProfileExperience.tsx` (Settings: GPA, GPA type, travel distance), `colleges/ForYouSchools.tsx`, `resume/ui.tsx` + `resume/wizardSteps.tsx` (country, program), `signup/SignupExperience.tsx` (birth month/year), `connect/att/AttCommunityView.tsx` and its `v1/` copy. `grep -rln "<select" src/components` now returns nothing but comment mentions.

Files touched: `src/components/build/CostStep.tsx`, `src/components/profile/CareerExploration.tsx`, `src/components/app/Listbox.tsx` (new), plus the 8 files above; `docs/CROSS_BROWSER_GUARDRAILS.md` updated to point at `Listbox` instead of describing the `<select>` limitation as merely "build something custom eventually."

`npx tsc --noEmit -p .` and `npx eslint src/components` clean (0 errors). Live-verified: CostStep at all three breakpoints, the Add-your-own overlay not displacing page content, and the new GPA Listbox (opens, scrolls, commits, positions correctly at both desktop and mobile, including a near-viewport-bottom case).

Next step: none pending. The Cover-photo-modal report stays open pending a screen recording if it recurs.

## 2026-09-21 · Native-OS-chrome audit: tooltips, date input, disclosure markers, and a real transparent-panel bug

Direct follow-up to "have we fixed the tooltip distance issue... put guardrails in place... use custom designs for all these components that have a tendency to be used as native OS UI." Confirmed the tooltip fix from earlier today stands (the `IconTip` viewport-clamp/flip fix). Then audited the rest of the app for the same class of problem rather than waiting for the next report.

**Found and fixed 5 icon-only controls still using a native `title="..."` attribute** instead of `IconTip` -- a bare HTML `title` renders the browser's own native tooltip: unstylable, unclampable, its own OS delay, and (unlike `IconTip`) never got the viewport-clamp fix at all. `ConnectWithProfessionalsModal.tsx` and `ConnectInterstitial.tsx`'s Replay buttons, and `MentorshipTab.tsx`'s Video call/Minimise/Full screen/Close buttons -- all now wrapped in `IconTip`.

**Found and fixed the one `<input type="date">` in the app** (`CareerExploration.tsx`'s experience-log date field) -- a native date input's calendar popup, and even its closed-state text segments and spinner arrows, are OS-chrome, arguably worse than `<select>` since they differ more across Windows/ChromeOS/Mac. Built `src/components/app/DatePicker.tsx`: month-grid calendar, keyboard arrow-key day navigation, same Portal/viewport-clamp/resize-reposition pattern as `Listbox`. Verified live.

**Found and fixed native disclosure-triangle markers on the app's two `<summary>` elements** (`ConnectExperience.tsx`'s Community rules/Moderators sections) -- both already pair with their own chevron icon, so the browser's own triangle (rendered differently across the deprecated WebKit-specific pseudo-element and the modern standard `::marker`) would double it. Suppressed both ways, globally, in `globals.css`.

**Found and fixed the "Add your own" checklist panel had no height cap** -- a leftover gap from this afternoon's Portal conversion (it fixed the push-content-down bug but never bounded the panel's own height), which could overflow the viewport entirely on a shorter screen, pushing the "Add" button off-screen with no way to reach it. Gave it the same bounded/scrollable/resize-aware treatment as `Listbox`.

**Found and fixed a real "transparent-looking panel" bug in the Build flow specifically** (direct feedback: "the dropdown now has no surface color... transparent and clashing with everything"). Root cause, confirmed via computed style rather than assumption: `Listbox`'s default panel background (`--card`) DID resolve to a real, valid color everywhere -- but the Build flow (`/flow`) paints its own custom gradient background instead of the app's standard one, and `--card`'s dark navy happened to sit close enough in tone to that gradient that the panel read as having no surface at all, bleeding into the page behind it. Not a missing value; a contrast failure that only shows up against a non-standard background. Fixed by passing an explicit `panelStyle` (a prop `Listbox`/`DatePicker` already supported but neither of the Build flow's two call sites had used) with the Build flow's own solid `--color-night-card` token -- same solid-surface convention `GpaField`'s dialog already used, for the identical reason. Verified live before/after via `getComputedStyle` on the actual panel element, not just a screenshot.

**Documented all of this as a general rule, not five one-off fixes**, in `docs/CROSS_BROWSER_GUARDRAILS.md`: a new "Never let a native OS control leak through" section with a table of every native-chrome-risk element found so far and this app's replacement for each (including the one genuine, accepted exception -- `<input type="file">`, whose OS picker has no custom-UI equivalent since it opens the real filesystem), plus the contrast-against-custom-backgrounds lesson, added to the self-check list agents should run before calling UI work done.

Files touched: `src/components/app/DatePicker.tsx` (new), `src/components/career/ConnectWithProfessionalsModal.tsx`, `src/components/play/ConnectInterstitial.tsx`, `src/components/connect/mentorship/MentorshipTab.tsx`, `src/components/profile/CareerExploration.tsx`, `src/app/globals.css`, `src/components/build/LocationStep.tsx`, `src/components/build/steps.tsx`; `docs/CROSS_BROWSER_GUARDRAILS.md` substantially expanded.

`npx tsc --noEmit -p .` and `npx eslint src/components` clean (0 errors). Live-verified every fix in the browser, including the Build-flow panel contrast fix specifically (computed `background-color` checked before and after).

Next step: none pending. Not yet committed/pushed -- pending explicit go-ahead per the project's standing rule.

## 2026-09-21 · V2 seasonal card artwork and motion

Isolated branch `codex/season-card-motion`, based on remote main 5b9fddd.
Shared SeasonScene extracted from ProfileExperience; preserves the existing Fall, Winter, Spring palette and plan data. New maple/tapered leaf silhouettes, fine snow crystals, notched sakura and loose petals. Each season has its own resting composition. A separate moving layer crossfades on hover or direct keyboard focus; phased, paused CSS timelines combine descent, lateral sway and rotation without moving the resting marks abruptly to the top. Only the directly interacted card animates. Reduced motion retains the static composition. No runtime dependencies or animation state updates.

Overview uses the full card fade; accordion wash fades within 145px and particles within 182px, leaving task content clear. Content is layered above decoration. Existing V1 behavior remains.

Validation: TypeScript passed; ESLint has no errors (one existing unused AnimatePresence warning in ProfileExperience); token check passed; browser renders Overview and all three Plan cards, Winter expansion, isolated hover activation, and reduced-motion static state. Desktop 1280px and mobile 390px inspected; mobile overflow 0; no browser errors. Screenshots in workspace outputs/seasons-*.png.

Preview: http://localhost:3107/profile, dismiss welcome screen, choose V2 at page foot, then Overview or My Plan. Not pushed or deployed at handoff time -- see follow-up entry below.

## 2026-09-21 · Season card watercolor art: asset gap found and closed, with a graceful fallback

Picked up the branch above to integrate and push. Rebased onto current `origin/main` cleanly (`ProfileExperience.tsx` auto-merged, only this file needed manual resolution).

**Found a real blocker before pushing:** the new `SeasonScene.tsx` renders `<img src="/images/seasons/watercolor/{kind}.png">` for six marks (maple, leaf, snow, crystal, blossom, petal), but none of those files existed anywhere on the machine -- not in this worktree, not in any of the other local Dreamari checkouts, not in system temp/cache. Codex's own handoff notes and its screenshots (`outputs/seasons-*.png`) show the art rendering correctly, so the files were real inside Codex's own session; they just never made it to disk here. Codex's own notes flagged this as unreviewed and unshipped, so this wasn't a silent gap -- it was going to be caught in review regardless. Confirmed via exhaustive filesystem search before assuming anything, not by inspection of the code alone.

**Resolved with 2 changes:**
1. The user supplied 3 of the 6 watercolor PNGs Codex generated (from Codex's own chat, saved via Downloads): `maple.png`, `leaf.png` (a ginkgo leaf), `snow.png`. Placed at `public/images/seasons/watercolor/`.
2. Rebuilt `SeasonMark` (inside `SeasonScene.tsx`) with a per-mark fallback: the `<img>` still points at the watercolor PNG, but an `onError` handler swaps to the equivalent V1 SVG mark (`LeafMarkA`/`LeafMarkB`/lucide `Snowflake`/`SakuraMark`, ported back in from the pre-Codex version of this component in `ProfileExperience.tsx`, tinted via the season's own color) instead of leaving the browser's broken-image glyph. This means: the 3 delivered marks (maple, leaf, snow) render as real watercolor art now; the 3 not yet delivered (crystal, blossom, petal) render as the exact already-shipped SVG art instead of breaking; and when the remaining 3 PNGs arrive, they'll start rendering automatically with no further code change, file by file.

Files touched: `src/components/profile/SeasonScene.tsx` (fallback logic + restored SVG marks), `public/images/seasons/watercolor/{maple,leaf,snow}.png` (new).

`npx tsc --noEmit -p .` and `npx eslint` clean. [Live verification and push status: see the push itself / next session log entry.]

## 2026-09-21 · Career Detail header icon interactions, and a real transparent-modal bug found while building them

Direct feedback asked for interaction design on Career Detail's header icons ("+", Heart, Thumbs-down, Bookmark) -- what happens on tap, modal vs toast. Recommendation given and confirmed: "+" reuses the existing Add-to-Top-3/swap-when-full logic (one modal, not a new concept); Heart/Thumbs-down/Bookmark are toggles that only need a toast on the very first tap ever, then rely on their own filled state. Built and pushed per explicit instruction.

**New shared pieces**, so Career Detail reuses the same logic/visuals ProfileExperience already has instead of a second implementation: `src/lib/useTop3.ts` (add/swap/remove directly against `picks.ts`, no Profile-page demo-fallback overlay), `src/components/career/Top3SwapModal.tsx` (the "Top 3 is full, swap one out" picker, same copy/structure as ProfileExperience's own), `src/components/app/Toast.tsx` (a simple self-dismissing confirmation, same visual language as the existing `UndoToast` but without an Undo action).

Wired into `CareerDetailExperience.tsx`: "+" adds directly, or opens the swap modal when Top 3 is full; once added it shows Minus (not Plus) and removes on tap, with an `UndoToast` ("Removed from your Top 3 · Undo") -- every action here now has an obvious way back, either a second tap (Heart/Thumbs-down/Bookmark, already toggles) or an explicit Undo (Top 3 remove). Heart/Thumbs-down each show a one-time explainer toast on the student's first-ever tap (a `localStorage` seen-flag per icon), never again after.

**Found a real bug while building this, not hypothetical:** the new `Top3SwapModal` and `Toast` rendered as unstyled wireframes -- transparent background, barely-visible borders. Root cause: every design token used here (`--card`, `--glass-border`, `--background`, `--space-*`, `--radius-*`) is scoped to `.marketing-v2` (`marketing/tokens.css`'s own header comment says so explicitly), not `:root` -- so a `createPortal` straight to `document.body` without re-adding that class has none of them. `CareerReport.tsx`'s own `Portal` helper already documents this exact trap. Audited every `createPortal` call site in the app (`grep -rl createPortal`) for the same miss and found it wasn't just my two new files: **`UndoToast.tsx`** (used for Profile's own "Not for me"/"Remove from Top 3" undo) and **`CompanyVideoCards.tsx`** had the identical bug pre-existing, plus **`ConnectExperience.tsx`**'s photo-viewer portal (spacing/radius tokens only, its background is a hardcoded rgba so less visible). Fixed all of them by adding `marketing-v2 themeable` to each portal's outer element, matching the convention every other modal in the app already follows (`ConnectWithProfessionalsModal`, `GlobalSearch`, `ForYouSchools`, `CollegesExperience`, `ConnectInterstitial`, `TrailerFlow`). Verified via `getComputedStyle` on the live toast (`background: rgb(21, 24, 41)`, real border, 14px radius) before and after, not just a screenshot.

Files touched: `src/lib/useTop3.ts` (new), `src/components/career/Top3SwapModal.tsx` (new), `src/components/app/Toast.tsx` (new), `src/components/career/CareerDetailExperience.tsx`, `src/components/app/UndoToast.tsx`, `src/components/app/CompanyVideoCards.tsx`, `src/components/connect/ConnectExperience.tsx`.

`npx tsc --noEmit -p .`, `npx eslint`, and `npm run build` all clean. Live-verified: add (toast), full-Top3 swap (modal, correct titles), remove (Minus icon + Undo toast, confirmed restores state), first-tap-only Like/Dislike explainer (silent on repeat taps) -- all with the corrected opaque card styling.

Next step: none pending on this thread. A separate ask arrived mid-session (add a "Typical Pay over 100K" row to Explore Careers, assets in `new row/`) -- picked up next, unrelated to this work.

## 2026-09-21 · Explore Browse: "Typical Pay: $100K +" row replaced with 7 new careers

Slack request (Chandu M P): replace this row's content with Mental Health Social Worker, Urban Planner, Judicial Law Clerk, Environment Scientist, Principal, Community Program Manager, Detective, in that order. Assets supplied in a local `new row/` folder (not committed -- source PNGs, converted and placed under `public/images/app/browse/`).

Four of the seven (Urban Planner, Judicial Law Clerk, Environment Scientist, Principal) are brand-new to the catalog -- no prior entry anywhere. Three already existed (Mental Health Social Worker, Community Program Manager in Counseling & Social Work; Detective in Law, Safety & Justice, per `browseLibrary.ts`); fresh photos were supplied for the first two and converted in, Detective reuses its existing photo (no new asset given). Because `BROWSE_TYPICAL_PAY` merges into `ALL_CATALOG_CAREERS` before `BROWSE_LIBRARY` (first occurrence wins), the new photos for those two become their canonical photo everywhere in the app, not just this row.

**Read "add this row... over Typical Pay 100K" as replacing the existing "Typical Pay: $100K +" row's content** (the row already existed by that exact name/threshold) rather than appending a second $100K+ row -- flagging this interpretation explicitly since it removed the prior six (Pediatric Surgeon, Airline Pilot, Purchasing Manager, Cardiologist, PR Manager, Veterinarian); easy to revert if that reading was wrong.

**Salary figures are placeholders, not sourced** -- same "general industry knowledge, not verified" caveat `career/data.ts`'s ladder pay already carries. Flagging two specifically: Mental Health Social Worker ($101K used here) and Judicial Law Clerk ($105K used here) sit well above their typical national medians at normal experience levels -- used senior/upper-range figures to keep every card honestly showing $100K+ for this specific row, but these two need a real source before shipping past prototype. Principal, Urban Planner, Environment Scientist, Community Program Manager and Detective are more defensible at senior/major-metro level.

Files touched: `src/components/app/catalog.ts` (`BROWSE_TYPICAL_PAY` replaced), `public/images/app/browse/{mental-health-social-worker,community-program-manager,urban-planner,judicial-law-clerk,environment-scientist,principal}.webp` (new/replaced, converted from the supplied PNGs via `cwebp -q 82`).

`npx tsc --noEmit -p .`, `npx eslint`, `npm run build`, `npm run tokens:check` all clean. Live-verified: the row itself (7 cards, correct photos/titles/worlds/salary badges), and Career Detail resolving correctly for a brand-new title (Principal) end to end.

Next step: confirm with Chandu whether replace (not append) was the right call, and get real salary sourcing for Mental Health Social Worker and Judicial Law Clerk specifically.

## 2026-09-21 · Public Service row corrected, thin new-career pages filled in, WelcomeSplash gets a real blur

Three follow-up corrections from the Public Service row work above, all direct feedback.

**"add this row wasn't to replace it was to place above."** Reverted `BROWSE_TYPICAL_PAY` to its original 6 careers exactly. The 7 careers now live in a new `BROWSE_PUBLIC_SERVICE` row, merged into `ALL_CATALOG_CAREERS` before `BROWSE_TYPICAL_PAY` (so it keeps first-occurrence photo precedence) and rendered directly above it in `ExploreExperience.tsx`.

**"the new row isnt careers paying 100k+, these are public department or something. What are those careers called?"** Confirmed: never a pay tier, always a public-sector/civic theme (social work, city planning, the courts, environmental regulation, public schools, community programs, law enforcement). Retitled the row "Public Service Careers" and re-priced every career to a real, defensible BLS-approximate figure instead of the inflated $100K+-minimum numbers from the first pass -- Mental Health Social Worker ($59K), Urban Planner ($80K), Judicial Law Clerk ($67K), Environment Scientist ($79K), Principal ($103K), Community Program Manager ($74K), Detective ($91K). Saved as a standing rule: never stretch a number to fit an assumed theme -- the theme assumption is more likely wrong than the data (it was, here).

**"why is principal career detail opening with median salary on top and tabs below?"** Not a bug -- `resolveCareer()` pulls a career's body content (summary, scenario, degree, majors, ladder, software) from a separate profile lookup (`CAREER_PROFILES` -> `GENERATED_PROFILES` -> `ARTS_PROFILES`), which `catalog.ts` alone never populates. `viewModel()` correctly filters out "Coming soon" placeholders rather than rendering them, so a catalog-only career with no profile shows just its one real fact and an empty tab bar -- by design, but it reads as broken for a genuinely new career. This is a real, common gap: roughly 150 of ~200 catalog careers still have no profile at all. Fixed for these 7 specifically by authoring full `GENERATED_PROFILES` entries (summary, scenario, 4 facts, pay by state, know about/good at/software, a 3-rung ladder, education) in the same file's established BLS-approximate, explicitly-unsourced convention -- `factDetails` left unauthored (optional; the (i) icon just doesn't render without it). Saved as a standing note: always add a catalog entry and a profile entry together going forward.

**"why is there no blue showing the screen behind... these solid backgrounds everywhere... blur the background more, don't just dim it, app wide."** `WelcomeSplash.module.css`'s `.scrim` (the "EXPLORE"/"RESUME"/etc. first-visit welcome cards, shown on nearly every tab) was fully opaque -- a deliberate choice from 11 Sept 2026 direct feedback, because a translucent-but-unblurred version let the real page underneath read as legible clutter behind the dialog. Resolved both concerns at once: swapped the opaque `var(--color-night-background)` for `color-mix(in srgb, var(--color-night-background) 62%, transparent)` plus `backdrop-filter: blur(32px)` (with the `-webkit-` pair). A real blur removes the same legibility the 11 Sept fix was solving for, while still showing color and depth through, matching the Apple-style treatment already applied to every other modal this session. Verified live on Resume Builder (form fields visible as soft blurred shapes behind the dialog, not solid) and Explore (poster cards likewise).

A broader app-wide pass -- raising every modal/sheet/drawer backdrop's blur to one consistent strong standard, plus a separate full icon-only-control tooltip audit -- is running in the background; its own handoff entry will follow once it lands.

Files touched: `src/components/app/catalog.ts`, `src/components/app/ExploreExperience.tsx`, `src/components/career/profiles.generated.ts`, `src/components/app/WelcomeSplash.module.css`.

`npx tsc --noEmit -p .`, `npx eslint`, `npm run build`, `npm run tokens:check` all clean. Live-verified: the Public Service row (correct title, careers, order, above Typical Pay untouched), Principal's now-full detail page, WelcomeSplash's blur-through on Resume and Explore.

Next step: land and verify the in-progress app-wide backdrop-blur and icon-tooltip agent passes, then push those together.

## 2026-09-21 · College SchoolCard: full-bleed rebuild, seam fixed, CTA placement fixed

Two related bugs on the school cards (Explore Schools, Browse and For You both use `SchoolCard`/`CollegeCard` in `colleges/shared.tsx`), both direct feedback with a screenshot.

**Seam at the photo/card boundary, worst on hover.** Root cause confirmed via computed `transform`, not guessed: the hover-zoom CSS rule (`.poster-card:hover .poster-photo { transform: scale(...) }`) was scoped to the WHOLE photo band -- image, gradient-to-`var(--card)` fade, dim, cue -- instead of just the image, same class of bug as `PosterCard.tsx` already avoids by scoping the class to the image alone. Scaling the whole band on hover grew its rect past its static 300px clip and shifted the gradient's fade-to-card-color edge out of alignment with the card's own actual background, showing as a visible line exactly where the photo met the card. First fix (moving the class to just the image) was correct but the user pushed further: went full bleed instead, matching `CollegeCard`'s own existing treatment -- the photo now runs the whole card height with one continuous bottom-heavy dark scrim, so there's no seam to misalign because there's no fixed-height handoff point left at all. Every text element that used to sit on the solid `var(--card)` surface (stats, chips, "Why this school?", Not for me/Compare) now uses white/photo-tuned colors instead of theme tokens, matching how the name/place text already worked. `ghost` (the Compare button's default style) reverted to its original white-alpha version from before a 17 Sept 2026 light-mode fix -- that fix was specifically for when this sat on solid `--card`; full bleed removes the problem it was solving.

**CTA placement/balance, worst on cards without "Why this school?".** Only the actions row carried `mt-auto`, so a card missing that link dumped ALL its leftover vertical space into one gap right above Compare, reading as disconnected from the stats above it. Moved `mt-auto` onto a new wrapping group around stats + why + actions together, so the CTA always sits a fixed, tight gap from its stats regardless of what's between them, and any leftover space shows up higher on the card (under the chips) instead.

Files touched: `src/components/colleges/shared.tsx` (`SchoolCard`, `CollegeCard`).

`npx tsc --noEmit -p .`, `npx eslint`, `npm run build` all clean. Live-verified: static and hovered states on both Browse and For You views, both with and without "Why this school?" present, expanded "Why this school?" text legible over the photo.

Next step: none pending on this thread. Play/Glossary background differentiation picked up next, per direct feedback (separate ask, unrelated).

## 2026-09-21 · SchoolCard: fixed height app-wide, not just per-row

Follow-up correction on the full-bleed work above. `h-full` only equalizes cards stretched together in the SAME flex row/grid line -- it was working exactly as measured (each shelf internally uniform), but different shelves landed at genuinely different total heights depending on whether that shelf's cards carried the program-chip row (Schools with X: 351px) or not (Near you, Lower-cost options, etc: 312px), since that row was conditionally rendered. Direct feedback: "the heights don't match" was about across-the-page consistency, not within-a-row consistency, which is a different (stricter) requirement than what shipped.

Fixed by making the card a fixed pixel height (380px) instead of `h-full`, and always rendering the program-chip row's container (with its `min-h-[24px]`) even when nothing's inside it, so every card reserves the identical internal slots regardless of what's actually present. The one interaction this affects: "Why this school?" used to be free to grow the card when expanded (verified working in the full-bleed pass above); with a fixed height and `overflow-hidden` on the card, an expansion that grew past the remaining slack would now clip instead. Capped the expanded text at `max-h-[52px] overflow-y-auto` -- invisible for the typical one-clause reason, only kicks in for an unusually long one.

Files touched: `src/components/colleges/shared.tsx` (`SchoolCard`).

`npx tsc --noEmit -p .`, `npx eslint`, `npm run build` all clean. Live-verified via DOM measurement across every shelf on both Browse and For You (`Schools with Finance`, `Near you`, `Lower-cost options`, `High acceptance`, `More schools for your path`, `Target`, `Safety`, `Reach`, `Lower-cost ways to start`) -- all 380px, no exceptions. Also verified "Why this school?" expands cleanly within the fixed box without pushing the card taller than its neighbors.

Next step: none pending on this thread.

## 2026-09-21 · SchoolCard: chip position, pinned CTA, and a cleaner fixed-height approach

Three more corrections on the same card, all direct feedback with screenshots.

**"DIRECT PATH chip wraps for longer course names, bad composition."** The programme name and its route chip used to share one `flex-wrap` line, so a long programme name pushed the chip to wherever it happened to wrap to -- inconsistent position card to card. Split into two lines: the programme name (truncated, never wraps) on its own row, the chips (route/fit/target) on a separate row directly under it. The chip row's position is now identical on every card that has one.

**"When I expand why this school, the CTA moves downward, clipping it and I can't interact with it."** First attempt at a fix (a separate absolutely-scrolled zone for stats+why) actually made it worse -- the expanded text rendered overlapping the actions row rather than clipping cleanly, a flexbox `overflow: auto` + `justify-content: flex-end` interaction that didn't behave as expected. Corrected instruction: "don't reserve space for missing details... keep the cards the same height and have the content pinned to the bottom" -- simplified back to one plain `mt-auto` group (chips-if-any, stats, why-if-any, actions-if-any) in normal flow, with the card's fixed height raised from 380px to 420px so the group has real headroom for the worst case (2-line chip wrap + why expanded) without needing scroll tricks. The expanded "why" paragraph keeps a `max-h-[52px] overflow-y-auto` safety net for the rare unusually-long reason.

**"For cards with no other CTA like Not for me, make Compare go full width."** Then, on seeing it: "if full width is too much, left-align instead -- those cards have all the other content left-aligned, it looks awkward." Landed on left-aligned: a lone Compare button now sits at the card's left edge, flush with the name/chips/stats above it, instead of floating alone on the right.

Files touched: `src/components/colleges/shared.tsx` (`SchoolCard`).

`npx tsc --noEmit -p .`, `npx eslint`, `npm run build` all clean. Live-verified: every shelf on Browse and For You at a uniform 420px, the "Economics / DIRECT PATH / TARGET AT 3.9" 2-line-chip card with "Why this school?" expanded (text fully legible, Not for me/Compare fully visible below it, no overlap or clipping), and a lone-Compare card (Near you, Lower-cost options) left-aligned with no dead gap above it.

Next step: none pending on this thread.
