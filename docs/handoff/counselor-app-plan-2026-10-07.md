# Counselor app: consolidated feedback and build plan (7 Oct 2026)

Source notes: `docs/reference/counselor-reimagine-notes-2026-10-07.md` (Joshua, Maisha, Usman, verbatim).
Assumption from Chandu: student academic data (roster, courses, grades, GPA) arrives through OneRoster or the SIS.
Design decision from Chandu: build on the **student design system**, not the counselor v4 glass style.

---

## 1. What all three asked for, in one place

**The goal (Joshua):** a counselor opens Dreamari, or gets ready to meet a student, and within a few clicks feels informed, prepared and confident. It answers five questions:
1. What are my students interested in?
2. Who needs my help?
3. What do I need to know to advise them well?
4. How do I prepare for my next meeting?
5. Are my students meeting the requirements that matter?

**The feel:**
- Dreamari for adults. Same world as students, designed for an advisor (Joshua).
- Reach the student app's "wow" (Joshua).
- Keep the clean, easy-to-process v4 qualities (Maisha).
- Same design system as students, with Dreamy and gamification (Usman).
- Better light mode for both apps (Usman).
- 8th-grade reading level (Joshua).
- Less spreadsheet, fewer borders and labels, more imagery, progressive disclosure (Joshua, Maisha).

**Structure (Joshua):** Home | Students | Explore | Prepare | Workspace | Analytics, each with its own sub-tabs.
- Explore makes the counselor smarter while advising.
- Analytics tells the school whether students are on track.
- Prepare connects the two for one student meeting.

**Not negotiable (Joshua):** match competitors one to one on required analytics. Everything else is open season. Aim for something competitors cannot copy with a UI refresh.

**Specific asks (Maisha):**
- Top careers and colleges as interactive Explore card carousels, not bar charts.
- Career Interests on Home as Explore cards.
- Counselor profiles: 4 to 5 counselors per school, profile-style cards.
- "Students who need you" as a horizontal card row.
- Icons for recurring milestones (Academic Plan, Resume, Financial Aid).
- New metric formats (sphere breakdowns, radial instead of bars).
- Still to come from her: how to consolidate Milestones and Student Progress.

### Tensions to settle on the call

| Tension | Proposed resolution |
|---|---|
| Joshua: "rethink fundamentally" vs Maisha: "v4 is leaps better, keep the clean feel" | Keep v4's information hierarchy and calm. Rebuild the surfaces on the student design system. |
| Usman: "same design system" vs counselor data density | Student system is the base: tokens, type, cards, chrome, states, motion. Add a small counselor layer only for dense data (tables, filters, indicator charts). |
| Gamification for adults | Progress and momentum, not points-for-points: caseload goals met, weekly momentum, milestones cleared. Opt-in, quiet. Confirm with Usman. |
| Configurable Analytics vs one product | One indicator registry, tagged by state/district. Each district gets a profile that picks its indicators. One codebase. |

---

## 2. Design system: what we reuse (from the student app)

| Need | Student component (path) | Notes |
|---|---|---|
| Career cards | `app/PosterCard.tsx` (PosterCard, RankedPosterCard), `career/heroFocus.ts` | Takes a CatalogCareer. Ranked variant fits "top saved careers". |
| College cards | `colleges/shared.tsx` (CollegeCard, SchoolCard, CollegePicture, MarkBadge) | Real IPEDS data behind them. |
| Rails and carousels | ExploreExperience `Rail`, `PosterRail`, `TrendingRail` | **Private today; extract to shared.** |
| Hero carousel | HomeExperience `HeroBanner`, `HeroPanel` | Private; extract. Fits the Home first impression. |
| Video cards | `app/CompanyVideoCards.tsx`, Explore `VideoCard` | VideoCard is private; extract. |
| Filters | `colleges/filterKit.tsx` (Option, Chips, Dropdown) | Best fit for Explore and Analytics filters. |
| Detail pages | `career/CareerDetailExperience.tsx`, `colleges/CollegeDetailExperience.tsx`, `career/PayMap.tsx` | Counselors open the same career and college pages students see. |
| Chrome | `app/chrome.tsx` (DesktopNavigation, MobileNav), `app/Inbox.tsx` | Student tab list is hard-coded; needs a counselor nav prop or fork. |
| Controls | `ui/Button.tsx`, `app/TextTabs.tsx`, `app/Listbox.tsx`, `app/IconTip.tsx`, `app/Toast.tsx`, `app/ActionStrip.tsx`, `app/MatchRing.tsx` | Reuse as is. |
| States | `app/states.tsx`, `app/SurfaceState.tsx` | Reuse as is (loading, empty, error, offline, locked). |
| Motion | `flow/SparkBar.tsx`, `flow/ConfirmShimmer.tsx`, `app/HoverBeam.tsx`, BorderBeam, nudge sweep | Reuse, tuned down for adults. |
| Dreamy | `public/images/dreamy/v2` (11 poses), `build/DreamyGuide.tsx` | Guide moments only: onboarding, cleared queues, tips. |
| Gamification | `app/DreamScoreChip.tsx`, `app/xpFlight.ts`, `leaderboard/*` | Patterns to adapt; student content does not carry over. |
| Tokens and theme | `design-tokens/*.tokens.json`, `app/theme.tsx` | Counselor app needs its own theme key and default. Light mode pass covers both apps. |

New counselor-layer components (small set): indicator card, configurable metric chart (radial, sphere breakdown, trend), dense student table with filters, Student Brief sections, counselor profile card, milestone icon set.

---

## 3. Data: what exists, what OneRoster/SIS adds, what is missing

| Data | Today | Source going forward |
|---|---|---|
| Career catalog, ~300 profiles (pay, education, ladder, related majors, skills text) | ~137 sourced from BLS OEWS 2025, Projections 2025-35, O\*NET; ~139 approximate | Keep. Source the approximate ones. |
| State wages per career | Real: OEWS 2025, `career/stateWages.ts` | Keep. |
| State demand / Top 25 in-demand by state | **Missing** (national openings only) | Add state projections (state labor market offices via Projections Central) |
| Search careers by subject or skill ("Math") | **Missing**: search covers titles and keywords only | Build a subject/skill to career index from O\*NET knowledge and skills |
| Colleges (5,716; cost, admit rate, SAT/ACT, programs, location) | Real: IPEDS and College Scorecard | Keep. Reach/Target/Safety logic exists in `colleges/pathway.ts`. |
| Scholarships (82), programs (74), internships (32) | Real, with verified dates | Keep. Feeds Postsecondary and Prepare. |
| Student interests, subjects, Top 3, saved careers and colleges, preferences (states, budget, education level, school types) | Exists in `lib/studentSignals.ts` and `lib/preferences.ts`, per browser | Move to the backend per student (Usman) |
| Roster, courses, grades, GPA, attendance | Mock (`counselorSis.ts`) | **OneRoster / SIS** (assumed) |
| Graduation requirements, assessments (SAT/ACT/AP/IB/TSI) | Missing | SIS or Ed-Fi; varies by state |
| Applications, Common App progress, transcripts, recommendations | Milestone statuses (synthetic) | Common App integration plus counselor workflow |
| FAFSA / state aid completion | Milestone status (synthetic) | State FAFSA completion portals (many states share school-level data) |
| WBL: hours, internships, shadows, certifications, CTE completion | Missing | School logs plus counselor entry; CTE from SIS |
| Outcomes: enrollment, persistence | Leader demo only | National Student Clearinghouse (StudentTracker) |
| Career videos and views | 10 real videos, no career tags, no counts | Tag videos to careers; log views |
| Simulations and plays | 3 simulations, no play counts | Log plays per student |
| Counselors (profiles, caseloads) | 3 synthetic | Backend user and role records (Usman) |

---

## 4. The app, area by area

### Home: "What are my students excited about, who needs me, what next?"
- **Hero:** rotating hero (reuse HeroPanel) of the most-saved careers, with Explore imagery.
- **Top saved careers and colleges:** interactive card carousel (Maisha's references), top ones highlighted. Reuses RankedPosterCard and CollegeCard.
- **Interests:** top industries and interests as world cards, not bars.
- **Media:** most-watched videos (playable) and most-played simulations.
- **The numbers:** three only. Students, % On Track, Need Attention.
- **Students Who Need You:** horizontal card row with portrait, reason and one action.
- **Momentum:** activity across the school, always shown as progress.
- **Turn Interest Into Opportunity:** recommendations as cards.
- **Data:** student signals (needs backend storage), video and play logs (new), at-risk from SIS plus milestones.

### Explore: "Help me become a better advisor" (Careers | Schools | Labor Market)
- **Careers:** the student Explore (rails, search, detail pages). Adds search by subject or skill (new index) and a Professional / Skilled Trades toggle.
- **Schools:** the student Schools browse with filterKit. 4-year, 2-year and trade data is already there.
- **Labor Market:**
  - Top 25 In-Demand by State, with a state switcher (needs state projections).
  - PayMap per career (exists).
  - State compare later.
- **Data:** mostly exists today. **Highest wow-to-effort ratio; least dependent on the backend.**

### Prepare: "Ready for my next meeting in minutes"
- **Picking a student:** pick a student, or open from a calendar or meeting entry.
- **Student Brief:** a visual brief built from:
  - Career Report, Top 3 and saved careers;
  - interests, subjects and skills;
  - GPA and courses (OneRoster);
  - preferences (education level, states, budget);
  - activity and verified progress.
- **Then surface:**
  - best-fit careers and majors;
  - colleges by GPA, location and budget, with Reach/Target/Safety (exists in `colleges/pathway.ts`);
  - trade and non-degree paths;
  - in-demand careers in their preferred states;
  - talking points and items needing review.
- **Export:** to Assist as a meeting brief document (exists).
- **Data:** signals and preferences per student (backend), GPA and courses (OneRoster), state demand (new).

### Analytics: "Are students meeting the requirements that matter?"
- **Tabs:** Readiness | Postsecondary | Career & WBL | Risk | Outcomes | Engagement.
- **Indicator registry:** one registry of indicators, each with definition, source, owner and the states that require it. A district profile picks what shows.
- **Metric formats:** Maisha's (radial, sphere breakdown), plus the dot grid and dot-and-diamond chart that already work.
- **Risk:** a prioritized intervention list with reasons. It's the one list counselors act on.
- **Engagement:** one tab, holding Dreamari-specific activity.
- **Data:** OneRoster/SIS (grades, courses), Ed-Fi/SIS (requirements, assessments), Common App, FAFSA portals, WBL logs, Clearinghouse.

### Students + Workspace (operational, keeps working)
- **Students:** Directory, Milestones, Student Progress, Review Desk.
- **Workspace:** Connect, Assist.
- Rebuilt on the student design system, same features. Waits on Maisha's Milestones / Student Progress note.

### Across the app
- **Counselor profile:** profile-style home identity. Teammate cards for the 4 to 5 counselors per school.
- **Milestone icons:** an icon set for Academic Plan, Resume, Financial Aid and the rest, used everywhere.
- **Dreamy and gamification:** Dreamy as a guide; quiet progress gamification (see tensions table).

---

## 5. Build order

**Phase 0: foundations**
- Counselor chrome on `app/chrome.tsx` (nav prop or fork), its own theme key.
- Extract the private Explore and Home rails and cards into shared components.
- Data adapter layer with OneRoster-shaped mock data, so screens are built against the real shape.
- Light-mode pass on shared components (helps both apps, Usman's ask).

**Phase 1: Explore and Home**
- **Why first:** biggest wow, most of the data already exists, least dependent on the backend.
- Explore: student Explore plus subject/skill search plus Labor Market (state projections).
- Home: carousels, Students Who Need You, momentum, recommendations.
- Video and simulation tiles: once view and play logging exists.

**Phase 2: Prepare**
- Student Brief and the fit lists. Needs per-student signals in the backend plus OneRoster GPA and courses.

**Phase 3: Analytics**
- Indicator registry and district profiles, then the six tabs.
- Readiness and Risk first (OneRoster), then Postsecondary (Common App, FAFSA), Career & WBL, Outcomes.

**Phase 4: Students + Workspace**
- Port the operational screens to the new system. Fold in Maisha's consolidation decision.

**Phase 5: identity and polish**
- Counselor profiles, milestone icons, gamification, Dreamy moments, final light-mode and WCAG pass.

## 6. Open questions for Usman and the call
1. Integrations:
   - Which ones and when: OneRoster vs Ed-Fi vs Clever/ClassLink vs direct SIS?
   - Common App, FAFSA portals, Clearinghouse?
2. Which student signals move from browser storage to the backend, and when?
3. Roles and permissions: counselor, lead counselor, school leader, district leader.
4. State projections: do the existing government API pulls include state-level demand?
5. Video and simulation event logging: who owns it?
6. The first pilot districts' states, so Analytics is configured for real requirements first.
