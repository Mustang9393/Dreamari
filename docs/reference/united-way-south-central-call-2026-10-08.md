# United Way of South Central Michigan: call notes and board (8 to 10 Oct 2026)

Call on 8 Oct 2026: Maisha Kabir (Dream) with Stephanie Slingerland (United Way of South Central Michigan). Sam Newberg joins the next meeting, where Maisha demos.

## What they asked for
- Connect students to nonprofit and public sector careers across the lifecycle: high school, college, young professional.
- Two affinity groups carry it: Student United and Young Leaders United. The platform is the digital link between their in-person events.
- Four communities, each with its own space: Kalamazoo, Battle Creek, Lansing, Jackson. A regional layer over all four mirrors their regional convenings.
- Colleges: Michigan State, Western Michigan, local community colleges.
- Users: students, nonprofits, local colleges, corporate partners.
- Baseline engagement: students ask questions, professionals share opportunities. Program registration and tracking come later.
- Metrics: students connected to nonprofit and public sector professionals; program participation; volunteer hours and opportunities accessed; testimonials.
- Built to replicate. Pilot April 2027 (one school system, one college); wider rollout April 2028.

## What was built (10 Oct 2026, LOCAL ONLY: do not push until Chandu says so)
- New board `src/components/connect/unitedway/uwSouthCentral.ts` ("United Way · South Central Michigan"), on the same engine as the network and Michigan boards. Card in `connect/data.ts`, routing in `ConnectExperience.tsx`, six Q&A threads in `uwThreads.ts`.
- Engine additions (`uwData.ts`, `UnitedWayBoardView.tsx`, `uwCharts.tsx`), all optional so the other boards are unchanged:
  - `places`: the board's own words for a place ("Whole region", "By community"), replacing "Everywhere" and "By United Way".
  - `shared`: "Shared by professionals" on the student Home, each opening with the professional's face (opens their profile).
  - `impact.voices`: "In their words" on the partner Impact tab.
  - `program.chapter` may be null, for region-wide programs (Student United, Young Leaders United).
  - Map frame `southcentral`: southern Lower Michigan only, so the four pins sit apart.
- Partner Impact tiles are the four call metrics, in order: Students connected, Program participants, Volunteer hours, Opportunities accessed. The pilot shows as "Apr 2027 · Pilot starts with one school system and one college".
- Nonprofit and public sector professionals lead the volunteer list (Nathan Doyle, CDC Foundation; Naomi Wong, Khan Academy); corporate partners follow.
- Real: the four communities, Youth United Way Kalamazoo, Bigs in Schools Jackson, Battle Creek's Youth Day of Caring, the colleges. Everything else is DEMO-ONLY and marked in code. Shared openings name generic employers ("A Lansing city office"), never a real organization's invented posting.
- Hero photo is the United Way volunteers photo, not the Student United Way class photo, which carries West Michigan's banner.
