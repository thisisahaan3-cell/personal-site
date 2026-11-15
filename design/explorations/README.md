# Explorations

Static reference boards for the creative director. Nothing here is production code and no direction is final.

## Boards

| Board | Screenshot | What it tests |
| --- | --- | --- |
| `00-type-specimens.html` | `shots/00-type-specimens.png` | Three display + text + mono pairings on a warm paper ground. Superseded by boards 01 to 03. Its Delhi coordinates label is not a resume fact and is dropped from the later boards. |
| `01-almanac.html` | `shots/01-almanac.png` | Direction A, compact. Hero at 1440 x 900 (name in Fraunces, tipped-in portrait as Plate I, one-row contents line with dot leaders, Panel strip with three real figures). Palette and type. One interest study: the Model UN graticule plate (Mollweide oval, great-circle arcs, committee roll, placeholder as a "Memoranda" block). |
| `02-placard.html` | `shots/02-placard.png` | Direction B, compact. Hero at 1440 x 900 (name in condensed capitals, portrait sharing GUPTA's baseline, split-flap board row on its first of three faces). Palette and type. One interest study: the Cobalt placard at full width, the twelve committees as slots, six rows of the awards table as a black board with the placeholder as its last row. |
| `03-meridian.html` | `shots/03-meridian.png`, `shots/03-meridian-hero-390.png` | Direction C, full board. Seven panels: (1) hero at 1440 x 900; (2) hero at 390 x 844; (3) palette and type; (4) the awards record, rows 1 to 8; (5) three interest studies: finance as a stepped series of cumulative delegate awards (2, 7, 13, 16) with the finance results and the Artha screenshot, aviation as a schematic route on Night, Model UN as a graticule with one placard; (6) continuity strip across three sections; (7) the other three shapes: motorsport circuit and trace, law as a case document on the margin rule, and the 400-tick shelf with the tennis corner and the end of the line under the email address. |

Boards 01 and 02 are compact by instruction (usage was tight): they do not carry the 390 hero, the awards record, or the finance and aviation studies that `BRIEF.md` lists. Board 03 carries everything in the brief plus three extra figures.

## Capture

```bash
node design/explorations/capture.mjs <board.html>                    # 1440x900 viewport
node design/explorations/capture.mjs --full <board.html>             # whole page, 1440 wide, DPR 1
node design/explorations/capture.mjs --full --slices <board.html>    # also 1440x1600 pieces in shots/slices/
node design/explorations/gen/crop.mjs <board.html> <out.png> <selector> [index]   # one element, e.g. ".frame" 2
```

`capture.mjs` prints which fonts loaded, failed requests, horizontal overflow, broken images and text wider than its box. All three boards: fonts loaded, no overflow, no broken images.

## How the boards are made

The HTML files are static and self-contained (inline CSS and SVG, Google Fonts by `<link>`, no script). Their geometry is computed by small generators in `gen/` so that a figure can be redrawn without hand-editing path data:

- `gen/lib.mjs`: rounded polylines (straight legs joined by tangent arcs), orthographic and Mollweide graticules, great-circle arcs, a seeded random source, and the shared facts (first eight award rows, committees, the two fixed sentences).
- `gen/a.mjs`, `gen/b.mjs`, `gen/c.mjs`: one per board. `node design/explorations/gen/c.mjs` rewrites `03-meridian.html`.
- `gen/measure.mjs`: prints the font metrics used to place the hero type.

Edit the generator, not the HTML, or the next regeneration will overwrite the change.

## Decisions taken on board 03 that the creative director should check

1. **How the line gets back to the meridian.** A series that rises to the right ends top right, and the meridian is bottom left. The boards use one rule throughout: the line leaves the meridian to the right, takes its shape, and comes back along a lower level, hidden behind an image where there is one. Hero: behind the portrait both ways, with the turn showing in the right margin. Finance: the last step runs on and dives behind the Artha screenshot, then re-emerges from its left edge. Shelf: two rows of 200 with a turn in the right margin. Circuit: in by a merge onto the start straight, out by a pit-lane turn that becomes the trace.
2. **Portrait size in the hero.** Columns 9 to 12, 384 px, 4:5, top on the x-height of "Ahaan". At that size it ends at about 730 px, so it does not run past a 900 px fold as `directions.md` describes. Making it larger conflicts with the note in `PROGRESS.md` to keep the 797 px source under about 420 px.
3. **A small navigation row** (Record, Projects, Contact, Resume) is drawn at the top right of the hero. `directions.md` rules out an index and a tagline but gives Geist the navigation role.
4. **Night hairlines.** Range rings and the heading tape use two dark blues that are not in the palette (`#1B2940`, `#3A4960`), because Hairline `#D9D8D2` is too bright on Night. The globe's limb and the court lines use `#B9BBB9`, a step darker than Hairline. These need tokens.
5. **Heading tape without numerals.** It carries ticks and W, NW, N, NE, E only, so that no heading value is implied.
6. **Graticule.** The globe is centred on the meridian and bleeds off the left edge, so the line is its central meridian without bending.
7. **Tennis and contact are one figure.** The square corner is the corner of the court and its horizontal leg is the underline of the email address, where the line ends.
8. **Portrait path.** The boards use `public/images/portrait.webp` as the orchestrator instructed; `BRIEF.md` names `source-material/portrait-original.webp`.

## Notes on the other two boards

- Almanac: Fraunces at optical size 144 is too thin below about 40 px (the plus sign nearly disappears), so the committee roll, the 28 px table figures and the placeholder use the automatic optical size at weight 400.
- Placard: at the stated width 75, a 300 px cap height makes AHAAN about 960 px wide, which collides with a three-column portrait. The board uses 392 px type (cap height about 263 px) so that AHAAN stops one gutter short of the portrait, and the portrait spans both rows with its foot on GUPTA's baseline.

## Copy rules followed

No country names, no borders, no named airports or real circuits. "AIR 10" always carries "round 1". "19+ awards" appears only as the resume's own summary beside the 16 rows. Placeholders are marked once per board in the direction's own style. Every drawn value is from `content/research/facts.md`; everything else is schematic.
