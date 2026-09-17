# Resume Builder Replit walk (Maisha's build), 17 Sept 2026

Reference: https://resume-builder-maishak.replit.app (Replit sign-in required, user's own account).
Captured live in the desktop app's browser pane at 1440x900; text and controls recorded per screen.
Routes: `/` landing, `/build` Resume Builder wizard, `/resumes` Saved Resumes, `/create` Choose & Tailor.

## Landing (`/`)
Header: Dreamy mark (left), "Sign In" (right). Hero: "CREATE YOUR RESUME" / "Turn your experiences into a resume, step by step." CTA "I'm Ready to Create My Resume →" (opens Replit OAuth when signed out).
"HOW IT WORKS" / "Start with Step 1, then move to Step 2, then Step 3." Three cards: STEP 1 "COMPLETE YOUR PROFILE" "Add your information and experiences." · STEP 2 "BUILD YOUR RESUME" "Turn your information into a resume." · STEP 3 "DOWNLOAD & SHARE" "Use your resume to apply."

## Builder shell (`/build`)
Top bar: "RESUME BUILDER" wordmark, tabs Resume Builder · Saved Resumes · Choose & Tailor, avatar (right).
Left: step dots + stepper buttons: Personal Information · Education · Experience & Activities · Skills · Certifications (Optional) · Review. Right: live A4 preview of the resume, ends with "A4 page end".
Bottom toolbar: Back · Preview · Save & Next.

### Step 1 · Personal Information
"PERSONAL INFORMATION" / "Add your contact information."
Dreamy pop-up (centered modal, closable): "DREAMY" / "Hi! 👋 I'm Dreamy. I'll help you build your resume, one step at a time." / "Got it! 👍"
Fields: First Name *, Last Name *, Email (placeholder jane@example.com), Phone (optional) ((555) 123-4567), Country (select, ~70 countries + Other), State / Province / Region (e.g. Maharashtra), City (e.g. San Francisco). "Save Information" (submit).
Bottom toolbar on every step: "Back" (disabled on step 1) · "Preview" (no visible effect at desktop; the preview is already on the right) · "Save & Next".
Stepper buttons at the top of the left column are not clickable; only Save & Next / Back move between steps.

### Step 2 · Education
"EDUCATION" / "Add your school information." · "+ Add Education" (right).
Entry card: school name (display caps), program line ("High School"), "Expected Graduation: June 2027", pencil (edit) and trash (delete) icons.
Modal "ADD YOUR HIGH SCHOOL": High School Name * · City and State (optional) ("City, State") · Expected Graduation Year * ("e.g. June 2027") · High School Program (optional) (select) · GPA (optional) ("e.g. 3.8") · Awards or Honors (optional) ("e.g. Honor Roll, AP Scholar") with "Add" chip button · footer "Cancel" / "Save Education" · X close.
Program select: AP · IB · None. On Save & Next a points toast appears bottom-right: "⭐ +10 pts · Education added!" (gamification: points per completed step).

### Step 3 · Experience & Activities
"EXPERIENCE & ACTIVITIES" / "Add jobs, clubs, volunteering, or projects." Inline Dreamy tip line: "☁️ Jobs, clubs, volunteering, and projects all count!" · "+ Add Experience".
Entry card: title (caps), type chip ("JOB"), "AI" badge when lines were AI-generated, organization, date range, first two bullets, "+1 more…", pencil and trash.
Modal, 4-part stepper "Type · Info · Questions · Lines". Part 1 "Type": Dreamy avatar + "What did you do?" Six choices: 💼 Job "Part-time, summer, seasonal work" · 🏢 Internship "Shadowing, formal or informal" · 🔬 Research "Research assistant, science project, lab" · 🤝 Volunteer "Community service, cause work" · 🎯 Club / Activity "Sports, arts, music, any club" · ✨ Other "Anything else worth mentioning!" · "Cancel".
Part 2 "Info": Dreamy + "Tell me about it!" Fields: Where? * ("e.g. Target, Library") · Your title or role? * · Location * ("City, State"). Footer "‹ Back" / "Next ›". (No dates on this part.)
Part 2b "Info" (dates): Dreamy + "When did you do this?" Start date ("Aug 2023") · End date ("Jun 2024") · checkbox "I still do this" · Back / Next.
Part 3 "Questions": Dreamy + "A couple quick questions…" Two textareas: "What did you do day-to-day?" ("e.g. Helped customers") · "What tools or skills did you use?" ("e.g. Cash register"). Back / Next. Link under the footer: "Enter my own resume lines" (skips the AI step).
Part 3b "Questions" (second page): Dreamy + "Almost done — two more!" Textareas: "Did you work with a team or customers?" ("e.g. Team of 5") · "What are you most proud of?" ("e.g. Employee of month"). Back / "✦ Generate Lines" with a small "✨ AI" tag beside it. Link: "Skip and save without AI lines".
While generating, the button reads "Generating…" (about 8 s).
Part 4 "Lines": Dreamy + "Here are your resume lines!" / "Edit these lines — they'll appear exactly as written on your resume." Three editable bullet textareas, each with a drag handle, a bullet dot and a "n / 200" character counter. Dashed "+ Add bullet" button. Footer "‹ Back" / "Save Experience".
Saving shows a plain toast bottom-right: "Experience added". The new entry appears as a card ("READING ROOM VOLUNTEER" · JOB · AI · org · dates · 2 bullets · "+1 more…") and on the preview immediately. On Save & Next: "⭐ +15 pts · Experience added!".
Sample AI lines from the test answers: "Assisted an average of 60 students per weekend in locating library materials using the catalog system, reducing average book-finding wait time from 10 minutes to 3 minutes." / "Coordinated with a team of 4 volunteers to maintain an organized and quiet reading environment, ensuring a productive space for student visitors." / "Tracked and managed weekly visitor sign-ins using Excel, supporting accurate attendance records and smooth library operations."

### Step 4 · Skills
"SKILLS" / "Choose the skills you know and can use." / "Choose 3–5 skills for your resume." / link-button "Not sure what to choose?"
Three collapsible category cards, each with "+ Add" and a chevron: People Skills (count badge) "How you work with others." · Tech Skills "Tools and technology you can use." · Languages "Languages you can speak or use." Selected skills are chips with an × ("Remove <skill>"). Empty state: "None added yet — click Add to get started."
"Not sure what to choose?" expands an inline tip box (closable ×): "Think about what you're good at in school, activities, projects, or work." / "Examples: Teamwork, Canva, Spanish."
Tech Skills "+ Add" opens a picker modal: Dreamy + "What tools or programs do you use? 💻" / "Select up to 3" / search field ("Try Excel, Canva, Python…") / "SUGGESTED" chips: Microsoft Office · Google Workspace · Canva · Data Analysis · Research & Writing · Social Media Management / primary button disabled until a pick: "Select something first".
Picking a chip flips the button to "Add 1 skill" and the subtitle to "1 of 3 selected". Typing in the search shows the typed term as a chip (custom skill, e.g. "Figma") that can be selected the same way; suggestions filter out.
People Skills picker: "Pick up to 3 skills that describe you best! 💪" / suggestions: Professionalism · Communication · Adaptability (plus the two already chosen). Languages picker: "What languages do you speak or write? 🌍" / English · Spanish · French · Mandarin Chinese · Arabic · Korean.
Preview groups skills as "Core Skills: …" (people) and "Technical Skills: …" (tech); languages presumably a third line. On Save & Next: "⭐ +10 pts · Skills selected!".

### Step 5 · Certifications (Optional)
"CERTIFICATIONS (OPTIONAL)" / "Add any training or certificates you've earned." Buttons: "Skip for Now" (ghost) · "+ Add Certification". Empty state card with a ribbon icon: "Examples: CPR, First Aid, or a Google Certificate."
Modal "ADD CERTIFICATION": Certification Name * ("AWS Certified Cloud Practitioner") · Issuing Organization * ("Amazon Web Services") · Issue Date ("Jan 2024") · Expiration Date ("Jan 2027 or No Expiry") · Credential ID (Optional) ("ABC123XYZ") · Credential URL (Optional) ("https://www.credly.com/badges/...") · Cancel / Save.

### Step 6 · Review
"REVIEW" / "Check your information before creating your resume."
Checklist rows, each with a status chip and "Edit": Personal Information ("Chandu MP" · Done) · Education ("1 school added" · Done) · Experience & Activity ("3 entries added" · Done) · Skills (chip "Optional"; "1 skill selected" · Done; NOTE: shows 1 although 4 skills are chosen, a counting bug) · Certifications (Optional) ("No certification added — that's okay" · Optional).
Card "Ready to export?" / "Download your resume as a Word document, or customize it first." Buttons: "Save & Export" (primary) · "Customize first". Bottom toolbar here: Back · Continue (Preview gone).
"Customize first" leaves the wizard for `/create` (Choose & Tailor). "Save & Export" presumably creates a version straight away (checked below).

## Choose & Tailor (`/create`)
"CHOOSE & TAILOR YOUR RESUME" / "Pick what stands out, or match your resume to a job." Dreamy banner line: "Dreamy ☁️ — Choose your strongest experiences. Have a job in mind? I can help you pick what fits best."
Card "NAME THIS RESUME" / "Give this version a name so you can find it later." / Resume Name * ("Marketing Internship").
Two columns: "YOUR EDUCATION" / "Choose the school information to show." (checkbox per school) · "CHOOSE YOUR EXPERIENCES" / "Pick the activities and experiences that show you best." (checkbox per entry, all checked by default).
Card "Match to a Job" + "Optional" chip / "Paste the job description and I'll help you choose what fits best." / textarea ("Paste the full job description here...").
Footer note: "Skills from your profile will be automatically included." · primary "Create This Resume".
Pasting a job description reveals two more fields under it: "Target Position" ("e.g. Graphic Designer") and "Target Company" ("e.g. Acme Corp"). No live AI suggestion happens on the page itself; matching runs on Create.
"Create This Resume" first shows a Dreamy modal: "DREAMY" / "You've got a good start! ☁️" / "More experiences can make your resume stronger. Explore activities or ask a counselor for ideas." / "Got it! 👍" (dismiss, stays on the page) · "Generate Anyway" (proceeds). Shown even with three experiences.
"Generate Anyway" runs the AI tailoring (button "Generating..." disabled, roughly 20 s) and lands on the saved document at `/resumes/<id>?from=generate`.

## Generated resume (`/resumes/<id>`)
Toolbar: editable resume name field ("Library Volunteer Resume") · "Tailored" badge (when a job description was given) · buttons ATS Check · Text Preview · Edit · Export · Save · Approve.
Document: the tailoring reordered experiences (the most relevant first), rewrote skills into "Workplace Skills: Customer service", reformatted education ("Kerala, India / High School Diploma / Jun. 2027") and showed "Dates Not Provided – Present" for an entry without dates.
Dreamy modal on arrival: "DREAMY" / "This looks like a strong match! ☁️" / "Resume: 64/100 · Job Match: 88/100" / "One small tip:" followed by THREE bullets (copy says one): "Add start date to Target experience — missing dates hurt ATS parsing" · "List 5–8 specific skills beyond just 'customer service'" · "Remove or replace vague 'Test Co' entry with real or removed content". Buttons "See Final Tips" · "Continue".
"See Final Tips" closes the modal (no separate tips panel appeared at desktop; checked below).

### ATS Check (left panel on the document)
Manual: runs only when "ATS Check" is pressed (the toolbar button carries a ⚠ icon before a check exists). Opens a left sidebar with three collapsible sections: "Resume Rating 64/100 D" (open by default) · "Job Match 88/100" · "ATS Readability Check — Review Recommended". Section text recorded below.
Resume Rating: "64/100 · D" chip, "D — Needs Improvement" banner. SCORE BREAKDOWN bars: Experience & Activities 16/25 · Resume Bullets 11/15 · ATS & Formatting 11/15 · Completeness 9/15 · Skills 2/10 · Education 7/10 · Focus & Conciseness 8/10. WHAT'S WORKING (3 green checks): "Library volunteer bullet includes specific time reduction metric (10 min to 3 min)" · "Employee of the Month recognition adds concrete credibility to Target role" · "Consistent team-size specifics (team of 4, team of 8) across entries". WHAT TO IMPROVE (3 amber): the same three tips as the Dreamy modal. Footnote: "Your score looks at resume content, clarity, impact, formatting, and ATS-friendly practices. It does not guarantee an interview or how an employer's ATS will rank your resume."
Job Match: "88/100 — Strong Match". YOU ALREADY HAVE: Customer Service · Checkout & POS System Experience · Team Collaboration · Shelf/Space Organization · Excel Basics · Communication. YOU MAY HAVE: Returns Handling. THIS JOB ALSO WANTS: "Explicit returns processing experience not mentioned". Footnote: "Job Match evaluates how your real background fits this specific opportunity. It does not predict whether you will get an interview."
ATS Readability Check "— Review Recommended": checklist Standard section headings · Single-column layout · Contact information · Education information · Experience details · Skills (3–5 confirmed) with warning "Only 1 skill(s) selected — go to your Profile and choose 3–5 skills" (NOTE: 4 skills exist; same counting bug as Review) · Date formatting · No graphics, tables, or icons · Job-description keyword alignment with warning "Some job requirements are not supported by your profile (see Missing Qualifications)" · "Missing qualifications" paragraph · "Export text readability". Footnote: "This check identifies common ATS parsing issues. It is a readability check, not a guarantee that the resume will pass every employer's system." Then "QUALIFICATIONS TO DEVELOP" repeating the missing-qualifications paragraph.

### Text Preview
Modal "ATS TEXT PREVIEW" with an intro sentence (recorded below), a monospace plain-text rendering of the resume (name, contact line, section headings with rule lines, "Org | Location" / "Role | Dates" lines, "* " bullets), and a "Close" button.
Intro: "This preview shows how your resume may appear when read as plain text. Applicant tracking systems vary, so this is a readability check rather than a guarantee."

### Edit (on the document)
"Edit" swaps to "Preview" in the toolbar and opens a left "EDIT SECTIONS" panel: one textarea per section (Education, each Experience, Skills) holding the section's plain text ("Lincoln High School | Kerala, India / High School Diploma | Jun. 2027"). The ATS panel stays open alongside with a "Hide" control. Section text is edited in place, not through the wizard.
Edit Sections panel rows (after hiding the ATS panel): EDUCATION · PROFESSIONAL EXPERIENCES · ACADEMIC AND EXTRACURRICULAR EXPERIENCES · SKILLS & INTEREST, each with an "AI" badge and a "Show"/"Hide" toggle that removes or restores the section on the document; each visible section has a textarea with its plain text ("Org | Location", "Role | Dates", "* bullet" lines).

### Export
Modal "REVIEW BEFORE EXPORTING" / "Please confirm each statement before downloading your resume." Six checkboxes: "My contact information is correct." · "My education information is correct." · "These skills accurately represent me." · "My experience descriptions are truthful." · "I reviewed all generated bullet points." · "I understand that ATS compatibility does not guarantee an interview." Info box: "Check the application instructions first. Use the file type requested by the employer. When no format is specified, a Word document (.docx) may be easier for some applicant tracking systems to read." Buttons: Cancel · "Download .docx" · "Export PDF" (both disabled until every box is checked).
"Approve" produced no visible change in the toolbar or document text at desktop (no modal; possibly a brief toast or a state stored on the version, see Saved Resumes). Hiding a section in Edit persists on the document after leaving Edit mode.
"Save" shows a bottom-right toast "Saved successfully". "Approve" sets an APPROVED badge on the saved card (visible on Saved Resumes), nothing else.

## Saved Resumes (`/resumes`)
"SAVED RESUMES" / "Manage, edit, and download your resumes." · "+ Create New" (→ /create).
Cards (3-up): badges top-left "STANDARD" or "TAILORED" + "APPROVED", ".DOCX" tag top-right; title in caps (truncated with … at one line); "Updated: 9/17/2026"; Resume Rating chip (grade "NW"/"D", "64/100 Resume Rating", label "Needs Work"/"Needs Improvement"); Job Match chip ("88 Job Match · Strong Match" / "62 · Possible Match") when tailored; "Target: Customer Service Associate at Target" line; footer icon buttons download · duplicate · delete, and "Open →". One saved card has an empty title (unnamed version from an earlier session).
Card footer icons (aria labels): "Download .docx" (downloads directly, no checklist here) · "Duplicate" · "Delete". A small pen icon next to each title renames the version inline.
"Duplicate" adds a card "LIBRARY VOLUNTEER RESUME (COPY)" (keeps TAILORED and the scores, drops APPROVED) with toast "Resume duplicated". "Delete" showed no confirmation dialog in the DOM during the walk (not exercised to completion).
A STANDARD (untailored) document (`/resumes/5`) has the same toolbar without the "Tailored" badge; an experience without dates prints "Not specified" on the right.
Review → "Save & Export" shows the same Dreamy modal ("You've got a good start! ☁️ …") but with buttons "Got it! 👍" · "Add Experiences" (instead of "Generate Anyway"). Result of "Got it" recorded below.
"Got it" on that modal only dismisses it: nothing is saved or exported and the user stays on Review (a dead end; "Save & Export" never exports from here). "Add Experiences" presumably jumps back to Step 3.

## Tablet (768 × 1024)
Builder keeps two columns: the form on the left, the A4 preview on the right shrunk to roughly 200 px wide (unreadable). Bottom toolbar Back · Preview · Save & Next stays. Preview/Create/Saved screens recorded below.
Tablet document with ATS Check open: the ATS panel takes the left third and the A4 page is pushed right and clipped (the left edge of every line is cut off; horizontal overflow). "Approve" already applied shows as a green "Approved" chip in the toolbar.

## Phone (390 × 844)
Builder: header shrinks to the Dreamy mark and the avatar; the Resume Builder / Saved Resumes / Choose & Tailor tabs are gone (no way to reach Saved Resumes or Choose & Tailor from the phone nav). Single column form; the preview is hidden. Bottom toolbar Back · Preview · Save & Next is fixed. "Preview" opens a full-screen sheet "Resume Preview" with "Back to Editing" and an ×; inside, the A4 page renders wider than the sheet and is clipped on the left (name centred, section headings cut to "N", "ONAL EXPERIENCES", "NTEREST").
Phone document (`/resumes/9`): the toolbar collapses badly, the resume name, "Tailored" badge and the Text Preview / Edit / Export / Save / Approve buttons overlap each other in one row; the A4 page is wider than the screen and clipped on the left. With ATS Check open, the panel stacks full-width above the page and reads well (accordion cards), the page below stays clipped.
Landing `/` redirects to `/build` when signed in.
Phone and tablet `/create` and `/resumes`: the page renders completely blank (the React root is empty, body text length 0) at 390 and 768 px. Both screens crash below desktop width; only the builder and the document survive.

## Gamification seen
Points toasts after each step: Education +10 · Experience +15 · Skills +10 ("⭐ +N pts · <Step> added/selected!"). No visible total or level anywhere in the app.
