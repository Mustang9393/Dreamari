// The counselor's card as students see it: what to ask them about and the
// languages they speak (8 Oct 2026 audit: "Ask me about and Languages reset
// on reload", while office hours beside them already persisted through
// counselorMeetings.ts). Same idiom as office hours. DEMO-ONLY: kept in
// this browser until counselor profiles are stored on the account.

import { createLocalRecord } from "./localRecord";

export type CounselorCard = { topics: string[]; languages: string };

const store = createLocalRecord<CounselorCard>("dreamari-counselor-card", { topics: ["College applications", "Careers"], languages: "English, Mandarin" });

export function useCounselorCard(): CounselorCard {
  return store.useValue();
}

export function updateCounselorCard(patch: Partial<CounselorCard>): void {
  store.update((c) => ({ ...c, ...patch }));
}
