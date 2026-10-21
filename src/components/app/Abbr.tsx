/** An abbreviation with its full form (WCAG 3.1.4, audit 21 Oct 2026): GPA,
 *  FAFSA, SAT, ACT and ATS appear hundreds of times and were never spelled
 *  out. Screen readers hear the full form once, right after the short one;
 *  a pointer sees it in the house tooltip on hover (.dm-abbr, globals.css).
 *  No `title` attribute, per the cross-browser guardrails. Use it at the
 *  first, most visible place a term appears on a screen, not every time. */
export function Abbr({ short, long }: { short: string; long: string }) {
  return (
    <abbr className="dm-abbr" data-long={long}>
      {short}
      <span className="sr-only"> ({long})</span>
    </abbr>
  );
}
