import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { ConnectExperience } from "@/components/connect/ConnectExperience";
import "@/components/marketing/tokens.css";

export const metadata: Metadata = {
  title: "Connect — Dreamari",
  description: "Ask real people about careers you are exploring.",
};

// Connect — moderated career Q&A + post-event continuation. View state
// (home tab / board / event / thread) lives in the query string so it
// survives reload and share (?board=, ?event=, ?thread=, ?tab=), same
// pattern as Explore's ?tab=.
export default function ConnectPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <ConnectExperience />
    </>
  );
}
