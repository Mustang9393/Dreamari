"use client";

import { useEffect, useState } from "react";

// One polite live region for the whole app (UX audit, 11 Sept 2026: state
// changes were visual only). Anything can call announce("Saved Investment
// Banking") and a screen reader hears it; nothing on screen changes.
const EVENT = "dreamari:announce";

export function announce(message: string): void {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export function LiveRegion() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let clear: number | undefined;
    const onAnnounce = (e: Event) => {
      const text = String((e as CustomEvent<string>).detail ?? "");
      // Clear first so the same text twice in a row is still read.
      setMessage("");
      window.clearTimeout(clear);
      clear = window.setTimeout(() => setMessage(text), 40);
    };
    window.addEventListener(EVENT, onAnnounce);
    return () => { window.removeEventListener(EVENT, onAnnounce); window.clearTimeout(clear); };
  }, []);
  return <div aria-live="polite" aria-atomic="true" className="sr-only">{message}</div>;
}
