import type { Metadata } from "next";
import { CareerDetailLab } from "@/components/actions-lab/CareerDetailLab";
import { resolveCareer } from "@/components/career/data";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// DEMO-ONLY: the Career actions lab's copy of /career/[slug]. Reached from
// the lab's Explore copy and the hamburger's lab links; the real career page
// is untouched.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const career = resolveCareer(slug);
  return { title: `${career ? career.title : "Career"} · Actions lab · Dreamari` };
}

export default async function CareerDetailLabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <CareerDetailLab slug={slug} />
    </>
  );
}
