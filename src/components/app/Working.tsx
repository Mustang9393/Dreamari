"use client";

import { BorderBeam } from "border-beam";
import { LoaderCircle } from "lucide-react";

/** The app's one "it's thinking" chip: beam running round the pill, a light
 *  sweeping through the label, three dots stepping in turn. Pass the verb
 *  only ("Checking", "Generating"); the dots are the ellipsis. */
export function Working({ label, className = "" }: { label: string; className?: string }) {
  return (
    <BorderBeam size="sm" colorVariant="colorful" theme="dark" duration={2.6} strength={0.9} active>
      <span role="status" aria-live="polite" aria-label={`${label}…`} className={`inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold ${className}`} style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 88%, transparent)" }}>
        <LoaderCircle className="h-3 w-3 motion-safe:animate-spin" aria-hidden style={{ color: "var(--accent-subtle)", animationDuration: "1.4s" }} />
        <span
          aria-hidden
          className="bg-clip-text text-transparent motion-safe:animate-[dm-text-shimmer_2.2s_linear_infinite]"
          style={{ backgroundImage: "linear-gradient(90deg, var(--muted-foreground) 0%, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%, var(--muted-foreground) 100%)", backgroundSize: "200% 100%" }}
        >
          {label}
        </span>
        <span aria-hidden className="inline-flex items-end gap-[2px] pb-[2px]" style={{ color: "var(--foreground)" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="block size-[3px] rounded-full motion-safe:animate-[dm-dot-step_1.2s_ease-in-out_infinite]" style={{ background: "currentColor", animationDelay: `${i * 0.18}s` }} />
          ))}
        </span>
      </span>
    </BorderBeam>
  );
}
