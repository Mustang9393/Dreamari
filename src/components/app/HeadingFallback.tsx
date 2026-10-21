"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Every page has a level-one heading (WCAG 1.3.1 / 2.4.6, audit 21 Oct 2026).
// Several pages render their big title only from the desktop breakpoint up
// (phones show it in the top bar), so on a phone a screen reader found no h1
// to start from. When no visible h1 is on the page, this supplies a
// screen-reader-only one, named from the page's own <title>.
function needsFallback(): string | null {
  const own = Array.from(document.querySelectorAll<HTMLElement>("h1:not([data-heading-fallback])"))
    .some((h) => h.getClientRects().length > 0 && !h.closest('[aria-hidden="true"], [hidden], [role="dialog"]'));
  if (own) return null;
  const name = document.title.split(" · ")[0].trim();
  return name || null;
}

export function HeadingFallback() {
  const pathname = usePathname();
  const [title, setTitle] = useState<string | null>(null);
  useEffect(() => {
    let t = 0;
    const check = () => { t = 0; setTitle(needsFallback()); };
    const soon = () => { if (!t) t = window.setTimeout(check, 250); };
    soon();
    const mo = new MutationObserver(soon);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", soon);
    return () => { mo.disconnect(); window.removeEventListener("resize", soon); window.clearTimeout(t); };
  }, [pathname]);
  if (!title) return null;
  return <h1 data-heading-fallback className="sr-only">{title}</h1>;
}
