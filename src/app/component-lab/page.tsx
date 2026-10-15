import type { Metadata } from "next";
import { ComponentLab } from "@/components/component-lab/ComponentLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";
// The live Glossary engine's stylesheets, so its specimens in the lab render
// as they do on the Play tab (16 Oct 2026).
import "@/components/glossary/glossary-lab.css";
import "@/components/glossary/glossary-refined.css";
import "@/components/glossary/glossary-fit.css";
import "@/components/glossary/glossary-worlds.css";
import "@/components/glossary/glossary-signal.css";
import "@/components/glossary/glossary-qlayout.css";
import "@/components/glossary/glossary-levels.css";

// DEMO-ONLY: the Component Lab route, for engineering handoff. Not the demo.
export const metadata: Metadata = {
  title: "Component library · Dreamari",
  description: "Every Dreamari component with all of its states, for engineering handoff.",
};

export default function ComponentLabPage() {
  return <ComponentLab />;
}
