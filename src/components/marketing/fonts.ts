// Bricolage Grotesque + Space Mono are loaded via a plain <link> in page.tsx, not
// next/font/google. next/font/google's build-time font-fetch through Turbopack failed
// specifically on Vercel's build environment (`Module not found:
// @vercel/turbopack-next/internal/font/google/font`) despite passing every local build —
// an environment-only failure that silently kept production on the last successful
// deploy while every local fix looked verified. A <link> tag has no build-time
// resolution step at all, so it can't hit that failure mode. Referenced directly by
// family name in tokens.css (no --font-bricolage/--font-space-mono CSS variables needed).
export const FONT_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap";
