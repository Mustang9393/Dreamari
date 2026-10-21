# Dreamari career simulation production package

**Current standard: Master SOP v2.0 · 22 October 2026**

The shareable source of truth is [the Career Simulation Master SOP](../../../output/career-master/master-sop.md), with its PDF in `output/career-master/` and published copy at `public/documents/dreamari-master-career-sop.pdf`.

For new-career games such as UX and Food Science, follow the vetted IB experience and its 29-runtime-beat structure, varied interactions and concise copy. Registered Nurse is an approved exception: `rn-level-1-v2.ts` is locked at 36 runtime beats across 55 script screens. RN updates change images and face chips only.

Keep gameplay panels centered in a fixed position; compose art around the HUD and dialogue zones rather than shifting UI. Introduce new-career cast members one at a time with a solo first appearance and follow-up moments, tracked in a cast ledger. Use the shared IB monogram/CareerSeal for success.

The AI researches, writes, generates, integrates and QA-repairs the whole game. Contact sheets support internal QA and do not require an approval gate. Human QA is for the assembled result.

## Copy-ready prompts

- `game-build-prompt.txt` runs the complete build and end-to-end QA workflow.
- `art-master-prompt.txt` creates exact-scene full art and protects cast and viewport framing.
- `artifact-master-prompt.txt` briefs optional native work graphics.
- `work-graphics-research-prompt.txt` researches authentic work surfaces with primary sources.

Prompt and image-reference copies for publishing are in `public/documents/`. The `examples/`, `food-scientist/` and `ux-designer/` folders contain examples and historical iterations; use the current SOP before reusing them.
