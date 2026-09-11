"use client";

// Keyboard users otherwise tab through the header and nav on every page
// before reaching content (UX audit, 11 Sept 2026). Visible only on focus.
export function SkipLink() {
  return (
    <a
      href="#main"
      onClick={(e) => {
        const main = document.querySelector<HTMLElement>("main");
        if (!main) return;
        e.preventDefault();
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: false });
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:rounded-[10px] focus:px-4 focus:py-2 focus:text-[14px] focus:font-bold focus:outline-none"
      style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
    >
      Skip to content
    </a>
  );
}
