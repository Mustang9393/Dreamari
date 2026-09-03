"use client";

// Shared Connect building blocks, split out of ConnectExperience so the
// Connect 2.0 screens (ProProfile.tsx: profiles, People to Follow, the
// professional preview) can use the same pieces without a circular import.
// Nothing here is new; every component moved verbatim.

import Image from "next/image";
import { createContext, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import type { Thread } from "./data";

/** In-page navigation for anything rendered inside Connect: lets a pro's
 *  name deep in a thread open the profile without threading callbacks
 *  through every view. Null outside the Connect tree. */
export const ConnectNav = createContext<{
  openPro: (id: string) => void;
  openThread: (id: string) => void;
  openInsight: (id: string) => void;
  openBoard: (id: string) => void;
} | null>(null);

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
  const submit = () => {
    if (!text.trim()) return;
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
        className="dm-tap flex min-h-[52px] w-full cursor-pointer items-center gap-[12px] rounded-full border px-[var(--space-4)] text-left"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}
      >
        <Avatar name="Jordan Rivera" size={30} />
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>{placeholder}</span>
        <span className="flex flex-none items-center gap-[5px] rounded-full px-[14px] py-[7px] text-[12px] leading-[16px] font-bold" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: "var(--foreground)" }}>
          Ask <ArrowRight className="h-[13px] w-[13px]" aria-hidden />
        </span>
      </button>
    );
  }
  return (
    <div className="rounded-[var(--radius-xl)] border p-[var(--space-4)]" style={{ borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))`, background: "var(--color-glass-surface-3)" }}>
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
      <div className="mt-[6px] flex flex-wrap items-center gap-[var(--space-3)] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }}>
        <span className="min-w-0 flex-1 text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          Posting as Jordan · Junior. Pros see your grade, never your full name.
        </span>
        <button type="button" onClick={() => setText((t) => t || "What does a typical week actually look like in this career?")} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-full border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--hero-accent-purple) 50%, var(--glass-border))", color: "var(--accent-subtle)", background: "color-mix(in srgb, var(--hero-accent-purple) 12%, transparent)" }}>
          <Sparkles className="h-[13px] w-[13px]" aria-hidden /> AI Ideas
        </button>
        <button type="button" onClick={() => setText((t) => t.trim() ? t.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase()).replace(/([^?.!])$/, "$1?") : t)} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-full border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Polish
        </button>
        <span className="flex-none text-[11.5px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{text.length}/280</span>
        <button type="button" onClick={() => { setOpen(false); setText(""); }} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center rounded-full border px-[13px] text-[12px] leading-[16px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={!text.trim()} className="dm-quiet flex min-h-[36px] flex-none cursor-pointer items-center gap-[5px] rounded-full px-[15px] text-[12px] leading-[16px] font-bold disabled:cursor-default disabled:opacity-50" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
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

