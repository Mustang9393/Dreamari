"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A real, user-scrollable feed (native overflow-y + scroll-snap), not a scroll-triggered
// CSS animation — matches Match's card size (168 x 300 mu) per feedback that the two
// should read as the same scale of thing.
// The industry line ("Business & Finance," same world every card in this storyboard
// belongs to) stays where it always was, under the title; match strength (Strong
// Match/Match/Stretch/Wildcard) is a separate corner-ribbon badge rather than replacing
// it — the two say different things and shouldn't compete for the same line. Photos are
// reused stand-ins from the shoot we already have on hand — none of these four are
// literal photoshoots of these specific careers (Figma's local asset server is
// unreachable to pull those), so Food Scientist reuses the closest thing on hand among
// lab/clinical-coded shots rather than going without a photo. Salary bands are the same
// standard entry-level estimates used in Match, not sourced from the taxonomy sheet
// (which has no salary column filled in).
const INDUSTRY = "Business & Finance";

const CARDS = [
  { photo: "/images/career-pe-analyst.jpg", title: "Accountant", matchLevel: "Strong Match", tagColor: "#1fc76e", salary: "$50K-85K", major: "Accounting" },
  { photo: "/images/career-ux-designer.jpg", title: "Management Analyst", matchLevel: "Match", tagColor: "#3b82f6", salary: "$70K-100K", major: "Business Administration" },
  { photo: "/images/career-product-designer.jpg", title: "Human Resources", matchLevel: "Stretch", tagColor: "#ffb81f", salary: "$55K-90K", major: "Human Resources" },
  { photo: "/images/career-neurosurgeon.jpg", title: "Food Scientist", matchLevel: "Wildcard", tagColor: "#8b5cf6", salary: "$60K-95K", major: "Food Science" },
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

// Same length-tiered sizing problem Match's poster titles solve: a flat font size let
// longer titles ("Management Analyst") run into the right-side action rail. Shorter
// titles get to be genuinely big; longer ones step down and, past a point, wrap.
function exploreTitleStyle(title: string): React.CSSProperties {
  if (title.length <= 10) return { fontSize: "calc(var(--mu) * 21px)", whiteSpace: "nowrap" };
  if (title.length <= 16) return { fontSize: "calc(var(--mu) * 18px)", whiteSpace: "normal" };
  return { fontSize: "calc(var(--mu) * 15px)", whiteSpace: "normal" };
}

type Card = (typeof CARDS)[number];

// Shared between a plain card and the holo-framed Wildcard variant below, so the two
// don't drift out of sync with duplicated markup.
function ExploreCardBody({ card }: { card: Card }) {
  return (
    <>
      <Image src={card.photo} alt="" fill className="object-cover" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 42%, var(--scrim-heavy) 100%)" }}
      />

      {/* Match-strength corner ribbon — separate from the industry line below, not a
         replacement for it. */}
      <div
        className="absolute font-mono font-bold uppercase"
        style={{
          top: "calc(var(--mu) * 12px)",
          right: "calc(var(--mu) * 12px)",
          padding: "calc(var(--mu) * 4px) calc(var(--mu) * 9px)",
          fontSize: "calc(var(--mu) * 8.5px)",
          letterSpacing: "0.06em",
          borderRadius: "calc(var(--mu) * 20px)",
          color: card.tagColor,
          background: "color-mix(in srgb, var(--card) 55%, transparent)",
          border: `1px solid ${card.tagColor}`,
          backdropFilter: "blur(6px)",
        }}
      >
        {card.matchLevel}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 text-center uppercase"
        style={{ padding: "calc(var(--mu) * 10px) calc(var(--mu) * 44px)" }}
      >
        <p
          style={{
            fontFamily: "var(--font-poster)",
            lineHeight: 1.15,
            letterSpacing: "0.4px",
            color: "var(--foreground)",
            ...exploreTitleStyle(card.title),
          }}
        >
          {card.title}
        </p>
        <p
          className="mt-1.5 whitespace-nowrap"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "calc(var(--mu) * 8px)",
            letterSpacing: "0.5px",
            color: "#ffb81f",
          }}
        >
          {INDUSTRY}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center normal-case" style={{ gap: "calc(var(--mu) * 10px)" }}>
          {[
            { icon: STAT_ICONS.salary, value: card.salary },
            { icon: STAT_ICONS.duration, value: card.major },
          ].map((stat, i) => (
            <div key={i} className="flex items-center" style={{ gap: "calc(var(--mu) * 5px)" }}>
              <span
                className="flex flex-none items-center justify-center rounded-full border"
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
                  {stat.icon}
                </svg>
              </span>
              <span style={{ fontSize: "calc(var(--mu) * 10.5px)", fontWeight: 700, color: "var(--foreground)" }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

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
          {CARDS.map((card) =>
            card.matchLevel === "Wildcard" ? (
              // Rare-pull treatment: an animated gradient "foil" border framing the
              // card (rather than the full-bleed edge-to-edge photo the other three
              // use), plus a diagonal sheen sweeping across on a loop — same idea as a
              // holographic trading card catching the light.
              <div
                key={card.title}
                className="relative"
                style={{ height: "100%", scrollSnapAlign: "start", padding: "calc(var(--mu) * 3px)" }}
              >
                <div className="mkt-holo-border absolute inset-0" style={{ borderRadius: "calc(var(--mu) * 20px)" }} />
                <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "calc(var(--mu) * 17px)" }}>
                  <ExploreCardBody card={card} />
                  <div aria-hidden className="mkt-holo-sheen pointer-events-none absolute inset-0" />
                </div>
              </div>
            ) : (
              <div key={card.title} className="relative" style={{ height: "100%", scrollSnapAlign: "start" }}>
                <ExploreCardBody card={card} />
              </div>
            ),
          )}
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
