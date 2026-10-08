"use client";

// The school's actions, one component for the school page header AND the
// school sheet (8 Oct 2026, Chandu: "the CTAs on the pop up modals for
// schools and career details are wrong. These are to reflect the full
// career pages not be different"). Moved whole from CollegeDetailExperience:
// Save first (it stays in the app; a hover or focus on a saved school shows
// Remove), then the three that open the school's own site as plain text
// buttons with a small arrow (8 Oct 2026, Chandu: "schools can just have
// normal buttons except for save"). Two per row on phones. None is promoted over the others (21 Sept 2026). `ink` only
// changes colour, for a sheet that follows the light and dark themes.

import type { CSSProperties } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { StripButton, StripLink } from "@/components/app/ActionStrip";
import type { College } from "./data";
import { EXTRA } from "./extra";
import { useSaved } from "./shared";

export function SchoolActions({ c, ink, className = "", spread = true }: { c: College; ink?: string; className?: string; /** shared detail-page/sheet arrangement: buttons share the row evenly */ spread?: boolean }) {
  const [saved, toggleSaved] = useSaved();
  const x = EXTRA[c.slug];
  // Financial Aid falls back to the net price calculator when a school has
  // no dedicated aid page but does have one of those (Princeton, for
  // instance), still genuinely aid-relevant, not a mislabeled dead end.
  const applyHref = x?.links.apply ?? null;
  const aidHref = x?.links.aid ?? x?.links.calc ?? null;
  const on = saved.has(c.slug);
  return (
    <div role="group" aria-label="Save or look further" className={`grid grid-cols-2 gap-[8px] ${spread ? "cpk-school-actions w-full sm:grid-cols-4" : "sm:flex sm:flex-wrap"} ${className}`} style={{ textShadow: "none", "--cpk-world": "var(--accent-subtle)" } as CSSProperties}>
      <StripButton
        on={on}
        onClick={() => toggleSaved(c.slug)}
        ariaLabel={on ? "Saved. Tap to remove from Saved" : "Save this college"}
        icon={on ? <BookmarkCheck className="h-[20px] w-[20px]" fill="currentColor" fillOpacity={0.35} aria-hidden /> : <Bookmark className="h-[20px] w-[20px]" aria-hidden />}
        label={on ? "Saved" : "Save"}
        offLabel="Remove"
        ink={ink}
        boxed={!spread}
        toolbar={spread}
      />
      {aidHref && <StripLink external href={aidHref} label="Financial aid" ink={ink} boxed />}
      {applyHref && <StripLink external href={applyHref} label="Apply" ink={ink} boxed />}
      {c.website && <StripLink external href={c.website} label="Website" ink={ink} boxed />}
    </div>
  );
}
