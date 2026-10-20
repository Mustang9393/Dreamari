"use client";

// DEMO-ONLY: the Career Detail v1/v2 switch (lib/careerDetailV2), at the foot
// of the page and quiet, like the profile switch was, so it never competes
// with the page itself. Same as ?cd=v2 / ?cd=v1.
import { setCareerDetailV2, useCareerDetailV2 } from "@/lib/careerDetailV2";

export function CareerDetailV2Switch() {
  const on = useCareerDetailV2();
  return (
    <div className="flex justify-end">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setCareerDetailV2(!on)}
        className="dm-quiet flex cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] px-[8px] py-[4px] text-[11px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        v2 career page
        <span aria-hidden className="relative h-[14px] w-[24px] flex-none rounded-full transition-colors" style={{ background: on ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 22%, transparent)" }}>
          <span className="absolute top-[2px] size-[10px] rounded-full bg-white transition-[left] duration-200" style={{ left: on ? 12 : 2 }} />
        </span>
      </button>
    </div>
  );
}
