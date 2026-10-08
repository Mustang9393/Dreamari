"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, CircleDashed } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { Working } from "@/components/app/Working";
import type { ATSCheckResult } from "@/lib/resume";
import styles from "@/components/app/WelcomeSplash.module.css";

// Resume v2, 28 Sept 2026: the animated ATS-check stage this session
// removed for literal reference parity (294b33b6, 20 Sept 2026 --
// "confirmed live against the reference... the score is already computed
// and shown instantly, no paced/animated 'checking' sequence first"). That
// removal was a real, deliberate improvement flagged as a known loss at
// the time, not an oversight -- v2 restores it so Joshua can compare both:
// v1 keeps the instant reveal exactly as it is today; v2 shows this stage
// once per resume, on its first real check only (see DocumentScreen's
// atsStageOpen/hasSeenOnce, ResumeBuilderExperience.tsx).
//
// Unlike the original version, the readability list here never falls back
// to a placeholder/guessed checklist while the request is still in flight
// -- "only showing checks that really run" (28 Sept 2026): the stage waits
// for the real result before revealing anything, then paces through
// exactly the items `runAtsCheck` actually returned. A Skip control (new
// here too) lets a student who doesn't want to watch it move on early.
const STEP_MS = 330;

export function AtsCheckStage({ result, onDone }: { result: ATSCheckResult | null; onDone: () => void }) {
  const labels = result?.readability.length ? result.readability.map((r) => r.label) : [];
  const [revealed, setRevealed] = useState(0);
  const [departing, setDeparting] = useState(false);

  useEffect(() => {
    // one more row per beat; the last beat waits for the real result
    if (revealed >= labels.length) return;
    const t = window.setTimeout(() => setRevealed((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [revealed, labels.length]);

  const complete = revealed >= labels.length && !!result;
  useEffect(() => {
    if (!complete) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = window.setTimeout(() => setDeparting(true), 650);
    const leave = window.setTimeout(onDone, reduce ? 700 : 850);
    return () => { window.clearTimeout(hold); window.clearTimeout(leave); };
  }, [complete, onDone]);

  const style = { "--t1": "40, 140, 255", "--t2": "100, 70, 255" } as React.CSSProperties;
  return (
    <Portal>
      <div className={`${styles.scrim} ${departing ? styles.departing : ""}`} style={style}>
        {/* data-own-history (8 Oct 2026): a short progress stage that
           closes itself, not a step of its own, so HistoryHost leaves it
           out and the browser's Back is never spent on it. */}
        <div role="dialog" aria-modal="true" aria-labelledby="ats-stage-title" aria-live="polite" data-own-history className={styles.dialog}>
          <div className={styles.hero} aria-hidden="true">
            <div className={styles.glow} />
            <div className={styles.dreamy}>
              <Image src="/images/dreamy/v2/splash/dreamy-glasses.webp" alt="" fill sizes="120px" unoptimized className={styles.sprite} />
            </div>
          </div>
          <div className={styles.header}>
            <h2 id="ats-stage-title" className={styles.title}>ATS CHECK</h2>
          </div>
          <div className="mt-[14px] flex justify-center">
            <Working label={complete ? "Done" : "Scanning your resume"} />
          </div>
          {labels.length > 0 && (
            <ul className="mt-[18px] flex flex-col gap-[8px]">
              {labels.map((label, i) => {
                const on = i < revealed;
                const status = result?.readability[i]?.status;
                const warn = on && status === "warn";
                return (
                  <li key={label} className="flex items-center gap-[10px] text-[14px] leading-[20px] transition-[opacity,transform] duration-300" style={{ opacity: on ? 1 : 0.28, transform: on ? "translateX(0)" : "translateX(-6px)", color: "var(--foreground)" }}>
                    <span className="flex size-[20px] flex-none items-center justify-center rounded-full" style={{ background: on ? (warn ? "color-mix(in srgb, var(--world-business-money-office) 22%, transparent)" : "color-mix(in srgb, var(--world-food-farming-nature) 22%, transparent)") : "var(--glass-surface-1)", color: warn ? "var(--world-business-money-office)" : "var(--world-food-farming-nature)" }}>
                      {on ? <Check className="h-3 w-3" aria-hidden strokeWidth={3} /> : <CircleDashed className="h-3 w-3 motion-safe:animate-spin" aria-hidden style={{ color: "var(--muted-foreground)", animationDuration: "3s" }} />}
                    </span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            onClick={onDone}
            className="dm-link mt-[18px] cursor-pointer self-center text-[12.5px] font-bold"
            style={{ color: "var(--muted-foreground)" }}
          >
            Skip
          </button>
        </div>
      </div>
    </Portal>
  );
}
