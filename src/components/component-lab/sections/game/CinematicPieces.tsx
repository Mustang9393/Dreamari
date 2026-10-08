"use client";

// DEMO-ONLY: Component Lab, Game UI part. The cinematic presentation that
// Level 1 of both careers (and both Express builds) plays with since 5 Oct
// 2026: name plates, the character name splash, reply bubbles, the paper
// document, the drain-bar timer, the firm seals and ending signatures, the
// section rule, and the run-up (title screen, How to Play, the mini
// lessons). Every cell renders the real component inside the same
// presentation context and career-colour scope the game sets; the beats are
// pulled straight from the live levels, not invented.

import { useState } from "react";
import { CareerSeal, EndingBackdrop } from "@/components/play/Celebrations";
import { INVESTMENT_BANKING, REGISTERED_NURSE } from "@/components/play/games";
import { IntroSplash } from "@/components/play/IntroSplash";
import { CardBody, ChoiceBody } from "@/components/play/interactions";
import { PreGameFlow, type PreGameMode } from "@/components/play/PreGame";
import { PresentationProvider } from "@/components/play/presentation";
import { bandFor, endingFor } from "@/components/play/scoring";
import { DialogueBox, DrainBar, EndingCard } from "@/components/play/SimulationPlayer";
import type { Beat, CardBeat, ChoiceBeat, Level, Simulation } from "@/components/play/types";
import { ClippedStage, NotRendered, Reveal, Specimen, StateCell, StateGrid } from "../../kit";

const GOLD = "var(--world-business-money-office)";
const TEAL = "var(--world-health-medicine)";
const IB_L1 = INVESTMENT_BANKING.levels[0];
const RN_L1 = REGISTERED_NURSE.levels[0];

function beat<T extends Beat>(level: Level, id: string): T {
  const found = level.beats.find((entry) => entry.id === id);
  if (!found) throw new Error(`Component Lab: beat ${id} is gone from ${level.id}`);
  return found as T;
}

/** The scope the game wraps a cinematic level in: the presentation flags,
 *  and the career's colour as --primary (gradient buttons, no app blue). */
function Cinematic({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <PresentationProvider value={{ directed: true, cinematic: true }}>
      <div className="play-career-world w-full" style={{ ["--primary" as string]: accent, ["--primary-foreground" as string]: "var(--background)" }}>
        {children}
      </div>
    </PresentationProvider>
  );
}

function useLocalResolve() {
  const [locked, setLocked] = useState<string | null>(null);
  return { locked, onResolve: (_tier: unknown, _why: string, id?: string) => setLocked(id ?? "resolved"), reset: () => setLocked(null) };
}

function Room({ src, children, height = 300 }: { src: string; children: React.ReactNode; height?: number }) {
  return (
    <ClippedStage height={height}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a lab backdrop, not a page image */}
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {children}
    </ClippedStage>
  );
}

function Bubbles({ accent, level, id }: { accent: string; level: Level; id: string }) {
  const { locked, onResolve, reset } = useLocalResolve();
  return (
    <Cinematic accent={accent}>
      <div className="flex flex-col gap-[10px]">
        <ChoiceBody beat={beat<ChoiceBeat>(level, id)} onResolve={onResolve} locked={locked} accent={accent} />
        {locked && (
          <button type="button" onClick={reset} className="dm-quiet self-start rounded-full border px-[12px] py-[5px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)" }}>
            Reset
          </button>
        )}
      </div>
    </Cinematic>
  );
}

function RunUp({ simulation, level, accent, initial }: { simulation: Simulation; level: Level; accent: string; initial: PreGameMode }) {
  const [key, setKey] = useState(0);
  return (
    <ClippedStage height={560}>
      <Cinematic accent={accent}>
        <PreGameFlow key={key} simulation={simulation} level={level} preGame={level.preGame!} accent={accent} initial={initial} inRun={false} onClose={() => setKey((k) => k + 1)} onStart={() => setKey((k) => k + 1)} />
      </Cinematic>
    </ClippedStage>
  );
}

export function CinematicPiecesGroup() {
  const ibAdvance = endingFor(IB_L1.endings, 92);
  const rnAdvance = endingFor(RN_L1.endings, 92);
  return (
    <>
      <Specimen name="Name plate (DialogueBox, cinematic)" scale="core" file="src/components/play/SimulationPlayer.tsx" purpose="A slanted career-colour plate that breaks the dialogue box's top edge whenever a person speaks; on an introduction a second segment carries the role." when="Any line spoken by a character on a cinematic level.">
        <StateGrid min={340}>
          <StateCell label="Speaker" surface="game" minH={150}>
            <Cinematic accent={GOLD}>
              <div className="pt-[20px]">
                <DialogueBox accent={GOLD} speaker="Christina" voice="character" staticSetup setup="“Before client work, you need to learn the language of investment banking (IB).”">
                  <span />
                </DialogueBox>
              </div>
            </Cinematic>
          </StateCell>
          <StateCell label="Introduction (with role)" surface="game" minH={150}>
            <Cinematic accent={TEAL}>
              <div className="pt-[20px]">
                <DialogueBox accent={TEAL} speaker="Rosa" speakerRole="Staff Nurse" voice="character" staticSetup setup="Rosa is the experienced nurse working beside you.">
                  <span />
                </DialogueBox>
              </div>
            </Cinematic>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="IntroSplash" scale="core" file="src/components/play/IntroSplash.tsx" purpose="A character's name set huge behind them on their introduction: a solid deep shade of the career colour with one light tint traced round the word's silhouette (no inner contour lines, no black keyline), and a top-to-bottom fade to transparent. Sized to the name's length." when="Every character introduction on a cinematic level (a 'Name • Role' label or Beat.introduce).">
        <StateGrid min={340}>
          <StateCell label="Bright room, long name (IB)" pad={false} minH={260}>
            <Room src="/images/play/ib/locations/reception.webp" height={260}><IntroSplash name="Christina" accent={GOLD} className="absolute inset-x-0 top-[12%] flex flex-col items-center" /></Room>
          </StateCell>
          <StateCell label="Dim room (nursing)" pad={false} minH={260}>
            <Room src="/images/play/rn/locations/station.jpg" height={260}><IntroSplash name="Rosa" accent={TEAL} className="absolute inset-x-0 top-[12%] flex flex-col items-center" /></Room>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Reply bubbles (ChoiceBody, cinematic)" scale="core" file="src/components/play/interactions.tsx" purpose="When every answer is quoted speech, the answers are the player's own speech bubbles, right-aligned with the tail toward them, staggered in. Same right / wrong / revealed states as the tiles." when="A choice whose options are all things you say (RN screen 30, IB screen 17).">
        <StateGrid min={360}>
          <StateCell label="Default, then answered (tap one)" surface="game" minH={300}><Bubbles accent={TEAL} level={RN_L1} id="RN2-30" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Paper document (DocumentBody, cinematic)" scale="core" file="src/components/play/interactions.tsx" purpose="The find-the-mistakes note as a clipped sheet of paper: ink, a rule under each line, a highlighter hinted on hover and laid down on a pick." when="Document layouts (RN screen 38, IB screen 28).">
        <StateGrid min={360}>
          <StateCell label="Default, then answered (tap one)" surface="game" minH={320}><Bubbles accent={TEAL} level={RN_L1} id="RN2-38" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DrainBar" scale="core" file="src/components/play/SimulationPlayer.tsx" purpose="The timed-question clock as a bar on the question box's top edge that drains, then turns red and pulses in the last third." when="Timed beats on a cinematic level (RN screen 45, IB's timed set).">
        <StateGrid min={300}>
          <StateCell label="Running" surface="game" minH={70}><DrainBar remaining={24} total={30} accent={TEAL} /></StateCell>
          <StateCell label="Urgent (last third)" surface="game" minH={70}><DrainBar remaining={7} total={30} accent={GOLD} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CareerSeal" scale="bespoke" fallback="the plain icon tile on the ending card, the same for every firm." file="src/components/play/Celebrations.tsx" purpose="The firm's own foil seal, stamped onto the promotion: its name round the ring and its mark from the game art in the centre (Cobalt's hexagonal C with a laurel, Riverbend's six-petal star). Lands with a spring, a shockwave and a sheen." when="The promotion ending on a cinematic level.">
        <StateGrid min={200}>
          <StateCell label="Cobalt Capital" surface="game" minH={180}><Reveal label="Stamp" height={170}><div className="flex h-full items-center justify-center"><CareerSeal firm={INVESTMENT_BANKING.firm} accent={GOLD} /></div></Reveal></StateCell>
          <StateCell label="Riverbend Medical Center" surface="game" minH={180}><Reveal label="Stamp" height={170}><div className="flex h-full items-center justify-center"><CareerSeal firm={REGISTERED_NURSE.firm} accent={TEAL} /></div></Reveal></StateCell>
          <StateCell label="Any other firm (initial)" surface="game" minH={180}><Reveal label="Stamp" height={170}><div className="flex h-full items-center justify-center"><CareerSeal firm="Northwind Studios" accent="var(--primary)" /></div></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="EndingBackdrop" scale="bespoke" fallback="none. The ending card stands on its own." file="src/components/play/Celebrations.tsx" purpose="The career world's signature behind the promotion, drawn in the band between the HUD and the result card: a heartbeat trace for Health & Medicine, a gold market line climbing to a glowing high for Business & Finance. Bespoke, never confetti." when="The promotion ending on a cinematic level.">
        <StateGrid min={340}>
          <StateCell label="Business & Finance" pad={false} minH={220}><Reveal label="Play" height={220}><EndingBackdrop world={INVESTMENT_BANKING.world} accent={GOLD} /></Reveal></StateCell>
          <StateCell label="Health & Medicine" pad={false} minH={220}><Reveal label="Play" height={220}><EndingBackdrop world={REGISTERED_NURSE.world} accent={TEAL} /></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="EndingCard (cinematic, promotion)" scale="core" file="src/components/play/SimulationPlayer.tsx" purpose="The promotion result as the game shows it: the firm's seal in place of a trophy tile, the headline before the score, the role step, the unlock line, the career-colour gradient button." when="A run that ends at 85 or above on a cinematic level.">
        <StateGrid min={360}>
          <StateCell label="IB, Bag Secured" surface="game" minH={600}><Reveal label="Play" height={600}><Cinematic accent={GOLD}><div className="flex justify-center p-[12px]"><EndingCard directed fromRole={IB_L1.role} ending={ibAdvance} reputation={92} band={bandFor(92)} simulation={INVESTMENT_BANKING} next={INVESTMENT_BANKING.levels[1]} misses={0} onAdvance={() => {}} onRepair={() => {}} onReplay={() => {}} /></div></Cinematic></Reveal></StateCell>
          <StateCell label="Nursing, off orientation" surface="game" minH={600}><Reveal label="Play" height={600}><Cinematic accent={TEAL}><div className="flex justify-center p-[12px]"><EndingCard directed fromRole={RN_L1.role} ending={rnAdvance} reputation={92} band={bandFor(92)} simulation={REGISTERED_NURSE} misses={0} noRepair plainEndings onAdvance={() => {}} onRepair={() => {}} onReplay={() => {}} /></div></Cinematic></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Section card (CardBody act)" scale="core" file="src/components/play/interactions.tsx" purpose="A checkpoint or section card, centred, with nothing drawn inside the box: no rule, no light sweep, no particle burst." when="Checkpoints, 'Level 1.5', and arrival cards on a cinematic level.">
        <StateGrid min={340}>
          <StateCell label="IB checkpoint" surface="game" minH={240}><Reveal label="Play" height={240}><Cinematic accent={GOLD}><div className="relative p-[16px]"><CardBody beat={beat<CardBeat>(IB_L1, "L1-CHECK")} onNext={() => {}} accent={GOLD} /></div></Cinematic></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Run-up (PreGameFlow)" scale="core" file="src/components/play/PreGame.tsx" purpose="The optional run-up before Level 1: the title screen over the career's art, How to Play (career track, a reputation meter you drive yourself, tappable skills) and the career's mini lesson. Never a gate; every screen has Skip." when="Opening Level 1 fresh, or the ? in the game HUD.">
        <StateGrid min={360}>
          <StateCell label="Title screen (IB)" pad={false} minH={560} note="As a fresh start. Its Back pill is the real link to /play, so it leaves the library."><Reveal label="Open" height={560}><RunUp simulation={INVESTMENT_BANKING} level={IB_L1} accent={GOLD} initial="start" /></Reveal></StateCell>
          <StateCell label="How to Play (nursing)" pad={false} minH={560}><Reveal label="Open" height={560}><RunUp simulation={REGISTERED_NURSE} level={RN_L1} accent={TEAL} initial="howto" /></Reveal></StateCell>
          <StateCell label="Mini lesson (IB 101)" pad={false} minH={560}><Reveal label="Open" height={560}><RunUp simulation={INVESTMENT_BANKING} level={IB_L1} accent={GOLD} initial="lesson" /></Reveal></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TrailerFlow" scale="bespoke" fallback="none yet. The run-up's title screen opens the game." file="src/components/play/TrailerFlow.tsx" purpose="The career trailer: kinetic word-by-word titles, a career-colour light streak on each cut, progress ticks in the letterbox, the consequence card drained to grey, a rim-lit silhouette, and the finale ladder in the game's track language." when="'Watch trailer' on the Play hub's featured card.">
        <StateGrid min={300}>
          <StateCell label="Trailer"><NotRendered reason="It portals to <body> (true full-bleed) and starts the career's music on open, so it can't sit inside a cell. Open it from the Play hub's featured card." see="src/components/play/TrailerFlow.tsx" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
