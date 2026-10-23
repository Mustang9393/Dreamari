# The First Airline Shift

Career: Airline Maintenance Technician. Level 1 starting role: Aircraft Support Mechanic.

Canonical route: `/play/aviation-maintenance-technician?v=2`. The existing aviation tile defaults to the original v1. Start-screen and HUD v2 switches select this airline chapter. The direct `/play/airline-maintenance-technician` URL is also a review alias. The older first-shift review alias retains its previous chapter.

Built from the user's Dreamari Career Simulation Master SOP v2.6, dated October 23, 2026. The user then explicitly requested: "push to main udner v2."

## Experience

A first supervised week at fictional Gannet Regional Airlines. Prepare a short finding brief for a regional passenger aircraft: use current instructions, record a visible concern, flag a kit-label mismatch, ask the mentor to reorganize unfinished work, and help the incoming team. The mentor and authorized airline staff retain all diagnosis, repair, eligibility and return-to-service decisions.

The researched entry route is an airline Aircraft Support Mechanic, rather than a universal "intern." Delta's first-party career description supplies an actual support-mechanic pathway; FAA/BLS and air carrier manual/training sources bound the work. Gannet is fictional and is not endorsed by any real airline. No aircraft-specific maintenance procedure or technical tolerance is taught.

## SOP mapping

Exactly 29 runtime beats, seven scored decisions at 6/9/11/15/20/22/26, four term cards, four unscored applied matches, four rapid items in one 45-second allowance, midpoint after decision four, and final ranking/review. Everyday vocabulary is taught with familiar examples before practice. The substantial student-text sample estimates grade 5.27 using the recorded heuristic; the novice walkthrough is a separate author review, not a comprehension certificate.

Reputation starts at 50; each decision gives +6 or -6 once. Progress separately starts at 0/7. Midpoint threshold is 68; final threshold is 85. Perfect completion is 92; one failed decision produces 80. The rapid round passes at three of four correct. Practice never changes score or progress. Optional repair credit is disabled so full replay/retry preserves the fixed score contract. Only Level 1 is playable.

## Art and shared controls

Twelve complete opaque scenes: six landscape paintings and six independently composed portrait companions. Two people-free establishing scenes; Sora first appears at slot 3, Caleb at 5, Elena at 12 and Priya at 24. The new airline scene IDs use the unique `al-` namespace because the global scene registry must not overwrite them with older `af-` images. The validator now checks the actual global runtime lookup.

The built-in image-generation tool used the actual approved UX scene as its fixed primary style reference, with all three supplied approved scenes inspected. Full room and cast references guided follow-up scenes. First textured/reflected-floor candidates were rejected and repainted as simpler matte planes. No runtime character sprites or separate person overlays are used. Face chips are UI thumbnails derived from the selected complete scenes.

The existing matching control has an opt-in inline correction acknowledgement. Correct pairs remain matched; repeated misses receive a targeted hint; the fully corrected board is acknowledged before it advances directly. Timers are cleared on unmount, and immediate duplicate pair submissions are ignored. Existing first-attempt scoring for other games is unchanged. Rapid rounds optionally show actual totals and distinguish timeouts; an immediate duplicate-answer guard prevents repeated input before render. Other games retain default feedback. No new interaction component, color palette or music was added.

## Inspectable deliverables

- `SCRIPT.md` and `script-and-answer-key.json`: complete script, controls, answers and feedback.
- `research-and-task-contracts.json`: primary sources, supported facts, limits, entry role and all seven task contracts.
- `continuity.json` and `library-cast-context.json`: cast entrance and continuation ledger, room geography, library context.
- `prompts-and-selected-assets.json` and `selected-assets.json`: exact prompt/reference records, generated-original paths and selected-file hashes.
- `reading-and-novice-review.json`: actual sample, readability method, jargon and novice checks.
- `qa/` and `QA.md`: actual checks, screenshots and unverified scope.

Reproduce in a compatible Dreamari checkout using the package-lock dependencies, `npm run build -- --webpack`, then `npm run start -- --hostname 127.0.0.1 --port 3113`. The standard preview access gate is preserved. This story uses bundled local data and has no new API or database dependency.
