"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, CircleDashed } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { Working } from "@/components/app/Working";
import type { ATSCheckResult } from "@/lib/resume";
import styles from "@/components/app/WelcomeSplash.module.css";

// The check you can watch (direct feedback, 17 Sept 2026: "it has to read
// like an ATS check, not suddenly a score appearing"). Same cinematic
// dialog as the welcomes; the readability items light up one at a time,
// paced so the moment lasts even when the API answers in milliseconds, then
// the host shows the score card. Labels come from the real result once it
// exists; until then the standard checklist stands in.

const STANDARD = ["Standard section headings", "Single-column layout", "Contact information", "Education information", "Experience details", "Skills", "Date formatting", "No graphics, tables, or icons"];
const STEP_MS = 330;

export function AtsCheckStage({ result, onDone }: { result: ATSCheckResult | null; onDone: () => void }) {
  const labels = result?.readability.length ? result.readability.map((r) => r.label) : STANDARD;
  const [revealed, setRevealed] = useState(0);
  const [departing, setDeparting] = useState(false);

  useEffect(() => {
    // one more row per beat; the last beat waits for the result
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
        <div role="dialog" aria-modal="true" aria-labelledby="ats-stage-title" aria-live="polite" className={styles.dialog}>
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
        </div>
      </div>
    </Portal>
  );
}
