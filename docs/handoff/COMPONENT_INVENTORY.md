# Dreamari component inventory and state gaps (27 Sept 2026)

For Usman. Every reusable UI piece in the prototype: where it lives, what it
takes, which states it actually implements, what data to feed it, and what
is unsafe to render in isolation. Read this with
`docs/COMPONENT_STATES_PLAYBOOK.md`, the defaults for any state not built
here. Where the two disagree, a locked spec in `docs/handoff/specs/` wins
over both.

**Why this exists.** Chandu asked for a component-library lab showing every
element with all its states (empty, error, loading). With the week's usage
budget low, this document comes first. The live lab page is planned after
the 1 Oct usage reset and will be built from this inventory. The gap analysis
below is the part to act on: most states a real backend needs are not
defined anywhere yet.

Legend: **[E]** exported. **[L]** file-local (export it before a lab or
another screen can render it). Paths are relative to `src/components/`
unless they start with `src/`.

---

## 1. Gap analysis: which states exist, and where

### How this was counted
Every **data-backed surface** was listed: a screen region that shows data
which will come from the backend in production (feeds, rails, cards
populated from records, panels, documents). There are 62. Static UI such as
Build questions and marketing sections is excluded. Each surface is checked
for a loading, an error and an empty state that is implemented in code. A
state that is only described in the playbook does not count.

The prototype has no network, so almost nothing ever loads or fails. That
is the root of the gap: those states were never needed to demo it.

### The counts
| | Implemented | Missing (of 62) |
|---|---|---|
| Loading state | 8 | **54** |
| Error / retry state | 7 | **55** |
| Empty state | 16 | **46** |
| All three | 1 (every counselor v2 screen, one shared gate) | **61** |

**How Usman can see a state without reading code:** only two ways today.
- The counselor dashboard: `?state=loading|empty|error` on any `/counselor?view=…` URL. It's handled by `counselor/v2/states.tsx` `StateGate`, and covers whole screens only.
- Profile > Preferences: `?prefs=loading` and `?prefs=error`, in `profile/PreferencesTab.tsx`.

Every other state exists only as a code path that the demo data never
reaches.

### Global gaps (nothing exists anywhere)
- **No error boundary.** A component that throws blanks the screen. `ErrorReporter` only logs.
- **No skeleton component.** Loading falls back to the `Working` chip. `PreferencesTab` has one hand-built skeleton.
- **No route-level `loading.tsx` or `error.tsx`** on any route.
- **No offline handling.** There is no `navigator.onLine` check and no banner.
- **Toasts are success/undo only.** There is no error toast pattern; errors are inline text by rule.
- **Pluralisation** is hand-branched per string, with no helper.

### Surface-by-surface
✓ = implemented · — = missing · (n/a) = not applicable

| # | Surface | File | Load | Error | Empty | Notes |
|---|---|---|---|---|---|---|
| 1 | Home hero banner | app/HomeExperience.tsx | — | — | — | |
| 2 | Home rails (picks) | app/HomeExperience.tsx | — | — | — | |
| 3 | Home activity card | app/HomeExperience.tsx | — | — | — | reads progress |
| 4 | Explore For You reel | app/ExploreExperience.tsx | — | — | — | video with sound |
| 5 | Explore Browse / poster rails | app/ExploreExperience.tsx | — | — | — | |
| 6 | Trending rail | app/ExploreExperience.tsx | — | — | — | |
| 7 | Global search results | app/GlobalSearch.tsx | — | — | ✓ | names the query |
| 8 | Company video cards | app/CompanyVideoCards.tsx | — | — | — | autoplay muted |
| 9 | Career Detail page | career/CareerDetailExperience.tsx | — | — | ✓ | "Coming soon" for thin careers |
| 10 | Pay map | career/PayMap.tsx | — | — | — | |
| 11 | Similar careers | career/CareerDetailExperience.tsx | — | — | — | |
| 12 | Colleges browse shelves | colleges/BrowseShelves.tsx | — | — | — | |
| 13 | For You schools | colleges/ForYouSchools.tsx | — | — | — | |
| 14 | College grid + filters | colleges/CollegesExperience.tsx | — | — | — | no "no matches" state confirmed |
| 15 | College detail | colleges/CollegeDetailExperience.tsx | — | — | — | synthDetail fills gaps |
| 16 | College compare sheet | colleges/CollegesExperience.tsx | — | — | — | |
| 17 | Match (Mini Explore) grid | flow-lab/V2Flow.tsx | — | — | — | a world with no careers renders blank |
| 18 | Match picks tray | flow-lab/shared.tsx | (n/a) | (n/a) | ✓ | empty slots |
| 19 | Profile Top Three | profile/ProfileExperience.tsx Top3Tab | — | — | ✓ | tier 1 |
| 20 | Profile Overview | ProfileExperience.tsx OverviewTabV2 | — | — | ✓ | NothingSavedYet |
| 21 | Profile Routes | ProfileExperience.tsx RoutesTab | — | — | — | returns null with no focus |
| 22 | Profile My Plan | ProfileExperience.tsx MyPlanTab | — | — | — | |
| 23 | Career Report document | profile/CareerReport.tsx | — | — | — | returns null with no report data |
| 24 | Report history | CareerReport.tsx HistoryTab | — | — | ✓ | |
| 25 | Career exploration (experiences) | profile/CareerExploration.tsx | — | — | ✓ | |
| 26 | Career Locker shelves | ProfileExperience.tsx | — | — | ✓ | tier 2 dashed |
| 27 | Saved schools / videos shelves | ProfileExperience.tsx | — | — | — | not confirmed |
| 28 | Preferences | profile/PreferencesTab.tsx | ✓ | ✓ | — | `?prefs=` |
| 29 | Event stubs | profile/EventStubs.tsx | — | — | ✓ | |
| 30 | Settings | ProfileExperience.tsx SettingsView | — | — | (n/a) | |
| 31 | Report chooser | report/ReportChooser.tsx | — | — | ✓ | tier 4 |
| 32 | Resume versions list | resume/ResumeExperience.tsx | — | — | — | |
| 33 | Resume document | resume/ResumeDocument.tsx | (n/a) | (n/a) | ✓ | EmptyHint |
| 34 | ATS check | resume/ATSCheckPanel.tsx | ✓ | ✓ | (n/a) | |
| 35 | Job match | resume/JobMatchPanel.tsx | ✓ | ✓ | (n/a) | real POST |
| 36 | Tailor | resume/TailorScreen.tsx | ✓ | ✓ | (n/a) | real POST |
| 37 | Experience bullets | resume/ExperienceModal.tsx | ✓ | ✓ | (n/a) | real POST |
| 38 | Export checklist | resume/ExportChecklistModal.tsx | ✓ | — | (n/a) | "Preparing…" |
| 39 | Resume wizard steps | resume/wizardSteps.tsx | — | — | ✓ | EmptyStateAdd |
| 40 | Connect question feed | connect/ConnectExperience.tsx | — | — | — | |
| 41 | Connect insights | ConnectExperience.tsx | — | — | — | |
| 42 | Communities | connect/CommunityCard.tsx | — | — | — | image fallback only |
| 43 | People tab | connect/PeopleTab.tsx | — | — | — | first-use welcome only |
| 44 | New from following | connect/ProProfile.tsx | — | — | ✓ | |
| 45 | Events / tickets | ConnectExperience.tsx | — | — | — | |
| 46 | Your questions | ConnectExperience.tsx | — | — | ✓ | |
| 47 | Thread / answers | ConnectExperience.tsx | — | — | — | |
| 48 | Connect not found | ConnectExperience.tsx ConnectNotFound | (n/a) | ✓ | (n/a) | 404 |
| 49 | AT&T board | connect/att/AttCommunityView.tsx | — | — | — | |
| 50 | Mentorship chat / meetings | connect/mentorship/MentorshipTab.tsx | — | — | — | |
| 51 | Pro / Admin dashboards | connect/ProDashboardView, AdminDashboardView | — | — | — | |
| 52 | Play hub rows | play/PlayHub.tsx | — | — | — | locked "Coming soon" covers unbuilt games |
| 53 | Simulation player | play/SimulationPlayer.tsx | — | — | (n/a) | no level-load or audio-fail state |
| 54 | Glossary game | glossary/GlossaryGameExperience.tsx | ✓ | — | (n/a) | MasteryLoadingScreen |
| 55 | Levels map | glossary/LevelsMenu.tsx | — | — | — | renders nothing with 0 levels |
| 56 | Notifications inbox | app/Inbox.tsx | — | — | — | not confirmed |
| 57 | Dream Score chip | app/DreamScoreChip.tsx | — | — | (n/a) | streak hardcoded 12 |
| 58 | Counselor v2 screens | counselor/v2/states.tsx StateGate | ✓ | ✓ | ✓ | `?state=` |
| 59 | Counselor drill panels | counselor/v2/Drill.tsx | — | — | — | |
| 60 | Counselor documents | counselor/v2/DocumentDesk.tsx | — | — | ✓ | "Choose a student" ghost |
| 61 | Counselor roster filters | counselor/v2/StudentsRoster.tsx | — | — | — | covered only screen-wide |
| 62 | Principal report | counselor/v2/CounselorImpact.tsx | — | — | — | |

"Not confirmed" means the inventory didn't find a state; worth a quick look
before building one.

### Recommended order to close the gaps
1. **Global first:** an error boundary with a route `error.tsx`, a shared `Skeleton`, and route `loading.tsx` files. These cover every surface at once.
2. **Surfaces that go blank with no data:** #17 Match, #21 Routes, #23 Career Report, #55 Levels. Today these are silent blanks, the worst failure mode.
3. **Feeds that will be the first real network calls:** Home rails, Explore feed, Connect feeds, Colleges.
4. **A `?state=` switch per student screen,** like the counselor one, so every state is reviewable in the demo without code.

---

## 2. Global setup any lab or isolated render needs

- Import `src/components/marketing/tokens.css` and `src/components/app/app.css` on the page, as `src/app/flow-lab/page.tsx` does. Without app.css, no `dm-*` class exists.
- Wrap content in `<div className="marketing-v2 themeable">` so `--card`, `--glass-*` and `--space-*` resolve.
- **Theme** is a `dark` or `light` class on `<html>`, set with `setGlobalTheme()` / `useGlobalTheme()` from `app/theme.tsx`.
  - The student app defaults to dark and saves to `dreamari-theme`.
  - `/counselor*` defaults to light and saves to `dreamari-theme:counselor`.
- **Portals** go through `Portal` from `profile/CareerReport.tsx`. Its host carries `marketing-v2 themeable dm-report` and cancels body zoom with `zoom: calc(1 / var(--vz))`.
- **Keyframes** (`fade-slide-up`, `dm-text-shimmer`, `confirm-shimmer-sweep`, `next-step-*` and others) live in `src/app/globals.css`.
- **State** is localStorage stores in `src/lib/`, read with `useSyncExternalStore`: `picks`, `resume`, `studentProfile`, `preferences`, `dreamScore`, `stage`, `reportHistory`, `careerExploration`, `savedVideos`, `savedCareers`. `inbox` is in-memory. A lab must never write these.
- **Hard-coded dark colours** break light mode in `colleges/shared.tsx`, `connect/primitives.tsx`, `connect/CommunityCard.tsx`, `glossary/LevelsMenu.tsx` (by design: the game is always dark) and parts of `profile/ProfileExperience.tsx`.
- **The demo gate:** `src/middleware.ts` requires the cookie `dm_gate_2=granted` on every page route.

---

## 3. Shared primitives

### Controls
| Component | File | Props (* required) | States |
|---|---|---|---|
| Button [E] | ui/Button.tsx | `variant: primary\|secondary\|quiet`, `size: compact\|default\|large`, `href?` | disabled |
| MarketingButton [E] | marketing/Button.tsx | `variant*: primary\|ghost\|solid\|outline`, `size: md\|lg\|xl`, `href?` | |
| Listbox [E] | app/Listbox.tsx | `value*`, `onChange*`, `options*: {value,label,disabled?}[]`, `ariaLabel`, `placeholder`, `disabled` | placeholder, selected, disabled trigger/option, open, flips up (portal) |
| DatePicker [E] | app/DatePicker.tsx | `value*: YYYY-MM-DD\|""`, `onChange*`, `placeholder`, `disabled` | empty, selected, today, keyboard focus, disabled, flips (portal) |
| ForYouBrowseToggle [E] | app/ExploreExperience.tsx | `tab*`, `onTab*`, `nudge?` | nudge sweep, pill from lg |
| ExploreSectionTabs [E] | app/chrome.tsx | `active*: careers\|colleges` | animated underline; navigates |
| AudienceToggle [E] | marketing/AudienceToggle.tsx | `view*`, `onChange*` | Schools always disabled |
| Disclosure [E] | marketing/Disclosure.tsx | `id*`, `title*`, `open*`, `onToggle*`, `size: md\|sm` | open/closed |
| Disclosure / ShowAll [E] | counselor/v2/Disclosure.tsx | `id,title,summary,open,onToggle,variant` | open/closed |
| Segmented [E] | connect/viz.tsx | options, value, onChange | selected, badge counts |
| SubTabs [E] | counselor/v2/SubTabs.tsx | `options:{key,label,count?}`, value, onChange | selected |
| ScrollChips [E] | counselor/chips.tsx | options, value, onChange | selected |
| SelectBox [E] | counselor/chips.tsx | `checked,label,onChange` | checked |
| Toggle [L] | counselor/v2/Settings.tsx | `on,onChange` | on/off |
| ChipRow, InterestPicker, Field [E] | flow-lab/shared.tsx | options, value, max | selected, at-max disabled |
| PrimaryButton, QuietButton [E] | flow-lab/shared.tsx | onClick, disabled | disabled |
| PrimaryCta, QuietCta [E] | connect/primitives.tsx | sm/md, `done` | done |
| FollowButton [E] | connect/ProProfile.tsx | following, compact, dense | following |
| SaveButton [E] | colleges/shared.tsx | on | saved |
| OptionButton [E] | play/interactions.tsx | beat | selected, locked, correct, wrong |
| Resume Field, TextInput, SelectInput, ToolbarButton [E] | resume/ui.tsx | required, invalid, iconOnly | invalid, disabled |
| BackButton [E] | app/chrome.tsx | `fallback?` | navigates |
| SearchTrigger / GlobalSearch [E] | app/GlobalSearch.tsx | `onClose*` | Cmd+K, empty results, scroll lock |

### Feedback and loading
| Component | File | Props | States |
|---|---|---|---|
| Working [E] | app/Working.tsx | `label*` | the default loading treatment |
| Toast / UndoToast [E] | app/Toast.tsx, app/UndoToast.tsx | `message*`, `onClose*`, `onUndo*` (undo), `duration` | success/undo only |
| Flow-lab Toast [E] | flow-lab/shared.tsx | `text`, `low` | |
| SparkBar [E] | flow/SparkBar.tsx | `percent*`, `fill*`, `glow*`, `height`, `track`, `idle` | spark on gain |
| MatchRing [E] | app/MatchRing.tsx | `score*`, `size` | Strong ≥75, Solid ≥50, Early ≥25, Low |
| ConfirmShimmer [E] | flow/ConfirmShimmer.tsx, build/ui.tsx | `active*` | one-shot sweep |
| DreamScoreChip / DreamScoreTip [E] | app/DreamScoreChip.tsx, app/DreamScoreTip.tsx | reads dream score | |
| StatusChip, MilestoneChip, MilestonesMini [E] | counselor/chips.tsx | status | every status value |
| Verdict, MetricRow, Stat [E] | counselor/v2/overviewShared.tsx | band met/near/missed | |
| LoadingState / ErrorState / EmptyState / StateGate [E] | counselor/v2/states.tsx | `onRetry`, `view` | the only full state set in the repo |
| PhaseProgress, CardHud [E] | build/ui.tsx | percent, almostDone | |
| LiveRegion + announce() [E] | app/LiveRegion.tsx | | screen reader only |

### Surfaces and cards
| Component | File | Props | States |
|---|---|---|---|
| PosterCard, RankedPosterCard, OpenCue [E] | app/PosterCard.tsx | `career*`, `fill`, `rank` | salary chip, hover cue, long-title downshift, image fallback |
| LabCard (Match card) [E] | flow-lab/shared.tsx | career, control save\|pick\|rank, selected, rank, reason, nudge | saved, picked, ranked, nudge pulse |
| NextStepBanner [E] | app/NextStepBanner.tsx | `text*`, `ctaLabel*`, `href*`, `emphasis`, `calm`, `storageKey` | dismissible (writes a flag) |
| HoverBeam [E] | app/HoverBeam.tsx | `strength`, `duration`, `active` | hover glow |
| CardProgressiveBlur + scrims [E] | app/cardChrome.tsx | direction, size | |
| CollegeCard, SchoolCard [E] | colleges/shared.tsx | `c`, saved, compared, fit, badges | saved, compared, image fallback |
| CollegePicture, MarkBadge, CollegePlaceholder [E] | colleges/shared.tsx, colleges/CollegePlaceholder.tsx | | image fallback, 3 placeholder variants |
| CommunityCard [E] | connect/CommunityCard.tsx | community, joined, featured, compact | joined, image fallback |
| PersonCard, PeopleWelcome [E] | connect/PeopleTab.tsx | following, badge, quote | following, first-use |
| Card, SectionHead, SectionSurface, InlineAsk, LocalQuestionCard, Composer [E] | connect/primitives.tsx | | InlineAsk: joined/open, contact-info warning. Composer: submit disabled until text |
| Avatar, ProAvatar, VerifiedBadge, CompanyChip, CompanyMark, LetterMark [E] | connect/primitives.tsx | | tone photo/surface/frost |
| ProfileCard, Panel, PanelRow, SignalRow, PeopleToFollow, NewFromFollowing [E] | connect/ProProfile.tsx | | empty (NewFromFollowing) |
| OverviewCard, DonutCard, MetricTile, DrillTile [E] | counselor/v2/overviewShared.tsx, counselor/v2/Overview.tsx, connect/viz.tsx, counselor/v2/Drill.tsx | | hero glow, hover drill arrow |
| Casefile cards [E] | counselor/v2/Casefile.tsx | student | write casefile storage |
| GlassCard, ChipGrid, QuestionHeading, StepFooter, InkText, DreamySprite [E] | build/ui.tsx | | sprite image fallback |
| MatchCard [E] | flow/match/MatchCard.tsx | `card*` | |
| CTABlock, Panel, Grad, DOMark, PartnerLogoGrid [E] | marketing/* | | marketing only |
| Counselor Avatar, StudentLink [E] | counselor/chips.tsx | name, index | initials fallback (StudentLink navigates) |

### Charts (all pure props, safe)
- `connect/viz.tsx`: AreaChart, BarChart, Ring, SegmentedRing, Meter, MetricTile.
- `colleges/viz.tsx`: Donut, SplitBar, RangeBar, Ladder.
- `connect/mentorship/charts.tsx`: BarChart, Sparkline, GoalTrack, Histogram, ShareBar.
- `career/PayMap.tsx`: PayMap.
- Counselor: `v2/PlanMap.tsx` Ring, `v2/overviewShared.tsx` RankBar, `v2/CareerCollegeInsights.tsx` RankedBars.
- File-local counselor charts: PlatformEngagement's Sparkline, LoginsChart and SiteBars; MyImpact's BarRow; Drill's DrillBar.

### Navigation and chrome
All of these need the App Router, and most read the student avatar store.
- **app/chrome.tsx:** Wordmark, DesktopNavigation (`active*`, `forceBlur`; lg and up), MobileHeaderShell, MobileNav (fixed bottom, below lg), QuickLinksMenu / QuickLinksPanel (the theme row writes storage), `PAGE_TITLE_CLASS`.
- **app/Inbox.tsx:** NotificationsButton / HeaderActions. Clicking marks read and navigates.
- **app/FlowChrome.tsx:** the Build/Match header. Writes an intro flag.
- **app/SkipLink.tsx:** SkipLink.
- **counselor/v2/shell.tsx:** only CounselorShell and useCounselorFilters are exported. The filters context has no-op defaults.

### Overlays
- **Tip / IconTip [E]** (`app/IconTip.tsx`): props `label*`, `off`, `hideFromLg`. Portal, flips, clamps to the viewport. It is the house rule for every icon-only control.
- **WelcomeSplash [E]:** a modal. `FirstVisitSplash` opens itself and writes storage.
- **Coachmark / GestureSpotlight [E]** (`flow/GestureSpotlight.tsx`): coachmarks are globally off (`COACHMARKS_ENABLED=false`).
- **SidePanel, DrillPanel [E]** (`counselor/v2/SidePanel.tsx`, `counselor/v2/Drill.tsx`): portal, z-80, closes on Escape. DrillPanel navigates.
- **DetailPane [E]** (`counselor/chips.tsx`): a grid child on lg, a bottom sheet below lg.
- **FullScreenDocument, DocumentPage, FitPage [E]** (`counselor/v2/DocumentDesk.tsx`): US Letter 816×1056, zoom, share menu.
- **DocumentPreviewModal [E]** (`counselor/v2/DocumentPreview.tsx`): its `DocumentPage` name clashes with DocumentDesk's.
- **Top3SwapModal [E]** (`career/Top3SwapModal.tsx`): the Top 3 is full → Replace. Pure.
- **ConnectWithProfessionalsModal [E]:** navigates to Connect.
- **DetailModal, TopThreeScreen, RankSlots, PicksTray, BottomBar [E]** (`flow-lab/shared.tsx`): the Match flow's pieces.
- **ResumeModal, ZoomResumeModal, ExportChecklistModal, TextPreviewModal [E]** (`resume/*`).
- **LevelsMenu [E]** (`glossary/LevelsMenu.tsx`): four skins, and nodes are locked, done or current.
- **InfoButton / InfoSheet [E]** (`flow-lab/notes.tsx`).

### Motion and decor
- **Border and highlight effects:** HoverBeam, ConfirmShimmer, PlayBurst (`nonce`), Confetti (`colors*`, `active*`).
- **Hints and transitions:** GestureHint (`direction*`), StepTransition.
- **Full-screen backgrounds:** AuroraBackground and BackgroundSpace (need ThemeProvider; fixed), AppBackdrop (fixed), and PlayBackdrop V1 / V2 CRT / V3 Dots / V4 Synth.
- **Canvas animations:** StarsBackground, FireworksBackground and Vortex. The last two keep the CPU busy.
- **Icons:** StreakFlame and ScoreBolt; 24 line icons in `flow/icons.tsx`; Lucide everywhere else.

### CSS utilities
**`app/app.css`**
- Buttons and taps: `dm-solid`, `dm-quiet`, `dm-link`, `dm-chip-hover`, `dm-tap`.
- Scrollbar: `dm-scroll` (the required styled scrollbar).
- Glass elevation (light mode): `dm-glass`, `dm-glass-2`, `dm-glass-3`.
- Inputs: `dm-beam-input`.
- Nudges: `dm-logo-shimmer`, `dm-title-shimmer` (decorative, not a loading state), `dm-text-nudge`, `dm-nudge-spark`, `dm-nudge-glow`, `dm-tab-nudge`, `dm-swipe-nudge`, `dm-progress-fill`.
- Reveals: `seq-reveal`, `filters-reveal`, `face-swap`, `tab-hint`.
- Scroll and zoom: `foryou-snap`, `env-zoom-active`.
- Print and report: `no-print`, `dm-report`, `dm-print-footer`.

**`src/app/globals.css`**
- Flow: `flow-scroll` (hidden scrollbar), `flow-scroll-fade`, `flow-sticky-footer`.
- Posters and rails: `poster-card`, `poster-row`, `dreamari-card-rail`.
- Connect: `connect-ticket`.
- XP: `xp-shimmer-ink`.
- Game themes: `.play-crt`, `.play-dots`, `.play-synth`.
- Marketing: `mkt-*`.

---

## 4. Feature components (mostly file-local)

**Profile** (`profile/`). Data: `profile/data.ts`, `report-data.ts`, `gradePlanData.ts`.
- **Inside `ProfileExperience.tsx`, all [L]:**
  - Tabs: Top3Tab (empty, primary, tour), OverviewTabV2 (NothingSavedYet, seasons), RoutesTab (null with no focus), MyPlanTab/GradePlanCard (writes the stage store), LockerTab.
  - Sheets and tables: CompareSheet/CompareChart, EvidenceSheet, RouteRow, RouteDetailModal, CompareTable.
  - Shelves: SchoolsShelf and VideosShelf.
  - Settings and report: SettingsView (can navigate the window), ReportOverlay.
  - Photos: ProfilePhoto (fallback).
- **CareerReport.tsx:** CareerReportView [E] (tabs; share/print write history), CareerReportDocument [E] (pure; null with no data), ReflectionCard [L] (writes).
- **PreferencesTab [E]:** skeleton, save error, confirming. Chip [L] has `on` and `dim` at cap.
- **Other:** CareerExplorationBody [E] (empty state; writes), SeasonScene [E], EventStubs [E] (empty).

**Career** (`career/`). Data: `profiles.ts`, `data.ts`.
- CareerDetailExperience [E] (page). Its Figure, Section and DotList are [E].
- File-local [L]: FactPopover, DegreeSheet, Rung, PayRows, TabComingSoon.
- PayMap [E] is pure. Top3SwapModal [E] is pure.

**Colleges** (`colleges/`). Data: `data.ts`, `pathway.ts`, `images.ts`.
- Cards and pictures: see section 3.
- BrowseShelves [E] reads stores.
- ForYouSchools [E] writes its GPA and hidden keys. Its Menu, Sheet, WhySheet and EditSheet are [L].
- The pages' FilterTray and CompareSheet are [L].

**Connect** (`connect/`). Data: `data.ts`, `att/attData.ts`, `mentorship/mentorshipData.ts`.
- Needs the `ConnectNav` context: provide a mock outside ConnectExperience.
- **Inside `ConnectExperience.tsx`, all [L]:**
  - Question and insight cards, in compact, aligned and rail variants.
  - HelpfulPill, StatusChip, sheets (Ask, Report, Join, EventCode), ReplyComposer, CommentRow, ReactionRow.
  - YourQuestions (empty) and ConnectNotFound (404).
  - It also holds shadow copies of primitives.tsx pieces; use the primitives versions.
- **AttCommunityView [E]:** everything inside is [L] (OpportunityCard, ModuleCard, PollCard, DeadlineChip). Writes resume.
- **MentorshipTab [E]:** sets inbox context on mount and plays a message tone. Everything inside is [L] (ChatDock, MeetingCard, ProgramTile).

**Play** (`play/`). Data: `games.ts`, `ib-level-*.ts`, `rn-level-1.ts`, `performance-plan.ts`.
- **`interactions.tsx`, all [E], pure:** OptionButton, Question, the beat bodies (Card, Check, Reveal, Flips, Focus, Choice, Match, Rapid, Chain, Slider, Flags, Rank, Pick, Bucket) and BossOverlay. These are the best lab candidates.
- **SimulationPlayer (page):** plays music and writes saves. Its Hud, ScoreGauge, Clock, DialogueBox, FeedbackSheet and EndingCard are [L].
- **PlayHub:** RowCard, HeroShelfCard and CornerBadge (lock) are [L].
- **Other:** PerformancePlanFlow [E] (warning, step, passed, terminated). ConnectInterstitial [E] (awards XP on click). TrailerFlow [E] (plays music).

**Glossary** (`glossary/`). Data: `data.ts`.
- LevelsMenu [E].
- **GlossaryGameExperience, all [L]:**
  - Screens: Intro, LessonIntro, Unlock, Question, PowerPlay, MasteryLoading, Complete.
  - Cards: TermFlipCard, OptionList, TypeTerm, MatchUp, SortBuckets, ProfitBuilder.
  - Feedback: FeedbackPanel, StreakModal, SpeechBubble.
  - `CompleteScreenGate` writes on mount; render `CompleteScreen` instead.

**Build** (`build/`). Data: `types.ts`.
- `ui.tsx` [E]: see section 3.
- Step screens [E] are pure.
- MilestoneScreen plays a chime on mount. CompletionScreen plays XP audio and awards score on mount.

**Resume** (`resume/`). Data: `data.ts` `SAMPLE_RESUME_DATA`, and `src/lib/resume.ts` `EMPTY_RESUME`.
- ResumeDocument [E]: pure, with an empty hint.
- TemplateGallery [E]: safe.
- JobMatchPanel, TailorScreen and ExperienceModal make **real POSTs** to `/api/resume-*`.
- Wizard steps write the resume store.
- VersionCard and ScoreBadge are [L].

**Match** (`match-lab/`, `flow-lab/`)
- MiniExploreMatch (live), MatchGrid and MatchLab (both dormant) write picks and navigate.
- Their pieces are in `flow-lab/shared.tsx` (see section 3).

---

## 5. Unsafe to render in isolation

- **Navigate on their own:** MatchLab, MatchGrid, MiniExploreMatch, ReportChooser (260 ms after a choice). Router-bound CTAs are everywhere, so render inside the App Router.
- **Audio on mount:** SimulationPlayer, TrailerFlow, MilestoneScreen, CompletionScreen, Explore VideoCard (with sound), CompanyVideoCards (muted autoplay), MentorshipTab.
- **Write real stores on mount:** CompleteScreenGate, CompletionScreen, ProfileExperience (cover image), MentorshipTab.
- **Write on interaction:**
  - Profile and report: resume wizard steps, CareerReportView, ReflectionCard, PreferencesTab, CareerExplorationBody, GradePlanCard.
  - Play and colleges: ConnectInterstitial, the college save hooks.
  - Connect: ProfileHeaderCard, AttCommunityView.
  - Other: V2Flow, NextStepBanner (with `storageKey`), QuickLinksPanel theme row, NotificationsButton.
  - Counselor: casefile cards, ReviewQueue, BatchComposer, Settings.
- **Network:** JobMatchPanel, TailorScreen, ExperienceModal, DemoRequestForm (emails product@dreamopportunity.org).
- **Global side effects:** ScrollReset, ErrorReporter, ThemeBoot. WelcomeSplash and GlobalSearch lock body scroll. SearchTrigger adds a global Cmd+K listener.
- **Fixed full-screen layers:** AppBackdrop, BackgroundSpace, AuroraBackground, MobileNav, FlowChrome, toasts, SidePanel, FullScreenDocument.
- **CPU-heavy:** Vortex, FireworksBackground, AuroraBackground. Render one at a time.
- **Printing:** `printDocumentPage` and the MyImpact print buttons.
