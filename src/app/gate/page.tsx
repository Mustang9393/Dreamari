"use client";

import { useEffect, useRef, useState } from "react";

// Deliberately self-contained: everything past this page is behind the
// gate (see src/middleware.ts), including /images/* and /videos/*, so this
// screen can't lean on any app asset (the wordmark mark, a font, anything
// under public/) without it 404ing for someone who hasn't unlocked yet.
// Plain text and system fonts only.
const DIGITS = 4;

export default function GatePage() {
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(""));
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function setDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError(false);
    if (digit && index < DIGITS - 1) inputs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) inputs.current[index - 1]?.focus();
  }

  async function submit(code: string) {
    setPending(true);
    setError(false);
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError(true);
        setValues(Array(DIGITS).fill(""));
        inputs.current[0]?.focus();
        return;
      }
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("next") || "/";
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    const code = values.join("");
    if (code.length === DIGITS) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 24,
        background: "#05070f",
        color: "#f5f6fb",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.02em" }}>DREAMARI</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>This preview is locked</div>
        <div style={{ fontSize: 14, color: "#9aa0b4" }}>Enter the 4-digit code to continue.</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={v}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            disabled={pending}
            style={{
              width: 48,
              height: 56,
              textAlign: "center",
              fontSize: 24,
              fontWeight: 700,
              borderRadius: 12,
              border: `1px solid ${error ? "#e0483e" : "#2a2f42"}`,
              background: "#0d0f1a",
              color: "#f5f6fb",
              outline: "none",
            }}
          />
        ))}
      </div>
      {error && <div style={{ fontSize: 13, color: "#e0483e" }}>That code's not right. Try again.</div>}
    </div>
  );
}
