"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// A real, user-driven feed — committed one-card-at-a-time paging (TikTok/Reels shape,
// per direct request), not a native free-scrolling list with scroll-snap settling.
// Matches Match's card size (168 x 300 mu) per feedback that the two should read as the
// same scale of thing.
// The industry line (under the title) says what field a career is actually in — the
// two business-track cards share "Business & Finance," but the Wildcard genuinely
// isn't, so it gets its own. Match strength (Strong Match/Match/Wildcard) is a
// separate corner-ribbon badge rather than replacing the industry line — the two say
// different things and shouldn't compete for the same line. Photos for the
// business-track cards are reused stand-ins from the shoot we already have on hand
// (neither is a literal photoshoot of that specific career); Food Scientist uses a
// user-supplied photo instead. Salary bands are the same standard entry-level
// estimates used in Match, not sourced from the taxonomy sheet (which has no salary
// column filled in).
// Trimmed from 4 to 3 cards per direct request — dropped Human Resources/Stretch,
// keeping the two ends of the match-strength spectrum (Strong Match, Match) plus the
// Wildcard, rather than the middle-of-the-road one.
const CARDS = [
  { photo: "/images/career-pe-analyst.jpg", title: "Accountant", industry: "Business & Finance", matchLevel: "Strong Match", tagColor: "#1fc76e", salary: "$50K-85K", major: "Accounting" },
  { photo: "/images/career-ux-designer.jpg", title: "Management Analyst", industry: "Business & Finance", matchLevel: "Match", tagColor: "#3b82f6", salary: "$70K-100K", major: "Business Administration" },
  // The Wildcard is meant to be a genuine reach outside the storyboard's own world —
  // it should never say "Business & Finance" just because the other two do.
  { photo: "/images/career-food-scientist.jpg", title: "Food Scientist", industry: "Science & Research", matchLevel: "Wildcard", tagColor: "#8b5cf6", salary: "$60K-95K", major: "Food Science" },
];

const ACTION_ICONS = [
  // heart
  <path key="heart" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />,
  // thumbs-down
  <path key="thumbs-down" d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-2-2.3l1.4-9A2 2 0 0 1 5.57 1H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.34a2 2 0 0 0-1.82 1.18l-2.3 5.02a1.7 1.7 0 0 1-1.54.98v0A2.13 2.13 0 0 1 9 18.12Z" />,
  // bookmark
  <path key="bookmark" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />,
];

// Lucide "dollar-sign" / "graduation-cap" paths.
const STAT_ICONS = {
  salary: (
    <>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  duration: (
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>
  ),
};

// Same length-tiered sizing problem Match's poster titles solve: a flat font size let
// longer titles ("Management Analyst") run into the right-side action rail. Shorter
// titles get to be genuinely big; longer ones step down and, past a point, wrap.
function exploreTitleStyle(title: string): React.CSSProperties {
  if (title.length <= 10) return { fontSize: "calc(var(--mu) * 21px)", whiteSpace: "nowrap" };
  if (title.length <= 16) return { fontSize: "calc(var(--mu) * 18px)", whiteSpace: "normal" };
  return { fontSize: "calc(var(--mu) * 15px)", whiteSpace: "normal" };
}

type Card = (typeof CARDS)[number];

// Shared between a plain card and the holo-framed Wildcard variant below, so the two
// don't drift out of sync with duplicated markup.
function ExploreCardBody({ card }: { card: Card }) {
  return (
    <>
      <Image src={card.photo} alt="" fill className="object-cover" draggable={false} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 42%, var(--scrim-heavy) 100%)" }}
      />

      {/* Match-strength corner ribbon — separate from the industry line below, not a
         replacement for it. */}
      <div
        className="absolute font-mono font-bold uppercase"
        style={{
          top: "calc(var(--mu) * 12px)",
          right: "calc(var(--mu) * 12px)",
          padding: "calc(var(--mu) * 4px) calc(var(--mu) * 9px)",
          fontSize: "calc(var(--mu) * 8.5px)",
          letterSpacing: "0.06em",
          borderRadius: "calc(var(--mu) * 20px)",
          color: card.tagColor,
          background: "color-mix(in srgb, var(--card) 55%, transparent)",
          border: `1px solid ${card.tagColor}`,
          backdropFilter: "blur(6px)",
        }}
      >
        {card.matchLevel}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 text-center uppercase"
        style={{ padding: "calc(var(--mu) * 10px) calc(var(--mu) * 44px)" }}
      >
        <p
          style={{
            fontFamily: "var(--font-poster)",
            lineHeight: 1.15,
            letterSpacing: "0.4px",
            color: "var(--foreground)",
            ...exploreTitleStyle(card.title),
          }}
        >
          {card.title}
        </p>
        <p
          className="mt-1.5 whitespace-nowrap"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "calc(var(--mu) * 8px)",
            letterSpacing: "0.5px",
            color: "#ffb81f",
          }}
        >
          {card.industry}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center normal-case" style={{ gap: "calc(var(--mu) * 10px)" }}>
          {[
            { icon: STAT_ICONS.salary, value: card.salary },
            { icon: STAT_ICONS.duration, value: card.major },
          ].map((stat, i) => (
            <div key={i} className="flex items-center" style={{ gap: "calc(var(--mu) * 5px)" }}>
              <span
                className="flex flex-none items-center justify-center rounded-full border"
                style={{
                  width: "calc(var(--mu) * 18px)",
                  height: "calc(var(--mu) * 18px)",
                  background: "var(--glass-surface-1)",
                  borderColor: "var(--glass-border)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "calc(var(--mu) * 9px)", height: "calc(var(--mu) * 9px)", flex: "none" }}
                >
                  {stat.icon}
                </svg>
              </span>
              <span style={{ fontSize: "calc(var(--mu) * 10.5px)", fontWeight: 700, color: "var(--foreground)" }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CardFace({ card }: { card: Card }) {
  if (card.matchLevel !== "Wildcard")
    return (
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "calc(var(--mu) * 17px)" }}>
        <ExploreCardBody card={card} />
      </div>
    );
  // Rare-pull treatment: a rotating gradient "foil" border framing it (rather than the
  // full-bleed edge-to-edge photo the other two use), and a diagonal sheen sweeping
  // across on top — same idea as a holographic trading card catching the light. No
  // separate blurred aura layer — every version of that (unclipped sibling, clipped-
  // in-place, self-masked) either bled into the chapter below or clipped unevenly on
  // one axis vs. the other (soft top/bottom, hard left/right, or vice versa), and a
  // glow that reads differently on different sides looks like a mistake rather than a
  // deliberate effect. The rotating border + sheen alone already reads as premium and
  // stays uniform on every edge.
  return (
    <div className="relative h-full w-full" style={{ padding: "calc(var(--mu) * 3px)" }}>
      <div className="mkt-holo-border absolute inset-0" style={{ borderRadius: "calc(var(--mu) * 20px)" }} />
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "calc(var(--mu) * 17px)" }}>
        <ExploreCardBody card={card} />
        <div aria-hidden className="mkt-holo-sheen pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}

// Drives a numeric React state through an eased ramp — used for both the intro "peek"
// nudge and (implicitly, via the same drag math) nothing else, but kept generic since
// native scrollTo-style easing doesn't apply to a value that isn't a real scrollTop.
function animateNumber(from: number, to: number, duration: number, onUpdate: (v: number) => void): () => void {
  const startTime = performance.now();
  let raf = 0;
  function step(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    onUpdate(from + (to - from) * eased);
    if (t < 1) raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

const COMMIT_THRESHOLD_FRACTION = 0.16; // swipe past 16% of a card's height to commit
// Each card is rendered slightly SHORTER than the container (not full inset-0), leaving
// a gutter above and below the focused card — that gutter is exactly the space the
// next/previous card's own top/bottom sliver peeks into. Without this, every card
// (focused or not) is exactly container-sized, so the focused one covers the entire
// container edge-to-edge and there is no gap for a neighbor to ever show through,
// regardless of z-index or position — z-index only resolves OVERLAPPING pixels, and
// two same-size, edge-to-edge cards never leave any pixels for a third to occupy.
const GUTTER_FRACTION = 0.09;
const LAST_INDEX = CARDS.length - 1;

export function ExploreChapter() {
  const [graphicRef, , graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  // dragPx: how far the current gesture (real touch/pointer, or the scripted intro
  // peek) has moved, in the SAME sign convention as a Reels swipe — positive means
  // "pushing toward the next card." Added straight into each card's position so the
  // whole deck visually follows the finger (or the peek animation) before a release
  // commits to a new activeIndex or springs back to the current one.
  const [dragPx, setDragPx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  const pointerActive = useRef(false);
  const moved = useRef(false);
  const startY = useRef(0);

  // Shared position math for a card at a given index — used both by the main clipped
  // card loop and by the unclipped Wildcard aura sibling below, so the aura always
  // tracks exactly where the Wildcard card itself currently sits (mid-drag included)
  // without duplicating the offset/scale/opacity formulas in two places.
  function cardMetrics(index: number, cardHeight: number) {
    const virtualIndex = activeIndex + dragPx / cardHeight;
    const offset = index - virtualIndex;
    const distance = Math.min(Math.abs(offset), 1);
    const scale = 1 - distance * 0.14;
    const opacity = 1 - distance * 0.65;
    return { offset, scale, opacity };
  }

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // React's own onWheel prop (below) is attached passively since v17, so calling
  // preventDefault() from inside it silently does nothing — a real trackpad swipe was
  // committing this carousel's own index AND letting the native page scroll through the
  // scroll-snap sections at the same time, which is what actually caused an apparent
  // "jump two cards/chapters at once" on a single swipe. A plain, non-passive listener
  // registered directly on the element (bubling order between it and React's delegated
  // handler doesn't matter — the browser only checks defaultPrevented once the whole
  // dispatch finishes) stops the native scroll; the onWheel prop below is untouched and
  // still owns all the actual commit logic.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function preventNativeScroll(e: WheelEvent) {
      e.preventDefault();
    }
    el.addEventListener("wheel", preventNativeScroll, { passive: false });
    return () => el.removeEventListener("wheel", preventNativeScroll);
  }, []);

  function goToPrevChapter() {
    document.getElementById("play")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function goToNextChapter() {
    document.getElementById("connect")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Nudge, in two beats: first the next card physically slides up into view and
  // settles back (a "look, this scrolls" cue more intuitive than an icon alone), THEN
  // — once that's done, not simultaneously — a small down-arrow fades in as a
  // lingering reminder. Doing both at once had the peek motion and the arrow
  // competing for attention at the same time; sequencing them reads as one clear cue
  // instead of two clashing ones. Reuses the exact same dragPx channel a real swipe
  // would drive, so the peek is just "what a small real swipe would look like."
  useEffect(() => {
    if (!graphicRevealed || scrolled || containerHeight === 0) return;
    let cancelPeek: (() => void) | undefined;
    let cancelSettle: (() => void) | undefined;
    const cardHeight = containerHeight * (1 - 2 * GUTTER_FRACTION);
    const peekPx = cardHeight * 0.22;
    const timeout = setTimeout(() => {
      cancelPeek = animateNumber(0, peekPx, 900, setDragPx);
      setTimeout(() => {
        cancelSettle = animateNumber(peekPx, 0, 700, setDragPx);
        setTimeout(() => setShowArrow(true), 700);
      }, 900 + 650);
    }, 900);
    return () => {
      clearTimeout(timeout);
      cancelPeek?.();
      cancelSettle?.();
    };
  }, [graphicRevealed, scrolled, containerHeight]);

  function commit(direction: 1 | -1) {
    setScrolled(true);
    if (direction === 1) {
      if (activeIndex < LAST_INDEX) setActiveIndex((i) => i + 1);
      else goToNextChapter();
    } else {
      if (activeIndex > 0) setActiveIndex((i) => i - 1);
      else goToPrevChapter();
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    pointerActive.current = true;
    moved.current = false;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerActive.current) return;
    const delta = startY.current - e.clientY; // finger moving up → positive → toward next card
    if (Math.abs(delta) > 4) moved.current = true;
    setDragPx(delta);
  }
  function onPointerUp() {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    const delta = dragPx;
    setDragPx(0);
    if (!moved.current || containerHeight === 0) return;
    const cardHeight = containerHeight * (1 - 2 * GUTTER_FRACTION);
    const threshold = cardHeight * COMMIT_THRESHOLD_FRACTION;
    if (delta > threshold) commit(1);
    else if (delta < -threshold) commit(-1);
  }
  function onPointerCancel() {
    pointerActive.current = false;
    setDragPx(0);
  }

  // Desktop wheel/trackpad gets the same discrete, one-gesture-one-card commit
  // (rather than continuously forwarding scroll deltas) — a cooldown treats a whole
  // trackpad swipe as a single commit instead of firing many times per gesture.
  const wheelLocked = useRef(false);
  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (wheelLocked.current) return;
    if (Math.abs(e.deltaY) < 4) return;
    wheelLocked.current = true;
    setScrolled(true);
    commit(e.deltaY > 0 ? 1 : -1);
    setTimeout(() => {
      wheelLocked.current = false;
    }, 550);
  }

  return (
    <ChapterShell
      id="explore"
      title="Explore"
      color="#1fc76e"
      oneliner="careers, companies, and pathways with depth."
      flip
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* aspect-ratio (not a fixed mu height) so this fits ChapterShell's shared frame
         on any viewport, matching Match's card sizing exactly.

         No native scroll here anymore — this is a committed, index-based carousel
         (TikTok/Reels-style paging, per direct request) rather than a free-scrolling
         list that happens to snap. Every card is rendered at `cardHeight` (shorter than
         the container by a `GUTTER_FRACTION` margin top and bottom — see the constant's
         comment for why that margin has to exist at all) and placed via
         `translateY(offset * cardHeight)`, where `offset` is continuous (not just
         -1/0/1) so a live drag/peek smoothly interpolates position, scale, and
         opacity — the focused card fills that space fully, and the ones above/below
         shrink and fade the further they are from center, their sliver peeking into the
         gutter, reading as spatially behind rather than just visually dimmed. */}
      <div className="relative h-full max-w-full" style={{ aspectRatio: "168 / 240" }}>
        <div
          ref={containerRef}
          className="relative h-full w-full touch-none overflow-hidden select-none"
          style={{
            cursor: "grab",
            // Fades the track's own top/bottom strip to transparent instead of a hard
            // clip line — stops exactly at the gutter boundary on each side, so the
            // FOCUSED card (which always sits fully within that middle band) never has
            // its own edges faded; only a peeking neighbor's sliver, which lives inside
            // the faded strip by definition, softens as it nears the frame's edge. Only
            // vertical: cards never peek side-to-side, so there's no equivalent
            // horizontal margin to fade within — the Wildcard's aura needs its own
            // self-contained fade for that (see CardFace) rather than one here, since a
            // fade on the whole track would also dim every other card's own photo at
            // its left/right edges.
            maskImage: `linear-gradient(to bottom, transparent 0%, black ${GUTTER_FRACTION * 100}%, black ${(1 - GUTTER_FRACTION) * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black ${GUTTER_FRACTION * 100}%, black ${(1 - GUTTER_FRACTION) * 100}%, transparent 100%)`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onWheel={onWheel}
        >
          {containerHeight > 0 &&
            (() => {
              const gutterPx = containerHeight * GUTTER_FRACTION;
              const cardHeight = containerHeight - gutterPx * 2;
              return CARDS.map((card, i) => {
                const { offset, scale, opacity } = cardMetrics(i, cardHeight);
                return (
                  <div
                    key={card.title}
                    className="absolute inset-x-0"
                    style={{
                      top: gutterPx,
                      height: cardHeight,
                      transform: `translateY(${offset * cardHeight}px) scale(${scale})`,
                      opacity,
                      zIndex: 100 - Math.round(Math.min(Math.abs(offset), 1) * 100),
                      transition: pointerActive.current ? "none" : "transform 0.42s cubic-bezier(0.4,0,0.2,1), opacity 0.42s",
                    }}
                  >
                    <CardFace card={card} />
                  </div>
                );
              });
            })()}
        </div>

        {/* Second beat of the nudge: a small down-arrow, only after the peek-scroll
           above has already settled back (not simultaneous with it — see the effect's
           comment). Sits at the card's vertical midpoint rather than near the bottom,
           since every card's own title/industry/stats text lives in the bottom ~30%
           of the card — the earlier version overlapped that zone and read as
           "clashing with the text in the card." The photo itself has nothing there on
           any of the three cards, so this stays clear regardless of which is showing. */}
        {showArrow && !scrolled && (
          <div
            aria-hidden
            className="mkt-explore-arrow pointer-events-none absolute inset-x-0 flex justify-center"
            style={{ top: "56%" }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "calc(var(--mu) * 30px)",
                height: "calc(var(--mu) * 30px)",
                background: "color-mix(in srgb, var(--background) 45%, transparent)",
                backdropFilter: "blur(4px)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "calc(var(--mu) * 16px)", height: "calc(var(--mu) * 16px)" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        )}

        {/* Right-side action rail, straight off the reference — static, just selling
           the "real app feed" read. */}
        <div
          className="pointer-events-none absolute flex flex-col items-center"
          style={{ right: "calc(var(--mu) * 10px)", bottom: "calc(var(--mu) * 46px)", gap: "calc(var(--mu) * 10px)", zIndex: 200 }}
        >
          {ACTION_ICONS.map((icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-full border"
              style={{
                width: "calc(var(--mu) * 26px)",
                height: "calc(var(--mu) * 26px)",
                background: "var(--glass-surface-1)",
                borderColor: "var(--glass-border)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "calc(var(--mu) * 13px)", height: "calc(var(--mu) * 13px)" }}
              >
                {icon}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </ChapterShell>
  );
}
