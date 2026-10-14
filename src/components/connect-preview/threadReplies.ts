// More voices on every board (14 Oct 2026, Chandu: "make sure there is a
// healthy amount of student comments, don't over use gifs and don't use them
// consecutively ... make sure every board, every question has student
// comments + professional answers. Make it realistic."). Every question on
// Connect's boards, the United Way boards and the event boards ends up with
// at least one professional answer and at least two student comments. No
// new GIFs; a thread keeps at most one, and never two in a row.
// Student handles are first names only; replies on the United Way boards
// carry the student's town. DEMO-ONLY: all of it.

import type { Thread } from "./data";

type Peer = [handle: string, grade: string, body: string, ago: string, likes: number, place?: string];
type Answer = [proId: string, body: string, ago: string];

const PEERS: Record<string, Peer[]> = {
  // ——— Connect boards ———
  "t-ds-vs-ai": [["Ethan", "Junior", "so data science is the questions and AI is the tool? that finally clicked", "2d ago", 18], ["Ruby", "Junior", "saving this for my CS elective pick", "1d ago", 9]],
  "t-gpd-career-fair": [["Ava", "Sophomore", "the 'one real question' tip is so good. I always freeze", "3d ago", 22], ["Devon", "Senior", "tried this at our fair last week. the recruiter remembered me", "2d ago", 31]],
  "t-gpd-teacher-vs-tutor": [["Maya", "Senior", "good to know there's a path without a classroom", "4d ago", 7]],
  "t-fin-accounting": [["Lena", "Senior", "I thought it was just math. it's way more about people", "3d ago", 14], ["Theo", "Sophomore", "ok accounting just went up on my list", "2d ago", 6]],
  "t-fin-networking": [["Jordan", "Junior", "same situation. starting with my school's alumni page", "2d ago", 11]],
  "t-health-pt-vs-med": [["Zoe", "Junior", "PT sounds like the right fit for me honestly", "3d ago", 8]],
  "t-creative-content": [["Ruby", "Sophomore", "the brand deal part was new to me", "2d ago", 12], ["Amir", "Sophomore", "posting consistently is the hardest part lol", "1d ago", 15]],
  "t-shoe-pm": [["Jo", "Senior", "never thought about who picks the colors. cool job", "2d ago", 9]],
  "t-warehouse-career": [["Ethan", "Junior", "didn't know supply chain had so much moving around", "3d ago", 6]],
  "t-family-doctor": [["Sana", "Junior", "the long relationships part is what I want too", "2d ago", 10]],
  "t-outbreak-math": [["Priya", "Sophomore", "stats over calculus?? taking stats next year then", "1d ago", 13]],
  "t-athletes-brands": [["Amir", "Sophomore", "sports marketing is exactly what I was looking for", "2d ago", 11]],
  "t-budget-meeting": [["Ethan", "Senior", "explaining the numbers simply. noted", "3d ago", 9], ["Diego", "Sophomore", "this is useful even for my school club budget", "2d ago", 7]],
  "t-fix-what-bugs-you": [["Zoe", "Sophomore", "starting a project on our school lunch line app now", "1d ago", 12]],
  "t-regulatory-affairs": [["Maya", "Senior", "I had no idea this job existed. perfect for me", "2d ago", 16], ["Devon", "Senior", "same, I love science but hate blood", "1d ago", 10]],
  "t-recovery-obsession": [["Jo", "Senior", "sports science is on my college list now", "3d ago", 8]],
  "t-group-project-pm": [["Riley", "Sophomore", "so being the group project organizer counts? finally", "2d ago", 21], ["Ava", "Junior", "this makes PM sound way less scary", "1d ago", 8]],
  "t-protect-the-budget": [["Ruby", "Sophomore", "producer sounds like the boss of everything", "2d ago", 12], ["Amir", "Sophomore", "joining our school film club to try it", "1d ago", 6]],
  "t-failed-cert": [["Ethan", "Junior", "needed this. failed my first practice test yesterday", "1d ago", 14]],
  "t-skip-second-seven": [["Priya", "Junior", "non-CS path gives me hope", "2d ago", 11], ["Sam", "Senior", "doing the free course you mentioned this weekend", "1d ago", 7]],
  "t-grandmothers-notebook": [["Diego", "Junior", "six years is long but it sounds worth it", "2d ago", 9], ["Zoe", "Junior", "pharmacy tech first is a smart way to test it", "1d ago", 12]],
  "t-overheating-laptop": [["Riley", "Sophomore", "doing the image sorting project first", "1d ago", 8]],
  "t-medicine-that-works": [["Sana", "Senior", "the patience part is real. research takes years", "2d ago", 10], ["Noah", "Senior", "this is the job I want", "1d ago", 6]],
  "t-banks-need-coders": [["Ethan", "Sophomore", "didn't know banks hired so many engineers", "2d ago", 13], ["Jo", "Junior", "hospitals too? that's cool", "1d ago", 7]],
  "t-lab-fire": [["Maya", "Senior", "liking the questions more than the answers. that's me", "2d ago", 11], ["Priya", "Junior", "asking my chem teacher about summer lab programs", "1d ago", 8]],
  "t-calm-at-2am": [["Riley", "Junior", "so it's keeping the app alive when everyone's asleep", "2d ago", 9], ["Devon", "Sophomore", "sounds stressful but kind of fun", "1d ago", 6]],
  "t-radio-instagram": [["Amir", "Sophomore", "messaging local venues is a smart start", "2d ago", 10], ["Jo", "Junior", "our school radio station counts?? signing up", "1d ago", 12]],
  "t-mailroom-director": [["Lena", "Junior", "good to hear the first job isn't wasted time", "2d ago", 9], ["Theo", "Sophomore", "taking notes on everything is the move", "1d ago", 7]],
  "t-numbers-tell-story": [["Diego", "Senior", "one section at a time. that's the plan", "2d ago", 8], ["Lena", "Senior", "my aunt passed it on her second try. so possible", "1d ago", 11]],
  // ——— United Way network ———
  "uw-t-health": [["Luis", "Junior", "Imaging tech looks so interesting.", "1d ago", 6, "Miami"]],
  "uw-t-internship": [["Sofia", "Senior", "I got one through Youth Career Connections. Apply early!", "2d ago", 14, "Orange County"], ["Ava", "Sophomore", "Saving this for next summer.", "2d ago", 5, "Southwest Virginia"]],
  "uw-t-finance": [["Maya", "Junior", "Asking one good question a day is great advice.", "3d ago", 7, "Palm Beach"], ["Andre", "Senior", "Starting my internship in June. This helps.", "3d ago", 9, "Midlands"]],
  "uw-t-hours": [["Sofia", "Senior", "Mine asked for 20. I logged mine here.", "4d ago", 8, "Orange County"]],
  "uw-t-fafsa": [["Luis", "Junior", "My mom and I did it in one night. Not too bad.", "5d ago", 10, "Miami"], ["Priya", "Sophomore", "Saving this for my sister.", "4d ago", 4, "Salt Lake"]],
  "uw-t-recruiting": [["Luis", "Senior", "Same! I love meeting people but sales isn't me.", "1h ago", 5, "Miami"], ["Ava", "Sophomore", "Didn't know recruiting was its own job.", "40m ago", 3, "Southwest Virginia"]],
  "uw-t-interview": [["Sofia", "Senior", "I wore a plain sweater and it was fine.", "3h ago", 6, "Orange County"], ["Andre", "Senior", "Clean shoes matter more than you think.", "2h ago", 4, "Midlands"]],
  "uw-t-sixteen": [["Priya", "Junior", "I started at 16 at a library. It counts!", "20h ago", 7, "Salt Lake"], ["Maya", "Junior", "Ask your school counselor. Mine knew a place.", "18h ago", 5, "Palm Beach"]],
  "uw-t-mentor-swap": [["Andre", "Senior", "My mentor helped me with my résumé too.", "4h ago", 6, "Midlands"]],
  // ——— United Way Michigan ———
  "mi-t-summer": [["Marcus", "Sophomore", "Signing up the first week like you said.", "18h ago", 6, "Genesee"]],
  "mi-t-trades": [["Noah", "Freshman", "My uncle is an electrician. He did an apprenticeship.", "2d ago", 9, "Marquette"], ["Jaylen", "Freshman", "Paid while you learn sounds great.", "1d ago", 7, "Southeast Michigan"]],
  "mi-t-suw": [["Kiara", "Junior", "It helped me with my college essay!", "3d ago", 11, "Southeast Michigan"], ["Noah", "Freshman", "Joining our school's group this year.", "2d ago", 5, "Marquette"]],
  "mi-t-age": [["Ana", "Junior", "I started at 14 at a food pantry. Totally worth it.", "4d ago", 8, "West Michigan"], ["Eli", "Senior", "Day of Caring takes 14 and up too.", "3d ago", 6, "Lakeshore"]],
  "mi-t-nurse": [["Kiara", "Junior", "Doing the hospital shadow this summer!", "50m ago", 4, "Southeast Michigan"], ["Ana", "Junior", "My mom is a nurse there. Long days but she loves it.", "30m ago", 7, "West Michigan"]],
  "mi-t-shadow": [["Jaylen", "Freshman", "I'm shy too. This helps.", "3h ago", 5, "Southeast Michigan"], ["Noah", "Freshman", "Asking my coach first. He knows everyone.", "2h ago", 4, "Marquette"]],
  "mi-t-apprentice": [["Marcus", "Sophomore", "Didn't know you could do both!", "20h ago", 6, "Genesee"], ["Noah", "Freshman", "Writing this down for later.", "18h ago", 3, "Marquette"]],
  // ——— United Way South Central ———
  "sc-t-nonprofit": [["Theo", "Junior", "Good to know. I want a job that helps people.", "1d ago", 9, "Kalamazoo"]],
  "sc-t-government": [["Leo", "Sophomore", "The parks internship is my plan!", "2d ago", 8, "Lansing"], ["Nia", "Junior", "Battle Creek's city site has jobs too.", "1d ago", 6, "Battle Creek"]],
  "sc-t-student-united": [["Jada", "Senior", "Same question! Glad you can keep going.", "3d ago", 7, "Jackson"], ["Theo", "Junior", "WMU has one. My cousin is in it.", "3d ago", 9, "Kalamazoo"]],
  "sc-t-health": [["Amaya", "Junior", "Visiting homes sounds really meaningful.", "4d ago", 8, "Battle Creek"], ["Sam", "Senior", "Adding public health to my college search.", "4d ago", 6, "Lansing"]],
  "sc-t-fafsa": [["Leo", "Sophomore", "Saving this for my older brother.", "2d ago", 5, "Lansing"], ["Jada", "Senior", "Jackson College helped me with mine.", "1d ago", 8, "Jackson"]],
  "sc-t-planner": [["Andre", "Senior", "Good to know a bachelor's is enough to start.", "1h ago", 4, "Lansing"], ["Priya", "Junior", "Maps and data sounds fun to me!", "30m ago", 3, "Kalamazoo"]],
  "sc-t-msu": [["Owen", "Senior", "Western's social work program is great.", "4h ago", 6, "Kalamazoo"], ["Sam", "Senior", "Public health at MSU is my top pick.", "3h ago", 5, "Lansing"]],
  "sc-t-hours-swap": [["Nia", "Junior", "I did one in Kalamazoo last month. Easy!", "2h ago", 5, "Battle Creek"], ["Leo", "Sophomore", "Doing the food boxes in Lansing next.", "1h ago", 4, "Lansing"]],
  "sc-q-kz-teacher": [["Ava", "Junior", "I want to try reading buddies too.", "8m ago", 3, "Kalamazoo"]],
  "sc-q-kz-wmu": [["Theo", "Junior", "Asking about this on my campus visit.", "50m ago", 4, "Kalamazoo"]],
  "sc-q-kz-firstjob": [["Mia", "Junior", "I work at a camp in summer. So fun.", "2h ago", 6, "Kalamazoo"], ["Owen", "Senior", "Grocery store taught me so much.", "1h ago", 4, "Kalamazoo"]],
  "sc-q-kz-yuw-join": [["Theo", "Junior", "I joined as a freshman! Best choice.", "5h ago", 7, "Kalamazoo"], ["Ava", "Junior", "We'd love more freshmen. Come to the next meeting!", "4h ago", 6, "Kalamazoo"]],
  "sc-q-kz-resume": [["Owen", "Senior", "Adding hours numbers to mine now.", "17h ago", 5, "Kalamazoo"]],
  "sc-q-bc-pharm": [["Grace", "Senior", "Getting paid while learning is huge.", "20m ago", 4, "Battle Creek"]],
  "sc-q-bc-pt": [["Diego", "Junior", "Shadowing a PT sounds great.", "1h ago", 5, "Battle Creek"], ["Nia", "Junior", "My PT after my knee injury was the best.", "40m ago", 8, "Battle Creek"]],
  "sc-q-bc-shadow": [["Grace", "Senior", "Snack tip noted!", "5h ago", 3, "Battle Creek"]],
  "sc-q-bc-caring": [["Nia", "Junior", "I led one last year. You learn so much.", "17h ago", 6, "Battle Creek"], ["Amaya", "Junior", "Let's lead one together!", "16h ago", 5, "Battle Creek"]],
  "sc-q-lan-city": [["Sam", "Senior", "Setting a reminder for February.", "8m ago", 3, "Lansing"]],
  "sc-q-lan-data": [["Leo", "Sophomore", "Spreadsheets first. On it.", "25m ago", 4, "Lansing"], ["Jaden", "Sophomore", "Free coding class + data. Perfect.", "20m ago", 3, "Lansing"]],
  "sc-q-lan-capcan": [["Leo", "Sophomore", "Going to the January one!", "2h ago", 4, "Lansing"]],
  "sc-q-lan-code": [["Leo", "Sophomore", "Simple games first. Love that.", "20h ago", 6, "Lansing"]],
  "sc-q-jx-mentor": [["Marcus", "Junior", "My Big and I play basketball after homework.", "15m ago", 5, "Jackson"]],
  "sc-q-jx-bank": [["Jada", "Senior", "Get the app. It helps you track everything.", "2h ago", 6, "Jackson"], ["Kai", "Junior", "Doing this before my first paycheck.", "1h ago", 4, "Jackson"]],
  "sc-q-jx-design": [["Kai", "Junior", "My sister designs for a game company!", "5h ago", 7, "Jackson"]],
  "sc-q-across-van": [["Theo", "Junior", "I want a seat too!", "25m ago", 4, "Kalamazoo"]],
  "sc-q-across-summer": [["Nia", "Junior", "Applying to the nurse shadow and two more.", "16h ago", 5, "Battle Creek"]],
  // ——— event boards ———
  "et-consulting-vs-ib": [["Riley", "Sophomore", "the travel part of consulting sounds fun", "6d ago", 9], ["Jordan", "Junior", "this helped me pick which panel to follow up with", "5d ago", 12]],
  "et-what-to-do-next": [["Ava", "Junior", "sent my thank-you note yesterday!", "5d ago", 10]],
  "sc-et-college-table": [["Leo", "Sophomore", "Yes please! I had so many questions.", "18h ago", 6, "Lansing"], ["Jada", "Senior", "Bring Jackson College too!", "16h ago", 5, "Jackson"]],
  "uw-et-first-ask": [["Maya", "Junior", "Using both questions at my first meeting.", "2w ago", 7, "Palm Beach"]],
};

const ANSWERS: Record<string, Answer[]> = {
  "uw-t-recruiting": [["pro-tanaka", "Yes. Recruiting is about matching people to the right job. It's more listening than selling.", "1h ago"], ["pro-whitfield", "I'm a recruiter. My best days are calling someone to say they got the job.", "50m ago"]],
  "uw-t-interview": [["pro-whitfield", "Clean and simple: a plain shirt and neat pants. Dress one step nicer than the job.", "4h ago"], ["pro-okafor", "Wear what you feel calm in. You'll answer better.", "3h ago"]],
  "uw-t-sixteen": [["pro-tanaka", "Yes. Many offices take 16-year-olds for summer roles. Ask about youth programs.", "22h ago"], ["pro-chen", "Hospitals and libraries hire at 16 too. Office skills grow from there.", "20h ago"]],
  "mi-t-nurse": [["pro-reyes", "We check on patients, give medicine and talk with families. Every hour is different.", "1h ago"], ["pro-brooks", "Teamwork is huge. Nurses, doctors and techs work together all day.", "45m ago"]],
  "mi-t-shadow": [["pro-whitfield", "Ask a teacher or coach to introduce you. Then send a short, polite note.", "4h ago"], ["pro-adler", "Most people say yes to a student who asks kindly. Try it.", "3h ago"]],
  "mi-t-apprentice": [["pro-tanaka", "Both work. An apprenticeship pays you to learn a trade. College is better if you want a degree job later.", "22h ago"], ["pro-whitfield", "Some apprenticeships include community college classes. You can do both.", "20h ago"]],
};

/** Adds the answers and student comments above, and trims extra GIFs: a
 *  thread keeps its first GIF only. Mutates the seeded threads in place. */
export function addThreadVoices(threads: Thread[]) {
  for (const t of threads) {
    const answers = ANSWERS[t.id];
    if (answers) {
      const has = t.responses.some((r) => r.kind === "answer" && r.primary);
      t.responses.unshift(...answers.map(([proId, body, postedAgo], i) => ({ kind: "answer" as const, proId, body, postedAgo, primary: !has && i === 0 })));
      t.state = "answered";
    }
    const peers = PEERS[t.id];
    if (peers) t.responses.push(...peers.map(([handle, grade, body, postedAgo, likes, place]) => ({ kind: "peer" as const, handle, grade, body, postedAgo, likes, ...(place ? { place } : {}) })));
    let gif = false;
    for (const r of t.responses) {
      if (r.kind !== "peer" || !r.image) continue;
      if (gif) { delete r.image; delete r.imageAlt; } else gif = true;
    }
    t.comments = Math.max(t.comments ?? 0, t.responses.length + 3);
  }
}
