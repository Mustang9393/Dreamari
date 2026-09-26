import type { Metadata } from "next";
import { ExploreLab } from "@/components/actions-lab/ExploreLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Explore · Actions lab · Dreamari",
  description: "The Career actions lab's copy of Explore: the For You reel with the proposed actions.",
};

// DEMO-ONLY: the Career actions lab's copy of /explore (same ?tab= and ?q=
// params). The real Explore page is untouched.
export default async function ExploreLabPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab = requested === "foryou" ? "foryou" : "browse";
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <ExploreLab initialTab={q ? "browse" : initialTab} initialQuery={q ?? ""} />
    </>
  );
}
