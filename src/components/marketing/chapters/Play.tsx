"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";
import { ConfirmShimmer } from "@/components/flow/ConfirmShimmer";
import type { Tier } from "@/components/play/types";
import { SparkBar } from "@/components/flow/SparkBar";

// The landing's Play preview is a game tile, the way a console store shows a
// game (direct feedback, 4 Sept 2026: "Xbox/PlayStation, immersion is king").
// The art is the hero and everything else is a thin HUD on top of it: a gold
// XP bar across the top, the level chip, a dialogue box with the speaker's
// face, the choices as a console menu. It is a taste, not the game: it runs
// on its own the moment the chapter arrives, Christina speaks, the choices
// rise, the cursor settles on the right one and confirms it. Nothing here
// can be got wrong; most readers will watch and scroll on.
const SCENARIO = {
  scene: "Deal Team Kickoff",
  speaker: { name: "Christina", role: "Associate", face: "/images/play/ib/face-christina-serious.webp" },
  line: "This is Marcus, our Vice President. We have a big pitch tomorrow, so I need you on it.",
  question: "What should you do first?",
  choices: [
    { id: "a", label: "Ask for your role and deadline", tier: "best" as Tier },
    { id: "b", label: "Start changing slides", tier: "risky" as Tier },
    { id: "c", label: "Wait for another analyst", tier: "wrong" as Tier },
  ],
  why: "Right. Clarify scope before you touch a slide.",
};

const ART = "/images/sim-deal-kickoff.jpg";
const XP_START = 18;
const XP_AFTER_BEST = 46;

export function PlayChapter() {
  const [graphicRef, , graphicRevealed, visitId] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="play"
      // Briefly renamed "Simulate", reverted to "Play" per direct request ("for
      // now" — may flip again). The section id has been "play" throughout.
      title="Play"
      color="#3b82f6"
      oneliner="A day-in-the-life simulation where you make real decisions and see what the job actually feels like."
      flip
      graphicRef={graphicRef}
      playing={false}
      graphicRevealed={graphicRevealed}
    >
      {/* Keyed by visitId: remounts this demo fresh every time the reader scrolls back
         onto Play, so the press-play moment and the pick-and-react moment replay
         every visit instead of staying stuck on a previous answer. */}
      <PlayDemo key={visitId} />
    </ChapterShell>
  );
}

type Phase = "typing" | "ready" | "answered";

function PlayDemo() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState(0);
  const answered = phase === "answered";
  const xp = answered ? XP_AFTER_BEST : XP_START;

  // On arrival: a beat of just the scene, Christina's line types itself in,
  // the choices come up, the cursor rests on the right one, then it confirms
  // on its own. Tapping the right answer confirms it early.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    let tick: ReturnType<typeof setInterval> | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        tick = setInterval(() => {
          i = reduce ? SCENARIO.line.length : i + 1;
          setTyped(i);
          if (i >= SCENARIO.line.length) {
            clearInterval(tick);
            timers.push(setTimeout(() => setPhase("ready"), reduce ? 120 : 380));
            timers.push(setTimeout(() => setPhase("answered"), reduce ? 900 : 2600));
          }
        }, reduce ? 0 : 17);
      }, reduce ? 0 : 500),
    );
    return () => {
      if (tick) clearInterval(tick);
      timers.forEach(clearTimeout);
    };
  }, []);

  // Tilt toward the cursor, desktop only: the frame turns a few degrees and
  // the art shifts a touch more than the frame, so the tile reads as a slab
  // with depth rather than a flat picture. Written straight to CSS variables
  // so a mouse move never re-renders the card.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !window.matchMedia("(pointer: fine) and (min-width: 901px)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--tx", `${(-px * 10).toFixed(1)}px`);
    el.style.setProperty("--ty", `${(-py * 8).toFixed(1)}px`);
    el.style.setProperty("--tilt-ease", "160ms");
  }, []);
  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-ease", "650ms");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
  }, []);

  const GOLD = "var(--world-business-money-office, #f5c04e)";

  return (
    <div className="flex h-full max-w-full flex-col" style={{ width: "clamp(300px, 100cqw, 480px)", gap: "calc(var(--mu) * 8px)" }}>
      <p className="text-[14px] leading-[18px] font-bold tracking-[0.1em] uppercase" style={{ color: "#5b9bff" }}>Day in the Life: Investment Banker</p>

      <div className="relative" style={{ perspective: 1100 }} onMouseMove={onMove} onMouseLeave={onLeave}>
        {/* the art lights the page behind it, the way a console tile does */}
        <div aria-hidden className="pointer-events-none absolute -inset-[7%] z-0 overflow-hidden rounded-[40px] opacity-60" style={{ filter: "blur(44px) saturate(1.4)" }}>
          <Image src={ART} alt="" fill sizes="600px" className="object-cover" />
        </div>

        <div
          ref={cardRef}
          className={`mkt-console-card relative z-[1] flex flex-col overflow-hidden ${answered ? "mkt-play-feedback" : ""}`}
          style={{
            borderRadius: "var(--radius-md-alt)",
            ["--c" as string]: "#3b82f6",
            background: "#0b0e1c",
            transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
            transition: "transform var(--tilt-ease, 400ms) ease-out",
            transformStyle: "preserve-3d",
            boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)",
          }}
        >
          <span aria-hidden className="mkt-console-sheen" />

          {/* XP: one gold bar the full width of the card, sparking when the answer lands */}
          <div aria-hidden className="absolute inset-x-0 top-0 z-[3]">
            <SparkBar percent={xp} height={4} track="rgba(255,255,255,0.14)" fill={GOLD} glow={GOLD} />
          </div>

          {/* the scene, whole: the frame is the picture's own shape */}
          <div className="relative w-full flex-none overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
            <div className="mkt-console-push absolute inset-0" style={{ translate: "var(--tx, 0px) var(--ty, 0px)", transition: "translate var(--tilt-ease, 400ms) ease-out" }}>
              <Image src={ART} alt="" fill sizes="(max-width: 900px) 90vw, 560px" className="object-cover" />
            </div>

            {/* HUD: the level chip, and the XP pop beside it when the answer lands */}
            <div className="absolute top-[14px] left-[12px] z-[3] flex items-center gap-[8px]">
              <span className="rounded-[6px] px-[9px] py-[4px] text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ background: "rgba(8,10,22,0.72)", color: GOLD, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>Level 1 · Intern</span>
              {answered && (
                <span aria-hidden className="mkt-xp-pop text-[11.5px] font-extrabold tracking-[0.04em] whitespace-nowrap" style={{ color: GOLD, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>+25 XP</span>
              )}
            </div>

            {/* the art fades into the frame's own dark, so scene and menu are one surface */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]" style={{ height: "52%", background: "linear-gradient(180deg, transparent, rgba(11,14,28,0.6) 55%, #0b0e1c 100%)" }} />

            {/* the conversation: who is talking, then what they say */}
            <div className="absolute inset-x-[10px] bottom-[6px] z-[2] flex gap-[10px] rounded-[var(--radius-md-alt)] border p-[10px]" style={{ background: "rgba(8,10,22,0.8)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
              <span className="relative block flex-none overflow-hidden rounded-[10px] border" style={{ width: "calc(var(--mu) * 40px)", height: "calc(var(--mu) * 40px)", borderColor: "rgba(255,255,255,0.18)", background: "#151a2e" }}>
                <Image src={SCENARIO.speaker.face} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="flex items-baseline gap-[6px] text-[11px] leading-[14px] font-bold tracking-[0.06em] uppercase">
                  <span style={{ color: GOLD }}>{SCENARIO.speaker.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{SCENARIO.speaker.role}</span>
                </span>
                <p className="font-semibold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(13.5px, calc(var(--mu) * 10.5px), 15.5px)", lineHeight: 1.35, color: "#fff", minHeight: "2.7em" }}>
                  {SCENARIO.line.slice(0, typed)}
                  {phase === "typing" && <span aria-hidden className="ml-[1px] inline-block h-[0.95em] w-[2px] translate-y-[2px] bg-white motion-safe:animate-pulse" />}
                </p>
              </span>
            </div>
          </div>

          {/* below the art: the scene name while she talks, then the console menu */}
          {/* the menu is always in the layout (hidden while she talks) so the
             card never changes height; tight to the dialogue above and to the
             bottom edge (direct feedback: no wasted space) */}
          <div className="relative z-[2] flex flex-none flex-col" style={{ padding: "calc(var(--mu) * 2px) calc(var(--mu) * 8px) calc(var(--mu) * 7px)", background: "#0b0e1c" }}>
            {phase === "typing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[6px] px-[12px] text-center" style={{ opacity: 0.5 }}>
                <p className="font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px, calc(var(--mu) * 15px), 22px)", lineHeight: 1.1, letterSpacing: "0.01em", color: "#fff" }}>{SCENARIO.scene}</p>
                <p className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Scene 1</p>
              </div>
            )}
            <div className="flex flex-col" style={{ gap: "calc(var(--mu) * 4px)", visibility: phase === "typing" ? "hidden" : "visible" }}>
                <p className="px-[12px] font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(14px, calc(var(--mu) * 11.5px), 17px)", lineHeight: 1.25, color: "var(--foreground)" }}>{SCENARIO.question}</p>
                <div className="flex flex-col gap-[2px]">
                  {phase !== "typing" && SCENARIO.choices.map((c, index) => (
                    <ConsoleOption
                      key={c.id}
                      index={index}
                      label={c.label}
                      best={c.tier === "best"}
                      answered={answered}
                      onConfirm={() => setPhase("answered")}
                    />
                  ))}
                  {phase === "typing" && SCENARIO.choices.map((c) => (
                    <div key={c.id} aria-hidden className="px-[12px] py-[8px] text-[14px] leading-snug font-semibold">{c.label}</div>
                  ))}
                </div>
                <p aria-live="polite" className="px-[12px] text-[12.5px] leading-[16px] font-semibold" style={{ minHeight: 16, color: answered ? "var(--color-feedback-success, #33c78c)" : "transparent" }}>
                  {answered ? SCENARIO.why : " "}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A console menu row: no box, a thin bar on the left, the row itself only a
 *  faint wash. The cursor rests on the right answer with the bar half lit and
 *  a slow breath; when the answer lands the row confirms with the Build
 *  flow's lift and one light sweep. The other rows are not buttons at all:
 *  the preview cannot be got wrong (direct feedback). */
function ConsoleOption({ label, index, best, answered, onConfirm }: { label: string; index: number; best: boolean; answered: boolean; onConfirm: () => void }) {
  const done = best && answered;
  const paint = "var(--color-feedback-success)";
  const Tag = best ? "button" : "div";
  return (
    <Tag
      {...(best ? { type: "button" as const, onClick: onConfirm, disabled: answered, "aria-label": `Answer: ${label}` } : {})}
      className={`group relative flex w-full items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-snug font-semibold transition-[background,opacity,transform] duration-200 motion-safe:animate-[fade-slide-up_0.36s_cubic-bezier(0.16,1,0.3,1)_both] ${
        best && !answered ? "cursor-pointer hover:bg-[rgba(255,255,255,0.08)]" : ""
      } ${done ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
      style={{
        animationDelay: `${index * 70}ms`,
        background: done ? `color-mix(in srgb, ${paint} 16%, transparent)` : best ? "rgba(255,255,255,0.055)" : "transparent",
        boxShadow: best && !done ? "inset 0 0 0 1px rgba(255,255,255,0.07)" : undefined,
        color: "var(--foreground)",
        opacity: answered && !best ? 0.42 : 1,
      }}
    >
      <ConfirmShimmer active={done} />
      <span aria-hidden className={`absolute top-[7px] bottom-[7px] left-0 w-[3px] rounded-full transition-[background] duration-200 ${best && !done ? "mkt-console-cursor" : ""}`} style={{ background: done ? paint : best ? "color-mix(in srgb, var(--c) 75%, #fff 10%)" : "transparent" }} />
      <span className="min-w-0 flex-1">{label}</span>
      {done && (
        <span aria-hidden className="flex size-[20px] flex-none items-center justify-center rounded-full" style={{ background: paint, color: "#05070f" }}>
          <Check className="h-[12px] w-[12px]" strokeWidth={3} />
        </span>
      )}
    </Tag>
  );
}
