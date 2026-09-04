"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";
import { OptionButton, Question } from "@/components/play/interactions";
import { TIER_COLOR } from "@/components/play/scoring";
import type { Tier } from "@/components/play/types";

// The landing's Play preview is the real game's screen (CEO, 4 Sept: it read
// like a quiz while the game itself is cinematic). Same scene art, the same
// dialogue box, the same numbered option buttons the simulation uses, the same
// right/wrong feedback. All three answers are live: the point is that the
// student is making a decision, not watching. The series title sits above the
// card, outside the game, so the card carries only the game.
const SCENARIO: { setup: string; question: string; choices: { id: string; label: string; tier: Tier; why: string }[] } = {
  setup: "An Associate introduces you to the Managing Director. Your team has a big pitch tomorrow.",
  question: "What should you do first?",
  choices: [
    { id: "a", label: "Ask for your role and deadline", tier: "best", why: "Right. Clarify scope before you touch a slide." },
    { id: "b", label: "Start changing slides", tier: "risky", why: "Not yet. You do not know what the team needs from you." },
    { id: "c", label: "Wait for another analyst", tier: "wrong", why: "Waiting reads as passive on day one. Ask." },
  ],
};

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
         onto Play, so a previously-picked option (and its feedback) doesn't stay stuck
         showing — the pick-and-react moment is there to replay every visit. */}
      <PlayDemo key={visitId} />
    </ChapterShell>
  );
}

function PlayDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = SCENARIO.choices.find((c) => c.id === picked) ?? null;
  // one frame after mount, the ring and the progress bar draw in
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Same act-then-advance rhythm as Build and Match: a right answer moves the
  // reader on once the feedback has landed; a wrong one waits for Try again.
  useEffect(() => {
    if (!choice || choice.tier !== "best") return;
    const timeout = setTimeout(() => {
      document.getElementById("connect")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1400);
    return () => clearTimeout(timeout);
  }, [choice]);

  return (
    <div className="flex h-full max-w-full flex-col" style={{ width: "clamp(300px, 100cqw, 480px)", gap: "calc(var(--mu) * 8px)" }}>
      {/* the series name, outside the game (CEO: it does not need to be in the card) */}
      <p className="text-[12px] leading-[16px] font-bold tracking-[0.1em] uppercase" style={{ color: "#5b9bff" }}>Day in the Life: Investment Banker</p>

      <div
        className={`mkt-play-card relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden ${choice ? "mkt-play-feedback" : ""}`}
        style={{ borderRadius: "var(--radius-md-alt)", ["--c" as string]: "#3b82f6", background: "#0b0e1c" }}
      >
        {/* the game's own header strip: level and role (the career is named
           once, above the card), the reputation ring and the progress bar,
           both drawing themselves in on load */}
        <div className="relative z-[2] flex flex-none items-center justify-between gap-[10px] px-[14px] pt-[9px] pb-[8px]" style={{ background: "rgba(8,10,22,0.92)" }}>
          <span className="block truncate text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--world-business-money-office, #f5c04e)" }}>Level 1 · Intern</span>
          <span className="relative flex h-[30px] w-[30px] flex-none items-center justify-center" aria-label="Reputation 50">
            <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--world-business-money-office, #f5c04e)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 14}`} strokeDashoffset={mounted ? `${2 * Math.PI * 14 * 0.5}` : `${2 * Math.PI * 14}`} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s" }} />
            </svg>
            <span className="relative text-[11px] font-extrabold tabular-nums" style={{ color: "#fff" }}>50</span>
          </span>
        </div>
        <div className="relative z-[2] h-[3px] w-full flex-none" style={{ background: "rgba(255,255,255,0.1)" }}>
          <span className="absolute inset-y-0 left-0 rounded-r-full" style={{ width: mounted ? "38%" : "0%", background: "var(--world-business-money-office, #f5c04e)", transition: "width 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s" }} />
        </div>

        {/* the scene, uncovered, the biggest thing on the card: more of it
           shows now, and the dialogue box hugs the bottom edge */}
        <div className="relative min-h-0 flex-1" style={{ minHeight: "calc(var(--mu) * 190px)" }}>
          <Image src="/images/sim-deal-kickoff.jpg" alt="" fill sizes="(max-width: 900px) 90vw, 560px" className="mkt-sim-drift object-cover" style={{ objectPosition: "center 8%" }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: "40%", background: "linear-gradient(180deg, transparent, rgba(11,14,28,0.95) 100%)" }} />
          {/* the dialogue box, sitting on the scene the way the game's does */}
          <div className="absolute inset-x-[10px] bottom-[8px] rounded-[var(--radius-md-alt)] border px-[12px] py-[9px]" style={{ background: "rgba(8,10,22,0.82)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
            <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(13.5px, calc(var(--mu) * 11px), 16px)", lineHeight: 1.3, color: "#fff" }}>{SCENARIO.setup}</p>
          </div>
        </div>

        {/* the question and the game's own option buttons */}
        <div className="relative z-[1] flex flex-none flex-col" style={{ padding: "calc(var(--mu) * 10px) calc(var(--mu) * 12px) calc(var(--mu) * 10px)", gap: "calc(var(--mu) * 8px)", background: "#0b0e1c" }}>
          <Question>{SCENARIO.question}</Question>
          <div className="flex flex-col gap-[6px]">
            {SCENARIO.choices.map((c, index) => (
              <OptionButton
                key={c.id}
                index={index}
                label={c.label}
                disabled={picked !== null}
                picked={picked === c.id}
                tier={c.tier}
                dimmed={picked !== null && picked !== c.id}
                revealed={picked !== null && picked !== c.id && c.tier === "best"}
                numbered={false}
                onClick={() => setPicked(c.id)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-[10px]" style={{ minHeight: "calc(var(--mu) * 16px)" }}>
            <p aria-live="polite" className="text-[13px] leading-[17px] font-semibold" style={{ color: choice ? (choice.tier === "best" ? "var(--color-feedback-success, #33c78c)" : TIER_COLOR[choice.tier]) : "transparent" }}>
              {choice ? choice.why : " "}
            </p>
            {choice && choice.tier !== "best" && (
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="flex flex-none items-center gap-[5px] rounded-full border px-[11px] py-[5px] text-[12px] font-semibold"
                style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "#fff" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                  <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                </svg>
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
