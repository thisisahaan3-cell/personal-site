// Model credits. The site footer renders this list as a credit line at the very bottom of the website.
//
// To add an entry: whenever a Sketchfab model licensed CC BY 4.0 is put on the site, append one object below
// (title and author exactly as shown on the Sketchfab page, the page URL, the licence, and where on the site it
// is used). CC0 models need no credit but may be listed too. Keep the list in step with
// `content/research/assets.md`, section "Sketchfab models". Remove an entry when its model is removed or
// replaced by the client's own file.

export type Credit = {
  title: string;
  author: string;
  source: "Sketchfab";
  url: string;
  licence: "CC BY 4.0" | "CC0";
  usedOn: string;
};

export const credits: Credit[] = [
  {
    title: "B737-800 Model",
    author: "hakai315",
    source: "Sketchfab",
    url: "https://sketchfab.com/3d-models/b737-800-model-6cbe380405794ea69d6b0a3d144dd1af",
    licence: "CC BY 4.0",
    usedOn: "Aviation (public/models/airliner.glb)",
  },
  {
    title: "1967 Ferrari 312",
    author: "Dave Love SketchFab",
    source: "Sketchfab",
    url: "https://sketchfab.com/3d-models/1967-ferrari-312-105683345dbb441a8b28b71b713f2110",
    licence: "CC BY 4.0",
    usedOn: "Formula 1 (public/models/formula-car.glb)",
  },
  {
    title: "Tennis Racket Wilson Blade",
    author: "Murizn",
    source: "Sketchfab",
    url: "https://sketchfab.com/3d-models/tennis-racket-wilson-blade-599589f98217465f960310104b7aa474",
    licence: "CC BY 4.0",
    usedOn: "Tennis (public/models/tennis-racket.glb)",
  },
  {
    title: "Tennis Ball",
    author: "Tentrox",
    source: "Sketchfab",
    url: "https://sketchfab.com/3d-models/tennis-ball-edc344dcc65440ea97b5eae84f1957a4",
    licence: "CC BY 4.0",
    usedOn: "Tennis (public/models/tennis-ball.glb)",
  },
  {
    title: "Desk Microphone Model",
    author: "PatrickZ",
    source: "Sketchfab",
    url: "https://sketchfab.com/3d-models/desk-microphone-model-6ae84970d6a845d580bc2cd9f4c9d6ca",
    licence: "CC BY 4.0",
    usedOn: "Law & Diplomacy (public/models/microphone.glb)",
  },
  {
    title: "gavel",
    author: "rutesh sakpal",
    source: "Sketchfab",
    url: "https://sketchfab.com/3d-models/gavel-44581bee0a5749989dc474fe35b9dc1e",
    licence: "CC BY 4.0",
    usedOn: "Law & Diplomacy (public/models/gavel.glb)",
  },
];
