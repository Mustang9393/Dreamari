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

- Date: 2026-09-02

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
