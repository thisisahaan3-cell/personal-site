# Your photos, clips, models and words: where they go

Everything you can replace lives in two places:

- **Files** go in `public/` (images and clips in `public/media/`, 3D models in `public/models/`, lighting in `public/hdri/`).
- **Words, links and which file a slot uses** are in one file: `src/content/site.ts`.

Nothing else needs to change. After editing, rebuild and deploy (last section).

## Every replaceable slot

"Stock" means a free-to-use clip or picture that is atmosphere only; it is never captioned as you. Sources and licences are in `content/research/assets.md`.

| Slot | Where it shows | Key in `site.ts` | File now | Filled by |
|---|---|---|---|---|
| Portrait | Contact (in the picture frame on the desk) | `identity.portrait` | `public/images/portrait.webp` | your own |
| Home face | Home intro (the candle wall) | none (made from the portrait) | `public/images/portrait-matte.webp`, `portrait-tone.webp`, `portrait-candles.webp` | your own (derived) |
| Resume | Board, Contact | `contact.resumeFile` | `public/Ahaan-Gupta-Resume.pdf` | your own (phone number removed) |
| m1 | Home background | `media.m1` | `public/media/m1-home.mp4` + `.jpg` | stock |
| m2 | Finance opening | `media.m2` | `public/media/m2-finance.mp4` + `.jpg` | stock |
| m3 | Law & Diplomacy opening | `media.m3` | none (`pending: true`) | empty |
| m4 | Law & Diplomacy chamber | `media.m4` | `public/media/m4-chamber.webp` | stock |
| m5 | Academics sky | `media.m5` | `public/media/m5-clouds.mp4` + `.jpg` | stock |
| m6 | Academics aircraft | `media.m6` | `public/media/m6-aircraft.mp4` + `.jpg` | stock |
| m7 | Academics columns | `media.m7` | `public/media/m7-colonnade.webp` | stock |
| m8 | Leadership window light | `media.m8` | `public/media/m8-canopy.mp4` + `.jpg` | stock |
| m9 | not shown at present (Contact is now the desk scene) | `media.m9` | `public/media/m9-library.webp` | stock |
| Your Finance photo or clip | Finance, after the desk | `mediaSlots.finance` | none | empty |
| Your Law & Diplomacy photo or clip | Law & Diplomacy | `mediaSlots.modelUn` | none | empty |
| Your Leadership photo or clip | Leadership & Work Experience | `mediaSlots.leadership` | none | empty |
| Aviation photos 1 to 6 | Interests, the cabin windows | `interestsPage.items` (aviation) `gallery` | none (section hidden until the first photo is added) | empty |
| 3D models | Finance, Law & Diplomacy, Academics, Interests, Contact | `src/lib/three/assets.ts` | `public/models/*.glb` (list in `public/models/README.md`) | stock (Poly Haven CC0, Sketchfab CC BY) |
| Lighting | every 3D scene | `src/lib/three/assets.ts` | `public/hdri/*.hdr` | stock (Poly Haven CC0) |
| Logos | timeline and results | `organisations` | `public/logos/` | official files |

## Photos

- Format: JPG or WebP. At least 1600 px on the long side for full-width slots, 1200 px for the aviation windows (they are portrait-shaped, about 3:4, and cropped to fill). Keep each under about 600 kB.
- **Aviation photos:** put them in `public/media/aviation/` (for example `photo-1.jpg`). In `site.ts`, find `id: "aviation"` and fill one `gallery` line:
  `{ src: "/media/aviation/photo-1.jpg", alt: "What the photo shows", caption: "Where and when" },`
  Empty slots are not shown; the gallery appears once at least one photo is filled in.
- **Page photo slots:** put the file in `public/media/`, then in `mediaSlots` set `src` (for example `"/media/finance-me.jpg"`), `alt`, and `aspect` (for example `"3 / 2"`). Nothing shows while `src` is empty.
- **Portrait:** save your new photo as `public/images/portrait.webp` (same name) and update `identity.portraitAlt`. The Home face is drawn from three files made from the portrait; those need re-making by the engineer if the portrait changes.
- `alt` and `caption` describe only what is really in the picture.

## Video clips

- Format: MP4 (H.264), no sound, 1920 x 1080 or smaller, 6 to 15 seconds that loop cleanly, under about 6 MB. Add a JPG poster: the first frame, same size.
- **To replace a stock clip:** save your clip under the **same file name** (for example `public/media/m2-finance.mp4` and `m2-finance.jpg`), then set `stock: false` for that key in `media`. Or use a new name and change `src` and `poster` there.
- To fill `m3` (empty now): add the files, set `src`/`poster`, and delete `pending: true`.
- For a clip in a `mediaSlots` slot, set `kind: "loop"`, `src` and `poster`.

## 3D models

- Format: GLB, in real-world metres, Y up, under about 1.5 MB. Compress with
  `npx @gltf-transform/cli optimize in.glb out.glb --texture-compress webp --texture-size 1024 --compress meshopt`
- **To replace a model:** save yours in `public/models/` under the **same file name** (for example `airliner.glb`). The scene places models by their size, so a similar object lands in the right spot; a very different size may need re-framing by the engineer.
- If you remove a Sketchfab model, also remove its credit from `src/content/credits.ts`. If you add one that is CC BY, add a credit there (the footer lists it).

## Words and links

- All text is in `src/content/site.ts`. Change text between the quote marks; keep commas and brackets.
- Placeholders are written `ph("...")`; replace with `t("Your sentence.")`.
- Contact links: `contact.links` (Email, Resume, LinkedIn, Instagram). Put an address in `url`; a link with `placeholder: true` or an empty `url` shows "To come".
- Interface words (buttons, headings) are under `ui`.
- Never add the phone number.

## Rebuild and deploy

```bash
npm install        # once
npm run dev        # preview at http://localhost:3000 while editing
npm run lint
npm run build      # writes the finished site to out/
```

Deploy: the site is a Netlify project that runs `npm run build` and publishes `out/` (see `netlify.toml`). Push your changes to the connected branch, or drag the `out/` folder onto the project's Deploys page in Netlify.
