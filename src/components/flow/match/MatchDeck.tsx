"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeftRightIcon } from "../icons";
import { MatchCard } from "./MatchCard";
import type { MatchCardContent, SwipeDirection } from "./types";

export type MatchDeckHandle = {
  // Lets a parent (the Pass/Like buttons) trigger the exact same animated fling-off a
  // drag release does, instead of just snapping straight to the next card — both paths
  // go through this one function so there's only one place that owns the exit motion.
  swipe: (direction: SwipeDirection) => void;
};

type MatchDeckProps = {
  // cards[0] is the current, draggable card; cards[1] and cards[2] (if present) render
  // behind it, fanned and slightly smaller, purely as a "there's more in this deck"
  // peek — never interactive themselves.
  cards: MatchCardContent[];
  onSwipeComplete: (direction: SwipeDirection) => void;
};

// Desktop's own card column is much narrower than the viewport it sits in, so a card
// only needs to travel a short distance before "vanishing into thin air" (fading out)
// reads as intentional rather than like it stopped partway through leaving. Mobile has
// no such spare room — the card IS close to the width of the screen — so there it
// travels far enough to clear the actual screen edge instead of fading.
const EXIT_DISTANCE_DESKTOP = 260;
const MOBILE_BREAKPOINT = 640;
const EXIT_DURATION_MS = 260;
const PROMOTE_DURATION_MS = 220;
const SWIPE_THRESHOLD = 110;
const MAX_ROTATION_DEG = 14;
const TUTORIAL_DURATION_MS = 1600;
// Matches the peek cards' own "closest" scale (see the `behind` map below) — the
// promoted card grows from exactly the size it was already showing at as a peek card,
// rather than an arbitrary/mismatched starting scale.
const PROMOTE_FROM_SCALE = 0.96;

export const MatchDeck = forwardRef<MatchDeckHandle, MatchDeckProps>(function MatchDeck({ cards, onSwipeComplete }, ref) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  // True only for the couple of frames right as a swipe completes and the deck resets
  // to show the next card — disables the position transition for exactly that reset, so
  // the new card's transform jumping from the old exit offset back to 0 doesn't itself
  // animate (which looked like the "new" card sliding back in from off-screen, as if it
  // were the same card returning rather than a fresh one already in place).
  const [resetInstantly, setResetInstantly] = useState(false);
  // Drives the newly-promoted top card's own grow-into-place animation — separate from
  // resetInstantly above, and on its own inner element, so it doesn't fight the outer
  // position reset. Starts at 1 (full size) and never plays anything on the very first
  // card: promotion is only ever triggered by an actual card *change* (see the effect
  // below), so the first card the user ever sees is already at its final scale.
  const [promoteScale, setPromoteScale] = useState(1);
  const [promoteTransition, setPromoteTransition] = useState(false);
  const previousTopKey = useRef<string | null>(null);
  // Shows once, briefly, the very first time this deck mounts (i.e. the very first card
  // of the very first path a user sees) — MatchDeck doesn't remount between cards or
  // paths, so this never reappears once dismissed, whether by the timer or by the user
  // just starting to drag on their own.
  const [showTutorial, setShowTutorial] = useState(true);
  // Starts at 0 (not window.innerWidth) since this also renders on the server, where
  // window doesn't exist — synced in on mount below, same pattern used elsewhere in this
  // codebase (e.g. HowItWorksSection's own vp state) for the same reason.
  const [viewportWidth, setViewportWidth] = useState(0);
  const startX = useRef(0);
  const activePointerId = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTutorial(false), TUTORIAL_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = viewportWidth > 0 && viewportWidth < MOBILE_BREAKPOINT;
  const top = cards[0];

  // Detects an actual promotion (the top card changed) vs. the initial mount, and grows
  // the new top card from PROMOTE_FROM_SCALE up to full size — set instantly (no
  // transition) on the frame it's detected, then flipped to the target scale with a
  // transition enabled one frame later, so the browser actually has something to
  // interpolate from instead of just snapping straight to 1.
  useEffect(() => {
    const previous = previousTopKey.current;
    previousTopKey.current = top.key;
    if (previous === null || previous === top.key) return;
    setPromoteTransition(false);
    setPromoteScale(PROMOTE_FROM_SCALE);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPromoteTransition(true);
        setPromoteScale(1);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [top.key]);

  function triggerExit(direction: SwipeDirection) {
    if (exitDirection) return;
    setDragging(false);
    setExitDirection(direction);
    setTimeout(() => {
      onSwipeComplete(direction);
      setResetInstantly(true);
      setExitDirection(null);
      setDragX(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setResetInstantly(false));
      });
    }, EXIT_DURATION_MS);
  }

  useImperativeHandle(ref, () => ({ swipe: triggerExit }));

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (exitDirection) return;
    setShowTutorial(false);
    activePointerId.current = event.pointerId;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || activePointerId.current !== event.pointerId) return;
    setDragX(event.clientX - startX.current);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || activePointerId.current !== event.pointerId) return;
    activePointerId.current = null;
    setDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      triggerExit(dragX > 0 ? "like" : "pass");
    } else {
      setDragX(0);
    }
  }

  const behind = cards.slice(1, 3);
  // Mobile's exit distance is derived from the actual screen width (plus a margin) each
  // time, rather than a fixed constant, so it reliably clears the edge on any phone size.
  const exitDistance = isMobile ? viewportWidth + 120 : EXIT_DISTANCE_DESKTOP;
  const offsetX = exitDirection ? (exitDirection === "like" ? exitDistance : -exitDistance) : dragX;
  const rotation = Math.max(-MAX_ROTATION_DEG, Math.min(MAX_ROTATION_DEG, (offsetX / 280) * MAX_ROTATION_DEG));

  return (
    // No scaleY squeeze here (an earlier version had one, to buy clearance for the fanned
    // peek cards' rotated corners) — that would now un-square the card MatchCard renders
    // (100% width, 90% height), which is exactly the "wide/landscape-looking" problem
    // this whole sizing system was rebuilt to fix (see --match-card-size in globals.css).
    // The proportional --match-block-gap between this deck and its neighbors (the
    // progress panel above, the CTA row below) is what supplies the fan's clearance now
    // instead.
    <div className="relative w-full">
      {/* Peek cards — the real next cards in the deck, just barely fanned (±7deg,
          symmetric) rather than heavily rotated, and each a little smaller than the one
          in front to sell "further back" — enough to read as "a stack of cards" at a
          glance without swinging out far. No blur tricks — real, legible card faces,
          only dimmed slightly so the front card still reads as the active one. */}
      {behind
        .map((card, i) => {
          const angle = i === 0 ? -7 : 7;
          const scale = i === 0 ? PROMOTE_FROM_SCALE : 0.92;
          return (
            <div
              key={card.key}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                transform: `rotate(${angle}deg) scale(${scale})`,
                opacity: 0.85,
                filter: "blur(1.5px)",
                zIndex: behind.length - i,
              }}
            >
              <MatchCard card={card} />
            </div>
          );
        })
        .reverse()}

      <div
        className="relative select-none"
        style={{
          zIndex: 10,
          transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
          // Desktop fades out alongside the short translate — "vanishes into thin air"
          // rather than needing to travel all the way to the actual edge of a much wider
          // viewport. Mobile skips the fade entirely and relies purely on distance: it
          // travels far enough (past the real screen edge) that fading would just be
          // redundant motion on top of already being off-screen.
          opacity: exitDirection && !isMobile ? 0 : 1,
          transition: dragging || resetInstantly ? "none" : `transform ${EXIT_DURATION_MS}ms ease-out, opacity ${EXIT_DURATION_MS}ms ease-out`,
          // `none`, not `pan-y` — with pan-y, a real human swipe (never perfectly
          // horizontal) frequently gets claimed by the browser's own vertical-scroll
          // gesture recognizer before our JS sees more than one pointermove, which is
          // what made this feel completely unresponsive on real phones. The deck's own
          // region doesn't need native scrolling, so it's safe to take over entirely.
          touchAction: "none",
          WebkitTouchCallout: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Separate inner element for the promote-in grow, independent of the outer
            drag/exit transform above — keeping them on different elements means neither
            animation's transition setting can interfere with the other's. */}
        <div
          style={{
            transform: `scale(${promoteScale})`,
            transition: promoteTransition ? `transform ${PROMOTE_DURATION_MS}ms ease-out` : "none",
          }}
        >
          <MatchCard card={top} />
        </div>

        {/* One-time "swipe to choose" hint, on every viewport (not just mobile) — this is
            now the only way the swipe gesture is taught at all, since the separate
            "Swipe right on what fits you..." text line was dropped as a duplicate
            explanation. Sits on top of the card itself (not blocking it:
            pointer-events-none) and fades/dismisses on its own after ~1.6s, or
            immediately once the user actually starts dragging. Icon/text sized off
            --match-card-size (not a fixed size-10/text-sm) so it scales with the card
            instead of looking oversized on a small card or undersized on a large one. */}
        {showTutorial && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[var(--radius-match-card)] bg-black/40">
            <div className="flex flex-col items-center gap-2 text-white" style={{ animation: "swipe-hint-drift 1.4s ease-in-out 1" }}>
              <ArrowLeftRightIcon className="size-[calc(var(--match-card-size)*0.12)]" />
              <span className="font-bold" style={{ fontSize: "var(--font-size-match-card-body)" }}>
                Swipe to choose
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
