"use client";

import Image from "next/image";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A pinned community board, not a Reddit thread: no vote arrow, no indented linear
// reply list — real profile photos on slightly-rotated pinned notes. A short, real
// exchange (one corporate volunteer answer, one student following up) rather than an
// implied crowd, so every name on the board is someone the reader actually sees reply.
const ASKER = { photo: "/images/avatar-maya.jpg", color: "#6366f1", name: "Maya", tag: "Grade 10" };

const REPLIES = [
  {
    photo: "/images/avatar-marcus.jpg",
    color: "#1fc76e",
    name: "Marcus",
    tag: "JPMorgan Chase · Analyst",
    text: "Join your school's finance club and apply junior year. GPA and networking both matter.",
    rotate: "-1.5deg",
  },
  {
    photo: "/images/avatar-jordan.jpg",
    color: "#ffb81f",
    name: "Jordan",
    tag: "Grade 11",
    text: "Just applied, thanks for the tip!",
    rotate: "1deg",
  },
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
      <div
        className="relative z-[1] rounded-2xl border"
        style={{ width: "clamp(260px, 60cqw, 520px)", background: "var(--card)", borderColor: "var(--border)", padding: "20px" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 flex-none overflow-hidden rounded-full">
            <Image src={ASKER.photo} alt="" fill className="object-cover" />
          </div>
          <div>
            <div className="text-[14px] font-bold" style={{ color: ASKER.color }}>
              {ASKER.name}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {ASKER.tag}
            </div>
          </div>
        </div>
        <div className="mt-3 text-[17px] leading-snug font-bold" style={{ color: "var(--foreground)" }}>
          How do you get an internship at a bank?
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {REPLIES.map((reply, i) => (
            <div
              key={reply.name}
              className="mkt-reply relative flex-1 rounded-xl border px-4 py-3"
              style={{ background: "var(--glass-surface-2)", borderColor: "var(--border)", minWidth: "180px", transform: `rotate(${reply.rotate})`, ["--d" as string]: i }}
            >
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 flex-none overflow-hidden rounded-full">
                  <Image src={reply.photo} alt="" fill className="object-cover" />
                </div>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: reply.color }}>
                    {reply.name}
                  </div>
                  <div className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    {reply.tag}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[13px] leading-snug" style={{ color: "var(--foreground)" }}>
                {reply.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChapterShell>
  );
}
