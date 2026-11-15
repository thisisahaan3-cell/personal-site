# Creative directions: Ahaan Gupta

Three directions for the portfolio, then a comparison and a recommendation. Written by the creative director on 15 Nov 2026 from `CLAUDE.md`, `content/research/facts.md` and the first type study (`design/explorations/shots/00-type-specimens.png`).

## Ground rules that apply to all three

These hold whichever direction is built.

**Imagery.** We have one photograph (the portrait: navy blazer, pale blue shirt, pale columns, foliage). Everything else is original SVG, the Artha screenshot, and official logos used small and only to say where something took place.

**Real numbers only.** Every figure drawn on the site comes from the resume, with its qualifier intact. The series available to draw from:

| Series | Values |
| --- | --- |
| Delegate awards by year | 2023: 2 · 2024: 5 · 2025: 6 · 2026: 3 (cumulative 2, 7, 13, 16) |
| Delegate awards by level | Best Delegate 6 · High Commendation 4 · Special Mention 2 · Honourable Mention 2 · Runner Up 1 · Verbal Mention 1 |
| Academics | 99.4% in CBSE Grade X · consistent 96%+ · Scholar Badge six consecutive years from 2021 |
| Finance competitions | National Finance Olympiad 2025: AIR 10 (round 1), AIR 54 of 10,000+ (nationals) · SRCC Finance Olympiad 2025: AIR 46 · SRCC FIC fellowship: 100 chosen from 2,000 |
| Quizzing | SHRITEQ Tech Quiz 2026: 4th in the finals, 45 teams · Quiz to Conquer: semi-finals |
| Reading | 400+ books |
| Committees he has sat in or chaired | UNGA, UNSC, UNHRC, UNODC, ECOSOC, WHO, UNESCO, AAIB, CCC, FIA, AIPPM, Rajya Sabha |

A graphic that is not one of these is schematic: no axis values, no tickers, no lap times, no place names.

**Traps to avoid in any direction.**

1. No country names on MUN placards. The resume does not say which countries he represented. Placards carry committee names.
2. No drawn national borders. A world map with borders invites disputes over how India's are drawn. Geopolitics is shown with a graticule (meridians and parallels), great-circle arcs and unlabelled points.
3. No flight route between named airports. A Delhi to Chennai arc would imply he travelled for the IIT Madras courses, which is not known. Routes are schematic, with unnamed waypoints.
4. No real circuit outline labelled as a place he has raced or visited. The circuit is an invented schematic.
5. "AIR 10" always carries "round 1". "19+ awards" appears only as the resume's own summary line; the table shows its 16 rows.
6. The first type study prints Delhi coordinates as a label. Drop them. If a location label is wanted, it is "Gurugram", which the resume states.
7. Interest sections say what he has done (a course, a competition, a count) and leave the description as a marked placeholder. They never describe skill.

**Placeholders.** Empty biography and interest descriptions are set as a deliberate object in each direction (described per direction), never as lorem ipsum or grey boxes.

**Motion.** Transform and opacity only. Line drawing is done by revealing a clipped layer with a transform, not by animating `stroke-dashoffset`.

---

## Direction A: Almanac

**Idea.** The site is a single-subject reference volume: one person set out the way an almanac sets out a year, with plates, tables and marginal notes.

### Philosophy

His material is unusually tabular for a 16-year-old: a 16-row awards table, ranks out of stated fields, six consecutive years of one badge. An almanac is the form that treats tables as the main event instead of something to hide. It also gives a natural home to range: an almanac holds tides, stars and tax tables in one binding without anyone asking why. Each interest becomes a plate in the same book.

### Typography

| Role | Typeface | Use |
| --- | --- | --- |
| Display | Fraunces (variable: opsz 144, weight 340, SOFT 0), roman with italic for the surname | Name, section titles, plate titles, large numerals |
| Text | Hanken Grotesk 400/500 | Body, captions, table cells |
| Data | IBM Plex Mono 400/500 | Plate numbers, folios, table headers, figures in tabular alignment |

Display runs from 168px (name, desktop) down to 56px on phones. Body 17/28. Table figures are set in Fraunces at 28px, not mono, so the tables read as typography.

### Palette (light)

Light, because a printed reference is paper and because his portrait is warm and outdoor.

| Token | Hex | Role |
| --- | --- | --- |
| Paper | `#EFEADD` | Page ground |
| Ink | `#16181A` | Text, rules (14.8:1) |
| Margin | `#5E5A50` | Secondary text (5.7:1) |
| Rule | `#CFC8B6` | Hairlines, table rules |
| Oxblood | `#8C2B1E` | The one accent: plate numbers, the active timeline entry, links (7.1:1) |
| Bottle | `#1F4D3A` | Second ink, used only inside plates (8.0:1) |
| Panel | `#14171A` | The single dark element, the instrument strip |
| Amber | `#E8B04A` | Text on Panel only (9.2:1) |

### Layout

A 12-column grid with a fixed 2-column margin at the left that holds marginalia: folio numbers, plate numbers, dates. Content sits in the 10 columns to the right. Sections open with a full-width hairline and a running head, like chapter openers.

- **Hero, 1440.** The name in Fraunces across columns 3 to 12, two lines, surname in italic. The portrait is a tipped-in plate at the right, 4:5, about 360px wide, with a thin keyline and the caption "Plate I". Below the name, a single-row contents line listing the sections with dot leaders and folio numbers. A Panel strip at the foot carries three real figures.
- **Hero, 390.** Name stacked on two lines at 56px, portrait full width below it at 4:5, contents line becomes a two-column list, margin column collapses into inline labels above each block.

### Motion

- **Entrance.** The page rule draws across, the name sets line by line (each line rises 24px with opacity), the plate slides up 40px and settles, the contents line fades in last. About 1.8s.
- **Scroll.** Plates are pinned briefly while their figure assembles in three steps; text scrolls past in the adjoining columns. Marginal folio numbers tick over.
- **Signature interaction.** The awards table is sortable in place by year, level or committee. Rows reorder with a 400ms transform, the way a card catalogue reshuffles.
- **Reduced motion.** No pinning, no row travel. Content is present on load; sorting swaps instantly with a 150ms opacity change.

### Interests

All are numbered plates sharing one engraving style: 1px Ink strokes, Bottle fills at 12%, Oxblood for the single point of emphasis.

- **Finance.** Plate set as a broadsheet market page: a ruled table of his three competition ranks with the fields they came from, and a small-multiple of the 100-from-2,000 selection drawn as a dot matrix.
- **Aviation.** An approach-chart plate: concentric range rings, a schematic procedure turn, unnamed waypoint triangles. The IIT Madras Fundamentals of Aerospace course is the caption.
- **Law.** A case-report page: a centred heading, numbered paragraphs, wide margins with a sidenote rule. The placeholder text sits where the judgment would. Caption: IIT Madras Introduction to Law.
- **Quizzing.** An index plate: an alphabetical run of subject headings with cross-references ("see also") drawn as fine connecting arcs. One question at a time can be opened from the index.
- **Motorsport.** A circuit engraving, schematic, with sector marks and a three-row timing table left blank except for sector labels.
- **MUN and geopolitics.** A graticule plate with great-circle arcs, and the committee names set as a roll.
- **Reading.** A shelf: 400 fine vertical ticks in rows of 50, captioned "400+".

### Achievement timeline

A horizontal year rule, 2021 to 2026, pinned to the top of the section like a ruler. Entries hang beneath their year as almanac lines (date, event, result). Dragging or scrolling moves along the rule; selecting a year opens its entries as a table. Filters for academics, MUN, finance and service. On phones the rule turns vertical and sits in the left margin.

### Section order

Hero · About (Plate I and the placeholder biography) · Academic profile · Timeline · Model UN and public speaking (the awards table) · Leadership · Competitions and projects (Artha, Wharton) · Interests (Plates II to VIII) · Contact and resume.

### Risks

- Cream paper, a serif display, mono labels and a warm accent is the most common "tasteful" look of this year. Without rigorous plate drawing it reads as a template.
- A book metaphor ages the subject. He is 16; this could feel like a retrospective.
- Motion is the weakest fit. Books do not move, so the cinematic brief is served least well here.

---

## Direction B: Placard

**Idea.** Everything he has done is set in the language of public information systems: the conference placard, the departures board and the timing tower.

### Philosophy

Three of his six interests already share a visual language: the name card on a committee desk, the airport board and the F1 timing screen are all systems that state a fact in capitals, in a fixed slot, for a room full of people. That language suits a person whose record is made of speaking in rooms and ranks on boards. It is the most extroverted of the three directions and the youngest in tone.

### Typography

| Role | Typeface | Use |
| --- | --- | --- |
| Display | Bricolage Grotesque (variable: width 75, weight 700 to 800), capitals | Name, section titles, placard faces |
| Text | Newsreader 400, italic for asides | Body and long captions, a deliberate soft counter to the display |
| Data | Spline Sans Mono 400/500 | Board rows, slot labels, times and ranks |

Display runs very large: the name fills the measure at about 300px cap height on desktop, 96px on phones. Body 18/29.

### Palette (light ground, black boards)

| Token | Hex | Role |
| --- | --- | --- |
| Bone | `#F2F0EA` | Page ground |
| Black | `#0B0B0C` | Type and full-bleed board bands (17.3:1 on Bone) |
| Grey | `#5F5F5C` | Secondary text (5.6:1) |
| Line | `#D8D5CC` | Dividers |
| Signal | `#FFC400` | Wayfinding yellow: board highlights, the active state. Black on Signal 12.3:1. Never used as text on Bone |
| Cobalt | `#1F3FD6` | Placard face and links (6.7:1) |

Light page with black bands, because boards are dark and paper is not, and the alternation gives rhythm.

### Layout

A strict 8-column grid of large slots. Sections alternate between Bone pages and full-bleed Black boards. Everything aligns to slot edges; nothing is rounded.

- **Hero, 1440.** The name in condensed capitals across the full width, in two rows. The portrait is cut into the second row as a square-cornered slot at the right, three columns wide, sharing the baseline with GUPTA. Under it, a single board row that flips through three real facts. No index box.
- **Hero, 390.** AHAAN and GUPTA stacked, each filling the width. Portrait full-width below, cropped 1:1. Board row beneath at two lines.

### Motion

- **Entrance.** The board row flaps in character by character, then the name drops in row by row with a hard stop (no bounce), then the portrait slot opens with a vertical wipe. About 1.6s.
- **Scroll.** Sections change by a hard horizontal wipe between Bone and Black. Board rows flap as they enter the viewport, once.
- **Signature interaction.** The split-flap: hovering or tapping a board row flips it to its second face (conference to committee to award).
- **Reduced motion.** No flaps, no wipes. Rows show their final face; second faces are reachable by tap with a cross-fade.

### Interests

- **Finance.** A ticker band is the obvious move and is avoided. Instead a ranking board: three rows, his three competition results, with field sizes where the resume gives them.
- **Aviation.** The departures board, columns relabelled for his record (year, event, committee, result). Wayfinding pictograms drawn from scratch as section markers.
- **Law.** Weakest fit. A cause list: a court's daily list set in the same board grid, with placeholder rows.
- **Quizzing.** A buzzer round: one question fills a board, four answer slots, the correct slot turns Signal.
- **Motorsport.** A timing tower down the left edge of the section, with a schematic circuit at the right. Rows are labelled sectors only.
- **MUN and geopolitics.** The placard itself, Cobalt, at full width, cycling through the committees he has sat in. The 16 awards as a board.
- **Reading.** A counter: 400+ set as a mechanical tally.

### Achievement timeline

A departures board ordered by year. Each row is one entry (year, event, body, result). A year selector at the top works like a terminal selector; choosing a year flaps the board to that year's rows. Filters are column toggles. On phones each row becomes two lines and the selector becomes a horizontal scroller.

### Section order

Hero · Now (Wharton and GIC GITAM, both ongoing, as "boarding" rows) · Model UN and public speaking · Timeline board · Academic profile · Leadership · Competitions and projects (Artha) · Interests · About · Contact and resume.

### Risks

- Split-flap boards are a well-worn device. Two boards are charming; six are a theme park.
- The language favours aviation, motorsport and MUN. Law, finance and reading are forced into a board grid that does not suit them, which breaks the "one coherent system" test from the other side.
- Loud capitals at this scale work against the Apple-level restraint in the brief, and against a long placeholder biography, which would look lost.
- A huge grotesque name is the hero device of the reference site. Even on a light ground the family resemblance is uncomfortable.

---

## Direction C: Meridian

**Idea.** One hairline starts as the rule under his name and runs unbroken to the bottom of the page, becoming in turn a flight path, a price series, a margin rule, a circuit, a line of longitude and finally the underline of his email address.

### Philosophy

The brief asks for range inside one system, and warns against six microsites. This direction solves that structurally instead of stylistically: there is exactly one graphic element on the site and every interest is a shape it takes. Flight paths, price charts, circuit maps, graticules and ruled legal margins are all, in fact, lines. The idea makes no claim about him beyond what he told us, that he is curious about several fields; it says they connect. It is also the direction closest to an Apple product page: a calm near-white page, very large quiet type, one object that the scroll animates.

### Typography

| Role | Typeface | Use |
| --- | --- | --- |
| Display | Instrument Serif 400, roman and italic | Name, chapter titles, large numerals. Italic marks the surname and one emphasised word per chapter title |
| Text | Geist 400/500 | Body, captions, table cells, navigation |
| Data | Geist Mono 400/500 | Figures along the line, coordinates of the timeline, table headers. Used sparingly: never as decoration |

Instrument Serif has one weight, which is a discipline: hierarchy comes from size and space, not from bold. Scale: name 200px on desktop (clamped to the measure), 76px on phones; chapter titles 96/64/44; body 18/30; data 12/16 with 0.06em tracking, capitals. Law is the one chapter where the serif is also used at text size, for the case-document page.

### Palette (light, with one night chapter)

Drawn from the portrait: the navy of the blazer, the pale blue of the shirt, the pale stone of the columns.

| Token | Hex | Role |
| --- | --- | --- |
| Stone | `#F6F5F1` | Page ground |
| Navy | `#0F1B2D` | All text (15.8:1) |
| Slate | `#55606F` | Secondary text (5.9:1) |
| Hairline | `#D9D8D2` | Grids, table rules, graticules |
| Sky | `#E9EEF3` | Quiet fills behind a figure: the one tint |
| Line | `#E8451E` | The line, and nothing else. 3.6:1 on Stone, so it is never text |
| Line ink | `#B8330F` | The same hue for text: links, the active timeline label (5.5:1) |
| Night | `#0B1424` | Ground of the single dark chapter |
| Night text | `#E9EDF2` | Text on Night (15.7:1); secondary `#9AA6B5` (7.5:1) |
| Line on Night | `#FF6A3D` | The line on Night (6.5:1) |

Light, because the portrait is daylight, because Artha is light and should not look foreign in its case study, and because the reference site is dark. The one Night chapter (aviation and motorsport, where instruments and timing screens belong) is a single cinematic change of state, entered and left once.

### Layout

A 12-column grid, 1200px content width, 120px outer margins at 1440. The line has a home position, the "meridian": a vertical at the boundary of columns 1 and 2. It enters every section at the meridian and leaves at the meridian, so each section's drawing is self-contained and the continuity is real at every viewport. Between figures it runs straight down the meridian and carries the section's small data label.

Whitespace is the second material. Sections are 160 to 240px apart; a figure is never crowded by a second figure.

- **Hero, 1440.** Stone ground. "Ahaan" and "*Gupta*" set in Instrument Serif on two lines, left-aligned from column 2, about 200px. The portrait sits at the right in columns 9 to 12, 4:5, square corners, its top edge aligned to the x-height of "Ahaan" and its bottom running past the fold. The line begins as a short rule under the name, runs right, passes behind the portrait, reappears, turns down and settles on the meridian. One line of Geist below the name: "Grade 11 (Commerce), Lotus Valley International School, Gurugram". No tagline, no typed text, no index.
- **Hero, 390.** The name on two lines at 76px from a 20px margin. The portrait below at full bleed to the right edge, 4:5, inset 56px from the left so the meridian runs down the left margin beside it. The meridian sits 20px from the left edge for the whole page and figures are drawn in a full-width band between text blocks, never beside text.

### Motion

- **Entrance (about 2.2s).** Blank Stone. The line draws left to right as a rule. The name rises out of it, masked by the rule, one word then the other. The line continues behind the portrait as the portrait fades up with an 8% scale settle, then turns down to the meridian and stops with a small dot, inviting the scroll.
- **Scroll.** The line draws in step with scroll position. Each figure is revealed along its path over about 70% of a viewport of travel, with its labels fading in as the line passes them. Text reveals are a 24px rise with opacity, staggered by line. Parallax is limited to the portrait and the Artha screenshot (at most 40px).
- **Signature interaction.** The line itself. In each figure the line responds to the pointer or finger in one way suited to the figure: the chart shows the value under the pointer, the circuit carries a dot around the lap, the graticule rotates a few degrees, the timeline scrubs.
- **Section transitions.** The change into and out of Night is a full-width wipe that follows the line's direction of travel.
- **Reduced motion.** The line is fully drawn on load in every section. No scroll-linked drawing, no parallax, no wipe; Night simply begins. Hover and tap states remain as 150ms opacity changes. Nothing is hidden behind an animation.

### Interests

Each is a chapter in which the line takes one shape. Each chapter has the same three parts: a title in Instrument Serif, the figure, and a short text block holding the facts and the marked placeholder.

- **Finance.** The line becomes a stepped series plotting real data: cumulative delegate awards by year (2, 7, 13, 16), set like a financial editorial chart with a Hairline grid and Geist Mono axis labels. Beside it, his three finance competition results as a ruled table, and the Artha case study. This is the one chart with values, because the values are his.
- **Aviation (Night).** The line becomes a schematic route: a departure curve, unnamed waypoint triangles, a holding pattern, range rings in Hairline. A heading tape along the top edge in Geist Mono is the single instrument reference. Fact: IIT Madras, Fundamentals of Aerospace, 2025.
- **Motorsport (Night).** The route closes into a schematic circuit. A dot runs the lap; three sector marks; a telemetry trace below it drawn by the same line, with no values. Fact: Formula 1 is listed as an interest in the resume, and that is all that is said.
- **Law.** Back to Stone. The line becomes the vertical margin rule of a case-document page: numbered paragraphs, a centred heading in Instrument Serif capitals, sidenotes. The placeholder description is set as the document's body. Fact: IIT Madras, Introduction to Law, 2026.
- **Quizzing.** The line threads a constellation of subject nodes (the other interests, plus general knowledge) and stops on one. A single question is asked; choosing an answer sends the line to the next node. Questions are general-knowledge facts supplied and verified by the content researcher. Facts: SHRITEQ Tech Quiz 2026, 4th in the finals, 45 teams; Quiz to Conquer semi-finals.
- **MUN and geopolitics.** The line becomes a meridian on a graticule drawn in Hairline, with great-circle arcs. Below it stands one placard, drawn flat, whose face changes through the committees he has sat in. The 16-row awards table lives here as the "record", in the document style.
- **Reading and tennis.** A coda. The line runs horizontally and 400 short ticks stand on it like spines on a shelf, labelled "400+ books". For tennis the line makes one right angle, the corner of a court, and moves on.

### Achievement timeline

The line turns horizontal and becomes the axis. Years 2021 to 2026 are marked on it; entries sit above and below as short stems with a label. The section pins and scroll moves the axis sideways; on desktop it can also be dragged, and arrow keys step between entries. The selected entry enlarges into a detail panel with the event, body, result and logo. Filter chips (plain text, underlined when active) for Academics, MUN and debate, Finance, Service. Six consecutive Scholar Badges read as six evenly spaced marks, which is the point of drawing them. On phones the axis is the meridian itself, vertical, and entries are a simple list along it with no pinning. With reduced motion it is a static vertical list.

### Section order

Hero · About (portrait continues, placeholder biography set as a ruled statement block) · Academic profile (99.4% as the first large numeral) · Timeline · Model UN and public speaking, with geopolitics (the record) · Leadership and positions · Competitions and projects, with finance (Artha case study, Wharton ongoing) · Night: aviation, motorsport · Law · Quizzing · Reading and tennis · Contact and resume, where the line ends under the email address.

The interests are therefore not a separate section. Three of them are attached to the résumé sections they belong with; the rest follow as short chapters.

### Placeholders in this direction

A placeholder is a ruled block with a small Geist Mono label, "In Ahaan's words, to come", and three Hairline rules where the text will sit. It looks like a form waiting for a signature, which is honest.

### Risks

- If the line is thin on ideas it becomes a scroll gimmick. Each figure must be drawn to the standard of an illustration, and there must be few of them.
- Continuity across breakpoints is the engineering risk. The meridian rule above is what makes it tractable; if sections ignore it the line will visibly break.
- A near-white page with a serif and one accent can drift into a generic "minimal" site. The figures and the size of the type are what prevent that; if either is timid the direction fails.
- Instrument Serif has no bold and a small character set. Check the glyphs needed (%, +, ·, en dash) before committing.

---

## Comparison

| | A: Almanac | B: Placard | C: Meridian |
| --- | --- | --- | --- |
| Fit with "Apple product page, adapted to a person" | Moderate: editorial, but static | Low: loud | High: calm page, one animated object |
| Interests carried by the design | Yes, as plates in one style | Three fit well, three are forced | Yes, as shapes of one element |
| One coherent system | Yes | Yes for half the content | Yes, by construction |
| Handles the data tables | Best | Good | Good (borrows A's table manners) |
| Cinematic motion | Weak | Strong but mechanical | Strong and quiet |
| Distance from the reference site | Far | Too close in hero device | Far |
| Tone for a 16-year-old | Slightly old | Right age, less serious | Serious without being old |
| Mobile | Easy | Easy | Needs the meridian discipline |
| Main risk | Looks like this year's default | Theme-park boards | Line as gimmick; build difficulty |

## Recommendation: Direction C, Meridian

Build Meridian.

1. **It answers the brief's hardest requirement directly.** Six interests, one system, no cards. The line is one element, so coherence is built in.
2. **It is the closest to the stated quality bar.** A quiet light page, very large serif type, generous space and a single scroll-driven object is how an Apple page behaves.
3. **It uses the portrait honestly.** The palette comes from the photograph, and the photograph is the only warm thing on the page.
4. **It looks nothing like the reference** (light, serif, portrait right, no index, no neon) while keeping the one thing the client liked about it.
5. **It makes no claims.** A line connecting fields says "these interest me". A plate or a board invites the reader to assume expertise.
6. **Artha sits naturally in it.** Artha is light and serif-headed; its screenshot will look like part of the same world.

Two things are taken from the other directions. From Almanac: its table manners (ruled rows, large serif figures, sortable awards record) for the MUN record and the finance results. From Placard: exactly one placard, in the MUN chapter. No split-flap boards.

Conditions on the build: the meridian rule for line continuity; transform-and-opacity reveals only; at most eight figures on the page; the line colour is never used for text.

## Open questions for the client (none block the build)

- What "19+ awards" counts, given 16 table rows.
- The Grade X year ("2025–26" in the resume).
- Biography, personal statement and a sentence on each interest.
- Any Wharton and GIC GITAM details he wants shown.
- Whether tennis should appear beyond one line.
