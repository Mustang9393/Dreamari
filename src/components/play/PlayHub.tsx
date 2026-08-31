"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { BookOpen, Film, Lock, Play } from "lucide-react";

import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
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

  const glossaryPlayable = GLOSSARY_GAMES.filter((game) => hasGlossary(game.careerSlug));

  return (
    <div
      className="marketing-v2 themeable relative min-h-dvh w-full"
      style={{
        background:
          "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
        overflowX: "clip",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
      </div>

      <DesktopNavigation active="Play" />

      <header className="relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] md:px-[var(--space-14)] md:pt-[var(--space-10)]">
        <h1 className="text-[32px] leading-[1.05] font-extrabold uppercase sm:text-[44px]" style={{ fontFamily: "var(--font-display)" }}>
          Play
        </h1>

        <FeaturedRow simulations={[...mine, ...rest]} soonCareers={featuredRowSoon} />

        {/* Glossary Games: split by whether the career actually has authored
           content (hasGlossary) -- Finance Essentials has a real page now,
           so it gets a real playable card; anything added here before its
           content exists still gets the same locked "Soon" treatment as the
           career-simulation placeholders below, same as Home's own
           "Finance Essentials"/"Deal Team Kickoff" activity cards did before
           either had a page to open. */}
        {glossaryPlayable.length > 0 && (
          <section className="flex flex-col gap-[var(--space-3)]">
            <h2 className={ROW_HEADER} style={{ color: "var(--foreground)" }}>
              Glossary Games
            </h2>
            {/* A small horizontal shelf (SHELF_HEIGHT), deliberately smaller
               than the hero row above -- the billboard dominates, the
               shelves below it stay uniform and quiet, Netflix-style. */}
            <ul className="flex list-none gap-[var(--space-3)] overflow-x-auto p-0 pb-1">
              {glossaryPlayable.map((game) => (
                <li key={game.careerSlug} className="flex-none">
                  <GlossaryGameCard game={game} />
                </li>
              ))}
            </ul>
          </section>
        )}
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
const ROW_HEIGHT = "h-[212px] sm:h-[300px] md:h-[380px] lg:h-[430px]";
const FEATURED_ASPECT = "aspect-video";
const SIDE_ASPECT = "aspect-[210/297]";
// Rows BELOW the hero: uniform smaller shelves, Netflix-style.
const SHELF_HEIGHT = "h-[150px] sm:h-[170px] md:h-[195px]";
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
function FeaturedRow({ simulations, soonCareers }: { simulations: Simulation[]; soonCareers: SoonCareer[] }) {
  const candidates: FeaturedCandidate[] = useMemo(
    () => [
      ...simulations.map((sim): FeaturedCandidate => ({ kind: "sim", id: sim.id, sim })),
      ...soonCareers.map((soon): FeaturedCandidate => ({ kind: "soon", id: soon.careerId, soon })),
    ],
    [simulations, soonCareers],
  );
  const [featuredId, setFeaturedId] = useState<string | undefined>(candidates[0]?.id);
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
      {/* No CTA button anywhere -- the featured card carries a centered
         play badge on the artwork itself and is one whole-card link, with
         saved progress as a thin strip along the card's bottom edge (the
         exact idiom Netflix uses for partially-watched titles), per direct
         feedback. Every card shares one fixed ROW_HEIGHT (see above), so
         the featured card is wider than its neighbors, never taller. */}
      {/* Full-bleed rail: negative margins let the row run to the viewport
         edge (matching main's own padding), so the next card is always
         visibly PEEKING at the screen edge instead of clipping exactly at
         the content column -- without the peek, nothing said there were
         more cards to the right (direct feedback). */}
      {/* Expand IN PLACE: cards keep their positions and the clicked one
         simply grows into the billboard while the old one shrinks (direct
         feedback -- reordering the row on every click read as a shuffle,
         not a selection). */}
      <div className="-mx-5 flex items-start gap-[var(--space-3)] overflow-x-auto px-5 pb-1 md:-mx-[var(--space-14)] md:px-[var(--space-14)]">
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
  onSelect,
  onTrailer,
}: {
  candidate: FeaturedCandidate;
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
  // The featured card's copy reads left-aligned (a billboard); every side
  // card centers its copy, matching Browse's own PosterCard convention.
  const className = `dm-tap group relative flex-none overflow-hidden rounded-[16px] border ${large ? "text-left" : "text-center"} ${ROW_HEIGHT} ${large ? FEATURED_ASPECT : SIDE_ASPECT}`;
  const style = { borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" };
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
      ? "text-[14px] sm:text-[19px] md:text-[24px] lg:text-[27px]"
      : "text-[17px] sm:text-[24px] md:text-[30px] lg:text-[34px]";
  const worldSize = large ? "text-[11px] sm:text-[13px] md:text-[15px]" : "text-[9px] sm:text-[10px] md:text-[13px] lg:text-[14px]";
  const content = (
    <div className="relative h-full w-full">
      <Image src={cover} alt="" fill sizes={large ? "(min-width: 1024px) 764px, 90vw" : "(min-width: 1024px) 304px, 45vw"} className="object-cover" />
      {candidate.kind === "soon" && !large && (
        <span className="absolute top-[8px] left-[8px] z-[1] flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[11px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          <Lock className="h-[10px] w-[10px]" aria-hidden /> Soon
        </span>
      )}
      {/* Same scrim + title + world-label (in the world's own accent color)
         as Browse's own PosterCard -- accent color lives on the world
         label, never the title itself, matching that convention exactly. */}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-[4px] px-[12px] pt-[32px] pb-[12px] sm:px-[16px] sm:pb-[14px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className={`block leading-[1.15] font-extrabold uppercase [overflow-wrap:normal] [word-break:keep-all] ${titleSize}`} style={{ ...posterTitleFont(world), color: "var(--poster-title)" }}>
          {breakable(title)}
        </span>
        <span className={`block font-semibold tracking-[0.6px] uppercase ${worldSize}`} style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[world] }}>
          {world}
        </span>
        {large && candidate.kind === "soon" && (
          <span className="mt-[4px] flex items-center gap-[6px] text-[13px] font-bold sm:text-[14px]" style={{ color: "var(--foreground)" }}>
            <Lock className="h-[13px] w-[13px]" aria-hidden />
            Coming soon
          </span>
        )}
        {large && candidate.kind === "sim" && <FeaturedMeta sim={candidate.sim} />}
      </span>
      {large && candidate.kind === "sim" && <FeaturedPlayOverlay sim={candidate.sim} onTrailer={onTrailer ? () => onTrailer(candidate.sim) : undefined} />}
    </div>
  );

  // ONE persistent element per candidate, whatever its state: the same
  // keyed motion.article simply grows into the featured size (framer's
  // `layout` animates the width/aspect change and the row reorder), so the
  // carousel swap is a smooth morph with no crossfade to get stuck in --
  // the earlier two-element layoutId version reproducibly froze the
  // incoming featured card at opacity 0. It is never a <button>: the
  // featured state holds a real <Link> overlay, so a pressable side card
  // gets its own absolute overlay button instead (same idiom as the
  // whole-card links across the app).
  return (
    <motion.article layout transition={{ type: "spring", bounce: 0.15, duration: 0.55 }} className={className} style={style}>
      {content}
      {!large && candidate.kind === "sim" && onSelect && (
        <button type="button" onClick={onSelect} className="absolute inset-0 z-10 cursor-pointer">
          <span className="sr-only">Feature {candidate.sim.title}</span>
        </button>
      )}
    </motion.article>
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
        <span aria-hidden className="block h-[5px] w-full max-w-[300px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--poster-title) 25%, transparent)" }}>
          <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "var(--primary)" }} />
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
function FeaturedPlayOverlay({ sim, onTrailer }: { sim: Simulation; onTrailer?: () => void }) {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const first = sim.levels[0];
  const run = readRun(progress, sim.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  return (
    <>
      <Link href={`/play/${sim.id}`} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">{resumable ? `Continue ${sim.title} · Level ${first.n}` : `Play ${sim.title} · Level ${first.n}`}</span>
      </Link>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 flex size-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110 sm:size-[64px] md:size-[72px]"
        style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
      >
        <Play className="ml-[3px] h-[22px] w-[22px] sm:h-[26px] sm:w-[26px] md:h-[30px] md:w-[30px]" fill="currentColor" style={{ color: "#FFFFFF" }} />
      </span>
      {sim.trailer && onTrailer && (
        // "Watch trailer", the full verb phrase, per direct feedback -- a
        // chip reading just "Trailer" made the whole featured card sound
        // like it WAS a trailer rather than the game.
        <button
          type="button"
          onClick={onTrailer}
          className="dm-quiet absolute top-[10px] right-[10px] z-20 flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-full border px-[13px] text-[11.5px] font-extrabold backdrop-blur-[8px]"
          style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.35)", color: "#FFFFFF" }}
        >
          <Film className="h-[13px] w-[13px]" aria-hidden />
          Watch trailer
        </button>
      )}
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
      <ul className="flex list-none gap-[var(--space-3)] overflow-x-auto p-0 pb-1">{children}</ul>
    </section>
  );
}

/** One locked card: either a photo cover (dimmed/grayscale, same idiom as a
 *  career poster) or a flat icon tile when there's no cover art yet (the
 *  Glossary Game type has no image asset at all, same as Home's own
 *  "TODAY'S GLOSSARY CHALLENGE" banner uses an icon rather than a photo). */
function SoonCard({ title, cover, icon }: { title: string; cover?: string; icon?: React.ReactNode }) {
  return (
    <li className="flex-none">
      <span
        className={`relative flex aspect-[210/297] flex-col justify-end overflow-hidden rounded-[16px] border p-[10px] ${SHELF_HEIGHT}`}
        style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}
      >
        {cover ? (
          <>
            <Image src={cover} alt="" fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover opacity-40 grayscale" />
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
        <span className="relative flex items-center gap-[5px] text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>
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
 *  a small centered play badge echoing the featured card's. */
function GlossaryGameCard({ game }: { game: { careerSlug: string; title: string; sub: string; cover?: string } }) {
  return (
    <Link
      href={`/play/glossary/${game.careerSlug}`}
      className={`dm-tap group relative block aspect-[16/9] flex-none overflow-hidden rounded-[16px] border ${SHELF_HEIGHT}`}
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}
    >
      {game.cover ? (
        <Image src={game.cover} alt="" fill sizes="(min-width: 768px) 347px, 60vw" className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--world-business-money-office) 20%, var(--card))" }}>
          <BookOpen className="h-10 w-10" style={{ color: "var(--world-business-money-office)" }} aria-hidden />
        </span>
      )}
      <span
        className="absolute top-[10px] left-[10px] rounded-full px-[9px] py-[3px] text-[10px] font-extrabold tracking-[0.1em] uppercase"
        style={{ background: "var(--world-business-money-office)", color: "#05070f" }}
      >
        Glossary Game
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 flex size-[40px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[6px] transition-transform duration-200 group-hover:scale-110 sm:size-[46px]"
        style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}
      >
        <Play className="ml-[2px] h-[16px] w-[16px]" fill="currentColor" style={{ color: "#FFFFFF" }} />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-[1px] px-[12px] pt-[26px] pb-[10px]" style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className="text-[14px] leading-[18px] font-extrabold sm:text-[16px] sm:leading-[20px]" style={{ fontFamily: "var(--font-display)", color: "var(--poster-title)" }}>
          {game.title}
        </span>
        <span className="text-[10.5px] sm:text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
          {game.sub}
        </span>
      </span>
    </Link>
  );
}

