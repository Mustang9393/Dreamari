"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BorderBeam } from "border-beam";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll, advanceTo } from "../scrollHooks";

// All three cards are real Business/Money/Office-world careers with real copy pulled
// from the vetted 322-career taxonomy spreadsheet — no invented blurbs. Salaries are the
// U.S. medians the rest of the app shows (Career Report, career details, Get Hired):
// IB $361K and PE $250K from the Dreamari brief, Management Analyst from BLS. Bands were
// standard entry-level ranges for these roles (not in the taxonomy source, which has no
// salary column filled in yet). All three now use real per-career photos pulled from
// the design system's Figma file: Investment Banking and Project Manager from node
// 3156-15148, Operations from the larger "Section 2" library (node 3156-15794, "TEMPLATE
// FOR Business Money and Office" / "Operations manager") — the first section didn't
// include a dedicated Operations shot.
//
// Tap-based, not swipe-based (direct instruction, 13 Sept 2026: the real app's Match
// flow is now MatchGrid, a tap/select grid -- swipe-to-like is sunsetted, so this demo
// shouldn't teach a gesture the product no longer uses). Chevron Prev/Next buttons page
// through all three cards in either direction (a plain reorder, not a fly-off swipe); a
// small "+" badge on the card is the match action, replacing the old Like button; tap
// the card itself to flip it and see the salary/major detail, unchanged from before.
const CARDS = [
  {
    key: "ops",
    photo: "/images/app/poster-management-analyst.webp",
    title: "Management Analyst",
    blurb: "Figures out how a business can run better, then makes it happen.",
    salary: "$99K",
    major: "Business & Management",
  },
  {
    key: "iba",
    // -v3 suffix: the founder-supplied "Investment banker.png", renamed for
    // cache busting (this URL family has been overwritten in place before and
    // cached optimizer renditions kept showing the old photo). ONE shared v3
    // file now serves Explore, Match Lab, Profile and this chapter.
    photo: "/images/app/poster-investment-banking-v3.webp",
    title: "Investment Banking",
    blurb: "Helps big companies raise money and buy other companies.",
    salary: "$361K",
    major: "Business & Management",
  },
  {
    // Private Equity, using the founder-supplied "Private Equity.png";
    // blurb/salary from the app's canonical Private Equity Analyst copy in
    // catalog.ts. Fully reachable now (Prev/Next just page through all three).
    key: "pe",
    photo: "/images/app/poster-private-equity.webp",
    title: "Private Equity",
    blurb: "Helps investors buy, improve, and sell companies for long-term returns.",
    salary: "$250K",
    major: "Finance or Economics",
  },
];

const WORLD_COLOR = "var(--world-business-money-office)";

// Wider than the Play tab's own MobileDeck (16px/0.06) -- direct feedback there
// too: the peeking cards need to actually read as peeking, not just a sliver.
const DECK_STEP_X = 34;
const DECK_STEP_SCALE = 0.09;
const DECK_VISIBLE = 3;

// Figma's own Career Poster Card spec ties title size to length (<=16 large, 17-35
// medium, >35 small); past 16 characters we also let it wrap to two lines instead of
// keeping shrinking a single line down to illegible, since these real titles ("Investment
// Banking Analyst") run long and this card has the vertical room to spare.
function posterTitleStyle(title: string): React.CSSProperties {
  if (title.length <= 10) return { fontSize: "calc(var(--mu) * 22px)", whiteSpace: "normal" };
  if (title.length <= 17) return { fontSize: "calc(var(--mu) * 19px)", whiteSpace: "normal" };
  return { fontSize: "calc(var(--mu) * 16px)", whiteSpace: "normal" };
}

export function MatchChapter() {
  const [graphicRef, playing, graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();
  return (
    <ChapterShell
      id="match"
      title="Match"
      color={WORLD_COLOR}
      oneliner="with careers and schools that fit who you are."
      flip
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: remounts this whole demo fresh every time the reader
         scrolls back onto Match, so a paged-through deck or a "You're matched" screen
         from a previous visit doesn't stay stuck showing — the browsing and the
         celebration are both there to replay every visit, not just the first. */}
      <MatchDemo key={visitId} />
    </ChapterShell>
  );
}

function MatchDemo() {
  // order: all three card keys, rotating front-to-back as Prev/Next page through them
  // (a plain reorder, always all three rendered -- not a depleting swipe deck, so
  // Prev/Next both always work and every card stays reachable).
  const [order, setOrder] = useState(CARDS.map((c) => c.key));
  const [flipped, setFlipped] = useState(false);
  // True while the front card is flying up after its "+" tap, before it becomes the
  // official match -- keeps that one flourish without needing it for ordinary paging.
  const [selecting, setSelecting] = useState(false);
  const [matchedCard, setMatchedCard] = useState<(typeof CARDS)[number] | null>(null);

  const top = CARDS.find((c) => c.key === order[0])!;
  const matched = matchedCard !== null;

  // The emotional payoff of the whole deck, then straight into Play — matched with a
  // career, so trying it out is the more intuitive next step than Explore (order per
  // Joshua Pierce, Slack, 5 Sept 2026). Advance the moment the celebration's own
  // animation actually finishes (bounce-in 0.7s, text fade-in starting at 0.3s and
  // running 0.5s more = settled by ~0.8s), not on a separate multi-second "linger"
  // timer stacked on top of it.
  useEffect(() => {
    if (!matched) return;
    const timeout = setTimeout(() => {
      advanceTo("play");
    }, 950);
    return () => clearTimeout(timeout);
  }, [matched]);

  function advance() {
    if (selecting) return;
    setOrder((o) => [...o.slice(1), o[0]]);
    setFlipped(false);
  }
  function back() {
    if (selecting) return;
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
    setFlipped(false);
  }
  function selectTop() {
    if (selecting || !top) return;
    setFlipped(false);
    setSelecting(true);
  }
  function onSelectTransitionEnd() {
    setSelecting(false);
    setMatchedCard(top);
  }

  function reset() {
    setOrder(CARDS.map((c) => c.key));
    setFlipped(false);
    setSelecting(false);
    setMatchedCard(null);
  }

  return (
      <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center" style={{ gap: "calc(var(--mu) * 14px)" }}>
        {/* aspect-ratio (not a fixed mu height) so this fits ChapterShell's shared
           frame on any viewport: flex:1 gives it the column's available height, then
           aspect-ratio derives width from that — capped by max-width so a tall/narrow
           frame still caps width instead of ever overflowing it sideways. */}
        {/* Full column width (consistent with Build/Play's 480) and whatever
           height remains once caption+buttons take theirs — the card is wide
           and shorter rather than tall and narrow. */}
        <div className="relative w-full min-h-0 flex-1">
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
            /* One unified map over all three cards (not two separate blocks for "the
               top card" vs "the peeking cards behind it"). Each card keeps the SAME
               key for as long as the demo runs, so paging (a plain reorder) updates
               the EXISTING DOM nodes in place instead of unmounting a "peeking" render
               and mounting a brand new "top card" render — that mount/unmount is what
               used to read as "the card behind reloads, then a dark overlay pops in":
               the peeking version had no scrim/text and a different transform, so
               swapping it for a freshly-mounted top-card element was an instant jump,
               not a transition. Now every depth change (2→1→0) animates continuously
               via the same transform/opacity transition, and the scrim/poster text
               simply fade in as part of that. */
            order.map((key, depth) => {
              const card = CARDS.find((c) => c.key === key)!;
              const isTop = depth === 0;
              const isSelecting = isTop && selecting;
              const transition = "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s, box-shadow 0.4s";
              const transform = isSelecting
                ? "translate(0, -130%) scale(1.04)"
                : isTop && flipped
                  ? "scale(0.97)"
                  : `translateX(${depth * DECK_STEP_X}px) scale(${1 - depth * DECK_STEP_SCALE})`;
              const opacity = isSelecting ? 0 : isTop ? 1 : 1 - depth * 0.16;

              return (
                <div
                  key={card.key}
                  className={`absolute top-0 left-0 h-full overflow-hidden rounded-[calc(var(--mu)*20px)] border ${isTop ? "mkt-match-card select-none" : ""}`}
                  style={{
                    // Same fanned-stack mechanic as the Play tab's mobile deck
                    // (MobileDeck in PlayHub.tsx), spread out wider (34px/0.09
                    // vs its own 16px/0.06) so the peeking cards actually read
                    // as peeking, not a sliver -- direct instruction, 13 Sept
                    // 2026. Each card is narrower than the container by the
                    // deepest card's full offset, so translating it right by
                    // that same amount lands its edge flush with the frame.
                    width: `calc(100% - ${DECK_STEP_X * (DECK_VISIBLE - 1)}px)`,
                    borderColor: "var(--glass-surface-2)",
                    boxShadow: isTop ? "none" : "0 10px 24px -12px rgba(0,0,0,0.5)",
                    // Explicit stacking, not just DOM order: depth 0 (the map's first
                    // item) needs to paint front-most, but later siblings in the same
                    // stacking context paint OVER earlier ones by default — without
                    // this, the peeking cards behind rendered on TOP of the top card,
                    // and their own <1 opacity let it ghost through as a double image.
                    zIndex: 3 - depth,
                    // Right-center origin for the peeking cards, so scaling down
                    // keeps their right edge anchored (the fan grows rightward)
                    // instead of shrinking toward the center and losing the peek.
                    transformOrigin: isTop ? "50% 50%" : "100% 50%",
                    transition,
                    transform,
                    opacity,
                  }}
                  onTransitionEnd={
                    isTop
                      ? (e) => {
                          if (e.propertyName === "transform" && isSelecting) onSelectTransitionEnd();
                        }
                      : undefined
                  }
                  onClick={isTop ? () => setFlipped((f) => !f) : undefined}
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

                      {/* Match badge -- replaces the old swipe-to-like gesture. A
                         corner badge, same position the flip-affordance pill
                         used to share the top edge with, so neither one covers
                         the photo (per earlier feedback about an overlaid
                         button row doing that). Bigger and higher-contrast than
                         a first pass (direct feedback, 13 Sept 2026: "isn't very
                         obvious") -- solid dark glass, a bright ring, its own
                         shadow -- but the glyph itself stays plain white, not
                         tinted, so the ring/beam carries the emphasis instead.
                         Investment Banking only (direct feedback, 13 Sept
                         2026): the deck only has one real simulation behind it
                         (Play always previews Investment Banking), so matching
                         with Management Analyst or Private Equity landed on
                         the wrong game and made the landing page's promise
                         feel broken. Hiding the badge on the other two avoids
                         both that mismatch and a busy "match anything" deck. */}
                      {card.key === "iba" && (
                        <div className="absolute mkt-scale-pulse" style={{ top: "calc(var(--mu) * 10px)", left: "calc(var(--mu) * 10px)" }}>
                          <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85} active>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectTop();
                              }}
                              aria-label={`Match with ${card.title}`}
                              className="flex items-center justify-center rounded-full border-2"
                              style={{
                                width: "calc(var(--mu) * 34px)",
                                height: "calc(var(--mu) * 34px)",
                                color: "#fff",
                                background: "rgba(5,7,15,0.55)",
                                borderColor: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(6px)",
                                WebkitBackdropFilter: "blur(6px)",
                                boxShadow: "0 4px 14px -4px rgba(0,0,0,0.5)",
                              }}
                            >
                              <Plus style={{ width: "calc(var(--mu) * 18px)", height: "calc(var(--mu) * 18px)" }} strokeWidth={2.8} aria-hidden />
                            </button>
                          </BorderBeam>
                        </div>
                      )}

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
                            { label: "Median salary", value: card.salary },
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

        {/* Nudge + Prev/Next live in normal flow below the card — per direct
           feedback an overlaid button row covered the card; the card gives up a
           little height instead and keeps the full column width. */}
        {!matched && !selecting && top && (
          <p className="text-center font-semibold" style={{ fontSize: "calc(var(--mu) * 10px)", color: "var(--muted-foreground)" }}>
            Tap the + on the one that&apos;s a match
          </p>
        )}
        {!matched && (
          <div className="flex" style={{ gap: "calc(var(--mu) * 18px)" }}>
            <button
              type="button"
              aria-label="Previous career"
              onClick={back}
              className="flex items-center justify-center rounded-full border"
              style={{ width: "calc(var(--mu) * 52px)", height: "calc(var(--mu) * 52px)", background: "var(--glass-surface-2)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <ChevronLeft style={{ width: "calc(var(--mu) * 22px)", height: "calc(var(--mu) * 22px)" }} strokeWidth={2.5} aria-hidden />
            </button>
            {/* Nudges paging forward through the deck -- the next logical action
               once swipe-to-like was sunsetted (direct feedback, 13 Sept 2026) --
               except on Investment Banking, where the nudge hands off to the "+"
               badge on the card itself (that's the deck's intended match, so the
               next logical action there is completing it, not paging past it).
               Same beam + gentle scale-breathing language as the old Pass/Like
               nudge, active only while its own condition is true, not hover-gated
               (direct feedback, 9 Sept 2026). The pulse class can't live on
               BorderBeam's own wrapper: its injected stylesheet sets `animation`
               on that exact element for the spin/fade-in, and (same specificity,
               later in the DOM) silently wins over a plain class doing the same. */}
            <div className={top?.key !== "iba" ? "mkt-scale-pulse" : undefined}>
              <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85} active={top?.key !== "iba"}>
                <button
                  type="button"
                  aria-label="Next career"
                  onClick={advance}
                  className="flex items-center justify-center rounded-full border"
                  style={{ width: "calc(var(--mu) * 52px)", height: "calc(var(--mu) * 52px)", background: "var(--glass-surface-2)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <ChevronRight style={{ width: "calc(var(--mu) * 22px)", height: "calc(var(--mu) * 22px)" }} strokeWidth={2.5} aria-hidden />
                </button>
              </BorderBeam>
            </div>
          </div>
        )}
      </div>
  );
}
