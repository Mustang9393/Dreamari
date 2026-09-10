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
    <div className={className} aria-label="Corporate partners" role="group">
      <Image
        src="/images/marketing/partners/partner-composition.png"
        width={1920}
        height={1080}
        alt=""
        unoptimized
        loading="lazy"
        className="block h-auto w-full"
        // Preserve the internal shading and lettering of badges (GDC,
        // Pop-Tarts, IWCE, etc.) instead of flattening them to silhouettes.
        style={tone === "dark" ? { filter: "grayscale(1) invert(1) contrast(0.6) brightness(1.4)", opacity: 0.85 } : undefined}
      />
      <ul className="sr-only">
        {PARTNERS.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </div>
  );
}
