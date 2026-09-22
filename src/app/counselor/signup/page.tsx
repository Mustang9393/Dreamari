import type { Metadata } from "next";
import { CounselorSignup } from "@/components/counselor/Auth";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Counselor Sign Up · Dreamari",
  description: "Create a Dreamari Counselor Dashboard account.",
};

export default function CounselorSignupPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <CounselorSignup />
    </>
  );
}
