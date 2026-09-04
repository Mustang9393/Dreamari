import type { Metadata } from "next";
import { PlayHub } from "@/components/play/PlayHub";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Play — Dreamari",
  description: "Career simulations. Do the job for an hour before you spend four years on it.",
};

export default function PlayPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <PlayHub />
    </>
  );
}
