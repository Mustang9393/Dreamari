"use client";

// DEMO-ONLY: Component Lab, Game UI part. Every bespoke piece of the career
// simulations next to its core-kit fallback (9 Oct 2026, Chandu: "make a
// version where there isnt the custom arts like ecg, toolbox, clocks etc
// ... because we wont be able to realistically scale that"). ~900 careers
// can't each get a hand-drawn instrument; every one can get the core kit.
//
// Both cells of a pair render the SAME live beat, pulled by id from the
// level files: the bespoke cell as authored, the core cell after
// toCoreBeat (src/components/play/coreKit.ts), the exact transform the
// player runs on /play/<game>?kit=core. Nothing here is a mock.
//
// Sound on mount (an act card's sweep, the badge reader's chime, the
// ending's level-up) sits behind a Play reveal, like the rest of the lab.
// HeroCamera measures the page's own dialogue box, so it is shown on the
// real route (LiveRoute) instead of inside a cell.

import { useState, type ReactNode } from "react";
import { WORLD_COLORS } from "@/components/app/worlds";
import { Balloons, TickerTapeStorm } from "@/components/play/BagSecured";
import { EndingBackdrop } from "@/components/play/Celebrations";
import { toCoreBeat } from "@/components/play/coreKit";
import { AVIATION_MAINTENANCE, INVESTMENT_BANKING, REGISTERED_NURSE } from "@/components/play/games";
import { AMT_LEVEL_1 } from "@/components/play/amt-level-1";
import { AMT_LEVEL_1_V2 } from "@/components/play/amt-level-1-v2";
import { IB_LEVEL_1 as IB_LEVEL_1_LEGACY } from "@/components/play/ib-level-1";
import { IB_LEVEL_1_V2 } from "@/components/play/ib-level-1-v2";
import { RN_LEVEL_1_V2 } from "@/components/play/rn-level-1-v2";
import { BossOverlay, CardBody, ChoiceBody, FlagsBody, InspectBody, PickBody, RankBody, RapidBody, RevealBody, SliderBody } from "@/components/play/interactions";
import { PresentationProvider, type Presentation } from "@/components/play/presentation";
import { bandFor, endingFor } from "@/components/play/scoring";
import { EndingCard, ReviewBody } from "@/components/play/SimulationPlayer";
import { TorqueBody } from "@/components/play/TorqueBody";
import type { Beat, Level, Simulation } from "@/components/play/types";
import { WorldContext } from "@/components/play/WorldUi";
import { LiveRoute, NotRendered, noop, Reveal, Specimen, StateCell, StateGrid } from "../../kit";

const PLAIN: Presentation = { directed: false, cinematic: true };

/** A live beat by id. Content files change under the lab; a missing id
 *  shows as a plain "gone" note instead of crashing the page. */
function liveBeat(level: Level, id: string): Beat | undefined {
  return level.beats.find((entry) => entry.id === id);
}

/** The scope the player wraps a level in: the presentation flags, the
 *  firm/world the instruments read, and the career colour as --primary. */
function Stage({ sim, level, presentation = PLAIN, children }: { sim: Simulation; level: Level; presentation?: Presentation; children: ReactNode }) {
  const accent = WORLD_COLORS[sim.world] ?? "var(--primary)";
  return (
    <PresentationProvider value={presentation}>
      <WorldContext.Provider value={{ firm: sim.firm, place: level.place, world: sim.world }}>
        <div className="play-career-world w-full" style={{ ["--primary" as string]: accent, ["--primary-foreground" as string]: "var(--background)" }}>
          {children}
        </div>
      </WorldContext.Provider>
    </PresentationProvider>
  );
}

/** Any beat, drawn by the body the player would pick for it, with a local
 *  lock-in (no store, no navigation) and a Reset once it resolves. */
function BeatView({ beat, sim, level }: { beat: Beat; sim: Simulation; level: Level }) {
  const [locked, setLocked] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const accent = WORLD_COLORS[sim.world] ?? "var(--primary)";
  const onResolve = (_tier: unknown, _why: string, id?: string) => setLocked(id ?? "resolved");
  const body = (() => {
    switch (beat.kind) {
      case "card":
        return <CardBody beat={beat} onNext={noop} accent={accent} />;
      case "choice":
        return beat.layout === "boss" ? <BossOverlay beat={beat} onResolve={onResolve} locked={locked} /> : <ChoiceBody beat={beat} onResolve={onResolve} locked={locked} accent={accent} cast={level.cast} />;
      case "reveal":
        return <RevealBody beat={beat} onNext={noop} />;
      case "flags":
        return <FlagsBody beat={beat} onResolve={onResolve} remaining={beat.timer ?? 30} />;
      case "slider":
        return <SliderBody beat={beat} onResolve={onResolve} />;
      case "rank":
        return <RankBody beat={beat} onResolve={onResolve} />;
      case "pick":
        return <PickBody beat={beat} onResolve={onResolve} remaining={beat.timer ?? 30} />;
      case "rapid":
        return <RapidBody beat={beat} onResolve={onResolve} remaining={beat.timer ?? 30} />;
      case "inspect":
        return <InspectBody beat={beat} onResolve={onResolve} locked={locked} accent={accent} />;
      case "torque":
        return <TorqueBody beat={beat} onResolve={onResolve} locked={locked} />;
      case "review":
        return <ReviewBody title={beat.title} body={beat.body} onNext={noop} reputation={88} accent={accent} pending={beat.pending} style={beat.style} deciding={beat.deciding} decidingNote={beat.decidingNote} />;
      default:
        return <NotRendered reason={`No lab view for a ${beat.kind} beat.`} />;
    }
  })();
  return (
    <Stage sim={sim} level={level}>
      <div className="flex flex-col gap-[10px]">
        <div key={run}>{body}</div>
        {locked && (
          <button type="button" onClick={() => { setLocked(null); setRun((n) => n + 1); }} className="dm-quiet self-start rounded-full border px-[12px] py-[5px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
            Reset
          </button>
        )}
      </div>
    </Stage>
  );
}

/** One beat as authored (bespoke) and after toCoreBeat (core), side by
 *  side. `patch` adds a field to a live beat only where no live beat
 *  carries the instrument today (the inbox), and says so in the label. */
function Pair({ sim, level, id, label, gate = false, patch }: { sim: Simulation; level: Level; id: string; label: string; gate?: boolean; patch?: Partial<Beat> }) {
  const found = liveBeat(level, id);
  const beat = found && patch ? ({ ...found, ...patch } as Beat) : found;
  const view = (b: Beat) => {
    const node = <BeatView beat={b} sim={sim} level={level} />;
    return gate ? <Reveal label="Play" clip={false}>{node}</Reveal> : node;
  };
  const gone = <NotRendered reason={`Beat ${id} is gone from ${level.id}.`} see="src/components/play/" />;
  return (
    <>
      <StateCell label={`${label} · ${id}`} scale="bespoke" surface="game">{beat ? view(beat) : gone}</StateCell>
      <StateCell label={`${label}, core · ${id}`} scale="core" surface="game">{beat ? view(toCoreBeat(beat)) : gone}</StateCell>
    </>
  );
}

const AMT_PLAY = `/play/${AVIATION_MAINTENANCE.id}`;

/** A clipped box for fixed layers (canvas, backdrop) that, unlike
 *  ClippedStage, keeps its cell one column wide so a pair sits side by side. */
function Box({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-md)]" style={{ height, transform: "translateZ(0)" }}>
      {children}
    </div>
  );
}

export function BespokePiecesGroup() {
  const amtEnding = endingFor(AMT_LEVEL_1.endings, 92);
  const accent = WORLD_COLORS[AVIATION_MAINTENANCE.world] ?? "var(--primary)";
  const ending = (presentation: Presentation, backdrop: boolean) => (
    <Reveal label="Play" clip={false}>
      {/* The backdrop is a fixed band from 92px down (as under the HUD), so
          the card sits below it here the way it does in the player. */}
      <Box height={backdrop ? 820 : 600}>
        <Stage sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} presentation={presentation}>
          {backdrop && <EndingBackdrop world={AVIATION_MAINTENANCE.world} accent={accent} />}
          <div className={`relative flex justify-center p-[12px] ${backdrop ? "pt-[236px]" : ""}`}>
            <EndingCard directed fromRole={AMT_LEVEL_1.role} ending={amtEnding} reputation={92} band={bandFor(92)} simulation={AVIATION_MAINTENANCE} misses={0} noRepair plainEndings onAdvance={noop} onRepair={noop} onReplay={noop} />
          </div>
        </Stage>
      </Box>
    </Reveal>
  );
  return (
    <>
      <Specimen name="VitalsMonitor (ECG)" scale="bespoke" fallback="a facts card. The patient's state, room and time become plain tiles." file="src/components/play/WorldUi.tsx" purpose="The bedside monitor: four readings and a live ECG trace that settles or worsens with the answer.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-44" label="Monitor" />
        </StateGrid>
      </Specimen>

      <Specimen name="DeskClock" scale="bespoke" fallback="a facts card. The deadline becomes one plain tile." file="src/components/play/WorldUi.tsx" purpose="The floor's clock: local time ticking and a deadline counting down.">
        <StateGrid min={340}>
          <Pair sim={INVESTMENT_BANKING} level={IB_LEVEL_1_V2} id="L1-29" label="Clock" />
        </StateGrid>
      </Specimen>

      <Specimen name="ShadowBoard (tool foam)" scale="bespoke" fallback="Tap to Reveal. The missing tool first, then the rest in one row." file="src/components/play/ShadowBoard.tsx" purpose="The toolbox's shadow foam: tap each tool to count it, tap the empty slot to bring the missing one back.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} id="AMT-18c" label="Foam" />
        </StateGrid>
      </Specimen>

      <Specimen name="Elevator" scale="bespoke" fallback="the plain act card, same line." file="src/components/play/WorldUi.tsx" purpose="An act break as the elevator climbing to the floor.">
        <StateGrid min={340}>
          <Pair sim={INVESTMENT_BANKING} level={IB_LEVEL_1_V2} id="L1-ACT2" label="Elevator" gate />
        </StateGrid>
      </Specimen>

      <Specimen name="IdBadge" scale="bespoke" fallback="the plain intro card, same words." file="src/components/play/WorldUi.tsx" purpose="The first screen: your ID badge touched to the reader by the door.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-01" label="Badge" gate />
        </StateGrid>
      </Specimen>

      <Specimen name="LightsBoard" scale="bespoke" fallback="Rank the Order on its own." file="src/components/play/WorldUi.tsx" purpose="A board of call lights, one per room, numbered in your order and cleared on submit.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-26" label="Lights" />
        </StateGrid>
      </Specimen>

      <Specimen name="RecordSheet" scale="bespoke" fallback="the plain card. Its body already names the overdue dose." file="src/components/play/WorldUi.tsx" purpose="A record with one flagged row; the answer writes the row's next state.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-47" label="Record" />
        </StateGrid>
      </Specimen>

      <Specimen name="ReportSheet" scale="bespoke" fallback="Pick N of M as a plain list." file="src/components/play/WorldUi.tsx" purpose="A report sheet whose numbered lines fill as you pick cards.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-51" label="Sheet" />
        </StateGrid>
      </Specimen>

      <Specimen name="Wristband, InboxHeader" scale="bespoke" fallback="plain quick questions on one clock." file="src/components/play/WorldUi.tsx" purpose="Quick questions dressed as the patient's ID band (scanned on the right answer) or as emails in the firm's inbox.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-18" label="Wristband" />
          <Pair sim={INVESTMENT_BANKING} level={IB_LEVEL_1_V2} id="L1-18" label="Inbox (added here)" patch={{ world: { kind: "inbox" } }} />
        </StateGrid>
      </Specimen>

      <Specimen name="InspectBody (photo hotspots)" scale="bespoke" fallback="Find All Red Flags. Each hotspot is a row; the issues are the flagged rows." file="src/components/play/interactions.tsx" purpose="Tap the parts of a photo that deserve a closer look. Needs hand-placed hotspots per photo.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} id="AMT-07" label="Inspect" />
        </StateGrid>
      </Specimen>

      <Specimen name="TorqueBody (torque wrench)" scale="bespoke" fallback="the Risk Slider: under, at or over the mark." file="src/components/play/TorqueBody.tsx" purpose="Set a click-type torque wrench to the manual's mark and stop at the click. One career's tool.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1_V2} id="AMT-18b" label="Torque" />
        </StateGrid>
      </Specimen>

      <Specimen name="DepartureBoard, ops radio" scale="bespoke" fallback="the plain card title and a plain chat header." file="src/components/play/interactions.tsx" purpose="A card title on split-flap tiles with a live countdown, and Operations on the ramp radio.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} id="AMT-15" label="Board" />
        </StateGrid>
      </Specimen>

      <Specimen name="BriefedChoice (Briefing board)" scale="bespoke" fallback="the same options under a paper task card titled Briefing, same lines." file="src/components/play/interactions.tsx" purpose="The situation as a departure board above a choice; the right call stops the countdown.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} id="AMT-37" label="Briefing" />
        </StateGrid>
      </Specimen>

      <Specimen name="Zones and move layouts" scale="bespoke" fallback="options with the shared drag token (dragEnabled)." file="src/components/play/interactions.tsx" purpose="Files dragged into one of three storage zones, or an action card dragged into a YOUR MOVE drop zone.">
        <StateGrid min={340}>
          <Pair sim={INVESTMENT_BANKING} level={IB_LEVEL_1_V2} id="L1-20" label="Zones" />
          <Pair sim={INVESTMENT_BANKING} level={IB_LEVEL_1_LEGACY} id="L1-28" label="Move" />
        </StateGrid>
      </Specimen>

      <Specimen name="Chat with radio header" scale="bespoke" fallback="the plain chat header." file="src/components/play/interactions.tsx" purpose="A chat reply where the other side is a ramp radio, not a phone thread.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} id="AMT-16" label="Radio chat" />
        </StateGrid>
      </Specimen>

      <Specimen name="PaperChoice (chart, slide)" scale="bespoke" fallback="the plain paper document, no red-pen marks." file="src/components/play/interactions.tsx" purpose="Find-the-mistake drawn as the career's own paper: a hospital handover chart, or a page of the client deck.">
        <StateGrid min={340}>
          <Pair sim={REGISTERED_NURSE} level={RN_LEVEL_1_V2} id="RN2-38" label="Chart" />
          <Pair sim={INVESTMENT_BANKING} level={IB_LEVEL_1_V2} id="L1-24" label="Slide" />
        </StateGrid>
      </Specimen>

      <Specimen name="LogbookReview" scale="bespoke" fallback="the plain ticked checklist." file="src/components/play/WorldUi.tsx" purpose="The final review as a maintenance logbook page, stamped and signed.">
        <StateGrid min={340}>
          <Pair sim={AVIATION_MAINTENANCE} level={AMT_LEVEL_1} id="AMT-39" label="Logbook" />
        </StateGrid>
      </Specimen>

      <Specimen name="HeroCamera" scale="bespoke" fallback="the scene art, static, no push-in or reticle." file="src/components/play/HeroCamera.tsx" purpose="A camera on the scene art that pushes in on a hand-placed region and locks a reticle on one spot. It measures the page's own dialogue box, so both cells run the real route.">
        <StateGrid min={340}>
          <StateCell label="Camera · AMT-03b" scale="bespoke" pad={false}>
            <LiveRoute href={`${AMT_PLAY}?screen=AMT-03b`} height={300} />
          </StateCell>
          <StateCell label="Camera, core · AMT-03b" scale="core" pad={false}>
            <LiveRoute href={`${AMT_PLAY}?screen=AMT-03b&kit=core`} height={300} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Promotion ending (seal, backdrop)" scale="bespoke" fallback="the plain icon tile on the ending card, no backdrop." file="src/components/play/Celebrations.tsx" purpose="The firm's foil seal on the promotion card and the career world's signature drawn behind it.">
        <StateGrid min={340}>
          <StateCell label="Seal and backdrop · AMT" scale="bespoke" surface="game" pad={false}>
            <div className="p-[var(--space-3)]">{ending({ directed: true, cinematic: true }, true)}</div>
          </StateCell>
          <StateCell label="Ending, core · AMT" scale="core" surface="game" pad={false}>
            <div className="p-[var(--space-3)]">{ending({ directed: true, cinematic: true, coreKit: true }, false)}</div>
          </StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}

/** The procedural celebrations: core, so they sit with the cinematic
 *  group (Game.tsx), not with the bespoke pairs. */
export function ProceduralCelebrations() {
  const accent = WORLD_COLORS[AVIATION_MAINTENANCE.world] ?? "var(--primary)";
  return (
    <Specimen name="TickerTapeStorm, Balloons" scale="core" file="src/components/play/BagSecured.tsx" purpose="Procedural celebrations in the career world's palette: the ticker-tape parade behind a promotion, balloons on a passed checkpoint. Drawn by code, so every career gets them free.">
      <StateGrid min={340}>
        <StateCell label="Ticker tape · AMT" surface="game">
          <Reveal label="Play" clip={false}>
            <Box height={260}>
              <TickerTapeStorm world={AVIATION_MAINTENANCE.world} accent={accent} firm={AVIATION_MAINTENANCE.firm} />
            </Box>
          </Reveal>
        </StateCell>
        <StateCell label="Balloons · nursing" surface="game" note="Portals to the page, so they rise over the whole library once.">
          <Reveal label="Play" clip={false}>
            <Balloons world={REGISTERED_NURSE.world} accent={WORLD_COLORS[REGISTERED_NURSE.world] ?? "var(--primary)"} />
          </Reveal>
        </StateCell>
      </StateGrid>
    </Specimen>
  );
}
