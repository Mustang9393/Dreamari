"use client";

// DEMO-ONLY: the Flow Lab. An isolated, replayable place to play alternate
// Build -> Match -> Top 3 flows without touching the live demo (direct
// instruction, 24 Sept 2026: "NOTHING SHOULD CHANGE IN THE DEMO... a
// quicklink in the hamburger to launch the full flow, replayable, isolated
// from the actual demo app"). Reached only from the hamburger's demo links;
// /match-grid and /profile are untouched. v2 is Joshua's proposal, v3 the
// team's counter-proposal; the chip and Restart sit bottom-center like the
// Counselor Dashboard's version chip and the Glossary Game's demo dock.

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { LAB_VERSION_KEY, clearLabState, type LabVersion } from "./lab";
import { V2Flow } from "./V2Flow";
import { V3Flow } from "./V3Flow";

const DESCRIPTIONS: Record<LabVersion, string> = {
  v2: "Build → Mini Explore → Saved → Rank → My Profile",
  v3: "Build add-on → Match (six with reasons) → My Profile",
};

export function FlowLab({ initialVersion }: { initialVersion?: LabVersion }) {
  const [version, setVersionState] = useState<LabVersion>(initialVersion ?? "v2");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (initialVersion) {
      try { window.localStorage.setItem(LAB_VERSION_KEY, initialVersion); } catch { /* ignore */ }
      return;
    }
    try {
      const stored = window.localStorage.getItem(LAB_VERSION_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount
      if (stored === "v2" || stored === "v3") setVersionState(stored);
    } catch { /* ignore */ }
  }, [initialVersion]);

  const setVersion = (v: LabVersion) => {
    setVersionState(v);
    try { window.localStorage.setItem(LAB_VERSION_KEY, v); } catch { /* ignore */ }
    const url = new URL(window.location.href);
    url.searchParams.set("v", v === "v2" ? "2" : "3");
    window.history.replaceState(window.history.state, "", url.toString());
  };
  const restart = () => {
    clearLabState(version);
    setResetKey((k) => k + 1);
  };

  return (
    <ThemeProvider>
    {/* Same backdrop as the live Match (starfield + aurora) and the shared
        poster font stylesheet, so the lab's cards read as the real thing
        (direct feedback, 25 Sept 2026: "fully designed just like we have
        match right now with full colors, backgrounds"). */}
    {/* The token scope wrapper is `contents`, exactly as Match does it: the
        .themeable class paints its own background, and the aurora canvas
        sits at z-index -10, so a boxed wrapper would hide it. */}
    <div className="marketing-v2 themeable contents">
    <div className="relative flex min-h-dvh w-full flex-col" style={{ color: "var(--foreground)" }}>
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
      <BackgroundSpace />
      <AuroraBackground accent="#2f6bf2" visitedAccents={[]} finale={false} lightning={false} />
      <header className="sticky top-0 z-10 flex items-center justify-between gap-[10px] border-b px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-[10px] sm:px-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-[12px]">
          <IconTip label="Back to the app">
            <Link href="/home" aria-label="Back to the app" className="dm-quiet flex size-9 items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <ArrowLeft className="h-[16px] w-[16px]" aria-hidden />
            </Link>
          </IconTip>
          <Wordmark href="/home" />
        </div>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--primary)" }}>Flow lab · not the demo</span>
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{DESCRIPTIONS[version]}</span>
        </div>
      </header>

      <main className="relative z-[1] flex flex-1 justify-center px-[var(--space-4)] pt-[var(--space-6)] pb-[calc(var(--space-6)+72px)] sm:px-[var(--space-6)]">
        <div className="flex w-full max-w-[1100px] flex-col">
          {version === "v2" ? <V2Flow key={`v2-${resetKey}`} /> : <V3Flow key={`v3-${resetKey}`} />}
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-[6px] rounded-full border p-[3px] backdrop-blur-[8px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 72%, transparent)" }}>
          <div role="tablist" aria-label="Flow version" className="flex items-center gap-[2px]">
            {([["v2", "v2 · Mini explore"], ["v3", "v3 · Six + reasons"]] as const).map(([key, label]) => {
              const on = key === version;
              return (
                <button key={key} type="button" role="tab" aria-selected={on} onClick={() => setVersion(key)} className="dm-quiet cursor-pointer rounded-full px-[10px] py-[3px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}>
                  {label}
                </button>
              );
            })}
          </div>
          <span aria-hidden className="h-[16px] w-px" style={{ background: "var(--glass-border)" }} />
          <IconTip label="Restart this flow">
            <button type="button" aria-label="Restart this flow" onClick={restart} className="dm-quiet flex size-7 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              <RotateCcw className="h-[13px] w-[13px]" aria-hidden />
            </button>
          </IconTip>
        </div>
      </div>
    </div>
    </div>
    </ThemeProvider>
  );
}
