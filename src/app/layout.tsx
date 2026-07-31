import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dreamari — Discover your dream career.",
  description:
    "Step into real careers through guided simulations. Build the skills, earn the proof, and picture yourself in the room.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
