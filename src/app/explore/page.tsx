import type { Metadata } from "next";
// The Career actions lab's Explore is the live Explore now (1 Oct 2026;
// Chandu: "push the updated Explore and Career Detail to the main flow").
// The lab route keeps its dock for iterating; ExploreExperience stays for
// the pieces other pages import from it.
import { ExploreLab } from "@/components/actions-lab/ExploreLab";
import { LiveProvider } from "@/components/actions-lab/labUi";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Explore · Dreamari",
  description: "Discover careers made for you: swipe the For You reel or browse every career world.",
};

// Explore — For You (Figma 2288:16179 + Mobile Reel 2530:46431) and
// Browse All (Figma 3185:17011 / mobile 2428:3454), toggled via ?tab=browse.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; q?: string | string[]; row?: string | string[] }> }) {
  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  // Browse is the default view (per user 2026-08-21); the reel stays one tap away.
  const initialTab = requested === "foryou" ? "foryou" : "browse";
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const row = Array.isArray(params.row) ? params.row[0] : params.row;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <LiveProvider><ExploreLab live initialTab={q || row ? "browse" : initialTab} initialQuery={q ?? ""} initialRow={row ?? ""} /></LiveProvider>
    </>
  );
}
