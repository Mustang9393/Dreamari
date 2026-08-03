"use client";

import { useEffect, useRef, useState } from "react";
import { MatchActionButtons } from "./MatchActionButtons";
import { MatchDeck, type MatchDeckHandle } from "./MatchDeck";
import { MatchProgressPanel } from "./MatchProgressPanel";
import { MatchToast } from "./MatchToast";
import { PathSavedScreen } from "./PathSavedScreen";
import { playLikeSound, playPassSound, playRemovedSound, playSavedSound } from "./sounds";
import type { MatchCardKey, MatchPath, SwipeDirection } from "./types";

const SAVE_THRESHOLD = 3;
const TOAST_DURATION_MS = 3000;

type MatchExperienceProps = {
  paths: MatchPath[];
  onComplete: () => void;
  /** Fires whenever the "Path Saved!" celebration opens/closes — lets FlowContainer swap
   * in the same colorful, interactive AuroraBackground + confetti treatment the Build
   * finale uses instead of the plain static MatchBackdrop, for exactly as long as the
   * celebration is on screen. */
  onCelebrationChange?: (active: boolean) => void;
};

type ToastState = { key: MatchCardKey; label: string; direction: SwipeDirection };

export function MatchExperience({ paths, onComplete, onCelebrationChange }: MatchExperienceProps) {
  const [pathIndex, setPathIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [liked, setLiked] = useState<MatchCardKey[]>([]);
  const [passed, setPassed] = useState<MatchCardKey[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingPathSaved, setPendingPathSaved] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deckRef = useRef<MatchDeckHandle>(null);

  useEffect(() => {
    onCelebrationChange?.(pendingPathSaved);
  }, [pendingPathSaved, onCelebrationChange]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      onCelebrationChange?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(next: ToastState) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(next);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }

  function dismissToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  const path = paths[pathIndex];
  const card = path.cards[cardIndex];
  const cardTotal = path.cards.length;
  const percent = Math.round(((cardIndex + 1) / cardTotal) * 100);

  function goToNextPath() {
    setPendingPathSaved(false);
    if (pathIndex + 1 < paths.length) {
      setPathIndex((i) => i + 1);
      setCardIndex(0);
      setLiked([]);
      setPassed([]);
    } else {
      onComplete();
    }
  }

  // Called only once the deck's own fling-off animation has actually finished (see
  // MatchDeck's onSwipeComplete) — whether that swipe came from a drag release or a
  // Pass/Like button click, both go through the same animated exit first, so the state
  // update (and the toast appearing) always lines up with the new card actually being
  // revealed rather than jumping ahead of what's on screen.
  function handleSwipeComplete(direction: SwipeDirection) {
    if (direction === "like") {
      setLiked((keys) => [...keys, card.key]);
      playLikeSound();
    } else {
      setPassed((keys) => [...keys, card.key]);
      playPassSound();
    }
    showToast({ key: card.key, label: card.label, direction });

    if (cardIndex + 1 < cardTotal) {
      setCardIndex((i) => i + 1);
      return;
    }
    const likedCount = direction === "like" ? liked.length + 1 : liked.length;
    if (likedCount >= SAVE_THRESHOLD) {
      setPendingPathSaved(true);
      playSavedSound();
    } else {
      goToNextPath();
    }
  }

  function handleUndo() {
    if (!toast) return;
    if (toast.direction === "like") setLiked((keys) => keys.filter((key) => key !== toast.key));
    else setPassed((keys) => keys.filter((key) => key !== toast.key));
    setCardIndex((i) => Math.max(0, i - 1));
    dismissToast();
    setPendingPathSaved(false);
    playRemovedSound();
  }

  // A real full-screen takeover, not a modal layered on top of the still-rendered deck —
  // see PathSavedScreen's own comment for why (crisp confetti/lightning behind it).
  if (pendingPathSaved) {
    return <PathSavedScreen pathTitle={path.title} liked={liked.length} passed={passed.length} onContinue={goToNextPath} />;
  }

  return (
    // One responsive column, the same stacked structure at every size (eyebrow → title →
    // progress → deck → buttons), matching Figma's own centered layout (node 740:37755).
    // max-w-[var(--match-column-max-width)]: this column is exactly as wide as the card
    // is tall (see --match-card-size in globals.css — the card is square), so all three
    // blocks below share the card's own left/right edges by construction, at every
    // viewport size, without a separate width rule to keep in sync.
    // gap-[var(--match-block-gap)]: same proportional-to-card-size system, not a fixed
    // gap-3 — grows or shrinks right along with the card instead of staying flat.
    // No subtitle line here — the swipe gesture is taught by MatchDeck's own animated
    // tutorial hint instead (shown on every viewport now, not just mobile), rather than a
    // text explanation duplicating it.
    <div className="flex w-full max-w-[var(--match-column-max-width)] flex-col items-center gap-[var(--match-block-gap)] text-center">
      <div className="flex w-full flex-col gap-1">
        <span className="text-sm font-semibold text-[var(--color-brand-600)] lg:text-[15px]">MATCHES</span>
        {/* whitespace-nowrap + a font-size that's a calc() fraction of --match-card-size
            (not a fixed 44px) — the fixed size wrapped a longer path title once the
            column itself got narrower (see --match-card-size's own reductions above);
            scaling with the actual column width instead means whichever title comes
            through stays on one line without needing per-title tuning. */}
        <h1
          className="overflow-hidden text-ellipsis whitespace-nowrap font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white"
          style={{ fontSize: "calc(var(--match-card-size) * 0.085)", lineHeight: 1.15 }}
        >
          {path.title}
        </h1>
      </div>

      <div className="w-full">
        <MatchProgressPanel liked={liked.length} total={cardTotal} percent={percent} />
      </div>

      <div className="w-full">
        <MatchDeck ref={deckRef} cards={path.cards.slice(cardIndex)} onSwipeComplete={handleSwipeComplete} />
      </div>

      <div className="w-full">
        <MatchActionButtons onPass={() => deckRef.current?.swipe("pass")} onLike={() => deckRef.current?.swipe("like")} />
      </div>

      {toast && <MatchToast label={toast.label} direction={toast.direction} onUndo={handleUndo} />}
    </div>
  );
}
