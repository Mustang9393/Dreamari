"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, Eye, Heart, Play, Search, ThumbsDown, X } from "lucide-react";
import { DesktopNavigation, MobileNav } from "./chrome";
import { PosterCard, RankedPosterCard } from "./PosterCard";
import {
  BROWSE_BECAUSE_LIKED,
  BROWSE_MIGHT_NOT_KNOW,
  BROWSE_RECOMMENDED,
  BROWSE_TRENDING,
  BROWSE_TYPICAL_PAY,
  BROWSE_WORLD_RAIL,
  FOR_YOU_REEL,
  type CatalogCareer,
  type ReelCareer,
} from "./catalog";
import { WORLD_LABELS } from "./worlds";

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
      <div className="flex gap-[var(--space-6)] overflow-x-auto pb-1 [scrollbar-width:none]">{children}</div>
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

function BrowseFace({ query, filtersOpen }: { query: string; filtersOpen: boolean }) {
  const [world, setWorld] = useState<string>("All");
  const [sortMode, setSortMode] = useState(false);
  const [sort, setSort] = useState<SortOption>("Recommended");

  const pillStyle = (isSelected: boolean) => ({
    fontFamily: "var(--font-body)",
    background: isSelected ? "var(--primary)" : "var(--glass-surface-1)",
    borderColor: isSelected ? "var(--primary)" : "var(--glass-border)",
    color: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
  });

  return (
    <>
      {/* Filter row — revealed by the search button: world pills + Sort by;
         tapping Sort by swaps the row to sort pills. */}
      {filtersOpen && (
        <div className="flex w-full items-start gap-[8px]">
          <div className="flex min-w-0 flex-1 gap-[8px] overflow-x-auto pb-1 [scrollbar-width:none]">
            {sortMode
              ? SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={sort === option}
                    onClick={() => setSort(option)}
                    className="flex-none cursor-pointer rounded-[100px] border px-[14px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap"
                    style={pillStyle(sort === option)}
                  >
                    {option}
                  </button>
                ))
              : WORLD_LABELS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={world === label}
                    onClick={() => setWorld(label)}
                    className="flex-none cursor-pointer rounded-[100px] border px-[14px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap"
                    style={pillStyle(world === label)}
                  >
                    {label}
                  </button>
                ))}
          </div>
          <button
            type="button"
            aria-pressed={sortMode}
            onClick={() => setSortMode((value) => !value)}
            className="flex flex-none cursor-pointer items-center gap-[6px] rounded-[14px] border px-[12px] py-[6px] text-[13px]"
            style={{
              background: sortMode ? "var(--primary)" : "var(--glass-surface-1)",
              borderColor: sortMode ? "var(--primary)" : "var(--glass-border)",
              color: sortMode ? "var(--primary-foreground)" : "var(--foreground)",
              fontFamily: "var(--font-body)",
            }}
          >
            <span aria-hidden className="text-[12px]">↕</span>
            <span className="font-medium">{sortMode ? "Filters" : "Sort by"}</span>
          </button>
        </div>
      )}

      <Rail title="Recommended for You" subtitle="A mix across your Industry Interests">
        <PosterRail careers={applyCatalogView(BROWSE_RECOMMENDED, world, query, sort)} />
      </Rail>

      <Rail title="Because You Liked Business & Money">
        <PosterRail careers={applyCatalogView(BROWSE_BECAUSE_LIKED, world, query, sort)} />
      </Rail>

      <section aria-label="Top 5 Trending Careers Among Gen Z" className="flex w-full flex-col gap-[20px]">
        <h2 className="text-[22px] leading-[28px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
          Top 5 Trending Careers Among Gen Z
        </h2>
        <div className="flex gap-[57px] overflow-x-auto pb-1 [scrollbar-width:none]">
          {applyCatalogView(BROWSE_TRENDING, world, query, sort).map((career) => (
            <RankedPosterCard key={career.title} career={career} rank={BROWSE_TRENDING.indexOf(career) + 1} />
          ))}
        </div>
      </section>

      {/* Section header is the frame's own (its rail carries the farming +
         building set in the design; ported verbatim). */}
      <Rail title="Tech & Engineering">
        <PosterRail careers={applyCatalogView(BROWSE_WORLD_RAIL, world, query, sort)} />
      </Rail>

      <Rail title="Careers You Might Not Know">
        <PosterRail careers={applyCatalogView(BROWSE_MIGHT_NOT_KNOW, world, query, sort)} />
      </Rail>

      <Rail title="Typical Pay: $100K +">
        <PosterRail careers={applyCatalogView(BROWSE_TYPICAL_PAY, world, query, sort)} />
      </Rail>
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

function EnvCard({ career }: { career: ReelCareer }) {
  return (
    <article
      className="relative flex h-full w-full flex-col justify-end gap-[var(--space-6)] overflow-hidden border p-[var(--space-4)] md:h-[672px] md:w-[390px] md:rounded-[var(--radius-xl)]"
      style={{ borderColor: "var(--glass-surface-2)", background: "var(--background)" }}
    >
      <Image src={career.photo} alt="" fill sizes="(max-width: 768px) 100vw, 390px" className="object-cover md:rounded-[var(--radius-xl)]" priority draggable={false} />

      {/* Mobile-only in-card preference rail (desktop keeps it beside the card) */}
      <div className="absolute top-1/2 right-4 z-[2] flex -translate-y-1/2 flex-col gap-[var(--space-6)] md:hidden">
        <PreferenceButton label="Like this career" Icon={Heart} bare />
        <PreferenceButton label="Not for me" Icon={ThumbsDown} bare />
        <PreferenceButton label="Save for later" Icon={Bookmark} bare />
      </div>

      <div className="relative z-[1] flex flex-col gap-[var(--space-4)] pb-[64px] md:pb-0">
        <div className="flex w-fit max-w-full flex-col gap-[var(--space-4)] rounded-[var(--radius-2xl)] p-[var(--space-4)]" style={{ background: "var(--scrim-heavy)" }}>
          <div className="flex w-full flex-col gap-[var(--space-2)] md:w-[326px]">
            <div className="flex items-start justify-between gap-[var(--space-2)]">
              <span className="text-[10px] leading-[14px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted-alt)" }}>
                {career.matchLabel}
              </span>
              <span aria-hidden className="flex items-center">
                <span className="mx-[2px] h-[5px] w-[5px] rounded-full" style={{ background: "var(--foreground)" }} />
                <span className="mx-[2px] h-[5px] w-[5px] rounded-full border" style={{ borderColor: "var(--muted-foreground)" }} />
              </span>
            </div>
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
          </div>
        </div>

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
  const [index, setIndex] = useState(0);
  const total = FOR_YOU_REEL.length;
  const career = FOR_YOU_REEL[Math.min(index, total - 1)];
  const touchStartY = useRef<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => Math.max(0, Math.min(total - 1, current + delta)));
    },
    [total],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowDown") step(1);
      if (event.key === "ArrowUp") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div
      className="relative flex w-full items-center justify-center gap-[10px]"
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0].clientY;
      }}
      onTouchEnd={(event) => {
        if (touchStartY.current === null) return;
        const delta = touchStartY.current - event.changedTouches[0].clientY;
        if (Math.abs(delta) > 60) step(delta > 0 ? 1 : -1);
        touchStartY.current = null;
      }}
    >
      <div className="fixed inset-0 z-0 md:relative md:inset-auto md:z-auto md:h-[672px] md:w-[390px]">
        <EnvCard career={career} />
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
          disabled={index === 0}
          onClick={() => step(-1)}
          className="flex size-11 cursor-pointer items-center justify-center rounded-[999px] border disabled:cursor-default disabled:opacity-40"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next career"
          disabled={index >= total - 1}
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
    <div className="marketing-v2 relative min-h-dvh w-full" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <img alt="" src="/images/app/background-space-explore.svg" className="pointer-events-none absolute top-0 left-0 h-[3355px] w-full max-w-none object-cover" />

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
      </div>

      <main className={`relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-start gap-[var(--space-10)] px-5 pb-[120px] md:px-[var(--space-14)] ${tab === "browse" ? "pt-[72px] md:pt-[var(--space-14)]" : "pt-[64px] md:pt-[72px]"}`}>
        {/* Explore Header (desktop) */}
        <div className="hidden w-full flex-col gap-[var(--space-6)] md:flex">
          <div className="flex w-full items-center justify-between gap-[var(--space-6)]">
            <h1 className="text-[32px] leading-[38px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Explore
            </h1>
            <div className="flex items-center gap-[var(--space-6)]">
              {searchOpen ? (
                <div
                  className="flex h-12 w-[480px] items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border px-[var(--space-4)] backdrop-blur-[10px]"
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
              ) : (
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-12 cursor-pointer items-center rounded-[999px] border px-[var(--space-4)] backdrop-blur-[10px]"
                  style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
              <ForYouBrowseToggle tab={tab} onTab={switchTab} />
            </div>
          </div>
        </div>

        {/* Mobile search input (the desktop header is hidden below md) */}
        {tab === "browse" && searchOpen && (
          <div
            className="flex h-12 w-full items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] border px-[var(--space-4)] backdrop-blur-[10px] md:hidden"
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
