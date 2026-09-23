"use client";

 

import Image from "next/image";
import { motion, useMotionValue, animate as animateValue } from "framer-motion";
import { BorderBeam } from "border-beam";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { FirstVisitSplash } from "@/components/app/WelcomeSplash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, GraduationCap, Heart, Minus, Plus, Search, ThumbsDown, Volume2, VolumeX, X } from "lucide-react";
import { useDiscoveryNudge } from "@/lib/nudge";
import { useSavedCareers } from "@/lib/savedCareers";
import { useTop3 } from "@/lib/useTop3";
import type { Picks } from "@/lib/picks";
import { Top3SwapModal } from "@/components/career/Top3SwapModal";
import { Toast } from "@/components/app/Toast";
import { UndoToast } from "@/components/app/UndoToast";
import { useFirstUseHint, Coachmark } from "@/components/flow/GestureSpotlight";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, ExploreSectionTabs, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "./chrome";
import { HeaderActions } from "./Inbox";
import { PosterCard, RankedPosterCard } from "./PosterCard";
import { IconTip } from "@/components/app/IconTip";

import { CompanyVideoCards } from "./CompanyVideoCards";
import {
  ALL_CATALOG_CAREERS,
  BROWSE_ARTS,
  BROWSE_BECAUSE_LIKED,
  BROWSE_MIGHT_NOT_KNOW,
  BROWSE_PUBLIC_SERVICE,
  BROWSE_TRADES,
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
import { relatedTerms, searchCareers, TOP_SEARCHES, type SearchHit } from "./careerSearch";
import { careerSlug } from "@/components/career/slug";
import { simulationFor } from "@/components/play/games";
import "./app.css";

// Explore, both faces of the Figma design:
//  - "For You" (Explore — v2.1B, 2288:16179): the Env Card reel with the
//    Desktop Career Preference Rail beside it and Previous/Next paging.
//  - "Browse All" (Explore-Browse, 3185:17011): search, world filter pills,
//    Sort by, and six career rails ported section by section.

// This pill answers one question -- what's shown within Careers -- so
// Colleges (a different section entirely) doesn't live here; it sits as its
// own text-tab strip under the page title instead (ExploreSectionTabs,
// chrome.tsx). Was folded into this pill as a third stop briefly (8 Sept
// 2026), then split back out: two full-weight controls side by side read as
// clutter, but so did stacking three unrelated questions into one pill. Kept
// as a pill deliberately (9 Sept 2026) once Careers/Schools became a text
// tab strip of its own -- reserving the pill shape for this local, same-page
// toggle keeps it visually distinct from that page-level section switch.
// The label nudges the student toward For You the whole time they're on
// Browse: a light sweep across the words "For you" every few seconds, on
// the text only, no tint or beam on the pill (direct feedback, 19 Sept
// 2026: "only on the text", "not too much that they ignore Browse All").
// Browse is the landing view, so without this For you would sit unnoticed.
// Originally a one-visit-and-done nudge (a localStorage flag retired it for
// good after the first trip to For You), but the flag meant returning
// students who'd already visited once stopped seeing it at all -- changed
// to run constantly while on Browse, every visit (direct feedback, 22 Sept
// 2026: "especially when I'm in browse all this should show constantly").
export function useForYouNudge(tab: "foryou" | "browse"): boolean {
  return tab === "browse";
}

export function ForYouBrowseToggle({
  tab,
  onTab,
  nudge = false,
  showTutorial = false,
  onDismissTutorial,
}: {
  tab: "foryou" | "browse";
  onTab: (tab: "foryou" | "browse") => void;
  /** text sweep on For you until first opened */
  nudge?: boolean;
  /** One-time "try the reel" coachmark, pointed at the For you label. Only
      ever true while landing on Browse All -- see ExploreExperience's own
      showForYouTutorial. */
  showTutorial?: boolean;
  onDismissTutorial?: () => void;
}) {
  const forYouRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
    {/* Boxed pill only from `lg:` on -- this same component also renders on
       top of the reel's photo at every width below that (mobile AND
       tablet), where the pill/border read as extra chrome over the image.
       Restored to Instagram's own convention there: plain text, weight and
       brightness carrying the selected state, a text-shadow for legibility
       instead of a surface (direct instruction, 23 Sept 2026: "restored to
       what it was for mobile before... just text like instagram with a
       subtle scrim and shadows"). `lg:` still gets the bordered glass pill,
       since that version sits in a normal page header, not over a photo. */}
    <div className="flex items-center gap-[var(--space-4)] lg:gap-[var(--space-1)] lg:rounded-[var(--radius-lg)] lg:border lg:border-[color:var(--glass-border)] lg:bg-[color:var(--glass-surface-1)] lg:p-[var(--space-1)]">
      {(
        [
          { key: "foryou", label: "For you" },
          { key: "browse", label: "Browse All" },
        ] as const
      ).map((item) => {
        const on = tab === item.key;
        return (
          <button
            key={item.key}
            ref={item.key === "foryou" ? forYouRef : undefined}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (item.key === "foryou") onDismissTutorial?.();
              onTab(item.key);
            }}
            className={`dm-quiet cursor-pointer rounded-[var(--radius-md)] text-[15px] leading-[20px] font-bold whitespace-nowrap uppercase [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] lg:px-[var(--space-4)] lg:py-[6px] lg:text-[13px] lg:leading-[18px] lg:[text-shadow:none] ${
              on
                ? "text-white lg:bg-[color:var(--primary)] lg:text-[color:var(--primary-foreground)]"
                // the unselected label is muted so the nudge's white sweep has
                // something to travel over (direct feedback, 19 Sept 2026)
                : "text-white/65 lg:bg-transparent lg:text-[color:var(--muted-foreground)]"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className={`relative ${item.key === "foryou" && nudge ? "dm-text-nudge" : ""}`}>
              {item.label}
              {/* Two sparkles, not one -- a matched pair bookending the
                 sweep (direct feedback, 24 Sept 2026: "so its not just one
                 sparkle shape") reads livelier than a single corner twinkle.
                 The smaller one at the start is offset later in the loop so
                 they don't blink in lockstep. */}
              {item.key === "foryou" && nudge && (
                <>
                <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark pointer-events-none absolute -top-[7px] -right-[9px] h-[9px] w-[9px]">
                  <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="#FFFFFF" />
                </svg>
                <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark pointer-events-none absolute -top-[5px] -left-[7px] h-[6px] w-[6px]" style={{ animationDelay: "1.4s" }}>
                  <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="#FFFFFF" />
                </svg>
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
    {tab === "browse" && (
      <Coachmark
        active={showTutorial}
        targetRef={forYouRef}
        label="Prefer scrolling? Check out For You! It's basically your own career reel, picked just for you."
        onDismiss={() => onDismissTutorial?.()}
        cta="Next"
        spotlight
      />
    )}
    </>
  );
}

// Cards on Explore's Browse tab (every Rail, plus TrendingRail's own row
// below) scale down together on phones -- gaps, padding, photos, everything
// in one CSS zoom, the same technique the Schools landing page's `Fit` uses
// -- so the rail reads proportioned to a phone instead of just squeezing a
// desktop-sized row into a narrower scroller (direct feedback, 11 Sept
// 2026: "scale down the cards etc proportionally... especially in explore
// page"). See `.explore-poster-row` in globals.css; Home's own poster-row
// rails are untouched.
function Rail({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex w-full flex-col gap-[var(--space-3)]">
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
      {/* md:px-[space-6], not [space-14]: the rail's own inset is
         deliberately SHORTER than the page's title/content margin, so
         cards bleed past that margin line and the trailing card peeks at
         the edge instead of stopping flush with it (direct feedback, 22
         Sept 2026: "cards should not get clipped... let them exceed the
         limits and peek through"). Still fully symmetric left/right --
         the "margins not consistent" report traced to card rows not
         evenly filling their track, not an actual left/right CSS
         mismatch (measured: both sides resolve to the same inset). */}
      <div className="poster-row explore-poster-row -mx-5 flex gap-[var(--space-6)] overflow-x-auto px-5 py-5 [scrollbar-width:none] md:-mx-[var(--space-14)] md:px-[var(--space-6)]" style={{ touchAction: "pan-x pan-y" }}>{children}</div>
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
    <section aria-label="Top 5 Trending Careers Among Gen Z" className="flex w-full flex-col gap-[var(--space-3)]">
      <h2 className="text-[22px] leading-[28px] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
        Top 5 Trending Careers Among Gen Z
      </h2>
      <div className="poster-row explore-poster-row -mx-5 flex gap-[24px] overflow-x-auto px-5 py-5 [scrollbar-width:none] md:-mx-[var(--space-14)] md:gap-[57px] md:px-[var(--space-6)]" style={{ touchAction: "pan-x pan-y" }}>
        {trending.map((career, index) => (
          <RankedPosterCard key={career.title} career={career} rank={index + 1} onClick={() => router.push(`/career/${careerSlug(career.title)}`)} />
        ))}
      </div>
    </section>
  );
}

const SORT_OPTIONS = ["Recommended", "A-Z", "Salary"] as const;
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

/** Netflix's search page: "Explore careers related to" chips built from
 *  what the results share, then the ranked grid; a no-match state that
 *  offers the top searches instead of a dead end. */
function SearchResults({ query, hits, onQuery, heading }: { query: string; hits: SearchHit[]; onQuery: (q: string) => void; /** a world's name when the grid is a filter, not a search */ heading?: string }) {
  const router = useRouter();
  const related = query.trim() ? relatedTerms(query, hits) : [];
  return (
    <section className="flex w-full flex-col gap-[var(--space-5)]" aria-live="polite">
      {related.length > 0 && (
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>Explore careers related to:</span>
          {related.map((t) => <FilterPill key={t} label={t} selected={false} onClick={() => onQuery(t)} />)}
        </div>
      )}
      {hits.length > 0 ? (
        <>
          <h2 className="text-[20px] leading-[24px] font-extrabold sm:text-[22px] sm:leading-[26px]" style={{ fontFamily: "var(--font-display)" }}>
            {heading ?? <>Results for “{query.trim()}”</>} <span className="text-[15px] font-bold sm:text-[16px]" style={{ color: "var(--muted-foreground)" }}>({hits.length})</span>
          </h2>
          {/* a grid that fills the width: as many columns as fit, cards
             stretching to share the row, instead of fixed 210px posters
             clustering at the left (direct feedback, 19 Sept 2026).
             Custom-designed edge case, 22 Sept 2026: `auto-fill` reserves
             a full row of equal-width tracks even when only 1-2 results
             exist (Food & Cooking, Teaching & Education: 1 career each;
             Science & Research: 2) -- a small card pinned left with dead,
             unexplained empty tracks stretching the rest of the row.
             `auto-fit` collapses tracks with no content, so the real
             card(s) get the freed space instead -- same "stretch to
             share the row" behavior already requested above, just
             correctly extended to a row that only has 1-2 cards to
             share it. */}
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[var(--space-4)] sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-[var(--space-5)]">
            {hits.map(({ career }) => <PosterCard key={career.title} career={career} fill onClick={() => router.push(`/career/${careerSlug(career.title)}`)} />)}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-[var(--space-4)] py-[var(--space-6)]">
          <p className="text-[17px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)" }}>No careers match “{query.trim()}”.</p>
          <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Try a career, a world like Arts or Finance, or something you like doing, like drawing or coding.</p>
          <TopSearches onQuery={onQuery} />
        </div>
      )}
    </section>
  );
}

function TopSearches({ onQuery }: { onQuery: (q: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>Top searches:</span>
      {TOP_SEARCHES.map((t) => <FilterPill key={t} label={t} selected={false} onClick={() => onQuery(t)} />)}
    </div>
  );
}

function BrowseFace({ query, filtersOpen, onQuery }: { query: string; filtersOpen: boolean; onQuery: (q: string) => void }) {
  const [world, setWorld] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("Recommended");

  // When the search (and with it the pill rows) is closed, the catalog view
  // derives back to unfiltered — nothing stays silently filtered; reopening
  // restores the previous selection.
  const effectiveWorld = filtersOpen ? world : "All";
  const effectiveSort: SortOption = filtersOpen ? sort : "Recommended";
  // A typed query becomes the search page (Netflix): one ranked grid across
  // the whole catalog, not seven rails each losing most of their cards.
  const searching = query.trim().length > 0;
  // a world pill with nothing typed is a filter: the whole world as a grid,
  // sorted like the rails, instead of seven rails each losing most cards
  const worldOnly = !searching && effectiveWorld !== "All";
  const hits: SearchHit[] = searching
    ? searchCareers(query, effectiveWorld)
    : worldOnly ? applyCatalogView(ALL_CATALOG_CAREERS, effectiveWorld, "", effectiveSort).map((career) => ({ career, score: 0 })) : [];
  const view = (careers: CatalogCareer[]) => applyCatalogView(careers, effectiveWorld, "", effectiveSort);
  const becauseLiked = view(BROWSE_BECAUSE_LIKED);
  const trades = view(BROWSE_TRADES);
  // Custom-designed edge case, 22 Sept 2026: the Sort control (A-Z/Salary)
  // was applied here through `view()` same as every other rail, but this
  // one carries rank badges (#1..#5) tied to BROWSE_TRENDING's own curated
  // order -- picking a sort re-ordered the cards while the heading and
  // badges kept claiming "#1 trending", mislabeling whatever the sort put
  // first. World filter still applies (trending WITHIN a world is a
  // reasonable question); sort never does, since the rank badges are the
  // whole point of this rail.
  const trending = applyCatalogView(BROWSE_TRENDING, effectiveWorld, "", "Recommended");
  const worldRail = view(BROWSE_WORLD_RAIL);
  const mightNotKnow = view(BROWSE_MIGHT_NOT_KNOW);
  const typicalPay = view(BROWSE_TYPICAL_PAY);
  const publicService = view(BROWSE_PUBLIC_SERVICE);
  // Arts, Media & Sport: one row, at the bottom of the page only (direct
  // feedback, 19 Sept 2026: no second appearance near the top, no "New in").
  // The full world, not just the poster-library additions.
  const arts = view(BROWSE_ARTS);

  return (
    <>
      {/* Search reveals the whole filter block: the world pills row scrolls
         edge-to-edge, and the sort row sits beneath it — filter and sort
         work together, no mode switching. */}
      {filtersOpen && (
        <div className="filters-reveal flex w-full flex-col gap-[var(--space-3)]">
          <div
            className="-mx-5 flex gap-[8px] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] md:-mx-[var(--space-14)] md:px-[var(--space-14)]"
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

      {filtersOpen && !searching && !worldOnly && <TopSearches onQuery={onQuery} />}
      {searching && <SearchResults query={query} hits={hits} onQuery={onQuery} />}
      {worldOnly && <SearchResults query="" heading={effectiveWorld} hits={hits} onQuery={onQuery} />}

      {!searching && !worldOnly && (
      <>
      {/* Rail order + content per Joshua (2026-08-21): merged recommended
         rail, then Tech, Top 5, Might Not Know, Skilled Trades (added 11
         Sept 2026), Videos, Public Service (added 21 Sept 2026), Typical
         Pay. `contents` keeps
         this div out of main's flex layout (the rails still lay out as if
         they were main's own direct children) while giving seq-reveal
         something to stagger the rails' entrance from off of. */}
      <div className="seq-reveal contents">
        {becauseLiked.length > 0 && (
          <Rail title="Recommended Because You Liked Business & Finance">
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

        {/* Trades row (Slack, 11 Sept 2026): its own row, directly above
           Typical Pay per the user, and trades are also mixed into the rows
           above so they read as equal to everything else on the page. */}
        {trades.length > 0 && (
          <Rail title="Skilled Trades">
            <PosterRail careers={trades} />
          </Rail>
        )}

        {/* CEO (4 Sept 2026): real clips from inside partner companies.
           Moved directly above Typical Pay (Joshua, 11 Sept 2026), in the
           Apple TV lean-back card shape; the lead card plays muted. */}
        <Rail title="Videos Inside Leading Companies">
          <CompanyVideoCards />
        </Rail>

        {/* Public Service (Slack, 21 Sept 2026): its own row, directly above
           Typical Pay, not folded into it -- these are civic/public-sector
           careers, not a pay tier. */}
        {publicService.length > 0 && (
          <Rail title="Public Service Careers">
            <PosterRail careers={publicService} />
          </Rail>
        )}

        {typicalPay.length > 0 && (
          <Rail title="Typical Pay: $100K +">
            <PosterRail careers={typicalPay} />
          </Rail>
        )}
        {arts.length > 0 && (
          <Rail title="Arts, Media & Sport">
            <PosterRail careers={arts} />
          </Rail>
        )}
      </div>
      </>
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
  if (sort === "A-Z") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "Salary") {
    const value = (career: CatalogCareer) => (career.salary ? parseInt(career.salary.replace(/\D/g, ""), 10) : -1);
    list = [...list].sort((a, b) => value(b) - value(a));
  }
  return list;
}

// Most of these photos are wide landscape exports with the subject off to
// one side (a desk scene, other people in frame), but the card crops them
// into a narrow portrait via object-cover -- centered by default. When the
// subject sits well off-center in the source, a dead-center crop can clip
// straight through them. Same fix, same idea as Career Detail's own
// HERO_FOCUS. Empty for now: every entry that needed one (Product Designer,
// Creative Director) has since been swapped to a Browse asset already
// centered close enough that the default crop works -- kept as a live map
// rather than deleted, since the next off-center photo swap will need it
// again.
const REEL_PHOTO_FOCUS: Record<string, string> = {};

// A flat blur/scrim can't guarantee contrast against every photo -- a light
// wall or window behind the panel's least-blurred (top) edge washes out
// even white text. A dark drop shadow is background-independent: it reads
// against light AND dark photo content, unlike picking a single text color.
// Lightened to one soft layer, not two stacked ones -- ProgressiveBlur's own
// dark tint (below) now carries more of this job, so the shadow doesn't have
// to (direct instruction, 23 Sept 2026: "don't make it look like we
// overindexed on shadows").
const LEGIBLE_TEXT_SHADOW = "0 1px 3px rgba(0,0,0,0.55)";

// Shared by the autoplay timer and the progress track's own fill animation
// duration below, so the two can never drift apart.
const AUTOPLAY_MS = 6000;

// Same literal keys as CareerDetailExperience.tsx's own LIKE_TIP_KEY /
// DISLIKE_TIP_KEY / TOP3_TIP_KEY -- whichever surface (this reel or Career
// Detail) a student explains an action on first is the only one that ever
// shows the explanatory copy again. Small helpers duplicated per file
// rather than shared, matching this codebase's existing convention for
// this exact pattern.
const LIKE_TIP_KEY = "dreamari-seen-like-tip";
const DISLIKE_TIP_KEY = "dreamari-seen-dislike-tip";
const TOP3_TIP_KEY = "dreamari-seen-top3-tip";
function tipSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function markTipSeen(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* private mode */
  }
}
function top3AddedToast(): string {
  if (tipSeen(TOP3_TIP_KEY)) return "Added to your Top 3";
  markTipSeen(TOP3_TIP_KEY);
  return "Added to your Top 3. You can swap or remove picks anytime.";
}

function EnvCard({
  career,
  active,
  liked,
  disliked,
  onSetLiked,
  onSetDisliked,
  showActionsHint,
  onDismissActionsHint,
}: {
  career: ReelCareer;
  active: boolean;
  liked: boolean;
  disliked: boolean;
  onSetLiked: (next: boolean) => void;
  onSetDisliked: (next: boolean) => void;
  showActionsHint: boolean;
  onDismissActionsHint: () => void;
}) {
  const [face, setFace] = useState<"Summary" | "Details">("Summary");
  // Tracks a genuine manual flip (tap, swipe, or chevron), separate from an
  // autoplay-driven one -- only a manual one marks the discovery nudge seen
  // (direct instruction, 23 Sept 2026: someone who's never touched a card
  // yet should still see the nudge even if autoplay has already flipped it
  // for them once).
  const [hasInteracted, setHasInteracted] = useState(false);
  const nudge = useDiscoveryNudge("dreamari:foryou-flip-nudge", hasInteracted);
  const router = useRouter();
  const slug = careerSlug(career.title);
  // Confirmed live bug (engineer feedback, 20 Sept 2026): this button had no
  // onClick and no check, so it showed "Play Game" on every card even for
  // careers with no simulation built -- only the career detail page's own
  // Play button was gated on this. Same hasSimulation check as that page.
  const hasSimulation = !!simulationFor(slug);

  // Wires the same 4 actions Career Detail already has (survey feedback, 23
  // Sept 2026: "is there a way I can 'unsave' careers within the 'For
  // you'?", "I was not clear if I could... add to my Top 3, but then I
  // didn't know what to do"). Save and Top 3 read/write the app's real
  // global stores, so they're already in sync with Saved and Career Detail;
  // Like/Not for me mirror Career Detail's own convention of local,
  // per-visit state (never persisted there either).
  const [savedCareers, toggleSavedCareer] = useSavedCareers();
  const saved = savedCareers.has(slug);
  const { ids: top3Ids, addToTop3, confirmSwap, removeFromTop3, restore } = useTop3();
  const inTop3 = top3Ids.includes(slug);
  const [swapCandidate, setSwapCandidate] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [undoRemove, setUndoRemove] = useState<Picks | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  // Auto-advance Summary -> Details once the card has been sitting on
  // Summary for a few seconds -- direct instruction, 23 Sept 2026: "if they
  // auto play the slide thats even better... realistically only though,
  // people need time to read first dont be too fast." 6s is enough to read
  // the two-line description before it moves; only ever advances FORWARD
  // once (the `face !== "Summary"` guard stops it from also auto-reversing
  // or looping), and only while the card is the one actually on screen.
  useEffect(() => {
    if (!active || face !== "Summary") return;
    const t = setTimeout(() => setFace("Details"), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, face]);
  // The progress track's fill animation (below) is keyed on `${face}-
  // ${active}` rather than a separately-tracked counter -- every entry
  // into a face's own timer above corresponds 1:1 to either `face` or
  // `active` changing value (leaving and re-entering a face always passes
  // through `active` going false first), so the key remounts the fill span
  // exactly when the real timer (re)starts, with no extra state needed.
  // Direct instruction: "they can fill up along with the seconds... track
  // progress according to how long they are visible."

  // Real swipe that follows the finger, not just a gesture that resolves
  // to an instant switch at the end -- direct instructions, 23 Sept 2026:
  // first that swipe simply did nothing on a touch device ("only the tiny
  // chevron or auto rotate" worked -- a hand-rolled pointermove/pointerup
  // threshold detector, since removed, could lose the gesture mid-drag to
  // native scrolling), then that a working swipe still wasn't enough: "the
  // slide should move with my finger, not just switch... when i swipe."
  // Framer Motion's own `drag="x"` on the carousel below replaces all of
  // that hand-rolled detection -- it's the one thing actually built to
  // track a live pointer AND hand back a real per-frame offset, which is
  // what makes the panel genuinely follow the finger instead of just
  // firing once past a threshold.
  //
  // `x` is a real MotionValue in PIXELS, not a declarative `animate={{x}}`
  // prop -- direct report, 23 Sept 2026: "i can swipe left on the first
  // slide and it goes and gets stuck, they should snap back... if i swipe
  // the wrong way." A declarative `animate` target that doesn't CHANGE
  // value between renders (e.g. dragging right on Summary, which has
  // nowhere to commit to, so `face` never updates) isn't guaranteed to
  // re-fire the spring after `drag` has been imperatively driving the same
  // motion value -- confirmed live, that's exactly the stuck case. Calling
  // `animateValue(x, target, spring)` directly in `onDragEnd`, every time,
  // regardless of whether `face` changed, removes that ambiguity: there is
  // always an explicit command to move `x` to a real resting position.
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const settleAt = useCallback((next: "Summary" | "Details") => {
    // The track is width:200% of its container (two 50%-wide panels), so
    // half its OWN rendered width in px is exactly one panel's travel
    // distance -- measured live rather than assumed, since the card's
    // real width differs by breakpoint (phone, tablet, the small framed
    // desktop card).
    const panelWidth = (carouselTrackRef.current?.offsetWidth ?? 0) / 2;
    animateValue(x, next === "Summary" ? 0 : -panelWidth, { type: "spring", stiffness: 380, damping: 38 });
  }, [x]);
  useEffect(() => {
    settleAt(face);
  }, [face, settleAt]);
  const flipFace = useCallback(() => {
    setHasInteracted(true);
    setFace((current) => (current === "Summary" ? "Details" : "Summary"));
  }, []);
  const jumpTo = useCallback((next: "Summary" | "Details") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    setFace(next);
  }, []);
  // Committing past this offset (px) counts as a real swipe; anything
  // smaller springs back to whichever face was already showing (dragElastic
  // below is what gives that spring-back its resistance while still
  // dragging).
  const SWIPE_COMMIT_PX = 50;
  const onCarouselDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -SWIPE_COMMIT_PX && face === "Summary") {
      setHasInteracted(true);
      setFace("Details"); // the effect above settles to it
    } else if (info.offset.x > SWIPE_COMMIT_PX && face === "Details") {
      setHasInteracted(true);
      setFace("Summary"); // the effect above settles to it
    } else {
      // short of the commit distance, in either direction -- `face` isn't
      // changing, so the effect above won't re-fire on its own. Explicitly
      // spring back to wherever this face already rests.
      settleAt(face);
    }
  }, [face, settleAt]);

  return (
    <article
      className="relative flex h-full w-full flex-col justify-end gap-[var(--space-6)] overflow-hidden border p-[var(--space-4)] md:rounded-[var(--radius-lg)]"
      style={{ borderColor: "var(--glass-surface-2)", background: "var(--background)" }}
    >
      {/* Env photo: taller-than-card wrapper for parallax (JS translateY),
         slow Ken Burns push-in while the card is the active one. */}
      <div aria-hidden data-parallax className={`absolute inset-x-0 -top-[8%] -bottom-[8%] overflow-hidden will-change-transform ${active ? "env-zoom-active" : ""}`}>
        <Image
          src={career.photo}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 390px"
          className="object-cover"
          style={{ objectPosition: REEL_PHOTO_FOCUS[career.title] ?? "center" }}
          priority={active}
          draggable={false}
        />
      </div>

      {/* Bottom-anchored cluster, bled past the card's own p-4 so both the
         preference row and the blur panel reach the true card edges rather
         than leaving a sharp, unblurred margin inside the border. Preference
         Actions sits directly above the Career Details Panel here (Figma
         3317:15773's own "Main Content Row" stacks them in that order,
         bottom-anchored as a pair) -- NOT pinned to the top of the card,
         which was a misreading of that flex layout the first time around. */}
      <div className="relative -mx-[var(--space-4)] -mb-[var(--space-4)] flex flex-col">
        <div ref={actionsRef} className="flex flex-col items-end gap-[var(--space-4)] px-[var(--space-4)] pb-[var(--space-4)] lg:hidden">
          <PreferenceButton
            label={inTop3 ? "Remove from your Top 3" : "Add to your Top 3"}
            Icon={inTop3 ? Minus : Plus}
            bare
            active={inTop3}
            onClick={() => {
              onDismissActionsHint();
              if (inTop3) {
                setToast(null);
                const before = removeFromTop3(slug);
                setUndoRemove(before);
                return;
              }
              setUndoRemove(null);
              const result = addToTop3(slug);
              if (result === "added") setToast(top3AddedToast());
              else if (result === "full") setSwapCandidate(slug);
            }}
          />
          <PreferenceButton
            label="Like this career"
            Icon={Heart}
            bare
            active={liked}
            filled={liked}
            onClick={() => {
              onDismissActionsHint();
              const next = !liked;
              onSetLiked(next);
              if (next && !tipSeen(LIKE_TIP_KEY)) {
                setUndoRemove(null);
                setToast("Saved to what you like. This helps tailor your matches.");
                markTipSeen(LIKE_TIP_KEY);
              }
            }}
          />
          <PreferenceButton
            label="Not for me"
            Icon={ThumbsDown}
            bare
            active={disliked}
            filled={disliked}
            onClick={() => {
              onDismissActionsHint();
              const next = !disliked;
              onSetDisliked(next);
              if (next && !tipSeen(DISLIKE_TIP_KEY)) {
                setUndoRemove(null);
                setToast("Noted, we'll show you less like this.");
                markTipSeen(DISLIKE_TIP_KEY);
              }
            }}
          />
          <PreferenceButton
            label={saved ? "Saved" : "Save for later"}
            Icon={Bookmark}
            bare
            active={saved}
            filled={saved}
            onClick={() => {
              onDismissActionsHint();
              toggleSavedCareer(slug);
            }}
          />
        </div>
        {swapCandidate && (
          <Top3SwapModal
            incomingId={swapCandidate}
            currentIds={top3Ids}
            onConfirm={(outgoingId) => {
              confirmSwap(outgoingId, swapCandidate);
              setSwapCandidate(null);
              setUndoRemove(null);
              setToast(top3AddedToast());
            }}
            onCancel={() => setSwapCandidate(null)}
          />
        )}
        {undoRemove && (
          <UndoToast message="Removed from your Top 3" onUndo={() => restore(undoRemove)} onClose={() => setUndoRemove(null)} />
        )}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <Coachmark
          active={showActionsHint}
          targetRef={actionsRef}
          label="Like, save, or add a career to your Top 3 — right from here."
          onDismiss={onDismissActionsHint}
          spotlight
        />

        {/* Career Details Panel: the whole block, text through the CTA row,
           sits on ONE continuous backdrop -- not a blurred text panel with
           the buttons floating over raw photo below it. Figma's own effect
           is a "Progressive" background blur, start 2 / end 35 -- CSS has
           no native gradient-radius backdrop-filter, so this is
           approximated with stacked layers at increasing blur, each faded
           in via its own mask band (the standard web technique for this
           effect; every layer samples the same photo independently, and
           the browser composites the overlapping, differently-blurred
           results into a smooth ramp). The bottom-nav clearance (pb-[64px])
           lives INSIDE this panel, not after it -- ProgressiveBlur is
           inset-0 to this div, so that reserved strip reads as more blurred
           scrim, not a band of raw, unblurred photo above the nav bar. */}
        {/* +env(safe-area-inset-bottom): 64px alone undershoots MobileNav's
           true reserved height (56px + its own safe-area padding, ~90px on
           a notched phone) -- a few px of this panel's bottom content was
           sitting under the nav bar on those devices (mobile audit, 9 Sept
           2026). lg:, not md:: MobileNav itself is `lg:hidden` (chrome.tsx),
           so it's still on screen through 1023px -- dropping this clearance
           at md: (768px) left the CTA row sitting behind the fixed nav bar
           on tablet, unreachable (direct report, 23 Sept 2026: "Ctas are
           hidden behind the bottom navbar on tablet"). */}
        <div className="relative flex flex-col pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
          <ProgressiveBlur />
          <div className="relative z-[1] flex w-full flex-col gap-[var(--space-3)] p-[var(--space-4)]">
            {/* The tap-to-flip Summary <-> Details interaction wraps only the
               text -- Figma's own mockup nests it inside the same panel as
               the CTA buttons below, so this stays its own element, just
               sharing the panel's single backdrop and padding rather than
               owning a separate one. Gap to the CTA row below tightened from
               space-4 to space-2 -- the two read as one connected block in
               Figma, not a title card with buttons stapled on well below it.
               A `<div role="button">`, not a real `<button>`, now that the
               chevrons below are real buttons of their own -- a `<button>`
               can't contain another `<button>` (direct instruction, 23 Sept
               2026: real swipe AND click-able chevrons, not just tap). */}
            <div
              className="flex w-full flex-col gap-[var(--space-2)] text-left"
              style={{ textShadow: LEGIBLE_TEXT_SHADOW }}
            >
              {/* lg:, not md: -- this 326px cap is for the small FRAMED
                 desktop card specifically. The reel's own full-bleed
                 immersive layout was widened from a md: gate to lg: on 22
                 Sept 2026 (so tablet got the same phone treatment as
                 mobile), but this width cap was never updated to match --
                 tablet (768-1023px) inherited a fixed 326px-wide, left-
                 aligned panel inside a card that's actually the tablet's
                 full viewport width, so most of the swipeable carousel sat
                 off in dead space past 326px and clipped/"disappeared"
                 partway through a drag (direct report, 23 Sept 2026:
                 "swiping breaks on tablet... clips off... disappears into
                 space because the container is small and left aligned"). */}
              <div className="face-swap flex w-full flex-col gap-[var(--space-2)] lg:w-[326px]">
                {/* Swipe/autoplay row: a short, fixed-width progress track
                   (not a full-width bar -- that reads as a page-level
                   control) with quiet chevrons grouped tight around it, all
                   pinned to the FAR LEFT -- as far as the panel allows from
                   Like / Not for me / Save, which live in their own row
                   above this whole panel, untouched (direct instruction, 23
                   Sept 2026: keep the action buttons exactly where they are;
                   chevrons must sit "farthest away" from them). Each
                   segment's own fill animates in real time over
                   AUTOPLAY_MS while ITS face is the active one -- not a
                   flat full/empty split -- so it visibly counts down to the
                   auto-advance instead of just marking a static position
                   (direct instruction: "they can fill up along with the
                   seconds... track progress according to how long they are
                   visible"). Chevrons sized up below `lg:` (32px, not 16px)
                   so they're an actual tappable target on a tablet, not
                   just a decorative arrow (direct instruction: "the
                   chevrons can maybe be bigger on tablet too so i can tap
                   them") -- `lg:` keeps the tight desktop size, a mouse
                   doesn't need the extra hit area. */}
                <div className="relative flex items-center gap-[9px]">
                  <button
                    type="button"
                    aria-label="Previous: summary"
                    onClick={jumpTo("Summary")}
                    className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full lg:size-4"
                    style={{ color: face === "Summary" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)" }}
                  >
                    <ChevronLeft className="h-4 w-4 lg:h-3 lg:w-3" aria-hidden />
                  </button>
                  <span aria-hidden className="flex w-[34px] gap-[3px]">
                    <span className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.22)" }}>
                      {face === "Summary" ? (
                        <span key={`s-${active}`} className="dm-progress-fill block h-full rounded-full bg-white" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
                      ) : (
                        <span className="block h-full w-full rounded-full bg-white" />
                      )}
                    </span>
                    <span className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.22)" }}>
                      {face === "Details" ? (
                        <span key={`d-${active}`} className="dm-progress-fill block h-full rounded-full bg-white" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
                      ) : (
                        <span className="block h-full rounded-full bg-white" style={{ width: "0%" }} />
                      )}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label="Next: more info"
                    onClick={jumpTo("Details")}
                    className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full lg:size-4"
                    style={{ color: face === "Details" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)" }}
                  >
                    <ChevronRight className="h-4 w-4 lg:h-3 lg:w-3" aria-hidden />
                  </button>
                </div>
                {/* Heading > subheading > body BY SIZE, strictly top-down --
                   this kicker and the field labels below are subheadings,
                   so they're sized BETWEEN the h2 title and the body copy,
                   not smaller than the body they introduce (direct
                   correction, 23 Sept 2026: "heading>subheading>body...
                   eyebrow... [was] smaller than the info" -- sizing a label
                   down because it felt less important inverted the actual
                   rank). Brightness does the OTHER job: kept muted here
                   even though it's now the larger of the two, so the eye
                   still lands on the body value first, not on the label.
                   Always career.matchLabel, on BOTH faces -- an earlier
                   pass swapped it to "MORE INFO" on Details, then hid that
                   text (keeping the line's height so nothing below jumped)
                   once "MORE INFO" turned out redundant with the
                   chevron/progress row. Showing "Strong match" constantly
                   instead solves the same redundancy AND reads as a steady
                   anchor while the content around it changes (direct
                   instruction, 23 Sept 2026: "what if we have strong match
                   on both slides... have [it] have my sparkle shimmer
                   nudge thing") -- carries the same dm-text-nudge sweep +
                   dm-nudge-spark twinkle ForYouBrowseToggle's "For you"
                   label uses. Brighter white, not a color -- first tried
                   the app's own green "GOOD" token (MentorshipTab.tsx),
                   then a direct follow-up asked for plain white instead,
                   just brighter than Major/Main Skills below it rather
                   than a new hue on the card: "maybe it can [be] white but
                   just slightly brighter than what major and main skills
                   are." 0.88 vs their 0.62. Shimmer/spark always on here,
                   NOT the one-time discovery-nudge gate the rest of the
                   app uses this pattern for -- direct instruction, 23 Sept
                   2026: "should always be playing... dont make it
                   disappear after the first thing." A permanent shine on
                   the one evaluative label, not a "learn this feature"
                   teaching moment like the swipe hint below is. */}
                <span className="text-[14px] leading-[18px] font-bold tracking-[0.02em] uppercase" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.88)" }}>
                  {/* textShadow: none -- dm-text-nudge clips its background
                     to the glyph shapes and makes the actual text fill
                     transparent (`-webkit-text-fill-color`), so the
                     panel's inherited drop-shadow was painting underneath
                     that transparent fill instead of behind solid text,
                     reading as a dark smudge over the green rather than a
                     clean shadow (direct report, 23 Sept 2026: "the
                     sparkle shimmer... also add[s] a dark overlay on the
                     text"). The sweep gradient already carries its own
                     contrast; it doesn't need the shadow too. */}
                  <span className="relative dm-text-nudge" style={{ textShadow: "none" }}>
                    {career.matchLabel}
                    <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark pointer-events-none absolute -top-[7px] -right-[9px] h-[9px] w-[9px]">
                      <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="#FFFFFF" />
                    </svg>
                  </span>
                </span>
                {/* Both faces stay mounted, stacked in the same grid cell, so
                   the panel's height is always the taller of the two -- it
                   never shrinks when Details' shorter content shows, which
                   used to expose a hard blur/photo seam right above the text
                   and leave part of it sitting on barely-blurred photo. */}
                {/* Real two-panel carousel, not a cross-fade -- Summary and
                   Details sit side by side in a row twice the container's
                   width, each panel exactly half of THAT row, so
                   `x: -panelWidth` moves by exactly one panel. `drag="x"`
                   makes the offset genuinely track the pointer every frame
                   while dragging (direct instruction: "the slide should
                   move with my finger not just switch... when i swipe");
                   `onDragEnd` (`onCarouselDragEnd` above) always calls
                   `settleAt` explicitly -- past SWIPE_COMMIT_PX that's a
                   real face change, short of it (either direction) it's an
                   explicit spring back to the CURRENT face, not a
                   declarative prop hoping to notice nothing changed (that
                   was the literal "gets stuck" bug -- see the comment on
                   `x`/`settleAt` above). A plain tap (negligible drag
                   distance) still fires a normal click, which bubbles to
                   flipFace below -- Framer doesn't suppress the click for a
                   drag that never crossed its own activation distance.
                   `overflow-hidden` wrapper clips the off-screen panel; row
                   height still auto-sizes to the taller panel (flex, same
                   principle the old grid-stacking relied on), so "keep the
                   height constant" from the auto-advance work above still
                   holds. dm-swipe-nudge (one-time, same discovery-nudge
                   gate as the rest of this card) lives on THIS wrapper, not
                   the motion.div below -- that div's own `style={{x}}` is a
                   live Framer-controlled `transform`, which a parallel CSS
                   `transform` keyframe animation on the SAME element would
                   fight over. It's the actual "you can swipe this" teaching
                   moment -- a small wiggle, not a label, since the card's
                   copy can't change for it (direct instruction: "add a
                   swipe nudge... so its understood i can swipe left or
                   right"). */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={face === "Summary" ? "Show more info" : "Show summary"}
                  onClick={flipFace}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipFace(); } }}
                  className={`overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 ${nudge ? "dm-swipe-nudge" : ""}`}
                  style={{ outlineColor: "var(--accent-subtle)" }}
                >
                  <motion.div
                    ref={carouselTrackRef}
                    className="flex"
                    style={{ x, width: "200%", touchAction: "pan-y", cursor: "grab" }}
                    drag="x"
                    dragElastic={0.22}
                    dragMomentum={false}
                    onDragEnd={onCarouselDragEnd}
                  >
                    <div aria-hidden={face !== "Summary"} className="flex flex-none flex-col gap-[var(--space-2)]" style={{ width: "50%" }}>
                      <h2 className="text-[19px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}>
                        {career.title}
                      </h2>
                      {/* Custom-designed edge case, 22 Sept 2026: this sits in a
                         fixed-height, overflow-hidden card (`h-full` +
                         `overflow-hidden` on EnvCard's own <article>) with no
                         scroll -- unclamped, a longer description can grow the
                         stacked content past the card's bounds and clip
                         something else in it. line-clamp caps it defensively,
                         matching this app's own truncation convention. */}
                      <p className="line-clamp-2 text-[13px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--primary-foreground)" }}>
                        {career.description}
                      </p>
                      {/* Eyebrow (dim, small, uppercase) over the actual value
                         (the brighter, body-sized line) -- title > subtitle >
                         body by size AND brightness, not two same-weight
                         labels sitting side by side (direct instruction, 23
                         Sept 2026: "everything read like one hierarchy...
                         use brightness too"). */}
                      <div className="flex flex-col gap-[1px]" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-[14px] leading-[18px] font-bold tracking-[0.02em] uppercase" style={{ color: "rgba(255,255,255,0.62)" }}>Median salary</span>
                        <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.98)" }}>{career.salary}</span>
                      </div>
                    </div>
                    {/* justify-center: Details has less content than Summary
                       (no title/description of its own), but the row is
                       always sized to Summary, the taller sibling -- top-
                       aligned by default, that left a dead gap below Main
                       Skills before the CTA row (direct instruction, 23 Sept
                       2026: "keep the height constant... align the text in
                       slide 2 so it doesn't look like it has awkward empty
                       space"). Centering distributes that same gap evenly
                       above and below instead of dumping it all at the
                       bottom. */}
                    <div aria-hidden={face !== "Details"} className="flex flex-none flex-col justify-center gap-[var(--space-3)]" style={{ width: "50%" }}>
                      <div className="flex flex-col gap-[1px]" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-[14px] leading-[18px] font-bold tracking-[0.02em] uppercase" style={{ color: "rgba(255,255,255,0.62)" }}>Major</span>
                        <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.98)" }}>{career.major}</span>
                      </div>
                      <div className="flex flex-col gap-[1px]" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-[14px] leading-[18px] font-bold tracking-[0.02em] uppercase" style={{ color: "rgba(255,255,255,0.62)" }}>Main skills</span>
                        <span className="line-clamp-2 text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.98)" }}>{career.mainSkills}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex w-full items-stretch justify-between gap-[var(--space-3)]">
              {hasSimulation && (
                <button
                  type="button"
                  onClick={() => router.push(`/play/${slug}`)}
                  className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-2)]"
                  /* solid dark glass in BOTH themes: the faint white-alpha surface
                     disappeared against the photos (founder feedback) */
                  style={{ background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.30)", backdropFilter: "blur(10px)" }}
                >
                  <span className="text-[17px] leading-[23px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "#F4F7FF" }}>
                    Play Game
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push(`/career/${slug}`)}
                className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]"
                style={{ background: "var(--foreground)" }}
              >
                <span className="text-[17px] leading-[23px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--background)" }}>
                  More Info
                </span>
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
 *  with a smooth ramp in between rather than a hard seam.
 *
 *  EXTEND above the panel it's masking, not `inset-0` to it -- gives the
 *  ramp room to build in the photo above the text, clipped by the card's
 *  own overflow-hidden if it runs past the top. Measured live: the real gap
 *  between Save (the lowest action button) and the panel's own top is
 *  ~32px on a phone -- 130px (a first pass) ran way past that and softened
 *  Save's icon (direct correction: "shouldn't be blurring the action
 *  buttons... start from under save"). 24px stays inside that gap.
 *
 *  bandStart is `(index+1)/total`, not `index/total` -- with the old
 *  index/total formula band 0 ALWAYS started at literal 0% of whatever box
 *  it's in, so `Math.max(0, bandStart - feather)` always clamped to 0 too:
 *  a zero-width, instant transition no amount of `reach` alone could fix,
 *  just relocate higher up (direct report, after the reach fix: "still
 *  read as a sharp line ever so slightly"). Shifting every band's target
 *  one step later gives band 0 a REAL feather window the same width as
 *  every other band's, so the whole ramp is genuinely continuous instead
 *  of one instant layer plus five real ones. Blur stops themselves toned
 *  down (35 -> 30 max) and the extra dark tint lightened (0.22 -> 0.16),
 *  same ask: "the blur can be toned down ever so slightly too... but
 *  everything's still visible". */
const PROGRESSIVE_BLUR_STOPS = [2, 7, 12, 18, 24, 30];
const PROGRESSIVE_BLUR_REACH = 24;

function ProgressiveBlur() {
  const total = PROGRESSIVE_BLUR_STOPS.length;
  const feather = 100 / total;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: -PROGRESSIVE_BLUR_REACH }}>
      {PROGRESSIVE_BLUR_STOPS.map((blur, index) => {
        const bandStart = ((index + 1) / total) * 100;
        const mask = `linear-gradient(to bottom, transparent ${Math.max(0, bandStart - feather).toFixed(1)}%, black ${bandStart.toFixed(1)}%, black 100%)`;
        return (
          <div
            key={blur}
            className="absolute inset-0"
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }}
          />
        );
      })}
      {/* A little more dark tint under the text, subtly -- carries more of
         the legibility job so text-shadow doesn't have to (direct
         instruction, 23 Sept 2026: "don't make it look like we overindexed
         on shadows... if the progressive blur needs a little more dark
         tint that's okay, subtly"). Own soft-edged band, same feather
         logic as the blur layers, so it ramps in with them rather than
         adding a second seam. */}
      <div className="absolute inset-0" style={{ background: "rgba(4,6,12,0.16)", maskImage: `linear-gradient(to bottom, transparent 0%, black 55%, black 100%)`, WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 55%, black 100%)` }} />
    </div>
  );
}

/** A real office-tour/day-in-the-life clip in the reel. Deliberately not
 *  EnvCard with a <video> swapped in: these have no salary, major, or
 *  "Play Game" affordance to show, so the card is just the clip and its
 *  title. Autoplays while its card is the active one, per the same
 *  IntersectionObserver-driven `active` flag EnvCard's Ken Burns uses;
 *  pauses off-screen instead of playing every card in the feed at once.
 *
 *  Sound: there is no web API to read a phone's hardware silent switch --
 *  that's native-only (iOS AVAudioSession / Android AudioManager). Instagram
 *  and TikTok's own WEB players can't detect it either, so they don't try;
 *  what they actually do, and what this does: try to autoplay WITH sound,
 *  let the browser's autoplay policy silently reject that if it's going to
 *  (mobile Safari/Chrome usually block it on a cold load), fall back to
 *  muted when it does, and remember whichever way the person last set it --
 *  `soundOn`/`onSoundChange` are lifted to ForYouFace so every video in the
 *  reel shares one preference instead of each clip resetting to muted. */
function VideoCard({ item, active, soundOn, onSoundChange }: { item: VideoReel; active: boolean; soundOn: boolean; onSoundChange: (next: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Starting a clip: reset to the top and (re)attempt playback. Deliberately
  // NOT keyed on `soundOn` -- toggling sound on an already-playing clip must
  // not restart it (the effect below just flips .muted on the live element).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    video.currentTime = 0;
    video.muted = !soundOn;
    video.play().catch(() => {
      if (!video.muted) {
        video.muted = true;
        onSoundChange(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !soundOn;
  }, [soundOn]);

  return (
    <article
      className="relative flex h-full w-full flex-col justify-end overflow-hidden border md:rounded-[var(--radius-lg)]"
      style={{ borderColor: "var(--glass-surface-2)", background: "#000" }}
    >
      <video ref={videoRef} src={item.video} className="absolute inset-0 h-full w-full object-cover" loop playsInline preload={active ? "auto" : "none"} />
      {/* top-[86px]: below `lg:` this card is the fixed, viewport-filling
         reel layer (see `.foryou-snap`), sitting directly under
         MobileHeaderShell's floating pill (chrome.tsx, `lg:hidden`, a real
         74px tall including its own top inset) -- top-4 alone put this
         button right underneath that header, unreachable (direct report,
         23 Sept 2026: "the sound toggle etc are hidden behind the top
         navbar"). lg:top-4 restores the tight offset once this card is the
         small framed desktop reel instead, which has no overlapping fixed
         header of its own. */}
      <IconTip label={soundOn ? "Mute video" : "Unmute video"} className="absolute top-[86px] right-[var(--space-4)] z-[1] lg:top-[var(--space-4)]">
        <button
          type="button"
          aria-label={soundOn ? "Mute video" : "Unmute video"}
          aria-pressed={soundOn}
          onClick={() => onSoundChange(!soundOn)}
          className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border"
          style={{ background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.30)", color: "#ffffff" }}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </IconTip>
      <div className="relative z-[1] p-[var(--space-4)] pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-[var(--space-4)]">
        {/* Same rounded panel language as the Env Card v2 details panel, but
           a SOLID scrim rather than the frosted-glass blur -- blurring part
           of a playing video looks muddy in a way it doesn't over a still
           photo, and the title needs to stay sharp and legible over motion. */}
        <span
          className="inline-block rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)] text-[16px] leading-[22px] font-semibold"
          style={{ background: "var(--scrim-heavy)", borderColor: "var(--glass-border)", color: "#ffffff", fontFamily: "var(--font-display)" }}
        >
          {item.title}
        </span>
      </div>
    </article>
  );
}

/** One reel slide, either kind. */
function ForYouCard({
  item,
  active,
  soundOn,
  onSoundChange,
  liked,
  disliked,
  onSetLiked,
  onSetDisliked,
  showActionsHint,
  onDismissActionsHint,
}: {
  item: ReelItem;
  active: boolean;
  soundOn: boolean;
  onSoundChange: (next: boolean) => void;
  liked: boolean;
  disliked: boolean;
  onSetLiked: (next: boolean) => void;
  onSetDisliked: (next: boolean) => void;
  showActionsHint: boolean;
  onDismissActionsHint: () => void;
}) {
  if (isVideoReel(item)) return <VideoCard item={item} active={active} soundOn={soundOn} onSoundChange={onSoundChange} />;
  return (
    <EnvCard
      career={item}
      active={active}
      liked={liked}
      disliked={disliked}
      onSetLiked={onSetLiked}
      onSetDisliked={onSetDisliked}
      showActionsHint={showActionsHint}
      onDismissActionsHint={onDismissActionsHint}
    />
  );
}

function PreferenceButton({
  label,
  Icon,
  bare = false,
  active = false,
  filled = false,
  onClick,
}: {
  label: string;
  Icon: typeof Heart;
  bare?: boolean;
  /** Selected/on state -- e.g. already saved, already in your Top 3. */
  active?: boolean;
  /** Fill the icon glyph itself (Like/Not for me/Save all fill on select,
      matching Career Detail's exact convention); Top 3's Plus/Minus swap
      icon instead, so it stays false there. */
  filled?: boolean;
  onClick?: () => void;
}) {
  return (
    <IconTip label={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={onClick ? active : undefined}
        onClick={onClick}
        className="dm-quiet flex size-11 cursor-pointer items-center justify-center rounded-[999px] border transition-transform duration-150 hover:-translate-y-px active:scale-95"
        style={{
          background: bare ? "transparent" : active ? "var(--primary)" : "var(--glass-surface-1)",
          borderColor: bare ? "transparent" : active ? "var(--primary)" : "var(--glass-border)",
          color: bare ? (active ? "var(--accent-subtle)" : "var(--foreground)") : active ? "var(--primary-foreground)" : "var(--foreground)",
        }}
      >
        {/* `bare` is the reel's own floating column, straight over the
           photo with no surface behind it -- a plain icon can wash out
           against a light window or shirt the same way text would (direct
           instruction, 23 Sept 2026: "make sure the action buttons... are
           legible too... refer what instagram and tiktok do"). Same fix
           they use: a drop-shadow on the icon itself, background-
           independent, not a background chip (which would cover the photo
           behind every icon and read heavier than either app's own
           treatment). The non-bare version already sits on a real glass
           surface, so it doesn't need this. */}
        <Icon className="h-6 w-6" fill={filled ? "currentColor" : "none"} style={bare ? { filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.55)) drop-shadow(0 1px 5px rgba(0,0,0,0.35))" } : undefined} />
      </button>
    </IconTip>
  );
}

const REEL_SOUND_KEY = "dreamari:reel-sound-on";

function ForYouFace() {
  const total = FOR_YOU_FEED.length;
  const [active, setActive] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Remember the last sound choice across the reel (and across visits) --
  // same as Instagram/TikTok's web players. Starts true (attempt sound);
  // VideoCard flips it false the first time the browser actually blocks an
  // unmuted autoplay, and every card shares this one value from then on.
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(REEL_SOUND_KEY);
    return stored === null ? true : stored === "true";
  });
  const updateSoundOn = useCallback((next: boolean) => {
    setSoundOn(next);
    window.localStorage.setItem(REEL_SOUND_KEY, String(next));
  }, []);

  // Like/Not for me for the whole reel, keyed by career slug -- lifted up
  // here (rather than kept local to each EnvCard) so the mobile in-card
  // buttons and the desktop rail below both read/write the SAME state for
  // whichever career is currently active, instead of silently drifting
  // apart the way two independent useState calls would.
  const [prefs, setPrefs] = useState<Record<string, { liked: boolean; disliked: boolean }>>({});
  const setLiked = useCallback((slug: string, next: boolean) => {
    setPrefs((p) => ({ ...p, [slug]: { liked: next, disliked: next ? false : (p[slug]?.disliked ?? false) } }));
  }, []);
  const setDisliked = useCallback((slug: string, next: boolean) => {
    setPrefs((p) => ({ ...p, [slug]: { disliked: next, liked: next ? false : (p[slug]?.liked ?? false) } }));
  }, []);
  // One coachmark, shown once per device, shared with Career Detail's own
  // (same "action-icons" key) -- whichever surface a student reaches first
  // is the only one that ever explains these icons.
  const [showActionsHint, dismissActionsHint] = useFirstUseHint("action-icons");

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

  // Desktop: the reel is a fixed-size card beside the title and the
  // For you/Browse All chip, not a full-bleed layer the way phone/tablet
  // are -- so a wheel scroll while the cursor sits over that empty space
  // (title, toggle, the gap between them) had nothing to catch it and
  // fell through to the page itself, which is exactly the scroll this
  // page must never have (direct feedback, 22 Sept 2026: "if I scroll
  // anywhere on this page it should trigger the reel to scroll, not the
  // screen itself"). Forwards the wheel delta into the feed's own
  // scrollTop from anywhere on the page; its existing CSS scroll-snap
  // then settles on the nearest card exactly as a scroll directly on the
  // card already does. Skipped when the cursor IS over the feed (or on
  // phone/tablet, where the feed already covers the whole screen) so
  // native scrolling there is untouched.
  useEffect(() => {
    function onWheel(event: WheelEvent) {
      const feed = feedRef.current;
      if (!feed || feed.contains(event.target as Node)) return;
      event.preventDefault();
      feed.scrollTop += event.deltaY;
    }
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative flex w-full items-center justify-center gap-[10px] lg:min-h-0 lg:flex-1">
      {/* The feed: TikTok/Instagram-style full-bleed vertical snap scroll on
         phone AND tablet (lg:hidden's boundary, 1024px -- not md:'s 768px
         any more); the small Env Card frame (390×672) beside a preference
         rail is desktop-only now. Was md:-gated before, which put a tablet
         (768-1023px) window into the small framed-card treatment -- a tiny
         card floating in a sea of empty space, since nothing else fills a
         tablet's real screen real estate the way a full-bleed reel does
         (direct feedback, 22 Sept 2026, tablet screenshot: "horrendous,
         please scale content to fit the space properly" + "center the main
         content area (reels style, instagram/tiktok)"). Tablet now gets
         the exact same true full-viewport reel phones already had. */}
      <div
        ref={feedRef}
        /* night scene: the reel is always photo-on-dark; its ui keeps dark
           tokens in light mode (see tokens.css) */
        data-night-scene
        // h-full (not a literal 672px): CSS only resolves a percentage
        // height against an ancestor whose OWN height is an explicit
        // value, not `auto`. `main` gives that a real, definite height at
        // this same lg: breakpoint (see its own className), so h-full
        // correctly resolves and max-h-[672px] just caps it on a tall
        // desktop monitor with room to spare.
        // lg:self-start: on a genuinely tall/wide desktop monitor, this
        // box's real height (h-full, capped at 672) ends up well short of
        // the row's own full height -- the parent's `items-center` then
        // centers that shorter box within the leftover room, reading as a
        // large dead gap above the card and misaligning it with the For
        // You/Browse All chip beside it (direct feedback, 22 Sept 2026,
        // external wide monitor screenshot: "still not fixed"). A laptop's
        // own (much shorter) screen has little slack, so this went
        // unnoticed there. self-start overrides just this one flex item
        // so it anchors to the row's top regardless of how much slack
        // exists below it.
        className="foryou-snap fixed inset-0 z-0 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:h-full lg:max-h-[672px] lg:w-[390px] lg:self-start lg:overflow-y-auto lg:rounded-[var(--radius-lg)]"
      >
        {FOR_YOU_FEED.map((item, index) => {
          const itemSlug = isVideoReel(item) ? null : careerSlug(item.title);
          const itemPrefs = itemSlug ? prefs[itemSlug] : undefined;
          return (
            <div key={index} data-reel-index={index} className="h-full w-full snap-start snap-always">
              <ForYouCard
                item={item}
                active={index === active}
                soundOn={soundOn}
                onSoundChange={updateSoundOn}
                liked={itemPrefs?.liked ?? false}
                disliked={itemPrefs?.disliked ?? false}
                onSetLiked={(next) => itemSlug && setLiked(itemSlug, next)}
                onSetDisliked={(next) => itemSlug && setDisliked(itemSlug, next)}
                showActionsHint={showActionsHint && index === active}
                onDismissActionsHint={dismissActionsHint}
              />
            </div>
          );
        })}
      </div>

      {/* Desktop Career Preference Rail — "Place immediately to the right of
         an Env Card. Phone AND tablet keep these controls inside the card
         instead (see EnvCard's own lg:hidden buttons)." Acts on whichever
         career is currently active in the feed; hidden entirely when that's
         a video card (Videos Inside Leading Companies has no like/save/Top
         3 of its own -- same as the mobile card, which renders VideoCard
         instead of EnvCard for those). */}
      <DesktopPreferenceRail
        activeItem={FOR_YOU_FEED[active]}
        prefs={prefs}
        setLiked={setLiked}
        setDisliked={setDisliked}
        showActionsHint={showActionsHint}
        dismissActionsHint={dismissActionsHint}
      />

      {/* Previous / Next paging */}
      <div className="absolute right-0 hidden flex-col gap-[10px] lg:flex">
        <IconTip label="Previous career">
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
        </IconTip>
        <IconTip label="Next career">
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
        </IconTip>
      </div>
    </div>
  );
}

function DesktopPreferenceRail({
  activeItem,
  prefs,
  setLiked,
  setDisliked,
  showActionsHint,
  dismissActionsHint,
}: {
  activeItem: ReelItem | undefined;
  prefs: Record<string, { liked: boolean; disliked: boolean }>;
  setLiked: (slug: string, next: boolean) => void;
  setDisliked: (slug: string, next: boolean) => void;
  showActionsHint: boolean;
  dismissActionsHint: () => void;
}) {
  const [savedCareers, toggleSavedCareer] = useSavedCareers();
  const { ids: top3Ids, addToTop3, confirmSwap, removeFromTop3, restore } = useTop3();
  const [swapCandidate, setSwapCandidate] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [undoRemove, setUndoRemove] = useState<Picks | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  if (!activeItem || isVideoReel(activeItem)) {
    // Still rendered (empty) rather than unmounted -- keeps the row's own
    // gap/paging column layout stable instead of the paging arrows beside
    // it jumping left every time a video card becomes active.
    return <div className="hidden flex-col items-center gap-[var(--space-6)] lg:flex" />;
  }

  const slug = careerSlug(activeItem.title);
  const saved = savedCareers.has(slug);
  const inTop3 = top3Ids.includes(slug);
  const liked = prefs[slug]?.liked ?? false;
  const disliked = prefs[slug]?.disliked ?? false;

  return (
    <div ref={actionsRef} className="hidden flex-col items-center gap-[var(--space-6)] lg:flex">
      <PreferenceButton
        label={inTop3 ? "Remove from your Top 3" : "Add to your Top 3"}
        Icon={inTop3 ? Minus : Plus}
        active={inTop3}
        onClick={() => {
          dismissActionsHint();
          if (inTop3) {
            setToast(null);
            const before = removeFromTop3(slug);
            setUndoRemove(before);
            return;
          }
          setUndoRemove(null);
          const result = addToTop3(slug);
          if (result === "added") setToast(top3AddedToast());
          else if (result === "full") setSwapCandidate(slug);
        }}
      />
      <PreferenceButton
        label="Like this career"
        Icon={Heart}
        active={liked}
        filled={liked}
        onClick={() => {
          dismissActionsHint();
          const next = !liked;
          setLiked(slug, next);
          if (next && !tipSeen(LIKE_TIP_KEY)) {
            setUndoRemove(null);
            setToast("Saved to what you like. This helps tailor your matches.");
            markTipSeen(LIKE_TIP_KEY);
          }
        }}
      />
      <PreferenceButton
        label="Not for me"
        Icon={ThumbsDown}
        active={disliked}
        filled={disliked}
        onClick={() => {
          dismissActionsHint();
          const next = !disliked;
          setDisliked(slug, next);
          if (next && !tipSeen(DISLIKE_TIP_KEY)) {
            setUndoRemove(null);
            setToast("Noted, we'll show you less like this.");
            markTipSeen(DISLIKE_TIP_KEY);
          }
        }}
      />
      <PreferenceButton
        label={saved ? "Saved" : "Save for later"}
        Icon={Bookmark}
        active={saved}
        filled={saved}
        onClick={() => {
          dismissActionsHint();
          toggleSavedCareer(slug);
        }}
      />
      {swapCandidate && (
        <Top3SwapModal
          incomingId={swapCandidate}
          currentIds={top3Ids}
          onConfirm={(outgoingId) => {
            confirmSwap(outgoingId, swapCandidate);
            setSwapCandidate(null);
            setUndoRemove(null);
            setToast(top3AddedToast());
          }}
          onCancel={() => setSwapCandidate(null)}
        />
      )}
      {undoRemove && (
        <UndoToast message="Removed from your Top 3" onUndo={() => restore(undoRemove)} onClose={() => setUndoRemove(null)} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Coachmark
        active={showActionsHint}
        targetRef={actionsRef}
        label="Like, save, or add a career to your Top 3 — right from here."
        onDismiss={dismissActionsHint}
        spotlight
      />
    </div>
  );
}

/** SSR-safe (defaults false, same convention as useForYouNudge above, so
 *  the server and first client paint agree): true once a >=lg (1024px)
 *  viewport is confirmed client-side. For You needs this as a real JS
 *  gate, not just a CSS `hidden lg:flex` -- its active card's <video>
 *  autoplays with sound, and a `display:none` video keeps playing audio,
 *  so the mobile/tablet and desktop layouts can't both mount ForYouFace
 *  at once the way DesktopNavigation/MobileNav (no media) safely do. */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

/** The search box + For you/Browse All toggle, shared by Browse's header
 *  row and For You's desktop row (identical control, two different
 *  layout contexts) so the two never drift out of sync. */
function DesktopSearchToggle({
  tab, switchTab, nudge, showTutorial, onDismissTutorial, searchOpen, setSearchOpen, query, setQuery,
}: {
  tab: "foryou" | "browse";
  switchTab: (next: "foryou" | "browse") => void;
  nudge: boolean;
  showTutorial: boolean;
  onDismissTutorial: () => void;
  searchOpen: boolean;
  setSearchOpen: (updater: boolean | ((value: boolean) => boolean)) => void;
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-[var(--space-6)]">
      {/* Search grows from icon to input; the toggle folds away while
         it is open. Perfectly circular collapsed (a fixed 40x40 with
         rounded-lg read as a rounded square, not a circle -- direct
         feedback, 8 Sept 2026); once it grows into a text field it
         needs the normal rounded-rect shape back. */}
      {/* active is tied to searchOpen, not hover -- this box morphs shape
         (circle collapsed, rounded-rect open), so borderRadius is pinned
         explicitly rather than left to BorderBeam's own auto-detect (which
         only reads the child's radius once, at mount, and would otherwise
         keep whatever shape this box happened to be in on first paint). */}
      <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85} active={searchOpen} borderRadius={16}>
      <div
        className="flex h-10 min-w-0 items-center gap-[var(--space-3)] border px-[var(--space-3)] backdrop-blur-[10px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: searchOpen ? "min(480px, 44vw)" : 40,
          borderRadius: searchOpen ? "var(--radius-lg)" : 9999,
          background: searchOpen ? "var(--glass-surface-1)" : "var(--glass-surface-2)",
          borderColor: searchOpen ? "var(--primary)" : "var(--glass-border)",
        }}
      >
        <IconTip label="Search">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="dm-link flex flex-none cursor-pointer items-center" style={{ color: searchOpen ? "var(--muted-foreground)" : "var(--foreground)" }}>
            <Search className="h-4 w-4" />
          </button>
        </IconTip>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search careers, skills, worlds..."
          aria-hidden={!searchOpen}
          tabIndex={searchOpen ? 0 : -1}
          className="dm-beam-input min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none transition-opacity duration-200 placeholder:text-[color:var(--muted-foreground)]"
          style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? "auto" : "none" }}
        />
        {searchOpen && (
          <IconTip label="Close search">
            <button
              type="button"
              aria-label="Close search"
              onClick={() => (query ? setQuery("") : setSearchOpen(false))}
              className="dm-quiet flex h-7 flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-2"
              style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}
            >
              <X className="h-3 w-3" />
            </button>
          </IconTip>
        )}
      </div>
      </BorderBeam>
      {/* Toggle collapses while search is open. */}
      <div
        className="flex-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ maxWidth: searchOpen ? 0 : 320, opacity: searchOpen ? 0 : 1, pointerEvents: searchOpen ? "none" : "auto" }}
      >
        <ForYouBrowseToggle tab={tab} onTab={switchTab} nudge={nudge} showTutorial={showTutorial} onDismissTutorial={onDismissTutorial} />
      </div>
    </div>
  );
}

export function ExploreExperience({ initialTab, initialQuery = "" }: { initialTab: "foryou" | "browse"; initialQuery?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"foryou" | "browse">(initialTab);
  // ?q= from the sitewide search lands here with the box already open
  const [searchOpen, setSearchOpen] = useState(initialQuery.length > 0);
  const [query, setQuery] = useState(initialQuery);
  const isDesktop = useIsDesktop();
  const nudgeForYou = useForYouNudge(tab);
  // The nudge's CSS animation is `infinite` from the moment its class is
  // applied, but the first-visit splash covers the toggle for as long as
  // the student takes to read it -- the animation was ticking the whole
  // time underneath, so by the time they dismissed it they'd usually land
  // mid-cycle in the ~3.3s dead zone between sweeps, reading as "it doesn't
  // fire" (direct feedback, 22 Sept 2026: "it needs to fire immediately
  // when I land and dismiss the popup"). Gating the class itself behind
  // splashDone means the animation's own 0.9s starting delay is now
  // measured from dismissal, not from mount.
  const [splashDone, setSplashDone] = useState(false);
  // A 2-step guided tour, not two hints racing each other (direct feedback,
  // 24 Sept 2026: "they should happen in succession"). One shared "seen"
  // flag for the whole tour; `tourStep` decides which half is currently
  // showing. Step 1 (For You) only makes sense while landing on Browse All
  // -- ForYouBrowseToggle's own tab === "browse" gate already gets that for
  // free. Step 2 (Schools) follows once step 1 is dismissed, whether by its
  // own "Next" or by the student just tapping For You directly.
  const [tourNotSeen, dismissTour] = useFirstUseHint("explore-tour");
  const [tourStep, setTourStep] = useState<"foryou" | "schools">("foryou");
  const advanceTour = () => setTourStep("schools");
  const showForYouTutorial = tourNotSeen && splashDone && tab === "browse" && tourStep === "foryou";
  const showSchoolsTutorial = tourNotSeen && splashDone && tourStep === "schools";
  // Mobile/tablet's own Schools entry point is the graduation-cap icon below
  // -- desktop shows ExploreSectionTabs' text tabs instead, wired the same
  // way further down.
  const schoolsIconRef = useRef<HTMLButtonElement | null>(null);

  function switchTab(next: "foryou" | "browse") {
    setTab(next);
    setSearchOpen(false);
    // Browse is the server's default for a bare `/explore` (page.tsx:
    // "Browse is the default view"), so refreshing there already lands
    // back on Browse correctly -- but writing FOR YOU as bare `/explore`
    // meant a refresh on For You read as no `?tab=`, which page.tsx
    // reads as Browse: refreshing (or reopening a shared/bookmarked
    // link) on For You silently bounced back to Browse every time
    // (direct feedback, 22 Sept 2026: "if I refresh on a certain tab...
    // I should land back on that tab, not take me back to Explore
    // careers"). Inverted: For You now writes its own explicit `?tab=`.
    router.replace(next === "foryou" ? "/explore?tab=foryou" : "/explore", { scroll: false });
  }

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)" }}>
      <AppBackdrop />
      <FirstVisitSplash surface="explore" onOpenChange={(open) => { if (!open) setSplashDone(true); }} />

      {/* forceBlur on For You: that tab's `main` owns its own internal
         scroll (the reel) and never lets the page itself scroll, so the
         scroll-triggered frost this bar normally waits for would never
         fire -- it would sit permanently transparent over a career photo
         (direct feedback, 22 Sept 2026: "the navbar... doesn't have any
         blur"). Browse still frosts only once actually scrolled, same as
         every other page. */}
      <DesktopNavigation active="Explore" forceBlur={tab === "foryou"} />

      {/* Phones and tablets: the same header shell as every other page
         (logo, search on Browse, streak | XP, bell, hamburger) -- Browse
         only. For You drops it entirely below `lg:` (direct instruction,
         23 Sept 2026: "let's not have the top navbar on mobile and
         tablet") -- the reel is a full-bleed, TikTok-style immersive
         layer there, and the fixed header was sitting on top of it,
         covering the sound toggle and eating into the reel's own
         For You | Browse All row (the same one-row-at-a-time overlap
         this file has fought before, e.g. the 19 Sept 2026 absolute-tab-row
         collision noted in git history). Navigation elsewhere stays
         reachable via the persistent bottom nav; MobileNav never depended
         on this header. */}
      {tab === "browse" && (
        <MobileHeaderShell>
          <Wordmark />
          <HeaderActions><QuickLinksMenu /></HeaderActions>
        </MobileHeaderShell>
      )}

      {/* One standard gap between the navbar and page content everywhere
         (pt-3/md:pt-8, the shared "title page" rhythm -- see
         HomeExperience.tsx's own comment); For You fits the viewport with
         the card centered. */}
      <main
        className={`relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-start px-5 pt-3 sm:px-[var(--space-14)] md:pt-8 ${
          tab === "browse"
            ? "gap-[22px] pb-[120px]"
            // DesktopNavigation (chrome.tsx) is h-[86px], not 62px -- this
            // was sized against a stale assumption, so `main` ran 24px
            // taller than the space actually left below the sticky nav.
            // That 24px was just enough real page-level scroll to shift
            // the For You | Browse All row out from under the nav and
            // leave the reel card's own Play/More Info buttons clipped
            // until scrolled (direct feedback, 21 Sept 2026: "buttons...
            // only accessible after a scroll" / "For You | Browse All
            // navigation is hidden" -- both the same root cause).
            //
            // md:, not lg:-only: a real Safari window (not our own full
            // dev viewport) is often shorter than 760px of usable height,
            // and the reel card was FIXED at 672px tall regardless -- on
            // that shorter real window it ran past `main`'s own bottom
            // edge, clipped by main's overflow:hidden with no way to
            // reach the cut-off part (direct feedback, 21 Sept 2026,
            // screenshot: "the for you looks... on desktop in safari").
            // Giving `main` a real, definite height at md: too (not just
            // lg:) is what lets the card size ITSELF against it below,
            // instead of a hardcoded number that can't shrink.
            : "gap-[var(--space-6)] pb-0 md:h-[calc(100dvh-86px)] md:overflow-hidden md:pb-[var(--space-6)]"
        }`}
      >
        {/* Phone row: the view toggle, then Search (Browse only) and Schools;
           search stays off the top bar (direct feedback, 19 Sept 2026) */}
        {/* z-20: on phones the For you reel is a fixed layer inside main, so
           this row has to sit above it to stay tappable over the photo */}
        <div className="relative z-20 flex w-full items-center justify-between gap-[var(--space-3)] lg:hidden">
          <ForYouBrowseToggle tab={tab} onTab={switchTab} nudge={nudgeForYou && splashDone} showTutorial={showForYouTutorial} onDismissTutorial={advanceTour} />
          <div className="flex items-center gap-[10px]">
            {tab === "browse" && (
              <IconTip label="Search">
                <button
                  type="button"
                  aria-label="Search"
                  aria-pressed={searchOpen}
                  onClick={() => setSearchOpen((value) => !value)}
                  className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
                  style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: searchOpen ? "var(--primary)" : "var(--foreground)" }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </IconTip>
            )}
            <IconTip label="Schools">
              <button
                ref={schoolsIconRef}
                type="button"
                aria-label="Find a college"
                onClick={() => { dismissTour(); router.push("/colleges"); }}
                className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
                style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <GraduationCap className="h-4 w-4" />
              </button>
            </IconTip>
            <Coachmark
              active={showSchoolsTutorial}
              targetRef={schoolsIconRef}
              label="Schools have a tab too! Look up any school, or see the ones picked for you."
              onDismiss={dismissTour}
              spotlight
            />
          </div>
        </div>
        {/* Explore Header (desktop) -- Browse only. For You gets its own
           row below: the title block, the reel and the search+toggle all
           share one row there instead of the reel sitting in a second row
           beneath a full-width header. mb-[2px]: the title and the
           Careers/Schools strip under it are one visual unit (direct
           feedback, 22 Sept 2026: "treat the career title and the
           career/schools toggle as one element"), so the gap from THIS
           unit down to the rails below should match every other page's
           title-to-content gap (24px) -- 2px more than main's own 22px
           section rhythm, same pattern as every other title page. */}
        {tab === "browse" && (
        <div className="mb-[2px] hidden w-full flex-col gap-[var(--space-6)] lg:flex">
          <div className="flex w-full items-center justify-between gap-[var(--space-6)]">
            <div className="flex flex-col gap-[var(--space-2)]">
              <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>
                Explore
              </h1>
              <ExploreSectionTabs active="careers" showTutorial={showSchoolsTutorial} onDismissTutorial={dismissTour} />
            </div>
            <DesktopSearchToggle tab={tab} switchTab={switchTab} nudge={nudgeForYou && splashDone} showTutorial={showForYouTutorial} onDismissTutorial={advanceTour} searchOpen={searchOpen} setSearchOpen={setSearchOpen} query={query} setQuery={setQuery} />
          </div>
        </div>
        )}

        {/* For You (desktop, >=1024px): title/tabs, the reel and
           search+toggle in one row, all top-aligned -- the reel's top
           edge lands flush with the toggle's top edge instead of being
           centered independently (direct feedback, 22 Sept 2026, citing
           dreamonna's own For You layout: "align with the for you/browse
           all top chip border for better spacing"). flex-1 min-h-0 lets
           this row fill whatever height `main` has left (main itself is
           capped at 100dvh-86px with overflow hidden -- see its own
           className -- so nothing here can force page-level scroll); the
           middle column is NOT vertically centered, so any extra height
           beyond the card's own max-h-[672px] shows up as bottom margin,
           not a symmetric gap top and bottom (direct feedback: "sufficient
           padding and margins at the bottom"). ForYouFace only mounts
           here once isDesktop (JS) agrees with this lg: breakpoint --
           see useIsDesktop's own comment for why. */}
        {tab === "foryou" && (
        <div className="hidden w-full flex-1 min-h-0 items-start justify-between gap-[var(--space-6)] lg:flex">
          <div className="flex flex-none flex-col gap-[var(--space-2)] self-start">
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>
              Explore
            </h1>
            <ExploreSectionTabs active="careers" showTutorial={showSchoolsTutorial} onDismissTutorial={dismissTour} />
          </div>
          <div className="flex h-full min-w-0 flex-1 flex-col items-start">
            {isDesktop && <ForYouFace />}
          </div>
          <div className="flex-none self-start">
            <DesktopSearchToggle tab={tab} switchTab={switchTab} nudge={nudgeForYou && splashDone} showTutorial={showForYouTutorial} onDismissTutorial={advanceTour} searchOpen={searchOpen} setSearchOpen={setSearchOpen} query={query} setQuery={setQuery} />
          </div>
        </div>
        )}

        {/* Mobile search input (the desktop header is hidden below md) */}
        {tab === "browse" && searchOpen && (
          <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85} borderRadius={16} className="md:hidden">
          <div
            className="filters-reveal flex h-12 w-full items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] backdrop-blur-[10px]"
            style={{ background: "var(--glass-surface-1)", borderColor: "var(--primary)" }}
          >
            <Search className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search careers, skills, worlds..."
              className="dm-beam-input min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none placeholder:text-[color:var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
            />
            <IconTip label="Clear search">
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => (query ? setQuery("") : setSearchOpen(false))}
                className="dm-quiet flex h-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-2"
                style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}
              >
                <X className="h-3 w-3" />
              </button>
            </IconTip>
          </div>
          </BorderBeam>
        )}

        {tab === "browse" ? (
          <BrowseFace query={query} filtersOpen={searchOpen} onQuery={(q) => { setQuery(q); setSearchOpen(true); }} />
        ) : (
          !isDesktop && <ForYouFace />
        )}
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
