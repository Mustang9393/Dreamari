"use client";

import { useRevealOnScroll } from "./scrollHooks";

// The corporate partners as one slow marquee under the Dream Opportunity
// credibility lines (Joshua Pierce, Slack, 6 Sept 2026; ticker per Chandu,
// 7 Sept 2026). The set is the real partner wall's brands, as vector marks we
// host ourselves (public/images/marketing/partners; sources in ATTRIBUTION.md).
//
// Every mark is scaled by its INK, not by its file frame: each SVG was
// trimmed to the drawn pixels, and the size below gives every logo the same
// visual mass (constant ink area, clamped to a readable height and a sane
// width), so a square mark and a long wordmark weigh the same in the row.
const INK_AREA = 27 * 27 * 2.6;
const MIN_H = 16, MAX_H = 30, MAX_W = 150;

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
// reference order closely, it should match it exactly"). Rendered as one
// flat, uniform grid now (see PartnerLogoGrid below) rather than these exact
// row breaks -- see ATTRIBUTION.md for why (a fixed rectangle with equal
// cells reads as symmetric regardless of each row's item count, where
// matching the reference's own irregular row lengths didn't).
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
const MARKS: Mark[] = MARK_ROWS.flat();

function sizeFor(ratio: number) {
  let h = Math.sqrt(INK_AREA / ratio);
  h = Math.max(MIN_H, Math.min(MAX_H, h));
  let w = h * ratio;
  if (w > MAX_W) { w = MAX_W; h = MAX_W / ratio; }
  return { width: Math.round(w), height: Math.round(h) };
}

/** All the marks at once, wrapped into a dense grid instead of a scrolling
 *  row (direct feedback, 8 Sept 2026: "all at once... way more bombastic
 *  and impressive," dreamopportunity.org's own reference) -- but built from
 *  our own individually-hosted vector marks, not the supplied flattened
 *  wall image, so it still carries the ticker's own rule: one colour
 *  (white) on the dark student site, real brand colour on the light
 *  Schools page. Same ink-area sizing as the ticker, so the grid and the
 *  ticker never disagree about how big a mark should read. */
export function PartnerLogoGrid({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const [revealRef, revealed] = useRevealOnScroll<HTMLUListElement>();
  const white = { filter: "brightness(0) invert(1)", opacity: 0.8 };
  const lumin = { filter: "grayscale(1) invert(1) brightness(1.08)", opacity: 0.85 };
  const colour = { opacity: 0.92 };
  const darkened = { filter: "brightness(0.45) saturate(1.2)", opacity: 0.92 };
  // A real CSS grid with a FIXED column count and EQUAL-SIZE cells (direct
  // feedback, 8 Sept 2026: "always form a symmetric shape... a perfect
  // rectangle... some need to be scaled up or scaled down to fit"). Row
  // arrays sized to each row's own natural ink (the previous two attempts)
  // could never form one, because a wordmark and an icon-plus-wordmark mark
  // are never the same width -- so every row either stretched into huge
  // gaps (justify-between) or packed to a different natural width than its
  // neighbours (justify-start), and the grid read as uneven either way. This
  // scales every mark to fit the SAME fixed cell size (object-fit: contain),
  // so every row has identical cell widths and genuinely lines up into
  // columns, the way the reference wall's own grid does. One column count
  // for every viewport (not responsive breakpoints swapping it out) so the
  // rectangle's shape itself never changes, only each cell's absolute size.
  const COLS = 7;
  return (
    <ul ref={revealRef} className={`grid gap-3 sm:gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-label="Corporate partners" role="group">
      {MARKS.map((mark, index) => {
        const ink = tone === "light" ? (mark.faint ? darkened : colour) : mark.emblem ? lumin : white;
        // A subtle staggered fade+rise, not a big reveal moment (this is a
        // credibility footnote, not the hero) -- capped so a mark deep into
        // the wall doesn't wait almost a second to appear.
        const delay = Math.min(index * 22, 340);
        return (
          <li
            key={mark.file}
            className="flex aspect-[3/2] items-center justify-center rounded-[var(--radius-sm)] p-2"
            style={{ opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(6px)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/marketing/partners/${mark.file}`} alt={mark.name} loading="lazy" decoding="async" className="h-full w-full" style={{ ...ink, objectFit: "contain" }} />
          </li>
        );
      })}
    </ul>
  );
}
