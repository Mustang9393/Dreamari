"use client";

// DEMO-ONLY: Component Lab, Game UI part. The Play simulation's interaction
// primitives -- OptionButton in every state, the shared Question heading,
// every beat body (interactions.tsx, all pure/exported) and BossOverlay.
// Mock beats are trimmed real examples from ib-level-1/2/3.ts and
// rn-level-1.ts (not invented shapes), so the copy and tiers read true.

import { useState } from "react";
import {
  BossOverlay,
  BucketBody,
  CardBody,
  ChainBody,
  CheckBody,
  ChoiceBody,
  FlagsBody,
  FlipsBody,
  FocusBody,
  MatchBody,
  OptionButton,
  PickBody,
  Question,
  RankBody,
  RapidBody,
  RevealBody,
  SliderBody,
} from "@/components/play/interactions";
import type {
  BucketBeat,
  CardBeat,
  ChainBeat,
  CheckBeat,
  ChoiceBeat,
  FlagsBeat,
  FlipsBeat,
  FocusBeat,
  Level,
  MatchBeat,
  PickBeat,
  RankBeat,
  RapidBeat,
  RevealBeat,
  SliderBeat,
} from "@/components/play/types";
import { IB_LEVEL_1 } from "@/components/play/ib-level-1";
import { IB_LEVEL_2 } from "@/components/play/ib-level-2";
import { RN_LEVEL_1_V2 } from "@/components/play/rn-level-1-v2";
import { noop, NotRendered, Specimen, StateCell, StateGrid } from "../../kit";

const GAME_BG = "#070914";

/** Every resolve-driven body needs somewhere to put its lock-in; a tiny
 *  local "locked" state (no store, no navigation) is enough to see the
 *  real interaction play out. */
function useLocalResolve() {
  const [locked, setLocked] = useState<string | null>(null);
  return { locked, onResolve: (_tier: unknown, _why: string, id?: string) => setLocked(id ?? "resolved") };
}

// ---------------------------------------------------------------- mock beats
// Trimmed from real level content (ib-level-1/2/3.ts, rn-level-1.ts) --
// same tiers, same why-lines, shortened where a level's own art/timer
// plumbing doesn't matter for showing the interaction itself.

const CARD_BEAT: CardBeat = {
  kind: "card",
  variant: "offer",
  id: "L2-01",
  speaker: "Narrator",
  setup: "Your offer",
  title: "Cobalt Capital, Investment Banking Analyst.",
  facts: [
    { label: "Position", value: "Analyst · Year 1" },
    { label: "Salary", value: "$110,000 + bonus" },
    { label: "Hours", value: "80-90 / week" },
  ],
  body: "Standard for the industry. Long days early on, and the hours ease as you move up.",
  cta: "Accept Offer",
};

const CHECK_BEAT: CheckBeat = {
  kind: "check",
  method: "drag",
  id: "RN1-05",
  speaker: "System",
  setup: "Quick check before you start.",
  question: "A patient starts breathing badly at 2 AM. Who notices first?",
  prompt: "Drag the blue dot to the answer, or tap the answer.",
  options: [
    { label: "The nurse at the bedside", correct: true, why: "Right. The nurse is the one in the room." },
    { label: "The head of the hospital", correct: false, why: "Not this one. Try again." },
    { label: "The person who books appointments", correct: false, why: "Not this one. Try again." },
  ],
  cta: "Continue",
};

const REVEAL_BEAT: RevealBeat = {
  kind: "reveal",
  id: "L1-09",
  speaker: "System",
  title: "You are building real career skills. Every decision in this game practices skills investment bankers use in real life.",
  prompt: "Tap any skill tag to see what it means.",
  rows: [
    { label: "Decision-Making", reveal: "Compare options and make thoughtful choices." },
    { label: "Active Learning", reveal: "Learn from new information and apply it." },
  ],
  note: "2 of 15 career skills. After each decision, we show you which skill you practiced.",
  cta: "Continue",
};

const FLIPS_BEAT: FlipsBeat = {
  kind: "flips",
  id: "RN1-12",
  speaker: "Rosa",
  setup: '"Four words you will hear before lunch."',
  title: "Learn them now and the rest of the day makes sense.",
  prompt: "Tap the card for the next word.",
  cards: [
    { term: "Vitals", def: "The basic body numbers, like heart rate and temperature" },
    { term: "Chart", def: "The patient record, where everything gets written down" },
    { term: "Report", def: "The handover, when one nurse tells the next what happened" },
    { term: "Escalate", def: "Tell someone more senior, straight away" },
  ],
  cta: "Continue",
};

const FOCUS_BEAT: FocusBeat = {
  kind: "focus",
  id: "L1-14",
  speaker: "Christina",
  castMember: "Christina",
  title: "Two terms you will hear all the time.",
  terms: [
    { term: "Comps", def: "Similar companies used for comparison." },
    { term: "Deck", def: "A slide presentation." },
  ],
};

const CHOICE_BEAT: ChoiceBeat = {
  kind: "choice",
  layout: "options",
  id: "L2-10",
  speaker: "Narrator",
  setup: "Christina introduces you to Marcus, the VP. The team pitches Maison Laurent tomorrow.",
  question: "What should you do first?",
  choices: [
    { id: "a", label: "Ask for your role and deadline", tier: "best", why: "Right. Analysts need context before speed. Two minutes saves a day." },
    { id: "b", label: "Start changing slides", tier: "wrong", why: "Fast feels productive, but you don't know which slides are yours." },
    { id: "c", label: "Wait for Jordan (Analyst)", tier: "wrong", why: "Waiting lets Jordan decide your role. Nobody is coming to assign you work." },
  ],
  feedback: "Strong start. Analysts need context before they move fast.",
  feedbackCta: "Continue",
  skills: ["Verbal Communication", "Time Management"],
};

const BOSS_BEAT: ChoiceBeat = {
  kind: "choice",
  layout: "boss",
  id: "L1-25",
  speaker: "Narrator",
  setup: "Marcus sent the deal email to the whole team. Your name is on it.",
  question: "What do you do?",
  choices: [
    { id: "a", label: "Send a short thank-you to the deal lead", tier: "best", why: "Right. One short note to one person. That is how people remember you without you asking them to." },
    { id: "b", label: "Assume everyone already knows what you did", tier: "wrong", why: "Nobody is keeping a list of what you did. Being quiet about good work is not the same as being humble." },
    { id: "c", label: "Reply all thanking everybody", tier: "wrong", why: "Reply all turns a thank-you into a performance. The whole team did not need the email." },
  ],
  feedback: "",
  feedbackCta: "Continue",
  skills: ["Social Awareness", "Verbal Communication"],
};

const MATCH_BEAT: MatchBeat = {
  kind: "match",
  id: "RN1-13",
  speaker: "Rosa",
  setup: '"I need four things from you, all at once."',
  question: "Match what she said to what you do.",
  prompt: "Tap a quote, then tap what you do.",
  pairs: [
    { term: '"Get her vitals."', def: "Check her heart rate and temperature" },
    { term: '"It is in the chart."', def: "Look in the patient record" },
    { term: '"Give me report."', def: "Tell her what happened on your shift" },
    { term: '"Escalate it."', def: "Tell someone more senior now" },
  ],
  whenRight: "Right. Four words, four things to actually go and do.",
  whenWrong: "Close. Vitals are numbers, the chart is the record, escalate means tell someone now.",
  feedback: "",
  feedbackCta: "Continue",
  skills: ["Reading Comprehension", "Active Learning"],
};

const RAPID_BEAT: RapidBeat = {
  kind: "rapid",
  id: "L1-18",
  timer: 45,
  speaker: "Christina",
  castMember: "Christina",
  question: "",
  items: [
    {
      question: "How long should an email to a senior banker be?",
      options: [
        { label: "Two full pages with every detail", correct: false, why: "Too long. Bankers read on a phone between meetings." },
        { label: "Four sentences or less", correct: true, why: "Right. Answer first, detail underneath." },
        { label: "As long as possible to explain everything", correct: false, why: "Long is not thorough. The skill is what you leave out." },
      ],
    },
    {
      question: "Christina asks for a number you do not know. What should you say?",
      options: [
        { label: '"This estimate is probably correct."', correct: false, why: "Probably is dangerous around numbers. If it's wrong, you said it was fine." },
        { label: '"I will confirm and follow up."', correct: true, why: "Right. Honest, quick, and it commits you to closing the gap." },
        { label: '"Someone else should know that."', correct: false, why: "Maybe true, but it hands the problem back. She asked you." },
      ],
    },
  ],
  whenPass: "Right. Short, honest, quick to flag, and you know the words. That is a teammate people trust with a client email.",
  whenFail: "Close. On a real desk any one of those four slips is the one people remember.",
  feedback: "",
  feedbackCta: "Continue",
  skills: ["Written Communication", "Decision-Making"],
};

const CHAIN_BEAT: ChainBeat = {
  kind: "chain",
  id: "L2-11",
  speaker: "Narrator",
  setup: "Build the pitch one sentence at a time. All three parts have to connect.",
  question: "What is Cobalt's case for Maison Laurent?",
  steps: [
    { label: "Client goal", prompt: "What does Maison Laurent want?", options: [{ label: "Grow globally", correct: true }, { label: "Cut its marketing budget", correct: false }, { label: "Sell fewer products", correct: false }] },
    { label: "Cobalt strength", prompt: "Why is Cobalt a good fit?", options: [{ label: "We have the biggest office", correct: false }, { label: "Understands luxury brands", correct: true }, { label: "We are the cheapest option", correct: false }] },
    { label: "Outcome", prompt: "What can Cobalt help Maison Laurent earn?", options: [{ label: "Investor trust", correct: true }, { label: "A longer meeting", correct: false }, { label: "More slides", correct: false }] },
  ],
  whenRight: "Right. Goal, strength, outcome. Three sentences that hold together as one argument.",
  whenWrong: "Close. A pitch only works if all three parts connect. One weak link breaks it.",
  feedback: "A strong pitch is three sentences: what the client wants, why you can deliver, what they get. All three or none.",
  feedbackCta: "Continue",
  skills: ["Persuasive Communication", "Critical Thinking"],
};

const SLIDER_BEAT: SliderBeat = {
  kind: "slider",
  id: "L2-14",
  mood: "night",
  speaker: "Christina",
  setup: '"I need the model before Marcus reviews it. You aligned at kickoff, so I am not checking behind you on this one."',
  question: "How risky is it to send Marcus the model without checking the source?",
  steps: [
    { label: "Low", tier: "risky", why: "Not low. If the source is wrong, Marcus repeats it to the client." },
    { label: "Medium", tier: "wrong", why: "Higher. Christina trusts you now, so nobody checks behind you." },
    { label: "High", tier: "best", why: "Right. High. It can still be caught, but only if someone catches it." },
    { label: "Critical", tier: "acceptable", why: "Close. Critical is for things you can't undo. This is still fixable." },
  ],
  feedback: "Sending an unchecked number up the chain is high risk. Not medium, because nobody checks behind you.",
  feedbackCta: "Continue",
  skills: ["Critical Thinking", "Decision-Making"],
};

const FLAGS_BEAT: FlagsBeat = {
  kind: "flags",
  id: "L2-17",
  timer: 60,
  speaker: "Narrator",
  castMember: "Jordan",
  tone: "alarm",
  setup: "It is 10:10 AM. The meeting is in 20 minutes. There are errors in Jordan's work, and you have to fix them before Christina and Marcus come in.",
  question: "Tap every red flag in Jordan's work.",
  rows: [
    { label: "Bags sold: 2", flag: false, why: "Not an error. Two is small, but not wrong." },
    { label: "Price per bag: $2,000", flag: false, why: "Not an error. That's a normal price." },
    { label: "Revenue: 2 × $2,000 = $400", flag: true, why: "Right. 2 × $2,000 is $4,000, not $400." },
    { label: "Profit: $4,000 − $1,000 = $5,000", flag: true, why: "Right. $4,000 minus $1,000 is $3,000. Subtracting can't grow a number." },
    { label: "Source: Missing", flag: true, why: "Right. A number nobody can check should never reach a client." },
  ],
  whenRight: "Right. The multiplication, the subtraction, and the missing source.",
  whenWrong: "Three lines are wrong: the multiplication, the subtraction, and the missing source.",
  feedback: "Three errors: the multiplication, the subtraction, and the missing source. Checking work means redoing the maths.",
  feedbackCta: "Continue",
  skills: ["Critical Thinking", "Decision-Making"],
};

const RANK_BEAT: RankBeat = {
  kind: "rank",
  id: "L1-33",
  speaker: "Narrator",
  mood: "night",
  question: "Rank these from best to worst.",
  order: ["Ask how you can help", "Wish her luck and keep working", "Laugh and walk away"],
  whenRight: "Right. Offering costs you nothing tonight and it is the thing people remember about you.",
  whenWrong: "Wishing her luck is not unkind, it is just not help. Walking away from someone drowning at 7 PM is the one people repeat later.",
  feedback: "",
  feedbackCta: "Continue",
  skills: ["Social Awareness", "Critical Thinking"],
};

const PICK_BEAT: PickBeat = {
  kind: "pick",
  id: "L3-11",
  mood: "crunch",
  speaker: "Narrator",
  timer: 60,
  setup: "You manage two Analysts. Silverman Sacks is chasing the same deal.",
  question: "Pick the 2 tasks that give Cobalt the best chance.",
  pick: 2,
  cards: [
    { label: "Bring sharper market insight", role: "pick" },
    { label: "Point out the risks in Silverman Sacks' plan", role: "pick" },
    { label: "Offer to cut Cobalt's fees", role: "leave" },
    { label: "Get inside information on Silverman Sacks", role: "harmful" },
    { label: "Make the numbers look bigger", role: "harmful" },
  ],
  whenRight: "Right. Better insight and a clear read of the rival are what a client pays a bank for.",
  whenWrong: "Cutting fees buys the work instead of earning it. Cobalt wins on thinking, not price.",
  whenHarmful: "Stolen information and inflated numbers end careers. Nothing won that way survives.",
  feedback: "Insight and a clear read of the rival win deals. Cutting fees and cheating do not.",
  feedbackCta: "Continue",
  skills: ["Decision-Making", "Critical Thinking"],
};

const BUCKET_BEAT: BucketBeat = {
  kind: "bucket",
  id: "L3-12",
  mood: "crunch",
  speaker: "Christina",
  setup: '"Which of these belong in the final pitch?"',
  question: "Sort each idea.",
  buckets: ["Helps Cobalt win", "Weak pitch"],
  items: [
    { label: "Show why Asia growth matters", into: 0 },
    { label: "Use general fashion trends", into: 1 },
    { label: "Prove Cobalt understands luxury customers", into: 0 },
    { label: "Focus only on slide design", into: 1 },
  ],
  whenRight: "Right. A pitch is built from what the client cares about, not from what was easy to make.",
  whenWrong: "Close. Look for the ideas that answer why Cobalt, not the ones describing what Cobalt did.",
  feedback: "Strong ideas prove you understand the client. Weak ones talk about effort, design or promises.",
  feedbackCta: "Continue",
  skills: ["Persuasive Communication", "Critical Thinking"],
};

// Every other ChoiceBody layout, pulled live by id from the level files
// (all core: each draws from the beat's own words, no per-career art).
function liveChoice(level: Level, id: string): ChoiceBeat | undefined {
  const found = level.beats.find((entry) => entry.id === id);
  return found?.kind === "choice" ? found : undefined;
}
const LAYOUTS: { label: string; id: string; beat?: ChoiceBeat; cast?: Record<string, string> }[] = [
  { label: "layout: blank", id: "RN2-33", beat: liveChoice(RN_LEVEL_1_V2, "RN2-33") },
  { label: "layout: tiles", id: "L2-13", beat: liveChoice(IB_LEVEL_2, "L2-13") },
  { label: "layout: document", id: "L2-15", beat: liveChoice(IB_LEVEL_2, "L2-15") },
  { label: "layout: chat", id: "L1-30", beat: liveChoice(IB_LEVEL_1, "L1-30"), cast: IB_LEVEL_1.cast },
  { label: "options + dragEnabled", id: "L1-06", beat: liveChoice(IB_LEVEL_1, "L1-06") },
];

// ------------------------------------------------------------------- pieces

function ResolveDemo({ children }: { children: (props: { locked: string | null; onResolve: (tier: unknown, why: string, id?: string) => void }) => React.ReactNode }) {
  const { locked, onResolve } = useLocalResolve();
  return <>{children({ locked, onResolve })}</>;
}

export function PlayInteractionsGroup() {
  return (
    <>
      <Specimen name="OptionButton" scale="core" file="src/components/play/interactions.tsx" purpose="The single answer tile every beat type builds on: numbered, tier-colored once it locks, shakeable on a wrong pick." when="Any beat that presents choices to tap.">
        <StateGrid>
          <StateCell label="Default" surface="game"><OptionButton index={0} label="An investment bank" onClick={noop} /></StateCell>
          <StateCell label="Selected (best)" surface="game"><OptionButton index={0} label="An investment bank" tier="best" picked onClick={noop} /></StateCell>
          <StateCell label="Locked (disabled)" surface="game"><OptionButton index={0} label="An investment bank" disabled onClick={noop} /></StateCell>
          <StateCell label="Correct (revealed)" surface="game"><OptionButton index={0} label="An investment bank" tier="best" revealed onClick={noop} /></StateCell>
          <StateCell label="Wrong" surface="game"><OptionButton index={1} label="A shoe designer" tier="wrong" picked onClick={noop} /></StateCell>
          <StateCell label="Risky (picked)" surface="game" note="Level 2/3 content still authors risky/acceptable tiers alongside best/wrong."><OptionButton index={2} label="Get inside information on the rival" tier="risky" picked onClick={noop} /></StateCell>
          <StateCell label="Dimmed (another option picked)" surface="game" note="Every unpicked option once one locks in, real prop dimmed."><OptionButton index={1} label="A shoe designer" dimmed onClick={noop} /></StateCell>
          <StateCell label="Compact" surface="game" note="Tighter row for a preview that has to leave the scene most of the room, real prop compact."><OptionButton index={0} label="An investment bank" compact onClick={noop} /></StateCell>
          <StateCell label="Focus" surface="game" note="Tab to it: the app-wide :focus-visible ring in globals.css (27 Sept 2026)."><OptionButton index={0} label="An investment bank" onClick={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Question" scale="core" file="src/components/play/interactions.tsx" purpose="The heading of a beat's activity, sized above the dialogue box's own line.">
        <StateGrid min={280}>
          <StateCell label="Default" surface="game"><Question>A shoe company wants to buy a smaller shoe company. Who helps organize the deal?</Question></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CardBody" scale="core" file="src/components/play/interactions.tsx" purpose="Intro, narrative, character and offer cards, one button, no score." when="Beats with kind: 'card' (variant: intro/character/chapter/offer/step/act).">
        <StateGrid min={300}>
          <StateCell label="offer variant" surface="game"><CardBody beat={CARD_BEAT} onNext={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CheckBody" scale="core" file="src/components/play/interactions.tsx" purpose="The unscored comprehension check after a teach card: unlimited tries, never a strike." when="Beats with kind: 'check'.">
        <StateGrid min={300}>
          <StateCell label="method: drag (tap fallback)" surface="game"><CheckBody beat={CHECK_BEAT} onNext={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RevealBody" scale="core" file="src/components/play/interactions.tsx" purpose="Tap to Reveal rows; Continue only appears once every row is open." when="Beats with kind: 'reveal'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game"><RevealBody beat={REVEAL_BEAT} onNext={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FlipsBody" scale="core" file="src/components/play/interactions.tsx" purpose="Word Cards: one term per card, paged through with a 3D page turn." when="Beats with kind: 'flips'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game"><FlipsBody beat={FLIPS_BEAT} onNext={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FocusBody" scale="core" file="src/components/play/interactions.tsx" purpose="Teach Card - Focus One: two term cards, only one sharp at a time." when="Beats with kind: 'focus'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game"><FocusBody beat={FOCUS_BEAT} onNext={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ChoiceBody" scale="core" file="src/components/play/interactions.tsx" purpose="Pick one option, locks immediately, Scenario, Timed Scenario, Fill in the Blank, Catch the Mistake all share this body." when="Beats with kind: 'choice'. Layouts: options, blank, tiles, document and chat; options can add the drag token (dragEnabled).">
        <StateGrid min={300}>
          <ResolveDemo>{({ locked, onResolve }) => <StateCell label="Default, tap to lock in" surface="game"><ChoiceBody beat={CHOICE_BEAT} onResolve={onResolve} locked={locked} /></StateCell>}</ResolveDemo>
          <StateCell label="Locked, correct picked" surface="game" note="Static locked prop, not a click; this is the exact real end-state (other options dimmed and disabled)."><ChoiceBody beat={CHOICE_BEAT} onResolve={noop} locked="a" /></StateCell>
          <StateCell label="Locked, wrong picked" surface="game" note="The best answer auto-reveals on any wrong lock-in (OptionButton's revealed prop)."><ChoiceBody beat={CHOICE_BEAT} onResolve={noop} locked="b" /></StateCell>
          {LAYOUTS.map((layout) => (
            <ResolveDemo key={layout.label}>
              {({ locked, onResolve }) => (
                <StateCell label={layout.label} surface="game">
                  {layout.beat ? <ChoiceBody beat={layout.beat} onResolve={onResolve} locked={locked} cast={layout.cast} /> : <NotRendered reason={`Beat ${layout.id} is gone from its level.`} />}
                </StateCell>
              )}
            </ResolveDemo>
          ))}
        </StateGrid>
      </Specimen>

      <Specimen name="BossOverlay" scale="core" file="src/components/play/interactions.tsx" purpose="Boss Moment: the same choice mechanic in a gold trophy frame, never red." when="A choice beat with layout: 'boss'.">
        <StateGrid min={300}>
          <ResolveDemo>{({ locked, onResolve }) => <StateCell label="Default, tap to lock in" surface="game"><BossOverlay beat={BOSS_BEAT} onResolve={onResolve} locked={locked} /></StateCell>}</ResolveDemo>
          <StateCell label="Locked, correct picked" surface="game" note="Static locked prop, the exact real end-state."><BossOverlay beat={BOSS_BEAT} onResolve={noop} locked="a" /></StateCell>
          <StateCell label="Locked, wrong picked" surface="game"><BossOverlay beat={BOSS_BEAT} onResolve={noop} locked="b" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="MatchBody" scale="core" file="src/components/play/interactions.tsx" purpose="Tap a term, then its definition; a right pair flashes green and clears, a wrong one shakes and lets go." when="Beats with kind: 'match'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game" note="Its right/wrong feedback (flash, shake) resolves via onResolve; the result card is FeedbackSheet, shown separately in SimulationPieces."><MatchBody beat={MATCH_BEAT} onResolve={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RapidBody" scale="core" file="src/components/play/interactions.tsx" purpose="A set of quick questions on one shared countdown; the set is one scored beat, its children score nothing." when="Beats with kind: 'rapid'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game"><RapidBody beat={RAPID_BEAT} onResolve={noop} remaining={RAPID_BEAT.timer ?? 30} /></StateCell>
          <StateCell label="Timed out" surface="game" note="remaining=0 with beat.timer set fires the real auto-submit effect, whatever was answered so far scores."><RapidBody beat={RAPID_BEAT} onResolve={noop} remaining={0} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="ChainBody" scale="core" file="src/components/play/interactions.tsx" purpose="Build the Strongest Answer: chained steps, one score for the whole chain." when="Beats with kind: 'chain'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game" note="Its right/wrong feedback (flash, shake) resolves via onResolve; the result card is FeedbackSheet, shown separately in SimulationPieces."><ChainBody beat={CHAIN_BEAT} onResolve={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="SliderBody" scale="core" file="src/components/play/interactions.tsx" purpose="Risk Slider: drag across labelled segments, then submit; only the correct segment scores its tier." when="Beats with kind: 'slider'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game" note="Its right/wrong feedback (flash, shake) resolves via onResolve; the result card is FeedbackSheet, shown separately in SimulationPieces."><SliderBody beat={SLIDER_BEAT} onResolve={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="FlagsBody" scale="core" file="src/components/play/interactions.tsx" purpose="Find All Red Flags: tap every wrong row, then submit." when="Beats with kind: 'flags'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game"><FlagsBody beat={FLAGS_BEAT} onResolve={noop} remaining={FLAGS_BEAT.timer ?? 30} /></StateCell>
          <StateCell label="Timed out" surface="game" note="remaining=0 fires the real auto-submit effect with whatever's marked so far."><FlagsBody beat={FLAGS_BEAT} onResolve={noop} remaining={0} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RankBody" scale="core" file="src/components/play/interactions.tsx" purpose="Rank the Order: shuffled rows, moved with up/down, then submitted." when="Beats with kind: 'rank'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game" note="Its right/wrong feedback (flash, shake) resolves via onResolve; the result card is FeedbackSheet, shown separately in SimulationPieces."><RankBody beat={RANK_BEAT} onResolve={noop} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PickBody" scale="core" file="src/components/play/interactions.tsx" purpose="Pick N of M: choose exactly N cards, then submit; a harmful card scores Risky regardless." when="Beats with kind: 'pick'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game"><PickBody beat={PICK_BEAT} onResolve={noop} remaining={PICK_BEAT.timer ?? 30} /></StateCell>
          <StateCell label="Timed out" surface="game" note="remaining=0 fires the real auto-submit effect with whatever's chosen so far."><PickBody beat={PICK_BEAT} onResolve={noop} remaining={0} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BucketBody" scale="core" file="src/components/play/interactions.tsx" purpose="Two-Bucket Sort: one item at a time, two buttons." when="Beats with kind: 'bucket'.">
        <StateGrid min={300}>
          <StateCell label="Default" surface="game" note="Its right/wrong feedback (flash, shake) resolves via onResolve; the result card is FeedbackSheet, shown separately in SimulationPieces."><BucketBody beat={BUCKET_BEAT} onResolve={noop} /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}

// Re-exported so sibling parts (SimulationPieces) can share the same game
// background color without a page-local hex living in two files.
export { GAME_BG };
