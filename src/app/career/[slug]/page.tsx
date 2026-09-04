import type { Metadata } from "next";
import { CareerDetailExperience } from "@/components/career/CareerDetailExperience";
import { resolveCareer } from "@/components/career/data";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// One route per career, reached from Explore's Browse poster cards, the Top
// 5 Trending rail, the For You reel's "More Info", and Similar Careers on
// this same page. Careers with no matching catalog/reel/report entry render
// the page's own "we don't have that career yet" state rather than 404ing —
// most of the app's 39-title catalog will hit that state until more careers
// get full report content (handoff: only 7 have Career Ladder + Common
// Softwares authored today).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const career = resolveCareer(slug);
  return {
    title: career ? `${career.title} — Dreamari` : "Career — Dreamari",
    description: career?.description || "Explore what this career actually looks like.",
  };
}

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <CareerDetailExperience slug={slug} />
    </>
  );
}
