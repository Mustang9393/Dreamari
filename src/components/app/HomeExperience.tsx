"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Flame, Sparkle } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu } from "./chrome";
import { PosterCard } from "./PosterCard";
import { HOME_PICKS } from "./catalog";

// Home — v2.1 (Figma 2099:3423), ported section by section: Hero Banner
// (3-panel carousel: Today's Drop / Continue / Trending), Continue rail of
// Active Activity Cards, Careers Picked for You poster rail, Career Signal
// Banner, Glossary Challenge Banner. All colors/spacing/radii/type through
// the .marketing-v2 token scope; art assets are the frame's own exports.

// Starfield accents inside the hero (Figma "Space Accents": six 2-3px circles
// at these exact positions; fill is the frame's white star dots).
const SPACE_ACCENTS = [
  { left: 120, top: 60, size: 2 },
  { left: 340, top: 110, size: 3 },
  { left: 210, top: 240, size: 2 },
  { left: 580, top: 80, size: 3 },
  { left: 720, top: 220, size: 2 },
  { left: 940, top: 140, size: 2 },
];

// Comet particles ("particle-1"…"particle-10"), same treatment.
const COMET_PARTICLES = [
  { left: 280, top: 70, size: 11 },
  { left: 320, top: 100, size: 9 },
  { left: 300, top: 45, size: 8 },
  { left: 350, top: 75, size: 7 },
  { left: 255, top: 110, size: 10 },
  { left: 370, top: 55, size: 6 },
  { left: 330, top: 125, size: 8 },
  { left: 390, top: 90, size: 5 },
  { left: 240, top: 85, size: 9 },
  { left: 310, top: 130, size: 7 },
];

// Mobile frame's trail (01 Directive — Mobile: its own smaller bars).
const MOBILE_TRAIL = [
  { left: 126, top: 111.33, box: 126.67, boxH: 124.61, w: 126.12, h: 51.6, opacity: 0.85 },
  { left: 164.48, top: 90.99, box: 102.19, boxH: 100.45, w: 103.19, h: 40.13, opacity: 0.7 },
  { left: 208.05, top: 76.97, box: 77.72, boxH: 76.29, w: 80.26, h: 28.66, opacity: 0.55 },
  { left: 245.3, top: 72, box: 49.11, boxH: 48.16, w: 50.5, h: 16.8, opacity: 0.4 },
];

const MOBILE_PARTICLES = [
  { left: 223.41, top: 104.05, size: 6 },
  { left: 246.41, top: 121.05, size: 5 },
  { left: 263.41, top: 107.05, size: 4 },
  { left: 208.41, top: 127.05, size: 6 },
];

// Comet trail bars (Figma trail-core/mid/tip/wisp, all rotated -43.88deg).
const COMET_TRAIL = [
  { left: 110.59, top: 82.53, w: 220, h: 90, opacity: 0.85, box: 220.958 },
  { left: 177.7, top: 47.05, w: 180, h: 70, opacity: 0.7, box: 178.263 },
  { left: 253.7, top: 22.58, w: 140, h: 50, opacity: 0.55, box: 135.569 },
  { left: 318.7, top: 13.92, w: 90, h: 30, opacity: 0.4, box: 85.666 },
];

function CaptionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p className="text-[10px] leading-[14px] font-semibold" style={{ fontFamily: "var(--font-body)", color }}>
      {children}
    </p>
  );
}

function PanelShell({ from, children }: { from: string; children: React.ReactNode }) {
  return (
    <div
      className="relative h-full w-full flex-none overflow-hidden"
      style={{ background: `linear-gradient(90deg, ${from} 0%, var(--hero-mid) 65%, var(--background) 100%)` }}
    >
      {children}
    </div>
  );
}

function WorldArt({ portrait, fadeRight = false }: { portrait: string; fadeRight?: boolean }) {
  // The whole art block feathers out via mask (left always; right on the
  // fadeRight panels; soft top/bottom) — no hard overlay edges.
  const horizontal = fadeRight ? "linear-gradient(90deg, transparent 0%, #000 45%, #000 72%, transparent 100%)" : "linear-gradient(90deg, transparent 0%, #000 55%)";
  const vertical = "linear-gradient(180deg, transparent 0%, #000 18%, #000 88%, transparent 100%)";
  const mask = `${horizontal}, ${vertical}`;
  return (
    <div
      className="absolute right-0 bottom-0 h-[320px] w-[240px] overflow-hidden opacity-70 lg:top-0 lg:bottom-auto lg:h-[360px] lg:w-[344px] lg:opacity-100"
      style={{ maskImage: mask, WebkitMaskImage: mask, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
    >
      <div className="absolute top-[-30px] left-[24px] size-[170px]">
        <img alt="" src="/images/app/world-glow-pink.svg" className="absolute inset-[-12.94%] block max-w-none" style={{ width: "126%", height: "126%" }} />
      </div>
      <img alt="" src="/images/app/world-symbol-creative-media.svg" className="absolute inset-[3%_5%_10%_5.5%] block h-[87%] w-[89%] mix-blend-screen" />
      <img alt="" src={portrait} className="absolute top-[24px] left-[58px] h-[335px] w-[223px] object-cover opacity-[0.78]" />
    </div>
  );
}

function HeroCta({ children, display = false, fullOnMobile = false }: { children: React.ReactNode; display?: boolean; fullOnMobile?: boolean }) {
  return (
    <button
      type="button"
      className={`cursor-pointer px-[var(--space-6)] py-[var(--space-4)] transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] ${
        fullOnMobile ? "w-full rounded-[var(--radius-md)] sm:w-auto sm:rounded-[var(--radius-lg)]" : "rounded-[var(--radius-lg)]"
      }`}
      style={{ background: "var(--foreground)", color: "var(--background)" }}
    >
      <span
        className={display ? "text-[16px] leading-[22px] font-semibold" : "text-[13px] leading-[18px] font-semibold"}
        style={{ fontFamily: display ? "var(--font-display)" : "var(--font-body)" }}
      >
        {children}
      </span>
    </button>
  );
}

function CometTrailOnly() {
  return (
    <>
      {COMET_TRAIL.map((bar, index) => (
        <div key={index} className="absolute flex items-center justify-center" style={{ left: bar.left, top: bar.top, width: bar.box, height: bar.box }}>
          <span className="block flex-none rotate-[-43.88deg] rounded-full" style={{ width: bar.w, height: bar.h, opacity: bar.opacity, background: "var(--primary-foreground)" }} />
        </div>
      ))}
      {COMET_PARTICLES.map((particle, index) => (
        <span key={index} className="absolute rounded-full" style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, background: "var(--primary-foreground)", opacity: 0.8 }} />
      ))}
    </>
  );
}

function CometStar() {
  return (
    <>
      <CometTrailOnly />
      <div className="absolute top-[137px] left-[30px] size-[220px]">
        <img alt="" src="/images/app/star-character.svg" className="block size-full max-w-none" />
        <img alt="" src="/images/app/star-face.svg" className="absolute top-[calc(50%+10px)] left-1/2 size-[140px] -translate-x-1/2 -translate-y-1/2" />
      </div>
    </>
  );
}

function HeroBanner() {
  const [panel, setPanel] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setPanel((current) => (current + 1) % 3), 7000);
    return () => clearInterval(timer);
  }, [paused]);

  const step = (delta: number) => setPanel((current) => (current + delta + 3) % 3);

  return (
    <section
      aria-label="Highlights"
      className="relative h-[430px] w-full overflow-hidden rounded-[var(--radius-xl)] border sm:h-[360px] sm:rounded-[var(--radius-2xl)]"
      style={{ borderColor: "var(--glass-border)" }}
      onTouchStart={(event) => {
        touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchEnd={(event) => {
        if (!touchStart.current) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
        {SPACE_ACCENTS.map((dot, index) => (
          <span key={index} className="absolute rounded-full" style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, background: "var(--foreground)" }} />
        ))}
      </div>

      <div className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${panel * 100}%)` }}>
        {/* Panel 1 — Today's Drop */}
        <PanelShell from="var(--hero-accent-purple)">
          <div className="relative z-[2] flex h-full max-w-[620px] flex-col justify-between p-[var(--space-5)] pb-[30px] sm:p-[var(--space-10)] sm:pb-[var(--space-10)]">
            <div className="flex flex-col gap-[var(--space-3)]">
              <CaptionLabel color="var(--chart-3)">TODAY&apos;S DROP</CaptionLabel>
              <p className="text-[26px] leading-[1.2] font-extrabold sm:text-[32px] sm:leading-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                A new career is falling into view.
              </p>
              <p className="max-w-[480px] text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                {/* Mobile frame's copy variant vs desktop's (both are the design's own) */}
                <span className="sm:hidden">One tiny mystery, about 20 seconds. Answer to reveal it, keep your streak alive, and save it for later.</span>
                <span className="hidden sm:inline">One tiny mystery, about 20 seconds. Answer to reveal it, keep your streak alive, and add it to My Sky.</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-[var(--space-8)]">
              <HeroCta display fullOnMobile>
                Open Today&apos;s Drop →
              </HeroCta>
              <span className="flex items-center gap-[var(--space-3)] pb-[18px] text-[13px] leading-[18px] font-semibold sm:pb-0" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--chart-3)" }}>12-day streak</span>
                <span aria-hidden className="h-1 w-1 rounded-[2px]" style={{ background: "var(--muted-foreground)" }} />
                <span className="sm:hidden" style={{ color: "var(--foreground)" }}>27 careers saved</span>
                <span className="hidden sm:inline" style={{ color: "var(--muted-foreground)" }}>27 cards in My Sky</span>
              </span>
            </div>
          </div>
          {/* Desktop: comet + star overlay on the right (frame's own art) */}
          <div aria-hidden className="pointer-events-none absolute top-[-40px] left-[58%] hidden h-[350px] w-[550px] sm:block">
            <CometStar />
          </div>
          {/* Mobile: the mobile frame's own composition — trail 408x260 at
             (46,37), star 122px at (118,190), inside the 430px card. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 sm:hidden">
            {/* The mobile frame's own compact trail (bars + particles at its
               exact coordinates inside the 46,37 wrapper). */}
            <div className="absolute top-[37px] left-[46px] h-[260px] w-[408px]">
              {MOBILE_TRAIL.map((bar, index) => (
                <div key={index} className="absolute flex items-center justify-center" style={{ left: bar.left, top: bar.top, width: bar.box, height: bar.boxH }}>
                  <span className="block flex-none rotate-[-43.88deg] rounded-full" style={{ width: bar.w, height: bar.h, opacity: bar.opacity, background: "var(--primary-foreground)" }} />
                </div>
              ))}
              {MOBILE_PARTICLES.map((particle, index) => (
                <span key={index} className="absolute rounded-full" style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, background: "var(--primary-foreground)", opacity: 0.8 }} />
              ))}
            </div>
            <div className="absolute top-[190px] left-[118px] size-[122px]">
              <img alt="" src="/images/app/star-character.svg" className="block size-full max-w-none" />
              <img alt="" src="/images/app/star-face.svg" className="absolute top-[calc(50%+6px)] left-1/2 size-[78px] -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </PanelShell>

        {/* Panel 2 — Continue Where You Left Off */}
        <PanelShell from="var(--hero-accent-pink)">
          <div className="relative z-[2] flex h-full max-w-[620px] flex-col justify-between p-[var(--space-5)] pb-[30px] sm:p-[var(--space-10)] sm:pb-[var(--space-10)]">
            <div className="flex flex-col gap-[var(--space-3)]">
              <CaptionLabel color="var(--chart-2)">CONTINUE WHERE YOU LEFT OFF</CaptionLabel>
              <p className="text-[26px] leading-[1.2] font-extrabold sm:text-[32px] sm:leading-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                Brand Crisis Room
              </p>
              <p className="max-w-[480px] text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                Lead the response team through a high-stakes media crisis. Manage public relations, alignment, and coordinate emergency PR.
              </p>
            </div>
            <div className="flex w-full max-w-[420px] flex-col gap-[var(--space-2)]">
              <div className="flex items-center justify-between text-[10px] leading-[14px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>62% COMPLETE</span>
                <span style={{ color: "var(--chart-2)" }}>18 min left</span>
              </div>
              <div className="relative h-[6px] w-full rounded-[var(--radius-full,999px)]" style={{ background: "var(--glass-surface-2)" }}>
                <div className="absolute inset-y-0 left-0 w-[62%] rounded-[999px]" style={{ background: "var(--chart-2)", boxShadow: "0 0 9px rgba(239,93,168,0.5)" }} />
              </div>
            </div>
            <div>
              <HeroCta>Resume Simulation →</HeroCta>
            </div>
          </div>
          <WorldArt portrait="/images/app/activity-portrait-creative-media.png" />
        </PanelShell>

        {/* Panel 3 — Trending Now */}
        <PanelShell from="var(--hero-accent-teal)">
          <div className="relative z-[2] flex h-full max-w-[620px] flex-col justify-between p-[var(--space-5)] pb-[30px] sm:p-[var(--space-10)] sm:pb-[var(--space-10)]">
            <div className="flex flex-col gap-[var(--space-3)]">
              <CaptionLabel color="var(--accent-subtle)">TRENDING NOW</CaptionLabel>
              <p className="text-[26px] leading-[1.2] font-extrabold sm:text-[32px] sm:leading-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                UX Researcher is on the rise.
              </p>
              <p className="max-w-[480px] text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                One of the fastest-growing roles blending empathy, data, and design thinking. Explore how modern systems leverage research.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-[var(--space-4)] sm:gap-[var(--space-8)]">
              <HeroCta>Explore this career →</HeroCta>
              <span className="text-[13px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--accent-subtle)" }}>
                Featured in 3 Career Worlds
              </span>
            </div>
          </div>
          <WorldArt portrait="/images/app/portrait-ux-researcher.png" fadeRight />
        </PanelShell>
      </div>

      {/* Desktop prev/next — skip without waiting for the timer */}
      <button
        type="button"
        aria-label="Previous highlight"
        onClick={() => step(-1)}
        className="absolute top-1/2 left-3 z-[3] hidden size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px] transition-opacity hover:opacity-100 sm:flex sm:opacity-60"
        style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next highlight"
        onClick={() => step(1)}
        className="absolute top-1/2 right-3 z-[3] hidden size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px] transition-opacity hover:opacity-100 sm:flex sm:opacity-60"
        style={{ background: "var(--glass-surface-3)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Carousel dots + pause — right-anchored on desktop, centered on the
         mobile frame */}
      <div className="absolute inset-x-0 bottom-[11px] z-[3] flex items-center justify-center gap-[var(--space-3)] sm:inset-x-auto sm:right-[39px] sm:bottom-[23px] sm:justify-start">
        <div className="flex items-center gap-[var(--space-2)]">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              aria-label={`Panel ${index + 1}`}
              aria-current={panel === index}
              onClick={() => setPanel(index)}
              className="h-[7px] cursor-pointer rounded-[3.5px] transition-all duration-300"
              style={{ width: panel === index ? 24 : 7, background: panel === index ? "var(--foreground)" : "var(--muted-foreground)" }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={paused ? "Resume carousel" : "Pause carousel"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="flex h-6 cursor-pointer items-center justify-center gap-[4px]"
        >
          {paused ? (
            <span aria-hidden className="ml-[2px] block border-y-[5px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: "var(--foreground)" }} />
          ) : (
            <>
              <span className="h-[10px] w-[2.5px] rounded-[1px]" style={{ background: "var(--foreground)" }} />
              <span className="h-[10px] w-[2.5px] rounded-[1px]" style={{ background: "var(--foreground)" }} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

type Activity = {
  badge: string;
  badgeColor: string;
  title: string;
  sub: string;
  fill: number;
  stat: string;
  cta: string;
  portrait: string;
  glow: string;
  symbol: "creative" | "dollar";
};

// Active Activity Cards (Figma 2537:4570/4587/4603) — copy, colors, progress
// widths straight from the frame.
const ACTIVITIES: Activity[] = [
  {
    badge: "SIMULATION",
    badgeColor: "var(--chart-2)",
    title: "Brand Crisis Room",
    sub: "Lead the response team",
    fill: 62,
    stat: "62% · 18 min left",
    cta: "Resume simulation  →",
    portrait: "/images/app/portrait-brand-crisis.png",
    glow: "/images/app/world-glow-pink.svg",
    symbol: "creative",
  },
  {
    badge: "GLOSSARY",
    badgeColor: "var(--world-business-money-office)",
    title: "Finance Essentials",
    sub: "6 of 10 terms mastered",
    fill: 60,
    stat: "Set 3 of 5",
    cta: "Continue glossary  →",
    portrait: "/images/app/poster-investment-banking.png",
    glow: "/images/app/world-glow-amber.svg",
    symbol: "dollar",
  },
  {
    badge: "GAME",
    badgeColor: "var(--world-business-money-office)",
    title: "Market Match",
    sub: "Build the strongest portfolio",
    fill: 48,
    stat: "Round 3 of 5",
    cta: "Keep playing  →",
    portrait: "/images/app/poster-private-equity.png",
    glow: "/images/app/world-glow-amber.svg",
    symbol: "dollar",
  },
];

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article
      className="relative h-[190px] w-[304px] flex-none overflow-hidden rounded-[var(--radius-xl)] border sm:w-[421px]"
      style={{ borderColor: "var(--glass-border)", background: "linear-gradient(90deg, var(--card) 0%, var(--background) 62%, var(--background) 100%)" }}
    >
      <span
        className="absolute top-[17px] left-[15px] rounded-[999px] sm:left-[19px] border px-[var(--space-3)] py-[5px] text-[10px] leading-[14px] font-semibold"
        style={{ fontFamily: "var(--font-body)", background: "var(--glass-surface-3)", borderColor: activity.badgeColor, color: activity.badgeColor }}
      >
        {activity.badge}
      </span>
      <p className="absolute top-[51px] left-[15px] w-[164px] text-[19px] leading-[24px] font-bold sm:left-[19px] sm:w-[226px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        {activity.title}
      </p>
      <p className="absolute top-[103px] left-[15px] w-[150px] text-[10px] leading-[14px] sm:top-[79px] sm:left-[19px] sm:w-[215px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
        {activity.sub}
      </p>
      <div className="absolute top-[123px] left-[15px] h-[5px] w-[160px] rounded-[999px] sm:top-[109px] sm:left-[19px] sm:w-[200px]" style={{ background: "var(--glass-surface-2)" }}>
        <div className="h-full rounded-[999px]" style={{ width: `${activity.fill}%`, background: activity.badgeColor, boxShadow: `0 0 8px color-mix(in srgb, ${activity.badgeColor} 45%, transparent)` }} />
      </div>
      <p className="absolute top-[133px] left-[15px] text-[10px] leading-[14px] font-semibold sm:top-[119px] sm:left-[19px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
        {activity.stat}
      </p>
      <p className="absolute top-[158px] left-[15px] text-[10px] leading-[14px] font-semibold whitespace-pre sm:top-[150px] sm:left-[19px]" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
        {activity.cta}
      </p>
      <div aria-hidden className="absolute top-0 right-0 h-full w-[132px] overflow-hidden sm:w-[181px]">
        <img alt="" src={activity.glow} className="absolute top-[-52px] left-0 block w-[214px] max-w-none" />
        {activity.symbol === "creative" ? (
          <img alt="" src="/images/app/world-symbol-creative-media-sm.svg" className="absolute top-[-10px] left-[10px] block w-[120px] mix-blend-screen" />
        ) : (
          <span
            className="absolute top-[-24px] left-[45px] text-[190px] leading-[190px] font-extrabold mix-blend-screen"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.34,
              backgroundImage: "linear-gradient(94.5deg, rgba(255,232,140,0.72) 10.669%, rgba(255,171,31,0.64) 47.979%, rgba(133,87,255,0.3) 106.63%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            $
          </span>
        )}
        <div
          className="absolute inset-0"
          style={{ maskImage: "url(/images/app/activity-portrait-mask.svg)", WebkitMaskImage: "url(/images/app/activity-portrait-mask.svg)", maskSize: "100% 190px", WebkitMaskSize: "100% 190px" }}
        >
          <img alt="" src={activity.portrait} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </article>
  );
}

export function HomeExperience() {
  return (
    <div className="marketing-v2 relative min-h-dvh w-full" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src="/images/app/background-space.svg" className="absolute top-0 left-0 h-[2602px] w-full max-w-none object-cover" />
      </div>

      <DesktopNavigation active="Home" />

      {/* Mobile header (logo + streak/XP, per the mobile frame) */}
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Link href="/" aria-label="Dreamari landing page" className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          DREAMARI
        </Link>
        <span className="flex items-center gap-[var(--space-4)] text-[13px] font-bold" style={{ fontFamily: "var(--font-body)" }}>
          <span className="flex items-center gap-[6px]" style={{ color: "var(--accent)" }}>
            <Flame className="h-4 w-4" /> 12
          </span>
          <span className="flex items-center gap-[6px]" style={{ color: "var(--world-business-money-office)" }}>
            <Sparkle className="h-4 w-4" /> 15,980 XP
          </span>
          <QuickLinksMenu />
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--space-10)] px-5 pt-4 pb-[120px] sm:gap-[var(--space-14)] sm:px-[var(--space-14)] sm:pt-[var(--space-10)]">
        <HeroBanner />

        <section aria-label="Continue where you left off" className="flex w-full flex-col gap-[var(--space-5)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Continue Where You Left Off
            </h2>
            <button type="button" className="cursor-pointer text-[14px] leading-[20px] font-bold whitespace-pre" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
              {"View all activity  →"}
            </button>
          </div>
          <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:gap-[var(--space-6)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {ACTIVITIES.map((activity) => (
              <ActivityCard key={activity.title} activity={activity} />
            ))}
          </div>
        </section>

        <section aria-label="Careers picked for you" className="flex w-full flex-col gap-[var(--space-6)]">
          <h2 className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Careers Picked for You
          </h2>
          <div className="-mx-5 flex gap-[var(--space-6)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {HOME_PICKS.map((career) => (
              <PosterCard key={career.title} career={career} />
            ))}
          </div>
        </section>

        {/* Career Signal Banner */}
        <section
          aria-label="Your signal"
          className="relative w-full overflow-hidden rounded-[var(--radius-2xl)] border p-[27px] sm:h-[216px]"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: "linear-gradient(90deg, rgba(59,46,158,0.42) 0%, rgba(10,13,33,0.1) 46%, var(--background) 100%)" }} />
          <div className="relative flex h-full flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between sm:gap-[var(--space-8)]">
            <div className="flex flex-col gap-[var(--space-3)]">
              <span
                className="w-fit rounded-[99px] border px-[var(--space-3)] py-[var(--space-1)] text-[10px] leading-[14px] font-semibold"
                style={{ fontFamily: "var(--font-body)", background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-ghost)" }}
              >
                YOUR SIGNAL
              </span>
              <p className="text-[24px] leading-[30px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                You&apos;re a People-First Problem Solver.
              </p>
              <p className="text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                Your activity points to careers that blend empathy, strategy and making.
              </p>
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {["Design", "Research", "Product"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[999px] border px-[var(--space-4)] py-[var(--space-3)] text-[16px] leading-[22px] font-semibold backdrop-blur-[10px]"
                    style={{ fontFamily: "var(--font-display)", background: "var(--secondary)", borderColor: "var(--border)", color: "var(--secondary-foreground)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="h-[42px] w-full flex-none cursor-pointer rounded-[var(--radius-md)] border text-center text-[13px] leading-[18px] font-semibold sm:w-[198px]"
              style={{
                fontFamily: "var(--font-body)",
                borderColor: "var(--glass-border)",
                background: "linear-gradient(90deg, var(--accent), var(--primary))",
                color: "var(--foreground)",
                filter: "drop-shadow(0px 8px 9px rgba(31,82,255,0.32))",
              }}
            >
              View My Plan
            </button>
          </div>
        </section>

        {/* Glossary Challenge Banner */}
        <section
          aria-label="Today's glossary challenge"
          className="flex w-full flex-col gap-[var(--space-5)] rounded-[var(--radius-2xl)] border px-[var(--space-6)] py-[var(--space-6)] backdrop-blur-[10px] sm:flex-row sm:items-center sm:justify-between sm:px-[var(--space-8)] sm:py-[28px]"
          style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)" }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-[var(--space-5)]">
            <span className="flex h-12 flex-none items-center justify-center rounded-[var(--radius-lg)] px-[var(--space-4)]" style={{ background: "var(--world-business-money-office)" }}>
              <BookOpen className="h-5 w-5" style={{ color: "var(--background)" }} />
            </span>
            <span className="flex min-w-0 flex-col gap-[var(--space-1)]">
              <span className="text-[10px] leading-[14px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--amber-400)" }}>
                TODAY&apos;S GLOSSARY CHALLENGE
              </span>
              <span className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                Finance &amp; Investing Terms
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:gap-[28px]">
            <div className="flex w-full flex-col gap-[var(--space-2)] sm:w-[160px]">
              <span className="text-[10px] leading-[14px] font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                6 of 10 terms mastered
              </span>
              <span className="h-[5px] w-full rounded-[2.5px]" style={{ background: "var(--glass-surface-2)" }}>
                <span className="block h-full w-[60%] rounded-[2.5px]" style={{ background: "var(--amber-400)" }} />
              </span>
            </div>
            <div className="flex gap-[var(--space-3)]">
              <button
                type="button"
                className="cursor-pointer rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-3)] text-[10px] leading-[14px] font-semibold"
                style={{ fontFamily: "var(--font-body)", background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                START STUDY
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-[var(--radius-md)] border px-[var(--space-5)] py-[var(--space-3)] text-[10px] leading-[14px] font-semibold"
                style={{ fontFamily: "var(--font-body)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                4 SETS
              </button>
            </div>
          </div>
        </section>
      </main>

      <MobileNav active="Home" />
    </div>
  );
}
