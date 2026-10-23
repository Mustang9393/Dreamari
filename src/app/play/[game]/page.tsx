import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { simulationFor, SIMULATION_V2 } from "@/components/play/games";
import { SimulationPlayer } from "@/components/play/SimulationPlayer";
import type { Level } from "@/components/play/types";
import { toCoreLevel } from "@/components/play/coreKit";
import { hasV2Art } from "@/components/play/ib-v2-scenes";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Career Simulation · Dreamari",
  description: "Play the job. Every decision moves your reputation.",
};

// One route per simulation. ?level= picks the level; it defaults to the first,
// and levels that are not built yet simply are not in the data.
export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ level?: string | string[]; mode?: string | string[]; v?: string | string[]; screen?: string | string[]; kit?: string | string[] }>;
}) {
  const { game } = await params;
  const query = await searchParams;
  const version = Array.isArray(query.v) ? query.v[0] : query.v;
  const simulation = simulationFor(game, version);
  if (!simulation) notFound();
  const wanted = Number(Array.isArray(query.level) ? query.level[0] : query.level);
  const main = simulation.levels.find((entry) => entry.n === wanted) ?? simulation.levels[0];
  const picked = main;
  const family = Object.entries(SIMULATION_V2).find(([id, variant]) => id === game || variant.id === game);
  const versionSwitch = family ? { basePath: `/play/${family[0]}`, version: (simulation.id === family[1].id ? 2 : 1) as 1 | 2 } : undefined;
  // Express mode: the same level minus its expressCut teaching screens. Every
  // scored beat, the scoring, the thresholds and the endings are the full
  // level's own -- the beats array is just shorter, and `express: true` tells
  // the player to key a separate save slot and offer the tappable panels.
  //
  // `expressSource`, when a level sets it, redirects that derivation to a
  // DIFFERENT level object entirely (its own beats + its own expressCut) --
  // the escape hatch for "Full mode moved on, Express mode didn't" (IB
  // Level 1, 21 Sept 2026: the rebuild changed what Express played too,
  // and only Express was supposed to revert). `picked` itself -- and so
  // Full mode -- never reads expressSource; it's consulted here only.
  const expressBase = picked.expressSource ?? picked;
  const express = (Array.isArray(query.mode) ? query.mode[0] : query.mode) === "express" && !!expressBase.expressCut?.length;
  // Express takes the new look as presentation flags ONLY (cinematic UI,
  // career-world colours); its beats, their order and its cut list are the
  // expressSource's own, untouched.
  const built: Level = express
    ? {
        ...expressBase,
        id: `${picked.id}-express`,
        express: true,
        cinematic: expressBase.cinematic ?? picked.cinematic,
        worldTheme: expressBase.worldTheme ?? Boolean(picked.cinematic || picked.worldTheme),
        beats: expressBase.beats.filter((beat) => !expressBase.expressCut!.includes(beat.id)),
      }
    : picked;
  // ?kit=core plays the level on the scalable core kit only (coreKit.ts, 9
  // Oct 2026): every hand-drawn instrument and one-career mechanic swapped
  // for the plain piece a new career would get. A preview for the team and
  // for Usman's generator; the live game never passes it.
  const kit = Array.isArray(query.kit) ? query.kit[0] : query.kit;
  const level = kit === "core" ? toCoreLevel(built) : built;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Keyed on the level: without this, navigating Level 2 -> Level 3 reuses
         the same component instance, so its internal phase/run/result state
         (still "ending", still the OLD level's reputation) survives into the
         new level and renders as that level's own ending screen on a run that
         was never played. */}
      {/* DEMO-ONLY: ?screen=<beat id> opens the level on that screen (a link
         straight to the torque wrench for Josh, 6 Oct 2026). Flag for Usman:
         remove for production with the other qaSkip shortcuts. */}
      {/* DEMO-ONLY: v0/v1 comparison. A simulation with a painted art set
         (ib-v2-scenes.ts: Investment Banking and Registered Nurse) plays
         with painted scenes and no sprites by default ("v1" since 14 Oct
         2026); ?v=0 plays the old sprite version ("v0"). The start screen
         and HUD toggles keep this param in step. Aviation uses its own v1/v2
         toggle to switch the complete authored simulation. */}
      {/* the page's main landmark, so the skip link and screen readers can
         find the game (WCAG 2.2 audit, 21 Oct 2026); the player's own
         <header> stops counting as a second page banner inside it */}
      <main>
        <SimulationPlayer key={level.id} simulation={simulation} level={level} versionSwitch={versionSwitch} startAt={Array.isArray(query.screen) ? query.screen[0] : query.screen} artVersion={version === "0" || !hasV2Art(simulation.id) ? 1 : simulation.id === "registered-nurse" && version !== "1" ? 3 : 2} />
      </main>
    </>
  );
}
