// Where Save / Top 3 CTAs across the app send a student. My Profile used to
// have a v1/v2 layout switch here (30 Sept to 4 Oct 2026); v2 won and v1 was
// removed (Chandu, 4 Oct 2026: "V2 is finalised right? lets remove v1"), so
// these are plain links now. `from=saved` asks the profile to show the way
// to Saved: it lands on Top 3, then slides to Saved (ProfileExperience.tsx,
// runSavedReveal).

export function savedHref(): string {
  return "/profile?tab=locker&from=saved";
}
export function top3Href(): string {
  return "/profile?tab=top3";
}
