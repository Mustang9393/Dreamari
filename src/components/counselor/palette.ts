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
export const BLUE_3 = ["var(--cd-blue-soft)", "#5B6CF9", "#2E3BB8"] as const;

/** Up to five categories (report charts). */
export const BLUE_5 = ["var(--cd-blue-pale)", "#A0ACFB", "#7683F7", "#4F5DE4", "#2E3BB8"] as const;

/** Up to seven ranked categories (the pathway distribution bar). Ranked by
 *  size, light to dark, so the ramp doubles as the rank. */
export const BLUE_7 = ["#D8DDFE", "#BDC5FD", "#A1ACFB", "#8592F9", "#6978F6", "#5364E8", "#3F4DD6"] as const;

/** A target or benchmark line: neutral, so it is never mistaken for a
 *  series and adds no second hue. */
export const TARGET_LINE = "color-mix(in srgb, var(--foreground) 60%, transparent)";

/** The one neutral for an "undecided" or "not started" slice. */
export const NEUTRAL_SLICE = "#5B6470";

/** Career pathway colors: seven DISTINCT hues in one recognisable order,
 *  a spectrum that starts on the brand blue and wraps (blue, cyan, green,
 *  yellow, orange, pink, violet), assigned in rank order so the legend
 *  reads like a rainbow top to bottom (direct feedback, 25 Sept 2026:
 *  "each thing in that legend has to be different but stick to a known
 *  sequence like a rainbow style ... instead of random colors with things
 *  repeating"). This is the one place the dashboard uses more than its
 *  blue plus the status colors, by explicit decision. Validator (dark,
 *  categorical): contrast and chroma pass; three steps sit above the
 *  lightness band; adjacent CVD separation passes (worst 12.7); the
 *  cyan/green pair is 13.5 on the normal-vision floor (15), which the 2px
 *  segment gaps and the ordered legend are relied on to cover. */
/** Status inside a CHART (26 Sept 2026, direct feedback: "the graph colors
 *  can be consistent across the app. Some are green some blue some yellow
 *  etc"). The healthy state is the chart's own blue, so every chart reads
 *  as one family; amber and red appear only where something needs the
 *  counselor. Status chips (chips.tsx) keep their green "On Track"; this is
 *  for marks that show quantity. */
export const CHART_STATUS = { "On Track": PRIMARY, "Needs Attention": "var(--cd-amber)", "At Risk": "var(--cd-red)" } as const;

/** An upward trend (a "+2 pts" or "+22%" chip): green, not the chart blue,
 *  because it is text on a blue-tinted card (direct feedback, 26 Sept 2026:
 *  "trend chips can stay green. Blue is hard to read on blue"). */
export const TREND_UP = "var(--cd-green)";

/** Progress stages of one milestone in a chart, furthest along brightest;
 *  red only for overdue. */
export const CHART_STAGE: Record<string, string> = {
  approved: PRIMARY,
  "pending review": "var(--cd-blue-soft)",
  "in progress": "var(--cd-blue-pale)",
  "not started": NEUTRAL_SLICE,
  overdue: "var(--cd-red)",
};

export const PATHWAY_SEQUENCE = ["#5B6CF9", "#22A0D0", "#22B58C", "#E6C93A", "#EA6A2A", "#E25B9E", "#9F4FE6"] as const;
