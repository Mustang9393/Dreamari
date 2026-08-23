# AI handoff

This file records work from the Codex/Claude shared workflow beginning 2026-08-05. It is forward-looking; earlier project history remains in Git commits and each tool's existing context.

## Current session

- Date: 2026-08-22

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
- CONSEQUENCE TO WATCH: Overview no longer links to the Report at all. The
  Report tab is now its only entry point. Flagged to the user; add a doorway
  back if that turns out to be too hidden.

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
