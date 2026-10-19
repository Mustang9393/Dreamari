import type { Metadata } from "next";
// DEMO-ONLY: the Career outlook lab (19 Oct 2026), reached only from the
// hamburger's lab links. The real Career Detail page with the Pay tab grown
// into "Pay & Outlook" (Joshua's focus-group ask: projected growth, job
// openings, pay by state, state trends). Remove once the design is chosen
// and built into /career for real. See src/components/outlook-lab/.
import { CareerDetailLab } from "@/components/actions-lab/CareerDetailLab";
import { LiveProvider } from "@/components/actions-lab/labUi";
import { resolveCareer } from "@/components/career/data";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const career = resolveCareer(slug);
  return { title: `${career?.title ?? "Career"} outlook lab · Dreamari`, robots: { index: false } };
}

export default async function OutlookLabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <LiveProvider><CareerDetailLab slug={slug} live outlook /></LiveProvider>
  );
}
