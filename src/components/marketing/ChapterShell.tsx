"use client";

import { type ReactNode, type RefObject } from "react";
import { GestureHint } from "@/components/flow/GestureHint";
import { useRevealOnScroll } from "./scrollHooks";

type ChapterShellProps = {
  id: string;
  /** Phones only: the small line above the title on the first chapter, standing
   *  in for the "How Dreamari works" header the phone pager has no page for. */
  eyebrow?: string;
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
  /** The small "scroll on" chevron at the chapter's foot on phones. Off for
   *  the last chapter, which has nothing to nudge toward. */
  nudge?: boolean;
  // Explore's browse rail wants a WIDER window (more cards visible at once)
  // without growing the cards: raises the frame's width ceiling. Card-deck
  // chapters must NOT use this — their --mu-scaled chrome is tuned to 480px.
  wide?: boolean;
  // Centered: copy stacked ABOVE the graphic, both centered — no side column
  // (per feedback the closing Get Hired chapter anchors the page centered
  // rather than continuing the zig-zag).
  centered?: boolean;
  graphicRef: RefObject<HTMLDivElement | null>;
  playing: boolean;
  graphicRevealed: boolean;
  children: ReactNode;
};

export function ChapterShell({
  id,
  eyebrow,
  title,
  color,
  oneliner,
  flip = false,
  compact = false,
  nudge = true,
  wide = false,
  centered = false,
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
    // scroll-mt-24: JS chapter advances (scrollIntoView) land the section 96px
    // below the true top, clearing the floating nav island's zone so a chapter
    // title can't end up hidden underneath it (reported on mobile for PLAY).
    // On phones every chapter fills the screen (direct feedback: one
    // chapter's contents on screen at a time, snapping one by one on the way
    // down); compact chapters only shrink to their content from md up.
    // Phones start the content 96px down (under the nav island's zone, the
    // same offset the snap lands on) instead of centring it, so a short
    // chapter does not open on a screen of empty space above its title.
    // Phones: every chapter is one screen (min-h-dvh, snap start), the copy and
    // graphic centred in it as a block, the scroll cue at the foot. The nav
    // island floats over the top 72px. Desktop keeps its row layout.
    <section id={id} className={`mkt-chapter relative flex flex-col pt-[72px] pb-0 md:flex-row md:items-center md:scroll-mt-24 md:pt-0 ${compact ? "min-h-dvh md:min-h-0" : "min-h-dvh"}`}>
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
      {/* Rail geometry (per direct feedback, with guide lines): two fixed
         480px columns spread to the page's outer rails. Every occupant —
         box or text — spans/anchors to its column's boundaries, so all
         sections share four exact vertical lines: outer-left, inner-left,
         inner-right, outer-right. Boxes' EDGES sit on the rails (glows may
         bleed); text starts on its column's start rail and wraps at its end
         rail. A flip swaps columns, never the geometry. */}
      <div
        // Phones: three rows, 1fr / graphic / 1fr, so the GRAPHIC sits at the
          // centre of the screen and the copy hangs directly above it (the cue
          // is the last row, at the foot). md and up keep the desktop grid.
          className={`mx-auto w-full max-w-[1200px] flex-1 items-center px-6 pt-2 pb-0 max-md:grid max-md:grid-cols-1 max-md:grid-rows-[minmax(min-content,1fr)_auto_minmax(0,1fr)] max-md:gap-0 sm:pt-10 sm:pb-10 lg:pt-14 lg:pb-14 ${
          centered ? "flex flex-col gap-8" : "grid grid-cols-1 gap-6 min-[901px]:grid-cols-[minmax(0,480px)_minmax(0,480px)] min-[901px]:justify-between min-[901px]:gap-10"
        }`}
        style={{ ["--c" as string]: color }}
      >
        <div
          ref={copyRef}
          className={`text-center transition-all duration-700 ease-out max-md:self-end max-md:pb-5 ${
            centered ? "max-w-[560px]" : `min-[901px]:w-full min-[901px]:text-left ${flip ? "min-[901px]:order-2" : ""}`
          }`}
          style={{
            opacity: copyRevealed ? 1 : 0,
            transform: copyRevealed ? "translate(0)" : centered ? "translateY(28px)" : `translateX(${flip ? "42px" : "-42px"})`,
          }}
        >
          {eyebrow && (
            <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase md:hidden" style={{ color: "var(--primary-tint)" }}>{eyebrow}</p>
          )}
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
          className={`mkt-graphic relative flex min-h-0 min-w-0 w-full items-center justify-center md:min-h-[clamp(240px,40cqw,440px)] transition-all delay-[120ms] duration-700 ease-out ${
            centered ? "" : flip ? "min-[901px]:order-1" : ""
          }`}
          style={{
            opacity: graphicRevealed ? 1 : 0,
            transform: graphicRevealed ? "translate(0)" : centered ? "translateY(28px)" : `translateX(${flip ? "-42px" : "42px"})`,
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
            // Phones (the pager): the frame is sized to what is left of the
            // screen under the nav, the copy and the scroll cue, so a chapter
            // is one screen where it fits. Compact chapters are NOT capped on
            // phones: a max-height on a centred flex frame made a taller card
            // spill upward into the copy (seen on an iPhone, Get Hired and
            // Connect). The first grid row also never shrinks below the copy,
            // so on a short phone the section grows instead of overlapping.
            className={`mkt-graphic-scale relative z-[1] flex items-center justify-center max-md:min-h-max [--frame-h:clamp(340px,calc(100dvh_-_380px),560px)] [--frame-max:none] md:[--frame-h:min(74dvh,680px)] md:[--frame-max:min(72dvh,620px)] ${wide ? "mkt-wide" : ""}`}
            style={{
              width: wide ? "min(96cqw, 780px)" : "min(100cqw, 480px)", // fills the 480 rail-to-rail column
              height: compact ? "auto" : "var(--frame-h)",
              maxHeight: compact ? "var(--frame-max)" : undefined,
            }}
          >
            {children}
          </div>
        </div>
        {nudge && <ScrollCue className="w-full self-end pb-[18px]" />}
      </div>
    </section>
  );
}

/** The phone scroll cue: the swipe-up dot with its hollow-stroke trail and
 *  the word SCROLL, centred at the foot of the screen. No arrow: an up
 *  chevron beside a dot already travelling up read as "go back up". */
function ScrollCue({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none flex flex-col items-center gap-[4px] md:hidden ${className}`} style={{ color: "var(--muted-foreground)" }}>
      <GestureHint direction="up" crisp size={12} distance={24} color="var(--muted-foreground)" />
      <span className="text-[10.5px] leading-[12px] font-semibold tracking-[0.1em] uppercase">Scroll</span>
    </span>
  );
}
