"use client";

import { type ReactNode, type RefObject } from "react";
import { useRevealOnScroll } from "./scrollHooks";

type ChapterShellProps = {
  id: string;
  title: string;
  color: string;
  oneliner: string;
  flip?: boolean;
  // Build and Connect are content-driven (a short question, a post + a few comments) —
  // not card-driven like Match/Explore/Play, which need the full-height frame so their
  // photo cards can be genuinely big. Forcing Build/Connect's much shorter content into
  // that same tall frame left a large dead gap: the frame itself is min-h-dvh tall
  // regardless of content, so scrolling past a chapter whose content doesn't fill it
  // meant scrolling through mostly-empty space before the next chapter's snap point.
  // compact caps the frame at content-appropriate height instead.
  compact?: boolean;
  graphicRef: RefObject<HTMLDivElement | null>;
  playing: boolean;
  graphicRevealed: boolean;
  children: ReactNode;
};

export function ChapterShell({
  id,
  title,
  color,
  oneliner,
  flip = false,
  compact = false,
  graphicRef,
  playing,
  graphicRevealed,
  children,
}: ChapterShellProps) {
  const [copyRef, copyRevealed] = useRevealOnScroll<HTMLDivElement>();

  return (
    // compact sections don't claim a full min-h-dvh at all — Build/Connect's content
    // is meaningfully shorter than Match/Explore/Play's big cards, and they now hug
    // their own content height (see the frame's height below) rather than being
    // forced to fill a fixed viewport-height section. The section's own vertical
    // padding (below) provides the breathing room instead of a min-height guess. A
    // shorter section still snaps correctly (scroll-snap doesn't require uniform
    // heights).
    //
    // No per-chapter background override (there used to be one, alternating chapters
    // between the page background and var(--card)) — every chapter now shares the same
    // background so the boundary between two sections never reads as a hard seam.
    <section id={id} className={`relative flex items-center ${compact ? "" : "min-h-dvh"}`} style={{ scrollSnapAlign: "start" }}>
      {/* Reference is desktop-first here: .chapter-row is a row by default and only
          switches to a stacked column below 900px (not Tailwind's 768px md: tier,
          which left a 768-899px gap where content was force-fit into a row it didn't
          have room for). */}
      {/* Tighter gap/padding on mobile (was gap-10/py-8 at every width below 901px) so
         the stacked copy+graphic column doesn't run all the way to the bottom edge —
         iOS Safari's floating compact-tab-bar "chip" sits on top of that edge and was
         overlapping the bottom-most content (e.g. Match's like/pass buttons). The
         extra max-[640px] bottom padding adds real safe-area room on phones
         specifically; sm:/lg: (tablet and up) keep their own larger padding
         untouched since the chip issue is a phone-only concern. */}
      <div
        className={`mx-auto flex w-full max-w-[1200px] items-center gap-6 px-6 pt-6 pb-6 max-[900px]:flex-col max-[640px]:pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pt-10 sm:pb-10 min-[901px]:gap-[60px] lg:pt-14 lg:pb-14 ${flip ? "flex-row-reverse" : "flex-row"}`}
        style={{ ["--c" as string]: color }}
      >
        <div
          ref={copyRef}
          className="flex-none text-center transition-all duration-700 ease-out min-[901px]:max-w-[360px] min-[901px]:flex-[0_0_320px] min-[901px]:text-left"
          style={{
            opacity: copyRevealed ? 1 : 0,
            transform: copyRevealed ? "translateX(0)" : `translateX(${flip ? "42px" : "-42px"})`,
          }}
        >
          <h2
            className="font-extrabold uppercase"
            style={{
              // Ceiling is 4.6rem, NOT higher — this was briefly bumped to 5.2rem for
              // "text should scale with screen size" and it broke CONNECT/EXPLORE on
              // wide laptops: background-clip:text only paints gradient inside the
              // element's own box, this copy column caps at 360px, and at 5.2rem the
              // longer titles overflow that box — glyphs past the edge get NO
              // background, i.e. they turn invisible ("CONNEC" with half a T). Any
              // future size increase here must also widen the column, or the tail of
              // the longest title vanishes on exactly the screens the increase was
              // meant to help.
              fontSize: "clamp(2.6rem, 6vw, 4.6rem)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, var(--c), var(--foreground) 130%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </h2>
          <p className="mt-2 text-[clamp(18px,1vw+13px,23px)] leading-snug" style={{ color: "var(--muted-foreground)" }}>
            {oneliner}
          </p>
        </div>

        <div
          ref={graphicRef}
          data-playing={playing}
          className="mkt-graphic relative flex min-h-[clamp(240px,40cqw,440px)] min-w-0 flex-1 items-center justify-center transition-all delay-[120ms] duration-700 ease-out max-[900px]:w-full"
          style={{
            opacity: graphicRevealed ? 1 : 0,
            transform: graphicRevealed ? "translateX(0)" : `translateX(${flip ? "-42px" : "42px"})`,
            ["--c" as string]: color,
          }}
        >
          {/* Reference's .mock-glow: a soft blurred tint behind the graphic. A shrink-
             to-content wrapper (inline-flex) broke here: several chapters' own content
             (Build's tag stack, Play's scene, Connect's thread) is itself `w-full`,
             which needs a parent with a REAL established width to resolve against —
             inline-flex has none (it sizes FROM its content), so `w-full` collapsed to
             0 the moment the row stacked into a column on mobile/tablet. Fixed-size and
             centered instead of shrink-wrapped, so it never participates in that sizing
             loop regardless of what a given chapter's content does. */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[min(70%,340px)] w-[min(70%,340px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[36px]"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--c) 30%, transparent), transparent 72%)" }}
          />
          {/* Shared frame every chapter's own content sizes itself to fill or center
              within, so all five graphics read as the same scale of thing rather than
              each chapter picking its own size. Generous by default (this is the
              *ceiling*, not a target to shrink to) - only a genuinely short viewport
              should ever actually hit the dvh cap; on a normal phone/laptop screen this
              should just give every chapter plenty of room to be big.

              mkt-graphic-scale (a second, nested container-query context, not just the
              outer .mkt-graphic's) is the fix for text that ballooned way past the H2
              title/oneliner in width: this frame's own width is capped at 480px, but
              the OUTER .mkt-graphic wrapper it sits in can be much wider on a big
              desktop screen (it's a flex-1 column, not capped) - every chapter's
              --mu was reading cqw off that wider, uncapped outer box, so on a big
              screen font sizes scaled as if the card were ~700-800px wide when the
              card actually rendered at its 480px ceiling the whole time. A container
              only ever resolves cqw against an ANCESTOR (never itself), so nesting a
              second container-type here, sized off this already-capped frame, gives
              every chapter's inner text a --mu that maxes out around 1.5 (480/320)
              instead of 2.3, matching the frame's real size on any viewport. */}
          {/* compact: the frame HUGS its content (height: auto, capped only as a
             safety net) instead of imposing a fixed height content must fit under.
             The fixed-height version was the actual bug behind "Connect crops on
             desktop but not mobile": --mu scales off the frame's WIDTH, which caps at
             the same ~480px/mu~1.5 on both, but a fixed dvh-based HEIGHT doesn't grow
             to match that bigger text — so the same 2-3 replies that fit fine at
             mobile's smaller mu could outgrow a fixed ceiling at desktop's larger one.
             Auto-height means content is never squeezed to fit a pre-picked number;
             the frame just becomes exactly as tall as Build's question or Connect's
             card actually needs, on any viewport. */}
          <div
            // A prior attempt raised these ceilings (640/860/780px) to make content
            // "scale with screen size" on large monitors — reverted per direct
            // feedback: mu-scaled elements that aren't part of the card itself (Match's
            // like/pass buttons, Build's padding/font sizes) grew out of proportion
            // with the actual card, since the card's own rendered size is bounded by
            // its aspect-ratio + the frame's HEIGHT, while --mu tracks the frame's
            // WIDTH — the two don't scale at the same rate once the ceiling moves, and
            // the card (which should be the dominant, most prominent element in every
            // chapter) ended up looking small relative to its own UI chrome. Back to
            // the original values, which keep that proportion correct.
            className="mkt-graphic-scale relative z-[1] flex items-center justify-center"
            style={{
              width: "min(94cqw, 480px)",
              height: compact ? "auto" : "min(74dvh, 680px)",
              maxHeight: compact ? "min(72dvh, 620px)" : undefined,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
