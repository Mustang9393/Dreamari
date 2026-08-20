"use client";

import Image from "next/image";
import { useState } from "react";
import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

// The loop-closer, per direct founder feedback: the five chapters explain the
// experience but never show what it all LEADS to, so the page felt like it
// ended with "figure it out from there." This is one section, one frame, and
// a Next button — each press swaps the next stage into the SAME position, in
// the order a student actually lives it: Top 3 -> Plan -> Resume -> hired.
// Deliberately not four stacked blocks (called out as the wrong shape).
const WORLD_COLOR = "var(--world-arts-media-sport)";

const STAGES = [
  {
    id: "top3",
    kicker: "Prep to get hired",
    label: "My Top 3",
    line: "Narrow your options to a Top 3 and start planning your future.",
  },
  {
    id: "plan",
    kicker: "Prep to get hired",
    label: "My Plan",
    line: "Lock in one and we keep you accountable with a plan that makes you a real candidate.",
  },
  {
    id: "resume",
    kicker: "Prep to get hired",
    label: "Resume Fixer",
    line: "Turn everything you did here into a resume and send it to employers.",
  },
  {
    id: "hired",
    kicker: "Get hired!",
    label: "The offer",
    line: "Students leave with offers. Partners meet talent that already proved itself.",
  },
] as const;

// Reuses the Match deck's real career photos — no new assets invented.
const TOP3 = [
  { title: "Investment Banking", photo: "/images/career-investment-banking-2.jpg" },
  { title: "UX Designer", photo: "/images/career-ux-designer.jpg" },
  { title: "Project Manager", photo: "/images/career-project-manager.jpg" },
];

const PLAN_TASKS = [
  { label: "Finish the IB simulator", done: true },
  { label: "Reach Finance Glossary Lv 4", done: true },
  { label: "Draft your resume · 15 min", done: false },
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
      oneliner="The loop closes: a Top 3, one plan, one resume, one offer."
      flip
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="w-full max-w-[480px] rounded-[24px] border p-5 sm:p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Stage header: where you are in the progression */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: stage === 3 ? WORLD_COLOR : "var(--primary-tint)" }}>{current.kicker}</div>
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

        <p className="mt-1 min-h-[36px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{current.line}</p>

        {/* The stage window: fixed height, content swaps in place */}
        <div key={current.id} className="mkt-stage mt-3 flex h-[248px] flex-col justify-center sm:h-[268px]">
          {stage === 0 && (
            <div className="grid h-full grid-cols-3 gap-2">
              {TOP3.map((card, index) => (
                <div key={card.title} className="relative overflow-hidden rounded-[14px] border-2" style={{ borderColor: index === 0 ? "var(--primary)" : "var(--border)", opacity: index === 0 ? 1 : 0.8 }}>
                  <Image src={card.photo} alt="" fill sizes="150px" className="object-cover" />
                  <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold" style={{ background: "rgba(5,7,15,0.75)", color: "var(--foreground)" }}>{index + 1}</span>
                  {index === 0 && <span className="absolute top-1.5 right-1.5 rounded-full px-[6px] py-[1px] text-[7.5px] font-bold tracking-[0.5px] uppercase" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Focus</span>}
                  <span className="absolute inset-x-0 bottom-0 px-1.5 pt-6 pb-2 text-center text-[10.5px] leading-[13px] font-bold uppercase" style={{ backgroundImage: "linear-gradient(transparent, rgba(5,7,15,0.9))", color: "var(--foreground)" }}>{card.title}</span>
                </div>
              ))}
            </div>
          )}

          {stage === 1 && (
            <div className="flex h-full flex-col justify-center gap-2">
              <div className="flex items-center justify-between rounded-[12px] px-3 py-2" style={{ background: "var(--glass-surface-1)" }}>
                <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>Investment Banking · University route</span>
                <span className="text-[11px] font-bold" style={{ color: WORLD_COLOR }}>2/7 done</span>
              </div>
              {PLAN_TASKS.map((task) => (
                <div key={task.label} className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5" style={{ background: "var(--glass-surface-1)", opacity: task.done ? 0.65 : 1 }}>
                  <span className="flex size-4.5 flex-none items-center justify-center rounded-[5px] border text-[10px]" style={{ background: task.done ? "var(--color-feedback-success, #33c78c)" : "transparent", borderColor: task.done ? "transparent" : "var(--border)", color: "#05070f" }}>{task.done ? "✓" : ""}</span>
                  <span className={`text-[12.5px] font-semibold ${task.done ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>{task.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-[12px] border border-dashed px-3 py-2 text-[11px] font-semibold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                Next 6 Months unlocks at 40%
              </div>
            </div>
          )}

          {stage === 2 && (
            <div className="flex h-full items-center gap-3">
              <div className="flex h-full flex-1 flex-col gap-2 rounded-[14px] border p-3.5" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
                <span className="text-[13px] font-extrabold" style={{ color: "var(--foreground)" }}>Jordan Rivera</span>
                <span className="h-[6px] w-3/4 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="h-[6px] w-2/3 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="mt-1 h-[6px] w-full rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="h-[6px] w-5/6 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="mt-auto w-fit rounded-full px-2 py-[3px] text-[9.5px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary-tint)" }}>+ Add your sim wins</span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold" style={{ background: "color-mix(in srgb, var(--color-feedback-success, #33c78c) 20%, transparent)", color: "var(--color-feedback-success, #33c78c)" }}>Verified: IB sim finished 2x</span>
                <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold" style={{ background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>Stronger verb suggested</span>
                <span className="mt-1 rounded-[12px] px-3 py-2.5 text-center text-[12px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Send to 3 employers</span>
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="relative h-full overflow-hidden rounded-[14px] border" style={{ borderColor: "var(--border)" }}>
              {/* TODO(asset): swap for the real career-fair handshake photo when
                  supplied — the sketch calls for a student shaking hands with a
                  recruiter. Stand-in from the existing photo set until then. */}
              <Image src="/images/career-chief-executive.jpg" alt="" fill sizes="480px" className="object-cover object-[center_30%]" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 30%, rgba(5,7,15,0.9))" }} />
              <div className="mkt-offer absolute inset-x-3 bottom-3 rounded-[14px] border p-3" style={{ background: "rgba(5,7,15,0.82)", borderColor: WORLD_COLOR }}>
                <div className="text-[9.5px] font-bold tracking-[0.14em] uppercase" style={{ color: WORLD_COLOR }}>Offer letter</div>
                <div className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Analyst · Investment Banking</div>
                <div className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Partners hire students who already proved it here.</div>
              </div>
            </div>
          )}
        </div>

        {/* Progression controls: one loop, one direction, always visible */}
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
