"use client";

import { useRef } from "react";
import { ChapterRail } from "./ChapterRail";
import { BuildChapter } from "./chapters/Build";
import { ConnectChapter } from "./chapters/Connect";
import { ExploreChapter } from "./chapters/Explore";
import { MatchChapter } from "./chapters/Match";
import { PlayChapter } from "./chapters/Play";

export function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <section id="how-it-works" className="pb-0">
        <div className="mx-auto max-w-[1200px] px-6 pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10">
          <div
            className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase before:mr-2 before:inline-block before:h-px before:w-4 before:align-middle before:content-['']"
            style={{ color: "var(--primary-tint)" }}
          >
            How Dreamari works
          </div>
          <h2 className="mt-3 max-w-[640px] text-[clamp(1.75rem,4vw,2.4rem)] font-extrabold" style={{ color: "var(--foreground)" }}>
            Five chapters. One clearer future.
          </h2>
        </div>
      </section>

      <ChapterRail wrapRef={wrapRef} />

      <div ref={wrapRef}>
        <BuildChapter />
        <MatchChapter />
        <PlayChapter />
        <ExploreChapter />
        <ConnectChapter />
      </div>
    </>
  );
}
