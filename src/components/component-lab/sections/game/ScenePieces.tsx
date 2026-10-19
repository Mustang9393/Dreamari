"use client";

// DEMO-ONLY: Component Lab, Game UI part. The Registered Nurse v2 scene
// stack (CareerScene, 19 Oct 2026) and the art version switch. Both render
// through their public props; nothing in src/components/play was changed.

import { useState } from "react";
import { ArtVersionToggle } from "@/components/play/ArtVersionToggle";
import { CareerScene } from "@/components/play/CareerScene";
import type { ArtVersion, V2Image } from "@/components/play/ib-v2-scenes";
import { RN_IMAGES } from "@/components/play/rn-v2-images";
import { WORLD_COLORS } from "@/components/app/worlds";
import { Specimen, StateCell, StateGrid } from "../../kit";

const RN_ACCENT = WORLD_COLORS["Health & Medicine"];
const IB_ACCENT = WORLD_COLORS["Business & Finance"];

/** CareerScene fills its parent (absolute inset 0), so give it a 16:9 box. */
function Scene({ scene }: { scene: V2Image }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-md)]" style={{ aspectRatio: "16 / 9" }}>
      <CareerScene scene={scene} />
    </div>
  );
}

/** The real switch, kept clickable: it only flips this cell's own state. */
function Toggle({ initial, accent, size, includeV2 }: { initial: ArtVersion; accent: string; size: "start" | "hud"; includeV2?: boolean }) {
  const [version, setVersion] = useState<ArtVersion>(initial);
  return (
    <div className="flex justify-center">
      <ArtVersionToggle version={version} onChange={setVersion} accent={accent} size={size} includeV2={includeV2} />
    </div>
  );
}

export function ScenePiecesGroup() {
  return (
    <>
      <Specimen
        name="CareerScene" scale="bespoke"
        file="src/components/play/CareerScene.tsx"
        purpose="One shared canvas for a v2 scene: the saved room plate, a time-of-day light wash, then a transparent character layer on top, cover-cropped together so the person never drifts off the room."
        when="Registered Nurse at art v2 (the default), in SimulationPlayer and PreGame, whenever a scene has a composition (rn-v2-images.ts)."
        fallback="v0 and v1 keep LocationBackdrop: sprites over rooms, or the 13 Oct full paintings."
      >
        <StateGrid min={300}>
          <StateCell label="Station, Denise reads the notes" surface="game" minH={200} note="Why (commit a66bc317): the 13 Oct art redrew the whole picture per scene, so the room and the window view shifted. Now one plate per location.">
            <Scene scene={RN_IMAGES.rn_denise_reads_notes_station_afternoon} />
          </StateCell>
          <StateCell label="Same room, reaction swap" surface="game" minH={200} note="Reactions swap the person, never the room. Same station plate, only the Denise layer changes.">
            <Scene scene={RN_IMAGES.rn_denise_concerned_station_afternoon} />
          </StateCell>
          <StateCell label="Room 12" surface="game" minH={200} note="A second location: its own saved plate with its own character layer.">
            <Scene scene={RN_IMAGES.rn_room12_anxious_morning} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="ArtVersionToggle" scale="core"
        file="src/components/play/ArtVersionToggle.tsx"
        purpose="DEMO-ONLY team comparison switch for a simulation's scene art. On the start screen it sets the version for the run; in the HUD it flips the current screen in place."
        when="Start screen (size start) and the in-game progress row (size hud). Registered Nurse shows v0 | v1 | v2 with v2 the default; every other game keeps v0 | v1."
      >
        <StateGrid min={220}>
          <StateCell label="HUD, two versions (v1 on)" surface="game" minH={90} note="Investment Banking and AMT: v0 sprites, v1 painted scenes."><Toggle initial={2} accent={IB_ACCENT} size="hud" /></StateCell>
          <StateCell label="HUD, nurse (v2 on)" surface="game" minH={90} note="includeV2: the 19 Oct fixed rooms. ?v=1 keeps the 13 Oct set, ?v=0 the sprites."><Toggle initial={3} accent={RN_ACCENT} size="hud" includeV2 /></StateCell>
          <StateCell label="Start screen, nurse (v2 on)" surface="game" minH={90} note="Sized like the start screen's Back button."><Toggle initial={3} accent={RN_ACCENT} size="start" includeV2 /></StateCell>
          <StateCell label="Start screen, nurse (v0 on)" surface="game" minH={90} note="Click any option to flip it here; the lab cell keeps its own state."><Toggle initial={1} accent={RN_ACCENT} size="start" includeV2 /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
