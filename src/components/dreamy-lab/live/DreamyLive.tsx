"use client";

// DEMO-ONLY: the Dreamy Lab's live 3D page (direct instruction, 2 Oct
// 2026: "I definitely need to wire these into the app so it can react
// dynamically as opposed to just playing a video, and it can float around
// and have different angles"). A feasibility prototype: the real model,
// rendered live, driven by a small state machine, with a frame-rate
// readout so we can judge the cost before any of this goes near the app.

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { REACTIONS } from "./brain";
import type { LiveHandle } from "./DreamyLiveCanvas";

const DreamyLiveCanvas = dynamic(() => import("./DreamyLiveCanvas"), { ssr: false });

const glass = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

export function DreamyLive() {
  const [handle, setHandle] = useState<LiveHandle | null>(null);
  const [state, setState] = useState("idle");
  const [stats, setStats] = useState({ fps: 0, ms: 0 });
  const [lowPower, setLowPower] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onReady = useCallback((h: LiveHandle) => setHandle(h), []);

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
              Dreamy 3D · not the demo
            </span>
            <QuickLinksMenu />
          </div>
        </header>

        <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 pt-24 pb-10 sm:px-6" style={{ color: "var(--foreground)" }}>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
            <section className="relative aspect-square w-full overflow-hidden rounded-3xl border backdrop-blur-[10px]" style={glass}>
              <DreamyLiveCanvas lowPower={lowPower} onReady={onReady} onStats={setStats} onState={setState} onError={setError} />
              {!handle && !error && <p className="absolute inset-x-0 bottom-5 text-center text-[12px] opacity-70">Loading Dreamy</p>}
              {error && <p className="absolute inset-x-6 bottom-5 text-center text-[12px]" style={{ color: "var(--destructive, #f87171)" }}>Could not load the model. {error}</p>}
              <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full border px-2.5 py-1" style={glass}>{stats.fps} fps</span>
                <span className="rounded-full border px-2.5 py-1 opacity-80" style={glass}>{stats.ms} ms/frame</span>
                <span className="rounded-full border px-2.5 py-1 capitalize opacity-80" style={glass}>{state}</span>
              </div>
            </section>

            <aside className="flex flex-col gap-4">
              <div>
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">Reactions</h2>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(REACTIONS).map(([id, r]) => (
                    <button
                      key={id}
                      type="button"
                      disabled={!handle}
                      onClick={() => handle?.play(id)}
                      className="dm-quiet cursor-pointer rounded-xl border px-3 py-2 text-left text-[13px] font-semibold disabled:cursor-default disabled:opacity-50"
                      style={state === id ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" } : glass}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] leading-snug opacity-75">{REACTIONS[state]?.hint ?? "Idle. He floats, blinks and follows your pointer."}</p>
              </div>

              <div className="rounded-2xl border p-3 text-[12px] leading-snug" style={glass}>
                <p className="font-semibold">Try it</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 opacity-80">
                  <li>Move your pointer. He looks at it.</li>
                  <li>Drag him to turn him. He drifts back.</li>
                  <li>Tap him to make him happy.</li>
                </ul>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 text-[12px]" style={glass}>
                <span>
                  <span className="block font-semibold">Low-power mode</span>
                  <span className="opacity-75">What a Chromebook would get: 30 fps, lower resolution.</span>
                </span>
                <input type="checkbox" checked={lowPower} onChange={(e) => setLowPower(e.target.checked)} className="size-4" />
              </label>
            </aside>
          </div>

          <section className="rounded-2xl border p-4 text-[12.5px] leading-relaxed backdrop-blur-[10px]" style={glass}>
            <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">How this works</h2>
            <p className="mt-1 opacity-80">
              This is the real Blender model, running live in the browser. The app sends an event and Dreamy picks a reaction. In between he floats, blinks and looks around on his own. Only this page loads the 3D code. It pauses when he is off screen.
            </p>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}
