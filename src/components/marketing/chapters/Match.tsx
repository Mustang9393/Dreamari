"use client";

import Image from "next/image";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// Ported from the real Career Poster Card component (Figma node 2403:4760): full-bleed
// photo, bottom text-scrim, Viaoda Libre poster title (uppercase), Montserrat SemiBold
// world-colored subtitle. Sizes scale with the shared --mu multiplier like the rest of
// this mockup, since a real poster card's fixed 24px/10px type would be oversized on a
// card this small.
type PosterCardProps = {
  slot: "left" | "right" | "center";
  photo: string;
  title: string;
  subtitle: string;
  worldColor: string;
};

function PosterCard({ slot, photo, title, subtitle, worldColor }: PosterCardProps) {
  return (
    <div
      className={`mkt-m3-card mkt-${slot} absolute top-1/2 left-1/2 overflow-hidden`}
      style={{
        width: "calc(var(--mu) * 96px)",
        height: "calc(var(--mu) * 132px)",
        borderRadius: "calc(var(--mu) * 14px)",
        boxShadow: slot === "center" ? undefined : "0 16px 30px -16px rgba(0,0,0,0.6)",
      }}
    >
      <Image src={photo} alt="" fill className="object-cover" />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center uppercase"
        style={{
          gap: "calc(var(--mu) * 1.5px)",
          padding: "calc(var(--mu) * 8px) calc(var(--mu) * 4px)",
          background:
            "linear-gradient(180deg, var(--scrim-transparent) 0%, var(--scrim-medium) 30%, var(--scrim-heavy) 51%, var(--background) 100%)",
        }}
      >
        <p
          className="w-full whitespace-nowrap"
          style={{
            fontFamily: "var(--font-poster)",
            fontSize: "calc(var(--mu) * 13px)",
            lineHeight: 1.15,
            letterSpacing: "0.4px",
            color: "var(--foreground)",
          }}
        >
          {title}
        </p>
        <p
          className="w-full whitespace-nowrap"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "calc(var(--mu) * 7.5px)",
            lineHeight: 1.4,
            letterSpacing: "0.5px",
            color: worldColor,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function MatchChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="match"
      eyebrow="Chapter Two"
      title="Match"
      color="var(--world-business-money-office)"
      oneliner="With the right career, college major, and schools."
      flip
      altBackground
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="relative z-[1] flex flex-col items-center gap-5" style={{ width: "calc(var(--mu) * 250px)", height: "calc(var(--mu) * 210px)" }}>
        <div className="relative w-full" style={{ height: "calc(var(--mu) * 138px)" }}>
          <PosterCard slot="left" photo="/images/career-surgeon.jpg" title="Surgeon" subtitle="Health" worldColor="var(--world-health-medicine)" />
          <PosterCard slot="right" photo="/images/career-ux-designer.jpg" title="UX Designer" subtitle="Tech" worldColor="var(--world-tech-engineering-design)" />
          <PosterCard slot="center" photo="/images/career-chief-executive.jpg" title="Analyst" subtitle="Finance" worldColor="var(--world-business-money-office)" />
        </div>
        <div
          className="mkt-m3-actions relative z-[3] flex items-center"
          style={{ marginTop: "calc(var(--mu) * -34px)" }}
        >
          {/* Fades/collapses out in sync with the center card's zoom-in, so the flex
             row shrinks to just the heart, which the row's own centering re-lands in
             the middle — no manual translateX math needed. */}
          <div
            className="mkt-m3-btn mkt-m3-cancel flex flex-none items-center justify-center overflow-hidden rounded-full border"
            style={{
              width: "calc(var(--mu) * 38px)",
              height: "calc(var(--mu) * 38px)",
              marginRight: "calc(var(--mu) * 18px)",
              background: "var(--glass-surface-2)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 17px)", height: "calc(var(--mu) * 17px)" }}>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
          <div
            className="mkt-m3-btn mkt-like relative flex items-center justify-center rounded-full border"
            style={{
              width: "calc(var(--mu) * 38px)",
              height: "calc(var(--mu) * 38px)",
              background: "var(--glass-surface-2)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <svg
              className="mkt-m3-heart-outline absolute"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "calc(var(--mu) * 17px)", height: "calc(var(--mu) * 17px)" }}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
            <svg
              className="mkt-m3-heart-fill absolute text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              style={{ width: "calc(var(--mu) * 17px)", height: "calc(var(--mu) * 17px)" }}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
