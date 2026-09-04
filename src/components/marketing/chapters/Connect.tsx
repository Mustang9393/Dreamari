"use client";

import Image from "next/image";
import { useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// Reads as a real social post + comment thread (Facebook/Twitter shape: post, engagement
// row, linear comments) done in this site's own glassmorphic surfaces — not a pinned
// corkboard, not a Reddit vote-arrow thread. A short, real exchange (one corporate
// volunteer answer, one student following up) rather than an implied crowd. Maya is a
// college sophomore (not a high schooler) per direct feedback — a college student
// asking about landing a bank internship reads as more realistic than a Grade 10 one.
const ASKER = { photo: "/images/avatar-maya-howard.jpg", color: "#6366f1", name: "Maya", tag: "Howard University · Sophomore" };

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
    // both students wear Maya's purple (direct feedback: three colours read
    // as noise during a pitch); only the verified pro keeps his own
    color: "#6366f1",
    // College class years (not high-school grades) for the student repliers, per
    // direct request — Maya the asker is a Sophomore, so the thread reads
    // logically as peers-and-younger learning from her question: Jordan, a
    // Freshman, is the one who "just applied" (early explorer acting on the tip),
    // and Priya, a Sophomore like Maya, bookmarks it for this cycle.
    name: "Jordan",
    tag: "NYU · Freshman",
    text: "Just applied, thanks for the tip!",
    verified: false,
  },
  {
    // Reuses career-neurosurgeon.jpg as a face crop — no dedicated fourth avatar shot
    // on hand, and it's now otherwise unused since Explore's Food Scientist card moved
    // to a real supplied photo.
    photo: "/images/career-neurosurgeon.jpg",
    color: "#6366f1",
    name: "Priya",
    tag: "Pace University · Sophomore",
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

// Community overview stats — bare path fragments (not full <svg> elements) since each
// one is rendered inside a shared <svg viewBox="0 0 24 24" stroke="currentColor" ...>
// wrapper at the usage site, same pattern Explore's STAT_ICONS uses.
const COMMUNITY_STATS = [
  {
    icon: (
      <>
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </>
    ),
    value: "1,987",
    label: "Students",
  },
  {
    icon: (
      <>
        <rect width="20" height="14" x="2" y="7" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
    value: "212",
    label: "Professionals",
  },
  {
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
    value: "123",
    label: "Posts",
  },
];

// Shared card recipe (glass-surface-3 + blur + a soft var(--c)-tinted glow) both
// screens use, so they read as the same family of surface rather than two different
// card styles bolted together.
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex w-full flex-col overflow-hidden rounded-2xl border"
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
      {children}
    </div>
  );
}

// Screen 1 — a community landing card (headline, stat row, a single "Enter Community"
// CTA) rather than dropping straight into the post thread, so the storyboard reads as
// "here's a whole public community around this interest" before the specific example
// post. Fixed to Business & Money since that's the only path Build actually lets a
// reader choose.
function CommunityOverviewCard({ onEnter }: { onEnter: () => void }) {
  return (
    <CardShell>
      <div style={{ padding: "calc(var(--mu) * 24px) calc(var(--mu) * 20px)" }}>
        <div className="text-center">
          <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: "calc(var(--mu) * 10px)", letterSpacing: "0.1em", color: "var(--c)", fontWeight: 600 }}>
            Community Board
          </p>
          <p className="mt-2 font-extrabold" style={{ fontSize: "calc(var(--mu) * 18px)", lineHeight: 1.25, color: "var(--foreground)" }}>
            Students Interested in Business &amp; Money
          </p>
        </div>

        <div className="mt-5 flex items-stretch justify-center" style={{ gap: "calc(var(--mu) * 10px)" }}>
          {COMMUNITY_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-1 flex-col items-center rounded-xl"
              style={{ padding: "calc(var(--mu) * 12px) calc(var(--mu) * 6px)", background: "var(--glass-surface-2)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--c)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 16px)", height: "calc(var(--mu) * 16px)" }}>
                {stat.icon}
              </svg>
              <span className="mt-1.5 font-extrabold" style={{ fontSize: "calc(var(--mu) * 15px)", color: "var(--foreground)" }}>
                {stat.value}
              </span>
              <span className="mt-0.5 uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "calc(var(--mu) * 7.5px)", letterSpacing: "0.05em", color: "var(--muted-foreground)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onEnter}
          /* dark label: white on this teal measured 2.04:1 (needs 3:1) —
             near-black clears 10:1 */
          className="mt-6 flex w-full items-center justify-center rounded-full font-bold"
          style={{
            color: "#05070f",
            gap: "calc(var(--mu) * 8px)",
            padding: "calc(var(--mu) * 13px) calc(var(--mu) * 20px)",
            fontSize: "calc(var(--mu) * 13px)",
            background: "var(--c)",
          }}
        >
          Enter Community
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 15px)", height: "calc(var(--mu) * 15px)" }}>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </CardShell>
  );
}

// Screen 2 — the post/comment thread this chapter always had, reached after "Enter
// Community" rather than shown by default.
function PostCard() {
  return (
    <CardShell>
      {/* Post — tightened from the original padding/gaps (18/14/12 → smaller
         throughout) to reclaim vertical room for a third reply below without
         needing to scroll; nothing in this card should ever need to scroll except
         Explore's own feed. */}
      <div style={{ padding: "calc(var(--mu) * 14px) calc(var(--mu) * 14px) calc(var(--mu) * 10px)" }}>
        {/* Community Board label — per direct feedback, this needs to read as a
           public/community-facing post, not a private message or profile. */}
        <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: "calc(var(--mu) * 8.5px)", letterSpacing: "0.1em", color: "var(--c)", fontWeight: 600 }}>
          Community Board
        </p>
        <div className="mt-2 flex items-center" style={{ gap: "calc(var(--mu) * 9px)" }}>
          <div className="relative flex-none overflow-hidden rounded-full" style={{ width: "calc(var(--mu) * 34px)", height: "calc(var(--mu) * 34px)" }}>
            {/* sizes: this avatar renders at calc(--mu * 34px), i.e. ~51px at --mu's
               1.5 max — without sizes, next/image assumes 100vw and serves w=3840. */}
            <Image src={ASKER.photo} alt="" fill sizes="52px" className="object-cover" />
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
          {/* Counts bumped to feel like a genuinely active community per direct
             request. 333 (not the asked-about 274) is the Gen-Z pick: angel numbers
             (222/333/444) are a real current thing in that cohort — positive
             "alignment" energy, and it pairs with 67, which is itself the viral
             "six-seven" meme number the user chose. Comment count is deliberately
             decoupled from REPLIES.length now — every real social app shows the
             TOTAL count while rendering only the top few comments, so the mismatch
             (67 vs 3 visible) is exactly what makes it read authentic. */}
          {[
            { icon: HEART, label: "333" },
            { icon: COMMENT_ICON, label: "67" },
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
         No overflow/scroll here on purpose — the frame hugs the card, so all
         replies always fit outright rather than needing a scrollbar or being
         dropped to make room. */}
      <div style={{ padding: "0 calc(var(--mu) * 14px) calc(var(--mu) * 12px)" }}>
        <div className="flex flex-col" style={{ gap: "calc(var(--mu) * 7px)" }}>
          {REPLIES.map((reply, i) => (
            <div
              key={reply.name}
              className="mkt-reply rounded-xl"
              style={{ padding: "calc(var(--mu) * 9px) calc(var(--mu) * 12px)", background: "var(--glass-surface-2)", ["--d" as string]: i }}
            >
              <div className="flex items-center" style={{ gap: "calc(var(--mu) * 7px)" }}>
                <div className="relative flex-none overflow-hidden rounded-full" style={{ width: "calc(var(--mu) * 22px)", height: "calc(var(--mu) * 22px)" }}>
                  <Image src={reply.photo} alt="" fill sizes="34px" className="object-cover" />
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
    </CardShell>
  );
}

export function ConnectChapter() {
  const [graphicRef, playing, graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="connect"
      title="Connect"
      color="#00c8dc"
      oneliner="with professionals in the industry you're interested in."
      compact
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: remounts fresh every time the reader scrolls back onto
         Connect, so it always starts back on the Community Overview screen rather
         than staying on the post thread from a previous visit. */}
      <ConnectDemo key={visitId} />
    </ChapterShell>
  );
}

function ConnectDemo() {
  const [screen, setScreen] = useState<"overview" | "post">("overview");

  return (
    <div className="flex h-full w-full items-center justify-center">
      {screen === "overview" ? <CommunityOverviewCard onEnter={() => setScreen("post")} /> : <PostCard />}
    </div>
  );
}
