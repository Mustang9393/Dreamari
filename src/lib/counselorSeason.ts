// The school counseling calendar (Counselor Dashboard v3, 29 Sept 2026).
// The research's point: a counselor's year runs on a calendar, and the
// dashboard's home should change its focus with it instead of showing the
// same cards in September and in May. Four seasons, each with the job it
// is about; the Overview's season strip reads this.
//
// The season comes from today's date. `?season=fall|winter|spring|summer`
// previews another one (DEMO-ONLY, for reviewing the strip).

export type Season = "fall" | "winter" | "spring" | "summer";

export const SEASONS: Record<Season, { label: string; focus: string; months: string }> = {
  fall: { label: "Fall", focus: "Applications, letters and the FAFSA", months: "Aug to Nov" },
  winter: { label: "Winter", focus: "Financial aid and course registration", months: "Dec to Feb" },
  spring: { label: "Spring", focus: "Decisions and graduation checks", months: "Mar to May" },
  summer: { label: "Summer", focus: "Getting every senior enrolled", months: "Jun to Jul" },
};

export function seasonFor(d: Date): Season {
  const m = d.getMonth();
  if (m >= 7 && m <= 10) return "fall";
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "spring";
  return "summer";
}

export function currentSeason(): Season {
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search).get("season");
    if (p === "fall" || p === "winter" || p === "spring" || p === "summer") return p;
  }
  return seasonFor(new Date());
}
