"use client";

import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Ported 1:1 from the reference .mock-tag rules, which scale with the shared --mu
// container multiplier (set on .mkt-graphic) rather than a fixed size — at wide
// desktop widths these tags render noticeably larger (up to a 20px label / 65px tall
// pill) than a flat Tailwind size would ever produce. Using inline clamp()/calc()
// rather than Tailwind utilities since arbitrary values can't express calc(var(--mu) * N).
function tagStyle(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "clamp(10px, calc(var(--mu) * 12px), 16px)",
    padding: "clamp(12px, calc(var(--mu) * 14px), 19px) clamp(16px, calc(var(--mu) * 18px), 24px)",
    borderRadius: "var(--radius-md-alt)",
    fontSize: "clamp(13.5px, calc(var(--mu) * 11px), 20px)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: "var(--glass-surface-2)",
    color: "var(--muted-foreground)",
  };
}

const iconStyle: React.CSSProperties = {
  width: "clamp(16px, calc(var(--mu) * 18px), 23px)",
  height: "clamp(16px, calc(var(--mu) * 18px), 23px)",
  flex: "none",
};

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
      <div
        className="mkt-tags flex flex-col"
        style={{ width: "clamp(270px, 68cqw, 600px)", gap: "clamp(10px, 2cqw, 16px)" }}
      >
        <div className="mkt-tag mkt-top" style={tagStyle()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
            <path d="m18 16 4-4-4-4" />
            <path d="m6 8-4 4 4 4" />
            <path d="m14.5 4-5 16" />
          </svg>
          Software Engineering
        </div>
        <div className="mkt-tag mkt-finance relative z-[2] border border-transparent" style={tagStyle()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
            <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
            <path d="M16 7h6v6" />
          </svg>
          Finance
          <span
            className="mkt-tag-check ml-auto flex flex-none items-center justify-center rounded-full"
            style={{
              width: "clamp(17px, calc(var(--mu) * 22px), 25px)",
              height: "clamp(17px, calc(var(--mu) * 22px), 25px)",
              padding: "clamp(4px, calc(var(--mu) * 5px), 6px)",
              background: "var(--c)",
            }}
          >
            {CHECK}
          </span>
        </div>
        <div className="mkt-tag mkt-bottom" style={tagStyle()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          Design
        </div>
      </div>
    </ChapterShell>
  );
}
