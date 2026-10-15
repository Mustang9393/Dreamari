// The United Way Team workspace's own seeds (15 Oct 2026).
//
// WHY: Maisha's review asked for "a private internal workspace, invisible
// to students and corporate volunteers. Include a General channel for
// organization-wide updates and dedicated communities for departments or
// teams, similar to Slack. Allow private colleague-to-colleague messaging
// where appropriate, but not private messaging between adults and
// students." The staff posts already on each board (board.staff.posts,
// minus the public announcements) are the channels' messages; this file
// adds what the channels were missing (General and Partnerships had little)
// and a few direct messages between colleagues. Staff to staff only: a DM
// can only ever name someone in the board's own staff.
// DEMO-ONLY: every message below, by first name and role.

import type { StaffPost } from "./uwData";
import { UW_ID } from "./uwData";
import { UW_MI_ID } from "./uwMichigan";
import { UW_SC_ID } from "./uwSouthCentral";

const SC_STAFF = {
  Chris: { name: "Chris", role: "Youth programs", office: "Kalamazoo" },
  Jess: { name: "Jess", role: "Community impact", office: "Kalamazoo" },
  Dana: { name: "Dana", role: "Community impact", office: "Battle Creek" },
  Rob: { name: "Rob", role: "Events", office: "Lansing" },
  Tess: { name: "Tess", role: "Volunteer center", office: "Jackson" },
  Maya: { name: "Maya", role: "Youth programs", office: "Lansing" },
};
const MI_STAFF = {
  Lee: { name: "Lee", role: "Youth programs", office: "Southeast Michigan" },
  Kim: { name: "Kim", role: "Volunteer center", office: "Genesee" },
  Pat: { name: "Pat", role: "Youth programs", office: "West Michigan" },
  Rae: { name: "Rae", role: "Volunteer center", office: "Lakeshore" },
};
const MI_ME = { name: "Alex", role: "Youth programs", office: "South Central" };
const MI_JO = { name: "Jo", role: "Community impact", office: "Marquette" };
const NET_STAFF = {
  Lin: { name: "Lin", role: "Mentor programs", office: "Palm Beach" },
  Ben: { name: "Ben", role: "Youth programs", office: "Salt Lake" },
  Ana: { name: "Ana", role: "Student success", office: "Orange County" },
  Alex: { name: "Alex", role: "Youth programs", office: "Orange County" },
};

export const TEAM_EXTRA: Record<string, StaffPost[]> = {
  [UW_SC_ID]: [
    { id: "sc-t-photos", kind: "ask", channel: "general", author: SC_STAFF.Dana, postedAgo: "5h ago", title: "Annual report photos are due Nov 1", body: "Please add your three best photos from this fall. Only photos where families said yes.", replies: [{ author: SC_STAFF.Chris, body: "Adding three from the kickoff tonight.", postedAgo: "3h ago" }] },
    { id: "sc-t-board", kind: "update", channel: "general", author: SC_STAFF.Jess, postedAgo: "1d ago", title: "Board meeting moved to Nov 20", body: "Same room, 9 AM. Each office gets five minutes for its fall update.", replies: [] },
    { id: "sc-t-consumers", kind: "update", channel: "partners", author: SC_STAFF.Rob, postedAgo: "6h ago", title: "Consumers Energy is sending 12 volunteers", body: "They want to help at the Nov 14 convening. Their checks are done.", replies: [{ author: SC_STAFF.Tess, body: "Adding them to the sign-in sheet now.", postedAgo: "4h ago" }] },
    { id: "sc-t-western", kind: "update", channel: "partners", author: SC_STAFF.Jess, postedAgo: "2d ago", title: "Western said yes to the college table", body: "They will bring two advisors and info on service learning classes.", replies: [{ author: SC_STAFF.Chris, body: "Great. Michigan State confirmed too.", postedAgo: "2d ago" }] },
  ],
  [UW_MI_ID]: [
    { id: "mi-t-ford", kind: "update", channel: "partners", author: MI_STAFF.Lee, postedAgo: "1d ago", title: "Ford's youth team wants to judge the spring project fair", body: "Four judges, one afternoon in April. Who wants them?", replies: [{ author: MI_STAFF.Pat, body: "West Michigan would love two.", postedAgo: "20h ago" }] },
    // 15 Oct 2026: at least three threads in every channel (Chandu)
    { id: "mi-t-budget", kind: "update", channel: "general", author: MI_STAFF.Lee, postedAgo: "6h ago", title: "Youth budget numbers are due Nov 3", body: "One page per United Way: what you spent on teen programs and what you need next year.", replies: [{ author: MI_JO, body: "Marquette will send ours Friday.", postedAgo: "4h ago" }] },
    { id: "mi-t-holiday", kind: "update", channel: "general", author: MI_STAFF.Rae, postedAgo: "1d ago", title: "Offices close Nov 26 and 27", body: "Please post any events that week here so we can cover them.", replies: [] },
    { id: "mi-t-suw-agenda", kind: "resource", channel: "youth", author: MI_STAFF.Pat, postedAgo: "2d ago", title: "First-meeting agenda for a new Student United Way", body: "The agenda West Michigan uses for a group's first meeting. Copy it for yours.", resource: { label: "First-meeting agenda", meta: "Doc · 1 page" }, replies: [{ author: MI_JO, body: "Using this for Marquette in January. Thank you!", postedAgo: "1d ago" }] },
    { id: "mi-t-teen-council", kind: "idea", channel: "youth", author: MI_STAFF.Lee, postedAgo: "3d ago", title: "A statewide teen council?", body: "Two students from each United Way could meet online once a month and share what works.", replies: [{ author: MI_STAFF.Pat, body: "Yes. Our committee leads would love it.", postedAgo: "3d ago" }, { author: MI_ME, body: "South Central can host the first call.", postedAgo: "2d ago" }] },
    { id: "mi-t-checks", kind: "update", channel: "volunteer", author: MI_STAFF.Kim, postedAgo: "4h ago", title: "Background checks now take three days", body: "New volunteers for MLK Day should start their checks this week.", replies: [] },
    { id: "mi-t-sled", kind: "ask", channel: "volunteer", author: MI_STAFF.Rae, postedAgo: "1d ago", title: "Who has extra sled-day volunteers?", body: "Stuff the Sled in Grand Rapids needs 12 more adults on Nov 21.", replies: [{ author: MI_STAFF.Lee, body: "Detroit can send six from our corporate teams.", postedAgo: "20h ago" }] },
    { id: "mi-t-mcq", kind: "update", channel: "events", author: MI_STAFF.Rae, postedAgo: "2d ago", title: "MiCareerQuest still needs booths", body: "24 volunteer booths are still open for Nov 18. Please share the sign-up with your teams.", replies: [{ author: MI_STAFF.Pat, body: "Great work, Lakeshore.", postedAgo: "2d ago" }] },
    { id: "mi-t-bank", kind: "update", channel: "partners", author: MI_JO, postedAgo: "5h ago", title: "A local bank will fund 50 backpacks in Marquette", body: "They asked for a short thank-you note from students. I'll gather them.", replies: [] },
    { id: "mi-t-colleges", kind: "ask", channel: "partners", author: MI_STAFF.Pat, postedAgo: "2d ago", title: "Which colleges came to your fall events?", body: "We want a shared list so every United Way can invite them in spring.", replies: [{ author: MI_STAFF.Kim, body: "Flint had Kettering and Mott. Adding them to the sheet.", postedAgo: "1d ago" }] },
    { id: "mi-t-mlk-leads", kind: "ask", channel: "events", author: MI_STAFF.Kim, postedAgo: "5h ago", title: "MLK Day in Flint: two more leads?", body: "We have 120 spots and need two more group leads.", replies: [{ author: MI_STAFF.Rae, body: "I can drive over and lead one group.", postedAgo: "3h ago" }] },
  ],
  [UW_ID]: [
    { id: "uw-t-call", kind: "update", channel: "general", author: NET_STAFF.Lin, postedAgo: "4h ago", title: "Quarterly call is Nov 6 at 1 PM ET", body: "Each United Way shares one win and one ask. Five minutes each.", replies: [{ author: NET_STAFF.Ben, body: "Salt Lake is in.", postedAgo: "2h ago" }] },
    { id: "uw-t-deloitte", kind: "update", channel: "partners", author: NET_STAFF.Ben, postedAgo: "1d ago", title: "Deloitte can staff the Nov 12 résumé night", body: "Nine volunteers, all cleared. Online, so every city can join.", replies: [] },
    // 15 Oct 2026: at least three threads in every channel (Chandu)
    { id: "uw-t-report", kind: "update", channel: "general", author: NET_STAFF.Ana, postedAgo: "1d ago", title: "Fall numbers are due Nov 10", body: "Students reached, mentor matches and hours. One line each, please.", replies: [{ author: NET_STAFF.Lin, body: "Palm Beach will post ours Monday.", postedAgo: "20h ago" }] },
    { id: "uw-t-welcome", kind: "update", channel: "general", author: NET_STAFF.Ben, postedAgo: "3d ago", title: "Miami joined the board this week", body: "Their Career Connections team will post here soon.", replies: [] },
    { id: "uw-t-advocate", kind: "idea", channel: "youth", author: NET_STAFF.Ben, postedAgo: "1d ago", title: "Pair advocates with e-Mentorship?", body: "Salt Lake advocates could hand seniors to Orange County mentors in spring.", replies: [{ author: NET_STAFF.Ana, body: "Let's try it with ten seniors first.", postedAgo: "20h ago" }] },
    { id: "uw-t-training", kind: "resource", channel: "volunteer", author: NET_STAFF.Lin, postedAgo: "3d ago", title: "Two-hour mentor training slides", body: "The training every Palm Beach mentor takes. Copy it for your volunteers.", resource: { label: "Mentor training", meta: "Slides · 18" }, replies: [{ author: NET_STAFF.Alex, body: "Using these for our December mentors.", postedAgo: "2d ago" }] },
    { id: "uw-t-thanks", kind: "update", channel: "volunteer", author: NET_STAFF.Ana, postedAgo: "5d ago", title: "Thank-you notes went out", body: "Every volunteer from mentor night got a note from a student.", replies: [] },
    { id: "uw-t-panel", kind: "update", channel: "events", author: NET_STAFF.Alex, postedAgo: "6h ago", title: "Oct 23 panel has four speakers", body: "A nurse, a banker, a recruiter and an electrician. 318 students said they're going.", replies: [{ author: NET_STAFF.Ben, body: "Salt Lake will share it with our seniors.", postedAgo: "4h ago" }] },
    { id: "uw-t-expo", kind: "ask", channel: "events", author: NET_STAFF.Lin, postedAgo: "2d ago", title: "Who can send mentors to the OnTrack expo?", body: "Bay Area needs 20 mentors in Oakland on Mar 14.", replies: [{ author: NET_STAFF.Ana, body: "Orange County can send five.", postedAgo: "1d ago" }] },
    { id: "uw-t-cvs", kind: "update", channel: "partners", author: NET_STAFF.Lin, postedAgo: "4h ago", title: "CVS Health will host the hospital job shadow", body: "Pharmacists and nurses for 96 students on Nov 20.", replies: [] },
    { id: "uw-t-amazon", kind: "ask", channel: "partners", author: NET_STAFF.Ana, postedAgo: "3d ago", title: "Anyone working with Amazon's volunteer team?", body: "They offered résumé reviewers for any city that asks.", replies: [{ author: NET_STAFF.Ben, body: "Yes, Salt Lake. I'll connect you.", postedAgo: "2d ago" }] },
    { id: "uw-t-checks", kind: "update", channel: "volunteer", author: NET_STAFF.Ana, postedAgo: "2d ago", title: "Checks now clear in three days", body: "Background checks are faster this month. New mentors can start sooner.", replies: [] },
  ],
};

/** Colleague direct messages: the board's own staff member ("me") and one
 *  colleague. `from` is a first name; "me" marks the viewer's own lines. */
export type TeamDm = { with: string; messages: { from: string; body: string; postedAgo: string }[] };
export const TEAM_DMS: Record<string, TeamDm[]> = {
  [UW_SC_ID]: [
    { with: "Dana", messages: [{ from: "Dana", body: "Can you grab the chairs Friday at 2?", postedAgo: "1h ago" }, { from: "me", body: "Yes. I'll bring the van.", postedAgo: "50m ago" }] },
    { with: "Chris", messages: [{ from: "Chris", body: "Thanks for the kickoff help. Families loved the name tags.", postedAgo: "1d ago" }] },
  ],
  [UW_MI_ID]: [
    { with: "Pat", messages: [{ from: "Pat", body: "Can South Central share its convening plan with us?", postedAgo: "3h ago" }, { from: "me", body: "Sure. I'll post it in Events.", postedAgo: "2h ago" }] },
  ],
  [UW_ID]: [
    { with: "Ana", messages: [{ from: "Ana", body: "Can you send me the mentor night numbers?", postedAgo: "2h ago" }] },
  ],
};
