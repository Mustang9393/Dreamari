# Token-level decisions made in the prototype

Decisions here change a token in the production system. They must be made in the certified Figma file and re-exported; the prototype's `design-tokens/` directory is not the vehicle. Everything not listed here is layout, copy or behaviour and needs no token.

| Date | Decision | Figma change | Status |
|---|---|---|---|
| 2 Sept 2026 | Body face is Inter, replacing Montserrat (thin weights read weak on dark). | Text styles: body, label, caption families to Inter. | Confirm the export already says Inter |
| 4 Sept 2026 | Display face is Bricolage Grotesque everywhere, including all-caps headings and the wordmark. Favorit retired. | `font-family.display` and `font-family.cta` to Bricolage Grotesque; remove Favorit from any text style. | To make in Figma |
