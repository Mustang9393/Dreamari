import { MarketingApp } from "@/components/marketing/MarketingApp";
import "@/components/marketing/tokens.css";
import "@/components/marketing/animations.css";

export default function Home() {
  return (
    <div className="marketing-v2">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <MarketingApp />
    </div>
  );
}
