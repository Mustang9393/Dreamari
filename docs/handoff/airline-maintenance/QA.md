# Airline maintenance v2 QA — 2026-10-23

Canonical route: `/play/aviation-maintenance-technician?v=2`.

## Automated checks

Final `npm run build -- --webpack` passes compilation, TypeScript and prerendering. Existing middleware deprecation warning remains. Career validator: 439 assertions, zero errors, 29 beats, seven scored decisions, 28 routes. Regression suite: 32 passing tests across airline, existing aviation, version routing and work evidence. Scoped lint and 508-token validation pass. Logs are in `qa/`; protected gameplay hashes confirm unchanged IB, RN and existing aviation source.

## Browser evidence

Real local production UI at 127.0.0.1:3113 through its standard access gate, without score injection.

- Full desktop passing traversal: all 29 beats, seven passed decisions, final 92; rapid passes with 3/4; midpoint 74 continues; Replay resets to 50 and 0/7.
- Full phone nonpassing traversal at 390×844: wrong choices, two practice misses and targeted hint, completed pairs retained, corrected practice unscored, actual unanswered 45-second timeout, correct next decision with fresh feedback, failed midpoint continuation, ranking submission, final 20, Try again resets to 50 and 0/7.
- Final targeted rapid checks after the last feedback edits: timeout reports “0 of 4 correct. Time ran out. Unanswered items count as incorrect.” with 44 and 1/7. Double-clicking a correct answer records it once; four correct answers yield actual 4/4 summary, 56 and 1/7.
- Final version switch: v1 original First-Year Technician with five decisions; v2 Aircraft Support Mechanic with seven decisions. HUD and start screen agree.
- Final portrait scene sources load at 390×844 with no horizontal overflow. Ranking Submit is visible in the viewport; the matching panel scrolls to all four pairs.

The full passing desktop run preceded final scene namespace integration. The complete nonpassing phone run used integrated v2 portrait art. Final production build and targeted rapid/version checks include the last timeout summary, immediate answer guard and quoted matching hint. Early desktop screenshots record gameplay and may show the earlier art selection. `browser-run-transcripts.json` preserves run evidence; screenshots document individual states.

## Scope limits

No aircraft-specific repair procedure is taught. Cross-browser hardware, screen-reader usability, formal student comprehension testing and licensed maintenance-professional curriculum review were not performed. Readability is diagnostic. Deployment status is checked separately after the main push.
