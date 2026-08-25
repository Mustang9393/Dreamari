"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, Eye, Heart, Play, Search, ThumbsDown, X } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu } from "./chrome";
import { PosterCard, RankedPosterCard } from "./PosterCard";
import {
  BROWSE_BECAUSE_LIKED,
  BROWSE_MIGHT_NOT_KNOW,
  BROWSE_TRENDING,
  BROWSE_TYPICAL_PAY,
  BROWSE_WORLD_RAIL,
  FOR_YOU_FEED,
  isVideoReel,
  type CatalogCareer,
  type ReelCareer,
  type ReelItem,
  type VideoReel,
} from "./catalog";
import { WORLD_LABELS } from "./worlds";
import { careerSlug } from "@/components/career/slug";
import "./app.css";

// Explore, both faces of the Figma design:
//  - "For You" (Explore — v2.1B, 2288:16179): the Env Card reel with the
//    Desktop Career Preference Rail beside it and Previous/Next paging.
//  - "Browse All" (Explore-Browse, 3185:17011): search, world filter pills,
//    Sort by, and six career rails ported section by section.

function ForYouBrowseToggle({ tab, onTab }: { tab: "foryou" | "browse"; onTab: (tab: "foryou" | "browse") => void }) {
  return (
    <div
      className="flex items-center gap-[var(--space-1)] rounded-[var(--radius-xl)] border p-[var(--space-1)]"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
    >
      {(
        [
          { key: "foryou", label: "For you" },
          { key: "browse", label: "Browse All" },
        ] as const
      ).map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={tab === item.key}
          onClick={() => onTab(item.key)}
          className="dm-quiet cursor-pointer rounded-[var(--radius-md-alt)] px-[var(--space-4)] py-[6px] text-[13px] leading-[18px] font-bold uppercase"
          style={{
            fontFamily: "var(--font-body)",
            background: tab === item.key ? "var(--primary)" : "transparent",
            color: tab === item.key ? "var(--primary-foreground)" : "var(--foreground)",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Rail({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex w-full flex-col gap-[var(--space-5)]">
      <div className="flex flex-col gap-[var(--space-1)]">
        <h2 className="text-[24px] leading-[30px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="-mx-5 flex gap-[var(--space-6)] overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-[var(--space-14)] md:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>{children}</div>
    </section>
  );
}

function PosterRail({ careers }: { careers: CatalogCareer[] }) {
  const router = useRouter();
  return (
    <>
      {careers.map((career, index) => (
        <PosterCard key={`${career.title}-${index}`} career={career} onClick={() => router.push(`/career/${careerSlug(career.title)}`)} />
      ))}
    </>
  );
}

function TrendingRail({ trending }: { trending: CatalogCareer[] }) {
  const router = useRouter();
  return (
    <section aria-label="Top 5 Trending Careers Among Gen Z" className="flex w-full flex-col gap-[20px]">
      <h2 className="text-[22px] leading-[28px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
        Top 5 Trending Careers Among Gen Z
      </h2>
      <div className="-mx-5 flex gap-[24px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-[var(--space-14)] md:gap-[57px] md:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
        {trending.map((career, index) => (
          <RankedPosterCard key={career.title} career={career} rank={index + 1} onClick={() => router.push(`/career/${careerSlug(career.title)}`)} />
        ))}
      </div>
    </section>
  );
}

const SORT_OPTIONS = ["Recommended", "A – Z", "Salary"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

function FilterPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="dm-quiet flex-none cursor-pointer rounded-[100px] border px-[14px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap transition-colors"
      style={{
        fontFamily: "var(--font-body)",
        background: selected ? "var(--primary)" : "var(--glass-surface-1)",
        borderColor: selected ? "var(--primary)" : "var(--glass-border)",
        color: selected ? "var(--primary-foreground)" : "var(--foreground)",
      }}
    >
      {label}
    </button>
  );
}

function BrowseFace({ query, filtersOpen }: { query: string; filtersOpen: boolean }) {
  const [world, setWorld] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("Recommended");

  // When the search (and with it the pill rows) is closed, the catalog view
  // derives back to unfiltered — nothing stays silently filtered; reopening
  // restores the previous selection.
  const effectiveWorld = filtersOpen ? world : "All";
  const effectiveSort: SortOption = filtersOpen ? sort : "Recommended";
  const view = (careers: CatalogCareer[]) => applyCatalogView(careers, effectiveWorld, query, effectiveSort);
  const becauseLiked = view(BROWSE_BECAUSE_LIKED);
  const trending = view(BROWSE_TRENDING);
  const worldRail = view(BROWSE_WORLD_RAIL);
  const mightNotKnow = view(BROWSE_MIGHT_NOT_KNOW);
  const typicalPay = view(BROWSE_TYPICAL_PAY);

  return (
    <>
      {/* Search reveals the whole filter block: the world pills row scrolls
         edge-to-edge, and the sort row sits beneath it — filter and sort
         work together, no mode switching. */}
      {filtersOpen && (
        <div className="filters-reveal flex w-full flex-col gap-[var(--space-3)]">
          <div
            className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-[var(--space-14)] md:px-[var(--space-14)]"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {WORLD_LABELS.map((label) => (
              <FilterPill key={label} label={label} selected={world === label} onClick={() => setWorld(label)} />
            ))}
          </div>
          <div className="flex items-center gap-[10px]">
            <span className="flex items-center gap-[6px] text-[10px] leading-[14px] font-semibold tracking-[0.6px] whitespace-nowrap uppercase" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
              <span aria-hidden className="text-[12px] normal-case">↕</span> Sort by
            </span>
            <div className="flex gap-[8px] overflow-x-auto [scrollbar-width:none]" style={{ touchAction: "pan-x pan-y" }}>
              {SORT_OPTIONS.map((option) => (
                <FilterPill key={option} label={option} selected={sort === option} onClick={() => setSort(option)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rail order + content per Joshua (2026-08-21): merged recommended
         rail, then Tech, Top 5, Might Not Know, Typical Pay. */}
      {becauseLiked.length > 0 && (
        <Rail title="Recommended Because You Liked Business & Money">
          <PosterRail careers={becauseLiked} />
        </Rail>
      )}

      {worldRail.length > 0 && (
        <Rail title="Tech & Engineering">
          <PosterRail careers={worldRail} />
        </Rail>
      )}

      {trending.length > 0 && (
        <TrendingRail trending={trending} />
      )}

      {mightNotKnow.length > 0 && (
        <Rail title="Careers You Might Not Know">
          <PosterRail careers={mightNotKnow} />
        </Rail>
      )}

      {typicalPay.length > 0 && (
        <Rail title="Typical Pay: $100K +">
          <PosterRail careers={typicalPay} />
        </Rail>
      )}
    </>
  );
}

function applyCatalogView(careers: CatalogCareer[], world: string, query: string, sort: SortOption): CatalogCareer[] {
  let list = careers;
  if (world !== "All") list = list.filter((career) => career.world === world);
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((career) => career.title.toLowerCase().includes(q) || career.world.toLowerCase().includes(q));
  }
  if (sort === "A – Z") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "Salary") {
    const value = (career: CatalogCareer) => (career.salary ? parseInt(career.salary.replace(/\D/g, ""), 10) : -1);
    list = [...list].sort((a, b) => value(b) - value(a));
  }
  return list;
}

function EnvCard({ career, active }: { career: ReelCareer; active: boolean }) {
  const [face, setFace] = useState<"Summary" | "Details">("Summary");
  const router = useRouter();
  return (
    <article
      className="relative flex h-full w-full flex-col justify-end gap-[var(--space-6)] overflow-hidden border p-[var(--space-4)] md:rounded-[var(--radius-xl)]"
      style={{ borderColor: "var(--glass-surface-2)", background: "var(--background)" }}
    >
      {/* Env photo: taller-than-card wrapper for parallax (JS translateY),
         slow Ken Burns push-in while the card is the active one. */}
      <div aria-hidden data-parallax className={`absolute inset-x-0 -top-[8%] -bottom-[8%] overflow-hidden will-change-transform ${active ? "env-zoom-active" : ""}`}>
        <Image src={career.photo} alt="" fill sizes="(max-width: 768px) 100vw, 390px" className="object-cover" priority={active} draggable={false} />
      </div>

      {/* Bottom-anchored cluster, bled past the card's own p-4 so both the
         preference row and the blur panel reach the true card edges rather
         than leaving a sharp, unblurred margin inside the border. Preference
         Actions sits directly above the Career Details Panel here (Figma
         3317:15773's own "Main Content Row" stacks them in that order,
         bottom-anchored as a pair) -- NOT pinned to the top of the card,
         which was a misreading of that flex layout the first time around. */}
      <div className="relative -mx-[var(--space-4)] -mb-[var(--space-4)] flex flex-col pb-[64px] md:pb-0">
        <div className="flex flex-col items-end gap-[var(--space-4)] px-[var(--space-4)] pb-[var(--space-4)] md:hidden">
          <PreferenceButton label="Like this career" Icon={Heart} bare />
          <PreferenceButton label="Not for me" Icon={ThumbsDown} bare />
          <PreferenceButton label="Save for later" Icon={Bookmark} bare />
        </div>

        {/* Career Details Panel: the whole block, text through the CTA row,
           sits on ONE continuous backdrop -- not a blurred text panel with
           the buttons floating over raw photo below it. Figma's own effect
           is a "Progressive" background blur, start 2 / end 35 -- CSS has
           no native gradient-radius backdrop-filter, so this is
           approximated with stacked layers at increasing blur, each faded
           in via its own mask band (the standard web technique for this
           effect; every layer samples the same photo independently, and
           the browser composites the overlapping, differently-blurred
           results into a smooth ramp). */}
        <div className="relative flex flex-col">
          <ProgressiveBlur />
          <div className="relative z-[1] flex w-full flex-col gap-[var(--space-2)] p-[var(--space-4)]">
            {/* The tap-to-flip Summary <-> Details interaction wraps only the
               text -- Figma's own mockup nests it inside the same panel as
               the CTA buttons below, but a <button> cannot contain other
               buttons, so this stays its own element, just sharing the
               panel's single backdrop and padding rather than owning a
               separate one. Gap to the CTA row below tightened from
               space-4 to space-2 -- the two read as one connected block in
               Figma, not a title card with buttons stapled on well below it. */}
            <button
              type="button"
              aria-label={face === "Summary" ? "Show more info" : "Show summary"}
              onClick={() => setFace((current) => (current === "Summary" ? "Details" : "Summary"))}
              className="dm-tap flex w-full cursor-pointer flex-col gap-[var(--space-2)] text-left"
            >
              <div key={face} className="face-swap flex min-h-[151px] w-full flex-col gap-[var(--space-2)] md:w-[326px]">
                <div className="flex items-start justify-between gap-[var(--space-2)]">
                  <span className="text-[10px] leading-[14px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted-alt)" }}>
                    {face === "Summary" ? career.matchLabel : "MORE INFO"}
                  </span>
                  <span aria-hidden className="flex items-center">
                    <span className="mx-[2px] h-[5px] w-[5px] rounded-full" style={face === "Summary" ? { background: "var(--foreground)" } : { border: "1px solid var(--muted-foreground)" }} />
                    <span className="mx-[2px] h-[5px] w-[5px] rounded-full" style={face === "Details" ? { background: "var(--foreground)" } : { border: "1px solid var(--muted-foreground)" }} />
                  </span>
                </div>
                {face === "Summary" ? (
                  <>
                    <h2 className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}>
                      {career.title}
                    </h2>
                    <p className="text-[13px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--primary-foreground)" }}>
                      {career.description}
                    </p>
                    <div className="flex gap-[var(--space-4)] text-[13px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                      <span style={{ color: "var(--muted-foreground)" }}>SALARY</span>
                      <span style={{ color: "var(--foreground)" }}>{career.salary}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-[var(--space-2)] text-[13px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                    <div className="flex flex-col gap-[var(--space-1)]">
                      <span style={{ color: "var(--muted-foreground)" }}>MAJOR</span>
                      <span style={{ color: "var(--foreground)" }}>{career.major}</span>
                    </div>
                    <div className="flex flex-col gap-[var(--space-1)]">
                      <span style={{ color: "var(--muted-foreground)" }}>MAIN SKILLS</span>
                      <span style={{ color: "var(--foreground)" }}>{career.mainSkills}</span>
                    </div>
                  </div>
                )}
              </div>
            </button>

            <div className="mt-[var(--space-2)] flex w-full items-stretch justify-between gap-[var(--space-3)]">
              <button
                type="button"
                className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)]"
                /* solid dark glass in BOTH themes: the faint white-alpha surface
                   disappeared against the photos (founder feedback) */
                style={{ background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.30)", backdropFilter: "blur(10px)" }}
              >
                <span className="text-[16px] leading-[22px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "#F4F7FF" }}>
                  Play Game
                </span>
                <Play aria-hidden className="h-4 w-4" style={{ color: "#F4F7FF" }} />
              </button>
              <button
                type="button"
                onClick={() => router.push(`/career/${careerSlug(career.title)}`)}
                className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]"
                style={{ background: "var(--foreground)" }}
              >
                <span className="text-[16px] leading-[22px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--background)" }}>
                  More Info
                </span>
                <Eye aria-hidden className="h-4 w-4" style={{ color: "var(--background)" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Figma's own effect on the Career Details Panel is a "Progressive"
 *  background blur (Start 2, End 35) -- CSS has no gradient-radius
 *  backdrop-filter, so this approximates it with N stacked layers, each
 *  blurring the same photo independently at its own fixed radius and faded
 *  in via a soft-edged mask band. Later layers (higher blur) render on top
 *  and start their band further down, so the very top of the panel reads
 *  almost photo-sharp and the bottom (behind the CTA row) is fully blurred,
 *  with a smooth ramp in between rather than a hard seam. */
const PROGRESSIVE_BLUR_STOPS = [2, 8, 15, 22, 29, 35];

function ProgressiveBlur() {
  const total = PROGRESSIVE_BLUR_STOPS.length;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PROGRESSIVE_BLUR_STOPS.map((blur, index) => {
        const bandStart = (index / total) * 100;
        const feather = 100 / total + 6;
        const mask = `linear-gradient(to bottom, transparent ${Math.max(0, bandStart - feather).toFixed(1)}%, black ${bandStart.toFixed(1)}%, black 100%)`;
        return (
          <div
            key={blur}
            className="absolute inset-0"
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }}
          />
        );
      })}
    </div>
  );
}

/** A real office-tour/day-in-the-life clip in the reel. Deliberately not
 *  EnvCard with a <video> swapped in: these have no salary, major, or
 *  "Play Game" affordance to show, so the card is just the clip and its
 *  title. Autoplays muted while its card is the active one, per the same
 *  IntersectionObserver-driven `active` flag EnvCard's Ken Burns uses;
 *  pauses off-screen instead of playing every card in the feed at once. */
function VideoCard({ item, active }: { item: VideoReel; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);
  return (
    <article
      className="relative flex h-full w-full flex-col justify-end overflow-hidden border md:rounded-[var(--radius-xl)]"
      style={{ borderColor: "var(--glass-surface-2)", background: "#000" }}
    >
      <video ref={videoRef} src={item.video} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload={active ? "auto" : "none"} />
      <div className="relative z-[1] p-[var(--space-4)] pb-[64px] md:pb-[var(--space-4)]">
        {/* Same rounded panel language as the Env Card v2 details panel, but
           a SOLID scrim rather than the frosted-glass blur -- blurring part
           of a playing video looks muddy in a way it doesn't over a still
           photo, and the title needs to stay sharp and legible over motion. */}
        <span
          className="inline-block rounded-[var(--radius-2xl)] border px-[var(--space-4)] py-[var(--space-3)] text-[16px] leading-[22px] font-semibold"
          style={{ background: "var(--scrim-heavy)", borderColor: "var(--glass-border)", color: "#ffffff", fontFamily: "var(--font-display)" }}
        >
          {item.title}
        </span>
      </div>
    </article>
  );
}

/** One reel slide, either kind. */
function ForYouCard({ item, active }: { item: ReelItem; active: boolean }) {
  if (isVideoReel(item)) return <VideoCard item={item} active={active} />;
  return <EnvCard career={item} active={active} />;
}

function PreferenceButton({ label, Icon, bare = false }: { label: string; Icon: typeof Heart; bare?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="dm-quiet flex size-11 cursor-pointer items-center justify-center rounded-[999px] border transition-transform duration-150 hover:-translate-y-px active:scale-95"
      style={{
        background: bare ? "transparent" : "var(--glass-surface-1)",
        borderColor: bare ? "transparent" : "var(--glass-border)",
        color: "var(--foreground)",
      }}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

function ForYouFace() {
  const total = FOR_YOU_FEED.length;
  const [active, setActive] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Active-card tracking (drives the Ken Burns restart + paging state).
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const cards = Array.from(feed.querySelectorAll("[data-reel-index]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActive(Number((entry.target as HTMLElement).dataset.reelIndex));
          }
        }
      },
      { root: feed, threshold: 0.6 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  // Parallax: each card's photo drifts against the scroll (~36px range).
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function apply() {
      frame = 0;
      const viewH = feed!.clientHeight;
      feed!.querySelectorAll<HTMLElement>("[data-reel-index]").forEach((card) => {
        const photo = card.querySelector<HTMLElement>("[data-parallax]");
        if (!photo) return;
        const rect = card.getBoundingClientRect();
        const feedRect = feed!.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - (feedRect.top + viewH / 2)) / viewH;
        photo.style.transform = `translateY(${(-offset * 36).toFixed(1)}px)`;
      });
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(apply);
    }
    feed.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      feed.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const step = useCallback((delta: number) => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollBy({ top: delta * feed.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowDown") step(1);
      if (event.key === "ArrowUp") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div className="relative flex w-full items-center justify-center gap-[10px] md:min-h-0 md:flex-1">
      {/* The feed: TikTok-style vertical snap scroll. Full-bleed viewport on
         mobile; the Env Card frame (390×672) on desktop. */}
      <div
        ref={feedRef}
        /* night scene: the reel is always photo-on-dark; its ui keeps dark
           tokens in light mode (see tokens.css) */
        data-night-scene
        className="foryou-snap fixed inset-0 z-0 overflow-y-auto md:relative md:inset-auto md:z-auto md:h-full md:max-h-[672px] md:w-[390px] md:overflow-y-auto md:rounded-[var(--radius-xl)]"
      >
        {FOR_YOU_FEED.map((item, index) => (
          <div key={index} data-reel-index={index} className="h-full w-full snap-start snap-always">
            <ForYouCard item={item} active={index === active} />
          </div>
        ))}
      </div>

      {/* Desktop Career Preference Rail — "Place immediately to the right of
         an Env Card. Mobile keeps these controls inside the card." */}
      <div className="hidden flex-col items-center gap-[var(--space-6)] md:flex">
        <PreferenceButton label="Like this career" Icon={Heart} />
        <PreferenceButton label="Not for me" Icon={ThumbsDown} />
        <PreferenceButton label="Save for later" Icon={Bookmark} />
      </div>

      {/* Previous / Next paging */}
      <div className="absolute right-0 hidden flex-col gap-[10px] md:flex">
        <button
          type="button"
          aria-label="Previous career"
          disabled={active === 0}
          onClick={() => step(-1)}
          className="dm-quiet flex size-11 cursor-pointer items-center justify-center rounded-[999px] border disabled:cursor-default disabled:opacity-40"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next career"
          disabled={active >= total - 1}
          onClick={() => step(1)}
          className="dm-quiet flex size-11 cursor-pointer items-center justify-center rounded-[999px] border disabled:cursor-default disabled:opacity-40"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function ExploreExperience({ initialTab }: { initialTab: "foryou" | "browse" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"foryou" | "browse">(initialTab);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function switchTab(next: "foryou" | "browse") {
    setTab(next);
    setSearchOpen(false);
    router.replace(next === "browse" ? "/explore?tab=browse" : "/explore", { scroll: false });
  }

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)" }}>

      <DesktopNavigation active="Explore" />

      {/* Mobile top tabs (the mobile frames' "Top Nav Scrim") */}
      <div data-night-scene={tab === "foryou" ? "" : undefined} className="absolute inset-x-0 top-0 z-30 flex h-[56px] items-center justify-center gap-[20px] md:hidden" style={{ background: tab === "browse" ? "transparent" : "linear-gradient(180deg, var(--scrim-medium), var(--scrim-transparent))" }}>
        <button
          type="button"
          onClick={() => switchTab("foryou")}
          className="dm-link cursor-pointer text-[16px] font-bold tracking-wide uppercase"
          style={{ fontFamily: "var(--font-body)", color: tab === "foryou" ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          For You
        </button>
        <button
          type="button"
          onClick={() => switchTab("browse")}
          className="dm-link cursor-pointer text-[16px] font-bold tracking-wide uppercase"
          style={{ fontFamily: "var(--font-body)", color: tab === "browse" ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          Browse All
        </button>
        {tab === "browse" && (
          <button
            type="button"
            aria-label="Search"
            aria-pressed={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className="dm-quiet absolute right-4 flex size-9 cursor-pointer items-center justify-center rounded-full border"
            style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: searchOpen ? "var(--primary)" : "var(--foreground)" }}
          >
            <Search className="h-4 w-4" />
          </button>
        )}
        <QuickLinksMenu align="left" className="absolute top-1/2 left-4 -translate-y-1/2 [&>button]:size-9" />
      </div>

      {/* One standard gap between the navbar and page content everywhere
         (space-10); For You fits the viewport with the card centered. */}
      <main
        className={`relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-start px-5 md:px-[var(--space-14)] md:pt-[var(--space-10)] ${
          tab === "browse"
            ? "gap-[var(--space-10)] pt-[72px] pb-[120px]"
            : "gap-[var(--space-6)] pt-[64px] pb-0 md:h-[calc(100dvh-62px)] md:overflow-hidden md:pb-[var(--space-6)]"
        }`}
      >
        {/* Explore Header (desktop) */}
        <div className="hidden w-full flex-col gap-[var(--space-6)] md:flex">
          <div className="flex w-full items-center justify-between gap-[var(--space-6)]">
            <h1 className="text-[32px] leading-[38px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Explore
            </h1>
            <div className="flex min-w-0 items-center gap-[var(--space-6)]">
              {/* Search grows from icon to input; the toggle folds away while
                 it is open. */}
              <div
                className="flex h-10 min-w-0 items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border px-[var(--space-3)] backdrop-blur-[10px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: searchOpen ? "min(480px, 44vw)" : 40,
                  background: searchOpen ? "var(--glass-surface-1)" : "var(--glass-surface-2)",
                  borderColor: searchOpen ? "var(--primary)" : "var(--glass-border)",
                }}
              >
                <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="dm-link flex flex-none cursor-pointer items-center" style={{ color: searchOpen ? "var(--muted-foreground)" : "var(--foreground)" }}>
                  <Search className="h-4 w-4" />
                </button>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search careers, skills, worlds..."
                  aria-hidden={!searchOpen}
                  tabIndex={searchOpen ? 0 : -1}
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] transition-opacity duration-200 placeholder:text-[color:var(--muted-foreground)]"
                  style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? "auto" : "none" }}
                />
                {searchOpen && (
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => (query ? setQuery("") : setSearchOpen(false))}
                    className="dm-quiet flex h-7 flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-2"
                    style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {/* Toggle collapses while search is open */}
              <div
                className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ maxWidth: searchOpen ? 0 : 320, opacity: searchOpen ? 0 : 1, pointerEvents: searchOpen ? "none" : "auto" }}
              >
                <ForYouBrowseToggle tab={tab} onTab={switchTab} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search input (the desktop header is hidden below md) */}
        {tab === "browse" && searchOpen && (
          <div
            className="filters-reveal flex h-12 w-full items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border px-[var(--space-4)] backdrop-blur-[10px] md:hidden"
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--primary)" }}
          >
            <Search className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search careers, skills, worlds..."
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] placeholder:text-[color:var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
            />
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => (query ? setQuery("") : setSearchOpen(false))}
              className="dm-quiet flex h-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-2"
              style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {tab === "browse" ? <BrowseFace query={query} filtersOpen={searchOpen} /> : <ForYouFace />}
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
