// Notifications for the demo student, Jordan. Instagram-shaped: who, what,
// when, one tap to the thing. Two sets: high school (plan steps, résumé,
// Connect) and college (the same plus the mentorship program, meetings,
// chat). Mentorship and video calls are strictly college, so a high-school
// demo never sees them (direct instruction, 18 Sept 2026).

import { PARTNER_PORTRAITS } from "@/components/connect/primitives";

export type NotificationAction = { key: string; label: string; kind: "primary" | "quiet" };
export type Notification = {
  id: string;
  scope: "app" | "connect" | "mentorship";
  /** only for one stage; mentorship items are college regardless */
  stage?: "hs" | "college";
  /** a person's portrait, or an icon key for app events */
  avatar?: string;
  icon?: "xp" | "resume" | "opportunity" | "plan" | "insight";
  who?: string;
  text: string;
  /** the second line: a message snippet, a meeting time, a deadline */
  detail?: string;
  when: string;
  href: string;
  /** opens the chat dock as well as navigating */
  chat?: boolean;
  actions?: NotificationAction[];
  /** what the card says once an action has been taken */
  resolvedText?: Record<string, string>;
};

const MENTORSHIP = "/connect?tab=mentorship&program=coach";
const ATT = "/connect?board=att-connected-learning-centers";

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n-meeting",
    scope: "mentorship",
    avatar: "/images/connect/avatars/pro-doyle-2.png",
    who: "Avery Thompson",
    text: "proposed a meeting",
    detail: "Career check-in · Thu, Oct 30 · 5:00 PM · Teams",
    when: "2h",
    href: `${MENTORSHIP}&sub=messages`,
    chat: true,
    actions: [{ key: "accepted", label: "Accept", kind: "primary" }, { key: "declined", label: "Decline", kind: "quiet" }],
    resolvedText: { accepted: "Accepted · on your calendar", declined: "Declined · suggest another time in chat" },
  },
  {
    id: "n-answer",
    scope: "connect",
    avatar: PARTNER_PORTRAITS["Calvin Lee"],
    who: "Calvin Lee",
    text: "answered your question",
    detail: "“What should I learn now if I want to work in cybersecurity?”",
    when: "1d",
    href: `${ATT}`,
  },
  {
    id: "n-plan",
    scope: "mentorship",
    icon: "plan",
    text: "November is live in your Year Plan",
    detail: "Explore Careers · discuss one Dreamari career with Avery",
    when: "1d",
    href: `${MENTORSHIP}&sub=plan`,
  },
  {
    id: "n-opportunity",
    scope: "connect",
    icon: "opportunity",
    text: "AT&T Technology Internship closes Jan 31",
    detail: "You saved it · applications open now",
    when: "2d",
    href: `${ATT}`,
  },
  {
    id: "n-plan-hs",
    scope: "app",
    stage: "hs",
    icon: "plan",
    text: "Fall steps are open in your Grade 11 plan",
    detail: "1 of 3 done · Professional Readiness",
    when: "1d",
    href: "/profile?tab=plan",
  },
  {
    id: "n-report",
    scope: "app",
    stage: "hs",
    icon: "insight",
    text: "Your Career Report has a new route",
    detail: "Investment Banking · community college transfer path added",
    when: "2d",
    href: "/profile?tab=report",
  },
  {
    id: "n-resume",
    scope: "app",
    icon: "resume",
    text: "Your résumé scored 78 on the ATS check",
    detail: "One tip left to reach Strong Match",
    when: "3d",
    href: "/profile?tab=resume",
  },
  {
    id: "n-xp",
    scope: "app",
    icon: "xp",
    text: "+20 XP · Cybersecurity: Think Like a Defender",
    detail: "Dream Score 120",
    when: "3d",
    href: "/profile",
  },
  {
    id: "n-follow",
    scope: "connect",
    avatar: "/images/connect/avatars/pro-chen.jpg",
    who: "David Chen",
    text: "posted",
    detail: "“The thing I still lean on most is asking better questions.”",
    when: "2d",
    href: "/connect?following=1",
  },
  {
    id: "n-insight",
    scope: "connect",
    avatar: PARTNER_PORTRAITS["Nisha Patel"],
    who: "Nisha Patel",
    text: "posted an insight",
    detail: "“What surprised you most about working in AI?”",
    when: "4d",
    href: `${ATT}`,
  },
];

/** Unread by default: the meeting (college), the plan (high school), the answer and the newest post. */
export const UNREAD_BY_DEFAULT = ["n-meeting", "n-plan-hs", "n-answer", "n-follow"];
