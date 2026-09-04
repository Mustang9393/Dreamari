"use client";


import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { SparkBar } from "@/components/flow/SparkBar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Flame, ListChecks, Play, Sparkle, TrendingUp, Users } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "./chrome";
import { PosterCard } from "./PosterCard";
import { BROWSE_BECAUSE_LIKED } from "./catalog";
import { careerSlug } from "@/components/career/slug";
import { DailyDropFlight, DailyDropTakeover } from "@/components/motion-lab/DailyDropDemo";
import { INVESTMENT_BANKING, REGISTERED_NURSE } from "@/components/play/games";
import type { Simulation } from "@/components/play/types";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "@/components/play/progress";
import { WORLD_COLORS, posterTitleFont } from "./worlds";
import { CARD_TEXT_SHADOW } from "./cardChrome";

// Home — v2.1 (Figma 2099:3423), ported section by section: Hero Banner
// (3-panel carousel: Daily Drop / Continue / Trending), Continue rail of
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

/** One highlight panel: a feature card, not a banner (direct feedback,
 *  4 Sept 2026). The photo fills the whole card and pushes in slowly while
 *  the panel is showing; a progressive blur and a left-to-right dark ramp
 *  carry the type; the text block rises in with a stagger each time the
 *  panel comes round. Eyebrow, big title, one HUD line, one action, all in
 *  one tight block at the foot. */
function HeroPanel({
  active,
  photo,
  focus = "50% 20%",
  art,
  eyebrow,
  eyebrowColor,
  title,
  meta,
  children,
}: {
  active: boolean;
  photo?: string;
  focus?: string;
  /** a non-photo hero (Dreamy's flight) drawn behind the text */
  art?: React.ReactNode;
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  const rise = (i: number) => ({ className: "motion-safe:animate-[fade-slide-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]", style: { animationDelay: `${120 + i * 90}ms` } });
  return (
    <div className="relative h-full w-full flex-none overflow-hidden" style={{ background: "#0e0c20", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
      <div aria-hidden className="absolute inset-0">
        {photo && (
          <span key={active ? "on" : "off"} className={`absolute inset-0 ${active ? "motion-safe:animate-[home-hero-push_14s_ease-out_forwards]" : ""}`} style={{ willChange: "transform" }}>
            <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 1200px" className="object-cover" style={{ objectPosition: focus }} priority={active} />
            {/* The frost is a blurred copy of the same photo, masked in: on
               phones it ramps up from the foot, from sm up it ramps in from
               the left so the photo stays sharp on the right. A blurred copy
               (not backdrop-filter) because the photo pushes in while the
               panel shows, and backdrop layers re-rasterising over a moving
               image flickered along the card edges. */}
            <span className="absolute -inset-[3%] sm:hidden" style={{ maskImage: "linear-gradient(to top, black 0%, black 22%, rgba(0,0,0,0.6) 40%, transparent 60%)", WebkitMaskImage: "linear-gradient(to top, black 0%, black 22%, rgba(0,0,0,0.6) 40%, transparent 60%)" }}>
              <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 1200px" className="object-cover" style={{ objectPosition: focus, filter: "blur(16px) saturate(1.05)" }} />
            </span>
            <span className="absolute -inset-[3%] hidden sm:block" style={{ maskImage: "linear-gradient(90deg, black 0%, black 30%, rgba(0,0,0,0.6) 46%, transparent 64%)", WebkitMaskImage: "linear-gradient(90deg, black 0%, black 30%, rgba(0,0,0,0.6) 46%, transparent 64%)" }}>
              <Image src={photo} alt="" fill sizes="1200px" className="object-cover" style={{ objectPosition: focus, filter: "blur(16px) saturate(1.05)" }} />
            </span>
          </span>
        )}
        {art}
        {/* scrims: phones dim the foot, desktop dims the text side and a little of the foot */}
        <span className="absolute inset-0 sm:hidden" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.88) 0%, rgba(12,16,35,0.5) 34%, rgba(12,16,35,0.08) 62%, transparent 100%), linear-gradient(to bottom, rgba(10,9,20,0.4) 0%, rgba(10,9,20,0.1) 40%, transparent 65%)" }} />
        <span className="absolute inset-0 hidden sm:block" style={{ background: "linear-gradient(90deg, rgba(14,12,32,0.9) 0%, rgba(14,12,32,0.72) 26%, rgba(14,12,32,0.3) 48%, transparent 64%), linear-gradient(to top, rgba(12,16,35,0.55) 0%, rgba(12,16,35,0.15) 30%, transparent 55%)" }} />
      </div>
      <div key={active ? "on" : "off"} className="relative z-[2] flex h-full flex-col justify-end gap-[var(--space-2)] p-[var(--space-5)] sm:max-w-[64%] sm:p-[var(--space-8)]">
        <span {...rise(0)}><CaptionLabel color={eyebrowColor}>{eyebrow}</CaptionLabel></span>
        <p {...rise(1)} className={`${rise(1).className} text-[30px] leading-[1.04] font-extrabold text-balance sm:text-[42px]`} style={{ ...rise(1).style, fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
          {title}
        </p>
        {meta && <div {...rise(2)} className={`${rise(2).className} text-[14px] leading-[19px] font-medium`} style={{ ...rise(2).style, fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.86)" }}>{meta}</div>}
        <div {...rise(3)} className={`${rise(3).className} mt-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-4)]`} style={{ ...rise(3).style, textShadow: "none" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** A small HUD chip on the photo: the Play tile's level chip, reused for
 *  the streak and the trend so every panel carries one live-looking mark. */
function HeroChip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-[6px] px-[9px] py-[4px] text-[10.5px] leading-[14px] font-bold tracking-[0.1em] uppercase" style={{ background: "rgba(8,10,22,0.72)", color, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textShadow: "none", fontFamily: "var(--font-body)" }}>
      {children}
    </span>
  );
}

/** The panel action, the same button the career detail header uses. */
function HeroAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold"
      style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-body)" }}
    >
      {children}
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
  const dreamy = phone ? Math.max(96, Math.min(150, w * 0.32)) : Math.max(140, Math.min(280, w * 0.28));
  const textEdge = Math.min(520, w * 0.55);
  const freeCenter = textEdge + (w - textEdge) * 0.42;
  const rightOffset = phone ? (w - dreamy) / 2 : Math.max(14, w - (freeCenter + dreamy / 2));
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-[36%] -translate-y-1/2 sm:top-[46%]"
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
  const router = useRouter();
  const [panel, setPanel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (paused || dropOpen) return;
    // 13 seconds a panel (CEO, 4 Sept): a phone recording showed the old
    // interval left no time to read the headline against everything below.
    const timer = setInterval(() => setPanel((current) => (current + 1) % 3), 13000);
    return () => clearInterval(timer);
  }, [paused, dropOpen]);

  const step = (delta: number) => setPanel((current) => (current + delta + 3) % 3);

  return (
    <section
      aria-label="Highlights"
      className="relative h-[400px] w-full overflow-hidden rounded-[var(--radius-lg)] border sm:h-[360px]"
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
      {/* star dots are Panel 1's night-sky decor. This overlay sits above
         the sliding panel track (not inside it), so it stayed visible over
         Panels 2/3 too once they were reached -- stray white flecks
         floating over an office photo, unrelated to that panel's theme.
         Only render them while Panel 1 is actually showing; light mode
         drops them regardless, same as before. */}
      {panel === 0 && (
        <div aria-hidden data-space-backdrop className="pointer-events-none absolute inset-0 z-[1] motion-safe:animate-[fade-slide-up_0.4s_ease]">
          {SPACE_ACCENTS.map((dot, index) => (
            <span key={index} className="absolute rounded-full" style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, background: "var(--foreground)" }} />
          ))}
        </div>
      )}

      <div className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${panel * 100}%)` }}>
        {/* Panel 1 — Daily Drop: Dreamy's flight is the art, on the dark
           base with one soft violet glow behind him. */}
        <HeroPanel
          active={panel === 0}
          eyebrow="DAILY DROP"
          eyebrowColor="var(--chart-3)"
          title="Discover a new career in 30 seconds"
          meta={
            <span className="flex flex-wrap items-center gap-[var(--space-3)]">
              <HeroChip color="var(--chart-3)"><Flame className="h-[12px] w-[12px]" aria-hidden /> 12-day streak</HeroChip>
              <span>Keep it alive today.</span>
            </span>
          }
          art={
            <>
              <span className="absolute inset-0" style={{ background: "radial-gradient(70% 90% at 72% 38%, color-mix(in srgb, var(--hero-accent-purple) 85%, transparent) 0%, transparent 70%)" }} />
              <ResponsiveFlight onOpen={() => setDropOpen(true)} />
            </>
          }
        >
          {/* The streak is the one reward signal here (CEO note, 4 Sept);
             it lives in the chip above, so the action stands alone. */}
          <HeroAction onClick={() => setDropOpen(true)}>
            <Sparkle className="h-4 w-4" aria-hidden /> Catch the Drop
          </HeroAction>
        </HeroPanel>

        {/* Panel 2 — New game unlocked. Investment Banker already lives in
           the Continue rail below, so the feature slot announces the next
           game instead (direct feedback, 4 Sept 2026). */}
        <HeroPanel
          active={panel === 1}
          photo={REGISTERED_NURSE.cover}
          focus="50% 30%"
          eyebrow="NEW GAME UNLOCKED"
          eyebrowColor={WORLD_COLORS[REGISTERED_NURSE.world]}
          title={`Day in the Life: ${REGISTERED_NURSE.title}`}
          meta={
            <span className="flex flex-wrap items-center gap-[var(--space-3)]">
              <HeroChip color={WORLD_COLORS[REGISTERED_NURSE.world]}>Level {REGISTERED_NURSE.levels[0].n} · {REGISTERED_NURSE.levels[0].role}</HeroChip>
              <span>Your first shift is ready.</span>
            </span>
          }
        >
          <HeroAction onClick={() => router.push(`/play/${REGISTERED_NURSE.id}`)}>
            <Play className="h-4 w-4" fill="currentColor" aria-hidden /> Play
          </HeroAction>
        </HeroPanel>

        {/* Panel 3 — Trending Now. Drone Pilot: a real growth field (commercial
           drone licences keep climbing) outside Health, which panel 2 already
           covers, and a poster whose subject stands on the right where the
           photo is clear. */}
        <HeroPanel
          active={panel === 2}
          photo="/images/app/poster-drone-pilot.png"
          focus="50% 20%"
          eyebrow="TRENDING NOW"
          eyebrowColor="var(--accent-subtle)"
          title="Drone Pilot is on the rise."
          meta={
            <span className="flex flex-wrap items-center gap-[var(--space-3)]">
              <HeroChip color="var(--accent-subtle)"><TrendingUp className="h-[12px] w-[12px]" aria-hidden /> Fast-growing field</HeroChip>
              <span>Film sets, farms, inspections, deliveries.</span>
            </span>
          }
        >
          <HeroAction onClick={() => router.push(`/career/${careerSlug("Drone Pilot")}`)}>
            Explore this career <ArrowRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />
          </HeroAction>
        </HeroPanel>
      </div>

      {/* Desktop prev/next: a pair in the bottom-right corner, out of the
         title's way (they used to sit mid-height and cut across the type) */}
      <div className="absolute right-[22px] bottom-[26px] z-[3] hidden items-center gap-[6px] sm:flex">
        {([["Previous highlight", -1, ChevronLeft], ["Next highlight", 1, ChevronRight]] as const).map(([label, delta, Icon]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => step(delta)}
            className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]"
            style={{ background: "rgba(12,16,35,0.5)", borderColor: "rgba(255,255,255,0.22)", color: "#fff" }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        ))}
      </div>

      {/* Carousel dots + pause: top-right on every screen, clear of the
         actions at the foot */}
      <div className="absolute top-[16px] right-[16px] z-[3] flex items-center gap-[var(--space-3)] sm:top-[22px] sm:right-[22px]">
        {/* story-style segments: the live one fills over the 13s the panel
           holds, so the timing is visible instead of a guess */}
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              aria-label={`Panel ${index + 1}`}
              aria-current={panel === index}
              onClick={() => setPanel(index)}
              className="dm-quiet relative h-[14px] w-[26px] cursor-pointer"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.28)" }}>
                {panel === index && (
                  <span key={`${panel}-${paused}`} className={`absolute inset-y-0 left-0 rounded-full ${paused ? "" : "motion-safe:animate-[home-hero-seg_13s_linear_forwards]"}`} style={{ background: "#fff", width: paused ? "100%" : undefined }} />
                )}
                {panel > index && <span className="absolute inset-0 rounded-full" style={{ background: "#fff" }} />}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={paused ? "Resume carousel" : "Pause carousel"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="dm-link flex h-6 cursor-pointer items-center justify-center gap-[4px]"
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

/** The same words, cover and progress as the Play tab (CEO, 4 Sept): a
 *  game is recognisable anywhere it appears, so the card reads the saved run
 *  the Play tab reads, not a demo figure. */
function useSimRun(sim: Simulation): { pct: number; label: string } {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const first = sim.levels[0];
  const run = readRun(progress, sim.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  const pct = resumable ? Math.round((resumable.index / first.beats.length) * 100) : 0;
  return { pct, label: `Level ${first.n} · ${first.role}${pct ? ` · ${pct}% done` : ""}` };
}

type Activity =
  | { kind: "sim"; sim: Simulation }
  | { kind: "glossary"; title: string; world: string; cover: string; href: string; pct: number; label: string };

// Continue Learning & Playing: the two simulations the app has, and the one
// glossary game, each with the Play tab's own name and cover. "Deal Team
// Kickoff" (a plot beat, not a game) is gone (CEO, 4 Sept).
const ACTIVITIES: Activity[] = [
  { kind: "sim", sim: INVESTMENT_BANKING },
  { kind: "glossary", title: "Finance Glossary Game", world: "Business & Money", cover: "/images/app/glossary-finance-thumb.png", href: "/play/glossary/investment-banking", pct: 60, label: "6 of 10 terms mastered" },
  { kind: "sim", sim: REGISTERED_NURSE },
];

/** One card, built exactly like the Play tab's poster card: cover, the
 *  poster scrim, the title in the world's poster face, the world label in
 *  its colour, the level and progress line, and a play badge in the middle.
 *  The whole card is the link; there is no separate button. */
function ActivityCard({ activity }: { activity: Activity }) {
  const ib = useSimRun(activity.kind === "sim" ? activity.sim : INVESTMENT_BANKING);
  const title = activity.kind === "sim" ? activity.sim.title : activity.title;
  const world = activity.kind === "sim" ? activity.sim.world : activity.world;
  const cover = activity.kind === "sim" ? activity.sim.cover : activity.cover;
  const href = activity.kind === "sim" ? `/play/${activity.sim.id}` : activity.href;
  const pct = activity.kind === "sim" ? ib.pct : activity.pct;
  const label = activity.kind === "sim" ? ib.label : activity.label;
  const verb = pct > 0 ? "Continue" : "Play";
  return (
    <Link href={href} className="dm-tap group relative h-[190px] w-[304px] flex-none overflow-hidden rounded-[var(--radius-lg)] border sm:h-[212px] sm:w-[360px] md:h-auto md:w-auto md:min-w-0 md:flex-1 md:aspect-[360/212]" style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}>
      <span className="sr-only">{verb} {title}</span>
      <Image src={cover} alt="" fill sizes="360px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 flex size-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110" style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}>
        <Play className="ml-[3px] h-[22px] w-[22px]" fill="currentColor" style={{ color: "#FFFFFF" }} />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-[4px] px-[14px] pt-[32px] pb-[12px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
        {activity.kind === "sim" && <span className="block text-[10px] font-semibold tracking-[0.6px] uppercase" style={{ fontFamily: "var(--font-body)", color: "var(--poster-title)", opacity: 0.75 }}>Day in the Life</span>}
        <span className="block text-[20px] leading-[1.15] font-extrabold uppercase" style={{ ...posterTitleFont(world), color: "var(--poster-title)" }}>{title}</span>
        <span className="block text-[10px] font-semibold tracking-[0.6px] uppercase" style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[world] }}>{world}</span>
        <span className="mt-[2px] text-[12px] leading-[15px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--poster-title)", opacity: 0.85 }}>{label}</span>
        {pct > 0 && <span aria-hidden className="block w-full max-w-[220px]"><SparkBar percent={pct} height={5} track="color-mix(in srgb, var(--poster-title) 25%, transparent)" fill="var(--primary)" glow="var(--primary)" /></span>}
      </span>
    </Link>
  );
}

export function HomeExperience() {
  const router = useRouter();
  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)" }}>
      <AppBackdrop />

      <h1 className="sr-only">Home</h1>
      <DesktopNavigation active="Home" />

      {/* Mobile header (logo + streak/XP, per the mobile frame) */}
      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <span className="flex items-center gap-[var(--space-4)] text-[13px] font-bold" style={{ fontFamily: "var(--font-body)" }}>
          <span className="flex items-center gap-[6px]" style={{ color: "var(--accent-subtle)" }}>
            <Flame className="h-4 w-4" /> 12
          </span>
          <span className="flex items-center gap-[6px]" style={{ color: "var(--world-business-money-office)" }}>
            <Sparkle className="h-4 w-4" /> 15,980 XP
          </span>
          <QuickLinksMenu />
        </span>
      </header>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--space-10)] px-5 pt-4 pb-[120px] sm:gap-[var(--space-14)] sm:px-[var(--space-14)] sm:pt-[var(--space-10)]">
        <HeroBanner />

        <section aria-label="Continue learning and playing" className="flex w-full flex-col gap-[var(--space-5)]">
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <h2 className="min-w-0 flex-1 text-[19px] leading-[24px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Continue Learning & Playing
            </h2>
            <button type="button" className="dm-link mt-[2px] flex-none cursor-pointer text-[14px] leading-[20px] font-bold whitespace-nowrap" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
              <span className="inline-flex items-center gap-[6px]">View all<span className="hidden sm:inline">activity</span><ArrowRight size={15} strokeWidth={2.75} aria-hidden /></span>
            </button>
          </div>
          <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:gap-[var(--space-6)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {ACTIVITIES.map((activity) => (
              <ActivityCard key={activity.kind === "sim" ? activity.sim.id : activity.href} activity={activity} />
            ))}
          </div>
        </section>

        {/* Mirrors Explore Browse-All's "Recommended for You" rail (same
           title, subtitle, and cards — one source of truth), replacing the
           old "Careers Picked for You" per user direction. */}
        <section aria-label="Recommended for you" className="flex w-full flex-col gap-[var(--space-6)]">
          <div className="flex flex-col gap-[var(--space-1)]">
            <div className="flex items-end justify-between gap-[var(--space-4)]">
              <div className="flex flex-col gap-[2px]">
                <h2 className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  Explore Recommended Careers
                </h2>
                <p className="text-[12px] leading-[16px] font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                  Based on your interests
                </p>
              </div>
              <a
                href="/explore?tab=browse"
                className="dm-link inline-flex flex-none items-center gap-[6px] text-[13px] leading-[18px] font-semibold"
                style={{ fontFamily: "var(--font-body)", color: "var(--accent-subtle)" }}
              >
                Explore All Careers
                <ArrowRight size={14} strokeWidth={2.75} aria-hidden />
              </a>
            </div>
          </div>
          <div className="-mx-5 flex gap-[var(--space-6)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {BROWSE_BECAUSE_LIKED.map((career) => (
              <PosterCard key={career.title} career={career} onClick={() => router.push(`/career/${careerSlug(career.title)}`)} />
            ))}
          </div>
        </section>

        {/* Your Next Moves (CEO, 4 Sept): three static actions in place of the
           personalised "27 cards, a pattern is forming" banner, which needed
           tracking the backend does not have. The three change whenever a
           feature needs attention. */}
        <section aria-labelledby="next-moves-title" className="flex w-full flex-col gap-[var(--space-5)]">
          <h2 id="next-moves-title" className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Your Next Moves
          </h2>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
            {[
              { title: "My Plan", body: "Turn your dream career into clear next steps.", href: "/profile?tab=plan", Icon: ListChecks },
              { title: "Community Boards", body: "Ask questions alongside fellow students and hear directly from professionals in the field.", href: "/connect", Icon: Users },
              { title: "Resume Builder", body: "Get ready for internships, jobs, and future opportunities.", href: "/profile?tab=resume", Icon: FileText },
            ].map(({ title, body, href, Icon }) => (
              <Link key={title} href={href} className="dm-tap group flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <span className="flex items-center justify-between">
                  <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}>
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <ArrowRight size={16} strokeWidth={2.5} aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]" style={{ color: "var(--muted-foreground)" }} />
                </span>
                <span className="flex flex-col gap-[4px]">
                  <span className="text-[17px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</span>
                  <span className="text-[14px] leading-[20px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>{body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <MobileNav active="Home" />
    </div>
  );
}
