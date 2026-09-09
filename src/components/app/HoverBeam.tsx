"use client";

import { useState, type ReactNode } from "react";
import { BorderBeam } from "border-beam";

/**
 * Site-wide card hover treatment (direct feedback, 9 Sept 2026): the same
 * BorderBeam ring used on "Do This Next", but only while the card is
 * hovered or keyboard-focused -- one shared component so every card uses
 * the exact same duration (matches "Do This Next"'s 3.5s) rather than each
 * call site picking its own speed. Prominence (strength) is a prop, tuned
 * per surface -- a landing hero CTA and a quiet internal card shouldn't
 * read the same. `active` overrides the hover/focus state for callers that
 * already track their own "is this thing open/active" state (e.g. a
 * composer that's only ever rendered while active).
 */
export function HoverBeam({
  children,
  strength = 0.8,
  duration = 3.5,
  active,
  className,
}: {
  children: ReactNode;
  strength?: number;
  duration?: number;
  /** Force the beam on/off regardless of hover/focus, e.g. for a composer
   *  that's only ever mounted while it's the active one. */
  active?: boolean;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isActive = active ?? hovered;
  return (
    // h-full at every layer (this div, BorderBeam's own container) so a
    // grid item wrapped in HoverBeam still stretches to match its row --
    // without it, BorderBeam's extra wrapper divs broke CSS Grid's default
    // equal-height stretch and every bento card sized to its own content
    // instead (direct feedback, 9 Sept 2026).
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`h-full ${className ?? ""}`}
    >
      <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={duration} strength={strength} active={isActive} className="h-full">
        {children}
      </BorderBeam>
    </div>
  );
}
