"use client";

import { useRevealOnScroll } from "./scrollHooks";

// The corporate partners as one slow marquee under the Dream Opportunity
// credibility lines (Joshua Pierce, Slack, 6 Sept 2026; ticker per Chandu,
// 7 Sept 2026). The set is the real partner wall's brands, as vector marks we
// host ourselves (public/images/marketing/partners; sources in ATTRIBUTION.md).
//
// Every mark is scaled by its INK, not by its file frame: each SVG was
// trimmed to the drawn pixels, and the size below gives every logo in the
// SAME ROW the same visual mass (constant ink area, clamped to a readable
// height and a sane width), so a square mark and a long wordmark weigh the
// same next to each other.
//
// The row itself gets its own ink budget (ROW_SCALE), tapering down the
// wall -- direct feedback via Slack, 10 Sept 2026 (reference screenshot
// attached): "reorder and resize the partner logos so they follow the same
// hierarchy, sizing, and overall composition shown in the reference image."
// A flat grid where every mark reads the same size, regardless of row,
// flattened exactly that hierarchy -- the reference's top rows (JPMorgan
// Chase, Mars, HSBC, Warner Bros. Discovery...) are visibly bigger than its
// dense bottom rows (BET, Bleacher Report, Cartoon Network, DC, TNT), same
// as a real sponsor wall reads tiers by size. One scale per MARK_ROWS row,
// same order as the reference.
const INK_AREA = 27 * 27 * 2.6;
const ROW_SCALE = [1.7, 1.5, 1.3, 1.05, 1.35, 1.0, 1.0, 0.7];
const MIN_H = 14, MAX_H = 40, MAX_W = 160;

type Mark = {
  name: string;
  file: string;
  ratio: number;
  /** a mark with painted white counters (HSBC's hexagon, the Warner Bros. shield): on the dark page it is inverted by luminance, never flattened */
  emblem?: boolean;
  /** a light-grey original that vanishes on the light page: darkened there */
  faint?: boolean;
};
// Order matches the reference partner wall (dreamari.com) EXACTLY, row by
// row, left to right (direct feedback, 8 Sept 2026: "it can't match the
// reference order closely, it should match it exactly"). For a while this
// rendered as one flat, uniform grid instead of these row breaks (a fixed
// rectangle with equal cells reads as symmetric regardless of each row's
// item count, where matching the reference's own irregular row lengths
// via justify-between/justify-start didn't) -- see ATTRIBUTION.md. Reverted
// to rendering row by row again (direct feedback via Slack, 10 Sept 2026,
// reference screenshot attached: "reorder and resize... follow the same
// hierarchy, sizing, and overall composition shown in the reference
// image") -- a flat grid also flattened the reference's size hierarchy
// (its top rows read bigger than its dense bottom rows), which mattered
// more than the earlier symmetry fix. See PartnerLogoGrid's own comment
// for how the previous failure mode is avoided this time.
//
// 9 Sept 2026 pass: replaced with the user's own curated, numbered set of
// logo files ("Logos Page (Landscape)"), which is both higher-quality and
// more complete than everything sourced by hand in earlier passes -- see
// ATTRIBUTION.md. This also finally adds MTV, Nickelodeon and the "[A/B]"
// bracket mark (identified as AllianceBernstein), and fixes Taylor & Francis
// (the earlier hand-recolored asset had no real cutout for the ship, so it
// flattened to a blank disc; the real asset's ship/water detail is a true
// alpha cutout and needs no special treatment). `emblem: true` now covers
// every mark whose ink is a solid card/background with a light cutout on
// top (Blackstone, AllianceBernstein, MAGIC, IWCE, Paramount's circle, MTV's
// M-block-plus-script) -- flattening those to flat white would merge the
// card and its cutout into one blank shape, so they're inverted by
// luminance instead, same as HSBC and Warner Bros. Discovery already were.
const MARK_ROWS: Mark[][] = [
  [
    { name: "JPMorgan Chase", file: "jpmorgan-chase.png", ratio: 6.941 },
    { name: "Chase", file: "chase.png", ratio: 5.374, emblem: true },
    { name: "AT&T", file: "att.png", ratio: 2.44, faint: true },
  ],
  [
    { name: "Mars", file: "mars.png", ratio: 3.429 },
    { name: "Kellanova", file: "kellanova.png", ratio: 3.92 },
    { name: "Informa", file: "informa.png", ratio: 3.066 },
    { name: "EY", file: "ey.png", ratio: 0.992 },
  ],
  [
    { name: "BioProcess International", file: "bioprocess-international.png", ratio: 3.99 },
    { name: "Brookfield", file: "brookfield.png", ratio: 6.799 },
    { name: "Blackstone", file: "blackstone.png", ratio: 2.553, emblem: true },
    { name: "SupplySide Global", file: "supplyside-global.png", ratio: 3.178 },
    { name: "MRO", file: "mro.png", ratio: 2.149 },
  ],
  [
    { name: "Natural Products Expo West", file: "expo-west.png", ratio: 1.01, emblem: true },
    { name: "Brand Licensing Europe", file: "brand-licensing-europe.png", ratio: 1.779 },
    { name: "Pop-Tarts", file: "pop-tarts.png", ratio: 1.532, emblem: true },
    { name: "IWCE", file: "iwce.png", ratio: 1.004, emblem: true },
    { name: "MAGIC", file: "magic.png", ratio: 1.006, emblem: true },
    { name: "GDC", file: "gdc.png", ratio: 2.58, emblem: true },
    { name: "AllianceBernstein", file: "alliancebernstein.png", ratio: 1.006, emblem: true },
    { name: "Pringles", file: "pringles.png", ratio: 0.782, emblem: true },
  ],
  [
    { name: "MD&M", file: "mdm.png", ratio: 3.952 },
    { name: "HSBC", file: "hsbc.png", ratio: 3.716, emblem: true },
    { name: "Warner Bros. Discovery", file: "wbd.png", ratio: 4.406, emblem: true },
    { name: "Amazon (Black Employee Network)", file: "amazon-ben.png", ratio: 2.398 },
    { name: "Colgate", file: "colgate.png", ratio: 1.277, emblem: true },
  ],
  [
    { name: "Enterprise Connect", file: "enterprise-connect.png", ratio: 3.86 },
    { name: "Akamai", file: "akamai.png", ratio: 2.425 },
    { name: "Paramount", file: "paramount.png", ratio: 1.313, emblem: true },
    { name: "MTV", file: "mtv.png", ratio: 1.292, emblem: true },
    { name: "The AI Summit London", file: "ai-summit-london.png", ratio: 1.462 },
    { name: "WildBrain", file: "wildbrain.png", ratio: 1.252, emblem: true },
    { name: "Taylor & Francis", file: "taylor-francis.png", ratio: 4.2 },
    { name: "Nielsen", file: "nielsen.png", ratio: 2.807 },
  ],
  [
    { name: "McDermott Will & Schulte", file: "mcdermott.png", ratio: 3.464 },
    { name: "NCSolutions", file: "ncsolutions.png", ratio: 5.524 },
    { name: "Kroll", file: "kroll.png", ratio: 4.241 },
    { name: "Yahoo", file: "yahoo.png", ratio: 3.576 },
    { name: "VH1", file: "vh1.png", ratio: 2.669 },
    { name: "Verizon", file: "verizon.png", ratio: 4.405 },
    { name: "Peloton", file: "peloton.png", ratio: 3.313 },
  ],
  [
    { name: "Jimmy Choo", file: "jimmy-choo.png", ratio: 6.905 },
    { name: "Nickelodeon", file: "nickelodeon.png", ratio: 6.678 },
    { name: "Versace", file: "versace.png", ratio: 4.916 },
    { name: "BET", file: "bet.png", ratio: 3.277, emblem: true },
    { name: "Bleacher Report", file: "bleacher-report.png", ratio: 3.043, emblem: true },
    { name: "Michael Kors", file: "michael-kors.png", ratio: 10.086 },
    { name: "Cartoon Network", file: "cartoon-network.png", ratio: 1.463, emblem: true },
    { name: "DC", file: "dc.png", ratio: 1.003, emblem: true },
    { name: "TNT", file: "tnt.png", ratio: 0.973, emblem: true },
  ],
];
function sizeFor(ratio: number, rowIndex: number) {
  let h = Math.sqrt((INK_AREA * (ROW_SCALE[rowIndex] ?? 1)) / ratio);
  h = Math.max(MIN_H, Math.min(MAX_H, h));
  let w = h * ratio;
  if (w > MAX_W) { w = MAX_W; h = MAX_W / ratio; }
  return { width: Math.round(w), height: Math.round(h) };
}

/** All the marks at once, wrapped into a dense composition instead of a
 *  scrolling row (direct feedback, 8 Sept 2026: "all at once... way more
 *  bombastic and impressive," dreamopportunity.org's own reference) -- but
 *  built from our own individually-hosted vector marks, not the supplied
 *  flattened wall image, so it still carries the ticker's own rule: one
 *  colour (white) on the dark student site, real brand colour on the light
 *  Schools page.
 *
 *  Rendered ROW BY ROW (MARK_ROWS, not the old flattened+regridded MARKS)
 *  so the reference's own composition survives: each row centered on its
 *  own, sized by that row's ink budget (see ROW_SCALE above), rather than
 *  poured into one fixed-column grid that ignored where the reference
 *  actually broke rows and normalized every mark to the same size regardless
 *  of tier. A previous attempt at per-row sizing read as uneven because each
 *  row's marks kept their own natural, unrelated widths (`justify-between`
 *  stretched into gaps, `justify-start` packed to a different width than its
 *  neighbours); this still shares ONE proven mechanism -- constant ink area
 *  within a row, clamped -- so a row is internally consistent and centers
 *  cleanly, and only the budget itself changes row to row. */
export function PartnerLogoGrid({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const [revealRef, revealed] = useRevealOnScroll<HTMLDivElement>();
  const white = { filter: "brightness(0) invert(1)", opacity: 0.8 };
  const lumin = { filter: "grayscale(1) invert(1) brightness(1.08)", opacity: 0.85 };
  const colour = { opacity: 0.92 };
  const darkened = { filter: "brightness(0.45) saturate(1.2)", opacity: 0.92 };
  let index = 0;
  return (
    <div ref={revealRef} className={`flex flex-col gap-4 sm:gap-5 ${className}`} aria-label="Corporate partners" role="group">
      {MARK_ROWS.map((row, rowIndex) => (
        <ul key={rowIndex} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-x-7">
          {row.map((mark) => {
            const ink = tone === "light" ? (mark.faint ? darkened : colour) : mark.emblem ? lumin : white;
            const { width, height } = sizeFor(mark.ratio, rowIndex);
            // A subtle staggered fade+rise, not a big reveal moment (this is
            // a credibility footnote, not the hero) -- capped so a mark deep
            // into the wall doesn't wait almost a second to appear.
            const delay = Math.min(index++ * 22, 340);
            return (
              <li
                key={mark.file}
                className="flex items-center justify-center"
                style={{ width, height, opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(6px)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/marketing/partners/${mark.file}`} alt={mark.name} loading="lazy" decoding="async" className="h-full w-full" style={{ ...ink, objectFit: "contain" }} />
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
