"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { BookOpen, Lock, Play } from "lucide-react";

import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { hasGlossary } from "@/components/glossary/data";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { FEATURED_ROW_SOON_IDS, GLOSSARY_GAMES, SIMULATIONS, SOON } from "./games";
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
            <h2 className="text-[13px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
              Glossary Games
            </h2>
            {/* Deliberately smaller than the featured career card above (max
               380px) -- Glossary Games are meant to read as secondary. */}
            <ul className="grid list-none grid-cols-1 gap-[var(--space-4)] p-0 max-w-[320px]">
              {glossaryPlayable.map((game) => (
                <li key={game.careerSlug}>
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

// Every card in the row shares this height -- the Netflix reference row has
// no card taller than its neighbors, only wider ones. Width differs per
// card: the featured slot uses a wide landscape aspect, every other card
// uses ~0.707 (Browse's own PosterCard ratio, 210x297), so at this shared
// height they read as normal posters rather than narrow slivers. The
// featured card's CTA lives ON TOP of its artwork (see RowCard's `footer`),
// not in a second box stacked below it, so it never adds extra height.
const ROW_HEIGHT = "h-[212px] sm:h-[240px] md:h-[269px]";
const FEATURED_ASPECT = "aspect-[8/5]";
const SIDE_ASPECT = "aspect-[210/297]";
// Apple's own corner-radius ratio for a "continuous" rounded-rect control
// (not a full pill) at roughly this button's height -- ~0.2237 x size is
// the documented formula behind iOS's smooth squircle corners; applied to
// a ~44px-tall button that lands right around a crisp 10px, which is what
// this uses on the same-height CTA below.
const CTA_RADIUS = 10;

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
  const featured = candidates.find((c) => c.id === featuredId) ?? candidates[0];
  if (!featured) return null;
  const rest = candidates.filter((c) => c.id !== featured.id);

  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <h2 className="text-[13px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        Career Simulations
      </h2>
      {/* The featured card's CTA (or "Coming soon" state) is `footer`,
         rendered INSIDE RowCard's own bottom scrim -- on top of the
         artwork, inside the same border/rounded corners as the image
         itself, per direct feedback against a second box stacked below
         it. Every card shares one fixed ROW_HEIGHT (see above), so the
         featured card is wider than its neighbors, never taller,
         matching the Netflix reference exactly. */}
      <div className="flex items-start gap-[var(--space-3)] overflow-x-auto pb-1">
        <RowCard candidate={featured} large footer={featured.kind === "soon" ? <ComingSoonFooter /> : <FeaturedCta sim={featured.sim} />} />
        {rest.map((c) => (
          <RowCard key={c.id} candidate={c} onSelect={() => setFeaturedId(c.id)} />
        ))}
      </div>
    </section>
  );
}

/** One row thumbnail -- the featured card and every side card are the same
 *  bordered/rounded box at the shared ROW_HEIGHT, just a different aspect
 *  ratio (wide vs. Browse-poster portrait). `footer`, when given (the
 *  featured card only), renders INSIDE the card's own bottom scrim, on top
 *  of the artwork and clipped by the same rounded corners as the image --
 *  not a second box stacked below it. A real simulation is pressable --
 *  clicking a side card selects it, which is what FeaturedRow re-renders
 *  the featured slot from. A "coming soon" one isn't: there's nothing to
 *  select it INTO (the featured slot would just show the same locked state
 *  either way), so it renders in full color as a plain, non-interactive
 *  card instead of a button, per direct feedback ("color but just not
 *  pressable"). The featured card itself is never a button either -- its
 *  footer can hold a real `<Link>`, and a link nested inside a button is
 *  invalid HTML. */
function RowCard({
  candidate,
  large = false,
  onSelect,
  footer,
}: {
  candidate: FeaturedCandidate;
  /** The one featured card: wide landscape aspect instead of the Browse-
   *  poster portrait every side card uses, and a bigger title to match --
   *  the extra width was making a title sized for a narrow poster look
   *  small and lost, per direct feedback. */
  large?: boolean;
  onSelect?: () => void;
  /** CTA / progress (a real sim) or the locked "Coming soon" line (not yet
   *  built) -- rendered inside the same scrim as the title, so it reads as
   *  part of the one card rather than a detached panel underneath it. */
  footer?: React.ReactNode;
}) {
  const title = candidate.kind === "sim" ? candidate.sim.title : candidate.soon.title;
  const world = candidate.kind === "sim" ? candidate.sim.world : candidate.soon.world;
  const cover = candidate.kind === "sim" ? candidate.sim.cover : candidate.soon.cover;
  // The featured card's own copy reads left-aligned (matching its CTA);
  // every side card centers its copy instead, matching Browse's own
  // PosterCard convention, per direct feedback.
  const className = `dm-tap relative flex-none overflow-hidden rounded-[16px] border ${large ? "text-left" : "text-center"} ${ROW_HEIGHT} ${large ? FEATURED_ASPECT : SIDE_ASPECT}`;
  const style = { borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" };
  // Always uppercase, always scaled with the card -- a title sized (and
  // cased) for the narrow side cards was reading small/inconsistent on the
  // much wider featured card, per direct feedback.
  const titleSize = large ? "text-[20px] sm:text-[26px] md:text-[30px]" : "text-[13px] sm:text-[14px] md:text-[16px]";
  const worldSize = large ? "text-[12px] sm:text-[13px]" : "text-[9px] sm:text-[10px]";
  const content = (
    <div className="relative h-full w-full">
      <Image src={cover} alt="" fill sizes="560px" className="object-cover" />
      {candidate.kind === "soon" && !large && (
        <span className="absolute top-[8px] left-[8px] z-[1] flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[11px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          <Lock className="h-[10px] w-[10px]" aria-hidden /> Soon
        </span>
      )}
      {/* Same scrim + title + world-label (in the world's own accent color)
         as Browse's own PosterCard -- accent color lives on the world
         label, never the title itself, matching that convention exactly.
         A taller, denser scrim when there's a footer to keep it legible
         over bright artwork -- Browse's own lighter scrim is tuned for
         just a title, not a title plus a CTA/progress bar underneath it. */}
      <span
        className="absolute inset-x-0 bottom-0 flex flex-col gap-[3px] px-[10px] pt-[24px] pb-[10px]"
        style={{ backgroundImage: footer ? "linear-gradient(180deg, transparent 0%, var(--scrim-heavy) 50%, var(--scrim-heavy) 100%)" : "var(--poster-scrim)" }}
      >
        <span className={`block leading-[1.2] font-extrabold uppercase ${titleSize}`} style={{ ...posterTitleFont(world), color: "var(--poster-title)" }}>
          {title}
        </span>
        <span className={`block font-semibold tracking-[0.6px] uppercase ${worldSize}`} style={{ fontFamily: "var(--font-body)", color: WORLD_COLORS[world] }}>
          {world}
        </span>
        {footer && <div className="mt-[10px]">{footer}</div>}
      </span>
    </div>
  );

  // The featured card is never a button (its footer can hold a real link),
  // and a "coming soon" side card isn't pressable either -- both render as
  // a plain div/article. layoutId shared across the featured slot and the
  // side row: clicking a side card doesn't just swap which candidate is
  // featured, Framer Motion animates that SAME card (by id) sliding/growing
  // from its side-row spot into the featured position (and the outgoing
  // featured card shrinks back into a side slot), per direct request for a
  // carousel-style transition rather than an instant cut.
  if (large || candidate.kind === "soon") {
    const Tag = large ? motion.article : motion.div;
    return (
      <Tag layout layoutId={candidate.id} transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} className={className} style={style}>
        {content}
      </Tag>
    );
  }
  return (
    <motion.button
      layout
      layoutId={candidate.id}
      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      type="button"
      onClick={onSelect}
      className={className}
      style={style}
    >
      {content}
    </motion.button>
  );
}

/** The featured slot's CTA when it's a real, playable simulation --
 *  subscribes to progress itself (only ever mounted for a "sim" candidate,
 *  so there's no conditional-hook risk). A returning player sees an actual
 *  progress bar for how far into the level they got, not just different
 *  button copy -- "Continue" alone didn't show HOW much was already done. */
function FeaturedCta({ sim }: { sim: Simulation }) {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const first = sim.levels[0];
  const run = readRun(progress, sim.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  const fraction = resumable ? resumable.index / first.beats.length : 0;
  return (
    <div className="flex flex-col gap-[8px]">
      {resumable && (
        <div className="h-[4px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.28)" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.round(fraction * 100)}%`, background: "var(--primary)" }} />
        </div>
      )}
      <Link
        href={`/play/${sim.id}`}
        className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] px-[18px] py-[13px] text-[15px] font-extrabold"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)", borderRadius: CTA_RADIUS }}
      >
        <Play className="h-[15px] w-[15px]" aria-hidden />
        {resumable ? "Continue" : `Start Level ${first.n}`}
      </Link>
    </div>
  );
}

/** The featured slot's footer for a not-yet-built career -- informational
 *  only, no button, since there's nothing to press into. */
function ComingSoonFooter() {
  return (
    <div className="flex items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
      <Lock className="h-[13px] w-[13px]" aria-hidden />
      Coming soon
    </div>
  );
}

/** A titled row of locked "Soon" cards -- career sims not yet built, and the
 *  Glossary/Mini Game types that don't have a real page anywhere yet. */
function SoonSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <h2 className="text-[13px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </h2>
      <ul className="grid list-none grid-cols-2 gap-[var(--space-3)] p-0 sm:grid-cols-3 lg:grid-cols-5">{children}</ul>
    </section>
  );
}

/** One locked card: either a photo cover (dimmed/grayscale, same idiom as a
 *  career poster) or a flat icon tile when there's no cover art yet (the
 *  Glossary Game type has no image asset at all, same as Home's own
 *  "TODAY'S GLOSSARY CHALLENGE" banner uses an icon rather than a photo). */
function SoonCard({ title, cover, icon }: { title: string; cover?: string; icon?: React.ReactNode }) {
  return (
    <li>
      <span
        className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[18px] border p-[10px]"
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

/** A Glossary Game has no levels or firm, so it doesn't need GameCard's
 *  ladder -- but it still gets a real cover image and the same
 *  image-plus-scrim treatment every other Play card uses, rather than a
 *  flat icon-in-a-circle row (which read as unfinished next to the photo
 *  cards above it). */
function GlossaryGameCard({ game }: { game: { careerSlug: string; title: string; sub: string; cover?: string } }) {
  return (
    <Link
      href={`/play/glossary/${game.careerSlug}`}
      className="dm-tap relative flex flex-col overflow-hidden rounded-[22px] border"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}
    >
      <div className="relative aspect-[16/9] w-full">
        {game.cover ? (
          <Image src={game.cover} alt="" fill sizes="(max-width: 640px) 100vw, 420px" className="object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--world-business-money-office) 20%, var(--card))" }}>
            <BookOpen className="h-10 w-10" style={{ color: "var(--world-business-money-office)" }} aria-hidden />
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--background) 92%, transparent) 100%)" }}
        />
        <span
          className="absolute top-[12px] left-[12px] rounded-full px-[10px] py-[4px] text-[11px] font-extrabold tracking-[0.1em] uppercase"
          style={{ background: "var(--world-business-money-office)", color: "#05070f" }}
        >
          Glossary Game
        </span>
        <Play className="absolute top-[12px] right-[12px] h-5 w-5" style={{ color: "var(--foreground)" }} aria-hidden />
      </div>
      <div className="flex flex-col gap-[2px] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-4)]">
        <span className="text-[17px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          {game.title}
        </span>
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          {game.sub}
        </span>
      </div>
    </Link>
  );
}

