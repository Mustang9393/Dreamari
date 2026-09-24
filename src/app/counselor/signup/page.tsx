import { redirect } from "next/navigation";

// DEMO-ONLY: legacy auth links enter the counselor prototype directly.
export default function CounselorEntryPage() {
  redirect("/counselor");
}
