import type { Metadata } from "next";
import { DreamyLive } from "@/components/dreamy-lab/live/DreamyLive";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Dreamy 3D · Dreamari",
  description: "The live 3D Dreamy: reacts, floats, follows the pointer. Isolated from the demo.",
};

export default function DreamyLivePage() {
  return <DreamyLive />;
}
