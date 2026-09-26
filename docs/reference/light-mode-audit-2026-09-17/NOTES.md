# Light-mode audit (paused 17 Sept 2026)

Goal: fine-tune light mode across every screen, modal and illustration. Paused mid-way to build the AT&T × Connected Learning Centers board in Connect. This file is the resume point.

## How to re-run the screenshot sweep

`sweep.mjs` forces the app's light theme (`localStorage dreamari-theme=light`), seeds the preview-gate cookie (`dm_gate=granted`, see `src/middleware.ts`), and screenshots every route at 1280 and 390 wide, plus the modals it can open by click. It drives the locally installed Chrome (no browser download).

```
mkdir -p /tmp/lm && cp docs/reference/light-mode-audit-2026-09-17/sweep.mjs /tmp/lm/ && cd /tmp/lm && npm i playwright@1.47.2 && node sweep.mjs ./screens
```

Dev server must be running on :3000. Screenshots are not committed (13MB); the script regenerates them in under two minutes.

Known gaps in the script: the per-surface Welcome splash (`WelcomeSplash.tsx`, `DEMO_ALWAYS_SHOW_SPLASH`) covers Explore, Play hub, Profile and Connect on first load; click its CTA before the screenshot or set `sessionStorage["<key>:session"]="1"` per surface. Three modal clicks still need real selectors: Career Detail's video lightbox (find the "Watch Corporate Office Tour" label in `CareerDetailExperience.tsx`), and Connect's People / Events landing tabs (buttons labelled "People" / "Events", see `ConnectExperience.tsx` ~line 2338).

## Theme mechanics (for fixes)

- `html.light` / `html.dark` classes, set by `src/components/app/theme.tsx` (`ThemeBoot`, `useGlobalTheme`), persisted in `localStorage dreamari-theme`.
- Light tokens: `src/components/marketing/tokens.css` `html.light .marketing-v2.themeable` (contract file, avoid editing), overridden with `!important` in `src/app/globals.css` (~line 1062) which is the sanctioned place for light-mode corrections. Night-token surfaces (Build/Match) get their light rungs in `globals.css` `html.light { --color-world-... }` (~line 1156).
- `[data-night-scene]` keeps dark tokens in light mode (photo reels, Play scenes). `[data-space-backdrop]` is hidden in light mode.
- The landing page `/` is dark-only by design (not `themeable`).

## Reviewed so far (desktop 1280, light)

Home, Explore, Career Detail, Career Report (empty state), Colleges, College Detail, Connect landing, Connect board (Finance), Connect pro dashboard (volunteer), Play hub, Play Level 1, Glossary game intro, Profile (overview/plan/report/resume/routes/locker/settings, mostly behind the splash but the visible content read fine), Resume Builder, Signup, Build welcome, Cinematic flow, Match grid welcome, Match lab welcome, Progress lab. Modals via the live pane: Career Detail's Connect modal (all tabs + profile view) and Play's Connect interstitial.

Overall verdict: the token system holds; light mode is in good shape on every route reviewed. Remaining work is a short list of specific fixes plus the unreviewed areas below.

## Fixed

- Connect modals (`ConnectInterstitial.module.css`, shared by `ConnectWithProfessionalsModal`): active tab pill, Follow and primary buttons used ink text on the accent fill; in light mode the accent is the dark ochre light rung, so that read muddy at ~3:1. Now solid accent + white text under `:global(html.light)`. Commit 4739e78.

- 26 Sept 2026, finding 1 (Business & Money muddy in the marketing scope): `globals.css` `html.light .marketing-v2.themeable` now sets `--world-business-money-office` and `--amber-400` to `#ad6e00`, the night scope's gold.
- 26 Sept 2026, finding 2 (pale CTA with white text): Career Detail's Play Game now uses the dark-card fill (`color-mix(var(--primary) 32%, rgba(12,16,35,0.6))`) in both themes; the hero card is always dark. College Detail's Website had already been moved to white glass.
- 26 Sept 2026, Counselor Dashboard light pass: every card shadow, card tint, hero glow, status color (green/amber/red), pale chart blue, the document desk and the side-panel shadow is a `--cd-*` variable in `globals.css` (dark values unchanged, light values that read on white). The shared chart bar fade (`--cd-bar-fade`, `connect/viz.tsx`) also applies to Connect's charts.

## Findings not yet fixed

1. ~~Business & Money accent~~ (fixed 26 Sept). **Business & Money accent is two different colors in light mode.** `marketing/tokens.css` light scope has `--world-business-money-office: #825900` (and `--amber-400: #805900`), the muddy shade the user already rejected ("no muddy colors like the business and money accents", 17 Sept). The night-token scope in `globals.css` was moved to `#ad6e00` for exactly that reason. Align the marketing scope via a `!important` override in the `globals.css` `html.light .marketing-v2.themeable` block (4.19:1 on white; fine for the large labels/fills it's used on, borderline for 12px uppercase labels). Visible on Career Detail ("Bachelor's degree", "$361,000/year"), poster world labels, the Connect modals' accent.
2. ~~Pale CTA~~ (fixed 26 Sept). **Pale CTA gradient with white text.** Career Detail hero "Play Game" and College Detail hero "Website" buttons use a gradient built on `--hero-accent-purple`, which is a pale tint (`#cfc6f5`) in light mode, so white label text sits on lavender. Check `CareerDetailExperience.tsx` / `CollegeDetailExperience.tsx` hero buttons; give them a light-mode fill (e.g. `--primary`) or ink text.
3. **Connect landing "What should we launch next?" vote card** is a hardcoded near-black card (`#05070f`-family literal in `ConnectExperience.tsx`) and sits as a black block on the light page next to the photo community cards. Decide: themed surface, or keep as a deliberate dark poster card and give it a photo like its neighbours.
4. **Play HUD text over bright scenes** (both themes): "INVESTMENT BANKER / LEVEL 1 · INTERN" and "CAUTIOUS" are white over a bright office illustration with no scrim. A subtle text-shadow or a soft top scrim on the HUD would help in both modes. `SimulationPlayer.tsx` `Hud`.
5. **Nav XP chip** shows a hard dark outline in the sweep captures (fresh profile, 0 XP). Verify whether that is an intended "new" highlight or a focus ring leaking; `chrome.tsx`.
6. Static scan shortlist of hardcoded whites/darks worth eyeballing in light mode: `resume/wizardSteps.tsx`, `resume/TemplateGallery.tsx`, `resume/ResumeDocument.tsx`, `resume/ExperienceModal.tsx`, `match-lab/MatchGrid.tsx`, `glossary/GlossaryGameExperience.tsx` (9 dark literals), `connect/ConnectExperience.tsx` (8), `career/CareerDetailExperience.tsx` (5). Most are legitimately white-on-photo; check the ones on flat surfaces.

## Not yet reviewed

- All 390px (phone) captures.
- Deeper states behind the splash: Explore browse rows, Play hub full page, Profile tabs top halves, Connect landing top.
- Modals: `CompanyVideoCards` lightbox, `GlobalSearch`, `chrome.tsx` hamburger/QuickLinks menu, `WelcomeSplash` itself (looked fine), Connect QR sheet, Colleges `ForYouSchools` and compare modals, `MatchGrid`/`MatchLab` sheets, `TrailerFlow`, `UndoToast`, Profile `CareerReport` modals, `ProProfile` modals, Resume Builder `ExperienceModal` / `ExportChecklistModal` / `TemplateGallery`.
- Illustrations: Dreamy sprites and splash glows looked correct in light; the Schools landing has theme-aware compositions (`SchoolsIllustrations.tsx`); check `/` in its own Schools light switch.
- Glossary game full run in light (intro looked fine).
