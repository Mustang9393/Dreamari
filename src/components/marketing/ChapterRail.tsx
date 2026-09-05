"use client";

import { advanceTo } from "./scrollHooks";

import { type RefObject, useEffect, useRef, useState } from "react";

// Order per Joshua Pierce, Slack, 5 Sept 2026: once a student is matched with
// a career, Play is the more intuitive next step (try it out) before Explore
// (look at other careers if it's not a fit) -- confirmed live in a pitch demo.
const CHAPTERS = [
  { id: "build", label: "Build", color: "#6366f1" },
  { id: "match", label: "Match", color: "#ffb81f" },
  { id: "play", label: "Play", color: "#3b82f6" },
  { id: "explore", label: "Explore", color: "#1fc76e" },
  { id: "connect", label: "Connect", color: "#00c8dc" },
  { id: "get-hired", label: "Get Hired", color: "#ff9640" },
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
      // Slim and close to the true edge (right-3, ~6px dots) rather than the
      // fixed 38px labeled buttons this replaced: those sat right where
      // Build/Play/Connect's own graphic column already lands (the row only
      // reverses for Match/Explore), so at any width between "content hits its
      // 1200px cap" and "there's real gutter to spare" the two visibly
      // collided. A hairline never competes for that space. xl: (not lg:)
      // since 1024-1279px is exactly that tight range.
      className="fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 transition-opacity duration-300 xl:flex"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <span className="absolute top-0 bottom-0 left-1/2 z-0 w-px -translate-x-1/2" style={{ background: "var(--border)" }} />
      <span
        className="absolute top-0 left-1/2 z-[1] w-px -translate-x-1/2 rounded-full transition-[height] duration-250 ease-out"
        style={{
          height: `${(activeIndex / (CHAPTERS.length - 1)) * 100}%`,
          background: "linear-gradient(180deg,#6366f1,#ffb81f,#1fc76e,#3b82f6,#00c8dc)",
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
            onClick={() => advanceTo(chapter.id)}
            className="group relative z-[2] flex h-3.5 w-3.5 items-center justify-center p-1"
          >
            <span
              className="rounded-full transition-all duration-250"
              style={{
                width: isActive ? "8px" : "6px",
                height: isActive ? "8px" : "6px",
                background: isActive || isPassed ? chapter.color : "var(--card)",
                border: `1.5px solid ${chapter.color}`,
                opacity: isPassed && !isActive ? 0.5 : 1,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
