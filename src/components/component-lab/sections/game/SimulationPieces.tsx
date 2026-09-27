"use client";

// DEMO-ONLY: Component Lab, Game UI part. SimulationPlayer's HUD and
// beat-chrome pieces. Only `export` was added to Hud, ScoreGauge, Clock,
// DialogueBox, FeedbackSheet and EndingCard in SimulationPlayer.tsx -- no
// behavior, markup or styles changed. PerformancePlanFlow and
// ConnectInterstitial are not rendered live (see the NotRendered cells).

import { IB_LEVEL_1 } from "@/components/play/ib-level-1";
import { IB_LEVEL_2 } from "@/components/play/ib-level-2";
import { INVESTMENT_BANKING } from "@/components/play/games";
import { bandFor, endingFor } from "@/components/play/scoring";
import { Clock, DialogueBox, EndingCard, FeedbackSheet, Hud, ScoreGauge } from "@/components/play/SimulationPlayer";
import type { ChoiceBeat } from "@/components/play/types";
import { ClippedStage, NotRendered, ProposedError, ProposedLoading, Reveal, Specimen, StateCell, StateGrid } from "../../kit";

const ACCENT = "var(--world-business-money-office)";
const REPUTATION = 62;
const BAND = bandFor(REPUTATION);

const FEEDBACK_BEAT: ChoiceBeat = {
  kind: "choice",
  layout: "options",
  id: "L2-10",
  speaker: "Narrator",
  setup: "Christina introduces you to Marcus, the VP. The team pitches Maison Laurent tomorrow.",
  question: "What should you do first?",
  choices: [
    { id: "a", label: "Ask for your role and deadline", tier: "best", why: "Right. Analysts need context before speed. Two minutes saves a day." },
    { id: "b", label: "Start changing slides", tier: "wrong", why: "Fast feels productive, but you don't know which slides are yours." },
  ],
  feedback: "Strong start. Analysts need context before they move fast.",
  feedbackCta: "Continue",
  skills: ["Verbal Communication", "Time Management"],
};

const ADVANCING_ENDING = endingFor(IB_LEVEL_1.endings, 88);
const RETRY_ENDING = endingFor(IB_LEVEL_1.endings, 55);

export function SimulationPiecesGroup() {
  return (
    <>
      <Specimen name="Hud" file="src/components/play/SimulationPlayer.tsx" purpose="The simulation's top bar: back links, title/level, reputation gauge, music/sound toggles, and the scored-beat progress dots." when="The top of every simulation level screen.">
        <StateGrid min={340}>
          <StateCell label="Default (band hidden, L1)" surface="game" note="Music/sound toggles are the real ones and write dreamari-music-muted/dreamari-sound-muted on click; don't click-test them here.">
            <Hud simulation={INVESTMENT_BANKING} level={IB_LEVEL_1} reputation={REPUTATION} band={BAND} scored={4} delta={5} accent={ACCENT} />
          </StateCell>
          <StateCell label="Band shown (hideBand off)" surface="game" note="Same Hud, a level copy with hideBand:false, to show the plain ScoreGauge instead of the tappable score.">
            <Hud simulation={INVESTMENT_BANKING} level={{ ...IB_LEVEL_1, hideBand: false }} reputation={REPUTATION} band={BAND} scored={7} delta={-5} accent={ACCENT} onBack={() => {}} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ScoreGauge" file="src/components/play/SimulationPlayer.tsx" purpose="The reputation ring in the Hud's corner, in the career's own world color." when="Inside Hud, whenever a level doesn't hide its band.">
        <StateGrid min={160}>
          <StateCell label="Default" minH={90}><ScoreGauge reputation={62} band={bandFor(62)} delta={null} accent={ACCENT} /></StateCell>
          <StateCell label="Delta up" minH={90}><ScoreGauge reputation={67} band={bandFor(67)} delta={5} accent={ACCENT} /></StateCell>
          <StateCell label="Delta down" minH={90}><ScoreGauge reputation={57} band={bandFor(57)} delta={-5} accent={ACCENT} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Clock" file="src/components/play/SimulationPlayer.tsx" purpose="A silent countdown ring for timed beats; pulses only in the last third." when="Rapid, Flags and Pick beats with a timer.">
        <StateGrid min={140}>
          <StateCell label="Default" minH={80}><Clock remaining={40} total={45} /></StateCell>
          <StateCell label="Urgent (last third)" minH={80}><Clock remaining={12} total={45} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="DialogueBox" file="src/components/play/SimulationPlayer.tsx" purpose="The typewriter-revealed scene line a character or the narrator delivers, with the beat's activity nested inside it." when="Every beat in a simulation level.">
        <StateGrid min={320}>
          <StateCell label="Default (narrator)" surface="game" note="voice='character' is skipped here: it plays a per-syllable voice blip while the line types." minH={160}>
            <DialogueBox accent={ACCENT} setup="Christina introduces you to Marcus, the VP. The team pitches Maison Laurent tomorrow." onAdvance={() => {}}>
              <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>The beat&apos;s activity (a Choice, Check, etc.) renders here.</p>
            </DialogueBox>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FeedbackSheet" file="src/components/play/SimulationPlayer.tsx" purpose="The result card after a scored beat: reaction pose, the why-line for the chosen answer, delta and running reputation." when="After every scored beat resolves.">
        <StateGrid min={320}>
          <StateCell label="Best" minH={220}><ClippedStage height={220}><FeedbackSheet beat={FEEDBACK_BEAT} result={{ tier: "best", why: FEEDBACK_BEAT.choices[0].why, delta: 5 }} reputation={REPUTATION} onNext={() => {}} /></ClippedStage></StateCell>
          <StateCell label="Wrong" minH={220}><ClippedStage height={220}><FeedbackSheet beat={FEEDBACK_BEAT} result={{ tier: "wrong", why: FEEDBACK_BEAT.choices[1].why, delta: -5 }} reputation={REPUTATION - 5} onNext={() => {}} /></ClippedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="EndingCard" file="src/components/play/SimulationPlayer.tsx" purpose="The level's closing card: icon, reputation/band, headline, message, and the advance/retry/replay actions." when="The end of every simulation level.">
        <StateGrid min={320}>
          <StateCell label="Advances (next level)" note="Plays a level-up sound on mount when the ending advances, so it's gated behind Play." minH={320}>
            <Reveal label="Play" height={320}><EndingCard ending={ADVANCING_ENDING} reputation={88} band={bandFor(88)} simulation={INVESTMENT_BANKING} next={IB_LEVEL_2} misses={1} onAdvance={() => {}} onRepair={() => {}} onReplay={() => {}} /></Reveal>
          </StateCell>
          <StateCell label="Retry level" minH={320}><ClippedStage height={320}><EndingCard ending={RETRY_ENDING} reputation={55} band={bandFor(55)} simulation={INVESTMENT_BANKING} misses={3} onAdvance={() => {}} onRepair={() => {}} onReplay={() => {}} /></ClippedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Missing states" file="src/components/play/SimulationPlayer.tsx" purpose="Inventory gap: no built loading state while a level's beats/art load, and no built error state for a failed audio/asset load." when="A slow connection between the hub and a level's first beat.">
        <StateGrid min={260}>
          <StateCell label="Level loading" kind="proposed"><ProposedLoading label="Loading level" shape="chip" /></StateCell>
          <StateCell label="Audio failed" kind="proposed"><ProposedError verb="load the level audio" pill="Music" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PerformancePlanFlow, ConnectInterstitial" file="src/components/play/PerformancePlanFlow.tsx, src/components/play/ConnectInterstitial.tsx" purpose="A three-strike warning takeover, and the between-levels Connect prompt." when="Three wrong/risky answers in one level; between built levels.">
        <StateGrid min={260}>
          <StateCell label="PerformancePlanFlow"><NotRendered reason="Its warning/step/passed/terminated phase is internal useState with no prop to preset it, there's no safe way to force each state for a gallery without real clicks through the flow." see="src/components/play/PerformancePlanFlow.tsx" /></StateCell>
          <StateCell label="ConnectInterstitial"><NotRendered reason="Awards real Dream Score XP on click." see="src/components/play/ConnectInterstitial.tsx" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
