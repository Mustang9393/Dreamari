import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { MotionLab } from "@/components/motion-lab/MotionLab";
import "@/components/marketing/tokens.css";

export const metadata: Metadata = {
  title: "Motion Lab — Dreamari",
  description: "Duolingo-style motion primitives sandbox: springs, squish, tactile press. Local prototyping only.",
};

export default function MotionLabPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <MotionLab />
    </>
  );
}
