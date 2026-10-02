// V4's categorical chart colors share the workspace's light/dark material tokens.
export const PRIMARY = "var(--v4-chart-1)";
export const BLUE_3 = ["var(--v4-chart-2)","var(--v4-chart-1)","var(--v4-chart-3)"] as const;
export const BLUE_5 = ["var(--v4-chart-1)","var(--v4-chart-2)","var(--v4-chart-3)","var(--v4-chart-4)","var(--v4-chart-5)"] as const;
export const BLUE_7 = [...BLUE_5,"var(--v4-chart-6)","var(--primary)"] as const;
export const TARGET_LINE = "var(--muted-foreground)";
export const NEUTRAL_SLICE = "var(--v4-chart-6)";
export const CHART_STATUS = {"On Track":PRIMARY,"Needs Attention":"var(--v4-chart-3)","At Risk":"var(--destructive)"} as const;
export const TREND_UP = "var(--primary)";
export const CHART_STAGE:Record<string,string>={approved:PRIMARY,"pending review":"var(--v4-chart-2)","in progress":"var(--v4-chart-3)","not started":NEUTRAL_SLICE,overdue:"var(--destructive)"};
export const PATHWAY_SEQUENCE = BLUE_7;
