"use client";

import { GlossaryLabGameExperience } from "./GlossaryLabGameExperience";
import type { GlossaryCareer, GlossaryLesson } from "./data";

/**
 * The lab is a separate presentation of the production glossary content.
 * It preserves authored copy, ordering, remediation and progress while
 * leaving the live game's interface unchanged.
 */
export function GlossaryLabExperience({ career, lesson }: { career: GlossaryCareer; lesson: GlossaryLesson }) {
  return <GlossaryLabGameExperience career={career} lesson={lesson} />;
}
