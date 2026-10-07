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

/** Lucide's ranked-list silhouette with a circular add/remove badge.
 *  The last rule stops before the badge so the strokes never overlap. */
export function Top3RankAction({ on = false, ...props }: IconProps & { on?: boolean }) {
  return (
    <Svg {...props}>
      <path d="M11 5h10M11 12h10M11 19h1" />
      <path d="M4 4h1v5M4 9h2" />
      <path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />
      <circle cx="18.5" cy="18.5" r="4.5" />
      <path d="M16.5 18.5h4" />
      {!on && <path d="M18.5 16.5v4" />}
    </Svg>
  );
}

/** Start a conversation. The open lower corner gives the circular action
 *  badge its own space, matching Top3RankAction without a filled overlay. */
export function AskProAction(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19H7l-4 3V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M7 8h10M7 12h6" />
      <circle cx="18.5" cy="18.5" r="4.5" />
      <path d="M16.5 18.5h4M18.5 16.5v4" />
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
