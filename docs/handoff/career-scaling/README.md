# Dreamari career simulation production package

**Current standard: Master SOP v1.8 · 21 October 2026**

The shareable source of truth is [the Career Simulation Master SOP](../../../output/career-master/master-sop.md), with a polished PDF beside it. It defines the current IB-based gameplay, narrative, UX and scoring contract; career-specific work; short copy; optional native work graphics; canonical cast identity; full-scene art; and end-to-end QA. Current user direction and repository handoff docs take precedence over older package notes.

## Copy-ready prompts

- `game-build-prompt.txt` runs the complete career build and QA workflow.
- `art-master-prompt.txt` creates complete opaque scenes and protects identity and composition.
- `artifact-master-prompt.txt` briefs optional, concise native work graphics.
- `work-graphics-research-prompt.txt` researches authentic work surfaces using primary sources.

## Package examples

The `examples/`, `food-scientist/` and `ux-designer/` folders contain career-specific examples, data, validations and historical iterations. Use them for evidence and patterns, not as a fixed question list or required template. Read the current SOP before reusing any older artifact.

The shareable prompt copies and approved-style image references are also packaged in `public/documents/` for publication.

## Approved game lock

Registered Nurse is an image-only update of the vetted 36-beat script in `rn-level-1-v2.ts` (original 55 script screens), including all ten ±5 decisions and its bespoke ECG, badge, call-light, wristband and report graphics. The shortened 26-beat rebuild is rejected. Preserve the approved Full and Express sequences, questions, answers, scoring, reviews and endings. New-career generation templates never override an approved game. `scripts/qa/work-evidence.test.mjs` verifies live nursing gameplay against both approved sources and requires a current complete painting for every beat.
