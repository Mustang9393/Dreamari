"use client";

import { useState } from "react";
import { useGlobalTheme } from "@/components/app/theme";
import { SparkBar } from "@/components/flow/SparkBar";
import { barGradientColorAt } from "@/components/build/ProgressSpark";

export default function ProgressLab() {
  const { toggle } = useGlobalTheme();
  const [percent, setPercent] = useState(20);
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16" style={{ color: "var(--color-night-foreground)" }}>
      <p className="text-sm opacity-60">Dreamari · Motion study</p>
      <h1 className="mt-3 text-3xl font-semibold">A little more energy.</h1>
      <p className="mt-4 opacity-70">Advance a step to see the lightning travel and scatter. Leave the page idle for 10–18 seconds for a small spark nudge.</p>
      <div className="mt-12 space-y-12">
        {[
          { label: "Build · gradient", height: 4, fill: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-purple), var(--color-world-arts-media-sport))", glow: "var(--color-accent-purple)", gradient: true },
          { label: "Profile · compact", height: 6, fill: "var(--color-accent-purple)", glow: "var(--color-accent-purple)", gradient: false },
          { label: "Play · small card", height: 5, fill: "var(--color-brand-500)", glow: "var(--color-brand-500)", gradient: false },
        ].map((bar, i) => (
          <section key={bar.label} style={{ maxWidth: i === 2 ? 240 : undefined }}>
            <div className="mb-5 flex justify-between gap-4 text-sm"><span>{bar.label}</span><span>{percent}%</span></div>
            <SparkBar percent={percent} fill={bar.fill} glow={bar.glow} glowAt={bar.gradient ? barGradientColorAt : undefined} height={bar.height} />
          </section>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        <button className="rounded-full border px-5 py-2" onClick={() => setPercent(p => Math.min(100, p + 20))} disabled={percent === 100}>Advance +20%</button>
        <button className="rounded-full border px-5 py-2" onClick={() => setPercent(p => Math.min(100, p + 2))} disabled={percent === 100}>Small step +2%</button>
        <button className="rounded-full border px-5 py-2" onClick={() => setPercent(0)}>Reset</button>
        <button className="rounded-full border px-5 py-2" onClick={toggle}>Toggle theme</button>
      </div>
    </main>
  );
}
