import type { CSSProperties } from "react";

// Career-world taxonomy for the app screens (Home / Explore), transcribed 1:1
// from the Figma "Career Poster Card" component variants — each world binds a
// color variable (tokens.css .marketing-v2 scope, from the DTCG export) and its
// own poster-title face with the variant's exact weight and letter-spacing.
// No hand-picked values: every entry's source is the design-context pull of
// Home — v2.1 (2099:3423) and Explore-Browse (3185:17011).

export const WORLD_LABELS = [
  "All",
  "Tech & Engineering",
  "Health & Medicine",
  "Business & Finance",
  "Arts, Media & Sport",
  "Science & Research",
  "Teaching & Education",
  "Building & Construction",
  "Law, Safety & Justice",
  "Food & Cooking",
  "Farming, Animals & Nature",
  "Counseling & Social Work",
  "Driving, Flying & Shipping",
  "Factories & Making Things",
  "Fixing Machines & Engines",
  "Personal Care & Community Services",
] as const;

export const WORLD_COLORS: Record<string, string> = {
  "Business & Finance": "var(--world-business-money-office)",
  "Tech & Engineering": "var(--world-tech-engineering-design)",
  "Health & Medicine": "var(--world-health-medicine)",
  "Arts, Media & Sport": "var(--world-arts-media-sport)",
  "Science & Research": "var(--world-science-research)",
  "Teaching & Education": "var(--world-teaching-learning)",
  "Building & Construction": "var(--world-building-construction)",
  "Law, Safety & Justice": "var(--world-law-safety-government)",
  "Food & Cooking": "var(--world-food-farming-nature)",
  "Farming, Animals & Nature": "var(--world-farming-animals-nature)",
  "Counseling & Social Work": "var(--world-helping-human-services)",
  "Driving, Flying & Shipping": "var(--world-driving-flying-shipping)",
  "Factories & Making Things": "var(--world-factories-making-things)",
  "Fixing Machines & Engines": "var(--world-fixing-machines-engines)",
  "Personal Care & Community Services": "var(--world-personal-care-community-services)",
};

// Poster-title face per world (family, weight, tracking at the 24px poster
// size), matching each Figma variant. Families resolve through tokens.css
// poster vars where one exists; the remaining faces are loaded by name via
// FONT_STYLESHEET_HREF exactly as the variants reference them.
export function posterTitleFont(world: string): CSSProperties {
  switch (world) {
    case "Business & Finance":
      return { fontFamily: "var(--font-poster)", fontWeight: 400, letterSpacing: "0.81px" };
    case "Tech & Engineering":
      return { fontFamily: "var(--font-poster-science)", fontWeight: 700, letterSpacing: "-2px", fontVariationSettings: '"CTRS" 0, "wdth" 100' };
    case "Health & Medicine":
      return { fontFamily: "var(--font-poster-nunito)", fontWeight: 700, letterSpacing: "0.81px" };
    case "Arts, Media & Sport":
      return { fontFamily: '"Rozha One", serif', fontWeight: 400, letterSpacing: "0.81px" };
    case "Science & Research":
      return { fontFamily: "var(--font-poster-mono)", fontWeight: 600, letterSpacing: "0.81px" };
    case "Teaching & Education":
      return { fontFamily: '"Merriweather", serif', fontWeight: 700, letterSpacing: "0.72px" };
    case "Building & Construction":
      return { fontFamily: '"Heebo", sans-serif', fontWeight: 700, letterSpacing: "1px" };
    case "Law, Safety & Justice":
      return { fontFamily: "var(--font-poster-zcool)", fontWeight: 400, letterSpacing: "0.81px" };
    case "Farming, Animals & Nature":
      return { fontFamily: '"Lora", serif', fontWeight: 700, letterSpacing: "0.81px" };
    case "Counseling & Social Work":
      return { fontFamily: '"Zain", sans-serif', fontWeight: 900, letterSpacing: "0.81px" };
    case "Driving, Flying & Shipping":
      return { fontFamily: "var(--font-poster-sekuya)", fontWeight: 400, letterSpacing: "0.72px" };
    default:
      return { fontFamily: "var(--font-body)", fontWeight: 800, letterSpacing: "0.81px" };
  }
}

// gradient/text-scrim — the Browse Card component's own stops, via tokens.
// Theme-independent: the poster is a self-contained dark-scrimmed object —
// on the light Explore the scrim must NOT resolve to the light background.
export const TEXT_SCRIM =
  "linear-gradient(180deg, rgba(5,7,15,0) 0%, rgba(5,7,15,0.55) 30%, rgba(5,7,15,0.86) 51%, #05070f 100%)";

/** A world colour used as TEXT (WCAG 1.4.3, audit 21 Oct 2026). The pure
 *  world colours are tuned for fills, dots and bars; as 10-12px type they
 *  measured 2.8-4.4:1 (indigo, violet, red, slate the worst). Fills keep the
 *  pure colour; text takes one of these. */
/** On a poster: toward the poster's own ink (--pc-ink under the light
 *  theme's frosted scrim), else the theme's text colour, since the poster
 *  scrims follow the theme. */
export const posterInk = (color: string) => `color-mix(in srgb, ${color} 60%, var(--pc-ink, var(--foreground)))`;
/** On the page or a card: pulled toward the theme's own text colour. */
export const worldInk = (color: string) => `color-mix(in srgb, ${color} 55%, var(--foreground))`;
