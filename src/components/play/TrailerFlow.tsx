"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Lock, Play, Volume2, VolumeX } from "lucide-react";

import { IconTip } from "@/components/app/IconTip";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { musicMutedSnapshot, playMusic, serverMusicMutedSnapshot, setMusicMuted, stopMusic, subscribeMusicMuted } from "./music";
import type { Simulation, TrailerCard } from "./types";

// The trailer (Trailer tab): plays once before Level 1, always skippable,
// teaches nothing, about 20 seconds. Cut like a AAA game trailer, not a
// slideshow: cinema letterbox bars, a slow Ken Burns push on every plate,
// film grain and a deep vignette, and title cards set in the career
// world's own approved display face (Business & Finance's poster serif) that
// breathe in from a blur the way film titles do. Six of seven cards reuse
// art that already exists; only the finale's ladder is new. Skip appears
// from card 1 and is never hidden -- a student who skips goes straight to
// the level and loses nothing.

// A tiny SVG noise tile -- the film grain layer. Inline so the CSP-clean,
// asset-free trailer stays asset-free.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function TrailerFlow({ simulation, onDone }: { simulation: Simulation; onDone: () => void }) {
  const cards: TrailerCard[] = simulation.trailer ?? [];
  // Per-career identity: the finale's ladder is this career's own six
  // rungs, the house mark is its own firm, the accent its own world color,
  // and the title face its world's approved poster font.
  const LADDER = [...simulation.levels.map((level) => level.role), ...simulation.upcoming];
  const accent = WORLD_COLORS[simulation.world] ?? "var(--primary)";
  const titleFont = posterTitleFont(simulation.world);
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
    playMusic("main", simulation.id);
    return () => stopMusic();
  }, [simulation.id]);

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
    // The game's new look rides along (5 Oct 2026, "make them more
    // cinematic, use the new UI visuals"): the career's world colour as
    // --primary, so the finale's button is the same world-colour gradient
    // as every in-game button (play-career-world in app.css), never blue.
    <div className="marketing-v2 themeable play-career-world fixed inset-0 z-[80] overflow-hidden" style={{ background: "#000", ["--primary" as string]: accent, ["--primary-foreground" as string]: "#05070f" }} role="dialog" aria-label="Trailer">
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
              <Image src={card.art} alt="" fill sizes="100vw" className="object-cover" priority style={card.drain ? { filter: "grayscale(1) contrast(1.12) brightness(0.8)" } : undefined} />
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
                  // Low-key, with a rim of the career colour tracing the
                  // silhouette, the way a key character is lit in a trailer.
                  style={{ filter: `brightness(0.62) contrast(1.1) saturate(0.85) drop-shadow(0 0 1.5px ${accent}) drop-shadow(0 0 22px color-mix(in srgb, ${accent} 45%, transparent)) drop-shadow(0 0 60px rgba(0,0,0,0.9))` }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* A streak of the career's colour across the frame on every cut,
         a light leak between shots. */}
      {!reduced && (
        <motion.div
          key={`${card.id}-streak`}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 z-[5] h-[34dvh] w-[60vw] -translate-y-1/2 mix-blend-screen"
          initial={{ x: "-70vw", opacity: 0 }}
          animate={{ x: "120vw", opacity: [0, 0.75, 0] }}
          transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1] }}
          style={{ background: `radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, ${accent} 55%, transparent) 0%, transparent 70%)`, filter: "blur(18px)" }}
        />
      )}
      {/* Film grain, over everything but the chrome. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />

      {/* Cinema letterbox. Eases shut as the trailer opens -- the two black
         bars closing in IS the "a film is starting" cue. */}
      <motion.div aria-hidden className="absolute inset-x-0 top-0 z-20 bg-black" initial={{ height: 0 }} animate={{ height: "9dvh" }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div aria-hidden className="absolute inset-x-0 bottom-0 z-20 bg-black" initial={{ height: 0 }} animate={{ height: "9dvh" }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      {/* Progress ticks inside the top bar, one per card, the current one
         filling over its own length -- the How to Play bar's language. */}
      <div aria-hidden className="absolute top-[calc(9dvh-14px)] left-1/2 z-30 flex w-[min(420px,70vw)] -translate-x-1/2 gap-[5px]">
        {cards.map((entry, i) => (
          <span key={entry.id} className="relative h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <motion.span
              key={`${entry.id}-${i === index}`}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
              initial={{ width: i < index ? "100%" : "0%" }}
              animate={{ width: i <= index ? "100%" : "0%" }}
              transition={{ duration: i === index && !entry.finale ? entry.seconds : 0.3, ease: "linear" }}
            />
          </span>
        ))}
      </div>

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
           from a blur -- one line, film-title sized, gold-warmed white.
           Absolutely stacked inside a relative frame with NO mode="wait":
           the incoming line arrives while the outgoing one fades, in sync
           with the plate, so a cut never shows a picture with no words on
           it (direct feedback). */}
        <div className="relative flex w-full max-w-[720px] items-center justify-center">
        <AnimatePresence initial={false}>
          <motion.p
            key={`${card.id}-text`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-full text-[clamp(26px,5.4vw,52px)] leading-[1.22] tracking-[0.04em] text-balance uppercase"
            style={{
              ...titleFont,
              color: "#f8f3e7",
              textShadow: "0 2px 44px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,1)",
            }}
            aria-label={card.text}
          >
            {/* The words land one after another, each breathing in from a
               blur, like a film title being set. Same line, same words. */}
            {card.text.split(" ").map((word, w) => (
              <motion.span
                key={`${word}-${w}`}
                aria-hidden
                className="inline-block"
                initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 10 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 + w * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
                {w < card.text.split(" ").length - 1 ? "\u00a0" : ""}
              </motion.span>
            ))}
          </motion.p>
        </AnimatePresence>
        {/* Reserves the line's height (the titles are absolute). */}
        <p aria-hidden className="invisible w-full text-[clamp(26px,5.4vw,52px)] leading-[1.22] tracking-[0.04em] text-balance uppercase">
          {card.text}
        </p>
        </div>

        {card.finale && (
          <motion.div className="relative flex w-full max-w-[420px] flex-col items-center gap-[24px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
            {/* The house mark, the way a studio card closes a trailer. */}
            <p className="text-[12px] font-bold tracking-[0.5em] uppercase" style={{ fontFamily: "var(--font-body)", color: accent }}>
              {simulation.firm}
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
                const gold = accent;
                return (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + rung * 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-[13px]">
                      {/* The game's track language: you glow on the first
                         rung, the top rung glows as the goal, the rungs in
                         between are locked. */}
                      <span
                        aria-hidden
                        className="relative flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full"
                        style={
                          rung === 0
                            ? { background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${gold} 55%, white), ${gold})`, boxShadow: `0 0 0 4px color-mix(in srgb, ${gold} 20%, transparent), 0 0 18px color-mix(in srgb, ${gold} 70%, transparent)` }
                            : top
                              ? { border: `2px solid ${gold}`, background: `color-mix(in srgb, ${gold} 22%, transparent)`, boxShadow: `0 0 18px color-mix(in srgb, ${gold} 75%, transparent)` }
                              : { border: `1px solid rgba(255,255,255,${0.22 + rung * 0.06})`, background: "rgba(255,255,255,0.04)" }
                        }
                      >
                        {rung === 0 && <motion.span className="absolute inset-0 rounded-full border-2" style={{ borderColor: gold }} animate={reduced ? undefined : { scale: [1, 1.6], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />}
                        {rung > 0 && !top && <Lock className="h-[10px] w-[10px]" style={{ color: `rgba(255,255,255,${0.4 + rung * 0.08})` }} />}
                      </span>
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
                        className="ml-[10px] h-[13px] w-[2px] rounded-full"
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
              className="dm-solid flex min-h-[52px] w-full max-w-[320px] cursor-pointer items-center justify-center gap-[9px] rounded-[var(--radius-md)] px-[26px] text-[15px] font-semibold tracking-[0.08em] uppercase"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 12px 44px -10px color-mix(in srgb, var(--primary) 85%, transparent)", fontWeight: 800 }}
            >
              <Play className="h-[15px] w-[15px]" fill="currentColor" aria-hidden />
              Start Level 1
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Always skippable, never hidden -- quiet corner chrome, the way a
         real trailer keeps its skip out of the frame's way. The sound
         toggle shares the corner language, top-right. */}
      <IconTip label={musicMuted ? "Turn trailer sound on" : "Turn trailer sound off"} className="absolute top-[calc(9dvh+14px)] right-[18px] z-30">
        <button
          type="button"
          onClick={() => setMusicMuted(!musicMuted)}
          aria-pressed={musicMuted}
          aria-label={musicMuted ? "Turn trailer sound on" : "Turn trailer sound off"}
          className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full border backdrop-blur-[8px]"
          style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.3)", color: musicMuted ? "rgba(255,255,255,0.55)" : "#FFFFFF" }}
        >
          {musicMuted ? <VolumeX className="h-[17px] w-[17px]" aria-hidden /> : <Volume2 className="h-[17px] w-[17px]" aria-hidden />}
        </button>
      </IconTip>
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
