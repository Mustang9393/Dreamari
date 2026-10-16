// DEMO-ONLY content: the Software Engineering glossary, under the Tech &
// Engineering world (16 Oct 2026). Written to the "Dreamari Glossary Game
// Master Scaling Plan" SOP, world #10: a continuous story. One app, Nova
// Notes, goes from idea to release across the levels, so later words build
// on earlier ones (requirements, then code, then testing, then shipping).
// Four playable levels prove the full difficulty ladder: Level 1 recognizes,
// Level 2 applies, Level 3 tells confusable words apart, Level 4 decides.
// Eighth-grade copy, no dashes, no numbers (software words do not need
// them), every example names Nova Notes. Replace with the content team's
// sheet when it exists; the shape below is what the sheet must provide.

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
        { term: "App", definition: "A program people open on a phone or computer to do one job.", example: "Nova Notes is an app for saving quick notes.", cue: "A program on your phone", icon: "smartphone" },
        { term: "User", definition: "A person who opens and uses a program.", example: "Every student who writes in Nova Notes is a user.", cue: "The person using it", icon: "users" },
        { term: "Feature", definition: "One thing a program can do for the people using it.", example: "Dark mode is a feature of Nova Notes.", cue: "One thing it can do", icon: "sparkles" },
        { term: "Code", definition: "The written instructions that tell a computer what to do.", example: "The team writes code to make Nova Notes work.", cue: "Instructions for the computer", icon: "code" },
        { term: "Bug", definition: "A mistake in the instructions that makes a program act wrong.", example: "A bug made Nova Notes delete a note by mistake.", cue: "A mistake that breaks things", icon: "bug" },
      ],
      facts: [
        "Most apps start as one person's small idea and a single screen.",
        "The word bug for a computer mistake goes back to a real moth found inside an early computer.",
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
        { term: "Requirement", definition: "A clear statement of what a program must do.", example: "One requirement for Nova Notes is that notes save without Wi-Fi.", cue: "What it must do", situation: "The teacher says notes must save even without Wi-Fi.", icon: "list-checks" },
        { term: "Design", definition: "The plan for how a program will look and work.", example: "The Nova Notes design puts the new note button at the bottom.", cue: "The plan for look and flow", situation: "A sketch shows where every button on the screen goes.", icon: "pen-tool" },
        { term: "Prototype", definition: "An early rough version built to test an idea.", example: "The first Nova Notes prototype had one screen and no colors.", cue: "A rough early version", situation: "A quick one-screen version, just to see if the idea works.", icon: "layers" },
        { term: "Repository", definition: "The shared place where a team keeps all of its code.", example: "All Nova Notes code lives in one repository.", cue: "Where the code is kept", situation: "Every file the team has ever written, kept in one shared place.", icon: "folder-git" },
        { term: "Commit", definition: "Saving one set of changes to the shared code with a note about them.", example: "Each Nova Notes commit explains what changed and why.", cue: "One saved change with a note", situation: "Jo saves her change and writes a note: fixed the save button.", icon: "git-commit" },
      ],
      facts: ["Teams often write the requirements as short sentences that start with the words a user can."],
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
        { term: "Test", definition: "A check that one part of a program works the way it should.", example: "Nova Notes runs a test on the save button before every release.", cue: "A check that it works", situation: "Before shipping, the team runs checks on every button.", confusion: "Debug", icon: "flask-conical" },
        { term: "Debug", definition: "Finding the cause of a problem in the code and fixing it.", example: "The team spent a day on Nova Notes to debug the missing notes.", cue: "Find and fix the cause", situation: "Something is broken. Jo reads every line to find out why.", confusion: "Test", icon: "search" },
        { term: "Crash", definition: "When a program stops working and closes on its own.", example: "A crash closed Nova Notes every time a photo was added.", cue: "It stops and closes", situation: "You tap a photo and the whole screen goes black and closes.", confusion: "Edge Case", icon: "zap-off" },
        { term: "Edge Case", definition: "A rare or extreme situation a program must still handle.", example: "An empty note title is an edge case Nova Notes has to handle.", cue: "A rare, extreme situation", situation: "What happens if a note is ten thousand words long?", confusion: "Crash", icon: "corner-down-right" },
        { term: "Code Review", definition: "A teammate reads your changes and gives feedback before they go in.", example: "No Nova Notes change ships without a code review.", cue: "A teammate checks your changes", situation: "Sam reads Jo's change and leaves two comments before approving.", confusion: "Test", icon: "eye" },
      ],
      facts: ["Many teams will not let a change in until at least one other person has read it."],
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
        { term: "Deploy", definition: "Putting a new version of a program out where people can use it.", example: "The team will deploy Nova Notes on Friday morning.", cue: "Put it out for users", situation: "The new build passed every check. Time to put it out.", confusion: "Rollback", icon: "rocket" },
        { term: "Rollback", definition: "Going back to the last version that worked after a bad release.", example: "A rollback put Nova Notes back to the version that worked.", cue: "Go back to the last version", situation: "The new build deletes notes. Users need the old one back now.", confusion: "Deploy", icon: "undo" },
        { term: "Version", definition: "One numbered release of a program.", example: "Nova Notes version two added folders.", cue: "One numbered release", situation: "The update notes say: new in this release, folders.", confusion: "Deploy", icon: "tag" },
        { term: "Server", definition: "A computer that stores data and answers requests from many people.", example: "Every Nova Notes note is saved on a server.", cue: "The computer that stores data", situation: "Your notes appear on your laptop and your phone. Something stores them.", confusion: "Outage", icon: "server" },
        { term: "Outage", definition: "A time when a program or its computers stop working for everyone.", example: "An outage kept every Nova Notes user from saving for an hour.", cue: "Down for everyone", situation: "Nobody anywhere can open the app. Not just you. Everyone.", confusion: "Server", icon: "wifi-off" },
      ],
      facts: ["Big teams often release to a small group of users first, so a bad build reaches few people."],
    },
    { number: 5, title: "Growing It", tier: "Advanced", goal: "Learn from real users.", unlocks: "$500K", milestone: "Learn from real users", nextMilestone: "Keep every note safe", companyValue: 500000, nextCompanyValue: 1000000, words: ["Analytics", "Feedback", "Iteration", "Backlog", "Sprint"] },
    { number: 6, title: "Keeping It Safe", tier: "Advanced", goal: "Keep every note safe.", unlocks: "$1M", milestone: "Keep every note safe", nextMilestone: "Keep growing", companyValue: 1000000, nextCompanyValue: 1000000, words: ["Password", "Encryption", "Permission", "Backup", "Update"] },
  ],
};
