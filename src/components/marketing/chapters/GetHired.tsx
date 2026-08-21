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

// Each stage: clear title + one-sentence explanation with a visible
// outcome (per direct feedback — the story, not just product pieces).
const STAGES = [
  { id: "top3", label: "My Top 3", line: "Save your top 3 career paths to compare your best-fit options." },
  { id: "plan", label: "My Plan", line: "Choose one path and get a step-by-step plan with actions, milestones, and experiences to build toward it." },
  { id: "resume", label: "Resume Builder", line: "Turn your experiences, skills, and activities into a polished resume you can share with employers." },
  { id: "hired", label: "Hire-Ready", line: "Use your plan and resume to become opportunity-ready for internships, mentors, and future employers." },
] as const;

// Existing landing photos; titles set in each world's approved poster face
// (Viaoda / Nunito / Lora), so the trio shows the design system's range.
const TOP3 = [
  { title: "Investment Banking", world: "Business & Money", photo: "/images/app/poster-investment-banking.png" },
  { title: "Airline Pilot", world: "Driving, Flying & Shipping", photo: "/images/app/poster-airline-pilot-alt.png" },
  { title: "Food Scientist", world: "Farming, Animals & Nature", photo: "/images/app/poster-food-scientist.png" },
];

// Mixed like the product's real plans: in-app reps AND real-world moves.
// The DECA step completed here is the DECA line on the resume one stage
// later - the loop inside the loop.
const PLAN_TASKS = [
  { label: "Complete the finance glossary game", meta: "10 min", done: true },
  { label: "Join your school's DECA chapter", meta: "IRL", done: true },
  { label: "Email a local bank about job shadowing", meta: "IRL", done: false },
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
      oneliner="Narrow your path. Build a plan. Strengthen your resume. Get career-ready."
      centered
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="w-full max-w-[480px] rounded-[24px] border p-6 sm:p-7" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Stage header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{current.label}</div>
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

        <p className="mt-[6px] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{current.line}</p>

        {/* The stage window: fixed height, content swaps in place */}
        <div key={current.id} className="mkt-stage mt-5 flex h-[280px] flex-col justify-center sm:h-[300px]">
          {stage === 0 && (
            <div className="relative flex h-full items-center justify-center">
              {/* Stack, no tilt: the focus pick BIG and front, 2 and 3 straight
                 behind, peeking from the sides. Sized to fill the window and
                 allowed to overflow it a little rather than float tiny. */}
              {TOP3.map((card, index) => {
                const pose = [
                  { x: 0, scale: 1, z: 3, o: 1 },
                  { x: -100, scale: 0.82, z: 1, o: 0.5 },
                  { x: 100, scale: 0.82, z: 2, o: 0.5 },
                ][index];
                return (
                  <div
                    key={card.title}
                    className="absolute aspect-[148/210] w-[clamp(180px,62%,212px)] overflow-hidden rounded-[16px] border-2 text-center uppercase"
                    style={{ borderColor: index === 0 ? "var(--primary)" : "var(--border)", transform: `translateX(${pose.x}px) scale(${pose.scale})`, zIndex: pose.z, opacity: pose.o }}
                  >
                    <Image src={card.photo} alt="" fill sizes="160px" className="object-cover" />
                    <span className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold" style={{ background: "var(--glass-surface-3)", color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{index + 1}</span>
                    {index === 0 && <span className="absolute top-2 right-2 rounded-full px-[7px] py-[2px] text-[7.5px] font-bold tracking-[0.5px]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>FOCUS</span>}
                    <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[3px] px-1.5 pt-8 pb-2.5" style={{ backgroundImage: TEXT_SCRIM }}>
                      <span className="w-full text-[15px] leading-[17px]" style={{ ...posterTitleFont(card.world), color: "var(--foreground)" }}>{card.title}</span>
                      <span className="w-full text-[8px] leading-[11px] font-semibold tracking-[0.5px]" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[card.world] }}>{card.world}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {stage === 1 && (
            <div className="flex h-full flex-col justify-center">
              {/* Editorial level header: caption, display title, progress ring.
                 Everything sized to FILL the window — same content, no voids. */}
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--glass-border)" }}>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: WORLD_COLOR }}>Level 1 · Foundation</span>
                  <span className="text-[23px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Next 3 Months</span>
                </span>
                <MatchRing score={50} size={46} />
              </div>
              {/* Hairline task list: check circles, quiet strikeouts, minutes right */}
              {PLAN_TASKS.map((task, index) => (
                <div key={task.label} className={`flex flex-1 items-center gap-3.5 ${index < PLAN_TASKS.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                  <span className="flex size-[22px] flex-none items-center justify-center rounded-full text-[12px] font-bold" style={task.done ? { background: "var(--color-feedback-success, #33c78c)", color: "#05070f" } : { border: "1.5px solid var(--border)", color: "transparent" }}>{task.done ? "✓" : ""}</span>
                  <span className={`min-w-0 flex-1 text-[14px] leading-[18px] font-semibold line-clamp-2 ${task.done ? "line-through" : ""}`} style={{ color: task.done ? "var(--muted-foreground)" : "var(--foreground)", textDecorationColor: "color-mix(in srgb, var(--muted-foreground) 60%, transparent)" }}>{task.label}</span>
                  <span className="flex-none text-[10px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--muted-foreground)" }}>{task.meta}</span>
                </div>
              ))}
            </div>
          )}

          {stage === 2 && (
            <div className="relative h-full">
              {/* Conceptual, deliberately unfinished: the sheet fades out at the
                 bottom so it reads as "there's more," never as THE template. */}
              <div className="flex h-full flex-col gap-0 overflow-hidden rounded-[14px] border p-4" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)", maskImage: "linear-gradient(#000 62%, transparent 99%)", WebkitMaskImage: "linear-gradient(#000 62%, transparent 99%)" }}>
                <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Jordan Rivera</span>
                  <span className="text-[8.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Class of 2027</span>
                </div>
                <div className="flex flex-col gap-[5px] border-b py-2.5" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="text-[8.5px] font-bold tracking-[0.1em] uppercase" style={{ color: WORLD_COLOR }}>Experience</span>
                  <span className="flex items-baseline justify-between gap-2 text-[11px] leading-[14px]">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>Volunteer tutor · City Library</span>
                    <span className="flex-none font-bold" style={{ color: "var(--muted-foreground)" }}>120 hrs</span>
                  </span>
                  <span className="flex items-baseline justify-between gap-2 text-[11px] leading-[14px]">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>Camp counselor · YMCA</span>
                    <span className="flex-none font-bold" style={{ color: "var(--muted-foreground)" }}>Summer</span>
                  </span>
                </div>
                <div className="flex flex-col gap-[5px] py-2.5">
                  <span className="text-[8.5px] font-bold tracking-[0.1em] uppercase" style={{ color: WORLD_COLOR }}>Clubs and leadership</span>
                  <span className="flex items-baseline justify-between gap-2 text-[11px] leading-[14px]">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>DECA · Treasurer</span>
                    <span className="flex-none font-bold" style={{ color: "var(--muted-foreground)" }}>2 yrs</span>
                  </span>
                  <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Robotics Club</span>
                </div>
                {/* The trailing edge: hinted, half-faded structure — reads as
                   "there's more of you on this page," never as a finished template */}
                <span className="text-[8.5px] font-bold tracking-[0.1em] uppercase" style={{ color: WORLD_COLOR }}>Skills</span>
                <span className="mt-[6px] h-[6px] w-2/3 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="mt-[5px] h-[6px] w-1/2 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="mt-[10px] text-[8.5px] font-bold tracking-[0.1em] uppercase" style={{ color: WORLD_COLOR }}>Awards</span>
                <span className="mt-[6px] h-[6px] w-3/5 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
                <span className="mt-[5px] h-[6px] w-3/4 rounded-full" style={{ background: "var(--glass-surface-2)" }} />
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="relative h-full overflow-hidden rounded-[14px] border" style={{ borderColor: "var(--border)" }}>
              {/* TODO(asset): swap for the rights-cleared career-fair handshake
                  photo when supplied. Stand-in from the existing set until then. */}
              <Image src="/images/career-operations.jpg" alt="" fill sizes="480px" className="object-cover object-[center_30%]" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 30%, rgba(5,7,15,0.9))" }} />
              <div className="mkt-offer absolute inset-x-3 bottom-3 rounded-[14px] border p-3" style={{ background: "rgba(5,7,15,0.82)", borderColor: WORLD_COLOR }}>
                <div className="text-[9.5px] font-bold tracking-[0.14em] uppercase" style={{ color: WORLD_COLOR }}>Hire-ready</div>
                <div className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Your resume, ready to send.</div>
              </div>
            </div>
          )}
        </div>

        {/* Progression controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStage((value) => Math.max(0, value - 1))}
            disabled={stage === 0}
            className="cursor-pointer rounded-full border px-4 py-2 text-[12px] font-bold disabled:cursor-default disabled:opacity-30"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Back
          </button>
          {last ? null : (
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
