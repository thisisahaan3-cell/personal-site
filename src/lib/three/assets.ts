/**
 * ──────────────────────────────────────────────────────────────────────────
 *  3D ASSETS — the one place that says which model or lighting file a scene uses.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * To swap a model: put your GLB in /public/models/ and change the path here (or save it under
 * the same file name). Keep it in metres, under about 1.5 MB, meshopt-compressed:
 *   npx @gltf-transform/cli optimize in.glb out.glb --texture-compress webp --texture-size 1024 --compress meshopt
 * Each scene places its models by their bounding box, so a replacement of a similar shape
 * lands in the right place; a very different size may need the `scale` in that scene's file.
 *
 * Every file listed here is CC0 from Poly Haven; sources are in content/research/assets.md.
 * Only the files a page's scenes ask for are downloaded on that page.
 */
export const MODELS = {
  // Finance
  bullHead: "/models/bull-head.glb",
  laptop: "/models/classic-laptop.glb",
  deskLamp: "/models/desk-lamp-arm-01.glb",
  diningTable: "/models/dining-table.glb",
  // Law & Diplomacy
  schoolDesk: "/models/school-desk-01.glb",
  schoolChair: "/models/school-chair-01.glb",
  armChair: "/models/modern-arm-chair-01.glb",
  diningChair: "/models/dining-chair-02.glb",
  bookshelf: "/models/wooden-bookshelf-worn.glb",
  encyclopedia: "/models/book-encyclopedia-set-01.glb",
  bust: "/models/marble-bust-01.glb",
  binder: "/models/binder-notebook.glb",
} as const;

/** Image-based lighting (1k Radiance .hdr). Used for reflections only; the background is the page ground. */
export const HDRI = {
  /** "Formal hall": Finance and Law & Diplomacy. */
  hall: "/hdri/hall.hdr",
  studio: "/hdri/studio.hdr",
  warmInterior: "/hdri/interior-warm.hdr",
  duskSky: "/hdri/dusk-sky.hdr",
} as const;

/** Approximate download size of each file in kB, for the loading readout. */
export const SIZE_KB: Record<string, number> = {
  "/models/bull-head.glb": 284,
  "/models/classic-laptop.glb": 335,
  "/models/desk-lamp-arm-01.glb": 490,
  "/models/dining-table.glb": 362,
  "/models/school-desk-01.glb": 129,
  "/models/school-chair-01.glb": 207,
  "/models/modern-arm-chair-01.glb": 308,
  "/models/dining-chair-02.glb": 259,
  "/models/wooden-bookshelf-worn.glb": 552,
  "/models/book-encyclopedia-set-01.glb": 555,
  "/models/marble-bust-01.glb": 344,
  "/models/binder-notebook.glb": 232,
  "/hdri/hall.hdr": 1631,
};

export type ModelKey = keyof typeof MODELS;
