// The Counselor Dashboard's one chart hue (direct feedback, 25 Sept 2026:
// "Let's not use so many different colors. Choose a hue and stick to that.
// Blue is best."). Every magnitude, series and category mark in v2 draws
// from these blues; the three reserved status colors (chips.tsx:
// On Track green, Needs Attention amber, At Risk red) are the only other
// colors, and they mean state, never identity.
//
// Each ramp passes the dataviz skill's ordinal gate on this dashboard's
// dark surface (`validate_palette.js "<ramp>" --ordinal --mode dark
// --surface "#0b0d14"`: monotone lightness, visible step gaps, one hue,
// the dark end still clears the surface).

export const PRIMARY = "#5B6CF9";

/** Two or three series side by side (readiness charts). */
export const BLUE_3 = ["#9BA8FB", "#5B6CF9", "#2E3BB8"] as const;

/** Up to five categories (report charts). */
export const BLUE_5 = ["#C9D0FE", "#A0ACFB", "#7683F7", "#4F5DE4", "#2E3BB8"] as const;

/** Up to seven ranked categories (the pathway distribution bar). Ranked by
 *  size, light to dark, so the ramp doubles as the rank. */
export const BLUE_7 = ["#D8DDFE", "#BDC5FD", "#A1ACFB", "#8592F9", "#6978F6", "#5364E8", "#3F4DD6"] as const;

/** A target or benchmark line: neutral, so it is never mistaken for a
 *  series and adds no second hue. */
export const TARGET_LINE = "rgba(255,255,255,0.6)";

/** The one neutral for an "undecided" or "not started" slice. */
export const NEUTRAL_SLICE = "#5B6470";

/** Career pathway colors, by CLUSTER, not by rank: STEM in the brand blue;
 *  business, law and media in purple; hands-on and service in teal. Three
 *  hues, a cool walk, validated as a categorical set on the dark surface
 *  and each checked against the reserved status colors (teal #1A98B8 vs
 *  On Track green ΔE 17.2; purple vs amber 35.7; blue vs teal 17.0; blue vs
 *  purple 15.2 with a CVD warn, covered by the 2px segment gaps and the
 *  legend). Why clusters, and why three: direct feedback that pathways
 *  should be multicolor but "complementary, not random, have a logic";
 *  every seven-hue and every four-hue walk failed the validator's
 *  adjacent-pair floors once green, amber and red are reserved (a rose or
 *  magenta for Arts sat within 9 to 13 ΔE of either the status red or the
 *  purple), so the logic is meaning and Arts & Media joins the
 *  communications-facing cluster. Two or three pathways in one cluster
 *  share its hue on purpose. */
export const PATHWAY_CLUSTER_COLORS = {
  stem: "#5B6CF9",
  business: "#B04FD0",
  handsOn: "#1A98B8",
} as const;
const PATHWAY_CLUSTER: Record<string, keyof typeof PATHWAY_CLUSTER_COLORS> = {
  Technology: "stem",
  Healthcare: "stem",
  "Finance & Business": "business",
  "Law & Government": "business",
  "Arts & Media": "business",
  "Skilled Trades": "handsOn",
  Education: "handsOn",
};
export function pathwayColor(track: string): string {
  const cluster = PATHWAY_CLUSTER[track];
  return cluster ? PATHWAY_CLUSTER_COLORS[cluster] : NEUTRAL_SLICE;
}
