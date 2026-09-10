"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BookOpen, Check, ChevronRight, EyeOff, Film, Gamepad2, LayoutGrid, MessageCircleQuestion, ShieldCheck, UserPlus, Video, X, Zap, type LucideIcon } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { BorderBeam } from "border-beam";
import styles from "./WelcomeSplash.module.css";

// The welcome moment for each tab, in modal form: where you are, what the
// screen is for, one CTA (direct feedback, 10 Sept 2026: "guide the user
// through where they are and what the intention of that screen is. Build is
// the most flamboyant, the others can have simpler modals but still
// cinematic and easy to understand and vibrant"). Same visual language as
// the Build welcome (Dreamy in living light, gradient title with a clipped
// sweep, chevron CTA), at a fraction of its size and motion.

export type SplashSurface = "match" | "explore" | "play" | "connect";

type Step = {
  eyebrow: string;
  title: string;
  /** big single word (MATCH) vs a sentence-sized title (A moderated space) */
  word?: boolean;
  line?: string;
  /** each row leads with a lucide icon, or with one of the deck's own
   *  animated gesture glyphs (Match: the modal shows the moves it's about
   *  to ask for, direct feedback 10 Sept 2026) */
  rows?: { icon?: LucideIcon; text: ReactNode; tone?: "yes" | "no" }[];
  /** Match: the looping mini-deck that shows the three moves instead of rows */
  demo?: boolean;
  cta: string;
};

type Scene = {
  sprite: string;
  /** Landscape sprite (Dreamy plus a prop beside the cloud): rendered in a
   *  wider box so the cloud itself stays the same size as the square ones. */
  wide?: boolean;
  alt: string;
  /** the two dominant tints of this surface's light (rgb triplets) */
  tint: [string, string];
  steps: Step[];
};

const SCENES: Record<SplashSurface, Scene> = {
  // The heart after all (lightbulb and glasses were both tried and vetoed,
  // direct feedback, 10 Sept 2026), but in indigo-violet rather than pink so
  // a heart on a swipe deck doesn't read as a dating app. One sprite per
  // welcome screen, no repeats: Build happy, Match heart, Explore curious,
  // Play party, Connect puzzle.
  match: {
    sprite: "/images/dreamy/v2/dreamy-heart.png",
    alt: "Dreamy holding a heart",
    tint: ["100, 70, 255", "180, 40, 240"],
    steps: [{
      eyebrow: "You’re in",
      title: "MATCH",
      word: true,
      line: "Careers picked for you. Save the 3 you like most. That’s your Top 3.",
      demo: true,
      cta: "Start matching",
    }],
  },
  explore: {
    sprite: "/images/dreamy/v2/dreamy-curious.png",
    alt: "Dreamy looking around",
    tint: ["40, 140, 255", "30, 185, 170"],
    steps: [{
      eyebrow: "You’re in",
      title: "EXPLORE",
      word: true,
      line: "Every career in one place. Watch a day in the life and see real pay.",
      rows: [
        { icon: Film, text: "For You: careers picked for you" },
        { icon: LayoutGrid, text: "Browse All: every career, by world" },
        { icon: Video, text: "Videos from top companies" },
      ],
      cta: "Start exploring",
    }],
  },
  play: {
    sprite: "/images/dreamy/v2/dreamy-controller.png",
    wide: true,
    alt: "Dreamy with a game controller",
    tint: ["255, 160, 30", "180, 40, 240"],
    steps: [{
      eyebrow: "You’re in",
      title: "PLAY",
      word: true,
      line: "Live a day in the job. Every choice moves your score.",
      rows: [
        { icon: Gamepad2, text: "Day in the Life games" },
        { icon: BookOpen, text: "Glossary games for the lingo" },
        { icon: Zap, text: "Express mode when you’re short on time" },
      ],
      cta: "Start playing",
    }],
  },
  // Two steps, copy unchanged from the corporate-partner-reviewed sheet.
  connect: {
    sprite: "/images/dreamy/v2/dreamy-puzzle-wide.png",
    wide: true,
    alt: "Dreamy with a puzzle piece",
    tint: ["40, 140, 255", "100, 70, 255"],
    steps: [
      {
        eyebrow: "Welcome to",
        title: "CONNECT",
        word: true,
        rows: [
          { icon: UserPlus, tone: "yes", text: <>Students can <strong>follow</strong> Dream Volunteers.</> },
          { icon: MessageCircleQuestion, tone: "yes", text: <>Students can <strong>ask questions publicly</strong>.</> },
          { icon: EyeOff, tone: "no", text: <>Volunteers <strong>can&rsquo;t follow or privately message</strong> students.</> },
        ],
        cta: "Continue",
      },
      {
        eyebrow: "Connect",
        title: "A moderated space",
        rows: [{ icon: ShieldCheck, tone: "yes", text: "All interactions are moderated by Dreamari staff and school faculty." }],
        cta: "Start Connecting!",
      },
    ],
  },
};

// Static so server and client agree (no Math.random in render).
const BLOBS = [
  { x: 14, y: 14, w: 58, h: 52, a: 0.55, p: [10, 8, -6, 14, 4, -4], t: [13, 9, 7.5], d: 0, tint: 0 },
  { x: 40, y: 8, w: 46, h: 44, a: 0.5, p: [-12, 10, 8, 6, -4, 16], t: [11, 8.5, 6.5], d: 1.4, tint: 1 },
  { x: 6, y: 42, w: 44, h: 40, a: 0.42, p: [14, -6, 6, 12, 16, 2], t: [15, 10, 8], d: 2.7, tint: 1 },
  { x: 48, y: 44, w: 40, h: 40, a: 0.4, p: [-8, -12, -14, 4, -2, -10], t: [12, 7.5, 9], d: 0.8, tint: 0 },
];
const ORBS = [
  { x: 14, y: 26, s: 9, b: 0, d: 0, p: 7.5 }, { x: 82, y: 32, s: 7, b: 0.5, d: 1.6, p: 8.5 }, { x: 22, y: 76, s: 5, b: 1, d: 0.7, p: 9 },
  { x: 78, y: 78, s: 10, b: 0, d: 2.4, p: 8 }, { x: 50, y: 6, s: 4, b: 1.4, d: 2.0, p: 11 },
];
const FLARES = [{ x: 12, y: 40, s: 24, d: 0.3, p: 4.5 }, { x: 86, y: 62, s: 18, d: 1.4, p: 5.5 }];

/** Match's three moves, shown rather than told (direct feedback, 10 Sept
 *  2026: "the scroll down gesture isn't very visible ... show you can scroll
 *  up on a card to peek at the information below"). One small card loops
 *  through: its face slides up to reveal the details underneath, then it
 *  swipes right with a save badge, then left with a pass badge; a finger
 *  dot travels with each move and one caption at a time names it. The loop
 *  is one 7.5s CSS timeline (three phases of 2.5s) so every part stays in
 *  step. Reduced motion: the card rests and all three captions are listed. */
function MatchGestureDemo() {
  return (
    <div className={styles.demo} aria-label="How Match works: scroll a card for details, swipe right to save, swipe left to pass" role="img">
      <div className={styles.demoStage} aria-hidden="true">
        <div className={styles.demoBadgeSave}><Check strokeWidth={3} /></div>
        <div className={styles.demoBadgePass}><X strokeWidth={3} /></div>
        <div className={styles.demoCard}>
          {/* One column, face over details, scrolled as a unit: the details
              rise in from the bottom as the face leaves at the top, the way
              the deck card really scrolls (direct feedback, 10 Sept 2026:
              "make it look like more information is scrolled up"). */}
          <div className={styles.demoScroll}>
            <div className={styles.demoFace}>
              <span className={styles.demoPoster} />
              <span className={styles.demoTitle} />
              <span className={styles.demoSub} />
            </div>
            <div className={styles.demoDetails}>
              <span className={styles.demoCaption} />
              <span className={styles.demoChip} />
              <span className={styles.demoLine} />
              <span className={styles.demoLine} style={{ width: "76%" }} />
              <span className={styles.demoLine} style={{ width: "60%" }} />
              <span className={styles.demoChip} style={{ width: "34%", marginTop: 4 }} />
              <span className={styles.demoLine} style={{ width: "82%" }} />
            </div>
          </div>
        </div>
        <span className={styles.demoFinger} />
      </div>
      <div className={styles.demoCaptions}>
        <span className={styles.demoCap1}>Scroll for details</span>
        <span className={styles.demoCap2}>Swipe right to save</span>
        <span className={styles.demoCap3}>Swipe left to pass</span>
      </div>
    </div>
  );
}

/** Controlled: the caller decides when it shows (first visit, once per
 *  Connect visit, ...) and hears when it's done. */
export function WelcomeSplash({ surface, open, onDone }: { surface: SplashSurface; open: boolean; onDone: () => void }) {
  const scene = SCENES[surface];
  const [step, setStep] = useState(0);
  const [departing, setDeparting] = useState(false);
  const [wave, setWave] = useState(false);
  const leaving = useRef(false);
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cta = useRef<HTMLButtonElement>(null);

  // Dreamy's one hello after landing; tap for another (motion only, one
  // normal sprite, same rule as Build).
  function hello() {
    if (waveTimer.current) return;
    setWave(true);
    waveTimer.current = setTimeout(() => {
      setWave(false);
      waveTimer.current = null;
    }, 720);
  }

  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [
      setTimeout(() => cta.current?.focus({ preventScroll: true }), 60),
      ...(reduce ? [] : [setTimeout(hello, 700)]),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (waveTimer.current) clearTimeout(waveTimer.current);
      waveTimer.current = null;
    };
  }, [open]);

  if (!open) return null;
  const current = scene.steps[step];
  const last = step === scene.steps.length - 1;

  function advance() {
    if (leaving.current) return;
    if (!last) {
      dispatchAuroraPulse("select");
      setStep(step + 1);
      return;
    }
    leaving.current = true;
    setDeparting(true);
    dispatchAuroraPulse("cta", undefined, { soft: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(onDone, reduce ? 0 : 320);
  }

  const style = { "--t1": scene.tint[0], "--t2": scene.tint[1] } as CSSProperties;

  return (
    // Bottom sheet on phones, cleared above the fixed MobileNav bar (same
    // padding as Connect's original sheet, which got cropped under it);
    // centered dialog from sm up. The dialog scrolls internally so a long
    // step can never push the CTA off-screen.
    <div className={`${styles.scrim} ${departing ? styles.departing : ""}`} style={style}>
      <div role="dialog" aria-modal="true" aria-labelledby={`splash-${surface}-title`} className={styles.dialog}>
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.beam}>
            {BLOBS.map((b, i) => (
              <i
                key={i}
                style={{
                  left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`,
                  background: `radial-gradient(circle at 42% 40%, rgba(var(--t${b.tint + 1}), ${b.a}), transparent 72%)`,
                  "--dx1": `${b.p[0]}%`, "--dy1": `${b.p[1]}%`, "--dx2": `${b.p[2]}%`, "--dy2": `${b.p[3]}%`, "--dx3": `${b.p[4]}%`, "--dy3": `${b.p[5]}%`,
                  animationDuration: `${b.t[0]}s, ${b.t[1]}s, ${b.t[2]}s`, animationDelay: `${b.d}s, ${b.d * 0.7}s, ${b.d * 1.3}s`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.orbit} />
          <div className={styles.ground} />
          <div className={styles.particles}>
            {ORBS.map((o, i) => (
              <i key={`o${i}`} className={styles.orb} style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s, filter: o.b ? `blur(${o.b}px)` : undefined, animationDelay: `${o.d}s`, animationDuration: `${o.p}s, ${o.p * 0.6}s` }} />
            ))}
            {FLARES.map((f, i) => (
              <i key={`f${i}`} className={styles.flare} style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.s, height: f.s, animationDelay: `${f.d}s`, animationDuration: `${f.p}s` }} />
            ))}
          </div>
        </div>
        <button type="button" className={`${styles.dreamy} ${scene.wide ? styles.dreamyWide : ""} ${wave ? styles.wave : ""}`} onClick={hello} aria-label="Say hello to Dreamy">
          <Image src={scene.sprite} alt={scene.alt} fill sizes={scene.wide ? "250px" : "180px"} priority className={styles.sprite} />
        </button>

        <div className={styles.copy} key={step}>
          <p className={styles.eyebrow}>{current.eyebrow}</p>
          <h2 id={`splash-${surface}-title`} className={current.word ? styles.word : styles.title}>{current.title}</h2>
          {current.line && <p className={styles.line}>{current.line}</p>}
          {current.demo && <MatchGestureDemo />}
          {current.rows && (
            <ul className={styles.rows}>
              {current.rows.map((row, i) => (
                <li key={i} className={styles.row} data-tone={row.tone ?? "yes"} style={{ "--i": i } as CSSProperties}>
                  {row.icon && <span className={styles.rowIcon}><row.icon aria-hidden /></span>}
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
          )}
          {scene.steps.length > 1 && (
            <div className={styles.dots} aria-hidden="true">
              {scene.steps.map((_, i) => <span key={i} className={i === step ? styles.dotOn : styles.dot} />)}
            </div>
          )}
          {/* The ring, not a pulse: the box-shadow nudge read as too much
             (direct feedback, 10 Sept 2026), so the CTA wears the same
             BorderBeam every priority CTA on the site wears. The wrapper
             carries the reveal so BorderBeam's own root animation isn't
             fighting it. */}
          <div className={styles.ctaWrap}>
            <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={3.2} strength={1} active>
              <button ref={cta} type="button" className={styles.cta} onClick={advance} aria-disabled={departing}>
                {current.cta} <ChevronRight size={18} strokeWidth={2.75} aria-hidden />
              </button>
            </BorderBeam>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo switch: show the splash on EVERY visit, ignoring the stored "seen"
// flag (direct request, 10 Sept 2026: "make it appear every time for now,
// for demo"). Same pattern as MatchLab's DEMO_ALWAYS_SHOW_GUIDE. Flip back
// to false before this ships to students.
const DEMO_ALWAYS_SHOW_SPLASH = true;

/** First-visit-only, per surface (localStorage, same pattern as Match's
 *  gesture hint). Renders nothing once seen; marks seen when finished, not
 *  on mount, so it can't hide itself before it paints. */
export function FirstVisitSplash({ surface, onOpenChange }: { surface: Exclude<SplashSurface, "connect">; onOpenChange?: (open: boolean) => void }) {
  const key = `dreamari:welcome:${surface}`;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = true;
    try {
      seen = !DEMO_ALWAYS_SHOW_SPLASH && window.localStorage.getItem(key) === "1";
    } catch {
      // no storage: show it, it just won't be remembered
      seen = false;
    }
    // Report either way: a host that holds its own hints back while the
    // splash is up (Match's gesture spotlight) needs to hear "not showing"
    // on a return visit, or it would wait forever.
    const t = setTimeout(() => {
      if (seen) {
        onOpenChange?.(false);
        return;
      }
      setOpen(true);
      onOpenChange?.(true);
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <WelcomeSplash
      surface={surface}
      open={open}
      onDone={() => {
        try {
          window.localStorage.setItem(key, "1");
        } catch {
          // fine
        }
        setOpen(false);
        onOpenChange?.(false);
      }}
    />
  );
}
