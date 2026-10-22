# Dreamari Career Simulation Master SOP

**Version 2.1 · 22 October 2026 · AI builds and repairs; human QA reviews the finished game**

This is the shareable production standard for building a complete Level 1 from a career name. The vetted Investment Banking simulation is the gameplay, narrative, sequence, UX and scoring reference. New careers inherit its proven player experience while using their own authentic work, projects, colleagues and varied tasks. This SOP supersedes earlier editions and older exact beat/question lists.

## 1. Goal and decision rights

The human supplies a career name and may add preferences. The AI researches entry-level work, chooses sensible defaults, writes the game, makes scenes and supporting graphics, integrates them, runs it, fixes failures and packages evidence. Do not ask the human to write a script, scene list, question list or image brief. Human review happens on the assembled result. A contact sheet remains useful for internal art QA, but the AI repairs and integrates without waiting for approval of intermediate sheets.

Use current user feedback and repository handoff documents as the latest authority. Read `AGENTS.md`, `docs/HANDOFF_INDEX.md`, `docs/AI_HANDOFF.md`, the shared player/types/scoring, and the current Investment Banking Level 1 implementation. Inspect actual behavior, not a remembered description. Preserve vetted IB gameplay. Do not change the reference game to make another career fit.

## 2. Gameplay, pacing and progress

The vetted Investment Banking Level 1 (`src/components/play/ib-level-1-v2.ts`) is an exact 29-slot template, not merely a pacing reference. Build exactly 29 runtime beats for new careers such as UX Designer and Food Scientist, preserving this sequence of work and interaction types while replacing banking-specific content with authentic career tasks. Slots 1-2 are establishing workplace welcome and stakes cards with no future character faces. The mentor first appears at slot 3; slot 4 establishes their authority and career ladder. Reach the first easy scored choice at slot 6. Keep copy concise for a US eighth-grade reader.

For every career, make the first story image a clear exterior establishing view of the actual workplace; the next establishes its interior and stakes. Shared anime drawing style does not mean shared building design: choose career-appropriate, visibly distinct massing, roofline, facade and material rhythm, and avoid three generic ivory-glass porticos. UX is a restored six-story waterfront red-brick industrial loft with modern ivory/walnut fit-out; Food is a low one-to-two-story sage garden research campus with a sawtooth clerestory roof; RN is a curved eight-story lake-facing patient tower over a rounded clinical podium. Keep each exterior consistent with its interior materials, window grids and geography; preserve RN's established lake-facing view. Use plausible morning light. This adds no beat or people; RN script order remains locked.

### Exact 29-slot IB sequence

**Slots 1–10:** 1 workplace welcome; 2 stakes; 3 mentor introduction; 4 mentor authority and career ladder; 5 brief peer cameo; 6 first easy scored choice (#1); 7 four vocabulary cards; 8 four applied matching pairs as practice, with no verdict; 9 four timed rapid items in 45 seconds, scored decision #2; 10 privacy rule.

**Slots 11–20:** 11 storage-zones choice (#3); 12 senior arrival; 13 senior context and evidence standard; 14 decision authority and ladder; 15 document-accuracy choice (#4); 16 midpoint review at 68, after four scored decisions; 17 short Act 2 transition; 18 returning rival's motivation (not a reintroduction); 19 rival takes credit; 20 private response choice (#5).

**Slots 21–29:** 21 deadline and workload shock; 22 mentor chat about priorities (#6); 23 delivery; 24 peer needs help; 25 her-deadline/your-time contrast; 26 rank a supportive response (#7); 27 mentor notices; 28 completion; 29 final review.

Keep the teaching trace coherent: teach the actual job-specific concepts in slot 7, practice their application with four realistic pairs in slot 8, then apply the same concepts in slot 9. Do not use placeholder terms or unrelated questions. Practice is unscored and has no verdict screen. Preserve the IB question layouts and decision positions: scored choices at slots 6, 9, 11, 15, 20, 22 and 26, with the rapid round at #2 and the final ranking at #7. The scoring contract is reputation 50, seven decisions worth ±6, midpoint 68 after decision four, final pass 85.

Carry the same mentor, rival and senior into planned later levels in a continuity ledger, preserving their names, roles, identities and relationships. Build Level 1 only; do not build future levels or imply a real unlock that the game has not implemented.

### What the previous v2.0 wording missed

The actual IB source does not start with a mentor or force several mentor-only opening beats: slots 1-2 establish the workplace and stakes, slot 3 introduces the mentor, slot 4 explains authority, and slot 5 briefly introduces the peer. Its middle teaches vocabulary, practices with a no-verdict matching interaction, and applies it in a four-item timed round. Its later story turns the same characters and workplace tensions into decisions, checkpoint, support ranking and review. The previous v2.0 wording named a 29-beat count and a few character positions but lacked this exact sequence and learning trace; it also read as a character-introduction schedule rather than work-led scenes. Use the slot contract above as the source of truth.

For these new-career builds, keep the IB score contract: reputation begins at 50; seven scored decisions change it by +6 or -6; no strikes; checkpoint after four scored decisions at 68; final pass at 85. Practice interactions remain unscored. The progress bar is a separate measure: begin at 0 before any scored decision, then show completed scored decisions out of seven (for example, 1/7 after decision one resolves). Do not seed the progress bar or derive it from reputation. The player's score still starts at 50. Preserve the shared player behavior, option locking, correction, keyboard/touch and result flow.

### Approved Nursing exception: image-only updates

Registered Nurse was separately vetted and approved. Its authoritative gameplay is `src/components/play/rn-level-1-v2.ts`, restored from `ff4b97e`. Keep the approved Nursing script locked: 36 runtime beats cover the original 55 script screens, with ten scored decisions at ±5, two applied practice decisions, matching, vocabulary, rapid, ranking and pick interactions, the midpoint review, final review and original endings. Keep its seven-card trailer and six-rung career ladder. Nursing does not inherit the new-career 29-beat or seven-decision template. Never rewrite, shorten, reorder or replace an approved Nursing script, question, answer, score, interaction, review, ending, trailer or ladder to force it to 29 beats. An RN visual refresh changes image fields and face chips only; all other gameplay data must match the approved source.

Follow the exact cast, action, emotion, location and time in each approved Nursing script screen. Do not add people who are absent from that moment. A patient alone during an alarm should look alarmed when Rosa is elsewhere; crisis scenes must not show smiles. Keep required ECG, badge, call-light board, wristband, report and related work surfaces in their approved story states. Keep canonical room geography and the established lake-facing exterior.

## 3. Real work, evidence and educational honesty

Research entry-level work using primary sources: official professional standards, government and regulator guidance, primary organization documentation, product manuals and official training materials. Record each source title and URL, the fact it supports, the role’s authority and any limit. Distinguish researched facts from fictional training data. A fictional prestigious project may create stakes, but must not imply a real company endorsement or career guarantee.

Give the learner an honest role. Introduce a mentor, authority and colleagues only when they contribute to later work. Avoid repeating the same client, missing-record crisis or peer-misconduct plot across careers. Choose a concrete deliverable and a credible project. Explain the goal and stakes without claiming a junior controls decisions outside their role.

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

For a new career, reproduce the exact 29-slot IB template above. Slots 1–2 are workplace welcome/stakes and have no future character faces. Slot 3 introduces the mentor; 4 establishes authority/ladder; 5 is a brief peer cameo; 6 is the first easy scored choice (#1). Slots 7–9 form teach/practice/apply using the same real career concepts: four vocabulary cards, four applied matching pairs as unscored practice with no verdict, then four rapid items in 45 seconds as scored decision #2. Slots 10–15 continue privacy, storage-zones choice #3, senior arrival/context, authority/ladder and document-accuracy choice #4. Slot 16 is the midpoint at 68 after four scored decisions; 17 is a short Act 2 transition. Slots 18–20 are the returning rival's motivation, takes-credit moment and private-response choice #5. Slots 21–23 are deadline/workload shock, mentor priority chat (#6), and delivery. Slots 24–27 are peer needs help, the deadline contrast, supportive-response ranking (#7), and mentor notices. Slots 28–29 are completion and final review. Keep every slot's interaction and question layout. Use one task and one instruction per screen, concise US eighth-grade copy, and role-appropriate evidence.

Slot 1: workplace exterior; slot 2: interior and stakes. Use career-specific distinct massing, roofline, facade and material rhythm, not a generic ivory-glass portico. UX: six-story waterfront red-brick industrial loft; Food: low sage garden research campus with sawtooth clerestory; RN: curved lake-facing patient tower over rounded clinical podium. Preserve established interior materials, window grids and geography. Same anime drawing style, plausible morning light; no extra beat or face.

Keep the IB score contract: reputation 50, seven decisions worth ±6, no strikes, midpoint 68 after decision four and final pass 85. The decision progress bar is independent: starts at 0/7 and advances only when a scored decision resolves. Teach real concepts, practice them, then apply the same concepts; never use placeholders or unrelated questions. Do not shift the slot order or replace it with a generic varied-interaction list.

Introduce cast through the work, not through a succession of introduction cards; put gameplay between entrances. UX: Arjun mentor 3–4; Noah brief cameo 5 and rival return 18–20; Samira senior 12; Amina peer needing help 24. Food: Ren mentor 3–4; Imani brief cameo 5 and rival return 18–20; Yuki senior 12; Luis peer needing help 24. Noah's prototype work, Samira's review, Amina's keyboard test, Imani's trial, Yuki's tasting and Luis's missing-record task trigger their appearances. Show only the person needed for the work in each slot. Do not force extra introduction/follow-up cards. Carry identities/relationships into a future-level continuity ledger, but build Level 1 only and do not imply an unimplemented unlock. Preserve all 29 slots.

APPROVED NURSING EXCEPTION - IMAGE ONLY: Registered Nurse is a separately vetted and approved game. Keep the original script locked in `src/components/play/rn-level-1-v2.ts` (restored from `ff4b97e`): 36 runtime beats across 55 script screens, ten scored decisions at ±5, two applied practice decisions, matching/vocabulary/rapid/ranking/pick interactions, midpoint/final review and original endings. Retain its original seven-card trailer and six-rung ladder. Do not make Nursing 29 beats or seven decisions. For this approved game, do not change its script, questions, answer keys, score, interaction, reviews, endings, trailer or ladder. Change only images and face chips. Compare all gameplay data to the approved source and verify art against each exact script screen.

For all careers, research entry-level work from primary sources and record title, URL, fact supported, role authority and limits. Create a prestigious, fictional project with a clear deliverable and honest junior authority. Keep optional career education outside gameplay. Avoid fabricated clinical readings, dosages, thresholds, legal/technical rules, salaries and release approvals. One small trial proves only its observed result.

Write short American English: one task and one instruction, with no repeated title, question, graphic heading or operation prompt. Use story card order title → graphic → description → CTA. Keep questions self-contained and answerable with the graphic removed. Supporting work graphics are optional, native, minimal text and read-only. Use meaningful visible good/bad states when relevant: for a UX save-action task, show a buried Save under long gray copy, then show the improved screen with Save prominent. The question itself supplies the evidence. No dense charts, hidden clues or extra controls.

Use `art-master-prompt.txt` for complete opaque scenes. Match cast presence, emotion, action and time to each approved screen. Crisis scenes have no misplaced smiles; an alarmed patient can be alone if Rosa is elsewhere. Use fixed canonical identity per character. Keep older Eleanor (60) and Sofia (67) visibly and consistently older. For the Black cast, make one canonical update one shade darker and propagate it to every scene and face chip, without crushing shadows into black. Blonde hair uses no more than four broad solid masses and at most two internal hairlines.

Generate dedicated landscape and portrait compositions as needed. Each finished scene fills its intended viewport aspect, with clear HUD and dialogue bands and intact faces. No runtime zoom/crop, blurred side-fill, black bars or cropped characters. Do not assemble sprites or foreground player arms. Use luxurious ivory, walnut and brass architecture with selective flat anime environment detail, not photorealism.

Keep UI panels consistently centered; never shift UI left or right to protect faces. Compose artwork around the fixed centered HUD, question and dialogue footprint. Success uses the shared IB monogram/CareerSeal, not a plain trophy.

For Nursing, preserve the established lake, red-roof houses, trees and green hill outside; use plausible window/practical lighting. Map every image to the script's actual cast, emotion and time. Maintain work surfaces required by the approved story, such as ECG, badge, call-light board, wristband and reports.

Integrate with shared controls and play the full new-career game through pass/fail, checkpoint, second act, final, retry and restart. Test the 0/7 progress start and increments separately from score. For RN image-only changes, compare every gameplay field against the approved source and validate all 36 runtime beats/55 screens' art mapping. Test desktop/phone art with no clipping or side bars. Run relevant validators, tests and production checks; record exactly what ran and what remains unverified. AI repairs and integrates without a human intermediate approval gate; human QA is for the assembled result.

Deliver the playable build, source-backed brief, script and keys, task/scene coverage, cast/room ledgers, prompt and asset records, screenshots, complete-game QA results and open issues. Do not claim fresh generations guarantee identical pixels.
```

## Appendix B. Copy-ready complete-scene art prompt

```text
DREAMARI COMPLETE ANIME SCENE

Career / script screen and runtime beat: {CAREER, SCRIPT_SCREEN_ID, BEAT_ID}
Story action, cast, emotion and time: {EXACT APPROVED SCREEN DETAILS}
Location / camera: {CANONICAL ROOM AND SHOT}
Viewport: {LANDSCAPE OR PORTRAIT, TARGET ASPECT}
Drawing reference: {APPROVED STYLE IMAGE}
Canonical identities: {FACE/COLOR CROPS FOR EVERY PERSON PRESENT}
Allowed edit: {IMAGE-ONLY CHANGE}
Output: {DIMENSIONS, FILE_ID}

For an approved game, preserve its script and use the exact cast presence, action, emotion, location and time for this screen. Nursing uses the locked `rn-level-1-v2.ts` script: 36 runtime beats across 55 screens. Image and face-chip updates must map to the source scene; do not change text, questions, answers, score, mechanics or endings. A patient alone during an alarm may be alarmed while Rosa is elsewhere. Never use smiles during a crisis. Keep required ECG, badge, call-light, wristband and report surfaces in the exact state needed by the source screen.

For UX/Food, follow the exact cast slots in Section 2 and trigger each entrance through the relevant work. These are not a chain of introduction cards. Put gameplay between entrances; do not insert extra follow-up beats to enforce an artificial spacing rule. At first appearance show one new named person alone. No future cast in slots 1–2 or group shot before every visible person has been introduced. Mentors recur; the rival's motivation makes their later opposition credible. Never change or reorder the locked RN sequence to enforce this new-career template.

Paint one complete opaque anime scene with people, room, furniture and light in one image. No sprites, cutout characters, counter portraits, foreground player arms/hands or unfinished bodies. The player is the camera. A speaking colleague looks toward the lens; an observed conversation may look at its participants.

Gameplay panels stay centered and fixed across scenes. Never move them sideways to protect faces. Compose each orientation around the centered HUD/question/dialogue footprint, keeping those zones clear without cropping any face or person.

Use thin controlled outlines, expressive eyes, a small nose mark, short line mouth, flat base color and one broad cel shadow. Blonde hair has no more than four broad solid masses and no more than two internal hairlines. No glossy strands, painted lips, sculpted cheeks, heavy comic outlines, photoreal skin or 3D. Keep canonical face, skin base/undertone, eye color, age, hairline/texture, outfit and details fixed. Eleanor (60) and Sofia (67) must remain visibly older in every shot.

For the requested Black-cast update, move the cast one shade darker with a single canonical palette change and propagate that update to every scene and face chip. Keep the adjustment consistent across the cast; preserve the skin base in all lighting and never crush shadows to black.

Use luxurious, functional workplace architecture in ivory stone, walnut and brass. Environment detail stays selective and anime-flat. Light comes from plausible windows and practical fixtures. No mirror floors, photoreal textures, bloom, haze, or beams through closed doors. Nursing windows keep the established lake, red-roof homes, trees and green hill.

Generate a dedicated landscape or portrait composition for its target viewport. The scene must fill that viewport at the intended aspect with faces and important characters fully inside frame. Keep the top 20% clear for HUD and bottom 38% clear for dialogue. Never crop faces or use blurred side-fill, black bars or runtime zoom/cropping to fill space.

Record full prompt, source/reference files, selected output, hash and visual review. A hash documents provenance, not identity. Reuse saved files for identical pixels; do not claim a fresh generation guarantees pixel identity. Contact-sheet checks are internal; repair and integrate before final human QA.
```

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

These selected examples anchor the complete-scene anime style. They are approved references, not comparison variants. The PDF embeds labeled thumbnails; full-resolution copies are linked here:

- [UX v3 arrival - character and environment style](../../public/documents/references/ux-v3-arrival.png)
- [Nursing morning - Rosa at the station](../../public/documents/references/rn-morning-reference.png)
- [Investment Banking office - Christina presents](../../public/documents/references/ib-office-reference.webp)

## References

- Nielsen Norman Group, [Usability Testing 101](https://www.nngroup.com/articles/usability-testing-101/).
- Nielsen Norman Group, [Task Scenarios for Usability Testing](https://www.nngroup.com/articles/task-scenarios-usability-testing/).
- AHRQ Patient Safety Network, [Handoffs](https://psnet.ahrq.gov/primer/handoffs).
- The Joint Commission, [Two Patient Identifiers - Understanding The Requirements](https://www.jointcommission.org/en/knowledge-library/support-center/standards-interpretation/standards-faqs/000001463).
