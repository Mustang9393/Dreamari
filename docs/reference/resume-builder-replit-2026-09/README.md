# Resume Builder reference (Maisha's Replit), captured 17 Sept 2026

Live app: https://resume-builder-maishak.replit.app (Replit sign-in). Full per-screen text and controls: `walk-text.md` in this folder. Screenshots were reviewed live in the desktop app's browser pane at 1440×900, 768×1024 and 390×844; they are not stored as files because the app sits behind Replit OAuth, which the headless capture script cannot pass.

## Map
- `/` landing: hero, "How it works" three steps, Sign In. Redirects to `/build` when signed in.
- `/build` Resume Builder wizard: Personal Information · Education · Experience & Activities · Skills · Certifications (Optional) · Review. Live A4 preview on the right. Toolbar Back · Preview · Save & Next.
- `/create` Choose & Tailor: name, pick education and experiences, optional job description (+ Target Position / Company), Create This Resume (AI tailoring, about 20 s).
- `/resumes/<id>` document: name field, Tailored badge, ATS Check · Text Preview · Edit · Export · Save · Approve.
- `/resumes` Saved Resumes: cards with Standard/Tailored/Approved badges, scores, Target line, download · duplicate · delete · Open.

## What the Replit does that matters
- Dreamy moments: welcome pop-up on entry; a prompt inside every part of the experience modal; the skills "Not sure what to choose?" tip; a "You've got a good start" nudge before generating; a score pop-up after generating (Resume x/100 · Job Match y/100 + tips).
- Points toasts per completed step (+10 / +15).
- AI resume lines from four plain-English questions, editable, with a manual escape hatch.
- Tailoring reorders experiences and rewrites skills for the job; ATS Check is a manual button with a three-part panel (Resume Rating breakdown, Job Match, Readability checklist).
- Edit Sections with show/hide per section and raw text; Text Preview; Export gated by a six-item honesty checklist (.docx or PDF).

## Replit's own gaps (for the report, once ours is aligned)
- Review says "1 skill selected" and Readability says "Only 1 skill(s) selected" with four skills chosen.
- "One small tip" shows three tips.
- Review → Save & Export → "Got it" does nothing (dead end); the nudge appears on every generate.
- ATS Check is manual; nothing is scored until the student finds the button.
- Stepper dots are not clickable; Preview does nothing on desktop.
- Delete has no confirmation; Approve has no meaning beyond a badge.
- Tablet: preview shrinks to about 200 px; document clipped when the ATS panel is open.
- Phone: nav tabs vanish (Saved Resumes and Choose & Tailor unreachable); document toolbar overlaps; the page is clipped; Choose & Tailor and Saved Resumes render blank.
