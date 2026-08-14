import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { MarketingApp } from "@/components/marketing/MarketingApp";
import "@/components/marketing/tokens.css";
import "@/components/marketing/animations.css";

export default function Home() {
  return (
    <div className="marketing-v2">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <MarketingApp />
    </div>
  );
}
