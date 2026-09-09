"use client";

import { useRevealOnScroll } from "./scrollHooks";

// Two credibility lines before the Schools closing CTA (Joshua Pierce, Slack,
// 6 Sept 2026): the corporate network and the school work. Schools view only
// (Chandu, 6 Sept): the student landing page does not carry them. The
// partner logo row that was to sit under the lines is held until the partner
// list is confirmed.
export function TrustLine() {
  const [revealRef, revealed] = useRevealOnScroll<HTMLDivElement>();
  return (
    // `relative` lifts the lines above the page's absolute colour wash; the
    // top padding keeps them clear of the fixed nav if the section snaps
    <div
      ref={revealRef}
      className="relative mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pt-16 pb-2 text-center sm:pt-20"
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
