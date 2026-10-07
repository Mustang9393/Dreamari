// What the counselor app sent on the counselor's behalf: check-in alerts to
// the school's safety contacts, and reports (scheduled or sent now)
// (7 Oct 2026: "emailing staff when a check-in note triggers an alert";
// "reports that actually send on a schedule"). DEMO-ONLY: the prototype
// records the send and shows it as delivered; production hands each entry
// to the mail service and records the real delivery status.

import { createLocalRecord } from "./localRecord";

export type OutboxEntry = { id: string; at: string; kind: "alert" | "report"; to: string[]; subject: string; key: string };

const store = createLocalRecord<OutboxEntry[]>("dreamari-counselor-outbox", []);

export function useOutbox(): OutboxEntry[] {
  return store.useValue();
}

export function readOutbox(): OutboxEntry[] {
  return store.read();
}

/** Sends once per key (an alert per student per week, a report per date). */
export function sendOnce(entry: Omit<OutboxEntry, "id" | "at"> & { at?: string }): boolean {
  if (store.read().some((e) => e.key === entry.key)) return false;
  store.update((list) => [{ ...entry, at: entry.at ?? new Date().toISOString(), id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }, ...list].slice(0, 300));
  return true;
}

export type SafetyContact = { name: string; role: string; email: string };
// DEMO-ONLY: the school's safety contacts, set on Profile
const contacts = createLocalRecord<SafetyContact[]>("dreamari-counselor-safety-contacts", [
  { name: "Priya Patel", role: "School social worker", email: "ppatel@lincolnhs.org" },
  { name: "Mark Moore", role: "Principal", email: "mmoore@lincolnhs.org" },
]);
export function useSafetyContacts(): SafetyContact[] {
  return contacts.useValue();
}
export function readSafetyContacts(): SafetyContact[] {
  return contacts.read();
}
export function setSafetyContacts(next: SafetyContact[]): void {
  contacts.update(() => next);
}

// handled alerts (key -> ISO time)
const handled = createLocalRecord<Record<string, string>>("dreamari-counselor-alerts-handled", {});
export function useHandledAlerts(): Record<string, string> {
  return handled.useValue();
}
export function markAlertHandled(key: string): void {
  handled.update((h) => ({ ...h, [key]: new Date().toISOString() }));
}
export function reopenAlert(key: string): void {
  handled.update((h) => { const n = { ...h }; delete n[key]; return n; });
}
