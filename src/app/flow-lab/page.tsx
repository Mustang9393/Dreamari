import type { Metadata } from "next";
import { FlowLab } from "@/components/flow-lab/FlowLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Flow lab · Dreamari",
  description: "Alternate Build to Match to Top 3 flows, isolated from the demo.",
};

// Same async-searchParams convention as the rest of the app's ?tab= pages.
export default async function FlowLabPage({ searchParams }: { searchParams: Promise<{ v?: string | string[] }> }) {
  const query = await searchParams;
  const v = Array.isArray(query.v) ? query.v[0] : query.v;
  const initialVersion = v === "3" ? "v3" : v === "2" ? "v2" : undefined;
  return <FlowLab initialVersion={initialVersion} />;
}
