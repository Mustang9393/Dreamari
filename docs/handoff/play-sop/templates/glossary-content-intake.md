# Glossary Game content intake: what a career's lesson must contain

Reverse-engineered from `src/components/glossary/data.ts` (the real authoring sheet, `DreamAri_Glossary_Content_Template_v1.xlsx`, is not in the repo; confirm column names against it). Field meanings and runtime behavior: [04-glossary-game.md](../04-glossary-game.md) §1.

## Career (one row)

| Column | Field | Rules |
|---|---|---|
| Career slug | `careerSlug` | The catalogue slug (same as Career Detail and the Play hub). |
| Career title | `careerTitle` | Supply it (unused today). |
| World | `world` | Exact `WORLD_COLORS` key; sets the whole accent. |
| Subject word | (new field, see issue A11) | "finance", "nursing", "aviation". Needed to replace the three hardcoded "finance" strings. |

## Lesson (one row per lesson; only lesson 1 plays today)

`id` (globally unique, becomes the XP milestone id, e.g. `RN-L01`), `lessonNumber`, `title`, `subtitle`, `milestone` (shown on "All 5 terms unlocked!"), `exampleCompany` (the one story every example ties back to), `difficulty`, `estimatedMinutes`, `xpReward` (20), `companyValue`, `nextCompanyValue`, `nextMilestone` (the finance meter; decide the equivalent per career, A11).

## Terms (exactly 5 per lesson)

`id` (unique), `order`, `term`, `definition` (eighth-grade level), `example` (must mention `exampleCompany`), `icon` (a semantic slug from `TERM_ICON_MAP`, or request a new one: illustrations stay relevant to the lesson's own story, never emoji), optional `memoryTip`.

## Questions (7 main, played by `playOrder`)

Common: `id` (unique), `termId` (which term a right answer credits; omit only for Match It Up and Sort the Buckets), `playOrder`, `prompt`, `feedbackCorrect`, `feedbackWrong` (the only place the right answer is explained for typed, sort and numeric questions).

| Kind | `type` label | Extra fields |
|---|---|---|
| `choice` | Definition / Reverse Recall / Fill in the Blank / Catch the Misuse | `options` (4 unique strings, authored distractors), `correctIndex` |
| `typeTerm` | Type the Term | `wordBank` (the answer must be in it), `answer` |
| `matchUp` | Match It Up | `pairs` (left, right, termId; both sides unique) |
| `sortBuckets` | Sort the Buckets | `buckets`, `items` (text, bucket, termId; texts unique; every bucket name exact) |
| `profitBuilder` | Profit Builder (multi-step numeric) | `scenario`, `steps` (order, label, numeric answer) |

The shipped lesson uses one of each kind plus two extra choice types, in this order: Definition, Type the Term, Fill in the Blank, Match It Up, Catch the Misuse, Sort the Buckets, numeric builder.

## Review questions (remediation)

At least one per term you want remediated; each MUST have `termId`. After the main queue, any term with fewer than 2 credited answers pulls its review questions once.

## Power Play (1 paragraph)

`paragraph` with `{1}` … `{n}` placeholders (1-based, contiguous) and `answers` (n unique words). Retried until all correct.

## Facts

1+ short "did you know" lines (one shows on the 1.8s mastery screen). No unsourced numbers.

## Validation list

- [ ] Exactly 5 terms; every `termId` everywhere matches a term id.
- [ ] Each term is credited at least twice across the main questions (mastery needs 2).
- [ ] All ids unique; lesson id globally unique.
- [ ] Options, pair sides, item texts, word-bank words and Power Play answers unique within their list.
- [ ] `correctIndex` in range; `typeTerm.answer` in `wordBank`; every `item.bucket` in `buckets`; numeric answers are plain numbers.
- [ ] Placeholder count equals `answers.length`.
- [ ] Every icon slug exists in `TERM_ICON_MAP` (or a new icon is requested).
- [ ] Copy at eighth-grade level, no em dashes, every example tied to `exampleCompany`.
- [ ] Hub entry: `GLOSSARY_GAMES` card titled "<Subject> Terms", sub "Learn key <subject> terms", cover (chapter 7).
