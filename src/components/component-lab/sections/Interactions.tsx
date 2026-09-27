"use client";

// DEMO-ONLY: Component Lab section, "Interactions and motion". Answers a
// question the rest of the lab doesn't yet: does the component library
// document interaction models and transitions for the whole app, not just
// components in isolation? Four parts, in order: the real flows a student
// takes end to end (Build/Match/Top3/Profile, Explore/Career Detail/Save,
// Play hub/simulation/ending, Glossary levels/lesson/mastery, Connect
// ask/answer), the gesture and keyboard models the app leans on, the page-
// and step-level transitions with their real durations, and every real
// sound trigger. Micro-interaction components that already have live Replay
// demos elsewhere (HoverBeam, ConfirmShimmer, PlayBurst, Confetti, SparkBar,
// the dm-* nudges, DetailModal's states, Listbox's keyboard) are
// cross-referenced rather than rebuilt -- see each Specimen's own note.

import { Section } from "../kit";
import { FlowsGroup } from "./interactions/Flows";
import { ModelsGroup } from "./interactions/Models";
import { TransitionsGroup } from "./interactions/Transitions";
import { SoundGroup } from "./interactions/Sound";

export function InteractionsSection() {
  return (
    <Section
      id="interactions"
      title="Interactions and motion"
      intro="How the app moves and responds, end to end: the real flows a student takes screen by screen, the gesture and keyboard models each surface leans on, the transitions and micro-interactions with their real timing, and every real sound trigger. Not a repeat of the components already shown elsewhere -- each part cross-references where a piece is already live."
    >
      <FlowsGroup />
      <ModelsGroup />
      <TransitionsGroup />
      <SoundGroup />
    </Section>
  );
}
