"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// All three cards are real Business/Money/Office-world careers with real copy pulled
// from the vetted 322-career taxonomy spreadsheet — no invented blurbs. Salary bands are
// standard entry-level ranges for these roles (not in the taxonomy source, which has no
// salary column filled in yet). All three now use real per-career photos pulled from
// the design system's Figma file: Investment Banking and Project Manager from node
// 3156-15148, Operations from the larger "Section 2" library (node 3156-15794, "TEMPLATE
// FOR Business Money and Office" / "Operations manager") — the first section didn't
// include a dedicated Operations shot.
//
// Per direct feedback this is now a guided, two-beat tutorial rather than a genuinely
// open swipe: Operations goes first as the "how to pass" demo card (liking it never
// actually matches — see onExitTransitionEnd), and Investment Banking is the deck's
// guaranteed final match (passing it is absorbed rather than dismissing it — see
// onCardPointerUp). Project Manager stays in the stack purely for the peeking-card
// depth effect; it's not reachable in the normal guided flow.
const CARDS = [
  {
    key: "ops",
    photo: "/images/app/poster-management-analyst.png",
    title: "Management Analyst",
    blurb: "Figures out how a business can run better, then makes it happen.",
    salary: "$75K-125K",
    major: "Business & Management",
  },
  {
    key: "iba",
    // -2 suffix: same asset as career-investment-banking.jpg's final version —
    // renamed for cache busting, since this file was overwritten in place twice and
    // browsers/optimizers that had cached the URL kept showing an old photo.
    photo: "/images/app/poster-investment-banking-analyst.png",
    title: "Investment Banking",
    blurb: "Helps big companies raise money and buy other companies.",
    salary: "$85K-150K",
    major: "Business & Management",
  },
  {
    key: "pm",
    photo: "/images/career-project-manager.jpg",
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
  if (title.length <= 10) return { fontSize: "calc(var(--mu) * 22px)", whiteSpace: "normal" };
  if (title.length <= 17) return { fontSize: "calc(var(--mu) * 19px)", whiteSpace: "normal" };
  return { fontSize: "calc(var(--mu) * 16px)", whiteSpace: "normal" };
}

const SWIPE_COMMIT_PX = 90;

export function MatchChapter() {
  const [graphicRef, playing, graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();
  return (
    <ChapterShell
      id="match"
      title="Match"
      color={WORLD_COLOR}
      oneliner="with the right college major, schools and career."
      flip
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: remounts this whole demo fresh every time the reader
         scrolls back onto Match, so a swiped deck or a "You're matched" screen from a
         previous visit doesn't stay stuck showing — the swipe interaction and the
         celebration are both there to replay every visit, not just the first. */}
      <MatchDemo key={visitId} />
    </ChapterShell>
  );
}

function MatchDemo() {
  const [stack, setStack] = useState(CARDS);
  const [exiting, setExiting] = useState<{ key: string; direction: "like" | "pass" } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [matchedCard, setMatchedCard] = useState<(typeof CARDS)[number] | null>(null);
  const [dragX, setDragX] = useState(0);

  // A tap and a swipe both start as a pointerdown on the same card, so these two refs
  // (not state — nothing here should trigger a render on their own) tell them apart:
  // pointerActive marks "a pointer is currently down," moved marks "it travelled far
  // enough to count as a drag, not a tap." Also drives the drag transition: while a
  // pointer is down the card should track the finger with no easing, but the instant it
  // lifts (committed swipe or spring-back) the same transform change should animate.
  const pointerActive = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);

  const top = stack[0];
  // Liking a card is the match moment for THAT card — it doesn't wait for the rest of
  // the stack to clear. Passing every card without ever liking one still needs to end
  // somewhere, so it falls back to matching with whichever card was last on screen.
  const matched = matchedCard !== null;

  // The emotional payoff of the whole deck, then straight into Explore — advance the
  // moment the celebration's own animation actually finishes (bounce-in 0.7s, text
  // fade-in starting at 0.3s and running 0.5s more = settled by ~0.8s), not on a
  // separate multi-second "linger" timer stacked on top of it.
  useEffect(() => {
    if (!matched) return;
    const timeout = setTimeout(() => {
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 950);
    return () => clearTimeout(timeout);
  }, [matched]);

  function act(direction: "like" | "pass") {
    if (!top || exiting) return;
    setExiting({ key: top.key, direction });
  }

  function onExitTransitionEnd() {
    const direction = exiting?.direction;
    const exited = top;
    setExiting(null);
    setFlipped(false);
    if (direction === "like") {
      // Operations can no longer even commit a "like" exit at all (see
      // onCardPointerUp/the Like button's own guard below — swiping or tapping
      // right on it is blocked outright now, not just neutered after the fact),
      // so every "like" that reaches here is a real match.
      setMatchedCard(exited);
    } else {
      setStack((s) => {
        const next = s.slice(1);
        // Ran out of cards without ever liking one — fall back to matching with
        // whichever was last on screen so the storyboard still ends in a match.
        if (next.length === 0) setMatchedCard(exited);
        return next;
      });
    }
  }

  function reset() {
    setStack(CARDS);
    setExiting(null);
    setFlipped(false);
    setMatchedCard(null);
    setDragX(0);
  }

  function onCardPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // No `flipped` guard here on purpose — a tap while the info panel is showing
    // should flip back to the poster, and a swipe while it's showing should still
    // commit like/pass, not require flipping back first.
    if (exiting || !top) return;
    pointerActive.current = true;
    moved.current = false;
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onCardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerActive.current) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) moved.current = true;
    setDragX(delta);
  }

  function onCardPointerUp() {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    const delta = dragX;
    setDragX(0);
    if (!moved.current) {
      setFlipped((f) => !f);
      return;
    }
    // Each guided card is locked to the one direction its own on-screen
    // instruction actually shows — swiping the "wrong" way is simply absorbed
    // (the card springs back to its resting position via the normal
    // non-dragging transform) rather than committing anything. Operations only
    // ever demos "swipe left" (liking it is blocked outright, not just
    // neutered after the fact); Investment Banking only ever demos "swipe
    // right" (passing it is blocked so the deck can't end without matching).
    if (delta > SWIPE_COMMIT_PX && top?.key !== "ops") act("like");
    else if (delta < -SWIPE_COMMIT_PX && top?.key !== "iba") act("pass");
  }

  function onCardPointerCancel() {
    pointerActive.current = false;
    setDragX(0);
  }

  return (
      <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center" style={{ gap: "calc(var(--mu) * 14px)" }}>
        {/* aspect-ratio (not a fixed mu height) so this fits ChapterShell's shared
           frame on any viewport: flex:1 gives it the column's available height, then
           aspect-ratio derives width from that — capped by max-width so a tall/narrow
           frame still caps width instead of ever overflowing it sideways. */}
        {/* Full column width (consistent with Build/Play's 480) and whatever
           height remains once caption+buttons take theirs — the card is wide
           and shorter rather than tall and narrow. marginTop reserves the
           headroom the stacked cards peek into (depth * -18px). */}
        <div className="relative w-full min-h-0 flex-1" style={{ marginTop: "calc(var(--mu) * 26px)" }}>
          {matched && matchedCard ? (
            <div
              className="mkt-match-celebrate absolute inset-0 overflow-hidden rounded-[calc(var(--mu)*20px)]"
              style={{ ["--glow" as string]: WORLD_COLOR }}
            >
              <Image src={matchedCard.photo} alt="" fill sizes="(max-width: 900px) 94vw, 480px" className="object-cover" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, var(--scrim-transparent) 0%, var(--scrim-transparent) 55%, var(--scrim-medium) 78%, var(--background) 100%)" }}
              />
              <div className="mkt-match-celebrate-text absolute inset-x-0 bottom-0 flex flex-col items-center text-center" style={{ padding: "calc(var(--mu) * 16px)", gap: "calc(var(--mu) * 8px)" }}>
                <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: "calc(var(--mu) * 12px)", letterSpacing: "0.1em", color: WORLD_COLOR, fontWeight: 600 }}>
                  You&apos;re matched!
                </p>
                <p className="uppercase" style={{ fontFamily: "var(--font-poster)", lineHeight: 1.15, color: "var(--foreground)", ...posterTitleStyle(matchedCard.title) }}>
                  {matchedCard.title}
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
            /* One unified map over the visible slice of the stack (not two separate
               blocks for "the top card" vs "the peeking cards behind it"). Each card
               keeps the SAME key for as long as it's in the stack, so when a swipe
               removes the front card and everyone else moves up a depth, React updates
               the EXISTING DOM nodes in place instead of unmounting a "peeking" render
               and mounting a brand new "top card" render — that mount/unmount is what
               was reading as "the card behind reloads, then a dark overlay pops in":
               the peeking version had no scrim/text and a different transform, so
               swapping it for a freshly-mounted top-card element was an instant jump,
               not a transition. Now every depth change (2→1→0) animates continuously
               via the same transform/opacity transition, and the scrim/poster text
               simply fade in as part of that. */
            stack.slice(0, 3).map((card, depth) => {
              const isTop = depth === 0;
              const isExiting = isTop && exiting?.key === card.key;
              const isDragging = isTop && dragX !== 0 && !isExiting;
              const transition = isExiting
                ? "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s"
                : isDragging
                  ? "none"
                  : "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s, box-shadow 0.4s";
              const transform = isExiting
                ? exiting!.direction === "pass"
                  ? "translate(-140%, 10%) rotate(-18deg)"
                  : "translate(0, -130%) scale(1.04)"
                : isDragging
                  ? `translate(${dragX}px, ${-Math.abs(dragX) * 0.06}px) rotate(${dragX / 20}deg)`
                  : isTop && flipped
                    ? "scale(0.97)"
                    : `translateY(${depth * -18}px) scale(${1 - depth * 0.06})`;
              const opacity = isExiting ? 0 : isTop ? 1 : 1 - depth * 0.16;

              return (
                <div
                  key={card.key}
                  className={`absolute inset-0 overflow-hidden rounded-[calc(var(--mu)*20px)] border ${isTop ? "mkt-match-card cursor-grab touch-pan-y select-none active:cursor-grabbing" : ""}`}
                  style={{
                    borderColor: "var(--glass-surface-2)",
                    boxShadow: isTop ? "none" : "0 10px 24px -12px rgba(0,0,0,0.5)",
                    // Explicit stacking, not just DOM order: depth 0 (the map's first
                    // item) needs to paint front-most, but later siblings in the same
                    // stacking context paint OVER earlier ones by default — without
                    // this, the peeking cards behind rendered on TOP of the top card,
                    // and their own <1 opacity let it ghost through as a double image.
                    zIndex: 3 - depth,
                    // top-origin for the peeking cards: with the default center
                    // origin, scaling down pulled their top edge DOWN by almost
                    // exactly the translateY offset pushing it up — net peek of
                    // ~0px, i.e. the stack never actually read as a stack.
                    transformOrigin: isTop ? undefined : "top center",
                    transition,
                    transform,
                    opacity,
                  }}
                  onTransitionEnd={
                    isTop
                      ? (e) => {
                          if (e.propertyName === "transform" && isExiting) onExitTransitionEnd();
                        }
                      : undefined
                  }
                  onPointerDown={isTop ? onCardPointerDown : undefined}
                  onPointerMove={isTop ? onCardPointerMove : undefined}
                  onPointerUp={isTop ? onCardPointerUp : undefined}
                  onPointerCancel={isTop ? onCardPointerCancel : undefined}
                  {...(!isTop ? { "aria-hidden": true } : {})}
                >
                  {/* sizes: without it next/image assumes 100vw and serves w=3840
                     files for a card ChapterShell caps at 480px wide. */}
                  <Image src={card.photo} alt="" fill sizes="(max-width: 900px) 94vw, 480px" className="object-cover" draggable={false} />

                  {isTop && (
                    <>
                      {/* Scrim only needs to darken enough for the title/industry text
                         at the very bottom to read — pushed the transparent zone down
                         (was starting to darken at 42%) so most of the photo itself
                         stays visible instead of reading as a near-black card. */}
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(180deg, var(--scrim-transparent) 0%, var(--scrim-transparent) 58%, var(--scrim-medium) 80%, var(--background) 100%)" }}
                      />

                      {/* Swipe intent badges — same "like/pass" language as the buttons
                         below, just surfaced mid-drag so a swipe reads as decisive
                         even before release commits it. */}
                      <div
                        aria-hidden
                        className="absolute flex items-center justify-center rounded-[calc(var(--mu)*6px)] border-2 font-semibold uppercase"
                        style={{
                          top: "calc(var(--mu) * 16px)",
                          left: "calc(var(--mu) * 14px)",
                          padding: "calc(var(--mu) * 5px) calc(var(--mu) * 10px)",
                          fontSize: "calc(var(--mu) * 12px)",
                          letterSpacing: "0.05em",
                          color: WORLD_COLOR,
                          borderColor: WORLD_COLOR,
                          transform: "rotate(-12deg)",
                          opacity: dragX > 0 ? Math.min(dragX / SWIPE_COMMIT_PX, 1) : 0,
                        }}
                      >
                        Like
                      </div>
                      <div
                        aria-hidden
                        className="absolute flex items-center justify-center rounded-[calc(var(--mu)*6px)] border-2 font-semibold uppercase"
                        style={{
                          top: "calc(var(--mu) * 16px)",
                          right: "calc(var(--mu) * 14px)",
                          padding: "calc(var(--mu) * 5px) calc(var(--mu) * 10px)",
                          fontSize: "calc(var(--mu) * 12px)",
                          letterSpacing: "0.05em",
                          color: "var(--muted-foreground)",
                          borderColor: "var(--muted-foreground)",
                          transform: "rotate(12deg)",
                          opacity: dragX < 0 ? Math.min(-dragX / SWIPE_COMMIT_PX, 1) : 0,
                        }}
                      >
                        Pass
                      </div>

                      {/* Flip affordance (review request, round two: say it in
                         words) — a labeled glass pill in the DS caption style.
                         The whole card flips on tap. */}
                      <div
                        aria-hidden
                        className="absolute flex items-center rounded-full border uppercase"
                        style={{
                          top: "calc(var(--mu) * 10px)",
                          right: "calc(var(--mu) * 10px)",
                          gap: "calc(var(--mu) * 4px)",
                          padding: "calc(var(--mu) * 4px) calc(var(--mu) * 9px)",
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          fontSize: "calc(var(--mu) * 8px)",
                          letterSpacing: "0.06em",
                          color: "var(--foreground)",
                          background: "var(--glass-surface-1)",
                          borderColor: "var(--glass-border)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" style={{ width: "calc(var(--mu) * 9px)", height: "calc(var(--mu) * 9px)", flex: "none" }}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        Tap to see details
                      </div>

                      <div className="absolute inset-x-0 bottom-0 text-center uppercase" style={{ padding: "calc(var(--mu) * 14px)" }}>
                        <p style={{ fontFamily: "var(--font-poster)", lineHeight: 1.15, letterSpacing: "0.3px", color: "var(--foreground)", ...posterTitleStyle(card.title) }}>
                          {card.title}
                        </p>
                        <p className="mt-1" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "calc(var(--mu) * 11px)", letterSpacing: "0.5px", color: WORLD_COLOR }}>
                          Business &amp; Money
                        </p>
                      </div>

                      {/* Tap-to-flip info panel — real taxonomy copy, not invented. */}
                      <div
                        className="absolute inset-0 flex flex-col justify-center text-center transition-opacity duration-200"
                        style={{
                          padding: "calc(var(--mu) * 20px)",
                          background: "var(--card)",
                          opacity: flipped ? 1 : 0,
                          pointerEvents: flipped ? "auto" : "none",
                          gap: "calc(var(--mu) * 10px)",
                        }}
                      >
                        <p className="uppercase" style={{ fontFamily: "var(--font-poster)", fontSize: "calc(var(--mu) * 18px)", color: WORLD_COLOR }}>
                          {card.title}
                        </p>
                        <p style={{ fontSize: "calc(var(--mu) * 14px)", lineHeight: 1.5, color: "var(--foreground)", fontWeight: 600 }}>{card.blurb}</p>

                        <div className="mt-1 flex flex-col self-stretch" style={{ gap: "calc(var(--mu) * 6px)" }}>
                          {[
                            { label: "Salary", value: card.salary },
                            { label: "College major", value: card.major },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className="flex items-center justify-between rounded-[calc(var(--mu)*10px)]"
                              style={{ padding: "calc(var(--mu) * 7px) calc(var(--mu) * 11px)", background: "var(--glass-surface-2)" }}
                            >
                              <span className="uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "calc(var(--mu) * 9.5px)", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>
                                {row.label}
                              </span>
                              <span style={{ fontSize: "calc(var(--mu) * 13px)", fontWeight: 700, color: "var(--foreground)" }}>{row.value}</span>
                            </div>
                          ))}
                        </div>

                        <p className="mt-1" style={{ fontSize: "calc(var(--mu) * 10px)", color: "var(--muted-foreground)" }}>
                          + more inside the real app · tap to flip back
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}

        </div>

        {/* Nudge + like/pass live in normal flow below the card — per direct
           feedback the overlaid version covered the card; the card gives up a
           little height instead and keeps the full column width. */}
        {!matched && !exiting && top && (
          <p className="text-center font-semibold" style={{ fontSize: "calc(var(--mu) * 10px)", color: "var(--muted-foreground)" }}>
            {top.key === "ops" ? "Swipe left to see it's not a match" : "Swipe right to see a match"}
          </p>
        )}
        {/* Same guarded, direction-locked logic the swipe path uses: Pass is a
           no-op on Investment Banking, Like is a no-op on Operations. */}
        {!matched && (
          <div className="flex" style={{ gap: "calc(var(--mu) * 18px)" }}>
            <button
              type="button"
              aria-label="Pass"
              onClick={() => {
                if (top?.key !== "iba") act("pass");
              }}
              className="flex items-center justify-center rounded-full border"
              style={{ width: "calc(var(--mu) * 52px)", height: "calc(var(--mu) * 52px)", background: "var(--glass-surface-2)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 22px)", height: "calc(var(--mu) * 22px)" }}>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Like"
              onClick={() => {
                if (top?.key !== "ops") act("like");
              }}
              className="flex items-center justify-center rounded-full border"
              style={{ width: "calc(var(--mu) * 52px)", height: "calc(var(--mu) * 52px)", background: WORLD_COLOR, borderColor: WORLD_COLOR, color: "#fff" }}
            >
              {/* Thumbs-up, not a heart — per direct feedback the heart read as too
                 Tinder-like for a career-interest signal. */}
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ width: "calc(var(--mu) * 22px)", height: "calc(var(--mu) * 22px)" }}>
                <path d="M7 10v12H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1z" />
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H9a2 2 0 0 1-2-2V11.24a2 2 0 0 1 .59-1.42l4.17-4.17a1 1 0 0 1 1.63.24Z" />
              </svg>
            </button>
          </div>
        )}
      </div>
  );
}
