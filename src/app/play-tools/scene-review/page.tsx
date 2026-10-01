import type { Metadata } from "next";
import { SceneReview } from "@/components/play-tools/SceneReview";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// DEMO-ONLY: internal tool for career simulation art QA, not the demo.
export const metadata: Metadata = {
  title: "Scene review · Dreamari",
  description: "Every career simulation location at five screen sizes, with automatic placement checks.",
};

export default function SceneReviewPage() {
  return <SceneReview />;
}
