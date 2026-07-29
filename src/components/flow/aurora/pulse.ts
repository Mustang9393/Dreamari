import { playFeedback } from "./feedback";

export type AuroraPulseKind = "select" | "cta";

export type AuroraPulseDetail = {
  kind: AuroraPulseKind;
  x: number;
  y: number;
};

const EVENT_NAME = "aurora:pulse";

export function dispatchAuroraPulse(kind: AuroraPulseKind, origin?: { clientX: number; clientY: number }) {
  if (typeof window === "undefined") return;

  const x = origin?.clientX ?? window.innerWidth / 2;
  const y = origin?.clientY ?? window.innerHeight / 2;

  playFeedback(kind);
  window.dispatchEvent(new CustomEvent<AuroraPulseDetail>(EVENT_NAME, { detail: { kind, x, y } }));
}

export function onAuroraPulse(handler: (detail: AuroraPulseDetail) => void) {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    handler((event as CustomEvent<AuroraPulseDetail>).detail);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
