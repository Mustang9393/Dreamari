import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { CollegesExperience } from "@/components/colleges/CollegesExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Find a college — Dreamari",
  description: "Real colleges, what students really pay, and who finishes. No rankings.",
};

// College lookup. Reached from a career page's "Where you would study it",
// the Career Report's Colleges section, the Profile plan routes, and the
// quick-links menu. ?q= prefills the search, ?type= (trade | 2-year | 4-year)
// and ?school= (a college name from the report) preselect.
export default async function CollegesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const pick = (k: string) => (Array.isArray(params[k]) ? (params[k] as string[])[0] : (params[k] as string | undefined)) ?? "";
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <CollegesExperience initialQuery={pick("school") || pick("q")} initialType={pick("type")} />
    </>
  );
}
