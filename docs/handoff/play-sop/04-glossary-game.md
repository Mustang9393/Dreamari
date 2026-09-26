# Play SOP, chapter 4: Glossary Game

> Reference chapter of the Play SOP. Start at [README.md](README.md). This chapter was produced by a line-by-line read of the source at commit `2ff4bd5d` (26 Sept 2026); every `file:line` reference is against that commit, so re-check line numbers if the files have moved. Conventions: `UNCLEAR:` means the code alone does not settle it; `OBSERVED:` / `FINDING:` / `GAP:` / `BUG:` mark something a rebuild would get wrong by trusting comments or field names. All of them are collected, with a recommended decision, in [06-known-issues-and-decisions.md](06-known-issues-and-decisions.md).

Audience: Usman + his AI agent, recreating and scaling Glossary Games to every career.
Convention: `file:line` refs are against HEAD. `GGE` = `src/components/glossary/GlossaryGameExperience.tsx`. `UNCLEAR:` marks things I could not settle from code alone. "Finding:" marks a bug or gap found by reading code (not verified live unless stated).

---

## 0. Files in scope and quick facts

| File | Lines | Role |
|---|---|---|
| `src/app/play/glossary/[career]/page.tsx` | 32 | Route. Server component. Resolves career, 404s otherwise, renders lesson 0. |
| `src/components/glossary/data.ts` | 277 | Content schema + the only authored content (Finance Lesson 1, "Dream Sneakers"). |
| `src/components/glossary/progress.ts` | 111 | localStorage save (`dreamari-glossary-progress`). Write-only in practice. |
| `src/components/glossary/GlossaryGameExperience.tsx` | 2269 | The whole game: every screen, every question renderer, the state machine. |
| `src/components/play/glossaryThemeSound.ts` | 344 | Per-background-version SFX wrapper + synthesized background music + Music mute. |
| `src/components/play/sound.ts` | 204 | App-wide synthesized SFX + the Sound mute (`dreamari-play-muted`). v1 SFX come from here. |
| `src/components/play/music.ts` | 195 | Simulation (`/play/[game]`) MP3 music. **Not used by the Glossary Game at all.** Documented here only because it is the other music system and has its own separate mute key. |

Supporting files the game imports (read for this doc): `play/PlayBurst.tsx`, `play/PlayBackdrop.tsx`, `play/backdropPulse.ts`, `play/PlayVersionChip.tsx`, `play/useResolvedColor.ts`, `play/PlayBackdropV2Crt.tsx`, `play/PlayBackdropV3Dots.tsx`, `play/PlayBackdropV4Synthwave.tsx`, `ui/fireworks.tsx`, `ui/stars.tsx`, `flow/SparkBar.tsx`, `app/worlds.ts`, `app/theme.ts`, `app/IconTip.tsx`, `app/Inbox.tsx` (`HeaderActions`), `app/DreamScoreChip.tsx`, `lib/dreamScore.ts`, `src/app/globals.css` (keyframes + `.play-crt`), `components/marketing/tokens.css` (tokens + `[data-night-scene]`), `components/app/app.css` (`dm-*` affordances).

Quick facts:
- Only ONE career has a glossary: `investment-banking` (world "Business & Finance", accent amber `#ffb81f`). One lesson: `FIN-L01` "Business Basics". 5 terms, 7 main questions, 1 review question, 1 Power Play paragraph with 5 blanks, 2 facts.
- No timers, no lives, no hearts, no per-question points. Score = the lesson's flat `xpReward` (20) added once to the shared Dream Score.
- Mastery = each term needs 2 credited correct answers (`MASTERY_TARGET = 2`, GGE:87).
- Streak modal every 5 consecutive correct answers (GGE:1900).
- No typewriter/text-reveal animation anywhere in this game (see section 5).
- The content authoring source is `DreamAri_Glossary_Content_Template_v1.xlsx` (data.ts:1-3). **That xlsx is NOT in the repo** (searched; not found). Its structure is only recoverable from `data.ts`'s types and comments.
- The design reference was a Replit at `dceeai.replit.app/ib-glossary-game` (GGE:51, AI_HANDOFF.md:7190).

---

## 1. Data contract

### 1.1 Types (data.ts)

#### `GlossaryTerm` (data.ts:13-21)
| Field | Type | Required | Used by engine? | Notes |
|---|---|---|---|---|
| `id` | string | yes | yes | Key for mastery (`mastery[term.id]`), React keys, `termId` references from questions. In FIN-L01 the id equals the term word (`"Company"`). |
| `order` | number | yes | **no** | Terms render in ARRAY order, not by `order` (GGE:499, 654, 774, 2149). |
| `term` | string | yes | yes | Card title, Unlock button label ("Unlock {term}"), chips, mastery dot `title` tooltip. |
| `definition` | string | yes | yes | Front face of the flip card. |
| `example` | string | yes | yes | Back face of the flip card ("{exampleCompany} Example"). |
| `icon` | string (semantic slug) | yes | yes | Resolved via `TERM_ICON_MAP` (GGE:130-151). Unmapped slug falls back to lucide `Sparkles` (GGE:154). |
| `memoryTip` | string? | no | **no** | Authored for 3 of 5 terms, never rendered anywhere. |

#### `BaseQuestion` (data.ts:23-32), shared by all question kinds
| Field | Type | Notes |
|---|---|---|
| `id` | string | Also the SHUFFLE SEED for options / match right column (see 2.4). Also dedupe key for review questions. Must be unique within a lesson. |
| `termId` | string? | Which term a correct answer credits. Undefined only for Match It Up / Sort the Buckets (they credit per pair/item). Review questions MUST have `termId` or they are never drawn (GGE:1918). |
| `playOrder` | number | Main queue is sorted by this ascending (GGE:1753, 1839). Review questions' `playOrder` is ignored (appended in array order). |
| `prompt` | string | Shown in Dreamy's speech bubble (choice, typeTerm) or as a plain heading (matchUp, sortBuckets). **Not rendered for profitBuilder** (GGE:1339 excludes it; the scenario text is shown instead). |
| `feedbackCorrect` | string | Body text of the FeedbackPanel when correct. |
| `feedbackWrong` | string | Body text of the FeedbackPanel when wrong. This is the ONLY place the right answer is explained for typeTerm / profitBuilder / sortBuckets. |

#### `ChoiceQuestion` (data.ts:34-39), `kind: "choice"`
- `type`: `"Definition" | "Reverse Recall" | "Fill in the Blank" | "Catch the Misuse"`. Only `"Catch the Misuse"` changes the renderer (document-sheet style, `DocumentOptionList`, GGE:1362). The other three render identically (`OptionList`).
- `options: string[]` (authored distractors; there is NO distractor generation). Rendered A, B, C, D... (`String.fromCharCode(65 + i)`, GGE:841). Option TEXT is the React key (GGE:833, 872) so options must be unique strings.
- `correctIndex: number` (index into the AUTHORED order; display order is shuffled, the engine maps back).

#### `TypeTermQuestion` (data.ts:41-46), `kind: "typeTerm"`, `type: "Type the Term"`
- `wordBank: string[]`: tappable chips that fill the text input (they are a typing shortcut, not a separate answer path, GGE:908-911). Word text is the React key.
- `answer: string`: compared as `value.trim().toLowerCase() === answer.toLowerCase()` (GGE:899). Note: `answer` itself is NOT trimmed, only lowercased. FIN-L01 stores `"profit"` lowercase while the word bank says `"Profit"`; comparison still matches.

#### `MatchUpQuestion` (data.ts:48-53), `kind: "matchUp"`, `type: "Match It Up"`
- `pairs: MatchPair[]`, `MatchPair = { order: number; left: string; right: string; termId: string }`.
- Left column renders in array order; right column is shuffled with seed `question.id` (GGE:964). `order` is unused. `left` is the React key and the match identity; `right` is also a React key and is looked up with `find(p => p.right === right)` (GGE:1083), so both sides must be unique.
- On completion credits every pair's `termId` (GGE:1009).

#### `SortBucketsQuestion` (data.ts:55-61), `kind: "sortBuckets"`, `type: "Sort the Buckets"`
- `items: BucketItem[]`, `BucketItem = { order: number; text: string; bucket: string; termId: string }`.
- `buckets: string[]`: rendered in authored order in a 2-column grid (GGE:1170-1171).
- Items shuffled with seed `question.id + "-items"` (GGE:1125). `order` unused. `placed` state is keyed by `item.text` (GGE:1121, 1131) so item texts must be unique; `item.bucket` must exactly equal one of `buckets`.
- Credits the `termId` of each correctly-placed item, even if the overall answer is wrong (partial credit, GGE:1137-1141).

#### `ProfitBuilderQuestion` (data.ts:63-69), `kind: "profitBuilder"`, `type: "Profit Builder"`
- `scenario: string` (shown in an accent-tinted box).
- `steps: ProfitStep[]`, `ProfitStep = { order: number; label: string; answer: number }`. `order` IS used here: it is the React key and the number shown in the step's circle badge (GGE:1240, 1246).
- Each input is parsed `Number(value.replace(/[,$]/g, ""))` and compared with `=== step.answer` (GGE:1225). Commas and dollar signs are stripped; spaces are not stripped by the regex but `Number(" 100000 ")` tolerates surrounding whitespace. Decimals like `100000.0` would equal 100000. `"100k"` would be NaN (wrong).
- All steps must be correct for `correct: true`; credit goes to the single `question.termId` only when all correct (GGE:1228).
- This kind is finance-specific by name, but the mechanic is generic "multi-step numeric entry."

#### `GlossaryQuestion` union (data.ts:71)
`ChoiceQuestion | TypeTermQuestion | MatchUpQuestion | SortBucketsQuestion | ProfitBuilderQuestion`. The discriminant is `kind`; `type` is the content-template label.

#### `PowerPlay` (data.ts:73-77)
- `paragraph: string` with `{1} {2} ...` placeholders (1-based). Split with `/(\{\d+\})/g` (GGE:1512); each `{n}` becomes an input bound to `answers[n-1]`.
- `answers: string[]`: case-insensitive, trimmed compare (GGE:1497, 1502, 1538). Rendered (capitalized first letter) as a non-interactive word bank IN THE SAME ORDER as the blanks (GGE:1523-1529). Words are React keys, so duplicate answers would collide.

#### `GlossaryLesson` (data.ts:79-101)
| Field | Used? | Where |
|---|---|---|
| `id` | yes | `key` on the component (page.tsx:29), progress save key, Dream Score milestone id `glossary:{careerSlug}:{lessonId}` (GGE:2266). |
| `lessonNumber` | yes | "Start Lesson {n}" CTA (GGE:513). |
| `title` | yes | Unlock screen `<h2>` (GGE:670), in-question HUD left label (GGE:2126). |
| `subtitle` | **no** | Unused. |
| `milestone` | yes | UnlockComplete card subline (GGE:789). |
| `exampleCompany` | yes | Intro "Meet {x}", intro body, back of flip card "{x} Example". |
| `difficulty` | **no** | Unused. |
| `estimatedMinutes` | **no** | Unused. |
| `xpReward` | yes | "+{n} XP" on Complete; the amount saved and awarded (GGE:1687, 2265-2266). |
| `companyValue` | yes | LessonIntro big number `$10,000` and meter numerator. |
| `nextCompanyValue` | yes | Meter denominator and "Next: $50,000". |
| `nextMilestone` | yes | "Next: $50,000 · Meet your first investor". |
| `terms` | yes | Unlock carousel, chips, mastery. |
| `questions` | yes | Main queue, sorted by `playOrder`. |
| `reviewQuestions` | yes | Remediation pool (see 2.5). |
| `powerPlay` | yes | Power Play screen. |
| `facts` | yes | One picked with `Math.random()` for the 1.8s "Checking Your Mastery" screen (GGE:2241). |

#### `GlossaryCareer` (data.ts:103-108)
| Field | Used? | Notes |
|---|---|---|
| `careerSlug` | yes | Save key, milestone id, exit route `/career/{careerSlug}` (GGE:1831). |
| `careerTitle` | **no** | Unused in the game. |
| `world` | yes | `WORLD_COLORS[career.world]` sets `--glossary-accent` (GGE:1933). Must exactly match a key in `src/components/app/worlds.ts:29-45`, else falls back to `var(--world-business-money-office)` (amber). |
| `lessons` | yes | Only `lessons[0]` is ever played (page.tsx:23). |

### 1.2 The one real lesson, verbatim (data.ts:115-260)

Career registry (data.ts:262-269):
```ts
const GLOSSARY_CAREERS: Record<string, GlossaryCareer> = {
  "investment-banking": { careerSlug: "investment-banking", careerTitle: "Investment Banking", world: "Business & Finance", lessons: [FIN_LESSON_1] },
};
export function hasGlossary(slug: string): boolean { return slug in GLOSSARY_CAREERS; }
export function glossaryFor(slug: string): GlossaryCareer | null { return GLOSSARY_CAREERS[slug] ?? null; }
```

Lesson header (data.ts:235-259): `id "FIN-L01"`, `lessonNumber 1`, `title "Business Basics"`, `subtitle "Company · Product · Service · Customer · Profit"`, `milestone "Launch Dream Sneakers"`, `exampleCompany "Dream Sneakers"`, `difficulty "Beginner"`, `estimatedMinutes 4`, `xpReward 20`, `companyValue 10000`, `nextCompanyValue 50000`, `nextMilestone "Meet your first investor"`.

Terms (data.ts:115-121):
| id | order | term | definition | example | icon | memoryTip |
|---|---|---|---|---|---|---|
| Company | 1 | Company | A company sells products or services to make money. | Dream Sneakers is a company that makes and sells sneakers. | building | (undefined) |
| Product | 2 | Product | A product is something a company makes and sells. | Your sneakers are the product that customers buy. | sneaker | Product = something you can hold. |
| Service | 3 | Service | A service is work done for a customer, not a physical item. | Custom sneaker design is a service Dream Sneakers offers. | palette | Service = someone does something for you. |
| Customer | 4 | Customer | A customer buys what a company sells. | A person buying your sneakers is a customer. | shopping-bag | (none) |
| Profit | 5 | Profit | Profit is money left after a company pays all its costs. | If Dream Sneakers earns $200K and spends $120K, profit is $80K. | money-bag | Profit = what is left in your pocket. |

Main questions (data.ts:123-218), in `playOrder`:
| # | id | kind / type | termId (credit) | Prompt | Answer |
|---|---|---|---|---|---|
| 1 | FIN-L01-Q1 | choice / Definition | Company | What is a company? | "An organization that sells products or services to make money" (idx 1 of 4) |
| 2 | FIN-L01-Q2 | typeTerm | Profit | Dream Sneakers spends $10 to make a sneaker and sells it for $200. The $190 left over is called ______. | `profit`; wordBank = Company, Product, Service, Customer, Profit |
| 3 | FIN-L01-Q3 | choice / Fill in the Blank | Service | Dream Sneakers lets customers design their own shoes online. That is a ______ because it is work done for the customer. | "service" (idx 3 of company/profit/product/service) |
| 4 | FIN-L01-Q4 | matchUp | per pair: Company, Product, Customer, Profit | Match each term to its example. | Company-Dream Sneakers, Product-Sneakers, Customer-Person buying shoes, Profit-Money left after costs |
| 5 | FIN-L01-Q5 | choice / Catch the Misuse | Customer | One sentence uses a business term incorrectly. Tap it. | "The sneaker is the customer." (idx 2) |
| 6 | FIN-L01-Q6 | sortBuckets | per item: Product, Service, Customer, Company | Sort each item into the right bucket. | buckets Product/Service/Customer/Company; items Pair of sneakers->Product, Custom sneaker design->Service, Person buying shoes->Customer, Dream Sneakers itself->Company |
| 7 | FIN-L01-Q7 | profitBuilder | Profit | (prompt "Profit Builder", not rendered) scenario: "Dream Sneakers sells 500 pairs at $200 each. Costs are $60,000." | step 1 "Revenue: 500 × $200 =" -> 100000; step 2 "Profit: Revenue − $60,000 =" -> 40000 |

Review pool (data.ts:220-233): one question, `FIN-L01-Q8`, choice / Reverse Recall, termId Company, prompt "An organization that sells products or services to make money is called a...", options Company/Customer/Product/Service, correctIndex 0.

Power Play (data.ts:251-255):
> "Dream Sneakers is a {1} built to sell a great {2}: custom sneakers. We offer custom design as a {3} for every {4} who orders. Once costs are paid, the money left is {5}."
answers: `company, product, service, customer, profit`.

Facts (data.ts:256-259): 2 strings (sneaker industry 25 billion pairs/yr; most new companies no profit in year one).

Feedback copy: every question carries its own `feedbackCorrect` / `feedbackWrong` (see data.ts). Q7's two strings are identical (data.ts:215-216). Q4's `feedbackWrong` can never display (Match It Up cannot end wrong, see 4.3).

Actual displayed (shuffled) order, computed by re-running `shuffleStable` in node (deterministic, identical on server and client, identical every play):
- Q1: A = A savings account you open at a bank | B = A school that teaches business skills | **C = An organization that sells...** | D = A government office that sets prices
- Q3: A = profit | **B = service** | C = product | D = company
- Q5: A = Dream Sneakers sells sneakers as its product. | **B = The sneaker is the customer.** | C = Profit is money left after costs. | D = A customer buys Dream Sneakers online.
- Q8: A = Product | B = Service | C = Customer | **D = Company**
- Q4 right column: Sneakers | Person buying shoes | Money left after costs | Dream Sneakers
- Q6 item pool: Custom sneaker design | Person buying shoes | Dream Sneakers itself | Pair of sneakers

Mastery arithmetic for FIN-L01 if everything is answered correctly: Company 3 (Q1, Q4, Q6), Product 2 (Q4, Q6), Service 2 (Q3, Q6), Customer 3 (Q4, Q5, Q6), Profit 3 (Q2, Q4, Q7). All five reach 2. Only Company has a review question, so remediation can only ever fire for Company in this lesson.

### 1.3 Which careers have glossaries (and every entry point)

- Content: only `investment-banking` (data.ts:262-269).
- `src/components/play/games.ts:120-128` `GLOSSARY_GAMES` (the Play hub shelf): `investment-banking` "Finance Terms" (cover `/images/app/glossary-finance-thumb.png`, playable), plus three "Coming soon" dummy cards with no content: `registered-nurse` "Medical Terms", `airline-pilot` "Flight Terms", `software-engineer` "Tech Terms" (covers `glossary-{slug}-cards.png`). Title pattern "{Subject} Terms" (games.ts:115-118, direct feedback 9 Sept 2026).
- `PlayHub.tsx:188-205`: `playable = hasGlossary(slug)`; `href` only when playable, else `locked: true`. World font/accent via `worldForCareer(slug)` (games.ts:103-105).
- `CareerDetailExperience.tsx:530, 621-631`: "Glossary Game" button (lucide `BookOpen`, wrapped in `BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}`) only when `hasGlossary(career.slug)`; routes `/play/glossary/{slug}`. Same in `actions-lab/CareerDetailLab.tsx:493, 611-615`.
- `HomeExperience.tsx:427`: hardcoded Home activity card "Finance Glossary Game", `pct: 60`, `label: "6 of 10 terms mastered"`. Finding: this progress is fake (not read from glossary progress; the lesson only has 5 terms). Not tagged `DEMO-ONLY`.
- `profile/data.ts:107`: My Plan task "Complete 3 Glossary Games for your #1 Career" -> `/play/glossary/investment-banking` (hardcoded slug).
- `lib/studentSignals.ts:79-86` `glossaryDone()`: counts `completed` lessons across the raw `dreamari-glossary-progress` JSON (drives counselor/My Plan signals).
- `TERM_ICON_MAP` pre-registers icon slugs for planned Aviation (Airline Pilot), Healthcare (Registered Nurse), Tech (Software Engineer) glossaries (GGE:136-150), but `data.ts` has never contained those careers (git log -S shows data.ts only ever touched in `c281ac1c` and `49a34220`).

### 1.4 Public assets referencing glossary

`find public -ipath '*glossary*'` (all in `public/images/app/`):
| File | px | Bytes | Referenced? |
|---|---|---|---|
| glossary-finance-thumb.png | 941x1672 (portrait) | 1,916,679 | yes: games.ts:120, HomeExperience.tsx:427 |
| glossary-registered-nurse-cards.png | 1672x941 | 2,407,505 | yes: games.ts:126 |
| glossary-airline-pilot-cards.png | 1672x941 | 1,986,408 | yes: games.ts:127 |
| glossary-software-engineer-cards.png | 1672x941 | 1,931,036 | yes: games.ts:128 |
| glossary-healthcare-thumb-v2.png | 1672x941 | 2,407,505 | no (md5-identical to registered-nurse-cards) |
| glossary-aviation-thumb-v2.png | 1672x941 | 1,986,408 | no (md5-identical to airline-pilot-cards) |
| glossary-tech-thumb-v2.png | 1672x941 | 1,931,036 | no (md5-identical to software-engineer-cards) |
| glossary-healthcare-thumb.png | 1672x941 | 2,073,104 | no |
| glossary-aviation-thumb.png | 1672x941 | 2,563,242 | no |
| glossary-tech-thumb.png | 1672x941 | 1,955,566 | no |

In-game images: only Dreamy sprites, `public/images/dreamy/v2/dreamy-{pose}.png` (GGE:182). Poses the game uses: `idea`, `happy`, `glasses`, `curious`, `party`, `puzzle`. The `DreamyFace` type also allows `nervous` and `heart` (both files exist) but no screen uses them. Rendered via `next/image` at `width/height = size * 1.5`, CSS size = `size`.

Art style history: finance thumb is a user-supplied anime-style illustration (term cards on a desk, Empire State skyline, sneaker sketch) (AI_HANDOFF.md:7253). Other covers are "card-hand" thumbnails (games.ts:121-125).

### 1.5 What a NEW career must supply (checklist)

A. Content in `data.ts` (or its production equivalent), one `GlossaryCareer`:
1. `careerSlug` matching the career catalog slug (same slug the Career Detail page and Play hub use).
2. `careerTitle` (currently unused, but supply it).
3. `world`: an exact `WORLD_COLORS` key (worlds.ts:29-45). This single string sets the entire accent (CTAs, meter, chips, progress bar, mastery dots, flip-card sketch strokes, fireworks). Options and their dark / light values (tokens.css:43-64 and 325-340):
   - Business & Finance `#ffb81f` / `#825900`; Tech & Engineering `#6366f1` / `#3d41fb`; Health & Medicine `#14b8a6` / `#046c61`; Driving, Flying & Shipping `#3b82f6` / `#0055df`; Arts, Media & Sport `#ff4585` / `#c20043`; Science & Research `#00c8dc` / `#006b76`; Teaching & Education `#8b5cf6` / `#6928ff`; Building & Construction `#ff9640` / `#9e4700`; Law, Safety & Justice `#e5484d` / `#c10e14`; Food & Cooking `#1fc76e` / `#0a6f39`; Farming, Animals & Nature `#1fc76e` / `#0a6f39`; Counseling & Social Work `#c05fa6` / `#a03583`; Factories & Making Things `#c2703d` / `#914e24`; Fixing Machines & Engines `#64748b` / `#526177`; Personal Care & Community Services `#d946ef` / `#b62060`.
4. At least one `GlossaryLesson` (only index 0 plays today).

B. Per lesson:
1. Header fields: `id` (globally unique, becomes the milestone id), `lessonNumber`, `title`, `subtitle`, `milestone`, `exampleCompany` (the one story company every example ties back to), `difficulty`, `estimatedMinutes`, `xpReward`, `companyValue`, `nextCompanyValue`, `nextMilestone`.
2. `terms`: the template uses 5 (UI is tuned for 5, see B-constraints). Each: unique `id`, `term`, `definition`, `example` (mentioning `exampleCompany`), `icon` slug, optional `memoryTip`.
3. `questions`: the template's worked example covers all question types. Each needs unique `id`, `playOrder`, `prompt`, `feedbackCorrect`, `feedbackWrong` plus kind-specific fields. Distractors are AUTHORED (`options`), there is no generator.
4. `reviewQuestions`: one or more per term you want remediated. Each MUST have `termId`. README rule quoted in data.ts:95-97: "if the student gets one wrong the review round needs a different question to ask".
5. `powerPlay.paragraph` with `{1}`..`{n}` and matching `answers` (n entries, unique).
6. `facts`: 1+ short "did you know" lines (0 is handled: nothing shown).

C. Engine / UI pieces a new career needs (NOT data-driven today):
1. Icon slugs must exist in `TERM_ICON_MAP` (GGE:130-151) or they render as `Sparkles`. Existing slugs: `building`, `sneaker` (custom SVG), `palette`, `shopping-bag`, `money-bag`, `thrust`, `lift`, `drag`, `altitude`, `stethoscope`, `heart-pulse`, `pulse`, `siren`, `plug`, `database`, `bug`, `workflow`. Rule: "Illustrations stay RELEVANT to the lesson's own story (direct feedback): the product IS a sneaker, the service IS custom design (a brush, not a bell), the customer is a PERSON" (GGE:127-129). No raw emoji ever (GGE:104-107).
2. Hardcoded finance copy that must be parameterized for other careers:
   - IntroScreen body: "You'll learn finance words using {exampleCompany} as your example." (GGE:403)
   - DreamyIntroScreen CTA: "Start Learning Finance" (GGE:463)
   - LessonIntroScreen heading: "Learn the Language of Finance" (GGE:480)
   - Everything else is data-driven.
   - UNCLEAR: which field should drive these (world name? careerTitle? a new `subject` field). Suggest a `subject` string ("finance", "nursing", "aviation").
3. The company-value meter (`companyValue`/`nextCompanyValue`, "$" prefixed with `toLocaleString()`) is a finance "grow your company" metaphor. Other careers need an equivalent progress metaphor or these fields reinterpreted. UNCLEAR: no guidance exists in code.
4. Play hub card: add to `GLOSSARY_GAMES` (games.ts:119-129) with `cover`. `worldForCareer(slug)` must resolve (career must be in `SIMULATIONS` or `SOON` for the poster font/accent on the hub card).
5. Career Detail button appears automatically once `hasGlossary(slug)` is true.
6. Art: a hub cover (1672x941 landscape "card-hand" style for the Coming-soon ones; finance's is 941x1672 portrait). No per-career in-game art; the in-game "art" is the term icons + Dreamy.
7. There is NO per-career theme music; music is per background version, not per career (section 6).

D. Authoring constraints implied by the engine (validate these in an importer):
- All ids unique within the lesson; lesson id globally unique.
- Every `termId` (question, pair, item, review) must match a `terms[].id`, otherwise credit is silently lost.
- `choice.correctIndex` in range; option strings unique.
- `typeTerm.answer` should also appear in `wordBank` (the word bank is the tap path). Not enforced.
- `matchUp` left strings unique, right strings unique.
- `sortBuckets` item texts unique; every `item.bucket` in `buckets`.
- `profitBuilder.steps[].order` unique (it is the React key and the displayed number); `answer` a finite number.
- `powerPlay` placeholder count == `answers.length`; placeholders 1-based and contiguous; answers unique. The paragraph may reuse a placeholder twice, but both inputs would bind to the same value.
- Term count: UnlockComplete renders one 44px (56px at sm) circle per term in a `flex-nowrap` row (GGE:773-775) and the HUD one 20px dot per term; >6-7 terms will overflow a 320-375px phone. The "650px" height guard (GGE:2058) was measured on 5 terms' UnlockScreen; longer definitions change it. Keep 5 terms per lesson (Joshua's spec, AI_HANDOFF.md:12785: "5 terms per level").
- Mastery needs 2 credits per term from main questions; author so each term is credited at least twice across the 7 questions, and give every term a review question if you want remediation to cover it.

---

## 2. Game flow / state machine

### 2.1 Route and mount (page.tsx)
- `/play/glossary/[career]`, `params` is a Promise (`await params`, page.tsx:20), per this Next.js version.
- `glossaryFor(slug)`; `null` -> `notFound()` (page.tsx:22). No lesson -> `notFound()` (page.tsx:24).
- Renders Google Fonts `preconnect` links (page.tsx:27-28) and `<GlossaryGameExperience key={lesson.id} career lesson />`.
- Imports `@/components/marketing/tokens.css` and `@/components/app/app.css` (page.tsx:5-6).
- Metadata: title "Glossary Game · Dreamari", description "Learn the words behind a career, one term at a time." (page.tsx:8-11).
- Comment (page.tsx:13-18): "Only lesson 1 plays today; a `?lesson=` param could pick among more once a career has them." Not implemented.
- No `loading.tsx`, no `not-found.tsx` in `src/app` (Next default 404 page).

### 2.2 State (GGE:1749-1759)
| State | Initial | Meaning |
|---|---|---|
| `screen: Screen` | `"intro"` | Current screen. |
| `unlockIndex` | 0 | Which term the Unlock carousel shows; `== terms.length` means show UnlockComplete. |
| `queue: GlossaryQuestion[]` | `questions` sorted by `playOrder` | Main queue; review questions are appended in place. |
| `queueIndex` | 0 | Current question. |
| `mastery: Record<termId, number>` | `{}` | Credit counts. |
| `pendingResult: AnswerResult \| null` | null | Non-null = FeedbackPanel open. |
| `streak` | 0 | Consecutive correct answers. |
| `showStreak: number \| null` | null | Non-null = StreakModal open. |
| `dismissedReview` | false | Review pull has been evaluated and found empty. |
| `bgVersion` | `"v1"` | DEMO-ONLY background version (from `?bg=`). |
| `dockSpace`, `topBarSpace` | 0 | Measured px for layout math. |

`Screen` union (GGE:75-85): `intro | dreamyIntro | lessonIntro | unlock | unlockComplete | question | powerPlayIntro | powerPlay | masteryLoading | complete`. `"unlockComplete"` is NEVER assigned; UnlockComplete renders as a sub-case of `"unlock"` when `unlockIndex >= terms.length` (GGE:2087-2095, 2194-2208).

State is all in-memory; a reload restarts at `intro` (no mid-lesson resume, by design: progress.ts:3-6 "a glossary lesson is ~4 minutes and restartable").

### 2.3 Transitions
```
intro --Next--> dreamyIntro --Start Learning Finance--> lessonIntro --Start Lesson N--> unlock[0]
unlock[i] --Unlock {term}--> unlock[i+1] ... unlock[n-1] --Unlock--> (unlock, index n) = UnlockComplete
UnlockComplete --Start Practice--> question (if queue.length > 0) | powerPlayIntro (if 0 questions)
question: answer -> handleAnswer -> FeedbackPanel (+ StreakModal on every 5th streak)
FeedbackPanel --Next Question / See Results--> advanceQuestion:
    not end of queue -> queueIndex+1
    end of queue and !dismissedReview -> reviewPool = reviewQuestions where termId in (terms with mastery < 2) and not already in queue
        pool non-empty -> append ALL of pool to queue, queueIndex+1 (stay on question)
        pool empty -> dismissedReview = true, fall through
    -> powerPlayIntro
powerPlayIntro --Unlock & Test My Knowledge--> powerPlay
powerPlay --Check Answers (repeat until all correct)--> --Finish Lesson--> masteryLoading
masteryLoading --setTimeout 1800ms--> complete (awards XP + saves on mount)
complete --Continue--> router.push(`/career/${careerSlug}`)
TopBar Back (any screen) --> router.back()
```
Code: GGE:2191-2232 (screen switch), 1888-1904 (`handleAnswer`), 1906-1927 (`advanceQuestion`), 2240-2247 (mastery loading gate), 2249-2269 (complete gate), 1830-1832 (`exitToCareer`), 2107 (Back).

### 2.4 Question generation and randomization
- No generation: questions are authored. No distractor selection logic.
- Order: main queue sorted by `playOrder` ascending, fixed.
- Shuffles use `shuffleStable(items, seed)` (GGE:1283-1295): string hash `h = (h*31 + charCode) >>> 0` over the seed, then a Fisher-Yates using an LCG `h = (h*1103515245 + 12345) >>> 0; j = h % (i+1)`. Deterministic by design ("no Math.random at render, so SSR/CSR stay in sync", GGE:1284-1285). Consequence: the shuffled order is the SAME for every student, every play.
  - Choice options: seed `question.id` (GGE:1305); correct index remapped (`findIndex(s => s.i === correctIndex)`, GGE:1366).
  - Match right column: seed `question.id` (GGE:964).
  - Sort items: seed `question.id + "-items"` (GGE:1125).
  - Type-term word bank: NOT shuffled (authored order).
  - Power Play word bank: NOT shuffled and in blank order (Finding: gives away the answer order; `[...answers]` copy at GGE:1523 suggests a shuffle was intended but none is applied).
- No-repeat: a review question is appended only if not already in the queue (`!queue.some(existing => existing.id === q.id)`, GGE:1918). Each review question can be asked at most once per session.
- The only true randomness: which `fact` shows on the mastery-loading screen (`Math.random()` in a `useState` initializer, client-only, GGE:2241).

### 2.5 Remediation (review round) exact rule
At the end of the queue, once: take terms whose `mastery < MASTERY_TARGET (2)`; pull every `reviewQuestion` with a `termId` among them that is not already queued; append all at once. When that extended queue ends, the rule re-runs; since pulled ones are now queued the pool is empty, so it sets `dismissedReview` and goes to Power Play. Terms still under 2 after review simply stay unmastered; there is no forced repeat and no gate. Mastery shortfall does NOT block completion.

Review questions show in the HUD as extra items: denominator becomes `max(mainLoopLength, queue.length)` (GGE:1827, 2133), e.g. "8/8 · 100%".

### 2.6 Timers, lives, streaks, combos
- Timers: none on questions. Only timers: MasteryLoading 1800 ms (GGE:2243); MatchUp line flash 350/750 ms (GGE:1004-1005); MatchUp wrong flash 400 ms (GGE:1015); music `setInterval` (section 6).
- Lives/hearts: none.
- Streak: `+1` on every `result.correct`, reset to 0 on any wrong (GGE:1897-1903). When `nextStreak % 5 === 0` open StreakModal with that number (GGE:1900). Streak persists across the review round; not saved; not shown anywhere else in-game.
- The app-wide `DreamScoreChip` in the top bar shows "12" day streak, hardcoded (`DreamScoreChip.tsx:27`); unrelated to the in-game streak.
- Combos/multipliers: none.

### 2.7 Scoring (exact)
- Per-question score: none. Correctness only affects mastery, streak, and which feedback text shows.
- XP: flat `lesson.xpReward` (FIN-L01: 20).
- On mount of the Complete gate (lazy `useState` initializer, GGE:2264-2267), two writes:
  1. `saveLessonComplete(careerSlug, lessonId, lesson.terms.map(t => t.id), lesson.xpReward)` (progress.ts:103-111): per-career `dreamScore += max(0, floor(xpReward))`, `lessons[lessonId] = { masteredTermIds, completed: true }`. **No dedupe**: every completion adds another 20 to the glossary store's own `dreamScore`. **Finding:** `masteredTermIds` saves ALL term ids, not the actually mastered ones.
  2. `awardDreamScore("glossary:{careerSlug}:{lessonId}", xpReward)` (lib/dreamScore.ts:23-36): shared Dream Score, once per milestone id (dedupe via `dreamari:dream-score:awards`). Dispatches `dreamari:dream-score-change` so the header chip updates.
- Complete screen shows: Dream Score = shared total (`useDreamScore()`, not the lesson gain); "+{xpReward} XP" (always shown, even on a replay that awarded nothing); "Mastery Progress" = `round(masteredCount / terms.length * 100)`% from in-session mastery (0 if no terms, GGE:1629).
- Spec cross-refs: `docs/handoff/specs/dream-score.md` "Glossary lessons (6 Sept 2026)": 20 XP once per lesson; the old private "Dream Score x100" (15,000+ figures) is gone (also GGE:1620-1622). `docs/handoff/specs/progression-system.md:135-136` PROPOSES 30 XP per glossary lesson and 40 XP for "Pass a delayed glossary check ... at least 48 hours later" (proposal, not locked, not implemented).

### 2.8 Progress persistence (localStorage)
| Key | Shape | Writer | Reader |
|---|---|---|---|
| `dreamari-glossary-progress` | `Record<careerSlug, { dreamScore: number; lessons: Record<lessonId, { masteredTermIds: string[]; completed: boolean }> }>` | `saveLessonComplete` | `glossaryProgressSnapshot()` (only internally by `saveLessonComplete`), `studentSignals.glossaryDone()` (raw JSON). `readDreamScore`/`readLesson`/`subscribeGlossaryProgress` exported but unused anywhere. |
| `dreamari:dream-score` | number string | `awardDreamScore` | header chip, Complete screen, studentSignals |
| `dreamari:dream-score:awards` | JSON string[] of milestone ids | `awardDreamScore` | dedupe |
| `dreamari-play-muted` | `"1"` / `"0"` | Sound toggle (`sound.ts`) | SFX gate. Shared with the career simulations. |
| `dreamari-glossary-music-muted` | `"1"` / `"0"` | Music toggle (`glossaryThemeSound.ts`) | Glossary loop gate. Separate from simulation music (`dreamari-play-music-muted`, music.ts:12). |

Example stored value after one FIN-L01 completion:
```json
{"investment-banking":{"dreamScore":20,"lessons":{"FIN-L01":{"masteredTermIds":["Company","Product","Service","Customer","Profit"],"completed":true}}}}
```
Parse is defensive (progress.ts:24-46): non-object -> `{}`; career entries without numeric `dreamScore` or object `lessons` dropped; lesson entries need array `masteredTermIds` and boolean `completed`; ids filtered to strings; `dreamScore` floored and clamped >= 0. Snapshot cached by raw string (progress.ts:48-65). Cross-tab `storage` events notify listeners (progress.ts:71-81). `DEMO-ONLY` per dream-score spec: production stores the score server-side and awards once per milestone id (lib/dreamScore.ts:7-9).

### 2.9 Unlocks, replay, links
- "Unlock" in this game means the per-term card reveal (UnlockScreen). There is no lesson-to-lesson unlock, no locked lessons, no gating on saved progress. Saved progress is never read back to change the game.
- Replay: leave and re-enter the route (state is local and re-initializes); or the DEMO-ONLY "Reload from start" button (`resetGame`, GGE:1836-1846). No product "Play again" button.
- Exits: TopBar "Back" = `router.back()` (GGE:2107) on every screen (Finding: arriving by direct URL with no history, `back()` leaves the site or no-ops). Complete "Continue" = `router.push('/career/{slug}')` (GGE:1831, 2230). Hamburger `QuickLinksMenu` and notifications bell via `HeaderActions` (GGE:347). No link to the Play hub or to the career simulation from inside the game.

### 2.10 DEMO-ONLY controls (grep `DEMO-ONLY`)
- `DemoStepControls` (GGE:277-314): "Demo" label (9px bold, 0.08em tracking, uppercase), `Undo2` "Go back one step" (disabled on `intro`), `RotateCcw` "Reload from start". Requested 21 Sept 2026 (quote at GGE:278-280).
- `DemoControlsDock` (GGE:353-388): fixed bottom-center (`fixed inset-x-0 bottom-4 z-20`), holds DemoStepControls + `PlayVersionChip`. Moved off the top bar 22 Sept 2026 ("it gets confused with actual UI").
- `stepBack()` (GGE:1848-1886): moves only the screen pointer; leaves mastery/streak/queue alone. Map: dreamyIntro->intro; lessonIntro->dreamyIntro; unlock i>0 -> i-1, i==0 -> lessonIntro; question qi>0 -> qi-1, qi==0 -> unlock (Finding: lands on UnlockComplete since unlockIndex is still n); powerPlayIntro -> question at last index; powerPlay -> powerPlayIntro; masteryLoading -> powerPlay; complete -> powerPlay.
- `PlayVersionChip` + `?bg=2|3|4` (GGE:1786-1800, 1812-1818; PlayVersionChip.tsx): v1 default ("Stars + berry backdrop"), v2 CRT, v3 Dots, v4 Synth. Written back with `history.replaceState` (v1 deletes `bg`).
- Production: drop the dock, the chip, `?bg`, the v2-v4 backdrops and their SFX/music variants (keep v1).

---

## 3. Screens: layout and visual design

### 3.0 Global shell (GGE:1935-2237)
Root `<div class="marketing-v2 themeable relative flex min-h-dvh w-full flex-col [play-crt when v2]">` with inline style:
- `--glossary-accent: WORLD_COLORS[career.world] ?? var(--world-business-money-office)`.
- `--glossary-shell-scale` (GGE:2057-2058), exact:
  `clamp(1, min(calc(1 + calc(max(0px, (100vw - 1440px)) / 750px) + calc(max(0px, (100dvh - 900px)) / 750px)), calc(100vw / 640px), calc((100dvh - var(--top-bar-space, 0px) - var(--demo-dock-space, 0px) - 32px) / 650px)), 2.6)`
  - Anchor: 1440x900 (13" MacBook Air CSS viewport) = exactly 1. Floors at 1 on phones/tablets below the anchor, so every `calc(Npx*scale)` equals the original Npx on mobile.
  - Growth: +1 per 750px beyond 1440 width PLUS +1 per 750px beyond 900 height (summed).
  - Guards: width `100vw/640px`; height `(100dvh - topBar - dock - 32px)/650px` (650px = UnlockScreen content height at scale 1).
  - Cap 2.6.
  - Measured live per AI_HANDOFF.md:864-899: 375x812 -> 1; 768x1024 -> ~1.165 (main ~746px); 1440x900 -> 1 (640px); 1920x1080 -> height-guard bound, card ~894.5px; 1440x1600 -> ~1.93 (main ~1237px); 2000x1100 -> height-guard bound, card ~914px.
  - Production note: the `--demo-dock-space` term must be dropped/zeroed when the demo dock is removed.
- `--demo-dock-space: {dockSpace}px`, `--top-bar-space: {topBarSpace}px` (measured with `useMeasuredSpace`, a ResizeObserver + window resize hook, GGE:1713-1744; dock space = `innerHeight - dock.top`, top bar = its height). Measured values: dock 36px at 1440x900, 44.5px at 2000x1100; top bar 60px at 1440 wide, 75px at 1920/2000 wide (GGE:1770-1776, 321-326).
- `background: transparent` (PlayBackdrop is the visible ground), `color: var(--foreground)`, `fontFamily: var(--font-body)`.

Layer stack (DOM order / z):
1. Backdrop (fixed inset-0 z-0): v1 `PlayBackdrop`, or v2/v3/v4 (section 7).
2. Accent top glow (fixed inset-0 z-0, pointer-events-none): `radial-gradient(120% 60% at 50% -10%, color-mix(in srgb, var(--glossary-accent) 30%, transparent), transparent 65%)` (GGE:2102-2106).
3. `TopBar` (relative z-10).
4. `DemoControlsDock` (fixed z-20).
5. HUD strip, question screen only (relative z-10).
6. `<main>` (relative z-0): `mx-auto flex w-full max-w-[calc(640px*scale)] flex-1 flex-col justify-center gap-[var(--space-5)] px-5 pt-[var(--space-4)] pb-[calc(var(--space-4)+var(--demo-dock-space,0px))] md:px-8` (GGE:2189). Every screen is centered vertically and horizontally.
7. FeedbackPanel / StreakModal (fixed inset-0 z-50). StreakModal renders after `<main>` so it paints above FeedbackPanel when both are open.

Fonts:
- Display: `--font-display: "Bricolage Grotesque", sans-serif` (tokens.css:151), loaded through a Google Fonts `<link>` (marketing/fonts.ts:28, weights 400;600;700;800). All headings and CTAs set `fontFamily: var(--font-display)`.
- Body: `--font-body: var(--font-inter), sans-serif` (tokens.css:155); Inter via `next/font` (layout.tsx:17-21, weights 400-800).
- CRT (v2 only): `--font-display: "Press Start 2P", "Courier New", monospace` (globals.css:1148), injected `<link>` on v2 mount only (PlayBackdropV2Crt.tsx:25, 34-40).

Tokens used (dark `.marketing-v2` values from tokens.css; light values from `html.light .marketing-v2.themeable`):
| Token | Dark | Light | Used for |
|---|---|---|---|
| `--background` | #05070f | #f4f7ff | text on danger/foreground buttons, ring dots, badges border |
| `--foreground` | #f4f7ff | #05070f | text; Check Answer / Keep Going / wrong-feedback button fill |
| `--card` | #151829 | #d8dbe8 | all cards, options, inputs |
| `--muted-foreground` | #ffffff9e | #4a4f6d | secondary text, Back |
| `--glass-surface-1` | #ffffff08 | #00000008 | toggle buttons, buckets, demo dock |
| `--glass-surface-2` | #ffffff17 | #00000017 | meter/progress tracks, empty mastery dots |
| `--glass-border` | #ffffff17 | #00000017 | all borders |
| `--hero-accent-purple` | #2e2466 | #cfc6f5 | Power Play accent |
| `--hero-accent-teal` | #0f474d | #bfe9ee | StreakModal gradient |
| `--amber-400` | #ffc94d | #805900 | StreakModal "N in a row!", unchecked sort-chip tint |
| `--world-food-farming-nature` | #1fc76e | #0a6f39 | `CORRECT_COLOR` (GGE:813) |
| `--destructive` | #ef4444 | (light block) | backdrop "wrong" bloom |
| `--danger` | **undefined** | **undefined** | Always falls back to literal `#e0483e` |
| `--success` | **undefined** | **undefined** | Always falls back to `#1f9d55` (SpeechBubble correct tone, never actually used with tone != neutral) |
| `--accent` | #2f6bf2 | #1e4fcc | Sort item "picked" border (the one place blue is used, GGE:1156) |
| `--accent-subtle` | #3894ff | #1e4fcc | `dm-*` hover border/link color and focus ring |
| `--color-brand-500` | #2f6bf2 | | DreamyFace failed-load fallback circle |
| `--space-1..6, 8, 10, 12, 13, 14` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 52, 56 px | same | **No `--space-7`** (undefined -> padding computes to 0, a bug hit once, GGE:1330-1337) |
| `--radius-sm / md / lg` | 8 / 12 / 16 px | same | chips / buttons+options / cards (0 under `.play-crt`) |

Light mode (important): the game root has `themeable`, so in light mode every `var(--card)`/`var(--foreground)` card flips light while the backdrop stays the dark berry scene. Only the TopBar is protected by `data-night-scene` (GGE:330-333; tokens.css:255-265 pins `--foreground #f4f7ff`, `--background #05070f`, `--muted-foreground #ffffff9e`, `--border #ffffff17`, `--secondary-foreground`, `--glass-surface-1/2/3`, `--glass-border #ffffff17` inside it). The SpeechBubble is also always dark via local `--speech-bubble-bg/-fg` literals (GGE:194-209). Memory note: "Skip light mode checks" for fast iteration; the light-mode audit is paused.

`primaryCtaColors(theme)` (GGE:89-102): returns `{ background: "var(--glossary-accent)", color: "#05070f" }` in BOTH themes (26 Sept 2026 light pass: the old light-mode ink button "read as a black slab on a dark scene"). `theme` is ignored (eslint-disable). Used by: Intro Next, DreamyIntro Start Learning Finance, LessonIntro Start Lesson, Unlock, UnlockComplete Start Practice, Complete Continue. Finding: in light mode the accent resolves to the darkened text-contrast values (`#825900` for finance), and near-black `#05070f` text on `#825900` is roughly 3.2:1 (my computation), below 4.5:1. Also dark text on dark accents like Tech's indigo `#6366f1` (dark) is low contrast; check per world before shipping.

Shared CTA spec (6 primary buttons): `dm-solid flex w-full max-w-[min(calc(Npx*scale),560px)] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold`, display font, trailing `ChevronRight h-4 w-4`. N per screen: Intro 480, DreamyIntro 520, LessonIntro 440, Unlock 440, UnlockComplete 420, PowerPlayIntro 420, Complete 380. The 560px ceiling keeps buttons from "stretched pill" growth (GGE:409-423).

### 3.1 TopBar (GGE:316-351)
`<header data-night-scene class="relative z-10 flex items-center justify-between px-5 pt-5 md:px-8">`.
- Left: "Back" text button, `dm-quiet`, 14px semibold, `--muted-foreground`, `ChevronLeft h-4 w-4`, `aria-label="Back"`.
- Right (`gap-[var(--space-2)]`): `MusicToggle`, `MuteToggle`, `HeaderActions` (DreamScoreChip: streak "12" + XP bolt; NotificationsButton; then `QuickLinksMenu` hamburger).
- MusicToggle (GGE:259-275): 36px circle (`size-9`), glass-surface-1 fill, glass-border, lucide `Music` 16px; when off: icon opacity 0.4 and color muted. Tooltip "Turn music on/off" via `IconTip`; `aria-pressed={musicOff}`.
- MuteToggle (GGE:237-257): same shell, `Volume2`/`VolumeX` 17px, "Turn sound on/off"; unmuting plays `playSelect()` as audible confirmation.

### 3.2 HUD strip, question screen only (GGE:2117-2178)
Container `relative z-10 mx-auto w-full max-w-[calc(640px*scale)] flex-col gap-[6px] px-5 pt-[var(--space-2)] md:px-8`.
- Row 1 (13px extrabold, muted): left `lesson.title`, right `"{n}/{total} · {pct}%"`. Sizes match SimulationPlayer's `Hud` (13px title, 11px secondary), 21 Sept 2026.
- Progress bar: `SparkBar percent min=4 height=4 track=--glass-surface-2 fill=glow=--glossary-accent`, wrapped in a span carrying `--crt-glitch-glow/anim` (CRT only).
- Row 3: mastery dots, one per term, `size-5` (20px) circles, `gap-[5px]`, filled accent with a `Check 11px` in `#05070f` when mastered, else glass-surface-2; `title={term}`; CRT glitch box-shadow on filled dots only. Right: "Mastered {x}/{n}" 11px bold muted.
- Percent math (GGE:1822-1827): `currentNumber = min(queueIndex+1, queue.length)`; `percent = round(currentNumber / max(mainLoopLength, queue.length) * 100)`. First question reads "1/7 · 14%" (never opens at 0, matching the reference).

### 3.3 Intro, "Meet {Company}" (GGE:393-431)
Column `items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)] text-center`.
- `DreamyFace pose="idea" size={64}`.
- Card `max-w-[calc(480px*scale)] gap-[var(--space-3)] rounded-lg border p-[var(--space-6)]`, bg `--card`, border `--glass-border`.
  - `h1` "Meet {exampleCompany}" 26px / 32px line, extrabold, display font.
  - `p` "You'll learn finance words using {exampleCompany} as your example." 15px / 21px.
- CTA "Next".

### 3.4 DreamyIntro (GGE:436-468)
- Wrapper `relative w-full max-w-[calc(520px*scale)] pt-8`; Dreamy `happy` 64px absolutely at `-top-8 left-5 z-10` overlapping the bubble's top-left corner (overlaps the bubble, never the text).
- `SpeechBubble`: "Hi, I'm Dreamy! Let's get started."
- CTA "Start Learning Finance".

SpeechBubble (GGE:193-235): `flex min-w-0 flex-1 items-start rounded-lg border px-[var(--space-5)] py-[var(--space-4)]`, bg `var(--speech-bubble-bg, #151829)` (correct tone mixes 14% success, wrong 12% danger; only neutral is used), border glass-border, shadow `0 18px 40px -22px rgba(0,0,0,0.45)` (neutral). Text `crt-cursor-after`, size `clamp(calc(19px*scale), calc(2.8*scale*1dvh), calc(23px*scale))`, line-height 1.35, extrabold, display font, color `var(--speech-bubble-fg, #f4f2fa)`. At 375x812 computed 22.736px (AI_HANDOFF.md:865).

### 3.5 LessonIntro (GGE:473-517)
- Dreamy `glasses` 64px.
- `h1` "Learn the Language of Finance" 24px / 30px extrabold display.
- Card `max-w-[calc(440px*scale)] gap-[var(--space-4)] rounded-lg border p-[var(--space-5)] text-left`:
  - Value box `rounded-md p-[var(--space-4)] gap-[var(--space-2)]`, bg `color-mix(accent 14%, --card)`: "$10,000" 22px extrabold display in accent; `SparkBar percent=round(companyValue/nextCompanyValue*100)` (FIN-L01: 20) `min=4 height=6`; "Next: $50,000 · Meet your first investor" 13px semibold muted.
  - Term chips (`flex-wrap gap-[var(--space-3)]`): `rounded-sm border px-[var(--space-4)] py-[6px] text-[13px] font-semibold`, glass-border, not interactive.
- CTA "Start Lesson {lessonNumber}".

### 3.6 Unlock carousel (GGE:645-727) + TermFlipCard (GGE:531-643)
Screen column: gap `clamp(calc(10px*s), calc(3.5*s*1dvh), calc(28px*s))`, py `clamp(calc(8px*s), calc(3*s*1dvh), calc(32px*s))`, `text-center`. No Dreamy here on purpose (repeats 5x, tightest screen).
- `h2` lesson title: `clamp(calc(18px*s), calc(3.2*s*1dvh), calc(26px*s))`, lh 1.25, extrabold, display.
- "Term {i+1} of {n}": 12px bold, 0.14em tracking, uppercase, muted.
- Card slot `relative w-full max-w-[calc(440px*s)]`.
- TermFlipCard face: `flex overflow-hidden rounded-lg border text-left`, bg `--card`, shadow `0 18px 40px -22px rgba(0,0,0,0.35)`, `backfaceVisibility: hidden`, back face `absolute inset-0` + `rotateY(180deg)`.
  - Ring binding: left strip `w-9` (36px), border-r, bg `color-mix(foreground 5%, card)`, 3 punched holes `size-3` (12px) bg `--background`, border, `inset 0 1px 2px rgba(0,0,0,0.25)`, `justify-evenly py-[var(--space-6)]`.
  - Content column: gap `clamp(6px*s, 1.8*s*dvh, 16px*s)`, padding `clamp(14px*s, 3.2*s*dvh, 24px*s)`, centered.
  - Glyph (both faces): icon at `clamp(44px*s, 8.5*s*dvh, 72px*s)` square, `-rotate-2`, color `color-mix(accent 88%, foreground 12%)`, `filter: url(#glossary-sketch)`; 6 radiating dashes (SVG viewBox 120, lines y 4->14 at 30/90/150/210/270/330deg, stroke 2.4, round, accent) inset -20px; term name `clamp(20px*s, 4.4*s*dvh, 28px*s)` lh 1.1 extrabold display, sketch filter; hand-drawn squiggle underline SVG `M2 5 Q 20 1, 40 4 T 78 4 T 118 3`, 100x7px, stroke 2.4, accent, sketch filter.
  - Sketch filter (GGE:626-631): `feTurbulence type=fractalNoise baseFrequency=0.045 numOctaves=2` -> `feDisplacementMap scale=3.2`. Finding: `id="glossary-sketch"` is rendered by every TermFlipCard; during the AnimatePresence cross-over two cards may coexist for a moment, producing a duplicate id (harmless in practice).
  - Front: definition `clamp(14px*s, 2.6*s*dvh, 15px*s)` lh 1.4; "Tap for an example ›" link `dm-link` 12.5px bold accent.
  - Back: "{exampleCompany} Example" 12px bold 0.05em uppercase accent; example text same clamp, lh 1.35 semibold; "‹ Back to the definition" 12.5px bold muted.
- Unlock CTA (motion.button): "Unlock {term}" + the term's icon (h-4 w-4) instead of a chevron.

### 3.7 UnlockComplete (GGE:729-803)
- Fireworks layer (absolute inset-0 z-0) behind a `relative z-10` content group. Stars are OFF on this screen.
- `PlayBurst nonce=1 accent=--glossary-accent`.
- Term badge row `flex-nowrap gap-2 sm:gap-[var(--space-4)]`: circles `size-11 sm:size-14` (44/56px) accent fill, icon `h-5 w-5 sm:h-6 sm:w-6` in `#05070f`; check badge `size-4 sm:size-5` top-right (-4px), accent fill, 2px `--background` border, `Check 9px/11px`.
- Card `max-w-[calc(420px*s)] p-[var(--space-6)] gap-[var(--space-2)]`: `Trophy h-8 w-8` accent; "All {n} terms unlocked!" 19px extrabold display; `lesson.milestone` 13px muted.
- CTA "Start Practice".

### 3.8 Question screen (GGE:1297-1385)
Card: `relative mx-auto w-full max-w-[calc(620px*s)] flex-col gap-[var(--space-8)] rounded-lg border p-[var(--space-6)] sm:p-[var(--space-8)]`, bg `--card`, shadow `0 18px 40px -22px rgba(0,0,0,0.35)`.
- choice / typeTerm: Dreamy `curious` 56px absolutely `-top-8 left-2 z-10` over a `relative pt-[28px]` wrapper, then SpeechBubble with the prompt.
- matchUp / sortBuckets: plain prompt `p`, `clamp(18px*s, 2.6*s*dvh, 21px*s)`, lh 1.35 extrabold display.
- profitBuilder: no prompt, no Dreamy; the scenario box is the header.

OptionList (choice, GGE:817-853): `flex-col gap-[var(--space-4)]` (bumped 12->16px, GGE:818-822). Each option `dm-tap flex w-full items-center gap-[var(--space-4)] rounded-md border p-[var(--space-4)] text-left transition-opacity`, bg `--card`; letter circle `size-7` border 1.5px muted, 13px bold; text 15px / 20px medium.
DocumentOptionList (Catch the Misuse, GGE:861-892): one bordered sheet (`rounded-md border overflow-hidden`, bg `--card`), rows divided by `border-b` (last none), row bg transparent or 6% foreground when picked-and-revealed. (History mentions a file icon, title bars, edit icon; the current code has none of those: the header was dropped on 25 Aug, commit `2ddfde2f`.)
TypeTermCard (GGE:894-958): word-bank chips `dm-tap rounded-md border px-[var(--space-4)] py-[6px] text-[13px] font-semibold` (selected: accent border + `color-mix(accent 16%, card)` bg); input `w-full rounded-md border px-4 py-4 text-[15px] font-semibold`, placeholder "Or type your answer…"; "Check Answer" button `dm-solid w-full rounded-md px-5 py-4 text-[15px] font-semibold`, bg `--foreground`, text `--background`, disabled (opacity 0.4) until non-empty.
MatchUpCard (GGE:960-1118): headers "Term" / "Example" (11px bold 0.1em uppercase muted, 2-col grid); two columns `gap-[var(--space-3)]`; tiles `dm-tap min-h-[60px] rounded-md border px-3 py-2 text-center text-[13px] sm:text-[14px] font-bold`; connector dot `size-[9px] rounded-full border-2` (right edge of left tiles, left edge of right tiles); matched: bg `color-mix(green 16%, card)`, green border/text, `Check 14px`, filled green dot; left selected: accent border; wrong flash: danger border.
SortBucketsCard (GGE:1120-1216): pool chips `dm-tap rounded-md border px-4 py-2 text-[13px] font-semibold` (picked border `--accent` blue); hint "Tap an item, then tap its bucket" (12px semibold muted); when all placed "All placed" with a `Check` icon (13px bold accent); buckets 2-col grid `gap-[var(--space-4)]`, each `dm-tap min-h-[84px] rounded-md border p-3 text-left`, bg glass-surface-1, name 15px extrabold; placed chips `rounded-sm px-3 py-[4px] text-[12px] font-semibold`, pre-check bg `color-mix(amber-400 22%, card)`, post-check green or red tint 20%. "Check My Sorting" button accent fill, `#05070f` text.
ProfitBuilderCard (GGE:1218-1281): scenario box `rounded-md border p-4 text-[14px] font-semibold`, bg `color-mix(accent 12%, card)`; each step row: number circle `size-6 border-[1.5px] text-[12px] font-bold` + label 14px semibold; input group `rounded-md border px-3 py-2` with "$" prefix (muted) and `w-[100px] text-right text-[15px] font-bold` input, `inputMode="numeric"`; "Check My Math" accent button, disabled until all filled.

### 3.9 FeedbackPanel (GGE:1387-1427)
Overlay `fixed inset-0 z-50 flex items-center justify-center px-5`, bg `color-mix(in srgb, var(--background) 72%, transparent)`, `backdrop-filter: blur(28px)` (app-wide 28px modal blur floor). NOT dismissible by backdrop (required checkpoint).
Card `max-w-[440px]` (not shell-scaled, on purpose) `gap-[var(--space-4)] rounded-lg border p-[var(--space-5)]`: correct bg `color-mix(green 14%, card)` + green border; wrong bg `color-mix(#e0483e 10%, card)` + red border.
- Dreamy `party` (correct) / `puzzle` (wrong) 56px.
- Title row 16px extrabold colored: 24px filled circle with `Check` (#05070f) or `X` (--background) + "Correct!" / "Not quite".
- Body `feedbackCorrect`/`feedbackWrong` 14px / 19px.
- Button full-width 15px semibold: correct = green fill + `#05070f`; wrong = `--foreground` fill + `--background`. Label "Next Question" or "See Results" (when `queueIndex+1 >= queue.length`; Finding: says "See Results" even when a review question will be appended next).

### 3.10 StreakModal (GGE:1429-1463)
Same overlay, but tapping the backdrop dismisses (`onClick={onDismiss}`, card stops propagation). Card `max-w-[320px] p-[var(--space-8)] gap-[var(--space-4)] text-center rounded-lg`, bg `linear-gradient(160deg, var(--hero-accent-teal), var(--background))`, entrance `motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]`. PlayBurst; Dreamy `party` 100px; "{n} in a row!" preceded by lucide `Flame h-7 w-7` (filled) 26px extrabold display `--amber-400`; "On fire!" 15px semibold; "Keep Going ›" (`--foreground` fill, `--background` text, py-3).

### 3.11 PowerPlayIntro (GGE:1468-1490)
Screen bg `radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 65%)`, `gap-[var(--space-6)] py-[var(--space-10)]`. Dreamy `idea` 112px; `h2` "Power Play" (preceded by a filled `Zap` icon) 26px / 32px extrabold display with `Zap h-6 w-6` purple filled; "Use everything you just learned to fill in the blanks." 14px / 20px muted, `max-w-[calc(380px*s)]`. CTA (NOT primaryCtaColors): bg `--hero-accent-purple`, text `#fff`, "[Zap] Unlock & Test My Knowledge [ChevronRight]". Finding: in light mode `--hero-accent-purple` is `#cfc6f5`, so white text on it is illegible.

### 3.12 PowerPlay (GGE:1492-1593)
Column `gap-[var(--space-5)]`. `h2` "Power Play" (filled `Zap` icon) 22px / 28px; "Fill in all {n} blanks." 14px muted centered; word-bank chips (non-interactive spans, capitalized); paragraph card `flex flex-wrap items-baseline gap-x-[6px] gap-y-[var(--space-3)] rounded-lg border p-[var(--space-6)] text-[17px] leading-[32px]`, bg `--card`, with PlayBurst inside. Blanks: `w-[110px] border-b-2 bg-transparent text-center font-bold`, underline `--hero-accent-purple` until checked, text always `--foreground` until verdict (purple text was unreadable, 25 Aug). Success banner "Power Play Complete!" with a `Trophy` icon (green tint 14%, green border, 16px extrabold). Button: "Check Answers" + filled `Zap` (purple, white) -> after all correct "Finish Lesson ›" (green, `#05070f`); disabled until all filled. Footer "Spelling must match exactly · not case-sensitive" 11px muted.
Finding: the paragraph is split into separate `<span>`s per text chunk inside a `flex-wrap` container, so each text run is a flex item: long runs wrap as blocks, not as flowing prose. UNCLEAR whether that is intended.

### 3.13 MasteryLoading (GGE:1595-1609)
Dreamy `idea` 112px; "Checking Your Mastery" 19px extrabold display; fact card (if any) `mt-4 max-w-[calc(420px*s)] rounded-md border p-4 text-[13px] leading-[18px] italic`. No spinner. Auto-advance 1800ms.

### 3.14 Complete (GGE:1611-1711)
Fireworks + no stars (as UnlockComplete). PlayBurst; Dreamy `party` 120px; "Lesson Complete!" 28px / 34px extrabold display. Score card `max-w-[calc(380px*s)] p-6 gap-[2px]`, bg `color-mix(accent 14%, card)`, border accent: "Dream Score" with `Sparkles h-4 w-4`, 15px bold accent) + total 36px extrabold display (`toLocaleString()`). Stats list `max-w-[calc(380px*s)] gap-3`: "XP Earned" (14px muted) / "+{xpReward} XP" (18px extrabold accent), divider, "Mastery Progress" / "{pct}%" (18px extrabold). CTA "Continue".

### 3.15 Responsive rules summary
- Mobile first; the only width breakpoints used in-game: `sm:` (640px) for question card padding 24->32, match tile text 13->14, UnlockComplete badge sizes; `md:` (768px) for side padding 20->32 (`px-5 md:px-8`).
- Everything else scales continuously via `--glossary-shell-scale` (width + height) and `clamp(min, N*scale*1dvh, max)` (height). No `@media` steps (GGE:2012).
- CTAs cap at 560px; FeedbackPanel 440px and StreakModal 320px are fixed (not scaled).
- Target: no page scroll at any size, including iPhone 15 Safari usable height and 375x560 (AI_HANDOFF.md:7312-7314).

---

## 4. Interaction model and affordances

### 4.1 Inputs
- Tap/click only. No swipe (the "carousel" is button-driven), no drag (Sort the Buckets is tap item, tap bucket; Match It Up is tap left, tap right).
- Keyboard: no custom shortcuts, no `onKeyDown`, no Enter-to-submit (inputs are not in a `<form>`), no autofocus. Native `<button>`s work with Tab/Enter/Space. Focus ring from `dm-*` classes: `outline: 2px solid var(--accent-subtle); outline-offset: 2px` (app.css:277-283). UNCLEAR: whether the Power Play / type inputs should submit on Enter (not implemented).
- Hover affordances (hover-capable pointers only): `dm-tap` lift 1px + `0 6px 16px -12px rgb(0 0 0/.85)` + accent-subtle border; `dm-solid` brightness 1.05 + lift 1px; `dm-quiet` glass-surface-2 wash + 1px inset ring; `dm-link` color accent-subtle, never underlined (app.css:183-275). All disabled under reduced motion (app.css:349-353).
- Haptics: none (no `navigator.vibrate`).

### 4.2 Unlock carousel
- One tap per term ("Unlock {term}"), 5 taps total for 5 terms (was 10 before 21 Sept; Joshua's spec).
- Optional flip: "Tap for an example" -> back; "Back to the definition" -> front. Unlock works from either face. Each new term opens on the front (fresh state via `key={term.id}`).
- No back navigation between terms except the DEMO step-back.
- Unlock feedback: `playCorrect()` + `dispatchPlayPulse("correct")` + press-scale 0.97 (GGE:710-719).

### 4.3 Per question type: feedback, correction, retry
| Type | Submit | Visual feedback | Right answer revealed? | Sound | Backdrop pulse | Retry |
|---|---|---|---|---|---|---|
| choice (OptionList) | single tap, locks all options | correct option: green border + `Check`; picked wrong: red border + `X`; others opacity 0.45 | yes (green) | correct / wrong | correct / wrong | none |
| choice (Catch the Misuse) | single tap | text/letter circle color green/red, picked row 6% tint, others 0.45 | yes | same | same | none |
| typeTerm | "Check Answer" | input border + text green or red (disabled but pinned full contrast via `WebkitTextFillColor`) | no, only via `feedbackWrong` text | **none** (no playCorrect/playWrong call in TypeTermCard) | **none** | none |
| matchUp | each right tap | correct: pair turns green, line flashes; wrong: left tile red border 400ms, selection cleared | n/a | correct per pair / wrong per miss | correct per pair only | unlimited within the question; question always ends correct |
| sortBuckets | "Check My Sorting" (after all placed) | each chip green or red in its bucket | no (red chip stays in the wrong bucket) | correct / wrong | correct / wrong | none; items cannot be moved back once placed (Finding: no un-place control) |
| profitBuilder | "Check My Math" | each step's badge/input green or red | no, only via `feedbackWrong` | correct / wrong | correct / wrong | none |
| Power Play | "Check Answers" | each blank green/red live after first check | no | sweep (all correct) / wrong | celebrate on success only | unlimited, must get all right to finish |

Finding: Type the Term is the only question kind with no sound and no backdrop pulse on answer (inconsistent with every other kind).
After every question (except Match It Up misses), the FeedbackPanel shows "Correct!"/"Not quite" + authored explanation + Dreamy party/puzzle; the only way forward is its button.
A wrong answer never repeats the same question; remediation is a DIFFERENT review question for the same term (section 2.5).

### 4.4 Mute / music toggles
See section 6. Both in the top bar, tooltipped (icon-only tooltip rule), `aria-pressed`.

---

## 5. Text animation

- There is NO typewriter, character reveal, word-by-word reveal, or tap-to-complete in the Glossary Game. All copy renders instantly. (The typewriter + `playVoiceBlip` idiom lives in `SimulationPlayer.tsx` / `sound.ts:144-157` for career simulations only; the glossary never imports `playVoiceBlip`.)
- CRT (v2) only: a blinking block cursor `"\2588"` after the SpeechBubble text via `.marketing-v2.play-crt .crt-cursor-after::after` (globals.css:1177-1183): `margin-left: 4px; color: var(--glossary-accent); animation: crt-cursor-blink 1s steps(1) infinite` (keyframe 0-49% opacity 1, 50-100% 0).
- Direct rule (GGE:217-219, 21 Sept 2026): "Do not glitch the questions and answers... slowly glitch the HUD elements not text", then "Do not glitch the text on the HUD, glitch the graphical elements only" (GGE:2159-2163). Text is never animated/glitched.
- Text transitions that exist: the whole term card slides between terms (section 7); the flip card rotates.

---

## 6. Sound and music

### 6.1 Architecture
- The game imports `playCorrect/playSelect/playSweep/playWrong`, mute and music functions from `glossaryThemeSound.ts` only (GGE:23-44), never from `sound.ts` directly. The wrapper decides per background version: v1 delegates to `sound.ts` byte-for-byte; v2/v3/v4 synthesize their own (glossaryThemeSound.ts:1-13).
- All sound is synthesized WebAudio (oscillators). No audio files. `music.ts`'s MP3s (`/audio/play/ib-main-song.mp3` etc.) belong to the simulation, not the glossary.
- Two AudioContexts: `sound.ts` has its own (v1 SFX); `glossaryThemeSound.ts` has one shared context for v2-v4 SFX and all music (glossaryThemeSound.ts:88-124). Contexts are created lazily and `resume()`d on every use when suspended.
- No iOS silent-switch priming: `primeAudioOnFirstGesture` is used by Build and Match only (not the glossary). UNCLEAR: whether glossary audio is silent on iOS with the ringer switch off (likely, per that helper's own reason for existing).

### 6.2 Two independent toggles (and the past bug)
| Toggle | Key | Gates | Setter side effects |
|---|---|---|---|
| Sound (`MuteToggle`) | `dreamari-play-muted` (shared with career sims) | SFX only: `sound.ts` `audio()` and glossary `audio()` both check `isMuted()` | notifies listeners; unmute plays `playSelect()` |
| Music (`MusicToggle`) | `dreamari-glossary-music-muted` | background loop only: `musicAudio()` checks `musicMuted()`; loop tick also re-checks every step | `setMusicMuted(true)` stops the loop; `false` calls `startThemeMusic(currentTheme)` |

Past bug (fixed 25 Sept 2026, commit `19436be5`, AI_HANDOFF.md:140-148; comment glossaryThemeSound.ts:95-103): the loop's per-note context getter was the same function as the SFX getter, so music was gated by the SOUND toggle ("the music for glossary games is tied to the sounds button instead of the music button"). Also a v2 CRT tape-hiss noise bed kept humming under a Sound mute ("an annoying beeping sound playing constantly"); it was removed entirely per "take the static sound out completely". Fix: split `audio()` (SFX) vs `musicAudio()` (music) over one `sharedContext()`, plus a self-healing per-tick `musicMuted()` check (glossaryThemeSound.ts:319-329). Verified live by instrumenting `createOscillator`: music kept firing with Sound muted; zero oscillators within 4s of muting Music; zero `AudioBufferSource` ever.

Both toggles use the `useSyncExternalStore` triad (subscribe / snapshot / server snapshot `false`) and listen to `storage` events for cross-tab sync.

### 6.3 Synthesis primitives (identical in both files)
- `tone(ctx, freq, start, duration, peak, shape)`: oscillator at fixed `freq`; gain `0.0001` at start -> exponential ramp to `peak` at `start + 0.012` (12 ms attack) -> exponential ramp to `0.0001` at `start + duration`; `osc.stop(start + duration + 0.02)`. Connected straight to `destination` (no master gain, no filter).
- `sweepTone` / `sweep(ctx, from, to, start, duration, peak, shape)`: frequency exponential ramp from `from` to `to` over `duration`; gain attack to `peak` at `start + duration*0.3`, decay to `0.0001` at `start + duration`.

### 6.4 SFX per version
v1 (sound.ts, the shipped default):
| Call | Notes (Hz, start offset s, duration s, peak, wave) |
|---|---|
| `playSelect` | 660, 0, 0.06, 0.05, triangle |
| `playCorrect` | 587.33, 0, 0.12, 0.12, sine + 880, +0.07, 0.18, 0.13, sine |
| `playWrong` | 196, 0, 0.14, 0.10, triangle + 155, +0.10, 0.20, 0.09, triangle ("never harsh", sound.ts:104-105) |
| `playSweep` | 523.25, 659.25, 783.99, 1046.5 at i*0.075 s, each 0.24 s, peak 0.12, sine |

v2 CRT: select 1046.5/0.035/0.05 square; correct 987.77 (0.07, 0.11) + 1318.5 at +0.06 (0.12, 0.11) square ("8-bit coin"); wrong 147 (0.16, 0.09) + 110 at +0.10 (0.18, 0.08) square; sweep 523.25, 659.25, 783.99, 1046.5, 1318.5 at i*0.06, 0.14 s, 0.10, square.
v3 Dots: select 740/0.09/0.035 sine; correct 523.25 (0.35, 0.09) + 783.99 at +0.05 (0.40, 0.07) sine; wrong 220 (0.30, 0.06) + 174.61 at +0.08 (0.30, 0.05) sine; sweep 261.63, 329.63, 392, 523.25 at i*0.14, 0.55 s, 0.06, sine.
v4 Synth: select 220/0.05/0.05 sawtooth; correct sweep 220->440 (0.18, 0.12) + 440 at +0.14 (0.14, 0.10) sawtooth; wrong sweep 220->110 (0.22, 0.11) sawtooth; sweep 130.81, 196, 261.63, 329.63, 392 at i*0.08, 0.22 s, 0.10, sawtooth.
(glossaryThemeSound.ts:160-218.)

Where each SFX fires:
- `playSelect`: Sort item placed in a bucket (GGE:1130); unmuting Sound (GGE:246).
- `playCorrect`: Unlock tap (GGE:714); correct choice (1372); each correct Match pair (983); Sort all-correct (1139); Profit all-correct (1226); StreakModal mount (1434).
- `playWrong`: wrong choice (1373); Match miss (1012); Sort wrong (1140); Profit wrong (1227); Power Play wrong check (1508).
- `playSweep`: UnlockComplete mount (735); Power Play all-correct (1504); Complete mount (1635).
- Not wired: `playFlip` (the flip-card page flick exists in sound.ts:134-142 but the current TermFlipCard doesn't call it; it was removed with SketchFace on 21 Sept and never re-added); `playTick`, `playVoiceBlip`, scene sounds (simulation only).

### 6.5 Background music (one loop per background VERSION, not per career/world)
`PATTERNS` (glossaryThemeSound.ts:246-308), played by `startThemeMusic` as a plain `setInterval(stepMs)`; each tick plays `notes[step % len]` with `tone(noteLen, gain, shape)` if `freq > 0` (0 = rest):
| Version | Wave | stepMs | gain | noteLen s | steps | rests | loop length | Form (per comments) |
|---|---|---|---|---|---|---|---|---|
| v1 | triangle | 260 | 0.020 | 0.40 | 45 | 8 | 11.70 s | C major "twinkle": pickup, Theme A, A' around G, Bridge in A minor, octave-down echo, reprise, long rest |
| v2 | square | 230 | 0.024 | 0.15 | 38 | 9 | 8.74 s | NES title: fanfare pickup, Theme A, syncopated Theme B over G, "hurry-up" variation, A with octave-leap finish |
| v3 | sine | 480 | 0.022 | 1.20 | 48 | 28 | 23.04 s | Ambient pentatonic: C pentatonic rise-fall, A minor pentatonic, sparse high coda |
| v4 | sawtooth | 210 | 0.020 | 0.17 | 64 | 6 | 13.44 s | Outrun Am-F-G-Am arpeggio low (verse) then an octave up (chorus lift) |
Exact note lists are at glossaryThemeSound.ts:252-305 (copy them verbatim).
Finding: the 22 Sept comment says the rewrite makes "the loop point ... minutes apart instead of seconds" (glossaryThemeSound.ts:243-244); actual loops are 8.7-23 s.
Lifecycle: `setGlossaryPlayTheme(bgVersion)` on mount and on version change; cleanup `stopThemeMusic()` on unmount/version change (GGE:1808-1811). `setGlossaryPlayTheme` returns early when `started && currentTheme === theme` (module-level flags, glossaryThemeSound.ts:21-36).
Finding (code reading, not verified live): because `started`/`currentTheme` are module-level and survive client-side navigation, leaving the game (unmount stops music) and re-entering it via in-app navigation calls `setGlossaryPlayTheme("v1")` which early-returns, so v1 music does not restart until a reload, a version switch, or a Music off/on. The same early return would also swallow the second mount under React StrictMode's dev double-effect (mount, cleanup, mount), so in `next dev` v1 music may never start on first load. UNCLEAR: StrictMode is Next's App Router default; `next.config.ts` doesn't override it.
UNCLEAR: before the first user gesture the context is suspended and `currentTime` is frozen, so every tick's note is scheduled at the same frozen time; on resume they may sound together briefly. Not verified.

---

## 7. Every animation, with values

| Where | What | Values | Reduced motion |
|---|---|---|---|
| TermFlipCard (GGE:632-637) | 3D flip | framer `rotateY 0 <-> 180`, `duration 0.5`, `ease [0.4, 0, 0.2, 1]`; wrapper `perspective: 1200`; `transformStyle: preserve-3d`; faces `backfaceVisibility: hidden` | duration 0 (instant) |
| UnlockScreen term change (GGE:695-705) | page slide | `AnimatePresence mode="wait" initial={false}`; enter `{opacity 0, x 24}` -> `{opacity 1, x 0}`; exit `{opacity 0, x -24}`; `duration 0.26`, ease `[0.4,0,0.2,1]` | opacity only, 0.12 s |
| Unlock button (GGE:718-719) | press | `whileTap scale 0.97`, `duration 0.12` | none |
| MatchUp line (GGE:966-1005, 1030-1043) | confirm line between the pair's dots | SVG line, `stroke CORRECT_COLOR`, width 2; visible at 0, `fading` at 350 ms (CSS `transition-opacity duration-300` to 0), removed at 750 ms | no special handling |
| MatchUp wrong (GGE:1013-1015) | red border flash | 400 ms | n/a |
| OptionList dim | `transition-opacity` (Tailwind default 150 ms) to 0.45 | | |
| StreakModal (GGE:1440) | pop in | `dreamy-pop 0.45s cubic-bezier(0.34,1.56,0.64,1)`: 0% scale 0.72 opacity 0.4; 60% scale 1.08 opacity 1; 100% scale 1 (globals.css:540-544) | `motion-safe:` so none |
| PlayBurst (PlayBurst.tsx) | confetti burst | 22 particles (default); shapes cycle dot/diamond/4-point spark; `angle = (i/count)*2π + (i%3)*0.35`; distance `54 + ((i*37) % 46)` px; size `4 + ((i*13) % 6)` px (spark drawn at 1.8x); colors cycle `[accent, #ffd166, #ffffff, accent]`; end offset `(cos*d, sin*d - 10)`; rotation `260deg` even / `-220deg` odd; delay `(i%6)*0.028 s`; duration `0.65 + (i%4)*0.09 s`; easing `cubic-bezier(0.16,1,0.3,1)`, fill forwards; origin `top-1/3 left-1/2`. Keyframe `play-burst`: 0% opacity 0 scale 0.3; 15% opacity 1, 25%/20% of the offset, scale 1.25, 20% rotation; 100% opacity 0, full offset, scale 0.4, full rotation (globals.css:1062-1066). Flash: 40px circle radial `color-mix(accent 70%, white)`, `play-burst-flash 0.5s ease-out forwards` 0.9 opacity scale 0.4 -> 0 opacity scale 2.2. Re-keyed by `nonce` (0 renders nothing). | `motion-safe:` only (see 8.4 Finding) |
| PlayBurst usage | UnlockComplete (nonce 1), StreakModal (1), Power Play success (increments), Complete (1) | | |
| Backdrop bloom (PlayBackdrop.tsx:79-95, all versions) | full-screen radial flash on `play:pulse` | 140vmax circle, `radial-gradient(closest-side, color-mix(color 55%, transparent), transparent 68%)`; color accent, or `var(--destructive)` for wrong; `--bloom-peak` 0.5 correct / 0.32 wrong / 0.7 celebrate; `backdrop-bloom 900ms ease-out forwards`: 0% opacity 0 scale 0.7; 30% opacity peak scale 1; 100% opacity 0 scale 1.35 (globals.css:1052-1056). `forwards` is load-bearing (stuck blob bug). | `motion-safe:` only (see 8.4) |
| Pulse dispatch sites | `dispatchPlayPulse` kinds | correct: Unlock, correct choice, Match pair, Sort, Profit; wrong: choice, Sort, Profit; celebrate: UnlockComplete, StreakModal, Power Play success. Complete screen does NOT pulse. | |
| SparkBar (flow/SparkBar.tsx) | HUD bar + LessonIntro meter | width transition 700 ms `cubic-bezier(0.33,1,0.68,1)`; on growth a `ProgressSpark` particle comet sweeps the new span and the fill flickers (WAAPI, 700 ms ease-out, brightness up to 1.25 / saturate 1.4, glow `0 0 24px 4px`); idle flicker every 10-18 s when the user has been idle >= 10 s (shared cooldown) | transition none; flicker/idle skipped |
| Stars (v1, ui/stars.tsx + PlayBackdrop) | 3 box-shadow star layers drifting up | 1000 stars @1px, 400 @2px, 200 @3px; `y: 0 -> -2000px` linear infinite over `speed`, `speed*2`, `speed*3` with `speed = 140` (140/280/420 s); white stars; seeded PRNG positions. Pointer parallax (factor 0.05, spring stiffness 50 damping 20) is effectively INERT because PlayBackdrop's root is `pointer-events-none` (Finding) | framer default: animates anyway (no `MotionConfig reducedMotion`) |
| Fireworks (ui/fireworks.tsx) on UnlockComplete + Complete | canvas | `population 0.7` -> launch every `rand(300,800)/0.7` ms (~429-1143 ms); rockets from bottom, x in 10-90% width, burst at 10-40% height; `fireworkSpeed 3-6`, `fireworkSize 2-5` (default), trail 10-25 points, gravity 0.02; 50-150 particles per burst, `particleSpeed 1.5-5`, `particleSize 1-5` (default), gravity 0.05, friction 0.98, alpha decay 0.005-0.02/frame; colors `[resolved accent, #ff5f7e, #ff3d9a, #ffd93d, #ffffff]`. Canvas width = `window.innerWidth`. Click-to-launch is inert (wrapper `pointer-events-none`). | no handling (Finding) |
| v2 CRT backdrop | scanlines `crt-scanline-roll 0.4s linear infinite` (bg-position-y 0 -> 4px) over an 8px band `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 51%)`; SVG noise (`feTurbulence fractalNoise 0.85, 2 octaves`, desaturated, `mix-blend-screen`) `crt-noise-flicker 6s ease-in-out infinite` opacity 0.2 <-> 0.4; vignette `radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)`; base `#050308` + magenta `rgba(255,0,170,.22)` at 18% 12% + cyan `rgba(0,231,255,.18)` at 85% 88% | `motion-safe:` |
| v2 CRT HUD glitch | mastery dots + progress bar box-shadow | `crt-rgb-glow 3.5s ease-in-out infinite alternate` cycling magenta 2px ring + cyan glow (globals.css:1103-1108) | none (inline `animation`) |
| v3 Dots | Vanta.DOTS (three.js r134 + vanta@latest from CDN) | `backgroundColor 0x0b0b0c`, `color = color2 = resolved accent`, `size 3`, `spacing 35`, `showLines: false`, mouse/touch controls on, `minHeight/minWidth 200`, `scale 1` | none |
| v4 Synth | grid floor | `perspective 340px`, origin 50% 0%, floor `rotateX(78deg)`, 60px gold grid `oklch(0.78 0.18 75 / 0.4)` 1px lines on `#0d0a14`, `synth-grid-scroll 4s linear infinite` (bg-position 0 -> 60px); sky `linear-gradient(180deg, oklch(0.1 0.05 292) 0%, oklch(0.72 0.18 75) 100%)`; 5 static star dots in top 45% | `motion-safe:` |
| dm-* | hover/press | 140-160 ms transitions (app.css) | disabled |

v1 backdrop colors (PlayBackdrop.tsx:51-55), "berry": `radial-gradient(115% 95% at 15% -10%, rgba(219,39,119,0.55) 0%, transparent 68%), radial-gradient(105% 90% at 100% 105%, rgba(157,23,77,0.5) 0%, transparent 65%), linear-gradient(160deg, #2a0a1f 0%, #170a14 45%, #3a0f2c 100%)`. Fixed (NOT accent-derived) on purpose. Stars hidden on UnlockComplete and Complete (`showStars` false, GGE:2097).

Not animated: Dreamy (the float/bob keyframes were removed 25 Aug to save vertical space); screen-to-screen transitions (screens swap instantly, no AnimatePresence on `screen`); the Complete score (no count-up).

---

## 8. Error and edge states

### 8.1 Content / routing
- Unknown career slug: `notFound()` -> Next's default 404 (no custom `not-found.tsx`). Entry points never link to non-content careers (`hasGlossary` gate; hub shows locked "Coming soon" card, Career Detail hides the button).
- Career with zero lessons: `notFound()`.
- Zero terms: Unlock skips straight to UnlockComplete ("All 0 terms unlocked!"); mastery % guarded to 0 (GGE:1624-1629, 22 Sept).
- Zero questions: UnlockComplete's Start Practice jumps to Power Play instead of a stuck blank question screen (GGE:2198-2207, 22 Sept).
- Zero facts: MasteryLoading shows no fact card (`?? null`, GGE:2241).
- Too few terms/options for distractors: not applicable (options authored). A choice question with 1 option would work trivially. Power Play with 0 answers: `allFilled` is vacuously true and `every` is true, so "Check Answers" immediately succeeds (edge; UNCLEAR if anyone would author that).
- Malformed references (bad `termId`): credit silently lost; mastery can't reach 2; no error.
- Duplicate strings in options/pairs/items/answers: React key collisions and wrong match lookups (section 1.5 D).
- `WORLD_COLORS` miss: accent falls back to amber.
- Icon slug miss: `Sparkles`.
- Dreamy image fails to load: `DreamyFace` swaps to a circle `color-mix(brand-500 18%, card)` with a muted `Sparkles` at 50% size (GGE:158-191, 22 Sept). Re-keyed per pose.

### 8.2 Storage failures
- `progress.ts`: read failures return `{}`; write failures are swallowed ("Private browsing or a full quota: the round still works, it just won't persist", progress.ts:88); listeners still fire.
- Mute keys: reads default to not-muted; writes swallowed ("the toggle still works for this session") -- note it actually does NOT: the snapshot re-reads localStorage, so if the write throws the toggle visually snaps back. UNCLEAR/Finding by reading sound.ts:36-43 and glossaryThemeSound.ts:53-62.
- `awardDreamScore`: any exception returns `{ total: 0, awarded: false }`.
- Server render: all snapshots return defaults (`{}`, not muted, 0 XP) and correct on hydration.

### 8.3 Audio
- No AudioContext support: every play function no-ops (context getter returns null).
- Autoplay blocked: contexts are `resume()`d on every use; no gesture-retry logic (unlike `music.ts`'s `armGestureRetry`). The first Next tap on Intro is the first gesture.
- Music loop self-heals if muted from another tab (per-tick check).
- Leaving mid-lesson stops the loop (unmount cleanup).

### 8.4 Reduced motion
- Honored: flip (instant), term slide (opacity 0.12 s), StreakModal pop, PlayBurst and bloom keyframes (`motion-safe:`), v2/v4 backdrop keyframes, SparkBar, `dm-*`.
- Not honored: Stars drift (framer default), Fireworks canvas, Vanta dots, CRT glitch glow, MatchUp line.
- Finding (by reading, not verified live): PlayBurst particles and the backdrop bloom span are only hidden by their keyframes. Under `prefers-reduced-motion: reduce` the `motion-safe:` animation class does not apply, so the particles would sit visible (opacity 1) in a pile at the burst origin, and the 140vmax bloom circle would sit at full opacity permanently after the first pulse, which is the "stuck blob" bug in reduced-motion form. Production should render nothing (or a static fade) for these when reduced motion is on.

### 8.5 Accessibility
- Present: native buttons everywhere; `aria-label` on Back and icon-only toggles; `aria-pressed` on toggles; IconTip tooltips on hover and keyboard focus; `aria-hidden` on decorative icons/Dreamy (`alt=""`) and backdrops; focus-visible outlines; disabled inputs pinned to full contrast; `PlayVersionChip` is `role="tablist"` with `aria-selected`.
- Missing: no `aria-live` for "Correct!/Not quite" (FeedbackPanel/StreakModal are not `role="dialog"`, no focus move/trap, no Escape handling); no labels on text inputs (placeholder only on Type the Term; none on Profit Builder and Power Play blanks); Match It Up and Sort the Buckets convey state by color + check icon only (wrong-placed chips are red with no icon); mastery dots use `title` only; HUD percent not announced; the answer letter circles are the only non-color cue in OptionList (plus Check/X icons after reveal).
- Contrast risks: light-mode CTA (accent fill, dark text) ~3.2:1 for finance; Power Play white-on-`#cfc6f5` in light mode; muted-foreground 62% white on berry.

### 8.6 Layout
- Horizontal overflow guarded by `100vw/640px`; vertical by the 650px height guard. Measured: no page scroll at 375x560 up to 2000x1100.
- Long terms/definitions: the 650px guard assumes FIN-L01 content; longer content can reintroduce vertical overflow on short phones.
- Very long `term` in the Unlock CTA ("Unlock {term}") has no truncation.

### 8.7 React/runtime nuances
- Complete gate writes progress and awards XP inside a `useState` lazy initializer (GGE:2260-2267). Under StrictMode dev, initializers run twice: `saveLessonComplete` (no dedupe) would add 2x XP to the glossary store in dev; `awardDreamScore` dedupes. Writing and dispatching events during render may also log React's "cannot update a component while rendering a different component" warning. UNCLEAR: not verified live.
- MasteryLoadingScreenGate's `onDone` is a fresh arrow each parent render; any parent re-render within the 1.8 s (e.g. a resize changing `dockSpace`) restarts the timer.
- `showStreak` and `pendingResult` open at the same time on a 5th-in-a-row answer; the streak modal stacks on top of the feedback panel.

---

## 9. Design-decision comments, verbatim essence with file:line (grouped)

Quotes are the user's/stakeholders' own words as recorded in the comments.

### 9.1 Origin, content, schema
- data.ts:1-11: content "authored from DreamAri_Glossary_Content_Template_v1.xlsx... (Usman imports it)"; only Finance Lesson 1 ("Dream Sneakers") is real, "transcribed verbatim... rather than paraphrased, since the wording is already tuned to eighth-grade level and ties every example back to the one company"; other careers "intentionally absent, not stubbed"; `hasGlossary()` separates "no game yet" from "game with no content."
- data.ts:25-26: `termId` undefined only for Match It Up / Sort the Buckets, which credit per pair/item.
- data.ts:93-98: `questions` "Played in order, first"; `reviewQuestions` "Held back as remediation... README: 'if the student gets one wrong the review round needs a different question to ask'".
- data.ts:110-114: icon is a semantic slug from the xlsx's plain-word Icon column, resolved in the UI; "Content authors pick the slug; the app owns what it looks like."
- page.tsx:13-18: only authored careers resolve, everything else 404s; entry points already gate on `hasGlossary()`; "a `?lesson=` param could pick among more once a career has them."
- progress.ts:1-6: same shape as play/progress.ts via `useSyncExternalStore` ("the repo lints the useState-in-an-effect version as an error"); "Deliberately lighter than the simulation's beat-by-beat resume: a glossary lesson is ~4 minutes and restartable."
- progress.ts:101-102: `saveLessonComplete` "Called once, when a lesson's Lesson Complete screen resolves."
- GGE:51-66: built from the Replit reference + xlsx schema, "reskinned into Dreamari's own tokens rather than the reference's teal/violet palette"; accent per career world; Power Play uses `--hero-accent-purple`; revert quote: "Keep the yellow for CTAs. The career world accents can stay, its the background that we need to work on."
- GGE:68-73: Dreamy reuses the flat pose-swap sprites (Build's DreamyGuide), not SimulationPlayer's SceneCharacter system ("pure overhead for a floating cloud").
- games.ts:107-118 / 121-125 / 129-130: "{Subject} Terms" naming ("Finance Glossary Game and everything Terms is not good, make it consistent", 9 Sept); Coming-soon dummy cards "they dont have to work or lead anywhere" (9 Sept); Private Equity removed from the row (9 Sept).

### 9.2 Color, CTA, theme
- GGE:89-102: `primaryCtaColors`: accent fill reads muddy in light mode (token calibrated for text contrast); earlier light-mode swap to ink; 26 Sept 2026: accent in both themes because "the light theme's ink button read as a black slab on a dark scene."
- GGE:330-332: `data-night-scene` on the top bar, "the game's ground is always the dark starfield" (Back, streak and XP had turned dark grey).
- GGE:808-813: `CORRECT_COLOR = var(--world-food-farming-nature)`: amber is the "active/selected" accent, so correct needed its own color; wrong stays `--danger`.
- GGE:1929-1932: every color reads `--glossary-accent`, set once on the root.
- GGE:194-208: SpeechBubble solid local `--speech-bubble-bg/-fg` with always-dark fallbacks: 21 Sept "needs more solid surface, it gets lost in the background now"; "lose the white background it doesnt work for the darkmode UI"; Play is its own immersive world, not a themed page.
- GGE:1549-1553: Power Play input text stays foreground ("direct report of not being able to read their own input"); purple only on the underline.
- GGE:936-940: pin `color` + `WebkitTextFillColor` on disabled inputs (Safari dims them).

### 9.3 Layout, sizing, centering
- GGE:409-423: CTA growth cap 560px, 22 Sept 2026: "THE CTA Buttons dont need to stretch past a respectable amount, just the MODALS and their internal elements... need to scale proportionately... not just extending to the side."
- GGE:440-445 and 1340-1346: Dreamy overlaps from above with no side padding (side padding shifted the bubble off-center on mobile); explicit 28px because `--space-7` doesn't exist.
- GGE:452-455: DreamyIntro CTA wrapper carries the 560px cap.
- GGE:488-491: meter floored at 4% ("reads as 'no progress possible here'").
- GGE:659-668: no Dreamy on Unlock (repeats 5x, tightest screen); every size is `clamp(min, Ndvh, max)`; "guarantees no scroll even on an old, small phone"; iPhone 15 Safari lands inside the range.
- GGE:673-676: icon-node progress row removed ("saying the same thing twice"); a quiet count instead.
- GGE:818-822: option gap 12 -> 16px, 21 Sept: "dont have any padding and clash with eachothers borders".
- GGE:1307-1337: question card history: 11 Sept "no enclosing card" (boxes inside boxes) superseded 21 Sept: "centre the content always including the questions and answers... make sure they are in containers with surface tokens"; "lets scale up the question+answer content... responsive on all devices and screen sizes proportionately" (560 -> 620px, clamp text); `--space-7` undefined zeroed padding ("the card containing the question+ the answers has no padding...").
- GGE:1387-1394: FeedbackPanel is a fixed modal (inline feedback pushed Continue below the fold); not backdrop-dismissible because it is the required checkpoint.
- GGE:1713-1744 and 1760-1785: `useMeasuredSpace`; DemoControlsDock is fixed so `<main>` centered too low; 22 Sept: "the actual game content and questions and answers seem like theys it too low... The flipcard/card/surface should be central"; measured 37px low bias at 2000x1100; dock 36 vs 44.5px, top bar 60 vs 75px, so measured not hardcoded.
- GGE:321-326: top bar measured 60px at 1440 wide vs 75px at 1920/2000.
- GGE:1940-2056: the full `--glossary-shell-scale` derivation (anchor 1440x900 "keep the macbook air screen (ours as a benchmark) and scale up from there proportionately"; ratio version rejected "theres so much space that the modals can use"; additive 750px per axis; `min()`-coupled version rejected (froze 1440x1600 at 1.0); width guard 100vw/640px; floor 1 = mobile byte-identical; cap 2.2 -> 2.6; max -> sum "can scale vertically a bit more too... so much space left blank"; height guard 650px from measured UnlockScreen height).
- GGE:2059-2071: `--demo-dock-space` and `--top-bar-space` purposes.
- GGE:2180-2188: every screen centers both axes, 21 Sept: "the question block is still not centred in the screen... centred vertically and horizontally" (supersedes pinning question screens high).
- GGE:2117-2123: HUD size history: "make the progress bar info smaller / less dominant" superseded 21 Sept by "the HUD text size can be bigger, match it to the career simulation HUD sizes" (13px / 11px).
- GGE:2144-2146: mastery as filled skill dots, Duolingo's visualization.

### 9.4 Interaction
- GGE:522-530 and 681-693: TermFlipCard: example optional behind a real flip, 21 Sept, "matching Instagram's own carousel logic"; walkthrough quote: "you shouldn't be mandated to go through both cards... you should have the option to click example... I have the liberty to swipe through if I find it intriguing, but I'm not forced to"; "still have the tap to flip functionality".
- GGE:587-588: "Optional, small, never required -- pressing Unlock below works identically".
- GGE:545-553: hand-drawn illustrations restored, 21 Sept: "why have we lost the hand-drawn illustrations on the cards? Please bring that back".
- GGE:623-625: one shared sketch filter per card.
- GGE:711-713: Unlock uses the correct chime (it had the same soft tick as any tap).
- GGE:908-911: word-bank chips are real buttons (they looked tappable, so they must be), a typing shortcut.
- GGE:966-973: Match It Up line is a brief flash, not permanent ("awkward" crossing lines); right side shuffled on purpose.
- GGE:855-860: Catch the Misuse as a document sheet ("spot the wrong sentence"), no interaction change.
- GGE:1283-1285: deterministic shuffle for SSR/CSR sync.
- GGE:1822-1825: progress is 1-indexed ("a progress bar should never open at zero").
- GGE:1913-1915: remediation rule from the content template.
- GGE:277-282, 1834-1835, 1848-1851: DEMO-ONLY reload/step-back, 21 Sept: "add a reload button as demo (clearly marked for usman so ican reload the game from start, and also a back button at each step so i can go back 1 step whenever i want)"; step-back rewinds position, not answers.
- GGE:337-343 and 353-359: demo chip/controls moved to a bottom dock, 22 Sept: "it gets confused with actual UI".

### 9.5 Celebration, background, motion
- GGE:731-737: UnlockComplete gets the sweep + burst (was silent and static).
- GGE:738-742: 21 Sept: "use this [Fireworks Background] on success screens, color match to UI"; resolved rgb via `useResolvedColor`; paired with warm white.
- GGE:746-755 / 1642-1651: dedicated positioning wrapper (className merge collapsed FireworksBackground to 0 height).
- GGE:765-770 / 1661-1664: content in its own `relative z-10` ("make sure the fireworks happen behind the content UI").
- GGE:1430-1432: StreakModal gets correct chime + burst.
- GGE:1631-1633: Complete gets `playSweep` (had no sound).
- GGE:1637-1638: Complete is the other fireworks success screen.
- GGE:2087-2095: stars off on the two celebration screens, 21 Sept: "do not combine the fireworks with the star background use only the fireworks"; `"unlockComplete"` Screen literal is never assigned.
- GGE:2072-2081: Play's own background, not AppBackdrop, "when playing a game it should feel like we are entering a new world".
- GGE:2136-2140: SparkBar sparks on every advance; wrapped for CRT glitch ("progress bar master dots etc can glitch").
- GGE:2159-2163: CRT glitch on graphical HUD only, 21 Sept: "Do not glitch the text on the HUD, glitch the graphical elements only".
- GGE:215-226: no glitch on prompt text; CRT cursor after the last word ("The cursor shouldnt be up in the HUD, it should be in the messages or after the questions"); text sized by clamp.
- PlayBackdrop.tsx:7-50: Joshua (Slack, 21 Sept): "it shouldn't have a similar background color as the Explore/my profile etc, it'll feel redundant... when playing a game it should feel like we are entering a new world"; "Dont change the background of the PLAY TAB... ONLY CHANGE THE BACKGROUND OF THE IN GAME BACKGROUND"; gold duotone rejected ("WHY HAVE YOU USED A GOLDEN BACKGROUND FOR THE GLOSSARY GAME... IT JUST HAS TO PLAY WELL WITH THE GAME UI NOT MATCH IT"); jade rejected ("still feels black dominated... try a different combo than green/yellow"); berry chosen; Vortex parked in `ui/vortex.tsx`; stars recolored, white stars "not blend into it so i cant see it"; speed 50 -> 140 ("Slow the movement of the stars upward"); bloom keeps the career accent.
- PlayBackdrop.tsx:83-91: `forwards` fill mode ("the sharp round blob that appears after right answer is bad... no color blobs accumulating").
- PlayBurst.tsx:3-10: 21 Sept "not flat basic confetti, ever"; LocalBurst untouched for Build.
- backdropPulse.ts:1-11: event bus so the background reacts ("interactive feedback animations that also reflect in the background"); deliberately lighter than Build's aurora.
- useResolvedColor.ts:5-24: canvas can't read `var()`; probe must live inside `.marketing-v2` (a body probe resolved near-white).
- PlayVersionChip.tsx:3-7: demo-only, like Connect's AT&T chip; v1 shipped default.
- PlayBackdropV2Crt.tsx:6-24, 30-33, 49-55, 63-85; globals.css:1070-1090, 1098-1101, 1124-1183: CRT built from codepen.io/creme/pen/aPJwEz, kept black ("instead of a blue screen lets keep it black"), "like an OLD TV", noise below scanlines, 8px bands at 0.65, "The pulsing glow can be slowed down and more subtle", pixel font "a more pixelated-pixel looking font", square corners "Go more Retro blocky pixelated with the UI on CRT", compound selector for cascade.
- PlayBackdropV3Dots.tsx:7-15, 91-101, 105-107, 119-124: real Vanta.DOTS ("you got the dots worng"), `showLines: false` ("remove ONLY that"), CDN failure falls back to dark div, reverted masking attempts.
- PlayBackdropV4Synthwave.tsx:6-25, 32-36, 58-69: reference-exact synthwave, sun removed, gold not magenta, dark floor with gold lines, 4s scroll, 1px lines.

### 9.6 Sound / music
- GGE:23-28: import from glossaryThemeSound so every call site picks up per-version sound.
- GGE:1801-1807: per-version SFX + loop, 21 Sept: "add sounds that fit the CRT version, the synth version etc... add a background track to each that fit each ones vibe"; "v1 also could use a good tune"; stopped on unmount.
- glossaryThemeSound.ts:1-13: wrapper, not an edit of sound.ts.
- glossaryThemeSound.ts:22-28: `started` flag (v1 track never started because `currentTheme` defaulted to v1).
- glossaryThemeSound.ts:38-41: dedicated music toggle ("and a button to toggle music on off").
- glossaryThemeSound.ts:88-103: private context; one context, two gates; 25 Sept bug quote.
- glossaryThemeSound.ts:220-245: patterns rewritten twice: 21 Sept "Please have a more catchy tune for the CRT version, And every version please. Not too distracting, just something that sits in the back"; 22 Sept "the music for the glossary games are too short of loops being repeated and causes fatigue we need full songs that vary... things like mario, pokemon etc have per city etc." (sectioned Intro/A/B/Bridge/Return).
- glossaryThemeSound.ts:320-325: per-tick self-healing mute check, 25 Sept "verify every game and fix so it never breaks".
- sound.ts:1-7: synthesized, no assets; "a game that cannot be silenced instantly is a game they will not open at school."
- sound.ts:104-105: wrong is "Low and short, never harsh: getting it wrong is part of learning".
- music.ts:7-10: simulation music has its own mute separate from SFX ("mute it [the music] and only hear sound effects").

### 9.7 Edge cases (22 Sept 2026 "custom-designed edge case" series)
- GGE:158-165: DreamyFace `onError` (widest-blast-radius unguarded image in Play).
- GGE:1624-1628: zero-term NaN% guard.
- GGE:2198-2206: zero-question stuck screen -> skip to Power Play.
- GGE:1620-1622: one Dream Score (the private x100 score produced 15k figures, Chandu, 6 Sept 2026).
- GGE:2260-2263: lazy initializer so the award runs once at mount; store ignores repeats.
- GGE:1792-1794 and useResolvedColor.ts:28-29: rAF defer to satisfy `react-hooks/set-state-in-effect`.

---

## 10. Discrepancies, gaps and recommendations for the production rebuild

1. `memoryTip`, `subtitle`, `difficulty`, `estimatedMinutes`, `careerTitle`, term/pair/item `order` are authored but unused. Decide: render (memoryTip on the flip card back is the obvious slot) or drop.
2. Three finance-hardcoded strings (GGE:403, 463, 480) block multi-career. Add a subject field.
3. `saveLessonComplete` stores all term ids as mastered and adds XP to the glossary store on every replay (no dedupe). Store real `masteredTermIds`; award once server-side.
4. Glossary progress is never read back: no "completed" badge, no lesson 2 unlock, no resume. Home card progress "6 of 10 terms mastered" is fake.
5. Power Play word bank is in answer order (hint); consider shuffling with `shuffleStable(answers, lesson.id + "-pp")`.
6. Type the Term plays no sound/pulse on check (all other kinds do).
7. Sort the Buckets has no way to undo a placement before checking.
8. "See Results" label shows before an appended review question.
9. Music restart bug after in-app re-entry / StrictMode (section 6.5).
10. Reduced-motion leaves burst particles and bloom visible (8.4); Stars/Fireworks ignore reduced motion.
11. Light-mode contrast of CTAs (accent + `#05070f`) and Power Play (white on light purple); in-game cards flip light over a dark scene.
12. Accessibility: dialogs lack role/focus management/aria-live; inputs lack labels.
13. `--danger` and `--success` tokens don't exist; literals `#e0483e` / `#1f9d55` are what render.
14. Progression spec proposes 30 XP per lesson + 40 XP delayed check (48h+); code awards 20. Confirm with Joshua.
15. Production should delete the DEMO-ONLY dock, version chip, `?bg`, v2-v4 backdrops/SFX/music, and the `--demo-dock-space` term in the scale formula (grep `DEMO-ONLY`).
16. The xlsx authoring template is not in the repo; get it from Usman/content team to confirm column names and the "README" rule text referenced in data.ts:96.
