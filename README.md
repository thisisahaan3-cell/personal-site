# Ahaan Gupta — personal site

Live: https://ahaan-gupta.netlify.app

A cinematic portfolio for Ahaan Gupta (Grade 11 Commerce, Lotus Valley International School, Gurugram). Home is one screen: his face drawn by a wall of market candles, with buttons to six pages. Each page has its own colour and one interactive 3D set piece.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Opens on http://localhost:3000. Before shipping, also run:

```bash
npm run lint
```

```bash
npm run build
```

`npm run build` writes a static site to `out/`. Netlify builds the same thing (`netlify.toml`). To deploy from a Claude session, see "Deploy" in `PROGRESS.md` (`scripts/deploy.sh`).

Stack: Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS v4 plus one large stylesheet, three.js for the 3D, GSAP and Lenis for scroll, Motion for small animations.

## Where things are

| You want to change | Go to |
| --- | --- |
| Any words, facts, links, figures | `src/content/site.ts` (the only content file; every page reads from it) |
| Model credits shown in the footer | `src/content/credits.ts` |
| His photos, clips, models | `public/` (see `MEDIA.md` for every slot and exactly how to swap files) |
| The colours and layout of a page | `src/app/globals.css` (sections are headed per page) |
| A page's structure | `src/app/<page>/page.tsx` |
| A page's 3D scene | `src/components/<page>/*Scene.ts` |

### Folder map

```
src/
  app/                 one folder per page (finance, law-diplomacy, academics, leadership, interests, contact)
                       layout.tsx = fonts, <head>, shell; globals.css = all styling
  content/site.ts      ALL copy and facts. Placeholders are marked ph("...") / placeholder: true
  components/
    home/              the candle-wall intro (raw WebGL2)
    finance/ mun/ academics/ leadership/ interests/ contact/
                       each page's sections; *Scene.ts files build its three.js scene
                       ("mun" is the Law & Diplomacy page; the old /model-un URL redirects)
    three/             the shared 3D engine: one renderer per page (engine.ts), scene hook
                       (useScene.ts), loading readout, hotspots, small helpers (kit.ts)
    shell/             navigation bar and menu, page transitions, footer credits, background preloading
  lib/
    pages.ts           the page list and the figure each Home button shows
    three/assets.ts    every model and HDRI file the scenes use
    three/quality.ts   decides per device: full 3D, still frame, or flat (no WebGL / reduced motion)
public/
  models/  hdri/       3D models (.glb) and lighting (.hdr); sources in public/models/README.md
  media/  images/      video loops and photos; logos/ for official organisation logos
  Ahaan-Gupta-Resume.pdf   the public resume (phone number removed)
content/research/      facts.md (every fact and where it came from), assets.md (licence of every file)
design/                v2-direction.md + v2.1-addendum.md = current design; archive-v1/ = rejected first version
scripts/               deploy.sh, screenshot.mjs (capture pages at 3 widths), asset fetchers, agent.sh
qa/                    screenshots/ (git-ignored captures); archive/ = old one-off test scripts and reports
```

### How the 3D works (short)

- Each page has one transparent full-screen canvas (`three/Stage3D.tsx`) and one engine (`three/engine.ts`). Scenes register a "view" tied to a DOM box and are drawn only into that box, only when something moves.
- Scene files are loaded with a dynamic `import()`, so three.js never delays the first paint.
- Every page falls back cleanly: reduced motion gets a still frame, no WebGL or a failed model load gets a designed DOM version with the same information.
- `shell/Prefetch.tsx` gets the other pages ready in the background as soon as the site opens. On computers it downloads and unpacks every model. On phones it only downloads them.

## Rules that matter

- Never invent or upgrade a fact. Every fact in `site.ts` has a source in `content/research/facts.md` (his resume or his own messages).
- The phone number is never published. Public contact: thisisahaan@gmail.com.
- Logos are official and unmodified. Stock media is atmosphere only, never captioned as him, and recorded in `content/research/assets.md`.
- `source-material/` holds the original resume (with phone number) and is git-ignored: never commit it.

## Other docs

- `MEDIA.md`: where his own photos, clips and models go.
- `PROGRESS.md`: build history, checklist, deploy steps.
- `CLAUDE.md`: the full client brief and working rules for Claude agents (`.claude/agents/`).
