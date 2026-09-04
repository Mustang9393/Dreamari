"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import { EVENTS, type EventBoard } from "@/components/connect/data";
import { EventMarks, EventSurface, QrBadge, QrSheet, partnerAccent } from "@/components/connect/ConnectExperience";
import { CARD_TEXT_SHADOW } from "@/components/app/cardChrome";

/** The stubs a student keeps: one torn ticket per event they attended, in
 *  the partner's colours, opening that event's board. Vertical, like a
 *  cinema stub: a torn top edge, the date large, the name, then the tear
 *  and the lockup. Nothing here is invented: every field is the board's own. */
export function EventStubs() {
  const attended = EVENTS.filter((e) => e.lifecycle === "Active follow-up");
  const [qr, setQr] = useState<EventBoard | null>(null);
  if (attended.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed p-[var(--space-8)] text-center" style={{ borderColor: "var(--glass-border)" }}>
        <p className="text-[15px] font-bold">No stubs yet</p>
        <Link href="/connect?tab=events" className="rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>See events</Link>
      </div>
    );
  }
  return (
    <>
      <div className="-mx-5 flex gap-[var(--space-5)] overflow-x-auto px-5 pt-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {attended.map((event, i) => <Stub key={event.id} event={event} tilt={i % 2 === 0 ? -1.6 : 1.4} onQr={() => setQr(event)} />)}
      </div>
      {qr && (
        <QrSheet name={qr.name} seed={qr.id} accent={partnerAccent(qr.host)} lead={qr.partner === "Dream Opportunity" ? qr.partner : qr.lead} partner={qr.partner === "Dream Opportunity" ? qr.lead : qr.partner} onClose={() => setQr(null)} />
      )}
    </>
  );
}

function splitDate(date: string): { day: string; rest: string } {
  const m = date.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (!m) return { day: "", rest: date };
  return { day: m[2], rest: `${m[1].slice(0, 3)} ${m[3]}` };
}

function Stub({ event, tilt, onQr }: { event: EventBoard; tilt: number; onQr: () => void }) {
  const accent = partnerAccent(event.host);
  const lit = `color-mix(in srgb, ${accent} 62%, #ffffff)`;
  const { day, rest } = splitDate(event.date);
  const lead = event.partner === "Dream Opportunity" ? event.partner : event.lead;
  const partner = event.partner === "Dream Opportunity" ? event.lead : event.partner;
  return (
    <div className="group relative flex-none transition-transform duration-300 ease-out hover:-translate-y-[4px] hover:rotate-0" style={{ transform: `rotate(${tilt}deg)`, filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.5))" }}>
      <Link
        href={`/connect?event=${event.id}`}
        aria-label={`Open the ${event.name} board`}
        className="event-stub relative flex h-[268px] w-[176px] flex-col overflow-hidden rounded-[14px]"
        style={{ background: "#0e0c20", fontFamily: "var(--font-display)", textShadow: CARD_TEXT_SHADOW, ["--stub" as string]: "74px" }}
      >
        <EventSurface accent={accent} edge={false} tab={false} />
        {/* body: the date as the hero, then the name */}
        <div className="relative z-10 flex flex-1 flex-col px-[14px] pt-[22px]">
          {day ? (
            <>
              <span className="text-[44px] leading-[44px] font-extrabold tabular-nums" style={{ color: "#fff" }}>{day}</span>
              <span className="mt-[2px] text-[11px] leading-[14px] font-bold tracking-[0.12em] uppercase" style={{ color: lit, fontFamily: "var(--font-body)" }}>{rest}</span>
            </>
          ) : (
            <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)" }}><Calendar className="h-[13px] w-[13px]" aria-hidden /> {event.date}</span>
          )}
          <span className="mt-auto line-clamp-3 text-[15px] leading-[19px] font-extrabold text-balance" style={{ color: "#f6f5fb" }}>{event.name}</span>
          <span className="mt-[6px] mb-[12px] flex items-center gap-[5px] text-[11.5px] leading-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.72)", fontFamily: "var(--font-body)" }}><MapPin className="h-[12px] w-[12px] flex-none" aria-hidden /> {event.location}</span>
        </div>
        {/* the stub below the tear: lockup, and the way in */}
        <div className="relative z-10 flex flex-none items-center justify-between px-[14px]" style={{ height: "var(--stub)", background: `linear-gradient(180deg, color-mix(in srgb, ${lit} 16%, rgba(255,255,255,0.05)) 0%, color-mix(in srgb, ${lit} 8%, rgba(255,255,255,0.03)) 100%)` }}>
          <span aria-hidden className="pointer-events-none absolute inset-x-[16px] top-0 border-t-2 border-dashed" style={{ borderColor: `color-mix(in srgb, ${lit} 50%, rgba(255,255,255,0.18))` }} />
          {/* the lockup at stub scale so long partner marks fit beside the arrow */}
          <span className="block origin-left" style={{ textShadow: "none", transform: "scale(0.8)" }}><EventMarks lead={lead} partner={partner} /></span>
          <ArrowUpRight className="absolute right-[12px] h-[16px] w-[16px] flex-none transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" aria-hidden style={{ color: lit }} />
        </div>
      </Link>
      <QrBadge onClick={onQr} className="absolute top-[10px] right-[10px] z-20" />
    </div>
  );
}
