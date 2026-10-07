# Counselor V6: independent advising concept

## Why
Chandu requested: “lets start that build as v6, v5 is already being done by claude. Add those to the toggle so we can compare ... assume all the data that usman needs to give for now.” V6 isolates the new Home / Students / Explore / Prepare / Workspace / Analytics concept while Claude continues V5. Shared edits are confined to CounselorApp routing and version.tsx. Existing V4 and V5 files are not edited.

## First build
- Home: contextual focus, three caseload measures, prominent actual career photography, student conversation cards, playable existing career videos, simulation entry.
- Students: searchable caseload with support filter and direct student-specific preparation.
- Explore: reusable career catalog, simple Math/Biology topic expansion, career detail dialogs, meeting shortlist, searchable schools and illustrative state lens. Career and school guides open the existing student pages in a separate tab.
- Prepare: student selection, facts and assumptions, discussion prompts, interest-aligned careers, state/budget-filtered school options, browser-local notes per student and printable brief.
- Analytics: six domains, three initial measures each, definitions, eligible denominators, grade filters, included/remaining student lists and direct preparation. Risk starts with included students.
- Workspace: embeds existing review, document, Connect and impact components; preserves their local functionality and approved reports. This is reuse, not a completed redesign of those tools.
- Comparison dock: V4 / V5 / V6, raised above V5 mobile bottom navigation. V4 remains default.

## Data contract and assumptions
`src/components/counselor/v6/data.ts` is DEMO-ONLY. Roster is 120 reference students. It intentionally excludes the browser's live student to keep this experiment deterministic. Reference engagement/readiness values are not verified school records. GPA, budget, state preferences, WBL and outcome measures are deterministic fixtures. Outcomes use senior identities as a prior-cohort illustration; production must supply a distinct historical cohort. Labor-market openings are visibly illustrative, not ranked or sourced forecasts. School options use existing published average net prices, not individual aid offers or admission probability. No reach/target/safety claim is made. All school data requires backend reconciliation before production.

Notes persist under `dreamari:v6:meeting:<studentId>` in localStorage; career shortlist is session component state. No external messages are sent and no production roles/permissions are introduced. A full student record or existing impact report can open V4 explicitly.

## Verification
TypeScript and scoped ESLint pass. tokens:check passes (464 tokens). Browser checked selected Charlotte Davis brief from URL, saved notes, Biology search, analytics denominators/list rendering, review workspace, V5 and V4 switching. Light mobile Home at 390 has no horizontal page overflow; dark rendered at default width, desktop light at 1440. Existing Home artwork had no broken images. Print styles authored, actual exported PDF not reviewed.

## Next work
Refine the concept with user feedback, add district-specific metric configuration and richer student preference/academic/meeting fixtures, integrate real state labor-market adapters, persist per-student shortlists, and redesign operational tools consistently. This is a working first concept, not backend-complete feature parity. Keep V5 development isolated.
