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
// matching the reference's own irregular row lengths didn't). This grouping
// is kept only because it's still the easiest way to review the order
// against the reference image row by row. Nickelodeon and MTV are out: a
// splat or a filled block with text inside does not survive the dark
// student page's flat-white silhouette treatment (the light Schools page
// keeps real colour, so this is a dark-mode-only limitation, not fixed
// here). Mars, McDermott Will & Schulte, NCSolutions and an Amazon+BEN
// composite were added in a later pass -- see ATTRIBUTION.md. Still not
// included: MAGIC and Taylor & Francis' current mark (their sites 403 every
// fetch attempt) and the plain "[A|B]" bracket icon (can't identify to any
// real trademark from the image alone).
const MARK_ROWS: Mark[][] = [
  [
    { name: "JPMorgan Chase", file: "jpmorgan-chase.svg", ratio: 7.051 },
    { name: "Chase", file: "chase.svg", ratio: 5.363, emblem: true },
    { name: "AT&T", file: "att.png", ratio: 2.432, faint: true },
  ],
  [
    { name: "Mars", file: "mars.svg", ratio: 3.396 },
    { name: "Kellanova", file: "kellanova.svg", ratio: 3.954 },
    { name: "Kellogg's", file: "kelloggs.svg", ratio: 2.858 },
    { name: "Informa", file: "informa.svg", ratio: 4.898 },
  ],
  [
    { name: "BioProcess International", file: "bioprocess-international.png", ratio: 3.593 },
    { name: "Brookfield", file: "brookfield.svg", ratio: 6.679 },
    { name: "Blackstone", file: "blackstone.svg", ratio: 6.29, faint: true },
    { name: "SupplySide Global", file: "supplyside-global.png", ratio: 2.599 },
    { name: "EY", file: "ey.svg", ratio: 0.987 },
    { name: "MRO", file: "mro.png", ratio: 2.2 },
  ],
  [
    { name: "Natural Products Expo West", file: "expo-west.png", ratio: 2.381 },
    { name: "Brand Licensing Europe", file: "brand-licensing-europe.png", ratio: 1.979 },
    { name: "Pop-Tarts", file: "pop-tarts.png", ratio: 1.536, emblem: true },
    { name: "IWCE", file: "iwce.png", ratio: 3.3 },
    { name: "MAGIC", file: "magic.png", ratio: 2.599 },
    { name: "GDC", file: "gdc.svg", ratio: 2.883 },
    { name: "Pringles", file: "pringles.svg", ratio: 0.804, emblem: true },
  ],
  [
    { name: "MD&M", file: "mdm.png", ratio: 2.975 },
    { name: "HSBC", file: "hsbc.svg", ratio: 3.716, emblem: true },
    { name: "Warner Bros. Discovery", file: "wbd.svg", ratio: 4.916, emblem: true },
    { name: "Amazon (Black Employee Network)", file: "amazon-ben.svg", ratio: 2.362 },
    { name: "Colgate", file: "colgate.svg", ratio: 4.857, emblem: true },
  ],
  [
    { name: "Enterprise Connect", file: "enterprise-connect.png", ratio: 6.466 },
    { name: "Akamai", file: "akamai.svg", ratio: 2.455 },
    { name: "Paramount", file: "paramount.svg", ratio: 1.255 },
    { name: "The AI Summit London", file: "ai-summit-london.png", ratio: 3.579 },
    { name: "WildBrain", file: "wildbrain.svg", ratio: 7.814 },
    { name: "Taylor & Francis", file: "taylor-francis.svg", ratio: 4.179 },
    { name: "Nielsen", file: "nielsen.svg", ratio: 2.836 },
  ],
  [
    { name: "McDermott Will & Schulte", file: "mcdermott.png", ratio: 3.495 },
    { name: "NCSolutions", file: "ncsolutions.png", ratio: 5.951 },
    { name: "Kroll", file: "kroll.svg", ratio: 4.312 },
    { name: "Yahoo", file: "yahoo.svg", ratio: 3.606 },
    { name: "VH1", file: "vh1.svg", ratio: 2.558 },
    { name: "Verizon", file: "verizon.svg", ratio: 4.461 },
    { name: "Peloton", file: "peloton.svg", ratio: 3.407 },
  ],
  [
    { name: "Jimmy Choo", file: "jimmy-choo.svg", ratio: 7.203 },
    { name: "Versace", file: "versace.svg", ratio: 4.515 },
    { name: "BET", file: "bet.svg", ratio: 3.169, emblem: true },
    { name: "Bleacher Report", file: "bleacher-report.svg", ratio: 3.273, emblem: true },
    { name: "Michael Kors", file: "michael-kors.svg", ratio: 10.517 },
    { name: "Cartoon Network", file: "cartoon-network.svg", ratio: 1.671, emblem: true },
    { name: "DC", file: "dc.svg", ratio: 1, emblem: true },
    { name: "TNT", file: "tnt.svg", ratio: 1, emblem: true },
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
