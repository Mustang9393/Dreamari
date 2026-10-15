# Glossary Games as a system: any career, generated levels

Current state, 16 October 2026. Supersedes the per-lesson authoring described in `docs/handoff/play-sop/04-glossary-game.md` for every career after Investment Banking. Investment Banking Levels 1 to 4 stay hand-authored (`src/components/glossary/data.ts`, `data-finance-l2-4.ts`); everything else is generated.

## Who

Students on the Play tab, in any career that has a glossary. The content team supplies words; nobody authors questions by hand any more.

## The one rule

A career's glossary is a **blueprint**: five terms per level, each with a definition, an example sentence and a short cue. `buildGlossaryCareer()` in `src/components/glossary/generate.ts` turns that into the lessons, the seven-question practice loop, the review set and the Power Play paragraph, in the same `GlossaryLesson` shape the engine already plays. The engine (`GlossaryLabGameExperience.tsx`) does not know whether a lesson was authored or generated.

## Blueprint (what the content team provides)

```ts
{
  careerSlug: "registered-nurse",      // the catalogue slug
  careerTitle: "Registered Nurse",
  world: "Health & Medicine",          // exact WORLD_COLORS key
  subject: "nursing",                  // "You'll learn nursing words"
  company: "Riverside Clinic",         // the one story every example names
  idPrefix: "RN",                      // lesson ids RN-L01, RN-L02...
  chapters: [{ number, name, tier }],
  levels: [
    {
      number, title, tier, goal, unlocks, milestone, nextMilestone,
      companyValue, nextCompanyValue,
      terms: [ { term, definition, example, cue, formula?, icon? } x 5 ],
      facts?: string[], intro?: { headline, line, hook },
    },
    { number, title, tier, goal, unlocks, ..., words: [five words] }  // roadmap only
  ],
}
```

Worked example: `src/components/glossary/blueprints/registered-nurse.ts` (DEMO-ONLY copy, two playable levels, four on the roadmap).

### Copy rules, enforced at build time

`validateBlueprint()` throws in development when: a level has other than five terms; term names, cues or definitions repeat within a level; an example never says its own term (it must, it becomes the blank); an example does not name the company; copy uses a dash. The content rules it cannot check: eighth-grade reading level, one idea per sentence, every example in the company's story.

## What the generator produces per level

Level 1 of Investment Banking is the recipe. In its order:

| # | Kind | Credits | Built from |
|---|---|---|---|
| 1 | Definition | term 1 | the definition against three other terms' definitions |
| 2 | Match It Up | all five | word to cue |
| 3 | Fill in the Blank | term 5 | the example with the word blanked, four words as tiles |
| 4 | Reverse Recall | term 3 | the definition, which word |
| 5 | Sort the Buckets | terms 1 to 4 | cues into their words |
| 6 | Catch the Misuse | term 4 | three true "word = cue" pairs and one swapped |
| 7 | Type the Term | term 2 | spell the word for its definition |

Every term is credited at least twice, so mastery (two credits) is reachable in the main loop. Review: one Reverse Recall per term, drawn only for terms still short of mastery. Power Play: the five examples with their words blanked, as one paragraph (Joshua's rule: one Power Play, one paragraph, all five words). The right answer's position rotates by level so it is never always first.

Feedback copy is built from the term's own definition and example, so it is specific without being authored.

## Presentation rules the generator relies on

- Generated careers have no term art. The engine treats a lesson with no art like Levels 2+: words-only teach cards, initials in the HUD tokens and on the relics, no pictures on match, sort or card backs (15 Oct 2026, Chandu).
- Dreamy's poses, reactions, the reward pluses, the Power Play board and the Complete screen are shared by every career and both themes.
- The welcome scene's illustration (the sneaker shop) is Investment Banking's own. A career without welcome art gets Dreamy alone.
- The value meter reads "`company` value" and the intro reads "`subject` words"; nothing in the engine says "finance" or "Dream Sneakers" any more.

## Adding a career

1. Write a blueprint file under `src/components/glossary/blueprints/`.
2. Register it in `GLOSSARY_CAREERS` (`data.ts`) as `buildGlossaryCareer(BLUEPRINT)`.
3. Add its Play hub card to `GLOSSARY_GAMES` (`src/components/play/games.ts`) if it is not already listed; `hasGlossary()` flips the card from "Coming soon" to playable on its own.
4. Open `/play/glossary/<slug>` and press Skip (DEMO-ONLY) through a level. A bad blueprint fails at import with the list of problems.

## Where every piece is documented

Component Lab, group "Glossary game, live engine": every live piece in both themes and all of its states, with a generated-career specimen beside the authored one. The older group "Glossary game (retired engine)" documents the unrouted first engine and stays for archaeology.

## Not done

- Art for generated careers (none planned; words-only is the rule).
- The Levels map chapters for generated careers are named in the blueprint, not derived.
- A sheet importer (xlsx to blueprint); the blueprint is the import format for now.
