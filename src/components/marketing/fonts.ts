import { Bricolage_Grotesque, Space_Mono } from "next/font/google";

// Section 2 of the handoff spec names 'Bricolage Grotesque' as --font-display. The rest
// of the app's display font (Favorit, loaded in layout.tsx) is reserved for the DREAMARI
// wordmark this rebuild's hero no longer shows, so this is loaded separately and scoped
// to the marketing subtree only.
export const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// The reference prototype's --font-mono ('Space Mono'), used for eyebrows, the rail
// labels, and other small monospace accents — distinct from Tailwind's own generic
// `font-mono` utility, which resolves to a system stack, not this typeface.
export const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});
