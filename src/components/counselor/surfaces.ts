// The Counselor Dashboard's one shared "premium glass" surface -- every
// card in every view imports this instead of hand-rolling its own
// background/border/shadow, so the whole product reads as one consistent,
// considered surface language (translucent glass, a soft gradient sheen,
// a glow that answers "gradients, glassy effects, glows" directly) rather
// than eleven screens each inventing their own box. Bump this one object
// and every screen picks it up.

export const GLASS_CARD = {
  background: "linear-gradient(155deg, color-mix(in srgb, var(--primary) 10%, var(--glass-surface-2)) 0%, color-mix(in srgb, var(--card) 92%, transparent) 55%, color-mix(in srgb, var(--primary) 7%, var(--card)) 100%)",
  borderColor: "color-mix(in srgb, var(--primary) 22%, var(--glass-border))",
  boxShadow: "0 24px 60px -30px rgba(0,0,0,0.7), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
} as const;

/** A slightly hotter version for the one "hero" surface per screen (the
 *  Overview donuts, a headline banner) -- same recipe, a touch more primary
 *  tint and a visible glow so it reads as the room's centerpiece. */
export const GLASS_CARD_HERO = {
  ...GLASS_CARD,
  background: "linear-gradient(155deg, color-mix(in srgb, var(--primary) 16%, var(--glass-surface-2)) 0%, color-mix(in srgb, var(--card) 90%, transparent) 55%, color-mix(in srgb, var(--primary) 12%, var(--card)) 100%)",
  boxShadow: "0 28px 70px -28px color-mix(in srgb, var(--primary) 35%, rgba(0,0,0,0.7)), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 10%, transparent)",
} as const;

/** A nested row inside a glass card -- list rows, student rows, chip rows.
 *  One clear step UP from the card so nesting reads at a glance (direct
 *  feedback, 25 Sept 2026: "better contrast for the nested cards
 *  everywhere"); the earlier 4% / 8% pair sank into the card. Mixed from
 *  --foreground, not white, so the same step reads darker-on-light in
 *  light mode instead of vanishing. */
export const GLASS_INSET = {
  background: "var(--inset-bg)",
  borderColor: "var(--inset-border)",
  boxShadow: "var(--inset-shadow)",
} as const;

/** A radial glow anchored behind a headline stat -- drop this as an
 *  absolutely-positioned ::before-style sibling behind a big number so it
 *  reads as lit from within, not just colored text. */
export function glowBackdrop(color: string, opacity = 0.35): string {
  return `radial-gradient(60% 60% at 30% 20%, color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent), transparent 70%)`;
}

/** One blue family for composition. Area carries the value; a gentle
 * count-based tint reinforces it without introducing categorical colors.
 * Highlights are identical in direction and do not change tile geometry. */
export function pathwayTileSurface(share: number, active = false) {
  const strength = Math.round(24 + Math.min(1, Math.max(0, share)) * 110);
  return {
    background: `linear-gradient(145deg, color-mix(in srgb, var(--foreground) ${active ? 15 : 7}%, transparent), transparent 55%), linear-gradient(160deg, color-mix(in srgb, var(--primary) ${active ? 64 : strength}%, var(--glass-surface-2)), color-mix(in srgb, var(--primary) ${active ? 38 : Math.round(strength * 0.55)}%, var(--card)))`,
    borderColor: "color-mix(in srgb, var(--primary) 20%, var(--card))",
    boxShadow: `inset 0 1px 0 color-mix(in srgb, var(--foreground) ${active ? 36 : 13}%, transparent), inset 1px 0 0 color-mix(in srgb, var(--foreground) 5%, transparent)${active ? ", inset 0 0 32px color-mix(in srgb, var(--primary) 28%, transparent)" : ""}`,
    color: "var(--foreground)",
  };
}
