import type { Metadata } from "next";
import { ComponentLab } from "@/components/component-lab/ComponentLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// DEMO-ONLY: the Component Lab route, for engineering handoff. Not the demo.
export const metadata: Metadata = {
  title: "Component library · Dreamari",
  description: "Every Dreamari component with all of its states, for engineering handoff.",
};

export default function ComponentLabPage() {
  return <ComponentLab />;
}
