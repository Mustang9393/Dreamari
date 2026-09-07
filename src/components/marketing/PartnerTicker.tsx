"use client";

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

type Mark = { name: string; file: string; ratio: number };
const MARKS: Mark[] = [
  { name: "JPMorgan Chase", file: "jpmorgan-chase.svg", ratio: 7.051 },
  { name: "Chase", file: "chase.svg", ratio: 5.363 },
  { name: "AT&T", file: "att.png", ratio: 2.432 },
  { name: "Kellanova", file: "kellanova.svg", ratio: 3.954 },
  { name: "Kellogg's", file: "kelloggs.svg", ratio: 2.858 },
  { name: "Informa", file: "informa.svg", ratio: 4.898 },
  { name: "EY", file: "ey.svg", ratio: 0.987 },
  { name: "HSBC", file: "hsbc.svg", ratio: 3.716 },
  { name: "Blackstone", file: "blackstone.svg", ratio: 6.29 },
  { name: "Warner Bros. Discovery", file: "wbd.svg", ratio: 4.916 },
  { name: "Amazon", file: "amazon.svg", ratio: 3.309 },
  { name: "Colgate", file: "colgate.svg", ratio: 4.857 },
  { name: "Verizon", file: "verizon.svg", ratio: 4.461 },
  { name: "Nielsen", file: "nielsen.svg", ratio: 2.836 },
  { name: "Yahoo", file: "yahoo.svg", ratio: 3.606 },
  { name: "Versace", file: "versace.svg", ratio: 4.515 },
  { name: "Michael Kors", file: "michael-kors.svg", ratio: 10.517 },
  { name: "Nickelodeon", file: "nickelodeon.svg", ratio: 1.313 },
  { name: "VH1", file: "vh1.svg", ratio: 2.558 },
  { name: "BET", file: "bet.svg", ratio: 3.169 },
  { name: "DC", file: "dc.svg", ratio: 1 },
  { name: "TNT", file: "tnt.svg", ratio: 1 },
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
  const ink = tone === "light" ? { filter: "brightness(0)", opacity: 0.62 } : { filter: "brightness(0) invert(1)", opacity: 0.75 };
  // two copies of the row, translated by half: a seamless loop
  const row = (copy: number) => (
    <ul aria-hidden={copy === 1} className="mkt-ticker-row flex flex-none items-center gap-x-12 pr-12 sm:gap-x-14 sm:pr-14">
      {MARKS.map((mark) => {
        const size = sizeFor(mark.ratio);
        return (
          <li key={mark.file} className="flex flex-none items-center" style={{ height: MAX_H }}>
            {/* one ink for every mark: silhouettes in the page's ink */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/marketing/partners/${mark.file}`} alt={copy === 0 ? mark.name : ""} width={size.width} height={size.height} loading="lazy" decoding="async" style={{ width: size.width, height: size.height, ...ink, objectFit: "contain" }} />
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
