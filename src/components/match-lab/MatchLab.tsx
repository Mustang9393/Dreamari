"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronUp, GraduationCap, Laptop, Pencil, RotateCcw, Sparkles, ThumbsUp, Wrench, X } from "lucide-react";
import { BackButton } from "@/components/app/chrome";
import { FlowChrome } from "@/components/app/FlowChrome";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { primeAudioOnFirstGesture } from "@/components/flow/aurora/feedback";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { GESTURE_HINT_CYCLE_S } from "@/components/flow/GestureHint";
import { GestureSpotlight } from "@/components/flow/GestureSpotlight";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { LocalBurst } from "@/components/build/DreamyGuide";
import { InkText } from "@/components/build/ui";
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

// TEMP for the demo, per direct request: show the gesture guide every
// reload, not gated by "seen once ever". Flip back to false (the mount
// effect below falls back to checking guideSeenKey) once this settles and
// the hint should go back to first-visit-only.
const DEMO_ALWAYS_SHOW_GUIDE = true;

const GUIDE_ORDER = ["up", "right", "left"] as const;
type GestureKind = (typeof GUIDE_ORDER)[number];
const GUIDE_LABEL: Record<GestureKind, string> = {
  up: "Scroll up for details",
  right: "Swipe right to save",
  left: "Swipe left to pass",
};

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
  // On-card gesture teaching, spotlighting the real card instead of a modal
  // listing all three gestures at once. Per direct feedback, deliberately
  // minimal: it shows on the FIRST card only, teaches scroll-up first (the
  // least discoverable of the three -- Like/Pass already have explicit
  // buttons and drag stamps), and disappears for good the moment the
  // student performs any real gesture. It never plays per-card and never
  // comes back after a gesture is done. `demonstrated` is persisted so a
  // returning student who already did it isn't retaught (DEMO flag aside).
  // Unlock audio on the first real tap/keypress (iOS mutes Web Audio behind the
  // ringer switch until an <audio> element has played; see feedback.ts).
  useEffect(() => primeAudioOnFirstGesture(), []);
  const guideProgressKey = "dreamari:hint-progress:match-swipe";
  const [demonstrated, setDemonstrated] = useState<Set<GestureKind>>(() => {
    if (DEMO_ALWAYS_SHOW_GUIDE || typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(guideProgressKey);
      return raw ? new Set(JSON.parse(raw) as GestureKind[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const [guideGesture, setGuideGesture] = useState<GestureKind | null>(null);
  // Kept fresh via effect, not assigned during render -- refs can't be
  // written while rendering (matches dragLive's own pattern below).
  const markDemonstratedRef = useRef<(kind: GestureKind) => void>(() => {});
  useEffect(() => {
    markDemonstratedRef.current = (kind) => {
      setGuideGesture(null);
      setDemonstrated((current) => {
        if (current.has(kind)) return current;
        const next = new Set(current).add(kind);
        try {
          window.localStorage.setItem(guideProgressKey, JSON.stringify([...next]));
        } catch {
          // Nothing to persist to; progress just won't carry to next visit.
        }
        return next;
      });
    };
  });
  const [decisionOpen, setDecisionOpen] = useState(false);
  // Set the moment Match hands off to Profile (any of the "finish" buttons):
  // holds the destination URL while the welcome popup shows, rather than
  // navigating straight there.
  // Set the moment Match is finished: the Top 3 sheet stops being a choice
  // and becomes the stage for one continuous shot (direct feedback, 5 Sept
  // 2026: "cut the popups' friction, not their drama") — the cards gather
  // into a stack, Dreamy bursts in with the milestone chime, the heading
  // turns into the handoff line, and the page itself carries on to Profile.
  // No Continue to tap. Profile sets the scene on arrival (?welcome=1).
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const [handoffBurst, setHandoffBurst] = useState(0);
  useEffect(() => {
    if (!handoffUrl) return;
    const chime = setTimeout(() => playMilestoneChime(), 120);
    const kick = setTimeout(() => setHandoffBurst((n) => n + 1), 60);
    // Long enough to read one line and watch the stack settle; short enough
    // that nobody feels held at a door.
    const go = setTimeout(() => router.push(handoffUrl), 2100);
    return () => {
      clearTimeout(chime);
      clearTimeout(kick);
      clearTimeout(go);
    };
  }, [handoffUrl, router]);
  // Which liked career is "#1" on the consolidated results screen — starts
  // as whichever they liked first, but tapping any of the three reassigns it.
  const [chosenId, setChosenId] = useState<string | null>(null);
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
    markDemonstratedRef.current("left");
    // A pass had no feedback at all -- the soft select tick (not the CTA ding,
    // which is reserved for a like) marks it as a deliberate, registered choice.
    dispatchAuroraPulse("select");
    setHistory((h) => [...h, { type: "pass", career: top, prevDeckIndex: deckIndex }]);
    setExiting({ id: top.id, dir: -1 });
    setTimeout(advance, 380);
  }

  function like(e?: React.MouseEvent) {
    if (!top || exiting) return;
    markDemonstratedRef.current("right");
    if (liked.length >= MAX_SLOTS) {
      // Slots full: the card stays put and the swap sheet asks who leaves.
      setSwapFor(top);
      return;
    }
    // No `if (e)` guard: a SWIPE reaches here with no event (commitDrag), and
    // was getting neither the pulse nor the ding a button-like got. With no
    // origin the pulse launches from screen center, where the card is.
    dispatchAuroraPulse("cta", e);
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
        setChosenId(null);
        setDecisionOpen(true);
      }, 820);
    }
  }

  // The slot strip's existing pop (dreamy-pop + LocalBurst, keyed by slotPops)
  // was only fired by flyToSlot. Every other way a slot changes -- reorder,
  // remove, undo -- happened in total silence, so the same pop now marks them.
  function popSlots(...slots: number[]) {
    setSlotPops((p) => p.map((n, i) => (slots.includes(i) ? n + 1 : n)));
  }

  function commitSwap(slot: number) {
    if (!swapFor || !top) return;
    const replaced = liked[slot];
    // A swap IS a like (a new career enters the Top 3): same ding as a like.
    dispatchAuroraPulse("cta");
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
    // Undo reads as a deliberate step back: the soft tick, and the slot that
    // just changed pops so the eye is drawn to what came back.
    dispatchAuroraPulse("select");
    if (entry.type === "like") popSlots(liked.findIndex((c) => c.id === entry.career.id));
    if (entry.type === "swap") popSlots(entry.slot);
    setHistory((h) => h.slice(0, -1));
    if (entry.type === "like") setLiked((l) => l.filter((c) => c.id !== entry.career.id));
    if (entry.type === "swap") setLiked((l) => l.map((c, i) => (i === entry.slot ? entry.replaced : c)));
    setDeckIndex(entry.prevDeckIndex);
    setDragX(0);
  }

  function restartDeck() {
    // Already-liked careers don't come back around; the fresh round is only
    // what's still undecided.
    dispatchAuroraPulse("select");
    setRoundDeck(DECK.filter((c) => !liked.some((l) => l.id === c.id)));
    setDeckIndex(0);
    setHistory([]);
    setDragX(0);
    setExiting(null);
  }

  // Consolidated results screen (direct feedback, 5 Sept 2026): "Top 3
  // Matches Found!" and the separate "Choose where to start" page used to
  // be two screens doing the same job. One screen now does both — whichever
  // career is tapped as #1 is the one Profile opens focused on, and every
  // way of finishing Match (this screen, the always-on shortcut once 3 are
  // saved, the manage sheet, running out of cards) lands straight on
  // Profile's Top Three tab instead of the old separate chooser page.
  function finishMatching(explicitFocusId?: string) {
    const ids = liked.map((c) => c.id);
    if (ids.length === 0) return;
    const focusId2 = explicitFocusId ?? ids[0];
    const ordered = [focusId2, ...ids.filter((id) => id !== focusId2)];
    writePicks({ ids: ordered, focus: focusId2 });
    dispatchAuroraPulse("cta");
    // Every finish path plays the same shot on the same stage, so the sheet
    // opens here too if a shortcut button (not the sheet itself) finished it.
    setChosenId(focusId2);
    setDecisionOpen(true);
    setHandoffUrl(`/profile?picks=${picksParam(ordered)}&focus=${focusId2}&tab=top3&welcome=1`);
  }

  function saveTop3() {
    const focusCareer = liked.find((c) => c.id === chosenId) ?? liked[0];
    if (!focusCareer) return;
    finishMatching(focusCareer.id);
  }

  function reorder(slot: number, dir: -1 | 1) {
    const j = slot + dir;
    if (j < 0 || j >= liked.length) return;
    // Both slots that trade places pop, plus the tick -- the manage sheet sits
    // over the slot strip, so the pops are what make the swap visible behind it.
    dispatchAuroraPulse("select");
    popSlots(slot, j);
    setLiked((l) => {
      const next = [...l];
      [next[slot], next[j]] = [next[j], next[slot]];
      return next;
    });
  }

  function removeLiked(slot: number) {
    dispatchAuroraPulse("select");
    popSlots(slot);
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
  // How many gesture steps the guide has advanced through this run -- caps
  // the walk at two full loops (up/right/left, up/right/left) instead of
  // cycling forever, per direct feedback. Reset whenever a fresh run starts.
  const guideStepRef = useRef(0);
  // First card only (deckIndex 0), and only while nothing has been
  // demonstrated yet -- the moment any real gesture lands, this stops and
  // never restarts for the rest of the visit. Opens on scroll-up.
  useEffect(() => {
    if (!topId || deckIndex !== 0 || demonstrated.size > 0) return;
    guideStepRef.current = 0;
    const timer = window.setTimeout(() => setGuideGesture(GUIDE_ORDER[0]), 500);
    return () => window.clearTimeout(timer);
  }, [topId, deckIndex, demonstrated]);
  // While it's up, walk scroll-up -> swipe right -> swipe left, one
  // GestureHint cycle's dwell on each, for two full loops -- then stop on
  // its own. A real gesture ends it early at any point (markDemonstratedRef
  // above). Only the direction/label change on the ONE persistent overlay,
  // so the dark scrim never drops and re-raises between gestures -- that
  // mount/unmount flicker was the complaint with the earlier per-gesture
  // instances.
  useEffect(() => {
    if (guideGesture === null) return;
    const timer = window.setTimeout(() => {
      guideStepRef.current += 1;
      if (guideStepRef.current >= GUIDE_ORDER.length * 2) {
        setGuideGesture(null);
        return;
      }
      setGuideGesture((current) => {
        if (current === null) return null;
        const index = GUIDE_ORDER.indexOf(current);
        return GUIDE_ORDER[(index + 1) % GUIDE_ORDER.length];
      });
    }, GESTURE_HINT_CYCLE_S * 1000);
    return () => window.clearTimeout(timer);
  }, [guideGesture]);
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
        else if (Math.abs(dy) > 12) {
          claimed = "v"; // browser scrolls; we stand down
          markDemonstratedRef.current("up");
        } else return;
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
      {/* marketing-v2: the app's semantic tokens (--primary, --radius-md, the
         glass surfaces) that ui/Button and FlowChrome read. display:contents,
         so it adds no box to the h-dvh layout below. */}
      <div className="marketing-v2 themeable contents">
      {/* The world poster faces (Viaoda, Science Gothic, Lora, Fraunces,
         Nunito, Heebo) — React hoists this into <head>. */}
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
      <BackgroundSpace />
      <AuroraBackground accent={top?.color?.startsWith("var") ? "#2f6bf2" : "#2f6bf2"} visitedAccents={[]} finale={liked.length >= MAX_SLOTS} lightning={false} />
      <FlowChrome />

      <section className="relative z-10 flex h-dvh w-full flex-col items-center overflow-hidden px-4 pt-16 pb-3 select-none sm:pt-5 sm:pb-5" style={{ WebkitTapHighlightColor: "transparent" }}>
        <div className="flex min-h-0 w-full max-w-[440px] flex-1 flex-col">
          {/* ---- header: back to Build (a mistake in Build shouldn't mean
             restarting Match from scratch to fix it — direct feedback, 5
             Sept 2026) + title + live counter ---- */}
          <div className="mb-2 flex flex-none items-center justify-between gap-3 px-1">
            <span className="flex flex-none items-center gap-2">
              <BackButton fallback="/flow" />
              <h1 className={`${bricolage.className} text-[17px] font-extrabold whitespace-nowrap uppercase text-[var(--color-night-foreground)] sm:text-[19px]`}>Find your Top 3</h1>
            </span>
            <span
              className="flex flex-none items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-[var(--color-night-muted-foreground)] backdrop-blur"
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
                  className={`relative flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 overflow-visible rounded-[var(--radius-md)] border px-2.5 text-[11.5px] font-semibold transition-all duration-300 ${c ? "cursor-pointer" : ""}`}
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
              className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border disabled:opacity-35"
              style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)", color: "var(--color-night-muted-foreground)" }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Three saved and cards still left: the way forward is always on
             screen (direct feedback), not only in the once-only sheet. */}
          {!deckDone && liked.length === MAX_SLOTS && (
            <Button variant="primary" size="compact" onClick={() => finishMatching()} type="button" className="mb-3 w-full">
              Continue with your 3 <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          )}

          {/* ---- deck ---- */}
          <div className="relative min-h-0 w-full flex-1">
            {deckDone ? (
              <EndPanel likedCount={liked.length} liked={liked} onRestart={restartDeck} onReport={() => finishMatching()} onManage={() => setManageOpen(true)} onExplore={() => router.push("/#explore")} />
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
                // While the gesture guide is teaching, the real top card nudges in
                // the taught direction on the dot's own 2.6s cycle (guide-nudge-*,
                // globals.css) -- a preview of the gesture, not just an arrow next
                // to it. Off the moment the student touches the card.
                const nudging = isTop && guideGesture !== null && !isDragging && !isExiting;
                return (
                  <div
                    key={career.id}
                    ref={isTop ? cardRef : undefined}
                    // bottom-7 reserves the stack-peek band inside the deck
                    // area, so peeked cards never overlap the action buttons.
                    // Full literal class strings per direction (not a template): Tailwind
                    // only generates classes it can see whole in source. The plain
                    // guide-preview-* marker is for globals.css's stamp rule, not Tailwind.
                    className={`absolute inset-x-0 top-0 overflow-hidden rounded-[var(--radius-lg)] border ${isTop ? "cursor-grab select-none active:cursor-grabbing" : "pointer-events-none"} ${
                      !nudging
                        ? ""
                        : guideGesture === "right"
                          ? "guide-preview-right motion-safe:animate-[guide-nudge-right_2.6s_ease-in-out_infinite]"
                          : guideGesture === "left"
                            ? "guide-preview-left motion-safe:animate-[guide-nudge-left_2.6s_ease-in-out_infinite]"
                            : "motion-safe:animate-[guide-nudge-up_2.6s_ease-in-out_infinite]"
                    }`}
                    style={{
                      background: "var(--color-night-card)",
                      borderColor: "var(--color-glass-border)",
                      boxShadow: "0 24px 60px -28px rgba(0,0,0,0.7)",
                      zIndex: 5 - depth,
                      transformOrigin: "bottom center",
                      transform,
                      opacity: isExiting ? 0 : 1 - depth * 0.26,
                      transition: isDragging ? "none" : "transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.38s",
                      // The deck area is `flex-1`, so on a tall desktop viewport
                      // (a MacBook Pro screen, not a phone) this card stretched
                      // edge-to-edge to fill it -- a 440px-wide card that tall
                      // reads as broken, not just big. `min()` keeps the old
                      // "fill available height minus the 28px stack-peek band"
                      // behavior on phone-sized viewports (where that's under
                      // the cap anyway) while capping it to a real phone-card
                      // proportion everywhere else.
                      height: "min(calc(100% - 28px), 680px)",
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

      {/* ---- gesture guide: teaches whichever direction the student hasn't
         demonstrated yet, spotlighting the real card, instead of a modal
         listing all three gestures at once. ONE instance for the whole
         sequence -- swapping direction/label on it as guideGesture changes,
         rather than mounting/unmounting a different instance per gesture,
         is what keeps the dark scrim from flickering off and back on
         between steps. See GestureSpotlight for the dim-the-rest-of-the-
         screen treatment and GestureHint for the animated direction. ---- */}
      {guideGesture && (
        <GestureSpotlight active targetRef={cardRef} direction={guideGesture} label={GUIDE_LABEL[guideGesture]} remeasureKey={`${topId}:${guideGesture}`} />
      )}

      {/* ---- decision sheet at 3 matches: one consolidated screen for both
         "you're done, lock these in" and "which do you want to start with"
         (direct feedback, 5 Sept 2026 — these used to be two separate
         screens with overlapping copy). Tapping a card makes it #1; Save
         My Top 3 sends that ranking straight to Profile's Top Three tab. ---- */}
      {decisionOpen && (
        <Sheet onClose={() => { if (!handoffUrl) setDecisionOpen(false); }} maxWidth="720px">
          <div className="relative flex flex-col items-center gap-5 text-center">
            {/* the glow lives behind everything, clipped to the sheet's own
               corners so it never bleeds past the card like the deck's own
               world-glow doesn't; it warms toward the accent as the handoff plays */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 -z-[1] h-[220px] w-[80%] -translate-x-1/2 rounded-full blur-[70px] transition-[background,transform] duration-1000"
              style={{
                background: handoffUrl
                  ? "radial-gradient(circle, color-mix(in srgb, var(--color-accent-purple) 48%, transparent), transparent 70%)"
                  : "radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 38%, transparent), transparent 70%)",
                transform: handoffUrl ? "translateX(-50%) scale(1.25)" : "translateX(-50%)",
              }}
            />

            {/* Dreamy arrives only for the handoff, popping in where the
               eyebrow was, so the same spot on screen changes meaning */}
            {handoffUrl ? (
              <div className="relative h-24 w-24 motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)_both] sm:h-28 sm:w-28">
                <span className="absolute inset-0 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite]">
                  <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="112px" className="object-contain" />
                </span>
                <LocalBurst nonce={handoffBurst} />
              </div>
            ) : (
              <span
                className="motion-safe:animate-[fade-slide-up_0.5s_ease-out_both] inline-flex items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] py-[5px] text-[11px] font-extrabold tracking-[0.1em] uppercase"
                style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--color-glass-surface-raised)", color: "var(--color-brand-500)" }}
              >
                <Sparkles className="h-3 w-3" aria-hidden /> Match complete
              </span>
            )}

            <div className="flex flex-col gap-1.5">
              {handoffUrl ? (
                <h2 className={`${bricolage.className} text-[24px] font-extrabold text-[var(--color-night-foreground)] sm:text-[28px]`}>
                  <InkText text="Building your profile" delay={0.2} />
                </h2>
              ) : (
                <>
                  <h2 className={`${bricolage.className} motion-safe:animate-[fade-slide-up_0.5s_0.05s_ease-out_both] text-[24px] font-extrabold text-[var(--color-night-foreground)] sm:text-[28px]`}>
                    Your Top 3 Matches
                  </h2>
                  <p className="motion-safe:animate-[fade-slide-up_0.5s_0.1s_ease-out_both] text-[13.5px] font-medium text-[var(--color-night-muted-foreground)]">
                    Tap a card to lead with it.
                  </p>
                </>
              )}
            </div>

            {/* The three cards. During the handoff they gather into a fanned
               stack behind the #1 (the thing being carried to Profile), so
               "your three are going with you" is shown, not said. */}
            <div className="relative grid w-full grid-cols-1 gap-3 sm:grid-cols-3" style={{ perspective: 900 }}>
              {liked
                .map((c, i) => ({ c, i }))
                .sort((a, b) => (a.c.id === (chosenId ?? liked[0]?.id) ? -1 : b.c.id === (chosenId ?? liked[0]?.id) ? 1 : a.i - b.i))
                .map(({ c }, rank) => (
                  <div
                    key={c.id}
                    className="transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={
                      handoffUrl
                        ? {
                            // rank 0 stays; 1 and 2 slide in behind it, rotated the way a hand fans cards
                            transform: rank === 0 ? "translateX(0) scale(1.02)" : `translateX(${rank === 1 ? "-100%" : "-200%"}) translateX(${rank === 1 ? "14px" : "28px"}) rotate(${rank === 1 ? 5 : 10}deg) scale(${1 - rank * 0.06})`,
                            transitionDelay: `${rank * 90}ms`,
                            zIndex: 3 - rank,
                            opacity: rank === 0 ? 1 : 0.9 - rank * 0.15,
                            transformOrigin: "bottom center",
                          }
                        : undefined
                    }
                  >
                    <TopThreeCard career={c} rank={rank + 1} chosen={rank === 0} onChoose={() => { if (!handoffUrl) setChosenId(c.id); }} index={rank} />
                  </div>
                ))}
            </div>

            {/* Actions fade out the moment the handoff starts: there is
               nothing left to decide, and a button that still looks live
               would invite a tap that does nothing. */}
            <div
              className="flex w-full flex-col gap-2.5 transition-opacity duration-500"
              style={{ opacity: handoffUrl ? 0 : 1, pointerEvents: handoffUrl ? "none" : undefined }}
              aria-hidden={!!handoffUrl}
            >
              <Button variant="primary" size="large" onClick={saveTop3} type="button">
                Save My Top 3 <ArrowRight className="h-4 w-4" aria-hidden />
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
                  className="dm-tap flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left"
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
            <p className="text-[12.5px] font-medium text-[var(--color-night-muted-foreground)]">#1 is your top choice. It leads your Career Report.</p>
            <div className="flex w-full flex-col gap-2">
              {liked.length === 0 && <p className="py-4 text-[13px] text-[var(--color-night-muted-foreground)]">Nothing saved yet. Swipe right on a career you like.</p>}
              {liked.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5"
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
                <Button variant="primary" onClick={() => finishMatching()} type="button">
                  {liked.length === MAX_SLOTS ? "Lock in & continue" : `Continue with ${liked.length}`}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setManageOpen(false)} type="button">
                Done
              </Button>
            </div>
          </div>
        </Sheet>
      )}
      </div>
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
            <ThumbsUp className="h-[18px] w-[18px]" strokeWidth={3} aria-hidden /> Match
          </Stamp>
          <Stamp side="left" color={PASS_COLOR} opacity={dragX < -30 ? Math.min(1, (-dragX - 30) / 70) : 0}>
            <X className="h-[20px] w-[20px]" strokeWidth={3} aria-hidden /> Pass
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
              className="max-w-[60%] truncate rounded-[var(--radius-sm)] border px-2.5 py-1 text-[10.5px] font-semibold text-[var(--color-night-foreground)] backdrop-blur-md"
              style={{ background: "color-mix(in srgb, var(--color-night-background) 80%, transparent)", borderColor: "var(--color-glass-border)" }}
            >
              {career.employers}
            </span>
            <span
              className="flex-none rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md"
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
      // data-stamp lets the gesture guide's CSS (globals.css, guide-preview-*) fade
      // THIS stamp partway in while its swipe is being taught -- previewing what the
      // gesture does, not just where it goes.
      data-stamp={side}
      className={`${bricolage.className} pointer-events-none absolute top-6 z-20 flex items-center gap-1.5 rounded-[var(--radius-md)] border-4 px-4 py-1 text-[22px] font-extrabold tracking-[0.1em] uppercase`}
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
      className="dm-tap flex items-center justify-center rounded-full border backdrop-blur disabled:opacity-35 disabled:hover:scale-100"
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

// Leads with the actual motion (GestureHint animates the swipe direction)
// instead of a static icon + a full sentence -- the direction is shown, so
// the caption only needs to say what it DOES, not how to do it.
function MiniRanking({ liked }: { liked: Career[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {liked.map((c, i) => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5" style={{ background: "var(--color-glass-surface-raised)", borderColor: "var(--color-glass-border-raised)" }}>
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

// One card on the consolidated Top 3 results screen: the same poster face
// as the deck itself, a rank badge, and (on whichever is #1) a checkmark
// plus a glowing gold ring — tapping any card makes IT #1 instead.
function TopThreeCard({ career, rank, chosen, onChoose, index = 0 }: { career: Career; rank: number; chosen: boolean; onChoose: () => void; index?: number }) {
  const gold = "var(--color-world-business-money-office)";
  return (
    <button
      type="button"
      onClick={onChoose}
      aria-pressed={chosen}
      className="dm-tap group relative flex aspect-[3/4] w-full flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left transition-transform duration-200 motion-safe:animate-[card-cascade_0.5s_cubic-bezier(0.16,1,0.3,1)_both] hover:-translate-y-[3px]"
      style={{
        animationDelay: `${index * 90}ms`,
        borderColor: chosen ? gold : "var(--color-glass-border-raised)",
        boxShadow: chosen
          ? `0 0 0 2px ${gold}, 0 0 32px -6px color-mix(in srgb, ${gold} 70%, transparent), 0 20px 40px -20px color-mix(in srgb, ${gold} 60%, transparent)`
          : "0 12px 30px -18px rgba(0,0,0,0.6)",
      }}
    >
      {/* a slow pulse behind the #1 card only — the gold ring should read as
         alive, not a static selection state */}
      {chosen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 motion-safe:animate-[card-glow-pulse_2.4s_ease-in-out_infinite]"
          style={{ boxShadow: `0 0 0 2px ${gold}` }}
        />
      )}
      <Image src={career.photo} alt="" fill sizes="(max-width: 640px) 90vw, 220px" className="object-cover" draggable={false} />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(5,7,15,0.05) 0%, rgba(5,7,15,0.35) 55%, rgba(5,7,15,0.88) 100%)" }}
      />
      <span
        aria-hidden
        className="absolute top-2.5 left-2.5 flex size-7 items-center justify-center rounded-full text-white transition-opacity duration-150"
        style={{ background: gold, opacity: chosen ? 1 : 0 }}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <span
        aria-hidden
        className="absolute top-2.5 right-2.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[12px] font-extrabold backdrop-blur-md"
        style={{ color: chosen ? gold : "var(--color-night-foreground)", borderColor: chosen ? gold : "var(--color-glass-border)", background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)" }}
      >
        #{rank}
      </span>
      <div className="relative z-[1] flex flex-col gap-1.5 p-3">
        <p className="text-[15px] leading-[19px] font-extrabold text-white" style={{ fontFamily: career.font, fontWeight: career.fontWeight, letterSpacing: career.letterSpacing }}>{career.title}</p>
        <p className="text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: career.color }}>{career.world}</p>
        <span
          className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold"
          style={{ color: SUCCESS, borderColor: "var(--color-glass-border)", background: "color-mix(in srgb, var(--color-night-background) 55%, transparent)" }}
        >
          {career.salary}
        </span>
      </div>
    </button>
  );
}

function Sheet({ children, onClose, maxWidth = "440px" }: { children: React.ReactNode; onClose: () => void; maxWidth?: string }) {
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
        className="w-full max-h-[90dvh] overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border p-6 backdrop-blur-xl motion-safe:animate-[dreamy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)] [scrollbar-width:none]"
        style={{ maxWidth, background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}
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
      className="pointer-events-none fixed z-[90] overflow-hidden rounded-[var(--radius-lg)] border"
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
  const complete = likedCount === MAX_SLOTS;
  // "Your Top 3 is set!" is the flow's finish line and arrived with no sound and
  // no motion -- the same chime + burst the 3rd save itself gets, so the ending
  // reads as the payoff rather than a static card. Partial/empty endings stay
  // quiet on purpose; those aren't celebrations.
  useEffect(() => {
    if (complete) playMilestoneChime();
  }, [complete]);
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border p-6 text-center backdrop-blur-xl motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-border)" }}
    >
      {complete && <LocalBurst nonce={1} />}
      <h2 className={`${bricolage.className} text-[22px] font-extrabold text-[var(--color-night-foreground)]`}>
        {likedCount === MAX_SLOTS ? "Your Top 3 is set!" : likedCount > 0 ? `You've seen the stack — ${likedCount} saved` : "Nothing clicked — and that's okay"}
      </h2>
      <p className="text-[13.5px] leading-relaxed font-medium text-[var(--color-night-muted-foreground)]">
        {likedCount === MAX_SLOTS
          ? "Save them to your profile."
          : likedCount > 0
            ? `You can continue with ${likedCount}, or run the remaining careers again to fill your Top 3.`
            : "Knowing what's NOT for you is real progress. Wander through Explore — hundreds of paths, no pressure — and come back when one sparks."}
      </p>
      {likedCount > 0 && <MiniRanking liked={liked} />}
      <div className="flex w-full max-w-[320px] flex-col gap-2.5">
        {likedCount > 0 ? (
          <Button variant="primary" size="large" onClick={onReport} type="button">
            {likedCount === MAX_SLOTS ? "Continue with your 3" : `Continue with ${likedCount}`}
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
