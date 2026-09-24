"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronRight, EyeOff, MessageCircleQuestion, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { BorderBeam } from "border-beam";
import { preload } from "react-dom";
import styles from "./WelcomeSplash.module.css";

export type SplashSurface = "match" | "matchGrid" | "explore" | "play" | "connect" | "profile" | "resume";

export type SplashScene = Scene;
type Scene = {
  sprite?: string;
  wide?: boolean;
  tint: [string, string];
  title: string;
  /** Forces the title onto one line at a smaller, all-caps size matching
   *  the app's own compact heading style (e.g. the match grid page's own
   *  "FIND YOUR TOP 3") instead of the default multi-line hero size --
   *  for a title long enough to otherwise wrap and crowd the line(s)
   *  below it out of room. */
  compactTitle?: boolean;
  line?: ReactNode;
  /** plain lines, no icons (direct feedback, 11 Sept 2026: splashes were
   *  inconsistent, some with icons, some without) */
  /** Connect keeps icons on its rows (direct feedback, 11 Sept 2026: "the
   *  connect one worked better with icons"); no other splash has rows. */
  rows?: { icon?: LucideIcon; text: ReactNode; /** footnote styling: divider above, muted */ note?: boolean }[];
  cta: string;
  /** an optional quiet second action under the CTA (a score card's "See Final Tips") */
  secondary?: string;
};

// One introduction and one action. Keep the cinematic family resemblance,
// but concentrate decoration above the instructions and give each gesture its own moment.
const SCENES: Record<SplashSurface, Scene> = {
  // Unused in the live app (13 Sept 2026): every entry point into Match now
  // goes to /match-grid (see matchGrid below), so this only ever shows if
  // someone reaches the dormant swipe-deck route (/match-lab) directly.
  // Left as-is rather than repurposed, so that page keeps its own accurate
  // gesture-appropriate copy if it's ever reactivated.
  match: {
    sprite: "/images/dreamy/v2/splash/dreamy-heart.webp",
    tint: ["100, 70, 255", "180, 40, 240"],
    title: "MATCH",
    // Option 1 (11 Sept 2026): no gesture teaching here at all; the deck's
    // own guide walks scroll, swipe right, swipe left once each on the first
    // real card.
    line: "Careers matched to you. Explore your options and save the 3 you like most.",
    cta: "Start Matching",
  },
  // Between the Build flow's "Congratulations" screen and the live
  // /match-grid picker. Copy rewritten 22 Sept 2026 (direct instruction) to
  // read as one clear sequence -- this splash says what's about to happen,
  // the grid page's own heading ("Choose up to 3") says what to
  // do once the six cards are actually on screen, rather than this splash
  // trying to explain the whole system before the student has anything to
  // look at yet. This isn't decorative copy -- direct context, 22 Sept
  // 2026: it stands in for a disclaimer the user used to have to give
  // live in every demo ("these 6 aren't the only matches, Explore finds
  // more"), so a presenter can just let a viewer read it in under 7
  // seconds instead of a 45-second monologue. That's the reasoning behind
  // giving it more room below (see compactTitle right below).
  matchGrid: {
    sprite: "/images/dreamy/v2/splash/dreamy-heart.webp",
    tint: ["100, 70, 255", "180, 40, 240"],
    title: "YOU’VE BEEN MATCHED!",
    // One line, all-caps, matching the match grid page's own compact
    // heading style ("CHOOSE UP TO 3") instead of this splash's default
    // multi-line hero size -- direct feedback, 22 Sept 2026: the title
    // wrapping to two huge lines crowded the explanatory copy below it
    // (the actual disclaimer, see above) out of room to breathe.
    compactTitle: true,
    // Two sentences, forced onto their own lines (direct feedback, 22 Sept
    // 2026: as one wrapped paragraph the second sentence broke badly,
    // stranding "like the ones you save" as its own orphaned line) --
    // `line` widened from `string` to `ReactNode` so a real `<br />` can
    // sit between them instead of leaving the wrap to chance at every width.
    line: (
      <>
        Next, you’ll see 6 careers matched to you.
        <br />
        Save up to 3. You can continue with 1, and EXPLORE will recommend more like the ones you save.
      </>
    ),
    cta: "See My Matches",
  },
  explore: {
    sprite: "/images/dreamy/v2/splash/dreamy-explore.webp",
    tint: ["40, 140, 255", "30, 185, 170"],
    title: "EXPLORE",
    // Two labelled rows, one per half of Explore (direct feedback, 13 Sept
    // 2026): the Schools tab's own separate welcome is redundant now that
    // this one names Schools' detail directly, so that splash is removed.
    rows: [
      { text: <><strong>Careers:</strong> Salary, education, daily life, and pathways.</> },
      { text: <><strong>Schools:</strong> Colleges, trade schools, programs, cost, and admissions.</> },
    ],
    cta: "Start exploring",
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
      { icon: UserPlus, text: <>Students can <strong>follow</strong> Dream Volunteers.</> },
      { icon: MessageCircleQuestion, text: <>Students can <strong>ask questions publicly</strong>.</> },
      { icon: EyeOff, text: <>Volunteers <strong>can’t follow or privately message</strong> students.</> },
      { icon: ShieldCheck, text: "All interactions are moderated by Dreamari staff and school faculty.", note: true },
    ],
    cta: "Start connecting",
  },
  // The Resume Builder's first-run welcome (the reference's own "Hi! I'm
  // Dreamy" moment, in the same dialog every other surface opens with).
  resume: {
    sprite: "/images/dreamy/v2/splash/dreamy-glasses.webp",
    tint: ["40, 140, 255", "100, 70, 255"],
    title: "RESUME",
    line: "Hi! 👋 I'm Dreamy. I'll help you build your resume, one step at a time.",
    cta: "Let's build it",
  },
  profile: {
    sprite: "/images/dreamy/v2/splash/dreamy-party.webp",
    tint: ["255, 160, 30", "255, 50, 100"],
    title: "PROFILE",
    // Copy update, 14 Sept 2026 (Slack, Chandu M P).
    line: "Compare careers. Follow your plan. Track your progress.",
    cta: "View My Profile",
  },
};


function SplashDialog({ surface, onDone, onSecondary, override }: { surface: SplashSurface; onDone: () => void; onSecondary?: () => void; override?: Partial<Scene> }) {
  const scene: Scene = { ...SCENES[surface], ...override };
  const secondaryChosen = useRef(false);
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
      if (secondaryChosen.current) onSecondary?.(); else onDone();
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
          <h2 id={`splash-${surface}-title`} className={`${styles.title} ${scene.compactTitle ? styles.titleCompact : ""}`}>{scene.title}</h2>
        </div>
        {scene.line && <p id={`splash-${surface}-description`} className={styles.line}>{scene.line}</p>}
        {scene.rows && <ul className={styles.rows}>{scene.rows.map((row, i) => (
          <li key={i} className={`${styles.row} ${row.icon ? styles.rowIcon : ""} ${row.note ? styles.rowNote : ""}`}>{row.icon && <row.icon size={18} aria-hidden="true" />}<span>{row.text}</span></li>
        ))}</ul>}
        <div className={styles.ctaWrap}>
        <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={4.8} strength={1} active>
        <button ref={cta} type="button" className={styles.cta} onClick={advance} aria-disabled={departing}>
          {scene.cta}<ChevronRight size={18} strokeWidth={2.75} aria-hidden="true" />
        </button>
        </BorderBeam>
        </div>
        {scene.secondary && onSecondary && (
          <button type="button" className={styles.secondary} onClick={() => { secondaryChosen.current = true; advance(); }} aria-disabled={departing}>
            {scene.secondary}
          </button>
        )}
      </div>
    </div>
  );
}

/** Mount a fresh introduction on every open, including controlled revisits. */
export function WelcomeSplash({ surface, open, onDone, onSecondary, scene }: { surface: SplashSurface; open: boolean; onDone: () => void; /** runs instead of onDone when the scene's secondary action is chosen */ onSecondary?: () => void; /** per-instance copy over the surface's scene (a score card's live numbers) */ scene?: Partial<SplashScene> }) {
  // Warm the sprite before the splash opens (the host renders this closed
  // first); a no-op on the server and when already requested.
  const spriteUrl = scene?.sprite ?? SCENES[surface].sprite;
  if (spriteUrl) preload(spriteUrl, { as: "image" });
  return open ? <SplashDialog key={surface} surface={surface} onDone={onDone} onSecondary={onSecondary} override={scene} /> : null;
}

// DEMO-ONLY: show the splash on EVERY visit, ignoring the stored "seen" flag
// (direct request, 10 Sept 2026: "make it appear every time for now, for
// demo"). Same pattern as MatchLab's DEMO_ALWAYS_SHOW_GUIDE. Flip back to
// false before this ships to students. See docs/HANDOFF_INDEX.md's Demo vs
// Production section.
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
