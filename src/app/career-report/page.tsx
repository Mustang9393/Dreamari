import type { Metadata } from "next";
import { ReportChooser } from "@/components/report/ReportChooser";
import { parsePicksParam } from "@/lib/picks";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Your Career Reports — Dreamari",
  description: "Your Top 3 as full career reports. Choose the one to build your pathway and plan around.",
};

// The bridge out of Match. Arrives as /career-report?picks=a,b,c so the three
// reports render server-side and the link is shareable in a demo; the chooser
// falls back to stored picks when someone opens the page cold.
export default async function CareerReportPage({ searchParams }: { searchParams: Promise<{ picks?: string | string[] }> }) {
  const query = await searchParams;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <ReportChooser initialPicks={parsePicksParam(query.picks)} />
    </>
  );
}
