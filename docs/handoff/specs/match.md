# Match (`/match-lab`)

Status: Locked (5 Sept 2026).

## Deck
Careers and order: `src/components/match-lab/data.ts` (per Slack: includes Data Scientist, Fashion Buyer, Game Designer). Each card shows the median salary chip from the report.

## Layout
- Header "Find your Top 3" with Back (→ `/flow`), remaining count, three slot chips, deck, then X / undo / thumbs-up.
- Tablet and desktop: deck height `min(600px, 100dvh - 280px)`, header + slots + deck + CTAs centred as one group. Phone: deck fills the screen.
- Gesture hint shows on the first visit only (progress in `dreamari:hint-progress:match-swipe`).
- Dream Score chip ("100 XP") sits beside the menu in the flow header when the score is above 0.

## Your Top 3 Matches sheet
Opens when three are liked: confetti burst and chime, two drifting glows, eyebrow "Match complete", heading "Your Top 3 Matches" (ink reveal), caption "Tap a card to lead with it.", three cards in a row from 640px with each career's poster typeface, 3D cascade reveal with a sheen; tapped card gets the glow ring and check badge. Buttons: "Save My Top 3" (primary), "Keep Swiping". Sheet caps at 90dvh and scrolls inside.

## Handoff
Save My Top 3 → `/profile?picks=…&focus=…&tab=top3&welcome=1`.

## Files
`src/components/match-lab/MatchLab.tsx`, `data.ts`.
