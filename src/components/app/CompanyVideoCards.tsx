"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Volume2, VolumeX, X } from "lucide-react";
import { LetterMark } from "@/components/connect/primitives";
import { COMPANY_VIDEOS, type CompanyVideo } from "./companyVideos";
import { setVideoSoundMuted, useVideoSoundMuted } from "./videoSound";

/** "Videos Inside Leading Companies" (Explore > Browse, directly above
 *  Typical Pay since 11 Sept 2026): the Apple TV "Lean Back & Watch" shape
 *  (direct reference, 11 Sept 2026). Cards are wider than the poster rail's
 *  210 x 297 and a little squarer (276 x 368; squarer shapes cut the titles baked into the covers and clips, direct feedback 11 Sept 2026),
 *  still one rail rather than a hero. The first card plays its clip once on
 *  scroll-into-view (autoplay is always muted -- no real user gesture
 *  behind it), then rests on its cover. Hovering or focusing ANY card plays
 *  it WITH SOUND, per the shared preference in videoSound.ts (direct
 *  feedback, 11 Sept 2026: "play with sound on hover... make it device
 *  sound setting aware" -- one on/off choice, not per-card, and it survives
 *  to the next card and the next visit). A badge in the corner is a real
 *  mute toggle once a clip is playing; if the browser blocks unmuted
 *  autoplay from a hover (some do, since hover is not a guaranteed user
 *  gesture), playback falls back to muted for that attempt only -- the
 *  shared preference itself is not changed, and a genuine click on the
 *  badge always works. The company mark sits on the scrim; the clip's
 *  title fades in only while a card is playing (the covers already carry
 *  their own titles). Tap opens the clip full screen with sound. Rendered
 *  inside Browse's Rail, which owns the horizontal scroller. */
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
  // Whether THIS card's own <video> is actually muted right now -- distinct
  // from the shared preference below, because a hover can fall back to
  // muted for one attempt when the browser blocks unmuted autoplay. The
  // badge reflects reality, not just the setting.
  const [elMuted, setElMuted] = useState(true);
  const introduced = useRef(false);
  const sharedMuted = useVideoSoundMuted();

  // Attempt playback honoring the shared sound preference; if the browser
  // rejects an unmuted autoplay (hovering is not a guaranteed user gesture
  // in every browser), fall back to a silent preview rather than nothing
  // playing at all. Does not touch the shared preference.
  const attemptPlay = (el: HTMLVideoElement, wantMuted: boolean) => {
    el.muted = wantMuted;
    setElMuted(wantMuted);
    el.play().catch(() => {
      if (!wantMuted) {
        el.muted = true;
        setElMuted(true);
        el.play().catch(() => {});
      }
    });
  };

  // The lead card plays ONCE when it first scrolls into view, then settles
  // back to its cover (direct feedback, 11 Sept 2026: a looping card kept
  // pulling the eye from the rest of the page). It pauses if scrolled away
  // mid-clip so a phone is not decoding a clip nobody can see. Scroll-
  // triggered playback is always muted -- there is no user gesture behind
  // it, so an unmuted attempt would just be rejected by the browser anyway.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !lead) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !introduced.current) {
        introduced.current = true;
        attemptPlay(el, true);
      } else if (!entry.isIntersecting && !el.paused) {
        el.pause();
        el.currentTime = 0;
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [lead]);

  // Every card plays WITH SOUND on hover or focus, per the shared
  // preference (direct feedback, 11 Sept 2026).
  const preview = (on: boolean) => {
    const el = videoRef.current;
    if (!el) return;
    if (on) attemptPlay(el, sharedMuted);
    else { el.pause(); el.currentTime = 0; }
  };
  const rest = () => {
    const el = videoRef.current;
    if (el) el.currentTime = 0;
    setPlaying(false);
  };
  // The badge is a real toggle once something is playing: it flips the ONE
  // shared preference every card uses, not just this card's volume. A click
  // is a genuine user gesture, so unmuting here always succeeds even if an
  // earlier hover had to fall back to silent.
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !elMuted;
    setVideoSoundMuted(next);
    const el = videoRef.current;
    if (el) {
      el.muted = next;
      setElMuted(next);
      if (!next) el.play().catch(() => {});
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play ${item.company}: ${item.title}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      onMouseEnter={() => preview(true)}
      onMouseLeave={() => preview(false)}
      onFocus={() => preview(true)}
      onBlur={() => preview(false)}
      className="dm-tap group relative h-[368px] w-[276px] flex-none cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border text-left"
      style={{ borderColor: "var(--color-glass-border-raised)", background: "#000" }}
    >
      {/* Cover under the clip: the 9:16 art cropped toward its top third,
         where every cover's title and mark sit. */}
      <Image src={item.poster} alt="" fill sizes="276px" className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] ${playing ? "opacity-0" : "opacity-100"}`} style={{ objectPosition: "50% 30%" }} />
      <video
        ref={videoRef}
        src={item.video}
        // Bound to state, not a bare `muted` (always true) -- React treats
        // `muted` as a controlled DOM property and re-applies it on every
        // render, which was silently re-muting playback the instant ANY
        // card's shared sound preference changed (this card included).
        muted={elMuted}
        playsInline
        preload={lead ? "auto" : "none"}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={rest}
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition: "50% 30%" }}
      />
      {/* Top-right badge: a play glyph before anything has played, then a
         real mute/unmute toggle once the clip is playing. */}
      {playing ? (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={elMuted ? "Unmute" : "Mute"}
          aria-pressed={!elMuted}
          className="absolute top-[10px] right-[10px] z-[1] flex size-[34px] cursor-pointer items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 hover:scale-110"
          style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
        >
          {elMuted ? <VolumeX className="h-[15px] w-[15px]" style={{ color: "#FFFFFF" }} /> : <Volume2 className="h-[15px] w-[15px]" style={{ color: "#FFFFFF" }} />}
        </button>
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute top-[10px] right-[10px] flex size-[34px] items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110"
          style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
        >
          <Play className="ml-[2px] h-[15px] w-[15px]" fill="currentColor" style={{ color: "#FFFFFF" }} />
        </span>
      )}
      {/* Scrim: the company mark always; the clip's title only while the
         cover (which bakes its own title in) has faded out for the video. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col gap-[6px] px-[14px] pt-[40px] pb-[13px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className="flex h-[15px] items-end self-start"><LetterMark name={item.company} ink="var(--poster-title)" letterHeight={15} /></span>
        <span className={`text-[14px] leading-[18px] font-semibold transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "var(--font-display)", color: "var(--poster-title)" }}>{item.title}</span>
      </span>
    </div>
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
