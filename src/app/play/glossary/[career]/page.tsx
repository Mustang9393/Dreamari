import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { glossaryFor, lessonFor } from "@/components/glossary/data";
import { GlossaryLabExperience } from "@/components/glossary/GlossaryLabExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";
import "@/components/glossary/glossary-lab.css";
// the refined theme layer (Signal's seamless skyline scroll, theme art);
// it was only imported on /play/glossary-lab, so the live game never got it
// (8 Oct 2026)
import "@/components/glossary/glossary-refined.css";
import "@/components/glossary/glossary-fit.css";
import "@/components/glossary/glossary-worlds.css";
// Signal's readability contract (Roboto sentences, Jersey 20 sizes). It was
// only imported on /play/glossary-lab, so the live game on the Play tab
// rendered Signal without it: 9px match labels, a 14px question (9 Oct 2026,
// Chandu: "I don't see the font fixes and sizing updates"). Same bug as the
// 8 Oct one above, one file further down the list.
import "@/components/glossary/glossary-signal.css";
// DEMO-ONLY: prototype question layouts (?qlayout=), loaded last (12 Oct 2026).
import "@/components/glossary/glossary-qlayout.css";
// Levels 2+ pieces (scene cards, cases, select-all, the value ticker).
import "@/components/glossary/glossary-levels.css";

export const metadata: Metadata = {
  title: "Glossary Game · Dreamari",
  description: "Learn the words behind a career, one term at a time.",
};

// The lab presentation (themes, flipbook, mastery HUD) IS the glossary game
// now (Chandu, 6 Oct 2026: "push the glossary lab to the main glossary game
// links ... it doesn't need to live in the hamburger anymore"). The older
// GlossaryGameExperience engine was deleted on 24 Oct 2026.
// One route per career's glossary content. Only careers with a real,
// authored lesson (glossaryFor) resolve — everything else 404s, since the
// Career Detail/Home/Play cards that link here already gate on
// hasGlossary() and show a "Coming soon" state instead of a link for
// anything else. `?lesson=` picks an authored level by number or id (13 Oct
// 2026: Investment Banking Levels 2 to 4); anything else plays Level 1.
export default async function GlossaryGamePage({ params, searchParams }: { params: Promise<{ career: string }>; searchParams: Promise<{ lesson?: string }> }) {
  const { career: careerSlug } = await params;
  const { lesson: requested } = await searchParams;
  const career = glossaryFor(careerSlug);
  if (!career) notFound();
  const lesson = lessonFor(career, requested);
  if (!lesson) notFound();
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <GlossaryLabExperience key={lesson.id} career={career} lesson={lesson} />
    </>
  );
}
