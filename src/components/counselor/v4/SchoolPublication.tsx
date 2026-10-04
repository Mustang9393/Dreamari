"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";

export type PublicationStyle = { school: string; office: string; contact: string; accent: string; layout: "editorial" | "classic" };
const DEFAULT: PublicationStyle = { school: DEMO_SCHOOL, office: "Office of School Counseling", contact: "", accent: "#244C4B", layout: "editorial" };
const EVENT = "dreamari-publication-style";
const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); }; };
const key = (school: string) => `dreamari.counselor.v4.publication.${school}`;
// DEMO-ONLY: school publication preferences persist on this browser, not to an organization service.
export function usePublicationStyle() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const school = account.school || DEMO_SCHOOL;
  const raw = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key(school)) || ""; } catch { return ""; } }, () => "");
  let style: PublicationStyle = { ...DEFAULT, school };
  try { const saved = JSON.parse(raw); if (saved && typeof saved === "object") style = { ...style, ...saved }; } catch { /* defaults until a style is saved */ }
  return { style, save: (value: PublicationStyle) => { try { localStorage.setItem(key(school), JSON.stringify(value)); window.dispatchEvent(new Event(EVENT)); return true; } catch { return false; } } };
}

export function SchoolPublicationSettings() {
  const { style, save } = usePublicationStyle();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(style);
  const [message, setMessage] = useState("");
  return <section className="v4-publication-settings">
    <button type="button" className="v4-publication-trigger" aria-expanded={open} onClick={() => { if (!open) setDraft(style); setOpen(!open); setMessage(""); }}><Palette size={16}/><span>School publication style<small>Letterhead, reports & signatures</small></span><ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : undefined }}/></button>
    {open && <div className="v4-publication-form">
      <div className="v4-template-choice" role="group" aria-label="Letterhead style">{(["editorial", "classic"] as const).map(layout => <button key={layout} type="button" aria-pressed={draft.layout === layout} onClick={() => setDraft({ ...draft, layout })}><span className={`v4-mini-letterhead ${layout}`} style={{ color: draft.accent }}><i/><b/><em/></span>{layout === "editorial" ? "Editorial" : "Institutional"}{draft.layout === layout && <Check size={12}/>}</button>)}</div>
      {([['school','School name'],['office','Department'],['contact','Contact line']] as const).map(([field,label]) => <label key={field}>{label}<input value={draft[field]} maxLength={field === 'contact' ? 140 : 80} placeholder={field === 'contact' ? 'Address · phone · email (optional)' : undefined} onChange={e => setDraft({ ...draft, [field]: e.target.value })}/></label>)}
      <fieldset><legend>Publication ink</legend><div className="v4-ink-options">{[['#244C4B','Evergreen'],['#273B5B','Midnight'],['#623F53','Mulberry'],['#303039','Graphite']].map(([accent,label]) => <button type="button" key={accent} aria-label={label} aria-pressed={draft.accent === accent} onClick={() => setDraft({ ...draft, accent })} style={{ background: accent }}>{draft.accent === accent && <Check size={15}/>}</button>)}</div></fieldset>
      <p>Your signature uses your account settings. School style applies to all v4 letters and impact reports in this browser.</p>
      <button type="button" className="v4-primary-action" disabled={!draft.school.trim() || !draft.office.trim()} onClick={() => setMessage(save({ ...draft, school: draft.school.trim(), office: draft.office.trim() }) ? "Publication style saved." : "Could not save. Browser storage is unavailable.")}>Apply school style</button>
      <p role="status">{message}</p>
    </div>}
  </section>;
}
