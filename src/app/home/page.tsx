import type { Metadata } from "next";
import { StudentHomeExperience } from "@/components/home/StudentHomeExperience";

export const metadata: Metadata = {
  title: "Home — Dreamari",
  description: "Continue your Dreamari journey, discover careers and build career-ready skills.",
};

export default function HomePage() {
  return <StudentHomeExperience />;
}
