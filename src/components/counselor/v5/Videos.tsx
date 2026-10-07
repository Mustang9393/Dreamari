"use client";

// Most watched career videos, shared by v5 and v6 Home (Chandu, 7 Oct 2026:
// "we're missing the video stuff on home in v5"). v5 plays a video in its
// own sheet; v6 passes its existing modal.

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { FOR_YOU_VIDEOS } from "@/components/app/catalog";
import { countActivity, useActivity } from "@/lib/activityEvents";

/** DEMO-ONLY: mock watch counts and career tags for FOR_YOU_VIDEOS, in the
 *  same order, until views are logged (plan section 3). */
export const WATCHES: { watched: number; career: string }[] = [
  { watched: 34, career: "HR Manager" },
  { watched: 41, career: "Investment Banking" },
  { watched: 22, career: "Food Scientist" },
  { watched: 29, career: "Investment Banking" },
  { watched: 18, career: "Software Engineer" },
  { watched: 26, career: "Aviation Maintenance" },
  { watched: 15, career: "Aviation Maintenance" },
];

/** Explore's For You video card (ExploreExperience VideoCard): a 9:16 clip
 *  on black with its title on the same solid scrim panel, plus the signal
 *  that earns it a place here (Chandu, 7 Oct 2026: "use the same video
 *  cards from explore... but with stats"). Plays muted while hovered.
 *  4:5, not the reel's 9:16 ("the cards don't have to be that tall"). */
export function ReelStatCard({ src, title, watched, career, onOpen }: { src: string; title: string; watched: number; career: string; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => { const v = ref.current; if (v && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {}); }}
      onPointerLeave={() => ref.current?.pause()}
      aria-label={`${title}, ${watched} students watched`}
      className="dm-tap relative flex aspect-[4/5] w-[220px] flex-none cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border text-left sm:w-auto"
      style={{ borderColor: "var(--glass-surface-2)", background: "#000" }}
    >
      <video ref={ref} src={`${src}#t=0.5`} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="metadata" />
      <span className="absolute top-[12px] left-[12px] z-[1] flex flex-col items-center rounded-[var(--radius-md)] px-[12px] py-[6px]" style={{ background: "rgba(8,10,22,0.62)", color: "#fff", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <span className="text-[22px] leading-[26px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{watched}</span>
        <span className="text-[11.5px] leading-[14px] font-semibold">Watched</span>
      </span>
      <span className="absolute top-[12px] right-[12px] z-[1] flex size-9 items-center justify-center rounded-full border" style={{ background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.30)", color: "#fff" }}><Play size={15} aria-hidden /></span>
      <span className="relative z-[1] p-[12px]">
        <span className="flex flex-col gap-[2px] rounded-[var(--radius-lg)] border px-[14px] py-[10px]" style={{ background: "var(--scrim-heavy)", borderColor: "var(--glass-border)", color: "#fff" }}>
          <span className="text-[15px] leading-[20px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <span className="text-[12.5px] leading-[16px] font-medium" style={{ opacity: 0.8 }}>{career}</span>
        </span>
      </span>
    </button>
  );
}


/** The five most watched, with a player (v5). */
export function MostWatched() {
  const [open, setOpen] = useState<number | null>(null);
  const events = useActivity();
  // seeded baseline plus every view the student app logs
  const top = FOR_YOU_VIDEOS.map((v, i) => ({ v, i, ...WATCHES[i], watched: WATCHES[i].watched + countActivity(events, "view", v.video) })).sort((a, b) => b.watched - a.watched).slice(0, 5);
  return (
    <section aria-label="Most watched by your students" className="flex flex-col gap-[var(--space-5)]">
      <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[26px] sm:leading-[32px]" style={{ fontFamily: "var(--font-display)" }}>Most Watched by Your Students</h2>
      <div className="-mx-5 flex gap-[14px] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {top.map(({ v, i, watched, career }) => <ReelStatCard key={v.title} src={v.video} title={v.title} watched={watched} career={career} onOpen={() => setOpen(i)} />)}
      </div>
      {open !== null && typeof document !== "undefined" && createPortal(
        <div className="marketing-v2 themeable fixed inset-0 z-[110] flex items-center justify-center p-[var(--space-6)]" role="dialog" aria-modal="true" aria-label={FOR_YOU_VIDEOS[open].title}>
          <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setOpen(null)} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.8)" }} />
          <div className="relative flex max-h-full flex-col gap-[var(--space-3)]">
            <div className="flex items-center justify-between gap-[var(--space-3)] text-white">
              <span className="text-[16px] font-semibold">{FOR_YOU_VIDEOS[open].title}</span>
              <IconTip label="Close"><button type="button" aria-label="Close" onClick={() => setOpen(null)} className="flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}><X className="h-5 w-5" aria-hidden /></button></IconTip>
            </div>
            <video src={FOR_YOU_VIDEOS[open].video} controls autoPlay playsInline className="max-h-[80dvh] rounded-[var(--radius-lg)]" style={{ aspectRatio: "9 / 16", background: "#000" }} />
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
