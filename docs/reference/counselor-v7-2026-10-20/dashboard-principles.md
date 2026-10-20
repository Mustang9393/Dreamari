# Counselor dashboard: what the greats say, and what v7 does with it

20 Oct 2026. Chandu: "conduct research into data viz and dashboard design from the greats", then enhance v7 visually without changing much structure or content.

## The principles (sources at the end)

1. **A dashboard is a single screen read at a glance** (Stephen Few, *Information Dashboard Design*). Prioritise a few measures ruthlessly; replace dials and gauges with **bullet graphs** (a value against a target on one line) and **sparklines**.
2. **Encode quantity with length or 2D position** (NN/g, "Dashboards: Making Charts and Graphs Easier to Understand"). Sort what you compare. No pies or donuts except for an overwhelming disparity. Replace radial gauges with linear bullets showing the full range. Never encode magnitude in colour. Never rely on colour alone.
3. **Overview first, zoom and filter, then details on demand** (Ben Shneiderman, "The Eyes Have It", 1996). The overview should itself be the filter.
4. **Maximise data-ink** (Edward Tufte). Remove non-data ink: borders, gridlines, legends and labels that don't carry the answer. Use small multiples for comparison on one scale.
5. **Declutter, then focus attention with preattentive attributes** (Cole Nussbaumer Knaflic, *Storytelling with Data*; Colin Ware on preattentive processing). Every element adds cognitive load. Use colour, size and position on the one thing that matters, and leave the rest grey (the *emphasis* form). Use proximity, alignment and white space (Gestalt) to group without boxes.
6. **Put the takeaway in words beside the chart; preview small and disclose the detail** (Apple HIG, Charting data; WWDC22 "Design an effective chart"). Keep the baseline honest and grids sparse.
7. **The house rules that already encode these** (Chandu): no plain bars and no rings; marks are made of light; ranges use `LightRange`; trends are an up or down icon, not a sparkline; no fields of many small repeated marks; one lit action per screen; blue plus status colours only.

## What v7 does with them

| Principle | v7 change |
|---|---|
| Few: a bullet against a target, not a gauge or bar | Course Planner credits are a `LightRange`: 0 to required, the lit point at credits earned. "On track" or "behind" is said once, in words. |
| Knaflic emphasis plus NN/g position | Home's Meetings card shows the week as five day chips by position. Today is lit, days with meetings carry their count, the rest stay grey. |
| Part-to-whole only when it is two parts, said in words | Home's Need-you card has one two-part line of light: at risk (red) and needs attention (amber), each labelled with its number. Colour is never the only cue. |
| Shneiderman: the overview is the filter | Students opens on a status overview (At risk · Needs attention · On track, with counts). Tapping one filters the list. It replaces the Status dropdown. |
| Position for time, emphasis on now | Prepare gets a Mon–Fri day strip above the agenda. Today is lit, each day shows its meeting count, and a tap jumps to that day. |
| One focal block per screen | A student's profile header becomes the screen's one lit focal card (look-v2 `data-focal`). |
| Tufte data-ink | No new borders, legends or footnotes. Every added mark replaces words, not adds to them. |

## Sources

- Stephen Few, *Information Dashboard Design*, 2nd ed., Analytics Press, 2013: https://www.ipgbook.com/information-dashboard-design-products-9781938377006.php
- NN/g, "Dashboards: Making Charts and Graphs Easier to Understand": https://www.nngroup.com/articles/dashboards-preattentive/
- Ben Shneiderman, "The Eyes Have It", 1996: https://webspace.science.uu.nl/~telea001/uploads/VACourse/Shneiderman96.pdf
- Edward Tufte, data-ink and small multiples (notes): https://faculty.cc.gatech.edu/~stasko/4460/Notes/tufte.pdf
- Cole Nussbaumer Knaflic, *Storytelling with Data* (summary): https://associationanalytics.com/blog/storytelling-with-data/
- Apple HIG, Charting data: https://developer.apple.com/design/human-interface-guidelines/charting-data ; WWDC22 "Design an effective chart": https://developer.apple.com/videos/play/wwdc2022/110340/
- Preattentive attributes (Few, Ware): https://engineering.wellsky.com/post/how-to-use-pre-attentive-attributes-to-communicate-data-visually
