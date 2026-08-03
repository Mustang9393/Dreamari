import type { MatchCardContent } from "./types";

type MatchCardProps = {
  card: MatchCardContent;
};

// Matches the Figma "Match Card" component (node 740:37755): tags row at the top, then a
// centered graphic area (emoji + title stacked), then the description in its own
// translucent box, on a fully-opaque near-black-to-saturated-hue gradient. Figma only
// specs ONE treatment for this card — dark — regardless of the surrounding page's own
// light/dark mode, per direct feedback ("keep the cards in dark mode itself for the
// match experience"). So unlike every other component in this app, this one has no
// dark: conditional branching at all — it's the one deliberate exception. A straight
// 2-stop gradient fade, not Figma's own 3-stop version — its darkened-tint middle stop
// reads as a muddy smear rather than a clean glow, so it's dropped; the "solid cap up
// top, color revealed near the bottom" rhythm still comes through from the stop
// position alone.
export function MatchCard({ card }: MatchCardProps) {
  const [top, bottom] = card.gradient;
  return (
    <div className="relative flex w-full flex-col gap-5 overflow-hidden rounded-[var(--radius-match-card)] border border-white/20 bg-[var(--color-match-card-bg-dark)] p-6 shadow-none sm:h-[var(--match-card-height)]">
      {/* A fully-opaque background layer (never a transparent stop), positioned as a
          child against the padding box rather than painted as the card's own
          background-image — that's what keeps it from ever bleeding under/behind the
          border itself, which was the cause of a stray colored hairline along the top
          edge previously. */}
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, ${top} 42.79%, ${bottom} 100%)` }} aria-hidden />

      <div className="relative flex flex-1 flex-col gap-3">
        {/* flex-[1.6] / flex-1 below approximates the Figma spec's own graphic-area to
            body-box height ratio (~1.6:1) instead of the body box just shrink-wrapping
            its own content — that's what was making it read as a small label rather
            than a real, generously-sized box. */}
        <div className="flex w-full flex-[1.6] flex-col items-center justify-center gap-2 rounded-xl">
          <span className="text-[length:var(--font-size-match-card-emoji)] leading-none">{card.emoji}</span>
          <p className="text-center text-[length:var(--font-size-match-card-title)] leading-[34px] font-extrabold tracking-[-0.5px] text-white sm:text-[length:var(--font-size-match-card-title-lg)] sm:leading-[44px] sm:tracking-[-1px]">
            {card.label}
          </p>
        </div>

        {/* Translucent white lets the card's own colored gradient show through softly
            (a "frosted" look) rather than reading as a flat, mismatched box slapped on
            top. flex-1 (not padding) is what makes this read as a real, sizeable box —
            py trimmed down from an earlier, more generous pass so a shorter
            --match-card-height still has comfortable room for the CTAs below without
            scrolling. */}
        <div className="flex flex-1 items-center justify-center rounded-[var(--radius-match-card-inner)] border border-white/30 bg-white/[0.13] px-4 py-3 backdrop-blur-sm sm:py-4">
          <p className="flex-1 text-center text-[length:var(--font-size-match-card-body)] leading-[1.5] font-semibold text-white">{card.body}</p>
        </div>
      </div>
    </div>
  );
}
