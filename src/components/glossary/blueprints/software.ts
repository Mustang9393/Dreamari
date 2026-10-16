// DEMO-ONLY content: the Software Engineering glossary, under the Tech &
// Engineering world (16 Oct 2026). Written to the "Dreamari Glossary Game
// Master Scaling Plan" SOP, world #10: a continuous story. One app, Nova
// Notes, goes from idea to release across the levels, so later words build
// on earlier ones (requirements, then code, then testing, then shipping).
// Six playable levels walk the full difficulty ladder: Level 1 recognizes,
// Level 2 applies, Level 3 tells confusable words apart, Levels 4 to 6
// decide. Eighth-grade copy, no dashes, no numbers (software words do not
// need them), every example names Nova Notes. Replace with the content
// team's sheet when it exists; the shape below is what the sheet must
// provide.
//
// Rewritten 17 Oct 2026 to the Finance style after Chandu's note: "the games
// are repeating the same questions again and again for mastery instead of
// having any variety, please refer the finance glossary games and redo
// questions according to its style." Every word now carries three moments,
// each shown on one screen only; Levels 3, 5 and 6 sort concrete team
// moves into concept buckets; Levels 2 to 6 carry two short cases that read
// as Nova Notes growing, plus an authored Select All; every level has a
// written Power Play whose blanks do not run in teaching order. culinary.ts
// is the model.

import type { GlossaryBlueprint } from "../generate";

export const SOFTWARE_GLOSSARY: GlossaryBlueprint = {
  industry: { slug: "software", title: "Tech Terms", subject: "software", world: "Tech & Engineering" },
  mode: "continuous_story",
  studentRole: "developer",
  exampleCareerSlug: "software-engineer",
  company: "Nova Notes",
  idPrefix: "SWE",
  chapters: [
    { number: 1, name: "Build It", tier: "Beginner" },
    { number: 2, name: "Ship It", tier: "Intermediate" },
    { number: 3, name: "Grow It", tier: "Advanced" },
  ],
  levels: [
    {
      number: 1,
      title: "App Basics",
      tier: "Beginner",
      goal: "Start building Nova Notes.",
      unlocks: "$10K",
      milestone: "Start Nova Notes",
      nextMilestone: "Plan the first version",
      companyValue: 10000,
      nextCompanyValue: 50000,
      terms: [
        {
          term: "App", definition: "A program people open on a phone or computer to do one job.", example: "Nova Notes is an app for saving quick notes.", cue: "A program on your phone", icon: "smartphone",
          moments: ["Students tap the Nova Notes icon and it opens on their phones.", "One tap on the phone and a program opens for one job.", "Jo downloads a small program to her phone to save quick notes."],
        },
        {
          term: "User", definition: "A person who opens and uses a program.", example: "Every student who writes in Nova Notes is a user.", cue: "The person using it", icon: "users",
          moments: ["A student opens Nova Notes every morning to write down homework.", "The person holding the phone, typing a note before class.", "Thousands of students open it each day. Every one of them matters."],
        },
        {
          term: "Feature", definition: "One thing a program can do for the people using it.", example: "Dark mode is a feature of Nova Notes.", cue: "One thing it can do", icon: "sparkles",
          moments: ["Jo adds a way to pin a note to the top.", "Tap the moon icon and the whole screen turns dark.", "Sam adds a search box so notes are easy to find."],
        },
        {
          term: "Code", definition: "The written instructions that tell a computer what to do.", example: "The team writes code to make Nova Notes work.", cue: "Instructions for the computer", icon: "code",
          moments: ["Jo types line after line of instructions the computer will follow.", "A screen of text tells the phone what to do when tapped.", "Sam writes the lines that make the save button actually save."],
        },
        {
          term: "Bug", definition: "A mistake in the instructions that makes a program act wrong.", example: "A bug made Nova Notes delete a note by mistake.", cue: "A mistake that breaks things", icon: "bug",
          moments: ["Tap save and the note disappears. That is not supposed to happen.", "The clock on the notes shows the wrong day every Monday.", "A typo makes the program delete a note by mistake."],
        },
      ],
      powerPlay: {
        intro: "Build the very first Nova Notes.",
        paragraph: "Jo wants a small {1} for quick notes. She types the {4} that makes save work. Her little brother is the first {2}. His note vanishes, so Jo finds the {5}. Then she adds a {3} to pin notes.",
      },
      facts: [
        "Most apps start as one person's small idea and a single screen.",
        "The word bug comes from a real moth found inside an old computer.",
      ],
    },
    {
      number: 2,
      title: "Planning It",
      tier: "Beginner",
      goal: "Plan the first version.",
      unlocks: "$50K",
      milestone: "Plan the first version",
      nextMilestone: "Make it work every time",
      companyValue: 50000,
      nextCompanyValue: 120000,
      intro: { headline: "Nova Notes Needs a Plan", line: "The idea is good. Now the team has to agree on what to build.", hook: "Learn the words a team uses before any code is written." },
      terms: [
        {
          term: "Requirement", definition: "A clear statement of what a program must do.", example: "One requirement for Nova Notes is that notes save without Wi-Fi.", cue: "What it must do", icon: "list-checks",
          moments: ["The teacher says notes must save even with no internet.", "Every note must open in under a second, the plan says.", "The list says every student must be able to share a note."],
        },
        {
          term: "Design", definition: "The plan for how a program will look and work.", example: "The Nova Notes design puts the new note button at the bottom.", cue: "The plan for look and flow", icon: "pen-tool",
          moments: ["A sketch shows where every button on the screen goes.", "Maya draws the new note button big and at the bottom.", "The team picks colors and decides what happens after each tap."],
        },
        {
          term: "Prototype", definition: "An early rough version built to test an idea.", example: "The first Nova Notes prototype had one screen and no colors.", cue: "A rough early version", icon: "layers",
          moments: ["A quick one screen version, just to test the idea.", "Built in a day, rough and gray, only the save button works.", "Jo shows a rough early version to five students at lunch."],
        },
        {
          term: "Repository", definition: "The shared place where a team keeps all of its code.", example: "All Nova Notes code lives in one repository.", cue: "Where the code is kept", icon: "folder-git",
          moments: ["Every file the team has ever written, kept in one shared place.", "Sam pulls the latest files from the shared place before starting.", "One folder online holds all the files. Everyone works from it."],
        },
        {
          term: "Commit", definition: "Saving one set of changes to the shared code with a note about them.", example: "Each Nova Notes commit explains what changed and why.", cue: "One saved change with a note", icon: "git-commit",
          moments: ["Jo saves her change and writes a note: fixed the save button.", "Each saved change comes with a short note saying what changed.", "Maya saves one small change, then writes what it was."],
        },
      ],
      selectAll: {
        term: "Requirement",
        prompt: "Select every line that says what Nova Notes must do.",
        options: ["Notes must never be lost", "Search must find any word", "Jo likes the color blue", "The team meets on Tuesdays"],
        correct: [0, 1],
        feedbackCorrect: "Never losing notes and finding any word are musts. The rest are not.",
        feedbackWrong: "A rule says what the app must do. A favorite color is not a rule.",
      },
      cases: [
        {
          terms: ["Requirement", "Design", "Prototype"],
          scene: "Nova Notes is still just an idea on a whiteboard.",
          steps: [
            { prompt: "What does the team write down first?", options: ["What the app must do", "What the icon looks like", "Who gets paid first", "The name of the font"], correctIndex: 0 },
            { prompt: "Next they plan how every screen will look and flow. What is that plan called?", options: ["Design", "Commit"], correctIndex: 0 },
            { prompt: "Before building the real thing, what do they build to try the idea?", options: ["A rough early version", "The finished app"], correctIndex: 0 },
          ],
          feedbackCorrect: "Right. First what it must do, then the look, then a rough try.",
          feedbackWrong: "Start with what it must do. Then plan the look and build a rough try.",
        },
        {
          terms: ["Repository", "Commit"],
          scene: "Jo and Sam both change the save button on the same day.",
          steps: [
            { prompt: "Where should both of their changes end up?", options: ["One shared place for all code", "Each one's own laptop"], correctIndex: 0 },
            { prompt: "Jo saves her change. What should go with it?", options: ["A note saying what changed", "Nothing, just save"], correctIndex: 0 },
          ],
          feedbackCorrect: "Shared code lives in one place, and every saved change carries a note.",
          feedbackWrong: "Code lives in one shared place. Each saved change gets a short note.",
        },
      ],
      powerPlay: {
        intro: "Plan the first version of Nova Notes.",
        paragraph: "Jo builds a rough {3} in one day. Students like it, so the team writes the first {1}. Maya draws the {2} with a big new note button. All the files live in one shared {4}. Each change Sam saves is a {5} with a short note.",
      },
      facts: ["Teams often start each requirement with the words a user can."],
    },
    {
      number: 3,
      title: "Testing It",
      tier: "Intermediate",
      goal: "Make it work every time.",
      unlocks: "$120K",
      milestone: "Make it work every time",
      nextMilestone: "Put it in students' hands",
      companyValue: 120000,
      nextCompanyValue: 250000,
      intro: { headline: "Nova Notes Breaks", line: "The first testers found problems in the first hour.", hook: "Learn the words for finding and fixing what is wrong." },
      terms: [
        {
          term: "Test", definition: "A check that one part of a program works the way it should.", example: "Nova Notes runs a test on the save button before every release.", cue: "A check that it works", confusion: "Debug", icon: "flask-conical",
          moments: ["Before shipping, the team runs checks on every button.", "A script taps save over and over and reports any failure.", "Does the search box find a note? Sam checks it does."],
        },
        {
          term: "Debug", definition: "Finding the cause of a problem in the code and fixing it.", example: "The team spent a day on Nova Notes to debug the missing notes.", cue: "Find and fix the cause", confusion: "Test", icon: "search",
          moments: ["Something is broken. Jo reads every line to find out why.", "Notes vanish on save. Sam traces the problem to one bad line.", "Jo adds print lines to see where the code goes wrong."],
        },
        {
          term: "Crash", definition: "When a program stops working and closes on its own.", example: "A crash closed Nova Notes every time a photo was added.", cue: "It stops and closes", confusion: "Edge Case", icon: "zap-off",
          moments: ["You tap a photo and the whole screen goes black and closes.", "The app shuts itself with no warning in the middle of typing.", "Open a long note and Nova Notes closes on its own."],
        },
        {
          term: "Edge Case", definition: "A rare or extreme situation a program must still handle.", example: "An empty note title is an edge case Nova Notes has to handle.", cue: "A rare, extreme situation", confusion: "Crash", icon: "corner-down-right",
          moments: ["What happens if a note is ten thousand words long?", "A student saves a note with no title at all. Then what?", "Someone types a note made only of emoji. Does it still save?"],
        },
        {
          term: "Code Review", definition: "A teammate reads your changes and gives feedback before they go in.", example: "No Nova Notes change ships without a code review.", cue: "A teammate checks your changes", confusion: "Test", icon: "eye",
          moments: ["Sam reads Jo's change and leaves two comments before approving.", "No change goes in until a teammate has read every line.", "Maya asks Jo to look over her change before it ships."],
        },
      ],
      sort: {
        label: "Catch, fix or problem",
        prompt: "Does each one catch a problem, fix one, or is it the problem itself?",
        buckets: ["Catches problems", "Fixes problems", "Is a problem"],
        items: [
          { text: "A script checks the save button", bucket: "Catches problems", term: "Test" },
          { text: "Jo traces a bug to one line", bucket: "Fixes problems", term: "Debug" },
          { text: "The screen goes black and closes", bucket: "Is a problem", term: "Crash" },
          { text: "Sam reads Jo's change first", bucket: "Catches problems", term: "Code Review" },
          { text: "A note with an empty title", bucket: "Is a problem", term: "Edge Case" },
          { text: "Tap save, the app shuts itself", bucket: "Is a problem", term: "Crash" },
        ],
        feedbackCorrect: "Checks catch problems and tracing fixes them. The rest are the problems.",
        feedbackWrong: "Ask: does it find trouble, fix it, or is it the trouble?",
      },
      selectAll: {
        term: "Debug",
        prompt: "Select every step that is part of finding and fixing the cause.",
        options: ["Read the error message", "Trace where the note gets lost", "Pick a new app icon", "Try the fix and run it again"],
        correct: [0, 1, 3],
        feedbackCorrect: "Reading, tracing and trying the fix all get to the cause. A new icon does not.",
        feedbackWrong: "Read the error, trace it, then try the fix. A new icon fixes nothing.",
      },
      cases: [
        {
          terms: ["Debug", "Test", "Code Review"],
          scene: "First students report that notes vanish when a photo is added.",
          steps: [
            { prompt: "What should Jo do first?", options: ["Find the cause in the code", "Ship a new icon", "Delete the photo button", "Wait and see"], correctIndex: 0 },
            { prompt: "Jo finds the bad line and fixes it. What runs next, before release?", options: ["A check that save still works", "Nothing, ship it now"], correctIndex: 0 },
            { prompt: "Who reads Jo's change before it goes in?", options: ["A teammate", "Nobody"], correctIndex: 0 },
          ],
          feedbackCorrect: "Find the cause, check the fix, then a teammate reads it.",
          feedbackWrong: "Find the cause, run a check, then a teammate reads the change.",
        },
        {
          terms: ["Crash", "Edge Case"],
          scene: "Maya tries two odd things on purpose to see what breaks.",
          steps: [
            { prompt: "She saves a note with no title. Nothing breaks. What was that?", options: ["A rare situation to handle", "A program closing itself"], correctIndex: 0 },
            { prompt: "She adds a huge photo and the app closes on its own. What was that?", options: ["Just an odd input", "The app stopped and shut down"], correctIndex: 1 },
          ],
          feedbackCorrect: "An odd input is an edge case to handle. The app closing on its own is a crash.",
          feedbackWrong: "An odd input the app must handle is an edge case. Shutting down is a crash.",
        },
      ],
      powerPlay: {
        intro: "Make Nova Notes work every time.",
        paragraph: "Students break Nova Notes in an hour. Add a photo and the app closes: a {3}. Jo has to {2}, line by line, until she finds the cause. Then Maya saves a note with no title, an {4} nobody saw coming. Sam does a {5} before any fix ships. Now a {1} checks the save button every time.",
      },
      facts: ["Many teams let no change in until another person has read it."],
    },
    {
      number: 4,
      title: "Shipping It",
      tier: "Intermediate",
      goal: "Put it in students' hands.",
      unlocks: "$250K",
      milestone: "Put it in students' hands",
      nextMilestone: "Learn from real users",
      companyValue: 250000,
      nextCompanyValue: 500000,
      intro: { headline: "Nova Notes Goes Live", line: "Real students will open it tomorrow morning.", hook: "Learn the words for release day and what to do when it goes wrong." },
      terms: [
        {
          term: "Deploy", definition: "Putting a new version of a program out where people can use it.", example: "The team will deploy Nova Notes on Friday morning.", cue: "Put it out for users", confusion: "Rollback", icon: "rocket",
          moments: ["The new build passed every check. Time to put it out.", "Friday morning, Jo presses the button and students get the new build.", "The finished build leaves the team's laptops and goes live for everyone."],
        },
        {
          term: "Rollback", definition: "Going back to the last version that worked after a bad release.", example: "A rollback put Nova Notes back to the version that worked.", cue: "Go back to the last version", confusion: "Deploy", icon: "undo",
          moments: ["The new build deletes notes. Users need the old one back now.", "Sam switches everyone back to last week's build in minutes.", "Something broke after release, so the team undoes it and goes back."],
        },
        {
          term: "Version", definition: "One numbered release of a program.", example: "Nova Notes version two added folders.", cue: "One numbered release", confusion: "Deploy", icon: "tag",
          moments: ["The update notes say: new in this release, folders.", "Jo's phone runs two point one. Sam's still runs two point zero.", "Each release gets a number, so the team knows which you have."],
        },
        {
          term: "Server", definition: "A computer that stores data and answers requests from many people.", example: "Every Nova Notes note is saved on a server.", cue: "The computer that stores data", confusion: "Outage", icon: "server",
          moments: ["Your notes appear on your laptop and your phone. Something stores them.", "A big computer in a far away building holds every note.", "A machine far away answers every request to load a note."],
        },
        {
          term: "Outage", definition: "A time when a program or its computers stop working for everyone.", example: "An outage kept every Nova Notes user from saving for an hour.", cue: "Down for everyone", confusion: "Server", icon: "wifi-off",
          moments: ["Nobody anywhere can open the app. Not just you. Everyone.", "For an hour, no student in the world could save a note.", "The status page turns red and support gets a flood of messages."],
        },
      ],
      selectAll: {
        term: "Server",
        prompt: "Select everything the Nova Notes server does.",
        options: ["Stores every saved note", "Answers requests from many phones", "Draws the app icon", "Runs all night in a data center"],
        correct: [0, 1, 3],
        feedbackCorrect: "It stores notes, answers every phone and never sleeps. The app draws its icon.",
        feedbackWrong: "The server stores notes and answers phones all night. It draws no icons.",
      },
      cases: [
        {
          terms: ["Deploy", "Rollback"],
          scene: "Friday's new build is live, and notes start disappearing.",
          steps: [
            { prompt: "Notes are vanishing for real students. What is the fastest safe move?", options: ["Go back to last week's build", "Keep it live and watch", "Post an apology", "Turn off the app for a week"], correctIndex: 0 },
            { prompt: "The fix is ready and passed every check. What now?", options: ["Put the new build out again", "Wait a month to be safe"], correctIndex: 0 },
          ],
          feedbackCorrect: "Roll back first, fix second, then deploy again once the checks pass.",
          feedbackWrong: "Roll back to the last good build first. Then fix it and deploy again.",
        },
        {
          terms: ["Server", "Outage"],
          scene: "At noon the big computer that holds the notes stops answering.",
          steps: [
            { prompt: "What do students see?", options: ["Nobody can open their notes", "Only one student has trouble"], correctIndex: 0 },
            { prompt: "Which part of Nova Notes needs fixing?", options: ["The machine that stores notes", "The app icon", "The color of the save button", "The release notes"], correctIndex: 0 },
          ],
          feedbackCorrect: "When the server stops, it is an outage: everyone is down at once.",
          feedbackWrong: "One stopped server takes notes down for everyone. That is an outage.",
        },
      ],
      powerPlay: {
        intro: "Put Nova Notes in students' hands.",
        paragraph: "Every Nova Notes note lands on one {4} far away. When it stopped last spring, the team had its first {5}. Friday morning, Jo hits {1} and the new build goes live. By noon notes vanish, so Sam does a {2} to last week's build. Monday, with the fix checked, {3} two ships with folders.",
      },
      facts: ["Big teams often release to a few users first. A bad build then hurts few."],
    },
    {
      number: 5,
      title: "Growing It",
      tier: "Advanced",
      goal: "Learn from real users.",
      unlocks: "$500K",
      milestone: "Learn from real users",
      nextMilestone: "Keep every note safe",
      companyValue: 500000,
      nextCompanyValue: 1000000,
      intro: { headline: "Nova Notes Has Users", line: "Thousands of students now open it every day.", hook: "Learn the words a team uses to get better every week." },
      terms: [
        {
          term: "Analytics", definition: "Numbers that show how people really use a program.", example: "Nova Notes analytics showed most users never opened folders.", cue: "Numbers on how people use it", confusion: "Feedback", icon: "eye",
          moments: ["A chart shows which buttons people tap and which they ignore.", "The numbers say most students never open the folders tab.", "A dashboard counts how many notes get saved every day."],
        },
        {
          term: "Feedback", definition: "What users say about a program, good or bad.", example: "A Nova Notes user sent feedback asking for a dark mode.", cue: "What users say", confusion: "Analytics", icon: "search",
          moments: ["An email from a student: please add a way to pin notes.", "A review in the store says the search is too slow.", "A teacher tells the team what her class loves and hates."],
        },
        {
          term: "Iteration", definition: "One round of improving a program and releasing it again.", example: "Each Nova Notes iteration fixes a few things and ships.", cue: "One round of improvement", confusion: "Sprint", icon: "refresh-cw",
          moments: ["Fix three things, ship, listen, then do it again next week.", "The pin button changes a little each week and keeps getting better.", "Ship a small improvement, learn from it, ship the next one."],
        },
        {
          term: "Backlog", definition: "The list of everything the team still wants to build or fix.", example: "The Nova Notes backlog has sixty items waiting.", cue: "The list of work still to do", confusion: "Sprint", icon: "list-checks",
          moments: ["A long list of ideas and bugs, sorted by what matters most.", "Sixty items wait their turn. Folders is near the top.", "Every new idea gets written down and waits until it is picked."],
        },
        {
          term: "Sprint", definition: "A short, fixed stretch of work, often two weeks, with a clear goal.", example: "The Nova Notes team planned a sprint around the new folders.", cue: "Two weeks of focused work", confusion: "Iteration", icon: "fast-forward",
          moments: ["The team picks what fits in the next two weeks and starts.", "Two weeks, one goal: folders. Nothing else gets added until then.", "Monday they set the goal. Two weeks later they show what shipped."],
        },
      ],
      sort: {
        label: "Users or team",
        prompt: "Does each one come from users, or from how the team works?",
        buckets: ["Comes from users", "How the team works"],
        items: [
          { text: "A chart of taps per button", bucket: "Comes from users", term: "Analytics" },
          { text: "A list of ideas waiting their turn", bucket: "How the team works", term: "Backlog" },
          { text: "A thank you email with one ask", bucket: "Comes from users", term: "Feedback" },
          { text: "Two weeks with one clear goal", bucket: "How the team works", term: "Sprint" },
          { text: "Counting saves per day", bucket: "Comes from users", term: "Analytics" },
          { text: "Ship, learn, ship again", bucket: "How the team works", term: "Iteration" },
        ],
        feedbackCorrect: "Charts and messages come from users. The rest is how the team works.",
        feedbackWrong: "Ask: did users give us this, or is it how the team works?",
      },
      selectAll: {
        term: "Backlog",
        prompt: "Select everything that belongs on the Nova Notes backlog.",
        options: ["Add folders", "Fix the photo button", "Yesterday's lunch order", "Make dark mode darker"],
        correct: [0, 1, 3],
        feedbackCorrect: "Folders and both fixes are work still to do. Lunch is not.",
        feedbackWrong: "The backlog is work still to do. Yesterday's lunch does not belong.",
      },
      cases: [
        {
          terms: ["Analytics", "Feedback", "Backlog"],
          scene: "The team wants to know what to build next for Nova Notes.",
          steps: [
            { prompt: "They want to know which buttons students actually tap. Where do they look?", options: ["The usage numbers", "One student's email", "The team calendar", "The app icon"], correctIndex: 0 },
            { prompt: "A teacher writes in asking for bigger text. What is that?", options: ["A user's opinion", "A number from a chart"], correctIndex: 0 },
            { prompt: "Both point to the same thing: folders are hard to find. What now?", options: ["Add it to the list of work", "Ignore it"], correctIndex: 0 },
          ],
          feedbackCorrect: "Analytics show what students do. Feedback shows what they want.",
          feedbackWrong: "Charts show what students do. Messages say what they want.",
        },
        {
          terms: ["Sprint", "Iteration"],
          scene: "Folders are next. The team plans the next two weeks.",
          steps: [
            { prompt: "They set one goal for two weeks: ship folders. What is that stretch of work?", options: ["Sprint", "Iteration"], correctIndex: 0 },
            { prompt: "Folders ship, students react, the team fixes them and ships again. What is that?", options: ["Sprint", "Iteration"], correctIndex: 1 },
          ],
          feedbackCorrect: "A sprint is two weeks with one goal. An iteration is ship, learn, improve.",
          feedbackWrong: "Two weeks, one goal is a sprint. Ship, learn, ship again is an iteration.",
        },
      ],
      powerPlay: {
        intro: "Learn from real Nova Notes users.",
        paragraph: "Thousands of students open Nova Notes each day. The {1} show most never find folders. A teacher sends {2} saying the same thing. So folders move to the top of the {4}. The team plans one {5} around it: two weeks, one goal. Folders ship, students react, and the next {3} makes them better.",
      },
      facts: ["Most apps change a little every week, not a lot once a year."],
    },
    {
      number: 6,
      title: "Keeping It Safe",
      tier: "Advanced",
      goal: "Keep every note safe.",
      unlocks: "$1M",
      milestone: "Keep every note safe",
      nextMilestone: "Keep growing",
      companyValue: 1000000,
      nextCompanyValue: 1000000,
      intro: { headline: "Someone Tried to Break In", line: "A strange login from far away shows up in the logs.", hook: "Learn the words that keep users and their notes safe." },
      terms: [
        {
          term: "Password", definition: "A secret word or phrase that proves you are you.", example: "Nova Notes asks for a password before it opens your notes.", cue: "The secret that proves it is you", confusion: "Encryption", icon: "tag",
          moments: ["The screen asks for the secret phrase before showing anything.", "Jo types her secret word wrong and the notes stay locked.", "A student picks a long secret phrase nobody could guess."],
        },
        {
          term: "Encryption", definition: "Scrambling data so only someone with the key can read it.", example: "Nova Notes uses encryption so stolen files look like nonsense.", cue: "Scrambled so only the key reads it", confusion: "Password", icon: "layers",
          moments: ["Someone steals the file but sees only random letters.", "Every note is scrambled before it leaves the phone.", "Without the key, a stolen note looks like pure nonsense."],
        },
        {
          term: "Permission", definition: "What a program is allowed to see or do on your device.", example: "Nova Notes asks for permission before it uses the camera.", cue: "What the app is allowed to do", confusion: "Password", icon: "clipboard-check",
          moments: ["A pop up asks: may this app use your camera?", "The app wants to see your photos. You can say no.", "Nova Notes may use the microphone only because Jo said yes."],
        },
        {
          term: "Backup", definition: "A saved copy of your data kept somewhere safe.", example: "Nova Notes makes a backup of every note each night.", cue: "A safe extra copy", confusion: "Update", icon: "server",
          moments: ["The phone is lost, but every note is still there tomorrow.", "Each night a copy of every note is saved somewhere safe.", "Sam drops his phone in a lake. His notes survive."],
        },
        {
          term: "Update", definition: "A new version of a program that fixes or improves it.", example: "A Nova Notes update fixed the crash and added folders.", cue: "A new version that fixes things", confusion: "Backup", icon: "arrow-up",
          moments: ["A notice says: a new version is ready, tap to install.", "After the install, the photo bug is gone and folders appear.", "The store shows a new build with fixes. Tap to get it."],
        },
      ],
      sort: {
        label: "Block, ask or restore",
        prompt: "Does each one stop a break in, ask first, or fix and restore?",
        buckets: ["Stops a break in", "Asks the user first", "Fixes or restores"],
        items: [
          { text: "A long secret phrase", bucket: "Stops a break in", term: "Password" },
          { text: "May this app use your photos?", bucket: "Asks the user first", term: "Permission" },
          { text: "A copy of every note, kept safe", bucket: "Fixes or restores", term: "Backup" },
          { text: "Notes scrambled before they leave", bucket: "Stops a break in", term: "Encryption" },
          { text: "A new build that fixes the crash", bucket: "Fixes or restores", term: "Update" },
          { text: "Yes or no to the microphone", bucket: "Asks the user first", term: "Permission" },
        ],
        feedbackCorrect: "Secrets and scrambling stop a break in. Copies and new builds put things right.",
        feedbackWrong: "Ask: does it block a stranger, ask you first, or fix things?",
      },
      selectAll: {
        term: "Backup",
        prompt: "Select every case where a saved copy saves the day.",
        options: ["Phone lost, notes back by morning", "Laptop dies, notes still online", "Jo forgets her secret phrase", "The app asks to use the camera"],
        correct: [0, 1],
        feedbackCorrect: "A saved copy fixes a lost phone or a dead laptop. The other two it cannot.",
        feedbackWrong: "A saved copy brings lost notes back. It cannot fix a forgotten secret.",
      },
      cases: [
        {
          terms: ["Password", "Encryption"],
          scene: "Someone far away tries to get into a student's notes tonight.",
          steps: [
            { prompt: "What stops the stranger at the door?", options: ["The student's secret phrase", "The app icon", "A faster download", "Dark mode"], correctIndex: 0 },
            { prompt: "The stranger grabs the note file anyway. What makes it useless?", options: ["The notes are scrambled", "The notes are in English"], correctIndex: 0 },
            { prompt: "What should the team tell every student to do tonight?", options: ["Pick a longer secret phrase", "Delete the app"], correctIndex: 0 },
          ],
          feedbackCorrect: "A strong password keeps them out. Encryption makes stolen files useless.",
          feedbackWrong: "The password blocks the login. Encryption means a stolen file is just nonsense.",
        },
        {
          terms: ["Backup", "Update"],
          scene: "A new build is ready, and Sam just lost his phone.",
          steps: [
            { prompt: "Sam gets a new phone. How do his notes come back?", options: ["From the copy saved each night", "They are gone for good"], correctIndex: 0 },
            { prompt: "A notice says a new build is ready. What does it bring?", options: ["Fixes and new things", "A bigger bill", "A new phone", "More ads"], correctIndex: 0 },
          ],
          feedbackCorrect: "The backup brings the notes back. The update brings the fixes.",
          feedbackWrong: "A backup restores lost notes. An update fixes and improves the app.",
        },
      ],
      powerPlay: {
        intro: "Keep every Nova Notes note safe.",
        paragraph: "Late one night, a strange login shows up in the Nova Notes logs. The stranger never gets past the {1}. Even the file they grab is useless, thanks to {2}. By morning, an {5} makes every secret phrase longer. Every note still gets a {4} each night. And the app asks for {3} before it looks at a photo.",
      },
      facts: ["Most hacks start with a weak or reused password, not a clever trick."],
    },
  ],
};
