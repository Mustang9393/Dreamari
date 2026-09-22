"use client";

import Image from "next/image";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { FirstVisitSplash } from "@/components/app/WelcomeSplash";
import { SparkBar } from "@/components/flow/SparkBar";
import { NextStepBanner } from "@/components/app/NextStepBanner";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ChevronRight, BookOpen, Film, Lock, Play, Zap } from "lucide-react";

import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { hasGlossary } from "@/components/glossary/data";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { FEATURED_ROW_SOON_IDS, GLOSSARY_GAMES, SIMULATIONS, SOON, worldForCareer } from "./games";
import { TrailerFlow } from "./TrailerFlow";
import type { Simulation } from "./types";

// The Play tab: every career simulation in one place. A student's own Top 3
// comes first, because a game for a career they already chose is the one worth
// playing. Copy is deliberately thin -- the art and the level ladder say it.

// Stable row order, top to bottom -- also the default/fallback active row
// (Career Simulations, matching "simulations stay dominant by default").
const PLAY_ROW_IDS = ["simulations", "glossary", "soon"];

// TV UX (direct feedback, 21 Sept 2026: "he wants all rows like this" --
// the row-focus treatment Glossary Games got on hover, but the actual
// trigger Josh meant is scroll: whichever row you've scrolled to becomes
// the dominant one, every other row recedes, same as Apple TV/Netflix's
// own row navigation). Hover has no equivalent on a touch device at all,
// so scroll position is the one signal that works identically on desktop
// AND mobile -- this hook is what makes that possible: a single shared
// IntersectionObserver watching a thin band across the vertical CENTER of
// the viewport (rootMargin trims 45% off the top and bottom, leaving a
// 10%-tall strip in the middle), and whichever registered row is
// currently crossing that strip is "the" active one. Ties and gaps keep
// the previous answer rather than flickering to null between rows.
function useCenteredRow(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const ratios = useRef<Record<string, number>>({});
  useEffect(() => {
    const els = ids
      .map((id) => document.querySelector<HTMLElement>(`[data-row-id="${id}"]`))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-row-id");
          if (id) ratios.current[id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const id of ids) {
          const r = ratios.current[id] ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);
  return active;
}

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
  // Which row the pointer/scroll is currently on (see useCenteredRow) --
  // shared across every row on the page, not just Glossary Games, per
  // direct feedback: "he wants all rows like this."
  const scrollActiveRow = useCenteredRow(PLAY_ROW_IDS);
  // A real mouse hover OVERRIDES the scroll answer -- direct report, 22
  // Sept 2026 (Josh, on a large Chrome screen): "the glossary games row
  // scales up and does its job but when he hovers back on the first row it
  // doesnt hover or scale up." The scroll-centered IntersectionObserver
  // above is a real fix for touch (no hover exists there at all), but a
  // mouse user on a tall/wide screen where every row already fits on
  // screen never actually SCROLLS back up to row 1 -- they just move the
  // pointer there, which the scroll-only mechanism has no way to notice,
  // so the row stays stuck compact. Hovering any row's own section now
  // takes over immediately; leaving it falls back to whatever the scroll
  // position itself says, so touch/keyboard-scroll behavior is unchanged.
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const activeRow = hoveredRow ?? scrollActiveRow;
  function rowHoverProps(id: string) {
    return {
      onMouseEnter: () => setHoveredRow(id),
      // Only clear if this row is still the one that set it -- guards
      // against the leave of the row you're moving AWAY from firing after
      // the enter of the one you're moving INTO and wiping out its state.
      onMouseLeave: () => setHoveredRow((current) => (current === id ? null : current)),
    };
  }

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
      {/* The Play TAB (this hub) uses the same background as every other
         tab (direct feedback, 21 Sept 2026: "Dont change the background of
         the PLAY TAB. Use the same background as other tabs. ONLY CHANGE
         THE BACKGROUND OF THE IN GAME BACKGROUND") -- PlayBackdrop's own
         "new world" treatment is scoped to actual gameplay screens
         (GlossaryGameExperience) only, not this landing hub. */}
      <AppBackdrop />
      <FirstVisitSplash surface="play" onOpenChange={(open) => setSplashSettled(!open)} />

      <DesktopNavigation active="Play" />

      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] sm:px-[var(--space-14)] md:pt-[var(--space-10)]">
        <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>
          Play
        </h1>

        <FeaturedRow
          simulations={[...mine, ...rest]}
          soonCareers={featuredRowSoon}
          focusId={focusId}
          hintReady={splashSettled}
          active={activeRow === "simulations"}
          hoverProps={rowHoverProps("simulations")}
        />

        {/* Glossary Games: split by whether the career actually has authored
           content (hasGlossary) -- Finance Essentials has a real page now,
           so it gets a real playable card; the rest are dummy "Coming soon"
           cards that fill out the row rather than link anywhere (direct
           feedback, 9 Sept 2026: "they dont have to work or lead anywhere,
           theyre just dummy cards to fill the row"), same idiom as the
           career-simulation placeholders below. Same hero+side shape as
           Career Simulations now too (direct feedback, 21 Sept 2026), via
           the shared HeroShelfRow. */}
        {GLOSSARY_GAMES.length > 0 && (
          <HeroShelfRow
            rowId="glossary"
            active={activeRow === "glossary"}
            hoverProps={rowHoverProps("glossary")}
            label="Glossary Games"
            items={GLOSSARY_GAMES.map((game) => {
              const playable = hasGlossary(game.careerSlug);
              return {
                id: game.careerSlug,
                title: game.title,
                cover: game.cover,
                sub: game.sub,
                world: worldForCareer(game.careerSlug),
                href: playable ? `/play/glossary/${game.careerSlug}` : undefined,
                locked: !playable,
              };
            })}
          />
        )}
        {/* The bridge from Play to Explore (Joshua Pierce, Slack, 5 Sept 2026):
           Play is for experiencing careers, Explore for discovering them.
           Sits after the Glossary Games so it closes the page instead of
           interrupting it (direct feedback, 6 Sept 2026). Not a row itself
           (no cards, nothing to focus), so it sits outside the row-focus
           system entirely -- always at rest. */}
        <NextStepBanner
          eyebrow="Looking for another career to play?"
          text="Explore more careers and find another simulation to play."
          ctaLabel="Explore"
          href="/explore"
          Icon={ChevronRight}
          storageKey="dreamari:play-explore-bridge-dismissed"
        />

        <HeroShelfRow
          rowId="soon"
          active={activeRow === "soon"}
          hoverProps={rowHoverProps("soon")}
          label="In the works"
          items={soon.map((game) => ({ id: game.careerId, title: game.title, cover: game.cover, world: game.world, locked: true }))}
        />
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
// From sm up only -- phones render the CardDeck stack instead of this rail
// (direct feedback, 10 Sept 2026, from a JioHotstar "For You" recording).
const ROW_HEIGHT = "sm:h-[300px] md:h-[380px] lg:h-[430px]";
// EXPLICIT widths (16:9 and 210/297 of ROW_HEIGHT) rather than aspect-ratio
// classes: the expand-in-place animation transitions `width` with CSS, so
// the card RE-LAYS-OUT each frame -- framer's transform-based `layout`
// animation scaled the contents and read as stretchy (direct feedback).
const FEATURED_W = "sm:w-[533px] md:w-[676px] lg:w-[764px]";
const SIDE_W = "sm:w-[212px] md:w-[269px] lg:w-[304px]";
// Every row below the hero now shares these same three constants too
// (HeroShelfRow) -- there is no separate smaller "shelf" size left to
// carry (direct feedback, 21 Sept 2026: "same sized cards" as Career
// Simulations, not a smaller lookalike).
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
function FeaturedRow({
  simulations,
  soonCareers,
  focusId,
  hintReady,
  active,
  hoverProps,
}: {
  simulations: Simulation[];
  soonCareers: SoonCareer[];
  focusId?: string;
  hintReady: boolean;
  /** Whether scroll has brought this row into focus (see useCenteredRow,
   *  PlayHub) -- when false the rail falls back to the same COMPACT card
   *  size every other row rests at, instead of staying big and merely
   *  dimming: "only the focused row should look like that... the other
   *  [rows] should have the same card sizes when not focused" (direct
   *  feedback, 21 Sept 2026). The phone deck below is unaffected -- it has
   *  no compact state of its own, same as before. */
  active: boolean;
  /** onMouseEnter/onMouseLeave that let a real mouse hover claim focus
   *  directly, bypassing scroll -- see PlayHub's own rowHoverProps. */
  hoverProps: { onMouseEnter: () => void; onMouseLeave: () => void };
}) {
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
  const sectionRef = useRef<HTMLElement>(null);
  if (!featured) return null;

  return (
    <section ref={sectionRef} data-row-id="simulations" className="flex flex-col gap-[var(--space-3)]" {...hoverProps}>
      {trailerSim?.trailer && <TrailerFlow simulation={trailerSim} onDone={() => setTrailerSim(null)} />}
      <h2
        className={`${ROW_HEADER} transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{ color: active ? "var(--glossary-accent, var(--world-business-money-office))" : "var(--foreground)" }}
      >
        Career Simulations
      </h2>
      {/* Phones: a swipeable stack, matching the JioHotstar "For You" deck
         the CEO recorded (10 Sept 2026) -- one tall poster in front, the
         next two fanned out behind it to the right, swipe left to advance.
         The front card is the featured one; there is no separate selection. */}
      <CardDeck
        items={candidates}
        focusId={featured.id}
        hintReady={hintReady}
        renderCard={(candidate, front) => <RowCard candidate={candidate} large deck front={front} onTrailer={(sim) => setTrailerSim(sim)} />}
      />
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
            active={active}
            large={active && c.id === featured.id}
            // Granted whenever this card ISN'T the current active hero --
            // that includes a compact-tier card that happens to already be
            // `featured` (direct feedback, 21 Sept 2026, a real bug: "when
            // i hover [scroll] to go back to Day in the Life of Investment
            // Banker, the career simulations stay small"). Previously this
            // only fired for `active && c.id !== featured.id`, so once the
            // row scrolled out of focus its OWN featured card had neither
            // this button NOR the large-only Link overlay -- completely
            // inert, with no way to bring the row back into focus by
            // clicking it. Scrolling the row into the centered band here
            // reuses the existing IntersectionObserver (useCenteredRow)
            // rather than adding a second, competing "active" source.
            onSelect={!active || c.id !== featured.id ? () => {
              setFeaturedId(c.id);
              if (!active) sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            } : undefined}
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
 *  rail takes over) -- generic over the row, so every row gets the exact
 *  same mobile treatment Career Simulations pioneered instead of a
 *  cramped, narrower-feeling version of the desktop rail (direct feedback,
 *  21 Sept 2026, after seeing Glossary Games/In the works on phone: "its
 *  messed up lets use the same style for the hero row for the rest").
 *  Swipe left: the front card slides off and the deck rotates so it
 *  rejoins at the back. Swipe right: the previous card slides back in from
 *  the left. Idle hint: once `hintReady` is passed (Career Simulations
 *  only, per its own direct feedback, 10 Sept 2026, from a JioHotstar
 *  recording), if the student does nothing for a couple of seconds the
 *  deck advances one card on its own -- a single time -- so it's obvious
 *  the stack moves and they can take over. Any touch before that cancels
 *  it; omitting `hintReady` (every other row) skips the hint entirely. */
function CardDeck<T extends { id: string }>({
  items,
  focusId,
  hintReady,
  renderCard,
}: {
  items: T[];
  focusId: string;
  hintReady?: boolean;
  renderCard: (item: T, front: boolean) => React.ReactNode;
}) {
  // Deck order, front first. The deep-linked/first card starts in front.
  const [order, setOrder] = useState<string[]>(() => {
    const ids = items.map((c) => c.id);
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
        const item = items.find((c) => c.id === id);
        if (!item) return null;
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
            {renderCard(item, front)}
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
// Custom-designed edge case, 22 Sept 2026: neither RowCard nor
// HeroShelfCard handled a failed `cover` load (HeroShelfCard already had
// a fallback for a MISSING cover -- BookOpen on a tinted circle -- but
// not for one that's present but 404s). Confirmed PlayHub never imports
// PosterCard, so the app-wide PosterPhoto fix (Explore, 22 Sept) doesn't
// reach this file -- it has its own bespoke card components, hit by
// every single card on the hub (Simulations, Glossary Games, "In the
// works"). Reuses HeroShelfCard's own existing no-cover visual for a
// failed one too, rather than introducing a second "missing image" look
// on the same page.
function CoverPhoto({ src, world, sizes, className }: { src?: string; world?: string; sizes: string; className: string }) {
  const [failed, setFailed] = useState(false);
  const tint = (world && WORLD_COLORS[world]) || "var(--glossary-accent, var(--world-business-money-office))";
  if (!src || failed) {
    return (
      <span aria-hidden className="absolute inset-0 flex items-center justify-center" style={{ background: `color-mix(in srgb, ${tint} 20%, var(--card))` }}>
        <BookOpen className="h-10 w-10" style={{ color: tint }} aria-hidden />
      </span>
    );
  }
  return <Image src={src} alt="" fill sizes={sizes} className={className} onError={() => setFailed(true)} />;
}

function RowCard({
  candidate,
  active = false,
  large = false,
  deck = false,
  front = true,
  onSelect,
  onTrailer,
}: {
  candidate: FeaturedCandidate;
  /** Whether this card's row is the one scroll has brought into focus.
   *  Ignored in deck mode (the phone stack has no compact state). Drives
   *  the three real size tiers below -- same split HeroShelfCard uses, so
   *  "only the focused row should look like that" is true of every row,
   *  Career Simulations included (direct feedback, 21 Sept 2026). */
  active?: boolean;
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
  // Three real size tiers, not two -- "hero" (this row active, this card
  // featured), "side" (row active, a different card featured), "compact"
  // (row at rest, same COMPACT_W/COMPACT_HEIGHT every other row rests at).
  const tier = large ? "hero" : active ? "side" : "compact";
  // Every card reads left-aligned now: the play/lock badge lives in the
  // bottom-right corner (reference carousel, 10 Sept 2026), so the copy
  // keeps to the left of it on the side cards too.
  const sizeClass = tier === "hero" ? `${ROW_HEIGHT} ${FEATURED_W}` : tier === "side" ? `${ROW_HEIGHT} ${SIDE_W}` : `${COMPACT_HEIGHT} ${COMPACT_W}`;
  const className = `dm-tap group relative flex-none overflow-hidden rounded-[var(--radius-lg)] border text-left ${deck ? "h-full w-full" : sizeClass}`;
  const style = {
    borderColor: "var(--color-glass-border-raised)",
    background: "var(--glass-surface-1)",
    // Inline because dm-tap's own transition shorthand (unlayered app.css)
    // beats any Tailwind transition utility -- this is what animates the
    // expand-in-place, re-laying-out each frame instead of scaling.
    transition: "width 0.5s cubic-bezier(0.16,1,0.3,1), height 0.5s cubic-bezier(0.16,1,0.3,1), transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
  };
  // Proportioned exactly like Browse: PosterCard is a 210x297 card with a
  // 24px title (19px compact) and a 10px world label -- the sm side card
  // here IS that size, and every other step scales the same ~8%-of-height
  // ratio up or down. Compact tier mirrors PosterCard's long-word rule.
  const compact = hasLongWord(title);
  const titleSize =
    tier === "hero"
      ? compact
        ? "text-[21px] sm:text-[27px] md:text-[33px] lg:text-[37px]"
        : "text-[26px] sm:text-[34px] md:text-[42px] lg:text-[46px]"
      : tier === "side"
        ? compact
          ? "text-[21px] sm:text-[19px] md:text-[24px] lg:text-[27px]"
          : "text-[26px] sm:text-[24px] md:text-[30px] lg:text-[34px]"
        : "text-[14px] leading-[18px] sm:text-[16px] sm:leading-[20px]";
  const worldSize = tier === "hero" ? "text-[11px] sm:text-[13px] md:text-[15px]" : tier === "side" ? "text-[11px] sm:text-[10px] md:text-[13px] lg:text-[14px]" : "text-[10.5px] sm:text-[11.5px]";
  const content = (
    <div className="relative h-full w-full">
      <CoverPhoto src={cover} world={world} sizes={large ? "(min-width: 1024px) 764px, 90vw" : tier === "compact" ? "(min-width: 768px) 347px, 60vw" : "(min-width: 1024px) 304px, 45vw"} className="object-cover" />
      {candidate.kind === "soon" && !large && (
        <span className={`absolute top-[8px] left-[8px] z-[1] flex items-center rounded-full px-[8px] py-[3px] text-[11px] font-bold ${tier === "compact" ? "gap-[5px]" : ""}`} style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          {tier === "compact" && <Lock className="h-[12px] w-[12px]" aria-hidden />}
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

// A row candidate, generalized past FeaturedCandidate/Simulation so ANY
// row can use the exact hero+side mechanism Career Simulations pioneered
// (direct feedback, 21 Sept 2026: "when i get to glossary games it has to
// have the same design as the simulation row, same sized cards, one card
// large and hero style, the other on the row narrower, opening up to be
// like the selected card when tapped... then the in the works does that
// too"). world/sub are alternate second lines under the title (a
// simulation and In the works show world; Glossary Games shows its own
// one-line "sub" instead) -- never both at once.
type HeroItem = { id: string; title: string; cover?: string; world?: string; sub?: string; href?: string; locked?: boolean };

// The resting size for a row that ISN'T in focus -- a real TV's own
// remote-navigation pattern (direct description, 21 Sept 2026: "on a tv,
// the other rows show normal narrow cards but when i hit the down arrow
// on my remote they come into view with large tile hero + narrow cards to
// the right"): every row starts here, uniform and small, and only the one
// row currently in focus morphs into the FEATURED_W/SIDE_W hero shape.
// Scroll is this app's own "down arrow" (useCenteredRow, PlayHub).
const COMPACT_HEIGHT = "h-[150px] sm:h-[170px] md:h-[195px]";
const COMPACT_W = "w-[267px] sm:w-[302px] md:w-[347px]";

/** One row, Netflix/Apple-TV shaped: AT REST every card is the same small
 *  COMPACT size; once `active` (this row is the one in focus -- see
 *  useCenteredRow), it morphs into a single FEATURED_W hero card plus a
 *  shelf of narrower SIDE_W cards, all sharing ROW_HEIGHT -- the same
 *  three constants FeaturedRow's own RowCard uses, so "same sized cards"
 *  is true by construction once focused, not just similar-looking.
 *  Tapping a side card (active rows only) doesn't navigate: it becomes
 *  the new hero, expanding in place -- exactly RowCard's own selection
 *  model, reused rather than reinvented. */
function HeroShelfRow({
  rowId,
  label,
  items,
  active,
  hoverProps,
}: {
  rowId: string;
  label: string;
  items: HeroItem[];
  active: boolean;
  /** onMouseEnter/onMouseLeave that let a real mouse hover claim focus
   *  directly, bypassing scroll -- see PlayHub's own rowHoverProps. */
  hoverProps: { onMouseEnter: () => void; onMouseLeave: () => void };
}) {
  const [featuredId, setFeaturedId] = useState<string | undefined>(items[0]?.id);
  const featured = items.find((item) => item.id === featuredId) ?? items[0];
  const sectionRef = useRef<HTMLElement>(null);
  if (!featured) return null;
  return (
    <section ref={sectionRef} data-row-id={rowId} className="flex flex-col gap-[var(--space-3)]" {...hoverProps}>
      <h2
        className={`${ROW_HEADER} transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{ color: active ? "var(--glossary-accent, var(--world-business-money-office))" : "var(--foreground)" }}
      >
        {label}
      </h2>
      {/* Phones: the same swipeable stack Career Simulations uses, not a
         shrunk-further version of the desktop rail (direct feedback, 21
         Sept 2026, after seeing this row on phone: "its messed up lets use
         the same style for the hero row for the rest"). The front card is
         always the row's current "featured" pick; there is no separate
         compact tier on phones at all. */}
      <CardDeck items={items} focusId={featured.id} renderCard={(item, front) => <HeroShelfCard item={item} deck front={front} />} />
      <div className="dreamari-card-rail hidden items-start gap-[var(--space-3)] overflow-x-auto pt-1 pb-3 sm:flex md:-mx-[var(--space-14)] md:px-[var(--space-14)] lg:mx-[calc(50%-50vw)] lg:px-[calc(50vw-50%)]">
        {items.map((item) => (
          <HeroShelfCard
            key={item.id}
            item={item}
            active={active}
            large={active && item.id === featured.id}
            // Granted whenever this card isn't the active hero -- including
            // a compact card that already IS `featured` (same fix as
            // FeaturedRow above: that combination previously had no select
            // control and no Link overlay, so it was inert once the row
            // scrolled out of focus). A compact-tier tap also scrolls the
            // row into the centered band, which is what actually brings it
            // into focus (HeroShelfCard's own comment already described
            // this as the intent -- "that's what BRINGS the row into focus
            // on touch" -- but the `active &&` guard here contradicted it).
            onSelect={!active || item.id !== featured.id ? () => {
              setFeaturedId(item.id);
              if (!active) sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            } : undefined}
          />
        ))}
      </div>
    </section>
  );
}

/** One card inside a HeroShelfRow -- content-wise a trimmed RowCard (no
 *  trailer chip, no saved-progress meta; those stay specific to a real
 *  simulation), but the sizing, the width/height-transition morph, the
 *  scrim/title/corner-badge layout are the identical values and structure
 *  RowCard uses, not a lookalike copy. Three real size tiers, not two:
 *  "hero" (active row, this card selected), "side" (active row, a
 *  different card selected), "compact" (row at rest -- every card here,
 *  regardless of which one a later focus would pick as hero). `deck`/
 *  `front` mirror RowCard's own: inside a phone CardDeck this card always
 *  renders at "hero" size filling its deck slot, `front` fading the corner
 *  badge on the cards fanned out behind the front one (direct feedback, 21
 *  Sept 2026: Glossary Games/In the works get the same phone stack Career
 *  Simulations already had, not the compact rail shrunk down further). */
function HeroShelfCard({ item, large = false, active = false, onSelect, deck = false, front = true }: { item: HeroItem; large?: boolean; active?: boolean; onSelect?: () => void; deck?: boolean; front?: boolean }) {
  const tier = deck || large ? "hero" : active ? "side" : "compact";
  const compactWord = hasLongWord(item.title);
  const titleSize =
    tier === "hero"
      ? compactWord
        ? "text-[21px] sm:text-[27px] md:text-[33px] lg:text-[37px]"
        : "text-[26px] sm:text-[34px] md:text-[42px] lg:text-[46px]"
      : tier === "side"
        ? compactWord
          ? "text-[21px] sm:text-[19px] md:text-[24px] lg:text-[27px]"
          : "text-[26px] sm:text-[24px] md:text-[30px] lg:text-[34px]"
        : "text-[14px] leading-[18px] sm:text-[16px] sm:leading-[20px]";
  const subSize = tier === "hero" ? "text-[11px] sm:text-[13px] md:text-[15px]" : tier === "side" ? "text-[11px] sm:text-[10px] md:text-[13px] lg:text-[14px]" : "text-[10.5px] sm:text-[11.5px]";
  const content = (
    <div className="relative h-full w-full">
      <CoverPhoto src={item.cover} world={item.world} sizes={tier === "hero" ? "(min-width: 1024px) 764px, 90vw" : tier === "side" ? "(min-width: 1024px) 304px, 45vw" : "(min-width: 768px) 347px, 60vw"} className="object-cover" />
      {item.locked && tier !== "hero" && (
        <span className={`absolute top-[8px] left-[8px] z-[1] flex items-center rounded-full px-[8px] py-[3px] text-[11px] font-bold ${tier === "compact" ? "gap-[5px]" : ""}`} style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          {tier === "compact" && <Lock className="h-[12px] w-[12px]" aria-hidden />}
          Coming soon
        </span>
      )}
      <span className={`absolute inset-x-0 bottom-0 flex flex-col gap-[1px] px-[12px] pt-[26px] pb-[10px] sm:gap-[4px] sm:px-[14px] sm:pt-[32px] sm:pb-[14px] ${tier === "hero" ? "sm:pr-[80px] md:pr-[96px] lg:pr-[108px]" : "sm:pr-[64px] md:pr-[72px]"}`} style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className={`block leading-[1.15] font-extrabold uppercase [overflow-wrap:normal] [word-break:keep-all] ${titleSize}`} style={{ ...(item.world ? posterTitleFont(item.world) : { fontFamily: "var(--font-display)" }), color: "var(--poster-title)" }}>
          {breakable(item.title)}
        </span>
        {item.sub && (
          <span className={`block font-semibold ${subSize}`} style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
            {item.sub}
          </span>
        )}
        {item.world && (
          <span className={`block font-semibold tracking-[0.6px] uppercase ${subSize}`} style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[item.world] }}>
            {item.world}
          </span>
        )}
        {tier === "hero" && item.locked && (
          <span className="mt-[4px] text-[13px] font-bold sm:text-[14px]" style={{ color: "var(--foreground)" }}>
            Coming soon
          </span>
        )}
      </span>
      <CornerBadge kind={item.locked ? "lock" : "play"} large={tier === "hero"} faded={deck && !front} />
    </div>
  );
  const sizeClass = deck ? "h-full w-full" : tier === "hero" ? `${ROW_HEIGHT} ${FEATURED_W}` : tier === "side" ? `${ROW_HEIGHT} ${SIDE_W}` : `${COMPACT_HEIGHT} ${COMPACT_W}`;
  return (
    <article
      data-card-id={item.id}
      className={`dm-tap group relative flex-none overflow-hidden rounded-[var(--radius-lg)] border text-left ${sizeClass}`}
      style={{
        borderColor: "var(--color-glass-border-raised)",
        background: "var(--glass-surface-1)",
        transition: "width 0.5s cubic-bezier(0.16,1,0.3,1), height 0.5s cubic-bezier(0.16,1,0.3,1), transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
      }}
    >
      {content}
      {/* The hero card navigates for real (only when it actually has
         somewhere to go); a side/compact card's whole face is the "make
         me the hero" control instead, same split RowCard uses -- a
         locked hero card is just not clickable, same as it isn't today.
         A compact card can still be tapped to select it even before the
         row is active -- that's what BRINGS the row into focus on touch,
         where there's no remote down-arrow to do it for you. */}
      {tier === "hero" && item.href && (
        <Link href={item.href} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]">
          <span className="sr-only">{item.title}</span>
        </Link>
      )}
      {tier !== "hero" && onSelect && (
        <button type="button" onClick={onSelect} className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]">
          <span className="sr-only">Feature {item.title}</span>
        </button>
      )}
    </article>
  );
}

