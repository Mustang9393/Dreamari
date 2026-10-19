"use client";

// DEMO-ONLY: the color theme switch for the black-and-blue look
// (src/app/look-v2.css). A small labelled control fixed to the bottom-left
// of every student-facing page, so the team can flip Classic / Black & Blue
// on any screen while reviewing (19 Oct 2026, Chandu: "a small control on the
// bottom of the page on the left to toggle the color theme. Remove from the
// hamburger menu."). Same state as ?look=v2 / ?look=v1. Not on the Counselor
// Dashboard (its own app and look) and never printed.
import { usePathname } from "next/navigation";
import { setLookV2, useLookV2 } from "./look";

const OPTIONS = [
  { v2: false, label: "Classic" },
  { v2: true, label: "Black & Blue" },
] as const;

export function ColorThemeSwitch() {
  const lookV2 = useLookV2();
  const path = usePathname() ?? "";
  if (path === "/counselor" || path.startsWith("/counselor/")) return null;
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      // marketing-v2 themeable: the app's colour variables live in that scope
      // (it sets variables only), so the switch follows light/dark like the
      // page; the fallbacks cover routes that never load tokens.css.
      // Above the phone/tablet tab bar (50px / 58px plus the home indicator),
      // in the corner on desktop where there is no tab bar.
      className="marketing-v2 themeable no-print fixed left-[12px] z-[45] flex items-center gap-[2px] rounded-[11px] border p-[3px] bottom-[calc(62px+env(safe-area-inset-bottom))] md:bottom-[calc(70px+env(safe-area-inset-bottom))] lg:bottom-[16px] lg:left-[16px]"
      style={{
        background: "color-mix(in srgb, var(--background, #05070f) 90%, transparent)",
        borderColor: "var(--glass-border, rgba(255,255,255,0.09))",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 22px -14px rgb(0 0 0 / 0.6)",
        fontFamily: "var(--font-body)",
        // light mode's tokens.css block gives every .marketing-v2.themeable
        // min-height: 100% (meant for page roots); this is a small control
        minHeight: "auto",
      }}
    >
      <span className="px-[7px] text-[10.5px] leading-[14px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground, rgba(255,255,255,0.62))" }}>
        Color
      </span>
      {OPTIONS.map((option) => {
        const on = option.v2 === lookV2;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setLookV2(option.v2)}
            className="dm-quiet min-h-[28px] cursor-pointer rounded-[8px] px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap"
            style={{
              background: on ? "var(--primary, #2f6bf2)" : "transparent",
              color: on ? "var(--primary-foreground, #ffffff)" : "var(--foreground, #f4f7ff)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
