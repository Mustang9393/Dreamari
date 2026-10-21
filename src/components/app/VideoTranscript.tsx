"use client";

import { useId, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { captionsFor, transcriptFor } from "./videoTranscripts";

/** The caption track for a company video (WCAG 1.2.2, audit 21 Oct 2026):
 *  on by default, so the clips read with the sound off too, which is how most
 *  students first meet them. Renders nothing for a video with no captions. */
export function CaptionTrack({ video }: { video: string }) {
  const src = captionsFor(video);
  return src ? <track kind="captions" src={src} srcLang="en" label="English" default /> : null;
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
        style={{ background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
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
          style={{ background: "rgba(5,8,20,0.88)", borderColor: "rgba(255,255,255,0.18)", color: "#fff" }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
