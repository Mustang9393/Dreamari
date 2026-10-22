"use client";

import { useEffect, useId, useRef, useState } from "react";
import { setCaptionsOn, useCaptionsOn } from "@/lib/captionsPref";
import { ChevronDown, FileText } from "lucide-react";
import { captionsFor, transcriptFor } from "./videoTranscripts";

/** The caption track for a company video (WCAG 1.2.2, audit 21 Oct 2026):
 *  on by default, so the clips read with the sound off too, which is how most
 *  students first meet them. Renders nothing for a video with no captions. */
export function CaptionTrack({ video }: { video: string }) {
  const src = captionsFor(video);
  // Shown or hidden by the remembered preference (lib/captionsPref.ts); the
  // browser's own CC menu writes back to it, so turning captions off in one
  // player turns them off in all of them.
  const on = useCaptionsOn();
  const ref = useRef<HTMLTrackElement>(null);
  useEffect(() => {
    const track = ref.current?.track;
    if (track) track.mode = on ? "showing" : "hidden";
  }, [on, src]);
  useEffect(() => {
    const el = ref.current;
    const list = el?.parentElement instanceof HTMLVideoElement ? el.parentElement.textTracks : null;
    if (!el || !list) return;
    const onChange = () => { if (el.track.mode !== "disabled") setCaptionsOn(el.track.mode === "showing"); };
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [src]);
  return src ? <track ref={ref} kind="captions" src={src} srcLang="en" label="English" default={on} /> : null;
}

/** "Transcript" under a company video player (WCAG 1.2.3 / 1.2.8): the whole
 *  clip as text, for anyone who would rather read it or can't hear it. Folded
 *  by default; always on a dark ground, since every player sits on a scrim. */
export function VideoTranscript({ video }: { video: string }) {
  const text = transcriptFor(video);
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!text) return null;
  return (
    <div className="flex flex-col gap-[6px]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="dm-quiet flex min-h-[36px] w-fit cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[12px] text-[13px] font-semibold"
        style={{ background: "rgb(var(--scrim-rgb, 5 8 20) / calc(0.72 * var(--scrim-glass-gain, 1)))", borderColor: "var(--scrim-chip-edge, rgba(255,255,255,0.3))", color: "var(--scrim-ink, #fff)" }}
      >
        <FileText className="h-[14px] w-[14px]" aria-hidden />
        {open ? "Hide transcript" : "Transcript"}
        <ChevronDown className="h-[14px] w-[14px] transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }} aria-hidden />
      </button>
      {open && (
        <p
          id={id}
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
          className="dm-scroll max-h-[min(32dvh,260px)] overflow-y-auto rounded-[var(--radius-md)] border p-[12px] text-[14px] leading-[1.55]"
          style={{ background: "rgb(var(--scrim-rgb, 5 8 20) / calc(0.88 * var(--scrim-glass-gain, 1)))", borderColor: "var(--scrim-chip-edge, rgba(255,255,255,0.18))", color: "var(--scrim-ink, #fff)" }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
