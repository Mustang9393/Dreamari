import Image from "next/image";
import { DreamySpeechBubble } from "./DreamySpeechBubble";

type DreamyCornerProps = {
  message: string;
};

// A "sticker" pinned across the FlowCard's top-right corner — half sitting on the
// background above the card, half overlapping the header banner below it — rather than
// floating entirely above the card like a tooltip. Deliberately NOT trying to align to
// the header's own box model; it just needs to clear the eyebrow/title text, which are
// left-aligned, so sitting at the right edge leaves it clear at any width the header
// actually wraps to. Requires the wrapper this renders inside to be position: relative
// (not FlowCard's own root — that has overflow-hidden, which would clip this).
//
// items-center (not items-end): the bubble and mascot share one vertical center line, so
// the bubble's tail (also vertically centered, see DreamySpeechBubble) lines up with
// Dreamy's mouth instead of sitting arbitrarily below it.
//
// Desktop/tablet only (sm:flex, hidden below that): a floating absolute-position mascot
// is exactly the pattern that caused real text-overlap bugs on mobile earlier in this
// project (small viewport, large card-relative-percentage offsets) before Dreamy was
// pulled from the flow entirely — safer to keep this one deliberately off narrow
// viewports than to re-litigate that same class of bug.
export function DreamyCorner({ message }: DreamyCornerProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-10 right-4 z-20 hidden items-center gap-2 sm:flex sm:-top-12 sm:right-6"
    >
      <DreamySpeechBubble message={message} className="max-w-[170px] text-xs" />
      <div className="relative size-20 shrink-0 sm:size-24">
        <Image src="/images/dreamy-welcome-mascot.png" alt="" fill sizes="96px" className="object-contain" />
      </div>
    </div>
  );
}
