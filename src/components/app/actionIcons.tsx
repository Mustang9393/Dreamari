// Bespoke action icons, drawn in the Lucide style (24x24 grid, 2px round
// strokes, no fill, currentColor) so they sit beside Lucide's set without
// looking borrowed (8 Oct 2026). Usman's read of the career actions: the
// numbered box "doesn't read like Top 3" and the people glyph on Connect
// "didn't look like an action button". Chandu: "Add to Top 3 should have a
// plus with a better icon, maybe a bespoke icon in the Lucide style. Same
// thing with Connect."

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

/** Top 3 as a podium (2nd, 1st, 3rd), with a plus above the winner's step:
 *  "add to my top three". `on` swaps the plus for a check. */
export function Top3Podium({ on = false, ...props }: IconProps & { on?: boolean }) {
  return (
    <Svg {...props}>
      {/* the podium: 1st in the middle, tallest */}
      <path d="M9 21v-8h6v8" />
      <path d="M3 21v-5h6" />
      <path d="M15 16h6v5" />
      <path d="M2 21h20" />
      {on ? <path d="m9.5 6 2 2 3.5-4" /> : <><path d="M12 3v6" /><path d="M9 6h6" /></>}
    </Svg>
  );
}

/** Ask a professional: a person with a speech bubble at their shoulder, so
 *  it reads as "talk to someone", not just "people". */
export function AskPro(props: IconProps) {
  return (
    <Svg {...props}>
      {/* the person */}
      <circle cx="7.5" cy="10.5" r="3" />
      <path d="M2 21a5.5 5.5 0 0 1 11 0" />
      {/* the speech bubble, its tail toward the person */}
      <path d="M14 2.5h6.5A1.5 1.5 0 0 1 22 4v4a1.5 1.5 0 0 1-1.5 1.5H18l-3 2.5v-2.5h-1A1.5 1.5 0 0 1 12.5 8V4A1.5 1.5 0 0 1 14 2.5Z" />
      <path d="M15.75 6h.01" />
      <path d="M18.75 6h.01" />
    </Svg>
  );
}
