"use client";

// DEMO-ONLY: Component Lab, Game UI part. Play hub's row/hero cards. Only
// `export` was added to RowCard, HeroShelfCard and CornerBadge in
// PlayHub.tsx -- no behavior, markup or styles changed. The thumbnail and
// UX Designer specimens (19 Oct 2026) use only public exports.

import { AVIATION_MAINTENANCE, INVESTMENT_BANKING, REGISTERED_NURSE, SOON, UX_DESIGNER, simThumb } from "@/components/play/games";
import { CornerBadge, HeroShelfCard, RowCard } from "@/components/play/PlayHub";
import type { Simulation } from "@/components/play/types";
import { EDGE, LiveRoute, Specimen, StateCell, StateGrid } from "../../kit";

const SOFTWARE_ENGINEER = SOON.find((c) => c.careerId === "software-engineer")!;

// The three simulations with 19 Oct character thumbnails (games.ts thumb).
const THUMB_SIMS = [INVESTMENT_BANKING, REGISTERED_NURSE, AVIATION_MAINTENANCE];

// The tile shapes the app crops a thumb to. RowCard's `deck` mode fills its
// parent, so each box sets the shape and the real card fills it.
const THUMB_SHAPES: { label: string; aspect: string; width: number; large?: boolean; active?: boolean; note: string }[] = [
  { label: "Phone deck (about 5:6)", aspect: "319 / 386", width: 170, large: true, note: "The Play hub's phone stack slot (CardDeck aspect 319 by 386)." },
  { label: "Desktop side card (5:7)", aspect: "210 / 297", width: 150, active: true, note: "A focused row's side card, Browse poster proportions." },
  { label: "Hero (16:9)", aspect: "16 / 9", width: 300, large: true, note: "The focused row's featured billboard card." },
  { label: "Home Continue rail (2:1)", aspect: "2 / 1", width: 260, note: "Home's ActivityCard is not exported; this is RowCard at the same 2:1 shape, same simThumb src and focus." },
];

function ThumbRow({ shape }: { shape: (typeof THUMB_SHAPES)[number] }) {
  return (
    <div className="flex flex-wrap gap-[var(--space-3)]">
      {THUMB_SIMS.map((sim: Simulation) => (
        <div key={sim.id} className="flex-none" style={{ width: shape.width, aspectRatio: shape.aspect }}>
          <RowCard candidate={{ kind: "sim", id: sim.id, sim }} deck large={shape.large} active={shape.active} onSelect={() => {}} />
        </div>
      ))}
    </div>
  );
}

export function PlayHubCardsGroup() {
  return (
    <>
      <Specimen
        name="RowCard" scale="core"
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
        name="HeroShelfCard" scale="core"
        file="src/components/play/PlayHub.tsx"
        purpose="The generalized version of RowCard used by the phone-stack shelves (Glossary Games, In the works), any career-ish item, not just a Simulation."
        when="The Play hub's deck/shelf rows on narrow viewports."
      >
        <StateGrid min={220}>
          <StateCell label="Compact (rest of the shelf)" note={'Sharp at rest (19 Oct): every tier now asks for the hero width (COVER_SIZES), after Chandu: "the thumbnails appear low quality until the card is clicked".'}><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: simThumb(INVESTMENT_BANKING).src, world: INVESTMENT_BANKING.world, sub: "Day in the Life" }} onSelect={() => {}} /></StateCell>
          <StateCell label="Side (active, focused)" note="Real prop active: the mid-size tier for the deck's side cards."><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: simThumb(INVESTMENT_BANKING).src, world: INVESTMENT_BANKING.world, sub: "Day in the Life" }} active onSelect={() => {}} /></StateCell>
          <StateCell label="Hero (large, front of deck)" note="Real prop large: the phone-stack's front card size." minH={200}><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: simThumb(INVESTMENT_BANKING).src, world: INVESTMENT_BANKING.world, sub: "Day in the Life" }} large onSelect={() => {}} /></StateCell>
          <StateCell label="Locked (Coming soon)"><HeroShelfCard item={{ id: SOFTWARE_ENGINEER.careerId, title: SOFTWARE_ENGINEER.title, cover: SOFTWARE_ENGINEER.cover, world: SOFTWARE_ENGINEER.world, locked: true }} onSelect={() => {}} /></StateCell>
          <StateCell label="Long title" note="Uses EDGE.longTitle."><HeroShelfCard item={{ id: "long", title: EDGE.longTitle, cover: simThumb(INVESTMENT_BANKING).src, world: INVESTMENT_BANKING.world }} onSelect={() => {}} /></StateCell>
          <StateCell label="Image failure"><HeroShelfCard item={{ id: "broken", title: INVESTMENT_BANKING.title, cover: EDGE.brokenImage, world: INVESTMENT_BANKING.world }} onSelect={() => {}} /></StateCell>
          <StateCell label="Hover / focus" note="Hover or Tab to it to see the state."><HeroShelfCard item={{ id: "investment-banking", title: INVESTMENT_BANKING.title, cover: simThumb(INVESTMENT_BANKING).src, world: INVESTMENT_BANKING.world }} onSelect={() => {}} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen
        name="Simulation thumbnails" scale="core"
        file="src/components/play/games.ts"
        purpose="Simulation.thumb and thumbFocus, read through simThumb(): a v2 scene with the lead character in it, kept apart from cover so the in-game backdrop stays put. IB: Christina welcoming you in the Cobalt lobby. RN: Rosa at the station. AMT: the landing-gear inspection pair."
        when={'Every tile that shows a simulation: Play hub, PlayStage, Home, Feed, counselor Most played. Chandu asked that "the compositions work in both 4:5 and 16:9 or whatever proportions the tiles scale to".'}
      >
        <StateGrid min={560}>
          {THUMB_SHAPES.map((shape) => (
            <StateCell key={shape.label} label={shape.label} note={`${shape.note} Focus points were checked from 5:7 to 3.7:1.`}>
              <ThumbRow shape={shape} />
            </StateCell>
          ))}
        </StateGrid>
      </Specimen>

      <Specimen
        name="UX Designer simulation (local draft)" scale="core"
        file="src/components/play/games.ts"
        purpose="UX_DESIGNER, the AI-authored Level 1 that tests the career scaling SOP: complete scene images with the people painted in (spriteStandard full-scene), on the existing interaction engine."
        when="Reached from the hamburger Quick Links only; the Play hub filters it out (HUB_SIMULATIONS) until a hub release. Proof that a new career can ship from the SOP alone (commit 0b69b76d)."
      >
        <StateGrid min={240}>
          <StateCell label="Level 1, live" minH={300} note="Full-scene art: on phones the scene sits in a shorter frame so a two-person conversation stays together."><LiveRoute href={`/play/${UX_DESIGNER.id}`} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="CornerBadge" scale="core" file="src/components/play/PlayHub.tsx" purpose="The bottom-right circular badge every hero-row card carries: a play glyph on a real simulation, a lock on one still in the works." when="Inside RowCard/HeroShelfCard; purely visual (aria-hidden).">
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
