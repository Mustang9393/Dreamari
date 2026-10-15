"use client";

// A United Way event's board after the day (15 Oct 2026).
//
// Maisha's review: "Use consistent title case for all event names ... The
// current pinned 'Team Debrief' is unclear. Replace it with something like
// 'Event Recap & Next Steps', highlighting key takeaways and what's
// happening next. I don't think we need an entire additional feed of posts
// beneath the recap. Let's avoid duplicating conversations already
// happening in the main community. Keep event-specific questions, photos,
// and relevant information easily accessible." And the tabs: "Questions:
// Questions and answers about the event. Recap: Key takeaways and next
// steps. Photos: Keep the existing gallery. People: Separate Professional
// Volunteers, Students, and United Way Team. About: Simplify to the host
// organization, topics covered, participating companies, date, and
// location. Remove unnecessary files/slides and the 'Who Hosted a Table'
// section."
// So every United Way event board has exactly those five tabs, in that
// order, on every board the engine renders. Questions use the board's own
// rows (To: tags, reactions, LinkedIn replies); the recap is for everyone
// (it replaces the staff-only debrief); the volunteers' posts from the day
// live on the board's Volunteers feed as Event Updates. Students in People
// are illustrated avatars or initials, never photos. Connect's EventView
// still renders the page before the day and Connect's own events.

import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Pin, X } from "lucide-react";
import { createPortal } from "react-dom";
import { IconTip } from "@/components/app/IconTip";
import { useBackStep } from "@/lib/backStep";
import { CARD_TEXT_SHADOW } from "@/components/app/cardChrome";
import { Segmented } from "../viz";
import { CompanyChip, ConnectNav, SectionHead } from "../primitives";
import { ProProfileView, useProfilePage } from "../ProProfile";
import type { EventBoard } from "../data";
import * as D from "./uwData";
import { boardStaff, eventQuestions, visibleTo, type UwItem, type UwPerson } from "./uwCommunity";
import { useUwPov, useUwStore } from "./uwStore";
import { ItemList, ItemPage, PersonButton, PersonSheet, StudentComposer, UwNavCtx, useWithAdded, type UwNav } from "./UwFeed";
import { BLUE, BLUE_TEXT, MUTED, PersonAvatar, PovSwitch, SOLID, personName, useToast } from "./uwUi";

type Tab = "questions" | "recap" | "photos" | "people" | "about";
const TAB_LABEL: Record<Tab, string> = { questions: "Questions", recap: "Recap", photos: "Photos", people: "People", about: "About" };

export function UwEventBoard({ event, board, ev, filter, onFilter, onBack, backLabel, onOpenBoard }: {
  event: D.UwEvent; board: D.UwBoard; ev: EventBoard;
  filter: string; onFilter: (f: string) => void;
  onBack: () => void; backLabel: string;
  /** the board's own section, from the recap's What's Next */
  onOpenBoard: (id: string, filter?: string) => void;
}) {
  const f = event.followUp!;
  const nav = useContext(ConnectNav);
  const [pov, setPov] = useUwPov();
  const store = useUwStore();
  const [toast, onToast] = useToast();
  const tab: Tab = filter === "recap" || filter === "photos" || filter === "people" || filter === "about" ? (filter === "photos" && !f.photos ? "questions" : filter) : "questions";
  const seeded = useMemo(() => eventQuestions(event.id, board), [event.id, board]);
  const asked = store.items.filter((i) => i.boardId === event.id);
  const questions = useWithAdded<UwItem>([...asked, ...seeded]).filter((q) => visibleTo(q, pov));
  const [itemId, setItemId] = useState<string>();
  const item = questions.find((q) => q.id === itemId);
  const [person, setPerson] = useState<UwPerson>();
  const [profile, setProfile, closeProfile] = useProfilePage<string>();
  const [asking, setAsking] = useState(false);
  const [photoOpen, setPhotoOpen] = useState<number | null>(null);
  useBackStep(!!item, () => setItemId(undefined));
  useBackStep(!!profile, closeProfile);
  const staff = boardStaff(board);
  const volunteerMe = board.volunteerIds.find((id) => D.VOLUNTEERS[id]?.org === board.team.you) ?? board.volunteerIds[0];
  const chapter = board.chapters.find((c) => c.id === event.chapter);
  const me: UwPerson = pov === "student" ? { kind: "student", name: "Jordan", grade: "Senior", place: chapter?.short ?? board.chapters[0].short } : pov === "volunteer" ? { kind: "volunteer", proId: volunteerMe } : { kind: "staff", ...board.staff.me };
  const uwNav: UwNav = {
    board, pov, me, hereEventId: event.id, toast: onToast,
    openItem: (i) => { setItemId(i.id); window.scrollTo(0, 0); },
    openPerson: (who) => (who.kind === "volunteer" ? setProfile(who.proId) : setPerson(who)),
    openEvent: (id) => nav?.openEvent?.(id),
    go: (section, fl) => onOpenBoard(board.id, section === "volunteers" && fl ? "volunteers" : section),
  };
  useEffect(() => {
    if (photoOpen === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setPhotoOpen(null); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [photoOpen]);

  if (profile) {
    const pro = D.VOLUNTEERS[profile];
    return <ProProfileView key={pro.id} pro={pro} follows={{}} onFollow={() => {}} onBack={closeProfile} backLabel={`Back to ${event.title}`} noDirectMessage />;
  }
  if (item) return <UwNavCtx.Provider value={uwNav}>{toast}<ItemPage item={item} onBack={() => setItemId(undefined)} backLabel={`Back to ${event.title}`} /></UwNavCtx.Provider>;

  // People: who was in the room, in three groups
  const pros = (f.proIds ?? []).map((id) => D.VOLUNTEERS[id]).filter(Boolean);
  const team = (f.team ?? []).map((n) => staff.find((s) => s.name === n)).filter((s): s is D.StaffMember => !!s);
  const students: UwPerson[] = [];
  const seen = new Set<string>();
  const addStudent = (p: UwPerson) => { if (p.kind === "student" && !seen.has(p.name)) { seen.add(p.name); students.push(p); } };
  for (const q of seeded) { addStudent(q.who); q.replies.forEach((r) => addStudent(r.who)); }
  const companies = [...new Set(pros.map((p) => p.org))];
  const host = chapter?.name ?? board.org;
  const recap = f.recap;
  const recapBy = recap ? staff.find((s) => s.name === recap.by) : undefined;
  const tabs: Tab[] = ["questions", "recap", ...(f.photos ? (["photos"] as Tab[]) : []), "people", "about"];

  return (
    <UwNavCtx.Provider value={uwNav}>
      {toast}
      {person && <PersonSheet who={person} onClose={() => setPerson(undefined)} />}
      {asking && <StudentComposer eventId={event.id} onClose={() => setAsking(false)} />}
      <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[6px]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: MUTED }}><ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}</button>
        <PovSwitch pov={pov} onChange={setPov} />
      </div>

      {/* one photo, the name, when and where */}
      <section aria-label="Event" className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-6)] sm:min-h-[320px]" style={{ background: "#0a0f2a", textShadow: CARD_TEXT_SHADOW, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)" }}>
        {f.photos && (
          <button type="button" onClick={() => setPhotoOpen(0)} aria-label={`Open photos from ${event.title}`} className="absolute inset-0 cursor-pointer">
            <Image src={f.photos.images[0]} alt="" fill priority sizes="1280px" className="object-cover" />
          </button>
        )}
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,16,56,0.94) 0%, rgba(0,20,64,0.6) 45%, rgba(0,20,64,0.08) 80%)" }} />
        <Image src={D.BRAND.logoWhite} alt="United Way" width={120} height={56} unoptimized className="pointer-events-none absolute top-[var(--space-5)] right-[var(--space-6)] z-10 h-[38px] w-auto" />
        <div className="pointer-events-none relative z-10 flex flex-col gap-[6px]">
          <h1 className="text-[30px] leading-[34px] font-extrabold text-balance sm:text-[38px] sm:leading-[42px]" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{event.title}</h1>
          <p className="text-[14px] leading-[20px] font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>{ev.date} · {ev.location} · {f.students} students</p>
        </div>
      </section>

      <div className="sticky top-[84px] z-30 -mx-[4px] rounded-[var(--radius-lg)] px-[4px] py-[6px]" style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
        <div className="flow-scroll overflow-x-auto"><div className="w-max min-w-full sm:min-w-0">
          <Segmented ariaLabel="Event board section" value={tab} onChange={(k) => onFilter(k)} grow dense
            options={tabs.map((k) => ({ key: k, label: k === "questions" ? `${TAB_LABEL[k]} ${questions.length}` : k === "photos" ? `${TAB_LABEL[k]} ${f.photos!.count}` : TAB_LABEL[k] }))} />
        </div></div>
      </div>

      {tab === "questions" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {pov === "student" && (
            <button type="button" onClick={() => setAsking(true)} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-lg)] border py-[8px] pr-[8px] pl-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              <PersonAvatar who={me} size={36} />
              <span className="min-w-0 flex-1 truncate text-[15px]" style={{ color: MUTED }}>Ask about this event</span>
              <span className="flex-none rounded-full px-[14px] py-[8px] text-[13px] font-bold" style={SOLID}>Ask</span>
            </button>
          )}
          <ItemList items={questions} empty={pov === "volunteer" ? "No questions for volunteers yet." : "No questions yet. Ask the first one."} />
        </div>
      )}

      {tab === "recap" && (
        recap ? (
          <article aria-labelledby="uw-recap-title" className="relative overflow-hidden rounded-[var(--radius-xl)] border px-[var(--space-5)] py-[var(--space-6)] sm:px-[var(--space-8)] sm:py-[var(--space-8)]" style={{ borderColor: `color-mix(in srgb, ${BLUE} 40%, var(--glass-border))`, background: `radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, ${BLUE} 16%, transparent), transparent 60%), var(--glass-surface-1)` }}>
            <p className="flex items-center gap-[8px] text-[12px] leading-[16px] font-extrabold" style={{ color: BLUE_TEXT }}><Pin className="h-3.5 w-3.5" aria-hidden /> Pinned by United Way</p>
            <h2 id="uw-recap-title" className="mt-[10px] text-[30px] leading-[35px] font-extrabold text-balance sm:text-[36px] sm:leading-[42px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Event Recap &amp; Next Steps</h2>
            <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-8)] md:grid-cols-2 md:gap-[var(--space-10)]">
              <section aria-labelledby="uw-takeaways">
                <h3 id="uw-takeaways" className="text-[13px] leading-[18px] font-extrabold" style={{ color: MUTED }}>Key Takeaways</h3>
                <ol className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
                  {recap.takeaways.map((t, i) => (
                    <li key={t} className="flex items-baseline gap-[14px]">
                      <span aria-hidden className="w-[30px] flex-none text-[22px] leading-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BLUE_TEXT }}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[16px] leading-[24px]" style={{ color: "var(--foreground)" }}>{t}</span>
                    </li>
                  ))}
                </ol>
              </section>
              <section aria-labelledby="uw-next" className="md:border-l md:pl-[var(--space-10)]" style={{ borderColor: "var(--glass-border)" }}>
                <h3 id="uw-next" className="text-[13px] leading-[18px] font-extrabold" style={{ color: MUTED }}>What&apos;s Next</h3>
                <ul className="mt-[var(--space-3)] flex flex-col">
                  {recap.next.map((n) => {
                    const open = n.go ? () => ("event" in n.go! ? nav?.openEvent?.(n.go.event) : onOpenBoard(board.id, n.go!.section)) : undefined;
                    const [mon, day] = (n.when ?? "").split(" ");
                    return (
                      <li key={n.text} className="border-t py-[10px] first:border-t-0 first:pt-[4px]" style={{ borderColor: "var(--glass-border)" }}>
                        <button type="button" disabled={!open} onClick={open} className="dm-quiet dm-row group flex w-full cursor-pointer items-center gap-[14px] rounded-[var(--radius-md)] text-left disabled:cursor-default">
                          {n.when ? (
                            <span className="flex size-[46px] flex-none flex-col items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${BLUE} 16%, var(--glass-surface-1))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${BLUE} 45%, var(--glass-border))` }}>
                              <span className="text-[10px] leading-none font-extrabold tracking-[0.08em] uppercase" style={{ color: BLUE_TEXT }}>{mon}</span>
                              <span className="mt-[3px] text-[17px] leading-none font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{day}</span>
                            </span>
                          ) : (
                            <span className="flex size-[46px] flex-none items-center justify-center rounded-[10px]" style={{ background: "var(--glass-surface-2)" }}><ChevronRight className="h-5 w-5" aria-hidden style={{ color: BLUE_TEXT }} /></span>
                          )}
                          <span className="min-w-0 flex-1 text-[16px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{n.text}</span>
                          {open && <ChevronRight className="h-4 w-4 flex-none transition-transform group-hover:translate-x-[2px]" aria-hidden style={{ color: MUTED }} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
            {recapBy && (
              <footer className="mt-[var(--space-6)] flex items-center gap-[10px] border-t pt-[var(--space-4)] text-[13.5px]" style={{ borderColor: "var(--glass-border)", color: MUTED }}>
                <PersonButton who={{ kind: "staff", ...recapBy }} size={28} />
                <span className="truncate"><strong className="font-bold" style={{ color: "var(--foreground)" }}>{recapBy.name}</strong> · {recapBy.role}, {recapBy.office} · {recap.postedAgo}</span>
              </footer>
            )}
          </article>
        ) : <p className="text-[14px]" style={{ color: MUTED }}>The recap is on its way.</p>
      )}

      {tab === "photos" && f.photos && (
        <section aria-label="Event photos" className="flex flex-col gap-[var(--space-3)]">
          <ul className="grid grid-cols-2 gap-[6px] sm:grid-cols-3 sm:gap-[8px]">
            {f.photos.images.map((src, index) => (
              <li key={src} className={`relative min-h-0 ${index === 0 ? "col-span-2 row-span-2" : ""}`} style={{ aspectRatio: index === 0 ? undefined : "4 / 3" }}>
                <button type="button" onClick={() => setPhotoOpen(index)} aria-label={`Open photo ${index + 1} of ${f.photos!.count}`} className="dm-tap group relative block h-full min-h-[160px] w-full cursor-pointer overflow-hidden rounded-[var(--radius-md)]" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
                  <Image src={src} alt="" fill sizes="(max-width: 992px) 50vw, 420px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[13px] font-semibold" style={{ color: MUTED }}>{f.photos.images.length} of {f.photos.count} photos. Tap one to see it full size.</p>
        </section>
      )}

      {tab === "people" && (
        <div className="flex flex-col gap-[var(--space-6)]">
          <PeopleGroup title="Professional Volunteers" count={pros.length}>
            {pros.map((p) => <PersonTile key={p.id} who={{ kind: "volunteer", proId: p.id }} />)}
          </PeopleGroup>
          <PeopleGroup title="Students" count={f.students}>
            {students.map((s) => <PersonTile key={personName(s)} who={s} />)}
            {f.students > students.length && <li className="flex min-h-[64px] items-center px-[10px] text-[14px] font-semibold" style={{ color: MUTED }}>and {f.students - students.length} more</li>}
          </PeopleGroup>
          <PeopleGroup title="United Way Team" count={team.length}>
            {team.map((s) => <PersonTile key={s.name} who={{ kind: "staff", ...s }} />)}
          </PeopleGroup>
        </div>
      )}

      {tab === "about" && (
        <dl className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-lg)] border sm:grid-cols-2" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          <AboutCell label="Host">{host}</AboutCell>
          <AboutCell label="Date"><span className="flex items-center gap-[6px]"><Calendar className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} />{ev.date}, {event.date.time}</span></AboutCell>
          <AboutCell label="Location"><span className="flex items-center gap-[6px]"><MapPin className="h-4 w-4" aria-hidden style={{ color: BLUE_TEXT }} />{ev.location}</span></AboutCell>
          <AboutCell label="Topics"><span className="flex flex-wrap gap-[6px]">{[event.kind, ...(event.world ? [event.world] : [])].map((t) => <span key={t} className="rounded-full border px-[10px] py-[2px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>{t}</span>)}</span></AboutCell>
          <AboutCell label="Participating Companies" wide>{companies.length ? <span className="flex flex-wrap gap-[6px]">{companies.map((c) => <CompanyChip key={c} name={c} tone="surface" />)}</span> : "Coming soon"}</AboutCell>
        </dl>
      )}

      {photoOpen !== null && f.photos && typeof document !== "undefined" && createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Photo ${photoOpen + 1} of ${f.photos.count}`} className="fixed inset-0 z-[95] flex flex-col items-center justify-center p-4 sm:p-8" style={{ background: "rgba(6,7,16,0.6)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}>
          <button type="button" aria-label="Close" onClick={() => setPhotoOpen(null)} className="absolute inset-0 cursor-default" />
          <div className="relative z-[1] flex w-full max-w-[1100px] flex-col gap-[var(--space-3)]">
            <div className="flex items-center justify-between text-[13px] leading-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
              <span>{event.title} · Photo {photoOpen + 1} of {f.photos.count}</span>
              <IconTip label="Close"><button type="button" onClick={() => setPhotoOpen(null)} aria-label="Close" className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}><X className="h-4 w-4" aria-hidden /></button></IconTip>
            </div>
            <div className="dm-scroll flex max-h-[calc(calc(100dvh/var(--vz,1))-140px)] flex-col gap-[var(--space-3)] overflow-y-auto">
              <div className="relative w-full flex-none overflow-hidden rounded-[var(--radius-lg)]" style={{ aspectRatio: "16 / 9" }}>
                <Image key={photoOpen} src={f.photos.images[photoOpen % f.photos.images.length]} alt="" fill sizes="1100px" className="object-cover" priority />
                <IconTip label="Previous" className="absolute top-1/2 left-3 -translate-y-1/2"><button type="button" aria-label="Previous photo" onClick={() => setPhotoOpen((i) => (i === null ? 0 : (i - 1 + f.photos!.images.length) % f.photos!.images.length))} className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(9,10,20,0.6)", color: "#fff" }}><ChevronLeft className="h-5 w-5" aria-hidden /></button></IconTip>
                <IconTip label="Next" className="absolute top-1/2 right-3 -translate-y-1/2"><button type="button" aria-label="Next photo" onClick={() => setPhotoOpen((i) => (i === null ? 0 : (i + 1) % f.photos!.images.length))} className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full" style={{ background: "rgba(9,10,20,0.6)", color: "#fff" }}><ChevronRight className="h-5 w-5" aria-hidden /></button></IconTip>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </UwNavCtx.Provider>
  );
}

function PeopleGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <SectionHead>{title} <span className="font-semibold tabular-nums" style={{ color: MUTED }}>{count}</span></SectionHead>
      <ul className="grid grid-cols-1 gap-[var(--space-2)] sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}

/** One person: face, name and line; opens their profile. */
function PersonTile({ who }: { who: UwPerson }) {
  const nav = useContext(UwNavCtx)!;
  const line = who.kind === "student" ? [who.grade, who.place].filter(Boolean).join(" · ") : who.kind === "volunteer" ? `${D.VOLUNTEERS[who.proId]?.role ?? ""} · ${D.VOLUNTEERS[who.proId]?.org ?? ""}` : `${who.role} · ${who.office}`;
  return (
    <li className="flex">
      <button type="button" onClick={() => nav.openPerson(who)} className="dm-quiet flex min-h-[64px] w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <PersonAvatar who={who} size={40} />
        <span className="flex min-w-0 flex-col"><span className="truncate text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{personName(who)}</span><span className="truncate text-[12.5px]" style={{ color: MUTED }}>{line}</span></span>
      </button>
    </li>
  );
}

function AboutCell({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-[6px] border-t p-[var(--space-5)] first:border-t-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l ${wide ? "sm:col-span-2 sm:!border-l-0" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
      <dt className="text-[12.5px] font-bold" style={{ color: MUTED }}>{label}</dt>
      <dd className="text-[15.5px] leading-[22px] font-semibold" style={{ color: "var(--foreground)" }}>{children}</dd>
    </div>
  );
}
