# United Way programs research (Google Doc, 18 Sept 2026)

Source: "United Ways Program", a Google Doc owned by data@dreamopportunity.org, shared with Chandu on 7 Oct 2026.
https://docs.google.com/document/d/1QGVWPuxxba3vib9dlUtbWYZZNhY2BVrBu5nVBfmHVSg/edit

This is program research, not design research. As of 7 Oct 2026 nothing for United Way exists in the app: no board, no brand mark, no partner call notes. The only other mention in our history is an AT&T story about the AT&T + United Way "Digital Bridges" laptop program (used in the AT&T board work, 20 Sept 2026).

## What the doc says, condensed

United Way Worldwide names College & Career Readiness as a core part of its Youth Opportunity work: mentorship, apprenticeships, professional training, career coaching, skill development, real-world experience. Programs are run by local United Ways, so they differ a lot by place.

| Program | United Way | Who | What it does |
| --- | --- | --- | --- |
| Youth Career Connections | Orange County | High school | Work-based learning: pros in classrooms, site visits, workplace mentorships (seniors, 4 weeks at a company, about 20 hours a week), summer internships, Career and Life Prep Academy, financial literacy, entrepreneurship, first responder experiences. Industries: Arts/Media/Entertainment, Business/Marketing/Finance, Engineering/Design/Architecture, Health/Medical Tech, ICT. Since 2016: 15,399 students and teachers, 65,922 volunteer hours, 2,262 workplace mentorships. |
| e-Mentorship | Orange County | High school seniors, low income | One-on-one professional mentorship plus a virtual workshop series on career and life skills. Virtual model. Coming back for the Class of 2027. |
| Destination Graduation | Orange County | High school | Graduate and know the options after: college and career exploration, financial aid, scholarships, college trips, application support, leadership. |
| Young Men United | United Way of the Midlands (SC) | High school into postsecondary | Adult mentors, paid internships (8 weeks), job shadowing, college and employer visits, professional development, financial literacy; laptops provided. 2024-25: 100% matched with a mentor, 20 paid internships, 25 job shadows. Evaluated with the University of South Carolina. |
| Opportunity Youth Career Exploration and Access Project | Long Island | Ages 14 to 17 | Career exploration, work-readiness training, life skills, career pathway education, paid internships, school-to-work transition. |
| Ready to Succeed | United Way Australia | High school | Business and community partnerships, professional mentoring, workplace experiences, life skills. |

Across the network: mentorship (professional, adult, virtual, workplace), career exposure (speakers, employer and site visits, networking), work-based learning (internships, apprenticeships, job shadowing), college prep (visits, financial aid, scholarships, applications), career prep (coaching, employability, interviews, leadership, financial literacy, soft skills, job placement).

Technology: no single career-readiness platform across the network. Tech is program-specific and local: virtual mentorship and workshops (OC), laptops (Midlands), surveys and evaluation (USC).

## Key findings (the doc's own)
1. College and career readiness is an established United Way priority.
2. Mentorship is common across programs.
3. Career exposure is employer-driven.
4. Work-based learning is a major component.
5. Programs continue beyond awareness into mentorship, internships, college prep, employment prep.
6. Programming extends from high school into postsecondary.
7. Technology use varies by local United Way; no network-wide student platform.

## What this suggests for a United Way board in Dreamari (design read, 7 Oct 2026)
- The gap United Way has is the one Dreamari fills: no shared student-facing platform. That is the pitch for the board.
- Shape: a partner community board like AT&T's (`src/components/connect/att/`), with the local United Way's programs as the board's "Updates" (fed from Opportunities, the way the Connect boards already do), professionals from partner employers as the people, and student questions answered beneath.
- Program types map onto existing surfaces: mentorship → Connect mentorship programs (the college mentorship pattern with the Messages dock); internships, job shadows, site visits → Opportunities; Destination Graduation style college prep → My Plan; e-Mentorship workshops → a board Events tab.
- Open questions before building: which local United Way (Orange County is the richest example), the brand rules for the mark, who the professionals are, and whether this is a Connect board or a standalone partner page.
