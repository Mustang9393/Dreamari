"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// All three cards are real Business/Money/Office-world careers with real copy pulled
// from the vetted 322-career taxonomy spreadsheet — no invented blurbs. Salary bands are
// standard entry-level ranges for these roles (not in the taxonomy source, which has no
// salary column filled in yet). Whichever order the deck gets swiped in, the reveal
// always names Investment Banking: this is a demo of the interaction, not a real
// matching engine, so there's no real branch to build per card.
const CARDS = [
  {
    key: "iba",
    photo: "/images/career-chief-executive.jpg",
    title: "Investment Banking",
    blurb: "Helps big companies raise money and buy other companies.",
    salary: "$85K-150K",
    major: "Business & Management",
  },
  {
    key: "ops",
    photo: "/images/career-pe-analyst.jpg",
    title: "Operations",
    blurb: "Keeps the day-to-day running of a business working.",
    salary: "$65K-110K",
    major: "Business & Management",
  },
  {
    key: "pm",
    photo: "/images/career-ux-designer.jpg",
    title: "Project Manager",
    blurb: "Keeps a project on schedule and everyone talking to each other.",
    salary: "$70K-115K",
    major: "Business & Management",
  },
];

const WORLD_COLOR = "var(--world-business-money-office)";

// Figma's own Career Poster Card spec ties title size to length (<=16 large, 17-35
// medium, >35 small); past 16 characters we also let it wrap to two lines instead of
// keeping shrinking a single line down to illegible, since these real titles ("Investment
// Banking Analyst") run long and this card has the vertical room to spare.
function posterTitleStyle(title: string): React.CSSProperties {
  if (title.length <= 16) return { fontSize: "calc(var(--mu) * 15px)", whiteSpace: "nowrap" };
  if (title.length <= 22) return { fontSize: "calc(var(--mu) * 12px)", whiteSpace: "nowrap" };
  return { fontSize: "calc(var(--mu) * 12px)", whiteSpace: "normal" };
}

export function MatchChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const [stack, setStack] = useState(CARDS);
  const [exiting, setExiting] = useState<{ key: string; direction: "like" | "pass" } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [likedCount, setLikedCount] = useState(0);

  const top = stack[0];
  const matched = stack.length === 0;

  // The emotional payoff of the whole deck: give it a beat to land, then carry the
  // reader straight into Play — same act-then-advance rhythm as Build.
  useEffect(() => {
    if (!matched) return;
    const timeout = setTimeout(() => {
      document.getElementById("play")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 2200);
    return () => clearTimeout(timeout);
  }, [matched]);

  function act(direction: "like" | "pass") {
    if (!top || exiting) return;
    setExiting({ key: top.key, direction });
    if (direction === "like") setLikedCount((n) => n + 1);
  }

  function onExitTransitionEnd() {
    setExiting(null);
    setFlipped(false);
    setStack((s) => s.slice(1));
  }

  function reset() {
    setStack(CARDS);
    setExiting(null);
    setFlipped(false);
    setLikedCount(0);
  }

  return (
    <ChapterShell
      id="match"
      title="Match"
      color={WORLD_COLOR}
      oneliner="with the right college major, schools and career."
      flip
      altBackground
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="relative z-[1] flex h-full w-full flex-col items-center" style={{ gap: "calc(var(--mu) * 14px)" }}>
        {/* aspect-ratio (not a fixed mu height) so this fits ChapterShell's shared
           frame on any viewport: flex:1 gives it the column's available height, then
           aspect-ratio derives width from that — capped by max-width so a tall/narrow
           frame still caps width instead of ever overflowing it sideways. */}
        <div className="relative min-h-0 max-w-full flex-1" style={{ aspectRatio: "168 / 300" }}>
          {matched ? (
            <div
              className="mkt-match-celebrate absolute inset-0 overflow-hidden rounded-[calc(var(--mu)*20px)]"
              style={{ ["--glow" as string]: WORLD_COLOR }}
            >
              <Image src="/images/career-chief-executive.jpg" alt="" fill className="object-cover" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, var(--scrim-transparent) 0%, var(--scrim-medium) 40%, var(--scrim-heavy) 68%, var(--background) 100%)" }}
              />
              <div className="mkt-match-celebrate-text absolute inset-x-0 bottom-0 flex flex-col items-center text-center" style={{ padding: "calc(var(--mu) * 16px)", gap: "calc(var(--mu) * 8px)" }}>
                <p className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 10px)", letterSpacing: "0.1em", color: WORLD_COLOR, fontWeight: 700 }}>
                  You&apos;re matched!
                </p>
                <p style={{ fontFamily: "var(--font-poster)", fontSize: "calc(var(--mu) * 18px)", lineHeight: 1.15, color: "var(--foreground)" }}>
                  Investment Banking
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-1 flex items-center rounded-full border font-semibold"
                  style={{
                    gap: "calc(var(--mu) * 6px)",
                    padding: "calc(var(--mu) * 7px) calc(var(--mu) * 14px)",
                    fontSize: "calc(var(--mu) * 10px)",
                    background: "var(--glass-surface-2)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 11px)", height: "calc(var(--mu) * 11px)" }}>
                    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                  </svg>
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Peeking cards behind the top one — static, just selling "there's a
                 deck here," never interactive themselves. */}
              {stack
                .slice(1, 3)
                .reverse()
                .map((card, i) => {
                  const depth = stack.slice(1, 3).length - i;
                  return (
                    <div
                      key={card.key}
                      aria-hidden
                      className="absolute inset-0 overflow-hidden rounded-[calc(var(--mu)*20px)]"
                      style={{
                        transform: `translateY(${depth * -10}px) scale(${1 - depth * 0.04})`,
                        opacity: 1 - depth * 0.25,
                      }}
                    >
                      <Image src={card.photo} alt="" fill className="object-cover" />
                    </div>
                  );
                })}

              {top && (
                <div
                  key={top.key}
                  className="mkt-match-card absolute inset-0 cursor-pointer overflow-hidden rounded-[calc(var(--mu)*20px)] border"
                  style={{
                    borderColor: "var(--glass-surface-2)",
                    transition: exiting?.key === top.key ? "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s" : "transform 0.3s ease",
                    transform:
                      exiting?.key === top.key
                        ? exiting.direction === "pass"
                          ? "translate(-140%, 10%) rotate(-18deg)"
                          : "translate(0, -130%) scale(1.04)"
                        : flipped
                          ? "scale(0.97)"
                          : "none",
                    opacity: exiting?.key === top.key ? 0 : 1,
                  }}
                  onTransitionEnd={(e) => {
                    if (e.propertyName === "transform" && exiting?.key === top.key) onExitTransitionEnd();
                  }}
                  onClick={() => !exiting && setFlipped((f) => !f)}
                >
                  <Image src={top.photo} alt="" fill className="object-cover" />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, var(--scrim-transparent) 0%, var(--scrim-medium) 42%, var(--scrim-heavy) 66%, var(--background) 100%)" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 text-center uppercase" style={{ padding: "calc(var(--mu) * 14px)" }}>
                    <p style={{ fontFamily: "var(--font-poster)", lineHeight: 1.15, letterSpacing: "0.3px", color: "var(--foreground)", ...posterTitleStyle(top.title) }}>
                      {top.title}
                    </p>
                    <p className="mt-1" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "calc(var(--mu) * 8px)", letterSpacing: "0.5px", color: WORLD_COLOR }}>
                      Business &amp; Finance
                    </p>
                  </div>

                  {/* Tap-to-flip info panel — real taxonomy copy, not invented. */}
                  <div
                    className="absolute inset-0 flex flex-col justify-center text-center normal-case transition-opacity duration-200"
                    style={{
                      padding: "calc(var(--mu) * 20px)",
                      background: "var(--card)",
                      opacity: flipped ? 1 : 0,
                      pointerEvents: flipped ? "auto" : "none",
                      gap: "calc(var(--mu) * 10px)",
                    }}
                  >
                    <p style={{ fontFamily: "var(--font-poster)", fontSize: "calc(var(--mu) * 13px)", color: WORLD_COLOR }}>{top.title}</p>
                    <p style={{ fontSize: "calc(var(--mu) * 11px)", lineHeight: 1.5, color: "var(--foreground)", fontWeight: 600 }}>{top.blurb}</p>

                    <div className="mt-1 flex flex-col self-stretch" style={{ gap: "calc(var(--mu) * 6px)" }}>
                      {[
                        { label: "Salary", value: top.salary },
                        { label: "College major", value: top.major },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between rounded-[calc(var(--mu)*10px)]"
                          style={{ padding: "calc(var(--mu) * 7px) calc(var(--mu) * 11px)", background: "var(--glass-surface-2)" }}
                        >
                          <span className="font-mono uppercase" style={{ fontSize: "calc(var(--mu) * 7.5px)", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>
                            {row.label}
                          </span>
                          <span style={{ fontSize: "calc(var(--mu) * 9.5px)", fontWeight: 700, color: "var(--foreground)" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-1" style={{ fontSize: "calc(var(--mu) * 8px)", color: "var(--muted-foreground)" }}>
                      + more inside the real app · tap to flip back
                    </p>
                  </div>
                </div>
              )}

              {/* Nudge: only shows before anyone has interacted. */}
              {!exiting && likedCount === 0 && stack.length === CARDS.length && (
                <p
                  className="mkt-match-nudge pointer-events-none absolute inset-x-0 text-center font-semibold"
                  style={{ bottom: "calc(var(--mu) * -22px)", fontSize: "calc(var(--mu) * 9.5px)", color: "var(--muted-foreground)" }}
                >
                  Tap the card for details · swipe to choose
                </p>
              )}
            </>
          )}
        </div>

        {!matched && (
          <div className="flex" style={{ gap: "calc(var(--mu) * 18px)" }}>
            <button
              type="button"
              aria-label="Pass"
              onClick={() => act("pass")}
              className="flex items-center justify-center rounded-full border"
              style={{ width: "calc(var(--mu) * 42px)", height: "calc(var(--mu) * 42px)", background: "var(--glass-surface-2)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 18px)", height: "calc(var(--mu) * 18px)" }}>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Like"
              onClick={() => act("like")}
              className="flex items-center justify-center rounded-full border"
              style={{ width: "calc(var(--mu) * 42px)", height: "calc(var(--mu) * 42px)", background: WORLD_COLOR, borderColor: WORLD_COLOR, color: "#fff" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ width: "calc(var(--mu) * 18px)", height: "calc(var(--mu) * 18px)" }}>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </ChapterShell>
  );
}
