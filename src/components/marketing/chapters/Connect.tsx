"use client";

import Image from "next/image";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// Reads as a real social post + comment thread (Facebook/Twitter shape: post, engagement
// row, linear comments) done in this site's own glassmorphic surfaces — not a pinned
// corkboard, not a Reddit vote-arrow thread. A short, real exchange (one corporate
// volunteer answer, one student following up) rather than an implied crowd.
const ASKER = { photo: "/images/avatar-maya.jpg", color: "#6366f1", name: "Maya", tag: "Grade 10" };

const REPLIES = [
  {
    photo: "/images/avatar-marcus.jpg",
    color: "#1fc76e",
    name: "Marcus",
    tag: "Goldman Sachs · Analyst",
    text: "Join your school's finance club and apply junior year. GPA and networking both matter.",
    verified: true,
  },
  {
    photo: "/images/avatar-jordan.jpg",
    color: "#ffb81f",
    name: "Jordan",
    tag: "Grade 11",
    text: "Just applied, thanks for the tip!",
    verified: false,
  },
  {
    // Reuses career-neurosurgeon.jpg as a face crop — no dedicated fourth avatar shot
    // on hand, and it's now otherwise unused since Explore's Food Scientist card moved
    // to a real supplied photo.
    photo: "/images/career-neurosurgeon.jpg",
    color: "#ec4899",
    name: "Priya",
    tag: "Grade 12",
    text: "Same here, bookmarking this!",
    verified: false,
  },
];

const VERIFIED_BADGE = (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-full w-full">
    <path d="M12 1l2.6 2.1 3.3-.5 1 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1 3.2-3.3-.5L12 21l-2.6-2.1-3.3.5-1-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1-3.2 3.3.5z" />
    <path d="M9 12.2l2 2 4-4.2" stroke="var(--card)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const HEART = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

const COMMENT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const SHARE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v13" />
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
      {/* h-full/w-full: same allocated frame footprint as every other chapter's graphic.
         Glass surfaces + a soft accent glow so this reads high-end - the board a Fortune
         500 partner is being pitched on paying to be part of, not a plain forum post. */}
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="relative flex h-full max-h-full w-full flex-col overflow-hidden rounded-2xl border"
          style={{
            maxWidth: "min(94cqw, 480px)",
            background: "var(--glass-surface-3)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "var(--glass-border)",
            boxShadow: "0 0 0 1px color-mix(in srgb, var(--c) 18%, transparent), 0 30px 70px -20px color-mix(in srgb, var(--c) 40%, transparent), 0 12px 28px -12px rgba(0,0,0,0.55)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-[180px] w-[85%] -translate-x-1/2 rounded-full blur-[60px]"
            style={{ background: "color-mix(in srgb, var(--c) 30%, transparent)" }}
          />

          {/* Post — tightened from the original padding/gaps (18/14/12 → smaller
             throughout) to reclaim vertical room for a third reply below without
             needing to scroll; nothing in this card should ever need to scroll except
             Explore's own feed. */}
          <div style={{ padding: "calc(var(--mu) * 14px) calc(var(--mu) * 14px) calc(var(--mu) * 10px)" }}>
            <div className="flex items-center" style={{ gap: "calc(var(--mu) * 9px)" }}>
              <div className="relative flex-none overflow-hidden rounded-full" style={{ width: "calc(var(--mu) * 34px)", height: "calc(var(--mu) * 34px)" }}>
                <Image src={ASKER.photo} alt="" fill className="object-cover" />
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: "calc(var(--mu) * 12.5px)", color: ASKER.color }}>
                  {ASKER.name}
                </div>
                <div className="font-semibold" style={{ fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}>
                  {ASKER.tag}
                </div>
              </div>
            </div>
            <p className="font-bold" style={{ marginTop: "calc(var(--mu) * 10px)", fontSize: "calc(var(--mu) * 15px)", lineHeight: 1.28, color: "var(--foreground)" }}>
              How do you get an internship at a bank?
            </p>

            {/* Engagement row */}
            <div className="flex items-center border-t border-b" style={{ marginTop: "calc(var(--mu) * 10px)", paddingTop: "calc(var(--mu) * 7px)", paddingBottom: "calc(var(--mu) * 7px)", gap: "calc(var(--mu) * 16px)", borderColor: "var(--glass-border)" }}>
              {[
                { icon: HEART, label: "24" },
                { icon: COMMENT_ICON, label: String(REPLIES.length) },
                { icon: SHARE_ICON, label: "Share" },
              ].map((action, i) => (
                <div key={i} className="flex items-center" style={{ gap: "calc(var(--mu) * 5px)", color: "var(--muted-foreground)" }}>
                  <span style={{ width: "calc(var(--mu) * 13px)", height: "calc(var(--mu) * 13px)" }}>{action.icon}</span>
                  <span className="font-semibold" style={{ fontSize: "calc(var(--mu) * 10px)" }}>
                    {action.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments - linear, not pinned/rotated, each its own translucent glass row.
             No overflow/scroll here on purpose — sized to fit all three replies within
             the frame outright rather than relying on an internal scrollbar. */}
          <div className="min-h-0 flex-1" style={{ padding: "0 calc(var(--mu) * 14px) calc(var(--mu) * 12px)" }}>
            <div className="flex h-full flex-col justify-center" style={{ gap: "calc(var(--mu) * 7px)" }}>
              {REPLIES.map((reply, i) => (
                <div
                  key={reply.name}
                  className="mkt-reply rounded-xl"
                  style={{ padding: "calc(var(--mu) * 9px) calc(var(--mu) * 12px)", background: "var(--glass-surface-2)", ["--d" as string]: i }}
                >
                  <div className="flex items-center" style={{ gap: "calc(var(--mu) * 7px)" }}>
                    <div className="relative flex-none overflow-hidden rounded-full" style={{ width: "calc(var(--mu) * 22px)", height: "calc(var(--mu) * 22px)" }}>
                      <Image src={reply.photo} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex items-center" style={{ gap: "calc(var(--mu) * 4px)" }}>
                      <span className="font-bold" style={{ fontSize: "calc(var(--mu) * 11.5px)", color: reply.color }}>
                        {reply.name}
                      </span>
                      {reply.verified && <span style={{ width: "calc(var(--mu) * 11px)", height: "calc(var(--mu) * 11px)", color: reply.color }}>{VERIFIED_BADGE}</span>}
                      <span className="font-semibold" style={{ fontSize: "calc(var(--mu) * 9px)", color: "var(--muted-foreground)" }}>
                        · {reply.tag}
                      </span>
                    </div>
                  </div>
                  <p style={{ marginTop: "calc(var(--mu) * 4px)", fontSize: "calc(var(--mu) * 11px)", lineHeight: 1.4, color: "var(--foreground)" }}>{reply.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
