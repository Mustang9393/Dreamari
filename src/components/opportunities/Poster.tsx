"use client";

// The shelf card as a portrait poster (6 Oct 2026). Chandu: "scale them
// up too? Make them more portrait looking?" The picture is the app's own
// career portrait for what the opportunity is about (art.ts), full bleed,
// with the facts set on a scrim at the foot the way Explore's career
// posters are. (Providers' own share images were tried the same day and
// turned down: "I'm not happy with the selection of images".)
//
//   [MAR 1]                                   (Save)
//
//                    the career portrait
//
//   Up to $25,000
//   Horatio Alger National Scholarship
//   Horatio Alger Association
//   ✓ Your GPA fits                    8 days left

import Image from "next/image";
import { Check, ClipboardCheck, Trophy } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import type { OpportunityStatus } from "@/lib/opportunities";
import { AMBER, SaveDot, amountShort, closesShort, costTone, signalFor, type Enriched } from "./Card";
import { fieldWorld } from "./match";
import { PAID, PROGRAM_KIND } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MINT = "rgb(110,231,183)";
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "Got it", passed: "Passed" };

/** The deadline as a glass leaf over the picture. */
function Leaf({ e }: { e: Enriched }) {
  const t = e.time;
  const glass = { background: "rgba(5,8,20,0.72)", borderColor: "rgba(255,255,255,0.16)" };
  if (t.status === "unknown" || !t.iso) {
    return <span className="rounded-[10px] border px-[9px] py-[5px] text-[11px] leading-[14px] font-bold text-white backdrop-blur-[10px]" style={glass}>No date yet</span>;
  }
  const d = new Date(`${t.iso}T12:00:00`);
  const tone = t.tone === "soon" ? AMBER : "var(--color-brand-400)";
  return (
    <span aria-label={closesShort(t)} title={closesShort(t)} className="flex w-[46px] flex-col overflow-hidden rounded-[10px] border text-center backdrop-blur-[10px]" style={glass}>
      <span aria-hidden className="py-[2px] text-[9.5px] leading-[13px] font-bold tracking-[0.08em] text-white uppercase" style={{ background: tone }}>{MONTHS[d.getMonth()]}</span>
      <span aria-hidden className="py-[3px] text-[19px] leading-[22px] font-extrabold text-white tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{d.getDate()}</span>
    </span>
  );
}

export function Poster({ e, photo, status, onOpen, onSave }: { e: Enriched; photo: string | null; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, time, fit } = e;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const world = fieldWorld(item.fields);
  const color = world?.color ?? "var(--primary)";
  const { signal, strong } = signalFor(e);
  const soon = time.status === "open" && time.tone === "soon" && time.days !== null;
  let label = "";
  let figure = "";
  let tint = MINT;
  if (item.type === "scholarship") {
    const a = amountShort(item);
    label = a.startsWith("Up to ") ? "Up to" : "Award";
    figure = a.startsWith("Up to ") ? a.slice(6) : a;
    if (a === "Varies") tint = "#fff";
  } else {
    label = PROGRAM_KIND[item.kind].label;
    const tone = costTone(item.paid);
    figure = tone ? PAID[item.paid] : "";
    if (tone === "plain") tint = "#fff";
  }
  return (
    <HoverBeam strength={0.7}>
      <article className="dm-tap group relative flex aspect-[5/7] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", opacity: fit.when === "later" ? 0.86 : 1, background: `radial-gradient(130% 80% at 0% 0%, color-mix(in srgb, ${color} 55%, #0b0e1a), #0b0e1a 70%)` }}>
        <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet absolute inset-0 z-[3] cursor-pointer rounded-[var(--radius-lg)]" />
        {photo && <Image src={photo} alt="" fill sizes="(max-width: 640px) 70vw, 280px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />}
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,8,20,0.45) 0%, rgba(5,8,20,0) 22%, rgba(5,8,20,0) 38%, rgba(5,8,20,0.82) 64%, rgba(5,8,20,0.96) 100%)" }} />
        <header className="pointer-events-none relative z-[2] flex items-start justify-between p-[12px]">
          <Leaf e={e} />
          <span className="pointer-events-auto relative z-[4]"><SaveDot on={!!status} name={item.name} onToggle={onSave} size={36} /></span>
        </header>
        <footer className="pointer-events-none relative z-[2] flex flex-col gap-[5px] px-[16px] pb-[16px] text-white">
          {figure && (
            <span className="flex items-baseline gap-[6px]">
              <span className="text-[11px] font-semibold text-white/70">{label}</span>
              <span className="text-[24px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: tint }}>{figure}</span>
            </span>
          )}
          <span className="line-clamp-3 text-[17px] leading-[21px] font-bold" style={{ textWrap: "balance" }}>{item.name}</span>
          <span className="line-clamp-1 text-[12.5px] leading-[17px] text-white/70">{who}</span>
          <span className="mt-[4px] flex min-h-[18px] items-center justify-between gap-[8px] text-[12px] leading-[16px] font-semibold">
            {status && status !== "saved" ? (
              <span className="flex items-center gap-[4px]" style={{ color: status === "won" ? MINT : "var(--color-brand-300)" }}>{status === "won" ? <Trophy className="h-3 w-3" aria-hidden /> : <ClipboardCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>
            ) : signal && (strong || fit.when === "later") ? (
              <span className="flex min-w-0 items-center gap-[4px] truncate" style={{ color: strong ? "var(--color-brand-300)" : "rgba(255,255,255,0.7)" }}>{strong && <Check className="h-3 w-3 flex-none" strokeWidth={3} aria-hidden />}{signal}</span>
            ) : <span />}
            {soon && <span className="flex-none font-bold" style={{ color: AMBER }}>{time.days === 0 ? "Closes today" : `${time.days} day${time.days === 1 ? "" : "s"} left`}</span>}
          </span>
        </footer>
      </article>
    </HoverBeam>
  );
}
