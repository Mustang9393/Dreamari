"use client";

// Keyboard users otherwise tab through the header and nav on every page
// before reaching content (UX audit, 11 Sept 2026). Visible only on focus.
// The target is the page's visible <main> (WCAG 2.2 audit, 21 Oct 2026): the
// landing page keeps a hidden second <main> for its Schools view, and a
// detail page open in a sheet carries its own <main> inside the dialog, so
// the first <main> in the document was sometimes the wrong one. Whatever it
// finds gets id="main", so the link's own #main target resolves too.
function target(): HTMLElement | null {
  const byId = document.getElementById("main");
  if (byId && byId.getClientRects().length) return byId;
  const mains = Array.from(document.querySelectorAll<HTMLElement>('main, [role="main"]'));
  return mains.find((m) => !m.closest('[role="dialog"]') && m.getClientRects().length) ?? null;
}

export function SkipLink() {
  return (
    <a
      href="#main"
      onFocus={() => { const main = target(); if (main && !main.id) main.id = "main"; }}
      onClick={(e) => {
        const main = target();
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
