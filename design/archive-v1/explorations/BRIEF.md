# Brief for the visual explorer: three direction boards

From the creative director, 15 Nov 2026. Read `design/directions.md` first; it holds the full specification of each direction (type, palette, layout, interest treatments). This brief says what the boards must show so the three can be compared fairly.

## What to make

Three static HTML boards, one per direction, each a single tall page 1440px wide.

| File | Direction | Screenshot |
| --- | --- | --- |
| `design/explorations/01-almanac.html` | A: Almanac | `shots/01-almanac.png` |
| `design/explorations/02-placard.html` | B: Placard | `shots/02-placard.png` |
| `design/explorations/03-meridian.html` | C: Meridian | `shots/03-meridian.png` |

Capture each as a full-page screenshot. `capture.mjs` currently shoots the 1440x900 viewport only; add a full-page option to it. Also capture each board's hero panel at 390 wide (see panel 2).

Meridian is the recommended direction and will be built. Give all three equal care anyway: the client will be shown the comparison.

## The same five panels on every board, in this order

Each panel has a small label at the top left (panel number and name) so the boards can be read side by side. Use the direction's own type and palette exactly as given in `directions.md`.

**Panel 1. Hero at 1440 x 900.** The real hero composition as described for that direction: his name, the portrait, the one line of school text ("Grade 11 (Commerce), Lotus Valley International School, Gurugram"), and whatever else that direction's hero contains. Use `source-material/portrait-original.webp` by relative path, uncropped beyond the stated ratio, with no filters or colour treatment.

**Panel 2. Hero at 390 x 844.** The same hero as a phone frame, drawn at true size inside the board (a plain 390px-wide box with a hairline border, no device chrome).

**Panel 3. Palette and type specimen.** Every colour token as a flat swatch with its name, hex value and role. Then the type scale: the name, one chapter title, one paragraph of body at reading size, one data label, and the numerals 0 to 9 with `%`, `+`, `·` and an en dash in the display and data faces. For body copy use this resume sentence and nothing invented: "Self-driven 16-year-old student with a track record of competing and winning at the national level across finance, diplomacy, parliamentary debate and academics."

**Panel 4. The awards record.** The first eight rows of the delegate awards table from `content/research/facts.md` (section 5), set as that direction would set them, with columns for conference, committee, award and year. Same eight rows on all three boards. This is the fairest test of how each direction handles his real data.

**Panel 5. Three interest motif studies.** The same three interests on every board, each about 1200 x 600, in that direction's language:

1. **Finance.** A: the broadsheet rank table and the 100-from-2,000 dot matrix. B: the ranking board. C: the line as a stepped chart of cumulative delegate awards (2, 7, 13, 16 for 2023 to 2026) with the three competition results beside it.
2. **Aviation.** A: the approach-chart plate. B: the departures board carrying four real rows from his record. C: the schematic route on the Night ground with range rings and a heading tape.
3. **MUN and geopolitics.** A: the graticule plate with the committee roll. B: the Cobalt placard. C: the line as a meridian on a graticule, with one placard below.

For Meridian only, add a thin sixth strip showing the line passing through three consecutive sections at the meridian position, to prove continuity.

## Facts and rules

- Use only figures from `content/research/facts.md`, with their qualifiers. "AIR 10" always carries "round 1". Finance results: National Finance Olympiad 2025, AIR 10 (round 1) and AIR 54 of 10,000+ (nationals); SRCC Finance Olympiad 2025, AIR 46; SRCC FIC fellowship, 100 chosen from 2,000.
- Anything that is not his data is schematic: no axis values, no tickers, no times, no place names.
- No country names on placards; use committee names (UNGA, UNSC, UNHRC, ECOSOC, WHO, UNESCO).
- No national borders on any map. Graticule, arcs and unlabelled points only.
- No named airports, no route between real places, no real circuit outline.
- Drop the Delhi coordinates used in board 00.
- Placeholder text appears once per board, in the direction's placeholder style, labelled as a placeholder. No lorem ipsum.
- No logos on these boards.
- Fonts from Google Fonts only, as listed per direction. Report any that fail to load.
- Square corners. No shadows, gradients or blur.
- Static only: no animation. Where motion matters, show the end state.

## What to report back

For each board: the screenshot path, which fonts loaded, any overflow, and one or two sentences on where the direction was hard to make work (for example a glyph missing from Instrument Serif, or a table that would not fit the board grid). Do not rank the directions; that is the creative director's call.
