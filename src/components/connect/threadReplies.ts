// More voices on every board (14 Oct 2026, Chandu: "make sure there is a
// healthy amount of student comments, don't over use gifs and don't use them
// consecutively ... make sure every board, every question has student
// comments + professional answers. Make it realistic."). Every question on
// Connect's boards, the United Way boards and the event boards ends up with
// at least one professional answer and at least two student comments. No
// new GIFs; a thread keeps at most one, and never two in a row.
// Student handles are first names only; replies on the United Way boards
// carry the student's town. DEMO-ONLY: all of it.

import type { Insight, InsightReply, Thread } from "./data";

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

// ——— Students outnumber professionals (15 Oct 2026, Chandu: "make sure
// there is a healthy ratio of likes/comments etc and make sure students
// engage more than professionals with questions and posts by professionals.
// But we should have a healthy mix. This is for all of the connect tab.").
// Before this pass 18 questions had more professional answers than student
// comments (the 13 Oct "more responses from professionals" pass), and
// nearly every professional's post had the same shape: two students and
// the author replying back. These extra student follow-ups land on the
// questions where pros outnumbered students, and give a few threads a
// livelier run. DEMO-ONLY: every line below. ———
const MORE_PEERS: Record<string, Peer[]> = {
  // ——— Connect boards ———
  "t-cs-degree": [["Maya", "Junior", "finishing my first real project this month because of this thread", "40m ago", 44]],
  "t-ds-vs-ai": [["Sam", "Senior", "taking AP stats next year now. thanks for making this simple", "1h ago", 21], ["Zoe", "Sophomore", "the Python tip is the one I needed. starting a free course tonight", "30m ago", 14]],
  "t-ib-hours": [["Theo", "Junior", "the 'skills most people take a decade to build' line is why I'm here", "1h ago", 52]],
  "t-nurse-shadow": [["Ruby", "Junior", "emailed our hospital's volunteer office today. they answered in an hour!", "20h ago", 41], ["Amir", "Sophomore", "clinic shadowing sounds way less scary than a hospital. trying that first", "16h ago", 27]],
  "t-gpd-resume": [["Jo", "Senior", "rewrote mine with numbers. it went from three lines to a full page", "40m ago", 63]],
  "t-gpd-career-fair": [["Priya", "Sophomore", "writing my one real question on my hand before the fair lol", "4h ago", 38], ["Noah", "Junior", "the thank-you note tip is the part I always skip. not anymore", "3h ago", 26]],
  "t-gpd-interview-nerves": [["Ava", "Sophomore", "practiced my first sixty seconds in the mirror and it actually helped", "6h ago", 48], ["Sana", "Junior", "asking for the interview format ahead of time is genius", "5h ago", 33]],
  "t-fin-accounting": [["Ava", "Junior", "my accounting teacher is going to love this thread", "2h ago", 29], ["Noah", "Sophomore", "launchpad not ceiling. putting that on a sticky note", "1h ago", 24]],
  "t-fin-networking": [["Sana", "Junior", "fifteen minutes is such a small ask. I can do that", "1h ago", 37]],
  "t-health-np": [["Zoe", "Sophomore", "bedside first then NP school. that's my plan now", "9h ago", 44], ["Noah", "Junior", "didn't know research nurses were a thing. adding it to my list", "8h ago", 22]],
  "t-health-pt-vs-med": [["Sana", "Junior", "shadowing hours first. booking some this summer", "1h ago", 19]],
  "t-creative-art-school": [["Amir", "Sophomore", "running our club's channel counts as a deadline job?? ok I'm in", "1h ago", 41], ["Priya", "Junior", "ten finished pieces by summer. that's my goal now", "40m ago", 35]],
  "t-creative-content": [["Zoe", "Sophomore", "editing for other creators is such a smart way in", "40m ago", 19], ["Jo", "Junior", "small specific audience > big random one. got it", "20m ago", 11]],
  "t-shoe-pm": [["Devon", "Junior", "data plus a gut feeling. that's my dream job", "5h ago", 22]],
  "t-family-doctor": [["Amir", "Sophomore", "knowing the whole story of a patient sounds so meaningful", "6h ago", 31]],
  "t-fix-what-bugs-you": [["Theo", "Sophomore", "our club's sign-up form is broken. fixing it this weekend", "3h ago", 38]],
  "t-athletes-brands": [["Riley", "Sophomore", "sports plus marketing. didn't know that was one job", "2h ago", 27]],
  "t-group-project-pm": [["Sam", "Senior", "I'm the schedule person in every group. good to know it's a career", "10h ago", 33]],
  "t-failed-cert": [["Devon", "Junior", "study group over studying alone. noted", "40m ago", 24]],
  "t-overheating-laptop": [["Marcus", "Freshman", "predicting which songs I'd skip is such a fun first project", "30m ago", 29]],
  "t-banks-need-coders": [["Riley", "Sophomore", "a bank being a tech company in a suit is so funny and true", "2h ago", 26]],
  "et-takeaway": [["Ava", "Junior", "mine was the panelist who said she changed careers twice. so freeing", "25m ago", 71], ["Devon", "Senior", "the EY table answered every single question I had. best event this year", "20m ago", 48], ["Sam", "Senior", "the 'ask about the person first' tip. using it at the next fair", "15m ago", 39]],
  // ——— United Way network ———
  "uw-t-recruiting": [["Sofia", "Senior", "A job where you help people find jobs. That sounds perfect.", "30m ago", 6, "Orange County"]],
  "uw-t-interview": [["Priya", "Sophomore", "Clean shoes. Writing that down.", "1h ago", 5, "Salt Lake"]],
  "uw-t-sixteen": [["Omar", "Senior", "I got one at the library at 16. Ask about youth programs like they said.", "18h ago", 8, "Bay Area"]],
  // ——— United Way Michigan ———
  "mi-t-nurse": [["Jaylen", "Freshman", "Every hour is different. I like that.", "20m ago", 4, "Southeast Michigan"]],
  "mi-t-shadow": [["Kiara", "Junior", "I asked my teacher and she set it up in one day.", "1h ago", 6, "Southeast Michigan"]],
  "mi-t-apprentice": [["Ana", "Junior", "Paid while you learn plus college classes. Best of both.", "16h ago", 5, "West Michigan"]],
  // ——— United Way South Central ———
  "sc-t-nonprofit": [["Priya", "Junior", "Loan help from a nonprofit job? Great to know.", "20h ago", 8, "Kalamazoo"], ["Leo", "Sophomore", "Looking at the job, not the label. Smart.", "18h ago", 6, "Lansing"]],
  "sc-t-government": [["Sam", "Senior", "Set my job alerts for the state site today.", "20h ago", 7, "Lansing"], ["Jada", "Senior", "Jackson's city site has summer jobs too.", "18h ago", 5, "Jackson"]],
  "sc-t-health": [["Grace", "Senior", "Shots at schools! I remember those nurses.", "3d ago", 7, "Battle Creek"], ["Mia", "Junior", "Teaching families sounds like the best part.", "3d ago", 6, "Kalamazoo"]],
  "sc-t-next-convening": [["Theo", "Junior", "Kalamazoo is bringing eight of us.", "10h ago", 9, "Kalamazoo"], ["Leo", "Sophomore", "Saving a seat on the van for anyone from Lansing.", "8h ago", 7, "Lansing"]],
  "sc-t-planner": [["Sam", "Senior", "Maps and data. Lansing needs planners too.", "20m ago", 4, "Lansing"]],
  "sc-t-msu": [["Theo", "Junior", "Western's nonprofit class is open to high schoolers in summer.", "2h ago", 5, "Kalamazoo"]],
  "sc-t-hours-swap": [["Kai", "Junior", "I did a Jackson shift and a Lansing one. Both counted.", "1h ago", 5, "Jackson"]],
  "sc-q-kz-teacher": [["Lila", "Sophomore", "The moment it clicks for a kid. I want that.", "5m ago", 4, "Kalamazoo"], ["Owen", "Senior", "Tutoring my neighbor helped me decide too.", "3m ago", 3, "Kalamazoo"]],
  "sc-q-kz-firstjob": [["Theo", "Junior", "Library job here. Best first job.", "1h ago", 6, "Kalamazoo"], ["Nia", "Junior", "Camp counselor. You learn to lead fast.", "40m ago", 5, "Battle Creek"]],
  "sc-q-kz-yuw-join": [["Lila", "Sophomore", "I joined as a freshman too. You'll love it.", "3h ago", 5, "Kalamazoo"]],
  "sc-q-kz-resume": [["Jada", "Senior", "One number per line. My résumé looks so much better now.", "16h ago", 6, "Jackson"], ["Mia", "Junior", "Food drive lead is going on mine today.", "15h ago", 4, "Kalamazoo"]],
  "sc-q-bc-pt": [["Amaya", "Junior", "Cheering people on all day sounds like a great job.", "30m ago", 6, "Battle Creek"], ["Eli", "Sophomore", "Shadowing one in December with the nurse day.", "20m ago", 4, "Battle Creek"]],
  "sc-q-bc-shadow": [["Diego", "Junior", "Bringing a snack and one question. See you there.", "4h ago", 4, "Battle Creek"]],
  "sc-q-bc-caring": [["Grace", "Senior", "Leading with a friend is such a good idea.", "15h ago", 4, "Battle Creek"]],
  "sc-q-lan-data": [["Sam", "Senior", "Spreadsheets this month, then a coding class.", "15m ago", 3, "Lansing"], ["Andre", "Senior", "Our city uses data for parks too. Cool to know.", "10m ago", 3, "Lansing"]],
  "sc-q-jx-mlk": [["Jada", "Senior", "Bringing water and my whole Student United group.", "12h ago", 5, "Jackson"]],
  "sc-q-across-van": [["Mia", "Junior", "Asking my lead today. Thanks!", "20m ago", 3, "Kalamazoo"]],
  "sc-q-across-summer": [["Kai", "Junior", "Applying to three like you said.", "16h ago", 5, "Jackson"], ["Mia", "Junior", "The nurse shadow and two parks jobs. Done!", "15h ago", 4, "Kalamazoo"]],
  "sc-et-college-table": [["Owen", "Senior", "Western's table had the best answers last time.", "14h ago", 4, "Kalamazoo"]],
};

/** Comments under professionals' posts (same 15 Oct 2026 ask): mostly
 *  students, with another professional now and then so the mix reads real.
 *  A "pro:<proId>" handle is a professional's comment (grade ignored). A
 *  popular post (200+ likes) gets a lively thread of eight or nine; a
 *  quiet one keeps its two or three. DEMO-ONLY: every line below. */
type Voice = [handle: string, grade: string, body: string, ago: string, likes: number, place?: string];
const INSIGHT_VOICES: Record<string, Voice[]> = {
  // ——— Connect boards: lively threads on the most-liked posts ———
  "i-first-week-bank": [["Sam", "Senior", "The 'people other people want on their team' line. Working on being that person.", "4d ago", 68], ["Priya", "Sophomore", "Careful over clever. I can do careful.", "4d ago", 52], ["pro:pro-okafor", "", "Same at my bank. The careful analysts get put on the best deals.", "3d ago", 91], ["Marcus", "Freshman", "Does writing clearly mean emails or reports?", "3d ago", 31], ["pro:pro-grant", "", "Both. Mostly short emails that say exactly one thing.", "3d ago", 77], ["Ava", "Junior", "ok adding 'write one clear email a day' to my goals", "2d ago", 44]],
  "i-debugging-lesson": [["Zoe", "Sophomore", "Reproduce it before touching anything. My group project needed this rule.", "4d ago", 71], ["Riley", "Sophomore", "Three days and one character is wild. Thank you for being honest.", "3d ago", 58], ["Ethan", "Junior", "Do senior engineers still get stuck like this?", "3d ago", 46], ["pro:pro-zhang", "", "All the time. We just have a better checklist.", "3d ago", 102], ["Lena", "Junior", "writing down what I ruled out starting tonight", "2d ago", 39], ["pro:pro-sullivan", "", "Same checklist on my team at 2 a.m. The slow read of the error message saves hours.", "2d ago", 64]],
  "i-shift-life": [["Theo", "Sophomore", "Nights sound calmer. I think that's me.", "14h ago", 48], ["Ruby", "Junior", "Which shift do most new nurses get first?", "12h ago", 33], ["pro:pro-brooks", "", "Usually nights. Days open up once you have a year in.", "10h ago", 76], ["Zoe", "Sophomore", "More time with each patient on nights. I like that.", "8h ago", 41], ["pro:pro-reyes", "", "Did two years of nights. Best team I ever had.", "6h ago", 69], ["Priya", "Sophomore", "saving this for when I pick my first job", "4h ago", 27]],
  "i-gallagher-2": [["Ethan", "Junior", "Doing this with one article every morning before school.", "1d ago", 88], ["Lena", "Senior", "One number that surprised you. That's such a small habit.", "1d ago", 61], ["Theo", "Junior", "Which paper do you read?", "20h ago", 34], ["pro:pro-gallagher", "", "Any big business section. The habit matters more than the paper.", "18h ago", 97], ["Jo", "Senior", "day 4 of doing this and I already recognize company names", "12h ago", 52]],
  "i-haddad-2": [["Sana", "Sophomore", "Patient care with a science notebook. I love that line.", "1d ago", 74], ["Noah", "Sophomore", "Do you work with the same patients for the whole trial?", "1d ago", 41], ["pro:pro-haddad", "", "Yes, often for months. You really get to know them.", "22h ago", 88], ["Riley", "Sophomore", "science and people in one job. this is the one", "18h ago", 56], ["pro:pro-reyes", "", "Omar's unit took two of my students for shadow days. Great place to see research up close.", "16h ago", 63]],
  "i-zhang-2": [["Marcus", "Freshman", "Turned on every security setting on my phone tonight. Took ten minutes.", "1d ago", 92], ["Ruby", "Junior", "Which capture-the-flag is good for a total beginner?", "1d ago", 58], ["pro:pro-zhang", "", "picoCTF. It's built for high school students.", "22h ago", 121], ["Devon", "Senior", "explaining a breach report to my friend was harder than reading it lol", "16h ago", 47], ["Zoe", "Sophomore", "doing all three this month", "12h ago", 36], ["pro:pro-nair", "", "Same path I took. The breach report habit is what got me hired.", "10h ago", 70]],
  "i-fontaine-2": [["Ava", "Sophomore", "Thirty seconds. Cutting mine down tonight.", "1d ago", 66], ["Jo", "Senior", "Your best piece first. I always saved it for last.", "1d ago", 54], ["Zoe", "Sophomore", "What if I only have two pieces?", "20h ago", 29], ["pro:pro-fontaine", "", "Two good ones beat three with a weak one. Send it.", "18h ago", 83], ["Amir", "Junior", "no intro card is the tip I needed", "14h ago", 38]],
  "i-sketchbook-portfolio": [["Zoe", "Sophomore", "My rejected versions are going in. This is so freeing.", "20h ago", 71], ["Priya", "Junior", "Show your thinking, not your taste. Writing that on my wall.", "16h ago", 58], ["pro:pro-cole", "", "Same from the hiring side. Process pages tell me how you think.", "12h ago", 94], ["Devon", "Senior", "the before and after cut idea works for my photo edits too", "8h ago", 43]],
  "i-dont-know-answer": [["Priya", "Sophomore", "Used this in my first job interview last week. Got the job.", "3d ago", 109], ["Marcus", "Freshman", "What if I really have no idea how to find out?", "3d ago", 44], ["pro:pro-tanaka", "", "Say who you would ask. Knowing who to ask is a skill too.", "2d ago", 97], ["Ava", "Junior", "knowing who to ask being a skill. wow ok", "2d ago", 51]],
  // ——— Connect boards: a comment or two more where the post earned it ———
  "i-first-internship": [["Sam", "Senior", "Ask questions in batches. Doing this in class too.", "2d ago", 77], ["Riley", "Sophomore", "the intern who asks at the right moment. ok noted", "1d ago", 49]],
  "i-first-year-analyst": [["Jordan", "Junior", "checking my work before my teacher does. that's the habit", "4d ago", 29]],
  "i-nursing-first-year": [["Noah", "Sophomore", "the schedule part makes nursing sound doable with school", "20h ago", 61]],
  "i-what-brands-pay-for": [["pro:pro-cole", "", "Pick any ad you see today and say out loud why they made each choice. That's the practice.", "10h ago", 58]],
  "i-first-portfolio": [["Sam", "Senior", "Finished beats fancy. Shipping my small app this week.", "8h ago", 66], ["Marcus", "Freshman", "a README that explains decisions. I never wrote one. starting now", "6h ago", 38]],
  "i-nurse-questions": [["Sana", "Junior", "The answer is yes for me. Even at 3 AM.", "3d ago", 94], ["Riley", "Sophomore", "useful to learn at seventeen either way. thank you", "2d ago", 48]],
  "i-networking-nobody": [["pro:pro-tanaka", "", "Agree. The students who ask one real question are the ones I remember at fairs.", "1d ago", 61]],
  "i-art-director-day": [["Amir", "Junior", "Less drawing, more deciding. Didn't expect that.", "4d ago", 52], ["pro:pro-fontaine", "", "Same for motion leads. The craft gets you in, the direction keeps you there.", "4d ago", 67]],
  "i-chen-2": [["Sam", "Senior", "one thing you'd do differently. adding that to every README", "20h ago", 44]],
  "i-martinez-2": [["Jordan", "Junior", "Doing a teardown of my favorite shoe brand this weekend.", "20h ago", 58], ["Ava", "Sophomore", "no slides, no jargon. I can do that", "16h ago", 36]],
  "i-okafor-2": [["Lena", "Junior", "Excel like a language. Starting with the free course.", "20h ago", 63], ["Theo", "Junior", "one deal story a week. where do I find those?", "18h ago", 29], ["pro:pro-okafor", "", "Any business news site. Search the word 'acquires'.", "16h ago", 74]],
  "i-osei-2": [["Riley", "Sophomore", "Six years of coding first. Good to know it's not a shortcut.", "20h ago", 70], ["Jo", "Senior", "I like helping teammates get unstuck too. interesting", "14h ago", 41]],
  "i-grant-2": [["Devon", "Senior", "asking for help before the deadline. learning this one the hard way", "18h ago", 45]],
  "i-whitfield-2": [["Priya", "Sophomore", "A number, a verb, one time it didn't work. Rewriting tonight.", "20h ago", 72], ["Diego", "Junior", "the 'time it didn't work' line is brave. I'm adding one", "12h ago", 48]],
  "i-tanaka-2": [["Noah", "Sophomore", "Practicing my 'something went wrong' story out loud today.", "20h ago", 66], ["Sana", "Junior", "what if the mistake was in a group project?", "16h ago", 30], ["pro:pro-tanaka", "", "Even better. Tell me your part and what you changed.", "12h ago", 71]],
  "i-brooks-2": [["Amir", "Junior", "Step on at any rung and keep climbing while you earn. Love this.", "20h ago", 83], ["Ruby", "Junior", "CNA first, then RN. That's my plan now.", "14h ago", 57], ["pro:pro-reyes", "", "Exactly how I did it. CNA at 18, RN at 22.", "10h ago", 92]],
  "i-haddad-3": [["Devon", "Senior", "informatics? never heard of it. looking it up now", "16h ago", 37]],
  "i-vega-2": [["Theo", "Sophomore", "Months of editing. I always thought the shoot was the long part.", "20h ago", 54], ["Amir", "Junior", "a one-page pitch first. doing one for our club's video", "14h ago", 33]],
  "i-vega-3": [["Riley", "Sophomore", "I run our morning announcements! Making a run sheet tomorrow.", "20h ago", 78], ["Zoe", "Sophomore", "taking small things seriously. ok that's the whole lesson", "12h ago", 49]],
  "i-shoes-that-fit": [["Priya", "Sophomore", "which athlete testimonial to lead with is a job?? cool", "1d ago", 33]],
  "i-family-doctor": [["Sana", "Junior", "My mom translates for my grandma at the doctor too. This hit home.", "8h ago", 88]],
  "i-brands-need-athletes": [["Jo", "Senior", "ran cross country for four years. this is the seat I want", "4h ago", 40]],
  "i-fix-what-bugs-you": [["Marcus", "Freshman", "fixing our club's broken sign-up page this weekend", "6h ago", 42]],
  "i-group-project-plan": [["Sam", "Senior", "I'm the plan writer in every group. maybe this is my job", "8h ago", 36]],
  "i-skip-at-second-seven": [["Riley", "Sophomore", "second seven! I always skip at the intro", "12h ago", 31]],
  "i-grandmothers-notebook": [["Zoe", "Sophomore", "My grandma has a notebook like that too. Sweet post.", "5w ago", 51]],
  "i-overheating-laptop": [["Priya", "Sophomore", "everyone's first model is a mess. needed that today", "2h ago", 46]],
  "i-mailroom-to-director": [["Theo", "Sophomore", "figuring out what makes someone care. that's the job in one line", "1d ago", 39]],
  // ——— United Way boards: students first, a volunteer now and then ———
  "uwi-sc-kz-food": [["Mia", "Junior", "Our whole Youth United Way group is coming Saturday.", "2h ago", 7, "Kalamazoo"], ["Owen", "Senior", "Leads learn to run a team. Signing up as a lead.", "1h ago", 5, "Kalamazoo"]],
  "uwi-sc-bc-pharm": [["Nia", "Junior", "Paid while you learn is the best part.", "1h ago", 6, "Battle Creek"], ["Amaya", "Junior", "Asking at our CVS this week.", "40m ago", 4, "Battle Creek"]],
  "uwi-sc-across-code": [["pro:pro-rossi", "", "I'd help run a night. Count me in.", "18h ago", 11]],
  "uwi-net-ignite": [["Luis", "Junior", "Is there one in Miami too?", "3h ago", 4, "Miami"], ["pro:pro-tanaka", "", "Not yet, but Youth Career Connections in Miami is the same idea.", "2h ago", 8], ["Andre", "Senior", "Applied last year. The coaching before day one really helped.", "1h ago", 6, "Midlands"], ["pro:pro-whitfield", "", "I coach the Ignite teens before day one. Ask me anything about the interview.", "1h ago", 9]],
  "uwe-mentor-first": [["Andre", "Senior", "Asked my mentor how she started. Best talk yet.", "13d ago", 5, "Midlands"]],
  "uwi-mi-gdyt": [["Kiara", "Junior", "I did GDYT last summer. Apply the first day.", "18h ago", 9, "Southeast Michigan"], ["pro:pro-tanaka", "", "We host six GDYT teens every summer at our office. Great program.", "12h ago", 7]],
  "uwi-mi-mlk": [["Marcus", "Sophomore", "One table for check-in. Using this for our drive.", "2d ago", 6, "Genesee"]],
  "uwe-mim-start": [["Noah", "Freshman", "Three friends and one idea. We have that!", "5d ago", 4, "Marquette"]],
};

/** Adds the comments above under the professionals' posts. Mutates the
 *  seeded insights in place. */
export function addInsightVoices(insights: Insight[]) {
  for (const i of insights) {
    const voices = INSIGHT_VOICES[i.id];
    if (!voices) continue;
    i.replies.push(...voices.map(([handle, grade, body, postedAgo, likes, place]): InsightReply =>
      handle.startsWith("pro:") ? { proId: handle.slice(4), body, postedAgo, likes } : { handle, grade, body, postedAgo, likes, ...(place ? { place } : {}) }));
  }
}

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
    const peers = [...(PEERS[t.id] ?? []), ...(MORE_PEERS[t.id] ?? [])];
    if (peers.length) t.responses.push(...peers.map(([handle, grade, body, postedAgo, likes, place]) => ({ kind: "peer" as const, handle, grade, body, postedAgo, likes, ...(place ? { place } : {}) })));
    let gif = false;
    for (const r of t.responses) {
      if (r.kind !== "peer" || !r.image) continue;
      if (gif) { delete r.image; delete r.imageAlt; } else gif = true;
    }
    t.comments = Math.max(t.comments ?? 0, t.responses.length + 3);
  }
}
