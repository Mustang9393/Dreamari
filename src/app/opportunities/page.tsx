import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OpportunitiesExperience } from "@/components/opportunities/OpportunitiesExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Opportunities · Dreamari",
  description: "Real scholarships, summer programs and internships that fit you, with the dates kept for you.",
};

// Opportunities (1 Oct 2026). ?tab= scholarships | programs | internships; ?field= a
// career world; ?school= a school slug (scholarships you could use there);
// ?open=<id> (older links from Home and Saved) now goes straight to that
// item's own page (3 Oct 2026: the in-list reader was replaced by the page).
export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const pick = (k: string) => (Array.isArray(params[k]) ? (params[k] as string[])[0] : (params[k] as string | undefined)) ?? "";
  const tab = pick("tab");
  const open = pick("open");
  if (open) redirect(`/opportunities/${encodeURIComponent(open)}`);
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <OpportunitiesExperience initialTab={tab === "programs" || tab === "internships" ? tab : "scholarships"} initialField={pick("field")} initialSchool={pick("school")} />
    </>
  );
}
