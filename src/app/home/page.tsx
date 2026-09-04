import type { Metadata } from "next";
import { HomeExperience } from "@/components/app/HomeExperience";
import "@/components/marketing/tokens.css";

export const metadata: Metadata = {
  title: "Home — Dreamari",
  description: "Continue your Dreamari journey, discover careers and build career-ready skills.",
};

// Home — v2.1 (Figma 2099:3423 / mobile 7:1749).
export default function HomePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <HomeExperience />
    </>
  );
}
