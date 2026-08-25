import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { glossaryFor } from "@/components/glossary/data";
import { GlossaryGameExperience } from "@/components/glossary/GlossaryGameExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Glossary Game — Dreamari",
  description: "Learn the words behind a career, one term at a time.",
};

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
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <GlossaryGameExperience key={lesson.id} career={career} lesson={lesson} />
    </>
  );
}
