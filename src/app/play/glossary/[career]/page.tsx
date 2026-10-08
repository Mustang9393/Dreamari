import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { glossaryFor } from "@/components/glossary/data";
import { GlossaryLabExperience } from "@/components/glossary/GlossaryLabExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";
import "@/components/glossary/glossary-lab.css";
// the refined theme layer (Signal's seamless skyline scroll, theme art);
// it was only imported on /play/glossary-lab, so the live game never got it
// (8 Oct 2026)
import "@/components/glossary/glossary-refined.css";
import "@/components/glossary/glossary-fit.css";

export const metadata: Metadata = {
  title: "Glossary Game · Dreamari",
  description: "Learn the words behind a career, one term at a time.",
};

// The lab presentation (themes, flipbook, mastery HUD) IS the glossary game
// now (Chandu, 6 Oct 2026: "push the glossary lab to the main glossary game
// links ... it doesn't need to live in the hamburger anymore"). The older
// GlossaryGameExperience stays in the repo, unrouted.
// One route per career's glossary content. Only careers with a real,
// authored lesson (glossaryFor) resolve — everything else 404s, since the
// Career Detail/Home/Play cards that link here already gate on
// hasGlossary() and show a "Coming soon" state instead of a link for
// anything else. Only lesson 1 plays today; a `?lesson=` param could pick
// among more once a career has them.
export default async function GlossaryGamePage({ params }: { params: Promise<{ career: string }> }) {
  const { career: careerSlug } = await params;
  const career = glossaryFor(careerSlug);
  if (!career) notFound();
  const lesson = career.lessons[0];
  if (!lesson) notFound();
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <GlossaryLabExperience key={lesson.id} career={career} lesson={lesson} />
    </>
  );
}
