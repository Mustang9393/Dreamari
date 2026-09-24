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
