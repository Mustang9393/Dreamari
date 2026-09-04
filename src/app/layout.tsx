import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorReporter } from "@/components/app/ErrorReporter";
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
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeBoot />
        <ErrorReporter />
        {children}
      </body>
    </html>
  );
}
