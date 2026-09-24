"use client";

// DEMO-ONLY: the Flow Lab. An isolated, replayable place to play alternate
// Build -> Match -> Top 3 flows without touching the live demo (direct
// instruction, 24 Sept 2026: "NOTHING SHOULD CHANGE IN THE DEMO... a
// quicklink in the hamburger to launch the full flow, replayable, isolated
// from the actual demo app"). Reached only from the hamburger's demo links;
// /match-grid and /profile are untouched. v2 is Joshua's proposal, v3 the
// team's counter-proposal. The chip and Restart sit in every screen's
// bottom bar (LabDockContext) so they never cover a card.

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { InfoButton, InfoSheet } from "./notes";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { LAB_VERSION_KEY, clearLabState, type LabVersion } from "./lab";
import { LabDockContext } from "./shared";
import { V2Flow } from "./V2Flow";
import { V3Flow } from "./V3Flow";

/** Restart clears the flow AND its coachmark "seen" flags, so a demo can
 *  replay the guided first run every time. Only the lab's own keys. */
function clearLabHints() {
  try {
    for (const k of Object.keys(window.localStorage)) if (k.startsWith("dreamari:hint-seen:flowlab-")) window.localStorage.removeItem(k);
  } catch { /* ignore */ }
}

export function FlowLab({ initialVersion }: { initialVersion?: LabVersion }) {
  const [version, setVersionState] = useState<LabVersion>(initialVersion ?? "v2");
  const [resetKey, setResetKey] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);

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
    clearLabHints();
    setResetKey((k) => k + 1);
  };

  const dock = (
    <div className="flex items-center gap-[4px] rounded-full border p-[3px] backdrop-blur-[8px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 72%, transparent)" }}>
      <div role="tablist" aria-label="Flow version" className="flex items-center gap-[2px]">
        {(["v2", "v3"] as const).map((key) => {
          const on = key === version;
          return (
            <button key={key} type="button" role="tab" aria-selected={on} onClick={() => setVersion(key)} className="dm-quiet cursor-pointer rounded-full px-[10px] py-[3px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}>
              {key}
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
  );

  return (
    <ThemeProvider>
      {/* Token scope wrapper is `contents`, exactly as Match does it: the
          .themeable class paints its own background, and the aurora canvas
          sits at z-index -10, so a boxed wrapper would hide it. */}
      <div className="marketing-v2 themeable contents">
        <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
        <BackgroundSpace />
        <AuroraBackground accent="#2f6bf2" visitedAccents={[]} finale={false} lightning={false} />
        {/* Fixed header, like FlowChrome on Match: wordmark left; right, the
            lab label, the (i) note for this flow, and the app's own
            hamburger so the quick links (the other flows, the demo) are one
            tap away (direct instruction, 25 Sept 2026). */}
        <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="pointer-events-auto flex items-center gap-3">
            <IconTip label="Back to the app">
              <Link href="/home" aria-label="Back to the app" className="dm-quiet flex size-9 items-center justify-center rounded-full border backdrop-blur-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
                <ArrowLeft className="h-[16px] w-[16px]" aria-hidden />
              </Link>
            </IconTip>
            <Wordmark href="/home" />
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="hidden text-[10.5px] font-bold tracking-[0.1em] uppercase sm:block" style={{ color: "var(--primary)" }}>Flow lab · not the demo</span>
            <InfoButton onClick={() => setInfoOpen(true)} />
            <QuickLinksMenu />
          </div>
        </header>
        <InfoSheet version={version} open={infoOpen} onClose={() => setInfoOpen(false)} />
        <LabDockContext.Provider value={dock}>
          <div style={{ color: "var(--foreground)" }}>
            {version === "v2" ? <V2Flow key={`v2-${resetKey}`} onRestart={restart} /> : <V3Flow key={`v3-${resetKey}`} onRestart={restart} />}
          </div>
        </LabDockContext.Provider>
      </div>
    </ThemeProvider>
  );
}
