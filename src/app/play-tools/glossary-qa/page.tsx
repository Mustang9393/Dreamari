import type { Metadata } from "next";
import { GlossaryQa } from "@/components/play-tools/GlossaryQa";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// DEMO-ONLY: internal QA index for the generated glossary games (16 Oct
// 2026, Chandu: "push them to a separate link in the hamburger menu on main
// so i can qa in browser"). Generated industries stay off the Play hub until
// released; this page is where they are played meanwhile.
export const metadata: Metadata = {
  title: "Glossary QA · Dreamari",
  description: "Every glossary game, every level, in Drift and Signal.",
};

export default function GlossaryQaPage() {
  return <GlossaryQa />;
}
