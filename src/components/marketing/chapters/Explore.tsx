"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A real, user-scrollable feed (native overflow-y + scroll-snap), not a scroll-triggered
// CSS animation — matches Match's card size (168 x 300 mu) per feedback that the two
// should read as the same scale of thing.
// Reframed around match strength (Strong Match/Match/Stretch/Wildcard) rather than
// world name. Photos are reused stand-ins from the shoot we already have on hand for
// Accountant/Management Analyst/Human Resources — Figma's local asset server is
// unreachable right now to pull literal photos for these four specific careers, and
// there wasn't a reasonable stand-in for Food Scientist among what's already downloaded
// (the closest photos on hand are both operating-room shots), so that card is an icon
// tile instead of a mismatched photo. Swap in real photos once Figma's back up.
const CARDS = [
  { photo: "/images/career-pe-analyst.jpg", title: "Accountant", subtitle: "Strong Match", tagColor: "#1fc76e" },
  { photo: "/images/career-ux-designer.jpg", title: "Management Analyst", subtitle: "Match", tagColor: "#3b82f6" },
  { photo: "/images/career-product-designer.jpg", title: "Human Resources", subtitle: "Stretch", tagColor: "#ffb81f" },
  { photo: null, title: "Food Scientist", subtitle: "Wildcard", tagColor: "#8b5cf6" },
];

const ACTION_ICONS = [
  // heart
  <path key="heart" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />,
  // thumbs-down
  <path key="thumbs-down" d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-2-2.3l1.4-9A2 2 0 0 1 5.57 1H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.34a2 2 0 0 0-1.82 1.18l-2.3 5.02a1.7 1.7 0 0 1-1.54.98v0A2.13 2.13 0 0 1 9 18.12Z" />,
  // bookmark
  <path key="bookmark" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />,
];

// Lucide "dollar-sign" / "graduation-cap" paths.
const STAT_ICONS = {
  salary: (
    <>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  duration: (
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>
  ),
};

export function ExploreChapter() {
  const [graphicRef, , graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Nudge: once the chapter is revealed, tease-scroll the track down a little and
  // back, so the reader's eye catches that this thing actually scrolls, then get out
  // of the way the moment they touch it themselves.
  useEffect(() => {
    if (!graphicRevealed || scrolled) return;
    const el = trackRef.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      el.scrollTo({ top: 34, behavior: "smooth" });
      setTimeout(() => {
        if (!el) return;
        el.scrollTo({ top: 0, behavior: "smooth" });
      }, 550);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [graphicRevealed, scrolled]);

  return (
    <ChapterShell
      id="explore"
      title="Explore"
      color="#1fc76e"
      oneliner="careers, companies, and pathways with depth."
      flip
      altBackground
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* aspect-ratio (not a fixed mu height) so this fits ChapterShell's shared frame
         on any viewport, matching Match's card sizing exactly: height:100% of the
         frame, width derived from the ratio, capped by max-width so it never
         overflows the frame sideways either. */}
      <div
        className="relative h-full max-w-full overflow-hidden border"
        style={{
          aspectRatio: "168 / 300",
          borderRadius: "calc(var(--mu) * 20px)",
          borderColor: "var(--glass-surface-2)",
        }}
      >
        <div
          ref={trackRef}
          className="mkt-explore-track absolute inset-0 overflow-y-auto"
          style={{ scrollSnapType: "y mandatory" }}
          onScroll={() => setScrolled(true)}
        >
          {CARDS.map((card) => (
            <div key={card.title} className="relative" style={{ height: "100%", scrollSnapAlign: "start" }}>
              {card.photo ? (
                <Image src={card.photo} alt="" fill className="object-cover" />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${card.tagColor} 35%, transparent), var(--card) 75%)` }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={card.tagColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 46px)", height: "calc(var(--mu) * 46px)", opacity: 0.6 }}>
                    <path d="M9 3v9c0 1-1 2-2 3l-4 4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1l-4-4c-1-1-2-2-2-3V3" />
                    <path d="M6 3h12M6 8h12" />
                  </svg>
                </div>
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(180deg, transparent 42%, var(--scrim-heavy) 100%)" }}
              />
              <div
                className="absolute inset-x-0 bottom-0 text-center uppercase"
                style={{ padding: "calc(var(--mu) * 10px) calc(var(--mu) * 8px)" }}
              >
                <p
                  className="whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-poster)",
                    fontSize: "calc(var(--mu) * 12px)",
                    lineHeight: 1.15,
                    letterSpacing: "0.4px",
                    color: "var(--foreground)",
                  }}
                >
                  {card.title}
                </p>
                <p
                  className="mt-1 whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "calc(var(--mu) * 7px)",
                    letterSpacing: "0.5px",
                    color: card.tagColor,
                  }}
                >
                  {card.subtitle}
                </p>
                <div className="mt-1.5 flex items-center justify-center normal-case" style={{ gap: "calc(var(--mu) * 6px)" }}>
                  {[STAT_ICONS.salary, STAT_ICONS.duration].map((icon, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center rounded-full border"
                      style={{
                        width: "calc(var(--mu) * 18px)",
                        height: "calc(var(--mu) * 18px)",
                        background: "var(--glass-surface-1)",
                        borderColor: "var(--glass-border)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--foreground)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: "calc(var(--mu) * 9px)", height: "calc(var(--mu) * 9px)", flex: "none" }}
                      >
                        {icon}
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right-side action rail, straight off the reference — static, just selling
           the "real app feed" read. */}
        <div
          className="pointer-events-none absolute flex flex-col items-center"
          style={{ right: "calc(var(--mu) * 10px)", bottom: "calc(var(--mu) * 46px)", gap: "calc(var(--mu) * 10px)" }}
        >
          {ACTION_ICONS.map((icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-full border"
              style={{
                width: "calc(var(--mu) * 26px)",
                height: "calc(var(--mu) * 26px)",
                background: "var(--glass-surface-1)",
                borderColor: "var(--glass-border)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "calc(var(--mu) * 13px)", height: "calc(var(--mu) * 13px)" }}
              >
                {icon}
              </svg>
            </div>
          ))}
        </div>

        {/* Scroll nudge: fades out the moment the reader scrolls it themselves. */}
        {!scrolled && (
          <div
            className="mkt-explore-nudge pointer-events-none absolute inset-x-0 flex flex-col items-center"
            style={{ bottom: "calc(var(--mu) * 12px)", gap: "calc(var(--mu) * 2px)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 16px)", height: "calc(var(--mu) * 16px)" }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
      </div>
    </ChapterShell>
  );
}
