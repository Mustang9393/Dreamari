"use client";

// DEMO-ONLY: Component Lab section, "Game UI". Play's interaction
// primitives, the Glossary Game's Levels map and screens, the three
// experimental background reskins, and the Play hub's poster cards. Mock
// beats/lessons are trimmed real content (ib-level-*.ts, rn-level-1.ts,
// glossary/data.ts), not invented shapes.
//
// Every game specimen is tagged Core kit or Bespoke (9 Oct 2026): core
// scales to every career by data, bespoke is drawn for one career and has
// a core fallback (src/components/play/coreKit.ts). The header's filter
// hides a group's heading when nothing in it matches.

import { useContext, type ReactNode } from "react";
import { LabViewContext, Section, SubHead, type Scale } from "../kit";
import { BespokePiecesGroup, ProceduralCelebrations } from "./game/BespokePieces";
import { CinematicPiecesGroup } from "./game/CinematicPieces";
import { GameThemesGroup } from "./game/GameThemes";
import { GlossaryLevelsGroup } from "./game/GlossaryLevels";
import { GlossaryScreensGroup } from "./game/GlossaryScreens";
import { PlayHubCardsGroup } from "./game/PlayHubCards";
import { PlayInteractionsGroup } from "./game/PlayInteractions";
import { SimulationPiecesGroup } from "./game/SimulationPieces";

/** A group heading plus its specimens; `has` is which scales it holds. */
function Group({ title, has, children }: { title: string; has: Scale[]; children: ReactNode }) {
  const { scale } = useContext(LabViewContext);
  if (scale !== "all" && !has.includes(scale)) return null;
  return (
    <>
      <SubHead>{title}</SubHead>
      {children}
    </>
  );
}

// Real game ids (games.ts). ?kit=core runs the whole level through toCoreLevel.
const CORE_RUNS = [
  { href: "/play/aviation-maintenance-technician?kit=core", label: "Aviation Maintenance" },
  { href: "/play/investment-banking?kit=core", label: "Investment Banker" },
  { href: "/play/registered-nurse?kit=core", label: "Registered Nurse" },
];

export function GameSection() {
  return (
    <Section id="game" title="Game UI" intro="Play's simulation engine, the Glossary Game, and the Play hub's own cards. Dark by default, games are their own world, not a themed page.">
      <p className="-mt-[var(--space-3)] flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] text-[13px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>Play a whole level on the core kit:</span>
        {CORE_RUNS.map((run) => (
          <a key={run.href} href={run.href} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2" style={{ color: "var(--primary)" }}>
            {run.label}
          </a>
        ))}
      </p>

      <Group title="Play interactions" has={["core"]}>
        <PlayInteractionsGroup />
      </Group>

      <Group title="Glossary Levels map" has={["core"]}>
        <GlossaryLevelsGroup />
      </Group>

      <Group title="Game background versions" has={["core"]}>
        <GameThemesGroup />
      </Group>

      <Group title="Play hub cards" has={["core"]}>
        <PlayHubCardsGroup />
      </Group>

      <Group title="Glossary game" has={["core"]}>
        <GlossaryScreensGroup />
      </Group>

      <Group title="Simulation player pieces" has={["core"]}>
        <SimulationPiecesGroup />
      </Group>

      <Group title="Cinematic presentation (Level 1 + Express)" has={["core", "bespoke"]}>
        <CinematicPiecesGroup />
        <ProceduralCelebrations />
      </Group>

      <Group title="Bespoke pieces and their core fallbacks" has={["bespoke"]}>
        <BespokePiecesGroup />
      </Group>
    </Section>
  );
}
