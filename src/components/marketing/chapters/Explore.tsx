"use client";

import { ChapterShell } from "../ChapterShell";
import { usePlayingOnScroll } from "../scrollHooks";

type Tile = {
  tc: string;
  tx: number;
  ty: number;
  target?: boolean;
  label?: string;
  icon: React.ReactNode;
};

const TILES: Tile[] = [
  {
    tc: "var(--world-tech-engineering-design)",
    tx: -95,
    ty: -58,
    icon: (
      <>
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </>
    ),
  },
  {
    tc: "var(--world-business-money-office)",
    tx: 0,
    ty: 0,
    target: true,
    label: "Investing",
    icon: (
      <>
        <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
        <path d="M16 7h6v6" />
      </>
    ),
  },
  {
    tc: "var(--world-food-farming-nature)",
    tx: 92,
    ty: -50,
    icon: (
      <>
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </>
    ),
  },
  {
    tc: "var(--world-law-safety-government)",
    tx: -80,
    ty: 62,
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    tc: "var(--world-science-research)",
    tx: 88,
    ty: 64,
    icon: (
      <>
        <path d="M9 2v6l-5.5 9.5A2 2 0 0 0 5.24 21h13.52a2 2 0 0 0 1.74-3.5L15 8V2" />
        <path d="M8.5 2h7" />
        <path d="M7 16h10" />
      </>
    ),
  },
  {
    tc: "var(--world-arts-media-sport)",
    tx: 0,
    ty: -96,
    icon: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </>
    ),
  },
];

export function ExploreChapter() {
  const [graphicRef, playing, graphicRevealed] = usePlayingOnScroll<HTMLDivElement>();

  return (
    <ChapterShell
      id="explore"
      eyebrow="Chapter Four"
      title="Explore"
      color="#1fc76e"
      oneliner="8 worlds. Still shaped around you."
      flip
      altBackground
      graphicRef={graphicRef}
      playing={playing}
      graphicRevealed={graphicRevealed}
    >
      <div className="relative z-[1]" style={{ width: "calc(var(--mu) * 260px)", height: "calc(var(--mu) * 250px)" }}>
        {TILES.map((tile, i) => (
          <div
            key={i}
            className={`mkt-world-tile absolute top-1/2 left-1/2 flex items-center justify-center rounded-2xl border ${tile.target ? "mkt-target" : "mkt-orbit"}`}
            style={{
              width: "calc(var(--mu) * 58px)",
              height: "calc(var(--mu) * 58px)",
              background: `color-mix(in srgb, ${tile.tc} 22%, var(--glass-surface-2))`,
              borderColor: `color-mix(in srgb, ${tile.tc} 40%, transparent)`,
              color: tile.tc,
              ["--tc" as string]: tile.tc,
              ["--tx" as string]: `${tile.tx}px`,
              ["--ty" as string]: `${tile.ty}px`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "calc(var(--mu) * 24px)", height: "calc(var(--mu) * 24px)" }}
            >
              {tile.icon}
            </svg>
            {tile.label && (
              <span
                className="mkt-world-label absolute left-1/2 whitespace-nowrap"
                style={{
                  bottom: "calc(var(--mu) * -22px)",
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(9px, calc(var(--mu) * 10px), 13px)",
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                {tile.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </ChapterShell>
  );
}
