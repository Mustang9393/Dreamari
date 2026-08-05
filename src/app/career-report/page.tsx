import type { Metadata } from "next";
import { CareerReportExperience } from "@/components/report/CareerReportExperience";

export const metadata: Metadata = {
  title: "Computer Science Career Report — Dreamari",
  description: "Your Dreamari career direction, pathway, education options and next-step plan.",
};

export default async function CareerReportPage({ searchParams }: { searchParams: Promise<{ from?: string | string[]; state?: string | string[] }> }) {
  const query = await searchParams;
  return <CareerReportExperience prepare={query.from === "match"} simulateError={query.state === "error"} />;
}
