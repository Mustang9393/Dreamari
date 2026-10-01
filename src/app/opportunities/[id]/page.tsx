import type { Metadata } from "next";
import { OpportunityDetailExperience } from "@/components/opportunities/OpportunityDetailExperience";
import { findOpportunity } from "@/components/opportunities/data";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = findOpportunity(id);
  return { title: item ? `${item.name} · Dreamari` : "Opportunity · Dreamari", description: item ? item.eligibility : "Scholarships and programs that fit you." };
}

// One opportunity's own page (1 Oct 2026), the same way a career and a
// school each have theirs: every card opens a page, Back returns to the grid.
export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <OpportunityDetailExperience id={id} />
    </>
  );
}
