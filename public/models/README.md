# Models in this folder

Most files here are CC0 models from Poly Haven; the six Sketchfab models (listed at the end) are CC BY 4.0 and must be credited (see `src/content/credits.ts`) (https://polyhaven.com), downloaded at 1k and optimised into a single GLB (WebP textures up to 1024 px, meshopt compression) by `scripts/fetch-polyhaven.mjs`. They need a meshopt decoder when loaded in three.js. Dimensions are in metres: see `content/research/assets.md`, section "3D models and HDRIs", which also lists author, triangle count and size for each.

| File | Poly Haven asset | Page |
|---|---|---|
| `marble-bust-01.glb` | Marble Bust 01 (`marble_bust_01`), by Rico Cilliers | https://polyhaven.com/a/marble_bust_01 |
| `bull-head.glb` | Bull Head (`bull_head`), by Tina | https://polyhaven.com/a/bull_head |
| `metal-office-desk.glb` | Metal Office Desk (`metal_office_desk`), by Ulan Cabanilla | https://polyhaven.com/a/metal_office_desk |
| `school-desk-01.glb` | School Desk 01 (`SchoolDesk_01`), by Ethan Place | https://polyhaven.com/a/SchoolDesk_01 |
| `school-chair-01.glb` | School Chair 01 (`SchoolChair_01`), by Ethan Place | https://polyhaven.com/a/SchoolChair_01 |
| `wooden-table-02.glb` | Wooden Table 02 (`WoodenTable_02`), by Fran Calvente | https://polyhaven.com/a/WoodenTable_02 |
| `dining-table.glb` | Dining Table (`dining_table`), by Aron Łyczek | https://polyhaven.com/a/dining_table |
| `modern-arm-chair-01.glb` | Modern Arm Chair 01 (`modern_arm_chair_01`), by Vibrant Nordic | https://polyhaven.com/a/modern_arm_chair_01 |
| `dining-chair-02.glb` | Dining Chair 02 (`dining_chair_02`), by James Ray Cock | https://polyhaven.com/a/dining_chair_02 |
| `book-encyclopedia-set-01.glb` | Book Encyclopedia Set 01 (`book_encyclopedia_set_01`), by John Malcolm | https://polyhaven.com/a/book_encyclopedia_set_01 |
| `wooden-bookshelf-worn.glb` | Wooden Bookshelf Worn (`wooden_bookshelf_worn`), by Ulan Cabanilla | https://polyhaven.com/a/wooden_bookshelf_worn |
| `classic-laptop.glb` | Classic Laptop (`classic_laptop`), by Arrangemonk | https://polyhaven.com/a/classic_laptop |
| `desk-lamp-arm-01.glb` | Desk Lamp Arm 01 (`desk_lamp_arm_01`), by Yann Kervran, Kuutti Siitonen | https://polyhaven.com/a/desk_lamp_arm_01 |
| `chess-set.glb` | Chess Set (`chess_set`), by Riley Queen | https://polyhaven.com/a/chess_set |
| `round-spectacles.glb` | Round Spectacles (`round_spectacles`), by Sean Buckley | https://polyhaven.com/a/round_spectacles |
| `binder-notebook.glb` | Binder Notebook (`binder_notebook`), by DaDrood | https://polyhaven.com/a/binder_notebook |
| `clipboard.glb` | Clipboard (`clipboard`), by ProgrammerOnCoffee | https://polyhaven.com/a/clipboard |
| `postcard-set-01.glb` | Postcard Set 01 (`postcard_set_01`), by James Ray Cock, Jurita Burger | https://polyhaven.com/a/postcard_set_01 |
| `standing-picture-frame-02.glb` | Standing Picture Frame 02 (`standing_picture_frame_02`), by James Ray Cock | https://polyhaven.com/a/standing_picture_frame_02 |
| `fancy-picture-frame-01.glb` | Fancy Picture Frame 01 (`fancy_picture_frame_01`), by Rob Tuytel, Rico Cilliers | https://polyhaven.com/a/fancy_picture_frame_01 |
| `camera-01.glb` | Camera 01 (`Camera_01`), by Rajil Jose Macatangay | https://polyhaven.com/a/Camera_01 |
| `vintage-grandfather-clock-01.glb` | Vintage Grandfather Clock 01 (`vintage_grandfather_clock_01`), by Yann Kervran, James Ray Cock | https://polyhaven.com/a/vintage_grandfather_clock_01 |

## Sketchfab models (CC BY 4.0, credited in the site footer)

Fetched by `scripts/fetch-sketchfab.mjs` (needs `SKETCHFAB_TOKEN` in the environment), rescaled to real metres, 2048 px WebP textures, meshopt. Up is +Y. Details and orientation: `content/research/assets.md`, section "Sketchfab models".

| File | Title, author | Size (W x H x D, m) | Orientation |
|---|---|---|---|
| `airliner.glb` | B737-800 Model, hakai315 | 31.2 x 13.4 x 39.5 | nose +Z, tail -Z, origin near the wing root |
| `formula-car.glb` | 1967 Ferrari 312, Dave Love SketchFab | 1.77 x 0.86 x 4.03 | nose +Z, centred |
| `tennis-racket.glb` | Tennis Racket Wilson Blade, Murizn | 0.685 x 0.047 x 0.266 | flat, handle -X, head +X |
| `tennis-ball.glb` | Tennis Ball, Tentrox | 0.067 across | centred |
| `microphone.glb` | Desk Microphone Model, PatrickZ | 0.21 x 0.20 x 0.35 | base -Z, capsule +Z |
| `gavel.glb` | gavel, rutesh sakpal | 0.11 x 0.135 x 0.33 | handle along Z, block at -Z |

HDRI lighting files live in `public/hdri/` (also Poly Haven, CC0): `studio.hdr`, `interior-warm.hdr`, `hall.hdr`, `dusk-sky.hdr`.

## Replacing a model with your own

Save your own GLB under the **same file name** (for example `marble-bust-01.glb`) and it replaces the stock one with no code change. Keep it under about 1.5 MB (compress with `npx @gltf-transform/cli optimize in.glb out.glb --texture-compress webp --texture-size 1024 --compress meshopt`), and scale it to real-world metres. If your model is a different size, tell the engineer so the scene is re-framed.
