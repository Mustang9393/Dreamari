"use client";

import { useEffect } from "react";

import { installErrorReporting } from "@/lib/errorReporting";

/** Mounted once in the root layout. Renders nothing -- it only attaches the
 *  window-level error/rejection listeners as early as possible. */
export function ErrorReporter() {
  useEffect(() => {
    installErrorReporting();
  }, []);
  return null;
}
