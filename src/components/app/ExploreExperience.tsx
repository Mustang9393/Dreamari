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
  FOR_YOU_REEL,
  type CatalogCareer,
  type ReelCareer,
} from "./catalog";
import { WORLD_LABELS } from "./worlds";
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
          className="cursor-pointer rounded-[var(--radius-md-alt)] px-[var(--space-4)] py-[6px] text-[13px] leading-[18px] font-bold uppercase"
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
  return (
    <>
      {careers.map((career, index) => (
        <PosterCard key={`${career.title}-${index}`} career={career} />
      ))}
    </>
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
      className="flex-none cursor-pointer rounded-[100px] border px-[14px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap transition-colors"
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
        <section aria-label="Top 5 Trending Careers Among Gen Z" className="flex w-full flex-col gap-[20px]">
          <h2 className="text-[22px] leading-[28px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
            Top 5 Trending Careers Among Gen Z
          </h2>
          <div className="-mx-5 flex gap-[24px] overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-[var(--space-14)] md:gap-[57px] md:px-[var(--space-14)]" style={{ touchAction: "pan-x pan-y" }}>
            {trending.map((career) => (
              <RankedPosterCard key={career.title} career={career} rank={BROWSE_TRENDING.indexOf(career) + 1} />
            ))}
          </div>
        </section>
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

      {/* Mobile-only in-card preference rail (desktop keeps it beside the card) */}
      <div className="absolute top-1/2 right-4 z-[2] flex -translate-y-1/2 flex-col gap-[var(--space-6)] md:hidden">
        <PreferenceButton label="Like this career" Icon={Heart} bare />
        <PreferenceButton label="Not for me" Icon={ThumbsDown} bare />
        <PreferenceButton label="Save for later" Icon={Bookmark} bare />
      </div>

      <div className="relative z-[1] flex flex-col gap-[var(--space-4)] pb-[64px] md:pb-0">
        {/* Career Details Panel (Figma 2486:43002): two faces sharing one
           geometry — tap flips Summary <-> Details (major + main skills). */}
        <button
          type="button"
          aria-label={face === "Summary" ? "Show more info" : "Show summary"}
          onClick={() => setFace((current) => (current === "Summary" ? "Details" : "Summary"))}
          className="flex w-fit max-w-full cursor-pointer flex-col gap-[var(--space-4)] rounded-[var(--radius-2xl)] p-[var(--space-4)] text-left"
          style={{ background: "var(--scrim-heavy)" }}
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

        <div className="flex w-full items-stretch justify-between gap-[var(--space-3)]">
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)]"
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}
          >
            <span className="text-[16px] leading-[22px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--secondary-foreground)" }}>
              Play Game
            </span>
            <Play aria-hidden className="h-4 w-4" style={{ color: "var(--secondary-foreground)" }} />
          </button>
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]"
            style={{ background: "var(--foreground)" }}
          >
            <span className="text-[16px] leading-[22px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--background)" }}>
              More Info
            </span>
            <Eye aria-hidden className="h-4 w-4" style={{ color: "var(--background)" }} />
          </button>
        </div>
      </div>
    </article>
  );
}

function PreferenceButton({ label, Icon, bare = false }: { label: string; Icon: typeof Heart; bare?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-11 cursor-pointer items-center justify-center rounded-[999px] border transition-transform duration-150 hover:-translate-y-px active:scale-95"
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
  const total = FOR_YOU_REEL.length;
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
        className="foryou-snap fixed inset-0 z-0 overflow-y-auto md:relative md:inset-auto md:z-auto md:h-full md:max-h-[672px] md:w-[390px] md:overflow-y-auto md:rounded-[var(--radius-xl)]"
      >
        {FOR_YOU_REEL.map((career, index) => (
          <div key={career.title} data-reel-index={index} className="h-full w-full snap-start snap-always">
            <EnvCard career={career} active={index === active} />
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
          className="flex size-11 cursor-pointer items-center justify-center rounded-[999px] border disabled:cursor-default disabled:opacity-40"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next career"
          disabled={active >= total - 1}
          onClick={() => step(1)}
          className="flex size-11 cursor-pointer items-center justify-center rounded-[999px] border disabled:cursor-default disabled:opacity-40"
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
    <div className="marketing-v2 relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)", color: "var(--foreground)" }}>

      <DesktopNavigation active="Explore" />

      {/* Mobile top tabs (the mobile frames' "Top Nav Scrim") */}
      <div className="absolute inset-x-0 top-0 z-30 flex h-[56px] items-center justify-center gap-[20px] md:hidden" style={{ background: tab === "browse" ? "transparent" : "linear-gradient(180deg, var(--scrim-medium), var(--scrim-transparent))" }}>
        <button
          type="button"
          onClick={() => switchTab("foryou")}
          className="cursor-pointer text-[16px] font-bold tracking-wide uppercase"
          style={{ fontFamily: "var(--font-body)", color: tab === "foryou" ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          For You
        </button>
        <button
          type="button"
          onClick={() => switchTab("browse")}
          className="cursor-pointer text-[16px] font-bold tracking-wide uppercase"
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
            className="absolute right-4 flex size-9 cursor-pointer items-center justify-center rounded-full border"
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
                <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="flex flex-none cursor-pointer items-center" style={{ color: searchOpen ? "var(--muted-foreground)" : "var(--foreground)" }}>
                  <Search className="h-4 w-4" />
                </button>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search careers, skills, worlds..."
                  aria-hidden={!searchOpen}
                  tabIndex={searchOpen ? 0 : -1}
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none transition-opacity duration-200 placeholder:text-[color:var(--muted-foreground)]"
                  style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? "auto" : "none" }}
                />
                {searchOpen && (
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => (query ? setQuery("") : setSearchOpen(false))}
                    className="flex h-7 flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-2"
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
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none placeholder:text-[color:var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
            />
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => (query ? setQuery("") : setSearchOpen(false))}
              className="flex h-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-2"
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
