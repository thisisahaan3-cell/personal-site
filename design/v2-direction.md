# V2 direction: Price Discovery

## 1. Identity
- Idea: a market finds a price by letting noise settle into one exact figure. The site does that to him: candlesticks settle into his face, then into his real numbers.
- Why it fits: finance is his lead field and his record is numerical (99.4%, AIR 54 of 10,000+, 100 of 2,000, 16 awards).
- One motion verb for the whole site: **settle**. Things jitter, overshoot slightly, lock. Nothing floats, glows or bounces.
- Palette is taken from the portrait: blazer navy, shirt blue, warm skin light as amber.
- What a visitor remembers: his face drawn entirely in candlesticks, closing like a market.

## 2. Tokens
Colour (dark everywhere; only ground family and lead accent shift per page):

| Role | Navy: Home, Finance, Contact | Petrol: Model UN | Umber: Academics, Leadership |
|---|---|---|---|
| ground | `#0A101C` | `#081619` | `#12100E` |
| raised | `#111A2B` | `#0F2227` | `#1C1915` |
| hairline | `#243049` | `#1F3A40` | `#332D25` |
| text | `#E8EDF6` | `#E8EDF6` | `#EFE9DD` |
| secondary | `#8D9AB3` | `#8FA5A8` | `#A39A8A` |
| lead accent | amber `#F2A541` | shirt blue `#9CB9EA` | amber `#F2A541` |

Also: down-candle `#4E6792`. Amber means "his figure" and nothing else. No gradients, shadows or blur.

Type (`next/font/google`, all verified present): display **Bodoni Moda** (variable, `opsz` 96 for display, weight 500), text **Schibsted Grotesk**, figures **Martian Mono** (`wdth` 80, tabular; figures and dates only, never labels). Sentence case everywhere; no all-caps eyebrows.

Scale (desktop / phone): display-xl `clamp(52px, 11vw, 176px)` lh 0.9, -0.02em (name, hero figures); display-l `clamp(44px, 7vw, 112px)` (page titles); heading 40 / 28 (Bodoni never below 28px); lead 21 / 18; body 17 / 16, lh 1.6, max 62ch; small 14; figure 15 / 13.

Grid 12 col, 24px gutter, 64px margin (20px phone). Spacing 4, 8, 16, 24, 40, 64, 104, 168. Radius 0. Focus: 2px accent outline, 3px offset.
Motion: 120ms hover, 300ms settle, 600ms reveal, 900ms page transition cap, 2.9s home intro. Easings: `settle` cubic-bezier(0.2, 1.3, 0.3, 1); `glide` cubic-bezier(0.16, 1, 0.3, 1). DOM animates transform and opacity only.

## 3. Site map
Routes: `/`, `/finance`, `/model-un`, `/academics`, `/leadership`, `/contact`. Only Home is locked to one screen; other pages open on a full-height set piece, then a short ruled record (about three screens at most).

Navigation, "the board": desktop is a fixed top strip, name at left (home), five destinations at right, amber tick under the current one, "Download resume" last. Phone is a fixed bottom bar (name, Menu) opening a full-screen board: five rows, Bodoni name left, one real figure right.

| Page | Content from `site.ts` |
|---|---|
| Home | `identity`, `hero.descriptor`, four `stats` on the buttons (`nfo`, `delegateAwards`, `gradeX`; Leadership has label only) |
| Finance | `competitions` with domain finance and pitch (NFO, SRCC Olympiad, SHISFEST first position, Wharton, GITAM), SRCC fellowship from `experience`, `projects` (Artha) |
| Model UN | all of `mun`: 3 Executive Board roles, 2 parliamentary programmes, 16 awards; stat `conferences` |
| Academics | `education`, `courses`, academic and quiz `competitions` (SOF, SHRITEQ, Quiz to Conquer, HCL), `quiz`; `otherCompetitions` as one collapsed "More competitions" line list at the foot |
| Leadership | `leadership`, remaining `experience` (internships, NGO), `timeline`, `skills` as one line |
| Contact | `about.profile`, `contact`, `social`, resume, `interests` as one line, stat `books` |

Placeholders: fields with `placeholder: true` are not rendered, except three single secondary-colour lines marked with a small hollow square: Wharton details, GITAM details, one "About" slot on Contact. They appear automatically when filled. Stat `awardsSummary` (19+) is not shown until he confirms what it counts.

## 4. Home intro
One screen, `100svh`, no scroll. Left: name in display-xl on two lines, bottom-left, overlapping the field edge; below it `hero.descriptor`. Right 46% of width, full height, bleeding off the bottom: the **candle portrait**. Foot: one hairline-ruled row of four destinations (Bodoni name, mono figure) plus Contact.

Candle portrait: WebGL, one instanced draw call. Portrait sampled to a 96 x 128 grid (12,288 candles) from an alpha-matted copy (engineer makes `portrait-matte.webp` once, 12px feather; background cells stay empty). Each cell is a candle: body height 15% to 100% of the cell by luminance, brightness by luminance, wick at 35% alpha; "up" (text colour) if brighter than its left neighbour, else "down" (`#4E6792`). Every row is a chart of the photo's brightness. No axes, tickers or prices.

- 0s: empty ground, one amber hairline at 62% height. A schematic 96-candle series (seeded random walk, unlabelled) draws left to right along it.
- 1.0s: series spans the screen. Name starts a masked rise. Each candle splits into its 128 cells, which travel to grid positions while the columns compress into the portrait rectangle (1.0 to 2.2s, 6ms column stagger, `glide`).
- 2.5s: heights settle from random values to luminance with one damped overshoot (2.2 to 2.9s); the face resolves. Descriptor and destination row fade in, 60ms stagger.
- At rest: each candle breathes ±4% on its own slow phase; every 7s an amber "last print" passes left to right, one column at a time, 80ms each.
- Pointer: a crosshair (two hairlines) tracks it. Within 120px candles swell to fill their cells and take the photo's true colour, so the pointer is a lens onto the real photograph. Fast movement stretches candles within 220px (volatility), decaying over 600ms. Click replays scatter and settle in 900ms.
- Hovering a destination: its figure settles (digit roll), an amber rule draws under it.

Phone: field on top, flexible height (min 40svh), 56 x 75 grid; name on one line at 52px over the field's lower edge; descriptor; four 48px destination rows. Touch drag is the lens; after 4s idle the lens drifts slowly across the face by itself.
Reduced motion, no WebGL or no JS: a pre-rendered still of the settled field (`portrait-candles.webp`, with `portraitAlt`); no intro, no breathing; the lens still works where WebGL exists. Cap DPR at 2; pause when hidden.

## 5. Set pieces
**Finance, "The field".** WebGL points, real numbers drawn to scale, stepped with buttons, arrow keys or swipe. Step 1: 10,000 points ("10,000+ participants, drawn as 10,000") collapse to a ranked column, 54th lit amber: AIR 54; a note gives Round 1 AIR 10. Step 2: 2,000 points, 100 stay lit: the SRCC fellowship. Step 3: SRCC Finance Olympiad AIR 46, shown as position 46 on a rule with no pool (none stated). Step 4: SHISFEST, first position. Points reflow between steps and part softly around the pointer; the crosshair reads the rank under it. Below: Artha as two large screenshots (desktop and phone, slight parallax on pointer, link out), then Wharton and GITAM as "ongoing" rows with a slow amber pulse. Phone: 2D canvas, fewer points with the scale stated, swipe to step.

**Model UN, "The chamber".** Three.js hemicycle: 16 placards on the floor (one per award, brightness by level), 3 on the dais (Executive Board roles, where a board actually sits), 2 on a side bench (parliamentary programmes). Only real seats exist. Camera drifts slowly; drag orbits ±25 degrees; hover or tap raises a placard showing conference, committee, award, year as written; filter by year or level dims the rest. Headline: "16 delegate awards, 6 Best Delegate". Full docket list below. Phone: SVG plan view, tappable seats, same list. No globe, no arcs: nothing may imply travel.

**Academics, "The tape".** SVG cockpit-style vertical tape instrument reading percent: it rolls up and settles on 99.4, with a fixed bug at the 96%+ floor and six Scholar Badge marks for 2021 to 2026. Only those real values; no invented yearly marks. Beside it "99.4%" in display-xl. Dragging the tape springs back. Phone: tape runs horizontally under the figure.

**Leadership, "Stints".** SVG lanes on a 2013 to 2026 time axis: school, elected roles, work. Bars use the stated dates at their stated precision (year-only bars have soft ends); undated entries are listed below, not placed. A playhead sweeps once on load; drag it or tap a bar to open that entry's detail. Phone: lanes scroll horizontally with snap. This satisfies the interactive timeline.

**Contact.** The candle portrait at half size, settled; email in display-l; "400+ books" drawn as a row of 400 hairline spines.

Leave one empty, sized media slot per page (Finance, Model UN, Leadership) for photos or clips he may send; render nothing until filled.

## 6. Interests without sections
- Finance: the whole system (candles, settle, crosshair).
- Aviation: the nav board and split-flap transition; the Academics tape; substance only in the IIT Madras aerospace course entry.
- Law: `courses` and the Model UN list are set as a docket (Bodoni, ruled, date in the margin); substance only in the IIT Madras law course entry.
- Quizzing: `quiz` as one question at a time beside his quiz results on Academics; answer, then the source link shows.
- Motorsport: the stint-chart form only. Formula 1, tennis and reading are named once in the Contact interests line. No descriptions, no expertise language.
- Geopolitics: the chamber. Committee names stay exactly as written.

## 7. Transitions, cursor, do-not
- Page transition: page fades to ground (200ms), one centred split-flap line settles on the destination name (450ms), set piece begins. Reduced motion: 150ms cross-fade.
- Cursor: system cursor; a crosshair with a real-value readout only over set pieces.
- Hover: row hairline brightens, its figure settles. No lift, scale or glow.
- Do not: card grids, glass, gradients, grain, blob cursor, running tickers, fake prices or company names, numbered index, rotating headline, device mock-ups, logos above 28px or altered, phone number, scroll-jacking outside Home.

## 8. Build order
1. Shell (tokens, fonts, board nav, transition, route stubs) and Home. Show the client.
2. Finance. 3. Model UN. 4. Academics. 5. Leadership. 6. Contact. Then screenshots at 1440, 834, 390 and QA.
Load Three.js only on `/model-un`; Home and Finance may use raw WebGL.
