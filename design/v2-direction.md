# V2 direction: Price Discovery

## 1. Identity
- Idea: a market finds a price by letting noise settle into one exact figure. The site does that to him: a wall of moving candlesticks settles into his face, then into his real numbers.
- Why it fits: finance is his lead field and his record is numerical (99.4%, AIR 54 of 10,000+, 100 of 2,000, 16 awards).
- One motion verb for the whole site: **settle**. Things jitter, overshoot slightly, lock. Nothing floats, glows or bounces.
- Scale is cinematic: full-bleed footage, type up to 176px, one pinned set piece per page. Palette comes from the portrait: blazer navy, shirt blue, warm light as amber.
- What a visitor remembers: his face drawn entirely in candlesticks, closing like a market.

## 2. Tokens
Dark everywhere; only the ground family and lead accent shift per page.

| Role | Navy: Home, Finance, Contact | Petrol: Model UN | Umber: Academics, Leadership |
|---|---|---|---|
| ground | `#0A101C` | `#081619` | `#12100E` |
| raised | `#111A2B` | `#0F2227` | `#1C1915` |
| hairline | `#243049` | `#1F3A40` | `#332D25` |
| text | `#E8EDF6` | `#E8EDF6` | `#EFE9DD` |
| secondary | `#8D9AB3` | `#8FA5A8` | `#A39A8A` |
| lead accent | amber `#F2A541` | shirt blue `#9CB9EA` | amber `#F2A541` |

Down-candle `#4E6792`. Amber means "his figure" and nothing else. No gradients, shadows or blur.

Type (`next/font/google`, verified present): display **Bodoni Moda** (variable, `opsz` 96, weight 500), text **Schibsted Grotesk**, figures **Martian Mono** (`wdth` 80, tabular; figures and dates only). Sentence case; no all-caps eyebrows.
Scale (desktop / phone): display-xl `clamp(52px, 11vw, 176px)` lh 0.9, -0.02em; display-l `clamp(44px, 7vw, 112px)`; heading 40 / 28 (Bodoni never below 28px); lead 21 / 18; body 17 / 16, lh 1.6, max 62ch; small 14; figure 15 / 13.
Grid 12 col, 24px gutter, 64px margin (20px phone). Spacing 4, 8, 16, 24, 40, 64, 104, 168. Radius 0. Focus: 2px accent outline, 3px offset.
Motion: 120ms hover, 300ms settle, 600ms reveal, 900ms page transition, 2.9s home intro. `settle` cubic-bezier(0.2, 1.3, 0.3, 1); `glide` cubic-bezier(0.16, 1, 0.3, 1). DOM animates transform and opacity only.

**Stock media treatment (all pages).** Atmosphere only: never captioned, never framed as him, his school or his events, no identifiable faces. Graded to the page: greyscale, multiplied with ground, 35 to 45% brightness, so it reads as part of the palette. Loops are muted, inline, 720p, under 2.5 MB, with a poster; paused off screen; poster only under reduced motion or save-data. Every item sits in a `media` map in `site.ts` with `stock: true`, so his own photo or clip replaces it by changing one path.

## 3. Site map
Routes: `/`, `/finance`, `/model-un`, `/academics`, `/leadership`, `/contact`. Only Home is locked to one screen. Every other page has the same three beats: **cold open** (100svh footage, title in display-xl, one headline figure), **set piece** (pinned while the footage scales back and dims), **record** (short ruled lists).

Navigation, "the board": desktop is a fixed top strip, name at left (home), five destinations at right, amber tick under the current one, "Download resume" last. Phone is a fixed bottom bar (name, Menu) opening a full-screen board: five rows, Bodoni name left, one real figure right.

| Page | Content from `site.ts` |
|---|---|
| Home | `identity`, `hero.descriptor`, `stats` on the buttons (`nfo`, `delegateAwards`, `gradeX`; Leadership has label only) |
| Finance | finance and pitch `competitions` (NFO, SRCC Olympiad, SHISFEST first position, Wharton, GITAM), SRCC fellowship from `experience`, `projects` (Artha) |
| Model UN | all of `mun`: 3 Executive Board roles, 2 parliamentary programmes, 16 awards; stat `conferences` |
| Academics | `education`, `courses`, academic and quiz `competitions` (SOF, SHRITEQ, Quiz to Conquer, HCL), `quiz`; `otherCompetitions` as one collapsed "More competitions" list at the foot |
| Leadership | `leadership`, remaining `experience` (internships, NGO), `timeline`, `skills` as one line |
| Contact | `about.profile`, `contact`, `social`, resume, `interests` as one line, stat `books` |

Placeholders: fields with `placeholder: true` are not rendered, except three single secondary-colour lines marked with a small hollow square: Wharton details, GITAM details, one "About" slot on Contact. Stat `awardsSummary` (19+) stays hidden until he confirms what it counts.

## 4. Home intro
One screen, `100svh`, no scroll. The **whole viewport is a candle wall** (WebGL, two instanced layers):
- Backdrop layer, 160 x 90 candles: stock loop M1 sampled as luminance only, so the footage is never seen as a picture, only as slow-moving candles at 25% brightness.
- Portrait layer, 96 x 128 candles, right 50% of the width, full height, bleeding off the bottom: sampled from an alpha-matted copy of his portrait (engineer makes `portrait-matte.webp`, 12px feather).
- Each candle: body height 15% to 100% of its cell by luminance, brightness by luminance, wick at 35% alpha; "up" (text colour) if brighter than its left neighbour, else "down". Every row is a chart of brightness. No axes, tickers or prices.

Over it, left: name in display-xl on two lines, bottom-left, overlapping the portrait's edge; `hero.descriptor` beneath. Foot: one hairline-ruled row of four destinations (Bodoni name, mono figure) plus Contact.

- 0s: black. One amber hairline at 62% height; a schematic 96-candle series (seeded random walk, unlabelled) draws left to right along it.
- 1.0s: the series spans the screen, then bursts: each candle splits into cells that fly to fill the full wall (to 2.2s, 6ms column stagger, `glide`). Name starts a masked rise.
- 2.5s: heights settle from random values to luminance with one damped overshoot (2.2 to 2.9s). The backdrop resolves into moving city light, his face locks bright at the right. Descriptor and destinations fade in.
- At rest: backdrop keeps moving with the footage; portrait candles breathe ±4%; every 7s an amber "last print" crosses the whole wall, one column at a time.
- Pointer: a full-screen crosshair tracks it. Within 140px candles swell to fill their cells and take true colour: a lens onto the real photograph (portrait only). Fast movement stretches candles within 240px, decaying over 600ms. Click replays burst and settle (900ms).
- Hovering a destination: its figure settles (digit roll), an amber rule draws, and the wall's columns lean a few pixels toward it.

Phone: portrait layer on top (flexible, min 44svh, 56 x 75), backdrop layer 60 x 100 behind everything; name on one line at 52px over the portrait's lower edge; descriptor; four 48px destination rows. Drag is the lens; after 4s idle it drifts across the face by itself.
Reduced motion, no WebGL or no JS: a pre-rendered still of the settled wall (`portrait-candles.webp`, alt `portraitAlt`); no intro, no footage; the lens still works. Cap DPR at 2; pause when hidden.

## 5. Pages
**Finance. Cold open M2.** Set piece **"The field"**: WebGL points, his real numbers drawn to scale, stepped by scroll (pinned), buttons or swipe. Step 1: 10,000 points (labelled "10,000+ participants, drawn as 10,000") fill the screen, then collapse to a ranked column with the 54th lit amber: AIR 54; a note gives Round 1 AIR 10. Step 2: 2,000 points, 100 stay lit: the SRCC fellowship. Step 3: SRCC Finance Olympiad AIR 46, as position 46 on a rule with no pool (none stated). Step 4: SHISFEST, first position. Points part around the pointer; the crosshair reads the rank under it. Then Artha: desktop screenshot at full bleed with the phone screenshot overlapping, slow scroll parallax, link out. Then Wharton and GITAM as "ongoing" rows with a slow amber pulse. Phone: 2D canvas, fewer points with the scale stated.

**Model UN. Cold open M3.** Set piece **"The chamber"**: Three.js hemicycle filling the viewport: 16 placards on the floor (one per award, brightness by level), 3 on the dais (Executive Board roles), 2 on a side bench (parliamentary programmes). Only real seats exist. The camera flies in from above and settles at delegate eye level; drag orbits ±25 degrees; hover or tap raises a placard with conference, committee, award and year as written; filtering by year or level dims the rest. Headline: "16 delegate awards, 6 Best Delegate". Full list below over still M4. Phone: SVG plan view, tappable seats. No globe, no arcs: nothing may imply travel.

**Academics. Cold open M5.** Set piece **"The tape"**: a cockpit-style altitude tape, full viewport height, over the cloud footage: it rolls up and settles on 99.4 with a fixed bug at the 96%+ floor and six Scholar Badge marks, 2021 to 2026. Only those real values. "99.4%" in display-xl beside it. Dragging the tape springs back. Then courses: aerospace entry beside loop M6, law entry beside still M7. Then quiz. Phone: tape runs horizontally under the figure.

**Leadership. Cold open M8.** Set piece **"Stints"**: full-width SVG lanes on a 2013 to 2026 axis (school, elected roles, work). Bars use stated dates at stated precision (year-only bars have soft ends); undated entries are listed below, not placed. A playhead sweeps on load; drag it or tap a bar to open the entry. Phone: horizontal scroll with snap. This is the interactive timeline.

**Contact.** Candle portrait at half size, settled; email in display-l; "400+ books" drawn as 400 hairline spines over still M9.

Finance, Model UN and Leadership each also keep one empty, sized slot for his own photos or clips; it renders nothing until filled.

## 6. Interests without sections
- Finance: the whole system (candles, settle, crosshair).
- Aviation: the nav board, split-flap transition, the tape over clouds; substance only in the IIT Madras aerospace course entry.
- Law: `courses` and the Model UN list set as a docket (Bodoni, ruled, date in the margin) with the colonnade still; substance only in the IIT Madras law course entry.
- Quizzing: `quiz` one question at a time beside his quiz results on Academics; answer, then the source link shows.
- Motorsport: the stint-chart form only. Formula 1 and tennis are named once in the Contact interests line. Reading: the 400 spines.
- Geopolitics: the chamber. Committee names stay exactly as written. No descriptions or expertise language anywhere.

## 7. Transitions, cursor, do-not
- Page transition: 96 candle columns rise in a left-to-right stagger to cover the screen (300ms), a centred split-flap line settles on the destination name, columns drop to reveal the cold open (900ms total). Reduced motion: 150ms cross-fade.
- Cursor: system cursor; a crosshair with a real-value readout only over set pieces.
- Hover: row hairline brightens, its figure settles. No lift, scale or glow.
- Do not: card grids, glass, gradients, grain, blob cursor, running tickers, fake prices or company names, numbered index, rotating headline, device mock-ups, ungraded or captioned stock, logos above 28px or altered, phone number, scroll-jacking on Home.

## 8. Build order
1. Shell (tokens, fonts, board nav, transition, route stubs) and Home with M1. Show the client.
2. Finance. 3. Model UN. 4. Academics. 5. Leadership. 6. Contact. Then screenshots at 1440, 834, 390 and QA.
Load Three.js only on `/model-un`; Home and Finance may use raw WebGL.

## 9. Media to source (content researcher)
Pexels, Pixabay, Coverr or Unsplash licence only; record source and licence in `content/research/assets.md`. All are landscape, dark, slow, no people in focus, no readable brands or tickers, and all are replaceable by the client's own media.

| ID | Page | Kind | Shows | Mood |
|---|---|---|---|---|
| M1 | Home | loop, 12 to 20s | financial-district skyline at night, slow aerial drift | high contrast, lights on black |
| M2 | Finance | loop, 10 to 15s | glass towers at night or blue hour, slow push-in | cold, precise |
| M3 | Model UN | loop, 10 to 15s | a row of national flags in slow motion | formal, slow |
| M4 | Model UN | still, 2400px | empty assembly hall or conference chamber | still, institutional |
| M5 | Academics | loop, 15 to 20s | above the clouds at dusk, from the flight deck or wing | calm, vast |
| M6 | Academics | loop, 8 to 12s | airliner on approach or turbine close-up | mechanical |
| M7 | Academics | still, portrait 1600 x 2000 | courthouse colonnade or archive stacks | classical |
| M8 | Leadership | loop, 12 to 15s | forest canopy, slow aerial (his roles are environmental) | quiet |
| M9 | Contact | still, 2400px | library shelves receding | warm, dim |
