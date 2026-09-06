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
