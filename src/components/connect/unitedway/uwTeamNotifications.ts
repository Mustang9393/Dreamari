// What the bell shows for the United Way Team role: a direct message and a
// few channel posts, each opening the Team dock on that conversation.
// Kept to plain strings (no United Way data imports) so the nav can load it
// for everyone without pulling the board.
// DEMO-ONLY: mirrors the seed posts in uwTeamSeeds.ts; staff only, never a student.

import type { Notification } from "@/components/app/notificationsData";

export const TEAM_NOTIFICATIONS: Notification[] = [
  { id: "uwteam-dm-dana", scope: "connect", icon: "message", who: "Dana", text: "sent you a message", detail: "Can you grab the chairs Friday at 2?", when: "1h", href: "#team", teamKey: "dm:Dana" },
  { id: "uwteam-ww-retail", scope: "connect", icon: "message", who: "Owen, Manchester", text: "asked in All United Ways", detail: "A national retailer wants 400 volunteers in 30 offices", when: "8h", href: "#team", teamKey: "ch:ww-partners" },
  { id: "uwteam-ww-mentors", scope: "connect", icon: "message", who: "Ben, Salt Lake", text: "asked in All United Ways", detail: "How do you find mentors in small towns?", when: "5h", href: "#team", teamKey: "ch:ww-youth" },
];
