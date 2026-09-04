# Token-level decisions made in the prototype

Decisions here change a token in the production system. They must be made in the certified Figma file and re-exported; the prototype's `design-tokens/` directory is not the vehicle. Everything not listed here is layout, copy or behaviour and needs no token.

| Date | Decision | Figma change | Status |
|---|---|---|---|
| 2 Sept 2026 | Body face is Inter, replacing Montserrat (thin weights read weak on dark). | Text styles: body, label, caption families to Inter. | Done in Figma 4 Sept 2026: 13 Montserrat styles retyped to Inter (Label, Label Bold, Label Small, Label Micro, Body Secondary, Caption, Caption SemiBold, Nav Label, Nav Bold, Button Black, Bold Small, Browse Cards/World Label); Section Heading, Display Stat and Stat Large to Bricolage Grotesque. Re-export pending |
| 4 Sept 2026 | Display face is Bricolage Grotesque everywhere, including all-caps headings and the wordmark. Favorit retired. | `font-family.display` and `font-family.cta` to Bricolage Grotesque; remove Favorit from any text style. | Checked 4 Sept 2026: no Favorit style exists in Figma; display styles are already Bricolage. Nothing to change |
| 20 Aug 2026 | Card fill lightened to #151829 (theme review). | `card` variable from neutral.800 to #151829. | Checked 4 Sept 2026: Figma `card` is already #151829 (dark) and neutral/100 #d8dbe8 (light). Aligned |
| Aug to Sept 2026 | Primary buttons are brand blue with white text, radius 12, no pills. Secondary is glass with a hairline. | CTA component Default fill `primary`, text `primary-foreground`; retire the white Default. | Done in Figma 4 Sept 2026 on Default and Disabled, both sizes. Hover and Pressed unchanged. Re-export pending |
