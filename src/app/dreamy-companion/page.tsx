import type { Metadata } from "next";
import { DreamyCompanionLab } from "@/components/dreamy-companion/DreamyCompanionLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Dreamy companion · Dreamari",
  description: "Dreamy as the student's scout: one dock, one line at a time, never the same find twice. A lab, isolated from the demo.",
};

export default function DreamyCompanionPage() {
  return <DreamyCompanionLab />;
}
