"use client";

import { useRef } from "react";
import { ChapterRail } from "./ChapterRail";
import { BuildChapter } from "./chapters/Build";
import { ConnectChapter } from "./chapters/Connect";
import { ExploreChapter } from "./chapters/Explore";
import { MatchChapter } from "./chapters/Match";
import { PlayChapter } from "./chapters/Play";

export function HowItWorks() {
  // wrapRef survives the scroll-snap removal — ChapterRail still uses it to decide
  // when the side progress dots are visible. The IntersectionObserver that toggled
  // html[data-how-it-works-snap] is gone along with the snap CSS itself (see
  // globals.css for the full why: snap kept grabbing phone flings and nothing
  // depended on it — every guided chapter advance is JS scrollIntoView).
  const wrapRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <section id="how-it-works" className="pb-0">
        {/* Tighter than it was (pt-6/pb-4 -> pt-3/pb-2 on mobile, similar shaves
           up the tiers): this block sits inside the quiet stretch between the
           hero's scroll hint and Build's title that was called out as a long
           blank gap — every px trimmed here directly shortens that scroll. */}
        <div className="mx-auto max-w-[1200px] px-6 pt-3 pb-2 sm:pt-5 sm:pb-4 lg:pt-8">
          <div
            className="text-center text-[11px] font-semibold tracking-[0.14em] uppercase before:mr-2 before:inline-block before:h-px before:w-4 before:align-middle before:content-[''] min-[901px]:text-left"
            style={{ color: "var(--primary-tint)" }}
          >
            How Dreamari works
          </div>
          <h2 className="mt-2 max-w-[640px] text-center text-[clamp(1.75rem,4vw,2.4rem)] font-extrabold min-[901px]:text-left" style={{ color: "var(--foreground)" }}>
            Five chapters. One clearer future.
          </h2>
        </div>
      </section>

      <ChapterRail wrapRef={wrapRef} />

      {/* pb-8/12: Connect (and Build) are now `compact` — a much shorter section than
         Match/Explore/Play's full-viewport ones — so without a little extra room here
         the CTA block right after Connect started immediately below it with almost no
         separation, reading as one run-on block instead of the end of the storyboard. */}
      <div ref={wrapRef} className="pb-8 sm:pb-12">
        <BuildChapter />
        <MatchChapter />
        <ExploreChapter />
        <PlayChapter />
        <ConnectChapter />
      </div>
    </>
  );
}
