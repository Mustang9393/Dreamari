# QA record - October 23, 2026

## Result and scope

Playable local QA build: `http://localhost:3100/play/aviation-maintenance-technician?v=2`.

The shared player renders authored Level 1 data through the career route, resolves native interaction outcomes into reputation and a separate completed-decision count, then presents the final review and replay. The data is bundled locally; this feature does not call a new API or external database. Existing demo behavior deliberately starts a fresh run on page load (`DEMO_START_FRESH`); the midpoint's shared "Checkpoint saved" copy does not mean cross-load resume is enabled in this demo. No persistence claim is made.

## Automated checks

- Career structural validator: 411 assertions, no errors, 29 runtime beats, seven scored decisions, six full-scene groups, 28 scene routes plus the ambient final review.
- Regression suite: 24 passing tests. Includes the existing work-evidence suite and eight aviation-specific tests: exact slot positions and midpoint; teach/practice/apply vocabulary; all 128 success/failure score combinations; cast entrance routing; stage/evidence coverage; music silence for main/promotion/retry/unmute; fixed scoring tiers; full-retry-only ending.
- TypeScript and scoped ESLint pass. Production build passes with webpack. Turbopack cannot resolve the checkout's linked dependency tree with its current root setting, so the existing supported webpack option was used without changing project configuration.
- Token check passes: all 508 DTCG tokens and current generated artifacts.
- Protected IB and RN gameplay source files have no changes in this work.
- Every selected landscape and portrait image was checked for opacity and dimensions. The final prompt/asset ledger records exact source paths, SHA-256 hashes and dimensions; no runtime people sprites are supplied.

## Browser checks actually performed

In the in-app browser on this Mac:

1. Complete passing story run: all 29 beats traversed using real controls; seven successful decisions; score 92; progress 7/7; midpoint score 74 and Continue; final decision; firm's shared monogram result; Replay resets to 50 and 0/7.
2. Complete non-passing production-preview run after the unsafe-pick scoring repair: all seven decisions wrong; scores 44, 38, 32, 26, 20, 14, 8; failed midpoint Continue works; all 29 beats reached; final review and non-passing ending; Try again resets to 50 and 0/7. Subsequent `noRepair` authoring removes the optional shared repair offer; a final preview-assisted smoke check at slot 26 then confirmed the non-passing ending at 44, no repair button, and Try again resetting to 50 / 0 of 7.
3. Initial timed rapid round allowed to expire with unanswered questions: one -6 result, continued afterward. Full passing/failing runs used the existing timer-off accessibility control so tool inspection did not consume the 45-second budget. A successful four-item run under the live timer was not separately timed.
4. Four term cards advance to four applied matches. A deliberate mismatch can be corrected; practice does not change score or progress, and completion advances directly without a verdict.
5. Correct and incorrect choices lock; feedback explains the reason. Rapid subitems expose Next question and See how you did, then award one overall score. Two-action pick requires two choices; mentor chat requires selection and Send. Ranking worked with accessible Move up/down buttons. These checks used buttons and keyboard, not simulated score injection.
6. Final architecture inspected at 1366 x 768: image loads, text legible, no horizontal overflow. Phone at 390 x 844: the dedicated portrait painting is selected, mentor face remains clear of HUD/dialogue, readable dialogue and Continue, first-choice button is 330 x 78 CSS pixels, ranking Submit is visible at y=679 with height 48.5 pixels, no horizontal overflow. Enter submits the selected native answer. Browser viewport and normal timer preference restored after testing.
7. Shared music module regression proves no track is assigned or played for this aviation simulation, including main, promotion, retry and unmute; existing IB music remains functional. No new music asset was created.

## Existing-game v2 integration

User asked: "push this under a v2 toggle in the flight simulator game." The existing aviation route defaults to the original v1; `?v=2` selects Before the Next Flight. Start-screen and HUD buttons expose their selected state with `aria-pressed`. Switching versions remounts the player at the new game's beginning; clicking the active version preserves the current beat. The Play hub has one aviation tile. The previous first-shift review URL remains an alias.

Browser verified on the production build at 1366 x 768 and 390 x 844: v1 default, start-screen v2 selection, new 29-beat script/7-decision HUD, active-version no-op on the second beat, HUD v1 reset to original 5-decision script, phone Enter activation back to v2, v2 retained on reload, dedicated portrait painting and no horizontal overflow. No audio element or track is loaded. Screenshots: `qa/v2-toggle-desktop.png`, `qa/v2-toggle-phone.png`, `qa/v2-toggle-hud.png`.

Revalidated after rebasing on origin/main: 24 regression tests, 411 structural checks, scoped ESLint, tokens, TypeScript and production webpack build pass. Standalone TypeScript first found an obsolete generated `.next/dev/types/validator.ts` referring to main's removed match-lab route; moved that stale generated cache file to `/tmp` and reran successfully. Production build's own TypeScript check also passed. Actual additional browser engines/hardware remain unverified.

## Repairs made from actual failures

- Supplied draft was missing required rapid outcome messages and used an unsupported skill label; repaired to shared definitions.
- A harmful pick emitted the shared `risky` tier, yielding -7 after scaling. The final authored pick uses only `pick` and `leave`, so its failed result is -6. Rechecked in the browser at midpoint 26; first pass remains +6.
- The optional shared repair mode uses +2 acceptable credit, which does not fit this level's fixed +/-6 contract. `noRepair: true` keeps full retry/replay while leaving other careers unchanged.
- Generic "85 and above advances" ending copy is hidden with the existing `plainEndings` option; no unbuilt level is offered.
- First image batch accidentally supplied an interior for the exterior and had textured floors. Replaced the exterior and simplified whole scenes. Priya's base skin and expression were corrected before the architectural redesign.
- User requested better-looking architecture without hyperrealism. Rebuilt the hangar with a sculptural canopy, sweeping blue ribs, walnut/glass review gallery and teal storage, then propagated it to all cast scenes and dedicated portrait paintings. Final art was reviewed with all HUD hidden before assembly.
- Dev fast-refresh reloads interrupted some exploratory runs. Final failing run used the stable production preview. These interrupted attempts are not counted as complete playthroughs.

## Evidence

`qa/passing-result.png`, `qa/failed-midpoint.png`, `qa/nonpassing-result.png`, `qa/interior-desktop.png`, `qa/mentor-phone.png`, `qa/first-choice-phone.png`, `qa/ranking-phone.png`, `qa/final-retry-phone.png`, `qa/final-preview.png`, structural/regression/lint/typecheck/build logs, source-backed task contracts and the exact prompt/asset ledger.

## Unverified and review limits

Actual Windows/ChromeOS hardware, Safari/Firefox, screen-reader speech, touch dragging, exhaustive every-wrong-option permutations, shortest landscape windows and a timed successful rapid round remain unverified. Automated structure and primary-source research are not subject-matter certification. Human review of the assembled game should assess career authenticity, learning value, fun and art preference. No public release or deployment was performed.
