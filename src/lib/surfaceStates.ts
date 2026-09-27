// The 62 data-backed surfaces (docs/handoff/COMPONENT_INVENTORY.md, section 1)
// and the copy each one shows when it is loading, slow, failed, empty or not
// found. One registry so the real screens (via <SurfaceState id={n}>) and the
// Component Lab's States gallery render the exact same states and words.
// `load` / `error` / `empty` record what existed before 27 Sept 2026 (the
// inventory's audit); every surface now renders all of them through
// SurfaceState.

export type SurfaceStatus = "built" | "missing" | "na";
export type EmptyTier = 1 | 2 | 3 | 4 | 5 | 6;
export type LoadShape = "cards" | "list" | "chip" | "button";

export interface SurfaceRow {
  n: number;
  surface: string;
  file: string;
  load: SurfaceStatus;
  error: SurfaceStatus;
  empty: SurfaceStatus;
  note?: string;
  emptyTier?: EmptyTier;
  emptyCopy?: { heading?: string; line?: string; cta?: string; query?: string };
  errorVerb?: string;
  errorFallback?: string;
  loadLabel?: string;
  loadShape?: LoadShape;
}

// ---------------------------------------------------------------------------
// The 62 data-backed surfaces, copied from docs/handoff/COMPONENT_INVENTORY.md
// section 1's table. built/missing/na match the table's ✓ / — / (n/a) marks
// exactly; everything else (copy, tier, verb) is authored for this gallery.

export const SURFACES: SurfaceRow[] = [
  { n: 1, surface: "Home hero banner", file: "app/HomeExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "wired 27 Sept 2026: SurfaceState around HeroBanner (fixed editorial panels, so isEmpty never fires; enables ?state= demoing)", emptyTier: 2, emptyCopy: { heading: "Nothing to feature yet", line: "Once you save a few careers, this banner highlights one of them.", cta: "Explore careers" }, errorVerb: "load your home banner", loadShape: "chip" },
  { n: 2, surface: "Home rails (picks)", file: "app/HomeExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "wired 27 Sept 2026", emptyTier: 2, emptyCopy: { heading: "No picks yet", line: "Save a few careers and they show up here.", cta: "Explore careers" }, errorVerb: "load your picks", loadLabel: "Loading picks", loadShape: "cards" },
  { n: 3, surface: "Home activity card", file: "app/HomeExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "reads progress; wired 27 Sept 2026 (ACTIVITIES is a fixed constant, so isEmpty never fires)", emptyTier: 2, emptyCopy: { heading: "No activity yet", line: "Once you start exploring, your progress shows up here.", cta: "Explore careers" }, errorVerb: "load your activity", loadShape: "chip" },
  { n: 4, surface: "Explore For You reel", file: "app/ExploreExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "video with sound; wired 27 Sept 2026", emptyTier: 2, emptyCopy: { heading: "Nothing to watch yet", line: "Careers picked for you show up here as short videos.", cta: "Browse careers" }, errorVerb: "load your reel", loadShape: "cards" },
  { n: 5, surface: "Explore Browse / poster rails", file: "app/ExploreExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "wired 27 Sept 2026: every named rail (Recommended, Tech & Engineering, Might Not Know, Skilled Trades, Public Service, Typical Pay, Arts) now keeps its heading and shows this empty instead of vanishing", emptyTier: 2, emptyCopy: { heading: "No careers to show yet", line: "This category doesn't have careers loaded yet.", cta: "See all careers" }, errorVerb: "load these careers", loadShape: "cards" },
  { n: 6, surface: "Trending rail", file: "app/ExploreExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "wired 27 Sept 2026", emptyTier: 2, emptyCopy: { heading: "Nothing trending yet", line: "Check back once more students start exploring.", cta: "Explore careers" }, errorVerb: "load what's trending", loadShape: "cards" },
  { n: 7, surface: "Global search results", file: "app/GlobalSearch.tsx", load: "missing", error: "missing", empty: "built", note: "wired 27 Sept 2026: SurfaceState around results, its own zero-match copy kept", emptyTier: 5, errorVerb: "search", loadLabel: "Searching", loadShape: "list" },
  { n: 8, surface: "Company video cards", file: "app/CompanyVideoCards.tsx", load: "missing", error: "missing", empty: "missing", note: "wired 27 Sept 2026: rail SurfaceState + per-card video onError", emptyTier: 2, emptyCopy: { heading: "No videos yet", line: "Videos from companies show up here as they're added.", cta: "See all careers" }, errorVerb: "load these videos", loadShape: "cards" },
  { n: 9, surface: "Career Detail page", file: "career/CareerDetailExperience.tsx", load: "missing", error: "missing", empty: "built", note: "\"Coming soon\" for thin careers", emptyTier: 6, errorVerb: "load this career", loadShape: "chip" },
  { n: 10, surface: "Pay map", file: "career/PayMap.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 3, emptyCopy: { line: "No pay data for this location yet." }, errorVerb: "load the pay map", loadShape: "chip" },
  { n: 11, surface: "Similar careers", file: "career/CareerDetailExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "No similar careers yet", line: "Related careers show up here once they're linked.", cta: "Explore careers" }, errorVerb: "load similar careers", loadShape: "cards" },
  { n: 12, surface: "Colleges browse shelves", file: "colleges/BrowseShelves.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "No schools to show yet", line: "This shelf doesn't have schools loaded yet.", cta: "See all schools" }, errorVerb: "load these schools", loadShape: "cards" },
  { n: 13, surface: "For You schools", file: "colleges/ForYouSchools.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "No picks yet", line: "Schools picked for you show up here.", cta: "Explore colleges" }, errorVerb: "load your picks", loadShape: "cards" },
  { n: 14, surface: "College grid + filters", file: "colleges/CollegesExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "no \"no matches\" state confirmed", emptyTier: 5, emptyCopy: { line: "Try removing a filter, like tuition or distance.", query: "in-state under $20k" }, errorVerb: "load these schools", loadShape: "cards" },
  { n: 15, surface: "College detail", file: "colleges/CollegeDetailExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "synthDetail fills gaps", emptyTier: 1, emptyCopy: { heading: "This school isn't set up yet", line: "Check back soon, or explore another school.", cta: "See other schools" }, errorVerb: "load this school", loadShape: "chip" },
  { n: 16, surface: "College compare sheet", file: "colleges/CollegesExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 3, emptyCopy: { line: "Add a school to compare it here." }, errorVerb: "load your comparison", loadShape: "list" },
  { n: 17, surface: "Match (Mini Explore) grid", file: "flow-lab/V2Flow.tsx", load: "missing", error: "missing", empty: "missing", note: "a world with no careers renders blank", emptyTier: 1, emptyCopy: { heading: "Nothing to match yet", line: "This world doesn't have careers loaded yet.", cta: "Choose another world" }, errorVerb: "load this world", loadShape: "cards" },
  { n: 18, surface: "Match picks tray", file: "flow-lab/shared.tsx", load: "na", error: "na", empty: "built", note: "empty slots" },
  { n: 19, surface: "Profile Top Three", file: "profile/ProfileExperience.tsx Top3Tab", load: "missing", error: "missing", empty: "built", note: "tier 1", errorVerb: "load your Top 3", loadShape: "cards" },
  { n: 20, surface: "Profile Overview", file: "profile/ProfileExperience.tsx OverviewTabV2", load: "missing", error: "missing", empty: "built", note: "NothingSavedYet", errorVerb: "load your overview", loadShape: "chip" },
  { n: 21, surface: "Profile Routes", file: "profile/ProfileExperience.tsx RoutesTab", load: "missing", error: "missing", empty: "missing", note: "returns null with no focus", emptyTier: 2, emptyCopy: { heading: "No routes yet", line: "Pick a focus career and its routes show up here.", cta: "Choose a focus" }, errorVerb: "load your routes", loadShape: "list" },
  { n: 22, surface: "Profile My Plan", file: "profile/ProfileExperience.tsx MyPlanTab", load: "missing", error: "missing", empty: "missing", emptyTier: 1, emptyCopy: { heading: "Nothing planned yet", line: "Save a career and your plan builds itself.", cta: "Explore careers" }, errorVerb: "load your plan", loadShape: "list" },
  { n: 23, surface: "Career Report document", file: "profile/CareerReport.tsx", load: "missing", error: "missing", empty: "missing", note: "returns null with no report data", emptyTier: 4, emptyCopy: { heading: "Nothing to report yet", line: "Choose a career first, and your report builds from there.", cta: "Choose a career" }, errorVerb: "load this report", loadShape: "chip" },
  { n: 24, surface: "Report history", file: "CareerReport.tsx HistoryTab", load: "missing", error: "missing", empty: "built", errorVerb: "load your version history", loadShape: "list" },
  { n: 25, surface: "Career exploration (experiences)", file: "profile/CareerExploration.tsx", load: "missing", error: "missing", empty: "built", errorVerb: "load your experiences", loadShape: "list" },
  { n: 26, surface: "Career Locker shelves", file: "ProfileExperience.tsx", load: "missing", error: "missing", empty: "built", note: "tier 2 dashed", errorVerb: "load your locker", loadShape: "cards" },
  { n: 27, surface: "Saved schools / videos shelves", file: "ProfileExperience.tsx", load: "missing", error: "missing", empty: "missing", note: "not confirmed", emptyTier: 2, emptyCopy: { heading: "Nothing saved here yet", line: "Save a school or a video and it shows up here.", cta: "Browse and save some" }, errorVerb: "load what you saved", loadShape: "cards" },
  { n: 28, surface: "Preferences", file: "profile/PreferencesTab.tsx", load: "built", error: "built", empty: "missing", note: "?prefs=", emptyTier: 3, emptyCopy: { line: "Nothing set yet. Open any row to add your preferences." } },
  { n: 29, surface: "Event stubs", file: "profile/EventStubs.tsx", load: "missing", error: "missing", empty: "built", errorVerb: "load your stubs", loadShape: "cards" },
  { n: 30, surface: "Settings", file: "ProfileExperience.tsx SettingsView", load: "missing", error: "missing", empty: "na", errorVerb: "load your settings", loadShape: "chip" },
  { n: 31, surface: "Report chooser", file: "report/ReportChooser.tsx", load: "missing", error: "missing", empty: "built", note: "tier 4", errorVerb: "load your careers", loadShape: "cards" },
  { n: 32, surface: "Resume versions list", file: "resume/ResumeExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "No versions yet", line: "Save a version and it shows up here.", cta: "Save a version" }, errorVerb: "load your resume versions", loadShape: "list" },
  { n: 33, surface: "Resume document", file: "resume/ResumeDocument.tsx", load: "na", error: "na", empty: "built", note: "EmptyHint" },
  { n: 34, surface: "ATS check", file: "resume/ATSCheckPanel.tsx", load: "built", error: "built", empty: "na" },
  { n: 35, surface: "Job match", file: "resume/JobMatchPanel.tsx", load: "built", error: "built", empty: "na", note: "real POST" },
  { n: 36, surface: "Tailor", file: "resume/TailorScreen.tsx", load: "built", error: "built", empty: "na", note: "real POST" },
  { n: 37, surface: "Experience bullets", file: "resume/ExperienceModal.tsx", load: "built", error: "built", empty: "na", note: "real POST" },
  { n: 38, surface: "Export checklist", file: "resume/ExportChecklistModal.tsx", load: "built", error: "missing", empty: "na", note: "\"Preparing…\"", errorVerb: "prepare this file" },
  { n: 39, surface: "Resume wizard steps", file: "resume/wizardSteps.tsx", load: "missing", error: "missing", empty: "built", note: "EmptyStateAdd", errorVerb: "load this section", loadShape: "list" },
  { n: 40, surface: "Connect question feed", file: "connect/ConnectExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 1, emptyCopy: { heading: "No questions yet", line: "Be the first to ask something in this community.", cta: "Ask a question" }, errorVerb: "load these questions", loadShape: "list" },
  { n: 41, surface: "Connect insights", file: "ConnectExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "No insights yet", line: "Saved careers, simulations and majors show up here as students explore.", cta: "Explore Connect" }, errorVerb: "load your insights", loadShape: "list" },
  { n: 42, surface: "Communities", file: "connect/CommunityCard.tsx", load: "missing", error: "missing", empty: "missing", note: "image fallback only", emptyTier: 2, emptyCopy: { heading: "No communities yet", line: "Communities show up here as your school adds them.", cta: "Browse communities" }, errorVerb: "load communities", loadShape: "cards" },
  { n: 43, surface: "People tab", file: "connect/PeopleTab.tsx", load: "missing", error: "missing", empty: "missing", note: "first-use welcome only", emptyTier: 1, emptyCopy: { heading: "No professionals yet", line: "Professionals join as your school connects with more of them.", cta: "Explore Connect" }, errorVerb: "load professionals", loadShape: "cards" },
  { n: 44, surface: "New from following", file: "connect/ProProfile.tsx", load: "missing", error: "missing", empty: "built", errorVerb: "load what's new", loadShape: "list" },
  { n: 45, surface: "Events / tickets", file: "ConnectExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "No events yet", line: "Events show up here as your school schedules them.", cta: "Browse events" }, errorVerb: "load events", loadShape: "cards" },
  { n: 46, surface: "Your questions", file: "ConnectExperience.tsx", load: "missing", error: "missing", empty: "built", errorVerb: "load your questions", loadShape: "list" },
  { n: 47, surface: "Thread / answers", file: "ConnectExperience.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 3, emptyCopy: { line: "No replies yet. Be the first to answer." }, errorVerb: "load this thread", loadShape: "list" },
  { n: 48, surface: "Connect not found", file: "ConnectExperience.tsx ConnectNotFound", load: "na", error: "built", empty: "na", note: "404" },
  { n: 49, surface: "AT&T board", file: "connect/att/AttCommunityView.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 2, emptyCopy: { heading: "Nothing posted yet", line: "Be the first to start a conversation here.", cta: "Start the conversation" }, errorVerb: "load this board", loadShape: "list" },
  { n: 50, surface: "Mentorship chat / meetings", file: "connect/mentorship/MentorshipTab.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 3, emptyCopy: { line: "No messages yet. Say hello to get started." }, errorVerb: "load your messages", loadShape: "list" },
  { n: 51, surface: "Pro / Admin dashboards", file: "connect/ProDashboardView, AdminDashboardView", load: "missing", error: "missing", empty: "missing", emptyTier: 1, emptyCopy: { heading: "Nothing to show yet", line: "Once there's activity across your community, it shows up here.", cta: "Refresh" }, errorVerb: "load this dashboard", loadShape: "cards" },
  { n: 52, surface: "Play hub rows", file: "play/PlayHub.tsx", load: "missing", error: "missing", empty: "missing", note: "locked \"Coming soon\" covers unbuilt games", emptyTier: 2, emptyCopy: { heading: "Nothing here yet", line: "This row's games are still being added.", cta: "See all games" }, errorVerb: "load this row", loadShape: "cards" },
  { n: 53, surface: "Simulation player", file: "play/SimulationPlayer.tsx", load: "missing", error: "missing", empty: "na", note: "no level-load or audio-fail state", errorVerb: "load this simulation", loadShape: "chip" },
  { n: 54, surface: "Glossary game", file: "glossary/GlossaryGameExperience.tsx", load: "built", error: "missing", empty: "na", note: "MasteryLoadingScreen", errorVerb: "check your mastery" },
  { n: 55, surface: "Levels map", file: "glossary/LevelsMenu.tsx", load: "missing", error: "missing", empty: "missing", note: "renders nothing with 0 levels", emptyTier: 1, emptyCopy: { heading: "No levels yet", line: "This theme's levels are still being built.", cta: "Choose another theme" }, errorVerb: "load these levels", loadShape: "cards" },
  { n: 56, surface: "Notifications inbox", file: "app/Inbox.tsx", load: "missing", error: "missing", empty: "missing", note: "wired 27 Sept 2026: SurfaceState around the New/Earlier list", emptyTier: 3, emptyCopy: { line: "You're all caught up." }, errorVerb: "load your notifications", loadLabel: "Loading notifications", loadShape: "list" },
  { n: 57, surface: "Dream Score chip", file: "app/DreamScoreChip.tsx", load: "missing", error: "missing", empty: "na", note: "streak hardcoded 12", errorVerb: "load your streak", loadShape: "chip" },
  { n: 58, surface: "Counselor v2 screens", file: "counselor/v2/states.tsx StateGate", load: "built", error: "built", empty: "built", note: "?state=" },
  { n: 59, surface: "Counselor drill panels", file: "counselor/v2/Drill.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 3, emptyCopy: { line: "Nothing to drill into yet." }, errorVerb: "load this drill", loadShape: "list" },
  { n: 60, surface: "Counselor documents", file: "counselor/v2/DocumentDesk.tsx", load: "missing", error: "missing", empty: "built", note: "\"Choose a student\" ghost", errorVerb: "load this document", loadShape: "chip" },
  { n: 61, surface: "Counselor roster filters", file: "counselor/v2/StudentsRoster.tsx", load: "missing", error: "missing", empty: "missing", note: "covered only screen-wide", emptyTier: 5, emptyCopy: { line: "Try a different grade or status.", query: "grade 12, at risk" }, errorVerb: "load the roster", loadShape: "list" },
  { n: 62, surface: "Principal report", file: "counselor/v2/CounselorImpact.tsx", load: "missing", error: "missing", empty: "missing", emptyTier: 4, emptyCopy: { heading: "Nothing to report yet", line: "Once schools have activity, the district report builds itself.", cta: "View schools" }, errorVerb: "load this report", loadShape: "cards" },
];

export function surfaceById(n: number): SurfaceRow | undefined {
  return SURFACES.find((s) => s.n === n);
}
