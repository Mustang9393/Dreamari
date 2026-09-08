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
// reference order closely, it should match it exactly") -- grouped into the
// same row breaks as the reference itself, not left to any automatic
// wrapping algorithm to (possibly) reproduce by coincidence. See MARK_ROWS
// below, which is the actual row structure rendered; this flat MARKS array
// (reference order, ungrouped) only feeds the scrolling ticker, which has
// no rows to match. Nickelodeon and MTV are out: a splat or a filled block
// with text inside does not survive a silhouette. Five marks on the
// reference wall are still not included -- see ATTRIBUTION.md for exactly
// why each one is missing (MAGIC and Taylor & Francis' current mark: fetch
// blocked/not on Commons; NCSolutions: folded into Circana, no standalone
// mark left to source; "McDermott Will & Schulte" and the plain "[A|B]"
// bracket icon: neither could be confidently identified to a real,
// correctly-spelled trademark; a fifth mark transcribed as "Amazon Ben"
// could not be matched to any real brand after a direct search -- flagged
// rather than guessed, pending Mika's reference folder).
const MARK_ROWS: Mark[][] = [
  [
    { name: "JPMorgan Chase", file: "jpmorgan-chase.svg", ratio: 7.051 },
    { name: "Chase", file: "chase.svg", ratio: 5.363, emblem: true },
    { name: "AT&T", file: "att.png", ratio: 2.432, faint: true },
  ],
  [
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
    { name: "GDC", file: "gdc.svg", ratio: 2.883 },
    { name: "Pringles", file: "pringles.svg", ratio: 0.804, emblem: true },
  ],
  [
    { name: "MD&M", file: "mdm.png", ratio: 2.975 },
    { name: "HSBC", file: "hsbc.svg", ratio: 3.716, emblem: true },
    { name: "Warner Bros. Discovery", file: "wbd.svg", ratio: 4.916, emblem: true },
    { name: "Amazon", file: "amazon.svg", ratio: 3.309 },
    { name: "Colgate", file: "colgate.svg", ratio: 4.857, emblem: true },
  ],
  [
    { name: "Enterprise Connect", file: "enterprise-connect.png", ratio: 6.466 },
    { name: "Akamai", file: "akamai.svg", ratio: 2.455 },
    { name: "The AI Summit London", file: "ai-summit-london.png", ratio: 3.579 },
    { name: "WildBrain", file: "wildbrain.svg", ratio: 7.814 },
    { name: "Nielsen", file: "nielsen.svg", ratio: 2.836 },
  ],
  [
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
  const [revealRef, revealed] = useRevealOnScroll<HTMLDivElement>();
  const white = { filter: "brightness(0) invert(1)", opacity: 0.8 };
  const lumin = { filter: "grayscale(1) invert(1) brightness(1.08)", opacity: 0.85 };
  const colour = { opacity: 0.92 };
  const darkened = { filter: "brightness(0.45) saturate(1.2)", opacity: 0.92 };
  // Rendered as MARK_ROWS' own explicit rows, not one flowing list left to
  // wrap on its own (direct feedback, 8 Sept 2026: match the reference
  // exactly, row for row -- flex-wrap/grid both pick row breaks by
  // container width and item count, which can't guarantee any SPECIFIC
  // grouping). Each row distributes only its own marks across the full
  // width (justify-between), so a 3-mark row and an 8-mark row both read as
  // a full, intentional row rather than one looking sparse next to another.
  let markIndex = 0;
  return (
    <div ref={revealRef} className={`flex flex-col gap-y-7 ${className}`} aria-label="Corporate partners" role="group">
      {/* flex-wrap on a longer row (6-8 marks) re-created the same "orphaned
         last item" symptom, just localized to one row once that row's own
         marks stopped fitting one line -- flex-nowrap plus overflow-x-auto
         guarantees a row can NEVER wrap into an uneven second line; the
         fallback on a narrow viewport is a horizontal swipe on that one
         row, the same pattern this codebase already uses for poster rails,
         not a broken layout. */}
      {MARK_ROWS.map((row, rowIndex) => (
        <ul key={rowIndex} className="flex flex-nowrap items-center justify-between gap-x-8 gap-y-4 overflow-x-auto sm:gap-x-10 [scrollbar-width:none]">
          {row.map((mark) => {
            const size = sizeFor(mark.ratio);
            const ink = tone === "light" ? (mark.faint ? darkened : colour) : mark.emblem ? lumin : white;
            // A subtle staggered fade+rise, not a big reveal moment (this is
            // a credibility footnote, not the hero) -- capped so a mark deep
            // into the wall doesn't wait almost a second to appear.
            const delay = Math.min(markIndex++ * 22, 340);
            return (
              <li
                key={mark.file}
                className="flex flex-none items-center justify-center"
                style={{ height: MAX_H, opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(6px)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/marketing/partners/${mark.file}`} alt={mark.name} width={size.width} height={size.height} loading="lazy" decoding="async" style={{ width: size.width, height: size.height, ...ink, objectFit: "contain" }} />
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
