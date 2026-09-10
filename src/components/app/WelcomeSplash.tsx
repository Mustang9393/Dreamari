"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { BorderBeam } from "border-beam";
import { preload } from "react-dom";
import styles from "./WelcomeSplash.module.css";

export type SplashSurface = "match" | "explore" | "schools" | "play" | "connect" | "profile";

type Scene = {
  sprite?: string;
  wide?: boolean;
  tint: [string, string];
  title: string;
  line?: string;
  /** plain lines, no icons (direct feedback, 11 Sept 2026: splashes were
   *  inconsistent, some with icons, some without) */
  rows?: { text: ReactNode; /** footnote styling: divider above, muted */ note?: boolean }[];
  cta: string;
};

// One introduction and one action. Keep the cinematic family resemblance,
// but concentrate decoration above the instructions and give each gesture its own moment.
const SCENES: Record<SplashSurface, Scene> = {
  match: {
    sprite: "/images/dreamy/v2/splash/dreamy-heart.webp",
    tint: ["100, 70, 255", "180, 40, 240"],
    title: "MATCH",
    line: "Careers matched to you. Explore your options and save the 3 you like most.",
    // Option 2 (11 Sept 2026): two plain lines instead of the animated demo.
    rows: [
      { text: <><strong>Swipe right</strong> to save.</> },
      { text: <><strong>Swipe left</strong> to pass.</> },
    ],
    cta: "Start Matching",
  },
  explore: {
    sprite: "/images/dreamy/v2/splash/dreamy-curious.webp",
    tint: ["40, 140, 255", "30, 185, 170"],
    title: "EXPLORE",
    // One sentence that names both halves (direct feedback, 11 Sept 2026);
    // the Schools tab has its own welcome with the detail.
    line: "Careers and schools: salary, education, daily life, and pathways.",
    cta: "Start exploring",
  },
  // Schools has its own welcome (direct feedback, 10 Sept 2026): the page
  // itself stays almost wordless, so the "what do I do here" lives here.
  schools: {
    sprite: "/images/dreamy/v2/splash/dreamy-glasses.webp",
    tint: ["30, 185, 170", "40, 140, 255"],
    title: "SCHOOLS",
    line: "Schools that fit the career you want.",
    cta: "See my schools",
  },
  play: {
    sprite: "/images/dreamy/v2/splash/dreamy-controller.webp", wide: true,
    tint: ["255, 160, 30", "180, 40, 240"],
    title: "PLAY",
    line: "Choose a career. Step into the job and see where your decisions take you.",
    cta: "Start playing",
  },
  connect: {
    sprite: "/images/dreamy/v2/splash/dreamy-puzzle-wide.webp", wide: true,
    tint: ["40, 140, 255", "100, 70, 255"],
    title: "CONNECT",
    // Retain all partner-reviewed permissions and moderation wording.
    rows: [
      { text: <>Students can <strong>follow</strong> Dream Volunteers.</> },
      { text: <>Students can <strong>ask questions publicly</strong>.</> },
      { text: <>Volunteers <strong>can’t follow or privately message</strong> students.</> },
      { text: "All interactions are moderated by Dreamari staff and school faculty.", note: true },
    ],
    cta: "Start connecting",
  },
  profile: {
    sprite: "/images/dreamy/v2/splash/dreamy-party.webp",
    tint: ["255, 160, 30", "255, 50, 100"],
    title: "PROFILE",
    line: "Your Top 3, your plan, your report.",
    cta: "Explore my profile",
  },
};


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
    exitTimer.current = setTimeout(() => {
      onDone();
      // Nudges that should wait for the welcome to clear listen for this
      // (Explore's Schools tab pulse, 11 Sept 2026). Fired here so every
      // splash, however it is mounted, announces itself.
      window.dispatchEvent(new CustomEvent("dreamari:welcome-done", { detail: surface }));
    }, reduce ? 0 : 180);
  }

  return (
    <div className={`${styles.scrim} ${departing ? styles.departing : ""}`} style={style}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`splash-${surface}-title`} aria-describedby={scene.line ? `splash-${surface}-description` : undefined} className={styles.dialog}>
        <div className={styles.hero} aria-hidden="true">
          {/* Glow and Dreamy only: the orbit ring, particles and flare made
             the dialog busy (direct feedback, 11 Sept 2026). */}
          <div className={styles.glow} />
          {scene.sprite && <div className={`${styles.dreamy} ${scene.wide ? styles.dreamyWide : ""}`}>
            {/* Tiny pre-rendered WebP served as-is: the 270KB PNGs went through the
              on-demand image optimizer at first open and the sprite arrived
              late (direct feedback, 10 Sept 2026). Preloaded on host mount. */}
          <Image src={scene.sprite} alt="" fill sizes={scene.wide ? "170px" : "120px"} unoptimized preload className={styles.sprite} />
          </div>}
        </div>
        <div className={styles.header}>
          <h2 id={`splash-${surface}-title`} className={styles.title}>{scene.title}</h2>
        </div>
        {scene.line && <p id={`splash-${surface}-description`} className={styles.line}>{scene.line}</p>}
        {scene.rows && <ul className={styles.rows}>{scene.rows.map((row, i) => (
          <li key={i} className={`${styles.row} ${row.note ? styles.rowNote : ""}`}>{row.text}</li>
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
  // Warm the sprite before the splash opens (the host renders this closed
  // first); a no-op on the server and when already requested.
  const spriteUrl = SCENES[surface].sprite;
  if (spriteUrl) preload(spriteUrl, { as: "image" });
  return open ? <SplashDialog key={surface} surface={surface} onDone={onDone} /> : null;
}

// Demo switch: show the splash on EVERY visit, ignoring the stored "seen"
// flag (direct request, 10 Sept 2026: "make it appear every time for now,
// for demo"). Same pattern as MatchLab's DEMO_ALWAYS_SHOW_GUIDE. Flip back
// to false before this ships to students.
export const DEMO_ALWAYS_SHOW_SPLASH = true;

/* Demo mode shows a welcome once per browser SESSION, not once per mount:
   opening a career card and coming back re-mounted the page and replayed the
   splash every time (direct feedback, 10 Sept 2026). sessionStorage clears
   on refresh / new tab, which is exactly when it should come back. */
// A plain refresh keeps sessionStorage, but for the demo a refresh should
// bring the welcomes back ("if I refresh ... they can appear"), so the first
// check after a reload-type navigation clears every demo "seen" key.
let reloadChecked = false;
function clearOnReload(): void {
  if (reloadChecked) return;
  reloadChecked = true;
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== "reload") return;
    const stale: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith("dreamari:welcome:") && k.endsWith(":session")) stale.push(k);
    }
    stale.forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    // no storage / no timing API: nothing to clear
  }
}
export function demoSeenThisSession(key: string): boolean {
  try {
    clearOnReload();
    return window.sessionStorage.getItem(`${key}:session`) === "1";
  } catch {
    return false;
  }
}
export function markDemoSeenThisSession(key: string): void {
  try {
    window.sessionStorage.setItem(`${key}:session`, "1");
  } catch {
    // no storage: it will simply show again
  }
}

/** First-visit-only, per surface (localStorage, same pattern as Match's
 *  gesture hint). Renders nothing once seen; marks seen when finished, not
 *  on mount, so it can't hide itself before it paints. */
export function FirstVisitSplash({ surface, onOpenChange }: { surface: Exclude<SplashSurface, "connect" | "profile">; onOpenChange?: (open: boolean) => void }) {
  const key = `dreamari:welcome:${surface}`;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = true;
    try {
      seen = DEMO_ALWAYS_SHOW_SPLASH ? demoSeenThisSession(key) : window.localStorage.getItem(key) === "1";
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
        markDemoSeenThisSession(key);
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
