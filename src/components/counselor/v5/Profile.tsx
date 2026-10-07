"use client";

// Your profile, with a job (Chandu, 7 Oct 2026: "I don't understand the
// profile tab. What am I supposed to do there?"). Two things:
// 1. Your card as students see it: edit office hours, what to ask you
//    about and languages; the badge beside it is the live preview of what
//    students see when they book you or find you in Connect.
// 2. Your team, for handoffs: who covers which students, one tap to message.
// The ID-badge look is Maisha's lanyard reference. Counselors are adults, so
// a real photo (DEMO-ONLY picks from Connect's headshots); a counselor with
// no photo yet shows initials. Edits are kept on this page for the demo.

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { SCHOOL_COUNSELORS } from "@/lib/counselorOrg";
import { cv } from "@/lib/counselorBase";

const PHOTO: Record<string, string | undefined> = {
  "Sarah Chen": "/images/connect/avatars/pro-tanaka.jpg",
  "Renee Alvarez": "/images/connect/avatars/pro-martinez.jpg",
};
const ME = "Sarah Chen";
// DEMO-ONLY: teammates' card details until counselor profiles are stored
const TEAM_CARD: Record<string, { hours: string; topics: string[] }> = {
  "Daniel Okafor": { hours: "Tue and Thu, 1 to 3 PM", topics: ["Trades", "Military"] },
  "Renee Alvarez": { hours: "Mon and Wed, 9 to 11 AM", topics: ["Financial aid", "Scholarships"] },
};
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const SUGGESTED = ["College applications", "Financial aid", "Course planning", "Careers", "Scholarships", "Trades", "Stress and wellbeing"];
const FIELD = { borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" };

function lastInitial(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.[0] ?? "Z").toUpperCase();
}

export function V5Profile() {
  const roster = useReviewedRoster();
  const caseload = (from: string, to: string) => roster.filter((s) => { const c = lastInitial(s.name); return c >= from && c <= to; }).length;
  const me = SCHOOL_COUNSELORS.find((c) => c.name === ME) ?? SCHOOL_COUNSELORS[0];
  const team = SCHOOL_COUNSELORS.filter((c) => c.id !== me.id);
  // the same hours the calendar and the booking sheet use (OFFICE_HOURS)
  const [hours, setHours] = useState("Tue and Thu, 10 to 11:30 AM · Wed, 1:30 to 3 PM");
  const [topics, setTopics] = useState<string[]>(["College applications", "Careers"]);
  const [languages, setLanguages] = useState("English, Mandarin");

  return (
    <div className="flex flex-col gap-[48px] pt-[var(--space-2)] lg:gap-[64px] lg:pt-[var(--space-4)]">
      <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Profile</h1>

      <section aria-label="Your card" className="grid grid-cols-1 items-start gap-[40px] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[64px]">
        <div className="flex min-w-0 flex-col gap-[var(--space-6)]">
          <div className="flex flex-col gap-[6px]">
            <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Your Card</h2>
            <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Students see this when they book you.</p>
          </div>
          <Field label="Office hours"><input value={hours} onChange={(e) => setHours(e.target.value)} className="h-11 w-full max-w-[520px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] outline-none" style={FIELD} /></Field>
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[14px] font-semibold">Ask me about</span>
            <div className="flex flex-wrap gap-[8px]">
              {SUGGESTED.map((t) => {
                const on = topics.includes(t);
                return (
                  <button key={t} type="button" aria-pressed={on} onClick={() => setTopics((l) => (on ? l.filter((x) => x !== t) : [...l, t].slice(-4)))}
                    className="dm-quiet inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold"
                    style={on ? { background: "color-mix(in srgb, var(--primary) 14%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 50%, transparent)", color: "var(--foreground)" } : { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                    {t}{on && <X className="h-[13px] w-[13px]" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Languages"><input value={languages} onChange={(e) => setLanguages(e.target.value)} className="h-11 w-full max-w-[520px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[15px] outline-none" style={FIELD} /></Field>
        </div>
        {/* the live preview */}
        <div className="flex flex-col items-center gap-[var(--space-3)] justify-self-center">
          <Badge name={me.name} range={me.range} students={caseload(me.from, me.to)} hours={hours} topics={topics} languages={languages} big />
          <span className="text-[12.5px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Preview</span>
        </div>
      </section>

      <section aria-label="Your team" className="flex flex-col gap-[var(--space-5)]">
        <div className="flex flex-col gap-[6px]">
          <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Your Team</h2>
          <p className="text-[15px]" style={{ color: "var(--muted-foreground)" }}>Who covers which students, for handoffs.</p>
        </div>
        <div className="flex flex-wrap gap-[var(--space-6)]">
          {team.map((c) => <Badge key={c.id} name={c.name} range={c.range} students={caseload(c.from, c.to)} hours={TEAM_CARD[c.name]?.hours} topics={TEAM_CARD[c.name]?.topics} message />)}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[var(--space-2)]">
      <span className="text-[14px] font-semibold">{label}</span>
      {children}
    </label>
  );
}

/** A hanging ID badge: a strap, a clip, then the card. */
function Badge({ name, range, students, hours, topics = [], languages, big = false, message = false }: { name: string; range: string; students: number; hours?: string; topics?: string[]; languages?: string; big?: boolean; message?: boolean }) {
  const photo = PHOTO[name];
  const w = big ? 300 : 240;
  const initials = name.split(" ").map((p) => p[0]).join("");
  return (
    <figure className="group relative flex flex-none flex-col items-center" style={{ width: w }}>
      <span aria-hidden className="block h-[40px] w-[18px] rounded-b-[4px]" style={{ background: "var(--primary)" }} />
      <span aria-hidden className="-mt-[2px] block h-[14px] w-[30px] rounded-[4px] border-2" style={{ borderColor: "color-mix(in srgb, var(--foreground) 40%, transparent)", background: "var(--card)" }} />
      <div className="mt-[6px] flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-transform duration-300 group-hover:-translate-y-[2px] motion-reduce:transition-none"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 50px -30px rgba(20,30,70,0.55)" }}>
        <div className="relative w-full" style={{ height: big ? 250 : 190, background: "color-mix(in srgb, var(--primary) 14%, var(--card))" }}>
          {photo
            ? <Image src={photo} alt="" fill sizes={`${w}px`} className="object-cover" style={{ objectPosition: "50% 20%" }} />
            : <span className="absolute inset-0 flex items-center justify-center text-[56px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>{initials}</span>}
        </div>
        <figcaption className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-5)]">
          <span className="flex flex-col gap-[2px]">
            <span className={`${big ? "text-[22px] leading-[28px]" : "text-[18px] leading-[24px]"} font-semibold`} style={{ fontFamily: "var(--font-display)" }}>{name}</span>
            <span className="text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>School Counselor · {DEMO_SCHOOL}</span>
          </span>
          {hours && <span className="text-[13.5px]"><span className="font-semibold">Office hours</span><br /><span style={{ color: "var(--muted-foreground)" }}>{hours}</span></span>}
          {topics.length > 0 && <span className="flex flex-wrap gap-[6px]">{topics.map((t) => <span key={t} className="rounded-full px-[10px] py-[3px] text-[12px] font-semibold" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>{t}</span>)}</span>}
          {languages && <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Speaks {languages}</span>}
          <span className="flex items-center justify-between border-t pt-[var(--space-3)] text-[13px] font-semibold" style={{ borderColor: RULE }}>
            <span>Students {range}</span>
            <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{students}</span>
          </span>
          {message && (
            <Link href={cv("workspace")} className="dm-quiet inline-flex h-10 items-center justify-center gap-[8px] rounded-[var(--radius-md)] border text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
              <MessageCircle className="h-4 w-4" aria-hidden /> Message {name.split(" ")[0]}
            </Link>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
