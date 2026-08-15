"use client";

import { type ReactNode, type RefObject } from "react";
import { useRevealOnScroll } from "./scrollHooks";

type ChapterShellProps = {
  id: string;
  eyebrow: string;
  title: string;
  color: string;
  oneliner: string;
  flip?: boolean;
  altBackground?: boolean;
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
  altBackground = false,
  graphicRef,
  playing,
  graphicRevealed,
  children,
}: ChapterShellProps) {
  const [copyRef, copyRevealed] = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id={id} className="relative" style={altBackground ? { background: "var(--card)" } : undefined}>
      {/* Reference is desktop-first here: .chapter-row is a row by default and only
          switches to a stacked column below 900px (not Tailwind's 768px md: tier,
          which left a 768-899px gap where content was force-fit into a row it didn't
          have room for). */}
      <div
        className={`mx-auto flex max-w-[1200px] items-center gap-10 px-6 py-8 max-[900px]:flex-col sm:py-10 min-[901px]:gap-[60px] lg:py-14 ${flip ? "flex-row-reverse" : "flex-row"}`}
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
          <div className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--primary-tint)" }}>
            {eyebrow}
          </div>
          <h2
            className="mt-2 font-extrabold uppercase"
            style={{
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
          <p className="mt-2 text-[18px] leading-snug" style={{ color: "var(--muted-foreground)" }}>
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
          <div className="relative z-[1] flex w-full items-center justify-center">{children}</div>
        </div>
      </div>
    </section>
  );
}
