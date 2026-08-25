"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
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
  const glossarySoon = GLOSSARY_GAMES.filter((game) => !hasGlossary(game.careerSlug));

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
        {glossarySoon.length > 0 && (
          <SoonSection label={glossaryPlayable.length > 0 ? "More Glossary Games" : "Glossary Games"}>
            {glossarySoon.map((game) => (
              <SoonCard key={game.careerSlug} title={game.title} cover={game.cover} icon={<BookOpen className="h-[22px] w-[22px]" aria-hidden />} />
            ))}
          </SoonSection>
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

// A career already has a full name for its next promotion, but the row only
// has room for a single-line ladder -- abbreviate the same way a resume does.
const LEVEL_ABBREVIATION: Record<string, string> = {
  "Vice President": "VP",
  "Executive Director": "ED",
  "Managing Director": "MD",
};

/** Netflix-style "one dominant experience + a row of smaller choices"
 *  browsing pattern, replacing the old plain grid of full info-cards.
 *  Clicking a small card promotes it to the featured position -- it doesn't
 *  navigate anywhere by itself, matching "browse the row, then decide" the
 *  way picking a Netflix thumbnail opens its details before you press play. */
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
      <div className="flex items-stretch gap-[var(--space-3)] overflow-x-auto pb-1">
        <FeaturedCard candidate={featured} />
        {rest.map((c) => (
          <SideCard key={c.id} candidate={c} onSelect={() => setFeaturedId(c.id)} />
        ))}
      </div>
    </section>
  );
}

/** The large card on the left: a real simulation gets its full treatment
 *  (condensed ladder, resumable CTA, subtle reputation) -- a not-yet-built
 *  career gets its artwork and a plain "Coming Soon" state, never a fake
 *  Play button. */
function FeaturedCard({ candidate }: { candidate: FeaturedCandidate }) {
  const width = "w-[260px] sm:w-[320px] md:w-[380px]";
  // Called unconditionally regardless of candidate.kind -- FeaturedCard isn't
  // remounted when the featured candidate changes kind, so the hook order
  // must stay stable across renders.
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);

  if (candidate.kind === "soon") {
    const { soon } = candidate;
    return (
      <article className={`relative flex-none overflow-hidden rounded-[22px] border ${width}`} style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}>
        <div className="relative aspect-[16/10] w-full">
          <Image src={soon.cover} alt="" fill sizes="380px" className="object-cover" />
          <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 34%, color-mix(in srgb, var(--background) 94%, transparent) 100%)" }} />
          <span className="absolute right-[14px] bottom-[12px] left-[14px] block text-[24px] leading-[1.05] uppercase sm:text-[28px]" style={{ ...posterTitleFont(soon.world), color: "var(--foreground)" }}>
            {soon.title}
          </span>
        </div>
        <div className="flex items-center gap-[6px] px-[var(--space-4)] py-[var(--space-4)] text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <Lock className="h-[13px] w-[13px]" aria-hidden />
          Coming soon
        </div>
      </article>
    );
  }

  const { sim } = candidate;
  const accent = WORLD_COLORS[sim.world] ?? "var(--primary)";
  const first = sim.levels[0];
  const run = readRun(progress, sim.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  const roles = [...sim.levels.map((l) => l.role), ...sim.upcoming.map((r) => LEVEL_ABBREVIATION[r] ?? r)];
  const levelLine = roles.length > 4 ? `${roles.slice(0, 3).join(" · ")} · ${roles[3]} · + More` : roles.join(" · ");
  const heroTitle = sim.id === "investment-banking" ? "Day in the Life of an Investment Banker" : sim.title;

  return (
    <article className={`relative flex-none overflow-hidden rounded-[22px] border ${width}`} style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}>
      <div className="relative aspect-[16/10] w-full">
        <Image src={sim.cover} alt="" fill sizes="380px" className="object-cover" />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 34%, color-mix(in srgb, var(--background) 94%, transparent) 100%)" }} />
        <span className="absolute right-[14px] bottom-[12px] left-[14px] block text-[22px] leading-[1.1] uppercase sm:text-[26px]" style={{ ...posterTitleFont(sim.world), color: "var(--foreground)" }}>
          {heroTitle}
        </span>
        <span className="absolute top-[12px] left-[12px] rounded-full px-[10px] py-[4px] text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ background: accent, color: "#05070f" }}>
          {sim.firm}
        </span>
      </div>
      <div className="flex flex-col gap-[var(--space-3)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-4)]">
        <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {levelLine}
        </p>
        <Link
          href={`/play/${sim.id}`}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[15px] font-extrabold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Play className="h-[15px] w-[15px]" aria-hidden />
          {resumable ? `Continue Level ${first.n} · ${first.role}` : `Start Level ${first.n} · ${first.role}`}
        </Link>
        {resumable && (
          <p className="text-center text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Saved at {resumable.reputation} reputation
          </p>
        )}
      </div>
    </article>
  );
}

/** A small side card, whichever career it happens to be -- deliberately the
 *  same minimal artwork-plus-title treatment whether it's a real simulation
 *  or a "coming soon" one, since the only thing distinguishing them here is
 *  the lock pill. Clicking promotes it to FeaturedCard's position. */
function SideCard({ candidate, onSelect }: { candidate: FeaturedCandidate; onSelect: () => void }) {
  const title = candidate.kind === "sim" ? candidate.sim.title : candidate.soon.title;
  const world = candidate.kind === "sim" ? candidate.sim.world : candidate.soon.world;
  const cover = candidate.kind === "sim" ? candidate.sim.cover : candidate.soon.cover;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="dm-tap relative flex w-[120px] flex-none overflow-hidden rounded-[16px] border text-left sm:w-[140px] md:w-[160px]"
      style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}
    >
      <div className="relative h-full w-full">
        <Image src={cover} alt="" fill sizes="160px" className={`object-cover ${candidate.kind === "soon" ? "opacity-60 grayscale" : ""}`} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--background) 92%, transparent) 100%)" }} />
        {candidate.kind === "soon" && (
          <span className="absolute top-[8px] left-[8px] flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[11px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
            <Lock className="h-[10px] w-[10px]" aria-hidden /> Soon
          </span>
        )}
        <span className="absolute right-[10px] bottom-[10px] left-[10px] block text-[15px] leading-[1.2] font-extrabold" style={{ ...posterTitleFont(world), color: "var(--foreground)" }}>
          {title}
        </span>
      </div>
    </button>
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

