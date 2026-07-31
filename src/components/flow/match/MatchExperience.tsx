"use client";

import { useEffect, useRef, useState } from "react";
import { MatchActionButtons } from "./MatchActionButtons";
import { MatchCard } from "./MatchCard";
import { MatchProgressPanel } from "./MatchProgressPanel";
import { MatchToast } from "./MatchToast";
import { PathSavedModal } from "./PathSavedModal";
import { playLikeSound, playPassSound, playRemovedSound, playSavedSound } from "./sounds";
import type { MatchCardKey, MatchPath, SwipeDirection } from "./types";

const SAVE_THRESHOLD = 3;
const TOAST_DURATION_MS = 3000;

type MatchExperienceProps = {
  paths: MatchPath[];
  onComplete: () => void;
};

type ToastState = { key: MatchCardKey; label: string; direction: SwipeDirection };

export function MatchExperience({ paths, onComplete }: MatchExperienceProps) {
  const [pathIndex, setPathIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [liked, setLiked] = useState<MatchCardKey[]>([]);
  const [passed, setPassed] = useState<MatchCardKey[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingPathSaved, setPendingPathSaved] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
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

  function handleSwipe(direction: SwipeDirection) {
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
    // Liked-count check needs the just-recorded like, not the pre-swipe state.
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

  const progressPanel = <MatchProgressPanel liked={liked.length} total={cardTotal} percent={percent} />;
  const deck = (
    <div className="flex w-full flex-col items-center gap-6 sm:w-[380px]">
      <MatchCard card={card} />
      <MatchActionButtons onPass={() => handleSwipe("pass")} onLike={() => handleSwipe("like")} />
    </div>
  );

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6">
      {/* Desktop: two columns — title/progress on the left, card deck on the right. */}
      <div className="hidden w-full items-center justify-center gap-16 lg:flex">
        <div className="flex w-[460px] flex-col gap-10">
          <div className="flex flex-col gap-4">
            <span className="text-[15px] font-semibold text-[#1f5ff0]">MATCH EXPERIENCE</span>
            <h1 className="text-[44px] leading-[52px] font-extrabold tracking-[-1px] text-slate-900 dark:text-white">{path.title}</h1>
          </div>
          {progressPanel}
        </div>
        {deck}
      </div>

      {/* Mobile: stacked — progress panel, title, card deck. */}
      <div className="flex w-full max-w-md flex-col items-center gap-4 lg:hidden">
        {progressPanel}
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <h1 className="text-[22px] leading-7 font-bold tracking-[-0.3px] text-slate-900 dark:text-white">{path.title}</h1>
          <p className="text-xs text-slate-600 dark:text-[#b3ccff]">Swipe right on what fits you, left on what doesn&apos;t.</p>
        </div>
        {deck}
      </div>

      {toast && <MatchToast label={toast.label} direction={toast.direction} onUndo={handleUndo} />}
      {pendingPathSaved && <PathSavedModal pathTitle={path.title} liked={liked.length} passed={passed.length} onContinue={goToNextPath} />}
    </div>
  );
}
