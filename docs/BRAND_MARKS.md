# Partner marks: what each brand allows

Rule (4 Sept 2026, direct feedback): a partner's mark is shown only in a form its own guidelines permit. We never invert or recolour a full-colour logo. Where a brand publishes a one-colour reversed version, our white ink is that version. Where a part must keep its colour, `accent` paints it. Where only full colour is allowed, `fullColor` shows the artwork as shipped on a white plate. Where we cannot comply with the file we hold, the name is set in type until the right file arrives.

Files live in `public/images/logos/companies/`; registration is `COMPANY_MARKS` in `src/components/connect/primitives.tsx`.

| Brand | On dark, per the brand | What we do | Status |
|---|---|---|---|
| Dream Opportunity | Our own mark | White | OK |
| EY | White letters, beam in EY Yellow | `ey-letters` white + `ey-beam` #FFE600 | OK (source: EY logo use instructions, grenfin.eu/data/asspartners/63.pdf) |
| Morgan Stanley | 100% white reversed on dark | White | OK (Logo Usage Guidelines, morganstanley.com media resources) |
| AT&T | One-colour reverse permitted | White | OK (AT&T brand guidelines) |
| Goldman Sachs | White version for dark backgrounds | White | OK (brand portal summary; confirm on goldmansachs.papirfly.com) |
| JPMorgan Chase | Not published for third parties | White | To confirm with JPMC relationship contact |
| Junior Achievement | Monochrome white symbol published | White symbol, `junior-achievement.png` (JA Symbol-Monochrome-White from the JA Worldwide Brand Center, resized to 480px) | OK |
| SEO Scholars | No published guidelines; on its own dark footer SEO keeps "SEO" red beside white text | `seo-scholars-word` white + `seo-scholars-seo` #EA0029, split from the seo-usa.org lockup PNG | OK on colour; confirm use with SEO |
| Amazon | Entire logo solid white allowed | White | OK (Amazon brand usage guidelines) |
| Meta | Monochrome white on dark | White | OK, but Meta requires approval for any use |
| Nike | Black or white swoosh | White | OK |
| Spotify | White on dark where green lacks contrast | White | OK |
| Disney | White one-colour version exists | White | OK (guideline summaries; confirm for third-party use) |
| Adobe | May be reversed to white | White | OK, but use requires an Adobe licence |
| Pfizer | White version for dark applications | White | OK |
| CVS Health | Single-colour white available | White | OK |
| Deloitte | Wordmark white, Green Dot stays green | `deloitte-word` white + `deloitte-dot` #86BC24 | OK |
| Google | Full colour by default; approved one-colour black or white where the context is one colour by design | White (the chip row and lockups are one colour by design) | OK on colour; Google requires formal approval for any third-party logo use |
| Microsoft | Symbol + logotype together, never one colour | Type | Our file is the logotype alone. Needs the full logo file, then `fullColor` |
| Apple | Third parties may not use the logo | Type | Do not use |
| Netflix | White logo is for video watermarks only | Type | Ask brand@netflix.com before any use |
| Mars | Not published for third parties (Kellanova is now part of Mars, so its clip carries the Mars mark) | White wordmark, `mars.svg` (Wikimedia Commons "Mars Incorporated 2019 logo.svg", public domain as a text logo) | To confirm with Mars |
| Kellogg's | Script wordmark is red; a white reverse exists in Kellogg's own packaging and media | White script, `kelloggs.svg` (Wikimedia Commons "Kellogg's-Logo.svg") | To confirm with WK Kellogg Co |
| WildBrain | Not published for third parties; the W creature is always blue with white eyes | `wildbrain-word` white (letters and pupils) + `wildbrain-w` #43C5E4; split from Wikimedia Commons "WildBrain logo.svg" (`wildbrain-eyes.svg` kept for a full-colour plate if needed) | To confirm with WildBrain |
| Mayo Clinic | Not found | White | To confirm |
| Johnson & Johnson | Not found | White | To confirm |
| Blackstone | Not checked | White | To confirm |

Beyond colour: most of these brands require permission for a third party to show their logo at all. The prototype shows them as the partners and employers the product describes; before launch each needs a written OK or a text name instead.
