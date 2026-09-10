"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronRight, EyeOff, Sparkles, X, MessageCircleQuestion, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { BorderBeam } from "border-beam";
import styles from "./WelcomeSplash.module.css";

export type SplashSurface = "match" | "explore" | "play" | "connect" | "profile";

type Scene = {
  sprite?: string;
  wide?: boolean;
  tint: [string, string];
  eyebrow: string;
  title: string;
  line?: string;
  rows?: { icon: LucideIcon; text: ReactNode }[];
  cta: string;
};

// One introduction and one action. Keep the cinematic family resemblance,
// but concentrate decoration above the instructions and give each gesture its own moment.
const SCENES: Record<SplashSurface, Scene> = {
  match: {
    sprite: "/images/dreamy/v2/dreamy-heart.png",
    tint: ["100, 70, 255", "180, 40, 240"],
    eyebrow: "You’re in", title: "MATCH",
    line: "Careers picked for you. Save the 3 you like most. That’s your Top 3.",
    cta: "Start matching",
  },
  explore: {
    sprite: "/images/dreamy/v2/dreamy-curious.png",
    tint: ["40, 140, 255", "30, 185, 170"],
    eyebrow: "You’re in", title: "EXPLORE",
    line: "Find a career that catches your eye. Watch a day in the life and see real pay.",
    cta: "Start exploring",
  },
  play: {
    sprite: "/images/dreamy/v2/dreamy-controller.png", wide: true,
    tint: ["255, 160, 30", "180, 40, 240"],
    eyebrow: "You’re in", title: "PLAY",
    line: "Choose a career. Step into the job and see where your decisions take you.",
    cta: "Start playing",
  },
  connect: {
    sprite: "/images/dreamy/v2/dreamy-puzzle-wide.png", wide: true,
    tint: ["40, 140, 255", "100, 70, 255"],
    eyebrow: "Welcome to", title: "CONNECT",
    // Retain all partner-reviewed permissions and moderation wording.
    rows: [
      { icon: UserPlus, text: <>Students can <strong>follow</strong> Dream Volunteers.</> },
      { icon: MessageCircleQuestion, text: <>Students can <strong>ask questions publicly</strong>.</> },
      { icon: EyeOff, text: <>Volunteers <strong>can’t follow or privately message</strong> students.</> },
      { icon: ShieldCheck, text: "All interactions are moderated by Dreamari staff and school faculty." },
    ],
    cta: "Start connecting",
  },
  profile: {
    sprite: "/images/dreamy/v2/dreamy-party.png",
    tint: ["255, 160, 30", "255, 50, 100"],
    eyebrow: "Welcome to your", title: "PROFILE",
    line: "Your home base for your Top 3, next steps, and a career report to share with your counselor.",
    cta: "Explore my profile",
  },
};

// All three gestures, one caption at a time; the CTA never waits for the demo.
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

function SplashDialog({ surface, onDone }: { surface: SplashSurface; onDone: () => void }) {
  const scene = SCENES[surface];
  const [departing, setDeparting] = useState(false);
  const leaving = useRef(false);
  const cta = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const style = { "--t1": scene.tint[0], "--t2": scene.tint[1] } as CSSProperties;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus({ preventScroll: true });
    // The only interactive control is the CTA. Keep keyboard focus inside
    // the modal rather than tabbing into the underlying page.
    function containFocus(event: KeyboardEvent) {
      if (event.key === "Tab") {
        event.preventDefault();
        cta.current?.focus({ preventScroll: true });
      }
    }
    document.addEventListener("keydown", containFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", containFocus);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function advance() {
    if (leaving.current) return;
    leaving.current = true;
    dispatchAuroraPulse("cta", undefined, { soft: true });
    setDeparting(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    exitTimer.current = setTimeout(onDone, reduce ? 0 : 180);
  }

  return (
    <div className={`${styles.scrim} ${departing ? styles.departing : ""}`} style={style}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`splash-${surface}-title`} aria-describedby={scene.line ? `splash-${surface}-description` : undefined} className={styles.dialog}>
        <div className={styles.hero} aria-hidden="true">
          <div className={styles.glow} />
          <div className={styles.orbit} />
          <div className={styles.particles}>
            <i className={styles.orbOne} /><i className={styles.orbTwo} /><i className={styles.orbThree} />
            <Sparkles className={styles.flare} size={19} strokeWidth={1.2} />
          </div>
          {scene.sprite && <div className={`${styles.dreamy} ${scene.wide ? styles.dreamyWide : ""}`}>
            <Image src={scene.sprite} alt="" fill sizes={scene.wide ? "170px" : "120px"} className={styles.sprite} />
          </div>}
        </div>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{scene.eyebrow}</p>
          <h2 id={`splash-${surface}-title`} className={styles.title}>{scene.title}</h2>
        </div>
        {scene.line && <p id={`splash-${surface}-description`} className={styles.line}>{scene.line}</p>}
        {surface === "match" && <MatchGestureDemo />}
        {scene.rows && <ul className={styles.rows}>{scene.rows.map((row, i) => (
          <li key={i} className={styles.row}><row.icon size={18} aria-hidden="true" /><span>{row.text}</span></li>
        ))}</ul>}
        <div className={styles.ctaWrap}>
        <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4.8} strength={1} active>
        <button ref={cta} type="button" className={styles.cta} onClick={advance} aria-disabled={departing}>
          {scene.cta}<ChevronRight size={18} strokeWidth={2.75} aria-hidden="true" />
        </button>
        </BorderBeam>
        </div>
      </div>
    </div>
  );
}

/** Mount a fresh introduction on every open, including controlled revisits. */
export function WelcomeSplash({ surface, open, onDone }: { surface: SplashSurface; open: boolean; onDone: () => void }) {
  return open ? <SplashDialog key={surface} surface={surface} onDone={onDone} /> : null;
}

// Demo switch: show the splash on EVERY visit, ignoring the stored "seen"
// flag (direct request, 10 Sept 2026: "make it appear every time for now,
// for demo"). Same pattern as MatchLab's DEMO_ALWAYS_SHOW_GUIDE. Flip back
// to false before this ships to students.
export const DEMO_ALWAYS_SHOW_SPLASH = true;

/** First-visit-only, per surface (localStorage, same pattern as Match's
 *  gesture hint). Renders nothing once seen; marks seen when finished, not
 *  on mount, so it can't hide itself before it paints. */
export function FirstVisitSplash({ surface, onOpenChange }: { surface: Exclude<SplashSurface, "connect" | "profile">; onOpenChange?: (open: boolean) => void }) {
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
