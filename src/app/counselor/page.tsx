import type { Metadata } from "next";
import { CounselorApp } from "@/components/counselor/CounselorApp";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Counselor Dashboard · Dreamari",
  description: "A caseload view, milestone tracking, and meeting prep for school counselors.",
};

// Same async-searchParams convention as the rest of the app's ?tab= pages
// (see src/app/profile/page.tsx) rather than a client-side useSearchParams()
// call, which needs its own Suspense boundary this repo's other pages don't
// use.
export default async function CounselorDashboardPage({ searchParams }: { searchParams: Promise<{ view?: string | string[]; studentId?: string | string[] }> }) {
  const query = await searchParams;
  const viewParam = Array.isArray(query.view) ? query.view[0] : query.view;
  const studentIdParam = Array.isArray(query.studentId) ? query.studentId[0] : query.studentId;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <CounselorApp initialView={viewParam} initialStudentId={studentIdParam} />
    </>
  );
}
