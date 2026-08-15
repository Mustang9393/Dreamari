"use client";

import Image from "next/image";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function PlayChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="play"
      eyebrow="Chapter Three"
      title="Play"
      color="#ffb81f"
      oneliner="Day-in-the-life college major and career games you actually want to open."
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div
        className="relative z-[1] overflow-hidden"
        style={{ width: "clamp(260px, 58cqw, 560px)", background: "var(--card)", borderRadius: "var(--radius-md-alt)" }}
      >
        <div
          className="relative h-[clamp(88px,16cqw,180px)] overflow-hidden"
          style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--c) 30%, #0b0d16), #05070f 88%)" }}
        >
          {/* Real in-game art as the actual scene, not a faint wash — only scrimmed at
             the very top/bottom edges so the chart/badge stay readable and it blends
             into the panel below, rather than darkened all over. */}
          <Image src="/images/play-illustration.jpg" alt="" fill className="object-cover" style={{ objectPosition: "center 30%" }} />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--c) 22%, transparent) 0%, transparent 30%, transparent 70%, #05070fe6 100%)" }}
          />
          <svg className="mkt-chart absolute inset-0 h-full w-full" viewBox="0 0 200 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="playChartFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--c)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="mkt-chart-fill" fill="url(#playChartFade)" d="M4,22 L50,18 L82,20 L100,58 L140,64 L196,60 L196,80 L4,80 Z" />
            <path
              className="mkt-chart-line"
              pathLength={200}
              d="M4,22 L50,18 L82,20 L100,58 L140,64 L196,60"
              stroke="var(--c)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span
            className="mkt-chart-badge absolute top-[60%] left-[48%] rounded-full px-2 py-0.5 font-mono text-[clamp(9.5px,1.6cqw,12px)] font-bold text-white"
            style={{ background: "#c33338" }}
          >
            -12%
          </span>
        </div>
        <div style={{ background: "var(--glass-surface-1)" }}>
          <div className="mkt-dialogue flex items-center px-[clamp(14px,2.8cqw,24px)] pt-[clamp(11px,2.2cqw,20px)] pb-[clamp(8px,1.6cqw,14px)]">
            <span className="flex-1 text-[clamp(13px,2.3cqw,18px)] leading-snug font-bold" style={{ color: "var(--foreground)" }}>
              &quot;A client&apos;s portfolio just dropped 12% overnight. What do you do?&quot;
            </span>
          </div>
          <div className="flex flex-col gap-[clamp(7px,1.4cqw,11px)] px-[clamp(14px,2.8cqw,24px)] pb-[clamp(12px,2.2cqw,18px)]">
            <div
              className="mkt-answer flex items-center justify-between gap-2 rounded-full border border-transparent px-[clamp(12px,2.2cqw,16px)] py-[clamp(8px,1.6cqw,12px)] text-[clamp(10.5px,1.8cqw,13.5px)] font-semibold"
              style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}
            >
              Sell everything
            </div>
            <div
              className="mkt-answer mkt-target flex items-center justify-between gap-2 rounded-full border border-transparent px-[clamp(12px,2.2cqw,16px)] py-[clamp(8px,1.6cqw,12px)] text-[clamp(10.5px,1.8cqw,13.5px)] font-semibold"
              style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}
            >
              Review the plan together
              <span className="mkt-answer-check flex h-[clamp(15px,2.6cqw,20px)] w-[clamp(15px,2.6cqw,20px)] flex-none items-center justify-center rounded-full p-1 text-white" style={{ background: "var(--c)" }}>
                {CHECK}
              </span>
            </div>
            <div
              className="mkt-answer flex items-center justify-between gap-2 rounded-full border border-transparent px-[clamp(12px,2.2cqw,16px)] py-[clamp(8px,1.6cqw,12px)] text-[clamp(10.5px,1.8cqw,13.5px)] font-semibold"
              style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}
            >
              Ignore it
            </div>
          </div>
          <div className="px-[clamp(14px,2.8cqw,24px)] pb-[clamp(14px,2.6cqw,22px)]">
            <div className="h-[clamp(5px,1cqw,8px)] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
              <div className="mkt-progress-bar h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--c), color-mix(in srgb, var(--c) 55%, #fff))" }} />
            </div>
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
