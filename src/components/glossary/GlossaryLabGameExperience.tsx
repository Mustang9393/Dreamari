"use client";

import Image from "next/image";
import { awardDreamScore, useDreamScore } from "@/lib/dreamScore";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ChevronDown, ChevronLeft, ChevronRight, ArrowUpCircle, Bug, Building2, Check, CircleDollarSign, Database, Flame, HeartPulse, LockKeyhole, Map as MapIcon, Mountain, Paintbrush, Plug, Siren, Sparkles, Stethoscope, UserRound, Trophy, Volume2, VolumeX, Wind, Workflow, X, Zap, RotateCw } from "lucide-react";
import { LocalBurst } from "@/components/build/DreamyGuide";
import { goBackOr, QuickLinksMenu } from "@/components/app/chrome";
import { WORLD_COLORS } from "@/components/app/worlds";
import { useGlobalTheme, type GlobalTheme } from "@/components/app/theme";
import {
  mutedSnapshot,
  playFlip,
  playSceneChange,
  playGlossaryCue,
  serverMutedSnapshot,
  setMuted,
  subscribeMuted,
} from "@/components/play/sound";
import {
  glossaryProgressSnapshot,
  readLesson,
  saveLessonComplete,
  serverGlossaryProgressSnapshot,
  subscribeGlossaryProgress,
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
// inheriting Finance's amber. Power Play uses --power-accent, the playing
// theme's own accent (8 Oct 2026, Chandu: "why is powerplay always
// purple?"); the violet it used before is only the fallback.
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

function useMaterialSounds() {
  const theme = useAtmosphere();
  const cue = useCallback((kind: "correct" | "repair" | "select" | "reward") => {
    playGlossaryCue(theme, kind);
    // Visual reactions remain active with audio muted, including individual
    // matching pairs and bucket moves, not just a question's final result.
    window.dispatchEvent(new CustomEvent("glossary-world-cue", { detail: kind }));
  }, [theme]);
  return useMemo(() => ({
    playCorrect: () => cue("correct"),
    playWrong: () => cue("repair"),
    playSelect: () => cue("select"),
    playSweep: () => cue("reward"),
  }), [cue]);
}
function assetsFor(atmosphere: LabAtmosphere, size: "large" | "small" = "large"): Record<string, string> {
  if (atmosphere !== "v2") {
    const theme = atmosphere === "v3" ? "orbit-paper" : atmosphere === "v4" ? "horizon-signs" : "drift";
    return Object.fromEntries(Object.keys(TERM_ASSETS).map((term) => [term, `/images/glossary/themes-oct08/${theme}/${term.toLowerCase()}${size === "small" ? "-256" : ""}.webp`]));
  }
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
// DEMO-ONLY: bespoke light-mode fills for the games (see `accent` below).
const LIGHT_WORLD_FILL: Record<string, string> = { "Business & Finance": "#ffb81f" };

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
function SignalCloud({ pose, size, talking }: { pose: string; size: number; /** keep the mouth moving while a line is still typing (the feedback box) */ talking?: boolean }) {
  const talks = pose === "curious" || pose === "party" || pose === "puzzle" || pose === "idea" || pose === "happy";
  const [speakingState, setSpeaking] = useState(talks);
  const speaking = talking ?? speakingState;
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

function DreamyFace({ pose, size = 96, talking }: { pose: "happy" | "glasses" | "idea" | "curious" | "party" | "nervous" | "puzzle" | "heart"; size?: number; talking?: boolean }) {
  const atmosphere = useAtmosphere();
  if (atmosphere === "v2") return <SignalCloud pose={pose} size={size * 1.6} talking={talking} />;
  return (
    <span key={pose} className="glossary-dreamy-face glossary-dreamy-actor" data-pose={pose} style={{ width: size, height: size }} aria-hidden>
      <span className="glossary-dreamy-aura" />
      <Image
        src={dreamyAssetFor(atmosphere, pose, size <= 112)}
        alt=""
        width={size * 1.5}
        height={size * 1.5}
        className="glossary-dreamy-sprite"
        style={{ width: size, height: size }}
        unoptimized
      />
    </span>
  );
}

/** Actual illustration-medium variants, not a tint of the same render.
 * Three expression anchors cover guidance, curiosity and celebration;
 * Drift retains its original expressive pose library, Signal its pixel rig. */
function dreamyAssetFor(atmosphere: LabAtmosphere, pose: string, small = false) {
  if (atmosphere === "v3" || atmosphere === "v4") {
    const medium = atmosphere === "v3" ? "orbit-ink" : "horizon-signs";
    const expression = pose === "party" || pose === "heart" ? "party" : ["curious", "puzzle", "nervous"].includes(pose) ? "curious" : "happy";
    return `/images/glossary/themes-oct08/${medium}/dreamy-${expression}${small ? "-256" : ""}.webp`;
  }
  return `/images/dreamy/v2/dreamy-${pose}.webp`;
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
      <p className="text-[clamp(18px,calc(2.6dvh/var(--vz,1)),21px)] leading-[1.35] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
        {children}
      </p>
    </div>
  );
}

function MuteToggle() {
  const { playSelect } = useMaterialSounds();
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

function TopBar({ onBack, onOpenLevels, atmosphere, onAtmosphereChange, onRestart, hud }: { onBack: () => void; /** Signal: the progress HUD rides in the middle of this one bar (6 Oct 2026) */ hud?: React.ReactNode; onOpenLevels?: () => void; atmosphere?: LabAtmosphere; onAtmosphereChange?: (next: LabAtmosphere) => void; onRestart?: () => void }) {
  const { playSelect } = useMaterialSounds();
  const [themesOpen, setThemesOpen] = useState(false);
  useEffect(() => {
    if (!themesOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setThemesOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [themesOpen]);
  return (
    <header className={`glossary-topbar relative z-10 flex items-center justify-between px-5 pt-5 md:px-8 ${hud ? "has-hud" : ""}`}>
      <button type="button" onClick={onBack} aria-label="Back" className="dm-quiet flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      {hud ? <div className="glossary-topbar-hud">{hud}</div> : null}
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
        {onRestart ? <button type="button" className="glossary-topbar-action glossary-restart-action dm-quiet" onClick={onRestart} aria-label="Restart game"><RotateCw className="h-[16px] w-[16px]" aria-hidden /><span>Restart</span></button> : null}
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
            : <>
                <Image src={assetsFor(atmosphere).Company} alt="" width={768} height={768} priority unoptimized className="glossary-welcome-hero glossary-welcome-shop" />
                <span className="glossary-welcome-cloud"><DreamyFace pose="happy" size={180} /></span>
                <Image src={assetsFor(atmosphere).Product} alt="" width={256} height={256} priority unoptimized className="glossary-welcome-product" />
              </>}
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
      className={`glossary-flashcard-front absolute inset-0 flex flex-col items-center justify-center gap-[clamp(8px,calc(2dvh/var(--vz,1)),18px)] overflow-hidden rounded-[var(--radius-lg)] border [backface-visibility:hidden] ${artSrc ? "glossary-lab-card-face" : ""}`}
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
          <Image src={artSrc} alt="" width={360} height={360} className="h-[clamp(148px,calc(26dvh/var(--vz,1)),220px)] w-[clamp(148px,calc(26dvh/var(--vz,1)),220px)] object-contain" priority unoptimized />
        ) : (
          <TermIcon icon={icon} className="h-[clamp(72px,calc(16dvh/var(--vz,1)),120px)] w-[clamp(72px,calc(16dvh/var(--vz,1)),120px)]" />
        )}
        {/* Radiating sketch dashes, the doodle around the drawing. */}
        <svg viewBox="0 0 120 120" aria-hidden className="absolute -inset-[26px] h-[calc(100%+52px)] w-[calc(100%+52px)]" style={{ color: "var(--glossary-accent)" }}>
          {[30, 90, 150, 210, 270, 330].map((deg) => (
            <line key={deg} x1="60" y1="4" x2="60" y2="14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${deg} 60 60)`} />
          ))}
        </svg>
      </span>
      <span className="glossary-flashcard-title flex flex-col items-center gap-[3px]">
        <span className="text-[clamp(26px,calc(5.8dvh/var(--vz,1)),34px)] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", filter: artSrc ? undefined : "url(#glossary-sketch)" }}>
          {term}
        </span>
        {/* The hand-drawn underline squiggle. */}
        <svg viewBox="0 0 120 8" aria-hidden className="h-[8px] w-[110px]" style={{ color: "var(--glossary-accent)", filter: "url(#glossary-sketch)" }}>
          <path d="M2 5 Q 20 1, 40 4 T 78 4 T 118 3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      {artSrc && definition ? (
        <span className="glossary-flashcard-definition block max-w-[340px] px-4 text-center text-[clamp(13px,calc(2.2dvh/var(--vz,1)),15px)] leading-[1.4] font-semibold" style={{ color: "var(--foreground)" }}>
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
  const { playCorrect } = useMaterialSounds();
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
    <div className="glossary-screen glossary-unlock-screen flex w-full flex-1 flex-col items-center justify-center gap-[clamp(10px,calc(3.5dvh/var(--vz,1)),28px)] px-5 py-[clamp(8px,calc(3dvh/var(--vz,1)),32px)] text-center">
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
      <h2 className="text-[clamp(18px,calc(3.2dvh/var(--vz,1)),26px)] leading-[1.25] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
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
              className="relative block h-[clamp(240px,calc(40dvh/var(--vz,1)),330px)] w-full cursor-pointer text-left"
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

                <span className="flex min-w-0 flex-1 flex-col justify-center gap-[clamp(6px,calc(1.8dvh/var(--vz,1)),16px)] p-[clamp(14px,calc(3.2dvh/var(--vz,1)),24px)]">
                  <span className="block text-[clamp(24px,calc(5.5dvh/var(--vz,1)),32px)] leading-[1.12] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                    {term.term}
                  </span>

                  {variant === "default" ? (
                    <>
                      <span className="block text-[clamp(14px,calc(2.6dvh/var(--vz,1)),15px)] leading-[1.4]" style={{ color: "var(--foreground)" }}>
                        {term.definition}
                      </span>
                      <span className="block h-px w-full" style={{ background: "var(--glass-border)" }} aria-hidden />
                    </>
                  ) : null}

                  <span className="flex flex-col gap-[6px]">
                    <span className="text-[12px] font-bold tracking-[0.05em] uppercase" style={{ color: "var(--glossary-accent)" }}>
                      {lesson.exampleCompany} Example
                    </span>
                    <span className="block text-[clamp(14px,calc(2.6dvh/var(--vz,1)),15px)] leading-[1.35] font-semibold" style={{ color: "var(--foreground)" }}>
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
  const { playCorrect, playSweep } = useMaterialSounds();
  const assets = useTermAssets();
  const { theme } = useGlobalTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    playSweep();
    if (variant !== "lab") return;
    const reward = window.setTimeout(playCorrect, 360);
    return () => window.clearTimeout(reward);
  }, [variant, playCorrect, playSweep]);

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

function OptionList({ options, assets, grid = false, correctIndex, picked, revealed, missed = [], onPick }: { options: string[]; assets?: (string | null)[]; grid?: boolean; correctIndex: number; picked: number | null; revealed: boolean; missed?: number[]; onPick: (i: number) => void }) {
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
            aria-pressed={isPicked}
            data-repair={missed.includes(i) && !isCorrect ? "true" : undefined}
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
function DocumentOptionList({ options, assets, correctIndex, picked, revealed, missed = [], onPick }: { options: string[]; assets?: (string | null)[]; grid?: boolean; correctIndex: number; picked: number | null; revealed: boolean; missed?: number[]; onPick: (i: number) => void }) {
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
            aria-pressed={isPicked}
            data-repair={missed.includes(i) && !isCorrect ? "true" : undefined}
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

function TypeTermCard({ question, onAnswer, onReset }: { question: Extract<GlossaryQuestion, { kind: "typeTerm" }>; onAnswer: (r: AnswerResult) => void; onReset: () => void }) {
  const { playCorrect, playWrong, playSelect } = useMaterialSounds();
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  function check() {
    const correct = value.trim().toLowerCase() === question.answer.toLowerCase();
    if (correct) playCorrect(); else playWrong();
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
              onClick={() => {
                setValue(word);
                setChecked(null);
                onReset();
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
        onChange={(e) => { setValue(e.target.value); setChecked(null); onReset(); }}
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
  const { playCorrect, playWrong, playSelect } = useMaterialSounds();
  const assets = useTermAssets("small");
  const atmosphere = useAtmosphere();
  const pairColors = ["var(--chart-2)", "var(--amber-400)", "var(--world-food-farming-nature)", "var(--accent-subtle)", "var(--world-tech-engineering-design)"];
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const rightOrder = useMemo(() => shuffleStable(question.pairs.map((p) => p.right), question.id), [question]);

  // Ports anchor both the drag tether and each theme's completion treatment.
  // Drift retains coloured links in its open lane; the other themes flash
  // their bespoke confirmation. The examples remain shuffled.
  const gridRef = useRef<HTMLDivElement>(null);
  const leftDotRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const rightDotRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [flashLine, setFlashLine] = useState<{ x1: number; y1: number; x2: number; y2: number; left: string; right: string; fading: boolean } | null>(null);
  const [dragLine, setDragLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [connections, setConnections] = useState<Array<{ left: string; index: number; x1: number; y1: number; x2: number; y2: number; vertical: boolean }>>([]);
  const drag = useRef<{ left: string; pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const feedbackTimers = useRef<number[]>([]);
  useEffect(() => () => feedbackTimers.current.forEach(window.clearTimeout), []);

  // The supplied Drift demo keeps coloured links in the open middle lane.
  // Measure the real ports again on fitting, resize and undo, rather than
  // assuming shuffled examples share their word's row. Other themes retain
  // their bespoke, transient confirmation animations.
  useLayoutEffect(() => {
    if (atmosphere !== "v1") return;
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const rect = grid.getBoundingClientRect();
      const scale = rect.width / grid.offsetWidth || 1;
      const column = grid.querySelector(".glossary-match-column");
      const vertical = !!column && getComputedStyle(column).display === "contents";
      setConnections(question.pairs.flatMap((pair, index) => {
        const left = leftDotRefs.current.get(pair.left);
        const right = rightDotRefs.current.get(pair.right);
        if (!matched.has(pair.left) || !left || !right) return [];
        const a = left.getBoundingClientRect(), b = right.getBoundingClientRect();
        return [{ left: pair.left, index, vertical, x1: (a.left + a.width / 2 - rect.left) / scale, y1: (a.top + a.height / 2 - rect.top) / scale, x2: (b.left + b.width / 2 - rect.left) / scale, y2: (b.top + b.height / 2 - rect.top) / scale }];
      }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    grid.querySelectorAll(".glossary-match-column").forEach((column) => observer.observe(column));
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [atmosphere, matched, question]);

  function rightAt(x: number, y: number) {
    const tile = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>("[data-match-right]");
    return tile && gridRef.current?.contains(tile) && tile.dataset.matched !== "true" ? tile.dataset.matchRight ?? null : null;
  }

  function moveDrag(e: React.PointerEvent<HTMLButtonElement>) {
    const gesture = drag.current;
    const grid = gridRef.current;
    if (!gesture || gesture.pointerId !== e.pointerId || !grid) return;
    if (!gesture.moved && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) < 7) return;
    if (!gesture.moved) {
      gesture.moved = true;
      setPickedLeft(gesture.left);
      playSelect();
    }
    const dot = leftDotRefs.current.get(gesture.left);
    const rect = grid.getBoundingClientRect();
    const anchor = (dot?.offsetWidth ? dot : e.currentTarget).getBoundingClientRect();
    const scale = rect.width / grid.offsetWidth || 1;
    setDragLine({
      x1: (anchor.left + (dot?.offsetWidth ? anchor.width / 2 : anchor.width) - rect.left) / scale,
      y1: (anchor.top + anchor.height / 2 - rect.top) / scale,
      // FitToScreen and OS display scaling must not displace the tether.
      x2: Math.max(0, Math.min(grid.offsetWidth, (e.clientX - rect.left) / scale)),
      y2: Math.max(0, Math.min(grid.offsetHeight, (e.clientY - rect.top) / scale)),
    });
    setDropTarget(rightAt(e.clientX, e.clientY));
  }

  function endDrag(e: React.PointerEvent<HTMLButtonElement>, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragLine(null);
    setDropTarget(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    suppressClick.current = gesture.moved;
    if (gesture.moved && !cancelled) {
      const right = rightAt(e.clientX, e.clientY);
      if (right) tryMatch(gesture.left, right);
    }
  }

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
    feedbackTimers.current.forEach(window.clearTimeout);
    feedbackTimers.current = [];
    setWrongFlash(null);
    setFlashLine(null);
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
        // Screen fitting transforms the whole board. Convert viewport
        // coordinates back into the SVG's local space. Hidden mobile dots
        // anchor to their tile edge instead of reporting a zero rect.
        const lr = (leftEl.offsetWidth ? leftEl : leftEl.closest("button") ?? leftEl).getBoundingClientRect();
        const rr = (rightEl.offsetWidth ? rightEl : rightEl.closest("button") ?? rightEl).getBoundingClientRect();
        const scale = gridRect.width / grid.offsetWidth || 1;
        setFlashLine({
          x1: (lr.left + (leftEl.offsetWidth ? lr.width / 2 : lr.width) - gridRect.left) / scale,
          y1: (lr.top + lr.height / 2 - gridRect.top) / scale,
          x2: (rr.left + (rightEl.offsetWidth ? rr.width / 2 : 0) - gridRect.left) / scale,
          y2: (rr.top + rr.height / 2 - gridRect.top) / scale,
          left,
          right,
          fading: false,
        });
        feedbackTimers.current.push(window.setTimeout(() => setFlashLine((prev) => (prev ? { ...prev, fading: true } : prev)), 350));
        feedbackTimers.current.push(window.setTimeout(() => setFlashLine(null), 750));
      }

    } else {
      playWrong();
      setWrongFlash(left);
      setPickedLeft(null);
      feedbackTimers.current.push(window.setTimeout(() => setWrongFlash(null), 400));
    }
  }

  return (
    <div className={`glossary-match-up ${matched.size === question.pairs.length ? "is-complete" : ""} relative flex w-full flex-col gap-[var(--space-3)]`}>
      {matched.size === question.pairs.length ? <LocalBurst nonce={1} /> : null}
      {/* One live line that says the next move (Mika's match reference, 9 Oct
         2026), instead of a static "Drag or tap" in the corner. */}
      <p className="glossary-match-hint" aria-live="polite" data-tone={matched.size === question.pairs.length ? "done" : wrongFlash ? "wrong" : "go"}>
        <i aria-hidden />
        <span>
          {matched.size === question.pairs.length
            ? "Every pair is connected!"
            : wrongFlash
              ? "Not a match. Try another one."
              : dropTarget
                ? "Let go to connect them"
                : pickedLeft
                  ? `Now tap or drag to its ${(question.headers?.[1] ?? "example").toLowerCase()}`
                  : `Press a ${(question.headers?.[0] ?? "term").toLowerCase()}, then drag or tap its ${(question.headers?.[1] ?? "example").toLowerCase()}`}
        </span>
      </p>
      <div className="glossary-match-headers grid grid-cols-2 gap-[var(--space-3)]">
        <span className="text-center text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {question.headers?.[0] ?? "Term"}
        </span>
        <span className="text-center text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {question.headers?.[1] ?? "Example"}
        </span>
      </div>
      <div ref={gridRef} className="glossary-match-board relative grid grid-cols-2 gap-[var(--space-3)]">
        {atmosphere === "v1" && <svg aria-hidden className="glossary-match-connections pointer-events-none absolute inset-0 h-full w-full">
          {connections.map((line) => <path key={line.left} d={line.vertical ? `M ${line.x1} ${line.y1} C ${line.x1} ${(line.y1 + line.y2) / 2}, ${line.x2} ${(line.y1 + line.y2) / 2}, ${line.x2} ${line.y2}` : `M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`} style={{ stroke: pairColors[line.index % pairColors.length] }} />)}
        </svg>}
        {dragLine && (
          <svg aria-hidden className="glossary-match-drag-line pointer-events-none absolute inset-0 h-full w-full">
            <path d={`M ${dragLine.x1} ${dragLine.y1} C ${dragLine.x1 + 70} ${dragLine.y1}, ${dragLine.x2 - 70} ${dragLine.y2}, ${dragLine.x2} ${dragLine.y2}`} className="glossary-match-drag-glow" />
            <path d={`M ${dragLine.x1} ${dragLine.y1} C ${dragLine.x1 + 70} ${dragLine.y1}, ${dragLine.x2 - 70} ${dragLine.y2}, ${dragLine.x2} ${dragLine.y2}`} className="glossary-match-drag-core" />
            <circle cx={dragLine.x2} cy={dragLine.y2} r={6} />
          </svg>
        )}
        {flashLine && atmosphere !== "v1" && (
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
        <div className="glossary-match-column flex flex-col gap-[var(--space-2)]">
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
                onPointerDown={(e) => {
                  suppressClick.current = false;
                  if (done || !e.isPrimary || e.button !== 0) return;
                  drag.current = { left: p.left, pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={moveDrag}
                onPointerUp={(e) => endDrag(e)}
                onPointerCancel={(e) => endDrag(e, true)}
                onClick={() => {
                  if (suppressClick.current) { suppressClick.current = false; return; }
                  if (done) {
                    unlink(p.left);
                    return;
                  }
                  setPickedLeft(p.left);
                  window.setTimeout(playSelect, 0);
                }}
                className={`glossary-match-tile glossary-match-left dm-tap ${active ? "is-selected" : ""} ${done ? "is-correct" : ""} ${wrong ? "is-wrong" : ""} flex min-h-[60px] w-full items-center justify-between gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-center text-[13px] font-bold sm:text-[14px] ${active ? "is-active" : ""} ${done ? "is-matched" : ""} ${wrong ? "is-wrong" : ""}`}
                style={{
                  "--pair-color": pairColors[(linkNumber - 1) % pairColors.length],
                  background: done ? "color-mix(in srgb, var(--world-food-farming-nature) 16%, var(--card))" : "var(--card)",
                  borderColor: done ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : active ? "var(--glossary-accent)" : "var(--glass-border)",
                  color: done ? CORRECT_COLOR : "var(--foreground)",
                } as React.CSSProperties}
              >
                <span className="flex flex-1 items-center justify-center gap-[6px]">
                  {done && <span className="glossary-match-lock-code" aria-hidden>{linkNumber}</span>}
                  <span className="glossary-match-label">{p.left}</span>
                </span>
                {/* Connector dot -- anchor point for the SVG line above once
                   this pair is matched. */}
                <span
                  aria-hidden
                  ref={(el) => {
                    if (el) leftDotRefs.current.set(p.left, el);
                    else leftDotRefs.current.delete(p.left);
                  }}
                  className="glossary-match-port size-[9px] flex-none rounded-full border-2"
                  style={{ borderColor: done ? CORRECT_COLOR : "var(--glass-border)", background: done ? CORRECT_COLOR : "transparent" }}
                />
              </button>
            );
          })}
        </div>
        <div className="glossary-match-column flex flex-col gap-[var(--space-2)]">
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
                data-match-right={right}
                data-matched={done}
                aria-label={done ? `${right}, matched as link ${linkNumber}. Tap to unlink.` : right}
                onClick={() => done ? unlink(pair.left) : pickedLeft && tryMatch(pickedLeft, right)}
                className={`glossary-match-tile glossary-match-right dm-tap ${dropTarget === right ? "is-drop-target" : ""} ${done ? "is-correct" : ""} ${!done && pickedLeft ? "is-ready" : ""} flex min-h-[60px] w-full items-center justify-between gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-center text-[13px] font-bold sm:text-[14px] ${done ? "is-matched" : ""}`}
                style={{
                  "--pair-color": pairColors[(linkNumber - 1) % pairColors.length],
                  background: done ? "color-mix(in srgb, var(--world-food-farming-nature) 16%, var(--card))" : "var(--card)",
                  borderColor: done ? CORRECT_COLOR : "var(--glass-border)",
                  color: done ? CORRECT_COLOR : "var(--foreground)",
                } as React.CSSProperties}
              >
                <span
                  aria-hidden
                  ref={(el) => {
                    if (el) rightDotRefs.current.set(right, el);
                    else rightDotRefs.current.delete(right);
                  }}
                  className="glossary-match-port size-[9px] flex-none rounded-full border-2"
                  style={{ borderColor: done ? CORRECT_COLOR : "var(--glass-border)", background: done ? CORRECT_COLOR : "transparent" }}
                />
                <span className="flex flex-1 items-center justify-center gap-[6px]">
                  {artwork ? <Image src={artwork} alt="" width={48} height={48} className="glossary-match-art" draggable={false} aria-hidden unoptimized /> : null}
                  {done && <span className="glossary-match-lock-code" aria-hidden>{linkNumber}</span>}
                  <span className="glossary-match-label">{right}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="glossary-match-status" aria-live="polite">
        <span>{matched.size}/{question.pairs.length} matched</span>
        <span>{matched.size ? "Tap a matched pair to undo" : ""}</span>
      </div>
    </div>
  );
}

function SortBucketsCard({ question, onAnswer, onReset }: { question: Extract<GlossaryQuestion, { kind: "sortBuckets" }>; onAnswer: (r: AnswerResult) => void; onReset: () => void }) {
  const { playCorrect, playWrong, playSelect } = useMaterialSounds();
  const assets = useTermAssets("small");
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);

  const items = useMemo(() => shuffleStable(question.items, question.id + "-items"), [question]);
  const allPlaced = items.every((item) => placed[item.text]);
  // Drag as well as tap (Chandu, 6 Oct 2026: "the bucket question type
  // wasn't intuitive, I should be able to drag if I want to, and everything
  // should give feedback"): a token can be dragged onto a bucket on a mouse
  // or trackpad; the bucket lights while it is over it and pops when it
  // lands. Tapping still works everywhere, and is the only way on touch.
  const [over, setOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ text: string; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null);
  // The ghost renders in a portal on <body>, outside the themed shell, so it
  // carries the shell's atmosphere as a data attribute and each theme styles
  // its own ghost (9 Oct 2026, Chandu: "the tile that appears when dragging
  // doesn't follow any of the pixel theme stuff").
  const [dragTheme, setDragTheme] = useState("");

  // Pointer capture supports mouse, pen and touch. Keep taps/keyboard as
  // the accessible alternative; only a real movement starts a drag.
  function pointerHandlers(text: string) {
    return {
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        suppressClick.current = false;
        gesture.current = { text, x: event.clientX, y: event.clientY, moved: false };
        setDragTheme(event.currentTarget.closest(".glossary-game-shell")?.className.match(/glossary-lab-atmosphere-(v\d)/)?.[1] ?? "");
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => {
        const current = gesture.current;
        if (!current) return;
        if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8) return;
        current.moved = true;
        suppressClick.current = true;
        setDragging(text);
        setDragPoint({ x: event.clientX, y: event.clientY });
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-sort-bucket]");
        setOver(target && sortRef.current?.contains(target) ? target.dataset.sortBucket ?? null : null);
      },
      onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
        const current = gesture.current;
        if (current?.moved) {
          const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-sort-bucket]");
          if (target && sortRef.current?.contains(target) && target.dataset.sortBucket) place(target.dataset.sortBucket, text);
        }
        gesture.current = null;
        setDragPoint(null);
        setDragging(null);
        setOver(null);
      },
      onPointerCancel: () => {
        gesture.current = null;
        suppressClick.current = true;
        setDragPoint(null);
        setDragging(null);
        setOver(null);
      },
    };
  }

  function place(bucket: string, itemText: string | null = picked) {
    if (!itemText) return;
    const next = { ...placed, [itemText]: bucket };
    setPlaced(next);
    setPicked(null);
    setOver(null);
    setDragging(null);
    setLanded(bucket);
    window.setTimeout(() => setLanded((b) => (b === bucket ? null : b)), 420);
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
    <div ref={sortRef} className="glossary-sort-buckets flex w-full flex-col gap-[var(--space-4)]">
      {dragPoint && dragging ? createPortal(<div className="glossary-drag-preview marketing-v2" data-atmosphere={dragTheme || undefined} style={{ left: dragPoint.x, top: dragPoint.y }} aria-hidden>
        {termAssetFor(items.find((item) => item.text === dragging)?.bucket ?? "", assets) ? <Image src={termAssetFor(items.find((item) => item.text === dragging)?.bucket ?? "", assets)!} alt="" width={64} height={64} unoptimized /> : null}
        <span>{dragging}</span>
      </div>, document.body) : null}
      {!allPlaced && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {items
            .filter((item) => !placed[item.text])
            .map((item) => (
              <button
                key={item.text}
                type="button"
                {...pointerHandlers(item.text)}
                onClick={() => {
                  if (suppressClick.current) return;
                  setPicked(item.text);
                  window.setTimeout(playSelect, 0);
                }}
                aria-pressed={picked === item.text}
                className={`glossary-sort-token dm-tap rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-semibold ${picked === item.text ? "is-picked is-selected" : ""} ${dragging === item.text ? "is-dragging" : ""}`}
                style={{ background: "var(--card)", borderColor: picked === item.text ? "var(--accent)" : "var(--glass-border)", color: "var(--foreground)" }}
              >
                {termAssetFor(item.bucket, assets) ? <Image src={termAssetFor(item.bucket, assets)!} alt="" width={56} height={56} className="glossary-sort-art" draggable={false} aria-hidden unoptimized /> : null}
                {item.text}
              </button>
            ))}
        </div>
      )}
      {!allPlaced && <p className="text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{picked ? "Now tap or drop it on a bucket" : "Drag an item to its bucket, or tap it, then tap the bucket"}</p>}
      {allPlaced && <p className="text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tap any item to move it</p>}

      <div className="glossary-sort-grid grid grid-cols-2 gap-[var(--space-3)]">
        {question.buckets.map((bucket) => (
          <div
            key={bucket}
            data-sort-bucket={bucket}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== bucket) setOver(bucket); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver((o) => (o === bucket ? null : o)); }}
            onDrop={(e) => { e.preventDefault(); const text = e.dataTransfer.getData("text/plain") || dragging; if (text) place(bucket, text); }}
            className={`glossary-sort-bucket flex min-h-[116px] flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border p-[var(--space-3)] text-left ${picked ? "is-ready" : ""} ${over === bucket ? "is-over" : ""} ${landed === bucket ? "is-landed" : ""}`}
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
          >
            <button type="button" disabled={!picked} onClick={() => place(bucket)} className="glossary-sort-target dm-tap flex w-full items-center gap-2 text-left disabled:cursor-default">
              {assets[bucket] ? <Image src={assets[bucket]} alt="" width={48} height={48} className="glossary-sort-bucket-art" aria-hidden unoptimized /> : null}
              <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{bucket}</span>
              <span className="glossary-sort-count" aria-hidden>{items.filter((item) => placed[item.text] === bucket).length}</span>
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
                    {...pointerHandlers(item.text)}
                    onClick={() => { if (!suppressClick.current) pickUp(item.text); }}
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

function ProfitBuilderCard({ question, onAnswer, onReset }: { question: Extract<GlossaryQuestion, { kind: "profitBuilder" }>; onAnswer: (r: AnswerResult) => void; onReset: () => void }) {
  const { playCorrect, playWrong } = useMaterialSounds();
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
                aria-label={step.label}
                value={values[i]}
                onChange={(e) => { setValues((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v))); setChecked(false); onReset(); }}
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
  const { playCorrect, playWrong } = useMaterialSounds();
  const [misses, setMisses] = useState<number[]>([]);
  const [missCount, setMissCount] = useState(0);
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
        <p className="text-[clamp(18px,calc(2.6dvh/var(--vz,1)),21px)] leading-[1.35] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
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
              missed={misses}
              revealed={picked !== null && (shuffledOptions[picked].i === question.correctIndex || missCount >= 2)}
              onPick={(i) => {
                setPicked(i);
                const correct = shuffledOptions[i].i === question.correctIndex;
                if (!correct) setMissCount((previous) => previous + 1);
                if (!correct && !misses.includes(i)) setMisses((previous) => [...previous, i]);
                window.setTimeout(correct ? playCorrect : playWrong, 0);
                onAnswer({ correct, creditedTermIds: correct && question.termId ? [question.termId] : [] });
              }}
            />
          );
        })()}
      {question.kind === "typeTerm" && <TypeTermCard question={question} onAnswer={onAnswer} onReset={onReset} />}
      {question.kind === "matchUp" && <MatchUpCard question={question} onAnswer={onAnswer} onReset={onReset} />}
      {question.kind === "sortBuckets" && <SortBucketsCard question={question} onAnswer={onAnswer} onReset={onReset} />}
      {question.kind === "profitBuilder" && <ProfitBuilderCard question={question} onAnswer={onAnswer} onReset={onReset} />}
    </div>
  );
}

/** The line types in, one character at a time, the way a dialogue box
 *  does in a Nintendo game (6 Oct 2026). A tap finishes it at once; a
 *  dedicated Continue commits the answer. Reduced motion shows it whole. */
function useTypewriter(text: string, cps = 60) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new line restarts the typing from its first character
    setN(reduce ? text.length : 0);
    if (reduce) return;
    let i = 0;
    const id = window.setInterval(() => { i += 1; setN(i); if (i >= text.length) window.clearInterval(id); }, 1000 / cps);
    return () => window.clearInterval(id);
  }, [text, cps, reduce]);
  const done = n >= text.length;
  return { shown: text.slice(0, n), done, finish: () => setN(text.length) };
}

function FeedbackPanel({ correct, text, onNext, isLast, inline = false }: { correct: boolean; text: string; onNext: () => void; isLast: boolean; inline?: boolean }) {
  const atmosphere = useAtmosphere();

  // The explanation is in the box from the start (Chandu, 6 Oct 2026: "the
  // why is too small and nobody is gonna click that. Show the feedback in
  // the box without needing the tap"), typed in. Tapping finishes the line;
  // Continue (or the keyboard shortcut) alone commits a recovered answer.
  const { shown, done, finish } = useTypewriter(text);
  const advance = () => { if (!done) finish(); else if (correct) onNext(); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON")) return;
      e.preventDefault();
      advance();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, onNext]);
  return (
    <div className={`glossary-feedback-overlay ${inline ? "is-inline" : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"}`}>
      <div
        className={`glossary-feedback-card relative flex w-full max-w-[440px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] ${done ? "is-done" : ""} ${correct ? "is-right" : "is-wrong"}`}
        style={{ background: correct ? "color-mix(in srgb, var(--world-food-farming-nature) 14%, var(--card))" : "color-mix(in srgb, var(--danger, #e0483e) 10%, var(--card))", borderColor: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}
        onClick={finish}
        aria-live="polite"
      >
        {atmosphere === "v2" && correct && (
          // Signal: pixel coins fly up out of the card on a right answer.
          <span className="glossary-signal-coins" aria-hidden>
            {[-90, -60, -30, 0, 30, 60, 90, -45, 45].map((dx, i) => <i key={i} style={{ "--dx": `${dx}px`, "--delay": `${i * 0.05}s` } as React.CSSProperties} />)}
          </span>
        )}
        <div className="glossary-feedback-layout">
          <span className="glossary-feedback-dreamy"><DreamyFace pose={correct ? "party" : "puzzle"} size={76} talking={!done} /></span>
          <div className="glossary-feedback-copy">
            <span className="glossary-feedback-title flex items-center gap-[8px] text-[19px] font-extrabold" style={{ color: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}>
              <span className="flex size-6 flex-none items-center justify-center rounded-full" style={{ background: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}>
                {correct ? <Check className="h-4 w-4" style={{ color: "var(--background)" }} aria-hidden /> : <Sparkles className="h-4 w-4" style={{ color: "var(--background)" }} aria-hidden />}
              </span>
              {correct ? "Got it!" : "Keep going"}
            </span>
            <p className="glossary-feedback-text" aria-hidden="true"><span className="glossary-feedback-reserve">{text}</span><span className="glossary-feedback-typed">{shown}{!done && <span className="glossary-caret" />}</span></p>
            <span className="sr-only">{text}</span>
          </div>
        </div>
        {done && <ChevronDown className="glossary-feedback-more" aria-hidden />}
        {correct ? <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="glossary-feedback-cta dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-semibold"
          style={{ background: correct ? CORRECT_COLOR : "var(--foreground)", color: correct ? "#05070f" : "var(--background)" }}
        >
          {isLast ? "Results" : "Continue"} <ChevronRight className="h-4 w-4" aria-hidden />
        </button> : <span className="glossary-retry-prompt">Change your answer</span>}
      </div>
    </div>
  );
}

/** Scales a screen down until it fits the room it has, so no screen ever
 *  scrolls (8 Oct 2026, Chandu: "none of the screens should need scrolling
 *  ... scale things appropriately"). Measures the content's own height
 *  (offsetHeight ignores the transform) against the box, scales from the
 *  top and pulls the box up by the difference, so it centres at its scaled
 *  size. Compact responsive layouts do most of the work; scaling only
 *  absorbs exceptional content and viewport combinations. */
function FitToScreen({ children, enabled, watch, compact = false }: { children: React.ReactNode; enabled: boolean; watch: string; compact?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; pull: number; height: number | null }>({ scale: 1, pull: 0, height: null });
  useLayoutEffect(() => {
    const b = box.current;
    const i = inner.current;
    if (!enabled || !b || !i) return;
    const measure = () => {
      let room = b.clientHeight;
      if (compact && b.parentElement) {
        // Measure a FIXED budget, never this content-sized box: measuring the
        // box would feed the scale back into its height. Since 9 Oct 2026 the
        // question screen's main is content-sized too (the frame centres HUD
        // and activity as one group), so the budget is the frame's height
        // minus everything in it that is not this box: the HUD, the inline
        // feedback card, paddings and gaps. All of those are independent of
        // the scale, so the loop stays open.
        const parent = b.parentElement;
        const flowSiblings = (host: HTMLElement, except: HTMLElement) =>
          Array.from(host.children).filter((element) => element !== except && !["absolute", "fixed"].includes(getComputedStyle(element).position)) as HTMLElement[];
        const occupiedBy = (elements: HTMLElement[]) =>
          elements.reduce((sum, element) => {
            const siblingStyle = getComputedStyle(element);
            return sum + element.offsetHeight + (parseFloat(siblingStyle.marginTop) || 0) + (parseFloat(siblingStyle.marginBottom) || 0);
          }, 0);
        const chrome = (host: HTMLElement, count: number) => {
          const hostStyle = getComputedStyle(host);
          return (parseFloat(hostStyle.paddingTop) || 0) + (parseFloat(hostStyle.paddingBottom) || 0) + count * (parseFloat(hostStyle.rowGap) || 0);
        };
        const frame = parent.parentElement && parent.parentElement.classList.contains("glossary-game-frame") && getComputedStyle(parent.parentElement).display === "flex" ? parent.parentElement : null;
        const innerSiblings = flowSiblings(parent, b);
        let budget = parent.clientHeight;
        if (frame) {
          const frameSiblings = flowSiblings(frame, parent);
          budget = frame.clientHeight - occupiedBy(frameSiblings) - chrome(frame, frameSiblings.length);
        }
        room = Math.max(1, budget - occupiedBy(innerSiblings) - chrome(parent, innerSiblings.length));
      }
      const need = i.offsetHeight;
      // a 2px margin keeps sub-pixel rounding from tipping the box into scroll
      let scale = room > 0 && need > room ? Math.max(0.1, (room - 2) / need) : 1;
      if (compact && need < room) {
        // Grow into the room on tall screens (9 Oct 2026: the question block
        // sat small under the HUD with a void beneath it). Capped at 1.15x,
        // so the block keeps air around it and never reads as clutter, and by
        // the frame's width against the activity's own width (the inner is
        // always full width, so measure its child) so it never overflows.
        const content = i.firstElementChild as HTMLElement | null;
        const widthCap = content && content.offsetWidth > 0 ? b.clientWidth / content.offsetWidth : 1;
        scale = Math.max(1, Math.min(1.15, widthCap, (room - 2) / need));
      }
      const pull = scale < 1 ? Math.ceil(need * (1 - scale)) : 0;
      const height = compact ? Math.min(Math.round(need * scale), room) : null;
      if (compact) {
        // The HUD takes the activity's rendered width (Chandu, 9 Oct 2026:
        // "shouldn't the HUD also be the same width as the rest of the
        // content?"), so the two share edges at every scale.
        const frame = b.parentElement?.parentElement;
        const content = i.firstElementChild as HTMLElement | null;
        if (frame && frame.classList.contains("glossary-game-frame") && content && content.offsetWidth > 0) {
          frame.style.setProperty("--glossary-stage-width", `${Math.round(content.offsetWidth * scale)}px`);
        }
      }
      setFit((prev) => (Math.abs(prev.scale - scale) > 0.004 || prev.pull !== pull || prev.height !== height ? { scale, pull, height } : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(b);
    ro.observe(i);
    if (compact && b.parentElement) {
      ro.observe(b.parentElement);
      Array.from(b.parentElement.children).filter((element) => element !== b).forEach((element) => ro.observe(element));
      const frame = b.parentElement.parentElement;
      if (frame && frame.classList.contains("glossary-game-frame")) {
        ro.observe(frame);
        Array.from(frame.children).filter((element) => element !== b.parentElement).forEach((element) => ro.observe(element));
      }
    }
    return () => ro.disconnect();
  }, [enabled, watch, compact]);
  if (!enabled) return <>{children}</>;
  return (
    <div ref={box} className="glossary-fit-box" style={compact && fit.height !== null ? { flex: "none", height: fit.height } : undefined}>
      <div ref={inner} className="glossary-fit-inner" style={fit.scale !== 1 ? { transform: `scale(${fit.scale})`, marginBottom: compact ? 0 : -fit.pull } : undefined}>{children}</div>
    </div>
  );
}

function StreakBanner({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const { playCorrect } = useMaterialSounds();
  useEffect(() => {
    playCorrect();
    const timer = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [onDismiss, playCorrect]);
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
    <div className="glossary-screen glossary-power-intro-screen relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-6)] overflow-hidden px-5 py-[var(--space-10)] text-center" style={{ background: "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--power-accent, var(--hero-accent-purple)) 55%, transparent), transparent 65%)" }}>
      <DreamyFace pose="idea" size={112} />
      <div className="flex flex-col gap-[var(--space-2)]">
        <h2 className="flex items-center justify-center gap-[8px] text-[26px] leading-[32px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          <Zap className="h-6 w-6" style={{ color: "var(--power-accent, var(--hero-accent-purple))" }} fill="currentColor" aria-hidden /> Power Play
        </h2>
        <p className="mx-auto max-w-[380px] text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>
          Use everything you just learned to fill in the blanks.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="dm-solid flex w-full max-w-[420px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-semibold"
        style={{ background: "var(--power-accent, var(--hero-accent-purple))", color: "var(--power-ink, #fff)", fontFamily: "var(--font-display)" }}
      >
        <Zap className="h-4 w-4" fill="currentColor" aria-hidden /> Unlock &amp; Test My Knowledge <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function PowerPlayScreen({ lesson, onComplete }: { lesson: GlossaryLesson; onComplete: () => void }) {
  const { playSweep, playWrong, playSelect } = useMaterialSounds();
  const gaps = lesson.powerPlay.answers.length;
  const [values, setValues] = useState<string[]>(() => lesson.powerPlay.answers.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [burstNonce, setBurstNonce] = useState(0);
  const allCorrect = checked && lesson.powerPlay.answers.every((a, i) => values[i].trim().toLowerCase() === a.toLowerCase());
  const allFilled = values.every((v) => v.trim() !== "");

  // Chips drag into the blanks with the match game's tether (9 Oct 2026,
  // Chandu: "for the powerplay I think the chips should be able to be
  // dragged into the blanks and not just typed. And we can have that same
  // drag interaction we had for match games"). A drag draws the same line
  // from the chip to the pointer, lights the blank under it and drops the
  // word in. A tap fills the blank the student last focused, else the first
  // empty one. Typing still works for every blank.
  const boardRef = useRef<HTMLDivElement>(null);
  const lastBlank = useRef<number | null>(null);
  const chipDrag = useRef<{ word: string; pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressChipClick = useRef(false);
  const [tether, setTether] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [blankTarget, setBlankTarget] = useState<number | null>(null);

  function fill(index: number, word: string) {
    setValues((prev) => prev.map((v, idx) => (idx === index ? word : v)));
    setChecked(false);
    lastBlank.current = null;
    window.setTimeout(playSelect, 0);
  }

  function blankAt(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-power-blank]");
    if (!el || !boardRef.current?.contains(el)) return null;
    return Number(el.dataset.powerBlank);
  }

  function tapChip(word: string) {
    if (suppressChipClick.current) {
      suppressChipClick.current = false;
      return;
    }
    const focused = lastBlank.current;
    const target = focused !== null && focused < values.length ? focused : values.findIndex((v) => v.trim() === "");
    if (target >= 0) fill(target, word);
  }

  function chipHandlers(word: string) {
    return {
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        suppressChipClick.current = false;
        chipDrag.current = { word, pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
        const gesture = chipDrag.current;
        const board = boardRef.current;
        if (!gesture || gesture.pointerId !== e.pointerId || !board) return;
        if (!gesture.moved && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) < 7) return;
        if (!gesture.moved) {
          gesture.moved = true;
          playSelect();
        }
        const rect = board.getBoundingClientRect();
        const chip = e.currentTarget.getBoundingClientRect();
        // FitToScreen scales the board; draw in its own unscaled space.
        const scale = rect.width / board.offsetWidth || 1;
        setTether({
          x1: (chip.left + chip.width / 2 - rect.left) / scale,
          y1: (chip.bottom - rect.top) / scale,
          x2: Math.max(0, Math.min(board.offsetWidth, (e.clientX - rect.left) / scale)),
          y2: Math.max(0, Math.min(board.offsetHeight, (e.clientY - rect.top) / scale)),
        });
        setBlankTarget(blankAt(e.clientX, e.clientY));
      },
      onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
        const gesture = chipDrag.current;
        if (!gesture || gesture.pointerId !== e.pointerId) return;
        chipDrag.current = null;
        setTether(null);
        setBlankTarget(null);
        suppressChipClick.current = gesture.moved;
        if (gesture.moved) {
          const target = blankAt(e.clientX, e.clientY);
          if (target !== null) fill(target, gesture.word);
        }
      },
      onPointerCancel: () => {
        chipDrag.current = null;
        setTether(null);
        setBlankTarget(null);
      },
    };
  }

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
    <div ref={boardRef} className="glossary-screen glossary-power-play-screen relative flex w-full flex-col gap-[var(--space-5)]" style={{ color: "var(--foreground)" }}>
      <h2 className="flex items-center justify-center gap-[8px] text-[22px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        <Zap className="h-5 w-5" style={{ color: "var(--power-accent, var(--hero-accent-purple))" }} fill="currentColor" aria-hidden /> Power Play
      </h2>
      <p className="text-center text-[14px]" style={{ color: "var(--muted-foreground)" }}>
        Drag a word into each blank, or type it.
      </p>
      {/* the word bank: the theme's own chips, on no panel of their own
         (8 Oct 2026, Chandu: "why is this not restyled anywhere") */}
      {/* the tether draws in the screen's own space; an <svg>, so the
         themes' div:nth-of-type rules for the bank and paragraph still hold */}
      {tether && (
        <svg aria-hidden className="glossary-match-drag-line pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
          <path d={`M ${tether.x1} ${tether.y1} C ${tether.x1} ${tether.y1 + 60}, ${tether.x2} ${tether.y2 - 60}, ${tether.x2} ${tether.y2}`} className="glossary-match-drag-glow" />
          <path d={`M ${tether.x1} ${tether.y1} C ${tether.x1} ${tether.y1 + 60}, ${tether.x2} ${tether.y2 - 60}, ${tether.x2} ${tether.y2}`} className="glossary-match-drag-core" />
          <circle cx={tether.x2} cy={tether.y2} r={6} />
        </svg>
      )}
      <div className="glossary-power-bank flex flex-wrap justify-center gap-[var(--space-2)]">
        {[...lesson.powerPlay.answers]
          .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
          .map((word) => (
            <button
              key={word}
              type="button"
              {...chipHandlers(word)}
              onClick={() => tapChip(word)}
              aria-label={`Put ${word} in a blank`}
              className={`glossary-word-chip glossary-power-chip rounded-[var(--radius-sm)] border px-[var(--space-4)] py-[6px] text-[13px] font-semibold glossary-power-drag-chip cursor-grab touch-none select-none active:cursor-grabbing ${values.some((v) => v.trim().toLowerCase() === word.toLowerCase()) ? "is-used" : ""}`}
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
            >
              {word}
            </button>
          ))}
      </div>

      <div className="glossary-power-paragraph relative flex flex-wrap items-baseline gap-x-[6px] gap-y-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-6)] text-[17px] leading-[32px]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
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
              aria-label={`Blank ${gapIndex + 1}`}
              data-power-blank={gapIndex}
              onFocus={() => { lastBlank.current = gapIndex; }}
              value={values[gapIndex]}
              onChange={(e) => { setValues((prev) => prev.map((v, idx) => (idx === gapIndex ? e.target.value : v))); setChecked(false); }}
              className={`glossary-power-blank w-[110px] border-b-2 bg-transparent text-center font-bold outline-none disabled:opacity-100 ${blankTarget === gapIndex ? "is-drop-target" : ""}`}
              style={{
                // The purple accent (Power Play's own theme color, used for
                // the underline/border below) is too low-contrast against
                // this dark background to type against comfortably --
                // direct report of not being able to read their own input.
                // Text stays plain foreground until there's a real verdict.
                color: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)",
                borderColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--power-accent, var(--hero-accent-purple))",
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
        style={{ background: allCorrect ? CORRECT_COLOR : "var(--power-accent, var(--hero-accent-purple))", color: allCorrect ? "#05070f" : "var(--power-ink, #fff)", fontFamily: "var(--font-display)" }}
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
  const { playSweep } = useMaterialSounds();
  // The lesson's finish line had a burst and a party Dreamy but no sound at all.
  // playSweep is this area's own "level-up" sound (Power Play solved uses it), so
  // completing the whole lesson gets at least that.
  useEffect(() => {
    playSweep();
  }, [playSweep]);
  return (
    <div className="glossary-screen glossary-complete-screen relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-6)] overflow-hidden px-5 py-[var(--space-10)] text-center">
      <LocalBurst nonce={1} />
      <DreamyFace pose="party" size={120} />
      <h2 className="glossary-complete-title text-[28px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
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

function LabMaterialScenery({ atmosphere }: { atmosphere: LabAtmosphere }) {
  const cloudId = useId();
  // Bounded vector/CSS layers, not generated backgrounds or a per-frame
  // canvas. Each world uses the same material vocabulary as its objects.
  if (atmosphere === "v2") return null;
  return (
    <div className={`glossary-material-scenery scenery-${atmosphere}`} aria-hidden>
      {atmosphere === "v3" && <div className="glossary-paper-field">
        {Array.from({ length: 48 }, (_, index) => <span key={index} style={{ "--paper-x": `${(index % 8) * 15 - 5}%`, "--paper-y": `${Math.floor(index / 8) * 20 - 5}%`, "--paper-turn": `${(index % 5) * 9 - 18}deg`, "--paper-depth": 1 + (index % 3), "--paper-delay": `${(index % 11) * -1.3}s` } as React.CSSProperties} />)}
      </div>}
      {[0, 1, 2].map((layer) => atmosphere === "v1" ? (
        <svg key={layer} className="glossary-cloud-bank" viewBox="0 0 1200 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${cloudId}-depth-${layer}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--cloud-crest)" />
              <stop offset=".42" stopColor="var(--cloud-mid)" />
              <stop offset="1" stopColor="var(--cloud-base)" />
            </linearGradient>
            <radialGradient id={`${cloudId}-light-${layer}`} cx=".75" cy="0" r=".85">
              <stop offset="0" stopColor="var(--cloud-rim)" stopOpacity=".8" />
              <stop offset=".7" stopColor="var(--cloud-rim)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Shade the existing moving silhouette, not a raster background.
              Day and night share geometry and the original answer reactions. */}
          <path d="M0 170C55 100 145 120 180 160C205 55 350 45 405 125C470 75 570 110 585 170C650 65 790 70 825 160C910 100 1020 125 1045 195C1100 150 1160 145 1200 185V320H0Z" fill={`url(#${cloudId}-depth-${layer})`} />
          <path d="M0 170C55 100 145 120 180 160C205 55 350 45 405 125C470 75 570 110 585 170C650 65 790 70 825 160C910 100 1020 125 1045 195C1100 150 1160 145 1200 185V320H0Z" fill={`url(#${cloudId}-light-${layer})`} />
        </svg>
      ) : atmosphere === "v3" ? <span key={layer} className="glossary-paper-landscape" /> : (
        <div key={layer} className={`glossary-neon-district district-${layer}`}>
          {Array.from({ length: 12 }, (_, index) => <span key={index} style={{ "--tower-height": `${24 + ((index * 31 + layer * 17) % 72)}%`, "--tower-width": `${5 + index % 4}%`, "--tower-delay": `${index * -.8}s` } as React.CSSProperties} />)}
        </div>
      ))}
      {atmosphere === "v4" && <><span className="glossary-neon-sunset" /><span className="glossary-neon-reflection" /><span className="glossary-light-runner" /><span className="glossary-light-runner runner-two" /></>}
    </div>
  );
}

function LabWorldPayoff({ milestone }: { milestone: boolean }) {
  return <div className={`glossary-world-payoff ${milestone ? "is-milestone" : ""}`} aria-hidden>
    <span className="glossary-payoff-halo" /><span className="glossary-payoff-frame" />
    {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ "--particle-angle": `${index * 22.5}deg`, "--particle-delay": `${(index % 4) * 35}ms`, "--particle-distance": `${28 + (index % 3) * 9}vmin` } as React.CSSProperties} />)}
  </div>;
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

function LabAtmosphereLayer({ atmosphere, screen, celebrating, repairing, celebrationKey, interactionScope }: { atmosphere: LabAtmosphere; screen: Screen; celebrating: boolean; repairing: boolean; celebrationKey: string; interactionScope: string }) {
  const milestone = screen === "unlockComplete" || screen === "complete";
  const worldRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [contact, setContact] = useState(0);
  const [reaction, setReaction] = useState({ kind: "", nonce: 0, scope: "" });
  const reactionKind = reaction.scope === interactionScope ? reaction.kind : "";
  useEffect(() => {
    const react = (event: Event) => {
      const kind = (event as CustomEvent<string>).detail;
      if (kind === "select") setContact((previous) => previous + 1);
      else setReaction((previous) => ({ kind, nonce: previous.nonce + 1, scope: interactionScope }));
    };
    window.addEventListener("glossary-world-cue", react);
    return () => window.removeEventListener("glossary-world-cue", react);
  }, [interactionScope]);
  useEffect(() => {
    if (reduced) return;
    const world = worldRef.current;
    if (!world) return;
    let frame = 0;
    let x = .5;
    let y = .5;
    const draw = () => {
      frame = 0;
      world.style.setProperty("--world-pointer-x", String((x - .5) * 2));
      world.style.setProperty("--world-pointer-y", String((y - .5) * 2));
      world.style.setProperty("--world-pointer-u", `${x * 100}%`);
      world.style.setProperty("--world-pointer-v", `${y * 100}%`);
    };
    const move = (event: PointerEvent) => {
      x = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
      y = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
      if (!frame) frame = window.requestAnimationFrame(draw);
    };
    const reset = () => { x = .5; y = .5; if (!frame) frame = window.requestAnimationFrame(draw); };
    const touch = (event: PointerEvent) => { move(event); setContact((previous) => previous + 1); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", touch, { passive: true });
    window.addEventListener("blur", reset);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", touch);
      window.removeEventListener("blur", reset);
    };
  }, [atmosphere, reduced]);
  return (
    <div ref={worldRef} className="glossary-world" data-world-reaction={reactionKind} aria-hidden>
      {atmosphere === "v2" ? (
        <>
          {/* The reference's pixel-art skyline at dusk, under its dark
             gradient, and its pixel font (a <link>, not next/font: see
             the Vercel font note in the handoff). */}
          {/* Signal: Jersey 20 for display and Roboto for sentences (Mika, 9 Oct 2026: "FONT make it more readable, try Jersey 20, try Roboto"); Nunito for Drift so the whole game shares the intro's face. */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jersey+20&family=Roboto:wght@400;500;700&family=Nunito:wght@600;700;800;900&display=swap" />
          <span className="glossary-signal-panorama">
            {/* Alternating reflected tiles join at identical edge pixels.
                Two complete pairs repeat without a snap at the loop seam. */}
            {["city", "sky", "shore"].map((layer) => <span key={layer} className={`glossary-signal-parallax glossary-signal-parallax-${layer}`}>
              <span className="glossary-signal-track">
                {[0, 1, 2, 3].map((tile) => <span key={tile} className="glossary-signal-tile" style={{ backgroundImage: `url(${SIGNAL_BG})`, transform: tile % 2 ? "scaleX(-1)" : undefined }} />)}
              </span>
            </span>)}
          </span>
        </>
      ) : null}
      <LabMaterialScenery atmosphere={atmosphere} />
      <span className="glossary-world-orb glossary-world-orb-a" />
      <span className="glossary-world-orb glossary-world-orb-b" />
      <span className="glossary-world-stars" />
      <span className="glossary-world-grid" />
      <span className="glossary-world-reaction" />
      {contact > 0 && <span key={`contact-${contact}`} className="glossary-world-contact" />}
      {(repairing || reactionKind === "repair") && <span key={`repair-${celebrationKey}-${reaction.nonce}`} className="glossary-world-repair" />}
      {(celebrating || milestone || reactionKind === "correct" || reactionKind === "reward") && <LabWorldPayoff key={`${atmosphere}-${celebrationKey}-${reaction.nonce}`} milestone={milestone} />}
    </div>
  );
}

function LabLevelMap({ career, lesson, atmosphere, onClose }: { career: GlossaryCareer; lesson: GlossaryLesson; atmosphere: LabAtmosphere; onClose: () => void }) {
  const levels = career.levels;
  // Real progress (9 Oct 2026; Mika's notes: "improve how the level screen
  // should show where the students are currently"). A finished lesson shows
  // a check and "Complete", the lesson being played is "Playing now", the
  // rest stay locked. The map used to hard-code level 1 as current and every
  // other level as locked, whatever the student had done.
  const store = useSyncExternalStore(subscribeGlossaryProgress, glossaryProgressSnapshot, serverGlossaryProgressSnapshot);
  const lessonFor = (levelNumber: number) => career.lessons.find((entry) => entry.lessonNumber === levelNumber);
  const isComplete = (index: number) => {
    const entry = lessonFor(levels[index].number);
    return Boolean(entry && readLesson(store, career.careerSlug, entry.id)?.completed);
  };
  const playingIndex = Math.max(0, levels.findIndex((entry) => entry.number === lesson.lessonNumber));
  const completedCount = levels.reduce((count, _, index) => count + (isComplete(index) ? 1 : 0), 0);
  const stateOf = (index: number): "complete" | "current" | "locked" => (isComplete(index) ? "complete" : index === playingIndex ? "current" : "locked");
  const STATE_LABEL = { complete: "Complete", current: "Playing now", locked: "Locked" } as const;
  // Drift review (9 Oct): six district boxes reduce paging without adding
  // the scrolling the student flow deliberately avoids. Other maps stay bespoke.
  const pageSize = atmosphere === "v1" ? 6 : 4;
  // A chapter is a composed scene, not a long scrolling canvas. Paging
  // preserves every level and its locked state on phones and short laptops.
  // It opens on the chapter that holds the level being played.
  const [page, setPage] = useState(Math.floor(playingIndex / pageSize));
  const [selected, setSelected] = useState(playingIndex);
  const pageCount = Math.ceil(levels.length / pageSize);
  const selectedLevel = levels[selected];
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
          <div><span>{career.careerTitle}</span><h2 id="glossary-level-map-title">{atmosphere === "v1" ? "Dream District" : atmosphere === "v2" ? "Mission Index" : atmosphere === "v3" ? "Skill Constellation" : "Championship Circuit"}</h2>
            {/* What this screen is, in one line (Chandu, 6 Oct 2026: the map
               "doesn't tell the user" anything): the rule of the game. */}
            <p className="glossary-level-map-legend">Five words per level. Learn, apply, unlock.</p></div>
          <b>{playingIndex + 1}/{levels.length}</b>
          <button type="button" onClick={onClose} aria-label="Close levels"><X aria-hidden /></button>
        </header>

        <div className="glossary-level-map-progress" aria-label={`${completedCount} of ${levels.length} levels complete`}><span style={{ width: `${Math.max(100 / levels.length, ((completedCount + (isComplete(playingIndex) ? 0 : 1)) / levels.length) * 100)}%` }} /></div>
        <div className="glossary-level-map-viewport">
        <div className={`glossary-level-map-scroll glossary-map-concept-${atmosphere}`}>
          {atmosphere === "v3" ? <div className="glossary-orbit-core"><DreamyFace pose="glasses" size={90} /><b>Core skill</b><span>Business Basics</span></div> : null}
          {atmosphere === "v4" ? <div className="glossary-circuit-horizon"><span>START</span><b>ROAD TO $5B</b></div> : null}
          {levels.slice(page * pageSize, (page + 1) * pageSize).map(({ title, unlocks: value, tier, goal, words, minutes }, slot) => {
            const index = page * pageSize + slot;
            const phase = tier === "Beginner" ? "Beginner · The Startup" : tier === "Intermediate" ? "Intermediate · Scaling Up" : "Advanced · The Big Leagues";
            const firstOfTier = index === 0 || levels[index - 1].tier !== tier;
            const orbitIndex = index === 0 ? 0 : index <= 7 ? index - 1 : index - 8;
            const orbitCount = index === 0 ? 1 : index <= 7 ? 7 : 9;
            const orbitAngle = -Math.PI / 2 + (orbitIndex / orbitCount) * Math.PI * 2;
            const orbitRadius = index === 0 ? 0 : index <= 7 ? 25 : 41;
            const mapStyle = {
              "--map-index": index,
              "--map-slot": slot,
              "--map-x": `${50 + Math.cos(orbitAngle) * orbitRadius}%`,
              "--map-y": `${50 + Math.sin(orbitAngle) * orbitRadius}%`,
            } as React.CSSProperties;
            return (
              <div className={`glossary-map-rung glossary-map-rung-${slot} is-${stateOf(index)} ${selected === index ? "is-inspected" : ""} ${firstOfTier ? "is-first-of-tier" : ""}`} style={mapStyle} data-tier={tier} key={title}>
                {firstOfTier && <span className="glossary-map-phase">{phase}</span>}
                <span className="glossary-map-connector" aria-hidden />
                <button type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} aria-current={stateOf(index) === "current" ? "step" : undefined} aria-label={`Level ${index + 1}, ${title}, unlocks ${value}, ${STATE_LABEL[stateOf(index)].toLowerCase()}`}>
                  {atmosphere === "v1" ? <><span className="glossary-district-badge">{stateOf(index) === "complete" ? <Check aria-hidden /> : stateOf(index) === "current" ? <b>{index + 1}</b> : <LockKeyhole aria-hidden />}</span><span className="glossary-district-rank">Level {index + 1}</span></> : stateOf(index) === "complete" ? <Check aria-hidden /> : stateOf(index) === "current" ? <b>{index + 1}</b> : <LockKeyhole aria-hidden />}
                </button>
                <span className="glossary-map-rung-copy">
                  <b>{title}</b>
                  {/* the level in the student's terms: what it is for, the five words, how long, what it opens (6 Oct 2026) */}
                  <span className="glossary-map-rung-goal">{goal}</span>
                  <span className="glossary-map-rung-words" aria-label="Words in this level">{words.map((w) => <i key={w}>{w}</i>)}</span>
                  <small><span>{minutes} min</span><span><CircleDollarSign aria-hidden /> Unlocks a {value} deal</span><span>{STATE_LABEL[stateOf(index)]}</span></small>
                </span>
              </div>
            );
          })}
        </div>
        </div>
        <nav className="glossary-map-pages" aria-label="Level chapters">
          <button type="button" disabled={page === 0} aria-label="Previous levels" onClick={() => { setPage(page - 1); setSelected((page - 1) * pageSize); }}><ChevronLeft aria-hidden /></button>
          <span>{page * pageSize + 1} to {Math.min((page + 1) * pageSize, levels.length)} of {levels.length}</span>
          <button type="button" disabled={page + 1 === pageCount} aria-label="Next levels" onClick={() => { setPage(page + 1); setSelected((page + 1) * pageSize); }}><ChevronRight aria-hidden /></button>
        </nav>
        <footer>
          <span className="glossary-map-current-number">{selected + 1}</span>
          <div><b>{selectedLevel.title || lesson.title}</b><span>{selectedLevel.words.map((word) => <small key={word}>{word}</small>)}</span><small>{selectedLevel.minutes} min · {selectedLevel.unlocks}</small></div>
          <strong>{stateOf(selected) === "current" ? "Playing" : STATE_LABEL[stateOf(selected)]}</strong>
        </footer>
      </section>
    </div>
  );
}

function LabAtmosphereSwitcher({ value, onChange }: { value: LabAtmosphere; onChange: (next: LabAtmosphere) => void }) {
  const { playSelect } = useMaterialSounds();
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
  // DEMO-ONLY: ?q=<1-based index> opens the level on that question and
  // ?pp=1 on Power Play, so every screen kind can be reviewed without
  // playing through (QA shortcut, 9 Oct 2026). Remove for production with
  // the simulation's qaSkip shortcuts.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = Number(params.get("q"));
    const jump = Number.isFinite(q) && q >= 1 && q <= queue.length ? { index: q - 1, screen: "question" as const } : params.get("pp") === "1" ? { index: 0, screen: "powerPlay" as const } : null;
    if (!jump) return;
    // The URL is an external system; the jump is applied once after mount.
    const t = window.setTimeout(() => {
      setQueueIndex(jump.index);
      setScreen(jump.screen);
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a one-time read of the URL on mount
  }, []);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [pendingResult, setPendingResult] = useState<AnswerResult | null>(null);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState<number | null>(null);
  const [dismissedReview, setDismissedReview] = useState(false);
  const [visibleHeight, setVisibleHeight] = useState<number | null>(null);

  useEffect(() => {
    if (variant !== "lab") return;
    const viewport = window.visualViewport;
    const resize = () => setVisibleHeight(viewport?.height ?? window.innerHeight);
    resize();
    viewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => { viewport?.removeEventListener("resize", resize); window.removeEventListener("resize", resize); };
  }, [variant]);

  useEffect(() => {
    if (variant !== "lab") return;
    const mascot = atmosphere === "v2" ? [SIGNAL_CLOUD, SIGNAL_CLOUD_SPEAKING] : ["happy", "curious", "party"].map((pose) => dreamyAssetFor(atmosphere, pose, true));
    [...Object.values(assetsFor(atmosphere, "small")), ...mascot].forEach((src) => {
      const asset = new window.Image();
      asset.decoding = "async";
      asset.src = src;
    });
  }, [variant, atmosphere]);

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
    setAttempts({});
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
    if (!result.correct && current) setAttempts((previous) => ({ ...previous, [current.id]: (previous[current.id] ?? 0) + 1 }));
    setPendingResult(result);
  }

  function advanceQuestion() {
    // Learning checkpoint, not a failed certification: edits remain free,
    // and only a recovered answer commits mastery and advances the sequence.
    if (!pendingResult?.correct) return;
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
  const { theme: globalTheme } = useGlobalTheme();
  const worldAccent = WORLD_COLORS[career.world] ?? "var(--world-business-money-office)";
  // Light mode: every world token, primitive included, is darkened for TEXT
  // contrast (#996100 / #ad6e00 for business), which reads as mud once it
  // is a title, a bar or a button. Chandu, 9 Oct 2026: "we need a better
  // color for the amber in light mode, even if we have to go bespoke for
  // the games." So the games carry their own light-mode FILL per world (the
  // dark-mode primitive, amber.500), and the few small labels drawn in the
  // accent are darkened again in glossary-worlds.css. Worlds without an
  // entry keep the token. DEMO-ONLY until the token set grows a fill ramp.
  const accent = variant === "lab" && globalTheme === "light" ? (LIGHT_WORLD_FILL[career.world] ?? worldAccent) : worldAccent;
  const termArt = assetsFor(variant === "lab" ? atmosphere : "v1", "small");

  // The HUD stays a strip under the bar (Chandu, 6 Oct 2026, after a
  // one-row try: "the milestone circles can be under the progress bar ...
  // if the stacked version was better do that, but make the top nav
  // shorter"). On Signal both rows are slim and share one panel.
  const signalBar = false;
  const hudNode = screen === "question" ? (
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
                  <span key={t.id} className={`glossary-mastery-token ${done ? "is-mastered" : ""}`} role="img" aria-label={`${t.term}: ${progress} of ${MASTERY_TARGET} mastery checks`}>
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
            <span className="glossary-mastered-count text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span>Mastered </span>{masteredCount}/{lesson.terms.length}
            </span>
          </div>
        </div>
  ) : null;
  const sceneScreen = screen === "unlock" && unlockIndex >= lesson.terms.length ? "unlockComplete" : screen;
  return (
    <AtmosphereContext.Provider value={variant === "lab" ? atmosphere : "v1"}>
    <div
      className={`glossary-game-shell glossary-game-${variant} glossary-lab-atmosphere-${atmosphere} ${variant === "lab" ? "glossary-fit-shell" : ""} marketing-v2 themeable relative flex min-h-dvh w-full flex-col`}
      data-screen={sceneScreen}
      data-question-kind={screen === "question" ? current?.kind : undefined}
      data-answer-state={pendingResult ? (pendingResult.correct ? "correct" : "wrong") : "idle"}
      data-keyboard-open={visibleHeight !== null && visibleHeight < window.innerHeight * .75 ? "true" : undefined}
      style={{
        "--glossary-accent": accent,
        "--glossary-visible-height": visibleHeight !== null ? `${visibleHeight}px` : undefined,
        background: variant === "lab" ? "transparent" : "radial-gradient(120% 60% at 50% -10%, color-mix(in srgb, var(--glossary-accent) 16%, transparent), transparent 65%), var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
      } as React.CSSProperties}
    >
      {variant === "lab" ? <LabAtmosphereLayer atmosphere={atmosphere} screen={sceneScreen} celebrating={pendingResult?.correct === true} repairing={pendingResult?.correct === false} interactionScope={`${sceneScreen}-${current?.id ?? "finale"}`} celebrationKey={`${sceneScreen}-${current?.id ?? "finale"}-${current ? attempts[current.id] ?? 0 : 0}`} /> : null}
      <TopBar
        onBack={() => goBackOr(router, "/play")}
        onOpenLevels={variant === "lab" ? () => setShowLevels(true) : undefined}
        atmosphere={variant === "lab" && screen !== "intro" ? atmosphere : undefined}
        onAtmosphereChange={variant === "lab" && screen !== "intro" ? setAtmosphere : undefined}
        onRestart={variant === "lab" && screen !== "intro" ? restartGame : undefined}
        hud={signalBar ? hudNode : undefined}
      />

      <div className="glossary-game-frame">
      {signalBar ? null : hudNode}

      <main className="glossary-engine-main relative z-0 mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center gap-[var(--space-5)] px-5 py-[var(--space-4)] md:px-8">
        {showStreak !== null && <StreakBanner streak={showStreak} onDismiss={() => setShowStreak(null)} />}
        {/* every screen fits the window, never scrolls (8 Oct 2026) */}
        <FitToScreen enabled={variant === "lab"} compact={screen === "question"} watch={`${screen}-${unlockIndex}-${queueIndex}-${pendingResult ? 1 : 0}`}>
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
          <QuestionScreen key={current.id} question={current} onAnswer={handleAnswer} onReset={() => setPendingResult(null)} />
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
        </FitToScreen>
        {/* the answer's feedback: a bar pinned to the bottom of the column,
           Continue always on screen; the question above it shrinks to fit */}
        {screen === "question" && current && pendingResult && (
          <FeedbackPanel
            correct={pendingResult.correct}
            text={pendingResult.correct ? current.feedbackCorrect : (attempts[current.id] ?? 0) < 2 ? "Try another. Your progress is safe." : current.feedbackWrong}
            isLast={queueIndex + 1 >= queue.length}
            inline={variant === "lab"}
            onNext={advanceQuestion}
          />
        )}
      </main>
      </div>

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
