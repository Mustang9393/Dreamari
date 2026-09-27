"use client";

// DEMO-ONLY: Interactions section, "Flows, end to end". Five real journeys
// through the app, each named screen carrying its real route (checked
// against src/app) and the one thing a student does there, then a
// LiveRoute to the flow's first screen. Nothing here is a mockup path --
// every route below is live today (see docs/handoff/specs/*.md for the
// locked behaviour each screen implements).

import { SubHead, Specimen, StateGrid, StateCell, LiveRoute } from "../../kit";
import { StepStrip, type FlowStep } from "./shared";

const BUILD_MATCH_PROFILE: FlowStep[] = [
  { screen: "Build", route: "/flow", does: "Answers interests, subjects, work vibe, education, cost, location and profile basics across 8 steps." },
  { screen: "Match · Mini Explore", route: "/match-grid", does: "Saves up to 3 careers from world tabs; taps a card to read What You'd Do / Good Fit / School & Path." },
  { screen: "Match · Rank", route: "/match-grid", does: "Orders 2-3 saved careers into numbered slots; tap fills #1, #2, #3." },
  { screen: "Profile · Top Three", route: "/profile?tab=top3&welcome=1", does: "Lands on the Welcome popup, then the ranked cards with pay, education and the next-step banner." },
];

const EXPLORE_DETAIL_SAVE: FlowStep[] = [
  { screen: "Explore · For You", route: "/explore", does: "Swipes the vertical reel of matched careers, or switches to Browse All's poster grid by world." },
  { screen: "Career Detail", route: "/career/software-engineer", does: "Reads What You'd Do / Good Fit If You Like / School & Path; can jump to Play or the Glossary game from here." },
  { screen: "Save to Top 3", route: "/career/software-engineer", does: "Taps “Add to your Top 3”; a shimmer sweep and toast confirm it, with an Undo path back out." },
];

const PLAY_SIM_ENDING: FlowStep[] = [
  { screen: "Play hub", route: "/play", does: "Picks the featured simulation card (Investment Banking today); compares Express against Full before starting." },
  { screen: "Simulation", route: "/play/investment-banking", does: "Plays scored beats: typed dialogue, timed questions, a drag-to-answer token, rank and pick checks." },
  { screen: "Level ending", route: "/play/investment-banking", does: "Reads the reputation band (Trusted / Respected / Cautious / At Risk) and the score breakdown." },
];

const GLOSSARY_MASTERY: FlowStep[] = [
  { screen: "Levels map", route: "/play/glossary/investment-banking", does: "Opens the signal-bars Levels button; sees which chapters ahead are locked past Level 1." },
  { screen: "Lesson", route: "/play/glossary/investment-banking", does: "Flips term cards, answers questions, then a timed Power Play round." },
  { screen: "Mastery", route: "/play/glossary/investment-banking", does: "Watches “Checking Your Mastery”, then the mastery screen: one filled skill dot per term." },
];

const CONNECT_ASK_ANSWER: FlowStep[] = [
  { screen: "Community / board", route: "/connect", does: "Opens a community's Questions tab from Communities, Events or People." },
  { screen: "Ask", route: "/connect", does: "Uses the inline “What do you want to ask?” composer to post a question to the board." },
  { screen: "Answer", route: "/connect", does: "A verified professional's answer lands in the thread; the asker can Like, Share, Report or Follow them." },
];

export function FlowsGroup() {
  return (
    <>
      <SubHead>Flows, end to end</SubHead>
      <p className="max-w-[68ch] text-[13px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
        Every journey a student actually takes, screen by real screen. Each strip&apos;s route is copy-checked against
        src/app; the LiveRoute beneath it loads the flow&apos;s real first screen (click to load, inert -- browsing
        further is on the real page itself, in its own tab).
      </p>

      <Specimen name="Build → Match → Top 3 → Profile" file="src/components/build/BuildFlowExperience.tsx, src/components/match-lab/MiniExploreMatch.tsx, src/components/profile/ProfileExperience.tsx" purpose="The one path every new student takes: eight Build questions to a saved, ranked Top 3 on their own Profile." when="A first session, or any 'start over' entry point.">
        <StateGrid min={600}>
          <StateCell label="Steps" minH={90}>
            <StepStrip steps={BUILD_MATCH_PROFILE} />
          </StateCell>
          <StateCell label="First screen: /flow" pad={false} minH={420}>
            <LiveRoute href="/flow" device="mobile" height={420} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Explore → Career Detail → Save / Top 3" file="src/components/app/ExploreExperience.tsx, src/components/career/CareerDetailExperience.tsx" purpose="How a career gets from a poster or reel card into a student's Top 3 without going through Build or Match at all." when="Any time browsing (not the guided flow) is how a career gets found.">
        <StateGrid min={600}>
          <StateCell label="Steps" minH={90}>
            <StepStrip steps={EXPLORE_DETAIL_SAVE} />
          </StateCell>
          <StateCell label="First screen: /explore" pad={false} minH={460}>
            <LiveRoute href="/explore" device="desktop" height={460} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Play hub → a simulation → its ending" file="src/components/play/PlayHub.tsx, src/components/play/SimulationPlayer.tsx" purpose="The content-page-before-playback pattern (Prime Video/Apple TV): the hub sells the simulation before the player starts it, and every run ends on a real verdict, not just a score." when="Profile's next-step banner, or browsing Play directly.">
        <StateGrid min={600}>
          <StateCell label="Steps" minH={90}>
            <StepStrip steps={PLAY_SIM_ENDING} />
          </StateCell>
          <StateCell label="First screen: /play" pad={false} minH={460}>
            <LiveRoute href="/play" device="desktop" height={460} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Glossary levels → lesson → mastery" file="src/components/glossary/LevelsMenu.tsx, src/components/glossary/GlossaryGameExperience.tsx" purpose="The vocabulary game's own climb: see the whole path (mostly locked), play the one authored lesson, land on a per-term mastery readout." when="Play hub's Glossary Games shelf, or a simulation's own vocabulary bridge.">
        <StateGrid min={600}>
          <StateCell label="Steps" minH={90}>
            <StepStrip steps={GLOSSARY_MASTERY} />
          </StateCell>
          <StateCell label="First screen: /play/glossary/investment-banking" pad={false} minH={480}>
            <LiveRoute href="/play/glossary/investment-banking" device="mobile" height={480} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Connect: ask → answer" file="src/components/connect/ConnectExperience.tsx" purpose="A student's question reaching a verified professional and getting a real answer back in the same thread." when="Any community or professional profile's Ask panel.">
        <StateGrid min={600}>
          <StateCell label="Steps" minH={90}>
            <StepStrip steps={CONNECT_ASK_ANSWER} />
          </StateCell>
          <StateCell label="First screen: /connect" pad={false} minH={460}>
            <LiveRoute href="/connect" device="desktop" height={460} />
          </StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
