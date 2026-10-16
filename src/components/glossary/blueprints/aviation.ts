// DEMO-ONLY content: the Flight Operations glossary, under the Driving,
// Flying & Shipping world (16 Oct 2026). Written to the "Dreamari Glossary
// Game Master Scaling Plan" SOP, world #33: a scenario thread. The student
// flies for Skyline Air every level, but each level is a different flight
// or a different phase of one; nothing from one flight has to be remembered
// for the next. Six playable levels (recognize, apply, analyze, then three
// decide levels). Eighth-grade copy, no dashes, numbers spelled out (flight
// words do not need figures), every example names Skyline Air.
//
// Rewritten 17 Oct 2026 to the Finance style after Chandu's note: "the games
// are repeating the same questions again and again for mastery instead of
// having any variety, please refer the finance glossary games and redo
// questions according to its style." Every word now carries three moments
// (each shown on one screen only) instead of one situation; Level 3 sorts
// weather and routing into early, late or somewhere new, and Level 5 sorts
// the crew by where each job happens; Levels 2 to 6 each carry one or two
// short cases written as a pilot's real call; Levels 2, 3, 4, 5 and 6 carry
// an authored Select All; every Power Play is a written paragraph whose
// blanks do not run in teaching order. The Runway cue no longer says
// "takeoff", another word on the same match card.

import type { GlossaryBlueprint } from "../generate";

export const AVIATION_GLOSSARY: GlossaryBlueprint = {
  industry: { slug: "aviation", title: "Flight Terms", subject: "flight", world: "Driving, Flying & Shipping" },
  mode: "scenario_thread",
  studentRole: "pilot",
  exampleCareerSlug: "airline-pilot",
  company: "Skyline Air",
  idPrefix: "AV",
  chapters: [
    { number: 1, name: "First Flight", tier: "Beginner" },
    { number: 2, name: "Cross Country", tier: "Intermediate" },
    { number: 3, name: "The Left Seat", tier: "Advanced" },
  ],
  levels: [
    {
      number: 1,
      title: "Before Takeoff",
      tier: "Beginner",
      goal: "Get the plane off the ground.",
      milestone: "First takeoff",
      nextMilestone: "Fly the long middle",
      companyValue: 10000,
      nextCompanyValue: 50000,
      terms: [
        {
          term: "Cockpit", definition: "The front part of a plane where the pilots sit and fly it.", example: "A Skyline Air pilot checks every switch in the cockpit before a flight.", cue: "Where the pilots sit", icon: "gauge",
          moments: ["Two pilots sit up front facing a wall of switches and screens.", "The door at the front of the cabin closes behind the crew.", "From the front seats the crew can see the whole airport."],
        },
        {
          term: "Runway", definition: "The long strip a plane speeds down to leave the ground or land.", example: "The Skyline Air jet lined up on the runway and waited for the go.", cue: "The long strip planes speed down", icon: "route",
          moments: ["The jet lines up at the start of a long paved strip.", "Lights in two bright rows mark the strip where planes land.", "A plane lands on the long strip while another waits its turn."],
        },
        {
          term: "Preflight", definition: "The full check of a plane and its plan before it moves.", example: "Every Skyline Air flight starts with a preflight.", cue: "The full check before moving", icon: "clipboard-check",
          moments: ["The pilot walks around the plane, checking tires, wings and lights.", "Before the engines start, every switch and gauge gets a look.", "The crew reads the plan and the weather before anyone boards."],
        },
        {
          term: "Taxi", definition: "Driving a plane slowly on the ground between the gate and the strip.", example: "After pushback the Skyline Air jet began to taxi.", cue: "Driving slowly on the ground", icon: "move",
          moments: ["The jet rolls slowly along the painted yellow line toward the strip.", "Engines hum as the plane creeps past the gates at walking speed.", "After landing, the plane rolls slowly back to its gate."],
        },
        {
          term: "Takeoff", definition: "The moment a plane speeds up and lifts off the ground.", example: "Skyline Air passengers felt the push of takeoff.", cue: "Lifting off the ground", icon: "plane-takeoff",
          moments: ["Engines roar, you sink into your seat, and the ground drops away.", "The nose tips up and the wheels leave the ground.", "The jet races down the strip and climbs into the sky."],
        },
      ],
      powerPlay: {
        intro: "Get one Skyline Air jet into the sky.",
        paragraph: "First, the pilot does a {3} of the plane. Then the crew sits in the {1}. The jet starts to {4} along the yellow line. It lines up on the {2} and waits. Engines roar, and {5} lifts you up.",
      },
      facts: [
        "Pilots read a checklist out loud before every flight, even after years of flying.",
        "On the ground, a plane follows painted lines, like a car on a road.",
      ],
    },
    {
      number: 2,
      title: "In the Air",
      tier: "Beginner",
      goal: "Fly the long middle of a flight.",
      milestone: "Fly the long middle",
      nextMilestone: "Read the weather",
      companyValue: 50000,
      nextCompanyValue: 120000,
      intro: { headline: "A New Flight, A Clear Sky", line: "You are climbing out of Chicago with a full cabin.", hook: "Learn the words pilots use once the wheels are up." },
      terms: [
        {
          term: "Altitude", definition: "How high a plane is above sea level.", example: "The Skyline Air captain climbed to a higher altitude to find smooth air.", cue: "How high the plane is", icon: "arrow-up",
          moments: ["The captain says we are now thirty five thousand feet up.", "The plane climbs higher to get above the clouds.", "A gauge shows how far above the sea the plane is flying."],
        },
        {
          term: "Cruise", definition: "The long, level part of a flight after the climb and before the descent.", example: "Most of a Skyline Air flight is spent in cruise.", cue: "The long level middle", icon: "minus",
          moments: ["The climb is done. The plane flies flat and steady for hours.", "Seat belt sign off, snacks out, the ride smooth and level.", "For most of the trip the plane neither climbs nor drops."],
        },
        {
          term: "Turbulence", definition: "Rough, bumpy air that shakes the plane.", example: "The Skyline Air crew paused drink service during turbulence.", cue: "Bumpy, shaking air", icon: "waves",
          moments: ["The seat belt sign comes on as the plane starts to bounce.", "Drinks slosh and the cabin shakes for a few long seconds.", "Rough air rattles the carts as the crew holds the rails."],
        },
        {
          term: "Autopilot", definition: "A system that flies the plane on a set path while the pilots watch.", example: "The Skyline Air captain switched on autopilot after the climb.", cue: "The system that flies the path", icon: "cpu",
          moments: ["The captain sets the path. The plane holds it by itself.", "The pilots watch the screens while the jet steers itself.", "Hands off the controls, the plane still holds its heading and height."],
        },
        {
          term: "Air Traffic Control", definition: "The people on the ground who direct planes so they stay apart.", example: "Skyline Air pilots talk to Air Traffic Control on every flight.", cue: "The ground team directing planes", icon: "radio-tower",
          moments: ["A voice on the radio tells the pilot which way to turn.", "People in a tower watch radar and keep every plane apart.", "Permission to change course comes from a voice on the ground."],
        },
      ],
      selectAll: {
        term: "Turbulence",
        prompt: "Select every sign of rough air.",
        options: ["Drinks shake and spill on the tray", "A sudden jolt rattles the overhead bins", "The ride is smooth enough to pour coffee", "Carts get locked down as the cabin shakes"],
        correct: [0, 1, 3],
        feedbackCorrect: "Right. Shaking, jolts and locked carts all mean rough air.",
        feedbackWrong: "Rough air shakes and jolts the plane. A smooth ride is not it.",
      },
      cases: [
        {
          terms: ["Turbulence", "Air Traffic Control", "Altitude"],
          scene: "An hour into the flight, rough air over the mountains.",
          steps: [
            { prompt: "The cabin starts to shake. What is your first call?", options: ["Seat belt sign on", "Speed up to get through", "Turn off the radios", "Tell the crew to serve drinks"], correctIndex: 0 },
            { prompt: "Smoother air is reported higher up. Who do you ask before climbing?", options: ["The ground team on the radio", "The passengers", "Nobody, just climb", "The airline's office"], correctIndex: 0 },
            { prompt: "You get the OK to climb. What changes?", options: ["How high the plane flies", "How many seats are full"], correctIndex: 0 },
          ],
          feedbackCorrect: "Belts first. Then ask the ground team, then change height.",
          feedbackWrong: "Belts on first in rough air. Then the ground team clears your climb.",
        },
        {
          terms: ["Cruise", "Autopilot"],
          scene: "The climb is over and the plane levels off for the long middle.",
          steps: [
            { prompt: "The plane will fly flat and steady for hours. Which part is this?", options: ["Cruise", "Descent", "Taxi", "Boarding"], correctIndex: 0 },
            { prompt: "You want to rest your hands but keep the path exact. What do you use?", options: ["Autopilot", "The seat belt sign", "The radio", "The brakes"], correctIndex: 0 },
          ],
          feedbackCorrect: "In the long level middle, the system holds the path.",
          feedbackWrong: "After the climb comes the long middle. A system can hold the path for you.",
        },
      ],
      powerPlay: {
        intro: "Fly one Skyline Air flight from climb to cruise.",
        paragraph: "After takeoff, {5} says to turn left and climb. The Skyline Air jet levels off at its planned {1}. The captain lets the {4} hold the path. Hours of smooth {2} follow. Then the ride gets bumpy, and the crew waits out the {3}.",
      },
      facts: ["Jets fly high because thin air lets them go faster on less fuel."],
    },
    {
      number: 3,
      title: "Weather and Routes",
      tier: "Intermediate",
      goal: "Read the weather and change the plan.",
      milestone: "Read the weather",
      nextMilestone: "Land it smoothly",
      companyValue: 120000,
      nextCompanyValue: 250000,
      intro: { headline: "Storms Ahead", line: "A new day, a new flight, and bad weather.", hook: "Learn the words for wind, fog and a change of plan." },
      terms: [
        {
          term: "Headwind", definition: "Wind blowing against the plane, which slows it down.", example: "A strong headwind made the Skyline Air flight land late.", cue: "Wind against the plane", confusion: "Tailwind", icon: "wind",
          moments: ["The plane is pushing into the wind and arrives late.", "Headed west, the jet fights the wind and burns extra fuel.", "The jet fights the wind all the way and loses time."],
        },
        {
          term: "Tailwind", definition: "Wind blowing from behind the plane, which speeds it up.", example: "A tailwind got the Skyline Air flight in early.", cue: "Wind pushing from behind", confusion: "Headwind", icon: "fast-forward",
          moments: ["The wind is behind the plane and it lands early.", "A push from behind shaves an hour off the trip east.", "The jet rides the wind and uses less fuel than planned."],
        },
        {
          term: "Visibility", definition: "How far a pilot can see through the air.", example: "Low visibility in fog slowed Skyline Air landings all morning.", cue: "How far you can see", confusion: "Headwind", icon: "eye",
          moments: ["Fog is so thick the pilot cannot see the ground.", "Clear skies: the crew spots the airport from fifty miles away.", "Heavy snow hides the strip until the very last second."],
        },
        {
          term: "Diversion", definition: "Landing at a different airport than planned.", example: "A storm forced a Skyline Air diversion to Denver.", cue: "Landing somewhere else", confusion: "Holding Pattern", icon: "corner-up-right",
          moments: ["The home airport is closed, so the plane lands in another city.", "A storm sits over Boston, so the jet heads for Denver instead.", "Passengers land in a city that was never on their ticket."],
        },
        {
          term: "Holding Pattern", definition: "Flying in circles near the airport while waiting to land.", example: "Skyline Air flight twelve flew a holding pattern for twenty minutes.", cue: "Circling while waiting to land", confusion: "Diversion", icon: "refresh-cw",
          moments: ["The plane loops in the sky because the runway is busy.", "The jet flies the same oval over and over, waiting its turn.", "Out the window the same lake passes by for the third time."],
        },
      ],
      sort: {
        label: "Early, late or elsewhere",
        prompt: "Does each one get you in early, late, or somewhere new?",
        buckets: ["Early", "Late", "Somewhere new"],
        items: [
          { text: "Wind at your back all the way", bucket: "Early", term: "Tailwind" },
          { text: "Wind straight on the nose", bucket: "Late", term: "Headwind" },
          { text: "Fog hides the strip for an hour", bucket: "Late", term: "Visibility" },
          { text: "Home airport closed by a storm", bucket: "Somewhere new", term: "Diversion" },
          { text: "Circling until the strip is free", bucket: "Late", term: "Holding Pattern" },
          { text: "A push from behind, fuel to spare", bucket: "Early", term: "Tailwind" },
          { text: "A new city, not the one planned", bucket: "Somewhere new", term: "Diversion" },
        ],
        feedbackCorrect: "Wind from behind saves time. Bad weather costs time or sends you elsewhere.",
        feedbackWrong: "Ask: does it save time, cost time, or send you somewhere new?",
      },
      selectAll: {
        term: "Visibility",
        prompt: "Select everything that cuts how far the pilot can see.",
        options: ["Thick fog on the ground", "Heavy snow in the air", "A strong wind from behind", "Smoke from a forest fire"],
        correct: [0, 1, 3],
        feedbackCorrect: "Right. Fog, snow and smoke all block the view.",
        feedbackWrong: "Wind changes how fast you fly, not how far you see.",
      },
      cases: [
        {
          terms: ["Holding Pattern", "Diversion", "Tailwind"],
          scene: "Boston is socked in with fog and the fuel is getting low.",
          steps: [
            { prompt: "The tower says wait, the fog may lift. What do you fly?", options: ["Holding Pattern", "Diversion", "Headwind", "Tailwind"], correctIndex: 0 },
            { prompt: "Fuel is now too low to keep waiting. What is the call?", options: ["Keep circling", "Land at Providence instead"], correctIndex: 1 },
            { prompt: "The wind is behind you on the way to Providence. What does that do?", options: ["Gets you there sooner", "Slows you down", "Hides the airport", "Makes you circle"], correctIndex: 0 },
          ],
          feedbackCorrect: "Yes. You waited, left in time, and the wind helped.",
          feedbackWrong: "Circle while fuel lasts, then go elsewhere. Wind from behind speeds you up.",
        },
        {
          terms: ["Visibility", "Headwind"],
          scene: "Snow is falling at Denver and the wind is on the nose.",
          steps: [
            { prompt: "The strip stays hidden until the last second. What is low?", options: ["How far the crew can see ahead", "How much fuel is in the tanks"], correctIndex: 0 },
            { prompt: "The wind fights you the whole way. What does it cost?", options: ["Time and fuel", "Seats", "Luggage space", "Cabin lights"], correctIndex: 0 },
          ],
          feedbackCorrect: "Snow cuts what you can see. Wind on the nose costs time and fuel.",
          feedbackWrong: "Snow hides the strip. Wind against you makes you late and burns fuel.",
        },
      ],
      powerPlay: {
        intro: "Fly one Skyline Air trip through bad weather.",
        paragraph: "Fog cuts the {3} at Boston to almost nothing. The Skyline Air jet flies a {5} over the same lake. Fuel runs low, so the captain calls a {4} to Providence. A strong {2} gets the plane there fast. On the trip back west, a {1} makes the flight late.",
      },
      facts: ["Pilots get a weather report for the whole route before they leave the gate."],
    },
    {
      number: 4,
      title: "Landing",
      tier: "Intermediate",
      goal: "Land it smoothly.",
      milestone: "Land it smoothly",
      nextMilestone: "Lead the crew",
      companyValue: 250000,
      nextCompanyValue: 500000,
      intro: { headline: "Final Approach", line: "A new flight is coming into a rainy Boston.", hook: "Learn the words for bringing a plane down." },
      terms: [
        {
          term: "Approach", definition: "The last stretch of a flight, lined up with the runway to land.", example: "The Skyline Air crew began the approach ten miles out.", cue: "Lined up to land", confusion: "Descent", icon: "corner-right-down",
          moments: ["The runway lights are dead ahead and getting closer.", "The jet is lined up with the strip, a few miles out.", "Gear down, the plane glides straight at the runway."],
        },
        {
          term: "Descent", definition: "The part of a flight where the plane comes down from cruising height.", example: "Skyline Air passengers felt their ears pop during the descent.", cue: "Coming down from cruise", confusion: "Approach", icon: "arrow-down",
          moments: ["The seat belt sign is on and the ground is slowly rising.", "Ears pop as the plane starts down from cruising height.", "The nose dips and the jet leaves its high, level path."],
        },
        {
          term: "Flaps", definition: "Wing panels that slide out to add lift at slow speeds.", example: "The Skyline Air pilot set the flaps before landing.", cue: "Wing panels for slow flight", confusion: "Descent", icon: "layers",
          moments: ["Parts of the wing slide out and tilt down as it slows.", "A whir from the wings, and the back edges drop lower.", "Panels slide out so the plane can fly slow without falling."],
        },
        {
          term: "Touchdown", definition: "The moment the wheels meet the runway.", example: "A smooth Skyline Air touchdown got a round of applause.", cue: "Wheels meet the runway", confusion: "Go Around", icon: "plane-landing",
          moments: ["A bump, a squeal of tires, and the cabin cheers.", "The main wheels kiss the strip and the brakes bite.", "Puffs of smoke as the tires hit the ground."],
        },
        {
          term: "Go Around", definition: "Breaking off a landing at the last moment and climbing to try again.", example: "Low clouds forced a Skyline Air go around at Denver.", cue: "Climb away and try again", confusion: "Touchdown", icon: "refresh-cw",
          moments: ["Just above the runway, the engines roar and the plane climbs.", "The landing is called off and the jet circles for another try.", "Too high, too fast, so the crew powers up and climbs away."],
        },
      ],
      selectAll: {
        term: "Go Around",
        prompt: "Select every reason to break off a landing and climb away.",
        options: ["Too high and too fast on final", "Another plane still on the strip", "A smooth, steady path to the strip", "Strong gusts right above the ground"],
        correct: [0, 1, 3],
        feedbackCorrect: "Right. Speed, a blocked strip and gusts all mean climb away.",
        feedbackWrong: "A steady path is a good landing. The other three mean climb away.",
      },
      cases: [
        {
          terms: ["Approach", "Flaps", "Touchdown"],
          scene: "Rainy Boston, a few miles out, the wet runway in sight.",
          steps: [
            { prompt: "A few miles out, the strip fills your windshield. Which phase is this?", options: ["Approach", "Descent", "Takeoff", "Taxi"], correctIndex: 0 },
            { prompt: "The plane must fly slower without dropping. What do you set?", options: ["Flaps", "Brakes", "Seat belt sign", "Radio"], correctIndex: 0 },
            { prompt: "Wheels meet the wet strip. What just happened?", options: ["Touchdown", "Go Around"], correctIndex: 0 },
          ],
          feedbackCorrect: "Line up, slow down with the wing panels, then put the wheels down.",
          feedbackWrong: "First you line up. Then wing panels slow you, and the wheels meet the strip.",
        },
        {
          terms: ["Go Around", "Descent"],
          scene: "A truck rolls onto the runway just as you reach it.",
          steps: [
            { prompt: "Something is on the strip. What is your call?", options: ["Power up and climb away", "Land short of the truck", "Shut the engines down", "Brake hard in the air"], correctIndex: 0 },
            { prompt: "Safe height reached. The tower clears you to come down again. What starts over?", options: ["Descent", "Boarding", "Pushback", "Fueling"], correctIndex: 0 },
          ],
          feedbackCorrect: "Never land on a blocked strip. Climb away, then come down again.",
          feedbackWrong: "A blocked strip means climb away. Then you come down again from a safe height.",
        },
      ],
      powerPlay: {
        intro: "Bring one Skyline Air jet down in the rain.",
        paragraph: "An hour from Boston, the Skyline Air jet begins its {2}. Closer in, the crew sets the {3} to fly slow. Lined up with the wet strip, the jet is on its final {1}. A truck rolls onto the strip, so the captain calls a {5}. On the second try, a soft {4} gets a cheer.",
      },
      facts: ["Pilots aim for a touchdown zone, not the very start of the runway."],
    },
    {
      number: 5,
      title: "The Crew",
      tier: "Advanced",
      goal: "Lead the whole crew.",
      milestone: "Lead the crew",
      nextMilestone: "Handle an emergency",
      companyValue: 500000,
      nextCompanyValue: 1000000,
      intro: { headline: "Your Crew, Your Call", line: "A new flight, and today you sit in the left seat.", hook: "Learn who does what to get one plane safely across the country." },
      terms: [
        {
          term: "Captain", definition: "The pilot in charge of the whole flight.", example: "The Skyline Air captain makes the final call on takeoff.", cue: "The pilot in charge", confusion: "First Officer", icon: "gauge",
          moments: ["Two pilots disagree. One of them has the final say.", "Four stripes on the sleeve, and the left seat is theirs.", "Before pushback, one person signs for the whole flight."],
        },
        {
          term: "First Officer", definition: "The second pilot, who shares the flying and backs up the one in charge.", example: "The Skyline Air first officer flew the landing today.", cue: "The second pilot", confusion: "Captain", icon: "user-round",
          moments: ["The pilot in the right seat takes the controls for this leg.", "Three stripes, right seat, and today it is their landing.", "The newer pilot answers the radio and backs up the boss."],
        },
        {
          term: "Flight Attendant", definition: "The crew member who keeps passengers safe and cared for in the cabin.", example: "A Skyline Air flight attendant checks every seat belt before takeoff.", cue: "Keeps the cabin safe", confusion: "Dispatcher", icon: "users",
          moments: ["Someone walks the aisle checking belts and closing bins.", "Someone in uniform points out the exits before the flight.", "In rough air, one person makes sure every tray is up."],
        },
        {
          term: "Dispatcher", definition: "The ground planner who picks the route and fuel and tracks the flight.", example: "A Skyline Air dispatcher planned the route around the storm.", cue: "Plans the flight from the ground", confusion: "Flight Attendant", icon: "radio-tower",
          moments: ["Someone at a desk picks the route and the fuel.", "Far from the plane, one person tracks the flight on a map.", "A message arrives: the route is changed to miss a storm."],
        },
        {
          term: "Checklist", definition: "The written list the crew reads step by step so nothing is missed.", example: "Skyline Air pilots read the checklist out loud before every phase.", cue: "The list read step by step", confusion: "Captain", icon: "clipboard-check",
          moments: ["One pilot reads each line, the other answers Check.", "Before engine start, every item on the card gets a reply.", "Flaps set? Set. Lights on? On. Nothing is skipped."],
        },
      ],
      sort: {
        label: "Where the job happens",
        prompt: "Where does each job happen?",
        buckets: ["In the cockpit", "In the cabin", "On the ground"],
        items: [
          { text: "Has the final say on takeoff", bucket: "In the cockpit", term: "Captain" },
          { text: "Lands from the right seat", bucket: "In the cockpit", term: "First Officer" },
          { text: "Closes the bins and checks belts", bucket: "In the cabin", term: "Flight Attendant" },
          { text: "Picks the route and the fuel", bucket: "On the ground", term: "Dispatcher" },
          { text: "Reads each line, hears Check", bucket: "In the cockpit", term: "Checklist" },
          { text: "Calms a nervous flyer", bucket: "In the cabin", term: "Flight Attendant" },
          { text: "Tracks the flight from a desk", bucket: "On the ground", term: "Dispatcher" },
        ],
        feedbackCorrect: "Pilots work up front, the crew in back, and planners on the ground.",
        feedbackWrong: "Ask: up front, in the cabin, or at a desk on the ground?",
      },
      selectAll: {
        term: "Flight Attendant",
        prompt: "Select everything the cabin crew member does.",
        options: ["Checks each seat belt before takeoff", "Demonstrates the oxygen masks", "Plans the fuel for the trip", "Serves drinks and answers call lights"],
        correct: [0, 1, 3],
        feedbackCorrect: "Right. Belts, masks and drinks are all cabin work.",
        feedbackWrong: "Fuel is planned at a desk on the ground, not in the cabin.",
      },
      cases: [
        {
          terms: ["Dispatcher", "Captain", "Checklist"],
          scene: "A storm is building along today's route to Denver.",
          steps: [
            { prompt: "Who plans a way around the storm and adds fuel, from the ground?", options: ["Dispatcher", "Flight Attendant", "Captain", "First Officer"], correctIndex: 0 },
            { prompt: "The new route is in. Who makes the final call to accept it?", options: ["Captain", "First Officer"], correctIndex: 0 },
            { prompt: "Before engines start, what do both pilots go through line by line?", options: ["Checklist", "Weather report", "Passenger list", "Fuel bill"], correctIndex: 0 },
          ],
          feedbackCorrect: "The ground plans it, the pilot in charge says yes, the list checks it.",
          feedbackWrong: "A desk on the ground plans the route. The pilot in charge says yes.",
        },
      ],
      powerPlay: {
        intro: "Get one Skyline Air crew from the gate to Denver.",
        paragraph: "A Skyline Air {4} at a desk plans a route around a storm. In the cockpit, both pilots read the {5} line by line. Today the {2} in the right seat flies the landing. But the {1} in the left seat has the final say. Back in the cabin, a {3} checks every belt.",
      },
      facts: ["Captains and first officers take turns flying, leg by leg."],
    },
    {
      number: 6,
      title: "Emergencies",
      tier: "Advanced",
      goal: "Stay calm when it counts.",
      milestone: "Handle an emergency",
      nextMilestone: "Keep flying",
      companyValue: 1000000,
      nextCompanyValue: 1000000,
      intro: { headline: "Something Is Wrong", line: "A different flight. A warning light comes on at cruise.", hook: "Learn the words crews use when every second matters." },
      terms: [
        {
          term: "Mayday", definition: "The radio call for a life threatening emergency.", example: "A Skyline Air crew would only call Mayday when lives are at risk.", cue: "The call for a true emergency", confusion: "Squawk", icon: "siren",
          moments: ["The pilot says the same word three times on the radio.", "An engine is on fire. The radio call clears every other voice.", "Lives are at risk, and the crew asks for help right now."],
        },
        {
          term: "Emergency Descent", definition: "Coming down fast to safer air after a sudden problem up high.", example: "The Skyline Air crew began an emergency descent when the cabin lost pressure.", cue: "Dropping fast to safe air", confusion: "Evacuation", icon: "arrow-down",
          moments: ["Masks drop and the plane heads down fast but under control.", "The cabin loses pressure, so the jet dives to thicker air.", "Within minutes the plane is low enough to breathe without masks."],
        },
        {
          term: "Evacuation", definition: "Getting everyone off the plane fast after it stops.", example: "Skyline Air crews practice an evacuation every year.", cue: "Everyone off the plane fast", confusion: "Emergency Descent", icon: "move",
          moments: ["Slides pop open and people leave their bags behind.", "Leave everything! The crew shouts as the doors swing open.", "Smoke in the cabin, and everyone is out in ninety seconds."],
        },
        {
          term: "Squawk", definition: "A four digit code that tells controllers who and what the plane is.", example: "Skyline Air pilots set a special squawk for a radio failure.", cue: "The code set for controllers", confusion: "Mayday", icon: "radio-tower",
          moments: ["The pilot sets a code that tells the ground what is wrong.", "Four digits on a panel tell the tower the radios have failed.", "A new code, and the plane blinks red on the tower's screen."],
        },
        {
          term: "Alternate", definition: "A backup airport chosen before takeoff in case the first one closes.", example: "Every Skyline Air flight plan names an alternate.", cue: "The backup airport", confusion: "Evacuation", icon: "corner-right-down",
          moments: ["Fog closes the home airport, so the crew heads for plan B.", "Before takeoff, the plan already names a second place to land.", "Fuel for the trip, plus enough to reach a backup field."],
        },
      ],
      selectAll: {
        term: "Mayday",
        prompt: "Select every moment that deserves the top emergency call.",
        options: ["Both engines have quit", "Fire in the cargo hold", "The coffee maker is broken", "Smoke filling the cockpit"],
        correct: [0, 1, 3],
        feedbackCorrect: "Right. Dead engines, fire and smoke all put lives at risk.",
        feedbackWrong: "The top call is only for danger to life. A broken coffee maker is not.",
      },
      cases: [
        {
          terms: ["Emergency Descent", "Mayday", "Squawk"],
          scene: "At cruise, a loud bang and the cabin air turns thin and cold.",
          steps: [
            { prompt: "You cannot breathe this air for long. What is your first move?", options: ["Dive to thicker air", "Climb above the weather", "Serve the drinks", "Open the doors"], correctIndex: 0 },
            { prompt: "Every controller must know lives are at risk. What do you say on the radio?", options: ["Mayday", "Squawk"], correctIndex: 0 },
            { prompt: "You also set a code so the ground sees the trouble on radar. What is that?", options: ["Squawk", "Alternate"], correctIndex: 0 },
          ],
          feedbackCorrect: "Dive to thicker air, make the top call, then set the code.",
          feedbackWrong: "Thin air means dive first. Then make the top call and set the radar code.",
        },
        {
          terms: ["Alternate", "Evacuation"],
          scene: "Denver is closed by fog, and the fuel will not last forever.",
          steps: [
            { prompt: "The home airport is shut. Where does the plan already say to go?", options: ["The field named before takeoff", "The nearest big city", "Back where you started", "Wherever the fog is thinner"], correctIndex: 0 },
            { prompt: "You land safely, then smoke fills the cabin. What is the call?", options: ["Everyone out now, bags behind", "Taxi to the gate first"], correctIndex: 0 },
          ],
          feedbackCorrect: "The backup was picked before takeoff. Smoke means everyone out, now.",
          feedbackWrong: "The plan names a backup before takeoff. Smoke in the cabin means get out now.",
        },
      ],
      powerPlay: {
        intro: "Keep one Skyline Air flight safe when it all goes wrong.",
        paragraph: "The Skyline Air plan names an {5} in case Denver closes. At cruise, a loud bang shakes the jet. The crew starts an {2} toward thicker air. They set a new {4} so radar shows the trouble. The captain calls {1} three times. On the ground, smoke fills the cabin, so the crew orders an {3}.",
      },
      facts: ["Crews practice emergencies in simulators until the real thing feels like a drill."],
    },
  ],
};
