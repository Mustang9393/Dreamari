// The Figma UI type styles (live variable pull): Display/H1/H2/Body are Bricolage
// Grotesque (ExtraBold/Bold/SemiBold); Montserrat covers only Body Secondary,
// Labels, and Captions -- which the app layout already loads globally. This module
// gives the flow the Bricolage half of that pairing; weights match the pulled
// styles (600 Body, 700 H1/H2, 800 Display).
//
// 25 Sept 2026: no longer `Bricolage_Grotesque()` from next/font/google. That
// call builds fine locally and then fails ONLY on Vercel's Turbopack build
// ("Module not found: @vercel/turbopack-next/internal/font/google/font",
// "next/font/google queries have exactly one entry"), which is exactly the
// failure marketing/fonts.ts documents and worked around a month ago. The
// production deploy of 76911d7f died on it. Bricolage 400/600/700/800 is
// already on every route through the root layout's font <link>
// (FONT_STYLESHEET_HREF), and Tailwind's `font-display` utility resolves to
// that family (globals.css `--font-display`), so the same `bricolage.className`
// call sites keep working with zero build-time font resolution.
export const bricolage = { className: "font-display" } as const;
