"use client";

import { createContext, useContext } from "react";

// Which presentation rules the current level opts into (Level.directed, 4 Oct
// 2026). A context rather than a prop so the interaction bodies, the dialogue
// box and the cards can all read it without threading a flag through every
// layer -- and so a level that does not opt in (Express, Nursing, Levels 2
// and 3) renders exactly as it did before.
export type Presentation = { directed: boolean };

const PresentationContext = createContext<Presentation>({ directed: false });

export const PresentationProvider = PresentationContext.Provider;

export function usePresentation(): Presentation {
  return useContext(PresentationContext);
}

// A typed line inside a dialogue box registers here while it is still
// typing, so one tap (or Space/Enter) anywhere on the box finishes EVERY
// line in it at once instead of only the box's own setup line.
export type TypingRegistry = {
  register: (id: string, skip: () => void) => void;
  unregister: (id: string) => void;
  /** True once the player has tapped to show it all in this box. */
  skipped: boolean;
};

const TypingContext = createContext<TypingRegistry | null>(null);

export const TypingProvider = TypingContext.Provider;

export function useTypingRegistry(): TypingRegistry | null {
  return useContext(TypingContext);
}
