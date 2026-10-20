import type { Metadata } from "next";
import { ErrorReporter } from "@/components/app/ErrorReporter";
import { HistoryHost } from "@/components/app/HistoryHost";
import { ScrollReset } from "@/components/app/ScrollReset";
import { SPLASH_VEIL_SCRIPT, SplashVeilGuard } from "@/components/app/SplashVeil";
import { LiveRegion } from "@/components/app/LiveRegion";
import { OfflineBanner } from "@/components/app/SurfaceState";
import { SkipLink } from "@/components/app/SkipLink";
import { TabKeys } from "@/components/app/TabKeys";
import { ThemeBoot } from "@/components/app/theme";
import { LightPulse } from "@/components/app/LightPulse";
import { ColorThemeSwitch } from "@/components/app/ColorThemeSwitch";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import "./globals.css";
import "./look-v2.css";

// Replaces Montserrat app-wide: Inter is built specifically for UI legibility
// at small sizes (tall x-height, open counters), has a genuinely wide static
// weight range so nothing has to fall back to a thin 400 by default, and is
// one of the most battle-tested body faces for exactly this pairing (a
// characterful display face carrying personality, a neutral workhorse
// carrying everything else).
// Loaded through the shared Google Fonts <link> (marketing/fonts.ts), not
// next/font/google: its build-time fetch failed on Vercel again on 7 Oct 2026
// (inter_*.module.css: Module not found), the same environment-only failure
// that already moved every other face to the <link>. --font-inter is defined
// in globals.css.

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Welcome first, then the page: see SplashVeil.tsx */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_VEIL_SCRIPT }} />
        <link rel="stylesheet" href={FONT_STYLESHEET_HREF} />
        <script
          dangerouslySetInnerHTML={{
            // DEMO-ONLY: the colour theme (look-v2.css). Black & Blue is the
            // default (19 Oct 2026, Chandu: "lets have black and blue be the
            // default and the switch to be done for classic"); Classic only
            // when chosen: ?look=v1 or the bottom-left switch saves "v1",
            // ?look=v2 saves "v2". Blocked storage still gets Black & Blue.
            // Set before paint so the other palette never flashes.
            __html: `(function(){var v2=true;try{var q=new URLSearchParams(location.search).get("look");if(q==="v1"||q==="v2")localStorage.setItem("dreamari-look",q);if(q==="v1"||(!q&&localStorage.getItem("dreamari-look")==="v1"))v2=false}catch(e){}if(v2)document.documentElement.classList.add("look-v2")})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            // Defaults to dark everywhere except the build flow ("/flow"), which defaults
            // to light — unless the user has explicitly toggled a preference before (and
            // that choice was saved), which always wins regardless of route. Not driven
            // by system preference. The Counselor Dashboard keeps its own saved choice
            // and defaults to light; v4 and v7 default to dark (Black & Blue; v4 since
            // 20 Oct 2026, Chandu: "Use our design system", Black & Blue like v7).
            __html: `try{var p=location.pathname;var c=p==="/counselor"||p.indexOf("/counselor/")===0;var v=new URLSearchParams(location.search).get("v");var sv=localStorage.getItem("dreamari:counselor-version");var v4=c&&(v? v==="4":sv==="v4");var v7=c&&(v? v==="7":sv==="v7");var t=localStorage.getItem(v7?"dreamari-theme:counselor:v7":v4?"dreamari-theme:counselor:v4b":c?"dreamari-theme:counselor":"dreamari-theme");var isBuild=p.startsWith("/flow");if(t==="dark"||(!t&&!isBuild&&(!c||v7||v4))){document.documentElement.classList.add("dark")}else if(c){document.documentElement.classList.add("light")}}catch(e){}`,
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
        <TabKeys />
        <ThemeBoot />
        <LightPulse />
        <ColorThemeSwitch />
        <ErrorReporter />
        <ScrollReset />
        <HistoryHost />
        <SplashVeilGuard />
        <LiveRegion />
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
