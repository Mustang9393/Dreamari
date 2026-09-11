"use client";

import Image from "next/image";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { FirstVisitSplash } from "@/components/app/WelcomeSplash";
import { SparkBar } from "@/components/flow/SparkBar";
import { NextStepBanner } from "@/components/app/NextStepBanner";
import { HoverBeam } from "@/components/app/HoverBeam";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ChevronRight, BookOpen, Film, Lock, Play, Zap } from "lucide-react";

import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { hasGlossary } from "@/components/glossary/data";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { FEATURED_ROW_SOON_IDS, GLOSSARY_GAMES, SIMULATIONS, SOON } from "./games";
import { TrailerFlow } from "./TrailerFlow";
import type { Simulation } from "./types";

// The Play tab: every career simulation in one place. A student's own Top 3
// comes first, because a game for a career they already chose is the one worth
// playing. Copy is deliberately thin -- the art and the level ladder say it.

export function PlayHub() {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  // A deep link from elsewhere in the app (Profile's "Play your #1 Career
  // Simulation") lands here, not straight into the game -- Prime Video/Apple
  // TV pattern, the content page before playback (Joshua Pierce, Slack,
  // 7 Sept 2026). `?focus=investment-banking` pre-selects that card as the
  // hero instead of whatever the student's own Top 3 would otherwise show.
  const focusId = useSearchParams().get("focus") ?? undefined;

  // Games for careers they chose, in their order, then everything else.
  const { mine, rest } = useMemo(() => {
    const chosen = picks.ids;
    const mine = chosen.map((id) => SIMULATIONS.find((game) => game.careerId === id)).filter(Boolean) as Simulation[];
    const rest = SIMULATIONS.filter((game) => !mine.includes(game));
    return { mine, rest };
  }, [picks.ids]);

  const soon = useMemo(() => {
    const live = new Set(SIMULATIONS.map((game) => game.careerId));
    const chosen = new Set(picks.ids);
    return [...SOON.filter((game) => chosen.has(game.careerId)), ...SOON.filter((game) => !chosen.has(game.careerId))].filter(
      (game) => !live.has(game.careerId) && !FEATURED_ROW_SOON_IDS.includes(game.careerId),
    );
  }, [picks.ids]);

  const featuredRowSoon = useMemo(() => SOON.filter((game) => FEATURED_ROW_SOON_IDS.includes(game.careerId)), []);
  // The hero row's idle swipe hint waits for the welcome splash to close.
  const [splashSettled, setSplashSettled] = useState(false);

  return (
    <div
      className="marketing-v2 themeable relative min-h-dvh w-full overflow-x-clip"
      style={{
        background: "transparent",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
        overflowX: "clip",
      }}
    >
      <AppBackdrop />
      <FirstVisitSplash surface="play" onOpenChange={(open) => setSplashSettled(!open)} />

      <DesktopNavigation active="Play" />

      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] sm:px-[var(--space-14)] md:pt-[var(--space-10)]">
        <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>
          Play
        </h1>

        <FeaturedRow simulations={[...mine, ...rest]} soonCareers={featuredRowSoon} focusId={focusId} hintReady={splashSettled} />

        {/* Glossary Games: split by whether the career actually has authored
           content (hasGlossary) -- Finance Essentials has a real page now,
           so it gets a real playable card; the rest are dummy "Coming soon"
           cards that fill out the row rather than link anywhere (direct
           feedback, 9 Sept 2026: "they dont have to work or lead anywhere,
           theyre just dummy cards to fill the row"), same idiom as the
           career-simulation placeholders below. */}
        {GLOSSARY_GAMES.length > 0 && (
          <section className="flex flex-col gap-[var(--space-3)]">
            <h2 className={ROW_HEADER} style={{ color: "var(--foreground)" }}>
              Glossary Games
            </h2>
            {/* A small horizontal shelf (SHELF_HEIGHT), deliberately smaller
               than the hero row above -- the billboard dominates, the
               shelves below it stay uniform and quiet, Netflix-style. Same
               full-bleed rail as FeaturedRow above (negative margins run it
               to the viewport edge so the next card visibly peeks instead of
               clipping at the content column, direct feedback, 9 Sept 2026)
               rather than stopping dead at main's own padding. */}
            <ul className="dreamari-card-rail -mx-5 flex list-none gap-[var(--space-3)] overflow-x-auto p-0 px-5 pt-1 pb-3 md:-mx-[var(--space-14)] md:px-[var(--space-14)] lg:mx-[calc(50%-50vw)] lg:px-[calc(50vw-50%)]">
              {GLOSSARY_GAMES.map((game) => (
                <li key={game.careerSlug} className="flex-none">
                  <GlossaryGameCard game={game} playable={hasGlossary(game.careerSlug)} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* The bridge from Play to Explore (Joshua Pierce, Slack, 5 Sept 2026):
           Play is for experiencing careers, Explore for discovering them.
           Sits after the Glossary Games so it closes the page instead of
           interrupting it (direct feedback, 6 Sept 2026). */}
        <NextStepBanner
          eyebrow="Looking for another career to play?"
          text="Explore more careers and find another simulation to play."
          ctaLabel="Explore"
          href="/explore"
          Icon={ChevronRight}
          storageKey="dreamari:play-explore-bridge-dismissed"
        />

        <SoonSection label="In the works">
          {soon.map((game) => (
            <SoonCard key={game.careerId} title={game.title} cover={game.cover} />
          ))}
        </SoonSection>
      </main>

      <MobileNav active="Play" />
    </div>
  );
}

type SoonCareer = { careerId: string; title: string; world: string; cover: string };
type FeaturedCandidate = { kind: "sim"; id: string; sim: Simulation } | { kind: "soon"; id: string; soon: SoonCareer };

// Every card in the hero row shares this height -- the Netflix reference row
// has no card taller than its neighbors, only wider ones. Width differs per
// card: the featured slot is 16:9 (Netflix's own billboard ratio), every
// other card is 210/297 (Browse's own PosterCard ratio). This row is the
// page's HERO: it must dominate every row below it, the way Netflix's
// billboard dwarfs the rows underneath -- at md the featured card is
// ~676px wide, and the sm side card is literally PosterCard's own 210x297.
// From sm up only -- phones render the MobileDeck stack instead of this rail
// (direct feedback, 10 Sept 2026, from a JioHotstar "For You" recording).
const ROW_HEIGHT = "sm:h-[300px] md:h-[380px] lg:h-[430px]";
// EXPLICIT widths (16:9 and 210/297 of ROW_HEIGHT) rather than aspect-ratio
// classes: the expand-in-place animation transitions `width` with CSS, so
// the card RE-LAYS-OUT each frame -- framer's transform-based `layout`
// animation scaled the contents and read as stretchy (direct feedback).
const FEATURED_W = "sm:w-[533px] md:w-[676px] lg:w-[764px]";
const SIDE_W = "sm:w-[212px] md:w-[269px] lg:w-[304px]";
// Rows BELOW the hero: uniform smaller shelves, Netflix-style.
const SHELF_HEIGHT = "h-[150px] sm:h-[170px] md:h-[195px]";
// Explicit 16:9 widths for the glossary shelf (of SHELF_HEIGHT) instead of
// an aspect-ratio class: inside a flex-none <li>, HoverBeam's wrapper divs
// gave the playable card no intrinsic width, so it collapsed to 2px and
// its neighbour rendered on top of it on mobile (direct feedback, 10 Sept
// 2026: "overlapping cards").
const SHELF_W = "w-[267px] sm:w-[302px] md:w-[347px]";
// "In the works" cards read too small at SHELF_HEIGHT (direct feedback, 9
// Sept 2026) -- closer to PosterCard's own real 210x297 poster size, scaled
// down slightly to still sit in a shelf row rather than the full browse grid.
const SOON_HEIGHT = "h-[210px] sm:h-[230px] md:h-[260px]";
// Netflix's row headers are bold, bright and readable -- not micro-labels.
const ROW_HEADER = "text-[15px] font-extrabold tracking-[0.06em] uppercase sm:text-[17px]";

// Same two-tier title sizing rule as Browse's PosterCard (24 standard, one
// fixed compact step when the longest word is 10+ chars so CONTROLLER-length
// words never clip), scaled per breakpoint since these cards grow with the
// viewport while PosterCard is a fixed 210x297.
function hasLongWord(title: string): boolean {
  return Math.max(...title.split(/[\s-]+/).map((word) => word.length)) >= 10;
}
// Zero-width space after hyphens: an explicit break opportunity so
// hyphenated compounds fold under keep-all instead of clipping (same
// treatment as PosterCard's breakableTitle).
function breakable(title: string): string {
  return title.replace(/-/g, "-\u200B");
}

/** Netflix-style "one dominant experience + a row of smaller choices"
 *  browsing pattern, replacing the old plain grid of full info-cards.
 *  Clicking a card selects it -- the row stays a uniform-height shelf of
 *  thumbnails (matching the Netflix reference exactly: the featured item is
 *  wider, never taller), and a details panel below the row carries the
 *  level ladder / CTA / "Coming soon" state for whichever card is
 *  currently selected, the way Netflix's own info panel sits below its row
 *  rather than being baked into one oversized card. */
function FeaturedRow({ simulations, soonCareers, focusId, hintReady }: { simulations: Simulation[]; soonCareers: SoonCareer[]; focusId?: string; hintReady: boolean }) {
  const candidates: FeaturedCandidate[] = useMemo(
    () => [
      ...simulations.map((sim): FeaturedCandidate => ({ kind: "sim", id: sim.id, sim })),
      ...soonCareers.map((soon): FeaturedCandidate => ({ kind: "soon", id: soon.careerId, soon })),
    ],
    [simulations, soonCareers],
  );
  const [featuredId, setFeaturedId] = useState<string | undefined>(
    (focusId && candidates.some((c) => c.id === focusId) ? focusId : undefined) ?? candidates[0]?.id,
  );
  // The cinematic trailer, opened ONLY from its own chip on the featured
  // card -- deliberately separate from starting the game, per direct
  // feedback (the handoff doc auto-plays it once on first open instead).
  const [trailerSim, setTrailerSim] = useState<Simulation | null>(null);
  const featured = candidates.find((c) => c.id === featuredId) ?? candidates[0];
  if (!featured) return null;

  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      {trailerSim?.trailer && <TrailerFlow simulation={trailerSim} onDone={() => setTrailerSim(null)} />}
      <h2 className={ROW_HEADER} style={{ color: "var(--foreground)" }}>
        Career Simulations
      </h2>
      {/* Phones: a swipeable stack, matching the JioHotstar "For You" deck
         the CEO recorded (10 Sept 2026) -- one tall poster in front, the
         next two fanned out behind it to the right, swipe left to advance.
         The front card is the featured one; there is no separate selection. */}
      <MobileDeck candidates={candidates} focusId={featured.id} hintReady={hintReady} onTrailer={(sim) => setTrailerSim(sim)} />
      {/* No CTA button anywhere -- the featured card carries a play badge
         in its bottom-right corner and is one whole-card link, with saved
         progress as a thin strip along the card's bottom edge (the exact
         idiom Netflix uses for partially-watched titles), per direct
         feedback. Every card shares one fixed ROW_HEIGHT (see above), so
         the featured card is wider than its neighbors, never taller. */}
      {/* Full-bleed rail: negative margins let the row run to the viewport
         edge, so the next card is always visibly PEEKING at the screen edge
         instead of clipping exactly at the content column (direct feedback).
         From lg up main is capped at 1200px and centred, so the bleed is
         computed against the viewport (50% - 50vw) rather than main's own
         padding; the root wrapper clips the scrollbar-width overhang. */}
      {/* Expand IN PLACE: cards keep their positions and the clicked one
         simply grows into the billboard while the old one shrinks (direct
         feedback -- reordering the row on every click read as a shuffle,
         not a selection). */}
      <div className="dreamari-card-rail hidden items-start gap-[var(--space-3)] overflow-x-auto pt-1 pb-3 sm:flex md:-mx-[var(--space-14)] md:px-[var(--space-14)] lg:mx-[calc(50%-50vw)] lg:px-[calc(50vw-50%)]">
        {candidates.map((c) => (
          <RowCard
            key={c.id}
            candidate={c}
            large={c.id === featured.id}
            onSelect={c.id === featured.id ? undefined : () => setFeaturedId(c.id)}
            onTrailer={(sim) => setTrailerSim(sim)}
          />
        ))}
      </div>
    </section>
  );
}

// The phone stack's geometry, measured off the reference recording (1180px
// frame, /3.147 to points): the card behind sits 16pt further right and
// ~6% smaller, scaled about its right edge so the fan grows rightward; the
// third one 32pt / ~12%. Anything deeper is parked (invisible) at the third
// slot so it can fan in without a jump when the deck rotates.
const DECK_STEP_X = 16;
const DECK_STEP_SCALE = 0.06;
const DECK_VISIBLE = 3;
const DECK_SPRING = { type: "spring", stiffness: 300, damping: 32, mass: 0.9 } as const;
const DECK_HINT_DELAY_MS = 2400;
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 550;

/** The phone-only card stack (hidden from sm up, where the free-scrolling
 *  rail takes over). Swipe left: the front card slides off and the deck
 *  rotates so it rejoins at the back. Swipe right: the previous card slides
 *  back in from the left. Idle hint: once the welcome splash is gone, if
 *  the student does nothing for a couple of seconds, the deck advances one
 *  card on its own -- a single time -- so it's obvious the stack moves and
 *  they can take over (direct feedback, 10 Sept 2026, from a JioHotstar
 *  recording). Any touch before that cancels it. */
function MobileDeck({ candidates, focusId, hintReady, onTrailer }: { candidates: FeaturedCandidate[]; focusId: string; hintReady: boolean; onTrailer: (sim: Simulation) => void }) {
  // Deck order, front first. The deep-linked/first card starts in front.
  const [order, setOrder] = useState<string[]>(() => {
    const ids = candidates.map((c) => c.id);
    const at = Math.max(0, ids.indexOf(focusId));
    return [...ids.slice(at), ...ids.slice(0, at)];
  });
  // While a card is on its way off-screen the rest of the deck already
  // moves up one slot; the rotation commits when the slide finishes.
  const [leaving, setLeaving] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  // The card that just came back from the bottom of the deck slides in
  // from the left rather than fanning in from the right.
  const [entering, setEntering] = useState<string | null>(null);
  const [width, setWidth] = useState(300);
  const slotRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width || 300);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    // one measurement before the first paint settles the offscreen distance
    const t = window.setTimeout(measure, 0);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  const advance = (dir: 1 | -1) => {
    if (leaving) return;
    setEntering(null);
    setLeaving({ id: order[0], dir });
  };
  const back = () => {
    if (leaving || order.length < 2) return;
    const last = order[order.length - 1];
    setEntering(last);
    setOrder([last, ...order.slice(0, -1)]);
  };
  const settle = () => {
    setOrder((o) => [...o.slice(1), o[0]]);
    setLeaving(null);
  };

  // Idle hint, once. Only on phones (this component only renders there),
  // only after the splash, never under reduced motion.
  useEffect(() => {
    if (!hintReady || touched.current) return;
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(min-width: 640px)").matches) return;
    const t = window.setTimeout(() => {
      if (!touched.current) advance(-1);
    }, DECK_HINT_DELAY_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintReady]);

  const offscreen = width + 60;
  return (
    <div
      className="relative w-full pt-1 pb-3 sm:hidden"
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      // A drag must never fall through as a tap on the card's link.
      onClickCapture={(e) => {
        if (dragged.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* the sizer: the front slot's own box, so the stack's height comes
         from the card ratio (319:386, measured off the recording) */}
      <div ref={slotRef} aria-hidden className="w-[calc(100%-32px)]" style={{ aspectRatio: "319 / 386" }} />
      {order.map((id, index) => {
        const candidate = candidates.find((c) => c.id === id);
        if (!candidate) return null;
        const isLeaving = leaving?.id === id;
        // everyone behind a leaving card already sits one slot forward
        const slot = leaving && !isLeaving ? index - 1 : index;
        const shown = isLeaving || slot < DECK_VISIBLE;
        const depth = Math.min(slot, DECK_VISIBLE - 1);
        const front = slot === 0 && !leaving;
        const target = isLeaving
          ? { x: leaving.dir * offscreen, scale: 1, opacity: 1 }
          : { x: depth * DECK_STEP_X, scale: 1 - depth * DECK_STEP_SCALE, opacity: shown ? 1 : 0 };
        const animate = entering === id && slot === 0 ? { ...target, x: [-offscreen, 0] } : target;
        return (
          <motion.div
            key={id}
            className="absolute top-1 bottom-3 left-0 w-[calc(100%-32px)]"
            style={{ originX: 1, originY: 0.5, zIndex: isLeaving ? DECK_VISIBLE + 2 : DECK_VISIBLE + 1 - slot, pointerEvents: front ? "auto" : "none", touchAction: "pan-y" }}
            initial={false}
            animate={animate}
            transition={DECK_SPRING}
            onAnimationComplete={() => {
              if (isLeaving) settle();
              if (entering === id) setEntering(null);
            }}
            drag={front ? "x" : false}
            dragDirectionLock
            dragSnapToOrigin
            dragMomentum={false}
            dragElastic={1}
            onDragStart={() => {
              dragged.current = true;
            }}
            onDragEnd={(_, info) => {
              // let the click-capture see the flag before clearing it
              window.setTimeout(() => {
                dragged.current = false;
              }, 0);
              if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) advance(-1);
              else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) back();
            }}
          >
            <RowCard candidate={candidate} large deck front={front} onTrailer={onTrailer} />
          </motion.div>
        );
      })}
    </div>
  );
}

/** One row thumbnail -- the featured card and every side card are the same
 *  bordered/rounded box at the shared ROW_HEIGHT, just a different aspect
 *  ratio (16:9 billboard vs. Browse-poster portrait). There is NO CTA
 *  button anywhere: a playable featured card is one whole-card link with a
 *  centered play badge on the artwork and saved progress as a thin strip
 *  along the bottom edge (Netflix's partially-watched idiom), per direct
 *  feedback. A real simulation side card is pressable -- clicking selects
 *  it into the featured slot. A "coming soon" one isn't: there's nothing
 *  to select it INTO, so it renders in full color as a plain,
 *  non-interactive card instead of a button, per direct feedback ("color
 *  but just not pressable"). */
function RowCard({
  candidate,
  large = false,
  deck = false,
  front = true,
  onSelect,
  onTrailer,
}: {
  candidate: FeaturedCandidate;
  /** Inside the phone stack: the card fills its deck slot (the slot sets
   *  the size), never the rail's own width/height classes. */
  deck?: boolean;
  /** Deck only: false for the cards fanned out behind the front one, whose
   *  corner badge and chips would otherwise peek out past the front card's
   *  edge as stray slivers. They fade back in as the card comes forward. */
  front?: boolean;
  /** The one featured card: 16:9 billboard aspect instead of the Browse-
   *  poster portrait every side card uses, and a bigger title to match --
   *  the extra width was making a title sized for a narrow poster look
   *  small and lost, per direct feedback. */
  large?: boolean;
  onSelect?: () => void;
  /** Featured card only: opens the career's cinematic trailer overlay. */
  onTrailer?: (sim: Simulation) => void;
}) {
  const title = candidate.kind === "sim" ? candidate.sim.title : candidate.soon.title;
  const world = candidate.kind === "sim" ? candidate.sim.world : candidate.soon.world;
  const cover = candidate.kind === "sim" ? candidate.sim.cover : candidate.soon.cover;
  // Every card reads left-aligned now: the play/lock badge lives in the
  // bottom-right corner (reference carousel, 10 Sept 2026), so the copy
  // keeps to the left of it on the side cards too.
  const className = `dm-tap group relative flex-none overflow-hidden rounded-[var(--radius-lg)] border text-left ${deck ? "h-full w-full" : `${ROW_HEIGHT} ${large ? FEATURED_W : SIDE_W}`}`;
  const style = {
    borderColor: "var(--color-glass-border-raised)",
    background: "var(--glass-surface-1)",
    // Inline because dm-tap's own transition shorthand (unlayered app.css)
    // beats any Tailwind transition utility -- this is what animates the
    // expand-in-place, re-laying-out each frame instead of scaling.
    transition: "width 0.5s cubic-bezier(0.16,1,0.3,1), transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
  };
  // Proportioned exactly like Browse: PosterCard is a 210x297 card with a
  // 24px title (19px compact) and a 10px world label -- the sm side card
  // here IS that size, and every other step scales the same ~8%-of-height
  // ratio up or down. Compact tier mirrors PosterCard's long-word rule.
  const compact = hasLongWord(title);
  const titleSize = large
    ? compact
      ? "text-[21px] sm:text-[27px] md:text-[33px] lg:text-[37px]"
      : "text-[26px] sm:text-[34px] md:text-[42px] lg:text-[46px]"
    : compact
      ? "text-[21px] sm:text-[19px] md:text-[24px] lg:text-[27px]"
      : "text-[26px] sm:text-[24px] md:text-[30px] lg:text-[34px]";
  const worldSize = large ? "text-[11px] sm:text-[13px] md:text-[15px]" : "text-[11px] sm:text-[10px] md:text-[13px] lg:text-[14px]";
  const content = (
    <div className="relative h-full w-full">
      <Image src={cover} alt="" fill sizes={large ? "(min-width: 1024px) 764px, 90vw" : "(min-width: 1024px) 304px, 45vw"} className="object-cover" />
      {candidate.kind === "soon" && !large && (
        <span className="absolute top-[8px] left-[8px] z-[1] flex items-center rounded-full px-[8px] py-[3px] text-[11px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          Coming soon
        </span>
      )}
      {/* Same scrim + title + world-label (in the world's own accent color)
         as Browse's own PosterCard -- accent color lives on the world
         label, never the title itself, matching that convention exactly. */}
      {/* Every card keeps its bottom-right corner clear for the play/lock
         badge (pr), so a long title wraps beside it instead of under it. */}
      <span className={`absolute inset-x-0 bottom-0 flex flex-col gap-[4px] px-[14px] pt-[32px] pb-[14px] sm:px-[16px] sm:pb-[14px] ${large ? "pr-[80px] sm:pr-[96px] md:pr-[108px]" : "pr-[64px] md:pr-[72px]"}`} style={{ backgroundImage: "var(--poster-scrim)" }}>
        {/* the series name, so Home, Play and the game itself all say
           "Day in the Life: <career>" (CEO, 4 Sept) */}
        {candidate.kind === "sim" && <span className={`block font-semibold tracking-[0.6px] uppercase ${worldSize}`} style={{ fontFamily: "var(--font-body)", color: "var(--poster-title)", opacity: 0.75 }}>Day in the Life</span>}
        <span className={`block leading-[1.15] font-extrabold uppercase transition-[font-size] duration-500 [overflow-wrap:normal] [word-break:keep-all] ${titleSize}`} style={{ ...posterTitleFont(world), color: "var(--poster-title)" }}>
          {breakable(title)}
        </span>
        <span className={`block font-semibold tracking-[0.6px] uppercase transition-[font-size] duration-500 ${worldSize}`} style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[world] }}>
          {world}
        </span>
        {large && candidate.kind === "soon" && (
          // plain text: the lock sits in the corner badge instead (direct
          // feedback, 10 Sept 2026)
          <span className="mt-[4px] text-[13px] font-bold sm:text-[14px]" style={{ color: "var(--foreground)" }}>
            Coming soon
          </span>
        )}
        {large && candidate.kind === "sim" && <FeaturedMeta sim={candidate.sim} />}
      </span>
      {/* The corner badge on EVERY card: play on a playable simulation, a
         lock on one that's still in the works (direct feedback, 10 Sept
         2026: "include the play button on registered nurse too ... show
         the locked icon for the rest"). */}
      <CornerBadge kind={candidate.kind === "sim" ? "play" : "lock"} large={large} faded={deck && !front} />
      {large && candidate.kind === "sim" && <FeaturedPlayOverlay sim={candidate.sim} faded={deck && !front} onTrailer={onTrailer ? () => onTrailer(candidate.sim) : undefined} />}
    </div>
  );

  // ONE persistent element per candidate: the same keyed <article> simply
  // transitions its WIDTH into the featured size in place -- a CSS width
  // transition re-lays-out the contents each frame, where framer's
  // transform-based layout animation scaled them (read as stretchy), and
  // the earlier two-element layoutId version froze the incoming card at
  // opacity 0. It is never a <button>: the featured state holds a real
  // <Link> overlay, so a pressable side card gets its own absolute overlay
  // button instead (same idiom as the whole-card links across the app).
  return (
    <article data-card-id={candidate.id} className={`dm-tap ${className}`} style={style}>
      {content}
      {!large && candidate.kind === "sim" && onSelect && (
        <button type="button" onClick={onSelect} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]">
          <span className="sr-only">Feature {candidate.sim.title}</span>
        </button>
      )}
    </article>
  );
}

/** The bottom-right circular badge every hero-row card carries, where the
 *  reference carousel puts its play control (direct feedback, 10 Sept
 *  2026): a play glyph on a real simulation, a lock on a coming-soon one.
 *  Purely visual (aria-hidden) -- the whole-card link or select button
 *  underneath is the control. */
function CornerBadge({ kind, large, faded = false }: { kind: "play" | "lock"; large: boolean; faded?: boolean }) {
  const size = large ? "size-[52px] sm:size-[64px] md:size-[72px]" : "size-[44px] md:size-[52px]";
  const glyph = large ? "h-[22px] w-[22px] sm:h-[26px] sm:w-[26px] md:h-[30px] md:w-[30px]" : "h-[18px] w-[18px] md:h-[22px] md:w-[22px]";
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute right-[14px] bottom-[14px] z-[2] flex items-center justify-center rounded-full border backdrop-blur-[6px] transition-[transform,opacity] duration-300 group-hover:scale-110 sm:right-[16px] sm:bottom-[16px] ${size} ${faded ? "opacity-0" : "opacity-100"}`}
      style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
    >
      {kind === "play" ? <Play className={`ml-[3px] ${glyph}`} fill="currentColor" style={{ color: "#FFFFFF" }} /> : <Lock className={glyph} style={{ color: "#FFFFFF" }} />}
    </span>
  );
}

/** The featured card's signal line, inside the same scrim as the title:
 *  "Level 1 · Intern" on a fresh game, and when there's a saved run the
 *  SAME spot carries the percentage and a real progress bar instead, per
 *  direct feedback. Subscribes to progress itself; only mounted for a
 *  "sim" candidate, so there's no conditional-hook risk. */
function FeaturedMeta({ sim }: { sim: Simulation }) {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const first = sim.levels[0];
  const run = readRun(progress, sim.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  const pct = resumable ? Math.round((resumable.index / first.beats.length) * 100) : 0;
  return (
    <span className="mt-[3px] flex flex-col gap-[6px]">
      {/* poster-title-derived color so it stays legible over the theme-aware
         scrim in BOTH themes (a hardcoded white would vanish on the light
         theme's light scrim). */}
      <span className="text-[12px] leading-[15px] font-bold sm:text-[14px] sm:leading-[18px]" style={{ fontFamily: "var(--font-body)", color: "var(--poster-title)", opacity: 0.85 }}>
        {resumable ? `Level ${first.n} · ${first.role} · ${pct}% done` : `Level ${first.n} · ${first.role}`}
      </span>
      {resumable && (
        <span aria-hidden className="block w-full max-w-[300px]">
          <SparkBar percent={pct} height={5} track="color-mix(in srgb, var(--poster-title) 25%, transparent)" fill="var(--primary)" glow="var(--primary)" />
        </span>
      )}
    </span>
  );
}

/** The playable featured card's interaction layer: one whole-card link and
 *  a centered play badge riding on the artwork (no CTA button, per direct
 *  feedback) -- the level/progress signal lives in FeaturedMeta, inside
 *  the scrim with the title. The trailer is deliberately SEPARATE from
 *  starting the game (per direct feedback, overriding the doc's
 *  play-once-on-first-open rule): a quiet Trailer chip in the card's
 *  corner opens it, and pressing play never does. */
function FeaturedPlayOverlay({ sim, faded = false, onTrailer }: { sim: Simulation; faded?: boolean; onTrailer?: () => void }) {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const first = sim.levels[0];
  const run = readRun(progress, sim.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  return (
    <>
      <Link href={`/play/${sim.id}`} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]">
        <span className="sr-only">{resumable ? `Continue ${sim.title} · Level ${first.n}` : `Play ${sim.title} · Level ${first.n}`}</span>
      </Link>
      <span className={`absolute top-[10px] right-[10px] z-20 flex items-center gap-[6px] transition-opacity duration-300 ${faded ? "opacity-0" : "opacity-100"}`}>
        {/* Express mode: the trimmed demo run (Level 1 minus its teaching
           screens; every scored beat, threshold and ending intact). Only
           offered when the level declares an expressCut list. */}
        {first.expressCut && first.expressCut.length > 0 && (
          <Link
            href={`/play/${sim.id}?mode=express`}
            className="dm-quiet flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[13px] text-[11.5px] font-semibold backdrop-blur-[8px]"
            style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.35)", color: "#FFFFFF" }}
          >
            <Zap className="h-[13px] w-[13px]" aria-hidden />
            Express mode
          </Link>
        )}
        {sim.trailer && onTrailer && (
          // "Watch trailer", the full verb phrase, per direct feedback -- a
          // chip reading just "Trailer" made the whole featured card sound
          // like it WAS a trailer rather than the game.
          <button
            type="button"
            onClick={onTrailer}
            className="dm-quiet flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[13px] text-[11.5px] font-semibold backdrop-blur-[8px]"
            style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.35)", color: "#FFFFFF" }}
          >
            <Film className="h-[13px] w-[13px]" aria-hidden />
            Watch trailer
          </button>
        )}
      </span>
    </>
  );
}

/** A titled shelf of locked "Soon" cards -- career sims not yet built. A
 *  horizontal scroll row of small uniform posters (Netflix's own below-
 *  the-billboard shelves), deliberately smaller than the hero row above so
 *  the page reads billboard-first. */
function SoonSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <h2 className={ROW_HEADER} style={{ color: "var(--foreground)" }}>
        {label}
      </h2>
      {/* Full-bleed rail, same idiom as FeaturedRow/Glossary Games above
         (direct feedback, 9 Sept 2026: "dont have them cut off like this,
         let them overflow till the edge of the screen ... so its obvious
         its scrollable but the cards still peak"). */}
      <ul className="dreamari-card-rail -mx-5 flex list-none gap-[var(--space-3)] overflow-x-auto p-0 px-5 pt-1 pb-3 md:-mx-[var(--space-14)] md:px-[var(--space-14)] lg:mx-[calc(50%-50vw)] lg:px-[calc(50vw-50%)]">{children}</ul>
    </section>
  );
}

/** One locked card: either a full-color photo cover (kept colorful, not
 *  dimmed/grayscale -- direct feedback, 9 Sept 2026: "dont greyscale the
 *  coming soon thumbnails, let them be colorful") or a flat icon tile when
 *  there's no cover art yet (the
 *  Glossary Game type has no image asset at all, same as Home's own
 *  "TODAY'S GLOSSARY CHALLENGE" banner uses an icon rather than a photo). */
function SoonCard({ title, cover, icon }: { title: string; cover?: string; icon?: React.ReactNode }) {
  return (
    <li className="flex-none">
      <span
        className={`relative flex aspect-[210/297] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border p-[10px] ${SOON_HEIGHT}`}
        style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}
      >
        {cover ? (
          <>
            {/* Colour kept (direct feedback, 9 Sept 2026), but eased to 80%
               so a locked card reads as not-yet rather than tappable (UX
               audit, 11 Sept 2026). */}
            <Image src={cover} alt="" fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover opacity-80" />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--background) 92%, transparent) 100%)" }}
            />
          </>
        ) : (
          <span aria-hidden className="absolute top-[14px] left-[10px] flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)]" style={{ background: "var(--world-business-money-office)", color: "var(--background)" }}>
            {icon}
          </span>
        )}
        <span className="relative flex w-fit items-center gap-[5px] rounded-full px-[8px] py-[3px] text-[11px] font-bold" style={{ color: "var(--foreground)", background: "rgba(5,8,20,0.6)" }}>
          <Lock className="h-[12px] w-[12px]" aria-hidden />
          Soon
        </span>
        <span className="relative text-[14px] leading-tight font-extrabold" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
      </span>
    </li>
  );
}

/** A Glossary Game shelf card: title and sub live INSIDE the artwork's own
 *  bottom scrim, same as every other Play card (a Netflix thumbnail, not
 *  an image-plus-caption block that ends up taller than the hero row), with
 *  a small centered play badge echoing the featured card's. The row header
 *  already says "Glossary Games", so the card itself carries no type chip
 *  (direct feedback, 9 Sept 2026). A career with no authored content yet
 *  (!playable) renders as a dim, non-linking "Coming soon" dummy -- same
 *  idiom as SoonCard below -- rather than a real link into an empty game. */
function GlossaryGameCard({ game, playable }: { game: { careerSlug: string; title: string; sub: string; cover?: string }; playable: boolean }) {
  const art = (
    <>
      {game.cover ? (
        <Image src={game.cover} alt="" fill sizes="(min-width: 768px) 347px, 60vw" className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--glossary-accent, var(--world-business-money-office)) 20%, var(--card))" }}>
          <BookOpen className="h-10 w-10" style={{ color: "var(--glossary-accent, var(--world-business-money-office))" }} aria-hidden />
        </span>
      )}
      {playable ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 flex size-[40px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110 sm:size-[46px]"
          style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
        >
          <Play className="ml-[2px] h-[16px] w-[16px]" fill="currentColor" style={{ color: "#FFFFFF" }} />
        </span>
      ) : (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--background) 92%, transparent) 100%)" }}
        />
      )}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-[1px] px-[12px] pt-[26px] pb-[10px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
        {!playable && (
          <span className="flex items-center gap-[5px] pb-[2px] text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            <Lock className="h-[12px] w-[12px]" aria-hidden />
            Coming soon
          </span>
        )}
        <span className="text-[14px] leading-[18px] font-extrabold sm:text-[16px] sm:leading-[20px]" style={{ fontFamily: "var(--font-display)", color: "var(--poster-title)" }}>
          {game.title}
        </span>
        <span className="text-[10.5px] sm:text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
          {game.sub}
        </span>
      </span>
    </>
  );

  if (!playable) {
    return (
      <span
        aria-label={`${game.title} — coming soon`}
        className={`group relative block flex-none overflow-hidden rounded-[var(--radius-lg)] border ${SHELF_W} ${SHELF_HEIGHT}`}
        style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}
      >
        {art}
      </span>
    );
  }

  return (
    // Size on this plain box, HoverBeam fills it: with the size classes on
    // HoverBeam its own h-full won and the card collapsed to a line on
    // phones (direct feedback, 11 Sept 2026).
    <div className={`flex-none ${SHELF_W} ${SHELF_HEIGHT}`}>
    <HoverBeam strength={0.8}>
    <Link
      href={`/play/glossary/${game.careerSlug}`}
      className={`dm-tap group relative block h-full w-full overflow-hidden rounded-[var(--radius-lg)] border ${SHELF_HEIGHT}`}
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}
    >
      {art}
    </Link>
    </HoverBeam>
    </div>
  );
}

