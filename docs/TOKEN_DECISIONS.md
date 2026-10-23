# Token-level decisions

Decisions that change a token or text style in the production system. Values live in `color.ui.*` (`design-tokens/semantic.*.tokens.json`) and in the table in `docs/DESIGN_SYSTEM_ALIGNMENT.md`; Figma takes them next, and the app at the export after that.

| Date decided | Decision | Figma | App |
|---|---|---|---|
| 20 Aug 2026 | Card fill lightened to #151829 (dark), neutral/100 (light) | Done | Superseded 19 Oct (below) |
| 2 Sept 2026 | Body, label, caption and nav text in Inter, replacing Montserrat | Done 4 Sept 2026, 12 styles retyped | Next export |
| Aug to Sept 2026 | Primary button is the primary fill with primary-foreground ink, radius 12, never a pill. Secondary is glass with a hairline | Done 4 Sept 2026, CTA Default and Disabled variants | Next export |
| 4 Sept 2026 | Bricolage Grotesque is the only display face, including all caps and display numerals; Favorit retired | Done 4 Sept 2026 | Next export |
| 7 Oct 2026 | One status palette app-wide: success, warning, danger, info, each as ink, solid and subtle | To do | Next export |
| 19 Oct 2026 | Black & Blue is the look. Brand ramp re-hued from 221deg to 213deg; purple, teal and pink leave the UI (the old purple and pink slots become light blues, glows only). Why: a student focus group called the old colours and gradients "vibe-coded"; Joshua asked for deep blacks, luminous blues, gradients as light, restrained glass | To do | Next export |
| 19 Oct 2026 | Dark surfaces near-opaque (94 to 96%), each rung lighter than the one below. Why: stars showed through cards at full sharpness behind text | To do | Next export |
| 21 Oct 2026 | Dark mode is Dusk: page #131f36, cards #13213a, a sky gradient that brightens toward the horizon. Why: the near-black read "gloomy and like it's underwater" | To do | Next export |
| 21 Oct 2026 | Dark primary is periwinkle #8fb3f5 with dark ink #0b1a33 (8.2:1). Light primary is dusk cobalt #2f5fb1 with white (6.2:1). Why: cobalt read as a dark hole on the dusk sky; white on periwinkle would be 2.1:1 | To do | Next export |
| 21 Oct 2026 | Light secondary text #434c58 and link blue #24508f, both AAA (7:1+). Why: WCAG audit, 1.4.6 | To do | Next export |
| 22 Oct 2026 | Light photo scrims are frost (#f4f7ff) with navy ink (#1d2539), not dark glass with white type | To do | Next export |
| 24 Oct 2026 | The prototype's token files carry Black & Blue, with the flat vocabulary as `color.ui.*`. Classic archived; not part of the design system | n/a | Read `docs/handoff/DESIGN_SYSTEM_HANDOFF_2026-10-24.md` |

Not token decisions, no action: layout, copy, motion and content changes. Those live in the prototype and are built from it.
