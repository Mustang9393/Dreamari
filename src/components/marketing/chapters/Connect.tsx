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
    tag: "Goldman Sachs · Analyst",
    text: "Join your school's finance club and apply junior year. GPA and networking both matter.",
    rotate: "-1.5deg",
    verified: true,
  },
  {
    photo: "/images/avatar-jordan.jpg",
    color: "#ffb81f",
    name: "Jordan",
    tag: "Grade 11",
    text: "Just applied, thanks for the tip!",
    rotate: "1deg",
    verified: false,
  },
];

const VERIFIED_BADGE = (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-full w-full">
    <path d="M12 1l2.6 2.1 3.3-.5 1 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1 3.2-3.3-.5L12 21l-2.6-2.1-3.3.5-1-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1-3.2 3.3.5z" />
    <path d="M9 12.2l2 2 4-4.2" stroke="var(--card)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export function ConnectChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="connect"
      title="Connect"
      color="#00c8dc"
      oneliner="with professionals in the industry you're interested in."
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      {/* h-full/w-full: same allocated frame footprint as every other chapter's
         graphic, centered rather than stretched. A soft glow + top accent bar + the
         verified badge below dress this up past "plain forum thread" — this is the
         board a Fortune 500 partner is being pitched on paying to be part of. */}
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="relative rounded-2xl border"
          style={{
            width: "clamp(260px, 92cqw, 520px)",
            maxWidth: "100%",
            background: "var(--card)",
            borderColor: "var(--border)",
            padding: "22px",
            boxShadow: "0 0 0 1px color-mix(in srgb, var(--c) 18%, transparent), 0 30px 60px -20px color-mix(in srgb, var(--c) 35%, transparent), 0 12px 28px -12px rgba(0,0,0,0.5)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-x-6 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--c), transparent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-[140px] w-[80%] -translate-x-1/2 rounded-full blur-[50px]"
            style={{ background: "color-mix(in srgb, var(--c) 25%, transparent)" }}
          />
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
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-bold" style={{ color: reply.color }}>
                      {reply.name}
                    </span>
                    {reply.verified && (
                      <span style={{ width: "13px", height: "13px", color: reply.color, flex: "none" }}>{VERIFIED_BADGE}</span>
                    )}
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
      </div>
    </ChapterShell>
  );
}
