"use client";

// Shared Connect building blocks, split out of ConnectExperience so the
// Connect 2.0 screens (ProProfile.tsx: profiles, People to Follow, the
// professional preview) can use the same pieces without a circular import.
// Nothing here is new; every component moved verbatim.

import Image from "next/image";
import { createContext, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { PROS, type Thread } from "./data";

/** In-page navigation for anything rendered inside Connect: lets a pro's
 *  name deep in a thread open the profile without threading callbacks
 *  through every view. Null outside the Connect tree. */
export const ConnectNav = createContext<{
  openPro: (id: string) => void;
  openThread: (id: string) => void;
  openInsight: (id: string) => void;
  openBoard: (id: string) => void;
  openSaved: () => void;
  /** a question was posted from any composer: lands in "Your questions" */
  noteAsked: (title: string, boardId: string) => void;
  /** opens the report sheet for a thread, answer, post or comment id */
  report: (id: string) => void;
} | null>(null);

/** Phone numbers, emails, @handles and DM apps have no place in a public
 *  question. The check is a client-side assist only (handoff 11.2); the
 *  draft is preserved and the student is told why. */
export const CONTACT_INFO = /\S+@\S+\.\S+|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|(^|\s)@\w{3,}|\b(snap(chat)?|whatsapp|discord|telegram|dm me|text me)\b/i;
export const CONTACT_WARNING = "Keep phone numbers, emails and usernames out. Pros answer here in public, and that keeps everyone safe.";

/** "9,418" for profile totals; "8.4K" (compact) for per-post views -- the two
 *  formats the Connect 2.0 doc uses. */
export function formatCount(n: number, mode: "grouped" | "compact" = "grouped"): string {
  if (mode === "compact" && n >= 10000) {
    const k = n / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toLocaleString("en-US");
}

// ——— status vocabulary (handoff 11.3 / 8.4): text plus color ———
export const STATE_LABEL: Record<Thread["state"], string> = {
  awaiting: "Waiting for an answer",
  routed: "Waiting for an answer",
  answered: "Answered",
  resolved: "Answered",
};
export const STATE_COLOR: Record<Thread["state"], string> = {
  awaiting: "var(--muted-foreground)",
  routed: "var(--accent-subtle)",
  answered: "var(--world-food-farming-nature)",
  resolved: "var(--world-food-farming-nature)",
};

// Avatar photos are PARKED for the pitch (direct feedback: mixed cartoons
// and photos read as random) -- every avatar renders as initials until
// USE_PHOTO_AVATARS flips back on. The portrait set and mapping stay.
const USE_PHOTO_AVATARS = false;

// Photo avatars (behind the flag above), initials only as the fallback
// for a name with no portrait. The pool is a committed set of demo portraits
// (public/images/connect/avatars); each named person maps to ONE photo, and
// no two people who share a screen share a face. Jordan (the signed-in
// student) wears their real profile photo.
const AV = "/images/connect/avatars";
const AVATAR_PHOTO: Record<string, string> = {
  "Jordan Rivera": "/images/avatar-jordan.jpg",
  Jordan: "/images/avatar-jordan.jpg",
  // Verified professionals
  "David Chen": `${AV}/m36.jpg`,
  "Elena Martinez": `${AV}/w22.jpg`,
  "Amara Okafor": `${AV}/w45.jpg`,
  "Marcus Reyes": `${AV}/m47.jpg`,
  "Jasmine Cole": `${AV}/w31.jpg`,
  "Nadia Osei": `${AV}/w28.jpg`,
  "Wei Zhang": `${AV}/m29.jpg`,
  "Tom Gallagher": `${AV}/m11.jpg`,
  "Sofia Grant": `${AV}/w5.jpg`,
  "Andre Whitfield": `${AV}/m55.jpg`,
  "Keiko Tanaka": `${AV}/w63.jpg`,
  "Danielle Brooks": `${AV}/w41.jpg`,
  "Leo Fontaine": `${AV}/m77.jpg`,
  "Omar Haddad": `${AV}/m68.jpg`,
  "Camille Vega": `${AV}/w52.jpg`,
  // Students wear friendly illustrated avatars (micah, generated per
  // handle), never real photos -- on-brand for a teen product and no real
  // minor's face is ever implied. Professionals keep realistic portraits:
  // credibility is their whole job here.
  Ethan: `${AV}/c-Ethan.png`,
  Priya: `${AV}/c-Priya.png`,
  Maya: `${AV}/c-Maya.png`,
  Zoe: `${AV}/c-Zoe.png`,
  Sam: `${AV}/c-Sam.png`,
  Lena: `${AV}/c-Lena.png`,
  Ava: `${AV}/c-Ava.png`,
  Diego: `${AV}/c-Diego.png`,
  Sana: `${AV}/c-Sana.png`,
  Ruby: `${AV}/c-Ruby.png`,
  Theo: `${AV}/c-Theo.png`,
  Jo: `${AV}/c-Jo.png`,
  Amir: `${AV}/c-Amir.png`,
  Devon: `${AV}/c-Devon.png`,
  Riley: `${AV}/c-Riley.png`,
  Noah: `${AV}/c-Noah.png`,
  Marcus: `${AV}/c-Riley.png`,
};

// A verified badge overlaps the corner exactly like the app's other verified
// affordances — a small ShieldCheck on a solid chip, never color alone.
export function Avatar({ name, size = 34, verified }: { name: string; size?: number; verified?: boolean }) {
  // Professionals always wear their portrait; students stay behind the flag.
  const isPro = PROS.some((p) => p.name === name);
  const photo = USE_PHOTO_AVATARS || isPro ? AVATAR_PHOTO[name] : undefined;
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="relative inline-flex flex-none" style={{ width: size, height: size }}>
      {photo ? (
        <Image src={photo} alt="" width={128} height={128} className="h-full w-full rounded-full object-cover" style={{ background: "var(--secondary)" }} />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-bold"
          style={{
            background: verified ? "var(--primary)" : "var(--secondary)",
            color: verified ? "#FFFFFF" : "var(--foreground)",
            fontSize: Math.max(11, size * 0.4),
            fontFamily: "var(--font-body)",
          }}
        >
          {initials}
        </span>
      )}
      {verified && (
        <span role="img" aria-label="Verified" className="absolute right-[-2px] bottom-[-2px] flex items-center justify-center rounded-full border-2" style={{ width: size * 0.46, height: size * 0.46, background: "var(--color-glass-surface-3)", borderColor: "var(--color-glass-surface-3)" }}>
          <ShieldCheck aria-hidden style={{ width: size * 0.34, height: size * 0.34, color: "var(--accent-subtle)" }} />
        </span>
      )}
    </span>
  );
}


export function InlineAsk({
  joined,
  onRequireJoin,
  onPost,
  placeholder = "Ask this community anything…",
  accent = "var(--primary)",
}: {
  joined: boolean;
  onRequireJoin?: () => void;
  onPost: (text: string) => void;
  placeholder?: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const blocked = CONTACT_INFO.test(text);
  const submit = () => {
    if (!text.trim() || blocked) return;
    dispatchAuroraPulse("cta");
    onPost(text.trim());
    setText("");
    setOpen(false);
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => (joined ? setOpen(true) : onRequireJoin?.())}
        className="dm-tap flex min-h-[52px] w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-left"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
      >
        <Avatar name="Jordan Rivera" size={30} />
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>{placeholder}</span>
        <span className="flex flex-none items-center gap-[5px] rounded-[var(--radius-sm)] px-[14px] py-[7px] text-[12px] leading-[16px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: "var(--foreground)" }}>
          Ask <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
        </span>
      </button>
    );
  }
  return (
    <div className="rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: "var(--color-glass-surface-3)" }}>
      <div className="flex items-start gap-[12px]">
        <Avatar name="Jordan Rivera" size={30} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Your question</span>
          <textarea
            autoFocus
            value={text}
            maxLength={280}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none bg-transparent text-[14px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)]"
            style={{ color: "var(--foreground)" }}
          />
        </label>
      </div>
      {blocked && (
        <p role="alert" className="mt-[4px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--world-business-money-office)" }}>{CONTACT_WARNING}</p>
      )}
      <div className="mt-[6px] flex flex-wrap items-center gap-[var(--space-3)] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }}>
        <span className="min-w-0 flex-1 text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          Posting as Jordan · Junior. Pros see your grade, never your full name.
        </span>
        <button type="button" onClick={() => setText((t) => t || "What does a typical week actually look like in this career?")} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-[var(--radius-sm)] border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--hero-accent-purple) 50%, var(--glass-border))", color: "var(--accent-subtle)", background: "color-mix(in srgb, var(--hero-accent-purple) 12%, transparent)" }}>
          <Sparkles className="h-[13px] w-[13px]" aria-hidden /> AI Ideas
        </button>
        <button type="button" onClick={() => setText((t) => t.trim() ? t.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase()).replace(/([^?.!])$/, "$1?") : t)} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Polish
        </button>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{text.length}/280</span>
        <button type="button" onClick={() => { setOpen(false); setText(""); }} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={!text.trim() || blocked} className="dm-solid flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-[var(--radius-sm)] px-[15px] text-[12px] leading-[16px] font-bold disabled:cursor-default disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
          Post <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}


/** A just-posted question, optimistic: it lands at the top of the feed
 *  immediately with its routing state, so posting feels alive. */
export function LocalQuestionCard({ title }: { title: string }) {
  return (
    <div className="rounded-[var(--radius-xl)] border p-[var(--space-5)] motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]" style={{ background: "var(--color-glass-surface-3)", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))" }}>
      <div className="flex flex-wrap items-center gap-[8px]">
        <Avatar name="Jordan Rivera" size={28} />
        <span className="text-[12.5px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>Jordan</span>
        <span className="text-[11px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Just now</span>
      </div>
      <p className="mt-[8px] text-[15px] leading-[21px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>&ldquo;{title}&rdquo;</p>
      <p className="mt-[6px] flex items-center gap-[5px] text-[11.5px] leading-[16px] font-semibold" style={{ color: STATE_COLOR.awaiting }}>
        <Clock className="h-3 w-3" aria-hidden /> Sent to verified pros. Answers usually land within 48 hours.
      </p>
    </div>
  );
}


export function Card({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border p-[var(--space-5)] ${className}`}
      // the app's frosted panel (career page, Connect boards)
      style={{
        background: accent ? `color-mix(in srgb, ${accent} 8%, var(--glass-surface-2))` : "var(--glass-surface-2)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: accent ? `color-mix(in srgb, ${accent} 30%, rgba(255,255,255,0.16))` : "rgba(255,255,255,0.16)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -28px rgba(0,0,0,0.6)",
      }}
    >
      {children}
    </div>
  );
}


export function PrimaryCta({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dm-solid flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] leading-[20px] font-semibold ${className}`}
      style={{ background: "var(--primary)", color: "#FFFFFF" }}
    >
      {children}
    </button>
  );
}


// `done`: the confirmed state of the SAME control -- filled with the success
// tint plus a check, and aria-pressed so the data-connect lift rule fires once
// as it flips. The label doesn't change; the state does, visibly.
export function QuietCta({ children, onClick, className = "", done = false }: { children: React.ReactNode; onClick?: () => void; className?: string; done?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done || undefined}
      className={`dm-quiet flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] leading-[20px] font-semibold ${className}`}
      style={
        done
          ? { borderColor: "color-mix(in srgb, var(--world-food-farming-nature) 55%, var(--border))", color: "var(--foreground)", background: "color-mix(in srgb, var(--world-food-farming-nature) 14%, var(--glass-surface-1))" }
          : { borderColor: "var(--border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }
      }
    >
      {done && <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--world-food-farming-nature)" }} />}
      {children}
    </button>
  );
}


export function SectionHead({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
      {children}
    </h2>
  );
}

// CEO's photography in the band, with the poster card's legibility stack
// (progressive blur, vignette, top scrim, grain) so the title always reads.
// Real company marks for the "Professionals from" chips (Wikimedia Commons,
// 2026-09-03, committed under public/images/logos/companies), drawn as a
// white silhouette through a CSS mask (direct feedback: no white tiles; the
// logo in white on the chip). `w` is each mark's rendered width at 12px
// tall, so wordmarks and square marks take the room their shape needs. A
// company with no exact current mark would get a text-only chip; today every
// company in the data has one.
// Microsoft uses the 2012 wordmark, not the four-square symbol, for the same reason.
export const COMPANY_MARKS: Record<string, { file: string; aspect: number; height?: number }> = {
  "JPMorgan Chase": { file: "jpmorgan-chase", aspect: 4.93 },
  // the two-line serif wordmark (Wikimedia Commons "Goldman Sachs logo.svg"),
  // not the blue box: a filled square masks to a blank tile. Two lines need
  // more height than a one-line wordmark to stay legible.
  "Goldman Sachs": { file: "goldman-sachs", aspect: 2.39, height: 16 },
  // the current one-word wordmark (Commons "The Blackstone Group logo (2).svg"),
  // its black backing rectangle removed so only the letters mask
  Blackstone: { file: "blackstone", aspect: 6.27 },
  Amazon: { file: "amazon", aspect: 3.31 },
  EY: { file: "ey", aspect: 0.99 },
  Google: { file: "google", aspect: 3.04 },
  Deloitte: { file: "deloitte", aspect: 5.31 },
  "Morgan Stanley": { file: "morgan-stanley", aspect: 6.74 },
  Microsoft: { file: "microsoft", aspect: 4.69 },
  Meta: { file: "meta", aspect: 4.96 },
  Apple: { file: "apple", aspect: 0.81 },
  "CVS Health": { file: "cvs-health", aspect: 8.2 },
  "Johnson & Johnson": { file: "johnson-johnson", aspect: 5.51 },
  Pfizer: { file: "pfizer", aspect: 2.44 },
  "Mayo Clinic": { file: "mayo-clinic", aspect: 0.92 },
  Disney: { file: "disney", aspect: 2.41 },
  Nike: { file: "nike", aspect: 2.82 },
  Spotify: { file: "spotify", aspect: 1.0 },
  Netflix: { file: "netflix", aspect: 3.7 },
  Adobe: { file: "adobe", aspect: 3.8 },
};

// Equal visual weight (direct feedback: letters the same height, chips the
// same height, nothing too big or small). Every SVG is trimmed to its ink
// bounds (viewBox rewritten from a rendered alpha scan, 2026-09-03), so the
// box IS the letters: wordmarks render 11px tall and as wide as their own
// letters need; compact symbol marks (aspect under 1.3) render 14px tall.
export function markBox(aspect: number, override?: number): { width: number; height: number } {
  const height = override ?? (aspect < 1.3 ? 14 : aspect > 6 ? 13 : 11);
  return { width: Math.round(height * aspect), height };
}

export function CompanyChip({ name, tone = "photo" }: { name: string; tone?: "photo" | "surface" }) {
  const mark = COMPANY_MARKS[name];
  const onPhoto = tone === "photo";
  const ink = onPhoto ? "#FFFFFF" : "var(--foreground)";
  // Logo only when we have the real mark (direct feedback); the name stays
  // for screen readers and as the fallback when no exact mark exists.
  return (
    <span
      className="group/chip relative inline-flex h-[28px] flex-none items-center rounded-[var(--radius-sm)] border px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap focus-visible:outline-none"
      title={name}
      tabIndex={mark ? 0 : undefined}
      style={{
        background: onPhoto ? "rgba(12,16,35,0.55)" : "var(--glass-surface-1)",
        borderColor: onPhoto ? "rgba(255,255,255,0.16)" : "var(--glass-border)",
        color: ink,
        textShadow: "none",
      }}
    >
      {mark ? (
        <>
          <span
            aria-hidden
            className="block flex-none"
            style={{
              ...markBox(mark.aspect, mark.height),
              background: ink,
              maskImage: `url(/images/logos/companies/${mark.file}.svg)`,
              WebkitMaskImage: `url(/images/logos/companies/${mark.file}.svg)`,
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
          <span className="sr-only">{name}</span>
          {/* the name, on hover or keyboard focus, for anyone unsure of a mark */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-[30px] left-0 rounded-[var(--radius-sm)] px-[8px] py-[4px] text-[11px] leading-[14px] font-semibold whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100"
            style={{ background: "rgba(9,10,20,0.92)", color: "#FFFFFF", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.8)" }}
          >
            {name}
          </span>
        </>
      ) : (
        name
      )}
    </span>
  );
}

/** The bare white-silhouette mark, no chip: for a line like "Brand
 *  Strategist at [EY]" beside text, sized so the letters sit at text
 *  x-height (a wordmark 11px tall, a compact symbol 14px). Falls back to the
 *  company's name when no exact mark exists, so the line never goes blank. */
export function CompanyMark({ name, ink = "currentColor", className = "", height }: { name: string; ink?: string; className?: string; /** override the mark's letter height, e.g. for a heading */ height?: number }) {
  const mark = COMPANY_MARKS[name];
  if (!mark) return <span className={className}>{name}</span>;
  return (
    <span className={`inline-flex items-center ${className}`} title={name}>
      <span
        aria-hidden
        className="block flex-none"
        style={{
          ...markBox(mark.aspect, height ?? mark.height),
          background: ink,
          maskImage: `url(/images/logos/companies/${mark.file}.svg)`,
          WebkitMaskImage: `url(/images/logos/companies/${mark.file}.svg)`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
