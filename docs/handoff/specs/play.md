# Play (`/play`)

Status: Locked. The Investment Banking simulation is the only playable simulation; others are "In the works" cards.

## Hub
Title "Play" → Featured row (playable simulations first) → Glossary Games shelf → Explore bridge banner → "In the works" placeholders. The bridge sits after the Glossary Games so it closes the page instead of interrupting it (Joshua Pierce, Slack, 6 Sept 2026).

## Explore bridge banner (Joshua Pierce, Slack, 5 Sept 2026)
Eyebrow "Looking for another career to play?"; "Explore more careers and find another simulation to play."; button "Explore" → `/explore`. Same component and treatment as the Top Three next step; dismissible (`dreamari:play-explore-bridge-dismissed`).

## Routes
`/play/[game]` simulation player (e.g. `/play/investment-banking`), `/play/glossary/[career]` glossary game (e.g. `/play/glossary/investment-banking`). The bare `/play/glossary` is not a page.

## Files
`src/components/play/PlayHub.tsx`, `games.ts`, `SimulationPlayer.tsx`, `src/components/glossary/*`.

## Level 1 scripts, no-repeat rule (Joshua Pierce, Slack, 6 Sept 2026)
General rule, built into the player: once a character has said a line in the scene, the activity screen that follows does not repeat it. A staged beat shows its spoken line first; the moment the interaction is revealed the line leaves and the screen holds only the question and its controls. Cards keep their eyebrow. Script changes: Investment Banking L1-01 "Welcome to Cobalt Capital. Your first day starts now." with a burst and the sweep sound (`celebrate: true`, plain ink, no gradient); L1-05 "Christina is an Associate, two levels above you, and she’ll be giving you direction throughout your internship."; L1-08 has no setup line (the reception scene already happened), the question opens directly; L1-13 opens on Question 1 of 4 with no restatement and no "Tap fast". Nursing mirrors it: RN1-01 "Welcome to Riverbend Medical Center. Your first shift starts now."; RN1-06 "Rosa is a Staff Nurse, the nurse you work beside all year, and she’ll be giving you direction on every shift."; RN1-14 opens on Question 1 of 4. Both modes (Full and Express) share the scripts.

## Nursing gets an Express mode (Chandu, 7 Sept 2026)
Registered Nurse Level 1 had no `expressCut`, so `?mode=express` silently fell back to Full -- Nursing never actually had a distinct Express variant. It now mirrors Investment Banking's exact pattern: `expressCut: ["RN1-04", "RN1-04b", "RN1-05", "RN1-08", "RN1-10", "RN1-11"]` cuts the how-nursing-works teach card and its example, the drag comprehension check on it, the skill-chips reveal, the reputation/score explainer, and the typed 85-threshold check. All ten scored beats, both story cards, every character card and the vocabulary flips card survive; the cut teaching becomes tappable in the player (score panel, term meanings, character cards), same as IB. Verified live at `/play/registered-nurse?mode=express`: header reads "EXPRESS", the cut beats are skipped, Day 1 lands directly after Rosa's intro cards.

## IB vs. Nursing parity audit (Chandu, 7 Sept 2026)
Checked whether Nursing's dialogue-typing + voice-blip sound, or any other interaction mechanic, was doing something IB Level 1 was missing. The typewriter and its sound effects are shared player code (`SimulationPlayer.tsx`, `sound.ts`), not career-specific, so there was no separate "Nursing does this better" mechanic to port -- one real gap turned up, running the other way from how it was first suspected:
- **Fixed**: `VOICE_PITCH` (the per-character pitch fed to the typing voice-blip) only listed IB's five characters. Every Nursing speaker fell through to the generic 500 fallback, so Rosa, Denise and Tyler all sounded identical while IB's cast each had a distinct voice. Added `Rosa: 615, Denise: 395, Tyler: 505`. Yvonne has a portrait in the cast map but never speaks in Level 1 (she's the hospital-wide charge nurse teased in the trailer, `RN-TR-06`) -- no pitch needed until a level actually casts her.
- **Checked, no gap**: `tone`/`resetScene`/`spotlight`/`mood` field usage (symmetric), `planLineIfFailed` coverage (10/10 scored beats on both sides), the full `sound.ts` palette (all shared calls, none career-specific).
- **Flagged, not fixed**: Nursing Level 1 uses two interaction kinds IB Level 1 never does -- `rank` (RN1-15, order four patients by priority) and `pick` (RN1-19, choose three things for a handoff report). Both already exist in the shared player/types; IB just doesn't happen to exercise them in Level 1. This is new scenario content to write (which beat, what options, what's correct and why), not a lookup-table fix, so it's a recommendation for Joshua rather than something authored unilaterally here.
- Nursing also never stages a `castMembers` (two-portrait) scene the way IB does once at the Day 1 question (Christina + Jordan). Not a gap: IB's scene pairs two named, portrait-bearing characters; Nursing's equivalent Day 1 beat (RN1-09) has Rosa plus an unnamed, portrait-less "night nurse" by design, so there's no second character to render.
