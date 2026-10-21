"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// One switch for every framer-motion animation in the app (WCAG 2.3.3 /
// 2.2.2, audit 21 Oct 2026): 21 of 66 motion files never checked the
// "reduce motion" setting. reducedMotion="user" makes framer skip transform
// and layout animation for anyone who set it; opacity still fades, so
// nothing pops in harshly. The CSS side is the reduced-motion block at the
// end of globals.css.
export function MotionPrefs({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
