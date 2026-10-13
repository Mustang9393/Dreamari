// United Way events on Connect's own event board (12 Oct 2026).
//
// WHY: the client asked for "a space like our events tab where participants
// could keep the conversation going after events were done", and Chandu
// asked to "use the same design language and components as our events
// tab". So a United Way event is not a lookalike card and sheet any more:
// it becomes an EventBoard, the type Connect's Events tab and event board
// already render. The board's Events tab shows it as the same EventTicket;
// tapping it opens the same EventView (`/connect?event=<id>`), which shows
// a page before the day (details, going, Remind me) and, once the event
// has happened, the follow-up board: Questions, Posts, Pro posts,
// Resources, People, About. United Way keeps its brand blue (partnerAccent
// reads COMPANY_BRAND["United Way"]) and its own mark in the lockup.
//
// Kept out of data.ts on purpose: the boards import PROS from data.ts, so
// data.ts importing this file would be a cycle.

import type { EventBoard } from "../data";
import { NETWORK, type UwBoard, type UwEvent } from "./uwData";
import { MICHIGAN } from "./uwMichigan";
import { SOUTH_CENTRAL } from "./uwSouthCentral";

const FULL_MONTH: Record<string, string> = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };

/** The staff debrief for a past event (a Team post with its eventId). */
function debriefFor(e: UwEvent, board: UwBoard): EventBoard["debrief"] {
  const p = board.staff.posts.find((x) => x.eventId === e.id);
  if (!p) return undefined;
  return { by: p.author.name, role: p.author.role, office: p.author.office, postedAgo: p.postedAgo, title: p.title, body: p.body, worked: p.worked ?? [], numbers: p.numbers ?? [], next: p.next ?? [], replies: p.replies.length };
}

/** One United Way event as an EventBoard. */
export function toEventBoard(e: UwEvent, board: UwBoard): EventBoard {
  const f = e.followUp;
  const chapter = board.chapters.find((c) => c.id === e.chapter);
  return {
    id: e.id,
    name: e.title,
    host: "United Way",
    lead: "United Way",
    date: `${FULL_MONTH[e.date.month] ?? e.date.month} ${e.date.day}, ${e.date.year}`,
    time: e.date.time,
    location: e.virtual ? "Online" : e.where,
    lifecycle: f ? "Active follow-up" : "Upcoming",
    closesOn: f?.closesOn,
    orgs: [chapter?.name ?? board.org, "Dreamari"],
    topics: [e.kind, ...(e.world ? [e.world] : [])],
    students: f?.students,
    pros: f?.pros,
    postCount: f?.posts,
    // 13 Oct 2026, Chandu: "Events: Have them require a code to enter. When
    // entered, make it look like our other event boards, have a gallery
    // with photos". So a past event's board is locked until its attendee
    // code is entered (Connect's own EventCodeSheet; the unlock is shared
    // with Connect's Your events), then opens as the full event board with
    // its photo gallery under Resources. DEMO-ONLY: the code is shown in
    // the sheet's prototype hint and on the staff ticket.
    entitled: false,
    code: f?.code,
    photos: f?.photos,
    recap: f?.recap,
    resources: f?.resources,
    official: f?.official && { ...f.official, communityId: board.id, communityName: board.name, photosLabel: "Event photos", by: board.org, mark: "United Way" },
    going: e.going,
    about: e.about,
    who: e.who,
    proIds: f?.proIds ?? board.volunteerIds.slice(0, 4),
    access: "Attendees + United Way volunteers",
    boardId: board.id,
    debrief: debriefFor(e, board),
  };
}

/** Every United Way board's events, for the event route and its threads. */
export const UW_EVENT_BOARDS: EventBoard[] = [NETWORK, MICHIGAN, SOUTH_CENTRAL].flatMap((b) => b.events.map((e) => toEventBoard(e, b)));

// What United Way posts from its own view (the Post tool) opens on the
// same event page; DEMO-ONLY: kept in memory for the session.
const posted: EventBoard[] = [];
export function registerUwEvent(e: UwEvent, board: UwBoard) {
  if (!posted.some((p) => p.id === e.id)) posted.push(toEventBoard(e, board));
}
export function uwEventById(id: string): EventBoard | undefined {
  return UW_EVENT_BOARDS.find((e) => e.id === id) ?? posted.find((e) => e.id === id);
}
