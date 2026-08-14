import { bricolageGrotesque, spaceMono } from "@/components/marketing/fonts";
import { MarketingApp } from "@/components/marketing/MarketingApp";
import "@/components/marketing/tokens.css";
import "@/components/marketing/animations.css";

export default function Home() {
  return (
    <div className={`marketing-v2 ${bricolageGrotesque.variable} ${spaceMono.variable}`}>
      <MarketingApp />
    </div>
  );
}
