"use client";

// The Career Detail page's own Connect entry point -- ported from the
// second Replit reference (dceeai.replit.app/explore-careers: view a
// career -> tap "Connect" -> "CONNECT WITH [WORLD] PROFESSIONALS", three
// rows -- Ask the community / See what professionals have shared / Find
// professionals to follow). Verbatim copy from that reference; this app
// doesn't yet support deep-linking Connect to a specific board/tab, so all
// three land on Connect's own home for now rather than silently doing
// nothing -- a real, working destination beats a fake distinction.
//
// Same portal/backdrop recipe as ConnectInterstitial.tsx (Play's between-
// levels modal): dims and blurs the page behind it, never blacks it out.

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, HelpCircle, MessageCircle, Users, X } from "lucide-react";
import { WORLD_COLORS } from "@/components/app/worlds";

const ROWS = [
  { title: "Ask", body: "Ask the community", Icon: HelpCircle },
  { title: "Answers", body: "See what professionals have shared", Icon: MessageCircle },
  { title: "People", body: "Find professionals to follow", Icon: Users },
] as const;

export function ConnectWithProfessionalsModal({ world, onClose }: { world: string; onClose: () => void }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const accent = WORLD_COLORS[world] ?? "var(--primary)";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
    setHost(document.body);
  }, []);
  useEffect(() => {
    if (!host) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [host, onClose]);

  if (!host) return null;

  function go() {
    router.push("/connect");
    onClose();
  }

  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default backdrop-blur-[14px]"
        style={{ background: "color-mix(in srgb, var(--background) 34%, transparent)" }}
      />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-pros-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-[1] flex w-full max-w-[440px] flex-col rounded-[var(--radius-xl)] border p-[24px] backdrop-blur-[22px]"
        style={{
          borderColor: "var(--color-glass-border-raised)",
          background: "color-mix(in srgb, var(--background) 92%, transparent)",
          boxShadow: `0 30px 90px -28px rgba(0,0,0,0.75), 0 0 60px -20px color-mix(in srgb, ${accent} 45%, transparent)`,
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="dm-quiet absolute top-[16px] right-[16px] flex size-[32px] cursor-pointer items-center justify-center rounded-full"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="pr-[36px] text-center">
          <h2 id="connect-pros-title" className="text-[21px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            Connect with {world} Professionals
          </h2>
          <p className="mt-[6px] text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>
            Ask a question, explore answers, or follow professionals in the field.
          </p>
        </div>

        <div className="mt-[20px] flex flex-col gap-[8px]">
          {ROWS.map(({ title, body, Icon }) => (
            <button
              key={title}
              type="button"
              onClick={go}
              className="dm-quiet flex cursor-pointer items-center gap-[14px] rounded-[var(--radius-lg)] border px-[16px] py-[14px] text-left"
              style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 88%, transparent)" }}
            >
              <span className="flex size-[38px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, color: accent }}>
                <Icon className="h-[17px] w-[17px]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{title}</span>
                <span className="block text-[12.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{body}</span>
              </span>
              <ChevronRight className="h-[16px] w-[16px] flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    host,
  );
}
