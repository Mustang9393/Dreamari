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
    // One responsive column, matching the updated Figma layout exactly — desktop is no
    // longer a two-column "title/progress beside the card deck" split, it's the same
    // stacked structure as mobile (eyebrow → title → progress → deck → buttons), just
    // wider and bigger everywhere via sm:/lg: variants instead of a different shape.
    // xl/2xl growth (same idea as the Build flow's FlowCard/FlowProgress): this column
    // used to hard-cap at 460px at every viewport size, which on a large monitor read as
    // a narrow strip adrift in empty background.
    // gap-[var(--match-block-gap)]: a viewport-height-based clamp (see globals.css), not
    // a fixed gap-3 — grows the space between these blocks on a tall screen instead of
    // sitting at one small value forever, while its own floor keeps it from ever reading
    // as cramped on a short one. --match-card-height (used inside MatchDeck/MatchCard) is
    // the same kind of clamp, so a tall screen also gets a more portrait-proportioned
    // card instead of just more empty space around a fixed-size one.
    <div className="flex w-full max-w-[460px] flex-col items-center gap-[var(--match-block-gap)] text-center lg:items-start lg:text-left xl:max-w-[520px] 2xl:max-w-[580px]">
      <div className="flex w-full flex-col gap-1">
        <span className="text-sm font-semibold text-[var(--color-brand-600)] lg:text-[15px]">MATCHES</span>
        <h1 className="text-[22px] leading-7 font-bold tracking-[-0.3px] text-slate-900 lg:text-[44px] lg:leading-[52px] lg:font-extrabold lg:tracking-[-1px] dark:text-white">
          {path.title}
        </h1>
        <p className="text-xs text-slate-600 lg:hidden dark:text-[var(--color-match-subtitle-dark)]">Swipe right on what fits you, left on what doesn&apos;t.</p>
      </div>

      {/* Same sm:w-[380px] lg:w-full wrapper as the deck/buttons below — MatchProgressPanel
          used to just be "w-full" against this column's own 460px max-width, running
          wider than the deck/buttons at the sm: tier instead of matching them. */}
      <div className="w-full sm:w-[380px] lg:w-full">
        <MatchProgressPanel liked={liked.length} total={cardTotal} percent={percent} />
      </div>

      <div className="w-full sm:w-[380px] lg:w-full">
        <MatchDeck ref={deckRef} cards={path.cards.slice(cardIndex)} onSwipeComplete={handleSwipeComplete} />
      </div>

      <div className="w-full sm:w-[380px] lg:w-full">
        <MatchActionButtons onPass={() => deckRef.current?.swipe("pass")} onLike={() => deckRef.current?.swipe("like")} />
      </div>

      {toast && <MatchToast label={toast.label} direction={toast.direction} onUndo={handleUndo} />}
    </div>
  );
}
