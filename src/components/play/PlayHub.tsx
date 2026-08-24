"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Lock, Play } from "lucide-react";

import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { SIMULATIONS, SOON } from "./games";
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
      (game) => !live.has(game.careerId),
    );
  }, [picks.ids]);

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

      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-[var(--space-6)] px-5 pt-2 pb-[120px] md:px-[var(--space-14)] md:pt-[var(--space-10)]">
        <h1 className="text-[32px] leading-[1.05] font-extrabold uppercase sm:text-[44px]" style={{ fontFamily: "var(--font-display)" }}>
          Play
        </h1>

        {mine.length > 0 && <Shelf label="From your Top 3" games={mine} />}
        {rest.length > 0 && <Shelf label={mine.length > 0 ? "More games" : "Playable now"} games={rest} />}

        <section className="flex flex-col gap-[var(--space-3)]">
          <h2 className="text-[13px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            In the works
          </h2>
          <ul className="grid list-none grid-cols-2 gap-[var(--space-3)] p-0 sm:grid-cols-3 lg:grid-cols-5">
            {soon.map((game) => (
              <li key={game.careerId}>
                <span
                  className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[18px] border p-[10px]"
                  style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-1)" }}
                >
                  <Image src={game.cover} alt="" fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover opacity-40 grayscale" />
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--background) 92%, transparent) 100%)" }}
                  />
                  <span className="relative flex items-center gap-[5px] text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                    <Lock className="h-[12px] w-[12px]" aria-hidden />
                    Soon
                  </span>
                  <span className="relative text-[14px] leading-tight font-extrabold" style={{ color: "var(--foreground)" }}>
                    {game.title}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <MobileNav active="Play" />
    </div>
  );
}

function Shelf({ label, games }: { label: string; games: Simulation[] }) {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <h2 className="text-[13px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </h2>
      {/* One game gets a comfortable single column rather than half a row with a
         hole beside it; two or more share the row. */}
      <ul className={`grid list-none grid-cols-1 gap-[var(--space-4)] p-0 ${games.length > 1 ? "lg:grid-cols-2" : "max-w-[680px]"}`}>
        {games.map((game) => (
          <li key={game.id}>
            <GameCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GameCard({ game }: { game: Simulation }) {
  const accent = WORLD_COLORS[game.world] ?? "var(--primary)";
  const first = game.levels[0];
  // A run in progress should say so on the card, not hide behind "Start".
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const run = readRun(progress, game.id, first.n);
  const resumable = run && run.index > 0 && run.index < first.beats.length ? run : null;
  return (
    <article
      className="dm-tap relative overflow-hidden rounded-[22px] border"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}
    >
      <div className="relative aspect-[16/10] w-full">
        <Image src={game.cover} alt="" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 34%, color-mix(in srgb, var(--background) 94%, transparent) 100%)" }}
        />
        <span className="absolute right-[14px] bottom-[12px] left-[14px] block text-[26px] leading-[1.05] uppercase sm:text-[30px]" style={{ ...posterTitleFont(game.world), color: "var(--foreground)" }}>
          {game.title}
        </span>
        <span
          className="absolute top-[12px] left-[12px] rounded-full px-[10px] py-[4px] text-[11px] font-extrabold tracking-[0.1em] uppercase"
          style={{ background: accent, color: "#05070f" }}
        >
          {game.firm}
        </span>
      </div>

      <div className="flex flex-col gap-[var(--space-3)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-4)]">
        {/* The ladder, so the whole arc is visible from the card. */}
        <ol className="m-0 flex list-none flex-wrap items-center gap-[6px] p-0">
          {game.levels.map((level) => (
            <li key={level.id}>
              <Link
                href={`/play/${game.id}?level=${level.n}`}
                className="dm-quiet flex items-center gap-[6px] rounded-full border px-[10px] py-[5px] text-[12px] font-extrabold"
                style={{ borderColor: accent, color: "var(--foreground)" }}
              >
                <Play className="h-[11px] w-[11px]" aria-hidden />
                {level.n}. {level.role}
              </Link>
            </li>
          ))}
          {game.upcoming.map((role, index) => (
            <li
              key={role}
              className="flex items-center gap-[5px] rounded-full border px-[10px] py-[5px] text-[12px] font-bold"
              style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--muted-foreground)" }}
            >
              <Lock className="h-[10px] w-[10px]" aria-hidden />
              {game.levels.length + index + 1}. {role}
            </li>
          ))}
        </ol>

        <Link
          href={`/play/${game.id}`}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Play className="h-[16px] w-[16px]" aria-hidden />
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
