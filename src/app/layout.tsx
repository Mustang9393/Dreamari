import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorReporter } from "@/components/app/ErrorReporter";
import { ScrollReset } from "@/components/app/ScrollReset";
import { LiveRegion } from "@/components/app/LiveRegion";
import { SkipLink } from "@/components/app/SkipLink";
import { ThemeBoot } from "@/components/app/theme";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import "./globals.css";

// Replaces Montserrat app-wide: Inter is built specifically for UI legibility
// at small sizes (tall x-height, open counters), has a genuinely wide static
// weight range so nothing has to fall back to a thin 400 by default, and is
// one of the most battle-tested body faces for exactly this pairing (a
// characterful display face carrying personality, a neutral workhorse
// carrying everything else).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Display face is Bricolage Grotesque everywhere (direct feedback, 4 Sept
// 2026: Favorit retired). Loaded with the rest of the Google Fonts set through
// one <link> here, so every route has it; see marketing/fonts.ts for why a
// <link> rather than next/font/google.

export const metadata: Metadata = {
  title: "Dreamari: Discover your dream career.",
  description:
    "Build your profile, match with careers, play day-in-the-life work simulations, explore new paths, and connect with professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
        <script
          dangerouslySetInnerHTML={{
            // Defaults to dark everywhere except the build flow ("/flow"), which defaults
            // to light — unless the user has explicitly toggled a preference before (and
            // that choice was saved), which always wins regardless of route. Not driven
            // by system preference.
            __html: `try{var t=localStorage.getItem("dreamari-theme");var isBuild=location.pathname.startsWith("/flow");if(t==="dark"||(!t&&!isBuild)){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            // Touch taps must never spend themselves on hover (direct report,
            // 26 Sept 2026: "taps on mobile including the bottom navbar are
            // taking two"). After a tap, iOS Safari fires emulated mouse
            // events first; if a mouseover/mouseenter handler changes the
            // page (IconTip mounting its tooltip, HoverBeam lighting its
            // ring), Safari treats that tap as "hover" and swallows the click,
            // so the student has to tap again. Stopping those emulated mouse
            // events for a moment after any touch, before React's root
            // listeners see them, fixes every JS hover handler in the app at
            // once, including ones written later. A real mouse or trackpad is
            // untouched; CSS :hover is unaffected (Tailwind's hover: already
            // only applies on hover-capable devices).
            __html: `(function(){var t=0;function m(){t=Date.now()}window.addEventListener("touchstart",m,{capture:true,passive:true});window.addEventListener("touchend",m,{capture:true,passive:true});["mouseover","mouseout","mouseenter","mouseleave","mousemove"].forEach(function(n){window.addEventListener(n,function(e){if(Date.now()-t<1000)e.stopPropagation()},true)})})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <ThemeBoot />
        <ErrorReporter />
        <ScrollReset />
        <LiveRegion />
        {children}
      </body>
    </html>
  );
}
