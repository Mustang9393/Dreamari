import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { simulationFor } from "@/components/play/games";
import { SimulationPlayer } from "@/components/play/SimulationPlayer";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Career Simulation — Dreamari",
  description: "Play the job. Every decision moves your reputation.",
};

// One route per simulation. ?level= picks the level; it defaults to the first,
// and levels that are not built yet simply are not in the data.
export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ level?: string | string[] }>;
}) {
  const { game } = await params;
  const query = await searchParams;
  const simulation = simulationFor(game);
  if (!simulation) notFound();
  const wanted = Number(Array.isArray(query.level) ? query.level[0] : query.level);
  const level = simulation.levels.find((entry) => entry.n === wanted) ?? simulation.levels[0];
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      {/* Keyed on the level: without this, navigating Level 2 -> Level 3 reuses
         the same component instance, so its internal phase/run/result state
         (still "ending", still the OLD level's reputation) survives into the
         new level and renders as that level's own ending screen on a run that
         was never played. */}
      <SimulationPlayer key={level.id} simulation={simulation} level={level} />
    </>
  );
}
