import type { Metadata } from "next";
import { SignupExperience } from "@/components/signup/SignupExperience";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Sign up — Dreamari",
  description: "Join Dreamari as a student, parent, or teacher.",
};

export default function SignupPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <SignupExperience />
    </>
  );
}
