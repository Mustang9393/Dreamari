import type { Metadata } from "next";
import { ResumeBuilderExperience } from "@/components/resume/ResumeBuilderExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Resume Builder · Dreamari",
  description: "Build your resume profile, step by step.",
};

export default function ResumeBuilderPage() {
  return (
    <main>
      <ResumeBuilderExperience />
    </main>
  );
}
