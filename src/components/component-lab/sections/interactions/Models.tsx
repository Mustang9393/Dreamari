"use client";

// DEMO-ONLY: Interactions section, "Interaction models". The physical
// gestures and keyboard rules the app leans on, once per model -- not
// repeating what's already live elsewhere in the lab (PosterCard's own
// hover cue is in Surfaces; HoverBeam, ConfirmShimmer, PlayBurst, Confetti
// and every dm-* nudge already have Replay demos in Foundations; Listbox's
// arrow-key behaviour is in Controls; DetailModal's full state grid is in
// Overlays). Each Specimen below is either genuinely new ground (the reel's
// scroll-snap, the rank-drag interaction, the parked Cmd+K search) or a
// live component shown here specifically for the keyboard/gesture rule,
// with a pointer to where its full state grid already lives.

import { useState, type CSSProperties } from "react";
import { SubHead, Specimen, StateGrid, StateCell, Reveal, LiveRoute, NotRendered, MONO, noop } from "../../kit";
import { SearchTrigger } from "@/components/app/GlobalSearch";
import { DetailModal } from "@/components/flow-lab/shared";
import { labCatalog } from "@/components/flow-lab/lab";
import { RankBody, type Resolve } from "@/components/play/interactions";
import type { RankBeat } from "@/components/play/types";

const MUTED: CSSProperties = { color: "var(--muted-foreground)" };
const LAB_CATALOG = labCatalog();

const RANK_BEAT: RankBeat = {
  id: "lab-rank-demo",
  kind: "rank",
  question: "Order these patients by priority.",
  order: ["Chest pain, new onset", "Post-op, stable", "Scheduled med pass", "Requesting water"],
  whenRight: "Exactly right — the sickest patient first.",
  whenClose: "Close: three of four in the right place.",
  whenWrong: "Not quite the priority order.",
  feedback: "That's how a real handoff gets triaged.",
  feedbackCta: "Continue",
  skills: ["Prioritization"],
};

function RankDragDemo() {
  const [result, setResult] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const onResolve: Resolve = (tier, why) => setResult(`${tier}: ${why}`);
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-[var(--space-3)]">
      <RankBody key={nonce} beat={RANK_BEAT} onResolve={onResolve} />
      {result && (
        <p className="text-center text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>
          {result}
        </p>
      )}
      <button
        type="button"
        onClick={() => { setResult(null); setNonce((n) => n + 1); }}
        className="dm-quiet cursor-pointer self-center rounded-full border px-[10px] py-[3px] text-[10.5px] font-bold"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
      >
        Reset
      </button>
    </div>
  );
}

function KeyboardModalDemo() {
  const cards = LAB_CATALOG.slice(0, 3);
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setIndex(0); }}
        className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[12px] font-bold"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
      >
        Reopen
      </button>
    );
  }
  return (
    <DetailModal
      career={cards[index]}
      control="save"
      selected={false}
      full={false}
      onToggle={noop}
      onClose={() => setOpen(false)}
      onPrev={index > 0 ? () => setIndex((i) => i - 1) : undefined}
      onNext={index < cards.length - 1 ? () => setIndex((i) => i + 1) : undefined}
    />
  );
}

export function ModelsGroup() {
  return (
    <>
      <SubHead>Interaction models</SubHead>

      <Specimen name="Match cards: tap to open, tap to save" file="src/components/match-lab/MiniExploreMatch.tsx, shared.tsx" purpose="Mini Explore's card: tap opens the detail sheet, the Save pill on the card (or the sheet's own button) adds it to the tray." when="Match today (Joshua's Mini Explore, locked 27 Sept 2026).">
        <StateGrid min={280}>
          <StateCell label="Live: /match-grid" pad={false} minH={440}>
            <LiveRoute href="/match-grid" device="mobile" height={440} />
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED}>
          Rule: every Match card is a tap target, not a swipe gesture — tap-only tested better for the &quot;low-effort
          student saves one career and leaves&quot; goal (match.md, 27 Sept 2026). The original swipe deck
          (<code style={MONO}>MatchLab.tsx</code>) and the six-card select grid (<code style={MONO}>MatchGrid.tsx</code>)
          both still work at their own dormant routes, kept for comparison, not for a new build to copy — see Feature
          modules → Match.
        </p>
      </Specimen>

      <Specimen name="For You reel: vertical snap" file="src/components/app/ExploreExperience.tsx, app.css" purpose="A TikTok-style full-bleed vertical feed: one card per snap point, a slow Ken Burns push on the active photo, scroll-linked parallax." when="Explore's For You tab, phone and tablet full-bleed; a fixed-size card on desktop.">
        <StateGrid min={280}>
          <StateCell label="Live: /explore (For You)" pad={false} minH={480}>
            <LiveRoute href="/explore" device="mobile" height={480} />
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED}>
          <code style={MONO}>.foryou-snap</code> sets <code style={MONO}>scroll-snap-type: y mandatory</code> with a
          hidden scrollbar; every card is <code style={MONO}>snap-start snap-always</code>. ArrowDown/ArrowUp step by
          exactly one <code style={MONO}>clientHeight</code> (<code style={MONO}>scrollBy(&#123; behavior: &quot;smooth&quot; &#125;)</code>),
          a real keyboard alternative to a thumb flick. Rule: a feed that snaps should never leave a card resting
          half-visible — the snap point is the only rest state.
        </p>
      </Specimen>

      <Specimen name="Poster rails: horizontal scroll" file="src/components/app/app.css (.dm-scroll, .poster-row)" purpose="Every horizontally-scrolling row of posters (Explore's world rows, Home rails, the career detail rail, the report chooser) shares one scrollbar treatment and one vertical-padding fix." when="Any poster/college rail.">
        <StateGrid min={280}>
          <StateCell label="Live: /explore (Browse All)" pad={false} minH={440}>
            <LiveRoute href="/explore?tab=browse" device="desktop" height={440} />
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED}>
          <code style={MONO}>dm-scroll</code> gives every rail a thin, quiet thumb (unlike the reel above, a rail has
          no snap points to signal &quot;there&apos;s more&quot;, so the scrollbar itself has to).{" "}
          <code style={MONO}>.poster-row</code> adds vertical padding so a card&apos;s own hover growth (lift 10px,
          scale 1.09, see PosterCard in Surfaces) never clips against the scroller&apos;s edge. The hover
          lift/zoom/center-cue treatment itself, and the card-wide HoverBeam ring used elsewhere, already have live
          Replay demos in Surfaces → PosterCard and Foundations → HoverBeam — not repeated here.
        </p>
      </Specimen>

      <Specimen name="Drag: Rank the Order / Drag to Answer" file="src/components/play/interactions.tsx" purpose="Play's two real drag mechanics: reorder a list by dragging a row (RankBody), or drag a token onto the answer it belongs to (ChoiceBody's dragEnabled path). Both always keep a tap/keyboard fallback so a missed gesture never strands anyone." when="Scored beats in a simulation that ask for an order or a match, e.g. Nursing's patient-priority handoff (RN1-15).">
        <StateGrid min={300}>
          <StateCell label="Rank the Order (live)" note="Press and drag a row by its grip handle, or use the ↑/↓ buttons — the same first-use hint (GestureSpotlight) the real game shows appears once per browser." minH={280}>
            <Reveal label="Try the drag" height={340}>
              <RankDragDemo />
            </Reveal>
          </StateCell>
          <StateCell label="Drag to Answer (token onto a card)" minH={140}>
            <NotRendered reason="Lives inside ChoiceBody's dragEnabled path with the rest of a scored beat's state (locked answers, reputation deltas) — not exported standalone. Try the real thing in the simulation itself." see="/play/investment-banking (or /play/registered-nurse for the rank beat above, RN1-15)" />
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED}>
          Rule: a drag interaction in Play is never the only way to answer — Rank the Order also has per-row
          Move up/down buttons (screen-reader and keyboard route), and the drag-to-answer token is &quot;also a plain
          tap target, so a missed drag never strands anyone&quot; (the file&apos;s own comment).
        </p>
      </Specimen>

      <Specimen name="Keyboard: Escape and ←/→ close and step through overlays" file="src/components/flow-lab/shared.tsx (DetailModal), src/components/app/ExploreExperience.tsx (FactPopover, DegreeSheet), src/components/career/ConnectWithProfessionalsModal.tsx" purpose="Every overlay in the app closes on Escape; the ones that page through a set of cards (DetailModal) also answer ArrowLeft/ArrowRight." when="Any modal, sheet or popover.">
        <StateGrid min={320}>
          <StateCell label="DetailModal (live)" note="Try Escape, or ←/→ to page to the next/previous career. Full state grid (selected, full, long content) already lives in Overlays → DetailModal." minH={480}>
            <Reveal label="Open (Escape / ←→ to try)" height={480}>
              <KeyboardModalDemo />
            </Reveal>
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED}>
          Rule: Escape always closes the topmost overlay and returns focus to whatever opened it; arrow-key paging is
          added only where there&apos;s a natural &quot;next&quot; (a set of cards, Listbox&apos;s own option list —
          see Controls → Listbox for its full Up/Down/Home/End behaviour).
        </p>
      </Specimen>

      <Specimen name="Keyboard: Cmd/Ctrl+K search" file="src/components/app/GlobalSearch.tsx" purpose="Sitewide search: careers, colleges, people, companies and communities in one grouped result list, or a set of doors when nothing's typed yet." when="Not reachable from the app's chrome today — the file's own comment marks it PARKED (3 Sept 2026, 'heavy, busy, misaligned') after a review. The grouped-results model and code are real and working; this is the only place to try it live.">
        <StateGrid min={280}>
          <StateCell label="Live (parked)" note="Press Cmd/Ctrl+K, or click the icon. Typing searches real catalog/college/pro data; a result is a real Next.js Link and will navigate this tab away from the lab if clicked." minH={100}>
            <SearchTrigger />
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED}>
          Rule, if it ships: Cmd/Ctrl+K opens from anywhere, Escape closes it, and it never competes with a
          page&apos;s own search field for the shortcut.
        </p>
      </Specimen>
    </>
  );
}
