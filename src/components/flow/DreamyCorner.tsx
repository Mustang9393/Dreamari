import Image from "next/image";

type DreamyCornerProps = {
  message: string;
};

// Floats Dreamy + a small speech bubble above the FlowCard's own top-right corner, like
// he's peeking over it from outside — requires the FlowCard this renders inside to have
// position: relative (it does) so the absolute positioning below resolves against the
// card itself, not the page. Anchored well above the header's own top edge (-top-16/20)
// specifically so it can never overlap the eyebrow/title text, which starts flush at the
// card's actual top edge — there's no viewport width at which this dips into it.
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
      className="pointer-events-none absolute -top-20 right-6 z-20 hidden items-end gap-2 sm:flex"
    >
      <div className="max-w-[160px] rounded-2xl rounded-br-sm bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 shadow-md dark:bg-slate-800 dark:text-slate-200">
        {message}
      </div>
      <div className="relative size-16 shrink-0">
        <Image src="/images/dreamy-welcome-mascot.png" alt="" fill sizes="64px" className="object-contain" />
      </div>
    </div>
  );
}
