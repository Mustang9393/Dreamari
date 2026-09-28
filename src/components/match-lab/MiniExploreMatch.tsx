"use client";

import { useRouter } from "next/navigation";
import { FlowChrome } from "@/components/app/FlowChrome";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { demoPicks } from "@/components/flow-lab/lab";
import { V2Flow } from "@/components/flow-lab/V2Flow";
import { picksParam, writePicks } from "@/lib/picks";

// ---------------------------------------------------------------------------
// THE Match experience since 27 Sept 2026: Joshua's Mini Explore, simplified
// (Slack, 27 Sept 2026: "This can replace the current 'MATCH' and be in the
// actual demo"). Build hands off to world tabs of careers; the student saves
// up to three, continues after one, and lands on Profile's Top Three
// (ranked in save order; the ranking screen went 28 Sept 2026) as the old grid did: same picks store, same
// URL, same welcome. Only Match changed (direct instruction: "just change
// the match flow dont change what happens after"). The six-card grid it
// replaced (MatchGrid.tsx) is dormant, like the swipe deck before it.
//
// No intro splash: this flow's screens teach themselves (Joshua, 25 Sept
// 2026: "NO POP-UPS... the interface itself should make the next action
// obvious").
// ---------------------------------------------------------------------------

export function MiniExploreMatch() {
  const router = useRouter();
  const finish = (ids: string[]) => {
    // DEMO-ONLY: demoPicks maps each pick to a career Profile can show
    // (lab.ts explains why); production hands the ids over as they are.
    const picks = demoPicks(ids);
    if (picks.length === 0) return;
    dispatchAuroraPulse("cta");
    // The save order is the rank now that Match has no ranking screen, so
    // the first save arrives as #1 (focus) instead of being re-sorted by
    // match strength: Profile shows exactly the sequence the student made.
    writePicks({ ids: picks, focus: picks[0] });
    setTimeout(() => router.push(`/profile?picks=${picksParam(picks)}&focus=${encodeURIComponent(picks[0])}&tab=top3&welcome=1`), 260);
  };
  return (
    <ThemeProvider>
      <div className="marketing-v2 themeable contents">
        <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
        <BackgroundSpace />
        <AuroraBackground accent="#2f6bf2" visitedAccents={[]} finale={false} lightning={false} />
        {/* The same soft fade the Flow Lab draws behind its floating header
            buttons, so the wordmark and menu stay readable over photos
            without a bar. */}
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[15] h-[92px]" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--background) 78%, transparent) 0%, color-mix(in srgb, var(--background) 40%, transparent) 55%, transparent 100%)" }} />
        <FlowChrome />
        <div style={{ color: "var(--foreground)" }}>
          <V2Flow onFinish={finish} />
        </div>
      </div>
    </ThemeProvider>
  );
}
