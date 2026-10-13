# Glossary Game: Levels 2 to 4 review (Joshua's Replit vs our Level 1)

Update, 13 Oct 2026: Chandu subsequently requested theme-consistent assets for
Levels 2 to 4 and a scalable prompt for future careers. The new supporting
term-art pipeline is documented in `../handoff/play-sop/12-glossary-art-pipeline.md`.
This supersedes only the no-new-term-art recommendation below. Exact numeric
scene cards, authored questions, copy, types, order and scoring are unchanged.

Prepared 13 Oct 2026 for Chandu and Mika. Source: https://dceeai.replit.app/ib-glossary-game, walked end to end in headless Chrome (desktop 1440x900, phone 390x844). No sign-in or payment was needed.

Screenshots: `/private/tmp/claude-501/-Users-chandump-dreamari--claude-worktrees-gracious-wright-2b5bb8/f41e9d51-da7a-4701-8e96-2647b4172794/scratchpad/replit-glossary/` (file names below are relative to that folder). Our build's contact sheets: `.../scratchpad/glossary-l2-4/`.

## TL;DR for the meeting

1. **"Levels 2 to 4" = lessons 2, 3 and 4.** The Replit labels each lesson "LEVEL 02", "LEVEL 03", "LEVEL 04" on its intro. Only lessons 1 to 4 are open in the Replit: Investing Basics ($50K), Money In, Money Out ($120K), Ways to Invest ($250K). Lessons 5 to 20 still use an older generic template (A/B/C/D definition quiz).
2. **Most of it is our Level 1 system already.** Of the 11 interaction shapes in the Replit's Levels 2 to 4, 6 are things we ship (choice, match, sort, which one is wrong, flashcards, Power Play fill-in). Only 4 are new: a **multi-step "case" question** (2 to 5 steps over one scenario), **select-all**, **number entry**, and **Power Play "choose your path"**. All four are built on the existing option tiles, so they inherit all four themes.
3. **Joshua's abstract-term problem is already half solved by his own content.** His best screens are not pictures; they are Dream Sneakers numbers drawn as small diagrams: $25,000 to $30,000, a 10-share grid, an 80/20 ownership bar, a monthly ledger. We propose a fixed kit of **6 scene cards** (story line, figures, ledger, share grid, ownership split, the L1 profit card) plus **Dreamy as the reaction layer** and a **valuation ticker** for the company's growth. No new illustrations are needed for Levels 2 to 4.
4. **Lock two things for Joshua first:** the lesson schema (now in `src/components/glossary/data.ts`, Levels 2 to 4 authored in it) and the list of activity kinds plus scene kinds. With those, the four pilot industries are content work, not engineering.
5. **The Replit has about 15 copy and logic bugs** (list below) that we did not port: e.g. wrong answers print "Correct. ...", the review round has no question, "Mastery 700%", generic "Choose an answer." prompts.
6. **Built locally today (not committed or pushed):** lessons 2 to 4 playable at `/play/glossary/investment-banking?lesson=2|3|4`, all four themes, a 20-level map that opens any authored level, and Next lesson on the results screen. See "Build status".

## 1. How the Replit is organised

- Landing: "Meet Dream Sneakers" card, "20 Lessons · Finance Glossary", Next (`00-landing.jpg`).
- Hamburger opens "Investment Banking Glossary Game": progress "0 of 20 lessons", XP chip, 20 lesson cards (number, tier tag BEGINNER/INTERMEDIATE/ADVANCED, minutes, title, "Words: ...", "Goal: ...", "Unlocks $X" pill). Lessons 1 to 4 are open from the start; 5 to 20 are greyed with a lock (`02-lesson-menu.jpg`, `02-lesson-menu-locked.jpg`, `72-menu-progress.jpg`, phone `71-m-menu.jpg`).
- Value ladder: $10K, $50K, $120K, $250K, $500K, $1M, $3M, $5M, $10M, $25M, $50M, $100M, $250M, $500M, $1B, $3B, $5B, $10B, $20B, $30B. Lessons 18 to 20 (Mandates & Advisory, Bookrunner & Roadshow, LBO & Restructuring) were missing from our data; now added.
- Every lesson runs: intro (kicker "LEVEL 0N · TITLE", headline, one line, a hook box, Start / Skip to game) > teach (L3, L4 only) > 7 questions > review round for missed terms > Power Play > "Checking your mastery" > Lesson Complete > "A streak is born!" > results with the company value unlocked > Next Lesson / Replay / All Lessons.
- HUD on every question: lesson title + goal, "n/7 · %", a progress bar, COMBO chip, an elapsed timer, five mastery boxes, "Mastered n/5".
- Answering: select, then press Check (we answer on tap; keep ours). Feedback is a card under the board with a Dreamy (check mark when right, red X when wrong) and Next Question.

## 2. Inventory per lesson

Legend for visuals: **V** = a visual on the screen, **T** = text only. "Abstract" = no honest literal picture.

### Level 2 · Investing Basics (Unlocks $50K, goal "Open a second store")

Terms (from the questions; the lesson card's "Words: Maya · $25,000 · A second store" is a data bug): **Investor, Capital, Risk, Return, Ownership.** Abstract: Capital, Risk, Return, Ownership. Picturable: Investor (a person, Maya).

Intro (`02-L2-a.jpg`): "Dream Sneakers Wants to Grow" / "Maya is considering putting money into the company." / hook "Let's find out who Maya is in this story." No teach phase: Start goes straight to Q1 (L3 and L4 do have one).

| # | Interaction | Instruction as written | Correct answer, feedback | Visual |
|---|---|---|---|---|
| 1 | Choice (2x2) + story strip "Dream Sneakers wants to open Store #2." | "Maya puts $25,000 into Dream Sneakers to help it grow. What is Maya?" Investor / Customer / Supplier / Employee | Investor. "An investor puts money into a company." (`03-L2-b.jpg`, wrong state `03-L2-b-wrong.jpg`) | T |
| 2 | Drag a chip into a one-blank sentence (tap also works) | "Drag a term to the blank." "The $25,000 becomes ___ for Dream Sneakers." Capital / Return / Ownership | Capital. "Capital is money a business uses to grow." (`04-L2-q2*.jpg`) | T |
| 3 | Choice + story "The new store could succeed or fail." | "Maya could lose some of her money. What is this?" Capital / Risk / Return | Risk. "Risk is the chance of losing money." | T |
| 4 | Choice + two figure tiles "Maya invests $25,000" / "Investment becomes $30,000" | "What is Maya's return?" $25,000 / $30,000 / $5,000 / $55,000 | $5,000. "$30,000 minus $25,000 is $5,000." (`05-L2-q4.jpg`) | V (figures) |
| 5 | Choice + definition strip + 10-box share grid (2 fill in on correct) | "Dream Sneakers has 10 equal shares. Maya receives 2." "What % of Dream Sneakers does Maya own?" 50 / 10 / 20 / 80% | 20%. "2 of 10 shares = 20% ownership. Maya now owns 20% of Dream Sneakers." (`06-L2-q5.jpg`, `07-L2-q5-correct.jpg`) | V (diagram) |
| 6 | Match term to meaning (tap pairs, wrong flashes red) | "Match each term to its meaning." | Investor: Puts money into a company. Capital: Money used to grow. Risk: Chance of losing money. Return: What an investor gains. Ownership: Part of a company. "Perfect. You know the language of an investment." (`07-L2-q6.jpg`, `08-L2-match-wrong.jpg`) | T |
| 7 | Which one is wrong | "Which one is wrong?" | "Ownership = money used to grow". "Ownership means part of a company." (`11-L2-q7-correct.jpg`) | T |
| R | Review round (missed terms) | "Choose an answer." with no question (bug) | "That concept is Investor. A person or group that puts money into a business." (`13-L2-review-q.jpg`) | T |
| PP | Power Play: 5-blank paragraph, drag or tap chips | "Complete the deal." "Maya is an ___ in Dream Sneakers. Her $25,000 becomes ___ for the company. She takes ___ for a possible ___. In exchange, she receives 20% ___." | Investor, Capital, Risk, Return, Ownership (`16-L2-powerplay.jpg`) | T |

End: streak modal "5 in a row! On fire!" (`09-L2-match-done.jpg`), mastery check, Lesson Complete, "A streak is born!", results "$50,000 company value unlocked · Open a second store", "Game value, not personal earnings." (`18-L2-end.jpg`, `20-L2-results.jpg`).

### Level 3 · Money In, Money Out (Unlocks $120K, goal "Review your first sales report")

Terms taught: **Revenue, Cost, Cash Flow, Margin, Loss** (the lesson list says Profit instead of Cash Flow; Profit is L1 and Q7 asks for it as "a Level 1 term"). All five are abstract; Margin and Cash Flow are the hardest.

Intro (`21-L3-intro.jpg`): "Dream Sneakers Gets Its First Sales Report" / "Money is coming in. Money is going out." / "Let's see how the business is really doing."

Teach (`22-L3-q1.jpg` to `24-L3-teach-done.jpg`): one card per term with an emoji, a definition and a "Dream Sneakers example", button "Unlock {term}", five-term progress row on top. Then "Lesson 3 complete!" (misleading: practice has not started) and Start Practice.
- Revenue: "All the money a business earns from sales." / "Dream Sneakers earns revenue every time someone buys sneakers."
- Cost: "Money a business spends." / "Materials, rent, and wages are costs for Dream Sneakers."
- Cash Flow: "Money moving in and out of a business." / "Sneaker sales bring money in; rent and wages send money out."
- Margin: "How much of each sale is kept after costs." / "If Dream Sneakers keeps $40 of a $100 sale, its margin is 40%."
- Loss: "When a business spends more than it earns." / "Dream Sneakers has a loss when its costs exceed sales revenue."

| # | Interaction | Instruction | Answer, feedback | Visual |
|---|---|---|---|---|
| 1 | Choice + equation strip "500 sneakers × $200 each = $100,000" | "Choose an answer." (no question) Revenue / Cost / Loss / Capital | Revenue. "Revenue is money from sales." (`25-L3-q1.jpg`) | V (equation) |
| 2 | Classify 5 rows, each Money In / Money Out | "Choose an answer." | Sneaker sales In, Store rent Out, Online orders In, Employee wages Out, Materials Out. "That movement of money is cash flow." (`26-L3-q2.jpg`, phone `71-m-L3-q2.jpg`) | T |
| 3 | Select all that apply + ledger strip "Sales $50,000 · Materials $10,000 · Rent $5,000 · Wages $15,000" | "Select every cost." | Materials, Rent, Wages. Wrong: "Costs are what the business spends." (`27-L3-q3.jpg`, `28-L3-q3-wrong.jpg`) | V (ledger) |
| 4 | Choice + strip "Revenue $30,000 · Costs $40,000" | "Choose an answer." $10,000 loss / revenue / margin / capital | $10,000 loss. "Costs were higher than revenue." | V (figures) |
| 5 | Choice + strip "$100 sale · $60 costs · $40 left" | "Choose an answer." 20 / 40 / 60 / 100% | 40%. "Margin shows how much of each sale remains after costs." | V (figures) |
| 6 | 2-step case | 1 "Revenue stays the same. Which helps Dream Sneakers keep more money?" Costs go UP / DOWN. 2 "What could improve?" Margin / Cost | DOWN, Margin. "When revenue stays the same, lower costs leave more money and improve margin." (`31-L3-q6.jpg`, `32-L3-q6-step2.jpg`) | T |
| 7 | 3-step case with number entry, strip "REVENUE $100,000 · COSTS $80,000" | 1 "Money left = $" (type 20000). 2 "What Level 1 term describes $20,000 left after costs?" Profit / Revenue / Capital. 3 "If costs rose above $100,000, what would Dream Sneakers have?" A loss / A margin / Capital | "Money left after costs is profit. If costs rise above revenue, the business has a loss." (`35-L3-q7.jpg` to `38-L3-q7-correct.jpg`) | V (figures) |
| R | Review | "Choose an answer." (no question) | "That concept is Cost. Money a business spends." | T |
| PP | Power Play as a 5-step case | "RUN THE MONTH · Sales $120,000 · Costs $90,000 · Money left $30,000". The $120,000 from sales is: Revenue. The $90,000 spent is: Cost. Money moving in and out is: Cash Flow. What percent of revenue remains? (margin) 25%. If costs increase above $120,000, Dream Sneakers has a: Loss | (`40-L3-powerplay.jpg` to `44-L3-pp-5.jpg`); its intro still says "fill in the blanks" | V (figures) |

### Level 4 · Ways to Invest (Unlocks $250K, goal "Choose how to raise money")

Terms: **Stock, Bond, Shareholder, Lender, Interest.** Picturable-ish: Shareholder and Lender (people, a bank). Abstract: Stock, Bond, Interest.

Intro (`48-L4-intro.jpg`): "Dream Sneakers Needs Money to Grow" / "There's more than one way to raise money." / "Now you choose how Dream Sneakers gets funded."

Teach (`48-L4-teach-1.jpg` to `49-L4-teach-done.jpg`):
- Stock: "A piece of ownership in a company." / "Dream Sneakers stock lets you own a small piece of the company."
- Bond: "Money borrowed from investors." / "Dream Sneakers can sell a bond to borrow money for a new factory."
- Shareholder: "A person who owns stock." / "Anyone who owns Dream Sneakers stock is a shareholder."
- Lender: "A person or group that lends money." / "A bank that loans money to Dream Sneakers is a lender."
- Interest: "Extra money paid for borrowing money." / "Dream Sneakers pays interest on the money it borrows from lenders."

| # | Interaction | Instruction | Answer, feedback | Visual |
|---|---|---|---|---|
| 1 | 4-step case, each STOCK / BOND | Own part of the company. Loan money to the company. Can make you a shareholder. Must be paid back. | Stock, Bond, Stock, Bond. "Stock means ownership. Bonds are loans that must be repaid." (`50-L4-q1.jpg`) | T |
| 2 | 2-step case | "You buy Dream Sneakers stock. You are a:" / "You lend Dream Sneakers money through a bond. You are a:" Shareholder / Lender | Shareholder, Lender. "Stock owners are shareholders; people who lend through bonds are lenders." | T |
| 3 | Number entry + strip "Dream Sneakers borrows $1,000 at 10% interest." | "Interest owed = $" | 100. Wrong: "Interest is the cost of borrowing money." (correct answer never shown) (`56-L4-q3-wrong.jpg`) | V (figures) |
| 4 | Classify 7 rows STOCK / BOND | "Choose an answer." | Sell ownership S, Creates shareholders S, Does not need to be repaid like a loan S, Borrow money B, Creates lenders B, Pay interest B, Repay the money B. "Stock sells ownership; bonds borrow money that must be repaid with interest." (`56-L4-q4.jpg`, page scrolls at 1440x900) | T |
| 5 | Choice + 80/20 ownership bar "Founder 80% · Investor 20%" | "Choose an answer." (the question is missing) The investor who owns stock / The lender who owns a bond / Every customer | Investor. "The investor who owns stock is a shareholder; this connects to ownership from Level 2." (`57-L4-q5.jpg`) | V (diagram) |
| 6 | 2-step case + option strip "A: Sell stock ... B: Issue a bond ..." | "Which option lets Dream Sneakers keep its ownership?" Bond. "Which option creates new shareholders?" Stock | "A bond lets the company keep its ownership; stock creates new shareholders." | T |
| 7 | Which one is wrong (prompt missing) | Stock = ownership / Bond = borrowed money / Shareholder = owns stock / Lender = owns part of the company | Lender = owns part of the company. "A lender provides borrowed money. A shareholder owns part of the company." | T |
| R | Review | "Choose an answer." | "That concept is Interest. Extra money paid for borrowing money." | T |
| PP | Power Play "choose your path" then a 2-step case on that path | "FUND DREAM SNEAKERS · Choose how to raise $100,000." "Choose a funding path. Neither choice is universally correct." STOCK card / BOND card. Bond path: "The people providing the money are:" Lenders. "Dream Sneakers must also pay:" Interest | (`63-L4-powerplay.jpg` to `65-L4-pp-s2.jpg`). The Stock path was not walked; we mirrored it (Shareholders, then "gives up some" Ownership); confirm with Joshua | T |

## 3. Replit bugs and gaps we did not port (for Joshua)

1. Wrong-answer feedback starts with "Correct." (L2 Q1).
2. Review round shows "Choose an answer." with no question (all three lessons).
3. Generic "Choose an answer." where the question should be (L3 Q1, Q2, Q4, Q5; L4 Q4, Q5, Q7).
4. "Lesson 3 complete!" / "Lesson 4 complete!" after the teach cards, before practice.
5. "Mastery Progress 700%" on every results screen.
6. XP and score disagree between screens (+61 XP vs +41; Dream Score "+85" vs "+15"); Dream Score starts at about 16,500 for a new player.
7. "A streak is born!" plays after every lesson on the same day.
8. Lesson card for L2 lists "Maya · $25,000 · A second store" as its words; L3 lists Profit but teaches Cash Flow.
9. After a wrong answer the correct one is never highlighted; number entry never shows the right number.
10. L2 has no teach cards; L3 and L4 do.
11. The Power Play intro says "fill in the blanks" for L3 and L4, which are not fill-ins.
12. After the streak modal, a 2-step question jumps back to step 1 with the final feedback showing (`34-L3-q6-after.jpg`).
13. Long boards (7-row classify, select-all) scroll the page at 1440x900; the feedback card falls below the fold.
14. The L2 match column header says "EXAMPLE" while the instruction says "meaning".
15. "STEP 1 OF 1" shown on single-step questions.
16. Lesson 5 (out of scope): the Client definition ("the company that hires a bank") contradicts its example ("a store that buys sneakers").

## 4. Our Level 1 vs Levels 2 to 4

| Replit interaction | Ours today | Reuse | Status |
|---|---|---|---|
| Choice, 2x2 or list | OptionList, "Dreamy asks" frame | as is | reused |
| Story strip / figures / ledger / grid / split bar over a question | only the L1 profit card | new `SceneCard` (6 kinds) in the profit card's material | **new, small** |
| Drag a chip into a one-blank sentence | Power Play's chips | choice + `sentence`: the picked tile fills the blank | reused with a prop |
| Match term to meaning | MatchUpCard | as is; art turned off for lessons without term art | reused |
| Classify rows into two labels (Money In/Out, Stock/Bond) | SortBucketsCard | same component with 2 buckets | reused |
| Which one is wrong | DocumentOptionList ("Catch the Misuse") | as is | reused |
| Teach cards | Flipbook UnlockScreen | new **concept face** for terms with no art (glyph, term, definition, formula line, Dreamy at the corner) | **new face, small** |
| Select all that apply | none | `MultiSelectCard` on the option tiles + Check | **new** |
| Multi-step case (2 to 5 steps, one scenario) | none | `ChainCard`: the bubble says the step, the steps are OptionList or a number box | **new** |
| Number entry | ProfitBuilder (L1 only, bespoke rig) | a chain step with `answer` and `unit` | **new (inside chain)** |
| Power Play fill-in | PowerPlayScreen | as is | reused |
| Power Play case / choose your path | none | `PowerPlayChain` and `PowerPlayPath` reuse ChainCard | **new** |
| Review round | reviewQuestions remediation | authored one per term, with real questions | reused |
| Streak modal | StreakBanner | as is | reused |
| Lesson list, 20 lessons, "Unlocks $X" | LabLevelMap (four themed maps, paged) | now opens any authored level, Play button, "Unlocks $X" | extended |
| Results with company value | CompleteScreen (score, XP, mastery) | adds the valuation ticker, Next lesson, Replay, All levels | extended |
| Combo chip, timer | none | not ported (timer adds pressure; combo duplicates the streak modal) | dropped, ask Joshua |

**Data model.** `data.ts` already had `GlossaryCareer.lessons[]`, a 17-entry `levels` ladder and per-lesson `companyValue`; the route only ever played `lessons[0]`. Changes: the main route reads `?lesson=` (the lab route already did); new question kinds `multiSelect` and `chain`; `scene`, `sentence` on choice; `formula` on terms; `intro` on lessons; Power Play becomes a union (`paragraph` default, `chain`, `path`); levels 18 to 20 added and L2/L3 words corrected. Level 1's data is unchanged.

## 5. Recommendations

### A system for abstract terms: "show the money, not a picture"

Rule: draw a term only when it is a thing you can point at (company, sneaker, customer, store, bank). Everything else gets one of these, in this order of preference:

1. **Scene cards (the diagram is the visual).** Six kinds, one material per theme: `story` (one line of the plot), `figures` (labelled numbers with operators: $25,000 > $30,000), `ledger` (money in and out rows), `shares` (a grid that fills in on the right answer), `split` (an ownership bar), and L1's `profit`. Each one teaches the term while it decorates. This is what Joshua's own best screens already do.
2. **Dreamy as the reaction layer.** He asks every question (curious), reads numbers (glasses), poses a case (idea), reacts to the answer (happy when right, nervous when wrong), and celebrates milestones (party). That is the fun Joshua asked for without forcing an image. Uses existing sprites only.
3. **Concept cards for teach screens.** Terms without art get a typographic flashcard: a small glyph, the term large, the definition, and a formula line where there is one (Return: $30,000 − $25,000 = $5,000; Margin: $40 of $100 = 40%; Interest: 10% of $1,000 = $100). Dreamy peeks over the card corner.
4. **The valuation ticker as the story prop.** "Dream Sneakers is worth $50K" counts up on the results screen and shows the next milestone on the intro. The storefront and sneaker art from L1 stay as the world on every intro.
5. **The world grows with the company (later).** The clouds, city and paper landscapes gain lights and buildings per milestone. Needs art; on the shopping list, not built.

### Level 1 patterns that carry over unchanged

"Dreamy asks" bubble, one column, clouds as the floor, the one type ramp (question 32, answers 20, hints 15, figures 36, labels 12.5), answer on tap with retry, the inline feedback card and its typing, mastery tokens in the HUD (glyphs instead of art), streak banner, match, sort, which one is wrong, Power Play fill-in, mastery loading with a fact, the four themes and their maps, FitToScreen.

### New components and rough effort

| Component | Effort | Notes |
|---|---|---|
| SceneCard (6 kinds) | 0.5 day | built |
| ChainCard (steps, number entry) | 1 day | built |
| MultiSelectCard | 0.5 day | built |
| Concept flashcard face | 0.5 day | built |
| Power Play case + path | 1 day | built |
| Valuation ticker + results actions | 0.5 day | built |
| Map: open authored levels, Play | 0.5 day | built |
| Per-theme polish of new pieces (Signal pixel edges, Orbit ink) | 1 to 2 days | first pass done; needs Mika's eye |
| World evolution per milestone | 3 to 5 days + art | not started |
| Dreamy expressions for Orbit and Horizon beyond 3 poses | art | shopping list |

### Risks

- **Art volume.** 20 lessons x 5 terms x 4 themes = 400 term pictures if every term gets one. The concept card plus scene card rule keeps that near zero; only concrete nouns get art.
- **Consistency across four industries.** Each industry needs its own example company and value ladder (what does "$30B" mean for nursing?). Lock the kit (activity kinds, scene kinds, Dreamy moments) so a nursing lesson cannot invent a new layout.
- **Content quality.** The Replit's copy needs a pass (bugs above, 8th-grade check). Several L2 to L4 items are authored by us (L2 teach cards, review questions, the L4 Stock path); Joshua should approve.
- **Density.** Multi-step cases and 7-row sorts are the longest screens; they fit at 1440x900 and 390x844 only because FitToScreen scales them. Keep authored cases to 4 steps and sorts to 7 items.
- **Mastery rule drift.** Replit masters a term on a first-try right answer; ours credits 2 right answers per term, retries allowed. Pick one.

### What to lock first (so Joshua can build four industries)

1. **Lesson schema** (`GlossaryLesson` in `data.ts`): id, number, title, tier, minutes, goal, unlock value, intro {headline, line, hook}, 5 terms {term, definition, example, icon slug, formula?}, 7 questions, one review question per term, Power Play, 2 facts.
2. **Activity kinds (8):** choice (with optional scene and one-blank sentence), which one is wrong, match, sort (2 to 4 buckets), select all, case (chain: 2 to 4 steps of choice or number), Power Play (fill-in, case, or choose a path), teach cards.
3. **Scene kinds (6):** story, figures, ledger, shares, split, profit.
4. **Dreamy moments:** asks, numbers, case, right, wrong, streak, milestone. One pose each per theme.
5. **Copy rules:** 8th grade, every question states its question (no "Choose an answer."), feedback never starts with "Correct" when wrong, one fact per sentence, no em dashes.

### Suggested build order

Today: data model + routing (done), port L2 to L4 (done), new kinds (done), verify Drift and Signal desktop and phone (done, see contact sheets). This week: Mika's design pass on the new pieces per theme (Mon to Tue), Joshua reviews authored copy and answers open questions (Tue), fix round + Orbit/Horizon polish (Wed), lock schema and hand Joshua a one-page authoring guide plus a blank lesson template (Thu), Joshua starts industry 2 (Fri).

### Open questions for Joshua

1. L2 has no teach cards in the Replit. We added them for consistency with L3 and L4. Keep?
2. L3: is the fifth word Cash Flow (as taught) or Profit (as listed)?
3. Mastery: first try right, or two right answers (ours)? Should a recovered answer count?
4. Select then Check (Replit) or answer on tap (ours)?
5. Keep the timer and the combo chip? We dropped both.
6. L4 Power Play Stock path: what are its two steps? We mirrored the Bond path.
7. Unlock rule: Replit opens lessons 1 to 4 from the start. Ours opens every authored lesson (demo) and would otherwise require the previous lesson. Which for the pilot?
8. Will lessons 5 to 20 be rewritten in the new format (cases, scenes), and on what timeline?
9. For the four pilot industries: example company and value ladder for each? Same 20-lesson length?
10. Review questions: we wrote one per term. Do you want to author these?
11. Chapter names on the map ("The Startup", "Scaling Up", "The Big Leagues") are placeholders. Confirm or rename.

## 6. Art shopping list (nothing faked)

1. Dreamy poses for **Orbit** and **Horizon**: glasses, idea, nervous, puzzle (today they map to curious, happy, party only). Medium priority.
2. **Signal** pixel cloud: a "nervous" and a "thinking" variant (today one rig plus sparkles and a tilt). Medium.
3. **Storefront growth set** per theme: kiosk ($10K), shop ($50K), two shops ($120K), small factory ($250K), HQ, tower. Optional, powers the "world grows" idea.
4. **World evolution layers** per milestone (city lights in Drift's clouds, more towers in Horizon). Optional, later.
5. No term pictures are needed for Levels 2 to 4.

## Build status (13 Oct 2026, local only, nothing committed)

Routes: `/play/glossary/investment-banking?lesson=1..4`, QA jumps `&q=N` and `&pp=1`, theme `&theme=drift|signal|orbit|horizon` (DEMO-ONLY). Session log: the 13 Oct entry in `docs/AI_HANDOFF.md`.

Built: data model and `?lesson=` routing; Levels 2 to 4 content (`data-finance-l2-4.ts`); scene cards, one-blank sentence, select-all, multi-step case with number entry, case and path Power Plays, concept teach cards, Dreamy reactions, value ticker, results actions, map Play button, levels 18 to 20 (`GlossaryLabGameExperience.tsx`, `glossary-levels.css`).

Verified: every level auto-played to completion in Drift and Signal at 1440x900 and 390x844, Level 3 in Orbit, Level 4 in Horizon, Level 1 regression in Drift; no page scroll on any captured screen; tsc clean; eslint 0 errors. Contact sheets: `.../scratchpad/glossary-l2-4/sheet-*.jpg`.

Left: Mika's per-theme design pass on the new pieces; light mode; Orbit's HUD glyphs are pale on paper; the map footer is cramped on phones; Joshua's answers to the open questions above.
