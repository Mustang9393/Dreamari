"use client";

import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

export function MatchChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="match"
      eyebrow="Chapter Two"
      title="Match"
      color="#e5484d"
      oneliner="Try it. Not just read about it."
      flip
      altBackground
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="relative z-[1] flex flex-col items-center gap-5" style={{ width: "calc(var(--mu) * 250px)", height: "calc(var(--mu) * 210px)" }}>
        <div className="relative w-full" style={{ height: "calc(var(--mu) * 138px)" }}>
          <div
            className="mkt-m3-card mkt-left absolute top-1/2 left-1/2 flex flex-col items-start justify-end shadow-[0_16px_30px_-16px_rgba(0,0,0,0.6)]"
            style={{
              width: "calc(var(--mu) * 96px)",
              height: "calc(var(--mu) * 132px)",
              borderRadius: "calc(var(--mu) * 14px)",
              padding: "calc(var(--mu) * 11px)",
              gap: "calc(var(--mu) * 2px)",
              background: "linear-gradient(165deg, var(--glass-surface-3), var(--glass-surface-2))",
            }}
          >
            <div className="font-display font-bold whitespace-nowrap" style={{ fontSize: "calc(var(--mu) * 12.5px)", color: "var(--foreground)" }}>
              Nurse
            </div>
            <div className="font-mono whitespace-nowrap" style={{ fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}>
              Health
            </div>
          </div>
          <div
            className="mkt-m3-card mkt-right absolute top-1/2 left-1/2 flex flex-col items-start justify-end shadow-[0_16px_30px_-16px_rgba(0,0,0,0.6)]"
            style={{
              width: "calc(var(--mu) * 96px)",
              height: "calc(var(--mu) * 132px)",
              borderRadius: "calc(var(--mu) * 14px)",
              padding: "calc(var(--mu) * 11px)",
              gap: "calc(var(--mu) * 2px)",
              background: "linear-gradient(165deg, var(--glass-surface-3), var(--glass-surface-2))",
            }}
          >
            <div className="font-display font-bold whitespace-nowrap" style={{ fontSize: "calc(var(--mu) * 12.5px)", color: "var(--foreground)" }}>
              Engineer
            </div>
            <div className="font-mono whitespace-nowrap" style={{ fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}>
              Tech
            </div>
          </div>
          <div
            className="mkt-m3-card mkt-center absolute top-1/2 left-1/2 flex flex-col items-start justify-end"
            style={{
              width: "calc(var(--mu) * 96px)",
              height: "calc(var(--mu) * 132px)",
              borderRadius: "calc(var(--mu) * 14px)",
              padding: "calc(var(--mu) * 11px)",
              gap: "calc(var(--mu) * 2px)",
              background: "linear-gradient(165deg, color-mix(in srgb, var(--c) 24%, var(--glass-surface-3)), var(--glass-surface-1) 80%)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "calc(var(--mu) * 20px)", height: "calc(var(--mu) * 20px)", marginBottom: "calc(var(--mu) * 3px)", color: "var(--c)" }}
            >
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            <div className="font-display font-bold whitespace-nowrap" style={{ fontSize: "calc(var(--mu) * 12.5px)", color: "var(--foreground)" }}>
              Accountant
            </div>
            <div className="font-mono whitespace-nowrap" style={{ fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}>
              Finance
            </div>
          </div>
        </div>
        <div className="mkt-m3-actions flex" style={{ gap: "calc(var(--mu) * 18px)" }}>
          <div
            className="mkt-m3-btn flex items-center justify-center rounded-full border"
            style={{
              width: "calc(var(--mu) * 38px)",
              height: "calc(var(--mu) * 38px)",
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
