"use client";

// The shelf card as a portrait poster (6 Oct 2026). Chandu: "scale them
// up too? Make them more portrait looking?", and the picture must be the
// provider's own: "USE OFFICIAL ONES, OFFICIAL LOGOS, OFFICIAL GRAPHICS,
// OFFICIAL MARKETING MATERIAL", "only good HD ones". A photo (official.ts,
// fit "cover") runs full bleed with the facts on a scrim at the foot, the
// way Explore's career posters are; a logo or branded graphic ("contain")
// sits whole on its own colour above the facts.
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
import { OFFICIAL_ART } from "./official";
import { PAID, PROGRAM_KIND } from "./types";

/** The progressive blur under the text, top to bottom: light, medium,
 *  heavy, each starting lower than the last. */
const BLUR_STEPS = [
  { blur: 3, brightness: 0.86, from: 36, to: 56 },
  { blur: 10, brightness: 0.72, from: 48, to: 68 },
  { blur: 24, brightness: 0.5, from: 58, to: 86 },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MINT = "rgb(110,231,183)";
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "Got it", passed: "Passed" };

/** The deadline as an editorial date stamp over the picture: a tracked
 *  small-caps month, a hairline, then the day as a big display numeral, on
 *  frosted glass (Chandu, 6 Oct 2026: "better design the calendar blocks.
 *  Make it more premium, editorial, modern. It needs more presence too").
 *  The month turns amber when the deadline is within two weeks. */
function Leaf({ e }: { e: Enriched }) {
  const t = e.time;
  const glass: React.CSSProperties = { background: "rgba(5,8,20,0.5)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 10px 30px -14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(1.4)", WebkitBackdropFilter: "blur(16px) saturate(1.4)" };
  const soon = t.status === "open" && t.tone === "soon";
  const accent = soon ? AMBER : "var(--color-brand-300)";
  if (t.status === "unknown" || !t.iso) {
    return (
      <span aria-label="No date yet" className="flex min-w-[64px] flex-col items-start rounded-[14px] px-[12px] pt-[8px] pb-[7px] text-white" style={glass}>
        <span className="text-[9.5px] leading-[12px] font-bold tracking-[0.22em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>No date</span>
        <span aria-hidden className="my-[5px] h-px w-full" style={{ background: "rgba(255,255,255,0.22)" }} />
        <span className="text-[26px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>?</span>
      </span>
    );
  }
  const d = new Date(`${t.iso}T12:00:00`);
  return (
    <span aria-label={closesShort(t)} title={closesShort(t)} className="flex min-w-[64px] flex-col items-start rounded-[14px] px-[12px] pt-[8px] pb-[7px] text-white" style={glass}>
      <span aria-hidden className="text-[9.5px] leading-[12px] font-bold tracking-[0.22em] uppercase" style={{ color: accent }}>{MONTHS[d.getMonth()]}</span>
      <span aria-hidden className="my-[5px] h-px w-full" style={{ background: soon ? `color-mix(in srgb, ${AMBER} 55%, transparent)` : "rgba(255,255,255,0.22)" }} />
      <span aria-hidden className="text-[30px] leading-[28px] font-extrabold tracking-[-0.02em] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{d.getDate()}</span>
    </span>
  );
}

export function Poster({ e, status, onOpen, onSave }: { e: Enriched; status: OpportunityStatus | null; onOpen: () => void; onSave: () => void }) {
  const { item, time, fit } = e;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const art = OFFICIAL_ART[item.id];
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
    // Always a figure, even "Pay not listed", so every card's footer is the
    // same height (Chandu, 6 Oct 2026: "Every card should be consistent").
    label = PROGRAM_KIND[item.kind].label;
    const tone = costTone(item.paid);
    figure = PAID[item.paid];
    if (tone === "plain") tint = "#fff";
    if (!tone) tint = "rgba(255,255,255,0.6)";
  }
  return (
    <HoverBeam strength={0.7}>
      <article className="dm-tap group relative flex aspect-[5/7] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", opacity: fit.when === "later" ? 0.86 : 1, background: `radial-gradient(130% 80% at 0% 0%, color-mix(in srgb, ${color} 55%, #0b0e1a), #0b0e1a 70%)` }}>
        <button type="button" onClick={onOpen} aria-label={`Open ${item.name}`} className="dm-quiet absolute inset-0 z-[3] cursor-pointer rounded-[var(--radius-lg)]" />
        {art?.fit === "cover" ? (
          <Image src={art.src} alt="" fill sizes="(max-width: 640px) 70vw, 280px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : art ? (
          // A logo or branded graphic: large, whole and never cropped, in the
          // space above the facts. Under it, its own brand colour; over that
          // the same image again, blown up and blurred, so the colour spreads
          // across the card; then a blue-to-navy gradient blends it down into
          // the footer. It reads as one full-bleed poster, not a logo on a
          // box (Chandu, 6 Oct 2026: "duplicate the image, fill and extend it
          // so it looks full bleed. Use progressive blue to blend everything
          // together"; "what you did 1 step back was perfect").
          <>
            <span aria-hidden className="absolute inset-0" style={{ background: art.bg ?? "#0b0e1a" }} />
            {!art.opaque && <Image src={art.src} alt="" fill sizes="(max-width: 640px) 70vw, 280px" className="scale-[1.7] object-cover opacity-80 blur-[30px]" />}
            <span aria-hidden className="absolute inset-x-0 top-0 bottom-[44%]">
              <Image src={art.src} alt="" fill sizes="(max-width: 640px) 70vw, 280px" className="object-contain px-[14px] pt-[56px] pb-[6px] transition-transform duration-500 group-hover:scale-[1.04]" />
            </span>
            {/* The gradient sits above the logo too, so a graphic with its own
               opaque field (Coolidge's green) takes the same tint as the fill
               around it and no box edge shows (Chandu: "extend the green"). */}
          </>
        ) : (
          // No official image could be found for this provider: its name, set
          // large, on the career world's colour.
          <span aria-hidden className="absolute inset-x-[18px] top-[78px] line-clamp-4 text-[26px] leading-[28px] font-extrabold tracking-[-0.01em] text-white/15 uppercase" style={{ fontFamily: "var(--font-display)" }}>{who}</span>
        )}
        {/* The text sits on a progressive blur, not a colour gradient: three
           backdrop-blur layers, each masked to start lower and blur harder,
           with a gentle brightness drop so white type reads on a light
           field too. The picture or logo field itself runs on, untinted
           (Chandu, 6 Oct 2026: "I just want the image background to
           naturally extend full bleed. For the text scrim we use a
           progressive blur rather than a colour gradient"). */}
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {BLUR_STEPS.map((step) => (
            <span
              key={step.blur}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${step.blur}px) brightness(${step.brightness})`,
                WebkitBackdropFilter: `blur(${step.blur}px) brightness(${step.brightness})`,
                maskImage: `linear-gradient(180deg, transparent ${step.from}%, black ${step.to}%)`,
                WebkitMaskImage: `linear-gradient(180deg, transparent ${step.from}%, black ${step.to}%)`,
              }}
            />
          ))}
        </span>
        <header className="pointer-events-none relative z-[2] flex items-start justify-between p-[12px]">
          <Leaf e={e} />
          <span className="pointer-events-auto relative z-[4]"><SaveDot on={!!status} name={item.name} onToggle={onSave} size={36} /></span>
        </header>
        <footer className="pointer-events-none relative z-[2] flex flex-col gap-[5px] px-[16px] pb-[16px] text-white">
          {/* Two rows, label over figure (Chandu, 6 Oct 2026: "make the
             award and full ride stuff be rows... when it's Competition
             PAYS YOU it looks really weird" on one line). */}
          {figure && (
            <span className="flex flex-col gap-[1px]">
              <span className="text-[10px] leading-[13px] font-semibold tracking-[0.06em] text-white/65 uppercase">{label}</span>
              <span className="text-[21px] leading-[25px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: tint }}>{figure}</span>
            </span>
          )}
          {/* Always two lines tall, so the award, name and footer sit at the same
             height on every card (Chandu, 6 Oct 2026: "Every card should be
             consistent"). */}
          <span className="line-clamp-2 min-h-[42px] text-[17px] leading-[21px] font-bold" style={{ textWrap: "balance" }}>{item.name}</span>
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
