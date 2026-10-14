"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// Keep preview popup changes isolated from the shipping CareerReport.
export function Portal({ children, container }: { children: React.ReactNode; /** Keep a popup inside its modal accessibility tree, without a transformed ancestor. */ container?: HTMLElement | null }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const host = useMemo(() => {
    if (typeof document === "undefined") return null;
    const node = document.createElement("div");
    node.className = "marketing-v2 themeable dm-report";
    node.style.zoom = "calc(1 / var(--vz, 1))";
    return node;
  }, []);
  useEffect(() => {
    if (!host) return;
    (container ?? document.body).appendChild(host);
    return () => host.remove();
  }, [host, container]);
  if (!mounted || !host) return null;
  return createPortal(children, host);
}
