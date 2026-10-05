import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { simulationFor } from "@/components/play/games";
import { SimulationPlayer } from "@/components/play/SimulationPlayer";
import { AMT_LEVEL_1_V2 } from "@/components/play/amt-level-1-v2";
import type { Level } from "@/components/play/types";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// DEMO-ONLY: ?v=2 lab builds, reached from the Quick links menu. AMT's v2
// keeps the team's detailed take (task card, hands-on torque wrench) beside
// the live Level 1, which follows the script screen for screen.
const LAB_LEVELS: Record<string, Level> = { "aviation-maintenance-technician:1": AMT_LEVEL_1_V2 };

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
  searchParams: Promise<{ level?: string | string[]; mode?: string | string[]; v?: string | string[] }>;
}) {
  const { game } = await params;
  const query = await searchParams;
  const simulation = simulationFor(game);
  if (!simulation) notFound();
  const wanted = Number(Array.isArray(query.level) ? query.level[0] : query.level);
  const main = simulation.levels.find((entry) => entry.n === wanted) ?? simulation.levels[0];
  // IB's and nursing's v2 labs are Level 1 itself now (games.ts). ?v=2
  // swaps in a lab build only where LAB_LEVELS has one (AMT).
  const version = Array.isArray(query.v) ? query.v[0] : query.v;
  const picked = (version === "2" ? LAB_LEVELS[`${simulation.id}:${main.n}`] : undefined) ?? main;
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
  const level = express
    ? {
        ...expressBase,
        id: `${picked.id}-express`,
        express: true,
        cinematic: expressBase.cinematic ?? picked.cinematic,
        worldTheme: expressBase.worldTheme ?? Boolean(picked.cinematic || picked.worldTheme),
        beats: expressBase.beats.filter((beat) => !expressBase.expressCut!.includes(beat.id)),
      }
    : picked;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Keyed on the level: without this, navigating Level 2 -> Level 3 reuses
         the same component instance, so its internal phase/run/result state
         (still "ending", still the OLD level's reputation) survives into the
         new level and renders as that level's own ending screen on a run that
         was never played. */}
      <SimulationPlayer key={level.id} simulation={simulation} level={level} />
    </>
  );
}
