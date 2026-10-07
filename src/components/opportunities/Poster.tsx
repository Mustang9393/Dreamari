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
const MINT = "var(--pc-op-green, rgb(110,231,183))";
/** Ink for the facts at the foot. Dark mode: white on the blurred, dimmed
 *  photo. Light mode (globals.css .photo-ink): navy on a frost of the page
 *  colour, the same light poster Explore Schools uses (Chandu, 7 Oct 2026,
 *  chose the light posters over keeping these dark). */
const INK = "var(--pc-ink, #fff)";
const STATUS_WORD: Record<OpportunityStatus, string> = { saved: "Saved", applied: "Applied", won: "Got it", passed: "Passed" };

/** The deadline as an editorial date stamp over the picture: a tracked
 *  small-caps month, a hairline, then the day as a big display numeral, on
 *  frosted glass (Chandu, 6 Oct 2026: "better design the calendar blocks.
 *  Make it more premium, editorial, modern. It needs more presence too").
 *  Centred in a fixed width so "1" and "31" sit the same way; the month is
 *  white, amber only when the deadline is within two weeks. */
function Leaf({ e }: { e: Enriched }) {
  const t = e.time;
  const glass: React.CSSProperties = { color: INK, background: "var(--pc-leaf-bg, rgba(5,8,20,0.5))", border: "1px solid var(--pc-leaf-border, rgba(255,255,255,0.18))", boxShadow: "var(--pc-leaf-shadow, 0 10px 30px -14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12))", backdropFilter: "blur(16px) saturate(1.4)", WebkitBackdropFilter: "blur(16px) saturate(1.4)" };
  const soon = t.status === "open" && t.tone === "soon";
  const box = "flex w-[66px] flex-col items-center rounded-[14px] px-[10px] pt-[8px] pb-[7px] text-center";
  const month = "text-[10px] leading-[12px] font-bold tracking-[0.22em] uppercase";
  const rule = "my-[5px] h-px w-full";
  if (t.status === "unknown" || !t.iso) {
    return (
      <span aria-label="No date yet" className={box} style={glass}>
        <span className={month} style={{ color: "var(--pc-ink-3, rgba(255,255,255,0.75))" }}>Date</span>
        <span aria-hidden className={rule} style={{ background: "var(--pc-rule, rgba(255,255,255,0.22))" }} />
        <span className="text-[26px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--pc-ink-2, rgba(255,255,255,0.8))" }}>?</span>
      </span>
    );
  }
  const d = new Date(`${t.iso}T12:00:00`);
  return (
    <span aria-label={closesShort(t)} title={closesShort(t)} className={box} style={glass}>
      <span aria-hidden className={month} style={{ color: soon ? `var(--pc-chip-reach, ${AMBER})` : "var(--pc-ink-2, rgba(255,255,255,0.9))" }}>{MONTHS[d.getMonth()]}</span>
      <span aria-hidden className={rule} style={{ background: soon ? `color-mix(in srgb, ${AMBER} 55%, transparent)` : "var(--pc-rule, rgba(255,255,255,0.22))" }} />
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
    if (a === "Varies") tint = INK;
  } else {
    // Always a figure, even "Pay not listed", so every card's footer is the
    // same height (Chandu, 6 Oct 2026: "Every card should be consistent").
    label = PROGRAM_KIND[item.kind].label;
    const tone = costTone(item.paid);
    figure = PAID[item.paid];
    if (tone === "plain") tint = INK;
    if (!tone) tint = "var(--pc-ink-3, rgba(255,255,255,0.6))";
  }
  return (
    <HoverBeam strength={0.7}>
      <article className="dm-tap photo-ink group relative flex aspect-[5/7] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", opacity: fit.when === "later" ? 0.86 : 1, background: `radial-gradient(130% 80% at 0% 0%, color-mix(in srgb, ${color} var(--pc-op-mix, 55%), var(--pc-shell, rgb(11 14 26))), var(--pc-shell, rgb(11 14 26)) 70%)`, boxShadow: "var(--pc-shadow, none)" }}>
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
            <span aria-hidden className="absolute inset-0" style={{ background: art.bg ?? "var(--pc-shell, rgb(11 14 26))" }} />
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
          <span aria-hidden className="absolute inset-x-[18px] top-[78px] line-clamp-4 text-[26px] leading-[28px] font-extrabold tracking-[-0.01em] uppercase" style={{ fontFamily: "var(--font-display)", color: "color-mix(in srgb, var(--pc-ink, #fff) 15%, transparent)" }}>{who}</span>
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
                backdropFilter: `blur(${step.blur}px) brightness(var(--pc-op-bright, ${step.brightness}))`,
                WebkitBackdropFilter: `blur(${step.blur}px) brightness(var(--pc-op-bright, ${step.brightness}))`,
                maskImage: `linear-gradient(180deg, transparent ${step.from}%, black ${step.to}%)`,
                WebkitMaskImage: `linear-gradient(180deg, transparent ${step.from}%, black ${step.to}%)`,
              }}
            />
          ))}
          {/* Light mode only: the page-colour frost the navy type sits on
             (display: none in dark, see globals.css .photo-frost). */}
          <span className="photo-frost absolute inset-0" />
        </span>
        <header className="pointer-events-none relative z-[2] flex items-start justify-between p-[12px]">
          <Leaf e={e} />
          <span className="pointer-events-auto relative z-[4]"><SaveDot on={!!status} name={item.name} onToggle={onSave} size={36} /></span>
        </header>
        <footer className="pointer-events-none relative z-[2] flex flex-col gap-[5px] px-[16px] pb-[16px]" style={{ color: INK }}>
          {/* Two rows, label over figure (Chandu, 6 Oct 2026: "make the
             award and full ride stuff be rows... when it's Competition
             PAYS YOU it looks really weird" on one line). */}
          {figure && (
            <span className="flex flex-col gap-[1px]">
              <span className="text-[10px] leading-[13px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--pc-ink-3, rgba(255,255,255,0.65))" }}>{label}</span>
              <span className="text-[21px] leading-[25px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: tint }}>{figure}</span>
            </span>
          )}
          {/* Always two lines tall, so the award, name and footer sit at the same
             height on every card (Chandu, 6 Oct 2026: "Every card should be
             consistent"). */}
          <span className="line-clamp-2 min-h-[42px] text-[17px] leading-[21px] font-bold" style={{ textWrap: "balance" }}>{item.name}</span>
          <span className="line-clamp-1 text-[12.5px] leading-[17px]" style={{ color: "var(--pc-ink-3, rgba(255,255,255,0.7))" }}>{who}</span>
          <span className="mt-[4px] flex min-h-[18px] items-center justify-between gap-[8px] text-[12px] leading-[16px] font-semibold">
            {status && status !== "saved" ? (
              <span className="flex items-center gap-[4px]" style={{ color: status === "won" ? MINT : "var(--pc-link, var(--color-brand-300))" }}>{status === "won" ? <Trophy className="h-3 w-3" aria-hidden /> : <ClipboardCheck className="h-3 w-3" aria-hidden />}{STATUS_WORD[status]}</span>
            ) : signal && (strong || fit.when === "later") ? (
              <span className="flex min-w-0 items-center gap-[4px] truncate" style={{ color: strong ? "var(--pc-link, var(--color-brand-300))" : "var(--pc-ink-3, rgba(255,255,255,0.7))" }}>{strong && <Check className="h-3 w-3 flex-none" strokeWidth={3} aria-hidden />}{signal}</span>
            ) : <span />}
            {soon && <span className="flex-none font-bold" style={{ color: `var(--pc-chip-reach, ${AMBER})` }}>{time.days === 0 ? "Closes today" : `${time.days} day${time.days === 1 ? "" : "s"} left`}</span>}
          </span>
        </footer>
      </article>
    </HoverBeam>
  );
}
