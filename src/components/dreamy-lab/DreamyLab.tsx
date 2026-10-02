"use client";

// DEMO-ONLY: the Dreamy Lab. An isolated page to play the 3D Dreamy's
// emotions and see him at the sizes the app would use, so the team can
// decide where he lives (direct instruction, 1 Oct 2026: "a dreamy lab we
// can render on the app where i can play with its different
// animations/emotions... so we can figure out how we can incorporate it
// into our app"). Reached from the hamburger's lab links only; nothing in
// the demo imports from here.

import Link from "next/link";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { DreamyFrame, useDreamyPlayer } from "./DreamyPlayer";
import { EMOTIONS, FRAME_COUNT } from "./sequence";

const glass = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

export function DreamyLab() {
  const p = useDreamyPlayer();
  const loading = p.ready < 1;

  return (
    <ThemeProvider>
      <div className="marketing-v2 themeable contents">
        <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />
        <BackgroundSpace />
        <AuroraBackground accent="#2f6bf2" visitedAccents={[]} finale={false} lightning={false} />

        <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-4 sm:h-[72px] sm:px-6">
          <div className="pointer-events-auto flex items-center gap-3">
            <IconTip label="Back to the app">
              <Link href="/home" aria-label="Back to the app" className="dm-quiet flex size-9 items-center justify-center rounded-full border backdrop-blur-[10px]" style={glass}>
                <ArrowLeft className="h-[16px] w-[16px]" aria-hidden />
              </Link>
            </IconTip>
            <Wordmark href="/home" />
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="hidden text-[10.5px] font-bold tracking-[0.1em] uppercase sm:block" style={{ color: "var(--primary)" }}>
              Dreamy lab · not the demo
            </span>
            <QuickLinksMenu />
          </div>
        </header>

        <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 pt-24 pb-10 sm:px-6" style={{ color: "var(--foreground)" }}>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
            {/* Stage */}
            <section className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border backdrop-blur-[10px]" style={glass}>
              <div className="h-[82%] w-[82%]">
                <DreamyFrame frame={p.frame} />
              </div>
              {loading && (
                <div className="absolute inset-x-6 bottom-5">
                  <div className="h-1 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }}>
                    <div className="h-full rounded-full transition-[width]" style={{ width: `${Math.round(p.ready * 100)}%`, background: "var(--primary)" }} />
                  </div>
                  <p className="mt-2 text-center text-[11px] opacity-70">Loading frames</p>
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <IconTip label={p.paused ? "Play" : "Pause"}>
                  <button type="button" aria-label={p.paused ? "Play" : "Pause"} onClick={() => p.setPaused(!p.paused)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={glass}>
                    {p.paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                  </button>
                </IconTip>
                <span className="text-[11px] font-semibold opacity-80">{p.current.label}</span>
              </div>
            </section>

            {/* Controls */}
            <aside className="flex flex-col gap-4">
              <div>
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">Emotions</h2>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {EMOTIONS.map((e) => {
                    const active = p.current.id === e.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => p.play(e.id)}
                        className="dm-quiet cursor-pointer rounded-xl border px-3 py-2 text-left text-[13px] font-semibold"
                        style={active ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" } : glass}
                      >
                        {e.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[12px] leading-snug opacity-75">{p.current.hint}</p>
              </div>

              <div>
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">Scrub</h2>
                <input
                  type="range"
                  min={1}
                  max={FRAME_COUNT}
                  value={p.frame}
                  onChange={(ev) => {
                    p.setPaused(true);
                    p.setFrame(Number(ev.target.value));
                  }}
                  aria-label="Frame"
                  className="mt-2 w-full"
                />
                <p className="text-[11px] opacity-60">Frame {p.frame} of {FRAME_COUNT}</p>
              </div>

              <div>
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">In the app</h2>
                <p className="mt-1 text-[12px] leading-snug opacity-75">Same frames at the sizes we use today.</p>
                <div className="mt-3 flex items-end gap-4">
                  {[96, 64, 40].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div style={{ width: s, height: s }}>
                        <DreamyFrame frame={p.frame} />
                      </div>
                      <span className="text-[10px] opacity-60">{s}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border p-4 text-[12.5px] leading-relaxed backdrop-blur-[10px]" style={glass}>
            <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">How this works</h2>
            <p className="mt-1 opacity-80">
              This is the 3D Dreamy from Blender, rendered once as 300 see-through frames. The page swaps frames at 30 fps. No 3D runs in the browser, so it is light and works on Chromebooks. Each emotion plays once and returns to idle, which is how a guide bubble would use it.
            </p>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}
