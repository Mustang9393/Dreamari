"use client";

// The minimal thread that opens once a volunteer Accepts a message request
// (28 Sept 2026, college networking). Kept deliberately small rather than
// reusing the mentorship program's chat dock (mentorship/MentorshipTab.tsx):
// that component is wired to its own mentor/mentee program data shape
// (D.Message, D.THREAD, scheduling cards) built for the ongoing mentorship
// program, not a single accepted request thread -- forking it here would
// mean carrying program-only UI (scheduling, session history) that this
// feature does not have. Same visual language (bubble rows, Composer input)
// as the rest of Connect.

import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "../primitives";
import { sendMessage, type NetworkingMessage } from "@/lib/networking";

function timeAgo(at: number): string {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function Conversation({
  requestId,
  viewer,
  otherName,
  messages,
  accent = "var(--primary)",
}: {
  requestId: string;
  /** whose device this renders on -- flips bubble alignment and who Send posts as */
  viewer: "student" | "pro";
  otherName: string;
  messages: NetworkingMessage[];
  accent?: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <ul className="dm-scroll flex max-h-[360px] flex-col gap-[var(--space-3)] overflow-y-auto pr-[2px]">
        {messages.map((m, i) => {
          const mine = m.from === viewer;
          return (
            <li key={i} className={`flex items-end gap-[8px] ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar name={mine ? (viewer === "student" ? "Jordan Rivera" : otherName) : (viewer === "student" ? otherName : "Jordan Rivera")} size={26} />
              <div className={`flex max-w-[78%] flex-col gap-[3px] ${mine ? "items-end" : "items-start"}`}>
                <span className="rounded-[var(--radius-md)] px-[12px] py-[8px] text-[14px] leading-[20px]" style={{ background: mine ? accent : "var(--glass-surface-2)", color: mine ? "#FFFFFF" : "var(--foreground)" }}>
                  {m.text}
                </span>
                <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{timeAgo(m.at)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <form
        className="flex items-center gap-[8px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          sendMessage(requestId, viewer, draft);
          setDraft("");
        }}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Message {otherName}</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${otherName.split(" ")[0]}`}
            maxLength={500}
            className="min-h-[40px] w-full rounded-full border px-[14px] text-[14px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:border-[color:var(--primary)]"
            style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          />
        </label>
        <button type="submit" disabled={!draft.trim()} aria-label="Send" className="dm-solid flex size-[40px] flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-45" style={{ background: accent, color: "#FFFFFF" }}>
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
