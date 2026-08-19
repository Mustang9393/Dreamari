// Bricolage Grotesque + Space Mono are loaded via a plain <link> in page.tsx, not
// next/font/google. next/font/google's build-time font-fetch through Turbopack failed
// specifically on Vercel's build environment (`Module not found:
// @vercel/turbopack-next/internal/font/google/font`) despite passing every local build —
// an environment-only failure that silently kept production on the last successful
// deploy while every local fix looked verified. A <link> tag has no build-time
// resolution step at all, so it can't hit that failure mode. Referenced directly by
// family name in tokens.css (no --font-bricolage/--font-space-mono CSS variables needed).
// Viaoda Libre added for the Career Poster Card's real "Poster Title" font (Browse
// Cards/Poster Title/Viaoda Libre/Standard, per the design system) used in the Match
// chapter's cards. Source Code Pro (weight 600 only — that's the only weight the
// design system's Science & Research world variant actually uses) is that same
// component's OTHER real poster-title font, for Explore's Science & Research card.
// Nunito 700 / Science Gothic 700 / ZCOOL XiaoWei / Sekuya are the Career
// Poster Card component's OTHER world title faces (Health & Medicine, Tech &
// Engineering, Law Safety & Justice, Driving Flying & Shipping respectively),
// added for Explore's Top-5 rail. Rozha One (Arts, Media & Sport), Merriweather
// 700 (Teaching & Education) and Zain 900 (Counseling & Social Work) complete
// the set for the app Home/Explore poster rails, straight from the Figma
// Career Poster Card variants. All verified live on Google Fonts.
export const FONT_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=Viaoda+Libre&family=Source+Code+Pro:wght@600&family=Nunito:wght@700&family=Science+Gothic:wght@700&family=ZCOOL+XiaoWei&family=Sekuya&family=Lora:wght@700&family=Fraunces:opsz,wght@9..144,700&family=Heebo:wght@700&family=Rozha+One&family=Merriweather:wght@700&family=Zain:wght@900&display=swap";
