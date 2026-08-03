import Image from "next/image";
import { DreamySpeechBubble } from "./DreamySpeechBubble";

type DreamyCornerProps = {
  message: string;
};

// Dreamy himself is the anchor — pinned across the FlowCard's top-right corner (half on
// the background above the card, half overlapping the header banner below it), exactly
// where the corner sticker sat before. The bubble is positioned off of the MASCOT's own
// box (left-full, not part of the same right-anchored flex row), so it spills outward
// into the empty margin beyond the card's right edge instead of being squeezed between
// Dreamy and the card. Requires the wrapper this renders inside to be position: relative
// (not FlowCard's own root — that has overflow-hidden, which would clip this).
//
// lg: only (hidden below that), not the sm: this used at half the mascot's current size:
// the card itself only reaches its wider max-w-4xl tier at lg — below that it's capped at
// max-w-2xl (672px), where a long step title can genuinely run underneath this mascot's
// bounding box at this doubled size (verified: at 900px width/max-w-2xl, title and mascot
// overlapped by ~195px horizontally across the full text line height). Waiting for the
// wider lg card gives this sticker the clearance its new size actually needs.
export function DreamyCorner({ message }: DreamyCornerProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute -top-16 right-6 z-20 hidden lg:block">
      <div className="relative size-48">
        <Image src="/images/dreamy-welcome-mascot.png" alt="" fill sizes="192px" className="object-contain" />
        {/* left-full + ml-3: starts right where Dreamy's own box ends, vertically centered
            on him via DreamySpeechBubble's own left-edge tail — see that component. */}
        <DreamySpeechBubble message={message} className="absolute top-1/2 left-full ml-3 max-w-[240px] -translate-y-1/2 text-xs" />
      </div>
    </div>
  );
}
