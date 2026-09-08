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
// Order (Chandu, 7 Sept 2026): the finance and consulting names students
// recognise first, then the rest of the wall. Nickelodeon and MTV are out:
// a splat or a filled block with text inside does not survive a silhouette.
const MARKS: Mark[] = [
  { name: "JPMorgan Chase", file: "jpmorgan-chase.svg", ratio: 7.051 },
  { name: "Amazon", file: "amazon.svg", ratio: 3.309 },
  { name: "EY", file: "ey.svg", ratio: 0.987 },
  { name: "Kroll", file: "kroll.svg", ratio: 4.312 },
  { name: "Goldman Sachs", file: "goldman-sachs.svg", ratio: 2.386, faint: true },
  { name: "Chase", file: "chase.svg", ratio: 5.363, emblem: true },
  { name: "HSBC", file: "hsbc.svg", ratio: 3.716, emblem: true },
  { name: "Blackstone", file: "blackstone.svg", ratio: 6.29, faint: true },
  { name: "Brookfield", file: "brookfield.svg", ratio: 6.679 },
  { name: "AT&T", file: "att.png", ratio: 2.432, faint: true },
  { name: "Akamai", file: "akamai.svg", ratio: 2.455 },
  { name: "Verizon", file: "verizon.svg", ratio: 4.461 },
  { name: "Kellanova", file: "kellanova.svg", ratio: 3.954 },
  { name: "Pop-Tarts", file: "pop-tarts.png", ratio: 1.536, emblem: true },
  { name: "Kellogg's", file: "kelloggs.svg", ratio: 2.858 },
  { name: "Informa", file: "informa.svg", ratio: 4.898 },
  { name: "Paramount", file: "paramount.svg", ratio: 1.255 },
  { name: "Warner Bros. Discovery", file: "wbd.svg", ratio: 4.916, emblem: true },
  { name: "WildBrain", file: "wildbrain.svg", ratio: 7.814 },
  { name: "Colgate", file: "colgate.svg", ratio: 4.857, emblem: true },
  { name: "Nielsen", file: "nielsen.svg", ratio: 2.836 },
  { name: "Yahoo", file: "yahoo.svg", ratio: 3.606 },
  { name: "Bleacher Report", file: "bleacher-report.svg", ratio: 3.273, emblem: true },
  { name: "Versace", file: "versace.svg", ratio: 4.515 },
  { name: "Jimmy Choo", file: "jimmy-choo.svg", ratio: 7.203 },
  { name: "Michael Kors", file: "michael-kors.svg", ratio: 10.517 },
  { name: "VH1", file: "vh1.svg", ratio: 2.558 },
  { name: "BET", file: "bet.svg", ratio: 3.169, emblem: true },
  { name: "Cartoon Network", file: "cartoon-network.svg", ratio: 1.671, emblem: true },
  { name: "DC", file: "dc.svg", ratio: 1, emblem: true },
  { name: "TNT", file: "tnt.svg", ratio: 1, emblem: true },
];

function sizeFor(ratio: number) {
  let h = Math.sqrt(INK_AREA / ratio);
  h = Math.max(MIN_H, Math.min(MAX_H, h));
  let w = h * ratio;
  if (w > MAX_W) { w = MAX_W; h = MAX_W / ratio; }
  return { width: Math.round(w), height: Math.round(h) };
}

// tone: the Schools view is light, so its marks are ink silhouettes; the
// student landing is dark, so they are white ones.
export function PartnerTicker({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  // One rule per ground (Chandu, 7 Sept 2026: all or nothing). The light
  // Schools page shows every mark in its own brand colours, EY's yellow beam
  // included. The dark student page shows every mark in one-colour white,
  // each brand's reversed one-colour logo: flat white for wordmarks, and
  // inverted by luminance for emblems whose white counters are painted
  // (HSBC's hexagon, the Warner Bros. shield), so they never turn into blocks.
  const white = { filter: "brightness(0) invert(1)", opacity: 0.8 };
  const lumin = { filter: "grayscale(1) invert(1) brightness(1.08)", opacity: 0.85 };
  const colour = { opacity: 0.92 };
  const darkened = { filter: "brightness(0.45) saturate(1.2)", opacity: 0.92 };
  // two copies of the row, translated by half: a seamless loop
  const row = (copy: number) => (
    <ul aria-hidden={copy === 1} className="mkt-ticker-row flex flex-none items-center gap-x-12 pr-12 sm:gap-x-14 sm:pr-14">
      {MARKS.map((mark) => {
        const size = sizeFor(mark.ratio);
        const file = mark.file;
        const ink = tone === "light" ? (mark.faint ? darkened : colour) : mark.emblem ? lumin : white;
        return (
          <li key={mark.file} className="flex flex-none items-center" style={{ height: MAX_H }}>
            {/* eager, never lazy: marks sliding in from outside the viewport on a
               transformed track never trigger a lazy load and left holes in the row */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/marketing/partners/${file}`} alt={copy === 0 ? mark.name : ""} width={size.width} height={size.height} decoding="async" style={{ width: size.width, height: size.height, ...ink, objectFit: "contain" }} />
          </li>
        );
      })}
    </ul>
  );
  return (
    <div className={`mkt-ticker relative w-full overflow-hidden ${className}`} aria-label="Corporate partners" role="group">
      <div className="mkt-ticker-track flex w-max">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
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
  return (
    <ul ref={revealRef} className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10 sm:gap-y-7 ${className}`} aria-label="Corporate partners" role="group">
      {MARKS.map((mark, index) => {
        const size = sizeFor(mark.ratio);
        const ink = tone === "light" ? (mark.faint ? darkened : colour) : mark.emblem ? lumin : white;
        // A subtle staggered fade+rise, not a big reveal moment (this is a
        // credibility footnote, not the hero) -- capped so mark 22 doesn't
        // wait almost a second to appear.
        const delay = Math.min(index * 22, 340);
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
  );
}
