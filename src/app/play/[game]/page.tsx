import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { simulationFor } from "@/components/play/games";
import { SimulationPlayer } from "@/components/play/SimulationPlayer";
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
  searchParams: Promise<{ level?: string | string[]; mode?: string | string[] }>;
}) {
  const { game } = await params;
  const query = await searchParams;
  const simulation = simulationFor(game);
  if (!simulation) notFound();
  const wanted = Number(Array.isArray(query.level) ? query.level[0] : query.level);
  const picked = simulation.levels.find((entry) => entry.n === wanted) ?? simulation.levels[0];
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
  const level = express
    ? { ...expressBase, id: `${picked.id}-express`, express: true, beats: expressBase.beats.filter((beat) => !expressBase.expressCut!.includes(beat.id)) }
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
