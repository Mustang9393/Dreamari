"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Flame, Sparkle } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "./chrome";
import { PosterCard } from "./PosterCard";
import { BROWSE_BECAUSE_LIKED } from "./catalog";
import { DailyDropFlight, DailyDropTakeover } from "@/components/motion-lab/DailyDropDemo";

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

function PanelPhoto({ photo, fadeRight = false }: { photo: string; fadeRight?: boolean }) {
  // Browse-card photo treatment for the hero panels: the full-bleed image
  // feathers into the panel via mask (left always; right on fadeRight
  // panels; soft top/bottom). The retired glow/symbol icon layers are gone.
  const horizontal = fadeRight ? "linear-gradient(90deg, transparent 0%, #000 45%, #000 72%, transparent 100%)" : "linear-gradient(90deg, transparent 0%, #000 55%)";
  const vertical = "linear-gradient(180deg, transparent 0%, #000 12%, #000 92%, transparent 100%)";
  const mask = `${horizontal}, ${vertical}`;
  return (
    <div
      className="absolute right-0 bottom-0 h-[320px] w-[260px] overflow-hidden opacity-70 lg:top-0 lg:bottom-auto lg:h-[360px] lg:w-[400px] lg:opacity-100"
      style={{ maskImage: mask, WebkitMaskImage: mask, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
    >
      <img alt="" src={photo} className="absolute inset-0 h-full w-full object-cover object-top" />
    </div>
  );
}

function HeroCta({ children, display = false, fullOnMobile = false, onClick }: { children: React.ReactNode; display?: boolean; fullOnMobile?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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

// The hero flight, scaled to its panel: Dreamy ~24% of the panel width
// (clamped 96-200px), trail proportional so it always crosses a good run of
// the frame before bleeding off the top-right corner. The cloud stays fully
// visible at every size.
function ResponsiveFlight({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // phones: Dreamy holds the banner's central band, trail near-horizontal.
  // larger screens: Dreamy is the attraction — anchored to the middle of
  // the free zone RIGHT of the text column (never over it), scaling up
  // with the panel; the trail fades off toward the right edge.
  const phone = w > 0 && w < 480;
  const dreamy = phone ? Math.max(96, Math.min(140, w * 0.3)) : Math.max(120, Math.min(240, w * 0.24));
  const textEdge = Math.min(520, w * 0.55);
  const freeCenter = textEdge + (w - textEdge) * 0.42;
  const rightOffset = phone ? (w - dreamy) / 2 : Math.max(14, w - (freeCenter + dreamy / 2));
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-[50.5%] -translate-y-1/2 sm:top-[53%]"
        style={{ right: rightOffset }}
      >
        {w > 0 && (
          <DailyDropFlight
            size={dreamy}
            band={dreamy * 3.4}
            thickness={dreamy * 0.72}
            tilt={phone ? -4 : -14}
            onOpen={onOpen}
          />
        )}
      </div>
    </div>
  );
}

function HeroBanner() {
  const [panel, setPanel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (paused || dropOpen) return;
    const timer = setInterval(() => setPanel((current) => (current + 1) % 3), 7000);
    return () => clearInterval(timer);
  }, [paused, dropOpen]);

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
              <p className="max-w-[420px] text-[26px] leading-[1.2] font-extrabold text-balance sm:text-[32px] sm:leading-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                Today&apos;s card is dropping in.
              </p>
              <p className="max-w-[400px] text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                One question, 20 seconds. Solve it to catch today&apos;s career card and keep your streak.
              </p>
            </div>
            <div className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-[var(--space-8)]">
              <HeroCta display fullOnMobile onClick={() => setDropOpen(true)}>
                <span className="inline-flex items-center gap-[6px]">
                  Catch the drop
                  <ArrowRight size={16} strokeWidth={3} aria-hidden />
                </span>
              </HeroCta>
              <span className="flex items-center gap-[var(--space-3)] pb-[18px] text-[13px] leading-[18px] font-semibold sm:pb-0" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--chart-3)" }}>12-day streak</span>
                <span aria-hidden className="h-1 w-1 rounded-[2px]" style={{ background: "var(--muted-foreground)" }} />
                <span className="sm:hidden" style={{ color: "var(--foreground)" }}>27 cards collected</span>
                <span className="hidden sm:inline" style={{ color: "var(--muted-foreground)" }}>27 cards in your Locker</span>
              </span>
            </div>
          </div>
          {/* Dreamy descending from the top right, sized to the panel
             (cloud fully visible, trail streaming off the corner); the
             cloud itself is clickable */}
          <ResponsiveFlight onOpen={() => setDropOpen(true)} />
        </PanelShell>

        {/* Panel 2 — Continue Where You Left Off */}
        {/* wash derived from the content's world (Business & Money) so the
           whole panel obeys the system, not the old pink rotation */}
        <PanelShell from="color-mix(in srgb, var(--world-business-money-office) 22%, var(--background))">
          <div className="relative z-[2] flex h-full max-w-[620px] flex-col justify-between p-[var(--space-5)] pb-[30px] sm:p-[var(--space-10)] sm:pb-[var(--space-10)]">
            <div className="flex flex-col gap-[var(--space-3)]">
              <CaptionLabel color="var(--world-business-money-office)">CONTINUE WHERE YOU LEFT OFF</CaptionLabel>
              <p className="text-[26px] leading-[1.2] font-extrabold sm:text-[32px] sm:leading-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                The $30B Deal
              </p>
              <p className="max-w-[480px] text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                Step into the deal room at Colbalt Capital. Brief your team, win over the client, and close the
                biggest mandate of your career.
              </p>
            </div>
            <div className="flex w-full max-w-[420px] flex-col gap-[var(--space-2)]">
              <div className="flex items-center justify-between text-[10px] leading-[14px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>62% COMPLETE</span>
                <span style={{ color: "var(--world-business-money-office)" }}>18 min left</span>
              </div>
              <div className="relative h-[6px] w-full rounded-[var(--radius-full,999px)]" style={{ background: "var(--glass-surface-2)" }}>
                <div className="absolute inset-y-0 left-0 w-[62%] rounded-[999px]" style={{ background: "var(--world-business-money-office)", boxShadow: "0 0 9px color-mix(in srgb, var(--world-business-money-office) 50%, transparent)" }} />
              </div>
            </div>
            <div>
              <HeroCta><span className="inline-flex items-center gap-[6px]">Resume Simulation<ArrowRight size={14} strokeWidth={2.75} aria-hidden /></span></HeroCta>
            </div>
          </div>
          <PanelPhoto photo="/images/app/activity-ib-dossier-hero.png" />
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
              <HeroCta><span className="inline-flex items-center gap-[6px]">Explore this career<ArrowRight size={14} strokeWidth={2.75} aria-hidden /></span></HeroCta>
              <span className="text-[13px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--accent-subtle)" }}>
                Featured in 3 Career Worlds
              </span>
            </div>
          </div>
          <PanelPhoto photo="/images/app/poster-uiux-designer.png" fadeRight />
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
      <DailyDropTakeover open={dropOpen} onClose={() => setDropOpen(false)} />
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
  photo: string;
};

// Active Activity Cards (Figma 2537:4570/4587/4603) — copy, colors, progress
// widths straight from the frame.
const ACTIVITIES: Activity[] = [
  {
    badge: "SIMULATION",
    badgeColor: "var(--world-business-money-office)",
    title: "The $30B Deal",
    sub: "Close the mandate at Colbalt Capital",
    fill: 62,
    stat: "62% · 18 min left",
    cta: "Resume simulation",
    photo: "/images/app/activity-ib-dossier.png",
  },
  {
    badge: "GLOSSARY",
    badgeColor: "var(--world-business-money-office)",
    title: "Finance Essentials",
    sub: "6 of 10 terms mastered",
    fill: 60,
    stat: "Set 3 of 5",
    cta: "Continue glossary",
    photo: "/images/app/activity-ib-desk.png",
  },
  {
    badge: "GAME",
    badgeColor: "var(--world-business-money-office)",
    title: "Deal Team Kickoff",
    sub: "Draft the squad, win the pitch",
    fill: 48,
    stat: "Round 3 of 5",
    cta: "Keep playing",
    photo: "/images/app/activity-ib-kickoff.png",
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
        <span className="inline-flex items-center gap-[4px]">{activity.cta}<ArrowRight size={11} strokeWidth={3} aria-hidden /></span>
      </p>
      <div
        aria-hidden
        className="absolute top-0 right-0 h-full w-[132px] overflow-hidden sm:w-[181px]"
        style={{
          maskImage: "linear-gradient(90deg, transparent 0%, #000 38%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 38%)",
        }}
      >
        <img alt="" src={activity.photo} className="absolute inset-0 h-full w-full object-cover object-top" />
      </div>
    </article>
  );
}

export function HomeExperience() {
  return (
    <div className="marketing-v2 relative min-h-dvh w-full" style={{ background: "radial-gradient(1100px 700px at 88% -8%, color-mix(in srgb, var(--hero-accent-purple) 62%, transparent), transparent 62%), radial-gradient(950px 680px at -8% 28%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 60%), radial-gradient(1000px 720px at 72% 112%, color-mix(in srgb, var(--hero-accent-teal) 52%, transparent), transparent 62%), var(--background)", color: "var(--foreground)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src="/images/app/background-space.svg" className="absolute top-0 left-0 h-[2602px] w-full max-w-none object-cover" />
      </div>

      <DesktopNavigation active="Home" />

      {/* Mobile header (logo + streak/XP, per the mobile frame) */}
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
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
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <h2 className="min-w-0 flex-1 text-[19px] leading-[24px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Continue Where You Left Off
            </h2>
            <button type="button" className="mt-[2px] flex-none cursor-pointer text-[14px] leading-[20px] font-bold whitespace-nowrap" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
              <span className="inline-flex items-center gap-[6px]">View all<span className="hidden sm:inline">activity</span><ArrowRight size={15} strokeWidth={2.75} aria-hidden /></span>
            </button>
          </div>
          <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:gap-[var(--space-6)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {ACTIVITIES.map((activity) => (
              <ActivityCard key={activity.title} activity={activity} />
            ))}
          </div>
        </section>

        {/* Mirrors Explore Browse-All's "Recommended for You" rail (same
           title, subtitle, and cards — one source of truth), replacing the
           old "Careers Picked for You" per user direction. */}
        <section aria-label="Recommended for you" className="flex w-full flex-col gap-[var(--space-6)]">
          <div className="flex flex-col gap-[var(--space-1)]">
            <h2 className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Recommended Because You Liked Business &amp; Money
            </h2>
          </div>
          <div className="-mx-5 flex gap-[var(--space-6)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {BROWSE_BECAUSE_LIKED.map((career) => (
              <PosterCard key={career.title} career={career} />
            ))}
          </div>
        </section>

        {/* Career Signal Banner — the loop-closer: evidence from the user's
           own activity (Locker saves, streak) -> the pattern it forms ->
           the action (their plan). Chips are the app's own worlds with real
           counts, so the claim is checkable, and the CTA goes somewhere. */}
        <section
          aria-label="Your signal"
          className="relative w-full overflow-hidden rounded-[var(--radius-2xl)] border p-[27px] sm:min-h-[216px]"
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
                27 cards in, a pattern is forming.
              </p>
              <p className="max-w-[520px] text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                Your saves cluster in three worlds — careers that mix analysis with building things. Your plan
                updates as you save, play, and crack daily drops.
              </p>
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {[
                  { tag: "Business & Money", count: 11, color: "var(--world-business-money-office)" },
                  { tag: "Tech & Engineering", count: 9, color: "var(--world-tech-engineering-design)" },
                  { tag: "Health & Medicine", count: 4, color: "var(--world-health-medicine)" },
                ].map(({ tag, count, color }) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-[var(--space-2)] rounded-[999px] border px-[var(--space-4)] py-[var(--space-2)] text-[13px] leading-[20px] font-semibold backdrop-blur-[10px]"
                    style={{ fontFamily: "var(--font-body)", background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                  >
                    <span aria-hidden className="size-[8px] rounded-full" style={{ background: color }} />
                    {tag}
                    <span style={{ color: "var(--muted-foreground)" }}>{count}</span>
                  </span>
                ))}
              </div>
            </div>
            <a
              href="/career-report"
              className="flex h-[42px] w-full flex-none cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border text-center text-[13px] leading-[18px] font-semibold sm:w-[198px]"
              style={{
                fontFamily: "var(--font-body)",
                borderColor: "var(--glass-border)",
                background: "linear-gradient(90deg, var(--accent), var(--primary))",
                color: "var(--foreground)",
                filter: "drop-shadow(0px 8px 9px rgba(31,82,255,0.32))",
              }}
            >
              View My Plan
              <ArrowRight size={14} strokeWidth={2.75} aria-hidden />
            </a>
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
