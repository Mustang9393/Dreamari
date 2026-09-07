"use client";

import Image from "next/image";
import { useState } from "react";
import { posterTitleFont } from "@/components/app/worlds";
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
  { id: "top3", label: "My Top 3", line: "Save your top 3 career paths and compare which one fits you best." },
  // Shortened copy (Joshua Pierce, Slack, 6 Sept 2026): the visual does the
  // explaining, the line names the outcome once.
  { id: "plan", label: "My Plan", line: "Turn your career goal into clear next steps." },
  { id: "resume", label: "Resume Builder", line: "Turn your experiences into a resume ready for employers." },
  { id: "hired", label: "Hire-Ready", line: "Get ready for internships, mentors, and future employers." },
] as const;

// Text-only comparison cards (per direct feedback): no photos, no match
// scores — the valuable stuff, side by side. Figures are the founder-supplied
// card content, verbatim. Titles still wear each world's approved poster face.
const TOP3 = [
  { title: "Investment Banking", world: "Business & Money", duration: "4 yrs", cost: "$150K+", salary: "$361K/year" },
  { title: "Accountant", world: "Business & Money", duration: "4 yrs", cost: "$55K+", salary: "$81K/year" },
  { title: "Video Game Designer", world: "Tech & Engineering", duration: "4 yrs", cost: "$130K+", salary: "$98K/year" },
];

// Founder-supplied plan copy, verbatim (Joshua Pierce, Slack, 6 Sept 2026).
// The four steps are the product's own loop: Explore, Play, Connect, then a
// real-world conversation. No career eyebrow, no percentage ring, no
// where-it-happens chips: header, subheader, body, nothing else.
const PLAN_TASKS = [
  { label: "Explore careers and save your Top 3", done: true },
  { label: "Play a career simulation", done: true },
  { label: "Ask a professional a career question", done: false },
  { label: "Meet with your counselor", done: false },
];

export function GetHiredChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();
  const [stage, setStage] = useState(0);
  const current = STAGES[stage];
  const last = stage === STAGES.length - 1;

  return (
    <ChapterShell
      // Get Hired keeps its cue: "You're ready" and the footer sit below it,
      // and without one the previous chapter's cue was the only one in sight
      // on tablets (direct feedback, 4 Sept 2026).
      id="get-hired"
      title="Get hired"
      color={WORLD_COLOR}
      oneliner="Narrow your path. Build a plan. Strengthen your resume. Get career-ready."
      centered
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="w-full max-w-[480px] rounded-[24px] border p-5 sm:p-7" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
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
        <div key={current.id} className="mkt-stage mt-4 flex h-[248px] flex-col justify-center sm:mt-5 sm:h-[300px]">
          {stage === 0 && (
            <div className="relative flex h-full items-center justify-center">
              {/* Same stack the photo cards had — focus pick BIG and front,
                 2 and 3 straight behind peeking from the sides (allowed to
                 overflow the panel edges a little) — but the photo area now
                 holds the comparison: University duration / Cost / Median
                 Salary, identical row structure on every card. */}
              {TOP3.map((card, index) => {
                /* side offset is min(160px, 30vw): full spread on desktop
                   (edges just past the panel), scaled down on phones so the
                   peeking cards stay on-screen */
                /* the side cards stay inside the panel (they used to spill
                   past its rounded edges) and scale from their top edge, so
                   all three tops line up and the two behind simply end
                   higher, the way cards tucked behind one would (direct
                   feedback, 7 Sept 2026) */
                const pose = [
                  { x: "0px", scale: 1, z: 3, o: 1 },
                  { x: "calc(-1 * min(118px, 24vw))", scale: 0.82, z: 1, o: 0.55 },
                  { x: "min(118px, 24vw)", scale: 0.82, z: 2, o: 0.55 },
                ][index];
                return (
                  <div
                    key={card.title}
                    /* the right-hand card mirrors its text to the outer edge —
                       otherwise the focus card overlaps the start of its title */
                    className={`absolute flex aspect-[148/200] w-[clamp(180px,62%,212px)] flex-col rounded-[16px] border-2 px-3.5 py-3 ${index === 2 ? "text-right" : ""}`}
                    style={{
                      borderColor: index === 0 ? "var(--primary)" : "var(--border)",
                      /* opaque base under the glass tint so the focus card
                         fully occludes the cards tucked behind it */
                      background: "linear-gradient(var(--glass-surface-1), var(--glass-surface-1)), var(--background)",
                      transform: `translateX(${pose.x}) scale(${pose.scale})`,
                      transformOrigin: "top center",
                      zIndex: pose.z,
                      opacity: pose.o,
                    }}
                  >
                    <div className={`flex w-full items-center ${index === 2 ? "justify-end" : "justify-between"}`}>
                      {/* No FOCUS pill and no industry line (per notes, 5 Sept):
                         the lead card reads as chosen by its blue border and
                         blue rank badge alone */}
                      <span className="flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold" style={{ background: index === 0 ? "var(--primary)" : "var(--glass-surface-3)", color: index === 0 ? "var(--primary-foreground)" : "var(--foreground)", fontFamily: "var(--font-display)" }}>{index + 1}</span>
                    </div>
                    {/* Fixed-height title zone so every card's rows start on
                       the same line no matter how the title wraps */}
                    <div className="mt-2 flex h-[60px] w-full flex-col uppercase">
                      <span
                        /* focus title enlarged; side titles a step smaller.
                           The right card breaks one word per line, since line
                           STARTS are what the focus card overlaps. Poster
                           tracking is spec'd at 24px — scale it with the size
                           (em) so small titles don't inherit 24px gaps. */
                        className={`w-full leading-[1.15] [overflow-wrap:normal] [word-break:keep-all] ${index === 0 ? "text-[19px]" : "text-[15px]"}`}
                        style={{
                          ...posterTitleFont(card.world),
                          color: "var(--foreground)",
                          letterSpacing: card.world === "Tech & Engineering" ? "-0.04em" : "0.03em",
                          whiteSpace: index === 2 ? "pre-line" : undefined,
                        }}
                      >
                        {index === 2 ? card.title.replace(/ /g, "\n") : card.title}
                      </span>
                    </div>
                    {/* "University" used to sit above the rows as a yellow
                       subheading, which read as if the whole card were about
                       university. It is now part of the first row's label,
                       one line, same color and weight as the other labels. */}
                    <div className="border-t" style={{ borderColor: "var(--glass-border)" }} />
                    {[
                      { label: "University duration", value: card.duration },
                      { label: "Cost", value: card.cost },
                      { label: "Median salary", value: card.salary },
                    ].map((row) => (
                      <div key={row.label} className="flex flex-1 flex-col justify-center gap-[1px] border-b" style={{ borderColor: "var(--glass-border)" }}>
                        <span className="text-[7.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                        <span className="text-[14px] leading-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{row.value}</span>
                      </div>
                    ))}
                    <span className="pt-[7px] text-[10px] leading-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>+ more</span>
                  </div>
                );
              })}
            </div>
          )}

          {stage === 1 && (
            <div className="flex h-full flex-col justify-center">
              {/* Subheader and its one line of body, then the list. Three
                 sizes on the whole panel: the stage title above, this
                 subheader, and body text (direct feedback, 6 Sept 2026:
                 too many changes of size, weight and colour). */}
              <div className="flex flex-col gap-[2px] border-b pb-3" style={{ borderColor: "var(--glass-border)" }}>
                <span className="text-[17px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Next 3 Months</span>
                <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>2 of 4 complete</span>
              </div>
              {/* Hairline task list: check circles and quiet strikeouts */}
              {PLAN_TASKS.map((task, index) => (
                <div key={task.label} className={`flex flex-1 items-center gap-3 ${index < PLAN_TASKS.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                  <span className="flex size-[20px] flex-none items-center justify-center rounded-full text-[11px] font-bold" style={task.done ? { background: "var(--color-feedback-success, #33c78c)", color: "#05070f" } : { border: "1.5px solid var(--border)", color: "transparent" }}>{task.done ? "✓" : ""}</span>
                  <span className={`min-w-0 flex-1 text-[13px] leading-[18px] font-semibold line-clamp-1 ${task.done ? "line-through" : ""}`} style={{ color: task.done ? "var(--muted-foreground)" : "var(--foreground)", textDecorationColor: "color-mix(in srgb, var(--muted-foreground) 60%, transparent)" }}>{task.label}</span>
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
                  {/* Two lines, no hours or seasons (direct feedback, 6 Sept 2026):
                     the section reads at a glance */}
                  <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Volunteer Tutor · City Library</span>
                  <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Camp Counselor · YMCA</span>
                </div>
                <div className="flex flex-col gap-[5px] py-2.5">
                  <span className="text-[8.5px] font-bold tracking-[0.1em] uppercase" style={{ color: WORLD_COLOR }}>Leadership</span>
                  <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--foreground)" }}>DECA · Treasurer</span>
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
              <Image src="/images/app/stage-hire-ready.png" alt="" fill sizes="480px" className="object-cover object-[center_30%]" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 30%, rgba(5,7,15,0.9))" }} />
              <div className="mkt-offer absolute inset-x-3 bottom-3 rounded-[14px] border p-3" style={{ background: "rgba(5,7,15,0.82)", borderColor: WORLD_COLOR }}>
                {/* no repeated HIRE-READY label inside the image: the stage
                   title above already says it (direct feedback, 6 Sept 2026) */}
                <div className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>Your resume is ready to send.</div>
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
