"use client";

import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

const REPLIES = [
  { initials: "M", color: "#6366f1", name: "Maya", text: "Started with a finance club" },
  { initials: "J", color: "#ffb81f", name: "Jordan", text: "Ask about internships early" },
  { initials: "P", color: "#1fc76e", name: "Priya", text: "Shadowed at a credit union" },
];

export function ConnectChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="connect"
      eyebrow="Chapter Five"
      title="Connect"
      color="#00c8dc"
      oneliner="Real people. Real conversations. Not a stock photo."
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="relative z-[1] flex w-full max-w-[520px] flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-none flex-col items-center gap-0.5 pt-0.5" style={{ color: "var(--c)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
            <span className="font-mono text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
              86
            </span>
          </div>
          <div>
            <div className="text-[18px] leading-snug font-bold" style={{ color: "var(--foreground)" }}>
              How do I get into investment banking?
            </div>
            <div
              className="mt-1.5 inline-block rounded-full px-[9px] py-[3px] font-mono text-[12px]"
              style={{ color: "var(--c)", background: "color-mix(in srgb, var(--c) 14%, transparent)" }}
            >
              Business &amp; Finance
            </div>
          </div>
        </div>
        <div className="ml-2.5 flex flex-col gap-3 border-l pl-[34px]" style={{ borderColor: "var(--border)" }}>
          {REPLIES.map((reply, i) => (
            <div
              key={reply.name}
              className="mkt-reply flex flex-wrap items-center gap-3 rounded-xl border px-[15px] py-3"
              style={{ background: "var(--glass-surface-2)", borderColor: "var(--border)", ["--d" as string]: i }}
            >
              <div
                className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ background: reply.color }}
              >
                {reply.initials}
              </div>
              <div className="text-[14px] font-bold" style={{ color: reply.color }}>
                {reply.name}
              </div>
              <div className="text-[14px]" style={{ color: "var(--foreground)" }}>
                {reply.text}
              </div>
            </div>
          ))}
          <div
            className="mkt-reply flex flex-wrap items-center gap-3 rounded-xl border px-[15px] py-3"
            style={{ background: "var(--glass-surface-2)", borderColor: "var(--border)", ["--d" as string]: REPLIES.length }}
          >
            <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: "#e5484d" }}>
              +12
            </div>
            <div className="text-[14px]" style={{ color: "var(--foreground)" }}>
              more replies
            </div>
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
