"use client";

// DEMO-ONLY: Component Lab section, "Game UI". Play's interaction
// primitives, the Glossary Game's Levels map and screens, the three
// experimental background reskins, and the Play hub's poster cards. Mock
// beats/lessons are trimmed real content (ib-level-*.ts, rn-level-1.ts,
// glossary/data.ts), not invented shapes.

import { Section, SubHead } from "../kit";
import { GameThemesGroup } from "./game/GameThemes";
import { GlossaryLevelsGroup } from "./game/GlossaryLevels";
import { GlossaryScreensGroup } from "./game/GlossaryScreens";
import { PlayHubCardsGroup } from "./game/PlayHubCards";
import { PlayInteractionsGroup } from "./game/PlayInteractions";
import { SimulationPiecesGroup } from "./game/SimulationPieces";

export function GameSection() {
  return (
    <Section id="game" title="Game UI" intro="Play's simulation engine, the Glossary Game, and the Play hub's own cards. Dark by default, games are their own world, not a themed page.">
      <SubHead>Play interactions</SubHead>
      <PlayInteractionsGroup />

      <SubHead>Glossary Levels map</SubHead>
      <GlossaryLevelsGroup />

      <SubHead>Game background versions</SubHead>
      <GameThemesGroup />

      <SubHead>Play hub cards</SubHead>
      <PlayHubCardsGroup />

      <SubHead>Glossary Game screens</SubHead>
      <GlossaryScreensGroup />

      <SubHead>Simulation player pieces</SubHead>
      <SimulationPiecesGroup />
    </Section>
  );
}
