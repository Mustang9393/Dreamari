"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, VolumeX, X } from "lucide-react";
import { LetterMark } from "@/components/connect/primitives";
import { COMPANY_VIDEOS, type CompanyVideo } from "./companyVideos";

/** "Videos Inside Leading Companies" (Explore > Browse, directly above
 *  Typical Pay since 11 Sept 2026): the Apple TV "Lean Back & Watch" shape
 *  (direct reference, 11 Sept 2026). Cards are wider than the poster rail's
 *  210 x 297 but deliberately not much taller, so the row reads as one more
 *  rail rather than a hero. The first card plays its clip muted on a loop
 *  with a mute badge, the way the reference's lead card does; the others
 *  show their designed cover and preview muted on hover. The company mark
 *  sits on the scrim; the clip's title fades in only while a card is
 *  playing (the covers already carry their own titles). Tap opens the clip
 *  full screen with sound. Rendered inside Browse's Rail, which owns the
 *  horizontal scroller. */
export function CompanyVideoCards() {
  const [open, setOpen] = useState<CompanyVideo | null>(null);
  return (
    <>
      {COMPANY_VIDEOS.map((item, index) => (
        <LeanBackCard key={item.video} item={item} lead={index === 0} onOpen={() => setOpen(item)} />
      ))}
      {open && <VideoLightbox item={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function LeanBackCard({ item, lead, onOpen }: { item: CompanyVideo; lead: boolean; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // The lead card autoplays once it is on screen and rests when it scrolls
  // away, so a phone is not decoding a clip nobody can see.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !lead) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [lead]);
  const preview = (on: boolean) => {
    if (lead) return;
    const el = videoRef.current;
    if (!el) return;
    if (on) el.play().catch(() => {});
    else { el.pause(); el.currentTime = 0; }
  };
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => preview(true)}
      onMouseLeave={() => preview(false)}
      onFocus={() => preview(true)}
      onBlur={() => preview(false)}
      className="dm-tap group relative h-[330px] w-[248px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left"
      style={{ borderColor: "var(--color-glass-border-raised)", background: "#000" }}
    >
      <span className="sr-only">Play {item.company} {item.title}</span>
      {/* Cover under the clip: the 9:16 art cropped toward its top third,
         where every cover's title and mark sit. */}
      <Image src={item.poster} alt="" fill sizes="248px" className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] ${playing ? "opacity-0" : "opacity-100"}`} style={{ objectPosition: "50% 30%" }} />
      <video
        ref={videoRef}
        src={item.video}
        muted
        loop
        playsInline
        preload={lead ? "auto" : "none"}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition: "50% 30%" }}
      />
      {/* Top-right badge: a mute glyph while the clip is playing (the
         reference's lead card), a play glyph otherwise. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-[10px] right-[10px] flex size-[34px] items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110"
        style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
      >
        {playing ? <VolumeX className="h-[15px] w-[15px]" style={{ color: "#FFFFFF" }} /> : <Play className="ml-[2px] h-[15px] w-[15px]" fill="currentColor" style={{ color: "#FFFFFF" }} />}
      </span>
      {/* Scrim: the company mark always; the clip's title only while the
         cover (which bakes its own title in) has faded out for the video. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col gap-[6px] px-[14px] pt-[40px] pb-[13px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className="flex h-[15px] items-end self-start"><LetterMark name={item.company} ink="var(--poster-title)" letterHeight={15} /></span>
        <span className={`text-[14px] leading-[18px] font-semibold transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "var(--font-display)", color: "var(--poster-title)" }}>{item.title}</span>
      </span>
    </button>
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
      <div className="flex max-h-full w-full max-w-[420px] flex-col gap-[var(--space-3)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-[var(--space-3)] px-[2px]">
          <LetterMark name={item.company} ink="#FFFFFF" letterHeight={13} />
          <span className="text-[15px] leading-[20px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{item.title}</span>
        </div>
        <div className="relative">
          {/* pinned to the card's own top-right corner, not the screen's —
             on a wide desktop viewport the card sits far from the actual
             viewport edge, and the close control should sit exactly where
             the eye already is (direct feedback, 5 Sept 2026: "easily
             closeable... on the top right of the card"). Backdrop click
             and Escape still close it too. */}
          <button
            type="button"
            aria-label="Close video"
            onClick={onClose}
            className="dm-quiet absolute top-[10px] right-[10px] z-[1] flex size-10 cursor-pointer items-center justify-center rounded-full border"
            style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.3)", color: "#FFFFFF", backdropFilter: "blur(6px)" }}
          >
            <X className="h-5 w-5" />
          </button>
          <video
            src={item.video}
            poster={item.poster}
            autoPlay
            controls
            playsInline
            className="aspect-[9/16] max-h-[calc(100dvh-160px)] w-full rounded-[var(--radius-lg)] border object-contain"
            style={{ background: "#000", borderColor: "rgba(255,255,255,0.14)" }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
