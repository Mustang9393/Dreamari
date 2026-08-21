import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { ExploreExperience } from "@/components/app/ExploreExperience";
import "@/components/marketing/tokens.css";

export const metadata: Metadata = {
  title: "Explore — Dreamari",
  description: "Discover careers made for you — swipe the For You reel or browse every career world.",
};

// Explore — For You (Figma 2288:16179 + Mobile Reel 2530:46431) and
// Browse All (Figma 3185:17011 / mobile 2428:3454), toggled via ?tab=browse.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  // Browse is the default view (per user 2026-08-21); the reel stays one tap away.
  const initialTab = requested === "foryou" ? "foryou" : "browse";
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <ExploreExperience initialTab={initialTab} />
    </>
  );
}
