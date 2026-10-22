# Dreamari Career Simulation Master SOP

**Version 2.3 · 22 October 2026 · AI builds and repairs; human QA reviews the finished game**

This is the shareable production standard for building a complete Level 1 from a career name. The vetted Investment Banking simulation is the gameplay, narrative, sequence, UX and scoring reference. New careers inherit its proven player experience while using their own authentic work, projects, colleagues and varied tasks. This SOP supersedes earlier editions and older exact beat/question lists.

## Art handoff for a new chat — mandatory

The art standard is the actual approved UX Designer, Food Scientist and Registered Nurse game images below. Download or attach the full images before generation. Merely saying “anime,” “cinematic,” “luxurious,” or naming a game does not establish the rendering style. The PDF includes visual examples; the downloadable reference pack supplies the full images for image-tool input. Keep the illustrated detail level even when designing an opulent new workplace.

- [UX Designer approved scene](https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/ux-approved-work.png)
- [Food Scientist approved scene](https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/food-approved-work.png)
- [Registered Nurse approved scene](https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/nurse-approved-corridor.png)

Use Appendix B's reference-loading instructions, character prompt, environment prompt and assembly check together. Both character and environment prompts are detailed independently, but production output is still one complete image with characters baked in. Copying the PDF text without loading the reference images is not a complete art brief. Attach the same approved primary scene to every generation, then add canonical identity and room references. A new chat must not substitute its own idea of premium anime.

## 1. Goal and decision rights

The human supplies a career name and may add preferences. The AI researches entry-level work, chooses sensible defaults, writes the game, makes scenes and supporting graphics, integrates them, runs it, fixes failures and packages evidence. Do not ask the human to write a script, scene list, question list or image brief. Human review happens on the assembled result. A contact sheet remains useful for internal art QA, but the AI repairs and integrates without waiting for approval of intermediate sheets.

Use current user feedback and repository handoff documents as the latest authority. Read `AGENTS.md`, `docs/HANDOFF_INDEX.md`, `docs/AI_HANDOFF.md`, the shared player/types/scoring, and the current Investment Banking Level 1 implementation. Inspect actual behavior, not a remembered description. Preserve vetted IB gameplay. Do not change the reference game to make another career fit.

## 2. Gameplay, pacing and progress

The vetted Investment Banking Level 1 (`src/components/play/ib-level-1-v2.ts`) provides the 29-slot narrative and learning spine. Build exactly 29 runtime beats for new careers such as UX Designer and Food Scientist, preserving the story sequence, teaching rhythm and scored checkpoints while researching authentic tasks for the career and level. Slots 1-2 are establishing workplace welcome and stakes cards with no future character faces. The mentor first appears at slot 3; slot 4 establishes their authority and career ladder. Reach the first easy scored choice at slot 6. Keep copy concise for a US eighth-grade reader.

For every career, make the first story image a clear exterior establishing view of the actual workplace; the next establishes its interior and stakes. Shared anime drawing style does not mean shared building design: choose career-appropriate, visibly distinct massing, roofline, facade and material rhythm, and avoid three generic ivory-glass porticos. UX is a restored six-story waterfront red-brick industrial loft with modern ivory/walnut fit-out; Food is a low one-to-two-story sage garden research campus with a sawtooth clerestory roof; RN is a curved eight-story lake-facing patient tower over a rounded clinical podium. Keep each exterior consistent with its interior materials, window grids and geography; preserve RN's established lake-facing view. Use plausible morning light. This adds no beat or people; RN script order remains locked.

### Shared 29-slot story spine

**Slots 1–10:** 1 workplace welcome; 2 stakes; 3 mentor introduction; 4 mentor authority and career ladder; 5 brief peer cameo; 6 first easy scored choice (#1); 7 four vocabulary cards; 8 four applied matching pairs as practice, with no verdict; 9 four timed rapid items in 45 seconds, scored decision #2; 10 career method or rule.

**Slots 11–20:** 11 apply the career rule (#3); 12 senior arrival; 13 senior context and evidence standard; 14 decision authority and ladder; 15 perform or critique career work (#4); 16 midpoint review at 68, after four scored decisions; 17 short Act 2 transition; 18 returning rival's motivation (not a reintroduction); 19 rival takes credit; 20 private response choice (#5).

**Slots 21–29:** 21 deadline and workload shock; 22 mentor chat proposing a job-specific solution (#6); 23 delivery; 24 peer needs help; 25 her-deadline/your-time contrast; 26 rank a supportive response (#7); 27 mentor notices; 28 completion; 29 final review.

Keep the teaching trace coherent: teach the actual job-specific concepts in slot 7, practice their application with four realistic pairs in slot 8, then apply the same concepts in slot 9. Do not use placeholder terms or unrelated questions. Practice is unscored and has no verdict screen. Preserve decision positions, while choosing existing question controls that fit the actual work: scored choices at slots 6, 9, 11, 15, 20, 22 and 26, with the rapid round at #2 and the final ranking at #7. The scoring contract is reputation 50, seven decisions worth ±6, midpoint 68 after decision four, final pass 85.

Carry the same mentor, rival and senior into planned later levels in a continuity ledger, preserving their names, roles, identities and relationships. Build Level 1 only; do not build future levels or imply a real unlock that the game has not implemented.

### What the previous v2.0 wording missed

The actual IB source does not start with a mentor or force several mentor-only opening beats: slots 1-2 establish the workplace and stakes, slot 3 introduces the mentor, slot 4 explains authority, and slot 5 briefly introduces the peer. Its middle teaches vocabulary, practices with a no-verdict matching interaction, and applies it in a four-item timed round. Its later story turns the same characters and workplace tensions into decisions, checkpoint, support ranking and review. The previous v2.0 wording named a 29-beat count and a few character positions but lacked this exact sequence and learning trace; it also read as a character-introduction schedule rather than work-led scenes. Use that narrative order as the source of truth. Version 2.3 corrects an additional failure: forcing every career into IB’s storage and report questions produced noun-swapped quizzes. Keep the narrative purpose; research the job action and choose its control separately.

For these new-career builds, keep the IB score contract: reputation begins at 50; seven scored decisions change it by +6 or -6; no strikes; checkpoint after four scored decisions at 68; final pass at 85. Practice interactions remain unscored. The progress bar is a separate measure: begin at 0 before any scored decision, then show completed scored decisions out of seven (for example, 1/7 after decision one resolves). Do not seed the progress bar or derive it from reputation. The player's score still starts at 50. Preserve the shared player behavior, option locking, correction, keyboard/touch and result flow.

### Approved Nursing exception: image-only updates

Registered Nurse was separately vetted and approved. Its authoritative gameplay is `src/components/play/rn-level-1-v2.ts`, restored from `ff4b97e`. Keep the approved Nursing script locked: 36 runtime beats cover the original 55 script screens, with ten scored decisions at ±5, two applied practice decisions, matching, vocabulary, rapid, ranking and pick interactions, the midpoint review, final review and original endings. Keep its seven-card trailer and six-rung career ladder. Nursing does not inherit the new-career 29-beat or seven-decision template. Never rewrite, shorten, reorder or replace an approved Nursing script, question, answer, score, interaction, review, ending, trailer or ladder to force it to 29 beats. An RN visual refresh changes image fields and face chips only; all other gameplay data must match the approved source.

Follow the exact cast, action, emotion, location and time in each approved Nursing script screen. Do not add people who are absent from that moment. A patient alone during an alarm should look alarmed when Rosa is elsewhere; crisis scenes must not show smiles. Keep required ECG, badge, call-light board, wristband, report and related work surfaces in their approved story states. Keep canonical room geography and the established lake-facing exterior.

## 3. Real work, evidence and educational honesty

Research entry-level work using primary sources: official professional standards, government and regulator guidance, primary organization documentation, product manuals and official training materials. Record each source title and URL, the fact it supports, the role’s authority and any limit. Distinguish researched facts from fictional training data. A fictional prestigious project may create stakes, but must not imply a real company endorsement or career guarantee.

Give the learner an honest role. Introduce a mentor, authority and colleagues only when they contribute to later work. Keep the established mentor/rival/deadline/support arc, while changing the career-specific work, project and technical complication. Choose a concrete deliverable and a credible project. Explain the goal and stakes without claiming a junior controls decisions outside their role.

### Research and level-fit task contracts

Before drafting questions, independently research what a beginner actually does in the requested career. Use occupational sources for duties and first-party or professional method guides for how the work is done. Record source title, URL, fact supported, stage, authority and limits. Choose an authentic project and design the work before selecting a quiz format. Sources support methods; fictional brand names, codes and results remain clearly marked training data.

For every scored task record: story slot, work objective, prerequisite teaching, supplied facts, player action, answer rationale, plausible mistakes, role authority, review owner, existing interaction and optional visual state. At least four of seven scored decisions must involve actual career work. Common ethics and teamwork can recur, but technical questions must not become the same problem with new nouns. Compare new question stems and option sets against existing careers and inspect the reasoning, not just exact words.

Level 1 is supervised first-week work. The player can sketch, observe, label, prepare, compare, document, flag and propose. A mentor or qualified specialist retains final approval. Later levels increase responsibility only when research supports it. Never ask a junior to approve market release, safety, clinical care or accessibility compliance independently.

UX now uses rough layouts, neutral usability tasks, Save placement, a broken prototype path and keyboard observation notes. Food Scientist uses an assigned small comparison, neutral tasting codes, recipe-code records and missing-record escalation. The UX fourth term is Observation; Food’s is Sample code. Rapid rounds apply those job terms. Slot 10 teaches a relevant method, slot 11 applies it, and slot 15 need not always be a report-error exercise. Keep mentor/rival continuity, midpoint and final review unchanged. Nursing’s approved gameplay remains locked.

For optional graphics, align the state to the task: UX Save placement shows the buried layout before the choice and a proposed clear layout after success; the next test still needs evidence. Choosing a wrong test instruction must not revert a layout. Food’s named labels become neutral codes after the appropriate choice. Graphics stay read-only; each question supplies its essential facts without a graphic.

Research and inspectable task contracts are in `docs/handoff/career-scaling/career-task-research.json` and `career-task-contracts.json`. A passing validator checks structure, evidence references and scope coverage; it is not expert certification. Play the changed controls and check wrong-answer states before release.

### Work-led cast and continuity

Build a cast ledger with first-appearance slot, name/role, unique solo image, narrative purpose, follow-up slots and planned continuity into later levels. Each entrance must be triggered by an actual task, with gameplay between entrances; do not create a succession of introduction cards, even if spaced apart. Introduce only one new person at a time. Keep slots 1-2 free of future character faces. Return to established characters for later work rather than reintroducing them. Group scenes only after everyone visible has been introduced. Check every scene against the ledger. The mentor recurs; peer opposition needs a credible narrative reason.

For the current UX Designer sequence, Arjun is the mentor at slot 3, with authority at 4; Noah is a brief peer cameo at 5 and returns for the rival sequence at 18-20; Samira is the senior at 12; Amina is the peer needing help at 24. Introduce each through the work in that slot (prototype, review, keyboard testing, respectively), not a standalone cast card. For Food Scientist, Ren is the mentor at 3-4; Imani is the brief rival cameo at 5 and returns at 18-20; Yuki is the senior at 12; Luis is the peer needing help at 24. Keep the same characters and relationships in the continuity ledger for future levels, but build only Level 1. Keep the exact 29 slots and never alter the locked RN script to match them.

A small test supports only its observed result. Do not turn one UX session into universal usability, a tasting trial into product release approval, or an unverified reading into a clinical recommendation. Do not invent clinical dosages, thresholds, technical limits, legal rules, salaries or release approval. In nursing content, stay within sourced and role-appropriate basics. For example, the Joint Commission’s identifier guidance and AHRQ’s handoff material can support an identity-check or communication concept; neither authorizes made-up medication values. If evidence is unavailable, say so and design a task that does not need it.

Useful research examples for UX include NN/g’s [Usability Testing 101](https://www.nngroup.com/articles/usability-testing-101/) and [Task Scenarios for Usability Testing](https://www.nngroup.com/articles/task-scenarios-usability-testing/). They support realistic, actionable tasks that do not reveal the answer. For Nursing, use AHRQ PSNet’s [Handoffs](https://psnet.ahrq.gov/primer/handoffs) and the Joint Commission’s [Two Patient Identifiers FAQ](https://www.jointcommission.org/en/knowledge-library/support-center/standards-interpretation/standards-faqs/000001463). Cite evidence in career briefs and graphics research, not in student copy.

## 4. Copy and question design

Write American English for a US eighth-grade reader. Prefer common words, direct actions and short sentences. Explain necessary terms where they first appear. These are authoring targets, not a comprehension certificate:

- Title: usually 2–6 words; maximum 10.
- Story body: usually one sentence, around 20 words or fewer.
- Question: one clear instruction, usually 24 words or fewer; include essential facts even if longer.
- Answer options: brief, parallel and specific.
- Feedback: one useful reason, usually 18 words or fewer.

Do not repeat the same instruction in title, subtitle, graphic header and question. The shared control teaches how to operate the interaction; avoid “Sort into buckets” plus “Sort the notes.” The question should present one task and its needed facts without asking the player to inspect an optional graphic. Word counts and reading formulas are diagnostics only. Read actual screens for clarity, tone and comprehension.

## 5. Optional work graphics

Use graphics only when a real work surface adds useful context: a native app screen, rough wireframe, message, notepad, short sample label or relevant monitor. Nursing’s ECG-like context is an example of a career-relevant screen, not a template to reuse everywhere. A graphic is optional atmosphere and context, not another task, evidence gate or hidden answer. Keep it to about 6–14 visible words; avoid dense charts, tables, paragraphs and repeated task labels. Omit a graphic that adds nothing. In story cards, preserve this order: title → graphic → description → CTA. Keep the graphic above the description and CTA. On UX work screens, show the relevant UI state clearly: for example, a buried Save action below several long gray description lines, followed by the improved state with a prominent Save action. The screenshot illustrates the state; the question states the evidence and task.

All answer facts stay in the game question. The scored question must remain answerable if its graphic is removed. No separate tabs, button clicking, typing, reset, mandatory exploration or embedded playable demo. No decorative vector equipment and no fake live readings or metrics. Only actual game controls accept answers or advance. Use native UI, shared tokens and semantic text where interaction or legibility matters. Provide concise text equivalents and verify at desktop and phone size, including focus order: a decorative asset must not create extra keyboard stops.

Examples already established in the package: the UX AMPLIFY music-app release, the Food Scientist LUMA drink trial, and Nursing’s First Shift. They illustrate career-specific settings and work surfaces. They do not create a rule that a food product needs an arbitrary release-approval screen.

## 6. Cast identity and character style

Build a varied cast across ethnicity, gender, complexion, age, eye color and hair texture. Avoid assigning one complexion or feature set to an entire ethnicity. Keep older characters visibly older in every shot. Preserve Eleanor's age 60 and Sofia's age 67 with consistent face, hair, posture and age cues. Each person has one canonical identity: face shape and proportions, skin base and undertone, iris color, hairline and texture, age, outfit and identifying details. Reuse that identity in every scene and face chip.

For the requested Black-cast update, move the cast one shade darker in one canonical palette update, then propagate it to all scenes and face chips. Keep the adjustment consistent. Preserve the skin base through light and shadow; do not crush shadows into black.

Use the approved UX/RN character reference: thin controlled linework, expressive eyes, small nose mark, short line mouth, flat base color and one broad cel shadow. Keep blonde hair to no more than four broad solid masses with no more than two internal hairlines. Avoid glossy strands, painted lips, sculpted cheeks, heavy comic outlines, photoreal skin and 3D rendering. Canonical identity remains fixed as expression and pose change.

Hashes identify the exact files that were reviewed and help invalidate stale reviews. A hash proves file provenance, not facial identity or visual quality. Reuse a saved file when identical pixels are required; fresh generation cannot promise pixel identity. Record prompts, source references, selected files, hashes and repairs. A changed face or scene requires a new visual review.

## 7. Complete-scene art and composition

Generate one complete, opaque painted scene with the characters, room, furniture and lighting together. Do not use runtime sprites, character cutouts or counter portraits. Never show player arms or hands as foreground cutouts. The player is the camera. A colleague addressing the player looks toward the lens; observed conversations may look at their participants. Match the exact cast, presence, emotion, action and time described by the approved script.

Use luxurious, functional interiors with ivory stone, walnut and brass, but keep each career's exterior design distinct. Preserve each established interior's materials, window grids and geography while choosing a career-appropriate silhouette: UX six-story waterfront red-brick industrial loft; Food low sage garden research campus with sawtooth clerestory; RN curved lake-facing patient tower over a rounded clinical podium. Do not reuse one generic ivory-glass portico across careers. Keep environment detail selective and anime-flat rather than photoreal. No mirror floors, glossy skin, bloom, haze or unsupported beams. Lighting comes from plausible windows and practical fixtures. Never send a beam through a closed door. Keep the established lake, red-roof homes, trees and green hill outside Nursing windows.

Keep gameplay panels and other UI consistently centered in the same position across scenes. Never shift a panel left or right to protect a face. Compose the artwork around the fixed centered HUD, question and dialogue footprint; leave the HUD and dialogue bands clear while keeping characters fully visible. Success uses the shared IB monogram/CareerSeal treatment, not a generic trophy.

Compose a dedicated image for each required orientation. Landscape and portrait art should each fill the viewport at its intended aspect ratio, with clear HUD and dialogue bands and complete faces. Do not crop faces or important characters to fit a different aspect ratio. Do not use blurred side-fill, black bars or runtime zoom/cropping. The final painting fills the appropriate viewport; art compositions preserve faces and bodies while leaving the top 20% HUD zone and bottom 38% dialogue zone free of faces. Inspect the actual desktop and phone layouts.

For Nursing, art edits must follow the locked 36-beat/55-screen approved script. Match who is present and the scene's emotional state: an alarmed patient may be alone when Rosa is elsewhere; no smiling through a crisis. Do not infer a new shot's cast or mood from adjacent art when the source screen specifies otherwise. Existing images and face chips change only as needed to match approved script, cast identity and composition.

## 8. Build, integrate and test the whole game

Integrate into the shared simulation system and use existing interaction components, scoring, progression, scene rendering and semantic tokens. Avoid career-specific UI controls unless a real mechanic requires them. Create a full source-backed brief, career task mix, beat/script map, cast and room ledgers, artifact mapping, exact prompt records, selected assets, coverage and QA evidence.

Play the complete game end to end through both passing and non-passing outcomes. For UX and Food, check the 29 runtime beats, first choice by beat six, every planned interaction type, progress 0/7 before the first resolved scored decision, and each progress increment independently of reputation 50. Check question answerability without graphics, scoring, checkpoint pass/fail, midpoint Continue, act transitions, final results, retry and restart. For Nursing image-only updates, compare every gameplay field against the locked `rn-level-1-v2.ts` source and confirm only image fields/face chips differ; review art mapping against all 55 script screens and 36 runtime beats. Test every interaction used and all regressions from earlier failures. A missing flag must not strand the player. Each card must auto-advance, expose a checkpoint control or offer Continue. Record actual pass/fail and retry results; mark unrun branches clearly. Do not call QA complete based only on structural validators or a contact sheet. AI performs internal contact-sheet review, repairs and integration without an approval gate; human QA is for the assembled result.

Run the project’s relevant structural validators, regression tests, TypeScript, scoped lint, token check and production build as required by the repo’s release workflow. Inspect the assembled game on desktop and phone. Test image loading, crops, focus, scrolling and legible controls. Report unsupported browser/device checks as unverified. Human QA should assess career authenticity, learning value, fun, art quality and whether the complete flow feels coherent.

## 9. Handoff and publication

Deliver a playable QA build, source-backed research brief, script and keys, coverage map, cast and room ledgers, canonical references, prompts, selected art, native graphics, screenshots, actual QA records and open issues. The cast ledger records first-appearance beat, name/role, unique solo image and follow-up beats. Check each scene for unintroduced visible characters. Update this SOP when feedback exposes a reusable failure. Old editions are history, not instructions. A public release follows existing authorization and needs verified live behavior; a local preview is not a live release.

## Appendix A. Copy-ready build prompt

```text
Build and deliver one complete Dreamari Level 1 for {CAREER}. Read `output/career-master/master-sop.md`, the latest `docs/AI_HANDOFF.md`, current user feedback, `AGENTS.md`, `docs/HANDOFF_INDEX.md`, the shared simulation engine and the actual Investment Banking Level 1. Choose and record sensible defaults when only a career name is supplied. AI owns research, writing, art, integration, complete-game QA and repair. Do not require intermediate human approval; contact sheets are internal QA.

For new careers, keep IB’s 29-slot high-level story and learning rhythm, not its banking questions. Slots 1–2 establish workplace/stakes; 3 mentor; 4 junior authority; 5 peer seed; 6 first easy work decision (#1); 7 four job terms; 8 four applied matches, unscored/no verdict; 9 four related rapid items in 45 seconds (#2); 10 a relevant career method/rule; 11 apply it to the assigned work (#3); 12 senior arrival; 13 job evidence/context; 14 authority/ladder; 15 perform or critique career work (#4); 16 midpoint at 68 after four decisions; 17 Act 2; 18–20 returning rival, credit conflict, private response (#5); 21 job-specific deadline complication; 22 propose a bounded solution to the mentor (#6); 23 delivery; 24 colleague needs help; 25 explains the work and your capacity; 26 rank concrete support (#7); 27 mentor notices; 28 completion; 29 final review. Maintain decision positions, learning-before-testing, cast continuity, scoring and progression. Select existing answer controls that fit the work. File storage, document error-spotting and identical question layouts are not mandatory across careers.

RESEARCH THE ACTUAL WORK BEFORE WRITING QUESTIONS. Independently consult primary occupational sources, professional bodies and first-party method guides for {CAREER} at {LEVEL / STAGE}. Record sources, supported facts and limits. Build a task contract for every scored screen: narrative purpose, real job objective, supplied evidence, junior authority, taught concept, expected action, answer rationale, plausible mistakes, control and optional graphic state. Level 1 means supervised beginner work: sketch, observe, prepare, compare, label, record, flag and propose for review. Later levels may plan, supervise or approve only when sourced authority fits. Never give an intern independent launch, clinical, safety or compliance sign-off.

At least four of the seven scored decisions must exercise actual career work; common teamwork and ethics remain where the story needs them. The rapid round applies the four job terms, not generic email etiquette. A junior UX designer may sketch a wireframe, place Save near its content, choose a neutral fan task and propose repairing a broken flow before polish. A supervised food-science junior may follow a small trial plan, apply neutral codes, catch a sample-record mismatch and flag a missing recipe before comparison. These are examples, not tasks to paste into other careers. Compare all question stems and answer sets with existing games: if changing career nouns leaves the same technical question, redesign it. Shared story beats may remain shared; technical decisions need authentic evidence and consequences.

All careers open with a clear workplace exterior, followed by interior/stakes. Shared anime drawing style does not mean shared building design: choose career-specific massing, roofline, facade and material rhythm; do not use three generic ivory-glass porticos. UX: restored six-story waterfront red-brick industrial loft with modern ivory/walnut fit-out. Food: low one-to-two-story sage garden research campus with sawtooth clerestory roof. RN: curved eight-story lake-facing patient tower over rounded clinical podium. Keep each exterior consistent with its established interior materials, window grids and geography; preserve the RN lake-facing view. Use plausible morning light. This uses existing slots; no added beat or face.

Audit the story and teaching arc against `src/components/play/ib-level-1-v2.ts`. Preserve its intentional entrances, practice, checkpoint, rival return, pressure, collaboration and review. Do not copy its storage question or report exercise simply to match a slot. Nursing remains a separate vetted gameplay reference and locked script.

Use the IB scoring foundation: reputation starts at 50, seven scored decisions change it by ±6, no strikes, checkpoint after four at 68, final pass at 85; practice is unscored. The independent decision progress starts at 0/7 and tracks resolved scored decisions; do not derive it from reputation. Write concise US eighth-grade copy with one task and one instruction per screen. Teach real career concepts, practice those concepts, then assess the same concepts; never use placeholder vocabulary or unrelated rapid items.

CAST LEDGER AND WORK-LED ENTRANCES. First appearance is only when the slot's work requires the character; no introduction-card sequence, even if the cards are separated. Gameplay occurs between entrances. Keep slots 1–2 free of character faces. UX: Arjun is mentor at 3, authority at 4; Noah briefly appears through prototype work at 5 and returns as the rival at 18–20; Samira is the senior at 12, introduced through review; Amina is the peer needing help at 24, introduced through keyboard testing. Food Scientist: Ren mentors at 3–4; Imani is a brief rival cameo through the trial at 5 and returns at 18–20; Yuki is senior at 12 through tasting; Luis is peer needing help at 24 through a missing-record task. Create one canonical solo first appearance per person, then follow-ups; no future cast cameos or group portraits before everyone is introduced. Mentor recurs; any rival's opposition needs a story reason. Log these cast identities/relationships for future levels, but build Level 1 only and never imply an unimplemented unlock. Verify every scene against the ledger.

APPROVED NURSING EXCEPTION - IMAGE ONLY: Registered Nurse is a separately vetted and approved game. Keep the original script locked in `src/components/play/rn-level-1-v2.ts` (restored from `ff4b97e`): 36 runtime beats across 55 script screens, ten scored decisions at ±5, two applied practice decisions, matching/vocabulary/rapid/ranking/pick interactions, midpoint/final review and original endings. Retain its original seven-card trailer and six-rung ladder. Do not make Nursing 29 beats or seven decisions. For this approved game, do not change its script, questions, answer keys, score, interaction, reviews, endings, trailer or ladder. Change only images and face chips. Compare all gameplay data to the approved source and verify art against each exact script screen.

For all careers, research entry-level work from primary sources and record title, URL, fact supported, role authority and limits. Create a prestigious, fictional project with a clear deliverable and honest junior authority. Keep optional career education outside gameplay. Avoid fabricated clinical readings, dosages, thresholds, legal/technical rules, salaries and release approvals. One small trial proves only its observed result.

Write short American English: one task and one instruction, with no repeated title, question, graphic heading or operation prompt. Use story card order title → graphic → description → CTA. Keep questions self-contained and answerable with the graphic removed. Supporting work graphics are optional, native, minimal text and read-only. Use meaningful visible good/bad states when relevant: for a UX save-action task, show a buried Save under long gray copy, then show the improved screen with Save prominent. The question itself supplies the evidence. No dense charts, hidden clues or extra controls.

Before image generation load the three full approved reference images linked in SOP v2.3. Apply `character-art-prompt.txt` and `background-art-prompt.txt` together via `art-master-prompt.txt` for complete opaque scenes. A reference name or PDF text alone is insufficient. Do not interpret luxury as photographic materials or architectural visualization. Match cast presence, emotion, action and time to each approved screen. Crisis scenes have no misplaced smiles; an alarmed patient can be alone if Rosa is elsewhere. Use fixed canonical identity per character. Keep older Eleanor (60) and Sofia (67) visibly and consistently older. For the Black cast, make one canonical update one shade darker and propagate it to every scene and face chip, without crushing shadows into black. Blonde hair uses no more than four broad solid masses and at most two internal hairlines.

Generate dedicated landscape and portrait compositions as needed. Each finished scene fills its intended viewport aspect, with clear HUD and dialogue bands and intact faces. No runtime zoom/crop, blurred side-fill, black bars or cropped characters. Do not assemble sprites or foreground player arms. Use luxurious ivory, walnut and brass architecture with selective flat anime environment detail, not photorealism.

Keep gameplay panels consistently centered across scenes; never shift them left or right to protect a face. Compose each art orientation around the fixed centered HUD/question/dialogue footprint. Success uses the shared IB monogram/CareerSeal, never a plain trophy.

For Nursing, preserve the established lake, red-roof houses, trees and green hill outside; use plausible window/practical lighting. Map every image to the script's actual cast, emotion and time. Maintain work surfaces required by the approved story, such as ECG, badge, call-light board, wristband and reports.

Integrate with shared controls and play the full new-career game through pass/fail, checkpoint, second act, final, retry and restart. Test the 0/7 progress start and increments separately from score. For RN image-only changes, compare every gameplay field against the approved source and validate all 36 runtime beats/55 screens' art mapping. Test desktop/phone art with no clipping or side bars. Run relevant validators, tests and production checks; record exactly what ran and what remains unverified. AI repairs and integrates without a human intermediate approval gate; human QA is for the assembled result.

Deliver the playable build, source-backed brief, script and keys, task/scene coverage, cast/room ledgers, prompt and asset records, screenshots, complete-game QA results and open issues. Do not claim fresh generations guarantee identical pixels.
```

## Appendix B. Copy-ready character and environment art prompts

### B1. Required reference images

APPROVED REFERENCE PACK — LOAD THE IMAGES BEFORE GENERATING

UX Designer: https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/ux-approved-work.png
Food Scientist: https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/food-approved-work.png
Registered Nurse: https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/nurse-approved-corridor.png

Open/download these actual images and inspect them. A PDF thumbnail, game name, URL string or written description alone is not a visual reference input. Pass the selected downloaded image files to the image tool as reference images for EVERY generation and edit. If the tool cannot retrieve them, obtain the files before generating; do not silently substitute a remembered anime style. For this documentation, all three anchor drawing and detail level; none supplies a new career's character identity. Choose one primary full-scene reference for a batch and keep it fixed. Include canonical character and room images for follow-up scenes. Do not promote an unreviewed generated image into the style master.

### B2. Character drawing

```text
CHARACTER DRAWING PROMPT — USE WITH THE ENVIRONMENT PROMPT

Inputs: {PRIMARY_APPROVED_SCENE_IMAGE}, {CANONICAL_CHARACTER_IMAGES}, {CHARACTER_ID}, {AGE}, {ETHNICITY}, {SKIN_BASE_AND_UNDERTONE}, {EYE_COLOR}, {FACE_SHAPE}, {HAIR_SILHOUETTE_AND_TEXTURE}, {OUTFIT}, {EXPRESSION}, {ACTION}, {SCENE_LIGHT}.

Draw {CHARACTER_ID} as a hand-drawn 2D television-anime character, matching the actual attached UX Designer / Food Scientist / Registered Nurse reference in facial construction, contour weight and color separation. Keep the same drawing simplicity at final game size. Use clear expressive anime eyes with a simple iris and one small catchlight; a small nose mark and short mouth line; a clearly drawn jaw and chin. No painted lips, modeled cheekbones, realistic skin texture or comic-book hatching.

Use a flat skin base and one broad, clean-edged shadow shape. Let the scene's light tint the lit and shadow colors without repainting the person's complexion. Preserve the canonical face shape, eye color, undertone, hairline, hair length, texture and outfit exactly across scenes. Keep older people visibly older through consistent facial proportions, restrained age lines and posture. Diversity comes from the cast ledger; never use ethnicity as a shortcut for identical faces or eye colors.

Group hair into about four to six large silhouette masses, adapted to its texture. Add only the few interior divisions needed to read the hairstyle. One shadow family and at most one restrained highlight band. Blonde hair stays just as simple as dark hair. No individual flyaways, strand-by-strand highlights, glossy ribbons or dozens of sharp locks. Use a few structural garment folds, with flat fabric colors and a single shadow family; no fabric weave, metallic shine on skin or airbrushed body modeling.

Expression and posture follow {EXPRESSION}/{ACTION}; vary them when the story calls for it. A colleague addressing the unseen player looks toward the camera. Observe a real conversation from the player's viewpoint when characters address each other. No visible player body or long foreground arms. Match light direction and time to {SCENE_LIGHT}.

This describes the character inside one complete scene. Do not output a detached sprite, transparent cutout, bust pasted over furniture, character sheet or isolated portrait unless explicitly requested for an internal identity reference. Clothing and anatomy continue naturally behind real occluding objects. Keep the face clear of the actual HUD/dialogue mask.
```

### B3. Environment drawing

```text
ENVIRONMENT DRAWING PROMPT — USE WITH THE CHARACTER PROMPT

Inputs: {PRIMARY_APPROVED_SCENE_IMAGE}, {CANONICAL_ROOM_IMAGE_OR_LAYOUT}, {CAREER}, {ROOM_ID}, {ROOM_FUNCTION}, {REQUIRED_WORK_ITEMS}, {MATERIAL_PALETTE}, {FIXED_WINDOW_VIEW}, {TIME_OF_DAY}, {LIGHT_SOURCE}, {CAMERA}, {VIEWPORT_ASPECT}, {HUD_DIALOGUE_MASK}.

Paint {ROOM_ID}, a working {ROOM_FUNCTION} for {CAREER}, in the same illustrated 2D anime scene as the attached approved reference. Match its drawn edges, simplified material treatment and broad light shapes. Perspective and attractive architecture may be precise; surfaces must still read as painted shapes. Do not increase realism just because the brief says cinematic, expensive or luxurious.

Show luxury through deliberate design: generous proportions, strong circulation, beautifully framed windows, built-in storage, coordinated furniture, a restrained material palette and a few well-placed statement details. Keep the actual work function credible: a food-development lab has suitable benches and storage; a design studio has design workspaces; a hospital retains clinical circulation and equipment. Never replace a workplace with a generic hotel lobby.

For {MATERIAL_PALETTE}, draw each material using a base color, a broad shadow and a few necessary accents. Stone is a pale color field with sparse large vein hints, not a texture map. Walnut is warm painted panels with only a few grain marks. Brass is a muted flat accent with a narrow highlight. Glass uses a light tint and selective drawn reflection. Floors have soft, low-contrast light shapes, not mirror images. Group foliage into painted leaf masses. Show distant buildings as simplified silhouettes and window groups, not hundreds of sharp windows. Avoid pores, wood-grain maps, tiny bevels, product-render metal, repeated micro-details and razor-sharp reflected objects.

Use a clear foreground, middle ground and background. Reduce contrast and detail with distance through color and edge control; do not simulate a camera's shallow depth of field or blur the characters. A few focal props may be clearer than the room. Keep the environment's surface detail subordinate to the characters and compatible with their flat cel shading. Do not reduce richness by making the room empty: use strong design and a small set of purposeful objects.

Light follows {TIME_OF_DAY} and the actual {LIGHT_SOURCE}. Paint broad window-light patches and clean shadow shapes. Gentle light shafts are allowed only along a plausible path from an open window, glazing or visible skylight; keep them subtle and off faces. Closed opaque doors do not emit sunlight. Night uses practical lights or moonlight rather than golden sunbeams. No global bloom, glowing fog, HDR exposure, lens flare, wet mirror floors, ray-traced reflections, photographic material textures, 3D render or architectural-visualization finish.

Preserve canonical walls, doors, windows, furniture, floor pattern and {FIXED_WINDOW_VIEW}. Change only what this beat authorizes. A time variant relights the same room and outside view; it does not redesign either. Use the requested camera without teleporting the windows or inventing a skyline. Buildings may differ by career but their exteriors must agree with the interiors.

Compose directly for {VIEWPORT_ASPECT} using {HUD_DIALOGUE_MASK}. Keep important faces and actions in its clear region. Fit the full image to that viewport without black bars, blurred side extensions or runtime reframing. For another aspect ratio create a deliberate alternate composition with the same identities and geography.
```

### B4. Complete-scene assembly and rejection checks

COMPLETE-SCENE ASSEMBLY AND ACCEPTANCE

Combine the character and environment directions in ONE generation, with both reference inputs attached. Output one opaque image containing the specified cast, room, furniture and shared light. A people-free establishing shot uses the same environment module and reference pack. Separate prompts describe separate responsibilities; they do not authorize sprite/background compositing.

Before accepting, compare the output beside the primary approved image at the same displayed game size. Check (1) anime facial construction, (2) hair masses rather than individual strands, (3) flat skin and clothing shadows, (4) drawn material planes instead of photographic surfaces, (5) the same character identity and visible age, (6) canonical room/window continuity, (7) plausible shared light, and (8) clear HUD/CTA space. Inspect both faces and room surfaces at full resolution too. Reject and regenerate or edit if any fail; do not call higher realism an improvement. Keep the approved reference attached during repair, name the failed region and preserve the correct regions. Record prompt, reference IDs and selected output. This reduces drift; repeated fresh generations cannot guarantee identical pixels. Reuse saved accepted pixels for exact repeats.

Suggested repair: “Keep the room layout, camera, people and lighting fixed. Repaint the environment to the attached approved anime reference's material simplicity: broad painted planes, sparse texture, muted reflections. Simplify hair to grouped masses and one shadow family; preserve each face and palette. Do not add realism or extra detail.”

Filled scene brief example: “New junior civil engineer; mentor reviewing a drainage sketch in an aspirational engineering studio at 9 AM. Attach ux-approved-work.png as the drawing/detail master, plus the approved mentor and room references. Character: canonical middle-aged Japanese male, short grouped black hair, brown eyes, focused explanation toward player. Environment: ivory painted wall planes, warm timber panels, matte desk, a few drawing sheets and a simplified river view. Pale morning light enters the actual left windows; no evening gold, mirror floor or photographic textures. Apply both modules unchanged; only career, action, identity and room fields vary.”

## Appendix C. Copy-ready native work-graphic prompt

```text
OPTIONAL NATIVE WORK GRAPHIC

Career / script screen: {CAREER, SCRIPT_SCREEN_ID}
Project: {PROJECT}
Work surface and state: {REAL APP, MESSAGE, SHORT NOTE, LABEL OR RELEVANT MONITOR}
Purpose: {SCENE CONTEXT OR TASK STATE}
Source, authority and limits: {PRIMARY SOURCE / FICTIONAL TRAINING DATA}
Implementation: {SHARED NATIVE RENDERER / TOKENS}

Create a small optional native context visual for a real entry-level work surface. It adds atmosphere or shows a relevant good/bad UI state; it is never a required evidence source or second task. Use primary-source research and identify any fictional data. If nothing relevant helps, omit it.

Keep gameplay panels centered and consistently positioned. Do not move the UI sideways to fit this graphic or protect a character; fit the artwork and optional graphic within the fixed layout.

For UX examples, show the actual relevant states. A poor state may bury a Save action under long gray description lines; the improved state makes Save prominent. Keep the important visual difference legible at game size. The question text still states the task and evidence.

For story cards, keep order title → graphic → description → CTA. Place the optional visual between title and description, never below the CTA. Keep around 6–14 visible words, concise labels, whitespace and clear hierarchy. Use relevant screen states; avoid generic filler, dense graphs, tables, paragraphs, duplicated instructions, decorative equipment and fabricated readings.

The game question contains all answer facts and remains answerable if the graphic is removed. No hidden clues, independent buttons/tabs, typing, reset, mandatory exploration or embedded prototype. Only actual game controls interact. Use native HTML/CSS/text, semantic tokens and existing shared renderers. Provide a short text equivalent and test legibility/focus on desktop and phone.
```

## Appendix D. Copy-ready work-graphics research prompt

```text
Research authentic work surfaces for {CAREER}, an entry-level role, and {PROJECT}.

Use primary sources: official standards and regulators, government sources, professional bodies, first-party product documentation, manuals and official training material. Record source title/URL, the fact it supports, role authority, date and limits. Separate researched facts from fictional training values.

Select only a few optional, native context graphics that fit the actual scene. They may show a relevant UI state. For UX, one useful bad/good pair can show Save buried below long gray copy, then Save promoted to a clear action. Use the actual work surface and keep the important state visible; generic data does not help. For Nursing, research and preserve only the approved screen context (such as ECG, badge, call light, wristband or report) needed by each locked script screen. Never add unsupported readings or change the Nursing script.

Keep the gameplay UI centered and fixed across scenes. Never shift it left or right to protect a face or fit the graphic; compose the scene around the standard centered HUD and dialogue footprint.

Story-card order is title → graphic → description → CTA. Keep graphics concise at about 6–14 visible words. They are optional context, not task instructions or required evidence. The game question supplies all evidence and stays answerable without the graphic. No dense graphs, hidden clues, fabricated data, independent interaction or extra focus targets.

Save source facts, authority/limits, scene mapping, concise visual brief and why the graphic helps. Include a proof that removing it does not change the question's answerability. Implement with `artifact-master-prompt.txt`. Test screen order, legibility and focus at desktop and phone size.
```

## Appendix E. Approved art-style references

The three current game scenes are embedded in this PDF and available at full resolution. They anchor character construction and the shared illustrated detail budget, not new character identity.

- [UX Designer](https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/ux-approved-work.png)
- [Food Scientist](https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/food-approved-work.png)
- [Registered Nurse](https://dreamari-career-art-comparisons.chanduq.chatgpt.site/documents/references/nurse-approved-corridor.png)

## References

- Nielsen Norman Group, [Usability Testing 101](https://www.nngroup.com/articles/usability-testing-101/).
- Nielsen Norman Group, [Task Scenarios for Usability Testing](https://www.nngroup.com/articles/task-scenarios-usability-testing/).
- AHRQ Patient Safety Network, [Handoffs](https://psnet.ahrq.gov/primer/handoffs).
- The Joint Commission, [Two Patient Identifiers - Understanding The Requirements](https://www.jointcommission.org/en/knowledge-library/support-center/standards-interpretation/standards-faqs/000001463).
