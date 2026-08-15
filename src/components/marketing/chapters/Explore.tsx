"use client";

import Image from "next/image";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A doomscroll through three career cards (Figma "Mobile Explore" reference), settling
// on the chapter's own target world (Investing) — quick, smooth, one continuous track.
const CARDS = [
  { photo: "/images/career-neurosurgeon.jpg", title: "Neurosurgeon", subtitle: "Health", worldColor: "var(--world-health-medicine)" },
  { photo: "/images/career-product-designer.jpg", title: "Product Designer", subtitle: "Tech", worldColor: "var(--world-tech-engineering-design)" },
  { photo: "/images/career-pe-analyst.jpg", title: "Private Equity Analyst", subtitle: "Investing", worldColor: "var(--world-business-money-office)" },
];

const ACTION_ICONS = [
  // heart
  <path key="heart" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />,
  // thumbs-down
  <path key="thumbs-down" d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-2-2.3l1.4-9A2 2 0 0 1 5.57 1H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.34a2 2 0 0 0-1.82 1.18l-2.3 5.02a1.7 1.7 0 0 1-1.54.98v0A2.13 2.13 0 0 1 9 18.12Z" />,
  // bookmark
  <path key="bookmark" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />,
];

export function ExploreChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="explore"
      eyebrow="Chapter Four"
      title="Explore"
      color="#1fc76e"
      oneliner="13 worlds. Still shaped around you."
      flip
      altBackground
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div
        className="relative overflow-hidden border"
        style={{
          width: "calc(var(--mu) * 168px)",
          height: "calc(var(--mu) * 300px)",
          borderRadius: "calc(var(--mu) * 20px)",
          borderColor: "var(--glass-surface-2)",
        }}
      >
        <div className="mkt-explore-track absolute inset-0" style={{ height: "300%" }}>
          {CARDS.map((card) => (
            <div key={card.title} className="relative" style={{ height: "33.3333%" }}>
              <Image src={card.photo} alt="" fill className="object-cover" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(180deg, transparent 55%, var(--scrim-heavy) 100%)" }}
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
                    color: card.worldColor,
                  }}
                >
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right-side action rail, straight off the reference — static, not part of the
           scroll animation, just selling the "real app feed" read. */}
        <div
          className="absolute flex flex-col items-center"
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
      </div>
    </ChapterShell>
  );
}
