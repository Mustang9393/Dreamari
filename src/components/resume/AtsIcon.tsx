import type { SVGProps } from "react";

/** The ATS Check mark: the scanner's four focus corners with "ATS" set in
 *  the middle instead of a magnifying glass, so the chip and the toolbar
 *  button read as the ATS check itself and never blend with the XP
 *  sparkle or the generic search glyph (direct feedback, 17 Sept 2026:
 *  "spell ATS and have a bespoke icon arrangement like the 4 focus bars").
 *  Same 24-unit grid and 2px stroke as the lucide set it sits beside. */
export function AtsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M2.5 7.5V5a2.5 2.5 0 0 1 2.5-2.5h2.5" />
      <path d="M16.5 2.5H19A2.5 2.5 0 0 1 21.5 5v2.5" />
      <path d="M21.5 16.5V19a2.5 2.5 0 0 1-2.5 2.5h-2.5" />
      <path d="M7.5 21.5H5A2.5 2.5 0 0 1 2.5 19v-2.5" />
      <text x="12" y="15.4" textAnchor="middle" fontSize="9" fontWeight={900} letterSpacing="-0.4" fill="currentColor" stroke="none" fontFamily="var(--font-display), system-ui, sans-serif">
        ATS
      </text>
    </svg>
  );
}
