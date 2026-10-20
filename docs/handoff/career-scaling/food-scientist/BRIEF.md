# Food Scientist · Level 1 QA candidate

AI-authored draft, 20 October 2026. Human and professional QA pending.

## Assignment and authority
Catalogue ID `food-scientist`; world **Farming, Animals & Nature** (existing catalogue mapping). Fictional employer Sprout Lab. Audience 13–14. Player: Junior Food Scientist working under Kiran Rao (product development scientist). Investigate an oat snack that breaks during handling; deliver a recorded comparison and a supported next-test recommendation to Mei Tan (quality lead). Only the supervisors authorise lab work/tasting/further studies. No product release authority is given to the player.

Success: a testable question, fair controlled comparison, traceable records, sensible sample holds and a recommendation within the evidence. Poor work can make a comparison uninterpretable or expose someone to an unchecked sample; the game teaches escalation without inventing safe doses, process temperatures or shelf-life limits.

## Scope
Built: one 38-beat Level 1, ten decisions, seven scored interaction types, unscored practice, midpoint after five decisions, shared recovery and terminal outcomes. No new gameplay, scoring or graphic renderer. Nine native work graphics use existing notes/flow primitives. No arbitrary timer. Scene art uses complete opaque images with same-scene face crops; audio intentionally silent except shared interface sounds and authored voice blips. `qaSkip` is a demo QA shortcut. The passing ending labels the next project as planned; replay remains available from the shared HUD restart control.

Outcomes: frame a testable food-quality question; distinguish observation from explanation; plan and interpret controlled trials; protect sample identity and tasting readiness; communicate limits and next work.

## Cast and geography
Kiran: 38-year-old Indian man, medium-brown skin, brown eyes, short black hair contained in white hairnet, clear glasses, restrained stubble, closed white coat over teal shirt, navy trousers. Mei: 54-year-old Chinese-Singaporean woman, warm light skin, rectangular face, dark eyes, grey bob fully covered by white hairnet, clear glasses, closed white coat over plum top, charcoal trousers. AI-selected references are not human-approved assets. Age/style/identity consistency require human QA.

Lab: left windows facing pale brick courtyard and a mature tree; sage cabinetry, stainless island on right, balance near right foreground, texture tester rear right. Neutral morning light throughout. Different cameras deliberately show weighing, handling observation, records and testing. Task shots use mentor voice-over and task eyeline. Conversations address the camera; no player stand-in. Exact reuse is limited to unchanged moments. New generations are not represented as pixel-identical.

## Fictional project data
`food-scientist-project.json` owns the 100 g teaching trials and handling counts. A: oats 60 g/binder 30 g/seeds 10 g, 7/10 broken; B: 55/35/10 g, 2/10 broken. This is one planned composition contrast replacing 5 g oats with binder, not independent proof of a binder effect. Other process/test conditions are held the same; repeat batches remain unrun. Recipes are not validated for consumption. Sample C is held because its ingredient/allergen record is incomplete. No numerical food-safety claim is taught.

## Later levels · unbuilt
2. Repeatability study: repeated batches, variation and disagreement between measurements.
3. Process scale-up: compare bench and pilot evidence, investigate a changed mixing process under supervision.
4. Product review: integrate packaging, sensory and quality-study records; communicate conflicting findings and remaining risks.
These are learning projects, not guaranteed promotion titles. No placeholder levels are selectable.

## Source ledger · accessed 20 October 2026
- IFT, Careers in the Food Sciences: interdisciplinary role, product development, physical/chemical/microbial properties and sensory science. https://www.ift.org/advance-your-career/find-a-job/careers-in-the-science-of-food
- FDA, Food Allergies: allergen reactions, inadvertent cross-contact and the need for controls. U.S. context; this game does not teach a legal label rule or safe threshold. https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies
- NIST/SEMATECH e-Handbook, One variable at a time: controlled contrast and explicit limitations when factors interact. This introductory trial does not claim to optimise a formulation or identify all interactions. https://www.itl.nist.gov/div898/handbook/pri/section2/pri212.htm
- Penn State sensory resources located; full principles page returned 405. Do not treat it as verified detailed support. Sensory panel method below is an explicit fictional supervisor-approved protocol, not a universal professional standard.
- Shared engine implementation and career SOP v1.3 govern UI/scoring. No salary, employment odds or credential facts are introduced.

## Assumptions and review gaps
The fictional panel protocol stipulates neutral sample codes, consistent serving conditions and independent responses. A/B have been cleared by Mei in the story; C has not. No actual food is prepared or tasted. Shelf life is unstudied. Human professional review should assess authenticity and learning fit; no statistical significance is claimed from ten pieces.

## QA routes
Local: http://localhost:3081/play/food-scientist
Hamburger: Food Scientist · QA draft. Excluded from normal Play hub while QA is pending.
Direct beats: `?screen=FS1-07` first decision; `?screen=FS1-MID` midpoint; `?screen=FS1-REVIEW` terminal review. Exact beat IDs and coverage are in the screen map.
Shared demo currently starts fresh on reopen, so Finish Later is omitted. Resume is not represented as implemented for this candidate.

Report human feedback with route/beat, observed behaviour, expected behaviour and severity. Suggested review: clarity of the formulation contrast; record/tasting authority; whether evidence is readable on a phone; anime drawing and cast/room continuity; whether the work feels like food science.
