"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleDollarSign,
  Flame,
  Paintbrush,
  Sparkles,
  UserRound,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
  RotateCw,
} from "lucide-react";
import { LocalBurst } from "@/components/build/DreamyGuide";
import { QuickLinksMenu } from "@/components/app/chrome";
import { useGlobalTheme, type GlobalTheme } from "@/components/app/theme";
import {
  mutedSnapshot,
  playCorrect,
  playSelect,
  playFlip,
  playSweep,
  playWrong,
  serverMutedSnapshot,
  setMuted,
  subscribeMuted,
} from "@/components/play/sound";
import {
  glossaryProgressSnapshot,
  readDreamScore,
  saveLessonComplete,
  serverGlossaryProgressSnapshot,
  subscribeGlossaryProgress,
} from "./progress";
import type { GlossaryCareer, GlossaryLesson, GlossaryQuestion } from "./data";
import { SparkBar } from "@/components/flow/SparkBar";

// Glossary Game — built from the Replit reference at /ib-glossary-game plus
// the DreamAri_Glossary_Content_Template_v1.xlsx schema, then reskinned into
// Dreamari's own tokens rather than the reference's teal/violet palette:
// the main game uses var(--world-business-money-office)/var(--amber-400) --
// the DTCG token that's already annotated "(Glossary Challenge)" -- and Power
// Play uses var(--hero-accent-purple), the same violet Play's own hub
// background already blends in, so the bonus round's color shift matches a
// palette this app already owns instead of inventing a new one.
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

const MASTERY_TARGET = 2;
const DREAM_SCORE_PER_XP = 100;

// The amber fill (--world-business-money-office) that works well on this
// game's near-black dark background reads muddy once its own light-mode
// value (darkened for text contrast, not fill contrast) gets used as a
// full-width button. Rather than lean on that token for buttons in light
// mode, swap to the marketing-v2 scope's own foreground/background pair,
// which is already correctly inverted per theme (light mode: near-black on
// near-white) -- no new tokens, just picking the right existing one per mode.
function primaryCtaColors(theme: GlobalTheme) {
  return theme === "light"
    ? { background: "var(--foreground)", color: "var(--background)" }
    : { background: "var(--world-business-money-office)", color: "#05070f" };
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
};

function TermIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = TERM_ICON_MAP[icon] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}

function DreamyFace({ pose, size = 96 }: { pose: "happy" | "glasses" | "idea" | "curious" | "party" | "nervous" | "puzzle" | "heart"; size?: number }) {
  return (
    <Image
      key={pose}
      src={`/images/dreamy/v2/dreamy-${pose}.png`}
      alt=""
      width={size * 1.5}
      height={size * 1.5}
      className="drop-shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
      style={{ width: size, height: size }}
    />
  );
}

function SpeechBubble({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "correct" | "wrong" }) {
  const bg = tone === "correct" ? "color-mix(in srgb, var(--success, #1f9d55) 14%, var(--card))" : tone === "wrong" ? "color-mix(in srgb, var(--danger, #e0483e) 12%, var(--card))" : "var(--glass-surface-1)";
  return (
    <div className="flex min-w-0 flex-1 items-start rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-4)]" style={{ background: bg, borderColor: "var(--glass-border)" }}>
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

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-8">
      <button type="button" onClick={onBack} aria-label="Back" className="dm-quiet flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      {/* Mute stays (it is this game's own control); everything else is the
         app's one hamburger, same as every screen. */}
      <div className="flex items-center gap-[var(--space-2)]">
        <MuteToggle />
        <QuickLinksMenu />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Screen: Intro ("Meet {Company}")

function IntroScreen({ lesson, onNext }: { lesson: GlossaryLesson; onNext: () => void }) {
  const { theme } = useGlobalTheme();
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)] text-center">
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
        className="dm-solid flex w-full max-w-[480px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Next <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Dreamy's onboarding line

function DreamyIntroScreen({ onStart }: { onStart: () => void }) {
  const { theme } = useGlobalTheme();
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)]">
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
          style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
        >
          Start Learning Finance <ArrowRight className="h-4 w-4" aria-hidden />
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
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] px-5 py-[var(--space-5)] text-center">
      <DreamyFace pose="glasses" size={64} />
      <h1 className="text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Learn the Language of Finance
      </h1>

      <div className="flex w-full max-w-[440px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] text-left" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] p-[var(--space-4)]" style={{ background: "color-mix(in srgb, var(--world-business-money-office) 14%, var(--card))" }}>
          <span className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--world-business-money-office)" }}>
            ${lesson.companyValue.toLocaleString()}
          </span>
          {/* Floored (min) so the bar never opens on a literal empty track --
             a future lesson's own companyValue/nextCompanyValue numbers
             could otherwise round to 0%, which reads as "no progress
             possible here" rather than "the start of a journey." */}
          <SparkBar percent={pct} min={4} height={6} track="var(--glass-surface-2)" fill="var(--world-business-money-office)" glow="var(--world-business-money-office)" />
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
        className="dm-solid flex w-full max-w-[440px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Start Lesson {lesson.lessonNumber} <ArrowRight className="h-4 w-4" aria-hidden />
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
function SketchFace({ term, icon, style }: { term: string; icon: string; style?: React.CSSProperties }) {
  return (
    <span
      className="absolute inset-0 flex flex-col items-center justify-center gap-[clamp(8px,2dvh,18px)] overflow-hidden rounded-[var(--radius-lg)] border [backface-visibility:hidden]"
      style={{
        background:
          "repeating-linear-gradient(180deg, transparent 0px, transparent 26px, color-mix(in srgb, var(--glass-border) 55%, transparent) 27px), color-mix(in srgb, var(--world-business-money-office) 4%, var(--card))",
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
      <span className="relative -rotate-2" style={{ filter: "url(#glossary-sketch)", color: "color-mix(in srgb, var(--foreground) 82%, transparent)" }}>
        <TermIcon icon={icon} className="h-[clamp(72px,16dvh,120px)] w-[clamp(72px,16dvh,120px)]" />
        {/* Radiating sketch dashes, the doodle around the drawing. */}
        <svg viewBox="0 0 120 120" aria-hidden className="absolute -inset-[26px] h-[calc(100%+52px)] w-[calc(100%+52px)]" style={{ color: "var(--world-business-money-office)" }}>
          {[30, 90, 150, 210, 270, 330].map((deg) => (
            <line key={deg} x1="60" y1="4" x2="60" y2="14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${deg} 60 60)`} />
          ))}
        </svg>
      </span>
      <span className="flex flex-col items-center gap-[3px]">
        <span className="text-[clamp(26px,5.8dvh,34px)] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", filter: "url(#glossary-sketch)" }}>
          {term}
        </span>
        {/* The hand-drawn underline squiggle. */}
        <svg viewBox="0 0 120 8" aria-hidden className="h-[8px] w-[110px]" style={{ color: "var(--world-business-money-office)", filter: "url(#glossary-sketch)" }}>
          <path d="M2 5 Q 20 1, 40 4 T 78 4 T 118 3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="flex items-center gap-[6px] text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        <RotateCw className="h-[12px] w-[12px] motion-safe:animate-[play-nudge_1.4s_ease-in-out_infinite]" aria-hidden />
        Tap to flip
      </span>
    </span>
  );
}

function UnlockScreen({
  lesson,
  index,
  onUnlock,
}: {
  lesson: GlossaryLesson;
  index: number;
  onUnlock: () => void;
}) {
  const term = lesson.terms[index];
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
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-[clamp(10px,3.5dvh,28px)] px-5 py-[clamp(8px,3dvh,32px)] text-center">
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
      <div className="relative w-full max-w-[440px]" style={{ perspective: "1400px" }}>
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
                playFlip();
                setFlipped((f) => !f);
              }}
              aria-pressed={flipped}
              aria-label={flipped ? `${term.term}: show the drawing` : `${term.term}: flip to the definition`}
              animate={reduced ? undefined : { rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 210, damping: 22 }}
              className="relative block h-[clamp(240px,40dvh,330px)] w-full cursor-pointer text-left"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT: the drawing. A direct child of the rotating element,
                 so its backface-visibility participates in the button's own
                 3D context rather than being flattened by a wrapper. */}
              <SketchFace term={term.term} icon={term.icon} style={reduced && flipped ? { opacity: 0, transition: "opacity 0.15s" } : undefined} />

              {/* BACK: the written page, ring-bound edge and all. */}
              <span
                className="absolute inset-0 flex overflow-hidden rounded-[var(--radius-lg)] border [backface-visibility:hidden]"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--glass-border)",
                  boxShadow: "0 18px 40px -22px rgba(0,0,0,0.35)",
                  transform: reduced ? undefined : "rotateY(180deg)",
                  opacity: reduced ? (flipped ? 1 : 0) : undefined,
                  transition: reduced ? "opacity 0.15s" : undefined,
                }}
              >
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

                  <span className="block text-[clamp(14px,2.6dvh,15px)] leading-[1.4]" style={{ color: "var(--foreground)" }}>
                    {term.definition}
                  </span>

                  <span className="block h-px w-full" style={{ background: "var(--glass-border)" }} aria-hidden />

                  <span className="flex flex-col gap-[6px]">
                    <span className="text-[12px] font-bold tracking-[0.05em] uppercase" style={{ color: "var(--world-business-money-office)" }}>
                      {lesson.exampleCompany} Example
                    </span>
                    <span className="block text-[clamp(14px,2.6dvh,15px)] leading-[1.35] font-semibold" style={{ color: "var(--foreground)" }}>
                      {term.example}
                    </span>
                  </span>
                </span>
              </span>
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
          playCorrect();
          onUnlock();
        }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className="dm-solid flex w-full max-w-[440px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Unlock {term.term} <TermIcon icon={term.icon} className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

function UnlockCompleteScreen({ lesson, onStartPractice }: { lesson: GlossaryLesson; onStartPractice: () => void }) {
  const { theme } = useGlobalTheme();
  // "All N terms unlocked!" with a trophy is a milestone that arrived with no
  // sound and no motion. Same level-up sweep + burst the lesson's own finish
  // line uses, so the two landmarks read as one family.
  useEffect(() => {
    playSweep();
  }, []);
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden px-5 py-[var(--space-5)] text-center">
      <LocalBurst nonce={1} />
      <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-[var(--space-4)]">
        {lesson.terms.map((t) => (
          <span key={t.id} className="relative flex size-11 flex-none items-center justify-center rounded-full sm:size-14" style={{ background: "var(--world-business-money-office)", color: "#05070f" }}>
            <TermIcon icon={t.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-2 sm:size-5" style={{ background: "var(--world-business-money-office)", borderColor: "var(--background)" }}>
              <Check className="h-[9px] w-[9px] sm:h-[11px] sm:w-[11px]" style={{ color: "#05070f" }} aria-hidden />
            </span>
          </span>
        ))}
      </div>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
        <Trophy className="h-8 w-8" style={{ color: "var(--world-business-money-office)" }} aria-hidden />
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
        className="dm-solid flex w-full max-w-[420px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Start Practice <ArrowRight className="h-4 w-4" aria-hidden />
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

function OptionList({ options, correctIndex, picked, onPick }: { options: string[]; correctIndex: number; picked: number | null; onPick: (i: number) => void }) {
  return (
    <div className="flex w-full flex-col gap-[var(--space-3)]">
      {options.map((option, i) => {
        const isPicked = picked === i;
        const isCorrect = i === correctIndex;
        const revealed = picked !== null;
        const dim = revealed && !isPicked && !isCorrect;
        const border = revealed && isCorrect ? CORRECT_COLOR : revealed && isPicked && !isCorrect ? "var(--danger, #e0483e)" : "var(--glass-border)";
        return (
          <button
            key={option}
            type="button"
            disabled={revealed}
            onClick={() => onPick(i)}
            className="dm-tap flex w-full cursor-pointer items-center gap-[var(--space-4)] rounded-[var(--radius-md)] border p-[var(--space-4)] text-left transition-opacity"
            style={{ background: "var(--card)", borderColor: border, opacity: dim ? 0.45 : 1 }}
          >
            <span className="flex size-7 flex-none items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold" style={{ borderColor: "var(--muted-foreground)", color: "var(--foreground)" }}>
              {String.fromCharCode(65 + i)}
            </span>
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
function DocumentOptionList({ options, correctIndex, picked, onPick }: { options: string[]; correctIndex: number; picked: number | null; onPick: (i: number) => void }) {
  const revealed = picked !== null;
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] border" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
      {options.map((option, i) => {
        const isPicked = picked === i;
        const isCorrect = i === correctIndex;
        const dim = revealed && !isPicked && !isCorrect;
        const textColor = revealed && isCorrect ? CORRECT_COLOR : revealed && isPicked && !isCorrect ? "var(--danger, #e0483e)" : "var(--foreground)";
        return (
          <button
            key={option}
            type="button"
            disabled={revealed}
            onClick={() => onPick(i)}
            className="dm-tap flex w-full cursor-pointer items-center gap-[var(--space-4)] border-b p-[var(--space-4)] text-left last:border-b-0 transition-opacity"
            style={{ borderColor: "var(--glass-border)", background: revealed && isPicked ? "color-mix(in srgb, var(--foreground) 6%, transparent)" : "transparent", opacity: dim ? 0.45 : 1 }}
          >
            <span className="flex size-7 flex-none items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold" style={{ borderColor: revealed && (isCorrect || isPicked) ? textColor : "var(--muted-foreground)", color: textColor }}>
              {String.fromCharCode(65 + i)}
            </span>
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
    <div className="flex w-full flex-col gap-[var(--space-4)]">
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
              onClick={() => setValue(word)}
              className="dm-tap rounded-[var(--radius-md)] border px-[var(--space-4)] py-[6px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: value === word ? "var(--world-business-money-office)" : "var(--glass-border)", color: "var(--foreground)", background: value === word ? "color-mix(in srgb, var(--world-business-money-office) 16%, var(--card))" : "transparent" }}
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
        className="w-full rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-4)] text-[15px] font-semibold outline-none disabled:opacity-100"
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          Check Answer
        </button>
      )}
    </div>
  );
}

function MatchUpCard({ question, onAnswer }: { question: Extract<GlossaryQuestion, { kind: "matchUp" }>; onAnswer: (r: AnswerResult) => void }) {
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
  const [flashLine, setFlashLine] = useState<{ x1: number; y1: number; x2: number; y2: number; fading: boolean } | null>(null);

  function tryMatch(left: string, right: string) {
    const pair = question.pairs.find((p) => p.left === left);
    if (!pair) return;
    if (pair.right === right) {
      playCorrect();
      const next = new Set(matched);
      next.add(left);
      setMatched(next);
      setPickedLeft(null);

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
          fading: false,
        });
        setTimeout(() => setFlashLine((prev) => (prev ? { ...prev, fading: true } : prev)), 350);
        setTimeout(() => setFlashLine(null), 750);
      }

      if (next.size === question.pairs.length) {
        onAnswer({ correct: true, creditedTermIds: question.pairs.map((p) => p.termId) });
      }
    } else {
      playWrong();
      setWrongFlash(left);
      setPickedLeft(null);
      setTimeout(() => setWrongFlash(null), 400);
    }
  }

  return (
    <div className="flex w-full flex-col gap-[var(--space-3)]">
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <span className="text-center text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          Term
        </span>
        <span className="text-center text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          Example
        </span>
      </div>
      <div ref={gridRef} className="relative grid grid-cols-2 gap-[var(--space-3)]">
        {flashLine && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <line
              x1={flashLine.x1}
              y1={flashLine.y1}
              x2={flashLine.x2}
              y2={flashLine.y2}
              stroke={CORRECT_COLOR}
              strokeWidth={2}
              className="transition-opacity duration-300"
              style={{ opacity: flashLine.fading ? 0 : 1 }}
            />
          </svg>
        )}
        <div className="flex flex-col gap-[var(--space-2)]">
          {question.pairs.map((p) => {
            const done = matched.has(p.left);
            const active = pickedLeft === p.left;
            const wrong = wrongFlash === p.left;
            return (
              <button
                key={p.left}
                type="button"
                disabled={done}
                onClick={() => setPickedLeft(p.left)}
                className="dm-tap flex min-h-[60px] w-full items-center justify-between gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-center text-[13px] font-bold sm:text-[14px]"
                style={{
                  background: done ? "color-mix(in srgb, var(--world-food-farming-nature) 16%, var(--card))" : "var(--card)",
                  borderColor: done ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : active ? "var(--world-business-money-office)" : "var(--glass-border)",
                  color: done ? CORRECT_COLOR : "var(--foreground)",
                }}
              >
                <span className="flex flex-1 items-center justify-center gap-[6px]">
                  {done && <Check className="h-[14px] w-[14px] flex-none" aria-hidden />}
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
            return (
              <button
                key={right}
                type="button"
                disabled={done || !pickedLeft}
                onClick={() => pickedLeft && tryMatch(pickedLeft, right)}
                className="dm-tap flex min-h-[60px] w-full items-center justify-between gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-center text-[13px] font-bold sm:text-[14px]"
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
                  {done && <Check className="h-[14px] w-[14px] flex-none" aria-hidden />}
                  {right}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SortBucketsCard({ question, onAnswer }: { question: Extract<GlossaryQuestion, { kind: "sortBuckets" }>; onAnswer: (r: AnswerResult) => void }) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const items = useMemo(() => shuffleStable(question.items, question.id + "-items"), [question]);
  const allPlaced = items.every((item) => placed[item.text]);

  function place(bucket: string) {
    if (!picked) return;
    playSelect();
    setPlaced((prev) => ({ ...prev, [picked]: bucket }));
    setPicked(null);
  }

  function check() {
    setChecked(true);
    const correctItems = items.filter((item) => placed[item.text] === item.bucket);
    const allCorrect = correctItems.length === items.length;
    if (allCorrect) playCorrect();
    else playWrong();
    onAnswer({ correct: allCorrect, creditedTermIds: correctItems.map((i) => i.termId) });
  }

  return (
    <div className="flex w-full flex-col gap-[var(--space-4)]">
      {!allPlaced && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {items
            .filter((item) => !placed[item.text])
            .map((item) => (
              <button
                key={item.text}
                type="button"
                onClick={() => setPicked(item.text)}
                className="dm-tap rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-semibold"
                style={{ background: "var(--card)", borderColor: picked === item.text ? "var(--accent)" : "var(--glass-border)", color: "var(--foreground)" }}
              >
                {item.text}
              </button>
            ))}
        </div>
      )}
      {!allPlaced && <p className="text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Tap an item, then tap its bucket</p>}
      {allPlaced && !checked && (
        <p className="flex items-center justify-center gap-[6px] text-center text-[13px] font-bold" style={{ color: "var(--world-business-money-office)" }}>
          <Check className="h-4 w-4" aria-hidden /> All placed
        </p>
      )}

      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        {question.buckets.map((bucket) => (
          <button
            key={bucket}
            type="button"
            disabled={!picked}
            onClick={() => place(bucket)}
            className="dm-tap flex min-h-[84px] flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border p-[var(--space-3)] text-left"
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
          >
            <span className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>
              {bucket}
            </span>
            {items
              .filter((item) => placed[item.text] === bucket)
              .map((item) => {
                const wrongPlacement = checked && item.bucket !== bucket;
                return (
                  <span
                    key={item.text}
                    className="rounded-[var(--radius-sm)] px-[var(--space-3)] py-[4px] text-[12px] font-semibold"
                    style={{
                      background: checked ? (wrongPlacement ? "color-mix(in srgb, var(--danger, #e0483e) 20%, var(--card))" : "color-mix(in srgb, var(--world-food-farming-nature) 20%, var(--card))") : "color-mix(in srgb, var(--amber-400) 22%, var(--card))",
                      color: checked ? (wrongPlacement ? "var(--danger, #e0483e)" : CORRECT_COLOR) : "var(--foreground)",
                    }}
                  >
                    {item.text}
                  </span>
                );
              })}
          </button>
        ))}
      </div>

      {allPlaced && !checked && (
        <button
          type="button"
          onClick={check}
          className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-bold"
          style={{ background: "var(--world-business-money-office)", color: "#05070f" }}
        >
          Check My Sorting
        </button>
      )}
    </div>
  );
}

function ProfitBuilderCard({ question, onAnswer }: { question: Extract<GlossaryQuestion, { kind: "profitBuilder" }>; onAnswer: (r: AnswerResult) => void }) {
  const [values, setValues] = useState<string[]>(() => question.steps.map(() => ""));
  const [checked, setChecked] = useState(false);
  const allFilled = values.every((v) => v.trim() !== "");

  function check() {
    setChecked(true);
    const allCorrect = question.steps.every((step, i) => Number(values[i].replace(/[,$]/g, "")) === step.answer);
    if (allCorrect) playCorrect();
    else playWrong();
    onAnswer({ correct: allCorrect, creditedTermIds: allCorrect && question.termId ? [question.termId] : [] });
  }

  return (
    <div className="flex w-full flex-col gap-[var(--space-4)]">
      <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[14px] font-semibold" style={{ background: "color-mix(in srgb, var(--world-business-money-office) 12%, var(--card))", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
        {question.scenario}
      </p>
      {question.steps.map((step, i) => {
        const correct = checked && Number(values[i].replace(/[,$]/g, "")) === step.answer;
        const wrong = checked && !correct;
        return (
          <div key={step.order} className="flex items-center justify-between gap-[var(--space-3)]">
            <span className="flex items-center gap-[var(--space-3)] text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
              <span
                className="flex size-6 flex-none items-center justify-center rounded-full border-[1.5px] text-[12px] font-bold"
                style={{ borderColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--muted-foreground)", color: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--foreground)" }}
              >
                {step.order}
              </span>
              {step.label}
            </span>
            <div className="flex items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)]" style={{ background: "var(--card)", borderColor: correct ? CORRECT_COLOR : wrong ? "var(--danger, #e0483e)" : "var(--glass-border)" }}>
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--world-business-money-office)", color: "#05070f" }}
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
}: {
  question: GlossaryQuestion;
  onAnswer: (r: AnswerResult) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const shuffledOptions = useMemo(() => (question.kind === "choice" ? shuffleStable(question.options.map((o, i) => ({ o, i })), question.id) : []), [question]);

  // No enclosing card here on purpose -- wrapping the whole question (prompt,
  // Dreamy, and the already-boxed answer options) in one more outer card
  // was boxes-inside-boxes, per direct feedback. Every renderer below
  // already carries its own visual weight (option pills, the document
  // sheet, bordered tiles), so this screen can sit directly on the page's
  // own background like the intro/unlock screens already do, and use the
  // taller mobile viewport instead of being squeezed into a fixed card.
  return (
    <div className="relative flex w-full flex-col gap-[var(--space-6)]">
      {question.kind !== "matchUp" && question.kind !== "sortBuckets" && question.kind !== "profitBuilder" && (
        // No side padding here -- it was only ever there to "make room" for
        // Dreamy, but since he's absolutely positioned he doesn't need it,
        // and it was shifting the bubble (and the question text) off-center
        // on mobile, where this row is close to the full card width.
        <div className="relative pt-[var(--space-7)]">
          <span className="absolute -top-8 left-2 z-10">
            <DreamyFace pose="curious" size={56} />
          </span>
          <SpeechBubble>{question.prompt}</SpeechBubble>
        </div>
      )}
      {(question.kind === "matchUp" || question.kind === "sortBuckets") && (
        <p className="text-[clamp(18px,2.6dvh,21px)] leading-[1.35] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
          {question.prompt}
        </p>
      )}

      {question.kind === "choice" &&
        (() => {
          const ListComponent = question.type === "Catch the Misuse" ? DocumentOptionList : OptionList;
          return (
            <ListComponent
              options={shuffledOptions.map((s) => s.o)}
              correctIndex={shuffledOptions.findIndex((s) => s.i === question.correctIndex)}
              picked={picked}
              onPick={(i) => {
                if (picked !== null) return;
                setPicked(i);
                const correct = shuffledOptions[i].i === question.correctIndex;
                if (correct) playCorrect();
                else playWrong();
                onAnswer({ correct, creditedTermIds: correct && question.termId ? [question.termId] : [] });
              }}
            />
          );
        })()}
      {question.kind === "typeTerm" && <TypeTermCard question={question} onAnswer={onAnswer} />}
      {question.kind === "matchUp" && <MatchUpCard question={question} onAnswer={onAnswer} />}
      {question.kind === "sortBuckets" && <SortBucketsCard question={question} onAnswer={onAnswer} />}
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
function FeedbackPanel({ correct, text, onNext, isLast }: { correct: boolean; text: string; onNext: () => void; isLast: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <div
        className="flex w-full max-w-[440px] flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]"
        style={{ background: correct ? "color-mix(in srgb, var(--world-food-farming-nature) 14%, var(--card))" : "color-mix(in srgb, var(--danger, #e0483e) 10%, var(--card))", borderColor: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}
      >
        <div className="flex items-start gap-[var(--space-3)]">
          <DreamyFace pose={correct ? "party" : "puzzle"} size={56} />
          <div className="flex flex-col gap-[3px]">
            <span className="flex items-center gap-[8px] text-[16px] font-extrabold" style={{ color: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}>
              <span className="flex size-6 flex-none items-center justify-center rounded-full" style={{ background: correct ? CORRECT_COLOR : "var(--danger, #e0483e)" }}>
                {correct ? <Check className="h-4 w-4" style={{ color: "#05070f" }} aria-hidden /> : <X className="h-4 w-4" style={{ color: "var(--background)" }} aria-hidden />}
              </span>
              {correct ? "Correct!" : "Not quite"}
            </span>
            <p className="text-[14px] leading-[19px]" style={{ color: "var(--foreground)" }}>
              {text}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-4)] text-[15px] font-bold"
          style={{ background: correct ? CORRECT_COLOR : "var(--foreground)", color: correct ? "#05070f" : "var(--background)" }}
        >
          {isLast ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function StreakModal({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  // A streak award with a party Dreamy and "On fire!" had no sound or motion
  // beyond the modal appearing. The correct-answer chime it just earned, plus a
  // burst, so it lands as the bonus it is.
  useEffect(() => {
    playCorrect();
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5" onClick={onDismiss}>
      <div
        className="relative flex w-full max-w-[320px] flex-col items-center gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] p-[var(--space-8)] text-center motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ background: "linear-gradient(160deg, var(--hero-accent-teal), var(--background))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <LocalBurst nonce={1} />
        <DreamyFace pose="party" size={100} />
        <p className="flex items-center gap-[8px] text-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--amber-400)" }}>
          <Flame className="h-7 w-7" fill="currentColor" aria-hidden /> {streak} in a row!
        </p>
        <p className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>
          On fire!
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] py-[var(--space-3)] text-[15px] font-bold"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          Keep Going <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Power Play

function PowerPlayIntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-6)] overflow-hidden px-5 py-[var(--space-10)] text-center" style={{ background: "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 65%)" }}>
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
        className="dm-solid flex w-full max-w-[420px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
        style={{ background: "var(--hero-accent-purple)", color: "#fff", fontFamily: "var(--font-display)" }}
      >
        <Zap className="h-4 w-4" fill="currentColor" aria-hidden /> Unlock &amp; Test My Knowledge <ArrowRight className="h-4 w-4" aria-hidden />
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
    <div className="flex w-full flex-col gap-[var(--space-5)]" style={{ color: "var(--foreground)" }}>
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
            <Trophy className="h-5 w-5" aria-hidden /> Power Play Complete!
          </span>
        </div>
      )}

      <button
        type="button"
        disabled={!allFilled}
        onClick={allCorrect ? onComplete : check}
        className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: allCorrect ? CORRECT_COLOR : "var(--hero-accent-purple)", color: allCorrect ? "#05070f" : "#fff", fontFamily: "var(--font-display)" }}
      >
        {allCorrect ? (
          <>
            Finish Lesson <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        ) : (
          <>
            Check Answers <Zap className="h-4 w-4" fill="currentColor" aria-hidden />
          </>
        )}
      </button>
      <p className="text-center text-[11px]" style={{ color: "var(--muted-foreground)" }}>
        Spelling must match exactly · not case-sensitive
      </p>
    </div>
  );
}

function MasteryLoadingScreen({ fact }: { fact: string | null }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-5)] px-5 py-[var(--space-10)] text-center">
      <DreamyFace pose="idea" size={112} />
      <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Checking Your Mastery
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
  dreamScore,
  onContinue,
}: {
  lesson: GlossaryLesson;
  masteredCount: number;
  dreamScore: number;
  onContinue: () => void;
}) {
  const masteryPct = Math.round((masteredCount / lesson.terms.length) * 100);
  const { theme } = useGlobalTheme();
  // The lesson's finish line had a burst and a party Dreamy but no sound at all.
  // playSweep is this area's own "level-up" sound (Power Play solved uses it), so
  // completing the whole lesson gets at least that.
  useEffect(() => {
    playSweep();
  }, []);
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-[var(--space-6)] overflow-hidden px-5 py-[var(--space-10)] text-center">
      <LocalBurst nonce={1} />
      <DreamyFace pose="party" size={120} />
      <h2 className="text-[28px] leading-[34px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Lesson Complete!
      </h2>

      <div className="flex w-full max-w-[380px] flex-col items-center gap-[2px] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--world-business-money-office) 14%, var(--card))", borderColor: "var(--world-business-money-office)" }}>
        <span className="flex items-center gap-[6px] text-[15px] font-bold" style={{ color: "var(--world-business-money-office)" }}>
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
          <span className="text-[18px] font-extrabold" style={{ color: "var(--world-business-money-office)" }}>
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
        className="dm-solid flex w-full max-w-[380px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-6)] py-[var(--space-4)] text-[16px] font-bold"
        style={{ ...primaryCtaColors(theme), fontFamily: "var(--font-display)" }}
      >
        Continue <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level orchestrator

export function GlossaryGameExperience({ career, lesson }: { career: GlossaryCareer; lesson: GlossaryLesson }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intro");
  const [unlockIndex, setUnlockIndex] = useState(0);
  const [queue, setQueue] = useState<GlossaryQuestion[]>(() => [...lesson.questions].sort((a, b) => a.playOrder - b.playOrder));
  const [queueIndex, setQueueIndex] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [pendingResult, setPendingResult] = useState<AnswerResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState<number | null>(null);
  const [dismissedReview, setDismissedReview] = useState(false);

  const progressStore = useSyncExternalStore(subscribeGlossaryProgress, glossaryProgressSnapshot, serverGlossaryProgressSnapshot);
  const priorDreamScore = readDreamScore(progressStore, career.careerSlug);

  const mainLoopLength = lesson.questions.length;
  const current = queue[queueIndex];
  // 1-indexed: the current question already counts toward progress (matching
  // the reference, which reads "1/7 · 14%" on the very first question, not
  // 0%) -- a progress bar should never open at zero, that reads as "nothing
  // done yet" before the student has even had a chance to answer.
  const currentNumber = Math.min(queueIndex + 1, queue.length);
  const percent = queue.length ? Math.round((currentNumber / Math.max(mainLoopLength, queue.length)) * 100) : 0;
  const masteredCount = lesson.terms.filter((t) => (mastery[t.id] ?? 0) >= MASTERY_TARGET).length;

  function exitToCareer() {
    router.push(`/career/${career.careerSlug}`);
  }

  function handleAnswer(result: AnswerResult) {
    setPendingResult(result);
    if (result.creditedTermIds.length > 0) {
      setMastery((prev) => {
        const next = { ...prev };
        for (const id of result.creditedTermIds) next[id] = (next[id] ?? 0) + 1;
        return next;
      });
    }
    if (result.correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > 0 && nextStreak % 5 === 0) setShowStreak(nextStreak);
    } else {
      setStreak(0);
    }
  }

  function advanceQuestion() {
    setPendingResult(null);
    const isEndOfMain = queueIndex + 1 >= queue.length;
    if (!isEndOfMain) {
      setQueueIndex((i) => i + 1);
      return;
    }
    // Remediation: any term still short of mastery pulls one held-back
    // review question before moving on, per the content template's rule
    // that a wrong answer needs a different question next round.
    if (!dismissedReview) {
      const shortTerms = lesson.terms.filter((t) => (mastery[t.id] ?? 0) < MASTERY_TARGET).map((t) => t.id);
      const reviewPool = lesson.reviewQuestions.filter((q) => q.termId && shortTerms.includes(q.termId) && !queue.some((existing) => existing.id === q.id));
      if (reviewPool.length > 0) {
        setQueue((prev) => [...prev, ...reviewPool]);
        setQueueIndex((i) => i + 1);
        return;
      }
      setDismissedReview(true);
    }
    setScreen("powerPlayIntro");
  }

  return (
    <div
      className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col"
      style={{
        background: "radial-gradient(120% 60% at 50% -10%, color-mix(in srgb, var(--world-business-money-office) 16%, transparent), transparent 65%), var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
      }}
    >
      <TopBar onBack={() => router.back()} />

      {screen === "question" && (
        <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col gap-[var(--space-2)] px-5 pt-[var(--space-3)] md:px-8">
          <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            <span>{lesson.title}</span>
            <span>
              {currentNumber}/{Math.max(mainLoopLength, queue.length)} · {percent}%
            </span>
          </div>
          {/* Sparks on every correct answer that moves it (SparkBar), same as Build. */}
          <SparkBar percent={percent} min={4} height={6} track="var(--glass-surface-2)" fill="var(--world-business-money-office)" glow="var(--world-business-money-office)" />
          {/* Mastery reads as filled skill dots, one per term (Duolingo's own
             mastery visualization), not just a fraction in text -- seeing
             which specific term is still open is more useful than a count. */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[6px]">
              {lesson.terms.map((t) => {
                const done = (mastery[t.id] ?? 0) >= MASTERY_TARGET;
                return (
                  <span
                    key={t.id}
                    title={t.term}
                    className="flex size-5 items-center justify-center rounded-full"
                    style={{ background: done ? "var(--world-business-money-office)" : "var(--glass-surface-2)", color: "#05070f" }}
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

      <main className="relative z-0 mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center gap-[var(--space-5)] px-5 py-[var(--space-4)] md:px-8">
        {screen === "intro" && <IntroScreen lesson={lesson} onNext={() => setScreen("dreamyIntro")} />}
        {screen === "dreamyIntro" && <DreamyIntroScreen onStart={() => setScreen("lessonIntro")} />}
        {screen === "lessonIntro" && <LessonIntroScreen lesson={lesson} onStart={() => setScreen("unlock")} />}
        {screen === "unlock" &&
          (unlockIndex < lesson.terms.length ? (
            <UnlockScreen lesson={lesson} index={unlockIndex} onUnlock={() => setUnlockIndex((i) => i + 1)} />
          ) : (
            <UnlockCompleteScreen lesson={lesson} onStartPractice={() => setScreen("question")} />
          ))}
        {screen === "question" && current && (
          <>
            <QuestionScreen key={current.id} question={current} onAnswer={handleAnswer} />
            {pendingResult && (
              <FeedbackPanel
                correct={pendingResult.correct}
                text={pendingResult.correct ? current.feedbackCorrect : current.feedbackWrong}
                isLast={queueIndex + 1 >= queue.length}
                onNext={advanceQuestion}
              />
            )}
          </>
        )}
        {screen === "powerPlayIntro" && <PowerPlayIntroScreen onStart={() => setScreen("powerPlay")} />}
        {screen === "powerPlay" && <PowerPlayScreen lesson={lesson} onComplete={() => setScreen("masteryLoading")} />}
        {screen === "masteryLoading" && <MasteryLoadingScreenGate lesson={lesson} onDone={() => setScreen("complete")} />}
        {screen === "complete" && (
          <CompleteScreenGate
            lesson={lesson}
            career={career}
            masteredCount={masteredCount}
            priorDreamScore={priorDreamScore}
            onContinue={exitToCareer}
          />
        )}
      </main>

      {showStreak !== null && <StreakModal streak={showStreak} onDismiss={() => setShowStreak(null)} />}
    </div>
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
  priorDreamScore,
  onContinue,
}: {
  lesson: GlossaryLesson;
  career: GlossaryCareer;
  masteredCount: number;
  priorDreamScore: number;
  onContinue: () => void;
}) {
  const gain = lesson.xpReward * DREAM_SCORE_PER_XP;
  // Lazy initializer, not an effect: this must run exactly once, the instant
  // this screen mounts, not after a render+commit round-trip.
  useState(() => saveLessonComplete(career.careerSlug, lesson.id, lesson.terms.map((t) => t.id), gain));
  return <CompleteScreen lesson={lesson} masteredCount={masteredCount} dreamScore={priorDreamScore + gain} onContinue={onContinue} />;
}
