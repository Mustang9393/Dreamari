"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { musicMutedSnapshot, playMusic, serverMusicMutedSnapshot, setMusicMuted, stopMusic, subscribeMusicMuted } from "./music";
import type { TrailerCard } from "./types";

// The trailer (Trailer tab): plays once before Level 1, always skippable,
// teaches nothing, about 20 seconds. Cut like a AAA game trailer, not a
// slideshow: cinema letterbox bars, a slow Ken Burns push on every plate,
// film grain and a deep vignette, and title cards set in the career
// world's own approved display face (Business & Money's poster serif) that
// breathe in from a blur the way film titles do. Six of seven cards reuse
// art that already exists; only the finale's ladder is new. Skip appears
// from card 1 and is never hidden -- a student who skips goes straight to
// the level and loses nothing.

const LADDER = ["Intern", "Analyst", "Associate", "Vice President", "Executive Director", "Managing Director"];

// A tiny SVG noise tile -- the film grain layer. Inline so the CSP-clean,
// asset-free trailer stays asset-free.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function TrailerFlow({ cards, onDone }: { cards: TrailerCard[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  // Portal target: fixed positioning inside the app shell gets captured by
  // ancestor transforms/filters (the reveal animations, motion cards), so
  // the trailer mounts on document.body -- true full-bleed cinema.
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- document.body is client-only
    setHost(document.body);
  }, []);
  const reduced = useReducedMotion();
  const card = cards[Math.min(index, cards.length - 1)];

  // The score: the simulation's own main theme, started by the same tap
  // that opened the trailer (so autoplay policy allows it), stopped the
  // moment the trailer closes. Same mute flag as in-game music, with its
  // own toggle in the trailer chrome.
  const musicMuted = useSyncExternalStore(subscribeMusicMuted, musicMutedSnapshot, serverMusicMutedSnapshot);
  useEffect(() => {
    playMusic("main");
    return () => stopMusic();
  }, []);

  // Auto-advance on a per-card clock; the finale holds for its buttons.
  useEffect(() => {
    if (card.finale) return;
    const timer = window.setTimeout(() => setIndex((current) => Math.min(current + 1, cards.length - 1)), card.seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [card, cards.length]);

  if (!host) return null;
  return createPortal(
    // marketing-v2/themeable ride along because the portal mounts on
    // document.body, OUTSIDE the app shell -- without them the design
    // tokens (--primary, the world golds) never resolve out here.
    <div className="marketing-v2 themeable fixed inset-0 z-[80] overflow-hidden" style={{ background: "#000" }} role="dialog" aria-label="Trailer">
      {/* The plates, crossfading, each on its own slow push -- in on even
         cards, out on odd ones, so consecutive cuts never move the same
         way. AnimatePresence keeps the outgoing plate on screen while the
         incoming one fades over it: a dissolve, never a hard cut. */}
      <AnimatePresence>
        {card.art && (
          <motion.div
            key={card.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: reduced ? 1 : index % 2 === 0 ? 1.16 : 1.02 }}
              animate={{ scale: reduced ? 1 : index % 2 === 0 ? 1.04 : 1.14 }}
              transition={{ duration: Math.max(card.seconds + 1.2, 3), ease: "linear" }}
            >
              <Image src={card.art} alt="" fill sizes="100vw" className="object-cover" priority />
            </motion.div>
            {/* Deep vignette: the frame stays dark at the edges so the
               title always owns the center of the screen. */}
            <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(115% 85% at 50% 46%, transparent 26%, rgba(0,0,0,0.62) 74%, rgba(0,0,0,0.94) 100%)" }} />
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 62%, rgba(0,0,0,0.72) 100%)" }} />
            {/* A character sprite rising into frame, low-key graded but
               clearly VISIBLE (above the vignette layers, never buried
               under them): seen before they are met. */}
            {card.sprite && (
              <motion.div
                className="absolute right-[2%] bottom-0 h-[80dvh] w-[60vw] sm:right-[9%] sm:w-[36vw]"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              >
                <Image
                  src={card.sprite}
                  alt=""
                  fill
                  sizes="40vw"
                  className="object-contain object-bottom"
                  style={{ filter: "brightness(0.68) contrast(1.08) saturate(0.85) drop-shadow(0 0 60px rgba(0,0,0,0.9))" }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Film grain, over everything but the chrome. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />

      {/* Cinema letterbox. Eases shut as the trailer opens -- the two black
         bars closing in IS the "a film is starting" cue. */}
      <motion.div aria-hidden className="absolute inset-x-0 top-0 z-20 bg-black" initial={{ height: 0 }} animate={{ height: "9dvh" }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div aria-hidden className="absolute inset-x-0 bottom-0 z-20 bg-black" initial={{ height: 0 }} animate={{ height: "9dvh" }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[30px] px-6 py-[12dvh] text-center">
        {/* A dedicated text scrim, independent of the plate: a soft dark
           pool behind the title zone so legibility is 100% on ANY art --
           the bright morning plates were washing the serif out. */}
        {!card.finale && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-[90dvh] w-[160vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              // The pool of focus behind the title: a backdrop blur that
              // FEATHERS out through its mask plus a soft tint whose
              // gradient dies well inside the element -- organic, never a
              // rectangle with edges.
              backdropFilter: "blur(9px)",
              WebkitBackdropFilter: "blur(9px)",
              maskImage: "radial-gradient(38% 32% at 50% 50%, black 12%, transparent 62%)",
              WebkitMaskImage: "radial-gradient(38% 32% at 50% 50%, black 12%, transparent 62%)",
              background: "radial-gradient(38% 32% at 50% 50%, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.3) 42%, transparent 66%)",
            }}
          />
        )}
        {/* The title, set in the world's approved poster serif, breathing in
           from a blur -- one line, film-title sized, gold-warmed white. */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`${card.id}-text`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[720px] text-[clamp(26px,5.4vw,52px)] leading-[1.22] tracking-[0.04em] text-balance uppercase"
            style={{
              fontFamily: "var(--font-poster)",
              fontWeight: 400,
              color: "#f8f3e7",
              textShadow: "0 2px 44px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,1)",
            }}
          >
            {card.text}
          </motion.p>
        </AnimatePresence>

        {card.finale && (
          <motion.div className="flex w-full max-w-[420px] flex-col items-center gap-[24px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
            {/* The house mark, the way a studio card closes a trailer. */}
            <p className="text-[12px] font-bold tracking-[0.5em] uppercase" style={{ fontFamily: "var(--font-body)", color: "var(--world-business-money-office)" }}>
              Cobalt Capital
            </p>
            {/* The ladder as a vertical stepper, centered as a block: a
               ring per rung, short line segments CONNECTING the rings
               (nothing overlapping, per direct feedback), labels beside
               them -- lighting up from the bottom rung to a gold, glowing
               Managing Director at the top. A diagram, not buttons, so the
               one real button below stays the only thing that reads
               tappable. */}
            <div className="mx-auto flex w-fit flex-col" aria-label="The career ladder">
              {[...LADDER].reverse().map((role, i) => {
                const rung = LADDER.length - 1 - i; // 5 = Managing Director
                const top = rung === 5;
                const gold = "var(--world-business-money-office)";
                return (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + rung * 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-[13px]">
                      <span
                        aria-hidden
                        className="h-[14px] w-[14px] flex-none rounded-full border-2"
                        style={{
                          borderColor: top ? gold : `rgba(255,255,255,${0.3 + rung * 0.08})`,
                          background: top ? gold : "transparent",
                          boxShadow: top ? `0 0 16px color-mix(in srgb, ${gold} 75%, transparent)` : "none",
                        }}
                      />
                      <span
                        className="font-bold tracking-[0.2em] whitespace-nowrap uppercase"
                        style={{
                          fontSize: `${11 + rung * 0.9}px`,
                          color: top ? gold : `rgba(255,255,255,${0.5 + rung * 0.09})`,
                          textShadow: top ? `0 0 22px color-mix(in srgb, ${gold} 60%, transparent)` : "none",
                        }}
                      >
                        {role}
                      </span>
                    </div>
                    {rung > 0 && (
                      <span
                        aria-hidden
                        className="ml-[6px] h-[13px] w-[2px] rounded-full"
                        style={{ background: `rgba(255,255,255,${0.14 + rung * 0.05})` }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
            <motion.button
              type="button"
              onClick={onDone}
              autoFocus
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, scale: [1, 1.03, 1] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.4 + LADDER.length * 0.22 + 0.2 },
                y: { duration: 0.6, delay: 0.4 + LADDER.length * 0.22 + 0.2 },
                scale: { duration: 1.8, delay: 0.4 + LADDER.length * 0.22 + 1, repeat: Infinity, ease: "easeInOut" },
              }}
              className="dm-solid flex min-h-[52px] w-full max-w-[320px] cursor-pointer items-center justify-center gap-[9px] rounded-full px-[26px] text-[15px] font-extrabold tracking-[0.08em] uppercase"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 12px 44px -10px color-mix(in srgb, var(--primary) 85%, transparent)" }}
            >
              ▶ Start Level 1
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Always skippable, never hidden -- quiet corner chrome, the way a
         real trailer keeps its skip out of the frame's way. The sound
         toggle shares the corner language, top-right. */}
      <button
        type="button"
        onClick={() => setMusicMuted(!musicMuted)}
        aria-pressed={musicMuted}
        aria-label={musicMuted ? "Turn trailer sound on" : "Turn trailer sound off"}
        className="dm-quiet absolute top-[calc(9dvh+14px)] right-[18px] z-30 flex size-[40px] cursor-pointer items-center justify-center rounded-full border backdrop-blur-[8px]"
        style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.3)", color: musicMuted ? "rgba(255,255,255,0.55)" : "#FFFFFF" }}
      >
        {musicMuted ? <VolumeX className="h-[17px] w-[17px]" aria-hidden /> : <Volume2 className="h-[17px] w-[17px]" aria-hidden />}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="dm-quiet absolute right-[22px] bottom-[calc(9dvh+16px)] z-30 min-h-[44px] cursor-pointer px-[10px] text-[12px] font-bold tracking-[0.3em] uppercase transition-opacity hover:opacity-100"
        style={{ color: "rgba(255,255,255,0.66)" }}
      >
        Skip ▸
      </button>
    </div>,
    host,
  );
}
