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
const NET_STAFF = {
  Lin: { name: "Lin", role: "Mentor programs", office: "Palm Beach" },
  Ben: { name: "Ben", role: "Youth programs", office: "Salt Lake" },
  Ana: { name: "Ana", role: "Student success", office: "Orange County" },
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
    { id: "mi-t-mlk-leads", kind: "ask", channel: "events", author: MI_STAFF.Kim, postedAgo: "5h ago", title: "MLK Day in Flint: two more leads?", body: "We have 120 spots and need two more group leads.", replies: [{ author: MI_STAFF.Rae, body: "I can drive over and lead one group.", postedAgo: "3h ago" }] },
  ],
  [UW_ID]: [
    { id: "uw-t-call", kind: "update", channel: "general", author: NET_STAFF.Lin, postedAgo: "4h ago", title: "Quarterly call is Nov 6 at 1 PM ET", body: "Each United Way shares one win and one ask. Five minutes each.", replies: [{ author: NET_STAFF.Ben, body: "Salt Lake is in.", postedAgo: "2h ago" }] },
    { id: "uw-t-deloitte", kind: "update", channel: "partners", author: NET_STAFF.Ben, postedAgo: "1d ago", title: "Deloitte can staff the Nov 12 résumé night", body: "Nine volunteers, all cleared. Online, so every city can join.", replies: [] },
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
