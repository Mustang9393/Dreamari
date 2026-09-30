import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { glossaryFor } from "@/components/glossary/data";
import { GlossaryLabExperience } from "@/components/glossary/GlossaryLabExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";
import "@/components/glossary/glossary-lab.css";

export const metadata: Metadata = {
  title: "Glossary Lab · Dreamari",
  description: "A local design prototype for Dreamari glossary games.",
};

export default async function GlossaryLabPage({
  params,
  searchParams,
}: {
  params: Promise<{ career: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { career: careerSlug } = await params;
  const { lesson: lessonId } = await searchParams;
  const career = glossaryFor(careerSlug);
  if (!career) notFound();
  const lesson = career.lessons.find((entry) => entry.id === lessonId || String(entry.lessonNumber) === lessonId) ?? career.lessons[0];
  if (!lesson) notFound();

  return <GlossaryLabExperience career={career} lesson={lesson} />;
}
