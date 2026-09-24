# Dreamari prototype: engineering handoff index

Start here. This file tells an engineer, or an AI agent working for one, what is locked, where the truth for each feature lives, and what is demo scaffolding that must not be built.

Last updated: 21 September 2026. Demo build tag: `demo-2026-09-06` on `main`.

## How to use this repo

1. Read this file, then the spec for the feature you are building in `docs/handoff/specs/`. Each spec is short and overwrites itself; it is the current state, not a history.
2. Copy, numbers and content come from the data files listed below, never from screenshots or older docs.
3. Design tokens come from the certified Figma export, not from this repo's `design-tokens/` folder. Layout, behaviour and copy come from `src/`. See `docs/DESIGN_SYSTEM_ALIGNMENT.md`.
4. `docs/AI_HANDOFF.md` is a chronological session log kept for archaeology. Do not build from it; where it disagrees with a spec, the spec wins.
5. Pull a tagged commit, not "whatever is on main". Tags named `demo-YYYY-MM-DD` are demo-ready builds.
6. Before any layout, scrolling, positioning or icon-only-control work, read `docs/CROSS_BROWSER_GUARDRAILS.md`. Most students are on Windows laptops or Chromebooks, not Mac, and that mismatch has already shipped real bugs no one on a Mac could see. It has a self-check to run before calling UI work done.
6a. When a screen needs an empty, loading, error, or edge-case treatment and no locked spec says otherwise, use `docs/COMPONENT_STATES_PLAYBOOK.md`'s default instead of inventing one or waiting on a design pass.
7. Before treating anything below as still true, grep for it (`DEMO-ONLY` in code, the flag name, the file). This section decays; the code is the source of truth for whether a flag still exists.

## Source of truth for content

| Content | File |
|---|---|
| Career catalogue (titles, worlds, posters, medians shown on cards) | `src/components/app/catalog.ts` |
| Match deck careers | `src/components/match-lab/data.ts` |
| Profile careers, routes, roadmap (plan) steps | `src/components/profile/data.ts` |
| Career Reports (medians, majors, colleges, classes, sources) | `src/components/profile/report-data.ts` |
| Career detail pages | `src/components/career/profiles.generated.ts`, `src/components/career/data.ts` |
| Connect: professionals, communities, threads, insights, events, resources | `src/components/connect/data.ts` |
| Volunteer headshots | `public/images/connect/avatars/pro-*.jpg` (mapped in `src/components/connect/primitives.tsx`) |
| Event gallery photos (licensed, attributions) | `public/images/connect/events/`, `ATTRIBUTION.md` |
| Play simulations and glossary content | `src/components/play/games.ts`, `src/components/play/ib-level-*.ts`, `src/components/glossary/data.ts` |
| Counselor Dashboard caseload (the reference's 120 students, verbatim: roster table + every drill-down) | `src/lib/counselorRosterData.ts`, `src/lib/counselorProfileData.ts`, assembled by `src/lib/counselorRoster.ts` |

## Routes

`/` landing · `/flow` Build · `/match-lab` Match · `/profile` My Profile (tabs via `?tab=overview|top3|plan|report|resume`) · `/play` Play hub · `/play/[game]` simulation · `/play/glossary/[career]` glossary game · `/explore` Explore (`?tab=browse`) · `/career/[slug]` career detail · `/colleges`, `/colleges/[slug]` · `/connect` Connect (`?event=`, `?pro=`, `?dashboard=`, `?as=`) · `/home` · `/signup` · `/career-report`.

## Feature status

| Feature | Spec | Status |
|---|---|---|
| Landing page | specs/landing.md | Locked (5 Sept notes applied) |
| Build | specs/build.md | Locked, including the Dream Score moment |
| Match | specs/match.md | Locked |
| Profile: Overview | specs/profile-overview.md | In review (Do this next pattern open with Joshua) |
| Profile: Top Three | specs/top-three.md | Locked (Play CTA routes to IB only, by instruction) |
| Profile: My Plan (roadmap) | specs/my-plan.md | Locked for finance careers; other careers placeholder |
| Profile: Career Report | specs/career-report.md | Locked |
| Profile: Resume | none yet | Built (`src/components/resume/`, `ResumeExperience`) -- no locked spec written yet, so treat behaviour/copy in `src/` as current-but-unreviewed, not as a source of truth to build further on without checking with Joshua |
| Play | specs/play.md | Locked (IB simulation is the only playable) |
| Explore | specs/explore.md | Locked |
| Connect (student, events, professional profile, volunteer dashboard) | specs/connect.md | Locked |
| Dream Score (XP) | specs/dream-score.md | Locked for Build; later milestones unspecified |
| Progression system (Dreams, Your Sky, Altitude, badges) | specs/progression-system.md | Proposal, not locked; do not build until Joshua signs off |

## Demo vs Production

Everything in this section is demo scaffolding: built to make the prototype
demoable, not meant to reach production as-is. Every code site is tagged
`DEMO-ONLY:` in its own comment (exact casing) -- `grep -rn "DEMO-ONLY" src`
returns the complete, current, authoritative list; treat the bullets below as
a guided tour of that grep, not a substitute for running it. If a bullet here
and the code disagree, the code is right and this file is stale -- fix the
file.

### Toggle-able demo flags (flip to `false`/remove before shipping)

| Flag | File | What it does when on |
|---|---|---|
| `SHOW_DAILY_DROP` | `src/components/app/HomeExperience.tsx` | `false` right now: Home's Daily Drop panel and its takeover are *hidden* for the school focus group. Flip to `true` to bring them back. |
| `COACHMARKS_ENABLED` | `src/components/flow/GestureSpotlight.tsx` | `false` right now: every Coachmark (Explore's For You -> Schools tour, the action-icon hints on the reel and Career Detail) is *off* for demos. Flip to `true` to bring them all back exactly as they were; the per-device "seen" flags are untouched. |
| `DEMO_ALWAYS_SHOW_GUIDE` | `src/components/match-lab/MatchLab.tsx` | Match Lab's gesture guide replays on every open instead of once per session. |
| `DEMO_ALWAYS_SHOW_SPLASH` | `src/components/app/WelcomeSplash.tsx` | The welcome splash shows on every visit instead of once, and a plain refresh brings it back. |
| `DEMO_CONNECT_SHORTCUT` | `src/components/play/SimulationPlayer.tsx` | A HUD button jumps straight to the Connect interstitial without replaying a level, for faster QA. |
| `DEMO_LINKS` | `src/components/app/chrome.tsx` | The role-perspective quick links (Student / Attendee / Volunteer / Partner / Staff) shown from the nav. |
| `COUNSELOR_LINKS` | `src/components/app/chrome.tsx` | The "Counselor Dashboard" quick link ("Counselor Demo" divider). Entry point into the separate `/counselor` product -- see below and `docs/AI_HANDOFF.md`, 22 Sept 2026. |

### Demo-only UI, not behind a single flag

- **Counselor Dashboard** (`/counselor`, `/counselor/login`, `/counselor/signup`) -- `src/app/counselor/`, `src/components/counselor/`. A genuinely separate product from the student app (own shell, own sign-up/sign-in, no shared chrome), reachable only from the hamburger's "Counselor Demo" quick link since there's no real counselor-account/org onboarding yet. Reads real data where it exists (one live student, from this browser's own localStorage) inside an otherwise seeded 119-student roster -- see `src/lib/counselorRoster.ts`'s own header comment before treating any one row as real aggregate data, and `docs/AI_HANDOFF.md`, 22 Sept 2026 for the full rationale. Originally a 1:1 port of a Replit reference (structure/copy/vocabulary matched, our own visual execution); it's now being improved screen by screen, and every change to content, data, or structure away from that original port is logged in `docs/COUNSELOR_DASHBOARD_REFERENCE_DEVIATIONS.md` -- read that file before assuming this dashboard still matches the reference anywhere.
- **Counselor Dashboard version chip** (`v1`/`v2`, `?v=2`, remembered in localStorage `dreamari:counselor-version`) -- `src/components/counselor/version.tsx`, switched per view in `CounselorApp.tsx`, docked bottom-center by `shell.tsx`. v1 is the reference port, 1:1 in structure and content (reset to that on 24 Sept 2026), with only our visual language on top; v2 is a fork (`src/components/counselor/v2/`, one file per screen) where every content/structure change lands, so the two can be compared live. `src/lib/counselorReviews.ts` (persisted review decisions) is read by v2 only. Demo-only plumbing; whichever build wins should be collapsed back into one set of files.
- **Connect role switch** (`Student / Attendee / Volunteer / Partner / Staff`) and the `?as=` URL parameter, plus the volunteer picker row under it -- `src/components/connect/ConnectExperience.tsx` (search `DEMO-ONLY: role switcher`). Production has one role per signed-in user; there is no role-switching UI in production at all.
- **AT&T board version chip** (`v1`/`v2`, `?v=2`) -- `src/components/connect/att/VersionChip.tsx` and its state in `ConnectExperience.tsx`. v1 is Joshua's Replit reference, faithfully ported; v2.0 is the reach-first rebuild. Both are real, neither is hidden; the chip is demo-only plumbing to compare them live. AT&T-specific changes only ship on explicit instruction naming AT&T.
- **Profile Overview version chip** (`v1`/`v2`) -- `src/components/profile/ProfileExperience.tsx` (search `DEMO-ONLY, session-only`). Same pattern as the AT&T chip: both versions are real, the toggle is demo-only.
- **Career detail "Play Game" / demo-gate tension** -- `src/components/career/CareerDetailExperience.tsx`. Joshua's standing rule is "never show 'coming soon' in the demo," which is why a missing simulation currently just doesn't show a Play button rather than showing one disabled. A later instruction asked for a disabled + "Coming soon" treatment instead; that's deferred by design (noted, not built) until the demo period ends -- see `docs/AI_HANDOFF.md`, 21 Sept 2026.

### Client-side persistence standing in for a real backend

Every key below is `localStorage`, scoped to one browser, with no account or
server behind it. In production, anything that represents the STUDENT'S OWN
data (profile, picks, score, reports, resume) must move server-side, tied to
their signed-in account -- a browser reinstall or a different device
currently loses all of it. Pure UI convenience state (theme, mute flags,
one-time nudge dismissals) is lower-stakes and could plausibly stay
client-side even in production, but is unscoped per-account today, so a
shared/public computer currently leaks one student's preferences to the next
person who opens the app.

Student data that must move server-side:
- `dreamari-student-profile`, `dreamari-student-profile-archive` -- the Build flow's saved profile.
- `dreamari-picks` -- Top 3 / saved careers.
- `dreamari-report-history` -- Career Report history.
- `dreamari-resume` -- the Resume Builder's data.
- `dreamari-career-exploration` -- My Reflection / career interest ratings.
- `dreamari:dream-score`, `dreamari:dream-score:awards`, `dreamari:dream-score:intro-seen` -- Dream Score (XP) and its award ledger; production awards once per milestone id server-side (see `src/lib/dreamScore.ts`).
- `dreamari-play-progress`, `dreamari-glossary-progress` -- Play/glossary completion.
- `dreamari-cover`, `dreamari-jordan-avatar` -- profile cover photo and avatar choice.
- `dreamari-stage` -- high school vs. college (`src/lib/stage.ts`). Real accounts know this already; the prototype keeps it in storage so one demo toggle (My Plan) can flip what the whole app shows, notifications included. Mentorship and chat are strictly college.

Pure UI/session convenience state (lower priority, but still per-browser today):
- `dreamari-theme` -- light/dark preference.
- `dreamari-play-muted`, `dreamari-play-music-muted`, `dreamari-video-sound-muted`, `dreamari:reel-sound-on` -- mute toggles.
- `dreamari:hint-progress:match-swipe:session`, `dreamari:welcome-done`, `dreamari:welcome:*`, `dreamari:nudge:*`, `dreamari:schools-tab-nudged:session` -- one-time gesture/welcome/nudge dismissals.
- `dreamari:top3-keep-exploring-dismissed`, `dreamari:play-explore-bridge-dismissed`, `dreamari:resume-connect-next-step-dismissed` -- banner dismissals.
- `dreamari:schools-use-gpa` -- the For You Schools GPA toggle (local UI state, NOT read from the student's saved profile GPA -- a real inconsistency with Career Report's Reach/Target/Safety badges, which use a static data field instead; flagged, not resolved, `docs/AI_HANDOFF.md` 21 Sept 2026).
- `dreamari-error-log` -- client-side error capture, prototype-only.

This list is a snapshot; `grep -rohE '"dreamari[a-z0-9:_-]*"' src` returns the live, current set.

### Seeded / mock content

All counts, followers, views, likes, impact numbers, event codes, and the
notification feed (`src/components/app/notificationsData.ts`, written for a
fictional "demo student, Jordan") are seeded demo data, not real. **The
career/school comparison tables' underlying data accuracy is Usman's scope,
not a UI question** -- confirmed data-mapping work, not yet independently
verified by this codebase's own agents.

### A data-completeness gap worth knowing about (Usman's domain)

`PROS` (`src/components/connect/data.ts`) only has professionals for 6 of the
app's 16 career worlds; `COMMUNITIES` only covers 5. Career Detail's "Connect"
button is now hidden for any career whose world has no professionals (fixed
21 Sept 2026 -- it used to always show, opening onto an empty modal). This
means 10 of 16 worlds currently show no Connect entry point at all. Whether
more worlds need professionals/communities added is a content/data question
for Usman, not a UI one.

## Known gaps (by instruction)

- Top Three / My Plan Play CTA routes to the Investment Banking simulation regardless of the #1 career (Joshua: IB only for now).
- Only Investment Banking and Private Equity carry the official roadmap copy.
- Next-step banner does not yet change after the simulation is completed (no copy specified).
- Career detail "Pay by state" panel shows state pay next to the national median; product decision pending.

## College image fallback assets — 23 September 2026

Usman / importing agent: read [College image fallbacks](handoff/specs/college-image-fallbacks.md) before changing school image handling. The branded SVG fallback is installed behind existing photos, including failed-load handling. Assets, PNG exports, shareable ZIP and image-only preview live in `public/images/colleges/placeholders/`. All working existing photos remain visible; the absence of a visible change in the demo is expected. This is a real fallback, not a demo-only flag.
