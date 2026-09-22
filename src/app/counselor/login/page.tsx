import type { Metadata } from "next";
import { CounselorLogin } from "@/components/counselor/Auth";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Counselor Sign In · Dreamari",
  description: "Sign in to the Dreamari Counselor Dashboard.",
};

export default function CounselorLoginPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <CounselorLogin />
    </>
  );
}
