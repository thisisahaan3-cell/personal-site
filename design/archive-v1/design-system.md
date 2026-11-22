# Meridian: design system

Approved by the creative director, 15 Nov 2026; amended after review 1 on 16 Nov 2026 (section 0.1, read it first). This is the only document the frontend engineer builds from. Content comes from `src/content/site.ts`; nothing in this file is copy unless it is listed under "Interface strings" (section 9).

**The idea in one paragraph.** One hairline, "the line", enters the page from off the right edge, runs under his name, turns down and travels to the bottom of the page, where it ends as the underline of his email address. Its home is a fixed vertical, "the meridian", near the left edge. In eight places it leaves or changes meaning and becomes a figure: a time axis, a meridian of a globe, two ranked fields, a flight route, a circuit, the margin rule of a legal document, a constellation of quiz subjects, a stack of 400 books. Everything else is a calm, pale page with very large serif type and ruled tables. The line is the one bold thing. Keep everything around it quiet.

## 0. Amendments to `directions.md`

These override the directions file where they differ.

1. **Hero line direction.** The line enters from the right viewport edge, passes behind the portrait, runs left under the name and turns down onto the meridian. (The meridian is on the left and the portrait on the right, so a left-to-right rule could not reach it without a switchback.)
2. **Finance figure.** The cumulative delegate-award series (2, 7, 13, 16) leaves the finance chapter. It becomes a by-year tally strip above the awards record in the MUN chapter. The finance figure now draws only finance facts: rank 54 in a field of 10,000+ and 100 chosen from 2,000 (section 3.7).
3. **Italic rule.** No single emphasised word in chapter titles. Roman is the record, italic is an interest: résumé chapters are titled in roman, the name of every interest is set wholly in italic, and the name is "Ahaan" roman, "*Gupta*" italic.
4. **Data labels.** Geist Mono, sentence case, never capitals, and only for data (years, ranks, counts, scale values, column heads). No eyebrow label above headings.
5. **Text reveals.** Only three things reveal on scroll: the line and its figures, chapter titles, and figure labels. Body text, tables and lists are never animated in.
6. **Motorsport.** The telemetry trace is a secondary element, not drawn by the line. No timing table.
7. **MUN figure.** The globe is centred on the meridian so the line is its central meridian. No great-circle arcs, no points.
8. **Reading.** The books are a vertical stack on the meridian, not a horizontal shelf. The tennis court corner becomes a small court traced on three sides. (The court was removed in review 1; see 0.1.)

## 0.1 Amendments from review 1 (16 Nov 2026)

From `design/reviews/2026-11-16-review-1.md`. Where a line in sections 2 to 5 differs from this list, this list wins. Sections 1.1, 2.6, 2.7, 5.1, 8.1 and 8.2 have been edited in place.

1. **Line ink.** `line-ink` is used only for the selected entry's title on the horizontal timeline. Inline links are navy (2.7).
2. **Placeholders.** Three forms; the single-row placeholder line is the default (2.6).
3. **Logos (2.5, 2.8).** In any table an organisation's tile appears once, on the first row that names it. No tile on the Rasmanjari row or the Lotus Young Leaders Summit row.
4. **Date notes (1.4, 3.5).** On desktop the Leadership tables have no visible head row and no Period column. The period hangs in the note column in `data` navy, right-aligned to meridian − 12, at most 132px wide and two lines, beside a 12px line-colour tick across the meridian. Role and organisation in columns 3 to 7, points in columns 8 to 11. Tablet and phone: the period is the row's first line, 8px above the role.
5. **Academic profile (3.2).** Row 2 is two parts: institution in `title-2` with the period beneath, columns 3 to 7; the ruled list of `education.current`, `education.consistency` and honours 1, 3 and 4 in columns 8 to 12, aligned with the list beside the numeral.
6. **MUN summary (3.4 item 2).** Not three figures in a row. "16" in `numeral` type with its captions at column 3; from column 8 a two-row ruled list: "20+" and "19+" in `table-figure`, each with its stat label.
7. **MUN, Geopolitics column (3.4 item 3).** Desktop: placeholder line, placard and roll all span columns 7 to 11. Tablet: the block sits beside the globe in tablet columns 3 to 6, 64 below the globe's top, placard 148 high; at least 32px between the globe's limb and the column. Committee roll: uniform 24px gaps, no minimum button width.
8. **MUN record (3.4).** Group rows carry the group's value in `title-2` and the count beside it in `data` slate ("3 awards"), 64 above (32 above the first), 16 below. Column widths are fixed in every state.
9. **Finance (3.6).** No arrow: the fellowship figure reads "100 of 2,000". The "Finance and economics" placeholder line sits 32 below the "Finance" heading, before figure 3. Phone scale runs from x = 28 to x = 288. On the lower run the labels "100" and "cohort of 100" sit to the right of the raised step. The Artha phone screenshot shares the desktop screenshot's left edge and overlaps its bottom edge by 64, hanging below it.
10. **Night (3.7, 5.2).** `night-mark` for waypoints, station circle, cross-ticks and tape ticks. Range rings have radii 100, 200 and 300. The first tape label is fully visible at rest. "Sector 2" sits inside the loop, 16px clear of the band. The first Night chapter's top space is 2x the chapter gap including the 240 of 5.2; the last one's bottom space is 1x the chapter gap. The Aviation placeholder line sits under the evidence list in columns 3 to 8. The phone circuit is the engineer's six-corner drawing, approved.
11. **Law (3.8).** Six empty ruled lines follow the paragraph 2 label. No minimum height.
12. **Quizzing, phone (3.9).** No label beside a node. The current subject's name is printed once in `small` navy at the figure's top left (content-left edge, baseline 30 below the figure top), at least 8px clear of every run and ring.
13. **Reading (3.10).** The court is removed; the line runs straight from the stack to Contact, and "*Tennis*" (heading, stated-interest sentence, placeholder line) sits at column 3, 96 below the stack. Marks keep their full lengths. Counts: desktop in the note column, right-aligned to meridian − 12; tablet left-aligned at x = 104; phone at x = 76.
14. **Timeline (4.1).** A year inside the Scholar Badge span that has no events is a bay of its own (64 wide, tick, label, ring). At the end of the pin, "In progress" stays at opacity 0 until the last entry reaches the reading mark; over the next 120px of travel the detail panel fades out, and over the following 120px "In progress" fades in (scroll-linked). Focusing an entry before the pin scrolls to the pin start plus that entry's offset.
15. **Hero entrance (5.1).** The portrait's frame is opaque stone from first paint; the name's mask ends 8px above the rule.

## 1. Tokens

### 1.1 Colour

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `stone` | `#F6F5F1` | Page ground | |
| `navy` | `#0F1B2D` | All primary text, primary button, placard face | 15.8:1 on stone |
| `slate` | `#55606F` | Secondary text, data labels | 5.9:1 on stone, 5.5:1 on sky |
| `hairline` | `#D9D8D2` | Rules, grids, secondary figure elements, borders | decorative |
| `sky` | `#E9EEF3` | The one tint: row hover, fill under a figure element | navy on sky 14.8:1 |
| `white` | `#FFFFFF` | Logo tiles only | |
| `line` | `#E8451E` | The line, and dots and ticks that sit on it. Nothing else | 3.6:1, never text |
| `line-ink` | `#B8330F` | One use only: the title of the selected entry on the horizontal timeline | 5.5:1 on stone |
| `navy-hover` | `#1C2B44` | Primary button hover layer | stone text 13.0:1 |
| `night` | `#0B1424` | Ground of the Night chapter | |
| `night-text` | `#E9EDF2` | Text on night | 15.7:1 |
| `night-slate` | `#9AA6B5` | Secondary text on night | 7.5:1 |
| `night-hairline` | `#263349` | Rules, rings, track band on night | decorative |
| `night-mark` | `#55657F` | Small secondary marks on night that must be seen: waypoints, station circle, cross-ticks, tape ticks | about 3:1, never text |
| `line-night` | `#FF6A3D` | The line on night | 6.5:1 |

No other colours, no opacity tints of these except where stated, no gradients, no shadows, no blur. `::selection` is sky on stone, night-hairline on night. `<meta name="theme-color">` is stone.

### 1.2 Type

Families, all through `next/font/google`, `display: swap`, `latin` subset:

- **Display**: Instrument Serif 400, roman and italic. Variable `--font-display`. Fallback `Georgia, serif`.
- **Text**: Geist 400 and 500. `--font-text`.
- **Data**: Geist Mono 400 and 500. `--font-data`.

Instrument Serif has one weight. Never synthesise bold or italic (`font-synthesis: none`). Hierarchy is size and space.

**Numeral rule.** Before building, confirm Instrument Serif contains `%`, `+`, `,`, `.`, `–`, `@` and `’`. If any is missing, set that one character in Geist 400 at 0.78em, baseline aligned, and tell the creative director. Never let the browser substitute a fallback serif. Arrows and middle dots are not used anywhere in the interface.

Scale. Sizes are fluid between 390 and 1440 and fixed outside.

| Token | Family | 390 | 834 | 1440 | `font-size` | Line height | Tracking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `name` | Display | 76 | 128 | 200 | `clamp(76px, 29.94px + 11.81vw, 240px)` | 0.86 | -0.02em |
| `title` (h2) | Display | 44 | 66 | 96 | `clamp(44px, 24.69px + 4.952vw, 96px)` | 1.0 | -0.015em |
| `numeral` | Display | 88 | 118 | 160 | `clamp(88px, 61.26px + 6.857vw, 160px)` | 0.9 | -0.02em |
| `email` | Display | 26 | 52 | 88 | `clamp(26px, 2.97px + 5.905vw, 88px)` | 1.0 | -0.01em |
| `title-2` (h3) | Display | 30 | 38 | 48 | `clamp(30px, 23.31px + 1.714vw, 48px)` | 1.08 | -0.01em |
| `statement` | Display | 26 | 34 | 44 | `clamp(26px, 19.31px + 1.714vw, 44px)` | 1.18 | -0.005em |
| `table-figure` | Display | 24 | 27 | 32 | `clamp(24px, 21.03px + 0.762vw, 32px)` | 1.15 | 0 |
| `document` | Display | 19 | 20 | 22 | `clamp(19px, 17.89px + 0.286vw, 22px)` | 1.5 | 0 |
| `lead` | Text 400 | 19 | 20 | 22 | `clamp(19px, 17.89px + 0.286vw, 22px)` | 1.45 | -0.005em |
| `body` | Text 400 | 17 | 18 | 18 | 17px below 768, 18px above | 30px (28px at 17) | 0 |
| `small` | Text 400 | 14 | 15 | 15 | 14px below 768, 15px above | 1.5 | 0 |
| `label` | Text 500 | 14 | 15 | 15 | as `small` | 1.3 | 0 |
| `data` | Data 400 | 12 | 12 | 13 | 12px below 1100, 13px above | 16px | 0.02em |

Rules: sentence case everywhere; no capitals except acronyms from the resume (UNGA, CBSE, AIR). Text measure never exceeds 62 characters (`max-width: 34rem` on body blocks). Left aligned throughout; the only centred text is the placard face and the heading inside the Law document. `font-variant-numeric: tabular-nums` on `data` and on year and rank cells. `text-wrap: balance` on `title`, `title-2` and `statement`.

### 1.3 Spacing

Scale in px: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 200, 240. Use only these.

- Space between chapters (`--chapter-gap`): `clamp(96px, 57.37px + 9.905vw, 200px)` (96 / 140 / 200), applied as top padding of each chapter. Night's first and last chapter add the same again inside the night ground.
- Title to first content: 64 desktop, 48 tablet, 32 phone.
- Between blocks inside a chapter: 96 desktop, 64 tablet, 48 phone.
- A figure has at least 96 (desktop) or 48 (phone) of clear space above and below. Two figures never share a viewport edge.

### 1.4 Breakpoints, grid and the meridian

| | Phone | Tablet | Desktop |
| --- | --- | --- | --- |
| Range | below 768 | 768 to 1099 | 1100 and above |
| Reference width | 390 | 834 | 1440 |
| Outer margin | 20 | 40 | `clamp(64px, 8.333vw, 120px)`; container max 1200, centred |
| Grid | content area in 4 columns, 12 gutter | content area in 6 columns, 20 gutter | 12 columns, 24 gutter (78 wide at 1440) |
| **Meridian x** | **20** | **40** | **left margin + one column + 12** (210 at 1440, 158 at 1100, 450 at 1920) |
| Content area | 44 to (vw − 20): 326 wide | 88 to (vw − 40): 706 wide | columns 3 to 12: 324 to 1320 at 1440 (996 wide) |
| Note column | none | none | column 1, left of the meridian, text right-aligned to meridian − 12 |
| Figure box | meridian to (vw − 20): 350 wide | meridian to (vw − 40): 754 wide | meridian to right content edge: 1110 wide at 1440 |
| Figure drawing used | phone | desktop | desktop |

Expose `--meridian-x`, `--content-left`, `--content-right` as CSS variables and use them everywhere; never hard-code 210. On desktop column 2 (between the meridian and the text) stays empty except where a figure crosses it and in the Law chapter. Column positions at 1440: column *n* starts at 120 + (n − 1) × 102.

### 1.5 Radii, rules, layers

- Radius: 0 everywhere. The only curves are in the line and its figures.
- Rules: hairline 1px. Table head rule 1px navy. The line 1.5px (`vector-effect: non-scaling-stroke` in SVG), round caps and joins. Line turns that are routing (not data) use a 24px fillet on desktop, 16px on phone.
- Dots on the line: 7px diameter, filled line colour. Rings: 9px diameter, 1.5px line-colour stroke, ground-colour fill.
- Z-layers: 0 ground and night ground; 1 the line; 2 content, images and figure labels; 3 pinned timeline stage; 10 navigation bar; 20 contents overlay; 30 skip link.

### 1.6 Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-fast` | 150ms | Hover, focus, panel cross-fades, reduced-motion state changes |
| `--dur-base` | 300ms | Underline wipes, placard face change, nav show and hide, overlay |
| `--dur-move` | 400ms | Table row reorder, quiz dot travel between nodes |
| `--dur-title` | 800ms | Title and name mask rise |
| `--dur-draw` | 900ms | Timed line draws (entrance, axis) |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Anything arriving: titles, labels, overlay rows |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Line draws, wipes, row reorder, dot travel |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover and focus |
| scroll-linked | linear | Everything tied to scroll position |
| Stagger | 120ms name words; 80ms title lines; 60ms figure labels; 30ms overlay rows | |

Distances: title mask rise 100% of its own line height; label fade has no movement; parallax at most 40px in total.

## 2. Global components

### 2.1 The line system

This is the part most likely to go wrong. Rules:

1. **One path.** From the hero to the contact chapter the line is continuous. It never branches and nothing else is drawn in its colour. It is built from pieces: straight **spine segments** on the meridian (a 1.5px element per stretch) and **figures** (one inline SVG each).
2. **Figures enter and leave on the meridian.** Every figure SVG is placed in the figure box (1.4) so that viewBox x = 0 is the meridian. The path starts at (0, 0) and ends at (0, H). The SVG is `width: 100%` of the figure box, height from its aspect ratio (`preserveAspectRatio="xMinYMin meet"`, `overflow: visible`). Spine segments run from the bottom of one figure to the top of the next. Continuity therefore holds at every width without measuring anything.
3. **Labels are HTML.** Figure labels are HTML elements positioned over the figure in percentages of its box, in the type tokens. Never SVG text that scales with the viewBox.
4. **Reveal by wipe, not dash.** A figure's line is revealed by a clip wrapper: wrapper `overflow: hidden` translated by −(1 − p) × 100% along the wipe axis, its child translated by +(1 − p) × 100%, so the drawing stays still while the window opens. The wrapper is 12px larger than the figure on every side so strokes lying on the meridian are not cut. Spine segments reveal with `scaleY` from `transform-origin: top`. `stroke-dashoffset`, `clip-path` and SVG attribute animation are not used.
5. **The draw head.** The line is drawn down to a head that sits at 70% of the viewport height: a spine segment's `scaleY`, or a figure's progress p, is (head − top) / height, clamped 0 to 1. Each figure states its wipe axis. Secondary elements (hairline grids, rings) fade in with opacity over the first 30% of p; labels fade in (`--dur-base`, 60ms stagger) when p passes their x or y.
6. **Drawn stays drawn.** Progress only increases. Scrolling up never un-draws; jumping to a chapter from the contents completes every piece above it at once.
7. **The complete state is the default.** In CSS, with no JavaScript, everything is fully drawn and visible. JavaScript sets the start states, and only when motion is allowed.
8. **Layering.** The line sits above the ground and below content. It passes behind the portrait and never crosses text.
9. **Night.** Inside the night ground the line is `line-night`, same weight. The colour changes exactly at the ground's edge because each chapter owns its pieces; the piece that crosses the edge is split there.
10. **Ends.** The start is off-screen (no dot). The end, under the email address, is a 7px dot. The hero's descent pauses on a dot at the end of the entrance; that dot is removed once scrolling starts.

### 2.2 Navigation

One mechanism at every size: a slim bar and a full-screen contents page.

- **Bar.** Fixed, 64px high (56 on phone), page margins. Over the hero it has no ground and no rule and shows only the right-hand items. Once the hero name has left the viewport it gains a stone ground with a hairline bottom rule and shows the wordmark at the left: "Ahaan *Gupta*" in Display 22px (20 on phone), a link to the top. Right-hand items, `label` type: the current chapter's title in slate (desktop and tablet only; cross-fades in `--dur-fast` when the chapter changes), then the text button "Contents", then the link "Resume" (desktop and tablet only; downloads the PDF).
- **Hide and show.** Scrolling down more than 120px hides it (`translateY(-100%)`, `--dur-base`); any upward scroll of 8px or more, reaching the top, or keyboard focus inside it shows it. It stays hidden while the pinned timeline is being scrolled forwards.
- **On night.** While the night ground is under the bar, the bar switches to night ground, night-text and night-hairline. The switch is instant, not a transition.
- **Contents overlay.** Opens from "Contents". Full viewport, stone ground. The meridian is drawn in it at `--meridian-x` (a real 1.5px line) and the current chapter has a 7px dot on it. The twelve chapters (list in 2.3) are ruled rows in page order: title in Display (32px desktop, 28px phone, roman or italic as in 2.3), the chapter note right-aligned in `data` slate. Row height 56 (48 on phone). Below the list: the email address and "Download resume (PDF)". Opening: overlay opacity over `--dur-base`, rows rise 12px with 30ms stagger, the meridian draws with `scaleY` over 400ms. Closing: opacity over `--dur-fast`. It is a modal dialog: focus is trapped, Escape and the "Close" button (in the bar's place) dismiss it, page scroll is locked, focus returns to "Contents".
- **Anchors.** Choosing a row closes the overlay and scrolls to the chapter. With Lenis: duration `min(1.4s, 0.4s + distance / 6000px)`, `--ease-in-out`. On touch and with reduced motion: an instant jump. Every chapter has `scroll-margin-top: 24px`. The URL hash updates without adding history entries.
- Lenis runs only when `(pointer: fine)` and motion is allowed. Touch devices use native scrolling.

### 2.3 Chapters

Each chapter is a `<section id>` with an `h2`. Roman titles are the record; italic titles are interests.

| # | id | Title (h2) | Style | Chapter note (`data`) |
| --- | --- | --- | --- | --- |
| – | `top` | (hero, h1) | | |
| 1 | `about` | About | roman | |
| 2 | `academics` | Academic profile | roman | 2013 – present |
| 3 | `timeline` | Timeline | roman | 2013 – 2026 |
| 4 | `mun` | Model UN and public speaking | roman | 2023 – 2026 |
| 5 | `leadership` | Leadership and experience | roman | 2025 – 2026 |
| 6 | `competitions` | Competitions and projects | roman | 2018 – ongoing |
| 7 | `aviation` | Aviation | italic | |
| 8 | `motorsport` | Motorsport | italic | |
| 9 | `law` | Law | italic | |
| 10 | `quizzing` | Quizzing | italic | |
| 11 | `reading` | Reading | italic | |
| 12 | `contact` | Contact | roman | |

**Chapter title pattern.** `title` type, navy (night-text on night), starting at the content area's left edge, at most 10 columns wide. No label above it, no number, no rule. On desktop the chapter note, if any, sits in column 1 left of the meridian, right-aligned, its baseline on the title's first baseline; on tablet and phone it sits 12px above the title in the content column. Reveal: each line of the title rises from behind its own mask (`translateY(100%)` to 0, `--dur-title`, `--ease-out`, 80ms stagger) once, when the draw head reaches the title's top. Sub-headings (`h3`) use `title-2` and do not animate. Interest names that live inside a record chapter ("*Geopolitics*", "*Finance*", "*Tennis*") are italic `h3`s.

### 2.4 Data label

`data` type, slate (night-slate on night), sentence case. Used for: chapter notes, table column heads, years and ranks in tables, scale values and annotations on figures, counts, the placeholder label, "Ongoing". Never used for headings, navigation, body text or decoration, and never in the line colour. A label on a figure sits 8px clear of the line and never on top of it.

### 2.5 Ruled table

The pattern for every list of facts. There are no cards anywhere on the site.

- Full width of its columns. A 1px navy rule above the column heads, 1px hairline rules between rows and after the last row. No vertical rules, no zebra, no boxes.
- Column heads in `data`. Row padding 20px top and bottom (16 on phone).
- The row's subject (conference, competition, role, course) is set in `table-figure` (Display); supporting cells in `small`; years, ranks and counts in `data` navy with tabular numerals; long descriptions in `small` slate, at most 62 characters wide.
- A fixed trailing column, 136px wide, holds the logo tile (2.8) when the row has one; it is empty otherwise so text columns stay aligned. Omitted from tables where no row has a logo.
- Hover (fine pointers only): the row's ground cross-fades to sky in `--dur-fast`. Nothing moves.
- Values "Date not stated" and "Year not stated" from the content file are not printed; the cell is left empty.
- Phone: each row becomes two lines. Line 1: subject (`table-figure`) with the year right-aligned in `data`. Line 2: supporting cells in `small`. The logo tile sits at the right of line 2. It remains a `<table>` in the markup.
- Sortable tables (the awards record only): column heads are buttons with `aria-sort`; the active one is navy with a 1.5px navy underline and the word "ascending" or "descending" available to screen readers. Rows travel to their new places with a transform over `--dur-move`, `--ease-in-out`.

### 2.6 Placeholder block

For every `placeholder: true` value that this document says is shown.

- **Placeholder line (the default).** One row 44px high: the slot's name at the left (for example "Aviation") and "In Ahaan's words, to come" at the right, both `data` slate on one baseline, and a single hairline rule at the bottom of the row. Width: its column, at most the text measure. No blank rules beneath. On phone, if the two strings do not fit on one line the phrase drops to a second line, left-aligned; neither string wraps inside itself. Always a standalone row 32px below the block before it, never a row inside a list of resume facts. On night: night-slate and night-hairline.
- **Full block.** The same label line followed by three hairline rules 30px apart. Used once: "Biography and personal statement" in About.
- **Document form.** Paragraph 2 of the Law document (3.8): its number, the label, and six empty ruled lines.
- No box, no fill, no icon, no lorem ipsum. The `ph()` prompt text from the content file is not printed. When the value stops being a placeholder the block is replaced by the text in `body` (or as the section states).
- Not shown while placeholders: `hero.tagline`, `contact.prompt`, `social` and `socialNote`. They have no slot until filled. `hero.tagline`, when filled, appears under the descriptor in `lead` slate; `contact.prompt` above the email in `lead`; social links as text links in the footer.

### 2.7 Links and buttons

- **Inline link**: navy (night-text on night), 1px underline in the same colour 0.18em below the baseline. Hover: a 1.5px underline in the same colour wipes in from the left over it (`scaleX`, `--dur-base`). Links are never orange.
- **Text button** ("Contents", sort heads, filters, committee roll): `label` type, navy. Selected: 1.5px navy underline. Hover: the same underline wipes in. Hit area at least 44 × 44.
- **Primary button** ("Download resume (PDF)"): navy ground, stone text, `label` type at 16px, height 52, padding 0 28px, radius 0. Hover: a navy-hover layer fades in (`--dur-fast`).
- **Secondary button** ("Copy email address", "Visit Artha"): 1px navy border, navy text, no ground, same size. Hover: a sky layer fades in.
- No arrows or icons in link or button text. Lucide icons are not needed anywhere; do not add them.
- **Focus** (`:focus-visible`): 2px solid navy outline, 3px offset (night-text on night and on the placard). Never removed, never replaced by a colour change alone.
- A button says what it does and keeps its name: "Copy email address" becomes "Copied" for 2 seconds, announced through a polite live region.

### 2.8 Logos

Logos only say where something took place. They are used unmodified: original colours, no greyscale, no opacity, no recolouring, no blend modes, no cropping.

- **Tile.** White ground, 1px hairline border, radius 0, 8px padding. The logo inside is scaled to fit a box 120px wide by 32px high (`object-fit: contain`), so a tile is at most 136 × 48. Never displayed above its native pixel size divided by 2.
- **White-only logos** (`logoOnDark: true`, IIT Delhi): navy tile, no border, same sizes.
- **No logo**: no tile and no substitute. The organisation's name in text is the treatment; never initials in a box, never a drawn emblem. UN and government emblems are not used.
- **Where**: only in the trailing column of ruled tables and in the timeline detail panel. Never in the hero, in a figure, in the navigation, in the Night chapter or larger than the tile. The Wharton logo appears once, on the Wharton entry.
- Logos are decorative (`alt=""`) because the organisation's name is always printed beside them. They are not links.

Available now: `lotus-valley.jpg`, `srcc.png`, `iit-madras.png`, `iit-delhi-white.png`, `cbse.png`, `sof.jpg` (shows about 57px wide under the rule above), `wharton.svg`.

### 2.9 Footer

After the contact chapter, inside `<footer>`, above a hairline rule across the content area: three items in `small` slate on one row (stacked on phone). Left: "Ahaan Gupta, Gurugram" and the build year. Centre: "Logos belong to their owners and show where an event took place." Right: the text link "Back to top". Below, in `data`: "Set in Instrument Serif and Geist." Bottom padding 64. The line does not enter the footer.

## 3. Sections, in page order

Conventions. "Columns" are the desktop 12-column grid. Tablet uses the same order with two-part splits becoming 4 + 2 of its six columns, or stacking where stated. Figure coordinates are viewBox units with x = 0 on the meridian; a figure is listed as `W × H`. Coordinates are reference geometry: the engineer may refine curves, the composition and proportions are fixed, and the creative director reviews the rendered result. Editor-only fields are never printed: `needsConfirmation`, `confirmationNote`, `profileSource`, `otherCompetitionsNote`, `mun.summary.note`, `mun.summary.line`, competition `note`, and any stat `note` that mentions confirmation.

There are eight figures: timeline axis, globe, two fields, route, circuit, document, constellation and stack (the court was removed in review 1). Do not add a ninth.

### 3.0 Hero (`#top`)

- **Purpose.** His name, his face, and the line setting off. Nothing else.
- **Content.** `identity.name` split into two words; `hero.descriptor`; the portrait `public/images/portrait.webp` (`.jpg` fallback). No tagline, statement, statistics or index.
- **Desktop.** Height `100svh`, minimum 720, maximum 1000. The rule (the line's horizontal run) sits at 66% of the hero height. The `h1` sits on it: "Ahaan" above "*Gupta*", `name` type, left edge at column 3, the second baseline 0.3em above the rule. Descriptor in `lead` slate, column 3, 32px below the rule, at most 5 columns wide. Portrait in columns 9 to 12 (384 wide at 1440, never wider than 420), aspect 4:5, `object-fit: cover`, `object-position: 50% 15%`, square corners, no border, no filter; its top edge level with the top of the lowercase letters of "Ahaan", so the rule passes behind it at about two-thirds of its height.
- **The line.** Starts off-screen at the right viewport edge at the rule's height, runs left behind the portrait and under the name to meridian + 24, turns down with a 24px fillet onto the meridian and descends through the bottom of the hero.
- **Phone.** Bar 56. Name at `name` size from x = 44, first baseline about 150 from the top. Rule 0.3em under the second baseline, from the right edge to the meridian, then the turn. Descriptor in `body` slate 24px below the rule. Portrait 32px below that, from x = 56 to the right viewport edge (334 wide at 390), 4:5. The meridian runs down the left of both.
- **Tablet.** As desktop with the portrait in the last two of six columns plus the right margin (about 300 wide) and the name from x = 88.
- **Motion.** The entrance (section 5). Afterwards the portrait image drifts inside its frame by at most 40px across the hero's scroll (scale 1.06 inside an `overflow: hidden` frame so no edge shows). Fine pointers only.
- **Interaction.** None. The hero is still.

### 3.1 About (`#about`)

- **Purpose.** The resume's own profile sentence, and a marked place for his words.
- **Content.** `about.profile`; `hero.statement` and `about.biography` (placeholders, shown as one block); `skills`.
- **Desktop.** Title. Then `about.profile` in `statement` type across columns 3 to 10, with the `data` note "Profile, as written on the resume" 16px beneath. Then, 96 below: one placeholder block named "Biography and personal statement" in columns 3 to 8, and in columns 10 to 12 a four-row ruled list headed "Skills listed on the resume" (`small` navy rows, no subject serif).
- **Phone.** Same order, stacked.
- **Figure.** None. The meridian runs straight.
- **Interaction.** None.

### 3.2 Academic profile (`#academics`)

- **Purpose.** The academic record, led by one number.
- **Content.** `education` (all fields), `stats` for 99.4% and 96%+, `courses`, logos `cbse`, `lotusValley`, `iitMadras`.
- **Desktop.** Title. Row 1: "99.4%" in `numeral` type at column 3; beside it from column 8, baseline-aligned to the numeral's baseline, a three-row ruled list: the exam name with `gradeX.yearAsWritten` in brackets and the CBSE tile; "School Topper"; "50% School Merit Scholarship". Row 2: a ruled list across columns 3 to 12: institution and period (Lotus Valley tile); `education.current`; `education.consistency`; then `honours` items 1, 3 and 4. Row 3: the Scholar Badge marks (below). Row 4: `h3` "Courses and certifications" and a ruled table of the three `courses` (year, title as subject, provider, detail, logo).
- **Scholar Badge marks.** Not a figure; a mark on the meridian. Six ticks, each 16px wide, centred on and crossing the meridian, 40px apart, line colour. On desktop "2021" in `data` sits in column 1 beside the first tick; the second `honours` item is set in `body` in columns 3 to 8, vertically centred on the six ticks. On phone the ticks are 12px wide and the text sits in the content column beside them. Only the first tick is labelled.
- **Phone.** Numeral, its list, the ruled list, the marks, the courses table, stacked.
- **Motion.** The six ticks appear one by one (opacity, 60ms apart) as the draw head passes each.
- **Interaction.** Row hover only.

### 3.3 Timeline (`#timeline`)

Figure 1. Specified in full in section 4.

### 3.4 Model UN and public speaking (`#mun`)

- **Purpose.** The largest part of his record, and the geopolitics interest.
- **Content.** `stats` for 20+, 19+ and 16; `mun.executiveBoard`; `mun.awards` (16); `mun.parliamentary`; `interests` item `mun` (description placeholder); `iitDelhi` logo. Committees for the placard are the distinct `committee` values of `awards` and `executiveBoard`, in first-appearance order.
- **Desktop, in order.**
  1. Title, note "2023 – 2026".
  2. Summary row, columns 3 to 12: three figures in `title` type with `small` slate captions, separated by generous space, not rules or boxes: "20+" (conferences), "19+" (awards, with the stat's label saying it is the resume's own summary line), "16" (delegate awards listed below).
  3. The globe (figure 2) at the left with, in columns 7 to 12 beside it and top-aligned 96 below the globe's top: `h3` "*Geopolitics*", the placeholder block named "Model UN and geopolitics", then the placard and committee roll.
  4. `h3` "Executive Board" and a three-row ruled table: conference as subject, role, committee, year, logo column (IIT Delhi tile on navy).
  5. `h3` "Delegate awards": the tally strip, then the sortable record.
  6. `h3` "Parliamentary programmes": two-row ruled table (name, body or result, year).
- **Tally strip.** Four cells across columns 3 to 12, one per year 2023 to 2026, each a text button: the year in `data`, the count for that year in `title-2` (2, 5, 6, 3), and under it in `data` slate the running total ("2 in all", "7 in all", "13 in all", "16 in all"). Counts are computed from `mun.awards`. Choosing a year filters the record to that year; choosing it again clears the filter. Selected cell: 1.5px navy underline. This strip is where the cumulative series lives; it is not drawn as a chart.
- **The record.** Ruled table, columns 3 to 12: conference (subject; `conferenceFull` beneath in `small` slate where present), committee (`small`; `committeeFull` in brackets where present), award (`label`), year (`data`). Sortable by year (default, newest first, resume order within a year), award (order of the `AwardLevel` type) and committee (A to Z). When sorted, each group starts with a group row in `data` slate giving the group and its count from the data ("2026, 3 awards"; "Best Delegate, 6"; "UNGA, 4"). All 16 rows are always in the DOM.
- **Placard.** One flat rectangle, 5 columns wide and 200 high (full content width and 148 high on phone): navy ground, the committee's short name centred in Display roman, stone, 112px (72 on phone), and a 1px night-hairline rule 16px above its bottom edge to suggest the fold. No country name, no emblem, ever. Under it in `small` slate, from the data: the number of rows in the record for that committee, and any Executive Board role held in it. Under that the **committee roll**: the committee names as wrapping text buttons. Default selection: the committee with the most record rows. Choosing one changes the face (old name leaves upward, new name rises from below inside the placard's mask, `--dur-base`) and dims record rows from other committees to 35% opacity. Choosing it again clears the dimming.
- **Figure 2, the globe.** Desktop: a circle of radius 360 centred on the meridian at (0, 400) in a box 1110 × 800; its left half extends into the margin and is cut by the viewport edge (the chapter has `overflow-x: clip`). Hairline elements: the outline circle; eleven parallels as horizontal chords at latitudes ±15° to ±75° and the equator (y = 400 − 360 sin φ); eleven meridians at longitudes ±15° to ±75° and the limb, each a circle of radius 360 scaled in x by sin λ. The line does not bend: it is the globe's central meridian, running straight from (0, 0) to (0, 800). Labels in `data`, 10px right of the line where the parallels cross it: "60°N", "30°N", "0°", "30°S", "60°S". These are true graticule values and the only values on the figure. No borders, coastlines, points, arcs or place names. Phone: radius 250 centred at (0, 270) in a box 350 × 540, so only the right half shows; parallels and meridians every 30°; labels "30°N", "0°", "30°S".
- **Motion.** Hairline graticule fades in as the draw head enters; the line draws straight through (top to bottom).
- **Interaction.** The globe turns about its axis while the line stays still: each meridian's `scaleX` is recomputed as sin(λ + θ). Fine pointer: θ follows the pointer's x over the figure, ±20°, eased. Touch: θ follows scroll progress through the figure, ±12°. Reduced motion: θ = 0.
- **Phone order.** Title, summary figures (stacked), globe band, Geopolitics heading and placeholder, placard and roll, Executive Board, tally strip (2 × 2), sort buttons ("Sort by year, award, committee" as three text buttons), record, parliamentary programmes.

### 3.5 Leadership and experience (`#leadership`)

- **Purpose.** Positions held and work done, stated plainly.
- **Content.** `leadership` (4), `experience` (4), logos where the organisation has one.
- **Desktop.** Title, note "2025 – 2026". `h3` "Positions of responsibility" then `h3` "Experience and fellowships", each a ruled table across columns 3 to 12: period in `data` (columns 3 to 4), title as subject with the organisation beneath in `small` slate (columns 5 to 8), `points` as `small` paragraphs (columns 9 to 12, logo column inside). Print `points` as written in the content file.
- **Phone.** Two-line rows, then the points beneath each.
- **Figure.** None. **Interaction.** Row hover only.

### 3.6 Competitions and projects (`#competitions`)

- **Purpose.** Finance results, Artha as a case study, what is in progress, and the rest of the competition record.
- **Content.** `competitions`, `otherCompetitions`, `projects`, the `experience` item with `org: "srcc"`, `stats` for AIR 54 and 2,000 → 100, `interests` item `finance`, logos `srcc`, `sof`, `wharton`.
- **Desktop, in order.**
  1. Title, note "2018 – ongoing".
  2. `h3` "*Finance*", then figure 3 across the figure box.
  3. Finance results, ruled table, columns 3 to 12, four rows in this order: National Finance Olympiad 2025, round 1 ("All India Rank 10"); National Finance Olympiad 2025, nationals ("All India Rank 54 out of 10,000+ participants", "Certificate of National Excellence"); SRCC Finance Olympiad 2025 ("All India Rank 46"); SRCC FIC Finance Research Fellowship ("Selected from 2,000 candidates into a cohort of 100"). The rank or count is the row's `table-figure`. "Round 1" is always printed with rank 10.
  4. Placeholder block named "Finance and economics", columns 3 to 8.
  5. **Artha case study** (below).
  6. `h3` "In progress": the two `ongoing` competitions side by side (columns 3 to 7 and 8 to 12; stacked on phone), each: name in `title-2`, "Ongoing" in `data`, the result line in `body`, the Wharton tile on the Wharton entry, and one compact placeholder block ("Team, role, approach and status"; "Competition details"). The `projects` item `wharton` is not printed separately.
  7. `h3` "Further competitions": ruled table of the remaining six `competitions` (name as subject, year, results joined as sentences, logo).
  8. One paragraph in `small` slate, columns 3 to 10: "Also took part in" followed by the `otherCompetitions` names, comma separated. No claim of distinction.
- **Figure 3, two fields.** Desktop 1110 × 320. The line: (0, 0) down to (0, 76); fillet right onto y = 100; right to (1050, 100); a semicircle of radius 60 clockwise to (1050, 220); left along y = 220 with one step (below) to (24, 220); fillet down onto the meridian; down to (0, 320). Each run is a linear scale from x = 90 (first place) to x = 1050 (the size of the field), 960 long.
  - Upper run, National Finance Olympiad 2025 nationals, scale 1 to 10,000: a 7px dot on the line at x = 95 (rank 54 is 0.54% of the way along).
  - Lower run, the fellowship, scale 1 to 2,000: between x = 90 and x = 138 (the first 5%, 100 of 2,000) the line is raised 28px, to y = 192, with square corners; a sky rectangle fills the space under the raised part down to y = 220.
  - Hairline: a 10px tick below each run at every tenth of the scale, and a 16px tick at x = 90 and x = 1050.
  - Labels. Above the upper run: "54" in `title-2` at x = 90, baseline 20 above the line; beside it in `data` "All India Rank 54, nationals"; at the right end, right-aligned to x = 1050, "10,000+ participants"; under the run at x = 90 in `label`, "National Finance Olympiad 2025". The lower run the same way: "100", "cohort of 100", "2,000 candidates", "SRCC FIC Finance Research Fellowship". Real values: 54, 10,000+, 100, 2,000. Nothing else is plotted; round 1 (rank 10) and the SRCC Olympiad (rank 46) have no stated field size and so appear only in the table.
  - Wipe: left to right for the first half of progress (upper run), right to left for the second (lower run), each in its own clip.
  - Phone 350 × 300: same hairpin, runs at y = 90 and y = 210, scale from x = 28 to x = 326, semicircle radius 60, raised part 15 wide and 20 high, dot at x = 30. Field sizes sit under the right end; no tenth ticks.
- **Interaction (figure 3).** Fine pointer: over a run, a 24px hairline crosshair follows the pointer and a `data` readout gives the place on that scale under it ("5,000th of 10,000+", "1,000th of 2,000"); within 12px of the mark it snaps and reads "54th of 10,000+" or "100 of 2,000". Touch: tapping a run places the crosshair. It shows how much of each line lies behind the mark.
- **Artha case study.** `h3` "Artha" in `title` size (the one `h3` at that size). Columns 3 to 7: `siteDescriptor.text` in `lead`, with the `data` note "From the Artha site's own description"; the five `siteDescriptor.sections` as a ruled list; the placeholder block named "Artha"; the secondary button "Visit Artha" (opens `projects[artha].url` in a new tab, `rel="noopener"`). Columns 8 to 12 and out to the right viewport edge: `artha-home.webp` at its 16:10 ratio with a 1px hairline border, no browser chrome, no shadow, no tilt; the right part is cut by the viewport edge. Overlapping its lower left corner by 64px, `artha-home-mobile.webp` at 220 wide, cropped to 9:16 from the top, hairline border, stone 8px surround. Alt text describes the screenshots factually ("Home page of the Artha finance website, desktop view"). Phone: text, then the desktop screenshot at full content width, then the phone screenshot at 180 wide, right-aligned, overlapping it by 48.
- **Motion.** The desktop screenshot drifts up to 40px against scroll (fine pointers). The phone screenshot does not move.

### 3.7 Night: Aviation (`#aviation`) and Motorsport (`#motorsport`)

One night ground holds both chapters. Entering and leaving it is specified in section 5.2. All text is night-text or night-slate, rules night-hairline, the line `line-night`. No logos on night.

**Aviation**

- **Content.** `interests` item `aviation`: `evidence` and the description placeholder.
- **Layout.** Title (italic). Figure 4 across the figure box. Beneath: the evidence as a ruled list in columns 3 to 8 headed in `data` "From the resume"; the placeholder block named "Aviation" in columns 9 to 12. Phone: stacked.
- **Figure 4, the route.** Desktop 1110 × 640. The line: `M 0 0 L 0 60 C 0 180 120 250 260 250 L 430 250 C 540 250 600 130 700 130 L 900 130`; then one circuit of a holding pattern, `A 45 45 0 0 1 900 220 L 700 220 A 45 45 0 0 1 700 130 L 960 130`; then `C 1040 130 1070 200 1070 290 L 1070 360 C 1070 470 980 520 860 520 L 150 520 C 60 520 0 560 0 640`. Secondary, night-hairline 1px: three range rings of radius 110, 220 and 330 centred on (560, 330), clipped to the figure box, with a 5px station circle at the centre; four unfilled waypoint triangles (10px) on the line at (330, 250), (700, 130), (700, 520) and (430, 520); short cross-ticks every 40px on the final run between x = 150 and x = 400. A heading tape along the top edge from x = 200 to x = 1110: a tick every 26px (10°), labelled every third tick in `data` night-slate as a compass reads: N, 03, 06, E, 12, 15, S, 21, 24, W, 30, 33. No place names, no flight numbers, no distances, no altitudes. The compass marks are the only values and are a scale, not data.
- **Phone 350 × 520.** `M 0 0 L 0 40 C 0 120 60 160 140 160 L 280 160 A 32 32 0 0 1 280 224 L 190 224 A 32 32 0 0 1 190 160 L 290 160 C 335 160 340 220 340 280 L 340 330 C 340 400 290 430 220 430 L 90 430 C 40 430 0 460 0 520`. Two rings (90, 170) centred on (180, 290), three waypoints, tape from x = 60 with labels every 90° (N, E, S, W).
- **Motion.** Wipe left to right for the first 60% of progress, then the return run right to left. Rings fade in first.
- **Interaction.** The heading tape slides. Fine pointer: its x offset follows the pointer across the figure, ±130px. Touch: it follows scroll progress.

**Motorsport**

- **Content.** `interests` item `motorsport`: no evidence, so only the placeholder (and the stated-interest line if the content file supplies one, section 9).
- **Layout.** Title (italic). Figure 5. Placeholder block named "Formula 1 and motorsport" in columns 3 to 8.
- **Figure 5, the circuit.** Desktop 1110 × 580. An invented circuit; it must not resemble any real one, and carries no name. Track band, night-hairline, 14px stroke, closed: `M 150 120 L 150 380 C 150 430 180 450 230 450 L 430 450 C 480 450 500 420 490 380 C 480 340 510 310 560 320 C 620 332 640 400 710 420 C 800 446 920 440 980 390 C 1040 340 1060 270 1040 200 C 1022 138 960 110 900 126 C 850 140 840 190 790 196 C 730 204 715 140 660 116 C 600 90 520 60 430 60 L 210 60 C 170 60 150 80 150 120 Z`. The line: leaves the meridian `M 0 0 L 0 40 C 0 120 150 80 150 170`, runs the whole closed loop once along the band's centre line starting down the left straight, comes down the left straight a second time and leaves `M 150 330 C 150 430 0 400 0 500 L 0 580` (the straight is covered twice; that is the lap beginning and ending). Marks in night-text 1px: a start line across the band at (150, 250) and three sector ticks across the band at roughly one-third intervals of the lap, labelled in `data` night-slate "Sector 1", "Sector 2", "Sector 3". Below the circuit from y = 500 to y = 560, between x = 230 and x = 1050: a telemetry trace in night-slate 1px over three night-hairline horizontals, high where the lap is straight and dipping at each corner, divided by the same three sector ticks. It has no axis, no units and no values.
- **Phone 350 × 420.** The same loop simplified to six corners inside x 60 to 330, y 50 to 290, the left straight at x = 60; trace beneath from y = 330 to y = 390.
- **Motion.** Band and trace fade in; the line wipes left to right.
- **Interaction.** A 7px dot runs the lap. Fine pointer: the dot's position on the lap follows the pointer's x across the figure, and a hairline cursor on the trace keeps step with it. Touch: tap the circuit to run one lap in 6s (linear), tap again to stop. The dot is moved with `transform` from points sampled along the path. With reduced motion the dot rests on the start line and moves only under the pointer.

### 3.8 Law (`#law`)

- **Purpose.** The page becomes a document, and the meridian is revealed as its margin rule.
- **Content.** `interests` item `law`: `evidence` and the description placeholder.
- **Figure 6, the document (typographic, no SVG).** After the title (italic), a block 640 or more high in which, on desktop, text starts at column 2, 24px right of the meridian: this is the only place text sits close to the line. Hairline rules run from the meridian to column 9 every 33px (the `document` line height) behind the text, like ruled paper. At the top, centred between the meridian and column 9, in `document` type: "Introduction to Law" and beneath it in `data` "IIT Madras Certification, 2026" (from `courses`). Then numbered paragraphs in `document` type, navy, at most 7 columns wide, with the paragraph number in `data` slate in column 1, left of the line, right-aligned to meridian − 12: paragraph 1 is the evidence text; paragraph 2 is the description, shown while a placeholder as its number, the words "In Ahaan's words, to come" in `data`, and the ruled lines left empty beneath. In columns 10 to 12, level with paragraph 1, a side note in `data` slate: "Source: resume".
- **Phone.** The meridian at x = 20 is the margin rule; text starts at x = 44; paragraph numbers hang inside the text column in `data`; rules run to the right margin; the side note follows paragraph 1.
- **Motion.** The hairline rules fade in together as the draw head enters. Nothing else.
- **Interaction.** None. A document does not react.

### 3.9 Quizzing (`#quizzing`)

- **Purpose.** The interests shown as connected subjects, with one question on each.
- **Content.** `interests` item `quizzing` (evidence, placeholder); `quiz.questions` (requested in section 9).
- **Layout.** Title (italic). Evidence as a ruled list, columns 3 to 9, headed "From the resume". Figure 7 across the figure box. The question panel in columns 3 to 9. The placeholder block named "Quizzing and general knowledge" in columns 3 to 8.
- **Figure 7, the constellation.** Desktop 1110 × 440. Seven nodes, joined in order by straight runs of the line: General knowledge (150, 110), Finance (320, 290), Aviation (500, 100), Law (670, 310), Motorsport (840, 120), Geopolitics (1000, 300), Reading (860, 400). The line: (0, 0) down to (0, 40), a curve to the first node, the six straight runs, then from Reading left along y = 400 to (24, 400), fillet down, to (0, 440). Each node is a 9px ring on the line. Labels: the subject's name in `small` slate, 14px above its node (below for the low nodes). Secondary: none. Phone 350 × 280: nodes at (50, 70), (100, 170), (150, 60), (200, 180), (250, 70), (310, 170), (250, 240); return along y = 240; only the current node is labelled.
- **Question panel.** `data` line: the subject and "Question 2 of 6". The question in `title-2`. Four options as a ruled list of full-width buttons (`body`, 56px rows, a letter A to D in `data`). After a choice: the chosen row is marked with "Your answer" in `data`; the correct row gets a navy 1.5px left rule and "Correct answer"; one sentence of explanation and the source as an inline link appear beneath; the button "Next question" appears. No red or green, no score celebration, no timer. After the last question: "6 questions, n correct" in `title-2` and the text button "Start again".
- **Motion.** The line is drawn through all nodes by scroll like any figure (wipe left to right, then the return run right to left), whatever the quiz state. The quiz state is carried by a 7px dot: it rests on General knowledge at first, and each "Next question" (and the first answer) moves it along the line to the next subject's node in `--dur-move`. The current node's label turns navy.
- **Interaction.** The quiz itself: tap or click, or keyboard (options are buttons in order; the result is announced through a polite live region). Nodes are not clickable.

### 3.10 Reading, and tennis (`#reading`)

- **Purpose.** Let the reader feel the size of 400 by scrolling past it.
- **Content.** `stats` for 400+; `interests` items `reading` (evidence, placeholder) and `tennis` (placeholder only).
- **Figure 8, the stack and the court.** The stack: 400 horizontal marks standing against the meridian on its right, navy, 1px, one every 3px down the page, in eight groups of 50 separated by 12px; lengths vary between 28 and 92px by a fixed pseudo-random sequence (same every build). The line runs straight down the meridian beside them. At the end of each group, in `data` slate at x = 104: the running count "50", "100" … "400". Total height about 1,290. Only the count is real; lengths mean nothing and no mark is a particular book. Phone: marks every 2px, lengths 20 to 64, group gap 8, counts at x = 76, about 860 high.
  The court: 96 below the stack the line turns right with a square corner, runs 234, turns down 108, turns left 234 back to the meridian (square corners: these three sides are the far baseline and two sidelines of a court in plan, 78 : 36) and continues down. Hairline inside: the net at mid-length, the two service lines, the centre service line and the two singles sidelines. Phone: 195 × 90.
- **Layout.** Desktop: beside the stack, in columns 3 to 9, a block that stays in view while the stack scrolls past (`position: sticky; top: 20vh`): title (italic), "400+" in `numeral` type, the evidence sentence in `body`, the placeholder block named "Reading". Beside the court, in columns 6 to 10: `h3` "*Tennis*" and a compact placeholder block named "Tennis". Phone: title, numeral and sentence above the band; inside the band a sticky `title-2` "400+" at the right; placeholder after it; court band; Tennis heading and placeholder.
- **Motion.** The stack is revealed top to bottom by the draw head. The court is wiped clockwise in three straight pieces (`scaleX`, `scaleY`, `scaleX`).
- **Interaction.** None beyond the scroll itself.

### 3.11 Contact (`#contact`)

- **Purpose.** One address, one download, and the end of the line.
- **Content.** `contact.email`, `contact.resumeFile`, `contact.referencesLine`.
- **Desktop.** Title. 96 below, the email address as a `mailto:` link in `email` type, navy, at column 3. The line leaves the meridian 0.22em below the email's baseline with a fillet, runs right under the address and stops with a 7px dot at the address's right edge. This is its end. Below, 64: the primary button "Download resume (PDF)" (`download` attribute, `/Ahaan-Gupta-Resume.pdf`) and the secondary button "Copy email address". Below, 32: `contact.referencesLine` in `small` slate. No form, no phone number, no social icons.
- **Phone.** Same, buttons stacked at full content width.
- **Motion.** The underline draws left to right with the scroll; the dot appears (opacity) when it arrives.
- **Interaction.** Hovering or focusing the address moves the end dot 6px to the right and back (`--dur-base`).

## 4. The achievement timeline (figure 1)

**Data.** `site.timeline`, 24 dated events from 2013 to 2026, in file order, grouped by `year`. `yearLabel` replaces the year where present. After the last event comes an "In progress" block listing the `competitions` with `ongoing: true` (name and "Ongoing"); they are not placed on the axis because they have no end date. All geometry is computed from the data, never hard-coded.

**Filters.** Text buttons: All (default), Academics (`school`, `academic`, `course`), MUN and debate (`mun`, `parliament`), Competitions (`finance`, `quiz`), Leadership and work (`leadership`, `internship`). One at a time.

### 4.1 Horizontal version

Used only when all of these hold: width 1100 or more, `(pointer: fine)`, viewport height 680 or more, motion allowed. Otherwise the vertical version (4.2).

- **Stage.** The chapter pins for a scroll distance of L ÷ 1.5 (L below) with a stage 100vh high. Fixed in the stage: the title "Timeline" at column 3, 96 from the top; the filters right-aligned in columns 8 to 12 on the title's baseline; the detail panel. Moving in the stage: the track.
- **The line in the stage.** The camera follows the line. The track holds an entry stub (the meridian from the top of the stage down to the axis), a 24px fillet, the axis running right for length L, a 24px fillet and an exit stub down to the bottom of the stage. At progress 0 the entry stub is at `--meridian-x`; the track moves left by p × L; at progress 1 the exit stub is at `--meridian-x`. So the line is continuous with the page's meridian when the pin starts and when it ends, and it remains one path: down, along the years, down.
- **Axis.** At 46% of the stage height. Along it, from the entry fillet: a 160 lead-in; then one bay per year from the first to the last year in the data; then a 160 tail. A year with n events is 64 + 88n wide. A run of consecutive years with no events is a single 48-wide bay holding an axis-break mark (two short parallel hairline strokes at 60° across the line). With the present data L is about 3,020 and the pin about 2,015.
- **Year marks.** At the start of each year's bay with events: a 16px tick across the axis in the line colour and the year in `data` navy, 10px above the axis and 6px right of the tick.
- **Entries.** Event i of a year sits at 64 + 88i from the year tick. Entries alternate above and below the axis through the whole sequence. Each is a 9px ring on the axis, a 40px navy 1px stem, and a label at the stem's end: `yearLabel` in `data` slate if present, then the title in `label` type, navy, at most 160 wide and three lines. Each entry is a button.
- **Spans.** For "Scholar Badge" (2021 onwards): a ring sits on the year tick of each year from 2021 to 2026, six in all. For "SOF International English Olympiad" (2018 – 2024): a 1px slate rule 10px below the axis from the 2018 tick to the 2024 tick with 6px end ticks.
- **Selection.** A reading mark is fixed 224 right of the meridian (where the first entry rests at progress 0). The entry nearest the mark that matches the filter is selected: its ring becomes a filled 7px dot, its title turns line-ink, its stem thickens to 1.5px. Hovering does nothing; clicking an entry scrolls the page so that entry rests on the mark.
- **Detail panel.** Columns 3 to 10, from 62% of the stage height. For the selected entry: year or `yearLabel` in `data`; title in `title-2`; `detail` in `body`, at most 62 characters wide; the category's filter name in `data` slate; the logo tile if the event names an organisation. For "Scholar Badge" a row of six rings, evenly spaced 24px apart, sits under the title. Content cross-fades in `--dur-fast`. `aria-live="polite"`.
- **In progress.** In the track, starting 114 right of the exit stub and level with the detail panel's top: `h3` "In progress" in `title-2` and the two ongoing competitions in `body` with "Ongoing" in `data`. It is what stands beside the line as it turns to go on.
- **Scroll.** Track position is tied to scroll (linear). The opening frame shows 2013 to 2024, sparse, and the scroll then passes through the crowded years; that change in density is the point of the figure.
- **Drag.** Pressing and dragging the track horizontally scrolls the page by the drag distance ÷ 1.5 in the opposite sense (`cursor: grab`, `grabbing`). A movement under 4px is a click. No inertia beyond Lenis.
- **Keyboard.** The entries form one tab stop (roving tabindex). Left and Right arrows select the previous and next matching entry and scroll it to the mark (300ms); Home and End go to the first and last. Tab leaves the timeline to the filters or onward. The focus outline is drawn around the entry's label.
- **Filtering.** Non-matching entries drop to 25% opacity and are skipped by selection and keys. Nothing reflows and the scroll length does not change.
- **Drawing.** As the stage approaches the pin (stage top from 40vh to 0), the fillet and axis wipe in left to right across the visible width, and entries fade in as the wipe passes them. Year ticks and entries beyond the first screen are simply present.

### 4.2 Vertical version

Phones, tablets, touch devices, short viewports and reduced motion. No pin.

- The meridian is the axis. Title, then the filters as a wrapping row of text buttons.
- Each year with events is a group: a 12px tick across the meridian and the year in `data` navy at the content edge. Under it, its events: a 9px ring on the meridian level with the title's first line; the title in `label` type as the summary of a disclosure (`<details>`), row at least 48 high; `yearLabel` in `data` slate before it; opened, the `detail` in `small` slate and the logo tile. Opening is instant with a `--dur-fast` opacity on the revealed text. The open entry's ring is a filled dot. Years without events are not marked.
- "Scholar Badge" carries its six rings inline, 16px apart, under its title, always visible.
- Filtering hides non-matching events (`hidden`); a year with none left is hidden too.
- "In progress" follows as a final group with no tick.
- On desktop with reduced motion this version is used with events in columns 3 to 9.

## 5. Sequences

### 5.1 Entrance (desktop; about 2.1s)

Start when fonts are ready (`document.fonts.ready`, or after 1,200ms at most). Scrolling is never blocked; if the visitor scrolls or presses a key during the sequence, it completes within 200ms.

| At | What happens | Duration, easing |
| --- | --- | --- |
| 0ms | Stone page. Name, portrait, descriptor and bar are in their start states (hidden); layout is final so nothing shifts | |
| 100ms | The line enters from the right viewport edge and wipes left along the rule to the turn | 900ms, `--ease-in-out` |
| 450ms | "Ahaan" rises from behind its mask | 800ms, `--ease-out` |
| 570ms | "*Gupta*" rises | 800ms, `--ease-out` |
| 700ms | The portrait fades in while the image settles from scale 1.12 to 1.06 inside its fixed, opaque stone frame (it rests at 1.06 so parallax never shows an edge), covering the line where it passes behind | 900ms, `--ease-out` |
| 1000ms | The line rounds the fillet and descends the meridian to 96px above the hero's bottom edge (`scaleY`) | 600ms, `--ease-in-out` |
| 1300ms | The descriptor fades in (opacity only) | 500ms, `--ease-out` |
| 1600ms | A 7px dot appears at the line's tip (scale 0 to 1) | 200ms, `--ease-out` |
| 1700ms | The bar's right-hand items fade in | 300ms, `--ease-out` |
| 2100ms | Finished. From the first scroll the dot fades out and the line follows the draw head |

Phone: the same order and timings; the line wipes from the right edge to the meridian (700ms), the portrait fades in below at 700ms, the descent runs beside it. The sequence plays once per page load and not again when returning to the top.

### 5.2 Night transition

The night ground is a layer behind the two Night chapters that extends 50vh below the Motorsport chapter's end.

- **Entering.** The Night block starts with 240 of empty top padding. As its top edge travels from the bottom of the viewport to 40% of the viewport height, the night ground wipes across from the meridian side to the right (`scaleX` from 0 to 1, `transform-origin: left`, linear with scroll). The line arrives at the edge as the wipe completes and is `line-night` below it. Nothing in the chapter is visible before the ground is complete.
- **Leaving.** The Law chapter has its own stone ground layer covering the 50vh overlap; it wipes across the night the same way, left to right, as the Law chapter's top travels from the bottom of the viewport to 40%.
- Both wipes obey "drawn stays drawn". The bar switches theme when the night ground passes under it. With reduced motion, on touch devices below 768, or without JavaScript, both edges are plain horizontal edges that scroll with the page.

## 6. Motion rules

### 6.1 Reduced motion (`prefers-reduced-motion: reduce`)

- No entrance: the hero is complete on load.
- The line and every figure are fully drawn on load. No draw head, no wipes, no label fades, no title rises.
- No parallax, no Lenis, no pin: the timeline is the vertical version.
- No Night wipe, no placard slide (the face swaps with a `--dur-fast` opacity), no row travel in the record (rows swap with a `--dur-fast` opacity), no travelling quiz dot (it appears on the next node), no auto-run lap.
- Pointer-following stays where the visitor is directly moving something: the finance crosshair and the circuit dot. The globe and the heading tape stay still.
- Hover and focus states remain as `--dur-fast` opacity changes. Nothing is hidden behind an animation in any mode.

### 6.2 Touch

- Native scrolling; no Lenis, no drag-to-pan, no pinning. Nothing ever captures a vertical swipe. Figures set `touch-action: pan-y`.
- Hover effects are wrapped in `@media (hover: hover)`. Every hover effect has a touch equivalent or is unnecessary: pointer-following becomes scroll-linked (globe, heading tape) or tap (finance crosshair, circuit lap).
- Tap targets are at least 44 × 44 with at least 8 between adjacent targets.
- Phone figures are the simpler drawings given in section 3; none sits beside body text except the Reading stack with its sticky numeral.

### 6.3 Performance

- Animate only `transform` and `opacity`. Never animate or transition: width, height, top, left, margin, padding, `clip-path`, `stroke-dashoffset`, SVG geometry attributes, colour, background colour, border, `filter`, `letter-spacing` or font size. Theme changes (bar on night, selected label colour) are instant.
- Never animate: body text, tables, lists, the placeholder blocks, logos, the footer.
- One pinned section on the page: the timeline.
- Figures mount their SVG when within 1.5 viewports of the screen. Each figure's box is reserved by `aspect-ratio` from its viewBox, so mounting moves nothing. Pointer listeners attach only while a figure is on screen.
- The portrait is the LCP image: `fetchpriority="high"`, explicit `width` and `height`, not lazy. Its displayed width never exceeds 420 CSS px. Artha screenshots are `loading="lazy"` with explicit dimensions; serve a 1,440-wide copy below 1100.
- `will-change` is set only while an element is animating. Scroll work runs in one `requestAnimationFrame` loop (GSAP's ticker). No layout reads inside it beyond values cached on resize.
- Use GSAP with ScrollTrigger for everything tied to scroll and for the entrance; use Motion for component state (overlay, panel cross-fades, row reorder). Do not drive the same element from both.
- No horizontal overflow at any width; chapters with bleeding figures use `overflow-x: clip`.

## 7. Accessibility

- **Landmarks.** A skip link ("Skip to content") first in the DOM, visible on focus. `<header>` holds the bar (`<nav aria-label="Chapters">`). `<main>` holds the hero and the twelve chapters, each a `<section aria-labelledby>`. `<footer>` last. The overlay is `role="dialog"`, `aria-modal="true"`, labelled "Contents". `<html lang="en-IN">`.
- **Headings.** One `h1`: the name. Each chapter title is an `h2`; Aviation and Motorsport are `h2`s inside the Night block. Blocks inside chapters are `h3` (including "*Geopolitics*", "*Finance*", "Artha", "*Tennis*"). No level is skipped and no heading is used for size alone.
- **Portrait.** `alt` from the content file; until supplied: "Portrait of Ahaan Gupta". It may state only what is visible (outdoors, navy blazer), never character.
- **Figures.** The drawing is decorative: `aria-hidden="true"`, no `title`. Any figure that carries data has that data as real text nearby, readable without the drawing: the finance figure by the finance results table, the stack by the "400+" sentence, the timeline by its entries (which are the text), the globe's degrees are scale only. Interactive figures expose their controls as real buttons (timeline entries, quiz options, committee roll); the circuit lap, globe and heading tape are pointer embellishments with no information and need no keyboard equivalent.
- **Focus.** Visible on every interactive element (2.7), in DOM order that matches reading order. The pinned timeline scrolls the focused entry into the stage. Opening the overlay moves focus into it; closing returns it.
- **Contrast.** All text at least 4.5:1: navy and slate on stone or sky, line-ink on stone, night-text and night-slate on night, stone on navy. The line colour (3.6:1) is never text, never a text underline and never the only carrier of a state: selection is always also shown by weight, fill or text.
- **Not by colour alone.** Quiz results are stated in words. Filter and sort states have underlines and `aria-pressed` or `aria-sort`.
- **Tables** are real tables with `<th scope="col">`; the phone layout is CSS only.
- **Zoom.** The page works at 200% zoom and at 320 CSS px wide with no horizontal scrolling; `name` type may then wrap to one word per line, which it already does.

## 8. Do not, and how the work will be judged

### 8.1 Do not

1. Do not add cards, tiles, pills, chips, badges, rounded corners, shadows, gradients, blur, glass, noise textures or background imagery.
2. Do not use the line colour for anything but the line and marks on it: no orange text, links, buttons, underlines, icons or hover states. The single exception is `line-ink` on the title of the selected entry on the horizontal timeline, which names a mark on the line.
3. Do not let the line branch, cross text, or miss the meridian by even a pixel at any width.
4. Do not animate `stroke-dashoffset`, `clip-path` or layout properties, and do not fade or slide body text, tables or lists into view.
5. Do not add a ninth figure, a statistics band, an "interests" grid, a skills meter, icons, a typed tagline, a scroll cue, a cursor follower, a preloader or a dark-mode toggle.
6. Do not set labels in capitals, add eyebrow labels over headings, number the chapters, join facts with middle dots, or put arrows in links.
7. Do not write copy. If a string is not in the content file or in section 9, ask. Do not print `ph()` prompt text, editor notes or "not stated" values.
8. Do not upgrade a fact: "round 1" stays with rank 10, "19+" stays the resume's summary beside a table of 16, "+" qualifiers stay.
9. Do not put a country on the placard, borders or places on the globe, airports on the route, or a real circuit's outline in the Motorsport figure. Do not label any schematic element with a value.
10. Do not recolour, grey, crop or enlarge a logo, invent one where none exists, or place one outside a table's logo column or the timeline panel.
11. Do not show the portrait wider than 420 CSS px on desktop or tablet, or filter, tint, mask or duplicate it.
12. Do not wrap the Artha screenshots in device or browser frames.
13. Do not hide content until JavaScript runs: with scripts off and with reduced motion the whole page is readable and fully drawn.
14. Do not copy any layout, interaction or asset from aaravjuneja.in.

### 8.2 Acceptance checklist for screenshot review

Checked at 1440, 834 and 390, and again with reduced motion.

1. The line is unbroken from the hero rule to the dot under the email; every figure meets the meridian at entry and exit; the colour changes exactly at the Night edges.
2. The meridian is at 210, 40 and 20 px; text starts at 324, 88 and 44 px; nothing but figures, chapter notes, date notes (Leadership periods, Reading counts) and the Law text enters the margin.
3. The line colour appears nowhere except the line and its marks; `line-ink` appears only on the selected timeline title. Links are navy.
4. The hero holds only name, portrait, descriptor and line; the name is the largest thing on the page; the portrait is sharp.
5. Type: Instrument Serif renders (no fallback serif, no faux bold or italic); roman and italic titles follow 2.3; no capitals in labels; measures at or under 62 characters; no orphaned single words in titles.
6. Tables are ruled, aligned and legible at 390; the awards record shows 16 rows; counts in the tally strip and group rows match the data.
7. Every figure reads as a drawing, not a diagram placeholder: curves smooth, labels clear of the line, secondary elements quiet. Phone drawings are simpler, not shrunken.
8. Finance figure shows exactly four real values and no MUN data. Globe has no borders. Route and circuit carry no names or numbers except the compass and sector labels.
9. Placeholders are labelled, never lorem ipsum, never prompt text; the three-rule block appears once (About), every other slot is the single placeholder line or the Law document form; hidden slots stay hidden.
10. Whitespace: chapter gaps as specified; no two figures crowd each other; no section looks like a template (cards, icon rows, centred hero).
11. Night is one continuous dark chapter with readable text, entered and left once.
12. Timeline: horizontal on desktop with the selected entry and panel in step; vertical elsewhere with all 24 events reachable.
13. Navigation: bar states, overlay, current chapter mark, anchor targets land with the title in view.
14. Reduced motion: everything present and drawn on load; no pinned section.
15. Focus outlines visible on every control; no horizontal scroll; no console errors.

## 9. Content needed in `src/content/site.ts`

Requests to the content researcher. The engineer does not write these strings.

1. **`quiz.questions`: six questions**, one for each of finance and economics, aviation, law, motorsport, geopolitics and international institutions, and books. Shape: `{ id, subject (interest id), question, options: [4 strings], answerIndex, explanation (one sentence), source: { label, url } }`. Each must be a settled, checkable general-knowledge fact from an authoritative source; nothing that can go out of date (no current champions or record holders without a date), nothing about disputed borders or live political controversy, nothing about Ahaan, no trick wording, moderate difficulty.
2. **`identity.portrait`** should be `/images/portrait.webp`; add `identity.portraitAlt`.
3. **Stats**: give each stat an `id` (`gradeX`, `consistency`, `conferences`, `awardsSummary`, `delegateAwards`, `nfo`, `fellowship`, `books`) and move editor caveats out of `note` into `editorNote`.
4. **Timeline**: an optional `org` on events that have a logo; a category for SHISFEST Vision To Venture that maps to Competitions (it is `academic` now).
5. **Interests**: an optional `statedLine` for interests with no evidence (Formula 1, tennis), worded only from the resume, for example that it is listed under interests there. Without it those chapters show the placeholder alone.
6. **Interface strings** (add under `site.ui` so all words stay in one file): chapter titles and notes (2.3); "Contents", "Close", "Resume", "Skip to content", "Back to top"; "In Ahaan's words, to come" and the slot names; "Profile, as written on the resume"; "Skills listed on the resume"; "From the resume"; "Source: resume"; "From the Artha site's own description"; "Visit Artha"; "Download resume (PDF)"; "Copy email address", "Copied"; "In progress", "Ongoing"; "Also took part in"; the `h3` headings named in section 3; filter and sort names (section 4, 3.4); quiz strings (3.9); figure labels (3.6, 3.7); footer lines (2.9).

## 10. Open items

- The figure paths in section 3 are reference geometry that has not yet been rendered. Expect amendments after the creative director reviews the Meridian board and the first build screenshots.
- Client decisions still open (none block the build): what "19+" counts, the Grade X year, the biography and interest lines, Wharton and GITAM details, whether tennis keeps its court.
