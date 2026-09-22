// The Counselor Dashboard's one shared "premium glass" surface -- every
// card in every view imports this instead of hand-rolling its own
// background/border/shadow, so the whole product reads as one consistent,
// considered surface language (translucent glass, a soft gradient sheen,
// a glow that answers "gradients, glassy effects, glows" directly) rather
// than eleven screens each inventing their own box. Bump this one object
// and every screen picks it up.

export const GLASS_CARD = {
  background: "linear-gradient(155deg, color-mix(in srgb, var(--primary) 10%, var(--glass-surface-2)) 0%, color-mix(in srgb, var(--card) 92%, transparent) 55%, color-mix(in srgb, #7C5CFA 7%, var(--card)) 100%)",
  borderColor: "color-mix(in srgb, var(--primary) 22%, var(--glass-border))",
  boxShadow: "0 24px 60px -30px rgba(0,0,0,0.7), inset 0 1px 0 0 color-mix(in srgb, #FFFFFF 8%, transparent)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
} as const;

/** A slightly hotter version for the one "hero" surface per screen (the
 *  Overview donuts, a headline banner) -- same recipe, a touch more primary
 *  tint and a visible glow so it reads as the room's centerpiece. */
export const GLASS_CARD_HERO = {
  ...GLASS_CARD,
  background: "linear-gradient(155deg, color-mix(in srgb, var(--primary) 16%, var(--glass-surface-2)) 0%, color-mix(in srgb, var(--card) 90%, transparent) 55%, color-mix(in srgb, #7C5CFA 12%, var(--card)) 100%)",
  boxShadow: "0 28px 70px -28px color-mix(in srgb, var(--primary) 35%, rgba(0,0,0,0.7)), inset 0 1px 0 0 color-mix(in srgb, #FFFFFF 10%, transparent)",
} as const;

/** A quieter inset row inside a glass card -- list rows, table rows, chip
 *  rows -- one step down from the card itself so nesting stays legible. */
export const GLASS_INSET = {
  background: "color-mix(in srgb, #FFFFFF 4%, transparent)",
  borderColor: "color-mix(in srgb, #FFFFFF 8%, transparent)",
} as const;

/** A radial glow anchored behind a headline stat -- drop this as an
 *  absolutely-positioned ::before-style sibling behind a big number so it
 *  reads as lit from within, not just colored text. */
export function glowBackdrop(color: string, opacity = 0.35): string {
  return `radial-gradient(60% 60% at 30% 20%, color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent), transparent 70%)`;
}
