"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

const CHAPTERS = [
  { id: "build", label: "Build", color: "#6366f1" },
  { id: "match", label: "Match", color: "#e5484d" },
  { id: "play", label: "Play", color: "#ffb81f" },
  { id: "explore", label: "Explore", color: "#1fc76e" },
  { id: "connect", label: "Connect", color: "#00c8dc" },
];

type ChapterRailProps = {
  wrapRef: RefObject<HTMLDivElement | null>;
};

export function ChapterRail({ wrapRef }: ChapterRailProps) {
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const [visible, setVisible] = useState(false);
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function updateVisibility() {
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      setVisible(r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3);
    }
    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();

    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => el !== null);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => spy.observe(s));

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      spy.disconnect();
    };
  }, [wrapRef]);

  const activeIndex = CHAPTERS.findIndex((c) => c.id === activeId);

  return (
    <nav
      ref={railRef}
      aria-label="Chapter progress"
      className="fixed top-1/2 right-7 z-40 hidden -translate-y-1/2 flex-col items-center gap-6 transition-opacity duration-300 lg:flex"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <span className="absolute top-0 bottom-0 left-1/2 z-0 w-0.5 -translate-x-1/2" style={{ background: "var(--border)" }} />
      <span
        className="absolute top-0 left-1/2 z-[1] w-0.5 -translate-x-1/2 rounded-full transition-[height] duration-250 ease-out"
        style={{
          height: `${(activeIndex / (CHAPTERS.length - 1)) * 100}%`,
          background: "linear-gradient(180deg,#6366f1,#e5484d,#ffb81f,#1fc76e,#00c8dc)",
        }}
      />
      {CHAPTERS.map((chapter, i) => {
        const isActive = chapter.id === activeId;
        const isPassed = i < activeIndex;
        return (
          <button
            key={chapter.id}
            type="button"
            aria-label={chapter.label}
            onClick={() => document.getElementById(chapter.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="group relative z-[2] flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 transition-all duration-250"
            style={{
              background: isActive || isPassed ? chapter.color : "var(--card)",
              borderColor: chapter.color,
              color: isActive || isPassed ? "#fff" : "var(--muted-foreground)",
              opacity: isPassed && !isActive ? 0.5 : 1,
              transform: isActive ? "scale(1.18)" : "scale(1)",
              boxShadow: isActive ? `0 0 0 6px color-mix(in srgb, ${chapter.color} 20%, transparent)` : "none",
            }}
          >
            <span
              className="pointer-events-none absolute top-1/2 right-[calc(100%+12px)] -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11.5px] font-bold whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background: "var(--glass-surface-3)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
                opacity: isActive ? 1 : undefined,
              }}
            >
              {chapter.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
