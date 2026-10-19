# UX Designer: SOP proof

Status: AI-authored local draft, not a supplied Joshua script. No professional or visual approval claimed. Built: Level 1 only. No production deployment.

## Brief

- Catalogue ID: `ui-ux-designer`; title: UX Designer; world: Tech & Engineering.
- Fictional employer: Northline Studio. Fictional client assignment: help people finish a volunteer-event sign-up.
- Player: Junior UX Designer. They investigate and recommend; they do not promise a client launch or overrule a reviewer.
- Visible result: a tested prototype direction and an honest handover with remaining uncertainty.
- Learning outcomes: distinguish goals from solutions; separate observations from assumptions; run neutral tasks; explain evidence; prepare a usable handover.
- Ten decisions: goal choice; tool matching; observation/assumption sort; research habits; order an iteration; find form problems; respond to peer disagreement; build a rationale; select a handover; flag an unresolved task blocker.
- No arbitrary timer. All scored decisions are binary Best/Wrong or the shared multi-item resolution. The shared score/recovery engine owns consequences.

## Cast: canonical selected draft scenes

Asha is a 32-year-old Indian mentor, warm medium-brown skin, dark brown almond eyes, gently pointed oval face, black side-parted hair in a low bun, teal overshirt over ivory top, charcoal trousers and small gold studs. The selected generated studio frame established a side part despite an earlier requested centre part. That first prompt was not followed exactly; the record follows the selected drawing and later prompts use it explicitly. This is a draft selection, not user approval.

Noah is a 25-year-old Mexican peer, light olive skin, grey-green eyes, longer angular face, short chestnut hair, slate-blue rolled-sleeve shirt and navy trousers. His hair is more articulated than the requested four masses; further simplification remains a visual-review item. He appears only in the immutable studio image, so repeated studio scenes cannot change his hair.

Eleanor is a 58-year-old White participant, green hooded eyes, grey chin-length bob, plum cardigan and pale blue shirt. Samira is a 46-year-old Black design lead, deep brown skin, amber-brown eyes, broader jaw, short dark hair with grey accent, aubergine suit, cream top and small gold hoops. Age readability remains a human art-review gate.

Face chips are crops from studio/research/review images. They are not separately regenerated faces. No on-stage sprites or cutouts are registered.

## Scene geography

| Camera | Fixed complete image | Exterior and layout |
|---|---|---|
| northline-studio | studio.png | Canal and pale city buildings through tall left glazing; desk behind cast; walnut shelves right. Asha and Noah stand in front of the desk with bodies continuing below waist. |
| northline-research | research.png | Courtyard tree and pale wall through left glazing; acoustic panels; round table and navy chairs. Asha and Eleanor sit naturally at the laptop. |
| northline-review | review.png | Planted lower roof and city blocks through left glazing; walnut panels, wall screen and pale review table. Samira and Asha stand in front of the furniture. |

Each camera is a separate complete image. Every repeat uses the exact same file, not an independently generated version. Daylight is used throughout this single-project sequence; no night scene is required by this story. A different room has deliberately different geography.

The raw source images are 1672×941, opaque. The live game still applies its established UI darkening/blur and responsive crop; those rendered screen pixels are not claimed identical across viewport sizes.

## Later-level plan (unbuilt)

| Level | Role / scope | Assignment | Increasing reasoning |
|---|---|---|---|
| 1 · built draft | Junior UX Designer | Improve a sign-up task | Observe, distinguish evidence, test and explain |
| 2 · planned | UX Designer | Resolve a multi-step booking flow | Compare findings, prioritise constraints, test alternatives |
| 3 · planned | Senior UX Designer | Improve an existing service across user groups | Handle conflicting evidence and research gaps |
| 4 · planned | Lead UX Designer | Coordinate several connected features | Define shared patterns and resolve team trade-offs |
| 5 · planned | Design Manager | Guide a team through a changing brief | Coach reviews, allocate work, communicate risk |
| 6 · planned | Design Director | Set a service strategy with limited evidence | Choose outcomes, investment and accountable checks |

These are fictional studio roles, not a universal UX promotion promise. Higher levels need complete new scripts and reviewer checks before becoming playable. The plan reuses the same interaction contracts; it does not just rename Level 1 choices.

## Source ledger

- GOV.UK, “Using moderated usability testing”: realistic tasks, observation and neutral facilitation. https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing
- W3C, Understanding Labels or Instructions: visible labels and guidance. https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions
- W3C, Understanding Error Identification: identify input problems in understandable text. https://www.w3.org/WAI/WCAG22/Understanding/error-identification
- Engine: `types.ts`, `scoring.ts`, `coreKit.ts`, `SimulationPlayer.tsx`; existing IB/RN/AMT data and Play SOP chapter 11.

No salaries, hiring rates, regulations, research statistics or credential claims are invented. The named participant's behaviour is fictional case data, not a real study.

## Exactness stress test

One candidate requested only a closed mouth for Asha, with the rest unchanged. It is quarantined in `art-candidates/` and not served in the game. The decoded-pixel comparison outside the allowed mouth rectangle is recorded in `ux-pixel-test.json`. It fails the exactness gate despite looking visually similar. The game therefore reuses the unmodified studio image for all studio dialogue and feedback. The same-image control must pass with zero protected pixel differences.

This tests a useful failure mode. It does not establish a fresh-generation success rate, identity accuracy score, time-of-day edit reliability or cross-career art reliability. Those require more approved samples and repeated tests.
