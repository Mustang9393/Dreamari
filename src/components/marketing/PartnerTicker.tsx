import Image from "next/image";

const PARTNERS = [
  "JPMorgan Chase",
  "Chase",
  "AT&T",
  "Mars",
  "Kellanova",
  "Informa",
  "EY",
  "BioProcess International",
  "Brookfield",
  "Blackstone",
  "SupplySide Global",
  "MRO",
  "Natural Products Expo West",
  "Brand Licensing Europe",
  "Pop-Tarts",
  "IWCE",
  "MAGIC",
  "GDC",
  "AllianceBernstein",
  "Pringles",
  "MD&M",
  "HSBC",
  "Warner Bros. Discovery",
  "Amazon (Black Employee Network)",
  "Colgate",
  "Enterprise Connect",
  "Akamai",
  "Paramount",
  "MTV",
  "The AI Summit London",
  "WildBrain",
  "Taylor & Francis",
  "Nielsen",
  "McDermott Will & Schulte",
  "NCSolutions",
  "Kroll",
  "Yahoo",
  "VH1",
  "Verizon",
  "Peloton",
  "Adult Swim",
  "Jimmy Choo",
  "Nickelodeon",
  "Versace",
  "BET",
  "Bleacher Report",
  "Michael Kors",
  "Cartoon Network",
  "DC",
  "TNT",
] as const;

/** The original transparent partner artwork is the layout source of truth.
 * Keep its 1920 × 1080 canvas intact: equal-area sizing, flex wrapping, or
 * independently centering rows changes the reference's deliberate overlaps
 * and relative logo sizes. Both audiences scale the same composition.
 */
export function PartnerLogoGrid({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    // Colour logos everywhere (13 Oct 2026, Chandu: "use colored logos
    // instead of the black and white ones"). On a dark page the wall sits on
    // a white panel, the way a sponsor wall does, so the black marks
    // (JPMorgan, Brand Licensing, Jimmy Choo, Versace) still read; the old
    // greyscale-invert filter is gone.
    <div className={`${className} ${tone === "dark" ? "rounded-[24px] bg-white px-[clamp(12px,3vw,40px)] py-[clamp(10px,2.4vw,32px)]" : ""}`} style={tone === "dark" ? { boxShadow: "0 30px 80px -40px rgba(0,0,0,0.7)" } : undefined} aria-label="Corporate partners" role="group">
      <Image
        src="/images/marketing/partners/partner-composition.png"
        width={1920}
        height={1080}
        alt=""
        unoptimized
        loading="lazy"
        className="block h-auto w-full"
      />
      <ul className="sr-only">
        {PARTNERS.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </div>
  );
}

/** How many partner marks the wall shows; the Schools stats band reads it. */
export const PARTNER_COUNT = PARTNERS.length;
