// DEMO-ONLY: AMT Level 1, v2 LAB (5 Oct 2026), reached from the Quick links
// menu ("AMT sim v2 LAB") at /play/aviation-maintenance-technician?v=2, with
// its own save slot. The live Level 1 (amt-level-1.ts) follows the script
// screen for screen; this v2 keeps the team's more detailed take (Chandu:
// "Follow Jos's script for AMT and put our more detailed task stuff with
// the wrench game in the hamburger menu as v2"):
// - screens 3 + 4 in Chandu's order: Check your drawer > "You cannot find one
//   of your tools." > Which tool is missing? > What do you do?
// - screen 18's task card naming the tool, and the hands-on torque wrench
//   (set, pull, stop at the click) in place of the step list.
// Flagged for Usman: remove the lab or promote it, never both live.

import type { Level } from "./types";

// Aviation Maintenance Technician, Level 1: Your First Year. Source: "AMT
// Simulation" (Downloads PDF, 40 screens), 5 Oct 2026. One recurring mentor,
// Maya ("This gives us one recurring mentor instead of introducing too many
// characters"), and one recurring question: "Is this aircraft actually ready
// to fly?" The firm, Kestrel Aero Maintenance, is invented (the script names
// none; Chandu: "use a good firm name").
//
// Built on the v2 engine as Level 1 of the career: directed, cinematic,
// career-world colours, How to Play before it. Every decision the script
// gives a Reputation value to carries that value (Beat.points: +8, +10, +8,
// +12, +15). Screens the script gives an answer to but no Reputation (9, 23,
// 33) and the interactions with no stated answer weight are practice: they
// score nothing.
//
// Each screen's own label in the script (YOUR FIRST RULE, MAKE THE CALL,
// BUILD YOUR TROUBLESHOOTING PLAN...) is its heading on screen, its bold
// line the instruction under it, the way both v2 scripts are built. A
// practice screen the script follows with no STRONG MOVE! screen moves
// straight on (noVerdict), and only screens 5, 12, 17 and 28 list skills.
//
// AUTHORED, not in the script (flagged in the handoff): the wrong-answer
// "why" lines, the inspection hotspot labels, the
// screen 3 tool choices, the tool and the steps of screen 18, the
// distractor message pieces on screen 35, the gauge proportions on screen 11
// (it is drawn within limits, the script does not say), the retry and
// terminated endings, and the career ladder above Lead Technician.

const ART = "/images/play/amt";
const GEAR = `${ART}/locations/kestrel-landing-gear.webp`;
// The tool-drawer photo (screens 3 and 4): first person, your gloved hands
// holding the drawer, one wrench-shaped foam slot empty. The camera fits the
// drawer into the space between the HUD and the dialogue box and holds the
// shot from screen 3 into screen 4.
// Maya is the one standing by the drawer (regenerated 5 Oct 2026 so the
// woman beside you is your lead, not a stranger).
const DRAWER = `${ART}/amt-drawer-maya.webp`;
const DRAWER_FRAME = { ratio: 1448 / 1086, focus: { x0: 0.2, y0: 0.6, x1: 0.8, y1: 0.86, maxScale: 1.8 } };
const DRAWER_SLOT = { x: 0.4475, y: 0.729, rx: 0.032, ry: 0.09 };

export const AMT_LEVEL_1_V2: Level = {
  id: "amt-l1-v2",
  n: 1,
  role: "First-Year Technician",
  title: "Your First Year",
  blurb: "Kestrel Aero Maintenance. Every aircraft that leaves the hangar has to be ready to fly. Learn how the job actually works.",
  cover: `${ART}/locations/kestrel-hangar-floor.webp`,
  mood: "day",
  cast: { Maya: `${ART}/face-maya.webp` },
  hideBand: true,
  directed: true,
  cinematic: true,
  worldTheme: true,
  points: 8,
  saveSlot: 402,
  // DEMO-ONLY: skip-screen + Start over in the HUD. Flagged for Usman:
  // remove for production (see docs/HANDOFF_INDEX.md).
  qaSkip: true,
  noStrikes: true,
  noRepair: true,
  plainEndings: true,
  sectionAfter: { beatId: "AMT-SECOND", label: "Later in Year 1" },
  preGame: {
    // Not "Start Career": that is the doc's screen 1 button, which follows.
    startLabel: "Play",
    skipLabel: "Skip to the hangar",
    // Not "Your first year starts now.": that is screen 1's own title, next.
    handoffLine: "Kestrel Aero Maintenance",
    howToCta: "Start your first day",
    tiers: [{ label: "First year complete" }, { label: "Not yet" }, { label: "Terminated" }],
    ladder: ["First-Year Technician", "Technician", "Lead Technician", "Inspector", "Maintenance Manager"],
    skills: ["Attention to Detail", "Troubleshooting", "Communication"],
    skillTotal: 15,
  },
  beats: [
    {
      // Screen 1.
      kind: "card",
      variant: "intro",
      id: "AMT-01",
      speaker: "Narrator",
      celebrate: true,
      setup: "First day",
      title: "Your first year starts now.",
      body: "You are joining an aircraft maintenance team responsible for keeping aircraft safe and ready to fly.",
      cta: "Start Career",
    },
    {
      // Screen 2: "MEET YOUR LEAD / MAYA | LEAD TECHNICIAN".
      kind: "card",
      variant: "character",
      id: "AMT-02",
      speaker: "Maya",
      castMember: "Maya",
      introduce: { name: "Maya", role: "Lead Technician" },
      setup: "Meet your lead",
      title: "“You’ll work with me while you learn the aircraft, procedures, and how we operate.”",
      cta: "Continue",
    },
    {
      // Screen 3 opens on Maya's line over your open drawer, the whole shot
      // first; the next beat pushes in on it (Chandu: "open with the image
      // zoomed out first, and zoom in on the next").
      kind: "card",
      variant: "character",
      id: "AMT-03",
      speaker: "Maya",
      art: DRAWER,
      artAlt: "You hold your tool drawer open at the workbench. Maya stands beside it, a hand at her chin; a technician points into the drawer.",
      artFrame: { ratio: DRAWER_FRAME.ratio },
      setup: "Your first rule",
      title: "“Before we start, account for your tools.”",
      cta: "Check your drawer",
    },
    {
      // Screen 3: "Find the missing tool. Several tools are shown. One is
      // missing from the technician's tool set." The camera pushes in on
      // your drawer, the empty slot's outline pulses, and you name the tool
      // from the ones shown (Chandu: "outline the empty tool slot, have it
      // pulse and then show the options to select which tool is missing").
      kind: "choice",
      layout: "options",
      id: "AMT-03b",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      art: DRAWER,
      artAlt: "Your gloved hands hold the tool drawer open: wrenches, a ratchet, sockets and screwdrivers in their foam slots, and one wrench-shaped slot empty.",
      artFrame: { ...DRAWER_FRAME, highlight: DRAWER_SLOT },
      keepScene: true,
      // The order (Chandu): Check your drawer > "You cannot find one of
      // your tools." > Which tool is missing? > What do you do? The doc's
      // screen 4 line plays here, alone, as the camera lands on the drawer.
      setup: "You cannot find one of your tools.",
      // The doc's "Interaction: Find the missing tool." names the mechanic
      // (as "Interaction: Visual inspection" does on screen 7), it is not
      // the line on screen. Asked as "find", it contradicted screen 4's "You
      // cannot find one of your tools" (Chandu: "thats not logical right?").
      // Here you notice WHICH tool is gone; on screen 4 you can't locate it.
      question: "Which tool is missing?",
      choices: [
        { id: "a", label: "Wrench", tier: "best", why: "" },
        { id: "b", label: "Ratchet", tier: "wrong", why: "" },
        { id: "c", label: "Socket", tier: "wrong", why: "" },
        { id: "d", label: "Screwdriver", tier: "wrong", why: "" },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screens 4 + 5.
      kind: "choice",
      layout: "options",
      id: "AMT-04",
      points: 8,
      speaker: "Narrator",
      reactor: "Maya",
      // Still the drawer, the empty slot ringed, framed above the box:
      // keepScene only darkens it behind the question.
      art: DRAWER,
      artAlt: "Your gloved hands hold the tool drawer open, one slot empty. A technician points at it while Maya thinks it through.",
      artFrame: { ...DRAWER_FRAME, highlight: DRAWER_SLOT },
      // "Strong move!" cuts back to the hangar floor so Maya can be seen
      // reacting, instead of the verdict sitting on the drawer close-up
      // (Chandu: "can have a sprite instead of staying on that drawer").
      verdictInRoom: true,
      castMember: "Maya",
      // Its "You cannot find one of your tools." already played on the
      // screen before, so the question stands alone here.
      keepScene: true,
      question: "What do you do?",
      choices: [
        { id: "a", label: "Keep working and look later", tier: "wrong", why: "A tool left behind can end up inside the aircraft. Looking later is too late." },
        { id: "b", label: "Stop and locate the missing tool", tier: "best", why: "A missing tool can become a serious aircraft safety problem." },
        { id: "c", label: "Borrow another one", tier: "wrong", why: "That fixes your toolbox, not the problem. The missing one is still somewhere." },
        { id: "d", label: "Tell the next shift", tier: "wrong", why: "The aircraft may fly before they look. It is your tool to find now." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Attention to Detail", "Safety Awareness"],
    },
    {
      // Screen 6.
      kind: "card",
      variant: "chapter",
      id: "AMT-06",
      // A few weeks later: back on the hangar floor, not in the drawer photo.
      resetScene: true,
      speaker: "Narrator",
      setup: "A few weeks later",
      title: "Your first inspection.",
      body: "An aircraft has arrived between flights.\nMaya asks you to help inspect it before its next departure.",
      cta: "Continue",
    },
    {
      // Screen 7: "Visual inspection. Tap anything that deserves a closer
      // look. Student scans tires, exterior surfaces, panels, and
      // surrounding areas."
      kind: "inspect",
      id: "AMT-07",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "Check the aircraft.",
      prompt: "Tap anything that deserves a closer look.",
      image: GEAR,
      imageAlt: "The main landing gear: two tires, the strut, the open wheel well and a tool cart.",
      hotspots: [
        { id: "tire-l", x: 0.26, y: 0.72, r: 0.12, label: "Left tire", note: "Noticeable wear", issue: true },
        { id: "tire-r", x: 0.46, y: 0.72, r: 0.12, label: "Right tire", note: "Looks normal" },
        { id: "strut", x: 0.33, y: 0.38, r: 0.09, label: "Strut", note: "Looks normal" },
        { id: "well", x: 0.62, y: 0.33, r: 0.1, label: "Wheel well panel", note: "Looks normal" },
        { id: "skin", x: 0.12, y: 0.3, r: 0.1, label: "Exterior surface", note: "Looks normal" },
        { id: "cart", x: 0.88, y: 0.7, r: 0.1, label: "Tool cart", note: "Clear of the aircraft" },
      ],
      whenRight: "You found it. One tire shows noticeable wear.",
      whenWrong: "Look again at the tires.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 8.
      kind: "card",
      variant: "intro",
      id: "AMT-08",
      speaker: "Narrator",
      title: "You spot something.",
      body: "One tire shows noticeable wear.\nBut noticing something unusual does not automatically tell you whether it is acceptable.",
      cta: "Continue",
    },
    {
      // Screen 9. The script marks the answer but gives no Reputation and no
      // verdict screen: practice that moves straight on (the "why" lines are
      // kept for a future explained mode; they don't render).
      kind: "choice",
      layout: "options",
      id: "AMT-09",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "What’s your next move?",
      choices: [
        { id: "a", label: "Decide based on how it looks", tier: "wrong", why: "Wear can look worse or better than it is. Looks are not a standard." },
        { id: "b", label: "Compare the condition with the maintenance criteria", tier: "best", why: "The maintenance criteria say what is acceptable. That is what you check against." },
        { id: "c", label: "Ask the pilot if they’re comfortable", tier: "wrong", why: "The pilot flies it. Whether it is airworthy is maintenance’s call." },
        { id: "d", label: "Ignore it because the tire isn’t flat", tier: "wrong", why: "Not flat is not the same as within limits." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 10: "CAREER TOOL UNLOCKED / AIRCRAFT MAINTENANCE MANUAL".
      kind: "card",
      variant: "intro",
      id: "AMT-10",
      speaker: "System",
      celebrate: true,
      setup: "Career tool unlocked",
      title: "Aircraft Maintenance Manual",
      body: "Technicians use approved maintenance information to determine how work should be performed.",
      cta: "Open the Manual",
    },
    {
      // Screens 11 + 12: "Measured condition vs. Acceptable maintenance
      // limit. Is the tire within limits? WITHIN LIMITS / OUT OF LIMITS".
      kind: "choice",
      layout: "options",
      id: "AMT-11",
      points: 10,
      speaker: "Narrator",
      reactor: "Maya",
      castMember: "Maya",
      question: "Make the call.",
      prompt: "Is the tire within limits?",
      gauge: { measuredLabel: "Measured condition", limitLabel: "Acceptable maintenance limit", measured: 0.62, limit: 0.8 },
      choices: [
        { id: "a", label: "Within limits", tier: "best", why: "You used the maintenance criteria instead of guessing." },
        { id: "b", label: "Out of limits", tier: "wrong", why: "The measured condition stops short of the limit line. It looks worn, but it is within limits." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Quality Control", "Attention to Detail"],
    },
    {
      // Screen 13.
      kind: "card",
      variant: "chapter",
      id: "AMT-13",
      speaker: "Maya",
      castMember: "Maya",
      art: `${ART}/amt-fluid-leak.webp`,
      artAlt: "Two technicians crouch by the landing gear; fluid drips onto the floor under your flashlight.",
      setup: "Month 2",
      title: "There’s fluid under the aircraft.",
      body: "Departure is approaching.\nMaya asks: “What do you think?”",
      cta: "Continue",
    },
    {
      // Screen 14: "Interaction: Put in order".
      kind: "rank",
      id: "AMT-14",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "Don’t jump to conclusions.",
      prompt: "What should happen first?",
      order: ["Inspect the area", "Identify the source", "Use the maintenance procedure", "Determine the required action"],
      whenRight: "Look first, find the source, then let the procedure decide what happens next.",
      whenWrong: "Inspect the area, then identify the source. Only then does the procedure tell you the required action.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 15.
      kind: "card",
      variant: "intro",
      id: "AMT-15",
      // The clock: back on the hangar floor, out of the leak photo.
      resetScene: true,
      speaker: "Narrator",
      setup: "The clock is moving",
      title: "28 minutes until departure.",
      body: "Operations asks: “Can we start boarding?”",
      cta: "Respond",
    },
    {
      // Screens 16 + 17.
      kind: "choice",
      layout: "chat",
      id: "AMT-16",
      points: 8,
      speaker: "Narrator",
      chatWith: { name: "Operations", role: "Flight operations", message: "Can we start boarding?" },
      question: "Respond to Operations.",
      prompt: "Choose your response.",
      choices: [
        { id: "a", label: "“We’re still inspecting the issue. We’ll update you when we know the aircraft’s status.”", tier: "best", why: "You communicated clearly without promising an outcome you did not know yet." },
        { id: "b", label: "“Yeah, it should be fine.”", tier: "wrong", why: "You do not know that yet. If it is not fine, people board an aircraft you promised." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Communication", "Professional Judgment"],
    },
    {
      // Screen 18.
      kind: "card",
      variant: "chapter",
      id: "AMT-18",
      speaker: "Narrator",
      // "Maya has identified the problem": Maya on the workshop plate, the
      // same sprite-over-room composite as the rest of the level.
      castMember: "Maya",
      setup: "Month 3",
      title: "Your first repair assist.",
      body: "Maya has identified the problem.\nNow you help complete the maintenance task.",
      cta: "Start the Task",
    },
    {
      // Screen 18: "Select the correct tool and follow the task sequence."
      // The script names neither the problem, the tool nor the steps
      // (authored, flagged). A first-year can't be expected to know which
      // tool a repair needs (Chandu: "a high schooler wont even know what a
      // torque wrench is"), so the task card names it: picking the tool is
      // following the maintenance information, the lesson of screens 10-12.
      kind: "choice",
      layout: "options",
      id: "AMT-18a",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "Pick the tool the task card lists.",
      taskCard: [
        { label: "Task", value: "Tighten the leaking fitting" },
        { label: "Tool", value: "Torque wrench" },
      ],
      choices: [
        { id: "a", label: "Torque wrench", tier: "best", why: "" },
        { id: "b", label: "Hammer", tier: "wrong", why: "" },
        { id: "c", label: "Pliers", tier: "wrong", why: "" },
        { id: "d", label: "Adjustable wrench", tier: "wrong", why: "" },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // LOCAL EXPERIMENT (amt-torque-lab): "follow the task sequence" done
      // with the tool itself: set the wrench to the manual's mark, pull
      // until it clicks, stop at the click (Chandu: "an interactive animated
      // torque wrench usage with the clicking"). Shows its own verdict, so a
      // miss (over-tightening) is explained.
      kind: "torque",
      id: "AMT-18b",
      practice: true,
      speaker: "Narrator",
      question: "Set it to the manual’s mark. Pull until it clicks.",
      target: 0.62,
      band: 0.05,
      whenRight: "Click, and you stopped. The fitting is exactly as tight as the manual says.",
      whenWrong: "You kept pulling after the click. Past the setting, a fitting can crack. Stop at the click.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 19: "Drag into order".
      kind: "rank",
      id: "AMT-19",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "Almost finished.",
      prompt: "The repair is complete. What’s left? Drag into order.",
      order: ["Complete required check", "Inspect work area", "Account for tools", "Document the work"],
      whenRight: "Checked, cleared, counted, written down. Now the job is finished.",
      whenWrong: "Complete the required check, inspect the work area, account for your tools, then document the work.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 20: the checkpoint.
      kind: "card",
      variant: "act",
      id: "AMT-20",
      speaker: "System",
      // The script's own label for the screen.
      title: "Checkpoint",
      body: "Your first few months are complete",
      example: "You’ve learned how to:\n✓ Inspect aircraft\n✓ Use maintenance information\n✓ Work safely\n✓ Communicate problems\n✓ Assist with maintenance\n✓ Document your work\nMaya: “Good start. Now I’m going to expect you to think through more of these problems yourself.”",
      note: "Checkpoint Saved",
      cta: "Continue Career",
      secondaryCta: "Finish Later",
      secondaryHref: "/play",
    },
    {
      // "SECOND HALF / Later in Your First Year".
      kind: "card",
      variant: "act",
      id: "AMT-SECOND",
      auto: true,
      speaker: "System",
      // The script: "SECOND HALF", then "Later in Your First Year".
      title: "Second half",
      body: "Later in Your First Year",
      cta: "Continue",
    },
    {
      // Screen 21.
      kind: "card",
      variant: "character",
      id: "AMT-21",
      speaker: "Maya",
      castMember: "Maya",
      // Arms crossed, a knowing smile: she's starting to trust you.
      castPose: "confident",
      setup: "Month 5",
      title: "You’re earning trust.",
      body: "“You know the basics. Let’s see how you troubleshoot.”",
      cta: "Continue",
    },
    {
      // Screen 22.
      kind: "card",
      variant: "intro",
      id: "AMT-22",
      speaker: "Narrator",
      title: "Another aircraft. Another problem.",
      body: "The flight crew reports an intermittent warning.\nIt appeared during the previous flight.\nNow the warning is gone.",
      cta: "Continue",
    },
    {
      // Screen 23. Marked answer, no Reputation: practice.
      kind: "choice",
      layout: "options",
      id: "AMT-23",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "What would you check first?",
      prompt: "Choose where to begin:",
      choices: [
        { id: "a", label: "Replace a component immediately", tier: "wrong", why: "Swapping parts before you know the cause is guessing with a wrench." },
        { id: "b", label: "Review the discrepancy and maintenance history", tier: "best", why: "The report and the history tell you where the problem has been before." },
        { id: "c", label: "Ignore it because the warning disappeared", tier: "wrong", why: "Gone is not fixed. It appeared once, so it can appear again." },
        { id: "d", label: "Run the aircraft until it happens again", tier: "wrong", why: "Waiting for a fault to repeat in flight is the one thing you cannot do." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 24.
      kind: "card",
      variant: "intro",
      id: "AMT-24",
      speaker: "Narrator",
      title: "Something looks familiar.",
      body: "The maintenance history shows:\nA similar warning occurred two weeks ago.\nNow the problem is more interesting.",
      cta: "Continue",
    },
    {
      // Screen 25.
      kind: "rank",
      id: "AMT-25",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "Build your troubleshooting plan.",
      prompt: "Put the steps in the best order.",
      order: ["Review information", "Inspect", "Test", "Evaluate results", "Determine next action"],
      whenRight: "Information first, then inspect and test, then judge what the results mean.",
      whenWrong: "Review the information, inspect, test, evaluate the results, then determine the next action.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 26.
      kind: "card",
      variant: "intro",
      id: "AMT-26",
      speaker: "Narrator",
      title: "The test passes.",
      body: "The warning doesn’t appear.\nEverything looks normal.\nSo... is the aircraft fixed?",
      cta: "Make the Call",
    },
    {
      // Screens 27 + 28: "Timed Decision".
      kind: "choice",
      layout: "options",
      id: "AMT-27",
      points: 12,
      pivotal: true,
      timer: 20,
      speaker: "Narrator",
      reactor: "Maya",
      castMember: "Maya",
      question: "Your call.",
      choices: [
        { id: "a", label: "Release it immediately", tier: "wrong", why: "The test passing does not mean the cause is gone. It was intermittent last time too." },
        { id: "b", label: "Continue following the troubleshooting procedure", tier: "best", why: "Intermittent problems can disappear during testing.\nYou followed the evidence instead of assuming the problem was gone." },
        { id: "c", label: "Clear the previous discrepancy", tier: "wrong", why: "Clearing it erases the trail. The warning came back once already." },
        { id: "d", label: "Ask Operations", tier: "wrong", why: "Operations decides schedules, not whether the aircraft is fixed." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Troubleshooting", "Critical Thinking"],
    },
    {
      // Screen 29: "This should feel rewarding."
      kind: "card",
      variant: "intro",
      id: "AMT-29",
      speaker: "Narrator",
      celebrate: true,
      title: "You find the clue.",
      body: "Further inspection identifies a problem in the affected area.\nYou didn’t find it because you were lucky.\nYou found it because you kept troubleshooting.",
      cta: "Continue",
    },
    {
      // Screen 30.
      kind: "card",
      variant: "chapter",
      id: "AMT-30",
      speaker: "Narrator",
      setup: "Month 7",
      title: "Now you’re working faster.",
      body: "An aircraft arrives with limited time before its next scheduled departure.\nYou are asked to perform an inspection you’ve done before.",
      cta: "Start Inspection",
    },
    {
      // Screen 31: "Timed interaction. Several inspection points appear
      // rapidly. Student has to identify the areas requiring attention. The
      // challenge is completing the inspection efficiently without
      // skipping anything."
      kind: "inspect",
      id: "AMT-31",
      practice: true,
      noVerdict: true,
      timer: 25,
      // "Several inspection points appear rapidly."
      rapid: true,
      speaker: "Narrator",
      question: "Speed vs. accuracy.",
      prompt: "Tap the areas that need attention.",
      image: GEAR,
      imageAlt: "The main landing gear again, against the clock.",
      hotspots: [
        { id: "skin", x: 0.12, y: 0.3, r: 0.1, label: "Exterior surface", note: "Looks normal" },
        { id: "tire-l", x: 0.26, y: 0.72, r: 0.12, label: "Left tire", note: "Check the wear", issue: true },
        { id: "cart", x: 0.88, y: 0.7, r: 0.1, label: "Tool cart", note: "Clear of the aircraft" },
        { id: "strut", x: 0.33, y: 0.38, r: 0.09, label: "Strut", note: "Wet streak: check for a leak", issue: true },
        { id: "tire-r", x: 0.46, y: 0.72, r: 0.12, label: "Right tire", note: "Looks normal" },
        { id: "well", x: 0.62, y: 0.33, r: 0.1, label: "Wheel well panel", note: "Fastener loose", issue: true },
      ],
      whenRight: "Fast and complete. You found every point without skipping one.",
      whenWrong: "Something was still unchecked when time ran out. Speed only counts if nothing is skipped.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 32.
      kind: "card",
      variant: "intro",
      id: "AMT-32",
      speaker: "Narrator",
      title: "You notice something small.",
      body: "One component does not look right.\nNo warning light.\nNo dramatic failure.\nJust something you noticed.",
      cta: "Continue",
    },
    {
      // Screen 33. Marked answer, no Reputation: practice.
      kind: "choice",
      layout: "options",
      id: "AMT-33",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "What do you do?",
      choices: [
        { id: "a", label: "Keep moving because departure is close", tier: "wrong", why: "A close departure is the reason to look now, not later." },
        { id: "b", label: "Stop and investigate the abnormal condition", tier: "best", why: "Small and quiet is still abnormal. You stop and find out what it is." },
        { id: "c", label: "Wait for someone else to notice", tier: "wrong", why: "You noticed. Waiting means it might fly unnoticed." },
        { id: "d", label: "Tell the pilot to monitor it", tier: "wrong", why: "Watching it in the air is not the same as checking it on the ground." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 34.
      kind: "card",
      variant: "character",
      id: "AMT-34",
      speaker: "Narrator",
      castMember: "Maya",
      title: "The flight will be late.",
      body: "Operations: “How much longer?”\nMaya looks at you.\nThis time you need to explain what is happening.",
      cta: "Message Operations",
    },
    {
      // Screen 35: "Interaction: Build the response. Student selects the
      // strongest pieces."
      kind: "pick",
      id: "AMT-35",
      practice: true,
      noVerdict: true,
      speaker: "Narrator",
      question: "Message Operations.",
      prompt: "Build the response from the strongest pieces.",
      pick: 3,
      cards: [
        { label: "We identified an issue.", role: "pick" },
        { label: "Maintenance is still evaluating it.", role: "pick" },
        { label: "We cannot confirm a release time yet.", role: "pick" },
        { label: "It’s basically fixed.", role: "harmful" },
        { label: "Should be about five minutes.", role: "harmful" },
        { label: "Ask the pilot what they want to do.", role: "leave" },
      ],
      whenRight: "What you found, where it stands, and no promise you cannot keep.",
      whenWrong: "Say what you found, that it is still being evaluated, and that you cannot confirm a time yet.",
      whenHarmful: "That promises something you do not know yet.",
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 36.
      kind: "card",
      variant: "chapter",
      id: "AMT-36",
      speaker: "Narrator",
      art: `${ART}/amt-fluid-leak.webp`,
      artAlt: "Fresh fluid near the maintenance area under the landing gear.",
      setup: "Month 10",
      title: "Your biggest test yet.",
      body: "An aircraft was recently serviced.\nBefore departure, you notice fresh fluid near the maintenance area.\nThe system check currently looks normal.",
      cta: "Continue",
    },
    {
      // Screens 37 + 38: "DEPARTURE IN 9 MINUTES".
      kind: "choice",
      layout: "options",
      id: "AMT-37",
      points: 15,
      pivotal: true,
      speaker: "Narrator",
      reactor: "Maya",
      castMember: "Maya",
      inlineSetup: true,
      setup: "Departure in 9 minutes.\nOperations wants the aircraft.\nThe test passed.\nThe passengers are waiting.\nBut the fluid is new.",
      question: "What do you do?",
      bestHeadline: "Good catch.",
      choices: [
        { id: "a", label: "Clean it and release the aircraft", tier: "wrong", why: "Cleaning it hides the evidence. New fluid means something changed." },
        { id: "b", label: "Assume it is leftover fluid", tier: "wrong", why: "It is new, so it is not leftover. Assuming is how a leak gets released." },
        { id: "c", label: "Stop the release and have the area reinspected", tier: "best", why: "The team reinspects the area.\nThe problem was not completely resolved.\nYour decision prevented the aircraft from being released before the issue was properly addressed." },
        { id: "d", label: "Ask the pilot to make the decision", tier: "wrong", why: "Releasing the aircraft is maintenance’s responsibility, not the pilot’s." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: [],
    },
    {
      // Screen 39: "Then reveal the student's Reputation Score."
      kind: "review",
      id: "AMT-39",
      // The review sits in the hangar, not in the leak photo.
      resetScene: true,
      // No setup line: the review card carries its own FINAL REVIEW label.
      speaker: "System",
      title: "Your first year",
      body: "Over the year, you demonstrated:\nInspection ✓\nTroubleshooting ✓\nAttention to Detail ✓\nTime Management ✓\nCommunication ✓\nSafety Judgment ✓\nEquipment Maintenance ✓",
    },
  ],
  // Screen 40, and the two outcomes the script does not write (authored).
  endings: [
    {
      min: 85,
      kicker: "Level 1 complete",
      headline: "First year complete",
      message: "Maya: “A year ago, I had to tell you what to look for. Now you’re starting to recognize problems and think through what comes next.”",
      subline: "",
      unlock: "Unlocked\nLevel 2: Greater Responsibility",
      // Screen 40 shows no score: screen 39 revealed it.
      hideReputation: true,
      primary: "Continue Career",
      advances: true,
    },
    {
      min: 40,
      headline: "Not yet.",
      message: "You learned a lot this year, but Kestrel needs to see more consistent calls before you take on more responsibility.",
      subline: "",
      primary: "Start Over",
      advances: false,
    },
    {
      min: 0,
      headline: "Terminated",
      message: "Kestrel Aero Maintenance is ending your position. Aircraft were put at risk by the calls you made.",
      subline: "You can replay the year and make different decisions.",
      primary: "Start Over",
      advances: false,
    },
  ],
};
