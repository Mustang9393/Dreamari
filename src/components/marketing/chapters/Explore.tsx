"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// The Explore chapter graphic is a miniature of the app's actual Browse page
// (Figma node 3185-17011): page header, the world-filter chip band, and the
// ranked "Top 5 Trending" poster rail. Per review feedback the FYP-style swipe
// deck is gone from this chapter — horizontal browse rails are the one catalog
// mental model every generation shares (TV guide -> Netflix -> streaming rows),
// which is what makes the section land for parents and school clients without
// reading as dated to students (the ranked row + poster art is straight off
// every streaming home screen they use daily). One rail only, per feedback —
// the previous two-row version read as clutter.
//
// Composition: three horizontal bands (header chrome / filter chips / rail),
// vertically centered as a group. The rail's tiles derive their size from the
// band's own height (h-full inside a capped flex-1 area), so a taller frame
// grows the poster art instead of accumulating dead space above and below it.

// Shared app map — a page-local copy here once missed "Farming, Animals &
// Nature", leaving Food Scientist's label fallback-white.
import { WORLD_COLORS } from "@/components/app/worlds";

type BrowseItem = { photo: string; title: string; world: string };

const BROWSE_TOP5: BrowseItem[] = [
  { photo: "/images/app/poster-asset-manager.png", title: "Asset Manager", world: "Business & Money" },
  { photo: "/images/app/poster-accountant.png", title: "Accountant", world: "Business & Money" },
  { photo: "/images/app/poster-fashion-buyer.png", title: "Fashion Buyer", world: "Business & Money" },
  { photo: "/images/app/poster-food-scientist.png", title: "Food Scientist", world: "Farming, Animals & Nature" },
  { photo: "/images/app/poster-video-game-designer.png", title: "Video Game Designer", world: "Tech & Engineering" },
  { photo: "/images/app/poster-art-director.png", title: "Art Director", world: "Arts, Media & Sport" },
  { photo: "/images/app/poster-nurse-anesthetist.png", title: "Nurse Anesthetist", world: "Health & Medicine" },
];

// Poster-title typeface per world, mirroring the Browse Cards component:
// Business & Money keeps Viaoda, Science & Research keeps Source Code Pro;
// the rest use the site's own bold sans so tech/health don't wear a serif.
// Career Poster Card component: every world has its OWN title face. These are
// the component's real assignments (from the design context pull), loaded via
// the marketing font stylesheet and tokenized in tokens.css.
function browseTitleFont(world: string): React.CSSProperties {
  switch (world) {
    case "Business & Money":
      return { fontFamily: "var(--font-poster)", fontWeight: 400 };
    case "Science & Research":
      return { fontFamily: "var(--font-poster-mono)", fontWeight: 600 };
    case "Health & Medicine":
      return { fontFamily: "var(--font-poster-nunito)", fontWeight: 700 };
    case "Tech & Engineering":
      return { fontFamily: "var(--font-poster-science)", fontWeight: 700, letterSpacing: "-0.05em" };
    case "Law, Safety & Justice":
      return { fontFamily: "var(--font-poster-zcool)", fontWeight: 400 };
    case "Driving, Flying & Shipping":
      return { fontFamily: "var(--font-poster-sekuya)", fontWeight: 400 };
    default:
      return { fontFamily: "var(--font-body)", fontWeight: 800 };
  }
}

function BrowseTile({ item }: { item: BrowseItem }) {
  return (
    <div className="flex h-full flex-none items-end">
      <div
        className="relative z-10 h-full flex-none overflow-hidden"
        style={{ aspectRatio: "2 / 3", borderRadius: "max(12px, calc(var(--mu) * 9px))", border: "1px solid var(--glass-border)" }}
      >
        <Image src={item.photo} alt="" fill sizes="260px" className="object-cover" draggable={false} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, var(--scrim-heavy) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 text-center uppercase" style={{ padding: "clamp(8px, 4cqh, 18px) clamp(5px, 2cqh, 10px) clamp(10px, 6.4cqh, 22px)" }}>
          <p style={{ ...browseTitleFont(item.world), fontSize: "clamp(13px, 9.6cqh, 30px)", lineHeight: 1.15, letterSpacing: "0.03em", color: "var(--foreground)" }}>
            {item.title}
          </p>
          <p
            className="mt-0.5"
            style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "clamp(8.5px, 4cqh, 12px)", letterSpacing: "0.06em", color: WORLD_COLORS[item.world] }}
          >
            {item.world}
          </p>
        </div>
      </div>
    </div>
  );
}

// Auto-drifting marquee — the sequence renders twice and the track translates
// -50%, so the loop is seamless. Pauses on hover; disabled under
// prefers-reduced-motion (see globals.css).
function Marquee({ children, duration, reverse, className = "" }: { children: React.ReactNode; duration: number; reverse?: boolean; className?: string }) {
  // Hover pauses the drift (pure CSS — resumes the instant the pointer
  // leaves). A real DRAG or horizontal wheel hands the rail over to native
  // scrolling, but only temporarily: the drift resumes when the mouse leaves,
  // or a beat after a touch ends. Never a permanent stop.
  const [manual, setManual] = useState(false);
  const downX = useRef<number | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );
  function scheduleResume(ms: number) {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setManual(false), ms);
  }
  return (
    <div
      className={`w-full ${manual ? "overflow-x-auto [scrollbar-width:none]" : "overflow-hidden"} ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
      onPointerDown={(e) => {
        downX.current = e.clientX;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
      }}
      onPointerMove={(e) => {
        // Drag intent only — a plain click/press never hijacks the drift.
        if (downX.current !== null && Math.abs(e.clientX - downX.current) > 6) setManual(true);
      }}
      onPointerUp={() => {
        downX.current = null;
        scheduleResume(2500);
      }}
      onPointerLeave={() => {
        downX.current = null;
        setManual(false);
      }}
      onWheel={(e) => {
        if (Math.abs(e.deltaX) > 2) {
          setManual(true);
          scheduleResume(2500);
        }
      }}
    >
      <div
        className={`${manual ? "" : "mkt-rail-track"} flex h-full w-max items-center`}
        style={{ gap: "clamp(8px, calc(var(--mu) * 6px), 12px)", animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal", paddingRight: "clamp(8px, calc(var(--mu) * 6px), 12px)" }}
      >
        {children}
        {!manual && children}
      </div>
    </div>
  );
}

export function ExploreChapter() {
  const [graphicRef, , graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="explore"
      flip
      title="Explore"
      color="#1fc76e"
      oneliner="Scroll through careers you never knew existed. Open one and see the pay, the path, and the real work."
      compact
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: the marquees restart from their seams on every
         return visit, so the section always re-enters mid-motion. */}
      <BrowsePage key={visitId} />
    </ChapterShell>
  );
}

function BrowsePage() {
  return (
    <div className="flex h-full w-full flex-col justify-center" style={{ gap: "clamp(14px, calc(var(--mu) * 12px), 20px)" }}>
      <div className="flex w-full flex-none flex-col" style={{ gap: "clamp(10px, calc(var(--mu) * 8px), 14px)" }}>
        <p
          className="w-full flex-none text-left"
          style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "clamp(12.5px, calc(var(--mu) * 9.5px), 17px)", color: "var(--foreground)" }}
        >
          Recommended for You
        </p>
        {/* The rail band: tiles take their height FROM this band (h-full inside
           a definite flex-1 area, capped), so taller viewports grow the poster
           art instead of leaving dead space. */}
        <div className="w-full" style={{ height: "min(380px, 92cqw, 46dvh)", minHeight: 170, containerType: "size" }}>
          <Marquee duration={46} className="h-full">
            {BROWSE_TOP5.map((item) => (
              <BrowseTile key={item.title} item={item} />
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
