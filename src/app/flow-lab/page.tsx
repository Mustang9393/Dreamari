import type { Metadata } from "next";
import { FlowLab } from "@/components/flow-lab/FlowLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Flow lab · Dreamari",
  description: "An alternate Build to Match to Top 3 flow, isolated from the demo.",
};

export default function FlowLabPage() {
  return <FlowLab />;
}
