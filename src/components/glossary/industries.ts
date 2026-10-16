// Glossary Games are industry games grouped under the career worlds (16 Oct
// 2026, Chandu: "Glossary games are industry focused not specific to
// careers... we have finance glossary but that comes under business and
// money so we will have industries grouped under our career worlds and
// they can share aesthetics and design system").
//
// Three layers:
//   World     the career world (WORLD_COLORS key). Owns the design system:
//             the world's accent, its Career Poster Card display face from
//             the Figma design system, and a readable body face.
//   Industry  one glossary: a slug, a title, a subject word, a world, its
//             own levels (a blueprint or the authored finance data). Several
//             industries can sit under one world and share its system.
//   Level     five terms, generated games (generate.ts).
//
// Every world has a row, so a new industry only needs a blueprint; the
// slug, title and subject are the industry's, the look is its world's.
// Signal keeps its pixel faces and takes only the accent; Drift takes both.

import type { CSSProperties } from "react";
import { WORLD_COLORS } from "@/components/app/worlds";

export type WorldSystem = {
  world: string;
  accent: string;
  /** Display face for titles, card terms, kickers and the results line. */
  display: string;
  displayWeight: number;
  /** Body face for questions, answers and copy. */
  body: string;
};

const system = (world: string, display: string, displayWeight: number, body: string): WorldSystem => ({ world, display, displayWeight, body, accent: WORLD_COLORS[world] ?? "var(--primary)" });

/** One design system per career world. Business keeps the Nunito body the
 *  finance game launched with; the rest take a readable face of their own. */
export const WORLD_SYSTEMS: WorldSystem[] = [
  system("Business & Finance", "var(--font-poster)", 400, "'Nunito', sans-serif"),
  system("Tech & Engineering", "var(--font-poster-science)", 700, "'Inter', sans-serif"),
  system("Health & Medicine", "var(--font-poster-nunito)", 800, "'Inter', sans-serif"),
  system("Arts, Media & Sport", "'Rozha One', serif", 400, "'Inter', sans-serif"),
  system("Science & Research", "var(--font-poster-mono)", 600, "'Inter', sans-serif"),
  system("Teaching & Education", "'Merriweather', serif", 700, "'Source Serif 4', serif"),
  system("Building & Construction", "'Heebo', sans-serif", 700, "'Inter', sans-serif"),
  system("Law, Safety & Justice", "var(--font-poster-zcool)", 400, "'Inter', sans-serif"),
  system("Food & Cooking", "var(--font-poster-nunito)", 800, "'Nunito', sans-serif"),
  system("Farming, Animals & Nature", "'Lora', serif", 700, "'Source Serif 4', serif"),
  system("Counseling & Social Work", "'Zain', sans-serif", 900, "'Nunito', sans-serif"),
  system("Driving, Flying & Shipping", "var(--font-poster-sekuya)", 400, "'Inter', sans-serif"),
  system("Factories & Making Things", "var(--font-poster-science)", 700, "'Inter', sans-serif"),
  system("Fixing Machines & Engines", "'Heebo', sans-serif", 700, "'Inter', sans-serif"),
  system("Personal Care & Community Services", "'Zain', sans-serif", 900, "'Nunito', sans-serif"),
];

export function worldSystem(world: string): WorldSystem | null {
  return WORLD_SYSTEMS.find((entry) => entry.world === world) ?? null;
}

export type IndustryMeta = {
  /** The route and registry key: /play/glossary/<slug>. */
  slug: string;
  /** The Play hub card title and the game's name. */
  title: string;
  /** The subject word in the game's copy ("finance words"). */
  subject: string;
  /** The world whose design system this industry wears. */
  world: string;
};

/** Which industry glossary a career opens. A career not listed here opens
 *  the first glossary registered under its world (data.ts). */
export const CAREER_INDUSTRY: Record<string, string> = {
  "investment-banking": "finance",
  "private-equity": "finance",
  "asset-manager": "finance",
  "accountant": "finance",
  "registered-nurse": "nursing",
  "software-engineer": "software",
  "airline-pilot": "aviation",
};

/** The CSS variables the game shell sets for a world. The stylesheet maps
 *  --glossary-display / --glossary-body onto the game's faces in Drift. */
export function worldTheme(world: string): CSSProperties {
  const entry = worldSystem(world);
  return {
    "--glossary-accent": entry?.accent ?? WORLD_COLORS[world] ?? "var(--primary)",
    "--glossary-display": entry?.display ?? "var(--font-display)",
    "--glossary-display-weight": String(entry?.displayWeight ?? 800),
    "--glossary-body": entry?.body ?? "var(--font-body)",
    // Drift's sky, orbs and clouds mix in the accent (worldBackdrops.ts).
    // Finance keeps the sky it launched with: "Finance stays exactly as it
    // is" (Master Scaling Plan, Executive Rule 1).
    "--glossary-sky-tint": world === "Business & Finance" ? "0%" : "42%",
    "--glossary-orb-tint": world === "Business & Finance" ? "0%" : "70%",
  } as CSSProperties;
}
