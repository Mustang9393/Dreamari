"use client";

// College networking, professional side (28 Sept 2026, Harvard team
// feedback via Joshua): the volunteer's own messaging setting, and the
// incoming request list with enough student context that accepting one
// isn't a blind decision -- college year, career interest, one real line of
// Dreamari activity, and their message. Accept opens a conversation right
// here; Decline is kind and needs no reason.

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Avatar, PrimaryCta, QuietCta } from "../primitives";
import { Panel, RULE } from "../ProProfile";
import { EmptyView } from "@/components/app/states";
import { Conversation } from "./Conversation";
import {
  acceptRequest,
  declineRequest,
  readMessagingSetting,
  requestsForPro,
  setMessagingSetting,
  useNetworkingStore,
  type MessagingSetting,
} from "@/lib/networking";

const SETTING_OPTIONS: { key: MessagingSetting; label: string }[] = [
  { key: "open", label: "Open to requests" },
  { key: "paused", label: "Paused" },
  { key: "public-only", label: "Public only" },
];

const SETTING_HELP: Record<MessagingSetting, string> = {
  open: "Students who follow you can send one message request. You choose who to accept.",
  paused: "No new requests for now. Students are pointed to your community board instead.",
  "public-only": "You only answer publicly, on community boards. No 1:1 requests come through.",
};

function timeAgo(at: number): string {
  const days = Math.max(0, Math.round((Date.now() - at) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function ProRequestsPanel({ proId }: { proId: string }) {
  const store = useNetworkingStore();
  const setting = readMessagingSetting(proId, store);
  const requests = requestsForPro(proId, store);
  const pending = requests.filter((r) => r.status === "pending");
  const accepted = requests.filter((r) => r.status === "accepted");
  const [openThread, setOpenThread] = useState<string | null>(accepted[0]?.id ?? null);

  return (
    <>
      <Panel
        id="networking-setting-title"
        title="Messaging"
        aside={
          <div role="tablist" aria-label="Messaging setting" className="flex flex-wrap items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)" }}>
            {SETTING_OPTIONS.map((opt) => {
              const on = opt.key === setting;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setMessagingSetting(proId, opt.key)}
                  className="dm-quiet cursor-pointer rounded-[6px] px-[10px] py-[5px] text-[12.5px] leading-[16px] font-semibold"
                  style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        }
      >
        <p className="text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{SETTING_HELP[setting]}</p>
      </Panel>

      <Panel id="networking-requests-title" title="Incoming requests" aside={pending.length > 0 ? <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{pending.length} waiting</span> : undefined}>
        {pending.length === 0 ? (
          <EmptyView tier={3} line="No requests waiting. Students who follow you can send one when you're set to Open to requests." />
        ) : (
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-col gap-[10px] border-t py-[var(--space-4)] first:border-t-0" style={{ borderColor: RULE }}>
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                  <span className="flex min-w-0 items-center gap-[8px]">
                    <Avatar name={r.studentName} size={30} />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{r.studentName}</span>
                      <span className="block text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.studentYear} · interested in {r.careerInterest} · {timeAgo(r.createdAt)}</span>
                    </span>
                  </span>
                </div>
                <p className="flex items-center gap-[5px] text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--accent-subtle)" }}>
                  <CheckCircle2 className="h-3.5 w-3.5 flex-none" aria-hidden /> {r.activity}
                </p>
                <p className="text-[14.5px] leading-[21px]" style={{ color: "var(--foreground)" }}>&ldquo;{r.message}&rdquo;</p>
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  <PrimaryCta size="sm" onClick={() => { acceptRequest(r.id); setOpenThread(r.id); }}>Accept</PrimaryCta>
                  <QuietCta size="sm" onClick={() => declineRequest(r.id)}>Decline</QuietCta>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel id="networking-conversations-title" title="Conversations" aside={accepted.length > 0 ? <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{accepted.length}</span> : undefined}>
        {accepted.length === 0 ? (
          <EmptyView tier={3} line="Accepted requests open here." />
        ) : (
          <div className="flex flex-col gap-[var(--space-4)] sm:flex-row">
            <ul className="flex flex-none flex-col gap-[2px] sm:w-[220px]">
              {accepted.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setOpenThread(r.id)}
                    className="dm-tap flex w-full cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[10px] py-[8px] text-left"
                    style={{ background: openThread === r.id ? "var(--glass-surface-2)" : "transparent" }}
                  >
                    <Avatar name={r.studentName} size={26} />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[18px] font-semibold" style={{ color: "var(--foreground)" }}>{r.studentName}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="min-w-0 flex-1 border-t pt-[var(--space-4)] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[var(--space-4)]" style={{ borderColor: RULE }}>
              {(() => {
                const thread = accepted.find((r) => r.id === openThread) ?? accepted[0];
                if (!thread) return null;
                return <Conversation requestId={thread.id} viewer="pro" otherName={thread.studentName} messages={thread.messages} />;
              })()}
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}
