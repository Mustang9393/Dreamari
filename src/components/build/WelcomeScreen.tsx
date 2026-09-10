"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { bricolage } from "./fonts";
import { InkText } from "./ui";
import styles from "./WelcomeScreen.module.css";

// Every position below is static so server and client render the same
// markup (no Math.random in render).

// Faint field behind everything.
const STARS = [
  { x: 6, y: 12, s: 2, d: 0 }, { x: 14, y: 68, s: 1.5, d: 1.1 }, { x: 22, y: 30, s: 1.5, d: 2.3 }, { x: 31, y: 84, s: 2, d: 0.6 },
  { x: 40, y: 8, s: 1.5, d: 1.7 }, { x: 52, y: 90, s: 1.5, d: 2.9 }, { x: 61, y: 18, s: 2, d: 0.3 }, { x: 70, y: 76, s: 1.5, d: 1.9 },
  { x: 78, y: 40, s: 1.5, d: 0.9 }, { x: 86, y: 10, s: 2, d: 2.5 }, { x: 92, y: 62, s: 1.5, d: 1.4 }, { x: 47, y: 52, s: 1, d: 3.3 },
  { x: 9, y: 46, s: 1, d: 2.0 }, { x: 96, y: 28, s: 1, d: 0.4 },
];
// Lit particles around Dreamy: size and blur give depth (big + sharp is
// near, small + soft is far), each drifts on its own period.
const ORBS = [
  { x: 12, y: 22, s: 12, b: 0, d: 0, p: 7.5 }, { x: 84, y: 30, s: 9, b: 0.4, d: 1.6, p: 8.5 }, { x: 22, y: 78, s: 7, b: 0.8, d: 0.7, p: 9 },
  { x: 76, y: 80, s: 14, b: 0, d: 2.4, p: 8 }, { x: 4, y: 56, s: 5, b: 1.4, d: 3.1, p: 10 }, { x: 94, y: 58, s: 6, b: 1.2, d: 1.1, p: 9.5 },
  { x: 48, y: 4, s: 5, b: 1.6, d: 2.0, p: 11 }, { x: 34, y: 92, s: 4, b: 1.8, d: 0.4, p: 10.5 }, { x: 64, y: 8, s: 7, b: 0.6, d: 2.8, p: 8.8 },
];
// Four-point flares: where the two icons used to sit, plus one far and small.
const FLARES = [
  { x: 10, y: 34, s: 34, d: 0.2, p: 4.2 }, { x: 88, y: 66, s: 26, d: 1.3, p: 5 }, { x: 70, y: 14, s: 16, d: 2.1, p: 6 },
];
// Dust that scatters off the title as it lands.
const DUST = [
  { x: 12, y: 30, sx: -52, sy: -26, d: 0.52 }, { x: 24, y: 78, sx: -36, sy: 30, d: 0.6 }, { x: 40, y: 18, sx: -12, sy: -48, d: 0.56 },
  { x: 55, y: 84, sx: 10, sy: 40, d: 0.66 }, { x: 68, y: 22, sx: 30, sy: -42, d: 0.58 }, { x: 82, y: 70, sx: 48, sy: 22, d: 0.62 },
  { x: 90, y: 34, sx: 58, sy: -18, d: 0.7 }, { x: 4, y: 60, sx: -60, sy: 8, d: 0.64 },
];
const CHAPTERS = ["Build", "Match", "Explore", "Play", "Connect"];

/** A dedicated opening scene; the question HUD starts with Interests. */
export function WelcomeScreen({ onNext, onSkip }: { onNext: () => void; onSkip?: () => void }) {
  const [departing, setDeparting] = useState(false);
  const [wave, setWave] = useState(false);
  const [ready, setReady] = useState(false);
  const leaving = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const departureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One hello right after landing, tap for another. A motion-only greeting:
  // the one normal Dreamy, no sprite swapping (direct feedback, 10 Sept 2026).
  function hello() {
    if (waveTimer.current) return;
    setWave(true);
    waveTimer.current = setTimeout(() => {
      setWave(false);
      waveTimer.current = null;
    }, 720);
  }

  // The arrival choreography. Everything here is decoration layered on a
  // screen that is fully usable from first paint; with reduced motion the
  // CTA is simply "ready" at once.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = reduce
      ? [setTimeout(() => setReady(true), 0)]
      : [
          setTimeout(hello, 1050),
          setTimeout(() => setReady(true), 1200),
        ];
    return () => {
      timers.forEach(clearTimeout);
      if (waveTimer.current) clearTimeout(waveTimer.current);
      if (departureTimer.current) clearTimeout(departureTimer.current);
    };
  }, []);

  function begin() {
    if (leaving.current) return;
    leaving.current = true;
    setDeparting(true);
    // dispatchAuroraPulse plays the CTA chime itself (it only skips it for `silent`).
    dispatchAuroraPulse("cta", undefined, { forceDreamyOrigin: true, soft: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    departureTimer.current = setTimeout(onNext, reduceMotion ? 0 : 420);
  }

  // A few pixels of parallax on the stage, desktop pointers only. Written
  // straight to CSS variables so it never re-renders React.
  function track(e: React.PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  }
  function untrack() {
    stage.current?.style.setProperty("--px", "0");
    stage.current?.style.setProperty("--py", "0");
  }

  return (
    <div className={`${styles.welcome} ${departing ? styles.departing : ""} ${ready ? styles.ready : ""}`} onPointerMove={track} onPointerLeave={untrack}>
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.stars} aria-hidden="true">
        {STARS.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s * 3, height: s.s * 3, animationDelay: `${s.d}s` }} />)}
      </div>
      <div className={styles.scene}>
        <div ref={stage} className={styles.dreamyStage}>
          {/* The light: BorderBeam's tinted-ellipse cluster (bloom over core,
              brightness/saturation lifted, slow hue drift), set free behind
              Dreamy instead of running along a border. */}
          <div className={styles.beam} aria-hidden="true">
            <div className={styles.beamBloom} />
            <div className={styles.beamCore} />
          </div>
          <div className={styles.orbit} aria-hidden="true" />
          <div className={styles.ground} aria-hidden="true" />
          <div className={styles.particles} aria-hidden="true">
            {ORBS.map((o, i) => (
              <i key={`o${i}`} className={styles.orb} style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s, filter: o.b ? `blur(${o.b}px)` : undefined, animationDelay: `${o.d}s`, animationDuration: `${o.p}s, ${o.p * 0.6}s` }} />
            ))}
            {FLARES.map((f, i) => (
              <i key={`f${i}`} className={styles.flare} style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.s, height: f.s, animationDelay: `${f.d}s`, animationDuration: `${f.p}s` }} />
            ))}
          </div>
          <button
            type="button"
            className={`${styles.dreamy} ${wave ? styles.wave : ""}`}
            onClick={hello}
            aria-label="Say hello to Dreamy"
            data-dreamy-anchor
          >
            <Image src="/images/dreamy/v2/dreamy-happy.png" alt="Dreamy welcomes you" fill sizes="(max-width: 639px) 200px, 260px" preload className={styles.sprite} />
          </button>
        </div>

        <div className={styles.message}>
          <h1 className={`${bricolage.className} ${styles.heading}`}>
            <InkText text="Welcome to" className={styles.welcomeTo} delay={0.18} />
            <span className={styles.buildWrap}>
              <span className={styles.build}>BUILD</span>
              <span className={styles.dust} aria-hidden="true">
                {DUST.map((p, i) => (
                  <i key={i} style={{ left: `${p.x}%`, top: `${p.y}%`, "--sx": `${p.sx}px`, "--sy": `${p.sy}px`, animationDelay: `${p.d}s` } as CSSProperties} />
                ))}
              </span>
            </span>
          </h1>
          <p className={styles.description}>Tell us about you, so we can personalize your experience and help you find your dream career.</p>
          <div className={styles.actions}>
            <Button size="large" onClick={begin} aria-disabled={departing} className={styles.cta}>
              Let’s Go <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <ol className={styles.chapters} aria-label="Your Dreamari journey">
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter} aria-current={index === 0 ? "step" : undefined} style={{ "--i": index } as CSSProperties}>
              <span className={styles.chapterDot} aria-hidden="true" />{chapter}
            </li>
          ))}
        </ol>
        {onSkip && <button type="button" className={styles.skip} onClick={() => { if (!leaving.current) onSkip(); }}>Skip</button>}
      </div>
    </div>
  );
}
