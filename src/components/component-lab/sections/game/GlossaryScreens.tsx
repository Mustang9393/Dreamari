"use client";

// DEMO-ONLY: Component Lab, Game UI part. Glossary Game screens. Only
// `export` was added to SpeechBubble, TermFlipCard, OptionList,
// FeedbackPanel, StreakModal, MasteryLoadingScreen and CompleteScreen in
// GlossaryGameExperience.tsx -- no behavior, markup or styles changed.
// CompleteScreenGate is never rendered here: it writes real progress and
// awards Dream Score on mount. CompleteScreen and StreakModal both play a
// sound the instant they mount (a real correct-answer chime / level-up
// sweep), so both sit behind a Play reveal rather than firing on page load.

import { glossaryFor } from "@/components/glossary/data";
import {
  CompleteScreen,
  FeedbackPanel,
  MasteryLoadingScreen,
  OptionList,
  SpeechBubble,
  StreakModal,
  TermFlipCard,
} from "@/components/glossary/GlossaryGameExperience";
import { ClippedStage, NotRendered, ProposedError, Reveal, Specimen, StateCell, StateGrid } from "../../kit";

const CAREER = glossaryFor("investment-banking");
const LESSON = CAREER?.lessons[0];
const TERM = LESSON?.terms[0];
const CHOICE_Q = LESSON?.questions.find((q) => q.kind === "choice");

export function GlossaryScreensGroup() {
  if (!CAREER || !LESSON || !TERM || !CHOICE_Q || CHOICE_Q.kind !== "choice") return null;
  return (
    <>
      <Specimen name="SpeechBubble" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Dreamy's line and the question prompt, in a solid always-dark bubble so it reads over any animated backdrop." when="Above every question in the Glossary Game.">
        <StateGrid min={260}>
          <StateCell label="Neutral" surface="game"><SpeechBubble>What is a company?</SpeechBubble></StateCell>
          <StateCell label="Correct" surface="game"><SpeechBubble tone="correct">Right, a company sells things to make money.</SpeechBubble></StateCell>
          <StateCell label="Wrong" surface="game"><SpeechBubble tone="wrong">Not quite. A company sells things to make money.</SpeechBubble></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="TermFlipCard" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="One vocabulary term, drawn as a hand-sketched illustration with its definition on the same face; an optional flip reveals a worked example." when="The Glossary Game's term-teaching screens.">
        <StateGrid min={260}>
          <StateCell label="Default" surface="game" minH={220}><TermFlipCard lesson={LESSON} term={TERM} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="OptionList" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The multiple-choice list for a Definition/Fill in the Blank/Catch the Misuse question." when="Every choice-kind Glossary Game question.">
        <StateGrid min={260}>
          <StateCell label="Unanswered" surface="game"><OptionList options={CHOICE_Q.options} correctIndex={CHOICE_Q.correctIndex} picked={null} onPick={() => {}} /></StateCell>
          <StateCell label="Picked correct" surface="game"><OptionList options={CHOICE_Q.options} correctIndex={CHOICE_Q.correctIndex} picked={CHOICE_Q.correctIndex} onPick={() => {}} /></StateCell>
          <StateCell label="Picked wrong" surface="game"><OptionList options={CHOICE_Q.options} correctIndex={CHOICE_Q.correctIndex} picked={0} onPick={() => {}} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FeedbackPanel" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The full-screen result card after a question: Dreamy's reaction pose, the why-line, Next Question / See Results." when="After every Glossary Game question resolves.">
        <StateGrid min={280}>
          <StateCell label="Correct" note="Fixed full-screen overlay, contained behind Play." minH={260}>
            <Reveal label="Play" height={260}><ClippedStage height={260}><FeedbackPanel correct text={CHOICE_Q.feedbackCorrect} isLast={false} onNext={() => {}} /></ClippedStage></Reveal>
          </StateCell>
          <StateCell label="Wrong" minH={260}>
            <Reveal label="Play" height={260}><ClippedStage height={260}><FeedbackPanel correct={false} text={CHOICE_Q.feedbackWrong} isLast={false} onNext={() => {}} /></ClippedStage></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="StreakModal" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="A bonus 'N in a row!' celebration modal, distinct from the per-question feedback panel." when="Every third correct answer in a row.">
        <StateGrid min={280}>
          <StateCell label="5 in a row" note="Plays a chime and a burst on mount, so it's gated behind Play." minH={260}>
            <Reveal label="Play" height={260}><StreakModal streak={5} onDismiss={() => {}} /></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MasteryLoadingScreen" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The one built loading state in the Glossary Game: a centered Dreamy plus an optional fact card while mastery is being checked." when="Between the last question and the Complete screen.">
        <StateGrid min={280}>
          <StateCell label="Built loading" minH={220}><ClippedStage height={220}><MasteryLoadingScreen fact={LESSON.facts[0] ?? null} /></ClippedStage></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CompleteScreen" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="The lesson's finish line: Dream Score, XP earned, mastery percent, fireworks. Never CompleteScreenGate, which writes progress and awards score on mount." when="Finishing a Glossary Game lesson.">
        <StateGrid min={280}>
          <StateCell label="Default" note="Plays a level-up sweep and lights fireworks on mount (real behavior), so it's gated behind Play, not shown on load." minH={420}>
            <Reveal label="Play" height={420}><ClippedStage height={420}><CompleteScreen lesson={LESSON} masteredCount={LESSON.terms.length} onContinue={() => {}} /></ClippedStage></Reveal>
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Error (missing)" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Inventory gap: no error state exists for a lesson that fails to load or a question that can't be scored." when="A network hiccup or malformed lesson mid-game. Whole-surface loading/error is also cataloged as States gallery #54.">
        <StateGrid min={260}>
          <StateCell label="Proposed error" kind="proposed"><ProposedError verb="load this lesson" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Other Glossary Game screens" file="src/components/glossary/GlossaryGameExperience.tsx" purpose="Everything else in the file is either file-local scaffolding for the ones above, or writes/plays audio/navigates on mount." when="See docs/handoff/COMPONENT_INVENTORY.md, section 4, Glossary.">
        <StateGrid min={260}>
          <StateCell label="CompleteScreenGate"><NotRendered reason="Writes real Glossary progress and awards Dream Score on mount." see="src/components/glossary/GlossaryGameExperience.tsx" /></StateCell>
          <StateCell label="TypeTerm, MatchUp, SortBuckets, ProfitBuilder"><NotRendered reason="File-local question-card renderers wired directly into the running lesson's state machine; not split out as standalone pure components." see="src/components/glossary/GlossaryGameExperience.tsx" /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
