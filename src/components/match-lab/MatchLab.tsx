"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, ChevronUp, ChevronsUp, GraduationCap, Laptop, Pencil, RotateCcw, Sparkles, ThumbsUp, Wrench, X } from "lucide-react";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { HomeButton } from "@/components/flow/HomeButton";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { ThemeToggle } from "@/components/flow/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { LocalBurst } from "@/components/build/DreamyGuide";
import { picksParam, writePicks } from "@/lib/picks";
import { bricolage } from "@/components/build/fonts";
import { playMilestoneChime } from "@/components/build/sound";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { DECK, MAX_SLOTS, type Career } from "./data";

// v3 PROTOTYPE — the match flow, rebuilt from the user's wireframe
// (MATCH FLOW.html) + Figma template 3241-9530, in the design system's own
// language: Career Poster Card imagery/faces/world tokens on the deck cards,
// glass surfaces, the DS CTA Button, Lucide icons (thumbs-up + X, no heart),
// aurora background. Edge cases covered:
//   - 3 liked -> decision sheet once: lock in, or keep swiping
//   - like with full slots -> swap sheet (choose who leaves) or cancel
//   - deck exhausted with 0/1/2/3 liked -> tailored end panel
//   - rank/reorder/remove via the manage sheet (tap slots or the pencil)
//   - undo reverses pass, like, and swap alike
//   - restarting after the end excludes already-liked careers from the deck

const SWIPE_COMMIT_PX = 100;

type HistoryEntry =
  | { type: "pass"; career: Career; prevDeckIndex: number }
  | { type: "like"; career: Career; prevDeckIndex: number }
  | { type: "swap"; career: Career; replaced: Career; slot: number; prevDeckIndex: number };

/* theme-following success green: the -dark-surface variant is #33c78c in BOTH
   themes and measured 1.8:1 on the light card — the base token carries the
   proper light rung (#007a55) */
const SUCCESS = "var(--color-feedback-success)";
const PASS_COLOR = "var(--color-world-arts-media-sport)";
const UNDO_COLOR = "var(--color-world-business-money-office)";

export function MatchLab() {
  const router = useRouter();

  const [roundDeck, setRoundDeck] = useState<Career[]>(DECK);
  const [deckIndex, setDeckIndex] = useState(0);
  const [liked, setLiked] = useState<Career[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [dragX, setDragX] = useState(0);
  const startY = useRef(0);
  const pointerAxis = useRef<"h" | "v" | null>(null);
  const grabScroller = useRef<HTMLElement | null>(null);
  const grabScrollTop = useRef(0);
  const [exiting, setExiting] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [swapFor, setSwapFor] = useState<Career | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [ghost, setGhost] = useState<{ career: Career; from: DOMRect; to: DOMRect } | null>(null);
  const [slotPops, setSlotPops] = useState<number[]>([0, 0, 0]);

  const decisionShown = useRef(false);
  const pointerActive = useRef(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragLive = useRef<{ like: () => void; pass: () => void; exiting: boolean }>({ like: () => {}, pass: () => {}, exiting: false });
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const top = exiting ? roundDeck[deckIndex] : roundDeck[deckIndex];
  const remaining = Math.max(0, roundDeck.length - deckIndex);
  const deckDone = deckIndex >= roundDeck.length;

  function advance() {
    setExiting(null);
    setDragX(0);
    setDeckIndex((i) => i + 1);
  }

  function flyToSlot(career: Career, slot: number) {
    const from = cardRef.current?.getBoundingClientRect();
    const to = slotRefs.current[slot]?.getBoundingClientRect();
    if (!from || !to) return;
    setGhost({ career, from, to });
    setTimeout(() => {
      setGhost(null);
      setSlotPops((p) => p.map((n, i) => (i === slot ? n + 1 : n)));
    }, 640);
  }

  function pass() {
    if (!top || exiting) return;
    setHistory((h) => [...h, { type: "pass", career: top, prevDeckIndex: deckIndex }]);
    setExiting({ id: top.id, dir: -1 });
    setTimeout(advance, 380);
  }

  function like(e?: React.MouseEvent) {
    if (!top || exiting) return;
    if (liked.length >= MAX_SLOTS) {
      // Slots full: the card stays put and the swap sheet asks who leaves.
      setSwapFor(top);
      return;
    }
    if (e) dispatchAuroraPulse("cta", e);
    const slot = liked.length;
    setHistory((h) => [...h, { type: "like", career: top, prevDeckIndex: deckIndex }]);
    setLiked((l) => [...l, top]);
    flyToSlot(top, slot);
    setExiting({ id: top.id, dir: 1 });
    setTimeout(advance, 380);
    if (slot + 1 === MAX_SLOTS && !decisionShown.current) {
      decisionShown.current = true;
      setTimeout(() => {
        playMilestoneChime();
        setDecisionOpen(true);
      }, 820);
    }
  }

  function commitSwap(slot: number) {
    if (!swapFor || !top) return;
    const replaced = liked[slot];
    setHistory((h) => [...h, { type: "swap", career: swapFor, replaced, slot, prevDeckIndex: deckIndex }]);
    setLiked((l) => l.map((c, i) => (i === slot ? swapFor : c)));
    flyToSlot(swapFor, slot);
    setSwapFor(null);
    setExiting({ id: swapFor.id, dir: 1 });
    setTimeout(advance, 380);
  }

  function undo() {
    if (exiting) return;
    const entry = history[history.length - 1];
    if (!entry) return;
    setHistory((h) => h.slice(0, -1));
    if (entry.type === "like") setLiked((l) => l.filter((c) => c.id !== entry.career.id));
    if (entry.type === "swap") setLiked((l) => l.map((c, i) => (i === entry.slot ? entry.replaced : c)));
    setDeckIndex(entry.prevDeckIndex);
    setDragX(0);
  }

  function restartDeck() {
    // Already-liked careers don't come back around; the fresh round is only
    // what's still undecided.
    setRoundDeck(DECK.filter((c) => !liked.some((l) => l.id === c.id)));
    setDeckIndex(0);
    setHistory([]);
    setDragX(0);
    setExiting(null);
  }

  function toReport() {
    // Their ranking travels with them: the chooser and the profile read this
    // order as the Top 3, and storage keeps it after a refresh. Deck ids ARE
    // catalogue ids, so each one resolves to a real report on the far side.
    const ids = liked.map((career) => career.id);
    writePicks({ ids, focus: null });
    router.push(`/career-report?picks=${picksParam(ids)}`);
  }

  function reorder(slot: number, dir: -1 | 1) {
    setLiked((l) => {
      const next = [...l];
      const j = slot + dir;
      if (j < 0 || j >= next.length) return l;
      [next[slot], next[j]] = [next[j], next[slot]];
      return next;
    });
  }

  function removeLiked(slot: number) {
    setLiked((l) => l.filter((_, i) => i !== slot));
    // Their spot opens again — the once-only decision sheet stays consumed,
    // but they can re-fill and lock in from the slots or the end panel.
  }

  // ---- gestures, Tinder/Bumble-style coexistence ----
  // The card CONTENT scrolls natively (touch-action: pan-y). Touch swipes are
  // handled by NATIVE listeners (React's synthetic touch handlers are passive
  // and cannot preventDefault): the first ~12px decides the axis. Vertical ->
  // we release the gesture entirely and the browser scrolls. Horizontal -> we
  // claim it and preventDefault every subsequent move, so the browser CANNOT
  // also scroll — the exact ambiguity ("tries to scroll and swipe, neither
  // happens") reported on device. Mouse drags use pointer events (no scroll
  // conflict exists for mouse; the wheel scrolls the card).
  function commitDrag(dx: number) {
    if (dx > SWIPE_COMMIT_PX) like();
    else if (dx < -SWIPE_COMMIT_PX) pass();
    else setDragX(0);
    if (Math.abs(dx) <= SWIPE_COMMIT_PX) setDragX(0);
  }
  // Desktop mouse drags axis-lock exactly like touch (per direct feedback:
  // users who don't know they can wheel-scroll click-drag upward expecting
  // scroll): the first ~12px decides — horizontal claims the swipe, vertical
  // becomes grab-to-scroll on the card's internal scroller.
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return; // native touch listeners own touch
    if (!top || exiting) return;
    pointerActive.current = true;
    pointerAxis.current = null;
    startX.current = e.clientX;
    startY.current = e.clientY;
    const scroller = e.currentTarget.querySelector<HTMLElement>("[data-card-scroller]");
    grabScroller.current = scroller;
    grabScrollTop.current = scroller ? scroller.scrollTop : 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || !pointerActive.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!pointerAxis.current) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) pointerAxis.current = "h";
      else if (Math.abs(dy) > 12) pointerAxis.current = "v";
      else return;
    }
    if (pointerAxis.current === "h") {
      setDragX(dx);
    } else if (grabScroller.current) {
      // drag up -> content scrolls down, like grabbing the page
      grabScroller.current.scrollTop = grabScrollTop.current - dy;
    }
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || !pointerActive.current) return;
    pointerActive.current = false;
    if (pointerAxis.current === "h") commitDrag(dragX);
    pointerAxis.current = null;
    grabScroller.current = null;
  }

  const topId = top?.id;
  const dragXRef = useRef(0);
  // keep the native listeners' handle fresh without re-binding them
  useEffect(() => {
    dragLive.current = { like, pass, exiting: !!exiting };
  });
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !topId) return;
    let sx = 0;
    let sy = 0;
    let claimed: "h" | "v" | null = null;
    function onStart(e: TouchEvent) {
      if (dragLive.current.exiting) return;
      claimed = null;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }
    function onMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - sx;
      const dy = e.touches[0].clientY - sy;
      if (!claimed) {
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) claimed = "h";
        else if (Math.abs(dy) > 12) claimed = "v"; // browser scrolls; we stand down
        else return;
      }
      if (claimed === "h") {
        if (e.cancelable) e.preventDefault();
        dragXRef.current = dx;
        setDragX(dx);
      }
    }
    function onEnd() {
      if (claimed === "h") {
        const dx = dragXRef.current;
        dragXRef.current = 0;
        if (dx > SWIPE_COMMIT_PX) dragLive.current.like();
        else if (dx < -SWIPE_COMMIT_PX) dragLive.current.pass();
        else setDragX(0);
        if (Math.abs(dx) <= SWIPE_COMMIT_PX) setDragX(0);
      }
      claimed = null;
    }
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [topId]);

  return (
    <ThemeProvider>
      {/* The world poster faces (Viaoda, Science Gothic, Lora, Fraunces,
         Nunito, Heebo) — React hoists this into <head>. */}
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
      <div className="fixed inset-0" style={{ background: "var(--color-night-background)" }} />
      <AuroraBackground accent={top?.color?.startsWith("var") ? "#2f6bf2" : "#2f6bf2"} visitedAccents={[]} finale={liked.length >= MAX_SLOTS} lightning={false} />
      <HomeButton />
      <ThemeToggle />

      <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden px-4 pt-16 pb-3 select-none sm:pt-5 sm:pb-5" style={{ WebkitTapHighlightColor: "transparent" }}>
        <div className="flex min-h-0 w-full max-w-[440px] flex-1 flex-col">
          {/* ---- header: title + live counter ---- */}
          <div className="mb-2 flex flex-none items-center justify-between gap-3 px-1">
            <h1 className={`${bricolage.className} text-[17px] font-extrabold whitespace-nowrap uppercase text-[var(--color-night-foreground)] sm:text-[19px]`}>Find your Top 3</h1>
            <span
              className="flex flex-none items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-[var(--color-night-muted-foreground)] backdrop-blur"
              style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: SUCCESS, boxShadow: `0 0 8px ${"#33c78c"}` }} />
              {remaining} remaining
            </span>
          </div>

          {/* ---- the three slots ---- */}
          <div className="mb-3 flex flex-none items-center gap-2">
            {Array.from({ length: MAX_SLOTS }, (_, i) => {
              const c = liked[i];
              return (
                <div
                  key={i}
                  ref={(el) => {
                    slotRefs.current[i] = el;
                  }}
                  role={c ? "button" : undefined}
                  tabIndex={c ? 0 : undefined}
                  onClick={() => liked.length > 0 && setManageOpen(true)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && liked.length > 0) setManageOpen(true);
                  }}
                  className={`relative flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 overflow-visible rounded-full border px-2.5 text-[11.5px] font-semibold transition-all duration-300 ${c ? "cursor-pointer" : ""}`}
                  style={
                    c
                      ? {
                          background: `color-mix(in srgb, ${c.color} 16%, var(--color-glass-surface-raised))`,
                          borderColor: c.color,
                          color: "var(--color-night-foreground)",
                          boxShadow: `0 0 14px color-mix(in srgb, ${c.color} 35%, transparent)`,
                        }
                      : {
                          background: "var(--color-glass-surface-raised)",
                          border: "1.5px dashed var(--color-glass-stroke)",
                          color: "var(--color-night-muted-foreground)",
                        }
                  }
                >
                  {c ? (
                    <span key={slotPops[i]} className="flex min-w-0 items-center gap-1.5 motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]">
                      <span aria-hidden className="h-2 w-2 flex-none rounded-full" style={{ background: c.color }} />
                      <span className="truncate">{c.title}</span>
                    </span>
                  ) : (
                    <span>{i + 1}. Empty</span>
                  )}
                  {slotPops[i] > 0 && <LocalBurst nonce={slotPops[i]} />}
                </div>
              );
            })}
            <button
              type="button"
              aria-label="Rank and edit your picks"
              onClick={() => setManageOpen(true)}
              disabled={liked.length === 0}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full border transition-colors disabled:opacity-35"
              style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)", color: "var(--color-night-muted-foreground)" }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* ---- deck ---- */}
          <div className="relative min-h-0 w-full flex-1">
            {deckDone ? (
              <EndPanel likedCount={liked.length} liked={liked} onRestart={restartDeck} onReport={toReport} onManage={() => setManageOpen(true)} onExplore={() => router.push("/#explore")} />
            ) : (
              roundDeck.slice(deckIndex, deckIndex + 3).map((career, depth) => {
                const isTop = depth === 0;
                const isExiting = isTop && exiting?.id === career.id;
                const isDragging = isTop && dragX !== 0 && !isExiting;
                const transform = isExiting
                  ? `translate(${exiting!.dir * 130}%, ${exiting!.dir === 1 ? -6 : 8}%) rotate(${exiting!.dir * 22}deg)`
                  : isDragging
                    ? `translateX(${dragX}px) rotate(${dragX / 18}deg)`
                    : `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`;
                return (
                  <div
                    key={career.id}
                    ref={isTop ? cardRef : undefined}
                    // bottom-7 reserves the stack-peek band inside the deck
                    // area, so peeked cards never overlap the action buttons.
                    className={`absolute inset-x-0 top-0 bottom-7 overflow-hidden rounded-3xl border ${isTop ? "cursor-grab select-none active:cursor-grabbing" : "pointer-events-none"}`}
                    style={{
                      background: "var(--color-night-card)",
                      borderColor: "var(--color-glass-border)",
                      boxShadow: "0 24px 60px -28px rgba(0,0,0,0.7)",
                      zIndex: 5 - depth,
                      transformOrigin: "bottom center",
                      transform,
                      opacity: isExiting ? 0 : 1 - depth * 0.26,
                      transition: isDragging ? "none" : "transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.38s",
                    }}
                    onPointerDown={isTop ? onPointerDown : undefined}
                    onPointerMove={isTop ? onPointerMove : undefined}
                    onPointerUp={isTop ? onPointerUp : undefined}
                    onPointerCancel={isTop ? onPointerUp : undefined}
                    aria-hidden={!isTop}
                  >
                    <CardBody career={career} isTop={isTop} dragX={isTop ? dragX : 0} />
                  </div>
                );
              })
            )}
          </div>

          {/* ---- actions ---- */}
          {!deckDone && (
            <div className="mt-3 flex flex-none items-center justify-center gap-7">
              <ActionButton label="Pass" color={PASS_COLOR} size={56} onClick={() => pass()}>
                <X className="h-6 w-6" />
              </ActionButton>
              <ActionButton label="Undo last swipe" color={UNDO_COLOR} size={44} onClick={() => undo()} disabled={history.length === 0}>
                <RotateCcw className="h-4.5 w-4.5" />
              </ActionButton>
              <ActionButton label="Like" color={SUCCESS} size={56} onClick={(e) => like(e)}>
                <ThumbsUp className="h-6 w-6" />
              </ActionButton>
            </div>
          )}
        </div>
      </section>

      {/* ---- fly-to-slot ghost ---- */}
      {ghost && <FlyGhost {...ghost} />}

      {/* ---- first-visit gesture guide ---- */}
      {guideOpen && (
        <Sheet onClose={() => setGuideOpen(false)}>
          <div className="flex flex-col items-center gap-5 text-center">
            <h2 className={`${bricolage.className} text-[22px] font-extrabold text-[var(--color-night-foreground)]`}>How this works</h2>
            {/* TEMP build marker for device debugging — tells us the phone is
               running the current code, not a stale pre-restart tab. */}
            <span className="rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide text-[var(--color-night-muted-foreground)] uppercase" style={{ borderColor: "var(--color-glass-border)" }}>
              lab build 3
            </span>
            <div className="flex w-full flex-col gap-3">
              <GuideRow icon={<ChevronsUp className="h-5 w-5 motion-safe:animate-bounce" />} color="var(--color-brand-400)">
                <b>Swipe up on a card</b> to flip through daily work, skills, work style, pathway & tradeoffs.
              </GuideRow>
              <GuideRow icon={<ThumbsUp className="h-5 w-5" />} color={SUCCESS}>
                <b>Swipe right</b> or tap the thumbs-up to save a career to your Top 3.
              </GuideRow>
              <GuideRow icon={<X className="h-5 w-5" />} color={PASS_COLOR}>
                <b>Swipe left</b> or tap the X to pass. You can always undo.
              </GuideRow>
            </div>
            <Button variant="primary" size="large" onClick={() => setGuideOpen(false)} type="button">
              Start Swiping
            </Button>
          </div>
        </Sheet>
      )}

      {/* ---- decision sheet at 3 matches ---- */}
      {decisionOpen && (
        <Sheet onClose={() => setDecisionOpen(false)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className={`${bricolage.className} text-[22px] font-extrabold text-[var(--color-night-foreground)]`}>Top 3 Matches Found!</h2>
            <p className="text-[13.5px] font-medium text-[var(--color-night-muted-foreground)]">
              Lock these in and view your personalized Career Report, or keep swiping — new likes will ask to swap in.
            </p>
            <MiniRanking liked={liked} />
            <div className="flex w-full flex-col gap-2.5">
              <Button variant="primary" size="large" onClick={() => toReport()} type="button">
                Save These 3 & View Career Report
              </Button>
              <Button variant="secondary" onClick={() => setDecisionOpen(false)} type="button">
                Keep Swiping
              </Button>
            </div>
          </div>
        </Sheet>
      )}

      {/* ---- swap sheet: like while full ---- */}
      {swapFor && (
        <Sheet onClose={() => setSwapFor(null)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className={`${bricolage.className} text-[20px] font-extrabold text-[var(--color-night-foreground)]`}>Your Top 3 is full</h2>
            <p className="text-[13.5px] font-medium text-[var(--color-night-muted-foreground)]">
              Swap one out for <b style={{ color: swapFor.color }}>{swapFor.title}</b>?
            </p>
            <div className="flex w-full flex-col gap-2">
              {liked.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => commitSwap(i)}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all hover:-translate-y-px"
                  style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="h-2 w-2 flex-none rounded-full" style={{ background: c.color }} />
                    <span className="truncate text-[13.5px] font-semibold text-[var(--color-night-foreground)]">
                      #{i + 1} {c.title}
                    </span>
                  </span>
                  <span className="flex-none text-[11px] font-bold tracking-wide text-[var(--color-night-muted-foreground)] uppercase">Replace</span>
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setSwapFor(null)} type="button">
              Keep my current 3
            </Button>
          </div>
        </Sheet>
      )}

      {/* ---- manage / rank sheet ---- */}
      {manageOpen && (
        <Sheet onClose={() => setManageOpen(false)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className={`${bricolage.className} text-[20px] font-extrabold text-[var(--color-night-foreground)]`}>Rank your picks</h2>
            <p className="text-[12.5px] font-medium text-[var(--color-night-muted-foreground)]">#1 is your top choice — it leads your Career Report.</p>
            <div className="flex w-full flex-col gap-2">
              {liked.length === 0 && <p className="py-4 text-[13px] text-[var(--color-night-muted-foreground)]">Nothing saved yet — swipe right on a career you like.</p>}
              {liked.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
                  style={{ background: `color-mix(in srgb, ${c.color} 10%, var(--color-glass-surface-raised))`, borderColor: "var(--color-glass-border-raised)" }}
                >
                  <span className={`${bricolage.className} w-7 flex-none text-[16px] font-extrabold`} style={{ color: c.color }}>
                    #{i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left text-[13.5px] font-semibold text-[var(--color-night-foreground)]">{c.title}</span>
                  <IconGhostButton label={`Move ${c.title} up`} disabled={i === 0} onClick={() => reorder(i, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </IconGhostButton>
                  <IconGhostButton label={`Move ${c.title} down`} disabled={i === liked.length - 1} onClick={() => reorder(i, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </IconGhostButton>
                  <IconGhostButton label={`Remove ${c.title}`} onClick={() => removeLiked(i)}>
                    <X className="h-4 w-4" />
                  </IconGhostButton>
                </div>
              ))}
            </div>
            <div className="flex w-full flex-col gap-2.5">
              {liked.length > 0 && (
                <Button variant="primary" onClick={() => toReport()} type="button">
                  {liked.length === MAX_SLOTS ? "Lock In & View Career Report" : `Continue with ${liked.length}`}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setManageOpen(false)} type="button">
                Done
              </Button>
            </div>
          </div>
        </Sheet>
      )}
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------- pieces ----

function CardBody({ career, isTop, dragX }: { career: Career; isTop: boolean; dragX: number }) {
  return (
    <div className="relative h-full w-full">
      {/* stamps live at card level, above the scroll */}
      {isTop && (
        <>
          <Stamp side="right" color={SUCCESS} opacity={dragX > 30 ? Math.min(1, (dragX - 30) / 70) : 0}>
            Match
          </Stamp>
          <Stamp side="left" color={PASS_COLOR} opacity={dragX < -30 ? Math.min(1, (-dragX - 30) / 70) : 0}>
            Pass
          </Stamp>
        </>
      )}

      {/* the dating-app profile scroll: full-height poster first, sections below */}
      <div data-card-scroller className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none]" style={{ touchAction: "pan-y", background: "var(--color-night-card)" }}>
        {/* ---- HERO: the Browse Card face, exactly — poster art, DS text
           scrim, title in the world's own face, world label beneath.
           Employers + salary sit as matched quiet chips in the top corners. ---- */}
        <div className="relative flex w-full flex-col justify-end" style={{ height: "100%", minHeight: "min(420px, 100%)" }}>
          <Image src={career.photo} alt="" fill sizes="(max-width: 640px) 94vw, 440px" className="object-cover" draggable={false} priority={isTop} />
          <div className="absolute inset-x-0 top-0 z-[1] flex items-start justify-between gap-2 p-4">
            <span
              className="max-w-[60%] truncate rounded-full border px-2.5 py-1 text-[10.5px] font-semibold text-[var(--color-night-foreground)] backdrop-blur-md"
              style={{ background: "color-mix(in srgb, var(--color-night-background) 80%, transparent)", borderColor: "var(--color-glass-border)" }}
            >
              {career.employers}
            </span>
            <span
              className="flex-none rounded-full border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md"
              style={{ color: SUCCESS, borderColor: "var(--color-glass-border)", background: "color-mix(in srgb, var(--color-night-background) 80%, transparent)" }}
            >
              {career.salary}
            </span>
          </div>
          <div
            className="relative z-[1] flex flex-col items-center gap-1.5 px-2 pt-16 pb-4 text-center uppercase"
            style={{
              // gradient/text-scrim — the Browse Card stops, built from the
              // background token so light mode fades to white, not night.
              background:
                "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-night-background) 50%, transparent) 30%, color-mix(in srgb, var(--color-night-background) 75%, transparent) 51%, var(--color-night-background) 100%)",
            }}
          >
            <p style={{ fontFamily: career.font, fontWeight: career.fontWeight, fontSize: 28, lineHeight: 1.15, letterSpacing: career.letterSpacing ?? "0.03em", color: "var(--color-night-foreground)" }}>
              {career.title}
            </p>
            <p className="text-[10.5px] font-semibold tracking-[0.06em]" style={{ color: career.color }}>
              {career.world}
            </p>
            <span
              className="mt-1 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold normal-case backdrop-blur-md motion-safe:animate-bounce"
              style={{ background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)", borderColor: "var(--color-glass-border)", color: "var(--color-night-foreground)" }}
            >
              <ChevronsUp className="h-3.5 w-3.5" style={{ color: career.color }} />
              Scroll for the breakdown
            </span>
          </div>
        </div>

        {/* ---- Career Breakdown: one continuous panel, information-first.
           Hierarchy: caption labels whisper (Montserrat micro-caps, muted,
           world-tinted icon), content speaks (left-aligned, 14px/1.6). The
           hook leads at a heavier weight; the tradeoff closes as an
           editorial aside (accent bar + italic). Hairline dividers give
           rhythm without box-in-box clutter. ---- */}
        <div className="flex flex-col px-5 pt-5 pb-8" style={{ background: "var(--color-night-card)" }}>
          <p className={`${bricolage.className} mb-4 text-[11px] font-bold tracking-[0.12em] text-[var(--color-night-muted-foreground)] uppercase`}>Career Breakdown</p>

          <BreakdownSection icon={<BookOpen className="h-4 w-4" />} color={career.color} label="Daily Work">
            <p className="text-[15px] leading-[1.55] font-semibold text-[var(--color-night-foreground)]">{career.hook}</p>
          </BreakdownSection>

          <BreakdownDivider />

          <BreakdownSection icon={<Wrench className="h-4 w-4" />} color={career.color} label="Skills & Subjects">
            <p className="text-[14px] leading-[1.6] font-medium text-[var(--color-night-foreground)]">{career.skills}</p>
            <p className="mt-2.5 text-[9.5px] font-bold tracking-[0.1em] text-[var(--color-night-muted-foreground)] uppercase">Classes that help</p>
            <p className="mt-1 text-[12.5px] leading-[1.55] font-medium text-[var(--color-night-muted-foreground)]">{career.classes}</p>
          </BreakdownSection>

          <BreakdownDivider />

          <BreakdownSection icon={<Laptop className="h-4 w-4" />} color={career.color} label="Work Style">
            <p className="text-[14px] leading-[1.6] font-medium text-[var(--color-night-foreground)]">{career.workStyle}</p>
          </BreakdownSection>

          <BreakdownDivider />

          <BreakdownSection icon={<GraduationCap className="h-4 w-4" />} color={career.color} label="Pathway Fit">
            <p className="text-[14px] leading-[1.6] font-medium text-[var(--color-night-foreground)]">{career.pathway}</p>
          </BreakdownSection>

          <BreakdownDivider />

          <BreakdownSection icon={<Sparkles className="h-4 w-4" />} color={career.color} label="Future Tradeoff">
            <p
              className="text-[13.5px] leading-[1.6] font-medium text-[var(--color-night-foreground)] italic"
              style={{ borderLeft: `3px solid color-mix(in srgb, ${career.color} 65%, transparent)`, paddingLeft: 12 }}
            >
              {career.tradeoff}
            </p>
          </BreakdownSection>
        </div>
      </div>
    </div>
  );
}

function BreakdownSection({ icon, color, label, children }: { icon: React.ReactNode; color: string; label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex-none" style={{ color }}>
          {icon}
        </span>
        <h3 className="text-[10.5px] font-bold tracking-[0.12em] text-[var(--color-night-muted-foreground)] uppercase">{label}</h3>
      </div>
      <div className="mt-2 text-left">{children}</div>
    </section>
  );
}

function BreakdownDivider() {
  return <hr aria-hidden className="my-4 border-0" style={{ height: 1, background: "var(--color-glass-border)" }} />;
}

function Stamp({ side, color, opacity, children }: { side: "left" | "right"; color: string; opacity: number; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className={`${bricolage.className} pointer-events-none absolute top-6 z-20 rounded-lg border-4 px-4 py-1 text-[22px] font-extrabold tracking-[0.1em] uppercase`}
      style={{
        [side]: 24,
        color,
        borderColor: color,
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        transform: `rotate(${side === "right" ? 12 : -12}deg)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({ label, color, size, onClick, disabled, children }: { label: string; color: string; size: number; onClick: (e: React.MouseEvent) => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-full border backdrop-blur transition-all duration-200 hover:scale-110 disabled:opacity-35 disabled:hover:scale-100"
      style={{
        width: size,
        height: size,
        color,
        background: "var(--color-glass-surface-raised)",
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      {children}
    </button>
  );
}

function IconGhostButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-colors disabled:opacity-30"
      style={{ background: "var(--color-glass-surface-2)", borderColor: "var(--color-glass-border)", color: "var(--color-night-foreground)" }}
    >
      {children}
    </button>
  );
}

function GuideRow({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left" style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border" style={{ color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
        {icon}
      </span>
      <p className="text-[13px] leading-snug font-medium text-[var(--color-night-foreground)]">{children}</p>
    </div>
  );
}

function MiniRanking({ liked }: { liked: Career[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {liked.map((c, i) => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5" style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}>
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold" style={{ color: c.color }}>
            #{i + 1} <span className="truncate text-[var(--color-night-foreground)]">{c.title}</span>
          </span>
          <span className="flex-none text-[12px] font-bold" style={{ color: SUCCESS }}>
            {c.salary}
          </span>
        </div>
      ))}
    </div>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 backdrop-blur-xl select-none"
      style={{ background: "color-mix(in srgb, var(--color-night-background) 78%, transparent)", WebkitTapHighlightColor: "transparent" }}
      onPointerUp={(e) => {
        // Backdrop-only dismiss, via pointerup with a self-target check —
        // click on a bare div is unreliable on iOS, and a tap that begins
        // on the card must never dismiss.
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[440px] rounded-3xl border p-6 backdrop-blur-xl motion-safe:animate-[dreamy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}
      >
        {children}
      </div>
    </div>
  );
}

function FlyGhost({ career, from, to }: { career: Career; from: DOMRect; to: DOMRect }) {
  // Two-frame FLIP: mounts at the card's rect, then transitions to the slot's.
  const [go, setGo] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  const r = go ? to : from;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[90] overflow-hidden rounded-2xl border"
      style={{
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        borderColor: career.color,
        boxShadow: `0 0 24px color-mix(in srgb, ${career.color} 45%, transparent)`,
        opacity: go ? 0.25 : 0.95,
        transition: "all 0.62s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <Image src={career.photo} alt="" fill sizes="440px" className="object-cover" />
    </div>
  );
}

function EndPanel({ likedCount, liked, onRestart, onReport, onManage, onExplore }: { likedCount: number; liked: Career[]; onRestart: () => void; onReport: () => void; onManage: () => void; onExplore: () => void }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl border p-6 text-center backdrop-blur-xl"
      style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-border)" }}
    >
      <h2 className={`${bricolage.className} text-[22px] font-extrabold text-[var(--color-night-foreground)]`}>
        {likedCount === MAX_SLOTS ? "Your Top 3 is set!" : likedCount > 0 ? `You've seen the stack — ${likedCount} saved` : "Nothing clicked — and that's okay"}
      </h2>
      <p className="text-[13.5px] leading-relaxed font-medium text-[var(--color-night-muted-foreground)]">
        {likedCount === MAX_SLOTS
          ? "Lock them in to build your personalized Career Report."
          : likedCount > 0
            ? `You can continue with ${likedCount}, or run the remaining careers again to fill your Top 3.`
            : "Knowing what's NOT for you is real progress. Wander through Explore — hundreds of paths, no pressure — and come back when one sparks."}
      </p>
      {likedCount > 0 && <MiniRanking liked={liked} />}
      <div className="flex w-full max-w-[320px] flex-col gap-2.5">
        {likedCount > 0 ? (
          <Button variant="primary" size="large" onClick={onReport} type="button">
            {likedCount === MAX_SLOTS ? "View Career Report" : `Continue with ${likedCount}`}
          </Button>
        ) : (
          <Button variant="primary" size="large" onClick={onExplore} type="button">
            Explore careers instead
          </Button>
        )}
        {likedCount > 0 && likedCount < MAX_SLOTS && (
          <Button variant="secondary" onClick={onManage} type="button">
            Review my picks
          </Button>
        )}
        <Button variant="secondary" onClick={onRestart} type="button">
          <span className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Run the stack again
          </span>
        </Button>
      </div>
    </div>
  );
}
