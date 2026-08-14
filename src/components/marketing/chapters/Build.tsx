"use client";

import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function BuildChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="build"
      eyebrow="Chapter One"
      title="Build"
      color="#6366f1"
      oneliner="What pulls you in becomes your world: live, as it happens."
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="mkt-tags flex w-full max-w-[600px] flex-col gap-3">
        <div
          className="mkt-tag mkt-top flex items-center gap-3 px-5 py-4 text-[15px] font-semibold whitespace-nowrap"
          style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)", borderRadius: "var(--radius-md-alt)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none">
            <path d="m18 16 4-4-4-4" />
            <path d="m6 8-4 4 4 4" />
            <path d="m14.5 4-5 16" />
          </svg>
          Software Engineering
        </div>
        <div
          className="mkt-tag mkt-finance relative z-[2] flex items-center gap-3 border border-transparent px-5 py-4 text-[15px] font-semibold whitespace-nowrap"
          style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)", borderRadius: "var(--radius-md-alt)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none">
            <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
            <path d="M16 7h6v6" />
          </svg>
          Finance
          <span className="mkt-tag-check ml-auto flex h-6 w-6 flex-none items-center justify-center rounded-full p-1.5" style={{ background: "var(--c)" }}>
            {CHECK}
          </span>
        </div>
        <div
          className="mkt-tag mkt-bottom flex items-center gap-3 px-5 py-4 text-[15px] font-semibold whitespace-nowrap"
          style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)", borderRadius: "var(--radius-md-alt)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          Design
        </div>
      </div>
    </ChapterShell>
  );
}
