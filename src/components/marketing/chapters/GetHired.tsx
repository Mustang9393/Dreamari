"use client";

import Image from "next/image";
import { useState } from "react";
import { MatchRing } from "@/components/app/MatchRing";
import { posterTitleFont, TEXT_SCRIM, WORLD_COLORS } from "@/components/app/worlds";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// The loop-closer, per direct founder feedback: the five chapters explain the
// experience but never show where it leads. One section, one frame, a Next
// button — each press swaps the next stage into the SAME position, in the
// order a student lives it: Top 3 -> Plan -> Resume -> hire-ready. Copy is
// deliberately minimal and NEVER promises hiring happens on the platform —
// the claim is prep: the resume gets out there, ready.
// Mocks reuse the real product elements (MatchRing, poster title faces, the
// Browse Card scrim, plan copy verbatim from the profile's plan data) rather
// than redrawn approximations.
const WORLD_COLOR = "var(--world-building-construction)";

const STAGES = [
  { id: "top3", kicker: "Prep to get hired", label: "My Top 3", line: "Narrow it to three." },
  { id: "plan", kicker: "Prep to get hired", label: "My Plan", line: "Lock in one. Follow the plan." },
  { id: "resume", kicker: "Prep to get hired", label: "Resume", line: "Put your resume out there." },
  { id: "hired", kicker: "Get hired", label: "Hire-ready", line: "What all of it is for." },
] as const;

// Same photos the Match deck uses; titles set in each world's approved poster face.
const TOP3 = [
  { title: "Investment Banking", world: "Business & Money", match: 86, photo: "/images/career-investment-banking-2.jpg" },
  { title: "UX Designer", world: "Tech & Engineering", match: 78, photo: "/images/career-ux-designer.jpg" },
  { title: "Project Manager", world: "Business & Money", match: 72, photo: "/images/career-project-manager.jpg" },
];

// Verbatim from the profile plan data (Level 1, Investment Banking).
const PLAN_TASKS = [
  { label: "Complete the finance glossary game", minutes: 10, done: true },
  { label: "Explore 5 finance careers", minutes: 10, done: true },
  { label: "Play the Investment Banking mini game", minutes: 15, done: false },
];

export function GetHiredChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const [stage, setStage] = useState(0);
  const current = STAGES[stage];
  const last = stage === STAGES.length - 1;

  return (
    <ChapterShell
      id="get-hired"
      title="Get hired"
      color={WORLD_COLOR}
      oneliner="Top 3. One plan. One resume. Hire-ready."
      flip
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="w-full max-w-[480px] rounded-[24px] border p-5 sm:p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Stage header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: last ? WORLD_COLOR : "var(--primary-tint)" }}>{current.kicker}</div>
            <div className="truncate text-[17px] leading-[22px] font-extrabold" style={{ color: "var(--foreground)" }}>{current.label}</div>
          </div>
          <div className="flex flex-none items-center gap-[6px]">
            {STAGES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to ${item.label}`}
                aria-pressed={index === stage}
                onClick={() => setStage(index)}
                className="size-[8px] cursor-pointer rounded-full transition-all"
                style={{ background: index === stage ? WORLD_COLOR : "var(--glass-surface-2)", transform: index === stage ? "scale(1.35)" : "scale(1)" }}
              />
            ))}
          </div>
        </div>

        <p className="mt-1 text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{current.line}</p>

        {/* The stage window: fixed height, content swaps in place */}
        <div key={current.id} className="mkt-stage mt-3 flex h-[248px] flex-col justify-center sm:h-[268px]">
          {stage === 0 && (
            <div className="grid h-full grid-cols-3 gap-2">
              {TOP3.map((card, index) => (
                <div key={card.title} className="relative overflow-hidden rounded-[14px] border-2 text-center uppercase" style={{ borderColor: index === 0 ? "var(--primary)" : "var(--border)", opacity: index === 0 ? 1 : 0.8 }}>
                  <Image src={card.photo} alt="" fill sizes="150px" className="object-cover" />
                  <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold" style={{ background: "var(--glass-surface-3)", color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{index + 1}</span>
                  {index === 0 && <span className="absolute top-1.5 right-1.5 rounded-full px-[6px] py-[1px] text-[7.5px] font-bold tracking-[0.5px]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>FOCUS</span>}
                  <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1 pt-6 pb-2" style={{ backgroundImage: TEXT_SCRIM }}>
                    <MatchRing score={card.match} size={26} />
                    <span className="w-full text-[10.5px] leading-[12.5px]" style={{ ...posterTitleFont(card.world), color: "var(--foreground)" }}>{card.title}</span>
                    <span className="w-full text-[6.5px] leading-[9px] font-semibold tracking-[0.5px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[card.world] }}>{card.world}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {stage === 1 && (
            <div className="flex h-full flex-col justify-center">
              {/* Editorial level header: caption, display title, progress ring */}
              <div className="flex items-center justify-between pb-3">
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--accent-subtle)" }}>Level 1 · Foundation</span>
                  <span className="text-[19px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Next 3 Months</span>
                </span>
                <MatchRing score={50} size={38} />
              </div>
              {/* Hairline task list: check circles, quiet strikeouts, minutes right */}
              {PLAN_TASKS.map((task, index) => (
                <div key={task.label} className={`flex items-center gap-3 py-3 ${index < PLAN_TASKS.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                  <span className="flex size-5 flex-none items-center justify-center rounded-full text-[11px] font-bold" style={task.done ? { background: "var(--color-feedback-success, #33c78c)", color: "#05070f" } : { border: "1.5px solid var(--border)", color: "transparent" }}>{task.done ? "✓" : ""}</span>
                  <span className={`min-w-0 flex-1 truncate text-[13px] leading-[17px] font-semibold ${task.done ? "line-through" : ""}`} style={{ color: task.done ? "var(--muted-foreground)" : "var(--foreground)", textDecorationColor: "color-mix(in srgb, var(--muted-foreground) 60%, transparent)" }}>{task.label}</span>
                  <span className="flex-none text-[9.5px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--muted-foreground)" }}>{task.minutes} min</span>
                </div>
              ))}
            </div>
          )}

          {stage === 2 && (
            <div className="flex h-full items-center gap-3">
              <div className="flex h-full flex-1 flex-col gap-2 rounded-[14px] border p-3.5" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
                <span className="text-[13px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Jordan Rivera</span>
                <span className="h-[6px] w-3/4 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="h-[6px] w-2/3 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="mt-1 h-[6px] w-full rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="h-[6px] w-5/6 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="h-[6px] w-1/2 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {/* Receipt chip verbatim from the profile's receipts */}
                <span className="rounded-full px-2.5 py-1.5 text-[10.5px] font-bold" style={{ background: "color-mix(in srgb, var(--color-feedback-success, #33c78c) 20%, transparent)", color: "var(--color-feedback-success, #33c78c)" }}>2x · IB sim finished</span>
                <span className="rounded-full px-2.5 py-1.5 text-[10.5px] font-bold" style={{ background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>Lv 4 · Finance glossary</span>
                <span className="mt-1 rounded-[12px] px-3 py-2.5 text-center text-[12px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Send to employers</span>
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="relative h-full overflow-hidden rounded-[14px] border" style={{ borderColor: "var(--border)" }}>
              {/* TODO(asset): swap for the rights-cleared career-fair handshake
                  photo when supplied. Stand-in from the existing set until then. */}
              <Image src="/images/career-chief-executive.jpg" alt="" fill sizes="480px" className="object-cover object-[center_30%]" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 30%, rgba(5,7,15,0.9))" }} />
              <div className="mkt-offer absolute inset-x-3 bottom-3 rounded-[14px] border p-3" style={{ background: "rgba(5,7,15,0.82)", borderColor: WORLD_COLOR }}>
                <div className="text-[9.5px] font-bold tracking-[0.14em] uppercase" style={{ color: WORLD_COLOR }}>Hire-ready</div>
                <div className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Your resume is out there.</div>
              </div>
            </div>
          )}
        </div>

        {/* Progression controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStage((value) => Math.max(0, value - 1))}
            disabled={stage === 0}
            className="cursor-pointer rounded-full border px-4 py-2 text-[12px] font-bold disabled:cursor-default disabled:opacity-30"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Back
          </button>
          {last ? (
            <a href="/flow" className="rounded-full px-5 py-2 text-[12px] font-bold" style={{ background: WORLD_COLOR, color: "#05070f" }}>
              Start your story
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setStage((value) => Math.min(STAGES.length - 1, value + 1))}
              className="cursor-pointer rounded-full px-5 py-2 text-[12px] font-bold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </ChapterShell>
  );
}
