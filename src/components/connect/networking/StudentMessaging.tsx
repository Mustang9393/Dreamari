"use client";

// College networking: the student-facing half of Follow -> Prepare in
// Dreamari -> Send one request -> Volunteer accepts -> Conversation opens
// (28 Sept 2026, Harvard team feedback via Joshua). Lives on the pro profile
// view (ProProfile.tsx), shown only in the College POV (pov.tsx) -- High
// School keeps today's Follow-and-public-boards model, no messages.
//
// Rules this component enforces in the UI (networking.ts enforces them
// again at the store, so nothing can route around them): must Follow before
// a request can be sent; one request per pro until it is accepted or
// declined; a weekly allowance of 3, extra earned by Play activity, hard
// capped at 7.

import { useState } from "react";
import { Clock, Lock, MessagesSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { Composer, QuietCta } from "../primitives";
import { Conversation } from "./Conversation";
import {
  describeRecentActivity,
  readAllowance,
  readMessagingSetting,
  requestFor,
  sendRequest,
  useNetworkingStore,
  withdrawRequest,
  NETWORK_STUDENT_YEAR,
  type MessagingSetting,
} from "@/lib/networking";

const SETTING_COPY: Record<Exclude<MessagingSetting, "open">, string> = {
  paused: "isn't taking new messages right now",
  "public-only": "answers questions publicly only",
};

export function StudentMessaging({
  proId,
  proName,
  careerInterest,
  following,
  onAskInCommunity,
}: {
  proId: string;
  proName: string;
  /** the pro's specific field, e.g. "Investment Banking" -- attached to the request so it reads as more than a cold DM */
  careerInterest: string;
  following: boolean;
  /** opens the pro's home community board -- the fallback when messaging isn't open */
  onAskInCommunity?: () => void;
}) {
  const store = useNetworkingStore();
  const setting = readMessagingSetting(proId, store);
  const request = requestFor(proId, store);
  const allowance = readAllowance(store);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const firstName = proName.split(" ")[0];

  if (setting !== "open") {
    return (
      <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <p className="text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>
          {firstName} {SETTING_COPY[setting]}. You can still ask in Community.
        </p>
        {onAskInCommunity && <QuietCta size="sm" className="w-fit" onClick={onAskInCommunity}><MessagesSquare className="h-3.5 w-3.5" aria-hidden /> Ask in Community</QuietCta>}
      </div>
    );
  }

  if (!following) {
    return (
      <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <p className="flex items-center gap-[6px] text-[14px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          <Lock className="h-3.5 w-3.5 flex-none" aria-hidden /> Follow {firstName} to unlock messaging
        </p>
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          Following doesn&apos;t ask anything of {firstName}. It just lets you prepare one message request when you&apos;re ready.
        </p>
      </div>
    );
  }

  if (request?.status === "accepted") {
    return (
      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Messaging {proName}</p>
        <Conversation requestId={request.id} viewer="student" otherName={proName} messages={request.messages} />
      </div>
    );
  }

  if (request?.status === "pending") {
    return (
      <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <p className="flex items-center gap-[6px] text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
          <Clock className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} /> Request sent · waiting for {firstName}
        </p>
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          You&apos;ll hear back here, or by notification. No more messages until {firstName} accepts.
        </p>
        {confirmWithdraw ? (
          <div className="flex flex-wrap items-center gap-[10px] pt-[2px]">
            <span className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--foreground)" }}>Withdraw this request? You&apos;ll get the slot back.</span>
            <div className="flex items-center gap-[8px]">
              <button type="button" onClick={() => { withdrawRequest(request.id); setConfirmWithdraw(false); }} className="dm-link cursor-pointer text-[12.5px] leading-[16px] font-bold" style={{ color: "var(--color-feedback-danger, #ff6b6b)" }}>Yes, withdraw</button>
              <button type="button" onClick={() => setConfirmWithdraw(false)} className="dm-link cursor-pointer text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Never mind</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmWithdraw(true)} className="dm-link w-fit cursor-pointer text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Withdraw request</button>
        )}
      </div>
    );
  }

  // no request yet, or the last one was declined: composer is available
  if (allowance.remaining <= 0) {
    return (
      <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <p className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>You&apos;ve used all {allowance.total} networking requests this week</p>
        <p className="flex items-center gap-[5px] text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          <Sparkles className="h-3.5 w-3.5 flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
          Play simulations and glossary games to earn more.{" "}
          <Link href="/play" className="dm-link font-semibold" style={{ color: "var(--accent-subtle)" }}>Go to Play</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {request?.status === "declined" && (
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
          {firstName} wasn&apos;t able to take this one. You can send a new request whenever you&apos;re ready.
        </p>
      )}
      <Composer
        id={`network-request-${proId}`}
        value={draft}
        onChange={(v) => { setDraft(v); setError(null); }}
        onSubmit={() => {
          const result = sendRequest({ proId, careerInterest, activity: describeRecentActivity(), message: draft, studentYear: NETWORK_STUDENT_YEAR });
          if (!result.ok) {
            setError(result.reason === "no-allowance" ? "You're out of requests for this week." : "A request to this volunteer is already waiting.");
            return;
          }
          setDraft("");
        }}
        submitLabel="Send request"
        placeholder={`Ask ${firstName} one focused question about their path into ${careerInterest.toLowerCase()}.`}
        maxLength={400}
        rows={3}
      />
      {error && <p className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--color-feedback-danger, #ff6b6b)" }}>{error}</p>}
      <p className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {allowance.remaining} of {allowance.total} networking requests left this week
        {allowance.earnedExtra > 0 ? ` (${allowance.base} base + ${allowance.earnedExtra} earned)` : ""}. <Link href="/play" className="dm-link" style={{ color: "var(--accent-subtle)" }}>Earn more in Play</Link>
      </p>
    </div>
  );
}
