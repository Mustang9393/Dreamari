# Before the Next Flight - Aviation Maintenance Technician, Level 1

Built against the user's `master-sop (1).pdf`, version 2.5 dated October 22, 2026. This is the v2 playable QA simulation in the existing Dreamari player, under the existing aviation game at `/play/aviation-maintenance-technician?v=2`. It does not replace the original aviation, Investment Banking, Nursing, UX or Food scripts.

## The experience

The player starts a first supervised week at fictional Gannet Flight Services. A coastal survey aircraft needs an honest finding brief before qualified staff can decide next steps. The player checks the applicable reference, learns the hangar's language, drafts an observation, compares a kit's identity with its paperwork, handles a credit dispute, asks the mentor to reprioritize open work, and helps the incoming team with its handoff.

Four terms are taught, practiced, then applied: **discrepancy**, **traceability**, **FOD** (foreign object debris), and **handoff**. Other terms are explained in context: certificated mechanic, current maintenance instructions, designated hold area, and return to service. The learner never diagnoses a failure from a rub mark or treats a paperwork mismatch as proof of counterfeiting.

The game selects a US supervised practical-experience pathway. A beginner is not universally an intern or an uncertificated worker; this is one supported route. Sora, an appropriately rated certificated mechanic, is available in person and observes as necessary. The learner assists Sora's check rather than performing an independent required inspection. No aircraft-specific procedure, numeric tolerance, repair instruction or approval authority is invented. The internal finding brief is a draft, not a completed regulatory maintenance entry.

## SOP mapping

Exactly 29 runtime beats. Welcome/exterior at 1, interior/stakes at 2, Sora at 3-4, Caleb at 5, easy choice at 6, four term cards at 7, four unscored applied pairs at 8, four timed checks in 45 seconds at 9, observe-record-flag rule at 10 and application at 11, Elena at 12-15, midpoint at 16, Act 2 at 17, returning Caleb at 18-20, workload and mentor chat at 21-23, Priya and support ranking at 24-26, recognition/completion at 27-28, final review at 29.

Seven scored decisions occupy slots 6, 9, 11, 15, 20, 22 and 26. Controls fit the job: choice, rapid, choice, two-action pick, private-response choice, mentor chat and ranking. Shared player controls, correction behavior and semantic tokens are retained. All answer facts appear in the question; no optional graphic supplies a hidden answer. No extra work-surface graphic was needed.

Reputation starts at 50. Each decision changes it by +6/-6. Unscored matching leaves it unchanged. Progress separately counts 0/7 through 7/7. Midpoint threshold 68 follows decision four; final pass threshold is 85. A perfect run scores 92, and one wrong decision scores 80. Therefore the specified final threshold requires seven successful decisions (rapid applies the shared three-of-four subitem threshold). Retry restarts the full shift; the optional shared +2 repair mode is disabled to preserve this level's fixed +/-6 contract. Only Level 1 is built; the career ladder describes possible roles, not playable unlocks.

## Inspectable files

- `research-and-task-contracts.json`: eight primary sources, supported facts and limits; selected starting role; prerequisites, reviewer, escalation and excluded work; task-specific prior teaching and answer rationales; fictional data.
- `script-and-answer-key.json`: complete script, choices, feedback and keys.
- `continuity.json`: four distinct cast identities, entrances, follow-up slots, planned later continuity and hangar geography.
- `prompts-and-selected-assets.json`: exact built-in imagegen prompts, approved input reference, selected outputs and hashes.
- `qa/`: actual validation reports and screenshots; the QA record distinguishes automated, browser-observed and unverified checks.
- Source art and coverage manifest live in `src/components/play/art/aviation-maintenance-technician-first-shift.json` and `docs/handoff/career-scaling/examples/aviation-maintenance-technician-first-shift-coverage.json`.

Music is disabled for this simulation, including the ending. The user also requested sleeker architecture without hyperrealism: the final paintings use a sculptural canopy, sweeping blue ribs, a walnut-and-glass mezzanine, integrated teal storage, and broad matte planes.

## Sources checked October 23, 2026

- [FAA: Become an Aviation Mechanic](https://www.faa.gov/mechanics/become) - entry pathways and supervised work.
- [14 CFR 43.3](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-43/section-43.3) - supervision and exclusions.
- [14 CFR 43.13](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-43/section-43.13) - maintenance methods and instructions.
- [FAA AC 20-62E Change 1](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-62E_CHG_1.pdf) - replacement-part identity, eligibility and traceability.
- [FAA FOD Program](https://www.faa.gov/airports/airport_safety/fod) - foreign object debris.
- [FAA AC 120-72A](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-72A.pdf) - maintenance human factors and teamwork.
- [14 CFR 43.9](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-43/section-43.9) - maintenance records and approving-person information; the game only drafts internal observations.

- [FAASTeam: Shift/Task Turnover](https://www.faasafety.gov/gslac/alc/course_content.aspx?cID=180&preview=true&sID=526) - communication and unfinished-work handoff.

This local QA build is a career exploration activity. Aircraft release and unfinished technical work remain with authorized staff regardless of game score. No public deployment is implied.

## Version toggle

The existing Aviation Maintenance Technician tile opens v1 by default. The v1/v2 switch appears on both the start screen and the HUD. Selecting v2 starts this SOP simulation; selecting v1 restarts the original game. Version changes clear screen/mode preview parameters so incompatible story positions cannot carry over. Other careers keep their existing artwork switches. The old first-shift review URL remains an alias, while no duplicate aviation tiles appear on the Play hub.
