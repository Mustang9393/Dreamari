import Image from "next/image";
import { PartnerLogoGrid } from "./PartnerTicker";

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
  // Same scale as the Schools view's Built by Dream Opportunity section
  // (Chandu, 7 Sept 2026): the mark, a real heading, the lede, the ticker at
  // full width, with the same breathing room. No closing paragraph here.
  return (
    <section aria-labelledby="built-by-heading" className="mkt-snap relative px-6 py-20 pt-[104px] sm:py-28 md:pt-28">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <DOMark className="mb-6 h-16 w-16 sm:mb-8 sm:h-20 sm:w-20" />
        <h2 id="built-by-heading" className="max-w-[760px] text-[clamp(1.75rem,4vw,3rem)] leading-[1.08] font-extrabold text-balance" style={{ color: "var(--foreground)" }}>
          {DO_COPY.heading}
        </h2>
        <p className="mx-auto mt-5 max-w-[720px] text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
          {DO_COPY.lead}
        </p>
        {/* the closing paragraph stays on the Schools section only; the student
           stamp ends on the partners (Chandu, 7 Sept 2026). All the marks at
           once, wrapped into a grid instead of scrolling (direct feedback,
           8 Sept 2026: "all at once... way more bombastic and impressive"
           -- dreamopportunity.org's own reference), built from our own
           individual marks so the dark student site still gets them in one
           colour, not the supplied flattened full-colour wall image. */}
        <PartnerLogoGrid tone="dark" className="mx-auto mt-10 w-full max-w-[1100px] sm:mt-12" />
      </div>
    </section>
  );
}
