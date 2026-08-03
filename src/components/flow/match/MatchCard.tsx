import type { MatchCardContent } from "./types";

type MatchCardProps = {
  card: MatchCardContent;
};

// Matches the updated Figma "Match Card" component for dark mode (node 616:xxxxx per
// type): tags row at the top, then a centered graphic area (emoji + title stacked),
// then the description in its own translucent box, on a fully-opaque
// near-black-to-saturated-hue gradient. A straight 2-stop fade, not Figma's own 3-stop
// version — its darkened-tint middle stop reads as a muddy smear rather than a clean
// glow, so it's dropped; the "solid cap up top, color revealed near the bottom" rhythm
// still comes through from the stop position alone. Figma only specs a dark version, so
// light mode is our own adaptation of the same shape, substituting white for near-black
// at the top and softening the bottom stop toward white via color-mix (same technique
// already used for the Build flow's own accent gradients) rather than inventing new
// colors.
export function MatchCard({ card }: MatchCardProps) {
  const [top, bottom] = card.gradient;
  return (
    <div className="relative flex w-full flex-col gap-5 overflow-hidden rounded-[var(--radius-match-card)] border border-slate-200 bg-white p-6 shadow-sm sm:h-[var(--match-card-height)] dark:border-white/20 dark:bg-[var(--color-match-card-bg-dark)] dark:shadow-none">
      {/* Two fully-opaque background layers (never a transparent stop) toggled by
          theme, each positioned as a child against the padding box rather than
          painted as the card's own background-image — that combination is what
          keeps either one from ever bleeding under/behind the border itself, which
          was the cause of a stray colored hairline along the top edge previously. */}
      <div className="absolute inset-0 hidden dark:block" style={{ backgroundImage: `linear-gradient(180deg, ${top} 42.79%, ${bottom} 100%)` }} aria-hidden />
      <div
        className="absolute inset-0 dark:hidden"
        style={{ backgroundImage: `linear-gradient(180deg, white 42.79%, color-mix(in srgb, ${bottom} 45%, white) 100%)` }}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col gap-3">
        {/* flex-[1.6] / flex-1 below approximates the Figma spec's own graphic-area to
            body-box height ratio (~1.6:1) instead of the body box just shrink-wrapping
            its own content — that's what was making it read as a small label rather
            than a real, generously-sized box. */}
        <div className="flex w-full flex-[1.6] flex-col items-center justify-center gap-2 rounded-xl">
          <span className="text-[length:var(--font-size-match-card-emoji)] leading-none">{card.emoji}</span>
          <p className="text-center text-[length:var(--font-size-match-card-title)] leading-[34px] font-extrabold tracking-[-0.5px] text-slate-900 sm:text-[length:var(--font-size-match-card-title-lg)] sm:leading-[44px] sm:tracking-[-1px] dark:text-white">
            {card.label}
          </p>
        </div>

        {/* A flat opaque gray box here read as a mismatched, slapped-on rectangle
            against the card's own colored gradient underneath it — translucent white
            instead lets that tint show through softly, the same "frosted" idea as the
            dark-mode version's translucent white-on-navy. flex-1 (not padding) is what
            makes this read as a real, sizeable box — py trimmed down from an earlier,
            more generous pass so a shorter --match-card-height still has comfortable
            room for the CTAs below without scrolling. */}
        <div className="flex flex-1 items-center justify-center rounded-[var(--radius-match-card-inner)] border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-sm sm:py-4 dark:border-white/30 dark:bg-white/[0.13]">
          <p className="flex-1 text-center text-[length:var(--font-size-match-card-body)] leading-[1.5] font-semibold text-slate-800 dark:text-white">{card.body}</p>
        </div>
      </div>
    </div>
  );
}
