# My Profile: Top Three

Status: Locked (5 Sept 2026). Play CTA routes to Investment Banking only, by instruction.

## Layout
Three career cards, three across from 768px, one column on phones. Card: poster, world label, title, "Your #1" or "Make my #1", one-line summary, Estimated pay (report median), Education, Years in school, "Employers & schools" accordion, "View Career Report" link. Rank badge, overflow menu.

## Next step banner (under the cards)
Copy: eyebrow "NEXT STEP"; "Play your #1 Career Simulation to see if it's really your #1."; button "Play" → `/play/investment-banking`. Slow breathing glow, a light sweeping across, ring pulse on the button; an X at the end of the row dismisses and remembers (`dreamari:top3-next-step-dismissed`). Phones: sentence full width, button and X beneath. Same component as Play's Explore bridge and My Plan's banner (`src/components/app/NextStepBanner.tsx`).

Future (unspecified): route to the current #1's simulation; change to the next action once the simulation is complete.

## Empty / partial states
"Add a career" dashed card when fewer than three; "Choose your #1 career to build your plan around it." when none is focused.
