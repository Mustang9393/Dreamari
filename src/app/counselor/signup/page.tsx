import { redirect } from "next/navigation";

// There is no counselor sign-in or sign-up (direct instruction, 25 Sept
// 2026). Old links and bookmarks land on the dashboard itself.
export default function CounselorSignupPage() {
  redirect("/counselor");
}
