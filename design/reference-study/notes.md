# Reference study: aaravjuneja.in (16 Nov 2026)

Studied in a real browser with `scripts/study-reference.mjs` (all pages, timed frames, scripts, media, running animations). Screenshots are not committed. Philosophy only; nothing is to be copied.

## Structure
- Five separate pages with a persistent, numbered top nav: Home, Finance + AI, Photo + Film, Leadership, Contact (plus Privacy, Terms). A custom Vite single-page app.
- Home is ONE screen (about 1028px tall, no scrolling): portrait, name, a rotating "I build ___" line, a numbered index linking to the pages.
- Each page has its own palette and one large set piece.

## Set pieces and how they are made
- Finance + AI: cream page with slowly rotating rays; a photographed retro computer with a looping MP4 on its screen; "scroll to enter the terminal" → blackout → a fake Bloomberg-style terminal (running ticker, candlestick chart, grid, scanlines). Tech: one MP4, CSS keyframes (`finance-rays-rotate`, `finance-scanlines-drift`, `finance-ticker-scroll`), scroll-triggered state changes.
- Photo + Film: dark page, very large serif title, an interactive 3D camera (drag to rotate, click for shutter, Spin / Closer / Reset buttons), then galleries (35 images) and a film. Tech: Three.js loaded only here, a GLB model with Draco compression.
- Leadership: huge capital headings beside looping muted video clips of real events; role progression as ruled lists.
- Contact: light page, a stack of cards flicked through with arrows; drifting background colour.
- Everywhere: Lenis smooth scroll, a custom cursor, film-grain overlay, reveal-on-scroll, hover states on every row.

## What makes it feel rich
1. Separate pages, each a small "world", reached by buttons — not one long scroll.
2. One memorable interactive or moving object per page.
3. Real media supplied by the owner: photos, video clips, a 3D model.
4. Palette changes between pages; very large type; constant small motion (ticker, grain, rays).

## Implications for Ahaan's site
- All of this is achievable with Next.js + CSS + GSAP + Three.js.
- Media is the constraint: we have one portrait and Artha screenshots. Set pieces must be generated (WebGL, canvas, SVG, CSS) or use Artha itself; slots should exist for photos and clips he may send later.
