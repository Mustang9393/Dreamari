// The counselor's card as students see it: what to ask them about and the
// languages they speak (8 Oct 2026 audit: "Ask me about and Languages reset
// on reload", while office hours beside them already persisted through
// counselorMeetings.ts). Same idiom as office hours. DEMO-ONLY: kept in
// this browser until counselor profiles are stored on the account.

import { createLocalRecord } from "./localRecord";

/** `cover` is the ID card's background: a cover photo's path, or
 *  "gradient:<name>" for one of the calm colour washes (10 Oct 2026). */
export type CounselorCard = { topics: string[]; languages: string; cover?: string };

const store = createLocalRecord<CounselorCard>("dreamari-counselor-card", { topics: ["Applications", "Careers"], languages: "English, Mandarin", cover: "/images/profile/covers/ocean-aerial.webp" });

export function useCounselorCard(): CounselorCard {
  return store.useValue();
}

export function updateCounselorCard(patch: Partial<CounselorCard>): void {
  store.update((c) => ({ ...c, ...patch }));
}
