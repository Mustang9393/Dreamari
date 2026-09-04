"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { LetterMark } from "@/components/connect/primitives";
import { COMPANY_VIDEOS, type CompanyVideo } from "./companyVideos";

/** "Videos Inside Leading Companies" (Explore > Browse, under Typical Pay):
 *  the same 210 x 297 poster shape as every other Browse rail card, with
 *  the clip's first frame as the cover, the company's mark top-left, the
 *  play badge in the middle and the title on the poster scrim. Tapping a
 *  card opens the clip full screen with sound; nothing plays in the rail.
 *  Rendered inside Browse's Rail, which owns the horizontal scroller. */
export function CompanyVideoCards() {
  const [open, setOpen] = useState<CompanyVideo | null>(null);
  return (
    <>
      {COMPANY_VIDEOS.map((item) => (
        <button
          key={item.video}
          type="button"
          onClick={() => setOpen(item)}
          className="dm-tap group relative h-[297px] w-[210px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left"
          style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}
        >
          <span className="sr-only">Play {item.company} {item.title}</span>
          <Image src={item.poster} alt="" fill sizes="210px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 flex size-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110"
            style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
          >
            <Play className="ml-[3px] h-[22px] w-[22px]" fill="currentColor" style={{ color: "#FFFFFF" }} />
          </span>
          {/* the company mark sits on the dark scrim right above the title,
             white and at a readable size (direct feedback: the frosted chip up
             top vanished against bright footage) */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col gap-[7px] px-[14px] pt-[44px] pb-[14px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
            {/* LetterMark: every brand's LETTERS are exactly 15px tall and share
               a baseline; flourishes (EY's beam, Kellogg's descenders, the
               AT&T globe) hang outside that box, so no mark reads bigger
               because its file has more air or ornament in it. Ink follows
               the scrim's own title colour (light mode's scrim goes near-
               white, so a hardcoded white mark disappeared into it). */}
            <span className="flex h-[15px] items-end self-start"><LetterMark name={item.company} ink="var(--poster-title)" letterHeight={15} /></span>
            <span className="block text-[16px] leading-[20px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--poster-title)" }}>{item.title}</span>
          </span>
        </button>
      ))}
      {open && <VideoLightbox item={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/** Full-screen player: the clip at its own 9:16, with controls and sound,
 *  over a near-black scrim. Escape, the X, or the scrim closes it. */
function VideoLightbox({ item, onClose }: { item: CompanyVideo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.company}: ${item.title}`}
      className="fixed inset-0 z-[120] flex items-center justify-center p-[var(--space-4)]"
      style={{ background: "rgba(5,8,20,0.94)" }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close video"
        onClick={onClose}
        className="dm-quiet absolute top-[var(--space-4)] right-[var(--space-4)] z-[1] flex size-10 cursor-pointer items-center justify-center rounded-full border"
        style={{ background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.24)", color: "#FFFFFF" }}
      >
        <X className="h-5 w-5" />
      </button>
      <div className="flex max-h-full w-full max-w-[420px] flex-col gap-[var(--space-3)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-[var(--space-3)] px-[2px]">
          <LetterMark name={item.company} ink="#FFFFFF" letterHeight={13} />
          <span className="text-[15px] leading-[20px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{item.title}</span>
        </div>
        <video
          src={item.video}
          poster={item.poster}
          autoPlay
          controls
          playsInline
          className="aspect-[9/16] max-h-[calc(100dvh-120px)] w-full rounded-[var(--radius-lg)] border object-contain"
          style={{ background: "#000", borderColor: "rgba(255,255,255,0.14)" }}
        />
      </div>
    </div>,
    document.body,
  );
}
