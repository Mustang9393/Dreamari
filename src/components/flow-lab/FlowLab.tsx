"use client";

// DEMO-ONLY: the Flow Lab. An isolated, replayable place to play Joshua's
// Build -> Mini Explore -> Saved -> Rank -> My Profile proposal without
// touching the live demo (direct instruction, 24 Sept 2026: "NOTHING
// SHOULD CHANGE IN THE DEMO... a quicklink in the hamburger to launch the
// full flow, replayable, isolated from the actual demo app"). Reached only
// from the hamburger's demo links; /match-grid and /profile are untouched.
//
// A second flow (v3, the team's counter-proposal) played alongside this
// one until 25 Sept 2026, when Joshua reviewed v2 and asked to drop v3 and
// iterate on v2 alone ("remove v3. stick to v2."). The version chip is
// gone with it; Restart is the only control left in the dock.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { QuickLinksMenu, Wordmark, useScrolled } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { InfoButton, InfoSheet } from "./notes";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { clearLabState } from "./lab";
import { LabInfoContext, type ScreenNote } from "./shared";
import { V2Flow } from "./V2Flow";

export function FlowLab() {
  const [resetKey, setResetKey] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [screenNote, setScreenNoteState] = useState<ScreenNote | null>(null);
  // Screens re-register on every render; only a real change re-renders us.
  const setScreenNote = useCallback((n: ScreenNote | null) => setScreenNoteState((prev) => (JSON.stringify(prev) === JSON.stringify(n) ? prev : n)), []);
  // Hydration-safe mount flag: the dock renders identically on the server
  // and the client's first paint either way, so nothing here needs one,
  // but resetKey's remount below is still client-only by nature.
  useEffect(() => {}, []);

  const restart = () => {
    clearLabState();
    setResetKey((k) => k + 1);
  };
  // The site's own top-nav frost (chrome.tsx DesktopNavigation): transparent
  // at rest, a soft blurred surface once the page has scrolled -- never a
  // flat opaque bar (direct feedback, 25 Sept 2026: "lose the black bars
  // everywhere... when I scroll down I can see the scrolling away things
  // through the header"). No border or shadow of its own so it reads as one
  // continuous frosted band with the screen's own sticky sub-header right
  // beneath it, not two stacked bars with a seam between them.
  const scrolled = useScrolled(4);

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
            lab label, the (i) note, and the app's own hamburger so the
            quick links (the demo, other labs) are one tap away. */}
        <header
          className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 transition-[background-color,backdrop-filter] duration-300 sm:px-6"
          style={{
            background: scrolled ? "color-mix(in srgb, var(--background) 70%, transparent)" : "transparent",
            backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
          }}
        >
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
            <IconTip label="Restart this flow">
              <button type="button" aria-label="Restart this flow" onClick={restart} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
                <RotateCcw className="h-[16px] w-[16px]" aria-hidden />
              </button>
            </IconTip>
            <QuickLinksMenu />
          </div>
        </header>
        <InfoSheet screen={screenNote} open={infoOpen} onClose={() => setInfoOpen(false)} />
        <LabInfoContext.Provider value={setScreenNote}>
          <div style={{ color: "var(--foreground)" }}>
            <V2Flow key={resetKey} onRestart={restart} />
          </div>
        </LabInfoContext.Provider>
      </div>
    </ThemeProvider>
  );
}
