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
//
// Square (w == h, both var(--match-card-size)) and every size below (fonts, padding,
// gaps) is a calc() fraction of that same variable — no sm:/lg: breakpoint variants
// anywhere in this file. That's deliberate: a fixed set of breakpoint-specific numbers is
// exactly what let width and height drift out of sync before (see --match-card-size's
// own comment in globals.css), and it's what made text sizes jump discretely between
// screens instead of scaling with the card. Everything here scales continuously instead.
export function MatchCard({ card }: MatchCardProps) {
  const [top, bottom] = card.gradient;
  return (
    <div
      className="relative flex w-full flex-col overflow-hidden rounded-[var(--radius-match-card)] border border-white/20 bg-[var(--color-match-card-bg-dark)] shadow-none"
      style={{ height: "var(--match-card-size)", padding: "var(--match-card-padding)", gap: "var(--match-card-gap)" }}
    >
      {/* A fully-opaque background layer (never a transparent stop), positioned as a
          child against the padding box rather than painted as the card's own
          background-image — that's what keeps it from ever bleeding under/behind the
          border itself, which was the cause of a stray colored hairline along the top
          edge previously. */}
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, ${top} 42.79%, ${bottom} 100%)` }} aria-hidden />

      <div className="relative flex flex-1 flex-col" style={{ gap: "var(--match-card-gap)" }}>
        {/* flex-[1.6] / flex-1 below approximates the Figma spec's own graphic-area to
            body-box height ratio (~1.6:1) instead of the body box just shrink-wrapping
            its own content — that's what was making it read as a small label rather
            than a real, generously-sized box. */}
        <div className="flex w-full flex-[1.6] flex-col items-center justify-center rounded-xl" style={{ gap: "var(--match-card-inner-gap)" }}>
          <span className="text-[length:var(--font-size-match-card-emoji)] leading-none">{card.emoji}</span>
          <p className="text-center text-[length:var(--font-size-match-card-title)] leading-[1.1] font-extrabold tracking-[-0.02em] text-white">
            {card.label}
          </p>
        </div>

        {/* Translucent white lets the card's own colored gradient show through softly
            (a "frosted" look) rather than reading as a flat, mismatched box slapped on
            top. flex-1 (not padding) is what makes this read as a real, sizeable box. */}
        <div
          className="flex flex-1 items-center justify-center rounded-[var(--radius-match-card-inner)] border border-white/30 bg-white/[0.13] backdrop-blur-sm"
          style={{ paddingInline: "var(--match-card-padding)", paddingBlock: "var(--match-card-inner-gap)" }}
        >
          <p className="flex-1 text-center text-[length:var(--font-size-match-card-body)] leading-[1.35] font-semibold text-white">{card.body}</p>
        </div>
      </div>
    </div>
  );
}
