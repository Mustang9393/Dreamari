import Image from "next/image";
import { PartnerTicker } from "./PartnerTicker";

// The one place the Dream Opportunity credibility copy lives. The Schools view
// renders it as a full section ("Built by Dream Opportunity"); the student
// site renders BuiltByStamp, a quiet strip above the footer. Wording is
// contractual (given verbatim, 6 Sept 2026): 100+ schools, eight countries,
// 12 years of impact. Do not paraphrase.
export const DO_COPY = {
  heading: "Dreamari is created by Dream Opportunity",
  lead: "Dream Opportunity works with more than 100 schools across eight countries and partners with the following brands:",
  close:
    "After 12 years of impact, we will scale our reach by providing students of all backgrounds with insights gained from our corporate partnerships and deep industry expertise, empowering them to explore and achieve their dream careers.",
} as const;

// The real partner set (JPMorgan Chase, Chase, AT&T, Kellanova, Kellogg's,
// informa, EY, HSBC, Blackstone, Warner Bros. Discovery, Amazon, Colgate,
// Pringles, Verizon, Nielsen, Yahoo, Versace, Michael Kors, Nickelodeon, MTV,
// VH1, BET, DC, TNT and more), cut from the supplied partner-logo-wall.png
// to the logos' own bounding box (826x455, no baked-in margin), so the even
// padding around them is the card's, not the picture's. The logos are
// full-colour on white, so the wall always sits on a white card with a
// hairline, whichever theme the page is in.
const WALL = { src: "/images/marketing/partner-logos.webp", width: 826, height: 455 };

// The Dream Opportunity mark, from the supplied vectorised logo. The vector
// trace bakes its own off-white ground into the letter counters, so the mark
// always sits on a white tile; the tile's hairline matches the logo wall's.
export function DOMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-2xl border ${className}`}
      style={{ background: "#ffffff", borderColor: "var(--border)" }}
    >
      <Image src="/images/marketing/dream-opportunity-mark.svg" width={2160} height={2160} alt="Dream Opportunity" className="h-full w-full" />
    </span>
  );
}

type PartnerLogoWallProps = {
  // "full" is the Schools section (wide, generous padding); "compact" is the
  // student footer stamp (narrower, lighter, reads as a signature).
  size?: "full" | "compact";
  className?: string;
};

export function PartnerLogoWall({ size = "full", className = "" }: PartnerLogoWallProps) {
  const full = size === "full";
  return (
    <div
      className={`${full ? "rounded-[24px] p-6 sm:p-10 lg:p-12" : "rounded-2xl p-4 sm:p-6"} border ${className}`}
      style={{
        background: "#ffffff",
        borderColor: full ? "color-mix(in srgb, var(--foreground) 10%, transparent)" : "color-mix(in srgb, var(--foreground) 10%, transparent)",
        boxShadow: full ? "0 32px 70px -34px rgba(5,7,15,0.35), 0 2px 6px -2px rgba(5,7,15,0.12)" : "none",
      }}
    >
      <Image
        src={WALL.src}
        width={WALL.width}
        height={WALL.height}
        sizes={full ? "(max-width: 900px) 84vw, 830px" : "(max-width: 700px) 80vw, 520px"}
        alt="Dream Opportunity partner brands, including JPMorgan Chase, Chase, AT&T, Kellanova, Kellogg's, informa, EY, HSBC, Blackstone, Warner Bros. Discovery, Amazon, Colgate, Pringles, Verizon, Nielsen, Yahoo, Versace, Michael Kors, Nickelodeon, MTV, VH1, BET, DC and TNT"
        className="h-auto w-full"
      />
    </div>
  );
}

// Student-site credibility stamp: sits between the closing CTA and Footer.
// Deliberately an afterthought in tone (small type, muted colour, narrow
// column), never a competing section. `relative` for the same reason Footer
// is: MarketingApp's ambient wash is an absolutely positioned sibling and
// would otherwise paint over this static block. On phones the landing is a
// y-mandatory pager (globals.css), so the stamp is its own page (`mkt-snap`),
// otherwise the CTA-to-footer run is taller than a screen and its middle can
// never come to rest in view; the phone-only top padding is ChapterShell's
// 72px, so the heading lands under the nav island's zone, not behind it.
export function BuiltByStamp() {
  return (
    <section aria-labelledby="built-by-heading" className="mkt-snap relative mt-6 px-6 pt-[72px] sm:mt-10 md:pt-0">
      <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
        {/* the Dream Opportunity mark leads, as on the Schools section (Chandu, 7 Sept 2026) */}
        <DOMark className="mb-4 h-14 w-14" />
        <h2 id="built-by-heading" className="text-[15px] font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          {DO_COPY.heading}
        </h2>
        <p className="mt-2 max-w-[520px] text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {DO_COPY.lead}
        </p>
        {/* the partners as the ticker (Chandu, 7 Sept 2026): one partner display
           per page, and it lives here with the Dream Opportunity copy */}
        <PartnerTicker className="mt-6 w-full max-w-[720px]" />
        <p className="mt-5 max-w-[560px] text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {DO_COPY.close}
        </p>
      </div>
    </section>
  );
}
