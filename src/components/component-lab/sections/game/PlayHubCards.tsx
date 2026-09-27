"use client";

// DEMO-ONLY: Component Lab, Game UI part. Play hub's row/hero cards. Only
// `export` was added to RowCard, HeroShelfCard and CornerBadge in
// PlayHub.tsx -- no behavior, markup or styles changed.

import { INVESTMENT_BANKING, SOON } from "@/components/play/games";
import { CornerBadge, HeroShelfCard, RowCard } from "@/components/play/PlayHub";
import { EDGE, Specimen, StateCell, StateGrid } from "../../kit";

const SOFTWARE_ENGINEER = SOON.find((c) => c.careerId === "software-engineer")!;

export function PlayHubCardsGroup() {
  return (
    <>
      <Specimen
        name="RowCard"
        file="src/components/play/PlayHub.tsx"
        purpose="One poster card in a Play hub rail: a playable career simulation, or a 'Coming soon' placeholder. Bottom-right corner badge carries play/lock."
        when="Every rail on the Play hub (Career Simulations, In the works). Rail loading/error/empty is already in States gallery #52, not repeated here."
      >
        <StateGrid min={220}>
          <StateCell label="Default (playable)"><RowCard candidate={{ kind: "sim", id: INVESTMENT_BANKING.id, sim: INVESTMENT_BANKING }} onSelect={() => {}} /></StateCell>
          <StateCell label="Locked (Coming soon)"><RowCard candidate={{ kind: "soon", id: SOFTWARE_ENGINEER.careerId, soon: SOFTWARE_ENGINEER }} /></StateCell>
          <StateCell label="Focused in rail (active)" note="Real prop active: the three size tiers only 'the focused row should look like that' (direct feedback, 21 Sept 2026)."><RowCard candidate={{ kind: "sim", id: INVESTMENT_BANKING.id, sim: INVESTMENT_BANKING }} active onSelect={() => {}} /></StateCell>
          <StateCell label="Long title" note="Uses EDGE.longTitle in place of the real career title."><RowCard candidate={{ kind: "sim", id: INVESTMENT_BANKING.id, sim: { ...INVESTMENT_BANKING, title: EDGE.longTitle } }} onSelect={() => {}} /></StateCell>
          <StateCell label="Image failure" note="cover points at a missing file; falls back to the world-tinted glyph."><RowCard candidate={{ kind: "sim", id: INVESTMENT_BANKING.id, sim: { ...INVESTMENT_BANKING, cover: EDGE.brokenImage } }} onSelect={() => {}} /></StateCell>
          <StateCell label="Hover / focus" note="Hover or Tab to it to see the state."><RowCard candidate={{ kind: "sim", id: INVESTMENT_BANKING.id, sim: INVESTMENT_BANKING }} onSelect={() => {}} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="HeroShelfCard"
        file="src/components/play/PlayHub.tsx"
        purpose="The generalized version of RowCard used by the phone-stack shelves (Glossary Games, In the works), any career-ish item, not just a Simulation."
        when="The Play hub's deck/shelf rows on narrow viewports."
      >
        <StateGrid min={220}>
          <StateCell label="Compact (rest of the shelf)"><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: INVESTMENT_BANKING.cover, world: INVESTMENT_BANKING.world, sub: "Day in the Life" }} onSelect={() => {}} /></StateCell>
          <StateCell label="Side (active, focused)" note="Real prop active: the mid-size tier for the deck's side cards."><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: INVESTMENT_BANKING.cover, world: INVESTMENT_BANKING.world, sub: "Day in the Life" }} active onSelect={() => {}} /></StateCell>
          <StateCell label="Hero (large, front of deck)" note="Real prop large: the phone-stack's front card size." minH={200}><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: INVESTMENT_BANKING.cover, world: INVESTMENT_BANKING.world, sub: "Day in the Life" }} large onSelect={() => {}} /></StateCell>
          <StateCell label="Locked (Coming soon)"><HeroShelfCard item={{ id: SOFTWARE_ENGINEER.careerId, title: SOFTWARE_ENGINEER.title, cover: SOFTWARE_ENGINEER.cover, world: SOFTWARE_ENGINEER.world, locked: true }} onSelect={() => {}} /></StateCell>
          <StateCell label="Long title" note="Uses EDGE.longTitle."><HeroShelfCard item={{ id: "long", title: EDGE.longTitle, cover: INVESTMENT_BANKING.cover, world: INVESTMENT_BANKING.world }} onSelect={() => {}} /></StateCell>
          <StateCell label="Image failure"><HeroShelfCard item={{ id: "broken", title: INVESTMENT_BANKING.title, cover: EDGE.brokenImage, world: INVESTMENT_BANKING.world }} onSelect={() => {}} /></StateCell>
          <StateCell label="Hover / focus" note="Hover or Tab to it to see the state."><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: INVESTMENT_BANKING.cover, world: INVESTMENT_BANKING.world }} onSelect={() => {}} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CornerBadge" file="src/components/play/PlayHub.tsx" purpose="The bottom-right circular badge every hero-row card carries: a play glyph on a real simulation, a lock on one still in the works." when="Inside RowCard/HeroShelfCard; purely visual (aria-hidden).">
        <StateGrid min={140}>
          <StateCell label="Play" minH={80}><CornerBadge kind="play" large={false} /></StateCell>
          <StateCell label="Lock" minH={80}><CornerBadge kind="lock" large={false} /></StateCell>
          <StateCell label="Large (featured)" minH={100}><CornerBadge kind="play" large /></StateCell>
          <StateCell label="Faded (deck, behind the front card)" minH={80} note="Real prop faded: the fanned-back deck cards, so no badge peeks past the front card's edge."><CornerBadge kind="play" large={false} faded /></StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
