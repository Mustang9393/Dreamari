"use client";

// The AT&T x Connected Learning Centers board: Joshua's Connect update
// (Student / Volunteer / Enterprise views) rendered in this app's own
// language -- Connect's board banner, Segmented tabs, Panel surfaces, the
// shared CTA/Follow/Avatar/CompanyChip primitives and the dashboards' metric
// tiles and area chart. Every string comes from attData.ts (verbatim from
// the source); nothing here invents copy. Self-contained on purpose: the
// rest of Connect is untouched, and ConnectExperience routes `?board=` here
// by id.

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  Bookmark, BookmarkCheck, Briefcase, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, Lightbulb, Megaphone,
  MessageCircle, MessageSquarePlus, MessagesSquare, ThumbsUp, UserRound, Users,
} from "lucide-react";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { Avatar, CompanyChip, PrimaryCta, QuietCta, SectionHead, SectionSurface, VerifiedBadge } from "../primitives";
import { AreaChart, MetricTile, Segmented, ruledCell } from "../viz";
import { FollowButton, Panel, RULE } from "../ProProfile";
import * as D from "./attData";

const accent = D.ATT.brand.color;
const FIELD_CLASS = "w-full rounded-[var(--radius-md)] border px-[14px] py-[11px] text-[14.5px] leading-[20px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:border-[color:var(--primary)]";
const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
// Nested cards sit a step above the panel they live in (direct feedback,
// 17 Sept 2026: "give some elevation to nested cards, refer how the Replit's
// content is delivered"): a lighter surface plus the same soft shadow the
// panels themselves wear, so title > subtitle > body reads inside each card.
const ITEM = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 14px 32px -22px rgba(0,0,0,0.6)" } as const;

function Eyebrow({ children, tone = accent }: { children: ReactNode; tone?: string }) {
  return <span className="block text-[11px] leading-[15px] font-extrabold tracking-[0.08em] uppercase" style={{ color: tone }}>{children}</span>;
}
function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] leading-[19px] ${className}`} style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}
function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dm-link flex w-fit cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>
      {children}
    </button>
  );
}
function Submitted({ text = D.SUBMITTED }: { text?: string }) {
  return (
    <span role="status" className="flex items-center gap-[6px] text-[13.5px] leading-[19px] font-bold" style={{ color: "var(--world-food-farming-nature)" }}>
      <CheckCircle2 className="h-4 w-4" aria-hidden /> {text}
    </span>
  );
}
function ProLine({ id, size = 36 }: { id: string; size?: number }) {
  const pro = D.ATT_PROS[id];
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[10px]">
      <Avatar name={pro.name} size={size} />
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-[5px] text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>
          <span className="truncate">{pro.name}</span> <VerifiedBadge size={14} />
        </span>
        {/* one line, always: the designation truncates rather than wrapping,
           so every card's header is the same height and the question below
           starts at the same place (direct feedback, 17 Sept 2026) */}
        <span className="flex min-w-0 items-center gap-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
          <span className="min-w-0 truncate" title={pro.role}>{pro.role}</span> <span className="flex-none"><CompanyChip name={pro.org} tone="surface" size="sm" /></span>
        </span>
      </div>
    </div>
  );
}

// ——— Student ———

function InsightCard({ item, onAsk }: { item: typeof D.STUDENT_INSIGHTS[number]; onAsk: () => void }) {
  const [liked, setLiked] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [comment, setComment] = useState<string>();
  const pill = (on: boolean) => ({
    borderColor: on ? `color-mix(in srgb, ${accent} 55%, var(--glass-border))` : "var(--glass-border)",
    background: on ? `color-mix(in srgb, ${accent} 16%, transparent)` : "var(--glass-surface-1)",
    color: on ? accent : "var(--foreground)",
  });
  return (
    <article className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <ProLine id={item.pro} />
      <h3 className="text-[16px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.question}</h3>
      <p className="text-[14.5px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>&ldquo;{item.quote}&rdquo;</p>
      <div className="mt-auto flex flex-wrap gap-[8px] pt-[4px]">
        <button type="button" aria-pressed={liked} onClick={() => setLiked((v) => !v)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[6px] rounded-[999px] border px-[12px] text-[12.5px] font-semibold" style={pill(liked)}>
          <ThumbsUp className="h-[13px] w-[13px]" aria-hidden fill={liked ? "currentColor" : "none"} /> {D.INSIGHT_ACTIONS.like}
        </button>
        <button type="button" aria-pressed={composing || !!comment} onClick={() => setComposing((v) => !v)} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[6px] rounded-[999px] border px-[12px] text-[12.5px] font-semibold" style={pill(composing || !!comment)}>
          <MessageCircle className="h-[13px] w-[13px]" aria-hidden /> {D.INSIGHT_ACTIONS.comment}
        </button>
        <button type="button" onClick={onAsk} className="dm-quiet flex min-h-[32px] cursor-pointer items-center gap-[6px] rounded-[999px] border px-[12px] text-[12.5px] font-semibold" style={pill(false)}>
          <MessageSquarePlus className="h-[13px] w-[13px]" aria-hidden /> {D.INSIGHT_ACTIONS.ask}
        </button>
      </div>
      {comment ? (
        <div className="flex items-start gap-[10px] rounded-[var(--radius-md)] p-[12px] text-[13.5px] leading-[19px]" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          <Avatar name="Jordan" size={26} />
          <p className="min-w-0 break-words">{comment}</p>
        </div>
      ) : composing ? (
        <form className="flex flex-col gap-[8px]" onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; setComment(draft.trim()); setComposing(false); setDraft(""); }}>
          <label className="sr-only" htmlFor={`${item.id}-comment`}>{D.INSIGHT_ACTIONS.comment}</label>
          <textarea id={`${item.id}-comment`} rows={2} maxLength={280} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={D.INSIGHT_ACTIONS.commentPlaceholder} className={`${FIELD_CLASS} resize-none`} style={FIELD_STYLE} />
          <PrimaryCta size="sm" className={`self-end ${draft.trim() ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (!draft.trim()) return; setComment(draft.trim()); setComposing(false); setDraft(""); }}>{D.INSIGHT_ACTIONS.post}</PrimaryCta>
        </form>
      ) : null}
    </article>
  );
}

function OpportunityCard({ item, saved, onSave }: { item: { id: string; kind: string; title: string; line: string }; saved: boolean; onSave: () => void }) {
  return (
    <div className="flex h-full flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={ITEM}>
      <Eyebrow>{item.kind}</Eyebrow>
      <h3 className="text-[15.5px] leading-[21px] font-bold text-balance" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{item.title}</h3>
      <Muted>{item.line}</Muted>
      <div className="mt-auto pt-[6px]">
        <QuietCta size="sm" done={saved} onClick={onSave} className="w-fit">
          {saved ? <><BookmarkCheck className="h-4 w-4" aria-hidden /> {D.SAVE.saved}</> : <><Bookmark className="h-4 w-4" aria-hidden /> {D.SAVE.save}</>}
        </QuietCta>
      </div>
    </div>
  );
}

function StudentHome({ onAsk, onSeeAll, saves, toggleSave }: { onAsk: () => void; onSeeAll: () => void; saves: Record<string, boolean>; toggleSave: (id: string) => void }) {
  const [pick, setPick] = useState<string>();
  return (
    <>
      <section className="flex flex-col gap-[var(--space-4)]">
        <div>
          <SectionHead>{D.INSIGHTS_SECTION.title}</SectionHead>
          <Muted className="mt-[2px]">{D.INSIGHTS_SECTION.sub}</Muted>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
          {D.STUDENT_INSIGHTS.map((item) => <InsightCard key={item.id} item={item} onAsk={onAsk} />)}
        </div>
      </section>

      <Panel id="att-poll-title" title={D.POLL.eyebrow}>
        <h3 className="text-[17px] leading-[23px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{D.POLL.question}</h3>
        <div className="grid grid-cols-2 gap-[8px] sm:grid-cols-4">
          {D.POLL.options.map((option) => (
            <QuietCta key={option} size="sm" done={pick === option} onClick={() => setPick(option)}>{option}</QuietCta>
          ))}
        </div>
        {pick && <Submitted text={D.POLL.saved} />}
      </Panel>

      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <SectionHead>{D.HOME_OPPORTUNITIES.title}</SectionHead>
          <LinkButton onClick={onSeeAll}>{D.HOME_OPPORTUNITIES.seeAll} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          {D.HOME_OPPORTUNITIES.items.map((item) => <OpportunityCard key={item.id} item={item} saved={!!saves[item.id]} onSave={() => toggleSave(item.id)} />)}
        </div>
      </section>
    </>
  );
}

function StudentQuestions() {
  const [draft, setDraft] = useState("");
  const [asked, setAsked] = useState(false);
  const [open, setOpen] = useState<string>();
  const [more, setMore] = useState(false);
  const shown = more ? D.RECENT_ANSWERS.items : D.RECENT_ANSWERS.items.slice(0, 2);
  return (
    <>
      <Panel id="att-ask-title" title={D.ASK.eyebrow}>
        {asked ? (
          <div className="flex flex-col gap-[8px]">
            <Submitted text={D.ASK.submitted} />
            <LinkButton onClick={() => { setAsked(false); setDraft(""); }}>{D.ASK.again}</LinkButton>
          </div>
        ) : (
          <form className="flex flex-col gap-[10px]" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) setAsked(true); }}>
            <label className="sr-only" htmlFor="att-ask">{D.ASK.eyebrow}</label>
            <textarea id="att-ask" rows={3} maxLength={280} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={D.ASK.placeholder} className={`${FIELD_CLASS} resize-none`} style={FIELD_STYLE} />
            <PrimaryCta size="sm" className={`self-end ${draft.trim() ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (draft.trim()) setAsked(true); }}>{D.ASK.cta} <ChevronRight className="h-4 w-4" aria-hidden /></PrimaryCta>
          </form>
        )}
      </Panel>

      <Panel id="att-answers-title" title={D.RECENT_ANSWERS.eyebrow}>
        <ul className="-mt-[var(--space-2)] flex flex-col">
          {shown.map((item) => {
            const isOpen = open === item.id;
            return (
              <li key={item.id} className="flex flex-col gap-[10px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
                <span className="text-[16px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>&ldquo;{item.question}&rdquo;</span>
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                  <ProLine id={item.pro} size={32} />
                  <LinkButton onClick={() => setOpen(isOpen ? undefined : item.id)}>{isOpen ? D.RECENT_ANSWERS.hide : D.RECENT_ANSWERS.read} <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden /></LinkButton>
                </div>
                {isOpen && <p className="rounded-[var(--radius-md)] p-[12px] text-[14.5px] leading-[21px]" style={{ background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{item.answer}</p>}
              </li>
            );
          })}
        </ul>
        <div className="border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <LinkButton onClick={() => setMore((v) => !v)}>{more ? D.RECENT_ANSWERS.less : <>{D.RECENT_ANSWERS.more} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
        </div>
      </Panel>
    </>
  );
}

function StudentOpportunities({ saves, toggleSave }: { saves: Record<string, boolean>; toggleSave: (id: string) => void }) {
  return (
    <>
      {D.OPPORTUNITY_GROUPS.map((group) => (
        <section key={group.title} className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>{group.title}</SectionHead>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => <OpportunityCard key={item.id} item={item} saved={!!saves[item.id]} onSave={() => toggleSave(item.id)} />)}
          </div>
        </section>
      ))}
    </>
  );
}

function StudentPeople({ follows, toggleFollow }: { follows: Record<string, boolean>; toggleFollow: (id: string) => void }) {
  return (
    <>
      {D.PEOPLE_ROWS.map((row) => (
        <section key={row.title} className="flex flex-col gap-[var(--space-4)]">
          <SectionHead>{row.title}</SectionHead>
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4">
            {row.pros.map((id) => {
              const pro = D.ATT_PROS[id];
              return (
                <div key={id} className="flex flex-col items-center gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-center" style={ITEM}>
                  <Avatar name={pro.name} size={56} />
                  <span className="mt-[4px] flex items-center gap-[5px] text-[14.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{pro.name} <VerifiedBadge size={14} /></span>
                  <span className="max-w-full truncate text-[12.5px] leading-[17px]" title={pro.role} style={{ color: "var(--muted-foreground)" }}>{pro.role}</span>
                  <CompanyChip name={pro.org} tone="surface" size="sm" />
                  <FollowButton compact following={!!follows[id]} onToggle={() => toggleFollow(id)} className="mt-[8px] w-full" tone={{ background: accent, color: "#FFFFFF" }} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

// ——— Volunteer ———

function AnswerForm({ id, placeholder, submit, cancel, onCancel, onDone, rows = 3 }: { id: string; placeholder: string; submit: string; cancel?: string; onCancel?: () => void; onDone: () => void; rows?: number }) {
  const [draft, setDraft] = useState("");
  return (
    <form className="flex flex-col gap-[10px]" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) onDone(); }}>
      <label className="sr-only" htmlFor={id}>{placeholder}</label>
      <textarea id={id} rows={rows} maxLength={400} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className={`${FIELD_CLASS} resize-none`} style={FIELD_STYLE} />
      <div className="flex flex-wrap gap-[8px]">
        <PrimaryCta size="sm" className={draft.trim() ? "" : "pointer-events-none opacity-50"} onClick={() => { if (draft.trim()) onDone(); }}>{submit}</PrimaryCta>
        {cancel && onCancel && <QuietCta size="sm" onClick={onCancel}>{cancel}</QuietCta>}
      </div>
    </form>
  );
}

function VolunteerHome() {
  const [state, setState] = useState<"idle" | "composing" | "done">("idle");
  const H = D.VOLUNTEER_HOME;
  return (
    <Panel id="att-now-title" title={H.title}>
      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 18%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))` }}>
        <h3 className="text-[20px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{H.topic}</h3>
        <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{H.prompt}</p>
        {state === "idle" && <PrimaryCta size="sm" className="w-fit" onClick={() => setState("composing")}>{H.cta}</PrimaryCta>}
        {state === "composing" && <AnswerForm id="att-now-answer" placeholder={H.placeholder} submit={H.submit} cancel={H.cancel} onCancel={() => setState("idle")} onDone={() => setState("done")} />}
        {state === "done" && <Submitted />}
      </div>
      <Muted>{H.footer}</Muted>
    </Panel>
  );
}

function VolunteerQuestions() {
  const Q = D.QUESTIONS_WAITING;
  const [more, setMore] = useState(false);
  const [openIdx, setOpenIdx] = useState<number>();
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const shown = more ? Q.items : Q.items.slice(0, 2);
  return (
    <Panel id="att-waiting-title" title={Q.title} aside={<Muted>{Q.sub}</Muted>}>
      <ul className="-mt-[var(--space-2)] flex flex-col">
        {shown.map((question, i) => (
          <li key={question} className="flex flex-col gap-[10px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
            <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <span className="min-w-0 flex-1 text-[15.5px] leading-[21px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{question}</span>
              {sent[i] ? <Submitted /> : <PrimaryCta size="sm" onClick={() => setOpenIdx(openIdx === i ? undefined : i)}>{Q.answer}</PrimaryCta>}
            </div>
            {openIdx === i && !sent[i] && <AnswerForm id={`att-waiting-${i}`} placeholder={Q.placeholder} submit={Q.send} onDone={() => { setSent((s) => ({ ...s, [i]: true })); setOpenIdx(undefined); }} />}
          </li>
        ))}
      </ul>
      <div className="border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
        <LinkButton onClick={() => setMore((v) => !v)}>{more ? Q.fewer : <>{Q.more} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
      </div>
    </Panel>
  );
}

function VolunteerShare() {
  const S = D.SHARE;
  const [mode, setMode] = useState<"pick" | "insight" | "opportunity">("pick");
  const [draft, setDraft] = useState("");
  const [type, setType] = useState(S.opportunity.types[0]);
  const [done, setDone] = useState(false);
  const back = () => { setMode("pick"); setDraft(""); setDone(false); };
  if (mode === "pick") {
    return (
      <section className="flex flex-col gap-[var(--space-4)]">
        <SectionHead>{S.title}</SectionHead>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
          {[{ ...S.insight, Icon: Lightbulb, mode: "insight" as const }, { ...S.opportunity, Icon: Megaphone, mode: "opportunity" as const }].map((tile) => (
            <div key={tile.kind} className="flex flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
              <span className="flex size-[40px] items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}><tile.Icon className="h-5 w-5" aria-hidden /></span>
              <Eyebrow>{tile.kind}</Eyebrow>
              <p className="text-[15px] leading-[22px]" style={{ color: "var(--foreground)" }}>{tile.line}</p>
              <PrimaryCta size="sm" className="mt-[6px] w-fit" onClick={() => setMode(tile.mode)}>{tile.cta}</PrimaryCta>
            </div>
          ))}
        </div>
      </section>
    );
  }
  const form = mode === "insight" ? S.insight : S.opportunity;
  return (
    <Panel id="att-share-title" title={form.heading} aside={<LinkButton onClick={back}><ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {S.back}</LinkButton>}>
      {done ? (
        <Submitted />
      ) : (
        <form className="flex flex-col gap-[12px]" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) setDone(true); }}>
          {mode === "insight" ? (
            <>
              <span className="text-[14px] leading-[19px] font-semibold" style={{ color: "var(--foreground)" }}>{S.insight.question}</span>
              <div className="flex flex-wrap gap-[6px]">
                {S.insight.chips.map((chip) => <QuietCta key={chip} size="xs" done={draft === chip} onClick={() => setDraft(chip)}>{chip}</QuietCta>)}
              </div>
            </>
          ) : (
            <label className="flex flex-col gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {S.opportunity.chooseType}
              <select value={type} onChange={(e) => setType(e.target.value)} className={FIELD_CLASS} style={FIELD_STYLE}>
                {S.opportunity.types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}
          <label className="sr-only" htmlFor="att-share-body">{form.placeholder}</label>
          <textarea id="att-share-body" rows={4} maxLength={400} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={form.placeholder} className={`${FIELD_CLASS} resize-none`} style={FIELD_STYLE} />
          <PrimaryCta size="sm" className={`w-fit ${draft.trim() ? "" : "pointer-events-none opacity-50"}`} onClick={() => { if (draft.trim()) setDone(true); }}>{form.post}</PrimaryCta>
        </form>
      )}
    </Panel>
  );
}

function PeriodChips<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(o.key)} className="dm-quiet min-h-[32px] cursor-pointer rounded-[999px] border px-[12px] text-[12.5px] font-semibold" style={{ borderColor: on ? `color-mix(in srgb, ${accent} 55%, var(--glass-border))` : "var(--glass-border)", background: on ? `color-mix(in srgb, ${accent} 16%, transparent)` : "var(--glass-surface-1)", color: on ? accent : "var(--muted-foreground)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function VolunteerYearRound() {
  const Y = D.YEAR_ROUND;
  const [cadence, setCadence] = useState<"monthly" | "biweekly">("biweekly");
  const list = cadence === "monthly" ? Y.monthly : Y.biweekly;
  const [period, setPeriod] = useState<string>(list[0].key);
  const card = list.find((p) => p.key === period) ?? list[0];
  const [state, setState] = useState<Record<string, "idle" | "composing" | "done">>({});
  const [fullYear, setFullYear] = useState(false);
  const s = state[card.key] ?? "idle";
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div>
        <SectionHead>{Y.title}</SectionHead>
        <Muted className="mt-[2px]">{Y.sub}</Muted>
      </div>
      <Panel id="att-year-round-title" title={card.period} aside={<Segmented ariaLabel="Cadence" value={cadence} onChange={(k) => { setCadence(k); setPeriod((k === "monthly" ? Y.monthly : Y.biweekly)[0].key); }} options={[...Y.cadence]} />}>
        <PeriodChips options={list.map((p) => ({ key: p.key, label: p.period }))} value={card.key} onChange={setPeriod} />
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 16%, transparent), transparent 70%), var(--glass-surface-1)`, borderColor: `color-mix(in srgb, ${accent} 40%, var(--glass-border))` }}>
          <Eyebrow>{card.period}</Eyebrow>
          <h3 className="text-[20px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{card.theme}</h3>
          <p className="text-[16px] leading-[22px] font-bold" style={{ color: "var(--foreground)" }}>{card.prompt}</p>
          <Muted>{card.students}</Muted>
          {s === "idle" && <PrimaryCta size="sm" className="w-fit" onClick={() => setState((m) => ({ ...m, [card.key]: "composing" }))}>{card.cta}</PrimaryCta>}
          {s === "composing" && <AnswerForm id={`att-year-${card.key}`} placeholder={card.prompt} submit={Y.submit} cancel={Y.cancel} onCancel={() => setState((m) => ({ ...m, [card.key]: "idle" }))} onDone={() => setState((m) => ({ ...m, [card.key]: "done" }))} />}
          {s === "done" && <Submitted />}
        </div>
        <div className="flex flex-col gap-[var(--space-4)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <LinkButton onClick={() => setFullYear((v) => !v)}>{fullYear ? Y.hideYear : <>{Y.fullYear} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></>}</LinkButton>
          {fullYear && (
            <ol className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
              {Y.year.map(([month, theme]) => {
                const current = cadence === "monthly" ? card.period === month : card.period.startsWith(month.slice(0, 3));
                return (
                  <li key={month} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ background: current ? `color-mix(in srgb, ${accent} 14%, var(--glass-surface-1))` : "var(--glass-surface-1)", borderColor: current ? `color-mix(in srgb, ${accent} 45%, var(--glass-border))` : "var(--glass-border)" }}>
                    <Eyebrow>{month}</Eyebrow>
                    <span className="text-[14.5px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{theme}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </Panel>
    </section>
  );
}

// ——— Enterprise ———

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} className="dm-quiet relative h-[26px] w-[46px] flex-none cursor-pointer rounded-full border transition-colors" style={{ background: on ? accent : "var(--glass-surface-2)", borderColor: on ? accent : "var(--glass-border)" }}>
      <span className="absolute top-[3px] size-[18px] rounded-full bg-white transition-[left] duration-200" style={{ left: on ? 23 : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.35)" }} />
    </button>
  );
}

function Field({ id, value, placeholder, onChange }: { id: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>{placeholder}</label>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} style={FIELD_STYLE} />
    </>
  );
}

type PeriodState = { source: D.TopicSource; selected: boolean; saved: boolean; editing: boolean; approved: boolean; att: { topic: string; volunteer: string; student: string } };

function EnterpriseProgram() {
  const P = D.PROGRAM;
  const [autopilot, setAutopilot] = useState(true);
  const [cadence, setCadence] = useState<"monthly" | "biweekly">("monthly");
  const list = cadence === "monthly" ? P.monthly : P.biweekly;
  const [period, setPeriod] = useState<string>(list[0].key);
  const card = list.find((p) => p.key === period) ?? list[0];
  const [states, setStates] = useState<Record<string, PeriodState>>({});
  const st: PeriodState = states[card.key] ?? { source: card.defaultSource, selected: card.dreamari.selected, saved: card.att.saved, editing: !card.att.saved, approved: false, att: { topic: card.att.topic, volunteer: card.att.volunteer, student: card.att.student } };
  const set = (patch: Partial<PeriodState>) => setStates((m) => ({ ...m, [card.key]: { ...st, ...patch } }));
  const labelStyle = { color: "var(--foreground)" } as const;
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div>
          <SectionHead>{P.title}</SectionHead>
          <Muted className="mt-[2px]">{P.sub}</Muted>
        </div>
        <div className="flex items-center gap-[12px] rounded-[var(--radius-lg)] border px-[14px] py-[10px]" style={ITEM}>
          <div>
            <Eyebrow>{P.autopilot.label}</Eyebrow>
            <Muted>{P.autopilot.sub}</Muted>
          </div>
          <Switch on={autopilot} onToggle={() => setAutopilot((v) => !v)} label={P.autopilot.label} />
        </div>
      </div>

      <Panel id="att-program-title" title={card.period} aside={<Segmented ariaLabel="Cadence" value={cadence} onChange={(k) => { setCadence(k); setPeriod((k === "monthly" ? P.monthly : P.biweekly)[0].key); }} options={[...D.YEAR_ROUND.cadence]} />}>
        <PeriodChips options={list.map((p) => ({ key: p.key, label: p.period }))} value={card.key} onChange={setPeriod} />
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={ITEM}>
          <div>
            <Eyebrow>{card.period}</Eyebrow>
            <h3 className="mt-[2px] text-[20px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{card.theme}</h3>
          </div>
          <div className="flex flex-col gap-[8px]">
            <Eyebrow tone="var(--muted-foreground)">{P.topicSource}</Eyebrow>
            <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-3">
              {D.TOPIC_SOURCES.map((s) => {
                const on = st.source === s.key;
                return (
                  <button key={s.key} type="button" aria-pressed={on} onClick={() => set({ source: s.key })} className="dm-quiet flex cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-md)] border px-[14px] py-[10px] text-left" style={{ borderColor: on ? `color-mix(in srgb, ${accent} 60%, var(--glass-border))` : "var(--glass-border)", background: on ? `color-mix(in srgb, ${accent} 14%, var(--glass-surface-1))` : "var(--glass-surface-2)" }}>
                    <span className="min-w-0">
                      <span className="block text-[14px] leading-[19px] font-bold" style={labelStyle}>{s.name}</span>
                      <span className="block text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{s.sub}</span>
                    </span>
                    {on && <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden style={{ color: accent }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)" }}>
            {st.source === "dreamari" && (
              <>
                <Eyebrow>{P.labels.dreamari}</Eyebrow>
                <span className="text-[17px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", ...labelStyle }}>{card.dreamari.topic}</span>
                <p className="text-[14px] leading-[20px]" style={labelStyle}><strong className="font-bold">{P.labels.employees}</strong> {card.dreamari.employees}</p>
                <p className="text-[14px] leading-[20px]" style={labelStyle}><strong className="font-bold">{P.labels.students}</strong> {card.dreamari.students}</p>
                <div className="flex flex-wrap gap-[8px] pt-[4px]">
                  {st.selected ? <QuietCta size="sm" done>{P.actions.selected}</QuietCta> : <PrimaryCta size="sm" onClick={() => set({ selected: true })}>{P.actions.use}</PrimaryCta>}
                  <QuietCta size="sm" onClick={() => set({ selected: false })}>{P.actions.another}</QuietCta>
                </div>
              </>
            )}
            {st.source === "att" && (
              <>
                <Eyebrow>{P.labels.att}</Eyebrow>
                {st.editing ? (
                  <form className="flex flex-col gap-[8px]" onSubmit={(e) => { e.preventDefault(); set({ saved: true, editing: false }); }}>
                    <Field id={`att-topic-${card.key}`} value={st.att.topic} placeholder={P.fields.topic} onChange={(v) => set({ att: { ...st.att, topic: v } })} />
                    <Field id={`att-vol-${card.key}`} value={st.att.volunteer} placeholder={P.fields.volunteer} onChange={(v) => set({ att: { ...st.att, volunteer: v } })} />
                    <Field id={`att-stu-${card.key}`} value={st.att.student} placeholder={P.fields.student} onChange={(v) => set({ att: { ...st.att, student: v } })} />
                    <PrimaryCta size="sm" className="w-fit" onClick={() => set({ saved: true, editing: false })}>{P.actions.save}</PrimaryCta>
                  </form>
                ) : (
                  <>
                    <span className="text-[17px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", ...labelStyle }}>{st.att.topic}</span>
                    <p className="text-[14px] leading-[20px]" style={labelStyle}><strong className="font-bold">{P.labels.volunteer}</strong> {st.att.volunteer}</p>
                    <p className="text-[14px] leading-[20px]" style={labelStyle}><strong className="font-bold">{P.labels.student}</strong> {st.att.student}</p>
                    <div className="flex flex-wrap items-center gap-[14px] pt-[4px]">
                      <LinkButton onClick={() => set({ editing: true })}>{P.actions.edit}</LinkButton>
                      <Submitted text={P.actions.saved} />
                    </div>
                  </>
                )}
              </>
            )}
            {st.source === "school" && (
              <>
                <Eyebrow>{P.labels.school}</Eyebrow>
                <span className="text-[17px] leading-[23px] font-extrabold" style={{ fontFamily: "var(--font-display)", ...labelStyle }}>{card.school.topic}</span>
                <Muted>{card.school.by}</Muted>
                <p className="text-[14px] leading-[20px]" style={labelStyle}><strong className="font-bold">{P.labels.employee}</strong> {card.school.employee}</p>
                <p className="text-[14px] leading-[20px]" style={labelStyle}><strong className="font-bold">{P.labels.schoolStudent}</strong> {card.school.student}</p>
                <div className="flex flex-wrap gap-[8px] pt-[4px]">
                  {st.approved ? <QuietCta size="sm" done>{P.actions.approve}</QuietCta> : <PrimaryCta size="sm" onClick={() => set({ approved: true })}>{P.actions.approve}</PrimaryCta>}
                  <QuietCta size="sm" onClick={() => set({ approved: false })}>{P.actions.editShort}</QuietCta>
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>
    </section>
  );
}

const TILE_ICONS = [Users, UserRound, Eye, MessagesSquare, Clock, Briefcase];

function EnterpriseImpact({ onTeam }: { onTeam: () => void }) {
  const I = D.IMPACT;
  const [range, setRange] = useState<"month" | "year">("month");
  const [metric, setMetric] = useState<string>(I.trend.metrics[0].key);
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div>
          <SectionHead>{I.title}</SectionHead>
          <Muted className="mt-[2px]">{I.sub}</Muted>
        </div>
        <Segmented ariaLabel="Range" value={range} onChange={setRange} options={[...I.range]} />
      </div>
      <SectionSurface>
        <div className="grid grid-cols-2 sm:grid-cols-3">
          {I.tiles.map((tile, i) => (
            <div key={tile.key} className={`p-[var(--space-4)] ${ruledCell(i, 3)}`} style={{ borderColor: RULE }}>
              <MetricTile icon={TILE_ICONS[i]} value={tile.value} label={tile.label} accent={accent} />
            </div>
          ))}
        </div>
      </SectionSurface>
      <Panel id="att-trend-title" title={I.trend.metrics.find((m) => m.key === metric)?.label ?? ""} aside={<Segmented ariaLabel={I.trend.eyebrow} value={metric} onChange={setMetric} options={I.trend.metrics.map((m) => ({ key: m.key, label: m.label }))} />}>
        <AreaChart points={I.trend.series[metric]} accent={accent} height={170} labels={[I.trend.months[0], I.trend.months[3], I.trend.months[5]]} />
      </Panel>
      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:flex-row sm:items-center sm:justify-between" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 26%, #0e0c20), #0e0c20)`, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}>
        <div className="flex flex-col gap-[8px]">
          <Eyebrow tone="#FFFFFFB3">{I.employee.eyebrow}</Eyebrow>
          <div className="grid grid-cols-1 gap-x-[var(--space-5)] gap-y-[4px] sm:grid-cols-2">
            {I.employee.lines.map((line) => <span key={line} className="text-[14.5px] leading-[20px] font-bold" style={{ color: "#FFFFFF" }}>{line}</span>)}
          </div>
        </div>
        <PrimaryCta size="sm" className="w-fit" onClick={onTeam} style={{ background: "#FFFFFF", color: "#0e0c20" }}>{I.employee.cta} <ChevronRight className="h-4 w-4" aria-hidden /></PrimaryCta>
      </div>
    </section>
  );
}

function EnterpriseTeam() {
  const T = D.TEAM;
  const [filter, setFilter] = useState<"all" | "active" | "needs">("all");
  const rows = T.roster.filter((r) => filter === "all" ? true : filter === "needs" ? r.activity === "Needs engagement" : r.activity !== "Needs engagement");
  const activityStyle = (a: string) => a === "Needs engagement"
    ? { color: "var(--world-business-money-office)", background: "color-mix(in srgb, var(--world-business-money-office) 14%, transparent)" }
    : { color: "var(--world-food-farming-nature)", background: "color-mix(in srgb, var(--world-food-farming-nature) 14%, transparent)" };
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div>
        <SectionHead>{T.title}</SectionHead>
        <Muted className="mt-[2px]">{T.sub}</Muted>
      </div>
      <Panel id="att-top-title" title={T.topEyebrow}>
        <ol className="-mt-[var(--space-2)] flex flex-col">
          {T.top.map((row, i) => (
            <li key={row.pro} className="flex flex-wrap items-center gap-[var(--space-4)] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
              <span className="flex size-[28px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold tabular-nums" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>{i + 1}</span>
              <div className="min-w-[200px] flex-1"><ProLine id={row.pro} /></div>
              <dl className="grid flex-none grid-cols-3 gap-[var(--space-4)] text-center">
                {[[row.reached, T.topLabels.reached], [String(row.answers), T.topLabels.answers], [String(row.hours), T.topLabels.hours]].map(([v, l]) => (
                  <div key={l} className="min-w-[56px]">
                    <dt className="text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</dt>
                    <dd className="text-[16px] leading-[21px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel id="att-roster-title" title={T.rosterTitle} aside={<Segmented ariaLabel="Roster filter" value={filter} onChange={setFilter} options={[...T.filters]} />}>
        <div className="-mx-[var(--space-5)] overflow-x-auto px-[var(--space-5)] sm:-mx-[var(--space-6)] sm:px-[var(--space-6)]">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px] leading-[19px]">
            <thead>
              <tr>
                {T.columns.map((c) => <th key={c} scope="col" className="pb-[10px] text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pro = D.ATT_PROS[r.pro];
                return (
                  <tr key={r.pro} className="border-t" style={{ borderColor: RULE }}>
                    <td className="py-[12px] pr-[12px]"><span className="flex items-center gap-[8px] font-bold" style={{ color: "var(--foreground)" }}><Avatar name={pro.name} size={28} /> {pro.name}</span></td>
                    <td className="py-[12px] pr-[12px]" style={{ color: "var(--muted-foreground)" }}>{pro.role}</td>
                    <td className="py-[12px] pr-[12px]"><span className="rounded-[999px] px-[10px] py-[3px] text-[12px] font-bold" style={activityStyle(r.activity)}>{r.activity}</span></td>
                    <td className="py-[12px] pr-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.reached} {T.topLabels.reached}</td>
                    <td className="py-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{r.hours} hrs</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)] sm:flex-row sm:items-center sm:justify-between" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 26%, #0e0c20), #0e0c20)`, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}>
        <div className="flex flex-col gap-[8px]">
          <Eyebrow tone="#FFFFFFB3">{T.footer.eyebrow}</Eyebrow>
          <div className="flex gap-[var(--space-6)]">
            {T.footer.stats.map((s) => (
              <div key={s.label}>
                <span className="block text-[22px] leading-[26px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{s.value}</span>
                <span className="block text-[12px] leading-[16px] font-semibold" style={{ color: "#FFFFFFB3" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <QuietCta size="sm" className="w-fit" onClick={() => {}}><Download className="h-4 w-4" aria-hidden /> {T.footer.cta}</QuietCta>
      </div>
    </section>
  );
}

// ——— the board ———

/** Student / Volunteer / Enterprise are three audiences of the same board,
 *  not three tabs a student would ever see; the switch exists so a demo can
 *  flip between them. Same language as Connect's RoleTabs at the top of the
 *  page: a small Demo chip, muted, that reveals the switcher, which then
 *  stays open while a non-student view is showing so the way back is
 *  visible (direct feedback, 17 Sept 2026: "these are only for demo
 *  purposes and shouldn't feel part of the UI"). */
function DemoViewSwitch({ view, onPick }: { view: D.AttView; onPick: (view: D.AttView) => void }) {
  const [open, setOpen] = useState(false);
  const show = open || view !== "student";
  return (
    <div className="flex min-w-0 items-center justify-end gap-[10px]">
      <button
        type="button"
        aria-expanded={show}
        aria-controls="att-demo-views"
        onClick={() => setOpen((v) => !v)}
        className="dm-quiet flex-none cursor-pointer rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
        style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
      >
        Demo
      </button>
      {show && (
        <div id="att-demo-views" role="tablist" aria-label="Show this board as" className="flex min-w-0 gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          {D.VIEWS.map((option) => {
            const on = option.key === view;
            return (
              <button key={option.key} type="button" role="tab" aria-selected={on} onClick={() => onPick(option.key)} className="dm-quiet flex min-h-[28px] flex-none cursor-pointer items-center rounded-[var(--radius-sm)] px-[10px] text-[12px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: on ? "var(--glass-surface-2)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? "inset 0 0 0 1px var(--glass-border)" : "none" }}>
                {option.label.replace(/ View$/, "")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AttCommunityView({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<D.AttView>("student");
  const [studentTab, setStudentTab] = useState<typeof D.STUDENT_TABS[number]["key"]>("home");
  const [volunteerTab, setVolunteerTab] = useState<typeof D.VOLUNTEER_TABS[number]["key"]>("home");
  const [enterpriseTab, setEnterpriseTab] = useState<typeof D.ENTERPRISE_TABS[number]["key"]>("program");
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const toggleSave = (id: string) => setSaves((m) => ({ ...m, [id]: !m[id] }));
  const toggleFollow = (id: string) => setFollows((m) => ({ ...m, [id]: !m[id] }));
  const ink = "#f6f5fb";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> {D.BACK}
        </button>
        <DemoViewSwitch view={view} onPick={setView} />
      </div>

      {/* Same identity banner as every other board (BoardView), wearing
         AT&T's own mark and cover. */}
      <section
        aria-label="Community overview"
        className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] px-[var(--space-6)] py-[var(--space-5)] sm:min-h-[300px] sm:px-[var(--space-8)] sm:py-[var(--space-6)]"
        style={{ background: "#0e0c20", border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`, fontFamily: "var(--font-display)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)", textShadow: CARD_TEXT_SHADOW }}
      >
        <Image src={D.ATT.brand.cover} alt="" fill sizes="1280px" className="object-cover" style={{ objectPosition: "50% 40%" }} />
        <CardProgressiveBlur size="64%" />
        <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.6) 40%, rgba(12,16,35,0.18) 70%, transparent 100%), ${cardTopScrim()}` }} />
        <Image src={D.ATT.brand.markWhite} alt="AT&T" width={96} height={40} unoptimized className="absolute top-[var(--space-5)] right-[var(--space-6)] z-10 h-[30px] w-auto sm:top-[var(--space-6)] sm:right-[var(--space-8)] sm:h-[36px]" />
        <div className="relative z-10 min-w-0 pr-[84px] sm:pr-[110px]">
          <span className="text-[11.5px] leading-[15px] font-extrabold tracking-[0.1em] uppercase" style={{ color: `color-mix(in srgb, ${accent} 60%, ${ink})` }}>{D.ATT.eyebrow}</span>
          <h1 className="mt-[6px] text-[24px] leading-[28px] font-extrabold text-balance sm:text-[34px] sm:leading-[38px]" style={{ color: ink }}>{D.ATT.name}</h1>
          <p className="mt-[8px] max-w-[62ch] text-[14px] leading-[20px] font-semibold" style={{ color: `color-mix(in srgb, ${ink} 82%, transparent)`, fontFamily: "var(--font-body)" }}>{D.ATT.about}</p>
        </div>
        <div className="relative z-10 mt-[var(--space-4)] flex w-full flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] border-t pt-[10px] text-[13px] leading-[18px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${ink} 18%, transparent)`, color: `color-mix(in srgb, ${ink} 62%, transparent)` }}>
          {D.ATT.stats.map((s, i) => (
            <span key={s.label}>{i > 0 && <span className="mr-[var(--space-3)]">·</span>}<strong className="font-extrabold" style={{ color: `color-mix(in srgb, ${ink} 90%, transparent)` }}>{s.value}</strong> {s.label}</span>
          ))}
        </div>
      </section>

      <SectionSurface className="flex flex-col gap-[var(--space-5)]">
        {/* the board's own tabs, the one row a student actually uses; full
           width on phones so four labels never truncate */}
        <div className="w-full sm:w-fit">
          {view === "student" && <Segmented ariaLabel="Student section" value={studentTab} onChange={setStudentTab} options={[...D.STUDENT_TABS]} grow />}
          {view === "volunteer" && <Segmented ariaLabel="Volunteer section" value={volunteerTab} onChange={setVolunteerTab} options={[...D.VOLUNTEER_TABS]} grow />}
          {view === "enterprise" && <Segmented ariaLabel="Enterprise section" value={enterpriseTab} onChange={setEnterpriseTab} options={[...D.ENTERPRISE_TABS]} grow />}
        </div>

        <div className="flex flex-col gap-[var(--space-6)]">
          {view === "student" && studentTab === "home" && <StudentHome onAsk={() => setStudentTab("questions")} onSeeAll={() => setStudentTab("opportunities")} saves={saves} toggleSave={toggleSave} />}
          {view === "student" && studentTab === "questions" && <StudentQuestions />}
          {view === "student" && studentTab === "opportunities" && <StudentOpportunities saves={saves} toggleSave={toggleSave} />}
          {view === "student" && studentTab === "people" && <StudentPeople follows={follows} toggleFollow={toggleFollow} />}

          {view === "volunteer" && volunteerTab === "home" && <VolunteerHome />}
          {view === "volunteer" && volunteerTab === "questions" && <VolunteerQuestions />}
          {view === "volunteer" && volunteerTab === "share" && <VolunteerShare />}
          {view === "volunteer" && volunteerTab === "yearRound" && <VolunteerYearRound />}

          {view === "enterprise" && enterpriseTab === "program" && <EnterpriseProgram />}
          {view === "enterprise" && enterpriseTab === "impact" && <EnterpriseImpact onTeam={() => setEnterpriseTab("team")} />}
          {view === "enterprise" && enterpriseTab === "team" && <EnterpriseTeam />}
        </div>
      </SectionSurface>
    </>
  );
}
