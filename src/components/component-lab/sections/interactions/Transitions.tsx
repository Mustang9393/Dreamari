"use client";

// DEMO-ONLY: Interactions section, "Transitions and animations". Page/step
// transitions and cross-fades that don't already have a home elsewhere in
// the lab, each with its real duration/easing (read from app.css/globals.css
// or the component's own className) in MONO, a Replay button, and its
// reduced-motion behaviour. The named micro-interaction components
// (SparkBar, ConfirmShimmer, PlayBurst, Confetti, the dm-* nudges,
// BorderBeam/HoverBeam) already have live Replay demos in Feedback and
// Foundations -- the "Timing reference" specimen below pulls their real
// numbers into one place instead of re-building duplicate demos.

import type { CSSProperties, ReactNode } from "react";
import { StepTransition } from "@/components/flow/StepTransition";
import { SubHead, Specimen, StateGrid, StateCell } from "../../kit";
import { Replayable, DurationTag } from "./shared";

const MUTED: CSSProperties = { color: "var(--muted-foreground)" };

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      {children}
    </span>
  );
}

export function TransitionsGroup() {
  return (
    <>
      <SubHead>Transitions and animations</SubHead>

      <Specimen name="StepTransition" file="src/components/flow/StepTransition.tsx" purpose="Wraps every Build step's content -- a soft rise-and-fade so each new question doesn't just snap into place." when="Any step change inside the Build flow.">
        <StateGrid min={220}>
          <StateCell label="Step change" note="Reduced motion: motion-safe:animate-[...] -- the step simply appears with no entrance, nothing to fall back to.">
            <Replayable>
              {(n) => (
                <StepTransition key={n}>
                  <Chip>Question 4 of 8</Chip>
                </StepTransition>
              )}
            </Replayable>
          </StateCell>
          <StateCell label="Timing" minH={80}>
            <DurationTag duration="0.4s" easing="ease-out" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="fade-slide-up" file="globals.css (@keyframes fade-slide-up)" purpose="The app's shared entrance keyframe -- opacity 0 to 1, translateY(8px) to 0 -- reused with a different duration per call site (Toast, tooltips, banners, the build flow's step chrome)." when="Any small surface that should announce itself arriving, not just appear.">
        <StateGrid min={220}>
          <StateCell label="Toast's own timing" note="Exact class from src/components/app/Toast.tsx: motion-safe:animate-[fade-slide-up_0.25s_ease-out_both].">
            <Replayable>
              {(n) => (
                <div key={n} className="motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]">
                  <Chip>Added to your Top 3</Chip>
                </div>
              )}
            </Replayable>
          </StateCell>
          <StateCell label="Timing (Toast)" minH={80}>
            <DurationTag duration="0.25s" easing="ease-out" />
          </StateCell>
          <StateCell label="Staggered use" note="The same keyframe drives seq-reveal's 50ms-apart cascade -- already live with a Replay in Foundations → Motion and nudge utilities, at 0.32s cubic-bezier(0.16, 1, 0.3, 1) per child. Not repeated here.">
            <p className="text-center text-[12.5px]" style={MUTED}>
              See Foundations → Motion and nudge utilities → &quot;Staggered reveal&quot;.
            </p>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="filters-reveal" file="src/components/app/app.css" purpose="The filter row sliding in under an expanding search field." when="Explore's search-to-filters expansion.">
        <StateGrid min={220}>
          <StateCell label="Reveal">
            <Replayable>
              {(n) => (
                <div key={n} className="filters-reveal flex gap-[8px]">
                  <Chip>Recommended</Chip>
                  <Chip>A–Z</Chip>
                  <Chip>Salary</Chip>
                </div>
              )}
            </Replayable>
          </StateCell>
          <StateCell label="Timing" note="Reduced motion: a dedicated (prefers-reduced-motion: reduce) rule sets animation: none -- the filters just appear." minH={80}>
            <DurationTag duration="0.32s" easing="cubic-bezier(0.22, 1, 0.36, 1)" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="face-swap" file="src/components/app/app.css" purpose="Career Detail's Summary/Details panel changing face -- a real horizontal drag (Framer Motion drag=&quot;x&quot;, dragElastic 0.22, dragSnapToOrigin) commits past a pixel threshold, then this class fades/slides the new face in." when="Career Detail's Summary ↔ Details swap, by drag, tap or the chevrons.">
        <StateGrid min={220}>
          <StateCell label="Swap">
            <Replayable>
              {(n) => (
                <div key={n} className="face-swap">
                  <Chip>School &amp; Path</Chip>
                </div>
              )}
            </Replayable>
          </StateCell>
          <StateCell label="Timing" note="Reduced motion: its own (prefers-reduced-motion: reduce) rule sets animation: none. Try the real drag at /career/software-engineer." minH={80}>
            <DurationTag duration="0.26s" easing="cubic-bezier(0.22, 1, 0.36, 1)" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="tab-hint-nudge" file="src/components/app/app.css (.tab-hint)" purpose="A one-shot underline that glides across a card's own section tabs on mount, teaching “these are tabs” wordlessly, then the real active underline takes over." when="A focused route card's tabs on first mount (Profile's tab row).">
        <StateGrid min={220}>
          <StateCell label="Glide">
            <Replayable>
              {(n) => (
                <div key={n} className="relative flex gap-[18px] border-b pb-[6px] text-[13px] font-bold" style={{ borderColor: "var(--border)" }}>
                  <span>Overview</span>
                  <span style={MUTED}>Top Three</span>
                  <span style={MUTED}>My Plan</span>
                  <span aria-hidden className="tab-hint" />
                </div>
              )}
            </Replayable>
          </StateCell>
          <StateCell label="Timing" note="Defined inside @media (prefers-reduced-motion: no-preference) -- under reduced motion the hint never runs at all, no fallback frame." minH={80}>
            <DurationTag duration="1.5s, runs once" easing="cubic-bezier(0.4, 0, 0.2, 1)" delay="0.2s" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="env-slow-zoom" file="src/components/app/app.css (.env-zoom-active img)" purpose="A slow Ken Burns push-in on the For You reel's active card photo -- the one place in the app with an 18-second animation, deliberately calm rather than a quick UI transition." when="The active card in Explore's For You reel.">
        <StateGrid min={220}>
          <StateCell label="Push-in (18s, watch the corners)" minH={140}>
            <Replayable>
              {(n) => (
                <div key={n} className="env-zoom-active relative h-[120px] w-full overflow-hidden rounded-[var(--radius-md)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a real poster asset, sized purely to
                      demonstrate the CSS transform; no next/image config benefit for a one-off lab crop. */}
                  <img src="/images/app/poster-investment-banking-v3.webp" alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </Replayable>
          </StateCell>
          <StateCell label="Timing" note="Reduced motion: its own (prefers-reduced-motion: reduce) rule sets animation: none -- the photo holds its resting 1.03 scale." minH={80}>
            <DurationTag duration="18s, plays once" easing="cubic-bezier(0.25, 0.1, 0.25, 1)" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Timing reference: micro-interactions shown elsewhere" file="various" purpose="The real numbers behind the app's other one-shot celebration/confirmation moments, gathered here so every animation's timing lives in one place -- each already has its own live Replay demo, not repeated." when="Reference only.">
        <StateGrid min={220}>
          <StateCell label="SparkBar: gain spark" note="Feedback → SparkBar → &quot;Gain spark&quot;.">
            <DurationTag duration="700ms" easing="ease-out (Web Animations API)" />
          </StateCell>
          <StateCell label="ConfirmShimmer: sweep" note="Foundations → Motion and decor components → ConfirmShimmer.">
            <DurationTag duration="0.5s" easing="ease-out" />
          </StateCell>
          <StateCell label="PlayBurst: flash + particles" note="Foundations → Motion and decor components → PlayBurst.">
            <DurationTag duration="flash 0.5s · particles 0.65–0.92s" easing="cubic-bezier(0.16, 1, 0.3, 1)" />
          </StateCell>
          <StateCell label="Confetti" note="Foundations → Motion and decor components → Confetti. Not a CSS animation -- a real-time canvas physics loop (gravity 0.16, drag 0.985 per 60fps-equivalent step), so there is no single duration: it runs until every particle's life reaches 0.">
            <DurationTag duration="~2–3s (physics-driven)" easing="n/a — canvas simulation" />
          </StateCell>
          <StateCell label="dm-text-nudge" note="Foundations → Motion and nudge utilities → &quot;Sweeping label&quot;.">
            <DurationTag duration="3s, loops" easing="ease-in-out" delay="0.9s" />
          </StateCell>
          <StateCell label="HoverBeam / BorderBeam" note="Foundations → Motion and decor components → HoverBeam. Duration is a prop, not a fixed CSS value -- 3.5s is the shared card-hover default; NextStepBanner's own beam runs faster (1.8s priority / 3.2s quiet).">
            <DurationTag duration="3.5s per lap (default)" easing="set by the border-beam package" />
          </StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
