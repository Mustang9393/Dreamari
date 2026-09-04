import type { Metadata } from "next";
import { CollegeDetailExperience } from "@/components/colleges/CollegeDetailExperience";
import { collegeBySlug } from "@/components/colleges/data";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = collegeBySlug(slug);
  return { title: c ? `${c.name} — Dreamari` : "College — Dreamari", description: c ? `${c.name}, ${c.city}, ${c.stateName}. What students really pay, who gets in, who finishes.` : "College lookup." };
}

export default async function CollegePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <CollegeDetailExperience slug={slug} />
    </>
  );
}
