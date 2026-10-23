import type { Metadata } from "next";
import { ExploreExperience } from "@/components/app/ExploreExperience";
import { isPathChoice } from "@/components/app/careerPath";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Explore · Dreamari",
  description: "Discover careers made for you: swipe the For You reel or browse every career world.",
};

// Explore — For You (Figma 2288:16179 + Mobile Reel 2530:46431) and
// Browse All (Figma 3185:17011 / mobile 2428:3454), toggled via ?tab=browse.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; q?: string | string[]; row?: string | string[]; path?: string | string[] }> }) {
  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  // Browse is the default view (per user 2026-08-21); the reel stays one tap away.
  const initialTab = requested === "foryou" ? "foryou" : "browse";
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const row = Array.isArray(params.row) ? params.row[0] : params.row;
  // ?path=trades: the Non-college switch is on (16 Oct 2026).
  const pathParam = Array.isArray(params.path) ? params.path[0] : params.path;
  const path = isPathChoice(pathParam) ? pathParam : "all";
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <ExploreExperience initialTab={q || row ? "browse" : initialTab} initialQuery={q ?? ""} initialRow={row ?? ""} initialPath={path} />
    </>
  );
}
