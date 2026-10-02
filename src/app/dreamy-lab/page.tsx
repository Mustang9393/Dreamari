import type { Metadata } from "next";
import { DreamyLab } from "@/components/dreamy-lab/DreamyLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Dreamy lab · Dreamari",
  description: "Play the 3D Dreamy's emotions and see him at app sizes. Isolated from the demo.",
};

export default function DreamyLabPage() {
  return <DreamyLab />;
}
