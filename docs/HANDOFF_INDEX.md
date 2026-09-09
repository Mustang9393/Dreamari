# Dreamari prototype: engineering handoff index

Start here. This file tells an engineer, or an AI agent working for one, what is locked, where the truth for each feature lives, and what is demo scaffolding that must not be built.

Last updated: 6 September 2026. Demo build tag: `demo-2026-09-06` on `main`.

## How to use this repo

1. Read this file, then the spec for the feature you are building in `docs/handoff/specs/`. Each spec is short and overwrites itself; it is the current state, not a history.
2. Copy, numbers and content come from the data files listed below, never from screenshots or older docs.
3. Design tokens come from the certified Figma export, not from this repo's `design-tokens/` folder. Layout, behaviour and copy come from `src/`. See `docs/DESIGN_SYSTEM_ALIGNMENT.md`.
4. `docs/AI_HANDOFF.md` is a chronological session log kept for archaeology. Do not build from it; where it disagrees with a spec, the spec wins.
5. Pull a tagged commit, not "whatever is on main". Tags named `demo-YYYY-MM-DD` are demo-ready builds.

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
| Profile: Resume | specs/profile-overview.md | Placeholder ("Coming soon") |
| Play | specs/play.md | Locked (IB simulation is the only playable) |
| Explore | specs/explore.md | Locked |
| Connect (student, events, professional profile, volunteer dashboard) | specs/connect.md | Locked |
| Dream Score (XP) | specs/dream-score.md | Locked for Build; later milestones unspecified |
| Progression system (Dreams, Your Sky, Altitude, badges) | specs/progression-system.md | Proposal, not locked; do not build until Joshua signs off |

## Demo-only scaffolding (do not build)

- Connect role switch (`Student / Attendee / Volunteer / Partner / Staff`) and the `?as=` URL parameter. Production has one role per signed-in user.
- Volunteer picker row under the role switch.
- Per-viewer state in `localStorage`: Dream Score (`dreamari:dream-score`, `dreamari:dream-score:awards`), gesture hint progress (`dreamari:hint-progress:match-swipe`), banner dismissals (`dreamari:top3-next-step-dismissed`, `dreamari:play-explore-bridge-dismissed`), professional cover choice (`dreamari:pro-cover:<id>`), theme (`dreamari-theme`), picks. All of these are server-side state in production.
- `DEMO_ALWAYS_SHOW_GUIDE` in `src/components/match-lab/MatchLab.tsx` (false now; true only for live demos).
- All counts, followers, views, likes, impact numbers and event codes are seeded demo data.

## Known gaps (by instruction)

- Top Three / My Plan Play CTA routes to the Investment Banking simulation regardless of the #1 career (Joshua: IB only for now).
- Only Investment Banking and Private Equity carry the official roadmap copy.
- Next-step banner does not yet change after the simulation is completed (no copy specified).
- Career detail "Pay by state" panel shows state pay next to the national median; product decision pending.

Home: the Daily Drop panel and its takeover are hidden for the school focus group (`SHOW_DAILY_DROP = false` in `HomeExperience.tsx`, Joshua Pierce, Slack, 6 Sept 2026). Flip it back when the Drop returns halfway through the focus group.
