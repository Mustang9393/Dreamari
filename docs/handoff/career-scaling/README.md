# Dreamari career simulation production package

**Current standard: Master SOP v2.3 · 22 October 2026**

The shareable source of truth is [the Career Simulation Master SOP](../../../output/career-master/master-sop.md), with its PDF in `output/career-master/` and published copy at `public/documents/dreamari-master-career-sop.pdf`.

For new-career games such as UX and Food Science, reproduce the actual 29-slot IB sequence and teach-practice-apply arc, not only its beat count. Preserve high-level narrative functions and scored positions; independently research tasks for the career and level. Do not require IB’s storage question, report-error exercise or identical answer layouts. Use `career-task-research.json` and `career-task-contracts.json`; at least four scored tasks exercise authentic work. Registered Nurse is an approved exception: `rn-level-1-v2.ts` is locked at 36 runtime beats across 55 script screens. RN updates change images and face chips only.

Slots 1–2 establish welcome and stakes without future cast faces; the mentor arrives at 3, peer cameo at 5, senior at 12, rival returns at 18–20, peer needs help at 24, and final review is 29. Cast entrances must arise from actual work with gameplay between them, never a succession of introduction cards. Keep UI panels centered and use the shared IB monogram/CareerSeal for success.

Open with a workplace exterior, then the interior/stakes view. Shared anime style does not mean shared building design: UX is a six-story red-brick waterfront loft, Food a low sage research campus with sawtooth clerestory, and RN a curved lake-facing patient tower over a rounded podium. Keep each exterior consistent with interior materials, window grids and geography; avoid generic repeated ivory-glass porticos. No added beat or face.

The AI researches, writes, generates, integrates and QA-repairs the whole game. Contact sheets support internal QA and do not require an approval gate. Human QA is for the assembled result.

## Copy-ready prompts

- `game-build-prompt.txt` runs the complete build and end-to-end QA workflow.
- `art-master-prompt.txt` creates exact-scene full art and protects cast and viewport framing.
- `artifact-master-prompt.txt` briefs optional native work graphics.
- `work-graphics-research-prompt.txt` researches authentic work surfaces with primary sources.

Prompt and image-reference copies for publishing are in `public/documents/`. The `examples/`, `food-scientist/` and `ux-designer/` folders contain examples and historical iterations; use the current SOP before reusing them.

Art v2.3: load full reference images for UX, Food and Nursing before generation. `character-art-prompt.txt` specifies faces/hair/cel shading; `background-art-prompt.txt` specifies illustrated materials, spatial design and light. Apply both in the same complete-scene generation.
