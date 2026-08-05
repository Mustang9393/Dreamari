import type { Metadata } from "next";
import { StudentHomeExperience } from "@/components/home/StudentHomeExperience";

export const metadata: Metadata = {
  title: "Home — Dreamari",
  description: "Continue your Dreamari journey, discover careers and build career-ready skills.",
};

const studentTabs = ["home", "explore", "play", "community", "profile"] as const;
type StudentTab = (typeof studentTabs)[number];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; category?: string | string[] }> }) {
  const params = await searchParams;
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialTab: StudentTab = requestedTab && studentTabs.includes(requestedTab as StudentTab) ? requestedTab as StudentTab : "home";
  return <StudentHomeExperience initialTab={initialTab} initialCategory={category} />;
}
