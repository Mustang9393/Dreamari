# Dreamari career game production SOP

Version 1.6 · 21 October 2026 · AI builds; humans QA.

Turn a career name into a complete, playable Level 1 using the vetted Investment Banking Level 1 experience. Career facts, projects, people and artwork change. The underlying player, story sequence, scoring, feedback, introductions, checkpoint and question patterns do not get reinvented.

## 1. Authority and required inputs

Read the current user feedback, AGENTS.md, HANDOFF_INDEX.md, AI_HANDOFF.md, the shared player/types/scoring, and `src/components/play/ib-level-1-v2.ts`. That IB level is the master for gameplay and sequence. UX is the primary character DRAWING reference, not a gameplay template. Nursing supports contextual evidence graphics. Do not alter vetted IB, Nursing or Aviation to make a new career fit.

Only the career name is required from the human. The AI researches, writes, designs, generates, integrates, tests and repairs the game. Human involvement is QA of the finished result. Do not ask humans to author a script, scene list, questions, graphic briefs or intermediate assets. Infer sensible defaults, record them, and build one complete Level 1 unless more levels are requested. Mark later levels as planned, not built.

Use these prompts together:

- `game-build-prompt.txt`: execute this workflow.
- `work-graphics-research-prompt.txt`: research the actual work before selecting supporting graphics.
- `artifact-master-prompt.txt`: relevant, compact READ-ONLY graphics.
- `art-master-prompt.txt`: complete anime scene art and identity locks.
- `ib-level-1-template.json`: explicit source-to-slot contract, extracted from IB.

The user’s latest requirements override older SOP editions. In particular, the old ten-question pilot, extra prototype/recipe controls and tabbed supporting graphics are superseded. Historical examples are not current instructions.

## 2. IB Level 1 is the gameplay master

Inspect the actual implementation, not a memory of IB. The current reference has 29 authored beats, seven scored decisions, four-term flips and an unscored matching practice. The first scored decision is screen 6. Keep its order and purpose for new Level 1 games:

| Slots | Narrative job | Existing pattern |
|---|---|---|
| 1–2 | Arrival, prestigious assignment, clear stakes and deadline | Intro cards |
| 3–5 | Mentor, authority/ladder, other junior colleagues | Character and intro cards |
| 6 | First meaningful career decision | Choice |
| 7–8 | Terms needed for the next work; safe practice | Flips, unscored match |
| 9 | Apply the concepts in short work situations | Rapid block, one scored decision |
| 10–11 | One task rule, then use it | Card, choice |
| 12–15 | Meet reviewer, understand authority, inspect evidence | Character cards, document choice |
| 16–17 | Midpoint review, then second-act transition | Existing act/review cards |
| 18–20 | Peer motive, work conflict, professional response | Character/intro, choice |
| 21–22 | Deadline change, ask for direction | Intro, chat choice |
| 23–26 | Update, colleague needs help, clear priorities | Intro cards, rank |
| 27–29 | Mentor observes, project closes, final review | Intro/chapter, review |

Use IB’s shared logic: start at 50, seven decisions at the level’s fixed ±6 setting, no strikes, midpoint after four scored decisions with threshold 68, final pass at 85. A perfect run reaches 92. Practice matching does not score or produce a verdict. Feedback is the player’s established tier/reputation flow. Preserve existing option locks, correction, shuffle, touch/keyboard and sound behavior. Do not build a second score engine or borrow the older ten-decision pilot policy.

The source settings and sequence are validated against IB. Technical situations must fit the career: a UX blocker, a lab-record gap, an inspection discrepancy or another real task. Do not copy IB’s banking facts, salary, hours, return-offer scarcity or inappropriate authority into a different profession. A peer needs a work-related motive; do not make every career reuse the same theft story.

Use existing shared layouts, including options, document and chat choices, rapid, matching and rank. Visual differences belong in content and read-only evidence. Do not add custom gameplay to meet a question-variety quota. The familiar IB formats already provide variety. If a task genuinely cannot fit a slot, record the mismatch and find an appropriate career task before changing the master contract.

## 3. Project, stakes and transitions

Choose an exciting assignment at a credible, prestigious fictional organization. Give the player a visible deliverable and an important review: for example, a sportswear launch demo, a music platform release or a product trial for a major client. Explain the client goal, deadline, player authority and consequence in the opening two screens. Fictional brands may have prestige without pretending to be a real company or claiming an endorsement.

Introduce the mentor and fellow juniors before their first decisions. Give each recurring person a job, personality, goal and later contribution. Include collaboration and reasonable competition. Supporting characters must do meaningful work, not stand in for the player or appear once to satisfy a diversity count.

Every activity has a narrative reason. Teach terms to prepare for an approaching review. Give research a clear user task. Show a documented blocker before asking how to handle it. Carry the state forward: observed → proposed change → test → remaining check → retest. Never claim the player did the right thing after a wrong choice. Independent NPC work may advance the story, but its owner and result must be clear.

A small test supports only its measured result. Do not imply universal usability, safety, shelf life or release approval from a single trial. Keep unknown and pending states explicit.

## 4. Eighth-grade American English and a strict copy budget

Write for a US eighth grader. The target is clear comprehension, not a reading-score badge. Use short sentences, common words, active voice and American spelling. Explain necessary career terms in plain language when first used. Use concrete actions and objects; avoid jargon piles, abstract instructions and long disclaimers in student-facing UI.

Move general “What is this career?” education into the optional separate lesson, titled “What Is a [Career]?” It must be skippable. Do not make students pass definitions before starting. Reach the first meaningful decision within 3–6 story screens; this template reaches it at 6.

Authoring limits:

- Title: normally 3–8 words; maximum 12.
- Story body: normally one sentence; maximum 30 words.
- Setup or question: maximum 24 words; one clear instruction.
- Answer: normally 4–12 words; maximum 16 unless essential evidence needs more.
- Feedback: one short, option-specific explanation, normally no more than 24 words.
- Supporting graphic: compact labels and necessary evidence, normally no more than 60 visible words. No paragraph repeated from the story.

Do not show “Sort into buckets” and “Sort the notes” together. Choose one instruction; let the existing control teach operation. Do not repeat a graphic’s data in a paragraph above it. The question must still include the task and constraint needed to choose objectively. Avoid answers that are obvious only because they are longer or more moral-sounding.

Run word-budget checks and a reading-level estimate as diagnostics. Manually review the actual screens for clear context and vocabulary; fragments and proper names distort automated formulas. Do not claim a certified eighth-grade level or replace student QA with a formula.

## 5. Supporting graphics are read-only

Research the career’s actual documents, software, communications and relevant devices using primary sources before selecting graphics. Save the source URL/title, what it supports, necessary fields/units/state, role authority and limits in `work-graphics-research.json`. Separate verified facts from fictional teaching data. Use official documentation, professional bodies and manufacturer guides; no unsupported clinical, legal or technical limits.

For each beat, save a `work-surface-plan.json` entry: task, supporting graphic or reason for none, source, canonical data path, story state and why it helps. Do not add graphics by quota or reskin another career’s objects.

Use useful decoration/evidence: a concise notepad, project file, report, app screen, wireframe, prototype snapshot, message, relevant phone/radio display or real device reading. Nursing’s ECG demonstrates a contextual monitor, not a generic waveform for other careers. No decorative vector tools, apparatus or sample-food drawings. No invented readings or fake moving metrics.

**No independent interaction inside supporting artwork.** No tabs, clicks, typing, reset, recipe transfers, branching demos, extra tasks or required exploration. All necessary evidence is visible at once. Static app buttons are labels inside a clearly read-only preview, not focusable controls. Actual questions still use the IB game controls; this rule does not remove answering, matching or ranking from gameplay. Only the game owns Continue and Submit.

Use native readable text and data-driven HTML/CSS for values and labels. Use shared tokens and renderers, never career-ID scoring/layout forks. Compact charts encode canonical data accurately. Keep denominators, units and unknown states. Never highlight the answer before selection. Prefer one useful visual and a short question over a dense graphic plus repeated explanation.

## 6. Career ladder and authority

Use IB’s ladder visual structure, populated with truthful career roles. UX: Junior UX Designer → UX Designer → Senior UX Designer → Lead / Principal UX Designer. Show management separately: Design Manager → Director → VP of Design, with a note that titles and tracks vary by company. Do not imply every designer becomes a manager or every level promises a promotion. Food-science roles must likewise distinguish specialist and management progression.

Display the full intended path through the existing ladder plus optional shared branch labels. Mark unbuilt game levels honestly. A project pass is not a real job offer, credential or salary guarantee. Keep progression copy separate from fictional employment outcomes.

## 7. Diverse cast with one identity per person

Use the actual UX drawing reference in `references/ux-character.png`. Preserve flat anime faces, thin contours, large expressive eyes, small nose/mouth marks, simple hair masses, sparse lines and broad cel shadows. Avoid comic-book contours, painted lips, sculpted skin, strand-heavy hair and photoreal materials on people.

Before generating, author a cast ledger with age, role, gender, ethnicity, skin BASE color, shadow/highlight palette, face shape, eye shape and fixed iris color, hair silhouette/part/texture, clothes and identifying details. Include a meaningful range across gender, ethnicity, complexion from very dark through very light, and hair textures. Make people distinct without caricature. Do not infer ethnicity from an image. Do not turn a recent Indian or Japanese lead into a permanent default across the catalogue.

**Identity gate:** choose ONE canonical complete-scene face per character. Make an identity/color reference crop from that scene and supply it to every later shot. Skin base tone, iris color, face proportions, hairline, texture and features are fixed. Different people may have different eye colors; one person must not change eye color between scenes. Do not average references or use each new generation as a new identity anchor.

Lighting changes highlights/shadows, not the underlying complexion. Very dark characters must remain visibly very dark in daylight; do not replace their base tone with amber/tan. Review exposed face, neck and hands together. Side-by-side compare every scene with canonical face/color references at matched size. Reject a scene that changes complexion, eye color, face, hair or ethnicity; repair it before routing it into the game. Record observed PASS / REPAIR / NOT CHECKED, not an invented consistency percentage. Store hashes of each reviewed scene and its canonical face. A changed source or scene invalidates that review and requires comparison again. `scripts/qa/check-character-continuity.mjs <career>` checks those review hashes for the current examples; it does not judge faces automatically. Human QA stays separate.

## 8. Cinematic workplaces and complete scenes

Use complete opaque scenes, not runtime sprites over empty backgrounds. The player is the first-person camera. Characters speaking to the player face the lens. No visible player stand-in. Observed tests may show a participant looking at the task, with a written observation/voice-over reason. Vary character positions, gestures, cameras and rooms where the story changes.

Make workplaces beautiful and prestigious through architecture, proportions, layered depth, fitted joinery, refined materials and city views. Use real professional work zones and believable equipment relationships. A food R&D lab remains functional and cleanable, not a hotel or kitchen. Avoid both plain generic rooms and hyperrealistic archviz. Use selective painted anime detail and restrained reflections; no texture noise, tiny clutter or rendered foliage everywhere.

Record location/camera IDs, room geometry, furniture, windows and exterior landmarks. Keep an established view fixed. Match character/room light direction and time. Optional soft god rays require plausible sun/window/air; no sunbeams at night or fog across faces. Rich rooms must not cause extra detail in faces/hair.

Plan enough shots for arrival, team, work/test, reviewer, peer conflict, deadline, help and close. Reuse a saved file only while the depicted moment/state still fits. A new camera is a new shot with continuity review, not identical pixels. Finish bodies, hands, chairs and floors beneath all UI; a dialogue card must not hide a waist cutoff.

A prompt cannot guarantee pixel identity. Exact reuse requires the same saved file. A scoped edit that claims a pixel lock must pass zero changed protected pixels outside its allowed mask. Otherwise reject the claim/candidate; do not call fresh generation pixel-identical.

## 9. Implement and validate

Author data in the existing player. New Level 1 games declare `generationTemplate: "ib-l1-2026-10-21"`. Validate sequence, practice status, decision count, points and no-strikes against the actual IB source. Keep all career facts and graphics in data. Preserve unrelated games and existing app behavior.

Required checks:

1. Template/score parity, unique IDs, valid keys/skills/progress and reachable midpoint.
2. First decision by screen 6; copy budgets; no duplicate instructions; clear teach/use dependencies.
3. Every chosen answer has a short defensible reason. Each scenario has sufficient visible context.
4. Supporting graphics contain no buttons, tabs, inputs, reset or independent state; data and story state agree.
5. Real game at desktop/phone sizes: welcome, How to Play/ladder, optional lesson, all used formats, wrong/correct feedback, midpoint pass/fail, continue, restart and final outcomes.
6. All-Best and non-passing paths. No recovery branch invented when the IB no-strikes contract disables it.
7. Art scene coverage, every identity/skin/eye/hair check, time/light, physical staging, phone crops and meaningful cast roles.
8. Welcome, tile, trailer, lesson, story, face chips and outcomes all use the selected canonical version. Inspect actual loaded browser sources, not only manifests.
9. TypeScript, scoped lint, tokens check, production build and relevant existing-game smoke checks. Do not claim Windows/Chromebook hardware, image-failure or reduced-motion testing without actually doing it.
10. Keep a clear QA report: passed, failed, not run and pending human review. A structural test is not aesthetic or professional approval.

The demo currently disables resume through DEMO_START_FRESH. Do not offer Finish Later or claim checkpoint persistence without repairing and testing it. Publication follows the user’s existing authorization for the named destination; local preview and live deployment are distinct statuses.

## 10. Handoff and future games

Deliver a playable QA candidate, source-backed brief, IB slot map, script and keys, copy/pacing report, cast and room ledgers, canonical identity/color references, scene/graphic coverage, native artifact data, exact generation prompts, asset hashes, screenshots, actual test results and known limits. Record what is built versus planned.

Feedback becomes a repair and a regression gate in this SOP. The AI owns the work; humans QA authenticity, learning value, fun, usability and visual quality. Do not require the same manually reinvented UX and copy review for each new career. The current UX and Food Scientist rewrites are candidates demonstrating this contract, not proof that hundreds of careers have been tested.
