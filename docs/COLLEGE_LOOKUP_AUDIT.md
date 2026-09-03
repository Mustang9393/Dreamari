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
