"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Bookmark, GraduationCap, Landmark } from "lucide-react";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { SMALL } from "@/components/career/CareerDetailExperience";
import { ADMISSION_WORD, CONTROL_WORD, LEVEL_WORD, collegeImage, collegeMark, money, type College } from "./data";

// One accent for the whole feature: colleges have no world, so they borrow
// the app's primary blue. Cards for tribal colleges, trade schools etc. do
// not get their own colours; difference is said in words.
export const ACCENT = "var(--primary)";
export const SOFT = "var(--accent-subtle)";
export const RULE = "rgba(255,255,255,0.12)";

/** The three words under a college's name, everywhere. */
export function tags(c: College): string[] {
  return [LEVEL_WORD[c.level], CONTROL_WORD[c.control], c.setting];
}

export function pct(n: number | null): string {
  return n === null ? "Not published" : `${n}%`;
}

/** Saved colleges live in the browser only (prototype). Read through a
 *  store subscription so the server renders "nothing saved" and the client
 *  catches up without setting state inside an effect. */
const KEY = "dm-colleges-saved";
const EVENT = "dm-colleges-saved-change";
function readRaw(): string { try { return window.localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; } }
function subscribe(cb: () => void) { window.addEventListener(EVENT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); }; }
export function useSaved(): [Set<string>, (slug: string) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const saved = useMemo(() => { try { return new Set(JSON.parse(raw) as string[]); } catch { return new Set<string>(); } }, [raw]);
  const toggle = (slug: string) => {
    const next = new Set(saved);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    try { window.localStorage.setItem(KEY, JSON.stringify([...next])); } catch { /* private mode */ }
    window.dispatchEvent(new Event(EVENT));
  };
  return [saved, toggle];
}

/** The picture at the top of a card or a page: the campus photo when we have
 *  one, otherwise a quiet colour field with the college's mark. */
export function CollegePicture({ c, sizes, priority = false, className = "" }: { c: College; sizes: string; priority?: boolean; className?: string }) {
  const img = collegeImage(c);
  const mark = collegeMark(c);
  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, #0e0c20) 0%, #0e0c20 60%, color-mix(in srgb, var(--hero-accent-teal) 22%, #0e0c20) 100%)" }} aria-hidden>
      {img ? (
        <Image src={img} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : mark ? (
        <Image src={mark} alt="" fill sizes="120px" className="object-contain p-[18%] opacity-90" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center"><GraduationCap className="h-10 w-10" style={{ color: "rgba(255,255,255,0.45)" }} /></span>
      )}
    </span>
  );
}

/** Bookmark toggle, same everywhere. */
export function SaveButton({ on, onToggle, size = 40 }: { on: boolean; onToggle: () => void; size?: number }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Saved. Tap to remove" : "Save this college"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      className="dm-quiet flex flex-none cursor-pointer items-center justify-center rounded-full border"
      style={{ width: size, height: size, borderColor: on ? ACCENT : "rgba(255,255,255,0.22)", background: on ? "color-mix(in srgb, var(--primary) 22%, rgba(12,16,35,0.6))" : "rgba(12,16,35,0.55)", color: on ? SOFT : "#fff", backdropFilter: "blur(8px)" }}
    >
      <Bookmark className="h-[18px] w-[18px]" fill={on ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}

/** The college's mark on a white disc: seals and logos were drawn for
 *  white paper, so they read there; a letter stands in when we have none. */
export function MarkBadge({ c, size = 44 }: { c: College; size?: number }) {
  const mark = collegeMark(c);
  return (
    <span className="relative flex flex-none items-center justify-center overflow-hidden rounded-full border-2" style={{ width: size, height: size, background: "#fff", borderColor: "#0e0c20", boxShadow: "0 6px 18px -6px rgba(0,0,0,0.6)" }} aria-hidden>
      {mark ? (
        <Image src={mark} alt="" fill sizes={`${size * 2}px`} className="object-contain p-[12%]" />
      ) : (
        <span className="text-[18px] leading-none font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#0e0c20" }}>{c.name[0]}</span>
      )}
    </span>
  );
}

/** The result card: the community card's full-bleed frosted cover, the
 *  college's mark as a profile picture beside its name at the top (never
 *  under the words), two sentences low on the frost, three words, Compare.
 *  The whole card opens the college. */
const GRAIN = "/images/connect/covers/grain.png";
export function CollegeCard({ c, saved, onSave, compared, onCompare }: { c: College; saved: boolean; onSave: () => void; compared: boolean; onCompare?: () => void }) {
  const img = collegeImage(c);
  return (
    <article
      className="dm-tap group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${ACCENT} ${compared ? 70 : 40}%, transparent)`, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
    >
      <span aria-hidden className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        {img ? (
          <Image src={img} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" style={{ filter: "brightness(0.72) saturate(0.9)" }} />
        ) : (
          <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 34%, #0e0c20) 0%, #0e0c20 60%, color-mix(in srgb, var(--hero-accent-teal) 24%, #0e0c20) 100%)" }} />
        )}
        <CardProgressiveBlur size="74%" />
        {/* a real band behind the title, not just the folio scrim: bright
           campus photos (Princeton) otherwise swallow the name */}
        <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.94) 0%, rgba(12,16,35,0.8) 30%, rgba(12,16,35,0.42) 56%, rgba(12,16,35,0.08) 80%, transparent 100%), linear-gradient(to bottom, rgba(12,16,35,0.82) 0%, rgba(12,16,35,0.55) 34%, rgba(12,16,35,0.12) 58%, transparent 72%), ${cardTopScrim()}, linear-gradient(90deg, color-mix(in srgb, ${ACCENT} 12%, transparent), transparent 60%)` }} />
        <span className="absolute inset-0" style={{ backgroundImage: `url(${GRAIN})`, backgroundSize: "128px 128px", backgroundRepeat: "repeat", mixBlendMode: "overlay", opacity: 0.2 }} />
      </span>
      <span aria-hidden className="absolute top-0 left-1/2 z-20 h-[6px] w-[44px] -translate-x-1/2 rounded-b-[6px] opacity-90" style={{ background: ACCENT }} />

      <Link href={`/colleges/${c.slug}`} className="absolute inset-0 z-10 rounded-[inherit]" aria-label={`Open ${c.name}`} />
      <span className="absolute top-[14px] right-[14px] z-20"><SaveButton on={saved} onToggle={onSave} size={36} /></span>

      <div className="pointer-events-none relative z-20 flex h-full w-full flex-col px-[var(--space-5)] pt-[var(--space-5)] pb-[var(--space-4)]" style={{ fontFamily: "var(--font-display)" }}>
        {/* profile row: the mark, then the name and place beside it */}
        <div className="flex items-center gap-[12px] pr-[44px]">
          <MarkBadge c={c} size={44} />
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h3 className="text-[18px] leading-[22px] font-extrabold text-balance" style={{ color: "#FFFFFF" }}>{c.name}</h3>
            <p className="text-[13px] leading-[17px] font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)" }}>{c.city}, {c.stateName}</p>
          </div>
        </div>

        <p className="mt-auto pt-[var(--space-6)] text-[15px] leading-[21px] font-semibold" style={{ color: "#FFFFFF", fontFamily: "var(--font-body)" }}>
          {c.netPrice === null ? "Yearly cost not published." : `About ${money(Math.round(c.netPrice / 100) * 100)} a year after grants.`}
          {c.finish !== null && <span className="block" style={{ color: "rgba(255,255,255,0.78)" }}>{c.finish} in 100 students finish.</span>}
        </p>
        <div className="pointer-events-auto mt-[10px] flex items-center justify-between gap-[var(--space-3)] border-t pt-[10px]" style={{ borderColor: "rgba(255,255,255,0.22)", textShadow: "none", fontFamily: "var(--font-body)" }}>
          <ul className="flex min-w-0 flex-wrap items-center gap-[6px]" aria-label="About this college">
            {tags(c).map((t) => <li key={t} className="rounded-[var(--radius-sm)] px-[8px] py-[3px] text-[11.5px] leading-[15px] font-bold" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>{t}</li>)}
          </ul>
          {onCompare && (
            <button type="button" aria-pressed={compared} onClick={(e) => { e.preventDefault(); onCompare(); }} className="dm-quiet relative z-20 flex min-h-[32px] flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[10px] text-[12.5px] leading-[16px] font-bold" style={{ color: "#fff", background: compared ? `color-mix(in srgb, ${ACCENT} 45%, transparent)` : "rgba(255,255,255,0.08)" }}>
              <Landmark className="h-[13px] w-[13px]" aria-hidden /> {compared ? "Comparing" : "Compare"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** A label on the left, a figure on the right, one hairline under. */
export function Row({ label, value, note, last = false }: { label: string; value: React.ReactNode; note?: string; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-[var(--space-4)] py-[10px] ${last ? "" : "border-b"}`} style={{ borderColor: RULE }}>
      <span className="flex min-w-0 flex-col">
        <span className={SMALL} style={{ color: "var(--foreground)" }}>{label}</span>
        {note && <span className="text-[12.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
      </span>
      <span className={`${SMALL} flex-none font-bold tabular-nums text-right`} style={{ color: "var(--foreground)" }}>{value}</span>
    </div>
  );
}

export const admissionWord = (c: College) => (c.admitRate === null ? ADMISSION_WORD.open : `${c.admitRate}% get in`);
