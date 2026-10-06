"use client";

import Image from "next/image";
import { awardDreamScore, useDreamScore } from "@/lib/dreamScore";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ChevronLeft, ChevronRight, ArrowUpCircle, Bug, Building2, Check, CircleDollarSign, Database, Flame, HeartPulse, LockKeyhole, Map as MapIcon, Mountain, Paintbrush, Plug, Siren, Sparkles, Stethoscope, UserRound, Trophy, Volume2, VolumeX, Wind, Workflow, X, Zap, RotateCw } from "lucide-react";
import { LocalBurst } from "@/components/build/DreamyGuide";
import { QuickLinksMenu } from "@/components/app/chrome";
import { WORLD_COLORS } from "@/components/app/worlds";
import { useGlobalTheme, type GlobalTheme } from "@/components/app/theme";
import {
  mutedSnapshot,
  playCorrect,
  playSelect,
  playFlip,
  playSceneChange,
  playSweep,
  playWrong,
  serverMutedSnapshot,
  setMuted,
  subscribeMuted,
} from "@/components/play/sound";
import {
  saveLessonComplete,
} from "./progress";
import type { GlossaryCareer, GlossaryLesson, GlossaryQuestion } from "./data";
import { SparkBar } from "@/components/flow/SparkBar";

// Glossary Game — built from the Replit reference at /ib-glossary-game plus
// the DreamAri_Glossary_Content_Template_v1.xlsx schema, then reskinned into
// Dreamari's own tokens rather than the reference's teal/violet palette:
// the main game uses var(--glossary-accent) -- set once, on this file's root
// wrapper, to the playing career's own world color (WORLD_COLORS), so
// Finance keeps the amber (--world-business-money-office, the DTCG token
// already annotated "(Glossary Challenge)") it launched with while Aviation,
// Healthcare and Tech each get their own world's accent instead of
// inheriting Finance's amber. Power Play still uses var(--hero-accent-purple),
// the same violet Play's own hub background already blends in, so the bonus
// round's color shift matches a palette this app already owns instead of
// inventing a new one.
//
// Dreamy reuses the exact mascot already in the sprite library
// (public/images/dreamy/v2/dreamy-*.png, the same flat pose-swap the Build
// flow's DreamyGuide and SimulationPlayer's own floating Dreamy use) rather
// than SimulationPlayer's SceneCharacter/expressionFor system, which is
// purpose-built for a person photographed standing in a specific room and
// would be pure overhead for a floating cloud.

type Screen =
  | "intro"
  | "dreamyIntro"
  | "lessonIntro"
  | "unlock"
  | "unlockComplete"
  | "question"
  | "powerPlayIntro"
  | "powerPlay"
  | "masteryLoading"
  | "complete";

type ExperienceVariant = "default" | "lab";
type LabAtmosphere = "v1" | "v2" | "v3" | "v4";

const TERM_ASSETS: Record<string, string> = {
  Company: "/images/glossary/studio-v5/company.webp",
  Product: "/images/glossary/studio-v5/product.webp",
  Service: "/images/glossary/studio-v5/service.webp",
  Customer: "/images/glossary/studio-v5/customer.webp",
  Profit: "/images/glossary/studio-v5/profit.webp",
};

// The Signal theme's own set (Chandu, 6 Oct 2026, with the pixel assets and
// the "Business Basics Quiz" reference: "for the signal version, please use
// these assets and also the background used in this html file"): pixel art
// of the lesson's own story. The company is the glass office, the product
// is the chunky sneaker, the service is the sneaker with the designer's
// palette, the customer is the cloud lighting up at a SALE sneaker, profit
// is the coin stack. The mascot is the pixel cloud, with a speaking gif.
const SIGNAL_ASSETS: Record<string, string> = {
  Company: "/images/glossary/signal/building.webp",
  Product: "/images/glossary/signal/sneaker.webp",
  Service: "/images/glossary/signal/palette-sneaker.webp",
  Customer: "/images/glossary/signal/cloud-sale-sneaker.webp",
  Profit: "/images/glossary/signal/coins.png",
};
// Icon-sized uses (option art, HUD tokens, match tiles, buckets) take the
// 320px cuts: a 1024px sheet for a 40px icon was most of the page weight
// (Chandu, 6 Oct 2026: "the games were slow and loading assets slow").
const SIGNAL_ASSETS_SMALL: Record<string, string> = {
  Company: "/images/glossary/signal/building-320.webp",
  Product: "/images/glossary/signal/sneaker-320.webp",
  Service: "/images/glossary/signal/palette-sneaker-320.webp",
  Customer: "/images/glossary/signal/cloud-sale-sneaker-320.webp",
  Profit: "/images/glossary/signal/coins-320.webp",
};
const SIGNAL_CLOUD = "/images/glossary/signal/cloud-320.webp";
const SIGNAL_CLOUD_LARGE = "/images/glossary/signal/cloud.webp";
// The speaking gif, re-encoded as an animated webp (618KB -> 189KB).
const SIGNAL_CLOUD_SPEAKING = "/images/glossary/signal/cloud-speaking.webp";
const SIGNAL_BG = "/images/glossary/signal/bg.webp";

/** The playing theme, so every component (term art, mascot, bubble) can
 *  swap its skin without a prop threaded through forty call sites. */
const AtmosphereContext = createContext<LabAtmosphere>("v1");
function useAtmosphere(): LabAtmosphere {
  return useContext(AtmosphereContext);
}
function assetsFor(atmosphere: LabAtmosphere, size: "large" | "small" = "large"): Record<string, string> {
  if (atmosphere !== "v2") return TERM_ASSETS;
  return size === "small" ? SIGNAL_ASSETS_SMALL : SIGNAL_ASSETS;
}
/** The theme's term art. `small` for anything drawn under ~64px. */
function useTermAssets(size: "large" | "small" = "large"): Record<string, string> {
  return assetsFor(useAtmosphere(), size);
}

const MASTERY_TARGET = 2;

// The accent fill (--glossary-accent) that works well on this game's
// near-black dark background reads muddy once a world token's own light-mode
// value (darkened for text contrast, not fill contrast) gets used as a
// full-width button. Rather than lean on that token for buttons in light
// mode, swap to the marketing-v2 scope's own foreground/background pair,
// which is already correctly inverted per theme (light mode: near-black on
// near-white) -- no new tokens, just picking the right existing one per mode.
function primaryCtaColors(theme: GlobalTheme) {
  return theme === "light"
    ? { background: "var(--foreground)", color: "var(--background)" }
    : { background: "var(--glossary-accent)", color: "#05070f" };
}

// Term icons are a semantic slug from the content template (its Icon column
// is plain words -- "building", "sneaker" -- not an emoji), resolved here to
// a real icon from the design system. No raw emoji anywhere in this game --
// unmapped slugs fall back to a plain circle rather than guessing wrong.
/** A sneaker, in lucide's own stroke language -- the one drawing the Dream
 *  Sneakers lesson actually needs and the icon set doesn't have. */
function SneakerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {/* The chunky sole, the unmistakable part. */}
      <path d="M2.5 15.8h19c0 1.5-1.2 2.7-2.7 2.7H5.2c-1.5 0-2.7-1.2-2.7-2.7z" />
      {/* Upper: ankle collar at the heel, lace slope, low toe box. */}
      <path d="M2.5 15.8v-4c0-.8.6-1.4 1.4-1.4h1.7c.6 0 1.1-.3 1.3-.9l.7-1.8c.2-.6.9-.9 1.5-.5l1.4.9c1.9 1.2 4 2 6.2 2.4l2 .4c1.6.3 2.8 1.7 2.8 3.4v1.5" />
      {/* Laces. */}
      <path d="M9.6 9.3l2.1 1.2" />
      <path d="M8.8 11.2l2.1 1.2" />
      <path d="M8 13.1l2.1 1.2" />
      {/* The side stripe. */}
      <path d="M13.5 15.8c.4-1.6 1.6-2.8 3.2-3.2" />
    </svg>
  );
}

// Illustrations stay RELEVANT to the lesson's own story (direct feedback):
// the product IS a sneaker, the service IS custom design (a brush, not a
// bell), the customer is a PERSON -- not abstract finance-concept stand-ins.
const TERM_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  sneaker: SneakerIcon,
  palette: Paintbrush,
  "shopping-bag": UserRound,
  "money-bag": CircleDollarSign,
  // Aviation (Airline Pilot)
  thrust: Flame,
  lift: ArrowUpCircle,
  drag: Wind,
  altitude: Mountain,
  // Healthcare (Registered Nurse)
  stethoscope: Stethoscope,
  "heart-pulse": HeartPulse,
  pulse: Activity,
  siren: Siren,
  // Tech (Software Engineer)
  plug: Plug,
  database: Database,
  bug: Bug,
  workflow: Workflow,
};

function TermIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = TERM_ICON_MAP[icon] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}

function termAssetFor(label: string, assets: Record<string, string> = TERM_ASSETS): string | null {
  const normalized = label.toLowerCase();
  if (normalized.includes("profit") || normalized.includes("money") || normalized.includes("revenue")) return assets.Profit;
  if (normalized.includes("customer") || normalized.includes("buyer") || normalized.includes("person")) return assets.Customer;
  if (normalized.includes("service") || normalized.includes("custom") || normalized.includes("design")) return assets.Service;
  if (normalized.includes("product") || normalized.includes("sneaker")) return assets.Product;
  if (normalized.includes("company") || normalized.includes("dream sneakers") || normalized.includes("organization")) return assets.Company;
  return null;
}

/** Signal's mascot: the pixel cloud with the reference's pixel glasses and
 *  blink, speaking (the gif) for a couple of seconds whenever it has a new
 *  line, then still. `pose` keeps Dreamy's vocabulary: party gets pixel
 *  sparkles, puzzle a tilt. */
function SignalCloud({ pose, size }: { pose: string; size: number }) {
  const talks = pose === "curious" || pose === "party" || pose === "puzzle" || pose === "idea" || pose === "happy";
  const [speaking, setSpeaking] = useState(talks);
  const [nonce] = useState(() => Date.now());
  useEffect(() => {
    if (!talks) return;
    const timer = window.setTimeout(() => setSpeaking(false), 2600);
    return () => window.clearTimeout(timer);
  }, [talks, pose]);
  return (
    <span className={`glossary-signal-cloud ${speaking ? "is-speaking" : ""} is-${pose}`} style={{ width: size, height: size * (1024 / 1536) }} aria-hidden>
      {pose === "party" && (
        <>
          <i className="glossary-signal-spark" style={{ left: "-8%", top: "4%" }} />
          <i className="glossary-signal-spark" style={{ right: "-6%", top: "-6%", animationDelay: ".4s" }} />
          <i className="glossary-signal-spark" style={{ left: "6%", bottom: "-4%", animationDelay: ".8s" }} />
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- a gif, and a pixel-art sheet that must not be resampled */}
      <img src={speaking ? `${SIGNAL_CLOUD_SPEAKING}?t=${nonce}` : size > 180 ? SIGNAL_CLOUD_LARGE : SIGNAL_CLOUD} alt="" width={1536} height={1024} loading="eager" decoding="async" style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
      <svg viewBox="0 0 1536 1024" shapeRendering="crispEdges">
        <g className="glossary-signal-lid"><rect x="438" y="418" width="232" height="285" fill="#dff4fc" /><rect x="448" y="668" width="212" height="18" fill="#0a1230" /></g>
        <g className="glossary-signal-lid"><rect x="878" y="418" width="232" height="285" fill="#dff4fc" /><rect x="888" y="668" width="212" height="18" fill="#0a1230" /></g>
        <polygon points="445,400 655,400 655,440 695,440 695,670 655,670 655,710 445,710 445,670 405,670 405,440 445,440" fill="rgba(255,255,255,.2)" stroke="#0a1230" strokeWidth="22" strokeLinejoin="miter" />
        <rect x="460" y="455" width="60" height="22" fill="#fff" /><rect x="460" y="485" width="22" height="22" fill="#fff" />
        <polygon points="885,400 1095,400 1095,440 1135,440 1135,670 1095,670 1095,710 885,710 885,670 845,670 845,440 885,440" fill="rgba(255,255,255,.2)" stroke="#0a1230" strokeWidth="22" strokeLinejoin="miter" />
        <rect x="900" y="455" width="60" height="22" fill="#fff" /><rect x="900" y="485" width="22" height="22" fill="#fff" />
        <rect x="695" y="510" width="150" height="26" fill="#0a1230" /><rect x="320" y="510" width="85" height="26" fill="#0a1230" /><rect x="1135" y="510" width="85" height="26" fill="#0a1230" />
      </svg>
    </span>
  );
}

function DreamyFace({ pose, size = 96 }: { pose: "happy" | "glasses" | "idea" | "curious" | "party" | "nervous" | "puzzle" | "heart"; size?: number }) {
  const atmosphere = useAtmosphere();
  if (atmosphere === "v2") return <SignalCloud pose={pose} size={size * 1.6} />;
  return (
    <span key={pose} className="glossary-dreamy-face glossary-dreamy-actor" data-pose={pose} style={{ width: size, height: size }} aria-hidden>
      <span className="glossary-dreamy-aura" />
      <Image
        src={pose === "happy" ? "/images/dreamy/studio-v3/dreamy-happy.webp" : `/images/dreamy/v2/dreamy-${pose}.png`}
        alt=""
        width={size * 1.5}
        height={size * 1.5}
        className="glossary-dreamy-sprite"
        style={{ width: size, height: size }}
      />
    </span>
  );
}

function SpeechBubble({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "correct" | "wrong" }) {
  const atmosphere = useAtmosphere();
  const bg = tone === "correct" ? "color-mix(in srgb, var(--success, #1f9d55) 14%, var(--card))" : tone === "wrong" ? "color-mix(in srgb, var(--danger, #e0483e) 12%, var(--card))" : "var(--glass-surface-1)";
  if (atmosphere === "v2") {
    // The reference's bubble: white, Press Start 2P, a 4px pixel border
    // drawn with shadows, a pixel tail pointing down at the cloud.
    return (
      <div className="glossary-speech-bubble glossary-signal-bubble">
        <p>{children}</p>
        <svg className="glossary-signal-tail" width="28" height="12" viewBox="0 0 7 3" shapeRendering="crispEdges" aria-hidden>
          <rect x="1" y="0" width="1" height="1" fill="#0a1230" /><rect x="2" y="0" width="3" height="1" fill="#fff" /><rect x="5" y="0" width="1" height="1" fill="#0a1230" />
          <rect x="2" y="1" width="1" height="1" fill="#0a1230" /><rect x="3" y="1" width="1" height="1" fill="#fff" /><rect x="4" y="1" width="1" height="1" fill="#0a1230" />
          <rect x="3" y="2" width="1" height="1" fill="#0a1230" />
        </svg>
      </div>
    );
  }
  return (
    <div className="glossary-speech-bubble flex min-w-0 flex-1 items-start rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)]" style={{ background: bg, borderColor: "var(--glass-border)" }}>
      <p className="text-[clamp(18px,2.6dvh,21px)] leading-[1.35] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
        {children}
      </p>
    </div>
  );
}

function MuteToggle() {
  const muted = useSyncExternalStore(subscribeMuted, mutedSnapshot, serverMutedSnapshot);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) playSelect();
      }}
      aria-pressed={muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
    >
      {muted ? <VolumeX className="h-[17px] w-[17px]" aria-hidden /> : <Volume2 className="h-[17px] w-[17px]" aria-hidden />}
    </button>
  );
}

function TopBar({ onBack, onOpenLevels, atmosphere, onAtmosphereChange, onRestart }: { onBack: () => void; onOpenLevels?: () => void; atmosphere?: LabAtmosphere; onAtmosphereChange?: (next: LabAtmosphere) => void; onRestart?: () => void }) {
  const [themesOpen, setThemesOpen] = useState(false);
  useEffect(() => {
    if (!themesOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setThemesOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [themesOpen]);
  return (
    <header className="glossary-topbar relative z-10 flex items-center justify-between px-5 pt-5 md:px-8">
      <button type="button" onClick={onBack} aria-label="Back" className="dm-quiet flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      {/* Mute stays (it is this game's own control); everything else is the
         app's one hamburger, same as every screen. */}
      <div className="flex items-center gap-[var(--space-2)]">
        {onOpenLevels ? (
          <button type="button" onClick={onOpenLevels} className="glossary-levels-trigger dm-quiet flex min-h-9 cursor-pointer items-center gap-[7px] rounded-full border px-3 text-[12px] font-bold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
            <MapIcon className="h-[15px] w-[15px]" aria-hidden /> Levels
          </button>
        ) : null}
        {atmosphere && onAtmosphereChange ? (
          <div className="glossary-topbar-theme">
            <button type="button" className="glossary-topbar-action dm-quiet" aria-label={`Theme: ${LAB_ATMOSPHERES.find((entry) => entry.id === atmosphere)?.label}. Change theme`} aria-expanded={themesOpen} onClick={() => setThemesOpen((open) => !open)}>
              <Paintbrush className="h-[16px] w-[16px]" aria-hidden /><span>{LAB_ATMOSPHERES.find((entry) => entry.id === atmosphere)?.label}</span>
            </button>
            {themesOpen && <div className="glossary-topbar-theme-menu" role="group" aria-label="Game themes">
              {LAB_ATMOSPHERES.map((entry) => <button key={entry.id} type="button" aria-pressed={atmosphere === entry.id} onClick={() => { onAtmosphereChange(entry.id); setThemesOpen(false); window.setTimeout(playSelect, 0); }}><b>{entry.label}</b><small>{entry.detail}</small></button>)}
            </div>}
          </div>
        ) : null}
        {onRestart ? <button type="button" className="glossary-topbar-action glossary-restart-action dm-quiet" onClick={onRestart} aria-label="Restart game" title="Restart game"><RotateCw className="h-[16px] w-[16px]" aria-hidden /><span>Restart</span></button> : null}
        <MuteToggle />
        <QuickLinksMenu />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Screen: Intro ("Meet {Company}")

function IntroScreen({ lesson, onNext, variant = "default", atmosphere = "v1" }: { lesson: GlossaryLesson; onNext: () => void; variant?: ExperienceVariant; atmosphere?: LabAtmosphere }) {
  const { theme } = useGlobalTheme();
  if (variant === "lab") {
    return (
      <div className="glossary-screen glossary-intro-screen glossary-welcome-scene relative flex w-full flex-1 items-center justify-center px-5 py-[var(--space-5)]" data-atmosphere={atmosphere}>
        <div className="glossary-welcome-copy">
          <span className="glossary-welcome-kicker"><Sparkles aria-hidden /> Level 01 · {lesson.title}</span>
          <h1><span>Meet</span><em>{lesson.exampleCompany}</em></h1>
          <p>Learn business by playing it.</p>
          <button type="button" onClick={onNext} className="dm-solid glossary-welcome-cta flex cursor-pointer items-center justify-center gap-[8px] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold" style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}>
            Start <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="glossary-welcome-world" aria-hidden>
          {atmosphere === "v2"
            ? <Image src={SIGNAL_ASSETS.Customer} alt="" width={960} height={540} priority unoptimized className="glossary-welcome-hero glossary-signal-hero" />
            : <Image src="/images/glossary/studio-v4/hero-scene.webp" alt="" width={960} height={960} priority className="glossary-welcome-hero" />}
        </div>
      </div>
    );
  }
  return (
    <div className="glossary-screen glossary-intro-screen flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)] text-center">
      <DreamyFace pose="idea" size={64} />
      <div className="flex w-full max-w-[480px] flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <h1 className="text-[26px] leading-[32px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Meet {lesson.exampleCompany}
        </h1>
        <p className="text-[15px] leading-[21px]" style={{ color: "var(--foreground)" }}>
          You&apos;ll learn finance words using {lesson.exampleCompany} as your example.
        </p>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="dm-solid flex w-full max-w-[480px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Next <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Dreamy's onboarding line

function DreamyIntroScreen({ onStart }: { onStart: () => void }) {
  const { theme } = useGlobalTheme();
  return (
    <div className="glossary-screen glossary-dreamy-intro-screen flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)]">
      {/* Dreamy overlaps down from above the bubble's top edge only -- no
         side padding compensating for him, so the bubble itself stays a
         plain full-width, centered box. Padding the bubble sideways to
         "make room" for him was shifting the bubble (and its text)
         off-center on mobile, where this wrapper is close to the full
         viewport width and the shift reads as a real layout bug. */}
      <div className="relative w-full max-w-[520px] pt-8">
        <span className="absolute -top-8 left-5 z-10">
          <DreamyFace pose="happy" size={64} />
        </span>
        <SpeechBubble>Hi, I&apos;m Dreamy! Let&apos;s get started.</SpeechBubble>
      </div>
      <div className="flex w-full max-w-[520px] flex-col gap-[var(--space-3)]">
        <button
          type="button"
          onClick={onStart}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
          style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
        >
          Start Learning Finance <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Lesson intro (company value meter + word chips)

function LessonIntroScreen({ lesson, onStart }: { lesson: GlossaryLesson; onStart: () => void }) {
  const { theme } = useGlobalTheme();
  const pct = Math.round((lesson.companyValue / lesson.nextCompanyValue) * 100);
  return (
    <div className="glossary-screen glossary-lesson-intro-screen flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)] text-center">
      <DreamyFace pose="glasses" size={64} />
      <h1 className="text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Finance Language
      </h1>

      <div className="flex w-full max-w-[440px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] p-[var(--space-4)]" style={{ background: "color-mix(in srgb, var(--glossary-accent) 14%, var(--card))" }}>
          <span className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--glossary-accent)" }}>
            ${lesson.companyValue.toLocaleString()}
          </span>
          {/* Floored (min) so the bar never opens on a literal empty track --
             a future lesson's own companyValue/nextCompanyValue numbers
             could otherwise round to 0%, which reads as "no progress
             possible here" rather than "the start of a journey." */}
          <SparkBar percent={pct} min={4} height={6} track="var(--glass-surface-2)" fill="var(--glossary-accent)" glow="var(--glossary-accent)" />
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Next: ${lesson.nextCompanyValue.toLocaleString()} · {lesson.nextMilestone}
          </span>
        </div>

        <div className="flex flex-wrap gap-[var(--space-2)]">
          {lesson.terms.map((term) => (
            <span key={term.id} className="rounded-[var(--radius-sm)] border px-[var(--space-4)] py-[6px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              {term.term}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="dm-solid flex w-full max-w-[440px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Start Lesson {lesson.lessonNumber} <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Term unlock carousel

/** The flipbook page's front face: the term drawn, not written -- its icon
 *  blown up to illustration size and run through a wobble displacement
 *  filter, so the clean vector strokes read as pencil on paper. Ruled
 *  lines and a hand-placed tilt finish the sketchbook feel without a
 *  single new image asset. */
function SketchFace({ term, definition, icon, artSrc, style }: { term: string; definition?: string; icon: string; artSrc?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`glossary-flashcard-front absolute inset-0 flex flex-col items-center justify-center gap-[clamp(8px,2dvh,18px)] overflow-hidden rounded-[var(--radius-lg)] border [backface-visibility:hidden] ${artSrc ? "glossary-lab-card-face" : ""}`}
      style={{
        background:
          "repeating-linear-gradient(180deg, transparent 0px, transparent 26px, color-mix(in srgb, var(--glass-border) 55%, transparent) 27px), color-mix(in srgb, var(--glossary-accent) 4%, var(--card))",
        borderColor: "var(--glass-border)",
        boxShadow: "0 18px 40px -22px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {/* The wobble filter that makes every stroke look hand-drawn. Defined
         here, used by the illustration below. */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id="glossary-sketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
      </svg>
      <span className="glossary-flashcard-art relative -rotate-2" style={{ filter: artSrc ? undefined : "url(#glossary-sketch)", color: "color-mix(in srgb, var(--foreground) 82%, transparent)" }}>
        {artSrc ? (
          <Image src={artSrc} alt="" width={360} height={360} className="h-[clamp(148px,26dvh,220px)] w-[clamp(148px,26dvh,220px)] object-contain" priority unoptimized />
        ) : (
          <TermIcon icon={icon} className="h-[clamp(72px,16dvh,120px)] w-[clamp(72px,16dvh,120px)]" />
        )}
        {/* Radiating sketch dashes, the doodle around the drawing. */}
        <svg viewBox="0 0 120 120" aria-hidden className="absolute -inset-[26px] h-[calc(100%+52px)] w-[calc(100%+52px)]" style={{ color: "var(--glossary-accent)" }}>
          {[30, 90, 150, 210, 270, 330].map((deg) => (
            <line key={deg} x1="60" y1="4" x2="60" y2="14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${deg} 60 60)`} />
          ))}
        </svg>
      </span>
      <span className="glossary-flashcard-title flex flex-col items-center gap-[3px]">
        <span className="text-[clamp(26px,5.8dvh,34px)] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", filter: "url(#glossary-sketch)" }}>
          {term}
        </span>
        {/* The hand-drawn underline squiggle. */}
        <svg viewBox="0 0 120 8" aria-hidden className="h-[8px] w-[110px]" style={{ color: "var(--glossary-accent)", filter: "url(#glossary-sketch)" }}>
          <path d="M2 5 Q 20 1, 40 4 T 78 4 T 118 3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      {artSrc && definition ? (
        <span className="glossary-flashcard-definition block max-w-[340px] px-4 text-center text-[clamp(13px,2.2dvh,15px)] leading-[1.4] font-semibold" style={{ color: "var(--foreground)" }}>
          {definition}
        </span>
      ) : null}
      <span className="flex items-center gap-[6px] text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        <RotateCw className="h-[12px] w-[12px] motion-safe:animate-[play-nudge_1.4s_ease-in-out_infinite]" aria-hidden />
        {artSrc ? "Tap for an example" : "Tap to flip"}
      </span>
    </span>
  );
}

function UnlockScreen({
  lesson,
  index,
  onUnlock,
  variant = "default",
  atmosphere = "v1",
}: {
  lesson: GlossaryLesson;
  index: number;
  onUnlock: () => void;
  variant?: ExperienceVariant;
  atmosphere?: LabAtmosphere;
}) {
  const term = lesson.terms[index];
  const assets = useTermAssets();
  const reduced = useReducedMotion();
  const { theme } = useGlobalTheme();
  // The flipbook: each term's page starts on its sketch face and flips in
  // real 3D to the written side. Reset per term (a new page starts art-up).
  const [flipped, setFlipped] = useState(false);
  const [flippedFor, setFlippedFor] = useState(term.id);
  if (flippedFor !== term.id) {
    setFlippedFor(term.id);
    setFlipped(false);
  }
  return (
    <div className="glossary-screen glossary-unlock-screen flex w-full flex-1 flex-col items-center justify-center gap-[clamp(10px,3.5dvh,28px)] px-5 py-[clamp(8px,3dvh,32px)] text-center">
      {/* No Dreamy on this screen -- it repeats 5 times as the student cycles
         through terms, and is the tightest screen for vertical space (the
         binder card + 5-term progress row + button already fill a short
         mobile viewport). He's still present on the screens before and
         after this one. Every size/gap below is a `clamp(min, Ndvh, max)`
         tied to the ACTUAL available height rather than a width breakpoint
         -- it shrinks continuously as the viewport gets shorter (guarantees
         no scroll even on an old, small phone) and grows continuously up to
         its max on anything roomier, with iPhone 15 Safari's usable height
         landing comfortably inside that range rather than at either edge. */}
      <h2 className="text-[clamp(18px,3.2dvh,26px)] leading-[1.25] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        {lesson.title}
      </h2>

      {/* The icon-node progress row is GONE (direct feedback): the flipbook
         card below carries the big illustration now, so a second row of
         term icons above it was saying the same thing twice. A quiet count
         keeps orientation without the clutter. */}
      <p className="text-[12px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        Term {index + 1} of {lesson.terms.length}
      </p>

      {/* The FLIPBOOK page (direct feedback): illustration side up first --
         a sketch-style drawing of the term -- and a real 3D flip to the
         written side with the definition and example. Term-to-term still
         page-turns via the scaleX swap.
         3D SAFETY: an earlier rotateY attempt reproducibly went invisible
         after the second swap -- Chromium can stop repainting an element
         that is both 3D-rotated AND clipped with rounded corners once its
         transform settles. This build avoids that trap structurally: the
         ROTATING wrapper has no border-radius and no overflow clipping
         (each face clips itself), the rotation is a user-toggled two-state
         spring rather than an exit/enter identity reset, and the faces sit
         on backface-visibility rather than remounting. Reduced-motion
         crossfades instead of rotating. */}
      <div className="glossary-flashbook-shell relative w-full max-w-[440px]" data-atmosphere={variant === "lab" ? atmosphere : undefined} style={{ perspective: "1400px" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={term.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.35 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.35 }}
            transition={{ duration: reduced ? 0.12 : 0.32, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: "left center" }}
          >
            <motion.button
              type="button"
              onClick={() => {
                setFlipped((f) => !f);
                window.setTimeout(playFlip, 0);
              }}
              aria-pressed={flipped}
              aria-label={variant === "lab" ? (flipped ? `${term.term}: back to the definition` : `${term.term}: show the example`) : (flipped ? `${term.term}: show the drawing` : `${term.term}: flip to the definition`)}
              animate={reduced || variant === "lab" ? undefined : { rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 210, damping: 22 }}
              className="relative block h-[clamp(240px,40dvh,330px)] w-full cursor-pointer text-left"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT: the drawing. A direct child of the rotating element,
                 so its backface-visibility participates in the button's own
                 3D context rather than being flattened by a wrapper. */}
              {(variant === "default" || !flipped) ? (
                <SketchFace term={term.term} definition={variant === "lab" ? term.definition : undefined} icon={term.icon} artSrc={variant === "lab" ? assets[term.id] : undefined} style={reduced && flipped ? { opacity: 0, transition: "opacity 0.15s" } : undefined} />
              ) : null}

              {/* BACK: the written page, ring-bound edge and all. */}
              {(variant === "default" || flipped) ? <span
                className={`glossary-flashcard-back absolute inset-0 flex overflow-hidden rounded-[var(--radius-lg)] border [backface-visibility:hidden] ${variant === "lab" ? "glossary-lab-card-face" : ""}`}
                style={{
                  background: "var(--card)",
                  borderColor: "var(--glass-border)",
                  boxShadow: "0 18px 40px -22px rgba(0,0,0,0.35)",
                  transform: reduced || variant === "lab" ? undefined : "rotateY(180deg)",
                  opacity: reduced ? (flipped ? 1 : 0) : undefined,
                  transition: reduced ? "opacity 0.15s" : undefined,
                }}
              >
                {variant === "lab" ? <Image src={assets[term.id]} alt="" width={280} height={280} className="glossary-flashcard-back-art" aria-hidden unoptimized /> : null}
                <span
                  aria-hidden
                  className="flex w-9 flex-none flex-col items-center justify-evenly border-r py-[var(--space-6)]"
                  style={{ background: "color-mix(in srgb, var(--foreground) 5%, var(--card))", borderColor: "var(--glass-border)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-3 rounded-full border"
                      style={{ background: "var(--background)", borderColor: "var(--glass-border)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)" }}
                    />
                  ))}
                </span>

                <span className="flex min-w-0 flex-1 flex-col justify-center gap-[clamp(6px,1.8dvh,16px)] p-[clamp(14px,3.2dvh,24px)]">
                  <span className="block text-[clamp(24px,5.5dvh,32px)] leading-[1.12] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                    {term.term}
                  </span>

                  {variant === "default" ? (
                    <>
                      <span className="block text-[clamp(14px,2.6dvh,15px)] leading-[1.4]" style={{ color: "var(--foreground)" }}>
                        {term.definition}
                      </span>
                      <span className="block h-px w-full" style={{ background: "var(--glass-border)" }} aria-hidden />
                    </>
                  ) : null}

                  <span className="flex flex-col gap-[6px]">
                    <span className="text-[12px] font-bold tracking-[0.05em] uppercase" style={{ color: "var(--glossary-accent)" }}>
                      {lesson.exampleCompany} Example
                    </span>
                    <span className="block text-[clamp(14px,2.6dvh,15px)] leading-[1.35] font-semibold" style={{ color: "var(--foreground)" }}>
                      {term.example}
                    </span>
                  </span>
                  {variant === "lab" ? (
                    <span className="flex items-center gap-[6px] text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>
                      <RotateCw className="h-[12px] w-[12px]" aria-hidden /> Back to the definition
                    </span>
                  ) : null}
                </span>
              </span> : null}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={() => {
          // Unlocking a term is the game's core reward moment, and it had the
          // same soft tick as any tap. The "correct" chime is the area's own
          // reward sound, so it now reads as one.
          onUnlock();
          window.setTimeout(playCorrect, 0);
        }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className="dm-solid flex w-full max-w-[440px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Unlock {term.term} <TermIcon icon={term.icon} className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

function UnlockCompleteScreen({ lesson, onStartPractice, variant = "default" }: { lesson: GlossaryLesson; onStartPractice: () => void; variant?: ExperienceVariant }) {
  const assets = useTermAssets();
  const { theme } = useGlobalTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    playSweep();
    if (variant !== "lab") return;
    const reward = window.setTimeout(playCorrect, 360);
    return () => window.clearTimeout(reward);
  }, [variant]);

  if (variant === "lab") {
    return (
      <div className="glossary-screen glossary-unlock-complete-screen glossary-unlock-finale relative w-full flex-1" aria-labelledby="glossary-unlock-title">
        <LocalBurst nonce={1} />
        <div className="glossary-unlock-finale-copy">
          <div className="glossary-unlock-finale-dreamy"><DreamyFace pose="happy" size={132} /></div>
          <span className="glossary-unlock-finale-kicker">LEARNING COMPLETE</span>
          <h2 id="glossary-unlock-title">{lesson.terms.length} terms<br /><em>unlocked.</em></h2>
          <p>Now put them to work.</p>
        </div>
        <div className="glossary-unlock-gallery" aria-label={`${lesson.terms.length} unlocked terms`}>
          <span className="glossary-unlock-gallery-aura" aria-hidden />
          <span className="glossary-unlock-gallery-dreamy" aria-hidden><DreamyFace pose="happy" size={224} /></span>
          {lesson.terms.map((term, index) => (
            <motion.figure
              key={term.id}
              className="glossary-unlock-relic"
              initial={reduced ? false : { opacity: 0, y: 48, rotate: index % 2 ? 8 : -8, scale: .82 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 18, delay: reduced ? 0 : .12 + index * .11 }}
            >
              <span className="glossary-unlock-relic-number">0{index + 1}</span>
              {assets[term.id] ? (
                <Image src={assets[term.id]} alt="" width={168} height={168} className="glossary-unlock-relic-art" unoptimized />
              ) : (
                <TermIcon icon={term.icon} className="glossary-unlock-relic-fallback" />
              )}
              <figcaption>{term.term}</figcaption>
            </motion.figure>
          ))}
        </div>
        <button type="button" onClick={onStartPractice} className="dm-solid glossary-unlock-finale-cta" style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}>
          Start practice <ChevronRight aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="glossary-screen glossary-unlock-complete-screen relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden px-5 py-[var(--space-5)] text-center">
      <LocalBurst nonce={1} />
      <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-[var(--space-4)]">
        {lesson.terms.map((t) => (
          <span key={t.id} className="relative flex size-11 flex-none items-center justify-center rounded-full sm:size-14" style={{ background: "var(--glossary-accent)", color: "#05070f" }}>
            <TermIcon icon={t.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-2 sm:size-5" style={{ background: "var(--glossary-accent)", borderColor: "var(--background)" }}>
              <Check className="h-[9px] w-[9px] sm:h-[11px] sm:w-[11px]" style={{ color: "#05070f" }} aria-hidden />
            </span>
          </span>
        ))}
      </div>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <Trophy className="h-8 w-8" style={{ color: "var(--glossary-accent)" }} aria-hidden />
        <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          All {lesson.terms.length} terms unlocked!
        </p>
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          {lesson.milestone}
        </p>
      </div>
      <button
        type="button"
        onClick={onStartPractice}
        className="dm-solid flex w-full max-w-[420px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Start Practice <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question renderers. Each returns { done, correct } via onAnswer once graded.

// Amber is this game's "active/selected" accent everywhere -- reusing it for
// a confirmed-correct answer too made the two states read the same color, so
// a verified-correct answer/input now turns var(--world-food-farming-nature)
// (this app's already dark/light-calibrated green primitive, reused here for
// its color rather than its "world" meaning) instead. Wrong stays --danger.
const CORRECT_COLOR = "var(--world-food-farming-nature)";

type AnswerResult = { correct: boolean; creditedTermIds: string[] };

function OptionList({ options, assets, grid = false, correctIndex, picked, revealed, onPick }: { options: string[]; assets?: (string | null)[]; grid?: boolean; correctIndex: number; picked: number | null; revealed: boolean; onPick: (i: number) => void }) {
  // Pictures on the tiles are all or nothing (Chandu, 6 Oct 2026: "use the
  // graphic assets for the answer tiles. If all tiles can't have an image,
  // please don't use one for it"): a set of term names gets every term's
  // art; a set of definitions, where only one answer happens to be a term,
  // gets none, so the four tiles stay the same shape.
  const allArt = !!assets && assets.length === options.length && assets.every(Boolean);
  return (
    <div className={`glossary-option-list flex w-full flex-col gap-[var(--space-3)] ${grid ? "glossary-option-grid" : ""}`}>
      {options.map((option, i) => {
        const isPicked = picked === i;
        const isCorrect = i === correctIndex;
        const dim = revealed && !isPicked && !isCorrect;
        const border = revealed && isCorrect ? CORRECT_COLOR : revealed && isPicked && !isCorrect ? "var(--danger, #e0483e)" : "var(--glass-border)";
        return (
          <button
            key={option}
            type="button"
            onClick={() => onPick(i)}
            className={`glossary-option dm-tap flex w-full cursor-pointer items-center gap-[var(--space-4)] rounded-[var(--radius-md)] border p-[var(--space-4)] text-left transition-opacity ${isPicked && !revealed ? "is-selected" : ""} ${revealed && isCorrect ? "is-correct" : ""} ${revealed && isPicked && !isCorrect ? "is-wrong" : ""} ${dim ? "is-dimmed" : ""}`}
            style={{ background: "var(--card)", borderColor: isPicked && !revealed ? "var(--glossary-accent)" : border, opacity: dim ? 0.45 : 1 }}
          >
            <span className="glossary-option-key flex size-7 flex-none items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold" style={{ borderColor: "var(--muted-foreground)", color: "var(--foreground)" }}>
              {String.fromCharCode(65 + i)}
            </span>
            {allArt ? <Image src={assets![i]!} alt="" width={52} height={52} className="glossary-choice-art" aria-hidden unoptimized /> : null}
            <span className="flex-1 text-[15px] leading-[20px] font-medium" style={{ color: "var(--foreground)" }}>
              {option}
            </span>
            {revealed && isCorrect && <Check className="h-5 w-5 flex-none" style={{ color: CORRECT_COLOR }} aria-hidden />}
            {revealed && isPicked && !isCorrect && <X className="h-5 w-5 flex-none" style={{ color: "var(--danger, #e0483e)" }} aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

// "Catch the Misuse" presented as reviewing a short business document --
// the question is literally "spot the wrong sentence," so a document frame
// fits naturally (per the project's own "lightweight presentational
// treatment where relevant" allowance). Same options/correctIndex/onPick
// contract as OptionList, just laid out as one bordered sheet with divided
// rows instead of separately boxed buttons -- no interaction change.
function DocumentOptionList({ options, assets, correctIndex, picked, revealed, onPick }: { options: string[]; assets?: (string | null)[]; grid?: boolean; correctIndex: number; picked: number | null; revealed: boolean; onPick: (i: number) => void }) {
  const termAssets = useTermAssets("small");
  return (
    <div className="glossary-document-list flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] border" data-label="MISUSE REVIEW" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      {options.map((option, i) => {
        const isPicked = picked === i;
        const isCorrect = i === correctIndex;
        const dim = revealed && !isPicked && !isCorrect;
        const textColor = revealed && isCorrect ? CORRECT_COLOR : revealed && isPicked && !isCorrect ? "var(--danger, #e0483e)" : "var(--foreground)";
        const artwork = assets?.[i] ?? termAssetFor(option, termAssets);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onPick(i)}
            className={`glossary-document-option dm-tap flex w-full cursor-pointer items-center gap-[var(--space-4)] border-b p-[var(--space-4)] text-left last:border-b-0 transition-opacity ${isPicked && !revealed ? "is-selected" : ""} ${revealed && isCorrect ? "is-correct" : ""} ${revealed && isPicked && !isCorrect ? "is-wrong" : ""}`}
            style={{ borderColor: "var(--glass-border)", background: isPicked ? "color-mix(in srgb, var(--glossary-accent) 10%, transparent)" : "transparent", opacity: dim ? 0.45 : 1 }}
          >
            <span className="flex size-7 flex-none items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold" style={{ borderColor: revealed && (isCorrect || isPicked) ? textColor : "var(--muted-foreground)", color: textColor }}>
              {String.fromCharCode(65 + i)}
            </span>
            {artwork ? <Image src={artwork} alt="" width={52} height={52} className="glossary-document-art" aria-hidden unoptimized /> : null}
            <span className="flex-1 text-[15px] leading-[20px] font-medium" style={{ color: "var(--foreground)" }}>
              {option}
            </span>
            {revealed && isCorrect && <Check className="h-5 w-5 flex-none" style={{ color: CORRECT_COLOR }} aria-hidden />}
            {revealed && isPicked && !isCorrect && <X className="h-5 w-5 flex-none" style={{ color: "var(--danger, #e0483e)" }} aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

function TypeTermCard({ question, onAnswer }: { question: Extract<GlossaryQuestion, { kind: "typeTerm" }>; onAnswer: (r: AnswerResult) => void }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  function check() {
    const correct = value.trim().toLowerCase() === question.answer.toLowerCase();
    setChecked(correct);
    onAnswer({ correct, creditedTermIds: correct && question.termId ? [question.termId] : [] });
  }

  return (
    <div className="glossary-type-term flex w-full flex-col gap-[var(--space-4)]">
      <div className="flex flex-col gap-[var(--space-2)]">
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {/* Real buttons, not decorative pills -- they look tappable (a
             rounded, bordered chip), so they need to actually be tappable.
             Picking one just fills the same input Check Answer already
             reads; it's a shortcut for typing, not a new answer path. */}
          {question.wordBank.map((word) => (
            <button
              key={word}
              type="button"
              disabled={checked !== null}
              onClick={() => {
                setValue(word);
                window.setTimeout(playSelect, 0);
              }}
              className="glossary-word-chip dm-tap rounded-[var(--radius-md)] border px-[var(--space-4)] py-[6px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: value === word ? "var(--glossary-accent)" : "var(--glass-border)", color: "var(--foreground)", background: value === word ? "color-mix(in srgb, var(--glossary-accent) 16%, var(--card))" : "transparent" }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        value={value}
        disabled={checked !== null}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Or type your answer…"
        className="glossary-answer-dock w-full rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-4)] text-[15px] font-semibold outline-none disabled:opacity-100"
        style={{
          background: "var(--card)",
          borderColor: checked === null ? "var(--glass-border)" : checked ? CORRECT_COLOR : "var(--danger, #e0483e)",
          // Browsers dim disabled-input text by default regardless of `color`
          // (Safari especially, via -webkit-text-fill-color) -- once this
          // input disables after Check Answer, that dimming is exactly what
          // made the student's own typed answer unreadable. Pin both
          // properties so the text stays at full, on-brand contrast.
          color: checked === null ? "var(--foreground)" : checked ? CORRECT_COLOR : "var(--danger, #e0483e)",
          WebkitTextFillColor: checked === null ? "var(--foreground)" : checked ? CORRECT_COLOR : "var(--danger, #e0483e)",
        }}
      />
      {checked === null && (
        <button
          type="button"
          disabled={!value.trim()}
          onClick={check}
          className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          Check Answer
        </button>
      )}
    </div>
  );
}

function MatchUpCard({ question, onAnswer, onReset }: { question: Extract<GlossaryQuestion, { kind: "matchUp" }>; onAnswer: (r: AnswerResult) => void; onReset: () => void }) {
  const assets = useTermAssets("small");
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const rightOrder = useMemo(() => shuffleStable(question.pairs.map((p) => p.right), question.id), [question]);

  // A real line drawn between a matched pair's own dots, like the reference
  // -- but a brief confirmation flash, not a permanent line: with several
  // pairs matched the screen would fill with crossing diagonal lines,
  // exactly the "awkward" look flagged directly. The green dots/checkmarks/
  // border are the lasting "this is matched" signal; the line itself is a
  // one-time snap animation. Measured via ref since the two dots aren't in
  // the same row once the right side (shuffled on purpose, so this stays a
  // real matching exercise) reorders.
  const gridRef = useRef<HTMLDivElement>(null);
  const leftDotRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const rightDotRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [flashLine, setFlashLine] = useState<{ x1: number; y1: number; x2: number; y2: number; left: string; right: string; fading: boolean } | null>(null);

  function unlink(left: string) {
    setMatched((current) => {
      const next = new Set(current);
      next.delete(left);
      return next;
    });
    setPickedLeft(null);
    onReset();
    window.setTimeout(playFlip, 0);
  }

  function tryMatch(left: string, right: string) {
    const pair = question.pairs.find((p) => p.left === left);
    if (!pair) return;
    if (pair.right === right) {
      playCorrect();
      const next = new Set(matched);
      next.add(left);
      setMatched(next);
      setPickedLeft(null);
      if (next.size === question.pairs.length) {
        onAnswer({ correct: true, creditedTermIds: question.pairs.map((candidate) => candidate.termId) });
      }

      const grid = gridRef.current;
      const leftEl = leftDotRefs.current.get(left);
      const rightEl = rightDotRefs.current.get(right);
      if (grid && leftEl && rightEl) {
        const gridRect = grid.getBoundingClientRect();
        const lr = leftEl.getBoundingClientRect();
        const rr = rightEl.getBoundingClientRect();
        setFlashLine({
          x1: lr.left + lr.width / 2 - gridRect.left,
          y1: lr.top + lr.height / 2 - gridRect.top,
          x2: rr.left + rr.width / 2 - gridRect.left,
          y2: rr.top + rr.height / 2 - gridRect.top,
          left,
          right,
          fading: false,
        });
        setTimeout(() => setFlashLine((prev) => (prev ? { ...prev, fading: true } : prev)), 350);
        setTimeout(() => setFlashLine(null), 750);
      }

    } else {
      playWrong();
      setWrongFlash(left);
      setPickedLeft(null);
      setTimeout(() => setWrongFlash(null), 400);
    }
  }

  return (
    <div className="glossary-match-up relative flex w-full flex-col gap-[var(--space-3)]">
      {matched.size === question.pairs.length ? <LocalBurst nonce={1} /> : null}
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <span className="text-center text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {question.headers?.[0] ?? "Term"}
        </span>
        <span className="text-center text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {question.headers?.[1] ?? "Example"}
        </span>
      </div>
      <div ref={gridRef} className="relative grid grid-cols-2 gap-[var(--space-3)]">
        {flashLine && (
          <>
            <svg aria-hidden className={`glossary-match-beam pointer-events-none absolute inset-0 h-full w-full overflow-visible ${flashLine.fading ? "is-fading" : ""}`}>
              <line x1={flashLine.x1} y1={flashLine.y1} x2={flashLine.x2} y2={flashLine.y2} stroke="currentColor" strokeWidth={12} opacity={0.13} />
              <line x1={flashLine.x1} y1={flashLine.y1} x2={flashLine.x2} y2={flashLine.y2} stroke="currentColor" strokeWidth={3} pathLength={1} />
              <circle cx={flashLine.x1} cy={flashLine.y1} r={8} fill="currentColor" />
              <circle cx={flashLine.x2} cy={flashLine.y2} r={8} fill="currentColor" />
            </svg>
            <motion.span
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: flashLine.fading ? 0 : 1, scale: 1, y: 0 }}
              className="glossary-match-confirmation"
              style={{ left: (flashLine.x1 + flashLine.x2) / 2, top: (flashLine.y1 + flashLine.y2) / 2 }}
            >
              <Check aria-hidden /> Matched
            </motion.span>
          </>
        )}
        <div className="flex flex-col gap-[var(--space-2)]">
          {question.pairs.map((p) => {
            const done = matched.has(p.left);
            const linkNumber = question.pairs.findIndex((pair) => pair.left === p.left) + 1;
            const active = pickedLeft === p.left;
            const wrong = wrongFlash === p.left;
            return (
              <button
                key={p.left}
                type="button"
                aria-label={done ? `${p.left}, matched as link ${linkNumber}. Tap to unlink.` : p.left}
                onClick={() => {
                  if (done) {
                    unlink(p.left);
                    return;
                  }
                  setPickedLeft(p.left);
                  window.setTimeout(playSelect, 0);
                }}
                className={`glossary-match-tile glossary-match-left dm-tap flex min-h-[60px] w-full items-center justify-between gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-center text-[13px] font-bold sm:text-[14px] ${active ? "is-active" : ""} ${done ? "is-matched" : ""} ${wrong ? "is-wrong" : ""}`}
                style={{
                  background: done ? "color-mix(in srgb, var(--world-food-farming-nature) 16%, var(--card))" : "var(--card)",
                  borderColor: done ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : active ? "var(--glossary-accent)" : "var(--glass-border)",
                  color: done ? CORRECT_COLOR : "var(--foreground)",
                }}
              >
                <span className="flex flex-1 items-center justify-center gap-[6px]">
                  {done && <span className="glossary-match-lock-code" aria-hidden>{linkNumber}</span>}
                  {p.left}
                </span>
                {/* Connector dot -- anchor point for the SVG line above once
                   this pair is matched. */}
                <span
                  aria-hidden
                  ref={(el) => {
                    if (el) leftDotRefs.current.set(p.left, el);
                    else leftDotRefs.current.delete(p.left);
                  }}
                  className="size-[9px] flex-none rounded-full border-2"
                  style={{ borderColor: done ? CORRECT_COLOR : "var(--glass-border)", background: done ? CORRECT_COLOR : "transparent" }}
                />
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-[var(--space-2)]">
          {rightOrder.map((right) => {
            const pair = question.pairs.find((p) => p.right === right)!;
            const done = matched.has(pair.left);
            const linkNumber = question.pairs.findIndex((candidate) => candidate.left === pair.left) + 1;
            const artwork = assets[pair.left] ?? termAssetFor(right, assets);
            return (
              <button
                key={right}
                type="button"
                disabled={!done && !pickedLeft}
                aria-label={done ? `${right}, matched as link ${linkNumber}. Tap to unlink.` : right}
                onClick={() => done ? unlink(pair.left) : pickedLeft && tryMatch(pickedLeft, right)}
                className={`glossary-match-tile glossary-match-right dm-tap flex min-h-[60px] w-full items-center justify-between gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-center text-[13px] font-bold sm:text-[14px] ${done ? "is-matched" : ""}`}
                style={{
                  background: done ? "color-mix(in srgb, var(--world-food-farming-nature) 16%, var(--card))" : "var(--card)",
                  borderColor: done ? CORRECT_COLOR : "var(--glass-border)",
                  color: done ? CORRECT_COLOR : "var(--foreground)",
                }}
              >
                <span
                  aria-hidden
                  ref={(el) => {
                    if (el) rightDotRefs.current.set(right, el);
                    else rightDotRefs.current.delete(right);
                  }}
                  className="size-[9px] flex-none rounded-full border-2"
                  style={{ borderColor: done ? CORRECT_COLOR : "var(--glass-border)", background: done ? CORRECT_COLOR : "transparent" }}
                />
                <span className="flex flex-1 items-center justify-center gap-[6px]">
                  {artwork ? <Image src={artwork} alt="" width={48} height={48} className="glossary-match-art" aria-hidden unoptimized /> : null}
                  {done && <span className="glossary-match-lock-code" aria-hidden>{linkNumber}</span>}
                  {right}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="glossary-match-status" aria-live="polite">
        <span>{matched.size}/{question.pairs.length} matched</span>
        <span>Tap to undo</span>
      </div>
    </div>
  );
}

function SortBucketsCard({ question, onAnswer, onReset }: { question: Extract<GlossaryQuestion, { kind: "sortBuckets" }>; onAnswer: (r: AnswerResult) => void; onReset: () => void }) {
  const assets = useTermAssets("small");
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);

  const items = useMemo(() => shuffleStable(question.items, question.id + "-items"), [question]);
  const allPlaced = items.every((item) => placed[item.text]);

  function place(bucket: string) {
    if (!picked) return;
    const next = { ...placed, [picked]: bucket };
    setPlaced(next);
    setPicked(null);
    window.setTimeout(playSelect, 0);
    if (items.every((item) => next[item.text])) {
      const correctItems = items.filter((item) => next[item.text] === item.bucket);
      const correct = correctItems.length === items.length;
      window.setTimeout(correct ? playCorrect : playWrong, 0);
      onAnswer({ correct, creditedTermIds: correctItems.map((item) => item.termId) });
    }
  }

  function pickUp(itemText: string) {
    setPlaced((current) => {
      const next = { ...current };
      delete next[itemText];
      return next;
    });
    setPicked(itemText);
    onReset();
    window.setTimeout(playFlip, 0);
  }

  return (
    <div className="glossary-sort-buckets flex w-full flex-col gap-[var(--space-4)]">
      {!allPlaced && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {items
            .filter((item) => !placed[item.text])
            .map((item) => (
              <button
                key={item.text}
                type="button"
                onClick={() => {
                  setPicked(item.text);
                  window.setTimeout(playSelect, 0);
                }}
                className={`glossary-sort-token dm-tap rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-semibold ${picked === item.text ? "is-picked" : ""}`}
                style={{ background: "var(--card)", borderColor: picked === item.text ? "var(--accent)" : "var(--glass-border)", color: "var(--foreground)" }}
              >
                {termAssetFor(item.bucket) ? <Image src={termAssetFor(item.bucket)!} alt="" width={42} height={42} className="glossary-sort-art" aria-hidden unoptimized /> : null}
                {item.text}
              </button>
            ))}
        </div>
      )}
      {!allPlaced && <p className="text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tap an item, then tap its bucket</p>}
      {allPlaced && <p className="text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tap any item to move it</p>}

      <div className="glossary-sort-grid grid grid-cols-2 gap-[var(--space-3)]">
        {question.buckets.map((bucket) => (
          <div
            key={bucket}
            className={`glossary-sort-bucket flex min-h-[116px] flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border p-[var(--space-3)] text-left ${picked ? "is-ready" : ""}`}
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
          >
            <button type="button" disabled={!picked} onClick={() => place(bucket)} className="glossary-sort-target dm-tap flex w-full items-center gap-2 text-left disabled:cursor-default">
              {assets[bucket] ? <Image src={assets[bucket]} alt="" width={48} height={48} className="glossary-sort-bucket-art" aria-hidden unoptimized /> : null}
              <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{bucket}</span>
              {picked ? <small>Drop here</small> : null}
            </button>
            <div className="glossary-sort-contents">
            {items
              .filter((item) => placed[item.text] === bucket)
              .map((item) => {
                const wrongPlacement = allPlaced && item.bucket !== bucket;
                return (
                  <button
                    key={item.text}
                    type="button"
                    onClick={() => pickUp(item.text)}
                    aria-label={`${item.text}, currently in ${bucket}. Tap to move it.`}
                    className="glossary-placed-token rounded-[var(--radius-sm)] px-[var(--space-3)] py-[4px] text-[12px] font-semibold"
                    style={{
                      background: allPlaced ? (wrongPlacement ? "color-mix(in srgb, var(--danger, #e0483e) 20%, var(--card))" : "color-mix(in srgb, var(--world-food-farming-nature) 20%, var(--card))") : "color-mix(in srgb, var(--amber-400) 22%, var(--card))",
                      color: allPlaced ? (wrongPlacement ? "var(--danger, #e0483e)" : CORRECT_COLOR) : "var(--foreground)",
                    }}
                  >
                    {item.text} <RotateCw aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function ProfitBuilderCard({ question, onAnswer }: { question: Extract<GlossaryQuestion, { kind: "profitBuilder" }>; onAnswer: (r: AnswerResult) => void }) {
  const assets = useTermAssets();
  const [values, setValues] = useState<string[]>(() => question.steps.map(() => ""));
  const [checked, setChecked] = useState(false);
  const allFilled = values.every((v) => v.trim() !== "");
  const scenarioValues = question.scenario.match(/\$?[\d,]+/g) ?? [];

  function check() {
    setChecked(true);
    const allCorrect = question.steps.every((step, i) => Number(values[i].replace(/[,$]/g, "")) === step.answer);
    if (allCorrect) playCorrect();
    else playWrong();
    onAnswer({ correct: allCorrect, creditedTermIds: allCorrect && question.termId ? [question.termId] : [] });
  }

  return (
    <div className="glossary-profit-builder flex w-full flex-col gap-[var(--space-4)]">
      <div className="glossary-profit-machine" aria-label={question.scenario}>
        <span className="glossary-profit-machine-label">Revenue rig</span>
        <div className="glossary-profit-factor"><b>{scenarioValues[0] ?? "500"}</b><small>pairs</small></div>
        <span className="glossary-profit-operator">×</span>
        <div className="glossary-profit-factor"><b>{scenarioValues[1] ?? "$200"}</b><small>each</small></div>
        <ChevronRight className="glossary-profit-arrow" aria-hidden />
        <Image src={assets.Profit} alt="" width={88} height={88} className="glossary-profit-art" aria-hidden unoptimized />
      </div>
      <div className="glossary-profit-cost"><span>Operating costs</span><b>{scenarioValues[2] ?? "$60,000"}</b></div>
      <p className="glossary-profit-mission">Find the revenue. Then calculate what remains.</p>
      {question.steps.map((step, i) => {
        const correct = checked && Number(values[i].replace(/[,$]/g, "")) === step.answer;
        const wrong = checked && !correct;
        return (
          <div key={step.order} className="glossary-profit-step flex items-center justify-between gap-[var(--space-3)]">
            <span className="flex items-center gap-[var(--space-3)] text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
              <span
                className="flex size-6 flex-none items-center justify-center rounded-full border-[1.5px] text-[12px] font-bold"
                style={{ borderColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--muted-foreground)", color: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)" }}
              >
                {step.order}
              </span>
              {step.label}
            </span>
            <div className="glossary-profit-input flex items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)]" style={{ background: "var(--card)", borderColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--glass-border)" }}>
              <span style={{ color: "var(--muted-foreground)" }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                disabled={checked}
                value={values[i]}
                onChange={(e) => setValues((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                className="w-[100px] bg-transparent text-right text-[15px] font-bold outline-none disabled:opacity-100"
                style={{
                  color: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)",
                  WebkitTextFillColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)",
                }}
              />
            </div>
          </div>
        );
      })}
      {!checked && (
        <button
          type="button"
          disabled={!allFilled}
          onClick={check}
          className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--glossary-accent)", color: "#05070f" }}
        >
          Check My Math
        </button>
      )}
    </div>
  );
}

function shuffleStable<T>(items: T[], seed: string): T[] {
  // Deterministic (no Math.random at render, so SSR/CSR stay in sync): a
  // simple string-hash-seeded shuffle, good enough for shuffling 4-5 items.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function QuestionScreen({
  question,
  onAnswer,
  onReset,
}: {
  question: GlossaryQuestion;
  onAnswer: (r: AnswerResult) => void;
  onReset: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const assets = useTermAssets();
  const smallAssets = useTermAssets("small");
  const shuffledOptions = useMemo(() => (question.kind === "choice" ? shuffleStable(question.options.map((o, i) => ({ o, i })), question.id) : []), [question]);
  const choiceAssets = question.kind === "choice" ? shuffledOptions.map(({ o, i }) => {
    const icon = question.optionIcons?.[i];
    if (icon === "shopping-bag") return smallAssets.Customer;
    if (icon === "sneaker") return smallAssets.Product;
    if (icon === "building") return smallAssets.Company;
    return question.layout === "grid" || o.length <= 20 ? termAssetFor(o, smallAssets) : null;
  }) : [];

  // No enclosing card here on purpose -- wrapping the whole question (prompt,
  // Dreamy, and the already-boxed answer options) in one more outer card
  // was boxes-inside-boxes, per direct feedback. Every renderer below
  // already carries its own visual weight (option pills, the document
  // sheet, bordered tiles), so this screen can sit directly on the page's
  // own background like the intro/unlock screens already do, and use the
  // taller mobile viewport instead of being squeezed into a fixed card.
  return (
    <div className={`glossary-screen glossary-question-screen glossary-question-${question.kind} relative flex w-full flex-col gap-[var(--space-6)]`}>
      {question.kind === "choice" && question.visual?.kind === "profit" && (
        <div className="glossary-question-profit-scene" aria-label={`${question.visual.title} sells for $${question.visual.sells}, costs $${question.visual.costs} to make, $${question.visual.sells - question.visual.costs} left`}>
          <Image src={assets.Product} alt="" width={92} height={92} unoptimized />
          <div><small>{question.visual.title}</small><b>${question.visual.sells}</b><span>Sells for</span></div>
          <strong>−</strong>
          <div><small>To make</small><b>${question.visual.costs}</b><span>Costs</span></div>
          <strong>=</strong>
          <div className="glossary-question-profit-result"><small>Left</small><b>${question.visual.sells - question.visual.costs}</b><span>What is it?</span></div>
        </div>
      )}
      {question.kind !== "matchUp" && question.kind !== "sortBuckets" && question.kind !== "profitBuilder" && (
        // No side padding here -- it was only ever there to "make room" for
        // Dreamy, but since he's absolutely positioned he doesn't need it,
        // and it was shifting the bubble (and the question text) off-center
        // on mobile, where this row is close to the full card width.
        <div className="glossary-question-guide">
          <span className="glossary-question-dreamy"><DreamyFace pose="curious" size={84} /></span>
          <SpeechBubble>{question.prompt}</SpeechBubble>
        </div>
      )}
      {(question.kind === "matchUp" || question.kind === "sortBuckets") && (
        <p className="text-[clamp(18px,2.6dvh,21px)] leading-[1.35] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
          {question.prompt || question.label || question.type}
        </p>
      )}

      {question.kind === "choice" &&
        (() => {
          const ListComponent = question.type === "Catch the Misuse" ? DocumentOptionList : OptionList;
          return (
            <ListComponent
              options={shuffledOptions.map((s) => s.o)}
              assets={choiceAssets}
              grid={question.layout === "grid"}
              correctIndex={shuffledOptions.findIndex((s) => s.i === question.correctIndex)}
              picked={picked}
              revealed={picked !== null}
              onPick={(i) => {
                setPicked(i);
                const correct = shuffledOptions[i].i === question.correctIndex;
                window.setTimeout(correct ? playCorrect : playWrong, 0);
                onAnswer({ correct, creditedTermIds: correct && question.termId ? [question.termId] : [] });
              }}
            />
          );
        })()}
      {question.kind === "typeTerm" && <TypeTermCard question={question} onAnswer={onAnswer} />}
      {question.kind === "matchUp" && <MatchUpCard question={question} onAnswer={onAnswer} onReset={onReset} />}
      {question.kind === "sortBuckets" && <SortBucketsCard question={question} onAnswer={onAnswer} onReset={onReset} />}
      {question.kind === "profitBuilder" && <ProfitBuilderCard question={question} onAnswer={onAnswer} />}
    </div>
  );
}

// A fixed-position modal, not inline content -- feedback used to render
// below the question and push the Continue button (and sometimes the
// feedback text itself) below the fold on shorter viewports, per direct
// report. Same overlay chrome as StreakModal (fixed inset-0, dim backdrop,
// centered card) for consistency, but deliberately NOT dismissible by
// tapping the backdrop: StreakModal is an optional celebratory toast,
// this is the required checkpoint before advancing, so the button stays
// the only way through.
function FeedbackPanel({ correct, text, onNext, isLast, inline = false }: { correct: boolean; text: string; onNext: () => void; isLast: boolean; inline?: boolean }) {
  const atmosphere = useAtmosphere();
  return (
    <div className={`glossary-feedback-overlay ${inline ? "is-inline" : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"}`}>
      <div
        className="glossary-feedback-card relative flex w-full max-w-[440px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]"
        style={{ background: correct ? "color-mix(in srgb, var(--world-food-farming-nature) 14%, var(--card))" : "color-mix(in srgb, var(--danger, #e0483e) 10%, var(--card))", borderColor: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}
      >
        {atmosphere === "v2" && correct && (
          // Signal: pixel coins fly up out of the card on a right answer.
          <span className="glossary-signal-coins" aria-hidden>
            {[-90, -60, -30, 0, 30, 60, 90, -45, 45].map((dx, i) => <i key={i} style={{ "--dx": `${dx}px`, "--delay": `${i * 0.05}s` } as React.CSSProperties} />)}
          </span>
        )}
        <div className="glossary-feedback-layout">
          <span className="glossary-feedback-dreamy"><DreamyFace pose={correct ? "party" : "puzzle"} size={76} /></span>
          <div className="glossary-feedback-copy">
            <span className="glossary-feedback-title flex items-center gap-[8px] text-[19px] font-extrabold" style={{ color: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}>
              <span className="flex size-6 flex-none items-center justify-center rounded-full" style={{ background: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}>
                {correct ? <Check className="h-4 w-4" style={{ color: "#05070f" }} aria-hidden /> : <X className="h-4 w-4" style={{ color: "var(--background)" }} aria-hidden />}
              </span>
              {correct ? "Correct" : "Try again"}
            </span>
            <details className="glossary-feedback-details"><summary>Why</summary><p>{text}</p></details>
          </div>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-semibold"
          style={{ background: correct ? CORRECT_COLOR : "var(--foreground)", color: correct ? "#05070f" : "var(--background)" }}
        >
          {isLast ? "Results" : "Next"} <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function StreakBanner({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  useEffect(() => {
    playCorrect();
    const timer = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);
  return (
    <div className="glossary-streak-banner" role="status" aria-live="polite">
      <LocalBurst nonce={1} />
      <DreamyFace pose="party" size={62} />
      <span><Flame className="h-5 w-5" fill="currentColor" aria-hidden /> {streak} in a row!</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Power Play

function PowerPlayIntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="glossary-screen glossary-power-intro-screen relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-6)] overflow-hidden px-5 py-[var(--space-10)] text-center" style={{ background: "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 65%)" }}>
      <DreamyFace pose="idea" size={112} />
      <div className="flex flex-col gap-[var(--space-2)]">
        <h2 className="flex items-center justify-center gap-[8px] text-[26px] leading-[32px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          <Zap className="h-6 w-6" style={{ color: "var(--hero-accent-purple)" }} fill="currentColor" aria-hidden /> Power Play
        </h2>
        <p className="mx-auto max-w-[380px] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>
          Use everything you just learned to fill in the blanks.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="dm-solid flex w-full max-w-[420px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ background: "var(--hero-accent-purple)", color: "#fff", fontFamily: "var(--font-display)" }}
      >
        <Zap className="h-4 w-4" fill="currentColor" aria-hidden /> Unlock &amp; Test My Knowledge <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function PowerPlayScreen({ lesson, onComplete }: { lesson: GlossaryLesson; onComplete: () => void }) {
  const gaps = lesson.powerPlay.answers.length;
  const [values, setValues] = useState<string[]>(() => lesson.powerPlay.answers.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [burstNonce, setBurstNonce] = useState(0);
  const allCorrect = checked && lesson.powerPlay.answers.every((a, i) => values[i].trim().toLowerCase() === a.toLowerCase());
  const allFilled = values.every((v) => v.trim() !== "");

  function check() {
    setChecked(true);
    const correct = lesson.powerPlay.answers.every((a, i) => values[i].trim().toLowerCase() === a.toLowerCase());
    if (correct) {
      playSweep();
      setBurstNonce((n) => n + 1);
    } else {
      playWrong();
    }
  }

  const parts = lesson.powerPlay.paragraph.split(/(\{\d+\})/g);

  return (
    <div className="glossary-screen glossary-power-play-screen flex w-full flex-col gap-[var(--space-5)]" style={{ color: "var(--foreground)" }}>
      <h2 className="flex items-center justify-center gap-[8px] text-[22px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        <Zap className="h-5 w-5" style={{ color: "var(--hero-accent-purple)" }} fill="currentColor" aria-hidden /> Power Play
      </h2>
      <p className="text-center text-[14px]" style={{ color: "var(--muted-foreground)" }}>
        Fill in all {gaps} blanks.
      </p>
      <div className="flex flex-wrap justify-center gap-[var(--space-2)]">
        {[...lesson.powerPlay.answers]
          .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
          .map((word) => (
            <span key={word} className="rounded-[var(--radius-sm)] border px-[var(--space-4)] py-[6px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              {word}
            </span>
          ))}
      </div>

      <div className="relative flex flex-wrap items-baseline gap-x-[6px] gap-y-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-[17px] leading-[32px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <LocalBurst nonce={burstNonce} />
        {parts.map((part, i) => {
          const gapMatch = part.match(/^\{(\d+)\}$/);
          if (!gapMatch) return <span key={i}>{part}</span>;
          const gapIndex = Number(gapMatch[1]) - 1;
          const correct = checked && values[gapIndex].trim().toLowerCase() === lesson.powerPlay.answers[gapIndex].toLowerCase();
          const wrong = checked && !correct;
          return (
            <input
              key={i}
              type="text"
              disabled={allCorrect}
              value={values[gapIndex]}
              onChange={(e) => setValues((prev) => prev.map((v, idx) => (idx === gapIndex ? e.target.value : v)))}
              className="w-[110px] border-b-2 bg-transparent text-center font-bold outline-none disabled:opacity-100"
              style={{
                // The purple accent (Power Play's own theme color, used for
                // the underline/border below) is too low-contrast against
                // this dark background to type against comfortably --
                // direct report of not being able to read their own input.
                // Text stays plain foreground until there's a real verdict.
                color: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)",
                borderColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--hero-accent-purple)",
                WebkitTextFillColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)",
              }}
            />
          );
        })}
      </div>

      {allCorrect && (
        <div className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-md)] border p-[var(--space-4)] text-center" style={{ background: "color-mix(in srgb, var(--world-food-farming-nature) 14%, var(--card))", borderColor: CORRECT_COLOR }}>
          <span className="flex items-center gap-[8px] text-[16px] font-extrabold" style={{ color: CORRECT_COLOR }}>
            <Trophy className="h-5 w-5" aria-hidden /> Complete
          </span>
        </div>
      )}

      <button
        type="button"
        disabled={!allFilled}
        onClick={allCorrect ? onComplete : check}
        className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: allCorrect ? CORRECT_COLOR : "var(--hero-accent-purple)", color: allCorrect ? "#05070f" : "#fff", fontFamily: "var(--font-display)" }}
      >
        {allCorrect ? (
          <>
            Finish Lesson <ChevronRight className="h-4 w-4" aria-hidden />
          </>
        ) : (
          <>
            Check Answers <Zap className="h-4 w-4" fill="currentColor" aria-hidden />
          </>
        )}
      </button>
      <p className="text-center text-[11px]" style={{ color: "var(--muted-foreground)" }}>
        Exact spelling
      </p>
    </div>
  );
}

function MasteryLoadingScreen({ fact }: { fact: string | null }) {
  return (
    <div className="glossary-screen glossary-mastery-loading-screen flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-5)] px-5 py-[var(--space-10)] text-center">
      <DreamyFace pose="idea" size={112} />
      <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Calculating mastery
      </p>
      {fact && (
        <p className="mt-[var(--space-4)] max-w-[420px] rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px] leading-[18px] italic" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          {fact}
        </p>
      )}
    </div>
  );
}

function CompleteScreen({
  lesson,
  masteredCount,
  onContinue,
}: {
  lesson: GlossaryLesson;
  masteredCount: number;
  onContinue: () => void;
}) {
  // The one Dream Score, the same number the app header carries. The game
  // used to multiply its XP by 100 into a private "Dream Score" (15,000 and
  // up), which is where the 15k figures came from (Chandu, 6 Sept 2026).
  const dreamScore = useDreamScore();
  const masteryPct = Math.round((masteredCount / lesson.terms.length) * 100);
  const { theme } = useGlobalTheme();
  // The lesson's finish line had a burst and a party Dreamy but no sound at all.
  // playSweep is this area's own "level-up" sound (Power Play solved uses it), so
  // completing the whole lesson gets at least that.
  useEffect(() => {
    playSweep();
  }, []);
  return (
    <div className="glossary-screen glossary-complete-screen relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-6)] overflow-hidden px-5 py-[var(--space-10)] text-center">
      <LocalBurst nonce={1} />
      <DreamyFace pose="party" size={120} />
      <h2 className="text-[28px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Lesson Complete!
      </h2>

      <div className="flex w-full max-w-[380px] flex-col items-center gap-[2px] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--glossary-accent) 14%, var(--card))", borderColor: "var(--glossary-accent)" }}>
        <span className="flex items-center gap-[6px] text-[15px] font-bold" style={{ color: "var(--glossary-accent)" }}>
          <Sparkles className="h-4 w-4" aria-hidden /> Dream Score
        </span>
        <span className="text-[36px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          {dreamScore.toLocaleString()}
        </span>
      </div>

      <div className="flex w-full max-w-[380px] flex-col gap-[var(--space-3)]">
        <div className="flex items-center justify-between border-b pb-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            XP Earned
          </span>
          <span className="text-[18px] font-extrabold" style={{ color: "var(--glossary-accent)" }}>
            +{lesson.xpReward} XP
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            Mastery Progress
          </span>
          <span className="text-[18px] font-extrabold" style={{ color: "var(--foreground)" }}>
            {masteryPct}%
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="dm-solid flex w-full max-w-[380px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Continue <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level orchestrator

const LAB_ATMOSPHERES: Array<{ id: LabAtmosphere; label: string; detail: string }> = [
  { id: "v1", label: "Drift", detail: "Cloud route" },
  { id: "v2", label: "Signal", detail: "Focus grid" },
  { id: "v3", label: "Orbit", detail: "Skill map" },
  { id: "v4", label: "Horizon", detail: "Power mode" },
];

function LabDotsOcean({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let tilt = active ? 1 : 0;
    let pointerX = 0.5;
    let pointerY = 0.5;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (event: PointerEvent) => {
      pointerX = event.clientX / Math.max(width, 1);
      pointerY = event.clientY / Math.max(height, 1);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });

    const draw = (time: number) => {
      tilt += ((active ? 1 : 0) - tilt) * (reduced ? 1 : 0.035);
      context.clearRect(0, 0, width, height);
      const horizon = height * (0.3 + pointerY * 0.035);
      const rows = 23;
      const columns = Math.ceil(width / 42) + 6;
      for (let row = 0; row < rows; row += 1) {
        const depth = row / (rows - 1);
        const eased = Math.pow(depth, 1.72);
        const flatY = row * 42 - 40;
        const floorY = horizon + eased * (height - horizon + 90);
        const y = flatY * (1 - tilt) + floorY * tilt;
        const perspectiveScale = 0.22 + eased * 1.2;
        const xSpacing = 42 * ((1 - tilt) + perspectiveScale * tilt);
        const travel = reduced ? 0 : (time * 0.018 * (0.25 + eased)) % xSpacing;
        const wave = reduced ? 0 : Math.sin(time * 0.0012 + row * 0.72) * (4 + 16 * eased) * tilt;
        for (let column = -3; column < columns; column += 1) {
          const x = width / 2 + (column - columns / 2) * xSpacing + travel + wave + (pointerX - 0.5) * 28 * eased;
          const glow = Math.max(0, 1 - Math.hypot(x - pointerX * width, y - pointerY * height) / 220);
          const radius = 1 + eased * 2.3 + glow * 2.6;
          context.beginPath();
          context.fillStyle = `rgba(126, 210, 255, ${0.14 + eased * 0.46 + glow * 0.3})`;
          context.shadowBlur = glow * 18 + eased * 5;
          context.shadowColor = "rgba(122, 151, 255, .8)";
          context.arc(x, y + Math.sin(time * 0.0015 + column * 0.6 + row * 0.4) * 5 * tilt, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.shadowBlur = 0;
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    draw(0);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [active, reduced]);

  return <canvas ref={canvasRef} className="glossary-dots-ocean" aria-hidden />;
}

function LabThemeMusic({ atmosphere, enabled }: { atmosphere: LabAtmosphere; enabled: boolean }) {
  const muted = useSyncExternalStore(subscribeMuted, mutedSnapshot, serverMutedSnapshot);

  useEffect(() => {
    if (!enabled || muted) return;
    const AudioContextClass = window.AudioContext;
    const audio = new AudioContextClass();
    const master = audio.createGain();
    master.gain.value = 0.032;
    master.connect(audio.destination);
    const scores: Record<LabAtmosphere, { notes: number[]; tempo: number; wave: OscillatorType }> = {
      v1: { notes: [220, 277.18, 329.63, 415.3, 329.63, 277.18], tempo: 980, wave: "sine" },
      v2: { notes: [110, 164.81, 123.47, 185, 146.83, 220], tempo: 420, wave: "square" },
      v3: { notes: [196, 246.94, 293.66, 369.99, 293.66, 246.94], tempo: 760, wave: "sine" },
      v4: { notes: [82.41, 123.47, 164.81, 98, 146.83, 196], tempo: 510, wave: "sawtooth" },
    };
    const score = scores[atmosphere];
    let index = 0;
    const playNote = () => {
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const envelope = audio.createGain();
      const filter = audio.createBiquadFilter();
      oscillator.type = score.wave;
      oscillator.frequency.setValueAtTime(score.notes[index % score.notes.length], now);
      filter.type = "lowpass";
      filter.frequency.value = atmosphere === "v2" ? 900 : atmosphere === "v4" ? 720 : 1450;
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(atmosphere === "v2" ? 0.22 : 0.14, now + 0.04);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + score.tempo / 1000 * 0.92);
      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(master);
      oscillator.start(now);
      oscillator.stop(now + score.tempo / 1000);
      index += 1;
    };
    void audio.resume().then(playNote);
    const timer = window.setInterval(playNote, score.tempo);
    return () => {
      window.clearInterval(timer);
      master.gain.setTargetAtTime(0.0001, audio.currentTime, 0.04);
      window.setTimeout(() => void audio.close(), 180);
    };
  }, [atmosphere, enabled, muted]);

  return null;
}

function LabAtmosphereLayer({ atmosphere, screen }: { atmosphere: LabAtmosphere; screen: Screen }) {
  return (
    <div className="glossary-world" aria-hidden>
      {atmosphere === "v2" ? (
        <>
          {/* The reference's pixel-art skyline at dusk, under its dark
             gradient, and its pixel font (a <link>, not next/font: see
             the Vercel font note in the handoff). */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" />
          <span className="glossary-signal-sky" style={{ backgroundImage: `url(${SIGNAL_BG})` }} />
        </>
      ) : null}
      {atmosphere === "v3" ? <LabDotsOcean active={screen !== "intro"} /> : null}
      <span className="glossary-world-orb glossary-world-orb-a" />
      <span className="glossary-world-orb glossary-world-orb-b" />
      <span className="glossary-world-stars" />
      <span className="glossary-world-grid" />
      <span className="glossary-world-reaction" />
    </div>
  );
}

function LabLevelMap({ career, lesson, atmosphere, onClose }: { career: GlossaryCareer; lesson: GlossaryLesson; atmosphere: LabAtmosphere; onClose: () => void }) {
  const levels = career.levels;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="glossary-level-map-overlay fixed inset-0 z-[70]" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="glossary-level-map" data-map-concept={atmosphere} role="dialog" aria-modal="true" aria-labelledby="glossary-level-map-title">
        <header>
          <div><span>{career.careerTitle}</span><h2 id="glossary-level-map-title">{atmosphere === "v1" ? "Dream District" : atmosphere === "v2" ? "Mission Index" : atmosphere === "v3" ? "Skill Constellation" : "Championship Circuit"}</h2></div>
          <b>1/{levels.length}</b>
          <button type="button" onClick={onClose} aria-label="Close levels"><X aria-hidden /></button>
        </header>

        <div className="glossary-level-map-progress" aria-label={`Level 1 of ${levels.length}`}><span /></div>
        <div className={`glossary-level-map-scroll glossary-map-concept-${atmosphere}`}>
          {atmosphere === "v3" ? <div className="glossary-orbit-core"><DreamyFace pose="glasses" size={90} /><b>Core skill</b><span>Business Basics</span></div> : null}
          {atmosphere === "v4" ? <div className="glossary-circuit-horizon"><span>START</span><b>ROAD TO $5B</b></div> : null}
          {levels.map(({ title, unlocks: value, tier }, index) => {
            const phase = tier === "Beginner" ? "Beginner · The Startup" : tier === "Intermediate" ? "Intermediate · Scaling Up" : "Advanced · The Big Leagues";
            const orbitIndex = index === 0 ? 0 : index <= 7 ? index - 1 : index - 8;
            const orbitCount = index === 0 ? 1 : index <= 7 ? 7 : 9;
            const orbitAngle = -Math.PI / 2 + (orbitIndex / orbitCount) * Math.PI * 2;
            const orbitRadius = index === 0 ? 0 : index <= 7 ? 25 : 41;
            const mapStyle = {
              "--map-index": index,
              "--map-x": `${50 + Math.cos(orbitAngle) * orbitRadius}%`,
              "--map-y": `${50 + Math.sin(orbitAngle) * orbitRadius}%`,
            } as React.CSSProperties;
            return (
              <div className={`glossary-map-rung glossary-map-rung-${index % 4} ${index === 0 ? "is-current" : "is-locked"}`} style={mapStyle} key={title}>
                {(index === 0 || index === 6 || index === 12) && <span className="glossary-map-phase">{phase}</span>}
                <span className="glossary-map-connector" aria-hidden />
                <button type="button" disabled={index !== 0} aria-current={index === 0 ? "step" : undefined} aria-label={`Level ${index + 1}, ${title}, unlocks ${value}, ${index === 0 ? "playing now" : "locked"}`}>
                  {index === 0 ? <b>{index + 1}</b> : <LockKeyhole aria-hidden />}
                </button>
                <span className="glossary-map-rung-copy"><b>{title}</b><small><CircleDollarSign aria-hidden /> {value}</small></span>
              </div>
            );
          })}
        </div>
        <footer>
          <span className="glossary-map-current-number">1</span>
          <div><b>{lesson.title}</b><span>{lesson.terms.map((term) => <small key={term.id}>{term.term}</small>)}</span></div>
          <strong>Playing</strong>
        </footer>
      </section>
    </div>
  );
}

function LabAtmosphereSwitcher({ value, onChange }: { value: LabAtmosphere; onChange: (next: LabAtmosphere) => void }) {
  return (
    <aside className="glossary-atmosphere-picker" aria-label="Game atmosphere">
      {LAB_ATMOSPHERES.map((atmosphere) => (
        <button
          key={atmosphere.id}
          type="button"
          className={value === atmosphere.id ? "is-active" : ""}
          aria-pressed={value === atmosphere.id}
          onClick={() => {
            onChange(atmosphere.id);
            window.setTimeout(playSelect, 0);
          }}
        >
          <b>{atmosphere.label}</b>
          <small>{atmosphere.detail}</small>
        </button>
      ))}
    </aside>
  );
}

export function GlossaryLabGameExperience({ career, lesson, variant = "lab" }: { career: GlossaryCareer; lesson: GlossaryLesson; variant?: ExperienceVariant }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intro");
  const [atmosphere, setAtmosphere] = useState<LabAtmosphere>("v1");
  const [showLevels, setShowLevels] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [unlockIndex, setUnlockIndex] = useState(0);
  const [queue, setQueue] = useState<GlossaryQuestion[]>(() => [...lesson.questions].sort((a, b) => a.playOrder - b.playOrder));
  const [queueIndex, setQueueIndex] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [pendingResult, setPendingResult] = useState<AnswerResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState<number | null>(null);
  const [dismissedReview, setDismissedReview] = useState(false);

  useEffect(() => {
    if (variant !== "lab") return;
    [...Object.values(TERM_ASSETS), ...Object.values(SIGNAL_ASSETS_SMALL), SIGNAL_CLOUD, SIGNAL_CLOUD_SPEAKING].forEach((src) => {
      const asset = new window.Image();
      asset.decoding = "async";
      asset.src = src;
    });
  }, [variant]);

  const mainLoopLength = lesson.questions.length;
  const current = queue[queueIndex];
  // 1-indexed: the current question already counts toward progress (matching
  // the reference, which reads "1/7 · 14%" on the very first question, not
  // 0%) -- a progress bar should never open at zero, that reads as "nothing
  // done yet" before the student has even had a chance to answer.
  const currentNumber = Math.min(queueIndex + 1, queue.length);
  const percent = queue.length ? Math.round((currentNumber / Math.max(mainLoopLength, queue.length)) * 100) : 0;
  const masteredCount = lesson.terms.filter((t) => (mastery[t.id] ?? 0) >= MASTERY_TARGET).length;

  function goTo(next: Screen) {
    setScreen(next);
    window.scrollTo(0, 0);
    window.setTimeout(playSceneChange, 0);
  }

  function restartGame() {
    setScreen("intro");
    setMusicStarted(false);
    setShowLevels(false);
    setUnlockIndex(0);
    setQueue([...lesson.questions].sort((a, b) => a.playOrder - b.playOrder));
    setQueueIndex(0);
    setMastery({});
    setPendingResult(null);
    setStreak(0);
    setShowStreak(null);
    setDismissedReview(false);
    window.scrollTo(0, 0);
    window.setTimeout(playSceneChange, 0);
  }

  function exitToCareer() {
    router.push(`/career/${career.careerSlug}`);
  }

  function handleAnswer(result: AnswerResult) {
    setPendingResult(result);
  }

  function advanceQuestion() {
    if (!pendingResult) return;
    const nextMastery = { ...mastery };
    for (const id of pendingResult.creditedTermIds) nextMastery[id] = (nextMastery[id] ?? 0) + 1;
    setMastery(nextMastery);
    if (pendingResult.correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > 0 && nextStreak % 5 === 0) setShowStreak(nextStreak);
    } else {
      setStreak(0);
    }
    setPendingResult(null);
    const isEndOfMain = queueIndex + 1 >= queue.length;
    if (!isEndOfMain) {
      setQueueIndex((i) => i + 1);
      window.scrollTo(0, 0);
      return;
    }
    // Remediation: any term still short of mastery pulls one held-back
    // review question before moving on, per the content template's rule
    // that a wrong answer needs a different question next round.
    if (!dismissedReview) {
      const shortTerms = lesson.terms.filter((t) => (nextMastery[t.id] ?? 0) < MASTERY_TARGET).map((t) => t.id);
      const reviewPool = lesson.reviewQuestions.filter((q) => q.termId && shortTerms.includes(q.termId) && !queue.some((existing) => existing.id === q.id));
      if (reviewPool.length > 0) {
        setQueue((prev) => [...prev, ...reviewPool]);
        setQueueIndex((i) => i + 1);
        window.scrollTo(0, 0);
        return;
      }
      setDismissedReview(true);
    }
    goTo("powerPlayIntro");
  }

  // Every color in this file reads var(--glossary-accent) rather than a
  // hardcoded world token, so setting it once here (to the playing career's
  // own world color) is what makes Aviation/Healthcare/Tech pick up their
  // own accent instead of Finance's amber.
  const accent = WORLD_COLORS[career.world] ?? "var(--world-business-money-office)";
  const termArt = assetsFor(variant === "lab" ? atmosphere : "v1", "small");

  return (
    <AtmosphereContext.Provider value={variant === "lab" ? atmosphere : "v1"}>
    <div
      className={`glossary-game-shell glossary-game-${variant} glossary-lab-atmosphere-${atmosphere} marketing-v2 themeable relative flex min-h-dvh w-full flex-col`}
      data-screen={screen}
      data-question-kind={screen === "question" ? current?.kind : undefined}
      data-answer-state={pendingResult ? (pendingResult.correct ? "correct" : "wrong") : "idle"}
      style={{
        "--glossary-accent": accent,
        background: variant === "lab" ? "transparent" : "radial-gradient(120% 60% at 50% -10%, color-mix(in srgb, var(--glossary-accent) 16%, transparent), transparent 65%), var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
      } as React.CSSProperties}
    >
      {variant === "lab" ? <LabAtmosphereLayer atmosphere={atmosphere} screen={screen} /> : null}
      <TopBar
        onBack={() => router.back()}
        onOpenLevels={variant === "lab" ? () => setShowLevels(true) : undefined}
        atmosphere={variant === "lab" && screen !== "intro" ? atmosphere : undefined}
        onAtmosphereChange={variant === "lab" && screen !== "intro" ? setAtmosphere : undefined}
        onRestart={variant === "lab" && screen !== "intro" ? restartGame : undefined}
      />

      {screen === "question" && (
        <div className="glossary-mastery-hud relative z-10 mx-auto flex w-full max-w-[640px] flex-col gap-[var(--space-2)] px-5 pt-[var(--space-3)] md:px-8">
          <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            <span>{lesson.title}</span>
            <span>
              {currentNumber}/{Math.max(mainLoopLength, queue.length)} · {percent}%
            </span>
          </div>
          {/* Sparks on every correct answer that moves it (SparkBar), same as Build. */}
          <SparkBar percent={percent} min={4} height={6} track="var(--glass-surface-2)" fill="var(--glossary-accent)" glow="var(--glossary-accent)" />
          <div className="glossary-mastery-foot flex items-center justify-between">
            <div className={variant === "lab" ? "glossary-mastery-tokens" : "flex items-center gap-[6px]"}>
              {lesson.terms.map((t) => {
                const progress = Math.min(mastery[t.id] ?? 0, MASTERY_TARGET);
                const done = progress >= MASTERY_TARGET;
                if (variant === "lab") return (
                  <span key={t.id} className={`glossary-mastery-token ${done ? "is-mastered" : ""}`} role="img" aria-label={`${t.term}: ${progress} of ${MASTERY_TARGET} mastery checks`} title={`${t.term}: ${progress}/${MASTERY_TARGET}`}>
                    <span className="glossary-mastery-token-ring" style={{ background: `conic-gradient(var(--glossary-accent) ${progress / MASTERY_TARGET * 100}%, var(--glass-surface-2) 0)` }}>
                      <span className="glossary-mastery-token-core">
                        {termArt[t.id] ? <Image src={termArt[t.id]} alt="" width={42} height={42} className="glossary-mastery-token-art" unoptimized /> : <TermIcon icon={t.icon} className="glossary-mastery-token-fallback" />}
                      </span>
                    </span>
                    <span className="glossary-mastery-token-label" aria-hidden>{t.term}</span>
                    {done ? <Check className="glossary-mastery-token-check" aria-hidden /> : null}
                  </span>
                );
                return (
                  <span
                    key={t.id}
                    title={t.term}
                    className="flex size-5 items-center justify-center rounded-full"
                    style={{ background: done ? "var(--glossary-accent)" : "var(--glass-surface-2)", color: "#05070f" }}
                  >
                    {done && <Check className="h-[11px] w-[11px]" aria-hidden />}
                  </span>
                );
              })}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              Mastered {masteredCount}/{lesson.terms.length}
            </span>
          </div>
        </div>
      )}

      <main className="glossary-engine-main relative z-0 mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center gap-[var(--space-5)] px-5 py-[var(--space-4)] md:px-8">
        {showStreak !== null && <StreakBanner streak={showStreak} onDismiss={() => setShowStreak(null)} />}
        {screen === "intro" && <IntroScreen lesson={lesson} variant={variant} atmosphere={atmosphere} onNext={() => { setMusicStarted(true); goTo(variant === "lab" ? "unlock" : "dreamyIntro"); }} />}
        {screen === "dreamyIntro" && <DreamyIntroScreen onStart={() => goTo("lessonIntro")} />}
        {screen === "lessonIntro" && <LessonIntroScreen lesson={lesson} onStart={() => goTo("unlock")} />}
        {screen === "unlock" &&
          (unlockIndex < lesson.terms.length ? (
            <UnlockScreen lesson={lesson} index={unlockIndex} variant={variant} atmosphere={atmosphere} onUnlock={() => setUnlockIndex((i) => i + 1)} />
          ) : (
            <UnlockCompleteScreen lesson={lesson} variant={variant} onStartPractice={() => goTo("question")} />
          ))}
        {screen === "question" && current && (
          <>
            <QuestionScreen key={current.id} question={current} onAnswer={handleAnswer} onReset={() => setPendingResult(null)} />
            {pendingResult && (
              <FeedbackPanel
                correct={pendingResult.correct}
                text={pendingResult.correct ? current.feedbackCorrect : current.feedbackWrong}
                isLast={queueIndex + 1 >= queue.length}
                inline={variant === "lab"}
                onNext={advanceQuestion}
              />
            )}
          </>
        )}
        {screen === "powerPlayIntro" && <PowerPlayIntroScreen onStart={() => goTo("powerPlay")} />}
        {screen === "powerPlay" && <PowerPlayScreen lesson={lesson} onComplete={() => goTo("masteryLoading")} />}
        {screen === "masteryLoading" && <MasteryLoadingScreenGate lesson={lesson} onDone={() => setScreen("complete")} />}
        {screen === "complete" && (
          <CompleteScreenGate
            lesson={lesson}
            career={career}
            masteredCount={masteredCount}
            onContinue={exitToCareer}
          />
        )}
      </main>

      {variant === "lab" && showLevels ? <LabLevelMap career={career} lesson={lesson} atmosphere={atmosphere} onClose={() => setShowLevels(false)} /> : null}
      {variant === "lab" && screen === "intro" ? <LabAtmosphereSwitcher value={atmosphere} onChange={setAtmosphere} /> : null}
      {variant === "lab" ? <LabThemeMusic atmosphere={atmosphere} enabled={musicStarted} /> : null}
    </div>
    </AtmosphereContext.Provider>
  );
}

function MasteryLoadingScreenGate({ lesson, onDone }: { lesson: GlossaryLesson; onDone: () => void }) {
  const [fact] = useState(() => lesson.facts[Math.floor(Math.random() * Math.max(lesson.facts.length, 1))] ?? null);
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return <MasteryLoadingScreen fact={fact} />;
}

function CompleteScreenGate({
  lesson,
  career,
  masteredCount,
  onContinue,
}: {
  lesson: GlossaryLesson;
  career: GlossaryCareer;
  masteredCount: number;
  onContinue: () => void;
}) {
  // Lazy initializer, not an effect: this must run exactly once, the instant
  // this screen mounts, not after a render+commit round-trip. The lesson's XP
  // goes into the shared Dream Score once per lesson (the store ignores a
  // repeat of the same milestone id), so the header chip rises with it.
  useState(() => {
    saveLessonComplete(career.careerSlug, lesson.id, lesson.terms.map((t) => t.id), lesson.xpReward);
    awardDreamScore(`glossary:${career.careerSlug}:${lesson.id}`, lesson.xpReward);
  });
  return <CompleteScreen lesson={lesson} masteredCount={masteredCount} onContinue={onContinue} />;
}
