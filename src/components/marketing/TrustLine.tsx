"use client";

import { useRevealOnScroll } from "./scrollHooks";

// Two credibility lines before the closing CTA on both landing pages (Joshua
// Pierce, Slack, 6 Sept 2026; both pages per Chandu, 7 Sept): the corporate
// network and the school work. The partner marks run as a ticker under the
// lines (PartnerTicker).
export function TrustLine({ className = "pt-16 sm:pt-20" }: { className?: string }) {
  const [revealRef, revealed] = useRevealOnScroll<HTMLDivElement>();
  return (
    // `relative` lifts the lines above the page's absolute colour wash; the
    // top padding keeps them clear of the fixed nav if the section snaps
    <div
      ref={revealRef}
      className={`relative mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pb-2 text-center ${className}`}
      style={{ opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(12px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
    >
      <p className="text-[13px] leading-[20px] sm:text-[14px] sm:leading-[22px]" style={{ color: "var(--muted-foreground)" }}>
        Powered by insights from Dream Opportunity and leading corporate partners.
        <br />
        Informed by Dream Opportunity&rsquo;s work with 100+ schools.
      </p>
    </div>
  );
}
