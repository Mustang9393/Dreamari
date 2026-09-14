# College Lookup: research, audit and design decisions

Branch `college-lookup`, 2026-09-03. Experimental until approved. Reference: the CEO's live build at dreamonna.com/colleges ("Find a college"), read logged in at phone, tablet and desktop widths, list page and six detail pages (South Dakota State, University of South Dakota, Southeast Tech, Augustana, Oglala Lakota, Stewart School) plus ten New Jersey colleges for Jordan's home state.

Audience: an 8th grader (13 to 14 years old), not only the strongest readers, on a phone, deciding which college to aim for over the next four years. The job is not "search a database". The job is "help me picture a place I could go, and tell me honestly what it costs, whether I can get in, and whether people like me finish".

## 1. What the reference does today

**List page.** Title, one-line count ("284 colleges in SD and nearby states"), then one very long always-open filter panel (College name, 57 states with counts, ZIP + radius, cost slider, college type, who runs it, size, setting, getting in, religious affiliation, HBCU / tribal / online). Results below: name, city, three tags, five figures with two-line captions each, accreditation line. Sorted by the student's chosen states, then by graduates; a footnote explains the sort and that colleges are not ranked. Pagination, 20 a page, 15 pages.

**Detail page.** Name, address (map link), one-line type, accreditation, "part of" line. Then nine sections: At a glance, Getting in, What the college charges, What families actually pay, Academics (with a 223-programme table), Who is there, Life there, After college, Where these numbers come from. Plain, honest copy ("Hardly anyone pays this", "Few students finish", "Run for profit"). Two-column rows on desktop, single column on phones.

**What is excellent and stays.** The data set (IPEDS + College Scorecard), the honest plain-English framing of every number, the "Worth knowing" callouts, the refusal to rank, the "what families actually pay" income bands, the sources section. The words are already at the right reading level. We keep the numbers and the words; we change how much of it a student meets at once.

**What breaks for an 8th grader.**
- On a phone the filter panel is ~14 screens tall before the first college appears. NN/g: filters on a separate scroll from results make users pogo-stick and lose the connection between choice and result.
- 57 state checkboxes with counts is a data-entry form, not a decision aid. A 13-year-old's real question is "near home or not".
- Result cards carry five figures and five captions each: 10+ numbers per screen, all the same weight. Density is the enemy of the first decision, which is only "is this place worth opening?".
- The detail page shows everything at once: ~120 numbers, a 10-row programme table, an 11-row demographic table. Nothing is folded, so nothing is prioritised.
- No imagery. Teens decide with pictures first, then numbers (see §3).
- No save, no compare, no way back into the rest of Dreamari (careers, pros, plan).
- No empty state, no "what should I do with this" next step.

## 2. Competitive audit

| Product | What they do well | What we avoid |
| --- | --- | --- |
| College Scorecard (ed.gov) | Government data, compare list, "add to compare"; default sort by earnings; field-of-study compare | Filter-first layout, jargon ("median earnings", "repayment rate"), adult audience |
| BigFuture (College Board) | Guided filters in ten groups; default sort by 6-year graduation rate; save to list; "colleges like this" | Requires account for most features; heavy pages; marketing tone |
| Niche | Letter grades, student reviews, photos, "students say"; strong emotional signal | Rankings and grades push teens toward prestige; ads; review quality uneven |
| College Navigator (NCES) | Complete, authoritative | Pure data tables, no hierarchy, desktop only in spirit |
| Scoir / Naviance | Scattergrams, counselor workflow, "fit" framing | Institutional, needs school licence |
| Airbnb / Zillow (search pattern) | One search box, a few chips, "Filters" opens a tray, results update live, applied filters visible, map optional | n/a, these are the pattern we borrow |
| Google | One box, instant results, zero configuration | Text only; teens now search TikTok and YouTube for "what is it like" (§3) |

## 3. Research that shaped the design

- **Gen Z search behaviour.** 74% of Gen Z use TikTok search and 51% pick it over Google (NewsLab survey); 90% use more than one platform to decide on a college and 85% cross-check facts across sources (Manaferra 2025). In discovery, Google leads (31%) but social (16%), forums (8%) and AI (9%) together match it. They trust real student videos and concrete outcomes; they distrust polished marketing and vague promises. Implication: our search must be as fast as Google's box, but each college must open into something you can *see* (campus photo, student video), and every claim must be a number with a source.
- **What families weigh.** Over 95% of students rate cost as important; 73% of the lowest-income quintile call it "very important" versus 56% of the highest (NCES 2019). First-generation students weigh financial aid and distance most. Implication: "What students really pay" is the first number on every card, and "Near home" is a one-tap chip.
- **Faceted search (NN/g).** Show filters over the results in a tray so results are visible and update live; label the control with a word, not an icon; keep the result count fixed at the top. Users finish 25 to 50% faster with facets than with keywords alone.
- **Applied filters (Baymard).** 42% of sites hide what is applied. Show applied filters as removable chips above results; on phones a horizontally scrolling row with clear truncation; include "Clear all".
- **Teens on the web (NN/g teenagers study).** Lower patience, weaker reading and search skills than adults assume, quick to leave when text is dense; they want to be treated as competent. W3C COGA: one idea per line, plain words, numbers with a label, no colour-only meaning, consistent placement.
- **Progressive disclosure.** Three facts on a card, four on a header strip, sections folded with a heading that says what is inside. Depth is one tap away, never on the surface.

## 4. Design decisions

**Where it lives.** `/colleges` (list) and `/colleges/[slug]` (detail), the same shells as the career pages. Entry points: the career page "Where you would study it" rows, the Career Report Colleges section, the Profile plan route cards, and the hamburger Quick links. Not a fifth bottom-nav tab yet: colleges are a step inside a career decision, not a peer of Explore or Play. Recommend revisiting once the CEO confirms the nav.

**Search: as simple as Google, everything else behind the scenes.**
1. One search field, front and centre: "College, city or state". Instant results as you type; no submit, no page.
2. Six quick picks under it, in a student's words: Near home · 2-year · 4-year · Trade school · Under $15K a year · Everyone gets in. One tap each. These cover what an 8th grader can actually act on.
3. "All filters" opens a tray over the results (NN/g pattern): states, cost cap, type, who runs it, size, setting, getting in, religious affiliation, also (HBCU, tribal, online). Results stay visible behind it and update live.
4. Applied filters appear as removable chips above the results, with Clear all.
5. Default order: colleges in your state first, then by how many students finish. One line says so. We do not rank.

**Result card.** Photo when we have one (free Wikimedia Commons imagery, credited), name, city, three tags (degree level · public or private · setting), three facts only: *Really pay* per year, *Finish their degree*, *Come back for year 2*. Save on the card. Everything else is one tap away.

**Detail page.** Career-page anatomy. Header: photo (or a colour field), name, city · type · setting, accreditation line, then Save, Compare, Website. Quick facts strip: Really pay · Get in · Finish · Students. Then folded sections in the order a student needs them: What it costs · Getting in · What you can study · Life there · Who is there · After college · Where these numbers come from. "Worth knowing" callouts (few students finish, run for profit, everyone gets in) sit at the top of the page, not buried.

**See it, then ask.** Two Dreamari-native rows on the detail page, answering the social-search finding without embedding social media: "See the campus" (links to the college's own tour page and YouTube "campus tour" search, labelled as leaving Dreamari) and "Ask someone who went here" (Connect professionals whose education matches, or the community board for the world).

**Compare.** Save up to three colleges and open a side-by-side table (the same pinned-factor table as the Career Report comparison).

**Accessibility.** 44px targets, visible labels on every control, keyboard order follows reading order, live region announces result counts, no colour-only meaning, reduced-motion respected, every number carries a plain label and unit, reading level grade 6 to 8, no jargon without a gloss.

**Joy.** The first screen is a picture of a place and a number you can understand, not a form. Saving gives the same spark as saving a career. Empty search says what to try. Nothing shouts.

## 5. Data

Prototype data in `src/components/colleges/data.ts`: 16 New Jersey and South Dakota colleges with full detail (figures transcribed from the reference, which draws on IPEDS 2024-25 and College Scorecard), plus 14 South Dakota colleges at card level. Imagery from Wikimedia Commons (licence and author kept in `public/images/colleges/credits.json`) and Wikipedia lead images for marks (prototype only; seals are often fair-use and must be replaced by licensed logos before launch). Production should read the same fields the reference reads from the College Scorecard API.

## 6. Sources

- NN/g, Mobile faceted search with a tray: https://www.nngroup.com/articles/mobile-faceted-search/
- Baymard, Display applied filters in an overview: https://baymard.com/blog/how-to-design-applied-filters
- NCES, Factors that influence student college choice (2019): https://nces.ed.gov/pubs2019/2019119/index.asp
- Manaferra, How Gen Z students discover colleges in 2025: https://www.manaferra.com/how-genz-students-discover-colleges-in-2025/
- NewsLab, 51% of Gen Z choose TikTok over Google for search: https://newslab.org/survey-51-of-gen-z-choose-tiktok-not-google-for-search/
- Forbes (Koetsier, 2024), Gen Z dumping Google for TikTok and Instagram (not fetchable here; cited from the user's link)
- College Scorecard search: https://collegescorecard.ed.gov/search/
- BigFuture college search: https://bigfuture.collegeboard.org/college-search/filters
- Wikimedia Commons API and Wikipedia REST summary API for imagery.

## 7. Update, 15 Sept 2026 -- simplification pass

Direct feedback (relayed via Slack) trimmed several of the decisions in §4
further, in the same "less copy, clearer hierarchy" direction as the rest
of Dreamari:

- **"Worth knowing" removed from the header entirely**, not just moved --
  it read as another paragraph to get through before the numbers start.
- **Header actions are now Website / Apply / Financial Aid + Save**, not
  Website / Compare alone -- Apply and Financial Aid were already real
  data (`EXTRA[slug].links.apply`/`.aid`) surfaced only deep in the
  Admissions/Cost tabs; they're a student's two most-needed next steps
  after Website, so they moved to the header.
- **"At a glance" is "Key Facts"**, four rows, no sub-copy under any of
  them ("what families pay after grants and scholarships" etc. cut) --
  the label plus a number is enough; detail lives in the tab that number
  came from.
- **Admissions' "What they ask for" is now two grouped lists**,
  Requirements and Other Factors Considered, instead of a "Required"/
  "Looked at" value repeated on every row -- the group heading says it
  once. Score ranges (Typical Scores) dropped the progress-bar
  visualization for plain "740-780" text -- "the ranges are the
  information students actually need."
- **"See it, then ask" is gone, not folded smaller.** Reasoning this time
  went further than density: it sent students outside the app to YouTube
  (bounce risk) and implied Connect always has a verified pro from that
  *exact* school, which isn't guaranteed. Neither problem is solved by
  making the section smaller.

Implementation: `src/components/colleges/CollegeDetailExperience.tsx`.

## 8. Update, 15 Sept 2026 -- Academics/Cost/Student Body/Campus Life simplification, "fits you" retired

Same direction, two more tabs:

- **§4's "See it, then ask" companion, "Why this college fits you"
  (`YourPath`, added after this doc was written) is retired entirely.**
  Direct feedback: too hard to keep consistent with the data across every
  college. The `?route=<career>` entry point from Explore Schools "For
  you" no longer does anything special on a college's own page.
- **Academics collapses to one "Academic Facts" list** (Graduation Rate,
  4-Year Graduation Rate, First-Year Retention, Student-Faculty Ratio) and
  a **"Popular Majors" list** (name + share of graduates only -- no pay,
  no grads/year). §4's own "Career fit"/outcomes framing for this page is
  superseded: earnings data belongs elsewhere in Dreamari, not on the
  academics tab.
- **Cost's "Ladder" bar-chart visualization is retired** for two headline
  numbers (Full Price, Average Cost After Aid) plus plain tables -- "make
  ours even more concise" than even the U.S. News reference screenshot
  used as inspiration.
- **§4's "Quick facts strip" (Really pay / Get in / Finish / Students) and
  Who is There's `SplitBar`s are superseded on Student Body.** Enrollment
  is a plain list now, not bars. The one visualization kept from the
  original design is the demographics donut -- explicitly reconfirmed as
  worth keeping, not retired like the others this round.
- **§4's "Life there"/"After college" collapse into one "Campus Life" tab,
  four sections** (Housing, Activities & Organizations, Athletics,
  Opportunities). After-college outcomes data (pay, debt, repayment) is
  dropped from this page entirely -- belongs with academics/careers
  elsewhere in Dreamari, not campus life. Undergraduate Research relocates
  to Academics. §4's own "See it, then ask" companion idea (already
  retired above) and this tab's old sport `SplitBar` are both gone the
  same way: real data, but not decision-useful enough to keep a
  visualization or a whole section for.

Implementation: `src/components/colleges/CollegeDetailExperience.tsx`.

## 9. Update, 14 Sept 2026 -- 25 real colleges added alongside the fabricated set

The prototype's ~30 colleges (figures transcribed 3 Sept 2026 from the live
Dreamari build, per `data.ts`'s own header comment) were always placeholder
data. The user supplied a 200-college sample of the *real* production API
response shape (`GET /colleges` card + `GET /colleges/:slug` profile,
IPEDS/College Scorecard-derived) plus its README, with explicit instruction
to fill the demo with real values -- "only use what is required after all
our design notes... removing sections and updating this have been updated,"
i.e. scoped strictly to whatever survives §§1-8's simplification above, not
the source README's fuller shape.

Decisions, each pinned down directly rather than assumed:

- **Keep our shape, refresh the numbers.** Real values are transformed into
  the *existing* `College`/`CollegeExtra` field names, not a restructure to
  match the real API's own nesting (`admission`/`campus`/`enrollment`
  objects, etc.) -- "keep our shape."
- **Princeton stays fabricated for now.** It isn't in the 200-college
  sample anyway (confirmed by lookup); the user is sending Princeton's real
  data separately, to go through this same pipeline once it arrives.
  Everything else in the demo is real.
- **25 colleges, matching the existing demo's rough size** -- not all 200.
  Reasoning given: populating all 200 (plus fetching each one's image/logo)
  would cost meaningful time and usage credits for a demo that only needs
  to *feel* real, not be exhaustive; the list/search/filter UI needed zero
  code changes to handle either count, confirmed live before this was
  decided, so nothing about the smaller number is a functional compromise.
- **No images or logos fetched for any of the 25.** Every new entry uses
  `photo: false, mark: false` -- the placeholder-card state the source
  README itself calls out as a common, deliberately-oversampled real-world
  state (22 of 1,116 no-photo colleges included in the 200-sample), not an
  edge case being papered over.

The 25 were chosen to span the same range of real-world data completeness
the source sample itself highlights: large well-resourced publics (Illinois
State, Texas A&M, Arizona State) down to tiny/sparse institutions with
mostly-null financial and outcome data (Caan Academy of Nursing, 96
undergrads; Christine Valmy; avalon-institute-las-vegas). Three
originally-chosen slugs (`palmer-college-of-chiropractic`,
`claremont-graduate-university`, `university-of-oklahoma-health-sciences-
center`) were dropped and replaced after transform crashes revealed they're
graduate/professional-only institutions with `profile.admission === null`
in the real API -- no undergraduate admissions process exists to show. A
fourth replacement (`urban-academy-of-beauty`) was dropped separately after
its real `totalUndergrad` came back `0`, which would have violated the
absence-is-never-zero rule; `caan-academy-of-nursing` (real enrollment: 96)
replaced it.

Transform: `scripts/colleges/transform-real-data.py` (new -- see its own
header for usage; takes the sample JSON + a slug list, prints TS object-
literal source for both files, same convention as `build-extra.mjs`
documenting itself as `extra.ts`'s own generator). Inserted at the exact
verified end of `COLLEGES` in `data.ts` and `EXTRA` in `extra.ts` -- not via
a generic `];`/`};` string search, which the first attempt used and which
silently landed the block inside `data.ts`'s unrelated `synthDetail()`
function (that function contains its own, later `];`). Re-run from a clean
`git checkout` with line-index-anchored insertion instead.

One real product bug surfaced by this real (rather than fabricated) data:
Cost's "Cost by Family Income" heading rendered unconditionally even when a
college has zero published income bands (`caan-academy-of-nursing`'s
`d.bands` is empty) -- fixed with the same `{d.bands.length > 0 && (...)}`
guard already used for the adjacent Full Price Breakdown/Grants &
Scholarships sections. Every fabricated college always had all 5 bands
populated, so the gap was invisible until genuinely sparse real data
existed to expose it.

Browser-verified live: Illinois State University (rich data, every tab),
Caan Academy of Nursing (sparse-data edge case, "Not published" states,
the bands-heading bug then its fix), the `/colleges` "For You" list and
Browse All search (new real colleges appear alongside fabricated Princeton
with no code changes, correct "--" em-dash for unavailable figures).
ESLint + `tsc --noEmit -p .` clean project-wide.

Implementation: `src/components/colleges/data.ts`,
`src/components/colleges/extra.ts`,
`src/components/colleges/CollegeDetailExperience.tsx` (Cost tab bands
guard), `scripts/colleges/transform-real-data.py` (new).

**Correction, same day:** a follow-up data-accuracy pass ("some colleges are
showing 0% acceptance? check all data") caught one bad value in the §9 set:
Alliant International University-San Diego's real `admitRate` was a
statistically-meaningless 0% (0 of just 6 reported applicants), not a
genuine near-zero acceptance rate. Swapped for School of Visual Arts (New
York) -- real, clean data throughout (93% acceptance, 3,255 undergrads).
Every other card-visible figure across all 25 colleges was spot-checked
against the source JSON at the same time; nothing else was wrong.

## 10. Update, 14 Sept 2026 -- real photos and marks fetched for all 25 real colleges

Direct follow-up instruction after §9: fetch real campus photos and school
marks/logos for the 25 real colleges (all shipped with `photo: false, mark:
false` placeholders in §9), plus close a gap found in the same audit: 8 of
the original ~30 fabricated-data colleges had real image files on disk all
along but stale `photo:false`/`mark:false` flags in `data.ts` (the flags
turned out to be **dead code** -- `collegeImage()`/`collegeMark()` in
`data.ts` gate purely on `PHOTOS`/`MARKS` Sets generated from what's
actually in `public/images/colleges/`, never on the literal's own
`photo`/`mark` fields). Corrected all 33 stale entries to `true` for
honesty, even though nothing renders differently.

Explicit instruction: don't limit sourcing to Wikimedia Commons -- "search
everywhere, far and wide." `scripts/colleges/fetch-images.mjs` (Wikimedia
Commons + Wikipedia lead-image, the existing pipeline) was extended via new
`seed-names.json` entries and got about 60% of the 50 needed assets (25
photos + 25 marks). The remainder came from each institution's own official
site (logo in the site header, or a real campus/location photo from an
About/Locations page) -- the same nominative-use rationale this file's own
generator already documents for Wikipedia-sourced seals ("licences vary...
en.wikipedia seals are often fair use").

**Two bad automatic matches caught and fixed by visual spot-check**, not by
the fetch script itself (its Commons search is keyword-driven and can match
on a substring with no institutional connection):
- Texas A&M University's auto-matched "campus" photo was a building at the
  University of Barishal, Bangladesh (matched on generic "academic
  building" search terms). Replaced with the real Academic Building, Texas
  A&M (Commons).
- Strayer University-Tennessee's auto-matched photo was **a stray dog in
  Pristina** (matched purely on "Stray" in "Strayer"). Replaced with a real
  Strayer University branch-campus photo (Commons); Strayer's own site
  yielded no usable campus photography (it's a primarily-online chain of
  leased office-park locations, so this may be the actual limit of what's
  publicly photographed for this institution).
- Two more replaced on inspection for being topically wrong rather than
  outright unrelated: Illinois State University's auto-match was a 1930s
  post-office mural (replaced with a real Watterson Towers dorm photo), and
  Chief Dull Knife College's was an unrelated USDA meeting-room photo
  (replaced with the college's own official campus photo).

This is the direct lesson to carry forward: **a keyword-matched Commons
search result must be visually spot-checked, not trusted on file-size/
license filtering alone** -- both bad matches passed every automated filter
(real width, real CC/PD license, real institution-adjacent search term) and
were still completely wrong.

`public/images/colleges/credits.json` updated with attribution for every
manually-sourced asset (official-site logos/photos cite the source page;
Commons/Wikipedia assets cite the file and license, matching the existing
convention). `images.ts` regenerated via `write-manifest.mjs` --
now 55 photos, 55 marks (30 original + 25 real). `seed-names.json` (the
`fetch-images.mjs` input list) permanently extended with the 25 new
colleges for future reruns. ESLint + `tsc --noEmit -p .` clean.

Implementation: `public/images/colleges/*.webp` (50 new files),
`public/images/colleges/credits.json`, `src/components/colleges/images.ts`
(regenerated), `src/components/colleges/data.ts` (33 stale photo/mark
flags corrected), `scripts/colleges/seed-names.json` (extended).
