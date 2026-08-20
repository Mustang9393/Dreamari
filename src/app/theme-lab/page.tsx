import type { Metadata } from "next";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { ThemeLab } from "@/components/theme-lab/ThemeLab";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";
import "../../../docs/handoff/shadcn-adapter.css";

export const metadata: Metadata = {
  title: "Theme Lab — Dreamari",
  description: "shadcn/ui component recipes rendered on the Dreamari token contract, for visual review and refinement.",
};

// The visual contract with the dev build: every widget below is styled with
// shadcn/ui's own class recipes, resolved through tokens.css (the certified
// Figma pull) + docs/handoff/shadcn-adapter.css. What renders here is what
// real shadcn/Radix components look like once themed. Refinements happen by
// editing those two files; the dev pulls the same files.
export default function ThemeLabPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
      <ThemeLab />
    </>
  );
}
